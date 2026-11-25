import { useState } from 'react'
import { motion } from 'motion/react'
import { Download, TrendingUp, Users, DollarSign, Award } from 'lucide-react'

const ReportsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month')

  const reportData = {
    totalLeads: 2457,
    convertedLeads: 847,
    totalRevenue: 1250000,
    activeUsers: 245,
    conversionRate: 34.5,
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-[#F7F8FA] p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-sm text-gray-500">System-wide performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-gray-200 bg-white p-4"
        >
          <div className="mb-2 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span className="text-xs font-medium text-gray-600">Total Leads</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{reportData.totalLeads}</div>
          <div className="mt-1 text-xs text-green-600">+12% vs last period</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-lg border border-gray-200 bg-white p-4"
        >
          <div className="mb-2 flex items-center gap-2">
            <Award className="h-5 w-5 text-green-600" />
            <span className="text-xs font-medium text-gray-600">Converted</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{reportData.convertedLeads}</div>
          <div className="mt-1 text-xs text-green-600">+8% vs last period</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-lg border border-gray-200 bg-white p-4"
        >
          <div className="mb-2 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-purple-600" />
            <span className="text-xs font-medium text-gray-600">Revenue</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            ${(reportData.totalRevenue / 1000000).toFixed(2)}M
          </div>
          <div className="mt-1 text-xs text-green-600">+15% vs last period</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-lg border border-gray-200 bg-white p-4"
        >
          <div className="mb-2 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            <span className="text-xs font-medium text-gray-600">Active Users</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{reportData.activeUsers}</div>
          <div className="mt-1 text-xs text-gray-500">Sales team</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-lg border border-gray-200 bg-white p-4"
        >
          <div className="mb-2 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            <span className="text-xs font-medium text-gray-600">Conversion</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{reportData.conversionRate}%</div>
          <div className="mt-1 text-xs text-green-600">+3.2% improvement</div>
        </motion.div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-bold text-gray-900">Lead Assignment Trends</h2>
          <div className="flex h-64 items-center justify-center rounded-lg bg-gray-50">
            <p className="text-sm text-gray-500">Chart placeholder - Line chart showing lead assignments over time</p>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-bold text-gray-900">Conversion by User</h2>
          <div className="flex h-64 items-center justify-center rounded-lg bg-gray-50">
            <p className="text-sm text-gray-500">Chart placeholder - Bar chart showing conversion rates by user</p>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-bold text-gray-900">Revenue Breakdown</h2>
          <div className="flex h-64 items-center justify-center rounded-lg bg-gray-50">
            <p className="text-sm text-gray-500">Chart placeholder - Pie chart showing revenue by source</p>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-bold text-gray-900">SLA Compliance</h2>
          <div className="flex h-64 items-center justify-center rounded-lg bg-gray-50">
            <p className="text-sm text-gray-500">Chart placeholder - SLA tracking metrics</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportsPage
