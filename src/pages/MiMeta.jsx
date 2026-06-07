import { useMemo, useRef, useState } from 'react'
import HelloAvatar from '../components/HelloAvatar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import pedidoIcon from '../../assets/pedido.png'
import ticketIcon from '../../assets/ticket.png'
import comboIcon from '../../assets/combo.png'
import metaIcon from '../../assets/meta.png'
import socialIcon from '../../assets/social.png'
import sieteDiasIcon from '../../assets/7 dias.png'
import promoIcon from '../../assets/promo.png'
import surtidoIcon from '../../assets/surtido.png'
import topIcon from '../../assets/top.png'
import { speak, stopSpeaking } from '../services/tts.js'
import vipProfile from '../../agente-tuali/Casos Principales/1_0012Eplus18.json'
import nicheProfile from '../../agente-tuali/Casos Principales/1_00004Eplus18.json'
import recurrentProfile from '../../agente-tuali/Casos Principales/3_87064Eplus17.json'
import occasionalProfile from '../../agente-tuali/Casos Principales/ocasional_sample.json'
import volumeProfile from '../../agente-tuali/Casos Principales/volumen_sample.json'

const profileModules = {
  '1_0012Eplus18': vipProfile,
  '1_00004Eplus18': nicheProfile,
  '3_87064Eplus17': recurrentProfile,
  ocasional_sample: occasionalProfile,
  volumen_sample: volumeProfile,
}

const DEFAULT_PROFILE_FILE = '1_0012Eplus18'
const pathStepImages = [metaIcon, pedidoIcon, comboIcon, promoIcon, socialIcon, surtidoIcon, topIcon]

const goalCatalog = {
  'Aumentar promedio de ticket': {
    icon: 'UP',
    image: ticketIcon,
    color: '#b91d33',
    description: 'Sube el valor de cada pedido con combos y productos complementarios.',
    impactLabel: 'Ticket estimado',
  },
  Diversificacion: {
    icon: '4X',
    image: surtidoIcon,
    color: '#6c2bd9',
    description: 'Reduce dependencia de un solo producto y abre nuevas categorias.',
    impactLabel: 'Variedad estimada',
  },
  'Incrementar Pedidos': {
    icon: '$',
    image: metaIcon,
    color: '#0f8f5f',
    description: 'Aumenta la frecuencia con recordatorios y recompra rapida.',
    impactLabel: 'Venta estimada',
  },
  'Aplicar Promociones': {
    icon: '%',
    image: promoIcon,
    color: '#006bb6',
    description: 'Usa promociones en productos clave sin complicar el pedido.',
    impactLabel: 'Ahorro estimado',
  },
  'Crear Combos': {
    icon: '+',
    image: comboIcon,
    color: '#f07c00',
    description: 'Une productos frecuentes para vender mas con una sola accion.',
    impactLabel: 'Combo estimado',
  },
  Activacion: {
    icon: 'GO',
    color: '#006bb6',
    description: 'Reactiva compras con una recomendacion simple y de bajo riesgo.',
    impactLabel: 'Recompra estimada',
  },
}

const goalRoadmaps = {
  'Aumentar promedio de ticket': [
    { label: 'Mira que se vende junto', desc: 'Revisa que productos suelen llevar tus clientes en el mismo pedido.' },
    { label: 'Arma un combo facil', desc: 'Junta productos que hagan sentido, como refresco con botana.' },
    { label: 'Ofrecelo en caja', desc: 'Cuando cobres, menciona el combo con una frase corta.' },
    { label: 'Revisa si subio el pedido', desc: 'Compara si tus clientes estan comprando un poco mas.' },
    { label: 'Repite lo que funciono', desc: 'Deja fijo el combo que mas se venda.' },
  ],
  Diversificacion: [
    { label: 'Busca lo que falta', desc: 'Piensa que productos te piden y todavia no tienes.' },
    { label: 'Elige pocos productos', desc: 'Empieza con 2 o 3 productos para probar.' },
    { label: 'Ponlos donde se vean', desc: 'Ubica los productos cerca del mostrador o donde pase mas gente.' },
    { label: 'Haz una promo pequena', desc: 'Ofrece una prueba o descuento sencillo.' },
    { label: 'Revisa si se venden', desc: 'Si se venden bien, dejalos en tu tienda.' },
  ],
  'Incrementar Pedidos': [
    { label: 'Cuenta tus basicos', desc: 'Revisa rapido que no falte lo que mas vendes.' },
    { label: 'Pon un recordatorio', desc: 'Pide antes de quedarte sin producto.' },
    { label: 'Haz pedido con tiempo', desc: 'Ordena antes del dia fuerte de ventas.' },
    { label: 'Revisa que llego todo', desc: 'Confirma que tu pedido llego completo.' },
    { label: 'Evita ventas perdidas', desc: 'Mide cuanto vendiste por tener producto disponible.' },
  ],
  'Aplicar Promociones': [
    { label: 'Elige una promo buena', desc: 'Escoge una oferta de productos que tus clientes si compran.' },
    { label: 'Revisa tu ganancia', desc: 'Confirma que la promo todavia te deje dinero.' },
    { label: 'Pon un cartel claro', desc: 'Coloca un cartel facil de leer.' },
    { label: 'Avisale a tus clientes', desc: 'Cuentales la promo por WhatsApp o en la tienda.' },
    { label: 'Mira si vendiste mas', desc: 'Revisa si vendiste mas piezas que antes.' },
  ],
  'Crear Combos': [
    { label: 'Junta productos amigos', desc: 'Elige productos que se antojan juntos, como bebida y botana.' },
    { label: 'Pon precio atractivo', desc: 'Haz que el combo se sienta conveniente para el cliente.' },
    { label: 'Que se vea armado', desc: 'Usa ligas o bolsas para que el combo se vea como uno solo.' },
    { label: 'Ten combos listos', desc: 'Manten algunos combos preparados cerca del mostrador.' },
    { label: 'Cambia el combo', desc: 'Prueba otro combo cada 15 dias para mantener el interes.' },
  ],
  Activacion: [
    { label: 'Mira quien dejo de venir', desc: 'Piensa que clientes antes venian seguido y ya no han vuelto.' },
    { label: 'Prepara un beneficio', desc: 'Dales una razon sencilla para regresar.' },
    { label: 'Mandales mensaje', desc: 'Usa WhatsApp o invitalos cuando pasen cerca.' },
    { label: 'Cuida su regreso', desc: 'Asegura que encuentren lo que necesitan.' },
    { label: 'Haz que vuelvan', desc: 'Si regresan, ofrece algo para su siguiente visita.' },
  ],
}

const profileCopy = {
  VIP: 'Tus pedidos suelen ser buenos. Tuali te ayuda a vender un poco mas en cada pedido.',
  Recurrente: 'Compras seguido. Tuali te ayuda a encontrar productos nuevos sin cambiar tu rutina.',
  Nicho: 'Vendes mucho de pocos productos. Tuali te ayuda a sumar opciones sin arriesgar de mas.',
  Ocasional: 'Compras de vez en cuando. Tuali te ayuda a retomar pedidos faciles.',
  Volumen: 'Puedes pedir con mas orden. Tuali te ayuda a no quedarte sin tus basicos.',
}

const customGoalTypes = [
  'Aumentar ventas',
  'Subir ticket promedio',
  'Mejorar surtido',
  'Ganar mas puntos',
  'Reactivar compras',
  'Ahorrar en promociones',
  'Otra meta personalizada',
]

const socialMissionSeed = [
  {
    id: 'tiktok-combo',
    title: 'Sube un TikTok con tu combo estrella',
    reason: 'Ayuda a que mas clientes conozcan tu tienda y tus promociones.',
    reward: '+120 pts',
    time: '3 dias',
    status: 'disponible',
  },
  {
    id: 'story-store',
    title: 'Comparte un reel de tu tienda',
    reason: 'Promueve tu punto de venta fuera de la app.',
    reward: '+80 pts',
    time: '24 h',
    status: 'disponible',
  },
  {
    id: 'display-photo',
    title: 'Toma foto de tu exhibidor completo',
    reason: 'Mejora la visibilidad de productos de alta rotacion.',
    reward: '+60 pts',
    time: '5 dias',
    status: 'completada',
  },
  {
    id: 'poster-counter',
    title: 'Coloca un cartel de promo en mostrador',
    reason: 'Hace visible la oferta justo al momento de compra.',
    reward: '+70 pts',
    time: '2 dias',
    status: 'disponible',
  },
]

const tiktokParticipants = [
  {
    store: 'Abarrotes Lupita',
    cluster: 'VIP',
    points: '+120 pts',
    caption: 'Combo Coca-Cola + botana listo para el recreo',
    handle: '@abarroteslupita',
    url: 'https://vt.tiktok.com/ZSQ2RbeEm/',
  },
  {
    store: 'Mini Super El Sol',
    cluster: 'VIP',
    points: '+120 pts',
    caption: 'Promocion de combo estrella en mostrador',
    handle: '@minisuperelsol',
    url: 'https://vt.tiktok.com/ZSQ2RpNha/',
  },
  {
    store: 'Tienda Aurora',
    cluster: 'Nicho',
    points: '+90 pts',
    caption: 'Nuevo surtido para clientes de la tarde',
    handle: '@tiendaaurora',
    url: 'https://vt.tiktok.com/ZSQ2RUYhh/',
  },
  {
    store: 'Miscelanea La 20',
    cluster: 'Recurrente',
    points: '+80 pts',
    caption: 'Exhibidor completo y combo recomendado',
    handle: '@miscelanea20',
    url: 'https://vt.tiktok.com/ZSQ2RCU8k/',
  },
]

const instagramParticipants = [
  {
    store: 'Abarrotes El Sol',
    cluster: 'Recurrente',
    points: '+80 pts',
    caption: 'Mostrando mi tienda en un reel',
    handle: '@elsol_tienda',
    url: 'https://www.instagram.com/reel/DNOxTOopp1h/?hl=es',
  },
  {
    store: 'Tienda La Bendicion',
    cluster: 'Nicho',
    points: '+80 pts',
    caption: 'Vengan por sus promos!',
    handle: '@labendicion_tienda',
    url: 'https://www.instagram.com/reel/DDxNYNVuuol/',
  },
  {
    store: 'Mini Super Don Juan',
    cluster: 'VIP',
    points: '+80 pts',
    caption: 'Mi reel diario',
    handle: '@donjuan_super',
    url: 'https://www.instagram.com/reel/DJDFPI0PrCf/',
  },
]

const clusterRankings = {
  VIP: {
    challenge: 'Reto: sube tu ticket promedio 10%',
    prize: 'Premio: 450 puntos y combo destacado',
    ranking: [
      { store: 'Abarrotes Lupita', progress: 92 },
      { store: 'Mini Super El Sol', progress: 78 },
      { store: 'Abarrotes Chabelita', progress: 62, me: true },
      { store: 'Tienda La Esperanza', progress: 54 },
      { store: 'Miscelanea El Amigo', progress: 48 },
    ],
  },
  Nicho: {
    challenge: 'Reto: suma 2 categorias nuevas',
    prize: 'Premio: 300 puntos y promocion sugerida',
    ranking: [
      { store: 'Miscelanea La 20', progress: 84 },
      { store: 'Abarrotes Chabelita', progress: 64, me: true },
      { store: 'Tienda Don Pepe', progress: 58 },
      { store: 'Abarrotes El Paso', progress: 51 },
      { store: 'Super Neto', progress: 45 },
    ],
  },
  Recurrente: {
    challenge: 'Reto: completa 3 pedidos esta semana',
    prize: 'Premio: 350 puntos y reto bonus',
    ranking: [
      { store: 'Mini Super El Sol', progress: 88 },
      { store: 'Abarrotes Lupita', progress: 72 },
      { store: 'Abarrotes Chabelita', progress: 61, me: true },
      { store: 'Tienda Aurora', progress: 55 },
      { store: 'Miscelanea La 20', progress: 49 },
    ],
  },
  Ocasional: {
    challenge: 'Reto: reactiva tu pedido en 7 dias',
    prize: 'Premio: 220 puntos y descuento de recompra',
    ranking: [
      { store: 'La Esquina', progress: 76 },
      { store: 'Abarrotes Chabelita', progress: 48, me: true },
      { store: 'Tienda Aurora', progress: 42 },
      { store: 'Abarrotes Don Memo', progress: 38 },
      { store: 'Mini Super Express', progress: 31 },
    ],
  },
}

function normalizeText(value = '') {
  return String(value)
    .replaceAll('DiversificaciÃ³n', 'Diversificacion')
    .replaceAll('DiversificaciÃƒÂ³n', 'Diversificacion')
    .replaceAll('Diversificación', 'Diversificacion')
    .replaceAll('ActivaciÃ³n', 'Activacion')
    .replaceAll('ActivaciÃƒÂ³n', 'Activacion')
    .replaceAll('Activación', 'Activacion')
    .replaceAll('MÃ©xico', 'Mexico')
    .replaceAll('MÃƒÂ©xico', 'Mexico')
    .replaceAll('PerÃº', 'Peru')
    .replaceAll('MÃ¡s', 'Mas')
    .replaceAll('mÃ¡s', 'mas')
    .replaceAll('dÃ­as', 'dias')
    .replaceAll('categorÃ­as', 'categorias')
}

function money(value) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)
}

function findLoggedProfile() {
  const configuredId = localStorage.getItem('tuali_customer_profile') || import.meta.env.VITE_CUSTOMER_PROFILE || DEFAULT_PROFILE_FILE
  const data = profileModules[configuredId] || profileModules[DEFAULT_PROFILE_FILE]

  return {
    fileName: profileModules[configuredId] ? configuredId : DEFAULT_PROFILE_FILE,
    data,
  }
}

function getGoalMeta(goal) {
  const goalType = normalizeText(goal.tipo)
  return goalCatalog[goalType] || {
    icon: 'AI',
    color: '#b91d33',
    description: 'Meta personalizada generada a partir del historial del cliente.',
    impactLabel: 'Impacto estimado',
  }
}

function buildGoalPlan(profile) {
  const metricas = profile.metricas_base || {}
  const goals = (profile.metas || []).map((goal) => ({
    ...goal,
    tipo: normalizeText(goal.tipo),
    prioridad: normalizeText(goal.prioridad),
    datos_asociados: goal.datos_asociados || {},
  }))

  const preferred =
    goals.find((goal) => goal.prioridad === 'Alta' && goal.tipo === 'Aumentar promedio de ticket') ||
    goals.find((goal) => goal.prioridad === 'Alta') ||
    goals[0]

  const related = {
    diversification: goals.find((goal) => goal.tipo === 'Diversificacion'),
    frequency: goals.find((goal) => goal.tipo === 'Incrementar Pedidos'),
    promotion: goals.find((goal) => goal.tipo === 'Aplicar Promociones'),
    combo: goals.find((goal) => goal.tipo === 'Crear Combos'),
    activation: goals.find((goal) => goal.tipo === 'Activacion'),
  }

  const topSku =
    normalizeText(related.diversification?.datos_asociados?.sku_concentracion) ||
    normalizeText(related.promotion?.datos_asociados?.top_sku_para_promo) ||
    'tu producto principal'
  const comboProducts = related.combo?.datos_asociados?.productos_frecuentes?.map(normalizeText) || [topSku, 'producto complementario']
  const ticket = Number(metricas.ticket_promedio) || 0
  const targetTicket = ticket ? ticket * 1.1 : 250
  const frequency = related.frequency?.datos_asociados?.frecuencia_actual || metricas.frecuencia || 1
  const targetFrequency = related.frequency?.datos_asociados?.target_frecuencia || Number(frequency) + 1
  const categories = related.diversification?.datos_asociados?.categorias_actuales || 2
  const shareTop = parseFloat(related.diversification?.datos_asociados?.share_producto_top) || (metricas.score_nicho || 0) * 100
  const isActivation = preferred?.tipo === 'Activacion'
  const progress = isActivation ? 24 : Math.min(78, Math.max(35, Math.round(100 - shareTop / 2)))
  const meta = getGoalMeta(preferred || {})

  const recommendations = [
    {
      tag: related.combo ? 'Combo inteligente' : 'Accion principal',
      title: related.combo ? `${comboProducts[0]} + ${comboProducts[1]}` : `Impulsa ${topSku}`,
      reason: related.combo
        ? `Estos productos ya se compran seguido. Juntarlos ayuda a que el pedido suba sin cambiar mucho tu rutina.`
        : `${topSku} es una buena oportunidad para vender un poco mas esta semana.`,
      impact: ticket ? `+${money(ticket * 0.07)} por pedido` : '+1 accion sencilla',
      points: '+16 puntos',
    },
    {
      tag: related.diversification ? 'Diversificacion' : 'Surtido',
      title: `Reduce dependencia de ${topSku}`,
      reason: related.diversification
        ? `Hoy vendes mucho de ${topSku}. Prueba sumar otros productos sin dejar tus basicos.`
        : 'Tuali te sugiere productos parecidos a lo que ya vendes para probar sin arriesgar de mas.',
      impact: `de ${categories} a ${Number(categories) + 2} categorias`,
      points: '+14 puntos',
    },
    {
      tag: related.promotion ? 'Promocion aplicada' : 'Siguiente pedido',
      title: related.promotion ? `Promo en ${normalizeText(related.promotion.datos_asociados.top_sku_para_promo)}` : `Programa pedido ${targetFrequency}`,
      reason: related.promotion
        ? 'Esta promo puede ayudar a que tus clientes vuelvan por un producto que ya conocen.'
        : `Hoy haces ${frequency} pedido. La idea es llegar a ${targetFrequency} sin quedarte sin producto.`,
      impact: related.frequency ? `${frequency} a ${targetFrequency} pedidos` : '+12% recompra',
      points: '+12 puntos',
    },
  ]

  return {
    activeGoal: {
      title: preferred?.tipo || 'Meta personalizada',
      priority: preferred?.prioridad || 'Alta',
      icon: meta.icon,
      color: meta.color,
      description: meta.description,
      current: preferred?.tipo === 'Incrementar Pedidos' ? `${frequency} pedidos` : money(ticket),
      target: preferred?.tipo === 'Incrementar Pedidos' ? `${targetFrequency} pedidos` : money(targetTicket),
      progress,
      missing: preferred?.tipo === 'Incrementar Pedidos' ? `${Number(targetFrequency) - Number(frequency)} pedido` : `${money(targetTicket - ticket)} por pedido`,
      impactLabel: meta.impactLabel,
      impactValue: preferred?.tipo === 'Diversificacion' ? `+${Number(categories) + 2 - Number(categories)} categorias` : money(ticket * 1.07),
      points: '+42',
    },
    goals,
    recommendations,
  }
}

function buildAchievements({ acceptedCount, customGoalsCount, completedSocialCount, profile }) {
  return [
    { id: 'first-order', label: 'Pedido', image: pedidoIcon, color: '#ff7a3d', unlocked: acceptedCount >= 1 },
    { id: 'combo', label: 'Combo', image: comboIcon, color: '#7ac943', unlocked: acceptedCount >= 1 },
    { id: 'goal', label: 'Meta', image: metaIcon, color: '#b965f2', unlocked: customGoalsCount > 0 },
    { id: 'social', label: 'Social', image: socialIcon, color: '#ff4b4b', unlocked: completedSocialCount > 0 },
    { id: 'seven', label: '7 dias', image: sieteDiasIcon, color: '#34a7e8', unlocked: true },
    { id: 'promo', label: 'Promo', image: promoIcon, color: '#83c441', unlocked: acceptedCount >= 2 },
    { id: 'surtido', label: 'Surtido', image: surtidoIcon, color: '#7b61ff', unlocked: profile.perfil === 'Nicho' || acceptedCount >= 2 },
    { id: 'top', label: 'Top', image: topIcon, color: '#ff6542', unlocked: acceptedCount >= 3 },
  ]
}

function buildGoalPath(selectedGoal, profile) {
  const title = selectedGoal?.title || selectedGoal?.tipo || 'Meta de crecimiento'
  const topGoal = normalizeText(title)
  const ticket = Number(profile.metricas_base?.ticket_promedio) || 0
  const frequency = profile.metricas_base?.frecuencia || 1

  const ticketCopy = [
    { label: 'Mira que se vende junto', detail: `Tu pedido promedio va en ${money(ticket)}. Revisa que productos suelen llevar juntos tus clientes, como agua con botana o refresco con snack.`, reward: '+8 pts', status: 'done' },
    { label: 'Arma una promo sencilla', detail: 'Haz una oferta facil de entender, por ejemplo: "Lleva 3 y ahorra". Asi el cliente compra un poco mas sin sentirlo pesado.', reward: '+14 pts', status: 'active' },
    { label: 'Revisa tu ganancia', detail: 'Antes de aceptar la promo, confirma que el descuento todavia te deje buena ganancia.', reward: '+18 pts', status: 'locked' },
    { label: 'Repite lo que funciono', detail: 'Si la promo sube tus ventas, guardala para volver a usarla en tus proximos pedidos.', reward: '+22 pts', status: 'locked' },
  ]

  const pathLibrary = {
    'Aumentar promedio de ticket': ticketCopy,
    'Subir ticket promedio': ticketCopy,
    Diversificacion: [
      { label: 'Mira que te falta', detail: 'Revisa si tus clientes te piden productos que todavia no tienes. Empieza por algo facil de vender.', reward: '+8 pts', status: 'done' },
      { label: 'Prueba pocos productos', detail: 'Agrega 2 productos nuevos, no muchos. Asi pruebas sin gastar de mas.', reward: '+14 pts', status: 'active' },
      { label: 'Ponlos donde se vean', detail: 'Colocalos cerca del mostrador o junto a productos que ya se venden bien.', reward: '+18 pts', status: 'locked' },
      { label: 'Deja los que si se venden', detail: 'Si un producto se mueve bien, dejalo fijo. Si no se vende, cambialo por otra opcion.', reward: '+22 pts', status: 'locked' },
    ],
    'Incrementar Pedidos': [
      { label: 'Cuenta tus basicos', detail: `Hoy haces alrededor de ${frequency} pedido por periodo. Revisa que no falte lo que mas vendes antes del fin de semana.`, reward: '+8 pts', status: 'done' },
      { label: 'Pide antes de quedarte sin producto', detail: 'Haz tu pedido con tiempo para no perder ventas por falta de refrescos, botanas o agua.', reward: '+14 pts', status: 'active' },
      { label: 'Confirma que llego todo', detail: 'Cuando recibas el pedido, revisa rapido que este completo y acomoda primero lo que mas se vende.', reward: '+18 pts', status: 'locked' },
      { label: 'Mantente surtida', detail: 'Si te funciono pedir antes, repitelo cada semana para no quedarte corta.', reward: '+22 pts', status: 'locked' },
    ],
    'Aplicar Promociones': [
      { label: 'Elige una promo buena', detail: 'Escoge una promo de productos que tus clientes si compran, no solo la que se ve mas barata.', reward: '+8 pts', status: 'done' },
      { label: 'Revisa tu ganancia', detail: 'Antes de aplicarla, confirma que todavia te deje dinero despues del descuento.', reward: '+14 pts', status: 'active' },
      { label: 'Pon un cartel claro', detail: 'Escribe la promo grande y facil de leer. Ponla cerca del mostrador o donde este el producto.', reward: '+18 pts', status: 'locked' },
      { label: 'Mira si vendiste mas', detail: 'Al final del dia, revisa si se movieron mas piezas que antes. Si funciono, repitela.', reward: '+22 pts', status: 'locked' },
    ],
    'Crear Combos': [
      { label: 'Junta productos amigos', detail: 'Elige productos que se antojan juntos, como bebida y botana.', reward: '+8 pts', status: 'done' },
      { label: 'Pon precio atractivo', detail: 'Haz que el combo se sienta conveniente para el cliente y claro para ti.', reward: '+14 pts', status: 'active' },
      { label: 'Ten combos listos', detail: 'Deja algunos combos preparados cerca del mostrador para venderlos rapido.', reward: '+18 pts', status: 'locked' },
      { label: 'Cambia el combo', detail: 'Prueba otro combo cada 15 dias para que tus clientes vean algo nuevo.', reward: '+22 pts', status: 'locked' },
    ],
    Activacion: [
      { label: 'Piensa quien dejo de venir', detail: 'Identifica clientes que antes compraban seguido y ya no han regresado.', reward: '+8 pts', status: 'done' },
      { label: 'Prepara un beneficio', detail: 'Dales una razon sencilla para volver, como una promo pequena o un combo especial.', reward: '+14 pts', status: 'active' },
      { label: 'Mandales un mensaje', detail: 'Usa WhatsApp o una invitacion directa para contarles que tienes algo para ellos.', reward: '+18 pts', status: 'locked' },
      { label: 'Cuida su regreso', detail: 'Cuando vuelvan, asegurate de que encuentren el producto listo y una buena atencion.', reward: '+22 pts', status: 'locked' },
    ],
  }

  return pathLibrary[topGoal] || [
    { label: 'Elige tu meta', detail: selectedGoal?.objective || 'Convierte tu meta en una accion sencilla para hacer hoy.', reward: '+8 pts', status: 'done' },
    { label: 'Haz el primer paso', detail: 'Empieza con una accion pequena que puedas probar en tu tienda hoy.', reward: '+14 pts', status: 'active' },
    { label: 'Revisa como te fue', detail: 'Mira si vendiste mas, si ahorraste o si tus clientes respondieron bien.', reward: '+18 pts', status: 'locked' },
    { label: 'Repite lo bueno', detail: 'Si funciono, guardalo como parte de tu rutina.', reward: '+22 pts', status: 'locked' },
  ]
}

function applyGoalPathProgress(steps, activeIndex = 0) {
  return steps.map((step, index) => ({
    ...step,
    status: index < activeIndex ? 'done' : index === activeIndex ? 'active' : 'locked',
  }))
}

export default function MiMeta({ onAvatarClick }) {
  const { storeName } = useAuth()
  const [accepted, setAccepted] = useState(['Combo inteligente'])
  const [feedback, setFeedback] = useState('')
  const [feedbackType, setFeedbackType] = useState(null) // 'positive' or 'negative'
  const [showCommentBox, setShowCommentBox] = useState(false)
  const [socialMissions, setSocialMissions] = useState(socialMissionSeed)
  const [showTikTokFeed, setShowTikTokFeed] = useState(false)
  const [showInstagramFeed, setShowInstagramFeed] = useState(false)
  const [showUploadMenu, setShowUploadMenu] = useState(false)
  const [showFullRanking, setShowFullRanking] = useState(false)
  const [dismissedTags, setDismissedTags] = useState([])
  const [selectedGoalPath, setSelectedGoalPath] = useState(null)
  const [pathCoach, setPathCoach] = useState('')
  const [isPathCoachLoading, setIsPathCoachLoading] = useState(false)
  const [pathChatMessages, setPathChatMessages] = useState([])
  const [pathChatInput, setPathChatInput] = useState('')
  const [isPathAgentSending, setIsPathAgentSending] = useState(false)
  const [activePathStepIndex, setActivePathStepIndex] = useState(0)
  const [readingPathStepIndex, setReadingPathStepIndex] = useState(null)
  const [customGoals, setCustomGoals] = useState([])
  const [customDraft, setCustomDraft] = useState({
    type: 'Subir ticket promedio',
    objective: '',
    deadline: '',
    customName: '',
  })
  const pathReadIdRef = useRef(0)

  const loggedProfile = useMemo(findLoggedProfile, [])
  const profile = loggedProfile.data
  const plan = useMemo(() => buildGoalPlan(profile), [profile])
  const goal = plan.activeGoal
  const completedSocialCount = socialMissions.filter((mission) => mission.status === 'completada').length
  const achievements = buildAchievements({
    acceptedCount: accepted.length,
    customGoalsCount: customGoals.length,
    completedSocialCount,
    profile,
  })
  const competition = (() => {
    const base = clusterRankings[profile.perfil] || clusterRankings.Recurrente
    return {
      ...base,
      ranking: base.ranking.map((item) =>
        item.me ? { ...item, store: storeName } : item
      ),
    }
  })()
  const myPosition = competition.ranking.findIndex((item) => item.me) + 1
  const goalPathSteps = selectedGoalPath?.steps || []
  const goalPathProgress = Math.round((goalPathSteps.filter((step) => step.status === 'done').length / Math.max(goalPathSteps.length, 1)) * 100)

  function toggleRecommendation(tag) {
    setAccepted((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag],
    )
  }

  function createCustomGoal(event) {
    event.preventDefault()
    const title = customDraft.type === 'Otra meta personalizada'
      ? customDraft.customName.trim()
      : customDraft.type
    if (!title || !customDraft.objective.trim()) return

    setCustomGoals((current) => [
      {
        id: `${Date.now()}`,
        title,
        objective: customDraft.objective.trim(),
        deadline: customDraft.deadline || 'Esta semana',
        progress: 8,
        active: current.length === 0,
      },
      ...current,
    ])
    setCustomDraft({
      type: 'Subir ticket promedio',
      objective: '',
      deadline: '',
      customName: '',
    })
  }

  function activateCustomGoal(id) {
    setCustomGoals((current) => current.map((item) => ({ ...item, active: item.id === id })))
  }

  function advanceSocialMission(id) {
    setSocialMissions((current) =>
      current.map((mission) => {
        if (mission.id !== id) return mission
        if (mission.status === 'disponible') return { ...mission, status: 'en progreso' }
        if (mission.status === 'en progreso') return { ...mission, status: 'completada' }
        return mission
      }),
    )
  }

  function handleSocialMissionClick(id) {
    const mission = socialMissions.find((m) => m.id === id)
    if (id === 'story-store' && mission?.status === 'disponible') {
      setShowInstagramFeed(true)
    }
    if (id === 'poster-counter' && mission?.status === 'disponible') {
      setShowUploadMenu(true)
      return
    }

    advanceSocialMission(id)
    if (id === 'tiktok-combo') {
      setShowTikTokFeed(true)
    }
  }

  function handlePosterUpload() {
    setSocialMissions((current) =>
      current.map((mission) => {
        if (mission.id === 'poster-counter') {
          return { ...mission, status: 'completada' }
        }
        return mission
      }),
    )
    setShowUploadMenu(false)
  }

  function openGoalPath(selectedGoal) {
    const goalTitle = selectedGoal.title || selectedGoal.tipo || 'Meta de crecimiento'
    const steps = applyGoalPathProgress(buildGoalPath(selectedGoal, profile), 0)
    const meta = getGoalMeta(selectedGoal)
    const activeStep = steps.find((step) => step.status === 'active') || steps[0]
    const coachMessage = `Vamos paso por paso. Para "${goalTitle}", empieza con: "${activeStep?.label}". Puedo decirte que hacer hoy, que producto usar o como saber si funciono.`
    
    setSelectedGoalPath({ 
      ...selectedGoal, 
      title: goalTitle, 
      steps,
      impactValue: selectedGoal.impactValue || (goalTitle.includes('ticket') ? '+12% ticket' : '+15% venta')
    })
    
    setPathCoach(coachMessage)
    setPathChatMessages([{ who: 'bot', text: coachMessage }])
    setPathChatInput('')
    setActivePathStepIndex(0)
  }

  async function readPathStep(step, index) {
    if (!step) return

    const readId = pathReadIdRef.current + 1
    pathReadIdRef.current = readId
    const stepText = `Paso ${index + 1}. ${step.label}. ${step.detail}. Al hacerlo ganas ${step.reward}.`
    setActivePathStepIndex(index)
    setPathCoach(stepText)
    setPathChatMessages((current) => [
      ...current,
      { who: 'bot', text: `Te leo el paso ${index + 1}: ${step.label}. ${step.detail}` },
    ])
    setReadingPathStepIndex(index)

    try {
      await speak(stepText, normalizeText(profile.pais || 'Mexico').toLowerCase())
    } catch (error) {
      setPathChatMessages((current) => [
        ...current,
        {
          who: 'bot',
          text: `No pude reproducir la voz. Revisa que el servidor este corriendo y vuelve a tocar Leer. ${error?.message || ''}`.trim(),
        },
      ])
    } finally {
      if (pathReadIdRef.current === readId) {
        setReadingPathStepIndex(null)
      }
    }
  }

  function stopPathReading() {
    pathReadIdRef.current += 1
    stopSpeaking()
    setReadingPathStepIndex(null)
  }

  function completePathStep(index) {
    stopPathReading()
    setSelectedGoalPath((current) => {
      if (!current?.steps?.length) return current

      const hasNextStep = index + 1 < current.steps.length
      const nextIndex = hasNextStep ? index + 1 : index
      const updatedSteps = current.steps.map((step, stepIndex) => ({
        ...step,
        status: stepIndex <= index ? 'done' : stepIndex === nextIndex ? 'active' : 'locked',
      }))
      const nextStep = updatedSteps[nextIndex]

      setActivePathStepIndex(nextIndex)
      setPathCoach(
        hasNextStep
          ? `Listo. Ahora sigue el paso ${nextIndex + 1}: ${nextStep.label}.`
          : 'Meta completada. Ya puedes reclamar tus puntos y tu logro.',
      )
      setPathChatMessages((currentMessages) => [
        ...currentMessages,
        {
          who: 'bot',
          text: hasNextStep
            ? `Listo, completaste el paso ${index + 1}. Ahora vamos al paso ${nextIndex + 1}: ${nextStep.label}.`
            : 'Completaste todos los pasos de esta meta.',
        },
      ])

      return { ...current, steps: updatedSteps }
    })
  }

  async function askPathAgent(question) {
    const text = question.trim()
    if (!text || !selectedGoalPath || isPathAgentSending) return

    const activeStep = selectedGoalPath.steps?.find((step) => step.status === 'active') || selectedGoalPath.steps?.[0]
    const nextHistory = [...pathChatMessages, { who: 'user', text }]
    setPathChatMessages(nextHistory)
    setPathChatInput('')
    setIsPathAgentSending(true)

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: nextHistory.slice(-8),
          customerProfile: loggedProfile.fileName || DEFAULT_PROFILE_FILE,
          metaState: {
            screen: 'Mi Meta - camino de pasos',
            selectedGoal: selectedGoalPath.title,
            impactValue: selectedGoalPath.impactValue,
            activeStep,
            cluster: profile.perfil,
            ticketPromedio: profile.metricas_base?.ticket_promedio,
            frecuencia: profile.metricas_base?.frecuencia,
          },
          includeAudio: false,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'No pude consultar al agente')
      setPathChatMessages((current) => [...current, { who: 'bot', text: data.reply }])
      setPathCoach(data.reply)
    } catch {
      const fallback = `Para este paso, empieza por "${activeStep?.label}". Hazlo hoy en pequeno, revisa si te ayudo a vender mas y repite si funciono.`
      setPathChatMessages((current) => [...current, { who: 'bot', text: fallback }])
      setPathCoach(fallback)
    } finally {
      setIsPathAgentSending(false)
    }
  }

  function handlePathChatSubmit(event) {
    event.preventDefault()
    askPathAgent(pathChatInput)
  }

  return (
    <div className="panel-pad goal-screen">
      <HelloAvatar onClick={onAvatarClick} />

      <section className="goal-card active-goal-card" style={{ '--goal-color': goal.color }}>
        <div className="goal-card-title">
          <span>Tu meta activa</span>
          <strong>{goal.progress}%</strong>
        </div>
        <h3>{goal.title}</h3>
        <p>{goal.description}</p>

        <div className="goal-progress">
          <span style={{ width: `${goal.progress}%` }} />
        </div>

        <div className="goal-stats">
          <div>
            <span>Actual</span>
            <strong>{goal.current}</strong>
          </div>
          <div>
            <span>Objetivo</span>
            <strong>{goal.target}</strong>
          </div>
          <div>
            <span>Falta</span>
            <strong>{goal.missing}</strong>
          </div>
        </div>
        <button className="goal-path-cta" onClick={() => openGoalPath(goal)}>
          Ver camino de pasos
        </button>
      </section>

      <section className="goal-impact">
        <div>
          <span>Impacto</span>
          <strong>{goal.impactValue}</strong>
          <small>{goal.impactLabel}</small>
        </div>
        <div>
          <span>Aceptadas</span>
          <strong>{accepted.length} de 3</strong>
          <small>misiones</small>
        </div>
        <div>
          <span>Puntos</span>
          <strong>{goal.points}</strong>
          <small>estimados</small>
        </div>
      </section>

      <section className="generated-goals">
        <div className="goal-section-head">
          <div>
            <h2>Plan sugerido por Tuali</h2>
            <p>Metas pensadas para tu tienda.</p>
          </div>
        </div>
        <div className="generated-goal-list">
          {plan.goals.slice(0, 5).map((item) => {
            const meta = getGoalMeta(item)
            return (
              <button
                className="generated-goal-pill"
                key={`${item.tipo}-${item.prioridad}`}
                style={{ '--goal-color': meta.color }}
                onClick={() => openGoalPath({ ...item, title: item.tipo })}
              >
                {meta.image
                  ? <span><img src={meta.image} alt={item.tipo} /></span>
                  : <span>{meta.icon}</span>}
                <div>
                  <strong>{item.tipo}</strong>
                  <small>Prioridad {item.prioridad}</small>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      <section className="missions-section">
        <div className="goal-section-head">
          <div>
            <h2>Metas recomendadas</h2>
            <p>Pasos sencillos para vender mas esta semana.</p>
          </div>
          <span className="goal-streak">4 dias</span>
        </div>

        {plan.recommendations
          .filter((rec) => !dismissedTags.includes(rec.tag))
          .map((rec, index) => {
            const isAccepted = accepted.includes(rec.tag)

            return (
              <article className={`mission-card ${isAccepted ? 'accepted' : ''}`} key={rec.tag}>
                <div className="mission-step">
                  <span>{index + 1}</span>
                </div>
                <div className="mission-content">
                  <div className="mission-top">
                    <span className="mission-tag">{rec.tag}</span>
                    {isAccepted && <span className="mission-check">Aceptada</span>}
                  </div>
                  <h3>{rec.title}</h3>
                  <p>{rec.reason}</p>
                  <div className="mission-impact">
                    <span>{rec.impact}</span>
                    <span>{rec.points}</span>
                  </div>
                  <div className="mission-actions">
                    <button className="mission-primary" onClick={() => toggleRecommendation(rec.tag)}>
                      {isAccepted ? 'Quitar' : 'Agregar al pedido'}
                    </button>
                    <button
                      className="mission-secondary"
                      onClick={() => {
                        setDismissedTags((prev) => [...prev, rec.tag])
                        setFeedback('Tuali bajara inversion inicial y ajustara futuras recomendaciones.')
                      }}
                    >
                      No me interesa
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
      </section>

      <section className="custom-goal-card">
        <div className="goal-section-head">
          <div>
            <h2>Crea tu propia meta</h2>
            <p>Tuali te acompana junto con la meta recomendada.</p>
          </div>
        </div>
        <form className="custom-goal-form" onSubmit={createCustomGoal}>
          <select
            value={customDraft.type}
            onChange={(event) => setCustomDraft((current) => ({ ...current, type: event.target.value }))}
          >
            {customGoalTypes.map((type) => <option key={type}>{type}</option>)}
          </select>
          {customDraft.type === 'Otra meta personalizada' && (
            <input
              type="text"
              placeholder="Nombre de tu meta"
              value={customDraft.customName}
              onChange={(event) => setCustomDraft((current) => ({ ...current, customName: event.target.value }))}
            />
          )}
          <input
            type="text"
            placeholder="Objetivo: vender $500 mas, sumar 2 categorias..."
            value={customDraft.objective}
            onChange={(event) => setCustomDraft((current) => ({ ...current, objective: event.target.value }))}
          />
          <input
            type="text"
            placeholder="Fecha limite: viernes, 7 dias, este mes..."
            value={customDraft.deadline}
            onChange={(event) => setCustomDraft((current) => ({ ...current, deadline: event.target.value }))}
          />
          <button type="submit">Crear meta</button>
        </form>

        <div className="custom-goal-list">
          {customGoals.length === 0 && (
            <div className="empty-custom-goal">
              Define una meta propia con lo que tu ya sabes de tu tienda.
            </div>
          )}
          {customGoals.map((item) => (
            <article className={`custom-goal-item ${item.active ? 'active' : ''}`} key={item.id}>
              <div>
                <div className="custom-goal-title">
                  <strong>{item.title}</strong>
                  <span>En progreso</span>
                </div>
                <p>{item.objective}</p>
                <small>Fecha limite: {item.deadline}</small>
                <div className="goal-progress mini">
                  <span style={{ width: `${item.progress}%` }} />
                </div>
              </div>
              <button onClick={() => activateCustomGoal(item.id)}>
                {item.active ? 'Activa' : 'Activar'}
              </button>
              <button className="custom-goal-path-button" onClick={() => openGoalPath(item)}>
                Pasos
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="social-missions-card">
        <div className="goal-section-head">
          <div>
            <h2>Misiones sociales</h2>
            <p>Acciones fuera de la app que promueven tu tienda.</p>
          </div>
        </div>
        {socialMissions.map((mission) => (
          <article className={`social-mission ${mission.status.replace(' ', '-')} ${mission.id === 'tiktok-combo' ? 'tiktok-feature' : ''}`} key={mission.id}>
            <div className="social-mission-main">
              <div>
                <div className="social-mission-top">
                  <span>{mission.reward}</span>
                  <small>{mission.time}</small>
                </div>
                <h3>{mission.title}</h3>
                <p>{mission.reason}</p>
              </div>
              <button onClick={() => handleSocialMissionClick(mission.id)}>
                {mission.status === 'completada' ? 'Listo' : mission.status === 'en progreso' ? 'Completar' : 'Participar'}
              </button>
            </div>

            {mission.id === 'tiktok-combo' && (
              <div className="tiktok-participants">
                <div className="tiktok-participants-head">
                  <strong>Participantes del reto</strong>
                  <span>{tiktokParticipants.length} videos</span>
                </div>
                <div className="tiktok-list">
                  {tiktokParticipants.map((participant) => (
                    <a
                      className="tiktok-card"
                      href={participant.url}
                      target="_blank"
                      rel="noreferrer"
                      key={participant.url}
                    >
                      <span className="tiktok-play">▶</span>
                      <div>
                        <strong>{participant.store}</strong>
                        <small>{participant.cluster} · {participant.points}</small>
                      </div>
                      <b>Ver</b>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {mission.id === 'story-store' && (
              <div className="tiktok-participants instagram-participants">
                <div className="tiktok-participants-head">
                  <strong>Participantes del reto</strong>
                  <span>{instagramParticipants.length} reels</span>
                </div>
                <div className="tiktok-list">
                  {instagramParticipants.map((participant) => (
                    <a
                      className="tiktok-card"
                      href={participant.url}
                      target="_blank"
                      rel="noreferrer"
                      key={participant.url}
                    >
                      <span className="tiktok-play">▶</span>
                      <div>
                        <strong>{participant.store}</strong>
                        <small>{participant.cluster} · {participant.points}</small>
                      </div>
                      <b>Ver</b>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </article>
        ))}
      </section>

      <section className="achievements-card">
        <div className="goal-section-head compact">
          <div>
            <h2>Achievements</h2>
            <p>Logros completados y proximos retos.</p>
          </div>
          <span className="view-link">Ver</span>
        </div>
        <div className="achievement-grid">
          {achievements.map((achievement) => (
            <div
              className={`achievement-badge ${achievement.unlocked ? 'unlocked' : 'locked'}`}
              key={achievement.id}
              style={{ '--badge-color': achievement.color }}
            >
              <div className="badge-shield">
                <img src={achievement.image} alt={achievement.label} />
              </div>
              <small>{achievement.label}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="cluster-competition">
        <div className="goal-section-head">
          <div>
            <h2>Competencia de mi grupo</h2>
            <p>Compites con tiendas con metas parecidas.</p>
          </div>
        </div>
        <div className="cluster-challenge">
          <strong>{competition.challenge}</strong>
          <span>{competition.prize}</span>
        </div>
        <div className="ranking-list">
          {competition.ranking.slice(0, 3).map((item, index) => (
            <div className={`ranking-row ${item.me ? 'me' : ''}`} key={`${item.store}-${index}`}>
              <span className="ranking-pos">{index + 1}</span>
              <div>
                <strong>{item.me ? item.store : `Competidor ${index + 1}`}</strong>
                <div className="ranking-progress">
                  <span style={{ width: `${item.progress}%` }} />
                </div>
              </div>
              <b>{item.progress}%</b>
            </div>
          ))}
        </div>
        <div className="cluster-footer">
          <span>Tu posicion: #{myPosition}</span>
          <button onClick={() => setShowFullRanking(true)}>Ver reto del grupo</button>
        </div>
      </section>

      {selectedGoalPath && (
        <div className="goal-map-overlay" role="dialog" aria-modal="true">
          <div className="goal-map-shell">
            <div className="goal-map-topbar">
              <div>
                <span>Mapa de Meta</span>
                <strong>{selectedGoalPath.title}</strong>
              </div>
              <button onClick={() => {
                stopPathReading()
                setSelectedGoalPath(null)
              }}>X</button>
            </div>

            <div className="goal-map-banner">
              <span>Meta</span>
              <strong>{selectedGoalPath.impactValue || '+12% ticket'}</strong>
            </div>

            <div className="goal-map-level-progress" aria-label="Progreso del camino">
              <span style={{ width: `${goalPathProgress}%` }} />
            </div>

            <section className="goal-map-agent-panel">
              <div className="goal-map-agent-head">
                <div>
                  <span>Agente Tuali</span>
                  <strong>Te acompana paso a paso</strong>
                </div>
                {readingPathStepIndex !== null ? (
                  <button className="goal-map-stop-voice" type="button" onClick={stopPathReading}>
                    Detener voz
                  </button>
                ) : (
                  <small>{isPathAgentSending ? 'Pensando...' : 'En linea'}</small>
                )}
              </div>

              <div className="goal-map-agent-messages">
                {pathChatMessages.map((message, index) => (
                  <div className={`goal-map-agent-msg ${message.who}`} key={`${message.who}-${index}`}>
                    {message.text}
                  </div>
                ))}
                {isPathAgentSending && (
                  <div className="goal-map-agent-msg bot typing">...</div>
                )}
              </div>

              <div className="goal-map-agent-prompts">
                <button onClick={() => askPathAgent('Que hago primero para avanzar este paso?')}>
                  Que hago primero?
                </button>
                <button onClick={() => askPathAgent('Que producto puedo usar para esta meta?')}>
                  Que producto usar?
                </button>
                <button onClick={() => askPathAgent('Como se si esto ya funciono?')}>
                  Como se si funciono?
                </button>
              </div>

              <form className="goal-map-agent-input" onSubmit={handlePathChatSubmit}>
                <input
                  type="text"
                  placeholder="Preguntale algo de este paso..."
                  value={pathChatInput}
                  onChange={(event) => setPathChatInput(event.target.value)}
                  disabled={isPathAgentSending}
                />
                <button type="submit" disabled={isPathAgentSending || !pathChatInput.trim()}>
                  Enviar
                </button>
              </form>
            </section>

            <div className="candy-track">
              {[...goalPathSteps].reverse().map((step, idx) => {
                const stepNum = goalPathSteps.length - idx
                const originalIndex = stepNum - 1
                const isLeft = stepNum % 2 === 0
                return (
                  <div className={`candy-node ${isLeft ? 'candy-left' : 'candy-right'} ${activePathStepIndex === originalIndex ? 'selected' : ''}`} key={originalIndex}>
                    <button
                      className={`candy-circle ${step.status}`}
                      type="button"
                      onClick={() => readPathStep(step, originalIndex)}
                      aria-label={`Leer paso ${stepNum}: ${step.label}`}
                    >
                      <span>{stepNum}</span>
                      {step.status === 'done' && <b>OK</b>}
                    </button>
                    <div className="candy-card">
                      <small>{step.reward}</small>
                      <h3>{stepNum}. {step.label}</h3>
                      <p>{step.detail}</p>
                      <div className="candy-card-actions">
                        <button
                          type="button"
                          onClick={() => readPathStep(step, originalIndex)}
                          disabled={readingPathStepIndex === originalIndex}
                        >
                          {readingPathStepIndex === originalIndex ? 'Leyendo...' : 'Leer'}
                        </button>
                        {step.status === 'active' && (
                          <button type="button" onClick={() => completePathStep(originalIndex)}>Completar paso</button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {showFullRanking && (
        <div className="tiktok-feed-overlay upload-overlay" role="dialog" aria-modal="true" aria-label="Ranking completo">
          <div className="tiktok-feed-shell upload-shell">
            <div className="tiktok-feed-header">
              <div>
                <span>Detalle</span>
                <strong>Tabla de porcentajes</strong>
              </div>
              <button onClick={() => setShowFullRanking(false)} aria-label="Cerrar ranking">
                X
              </button>
            </div>
            <div className="upload-content" style={{ padding: '0', backgroundColor: '#f5f5f7' }}>
              <div className="podium-section">
                {/* 2nd Place */}
                <div className="podium-item second">
                  <div className="podium-avatar-shell">
                    <div className="podium-avatar">🏪</div>
                  </div>
                  <div className="podium-name">{competition.ranking[1]?.me ? competition.ranking[1].store : `Competidor 2`}</div>
                  <div className="podium-block">
                    <div className="podium-score-pill">★ {competition.ranking[1]?.progress}</div>
                    <span className="podium-number">2</span>
                  </div>
                </div>

                {/* 1st Place */}
                <div className="podium-item first">
                  <div className="podium-avatar-shell">
                    <span className="podium-crown">👑</span>
                    <div className="podium-avatar">🏪</div>
                  </div>
                  <div className="podium-name">{competition.ranking[0]?.me ? competition.ranking[0].store : `Competidor 1`}</div>
                  <div className="podium-block">
                    <div className="podium-score-pill">★ {competition.ranking[0]?.progress}</div>
                    <span className="podium-number">1</span>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="podium-item third">
                  <div className="podium-avatar-shell">
                    <div className="podium-avatar">🏪</div>
                  </div>
                  <div className="podium-name">{competition.ranking[2]?.me ? competition.ranking[2].store : `Competidor 3`}</div>
                  <div className="podium-block">
                    <div className="podium-score-pill">★ {competition.ranking[2]?.progress}</div>
                    <span className="podium-number">3</span>
                  </div>
                </div>
              </div>

              <div className="leaderboard-chart-container">
                <h4>Clasificación General</h4>
                <div className="leaderboard-chart">
                  {competition.ranking.slice(3).map((item, index) => (
                    <div className={`leaderboard-item ${item.me ? 'me' : ''}`} key={`${item.store}-rest-${index}`}>
                      <div className="leaderboard-label-row">
                        <div className="leaderboard-name">
                          <span className="leaderboard-rank">{index + 4}</span>
                          {item.me ? item.store : `Competidor ${index + 4}`}
                        </div>
                        <span className="leaderboard-value">★ {item.progress}</span>
                      </div>
                      <div className="leaderboard-bar-track">
                        <div
                          className="leaderboard-bar-fill"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: '24px 18px 30px', backgroundColor: '#fff' }}>
                <button className="upload-submit-btn" onClick={() => setShowFullRanking(false)} style={{ width: '100%', margin: '0' }}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTikTokFeed && (
        <div className="tiktok-feed-overlay" role="dialog" aria-modal="true" aria-label="Participantes del reto TikTok">
          <div className="tiktok-feed-shell">
            <div className="tiktok-feed-header">
              <div>
                <span>Reto social</span>
                <strong>Combo estrella</strong>
              </div>
              <button onClick={() => setShowTikTokFeed(false)} aria-label="Cerrar feed">
                X
              </button>
            </div>

            <div className="tiktok-feed">
              {tiktokParticipants.map((participant, index) => (
                <article className="tiktok-slide" key={participant.url} style={{ '--slide-index': index + 1 }}>
                  <div className="tiktok-mock-top">
                    <span>Siguiendo</span>
                    <strong>Para ti</strong>
                  </div>
                  <div className="tiktok-slide-bg">
                    <div className="tiktok-thumbnail">
                      <span className="tiktok-thumbnail-label">Tuali Challenge</span>
                      <strong>{participant.store}</strong>
                      <small>{participant.caption}</small>
                    </div>
                    <span className="tiktok-slide-play" aria-hidden="true" />
                  </div>
                  <div className="tiktok-side-actions">
                    <span>♥</span>
                    <small>{12 + index * 8}k</small>
                    <span>↗</span>
                    <small>{participant.points}</small>
                  </div>
                  <div className="tiktok-slide-copy">
                    <span>Video {index + 1} de {tiktokParticipants.length}</span>
                    <h3>{participant.store}</h3>
                    <p>{participant.handle} · {participant.cluster} · {participant.caption}</p>
                    <a href={participant.url} target="_blank" rel="noreferrer">
                      Ver TikTok
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}

      {showInstagramFeed && (
        <div className="tiktok-feed-overlay instagram-feed-overlay" role="dialog" aria-modal="true" aria-label="Participantes del reto Instagram">
          <div className="tiktok-feed-shell">
            <div className="tiktok-feed-header">
              <div>
                <span>Reto social</span>
                <strong>Reel de tu tienda</strong>
              </div>
              <button onClick={() => setShowInstagramFeed(false)} aria-label="Cerrar feed">
                X
              </button>
            </div>

            <div className="tiktok-feed">
              {instagramParticipants.map((participant, index) => (
                <article className="tiktok-slide" key={participant.url} style={{ '--slide-index': index + 1 }}>
                  <div className="tiktok-mock-top">
                    <span>Siguiendo</span>
                    <strong>Para ti</strong>
                  </div>
                  <div className="tiktok-slide-bg">
                    <div className="tiktok-thumbnail">
                      <span className="tiktok-thumbnail-label">Instagram Challenge</span>
                      <strong>{participant.store}</strong>
                      <small>{participant.caption}</small>
                    </div>
                    <span className="tiktok-slide-play" aria-hidden="true" />
                  </div>
                  <div className="tiktok-side-actions">
                    <span>♥</span>
                    <small>{8 + index * 5}k</small>
                    <span>↗</span>
                    <small>{participant.points}</small>
                  </div>
                  <div className="tiktok-slide-copy">
                    <span>Reel {index + 1} de {instagramParticipants.length}</span>
                    <h3>{participant.store}</h3>
                    <p>{participant.handle} · {participant.cluster} · {participant.caption}</p>
                    <a href={participant.url} target="_blank" rel="noreferrer">
                      Ver Reel
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}

      {showUploadMenu && (
        <div className="tiktok-feed-overlay upload-overlay" role="dialog" aria-modal="true" aria-label="Subir foto del cartel">
          <div className="tiktok-feed-shell upload-shell">
            <div className="tiktok-feed-header">
              <div>
                <span>Evidencia</span>
                <strong>Foto de cartel</strong>
              </div>
              <button onClick={() => setShowUploadMenu(false)} aria-label="Cerrar menu">
                X
              </button>
            </div>
            <div className="upload-content" style={{ padding: '24px', gap: '20px' }}>
              <p>Sube aqui una foto de tu cartel</p>
              <div className="upload-dropzone">
                <span>📁</span>
                <input type="file" id="poster-file" style={{ display: 'none' }} />
                <label htmlFor="poster-file">Elegir archivo</label>
              </div>
              <button className="upload-submit-btn" onClick={handlePosterUpload}>
                Subir
              </button>
            </div>
          </div>
        </div>
      )}

      <section className={`feedback-card feedback-state-${feedbackType}`}>
        <div>
          <h2>Te ayudo esta recomendacion?</h2>
          <p>{feedback || 'Tu respuesta entrena al agente para recomendar mejor la proxima vez.'}</p>
        </div>
        <div className="feedback-actions">
          <button
            className={feedbackType === 'positive' ? 'active-si' : ''}
            onClick={() => {
              setFeedback('Perfecto. Tuali priorizara misiones similares para este perfil.')
              setFeedbackType('positive')
              setShowCommentBox(false)
            }}
          >
            Si, me sirvio
          </button>
          <button
            className={feedbackType === 'negative' ? 'active-no' : ''}
            onClick={() => {
              setFeedback('Entendido. Te mostrare opciones mas simples y de menor inversion.')
              setFeedbackType('negative')
              setShowCommentBox(true)
            }}
          >
            No fue util
          </button>
        </div>

        {showCommentBox && (
          <div className="feedback-comment-area">
            <textarea
              placeholder="Cuentanos como podemos mejorar o que te gustaria ver..."
              rows={3}
            />
            <button className="upload-submit-btn" onClick={() => setShowCommentBox(false)}>
              Enviar comentarios
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
