import { useRef, useCallback, useState } from 'react'  // ← agregar useState
import Lottie from 'lottie-react'
import helloAnimation from '../../assets/hello.json'
import { speak } from '../services/tts.js'
import { detectCountry } from '../services/location.js'

export default function HelloAvatar({ onClick, phrases }) {
  const lottieRef = useRef(null)
  const [phase, setPhase] = useState('hello')
  const [phraseIndex, setPhraseIndex] = useState(0)
  const speakingRef = useRef(false)

  const isHello = phase === 'hello'  // ← variable que faltaba definir

  const handleClick = useCallback(() => {
    if (speakingRef.current) return
    speakingRef.current = true

    const country = detectCountry()
    const list = phrases && phrases.length ? phrases : [
      '¿Necesitas ayuda? Estoy aquí para lo que necesites',
    ]
    const text = list[Math.floor(Math.random() * list.length)]

    speak(text, country).finally(() => {
      speakingRef.current = false
    })

    if (onClick) onClick()
  }, [onClick, phrases])

  return (
    <button className="hello-avatar" onClick={handleClick} aria-label="Abrir asistente AI">
      <Lottie
        lottieRef={lottieRef}
        animationData={helloAnimation}
        loop
        autoplay
        onDOMLoaded={() => lottieRef.current?.setSpeed(2.5)}
        style={{ width: 64, height: 64 }}
      />
      <span className={`hello-avatar-text ${isHello ? 'show' : 'dots'}`}>
        {isHello ? (phrases?.[phraseIndex] ?? '') : '...'}
      </span>
    </button>
  )
}