import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Search, ChevronDown, Eye, CheckCircle, XCircle, Clock, Download, X, Calendar, User, Briefcase, FileText } from 'lucide-react'
import leaveService from '../../../services/leaveService'

const STATUS_CONFIG = {
  Pending: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  Approved: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  Rejected: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  pending: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  approved: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  rejected: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
}

function ViewLeaveModal({ open, onClose, leave }) {
  if (!open || !leave) return null

  const empName = leave.empName || leave.employee_name || leave.employee?.name || 'Unknown'
  const empCustomId = leave.employee_custom_id || leave.employeeCustomId || leave.employee?.employee_id || 'N/A'
  const empEmail = leave.employee_email || leave.empEmail || leave.employee_email || leave.employee?.email || 'N/A'
  const dept = leave.department || leave.employee?.department || 'N/A'
  const leaveType = leave.leaveType || leave.leave_type || 'N/A'
  const fromDate = leave.from || leave.start_date || leave.from_date || 'N/A'
  const toDate = leave.to || leave.end_date || leave.to_date || 'N/A'
  const days = leave.days || leave.duration || leave.total_days || 0
  const appliedOn = leave.appliedOn || leave.applied_on || leave.applied_at || leave.created_at || 'N/A'
  const reason = leave.reason || 'No reason provided'
  const status = leave.status || 'Pending'
  const rejectionReason = leave.rejection_reason || leave.rejectionReason || null
  const approvedBy = leave.approved_by || leave.approvedBy || null
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.Pending

  // Format dates if they are ISO strings
  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === 'N/A') return 'N/A'
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    } catch {
      return dateStr
    }
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
            className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 flex-shrink-0">
              <h2 className="text-lg font-bold text-slate-900">Leave Request Details</h2>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="px-6 py-5 space-y-6 overflow-y-auto flex-1">
              {/* Employee Info */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-blue-100 p-3 flex-shrink-0">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-slate-900">{empName}</h3>
                    <div className="mt-2 space-y-1.5">
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">Employee ID:</span> {empCustomId}
                      </p>
                      <p className="text-sm text-slate-600 break-all">
                        <span className="font-medium">Email:</span> {empEmail}
                      </p>
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">Department:</span>{' '}
                        <span className="inline-block rounded-md bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">
                          {dept}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${config.bg} ${config.text}`}>
                      <span className={`h-2 w-2 rounded-full ${config.dot}`} />
                      {status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Leave Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <Briefcase className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wide">Leave Type</span>
                  </div>
                  <p className="text-lg font-bold text-slate-900">{leaveType}</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wide">Duration</span>
                  </div>
                  <p className="text-lg font-bold text-slate-900">{days} {days === 1 ? 'Day' : 'Days'}</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wide">From Date</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{formatDate(fromDate)}</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wide">To Date</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{formatDate(toDate)}</p>
                </div>
              </div>

              {/* Applied On */}
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2 text-slate-500 mb-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wide">Applied On</span>
                </div>
                <p className="text-sm font-semibold text-slate-900">{formatDate(appliedOn)}</p>
              </div>

              {/* Reason */}
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2 text-slate-500 mb-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wide">Reason</span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{reason}</p>
              </div>

              {/* Rejection Reason (if rejected) */}
              {status.toLowerCase() === 'rejected' && rejectionReason && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <div className="flex items-center gap-2 text-red-700 mb-2">
                    <XCircle className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wide">Rejection Reason</span>
                  </div>
                  <p className="text-sm text-red-700 leading-relaxed">{rejectionReason}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4 flex-shrink-0">
              <button
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function HRLeaveRequestsPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [deptFilter, setDeptFilter] = useState('all')
  const [error, setError] = useState(null)
  const [viewLeave, setViewLeave] = useState(null)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await leaveService.getAllLeaveRequests()
      setRequests(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to fetch requests:', err)
      setError('Failed to load leave requests. Please try again.')
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (leave_id) => {
    try {
      await leaveService.approveLeaveRequest(leave_id, 'Approved by HR')
      // Refresh the list
      await fetchRequests()
    } catch (err) {
      console.error('Failed to approve:', err)
      alert('Failed to approve leave request. Please try again.')
    }
  }

  const handleReject = async (leave_id) => {
    const reason = prompt('Please provide a reason for rejection:')
    if (!reason) return
    
    try {
      await leaveService.rejectLeaveRequest(leave_id, reason)
      // Refresh the list
      await fetchRequests()
    } catch (err) {
      console.error('Failed to reject:', err)
      alert('Failed to reject leave request. Please try again.')
    }
  }

  const filtered = requests.filter(r => {
    const empName = r.empName || r.employee_name || r.employee?.name || ''
    const empId = r.empId || r.employee_id || r.employee?.id || ''
    const dept = r.department || r.employee?.department || ''
    const status = (r.status || '').toLowerCase()
    
    if (search && !empName.toLowerCase().includes(search.toLowerCase()) && !empId.toLowerCase().includes(search.toLowerCase())) return false
    if (statusFilter !== 'all' && status !== statusFilter) return false
    if (deptFilter !== 'all' && dept !== deptFilter) return false
    return true
  })

  const stats = {
    total: requests.length,
    pending: requests.filter(r => (r.status || '').toLowerCase() === 'pending').length,
    approved: requests.filter(r => (r.status || '').toLowerCase() === 'approved').length,
    rejected: requests.filter(r => (r.status || '').toLowerCase() === 'rejected').length,
  }

  const departments = [...new Set(requests.map(r => r.department || r.employee?.department || 'Unknown').filter(Boolean))]

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
            onClick={fetchRequests}
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
          { label: 'Total Requests', value: stats.total, color: 'text-blue-700', bg: 'bg-blue-50' },
          { label: 'Pending', value: stats.pending, color: 'text-amber-700', bg: 'bg-amber-50' },
          { label: 'Approved', value: stats.approved, color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Rejected', value: stats.rejected, color: 'text-red-700', bg: 'bg-red-50' },
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
            placeholder="Search by name or ID…"
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

        <div className="flex rounded-xl border border-slate-200 bg-white p-0.5 shadow-sm text-sm">
          {[
            { value: 'all', label: 'All' },
            { value: 'pending', label: 'Pending' },
            { value: 'approved', label: 'Approved' },
            { value: 'rejected', label: 'Rejected' },
          ].map(s => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={`rounded-lg px-3 py-1.5 font-medium transition ${statusFilter === s.value ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <button className="rounded-xl border border-slate-200 bg-white p-2 text-slate-400 shadow-sm transition hover:text-blue-600">
          <Download className="h-4 w-4" />
        </button>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                {['Employee', 'Department', 'Leave Type', 'From - To', 'Days', 'Applied On', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center text-sm text-slate-400">
                    No requests found
                  </td>
                </tr>
              ) : (
                filtered.map((r, i) => {
                  const empName = r.empName || r.employee_name || r.employee?.name || 'Unknown'
                  const empId = r.empId || r.employee_id || r.employee?.id || 'N/A'
                  const dept = r.department || r.employee?.department || 'N/A'
                  const leaveType = r.leaveType || r.leave_type || 'N/A'
                  const fromDate = r.from || r.start_date || r.from_date || 'N/A'
                  const toDate = r.to || r.end_date || r.to_date || 'N/A'
                  const days = r.days || r.duration || r.total_days || 0
                  const appliedOn = r.appliedOn || r.applied_on || r.created_at || 'N/A'
                  const status = r.status || 'Pending'
                  const config = STATUS_CONFIG[status] || STATUS_CONFIG.Pending
                  const leaveId = r.id || r._id
                  
                  return (
                    <motion.tr
                      key={leaveId}
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
                      <td className="px-5 py-3.5 text-sm text-slate-600">{fromDate} → {toDate}</td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-slate-900">{days}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-500">{appliedOn}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${config.bg} ${config.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
                          {status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          {status.toLowerCase() === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(leaveId)}
                                className="rounded-lg p-1.5 text-emerald-600 transition hover:bg-emerald-50"
                                title="Approve"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleReject(leaveId)}
                                className="rounded-lg p-1.5 text-red-600 transition hover:bg-red-50"
                                title="Reject"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          <button 
                            onClick={() => setViewLeave(r)}
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600" 
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
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
              Showing <span className="font-semibold text-slate-600">{filtered.length}</span> of{' '}
              <span className="font-semibold text-slate-600">{requests.length}</span> requests
            </p>
          </div>
        )}
      </motion.div>

      {/* View Leave Modal */}
      <ViewLeaveModal
        open={!!viewLeave}
        onClose={() => setViewLeave(null)}
        leave={viewLeave}
      />
    </div>
  )
}
