import { memo, useMemo } from 'react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import {
  Users, CheckCircle2, ClipboardList, FolderKanban, TrendingUp,
  Calendar, ArrowRight, AlertCircle, Star, Target, Clock,
  PlusCircle, ChevronRight,
} from 'lucide-react'

import { useAuth } from '../../../hooks/useAuth'

// ─── Mock data ─────────────────────────────────────────────────────────────
const TEAM = [
  { id: 1, name: 'Rahul Sharma',   role: 'Senior Engineer', initials: 'RS', color: 'bg-blue-500',    status: 'present' },
  { id: 2, name: 'Sneha Iyer',     role: 'Engineer',         initials: 'SI', color: 'bg-violet-500',  status: 'present' },
  { id: 3, name: 'Karan Mehta',    role: 'QA Engineer',      initials: 'KM', color: 'bg-emerald-500', status: 'late'    },
  { id: 4, name: 'Pooja Nair',     role: 'UX Designer',      initials: 'PN', color: 'bg-pink-500',    status: 'leave'   },
  { id: 5, name: 'Vikas Sinha',    role: 'Engineer',         initials: 'VS', color: 'bg-amber-500',   status: 'present' },
  { id: 6, name: 'Anita Rao',      role: 'Tech Lead',        initials: 'AR', color: 'bg-indigo-500',  status: 'present' },
  { id: 7, name: 'Manish Joshi',   role: 'Engineer',         initials: 'MJ', color: 'bg-rose-500',    status: 'absent'  },
  { id: 8, name: 'Ishita Bose',    role: 'Engineer',         initials: 'IB', color: 'bg-teal-500',    status: 'present' },
]

const APPROVALS = [
  { id: 1, type: 'Leave',      who: 'Pooja Nair',     detail: 'Casual leave · 2 days · Apr 25 – Apr 26', priority: 'normal' },
  { id: 2, type: 'Attendance', who: 'Karan Mehta',    detail: 'Regularisation · Apr 18 forgot punch-in',  priority: 'high'   },
  { id: 3, type: 'Leave',      who: 'Manish Joshi',   detail: 'Sick leave · 1 day · today',               priority: 'high'   },
  { id: 4, type: 'Expense',    who: 'Vikas Sinha',    detail: 'Travel reimbursement · ₹4,250',           priority: 'normal' },
  { id: 5, type: 'Timesheet',  who: 'Sneha Iyer',     detail: 'Week of Apr 14 · 42 hrs',                  priority: 'low'    },
]

const PROJECTS = [
  { id: 1, name: 'Atlas Mobile App',    progress: 78, status: 'on-track', due: 'Apr 30',    members: 6,  open: 12 },
  { id: 2, name: 'Customer Portal v2',  progress: 42, status: 'at-risk',  due: 'May 15',    members: 4,  open: 23 },
  { id: 3, name: 'Internal Analytics',  progress: 95, status: 'on-track', due: 'Apr 25',    members: 3,  open: 4  },
  { id: 4, name: 'Migration to Cloud',  progress: 18, status: 'delayed',  due: 'Jun 10',    members: 5,  open: 31 },
]

const ACTIVITY = [
  { id: 1, who: 'Rahul Sharma',  what: 'closed task #1284 in Atlas Mobile App', time: '12 min ago', tag: 'task' },
  { id: 2, who: 'Sneha Iyer',    what: 'submitted timesheet for week of Apr 14', time: '1 hr ago',  tag: 'timesheet' },
  { id: 3, who: 'Karan Mehta',   what: 'requested attendance regularisation',    time: '2 hr ago',  tag: 'attendance' },
  { id: 4, who: 'Anita Rao',     what: 'merged 3 PRs into Customer Portal v2',   time: '4 hr ago',  tag: 'task' },
  { id: 5, who: 'Pooja Nair',    what: 'applied for casual leave (2 days)',      time: 'Yesterday', tag: 'leave' },
]

// ─── Animations ────────────────────────────────────────────────────────────
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }
const fadeUp  = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }
const spring  = { type: 'spring', stiffness: 380, damping: 26 }

// ─── Helpers ───────────────────────────────────────────────────────────────
const STATUS_TONE = {
  present: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  late:    'border-amber-200 bg-amber-50 text-amber-700',
  leave:   'border-violet-200 bg-violet-50 text-violet-700',
  absent:  'border-rose-200 bg-rose-50 text-rose-700',
}
const PROJ_TONE = {
  'on-track': { bar: 'from-emerald-500 to-teal-500',  pill: 'bg-emerald-100 text-emerald-700', label: 'On track' },
  'at-risk':  { bar: 'from-amber-500 to-orange-500',  pill: 'bg-amber-100 text-amber-700',     label: 'At risk'  },
  'delayed':  { bar: 'from-rose-500 to-red-500',      pill: 'bg-rose-100 text-rose-700',       label: 'Delayed'  },
}

const ManagerDashboardPage = memo(() => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const stats = useMemo(() => {
    const present = TEAM.filter(t => t.status === 'present').length
    const late    = TEAM.filter(t => t.status === 'late').length
    const leave   = TEAM.filter(t => t.status === 'leave').length
    const absent  = TEAM.filter(t => t.status === 'absent').length
    return { total: TEAM.length, present, late, leave, absent, attendanceRate: Math.round((present / TEAM.length) * 100) }
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

  return (
    <div className="h-full overflow-y-auto bg-slate-50">
      <motion.div className="space-y-5 p-6" variants={stagger} initial="hidden" animate="visible">

        {/* ── Greeting ── */}
        <motion.div
          variants={fadeUp}
          whileHover={{ scale: 1.005, boxShadow: '0 8px 24px -4px rgb(0 0 0 / 0.10)' }}
          transition={spring}
          className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-100 bg-linear-to-r from-emerald-50 via-teal-50 to-cyan-50 px-6 py-4 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ rotate: 8, scale: 1.1 }} transition={spring}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-200 text-lg font-bold text-emerald-800 ring-2 ring-emerald-300"
            >
              {(user?.name || 'M').slice(0, 1).toUpperCase()}
            </motion.div>
            <div>
              <p className="text-sm text-slate-500">{greeting},</p>
              <p className="text-xl font-bold text-slate-800">Hi {user?.name?.split(' ')[0] || 'Manager'} — your team at a glance</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            {[
              { n: stats.present, l: 'Present',    c: 'text-emerald-700' },
              { n: stats.late,    l: 'Late',       c: 'text-amber-700'   },
              { n: stats.leave,   l: 'On Leave',   c: 'text-violet-700'  },
              { n: APPROVALS.length, l: 'Pending Approvals', c: 'text-rose-700' },
            ].map((s, i, arr) => (
              <div key={s.l} className="flex items-center gap-5">
                <motion.div whileHover={{ scale: 1.1 }} transition={spring} className="text-center">
                  <p className={`text-xl font-bold ${s.c}`}>{s.n}</p>
                  <p className="text-xs text-slate-500">{s.l}</p>
                </motion.div>
                {i < arr.length - 1 && <div className="h-8 w-px bg-emerald-200" />}
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Stat cards ── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Users,        label: 'Team Size',       value: stats.total,                 sub: 'Direct reports',         tone: 'emerald' },
            { icon: CheckCircle2, label: 'Attendance',      value: `${stats.attendanceRate}%`,  sub: `${stats.present}/${stats.total} present`, tone: 'blue' },
            { icon: ClipboardList,label: 'Approvals',       value: APPROVALS.length,            sub: `${APPROVALS.filter(a=>a.priority==='high').length} high priority`, tone: 'orange' },
            { icon: FolderKanban, label: 'Active Projects', value: PROJECTS.length,             sub: `${PROJECTS.filter(p=>p.status==='at-risk' || p.status==='delayed').length} need attention`, tone: 'violet' },
          ].map((s) => {
            const Icon = s.icon
            const toneMap = {
              emerald: { iconBg: 'bg-emerald-100', icon: 'text-emerald-600' },
              blue:    { iconBg: 'bg-blue-100',    icon: 'text-blue-600'    },
              orange:  { iconBg: 'bg-orange-100',  icon: 'text-orange-600'  },
              violet:  { iconBg: 'bg-violet-100',  icon: 'text-violet-600'  },
            }[s.tone]
            return (
              <motion.div
                key={s.label}
                variants={fadeUp}
                whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
                transition={spring}
                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <motion.div whileHover={{ rotate: -10, scale: 1.15 }} transition={spring}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneMap.iconBg}`}>
                    <Icon className={`h-5 w-5 ${toneMap.icon}`} />
                  </motion.div>
                </div>
                <p className="mt-3 text-2xl font-bold text-slate-900">{s.value}</p>
                <p className="text-sm font-semibold text-slate-700">{s.label}</p>
                <p className="text-xs text-slate-500">{s.sub}</p>
              </motion.div>
            )
          })}
        </div>

        {/* ── Approvals queue + Team attendance ── */}
        <div className="grid gap-4 lg:grid-cols-3">
          <motion.div
            variants={fadeUp}
            whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
            transition={spring}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-2"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Pending approvals</h3>
                <p className="text-xs text-slate-500">Items awaiting your action</p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/leave/requests')}
                className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline"
              >
                View all <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            <div className="space-y-2">
              {APPROVALS.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.06, ...spring }}
                  whileHover={{ x: 4, backgroundColor: '#f8fafc' }}
                  className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">{a.type}</span>
                      {a.priority === 'high' && (
                        <span className="rounded bg-rose-100 px-2 py-0.5 text-[10px] font-bold uppercase text-rose-600">High</span>
                      )}
                      <span className="text-sm font-semibold text-slate-800">{a.who}</span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-slate-500">{a.detail}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100">
                      Reject
                    </button>
                    <button type="button" className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">
                      Approve
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Team attendance snapshot */}
          <motion.div
            variants={fadeUp}
            whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
            transition={spring}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Team today</h3>
              <Calendar className="h-4 w-4 text-slate-400" />
            </div>
            <div className="space-y-2">
              {TEAM.slice(0, 6).map((m, i) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05, ...spring }}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 p-2"
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${m.color}`}>
                    {m.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-slate-800">{m.name}</p>
                    <p className="truncate text-[11px] text-slate-500">{m.role}</p>
                  </div>
                  <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_TONE[m.status]}`}>
                    {m.status}
                  </span>
                </motion.div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => navigate('/attendance/daily')}
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline"
            >
              See full attendance <ArrowRight className="h-3 w-3" />
            </button>
          </motion.div>
        </div>

        {/* ── Projects ── */}
        <motion.div
          variants={fadeUp}
          whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
          transition={spring}
          className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Active projects</h3>
              <p className="text-xs text-slate-500">Progress across your team's initiatives</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/projects')}
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
            >
              <PlusCircle className="h-3.5 w-3.5" /> New project
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {PROJECTS.map((p, i) => {
              const tone = PROJ_TONE[p.status]
              return (
                <motion.button
                  key={p.id}
                  type="button"
                  onClick={() => navigate(`/projects/${p.id}`)}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.07, ...spring }}
                  whileHover={{ y: -4, scale: 1.01, boxShadow: '0 12px 28px -8px rgb(0 0 0 / 0.12)' }}
                  className="cursor-pointer rounded-xl border border-slate-100 p-4 text-left"
                >
                  <div className="mb-2 flex items-start justify-between">
                    <p className="text-sm font-bold text-slate-900">{p.name}</p>
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${tone.pill}`}>{tone.label}</span>
                  </div>
                  <div className="mb-2 flex justify-between text-[11px] text-slate-500">
                    <span>Progress</span>
                    <span className="font-bold text-slate-700">{p.progress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <motion.div
                      className={`h-full bg-linear-to-r ${tone.bar}`}
                      initial={{ width: 0 }} animate={{ width: `${p.progress}%` }}
                      transition={{ duration: 0.9, delay: 0.15 + i * 0.08 }}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" />{p.members} members</span>
                    <span className="inline-flex items-center gap-1"><ClipboardList className="h-3 w-3" />{p.open} open</span>
                    <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />Due {p.due}</span>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* ── Bottom row: Activity + Performance + Insight ── */}
        <div className="grid gap-4 lg:grid-cols-3">
          <motion.div
            variants={fadeUp}
            whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
            transition={spring}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-2"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Team activity</h3>
              <button type="button" className="text-xs font-semibold text-emerald-600 hover:underline">View all</button>
            </div>
            <div className="space-y-3">
              {ACTIVITY.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.07, ...spring }}
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-700">
                    {a.who.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-slate-800">{a.who}</p>
                    <p className="truncate text-[11px] text-slate-500">{a.what}</p>
                  </div>
                  <span className="shrink-0 text-[10px] text-slate-400">{a.time}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <div className="space-y-4">
            {/* Performance highlight */}
            <motion.div
              variants={fadeUp}
              whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
              transition={spring}
              className="rounded-2xl border border-slate-100 bg-linear-to-br from-emerald-500 to-teal-600 p-5 text-white shadow-sm"
            >
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                <p className="text-sm font-bold">Top performer</p>
              </div>
              <p className="mt-3 text-xl font-bold">Anita Rao</p>
              <p className="text-sm text-white/80">12 tasks closed · 100% attendance</p>
              <button
                type="button"
                onClick={() => navigate('/performance')}
                className="mt-4 inline-flex items-center gap-1 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold backdrop-blur hover:bg-white/30"
              >
                Recognise <ArrowRight className="h-3 w-3" />
              </button>
            </motion.div>

            {/* Quick insight */}
            <motion.div
              variants={fadeUp}
              whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
              transition={spring}
              className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm"
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
                <div>
                  <p className="text-sm font-bold text-amber-900">2 projects need attention</p>
                  <p className="mt-1 text-xs text-amber-800/80">
                    "Customer Portal v2" is at risk and "Migration to Cloud" is delayed. Consider re-allocating effort.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/projects')}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-amber-900 hover:underline"
                  >
                    Review now <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

      </motion.div>
    </div>
  )
})

ManagerDashboardPage.displayName = 'ManagerDashboardPage'
export default ManagerDashboardPage
