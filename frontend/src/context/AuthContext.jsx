import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import api from '../utils/api'
import { decodeToken, can, hasRole, ROLES } from '../utils/rbac'

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext(null)

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })
  const [token,   setToken]   = useState(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(false)

  // Keep token decoded role in sync (handles role changes without re-login)
  useEffect(() => {
    if (!token) return
    const decoded = decodeToken(token)
    if (decoded && user && decoded.role !== user.role) {
      setUser(prev => ({ ...prev, role: decoded.role }))
    }
  }, [token])

  // Persist user to localStorage whenever it changes
  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user))
    else      localStorage.removeItem('user')
  }, [user])

  const _setAuth = (token, user) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setToken(token)
    setUser(user)
  }

  const login = useCallback(async (email, password) => {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      _setAuth(data.token, data.user)
      return { success: true, user: data.user }
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Login xatosi' }
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (payload) => {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', payload)
      _setAuth(data.token, data.user)
      return { success: true, user: data.user }
    } catch (err) {
      const msg = err.response?.data?.error
              || err.response?.data?.errors?.[0]?.msg
              || "Ro'yxatdan o'tish xatosi"
      return { success: false, error: msg }
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }, [])

  const refreshProfile = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/profile')
      setUser(data.user)
      return data.user
    } catch { return null }
  }, [])

  // ─── Convenience permission helpers ─────────────────────────────────────────
  const isAuthenticated  = !!user && !!token
  const isAdmin          = hasRole(user, ROLES.ADMIN)
  const isOrganization   = hasRole(user, ROLES.ORGANIZATION)
  const isModerator      = hasRole(user, ROLES.MODERATOR)
  const isUser           = hasRole(user, ROLES.USER)

  const userCan = (permission) => can(user?.role, permission)

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, register, logout, refreshProfile,
      isAuthenticated, isAdmin, isOrganization, isModerator, isUser,
      userCan,
      // so components can check roles directly
      ROLES,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
