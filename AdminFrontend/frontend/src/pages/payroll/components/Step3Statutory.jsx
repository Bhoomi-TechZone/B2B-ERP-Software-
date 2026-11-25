import { memo, useState } from 'react'
import { Search, Filter, Info, ArrowRight } from 'lucide-react'
import PayrollModal from './PayrollModal'

const Step3Statutory = memo(({ employees = [], onNext, onPrev }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [modalOpen, setModalOpen] = useState(false)

  // Calculate totals
  let totalPF = 0
  let totalESI = 0
  let totalPT = 0
  let totalTDS = 0

  employees.forEach(emp => {
    totalPF += Number(emp.pf || 0)
    totalESI += Number(emp.esi || 0)
    totalPT += Number(emp.pt || 0)
    totalTDS += Number(emp.tds || 0)
  })

  const filteredEmployees = employees.filter(emp => 
    (emp.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (emp.employeeId?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6">
      
      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total PF', value: totalPF },
          { label: 'Total ESI', value: totalESI },
          { label: 'Total PT', value: totalPT },
          { label: 'Total TDS', value: totalTDS },
        ].map((card, idx) => (
          <div key={idx} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 mb-1">{card.label}</p>
            <h2 className="text-2xl font-bold text-slate-800">₹{card.value.toLocaleString('en-IN')}</h2>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        
        {/* Info Banner */}
        <div className="bg-blue-50/50 p-4 border-b border-blue-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-blue-800">
            <Info className="w-4 h-4 text-blue-500" />
            Statutory rules are applied as per employee salary and government guidelines.
          </div>
          <button 
            onClick={() => setModalOpen(true)}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Configure Rules
          </button>
        </div>

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
          <button className="flex items-center gap-2 text-slate-600 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4 text-right">Gross Earnings</th>
                <th className="px-6 py-4 text-right">PF (₹)</th>
                <th className="px-6 py-4 text-right">ESI (₹)</th>
                <th className="px-6 py-4 text-right">PT (₹)</th>
                <th className="px-6 py-4 text-right">TDS (₹)</th>
                <th className="px-6 py-4 text-right text-red-600">Total Deduction (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredEmployees.map((emp) => {
                const gross = Number(emp.gross || 0)
                const pf = Number(emp.pf || 0)
                const esi = Number(emp.esi || 0)
                const pt = Number(emp.pt || 0)
                const tds = Number(emp.tds || 0)
                const totalDed = pf + esi + pt + tds

                return (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800">{emp.name || 'Unknown'}</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-600">{gross.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-600">{pf.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-600">{esi.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-600">{pt.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-600">{tds.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">{totalDed.toLocaleString('en-IN')}</td>
                  </tr>
                )
              })}
              {/* Total Row */}
              <tr className="bg-slate-50 border-t-2 border-slate-200">
                <td className="px-6 py-4 font-bold text-slate-800">Total</td>
                <td className="px-6 py-4 text-right font-bold text-slate-800">
                  {employees.reduce((acc, emp) => acc + Number(emp.gross || 0), 0).toLocaleString('en-IN')}
                </td>
                <td className="px-6 py-4 text-right font-bold text-slate-800">{totalPF.toLocaleString('en-IN')}</td>
                <td className="px-6 py-4 text-right font-bold text-slate-800">{totalESI.toLocaleString('en-IN')}</td>
                <td className="px-6 py-4 text-right font-bold text-slate-800">{totalPT.toLocaleString('en-IN')}</td>
                <td className="px-6 py-4 text-right font-bold text-slate-800">{totalTDS.toLocaleString('en-IN')}</td>
                <td className="px-6 py-4 text-right font-bold text-slate-900">
                  {(totalPF + totalESI + totalPT + totalTDS).toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
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
            Continue to Voluntary Deductions <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      <PayrollModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)}
        title="Statutory Rules (India)"
      >
        <div className="p-6">
          <p className="text-sm text-slate-500 mb-6">
            These rules are applied globally to calculate statutory deductions for all eligible employees based on government compliance.
          </p>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-sm font-semibold text-slate-700">Provident Fund (PF)</span>
              <span className="text-sm font-bold text-slate-900">12% of Basic</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-sm font-semibold text-slate-700">Employee State Insurance (ESI)</span>
              <span className="text-sm font-bold text-slate-900">0.75% of Gross</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-sm font-semibold text-slate-700">Professional Tax (PT)</span>
              <span className="text-sm font-bold text-slate-900">Slab based</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-sm font-semibold text-slate-700">TDS (Income Tax)</span>
              <span className="text-sm font-bold text-slate-900">As per tax regime</span>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button 
              onClick={() => setModalOpen(false)}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
            >
              Close
            </button>
          </div>
        </div>
      </PayrollModal>
    </div>
  )
})

Step3Statutory.displayName = 'Step3Statutory'
export default Step3Statutory
