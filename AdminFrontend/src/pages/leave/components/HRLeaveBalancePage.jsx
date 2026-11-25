import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Search, ChevronDown, Download, Plus, Minus, Edit2, Trash2, X, RefreshCw, CheckCircle, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import leaveService from '../../../services/leaveService'
import employeeService from '../../../services/employeeService'
import LeaveAdjustmentModal from './LeaveAdjustmentModal'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay()
}

// ==================== NEW BALANCE MODAL ====================
function NewBalanceModal({ open, onClose, onSuccess }) {
  const [policies, setPolicies] = useState([])
  const [employees, setEmployees] = useState([])
  const [selectedPolicy, setSelectedPolicy] = useState('')
  const [selectedEmployees, setSelectedEmployees] = useState([])
  const [searchEmployee, setSearchEmployee] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      fetchData()
    }
  }, [open])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [policiesRes, employeesRes] = await Promise.all([
        leaveService.getPolicies(),
        employeeService.getEmployees(1, 1000)
      ])
      
      setPolicies(Array.isArray(policiesRes) ? policiesRes : policiesRes?.data || [])
      setEmployees(Array.isArray(employeesRes) ? employeesRes : employeesRes?.employees || [])
    } catch (err) {
      console.error('Failed to load data:', err)
      setError('Failed to load policies and employees')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedPolicy) {
      setError('Please select a leave policy')
      return
    }
    if (selectedEmployees.length === 0) {
      setError('Please select at least one employee')
      return
    }

    setSaving(true)
    setError('')
    try {
      await leaveService.assignPolicyToEmployees({
        policy_id: selectedPolicy,
        employee_ids: selectedEmployees
      })
      onSuccess()
      handleClose()
    } catch (err) {
      console.error('Failed to assign policy:', err)
      setError(err.response?.data?.detail || 'Failed to assign leave policy')
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    if (!saving) {
      setSelectedPolicy('')
      setSelectedEmployees([])
      setSearchEmployee('')
      setError('')
      onClose()
    }
  }

  const toggleEmployee = (empId) => {
    setSelectedEmployees(prev => 
      prev.includes(empId) 
        ? prev.filter(id => id !== empId)
        : [...prev, empId]
    )
  }

  const selectAll = () => {
    const filtered = getFilteredEmployees()
    const allIds = filtered.map(e => e.id)
    setSelectedEmployees(allIds)
  }

  const clearAll = () => {
    setSelectedEmployees([])
  }

  const getFilteredEmployees = () => {
    return employees.filter(emp => {
      const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase()
      const searchLower = searchEmployee.toLowerCase()
      return fullName.includes(searchLower) || 
             (emp.employee_id || '').toLowerCase().includes(searchLower)
    })
  }

  const activePolicies = policies.filter(p => p.status === 'Active' || p.status === 'active')
  const filteredEmployees = getFilteredEmployees()

  if (!open) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl max-h-[90vh] flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Assign Leave Balance</h2>
              <p className="text-xs text-slate-500">Select policy and employees to assign leave balance</p>
            </div>
            <button 
              onClick={handleClose} 
              disabled={saving}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : (
              <>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Select Leave Policy *
                  </label>
                  <select
                    value={selectedPolicy}
                    onChange={e => setSelectedPolicy(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:bg-white focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">-- Choose Policy --</option>
                    {activePolicies.map(policy => (
                      <option key={policy.id || policy._id} value={policy.id || policy._id}>
                        {policy.policy_name} ({policy.total_days} days)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Select Employees * ({selectedEmployees.length} selected)
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={selectAll}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={clearAll}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                  
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={searchEmployee}
                      onChange={e => setSearchEmployee(e.target.value)}
                      placeholder="Search employees..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm text-slate-700 outline-none transition focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50">
                    {filteredEmployees.length === 0 ? (
                      <div className="p-6 text-center text-sm text-slate-400">
                        No employees found
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {filteredEmployees.map(emp => {
                          const empId = emp.id
                          const isSelected = selectedEmployees.includes(empId)
                          return (
                            <label
                              key={empId}
                              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition hover:bg-white ${
                                isSelected ? 'bg-blue-50' : ''
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleEmployee(empId)}
                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-100"
                              />
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-slate-800">
                                  {emp.first_name} {emp.last_name}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {emp.employee_id} • {emp.department?.name || 'No Department'}
                                </p>
                              </div>
                            </label>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
            <button 
              onClick={handleClose} 
              disabled={saving}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit} 
              disabled={saving || loading}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
            >
              {saving && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
              {saving ? 'Assigning...' : 'Assign Policy'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function EditBalanceModal({ open, onClose, onSave, saving, balance }) {
  const [form, setForm] = useState({
    total_days: '',
    remaining_days: '',
    status: 'Active',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (open && balance) {
      setForm({
        total_days: balance.total_days ?? balance.entitled ?? balance.total ?? '',
        remaining_days: balance.remaining_days ?? balance.balance ?? balance.remaining ?? '',
        status: balance.status || 'Active',
      })
      setErrors({})
    }
  }, [open, balance])

  if (!open || !balance) return null

  const set = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
    setErrors(prev => ({ ...prev, [key]: '' }))
  }

  const handleSave = () => {
    const totalDays = Number(form.total_days)
    const remainingDays = Number(form.remaining_days)
    const errs = {}

    if (!Number.isInteger(totalDays) || totalDays < 0) errs.total_days = 'Enter valid total days'
    if (!Number.isInteger(remainingDays) || remainingDays < 0) errs.remaining_days = 'Enter valid remaining days'
    if (Number.isFinite(totalDays) && Number.isFinite(remainingDays) && remainingDays > totalDays) {
      errs.remaining_days = 'Remaining cannot be more than total'
    }

    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    onSave({
      total_days: totalDays,
      remaining_days: remainingDays,
      status: form.status,
    })
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Edit Leave Balance</h2>
                <p className="text-xs text-slate-500">{balance.employee_name || 'Employee'} - {balance.leave_type || balance.policy_name || 'Leave Type'}</p>
              </div>
              <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 px-6 py-5">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Total Days</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.total_days}
                  onChange={e => set('total_days', e.target.value)}
                  className={`w-full rounded-xl border bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:bg-white focus:ring-2 ${errors.total_days ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-100'}`}
                />
                {errors.total_days && <p className="mt-1 text-xs text-red-500">{errors.total_days}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Remaining Days</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.remaining_days}
                  onChange={e => set('remaining_days', e.target.value)}
                  className={`w-full rounded-xl border bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:bg-white focus:ring-2 ${errors.remaining_days ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-100'}`}
                />
                {errors.remaining_days && <p className="mt-1 text-xs text-red-500">{errors.remaining_days}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Status</label>
                <div className="relative">
                  <select
                    value={form.status}
                    onChange={e => set('status', e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:bg-white focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button onClick={onClose} disabled={saving} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60">
                {saving && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                Save Changes
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function AssignModal({ open, onClose, onSave, saving, policies }) {
  const [form, setForm] = useState({
    policyId: '',
    employeeIds: [],
  })
  const [errors, setErrors] = useState({})
  const [employees, setEmployees] = useState([])
  const [loadingEmployees, setLoadingEmployees] = useState(false)
  const [selectedEmployees, setSelectedEmployees] = useState([])

  useEffect(() => {
    if (open) {
      fetchEmployees()
      setForm({ policyId: '', employeeIds: [] })
      setSelectedEmployees([])
      setErrors({})
    }
  }, [open])
  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true)
      const response = await employeeService.getEmployees(1, 1000)
      const employeeList = Array.isArray(response)
        ? response
        : (response?.employees || response?.data || response?.items || [])

      setEmployees(employeeList)
    } catch (err) {
      console.error('Failed to fetch employees:', err)
      setEmployees([])
      setErrors({ fetchEmployees: 'Failed to fetch employees. Please try again.' })
    } finally {
      setLoadingEmployees(false)
    }
  }

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: '' }))
  }

  const toggleEmployee = (empId) => {
    setSelectedEmployees(prev => {
      if (prev.includes(empId)) {
        return prev.filter(id => id !== empId)
      } else {
        return [...prev, empId]
      }
    })
  }

  const validate = () => {
    const errs = {}
    if (!form.policyId) errs.policyId = 'Policy is required'
    if (selectedEmployees.length === 0) errs.employees = 'Select at least one employee'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    onSave({ ...form, employeeIds: selectedEmployees })
  }

  if (!open) return null

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-bold text-slate-900">Assign Leave Policy</h2>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Leave Policy *
                </label>
                <div className="relative">
                  <select
                    value={form.policyId}
                    onChange={e => set('policyId', e.target.value)}
                    className={`w-full appearance-none rounded-xl border bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:bg-white focus:ring-2 ${errors.policyId ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100'}`}
                  >
                    <option value="">Select Policy</option>
                    {policies.map(p => (
                      <option key={p.id || p._id} value={p.id || p._id}>
                        {p.name || p.policy_name} ({p.total_days || 0} days)
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
                </div>
                {errors.policyId && <p className="mt-1 text-xs text-red-500">{errors.policyId}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Select Employees * ({selectedEmployees.length} selected)
                </label>
                {loadingEmployees ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
                    <RefreshCw className="mx-auto h-6 w-6 animate-spin text-slate-400" />
                    <p className="mt-2 text-sm text-slate-500">Loading employees...</p>
                  </div>
                ) : employees.length === 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
                    <p className="text-sm text-slate-500">No employees found</p>
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50">
                    {employees.map(emp => {
                      const empId = emp.id || emp._id || emp.employee_id
                      const empName = emp.full_name || emp.name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || emp.email_work || 'Unknown'
                      const empDept = emp.department_name || emp.department || 'N/A'
                      const isSelected = selectedEmployees.includes(empId)
                      
                      return (
                        <label
                          key={empId}
                          className={`flex items-center gap-3 border-b border-slate-200 px-4 py-3 cursor-pointer transition hover:bg-white last:border-b-0 ${isSelected ? 'bg-blue-50' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleEmployee(empId)}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-100"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-800">{empName}</p>
                            <p className="text-xs text-slate-500">{empDept}</p>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                )}
                {errors.employees && <p className="mt-1 text-xs text-red-500">{errors.employees}</p>}
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button
                onClick={onClose}
                disabled={saving}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
              >
                {saving && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                Assign Policy
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function HRLeaveBalancePage() {
  const [balances, setBalances] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [modalType, setModalType] = useState('add') // 'add' or 'deduct'
  const [editOpen, setEditOpen] = useState(false)
  const [editingBalance, setEditingBalance] = useState(null)
  const [saving, setSaving] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)
  const [policies, setPolicies] = useState([])
  const [assignSaving, setAssignSaving] = useState(false)

  // Calendar state
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [holidays, setHolidays] = useState([])
  const [leaves, setLeaves] = useState([])
  const [showCalendar, setShowCalendar] = useState(false)
  
  // New Balance Modal state
  const [newBalanceModalOpen, setNewBalanceModalOpen] = useState(false)

  useEffect(() => {
    fetchBalances()
    fetchCalendarData()
  }, [])

  const fetchCalendarData = async () => {
    try {
      const holRes = await leaveService.getHolidays()
      const holList = holRes?.data || holRes || []
      setHolidays(Array.isArray(holList) ? holList : [])

      const leavesRes = await leaveService.getAllLeaveRequests()
      setLeaves(Array.isArray(leavesRes) ? leavesRes : [])
    } catch (err) {
      console.error('Failed to load calendar data:', err)
    }
  }

  const fetchBalances = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await leaveService.getAllLeaveBalances()
      // Backend returns {total_records, data}
      const data = response?.data || response
      setBalances(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to fetch balances:', err)
      setError('Failed to load leave balances. Please try again.')
      setBalances([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddLeave = (employee) => {
    setSelectedEmployee(employee)
    setModalType('add')
    setModalOpen(true)
  }

  const handleDeductLeave = (employee) => {
    setSelectedEmployee(employee)
    setModalType('deduct')
    setModalOpen(true)
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setSelectedEmployee(null)
  }

  const handleAdjustmentSuccess = () => {
    // Refresh the leave balances
    fetchBalances()
  }

  const getAssignmentId = (row) => row?.assignment_id || row?.id || row?._id

  const handleEdit = (balance) => {
    setEditingBalance(balance)
    setEditOpen(true)
  }

  const handleOpenAssign = async () => {
    try {
      setAssignSaving(true)
      const policiesData = await leaveService.getPolicies()
      setPolicies(Array.isArray(policiesData) ? policiesData : [])
      setAssignOpen(true)
    } catch (err) {
      console.error('Failed to fetch policies for assignment:', err)
      alert('Failed to load leave policies. Please try again.')
    } finally {
      setAssignSaving(false)
    }
  }

  const handleAssign = async (formData) => {
    setSaving(true)
    try {
      await leaveService.assignPolicyToEmployees({
        policy_id: formData.policyId,
        employee_ids: formData.employeeIds,
      })
      await fetchBalances()
      setAssignOpen(false)
    } catch (err) {
      console.error('Failed to assign policy:', err)
      alert('Failed to assign policy. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateBalance = async (updateData) => {
    const assignmentId = getAssignmentId(editingBalance)
    if (!assignmentId) {
      alert('Assignment id missing. Please refresh and try again.')
      return
    }

    setSaving(true)
    try {
      await leaveService.updateLeaveAssignment(assignmentId, updateData)
      await fetchBalances()
      setEditOpen(false)
      setEditingBalance(null)
    } catch (err) {
      console.error('Failed to update balance:', err)
      alert(err.response?.data?.detail || 'Failed to update leave balance. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (balance) => {
    const assignmentId = getAssignmentId(balance)
    if (!assignmentId) {
      alert('Assignment id missing. Please refresh and try again.')
      return
    }
    if (!window.confirm('Are you sure you want to remove this leave assignment?')) return

    try {
      await leaveService.deleteLeaveAssignment(assignmentId)
      await fetchBalances()
    } catch (err) {
      console.error('Failed to delete balance:', err)
      alert(err.response?.data?.detail || 'Failed to delete leave assignment. Please try again.')
    }
  }

  const filtered = balances.filter(b => {
    const empName = b.empName || b.employee_name || b.employee?.name || ''
    const empId = b.empId || b.employee_id || b.employee?.id || ''
    const dept = b.department || b.employee?.department || ''
    const leaveType = b.leaveType || b.leave_type || b.type || ''
    
    if (search && !empName.toLowerCase().includes(search.toLowerCase()) && !empId.toLowerCase().includes(search.toLowerCase())) return false
    if (deptFilter !== 'all' && dept !== deptFilter) return false
    if (typeFilter !== 'all' && leaveType !== typeFilter) return false
    return true
  })

  const displayData = filtered

  const departments = [...new Set(displayData.map(b => b.department || b.employee?.department || 'Unknown').filter(Boolean))]
  const leaveTypes = [...new Set(displayData.map(b => b.leaveType || b.leave_type || b.type || 'Unknown').filter(Boolean))]

  const totalUsed = displayData.reduce((sum, b) => sum + (b.used_days ?? b.used ?? 0), 0)
  const totalRemaining = displayData.reduce((sum, b) => sum + (b.remaining_days ?? b.balance ?? b.remaining ?? 0), 0)
  const criticalCount = displayData.filter(b => (b.remaining_days ?? b.balance ?? b.remaining ?? 0) <= 2).length

  // Calendar helper functions
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const getDateString = (day) => {
    return `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const getLeaveForDate = (day) => {
    const dateStr = getDateString(day)
    const dayTime = new Date(dateStr).getTime()

    const match = leaves.find(l => {
      if ((l.status || '').toLowerCase() !== 'approved') return false
      const start = new Date(l.start_date.split('T')[0]).getTime()
      const end = new Date(l.end_date.split('T')[0]).getTime()
      return dayTime >= start && dayTime <= end
    })

    if (!match) return null

    const type = match.leave_type || match.leaveType || 'Casual'
    const colorClass = type.toLowerCase().includes('sick') ? 'bg-green-100 text-green-700' :
                       type.toLowerCase().includes('casual') ? 'bg-blue-100 text-blue-700' :
                       'bg-purple-100 text-purple-700'

    return {
      type: `${match.employee_name || match.empName || 'Staff'}: ${type}`,
      color: colorClass
    }
  }

  const getHolidayForDate = (day) => {
    const dateStr = getDateString(day)
    const match = holidays.find(h => {
      if (!h.holiday_date) return false
      const hDate = new Date(h.holiday_date).toISOString().split('T')[0]
      return hDate === dateStr
    })

    if (!match) return null
    return {
      name: match.name || match.holiday_name,
      color: 'bg-amber-100 text-amber-700'
    }
  }

  const isTodayDate = (day) => {
    return day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()
  }

  const isWeekend = (day) => {
    const date = new Date(currentYear, currentMonth, day)
    const dayOfWeek = date.getDay()
    return dayOfWeek === 0 || dayOfWeek === 6
  }

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)

  const calendarDays = []
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
        <div className="h-96 rounded-2xl bg-slate-100 animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchBalances}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 rounded-2xl bg-white p-1 shadow-sm border border-slate-200">
          <button 
            onClick={() => setShowCalendar(false)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${!showCalendar ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
          >
            Balance View
          </button>
          <button 
            onClick={() => setShowCalendar(true)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${showCalendar ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
          >
            <CalendarIcon className="inline h-3.5 w-3.5 mr-1.5" />
            Calendar View
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Employees', value: new Set(displayData.map(b => b.empId || b.employee_id)).size, color: 'text-blue-700', bg: 'bg-blue-50' },
          { label: 'Total Used', value: totalUsed, color: 'text-rose-700', bg: 'bg-rose-50' },
          { label: 'Total Remaining', value: totalRemaining, color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Critical (≤ 2)', value: criticalCount, color: 'text-amber-700', bg: 'bg-amber-50' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`rounded-2xl ${s.bg} p-4`}
          >
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="mt-1 text-sm font-medium text-slate-500">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search employee…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="relative">
          <select
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
            className="appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-400"
          >
            <option value="all">All Departments</option>
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-slate-400" />
        </div>

        <div className="relative">
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-400"
          >
            <option value="all">All Leave Types</option>
            {leaveTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-slate-400" />
        </div>

        <button className="rounded-xl border border-slate-200 bg-white p-2 text-slate-400 shadow-sm transition hover:text-blue-600">
          <Download className="h-4 w-4" />
        </button>

        <button 
          onClick={() => setNewBalanceModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New Balance
        </button>

      </div>

      {/* Calendar View */}
      {showCalendar && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
        >
          {/* Calendar Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <h3 className="text-lg font-bold text-slate-900">
              {MONTHS[currentMonth]} {currentYear}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextMonth}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-6">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {DAYS.map(day => (
                <div key={day} className="text-center text-xs font-semibold text-slate-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, index) => {
                if (!day) {
                  return <div key={`empty-${index}`} className="aspect-square" />
                }

                const leave = getLeaveForDate(day)
                const holiday = getHolidayForDate(day)
                const todayCheck = isTodayDate(day)
                const isWeekendDay = isWeekend(day)

                return (
                  <motion.div
                    key={day}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.005 }}
                    className={`aspect-square rounded-lg border p-2 transition cursor-pointer ${
                      todayCheck
                        ? 'border-blue-500 bg-blue-50'
                        : holiday
                        ? 'border-amber-200 bg-amber-50'
                        : leave
                        ? `border-${leave.color.split('-')[1]}-200 ${leave.color.split(' ')[0]}`
                        : isWeekendDay
                        ? 'border-slate-100 bg-slate-50'
                        : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex flex-col h-full">
                      <div className={`text-sm font-semibold ${
                        todayCheck
                          ? 'text-blue-700'
                          : holiday
                          ? 'text-amber-700'
                          : leave
                          ? leave.color.split(' ')[1]
                          : isWeekendDay
                          ? 'text-slate-400'
                          : 'text-slate-700'
                      }`}>
                        {day}
                      </div>

                      {leave && (
                        <div className="mt-1 min-w-0">
                          <div className={`text-[10px] truncate rounded px-1 py-0.5 font-medium ${leave.color}`} title={leave.type}>
                            {leave.type.split(':')[0]}
                          </div>
                        </div>
                      )}

                      {holiday && (
                        <div className="mt-1 min-w-0">
                          <div className="text-[10px] truncate rounded bg-amber-100 px-1 py-0.5 text-amber-700 font-medium" title={holiday.name}>
                            {holiday.name}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="border-t border-slate-100 px-6 py-4">
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-blue-100" />
                <span className="text-slate-600">Casual Leave</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-green-100" />
                <span className="text-slate-600">Sick Leave</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-purple-100" />
                <span className="text-slate-600">Other Leave</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-amber-100" />
                <span className="text-slate-600">Holiday</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-slate-100" />
                <span className="text-slate-600">Weekend</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Table */}
      {!showCalendar && (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                {['Employee', 'Department', 'Leave Type', 'Total', 'Used', 'Remaining', 'Status', 'Paid', 'Usage %', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-5 py-16 text-center text-sm text-slate-400">
                    No balances found
                  </td>
                </tr>
              ) : (
                displayData.map((b, i) => {
                  const empName = b.empName || b.employee_name || b.employee?.name || 'Unknown'
                  const empId = b.empId || b.employee_id || b.employee?.id || 'N/A'
                  const dept = b.department || b.employee?.department || 'N/A'
                  const leaveType = b.leaveType || b.leave_type || b.policy_name || b.type || 'N/A'
                  const total = b.total_days ?? b.total ?? b.entitled ?? 0
                  const used = b.used_days ?? b.used ?? 0
                  const remaining = b.remaining_days ?? b.remaining ?? b.balance ?? 0
                  const status = b.status || 'Active'
                  const paid = b.paid ?? b.is_paid
                  const usagePercent = total > 0 ? Math.round((used / total) * 100) : 0
                  
                  return (
                    <motion.tr
                      key={getAssignmentId(b) || `${empId}-${leaveType}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-3.5">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{empName}</p>
                          <p className="text-xs text-slate-400">{empId}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">{dept}</span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-700">{leaveType}</td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-slate-900">{total}</td>
                      <td className="px-5 py-3.5 text-sm text-rose-600 font-medium">{used}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-sm font-bold ${
                          remaining <= 2 ? 'text-amber-600' : remaining > 10 ? 'text-emerald-600' : 'text-slate-700'
                        }`}>
                          {remaining}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {status === 'Active' && <CheckCircle className="h-3 w-3" />}
                          {status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm font-medium text-slate-700">{paid === false ? 'No' : 'Yes'}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-blue-500"
                              style={{ width: `${usagePercent}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-slate-500">{usagePercent}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAddLeave(b)}
                            className="rounded-lg bg-emerald-50 p-2 text-emerald-600 hover:bg-emerald-100 transition"
                            title="Add Leave"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeductLeave(b)}
                            className="rounded-lg bg-rose-50 p-2 text-rose-600 hover:bg-rose-100 transition"
                            title="Deduct Leave"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(b)}
                            className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100 transition"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(b)}
                            className="rounded-lg bg-slate-50 p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 transition"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {displayData.length > 0 && (
          <div className="border-t border-slate-100 px-5 py-3">
            <p className="text-xs text-slate-400">
              Showing <span className="font-semibold text-slate-600">{displayData.length}</span> records
            </p>
          </div>
        )}
      </motion.div>
      )}

      {/* Leave Adjustment Modal */}
      <LeaveAdjustmentModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        employee={selectedEmployee}
        type={modalType}
        onSuccess={handleAdjustmentSuccess}
      />
      <EditBalanceModal
        open={editOpen}
        onClose={() => {
          setEditOpen(false)
          setEditingBalance(null)
        }}
        onSave={handleUpdateBalance}
        saving={saving}
        balance={editingBalance}
      />
      <NewBalanceModal
        open={newBalanceModalOpen}
        onClose={() => setNewBalanceModalOpen(false)}
        onSuccess={() => {
          fetchBalances()
          setNewBalanceModalOpen(false)
        }}
      />
    </div>
  )
}
