import { memo } from 'react'

const SkeletonRow = memo(({ cols = 7 }) => (
  <tr className="border-b border-slate-100">
    {[...Array(cols)].map((_, i) => (
      <td key={i} className="px-4 py-3.5">
        <div
          className="h-4 animate-pulse rounded-md bg-slate-200"
          style={{ width: i === 0 ? '160px' : i === 1 ? '80px' : '100px' }}
        />
      </td>
    ))}
  </tr>
))

SkeletonRow.displayName = 'SkeletonRow'
export default SkeletonRow
