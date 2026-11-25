import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { Clock, Calendar, CheckSquare, Megaphone, Settings, User, Compass, Play, Square, RefreshCw, AlertCircle, CheckCircle2, XCircle, ArrowRight } from 'lucide-react'

import { useAuth } from '../../../hooks/useAuth'
import employeeService from '../../../services/employeeService'
import attendanceService from '../../../services/attendanceService'

/* ─── Robust UTC Date Parser ───────────────────────────────────── */
const parseUtcDate = (dateStr) => {
  if (!dateStr) return null
  const hasTimezone = dateStr.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(dateStr)
  return new Date(hasTimezone ? dateStr : dateStr + 'Z')
}

/* ─── Live Clock ───────────────────────────────────────────────── */
const LiveClock = () => {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <span className="font-mono text-base font-bold text-slate-700">
      {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
    </span>
  )
}

/* ─── Elapsed Timer ────────────────────────────────────────────── */
const ElapsedTimer = ({ since }) => {
  const [elapsed, setElapsed] = useState('00:00:00')
  useEffect(() => {
    if (!since) return
    const sinceMs = parseUtcDate(since).getTime()
    const tick = () => {
      const diff = Date.now() - sinceMs
      if (diff < 0) { setElapsed('00:00:00'); return }
      const h = Math.floor(diff / 3_600_000)
      const m = Math.floor((diff % 3_600_000) / 60_000)
      const s = Math.floor((diff % 60_000) / 1_000)
      setElapsed(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [since])
  return <span className="font-mono text-sm font-bold text-emerald-600">{elapsed}</span>
}

export default function MyAttendancePage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [punchLoading, setPunchLoading] = useState(false)
  const [todaySummary, setTodaySummary] = useState(null)
  const [attendanceLogs, setAttendanceLogs] = useState([])
  const [profile, setProfile] = useState(null)

  const clockedIn = todaySummary?.status === 'Clocked In'
  const checkInTime = todaySummary?.check_in_time || null

  const fetchAttendanceData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      // 1. Fetch dashboard summary (contains today's attendance summary)
      const summaryData = await employeeService.getDashboardSummary()
      setTodaySummary(summaryData.today_attendance || null)

      // 2. Fetch employee profile to get employee UUID
      const empProfile = await employeeService.getEmployee('me')
      setProfile(empProfile)

      // 3. Fetch past 30 days of attendance logs
      const todayStr = new Date().toISOString().split('T')[0]
      const thirtyDaysAgoStr = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const logs = await employeeService.getEmployeeAttendanceLogs(empProfile.id, thirtyDaysAgoStr, todayStr)
      setAttendanceLogs(Array.isArray(logs) ? logs : [])
    } catch (err) {
      console.error('Failed to load attendance details:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchAttendanceData()
  }, [fetchAttendanceData])

  const handlePunch = async () => {
    setPunchLoading(true)
    try {
      let location = null
      if (navigator.geolocation) {
        const getPosition = () => new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            (err) => reject(err),
            { enableHighAccuracy: true, timeout: 10000 }
          )
        })
        try {
          location = await getPosition()
        } catch (err) {
          console.warn('Geolocation failed:', err)
          if (err.code === 1) {
            alert('Location access is denied. Please enable location permission to clock in/out.')
            setPunchLoading(false)
            return
          }
        }
      }

      const action = clockedIn ? 'check_out' : 'check_in'
      await attendanceService.punch({
        action,
        work_mode: 'office',
        location,
        notes: `${clockedIn ? 'Clocked out' : 'Clocked in'} from My Attendance Page`,
      })
      await fetchAttendanceData(true)
    } catch (err) {
      alert(err.message || 'Punch action failed.')
    } finally {
      setPunchLoading(false)
    }
  }

  // Calculate stats for the current month
  const stats = useMemo(() => {
    const totalDays = attendanceLogs.length
    const present = attendanceLogs.filter(l => l.status?.toLowerCase() === 'present' || l.status?.toLowerCase() === 'clocked in' || l.status?.toLowerCase() === 'clocked out').length
    const late = attendanceLogs.filter(l => l.status?.toLowerCase() === 'late').length
    const absent = attendanceLogs.filter(l => l.status?.toLowerCase() === 'absent').length
    const attendancePercentage = totalDays > 0 ? ((present / totalDays) * 100).toFixed(2) : '100.00'

    return {
      presentDays: present,
      absentDays: absent,
      lateDays: late,
      percentage: attendancePercentage
    }
  }, [attendanceLogs])

  // Get weekday indicators (Mon-Sun)
  const weeklyStatus = useMemo(() => {
    const today = new Date()
    const currentDay = today.getDay() // 0 = Sun, 1 = Mon ...
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1)) // Set to Monday

    const days = []
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]

      const log = attendanceLogs.find(l => {
        const logDate = l.date ? l.date.split('T')[0] : (l.check_in_at ? l.check_in_at.split('T')[0] : null)
        return logDate === dateStr
      })

      let type = '-' // default no-data
      if (log) {
        const s = log.status?.toLowerCase()
        if (s === 'absent') type = 'A'
        else if (s === 'late') type = 'L'
        else if (s === 'on_leave' || s === 'leave') type = 'H' // Treat holiday/leave as H
        else type = 'P'
      } else {
        const isWeekend = date.getDay() === 0 || date.getDay() === 6
        if (isWeekend) type = 'H'
      }

      days.push({
        label: dayLabels[i],
        date: date.getDate(),
        status: type
      })
    }
    return days
  }, [attendanceLogs])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-600 border-t-transparent mx-auto"></div>
          <p className="mt-2 text-sm text-slate-500">Loading attendance data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-slate-50/50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-500">
            <span>Dashboard</span> <span className="mx-1">/</span> <span>Attendance</span> <span className="mx-1">/</span> <span className="text-slate-800 font-semibold">My Attendance</span>
          </div>
          <button onClick={() => fetchAttendanceData(true)} disabled={refreshing} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-50">
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <h2 className="text-2xl font-bold text-slate-850">My Attendance</h2>

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          
          {/* Left Block: Today's Overview */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 text-lg">Today's Overview</h3>
                <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-bold text-green-700">
                  {todaySummary?.status || 'Not Started'}
                </span>
              </div>

              <div className="mb-4">
                <p className="text-xs text-slate-400 font-semibold uppercase">Date</p>
                <p className="text-sm font-bold text-slate-700 mt-0.5">
                  {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Check In</p>
                  <p className="text-sm font-bold text-slate-800 mt-1">
                    {todaySummary?.check_in_time 
                      ? parseUtcDate(todaySummary.check_in_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) 
                      : '--:--'
                    }
                  </p>
                </div>
                <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Check Out</p>
                  <p className="text-sm font-bold text-slate-800 mt-1">
                    {todaySummary?.check_out_time 
                      ? parseUtcDate(todaySummary.check_out_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) 
                      : '--:--'
                    }
                  </p>
                </div>
              </div>

              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100 mb-6 flex justify-between items-center">
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase">Total Hours</p>
                  <p className="text-lg font-bold text-slate-800 mt-0.5">
                    {todaySummary?.hours_so_far ? `${todaySummary.hours_so_far} hrs` : '0.00 hrs'}
                  </p>
                </div>
                {clockedIn && checkInTime && (
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Active Timer</span>
                    <ElapsedTimer since={checkInTime} />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {/* Punch Button */}
              <button
                type="button"
                onClick={handlePunch}
                disabled={punchLoading || todaySummary?.status === 'Clocked Out'}
                className={`w-full py-3 px-4 rounded-xl text-sm font-bold text-white shadow-sm flex items-center justify-center gap-2 cursor-pointer transition ${
                  clockedIn 
                    ? 'bg-rose-600 hover:bg-rose-700' 
                    : 'bg-violet-600 hover:bg-violet-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {punchLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : clockedIn ? (
                  <Square className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {clockedIn ? 'Clock Out' : 'Clock In'}
              </button>

              <button
                onClick={() => navigate('/attendance/my-logs')}
                className="w-full py-3 px-4 rounded-xl text-sm font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5"
              >
                View Monthly Logs
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Right Block: Stats & Weekly status */}
          <div className="space-y-6">
            
            {/* Top Stat widgets */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-slate-800 text-sm mb-4">Attendance Summary <span className="text-xs text-slate-400 font-normal">({new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })})</span></h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Present Days', value: stats.presentDays, color: 'text-green-600', dot: 'bg-green-500' },
                  { label: 'Absent Days', value: stats.absentDays, color: 'text-red-500', dot: 'bg-red-500' },
                  { label: 'Late Days', value: stats.lateDays, color: 'text-amber-500', dot: 'bg-amber-500' },
                  { label: 'Attendance %', value: `${stats.percentage}%`, color: 'text-violet-600', dot: 'bg-violet-500' },
                ].map((s, idx) => (
                  <div key={idx} className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                    <div className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />
                    <div>
                      <p className="text-xl font-bold text-slate-800">{s.value}</p>
                      <p className="text-xs text-slate-400 mt-0.5 font-medium">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly calendar overview */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-slate-800 text-sm mb-4 font-bold">This Week Overview</h3>
              <div className="grid grid-cols-7 gap-2">
                {weeklyStatus.map((day, idx) => {
                  const circleBg = 
                    day.status === 'P' ? 'bg-green-500 text-white shadow-sm shadow-green-100' :
                    day.status === 'A' ? 'bg-red-400 text-white shadow-sm shadow-red-100' :
                    day.status === 'L' ? 'bg-amber-400 text-white shadow-sm shadow-amber-100' :
                    day.status === 'H' ? 'bg-slate-100 text-slate-400' : 'bg-slate-50/50 text-slate-300 border border-slate-200/50'

                  return (
                    <div key={idx} className="flex flex-col items-center">
                      <p className="text-xs font-bold text-slate-400 mb-2">{day.label}</p>
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold ${circleBg}`}>
                        {day.status}
                      </div>
                      <p className="text-[10px] text-slate-400 font-semibold mt-1.5">{day.date}</p>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Block: Recent Punch Activity Table */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 text-lg mb-4">Recent Punch Activity</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Check In</th>
                  <th className="px-4 py-3">Check Out</th>
                  <th className="px-4 py-3">Total Hours</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendanceLogs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-slate-400 text-xs italic">
                      No punch activity recorded in the last 30 days
                    </td>
                  </tr>
                ) : (
                  attendanceLogs.slice(0, 10).map((log, index) => {
                    const statusColor = 
                      log.status?.toLowerCase() === 'absent' ? 'bg-red-50 text-red-600 border-red-100' :
                      log.status?.toLowerCase() === 'late' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      'bg-green-50 text-green-600 border-green-100'

                    return (
                      <tr key={log.id || index} className="hover:bg-slate-50/50 transition">
                        <td className="px-4 py-3 font-semibold text-slate-800">
                          {log.date 
                            ? new Date(log.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) 
                            : (log.check_in_at 
                              ? new Date(log.check_in_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) 
                              : '—'
                            )
                          }
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-600">
                          {log.check_in_at 
                            ? parseUtcDate(log.check_in_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) 
                            : '—'
                          }
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-600">
                          {log.check_out_at 
                            ? parseUtcDate(log.check_out_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) 
                            : '—'
                          }
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-700">
                          {log.total_hours !== undefined && log.total_hours !== null && !isNaN(Number(log.total_hours))
                             ? `${Number(log.total_hours).toFixed(2)} hrs`
                             : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold border ${statusColor}`}>
                            {log.status || 'Present'}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
