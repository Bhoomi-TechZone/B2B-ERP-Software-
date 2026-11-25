import { memo } from 'react'
import { motion } from 'motion/react'

const StatsCard = memo(({ label, value, sub, icon: Icon, color, bg, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
  >
    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${bg}`}>
      <Icon className={`h-6 w-6 ${color}`} />
    </div>
    <div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-sm font-medium text-slate-600">{label}</div>
      {sub && <div className="text-xs text-slate-400">{sub}</div>}
    </div>
  </motion.div>
))

StatsCard.displayName = 'StatsCard'
export default StatsCard
