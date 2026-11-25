import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { 
  FileText, 
  Send, 
  Calendar, 
  TrendingUp, 
  ChevronRight,
  Umbrella,
  HeartPulse,
  PlaneTakeoff,
  Coffee,
  CheckCircle,
  XCircle,
  Clock,
  Megaphone
} from 'lucide-react'
import employeeService from '../../../services/employeeService'

const LEAVE_ICONS = {
  'Casual': Umbrella,
  'Sick': HeartPulse,
  'Earned': PlaneTakeoff,
  'Comp Off': Coffee,
}

const LEAVE_COLORS = {
  'Casual': { bg: 'bg-blue-50', text: 'text-blue-700', bar: 'bg-blue-500', icon: 'bg-blue-100' },
  'Sick': { bg: 'bg-red-50', text: 'text-red-700', bar: 'bg-red-500', icon: 'bg-red-100' },
  'Earned': { bg: 'bg-green-50', text: 'text-green-700', bar: 'bg-green-500', icon: 'bg-green-100' },
  'Comp Off': { bg: 'bg-amber-50', text: 'text-amber-700', bar: 'bg-amber-500', icon: 'bg-amber-100' },
}

const STATUS_CONFIG = {
  Approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: CheckCircle },
  Rejected: { bg: 'bg-red-50', text: 'text-red-700', icon: XCircle },
  Pending: { bg: 'bg-amber-50', text: 'text-amber-700', icon: Clock },
}

const QUICK_ACTIONS = [
  { id: 'apply', label: 'Apply Leave', sublabel: 'Request new leave', icon: Send, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'requests', label: 'My Requests', sublabel: 'View your leave requests', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
  { id: 'calendar', label: 'Leave Calendar', sublabel: 'View team leave calendar', icon: Calendar, color: 'text-green-600', bg: 'bg-green-50' },
  { id: 'balance', label: 'Leave Balance', sublabel: 'Check your leave balance', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
]

const MOCK_HOLIDAYS = [
  { date: '15', month: 'AUG', name: 'Independence Day', day: 'Thursday, 15 August 2024', type: 'Holiday' },
  { date: '02', month: 'OCT', name: 'Gandhi Jayanti', day: 'Wednesday, 02 October 2024', type: 'Holiday' },
  { date: '31', month: 'OCT', name: 'Diwali', day: 'Thursday, 31 October 2024', type: 'Holiday' },
]

const MOCK_ANNOUNCEMENTS = [
  { title: 'Annual Health Check-up', description: 'Company-wide health check-up is scheduled from 5th to 10th September 2024.', date: '31 Aug 2024' },
]

export default function EmployeeLeaveDashboard({ onNavigate }) {
  const [leaveBalances, setLeaveBalances] = useState([])
  const [recentRequests, setRecentRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaveData()
  }, [])

  async function fetchLeaveData() {
    try {
      setLoading(true)
      const data = await employeeService.getDashboardSummary()
      setLeaveBalances(data.leave_balances || [])
      setRecentRequests(data.leave_history?.slice(0, 3) || [])
    } catch (err) {
      console.error('Failed to fetch leave data:', err)
    } finally {
      setLoading(false)
    }
  }

  const totalPolicies = leaveBalances.length
  const activePolicies = leaveBalances.filter(l => l.total > 0).length
  const inactivePolicies = totalPolicies - activePolicies
  const leaveTypes = new Set(leaveBalances.map(l => l.type)).size

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-sm font-semibold text-slate-500">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Policies', value: totalPolicies, sublabel: 'View all leave policies', icon: FileText, color: 'text-blue-700', bg: 'bg-blue-50' },
          { label: 'Active Policies', value: activePolicies, sublabel: 'Currently applicable', icon: CheckCircle, color: 'text-green-700', bg: 'bg-green-50' },
          { label: 'Inactive Policies', value: inactivePolicies, sublabel: 'Not currently active', icon: XCircle, color: 'text-slate-600', bg: 'bg-slate-50' },
          { label: 'Leave Types', value: leaveTypes, sublabel: 'Available leave types', icon: Umbrella, color: 'text-purple-700', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`rounded-2xl ${stat.bg} p-4 border border-white shadow-sm`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <span className={`text-3xl font-bold ${stat.color}`}>{stat.value}</span>
            </div>
            <p className="text-sm font-semibold text-slate-700">{stat.label}</p>
            <p className="text-xs text-slate-500">{stat.sublabel}</p>
          </motion.div>
        ))}
      </div>

      {/* Leave Balance Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Leave Balance</h2>
            <p className="text-sm text-slate-500">Current Year (Apr 2024 - Mar 2025)</p>
          </div>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
          {leaveBalances.map((leave, i) => {
            const Icon = LEAVE_ICONS[leave.type] || Umbrella
            const colors = LEAVE_COLORS[leave.type] || LEAVE_COLORS['Casual']
            const remaining = leave.total - leave.used
            const percentage = leave.total > 0 ? (remaining / leave.total) * 100 : 0

            return (
              <motion.div
                key={leave.type}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className={`rounded-xl ${colors.bg} p-4 border border-slate-100`}
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors.icon}`}>
                    <Icon className={`h-5 w-5 ${colors.text}`} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${colors.text}`}>{leave.type} Leave</p>
                  </div>
                </div>

                <div className="mb-2 flex items-baseline gap-1">
                  <span className={`text-3xl font-bold ${colors.text}`}>{remaining}</span>
                  <span className="text-sm text-slate-500">/ {leave.total}</span>
                </div>

                <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-white">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }}
                    className={`h-full ${colors.bar}`}
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Total: {leave.total} Days</span>
                  <button className={`font-medium ${colors.text} hover:underline`}>View details</button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Quick Actions & Upcoming Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="border-b border-slate-100 px-6 py-4">
            <h3 className="text-base font-bold text-slate-900">Quick Actions</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {QUICK_ACTIONS.map((action, i) => (
              <button
                key={action.id}
                onClick={() => onNavigate?.(action.id)}
                className="flex w-full items-center gap-3 px-6 py-3 transition hover:bg-slate-50"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.bg}`}>
                  <action.icon className={`h-5 w-5 ${action.color}`} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-slate-800">{action.label}</p>
                  <p className="text-xs text-slate-500">{action.sublabel}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Leave / Holidays */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h3 className="text-base font-bold text-slate-900">Upcoming Leave / Holidays</h3>
            <button className="text-xs font-medium text-blue-600 hover:underline">View Calendar</button>
          </div>
          <div className="divide-y divide-slate-100">
            {MOCK_HOLIDAYS.map((holiday, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-3">
                <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-blue-50 border border-blue-100">
                  <span className="text-lg font-bold text-blue-700">{holiday.date}</span>
                  <span className="text-[10px] font-semibold uppercase text-blue-600">{holiday.month}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">{holiday.name}</p>
                  <p className="text-xs text-slate-500">{holiday.day}</p>
                </div>
                <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700">
                  {holiday.type}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Requests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h3 className="text-base font-bold text-slate-900">Recent Requests</h3>
            <button className="text-xs font-medium text-blue-600 hover:underline">View All</button>
          </div>
          <div className="divide-y divide-slate-100">
            {recentRequests.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <p className="text-sm text-slate-400">No recent requests</p>
              </div>
            ) : (
              recentRequests.map((req, i) => {
                const config = STATUS_CONFIG[req.status] || STATUS_CONFIG.Pending
                const Icon = config.icon
                return (
                  <div key={i} className="flex items-start gap-3 px-6 py-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${config.bg}`}>
                      <Icon className={`h-5 w-5 ${config.text}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-800">{req.leave_type} Leave</p>
                      <p className="text-xs text-slate-500">{req.start_date} - {req.end_date}</p>
                    </div>
                    <span className={`rounded-full ${config.bg} px-2 py-0.5 text-xs font-semibold ${config.text}`}>
                      {req.status}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </motion.div>
      </div>

      {/* Company Announcements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Company Announcements</h3>
          </div>
        </div>
        <div className="p-6">
          {MOCK_ANNOUNCEMENTS.map((announcement, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="flex-1">
                <p className="mb-1 text-sm font-semibold text-slate-800">{announcement.title}</p>
                <p className="mb-2 text-sm text-slate-600">{announcement.description}</p>
                <p className="text-xs text-slate-400">{announcement.date}</p>
              </div>
              <div className="flex-shrink-0">
                <img src="/api/placeholder/120/80" alt="Announcement" className="rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
