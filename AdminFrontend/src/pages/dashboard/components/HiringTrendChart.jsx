import { motion } from 'motion/react'

function HiringTrendChart() {
  const monthlyData = [
    { month: 'Oct', hires: 8, exits: 3 },
    { month: 'Nov', hires: 12, exits: 1 },
    { month: 'Dec', hires: 6, exits: 4 },
    { month: 'Jan', hires: 15, exits: 2 },
    { month: 'Feb', hires: 10, exits: 5 },
    { month: 'Mar', hires: 18, exits: 3 },
    { month: 'Apr', hires: 12, exits: 0 },
  ]

  const maxValue = 20

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Hiring Trend</h3>
          <p className="text-sm text-slate-600">Last 7 months</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-blue-500"></div>
            <span className="text-slate-600">New Hires</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <span className="text-slate-600">Exits</span>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="flex h-48 items-end justify-between gap-2">
        {monthlyData.map((data, index) => (
          <motion.div
            key={data.month}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: index * 0.1, type: 'spring' }}
            className="flex flex-1 flex-col items-center gap-2"
          >
            {/* Bars Container */}
            <div className="flex w-full items-end justify-center gap-1">
              {/* Hires Bar */}
              <div
                className="w-full rounded-t-lg bg-blue-500 transition-all hover:bg-blue-600"
                style={{ height: `${(data.hires / maxValue) * 150}px` }}
                title={`New Hires: ${data.hires}`}
              ></div>
              {/* Exits Bar */}
              <div
                className="w-full rounded-t-lg bg-red-500 transition-all hover:bg-red-600"
                style={{ height: `${(data.exits / maxValue) * 150}px` }}
                title={`Exits: ${data.exits}`}
              ></div>
            </div>
            {/* Month Label */}
            <div className="text-xs font-semibold text-slate-600">{data.month}</div>
          </motion.div>
        ))}
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-green-50 p-3 text-center">
          <div className="text-xs text-green-600">Total Hires</div>
          <div className="text-2xl font-bold text-green-900">81</div>
        </div>
        <div className="rounded-lg bg-red-50 p-3 text-center">
          <div className="text-xs text-red-600">Total Exits</div>
          <div className="text-2xl font-bold text-red-900">18</div>
        </div>
        <div className="rounded-lg bg-blue-50 p-3 text-center">
          <div className="text-xs text-blue-600">Net Growth</div>
          <div className="text-2xl font-bold text-blue-900">+63</div>
        </div>
      </div>
    </div>
  )
}

export default HiringTrendChart
