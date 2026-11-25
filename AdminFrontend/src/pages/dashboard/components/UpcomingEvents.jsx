import { motion } from 'motion/react'
import { Calendar } from 'lucide-react'

function UpcomingEvents() {
  const events = [
    {
      title: 'Probation ending — 3 employees',
      date: 'Apr 25, 2026',
      daysLeft: 5,
      type: 'probation',
      color: 'text-purple-700',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      title: 'Document expiry — Work permits',
      date: 'Apr 30, 2026',
      daysLeft: 10,
      type: 'document',
      color: 'text-orange-700',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      title: 'Payroll processing date',
      date: 'Apr 23, 2026',
      daysLeft: 3,
      type: 'payroll',
      color: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'Annual review due — 8 employees',
      date: 'May 5, 2026',
      daysLeft: 15,
      type: 'review',
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    }
  ]

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Upcoming Events</h3>
        <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">
          View Calendar →
        </button>
      </div>

      <div className="space-y-3">
        {events.map((event, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`rounded-lg border-2 ${event.borderColor} ${event.bgColor} p-3`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className={`text-sm font-bold ${event.color}`}>{event.title}</h4>
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-600">
                  <Calendar className="h-4 w-4" />
                  <span>{event.date}</span>
                </div>
              </div>
              <div className={`rounded-full px-2.5 py-1 text-xs font-bold ${event.color} ${event.bgColor} ring-2 ring-current ring-opacity-20`}>
                {event.daysLeft} days
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Action */}
      <button className="mt-4 w-full rounded-lg border-2 border-slate-200 bg-slate-50 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700">
        + Add Event
      </button>
    </div>
  )
}

export default UpcomingEvents
