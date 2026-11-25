import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronDown, CalendarDays, CheckCircle, Info, AlertCircle, Upload, X } from 'lucide-react'
import { applyLeaveRequest, getLeaveBalances } from '../data/leaveData'
import { useAuth } from '../../../hooks/useAuth'



const REASONS_SUGGESTED = [
  'Medical appointment',
  'Personal work',
  'Family function / event',
  'Travel',
  'Worked on weekend / holiday (Comp Off)',
]

function FieldLabel({ children, required }) {
  return (
    <label className="mb-2 block text-sm font-semibold text-slate-700">
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  )
}

function SelectWrapper({ children }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
    </div>
  )
}

export default function ApplyLeavePage() {
  const { user } = useAuth()

  const [form, setForm] = useState({
    leaveType: '',       // will be set to first balance type once loaded
    from: '',
    to: '',
    halfDay: false,
    halfDaySlot: 'morning',
    reason: '',
    attachment: null,
  })
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState({})
  const [leaveBalances, setLeaveBalances] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [balanceError, setBalanceError] = useState(null)

  // Fetch leave balances on mount
  useEffect(() => {
    fetchLeaveBalances()
  }, [])

  const fetchLeaveBalances = async () => {
    try {
      setLoading(true)
      setBalanceError(null)
      const data = await getLeaveBalances()

      console.log('Fetched balances:', data)

      if (Array.isArray(data) && data.length > 0) {
        // Backend returns objects with: type (policy_name), total, used, remaining
        const transformed = data.map((b, idx) => ({
          id: b.id || b.assignment_id || `balance-${idx}`,
          // Use the full policy name as the type key (e.g. "Casual Leave")
          type: b.type || b.policy_name || b.leave_type || `Leave ${idx + 1}`,
          total: b.total ?? b.total_days ?? 0,
          used: b.used ?? b.used_days ?? 0,
          remaining: b.remaining ?? b.remaining_days ?? ((b.total ?? b.total_days ?? 0) - (b.used ?? b.used_days ?? 0)),
        }))
        setLeaveBalances(transformed)
        // Default select the first leave type
        setForm(f => ({ ...f, leaveType: transformed[0]?.type || '' }))
        setBalanceError(null)
      } else {
        setLeaveBalances([])
        setBalanceError('Leave balances not configured. Please contact HR to set up your leave balances.')
      }
    } catch (err) {
      console.error('Failed to fetch leave balances:', err)
      setLeaveBalances([])
      setBalanceError('Unable to fetch leave balances. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: undefined }))
  }

  // Calculate number of days
  const calcDays = () => {
    if (!form.from) return 0
    if (form.halfDay) return 0.5
    if (!form.to) return 1
    const d1 = new Date(form.from)
    const d2 = new Date(form.to)
    if (d2 < d1) return 0
    let count = 0
    const cur = new Date(d1)
    while (cur <= d2) {
      const day = cur.getDay()
      if (day !== 0 && day !== 6) count++
      cur.setDate(cur.getDate() + 1)
    }
    return count
  }

  // Find balance for selected type
  const myBalance = leaveBalances.find(b => b.type === form.leaveType)
  const days = calcDays()
  const exceedsBalance = myBalance && days > myBalance.remaining

  const validate = () => {
    const e = {}
    if (!form.from) e.from = 'Start date is required'
    if (!form.halfDay && !form.to) e.to = 'End date is required'
    if (!form.halfDay && form.to && form.from && new Date(form.to) < new Date(form.from)) e.to = 'End date must be after start date'
    if (!form.reason.trim()) e.reason = 'Reason is required'
    if (form.reason.trim().length < 10) e.reason = 'Reason must be at least 10 characters'
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    try {
      setSubmitting(true)

      // form.leaveType is now the full policy name (e.g. "Casual Leave")
      const payload = {
        leave_type: form.leaveType,
        start_date: form.from,
        end_date: form.to || form.from,
        reason: form.reason,
        attachment: form.attachment?.name || null,
      }

      await applyLeaveRequest(payload)
      setSubmitted(true)
    } catch (err) {
      setErrors({ submit: err.response?.data?.detail || err.message || 'Failed to apply leave. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  // form.leaveType is the full policy name string now
  const typeColor = 'blue'

  if (submitted) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          className="max-w-md w-full rounded-3xl bg-white p-10 text-center shadow-xl border border-slate-100"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 400, damping: 20 }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100"
          >
            <CheckCircle className="h-10 w-10 text-emerald-500" />
          </motion.div>
          <h2 className="mb-2 text-2xl font-bold text-slate-900">Leave Applied!</h2>
          <p className="mb-1 text-slate-500">Your leave request for</p>
          <p className="mb-1 text-lg font-semibold text-slate-800">{form.leaveType}</p>
          <p className="mb-6 text-slate-500">
            {form.halfDay ? `${form.from} (${form.halfDaySlot === 'morning' ? 'Morning' : 'Afternoon'} half)` : `${form.from} → ${form.to}`}
            {' '}· <span className="font-semibold">{days} day{days !== 1 ? 's' : ''}</span>
          </p>
          <p className="mb-8 rounded-xl bg-amber-50 px-4 py-2.5 text-sm text-amber-700">
            Awaiting manager approval
          </p>
          <button
            onClick={() => { setSubmitted(false); setForm(f => ({ ...f, from: '', to: '', halfDay: false, halfDaySlot: 'morning', reason: '', attachment: null })) }}
            className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Apply Another Leave
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="h-full bg-slate-50 p-6">
      <div className="mx-auto max-w-x8l space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Apply for Leave</h1>
            <p className="text-sm text-slate-500">Fill in the details and submit for approval</p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={!form.from || !form.reason.trim() || submitting}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Applying...' : 'Apply Leave'}
          </button>
        </div>

        {/* ── Form Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-slate-200 bg-white shadow-sm"
        >

          <div className="space-y-5 p-6">

            {/* Leave Type */}
            <div>
              <FieldLabel required>Leave Type</FieldLabel>
              {/* Dynamically populated from fetched leave balances */}
              <SelectWrapper>
                <select
                  value={form.leaveType}
                  onChange={e => set('leaveType', e.target.value)}
                  disabled={loading || leaveBalances.length === 0}
                  className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                >
                  {leaveBalances.length === 0
                    ? <option value="">No leave types assigned</option>
                    : leaveBalances.map(b => <option key={b.id} value={b.type}>{b.type}</option>)
                  }
                </select>
              </SelectWrapper>

              {/* Balance chip */}
              {!loading && myBalance && (
                <motion.div
                  key={form.leaveType}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 flex items-center gap-2"
                >
                  <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-xs text-slate-500">
                    Balance: <span className="font-semibold text-slate-700">{myBalance.remaining} days remaining</span>
                    {' '}(Used {myBalance.used} of {myBalance.total})
                  </span>
                </motion.div>
              )}
            </div>

            {/* Half Day Toggle */}
            <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <CalendarDays className="h-5 w-5 text-slate-600" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">Half Day Leave</p>
                <p className="text-xs text-slate-500">Apply for morning or afternoon only</p>
              </div>
              <button
                onClick={() => set('halfDay', !form.halfDay)}
                className={`relative h-6 w-11 rounded-full transition-colors ${form.halfDay ? 'bg-blue-600' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${form.halfDay ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>

            {/* Half day slot selector */}
            <AnimatePresence>
              {form.halfDay && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <FieldLabel>Half Day Slot</FieldLabel>
                  <div className="flex gap-3">
                    {['morning', 'afternoon'].map(slot => (
                      <button
                        key={slot}
                        onClick={() => set('halfDaySlot', slot)}
                        className={`flex-1 rounded-xl border py-2.5 text-sm font-semibold capitalize transition ${
                          form.halfDaySlot === slot
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Date fields */}
            <div className={`grid gap-4 ${form.halfDay ? 'grid-cols-1' : 'grid-cols-2'}`}>
              <div>
                <FieldLabel required>From Date</FieldLabel>
                <input
                  type="date"
                  value={form.from}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => set('from', e.target.value)}
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:ring-2 focus:ring-blue-100 ${
                    errors.from ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white focus:border-blue-500'
                  }`}
                />
                {errors.from && <p className="mt-1 text-xs text-red-500">{errors.from}</p>}
              </div>

              {!form.halfDay && (
                <div>
                  <FieldLabel required>To Date</FieldLabel>
                  <input
                    type="date"
                    value={form.to}
                    min={form.from || new Date().toISOString().split('T')[0]}
                    onChange={e => set('to', e.target.value)}
                    className={`w-full rounded-lg border px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:ring-2 focus:ring-blue-100 ${
                      errors.to ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white focus:border-blue-500'
                    }`}
                  />
                  {errors.to && <p className="mt-1 text-xs text-red-500">{errors.to}</p>}
                </div>
              )}
            </div>

            {/* Day count preview */}
            <AnimatePresence>
              {days > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${
                    exceedsBalance
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}
                >
                  {exceedsBalance ? <AlertCircle className="h-4 w-4" /> : <Info className="h-4 w-4" />}
                  {exceedsBalance
                    ? `Exceeds balance! You only have ${myBalance.remaining} day(s) left.`
                    : `This request covers ${days} working day${days !== 1 ? 's' : ''}.`
                  }
                </motion.div>
              )}
            </AnimatePresence>

            {/* Reason */}
            <div>
              <FieldLabel required>Reason</FieldLabel>
              <textarea
                value={form.reason}
                onChange={e => set('reason', e.target.value)}
                rows={4}
                placeholder="Briefly describe the reason for your leave…"
                className={`w-full resize-none rounded-lg border px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:ring-2 focus:ring-blue-100 ${
                  errors.reason ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white focus:border-blue-500'
                }`}
              />
              {errors.reason && <p className="mt-1 text-xs text-red-500">{errors.reason}</p>}

              {/* Suggested reasons */}
              <div className="mt-2 flex flex-wrap gap-2">
                {REASONS_SUGGESTED.map(r => (
                  <button
                    key={r}
                    onClick={() => set('reason', r)}
                    className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Attachment */}
            <div>
              <FieldLabel>Attachment</FieldLabel>
              <div className="flex items-center gap-3">
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50">
                  <Upload className="h-4 w-4" />
                  <span>Choose File</span>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        set('attachment', file)
                      }
                    }}
                  />
                </label>
                {form.attachment ? (
                  <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5">
                    <span className="text-xs text-blue-700 font-medium">{form.attachment.name}</span>
                    <button
                      onClick={() => set('attachment', null)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-slate-500">No file chosen</span>
                )}
              </div>
            </div>

            {/* Error Message */}
            {errors.submit && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-red-700 bg-red-50 border border-red-200"
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {errors.submit}
              </motion.div>
            )}

          </div>
        </motion.div>

        {/* ── Balance Summary ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-3">
            <h3 className="text-sm font-bold text-slate-800">Your Leave Balance</h3>
            {!loading && (
              <button
                onClick={fetchLeaveBalances}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
              >
                Refresh
              </button>
            )}
          </div>
          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="px-6 py-8 text-center text-slate-500">
                <div className="h-4 w-24 bg-slate-100 rounded animate-pulse mx-auto" />
              </div>
            ) : balanceError ? (
              <div className="px-6 py-8 text-center">
                <div className="mb-3 text-sm text-slate-600">{balanceError}</div>
                <button
                  onClick={fetchLeaveBalances}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
                >
                  Try Again
                </button>
              </div>
            ) : leaveBalances.length === 0 ? (
              <div className="px-6 py-8 text-center text-slate-500">
                No leave balance data available
              </div>
            ) : (
              leaveBalances.map(b => (
                <div key={b.id || b.type} className="flex items-center justify-between px-6 py-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
                    {/* type is now the full policy name e.g. "Casual Leave" */}
                    <span className="text-sm font-medium text-slate-700">{b.type}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-slate-400">Used <span className="font-semibold text-slate-600">{b.used}</span></span>
                    <span className="text-xs text-slate-400">Remaining <span className={`font-bold ${b.remaining <= 2 ? 'text-amber-600' : 'text-emerald-600'}`}>{b.remaining}</span></span>
                    {/* Mini bar */}
                    <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all"
                        style={{ width: b.total > 0 ? `${Math.min(100, (b.used / b.total) * 100)}%` : '0%' }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

      </div>
    </div>
  )
}
