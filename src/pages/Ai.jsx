import { useState, useRef, useEffect, useCallback } from 'react'
import Lottie from 'lottie-react'
import { Conversation } from '@elevenlabs/client'
import helloAnimation from '../../assets/hello.json'
import { apiUrl } from '../services/api.js'
import lookAnimation from '../../assets/look.json'
import idleAnimation from '../../assets/idle.json'
import vipProfile from '../../agente-tuali/Casos Principales/1_0012Eplus18.json'
import nicheProfile from '../../agente-tuali/Casos Principales/1_00004Eplus18.json'
import recurrentProfile from '../../agente-tuali/Casos Principales/3_87064Eplus17.json'
import occasionalProfile from '../../agente-tuali/Casos Principales/ocasional_sample.json'
import volumeProfile from '../../agente-tuali/Casos Principales/volumen_sample.json'

const AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID || 'agent_5601ktgk8z39f7nbxt0hshsc8jpj'
const DEFAULT_PROFILE_FILE = '1_0012Eplus18'

const profileModules = {
  '1_0012Eplus18': vipProfile,
  '1_00004Eplus18': nicheProfile,
  '3_87064Eplus17': recurrentProfile,
  ocasional_sample: occasionalProfile,
  volumen_sample: volumeProfile,
}

const repeatedGreetingPatterns = [
  'en que puedo ayudar',
  'en que puedo ayudarle',
  'soy tuali',
  'agente de crecimiento tuali',
]

function normalizeText(value = '') {
  return String(value)
    .replaceAll('DiversificaciÃ³n', 'Diversificacion')
    .replaceAll('ActivaciÃ³n', 'Activacion')
    .replaceAll('MÃ©xico', 'Mexico')
    .replaceAll('PerÃº', 'Peru')
    .replaceAll('SÃ¡bado', 'Sabado')
    .replaceAll('dÃ­as', 'dias')
    .replaceAll('categorÃ­a', 'categoria')
}

function normalizeForCompare(value = '') {
  return normalizeText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function isRepeatedGreeting(text) {
  const normalized = normalizeForCompare(text)
  return repeatedGreetingPatterns.some((pattern) => normalized.includes(pattern))
}

function getLoggedProfile() {
  const configuredId = localStorage.getItem('tuali_customer_profile') || import.meta.env.VITE_CUSTOMER_PROFILE || DEFAULT_PROFILE_FILE
  return {
    id: configuredId,
    data: profileModules[configuredId] || profileModules[DEFAULT_PROFILE_FILE],
  }
}

function buildDynamicVariables() {
  const { id, data } = getLoggedProfile()
  const metricas = data.metricas_base || {}
  const metas = (data.metas || []).map((meta) => ({
    tipo: normalizeText(meta.tipo),
    prioridad: normalizeText(meta.prioridad),
    datos_asociados: meta.datos_asociados || {},
  }))

  return {
    customer_profile_id: id,
    customer_id: String(data.customer_id || ''),
    perfil: normalizeText(data.perfil || ''),
    cluster: normalizeText(data.perfil || ''),
    pais: normalizeText(data.pais || 'Mexico'),
    frecuencia: Number(metricas.frecuencia || 0),
    ticket_promedio: Number(metricas.ticket_promedio || 0),
    score_nicho: Number(metricas.score_nicho || 0),
    meta_principal: metas[0]?.tipo || 'Aumentar promedio de ticket',
    metas_json: JSON.stringify(metas).slice(0, 1800),
  }
}

async function fetchElevenLabsSession(mode) {
  const endpoint = mode === 'voice' ? 'conversation-token' : 'signed-url'
  const response = await fetch(apiUrl(`/api/elevenlabs/${endpoint}?agent_id=${encodeURIComponent(AGENT_ID)}`))
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || `No se pudo iniciar sesion ElevenLabs ${mode}`)
  return data
}

function buildConversationOptions({ mode, handlers }) {
  const dynamicVariables = buildDynamicVariables()
  const base = {
    dynamicVariables,
    userId: dynamicVariables.customer_id || dynamicVariables.customer_profile_id,
    overrides: {
      agent: { language: 'es' },
    },
    ...handlers,
  }

  if (mode === 'text') {
    return { ...base, textOnly: true, connectionType: 'websocket' }
  }

  return { ...base, textOnly: false, connectionType: 'webrtc' }
}

export default function Ai() {
  const [messages, setMessages] = useState([
    { text: 'Soy Tuali. Puedo ayudarte con pedidos, metas y recomendaciones.', who: 'bot' },
  ])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [voiceStatus, setVoiceStatus] = useState('idle')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [animation, setAnimation] = useState(helloAnimation)
  const chatRef = useRef(null)
  const lottieRef = useRef(null)
  const textConvRef = useRef(null)
  const voiceConvRef = useRef(null)
  const isStartingVoiceRef = useRef(false)
  const startingTextRef = useRef(null)
  const hasStartedElevenGreetingRef = useRef(false)

  const SPEED = 2.5

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => () => {
    textConvRef.current?.endSession()
    voiceConvRef.current?.endSession()
  }, [])

  function appendMessage(text, who) {
    if (!text?.trim()) return
    const cleanText = text.trim()
    const normalized = normalizeForCompare(cleanText)

    setMessages((prev) => {
      const last = prev[prev.length - 1]
      const lastNormalized = normalizeForCompare(last?.text || '')

      if (who === 'bot' && isRepeatedGreeting(cleanText)) {
        const previousGreeting = prev.some((item) => item.who === 'bot' && isRepeatedGreeting(item.text))
        if (hasStartedElevenGreetingRef.current || previousGreeting) return prev
        hasStartedElevenGreetingRef.current = true
      }

      if (last?.who === who && lastNormalized === normalized) return prev
      if (prev.slice(-4).some((item) => item.who === who && normalizeForCompare(item.text) === normalized)) return prev

      return [...prev, { text: cleanText, who }]
    })
  }

  function handleElevenLabsError(label, error) {
    const message = typeof error === 'string'
      ? error
      : error?.message || error?.error || 'Error desconocido de ElevenLabs'
    console.error(`[elevenlabs ${label}]`, error)
    appendMessage(`ElevenLabs no pudo continuar: ${message}`, 'bot')
  }

  async function startTextSession() {
    if (textConvRef.current?.isOpen()) return textConvRef.current
    if (startingTextRef.current) return startingTextRef.current

    const handlers = {
      onConnect: () => {},
      onDisconnect: () => {
        textConvRef.current = null
      },
      onMessage: ({ message, source, role }) => {
        if (role === 'agent' || source === 'ai') {
          setIsSending(false)
          setAnimation(helloAnimation)
          setMessages((prev) => {
            const last = prev[prev.length - 1]
            if (last?.who === 'bot' && last.streaming) {
              return [...prev.slice(0, -1), { text: last.text.trim(), who: 'bot' }]
            }
            return prev
          })
          appendMessage(message, 'bot')
        } else {
          appendMessage(message, 'user')
        }
      },
      onAgentChatResponsePart: ({ text: chunk, type }) => {
        if (type === 'stop') {
          setIsSending(false)
          setAnimation(helloAnimation)
          setMessages((prev) => prev.map((item) => item.streaming ? { ...item, streaming: false } : item))
          return
        }
        if (!chunk) return
        setMessages((prev) => {
          const last = prev[prev.length - 1]
          if (last?.who === 'bot' && last.streaming) {
            return [...prev.slice(0, -1), { ...last, text: `${last.text}${chunk}` }]
          }
          return [...prev, { text: chunk, who: 'bot', streaming: true }]
        })
      },
      onError: (error, context) => handleElevenLabsError('text', context || error),
    }

    startingTextRef.current = (async () => {
      const options = buildConversationOptions({ mode: 'text', handlers })

      try {
        const { signedUrl } = await fetchElevenLabsSession('text')
        textConvRef.current = await Conversation.startSession({ ...options, signedUrl })
      } catch (error) {
        console.warn('[elevenlabs text signed-url fallback]', error)
        textConvRef.current = await Conversation.startSession({ ...options, agentId: AGENT_ID })
      }

      return textConvRef.current
    })()

    try {
      return await startingTextRef.current
    } finally {
      startingTextRef.current = null
    }
  }

  async function sendMessage() {
    const text = input.trim()
    if (!text || isSending || voiceStatus === 'connected') return

    appendMessage(text, 'user')
    setInput('')
    setIsSending(true)
    setAnimation(lookAnimation)

    try {
      const conversation = await startTextSession()
      conversation.sendUserMessage(text)
    } catch (error) {
      setIsSending(false)
      setAnimation(helloAnimation)
      handleElevenLabsError('text start', error)
    }
  }

  const startVoice = useCallback(async () => {
    if (isStartingVoiceRef.current || voiceConvRef.current) return
    isStartingVoiceRef.current = true
    setVoiceStatus('connecting')
    setAnimation(lookAnimation)

    try {
      const permissionStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      permissionStream.getTracks().forEach((track) => track.stop())

      const handlers = {
        onConnect: () => {
          setVoiceStatus('connected')
          appendMessage('Modo voz activado.', 'bot')
        },
        onDisconnect: () => {
          setVoiceStatus('idle')
          setIsSpeaking(false)
          setAnimation(helloAnimation)
          voiceConvRef.current = null
        },
        onMessage: ({ message, source, role }) => {
          appendMessage(message, role === 'agent' || source === 'ai' ? 'bot' : 'user')
        },
        onModeChange: ({ mode }) => {
          setIsSpeaking(mode === 'speaking')
          setAnimation(mode === 'speaking' ? lookAnimation : idleAnimation)
        },
        onError: (error, context) => {
          setVoiceStatus('idle')
          setAnimation(helloAnimation)
          handleElevenLabsError('voice', context || error)
        },
      }

      const options = buildConversationOptions({ mode: 'voice', handlers })

      try {
        const { conversationToken } = await fetchElevenLabsSession('voice')
        voiceConvRef.current = await Conversation.startSession({ ...options, conversationToken })
      } catch (error) {
        console.warn('[elevenlabs voice token fallback]', error)
        voiceConvRef.current = await Conversation.startSession({ ...options, agentId: AGENT_ID })
      }
    } catch (error) {
      setVoiceStatus('idle')
      setAnimation(helloAnimation)
      handleElevenLabsError('voice start', error)
    } finally {
      isStartingVoiceRef.current = false
    }
  }, [])

  const stopVoice = useCallback(async () => {
    await voiceConvRef.current?.endSession()
    voiceConvRef.current = null
    setVoiceStatus('idle')
    setIsSpeaking(false)
    setAnimation(helloAnimation)
    appendMessage('Modo voz detenido. Puedes escribir o volver a hablar.', 'bot')
  }, [])

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      sendMessage()
    }
  }

  const voiceLabel = { idle: 'Mic', connecting: '...', connected: 'Stop' }

  return (
    <>
      <div className="chat-avatar">
        <Lottie
          key={animation === helloAnimation ? 'hello' : animation === lookAnimation ? 'look' : 'idle'}
          lottieRef={lottieRef}
          animationData={animation}
          loop
          autoplay
          onDOMLoaded={() => lottieRef.current?.setSpeed(SPEED)}
          style={{ width: 140, height: 140 }}
        />
        {voiceStatus === 'connected' && (
          <div style={{ textAlign: 'center', fontSize: 12, color: isSpeaking ? '#4caf50' : '#888' }}>
            {isSpeaking ? 'Tuali esta hablando...' : 'Escuchando...'}
          </div>
        )}
      </div>
      <div className="chat-messages" ref={chatRef}>
        {messages.map((msg, i) => (
          <div key={i} className={`msg ${msg.who}`}>{msg.text}</div>
        ))}
      </div>
      <div className="chat-input-bar">
        <input
          className="chat-input"
          type="text"
          placeholder={voiceStatus === 'connected' ? 'Modo voz activo...' : 'Escribe un mensaje...'}
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            textConvRef.current?.sendUserActivity()
          }}
          onKeyDown={handleKeyDown}
          disabled={isSending || voiceStatus === 'connected'}
          autoComplete="off"
        />
        <button
          className="chat-send"
          onClick={voiceStatus === 'connected' ? stopVoice : voiceStatus === 'idle' ? startVoice : undefined}
          aria-label={voiceStatus === 'connected' ? 'Detener voz' : 'Iniciar voz'}
          disabled={voiceStatus === 'connecting' || isSending}
          title={voiceStatus === 'connected' ? 'Detener conversacion de voz' : voiceStatus === 'connecting' ? 'Conectando...' : 'Hablar con Tuali'}
          style={{ marginRight: 4, opacity: voiceStatus === 'connecting' ? 0.5 : 1 }}
        >
          {voiceLabel[voiceStatus]}
        </button>
        <button className="chat-send" onClick={sendMessage} aria-label="Enviar" disabled={isSending || voiceStatus === 'connected'}>
          {isSending ? '...' : '>'}
        </button>
      </div>
    </>
  )
}
