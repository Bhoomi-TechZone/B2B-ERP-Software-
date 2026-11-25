// Shared recruitment UI primitives

// ── Status Badge ──────────────────────────────────────────────────────────────
const STATUS_MAP = {
  // Requisition
  open:        'bg-green-100  text-green-700  border-green-200',
  closed:      'bg-slate-100  text-slate-600  border-slate-200',
  // Job posting
  published:   'bg-blue-100   text-blue-700   border-blue-200',
  unpublished: 'bg-amber-100  text-amber-700  border-amber-200',
  draft:       'bg-slate-100  text-slate-500  border-slate-200',
  // Candidate / Application
  applied:     'bg-slate-100  text-slate-600  border-slate-200',
  screening:   'bg-blue-100   text-blue-700   border-blue-200',
  shortlisted: 'bg-violet-100 text-violet-700 border-violet-200',
  interview:   'bg-amber-100  text-amber-700  border-amber-200',
  offer:       'bg-emerald-100 text-emerald-700 border-emerald-200',
  hired:       'bg-green-100  text-green-700  border-green-200',
  rejected:    'bg-red-100    text-red-600    border-red-200',
  // Interview
  scheduled:   'bg-blue-100   text-blue-700   border-blue-200',
  completed:   'bg-emerald-100 text-emerald-700 border-emerald-200',
  cancelled:   'bg-red-100    text-red-600    border-red-200',
  // Offer
  pending:     'bg-amber-100  text-amber-700  border-amber-200',
  accepted:    'bg-green-100  text-green-700  border-green-200',
  // Feedback decision
  pass:        'bg-emerald-100 text-emerald-700 border-emerald-200',
  reject:      'bg-red-100    text-red-600    border-red-200',
  hold:        'bg-amber-100  text-amber-700  border-amber-200',
}

const PRIORITY_MAP = {
  high:   'bg-red-100   text-red-700   border-red-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low:    'bg-slate-100 text-slate-600 border-slate-200',
}

export const StatusBadge = ({ status, size = 'sm' }) => {
  const base = STATUS_MAP[status] || 'bg-slate-100 text-slate-500 border-slate-200'
  const sz   = size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
  return (
    <span className={`inline-flex items-center rounded-full border font-semibold capitalize ${base} ${sz}`}>
      {status}
    </span>
  )
}

export const PriorityBadge = ({ priority }) => {
  const base = PRIORITY_MAP[priority] || 'bg-slate-100 text-slate-500 border-slate-200'
  const dot  = priority === 'high' ? 'bg-red-500' : priority === 'medium' ? 'bg-amber-400' : 'bg-slate-400'
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${base}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {priority}
    </span>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
export const SkeletonRow = ({ cols = 5 }) => (
  <tr className="animate-pulse border-b border-slate-100">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3.5">
        <div className="h-4 rounded-md bg-slate-100" style={{ width: `${60 + (i * 15) % 40}%` }} />
      </td>
    ))}
  </tr>
)

export const SkeletonCard = () => (
  <div className="animate-pulse rounded-2xl border border-slate-100 bg-white p-4">
    <div className="mb-3 flex items-center gap-2">
      <div className="h-9 w-9 rounded-xl bg-slate-100" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 w-3/4 rounded bg-slate-100" />
        <div className="h-3 w-1/2 rounded bg-slate-100" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-3 rounded bg-slate-100" />
      <div className="h-3 w-5/6 rounded bg-slate-100" />
    </div>
  </div>
)

// ── Empty State ───────────────────────────────────────────────────────────────
export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
      <Icon className="h-8 w-8 text-slate-300" />
    </div>
    <h3 className="mb-1 text-base font-semibold text-slate-700">{title}</h3>
    <p className="mb-5 max-w-xs text-sm text-slate-400">{description}</p>
    {action && (
      <button onClick={action.onClick} className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
        {action.label}
      </button>
    )}
  </div>
)

// ── Avatar ────────────────────────────────────────────────────────────────────
export const Avatar = ({ initials, color = 'bg-blue-500', size = 'md' }) => {
  const sz = size === 'sm' ? 'h-7 w-7 text-[10px]' : size === 'lg' ? 'h-12 w-12 text-base' : 'h-9 w-9 text-xs'
  return (
    <div className={`flex shrink-0 items-center justify-center rounded-xl font-bold text-white ${color} ${sz}`}>
      {initials}
    </div>
  )
}

// ── Star Rating ───────────────────────────────────────────────────────────────
export const StarRating = ({ value, max = 5 }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: max }).map((_, i) => (
      <svg key={i} className={`h-4 w-4 ${i < value ? 'text-amber-400' : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
)

// ── Modal Wrapper ─────────────────────────────────────────────────────────────
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X } from 'lucide-react'

export const Modal = ({ open, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const widths = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-2xl', xl: 'max-w-3xl' }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/25 backdrop-blur-[2px]"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              className={`w-full ${widths[size]} overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl`}
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <h2 className="text-base font-bold text-slate-900">{title}</h2>
                <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="px-6 py-5">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

// ── Table Shell ───────────────────────────────────────────────────────────────
export const TableShell = ({ headers, children, stickyHeader = true }) => (
  <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
    <table className="w-full min-w-max border-collapse text-sm">
      <thead className={`${stickyHeader ? 'sticky top-0 z-10' : ''} bg-slate-50`}>
        <tr>
          {headers.map(h => (
            <th key={h} className="border-b border-slate-200 px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500 first:pl-5 last:pr-5">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
)
