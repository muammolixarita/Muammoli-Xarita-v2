import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Building2, ChevronRight, CheckCircle2, Clock } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import { useAuth } from '../../context/AuthContext'
import { getAllowedStatuses, ROLE_META } from '../../utils/rbac'
import StatusBadge from '../../components/ui/StatusBadge'
import CategoryBadge from '../../components/ui/CategoryBadge'
import { timeAgo } from '../../utils/constants'
import { toast } from 'react-hot-toast'
import api from '../../utils/api'

export default function OrgPage() {
  const { user }        = useAuth()
  const [problems, setProblems] = useState([])
  const [org,      setOrg]      = useState(null)
  const [filter,   setFilter]   = useState('')
  const [updating, setUpdating] = useState(null)

  const allowedStatuses = getAllowedStatuses('organization')  // ['in_progress', 'resolved']

  useEffect(() => {
    api.get('/org/profile').then(r => setOrg(r.data.organization)).catch(() => {})
    loadProblems()
  }, [filter])

  const loadProblems = () => {
    const p = filter ? `?status=${filter}` : ''
    api.get(`/org/problems${p}`)
      .then(r => setProblems(r.data.problems))
      .catch(() => {})
  }

  const changeStatus = async (id, status) => {
    setUpdating(id)
    try {
      const { data } = await api.patch(`/problems/${id}/status`, { status })
      setProblems(prev => prev.map(p => p.id === id ? { ...p, status: data.problem.status } : p))
      toast.success(`Status "${status}" ga o'zgartirildi`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Xato yuz berdi')
    } finally {
      setUpdating(null)
    }
  }

  const stats = {
    total:      problems.length,
    new:        problems.filter(p => p.status === 'new' || p.status === 'open').length,
    inProgress: problems.filter(p => p.status === 'in_progress').length,
    resolved:   problems.filter(p => p.status === 'resolved').length,
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 animate-slide-up">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
                <Building2 size={18} className="text-blue-400" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-white">
                  {org?.name_uz || org?.name || 'Tashkilot paneli'}
                </h1>
                <p className="text-surface-400 text-sm">{user?.email}</p>
              </div>
            </div>
          </div>
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-xl ${ROLE_META.organization.badge}`}>
            🏛️ Tashkilot
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Jami',        value: stats.total,      icon: '📋', cls: 'text-surface-400 bg-surface-800' },
            { label: 'Kutilmoqda',  value: stats.new,        icon: '🟡', cls: 'text-amber-400 bg-amber-500/10'  },
            { label: 'Jarayonda',   value: stats.inProgress, icon: '🔵', cls: 'text-blue-400 bg-blue-500/10'    },
            { label: 'Hal qilindi', value: stats.resolved,   icon: '🟢', cls: 'text-brand-400 bg-brand-500/10'  },
          ].map(({ label, value, icon, cls }) => (
            <div key={label} className="card p-4">
              <div className={`inline-flex text-lg mb-2 w-9 h-9 rounded-xl items-center justify-center ${cls}`}>{icon}</div>
              <div className="font-display text-2xl font-bold text-white">{value}</div>
              <div className="text-xs text-surface-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex gap-2 flex-wrap">
          {['', 'new', 'open', 'in_progress', 'resolved'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                filter === s
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                  : 'bg-surface-800 text-surface-400 border-surface-700 hover:text-white'
              }`}
            >
              {s || 'Barchasi'}
            </button>
          ))}
        </div>

        {/* Problems list */}
        <div className="space-y-3">
          {problems.length === 0 ? (
            <div className="card p-12 text-center text-surface-500">
              <Building2 size={40} className="mx-auto mb-3 text-surface-700" />
              <p>Muammolar topilmadi</p>
            </div>
          ) : problems.map(p => (
            <div key={p.id} className="card p-4 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-2 mb-2">
                  <CategoryBadge category={p.category} />
                  <StatusBadge   status={p.status} />
                  {p.priority === 'critical' && (
                    <span className="badge text-xs bg-red-500/15 text-red-400">🔴 Kritik</span>
                  )}
                </div>
                <p className="font-semibold text-surface-100 text-sm truncate">{p.title}</p>
                <div className="flex flex-wrap gap-3 mt-1 text-xs text-surface-500">
                  {p.user_name    && <span>👤 {p.user_name}</span>}
                  {p.address      && <span>📍 {p.address}</span>}
                  <span>🕐 {timeAgo(p.created_at)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Status changer — only allowed statuses */}
                <div className="flex flex-col gap-1.5">
                  {allowedStatuses.map(s => (
                    <button
                      key={s}
                      disabled={p.status === s || updating === p.id}
                      onClick={() => changeStatus(p.id, s)}
                      className={`text-xs px-3 py-1 rounded-lg border font-semibold transition-all ${
                        p.status === s
                          ? s === 'in_progress'
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 cursor-default'
                            : 'bg-brand-500/20 text-brand-300 border-brand-500/40 cursor-default'
                          : 'bg-surface-800 text-surface-400 border-surface-700 hover:text-white hover:border-surface-600'
                      } disabled:opacity-50`}
                    >
                      {updating === p.id ? '...' : s === 'in_progress' ? '🔵 Jarayonda' : '🟢 Hal qilindi'}
                    </button>
                  ))}
                </div>

                <Link to={`/problems/${p.id}`} className="btn-ghost text-xs p-2">
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
