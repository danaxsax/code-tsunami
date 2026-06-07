import { useAuth, STORE_NAMES, PROFILE_LABELS, PROFILE_COUNTRIES } from '../context/AuthContext'
import tualiLogo from '../../assets/tuali_logo.png'

const profiles = [
  { key: '1_0012Eplus18' },
  { key: '1_00004Eplus18' },
  { key: '3_87064Eplus17' },
  { key: 'volumen_sample' },
  { key: 'ocasional_sample' },
]

const PROFILE_DESCRIPTIONS = {
  '1_0012Eplus18': 'Compra con alto valor. Prioriza ticket promedio y combos.',
  '1_00004Eplus18': 'Alta concentración en pocos productos. Prioriza diversificación.',
  '3_87064Eplus17': 'Compra con frecuencia. Prioriza nuevas oportunidades de surtido.',
  volumen_sample: 'Potencial de aumentar frecuencia. Prioriza pedidos programados.',
  ocasional_sample: 'Compra poco o esporádicamente. Prioriza activación.',
}

export default function Login() {
  const { login } = useAuth()

  return (
    <div className="login-screen">
      <div className="login-header">
        <img src={tualiLogo} alt="Tuali" className="login-logo" />
        <p className="login-subtitle">Selecciona tu tienda para continuar</p>
      </div>
      <div className="login-list">
        {profiles.map((p) => (
          <button className="login-card" key={p.key} onClick={() => login(p.key)}>
            <div className="login-card-badge">{PROFILE_LABELS[p.key]}</div>
            <div className="login-card-name">{STORE_NAMES[p.key]}</div>
            <div className="login-card-desc">{PROFILE_DESCRIPTIONS[p.key]}</div>
            <div className="login-card-meta">{PROFILE_COUNTRIES[p.key]}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
