import { memo, useState } from 'react'
import { Check } from 'lucide-react'

const Step8Finalise = memo(({ onMarkAsPaid, onComplete }) => {
  const [isFinalizing, setIsFinalizing] = useState(false)
  const [isFinalized, setIsFinalized] = useState(false)

  const handleFinalize = async () => {
    setIsFinalizing(true)
    await onMarkAsPaid?.()
    setIsFinalizing(false)
    setIsFinalized(true)
  }

  return (
    <div className="flex justify-center mt-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm p-10 flex flex-col items-center text-center">
        
        {isFinalized ? (
          <>
            <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6 ring-8 ring-green-50">
              <Check className="w-10 h-10" />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Payroll Finalized Successfully!</h2>
            <p className="text-sm text-slate-500 mb-8">April 2026 payroll has been finalized.</p>

            <div className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 mb-8">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold text-slate-500">Finalized On</span>
                <span className="text-sm font-bold text-slate-800">25 Apr 2026, 04:30 PM</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-500">Finalized By</span>
                <span className="text-sm font-bold text-slate-800">Arzu Mehreen</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 mb-6">
              You can still view reports and payslips.<br/>
              Editing is disabled.
            </p>

            <button 
              onClick={onComplete}
              className="w-full bg-blue-600 text-white font-bold text-sm py-3.5 rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-200"
            >
              Go to Payslips
            </button>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-6 ring-8 ring-slate-50">
              <Check className="w-10 h-10" />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Ready to Finalize</h2>
            <p className="text-sm text-slate-500 mb-8">You are about to mark the payroll as paid and notify employees.</p>

            <button 
              onClick={handleFinalize}
              disabled={isFinalizing}
              className="w-full bg-green-600 text-white font-bold text-sm py-3.5 rounded-xl hover:bg-green-700 transition-colors shadow-md shadow-green-200 disabled:opacity-50"
            >
              {isFinalizing ? 'Finalizing...' : 'Finalize Payroll'}
            </button>
          </>
        )}
        
      </div>
    </div>
  )
})

Step8Finalise.displayName = 'Step8Finalise'
export default Step8Finalise
