import { motion } from 'motion/react'
import { ChevronRight, Info, UserPlus, Banknote, CheckCircle, ClipboardList, BarChart2, Megaphone } from 'lucide-react'

function QuickActions() {
  const actions = [
    {
      label: 'Add Employee',
      description: 'Add new employee to system',
      icon: UserPlus,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100',
    },
    {
      label: 'Run Payroll',
      description: 'Process monthly payroll',
      icon: Banknote,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      hoverColor: 'hover:bg-emerald-100',
    },
    {
      label: 'Approve Leaves',
      description: '14 pending approvals',
      icon: CheckCircle,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      hoverColor: 'hover:bg-amber-100',
    },
    {
      label: 'Mark Attendance',
      description: "Mark today's attendance",
      icon: ClipboardList,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      hoverColor: 'hover:bg-purple-100',
    },
    {
      label: 'Generate Reports',
      description: 'Create custom reports',
      icon: BarChart2,
      color: 'from-rose-500 to-rose-600',
      bgColor: 'bg-rose-50',
      hoverColor: 'hover:bg-rose-100',
    },
    {
      label: 'Send Announcement',
      description: 'Notify all employees',
      icon: Megaphone,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      hoverColor: 'hover:bg-indigo-100',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5"
    >
      <h2 className="mb-4 text-lg font-bold text-slate-900">Quick Actions</h2>

      <div className="space-y-3">
        {actions.map((action, index) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
            whileHover={{ scale: 1.03, x: 4 }}
            whileTap={{ scale: 0.98 }}
            className={`flex w-full items-center gap-3 rounded-lg ${action.bgColor} p-3 text-left transition-all ${action.hoverColor}`}
          >
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-linear-to-br ${action.color} shadow-sm`}>
              <action.icon className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-slate-900">{action.label}</div>
              <div className="text-xs text-slate-600">{action.description}</div>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
          </motion.button>
        ))}
      </div>

      {/* Additional Info Card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-6 rounded-lg bg-linear-to-br from-blue-50 to-indigo-50 p-4"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white">
            <Info className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Need Help?</p>
            <p className="mt-1 text-xs text-slate-600">
              Check out our documentation or contact support for assistance.
            </p>
            <button className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700">
              Learn More →
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default QuickActions
