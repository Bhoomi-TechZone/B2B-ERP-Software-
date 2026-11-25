import { memo, useState } from 'react'
import { Search, Filter, Plus, ArrowRight, Wallet, Banknote, ShieldAlert, BadgeCent } from 'lucide-react'
import PayrollModal from './PayrollModal'

const Step4Voluntary = memo(({ employees = [], onUpdate, onNext, onPrev }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState({ employeeId: '', type: 'loan', amount: '' })

  // Calculate totals
  let totalLoan = 0
  let totalAdvance = 0
  let totalInsurance = 0
  let totalOthers = 0

  employees.forEach(emp => {
    totalLoan += Number(emp.loan || 0)
    totalAdvance += Number(emp.advance || 0)
    // Assume other and insurance might be mapped from other if not separated
    totalInsurance += 0 // Defaulting as backend might not separate them yet
    totalOthers += Number(emp.other || 0)
  })

  const totalVoluntary = totalLoan + totalAdvance + totalInsurance + totalOthers

  const filteredEmployees = employees.filter(emp => 
    (emp.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (emp.employeeId?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  const handleSave = async () => {
    if (!onUpdate || !formData.employeeId) return
    const amt = Number(formData.amount)
    if (isNaN(amt)) return

    const dataToUpdate = {}
    if (formData.type === 'loan') dataToUpdate.loan = amt
    if (formData.type === 'advance') dataToUpdate.advance = amt
    if (formData.type === 'other') dataToUpdate.other = amt

    await onUpdate(formData.employeeId, dataToUpdate)
    setModalOpen(false)
    setFormData({ employeeId: '', type: 'loan', amount: '' })
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Loan Recovery', value: totalLoan, icon: Wallet, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Total Advance', value: totalAdvance, icon: Banknote, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Total Insurance', value: totalInsurance, icon: ShieldAlert, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Total Voluntary Deduction', value: totalVoluntary, icon: BadgeCent, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map((card, idx) => (
          <div key={idx} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${card.bg} ${card.color}`}>
              <card.icon className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-500 mb-1">{card.label}</p>
            <h2 className="text-xl font-bold text-slate-800">₹{card.value.toLocaleString('en-IN')}</h2>
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
            <button 
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Deduction
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4 text-right">Loan Recovery (₹)</th>
                <th className="px-6 py-4 text-right">Advance (₹)</th>
                <th className="px-6 py-4 text-right">Insurance (₹)</th>
                <th className="px-6 py-4 text-right">Others (₹)</th>
                <th className="px-6 py-4 text-right text-red-600">Total Deduction (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredEmployees.map((emp) => {
                const loan = Number(emp.loan || 0)
                const advance = Number(emp.advance || 0)
                const insurance = 0
                const others = Number(emp.other || 0)
                const totalDed = loan + advance + insurance + others

                return (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800">{emp.name || 'Unknown'}</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-600">{loan.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-600">{advance.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-600">{insurance.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-600">{others.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">{totalDed.toLocaleString('en-IN')}</td>
                  </tr>
                )
              })}
              {/* Total Row */}
              <tr className="bg-slate-50 border-t-2 border-slate-200">
                <td className="px-6 py-4 font-bold text-slate-800">Total</td>
                <td className="px-6 py-4 text-right font-bold text-slate-800">{totalLoan.toLocaleString('en-IN')}</td>
                <td className="px-6 py-4 text-right font-bold text-slate-800">{totalAdvance.toLocaleString('en-IN')}</td>
                <td className="px-6 py-4 text-right font-bold text-slate-800">{totalInsurance.toLocaleString('en-IN')}</td>
                <td className="px-6 py-4 text-right font-bold text-slate-800">{totalOthers.toLocaleString('en-IN')}</td>
                <td className="px-6 py-4 text-right font-bold text-slate-900">
                  {totalVoluntary.toLocaleString('en-IN')}
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
            Continue to Preview <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      <PayrollModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)}
        title="Add Voluntary Deduction"
      >
        <div className="p-6">
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Select Employee</label>
              <select 
                value={formData.employeeId}
                onChange={e => setFormData({...formData, employeeId: e.target.value})}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
              >
                <option value="">-- Select Employee --</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.employeeId})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Deduction Type</label>
              <select 
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
              >
                <option value="loan">Loan Recovery</option>
                <option value="advance">Advance</option>
                <option value="other">Other / Insurance</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Amount (₹)</label>
              <input 
                type="number" 
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
          
          <div className="mt-8 flex justify-end gap-3">
            <button 
              onClick={() => setModalOpen(false)}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
              disabled={!formData.employeeId || !formData.amount}
            >
              Add Deduction
            </button>
          </div>
        </div>
      </PayrollModal>
    </div>
  )
})

Step4Voluntary.displayName = 'Step4Voluntary'
export default Step4Voluntary
