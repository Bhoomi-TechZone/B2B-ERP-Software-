import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Plus, Minus } from 'lucide-react'
import leaveService from '../../../services/leaveService'

export default function LeaveAdjustmentModal({ isOpen, onClose, employee, type = 'add', onSuccess }) {
  const [formData, setFormData] = useState({
    days: '',
    reason: '',
    effective_date: new Date().toISOString().split('T')[0],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const isAdd = type === 'add'
  const title = isAdd ? 'Add Leave Balance' : 'Deduct Leave Balance'
  const buttonText = isAdd ? 'Add Leave' : 'Deduct Leave'
  const Icon = isAdd ? Plus : Minus
  const employeeName = employee?.empName || employee?.employee_name || 'Employee'
  const employeeId = employee?.employee_id || employee?.empId
  const assignmentId = employee?.assignment_id || employee?._id || employee?.id
  const leaveType = employee?.leave_type || employee?.policy_name || employee?.type || 'Leave'
  const totalDays = employee?.total_days ?? employee?.total ?? employee?.entitled ?? 0
  const usedDays = employee?.used_days ?? employee?.used ?? 0
  const currentBalance = employee?.remaining_days ?? employee?.balance ?? employee?.remaining ?? 0

  useEffect(() => {
    if (isOpen) {
      setFormData({
        days: '',
        reason: '',
        effective_date: new Date().toISOString().split('T')[0],
      })
      setError(null)
      setSuccess(false)
    }
  }, [isOpen, type, assignmentId])

  if (!isOpen || !employee) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.days || !formData.reason || !formData.effective_date) {
      setError('All fields are required')
      return
    }

    const days = Number(formData.days)
    if (!Number.isFinite(days) || days <= 0) {
      setError('Please enter a valid number of days')
      return
    }

    if (!employeeId) {
      setError('Employee id missing. Please refresh and try again.')
      return
    }

    if (!assignmentId) {
      setError('Assignment id missing. Please refresh and try again.')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const payload = {
        assignment_id: assignmentId,
        employee_id: employeeId,
        days,
        reason: formData.reason,
        effective_date: formData.effective_date,
      }

      if (isAdd) {
        await leaveService.addLeaveBalance(payload)
      } else {
        await leaveService.deductLeaveBalance(payload)
      }

      setSuccess(true)
      setTimeout(() => {
        setFormData({ days: '', reason: '', effective_date: new Date().toISOString().split('T')[0] })
        setSuccess(false)
        onClose()
        if (onSuccess) onSuccess()
      }, 900)
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to process leave adjustment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-50 flex max-h-[88vh] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className={`flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-4 ${isAdd ? 'bg-emerald-50' : 'bg-rose-50'}`}>
              <div className="flex min-w-0 items-center gap-3">
                <div className={`shrink-0 rounded-xl p-2.5 ${isAdd ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                  <Icon className={`h-5 w-5 ${isAdd ? 'text-emerald-600' : 'text-rose-600'}`} />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold text-slate-900">{title}</h2>
                  <p className="truncate text-xs font-medium text-slate-500">{leaveType}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/70 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Employee</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{employeeName}</p>
                  <p className="mt-0.5 break-all text-xs text-slate-500">{employeeId}</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-blue-50 p-3">
                    <p className="text-[11px] font-semibold uppercase text-blue-600">Current</p>
                    <p className="mt-1 text-xl font-bold text-blue-700">{currentBalance}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[11px] font-semibold uppercase text-slate-500">Total</p>
                    <p className="mt-1 text-xl font-bold text-slate-800">{totalDays}</p>
                  </div>
                  <div className="rounded-xl bg-rose-50 p-3">
                    <p className="text-[11px] font-semibold uppercase text-rose-600">Used</p>
                    <p className="mt-1 text-xl font-bold text-rose-700">{usedDays}</p>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Number of Days <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="days"
                    value={formData.days}
                    onChange={handleChange}
                    placeholder="Enter number of days"
                    min="0.5"
                    step="0.5"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    placeholder="Enter reason for this adjustment..."
                    rows="3"
                    className="max-h-28 min-h-24 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Effective Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="effective_date"
                    value={formData.effective_date}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-red-200 bg-red-50 p-3"
                  >
                    <p className="text-sm text-red-700">{error}</p>
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-emerald-200 bg-emerald-50 p-3"
                  >
                    <p className="text-sm text-emerald-700">{buttonText} successful.</p>
                  </motion.div>
                )}
              </div>

              <div className="flex shrink-0 gap-3 border-t border-slate-100 bg-white px-6 py-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 font-medium text-white transition disabled:opacity-50 ${
                    isAdd
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Icon className="h-4 w-4" />
                      {buttonText}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
