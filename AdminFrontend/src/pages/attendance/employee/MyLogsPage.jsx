import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Calendar, ChevronLeft, ChevronRight, List, Grid, RefreshCw } from 'lucide-react'

import { useAuth } from '../../../hooks/useAuth'
import employeeService from '../../../services/employeeService'

const parseUtcDate = (dateStr) => {
  if (!dateStr) return null
  const hasTimezone = dateStr.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(dateStr)
  return new Date(hasTimezone ? dateStr : dateStr + 'Z')
}

const getLocalDateStr = (isoStr) => {
  if (!isoStr) return null
  const dateObj = parseUtcDate(isoStr)
  if (!dateObj || isNaN(dateObj.getTime())) return null
  const y = dateObj.getFullYear()
  const m = String(dateObj.getMonth() + 1).padStart(2, '0')
  const d = String(dateObj.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function MyLogsPage() {
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [attendanceLogs, setAttendanceLogs] = useState([])
  const [profile, setProfile] = useState(null)
  
  // Date selector state
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('calendar') // 'calendar' or 'list'

  const fetchMonthLogs = useCallback(async (date, silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      let empProfile = profile
      if (!empProfile) {
        empProfile = await employeeService.getEmployee('me')
        setProfile(empProfile)
      }

      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const lastDay = new Date(year, month, 0).getDate()
      
      const startDateStr = `${year}-${String(month).padStart(2, '0')}-01`
      const endDateStr = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

      const logs = await employeeService.getEmployeeAttendanceLogs(empProfile.id, startDateStr, endDateStr)
      setAttendanceLogs(Array.isArray(logs) ? logs : [])
    } catch (err) {
      console.error('Failed to fetch monthly logs:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [profile])

  useEffect(() => {
    fetchMonthLogs(currentDate)
  }, [currentDate, fetchMonthLogs])

  const changeMonth = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  // Monthly stats calculations
  const stats = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const today = new Date()

    let present = 0
    let absent = 0
    let late = 0
    let holiday = 0

    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    // Loop through each day of the month to calculate status
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day)
      const dow = d.getDay()
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

      const log = attendanceLogs.find(l => {
        if (l.date) return l.date.split('T')[0] === dateStr
        if (l.check_in_at) return getLocalDateStr(l.check_in_at) === dateStr
        return false
      })

      if (log) {
        const s = log.status?.toLowerCase()
        if (s === 'absent') absent++
        else if (s === 'late') late++
        else if (s === 'on_leave' || s === 'leave') holiday++
        else present++
      } else {
        const isWeekend = dow === 0 || dow === 6
        if (isWeekend) {
          holiday++
        } else if (d < todayStart) {
          absent++ // Past days with no logs are absent
        }
      }
    }

    const totalTracked = present + absent + late
    const percentage = totalTracked > 0 ? ((present / totalTracked) * 100).toFixed(1) : '100.0'

    return {
      present,
      absent,
      late,
      holiday,
      percentage
    }
  }, [attendanceLogs, currentDate])

  // Calendar cells mapping
  const calendarCells = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDayIndex = new Date(year, month, 1).getDay()
    // Shift index so Monday is 0: (day + 6) % 7
    const offset = (firstDayIndex + 6) % 7
    const today = new Date()

    const cells = []

    // Empty spaces for offset
    for (let i = 0; i < offset; i++) {
      cells.push({ empty: true })
    }

    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    // Days in month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

      const log = attendanceLogs.find(l => {
        if (l.date) return l.date.split('T')[0] === dateStr
        if (l.check_in_at) return getLocalDateStr(l.check_in_at) === dateStr
        return false
      })

      let type = 'unmarked'
      let logData = null

      if (log) {
        logData = log
        const s = log.status?.toLowerCase()
        if (s === 'absent') type = 'absent'
        else if (s === 'late') type = 'late'
        else if (s === 'on_leave' || s === 'leave') type = 'holiday'
        else type = 'present'
      } else {
        const isWeekend = date.getDay() === 0 || date.getDay() === 6
        if (isWeekend) type = 'holiday'
        else if (date < todayStart) type = 'absent'
      }

      cells.push({
        day,
        type,
        log: logData,
        isToday: date.toDateString() === today.toDateString()
      })
    }

    return cells
  }, [attendanceLogs, currentDate])

  // List view days mapping (all days of the selected month)
  const listViewDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const listDays = []

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

      const log = attendanceLogs.find(l => {
        if (l.date) return l.date.split('T')[0] === dateStr
        if (l.check_in_at) return getLocalDateStr(l.check_in_at) === dateStr
        return false
      })

      let type = 'absent'
      let logData = null

      if (log) {
        logData = log
        const s = log.status?.toLowerCase()
        if (s === 'absent') type = 'absent'
        else if (s === 'late') type = 'late'
        else if (s === 'on_leave' || s === 'leave') type = 'holiday'
        else type = 'present'
      } else {
        const isWeekend = date.getDay() === 0 || date.getDay() === 6
        if (isWeekend) type = 'holiday'
        else if (date >= todayStart) type = 'unmarked' // Future days
      }

      listDays.push({
        day,
        type,
        log: logData,
        date
      })
    }
    return listDays
  }, [attendanceLogs, currentDate])

  return (
    <div className="min-h-full bg-slate-50/50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Breadcrumbs */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-500">
            <span>Dashboard</span> <span className="mx-1">/</span> <span>Attendance</span> <span className="mx-1">/</span> <span className="text-slate-800 font-semibold">Monthly Logs</span>
          </div>
          <button onClick={() => fetchMonthLogs(currentDate, true)} disabled={refreshing} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-50">
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <h2 className="text-2xl font-bold text-slate-850">Monthly Logs</h2>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 pb-6 border-b border-slate-100">
            {/* Month switcher */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => changeMonth(-1)}
                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="font-bold text-slate-700 text-base min-w-[120px] text-center">
                {currentDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </span>
              <button 
                onClick={() => changeMonth(1)}
                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'calendar'
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Grid className="h-3.5 w-3.5" />
                Calendar View
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <List className="h-3.5 w-3.5" />
                List View
              </button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
            
            {/* Left Main View */}
            <div>
              {viewMode === 'calendar' ? (
                <div>
                  <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 uppercase mb-4">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                      <div key={d} className="py-1">{d}</div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {calendarCells.map((cell, idx) => {
                      if (cell.empty) {
                        return <div key={`empty-${idx}`} className="h-14 bg-slate-50/20 rounded-xl" />
                      }

                      const cellColor = 
                        cell.type === 'present' ? 'bg-green-500 text-white shadow-sm shadow-green-100' :
                        cell.type === 'absent' ? 'bg-red-400 text-white shadow-sm shadow-red-100' :
                        cell.type === 'late' ? 'bg-amber-400 text-white shadow-sm shadow-amber-100' :
                        cell.type === 'holiday' ? 'bg-slate-100 text-slate-400' : 
                        'bg-white border border-slate-200 text-slate-700 hover:border-slate-350'

                      return (
                        <div
                          key={`day-${cell.day}`}
                          className={`h-14 rounded-xl flex flex-col items-center justify-center relative cursor-pointer font-bold text-sm transition-all ${cellColor} ${
                            cell.isToday ? 'ring-2 ring-violet-500 ring-offset-2' : ''
                          }`}
                        >
                          <span>{cell.day}</span>
                          <span className="text-[9px] uppercase font-bold opacity-85 mt-0.5">
                            {cell.type === 'present' ? 'P' :
                             cell.type === 'absent' ? 'A' :
                             cell.type === 'late' ? 'L' :
                             cell.type === 'holiday' ? 'H' : ''}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                /* List View / Table */
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-650">
                    <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                      <tr>
                        <th className="px-4 py-3">Day</th>
                        <th className="px-4 py-3">Check In</th>
                        <th className="px-4 py-3">Check Out</th>
                        <th className="px-4 py-3">Hours</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {listViewDays.map((item, index) => {
                        const weekday = item.date.toLocaleDateString('en-IN', { weekday: 'short' })
                        const dayNum = String(item.day).padStart(2, '0')
                        const dayLabel = `${weekday} ${dayNum}`

                        const formatTime = (isoStr) => {
                          if (!isoStr) return '—'
                          const dateObj = parseUtcDate(isoStr)
                          if (!dateObj || isNaN(dateObj.getTime())) return '—'
                          return dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase()
                        }

                        const statusText = 
                          item.type === 'present' ? 'present' :
                          item.type === 'absent' ? 'absent' :
                          item.type === 'late' ? 'late' :
                          item.type === 'holiday' ? 'holiday' : '—'

                        const statusColor = 
                          item.type === 'present' ? 'bg-green-50 text-green-600 border-green-100' :
                          item.type === 'absent' ? 'bg-red-50 text-red-600 border-red-100' :
                          item.type === 'late' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          item.type === 'holiday' ? 'bg-slate-100 text-slate-500 border-slate-200' :
                          'bg-slate-50 text-slate-400 border-slate-100'

                        return (
                          <tr key={index} className="hover:bg-slate-50/50 transition">
                            <td className="px-4 py-3 font-semibold text-slate-800">
                              {dayLabel}
                            </td>
                            <td className="px-4 py-3 font-medium text-slate-600">
                              {item.log?.check_in_at ? formatTime(item.log.check_in_at) : '—'}
                            </td>
                            <td className="px-4 py-3 font-medium text-slate-600">
                              {item.log?.check_out_at ? formatTime(item.log.check_out_at) : '—'}
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-700">
                              {item.log?.total_hours !== undefined && item.log?.total_hours !== null && !isNaN(Number(item.log.total_hours))
                                ? `${Number(item.log.total_hours).toFixed(2)} hrs`
                                : '—'}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold border ${statusColor}`}>
                                {statusText}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Right Summary Block */}
            <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-sm mb-4">Monthly Summary</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Present Days', value: stats.present, color: 'bg-green-500' },
                    { label: 'Absent Days', value: stats.absent, color: 'bg-red-500' },
                    { label: 'Late Days', value: stats.late, color: 'bg-amber-500' },
                    { label: 'Holidays', value: stats.holiday, color: 'bg-slate-400' },
                  ].map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-100/50 last:border-0">
                      <div className="flex items-center gap-2">
                        <div className={`h-2.5 w-2.5 rounded-full ${s.color}`} />
                        <span className="text-xs text-slate-600 font-semibold">{s.label}</span>
                      </div>
                      <span className="text-sm font-bold text-slate-800">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress bar info */}
              <div className="pt-6 border-t border-slate-200">
                <div className="flex justify-between items-center text-xs font-bold text-slate-500 mb-2">
                  <span>Attendance Percentage</span>
                  <span className="text-violet-600">{stats.percentage}%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.percentage}%` }}
                    transition={{ duration: 0.6 }}
                    className="h-full bg-gradient-to-r from-violet-500 to-indigo-600 rounded-full"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
