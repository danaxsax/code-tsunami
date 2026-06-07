import 'dotenv/config'
import serverless from 'serverless-http'
import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const profilesDir = path.resolve(__dirname, '..', 'agente-tuali', 'Casos Principales')

const ELEVENLABS_AGENT_ID = process.env.ELEVENLABS_AGENT_ID || process.env.VITE_ELEVENLABS_AGENT_ID || ''

const app = express()
app.use(express.json({ limit: '1mb' }))

const profileFiles = {
  '1_0012Eplus18': '1_0012Eplus18.json',
  '1_00004Eplus18': '1_00004Eplus18.json',
  '3_87064Eplus17': '3_87064Eplus17.json',
  ocasional_sample: 'ocasional_sample.json',
  volumen_sample: 'volumen_sample.json',
}

const clusterVoiceAliases = {
  VIP: ['VIP'],
  NICHO: ['NICHO'],
  OCASIONAL: ['OCASIONAL'],
  VOLUMEN: ['VOLUMEN', 'VOLUMEN_BAJO', 'BAJO_VOLUMEN'],
  RECURRENTE: ['RECURRENTE', 'CLIENTE_ALTAMENTE_RECURRENTE', 'ALTAMENTE_RECURRENTE'],
}

function normalizeText(value = '') {
  return String(value)
    .replaceAll('Diversificación', 'Diversificacion')
    .replaceAll('DiversificaciÃ³n', 'Diversificacion')
    .replaceAll('Activación', 'Activacion')
    .replaceAll('ActivaciÃ³n', 'Activacion')
    .replaceAll('México', 'Mexico')
    .replaceAll('MÃ©xico', 'Mexico')
    .replaceAll('Perú', 'Peru')
    .replaceAll('PerÃº', 'Peru')
    .replaceAll('Sábado', 'Sabado')
    .replaceAll('SÃ¡bado', 'Sabado')
    .replaceAll('dÃ­as', 'dias')
    .replaceAll('categorÃ­a', 'categoria')
}

function envSuffix(value = '') {
  return normalizeText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function normalizeDeep(value) {
  if (Array.isArray(value)) return value.map(normalizeDeep)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalizeDeep(item)]))
  }
  return typeof value === 'string' ? normalizeText(value) : value
}

function loadProfile(profileId) {
  const fileName = profileFiles[profileId] || profileFiles['1_0012Eplus18']
  const raw = fs.readFileSync(path.join(profilesDir, fileName), 'utf8')
  return normalizeDeep(JSON.parse(raw))
}

function systemPrompt(profile, metaState) {
  return `
Eres el agente de crecimiento de Tuali para tiendas de abarrotes.
Tu trabajo es ayudar al cliente a cumplir metas de negocio con acciones simples, medibles y concretas.

Reglas:
- Responde siempre en espanol.
- Se breve: maximo 3 oraciones.
- Habla como asesor practico, no como bot generico.
- Conecta la respuesta con una meta del perfil.
- Si sugieres una accion, incluye el impacto esperado cuando sea posible.
- No inventes datos fuera del perfil; si falta informacion, da una recomendacion razonable.

Perfil del cliente:
${JSON.stringify(profile, null, 2)}

Estado visible de Mi Meta:
${JSON.stringify(metaState || {}, null, 2)}
`.trim()
}

async function callOpenAI({ messages, profile, metaState }) {
  if (!process.env.OPENAI_API_KEY) throw new Error('Missing OPENAI_API_KEY')
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.45,
      messages: [
        { role: 'system', content: systemPrompt(profile, metaState) },
        ...messages,
      ],
    }),
  })
  if (!res.ok) throw new Error(`OpenAI error ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content?.trim()
}

async function callGemini({ messages, profile, metaState }) {
  if (!process.env.GEMINI_API_KEY) throw new Error('Missing GEMINI_API_KEY')
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
  const prompt = [
    systemPrompt(profile, metaState),
    ...messages.map((message) => `${message.role === 'assistant' ? 'Agente' : 'Usuario'}: ${message.content}`),
  ].join('\n\n')
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { temperature: 0.45 } }),
  })
  if (!res.ok) throw new Error(`Gemini error ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.map((part) => part.text).join('').trim()
}

async function callClaude({ messages, profile, metaState }) {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('Missing ANTHROPIC_API_KEY')
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.CLAUDE_MODEL || 'claude-3-5-haiku-latest',
      max_tokens: 220, temperature: 0.45,
      system: systemPrompt(profile, metaState), messages,
    }),
  })
  if (!res.ok) throw new Error(`Claude error ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return data.content?.map((item) => item.text).join('').trim()
}

async function callLLM(payload) {
  const provider = (process.env.LLM_PROVIDER || 'openai').toLowerCase()
  if (provider === 'gemini') return callGemini(payload)
  if (provider === 'claude' || provider === 'anthropic') return callClaude(payload)
  return callOpenAI(payload)
}

function elevenLabsApiKey() {
  return process.env.ELEVENLABS_API_KEY || process.env.VITE_ELEVENLABS_KEY || ''
}

function voiceForProfile({ cluster, country } = {}) {
  const clusterKey = envSuffix(cluster)
  const countryKey = envSuffix(country || 'mexico')
  const aliases = clusterVoiceAliases[clusterKey] || [clusterKey]
  for (const alias of aliases) {
    const voice = process.env[`ELEVENLABS_VOICE_CLUSTER_${alias}`] || process.env[`VITE_ELEVENLABS_VOICE_CLUSTER_${alias}`]
    if (voice) return voice
  }
  return (
    process.env[`ELEVENLABS_VOICE_${countryKey}`] ||
    process.env[`VITE_ELEVENLABS_VOICE_${countryKey}`] ||
    process.env.ELEVENLABS_VOICE_ID ||
    process.env.VITE_ELEVENLABS_VOICE_ID ||
    '21m00Tcm4TlvDq8ikWAM'
  )
}

async function textToSpeech(text, options = {}) {
  const apiKey = elevenLabsApiKey()
  if (!apiKey) return null
  const voiceId = voiceForProfile(options)
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      model_id: process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  })
  if (!res.ok) throw new Error(`ElevenLabs error ${res.status}: ${await res.text()}`)
  const audio = Buffer.from(await res.arrayBuffer()).toString('base64')
  return { audio, mimeType: 'audio/mpeg', voiceId }
}

function toLLMMessages(message, history = []) {
  const previous = history.slice(-8).filter((item) => item?.text && item?.who).map((item) => ({
    role: item.who === 'bot' ? 'assistant' : 'user',
    content: item.text,
  }))
  return [...previous, { role: 'user', content: message }]
}

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    provider: process.env.LLM_PROVIDER || 'openai',
    elevenlabs: Boolean(elevenLabsApiKey()),
    elevenlabsAgent: Boolean(ELEVENLABS_AGENT_ID),
  })
})

app.get('/api/elevenlabs/signed-url', async (req, res) => {
  try {
    const url = new URL(`https://api.elevenlabs.io/v1/convai/conversation/get-signed-url`)
    url.searchParams.set('agent_id', req.query.agent_id || ELEVENLABS_AGENT_ID)
    const response = await fetch(url, {
      headers: { 'xi-api-key': elevenLabsApiKey() },
    })
    if (!response.ok) throw new Error(`ElevenLabs error ${response.status}: ${await response.text()}`)
    const data = await response.json()
    res.json({ signedUrl: data.signed_url })
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to get signed URL' })
  }
})

app.get('/api/elevenlabs/conversation-token', async (req, res) => {
  try {
    const url = new URL(`https://api.elevenlabs.io/v1/convai/conversation/token`)
    url.searchParams.set('agent_id', req.query.agent_id || ELEVENLABS_AGENT_ID)
    const response = await fetch(url, {
      headers: { 'xi-api-key': elevenLabsApiKey() },
    })
    if (!response.ok) throw new Error(`ElevenLabs error ${response.status}: ${await response.text()}`)
    const data = await response.json()
    res.json({ conversationToken: data.token })
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to get conversation token' })
  }
})

app.post('/api/agent', async (req, res) => {
  try {
    const { message, history, customerProfile, metaState, includeAudio = true } = req.body || {}
    if (!message?.trim()) return res.status(400).json({ error: 'message is required' })
    const profile = loadProfile(customerProfile)
    const messages = toLLMMessages(message.trim(), history)
    const reply = await callLLM({ messages, profile, metaState })
    if (!reply) throw new Error('LLM returned empty response')
    const tts = includeAudio ? await textToSpeech(reply, { country: profile.pais, cluster: profile.perfil }) : null
    res.json({
      reply,
      profile: { customer_id: profile.customer_id, perfil: profile.perfil, pais: profile.pais },
      audio: tts?.audio || null, mimeType: tts?.mimeType || null, voiceId: tts?.voiceId || null,
    })
  } catch (error) {
    res.status(500).json({ error: error.message || 'Agent failed' })
  }
})

app.post('/api/tts', async (req, res) => {
  try {
    const { text, country, cluster, customerProfile } = req.body || {}
    if (!text?.trim()) return res.status(400).json({ error: 'text is required' })
    const profile = customerProfile ? loadProfile(customerProfile) : null
    const tts = await textToSpeech(text.trim(), { country: profile?.pais || country, cluster: profile?.perfil || cluster })
    if (!tts) return res.status(400).json({ error: 'Missing ELEVENLABS_API_KEY' })
    res.json(tts)
  } catch (error) {
    res.status(500).json({ error: error.message || 'TTS failed' })
  }
})

export const handler = serverless(app)
