import { useState } from 'react'
import './App.css'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import Header from './components/Header.jsx'
import TabBar from './components/TabBar.jsx'
import Inicio from './pages/Inicio.jsx'
import Productos from './pages/Productos.jsx'
import Gana from './pages/Gana.jsx'
import MiMeta from './pages/MiMeta.jsx'
import Pedidos from './pages/Pedidos.jsx'
import Ai from './pages/Ai.jsx'
import Login from './pages/Login.jsx'

function AppContent() {
  const [activeTab, setActiveTab] = useState('inicio')
  const { isLoggedIn } = useAuth()

  if (!isLoggedIn) return <Login />

  const panels = {
    inicio: Inicio,
    productos: Productos,
    gana: Gana,
    mimeta: MiMeta,
    pedidos: Pedidos,
    ai: Ai,
  }

  const ActivePanel = panels[activeTab]
  const goToAi = () => setActiveTab('ai')

  return (
    <div className="app">
      <Header />

      <main className="main">
        <div className={`panel ${activeTab === 'inicio' ? 'active' : ''}`} id="panel-inicio"><Inicio onAvatarClick={goToAi} /></div>
        <div className={`panel ${activeTab === 'productos' ? 'active' : ''}`} id="panel-productos"><Productos onAvatarClick={goToAi} /></div>
        <div className={`panel ${activeTab === 'gana' ? 'active' : ''}`} id="panel-gana"><Gana onAvatarClick={goToAi} /></div>
        <div className={`panel ${activeTab === 'mimeta' ? 'active' : ''}`} id="panel-mimeta"><MiMeta onAvatarClick={goToAi} /></div>
        <div className={`panel ${activeTab === 'pedidos' ? 'active' : ''}`} id="panel-pedidos"><Pedidos onAvatarClick={goToAi} /></div>
        <div className={`panel ${activeTab === 'ai' ? 'active' : ''}`} id="panel-ai"><Ai /></div>
      </main>

      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
