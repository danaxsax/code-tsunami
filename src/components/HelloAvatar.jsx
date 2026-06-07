import { useRef, useState, useEffect } from 'react'
import Lottie from 'lottie-react'
import helloAnimation from '../../assets/hello.json'
import moveAnimation from '../../assets/move.json'

const MOVE_MS = 5000
const HELLO_MS = 10000

export default function HelloAvatar({ onClick, phrases = ['¿Necesitas ayuda? Pregúntale a la IA'] }) {
  const lottieRef = useRef(null)
  // phase: 'move' (sin texto, 5s)  |  'hello' (con texto, 10s)
  const [phase, setPhase] = useState('move')
  // índice de la frase actual; avanza cada vez que entramos a la fase 'hello'
  const [phraseIndex, setPhraseIndex] = useState(0)

  useEffect(() => {
    const duration = phase === 'move' ? MOVE_MS : HELLO_MS
    const timer = setTimeout(() => {
      if (phase === 'move') {
        setPhase('hello')
      } else {
        // al terminar 'hello', avanzamos a la siguiente frase y volvemos a 'move'
        setPhraseIndex((i) => (i + 1) % phrases.length)
        setPhase('move')
      }
    }, duration)
    return () => clearTimeout(timer)
  }, [phase, phrases.length])

  const isHello = phase === 'hello'

  return (
    <button className="hello-avatar" onClick={onClick} aria-label="Abrir asistente AI">
      <Lottie
        key={phase}
        lottieRef={lottieRef}
        animationData={isHello ? helloAnimation : moveAnimation}
        loop
        autoplay
        onDOMLoaded={() => lottieRef.current?.setSpeed(2.5)}
        style={{ width: 64, height: 64 }}
      />
      <span className={`hello-avatar-text ${isHello ? 'show' : ''}`}>
        {phrases[phraseIndex]}
      </span>
    </button>
  )
}
