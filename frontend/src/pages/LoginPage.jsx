import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, MapPin, LogIn } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, loading } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await login(form.email, form.password)
    if (result.success) {
      toast.success('Xush kelibsiz! 👋')
      navigate('/')
    } else {
      toast.error(result.error || 'Login failed')
    }
  }

  const fillDemo = () => setForm({ email: 'demo@example.com', password: 'demo123' })

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-slide-up">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex w-14 h-14 rounded-2xl bg-brand-500/15 border border-brand-500/30 items-center justify-center mb-4">
              <MapPin size={24} className="text-brand-400" />
            </div>
            <h1 className="font-display text-3xl font-bold text-white mb-2">Tizimga kirish</h1>
            <p className="text-surface-400 text-sm">Muammo Xarita hisobingizga kiring</p>
          </div>

          <div className="card p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  className="input"
                  placeholder="sizning@email.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="label">Parol</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input pr-10"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-sm"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Kirish...
                  </span>
                ) : (
                  <><LogIn size={16} /> Kirish</>
                )}
              </button>
            </form>

            {/* Demo account */}
            <div className="mt-4 p-3 bg-surface-800/60 rounded-xl border border-surface-700/60">
              <p className="text-xs text-surface-400 mb-2 font-semibold">Demo hisob:</p>
              <button
                onClick={fillDemo}
                className="text-xs text-brand-400 hover:text-brand-300 transition-colors font-mono"
              >
                demo@example.com / demo123
              </button>
            </div>

            <p className="text-center text-sm text-surface-400 mt-5">
              Hisobingiz yo'qmi?{' '}
              <Link to="/register" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
                Ro'yxatdan o'ting
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
