import { useMemo, useState } from 'react'
import HelloAvatar from '../components/HelloAvatar.jsx'
import pedidoIcon from '../../assets/pedido.png'
import ticketIcon from '../../assets/ticket.png'
import comboIcon from '../../assets/combo.png'
import metaIcon from '../../assets/meta.png'
import socialIcon from '../../assets/social.png'
import sieteDiasIcon from '../../assets/7 dias.png'
import promoIcon from '../../assets/promo.png'
import surtidoIcon from '../../assets/surtido.png'
import topIcon from '../../assets/top.png'
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
    { label: 'Analizar complementarios', desc: 'Revisa que productos se compran juntos con frecuencia.' },
    { label: 'Crear combos sugeridos', desc: 'Arma paquetes que ofrezcan valor real al cliente.' },
    { label: 'Capacitacion de venta', desc: 'Entrena a tu equipo para ofrecer el combo en caja.' },
    { label: 'Medir ticket promedio', desc: 'Compara el valor antes y despues de los combos.' },
    { label: 'Optimizar oferta', desc: 'Ajusta los combos que mejor rotacion tuvieron.' },
  ],
  Diversificacion: [
    { label: 'Identificar huecos', desc: 'Busca categorias que tus clientes piden pero no tienes.' },
    { label: 'Seleccion de SKUs', desc: 'Elige 3 productos estrella de la nueva categoria.' },
    { label: 'Exhibicion premium', desc: 'Ubica los productos en el area de mayor flujo.' },
    { label: 'Promocion de lanzamiento', desc: 'Ofrece una pequeña prueba o descuento inicial.' },
    { label: 'Analisis de rotacion', desc: 'Verifica si la categoria se vuelve autosustentable.' },
  ],
  'Incrementar Pedidos': [
    { label: 'Auditoria de stock', desc: 'Haz un conteo rapido de tus productos de alta rotacion.' },
    { label: 'Configurar alertas', desc: 'Activa recordatorios 2 dias antes de agotar stock.' },
    { label: 'Pedido anticipado', desc: 'Realiza tu orden antes del pico de demanda semanal.' },
    { label: 'Verificar recepcion', desc: 'Asegura que todo llego en tiempo y forma.' },
    { label: 'Evaluacion de ahorro', desc: 'Revisa cuanto ganaste al no perder ventas por falta de stock.' },
  ],
  'Aplicar Promociones': [
    { label: 'Revisar catalogo', desc: 'Encuentra las promos vigentes de tus proveedores.' },
    { label: 'Calcular margen', desc: 'Asegura que la promo sea rentable para tu negocio.' },
    { label: 'Señaletica clara', desc: 'Coloca carteles con el precio anterior y el de promo.' },
    { label: 'Comunicacion directa', desc: 'Avisa a tus clientes mas leales sobre la oferta.' },
    { label: 'Validar exito', desc: 'Mide cuantas unidades extra vendiste gracias a la promo.' },
  ],
  'Crear Combos': [
    { label: 'Analisis de afinidad', desc: 'Identifica que productos "llaman" a otros.' },
    { label: 'Estrategia de precio', desc: 'Define un precio que sea menor a la suma individual.' },
    { label: 'Empaque visual', desc: 'Usa ligas o bolsas para que el combo se vea como uno solo.' },
    { label: 'Impulso en mostrador', desc: 'Manten 5 combos listos para entrega inmediata.' },
    { label: 'Rotacion de combos', desc: 'Cambia los productos cada 15 dias para mantener el interes.' },
  ],
  Activacion: [
    { label: 'Listado de inactivos', desc: 'Identifica quienes no han comprado en 15 dias.' },
    { label: 'Oferta gancho', desc: 'Prepara un beneficio exclusivo para su regreso.' },
    { label: 'Contacto multicanal', desc: 'Usa WhatsApp o visitas para recordarles tu tienda.' },
    { label: 'Primer pedido', desc: 'Asegura una experiencia perfecta en su compra de regreso.' },
    { label: 'Fidelizacion', desc: 'Sigue su comportamiento para evitar que se vuelvan a alejar.' },
  ],
}

const profileCopy = {
  VIP: 'Compra con alto valor. El agente prioriza ticket promedio, combos y promociones de mayor impacto.',
  Recurrente: 'Compra con frecuencia. El agente prioriza diversificacion y nuevas oportunidades de surtido.',
  Nicho: 'Tiene alta concentracion en pocos productos. El agente prioriza diversificacion y cross-sell.',
  Ocasional: 'Compra poco o dejo pasar varios dias. El agente prioriza activacion y recompra facil.',
  Volumen: 'Tiene potencial de aumentar frecuencia. El agente prioriza pedidos programados y promociones.',
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
        ? `El perfil ${profile.perfil} ya compra estos productos. El agente los une para subir el pedido sin cambiar la rutina.`
        : `El agente detecto que ${topSku} concentra la oportunidad principal de crecimiento.`,
      impact: ticket ? `+${money(ticket * 0.07)} al ticket` : '+1 accion de crecimiento',
      points: '+16 puntos',
    },
    {
      tag: related.diversification ? 'Diversificacion' : 'Surtido',
      title: `Reduce dependencia de ${topSku}`,
      reason: related.diversification
        ? `Hoy ${topSku} representa ${related.diversification.datos_asociados.share_producto_top}. La meta es abrir categorias sin perder tus basicos.`
        : 'El agente busca productos cercanos a tu historial para ampliar el surtido con bajo riesgo.',
      impact: `de ${categories} a ${Number(categories) + 2} categorias`,
      points: '+14 puntos',
    },
    {
      tag: related.promotion ? 'Promocion aplicada' : 'Siguiente pedido',
      title: related.promotion ? `Promo en ${normalizeText(related.promotion.datos_asociados.top_sku_para_promo)}` : `Programa pedido ${targetFrequency}`,
      reason: related.promotion
        ? `Sensibilidad al precio: ${normalizeText(related.promotion.datos_asociados.sensibilidad_precio)}. La promo se aplica donde mas probabilidad hay de recompra.`
        : `Frecuencia actual: ${frequency}. Objetivo del agente: llegar a ${targetFrequency} pedidos.`,
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

  const pathLibrary = {
    'Aumentar promedio de ticket': [
      { label: 'Analisis de Afinidad', detail: `Ticket actual: ${money(ticket)}. Identifica productos que se compran juntos. El perfil indica relacion entre basicos y snacks.`, reward: '+8 pts', status: 'done' },
      { label: 'Estrategia de Upselling', detail: 'Diseña una oferta donde el cliente reciba un beneficio claro al subir su volumen de compra habitual.', reward: '+14 pts', status: 'active' },
      { label: 'Validacion de Margen', detail: 'Asegura que el incremento en ventas no afecte tu rentabilidad neta por pedido antes de confirmar el carrito.', reward: '+18 pts', status: 'locked' },
      { label: 'Escalamiento IA', detail: 'Si el ticket promedio sube un 10%, el agente automatizara esta recomendacion para tus proximos pedidos.', reward: '+22 pts', status: 'locked' },
    ],
    'Subir ticket promedio': [
      { label: 'Analisis de Afinidad', detail: `Ticket actual: ${money(ticket)}. Identifica productos que se compran juntos. El perfil indica relacion entre basicos y snacks.`, reward: '+8 pts', status: 'done' },
      { label: 'Estrategia de Upselling', detail: 'Diseña una oferta donde el cliente reciba un beneficio claro al subir su volumen de compra habitual.', reward: '+14 pts', status: 'active' },
      { label: 'Validacion de Margen', detail: 'Asegura que el incremento en ventas no afecte tu rentabilidad neta por pedido antes de confirmar el carrito.', reward: '+18 pts', status: 'locked' },
      { label: 'Escalamiento IA', detail: 'Si el ticket promedio sube un 10%, el agente automatizara esta recomendacion para tus proximos pedidos.', reward: '+22 pts', status: 'locked' },
    ],
    Diversificacion: [
      { label: 'Diagnostico de Riesgo', detail: 'Identifica el producto que domina tus ventas. Reducir la dependencia de un solo SKU hara tu negocio mas resiliente.', reward: '+8 pts', status: 'done' },
      { label: 'Oportunidades IA', detail: 'Tuali detecto categorias que tus clientes ya buscan en otros canales. Es momento de traer esa venta a tu tienda.', reward: '+14 pts', status: 'active' },
      { label: 'Surtido de Prueba', detail: 'Introduce 2 productos nuevos de bajo riesgo. El objetivo es ampliar el catalogo sin comprometer tu flujo de caja.', reward: '+18 pts', status: 'locked' },
      { label: 'Consolidacion', detail: 'Mide la rotacion: los productos exitosos se quedan como basicos y los de baja salida se rotan por nuevas apuestas.', reward: '+22 pts', status: 'locked' },
    ],
    'Incrementar Pedidos': [
      { label: 'Auditoria de Stock', detail: `Frecuencia actual: ${frequency}. La IA detecto que te quedas sin productos clave los fines de semana. Revisa tu inventario hoy.`, reward: '+8 pts', status: 'done' },
      { label: 'Sincronizacion Tuali', detail: 'Alinea tus dias de pedido con los picos de demanda proyectados por el agente para no perder ventas.', reward: '+14 pts', status: 'active' },
      { label: 'Pedido Anticipado', detail: 'Realiza tu orden 48 horas antes de lo habitual para asegurar disponibilidad y prioridad en el surtido.', reward: '+18 pts', status: 'locked' },
      { label: 'Optimizacion Logistica', detail: 'Reduce el costo por entrega consolidando tus necesidades en pedidos mas grandes y eficientes.', reward: '+22 pts', status: 'locked' },
    ],
    'Aplicar Promociones': [
      { label: 'Filtrado de Ofertas', detail: 'Selecciona unicamente las promociones que tienen alta probabilidad de rotacion segun tu historial de ventas.', reward: '+8 pts', status: 'done' },
      { label: 'Calculo de Retorno', detail: 'Verifica cuantos puntos Gana y cuanto margen extra generara la promocion seleccionada antes de aplicarla.', reward: '+14 pts', status: 'active' },
      { label: 'Ejecucion Visual', detail: 'Coloca señaletica clara. La IA sugiere que las promos de bebidas funcionan mejor cerca del mostrador de cobro.', reward: '+18 pts', status: 'locked' },
      { label: 'Analisis de ROI', detail: 'Compara las ventas del periodo contra la semana anterior para validar el exito real de la promocion aplicada.', reward: '+22 pts', status: 'locked' },
    ],
    'Crear Combos': [
      { label: 'Sinergia de Productos', detail: 'Agrupa un producto de alta rotacion con uno de margen superior para equilibrar la ganancia de tu negocio.', reward: '+8 pts', status: 'done' },
      { label: 'Precio Psicologico', detail: 'Define un precio "gancho" que termine en .90 o .50. Tuali sugiere que esto aumenta la conversion en tu cluster.', reward: '+14 pts', status: 'active' },
      { label: 'Impulso Social', detail: 'Sube una foto de tu combo a redes. Los tenderos de tu cluster que lo hacen venden un 15% mas de promedio.', reward: '+18 pts', status: 'locked' },
      { label: 'Revision de Mix', detail: 'Ajusta los componentes del combo cada 15 dias para mantener el interes de tus clientes mas recurrentes.', reward: '+22 pts', status: 'locked' },
    ],
    Activacion: [
      { label: 'Segmentacion Activa', detail: 'Identifica que clientes han dejado de visitarte. El agente los ha marcado con bandera roja en tu panel de control.', reward: '+8 pts', status: 'done' },
      { label: 'Oferta de Reenganche', detail: 'Prepara un beneficio exclusivo o descuento personalizado que solo sea valido para su siguiente compra.', reward: '+14 pts', status: 'active' },
      { label: 'Contacto Directo', detail: 'Usa WhatsApp o recordatorios fisicos para avisarles que tienes su pedido recurrente listo para entrega.', reward: '+18 pts', status: 'locked' },
      { label: 'Ciclo de Fidelidad', detail: 'Asegura que el primer pedido de regreso sea perfecto para convertir al cliente en comprador semanal de nuevo.', reward: '+22 pts', status: 'locked' },
    ],
  }

  return pathLibrary[topGoal] || [
    { label: 'Define', detail: selectedGoal?.objective || 'Convierte la meta en una accion medible.', reward: '+8 pts', status: 'done' },
    { label: 'Primer paso', detail: 'El agente sugiere una accion pequena para iniciar hoy.', reward: '+14 pts', status: 'active' },
    { label: 'Comprueba', detail: 'Revisa avance, puntos y efecto en el pedido.', reward: '+18 pts', status: 'locked' },
    { label: 'Completa', detail: 'Cierra la meta y desbloquea un achievement.', reward: '+22 pts', status: 'locked' },
  ]
}

export default function MiMeta({ onAvatarClick }) {
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
  const [customGoals, setCustomGoals] = useState([])
  const [customDraft, setCustomDraft] = useState({
    type: 'Subir ticket promedio',
    objective: '',
    deadline: '',
    customName: '',
  })

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
  const competition = clusterRankings[profile.perfil] || clusterRankings.Recurrente
  const myPosition = competition.ranking.findIndex((item) => item.me) + 1

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
    const steps = buildGoalPath(selectedGoal, profile)
    const meta = getGoalMeta(selectedGoal)
    
    setSelectedGoalPath({ 
      ...selectedGoal, 
      title: goalTitle, 
      steps,
      impactValue: selectedGoal.impactValue || (goalTitle.includes('ticket') ? '+12% ticket' : '+15% venta')
    })
    
    // Simulate AI coaching message without hard dependency on external API
    setPathCoach(`Para alcanzar "${goalTitle}", el agente Tuali recomienda enfocarte en: "${steps.find(s => s.status === 'active')?.label || steps[0].label}". ¡Vamos por esos puntos!`)
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
            <h2>Plan generado por IA</h2>
            <p>Metas del JSON del usuario logueado.</p>
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
            <p>Acciones calculadas desde su perfil and metas.</p>
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
            <p>El agente la acompana junto con la meta recomendada.</p>
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
              Define una meta propia para combinar tu intuicion con la IA de Tuali.
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
            <h2>Competencia de mi cluster</h2>
            <p>Compites con clientes con metas parecidas.</p>
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
          <button onClick={() => setShowFullRanking(true)}>Ver reto del cluster</button>
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
              <button onClick={() => setSelectedGoalPath(null)}>X</button>
            </div>

            <div className="goal-map-banner">
              <span>Impacto estimado</span>
              <strong>{selectedGoalPath.impactValue || '+12% ticket'}</strong>
            </div>

            <div className="goal-map-coach">
              <span>IA</span>
              <p>{pathCoach}</p>
            </div>

            <div className="goal-map-road">
              {(selectedGoalPath.steps || []).map((step, idx) => (
                <div className={`goal-map-node ${step.status}`} key={idx}>
                  <div className="goal-map-dot">
                    <span>{idx + 1}</span>
                  </div>
                  <div className="goal-map-card">
                    <small>{step.reward}</small>
                    <h3>{step.label}</h3>
                    <p>{step.detail}</p>
                    {step.status === 'active' && (
                      <button onClick={() => setSelectedGoalPath(null)}>Completar paso</button>
                    )}
                  </div>
                </div>
              ))}
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
            <div className="upload-content" style={{ padding: '16px' }}>
              <div className="ranking-list">
                {competition.ranking.map((item, index) => (
                  <div className={`ranking-row ${item.me ? 'me' : ''}`} key={`${item.store}-full-${index}`}>
                    <span className="ranking-pos">{index + 1}</span>
                    <div style={{ textAlign: 'left' }}>
                      <strong>{item.me ? item.store : `Competidor ${index + 1}`}</strong>
                      <small style={{ color: 'var(--muted)', fontSize: '11px' }}>Progreso del reto</small>
                    </div>
                    <b style={{ fontSize: '15px' }}>{item.progress}%</b>
                  </div>
                ))}
              </div>
              <button className="upload-submit-btn" onClick={() => setShowFullRanking(false)} style={{ marginTop: '16px' }}>
                Cerrar
              </button>
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
            <div className="upload-content">
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
