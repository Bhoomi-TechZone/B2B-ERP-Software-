import { memo } from 'react'
import { motion } from 'motion/react'

const PayStatCard = memo(({ label, value, sub, icon: Icon, gradient, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
  >
    {/* Decorative radial accent */}
    <div className={`pointer-events-none absolute -right-5 -top-5 h-24 w-24 rounded-full opacity-[0.08] ${gradient}`} />

    <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${gradient} text-white shadow-sm`}>
      <Icon className="h-5 w-5" />
    </div>

    <div className="mt-4">
      <div className="truncate text-2xl font-bold tracking-tight text-slate-900">{value}</div>
      <div className="mt-0.5 text-sm font-medium text-slate-600">{label}</div>
      {sub && <div className="mt-0.5 text-xs text-slate-400">{sub}</div>}
    </div>
  </motion.div>
))

PayStatCard.displayName = 'PayStatCard'
export default PayStatCard
