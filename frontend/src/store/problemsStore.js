import { create } from 'zustand'
import api from '../utils/api'

const useProblemsStore = create((set, get) => ({
  problems: [],
  selectedProblem: null,
  stats: null,
  loading: false,
  error: null,
  filters: { category: '', status: '', sort: 'newest' },
  page: 1,
  totalPages: 1,
  total: 0,

  setFilters: (filters) => set({ filters: { ...get().filters, ...filters }, page: 1 }),
  setPage: (page) => set({ page }),

  fetchProblems: async () => {
    const { filters, page } = get()
    set({ loading: true, error: null })
    try {
      const params = new URLSearchParams({ page, limit: 50, ...filters })
      Object.keys(filters).forEach(k => !filters[k] && params.delete(k))
      const { data } = await api.get(`/problems?${params}`)
      set({ problems: data.problems, total: data.total, totalPages: data.totalPages, loading: false })
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to fetch problems', loading: false })
    }
  },

  fetchProblemById: async (id) => {
    set({ loading: true, error: null, selectedProblem: null })
    try {
      const { data } = await api.get(`/problems/${id}`)
      set({ selectedProblem: data, loading: false })
      return data
    } catch (err) {
      set({ error: err.response?.data?.error || 'Problem not found', loading: false })
      return null
    }
  },

  createProblem: async (formData) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.post('/problems', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const { problems } = get()
      set({ problems: [data.problem, ...problems], loading: false })
      return { success: true, problem: data.problem }
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Failed to create problem'
      set({ error: msg, loading: false })
      return { success: false, error: msg }
    }
  },

  voteProblem: async (id) => {
    try {
      const { data } = await api.post(`/problems/${id}/vote`)
      // Update in list
      set({
        problems: get().problems.map(p => p.id === id ? { ...p, vote_count: data.voteCount } : p),
        selectedProblem: get().selectedProblem?.problem?.id === id
          ? { ...get().selectedProblem, problem: { ...get().selectedProblem.problem, vote_count: data.voteCount }, userVoted: data.voted }
          : get().selectedProblem,
      })
      return data
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Vote failed')
    }
  },

  fetchStats: async () => {
    try {
      const { data } = await api.get('/problems/stats')
      set({ stats: data })
    } catch {}
  },

  clearSelected: () => set({ selectedProblem: null }),
}))

export default useProblemsStore
