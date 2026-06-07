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
  const [showEvalOverlay, setShowEvalOverlay] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [evalData, setEvalData] = useState({
    generalRating: 0,
    onTime: null,
    appRating: 0,
    condition: '',
    comments: '',
    aiUseful: null,
    aiSatisfaction: 0,
    aiComments: '',
  })

  function openEvaluation(order) {
    setSelectedOrder(order)
    setShowEvalOverlay(true)
    setEvalData({
      generalRating: 0,
      onTime: null,
      appRating: 0,
      condition: '',
      comments: '',
      aiUseful: null,
      aiSatisfaction: 0,
      aiComments: '',
    })
  }

  function handleEvalSubmit() {
    // Simulate submission
    console.log('Eval submitted:', evalData)
    setShowEvalOverlay(false)
    alert(`¡Gracias por evaluar el pedido ${selectedOrder.id}! Tu feedback nos ayuda a mejorar.`)
  }

  const filteredOrders = orders.filter((o) => {
    if (activeFilter === 'Todos') return true
    if (activeFilter === 'Activos') return o.status === 'En camino'
    if (activeFilter === 'Entregados') return o.status === 'Entregado'
    if (activeFilter === 'Cancelados') return o.status === 'Cancelado'
    return true
  })

  return (
    <div className="panel-pad" style={{ paddingBottom: '40px' }}>
      <HelloAvatar
        onClick={onAvatarClick}
        phrases={[
          '¿Cuál fue la experiencia de tu último pedido?',
          'Tu próxima entrega es el 10 de junio',
          'Tu promotor te visitará mañana',
          '¿Te sugiero un pedido?',
        ]}
      />
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
        <span>{filteredOrders.length} Pedidos</span>
      </div>

      {filteredOrders.map((order) => (
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
          <div className="order-foot" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="order-status" style={{ color: order.statusColor }}>
                {order.statusIcon} {order.status}
              </span>
              <span className="link">Ver detalle &rsaquo;</span>
            </div>
            {order.status === 'Entregado' && (
              <button className="eval-btn" onClick={() => openEvaluation(order)}>
                &#11088; Evaluar servicio
              </button>
            )}
          </div>
        </div>
      ))}

      {showEvalOverlay && selectedOrder && (
        <div className="tiktok-feed-overlay" role="dialog" aria-modal="true">
          <div className="tiktok-feed-shell upload-shell" style={{ height: 'auto', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="tiktok-feed-header">
              <div>
                <span>Encuesta de Satisfacción</span>
                <strong>Pedido {selectedOrder.id}</strong>
              </div>
              <button onClick={() => setShowEvalOverlay(false)}>X</button>
            </div>

            <div className="eval-content" style={{ padding: '20px', textAlign: 'left' }}>
              <div className="eval-group">
                <label>¿Cómo evalúas la llegada de tu pedido?</label>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      className={evalData.generalRating >= s ? 'active' : ''}
                      onClick={() => setEvalData({ ...evalData, generalRating: s })}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="eval-group">
                <label>¿Se te entregó a tiempo?</label>
                <div className="bool-options">
                  <button
                    className={evalData.onTime === true ? 'active' : ''}
                    onClick={() => setEvalData({ ...evalData, onTime: true })}
                  >
                    Sí
                  </button>
                  <button
                    className={evalData.onTime === false ? 'active' : ''}
                    onClick={() => setEvalData({ ...evalData, onTime: false })}
                  >
                    No
                  </button>
                </div>
              </div>

              <div className="eval-group">
                <label>¿Cómo evalúas el proceso de compra en la App?</label>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      className={evalData.appRating >= s ? 'active' : ''}
                      onClick={() => setEvalData({ ...evalData, appRating: s })}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="eval-group">
                <label>Condición de los productos</label>
                <select
                  value={evalData.condition}
                  onChange={(e) => setEvalData({ ...evalData, condition: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
                >
                  <option value="">Selecciona una opción</option>
                  <option value="Excelente">Excelente estado</option>
                  <option value="Bueno">Buen estado</option>
                  <option value="Dañado">Algunos empaques dañados</option>
                  <option value="Equivocado">Productos equivocados</option>
                  <option value="Faltante">Faltó producto</option>
                </select>
              </div>

              <div className="eval-group">
                <label>Comentarios adicionales</label>
                <textarea
                  rows="3"
                  placeholder="Cuéntanos más sobre tu experiencia..."
                  value={evalData.comments}
                  onChange={(e) => setEvalData({ ...evalData, comments: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', resize: 'none' }}
                />
              </div>

              <div className="eval-group" style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
                <label>¿Te fue útil el agente IA Ali para este pedido?</label>
                <div className="bool-options">
                  <button
                    className={evalData.aiUseful === true ? 'active' : ''}
                    onClick={() => setEvalData({ ...evalData, aiUseful: true })}
                  >
                    Sí, mucho
                  </button>
                  <button
                    className={evalData.aiUseful === false ? 'active' : ''}
                    onClick={() => setEvalData({ ...evalData, aiUseful: false })}
                  >
                    No realmente
                  </button>
                </div>
                {evalData.aiUseful === false && (
                  <div className="feedback-comment-area" style={{ marginTop: '12px' }}>
                    <textarea
                      rows="2"
                      placeholder="¿Qué podemos mejorar del agente Ali?"
                      value={evalData.aiComments}
                      onChange={(e) => setEvalData({ ...evalData, aiComments: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', resize: 'none' }}
                    />
                  </div>
                )}
              </div>

              <div className="eval-group">
                <label>Satisfacción general con el agente Ali</label>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      className={evalData.aiSatisfaction >= s ? 'active' : ''}
                      onClick={() => setEvalData({ ...evalData, aiSatisfaction: s })}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <button className="upload-submit-btn" style={{ width: '100%', marginTop: '10px' }} onClick={handleEvalSubmit}>
                Enviar Evaluación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
