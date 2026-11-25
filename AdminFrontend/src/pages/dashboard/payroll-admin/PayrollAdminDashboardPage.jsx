import { useState, memo } from 'react'
import { motion } from 'motion/react'
import {
  DollarSign, Users, Calendar, FileText, TrendingUp, AlertCircle,
  CheckCircle, Clock, ArrowRight, ChevronLeft, ChevronRight,
  Building, Briefcase, CreditCard, Calculator, Download
} from 'lucide-react'

import { useAuth } from '../../../hooks/useAuth'

// ─── Mock data ─────────────────────────────────────────────────────────────
const PAYROLL_STATS = {
  totalPayroll: 42_50_000,
  processedThisMonth: 248,
  pendingProcessing: 12,
  avgSalary: 1_71_371,
  taxDeducted: 8_50_000,
  reimbursements: 1_25_000,
}

const UPCOMING_PAYROLLS = [
  { id: 1, type: 'Monthly Salary', date: 'May 1, 2026', amount: 42_50_000, status: 'scheduled', count: 248 },
  { id: 2, type: 'Contractor Payment', date: 'May 5, 2026', amount: 3_50_000, status: 'pending', count: 15 },
  { id: 3, type: 'Bonus Payout', date: 'May 15, 2026', amount: 8_00_000, status: 'draft', count: 45 },
]

const PENDING_ITEMS = [
  { id: 1, type: 'Salary Revision', employee: 'Rahul Sharma', current: '85,000', proposed: '95,000', status: 'pending_approval' },
  { id: 2, type: 'Reimbursement', employee: 'Priya Patel', amount: 12_500, status: 'pending_verification' },
  { id: 3, type: 'Leave Encashment', employee: 'Amit Kumar', days: 5, amount: 21_250, status: 'pending_approval' },
  { id: 4, type: 'Advance Request', employee: 'Sneha Iyer', amount: 50_000, status: 'pending_approval' },
]

const DEPARTMENT_COSTS = [
  { name: 'Engineering', cost: 12_50_000, headcount: 85, change: '+5%' },
  { name: 'Sales', cost: 6_80_000, headcount: 42, change: '+3%' },
  { name: 'Marketing', cost: 4_20_000, headcount: 28, change: '-2%' },
  { name: 'Operations', cost: 8_50_000, headcount: 56, change: '+8%' },
  { name: 'Finance', cost: 3_20_000, headcount: 22, change: '0%' },
]

// ─── Animations ────────────────────────────────────────────────────────────
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }
const fadeUp = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }
const spring = { type: 'spring', stiffness: 380, damping: 26 }

const formatINR = (n) => {
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(2)}L`
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`
  return `₹${n.toLocaleString()}`
}

const PayrollAdminDashboardPage = memo(() => {
  const { user } = useAuth()
  const [pendingPage, setPendingPage] = useState(0)
  
  const today = new Date()
  const hour = today.getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

  const PER_PAGE = 3
  const totalPendingPages = Math.ceil(PENDING_ITEMS.length / PER_PAGE)
  const visiblePending = PENDING_ITEMS.slice(pendingPage * PER_PAGE, pendingPage * PER_PAGE + PER_PAGE)

  return (
    <div className="h-full overflow-y-auto bg-slate-50">
      <motion.div className="space-y-5 p-6" variants={stagger} initial="hidden" animate="visible">
        
        {/* ── 1. Greeting Banner ── */}
        <motion.div variants={fadeUp}
          whileHover={{ scale: 1.005, boxShadow: '0 8px 24px -4px rgb(0 0 0 / 0.10)' }}
          transition={spring}
          className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-linear-to-r from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200 px-6 py-4 shadow-sm cursor-default">
          <div className="flex items-center gap-4">
            <motion.div whileHover={{ rotate: 8, scale: 1.1 }} transition={spring}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-200 text-lg font-bold text-emerald-800 ring-2 ring-emerald-300">
              PA
            </motion.div>
            <div>
              <p className="text-sm text-slate-500">{greeting},</p>
              <p className="text-xl font-bold text-slate-800">Hi {user?.name?.split(' ')[0] || 'Payroll Admin'} — Payroll Management</p>
            </div>
          </div>
          <motion.div whileHover={{ scale: 1.04 }} transition={spring}
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 shadow-sm border border-emerald-200">
            <Calendar className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-semibold text-slate-700">
              Next Payroll: May 1, 2026
            </span>
          </motion.div>
          <div className="flex items-center gap-5">
            <motion.div className="text-center" whileHover={{ scale: 1.1 }} transition={spring}>
              <p className="text-xl font-bold text-slate-800">{PAYROLL_STATS.pendingProcessing}</p>
              <p className="text-xs text-slate-500">Pending</p>
            </motion.div>
            <div className="h-8 w-px bg-slate-300" />
            <motion.div className="text-center" whileHover={{ scale: 1.1 }} transition={spring}>
              <p className="text-xl font-bold text-slate-800">{PAYROLL_STATS.processedThisMonth}</p>
              <p className="text-xs text-slate-500">Processed</p>
            </motion.div>
          </div>
        </motion.div>

        {/* ── 2. Summary Stat Cards ── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div variants={fadeUp}
            whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
            transition={spring}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <motion.div whileHover={{ rotate: -10, scale: 1.15 }} transition={spring}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </motion.div>
              <span className="text-sm font-semibold text-slate-600">Total Payroll</span>
            </div>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{formatINR(PAYROLL_STATS.totalPayroll)}</p>
            <div className="mt-1 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-[11px] text-slate-500">Monthly expense</span>
            </div>
          </motion.div>

          <motion.div variants={fadeUp}
            whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
            transition={spring}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <motion.div whileHover={{ rotate: -10, scale: 1.15 }} transition={spring}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100">
                <Users className="h-5 w-5 text-blue-600" />
              </motion.div>
              <span className="text-sm font-semibold text-slate-600">Employees</span>
            </div>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{PAYROLL_STATS.processedThisMonth}</p>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="text-[11px] text-slate-500">Active payroll employees</span>
            </div>
          </motion.div>

          <motion.div variants={fadeUp}
            whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
            transition={spring}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <motion.div whileHover={{ rotate: -10, scale: 1.15 }} transition={spring}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100">
                <Calculator className="h-5 w-5 text-amber-600" />
              </motion.div>
              <span className="text-sm font-semibold text-slate-600">Avg Salary</span>
            </div>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{formatINR(PAYROLL_STATS.avgSalary)}</p>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="text-[11px] text-slate-500">Per employee</span>
            </div>
          </motion.div>

          <motion.div variants={fadeUp}
            whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
            transition={spring}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <motion.div whileHover={{ rotate: -10, scale: 1.15 }} transition={spring}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100">
                <CreditCard className="h-5 w-5 text-rose-600" />
              </motion.div>
              <span className="text-sm font-semibold text-slate-600">Tax Deducted</span>
            </div>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{formatINR(PAYROLL_STATS.taxDeducted)}</p>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="text-[11px] text-slate-500">TDS + Professional Tax</span>
            </div>
          </motion.div>
        </div>

        {/* ── 3. Upcoming Payrolls + Department Costs ── */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Upcoming Payrolls */}
          <motion.div variants={fadeUp}
            whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
            transition={spring}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Upcoming Payrolls</h3>
              <motion.button whileHover={{ x: 3 }} transition={spring} className="text-xs font-semibold text-emerald-600 hover:underline">
                View all <ArrowRight className="inline h-3 w-3" />
              </motion.button>
            </div>
            <div className="space-y-3">
              {UPCOMING_PAYROLLS.map((payroll, i) => (
                <motion.div key={payroll.id}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i, ...spring }}
                  whileHover={{ x: 3 }}
                  className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${payroll.status === 'scheduled' ? 'bg-emerald-100' : payroll.status === 'pending' ? 'bg-amber-100' : 'bg-slate-100'}`}>
                      <CreditCard className={`h-4 w-4 ${payroll.status === 'scheduled' ? 'text-emerald-600' : payroll.status === 'pending' ? 'text-amber-600' : 'text-slate-600'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{payroll.type}</p>
                      <p className="text-[11px] text-slate-500">{payroll.date} · {payroll.count} employees</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-800">{formatINR(payroll.amount)}</p>
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${payroll.status === 'scheduled' ? 'bg-emerald-100 text-emerald-700' : payroll.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                      {payroll.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Department Costs */}
          <motion.div variants={fadeUp}
            whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
            transition={spring}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Department Payroll Costs</h3>
              <motion.button whileHover={{ x: 3 }} transition={spring} className="text-xs font-semibold text-emerald-600 hover:underline">
                Detailed report <ArrowRight className="inline h-3 w-3" />
              </motion.button>
            </div>
            <div className="space-y-3">
              {DEPARTMENT_COSTS.map((dept, i) => (
                <motion.div key={dept.name}
                  initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i, ...spring }}
                  whileHover={{ x: 3 }}
                  className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                      <DollarSign className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{dept.name}</p>
                      <p className="text-[11px] text-slate-500">{dept.headcount} employees</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-800">{formatINR(dept.cost)}</p>
                    <p className={`text-[11px] ${dept.change.startsWith('+') ? 'text-emerald-600' : dept.change.startsWith('-') ? 'text-rose-600' : 'text-slate-500'}`}>
                      {dept.change} vs last month
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── 4. Pending Approvals + Quick Actions ── */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Pending Items */}
          <motion.div variants={fadeUp}
            whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
            transition={spring}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Pending Payroll Items</h3>
                <p className="text-xs text-slate-500">{PENDING_ITEMS.length} items need action</p>
              </div>
              <div className="flex items-center gap-2">
                <motion.button onClick={() => setPendingPage(p => Math.max(0, p - 1))} disabled={pendingPage === 0}
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} transition={spring}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40">
                  <ChevronLeft className="h-4 w-4" />
                </motion.button>
                <motion.button onClick={() => setPendingPage(p => Math.min(totalPendingPages - 1, p + 1))} disabled={pendingPage === totalPendingPages - 1}
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} transition={spring}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40">
                  <ChevronRight className="h-4 w-4" />
                </motion.button>
              </div>
            </div>
            <div className="space-y-2">
              {visiblePending.map((item, i) => (
                <motion.div key={item.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i, ...spring }}
                  whileHover={{ x: 4, scale: 1.01 }}
                  className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 cursor-pointer hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{item.type}</p>
                      <p className="text-[11px] text-slate-500">
                        {item.employee} {item.amount && `· ${formatINR(item.amount)}`} {item.current && `· ${item.current} → ${item.proposed}`} {item.days && `· ${item.days} days`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="rounded-lg bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-200">
                      Approve
                    </button>
                    <button className="rounded-lg bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700 hover:bg-rose-200">
                      Reject
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={fadeUp}
            whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
            transition={spring}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Quick Actions</h3>
            <div className="space-y-3">
              {[
                { label: 'Process Payroll', icon: Building, tone: 'bg-emerald-50 text-emerald-700' },
                { label: 'Download Reports', icon: Download, tone: 'bg-blue-50 text-blue-700' },
                { label: 'View Payslips', icon: FileText, tone: 'bg-violet-50 text-violet-700' },
                { label: 'Tax Statements', icon: Briefcase, tone: 'bg-amber-50 text-amber-700' },
              ].map((q, i) => {
                const Icon = q.icon
                return (
                  <motion.button key={q.label} type="button"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05, ...spring }}
                    whileHover={{ y: -3, scale: 1.02 }}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold ${q.tone}`}>
                    <Icon className="h-5 w-5" />
                    {q.label}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        </div>

      </motion.div>
    </div>
  )
})

PayrollAdminDashboardPage.displayName = 'PayrollAdminDashboardPage'
export default PayrollAdminDashboardPage
