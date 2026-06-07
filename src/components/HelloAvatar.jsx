import { useRef } from 'react'
import Lottie from 'lottie-react'
import helloAnimation from '../../assets/hello.json'

export default function HelloAvatar({ onClick }) {
  const lottieRef = useRef(null)

  return (
    <button className="hello-avatar" onClick={onClick} aria-label="Abrir asistente AI">
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
