import { useRef } from 'react'
import Lottie from 'lottie-react'
import celebrateAnimation from '../../assets/celebrate.json'
import HelloAvatar from '../components/HelloAvatar.jsx'
import { getRandomPhrase } from '../../phrases.js'
import { speak } from '../services/tts.js'
import { detectCountry } from '../services/location.js'

export default function Gana({ onAvatarClick }) {
  const lottieRef = useRef(null)

  const handleCelebrateClick = () => {
    const country = detectCountry()
    const phrase = getRandomPhrase('gana')
    speak(phrase, country)
    if (onAvatarClick) onAvatarClick()
  }

  return (
    <div className="panel-pad">
      <HelloAvatar onClick={onAvatarClick} />
      <div className="points-card">
        <span className="gana-logo">gana</span>
        <div className="mis">Mis Puntos</div>
        <div className="value">&#11088; 15,796</div>
        <button
          className="points-celebrate"
          onClick={handleCelebrateClick}
          aria-label="Abrir asistente AI"
        >
          <Lottie
            lottieRef={lottieRef}
            animationData={celebrateAnimation}
            loop
            autoplay
            onDOMLoaded={() => lottieRef.current?.setSpeed(2.5)}
            style={{ width: 110, height: 110 }}
          />
        </button>
      </div>

      <div className="points-warn">
        Tienes 400 Puntos por vencer el día 13/Ago/2026
      </div>

      <div className="two-cards">
        <div className="mini-card">
          <span className="mc-icon">&#127873;</span>
          <span className="mc-label">Tienda de Recompensas</span>
        </div>
        <div className="mini-card">
          <span className="mc-icon">&#128260;</span>
          <span className="mc-label">Movimiento de Puntos</span>
        </div>
      </div>

      <div className="retos-head">
        <h2 className="section-title">Tus Retos</h2>
        <span className="link">Más Retos &rsaquo;</span>
      </div>

      <div className="reto-card">
        <div className="reto-top">
          <span className="reto-tag">Nuevo</span>
          <span className="link">Ver detalles &rsaquo;</span>
        </div>
        <div className="reto-body">
          <span className="reto-img">&#128722;</span>
          <span className="reto-title">Coca-Cola y Zero te llevan al Reto &#127947;</span>
        </div>
        <div className="reto-meta">
          <span className="reto-pill">Gana &#11088; 450 Puntos</span>
          <span className="reto-pill time">&#9201; 24 días</span>
        </div>
        <button className="reto-btn">Iniciar Reto</button>
        <div className="reto-foot">Completa el reto</div>
      </div>

      <div className="reto-card">
        <div className="reto-top">
          <span className="reto-tag">Nuevo</span>
          <span className="link">Ver detalles &rsaquo;</span>
        </div>
        <div className="reto-body">
          <span className="reto-img">&#129380;</span>
          <span className="reto-title">Surte Del Valle y gana puntos dobles</span>
        </div>
        <div className="reto-meta">
          <span className="reto-pill">Gana &#11088; 300 Puntos</span>
          <span className="reto-pill time">&#9201; 18 días</span>
        </div>
        <button className="reto-btn">Iniciar Reto</button>
        <div className="reto-foot">Completa el reto</div>
      </div>
    </div>
  )
}
