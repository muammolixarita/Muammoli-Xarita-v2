import { CATEGORIES, getCategoryStyle } from '../../utils/constants'

export default function CategoryBadge({ category, size = 'sm' }) {
  if (!category) return null

  // Prisma may return enum as uppercase on some adapters — normalise to lowercase
  const key = category.toLowerCase()
  const cat = CATEGORIES[key]
  if (!cat) return null   // unknown category, don't show garbage

  const sizeClass = size === 'lg' ? 'text-sm px-3 py-1' : 'text-xs px-2 py-0.5'

  return (
    <span className={`badge ${getCategoryStyle(key)} ${sizeClass}`}>
      <span>{cat.emoji}</span>
      <span>{cat.label}</span>
    </span>
  )
}
