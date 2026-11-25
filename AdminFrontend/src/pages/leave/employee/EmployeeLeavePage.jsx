import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, Calendar, Umbrella, RefreshCw, PlaneTakeoff, HeartPulse, Baby, FileText, ChevronRight, ChevronDown } from 'lucide-react'

import { useAuth } from '../../../hooks/useAuth'
import employeeService from '../../../services/employeeService'

export default function EmployeeLeavePage({ activeTab: initialActiveTab = 'balance' }) {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [activeTab, setActiveTab] = useState(initialActiveTab === 'apply' ? 'balance' : initialActiveTab)
  const [isModalOpen, setIsModalOpen] = useState(initialActiveTab === 'apply')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  
  const [leaveBalances, setLeaveBalances] = useState([])
  const [leaveHistory, setLeaveHistory] = useState([])
  const [todaySummary, setTodaySummary] = useState(null)
  const [attendanceLogs, setAttendanceLogs] = useState([])

  // Form states
  const [leaveType, setLeaveType] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [reason, setReason] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Keep internal activeTab in sync with route prop changes
  useEffect(() => {
    if (initialActiveTab === 'apply') {
      setActiveTab('balance')
      setIsModalOpen(true)
      navigate('/leave/balance', { replace: true })
    } else {
      setActiveTab(initialActiveTab)
    }
  }, [initialActiveTab, navigate])

  const fetchLeaveDetails = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const data = await employeeService.getDashboardSummary()
      setLeaveBalances(data.leave_balances || [])
      setLeaveHistory(data.leave_history || [])
      setTodaySummary(data.today_attendance || null)

      if (data.leave_balances && data.leave_balances.length > 0 && !leaveType) {
        setLeaveType(data.leave_balances[0].type)
      }

      // Fetch employee profile to get attendance logs for sidebar summary
      const empProfile = await employeeService.getEmployee('me')
      const todayStr = new Date().toISOString().split('T')[0]
      const thirtyDaysAgoStr = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const logs = await employeeService.getEmployeeAttendanceLogs(empProfile.id, thirtyDaysAgoStr, todayStr)
      setAttendanceLogs(Array.isArray(logs) ? logs : [])
    } catch (err) {
      console.error('Failed to fetch leave info:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [leaveType])

  useEffect(() => {
    fetchLeaveDetails()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!fromDate || !toDate || !reason) {
      alert('Please fill out all required fields.')
      return
    }

    setIsSubmitting(true)
    try {
      const cleanType = leaveType.replace(' Leave', '').trim()
      const res = await employeeService.applyLeave({
        leave_type: cleanType,
        start_date: fromDate,
        end_date: toDate,
        reason: reason,
        contact_number: contactNumber
      })
      alert(res.message || 'Leave applied successfully!')
      // Clear inputs
      setFromDate('')
      setToDate('')
      setReason('')
      setContactNumber('')
      
      setIsModalOpen(false)
      // Refresh
      await fetchLeaveDetails(true)
    } catch (err) {
      alert(err.message || 'Failed to apply leave')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate stats for the current month (for the attendance sidebar card)
  const attendanceStats = useMemo(() => {
    const totalDays = attendanceLogs.length
    const present = attendanceLogs.filter(l => l.status?.toLowerCase() === 'present' || l.status?.toLowerCase() === 'clocked in' || l.status?.toLowerCase() === 'clocked out').length
    const late = attendanceLogs.filter(l => l.status?.toLowerCase() === 'late').length
    const absent = attendanceLogs.filter(l => l.status?.toLowerCase() === 'absent').length
    const percentage = totalDays > 0 ? ((present / totalDays) * 100).toFixed(0) : '100'

    return {
      present,
      absent,
      late,
      percentage
    }
  }, [attendanceLogs])

  const tabItems = [
    { id: 'balance', label: 'Leave Balance', path: '/leave/balance' },
    { id: 'history', label: 'Leave History', path: '/leave/history' },
  ]

  const handleTabClick = (tabId, path) => {
    setActiveTab(tabId)
    navigate(path)
  }

  if (loading && leaveBalances.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-600 border-t-transparent mx-auto"></div>
          <p className="mt-2 text-sm text-slate-500">Loading leave details...</p>
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
            <span>Dashboard</span> <span className="mx-1">/</span> <span className="text-slate-800 font-semibold">Leave & Attendance Summary</span>
          </div>
          <button onClick={() => fetchLeaveDetails(true)} disabled={refreshing} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-50">
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <h2 className="text-2xl font-bold text-slate-850">Leave & Attendance Summary</h2>

        {/* Custom Navigation Tab Headers */}
        <div className="flex border-b border-slate-100 mb-6 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
          {tabItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id, item.path)}
              className={`pb-2 px-6 text-sm font-bold border-b-2 cursor-pointer transition-all ${
                activeTab === item.id
                  ? 'border-violet-600 text-violet-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          
          {/* ──── Tab 1: Leave Balance / Summary ──── */}
          {activeTab === 'balance' && (
            <motion.div
              key="balance-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Leave Balance Cards (Casual, Sick, Earned) */}
              <div className="grid gap-6 md:grid-cols-3">
                {leaveBalances.map((leave, index) => {
                  const cardStyles = 
                    leave.type === 'Casual' ? { text: 'text-blue-600', bg: 'bg-blue-50/50', border: 'border-blue-100', progress: 'bg-blue-500', shadow: 'shadow-blue-50' } :
                    leave.type === 'Sick' ? { text: 'text-rose-600', bg: 'bg-rose-50/50', border: 'border-rose-100', progress: 'bg-rose-500', shadow: 'shadow-rose-50' } :
                    { text: 'text-violet-600', bg: 'bg-violet-50/50', border: 'border-violet-100', progress: 'bg-violet-600', shadow: 'shadow-violet-50' }

                  return (
                    <div 
                      key={leave.type} 
                      className={`p-6 rounded-2xl border bg-white shadow-sm flex flex-col justify-between ${cardStyles.border}`}
                    >
                      <div className="mb-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${cardStyles.text} ${cardStyles.bg}`}>
                          {leave.type} Leave
                        </span>
                        <p className="text-3xl font-black text-slate-800 mt-4">
                          {leave.total - leave.used} <span className="text-sm text-slate-400 font-bold">/ {leave.total}</span>
                        </p>
                        <p className="text-xs text-slate-400 font-semibold mt-1 uppercase">Available Days</p>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${cardStyles.progress}`} 
                          style={{ width: `${((leave.total - leave.used) / leave.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Leave History (Left) and Attendance Summary (Right) */}
              <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                
                {/* Leave History Panel */}
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <h3 className="font-bold text-slate-800 text-lg">Leave History</h3>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-violet-600 text-white font-bold text-sm shadow-sm hover:bg-violet-700 transition cursor-pointer flex items-center justify-center gap-1.5 self-start sm:self-auto"
                    >
                      <PlaneTakeoff className="h-4 w-4" />
                      Apply Leave
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-650">
                      <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                        <tr>
                          <th className="px-4 py-3">Leave Type</th>
                          <th className="px-4 py-3">From</th>
                          <th className="px-4 py-3">To</th>
                          <th className="px-4 py-3">Days</th>
                          <th className="px-4 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {leaveHistory.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="px-4 py-8 text-center text-slate-450 italic text-xs">
                              No leave history recorded
                            </td>
                          </tr>
                        ) : (
                          leaveHistory.slice(0, 5).map((req, index) => {
                            const statusColor = 
                              req.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-100' :
                              req.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                              'bg-amber-50 text-amber-700 border-amber-100'

                            return (
                              <tr key={req.id || index} className="hover:bg-slate-50/50 transition">
                                <td className="px-4 py-3 font-semibold text-slate-800">{req.leave_type} Leave</td>
                                <td className="px-4 py-3 font-medium text-slate-600">
                                  {new Date(req.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </td>
                                <td className="px-4 py-3 font-medium text-slate-600">
                                  {new Date(req.end_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </td>
                                <td className="px-4 py-3 font-bold text-slate-700">{req.days} days</td>
                                <td className="px-4 py-3">
                                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusColor}`}>
                                    {req.status}
                                  </span>
                                </td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Attendance Summary Panel */}
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm mb-4">Attendance Summary</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Present Days', value: attendanceStats.present, dot: 'bg-green-500' },
                        { label: 'Absent Days', value: attendanceStats.absent, dot: 'bg-red-500' },
                        { label: 'Late Days', value: attendanceStats.late, dot: 'bg-amber-500' },
                      ].map((s, idx) => (
                        <div key={idx} className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-1.5">
                            <div className={`h-2 w-2 rounded-full ${s.dot}`} />
                            <span className="text-[10px] text-slate-400 font-bold uppercase">{s.label}</span>
                          </div>
                          <p className="text-lg font-black text-slate-800 mt-1">{s.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-500 mb-2">
                      <span>Attendance Percentage</span>
                      <span className="text-green-650">{attendanceStats.percentage}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full" 
                        style={{ width: `${attendanceStats.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}
          {/* ──── Tab 3: Detailed Leave History ──── */}
          {activeTab === 'history' && (
            <motion.div
              key="history-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <h3 className="font-bold text-slate-800 text-lg">Detailed Leave History</h3>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-violet-600 text-white font-bold text-sm shadow-sm hover:bg-violet-700 transition cursor-pointer flex items-center justify-center gap-1.5 self-start sm:self-auto"
                >
                  <PlaneTakeoff className="h-4 w-4" />
                  Apply Leave
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-650">
                  <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                    <tr>
                      <th className="px-4 py-3">Leave Type</th>
                      <th className="px-4 py-3">From Date</th>
                      <th className="px-4 py-3">To Date</th>
                      <th className="px-4 py-3">Total Days</th>
                      <th className="px-4 py-3">Reason</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {leaveHistory.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-4 py-8 text-center text-slate-450 italic text-xs">
                          No leave history requests found
                        </td>
                      </tr>
                    ) : (
                      leaveHistory.map((req, index) => {
                        const statusColor = 
                          req.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-100' :
                          req.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                          'bg-amber-50 text-amber-700 border-amber-100'

                        return (
                          <tr key={req.id || index} className="hover:bg-slate-50/50 transition">
                            <td className="px-4 py-3 font-semibold text-slate-800">{req.leave_type} Leave</td>
                            <td className="px-4 py-3 font-medium text-slate-600">
                              {new Date(req.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="px-4 py-3 font-medium text-slate-600">
                              {new Date(req.end_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="px-4 py-3 font-bold text-slate-700">{req.days} days</td>
                            <td className="px-4 py-3 text-slate-500 max-w-xs truncate" title={req.reason}>
                              {req.reason}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusColor}`}>
                                {req.status}
                              </span>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Apply Leave Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', duration: 0.4 }}
                className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-100 z-10"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <PlaneTakeoff className="h-5 w-5 text-violet-600" />
                    Apply for Leave
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition cursor-pointer"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Leave Type</label>
                    <div className="relative">
                      <select
                        value={leaveType}
                        onChange={(e) => setLeaveType(e.target.value)}
                        className="w-full appearance-none rounded-xl border border-slate-200 px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-violet-100 bg-white"
                      >
                        {leaveBalances.map((leave) => (
                          <option key={leave.type} value={leave.type}>
                            {leave.type} Leave ({leave.total - leave.used} available)
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-2">From Date</label>
                      <input
                        type="date"
                        required
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-2">To Date</label>
                      <input
                        type="date"
                        required
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Reason</label>
                    <textarea
                      rows="3"
                      required
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Enter reason for leave..."
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-100 resize-none"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Contact Number</label>
                    <input
                      type="tel"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-100"
                    />
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-2.5 rounded-xl bg-violet-600 text-white font-bold text-sm shadow-sm hover:bg-violet-700 transition cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5"
                    >
                      {isSubmitting && <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                      Submit Request
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
