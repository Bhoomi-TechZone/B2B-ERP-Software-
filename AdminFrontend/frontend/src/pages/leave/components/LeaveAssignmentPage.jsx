import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, Search, ChevronDown, Users, CheckCircle, X, RefreshCw, Trash2, Edit2 } from 'lucide-react'
import leaveService from '../../../services/leaveService'
import employeeService from '../../../services/employeeService'

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

function EditAssignmentModal({ open, onClose, onSave, saving, assignment }) {
  const [form, setForm] = useState({
    total_days: '',
    remaining_days: '',
    status: 'Active',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (open && assignment) {
      setForm({
        total_days: assignment.total_days ?? assignment.entitled ?? '',
        remaining_days: assignment.remaining_days ?? assignment.balance ?? '',
        status: assignment.status || 'Active',
      })
      setErrors({})
    }
  }, [open, assignment])

  if (!open || !assignment) return null

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: '' }))
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
                <h2 className="text-lg font-bold text-slate-900">Edit Leave Assignment</h2>
                <p className="text-xs text-slate-500">{assignment.employee_name || 'Employee'} - {assignment.policy_name || 'Leave Policy'}</p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
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
                Save Changes
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function LeaveAssignmentPage() {
  const [assignments, setAssignments] = useState([])
  const [policies, setPolicies] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('all')
  const [assignOpen, setAssignOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [assignmentsData, policiesData] = await Promise.all([
        leaveService.getLeaveAssignments(),
        leaveService.getPolicies()
      ])
      setAssignments(Array.isArray(assignmentsData) ? assignmentsData : [])
      setPolicies(Array.isArray(policiesData) ? policiesData : [])
    } catch (err) {
      console.error('Failed to fetch data:', err)
      setError('Failed to load assignments. Please try again.')
      setAssignments([])
      setPolicies([])
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async (formData) => {
    setSaving(true)
    try {
      await leaveService.assignPolicyToEmployees({
        policy_id: formData.policyId,
        employee_ids: formData.employeeIds,
      })
      await fetchData() // Refresh the list
      setAssignOpen(false)
    } catch (err) {
      console.error('Failed to assign policy:', err)
      alert('Failed to assign policy. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (assignmentId) => {
    if (!assignmentId) {
      alert('Assignment id missing. Please refresh and try again.')
      return
    }
    if (!window.confirm('Are you sure you want to remove this assignment?')) return
    
    try {
      await leaveService.deleteLeaveAssignment(assignmentId)
      await fetchData() // Refresh the list
    } catch (err) {
      console.error('Failed to delete assignment:', err)
      alert('Failed to delete assignment. Please try again.')
    }
  }

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment)
    setEditOpen(true)
  }

  const handleUpdateAssignment = async (updateData) => {
    const assignmentId = editingAssignment?.id || editingAssignment?._id || editingAssignment?.assignment_id
    if (!assignmentId) {
      alert('Assignment id missing. Please refresh and try again.')
      return
    }

    setSaving(true)
    try {
      await leaveService.updateLeaveAssignment(assignmentId, updateData)
      await fetchData()
      setEditOpen(false)
      setEditingAssignment(null)
    } catch (err) {
      console.error('Failed to update assignment:', err)
      alert(err.response?.data?.detail || 'Failed to update assignment. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const filtered = assignments.filter(a => {
    const empName = a.employee_name || a.employee?.name || ''
    const dept = a.department || a.employee?.department || ''
    const policy = a.policy_name || a.policy?.name || ''
    
    if (search && !empName.toLowerCase().includes(search.toLowerCase()) && !policy.toLowerCase().includes(search.toLowerCase())) return false
    if (deptFilter !== 'all' && dept !== deptFilter) return false
    return true
  })

  const departments = [...new Set(assignments.map(a => a.department || a.employee?.department || 'Unknown').filter(Boolean))]
  const totalEmployees = new Set(assignments.map(a => a.employee_id)).size

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
            onClick={fetchData}
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
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Assignments', value: assignments.length, color: 'text-blue-700', bg: 'bg-blue-50' },
          { label: 'Departments', value: departments.length, color: 'text-violet-700', bg: 'bg-violet-50' },
          { label: 'Employees Covered', value: totalEmployees, color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Active Policies', value: new Set(assignments.map(a => a.policy_id)).size, color: 'text-amber-700', bg: 'bg-amber-50' },
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search assignments…"
              className="rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
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
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setAssignOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> Assign Policy
        </motion.button>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                {['Employee', 'Department', 'Leave Policy', 'Total Days', 'Used', 'Remaining', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center text-sm text-slate-400">
                    No assignments found
                  </td>
                </tr>
              ) : (
                filtered.map((a, i) => {
                  const empName = a.employee_name || a.employee?.name || 'Unknown'
                  const dept = a.department || a.employee?.department || 'N/A'
                  const policy = a.policy_name || a.policy?.name || 'Unknown'
                  const totalDays = a.total_days || 0
                  const usedDays = a.used_days || 0
                  const remainingDays = a.remaining_days || totalDays
                  const status = a.status || 'Active'
                  const assignmentId = a.id || a._id || a.assignment_id
                  
                  return (
                    <motion.tr
                      key={assignmentId}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-600" />
                          <span className="font-semibold text-slate-800">{empName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">{dept}</span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-700">{policy}</td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-slate-900">{totalDays}</td>
                      <td className="px-5 py-3.5 text-sm text-rose-600 font-medium">{usedDays}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-sm font-bold ${
                          remainingDays <= 2 ? 'text-amber-600' : remainingDays > 10 ? 'text-emerald-600' : 'text-slate-700'
                        }`}>
                          {remainingDays}
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
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => handleEdit(a)}
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(assignmentId)}
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
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

        {filtered.length > 0 && (
          <div className="border-t border-slate-100 px-5 py-3">
            <p className="text-xs text-slate-400">
              Showing <span className="font-semibold text-slate-600">{filtered.length}</span> assignments
            </p>
          </div>
        )}
      </motion.div>

      <AssignModal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        onSave={handleAssign}
        saving={saving}
        policies={policies}
      />
      <EditAssignmentModal
        open={editOpen}
        onClose={() => {
          setEditOpen(false)
          setEditingAssignment(null)
        }}
        onSave={handleUpdateAssignment}
        saving={saving}
        assignment={editingAssignment}
      />
    </div>
  )
}
