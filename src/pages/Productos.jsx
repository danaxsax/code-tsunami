export default function Productos() {
  const categorias = [
    { emoji: '\u{1F964}', label: 'Refrescos', type: 'emoji' },
    { emoji: '\u{1F4A7}', label: 'Agua', type: 'emoji' },
    { emoji: '\u{1F379}', label: 'Bebidas de fruta', type: 'emoji' },
    { emoji: '\u{1F3B7}', label: 'Deportivas', type: 'emoji' },
    { emoji: '\u{1F6D2}', label: 'Abarrotes comestibles', type: 'circle' },
    { emoji: '\u{1F961}', label: 'Abarrotes no comestibles', type: 'circle' },
    { emoji: '\u26A1', label: 'Bebidas con electrolitos', type: 'emoji' },
    { emoji: '\u{1F373}', label: 'Jugos y néctares', type: 'emoji' },
    { emoji: '\u{1F373}', label: 'Lácteos', type: 'emoji' },
    { emoji: '\u{1F36C}', label: 'Dulces y botanas', type: 'emoji' },
    { emoji: '\u2615', label: 'Café y bebidas calientes', type: 'emoji' },
    { emoji: '\u{1F37C}', label: 'Cuidado personal', type: 'emoji' },
  ]

  return (
    <div className="panel-pad">
      <h2 className="section-title">Categorías</h2>
      <div className="cat-grid">
        {categorias.map((cat, i) => (
          <div className="cat-card" key={i}>
            {cat.type === 'circle' ? (
              <div className="circle">{cat.emoji}</div>
            ) : (
              <div className="emoji">{cat.emoji}</div>
            )}
            <div className="label">{cat.label}</div>
          </div>
        ))}
      </div>

      <div className="subtotal-bar">
        <div>
          <div className="label">Subtotal :</div>
          <div className="amount">$2,239.49</div>
        </div>
        <span className="link">Ver descuentos &rsaquo;</span>
      </div>
    </div>
  )
}
