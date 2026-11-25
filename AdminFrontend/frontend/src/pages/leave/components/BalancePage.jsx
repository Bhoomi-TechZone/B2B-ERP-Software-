import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { ChevronDown, RefreshCw, Umbrella, HeartPulse, PlaneTakeoff, Coffee } from 'lucide-react'
import { getLeaveBalances } from '../data/leaveData'

const LEAVE_ICONS = {
  'Casual Leave': Umbrella,
  'Sick Leave': HeartPulse,
  'Earned Leave': PlaneTakeoff,
  'Comp Off': Coffee,
}

const LEAVE_COLORS = {
  'Casual Leave': { bg: 'bg-blue-50', text: 'text-blue-700', bar: 'bg-blue-500', border: 'border-blue-200' },
  'Sick Leave': { bg: 'bg-green-50', text: 'text-green-700', bar: 'bg-green-500', border: 'border-green-200' },
  'Earned Leave': { bg: 'bg-purple-50', text: 'text-purple-700', bar: 'bg-purple-500', border: 'border-purple-200' },
  'Comp Off': { bg: 'bg-amber-50', text: 'text-amber-700', bar: 'bg-amber-500', border: 'border-amber-200' },
}

export default function BalancePage() {
  const [yearFilter, setYearFilter] = useState('2024-2025')
  const [balances, setBalances] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadBalances = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getLeaveBalances()
      setBalances(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load leave balances:', err)
      setError('Failed to load leave balances. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBalances()
  }, [])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50 p-12">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm font-semibold text-slate-500">Loading leave balances...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full bg-slate-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center shadow-sm">
            <p className="text-sm font-medium text-red-700">{error}</p>
            <button
              onClick={loadBalances}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-650 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Leave Balance</h1>
            <p className="text-sm text-slate-500">Manage your leave balance and usage</p>
          </div>
          <div className="relative">
            <select
              value={yearFilter}
              onChange={e => setYearFilter(e.target.value)}
              className="appearance-none rounded-lg border border-slate-300 bg-white px-4 py-2 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="2024-2025">Current Year (Apr 2024 - Mar 2025)</option>
              <option value="2023-2024">Previous Year (Apr 2023 - Mar 2024)</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
          </div>
        </div>

        {/* Balance Cards */}
        {balances.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <p className="text-slate-400 text-sm">No leave balances assigned yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {balances.map((balance, i) => {
              // Backend /my-balance returns: type, total, used, remaining, policy_name
              const cleanType = balance.type || balance.policy_name || balance.leave_type || ''
              let lookupType = cleanType
              if (!lookupType.toLowerCase().endsWith('leave') && lookupType.toLowerCase() !== 'comp off') {
                lookupType = lookupType + ' Leave'
              }

              const Icon = LEAVE_ICONS[lookupType] || Umbrella
              const colors = LEAVE_COLORS[lookupType] || LEAVE_COLORS['Casual Leave']
              const total = balance.total ?? balance.total_days ?? 0
              const used = balance.used ?? balance.used_days ?? 0
              const available = balance.remaining ?? balance.remaining_days ?? (total - used)
              const usagePercent = total > 0 ? (used / total) * 100 : 0

              return (
                <motion.div
                  key={balance.id || cleanType}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`rounded-xl border ${colors.border} ${colors.bg} p-6`}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-white`}>
                      <Icon className={`h-6 w-6 ${colors.text}`} />
                    </div>
                  </div>

                  <h3 className={`mb-1 text-sm font-semibold ${colors.text}`}>{lookupType}</h3>
                  <div className="mb-4 flex items-baseline gap-1">
                    <span className={`text-3xl font-bold ${colors.text}`}>{used}</span>
                    <span className="text-sm text-slate-500">/ {total} Days</span>
                  </div>

                  <div className="mb-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">Used</span>
                      <span className={`font-semibold ${colors.text}`}>{used} Days</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">Available</span>
                      <span className={`font-semibold ${colors.text}`}>{available} Days</span>
                    </div>
                  </div>

                  <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-white">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${usagePercent}%` }}
                      transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                      className={`h-full ${colors.bar}`}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{Math.round(usagePercent)}% Used</span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Info Note */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
            <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900">
              Note: Leave balance is as per your current leave policy updates. It may change based on Leave policy updates.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

