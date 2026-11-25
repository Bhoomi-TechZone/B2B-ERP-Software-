import React from 'react'
import { Package, History } from 'lucide-react'

// Import tab components
import OverviewTab from './subscription/OverviewTab'
import HistoryTab from './subscription/HistoryTab'

const SubscriptionPage = () => {


  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subscription & Billing</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your subscription, billing, and usage</p>
      </div>

      {/* Content */}
      <div className="space-y-12">
        <section id="overview">
          <OverviewTab />
        </section>
        
        <div className="border-t border-gray-200 pt-12">
          <section id="history">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <History className="h-5 w-5 text-gray-600" />
              Billing History
            </h2>
            <HistoryTab />
          </section>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionPage
