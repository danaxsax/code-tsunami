import { useState, useRef, useEffect } from 'react'
import Lottie from 'lottie-react'
import helloAnimation from '../../assets/hello.json'
import lookAnimation from '../../assets/look.json'

export default function Ai() {
  const [messages, setMessages] = useState([
    { text: 'Hola, soy tu agente de crecimiento Tuali. Puedo ayudarte con tus metas, pedidos, puntos y recomendaciones.', who: 'bot' },
  ])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [animation, setAnimation] = useState(helloAnimation)
  const chatRef = useRef(null)
  const lottieRef = useRef(null)

  const SPEED = 2.5

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages])

  async function playAudio(audio, mimeType = 'audio/mpeg') {
    if (!audio) return
    const res = await fetch(`data:${mimeType};base64,${audio}`)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const player = new Audio(url)
    player.onended = () => URL.revokeObjectURL(url)
    await player.play()
  }

  async function sendMessage() {
    const text = input.trim()
    if (!text || isSending) return

    const nextMessages = [...messages, { text, who: 'user' }]
    setMessages(nextMessages)
    setInput('')
    setIsSending(true)
    setAnimation(lookAnimation)

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages,
          customerProfile: localStorage.getItem('tuali_customer_profile') || import.meta.env.VITE_CUSTOMER_PROFILE || '1_0012Eplus18',
          metaState: {
            screen: 'Mi Meta',
            activeGoal: 'Aumentar promedio de ticket',
            currentTicket: 4391,
            targetTicket: 4830,
            missing: 439,
          },
          includeAudio: true,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'No pude conectar con el agente.')

      setMessages((prev) => [...prev, { text: data.reply, who: 'bot' }])
      playAudio(data.audio, data.mimeType).catch((error) => console.warn('[agent audio]', error))
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          text: `No pude conectar con el agente real. Revisa que el servidor este corriendo y que las llaves del .env sean correctas. (${error.message})`,
          who: 'bot',
        },
      ])
    } finally {
      setIsSending(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      <div className="chat-avatar">
        <Lottie
          key={animation === helloAnimation ? 'hello' : 'look'}
          lottieRef={lottieRef}
          animationData={animation}
          loop
          autoplay
          onDOMLoaded={() => lottieRef.current?.setSpeed(SPEED)}
          style={{ width: 140, height: 140 }}
        />
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
          placeholder="Escribe un mensaje..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSending}
          autoComplete="off"
        />
        <button className="chat-send" onClick={sendMessage} aria-label="Enviar" disabled={isSending}>
          {isSending ? '...' : '>'}
        </button>
      </div>
    </>
  )
}
