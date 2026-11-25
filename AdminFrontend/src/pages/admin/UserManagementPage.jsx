import { useState, useEffect, Component } from 'react'
import { 
  Search, Plus, Edit, Trash2,
  Shield, Users,
  X,
  Save, Loader2,
  Mail, Building2,
  ArrowRight, ShieldCheck,
  AlertTriangle,
  TicketsPlane
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import roleService from '../../services/roleService'

// ─── Error Boundary ─────────────────────────────────────────────────────────
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('UserManagementPage Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-sm text-gray-600 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// ─── Constants ──────────────────────────────────────────────────────────────
const MODULES = [
  'employees', 'departments', 'payroll', 'leave', 'attendance', 'recruitment', 
  'performance', 'benefits', 'reports', 'settings', 'billing', 
  'crm', 'users', 'compliance', 'projects',
  'dashboard_employee', 'my_profile', 'my_payroll', 'my_documents', 'my_settings', 'my_help_desk', 'announcements', 'leave_employee', 'attendance_employee', 'projects_employee'
]

const MODULE_DISPLAY_NAMES = {
  employees: 'Employees Management',
  departments: 'Departments Management',
  payroll: 'Payroll Administration',
  leave: 'Leave Administration',
  attendance: 'Attendance Administration',
  recruitment: 'Recruitment & ATS',
  performance: 'Performance Review',
  benefits: 'Benefits Management',
  reports: 'Reports & Analytics',
  settings: 'System Settings',
  billing: 'Billing & Subscriptions',
  crm: 'CRM & Sales',
  users: 'Users Management',
  compliance: 'Compliance',
  projects: 'Projects & Tasks',
  dashboard_employee: 'Dashboard (Employee)',
  my_profile: 'My Profile (Employee)',
  my_payroll: 'My Payroll (Employee)',
  my_documents: 'My Documents (Employee)',
  my_settings: 'My Settings (Employee)',
  my_help_desk: 'Help Desk (Employee)',
  announcements: 'Announcements (Employee)',
  leave_employee: 'Leave (Employee)',
  attendance_employee: 'Attendance (Employee)',
  projects_employee: 'Projects & Tasks (Employee)'
}

// ─── Components ─────────────────────────────────────────────────────────────

const Toggle = ({ enabled, label, onClick }) => (
  <div 
    onClick={onClick}
    className="flex flex-col items-center gap-1 cursor-pointer group/toggle"
  >
    <div
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        enabled ? 'bg-[#89CC39]' : 'bg-gray-200 group-hover/toggle:bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${
          enabled ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </div>
    <span className="text-[10px] font-medium text-gray-400 group-hover/toggle:text-gray-600 transition-colors">{label}</span>
  </div>
)

const Badge = ({ children, type }) => {
  const styles = {
    saved: 'bg-[#E8F5E9] text-[#2E7D32]',
    default: 'bg-[#FFF3E0] text-[#EF6C00]',
    custom: 'bg-[#F3E5F5] text-[#7B1FA2]',
    system: 'bg-slate-100 text-slate-600 border border-slate-200',
    active: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    inactive: 'bg-gray-50 text-gray-600 border border-gray-100',
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${styles[type] || 'bg-gray-100 text-gray-600'}`}>
      <span className="h-1 w-1 rounded-full bg-current" />
      {children}
    </span>
  )
}

// ─── Create/Edit Role Modal ─────────────────────────────────────────────────
const RoleFormModal = ({ role, onClose, onSuccess }) => {
  const [name, setName] = useState(role?.name || '')
  const [isSystem, setIsSystem] = useState(role?.is_system || false)
  const [isDefaultEmployee, setIsDefaultEmployee] = useState(role?.is_default_employee || false)
  const [selectedPermissions, setSelectedPermissions] = useState(role?.permissions || [])
  const [submitting, setSubmitting] = useState(false)

  const togglePermission = (module, action) => {
    const prefix = `${module}:${action}:`
    setSelectedPermissions(prev => {
      const exists = prev.some(p => p.startsWith(prefix) || p === `${module}:${action}:*` || p === `${module}:*:all`)
      if (exists) {
        // Toggle off: remove all matching strings
        return prev.filter(p => !p.startsWith(prefix))
      } else {
        // Toggle on: add with 'all' scope
        return [...prev, `${module}:${action}:all`]
      }
    })
  }

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Role name is required')
      return
    }
    setSubmitting(true)
    try {
      // Convert permissions array to modules format expected by backend
      const modulesMap = {}
      
      // Initialize all modules with false permissions
      MODULES.forEach(mod => {
        modulesMap[mod] = {
          module_name: mod,
          read: false,
          write: false,
          delete: false,
          export: false,
          approve: false
        }
      })
      
      // Set permissions based on selectedPermissions
      selectedPermissions.forEach(perm => {
        const parts = perm.split(':')
        if (parts.length >= 2) {
          const module = parts[0]
          const action = parts[1]
          
          if (modulesMap[module]) {
            if (action === '*' || action === 'read') modulesMap[module].read = true
            if (action === '*' || action === 'write') modulesMap[module].write = true
            if (action === '*' || action === 'delete') modulesMap[module].delete = true
            if (action === '*' || action === 'export') modulesMap[module].export = true
            if (action === '*' || action === 'approve') modulesMap[module].approve = true
          }
        }
      })
      
      const payload = {
        role_name: name,
        is_system_role: isSystem,
        default_for_new_employees: isDefaultEmployee,
        modules: Object.values(modulesMap)
      }
      
      console.log('Sending payload:', payload)
      
      if (role?.id) {
        await roleService.updateRole(role.id, payload)
      } else {
        await roleService.createRole(payload)
      }
      onSuccess()
    } catch (err) {
      console.error('Save role error:', err)
      alert(err?.response?.data?.detail || err.message || 'Failed to save role')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex h-full max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">{role ? 'Edit Role' : 'Create New Role'}</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Role Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., HR Administrator"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
            
            <div className="flex items-end gap-6 pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isSystem} 
                  onChange={e => setIsSystem(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                />
                <span className="text-sm font-medium text-gray-700">System Role</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isDefaultEmployee} 
                  onChange={e => setIsDefaultEmployee(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                />
                <span className="text-sm font-medium text-gray-700">Default for New Employees</span>
              </label>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Module Permissions</h3>
              <p className="text-xs text-gray-500">Toggle actions for each module. Default scope is 'all'.</p>
            </div>

            <div className="space-y-4">
              {MODULES.map(module => (
                <div key={module} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:border-blue-100 transition-colors">
                  <div className="flex items-center justify-between mb-3 border-b border-gray-50 pb-2">
                    <span className="font-bold capitalize text-gray-900 flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      {MODULE_DISPLAY_NAMES[module] || module}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-gray-400">Actions</span>
                  </div>
                  <div className="flex flex-wrap gap-6">
                    {['read', 'write', 'delete', 'export', 'approve'].map(action => {
                      const isEnabled = selectedPermissions.some(p => p.startsWith(`${module}:${action}:`))
                      return (
                        <Toggle 
                          key={action}
                          label={action}
                          enabled={isEnabled}
                          onClick={() => togglePermission(module, action)}
                        />
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-6 py-4 rounded-b-2xl">
          <p className="text-sm text-gray-500">
            {selectedPermissions.length} permissions selected
          </p>
          <div className="flex gap-3">
            <button onClick={onClose} className="rounded-xl border border-gray-200 bg-white px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {submitting ? 'Saving...' : 'Save Role'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────────────

const UserManagementPage = () => {
  const [activeTab, setActiveTab] = useState('roles')
  const [roles, setRoles] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)
  
  const mapModulesToPermissions = (modules) => {
    if (!Array.isArray(modules)) return [];
    const perms = [];
    modules.forEach(mod => {
      const name = mod.module_name;
      if (mod.read) perms.push(`${name}:read:all`);
      if (mod.write) perms.push(`${name}:write:all`);
      if (mod.delete) perms.push(`${name}:delete:all`);
      if (mod.export) perms.push(`${name}:export:all`);
      if (mod.approve) perms.push(`${name}:approve:all`);
    });
    return perms;
  };

  const fetchRoles = async () => {
    try {
      const response = await roleService.getRoles()
      console.log("ROLES API RESPONSE:", response)
      
      const rolesData = response?.data?.data || response?.data || response || []
      const rawRoles = Array.isArray(rolesData) ? rolesData : []
      
      const mappedRoles = rawRoles.map(r => ({
        ...r,
        name: r.role_name || r.name,
        is_system: r.is_system_role !== undefined ? r.is_system_role : r.is_system,
        is_default_employee: r.default_for_new_employees !== undefined ? r.default_for_new_employees : r.is_default_employee,
        modules: r.modules || [],  // Keep modules array
        permissions: r.modules ? mapModulesToPermissions(r.modules) : (r.permissions || [])
      }))
      setRoles(mappedRoles)
    } catch (err) {
      console.error("FETCH ROLES ERROR:", err)
      setRoles([])
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await roleService.getUsers()
      console.log("USERS API RESPONSE:", response)

      const usersData = response?.data?.data || response?.data || []
      const rawUsers = Array.isArray(usersData) ? usersData : []
      
      const mappedUsers = rawUsers.map(u => ({
        ...u,
        name: u.name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Unknown',
        status: u.status || (u.is_active ? 'active' : 'inactive')
      }))
      
      setUsers(mappedUsers)
    } catch (err) {
      console.error("FETCH USERS ERROR:", err)
      setUsers([])
    }
  }
  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await Promise.all([fetchRoles(), fetchUsers()])
      setLoading(false)
    }
    init()
  }, [])

  const handleEdit = (role) => {
    setSelectedRole(role)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this role?')) return
    try {
      await roleService.deleteRole(id)
      fetchRoles()
    } catch (err) {
      alert('Failed to delete role')
    }
  }

  const handleToggleBulkPermission = async (role, actionType) => {
    let newPermissions = [...(role.permissions || [])]
    
    // Check if the action is currently enabled for ANY module
    const isCurrentlyEnabled = newPermissions.some(p => p.includes(`:${actionType}:`))
    
    if (isCurrentlyEnabled) {
      // Disable for all modules
      newPermissions = newPermissions.filter(p => !p.includes(`:${actionType}:`))
    } else {
      // Enable for all modules
      MODULES.forEach(mod => {
        const perm = `${mod}:${actionType}:all`
        if (!newPermissions.includes(perm)) {
          newPermissions.push(perm)
        }
      })
    }

    // Optimistic update
    setRoles(prev => prev.map(r => r.id === role.id ? { ...r, permissions: newPermissions } : r))
    
    try {
      // Convert permissions to modules format for backend
      const modulesMap = {}
      
      MODULES.forEach(mod => {
        modulesMap[mod] = {
          module_name: mod,
          read: false,
          write: false,
          delete: false,
          export: false,
          approve: false
        }
      })
      
      newPermissions.forEach(perm => {
        const parts = perm.split(':')
        if (parts.length >= 2) {
          const module = parts[0]
          const action = parts[1]
          
          if (modulesMap[module]) {
            if (action === '*' || action === 'read') modulesMap[module].read = true
            if (action === '*' || action === 'write') modulesMap[module].write = true
            if (action === '*' || action === 'delete') modulesMap[module].delete = true
            if (action === '*' || action === 'export') modulesMap[module].export = true
            if (action === '*' || action === 'approve') modulesMap[module].approve = true
          }
        }
      })
      
      const payload = {
        role_name: role.name || role.role_name,
        is_system_role: role.is_system !== undefined ? role.is_system : (role.is_system_role || false),
        default_for_new_employees: role.is_default_employee !== undefined ? role.is_default_employee : (role.default_for_new_employees || false),
        modules: Object.values(modulesMap)
      }
      
      console.log('Updating role with payload:', JSON.stringify(payload, null, 2))
      
      await roleService.updateRole(role.id, payload)
      fetchRoles() // Refresh to sync with server
    } catch (err) {
      console.error('Failed to update role permissions:', err)
      console.error('Error response:', err.response?.data)
      console.error('Error status:', err.response?.status)
      alert(`Failed to update permissions: ${err.response?.data?.detail || err.message}`)
      fetchRoles() // Rollback/Sync on error
    }
  }

  const handleToggleSinglePermission = async (role, module, actionType) => {
    try {
      console.log(`Toggling ${actionType} for ${module} in role ${role.id}`)
      
      // Get current module permissions
      const moduleData = role.modules?.find(m => m.module_name === module) || {
        module_name: module,
        read: false,
        write: false,
        delete: false,
        export: false,
        approve: false
      }
      
      // Toggle the permission
      const currentValue = moduleData[actionType] || false
      const newValue = !currentValue
      
      console.log(`Current value: ${currentValue}, New value: ${newValue}`)
      
      // Use the PATCH endpoint for single permission toggle
      await roleService.togglePermission(role.id, {
        module: module,
        permission: actionType,
        value: newValue
      })
      
      console.log('Permission toggled successfully')
      
      // Refresh roles
      fetchRoles()
    } catch (err) {
      console.error('Failed to toggle permission:', err)
      console.error('Error details:', err.response?.data)
      alert(`Failed to toggle permission: ${err.response?.data?.detail || err.message}`)
      fetchRoles() // Sync with server even on error
    }
  }

  const filteredRoles = roles.filter(role =>
    role && role.name && role.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredUsers = users.filter(user => 
    user && (
      (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  )

  const getPermissionStats = (perms) => {
    const stats = { write: 0, read: 0, delete: 0, export: 0 }
    if (!Array.isArray(perms)) return stats
    
    perms.forEach(p => {
      if (typeof p !== 'string') return
      if (p.includes(':read:')) stats.read++
      if (p.includes(':write:')) stats.write++
      if (p.includes(':delete:')) stats.delete++
      if (p.includes(':export:')) stats.export++
      if (p.includes(':*:') || p.includes(':all:')) {
        stats.read++; stats.write++; stats.delete++; stats.export++
      }
    })
    return stats
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 font-sans">
      <AnimatePresence>
        {showModal && (
          <RoleFormModal 
            role={selectedRole} 
            onClose={() => { setShowModal(false); setSelectedRole(null); }} 
            onSuccess={() => { setShowModal(false); setSelectedRole(null); fetchRoles(); }}
          />
        )}
      </AnimatePresence>

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users & Permissions</h1>
          <p className="mt-1 text-sm text-gray-500">Manage global roles and system-wide user access</p>
        </div>
        
        <div className="flex items-center gap-2 rounded-xl bg-gray-100 p-1">
          <button 
            onClick={() => setActiveTab('roles')}
            className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-semibold transition-all ${
              activeTab === 'roles' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Shield className="h-4 w-4" />
            Roles
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-semibold transition-all ${
              activeTab === 'users' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="h-4 w-4" />
            Users
          </button>
        </div>
      </div>

      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {activeTab === 'roles' && (
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-xl bg-[#2E5A36] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#2E5A36]/20 transition-all hover:bg-[#23452a] active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Create Role
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-500" />
          <p className="mt-2 text-sm text-gray-500">Loading {activeTab}...</p>
        </div>
      ) : activeTab === 'roles' ? (
        /* Roles Table */
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-200/50">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFF] border-b border-gray-100">
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-400">Role Name</th>
                  <th className="px-6 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-gray-400">Read</th>
                  <th className="px-6 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-gray-400">Write</th>
                  <th className="px-6 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-gray-400">Delete</th>
                  <th className="px-6 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-gray-400">Export</th>
                  <th className="px-6 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-gray-400">Type</th>
                  <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredRoles.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <Shield className="mx-auto h-12 w-12 text-gray-300" />
                      <p className="mt-2 text-sm font-medium text-gray-500">No roles found</p>
                    </td>
                  </tr>
                ) : (
                  filteredRoles.map((role, idx) => {
                    const stats = getPermissionStats(role?.permissions || [])
                    return (
                      <motion.tr 
                        key={role?.id || idx}
                        className="group hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                              <ShieldCheck className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">{role?.name || 'Unknown'}</p>
                              <p className="text-[11px] font-medium text-gray-400">
                                {role?.permissions?.length || 0} strings
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center"><Toggle enabled={stats.read > 0} label={`${stats.read}/${MODULES.length}`} onClick={() => handleToggleBulkPermission(role, 'read')} /></td>
                        <td className="px-6 py-5 text-center"><Toggle enabled={stats.write > 0} label={`${stats.write}/${MODULES.length}`} onClick={() => handleToggleBulkPermission(role, 'write')} /></td>
                        <td className="px-6 py-5 text-center"><Toggle enabled={stats.delete > 0} label={`${stats.delete}/${MODULES.length}`} onClick={() => handleToggleBulkPermission(role, 'delete')} /></td>
                        <td className="px-6 py-5 text-center"><Toggle enabled={stats.export > 0} label={`${stats.export}/${MODULES.length}`} onClick={() => handleToggleBulkPermission(role, 'export')} /></td>
                        <td className="px-6 py-5 text-center">
                          <div className="flex flex-col items-center gap-1">
                            {role?.is_system && <Badge type="system">System</Badge>}
                            {role?.is_default_employee && <Badge type="default">Default</Badge>}
                            {!role?.is_system && !role?.is_default_employee && <Badge type="custom">Custom</Badge>}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button onClick={() => handleEdit(role)} className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600"><Edit className="h-4 w-4" /></button>
                            {!role?.is_system && <button onClick={() => handleDelete(role?.id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>}
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Users Table */
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-200/50">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFF] border-b border-gray-100">
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-400">User</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-400">Organization</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-400">Current Role</th>
                  <th className="px-6 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-gray-400">Status</th>
                  <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <Users className="mx-auto h-12 w-12 text-gray-300" />
                      <p className="mt-2 text-sm font-medium text-gray-500">No users found</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, idx) => (
                    <motion.tr 
                      key={user?.id || idx}
                      className="group hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{user?.name || 'Unknown'}</p>
                            <p className="text-[11px] font-medium text-gray-400 flex items-center gap-1">
                              <Mail className="h-3 w-3" /> {user?.email || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          {user?.tenant_name || 'N/A'}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                          <Shield className="h-3 w-3" />
                          {user?.role?.replace('_', ' ') || 'No Role'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <Badge type={user?.status === 'active' ? 'active' : 'inactive'}>{user?.status || 'inactive'}</Badge>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button className="rounded-lg p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all">
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Visual background elements */}
      <div className="fixed bottom-0 right-0 -z-10 h-64 w-64 bg-gradient-to-tl from-[#89CC39]/5 to-transparent blur-3xl pointer-events-none" />
      <div className="fixed top-0 left-0 -z-10 h-64 w-64 bg-gradient-to-br from-[#1251C5]/5 to-transparent blur-3xl pointer-events-none" />
    </div>
  )
}

// Wrap with Error Boundary
const UserManagementPageWithErrorBoundary = () => (
  <ErrorBoundary>
    <UserManagementPage />
  </ErrorBoundary>
)

export default UserManagementPageWithErrorBoundary
