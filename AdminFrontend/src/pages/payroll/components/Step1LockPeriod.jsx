import { memo } from 'react'
import { Lock, Users, CalendarCheck, Clock, CalendarDays, ArrowRight } from 'lucide-react'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const Step1LockPeriod = memo(({ period, onLock, onPeriodChange, onNext }) => {
  const isLocked = period?.isLocked
  
  // Dummy values based on design (could be passed from props in real scenario)
  const totalEmployees = 24
  const startDay = '01'
  const endDay = new Date(period.year, period.month + 1, 0).getDate()
  
  const monthName = MONTHS[period.month] || 'Month'
  const year = period.year || new Date().getFullYear()

  return (
    <div className="flex justify-center mt-6">
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-800">Lock Payroll Cycle</h2>
          <p className="text-sm text-slate-500 mt-1">Select payroll month and lock the cycle to start payroll process.</p>
        </div>

        {/* Date Selectors */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2">Payroll Month</label>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700">
              <CalendarDays className="w-4 h-4 text-slate-400" />
              {monthName} {year}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2">Start Date</label>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700">
              {startDay} {monthName.substring(0, 3)} {year}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2">End Date</label>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700">
              {endDay} {monthName.substring(0, 3)} {year}
            </div>
          </div>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          
          <div className="flex items-center gap-4 p-5 bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-500">Total Employees</p>
              <h3 className="text-xl font-bold text-slate-800">{totalEmployees}</h3>
            </div>
            <div className="w-8 h-8 rounded-full bg-green-50 text-green-500 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-500">Attendance Synced</p>
              <h3 className="text-xl font-bold text-slate-800">{totalEmployees} / {totalEmployees}</h3>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-500">Leave Synced</p>
              <h3 className="text-xl font-bold text-slate-800">{totalEmployees} / {totalEmployees}</h3>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-500">Overtime Synced</p>
              <h3 className="text-xl font-bold text-slate-800">{totalEmployees} / {totalEmployees}</h3>
            </div>
          </div>

        </div>

        {/* Notes */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-8">
          <h4 className="text-sm font-bold text-slate-800 mb-1">Notes</h4>
          <p className="text-xs text-slate-500 leading-relaxed">Once you lock the payroll cycle, attendance, leave and overtime data will be frozen.</p>
        </div>

        {/* Action Button */}
        {isLocked ? (
          <button 
            onClick={onNext}
            className="w-full bg-blue-600 text-white font-bold text-sm py-4 rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 flex items-center justify-center gap-2"
          >
            Continue to Earnings <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button 
            onClick={onLock}
            className="w-full bg-blue-600 text-white font-bold text-sm py-4 rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 flex items-center justify-center gap-2"
          >
            Lock Payroll Cycle
          </button>
        )}
      </div>
    </div>
  )
})

Step1LockPeriod.displayName = 'Step1LockPeriod'
export default Step1LockPeriod
