import { useState, useEffect } from 'react'
import { Download, Receipt, CheckCircle, XCircle, Clock, ExternalLink, AlertCircle } from 'lucide-react'
import { getBillingHistory, getSubscription } from '../../../services/billingService'

const HistoryTab = () => {
  const [invoices, setInvoices] = useState([])
  const [subscriptionData, setSubscriptionData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [historyRes, subRes] = await Promise.allSettled([
          getBillingHistory(1, 100), // Get up to 100 recent invoices
          getSubscription()
        ]);
        
        if (historyRes.status === 'fulfilled') {
          setInvoices(historyRes.value?.invoices || []);
        } else {
          console.warn("Failed to fetch billing history:", historyRes.reason);
        }

        if (subRes.status === 'fulfilled') {
          setSubscriptionData(subRes.value);
        } else {
          console.warn("Failed to fetch subscription for history tab:", subRes.reason);
        }

        if (historyRes.status === 'rejected') {
          setError(historyRes.reason?.message || "Failed to load billing history.");
        }
      } catch (err) {
        console.error("Failed to fetch billing history:", err);
        setError(err.message || "Failed to load billing history.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-sm text-gray-600">Loading billing history...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center text-red-500">
          <AlertCircle className="mx-auto h-12 w-12 mb-2" />
          <p>{error}</p>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status) => {
    const badges = {
      paid: { label: 'Paid', class: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
      pending: { label: 'Pending', class: 'bg-yellow-100 text-yellow-700', icon: Clock },
      failed: { label: 'Failed', class: 'bg-red-100 text-red-700', icon: XCircle },
    }
    const badge = badges[status] || badges.pending
    const Icon = badge.icon
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.class}`}>
        <Icon className="h-3 w-3" />
        {badge.label}
      </span>
    )
  }

  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.total_amount || 0), 0)
  const currencySymbol = invoices.length > 0 ? (invoices[0].currency === 'INR' ? '₹' : invoices[0].currency) : '₹';
  const subCurrencySymbol = subscriptionData?.currency === 'INR' ? '₹' : (subscriptionData?.currency === 'USD' ? '$' : subscriptionData?.currency) || currencySymbol;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Paid</p>
              <p className="text-xl font-bold text-gray-900">{currencySymbol}{totalPaid.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Receipt className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Invoices</p>
              <p className="text-xl font-bold text-gray-900">{invoices.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Next Billing</p>
              <p className="text-xl font-bold text-gray-900">{subscriptionData ? new Date(subscriptionData.next_billing_date || subscriptionData.current_period_end).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Billing History</h2>
          <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
            <Download className="h-4 w-4" />
            Export All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Invoice</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Amount</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="transition hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{invoice.invoice_number}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-700">{new Date(invoice.issue_date).toLocaleDateString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">{subscriptionData?.plan_name || 'Current Plan'}</p>
                      <p className="text-xs capitalize text-gray-500">{subscriptionData?.billing_cycle || 'monthly'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(invoice.status)}</td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">{currencySymbol}{invoice.total_amount?.toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {invoice.pdf_url && (
                        <a href={invoice.pdf_url} target="_blank" rel="noreferrer" className="rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-200">
                          <Download className="inline h-3 w-3 mr-1" />
                          PDF
                        </a>
                      )}
                      <button className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-200">
                        <ExternalLink className="inline h-3 w-3 mr-1" />
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Payment Summary</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Subscription Plan</span>
            <span className="text-sm font-medium text-gray-900">{subscriptionData?.plan_name || 'N/A'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Billing Cycle</span>
            <span className="text-sm font-medium capitalize text-gray-900">{subscriptionData?.billing_cycle || 'N/A'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Base Price</span>
            <span className="text-sm font-medium text-gray-900">{subCurrencySymbol}{subscriptionData?.base_price?.toLocaleString() || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Employees ({subscriptionData?.employee_count || 0}/{subscriptionData?.max_employees || 0})</span>
            <span className="text-sm font-medium text-gray-900">Included</span>
          </div>
          <div className="flex items-center justify-between border-t border-gray-200 pt-3">
            <span className="text-sm font-semibold text-gray-900">Next Charge</span>
            <span className="text-lg font-bold text-gray-900">{subCurrencySymbol}{subscriptionData?.final_price?.toLocaleString() || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Billing Date</span>
            <span className="text-sm font-medium text-gray-900">{subscriptionData ? new Date(subscriptionData.next_billing_date || subscriptionData.current_period_end).toLocaleDateString() : 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HistoryTab
