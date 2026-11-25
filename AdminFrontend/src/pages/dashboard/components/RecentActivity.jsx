import { motion } from 'motion/react'
import { Calendar, Clock, CheckCircle2, User, FileText } from 'lucide-react'

function RecentActivity() {
  const activities = [
    {
      user: 'John Doe',
      action: 'submitted leave request',
      time: '5 minutes ago',
      avatar: 'JD',
      color: 'from-blue-500 to-blue-600',
      icon: Calendar,
      iconColor: 'text-blue-500',
    },
    {
      user: 'Sarah Smith',
      action: 'clocked in for the day',
      time: '15 minutes ago',
      avatar: 'SS',
      color: 'from-emerald-500 to-emerald-600',
      icon: Clock,
      iconColor: 'text-emerald-500',
    },
    {
      user: 'Mike Johnson',
      action: 'completed onboarding',
      time: '1 hour ago',
      avatar: 'MJ',
      color: 'from-purple-500 to-purple-600',
      icon: CheckCircle2,
      iconColor: 'text-purple-500',
    },
    {
      user: 'Emily Davis',
      action: 'updated profile information',
      time: '2 hours ago',
      avatar: 'ED',
      color: 'from-amber-500 to-amber-600',
      icon: User,
      iconColor: 'text-amber-500',
    },
    {
      user: 'Robert Wilson',
      action: 'requested document approval',
      time: '3 hours ago',
      avatar: 'RW',
      color: 'from-rose-500 to-rose-600',
      icon: FileText,
      iconColor: 'text-rose-500',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
        <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">
          View all
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
            className="flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-slate-50"
          >
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br ${activity.color} text-sm font-semibold text-white shadow-sm`}>
              {activity.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900">
                <span className="font-semibold">{activity.user}</span>{' '}
                <span className="text-slate-600">{activity.action}</span>
              </p>
              <p className="text-xs text-slate-500">{activity.time}</p>
            </div>
            <activity.icon className={`h-5 w-5 shrink-0 ${activity.iconColor}`} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export default RecentActivity
