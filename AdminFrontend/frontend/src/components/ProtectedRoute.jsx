import { Navigate } from 'react-router-dom'
import { usePermissions } from '../context/PermissionsContext'
import { Loader2, ShieldAlert } from 'lucide-react'

const ProtectedRoute = ({ children, module, permission = 'read', requireAll = false }) => {
  const { hasPermission, hasAllPermissions, loading } = usePermissions()

  // Show loading state while checking permissions
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-sm text-gray-600">Checking permissions...</p>
        </div>
      </div>
    )
  }

  // Check permissions
  const allowed = Array.isArray(permission)
    ? requireAll
      ? hasAllPermissions(module, permission)
      : permission.some(p => hasPermission(module, p))
    : hasPermission(module, permission)

  if (!allowed) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-sm text-gray-600 mb-6">
            You don't have permission to access this page.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return children
}

export default ProtectedRoute
