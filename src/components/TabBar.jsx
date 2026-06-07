const tabs = [
  {
    id: 'inicio',
    label: 'Inicio',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 11l9-8 9 8" />
        <path d="M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9" />
        <path d="M9 20v-6h6v6" />
      </svg>
    ),
  },
  {
    id: 'productos',
    label: 'Productos',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    id: 'gana',
    label: 'Gana',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l2.7 5.5 6 .9-4.35 4.2 1 6L12 17.8 6.65 19.6l1-6L3.3 9.4l6-.9z" />
      </svg>
    ),
  },
  {
    id: 'pedidos',
    label: 'Pedidos',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5C9.5 3.5 6 3.5 3.5 4.5v14C6 17.5 9.5 17.5 12 19" />
        <path d="M12 5c2.5-1.5 6-1.5 8.5-.5v14c-2.5-1-6-1-8.5.5" />
        <path d="M12 5v14" />
        <line x1="6" y1="8" x2="9.5" y2="8.6" />
        <line x1="6" y1="11" x2="9.5" y2="11.6" />
      </svg>
    ),
  },
  {
    id: 'ai',
    label: 'AI',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <line x1="12" y1="11" x2="12" y2="16" />
        <circle cx="12" cy="7.8" r="0.6" className="fillable" strokeWidth="1.4" />
      </svg>
    ),
  },
]

export default function TabBar({ activeTab, onTabChange }) {
  return (
    <nav className="tabbar">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          <span className="tab-icon">{tab.icon}</span>
          <span className="tab-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}
