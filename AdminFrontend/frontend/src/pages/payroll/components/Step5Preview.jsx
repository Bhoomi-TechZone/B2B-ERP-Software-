import { memo, useState } from 'react'
import { Search, Filter, ArrowRight, Download, Eye } from 'lucide-react'

const Step5Preview = memo(({ employees = [], onNext, onPrev }) => {
  const [searchTerm, setSearchTerm] = useState('')

  // Calculate totals
  let totalGross = 0
  let totalDeductions = 0
  let totalNet = 0

  employees.forEach(emp => {
    totalGross += Number(emp.gross || 0)
    totalDeductions += Number(emp.deductions || 0)
    totalNet += Number(emp.netPay || 0)
  })

  const avgNet = employees.length > 0 ? (totalNet / employees.length) : 0

  const filteredEmployees = employees.filter(emp => 
    (emp.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (emp.employeeId?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6">
      
      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Gross Earnings', value: totalGross },
          { label: 'Total Deductions', value: totalDeductions },
          { label: 'Total Net Pay', value: totalNet },
          { label: 'Avg. Net Pay', value: avgNet },
        ].map((card, idx) => (
          <div key={idx} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 mb-1">{card.label}</p>
            <h2 className="text-2xl font-bold text-slate-800">₹{card.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</h2>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        
        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search employee..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 text-slate-600 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">
              <Filter className="w-4 h-4" /> Filter
            </button>
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
              <Eye className="w-4 h-4" /> Preview Payslip
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4 text-right">Gross Earnings (₹)</th>
                <th className="px-6 py-4 text-right">Total Deductions (₹)</th>
                <th className="px-6 py-4 text-right">Net Pay (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredEmployees.map((emp) => {
                const gross = Number(emp.gross || 0)
                const deductions = Number(emp.deductions || 0)
                const net = Number(emp.netPay || 0)

                return (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800">{emp.name || 'Unknown'}</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-600">{gross.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-600">{deductions.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">{net.toLocaleString('en-IN')}</td>
                  </tr>
                )
              })}
              {/* Total Row */}
              <tr className="bg-slate-50 border-t-2 border-slate-200">
                <td className="px-6 py-4 font-bold text-slate-800">Total</td>
                <td className="px-6 py-4 text-right font-bold text-slate-800">{totalGross.toLocaleString('en-IN')}</td>
                <td className="px-6 py-4 text-right font-bold text-slate-800">{totalDeductions.toLocaleString('en-IN')}</td>
                <td className="px-6 py-4 text-right font-bold text-slate-900">{totalNet.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between gap-3 bg-slate-50/50">
          <button 
            className="px-6 py-2.5 bg-white border border-slate-200 text-blue-600 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Download Draft (Excel)
          </button>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={onPrev}
              className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              ← Back
            </button>
            <button 
              onClick={onNext}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-md shadow-blue-200 flex items-center gap-2 transition-colors"
            >
              Proceed to Approval <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  )
})

Step5Preview.displayName = 'Step5Preview'
export default Step5Preview
