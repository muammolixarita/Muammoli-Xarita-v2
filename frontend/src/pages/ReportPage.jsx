import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { ImagePlus, X, Send, Sparkles, MapPin, AlertCircle } from 'lucide-react'
import Layout from '../components/layout/Layout'
import LocationPicker from '../components/map/LocationPicker'
import useProblemsStore from '../store/problemsStore'
import { useAuth } from '../context/AuthContext'

export default function ReportPage() {
  const navigate = useNavigate()
  const { createProblem, loading } = useProblemsStore()
  const { user } = useAuth()
  const fileRef = useRef()

  const [form, setForm] = useState({ title: '', description: '', address: '' })
  const [location, setLocation] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [step, setStep] = useState(1) // 1: info, 2: location, 3: review

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) return toast.error('Rasm 10MB dan kichik bo\'lishi kerak')
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!location) return toast.error('Iltimos, xaritada joylashuvni tanlang')
    if (form.title.length < 5) return toast.error('Sarlavha kamida 5 belgi bo\'lishi kerak')
    if (form.description.length < 10) return toast.error('Tavsif kamida 10 belgi bo\'lishi kerak')

    const fd = new FormData()
    fd.append('title', form.title)
    fd.append('description', form.description)
    fd.append('address', form.address)
    fd.append('latitude', location.lat)
    fd.append('longitude', location.lng)
    if (imageFile) fd.append('image', imageFile)

    const toastId = toast.loading('🤖 AI muammoni tahlil qilmoqda...')
    const result = await createProblem(fd)
    toast.dismiss(toastId)

    if (result.success) {
      toast.success('Muammo muvaffaqiyatli yuborildi! ✅')
      navigate(`/problems/${result.problem.id}`)
    } else {
      toast.error(result.error || 'Xato yuz berdi')
    }
  }

  if (!user) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="text-center p-8">
            <AlertCircle size={48} className="text-amber-400 mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold text-white mb-2">Kirish talab etiladi</h2>
            <p className="text-surface-400 mb-6">Muammo bildirish uchun tizimga kiring</p>
            <button onClick={() => navigate('/login')} className="btn-primary">Kirish</button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center">
              <MapPin size={18} className="text-brand-400" />
            </div>
            <h1 className="font-display text-3xl font-bold text-white">Muammo bildirish</h1>
          </div>
          <p className="text-surface-400 text-sm ml-13">
            <Sparkles size={13} className="inline text-brand-400 mr-1" />
            AI muammoni avtomatik ravishda tasniflab, tegishli tashkilotga yo'naltiradi
          </p>
        </div>

        {/* AI notice */}
        <div className="mb-6 p-4 bg-brand-500/8 border border-brand-500/20 rounded-2xl flex items-start gap-3">
          <Sparkles size={18} className="text-brand-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-brand-300 mb-1">AI yordamchi faol</p>
            <p className="text-xs text-surface-400">
              Muammongiz tavsifiga qarab, AI uni avtomatik toifalaydi va tegishli tashkilotga (Kommunal xizmat, Yo'l boshqarmasi, va h.k.) yo'naltiradi.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up">
          {/* Title */}
          <div className="card p-5">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center font-bold">1</span>
              Muammo haqida ma'lumot
            </h2>

            <div className="space-y-4">
              <div>
                <label className="label">Sarlavha *</label>
                <input
                  className="input"
                  placeholder="Qisqa va aniq sarlavha yozing..."
                  value={form.title}
                  onChange={set('title')}
                  required
                  minLength={5}
                  maxLength={500}
                />
                <p className="text-xs text-surface-500 mt-1">{form.title.length}/500</p>
              </div>

              <div>
                <label className="label">Batafsil tavsif *</label>
                <textarea
                  className="input resize-none"
                  rows={4}
                  placeholder="Muammo haqida batafsil yozing: qayerda, qachondan beri, qanchalik xavfli..."
                  value={form.description}
                  onChange={set('description')}
                  required
                  minLength={10}
                />
              </div>

              <div>
                <label className="label">Manzil (ixtiyoriy)</label>
                <input
                  className="input"
                  placeholder="Ko'cha nomi, bino raqami..."
                  value={form.address}
                  onChange={set('address')}
                />
              </div>
            </div>
          </div>

          {/* Image upload */}
          <div className="card p-5">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center font-bold">2</span>
              Rasm (ixtiyoriy, lekin tavsiya etiladi)
            </h2>

            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden">
                <img src={imagePreview} alt="Preview" className="w-full h-52 object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1.5 bg-surface-900/80 backdrop-blur rounded-lg text-surface-300 hover:text-red-400 transition-colors"
                >
                  <X size={16} />
                </button>
                <div className="absolute bottom-2 left-2 bg-surface-900/80 backdrop-blur text-xs text-surface-300 px-2 py-1 rounded-lg">
                  {imageFile?.name}
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full h-36 border-2 border-dashed border-surface-700 hover:border-brand-500/50 rounded-xl flex flex-col items-center justify-center gap-2 text-surface-500 hover:text-surface-300 transition-all group"
              >
                <ImagePlus size={28} className="group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Rasm yuklash</span>
                <span className="text-xs">JPG, PNG, WEBP · Max 10MB</span>
              </button>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleImage}
              className="hidden"
            />
          </div>

          {/* Location picker */}
          <div className="card p-5">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center font-bold">3</span>
              Joylashuv *
            </h2>
            <LocationPicker value={location} onChange={setLocation} />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !location || !form.title || !form.description}
            className="btn-primary w-full py-4 text-base"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                AI tahlil qilmoqda va yuborilmoqda...
              </span>
            ) : (
              <><Send size={18} /> Muammoni yuborish</>
            )}
          </button>
        </form>
      </div>
    </Layout>
  )
}
