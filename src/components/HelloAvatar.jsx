import { useRef, useCallback } from 'react'
import Lottie from 'lottie-react'
import helloAnimation from '../../assets/hello.json'
import { getRandomPhrase } from '../../phrases.js'
import { speak } from '../services/tts.js'
import { detectCountry } from '../services/location.js'

export default function HelloAvatar({ onClick }) {
  const lottieRef = useRef(null)
  const speakingRef = useRef(false)

  const handleClick = useCallback(() => {
    if (speakingRef.current) return
    speakingRef.current = true

    const country = detectCountry()
    const phrase = getRandomPhrase()
    speak(phrase, country).finally(() => {
      speakingRef.current = false
    })

    if (onClick) onClick()
  }, [onClick])

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
      <span className="hello-avatar-text">¿Necesitas ayuda? Pregúntale a la IA</span>
    </button>
  )
}
