import { memo } from 'react'
import { motion } from 'motion/react'
import { MapPin, CheckCircle2, AlertTriangle } from 'lucide-react'

const GeoLogCard = memo(({ log, delay = 0 }) => {
  const inside = log.status === 'inside'
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`rounded-xl border p-4 ${
        inside ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
      }`}
    >
      {/* Top row */}
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-bold text-slate-800">{log.employee}</span>
        {inside
          ? <CheckCircle2 className="h-4 w-4 text-green-500" />
          : <AlertTriangle className="h-4 w-4 text-red-400" />
        }
      </div>

      {/* Location */}
      <div className="mb-2 flex items-center gap-1.5 text-xs text-slate-600">
        <MapPin className="h-3 w-3 shrink-0" />
        <span className="truncate">{log.location}</span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">{log.action} · {log.time}</span>
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
          inside ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
        }`}>
          {inside ? 'In Geo-Fence' : 'Outside'}
        </span>
      </div>
    </motion.div>
  )
})

GeoLogCard.displayName = 'GeoLogCard'
export default GeoLogCard
