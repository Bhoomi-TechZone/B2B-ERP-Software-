import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Plus, Calendar, Clock, Upload, User, ChevronDown,
  Check, X, AlertCircle, ClipboardList, FileText, Eye, Edit, MoreVertical, RotateCcw, History
} from 'lucide-react'
import StatusBadge from './components/StatusBadge'
import SkeletonRow from './components/SkeletonRow'
import { useRole, getCurrentUser } from '../../hooks/useRole'
import { useAuth } from '../../hooks/useAuth'
import attendanceService from '../../services/attendanceService'

const REASONS = [
  'Forgot to punch',
  'Device not working',
  'WFH not marked',
  'Travelled / Field work',
  'Power outage / System failure',
  'Other',
]
const REQUEST_TYPES = ['All', 'Regularisation', 'Late Mark Removal', 'Overtime Claim']

/* ── Action Dropdown Menu ─────────────────────────────────────────── */
function ActionDropdown({ request, onView, onApprove, onReject, onReconsider, onEdit, canManage, confirming, onConfirm, actionLoading }) {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const actions = []

  // Actions based on status
  if (request.status === 'Pending' && canManage) {
    actions.push(
      { icon: Eye, label: 'View Details', action: 'view', color: 'text-blue-600 hover:bg-blue-50' },
      { icon: Check, label: 'Approve', action: 'approve', color: 'text-emerald-600 hover:bg-emerald-50' },
      { icon: X, label: 'Reject', action: 'reject', color: 'text-rose-600 hover:bg-rose-50' },
    )
  } else if (request.status === 'Approved') {
    actions.push(
      { icon: Eye, label: 'View Details', action: 'view', color: 'text-blue-600 hover:bg-blue-50' },
      { icon: Edit, label: 'Edit', action: 'edit', color: 'text-indigo-600 hover:bg-indigo-50' },
      { icon: History, label: 'Audit Log', action: 'audit', color: 'text-purple-600 hover:bg-purple-50' },
    )
  } else if (request.status === 'Rejected') {
    actions.push(
      { icon: Eye, label: 'View Details', action: 'view', color: 'text-blue-600 hover:bg-blue-50' },
      { icon: RotateCcw, label: 'Reconsider', action: 'reconsider', color: 'text-amber-600 hover:bg-amber-50' },
    )
  } else {
    actions.push({ icon: Eye, label: 'View Details', action: 'view', color: 'text-blue-600 hover:bg-blue-50' })
  }

  const handleAction = (action) => {
    switch (action) {
      case 'view': onView(request); break
      case 'approve': onApprove(request.id); break
      case 'reject': onReject(request.id); break
      case 'reconsider': onReconsider(request.id); break
      case 'edit': onEdit(request.id); break
      default: break
    }
    setOpen(false)
  }

  if (request.status === 'Pending' && confirming?.id === request.id && canManage) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 whitespace-nowrap">
          {confirming.action === 'approve' ? 'Confirm approve?' : 'Confirm reject?'}
        </span>
        <button disabled={actionLoading} onClick={() => onConfirm(confirming.action)}
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200 disabled:opacity-50">
          <Check className="h-3.5 w-3.5" />
        </button>
        <button disabled={actionLoading} onClick={() => confirming = null}
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-400 hover:bg-slate-200 disabled:opacity-50">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button 
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
      >
        <MoreVertical className="h-4 w-4" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-slate-200 bg-white shadow-xl z-50"
          >
            <div className="py-1">
              {actions.map((act, idx) => {
                const Icon = act.icon
                return (
                  <button
                    key={idx}
                    onClick={() => handleAction(act.action)}
                    disabled={actionLoading}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all ${act.color} disabled:opacity-50 disabled:cursor-not-allowed ${idx < actions.length - 1 ? 'border-b border-slate-100' : ''}`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{act.label}</span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── View Details Modal ────────────────────────────────────────────── */
function ViewDetailsModal({ open, onClose, request, canManage, onApprove, onReject, actionLoading }) {
  const [confirming, setConfirming] = useState(null)

  if (!request) return null

  const formatDate = (dateString) => {
    if (!dateString) return '—'
    try {
      return new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    } catch {
      return '—'
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="fixed inset-x-4 top-1/2 z-50 max-w-2xl mx-auto -translate-y-1/2 rounded-3xl bg-white shadow-2xl border border-slate-200 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 sticky top-0 bg-white px-6 py-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Request Details</h3>
                <p className="text-xs text-slate-500">ID: {request.id || '—'}</p>
              </div>
              <button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Status */}
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Status</label>
                <div className="mt-2">
                  <StatusBadge status={request.status || 'Pending'} />
                </div>
              </div>

              {/* Employee Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1">Employee</label>
                  <p className="text-sm font-medium text-slate-900">{request.employee || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1">Department</label>
                  <p className="text-sm font-medium text-slate-900">{request.department || '—'}</p>
                </div>
              </div>

              {/* Date & Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1">Date</label>
                  <p className="text-sm font-medium text-slate-900">{formatDate(request.date)}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1">Type</label>
                  <span className="inline-block rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">{request.type || '—'}</span>
                </div>
              </div>

              {/* Times */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1">Requested Check-In</label>
                  <p className="text-sm font-mono text-slate-900">{request.requestedIn || request.correct_check_in || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1">Requested Check-Out</label>
                  <p className="text-sm font-mono text-slate-900">{request.requestedOut || request.correct_check_out || '—'}</p>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1">Reason</label>
                <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3">{request.reason || '—'}</p>
              </div>

              {/* Notes */}
              {request.notes && (
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1">Notes</label>
                  <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3">{request.notes}</p>
                </div>
              )}

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Requested On</label>
                  <p className="text-xs text-slate-600">{formatDate(request.createdAt)}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Updated On</label>
                  <p className="text-xs text-slate-600">{formatDate(request.updatedAt)}</p>
                </div>
              </div>
            </div>

            {/* Action buttons for pending requests */}
            {request.status === 'Pending' && canManage && (
              <div className="flex gap-3 border-t border-slate-100 px-6 py-4 sticky bottom-0 bg-white">
                {confirming ? (
                  <>
                    <p className="flex-1 text-sm font-medium text-slate-600">
                      {confirming === 'approve' ? 'Confirm approval?' : 'Confirm rejection?'}
                    </p>
                    <button 
                      disabled={actionLoading}
                      onClick={() => {
                        if (confirming === 'approve') onApprove(request.id)
                        else onReject(request.id)
                        onClose()
                      }}
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      <Check className="h-4 w-4 inline mr-2" />
                      Confirm
                    </button>
                    <button 
                      onClick={() => setConfirming(null)}
                      className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      disabled={actionLoading}
                      onClick={() => setConfirming('approve')}
                      className="flex-1 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Check className="h-4 w-4" />
                      Approve
                    </button>
                    <button 
                      disabled={actionLoading}
                      onClick={() => setConfirming('reject')}
                      className="flex-1 rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </button>
                  </>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/* ── Regularisation Modal (Section 24) ──────────────────────────── */
function RegularisationModal({ open, onClose, onSubmit }) {
  const { user } = useAuth()
  const legacyUser = getCurrentUser()
  const currentUserName = user?.name || legacyUser?.name || 'Rajesh Mehta'

  const [form, setForm] = useState({
    date: '', reason: '', checkIn: '', checkOut: '', note: '', file: null,
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.date) e.date = 'Required'
    if (!form.reason) e.reason = 'Required'
    if (!form.checkIn) e.checkIn = 'Required'
    if (!form.checkOut) e.checkOut = 'Required'
    if (!form.note || form.note.length < 20) e.note = 'Min 20 characters required'
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    try {
      setLoading(true)
      await onSubmit({
        date: form.date,
        reason: form.reason,
        correct_check_in: form.checkIn,
        correct_check_out: form.checkOut,
        notes: form.note,
        attachment_url: ""
      })
      onClose()
      setForm({ date: '', reason: '', checkIn: '', checkOut: '', note: '', file: null })
      setErrors({})
    } catch (err) {
      setErrors({ submit: err.message || 'Failed to submit request' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="fixed inset-x-4 top-1/2 z-50 max-w-lg mx-auto -translate-y-1/2 rounded-3xl bg-white shadow-2xl border border-slate-200"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Attendance Regularisation</h3>
                <p className="text-xs text-slate-500">Correction request · Auto-assigned to your manager</p>
              </div>
              <button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button>
            </div>

            <div className="space-y-4 p-6 overflow-y-auto max-h-[60vh]">
              {errors.submit && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 text-xs font-medium text-rose-600">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errors.submit}</span>
                </div>
              )}

              {/* Date */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-600 uppercase tracking-wide">
                  Date <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input type="date" value={form.date}
                    max={new Date().toISOString().slice(0,10)}
                    onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                    className={`w-full rounded-xl border pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 ${errors.date ? 'border-rose-400 bg-rose-50' : 'border-slate-200'}`}
                  />
                </div>
                {errors.date && <p className="mt-1 text-xs text-rose-500">{errors.date}</p>}
              </div>

              {/* Reason */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-600 uppercase tracking-wide">
                  Reason <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <select value={form.reason}
                    onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
                    className={`w-full appearance-none rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 ${errors.reason ? 'border-rose-400 bg-rose-50' : 'border-slate-200'}`}
                  >
                    <option value="">Select reason…</option>
                    {REASONS.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                {errors.reason && <p className="mt-1 text-xs text-rose-500">{errors.reason}</p>}
              </div>

              {/* Times */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Correct Check-In', key: 'checkIn', err: errors.checkIn },
                  { label: 'Correct Check-Out', key: 'checkOut', err: errors.checkOut },
                ].map(f => (
                  <div key={f.key}>
                    <label className="mb-1.5 block text-xs font-bold text-slate-600 uppercase tracking-wide">
                      {f.label} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input type="time" value={form[f.key]}
                        onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                        className={`w-full rounded-xl border pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 ${f.err ? 'border-rose-400 bg-rose-50' : 'border-slate-200'}`}
                      />
                    </div>
                    {f.err && <p className="mt-1 text-xs text-rose-500">{f.err}</p>}
                  </div>
                ))}
              </div>

              {/* Supporting Note */}
              <div>
                <label className="mb-1.5 flex items-center justify-between text-xs font-bold text-slate-600 uppercase tracking-wide">
                  <span>Supporting Note <span className="text-rose-500">*</span></span>
                  <span className={`font-medium ${form.note.length < 20 ? 'text-slate-400' : 'text-emerald-500'}`}>
                    {form.note.length}/20 min
                  </span>
                </label>
                <textarea rows={3} value={form.note}
                  onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
                  placeholder="Describe the reason in detail (min 20 characters)…"
                  className={`w-full resize-none rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 ${errors.note ? 'border-rose-400 bg-rose-50' : 'border-slate-200'}`}
                />
                {errors.note && <p className="mt-1 text-xs text-rose-500">{errors.note}</p>}
              </div>

              {/* File Upload */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-600 uppercase tracking-wide">
                  Attachment <span className="text-slate-400 font-normal">(Optional · PDF/Image · max 5MB)</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 transition hover:bg-slate-100">
                  <Upload className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-500">{form.file ? form.file.name : 'Click to upload proof…'}</span>
                  <input type="file" accept="image/*,.pdf" className="hidden"
                    onChange={e => setForm(p => ({ ...p, file: e.target.files[0] }))}
                  />
                </label>
              </div>

              {/* Approver (read-only) */}
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
                <User className="h-4 w-4 text-slate-400 shrink-0" />
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Auto-assigned Approver</div>
                  <div className="text-sm font-bold text-slate-800">Direct Manager ({currentUserName})</div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
              <button disabled={loading} onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50">Cancel</button>
              <motion.button disabled={loading} whileTap={{ scale: 0.97 }} onClick={handleSubmit}
                className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/* ── Main Page ───────────────────────────────────────────────────── */
export default function RequestsPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch]         = useState('')
  const [statusFilter, setStatus]   = useState('All')
  const [typeFilter, setType]       = useState('All')
  const [confirming, setConfirming] = useState(null)
  const [modalOpen, setModal]       = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const { canManage, isSales }      = useRole()
  const { user } = useAuth()
  const legacyUser = getCurrentUser()
  const currentUserName = user?.name || legacyUser?.name || ''

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const data = await attendanceService.getRegularisations()
      setRequests(data)
      setError(null)
    } catch (err) {
      console.error(err)
      setError('Failed to fetch requests from API')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const stats = useMemo(() => ({
    pending:  requests.filter(r => r.status === 'Pending').length,
    approved: requests.filter(r => r.status === 'Approved').length,
    rejected: requests.filter(r => r.status === 'Rejected').length,
  }), [requests])

  const filtered = useMemo(() => {
    const base = isSales ? requests.filter(r => r.employee === currentUserName) : requests
    const q = search.toLowerCase()
    return base.filter(r =>
      (!q || r.employee.toLowerCase().includes(q) || r.department.toLowerCase().includes(q)) &&
      (statusFilter === 'All' || r.status === statusFilter) &&
      (typeFilter === 'All' || r.type === typeFilter)
    )
  }, [requests, search, statusFilter, typeFilter, isSales, currentUserName])

  const approve = async id => {
    try {
      setActionLoading(true)
      await attendanceService.processRegularisation(id, 'approve')
      setRequests(p => p.map(r => r.id === id ? { ...r, status: 'Approved' } : r))
      setConfirming(null)
      setDetailsOpen(false)
    } catch (err) {
      alert(err.message || 'Approval failed')
    } finally {
      setActionLoading(false)
    }
  }

  const reject  = async id => {
    try {
      setActionLoading(true)
      await attendanceService.processRegularisation(id, 'reject')
      setRequests(p => p.map(r => r.id === id ? { ...r, status: 'Rejected' } : r))
      setConfirming(null)
      setDetailsOpen(false)
    } catch (err) {
      alert(err.message || 'Rejection failed')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReconsider = async id => {
    alert('Reconsider feature coming soon!')
  }

  const handleEdit = async id => {
    alert('Edit feature coming soon!')
  }

  const handleViewDetails = (request) => {
    setSelectedRequest(request)
    setDetailsOpen(true)
  }

  const handleCreateRequest = async (formData) => {
    await attendanceService.requestRegularisation("00000000-0000-0000-0000-000000000000", formData)
    await fetchRequests()
  }

  return (
    <div className="p-6">
      <RegularisationModal open={modalOpen} onClose={() => setModal(false)} onSubmit={handleCreateRequest} />
      <ViewDetailsModal 
        open={detailsOpen} 
        onClose={() => setDetailsOpen(false)} 
        request={selectedRequest}
        canManage={canManage}
        onApprove={approve}
        onReject={reject}
        actionLoading={actionLoading}
      />

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

        {/* Header */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {isSales ? 'My Regularisation Requests' : 'Attendance Regularisation Centre'}
            </h1>
            <p className="text-sm text-slate-500">
              Manage correction requests, late-mark removals, and overtime claims
            </p>
          </div>
          <div className="flex items-center gap-3">
            <AnimatePresence>
              {canManage && stats.pending > 0 && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2"
                >
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-bold text-amber-800">{stats.pending} Pending</span>
                </motion.div>
              )}
            </AnimatePresence>
            <motion.button whileTap={{ scale: 0.96 }} onClick={() => setModal(true)}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              New Request
            </motion.button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          {[
            { label: 'Pending', value: stats.pending, from: 'from-amber-400', to: 'to-orange-500', text: 'text-white' },
            { label: 'Approved', value: stats.approved, from: 'from-emerald-400', to: 'to-teal-500', text: 'text-white' },
            { label: 'Rejected', value: stats.rejected, from: 'from-rose-400', to: 'to-red-500', text: 'text-white' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className={`rounded-2xl bg-gradient-to-br ${s.from} ${s.to} p-5 shadow-lg`}
            >
              <div className="text-3xl font-black text-white">{s.value}</div>
              <div className="mt-1 text-sm font-semibold text-white/80">{s.label} Requests</div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative min-w-52 flex-1">
            <ClipboardList className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search employee or department…"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <select value={statusFilter} onChange={e => setStatus(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:outline-none">
            {['All', 'Pending', 'Approved', 'Rejected'].map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={typeFilter} onChange={e => setType(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:outline-none">
            {REQUEST_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  {['Employee', 'Date', 'Type', 'Requested Timing', 'Reason', 'Status',
                    ...(canManage ? ['Actions'] : [])
                  ].map(h => (
                    <th key={h} className="px-4 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(3)].map((_, i) => <SkeletonRow key={i} cols={canManage ? 7 : 6} />)
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={canManage ? 7 : 6} className="py-16 text-center">
                      <FileText className="mx-auto mb-3 h-10 w-10 text-slate-200" />
                      <p className="text-sm font-medium text-slate-400">No requests found</p>
                    </td>
                  </tr>
                ) : filtered.map((req, idx) => (
                  <motion.tr key={req.id}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.04 }}
                    className={`border-b border-slate-50 transition hover:bg-slate-50/70 ${req.status === 'Pending' ? 'bg-amber-50/30' : ''}`}
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${req.avatarColor || 'bg-slate-400'}`}>
                          {req.avatar}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{req.employee}</div>
                          <div className="text-[10px] text-slate-400">{req.department}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-600 whitespace-nowrap">
                      {new Date(req.date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 whitespace-nowrap">{req.type}</span>
                    </td>
                    <td className="px-4 py-3.5 text-xs font-mono text-slate-600 whitespace-nowrap">{req.requestedIn} → {req.requestedOut}</td>
                    <td className="max-w-48 px-4 py-3.5">
                      <p className="truncate text-sm text-slate-600" title={req.reason}>{req.reason}</p>
                    </td>
                    <td className="px-4 py-3.5"><StatusBadge status={req.status} /></td>
                    {canManage && (
                      <td className="px-4 py-3.5">
                        <ActionDropdown 
                          request={req}
                          onView={handleViewDetails}
                          onApprove={() => setConfirming({ id: req.id, action: 'approve' })}
                          onReject={() => setConfirming({ id: req.id, action: 'reject' })}
                          onReconsider={handleReconsider}
                          onEdit={handleEdit}
                          canManage={canManage}
                          confirming={confirming}
                          onConfirm={(action) => action === 'approve' ? approve(req.id) : reject(req.id)}
                          actionLoading={actionLoading}
                        />
                      </td>
                    )}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {!loading && filtered.length > 0 && (
          <p className="mt-3 text-xs text-slate-400">Showing {filtered.length} of {requests.length} requests</p>
        )}
      </motion.div>
    </div>
  )
}
