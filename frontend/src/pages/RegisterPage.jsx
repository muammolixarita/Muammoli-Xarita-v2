import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, UserPlus, MapPin } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'

const DISTRICTS = [
  "Bogʻot",'Gurlan', 'Hazorasp', 'Qoʻshkoʻpir', 'Shovot', 'Urganch',
  'Xiva', 'Xonqa', 'Yangiariq', 'Yangibozor','Urganch shahri','Xiva shahri'
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, loading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', district: '' })

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) return toast.error('Parol kamida 6 ta belgi bo\'lishi kerak')
    const result = await register(form)
    if (result.success) {
      toast.success('Ro\'yxatdan muvaffaqiyatli o\'tdingiz! 🎉')
      navigate('/')
    } else {
      toast.error(result.error || 'Ro\'yxatdan o\'tishda xato')
    }
  }

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-slide-up">
          <div className="text-center mb-8">
            <div className="inline-flex w-14 h-14 rounded-2xl bg-brand-500/15 border border-brand-500/30 items-center justify-center mb-4">
              <MapPin size={24} className="text-brand-400" />
            </div>
            <h1 className="font-display text-3xl font-bold text-white mb-2">Ro'yxatdan o'tish</h1>
            <p className="text-surface-400 text-sm">Shahar muammolarini bildiring va ovoz bering</p>
          </div>

          <div className="card p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">To'liq ism *</label>
                <input className="input" placeholder="Ism Familiya" value={form.name} onChange={set('name')} required minLength={2} />
              </div>

              <div>
                <label className="label">Email *</label>
                <input type="email" className="input" placeholder="sizning@email.com" value={form.email} onChange={set('email')} required />
              </div>

              <div>
                <label className="label">Parol *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input pr-10"
                    placeholder="Kamida 6 belgi"
                    value={form.password}
                    onChange={set('password')}
                    required
                    minLength={6}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 transition-colors">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Telefon</label>
                  <input className="input" placeholder="+998 90 123 45 67" value={form.phone} onChange={set('phone')} />
                </div>
                <div>
                  <label className="label">Tuman</label>
                  <select className="input" value={form.district} onChange={set('district')}>
                    <option value="">Tanlang</option>
                    {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm mt-2">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Ro'yxatdan o'tilmoqda...
                  </span>
                ) : (
                  <><UserPlus size={16} /> Ro'yxatdan o'tish</>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-surface-400 mt-5">
              Hisobingiz bormi?{' '}
              <Link to="/login" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
                Kirish
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
