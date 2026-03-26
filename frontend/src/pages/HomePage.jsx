import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, List, Map, BarChart3, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react'
import Layout from '../components/layout/Layout'
import ProblemMap from '../components/map/ProblemMap'
import ProblemCard from '../components/problems/ProblemCard'
import FilterBar from '../components/problems/FilterBar'
import useProblemsStore from '../store/problemsStore'
import { useAuth } from '../context/AuthContext'
import { CATEGORIES } from '../utils/constants'

export default function HomePage() {
  const { problems, loading, fetchProblems, fetchStats, stats, filters } = useProblemsStore()
  const { user } = useAuth()
  const [view, setView] = useState('map')

  useEffect(() => {
    fetchProblems()
    fetchStats()
  }, [filters])

  const openCount = problems.filter(p => p.status === 'open').length
  const solvedCount = problems.filter(p => p.status === 'solved').length

  return (
    <Layout fullHeight>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="glass border-b border-surface-800/60 px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <FilterBar />
          </div>

          <div className="flex items-center gap-2">
            {/* Stats chips */}
            <div className="hidden sm:flex items-center gap-2 mr-2">
              <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <AlertCircle size={11} /> {openCount} ochiq
              </span>
              <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
                <CheckCircle2 size={11} /> {solvedCount} hal qilindi
              </span>
            </div>

            {/* View toggle */}
            <div className="flex bg-surface-800 rounded-xl p-1 border border-surface-700">
              <button
                onClick={() => setView('map')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${view === 'map' ? 'bg-surface-700 text-white' : 'text-surface-400 hover:text-white'}`}
              >
                <Map size={13} /> Xarita
              </button>
              <button
                onClick={() => setView('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${view === 'list' ? 'bg-surface-700 text-white' : 'text-surface-400 hover:text-white'}`}
              >
                <List size={13} /> Ro'yxat
              </button>
            </div>

            {user && (
              <Link to="/report" className="btn-primary text-xs py-2 px-3">
                <PlusCircle size={14} /> Bildirish
              </Link>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {view === 'map' ? (
            <div style={{ width: '100%', height: 'calc(100vh - 120px)' }}>
              <ProblemMap />
            </div>
          ) : (
            <div className="h-full overflow-y-auto">
              <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Stats row */}
                {stats && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    <StatCard label="Jami muammolar" value={stats.total} icon={BarChart3} />
                    <StatCard
                      label="Bu hafta"
                      value={stats.recentWeek}
                      icon={TrendingUp}
                      accent="brand"
                    />
                    {stats.byStatus?.map(s => (
                      s.status === 'open' && <StatCard key="open" label="Ochiq" value={s.count} icon={AlertCircle} accent="amber" />
                    ))}
                    {stats.byStatus?.map(s => (
                      s.status === 'solved' && <StatCard key="solved" label="Hal qilindi" value={s.count} icon={CheckCircle2} accent="green" />
                    ))}
                  </div>
                )}

                {/* Problem grid */}
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="card p-4 animate-pulse">
                        <div className="w-full h-36 bg-surface-800 rounded-xl mb-3" />
                        <div className="h-4 bg-surface-800 rounded-lg mb-2 w-3/4" />
                        <div className="h-3 bg-surface-800 rounded-lg w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : problems.length === 0 ? (
                  <div className="text-center py-20 text-surface-500">
                    <div className="text-5xl mb-4">🗺️</div>
                    <p className="font-semibold text-lg mb-2 text-surface-300">Muammolar topilmadi</p>
                    <p className="text-sm mb-6">Hozircha bu filtr bo'yicha muammolar yo'q</p>
                    {user && (
                      <Link to="/report" className="btn-primary">
                        <PlusCircle size={15} /> Birinchi muammoni bildiring
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {problems.map(p => <ProblemCard key={p.id} problem={p} />)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

function StatCard({ label, value, icon: Icon, accent = 'surface' }) {
  const accentMap = {
    surface: 'text-surface-400 bg-surface-800/50',
    brand: 'text-brand-400 bg-brand-500/10',
    amber: 'text-amber-400 bg-amber-500/10',
    green: 'text-brand-400 bg-brand-500/10',
  }
  return (
    <div className="card p-4">
      <div className={`inline-flex p-2 rounded-lg mb-2 ${accentMap[accent]}`}>
        <Icon size={16} />
      </div>
      <div className="font-display text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-surface-500 mt-0.5">{label}</div>
    </div>
  )
}
