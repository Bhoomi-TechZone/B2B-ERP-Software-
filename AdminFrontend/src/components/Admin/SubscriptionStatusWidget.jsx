import { Package, TrendingUp, AlertCircle, Calendar } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const SubscriptionStatusWidget = () => {
  const navigate = useNavigate()

  const stats = [
    {
      label: 'Active',
      value: 142,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      icon: Package,
    },
    {
      label: 'Trials',
      value: 14,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      icon: Calendar,
    },
    {
      label: 'Expiring',
      value: 8,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      icon: AlertCircle,
    },
    {
      label: 'Overages',
      value: 5,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      icon: TrendingUp,
    },
  ]

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Subscription Status</h3>
        <button
          onClick={() => navigate('/admin/subscription')}
          className="text-sm font-medium text-blue-600 transition hover:text-blue-700"
        >
          View All →
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <div key={idx} className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-gray-600">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 space-y-2">
        <button
          onClick={() => navigate('/admin/subscription')}
          className="w-full rounded-lg border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700 transition hover:bg-orange-100"
        >
          <AlertCircle className="mr-2 inline h-4 w-4" />
          8 Trials Expiring This Week
        </button>
        <button
          onClick={() => navigate('/admin/subscription')}
          className="w-full rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
        >
          <TrendingUp className="mr-2 inline h-4 w-4" />
          5 Tenants Over Limit
        </button>
      </div>
    </div>
  )
}

export default SubscriptionStatusWidget
