import { useAuth } from '../context/AuthContext.jsx'

export default function Header() {
  const { storeName, profileLabel, logout } = useAuth()

  return (
    <div className="header header-auth">
      <div className="header-row">
        <div className="header-info">
          <h1>{storeName}</h1>
          <span className="subtitle">{profileLabel}</span>
        </div>
        <button className="header-logout" onClick={logout} title="Cerrar sesión">
          Salir
        </button>
      </div>
    </div>
  )
}
