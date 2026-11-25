import { memo, useMemo } from 'react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import {
  Target, TrendingUp, DollarSign, Award, Clock, Users, Phone, Mail,
  Calendar, ArrowRight, Trophy, ChevronRight, Plus, Banknote, CheckCircle2,
} from 'lucide-react'

import { useAuth } from '../../../hooks/useAuth'

// ─── Mock data ─────────────────────────────────────────────────────────────
const STATS = {
  myLeads:        78,
  opportunities:  24,
  closingSoon:    8,
  monthRevenue:   1_85_000,
  quota:          2_50_000,
  conversion:     32,
}

const PIPELINE = [
  { stage: 'New',         count: 32, value: 4_20_000,  color: 'bg-slate-300'  },
  { stage: 'Contacted',   count: 22, value: 6_10_000,  color: 'bg-blue-400'   },
  { stage: 'Qualified',   count: 14, value: 8_80_000,  color: 'bg-violet-400' },
  { stage: 'Proposal',    count: 8,  value: 4_50_000,  color: 'bg-amber-400'  },
  { stage: 'Won',         count: 5,  value: 1_85_000,  color: 'bg-emerald-500'},
]

const TASKS = [
  { id: 1, title: 'Follow up with Acme Corp',          type: 'call',    priority: 'high',   due: 'in 2 hrs' },
  { id: 2, title: 'Send proposal to Tech Innovations', type: 'email',   priority: 'medium', due: 'in 4 hrs' },
  { id: 3, title: 'Demo with Globex Inc',              type: 'meeting', priority: 'high',   due: 'Tomorrow' },
  { id: 4, title: 'Quarterly review with Stark Ltd',   type: 'meeting', priority: 'low',    due: 'Apr 25'   },
]

const LEADS = [
  { id: 1, company: 'Acme Corporation',  contact: 'Tony Stark',     value: 5_00_000,  status: 'qualified',  age: '5 min ago',  initials: 'AC', color: 'bg-blue-500'    },
  { id: 2, company: 'Tech Innovations',  contact: 'Bruce Wayne',    value: 7_50_000,  status: 'contacted',  age: '1 hr ago',   initials: 'TI', color: 'bg-violet-500'  },
  { id: 3, company: 'Globex Inc',        contact: 'Diana Prince',   value: 12_00_000, status: 'qualified',  age: '3 hr ago',   initials: 'GI', color: 'bg-emerald-500' },
  { id: 4, company: 'Stark Industries',  contact: 'Pepper Potts',   value: 9_50_000,  status: 'new',        age: 'Today',      initials: 'SI', color: 'bg-amber-500'   },
  { id: 5, company: 'Wayne Enterprises', contact: 'Lucius Fox',     value: 6_25_000,  status: 'proposal',   age: 'Yesterday',  initials: 'WE', color: 'bg-rose-500'    },
]

const LEADERBOARD = [
  { id: 1, name: 'Amit Kumar',   pct: 95,  amount: 23_50_000, rank: 1 },
  { id: 2, name: 'Neha Joshi',   pct: 88,  amount: 21_80_000, rank: 2 },
  { id: 3, name: 'Vikas Sinha',  pct: 74,  amount: 18_45_000, rank: 3 },
  { id: 4, name: 'Riya Singh',   pct: 62,  amount: 15_50_000, rank: 4 },
]

// ─── Animations ────────────────────────────────────────────────────────────
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }
const fadeUp  = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }
const spring  = { type: 'spring', stiffness: 380, damping: 26 }

// ─── Helpers ───────────────────────────────────────────────────────────────
const STATUS_TONE = {
  new:        'bg-slate-100 text-slate-700',
  contacted:  'bg-blue-100 text-blue-700',
  qualified:  'bg-violet-100 text-violet-700',
  proposal:   'bg-amber-100 text-amber-700',
  won:        'bg-emerald-100 text-emerald-700',
}
const PRIO_TONE = {
  high:   'bg-rose-100 text-rose-700',
  medium: 'bg-amber-100 text-amber-700',
  low:    'bg-slate-100 text-slate-600',
}
const TYPE_ICON = { call: Phone, email: Mail, meeting: Calendar }

const formatINR = (n) => {
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)}L`
  if (n >= 1000)     return `₹${(n / 1000).toFixed(0)}K`
  return `₹${n}`
}

const SalesDashboardPage = memo(() => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const quotaPct       = Math.round((STATS.monthRevenue / STATS.quota) * 100)
  const pipelineMax    = useMemo(() => Math.max(...PIPELINE.map(p => p.count)), [])
  const pipelineValue  = useMemo(() => PIPELINE.reduce((s, p) => s + p.value, 0), [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

  return (
    <div className="h-full overflow-y-auto bg-slate-50">
      <motion.div className="space-y-5 p-6" variants={stagger} initial="hidden" animate="visible">

        {/* ── Greeting + quota ── */}
        <motion.div
          variants={fadeUp}
          whileHover={{ scale: 1.005, boxShadow: '0 8px 24px -4px rgb(0 0 0 / 0.10)' }}
          transition={spring}
          className="grid gap-4 rounded-2xl border border-blue-100 bg-linear-to-r from-blue-50 via-cyan-50 to-sky-50 p-5 shadow-sm md:grid-cols-[1fr_auto] md:items-center"
        >
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ rotate: 8, scale: 1.1 }} transition={spring}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-200 text-lg font-bold text-blue-800 ring-2 ring-blue-300"
            >
              {(user?.name || 'S').slice(0, 1).toUpperCase()}
            </motion.div>
            <div>
              <p className="text-sm text-slate-500">{greeting},</p>
              <p className="text-xl font-bold text-slate-800">Hi {user?.name?.split(' ')[0] || 'there'} — let's close some deals 🚀</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Monthly quota</p>
            <p className="text-2xl font-bold text-slate-900">{quotaPct}% <span className="text-sm font-medium text-slate-500">of {formatINR(STATS.quota)}</span></p>
            <div className="h-2 w-56 overflow-hidden rounded-full bg-slate-200">
              <motion.div
                initial={{ width: 0 }} animate={{ width: `${Math.min(100, quotaPct)}%` }}
                transition={{ duration: 1 }}
                className="h-full rounded-full bg-linear-to-r from-blue-500 to-emerald-500"
              />
            </div>
          </div>
        </motion.div>

        {/* ── Stat cards ── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Target,      label: 'My Leads',       value: STATS.myLeads,            sub: 'Currently active',              tone: 'blue'    },
            { icon: TrendingUp,  label: 'Opportunities',  value: STATS.opportunities,      sub: `${STATS.closingSoon} closing soon`, tone: 'violet' },
            { icon: DollarSign,  label: 'Revenue (mo)',   value: formatINR(STATS.monthRevenue), sub: 'This month',               tone: 'emerald' },
            { icon: Award,       label: 'Conversion',     value: `${STATS.conversion}%`,   sub: 'Above team avg',                tone: 'amber'   },
          ].map((s) => {
            const Icon = s.icon
            const toneMap = {
              blue:    { iconBg: 'bg-blue-100',    icon: 'text-blue-600'    },
              violet:  { iconBg: 'bg-violet-100',  icon: 'text-violet-600'  },
              emerald: { iconBg: 'bg-emerald-100', icon: 'text-emerald-600' },
              amber:   { iconBg: 'bg-amber-100',   icon: 'text-amber-600'   },
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

        {/* ── Pipeline ── */}
        <motion.div
          variants={fadeUp}
          whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
          transition={spring}
          className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Pipeline overview</h3>
              <p className="text-xs text-slate-500">Total pipeline value: <b className="text-slate-800">{formatINR(pipelineValue)}</b></p>
            </div>
            <button type="button" onClick={() => navigate('/crm/opportunities')}
              className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">
              <Plus className="h-3.5 w-3.5" /> Add opportunity
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-5">
            {PIPELINE.map((p, i) => (
              <motion.button
                type="button"
                key={p.stage}
                onClick={() => navigate('/crm/leads')}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, ...spring }}
                whileHover={{ y: -4, scale: 1.03 }}
                className="rounded-xl border border-slate-100 p-3 text-left"
              >
                <p className="text-xs font-semibold text-slate-500">{p.stage}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{p.count}</p>
                <p className="text-[11px] text-slate-500">{formatINR(p.value)}</p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${(p.count / pipelineMax) * 100}%` }}
                    transition={{ duration: 0.9, delay: 0.15 + i * 0.06 }}
                    className={`h-full ${p.color}`}
                  />
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ── Tasks + Recent leads ── */}
        <div className="grid gap-4 lg:grid-cols-3">
          <motion.div
            variants={fadeUp}
            whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
            transition={spring}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Today's tasks</h3>
              <button type="button" onClick={() => navigate('/tasks')}
                className="text-xs font-semibold text-blue-600 hover:underline">All</button>
            </div>
            <div className="space-y-2">
              {TASKS.map((t, i) => {
                const Icon = TYPE_ICON[t.type] || CheckCircle2
                return (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.07 * i, ...spring }}
                    whileHover={{ x: 3 }}
                    className="flex items-start gap-3 rounded-xl border border-slate-100 px-3 py-2.5"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                      <Icon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-slate-800">{t.title}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${PRIO_TONE[t.priority]}`}>
                          {t.priority}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                          <Clock className="h-3 w-3" /> {t.due}
                        </span>
                      </div>
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
                <h3 className="text-base font-bold text-slate-900">Recently assigned leads</h3>
                <p className="text-xs text-slate-500">Top {LEADS.length} active leads</p>
              </div>
              <button type="button" onClick={() => navigate('/sales/leads')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline">
                View all <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            <div className="space-y-2">
              {LEADS.map((l, i) => (
                <motion.button
                  type="button"
                  key={l.id}
                  onClick={() => navigate('/crm/leads')}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 * i, ...spring }}
                  whileHover={{ x: 4, backgroundColor: '#f8fafc' }}
                  className="flex w-full items-center gap-3 rounded-xl border border-slate-100 px-3 py-2.5 text-left"
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${l.color}`}>
                    {l.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-800">{l.company}</p>
                    <p className="truncate text-[11px] text-slate-500">{l.contact} · {l.age}</p>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-emerald-600">{formatINR(l.value)}</span>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_TONE[l.status]}`}>
                    {l.status}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Leaderboard + CTA ── */}
        <div className="grid gap-4 lg:grid-cols-3">
          <motion.div
            variants={fadeUp}
            whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
            transition={spring}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-2"
          >
            <div className="mb-3 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              <h3 className="text-base font-bold text-slate-900">Team leaderboard</h3>
              <span className="ml-auto text-xs text-slate-500">This month</span>
            </div>
            <div className="space-y-3">
              {LEADERBOARD.map((m, i) => {
                const isYou = (user?.name || '').includes(m.name)
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 * i }}
                    whileHover={{ x: 3 }}
                    className={`flex items-center gap-3 rounded-xl border px-3 py-2 ${
                      isYou ? 'border-blue-200 bg-blue-50' : 'border-slate-100'
                    }`}
                  >
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      m.rank === 1 ? 'bg-amber-400 text-white' :
                      m.rank === 2 ? 'bg-slate-300 text-slate-800' :
                      m.rank === 3 ? 'bg-orange-300 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>#{m.rank}</div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-slate-800">{m.name} {isYou && <span className="text-[10px] text-blue-600">(you)</span>}</p>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <motion.div
                          initial={{ width: 0 }} animate={{ width: `${m.pct}%` }}
                          transition={{ duration: 0.9, delay: 0.15 + i * 0.06 }}
                          className="h-full rounded-full bg-linear-to-r from-blue-500 to-emerald-500"
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-800">{formatINR(m.amount)}</p>
                      <p className="text-[10px] text-slate-500">{m.pct}% quota</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            whileHover={{ y: -4, scale: 1.01, boxShadow: '0 16px 40px -8px rgb(59 130 246 / 0.4)' }}
            transition={spring}
            className="overflow-hidden rounded-2xl bg-linear-to-br from-blue-600 via-cyan-500 to-emerald-500 p-5 text-white shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Banknote className="h-5 w-5" />
              <p className="text-sm font-bold">Forecast for this month</p>
            </div>
            <p className="mt-3 text-3xl font-bold">{formatINR(STATS.monthRevenue + 65_000)}</p>
            <p className="text-xs text-white/80">Based on {STATS.closingSoon} deals closing soon</p>
            <button
              type="button"
              onClick={() => navigate('/crm/deals')}
              className="mt-4 inline-flex items-center gap-1 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold backdrop-blur hover:bg-white/30"
            >
              View deals <ArrowRight className="h-3 w-3" />
            </button>
            <div className="mt-5 flex items-center gap-2 text-[11px] text-white/80">
              <Users className="h-3 w-3" /> 3 deals nearing close · check follow-ups
            </div>
          </motion.div>
        </div>

      </motion.div>
    </div>
  )
})

SalesDashboardPage.displayName = 'SalesDashboardPage'
export default SalesDashboardPage
