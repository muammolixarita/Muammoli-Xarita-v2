import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { Shield, Users, MapPin, BarChart3, ChevronRight } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import { useAuth } from '../../context/AuthContext'
import { ROLE_META, ROLES } from '../../utils/rbac'
import api from '../../utils/api'
import StatusBadge from '../../components/ui/StatusBadge'
import CategoryBadge from '../../components/ui/CategoryBadge'
import { timeAgo } from '../../utils/constants'

// ─── Admin shell with sidebar ─────────────────────────────────────────────────
export default function AdminPage() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-6">
        <AdminSidebar />
        <div className="flex-1 min-w-0">
          <Routes>
            <Route index             element={<AdminStats />} />
            <Route path="users"      element={<AdminUsers />} />
            <Route path="problems"   element={<AdminProblems />} />
          </Routes>
        </div>
      </div>
    </Layout>
  )
}

function AdminSidebar() {
  const loc = useLocation()
  const links = [
    { to: '/admin',          label: 'Statistika',  icon: BarChart3 },
    { to: '/admin/users',    label: 'Foydalanuvchilar', icon: Users },
    { to: '/admin/problems', label: 'Muammolar',   icon: MapPin },
  ]
  return (
    <aside className="w-52 shrink-0 hidden md:block">
      <div className="card p-3 sticky top-20">
        <div className="flex items-center gap-2 px-2 py-2 mb-3 border-b border-surface-800">
          <Shield size={16} className="text-red-400" />
          <span className="font-display font-bold text-sm text-white">Admin Panel</span>
        </div>
        <nav className="flex flex-col gap-1">
          {links.map(({ to, label, icon: Icon }) => {
            const active = loc.pathname === to
            return (
              <Link key={to} to={to}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all
                  ${active ? 'bg-red-500/15 text-red-300' : 'text-surface-400 hover:text-white hover:bg-surface-800'}`}
              >
                <Icon size={15} />{label}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

// ─── Stats dashboard ──────────────────────────────────────────────────────────
function AdminStats() {
  const [data, setData] = useState(null)
  useEffect(() => {
    api.get('/admin/stats').then(r => setData(r.data)).catch(() => {})
  }, [])

  if (!data) return <LoadingCards />

  return (
    <div className="space-y-6 animate-slide-up">
      <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
        <Shield size={20} className="text-red-400" /> Admin Dashboard
      </h1>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Jami foydalanuvchilar" value={data.totalUsers}    color="red" />
        <StatCard label="Jami muammolar"        value={data.totalProblems} color="blue" />
        {data.byStatus?.map(s => (
          s.status === 'new'      ? <StatCard key="new" label="Yangi" value={s.count} color="amber" /> :
          s.status === 'resolved' ? <StatCard key="res" label="Hal qilindi" value={s.count} color="green" /> : null
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* By role */}
        <div className="card p-5">
          <h3 className="font-semibold text-white mb-4 text-sm">Rollar bo'yicha foydalanuvchilar</h3>
          <div className="space-y-3">
            {data.byRole?.map(({ role, count }) => {
              const m = ROLE_META[role]
              return (
                <div key={role} className="flex items-center justify-between">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${m?.badge}`}>
                    {m?.icon} {m?.label || role}
                  </span>
                  <span className="font-display font-bold text-white">{count}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* By status */}
        <div className="card p-5">
          <h3 className="font-semibold text-white mb-4 text-sm">Status bo'yicha muammolar</h3>
          <div className="space-y-3">
            {data.byStatus?.map(({ status, count }) => (
              <div key={status} className="flex items-center justify-between">
                <StatusBadge status={status} />
                <span className="font-display font-bold text-white">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── User management ──────────────────────────────────────────────────────────
function AdminUsers() {
  const [users, setUsers]   = useState([])
  const [total, setTotal]   = useState(0)
  const [search, setSearch] = useState('')
  const [role,   setRole]   = useState('')
  const [page,   setPage]   = useState(1)
  const [saving, setSaving] = useState(null)

  const load = () => {
    const p = new URLSearchParams({ page, limit: 15 })
    if (search) p.set('search', search)
    if (role)   p.set('role', role)
    api.get(`/admin/users?${p}`).then(r => { setUsers(r.data.users); setTotal(r.data.total) }).catch(() => {})
  }

  useEffect(() => { load() }, [page, role])

  const updateRole = async (userId, newRole, orgId = null) => {
    setSaving(userId)
    try {
      const { data } = await api.patch(`/admin/users/${userId}/role`, { role: newRole, organization_id: orgId })
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...data.user } : u))
    } catch {}
    setSaving(null)
  }

  const toggleActive = async (userId) => {
    setSaving(userId)
    try {
      const { data } = await api.patch(`/admin/users/${userId}/toggle-active`)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: data.user.is_active } : u))
    } catch {}
    setSaving(null)
  }

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
          <Users size={18} className="text-red-400" /> Foydalanuvchilar
          <span className="text-sm text-surface-500 font-normal">({total})</span>
        </h2>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <input
          className="input text-sm flex-1 min-w-[160px]"
          placeholder="Ism yoki email qidirish..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && load()}
        />
        <select className="input text-sm w-40" value={role} onChange={e => { setRole(e.target.value); setPage(1) }}>
          <option value="">Barcha rollar</option>
          {Object.values(ROLES).map(r => <option key={r} value={r}>{ROLE_META[r]?.label}</option>)}
        </select>
        <button onClick={load} className="btn-secondary text-sm">Qidirish</button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-800 text-xs text-surface-500 uppercase tracking-wide">
                <th className="text-left px-4 py-3">Foydalanuvchi</th>
                <th className="text-left px-4 py-3">Rol</th>
                <th className="text-left px-4 py-3">Muammolar</th>
                <th className="text-left px-4 py-3">Holat</th>
                <th className="text-left px-4 py-3">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800">
              {users.map(u => {
                const m = ROLE_META[u.role]
                return (
                  <tr key={u.id} className="hover:bg-surface-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-surface-100">{u.name}</div>
                      <div className="text-xs text-surface-500">{u.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        disabled={saving === u.id}
                        onChange={e => updateRole(u.id, e.target.value)}
                        className="bg-surface-800 border border-surface-700 rounded-lg px-2 py-1 text-xs text-surface-300 focus:outline-none focus:border-brand-500 cursor-pointer"
                      >
                        {Object.values(ROLES).map(r => (
                          <option key={r} value={r}>{ROLE_META[r]?.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-surface-400">{u._count?.problems ?? 0}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${u.is_active ? 'bg-brand-500/15 text-brand-400' : 'bg-red-500/15 text-red-400'}`}>
                        {u.is_active ? 'Faol' : 'Bloklangan'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(u.id)}
                        disabled={saving === u.id}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all font-semibold ${
                          u.is_active
                            ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                            : 'border-brand-500/30 text-brand-400 hover:bg-brand-500/10'
                        }`}
                      >
                        {saving === u.id ? '...' : u.is_active ? 'Bloklash' : 'Faollashtirish'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="text-center py-12 text-surface-500">Foydalanuvchilar topilmadi</div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {total > 15 && (
        <div className="flex items-center gap-2 justify-center">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn-secondary text-sm">←</button>
          <span className="text-sm text-surface-400">{page} / {Math.ceil(total / 15)}</span>
          <button disabled={page >= Math.ceil(total / 15)} onClick={() => setPage(p => p + 1)} className="btn-secondary text-sm">→</button>
        </div>
      )}
    </div>
  )
}

// ─── Problem management ───────────────────────────────────────────────────────
function AdminProblems() {
  const [problems, setProblems] = useState([])
  const [total,    setTotal]    = useState(0)
  const [page,     setPage]     = useState(1)
  const [status,   setStatus]   = useState('')
  const [deleting, setDeleting] = useState(null)

  const STATUSES = ['new', 'open', 'in_progress', 'resolved', 'rejected']

  const load = () => {
    const p = new URLSearchParams({ page, limit: 15 })
    if (status) p.set('status', status)
    api.get(`/problems/admin/all?${p}`).then(r => { setProblems(r.data.problems); setTotal(r.data.total) }).catch(() => {})
  }

  useEffect(() => { load() }, [page, status])

  const deleteProblem = async (id) => {
    if (!confirm("Muammoni o'chirishni tasdiqlaysizmi?")) return
    setDeleting(id)
    try {
      await api.delete(`/problems/${id}`)
      setProblems(prev => prev.filter(p => p.id !== id))
    } catch {}
    setDeleting(null)
  }

  const changeStatus = async (id, newStatus) => {
    try {
      const { data } = await api.patch(`/problems/${id}/status`, { status: newStatus })
      setProblems(prev => prev.map(p => p.id === id ? { ...p, status: data.problem.status } : p))
    } catch {}
  }

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
          <MapPin size={18} className="text-red-400" /> Muammolar
          <span className="text-sm text-surface-500 font-normal">({total})</span>
        </h2>
        <select className="input text-sm w-40" value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}>
          <option value="">Barcha statuslar</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="space-y-2">
        {problems.map(p => (
          <div key={p.id} className="card p-4 flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-2 mb-1">
                <CategoryBadge category={p.category} />
                <StatusBadge   status={p.status} />
              </div>
              <p className="font-semibold text-surface-100 text-sm truncate">{p.title}</p>
              <p className="text-xs text-surface-500 mt-0.5">{p.user_name} · {timeAgo(p.created_at)}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Quick status change */}
              <select
                value={p.status}
                onChange={e => changeStatus(p.id, e.target.value)}
                className="bg-surface-800 border border-surface-700 rounded-lg px-2 py-1.5 text-xs text-surface-300 focus:outline-none focus:border-brand-500"
              >
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              <Link to={`/problems/${p.id}`} className="btn-ghost text-xs py-1.5 px-2">
                <ChevronRight size={14} />
              </Link>

              <button
                onClick={() => deleteProblem(p.id)}
                disabled={deleting === p.id}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all font-semibold"
              >
                {deleting === p.id ? '...' : "O'chirish"}
              </button>
            </div>
          </div>
        ))}
        {problems.length === 0 && <div className="text-center py-12 text-surface-500 card p-8">Muammolar topilmadi</div>}
      </div>

      {total > 15 && (
        <div className="flex items-center gap-2 justify-center">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn-secondary text-sm">←</button>
          <span className="text-sm text-surface-400">{page} / {Math.ceil(total / 15)}</span>
          <button disabled={page >= Math.ceil(total / 15)} onClick={() => setPage(p => p + 1)} className="btn-secondary text-sm">→</button>
        </div>
      )}
    </div>
  )
}

// ─── Shared helpers ───────────────────────────────────────────────────────────
function StatCard({ label, value, color = 'surface' }) {
  const c = { red: 'text-red-400 bg-red-500/10', blue: 'text-blue-400 bg-blue-500/10', amber: 'text-amber-400 bg-amber-500/10', green: 'text-brand-400 bg-brand-500/10', surface: 'text-surface-400 bg-surface-800/50' }
  return (
    <div className="card p-4">
      <div className={`inline-flex p-2 rounded-xl mb-2 ${c[color]}`}><BarChart3 size={16} /></div>
      <div className="font-display text-2xl font-bold text-white">{value ?? '—'}</div>
      <div className="text-xs text-surface-500 mt-0.5">{label}</div>
    </div>
  )
}

function LoadingCards() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[1,2,3,4].map(i => <div key={i} className="card p-4 h-24 animate-pulse bg-surface-800" />)}
    </div>
  )
}
