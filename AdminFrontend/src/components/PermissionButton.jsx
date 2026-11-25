import { usePermissions } from '../context/PermissionsContext'

/**
 * Button that only renders if user has the required permission
 * 
 * @param {string} module - Module name (e.g., 'employees', 'payroll')
 * @param {string|string[]} permission - Permission(s) required (e.g., 'write', ['write', 'delete'])
 * @param {boolean} requireAll - If true, requires ALL permissions in array
 * @param {React.ReactNode} children - Button content
 * @param {object} props - Other button props
 */
const PermissionButton = ({ 
  module, 
  permission = 'write', 
  requireAll = false, 
  children, 
  ...props 
}) => {
  const { hasPermission, hasAllPermissions } = usePermissions()

  // Check permissions
  const allowed = Array.isArray(permission)
    ? requireAll
      ? hasAllPermissions(module, permission)
      : permission.some(p => hasPermission(module, p))
    : hasPermission(module, permission)

  if (!allowed) {
    return null
  }

  return <button {...props}>{children}</button>
}

export default PermissionButton
