import { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Search, Calendar, UserCheck, UserX, Clock, Plane,
  Check, X, Pencil, Download, RotateCcw, MapPin, Zap,
  ChevronLeft, ChevronRight, Lock, Play, Square
} from 'lucide-react'
import { DEPARTMENTS } from './data/attendanceData'
import StatusBadge from './components/StatusBadge'
import SkeletonRow from './components/SkeletonRow'
import StatsCard from './components/StatsCard'
import GeoLogCard from './components/GeoLogCard'
import { useRole } from '../../hooks/useRole'
import { useAuth } from '../../hooks/useAuth'
import attendanceService from '../../services/attendanceService'
import employeeService from '../../services/employeeService'

const PAGE_SIZE = 8

const parseUtcDate = (dateStr) => {
  if (!dateStr) return null
  const hasTimezone = dateStr.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(dateStr)
  return new Date(hasTimezone ? dateStr : dateStr + 'Z')
}

// Robust helper to format ISO UTC datetimes to local time strings
const formatTime = (isoString) => {
  if (!isoString) return '—'
  try {
    const dateObj = parseUtcDate(isoString)
    if (!dateObj || isNaN(dateObj.getTime())) return '—'
    return dateObj.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  } catch {
    return '—'
  }
}

// Convert working hours float to Xh Ym
const formatHours = (hours) => {
  if (!hours || hours <= 0) return '—'
  const hrs = Math.floor(hours)
  const mins = Math.round((hours - hrs) * 60)
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h 00m`
}

// Helper to combine UI time edit value ("09:05 AM") with selected date
const parseTimeInput = (timeStr, selectedDateStr) => {
  if (!timeStr || timeStr === '—' || timeStr.trim() === '') return null
  try {
    if (timeStr.includes('T')) return new Date(timeStr).toISOString()

    let hours = 0
    let minutes = 0
    const match = timeStr.match(/(\d+):(\d+)(?:\s*(AM|PM))?/i)
    if (match) {
      hours = parseInt(match[1], 10)
      minutes = parseInt(match[2], 10)
      const ampm = match[3]
      if (ampm) {
        if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12
        if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0
      }
    } else {
      return null
    }

    const dateObj = new Date(selectedDateStr)
    dateObj.setHours(hours, minutes, 0, 0)
    return dateObj.toISOString()
  } catch {
    return null
  }
}

// Normalize database logs to frontend requirements
const mapBackendLog = (employee, log) => {
  const firstName = employee.first_name || employee.firstName || ''
  const lastName = employee.last_name || employee.lastName || ''
  const name = employee.fullName || `${firstName} ${lastName}`.trim() || 'Unknown Employee'
  const initials = ((firstName[0] || '') + (lastName[0] || '')).toUpperCase() || 'EM'

  const colors = [
    'bg-blue-500', 'bg-violet-500', 'bg-green-500', 'bg-pink-500',
    'bg-amber-500', 'bg-teal-500', 'bg-indigo-500', 'bg-rose-500',
    'bg-orange-500', 'bg-cyan-500', 'bg-sky-500', 'bg-fuchsia-500'
  ]
  const charCodeSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
  const avatarColor = colors[charCodeSum % colors.length]

  const mapStatus = (statusVal) => {
    if (!statusVal) return 'Absent'
    const lower = statusVal.toLowerCase()
    if (lower === 'present') return 'Present'
    if (lower === 'absent') return 'Absent'
    if (lower === 'late') return 'Late'
    if (lower === 'on_leave' || lower === 'leave') return 'Leave'
    if (lower === 'wfh') return 'Present'
    return 'Present'
  }

  if (log) {
    return {
      id: employee.id || employee._id || log.employee_id,
      logId: log.id || log._id,
      name,
      department: employee.department_name || employee.department || 'General',
      avatar: initials,
      avatarColor,
      checkIn: formatTime(log.check_in_at),
      checkOut: formatTime(log.check_out_at),
      totalHours: formatHours(log.working_hours),
      status: mapStatus(log.status),
      overtime: log.overtime_hours > 0,
      late: log.status?.toLowerCase() === 'late',
      check_in_at: log.check_in_at,
      check_out_at: log.check_out_at,
      is_wfh: log.is_wfh,
      rawLog: log
    }
  }

  return {
    id: employee.id || employee._id,
    logId: null,
    name,
    department: employee.department_name || employee.department || 'General',
    avatar: initials,
    avatarColor,
    checkIn: '—',
    checkOut: '—',
    totalHours: '—',
    status: 'Absent',
    overtime: false,
    late: false,
    check_in_at: null,
    check_out_at: null,
    is_wfh: false,
    rawLog: null
  }
}

const DailyAttendancePage = () => {
  const { canManage, isSales } = useRole()
  const { user } = useAuth()

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('All Departments')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [editingId, setEditingId] = useState(null)
  const [editValues, setEditValues] = useState({ checkIn: '', checkOut: '', status: '', adminNotes: '' })
  const [records, setRecords] = useState([])
  const [page, setPage] = useState(1)
  const [showGeo, setShowGeo] = useState(false)

  // Web punch clock states
  const [todaySummary, setTodaySummary] = useState(null)
  const [punchLoading, setPunchLoading] = useState(false)
  const [workMode, setWorkMode] = useState('office')
  const [punchNotes, setPunchNotes] = useState('')

  const isToday = useMemo(() => {
    return date === new Date().toISOString().slice(0, 10)
  }, [date])

  // Fetch today's summary for interactive punch widget
  const fetchTodayPunchSummary = useCallback(async () => {
    try {
      const summary = await attendanceService.getTodaySummary()
      setTodaySummary(summary)
    } catch (err) {
      console.error('Failed to fetch today punch summary:', err)
    }
  }, [])

  // Dynamic attendance and employee list loader
  const fetchAttendanceData = useCallback(async () => {
    setLoading(true)
    try {
      // 1. Fetch backend logs for selected date
      const logs = await attendanceService.getAttendanceLogs(date, date)

      // 2. Fetch employee profiles
      let employeeList = []
      if (canManage) {
        const empData = await employeeService.getEmployees(1, 1000)
        employeeList = Array.isArray(empData) ? empData : (empData?.employees || empData?.data || empData?.items || [])
      } else if (user) {
        employeeList = [{
          id: user.id,
          first_name: user.firstName || user.name?.split(' ')[0] || 'Me',
          last_name: user.lastName || user.name?.split(' ')[1] || '',
          department: user.department || 'Sales',
          employment_status: 'active'
        }]
      }

      // 3. Merging and parsing
      const merged = employeeList.map(emp => {
        const empId = emp.id || emp._id || emp.employee_id
        const matchedLog = logs.find(l => l.employee_id === empId)
        return mapBackendLog(emp, matchedLog)
      })

      setRecords(merged)

      if (isToday) {
        await fetchTodayPunchSummary()
      }
    } catch (err) {
      console.error('Failed to load attendance logs:', err)
    } finally {
      setLoading(false)
    }
  }, [date, canManage, user, isToday, fetchTodayPunchSummary])

  useEffect(() => {
    fetchAttendanceData()
  }, [fetchAttendanceData])

  const stats = useMemo(() => ({
    present:  records.filter(r => r.status === 'Present').length,
    absent:   records.filter(r => r.status === 'Absent').length,
    late:     records.filter(r => r.status === 'Late').length,
    leave:    records.filter(r => r.status === 'Leave').length,
    overtime: records.filter(r => r.overtime).length,
    total:    records.length,
  }), [records])

  const filtered = useMemo(() => records.filter(emp => {
    const q = search.toLowerCase()
    return (
      (emp.name.toLowerCase().includes(q) || emp.id.toLowerCase().includes(q)) &&
      (deptFilter === 'All Departments' || emp.department === deptFilter) &&
      (statusFilter === 'All' || emp.status === statusFilter)
    )
  }), [records, search, deptFilter, statusFilter])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const toggleSelect = useCallback((id) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const toggleSelectAll = useCallback(() => {
    setSelectedIds(prev =>
      prev.size === paginated.length ? new Set() : new Set(paginated.map(e => e.id))
    )
  }, [paginated])

  const handleEdit = useCallback((emp) => {
    setEditingId(emp.id)
    setEditValues({
      checkIn: emp.checkIn === '—' ? '09:00 AM' : emp.checkIn,
      checkOut: emp.checkOut === '—' ? '06:00 PM' : emp.checkOut,
      status: emp.status,
      adminNotes: ''
    })
  }, [])

  const handleSave = useCallback(async (empId) => {
    const editRecord = records.find(r => r.id === empId)
    if (!editRecord) return

    if (!editValues.adminNotes || editValues.adminNotes.trim().length < 10) {
      alert('Error: A detailed justification (min 10 characters) is required for admin overrides.')
      return
    }

    setLoading(true)
    try {
      const logId = editRecord.logId || empId
      const checkInIso = parseTimeInput(editValues.checkIn, date)
      const checkOutIso = parseTimeInput(editValues.checkOut, date)

      const backendStatus = {
        'Present': 'present',
        'Absent': 'absent',
        'Late': 'late',
        'Leave': 'on_leave'
      }[editValues.status] || 'present'

      const updateData = {
        check_in_time: checkInIso,
        check_out_time: checkOutIso,
        status: backendStatus,
        admin_notes: editValues.adminNotes
      }

      await attendanceService.adminUpdateLog(logId, updateData)
      setEditingId(null)
      await fetchAttendanceData()
    } catch (err) {
      console.error('Save override failed:', err)
      alert(err.message || 'Failed to override attendance record.')
    } finally {
      setLoading(false)
    }
  }, [editValues, date, records, fetchAttendanceData])

  const bulkMark = async (statusLabel) => {
    const backendStatus = {
      'Present': 'present',
      'Absent': 'absent',
      'Leave': 'on_leave'
    }[statusLabel] || 'present'

    setLoading(true)
    try {
      const promises = Array.from(selectedIds).map(async (empId) => {
        const empRecord = records.find(r => r.id === empId)
        const logId = empRecord?.logId || empId
        
        let checkInTime = null
        if (backendStatus === 'present') {
          const d = new Date(date)
          d.setHours(9, 0, 0, 0)
          checkInTime = d.toISOString()
        }

        const updateData = {
          status: backendStatus,
          admin_notes: 'Bulk status override by HR Admin',
          check_in_time: checkInTime,
          check_out_time: null
        }

        return attendanceService.adminUpdateLog(logId, updateData)
      })

      await Promise.all(promises)
      setSelectedIds(new Set())
      await fetchAttendanceData()
    } catch (err) {
      console.error('Bulk marking failed:', err)
      alert(err.message || 'Failed to complete bulk updates')
    } finally {
      setLoading(false)
    }
  }

  // Web clock punch execution (clock in / out)
  const handlePunch = async (action) => {
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
          if (err.code === 1) { // PERMISSION_DENIED
            alert('Location access is denied. Please enable location permission in your browser settings to proceed with attendance check-in/out.')
            setPunchLoading(false)
            return
          } else {
            alert(`Could not determine your location: ${err.message || 'Unknown error'}. Please try again.`)
            setPunchLoading(false)
            return
          }
        }
      } else {
        alert('Geolocation is not supported by your browser.')
        setPunchLoading(false)
        return
      }

      await attendanceService.punch({
        action,
        work_mode: workMode,
        location,
        notes: punchNotes || undefined
      })

      setPunchNotes('')
      await fetchAttendanceData()
    } catch (err) {
      console.error('Punch failed:', err)
      alert(err.message || 'Shift punch action failed')
    } finally {
      setPunchLoading(false)
    }
  }

  const handleDateChange = (e) => {
    setDate(e.target.value)
    setPage(1)
  }

  const resetFilters = () => {
    setSearch('')
    setDeptFilter('All Departments')
    setStatusFilter('All')
    setPage(1)
  }

  // Dynamic Geolocation logs extraction
  const geoLogs = useMemo(() => {
    const logsList = []
    records.forEach(r => {
      if (r.rawLog?.check_in_location_json) {
        logsList.push({
          id: `${r.id}-in`,
          employee: r.name,
          action: 'Clock In',
          time: r.checkIn,
          location: `GPS: ${r.rawLog.check_in_location_json.lat.toFixed(4)}, ${r.rawLog.check_in_location_json.lng.toFixed(4)}`,
          status: r.is_wfh ? 'outside' : 'inside'
        })
      }
      if (r.rawLog?.check_out_location_json) {
        logsList.push({
          id: `${r.id}-out`,
          employee: r.name,
          action: 'Clock Out',
          time: r.checkOut,
          location: `GPS: ${r.rawLog.check_out_location_json.lat.toFixed(4)}, ${r.rawLog.check_out_location_json.lng.toFixed(4)}`,
          status: r.is_wfh ? 'outside' : 'inside'
        })
      }
    })

    return logsList
  }, [records])

  const statsCards = [
    { label: 'Present',  value: stats.present,  icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50',  sub: `${stats.total ? Math.round((stats.present / stats.total) * 100) : 0}% attendance` },
    { label: 'Absent',   value: stats.absent,   icon: UserX,     color: 'text-red-500',   bg: 'bg-red-50',    sub: 'Not checked in'     },
    { label: 'Late',     value: stats.late,     icon: Clock,     color: 'text-amber-600', bg: 'bg-amber-50',  sub: 'After 9:30 AM'      },
    { label: 'On Leave', value: stats.leave,    icon: Plane,     color: 'text-blue-500',  bg: 'bg-blue-50',   sub: 'Approved leave'      },
  ]

  return (
    <div className="p-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>

        {/* ── Header ── */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {isSales ? 'My Attendance' : 'Daily Attendance'}
            </h1>
            <p className="text-sm text-slate-500">
              {isSales ? 'Your check-in/out record for today' : 'Track and manage daily check-in/out records'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={date}
                onChange={handleDateChange}
                className="rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
            {canManage && (
              <button
                onClick={() => isToday && handlePunch('check_in')}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95 cursor-pointer"
              >
                <UserCheck className="h-4 w-4" /> Quick Clock In
              </button>
            )}
            {canManage && (
              <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 shadow-sm transition hover:bg-slate-50 active:scale-95">
                <Download className="h-4 w-4" /> Export
              </button>
            )}
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statsCards.map((s, i) => (
            <StatsCard key={s.label} {...s} delay={i * 0.07} />
          ))}
        </div>

        {/* ── Overtime Banner ── */}
        <AnimatePresence>
          {stats.overtime > 0 && (
            <motion.div
              key="overtime"
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              className="mb-4 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3"
            >
              <Zap className="h-4 w-4 shrink-0 text-blue-500" />
              <p className="text-sm font-medium text-blue-800">
                {stats.overtime} employee{stats.overtime > 1 ? 's are' : ' is'} in overtime today — review and approve if needed.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Interactive Web Punch Widget (For logged-in employee today) ── */}
        {isToday && todaySummary && (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Clock className="h-6 w-6 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Web Punch Clock</h2>
                  <p className="text-xs text-slate-500">Log your shifts securely in real-time</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-semibold">Active Status:</span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                  todaySummary.status === 'Clocked In'
                    ? 'bg-green-100 text-green-700'
                    : todaySummary.status === 'Clocked Out'
                    ? 'bg-slate-100 text-slate-600'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {todaySummary.status}
                </span>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Work Mode */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500">Work Mode</label>
                <select
                  disabled={todaySummary.status === 'Clocked Out' || punchLoading}
                  value={workMode}
                  onChange={(e) => setWorkMode(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="office">🏢 Office</option>
                  <option value="wfh">🏠 WFH</option>
                  <option value="field">🚗 Field Work</option>
                </select>
              </div>

              {/* Punch Notes */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-500">Notes (Optional)</label>
                <input
                  type="text"
                  disabled={todaySummary.status === 'Clocked Out' || punchLoading}
                  value={punchNotes}
                  onChange={(e) => setPunchNotes(e.target.value)}
                  placeholder="Notes, destination field client, reason for check-in..."
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Action Button */}
              <div className="flex items-end justify-stretch">
                {todaySummary.status === 'Not Checked In' ? (
                  <button
                    onClick={() => handlePunch('check_in')}
                    disabled={punchLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <Play className="h-4 w-4" /> Clock In
                  </button>
                ) : todaySummary.status === 'Clocked In' ? (
                  <button
                    onClick={() => handlePunch('check_out')}
                    disabled={punchLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <Square className="h-4 w-4" /> Clock Out
                  </button>
                ) : (
                  <button
                    disabled
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 py-2.5 text-sm font-semibold text-slate-400 cursor-not-allowed"
                  >
                    Shift Completed 🎉
                  </button>
                )}
              </div>
            </div>
            {todaySummary.check_in_time && (
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
                <div>Clocked In at: <span className="font-semibold text-slate-700">{parseUtcDate(todaySummary.check_in_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</span></div>
                {todaySummary.check_out_time && (
                  <div>Clocked Out at: <span className="font-semibold text-slate-700">{parseUtcDate(todaySummary.check_out_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</span></div>
                )}
                <div>Hours logged today: <span className="font-semibold text-slate-700">{todaySummary.hours_so_far} hrs</span></div>
              </div>
            )}
          </div>
        )}

        {/* ── Filters ── */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          {canManage && (
            <div className="relative min-w-52 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search by name or ID..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
          )}
          {canManage && (
            <select
              value={deptFilter}
              onChange={e => { setDeptFilter(e.target.value); setPage(1) }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
            </select>
          )}
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            {['All', 'Present', 'Absent', 'Late', 'Leave'].map(s => <option key={s}>{s}</option>)}
          </select>
          {(search || deptFilter !== 'All Departments' || statusFilter !== 'All') && (
            <button onClick={resetFilters} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-500 shadow-sm hover:bg-slate-50 cursor-pointer">
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>
          )}
        </div>

        {/* ── Bulk Actions Banner ── */}
        {canManage && <AnimatePresence>
          {selectedIds.size > 0 && (
            <motion.div
              key="bulk"
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              className="mb-3 flex flex-wrap items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3"
            >
              <span className="text-sm font-semibold text-indigo-700">{selectedIds.size} selected</span>
              <div className="flex gap-2">
                <button onClick={() => bulkMark('Present')} className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 cursor-pointer">Mark Present</button>
                <button onClick={() => bulkMark('Absent')}  className="rounded-lg bg-red-500  px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600 cursor-pointer">Mark Absent</button>
                <button onClick={() => bulkMark('Leave')}   className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 cursor-pointer">Mark Leave</button>
              </div>
              <button onClick={() => setSelectedIds(new Set())} className="ml-auto text-indigo-400 transition hover:text-indigo-700 cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>}

        {/* ── Table ── */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-200 text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  {canManage && (
                    <th className="px-4 py-3.5">
                      <input
                        type="checkbox"
                        onChange={toggleSelectAll}
                        checked={paginated.length > 0 && selectedIds.size === paginated.length}
                        className="h-4 w-4 rounded border-slate-300 accent-blue-600"
                      />
                    </th>
                  )}
                  {['Employee', 'Department', 'Check-In', 'Check-Out', 'Total Hours', 'Status', 'Flags',
                    ...(canManage ? ['Action'] : []),
                  ].map(h => (
                    <th key={h} className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? [...Array(6)].map((_, i) => <SkeletonRow key={i} cols={canManage ? 9 : 7} />)
                  : paginated.length === 0
                    ? (
                      <tr>
                        <td colSpan={canManage ? 9 : 7} className="py-16 text-center">
                          <UserX className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                          <p className="text-sm font-medium text-slate-500">No records found</p>
                          <p className="text-xs text-slate-400">Try adjusting your date or filters</p>
                        </td>
                      </tr>
                    )
                    : paginated.map((emp, idx) => (
                      <motion.tr
                        key={emp.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.04 }}
                        className={`group border-b border-slate-100 transition
                          ${emp.late ? 'bg-amber-50/40' : ''}
                          ${emp.overtime && !emp.late ? 'bg-blue-50/20' : ''}
                          hover:bg-slate-50/80`}
                      >
                        {/* Checkbox — managers only */}
                        {canManage && (
                          <td className="px-4 py-3.5">
                            <input type="checkbox" checked={selectedIds.has(emp.id)} onChange={() => toggleSelect(emp.id)}
                              className="h-4 w-4 rounded border-slate-300 accent-blue-600" />
                          </td>
                        )}

                        {/* Employee */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${emp.avatarColor}`}>{emp.avatar}</div>
                            <div className="w-full">
                              <div className="text-sm font-semibold text-slate-800">{emp.name}</div>
                              <div className="text-xs text-slate-400">{emp.id}</div>
                              {canManage && editingId === emp.id && (
                                <input
                                  type="text"
                                  placeholder="Justification (min 10 chars)..."
                                  value={editValues.adminNotes}
                                  onChange={e => setEditValues(p => ({ ...p, adminNotes: e.target.value }))}
                                  className="mt-1.5 w-full rounded-lg border border-blue-300 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-100"
                                />
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Department */}
                        <td className="px-4 py-3.5">
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{emp.department}</span>
                        </td>

                        {/* Check-In */}
                        <td className="px-4 py-3.5">
                          {canManage && editingId === emp.id
                            ? <input value={editValues.checkIn} onChange={e => setEditValues(p => ({ ...p, checkIn: e.target.value }))}
                                className="w-28 rounded-lg border border-blue-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100" />
                            : <span className={`text-sm font-medium ${emp.late ? 'text-amber-600' : 'text-slate-700'}`}>{emp.checkIn}</span>
                          }
                        </td>

                        {/* Check-Out */}
                        <td className="px-4 py-3.5">
                          {canManage && editingId === emp.id
                            ? <input value={editValues.checkOut} onChange={e => setEditValues(p => ({ ...p, checkOut: e.target.value }))}
                                className="w-28 rounded-lg border border-blue-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100" />
                            : <span className="text-sm text-slate-700">{emp.checkOut}</span>
                          }
                        </td>

                        {/* Total Hours */}
                        <td className="px-4 py-3.5">
                          <span className={`text-sm font-semibold ${emp.overtime ? 'text-blue-600' : 'text-slate-700'}`}>{emp.totalHours}</span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          {canManage && editingId === emp.id
                            ? <select value={editValues.status} onChange={e => setEditValues(p => ({ ...p, status: e.target.value }))}
                                className="rounded-lg border border-blue-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100">
                                {['Present', 'Absent', 'Late', 'Leave'].map(s => <option key={s}>{s}</option>)}
                              </select>
                            : <StatusBadge status={emp.status} />
                          }
                        </td>

                        {/* Flags */}
                        <td className="px-4 py-3.5">
                          <div className="flex gap-1.5">
                            {emp.late     && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">Late</span>}
                            {emp.overtime && <span className="rounded-full bg-blue-100  px-2 py-0.5 text-xs font-semibold text-blue-700">OT</span>}
                            {emp.is_wfh   && <span className="rounded-full bg-teal-100  px-2 py-0.5 text-xs font-semibold text-teal-700 font-mono uppercase">WFH</span>}
                          </div>
                        </td>

                        {/* Action — managers only */}
                        {canManage && (
                          <td className="px-4 py-3.5">
                            {editingId === emp.id
                              ? <div className="flex gap-1">
                                  <button onClick={() => handleSave(emp.id)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-100 text-green-600 hover:bg-green-200 cursor-pointer"><Check className="h-3.5 w-3.5" /></button>
                                  <button onClick={() => setEditingId(null)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100 text-red-500 hover:bg-red-200 cursor-pointer"><X className="h-3.5 w-3.5" /></button>
                                </div>
                              : <button onClick={() => handleEdit(emp)} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 opacity-0 transition hover:bg-slate-100 hover:text-slate-600 group-hover:opacity-100 cursor-pointer">
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                            }
                          </td>
                        )}
                      </motion.tr>
                    ))
                }
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filtered.length > PAGE_SIZE && (
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3.5">
              <span className="text-sm text-slate-500">
                Showing <span className="font-medium text-slate-700">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}</span> of <span className="font-medium text-slate-700">{filtered.length}</span>
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition ${page === i + 1 ? 'bg-blue-600 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                    {i + 1}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Geo Logs ── */}
        {canManage && <div>
          <button
            onClick={() => setShowGeo(p => !p)}
            className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            <MapPin className="h-4 w-4 text-slate-500" />
            Geo-Location Logs
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">{geoLogs.length}</span>
            <span className="ml-1 text-xs font-normal text-slate-400">{showGeo ? '(hide)' : '(show)'}</span>
          </button>

          <AnimatePresence>
            {showGeo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              >
                {geoLogs.length > 0 ? (
                  geoLogs.map((log, i) => <GeoLogCard key={log.id} log={log} delay={i * 0.07} />)
                ) : (
                  <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                    No GPS / geo-location punches recorded for this date.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>}

      </motion.div>
    </div>
  )
}

export default DailyAttendancePage
