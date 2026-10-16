import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import api, { TOKEN_KEY } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)))

  const refreshUser = useCallback(async () => {
    const { data } = await api.get('/auth/me')
    setUser(data)
    return data
  }, [])

  // Page reload pe token se user wapas lao
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return
    refreshUser()
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false))
  }, [refreshUser])

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem(TOKEN_KEY, data.token)
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }

  const hasRole = (...roles) => Boolean(user && roles.includes(user.role))

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout, refreshUser, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
