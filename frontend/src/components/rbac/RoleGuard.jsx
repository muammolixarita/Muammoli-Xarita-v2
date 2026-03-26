import { useAuth } from '../../context/AuthContext'
import { can } from '../../utils/rbac'

/**
 * <RoleGuard roles={['admin', 'moderator']}>  — role whitelist
 * <RoleGuard permission="canDeleteProblem">   — permission check
 * <RoleGuard fallback={<p>No access</p>}>     — optional fallback
 */
export default function RoleGuard({ children, roles, permission, fallback = null }) {
  const { user } = useAuth()

  if (!user) return fallback

  if (roles && !roles.includes(user.role)) return fallback
  if (permission && !can(user.role, permission)) return fallback

  return children
}
