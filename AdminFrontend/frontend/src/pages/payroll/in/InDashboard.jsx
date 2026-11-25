import { useState, useMemo, memo, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { IndianRupee, Users, Shield, Receipt, Search, RotateCcw, ChevronRight, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { formatINR, DEPT_TEXT_COLORS, DEPT_COLORS } from '../data/payrollData'
import PayStatCard    from '../components/PayStatCard'
import PayStatusBadge from '../components/PayStatusBadge'
import PaySkeletonRow from '../components/PaySkeletonRow'
import payrollService from '../../../services/payrollService'

const STATUSES = ['All', 'Processed', 'Pending', 'On Hold', 'Failed']

const InDashboard = memo(() => {
  const navigate = useNavigate()
  const [search,  setSearch]  = useState('')
  const [deptF,   setDeptF]   = useState('All')
  const [statusF, setStatusF] = useState('All')
  const [loading, setLoading] = useState(true)
  const [employees, setEmployees] = useState([])
  const [summary, setSummary] = useState({})
  const [deptBreakdown, setDeptBreakdown] = useState([])

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      const data = await payrollService.getDashboard('IN')
      setEmployees(data.employees || [])
      setSummary(data.summary || {})
      setDeptBreakdown(data.dept_breakdown || [])
    } catch (error) {
      console.error('Failed to load dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const maxDeptNet = useMemo(() => Math.max(...deptBreakdown.map(d => d.net_pay || 0), 1), [deptBreakdown])
  const allDepts = useMemo(() => ['All', ...deptBreakdown.map(d => d.dept)], [deptBreakdown])

  const totalPF  = useMemo(() => summary.total_pf || 0, [summary])
  const totalESI = useMemo(() => summary.total_esi || 0, [summary])
  const totalTDS = useMemo(() => summary.total_tds || 0, [summary])
  const totalNet = useMemo(() => summary.total_net || 0, [summary])
  const totalCost = useMemo(() => (summary.total_gross || 0) + totalPF, [summary, totalPF])
  const totalProfTax = useMemo(() => summary.total_prof_tax || 0, [summary]) // Employer PF included

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return employees.filter(e =>
      (e.name.toLowerCase().includes(q) || (e.dept || '').toLowerCase().includes(q)) &&
      (deptF   === 'All' || e.dept   === deptF) &&
      (statusF === 'All' || e.status === statusF)
    )
  }, [search, deptF, statusF, employees])

  const resetFilters = () => { setSearch(''); setDeptF('All'); setStatusF('All') }
  const isDirty = search || deptF !== 'All' || statusF !== 'All'

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🇮🇳</span>
            <h1 className="text-xl font-bold text-slate-900">India Payroll Dashboard</h1>
          </div>
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  {['Employee', 'Basic', 'HRA', 'Allowances', 'PF', 'ESI', 'TDS', 'Net Pay', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, i) => <PaySkeletonRow key={i} cols={9} />)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>

        {/* Header */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🇮🇳</span>
              <h1 className="text-xl font-bold text-slate-900">India Payroll Dashboard</h1>
            </div>
            <p className="text-sm text-slate-500">April 2026 · Monthly Cycle · {employees.length} employees · PF / ESI / TDS Compliant</p>
          </div>
          <motion.button
            onClick={() => navigate('/payroll/in/run')}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
          >
            Run Payroll <ChevronRight className="h-4 w-4" />
          </motion.button>
        </div>

        {/* Stat Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <PayStatCard label="Total Payroll Cost" value={formatINR(totalCost)} sub="Incl. employer PF" icon={IndianRupee} gradient="bg-gradient-to-br from-orange-500 to-amber-600" delay={0} />
          <PayStatCard label="Total Employees" value={`${employees.length}`} sub="Active this cycle" icon={Users} gradient="bg-gradient-to-br from-blue-500 to-indigo-600" delay={0.07} />
          <PayStatCard label="PF Contributions" value={formatINR(totalPF * 2)} sub="Employee + Employer" icon={Shield} gradient="bg-gradient-to-br from-violet-500 to-purple-600" delay={0.14} />
          <PayStatCard label="TDS Deducted" value={formatINR(totalTDS)} sub="Income tax at source" icon={Receipt} gradient="bg-gradient-to-br from-emerald-500 to-teal-600" delay={0.21} />
        </div>

        {/* Compliance Badges */}
        <div className="mb-6 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {[
            { label: 'PF (12%)',       val: formatINR(totalPF),  bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700' },
            { label: 'ESI (3.25%)',    val: formatINR(totalESI), bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700' },
            { label: 'Prof Tax',       val: formatINR(totalProfTax), bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
            { label: 'TDS',            val: formatINR(totalTDS), bg: 'bg-rose-50',   border: 'border-rose-200',   text: 'text-rose-700' },
            { label: 'Net Payroll',    val: formatINR(totalNet), bg: 'bg-emerald-50',border: 'border-emerald-200',text: 'text-emerald-700' },
          ].map((b, i) => (
            <motion.div key={b.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.06 }}
              className={`rounded-xl border ${b.border} ${b.bg} p-3 text-center`}>
              <div className={`text-sm font-bold ${b.text}`}>{b.val}</div>
              <div className="text-xs text-slate-500 mt-0.5">{b.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Department Distribution */}
        {deptBreakdown.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
            className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-orange-500" />
                <h3 className="font-bold text-slate-900">Department Payroll Distribution</h3>
              </div>
              <span className="text-xs text-slate-400">Net Pay · April 2026</span>
            </div>
            <div className="space-y-3">
              {deptBreakdown.map((d, i) => (
                <motion.div key={d.dept} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.06 }} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-xs font-semibold text-slate-600">{d.dept}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <motion.div className={`h-full rounded-full ${DEPT_COLORS[d.dept] || 'bg-slate-500'}`} initial={{ width: 0 }} animate={{ width: `${(d.net_pay / maxDeptNet) * 100}%` }} transition={{ delay: 0.35 + i * 0.06, duration: 0.75, ease: 'easeOut' }} />
                  </div>
                  <span className="w-28 text-right text-xs font-semibold text-slate-700">{formatINR(d.net_pay)}</span>
                  <span className="w-8 text-right text-[11px] text-slate-400">{d.count}p</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative min-w-52 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employee or department…"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100" />
          </div>
          <select value={deptF} onChange={e => setDeptF(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100">
            {allDepts.map(d => <option key={d}>{d}</option>)}
          </select>
          <select value={statusF} onChange={e => setStatusF(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100">
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          {isDirty && (
            <button onClick={resetFilters} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-500 shadow-sm hover:bg-slate-50">
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>
          )}
        </div>

        {/* Employee Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  {['Employee', 'Basic', 'HRA', 'Allowances', 'PF', 'ESI', 'TDS', 'Net Pay', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0
                  ? <tr><td colSpan={9} className="py-16 text-center"><IndianRupee className="mx-auto mb-3 h-10 w-10 text-slate-300" /><p className="text-sm text-slate-500">No employees found</p></td></tr>
                  : filtered.map((emp, idx) => {
                      const initials = emp.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                      const colors = ['bg-blue-500', 'bg-violet-500', 'bg-green-500', 'bg-pink-500', 'bg-orange-500', 'bg-teal-500']
                      const avatarColor = colors[idx % colors.length]
                      
                      return (
                        <motion.tr key={emp.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(idx * 0.03, 0.3) }}
                          className="border-b border-slate-100 transition hover:bg-slate-50/70">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white ${avatarColor}`}>{initials}</div>
                              <div>
                                <div className="text-sm font-semibold text-slate-800">{emp.name}</div>
                                <div className="text-xs text-slate-400">{emp.designation}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap">{formatINR(emp.basic || 0)}</td>
                          <td className="px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap">{formatINR(emp.hra || 0)}</td>
                          <td className="px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap">{formatINR(emp.allowances || 0)}</td>
                          <td className="px-4 py-3.5 whitespace-nowrap"><span className="text-xs font-medium text-violet-700">−{formatINR(emp.pf || 0)}</span></td>
                          <td className="px-4 py-3.5 whitespace-nowrap"><span className="text-xs font-medium text-blue-600">−{formatINR(emp.esi || 0)}</span></td>
                          <td className="px-4 py-3.5 whitespace-nowrap"><span className="text-xs font-medium text-rose-600">−{formatINR(emp.tds || 0)}</span></td>
                          <td className="px-4 py-3.5 whitespace-nowrap"><span className="text-sm font-bold text-orange-600">{formatINR(emp.net_pay || 0)}</span></td>
                          <td className="px-4 py-3.5"><PayStatusBadge status={emp.status} /></td>
                        </motion.tr>
                      )
                    })
                }
              </tbody>
            </table>
          </div>
          {filtered.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
              <span className="text-xs text-slate-400">Showing {filtered.length} of {employees.length} employees</span>
              <span className="text-xs font-semibold text-slate-700">Net: <span className="text-orange-600">{formatINR(filtered.reduce((s, e) => s + (e.net_pay || 0), 0))}</span></span>
            </div>
          )}
        </div>

      </motion.div>
    </div>
  )
})
InDashboard.displayName = 'InDashboard'
export default InDashboard
