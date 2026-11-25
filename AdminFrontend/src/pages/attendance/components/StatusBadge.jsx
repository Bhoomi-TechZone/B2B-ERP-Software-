import { memo } from 'react'
import { getStatusColor } from '../data/attendanceData'

const dotColor = (status) => {
  switch (status) {
    case 'Present':
    case 'Approved':  return 'bg-green-500'
    case 'Absent':
    case 'Rejected':  return 'bg-red-500'
    case 'Late':
    case 'Pending':   return 'bg-amber-500'
    case 'Leave':     return 'bg-blue-500'
    default:          return 'bg-slate-400'
  }
}

const StatusBadge = memo(({ status }) => (
  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(status)}`}>
    <span className={`h-1.5 w-1.5 rounded-full ${dotColor(status)}`} />
    {status}
  </span>
))

StatusBadge.displayName = 'StatusBadge'
export default StatusBadge
