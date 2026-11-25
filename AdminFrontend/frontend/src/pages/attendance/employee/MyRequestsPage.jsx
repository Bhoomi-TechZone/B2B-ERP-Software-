import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Calendar, Clock, ClipboardList, AlertCircle, Plus, CheckCircle2, XCircle, RefreshCw } from 'lucide-react'

import { useAuth } from '../../../hooks/useAuth'
import attendanceService from '../../../services/attendanceService'

const REASONS = [
  'Forgot to punch in the morning',
  'Internet issue at office',
  'System was down',
  'Forgot to punch out',
  'Device not working',
  'Other',
]

export default function MyRequestsPage() {
  const { user } = useAuth()

  const [activeTab, setActiveTab] = useState('list') // 'list' or 'apply'
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [requests, setRequests] = useState([])

  // Form states
  const [date, setDate] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchMyRequests = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const data = await attendanceService.getRegularisations()
      console.log('Fetched regularisations raw data:', data)
      console.log('Current logged-in user:', user)

      const loggedInName = (user?.name || '').trim().toLowerCase()
      const firstLast = `${user?.firstName || ''} ${user?.lastName || ''}`.trim().toLowerCase()

      const filtered = Array.isArray(data) 
        ? data.filter(r => {
            // Only show actual regularisation requests
            if (r.isLog) return false

            const empName = (r.employee || '').trim().toLowerCase()
            
            // If backend returned "Unknown Employee", show it anyway so the user sees the data
            if (empName === 'unknown employee') return true

            // If logged-in user is an employee, the API only returns their own data, so show it anyway
            const userRole = (user?.role || '').toLowerCase()
            if (userRole === 'employee' || !userRole) return true

            // Strict matching fallback for Admin/HR roles viewing their requests
            const loggedInName = (user?.name || '').trim().toLowerCase()
            const firstLast = `${user?.firstName || ''} ${user?.lastName || ''}`.trim().toLowerCase()
            return empName === loggedInName || empName === firstLast || empName.includes(loggedInName) || loggedInName.includes(empName)
          })
        : []

      console.log('Filtered requests:', filtered)
      setRequests(filtered)
    } catch (err) {
      console.error('Failed to load regularization requests:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user])

  useEffect(() => {
    fetchMyRequests()
  }, [fetchMyRequests])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!date || !reason || !checkIn || !checkOut || !notes) {
      alert('Please fill out all required fields.')
      return
    }

    if (notes.trim().length < 20) {
      alert('Detailed explanation must be at least 20 characters long.')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        date,
        reason,
        correct_check_in: checkIn,
        correct_check_out: checkOut,
        notes: notes,
        attachment_url: ''
      }
      // Pass the zero UUID if there is no specific log to override
      await attendanceService.requestRegularisation("00000000-0000-0000-0000-000000000000", payload)
      alert('Regularization request submitted successfully!')
      
      // Clear inputs
      setDate('')
      setCheckIn('')
      setCheckOut('')
      setReason('')
      setNotes('')
      
      // Navigate to list and refresh
      setActiveTab('list')
      await fetchMyRequests(true)
    } catch (err) {
      alert(err.message || 'Failed to submit request')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-600 border-t-transparent mx-auto"></div>
          <p className="mt-2 text-sm text-slate-500">Loading requests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-slate-50/50 p-6">
      <div className="mx-auto max-w-8xl space-y-6">

        {/* Breadcrumb */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-500">
            <span>Dashboard</span> <span className="mx-1">/</span> <span>Attendance</span> <span className="mx-1">/</span> <span className="text-slate-800 font-semibold">Regularization Requests</span>
          </div>
          <button onClick={() => fetchMyRequests(true)} disabled={refreshing} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-50">
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <h2 className="text-2xl font-bold text-slate-850">Regularization Requests</h2>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          
          {/* Tabs header */}
          <div className="flex border-b border-slate-100 mb-6">
            <button
              onClick={() => setActiveTab('list')}
              className={`pb-3 px-4 text-sm font-bold border-b-2 cursor-pointer transition-all ${
                activeTab === 'list'
                  ? 'border-violet-600 text-violet-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              My Requests
            </button>
            <button
              onClick={() => setActiveTab('apply')}
              className={`pb-3 px-4 text-sm font-bold border-b-2 cursor-pointer transition-all ${
                activeTab === 'apply'
                  ? 'border-violet-600 text-violet-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Apply New Request
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'list' ? (
              <motion.div
                key="list-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-650">
                    <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Reason</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Applied On</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {requests.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="px-4 py-8 text-center text-slate-400 italic text-xs">
                            No regularization requests found
                          </td>
                        </tr>
                      ) : (
                        requests.map((req, index) => {
                          const statusColor = 
                            req.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-100' :
                            req.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                            'bg-amber-50 text-amber-700 border-amber-100'

                          return (
                            <tr key={req.id || index} className="hover:bg-slate-50/50 transition">
                              <td className="px-4 py-3 font-semibold text-slate-800">
                                {new Date(req.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </td>
                              <td className="px-4 py-3">
                                <div>
                                  <p className="font-semibold text-slate-700">{req.reason}</p>
                                  {req.notes && <p className="text-xs text-slate-400 mt-0.5">{req.notes}</p>}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusColor}`}>
                                  {req.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-slate-400 font-medium">
                                {new Date(req.createdAt || req.applied_on || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ) : (
              /* Apply New Request Form */
              <motion.div
                key="apply-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="w-full"
              >
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-650 uppercase mb-2">
                          Date <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                          <input
                            type="date"
                            required
                            max={new Date().toISOString().split('T')[0]}
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-100"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-650 uppercase mb-2">
                            Correct Check In <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                            <input
                              type="time"
                              required
                              value={checkIn}
                              onChange={(e) => setCheckIn(e.target.value)}
                              className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-100"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-650 uppercase mb-2">
                            Correct Check Out <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                            <input
                              type="time"
                              required
                              value={checkOut}
                              onChange={(e) => setCheckOut(e.target.value)}
                              className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-100"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-650 uppercase mb-2">
                          Reason Category <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={reason}
                          required
                          onChange={(e) => setReason(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-100 bg-white"
                        >
                          <option value="">Select reason...</option>
                          {REASONS.map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-650 uppercase mb-2 flex justify-between items-center">
                          <span>Detailed Explanation <span className="text-red-500">*</span></span>
                          <span className={`text-[10px] font-bold tracking-wider ${notes.length < 20 ? 'text-rose-500' : 'text-emerald-600'}`}>
                            {notes.length}/20 chars min
                          </span>
                        </label>
                        <textarea
                          rows="7"
                          required
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Please explain why regularization is required in detail (min 20 characters)..."
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-100 resize-none h-[184px]"
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-3 rounded-xl bg-violet-600 text-white font-bold text-sm shadow-sm hover:bg-violet-700 transition cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5"
                    >
                      {isSubmitting && <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                      Save Request
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>
    </div>
  )
}
