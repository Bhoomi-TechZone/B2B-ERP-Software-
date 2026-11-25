import { motion } from 'motion/react'

function AttendanceSummary() {
  const attendanceData = {
    present: 211,
    absent: 8,
    late: 15,
    total: 248,
    attendance: 85,
    onLeave: 14
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Today's Attendance Summary</h3>
        <span className="text-xs text-slate-500">Present / Absent / Late</span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-lg border-2 border-green-200 bg-green-50 p-4 text-center"
        >
          <div className="text-3xl font-bold text-green-700">{attendanceData.present}</div>
          <div className="mt-1 text-xs font-medium text-green-600">Present</div>
          <div className="mt-1 text-xs text-green-600/70">{attendanceData.attendance}% attendance</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-lg border-2 border-red-200 bg-red-50 p-4 text-center"
        >
          <div className="text-3xl font-bold text-red-700">{attendanceData.absent}</div>
          <div className="mt-1 text-xs font-medium text-red-600">Absent</div>
          <div className="mt-1 text-xs text-red-600/70">Unplanned</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-lg border-2 border-amber-200 bg-amber-50 p-4 text-center"
        >
          <div className="text-3xl font-bold text-amber-700">{attendanceData.late}</div>
          <div className="mt-1 text-xs font-medium text-amber-600">Late</div>
          <div className="mt-1 text-xs text-amber-600/70">&gt;15 min delay</div>
        </motion.div>
      </div>

      {/* On Leave */}
      <div className="mt-4 rounded-lg bg-blue-50 p-3 text-center">
        <span className="text-sm font-semibold text-blue-900">
          {attendanceData.onLeave} employees on scheduled leave today
        </span>
      </div>

      {/* Quick Action */}
      <button className="mt-4 w-full rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
        View Full Attendance Report →
      </button>
    </div>
  )
}

export default AttendanceSummary
