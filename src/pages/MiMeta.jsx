import { useMemo, useState } from 'react'
import HelloAvatar from '../components/HelloAvatar.jsx'
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
    color: '#b91d33',
    description: 'Sube el valor de cada pedido con combos y productos complementarios.',
    impactLabel: 'Ticket estimado',
  },
  Diversificacion: {
    icon: '4X',
    color: '#6c2bd9',
    description: 'Reduce dependencia de un solo producto y abre nuevas categorias.',
    impactLabel: 'Variedad estimada',
  },
  'Incrementar Pedidos': {
    icon: '$',
    color: '#0f8f5f',
    description: 'Aumenta la frecuencia con recordatorios y recompra rapida.',
    impactLabel: 'Venta estimada',
  },
  'Aplicar Promociones': {
    icon: '%',
    color: '#006bb6',
    description: 'Usa promociones en productos clave sin complicar el pedido.',
    impactLabel: 'Ahorro estimado',
  },
  'Crear Combos': {
    icon: '+',
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
    title: 'Comparte una historia de tu tienda',
    reason: 'Promueve tu punto de venta fuera de la app.',
    reward: '+80 pts',
    time: '24 h',
    status: 'en progreso',
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

const clusterRankings = {
  VIP: {
    challenge: 'Reto VIP: sube tu ticket promedio 10%',
    prize: 'Premio: 450 puntos y combo destacado',
    ranking: [
      { store: 'Abarrotes Lupita', progress: 92 },
      { store: 'Mini Super El Sol', progress: 78 },
      { store: 'Abarrotes Chabelita', progress: 62, me: true },
    ],
  },
  Nicho: {
    challenge: 'Reto Nicho: suma 2 categorias nuevas',
    prize: 'Premio: 300 puntos y promocion sugerida',
    ranking: [
      { store: 'Miscelanea La 20', progress: 84 },
      { store: 'Abarrotes Chabelita', progress: 64, me: true },
      { store: 'Tienda Don Pepe', progress: 58 },
    ],
  },
  Recurrente: {
    challenge: 'Reto Recurrente: completa 3 pedidos esta semana',
    prize: 'Premio: 350 puntos y reto bonus',
    ranking: [
      { store: 'Mini Super El Sol', progress: 88 },
      { store: 'Abarrotes Lupita', progress: 72 },
      { store: 'Abarrotes Chabelita', progress: 61, me: true },
    ],
  },
  Ocasional: {
    challenge: 'Reto Ocasional: reactiva tu pedido en 7 dias',
    prize: 'Premio: 220 puntos y descuento de recompra',
    ranking: [
      { store: 'La Esquina', progress: 76 },
      { store: 'Abarrotes Chabelita', progress: 48, me: true },
      { store: 'Tienda Aurora', progress: 42 },
    ],
  },
}

function normalizeText(value = '') {
  return String(value)
    .replaceAll('DiversificaciÃ³n', 'Diversificacion')
    .replaceAll('DiversificaciÃƒÂ³n', 'Diversificacion')
    .replaceAll('ActivaciÃ³n', 'Activacion')
    .replaceAll('ActivaciÃƒÂ³n', 'Activacion')
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
    { id: 'first-order', label: 'Pedido', icon: 'P1', color: '#ff7a3d', unlocked: acceptedCount >= 1 },
    { id: 'combo', label: 'Combo', icon: '+', color: '#7ac943', unlocked: acceptedCount >= 1 },
    { id: 'goal', label: 'Meta', icon: 'G', color: '#b965f2', unlocked: customGoalsCount > 0 },
    { id: 'social', label: 'Social', icon: 'T', color: '#ff4b4b', unlocked: completedSocialCount > 0 },
    { id: 'seven', label: '7 dias', icon: '7', color: '#34a7e8', unlocked: true },
    { id: 'promo', label: 'Promo', icon: '%', color: '#83c441', unlocked: acceptedCount >= 2 },
    { id: 'surtido', label: 'Surtido', icon: '4X', color: '#7b61ff', unlocked: profile.perfil === 'Nicho' || acceptedCount >= 2 },
    { id: 'top', label: 'Top', icon: '#1', color: '#ff6542', unlocked: acceptedCount >= 3 },
  ]
}

function buildGoalPath(selectedGoal, profile) {
  const title = selectedGoal?.title || selectedGoal?.tipo || 'Meta de crecimiento'
  const topGoal = normalizeText(title)
  const ticket = Number(profile.metricas_base?.ticket_promedio) || 0
  const frequency = profile.metricas_base?.frecuencia || 1

  const pathLibrary = {
    'Aumentar promedio de ticket': [
      { label: 'Diagnostica', detail: `Ticket actual: ${money(ticket)}. Detecta productos que ya compra seguido.`, reward: '+8 pts', status: 'done' },
      { label: 'Arma combo', detail: 'Crea un combo con producto principal y complemento de alta rotacion.', reward: '+14 pts', status: 'active' },
      { label: 'Agrega al pedido', detail: 'Suma el combo al carrito sugerido y revisa que el margen siga sano.', reward: '+18 pts', status: 'locked' },
      { label: 'Mide impacto', detail: 'Compara el ticket del siguiente pedido contra el objetivo semanal.', reward: '+22 pts', status: 'locked' },
    ],
    'Subir ticket promedio': [
      { label: 'Diagnostica', detail: `Ticket actual: ${money(ticket)}. Detecta productos que ya compra seguido.`, reward: '+8 pts', status: 'done' },
      { label: 'Arma combo', detail: 'Crea un combo con producto principal y complemento de alta rotacion.', reward: '+14 pts', status: 'active' },
      { label: 'Agrega al pedido', detail: 'Suma el combo al carrito sugerido y revisa que el margen siga sano.', reward: '+18 pts', status: 'locked' },
      { label: 'Mide impacto', detail: 'Compara el ticket del siguiente pedido contra el objetivo semanal.', reward: '+22 pts', status: 'locked' },
    ],
    Diversificacion: [
      { label: 'Encuentra riesgo', detail: 'Ubica el producto que concentra mas ventas del perfil.', reward: '+8 pts', status: 'done' },
      { label: 'Elige categoria', detail: 'Selecciona una categoria cercana para no cambiar la rutina de compra.', reward: '+14 pts', status: 'active' },
      { label: 'Prueba surtido', detail: 'Agrega 2 SKUs pequenos y mide si rotan esta semana.', reward: '+18 pts', status: 'locked' },
      { label: 'Consolida', detail: 'Mantiene los productos que funcionaron y retira los de baja salida.', reward: '+22 pts', status: 'locked' },
    ],
    'Incrementar Pedidos': [
      { label: 'Agenda', detail: `Frecuencia actual: ${frequency}. Programa el siguiente pedido recomendado.`, reward: '+8 pts', status: 'done' },
      { label: 'Recordatorio', detail: 'Activa un aviso antes del dia de recompra con carrito precargado.', reward: '+14 pts', status: 'active' },
      { label: 'Pedido rapido', detail: 'Confirma basicos y agrega una promocion de baja friccion.', reward: '+18 pts', status: 'locked' },
      { label: 'Racha', detail: 'Completa 2 pedidos seguidos sin dejar pasar la semana objetivo.', reward: '+22 pts', status: 'locked' },
    ],
    'Aplicar Promociones': [
      { label: 'Detecta promo', detail: 'Elige una promocion que ya coincide con el historial de compra.', reward: '+8 pts', status: 'done' },
      { label: 'Calcula ahorro', detail: 'Revisa ahorro, puntos y productos que conviene sumar.', reward: '+14 pts', status: 'active' },
      { label: 'Aplica', detail: 'Activa la promo en el pedido sugerido.', reward: '+18 pts', status: 'locked' },
      { label: 'Repite', detail: 'Guarda la promocion si sube recompra o margen.', reward: '+22 pts', status: 'locked' },
    ],
    'Crear Combos': [
      { label: 'Pareja ideal', detail: 'Une los dos productos frecuentes del JSON del usuario.', reward: '+8 pts', status: 'done' },
      { label: 'Precio claro', detail: 'Define un precio facil de comunicar en mostrador.', reward: '+14 pts', status: 'active' },
      { label: 'Promociona', detail: 'Sube foto o TikTok del combo para atraer clientes.', reward: '+18 pts', status: 'locked' },
      { label: 'Escala', detail: 'Convierte el combo en reto semanal si mejora el ticket.', reward: '+22 pts', status: 'locked' },
    ],
    Activacion: [
      { label: 'Reengancha', detail: 'Identifica el gancho comercial para volver a comprar.', reward: '+8 pts', status: 'done' },
      { label: 'Oferta simple', detail: 'Muestra una oferta pequena con productos conocidos.', reward: '+14 pts', status: 'active' },
      { label: 'Primer pedido', detail: 'Completa una recompra sin subir demasiado la inversion.', reward: '+18 pts', status: 'locked' },
      { label: 'Habito', detail: 'Convierte la recompra en recordatorio semanal.', reward: '+22 pts', status: 'locked' },
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
  const [socialMissions, setSocialMissions] = useState(socialMissionSeed)
  const [showTikTokFeed, setShowTikTokFeed] = useState(false)
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
    advanceSocialMission(id)
    if (id === 'tiktok-combo') {
      setShowTikTokFeed(true)
    }
  }

  async function openGoalPath(selectedGoal) {
    const goalTitle = selectedGoal.title || selectedGoal.tipo || 'Meta de crecimiento'
    const steps = buildGoalPath(selectedGoal, profile)
    setSelectedGoalPath({ ...selectedGoal, title: goalTitle, steps })
    setPathCoach('El agente esta preparando tu siguiente movimiento.')
    setIsPathCoachLoading(true)

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Dame un mensaje corto para guiarme en la meta "${goalTitle}". Enfocate en el siguiente paso: "${steps.find((step) => step.status === 'active')?.label}".`,
          history: [],
          customerProfile: localStorage.getItem('tuali_customer_profile') || import.meta.env.VITE_CUSTOMER_PROFILE || DEFAULT_PROFILE_FILE,
          metaState: {
            screen: 'Mi Meta',
            selectedGoal: goalTitle,
            nextStep: steps.find((step) => step.status === 'active'),
            cluster: profile.perfil,
          },
          includeAudio: false,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Agent unavailable')
      setPathCoach(data.reply)
    } catch {
      setPathCoach(`Empieza por "${steps.find((step) => step.status === 'active')?.label}". Tuali te acompana con una accion pequena y medible para avanzar hoy.`)
    } finally {
      setIsPathCoachLoading(false)
    }
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
                <span>{meta.icon}</span>
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
            <p>Acciones calculadas desde su perfil y metas.</p>
          </div>
          <span className="goal-streak">4 dias</span>
        </div>

        {plan.recommendations.map((rec, index) => {
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
                  <button className="mission-path" onClick={() => openGoalPath({ ...rec, title: rec.tag, objective: rec.impact })}>
                    Ver pasos
                  </button>
                  <button className="mission-secondary" onClick={() => setFeedback('Tuali bajara inversion inicial y ajustara futuras recomendaciones.')}>
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
                {mission.status === 'completada' ? 'Lista' : mission.status === 'en progreso' ? 'Completar' : 'Participar'}
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
                <span>{achievement.icon}</span>
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
            <p>Compites con clientes {profile.perfil} con metas parecidas.</p>
          </div>
        </div>
        <div className="cluster-challenge">
          <strong>{competition.challenge}</strong>
          <span>{competition.prize}</span>
        </div>
        <div className="ranking-list">
          {competition.ranking.map((item, index) => (
            <div className={`ranking-row ${item.me ? 'me' : ''}`} key={item.store}>
              <span className="ranking-pos">{index + 1}</span>
              <div>
                <strong>{item.store}</strong>
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
          <button>Ver reto del cluster</button>
        </div>
      </section>

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

      {selectedGoalPath && (
        <div className="goal-map-overlay" role="dialog" aria-modal="true" aria-label="Camino de meta">
          <div className="goal-map-shell">
            <div className="goal-map-topbar">
              <div>
                <span>Camino de meta</span>
                <strong>{selectedGoalPath.title}</strong>
              </div>
              <button onClick={() => setSelectedGoalPath(null)} aria-label="Cerrar camino">
                X
              </button>
            </div>

            <div className="goal-map-banner">
              <span>Reto {profile.perfil}</span>
              <strong>2/4 pasos</strong>
            </div>

            <div className="goal-map-coach">
              <span>IA</span>
              <p>{isPathCoachLoading ? 'Calculando el siguiente movimiento...' : pathCoach}</p>
            </div>

            <div className="goal-map-road">
              {selectedGoalPath.steps.map((step, index) => (
                <article className={`goal-map-node ${step.status}`} key={`${step.label}-${index}`}>
                  <div className="goal-map-dot">
                    <span>{index + 1}</span>
                  </div>
                  <div className="goal-map-card">
                    <small>{step.reward}</small>
                    <h3>{step.label}</h3>
                    <p>{step.detail}</p>
                    {step.status === 'active' && (
                      <button onClick={() => setFeedback(`Siguiente paso activado: ${step.label}.`)}>
                        Iniciar paso
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}

      <section className="feedback-card">
        <div>
          <h2>Te ayudo esta recomendacion?</h2>
          <p>{feedback || 'Tu respuesta entrena al agente para recomendar mejor la proxima vez.'}</p>
        </div>
        <div className="feedback-actions">
          <button onClick={() => setFeedback('Perfecto. Tuali priorizara misiones similares para este perfil.')}>
            Si, me sirvio
          </button>
          <button onClick={() => setFeedback('Entendido. Te mostrare opciones mas simples y de menor inversion.')}>
            No fue util
          </button>
        </div>
      </section>

      <div className="profile-source">
        Perfil cargado: agente-tuali/Casos Principales/{loggedProfile.fileName}.json
      </div>
    </div>
  )
}
