import { useState, useEffect, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, DoorOpen, Plus, X, Check, ChevronDown,
  Clock, CheckCircle2, AlertTriangle, User, RefreshCw,
} from 'lucide-react'
import { exitEmployees, employees as fallbackEmployees } from './data/employeeData'
import exitService from '../../services/exitService'
import employeeService from '../../services/employeeService'

// ─── Status Badge ─────────────────────────────────────────────────────────────
const ExitStatusBadge = memo(({ status }) => {
  const map = {
    Completed: 'bg-green-100 text-green-700',
    'Notice Period': 'bg-amber-100 text-amber-700',
    Initiated: 'bg-blue-100 text-blue-700',
  }
  const icons = {
    Completed: CheckCircle2,
    'Notice Period': Clock,
    Initiated: AlertTriangle,
  }
  const Icon = icons[status] || AlertTriangle
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${map[status] || 'bg-slate-100 text-slate-600'}`}>
      <Icon className="h-3 w-3" /> {status}
    </span>
  )
})
ExitStatusBadge.displayName = 'ExitStatusBadge'

// ─── Checklist Item ───────────────────────────────────────────────────────────
const ChecklistItem = memo(({ label, done, onToggle, disabled = false }) => (
  <button
    type="button"
    onClick={onToggle}
    disabled={disabled}
    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition text-left w-full cursor-pointer ${
      done
        ? 'bg-green-50 text-green-700 hover:bg-green-100'
        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
    } ${disabled ? 'opacity-75 cursor-default' : ''}`}
  >
    {done
      ? <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
      : <div className="h-4 w-4 shrink-0 rounded-full border-2 border-slate-300" />
    }
    <span className="font-medium text-xs sm:text-sm">{label}</span>
    {!disabled && (
      <span className="ml-auto text-[10px] text-slate-400">
        {done ? 'Done' : 'Click to mark'}
      </span>
    )}
  </button>
))
ChecklistItem.displayName = 'ChecklistItem'

// ─── Initiate Exit Modal ──────────────────────────────────────────────────────
const InitiateExitModal = memo(({ onClose, onSubmit, availableEmployees = [] }) => {
  const [empId, setEmpId] = useState('')
  const [reason, setReason] = useState('')
  const [notice, setNotice] = useState('30')
  const [exitDate, setExitDate] = useState('')

  const activeEmployees = availableEmployees.length > 0
    ? availableEmployees
    : fallbackEmployees.filter(e => e.status === 'Active' || e.status === 'Probation')

  const handleSubmit = useCallback(() => {
    if (!empId || !reason || !exitDate) return
    onSubmit({ empId, reason, notice, exitDate })
  }, [empId, reason, notice, exitDate, onSubmit])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.2 }}
        className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DoorOpen className="h-5 w-5 text-rose-500" />
            <h3 className="text-lg font-bold text-slate-900">Initiate Exit Process</h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Select Employee <span className="text-red-500">*</span></label>
            <div className="relative">
              <select value={empId} onChange={e => setEmpId(e.target.value)} className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                <option value="">— Choose employee —</option>
                {activeEmployees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.fullName} · {emp.department}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Reason for Exit <span className="text-red-500">*</span></label>
            <select value={reason} onChange={e => setReason(e.target.value)} className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
              <option value="">— Select reason —</option>
              <option>Resignation — Personal</option>
              <option>Resignation — Better opportunity</option>
              <option>Resignation — Relocation</option>
              <option>Termination — Performance</option>
              <option>Termination — Misconduct</option>
              <option>Contract End</option>
              <option>Retirement</option>
              <option>Mutual Separation</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Notice Period</label>
              <select value={notice} onChange={e => setNotice(e.target.value)} className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500">
                <option value="0">Immediate (0 days)</option>
                <option value="15">15 days</option>
                <option value="30">30 days</option>
                <option value="45">45 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Last Working Day <span className="text-red-500">*</span></label>
              <input type="date" value={exitDate} onChange={e => setExitDate(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500" />
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            <strong>Note:</strong> This will trigger the exit workflow — manager notification, asset return request, and FnF initiation.
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={!empId || !reason || !exitDate}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-600 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Check className="h-4 w-4" /> Confirm Exit
          </button>
        </div>
      </motion.div>
    </div>
  )
})
InitiateExitModal.displayName = 'InitiateExitModal'

// ─── Main Component ───────────────────────────────────────────────────────────
const ExitManagementPage = memo(() => {
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [exitList, setExitList] = useState([])
  const [employeesList, setEmployeesList] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [exits, empsData] = await Promise.all([
        exitService.getExitRequests().catch(() => exitEmployees),
        employeeService.getEmployees(1, 100).catch(() => ({ employees: [] })),
      ])

      setExitList(Array.isArray(exits) && exits.length > 0 ? exits : exitEmployees)

      const rawEmps = empsData?.employees || []
      const mapped = rawEmps.map(e => ({
        id: e.id || e._id,
        fullName: e.full_name || `${e.first_name || ''} ${e.last_name || ''}`.trim() || e.email,
        department: e.department_name || e.department || 'General',
        role: e.job_title_name || e.role || 'Employee',
        avatar: (e.first_name?.[0] || 'E') + (e.last_name?.[0] || ''),
        status: e.status || 'Active',
      }))
      setEmployeesList(mapped.length > 0 ? mapped : fallbackEmployees)
    } catch (err) {
      console.error('Failed to load exits:', err)
      setExitList(exitEmployees)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSubmit = useCallback(async ({ empId, reason, notice, exitDate }) => {
    const emp = employeesList.find(e => e.id === empId) || fallbackEmployees.find(e => e.id === empId)
    if (!emp) return
    try {
      const created = await exitService.createExitRequest({
        employee_id: empId,
        name: emp.fullName,
        department: emp.department,
        role: emp.role,
        avatar: emp.avatar,
        exit_date: exitDate,
        notice_period: `${notice} days`,
        reason,
        initiated_by: 'HR Admin',
      })
      setExitList(p => [created, ...p])
      setShowModal(false)
    } catch (err) {
      console.error('Failed to create exit request:', err)
      // Optimistic fallback
      const newEntry = {
        id: `EXIT${Date.now()}`,
        employeeId: empId,
        name: emp.fullName,
        department: emp.department,
        role: emp.role,
        avatar: emp.avatar,
        avatarColor: 'bg-teal-600',
        exitDate,
        noticePeriod: `${notice} days`,
        reason,
        status: 'Notice Period',
        initiatedBy: 'HR Admin',
        initiatedOn: new Date().toISOString().slice(0, 10),
        assetsReturned: false,
        fnfProcessed: false,
        accessRevoked: false,
      }
      setExitList(p => [newEntry, ...p])
      setShowModal(false)
    }
  }, [employeesList])

  const handleToggleChecklist = useCallback(async (exitId, field) => {
    const item = exitList.find(e => e.id === exitId || e.exitId === exitId)
    if (!item) return
    const newVal = !item[field]
    const updatedStatus = (
      (field === 'assetsReturned' ? newVal : item.assetsReturned) &&
      (field === 'fnfProcessed' ? newVal : item.fnfProcessed) &&
      (field === 'accessRevoked' ? newVal : item.accessRevoked)
    ) ? 'Completed' : item.status

    setExitList(prev => prev.map(e =>
      (e.id === exitId || e.exitId === exitId) ? { ...e, [field]: newVal, status: updatedStatus } : e
    ))

    try {
      const fieldMap = {
        assetsReturned: 'assets_returned',
        fnfProcessed: 'fnf_processed',
        accessRevoked: 'access_revoked',
      }
      await exitService.updateExitRequest(item.id || item.exitId, { [fieldMap[field]]: newVal })
    } catch (err) {
      console.error('Failed to update checklist item:', err)
    }
  }, [exitList])

  const stats = {
    total: exitList.length,
    notice: exitList.filter(e => e.status === 'Notice Period').length,
    completed: exitList.filter(e => e.status === 'Completed').length,
  }

  return (
    <div className="min-h-full bg-[#F7F8FA] p-6">
      <div className="mx-auto max-w-300 space-y-6">

        {/* Header */}
        <button onClick={() => navigate('/employees')} className="flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-800">
          <ArrowLeft className="h-4 w-4" /> Back to Employees
        </button>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Exit Management</h2>
            <p className="mt-0.5 text-sm text-slate-500">Manage employee separations and offboarding workflows</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              title="Refresh"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 active:scale-95"
            >
              <Plus className="h-4 w-4" /> Initiate Exit
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Exits', value: stats.total, icon: DoorOpen, color: 'text-rose-600', bg: 'bg-rose-50' },
            { label: 'In Notice Period', value: stats.notice, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
          ].map(s => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${s.bg}`}><s.icon className={`h-5 w-5 ${s.color}`} /></div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{s.value}</div>
                <div className="text-sm text-slate-500">{s.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-200">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  {['Employee', 'Department', 'Reason', 'Last Working Day', 'Notice Period', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {exitList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center">
                      <div className="mx-auto flex max-w-xs flex-col items-center gap-3">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                          <DoorOpen className="h-8 w-8 text-slate-300" />
                        </div>
                        <p className="font-semibold text-slate-600">No active exits</p>
                        <p className="text-sm text-slate-400">Use "Initiate Exit" to start an offboarding process</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  exitList.map(exit => (
                    <tr key={exit.id || exit.exitId} className="group transition hover:bg-slate-50">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${exit.avatarColor || 'bg-teal-600'}`}>{exit.avatar}</div>
                          <div>
                            <div className="font-semibold text-slate-900">{exit.name}</div>
                            <div className="text-xs text-slate-400">{exit.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">{exit.department}</span>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-600">{exit.reason}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-700 font-medium">{exit.exitDate}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-600">{exit.noticePeriod}</td>
                      <td className="px-4 py-3.5"><ExitStatusBadge status={exit.status} /></td>
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => setExpandedId(expandedId === (exit.id || exit.exitId) ? null : (exit.id || exit.exitId))}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                          {expandedId === (exit.id || exit.exitId) ? 'Hide' : 'Checklist'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expandable Checklist Section if an item is selected */}
        {expandedId && (() => {
          const selectedExit = exitList.find(e => (e.id || e.exitId) === expandedId)
          if (!selectedExit) return null
          return (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="font-bold text-slate-900">Offboarding Checklist — {selectedExit.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Click any pending requirement to mark it as completed in real time</p>
                </div>
                <button
                  onClick={() => setExpandedId(null)}
                  className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <ChecklistItem
                  label="Assets Returned"
                  done={selectedExit.assetsReturned}
                  onToggle={() => handleToggleChecklist(selectedExit.id || selectedExit.exitId, 'assetsReturned')}
                />
                <ChecklistItem
                  label="FnF Processed"
                  done={selectedExit.fnfProcessed}
                  onToggle={() => handleToggleChecklist(selectedExit.id || selectedExit.exitId, 'fnfProcessed')}
                />
                <ChecklistItem
                  label="System Access Revoked"
                  done={selectedExit.accessRevoked}
                  onToggle={() => handleToggleChecklist(selectedExit.id || selectedExit.exitId, 'accessRevoked')}
                />
                <ChecklistItem
                  label="Exit Interview Done"
                  done={selectedExit.status === 'Completed'}
                  disabled={true}
                />
                <ChecklistItem
                  label="Manager Sign-off"
                  done={selectedExit.status === 'Completed'}
                  disabled={true}
                />
                <ChecklistItem
                  label="NOC Issued"
                  done={selectedExit.status === 'Completed'}
                  disabled={true}
                />
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" /> Initiated by <span className="font-medium text-slate-600">{selectedExit.initiatedBy}</span> on {selectedExit.initiatedOn}
                </div>
                <div>
                  Status: <span className="font-semibold text-slate-700">{selectedExit.status}</span>
                </div>
              </div>
            </motion.div>
          )
        })()}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <InitiateExitModal
            availableEmployees={employeesList}
            onClose={() => setShowModal(false)}
            onSubmit={handleSubmit}
          />
        )}
      </AnimatePresence>
    </div>
  )
})

ExitManagementPage.displayName = 'ExitManagementPage'
export default ExitManagementPage
