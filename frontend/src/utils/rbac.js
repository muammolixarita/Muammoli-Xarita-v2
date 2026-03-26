// ─── Role constants ───────────────────────────────────────────────────────────
export const ROLES = {
  USER:         'user',
  ADMIN:        'admin',
  ORGANIZATION: 'organization',
  MODERATOR:    'moderator',
}

// ─── Permission matrix ────────────────────────────────────────────────────────
export const PERMISSIONS = {
  user: {
    canCreateProblem:  true,
    canUpdateStatus:   false,
    canDeleteProblem:  false,
    canViewAdmin:      false,
    canViewOrgPanel:   false,
    canViewModPanel:   false,
    canManageUsers:    false,
  },
  admin: {
    canCreateProblem:  false,   // admin manages, doesn't report
    canUpdateStatus:   true,
    canDeleteProblem:  true,
    canViewAdmin:      true,
    canViewOrgPanel:   true,
    canViewModPanel:   true,
    canManageUsers:    true,
  },
  organization: {
    canCreateProblem:  false,
    canUpdateStatus:   true,    // only own problems, limited statuses
    canDeleteProblem:  false,
    canViewAdmin:      false,
    canViewOrgPanel:   true,
    canViewModPanel:   false,
    canManageUsers:    false,
  },
  moderator: {
    canCreateProblem:  false,
    canUpdateStatus:   false,
    canDeleteProblem:  true,
    canViewAdmin:      false,
    canViewOrgPanel:   false,
    canViewModPanel:   true,
    canManageUsers:    false,
  },
}

// Statuses each role may set — mirrors backend STATUS_PERMISSIONS
export const STATUS_PERMISSIONS = {
  admin:        ['new', 'open', 'in_progress', 'resolved', 'rejected'],
  organization: ['in_progress', 'resolved'],
  moderator:    [],
  user:         [],
}

// ─── Check helpers ────────────────────────────────────────────────────────────
export const can = (role, permission) =>
  !!(role && PERMISSIONS[role]?.[permission])

export const hasRole = (user, ...roles) =>
  !!(user && roles.includes(user.role))

export const getAllowedStatuses = (role) =>
  STATUS_PERMISSIONS[role] ?? []

// ─── Role display metadata ────────────────────────────────────────────────────
export const ROLE_META = {
  user:         { label: 'Fuqaro',    icon: '👤', badge: 'bg-surface-700    text-surface-300' },
  admin:        { label: 'Admin',     icon: '🛡️', badge: 'bg-red-500/15     text-red-400'    },
  organization: { label: 'Tashkilot', icon: '🏛️', badge: 'bg-blue-500/15    text-blue-400'   },
  moderator:    { label: 'Moderator', icon: '🔍', badge: 'bg-purple-500/15  text-purple-400' },
}

// ─── Decode JWT payload without verifying (frontend only, no secret needed) ───
export const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}
