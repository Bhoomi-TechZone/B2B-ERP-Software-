import { motion } from 'motion/react'

function PayrollCostChart() {
  const monthlyData = [
    { month: 'Oct', gross: 2.2, deductions: 0.4, net: 1.8 },
    { month: 'Nov', gross: 2.3, deductions: 0.42, net: 1.88 },
    { month: 'Dec', gross: 2.5, deductions: 0.48, net: 2.02 },
    { month: 'Jan', gross: 2.4, deductions: 0.45, net: 1.95 },
    { month: 'Feb', gross: 2.35, deductions: 0.43, net: 1.92 },
    { month: 'Mar', gross: 2.42, deductions: 0.44, net: 1.98 },
    { month: 'Apr', gross: 2.46, deductions: 0.48, net: 1.98 },
  ]

  const maxValue = 3

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Payroll Cost Trend</h3>
          <p className="text-sm text-slate-600">Monthly payroll in Crores (₹)</p>
        </div>
        <div className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
          ₹1.98 Cr this month
        </div>
      </div>

      {/* Line Chart Simulation */}
      <div className="relative h-40">
        <svg className="h-full w-full" viewBox="0 0 700 160">
          {/* Grid Lines */}
          <line x1="0" y1="40" x2="700" y2="40" stroke="#e2e8f0" strokeWidth="1" />
          <line x1="0" y1="80" x2="700" y2="80" stroke="#e2e8f0" strokeWidth="1" />
          <line x1="0" y1="120" x2="700" y2="120" stroke="#e2e8f0" strokeWidth="1" />

          {/* Gross Payroll Line */}
          <motion.polyline
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            points={monthlyData
              .map((d, i) => `${(i * 100) + 50},${160 - (d.gross / maxValue) * 140}`)
              .join(' ')}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Net Payroll Line */}
          <motion.polyline
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 0.3, ease: 'easeInOut' }}
            points={monthlyData
              .map((d, i) => `${(i * 100) + 50},${160 - (d.net / maxValue) * 140}`)
              .join(' ')}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Data Points */}
          {monthlyData.map((d, i) => (
            <g key={i}>
              <circle
                cx={(i * 100) + 50}
                cy={160 - (d.gross / maxValue) * 140}
                r="4"
                fill="#3b82f6"
              />
              <circle
                cx={(i * 100) + 50}
                cy={160 - (d.net / maxValue) * 140}
                r="4"
                fill="#10b981"
              />
            </g>
          ))}
        </svg>
      </div>

      {/* Month Labels */}
      <div className="mt-2 flex justify-between px-4 text-xs font-semibold text-slate-600">
        {monthlyData.map((d) => (
          <div key={d.month}>{d.month}</div>
        ))}
      </div>

      {/* Legend & Stats */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-blue-50 p-3">
          <div className="mb-1 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            <div className="text-xs text-blue-600">Gross Payroll</div>
          </div>
          <div className="text-xl font-bold text-blue-900">₹2.46 Cr</div>
          <div className="text-xs text-blue-700">+1.6% vs last month</div>
        </div>
        <div className="rounded-lg bg-green-50 p-3">
          <div className="mb-1 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <div className="text-xs text-green-600">Net Payable</div>
          </div>
          <div className="text-xl font-bold text-green-900">₹1.98 Cr</div>
          <div className="text-xs text-green-700">After deductions</div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="mt-4 rounded-lg bg-slate-50 p-3">
        <div className="text-xs font-semibold text-slate-700">Breakdown (April 2026)</div>
        <div className="mt-2 space-y-1 text-xs text-slate-600">
          <div className="flex justify-between">
            <span>Gross Salary:</span>
            <span className="font-semibold text-slate-900">₹2.46 Cr</span>
          </div>
          <div className="flex justify-between">
            <span>PF Deduction:</span>
            <span className="font-semibold text-red-600">₹32 L</span>
          </div>
          <div className="flex justify-between">
            <span>TDS:</span>
            <span className="font-semibold text-red-600">₹12 L</span>
          </div>
          <div className="flex justify-between">
            <span>Other:</span>
            <span className="font-semibold text-red-600">₹4 L</span>
          </div>
          <div className="flex justify-between border-t pt-1 font-semibold">
            <span>Net Payable:</span>
            <span className="text-green-700">₹1.98 Cr</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PayrollCostChart
