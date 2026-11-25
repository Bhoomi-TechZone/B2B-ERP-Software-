import { memo } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import { LayoutDashboard, Zap, FileText, Globe } from 'lucide-react'

// ── Region config ──────────────────────────────────────────────────────────────
const REGIONS = [
  { code: 'in', label: '🇮🇳 India',  basePath: '/payroll/in',  color: 'from-orange-500 to-amber-500'  },
  { code: 'us', label: '🇺🇸 US',     basePath: '/payroll/us',  color: 'from-blue-600 to-indigo-600'   },
  { code: 'uk', label: '🇬🇧 UK',     basePath: '/payroll/uk',  color: 'from-rose-600 to-pink-600'     },
]

const SUB_TABS = [
  { suffix: 'dashboard', label: 'Dashboard',   icon: LayoutDashboard },
  { suffix: 'run',       label: 'Run Payroll', icon: Zap             },
  { suffix: 'payslips',  label: 'Payslips',    icon: FileText        },
]

const PayrollLayout = memo(() => {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  // Detect active region
  const activeRegion = REGIONS.find(r => pathname.startsWith(r.basePath)) ?? REGIONS[0]

  // Sub-tabs for current region
  const tabs = SUB_TABS.map(t => ({
    ...t,
    path: `${activeRegion.basePath}/${t.suffix}`,
  }))

  const isTabActive = (path) => pathname === path || pathname.startsWith(path + '/')

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#F7F8FA]">

      {/* ── Top bar: Region switcher + subtitle ─────────────────── */}
      <div className="shrink-0 border-b border-slate-200 bg-white px-6 pt-4 pb-0">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          {/* Title */}
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-semibold text-slate-700">Payroll Management</span>
          </div>

          {/* Region Switcher */}
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
            {REGIONS.map(r => {
              const active = activeRegion.code === r.code
              return (
                <motion.button
                  key={r.code}
                  onClick={() => navigate(`${r.basePath}/dashboard`)}
                  whileTap={{ scale: 0.96 }}
                  className={`relative rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    active
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {r.label}
                  {active && (
                    <motion.div
                      layoutId="region-indicator"
                      className={`absolute inset-0 rounded-lg bg-gradient-to-r ${r.color} opacity-15`}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </motion.button>
              )
            })}
          </div>

          {/* Cycle indicator */}
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            <span className="text-xs font-semibold text-slate-500">April 2026 · Active Cycle</span>
          </div>
        </div>

        {/* Sub-tabs */}
        <nav className="flex gap-1">
          {tabs.map(tab => {
            const active = isTabActive(tab.path)
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`relative flex items-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors ${
                  active ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                {active && (
                  <motion.div
                    layoutId={`payroll-tab-${activeRegion.code}`}
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-blue-600"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Page Content */}
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  )
})

PayrollLayout.displayName = 'PayrollLayout'
export default PayrollLayout
