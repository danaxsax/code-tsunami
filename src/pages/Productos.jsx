import HelloAvatar from "../components/HelloAvatar.jsx";
import monster from "../../images/monster.png";
import valle from "../../images/valle.png";

export default function Productos({ onAvatarClick }) {
  const categorias = [
    { emoji: "\u{1F964}", label: "Refrescos", type: "emoji" },
    { emoji: "\u{1F4A7}", label: "Agua", type: "emoji" },
    { emoji: "\u{1F379}", label: "Bebidas de fruta", type: "emoji" },
    { emoji: "\u{1F3B7}", label: "Deportivas", type: "emoji" },
    { emoji: "\u{1F6D2}", label: "Abarrotes comestibles", type: "circle" },
    { emoji: "\u{1F961}", label: "Abarrotes no comestibles", type: "circle" },
    { emoji: "\u26A1", label: "Bebidas con electrolitos", type: "emoji" },
    { image: valle, label: "Jugos y néctares", className: 'valle-img' },
    { emoji: "\u{1F373}", label: "Lácteos", type: "emoji" },
    { emoji: "\u{1F36C}", label: "Dulces y botanas", type: "emoji" },
    { image: monster, label: "Energeticos", className: 'monster-img' },
    { emoji: "\u{1F37C}", label: "Bebidas de soya", type: "emoji" },
    { emoji: "\u{1F373}", label: "Café", type: "emoji" },
    { emoji: "\u{1F36C}", label: "Otros", type: "emoji" },
  ];
  console.log(monster);
  console.log(valle);

  return (
    <div className="panel-pad">
      <HelloAvatar onClick={onAvatarClick} />
      <h2 className="section-title">Categorías</h2>
      <div className="cat-grid">
        {categorias.map((cat, i) => (
          <div className="cat-card" key={i}>
            {cat.image ? (
              <img src={cat.image} alt={cat.label} className={`cat-image ${cat.className || ''}`} />
            ) : cat.type === "circle" ? (
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
  );
}
