import { useRef, useState, useEffect, useCallback } from 'react'
import Lottie from 'lottie-react'
import helloAnimation from '../../assets/hello.json'
import moveAnimation from '../../assets/move.json'
import { speak } from '../services/tts.js'
import { detectCountry } from '../services/location.js'

const MOVE_MS = 5000
const HELLO_MS = 10000

export default function HelloAvatar({ onClick, phrases = ['¿Necesitas ayuda? Pregúntale a la IA'] }) {
  const lottieRef = useRef(null)
  const [phase, setPhase] = useState('hello')
  const [phraseIndex, setPhraseIndex] = useState(0)
  const speakingRef = useRef(false)

  const isHello = phase === 'hello'

  useEffect(() => {
    const duration = phase === 'move' ? MOVE_MS : HELLO_MS
    const timer = setTimeout(() => {
      if (phase === 'move') {
        setPhase('hello')
      } else {
        setPhraseIndex((i) => (i + 1) % phrases.length)
        setPhase('move')
      }
    }, duration)
    return () => clearTimeout(timer)
  }, [phase, phrases.length])

  const handleClick = useCallback(() => {
    if (speakingRef.current) return
    speakingRef.current = true

    const country = detectCountry()
    const list = phrases && phrases.length ? phrases : ['¿Necesitas ayuda? Estoy aquí para lo que necesites']
    const text = list[phraseIndex]
    console.log(`[HelloAvatar] País detectado: ${country}, Frase: "${text}"`)

    speak(text, country).finally(() => {
      speakingRef.current = false
    })

    if (onClick) onClick()
  }, [onClick, phrases, phraseIndex])

  return (
    <button className="hello-avatar" onClick={handleClick} aria-label="Abrir asistente AI">
      <Lottie
        key={phase}
        lottieRef={lottieRef}
        animationData={isHello ? helloAnimation : moveAnimation}
        loop
        autoplay
        onDOMLoaded={() => lottieRef.current?.setSpeed(2.5)}
        style={{ width: 64, height: 64 }}
      />
      <span className={`hello-avatar-text ${isHello ? 'show' : 'dots'}`}>
        {isHello ? phrases[phraseIndex] : '...'}
      </span>
    </button>
  )
}
