import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Search, Clock, CheckCircle, XCircle, Ban, Eye, Download, AlertCircle } from 'lucide-react'
import { getMyLeaves } from '../data/leaveData'

const STATUS_CONFIG = {
  Pending: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  Approved: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  Rejected: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  Cancelled: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-500' },
}

const LEAVE_TYPE_COLORS = {
  'Casual Leave': { bg: 'bg-blue-50', text: 'text-blue-700', icon: 'bg-blue-100' },
  'Sick Leave': { bg: 'bg-green-50', text: 'text-green-700', icon: 'bg-green-100' },
  'Earned Leave': { bg: 'bg-purple-50', text: 'text-purple-700', icon: 'bg-purple-100' },
  'Comp Off': { bg: 'bg-amber-50', text: 'text-amber-700', icon: 'bg-amber-100' },
}

export default function RequestsPage() {
  const [requests, setRequests] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchLeaveRequests()
  }, [])

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getMyLeaves()
      
      console.log('=== LEAVE REQUESTS FETCH ===')
      console.log('Raw API response:', data)
      console.log('Is array?', Array.isArray(data))
      console.log('Length:', Array.isArray(data) ? data.length : 'N/A')
      
      // Transform API response to component format
      let transformed = []
      
      if (Array.isArray(data) && data.length > 0) {
        console.log('Processing', data.length, 'leaves')
        transformed = data.map((leave, idx) => {
          try {
            console.log(`Leave ${idx}:`, {
              id: leave.id || leave._id,
              leave_type: leave.leave_type,
              start_date: leave.start_date,
              end_date: leave.end_date,
              applied_at: leave.applied_at,
              total_days: leave.total_days
            })
            
            const startDate = new Date(leave.start_date)
            const endDate = new Date(leave.end_date)
            const appliedDate = new Date(leave.applied_at)
            
            // Format dates
            const formatDate = (date) => {
              if (!date || isNaN(date)) return 'Invalid date'
              return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
            }
            
            const dateRange = startDate.toDateString() === endDate.toDateString()
              ? formatDate(startDate)
              : `${formatDate(startDate)} - ${formatDate(endDate)}`
            
            const item = {
              id: leave.id || leave._id,
              leaveType: leave.leave_type,
              dates: dateRange,
              duration: `${leave.total_days || 1} Day${leave.total_days !== 1 ? 's' : ''}`,
              status: leave.status || 'Pending',
              appliedOn: formatDate(appliedDate),
              reason: leave.reason,
              attachment: leave.attachment,
              rawData: leave
            }
            console.log(`Transformed leave ${idx}:`, item)
            return item
          } catch (e) {
            console.error(`Error transforming leave ${idx}:`, e, leave)
            return null
          }
        }).filter(item => item !== null)
        
        console.log('Final transformed requests:', transformed)
      } else {
        console.warn('No data or not an array:', { data, isArray: Array.isArray(data), length: data?.length })
      }
      
      setRequests(transformed)
    } catch (err) {
      console.error('Failed to fetch leave requests:', err)
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      })
      setError('Failed to load leave requests. Check console for details.')
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = requests.filter(r => {
    if (search && !r.leaveType.toLowerCase().includes(search.toLowerCase())) return false
    if (statusFilter !== 'all' && r.status.toLowerCase() !== statusFilter) return false
    return true
  })

  return (
    <div className="h-full bg-slate-50 p-6">
      <div className="mx-auto max-w-8xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Requests</h1>
            <p className="text-sm text-slate-500">Track all your leave requests and their status</p>
          </div>
          <div className="flex items-center gap-3">
            {!loading && (
              <button
                onClick={fetchLeaveRequests}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Refresh
              </button>
            )}
            <button className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
              Apply Leave
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <div className="flex-1">
              {error}
              <div className="text-xs text-red-600 mt-1">💡 Open browser console (F12) to see detailed errors</div>
            </div>
            <button
              onClick={fetchLeaveRequests}
              className="ml-auto font-semibold underline hover:no-underline"
            >
              Retry
            </button>
          </motion.div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-1">
          {[
            { value: 'all', label: `All (${requests.length})` },
            { value: 'pending', label: `Pending (${requests.filter(r => r.status === 'Pending').length})` },
            { value: 'approved', label: `Approved (${requests.filter(r => r.status === 'Approved').length})` },
            { value: 'rejected', label: `Rejected (${requests.filter(r => r.status === 'Rejected').length})` },
          ].map(s => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
                statusFilter === s.value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  {['LEAVE TYPE', 'DATES', 'DURATION', 'STATUS', 'APPLIED ON', 'ACTIONS'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  // Loading skeleton
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={`skeleton-${i}`}>
                      <td colSpan={6} className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-slate-100 animate-pulse" />
                          <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="text-sm text-slate-400 mb-2">
                        {requests.length === 0 ? 'No leave requests yet. Apply for leave to get started!' : 'No requests match your filters'}
                      </div>
                      {requests.length === 0 && (
                        <div className="text-xs text-slate-500 mt-2">
                          💡 Check browser console (F12) to verify API is working
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  filtered.map((r, i) => {
                    const config = STATUS_CONFIG[r.status] || STATUS_CONFIG.Pending
                    const leaveColor = LEAVE_TYPE_COLORS[r.leaveType] || LEAVE_TYPE_COLORS['Casual Leave']
                    return (
                      <motion.tr
                        key={r.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${leaveColor.icon}`}>
                              <div className={`h-2 w-2 rounded-full ${leaveColor.text.replace('text-', 'bg-')}`} />
                            </div>
                            <span className="text-sm font-semibold text-slate-800">{r.leaveType}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{r.dates}</td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{r.duration}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${config.bg} ${config.text}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
                            {r.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">{r.appliedOn}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedRequest(r)}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </motion.tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {filtered.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3">
              <p className="text-xs text-slate-500">
                Showing <span className="font-semibold text-slate-700">{filtered.length}</span> of{' '}
                <span className="font-semibold text-slate-700">{requests.length}</span> requests
              </p>
              <div className="flex items-center gap-2">
                <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50">
                  Previous
                </button>
                <button className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white">1</button>
                <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50">
                  2
                </button>
                <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50">
                  Next
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
