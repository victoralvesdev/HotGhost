import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

const SIGNUP_URL = 'https://pay.kirvano.com/148ddb5b-aeb0-4628-aefc-7bd430499ad1'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(email, password)

    if (!result.success) {
      setError(result.error)
    }

    setLoading(false)
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <div className="logo">
            <span className="logo-icon">[</span>
            <span className="logo-text">HotGhost</span>
            <span className="logo-icon">]</span>
          </div>
          <p className="tagline text-dim">Acesso ao Sistema</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}

          <div className="field">
            <label className="label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              autoFocus
              autoComplete="email"
            />
          </div>

          <div className="field">
            <label className="label">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="primary login-btn" disabled={loading}>
            {loading ? '> Entrando...' : '> Entrar'}
          </button>
        </form>

        <div className="signup-link">
          <span className="text-dim">Nao tem uma conta?</span>{' '}
          <a
            href={SIGNUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="signup-anchor"
          >
            Cadastre-se
          </a>
        </div>

        <div className="login-footer text-dim">
          Sistema de camuflagem de criativos
        </div>
      </div>

      <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-3);
        }
        .login-box {
          width: 100%;
          max-width: 400px;
          background: var(--bg-secondary);
          border: var(--border-width) solid var(--color-border);
          border-radius: var(--border-radius);
          padding: var(--space-4);
        }
        .login-header {
          text-align: center;
          margin-bottom: var(--space-4);
        }
        .logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-1);
          margin-bottom: var(--space-1);
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
        .login-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }
        .field {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }
        .label {
          font-size: var(--font-size-sm);
          color: var(--color-text-dim);
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .field input {
          width: 100%;
          padding: var(--space-2);
        }
        .error-message {
          background: rgba(255, 0, 0, 0.1);
          border: var(--border-width) solid rgba(255, 0, 0, 0.3);
          color: #ff4444;
          padding: var(--space-2);
          border-radius: var(--border-radius);
          font-size: var(--font-size-sm);
          text-align: center;
        }
        .login-btn {
          width: 100%;
          padding: var(--space-2);
          font-size: var(--font-size-md);
          margin-top: var(--space-2);
        }
        .signup-link {
          text-align: center;
          margin-top: var(--space-3);
          font-size: var(--font-size-sm);
        }
        .signup-anchor {
          color: var(--color-primary);
          text-decoration: none;
          font-weight: 600;
          transition: opacity 0.2s;
        }
        .signup-anchor:hover {
          opacity: 0.8;
          text-decoration: underline;
        }
        .login-footer {
          text-align: center;
          margin-top: var(--space-3);
          font-size: var(--font-size-xs);
          padding-top: var(--space-3);
          border-top: var(--border-width) solid var(--color-border);
        }
      `}</style>
    </div>
  )
}

export default Login
