import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ROLE_IDS, getRoleLanding } from '../config/roles'
import { filterNavForRole } from '../config/navigation'

/**
 * Sends the user to the dashboard appropriate for their role.
 * Used as the handler for the canonical `/dashboard` route.
 */
export default function RoleRedirect({ fallback = '/registration' }) {
  const { isAuthenticated, role, tenant, user } = useAuth()
  if (!isAuthenticated) return <Navigate to={fallback} replace />
  
  if (role === ROLE_IDS.SUPER_ADMIN && tenant && !tenant.onboardingCompleted) {
    return <Navigate to="/onboarding" replace />
  }

  if (user?.userModules) {
    const allowedSections = filterNavForRole(role, tenant?.modules, user?.userModules)
    if (allowedSections.length > 0) {
      for (const section of allowedSections) {
        if (section.items && section.items.length > 0) {
          // If we found a valid section, go to the first item (usually a dashboard)
          return <Navigate to={section.items[0].path} replace />
        }
      }
    }
  }

  return <Navigate to={getRoleLanding(role)} replace />
}
