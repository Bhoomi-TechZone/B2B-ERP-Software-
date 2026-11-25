import { memo, useMemo, useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import {
  Clock, Calendar, Plane, Wallet, FileText, ArrowRight, Play, Square,
  CheckCircle2, AlertCircle, Megaphone, ClipboardList, Award, Sparkles,
  RefreshCw, TrendingUp, MapPin, Wifi, Monitor, User, Building2,
  ChevronRight, Bell, Star,
} from 'lucide-react'

import { useAuth } from '../../../hooks/useAuth'
import { useBranding } from '../../../context/BrandingContext'
import employeeService from '../../../services/employeeService'
import attendanceService from '../../../services/attendanceService'

/* ─── Animations ───────────────────────────────────────────────── */
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }
const fadeUp  = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }
const spring  = { type: 'spring', stiffness: 380, damping: 26 }

/* ─── Live Clock Display ───────────────────────────────────────── */
const LiveClock = () => {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <span className="font-mono text-sm font-bold text-slate-700">
      {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
    </span>
  )
}

/* ─── Robust UTC Date Parser ───────────────────────────────────── */
const parseUtcDate = (dateStr) => {
  if (!dateStr) return null
  const hasTimezone = dateStr.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(dateStr)
  return new Date(hasTimezone ? dateStr : dateStr + 'Z')
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
  return <span className="font-mono text-xs font-bold text-emerald-600">{elapsed}</span>
}

/* ─── Stat Card ────────────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, sub, tone }) => {
  const toneMap = {
    emerald: { iconBg: 'bg-emerald-100', icon: 'text-emerald-600', border: 'border-emerald-100' },
    slate:   { iconBg: 'bg-slate-100',   icon: 'text-slate-500',   border: 'border-slate-100'   },
    violet:  { iconBg: 'bg-violet-100',  icon: 'text-violet-600',  border: 'border-violet-100'  },
    orange:  { iconBg: 'bg-orange-100',  icon: 'text-orange-600',  border: 'border-orange-100'  },
    blue:    { iconBg: 'bg-blue-100',    icon: 'text-blue-600',    border: 'border-blue-100'    },
    rose:    { iconBg: 'bg-rose-100',    icon: 'text-rose-600',    border: 'border-rose-100'    },
  }[tone] || { iconBg: 'bg-slate-100', icon: 'text-slate-500', border: 'border-slate-100' }

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
      transition={spring}
      className={`rounded-2xl border ${toneMap.border} bg-white p-5 shadow-sm`}
    >
      <motion.div whileHover={{ rotate: -10, scale: 1.15 }} transition={spring}
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneMap.iconBg}`}>
        <Icon className={`h-5 w-5 ${toneMap.icon}`} />
      </motion.div>
      <p className="mt-3 text-2xl font-bold text-slate-900">{value ?? '—'}</p>
      <p className="text-sm font-semibold text-slate-700">{label}</p>
      <p className="text-xs text-slate-500">{sub}</p>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   EMPLOYEE DASHBOARD
═══════════════════════════════════════════════════════════════════ */
const EmployeeDashboardPage = memo(() => {
  const navigate = useNavigate()
  const { user } = useAuth()

  /* ── API state ── */
  const [loading, setLoading]               = useState(true)
  const [refreshing, setRefreshing]         = useState(false)
  const [error, setError]                   = useState(null)
  const [punchLoading, setPunchLoading]     = useState(false)

  /* ── Data from backend ── */
  const [profile, setProfile]               = useState(null)   // employee profile
  const [todayAtt, setTodayAtt]             = useState(null)   // today attendance
  const [tasks, setTasks]                   = useState([])
  const [leaveBalances, setLeaveBalances]   = useState([])
  const [payslips, setPayslips]             = useState([])
  const [announcements, setAnnouncements]   = useState([])
  const [recognition, setRecognition]       = useState(null)

  /* ── Derived attendance state ── */
  const clockedIn   = todayAtt?.status === 'Clocked In'
  const checkInTime = todayAtt?.check_in_time || null   // ISO string

  /* ── Greeting ── */
  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

  /* ── Load dashboard from /employees/me/dashboard-summary ── */
  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const data = await employeeService.getDashboardSummary()

      setProfile({
        name:           data.name           || user?.name || 'Employee',
        first_name:     data.first_name     || user?.name?.split(' ')[0] || 'there',
        employee_number: data.employee_number || '',
      })

      // Today's attendance (comes from AttendanceService.get_today_summary)
      setTodayAtt(data.today_attendance || null)

      // Leave balances — direct from DB
      setLeaveBalances(Array.isArray(data.leave_balances) ? data.leave_balances : [])

      // Tasks
      setTasks(Array.isArray(data.tasks) ? data.tasks : [])

      // Payslips
      setPayslips(Array.isArray(data.payslips) ? data.payslips : [])

      // Announcements
      setAnnouncements(Array.isArray(data.announcements) ? data.announcements : [])

      // Recognition
      setRecognition(data.recognition || null)

      setError(null)
    } catch (err) {
      console.error('Dashboard load failed:', err)
      setError(err.message || 'Failed to load dashboard')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user])

  useEffect(() => { load() }, [load])

  /* ── Clock In / Out ── */
  const handleClock = async () => {
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

      const action = clockedIn ? 'check_out' : 'check_in'
      await attendanceService.punch({
        action,
        work_mode: 'office',
        location,
        notes: `${clockedIn ? 'Clocked out' : 'Clocked in'} from Employee Dashboard`,
      })
      // Re-fetch to get updated status
      await load(true)
    } catch (err) {
      alert(err.message || 'Punch failed. Please try again.')
    } finally {
      setPunchLoading(false)
    }
  }

  /* ── Toggle Task ── */
  const toggleTask = async (taskId, currentDone) => {
    // Optimistic
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, done: !currentDone } : t))
    try {
      await employeeService.updateTaskStatus(taskId, currentDone ? 'to_do' : 'done')
    } catch (err) {
      // Rollback
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, done: currentDone } : t))
      alert('Failed to update task.')
    }
  }

  /* ── Derived stats ── */
  const totalLeave     = useMemo(() => leaveBalances.reduce((s, l) => s + (l.total || 0), 0), [leaveBalances])
  const usedLeave      = useMemo(() => leaveBalances.reduce((s, l) => s + (l.used  || 0), 0), [leaveBalances])
  const remainingLeave = totalLeave - usedLeave
  const openTasks      = tasks.filter(t => !t.done).length
  const completedPct   = tasks.length > 0 ? Math.round(((tasks.length - openTasks) / tasks.length) * 100) : 0

  /* ── Loading skeleton ── */
  if (loading && !profile) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm font-semibold text-slate-500">Loading your workspace...</p>
        </div>
      </div>
    )
  }

  /* ── Error banner ── */
  if (error && !profile) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50 p-6">
        <div className="max-w-sm rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-400" />
          <p className="font-bold text-red-700">Failed to load dashboard</p>
          <p className="mt-1 text-sm text-red-600">{error}</p>
          <button onClick={() => load()} className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto bg-slate-50">
      <motion.div className="space-y-5 p-6" variants={stagger} initial="hidden" animate="visible">

        {/* ── Greeting + Clock In/Out ── */}
        <motion.div
          variants={fadeUp}
          whileHover={{ scale: 1.005, boxShadow: '0 8px 24px -4px rgb(0 0 0 / 0.10)' }}
          transition={spring}
          className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-blue-50 to-cyan-50 p-5 shadow-sm"
        >
          {/* Background decoration */}
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-indigo-100/50" />
          <div className="pointer-events-none absolute -bottom-6 right-16 h-20 w-20 rounded-full bg-blue-100/40" />

          <div className="relative grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ rotate: 8, scale: 1.1 }} transition={spring}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-200 text-xl font-bold text-indigo-800 ring-2 ring-indigo-300 shrink-0"
              >
                {(profile?.name || user?.name || 'E').slice(0, 1).toUpperCase()}
              </motion.div>
              <div>
                <p className="text-sm text-slate-500">{greeting},</p>
                <p className="text-xl font-bold text-slate-800">
                  Hi {profile?.first_name || user?.name?.split(' ')[0] || 'there'} — ready to make today count?
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-3">
                  <p className="text-xs text-slate-500">
                    {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <LiveClock />
                  {profile?.employee_number && (
                    <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                      {profile.employee_number}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Refresh button */}
              <button
                onClick={() => load(true)}
                disabled={refreshing}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-200 bg-white/70 text-indigo-500 transition hover:bg-white hover:shadow-sm disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>

              {/* Punch button */}
              <motion.button
                type="button"
                onClick={handleClock}
                disabled={punchLoading || todayAtt?.status === 'Clocked Out'}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} transition={spring}
                className={`group flex items-center gap-3 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-md transition ${
                  clockedIn ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 hover:bg-indigo-700'
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {punchLoading
                  ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                      className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white" />
                  : clockedIn ? <Square className="h-5 w-5" /> : <Play className="h-5 w-5" />
                }
                <div className="text-left">
                  <p>
                    {todayAtt?.status === 'Clocked Out' ? 'Day Complete' : clockedIn ? 'Clock out' : 'Clock in'}
                  </p>
                  <p className="text-[11px] font-medium opacity-80">
                    {clockedIn && checkInTime
                      ? <ElapsedTimer since={checkInTime} />
                      : todayAtt?.status === 'Clocked Out'
                        ? `Out at ${parseUtcDate(todayAtt.check_out_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`
                        : 'Start your day'
                    }
                  </p>
                </div>
              </motion.button>
            </div>
          </div>

          {/* Attendance detail strip when clocked in */}
          <AnimatePresence>
            {todayAtt && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 overflow-hidden"
              >
                <div className="flex flex-wrap gap-4 rounded-xl border border-indigo-100 bg-white/60 px-4 py-2.5 text-xs">
                  {todayAtt.check_in_time && (
                    <div>
                      <span className="font-semibold text-slate-500">Clocked In</span>
                      <span className="ml-2 font-bold text-slate-800">
                        {parseUtcDate(todayAtt.check_in_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </span>
                    </div>
                  )}
                  {todayAtt.check_out_time && (
                    <div>
                      <span className="font-semibold text-slate-500">Clocked Out</span>
                      <span className="ml-2 font-bold text-slate-800">
                        {parseUtcDate(todayAtt.check_out_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </span>
                    </div>
                  )}
                  {todayAtt.hours_so_far > 0 && (
                    <div>
                      <span className="font-semibold text-slate-500">Hours</span>
                      <span className="ml-2 font-bold text-emerald-700">{todayAtt.hours_so_far}h</span>
                    </div>
                  )}
                  <div>
                    <span className="font-semibold text-slate-500">Mode</span>
                    <span className="ml-2 font-bold text-slate-800">
                      {todayAtt.is_wfh ? '🏠 WFH' : '🏢 Office'}
                    </span>
                  </div>
                  <div>
                    <span className="ml-auto rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                      style={{ backgroundColor: clockedIn ? '#dcfce7' : '#f1f5f9', color: clockedIn ? '#15803d' : '#64748b' }}>
                      {todayAtt.status}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Quick stats ── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Clock}
            label="Today's status"
            value={todayAtt?.status || 'Not started'}
            sub={clockedIn ? `Since ${parseUtcDate(checkInTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}` : todayAtt?.status === 'Clocked Out' ? `${todayAtt.hours_so_far}h worked` : 'Punch in to start'}
            tone={clockedIn ? 'emerald' : todayAtt?.status === 'Clocked Out' ? 'slate' : 'slate'}
          />
          <StatCard
            icon={Plane}
            label="Leave balance"
            value={`${remainingLeave}d`}
            sub={totalLeave > 0 ? `${usedLeave} used of ${totalLeave}` : 'No leave policy set'}
            tone="violet"
          />
          <StatCard
            icon={ClipboardList}
            label="Open tasks"
            value={openTasks}
            sub={tasks.length > 0 ? `${tasks.length - openTasks}/${tasks.length} done` : 'No tasks assigned'}
            tone="orange"
          />
          <StatCard
            icon={Wallet}
            label="Last payslip"
            value={payslips.length > 0 ? `₹${((payslips[0].net || 0) / 1000).toFixed(1)}K` : '—'}
            sub={payslips.length > 0 ? payslips[0].month : 'No records yet'}
            tone="blue"
          />
        </div>

        {/* ── Tasks + Leave Balance ── */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Tasks */}
          <motion.div
            variants={fadeUp}
            whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
            transition={spring}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-2"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">My tasks</h3>
                <p className="text-xs text-slate-500">{completedPct}% complete · {openTasks} open</p>
              </div>
              <button type="button" onClick={() => navigate('/tasks')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline">
                View all <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <motion.div
                initial={{ width: 0 }} animate={{ width: `${completedPct}%` }}
                transition={{ duration: 0.9 }}
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-500"
              />
            </div>

            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 p-8 text-center">
                <ClipboardList className="h-8 w-8 text-slate-300" />
                <p className="mt-2 text-sm text-slate-500">No active tasks assigned</p>
                <p className="text-xs text-slate-400">Tasks assigned to you will appear here</p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {tasks.map((t, i) => (
                  <motion.button
                    key={t.id}
                    type="button"
                    layout
                    onClick={() => toggleTask(t.id, t.done)}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i, ...spring }}
                    whileHover={{ x: 3 }}
                    className={`mb-2 flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                      t.done ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-100 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                      t.done ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 bg-white'
                    }`}>
                      {t.done && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm font-semibold ${t.done ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                        {t.title}
                      </p>
                      <p className="truncate text-[11px] text-slate-500">{t.project}</p>
                    </div>
                    <span className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-bold ${
                      t.due === 'Today' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                    }`}>{t.due}</span>
                  </motion.button>
                ))}
              </AnimatePresence>
            )}
          </motion.div>

          {/* Leave Balance */}
          <motion.div
            variants={fadeUp}
            whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
            transition={spring}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Leave balance</h3>
              <button type="button" onClick={() => navigate('/leave/apply')}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700">
                Apply
              </button>
            </div>

            {leaveBalances.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 p-6 text-center">
                <Plane className="h-7 w-7 text-slate-300" />
                <p className="mt-2 text-xs text-slate-500">No leave policy assigned yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaveBalances.map((l, i) => {
                  const pct = l.total > 0 ? Math.round((l.used / l.total) * 100) : 0
                  return (
                    <motion.div key={l.type} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.06 }}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">{l.type}</span>
                        <span className="text-slate-500"><b className="text-slate-800">{l.total - l.used}</b> / {l.total} left</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <motion.div
                          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.9, delay: 0.15 + i * 0.06 }}
                          className={`h-full rounded-full bg-gradient-to-r ${l.color || 'from-indigo-500 to-blue-500'}`}
                        />
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>
        </div>

        {/* ── Payslips + Announcements + Recognition ── */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Payslips */}
          <motion.div
            variants={fadeUp}
            whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
            transition={spring}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Recent payslips</h3>
              <button type="button" onClick={() => navigate('/my-payroll')}
                className="text-xs font-semibold text-indigo-600 hover:underline">View all</button>
            </div>
            {payslips.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 p-6 text-center">
                <FileText className="h-7 w-7 text-slate-300" />
                <p className="mt-2 text-xs text-slate-500">No payslips generated yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {payslips.map((p, i) => (
                  <motion.div key={p.id || i}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.06 }}
                    whileHover={{ x: 3 }}
                    className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{p.month}</p>
                        <p className="text-[11px] text-slate-500">Net ₹{(p.net || 0).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                    <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
                      {p.status}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Announcements */}
          <motion.div
            variants={fadeUp}
            whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
            transition={spring}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <div className="mb-3 flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-800">Announcements</h3>
            </div>
            {announcements.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 p-6 text-center">
                <Bell className="h-7 w-7 text-slate-300" />
                <p className="mt-2 text-xs text-slate-500">No announcements yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {announcements.map((a, i) => (
                  <motion.div key={a.id}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.07 }}
                    whileHover={{ x: 3 }}
                    className="rounded-xl border border-slate-100 px-3 py-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-indigo-100 px-2 py-0.5 text-[9px] font-bold uppercase text-indigo-700">{a.tag}</span>
                      <span className="text-[10px] text-slate-400">{a.time}</span>
                    </div>
                    <p className="mt-1 text-xs font-semibold text-slate-800">{a.title}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Recognition / empty state */}
          {recognition ? (
            <motion.div
              variants={fadeUp}
              whileHover={{ y: -4, scale: 1.01, boxShadow: '0 16px 40px -8px rgb(99 102 241 / 0.4)' }}
              transition={spring}
              className="overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 p-5 text-white shadow-sm"
            >
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                <p className="text-sm font-bold">You've been kudos'd!</p>
              </div>
              <p className="mt-3 text-base font-bold">"{recognition.kudos}"</p>
              <p className="mt-1 text-xs text-white/80">— from {recognition.sender}</p>
              <div className="mt-4 flex items-center gap-2 text-[11px] text-white/80">
                <Sparkles className="h-3 w-3" /> Streak: {recognition.streak}
              </div>
            </motion.div>
          ) : (
            <motion.div variants={fadeUp}
              className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-5 text-center shadow-sm">
              <Star className="h-8 w-8 text-slate-300" />
              <p className="mt-2 text-sm font-semibold text-slate-500">No recognition yet</p>
              <p className="text-xs text-slate-400">Keep up the great work!</p>
            </motion.div>
          )}
        </div>

        {/* ── Quick actions ── */}
        <motion.div
          variants={fadeUp}
          whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
          transition={spring}
          className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
        >
          <h3 className="mb-4 text-sm font-bold text-slate-800">Quick actions</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Apply leave',         icon: Plane,         tone: 'bg-violet-50 text-violet-700 hover:bg-violet-100',   onClick: () => navigate('/leave/apply')          },
              { label: 'View attendance',     icon: Calendar,      tone: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100', onClick: () => navigate('/attendance/my-attendance')     },
              { label: 'Request regularise',  icon: AlertCircle,   tone: 'bg-amber-50 text-amber-700 hover:bg-amber-100',       onClick: () => navigate('/attendance/my-requests')  },
              { label: 'Download payslip',    icon: FileText,      tone: 'bg-blue-50 text-blue-700 hover:bg-blue-100',          onClick: () => navigate('/my-payroll')     },
            ].map((q, i) => {
              const Icon = q.icon
              return (
                <motion.button key={q.label} type="button" onClick={q.onClick}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05, ...spring }}
                  whileHover={{ y: -3, scale: 1.02 }}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${q.tone}`}
                >
                  <Icon className="h-5 w-5" />
                  {q.label}
                </motion.button>
              )
            })}
          </div>
        </motion.div>

      </motion.div>
    </div>
  )
})

EmployeeDashboardPage.displayName = 'EmployeeDashboardPage'
export default EmployeeDashboardPage
