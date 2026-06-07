import HelloAvatar from '../components/HelloAvatar.jsx'
import cocacolaLogo from '../../assets/cocacola-logo.png'
import bokadosLogo from '../../assets/bokados-logo.png'
import tetrapack from '../../assets/tetrapack.png'

export default function Inicio({ onAvatarClick }) {
  return (
    <>
      <HelloAvatar onClick={onAvatarClick} />
      <div className="pos-bar">
        <div>
          <div className="pos-label">Punto de venta</div>
          <div className="pos-name">Abarrotes Chabelita</div>
          <div className="pos-addr">Mar Ártico no.201, maza…</div>
        </div>
        <div className="pos-actions">
          <span className="heart">&hearts;</span>
          <span className="cart-badge">&#128722;<span className="count">8</span></span>
        </div>
      </div>

      <div className="search">
        <span>&#128269;</span>
        <span>Buscar</span>
      </div>

      <div className="banners">
        <div className="banner coca">
          <img src={cocacolaLogo} alt="Coca-Cola" />
        </div>
        <div className="banner bokados">
          <img src={bokadosLogo} alt="Bokados" />
        </div>
      </div>

      <div className="resurtir">
        <div className="resurtir-head">
          <div className="left">
            <span className="icon">&#129508;</span>
            <div>
              <h2>Vuelve a surtir</h2>
              <div className="sub">De pedidos anteriores, listos para reponer.</div>
            </div>
          </div>
          <span className="link">Ver todos &rsaquo;</span>
        </div>

        <div className="product-card">
          <div className="top">
            <span className="pieces-tag">4 PIEZAS</span>
            <span className="heart-out">&hearts;</span>
          </div>
          <div className="product-img">
            <img src={tetrapack} alt="Del Valle Durazno Tetra Pack 250 ml" />
          </div>
          <div className="name">Del Valle Durazno, Tetra Pack 250 ml, 4 Piezas</div>
          <div className="price">$39.50</div>
          <div className="pkg-label">Paquetes</div>
          <div className="qty-row">
            <input className="qty-input" type="number" inputMode="numeric" defaultValue={0} min="0" />
            <button className="qty-add" aria-label="Agregar">+</button>
          </div>
        </div>
      </div>

      <div className="subtotal-bar">
        <div>
          <div className="label">Subtotal :</div>
          <div className="amount">$1,369.49</div>
        </div>
        <span className="link">Ver descuentos &rsaquo;</span>
      </div>
    </>
  )
}
