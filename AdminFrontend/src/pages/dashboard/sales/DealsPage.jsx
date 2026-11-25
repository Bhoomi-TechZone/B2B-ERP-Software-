import { useState } from 'react'
import { motion } from 'motion/react'
import { DollarSign, Calendar, Clock, TrendingUp, Building2, User } from 'lucide-react'

const DealsPage = () => {
  const [deals] = useState([
    {
      id: 1,
      company: 'Enterprise Inc',
      contact: 'David Chen',
      value: 200000,
      stage: 'proposal',
      probability: 75,
      closeDate: '2026-05-15',
      daysToClose: 25,
      owner: 'You',
    },
    {
      id: 2,
      company: 'Innovation Labs',
      contact: 'Lisa Anderson',
      value: 95000,
      stage: 'negotiation',
      probability: 85,
      closeDate: '2026-05-10',
      daysToClose: 20,
      owner: 'You',
    },
    {
      id: 3,
      company: 'Future Systems',
      contact: 'Tom Harris',
      value: 150000,
      stage: 'contract',
      probability: 95,
      closeDate: '2026-05-05',
      daysToClose: 15,
      owner: 'You',
    },
  ])

  const stageColor = (stage) => {
    const colors = {
      proposal: 'bg-blue-100 text-blue-700',
      negotiation: 'bg-yellow-100 text-yellow-700',
      contract: 'bg-purple-100 text-purple-700',
      won: 'bg-green-100 text-green-700',
    }
    return colors[stage] || 'bg-gray-100 text-gray-700'
  }

  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0)
  const weightedValue = deals.reduce((sum, deal) => sum + (deal.value * deal.probability) / 100, 0)

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-[#F7F8FA] p-6">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">My Deals</h1>
        <p className="text-sm text-gray-500">Manage your active deals pipeline</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-gray-200 bg-white p-4"
        >
          <div className="mb-2 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
            <span className="text-xs font-medium text-gray-600">Total Pipeline</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">${(totalValue / 1000).toFixed(0)}K</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-lg border border-gray-200 bg-white p-4"
        >
          <div className="mb-2 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span className="text-xs font-medium text-gray-600">Weighted Value</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">${(weightedValue / 1000).toFixed(0)}K</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-lg border border-gray-200 bg-white p-4"
        >
          <div className="mb-2 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-purple-600" />
            <span className="text-xs font-medium text-gray-600">Active Deals</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{deals.length}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-lg border border-gray-200 bg-white p-4"
        >
          <div className="mb-2 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-orange-600" />
            <span className="text-xs font-medium text-gray-600">Avg Deal Size</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            ${(totalValue / deals.length / 1000).toFixed(0)}K
          </div>
        </motion.div>
      </div>

      {/* Deals List */}
      <div className="flex-1 space-y-4">
        {deals.map((deal, index) => (
          <motion.div
            key={deal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-3 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-gray-400" />
                  <h3 className="text-lg font-bold text-gray-900">{deal.company}</h3>
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                  <User className="h-4 w-4" />
                  {deal.contact}
                </div>
              </div>
              <span className={`rounded-lg px-3 py-1 text-xs font-semibold ${stageColor(deal.stage)}`}>
                {deal.stage}
              </span>
            </div>

            <div className="mb-3 grid grid-cols-4 gap-4">
              <div>
                <div className="mb-1 text-xs font-medium text-gray-500">Deal Value</div>
                <div className="flex items-center gap-1.5 text-lg font-bold text-green-600">
                  <DollarSign className="h-4 w-4" />
                  {deal.value.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="mb-1 text-xs font-medium text-gray-500">Win Probability</div>
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-blue-500 to-green-500"
                      style={{ width: `${deal.probability}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-900">{deal.probability}%</span>
                </div>
              </div>
              <div>
                <div className="mb-1 text-xs font-medium text-gray-500">Expected Close</div>
                <div className="flex items-center gap-1.5 text-sm text-gray-700">
                  <Calendar className="h-4 w-4" />
                  {new Date(deal.closeDate).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="mb-1 text-xs font-medium text-gray-500">Days to Close</div>
                <div className="flex items-center gap-1.5 text-sm">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className="font-semibold text-gray-900">{deal.daysToClose} days</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
                Update Stage
              </button>
              <button className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
                View Details
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default DealsPage
