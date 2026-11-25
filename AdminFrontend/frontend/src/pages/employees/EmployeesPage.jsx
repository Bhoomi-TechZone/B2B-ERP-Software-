import { useState, useMemo, useCallback, memo, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import {
  Search, SlidersHorizontal, UserPlus, Users, TrendingUp, UserCheck,
  UserX, Clock, ChevronLeft, ChevronRight, MoreVertical, Eye, Pencil,
  UserMinus, RotateCcw, Download, X, DoorOpen, Mail, Send, CheckCircle2,
  Shield, Key, UserCog, Loader2, AlertCircle,
} from 'lucide-react'
import { getStatusColor } from './data/employeeData'
import { useDepartments } from '../../hooks/useDepartments'
import { useRoles } from '../../hooks/useRoles'
import { useAuth } from '../../hooks/useAuth'
import employeeService from '../../services/employeeService'
import onboardingService from '../../services/onboardingService'
import invitationService from '../../services/invitationService'
import AddEmployeeModal from '../../components/AddEmployeeModal'
import EditEmployeeModal from '../../components/EditEmployeeModal'

const formatDate = (dateStr) => {
  if (!dateStr || dateStr === '—') return '—'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

const SkeletonRow = () => (
  <tr className="border-b border-slate-100">
    {[...Array(9)].map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-4 animate-pulse rounded bg-slate-200" style={{ width: i === 1 ? '160px' : i === 2 ? '200px' : '100px' }} />
      </td>
    ))}
  </tr>
)

const StatusBadge = memo(({ status }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(status)}`}>
    <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
      status === 'Active' ? 'bg-green-500' :
      status === 'Probation' ? 'bg-amber-500' :
      (status === 'Inactive' || status === 'terminated' || status === 'Inactive') ? 'bg-slate-400' :
      status === 'Pending Start' ? 'bg-blue-500' :
      'bg-orange-500'
    }`} />
    {status}
  </span>
))
StatusBadge.displayName = 'StatusBadge'

const SYSTEM_ROLE_OPTIONS = [
  { value: 'employee', label: 'Employee' },
  { value: 'manager', label: 'Manager' },
  { value: 'hr_admin', label: 'HR Admin' },
  { value: 'payroll_admin', label: 'Payroll Admin' },
  { value: 'recruiter', label: 'Recruiter' },
  { value: 'finance_viewer', label: 'Finance Viewer' },
  { value: 'it_admin', label: 'IT Admin' },
  { value: 'admin', label: 'Admin' },
  { value: 'tenant_admin', label: 'Tenant Admin' },
]

const ActionMenu = memo(({ emp, onView, onEdit, onConvertToEmployee, onManageRoles, onResetPassword, onDeactivate, canWrite }) => {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  
  return (
    <div className="relative">
      <button onClick={() => setOpen(p => !p)} className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100">
        <MoreVertical className="h-4 w-4" />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.1 }}
              className="absolute right-0 z-20 mt-1 w-52 max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
            >
              <button 
                onClick={() => { 
                  navigate(`/employees/${emp.id}`)
                  setOpen(false) 
                }} 
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Eye className="h-4 w-4 text-blue-500" /> View Profile
              </button>
              
              {canWrite && (
                <button 
                  onClick={() => { 
                    onEdit(emp)
                    setOpen(false) 
                  }} 
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <Pencil className="h-4 w-4 text-indigo-500" /> Edit Details
                </button>
              )}
              
              {/* <button 
                onClick={() => { 
                  onManageRoles(emp)
                  setOpen(false) 
                }} 
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Shield className="h-4 w-4 text-purple-500" /> Manage Roles
              </button>
               */}
              {canWrite && (
                <>
                  <button 
                    onClick={() => { 
                      onResetPassword(emp)
                      setOpen(false) 
                    }} 
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <Key className="h-4 w-4 text-amber-500" /> Reset Password
                  </button>
                  
                  <div className="my-1 border-t border-slate-100" />
                  
                  {emp.status === 'Invited' && (
                    <button 
                      onClick={() => { 
                        onConvertToEmployee(emp)
                        setOpen(false) 
                      }} 
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50"
                    >
                      <UserCog className="h-4 w-4" /> Convert to Employee
                    </button>
                  )}
                  
                  <button 
                    onClick={() => { 
                      onDeactivate(emp)
                      setOpen(false) 
                    }} 
                    disabled={(emp.status || '').toLowerCase() === 'terminated'}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <UserMinus className="h-4 w-4" /> Deactivate
                  </button>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
})
// ─── Invite Modal ───────────────────────────────────────────────────────
const InviteModal = memo(({ isOpen, onClose, onInvite, employees = [], tenant }) => {
  const { departments } = useDepartments()
  const { roles } = useRoles()
  const [inviteType, setInviteType] = useState('existing') // existing | new
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [newForm, setNewForm] = useState({ name: '', email: '', role: '', department: '' })

  useEffect(() => {
    if (roles?.length > 0 && !newForm.role) {
      setNewForm(f => ({ ...f, role: roles[0].role_name || roles[0].name }))
    }
  }, [roles, newForm.role])

  const isAdminRoleSelected = useMemo(() => {
    if (inviteType === 'existing') {
      if (!selectedEmployee) return false
      const roleLower = (selectedEmployee.role || '').toLowerCase()
      return roleLower.includes('admin') || roleLower.includes('manager')
    } else {
      const roleLower = (newForm.role || '').toLowerCase()
      return roleLower.includes('admin') || roleLower.includes('manager')
    }
  }, [inviteType, selectedEmployee, newForm.role])

  const isAdminLimitReached = useMemo(() => {
    const max = tenant?.planLimits?.max_admin_users ?? -1
    const current = tenant?.planUsage?.admin_users ?? 0
    return max !== -1 && current >= max
  }, [tenant])

  const showAdminLimitWarning = isAdminRoleSelected && isAdminLimitReached

  // Filter employees based on search
  const filteredEmployees = useMemo(() => {
    if (!searchQuery) return employees
    const q = searchQuery.toLowerCase()
    return employees.filter(e => 
      e.fullName.toLowerCase().includes(q) || 
      e.email.toLowerCase().includes(q) || 
      (e.employeeNumber || e.custom_id || e.id).toLowerCase().includes(q)
    )
  }, [searchQuery, employees])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (showAdminLimitWarning) return
    
    if (inviteType === 'existing' && selectedEmployee) {
      onInvite({
        name: selectedEmployee.fullName,
        email: selectedEmployee.email,
        role: selectedEmployee.role,
        department: selectedEmployee.department,
      })
    } else if (inviteType === 'new' && newForm.name && newForm.email) {
      onInvite(newForm)
    }
    
    // Reset form
    handleClose()
  }

  const handleClose = () => {
    setInviteType('existing')
    setSelectedEmployee(null)
    setSearchQuery('')
    setNewForm({ name: '', email: '', role: roles?.[0]?.role_name || roles?.[0]?.name || '', department: '' })
    onClose()
  }

  const handleSelectEmployee = (emp) => {
    setSelectedEmployee(emp)
    setSearchQuery('')
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between border-b border-slate-200 p-6 sticky top-0 bg-white z-10">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Invite Employee</h3>
              <p className="text-sm text-slate-500 mt-1">Send invitation to join your team</p>
            </div>
            <button onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100 transition-colors">
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* ── Toggle: Existing or New ─────────────────────────── */}
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => { setInviteType('existing'); setSelectedEmployee(null) }}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${
                  inviteType === 'existing'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Select Existing Employee
              </button>
              <button
                type="button"
                onClick={() => { setInviteType('new'); setSelectedEmployee(null) }}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${
                  inviteType === 'new'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-4 h-4 inline mr-2" />
                Invite New Person
              </button>
            </div>

            {/* ── Existing Employee Search ────────────────────────── */}
            {inviteType === 'existing' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Search Employee
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name, email, or employee ID..."
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Employee List */}
                <div className="border border-slate-200 rounded-xl max-h-64 overflow-y-auto">
                  {filteredEmployees.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                      <Users className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                      <p className="font-semibold">No employees found</p>
                    </div>
                  ) : (
                    filteredEmployees.map(emp => (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => handleSelectEmployee(emp)}
                        className={`w-full flex items-center gap-4 p-4 border-b border-slate-100 last:border-b-0 transition-colors hover:bg-slate-50 ${
                          selectedEmployee?.id === emp.id ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                      >
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${emp.avatarColor}`}>
                          {emp.avatar}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-semibold text-slate-900">{emp.fullName}</p>
                          <p className="text-sm text-slate-500">{emp.email} · {emp.employeeNumber || emp.custom_id || emp.id}</p>
                        </div>
                        <div className="text-right">
                          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                            {emp.department}
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>

                {/* Selected Employee Details */}
                {selectedEmployee && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white ${selectedEmployee.avatarColor}`}>
                        {selectedEmployee.avatar}
                      </div>
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Full Name</p>
                          <p className="font-semibold text-slate-900">{selectedEmployee.fullName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Email</p>
                          <p className="text-sm text-slate-700">{selectedEmployee.email}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Department</p>
                          <p className="text-sm text-slate-700">{selectedEmployee.department}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Role</p>
                          <p className="text-sm text-slate-700">{selectedEmployee.role}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Phone</p>
                          <p className="text-sm text-slate-700">{selectedEmployee.phone}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Location</p>
                          <p className="text-sm text-slate-700">{selectedEmployee.location}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* ── New Person Form ─────────────────────────────────── */}
            {inviteType === 'new' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={newForm.name}
                    onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                    placeholder="e.g., John Doe"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Work Email *</label>
                  <input
                    type="email"
                    value={newForm.email}
                    onChange={(e) => setNewForm({ ...newForm, email: e.target.value })}
                    placeholder="john@company.com"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Role *</label>
                    <select
                      value={newForm.role}
                      onChange={(e) => setNewForm({ ...newForm, role: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {roles.map(r => <option key={r.id || r.role_name || r.name} value={r.role_name || r.name}>{r.role_name || r.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Department</label>
                    <select
                      value={newForm.department}
                      onChange={(e) => setNewForm({ ...newForm, department: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Department</option>
                      {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ── Admin Limit Warning ─────────────────────────────── */}
            {showAdminLimitWarning && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-center gap-3 text-amber-600 shadow-sm">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">Admin User Limit Reached</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Your current plan has reached its limit of <b>{tenant?.planLimits?.max_admin_users}</b> admin users. Assign a different role, upgrade your plan, or contact Superadmin.
                  </p>
                </div>
              </div>
            )}

            {/* ── Submit Buttons ──────────────────────────────────── */}
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <motion.button
                type="submit"
                whileHover={showAdminLimitWarning ? {} : { scale: 1.02 }}
                whileTap={showAdminLimitWarning ? {} : { scale: 0.98 }}
                disabled={
                  (inviteType === 'existing' && !selectedEmployee) ||
                  (inviteType === 'new' && (!newForm.name || !newForm.email)) ||
                  showAdminLimitWarning
                }
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-md hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                Send Invite
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
})
InviteModal.displayName = 'InviteModal'

ActionMenu.displayName = 'ActionMenu'

const EmployeesPage = memo(() => {
  const navigate = useNavigate()
  const { departments } = useDepartments()
  const { roles } = useRoles()
  const { tenant, refreshProfile, session } = useAuth()

  const canWriteEmployees = useMemo(() => {
    const roleLower = (session?.role || session?.user?.role || session?.user?.user_type || '').toLowerCase();
    if (roleLower.includes('admin') && !roleLower.includes('hr_admin')) return true; // System admins override
    if (roleLower === 'tenant_admin') return true;
    return session?.user?.userModules?.employees?.write === true;
  }, [session]);
  const [activeTab, setActiveTab] = useState('employees') // employees | invites
  const [employees, setEmployees] = useState([])
  const [totalEmployeesCount, setTotalEmployeesCount] = useState(0)
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true)
  const [employeesError, setEmployeesError] = useState('')
  const [search, setSearch] = useState('')
  const [filterDept, setFilterDept] = useState('All')
  const [filterRole, setFilterRole] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [page, setPage] = useState(1)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedEditEmployee, setSelectedEditEmployee] = useState(null)
  const [roleEmployee, setRoleEmployee] = useState(null)
  const [selectedRole, setSelectedRole] = useState('employee')
  const [isSavingRole, setIsSavingRole] = useState(false)
  const [isSendingReset, setIsSendingReset] = useState(false)
  const [isDeactivatingEmployee, setIsDeactivatingEmployee] = useState(false)
  const [invites, setInvites] = useState([])
  const [isLoadingInvites, setIsLoadingInvites] = useState(false)
  const [invitesError, setInvitesError] = useState('')
  const PAGE_SIZE = 20

  const isEmployeeLimitReached = useMemo(() => {
    const max = tenant?.planLimits?.max_employees ?? -1
    const current = tenant?.planUsage?.employees ?? 0
    return max !== -1 && current >= max
  }, [tenant])

  // Fetch employees from API
  const fetchEmployees = useCallback(async () => {
    setIsLoadingEmployees(true)
    setEmployeesError('')
    try {
      const data = await employeeService.getEmployees(page, PAGE_SIZE)
      console.log('Fetched employee data:', data)
      // Handle different response structures
      const employeeList = Array.isArray(data) ? data : (data?.employees || data?.data || data?.items || [])
      setTotalEmployeesCount(data?.total || employeeList.length)
      
      // Normalize employee data to match UI expectations
      const normalized = employeeList.map(emp => ({
        id: emp.id || emp.employee_id,
        userId: emp.user_id || emp.userId || null,
        employeeNumber: emp.employee_number || emp.id,
        fullName: `${emp.first_name || ''} ${emp.last_name || ''}`.trim(),
        email: emp.email_work || emp.email,
        phone: emp.phone_work || emp.phone || '—',
        department: emp.department_name || emp.department || '—',
        role: emp.job_title || emp.role || '—',
        systemRole: emp.system_role || emp.user_role || emp.role || 'employee',
        status: (() => {
          const rawStatus = (emp.employment_status || emp.status || '').toLowerCase();
          if (rawStatus === 'active') return 'Active';
          if (rawStatus === 'probation') return 'Probation';
          if (rawStatus === 'terminated' || rawStatus === 'inactive') return 'Inactive';
          if (rawStatus === 'pending_start') return 'Pending Start';
          return emp.employment_status || emp.status || 'Active';
        })(),
        joinDate: emp.hire_date || emp.join_date || '—',
        location: emp.region || emp.location || '—',
        manager: emp.manager_name || '—',
        avatar: (emp.first_name?.[0] || 'U') + (emp.last_name?.[0] || ''),
        avatarColor: 'bg-blue-500',
      }))
      
      setEmployees(normalized)
    } catch (err) {
      console.error('Failed to fetch employees:', err)
      setEmployeesError(err.message || 'Failed to load employees')
    } finally {
      setIsLoadingEmployees(false)
    }
  }, [page])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  // Fetch invitations from API
  const fetchInvitations = useCallback(async () => {
    setIsLoadingInvites(true)
    setInvitesError('')
    try {
      const data = await onboardingService.getInvitations()
      const inviteList = Array.isArray(data) ? data : (data?.invitations || data?.data || data?.members || [])
      
      // Normalize invitation data
      const normalized = inviteList.map(inv => ({
        id: inv.id,
        name: `${inv.first_name || ''} ${inv.last_name || ''}`.trim(),
        email: inv.email,
        role: inv.role || '—',
        department: inv.department || '—',
        status: inv.status || 'pending',
        invitedAt: inv.created_at ? new Date(inv.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—',
        expiresAt: inv.expires_at ? new Date(inv.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—',
      }))
      
      setInvites(normalized)
    } catch (err) {
      console.error('Failed to fetch invitations:', err)
      setInvitesError(err.message || 'Failed to load invitations')
    } finally {
      setIsLoadingInvites(false)
    }
  }, [])

  useEffect(() => {
    fetchInvitations()
  }, [fetchInvitations])

  const stats = useMemo(() => ({
    total: totalEmployeesCount,
    active: tenant?.planUsage?.employees ?? employees.filter(e => e.status === 'Active' || e.status === 'active').length,
    inactive: employees.filter(e => e.status === 'Inactive' || e.status === 'inactive').length,
    probation: employees.filter(e => e.status === 'Probation' || e.status === 'probation').length,
    pendingInvites: invites.filter(i => i.status === 'pending').length,
  }), [employees, invites, totalEmployeesCount, tenant])

  const filtered = useMemo(() => {
    return employees.filter(e => {
      const q = search.toLowerCase()
      const email = e.email || ''
      const matchSearch = !q || e.fullName.toLowerCase().includes(q) || email.toLowerCase().includes(q) || (e.employeeNumber || e.custom_id || e.id).toLowerCase().includes(q)
      const matchDept = filterDept === 'All' || e.department === filterDept
      const matchRole = filterRole === 'All' || e.role === filterRole
      const matchStatus = filterStatus === 'All' || e.status === filterStatus
      return matchSearch && matchDept && matchRole && matchStatus
    })
  }, [search, filterDept, filterRole, filterStatus, employees])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const resetFilters = useCallback(() => { setSearch(''); setFilterDept('All'); setFilterRole('All'); setFilterStatus('All'); setPage(1) }, [])

  const toggleSelect = useCallback((id) => {
    setSelectedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })
  }, [])

  const toggleAll = useCallback(() => {
    if (selectedIds.size === paginated.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(paginated.map(e => e.id)))
  }, [selectedIds.size, paginated])

  const handleSendInvite = useCallback(async (formData) => {
    try {
      const roleLower = (formData.role || '').toLowerCase()
      const isAd = roleLower.includes('admin') || roleLower.includes('manager')
      
      const maxAdmins = tenant?.planLimits?.max_admin_users ?? -1
      const currentAdmins = tenant?.planUsage?.admin_users ?? 0
      
      if (isAd && maxAdmins !== -1 && currentAdmins >= maxAdmins) {
        alert(`Admin user limit reached. Your plan allows a maximum of ${maxAdmins} admin users.`)
        return
      }

        const parts = (formData.name || '').trim().split(' ')
        const firstName = parts[0] || ''
        const lastName = parts.slice(1).join(' ') || ''
        
        await invitationService.invite({
          email: formData.email,
          first_name: firstName,
          last_name: lastName,
          role: formData.role || 'employee',
          phone: '',
          personal_details: {
            job_title: formData.role,
            department: formData.department
          },
          notification_prefs: {},
        })
      
      alert('Invitation sent successfully!')
      fetchInvitations()
      refreshProfile()
    } catch (err) {
      console.error('Failed to send invitation:', err)
      alert(err.message || 'Failed to send invitation')
    }
  }, [fetchInvitations, tenant, refreshProfile])

  const handleResendInvite = useCallback(async (id) => {
    try {
      await invitationService.resend(id)
      alert('Invitation resent successfully!')
      fetchInvitations()
    } catch (err) {
      console.error('Failed to resend invitation:', err)
      alert(err.message || 'Failed to resend invitation')
    }
  }, [fetchInvitations])

  const handleRevokeInvite = useCallback(async (id) => {
    if (confirm('Are you sure you want to revoke this invitation?')) {
      try {
        await invitationService.revoke(id, 'Revoked by admin from Employees page')
        alert('Invitation revoked successfully!')
        fetchInvitations()
        refreshProfile()
      } catch (err) {
        console.error('Failed to revoke invitation:', err)
        alert(err.message || 'Failed to revoke invitation')
      }
    }
  }, [fetchInvitations, refreshProfile])

  const handleConvertToEmployee = useCallback((emp) => {
    alert(`Converting ${emp.fullName} to employee. This will create a full employee record.`)
    // TODO: Implement API call to convert invited user to employee
  }, [])

  const handleManageRoles = useCallback((emp) => {
    const role = (emp.systemRole || 'employee').toLowerCase()
    setSelectedRole(SYSTEM_ROLE_OPTIONS.some(option => option.value === role) ? role : 'employee')
    setRoleEmployee(emp)
  }, [])

  const handleSaveRole = useCallback(async () => {
    if (!roleEmployee) return
    setIsSavingRole(true)
    try {
      await employeeService.updateEmployeeRole(roleEmployee.id, selectedRole)
      alert(`Role updated for ${roleEmployee.fullName}.`)
      setRoleEmployee(null)
      await fetchEmployees()
      refreshProfile()
    } catch (err) {
      console.error('Failed to update role:', err)
      alert(err.message || 'Failed to update role')
    } finally {
      setIsSavingRole(false)
    }
  }, [roleEmployee, selectedRole, fetchEmployees, refreshProfile])

  const handleResetPassword = useCallback(async (emp) => {
    if (!confirm(`Send password reset email to ${emp.email}?`)) return
    setIsSendingReset(true)
    try {
      const result = await employeeService.sendEmployeePasswordReset(emp.id)
      alert(result?.message || `Password reset email sent to ${emp.email}`)
    } catch (err) {
      console.error('Failed to send password reset:', err)
      if (err.message && err.message.toLowerCase().includes('no linked user account')) {
        try {
          const parts = (emp.fullName || '').trim().split(' ')
          const firstName = parts[0] || ''
          const lastName = parts.slice(1).join(' ') || ''
          const targetRole = emp.systemRole || emp.role || 'employee'
          
          await invitationService.invite({
            email: emp.email,
            first_name: firstName,
            last_name: lastName,
            role: targetRole,
            phone: emp.phone !== '—' ? emp.phone : '',
            personal_details: {
              job_title: emp.role !== '—' ? emp.role : '',
              department: emp.department !== '—' ? emp.department : ''
            },
            notification_prefs: {},
          })
          
          alert(`No linked user account found, so an invitation was sent successfully to ${emp.email} instead!`)
        } catch (inviteErr) {
          console.error('Failed to send fallback invitation:', inviteErr)
          alert(inviteErr.message || 'Failed to send invitation')
        }
      } else {
        alert(err.message || 'Failed to send password reset email')
      }
    } finally {
      setIsSendingReset(false)
    }
  }, [])

  const handleDeactivateEmployee = useCallback(async (emp) => {
    if (emp.status === 'terminated') return
    if (!confirm(`Deactivate ${emp.fullName}? This will mark the employee as terminated.`)) return
    setIsDeactivatingEmployee(true)
    try {
      await employeeService.deactivateEmployee(emp.id)
      alert(`${emp.fullName} deactivated successfully.`)
      await fetchEmployees()
      refreshProfile()
    } catch (err) {
      console.error('Failed to deactivate employee:', err)
      alert(err.message || 'Failed to deactivate employee')
    } finally {
      setIsDeactivatingEmployee(false)
    }
  }, [fetchEmployees, refreshProfile])

  // Export selected employees to CSV
  const handleExportSelected = useCallback(() => {
    const selectedEmployees = employees.filter(emp => selectedIds.has(emp.id))
    if (selectedEmployees.length === 0) {
      alert('No employees selected for export')
      return
    }

    // CSV headers
    const headers = ['Employee Number', 'Full Name', 'Email', 'Phone', 'Department', 'Role', 'Status', 'Join Date', 'Manager', 'Location']
    
    // CSV rows
    const rows = selectedEmployees.map(emp => [
      emp.employeeNumber || '',
      emp.fullName || '',
      emp.email || '',
      emp.phone || '',
      emp.department || '',
      emp.role || '',
      emp.status || '',
      emp.joinDate || '',
      emp.manager || '',
      emp.location || '',
    ])

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `employees_export_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    // Clear selection after export
    setSelectedIds(new Set())
  }, [employees, selectedIds])

  // Export all / filtered employees to CSV
  const handleExportAll = useCallback(() => {
    const listToExport = filtered && filtered.length > 0 ? filtered : employees
    if (!listToExport || listToExport.length === 0) {
      alert('No employees available to export')
      return
    }

    const headers = ['Employee Number', 'Full Name', 'Email', 'Phone', 'Department', 'Role', 'Status', 'Join Date', 'Manager', 'Location']
    const rows = listToExport.map(emp => [
      emp.employeeNumber || '',
      emp.fullName || '',
      emp.email || '',
      emp.phone || '',
      emp.department || '',
      emp.role || '',
      emp.status || '',
      emp.joinDate || '',
      emp.manager || '',
      emp.location || '',
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `employees_all_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [filtered, employees])

  // Bulk deactivate selected employees
  const handleBulkDeactivate = useCallback(async () => {
    if (selectedIds.size === 0) return
    const count = selectedIds.size
    if (!window.confirm(`Are you sure you want to deactivate ${count} selected employee${count > 1 ? 's' : ''}?`)) {
      return
    }
    setIsDeactivatingEmployee(true)
    try {
      await Promise.all(Array.from(selectedIds).map(id => employeeService.deactivateEmployee(id)))
      setSelectedIds(new Set())
      await fetchEmployees()
      refreshProfile()
      alert(`Successfully deactivated ${count} employee${count > 1 ? 's' : ''}.`)
    } catch (err) {
      console.error('Failed to deactivate employees:', err)
      alert(err.message || 'Failed to deactivate some employees')
    } finally {
      setIsDeactivatingEmployee(false)
    }
  }, [selectedIds, fetchEmployees, refreshProfile])

  const handleViewEmployee = useCallback((emp) => {
    navigate(`/employees/${emp.id}`)
  }, [navigate])

  const handleEditEmployee = useCallback(async (emp) => {
    try {
      const fullEmp = await employeeService.getEmployee(emp.id)
      setSelectedEditEmployee(fullEmp)
      setShowEditModal(true)
    } catch (err) {
      console.error('Failed to fetch employee details for editing:', err)
      alert('Failed to load employee details for editing. Please try again.')
    }
  }, [])

  const hasActiveFilters = search || filterDept !== 'All' || filterRole !== 'All' || filterStatus !== 'All'

  const totalCount = Number(stats.total) || 0
  const activeCount = Number(stats.active) || 0
  const activePercentage = totalCount > 0 ? ((activeCount / totalCount) * 100).toFixed(1) : '0.0'

  return (
    <div className="min-h-full bg-[#F7F8FA] p-6">
      <div className="mx-auto max-w-350 space-y-6">
        {/* Employee Limit Banner */}
        {isEmployeeLimitReached && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm animate-pulse">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-900">Employee Limit Reached</h4>
                <p className="text-xs text-amber-700 mt-0.5">
                  Your current plan has reached its limit of <b>{tenant?.planLimits?.max_employees}</b> employees. Upgrade your plan or contact Superadmin to increase your employee quota.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Employees</h2>
            <p className="mt-0.5 text-sm text-slate-500">{stats.total} total employees across all departments</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/employees/exit')} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
              <DoorOpen className="h-4 w-4 text-rose-500" /> Exit Management
            </button>
            {canWriteEmployees && (
              <>
                <motion.button
                  whileHover={isEmployeeLimitReached ? {} : { scale: 1.05 }}
                  whileTap={isEmployeeLimitReached ? {} : { scale: 0.95 }}
                  disabled={isEmployeeLimitReached}
                  onClick={() => setShowInviteModal(true)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition ${
                    isEmployeeLimitReached 
                      ? 'bg-amber-600/50 cursor-not-allowed opacity-60' 
                      : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  <Mail className="h-4 w-4" /> Invite Employee
                </motion.button>
                <button 
                  disabled={isEmployeeLimitReached}
                  onClick={() => setShowAddEmployeeModal(true)} 
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition active:scale-95 ${
                    isEmployeeLimitReached 
                      ? 'bg-blue-600/50 cursor-not-allowed opacity-60' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <UserPlus className="h-4 w-4" /> Add Employee
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {[
            { label: 'Total Employees', value: stats.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+12 this month' },
            { label: 'Active', value: stats.active, icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50', trend: `${activePercentage}% of total` },
            { label: 'On Probation', value: stats.probation, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', trend: 'Ending in 30 days: 2' },
            { label: 'Inactive', value: stats.inactive, icon: UserX, color: 'text-slate-600', bg: 'bg-slate-50', trend: 'Offboarded employees' },
            { label: 'Pending Invites', value: stats.pendingInvites, icon: Mail, color: 'text-amber-600', bg: 'bg-amber-50', trend: 'Awaiting response' },
          ].map((stat) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${stat.bg}`}><stat.icon className={`h-6 w-6 ${stat.color}`} /></div>
              <div className="min-w-0">
                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                <div className="truncate text-sm font-medium text-slate-600">{stat.label}</div>
                <div className="flex items-center gap-1 text-xs text-slate-400"><TrendingUp className="h-3 w-3" /> {stat.trend}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-55 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search by name, email or ID…" className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white" />
              {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X className="h-3.5 w-3.5" /></button>}
            </div>
            <select value={filterDept} onChange={e => { setFilterDept(e.target.value); setPage(1) }} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500">
              <option value="All">All Departments</option>
              {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
            </select>
            <select value={filterRole} onChange={e => { setFilterRole(e.target.value); setPage(1) }} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500">
              <option value="All">All Roles</option>
              {roles.map(r => <option key={r.id || r.role_name || r.name} value={r.role_name || r.name}>{r.role_name || r.name}</option>)}
            </select>
            <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500">
              <option value="All">All Status</option>
              <option>Active</option><option>Inactive</option><option>Probation</option><option>Notice Period</option><option>Pending Start</option>
            </select>
            {hasActiveFilters && (
              <button onClick={resetFilters} className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-100">
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </button>
            )}
            <button onClick={handleExportAll} className="ml-auto flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 cursor-pointer">
              <Download className="h-4 w-4" /> Export
            </button>
          </div>
        </div>

        {/* ── Tabs ─────────────────────────────────────────────────── */}
        <div className="border-b border-slate-200 bg-white rounded-2xl px-6 py-2 shadow-sm">
          <div className="flex gap-0">
            {[
              { id: 'employees', label: 'Employees', icon: Users, count: stats.total },
              { id: 'invites', label: 'Invitations', icon: Mail, count: stats.pendingInvites },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold ${
                    activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {selectedIds.size > 0 && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
              <span className="text-sm font-semibold text-blue-800">{selectedIds.size} employee{selectedIds.size > 1 ? 's' : ''} selected</span>
              <div className="flex gap-2">
                <button onClick={handleExportSelected} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 flex items-center gap-1.5">
                  <Download className="h-3.5 w-3.5" />
                  Export Selected
                </button>
                <button onClick={handleBulkDeactivate} className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-red-700 cursor-pointer">Deactivate Selected</button>
              </div>
              <button onClick={() => setSelectedIds(new Set())} className="ml-auto text-blue-600 hover:text-blue-800"><X className="h-4 w-4" /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {activeTab === 'employees' && (
          <div className="overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto pb-32">
            <table className="w-full min-w-225">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3.5 text-left"><input type="checkbox" checked={paginated.length > 0 && selectedIds.size === paginated.length} onChange={toggleAll} className="h-4 w-4 rounded border-slate-300 accent-blue-600" /></th>
                  {['Employee', 'Email', 'Department', 'Role', 'Manager', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoadingEmployees ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
                      <p className="mt-2 text-sm text-slate-500">Loading employees...</p>
                    </td>
                  </tr>
                ) : employeesError ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12">
                      <div className="flex flex-col items-center gap-3 text-center">
                        <AlertCircle className="h-12 w-12 text-red-500" />
                        <div>
                          <p className="font-semibold text-red-600">Failed to load employees</p>
                          <p className="text-sm text-slate-500 mt-1">{employeesError}</p>
                        </div>
                        <button
                          onClick={fetchEmployees}
                          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                          <RotateCcw className="h-4 w-4" /> Retry
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-20 text-center">
                      <div className="mx-auto flex max-w-xs flex-col items-center gap-3">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100"><Users className="h-8 w-8 text-slate-400" /></div>
                        <div>
                          <p className="font-semibold text-slate-700">No employees found</p>
                          <p className="mt-1 text-sm text-slate-400">Try adjusting your search or filter criteria</p>
                        </div>
                        <button onClick={resetFilters} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Clear Filters</button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map(emp => (
                    <motion.tr key={emp.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`group transition hover:bg-slate-50`}>
                      <td className="px-4 py-3.5"><input type="checkbox" checked={selectedIds.has(emp.id)} onChange={() => toggleSelect(emp.id)} className="h-4 w-4 rounded border-slate-300 accent-blue-600" /></td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${emp.avatarColor}`}>{emp.avatar}</div>
                          <div>
                            <button onClick={() => navigate(`/employees/${emp.id}`)} className="font-semibold text-slate-900 hover:text-blue-600 hover:underline">{emp.fullName}</button>
                            <div className="text-xs text-slate-400">{emp.employeeNumber} · {emp.location}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5"><div className="text-sm text-slate-700">{emp.email}</div><div className="text-xs text-slate-400">{emp.phone}</div></td>
                      <td className="px-4 py-3.5"><span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">{emp.department}</span></td>
                      <td className="px-4 py-3.5 text-sm text-slate-700">{emp.role}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-600">{emp.manager}</td>
                      <td className="px-4 py-3.5"><StatusBadge status={emp.status} /></td>
                      <td className="px-4 py-3.5 text-sm text-slate-500">{formatDate(emp.joinDate)}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          <button onClick={() => navigate(`/employees/${emp.id}`)} className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-50">View</button>
                          <ActionMenu 
                            emp={emp} 
                            onView={handleViewEmployee}
                            onEdit={handleEditEmployee}
                            onConvertToEmployee={handleConvertToEmployee}
                            onManageRoles={handleManageRoles}
                            onResetPassword={handleResetPassword}
                            onDeactivate={handleDeactivateEmployee}
                            canWrite={canWriteEmployees}
                          />
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {filtered.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3.5">
              <span className="text-sm text-slate-500">Showing <span className="font-medium text-slate-700">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}</span> of <span className="font-medium text-slate-700">{filtered.length}</span> employees</span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)} className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition ${page === i + 1 ? 'bg-blue-600 text-white border border-blue-600' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{i + 1}</button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>
          )}
        </div>
        )}

        {/* ── Invitations Table ────────────────────────────────────── */}
        {activeTab === 'invites' && (
          <div className="overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto pb-32">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    {['Employee', 'Email', 'Role', 'Department', 'Status', 'Invited', 'Expires', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoadingInvites ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-amber-600" />
                        <p className="mt-2 text-sm text-slate-500">Loading invitations...</p>
                      </td>
                    </tr>
                  ) : invitesError ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12">
                        <div className="flex flex-col items-center gap-3 text-center">
                          <AlertCircle className="h-12 w-12 text-red-500" />
                          <div>
                            <p className="font-semibold text-red-600">Failed to load invitations</p>
                            <p className="text-sm text-slate-500 mt-1">{invitesError}</p>
                          </div>
                          <button
                            onClick={fetchInvitations}
                            className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
                          >
                            <RotateCcw className="h-4 w-4" /> Retry
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : invites.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-20 text-center">
                        <div className="mx-auto flex max-w-xs flex-col items-center gap-3">
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100"><Mail className="h-8 w-8 text-slate-400" /></div>
                          <div>
                            <p className="font-semibold text-slate-700">No invitations sent</p>
                            <p className="mt-1 text-sm text-slate-400">Invite team members to join your organization</p>
                          </div>
                          <button onClick={() => setShowInviteModal(true)} className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700">Send Invite</button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    invites.map(inv => (
                      <motion.tr key={inv.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="group transition hover:bg-slate-50">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-xs font-bold text-white">
                              {inv.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="font-semibold text-slate-900">{inv.name}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-slate-700">{inv.email}</td>
                        <td className="px-4 py-3.5"><span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">{inv.role}</span></td>
                        <td className="px-4 py-3.5 text-sm text-slate-700">{inv.department}</td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            inv.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            inv.status === 'accepted' ? 'bg-green-100 text-green-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {inv.status === 'pending' && <Mail className="h-3 w-3 mr-1" />}
                            {inv.status === 'accepted' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                            {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-slate-500">{inv.invitedAt}</td>
                        <td className="px-4 py-3.5 text-sm text-slate-500">{inv.expiresAt}</td>
                        <td className="px-4 py-3.5">
                          {inv.status === 'pending' && (
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleResendInvite(inv.id)} className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-50 flex items-center gap-1">
                                <RotateCcw className="h-3 w-3" /> Resend
                              </button>
                              <button onClick={() => handleRevokeInvite(inv.id)} className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50">
                                Revoke
                              </button>
                            </div>
                          )}
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Invite Modal ─────────────────────────────────────────── */}
        <InviteModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          onInvite={handleSendInvite}
          employees={employees}
          tenant={tenant}
        />

        {/* ── Add Employee Modal ───────────────────────────────────── */}
        <AnimatePresence>
          {roleEmployee && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 12 }}
                className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
              >
                {/* <div className="flex items-start justify-between border-b border-slate-100 p-5">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Manage Roles</h3>
                    <p className="mt-1 text-sm text-slate-500">{roleEmployee.fullName} · {roleEmployee.email}</p>
                  </div>
                  <button
                    onClick={() => setRoleEmployee(null)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    disabled={isSavingRole}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div> */}
                <div className="space-y-4 p-5">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">System Role</label>
                    <select
                      value={selectedRole}
                      onChange={(event) => setSelectedRole(event.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      disabled={isSavingRole}
                    >
                      {SYSTEM_ROLE_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  {!roleEmployee.userId && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                      This employee is not linked with a login user ID yet. If a user exists with the same work email, the backend will update that account.
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-end gap-3 border-t border-slate-100 p-5">
                  <button
                    onClick={() => setRoleEmployee(null)}
                    disabled={isSavingRole}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveRole}
                    disabled={isSavingRole}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSavingRole && <Loader2 className="h-4 w-4 animate-spin" />}
                    Save Role
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AddEmployeeModal
          isOpen={showAddEmployeeModal}
          onClose={() => setShowAddEmployeeModal(false)}
          onSuccess={() => {
            // Refresh employee list after adding new employee
            fetchEmployees()
            alert('Employee added successfully!')
          }}
        />

        {/* ── Edit Employee Modal ──────────────────────────────────── */}
        <EditEmployeeModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setSelectedEditEmployee(null)
          }}
          employee={selectedEditEmployee}
          onSuccess={() => {
            fetchEmployees()
            alert('Employee updated successfully!')
          }}
        />
      </div>
    </div>
  )
})

EmployeesPage.displayName = 'EmployeesPage'
export default EmployeesPage
