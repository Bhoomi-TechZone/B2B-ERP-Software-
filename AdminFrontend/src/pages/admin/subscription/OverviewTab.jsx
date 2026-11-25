import { useState, useEffect } from 'react'
import { 
  CheckCircle, Users, Calendar, CreditCard, ArrowUp, AlertCircle, 
  Clock, XCircle, TrendingUp, Package, DollarSign, X, Loader2
} from 'lucide-react'
import { getSubscription, getAvailablePlans, changePlan } from '../../../services/billingService'
import { useAuth } from '../../../hooks/useAuth'

// ─── Upgrade Plan Modal ───────────────────────────────────────────────────────
const UpgradePlanModal = ({ currentPlanId, currency = 'USD', billingCycle = 'monthly', onClose, onSuccess }) => {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [error, setError] = useState(null)

  const isYearly = billingCycle === 'yearly' || billingCycle === 'annual'
  const curr = (currency || 'USD').toUpperCase()
  const modalCurrencySymbol = curr === 'INR' ? '₹' : curr === 'GBP' ? '£' : curr === 'EUR' ? '€' : '$'

  const getPlanPrice = (p) => {
    if (curr === 'INR') return isYearly ? p.price_yearly_inr : p.price_monthly_inr
    if (curr === 'GBP') return isYearly ? p.price_yearly_gbp : p.price_monthly_gbp
    if (curr === 'EUR') return isYearly ? p.price_yearly_eur : p.price_monthly_eur
    return isYearly ? p.price_yearly_usd : p.price_monthly_usd
  }

  useEffect(() => {
    getAvailablePlans()
      .then(res => setPlans(res.plans || []))
      .catch(() => setError('Could not load plans.'))
      .finally(() => setLoading(false))
  }, [])

  const handleConfirm = async () => {
    if (!selectedPlan) return
    setSubmitting(true)
    setError(null)
    try {
      await changePlan(selectedPlan.id, true)
      onSuccess(selectedPlan.name)
    } catch (err) {
      setError(err.message || 'Failed to change plan.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900">Choose a Plan</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {plans.map(plan => {
                const isCurrent = plan.id === currentPlanId
                const isSelected = selectedPlan?.id === plan.id
                return (
                  <button
                    key={plan.id}
                    disabled={isCurrent}
                    onClick={() => setSelectedPlan(plan)}
                    className={`rounded-xl border-2 p-4 text-left transition ${
                      isCurrent ? 'cursor-not-allowed border-gray-200 bg-gray-50 opacity-60'
                      : isSelected ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-900">{plan.name}</p>
                      {isCurrent && <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600">Current</span>}
                      {isSelected && !isCurrent && <CheckCircle className="h-4 w-4 text-blue-500" />}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
                    <p className="mt-2 text-lg font-bold text-gray-900">
                      {modalCurrencySymbol}{getPlanPrice(plan)?.toLocaleString()}<span className="text-sm font-normal text-gray-500">/{isYearly ? 'yr' : 'mo'}</span>
                    </p>
                    <p className="mt-1 text-xs text-gray-500">Up to {plan.max_employees} employees</p>
                  </button>
                )
              })}
            </div>
          )}
          {error && !loading && <p className="mt-3 text-sm text-red-500">{error}</p>}
        </div>
        <div className="flex gap-3 border-t border-gray-200 px-6 py-4">
          <button onClick={onClose} className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedPlan || submitting}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
            {submitting ? 'Changing Plan...' : 'Confirm Change'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Update Payment Modal ─────────────────────────────────────────────────────
const UpdatePaymentModal = ({ onClose }) => {
  const [form, setForm] = useState({ cardNumber: '', expiry: '', cvv: '', name: '' })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setSubmitting(true)
    // Stripe integration point — for now simulate a 1s save
    await new Promise(r => setTimeout(r, 1000))
    setSubmitting(false)
    setSuccess(true)
    setTimeout(onClose, 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900">Update Payment Method</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        {success ? (
          <div className="flex flex-col items-center gap-3 p-8">
            <CheckCircle className="h-12 w-12 text-emerald-500" />
            <p className="text-lg font-semibold text-gray-900">Payment method updated!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
              <input name="name" value={form.name} onChange={handleChange} required
                placeholder="John Doe"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
              <input name="cardNumber" value={form.cardNumber} onChange={handleChange} required
                placeholder="1234 5678 9012 3456" maxLength={19}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry (MM/YY)</label>
                <input name="expiry" value={form.expiry} onChange={handleChange} required
                  placeholder="MM/YY" maxLength={5}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                <input name="cvv" value={form.cvv} onChange={handleChange} required
                  placeholder="123" maxLength={4} type="password"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <CreditCard className="h-3 w-3" /> Your card details are encrypted and secure.
            </p>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" disabled={submitting}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {submitting ? 'Saving...' : 'Save Card'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// ─── Main OverviewTab ─────────────────────────────────────────────────────────
const OverviewTab = () => {
  const { refreshProfile } = useAuth()
  const [subscriptionData, setSubscriptionData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [successMsg, setSuccessMsg] = useState(null)

  const refetchSubscription = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getSubscription()
      setSubscriptionData(data)
    } catch (err) {
      setError(err.message || 'Failed to load subscription details.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getSubscription()
        if (isMounted) setSubscriptionData(data)
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to load subscription details.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadData()
    return () => { isMounted = false }
  }, [])

  const handleUpgradeSuccess = async (planName) => {
    setShowUpgradeModal(false)
    setSuccessMsg(`Plan changed to ${planName} successfully!`)
    refetchSubscription() // Refresh data
    if (refreshProfile) {
      try {
        await refreshProfile()
      } catch (e) {
        console.error('Failed to refresh profile after plan change:', e)
      }
    }
    setTimeout(() => setSuccessMsg(null), 4000)
  }

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        <p className="mt-4 text-sm text-gray-600">Loading subscription details...</p>
      </div>
    </div>
  )

  if (error) {
    const isNotFound = typeof error === 'string' && error.toLowerCase().includes('not found');
    return (
      <div className="space-y-6">
        {showUpgradeModal && (
          <UpgradePlanModal
            currentPlanId={subscriptionData?.plan_id}
            currency={subscriptionData?.currency}
            billingCycle={subscriptionData?.billing_cycle}
            onClose={() => setShowUpgradeModal(false)}
            onSuccess={handleUpgradeSuccess}
          />
        )}
        <div className="flex h-64 items-center justify-center">
          {isNotFound ? (
            <div className="text-center max-w-md mx-auto p-8 rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-4">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Subscription</h3>
              <p className="text-sm text-gray-500 mb-6">You don't have an active subscription plan yet. Select a plan to get started with full access.</p>
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
              >
                Choose a Plan
              </button>
            </div>
          ) : (
            <div className="text-center text-red-500">
              <AlertCircle className="mx-auto h-12 w-12 mb-2" />
              <p>{error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!subscriptionData) return null

  const employeeCount = subscriptionData.employee_count || 0
  const maxEmployees = (subscriptionData.max_employees && subscriptionData.max_employees > 0) ? subscriptionData.max_employees : 50
  const maxEmployeesDisplay = (subscriptionData.max_employees && subscriptionData.max_employees > 0) ? subscriptionData.max_employees : 'Unlimited'
  const usagePercentage = subscriptionData.max_employees > 0 ? Math.min((employeeCount / maxEmployees) * 100, 100) : 0
  const isNearLimit = usagePercentage > 80
  const overageEmployees = subscriptionData.max_employees > 0 ? Math.max(0, employeeCount - maxEmployees) : 0
  const hasOverage = overageEmployees > 0
  const curr = (subscriptionData.currency || 'USD').toUpperCase()
  const currencySymbol = curr === 'INR' ? '₹' : curr === 'GBP' ? '£' : curr === 'EUR' ? '€' : '$'
  const isYearly = subscriptionData.billing_cycle === 'yearly' || subscriptionData.billing_cycle === 'annual'

  const getStatusBadge = (status) => {
    const badges = {
      trial:     { label: 'Trial',    cls: 'bg-purple-100 text-purple-700', Icon: Clock },
      trialing:  { label: 'Trial',    cls: 'bg-purple-100 text-purple-700', Icon: Clock },
      active:    { label: 'Active',   cls: 'bg-emerald-100 text-emerald-700', Icon: CheckCircle },
      past_due:  { label: 'Past Due', cls: 'bg-orange-100 text-orange-700', Icon: AlertCircle },
      cancelled: { label: 'Cancelled',cls: 'bg-red-100 text-red-700', Icon: XCircle },
      suspended: { label: 'Suspended',cls: 'bg-gray-100 text-gray-700', Icon: Clock },
    }
    const b = badges[status] || badges.active
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${b.cls}`}>
        <b.Icon className="h-3 w-3" />{b.label}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Modals */}
      {showUpgradeModal && (
        <UpgradePlanModal
          currentPlanId={subscriptionData?.plan_id}
          currency={subscriptionData?.currency}
          billingCycle={subscriptionData?.billing_cycle}
          onClose={() => setShowUpgradeModal(false)}
          onSuccess={handleUpgradeSuccess}
        />
      )}
      {showPaymentModal && (
        <UpdatePaymentModal onClose={() => setShowPaymentModal(false)} />
      )}

      {/* Success Banner */}
      {successMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
          <CheckCircle className="h-5 w-5 text-emerald-500" />
          <p className="text-sm font-medium text-emerald-800">{successMsg}</p>
        </div>
      )}

      {/* Current Plan Card */}
      <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-purple-50 p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Package className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">{subscriptionData.plan_name} Plan</h2>
              {getStatusBadge(subscriptionData.status)}
            </div>
            <p className="mt-2 text-sm text-gray-600 capitalize">
              Billed {isYearly ? 'Annually' : 'Monthly'} &bull; Next billing on {new Date(subscriptionData.current_period_end).toLocaleDateString()}
            </p>
            {subscriptionData.promo_code && (
              <p className="mt-1 text-sm font-medium text-emerald-600">
                🎉 {subscriptionData.discount_percentage}% discount with code: {subscriptionData.promo_code}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-900">{currencySymbol}{subscriptionData.final_price?.toLocaleString() || 0}</p>
            <p className="text-sm text-gray-600">per {isYearly ? 'year' : 'month'}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {[
          { label: 'Employees', value: `${employeeCount} / ${maxEmployeesDisplay}`, Icon: Users, color: 'blue' },
          { label: 'Billing Cycle', value: isYearly ? 'Annual' : 'Monthly', Icon: Calendar, color: 'purple', capitalize: true },
          { label: 'Payment', value: subscriptionData.payment_methods?.[0] ? `${subscriptionData.payment_methods[0].brand} ••••${subscriptionData.payment_methods[0].last4}` : 'Not set', Icon: CreditCard, color: 'emerald' },
          { label: 'Next Charge', value: `${currencySymbol}${subscriptionData.final_price?.toLocaleString() || 0}`, Icon: DollarSign, color: 'orange' },
        ].map((stat) => {
          const IconComponent = stat.Icon
          return (
            <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-${stat.color}-100`}>
                  <IconComponent className={`h-5 w-5 text-${stat.color}-600`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className={`text-xl font-bold text-gray-900 ${stat.capitalize ? 'capitalize' : ''}`}>{stat.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Employee Usage */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Employee Usage</h3>
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">Current Usage</span>
            <span className="font-bold text-gray-900">{usagePercentage.toFixed(0)}%</span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full transition-all ${hasOverage ? 'bg-red-500' : isNearLimit ? 'bg-orange-500' : 'bg-emerald-500'}`}
              style={{ width: `${usagePercentage}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-gray-600">{employeeCount} employees used of {maxEmployeesDisplay} included</p>
        </div>

        {hasOverage && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-red-900">Employee Limit Exceeded</h4>
                <p className="mt-1 text-sm text-red-700">
                  You have {overageEmployees} employees over your plan limit.
                </p>
                <button onClick={() => setShowUpgradeModal(true)}
                  className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 flex items-center gap-2">
                  <ArrowUp className="h-4 w-4" /> Upgrade to Avoid Charges
                </button>
              </div>
            </div>
          </div>
        )}

        {isNearLimit && !hasOverage && (
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-orange-900">Approaching Employee Limit</h4>
                <p className="mt-1 text-sm text-orange-700">
                  You're using {usagePercentage.toFixed(0)}% of your limit.
                </p>
                <button onClick={() => setShowUpgradeModal(true)}
                  className="mt-3 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 flex items-center gap-2">
                  <ArrowUp className="h-4 w-4" /> Upgrade Plan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Trial timeline */}
      {subscriptionData.trial_ends_at && new Date(subscriptionData.trial_ends_at) > new Date() && (
        <div className="rounded-xl border border-purple-200 bg-purple-50 p-6 shadow-sm">
          <h3 className="mb-2 text-lg font-semibold text-purple-900">Trial Period</h3>
          <p className="text-sm text-purple-700">
            Your trial ends on <strong>{new Date(subscriptionData.trial_ends_at).toLocaleDateString()}</strong>.
            Add a payment method to continue after trial.
          </p>
          <button onClick={() => setShowPaymentModal(true)}
            className="mt-3 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700">
            Add Payment Method
          </button>
        </div>
      )}

      {/* Plan Features */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Plan Features</h3>
        {subscriptionData.features?.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {subscriptionData.features.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <span className="text-sm text-gray-700">{f}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Features are defined by your plan configuration.</p>
        )}
      </div>

      {/* Payment Details */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Payment Details</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Payment Method</span>
            <span className="text-sm font-medium text-gray-900">
              {subscriptionData.payment_methods?.[0]
                ? `${subscriptionData.payment_methods[0].brand} ending in ${subscriptionData.payment_methods[0].last4}`
                : 'Not set'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Auto-Renewal</span>
            <span className={`text-sm font-medium ${subscriptionData.auto_renew ? 'text-emerald-600' : 'text-gray-500'}`}>
              {subscriptionData.auto_renew ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-gray-200 pt-3">
            <span className="text-sm text-gray-600">Current Period</span>
            <span className="text-sm font-medium text-gray-900">
              {new Date(subscriptionData.current_period_start).toLocaleDateString()} → {new Date(subscriptionData.current_period_end).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Next Billing Date</span>
            <span className="text-sm font-medium text-gray-900">
              {new Date(subscriptionData.next_billing_date || subscriptionData.current_period_end).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-gray-200 pt-3">
            <span className="text-sm font-semibold text-gray-900">Next Charge</span>
            <span className="text-lg font-bold text-gray-900">{currencySymbol}{subscriptionData.final_price?.toLocaleString() || 0}</span>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button onClick={() => setShowPaymentModal(true)}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2">
            <CreditCard className="h-4 w-4" /> Update Payment Method
          </button>
          <button onClick={() => setShowUpgradeModal(true)}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 flex items-center justify-center gap-2">
            <ArrowUp className="h-4 w-4" /> Upgrade Plan
          </button>
        </div>
      </div>

      {/* Stripe IDs */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <p className="text-xs text-gray-500">
          Subscription ID: {subscriptionData.stripe_subscription_id || 'N/A'} &bull; Customer ID: {subscriptionData.stripe_customer_id || 'N/A'}
        </p>
      </div>
    </div>
  )
}

export default OverviewTab