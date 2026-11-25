import { memo, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import {
  Users, UserPlus, UserCheck, UserX, TrendingUp, Briefcase, Cake,
  CalendarDays, ArrowRight, FileText, Banknote, AlertTriangle, ClipboardList,
  Plane, Award, ChevronRight, BadgeCheck, Loader2
} from 'lucide-react'

import { useAuth } from '../../../hooks/useAuth'
import AddEmployeeModal from '../../../components/AddEmployeeModal'
import { isModuleActive } from '../../../config/navigation'
import { useEffect } from 'react'
import apiClient from '../../../services/apiClient'
import { API_BASE_URL } from '../../../config/api'

// Data is now fetched dynamically from the API

// ─── Animations ────────────────────────────────────────────────────────────
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }
const fadeUp  = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }
const spring  = { type: 'spring', stiffness: 380, damping: 26 }

const TONE = {
  rose:  'border-rose-200 bg-rose-50 text-rose-700',
  amber: 'border-amber-200 bg-amber-50 text-amber-700',
  blue:  'border-blue-200 bg-blue-50 text-blue-700',
}

const HRDashboardPage = memo(() => {
  const navigate = useNavigate()
  const { user, tenant } = useAuth()
  const activeModules = tenant?.modules || {}
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false)

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get(`${API_BASE_URL}/hr/dashboard`)
        setData(response)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch HR dashboard data', err)
        setError('Failed to load dashboard data.')
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  const STATS = data?.stats || {}
  const DEPARTMENTS = data?.departments || []
  const PIPELINE = data?.pipeline || []
  const APPROVALS = data?.approvals || []
  const NEW_HIRES = data?.newHires || []
  const BIRTHDAYS = data?.birthdays || []
  const COMPLIANCE = data?.compliance || []

  const totalDept = useMemo(() => DEPARTMENTS.reduce((s, d) => s + d.count, 0), [DEPARTMENTS])
  const pipelineMax = useMemo(() => Math.max(...PIPELINE.map(p => p.count), 1), [PIPELINE])
  const attendancePct = STATS.totalEmployees > 0 ? Math.round((STATS.activeToday / STATS.totalEmployees) * 100) : 0

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto bg-slate-50">
      <motion.div className="space-y-5 p-6" variants={stagger} initial="hidden" animate="visible">

        {/* ── Greeting ── */}
        <motion.div
          variants={fadeUp}
          whileHover={{ scale: 1.005, boxShadow: '0 8px 24px -4px rgb(0 0 0 / 0.10)' }}
          transition={spring}
          className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-orange-100 bg-linear-to-r from-orange-50 via-rose-50 to-pink-50 px-6 py-4 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ rotate: 8, scale: 1.1 }} transition={spring}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-200 text-lg font-bold text-orange-800 ring-2 ring-orange-300"
            >
              {(user?.name || 'H').slice(0, 1).toUpperCase()}
            </motion.div>
            <div>
              <p className="text-sm text-slate-500">{greeting},</p>
              <p className="text-xl font-bold text-slate-800">Hi {user?.name?.split(' ')[0] || 'HR'} — your people overview</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            {[
              { n: APPROVALS.length, l: 'Pending Approvals', c: 'text-rose-700'   },
              { n: STATS.newThisMonth, l: 'New Hires (mo)',  c: 'text-emerald-700'},
              { n: COMPLIANCE.length, l: 'Compliance Items', c: 'text-amber-700'  },
            ].map((s, i, arr) => (
              <div key={s.l} className="flex items-center gap-5">
                <motion.div whileHover={{ scale: 1.1 }} transition={spring} className="text-center">
                  <p className={`text-xl font-bold ${s.c}`}>{s.n}</p>
                  <p className="text-xs text-slate-500">{s.l}</p>
                </motion.div>
                {i < arr.length - 1 && <div className="h-8 w-px bg-orange-200" />}
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Stat cards ── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Users,      label: 'Total Employees', value: STATS.totalEmployees,    sub: 'Across all teams',   tone: 'blue'    },
            { icon: UserCheck,  label: 'Active Today',    value: STATS.activeToday,       sub: `${attendancePct}% attendance`, tone: 'emerald' },
            { icon: UserPlus,   label: 'New This Month',  value: STATS.newThisMonth,      sub: '+18% vs last month', tone: 'orange'  },
            { icon: TrendingUp, label: 'Avg Tenure',      value: `${STATS.avgTenureYears}y`, sub: `Attrition ${STATS.attritionPct}%`, tone: 'violet' },
          ].map((s) => {
            const Icon = s.icon
            const toneMap = {
              blue:    { iconBg: 'bg-blue-100',    icon: 'text-blue-600'    },
              emerald: { iconBg: 'bg-emerald-100', icon: 'text-emerald-600' },
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
                <motion.div whileHover={{ rotate: -10, scale: 1.15 }} transition={spring}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneMap.iconBg}`}>
                  <Icon className={`h-5 w-5 ${toneMap.icon}`} />
                </motion.div>
                <p className="mt-3 text-2xl font-bold text-slate-900">{s.value}</p>
                <p className="text-sm font-semibold text-slate-700">{s.label}</p>
                <p className="text-xs text-slate-500">{s.sub}</p>
              </motion.div>
            )
          })}
        </div>

        {/* ── Departments + Approvals ── */}
        <div className="grid gap-4 lg:grid-cols-3">
          <motion.div
            variants={fadeUp}
            whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
            transition={spring}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Department mix</h3>
              <button type="button" onClick={() => navigate('/employees')}
                className="text-xs font-semibold text-orange-600 hover:underline">Browse</button>
            </div>
            <div className="space-y-3">
              {DEPARTMENTS.map((d, i) => {
                const pct = Math.round((d.count / totalDept) * 100)
                return (
                  <motion.div
                    key={d.name}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 * i }}
                  >
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="font-semibold text-slate-700">{d.name}</span>
                      <span className="text-slate-500"><b className="text-slate-800">{d.count}</b> · {pct}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.9, delay: 0.1 + i * 0.06 }}
                        className={`h-full rounded-full bg-linear-to-r ${d.color}`}
                      />
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
            transition={spring}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-2"
          >
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Pending approvals</h3>
                <p className="text-xs text-slate-500">{APPROVALS.length} items waiting on you</p>
              </div>
              <button type="button" onClick={() => navigate('/leave/requests')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:underline">
                View all <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            <div className="space-y-2">
              {APPROVALS.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.06, ...spring }}
                  whileHover={{ x: 4 }}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">{a.type}</span>
                      <span className="text-sm font-semibold text-slate-800">{a.who}</span>
                      <span className="text-[10px] text-slate-400">· {a.time}</span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-slate-500">{a.desc}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100">
                      Reject
                    </button>
                    <button type="button" className="rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-700">
                      Approve
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Recruitment pipeline ── */}
        {isModuleActive('ats', activeModules) && (
          <motion.div
            variants={fadeUp}
            whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
            transition={spring}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recruitment pipeline</h3>
                <p className="text-xs text-slate-500">Funnel across all open requisitions</p>
              </div>
              <button type="button" onClick={() => navigate('/recruitment/applications')}
                className="inline-flex items-center gap-1 rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-700">
                <Briefcase className="h-3.5 w-3.5" /> Open ATS
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-5">
              {PIPELINE.map((p, i) => (
                <motion.div
                  key={p.stage}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i, ...spring }}
                  whileHover={{ y: -4, scale: 1.03 }}
                  className="rounded-xl border border-slate-100 p-3"
                >
                  <p className="text-xs font-semibold text-slate-500">{p.stage}</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{p.count}</p>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${(p.count / pipelineMax) * 100}%` }}
                      transition={{ duration: 0.9, delay: 0.15 + i * 0.06 }}
                      className={`h-full ${p.color}`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── New hires + Birthdays + Compliance ── */}
        <div className="grid gap-4 lg:grid-cols-3">
          <motion.div
            variants={fadeUp}
            whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
            transition={spring}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">New hires</h3>
              <button type="button" onClick={() => navigate('/onboarding')}
                className="text-xs font-semibold text-orange-600 hover:underline">Onboarding</button>
            </div>
            <div className="space-y-2">
              {NEW_HIRES.map((h, i) => (
                <motion.div
                  key={h.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * i }} whileHover={{ x: 3 }}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2"
                >
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white ${h.color}`}>
                    {h.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-slate-800">{h.name}</p>
                    <p className="truncate text-[11px] text-slate-500">{h.role} · {h.dept}</p>
                  </div>
                  <span className="shrink-0 rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">{h.joined}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
            transition={spring}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <div className="mb-3 flex items-center gap-2">
              <Cake className="h-4 w-4 text-pink-600" />
              <h3 className="text-sm font-bold text-slate-800">Upcoming birthdays</h3>
            </div>
            <div className="space-y-2">
              {BIRTHDAYS.map((b, i) => (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 * i }} whileHover={{ x: 3 }}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2"
                >
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white ${b.color}`}>
                    {b.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-slate-800">{b.name}</p>
                  </div>
                  <span className="shrink-0 rounded bg-pink-100 px-2 py-0.5 text-[10px] font-bold text-pink-700">{b.when}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            whileHover={{ y: -4, scale: 1.01, boxShadow: '0 16px 40px -8px rgb(220 38 38 / 0.4)' }}
            transition={spring}
            className="overflow-hidden rounded-2xl bg-linear-to-br from-rose-600 to-orange-600 p-5 text-white shadow-sm"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              <p className="text-sm font-bold">Compliance watch</p>
            </div>
            <div className="mt-3 space-y-2">
              {COMPLIANCE.map(c => (
                <div key={c.id} className={`rounded-lg border px-3 py-2 text-xs font-semibold ${TONE[c.tone] || TONE.blue}`}>
                  <div className="flex items-center justify-between">
                    <span>{c.label}</span>
                    <span className="text-[10px] font-bold">{c.due}</span>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => navigate('/compliance')}
              className="mt-4 inline-flex items-center gap-1 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold backdrop-blur hover:bg-white/30"
            >
              Open compliance <ArrowRight className="h-3 w-3" />
            </button>
          </motion.div>
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
              { label: 'Add employee',   icon: UserPlus,      tone: 'bg-blue-50 text-blue-700',     onClick: () => setShowAddEmployeeModal(true) },
              { label: 'Run payroll',    icon: Banknote,      tone: 'bg-emerald-50 text-emerald-700', onClick: () => navigate('/payroll/run'), module: 'payroll' },
              { label: 'Post job',       icon: Briefcase,     tone: 'bg-violet-50 text-violet-700', onClick: () => navigate('/recruitment/jobs'), module: 'ats' },
              { label: 'Review leaves',  icon: Plane,         tone: 'bg-orange-50 text-orange-700', onClick: () => navigate('/leave/requests'), module: 'leave' },
            ]
            .filter(q => !q.module || isModuleActive(q.module, activeModules))
            .map((q, i) => {
              const Icon = q.icon
              return (
                <motion.button
                  key={q.label}
                  type="button"
                  onClick={q.onClick}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i, ...spring }}
                  whileHover={{ y: -3, scale: 1.02 }}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold ${q.tone}`}
                >
                  <Icon className="h-5 w-5" />
                  {q.label}
                </motion.button>
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
        }}
      />
    </div>
  )
})

HRDashboardPage.displayName = 'HRDashboardPage'
export default HRDashboardPage
