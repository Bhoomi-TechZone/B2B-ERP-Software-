import { createContext, useContext, useState, useEffect } from 'react'
import roleService from '../services/roleService'

const PermissionsContext = createContext(null)

export const PermissionsProvider = ({ children }) => {
  const [permissions, setPermissions] = useState({})
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  const loadPermissions = async () => {
    try {
      setLoading(true)
      const response = await roleService.getUserPermissions()
      
      console.log('Permissions loaded:', response.data)
      
      setUser(response.data.user)
      setUserRole(response.data.role)
      setPermissions(response.data.permissions || {})
    } catch (error) {
      console.error('Failed to load permissions:', error)
      // Set empty permissions on error
      setPermissions({})
    } finally {
      setLoading(false)
    }
  }

  // Fetch user permissions on mount
  useEffect(() => {
    loadPermissions()
  }, [])

  // Check if user has a specific permission
  const hasPermission = (module, permission) => {
    // Super admin has all permissions
    if (user?.role === 'super_admin') {
      return true
    }

    // Check module permission
    const modulePerms = permissions[module]
    if (!modulePerms) return false
    
    return modulePerms[permission] === true
  }

  // Check if user has any permission for a module
  const hasAnyPermission = (module, permissionList) => {
    return permissionList.some(perm => hasPermission(module, perm))
  }

  // Check if user has all permissions for a module
  const hasAllPermissions = (module, permissionList) => {
    return permissionList.every(perm => hasPermission(module, perm))
  }

  // Check if user has read access to a module (for sidebar visibility)
  const canAccessModule = (module) => {
    return hasPermission(module, 'read')
  }

  // Get all accessible modules (for sidebar)
  const getAccessibleModules = () => {
    if (user?.role === 'super_admin') {
      // Return all modules for super admin
      return [
        'dashboard', 'employees', 'attendance', 'leaves', 'payroll',
        'recruitment', 'crm', 'billing', 'reports', 'settings',
        'performance', 'benefits', 'compliance', 'users'
      ]
    }

    return Object.keys(permissions).filter(module => 
      permissions[module]?.read === true
    )
  }

  const value = {
    permissions,
    userRole,
    user,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessModule,
    getAccessibleModules,
    reload: loadPermissions
  }

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  )
}

export const usePermissions = () => {
  const context = useContext(PermissionsContext)
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider')
  }
  return context
}
