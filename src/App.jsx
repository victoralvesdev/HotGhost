import { useState } from 'react'
import { useAuth } from './contexts/AuthContext'
import Login from './components/Login'
import Header from './components/Header'
import TabNav from './components/TabNav'
import TextCamo from './components/TextCamo'
import ImageCamo from './components/ImageCamo'
import VideoCamo from './components/VideoCamo'

const tabs = [
  { id: 'text', label: 'Texto' },
  { id: 'image', label: 'Imagem' },
  { id: 'video', label: 'Video' }
]

function App() {
  const { user, loading } = useAuth()
  const [activeTab, setActiveTab] = useState('text')

  // Mostra loading enquanto verifica autenticacao
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Carregando...</p>
      </div>
    )
  }

  // Se nao estiver logado, mostra tela de login
  if (!user) {
    return <Login />
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'text':
        return <TextCamo />
      case 'image':
        return <ImageCamo />
      case 'video':
        return <VideoCamo />
      default:
        return <TextCamo />
    }
  }

  return (
    <div className="app">
      <Header />
      <TabNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="main-content">
        <div className="container">
          {renderContent()}
        </div>
      </main>
      <style>{`
        .app {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .main-content {
          flex: 1;
          padding: var(--space-3) 0;
        }
        .loading-screen {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
        }
      `}</style>
    </div>
  )
}

export default App
