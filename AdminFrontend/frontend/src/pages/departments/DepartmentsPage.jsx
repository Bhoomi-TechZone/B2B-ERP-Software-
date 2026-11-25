import { useState, useEffect, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Building2, Plus, Search, MoreVertical, Edit2, Trash2, Users,
  X, AlertCircle, Loader2, RefreshCw, TrendingUp, Briefcase,
} from 'lucide-react'
import departmentService from '../../services/departmentService'

// ─── Add/Edit Department Modal ────────────────────────────────────────────
const DepartmentModal = memo(({ isOpen, onClose, onSuccess, editDepartment }) => {
  const [form, setForm] = useState({
    name: '',
    parentId: '',
    headId: '',
    costCenterCode: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (editDepartment) {
      setForm({
        name: editDepartment.name || '',
        parentId: editDepartment.parent_id || '',
        headId: editDepartment.head_id || '',
        costCenterCode: editDepartment.cost_center_code || '',
      })
    } else {
      setForm({ name: '', parentId: '', headId: '', costCenterCode: '' })
    }
  }, [editDepartment])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('Department name is required')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const payload = {
        name: form.name.trim(),
        parent_id: form.parentId || null,
        head_id: form.headId || null,
        cost_center_code: form.costCenterCode.trim() || null,
      }

      if (editDepartment) {
        await departmentService.updateDepartment(editDepartment.id, payload)
      } else {
        await departmentService.createDepartment(payload)
      }

      onSuccess()
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to save department')
    } finally {
      setIsSubmitting(false)
    }
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
        <motion.form
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          onSubmit={handleSubmit}
          className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editDepartment ? 'Edit Department' : 'Add New Department'}
                </h3>
                <p className="text-sm text-slate-500">
                  {editDepartment ? 'Update department details' : 'Create a new department'}
                </p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100">
              <X className="h-5 w-5 text-slate-600" />
            </button>
          </div>

          {/* Form */}
          <div className="p-6 space-y-4">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 flex items-center gap-2 text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Department Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Engineering, Marketing, Sales"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Cost Center Code
              </label>
              <input
                type="text"
                value={form.costCenterCode}
                onChange={(e) => setForm({ ...form, costCenterCode: e.target.value })}
                placeholder="e.g., CC-ENG-001"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
              <p className="text-xs text-blue-800">
                <strong>Note:</strong> Parent department and department head can be assigned after creation from the department list.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  {editDepartment ? 'Update' : 'Create'} Department
                </>
              )}
            </button>
          </div>
        </motion.form>
      </motion.div>
    </AnimatePresence>
  )
})
DepartmentModal.displayName = 'DepartmentModal'

// ─── Action Menu ──────────────────────────────────────────────────────────
const ActionMenu = memo(({ department, onEdit, onDelete }) => {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(p => !p)}
        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
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
              className="absolute right-0 z-20 mt-1 w-48 rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
            >
              <button
                onClick={() => {
                  onEdit(department)
                  setOpen(false)
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Edit2 className="h-4 w-4 text-blue-500" /> Edit Department
              </button>
              <div className="my-1 border-t border-slate-100" />
              <button
                onClick={() => {
                  onDelete(department)
                  setOpen(false)
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
})
ActionMenu.displayName = 'ActionMenu'

// ─── Main Component ───────────────────────────────────────────────────────
const DepartmentsPage = memo(() => {
  const [departments, setDepartments] = useState([])
  const [filteredDepartments, setFilteredDepartments] = useState([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editDepartment, setEditDepartment] = useState(null)

  const fetchDepartments = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await departmentService.getDepartments()
      const list = Array.isArray(data) ? data : (data?.departments || data?.data || [])
      setDepartments(list)
      setFilteredDepartments(list)
    } catch (err) {
      setError(err.message || 'Failed to load departments')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDepartments()
  }, [fetchDepartments])

  useEffect(() => {
    if (!search) {
      setFilteredDepartments(departments)
    } else {
      const q = search.toLowerCase()
      setFilteredDepartments(
        departments.filter(d =>
          d.name?.toLowerCase().includes(q) ||
          d.cost_center_code?.toLowerCase().includes(q)
        )
      )
    }
  }, [search, departments])

  const handleEdit = (dept) => {
    setEditDepartment(dept)
    setShowModal(true)
  }

  const handleDelete = async (dept) => {
    if (!confirm(`Are you sure you want to delete "${dept.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      await departmentService.deleteDepartment(dept.id)
      fetchDepartments()
    } catch (err) {
      alert(err.message || 'Failed to delete department')
    }
  }

  const handleModalClose = () => {
    setShowModal(false)
    setEditDepartment(null)
  }

  const stats = {
    total: departments.length,
    active: departments.filter(d => d.is_active !== false).length,
  }

  return (
    <div className="min-h-full bg-[#F7F8FA] p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Departments</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Manage organizational departments and structure
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> Add Department
          </button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total Departments', value: stats.total, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Active', value: stats.active, icon: Briefcase, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Employees', value: '—', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Growth', value: '+12%', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                <div className="text-sm font-medium text-slate-600">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Search */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search departments by name or cost center..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
            <button
              onClick={fetchDepartments}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center gap-3 text-red-600">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Table */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Department Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Cost Center
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Employees
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Head
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
                    </td>
                  </tr>
                ) : filteredDepartments.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-sm text-slate-500">
                      {search ? 'No departments found matching your search' : 'No departments yet. Create your first department!'}
                    </td>
                  </tr>
                ) : (
                  filteredDepartments.map((dept) => (
                    <motion.tr
                      key={dept.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{dept.name}</p>
                            <p className="text-xs text-slate-500">ID: {dept.id?.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                          {dept.cost_center_code || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {dept.employee_count || 0}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {dept.head_name || '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <ActionMenu
                          department={dept}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      <DepartmentModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSuccess={fetchDepartments}
        editDepartment={editDepartment}
      />
    </div>
  )
})

DepartmentsPage.displayName = 'DepartmentsPage'
export default DepartmentsPage
