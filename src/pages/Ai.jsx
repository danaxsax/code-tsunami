import { useState, useRef, useEffect } from 'react'

export default function Ai() {
  const [messages, setMessages] = useState([
    { text: '¡Hola! Soy el asistente de Code Tsunami. ¿En qué puedo ayudarte?', who: 'bot' },
  ])
  const [input, setInput] = useState('')
  const chatRef = useRef(null)

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages])

  function sendMessage() {
    const text = input.trim()
    if (!text) return

    setMessages((prev) => [...prev, { text, who: 'user' }])
    setInput('')

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { text: 'Gracias por tu mensaje. Estoy en desarrollo — pronto podré responder automáticamente. 🚀', who: 'bot' },
      ])
    }, 600)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
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
          autoComplete="off"
        />
        <button className="chat-send" onClick={sendMessage} aria-label="Enviar">&#10148;</button>
      </div>
    </>
  )
}
