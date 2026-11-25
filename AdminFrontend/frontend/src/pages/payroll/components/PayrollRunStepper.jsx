import { memo } from 'react'
import { Check, Lock, DollarSign, FileText, FileDown, Eye, CheckCircle, Save, Send } from 'lucide-react'

const steps = [
  { id: 1, label: 'Lock Cycle', icon: Lock },
  { id: 2, label: 'Earnings', icon: DollarSign },
  { id: 3, label: 'Statutory Deductions', icon: FileText },
  { id: 4, label: 'Voluntary Deductions', icon: FileDown },
  { id: 5, label: 'Preview', icon: Eye },
  { id: 6, label: 'Approval', icon: CheckCircle },
  { id: 7, label: 'Generate Payslips', icon: Save },
  { id: 8, label: 'Finalise', icon: Send }
]

const PayrollRunStepper = memo(({ currentStep, onStepClick }) => {
  return (
    <div className="bg-white px-8 py-6 shadow-sm mb-6 rounded-2xl border border-slate-200 mx-6 mt-6">
      <div className="flex justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 w-full h-1 bg-slate-100 -z-10 rounded">
          <div 
            className="h-full bg-blue-600 transition-all duration-300 rounded"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {steps.map((step) => {
          const isCompleted = step.id < currentStep
          const isCurrent = step.id === currentStep
          const isUpcoming = step.id > currentStep
          
          const Icon = step.icon

          return (
            <div 
              key={step.id} 
              className="flex flex-col items-center gap-2 cursor-pointer group w-24 text-center"
              onClick={() => {
                if (step.id <= currentStep) onStepClick(step.id)
              }}
            >
              {/* Circle */}
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-all border-4 ${
                  isCompleted
                    ? 'bg-green-500 border-white shadow-sm'
                    : isCurrent
                    ? 'bg-blue-600 border-white shadow-md ring-4 ring-blue-100'
                    : 'bg-white border-slate-200 text-slate-400 group-hover:border-blue-200'
                }`}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5 text-white" />
                ) : isCurrent ? (
                  <span className="text-sm font-bold text-white">{step.id}</span>
                ) : (
                  <Icon className="h-4 w-4" strokeWidth={2.5} />
                )}
              </div>

              {/* Text */}
              <div className="flex flex-col items-center">
                <span
                  className={`text-xs font-bold leading-tight ${
                    isCompleted ? 'text-slate-700' : isCurrent ? 'text-slate-900' : 'text-slate-500'
                  }`}
                >
                  {step.label}
                </span>
                <span
                  className={`text-[10px] font-semibold mt-0.5 ${
                    isCompleted ? 'text-green-600' : isCurrent ? 'text-blue-600' : 'text-transparent'
                  }`}
                >
                  {isCompleted ? 'Completed' : isCurrent ? 'In Progress' : '-'}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})

PayrollRunStepper.displayName = 'PayrollRunStepper'
export default PayrollRunStepper
