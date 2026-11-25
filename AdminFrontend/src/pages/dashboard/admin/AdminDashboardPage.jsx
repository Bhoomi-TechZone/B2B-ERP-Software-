import { useState, memo, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Users, CheckCircle2, CalendarClock, Banknote,
  AlertTriangle, ChevronLeft, ChevronRight, ArrowRight,
  CalendarDays, Clock, UserPlus, BarChart2,
  Megaphone, ClipboardList, Check, TrendingUp, TrendingDown, Minus,
  Calendar, FileText, User, Loader2
} from 'lucide-react'
import AddEmployeeModal from '../../../components/AddEmployeeModal'
import { useAuth } from '../../../hooks/useAuth'
import { isModuleActive } from '../../../config/navigation'
import adminDashboardService from '../../../services/adminDashboardService'

// ─── Constants ───────────────────────────────────────────────────────────────
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS_SHORT  = ['SUN','MON','TUE','WED','THU','FRI','SAT']

const trendIcons = {
  up:     { icon: TrendingUp,   color: 'text-green-500' },
  down:   { icon: TrendingDown, color: 'text-red-500'   },
  stable: { icon: Minus,        color: 'text-slate-400' },
}

// ─── Animation variants ──────────────────────────────────────────────────────
const pageVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}
const fadeUp = {
  hidden:  { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
}
const spring = { type: 'spring', stiffness: 380, damping: 26 }

// ─── MiniCalendar ────────────────────────────────────────────────────────────
function MiniCalendar({ schedule }) {
  const today = new Date()
  const [year,  setYear]  = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const firstDay    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const isCurrentM  = year === today.getFullYear() && month === today.getMonth()

  // Find unique dates from schedule
  // Mock logic assuming schedule has format "Apr 23" or similar
  const eventDates = new Set()
  if (schedule) {
    schedule.forEach(ev => {
      // Very basic extraction, e.g. "Apr 23" -> 23
      const match = ev.time.match(/\b(\d{1,2})\b/)
      if (match) eventDates.add(parseInt(match[1]))
    })
  }

  const prev = () => month === 0  ? (setMonth(11), setYear(y => y - 1)) : setMonth(m => m - 1)
  const next = () => month === 11 ? (setMonth(0),  setYear(y => y + 1)) : setMonth(m => m + 1)

  return (
    <div className="select-none">
      <div className="mb-4 flex items-center justify-between">
        <motion.button onClick={prev} whileHover={{ scale: 1.15, backgroundColor: '#e2e8f0' }} whileTap={{ scale: 0.9 }}
          className="rounded-lg p-1.5 text-slate-400 transition">
          <ChevronLeft className="h-4 w-4" />
        </motion.button>
        <AnimatePresence mode="wait">
          <motion.span key={`${year}-${month}`}
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2 }}
            className="text-sm font-bold text-slate-800">
            {MONTH_NAMES[month]} {year}
          </motion.span>
        </AnimatePresence>
        <motion.button onClick={next} whileHover={{ scale: 1.15, backgroundColor: '#e2e8f0' }} whileTap={{ scale: 0.9 }}
          className="rounded-lg p-1.5 text-slate-400 transition">
          <ChevronRight className="h-4 w-4" />
        </motion.button>
      </div>

      <div className="mb-1 grid grid-cols-7 text-center">
        {DAYS_SHORT.map(d => (
          <div key={d} className={`py-1 text-[10px] font-bold ${d === 'SUN' || d === 'SAT' ? 'text-slate-300' : 'text-slate-400'}`}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`b${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const d = i + 1
          const isToday  = isCurrentM && d === today.getDate()
          const hasEvent = eventDates.has(d)
          return (
            <motion.div key={d}
              whileHover={{ scale: 1.25 }}
              whileTap={{ scale: 0.9 }}
              transition={spring}
              className={`relative mx-auto flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-xs font-semibold
                ${isToday ? 'bg-violet-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>
              {d}
              {hasEvent && !isToday && (
                <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-violet-400" />
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// ─── DonutChart ──────────────────────────────────────────────────────────────
function DonutChart({ departments }) {
  const r    = 42
  const circ = 2 * Math.PI * r
  const COLORS = ['#6366f1','#f59e0b','#10b981','#f43f5e','#3b82f6','#8b5cf6']
  const deptTotal = departments?.reduce((s, d) => s + d.headcount, 0) || 1

  const segs = (departments || []).map((d, i) => {
    const pct    = d.headcount / deptTotal
    const cumPct = departments.slice(0, i).reduce((s, dep) => s + dep.headcount / deptTotal, 0)
    const dash   = pct * circ
    const off    = circ * 0.25 - cumPct * circ
    return { ...d, pct, dash, off, color: COLORS[i % COLORS.length] }
  })

  if (!departments || departments.length === 0) {
    return <div className="text-center py-6 text-sm text-slate-500">No data available</div>
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div className="relative" whileHover={{ rotate: 3, scale: 1.05 }} transition={spring}>
        <svg viewBox="0 0 100 100" className="h-36 w-36 -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#f1f5f9" strokeWidth="13" />
          {segs.map((s, i) => (
            <motion.circle key={s.name} cx="50" cy="50" r={r} fill="none"
              stroke={s.color} strokeWidth="13"
              strokeDasharray={`${s.dash} ${circ - s.dash}`}
              strokeDashoffset={s.off}
              strokeLinecap="butt"
              initial={{ strokeDasharray: `0 ${circ}` }}
              animate={{ strokeDasharray: `${s.dash} ${circ - s.dash}` }}
              transition={{ duration: 1, delay: i * 0.12, ease: [0.34, 1.56, 0.64, 1] }}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[10px] text-slate-400">Engagement by</p>
          <p className="text-xs font-bold text-slate-700">Departments</p>
        </div>
      </motion.div>

      <div className="grid w-full grid-cols-2 gap-x-4 gap-y-1.5">
        {segs.map((s, i) => (
          <motion.div key={s.name} className="flex items-center gap-1.5"
            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.08 }}
            whileHover={{ x: 3 }}>
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.color }} />
            <span className="truncate text-[11px] text-slate-600">{s.name}</span>
            <span className="ml-auto text-[11px] font-bold text-slate-700">{Math.round(s.pct * 100)}%</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ─── PriorityBadge ───────────────────────────────────────────────────────────
function PriorityBadge({ p }) {
  const cls = p === 'Critical' ? 'bg-red-600 text-white'
    : p === 'High'   ? 'bg-green-600 text-white'
    : p === 'Medium' ? 'bg-blue-700 text-white'
    : 'bg-orange-100 text-orange-600'
  return <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${cls}`}>{p}</span>
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const AdminDashboardPage = memo(() => {
  const { tenant } = useAuth()
  
  const hasCrm = isModuleActive('crm', tenant?.modules)
  const hasPayroll = isModuleActive('payroll', tenant?.modules)
  const hasAttendance = isModuleActive('attendance', tenant?.modules)
  const hasLeave = isModuleActive('leave', tenant?.modules)

  const today    = new Date()
  const hour     = today.getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [absentPage, setAbsentPage] = useState(0)
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false)
  const PER_PAGE = 5

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await adminDashboardService.getDashboardStats()
      setData(response)
      setError(null)
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
      setError(err.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50">
        <div className="text-center text-slate-500">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600 mb-2" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-slate-50">
        <AlertTriangle className="h-10 w-10 text-red-500 mb-3" />
        <h3 className="text-lg font-bold text-slate-800">Oops! Something went wrong.</h3>
        <p className="text-sm text-slate-500 mb-4">{error}</p>
        <button onClick={fetchDashboardData} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
          Try Again
        </button>
      </div>
    )
  }

  const {
    attendance,
    departments,
    schedule,
    compliance,
    absentEmployees,
    activities,
    checklist,
    crm_stats
  } = data

  const totalAbsentPages = Math.ceil((absentEmployees?.length || 0) / PER_PAGE)
  const visibleAbsent    = (absentEmployees || []).slice(absentPage * PER_PAGE, absentPage * PER_PAGE + PER_PAGE)

  const completedSteps = (checklist || []).filter(c => c.completed).length
  const checklistPct   = checklist?.length ? Math.round((completedSteps / checklist.length) * 100) : 0

  // Quick actions based on modules
  const ALL_QUICK_ACTIONS = [
    { id: 'add_employee', label: 'Add Employee',      description: 'Add new employee to system', icon: UserPlus,     color: 'bg-linear-to-br from-blue-500 to-blue-600',      bg: 'bg-blue-50',    ring: 'hover:ring-blue-200', show: true },
    { id: 'run_payroll',  label: 'Run Payroll',       description: 'Process monthly payroll',    icon: Banknote,     color: 'bg-linear-to-br from-emerald-500 to-emerald-600', bg: 'bg-emerald-50', ring: 'hover:ring-emerald-200', show: hasPayroll },
    { id: 'approve_leaves', label: 'Approve Leaves',    description: 'Pending approvals',          icon: CheckCircle2, color: 'bg-linear-to-br from-amber-500 to-amber-600',    bg: 'bg-amber-50',   ring: 'hover:ring-amber-200', show: hasLeave },
    { id: 'mark_attendance', label: 'Mark Attendance',   description: "Mark today's attendance",    icon: ClipboardList,color: 'bg-linear-to-br from-purple-500 to-purple-600',  bg: 'bg-purple-50',  ring: 'hover:ring-purple-200', show: hasAttendance },
    { id: 'reports',      label: 'Generate Reports',  description: 'Create custom reports',      icon: BarChart2,    color: 'bg-linear-to-br from-rose-500 to-rose-600',      bg: 'bg-rose-50',    ring: 'hover:ring-rose-200', show: true },
    { id: 'announcement', label: 'Send Announcement', description: 'Notify all employees',       icon: Megaphone,    color: 'bg-linear-to-br from-indigo-500 to-indigo-600',  bg: 'bg-indigo-50',  ring: 'hover:ring-indigo-200', show: true },
  ]
  const QUICK_ACTIONS = ALL_QUICK_ACTIONS.filter(a => a.show)

  return (
    <div className="h-full overflow-y-auto bg-slate-50">
      <motion.div className="space-y-5 p-6" variants={pageVariants} initial="hidden" animate="visible">

        {/* ── 1. Greeting Banner ── */}
        <motion.div variants={fadeUp}
          whileHover={{ scale: 1.005, boxShadow: '0 8px 24px -4px rgb(0 0 0 / 0.10)' }}
          transition={spring}
          className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-linear-to-r from-slate-100 via-blue-50 to-indigo-100 border border-slate-200 px-6 py-4 shadow-sm cursor-default">
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ rotate: 8, scale: 1.1 }}
              transition={spring}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-lg font-bold text-slate-700 ring-2 ring-slate-300">
              A
            </motion.div>
            <div>
              <p className="text-sm text-slate-500">{greeting},</p>
              <p className="text-xl font-bold text-slate-800">Hi Admin! Here is Your Overview For Today</p>
            </div>
          </div>
          <motion.div whileHover={{ scale: 1.04 }} transition={spring}
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 shadow-sm border border-slate-200">
            <CalendarDays className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-semibold text-slate-700">
              {today.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </motion.div>
          <div className="flex items-center gap-5">
            {[
              { n: absentEmployees?.length || 0, l: 'Not Checked In' },
              { n: (checklist || []).filter(c => !c.completed).length,  l: 'Setup Pending'    },
              { n: compliance?.length || 0,                           l: 'Compliance Alerts' },
            ].map((s, i, arr) => (
              <div key={s.l} className="flex items-center gap-5">
                <motion.div className="text-center" whileHover={{ scale: 1.1 }} transition={spring}>
                  <p className="text-xl font-bold text-slate-800">{s.n}</p>
                  <p className="text-xs text-slate-500">{s.l}</p>
                </motion.div>
                {i < arr.length - 1 && <div className="h-8 w-px bg-slate-300" />}
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── 2. Summary Stat Cards ── */}
        <div className={`grid gap-4 sm:grid-cols-2 ${hasCrm ? 'lg:grid-cols-4' : 'lg:grid-cols-2'}`}>
          {/* 📊 Revenue Overview */}
          {hasCrm && crm_stats && (
            <motion.div variants={fadeUp}
              whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
              transition={spring}
              className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm cursor-default overflow-hidden relative">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <TrendingUp className="h-16 w-16 text-emerald-600" />
              </div>
              <div className="mb-4 flex items-center gap-2">
                <motion.div whileHover={{ rotate: -10, scale: 1.15 }} transition={spring}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100">
                  <Banknote className="h-5 w-5 text-emerald-600" />
                </motion.div>
                <span className="text-sm font-semibold text-slate-600">Total Revenue</span>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 tracking-tight">{crm_stats.totalRevenue}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-[11px] font-bold text-emerald-500">+{crm_stats.revenueGrowth}% <span className="font-medium text-slate-400 ml-0.5">vs last month</span></span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-slate-50 p-2 text-center">
                  <p className="text-xs font-bold text-slate-700">{crm_stats.pendingRevenue}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Pending</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-2 text-center">
                  <p className="text-xs font-bold text-slate-700">{crm_stats.collectedRevenue}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Collected</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* 🎯 CRM Leads Overview */}
          {hasCrm && crm_stats && (
            <motion.div variants={fadeUp}
              whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
              transition={spring}
              className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm cursor-default">
              <div className="mb-4 flex items-center gap-2">
                <motion.div whileHover={{ rotate: -10, scale: 1.15 }} transition={spring}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100">
                  <BarChart2 className="h-5 w-5 text-blue-600" />
                </motion.div>
                <span className="text-sm font-semibold text-slate-600">CRM Leads</span>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 tracking-tight">{crm_stats.totalLeads}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-blue-500" />
                  <span className="text-[11px] font-bold text-blue-500">{crm_stats.newLeadsToday} New Today <span className="font-medium text-slate-400 ml-0.5">/ {crm_stats.leadConversionRate}% conv.</span></span>
                </div>
              </div>
              <div className="mt-4 flex gap-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                 <div className="bg-blue-500 h-full w-[45%]" />
                 <div className="bg-amber-400 h-full w-[30%]" />
                 <div className="bg-emerald-500 h-full w-[25%]" />
              </div>
              <div className="mt-2 flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                <span>Leads</span>
                <span>Deals</span>
                <span>Won</span>
              </div>
            </motion.div>
          )}

          {/* 👥 Attendance Overview */}
          <motion.div variants={fadeUp}
            whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
            transition={spring}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm cursor-default">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <motion.div whileHover={{ rotate: -10, scale: 1.15 }} transition={spring}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100">
                  <Clock className="h-5 w-5 text-violet-600" />
                </motion.div>
                <span className="text-sm font-semibold text-slate-600">Attendance</span>
              </div>
              <span className="text-xs font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">{attendance?.rate || 0}% Rate</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { v: attendance?.present || 0, l: 'Present', c: 'text-emerald-600', bg: 'bg-emerald-50' },
                { v: attendance?.absent || 0,  l: 'Absent',  c: 'text-rose-500',    bg: 'bg-rose-50'    },
                { v: attendance?.late || 0,    l: 'Late',    c: 'text-amber-500',   bg: 'bg-amber-50'  },
                { v: attendance?.onLeave || 0, l: 'Leave',   c: 'text-blue-500',    bg: 'bg-blue-50'   },
              ].map(t => (
                <div key={t.l} className={`rounded-xl ${t.bg} p-2 text-center`}>
                  <p className={`text-base font-bold ${t.c}`}>{t.v}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{t.l}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* 🏢 Headcount & Depts */}
          <motion.div variants={fadeUp}
            whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
            transition={spring}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm cursor-default">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <motion.div whileHover={{ rotate: -10, scale: 1.15 }} transition={spring}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
                  <Users className="h-5 w-5 text-slate-600" />
                </motion.div>
                <span className="text-sm font-semibold text-slate-600">Total Workforce</span>
              </div>
              <span className="text-xs font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-full">{attendance?.total || 0} Total</span>
            </div>
            <div className="space-y-2.5">
              {(departments || []).slice(0, 3).map((d, i) => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                    <span className="text-xs font-medium text-slate-600">{d.name}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-800">{d.headcount}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── 3. Calendar + Schedule | Engagement + Alert ── */}
        <div className="grid gap-4 lg:grid-cols-3">

          {/* Calendar + Schedule */}
          <motion.div variants={fadeUp}
            whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
            transition={spring}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="grid gap-6 md:grid-cols-2">
              <MiniCalendar schedule={schedule} />
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800">Upcoming Schedule</h3>
                  <motion.button whileHover={{ x: 3 }} whileTap={{ scale: 0.95 }}
                    className="text-xs font-semibold text-blue-600 hover:underline">View All</motion.button>
                </div>
                <div className="space-y-2">
                  {(schedule || []).length === 0 && <p className="text-sm text-slate-400">No upcoming events.</p>}
                  {(schedule || []).map((s, i) => (
                    <motion.div key={s.id}
                      initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + i * 0.07, ...spring }}
                      whileHover={{ x: 6, scale: 1.02 }}
                      className={`cursor-pointer rounded-xl px-3.5 py-2.5 ${s.highlight ? 'bg-linear-to-r from-violet-600 to-indigo-600 text-white shadow-md' : 'bg-slate-50 hover:bg-slate-100'}`}>
                      <p className={`text-xs font-bold ${s.highlight ? 'text-white' : 'text-slate-800'}`}>{s.title}</p>
                      <p className={`mt-0.5 text-[11px] ${s.highlight ? 'text-white/75' : 'text-slate-400'}`}>{s.time}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right column */}
          <div className="space-y-4">
            <motion.div variants={fadeUp}
              whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
              transition={spring}
              className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-bold text-slate-800">Employee Engagement Chart</h3>
              <DonutChart departments={departments} />
            </motion.div>

            <motion.div variants={fadeUp}
              whileHover={{ scale: 1.03, boxShadow: '0 16px 40px -8px rgb(220 38 38 / 0.5)' }}
              whileTap={{ scale: 0.98 }}
              transition={spring}
              className="cursor-pointer rounded-2xl bg-red-600 p-5 shadow-sm text-white">
              <div className="flex items-start gap-3">
                <motion.div
                  animate={{ rotate: [0, -8, 8, -8, 0] }}
                  transition={{ repeat: Infinity, repeatDelay: 3, duration: 0.5 }}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20">
                  <AlertTriangle className="h-5 w-5" />
                </motion.div>
                <div>
                  <p className="text-base font-bold">{compliance?.length || 0} Action Needed</p>
                  <p className="mt-0.5 text-sm text-red-100">Action needs your attention</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── 4. Not Checked In ── */}
        {hasAttendance && (
          <motion.div variants={fadeUp}
            whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
            transition={spring}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">
                Not Checked In
                <motion.span whileHover={{ scale: 1.15 }} transition={spring}
                  className="ml-2 inline-block rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-600">{absentEmployees?.length || 0}</motion.span>
              </h3>
              <div className="flex items-center gap-2">
                <motion.button onClick={() => setAbsentPage(p => Math.max(0, p - 1))} disabled={absentPage === 0 || totalAbsentPages === 0}
                  whileHover={{ scale: 1.1, backgroundColor: '#f1f5f9' }} whileTap={{ scale: 0.9 }} transition={spring}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40">
                  <ChevronLeft className="h-4 w-4" />
                </motion.button>
                <motion.button onClick={() => setAbsentPage(p => Math.min(totalAbsentPages - 1, p + 1))} disabled={absentPage >= totalAbsentPages - 1}
                  whileHover={{ scale: 1.1, backgroundColor: '#f1f5f9' }} whileTap={{ scale: 0.9 }} transition={spring}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40">
                  <ChevronRight className="h-4 w-4" />
                </motion.button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
              <AnimatePresence mode="popLayout">
                {visibleAbsent.length === 0 && <p className="col-span-full py-4 text-center text-sm text-slate-400">All present</p>}
                {visibleAbsent.map((emp, i) => (
                  <motion.div key={emp.id} layout
                    initial={{ opacity: 0, scale: 0.85, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.85, y: -12 }}
                    transition={{ delay: i * 0.06, ...spring }}
                    whileHover={{ y: -8, scale: 1.06, boxShadow: '0 12px 28px -6px rgb(0 0 0 / 0.14)' }}
                    className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-slate-100 p-3 text-center">
                    <motion.div
                      whileHover={{ rotate: 6, scale: 1.1 }}
                      transition={spring}
                      className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white ${emp.color} shadow-sm`}>
                      {emp.initials}
                    </motion.div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 leading-tight">{emp.name}</p>
                      <p className="mt-0.5 text-[11px] text-slate-500 leading-tight">{emp.role}</p>
                      <p className="mt-0.5 text-[10px] text-slate-400">{emp.dept}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {(absentEmployees?.length > 0) && (
              <div className="mt-4">
                <motion.button
                  whileHover={{ scale: 1.05, x: 4, boxShadow: '0 8px 20px -4px rgb(124 58 237 / 0.4)' }}
                  whileTap={{ scale: 0.96 }}
                  transition={spring}
                  className="flex items-center gap-1.5 rounded-xl bg-linear-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm">
                  Show all <ArrowRight className="h-3.5 w-3.5" />
                </motion.button>
              </div>
            )}
          </motion.div>
        )}

        {/* ── 5. Noticeboard ── */}
        <motion.div variants={fadeUp}
          className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h3 className="text-sm font-bold text-slate-800">Noticeboard</h3>
            <motion.button whileHover={{ x: 3 }} whileTap={{ scale: 0.95 }}
              className="text-xs font-semibold text-blue-600 hover:underline">View All</motion.button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-linear-to-r from-blue-500 via-indigo-500 to-violet-600 text-white">
                  {['Subject', 'Time', 'Start Date', 'End Date', 'Priority', 'Audience'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(compliance || []).length === 0 && (
                   <tr><td colSpan={6} className="text-center py-6 text-sm text-slate-400">No notices at this time</td></tr>
                )}
                {(compliance || []).map((n, i) => (
                  <motion.tr key={n.id}
                    initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.07, ...spring }}
                    whileHover={{ backgroundColor: '#f8fafc', x: 2 }}
                    className="cursor-pointer">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <motion.span whileHover={{ scale: 1.2, rotate: 10 }} transition={spring}
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${n.dot} text-xs font-bold text-white`}>!</motion.span>
                        <span className="text-sm font-medium text-slate-700">{n.subject}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{n.time}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{n.start}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{n.end}</td>
                    <td className="px-5 py-3.5"><PriorityBadge p={n.priority} /></td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{n.audience}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* ── 6. Bottom Row ── */}
        <div className="grid gap-4 lg:grid-cols-3">

          {/* Quick Actions */}
          <motion.div variants={fadeUp}
            whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
            transition={spring}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Quick Actions</h3>
            <div className="space-y-2.5">
              {QUICK_ACTIONS.map((a, i) => (
                <motion.button key={a.label}
                  onClick={() => {
                    if (a.label === 'Add Employee') {
                      setShowAddEmployeeModal(true)
                    }
                  }}
                  initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.07, ...spring }}
                  whileHover={{ x: 8, scale: 1.02, boxShadow: '0 4px 16px -4px rgb(0 0 0 / 0.1)' }}
                  whileTap={{ scale: 0.97 }}
                  className={`flex w-full items-center gap-3 rounded-xl ${a.bg} p-3 text-left ring-2 ring-transparent transition ${a.ring}`}>
                  <motion.div
                    whileHover={{ rotate: 12, scale: 1.15 }}
                    transition={spring}
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${a.color} shadow-sm`}>
                    <a.icon className="h-4 w-4 text-white" />
                  </motion.div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{a.label}</p>
                    <p className="text-[11px] text-slate-500">{a.description}</p>
                  </div>
                  <motion.div whileHover={{ x: 4 }} className="ml-auto">
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                  </motion.div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={fadeUp}
            whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
            transition={spring}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Recent Activity</h3>
              <motion.button whileHover={{ x: 3 }} whileTap={{ scale: 0.95 }}
                className="text-xs font-semibold text-blue-600 hover:underline">View All</motion.button>
            </div>
            <div className="space-y-3">
              {(activities || []).length === 0 && <p className="text-sm text-slate-400 text-center py-4">No recent activities</p>}
              {(activities || []).map((a, i) => {
                // Dynamically select an icon based on string from backend, fallback to Activity/User
                let DynamicIcon = User
                if (a.icon === 'CheckCircle2') DynamicIcon = CheckCircle2
                if (a.icon === 'Clock') DynamicIcon = Clock
                if (a.icon === 'Calendar') DynamicIcon = Calendar
                if (a.icon === 'FileText') DynamicIcon = FileText

                return (
                  <motion.div key={a.id}
                    initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.08, ...spring }}
                    whileHover={{ x: 6, backgroundColor: '#f8fafc', borderRadius: '12px' }}
                    className="flex cursor-pointer items-center gap-3 rounded-xl p-2.5">
                    <motion.div
                      whileHover={{ scale: 1.15, rotate: 8 }}
                      transition={spring}
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${a.color} text-sm font-bold text-white shadow-sm`}>
                      {a.avatar}
                    </motion.div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-slate-800">{a.user}</p>
                      <p className="truncate text-[11px] text-slate-500">{a.action}</p>
                    </div>
                    <span className="shrink-0 text-[11px] text-slate-400">{a.time}</span>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Setup Checklist */}
          <motion.div variants={fadeUp}
            whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
            transition={spring}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Setup Checklist</h3>
              <motion.span whileHover={{ scale: 1.1 }} transition={spring}
                className="inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                {completedSteps}/{checklist?.length || 0} Done
              </motion.span>
            </div>
            <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <motion.div className="h-full bg-linear-to-r from-blue-500 to-indigo-500"
                initial={{ width: 0 }} animate={{ width: `${checklistPct}%` }}
                transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }} />
            </div>
            <div className="space-y-2">
              {(checklist || []).map((item, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.08, ...spring }}
                  whileHover={{ x: 5, scale: 1.02 }}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-xl border p-2.5 ${item.completed ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-slate-50'}`}>
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: item.completed ? 0 : 10 }}
                    transition={spring}
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${item.completed ? 'bg-green-500' : 'border-2 border-slate-300 bg-white'}`}>
                    {item.completed && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                  </motion.div>
                  <span className={`flex-1 text-xs font-semibold ${item.completed ? 'text-green-800 line-through' : 'text-slate-800'}`}>{item.task}</span>
                  {!item.completed && (
                    <motion.button whileHover={{ scale: 1.1, x: 2 }} whileTap={{ scale: 0.95 }}
                      className="text-[11px] font-bold text-blue-600">Start</motion.button>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── 7. Department Health ── */}
        <motion.div variants={fadeUp}
          whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
          transition={spring}
          className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Department Health Overview</h3>
            <motion.button whileHover={{ x: 3 }} whileTap={{ scale: 0.95 }}
              className="text-xs font-semibold text-blue-600 hover:underline">Full Report</motion.button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(departments || []).length === 0 && <p className="text-sm text-slate-400 py-4 col-span-full">No departments setup.</p>}
            {(departments || []).map((dept, i) => {
              const trendData = trendIcons[dept.trend] || trendIcons.stable
              const TrendIcon = trendData.icon
              const avail = dept.headcount > 0 ? Math.round(((dept.headcount - dept.onLeave) / dept.headcount) * 100) : 0
              return (
                <motion.div key={dept.name}
                  initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.08, ...spring }}
                  whileHover={{ y: -5, scale: 1.03, boxShadow: '0 10px 24px -6px rgb(0 0 0 / 0.12)' }}
                  className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-800">{dept.name}</p>
                    <motion.div whileHover={{ scale: 1.3, rotate: dept.trend === 'up' ? -15 : dept.trend === 'down' ? 15 : 0 }} transition={spring}>
                      <TrendIcon className={`h-4 w-4 ${trendData.color}`} />
                    </motion.div>
                  </div>
                  <div className="mb-3 grid grid-cols-3 gap-1 text-center">
                    <div>
                      <p className="text-base font-bold text-slate-900">{dept.headcount}</p>
                      <p className="text-[10px] text-slate-500">Headcount</p>
                    </div>
                    <div>
                      <p className="text-base font-bold text-orange-600">{dept.onLeave}</p>
                      <p className="text-[10px] text-slate-500">On Leave</p>
                    </div>
                    <div>
                      <p className="text-base font-bold text-blue-600">{dept.avgLeave}d</p>
                      <p className="text-[10px] text-slate-500">Avg Leave</p>
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-[11px] text-slate-500">
                      <span>Availability</span>
                      <span className="font-bold">{avail}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                      <motion.div
                        className={`h-full rounded-full ${avail >= 90 ? 'bg-emerald-500' : avail >= 75 ? 'bg-amber-400' : 'bg-red-400'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${avail}%` }}
                        transition={{ duration: 1, delay: 0.15 + i * 0.1, ease: [0.34, 1.56, 0.64, 1] }} />
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

      </motion.div>

      {/* ── Add Employee Modal ───────────────────────────────────── */}
      <AddEmployeeModal
        isOpen={showAddEmployeeModal}
        onClose={() => setShowAddEmployeeModal(false)}
        onSuccess={() => {
          alert('Employee added successfully!')
          fetchDashboardData()
        }}
      />
    </div>
  )
})

AdminDashboardPage.displayName = 'AdminDashboardPage'

export default AdminDashboardPage