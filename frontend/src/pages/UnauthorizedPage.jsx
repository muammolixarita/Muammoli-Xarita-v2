import { useNavigate } from 'react-router-dom'
import { ShieldOff } from 'lucide-react'
import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'
import { ROLE_META } from '../utils/rbac'

export default function UnauthorizedPage() {
  const navigate    = useNavigate()
  const { user }    = useAuth()
  const roleMeta    = user ? ROLE_META[user.role] : null

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="text-center animate-slide-up max-w-md">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 items-center justify-center mb-6">
            <ShieldOff size={28} className="text-red-400" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-3">Ruxsat yo'q</h1>
          <p className="text-surface-400 mb-3">
            Bu sahifaga kirishga ruxsatingiz yo'q.
          </p>
          {roleMeta && (
            <p className="text-sm text-surface-500 mb-8">
              Sizning rolingiz: <span className={`font-semibold px-2 py-0.5 rounded-md ${roleMeta.badge}`}>{roleMeta.icon} {roleMeta.label}</span>
            </p>
          )}
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => navigate(-1)} className="btn-secondary">← Orqaga</button>
            <button onClick={() => navigate('/')} className="btn-primary">🗺️ Bosh sahifa</button>
          </div>
        </div>
      </div>
    </Layout>
  )
}
