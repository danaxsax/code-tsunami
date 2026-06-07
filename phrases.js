const phrases = [
  { text: 'Mira este descuento, aprovecha ahora', category: 'descuento' },
  { text: 'Esta semana tenemos ofertas increíbles en todos los productos', category: 'descuento' },
  { text: 'No dejes pasar esta promoción especial solo por hoy', category: 'descuento' },
  { text: 'Los mejores precios los encuentras aquí en Code Tsunami', category: 'promocion' },
  { text: '¿Necesitas ayuda? Estoy aquí para lo que necesites', category: 'ayuda' },
  { text: 'Puedes preguntarme sobre productos, precios y promociones', category: 'ayuda' },
  { text: 'Tu pedido está siendo procesado, en breve recibirás noticias', category: 'pedido' },
  { text: 'Recuerda que puedes acumular puntos con cada compra', category: 'gana' },
  { text: 'Los puntos que ganas los puedes canjear por descuentos exclusivos', category: 'gana' },
  { text: 'Bienvenido a Code Tsunami, tu tienda de confianza', category: 'bienvenida' },
  { text: 'Tenemos productos recién llegados, ven a conocerlos', category: 'producto' },
  { text: 'El envío es gratis en pedidos mayores a quinientos pesos', category: 'promocion' },
]

export function getRandomPhrase(category) {
  if (category) {
    const filtered = phrases.filter(p => p.category === category)
    return filtered[Math.floor(Math.random() * filtered.length)].text
  }
  return phrases[Math.floor(Math.random() * phrases.length)].text
}

export function getPhrasesByCategory(category) {
  return phrases.filter(p => p.category === category)
}

export default phrases
