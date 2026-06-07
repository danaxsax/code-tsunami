import HelloAvatar from "../components/HelloAvatar.jsx";
import monster from "../../images/monster.png";
import valle from "../../images/valle.png";
import refrescos from "../../assets/refrescos.png";
import agua from "../../assets/agua.png";
import bebidasFrutales from "../../assets/bebidas-frutales.jpg";
import deportivas from "../../assets/deportivas.jpg";
import bebidasElectrolitos from "../../assets/bebidas-con-electrolitos.jpg";
import lacteos from "../../assets/lacteos.jpg";
import soya from "../../assets/soya.jpg";
import cafe from "../../assets/cafe.jpg";

export default function Productos({ onAvatarClick }) {
  const categorias = [
    { image: refrescos, label: "Refrescos" },
    { image: agua, label: "Agua" },
    { image: bebidasFrutales, label: "Bebidas de fruta" },
    { image: deportivas, label: "Deportivas" },
    { emoji: "\u{1F6D2}", label: "Abarrotes comestibles", type: "circle" },
    { emoji: "\u{1F961}", label: "Abarrotes no comestibles", type: "circle" },
    { image: bebidasElectrolitos, label: "Bebidas con electrolitos" },
    { image: valle, label: "Jugos y néctares", className: "valle-img" },
    { image: lacteos, label: "Lácteos" },
    { image: monster, label: "Energeticos", className: "monster-img" },
    { image: soya, label: "Bebidas de soya" },
    { image: cafe, label: "Café" },
    { emoji: "\u{1F36C}", label: "Otros", type: "emoji" },
  ];

  return (
    <div className="panel-pad">
      <HelloAvatar
        onClick={onAvatarClick}
        phrases={[
          'Dime, ¿qué buscas?',
          '¿Algo refrescante? ¡mira este producto!',
          'Encuentro lo que necesites',
          '¿Cómo ganar más? ¡yo te cuento!',
        ]}
      />
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
