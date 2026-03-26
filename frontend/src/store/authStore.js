// Thin Zustand wrapper — delegates to AuthContext for auth logic
// This exists for backward-compat. New code should use useAuth() directly.
import { create } from 'zustand'
import api from '../utils/api'

const useAuthStore = create((set) => ({
  user:  (() => { try { return JSON.parse(localStorage.getItem('user')) } catch { return null } })(),
  token: localStorage.getItem('token'),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      set({ user: data.user, token: data.token, loading: false })
      return { success: true, user: data.user }
    } catch (err) {
      const msg = err.response?.data?.error || 'Login xatosi'
      set({ error: msg, loading: false })
      return { success: false, error: msg }
    }
  },

  register: async (payload) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.post('/auth/register', payload)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      set({ user: data.user, token: data.token, loading: false })
      return { success: true, user: data.user }
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || "Ro'yxatdan o'tish xatosi"
      set({ error: msg, loading: false })
      return { success: false, error: msg }
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, token: null })
  },

  refreshProfile: async () => {
    try {
      const { data } = await api.get('/auth/profile')
      localStorage.setItem('user', JSON.stringify(data.user))
      set({ user: data.user })
    } catch {}
  },

  clearError: () => set({ error: null }),
}))

export default useAuthStore
