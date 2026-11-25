import { useState, memo } from 'react'
import { motion } from 'motion/react'
import {
  DollarSign, TrendingUp, TrendingDown, FileText, Calendar,
  ArrowRight, ChevronLeft, ChevronRight, Download,
  BarChart3, CreditCard, Building2, AlertCircle
} from 'lucide-react'

import { useAuth } from '../../../hooks/useAuth'

// ─── Mock data ─────────────────────────────────────────────────────────────
const FINANCE_STATS = {
  totalRevenue: 2_45_00_000,
  totalExpenses: 1_85_00_000,
  netProfit: 60_00_000,
  cashFlow: 42_50_000,
  pendingInvoices: 12,
  outstandingReceivables: 8_50_000,
}

const MONTHLY_TREND = [
  { month: 'Jan', revenue: 18_50_000, expenses: 14_00_000 },
  { month: 'Feb', revenue: 19_20_000, expenses: 14_50_000 },
  { month: 'Mar', revenue: 20_10_000, expenses: 15_00_000 },
  { month: 'Apr', revenue: 21_50_000, expenses: 15_80_000 },
  { month: 'May', revenue: 20_80_000, expenses: 15_20_000 },
  { month: 'Jun', revenue: 22_40_000, expenses: 16_10_000 },
]

const EXPENSE_CATEGORIES = [
  { category: 'Payroll', amount: 85_00_000, percentage: 46, color: 'bg-blue-500' },
  { category: 'Operations', amount: 32_00_000, percentage: 17, color: 'bg-amber-500' },
  { category: 'Marketing', amount: 28_00_000, percentage: 15, color: 'bg-violet-500' },
  { category: 'Rent & Utilities', amount: 22_00_000, percentage: 12, color: 'bg-emerald-500' },
  { category: 'IT & Software', amount: 18_00_000, percentage: 10, color: 'bg-rose-500' },
]

const RECENT_TRANSACTIONS = [
  { id: 1, description: 'Client Payment - Acme Corp', type: 'income', amount: 5_50_000, date: 'Apr 25', status: 'completed' },
  { id: 2, description: 'AWS Infrastructure', type: 'expense', amount: 1_25_000, date: 'Apr 24', status: 'completed' },
  { id: 3, description: 'Q1 Bonus Payout', type: 'expense', amount: 8_00_000, date: 'Apr 23', status: 'completed' },
  { id: 4, description: 'Client Payment - Tech Innovations', type: 'income', amount: 7_50_000, date: 'Apr 22', status: 'completed' },
  { id: 5, description: 'Office Rent', type: 'expense', amount: 2_80_000, date: 'Apr 20', status: 'completed' },
]

const FINANCIAL_REPORTS = [
  { id: 1, name: 'Balance Sheet - Q1 2026', date: 'Mar 31, 2026', type: 'quarterly' },
  { id: 2, name: 'P&L Statement - April', date: 'Apr 30, 2026', type: 'monthly' },
  { id: 3, name: 'Cash Flow Report - Q1', date: 'Mar 31, 2026', type: 'quarterly' },
  { id: 4, name: 'Budget vs Actual - April', date: 'Apr 30, 2026', type: 'monthly' },
]

// ─── Animations ────────────────────────────────────────────────────────────
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }
const fadeUp = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }
const spring = { type: 'spring', stiffness: 380, damping: 26 }

const formatINR = (n) => {
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(2)}Cr`
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(2)}L`
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`
  return `₹${n.toLocaleString()}`
}

const FinanceViewerDashboardPage = memo(() => {
  const { user } = useAuth()
  const [transactionPage, setTransactionPage] = useState(0)
  
  const today = new Date()
  const hour = today.getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

  const PER_PAGE = 3
  const totalTransactionPages = Math.ceil(RECENT_TRANSACTIONS.length / PER_PAGE)
  const visibleTransactions = RECENT_TRANSACTIONS.slice(transactionPage * PER_PAGE, transactionPage * PER_PAGE + PER_PAGE)

  const profitMargin = Math.round((FINANCE_STATS.netProfit / FINANCE_STATS.totalRevenue) * 100)

  return (
    <div className="h-full overflow-y-auto bg-slate-50">
      <motion.div className="space-y-5 p-6" variants={stagger} initial="hidden" animate="visible">
        
        {/* ── 1. Greeting Banner ── */}
        <motion.div variants={fadeUp}
          whileHover={{ scale: 1.005, boxShadow: '0 8px 24px -4px rgb(0 0 0 / 0.10)' }}
          transition={spring}
          className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-linear-to-r from-blue-50 via-cyan-50 to-sky-50 border border-blue-200 px-6 py-4 shadow-sm cursor-default">
          <div className="flex items-center gap-4">
            <motion.div whileHover={{ rotate: 8, scale: 1.1 }} transition={spring}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-200 text-lg font-bold text-blue-800 ring-2 ring-blue-300">
              FV
            </motion.div>
            <div>
              <p className="text-sm text-slate-500">{greeting},</p>
              <p className="text-xl font-bold text-slate-800">Hi {user?.name?.split(' ')[0] || 'Finance Viewer'} — Financial Overview</p>
            </div>
          </div>
          <motion.div whileHover={{ scale: 1.04 }} transition={spring}
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 shadow-sm border border-blue-200">
            <Calendar className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-semibold text-slate-700">
              FY 2025-26
            </span>
          </motion.div>
          <div className="flex items-center gap-5">
            <motion.div className="text-center" whileHover={{ scale: 1.1 }} transition={spring}>
              <p className="text-xl font-bold text-slate-800">{profitMargin}%</p>
              <p className="text-xs text-slate-500">Profit Margin</p>
            </motion.div>
            <div className="h-8 w-px bg-slate-300" />
            <motion.div className="text-center" whileHover={{ scale: 1.1 }} transition={spring}>
              <p className="text-xl font-bold text-slate-800">{FINANCE_STATS.pendingInvoices}</p>
              <p className="text-xs text-slate-500">Pending Invoices</p>
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
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </motion.div>
              <span className="text-sm font-semibold text-slate-600">Total Revenue</span>
            </div>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{formatINR(FINANCE_STATS.totalRevenue)}</p>
            <div className="mt-1 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-[11px] font-bold text-emerald-500">+12.5% <span className="font-medium text-slate-400">vs last year</span></span>
            </div>
          </motion.div>

          <motion.div variants={fadeUp}
            whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
            transition={spring}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <motion.div whileHover={{ rotate: -10, scale: 1.15 }} transition={spring}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100">
                <TrendingDown className="h-5 w-5 text-rose-600" />
              </motion.div>
              <span className="text-sm font-semibold text-slate-600">Total Expenses</span>
            </div>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{formatINR(FINANCE_STATS.totalExpenses)}</p>
            <div className="mt-1 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-rose-500" />
              <span className="text-[11px] font-bold text-rose-500">+8.2% <span className="font-medium text-slate-400">vs last year</span></span>
            </div>
          </motion.div>

          <motion.div variants={fadeUp}
            whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
            transition={spring}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <motion.div whileHover={{ rotate: -10, scale: 1.15 }} transition={spring}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </motion.div>
              <span className="text-sm font-semibold text-slate-600">Net Profit</span>
            </div>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{formatINR(FINANCE_STATS.netProfit)}</p>
            <div className="mt-1 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-[11px] font-bold text-emerald-500">+24.5% <span className="font-medium text-slate-400">vs last year</span></span>
            </div>
          </motion.div>

          <motion.div variants={fadeUp}
            whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
            transition={spring}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <motion.div whileHover={{ rotate: -10, scale: 1.15 }} transition={spring}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100">
                <CreditCard className="h-5 w-5 text-amber-600" />
              </motion.div>
              <span className="text-sm font-semibold text-slate-600">Cash Flow</span>
            </div>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{formatINR(FINANCE_STATS.cashFlow)}</p>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="text-[11px] text-slate-500">Available balance</span>
            </div>
          </motion.div>
        </div>

        {/* ── 3. Revenue Trend + Expense Breakdown ── */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Monthly Trend */}
          <motion.div variants={fadeUp}
            whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
            transition={spring}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Revenue vs Expenses Trend</h3>
              <motion.button whileHover={{ x: 3 }} transition={spring} className="text-xs font-semibold text-blue-600 hover:underline">
                Detailed view <ArrowRight className="inline h-3 w-3" />
              </motion.button>
            </div>
            <div className="space-y-3">
              {MONTHLY_TREND.map((month, i) => (
                <motion.div key={month.month}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i, ...spring }}
                  whileHover={{ x: 3 }}
                  className="rounded-xl border border-slate-100 px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-700">{month.month}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-emerald-600 font-bold">{formatINR(month.revenue)}</span>
                      <span className="text-xs text-rose-600 font-bold">{formatINR(month.expenses)}</span>
                    </div>
                  </div>
                  <div className="flex h-2 w-full gap-1 overflow-hidden rounded-full">
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${(month.revenue / 25_00_000) * 100}%` }}
                      transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
                      className="h-full bg-emerald-500"
                    />
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${(month.expenses / 25_00_000) * 100}%` }}
                      transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
                      className="h-full bg-rose-400"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Expense Categories */}
          <motion.div variants={fadeUp}
            whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
            transition={spring}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Expense Breakdown</h3>
              <motion.button whileHover={{ x: 3 }} transition={spring} className="text-xs font-semibold text-blue-600 hover:underline">
                View details <ArrowRight className="inline h-3 w-3" />
              </motion.button>
            </div>
            <div className="space-y-3">
              {EXPENSE_CATEGORIES.map((category, i) => (
                <motion.div key={category.category}
                  initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i, ...spring }}
                  whileHover={{ x: 3 }}
                  className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${category.color}`} />
                    <div>
                      <p className="text-sm font-bold text-slate-800">{category.category}</p>
                      <p className="text-[11px] text-slate-500">{category.percentage}% of total</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-800">{formatINR(category.amount)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── 4. Recent Transactions + Financial Reports ── */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Recent Transactions */}
          <motion.div variants={fadeUp}
            whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
            transition={spring}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recent Transactions</h3>
                <p className="text-xs text-slate-500">Last 5 transactions</p>
              </div>
              <div className="flex items-center gap-2">
                <motion.button onClick={() => setTransactionPage(p => Math.max(0, p - 1))} disabled={transactionPage === 0}
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} transition={spring}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40">
                  <ChevronLeft className="h-4 w-4" />
                </motion.button>
                <motion.button onClick={() => setTransactionPage(p => Math.min(totalTransactionPages - 1, p + 1))} disabled={transactionPage === totalTransactionPages - 1}
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} transition={spring}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40">
                  <ChevronRight className="h-4 w-4" />
                </motion.button>
              </div>
            </div>
            <div className="space-y-2">
              {visibleTransactions.map((transaction, i) => (
                <motion.div key={transaction.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i, ...spring }}
                  whileHover={{ x: 4, scale: 1.01 }}
                  className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${transaction.type === 'income' ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                      {transaction.type === 'income' ? <TrendingUp className="h-4 w-4 text-emerald-600" /> : <TrendingDown className="h-4 w-4 text-rose-600" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{transaction.description}</p>
                      <p className="text-[11px] text-slate-500">{transaction.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${transaction.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatINR(transaction.amount)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Financial Reports */}
          <motion.div variants={fadeUp}
            whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
            transition={spring}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Financial Reports</h3>
                <p className="text-xs text-slate-500">Download ready reports</p>
              </div>
              <motion.button whileHover={{ x: 3 }} transition={spring} className="text-xs font-semibold text-blue-600 hover:underline">
                View all <ArrowRight className="inline h-3 w-3" />
              </motion.button>
            </div>
            <div className="space-y-3">
              {FINANCIAL_REPORTS.map((report, i) => (
                <motion.div key={report.id}
                  initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i, ...spring }}
                  whileHover={{ x: 3 }}
                  className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{report.name}</p>
                      <p className="text-[11px] text-slate-500">{report.date} · {report.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button whileHover={{ scale: 1.1 }} transition={spring}
                      className="rounded-lg bg-blue-100 p-1.5 hover:bg-blue-200">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} transition={spring}
                      className="rounded-lg bg-emerald-100 p-1.5 hover:bg-emerald-200">
                      <Download className="h-4 w-4 text-emerald-600" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── 5. Quick Actions ── */}
        <motion.div variants={fadeUp}
          whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
          transition={spring}
          className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-bold text-slate-800">Quick Actions</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'View P&L Statement', icon: BarChart3, tone: 'bg-blue-50 text-blue-700' },
              { label: 'Download Reports', icon: Download, tone: 'bg-emerald-50 text-emerald-700' },
              { label: 'Expense Tracking', path: '/finance-viewer/expenses', icon: Building2 },
              { label: 'Print Summary', icon: FileText, tone: 'bg-violet-50 text-violet-700' },
            ].map((q, i) => {
              const Icon = q.icon
              return (
                <motion.button key={q.label} type="button"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05, ...spring }}
                  whileHover={{ y: -3, scale: 1.02 }}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold ${q.tone}`}>
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

FinanceViewerDashboardPage.displayName = 'FinanceViewerDashboardPage'
export default FinanceViewerDashboardPage
