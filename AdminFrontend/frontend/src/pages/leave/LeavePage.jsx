import { useState, memo, useEffect } from 'react'
import { motion } from 'motion/react'
import { ClipboardList, CheckCircle2, BarChart2, Umbrella, ScrollText, AlertTriangle, PlaneTakeoff, Baby, HeartPulse } from 'lucide-react'
import employeeService from '../../services/employeeService'

const LeavePage = memo(() => {
  const [activeTab, setActiveTab] = useState('apply')
  const [loading, setLoading] = useState(true)
  const [leaveBalances, setLeaveBalances] = useState([])
  const [leaveHistory, setLeaveHistory] = useState([])

  // Form states
  const [leaveType, setLeaveType] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [reason, setReason] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const tabs = [
    { id: 'apply', label: 'Apply Leave', icon: ClipboardList },
    { id: 'approvals', label: 'Pending Approvals', icon: CheckCircle2 },
    { id: 'history', label: 'Leave History', icon: BarChart2 },
    { id: 'balance', label: 'Leave Balance', icon: Umbrella },
  ]

  const fetchLeaveData = async () => {
    try {
      setLoading(true)
      const data = await employeeService.getDashboardSummary()
      setLeaveBalances(data.leave_balances || [])
      setLeaveHistory(data.leave_history || [])
      
      if (data.leave_balances && data.leave_balances.length > 0 && !leaveType) {
        setLeaveType(data.leave_balances[0].type)
      }
    } catch (err) {
      console.error('Failed to fetch leave details:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaveData()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!fromDate || !toDate || !reason) {
      alert('Please fill out all required fields.')
      return
    }

    try {
      setIsSubmitting(false)
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
      // Refresh
      await fetchLeaveData()
    } catch (err) {
      alert(err.message || 'Failed to submit leave application')
    }
  }

  const pendingRequests = leaveHistory.filter(req => req.status === 'Pending')

  if (loading && leaveBalances.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm font-semibold text-slate-500">Loading leave details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#F7F8FA]">
      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white px-6">
        <div className="flex gap-0 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'apply' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-6 lg:grid-cols-3"
          >
            {/* Leave Application Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900"><ClipboardList className="h-5 w-5 text-blue-600" /> Apply for Leave</h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Leave Type</label>
                    <select
                      value={leaveType}
                      onChange={(e) => setLeaveType(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 bg-white"
                    >
                      {leaveBalances.map((leave) => (
                        <option key={leave.type} value={leave.type}>
                          {leave.type} Leave ({leave.total - leave.used} available)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">From Date</label>
                      <input
                        type="date"
                        required
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">To Date</label>
                      <input
                        type="date"
                        required
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Reason</label>
                    <textarea
                      rows="3"
                      required
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                      placeholder="Enter reason for leave..."
                    ></textarea>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Contact During Leave</label>
                    <input
                      type="tel"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting Application...' : 'Submit Leave Application'}
                  </button>
                </div>

                {/* Leave Policy Info */}
                <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <h4 className="mb-2 flex items-center gap-2 font-bold text-blue-900"><ScrollText className="h-4 w-4 text-blue-600" /> Leave Policy</h4>
                  <ul className="space-y-1 text-sm text-blue-800">
                    <li>• Casual Leave: Apply at least 1 day in advance</li>
                    <li>• Sick Leave: Medical certificate required for 3+ consecutive days</li>
                    <li>• Earned Leave: Apply at least 7 days in advance</li>
                    <li>• Manager approval required for all leave applications</li>
                  </ul>
                </div>
              </form>
            </div>

            {/* Leave Balance Panel */}
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <h4 className="mb-3 flex items-center gap-2 font-bold text-slate-900"><Umbrella className="h-4 w-4 text-blue-500" /> Your Leave Balance</h4>
                <div className="space-y-3">
                  {leaveBalances.map((leave) => (
                    <div key={leave.type} className="rounded-lg border border-slate-200 p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-900">{leave.type} Leave</span>
                        <span className="text-sm font-bold text-slate-900">
                          {leave.total - leave.used}/{leave.total}
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full bg-blue-600`}
                          style={{ width: `${((leave.total - leave.used) / leave.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-sm">
                <h4 className="mb-2 flex items-center gap-2 font-bold text-amber-900"><AlertTriangle className="h-4 w-4 text-amber-600" /> Important</h4>
                <ul className="space-y-1 text-xs text-amber-800">
                  <li>• Unused leaves expire on Dec 31</li>
                  <li>• Max 3 consecutive casual leaves</li>
                  <li>• Public holidays not counted</li>
                  <li>• Negative balance allowed in special cases</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'approvals' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900"><CheckCircle2 className="h-5 w-5 text-green-600" /> Pending Approvals</h3>
              <div className="space-y-4">
                {pendingRequests.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-6">No pending leave approvals found</p>
                ) : (
                  pendingRequests.map((req) => (
                    <div key={req.id} className="rounded-lg border-2 border-slate-200 p-4">
                      <div className="mb-3 flex items-start justify-between">
                        <div>
                          <div className="font-bold text-slate-900">Rahul Sharma</div>
                          <div className="text-sm text-slate-600">{req.leave_type}</div>
                        </div>
                        <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                          {req.status}
                        </span>
                      </div>
                      <div className="mb-3 grid gap-2 text-sm md:grid-cols-2">
                        <div>
                          <span className="text-slate-600">From:</span>{' '}
                          <span className="font-semibold text-slate-900">{req.start_date}</span>
                        </div>
                        <div>
                          <span className="text-slate-600">To:</span>{' '}
                          <span className="font-semibold text-slate-900">{req.end_date}</span>
                        </div>
                        <div>
                          <span className="text-slate-600">Days:</span>{' '}
                          <span className="font-semibold text-slate-900">{req.days}</span>
                        </div>
                        <div>
                          <span className="text-slate-600">Applied On:</span>{' '}
                          <span className="font-semibold text-slate-900">{req.applied_on}</span>
                        </div>
                      </div>
                      <div className="mb-3 text-sm">
                        <span className="text-slate-600">Reason:</span>{' '}
                        <span className="text-slate-900">{req.reason}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900"><BarChart2 className="h-5 w-5 text-purple-600" /> Leave History</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                      From - To
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                      Days
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                      Reason
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leaveHistory.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-6 text-sm text-slate-500 text-center">No leave history found</td>
                    </tr>
                  ) : (
                    leaveHistory.map((req) => (
                      <tr key={req.id}>
                        <td className="px-4 py-3 text-sm text-slate-900 font-medium">{req.leave_type}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">{req.start_date} - {req.end_date}</td>
                        <td className="px-4 py-3 text-sm text-slate-900">{req.days}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">{req.reason}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            req.status === 'Approved' ? 'bg-green-100 text-green-700' :
                            req.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'balance' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            {leaveBalances.map((leave) => (
              <div key={leave.type} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-purple-500 shadow">
                  {leave.type === 'Casual' ? <Umbrella className="h-6 w-6 text-white" /> : leave.type === 'Sick' ? <HeartPulse className="h-6 w-6 text-white" /> : leave.type === 'Earned' ? <PlaneTakeoff className="h-6 w-6 text-white" /> : <Baby className="h-6 w-6 text-white" />}
                </div>
                <div className="mb-2 text-sm font-semibold text-slate-600">{leave.type} Leave</div>
                <div className="mb-3 text-3xl font-bold text-slate-900">
                  {leave.total - leave.used}<span className="text-lg text-slate-500">/{leave.total}</span>
                </div>
                <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full bg-blue-600`}
                    style={{ width: `${((leave.total - leave.used) / leave.total) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-slate-600">
                  {leave.used} used • {leave.total - leave.used} remaining
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
})

LeavePage.displayName = 'LeavePage'

export default LeavePage
