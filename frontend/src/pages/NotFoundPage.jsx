import { useNavigate } from 'react-router-dom'
import Layout from '../components/layout/Layout'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="text-center animate-slide-up">
          <div className="font-display text-9xl font-black text-surface-800 mb-4">404</div>
          <h2 className="font-display text-2xl font-bold text-white mb-3">Sahifa topilmadi</h2>
          <p className="text-surface-400 text-sm mb-8">Siz qidirayotgan sahifa mavjud emas yoki o'chirilgan.</p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => navigate(-1)} className="btn-secondary">← Orqaga</button>
            <button onClick={() => navigate('/')} className="btn-primary">🗺️ Bosh sahifa</button>
          </div>
        </div>
      </div>
    </Layout>
  )
}
