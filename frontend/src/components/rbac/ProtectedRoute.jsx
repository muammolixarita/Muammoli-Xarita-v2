import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/**
 * <ProtectedRoute roles={['admin']} />
 *   - No token → /login
 *   - Wrong role → /unauthorized
 *   - OK → renders children
 */
export default function ProtectedRoute({ children, roles = [] }) {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}
