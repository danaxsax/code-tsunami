import 'dotenv/config'
import express, { type Request, type Response } from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const profilesDir = path.join(rootDir, 'agente-tuali', 'Casos Principales')

const app = express()
const PORT = Number(process.env.AGENT_SERVER_PORT || 8787)
const ELEVENLABS_AGENT_ID = process.env.ELEVENLABS_AGENT_ID || process.env.VITE_ELEVENLABS_AGENT_ID || ''

app.use(express.json({ limit: '1mb' }))

const profileFiles: Record<string, string> = {
  '1_0012Eplus18': '1_0012Eplus18.json',
  '1_00004Eplus18': '1_00004Eplus18.json',
  '3_87064Eplus17': '3_87064Eplus17.json',
  ocasional_sample: 'ocasional_sample.json',
  volumen_sample: 'volumen_sample.json',
}

const clusterVoiceAliases: Record<string, string[]> = {
  VIP: ['VIP'],
  NICHO: ['NICHO'],
  OCASIONAL: ['OCASIONAL'],
  VOLUMEN: ['VOLUMEN', 'VOLUMEN_BAJO', 'BAJO_VOLUMEN'],
  RECURRENTE: ['RECURRENTE', 'CLIENTE_ALTAMENTE_RECURRENTE', 'ALTAMENTE_RECURRENTE'],
}

interface Profile {
  customer_id?: string
  perfil?: string
  pais?: string
  [key: string]: unknown
}

interface LLMMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface LLMPayload {
  messages: LLMMessage[]
  profile: Profile
  metaState?: Record<string, unknown>
}

interface TTSOptions {
  country?: string
  cluster?: string
}

interface TTSResult {
  audio: string
  mimeType: string
  voiceId: string
}

interface HistoryItem {
  text?: string
  who?: string
}

function normalizeText(value: string = ''): string {
  return String(value)
    .replaceAll('DiversificaciÃ³n', 'Diversificacion')
    .replaceAll('ActivaciÃ³n', 'Activacion')
    .replaceAll('MÃ©xico', 'Mexico')
    .replaceAll('PerÃº', 'Peru')
    .replaceAll('SÃ¡bado', 'Sabado')
    .replaceAll('dÃ­as', 'dias')
    .replaceAll('categorÃ­a', 'categoria')
}

function envSuffix(value: string = ''): string {
  return normalizeText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function normalizeDeep<T>(value: T): T {
  if (Array.isArray(value)) return value.map(normalizeDeep) as T
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, normalizeDeep(item)]),
    ) as T
  }
  return typeof value === 'string' ? normalizeText(value) as T : value
}

function loadProfile(profileId: string = process.env.DEFAULT_CUSTOMER_PROFILE || '1_0012Eplus18'): Profile {
  const fileName = profileFiles[profileId] || profileFiles['1_0012Eplus18']
  const raw = fs.readFileSync(path.join(profilesDir, fileName), 'utf8')
  return normalizeDeep(JSON.parse(raw)) as Profile
}

function systemPrompt(profile: Profile, metaState: Record<string, unknown> | null): string {
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

async function callOpenAI({ messages, profile, metaState }: LLMPayload): Promise<string | null> {
  if (!process.env.OPENAI_API_KEY) throw new Error('Missing OPENAI_API_KEY')

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.45,
      messages: [
        { role: 'system', content: systemPrompt(profile, metaState ?? null) },
        ...messages,
      ],
    }),
  })

  if (!res.ok) throw new Error(`OpenAI error ${res.status}: ${await res.text()}`)
  const data = await res.json() as { choices?: { message?: { content?: string } }[] }
  return data.choices?.[0]?.message?.content?.trim() ?? null
}

async function callGemini({ messages, profile, metaState }: LLMPayload): Promise<string | null> {
  if (!process.env.GEMINI_API_KEY) throw new Error('Missing GEMINI_API_KEY')

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
  const prompt = [
    systemPrompt(profile, metaState ?? null),
    ...messages.map((message) => `${message.role === 'assistant' ? 'Agente' : 'Usuario'}: ${message.content}`),
  ].join('\n\n')

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.45 },
    }),
  })

  if (!res.ok) throw new Error(`Gemini error ${res.status}: ${await res.text()}`)
  const data = await res.json() as { candidates?: { content?: { parts?: { text: string }[] } }[] }
  return data.candidates?.[0]?.content?.parts?.map((part) => part.text).join('').trim() ?? null
}

async function callClaude({ messages, profile, metaState }: LLMPayload): Promise<string | null> {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('Missing ANTHROPIC_API_KEY')

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.CLAUDE_MODEL || 'claude-3-5-haiku-latest',
      max_tokens: 220,
      temperature: 0.45,
      system: systemPrompt(profile, metaState ?? null),
      messages,
    }),
  })

  if (!res.ok) throw new Error(`Claude error ${res.status}: ${await res.text()}`)
  const data = await res.json() as { content?: { text: string }[] }
  return data.content?.map((item) => item.text).join('').trim() ?? null
}

async function callLLM(payload: LLMPayload): Promise<string | null> {
  const provider = (process.env.LLM_PROVIDER || 'openai').toLowerCase()
  if (provider === 'gemini') return callGemini(payload)
  if (provider === 'claude' || provider === 'anthropic') return callClaude(payload)
  return callOpenAI(payload)
}

function elevenLabsApiKey(): string {
  return process.env.ELEVENLABS_API_KEY || process.env.VITE_ELEVENLABS_KEY || ''
}

async function elevenLabsConvaiRequest(pathname: string, agentId?: string): Promise<Record<string, unknown>> {
  const apiKey = elevenLabsApiKey()
  if (!apiKey) throw new Error('Missing ELEVENLABS_API_KEY')

  const selectedAgentId = agentId || ELEVENLABS_AGENT_ID
  if (!selectedAgentId) throw new Error('Missing ELEVENLABS_AGENT_ID')

  const url = new URL(`https://api.elevenlabs.io/v1/convai/conversation/${pathname}`)
  url.searchParams.set('agent_id', selectedAgentId)

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'xi-api-key': apiKey },
  })

  if (!response.ok) throw new Error(`ElevenLabs ConvAI error ${response.status}: ${await response.text()}`)
  return response.json() as Promise<Record<string, unknown>>
}

function voiceForProfile({ cluster, country }: TTSOptions = {}): string {
  const clusterKey = envSuffix(cluster)
  const countryKey = envSuffix(country || 'mexico')
  const clusterAliases = clusterVoiceAliases[clusterKey] || [clusterKey]

  for (const alias of clusterAliases) {
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

async function textToSpeech(text: string, options: TTSOptions = {}): Promise<TTSResult | null> {
  const apiKey = elevenLabsApiKey()
  if (!apiKey) return null

  const voiceId = voiceForProfile(options)
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    }),
  })

  if (!res.ok) throw new Error(`ElevenLabs error ${res.status}: ${await res.text()}`)
  const audioBuffer = await res.arrayBuffer()
  const audio = Buffer.from(audioBuffer).toString('base64')
  return { audio, mimeType: 'audio/mpeg', voiceId }
}

function toLLMMessages(message: string, history: HistoryItem[] = []): LLMMessage[] {
  const previous = history
    .slice(-8)
    .filter((item) => item?.text && item?.who)
    .map((item) => ({
      role: item.who === 'bot' ? 'assistant' as const : 'user' as const,
      content: item.text!,
    }))

  return [...previous, { role: 'user', content: message }]
}

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    ok: true,
    provider: process.env.LLM_PROVIDER || 'openai',
    elevenlabs: Boolean(elevenLabsApiKey()),
    elevenlabsAgent: Boolean(ELEVENLABS_AGENT_ID),
  })
})

app.get('/api/elevenlabs/signed-url', async (req: Request, res: Response) => {
  try {
    const agentId = req.query.agent_id as string | undefined
    const data = await elevenLabsConvaiRequest('get-signed-url', agentId)
    res.json({ signedUrl: data.signed_url })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get signed URL'
    console.error('[elevenlabs signed-url]', error)
    res.status(500).json({ error: message })
  }
})

app.get('/api/elevenlabs/conversation-token', async (req: Request, res: Response) => {
  try {
    const agentId = req.query.agent_id as string | undefined
    const data = await elevenLabsConvaiRequest('token', agentId)
    res.json({ conversationToken: data.token })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get conversation token'
    console.error('[elevenlabs conversation-token]', error)
    res.status(500).json({ error: message })
  }
})

app.post('/api/agent', async (req: Request, res: Response) => {
  try {
    const { message, history, customerProfile, metaState, includeAudio = true } = req.body || {}
    if (!message?.trim()) {
      res.status(400).json({ error: 'message is required' })
      return
    }

    const profile = loadProfile(customerProfile)
    const messages = toLLMMessages(message.trim(), history)
    const reply = await callLLM({ messages, profile, metaState })
    if (!reply) throw new Error('LLM returned empty response')

    const tts = includeAudio ? await textToSpeech(reply, { country: profile.pais, cluster: profile.perfil }) : null
    res.json({
      reply,
      profile: {
        customer_id: profile.customer_id,
        perfil: profile.perfil,
        pais: profile.pais,
      },
      audio: tts?.audio || null,
      mimeType: tts?.mimeType || null,
      voiceId: tts?.voiceId || null,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Agent failed'
    console.error('[agent]', error)
    res.status(500).json({ error: message })
  }
})

app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const { text, country, cluster, customerProfile } = req.body || {}
    if (!text?.trim()) {
      res.status(400).json({ error: 'text is required' })
      return
    }
    const profile = customerProfile ? loadProfile(customerProfile) : null
    const tts = await textToSpeech(text.trim(), {
      country: profile?.pais || country,
      cluster: profile?.perfil || cluster,
    })
    if (!tts) {
      res.status(400).json({ error: 'Missing ELEVENLABS_API_KEY' })
      return
    }
    res.json(tts)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'TTS failed'
    console.error('[tts]', error)
    res.status(500).json({ error: message })
  }
})

app.listen(PORT, () => {
  console.log(`[agent] listening on http://127.0.0.1:${PORT}`)
})
