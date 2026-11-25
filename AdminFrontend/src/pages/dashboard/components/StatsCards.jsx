import { motion } from 'motion/react'
import { Users, CheckCircle2, CalendarClock, Banknote } from 'lucide-react'

function StatsCards() {
  const stats = [
    {
      label: 'Total Employees',
      value: '248',
      change: '12 new this month',
      trend: 'up',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
    },
    {
      label: 'Present Today',
      value: '211',
      change: '85% attendance',
      trend: 'up',
      icon: CheckCircle2,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
    },
    {
      label: 'Pending Leaves',
      value: '14',
      change: 'Needs approval',
      trend: 'neutral',
      icon: CalendarClock,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
    },
    {
      label: 'Next Payroll',
      value: '3 days',
      change: '₹24.6L due',
      trend: 'neutral',
      icon: Banknote,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
    },
  ]

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -4, scale: 1.02 }}
          className="overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5 transition-shadow hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">{stat.label}</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{stat.value}</p>
              <div className="mt-2 flex items-center gap-1">
                <span
                  className={`text-sm font-semibold ${
                    stat.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {stat.change}
                </span>
                <span className="text-xs text-slate-500">vs last month</span>
              </div>
            </div>
            <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-linear-to-br ${stat.color} shadow-lg`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '75%' }}
              transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
              className={`h-full rounded-full bg-linear-to-r ${stat.color}`}
            />
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default StatsCards
