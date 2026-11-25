import { motion } from 'motion/react'
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react'

function ComplianceAlerts() {
  const alerts = [
    {
      title: 'Filing due: PF returns for March 2026',
      deadline: 'Due in 5 days',
      severity: 'high',
      action: 'File Now',
      link: '/compliance/pf-filing'
    },
    {
      title: 'Visa expiry: 2 employees',
      deadline: 'Expires Apr 30',
      severity: 'critical',
      action: 'Review',
      link: '/employees/visa-expiry'
    },
    {
      title: 'RTW checks pending: 4 new hires',
      deadline: 'Complete within 7 days',
      severity: 'medium',
      action: 'Complete',
      link: '/compliance/rtw-checks'
    },
    {
      title: 'Payroll tax submission',
      deadline: 'Due Apr 25',
      severity: 'high',
      action: 'Submit',
      link: '/payroll/tax-filing'
    }
  ]

  const severityStyles = {
    critical: {
      border: 'border-red-300',
      bg: 'bg-red-50',
      text: 'text-red-700',
      badge: 'bg-red-600 text-white'
    },
    high: {
      border: 'border-orange-300',
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      badge: 'bg-orange-600 text-white'
    },
    medium: {
      border: 'border-amber-300',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      badge: 'bg-amber-600 text-white'
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Compliance Alerts</h3>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
          {alerts.length}
        </span>
      </div>

      <div className="space-y-3">
        {alerts.map((alert, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`rounded-lg border-2 ${severityStyles[alert.severity].border} ${severityStyles[alert.severity].bg} p-4`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`h-5 w-5 ${severityStyles[alert.severity].text}`} />
                  <h4 className={`text-sm font-bold ${severityStyles[alert.severity].text}`}>
                    {alert.title}
                  </h4>
                </div>
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-600">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  {alert.deadline}
                </p>
              </div>
              <button className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold ${severityStyles[alert.severity].badge} shadow transition hover:shadow-lg`}>
                {alert.action} →
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-4 rounded-lg bg-slate-100 p-3 text-center">
        <span className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-700">
          <CheckCircle className="h-4 w-4 text-green-600" />
          12 compliance tasks completed this month
        </span>
      </div>
    </div>
  )
}

export default ComplianceAlerts
