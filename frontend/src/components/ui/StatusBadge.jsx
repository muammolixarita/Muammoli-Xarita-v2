import { STATUSES, getStatusStyle } from '../../utils/constants'

export default function StatusBadge({ status, size = 'sm' }) {
  // Do NOT fallback to a default — if status is missing, show nothing meaningful
  if (!status) return null

  const s = STATUSES[status]
  if (!s) return null   // unknown status from server, don't show garbage

  const sizeClass = size === 'lg' ? 'text-sm px-3 py-1' : 'text-xs px-2 py-0.5'
  const dots = { open: '🟡', in_progress: '🔵', resolved: '🟢', rejected: '🔴' }

  return (
    <span className={`badge ${getStatusStyle(status)} ${sizeClass}`}>
      <span>{dots[status] ?? '⚪'}</span>
      <span>{s.label}</span>
    </span>
  )
}
