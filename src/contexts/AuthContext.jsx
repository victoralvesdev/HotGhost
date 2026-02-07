import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

// Usuarios locais (temporario - depois migra para Supabase)
const LOCAL_USERS = [
  { email: 'admin@hotghost.com', password: 'admin123' },
  { email: 'user@hotghost.com', password: 'user123' },
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verifica se tem usuario salvo no localStorage
    const savedUser = localStorage.getItem('hotghost_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = (email, password) => {
    const foundUser = LOCAL_USERS.find(
      u => u.email === email && u.password === password
    )

    if (foundUser) {
      const userData = { email: foundUser.email }
      setUser(userData)
      localStorage.setItem('hotghost_user', JSON.stringify(userData))
      return { success: true }
    }

    return { success: false, error: 'Email ou senha incorretos' }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('hotghost_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}
