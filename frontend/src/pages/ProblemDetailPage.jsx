import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  ThumbsUp, MessageCircle, MapPin, Calendar, Building2, Sparkles,
  ArrowLeft, Send, Clock, CheckCircle2, XCircle, AlertCircle, User
} from 'lucide-react'
import Layout from '../components/layout/Layout'
import CategoryBadge from '../components/ui/CategoryBadge'
import StatusBadge from '../components/ui/StatusBadge'
import useProblemsStore from '../store/problemsStore'
import { useAuth } from '../context/AuthContext'
import { getAllowedStatuses } from '../utils/rbac'
import { timeAgo, formatDate, CATEGORIES, PRIORITIES } from '../utils/constants'
import api from '../utils/api'

export default function ProblemDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { fetchProblemById, selectedProblem, voteProblem, loading } = useProblemsStore()
  const { user } = useAuth()
  const [comment, setComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [comments, setComments] = useState([])
  const [userVoted, setUserVoted] = useState(false)
  const [voteCount, setVoteCount] = useState(0)

  useEffect(() => {
    fetchProblemById(id).then(data => {
      if (data) {
        setComments(data.comments || [])
        setUserVoted(data.userVoted || false)
        setVoteCount(parseInt(data.problem?.vote_count) || 0)
      }
    })
  }, [id])

  const handleVote = async () => {
    if (!user) return toast.error('Ovoz berish uchun tizimga kiring')
    try {
      const data = await voteProblem(id)
      setUserVoted(data.voted)
      setVoteCount(data.voteCount)
      toast.success(data.voted ? '👍 Ovoz berildi' : 'Ovoz bekor qilindi')
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!user) return toast.error('Izoh qoldirish uchun tizimga kiring')
    if (!comment.trim()) return
    setSubmittingComment(true)
    try {
      const { data } = await api.post(`/problems/${id}/comments`, { content: comment })
      setComments(prev => [...prev, data.comment])
      setComment('')
      toast.success('Izoh qo\'shildi')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Xato yuz berdi')
    } finally {
      setSubmittingComment(false)
    }
  }

  if (loading && !selectedProblem) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto px-4 py-10">
          <div className="card p-6 animate-pulse space-y-4">
            <div className="h-64 bg-surface-800 rounded-xl" />
            <div className="h-6 bg-surface-800 rounded-lg w-3/4" />
            <div className="h-4 bg-surface-800 rounded-lg w-1/2" />
          </div>
        </div>
      </Layout>
    )
  }

  if (!selectedProblem?.problem) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle size={48} className="text-surface-600 mx-auto mb-4" />
            <h2 className="font-display text-xl font-bold text-white mb-2">Muammo topilmadi</h2>
            <button onClick={() => navigate('/')} className="btn-secondary mt-4">
              <ArrowLeft size={15} /> Bosh sahifaga
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  const { problem } = selectedProblem
  const ai = problem.ai_analysis

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="btn-ghost mb-6 text-sm"
        >
          <ArrowLeft size={15} /> Orqaga
        </button>

        <div className="space-y-5 animate-slide-up">
          {/* Main card */}
          <div className="card overflow-hidden">
            {/* Image */}
            {problem.image_url && (
              <div className="w-full h-72 bg-surface-800">
                <img src={problem.image_url} alt={problem.title} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="p-6">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <CategoryBadge category={problem.category} size="lg" />
                <StatusBadge status={problem.status} size="lg" />
                {problem.priority && PRIORITIES[problem.priority] && (
                  <span className={`badge text-xs px-2.5 py-1 ${
                    problem.priority === 'critical' ? 'bg-red-500/15 text-red-400' :
                    problem.priority === 'high'     ? 'bg-orange-500/15 text-orange-400' :
                    problem.priority === 'medium'   ? 'bg-amber-500/15 text-amber-400' :
                                                      'bg-surface-700 text-surface-400'
                  }`}>
                    {PRIORITIES[problem.priority].label}
                  </span>
                )}
              </div>

              {/* Status o'zgartirish — faqat admin / org_member ko'radi */}
              {user && ['admin', 'org_member'].includes(user.role) && (
                <AdminStatusChanger
                  problemId={problem.id}
                  currentStatus={problem.status}
                  problemTitle={problem.title}
                />
              )}

              <h1 className="font-display text-2xl font-bold text-white mb-3 leading-snug">
                {problem.title}
              </h1>

              <p className="text-surface-300 text-sm leading-relaxed mb-5">
                {problem.description}
              </p>

              {/* Meta info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-surface-400 border-t border-surface-800 pt-4">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-surface-600" />
                  <span>{problem.user_name}</span>
                  {problem.user_district && <span className="text-surface-600">· {problem.user_district}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-surface-600" />
                  <span>{formatDate(problem.created_at)}</span>
                  <span className="text-surface-600">({timeAgo(problem.created_at)})</span>
                </div>
                {problem.address && (
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <MapPin size={14} className="text-surface-600" />
                    <span>{problem.address}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-brand-500" />
                  <span className="font-mono text-xs">
                    {parseFloat(problem.latitude).toFixed(5)}, {parseFloat(problem.longitude).toFixed(5)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Analysis */}
          {ai && (
            <div className="card p-5 border-brand-500/20 bg-brand-500/5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={16} className="text-brand-400" />
                <h2 className="font-semibold text-white text-sm">AI Tahlili</h2>
                <span className="text-xs text-surface-500 ml-auto">
                  Ishonch: {Math.round((ai.confidence || 0) * 100)}%
                </span>
              </div>
              {ai.summary && (
                <p className="text-sm text-surface-300 mb-4">{ai.summary}</p>
              )}
              <div className="grid grid-cols-2 gap-3">
                {ai.estimatedResolutionDays && (
                  <div className="bg-surface-800/60 rounded-xl p-3">
                    <p className="text-xs text-surface-500 mb-1">Taxminiy hal qilish muddati</p>
                    <p className="font-semibold text-white text-sm">{ai.estimatedResolutionDays} kun</p>
                  </div>
                )}
                {ai.tags?.length > 0 && (
                  <div className="bg-surface-800/60 rounded-xl p-3">
                    <p className="text-xs text-surface-500 mb-1">Teglar</p>
                    <div className="flex flex-wrap gap-1">
                      {ai.tags.map(t => (
                        <span key={t} className="text-xs bg-surface-700 text-surface-300 px-1.5 py-0.5 rounded-md">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Organization */}
          {problem.org_name && (
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Building2 size={16} className="text-surface-400" />
                <h2 className="font-semibold text-white text-sm">Yo'naltirilgan tashkilot</h2>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface-800 flex items-center justify-center text-xl shrink-0">
                  {CATEGORIES[problem.category]?.emoji}
                </div>
                <div>
                  <p className="font-semibold text-white">{problem.org_name_uz || problem.org_name}</p>
                  {problem.org_email && <p className="text-xs text-surface-400 mt-0.5">{problem.org_email}</p>}
                  {problem.org_phone && <p className="text-xs text-surface-400">{problem.org_phone}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Resolution note */}
          {problem.resolution_note && (
            <div className={`card p-5 ${problem.status === 'solved' ? 'border-brand-500/30 bg-brand-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
              <div className="flex items-center gap-2 mb-2">
                {problem.status === 'solved'
                  ? <CheckCircle2 size={16} className="text-brand-400" />
                  : <XCircle size={16} className="text-red-400" />}
                <h2 className="font-semibold text-white text-sm">
                  {problem.status === 'solved' ? 'Muammo hal qilindi' : 'Muammo rad etildi'}
                </h2>
                {problem.resolved_at && (
                  <span className="text-xs text-surface-500 ml-auto">{formatDate(problem.resolved_at)}</span>
                )}
              </div>
              <p className="text-sm text-surface-300">{problem.resolution_note}</p>
            </div>
          )}

          {/* Vote + Map link */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleVote}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all border ${
                userVoted
                  ? 'bg-brand-500/20 text-brand-400 border-brand-500/40 hover:bg-brand-500/10'
                  : 'bg-surface-800 text-surface-300 border-surface-700 hover:border-brand-500/50 hover:text-white'
              }`}
            >
              <ThumbsUp size={16} className={userVoted ? 'fill-brand-400' : ''} />
              {voteCount} ovoz
            </button>

            <a
              href={`https://www.openstreetmap.org/?mlat=${problem.latitude}&mlon=${problem.longitude}&zoom=17`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-sm"
            >
              <MapPin size={15} /> Xaritada ko'rish
            </a>
          </div>

          {/* Comments */}
          <div className="card p-5">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <MessageCircle size={16} className="text-surface-400" />
              Izohlar ({comments.length})
            </h2>

            {/* Comment form */}
            {user ? (
              <form onSubmit={handleComment} className="mb-5">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center shrink-0 mt-1">
                    <span className="text-xs font-bold text-brand-400">{user.name?.charAt(0)}</span>
                  </div>
                  <div className="flex-1 flex gap-2">
                    <input
                      className="input flex-1"
                      placeholder="Izoh qoldiring..."
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={submittingComment || !comment.trim()}
                      className="btn-primary px-4"
                    >
                      {submittingComment
                        ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <Send size={15} />}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="mb-5 p-3 bg-surface-800/60 rounded-xl text-sm text-surface-400 text-center">
                Izoh qoldirish uchun{' '}
                <Link to="/login" className="text-brand-400 hover:text-brand-300 font-semibold">kiring</Link>
              </div>
            )}

            {/* Comment list */}
            {comments.length === 0 ? (
              <p className="text-sm text-surface-500 text-center py-6">
                Hali izohlar yo'q. Birinchi bo'ling!
              </p>
            ) : (
              <div className="space-y-4">
                {comments.map(c => (
                  <div key={c.id} className="flex gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold
                      ${c.is_official
                        ? 'bg-brand-500/20 border border-brand-500/40 text-brand-400'
                        : 'bg-surface-800 text-surface-400'}`}>
                      {c.user_name?.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-surface-200">{c.user_name}</span>
                        {c.is_official && (
                          <span className="text-xs bg-brand-500/15 text-brand-400 px-2 py-0.5 rounded-full border border-brand-500/20">
                            Rasmiy
                          </span>
                        )}
                        <span className="text-xs text-surface-500 ml-auto">{timeAgo(c.created_at)}</span>
                      </div>
                      <p className="text-sm text-surface-300 leading-relaxed">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

// ─── AdminStatusChanger — faqat admin / org_member uchun ────────────────────
function AdminStatusChanger({ problemId, currentStatus, problemTitle }) {
  const [status, setStatus] = useState(currentStatus)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const handleSave = async () => {
    if (status === currentStatus && !note.trim()) return setOpen(false)
    setLoading(true)
    try {
      await api.patch(`/problems/${problemId}/status`, {
        status,
        resolution_note: note.trim() || undefined,
      })
      toast.success(`Status "${status}" ga o'zgartirildi ✅`)
      setOpen(false)
      // Reload page to reflect new status everywhere
      window.location.reload()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Xato yuz berdi')
    } finally {
      setLoading(false)
    }
  }

  const statusConfig = {
    open:        { label: 'Ochiq',        color: 'text-amber-400 border-amber-500/40 bg-amber-500/10' },
    in_progress: { label: 'Jarayonda',    color: 'text-blue-400 border-blue-500/40 bg-blue-500/10' },
    resolved:      { label: 'Hal qilindi',  color: 'text-brand-400 border-brand-500/40 bg-brand-500/10' },
    rejected:    { label: 'Rad etildi',   color: 'text-red-400 border-red-500/40 bg-red-500/10' },
  }
  const dots = { open: '🟡', in_progress: '🔵', resolved: '🟢', rejected: '🔴' }

  return (
    <div className="mb-5">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-800 border border-surface-700 hover:border-brand-500/40 text-surface-400 hover:text-white text-xs font-semibold transition-all"
        >
          <span>⚙️</span> Status boshqaruvi (Admin)
        </button>
      ) : (
        <div className="p-4 bg-surface-800/60 border border-surface-700 rounded-2xl space-y-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-bold text-surface-300 uppercase tracking-wide">⚙️ Status o'zgartirish</p>
            <button onClick={() => setOpen(false)} className="text-surface-500 hover:text-white text-lg leading-none">×</button>
          </div>

          {/* Status buttons */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(statusConfig).map(([s, { label, color }]) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  status === s
                    ? color
                    : 'bg-surface-900 text-surface-500 border-surface-700 hover:text-surface-300'
                }`}
              >
                {dots[s]} {label}
              </button>
            ))}
          </div>

          {/* Resolution note */}
          <textarea
            className="input resize-none text-xs"
            rows={2}
            placeholder="Izoh (ixtiyoriy) — masalan: 'Axlat mashinalari yuborildi'"
            value={note}
            onChange={e => setNote(e.target.value)}
          />

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="btn-primary text-xs py-2 flex-1"
            >
              {loading
                ? <span className="flex items-center gap-1.5"><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saqlanmoqda...</span>
                : '✅ Saqlash'}
            </button>
            <button onClick={() => setOpen(false)} className="btn-secondary text-xs py-2">Bekor</button>
          </div>
        </div>
      )}
    </div>
  )
}
