import { motion } from 'motion/react'
import { Check } from 'lucide-react'

function OnboardingChecklist() {
  const checklistItems = [
    { task: 'Add first employee', completed: true, link: '/employees/add' },
    { task: 'Configure payroll settings', completed: true, link: '/settings/payroll' },
    { task: 'Set up leave policies', completed: false, link: '/settings/leave' },
    { task: 'Define compliance rules', completed: false, link: '/compliance/setup' },
    { task: 'Invite team members', completed: true, link: '/settings/team' },
    { task: 'Run first payroll', completed: false, link: '/payroll/run' },
  ]

  const completedCount = checklistItems.filter(item => item.completed).length
  const progress = Math.round((completedCount / checklistItems.length) * 100)

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Setup Checklist</h3>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
          {completedCount}/{checklistItems.length} Complete
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, delay: 0.3 }}
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
        />
      </div>

      {/* Checklist Items */}
      <div className="space-y-2">
        {checklistItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center gap-3 rounded-lg border-2 p-3 transition ${
              item.completed
                ? 'border-green-200 bg-green-50'
                : 'border-slate-200 bg-slate-50 hover:border-blue-300'
            }`}
          >
            <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
              item.completed ? 'bg-green-500' : 'border-2 border-slate-300 bg-white'
            }`}>
              {item.completed && (
                <Check className="h-4 w-4 text-white" strokeWidth={3} />
              )}
            </div>
            <span className={`flex-1 text-sm font-semibold ${
              item.completed ? 'text-green-900 line-through' : 'text-slate-900'
            }`}>
              {item.task}
            </span>
            {!item.completed && (
              <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                Start →
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default OnboardingChecklist
