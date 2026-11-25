import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Search, Filter, UserPlus, Mail, Phone, MapPin, Edit, 
  MoreVertical, Eye, Pencil, Shield, Key, UserCog, UserMinus, X 
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// Action Menu Component
const ActionMenu = ({ employee, onView, onEdit, onManageRoles, onResetPassword, onDeactivate }) => {
  const [open, setOpen] = useState(false)
  
  return (
    <div className="relative">
      <button 
        onClick={() => setOpen(p => !p)} 
        className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100"
      >
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
                  onView(employee)
                  setOpen(false) 
                }} 
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Eye className="h-4 w-4 text-blue-500" /> View Profile
              </button>
              
              <button 
                onClick={() => { 
                  onEdit(employee)
                  setOpen(false) 
                }} 
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Pencil className="h-4 w-4 text-indigo-500" /> Edit Details
              </button>
              
              <button 
                onClick={() => { 
                  onManageRoles(employee)
                  setOpen(false) 
                }} 
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Shield className="h-4 w-4 text-purple-500" /> Manage Roles
              </button>
              
              <button 
                onClick={() => { 
                  onResetPassword(employee)
                  setOpen(false) 
                }} 
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Key className="h-4 w-4 text-amber-500" /> Reset Password
              </button>
              
              <div className="my-1 border-t border-slate-100" />
              
              <button 
                onClick={() => { 
                  onDeactivate(employee)
                  setOpen(false) 
                }} 
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <UserMinus className="h-4 w-4" /> Deactivate
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

const EmployeesPage = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')

  const employees = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@company.com',
      phone: '+1 234 567 8900',
      department: 'Sales',
      position: 'Sales Manager',
      status: 'active',
      avatar: 'JD',
    },
    {
      id: 2,
      name: 'Sarah Smith',
      email: 'sarah@company.com',
      phone: '+1 234 567 8901',
      department: 'Sales',
      position: 'Sales Representative',
      status: 'active',
      avatar: 'SS',
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike@company.com',
      phone: '+1 234 567 8902',
      department: 'Engineering',
      position: 'Senior Developer',
      status: 'active',
      avatar: 'MJ',
    },
    {
      id: 4,
      name: 'Emily Davis',
      email: 'emily@company.com',
      phone: '+1 234 567 8903',
      department: 'HR',
      position: 'HR Manager',
      status: 'active',
      avatar: 'ED',
    },
  ]

  const handleViewEmployee = (emp) => {
    navigate(`/employees/${emp.id}`)
  }

  const handleEditEmployee = (emp) => {
    alert(`Opening edit form for ${emp.name}`)
    // TODO: Implement edit employee modal
  }

  const handleManageRoles = (emp) => {
    alert(`Managing roles for ${emp.name}`)
    // TODO: Implement role management modal
  }

  const handleResetPassword = (emp) => {
    if (confirm(`Send password reset email to ${emp.email}?`)) {
      alert(`Password reset email sent to ${emp.email}`)
      // TODO: Implement API call
    }
  }

  const handleDeactivate = (emp) => {
    if (confirm(`Are you sure you want to deactivate ${emp.name}?`)) {
      alert(`${emp.name} has been deactivated`)
      // TODO: Implement API call
    }
  }

  return (
    <div className="flex h-full flex-col bg-[#F7F8FA] p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-sm text-gray-500">Manage company employees</p>
        </div>
        <button 
          onClick={() => navigate('/employees')}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <UserPlus className="h-4 w-4" />
          Add Employee
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
        >
          <option value="all">All Departments</option>
          <option value="sales">Sales</option>
          <option value="engineering">Engineering</option>
          <option value="marketing">Marketing</option>
          <option value="hr">HR</option>
        </select>
      </div>

      {/* Employees Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {employees.map((employee, index) => (
            <motion.div
              key={employee.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-purple-600 text-lg font-bold text-white">
                    {employee.avatar}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{employee.name}</h3>
                    <p className="text-xs text-gray-500">{employee.position}</p>
                  </div>
                </div>
                <ActionMenu
                  employee={employee}
                  onView={handleViewEmployee}
                  onEdit={handleEditEmployee}
                  onManageRoles={handleManageRoles}
                  onResetPassword={handleResetPassword}
                  onDeactivate={handleDeactivate}
                />
              </div>

              <div className="mb-3 space-y-2 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{employee.email}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  {employee.phone}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                  {employee.department}
                </span>
                <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                  {employee.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default EmployeesPage
