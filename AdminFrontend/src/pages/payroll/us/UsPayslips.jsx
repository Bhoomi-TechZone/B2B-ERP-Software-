import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Search, FileText, RotateCcw, Download, X } from 'lucide-react'
import { formatUSD, DEPT_TEXT_COLORS } from '../data/payrollData'
import PayStatusBadge from '../components/PayStatusBadge'
import PaySkeletonRow from '../components/PaySkeletonRow'
import payrollService from '../../../services/payrollService'

// Breakdown Panel
const BreakdownPanel = ({ slip, onClose }) => (
  <AnimatePresence>
    {slip && (
      <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black" onClick={onClose} />
        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm overflow-y-auto bg-white shadow-2xl">
          <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-slate-900">{slip.name}</div>
              <div className="text-xs text-slate-500">{slip.designation} · {slip.dept} · {slip.state}</div>
            </div>
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100"><X className="h-4 w-4 text-slate-600" /></button>
          </div>
          <div className="p-5 space-y-4">
            <div className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 p-4 text-white">
              <div className="flex items-center gap-1.5 mb-1"><span className="text-lg">🇺🇸</span><div className="text-xs opacity-80">{slip.month}</div></div>
              <div className="text-2xl font-bold">{formatUSD(slip.net_pay || 0)}</div>
              <div className="text-xs opacity-80">Net Pay · {slip.pay_type || 'Salary'}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-700 uppercase tracking-wider">Gross Pay</div>
              <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5">
                <span className="text-sm text-slate-600">Gross Salary ({slip.pay_type || 'Salary'})</span>
                <span className="text-sm font-bold text-emerald-700">{formatUSD(slip.gross || 0)}</span>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-700 uppercase tracking-wider">Taxes</div>
              {[
                { l: 'Federal Income Tax (22%)', v: slip.federal_tax || 0, c: 'text-blue-700'   },
                { l: `State Tax (${slip.state || 'CA'})`,v: slip.state_tax || 0,   c: 'text-violet-700' },
                { l: 'Social Security (6.2%)',   v: slip.social_sec || 0,  c: 'text-amber-700'  },
                { l: 'Medicare (1.45%)',          v: slip.medicare || 0,   c: 'text-orange-700' },
              ].map(r => (
                <div key={r.l} className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5">
                  <span className="text-sm text-slate-600">{r.l}</span>
                  <span className={`text-sm font-semibold ${r.c}`}>−{formatUSD(r.v)}</span>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-700 uppercase tracking-wider">Benefits</div>
              {[
                { l: `401(k) (${((slip.k401_rate || 0.05) * 100).toFixed(0)}%)`, v: slip.k401 || 0,    c: 'text-emerald-700' },
                { l: 'Health Insurance',                   v: slip.health_ins || 0,c: 'text-rose-700'   },
              ].map(r => (
                <div key={r.l} className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5">
                  <span className="text-sm text-slate-600">{r.l}</span>
                  <span className={`text-sm font-semibold ${r.c}`}>−{formatUSD(r.v)}</span>
                </div>
              ))}
            </div>
            <div className="rounded-xl border-2 border-blue-200 bg-blue-50 px-4 py-3 flex items-center justify-between">
              <span className="text-sm font-bold text-blue-800">Net Pay</span>
              <span className="text-lg font-bold text-blue-700">{formatUSD(slip.net_pay || 0)}</span>
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-3 space-y-1.5">
              {[
                { l: 'Slip ID',   v: slip.slip_id || slip.id },
                { l: 'Pay Date',  v: slip.pay_date },
                { l: 'Status',    v: slip.status  },
              ].map(r => (
                <div key={r.l} className="flex justify-between text-sm">
                  <span className="text-slate-500">{r.l}</span>
                  <span className="font-semibold text-slate-700">{r.v}</span>
                </div>
              ))}
            </div>
            <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90">
              <Download className="h-4 w-4" /> Download Payslip
            </button>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
)

const UsPayslips = () => {
  const [search,   setSearch]   = useState('')
  const [monthF,   setMonthF]   = useState('All Months')
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [payslips, setPayslips] = useState([])

  useEffect(() => {
    loadPayslips()
  }, [])

  const loadPayslips = async () => {
    try {
      setLoading(true)
      const data = await payrollService.getPayslips('US')
      setPayslips(data || [])
    } catch (error) {
      console.error('Failed to load payslips:', error)
    } finally {
      setLoading(false)
    }
  }

  const PAYROLL_MONTHS = useMemo(() => 
    ['All Months', ...Array.from(new Set(payslips.map(p => p.month)))],
    [payslips]
  )

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return payslips.filter(p =>
      (p.name.toLowerCase().includes(q) || (p.dept || '').toLowerCase().includes(q)) &&
      (monthF === 'All Months' || p.month === monthF)
    )
  }, [search, monthF, payslips])

  const totalNet = useMemo(() => filtered.reduce((s, p) => s + (p.net_pay || 0), 0), [filtered])
  const isDirty  = search || monthF !== 'All Months'
  const resetAll = () => { setSearch(''); setMonthF('All Months') }

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1"><span className="text-2xl">🇺🇸</span><h1 className="text-xl font-bold text-slate-900">US Payslips</h1></div>
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  {['Employee', 'Month', 'Gross Pay', 'Federal Tax', 'State Tax', 'FICA', 'Benefits', 'Net Pay', 'Action'].map(h => (
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
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1"><span className="text-2xl">🇺🇸</span><h1 className="text-xl font-bold text-slate-900">US Payslips</h1></div>
            <p className="text-sm text-slate-500">Federal / State / FICA / Benefits breakdown per employee</p>
          </div>
          {filtered.length > 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
              <span className="text-xs text-slate-500">Filtered net:</span>
              <span className="ml-2 text-sm font-bold text-blue-700">{formatUSD(totalNet)}</span>
            </motion.div>
          )}
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative min-w-52 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employee or department…"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100" />
          </div>
          <select value={monthF} onChange={e => setMonthF(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none">
            {PAYROLL_MONTHS.map(m => <option key={m}>{m}</option>)}
          </select>
          {isDirty && (
            <button onClick={resetAll} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-500 shadow-sm hover:bg-slate-50">
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  {['Employee', 'Month', 'Gross Pay', 'Federal Tax', 'State Tax', 'FICA', 'Benefits', 'Net Pay', 'Action'].map(h => (
                    <th key={h} className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0
                  ? <tr><td colSpan={9} className="py-16 text-center"><FileText className="mx-auto mb-3 h-10 w-10 text-slate-300" /><p className="text-sm text-slate-500">No payslips found</p></td></tr>
                  : filtered.map((slip, idx) => {
                      const initials = slip.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                      const colors = ['bg-blue-500', 'bg-violet-500', 'bg-green-500', 'bg-pink-500', 'bg-orange-500', 'bg-teal-500']
                      const avatarColor = colors[idx % colors.length]
                      
                      return (
                        <motion.tr key={slip.slip_id || slip.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(idx * 0.018, 0.28) }}
                          className="group cursor-pointer border-b border-slate-100 transition hover:bg-slate-50/70" onClick={() => setSelected(slip)}>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white ${avatarColor}`}>{initials}</div>
                              <div>
                                <div className="text-sm font-semibold text-slate-800">{slip.name}</div>
                                <div className="text-xs text-slate-400">{slip.state || 'CA'} · <span className={`font-semibold ${DEPT_TEXT_COLORS[slip.dept] ?? 'text-slate-500'}`}>{slip.dept}</span></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5"><div className="text-sm font-medium text-slate-700">{slip.month}</div><div className="text-xs text-slate-400">{slip.pay_date}</div></td>
                          <td className="px-4 py-3.5 text-sm font-semibold text-slate-800 whitespace-nowrap">{formatUSD(slip.gross || 0)}</td>
                          <td className="px-4 py-3.5 text-xs text-blue-700 whitespace-nowrap">−{formatUSD(slip.federal_tax || 0)}</td>
                          <td className="px-4 py-3.5 text-xs text-violet-700 whitespace-nowrap">−{formatUSD(slip.state_tax || 0)}</td>
                          <td className="px-4 py-3.5 text-xs text-amber-700 whitespace-nowrap">−{formatUSD((slip.social_sec || 0) + (slip.medicare || 0))}</td>
                          <td className="px-4 py-3.5 text-xs text-emerald-700 whitespace-nowrap">−{formatUSD((slip.k401 || 0) + (slip.health_ins || 0))}</td>
                          <td className="px-4 py-3.5 whitespace-nowrap"><span className="text-sm font-bold text-blue-700">{formatUSD(slip.net_pay || 0)}</span></td>
                          <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                            <button onClick={() => setSelected(slip)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 opacity-0 transition hover:bg-blue-50 hover:text-blue-600 group-hover:opacity-100">
                              <Download className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </motion.tr>
                      )
                    })
                }
              </tbody>
            </table>
          </div>
          {filtered.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
              <span className="text-xs text-slate-400">Showing {filtered.length} of {payslips.length} payslips</span>
              <span className="text-xs text-slate-500">Click a row to view breakdown</span>
            </div>
          )}
        </div>
      </motion.div>
      <BreakdownPanel slip={selected} onClose={() => setSelected(null)} />
    </div>
  )
}

export default UsPayslips
