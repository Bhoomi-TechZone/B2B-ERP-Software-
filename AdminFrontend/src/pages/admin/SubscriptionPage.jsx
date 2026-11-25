import React from 'react'
import { useSearchParams } from 'react-router-dom'
import { Package, History, CreditCard, LayoutDashboard } from 'lucide-react'

// Import tab components
import OverviewTab from './subscription/OverviewTab'
import HistoryTab from './subscription/HistoryTab'

const SubscriptionPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'overview'

  const handleTabChange = (tab) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.set('tab', tab)
      return next
    })
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription & Billing</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your subscription, invoices, and billing history</p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white p-1 shadow-xs">
          <button
            type="button"
            onClick={() => handleTabChange('overview')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition cursor-pointer ${activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            Overview
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('invoices')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition cursor-pointer ${activeTab === 'invoices' || activeTab === 'history' || activeTab === 'payments'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
          >
            <History className="h-4 w-4" />
            Invoices & Payments
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-8">
        {(activeTab === 'overview' || activeTab === 'all') && (
          <section id="overview">
            <OverviewTab />
          </section>
        )}

        {(activeTab === 'invoices' || activeTab === 'history' || activeTab === 'payments' || activeTab === 'all') && (
          <div className={activeTab === 'all' ? "border-t border-gray-200 pt-8" : ""}>
            <section id="history">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <History className="h-5 w-5 text-gray-600" />
                Invoices & Payment History
              </h2>
              <HistoryTab />
            </section>
          </div>
        )}
      </div>
    </div>
  )
}

export default SubscriptionPage
