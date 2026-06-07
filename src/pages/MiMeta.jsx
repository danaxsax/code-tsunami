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
  const targetTicket = Math.max(ticket * 1.1, ticket + 250)
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

export default function MiMeta({ onAvatarClick }) {
  const [accepted, setAccepted] = useState(['Combo inteligente'])
  const [feedback, setFeedback] = useState('')
  const [socialMissions, setSocialMissions] = useState(socialMissionSeed)
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

  return (
    <div className="panel-pad goal-screen">
      <HelloAvatar onClick={onAvatarClick} />

      <section className="goal-hero" style={{ '--goal-color': goal.color }}>
        <div className="goal-hero-top">
          <div>
            <span className="goal-kicker">Mi Meta</span>
            <h2>Abarrotes Chabelita</h2>
            <p>Sesion activa: {profile.customer_id}</p>
          </div>
          <button className="goal-ai-pill" onClick={onAvatarClick}>
            IA
          </button>
        </div>

        <div className="goal-path">
          <div className="goal-node done">1</div>
          <div className="goal-path-line"><span style={{ width: `${goal.progress}%` }} /></div>
          <div className="goal-node active">2</div>
          <div className="goal-path-line muted"><span style={{ width: '18%' }} /></div>
          <div className="goal-node">3</div>
        </div>

        <div className="goal-hero-bottom">
          <span>Meta definida por el perfil</span>
          <strong>{goal.title}</strong>
        </div>
      </section>

      <section className="profile-summary-card">
        <div className="profile-summary-top">
          <span className="goal-chip-icon" style={{ '--goal-color': goal.color }}>{goal.icon}</span>
          <div>
            <h2>Cliente {profile.perfil}</h2>
            <p>{profileCopy[profile.perfil] || 'El agente personaliza metas con el historial de compra.'}</p>
          </div>
        </div>
        <div className="profile-metrics">
          <div>
            <span>Pais</span>
            <strong>{normalizeText(profile.pais)}</strong>
          </div>
          <div>
            <span>Frecuencia</span>
            <strong>{profile.metricas_base.frecuencia}</strong>
          </div>
          <div>
            <span>Ticket</span>
            <strong>{money(profile.metricas_base.ticket_promedio)}</strong>
          </div>
        </div>
      </section>

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
              <div className="generated-goal-pill" key={`${item.tipo}-${item.prioridad}`} style={{ '--goal-color': meta.color }}>
                <span>{meta.icon}</span>
                <div>
                  <strong>{item.tipo}</strong>
                  <small>Prioridad {item.prioridad}</small>
                </div>
              </div>
            )
          })}
        </div>
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

      <section className="missions-section">
        <div className="goal-section-head">
          <div>
            <h2>Misiones recomendadas</h2>
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
          <article className={`social-mission ${mission.status.replace(' ', '-')}`} key={mission.id}>
            <div>
              <div className="social-mission-top">
                <span>{mission.reward}</span>
                <small>{mission.time}</small>
              </div>
              <h3>{mission.title}</h3>
              <p>{mission.reason}</p>
            </div>
            <button onClick={() => advanceSocialMission(mission.id)}>
              {mission.status === 'completada' ? 'Lista' : mission.status === 'en progreso' ? 'Completar' : 'Participar'}
            </button>
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
