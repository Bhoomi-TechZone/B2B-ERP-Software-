import { motion } from 'motion/react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

function TeamHealthWidget() {
  const departments = [
    { name: 'Engineering', headcount: 85, onLeave: 3, avgLeaveBalance: 12.5, trend: 'up' },
    { name: 'Sales', headcount: 42, onLeave: 2, avgLeaveBalance: 8.3, trend: 'stable' },
    { name: 'Marketing', headcount: 28, onLeave: 1, avgLeaveBalance: 14.2, trend: 'up' },
    { name: 'HR & Admin', headcount: 15, onLeave: 0, avgLeaveBalance: 10.1, trend: 'down' },
    { name: 'Finance', headcount: 22, onLeave: 1, avgLeaveBalance: 15.8, trend: 'up' },
    { name: 'Operations', headcount: 56, onLeave: 7, avgLeaveBalance: 6.4, trend: 'down' }
  ]

  const trendIcons = {
    up: { icon: TrendingUp, color: 'text-green-600', label: 'Growing' },
    down: { icon: TrendingDown, color: 'text-red-600', label: 'Shrinking' },
    stable: { icon: Minus, color: 'text-slate-600', label: 'Stable' }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Department Health</h3>
        <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">
          Full Report →
        </button>
      </div>

      <div className="space-y-3">
        {departments.map((dept, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-lg border border-slate-200 bg-slate-50 p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">{dept.name}</h4>
                  <span className={`${trendIcons[dept.trend].color}`}>
                    {(() => { const Icon = trendIcons[dept.trend].icon; return <Icon className="h-4 w-4" />; })()}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <div className="font-semibold text-slate-500">Headcount</div>
                    <div className="mt-0.5 text-lg font-bold text-slate-900">{dept.headcount}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-500">On Leave</div>
                    <div className="mt-0.5 text-lg font-bold text-orange-600">{dept.onLeave}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-500">Avg Leave</div>
                    <div className="mt-0.5 text-lg font-bold text-blue-600">{dept.avgLeaveBalance}d</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar for Availability */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Availability</span>
                <span className="font-bold">{Math.round(((dept.headcount - dept.onLeave) / dept.headcount) * 100)}%</span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-linear-to-r from-green-500 to-emerald-600"
                  style={{ width: `${((dept.headcount - dept.onLeave) / dept.headcount) * 100}%` }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default TeamHealthWidget
