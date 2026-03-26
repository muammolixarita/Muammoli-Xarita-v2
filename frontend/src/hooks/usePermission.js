import { useAuth } from '../context/AuthContext'
import { can, hasRole, getAllowedStatuses } from '../utils/rbac'

// usePermission() — granular permission checks in components
export function usePermission() {
  const { user } = useAuth()
  const role = user?.role

  return {
    role,
    can:                (perm)    => can(role, perm),
    hasRole:            (...roles) => hasRole(user, ...roles),
    allowedStatuses:    getAllowedStatuses(role),
    canUpdateStatus:    can(role, 'canUpdateStatus'),
    canDeleteProblem:   can(role, 'canDeleteProblem'),
    canCreateProblem:   can(role, 'canCreateProblem'),
    canViewAdmin:       can(role, 'canViewAdmin'),
    canViewOrgPanel:    can(role, 'canViewOrgPanel'),
    canViewModPanel:    can(role, 'canViewModPanel'),
    canManageUsers:     can(role, 'canManageUsers'),
  }
}
