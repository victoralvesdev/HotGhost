import { useAuth } from '../contexts/AuthContext'

function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="header-main">
            <div className="logo">
              <span className="logo-icon">[</span>
              <span className="logo-text">HotGhost</span>
              <span className="logo-icon">]</span>
            </div>
            <p className="tagline text-dim">Camuflagem de Criativos</p>
          </div>
          {user && (
            <div className="header-user">
              <span className="user-email text-dim">{user.email}</span>
              <button onClick={logout} className="logout-btn">
                {'>'} Sair
              </button>
            </div>
          )}
        </div>
      </div>
      <style>{`
        .header {
          padding: var(--space-3) 0;
          border-bottom: var(--border-width) solid var(--color-border);
        }
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .header-main {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }
        .logo {
          display: flex;
          align-items: center;
          gap: var(--space-1);
        }
        .logo-icon {
          color: var(--color-text-dim);
          font-size: var(--font-size-2xl);
        }
        .logo-text {
          font-size: var(--font-size-2xl);
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
        }
        .tagline {
          font-size: var(--font-size-sm);
          letter-spacing: 1px;
        }
        .header-user {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }
        .user-email {
          font-size: var(--font-size-sm);
        }
        .logout-btn {
          font-size: var(--font-size-sm);
          padding: var(--space-1) var(--space-2);
        }
        @media (max-width: 600px) {
          .header-content {
            flex-direction: column;
            gap: var(--space-2);
          }
          .header-main {
            align-items: center;
          }
        }
      `}</style>
    </header>
  )
}

export default Header
