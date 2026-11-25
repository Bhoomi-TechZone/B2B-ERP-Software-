import { useState, useEffect } from 'react'
import { NavLink, Outlet, useLocation, Navigate } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  FileText, BarChart2, PlusCircle, ClipboardList, CalendarDays,
} from 'lucide-react'
import { getPolicies } from './data/leaveData'
import { useAuth } from "../../hooks/useAuth"

const FLOW = ['Policy', 'Assignment', 'Balance', 'Request', 'Approval', 'Attendance', 'Payroll']

export default function LeaveLayout() {
  const location = useLocation()
  const { user, role: authRole } = useAuth()

  // ✅ SAFE ROLE HANDLING — role is at context top level, NOT inside user
  const role = authRole ?? localStorage.getItem("role") ?? "employee"
  const isEmployee = role === 'employee'

  const [stats, setStats] = useState({
    activePolicies: 0,
    pendingRequests: 0,
    approvedThisMonth: 0,
    onLeaveToday: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const policies = await getPolicies()
        const list = Array.isArray(policies) ? policies : []

        setStats(prev => ({
          ...prev,
          activePolicies: list.filter(p => p.status?.toLowerCase() === 'active').length,
        }))
      } catch (err) {
        console.error('Failed to fetch leave stats:', err)
      }
    }

    fetchStats()
  }, [location.pathname])

  // ❗ Route guard ONLY after user is loaded
  if (user && !isEmployee && location.pathname.startsWith('/leave/apply')) {
    return <Navigate to="/leave/policies" replace />
  }

  const TABS = [
    { path: '/leave/policies', label: 'Policies', icon: FileText, count: stats.activePolicies },
    { path: '/leave/balance', label: 'Balance', icon: BarChart2, count: null },

    // ✅ ONLY EMPLOYEE
    ...(isEmployee
      ? [{ path: '/leave/apply', label: 'Apply Leave', icon: PlusCircle, count: null }]
      : []),

    { path: '/leave/requests', label: 'Requests', icon: ClipboardList, count: stats.pendingRequests },
    { path: '/leave/calendar', label: 'Calendar', icon: CalendarDays, count: null },
  ]

  const flowIdx = (() => {
    if (location.pathname.includes('policies')) return 0
    if (location.pathname.includes('balance')) return 2
    if (location.pathname.includes('apply')) return 3
    if (location.pathname.includes('requests')) return 4
    if (location.pathname.includes('calendar')) return 5
    return 0
  })()

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#F7F8FA]">

      {/* HEADER */}
      <div className="shrink-0 border-b border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Leave Management</h1>
            <p className="text-sm text-slate-500">
              Policy → Assignment → Balance → Request → Approval
            </p>
          </div>

          {/* STATS */}
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Active Policies', value: stats.activePolicies, color: 'text-blue-700 bg-blue-50' },
              { label: 'Pending', value: stats.pendingRequests, color: 'text-amber-700 bg-amber-50' },
              { label: 'Approved', value: stats.approvedThisMonth, color: 'text-emerald-700 bg-emerald-50' },
              { label: 'On Leave Today', value: stats.onLeaveToday, color: 'text-rose-700 bg-rose-50' },
            ].map(s => (
              <div key={s.label} className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm ${s.color}`}>
                <span className="text-lg font-bold">{s.value}</span>
                <span className="text-xs opacity-70">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FLOW */}
        <div className="flex items-center gap-0 overflow-x-auto px-6 pb-3 [&::-webkit-scrollbar]:hidden">
          {FLOW.map((step, i) => (
            <div key={step} className="flex items-center shrink-0">
              <div className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                i <= flowIdx ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'
              }`}>
                {step}
              </div>

              {i < FLOW.length - 1 && (
                <div className={`mx-1 h-px w-5 ${i < flowIdx ? 'bg-slate-900' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* TABS */}
        <div className="flex overflow-x-auto border-t border-slate-100 px-6 [&::-webkit-scrollbar]:hidden">
          {TABS.map(tab => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `relative flex items-center gap-2 px-4 py-3 text-sm font-medium ${
                  isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <tab.icon className="h-4 w-4" />
                  {tab.label}

                  {tab.count !== null && tab.count > 0 && (
                    <span className="rounded-full px-1.5 py-0.5 text-[10px] bg-slate-100 text-slate-500">
                      {tab.count}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-hidden">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="h-full overflow-auto"
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  )
}