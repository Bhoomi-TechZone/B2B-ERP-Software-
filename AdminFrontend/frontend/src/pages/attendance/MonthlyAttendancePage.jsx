import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  ChevronLeft, ChevronRight, UserCheck, UserX, Plane, CalendarDays,
  Search, SlidersHorizontal, Info, Clock, AlertCircle, X, Download, Plus, CheckSquare,
  MapPin, Monitor, Smartphone, QrCode, Calendar, ChevronDown, Check, Ban
} from 'lucide-react'
import attendanceService from '../../services/attendanceService'
import employeeService from '../../services/employeeService'
import departmentService from '../../services/departmentService'
import { useRole } from '../../hooks/useRole'
import { useAuth } from '../../hooks/useAuth'

/* ─── Avatar utilities ──────────────────────────────────────────── */
const AVATAR_COLORS = [
  'bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-pink-500',
  'bg-amber-500', 'bg-teal-500', 'bg-indigo-500', 'bg-rose-500',
  'bg-orange-500', 'bg-cyan-500', 'bg-sky-500', 'bg-fuchsia-500',
]

const avatarColor = (name = '') => {
  const sum = name.split('').reduce((s, c) => s + c.charCodeAt(0), 0)
  return AVATAR_COLORS[sum % AVATAR_COLORS.length]
}

const initials = (name = '') => {
  const parts = name.trim().split(' ')
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || 'EM'
}

/* ─── Time formatting ───────────────────────────────────────────── */
const fmtTime = (iso) => {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    if (isNaN(d)) return '—'
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
  } catch { return '—' }
}

const fmtHours = (h) => {
  if (!h || h <= 0) return '—'
  const hrs = Math.floor(h)
  const mins = Math.round((h - hrs) * 60)
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h 00m`
}

/* ─── National Holidays Pool ────────────────────────────────────── */
const HOLIDAYS = {
  '01-01': "New Year's Day",
  '01-26': "Republic Day",
  '05-01': "May Day / Labor Day",
  '08-15': "Independence Day",
  '10-02': "Gandhi Jayanti",
  '12-25': "Christmas Day",
}

const getHolidayName = (y, m, d) => {
  const key = `${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  return HOLIDAYS[key] || null
}

/* ─── Day Cell Visual Styling & Custom Mapping ──────────────────── */
const DAY_STYLES = {
  P:    { cell: 'bg-green-50/50 hover:bg-green-100/70 text-green-700 border-green-200',    label: 'Present',  dotBg: 'bg-green-500',  ind: '🟢' },
  A:    { cell: 'bg-red-50/40 hover:bg-red-100/60 text-red-650 border-red-150',          label: 'Absent',   dotBg: 'bg-red-500',    ind: '🔴' },
  L:    { cell: 'bg-yellow-50/40 hover:bg-yellow-100/60 text-yellow-700 border-yellow-200', label: 'Leave',    dotBg: 'bg-yellow-500', ind: '🟡' },
  Late: { cell: 'bg-orange-50/40 hover:bg-orange-100/60 text-orange-700 border-orange-200', label: 'Late',     dotBg: 'bg-orange-500', ind: '🟠' },
  WO:   { cell: 'bg-blue-50/30 hover:bg-blue-100/50 text-blue-600 border-blue-150',        label: 'Weekend',  dotBg: 'bg-blue-500',   ind: '🔵' },
  H:    { cell: 'bg-purple-50/40 hover:bg-purple-100/60 text-purple-700 border-purple-200', label: 'Holiday',  dotBg: 'bg-purple-500', ind: '🟣' },
  HD:   { cell: 'bg-pink-50/40 hover:bg-pink-100/60 text-pink-700 border-pink-200',        label: 'Half Day', dotBg: 'bg-pink-500',   ind: '💗' },
  null: { cell: 'bg-slate-50/40 hover:bg-slate-100/60 text-slate-400 border-slate-150',    label: '—',        dotBg: 'bg-slate-300',  ind: '⚪' },
}

const LEGEND = [
  { label: 'Present',  dot: 'bg-green-500'  },
  { label: 'Absent',   dot: 'bg-red-500'    },
  { label: 'Leave',    dot: 'bg-yellow-500' },
  { label: 'Late',     dot: 'bg-orange-500' },
  { label: 'Weekend',  dot: 'bg-blue-500'   },
  { label: 'Holiday',  dot: 'bg-purple-500' },
  { label: 'Half Day', dot: 'bg-pink-500'   },
]

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

/* ─── Dynamic Roster Resolver ───────────────────────────────────── */
const getDayStatus = (log, year, month, day) => {
  if (log) {
    const s = String(log.status || '').toLowerCase()
    if (s === 'present') return 'P'
    if (s === 'absent') return 'A'
    if (s === 'leave' || s === 'on_leave') return 'L'
    if (s === 'late') return 'Late'
    if (s === 'half_day' || s === 'halfday') return 'HD'
    if (s === 'wfh') return 'P'
    return 'P'
  }

  // No record - evaluate Weekend/Holiday/Future/Absent
  const holidayName = getHolidayName(year, month, day)
  if (holidayName) return 'H'

  const d = new Date(year, month, day)
  const dayOfWeek = d.getDay()
  if (dayOfWeek === 0 || dayOfWeek === 6) return 'WO'

  // Future check
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  if (d > today) return null

  return 'A' // Past days with no log are Absent
}

const getAuditIndicator = (log) => {
  if (!log) return null
  const src = String(log.source || '').toLowerCase()
  if (log.is_regularised) {
    if (src === 'manual') return 'edited' // Edited / override
    return 'manual' // Regularised / manual correction
  }
  if (src === 'manual') return 'manual'
  return 'auto' // standard web/biometric punch
}

/* ─── Stats Card Component ──────────────────────────────────────── */
const StatsSummaryCard = ({ label, value, sub, icon: Icon, tone, delay = 0 }) => {
  const toneMap = {
    green:  { bg: 'bg-green-50/50 border-green-200',  iconBg: 'bg-green-150/70 text-green-700' },
    red:    { bg: 'bg-red-50/40 border-red-200',      iconBg: 'bg-red-150/70 text-red-650' },
    orange: { bg: 'bg-orange-50/40 border-orange-200',iconBg: 'bg-orange-150/70 text-orange-700' },
    blue:   { bg: 'bg-blue-50/40 border-blue-200',    iconBg: 'bg-blue-150/70 text-blue-700' },
  }[tone] || { bg: 'bg-slate-50 border-slate-200', iconBg: 'bg-slate-100 text-slate-700' }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -3, boxShadow: '0 8px 24px -4px rgb(0 0 0 / 0.08)' }}
      className={`rounded-2xl border bg-white p-5 shadow-sm transition-all ${toneMap.bg}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</div>
          <div className="text-sm font-semibold text-slate-700 mt-0.5">{label}</div>
          {sub && <div className="text-xs text-slate-400 mt-1 font-medium">{sub}</div>}
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${toneMap.iconBg}`}>
          <Icon className="h-5.5 w-5.5" />
        </div>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   MONTHLY ATTENDANCE PAGE
   ═══════════════════════════════════════════════════════════════════ */
const MonthlyAttendancePage = () => {
  const now = new Date()
  const { canManage, isSales } = useRole()
  const { user } = useAuth()

  /* ── Date & navigation ── */
  const [year, setYear]   = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  /* ── Directory Search & Filter States ── */
  const [searchQ, setSearchQ]             = useState('')
  const [deptFilter, setDeptFilter]       = useState('All Departments')
  const [statusFilter, setStatusFilter]   = useState('All Status')
  const [shiftFilter, setShiftFilter]     = useState('All Shifts')
  const [locationFilter, setLocationFilter] = useState('All Locations')
  const [irregularOnly, setIrregularOnly] = useState(false)

  /* ── Async Dynamic Data States ── */
  const [allEmployees, setAllEmployees]   = useState([])
  const [selectedEmp, setSelectedEmp]     = useState(null)
  const [departments, setDepartments]     = useState(['All Departments'])
  const [logsArr, setLogsArr]             = useState([])
  const [loading, setLoading]             = useState(false)

  /* ── Day Dialog Modal ── */
  const [activeDayRecord, setActiveDayRecord] = useState(null) // { day, status, log, style }
  const [activeBulkAction, setActiveBulkAction] = useState(null) // 'regularize' | 'mark_present' | null
  
  /* ── Bulk Actions & Selection States ── */
  const [bulkMode, setBulkMode] = useState(false)
  const [selectedEmpIds, setSelectedEmpIds] = useState([])
  const [selectedDates, setSelectedDates] = useState([])
  const [bulkLoading, setBulkLoading] = useState(false)
  const [bulkProgress, setBulkProgress] = useState('')
  const [bulkForm, setBulkForm] = useState({
    checkIn: '09:30',
    checkOut: '18:30',
    isWfh: false,
    notes: 'Bulk regularization by administrator.'
  })

  /* ── Manual Entry Modal pre-trigger helper ── */
  const [showDirectModal, setShowDirectModal] = useState(false)
  const [overrideForm, setOverrideForm] = useState({
    checkIn: '09:00 AM',
    checkOut: '06:00 PM',
    isWfh: false,
    notes: 'Direct override for monthly regularization.'
  })

  /* ── Fetch departments ── */
  const fetchDepartments = useCallback(async () => {
    try {
      const data = await departmentService.getDepartments()
      const list = Array.isArray(data) ? data : (data?.departments || data?.data || [])
      const names = list.map(d => d.name)
      setDepartments(['All Departments', ...names])
    } catch {
      setDepartments(['All Departments'])
    }
  }, [])

  /* ── Fetch all employees ── */
  const fetchEmployees = useCallback(async () => {
    try {
      const data = await employeeService.getEmployees(1, 1000)
      const list = Array.isArray(data) ? data : (data?.employees || data?.data || data?.items || [])
      setAllEmployees(list)

      // Set default selected employee (lock to self if not administrative role)
      if (list.length > 0 && !selectedEmp) {
        const myEmp = list.find(e => e.id === user?.id || e.user_id === user?.id)
        setSelectedEmp(myEmp || list[0])
      }
    } catch (err) {
      console.error('Failed to fetch employees:', err)
    }
  }, [user, selectedEmp])

  /* ── Fetch selected employee monthly logs ── */
  const fetchMonthlyLogs = useCallback(async () => {
    if (!selectedEmp) return
    setLoading(true)
    try {
      const startDay = '01'
      const lastDay = new Date(year, month + 1, 0).getDate()
      const startStr = `${year}-${String(month + 1).padStart(2, '0')}-${startDay}`
      const endStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

      const logs = await attendanceService.getAttendanceLogs(startStr, endStr, selectedEmp.id)
      const data = Array.isArray(logs) ? logs : (logs?.logs || logs?.data || [])
      setLogsArr(data)
    } catch (err) {
      console.error('Failed to fetch monthly logs:', err)
      setLogsArr([])
    } finally {
      setLoading(false)
    }
  }, [year, month, selectedEmp])

  /* ── Initial data fetch ── */
  useEffect(() => { fetchDepartments() }, [fetchDepartments])
  useEffect(() => { fetchEmployees() }, [fetchEmployees])
  useEffect(() => { fetchMonthlyLogs() }, [fetchMonthlyLogs])

  /* ── Standard Employee Fallback ── */
  useEffect(() => {
    if (!canManage && user && !selectedEmp) {
      setSelectedEmp({
        id: user.id || 'current-user-id',
        user_id: user.id || 'current-user-id',
        first_name: user.firstName || user.name?.split(' ')[0] || 'My',
        last_name: user.lastName || user.name?.split(' ').slice(1).join(' ') || 'Attendance',
        employee_number: user.employee_number || 'EMP-SELF',
        department_name: user.department || 'Roster Team'
      })
    }
  }, [canManage, user, selectedEmp])

  /* ── Month Navigation helpers ── */
  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  /* ── Directory Filtering ── */
  const filteredEmployees = useMemo(() => {
    const q = searchQ.toLowerCase().trim()
    return allEmployees.filter(emp => {
      const fn = emp.first_name || ''
      const ln = emp.last_name || ''
      const name = `${fn} ${ln}`.toLowerCase()
      const code = (emp.employee_number || emp.employee_code || emp.id || '').toLowerCase()
      
      const matchQ = !q || name.includes(q) || code.includes(q)
      const matchDept = deptFilter === 'All Departments' || emp.department_name === deptFilter || emp.department === deptFilter

      return matchQ && matchDept
    })
  }, [allEmployees, searchQ, deptFilter])

  /* ── Calendar grid construction ── */
  const daysInMonth    = new Date(year, month + 1, 0).getDate()
  const firstDayOfWeek = new Date(year, month, 1).getDay()

  const calData = useMemo(() => {
    const data = {}
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      
      const dayLog = logsArr.find(l => {
        if (!l || !l.date) return false
        let logDateStr = ''
        try {
          if (typeof l.date === 'string' && l.date.length >= 10) {
            logDateStr = l.date.slice(0, 10)
          } else {
            logDateStr = new Date(l.date).toISOString().slice(0, 10)
          }
        } catch (e) {
          return false
        }
        
        const logEmpId = String(l.employee_id || '').toLowerCase()
        const empUUID  = String(selectedEmp?.id || '').toLowerCase()
        const userUUID = String(selectedEmp?.user_id || '').toLowerCase()
        const matchEmp = logEmpId === empUUID || (userUUID && logEmpId === userUUID)
        return matchEmp && logDateStr === currentDateStr
      })

      const status = getDayStatus(dayLog, year, month, day)
      
      data[day] = {
        status,
        log: dayLog || null,
        style: DAY_STYLES[status] || DAY_STYLES[null],
        dateStr: currentDateStr,
        holidayName: getHolidayName(year, month, day)
      }
    }
    return data
  }, [year, month, daysInMonth, logsArr, selectedEmp])

  /* ── Stats Calculations ── */
  const stats = useMemo(() => {
    const vals = Object.values(calData)
    const present  = vals.filter(v => v.status === 'P').length
    const absent   = vals.filter(v => v.status === 'A').length
    const leave    = vals.filter(v => v.status === 'L').length
    const weekend  = vals.filter(v => v.status === 'WO').length
    const holiday  = vals.filter(v => v.status === 'H').length
    const late     = vals.filter(v => v.status === 'Late').length
    const halfDay  = vals.filter(v => v.status === 'HD').length

    // Dynamic calculations from real logs
    const totalWorkingHrs = logsArr.reduce((acc, curr) => acc + (curr.working_hours || 0), 0)
    const overtimeHrs     = logsArr.reduce((acc, curr) => acc + (curr.overtime_hours || 0), 0)

    // Payable Days = Present + Paid Leaves + Weekends + Holidays
    const payable = present + late + halfDay + leave + weekend + holiday

    return {
      present, absent, leave, weekend, holiday, late, halfDay,
      totalWorkingHrs: totalWorkingHrs.toFixed(1),
      overtimeHrs: overtimeHrs.toFixed(1),
      payable
    }
  }, [calData, logsArr])

  /* ── Day Detail / Custom Override submit ── */
  const handleDirectOverride = async () => {
    if (!selectedEmp || !activeDayRecord) return
    try {
      const parseISO = (timeStr, dateStr) => {
        const m = timeStr.match(/(\d+):(\d+)(?:\s*(AM|PM))?/i)
        if (!m) return null
        let h = parseInt(m[1]), min = parseInt(m[2])
        const ap = m[3]?.toUpperCase()
        if (ap === 'PM' && h < 12) h += 12
        if (ap === 'AM' && h === 12) h = 0
        const d = new Date(dateStr)
        d.setHours(h, min, 0, 0)
        return d.toISOString()
      }

      // Auto pad notes to 10 characters to comply with FastAPI schema
      let noteText = (overrideForm.notes || '').trim()
      if (noteText.length < 10) {
        noteText = noteText.length > 0 ? `${noteText} (Manual override)` : "Direct manual calendar entry by admin"
      }

      const payload = {
        check_in_time:  parseISO(overrideForm.checkIn,  activeDayRecord.dateStr),
        check_out_time: overrideForm.checkOut ? parseISO(overrideForm.checkOut, activeDayRecord.dateStr) : null,
        is_wfh:         overrideForm.isWfh,
        admin_notes:    `CALENDAR_CORRECTION: ${noteText}`,
      }

      await attendanceService.adminUpdateLog(selectedEmp.id, payload)
      setShowDirectModal(false)
      setActiveDayRecord(null)
      await fetchMonthlyLogs()
    } catch (err) {
      alert(err.message || 'Direct entry override failed')
    }
  }

  /* ── Bulk Actions Execution Loop ── */
  const handleBulkSubmit = async (actionType, formData = null) => {
    if (selectedEmpIds.length === 0 || selectedDates.length === 0) {
      alert("Please select at least one employee and one date.")
      return
    }

    setBulkLoading(true)
    setActiveBulkAction(null)

    const totalTasks = selectedEmpIds.length * selectedDates.length
    let completed = 0

    try {
      for (const empId of selectedEmpIds) {
        for (const dateStr of selectedDates) {
          completed++
          setBulkProgress(`Seeding ${completed}/${totalTasks}...`)

          let payload = {}
          if (actionType === 'mark_present') {
            payload = {
              check_in_time: `${dateStr}T09:00:00.000Z`,
              check_out_time: `${dateStr}T18:00:00.000Z`,
              status: 'present',
              is_wfh: false,
              source: 'bulk_action',
              admin_notes: 'BULK_ACTION: Attendance bulk marked present by admin'
            }
          } else if (actionType === 'regularize') {
            // Note field validation for FastAPI (min length 10)
            let noteText = (formData?.notes || '').trim()
            if (noteText.length < 10) {
              noteText = noteText.length > 0 ? `${noteText} (Bulk Override)` : "Bulk regularization by administrator"
            }

            const checkInVal = formData?.checkIn || '09:30'
            const checkOutVal = formData?.checkOut || '18:30'

            payload = {
              check_in_time: `${dateStr}T${checkInVal}:00.000Z`,
              check_out_time: `${dateStr}T${checkOutVal}:00.000Z`,
              status: 'present',
              is_wfh: !!formData?.isWfh,
              source: 'bulk_action',
              admin_notes: `BULK_ACTION: ${noteText}`
            }
          }

          await attendanceService.adminUpdateLog(empId, payload)
        }
      }

      alert(`Successfully completed bulk override operations for ${selectedEmpIds.length} employees over ${selectedDates.length} selected dates!`)
      setBulkMode(false)
      setSelectedEmpIds([])
      setSelectedDates([])
      await fetchMonthlyLogs()
    } catch (err) {
      console.error('Bulk override failed:', err)
      alert(err.message || 'Bulk operation failed during batch calls.')
    } finally {
      setBulkLoading(false)
      setBulkProgress('')
    }
  }

  return (
    <div className="flex flex-col bg-[#F7F8FA] p-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col space-y-6"
      >
        
        {/* ══ Top Header ══════════════════════════════════════════════ */}
        <div className="flex flex-wrap items-center justify-between gap-4 shrink-0 border-b border-slate-200 bg-white -mx-6 -mt-6 px-6 py-4 shadow-sm">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {isSales ? 'My Patterns & Analytics' : 'Monthly Performance Monitor'}
              </h1>
              <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 tracking-wider">
                ENTERPRISE
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Analyze employee monthly calendars, apply regularizations, audit manual edits, and check payable days.
            </p>
          </div>

          {/* Quick Date Navigation */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={prevMonth} className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-650 transition active:scale-95 shadow-sm">
              <ChevronLeft className="h-4.5 w-4.5" />
            </button>
            <span className="min-w-40 text-center text-sm font-bold text-slate-800 bg-slate-100 rounded-xl px-4 py-1.5 border border-slate-200">
              {MONTHS[month]} {year}
            </span>
            <button onClick={nextMonth} className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-650 transition active:scale-95 shadow-sm">
              <ChevronRight className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* ══ Top Enterprise Summary Cards ═══════════════════════════ */}
        <div className="grid grid-cols-2 gap-4 shrink-0 md:grid-cols-4">
          <StatsSummaryCard
            label="Present & Late"
            value={stats.present + stats.late}
            sub={`${stats.present} standard | ${stats.late} late arrivals`}
            icon={UserCheck}
            tone="green"
            delay={0}
          />
          <StatsSummaryCard
            label="Absent Days"
            value={stats.absent}
            sub="Requires immediate review"
            icon={UserX}
            tone="red"
            delay={0.06}
          />
          <StatsSummaryCard
            label="Total Leaves & WFH"
            value={stats.leave}
            sub="Approved holiday & leave roster"
            icon={Plane}
            tone="orange"
            delay={0.12}
          />
          <StatsSummaryCard
            label="Total Hours & Overtime"
            value={`${stats.totalWorkingHrs} hrs`}
            sub={`${stats.overtimeHrs} hrs overtime logged`}
            icon={Clock}
            tone="blue"
            delay={0.18}
          />
        </div>

        {/* ══ Top Advanced Filters Bar ════════════════════════════════ */}
        <div className="flex flex-wrap items-center gap-3 shrink-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-3 pr-8 text-xs font-semibold text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                {['All Status', 'Present', 'Absent', 'Late', 'Leave', 'Half Day'].map(s => <option key={s}>{s}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>

            {/* Shift Filter */}
            <div className="relative">
              <select
                value={shiftFilter}
                onChange={e => setShiftFilter(e.target.value)}
                className="appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-3 pr-8 text-xs font-semibold text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                {['All Shifts', 'General Shift', 'Night Shift', 'Flexi Shift'].map(s => <option key={s}>{s}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>

            {/* Location Filter */}
            <div className="relative">
              <select
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
                className="appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-3 pr-8 text-xs font-semibold text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                {['All Locations', 'Main Office', 'Branch Office', 'Home (WFH)'].map(l => <option key={l}>{l}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>

            {/* Irregular Only Toggle */}
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-750 transition hover:bg-slate-100 select-none">
              <input
                type="checkbox"
                checked={irregularOnly}
                onChange={e => setIrregularOnly(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-slate-350 accent-blue-600 focus:outline-none"
              />
              Irregular Only
            </label>
          </div>

          {/* Bulk Action Controls */}
          {canManage && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setBulkMode(prev => {
                    if (prev) {
                      setSelectedEmpIds([])
                      setSelectedDates([])
                    } else {
                      if (selectedEmp) setSelectedEmpIds([selectedEmp.id])
                    }
                    return !prev
                  })
                }}
                className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-xs font-bold shadow-sm transition active:scale-95 ${
                  bulkMode
                    ? 'bg-red-50 text-red-650 border-red-200 hover:bg-red-100/70'
                    : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100/70'
                }`}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                {bulkMode ? 'Turn OFF Select Mode' : 'Turn ON Select Mode'}
              </button>
            </div>
          )}
        </div>

        {/* ══ Main Page Workspace Area ════════════════════════════════ */}
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* LEFT PANEL: Employee Roster Directory (HR/Admins) */}
          {canManage && (
            <div className="w-full lg:w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col shrink-0 h-[680px]">
              <div className="relative mb-3 shrink-0">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  placeholder="Search employee by name, code..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-705 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Bulk Mode Select All Control */}
              {bulkMode && (
                <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl mb-3 border border-slate-200 shrink-0">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={filteredEmployees.length > 0 && selectedEmpIds.length === filteredEmployees.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedEmpIds(filteredEmployees.map(emp => emp.id))
                        } else {
                          setSelectedEmpIds([])
                        }
                      }}
                      className="h-4 w-4 rounded border-slate-350 accent-blue-600 focus:ring-blue-500"
                    />
                    Select All ({filteredEmployees.length})
                  </label>
                  <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 font-bold px-2 py-0.5 rounded-full">
                    {selectedEmpIds.length} Selected
                  </span>
                </div>
              )}

              {/* Directory Scroller */}
              <div className="flex-1 overflow-y-auto space-y-1 pr-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200">
                {filteredEmployees.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 font-medium">
                    No employees match your search
                  </div>
                ) : (
                  filteredEmployees.map(emp => {
                    const fn = emp.first_name || ''
                    const ln = emp.last_name || ''
                    const fullName = `${fn} ${ln}`.trim()
                    const empCode  = emp.employee_number || emp.employee_code || emp.id || ''
                    const selected = selectedEmp?.id === emp.id
                    const isChecked = selectedEmpIds.includes(emp.id)
                    const color = avatarColor(fullName)

                    return (
                      <div
                        key={emp.id}
                        className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 transition-all border-l-4 ${
                          selected
                            ? 'bg-blue-50/70 border-l-blue-600 ring-1 ring-blue-100'
                            : 'hover:bg-slate-50 border-l-transparent'
                        }`}
                      >
                        {bulkMode && (
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedEmpIds(prev => 
                                prev.includes(emp.id) ? prev.filter(id => id !== emp.id) : [...prev, emp.id]
                              )
                            }}
                            className="h-4 w-4 rounded border-slate-350 accent-blue-600 focus:ring-blue-500 shrink-0 cursor-pointer"
                          />
                        )}
                        <button
                          onClick={() => setSelectedEmp(emp)}
                          className="flex flex-1 items-center gap-2 text-left min-w-0"
                        >
                          <div className={`flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm ${color}`}>
                            {initials(fullName)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-xs font-bold text-slate-800">{fullName}</div>
                            <div className="truncate text-[10px] text-slate-400 mt-0.5">{empCode} · {emp.department_name || 'Roster Team'}</div>
                          </div>
                        </button>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}

          {/* RIGHT VIEW: Attendance Calendar Grid & Legend */}
          <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col min-w-0 min-h-[680px]">
            {/* Header info */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                {selectedEmp && (
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm ${avatarColor(`${selectedEmp.first_name} ${selectedEmp.last_name}`)}`}>
                    {initials(`${selectedEmp.first_name} ${selectedEmp.last_name}`)}
                  </div>
                )}
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    {selectedEmp ? `${selectedEmp.first_name} ${selectedEmp.last_name}`.trim() : 'Loading Employee...'}
                  </div>
                  <div className="text-xs text-slate-400">
                    {selectedEmp?.employee_number || 'EMP-000000'} · {selectedEmp?.department_name || 'Roster Team'}
                  </div>
                </div>
              </div>

              {/* Roster Legend */}
              <div className="flex flex-wrap items-center gap-3 bg-slate-50/50 rounded-xl p-2 border border-slate-100">
                {LEGEND.map(l => (
                  <div key={l.label} className="flex items-center gap-1.5 px-1 py-0.5">
                    <span className={`h-2.5 w-2.5 rounded-full shadow-sm ${l.dot}`} />
                    <span className="text-[10px] font-bold text-slate-500">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekdays indicator */}
            <div className="mb-1.5 grid grid-cols-7 gap-2 shrink-0 border-b border-slate-100 pb-2">
              {WEEKDAYS.map(d => (
                <div key={d} className={`py-1 text-center text-[10px] font-extrabold uppercase tracking-widest ${
                  d === 'Sun' || d === 'Sat' ? 'text-blue-500' : 'text-slate-400'
                }`}>
                  {d}
                </div>
              ))}
            </div>

            {/* Grid Container */}
            <div className="pr-1">
              <div className="grid grid-cols-7 gap-2 transition-all duration-300 ease-in-out">
                  {/* Leading padding empty cells */}
                  {[...Array(firstDayOfWeek)].map((_, i) => (
                    <div key={`pad-${i}`} className="min-h-16 rounded-xl border border-dashed border-slate-100 bg-slate-50/10" />
                  ))}

                  {/* Calendar day cells */}
                  {selectedEmp && Object.keys(calData).map(dayStr => {
                    const day = parseInt(dayStr)
                    const dayItem = calData[day]
                    const isToday =
                      day === now.getDate() &&
                      month === now.getMonth() &&
                      year === now.getFullYear()

                    const audit = getAuditIndicator(dayItem.log)
                    const isDateSelected = selectedDates.includes(dayItem.dateStr)

                    return (
                      <div
                        key={day}
                        onClick={() => {
                          if (bulkMode) {
                            setSelectedDates(prev =>
                              prev.includes(dayItem.dateStr)
                                ? prev.filter(d => d !== dayItem.dateStr)
                                : [...prev, dayItem.dateStr]
                            )
                          } else {
                            setActiveDayRecord(dayItem)
                          }
                        }}
                        className={`group relative flex min-h-20 cursor-pointer flex-col justify-between rounded-xl border p-2.5 transition-all duration-200 select-none ${dayItem.style.cell} ${
                          isDateSelected ? 'ring-2 ring-blue-600 ring-offset-1 bg-blue-50/50 border-blue-400 shadow-sm' : ''
                        } ${isToday ? 'ring-2 ring-emerald-500 ring-offset-2 shadow-sm' : ''}`}
                      >
                        {/* Day indicator & Selection Checkbox overlay */}
                        <div className="flex items-center justify-between shrink-0">
                          <span className="text-[10px] font-extrabold opacity-40 leading-none">{day}</span>
                          
                          <div className="flex items-center gap-1">
                            {bulkMode && (
                              <input
                                type="checkbox"
                                checked={isDateSelected}
                                readOnly
                                className="h-3.5 w-3.5 rounded border-slate-350 accent-blue-600 focus:ring-blue-500 cursor-pointer pointer-events-none"
                              />
                            )}
                            {audit && (
                              <span className={`h-1.5 w-1.5 rounded-full ${
                                audit === 'auto' ? 'bg-green-500' : audit === 'manual' ? 'bg-yellow-500' : 'bg-red-500'
                              }`} title={
                                audit === 'auto' ? 'Auto Clocked-In' : audit === 'manual' ? 'Manual regularisation' : 'Direct Admin update'
                              } />
                            )}
                          </div>
                        </div>

                        {/* Status abbreviation centered */}
                        <div className="my-1 text-center relative">
                          <span className="text-sm font-extrabold tracking-wide">{dayItem.style.ind}</span>
                          {dayItem.status === 'Late' && (
                            <span className="absolute -top-1 -right-1 rounded-full bg-orange-100 px-1 py-0.5 text-[7px] font-extrabold text-orange-700 leading-none tracking-tight">
                              LATE
                            </span>
                          )}
                        </div>

                        {/* Stacked Check-In / Check-Out details inside cell */}
                        <div className="mt-auto pt-1 border-t border-slate-100/30 text-[8px] font-bold text-slate-650 leading-tight">
                          {dayItem.log?.check_in_at ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[7.5px] text-slate-400">In: <span className="text-slate-800 font-extrabold">{fmtTime(dayItem.log.check_in_at).split(' ')[0]}</span></span>
                              {dayItem.log?.check_out_at && (
                                <span className="text-[7.5px] text-slate-400">Out: <span className="text-slate-700 font-extrabold">{fmtTime(dayItem.log.check_out_at).split(' ')[0]}</span></span>
                              )}
                            </div>
                          ) : dayItem.holidayName ? (
                            <span className="truncate text-purple-650 leading-none block max-w-16" title={dayItem.holidayName}>{dayItem.holidayName}</span>
                          ) : dayItem.status === 'WO' ? (
                            <span className="text-blue-500 font-extrabold opacity-70">Weekend</span>
                          ) : dayItem.status === 'A' ? (
                            <span className="text-red-500 font-extrabold opacity-70">Absent</span>
                          ) : (
                            <span className="opacity-40 font-medium">—</span>
                          )}
                        </div>

                        {/* Hover Insights Popover card using pure Tailwind */}
                        <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-3 w-56 -translate-x-1/2 rounded-2xl border border-slate-150 bg-white p-3.5 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-2 shrink-0">
                            <span className="text-xs font-bold text-slate-800">{MONTHS[month]} {day}, {year}</span>
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-extrabold border ${
                              dayItem.status === 'P' ? 'bg-green-50 text-green-700 border-green-200' :
                              dayItem.status === 'A' ? 'bg-red-50 text-red-650 border-red-200' :
                              dayItem.status === 'L' ? 'bg-yellow-50 text-yellow-700 border-yellow-250' : 'bg-slate-50 text-slate-650'
                            }`}>
                              {dayItem.style.label}
                            </span>
                          </div>

                          <div className="space-y-1.5 text-[10px]">
                            <div className="flex justify-between">
                              <span className="text-slate-400 font-semibold">Check-In</span>
                              <span className="font-bold text-slate-805">{dayItem.log?.check_in_at ? fmtTime(dayItem.log.check_in_at) : '—'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400 font-semibold">Check-Out</span>
                              <span className="font-bold text-slate-850">{dayItem.log?.check_out_at ? fmtTime(dayItem.log.check_out_at) : '—'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400 font-semibold">Working Hours</span>
                              <span className="font-bold text-slate-805">{dayItem.log?.working_hours ? `${dayItem.log.working_hours} hrs` : '—'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400 font-semibold">Method</span>
                              <span className="font-bold text-slate-805">{dayItem.log?.source ? String(dayItem.log.source).toUpperCase() : '—'}</span>
                            </div>

                            {dayItem.log?.notes && (
                              <div className="mt-1 border-t border-slate-100 pt-1.5 text-[9px] text-slate-500 italic max-h-12 overflow-hidden truncate">
                                "{dayItem.log.notes}"
                              </div>
                            )}

                            {audit && (
                              <div className="mt-1 flex items-center gap-1 border-t border-slate-100 pt-1 text-[8px] font-bold text-slate-450 uppercase">
                                <span className={`h-1.5 w-1.5 rounded-full ${
                                  audit === 'auto' ? 'bg-green-500' : audit === 'manual' ? 'bg-yellow-500' : 'bg-red-500'
                                }`} />
                                {audit === 'auto' ? 'Auto-recorded entry' : audit === 'manual' ? 'Manual regularized' : 'Direct override edit'}
                              </div>
                            )}
                          </div>
                        </div>

                      </div>
                    )
                  })}
              </div>
            </div>

            {/* Dynamic Footer summary stats */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-slate-50/70 border border-slate-200 px-5 py-3.5 shrink-0">
              <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-650">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Total payable days:</span>
                  <span className="text-sm text-blue-700 bg-blue-50 border border-blue-150 rounded-lg px-2.5 py-0.5">{stats.payable} days</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Total logged hours:</span>
                  <span className="text-sm text-slate-800">{stats.totalWorkingHrs} hrs</span>
                </div>
                {parseFloat(stats.overtimeHrs) > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">Overtime:</span>
                    <span className="text-sm text-teal-600 bg-teal-50 border border-teal-150 rounded-lg px-2 py-0.5">+{stats.overtimeHrs} hrs</span>
                  </div>
                )}
              </div>

              <div className="text-[10px] font-bold text-slate-400 tracking-wider">
                PAYABLE CYCLE: 1st to {daysInMonth}th of {MONTHS[month]}
              </div>
            </div>

          </div>
        </div>

      </motion.div>

      {/* ══ DAY INTERACTION DETAIL MODAL ═══════════════════════════ */}
      <AnimatePresence>
        {activeDayRecord && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => setActiveDayRecord(null)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 15 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="fixed inset-x-4 bottom-0 z-50 mx-auto flex max-h-[85vh] max-w-md flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl"
            >
              {/* Header */}
              <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Attendance Log details</h3>
                  <p className="text-[11px] text-slate-500 font-semibold">{activeDayRecord.dateStr}</p>
                </div>
                <button
                  onClick={() => setActiveDayRecord(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-650"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                
                {/* Visual Status Indicator */}
                <div className="flex items-center justify-between rounded-xl border border-slate-150 bg-slate-50/30 p-3.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{activeDayRecord.style.ind}</span>
                    <span className="text-xs font-bold text-slate-705">Roster Status</span>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-extrabold border ${
                    activeDayRecord.status === 'P' ? 'bg-green-50 text-green-700 border-green-200' :
                    activeDayRecord.status === 'A' ? 'bg-red-50 text-red-600 border-red-150' : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}>
                    {activeDayRecord.style.label}
                  </span>
                </div>

                {/* Timings summary */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5 shadow-sm text-xs">
                  <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Punch Log</h4>
                  <div className="flex justify-between">
                    <span className="text-slate-550 font-semibold">Check-In Time</span>
                    <span className="font-bold text-slate-800">{activeDayRecord.log?.check_in_at ? fmtTime(activeDayRecord.log.check_in_at) : '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-550 font-semibold">Check-Out Time</span>
                    <span className="font-bold text-slate-800">{activeDayRecord.log?.check_out_at ? fmtTime(activeDayRecord.log.check_out_at) : '—'}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-2">
                    <span className="text-slate-550 font-bold">Total Working Hours</span>
                    <span className="font-bold text-teal-650">{activeDayRecord.log?.working_hours ? `${activeDayRecord.log.working_hours} hrs` : '—'}</span>
                  </div>
                </div>

                {/* Location and Method */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5 shadow-sm text-xs">
                  <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Metadata Info</h4>
                  <div className="flex justify-between">
                    <span className="text-slate-550 font-semibold">Device Source</span>
                    <span className="font-bold text-slate-800">{activeDayRecord.log?.source ? String(activeDayRecord.log.source).toUpperCase() : '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-550 font-semibold">Logged Location</span>
                    <span className="font-bold text-slate-800">{activeDayRecord.log?.location || 'Main Office'}</span>
                  </div>
                </div>

                {/* Audit trail comments */}
                {activeDayRecord.log?.notes && (
                  <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50/50 p-3.5 text-xs text-amber-900 italic">
                    <Info className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
                    <div>
                      <span className="font-bold block not-italic text-amber-800 mb-0.5">Audit Note:</span>
                      "{activeDayRecord.log.notes}"
                    </div>
                  </div>
                )}

                {/* Quick actions for admins */}
                {canManage && (
                  <div className="border-t border-slate-150 pt-4 space-y-2 shrink-0">
                    <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-2">Admin Quick Actions</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setOverrideForm({
                            checkIn: activeDayRecord.log?.check_in_at ? fmtTime(activeDayRecord.log.check_in_at) : '09:00 AM',
                            checkOut: activeDayRecord.log?.check_out_at ? fmtTime(activeDayRecord.log.check_out_at) : '06:00 PM',
                            isWfh: activeDayRecord.status === 'WFH',
                            notes: activeDayRecord.log?.notes || 'Admin calendar entry regularization override.'
                          });
                          setShowDirectModal(true);
                        }}
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition active:scale-95 shadow-sm"
                      >
                        <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
                        Direct Edit / Override
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm('Mark employee present for this day (09:00 AM - 06:00 PM)?')) return;
                          try {
                            const payload = {
                              check_in_time: new Date(`${activeDayRecord.dateStr}T09:00:00`).toISOString(),
                              check_out_time: new Date(`${activeDayRecord.dateStr}T18:00:00`).toISOString(),
                              is_wfh: false,
                              admin_notes: 'QUICK_PUNCH: Marked Present by administrator'
                            };
                            await attendanceService.adminUpdateLog(selectedEmp.id, payload);
                            setActiveDayRecord(null);
                            await fetchMonthlyLogs();
                          } catch (err) {
                            alert(err.message || 'Quick punch failed');
                          }
                        }}
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition active:scale-95 shadow-sm"
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                        Quick Mark Present
                      </button>
                    </div>
                  </div>
                )}

              </div>

              {/* Footer */}
              <div className="flex shrink-0 items-center justify-end border-t border-slate-100 bg-white px-6 py-4">
                <button
                  onClick={() => setActiveDayRecord(null)}
                  className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-705 transition hover:bg-slate-50 w-full"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ══ DIRECT OVERRIDE FORM INLINE OVERLAY MODAL ══════════════ */}
      <AnimatePresence>
        {showDirectModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowDirectModal(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 15 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="fixed inset-x-4 bottom-0 z-[60] mx-auto flex max-h-[85vh] max-w-sm flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl"
            >
              {/* Header */}
              <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Direct Calendar Override</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Override record for {selectedEmp?.first_name}</p>
                </div>
                <button
                  onClick={() => setShowDirectModal(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                {/* Inputs */}
                <div className="space-y-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">Check-In Time</label>
                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
                      <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                      <input
                        type="text"
                        value={overrideForm.checkIn}
                        onChange={e => setOverrideForm(prev => ({ ...prev, checkIn: e.target.value }))}
                        placeholder="e.g. 09:05 AM"
                        className="flex-1 text-xs text-slate-700 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">Check-Out Time</label>
                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
                      <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                      <input
                        type="text"
                        value={overrideForm.checkOut}
                        onChange={e => setOverrideForm(prev => ({ ...prev, checkOut: e.target.value }))}
                        placeholder="e.g. 06:12 PM"
                        className="flex-1 text-xs text-slate-700 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-650 py-1 select-none">
                      <input
                        type="checkbox"
                        checked={overrideForm.isWfh}
                        onChange={e => setOverrideForm(prev => ({ ...prev, isWfh: e.target.checked }))}
                        className="h-4 w-4 rounded border-slate-350 accent-blue-600"
                      />
                      WFH / Remote Duty
                    </label>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">Audit Notes (Reason)</label>
                    <textarea
                      rows={2.5}
                      value={overrideForm.notes}
                      onChange={e => setOverrideForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Audit justification notes..."
                      className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-100 bg-white px-6 py-4">
                <button
                  onClick={() => setShowDirectModal(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDirectOverride}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm transition active:scale-95"
                >
                  Override Roster
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ══ FLOATING BULK ACTION BAR ════════════════════════════════ */}
      {bulkMode && (
        <div className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 flex items-center justify-between gap-6 rounded-2xl bg-slate-900 px-6 py-4 shadow-2xl border border-slate-800 text-white min-w-[550px]">
          <div className="flex items-center gap-4 text-sm font-semibold">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 shrink-0">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="font-extrabold text-white">{selectedEmpIds.length} Employees Selected</div>
              <div className="text-[11px] text-slate-400 font-medium">{selectedDates.length} Dates Highlighted</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              disabled={bulkLoading}
              onClick={() => {
                if (selectedEmpIds.length === 0) {
                  alert("⚠️ Please select at least one employee using the checkboxes in the left panel first!")
                  return
                }
                if (selectedDates.length === 0) {
                  alert("⚠️ Please select at least one date by clicking on the days in the calendar grid first!")
                  return
                }
                setBulkForm({
                  checkIn: '09:30',
                  checkOut: '18:30',
                  isWfh: false,
                  notes: 'Bulk regularization by administrator.'
                })
                setActiveBulkAction('mark_present')
              }}
              className="rounded-xl bg-green-650 px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition active:scale-95 flex items-center gap-1.5"
            >
              <CheckSquare className="h-4 w-4" />
              Bulk Punch
            </button>
            <button
              onClick={() => {
                setBulkMode(false)
                setSelectedEmpIds([])
                setSelectedDates([])
              }}
              className="rounded-xl border border-slate-700 hover:bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-300 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ══ BATCH PROGRESS LOADING OVERLAY ══════════════════════════ */}
      {bulkLoading && (
        <div className="fixed inset-0 z-[150] flex flex-col items-center justify-center bg-black/60 backdrop-blur-md text-white">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 p-4 shadow-xl mb-4">
            <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <h3 className="text-base font-extrabold tracking-tight">Applying Mass Attendance Seed...</h3>
          <p className="text-sm font-bold text-blue-400 mt-1">{bulkProgress}</p>
        </div>
      )}

      {/* ══ BULK ACTIONS MODAL ═══════════════════════════════════════ */}
      <AnimatePresence>
        {activeBulkAction && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] bg-black/45 backdrop-blur-sm"
              onClick={() => setActiveBulkAction(null)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 15 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="fixed inset-x-4 bottom-0 z-[95] mx-auto flex max-h-[85vh] max-w-sm flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl"
            >
              {/* Header */}
              <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Bulk Punch Confirmation
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Modifying {selectedEmpIds.length} employees over {selectedDates.length} dates
                  </p>
                </div>
                <button
                  onClick={() => setActiveBulkAction(null)}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-650"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                <div className="space-y-4">
                  <div className="rounded-xl bg-blue-50/50 border border-blue-200 p-4 text-xs font-semibold text-blue-850 leading-relaxed">
                    💡 You are about to mass seed attendance records for <strong className="text-blue-900">{selectedEmpIds.length} selected employees</strong> over <strong className="text-blue-900">{selectedDates.length} selected days</strong>. 
                    <div className="mt-2">This will stamp them all as <strong>Present (09:00 AM - 06:00 PM)</strong> with source marked as <strong>Manual (Bulk Action)</strong>.</div>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/30">
                    <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Dates Selected ({selectedDates.length})</div>
                    <div className="max-h-24 overflow-y-auto flex flex-wrap gap-1.5">
                      {selectedDates.map(d => (
                        <span key={d} className="text-[10px] font-bold bg-white text-slate-700 border border-slate-200 px-2 py-0.5 rounded-lg">{d}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-100 bg-white px-6 py-4">
                <button
                  onClick={() => setActiveBulkAction(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleBulkSubmit(activeBulkAction, bulkForm)}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-extrabold text-white hover:bg-blue-700 shadow-sm transition active:scale-95"
                >
                  Apply Bulk Punch
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  )
}

export default MonthlyAttendancePage
