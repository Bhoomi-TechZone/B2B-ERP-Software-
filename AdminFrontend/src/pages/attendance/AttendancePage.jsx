import { memo } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import { CalendarDays, CalendarRange, ClipboardList, Fingerprint } from 'lucide-react'
import { useRole } from '../../hooks/useRole'

const AttendancePage = memo(() => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isSales } = useRole()

  const SUB_TABS = isSales
    ? [
        { path: '/attendance/daily',    label: 'My Attendance',  icon: CalendarDays  },
        { path: '/attendance/monthly',  label: 'My Calendar',    icon: CalendarRange },
        { path: '/attendance/requests', label: 'My Requests',    icon: ClipboardList },
      ]
    : [
        { path: '/attendance/daily',     label: 'Daily Attendance', icon: CalendarDays  },
        { path: '/attendance/monthly',   label: 'Monthly View',     icon: CalendarRange },
        { path: '/attendance/requests',  label: 'Requests',         icon: ClipboardList },
        { path: '/attendance/biometric', label: 'Biometric API',    icon: Fingerprint   },
      ]

  const activePath =
    location.pathname === '/attendance' ? '/attendance/daily' : location.pathname

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#F7F8FA]">
      {/* Sub Navigation */}
      <div className="shrink-0 border-b border-slate-200 bg-white px-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {SUB_TABS.map((tab) => {
              const active = activePath === tab.path
              return (
                <button
                  key={tab.path}
                  onClick={() => navigate(tab.path)}
                  className={`relative flex items-center gap-2 px-4 py-4 text-sm font-medium transition-colors ${
                    active ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                  {active && (
                    <motion.div
                      layoutId="attendance-tab-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-blue-600"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              )
            })}
          </div>

          {/* Role badge */}
          <div className={`mr-1 rounded-lg px-3 py-1 text-xs font-bold uppercase ${
            isSales ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
          }`}>
            {isSales ? 'My View' : 'Manager View'}
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  )
})

AttendancePage.displayName = 'AttendancePage'
export default AttendancePage
