import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  LayoutDashboard, MapPin, ThumbsUp, MessageCircle, Clock,
  CheckCircle2, AlertCircle, PlusCircle, TrendingUp, User
} from 'lucide-react'
import Layout from '../components/layout/Layout'
import CategoryBadge from '../components/ui/CategoryBadge'
import StatusBadge from '../components/ui/StatusBadge'
import { useAuth } from '../context/AuthContext'
import { ROLE_META } from '../utils/rbac'
import { timeAgo, STATUSES } from '../utils/constants'
import api from '../utils/api'

export default function DashboardPage() {
  const { user, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [problems, setProblems] = useState([])
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState(null)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    loadData()
  }, [user])

  const loadData = async () => {
    setLoading(true)
    try {
      const [problemsRes, profileRes] = await Promise.all([
        api.get('/problems/my/list'),
        api.get('/auth/profile'),
      ])
      setProblems(problemsRes.data.problems)
      setProfileData(profileRes.data.user)
    } catch (err) {
      toast.error('Ma\'lumotlarni yuklashda xato')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  const stats = {
    total: problems.length,
    open: problems.filter(p => p.status === 'open').length,
    inProgress: problems.filter(p => p.status === 'in_progress').length,
    solved: problems.filter(p => p.status === 'solved').length,
    totalVotes: problems.reduce((acc, p) => acc + (parseInt(p.vote_count) || 0), 0),
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-slide-up">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center">
              <span className="font-display text-2xl font-bold text-brand-400">
                {user.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-white">{user.name}</h1>
              <p className="text-surface-400 text-sm flex items-center gap-2">
                <User size={13} /> {user.email}
                {user.district && <><span>·</span><MapPin size={13} />{user.district}</>}
              </p>
            </div>
          </div>
          <Link to="/report" className="btn-primary hidden sm:flex">
            <PlusCircle size={15} /> Muammo bildirish
          </Link>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 animate-slide-up">
          <DashStat icon={MapPin} label="Jami muammolar" value={stats.total} />
          <DashStat icon={AlertCircle} label="Ochiq" value={stats.open} accent="amber" />
          <DashStat icon={Clock} label="Jarayonda" value={stats.inProgress} accent="blue" />
          <DashStat icon={CheckCircle2} label="Hal qilindi" value={stats.solved} accent="green" />
        </div>

        {/* Second row stats */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="card p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-brand-500/10">
              <ThumbsUp size={18} className="text-brand-400" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-white">{stats.totalVotes}</p>
              <p className="text-xs text-surface-500">Jami ovozlar olindi</p>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-surface-800">
              <TrendingUp size={18} className="text-surface-400" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-white">
                {stats.total > 0 ? Math.round((stats.solved / stats.total) * 100) : 0}%
              </p>
              <p className="text-xs text-surface-500">Hal qilish darajasi</p>
            </div>
          </div>
        </div>

        {/* Problems list */}
        <div className="animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
              <LayoutDashboard size={18} className="text-surface-400" />
              Mening muammolarim
            </h2>
            <Link to="/report" className="btn-primary sm:hidden text-xs py-2 px-3">
              <PlusCircle size={13} /> Yangi
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="card p-5 animate-pulse">
                  <div className="flex gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-surface-800 rounded w-3/4" />
                      <div className="h-3 bg-surface-800 rounded w-1/2" />
                    </div>
                    <div className="w-20 h-8 bg-surface-800 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : problems.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="text-5xl mb-4">🗺️</div>
              <p className="font-semibold text-surface-300 text-lg mb-2">Hali muammo bildirmagansiz</p>
              <p className="text-surface-500 text-sm mb-6">Atrofingizda muammo ko'rdingizmi? Bildiring!</p>
              <Link to="/report" className="btn-primary">
                <PlusCircle size={15} /> Muammo bildirish
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {problems.map(p => (
                <Link
                  key={p.id}
                  to={`/problems/${p.id}`}
                  className="card-hover p-4 flex items-start gap-4 group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <CategoryBadge category={p.category} />
                      <StatusBadge status={p.status} />
                    </div>
                    <h3 className="font-semibold text-surface-200 text-sm leading-snug truncate group-hover:text-white transition-colors">
                      {p.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-2 text-xs text-surface-500">
                      <span className="flex items-center gap-1"><ThumbsUp size={11} />{p.vote_count || 0}</span>
                      <span className="flex items-center gap-1"><MessageCircle size={11} />{p.comment_count || 0}</span>
                      <span className="flex items-center gap-1"><Clock size={11} />{timeAgo(p.created_at)}</span>
                      {p.org_name && <span className="truncate">· {p.org_name}</span>}
                    </div>
                  </div>
                  <span className="text-surface-600 group-hover:text-brand-400 transition-colors text-sm shrink-0">→</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

function DashStat({ icon: Icon, label, value, accent = 'surface' }) {
  const accents = {
    surface: 'bg-surface-800/50 text-surface-400',
    amber:   'bg-amber-500/10 text-amber-400',
    blue:    'bg-blue-500/10 text-blue-400',
    green:   'bg-brand-500/10 text-brand-400',
  }
  return (
    <div className="card p-4">
      <div className={`inline-flex p-2 rounded-xl mb-2 ${accents[accent]}`}>
        <Icon size={16} />
      </div>
      <div className="font-display text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-surface-500 mt-0.5">{label}</div>
    </div>
  )
}
