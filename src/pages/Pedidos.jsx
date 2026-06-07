import { useState } from 'react'
import HelloAvatar from '../components/HelloAvatar.jsx'
import cocacolaLogo from '../../assets/cocacola-logo.png'
import bokadosLogo from '../../assets/bokados-logo.png'

const filters = ['Todos', 'Activos', 'Entregados', 'Cancelados']

const orders = [
  {
    id: '81D7D688',
    ref: '3197201245',
    qty: '11 paquetes + 0 unidades',
    price: '$2,560.51',
    date: '4/jun/2026',
    status: 'Entregado',
    statusIcon: '\u2705',
    statusColor: '#2e9e4f',
  },
  {
    id: 'E2CBC2DD',
    ref: '3197455299',
    qty: '4 paquetes + 0 unidades',
    price: '$1,120.01',
    date: '4/jun/2026',
    status: 'Entregado',
    statusIcon: '\u2705',
    statusColor: '#2e9e4f',
  },
  {
    id: 'A91F0C34',
    ref: '3197890012',
    qty: '7 paquetes + 2 unidades',
    price: '$1,845.30',
    date: '3/jun/2026',
    status: 'En camino',
    statusIcon: '\u{1F69A}',
    statusColor: '#e08a00',
  },
]

export default function Pedidos({ onAvatarClick }) {
  const [activeFilter, setActiveFilter] = useState('Todos')

  return (
    <div className="panel-pad">
      <HelloAvatar onClick={onAvatarClick} />
      <h2 className="section-title">Pedidos Coca-Cola</h2>

      <div className="pedidos-banners">
        <div className="banner coca">
          <img src={cocacolaLogo} alt="Coca-Cola" />
        </div>
        <div className="banner bokados">
          <img src={bokadosLogo} alt="Bokados" />
        </div>
      </div>

      <div className="filters">
        {filters.map((f) => (
          <button
            key={f}
            className={`chip ${activeFilter === f ? 'active' : ''}`}
            onClick={() => setActiveFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="pedidos-month">
        <span>Junio 2026</span>
        <span>5 Pedidos</span>
      </div>

      {orders.map((order) => (
        <div className="order-card" key={order.id}>
          <div className="order-top">
            <div>
              <div className="order-no">No. de pedido: <b>{order.id}</b></div>
              <div className="order-ref">Referencia: {order.ref}</div>
            </div>
            <span className="order-info-icon">&#9432;</span>
          </div>
          <div className="order-body">
            <span className="order-truck">&#128666;</span>
            <div>
              <div className="order-qty">{order.qty}</div>
              <div className="order-price">{order.price}</div>
              <div className="order-date">Pedido el {order.date}</div>
            </div>
          </div>
          <div className="order-foot">
            <span className="order-status" style={{ color: order.statusColor }}>
              {order.statusIcon} {order.status}
            </span>
            <span className="link">Ver detalle &rsaquo;</span>
          </div>
        </div>
      ))}
    </div>
  )
}
