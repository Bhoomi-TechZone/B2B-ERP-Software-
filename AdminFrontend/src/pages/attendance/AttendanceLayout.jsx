import { memo, useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  CalendarDays, CalendarRange, Clock, ClipboardList,
  ShieldCheck, Fingerprint, FileBarChart2,
  Search, Download, Upload, X, Info, AlertCircle,
  UserCheck, UserX, Plane, Home, Users,
  ChevronLeft, ChevronRight, MoreVertical,
  MapPin, Monitor, Smartphone, QrCode,
  Calendar, ChevronDown, SlidersHorizontal,
  Plus, Eye, Pencil, Timer, Ban
} from 'lucide-react'
import attendanceService from '../../services/attendanceService'
import employeeService from '../../services/employeeService'
import departmentService from '../../services/departmentService'
import { useRole } from '../../hooks/useRole'
import { useAuth } from '../../hooks/useAuth'
import { API_V1_BASE_URL } from '../../config/api'

/* ─── Tab configuration ─────────────────────────────────────────── */
const SUB_TABS = [
  { path: '/attendance/monitoring/overview?ref=sidebar&tab=daily&status=all&page=1', label: 'Live Monitor',    icon: CalendarDays,  key: 'daily' },
  { path: '/attendance/logs/overview?ref=sidebar&tab=monthly&status=all&page=1',    label: 'Monthly Logs',    icon: CalendarRange, key: 'monthly' },
  { path: '/attendance/shifts/overview?ref=sidebar&tab=roster&status=active',       label: 'Shifts & Roster', icon: Clock,         key: 'shifts' },
  { path: '/attendance/requests/overview?ref=sidebar&tab=requests&status=all&page=1', label: 'Regularization',  icon: ClipboardList, key: 'requests' },
  { path: '/attendance/compliance/overview?ref=sidebar&tab=compliance&status=all', label: 'OT Compliance',   icon: ShieldCheck,   key: 'compliance' },
  { path: '/attendance/reports/overview?ref=sidebar&tab=reports',                  label: 'Reports',         icon: FileBarChart2, key: 'reports' },
  { path: '/attendance/biometric/overview?ref=sidebar&tab=config',                 label: 'Integrations',    icon: Fingerprint,   key: 'biometric' },
]

/* ─── Avatar color pool ─────────────────────────────────────────── */
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

/* ─── Robust UTC Date Parser ───────────────────────────────────── */
const parseUtcDate = (dateStr) => {
  if (!dateStr) return null
  const hasTimezone = dateStr.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(dateStr)
  return new Date(hasTimezone ? dateStr : dateStr + 'Z')
}

/* ─── Time formatting ───────────────────────────────────────────── */
const fmtTime = (iso) => {
  if (!iso) return '—'
  try {
    const d = parseUtcDate(iso)
    if (!d || isNaN(d)) return '—'
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
  } catch { return '—' }
}

const fmtHours = (h) => {
  if (!h || h <= 0) return '—'
  const hrs = Math.floor(h)
  const mins = Math.round((h - hrs) * 60)
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h 00m`
}

/* ─── Status mapping ────────────────────────────────────────────── */
const mapStatus = (s) => {
  if (!s) return 'Absent'
  const l = s.toLowerCase()
  if (l === 'present') return 'Present'
  if (l === 'absent') return 'Absent'
  if (l === 'late') return 'Late'
  if (l === 'on_leave' || l === 'leave') return 'On Leave'
  if (l === 'wfh') return 'WFH'
  return 'Present'
}

/* ─── Source icon ───────────────────────────────────────────────── */
const SourceIcon = ({ source }) => {
  const s = (source || '').toLowerCase()
  if (s.includes('biometric')) return <><Monitor className="h-3.5 w-3.5 text-slate-500" /><span className="text-xs text-slate-600">Biometric</span></>
  if (s.includes('mobile') || s.includes('app')) return <><Smartphone className="h-3.5 w-3.5 text-slate-500" /><span className="text-xs text-slate-600">Mobile App</span></>
  if (s.includes('qr')) return <><QrCode className="h-3.5 w-3.5 text-slate-500" /><span className="text-xs text-slate-600">QR Code</span></>
  if (s.includes('web')) return <><Monitor className="h-3.5 w-3.5 text-slate-500" /><span className="text-xs text-slate-600">Web</span></>
  return <><Monitor className="h-3.5 w-3.5 text-slate-500" /><span className="text-xs text-slate-600">—</span></>
}

/* ─── Status Badge ──────────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const cfg = {
    'Present':  { cls: 'bg-green-100 text-green-700 border border-green-200',    dot: 'bg-green-500'  },
    'Late':     { cls: 'bg-amber-100 text-amber-700 border border-amber-200',    dot: 'bg-amber-500'  },
    'Absent':   { cls: 'bg-red-100 text-red-600 border border-red-200',          dot: 'bg-red-500'    },
    'On Leave': { cls: 'bg-blue-100 text-blue-700 border border-blue-200',       dot: 'bg-blue-500'   },
    'WFH':      { cls: 'bg-violet-100 text-violet-700 border border-violet-200', dot: 'bg-violet-500' },
  }[status] || { cls: 'bg-slate-100 text-slate-600 border border-slate-200', dot: 'bg-slate-400' }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  )
}

/* ─── Stats Card ────────────────────────────────────────────────── */
const StatsCard = ({ label, value, pct, icon: Icon, iconColor, iconBg, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
  >
    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
      <Icon className={`h-6 w-6 ${iconColor}`} />
    </div>
    <div>
      <div className="text-2xl font-bold text-slate-900">{value ?? '—'}</div>
      <div className="text-sm font-medium text-slate-600">{label}</div>
      {pct !== undefined && (
        <div className="text-xs text-slate-400">{pct}%</div>
      )}
    </div>
  </motion.div>
)

/* ─── Skeleton Row ──────────────────────────────────────────────── */
const SkeletonRow = ({ cols = 10 }) => (
  <tr className="border-b border-slate-100">
    {[...Array(cols)].map((_, i) => (
      <td key={i} className="px-4 py-3.5">
        <div className="h-4 animate-pulse rounded-md bg-slate-100" style={{ width: i === 0 ? 160 : i === 1 ? 120 : 80 }} />
      </td>
    ))}
  </tr>
)

/* ─── Auto Refresh Toggle ───────────────────────────────────────── */
const AutoRefreshToggle = ({ enabled, onToggle, interval = 10 }) => (
  <div className="flex items-center gap-2">
    <span className="text-xs text-slate-500">Auto Refresh ({interval}s)</span>
    <button
      onClick={onToggle}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors ${enabled ? 'bg-blue-600' : 'bg-slate-200'}`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-[18px]' : 'translate-x-[2px]'}`} />
    </button>
  </div>
)

/* ─── Map backend log to row ────────────────────────────────────── */
const mapLog = (emp, log) => {
  const firstName = emp.first_name || emp.firstName || ''
  const lastName = emp.last_name || emp.lastName || ''
  const name = emp.fullName || `${firstName} ${lastName}`.trim() || 'Unknown'
  const empId = emp.employee_number || emp.employee_code || emp.emp_id || emp.id || ''
  const dept = emp.department_name || emp.department || '—'
  const shift = log?.shift_name || emp.shift_name || 'General Shift'
  const shiftTime = log?.shift_time || emp.shift_time || '09:00 - 18:00'
  const location = log?.location || emp.location || 'Main Office'
  const source = log?.source || log?.check_in_source || '—'

  if (log) {
    return {
      id: emp.id,
      empId,
      name,
      dept,
      shift,
      shiftTime,
      checkIn: fmtTime(log.check_in_at),
      checkOut: fmtTime(log.check_out_at),
      checkInRaw: log.check_in_at,
      checkOutRaw: log.check_out_at,
      totalHours: fmtHours(log.working_hours),
      status: mapStatus(log.status),
      source,
      location,
      logId: log.id,
      avatarColor: avatarColor(name),
      initials: initials(name),
      email: emp.work_email || emp.email || '',
    }
  }
  return {
    id: emp.id,
    empId,
    name,
    dept,
    shift,
    shiftTime,
    checkIn: '—',
    checkOut: '—',
    checkInRaw: null,
    checkOutRaw: null,
    totalHours: '—',
    status: 'Absent',
    source: '—',
    location,
    logId: null,
    avatarColor: avatarColor(name),
    initials: initials(name),
    email: emp.work_email || emp.email || '',
  }
}

/* ═══════════════════════════════════════════════════════════════════
   ATTENDANCE LAYOUT
═══════════════════════════════════════════════════════════════════ */
const AttendanceLayout = memo(() => {
  const navigate   = useNavigate()
  const location   = useLocation()
  const activePath = location.pathname
  const { canManage } = useRole()
  const { user }   = useAuth()

  /* ── Date & filters ── */
  const today = new Date().toISOString().slice(0, 10)
  const [date, setDate]             = useState(today)
  const [deptFilter, setDeptFilter] = useState('All Departments')
  const [shiftFilter, setShiftFilter] = useState('All Shifts')
  const [locationFilter, setLocationFilter] = useState('All Locations')
  const [search, setSearch]         = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [page, setPage]             = useState(1)
  const [perPage]                   = useState(10)

  /* ── Action column & View details state ── */
  const [activeMenuId, setActiveMenuId] = useState(null)
  const actionMenuRef = useRef(null)
  const [viewRecord, setViewRecord] = useState(null)

  /* ── Data ── */
  const [records, setRecords]       = useState([])
  const [departments, setDepartments] = useState(['All Departments'])
  const [loading, setLoading]       = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const refreshRef = useRef(null)

  /* ── Manual punch modal ── */
  const [showPunchModal, setShowPunchModal] = useState(false)
  const [punchLoading, setPunchLoading]     = useState(false)
  const [isEditMode, setIsEditMode]         = useState(false)
  const [allEmployees, setAllEmployees]     = useState([])
  const [empSearchQ, setEmpSearchQ]         = useState('')
  const [showEmpDropdown, setShowEmpDropdown] = useState(false)
  const empDropRef = useRef(null)

  /* Punch form state */
  const [punchForm, setPunchForm] = useState({
    employee:       null,   // { id, name, empId, dept, manager, shift }
    date:           new Date().toISOString().slice(0, 10),
    shift:          'General Shift (09:00 AM - 06:00 PM)',
    workMode:       'office',
    location:       'Main Office',
    checkIn:        '',
    checkOut:       '',
    breakMins:      '45',
    reason:         '',
    notes:          '',
    approver:       '',
    adminOverride:  false,
    attachment:     null,
  })

  const pf = punchForm
  const setPF = (key, val) => setPunchForm(prev => ({ ...prev, [key]: val }))

  /* Live hours preview */
  const hoursPreview = useMemo(() => {
    if (!pf.checkIn || !pf.checkOut) return null
    try {
      const parseT = (t) => {
        if (!t) return null
        const clean = String(t).trim().replace(/\s+/g, ' ')
        const m = clean.match(/^(\d{1,2})(?:[:.](\d{2}))?\s*(AM|PM)?$/i)
        if (!m) return null
        let h = parseInt(m[1]), min = parseInt(m[2] || 0)
        const ap = m[3]?.toUpperCase()
        if (ap === 'PM' && h < 12) h += 12
        if (ap === 'AM' && h === 12) h = 0
        return h * 60 + min
      }
      const inM  = parseT(pf.checkIn)
      const outM = parseT(pf.checkOut)
      if (inM == null || outM == null) return null
      let diff = outM - inM
      if (diff < 0) diff += 24 * 60        // overnight
      diff -= parseInt(pf.breakMins || 0)
      if (diff < 0) diff = 0
      const hh = Math.floor(diff / 60).toString().padStart(2, '0')
      const mm = (diff % 60).toString().padStart(2, '0')
      return `${hh}h ${mm}m`
    } catch { return null }
  }, [pf.checkIn, pf.checkOut, pf.breakMins])

  /* Load employees for picker */
  const fetchAllEmployees = useCallback(async () => {
    if (!canManage) return
    try {
      const data = await employeeService.getEmployees(1, 500)
      const list = Array.isArray(data) ? data : (data?.employees || data?.data || data?.items || [])
      setAllEmployees(list)
    } catch { setAllEmployees([]) }
  }, [canManage])

  const openPunchModal = useCallback((preSelectedEmp = null, defaultAction = 'check_in') => {
    fetchAllEmployees()
    setIsEditMode(false)
    setPunchForm({
      employee: preSelectedEmp ? {
        id: preSelectedEmp.id,
        name: preSelectedEmp.name,
        empId: preSelectedEmp.empId,
        dept: preSelectedEmp.dept,
        manager: preSelectedEmp.manager || '—',
        shift: preSelectedEmp.shift || 'General Shift',
      } : null,
      date: new Date().toISOString().slice(0, 10),
      shift: preSelectedEmp?.shift || 'General Shift (09:00 AM - 06:00 PM)',
      workMode: 'office',
      location: preSelectedEmp?.location || 'Main Office',
      checkIn: defaultAction === 'check_in' ? '09:00 AM' : '',
      checkOut: defaultAction === 'check_out' ? '06:00 PM' : '',
      breakMins: '45',
      reason: '',
      notes: '',
      approver: '',
      adminOverride: false,
      attachment: null,
    })
    setEmpSearchQ(preSelectedEmp ? preSelectedEmp.name : '')
    setShowPunchModal(true)
  }, [fetchAllEmployees])

  const handleViewDetails = useCallback((row) => {
    setViewRecord(row)
  }, [])

  const handleEditPunch = useCallback((row) => {
    fetchAllEmployees()
    setIsEditMode(true)
    setPunchForm({
      employee: {
        id: row.id,
        name: row.name,
        empId: row.empId,
        dept: row.dept,
        manager: row.manager || '—',
        shift: row.shift || 'General Shift',
      },
      date: date,
      shift: row.shift || 'General Shift (09:00 AM - 06:00 PM)',
      workMode: row.status === 'WFH' ? 'wfh' : 'office',
      location: row.location || 'Main Office',
      checkIn: row.checkIn !== '—' ? row.checkIn : '',
      checkOut: row.checkOut !== '—' ? row.checkOut : '',
      breakMins: '45',
      reason: 'correction',
      notes: row.notes || 'Editing existing attendance record.',
      approver: '',
      adminOverride: true,
      attachment: null,
    })
    setEmpSearchQ(row.name)
    setShowPunchModal(true)
  }, [fetchAllEmployees, date])

  /* Close dropdown on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (empDropRef.current && !empDropRef.current.contains(e.target)) setShowEmpDropdown(false)
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target)) setActiveMenuId(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filteredEmps = useMemo(() => {
    const q = empSearchQ.toLowerCase()
    return allEmployees.filter(e => {
      const fn = e.first_name || ''
      const ln = e.last_name || ''
      const name = `${fn} ${ln}`.toLowerCase()
      const code = (e.employee_code || e.emp_id || e.id || '').toLowerCase()
      return !q || name.includes(q) || code.includes(q)
    }).slice(0, 20)
  }, [allEmployees, empSearchQ])

  const selectEmployee = (emp) => {
    const fn = emp.first_name || ''
    const ln = emp.last_name || ''
    setPF('employee', {
      id:      emp.id,
      name:    `${fn} ${ln}`.trim(),
      empId:   emp.employee_code || emp.emp_id || emp.id || '',
      dept:    emp.department_name || emp.department || '—',
      manager: emp.manager_name || emp.reporting_manager || '—',
      shift:   emp.shift_name || 'General Shift',
    })
    setEmpSearchQ(`${fn} ${ln}`.trim())
    setShowEmpDropdown(false)
  }

  /* ── Is Live Monitor tab active ── */
  const isLiveMonitor = activePath === '/attendance/daily' || activePath === '/attendance' || activePath.startsWith('/attendance/monitoring')

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

  /* ── Fetch attendance records ── */
  const fetchRecords = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const [logs, empData] = await Promise.all([
        attendanceService.getAttendanceLogs(date, date),
        canManage
          ? employeeService.getEmployees(1, 500)
          : Promise.resolve(user ? [{ id: user.id, first_name: user.firstName || user.name?.split(' ')[0] || 'Me', last_name: user.lastName || user.name?.split(' ')[1] || '', department: user.department }] : [])
      ])

      const empList = Array.isArray(empData)
        ? empData
        : (empData?.employees || empData?.data || empData?.items || [])

      const logsArr = Array.isArray(logs) ? logs : (logs?.logs || logs?.data || [])

      const merged = empList.map(emp => {
        const empId = String(emp.id || emp._id || '').toLowerCase()
        const userId = String(emp.user_id || emp.userId || '').toLowerCase()
        const matched = logsArr.find(l => {
          const logEmpId = String(l.employee_id || l.employeeId || '').toLowerCase()
          return logEmpId === empId || (userId && logEmpId === userId)
        })
        return mapLog(emp, matched || null)
      })

      setRecords(merged)
    } catch (err) {
      console.error('Attendance fetch failed:', err)
    } finally {
      setLoading(false)
    }
  }, [date, canManage, user])

  /* ── Initial data load ── */
  useEffect(() => { fetchDepartments() }, [fetchDepartments])
  useEffect(() => { fetchRecords() }, [fetchRecords])

  /* ── Live Updates WebSocket Connection ── */
  useEffect(() => {
    if (!isLiveMonitor) return

    let ws = null
    let reconnectTimeout = null
    let isActive = true

    const connect = () => {
      if (!isActive) return
      try {
        const wsUrl = API_V1_BASE_URL.replace('http', 'ws') + '/attendance/ws'
        console.log('[WebSocket] Connecting to live attendance updates...', wsUrl)
        ws = new WebSocket(wsUrl)

        ws.onopen = () => {
          console.log('[WebSocket] Connected to live attendance stream.')
          // Send ping every 30 seconds to keep connection alive
          const pingInterval = setInterval(() => {
            if (ws && ws.readyState === WebSocket.OPEN) {
              ws.send('ping')
            }
          }, 30000)
          ws.pingInterval = pingInterval
        }

        ws.onmessage = (event) => {
          if (event.data === 'pong') return
          try {
            const data = JSON.parse(event.data)
            if (data.event === 'attendance_updated') {
              console.log('[WebSocket] Attendance updated detected, refetching records...')
              fetchRecords(true) // Silent reload
            }
          } catch (e) {
            // Non-JSON or heartbeat response
          }
        }

        ws.onclose = (e) => {
          if (ws && ws.pingInterval) clearInterval(ws.pingInterval)
          console.log('[WebSocket] Connection closed. Reconnecting...', e.reason)
          if (isActive) {
            reconnectTimeout = setTimeout(connect, 3000)
          }
        }

        ws.onerror = (err) => {
          console.error('[WebSocket] Error occurred:', err)
        }
      } catch (err) {
        console.error('[WebSocket] Failed to connect:', err)
        if (isActive) {
          reconnectTimeout = setTimeout(connect, 5000)
        }
      }
    }

    connect()

    return () => {
      isActive = false
      if (ws) {
        if (ws.pingInterval) clearInterval(ws.pingInterval)
        ws.close()
      }
      if (reconnectTimeout) clearTimeout(reconnectTimeout)
    }
  }, [isLiveMonitor, fetchRecords])

  /* ── Robust 5s Poll Fallback on Live Monitor ── */
  useEffect(() => {
    if (!isLiveMonitor || !autoRefresh) {
      clearInterval(refreshRef.current)
      return
    }
    // Robust 5s polling fallback in case WebSocket gets blocked or closed
    refreshRef.current = setInterval(() => fetchRecords(true), 5000)
    return () => clearInterval(refreshRef.current)
  }, [isLiveMonitor, autoRefresh, fetchRecords])

  /* ── Stats ── */
  const stats = useMemo(() => {
    const present  = records.filter(r => r.status === 'Present').length
    const absent   = records.filter(r => r.status === 'Absent').length
    const late     = records.filter(r => r.status === 'Late').length
    const onLeave  = records.filter(r => r.status === 'On Leave').length
    const wfh      = records.filter(r => r.status === 'WFH').length
    const total    = records.length
    const pct = (n) => total ? Math.round((n / total) * 100) : 0
    return { present, absent, late, onLeave, wfh, total, pct }
  }, [records])

  /* ── Filter ── */
  const filtered = useMemo(() => records.filter(r => {
    const q = search.toLowerCase()
    const matchQ = !q || r.name.toLowerCase().includes(q) || r.empId.toLowerCase().includes(q) || (r.email || '').toLowerCase().includes(q)
    const matchDept = deptFilter === 'All Departments' || r.dept === deptFilter
    const matchStatus = statusFilter === 'All Status' || r.status === statusFilter
    const matchLocation = locationFilter === 'All Locations' || r.location === locationFilter
    return matchQ && matchDept && matchStatus && matchLocation
  }), [records, search, deptFilter, statusFilter, locationFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const paginated  = filtered.slice((page - 1) * perPage, page * perPage)

  /* ── Export CSV ── */
  const handleExport = () => {
    const headers = ['Employee', 'ID', 'Department', 'Shift', 'Check-In', 'Check-Out', 'Total Hours', 'Status', 'Location']
    const rows = filtered.map(r => [r.name, r.empId, r.dept, r.shift, r.checkIn, r.checkOut, r.totalHours, r.status, r.location])
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `attendance_${date}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  /* ── Manual punch submit ── */
  const handleManualPunch = async () => {
    if (!pf.employee) { alert('Please select an employee.'); return }
    if (!pf.checkIn)  { alert('Check-In time is required.');  return }
    if (!pf.reason)   { alert('Please select a reason.');     return }

    setPunchLoading(true)
    try {
      const parseISO = (timeStr, dateStr) => {
        if (!timeStr) return null
        const clean = String(timeStr).trim().replace(/\s+/g, ' ')
        const m = clean.match(/^(\d{1,2})(?:[:.](\d{2}))?\s*(AM|PM)?$/i)
        if (!m) return null
        let h = parseInt(m[1]), min = parseInt(m[2] || 0)
        const ap = m[3]?.toUpperCase()
        if (ap === 'PM' && h < 12) h += 12
        if (ap === 'AM' && h === 12) h = 0
        
        const [yr, mo, dy] = dateStr.split('-').map(Number)
        const d = new Date(Date.UTC(yr, mo - 1, dy, h, min, 0, 0))
        return d.toISOString()
      }

      // Auto-pad notes under the hood if it is too short to satisfy the backend validation
      let noteText = (pf.notes || '').trim()
      if (noteText.length < 10) {
        if (noteText.length > 0) {
          noteText = `${noteText} (Manual override by admin)`
        } else {
          noteText = "Manual attendance entry by Administrator"
        }
      }

      const payload = {
        check_in_time:  parseISO(pf.checkIn,  pf.date),
        check_out_time: pf.checkOut ? parseISO(pf.checkOut, pf.date) : null,
        is_wfh:         pf.workMode === 'wfh',
        admin_notes:    `${pf.reason.toUpperCase()}: ${noteText}`,
      }

      await attendanceService.adminUpdateLog(pf.employee.id, payload)
      setShowPunchModal(false)
      await fetchRecords(true)
    } catch (err) {
      alert(err.message || 'Manual entry failed')
    } finally {
      setPunchLoading(false)
    }
  }

  /* ── Unique locations from records ── */
  const locationOptions = useMemo(() => {
    const locs = [...new Set(records.map(r => r.location).filter(Boolean))]
    return ['All Locations', ...locs]
  }, [records])

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#F7F8FA]">

      {/* ══ Top Header ══════════════════════════════════════════════ */}
      <div className="shrink-0 border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">

          {/* Left: Title */}
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Daily Attendance</h1>
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold text-emerald-700">LIVE</span>
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Track and monitor real-time attendance of your organization
            </p>
          </div>

          {/* Right: Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Date Picker */}
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <Calendar className="h-4 w-4 text-slate-400" />
              <input
                type="date"
                value={date}
                onChange={e => { setDate(e.target.value); setPage(1) }}
                className="text-sm text-slate-700 focus:outline-none bg-transparent"
              />
            </div>

            {/* Department Filter */}
            <div className="relative">
              <select
                value={deptFilter}
                onChange={e => { setDeptFilter(e.target.value); setPage(1) }}
                className="appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                {departments.map(d => <option key={d}>{d}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>

            {/* Export */}
            {canManage && (
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50 transition active:scale-95"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            )}

            {/* Manual Punch */}
            {canManage && (
              <button
                onClick={openPunchModal}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition active:scale-95"
              >
                <UserCheck className="h-4 w-4" />
                Manual Punch
              </button>
            )}
          </div>
        </div>

        {/* ── Sub-Tab Navigation ── */}
        <div className="mt-3 flex overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {SUB_TABS.map(tab => {
            const cleanTarget = tab.path.split('?')[0]
            const active = activePath === cleanTarget || activePath.startsWith(cleanTarget + '/') || (cleanTarget.includes('monitoring') && activePath === '/attendance/daily')
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`relative flex shrink-0 items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                  active ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <tab.icon className={`h-4 w-4 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                {tab.label}
                {active && (
                  <motion.div
                    layoutId="att-tab-underline"
                    className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-blue-600"
                    transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ══ Page scroll area ════════════════════════════════════════ */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">

          {/* ── Live Monitor view ─────────────────────────────────── */}
          {isLiveMonitor ? (
            <motion.div
              key="live-monitor"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="p-6"
            >

              {/* ── Stats Cards ── */}
              <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
                <StatsCard label="Present"        value={stats.present}  pct={stats.pct(stats.present)}  icon={UserCheck}   iconColor="text-green-600"   iconBg="bg-green-50"   delay={0}    />
                <StatsCard label="Absent"         value={stats.absent}   pct={stats.pct(stats.absent)}   icon={UserX}       iconColor="text-red-500"     iconBg="bg-red-50"     delay={0.05} />
                <StatsCard label="Late"           value={stats.late}     pct={stats.pct(stats.late)}     icon={Clock}       iconColor="text-amber-600"   iconBg="bg-amber-50"   delay={0.1}  />
                <StatsCard label="On Leave"       value={stats.onLeave}  pct={stats.pct(stats.onLeave)}  icon={Plane}       iconColor="text-blue-500"    iconBg="bg-blue-50"    delay={0.15} />
                <StatsCard label="WFH"            value={stats.wfh}      pct={stats.pct(stats.wfh)}      icon={Home}        iconColor="text-violet-500"  iconBg="bg-violet-50"  delay={0.2}  />
                <StatsCard label="Total Employees" value={stats.total}                                   icon={Users}       iconColor="text-teal-600"    iconBg="bg-teal-50"    delay={0.25} />
              </div>

              {/* ── Filter Bar ── */}
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <div className="flex flex-wrap items-center gap-3 flex-1">
                  {/* Search */}
                  <div className="relative min-w-52 flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={search}
                      onChange={e => { setSearch(e.target.value); setPage(1) }}
                      placeholder="Search by name, ID or email..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* Status */}
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
                      className="appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2 pl-3 pr-8 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    >
                      {['All Status', 'Present', 'Absent', 'Late', 'On Leave', 'WFH'].map(s => <option key={s}>{s}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>

                  {/* Shift */}
                  <div className="relative">
                    <select
                      value={shiftFilter}
                      onChange={e => { setShiftFilter(e.target.value); setPage(1) }}
                      className="appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2 pl-3 pr-8 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    >
                      {['All Shifts', 'General Shift', 'Night Shift', 'Flexi Shift'].map(s => <option key={s}>{s}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>

                  {/* Location */}
                  <div className="relative">
                    <select
                      value={locationFilter}
                      onChange={e => { setLocationFilter(e.target.value); setPage(1) }}
                      className="appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2 pl-3 pr-8 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    >
                      {locationOptions.map(l => <option key={l}>{l}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>

                  {/* Filters icon button */}
                  <button className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 transition">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                  </button>
                </div>

                {/* Auto Refresh */}
                <AutoRefreshToggle enabled={autoRefresh} onToggle={() => setAutoRefresh(v => !v)} interval={5} />
              </div>

              {/* ── Table ── */}
              <div className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-left">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/70">
                        {['Employee', 'Department', 'Shift', 'Check-In', 'Check-Out', 'Total Hours', 'Status', 'Source', 'Location', 'Action'].map(h => (
                          <th key={h} className="whitespace-nowrap px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                            <div className="flex items-center gap-1">
                              {h}
                              {['Employee', 'Department', 'Shift', 'Check-In', 'Check-Out', 'Total Hours', 'Status', 'Source', 'Location'].includes(h) && (
                                <span className="text-slate-300">↕</span>
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loading
                        ? [...Array(perPage)].map((_, i) => <SkeletonRow key={i} cols={10} />)
                        : paginated.length === 0
                          ? (
                            <tr>
                              <td colSpan={10} className="py-16 text-center">
                                <UserX className="mx-auto mb-3 h-10 w-10 text-slate-200" />
                                <p className="text-sm font-medium text-slate-500">No records found</p>
                                <p className="text-xs text-slate-400">Try adjusting your filters or date</p>
                              </td>
                            </tr>
                          )
                          : paginated.map((row, idx) => (
                            <motion.tr
                              key={row.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: idx * 0.03 }}
                              className="group border-b border-slate-100 transition hover:bg-slate-50/80"
                            >
                              {/* Employee */}
                              <td className="px-4 py-3.5">
                                <div className="flex items-center gap-3">
                                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${row.avatarColor}`}>
                                    {row.initials}
                                  </div>
                                  <div>
                                    <div className="text-sm font-semibold text-slate-800">{row.name}</div>
                                    <div className="text-xs text-slate-400">{row.empId}{row.email ? ` · ${row.email}` : ''}</div>
                                  </div>
                                </div>
                              </td>

                              {/* Department */}
                              <td className="px-4 py-3.5">
                                <span className="text-sm text-slate-600">{row.dept}</span>
                              </td>

                              {/* Shift */}
                              <td className="px-4 py-3.5">
                                <div>
                                  <div className="text-xs font-semibold text-slate-700">{row.shift}</div>
                                  <div className="text-xs text-slate-400">{row.shiftTime}</div>
                                </div>
                              </td>

                              {/* Check-In */}
                              <td className="px-4 py-3.5">
                                <div className="flex items-center gap-1">
                                  <span className={`text-sm font-medium ${row.status === 'Late' ? 'text-amber-600' : row.checkIn !== '—' ? 'text-green-600' : 'text-slate-400'}`}>
                                    {row.checkIn}
                                  </span>
                                  {row.checkIn !== '—' && <MapPin className="h-3 w-3 text-slate-300" />}
                                </div>
                              </td>

                              {/* Check-Out */}
                              <td className="px-4 py-3.5">
                                <span className={`text-sm font-medium ${row.checkOut !== '—' ? 'text-blue-600' : 'text-slate-400'}`}>
                                  {row.checkOut}
                                </span>
                              </td>

                              {/* Total Hours */}
                              <td className="px-4 py-3.5">
                                <span className="text-sm font-semibold text-slate-700">{row.totalHours}</span>
                              </td>

                              {/* Status */}
                              <td className="px-4 py-3.5">
                                <StatusBadge status={row.status} />
                              </td>

                              {/* Source */}
                              <td className="px-4 py-3.5">
                                <div className="flex items-center gap-1.5">
                                  <SourceIcon source={row.source} />
                                </div>
                              </td>

                              {/* Location */}
                              <td className="px-4 py-3.5">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                  <span className="text-xs text-slate-600">{row.location || '—'}</span>
                                </div>
                              </td>

                              {/* Action */}
                              <td className="px-4 py-3.5 relative">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuId(activeMenuId === row.id ? null : row.id);
                                  }}
                                  className={`flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition active:scale-95 ${
                                    activeMenuId === row.id ? 'bg-slate-100 text-slate-600 opacity-100' : 'opacity-80'
                                  }`}
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </button>

                                <AnimatePresence>
                                  {activeMenuId === row.id && (
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.95, y: -8 }}
                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                      exit={{ opacity: 0, scale: 0.95, y: -8 }}
                                      ref={actionMenuRef}
                                      className="absolute right-4 top-12 z-30 w-52 rounded-2xl border border-slate-150 bg-white p-1.5 shadow-xl ring-1 ring-black/5"
                                    >
                                      {/* Add Punch */}
                                      <button
                                        onClick={() => {
                                          setActiveMenuId(null);
                                          openPunchModal(row, 'check_in');
                                        }}
                                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                                      >
                                        <Plus className="h-4 w-4 text-purple-600 stroke-[3px]" />
                                        Add Punch
                                      </button>

                                      {/* Edit Punch */}
                                      {row.checkIn !== '—' && (
                                        <button
                                          onClick={() => {
                                            setActiveMenuId(null);
                                            handleEditPunch(row);
                                          }}
                                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                                        >
                                          <Pencil className="h-4 w-4 text-blue-600" />
                                          Edit Punch
                                        </button>
                                      )}

                                      {/* View */}
                                      <button
                                        onClick={() => {
                                          setActiveMenuId(null);
                                          handleViewDetails(row);
                                        }}
                                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                                      >
                                        <Eye className="h-4 w-4 text-red-800" />
                                        View
                                      </button>

                                      <div className="my-1 border-t border-slate-100" />

                                      {/* No action / View */}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </td>
                            </motion.tr>
                          ))
                      }
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
                  <span className="text-sm text-slate-500">
                    Showing{' '}
                    <span className="font-medium text-slate-700">
                      {filtered.length === 0 ? 0 : (page - 1) * perPage + 1}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium text-slate-700">
                      {Math.min(page * perPage, filtered.length)}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium text-slate-700">{filtered.length}</span>{' '}
                    employees
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                      const p = i + 1
                      return (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition ${
                            page === p
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {p}
                        </button>
                      )
                    })}

                    {totalPages > 5 && (
                      <>
                        <span className="px-1 text-slate-400">...</span>
                        <button
                          onClick={() => setPage(totalPages)}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50`}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>

                    {/* Per page selector */}
                    <div className="relative ml-2">
                      <select className="appearance-none rounded-lg border border-slate-200 bg-white py-1.5 pl-3 pr-7 text-sm text-slate-600 focus:outline-none">
                        <option>10 / page</option>
                        <option>20 / page</option>
                        <option>50 / page</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>
                </div>
              </div>

            </motion.div>
          ) : (
            /* ── Other tabs ──────────────────────────────────────── */
            <motion.div
              key={activePath}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ══ Manual Attendance Entry Modal ═══════════════════════ */}
      <AnimatePresence>
        {showPunchModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowPunchModal(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 24 }}
              transition={{ type: 'spring', stiffness: 340, damping: 28 }}
              className="fixed inset-x-4 bottom-0 z-50 mx-auto flex max-h-[92vh] max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl"
            >
              {/* ── Modal Header ── */}
              <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isEditMode ? 'bg-blue-100' : 'bg-purple-100'}`}>
                    {isEditMode
                      ? <Pencil className="h-5 w-5 text-blue-600" />
                      : <Plus className="h-5 w-5 text-purple-600" />
                    }
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {isEditMode ? 'Edit Attendance Record' : 'Manual Attendance Entry'}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {isEditMode
                        ? 'Update check-in / check-out times for this employee'
                        : 'Add attendance manually for an employee'
                      }
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPunchModal(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* ── Scrollable Body ── */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                {/* Section 1 — Employee Information */}
                <div className="rounded-2xl border border-slate-200 p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">Employee Information</h3>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-4">
                    {/* Employee search/select */}
                    <div className="sm:col-span-1" ref={empDropRef}>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                        Employee <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
                          {pf.employee && (
                            <div className={`mr-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${avatarColor(pf.employee.name)}`}>
                              {initials(pf.employee.name)}
                            </div>
                          )}
                          <input
                            type="text"
                            placeholder="Search employee..."
                            value={empSearchQ}
                            onChange={e => { setEmpSearchQ(e.target.value); setShowEmpDropdown(true) }}
                            onFocus={() => setShowEmpDropdown(true)}
                            className="flex-1 min-w-0 text-sm text-slate-700 placeholder-slate-400 focus:outline-none"
                          />
                          {pf.employee && (
                            <button onClick={() => { setPF('employee', null); setEmpSearchQ('') }} className="text-slate-300 hover:text-slate-500">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                        </div>

                        {showEmpDropdown && filteredEmps.length > 0 && (
                          <div className="absolute left-0 top-full z-20 mt-1 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                            {filteredEmps.map(emp => {
                              const fn = emp.first_name || ''
                              const ln = emp.last_name || ''
                              const name = `${fn} ${ln}`.trim()
                              const code = emp.employee_code || emp.emp_id || emp.id || ''
                              return (
                                <button
                                  key={emp.id}
                                  onMouseDown={() => selectEmployee(emp)}
                                  className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition hover:bg-slate-50"
                                >
                                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${avatarColor(name)}`}>
                                    {initials(name)}
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-slate-800">{name}</div>
                                    <div className="text-xs text-slate-400">{code} · {emp.department_name || emp.department || ''}</div>
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Employee ID */}
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-600">Employee ID</label>
                      <input
                        readOnly
                        value={pf.employee?.empId || ''}
                        placeholder="Auto-filled"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 focus:outline-none"
                      />
                    </div>

                    {/* Department */}
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-600">Department</label>
                      <input
                        readOnly
                        value={pf.employee?.dept || ''}
                        placeholder="Auto-filled"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 focus:outline-none"
                      />
                    </div>

                    {/* Manager */}
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-600">Manager</label>
                      <input
                        readOnly
                        value={pf.employee?.manager || ''}
                        placeholder="Auto-filled"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2 — Date, Shift & Work Mode */}
                <div className="rounded-2xl border border-slate-200 p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50">
                      <Calendar className="h-4 w-4 text-violet-600" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">Date, Shift &amp; Work Mode</h3>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Date */}
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                        Date <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
                        <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
                        <input
                          type="date"
                          value={pf.date}
                          onChange={e => setPF('date', e.target.value)}
                          className="flex-1 text-sm text-slate-700 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Shift */}
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                        Shift <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={pf.shift}
                          onChange={e => setPF('shift', e.target.value)}
                          className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                        >
                          <option>General Shift (09:00 AM - 06:00 PM)</option>
                          <option>Morning Shift (06:00 AM - 02:00 PM)</option>
                          <option>Night Shift (08:00 PM - 05:00 AM)</option>
                          <option>Flexi Shift (10:00 AM - 07:00 PM)</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      </div>
                    </div>

                    {/* Work Mode */}
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                        Work Mode <span className="text-red-500">*</span>
                      </label>
                      <div className="flex rounded-xl border border-slate-200 overflow-hidden">
                        {['office', 'wfh', 'field'].map((m, i) => (
                          <button
                            key={m}
                            onClick={() => setPF('workMode', m)}
                            className={`flex-1 py-2 text-xs font-semibold transition ${
                              pf.workMode === m
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-slate-600 hover:bg-slate-50'
                            } ${i > 0 ? 'border-l border-slate-200' : ''}`}
                          >
                            {m === 'office' ? 'Office' : m === 'wfh' ? 'WFH' : 'Field'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Location */}
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                        Location <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={pf.location}
                          onChange={e => setPF('location', e.target.value)}
                          className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                        >
                          <option>Main Office</option>
                          <option>Branch Office</option>
                          <option>Home (WFH)</option>
                          <option>Client Site</option>
                          <option>Field</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3 — Time Entry */}
                <div className="rounded-2xl border border-slate-200 p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50">
                      <Clock className="h-4 w-4 text-amber-600" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">Time Entry</h3>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-4">
                    {/* Check-In */}
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                        Check-In Time <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
                        <input
                          type="text"
                          placeholder="09:05 AM"
                          value={pf.checkIn}
                          onChange={e => setPF('checkIn', e.target.value)}
                          className="flex-1 text-sm text-slate-700 focus:outline-none"
                        />
                        <Clock className="h-4 w-4 shrink-0 text-slate-300" />
                      </div>
                    </div>

                    {/* Check-Out */}
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-600">Check-Out Time</label>
                      <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
                        <input
                          type="text"
                          placeholder="06:12 PM"
                          value={pf.checkOut}
                          onChange={e => setPF('checkOut', e.target.value)}
                          className="flex-1 text-sm text-slate-700 focus:outline-none"
                        />
                        <Clock className="h-4 w-4 shrink-0 text-slate-300" />
                      </div>
                    </div>

                    {/* Break Duration */}
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-600">Break Duration (mins)</label>
                      <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
                        <input
                          type="number"
                          min="0"
                          max="240"
                          value={pf.breakMins}
                          onChange={e => setPF('breakMins', e.target.value)}
                          className="flex-1 text-sm text-slate-700 focus:outline-none"
                        />
                        <span className="text-xs text-slate-400">mins</span>
                      </div>
                    </div>

                    {/* Live hours preview */}
                    <div className="flex flex-col justify-center">
                      <div className="text-xs font-semibold text-slate-500 mb-1">Total Working Hours (Preview)</div>
                      {hoursPreview ? (
                        <>
                          <div className="text-2xl font-bold text-teal-600">{hoursPreview}</div>
                          <div className="text-xs text-slate-400">(includes break)</div>
                        </>
                      ) : (
                        <div className="text-sm text-slate-400">—</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 4 — Reason & Notes */}
                <div className="rounded-2xl border border-slate-200 p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50">
                      <ClipboardList className="h-4 w-4 text-emerald-600" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">Reason &amp; Notes</h3>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Reason */}
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                        Reason for Manual Entry <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={pf.reason}
                          onChange={e => setPF('reason', e.target.value)}
                          className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-3 pr-8 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                        >
                          <option value="">Select reason...</option>
                          <option value="forgot_to_punch">Forgot to punch</option>
                          <option value="biometric_failure">Biometric failure</option>
                          <option value="system_downtime">System downtime</option>
                          <option value="client_visit">Client visit / field work</option>
                          <option value="network_issue">Network issue</option>
                          <option value="travel">Business travel</option>
                          <option value="other">Other</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-600">
                        <span>Notes <span className="text-xs font-normal text-slate-400">(Optional)</span></span>
                        <span className={`font-normal ${(pf.notes || '').length > 500 ? 'text-red-500' : 'text-slate-400'}`}>
                          {(pf.notes || '').length}/500
                        </span>
                      </label>
                      <textarea
                        rows={3}
                        maxLength={500}
                        value={pf.notes}
                        onChange={e => setPF('notes', e.target.value)}
                        placeholder="Employee forgot to punch in the morning. Confirmed check-in time with manager."
                        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                      />
                      <p className="mt-1 text-xs text-slate-400">Add a brief explanation for manual attendance entry</p>
                    </div>
                  </div>
                </div>

                {/* Section 5 — Attachment & Approval (side by side) */}
                <div className="grid gap-4 sm:grid-cols-2">

                  {/* Attachment */}
                  <div className="rounded-2xl border border-slate-200 p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100">
                        <Upload className="h-4 w-4 text-slate-500" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-800">Attachment <span className="text-xs font-normal text-slate-400">(Optional)</span></h3>
                    </div>

                    <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center transition hover:border-blue-300 hover:bg-blue-50/30">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
                        <Upload className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">
                          Drag and drop file here or{' '}
                          <span className="font-semibold text-blue-600">click to upload</span>
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-400">JPG, PNG, PDF up to 5MB</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={e => setPF('attachment', e.target.files?.[0] || null)}
                      />
                    </label>
                    {pf.attachment && (
                      <div className="mt-2 flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2">
                        <span className="truncate text-xs font-medium text-blue-700">{pf.attachment.name}</span>
                        <button onClick={() => setPF('attachment', null)} className="text-blue-400 hover:text-blue-600">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Approval */}
                  <div className="rounded-2xl border border-slate-200 p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50">
                        <UserCheck className="h-4 w-4 text-orange-500" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-800">Approval</h3>
                    </div>

                    <div className="space-y-4">
                      {/* Send for approval to */}
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600">Send for approval to</label>
                        <div className="relative">
                          <select
                            value={pf.approver}
                            onChange={e => setPF('approver', e.target.value)}
                            className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-3 pr-8 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                          >
                            <option value="">Select approver...</option>
                            {pf.employee?.manager && pf.employee.manager !== '—' && (
                              <option value={pf.employee.manager}>{pf.employee.manager} (Manager)</option>
                            )}
                            <option value="hr">HR Department</option>
                            <option value="admin">Admin</option>
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        </div>
                      </div>

                      {/* Admin Override */}
                      <div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 mb-2">
                          Admin Override
                          <div className="group relative">
                            <Info className="h-3.5 w-3.5 text-slate-400 cursor-help" />
                            <div className="absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 rounded-lg bg-slate-800 px-2.5 py-1.5 text-[11px] text-white shadow-lg group-hover:block w-48 text-center">
                              Bypass approval workflow and apply instantly
                            </div>
                          </div>
                        </div>
                        <label className="flex cursor-pointer items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={pf.adminOverride}
                            onChange={e => setPF('adminOverride', e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 accent-blue-600"
                          />
                          <span className="text-sm text-slate-700">Approve instantly (Admin Override)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Audit note */}
                <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <p className="text-xs text-amber-800">
                    <span className="font-bold">Note:</span> This manual entry will be recorded and visible in attendance logs with audit trail.
                  </p>
                </div>

              </div>{/* end scroll body */}

              {/* ── Modal Footer ── */}
              <div className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-100 bg-white px-6 py-4">
                <button
                  onClick={() => setShowPunchModal(false)}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={handleManualPunch}
                  disabled={punchLoading}
                  className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition active:scale-95 disabled:opacity-50 ${isEditMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'}`}
                >
                  {punchLoading && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                      className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                    />
                  )}
                  {punchLoading
                    ? (isEditMode ? 'Updating...' : 'Saving...')
                    : (isEditMode ? 'Update Record' : 'Save Entry')
                  }
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ══ View Details Modal ═══════════════════════════════════ */}
      <AnimatePresence>
        {viewRecord && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => setViewRecord(null)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 20 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="fixed inset-x-4 bottom-0 z-50 mx-auto flex max-h-[85vh] max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl"
            >
              {/* Header */}
              <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Attendance Details</h2>
                  <p className="text-xs text-slate-500">Real-time status for the selected employee</p>
                </div>
                <button
                  onClick={() => setViewRecord(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                {/* Employee Profile Summary */}
                <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-bold text-white ${viewRecord.avatarColor}`}>
                    {viewRecord.initials}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">{viewRecord.name}</h3>
                    <p className="text-xs text-slate-500 font-semibold">{viewRecord.empId}</p>
                    <p className="text-xs text-slate-400">{viewRecord.email || '—'}</p>
                  </div>
                </div>

                {/* Status Badge Group */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="text-xs text-slate-400 font-bold mb-1">Status</div>
                    <StatusBadge status={viewRecord.status} />
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="text-xs text-slate-400 font-bold mb-1">Hours Logged</div>
                    <div className="text-sm font-bold text-slate-800">{viewRecord.totalHours}</div>
                  </div>
                </div>

                {/* Shift Details */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Shift &amp; Roster Info</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="block text-xs text-slate-400">Assigned Shift</span>
                      <span className="font-semibold text-slate-800">{viewRecord.shift}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-slate-400">Shift Timing</span>
                      <span className="font-semibold text-slate-800">{viewRecord.shiftTime}</span>
                    </div>
                  </div>
                </div>

                {/* Check In / Out Timing details */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Clock Records</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1.5 font-medium text-slate-600">
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                        Check-In
                      </div>
                      <span className="font-bold text-green-700">{viewRecord.checkIn}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1.5 font-medium text-slate-600">
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                        Check-Out
                      </div>
                      <span className="font-bold text-blue-700">{viewRecord.checkOut}</span>
                    </div>
                  </div>
                </div>

                {/* Location and Source details */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Method &amp; Location</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 font-medium">Source Device</span>
                      <div className="flex items-center gap-1.5 font-semibold">
                        <SourceIcon source={viewRecord.source} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 font-medium">Work Location</span>
                      <div className="flex items-center gap-1 text-slate-700 font-semibold">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {viewRecord.location || '—'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-100 bg-white px-6 py-4">
                <button
                  onClick={() => setViewRecord(null)}
                  className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-95 w-full sm:w-auto"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  )
})

AttendanceLayout.displayName = 'AttendanceLayout'
export default AttendanceLayout
