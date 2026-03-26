import { CATEGORIES, STATUSES } from '../../utils/constants'
import useProblemsStore from '../../store/problemsStore'
import { SlidersHorizontal, X } from 'lucide-react'

export default function FilterBar() {
  const { filters, setFilters } = useProblemsStore()

  const hasFilters = filters.category || filters.status || filters.sort !== 'newest'

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Category */}
      <select
        value={filters.category}
        onChange={e => setFilters({ category: e.target.value })}
        className="bg-surface-800 border border-surface-700 text-surface-300 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-brand-500 cursor-pointer"
      >
        <option value="">Barcha kategoriyalar</option>
        {Object.entries(CATEGORIES).map(([key, { label, emoji }]) => (
          <option key={key} value={key}>{emoji} {label}</option>
        ))}
      </select>

      {/* Status */}
      <select
        value={filters.status}
        onChange={e => setFilters({ status: e.target.value })}
        className="bg-surface-800 border border-surface-700 text-surface-300 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-brand-500 cursor-pointer"
      >
        <option value="">Barcha statuslar</option>
        {Object.entries(STATUSES).map(([key, { label }]) => (
          <option key={key} value={key}>{label}</option>
        ))}
      </select>

      {/* Sort */}
      <select
        value={filters.sort}
        onChange={e => setFilters({ sort: e.target.value })}
        className="bg-surface-800 border border-surface-700 text-surface-300 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-brand-500 cursor-pointer"
      >
        <option value="newest">Yangilari</option>
        <option value="oldest">Eskilari</option>
        <option value="votes">Ko'p ovozlilar</option>
        <option value="priority">Muhimligi</option>
      </select>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={() => setFilters({ category: '', status: '', sort: 'newest' })}
          className="flex items-center gap-1.5 text-xs text-surface-400 hover:text-red-400 transition-colors px-2 py-2"
        >
          <X size={13} /> Tozalash
        </button>
      )}
    </div>
  )
}
