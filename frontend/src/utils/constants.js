export const CATEGORIES = {
  garbage:     { label: 'Axlat / Chiqindi',     labelEn: 'Garbage',     emoji: '🗑️', color: 'orange' },
  road:        { label: 'Yo\'l / Infratuzilma', labelEn: 'Road',        emoji: '🛣️', color: 'yellow' },
  electricity: { label: 'Elektr / Chiroq',      labelEn: 'Electricity', emoji: '⚡', color: 'cyan'   },
  water:       { label: 'Suv / Kanalizatsiya',  labelEn: 'Water',       emoji: '💧', color: 'blue'   },
  parks:       { label: 'Park / Ko\'kalamzor',  labelEn: 'Parks',       emoji: '🌳', color: 'green'  },
  safety:      { label: 'Xavfsizlik',           labelEn: 'Safety',      emoji: '🚨', color: 'red'    },
  other:       { label: 'Boshqa',               labelEn: 'Other',       emoji: '📋', color: 'gray'   },
}

export const STATUSES = {
  open:        { label: 'Ochiq',           labelEn: 'Open',        color: 'amber'  },
  in_progress: { label: 'Jarayonda',       labelEn: 'In Progress', color: 'blue'   },
  resolved:      { label: 'Hal qilindi',     labelEn: 'Solved',      color: 'green'  },
  rejected:    { label: 'Rad etildi',      labelEn: 'Rejected',    color: 'red'    },
}

export const PRIORITIES = {
  low:      { label: 'Past',     color: 'surface' },
  medium:   { label: 'O\'rta',  color: 'amber'   },
  high:     { label: 'Yuqori',  color: 'orange'  },
  critical: { label: 'Kritik',  color: 'red'     },
}

export const TASHKENT_CENTER = [41.668859, 60.496804]

export const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric' })
}

export const timeAgo = (dateStr) => {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'Hozirgina'
  if (m < 60) return `${m} daqiqa oldin`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} soat oldin`
  const day = Math.floor(h / 24)
  if (day < 30) return `${day} kun oldin`
  return formatDate(dateStr)
}

export const getCategoryStyle = (cat) => {
  const map = {
    garbage:     'cat-garbage',
    road:        'cat-road',
    electricity: 'cat-electricity',
    water:       'cat-water',
    parks:       'cat-parks',
    safety:      'cat-safety',
    other:       'cat-other',
  }
  return map[cat] || 'cat-other'
}

export const getStatusStyle = (status) => `status-${status}`

export const MARKER_COLORS = {
  garbage:     '#f97316',
  road:        '#eab308',
  electricity: '#06b6d4',
  water:       '#3b82f6',
  parks:       '#22c55e',
  safety:      '#ef4444',
  other:       '#64748b',
}
