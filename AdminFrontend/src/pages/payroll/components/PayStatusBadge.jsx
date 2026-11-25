import { memo } from 'react'
import { getPayStatusColor } from '../data/payrollData'

const dotColor = (s) => {
  switch (s) {
    case 'Processed': return 'bg-emerald-500'
    case 'Pending':   return 'bg-amber-500'
    case 'On Hold':   return 'bg-slate-400'
    case 'Failed':    return 'bg-red-500'
    default:          return 'bg-slate-400'
  }
}

const PayStatusBadge = memo(({ status }) => (
  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${getPayStatusColor(status)}`}>
    <span className={`h-1.5 w-1.5 rounded-full ${dotColor(status)}`} />
    {status}
  </span>
))

PayStatusBadge.displayName = 'PayStatusBadge'
export default PayStatusBadge
