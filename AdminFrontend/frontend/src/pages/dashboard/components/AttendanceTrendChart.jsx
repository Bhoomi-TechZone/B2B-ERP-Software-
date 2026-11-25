import { motion } from 'motion/react'

function AttendanceTrendChart() {
  const weekData = [
    { day: 'Mon', present: 236, absent: 12 },
    { day: 'Tue', present: 241, absent: 7 },
    { day: 'Wed', present: 238, absent: 10 },
    { day: 'Thu', present: 243, absent: 5 },
    { day: 'Fri', present: 235, absent: 13 },
    { day: 'Sat', present: 228, absent: 20 },
    { day: 'Today', present: 211, absent: 8 },
  ]

  const maxValue = 250
  const totalEmployees = 248

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Attendance Trend</h3>
          <p className="text-sm text-slate-600">Last 7 days overview</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <span className="text-slate-600">Present</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <span className="text-slate-600">Absent</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="space-y-3">
        {weekData.map((data, index) => (
          <motion.div
            key={data.day}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 text-xs font-semibold text-slate-600">{data.day}</div>
              <div className="flex-1">
                <div className="flex h-8 overflow-hidden rounded-lg bg-slate-100">
                  {/* Present Bar */}
                  <div
                    className="flex items-center justify-center bg-green-500 text-xs font-semibold text-white transition-all"
                    style={{ width: `${(data.present / totalEmployees) * 100}%` }}
                  >
                    {data.present > totalEmployees * 0.3 && data.present}
                  </div>
                  {/* Absent Bar */}
                  <div
                    className="flex items-center justify-center bg-red-500 text-xs font-semibold text-white transition-all"
                    style={{ width: `${(data.absent / totalEmployees) * 100}%` }}
                  >
                    {data.absent > totalEmployees * 0.05 && data.absent}
                  </div>
                </div>
              </div>
              <div className="w-16 text-right text-xs font-semibold text-slate-900">
                {((data.present / totalEmployees) * 100).toFixed(1)}%
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-4 rounded-lg bg-blue-50 p-3">
        <div className="text-sm text-blue-900">
          <span className="font-semibold">Average Attendance:</span> 95.8% this week
        </div>
      </div>
    </div>
  )
}

export default AttendanceTrendChart
