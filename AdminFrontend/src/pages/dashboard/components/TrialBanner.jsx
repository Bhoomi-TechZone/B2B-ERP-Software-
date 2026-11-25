import { AlertTriangle } from 'lucide-react'

function TrialBanner() {
  return (
    <div className="rounded-lg border-2 border-orange-300 bg-gradient-to-r from-orange-50 to-amber-50 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-orange-900">Trial expiring ho rahi hai — non-dismissible warning banner</h4>
          <p className="mt-1 text-sm text-orange-800">
            Your 14-day trial ends in <strong>7 days</strong>. Upgrade now to keep access to all premium features including payroll, compliance, and advanced reporting.
          </p>
          <div className="mt-3 flex gap-3">
            <button className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-orange-700">
              Upgrade to Pro →
            </button>
            <button className="rounded-lg border-2 border-orange-300 bg-white px-4 py-2 text-sm font-semibold text-orange-900 transition hover:bg-orange-50">
              Compare Plans
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TrialBanner
