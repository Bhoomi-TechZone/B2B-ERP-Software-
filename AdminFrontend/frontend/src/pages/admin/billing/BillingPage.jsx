import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import {
  DollarSign, TrendingUp, CreditCard, FileText, Download,
  RefreshCw, Calendar, Filter, Search, Eye, AlertCircle
} from 'lucide-react'
import SuperAdminTopBar from '../../components/TopBar'
import superAdminService from '../../../services/superAdminService'

export default function BillingPage() {
  const [billingStats, setBillingStats] = useState({})
  const [invoices, setInvoices] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  const fetchBillingData = async () => {
    try {
      setLoading(true)
      const [statsData, invoicesData, paymentsData] = await Promise.all([
        superAdminService.getBillingStats(),
        superAdminService.getInvoices(),
        superAdminService.getPayments()
      ])
      
      setBillingStats(statsData || {})
      setInvoices(Array.isArray(invoicesData) ? invoicesData : (invoicesData?.invoices || []))
      setPayments(Array.isArray(paymentsData) ? paymentsData : (paymentsData?.payments || []))
    } catch (error) {
      console.error('Failed to fetch billing data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBillingData()
  }, [])

  return (
    <div className="min-h-screen bg-[#f0f5ff]">
      <SuperAdminTopBar />
      
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Billing & Revenue</h1>
            <p className="text-sm text-slate-500 mt-1">Monitor platform revenue and billing</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchBillingData}
              className="flex items-center gap-2 px-4 py-2 border border-[#dce9ff] bg-white rounded-lg hover:bg-[#f0f5ff] transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-[#dce9ff] bg-white rounded-lg hover:bg-[#f0f5ff] transition-colors">
              <Download className="h-4 w-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Revenue Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-[#dce9ff] p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-[#1251C5] bg-opacity-10 rounded-lg">
                <DollarSign className="h-5 w-5 text-[#1251C5]" />
              </div>
              <span className="text-sm font-medium text-slate-600">Total Revenue</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              ${billingStats.total_revenue?.toLocaleString() || '0'}
            </p>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-xs text-green-600 font-medium">+12.5% from last month</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl border border-[#dce9ff] p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-500 bg-opacity-10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <span className="text-sm font-medium text-slate-600">Monthly Revenue</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              ${billingStats.monthly_revenue?.toLocaleString() || '0'}
            </p>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-xs text-green-600 font-medium">+8.3% MoM</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl border border-[#dce9ff] p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-500 bg-opacity-10 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-500" />
              </div>
              <span className="text-sm font-medium text-slate-600">ARR</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              ${billingStats.arr?.toLocaleString() || '0'}
            </p>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-xs text-green-600 font-medium">+15.2% YoY</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl border border-[#dce9ff] p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-500 bg-opacity-10 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <span className="text-sm font-medium text-slate-600">Churn Rate</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {billingStats.churn_rate || '0'}%
            </p>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />
              <span className="text-xs text-red-600 font-medium">-0.5% from last month</span>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-[#dce9ff] overflow-hidden mb-6">
          <div className="flex border-b border-[#f0f5ff]">
            {[
              { id: 'overview', label: 'Overview', icon: DollarSign },
              { id: 'invoices', label: 'Invoices', icon: FileText },
              { id: 'payments', label: 'Payments', icon: CreditCard }
            ].map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors relative ${
                    activeTab === tab.id
                      ? 'text-[#1251C5] bg-[#f0f5ff]'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1251C5]"
                    />
                  )}
                </button>
              )
            })}
          </div>

          <div className="p-6">
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'invoices' && <InvoicesTab invoices={invoices} loading={loading} />}
            {activeTab === 'payments' && <PaymentsTab payments={payments} loading={loading} />}
          </div>
        </div>
      </div>
    </div>
  )
}

function OverviewTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart Placeholder */}
        <div className="bg-[#f8faff] rounded-lg p-6 border border-[#dce9ff]">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Revenue Trend</h3>
          <div className="h-64 flex items-center justify-center text-slate-500">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-2 text-slate-300" />
              <p>Revenue chart will be displayed here</p>
            </div>
          </div>
        </div>

        {/* Top Plans */}
        <div className="bg-[#f8faff] rounded-lg p-6 border border-[#dce9ff]">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Performing Plans</h3>
          <div className="space-y-3">
            {[
              { name: 'Enterprise', revenue: '$156,780', growth: '+18%' },
              { name: 'Business', revenue: '$89,340', growth: '+12%' },
              { name: 'Starter', revenue: '$38,270', growth: '+8%' }
            ].map((plan, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div>
                  <p className="font-medium text-slate-900">{plan.name}</p>
                  <p className="text-sm text-slate-500">Monthly Revenue</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">{plan.revenue}</p>
                  <p className="text-sm text-green-600">{plan.growth}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function InvoicesTab({ invoices, loading }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1251C5]"></div>
        <span className="ml-3 text-slate-500">Loading invoices...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#dce9ff] rounded-lg focus:ring-2 focus:ring-[#1251C5] focus:border-transparent outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-[#dce9ff] rounded-lg focus:ring-2 focus:ring-[#1251C5] focus:border-transparent outline-none"
        >
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {/* Invoices Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#f8faff] border-b border-[#dce9ff]">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Invoice #</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Customer</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Amount</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Date</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-500">
                  No invoices found
                </td>
              </tr>
            ) : (
              invoices.map((invoice, index) => (
                <tr key={invoice.id || index} className="border-b border-[#f0f5ff] hover:bg-[#f8faff] transition-colors">
                  <td className="py-3 px-4 font-mono text-sm">{invoice.number || `INV-${index + 1}`}</td>
                  <td className="py-3 px-4">{invoice.customer_name || 'Unknown'}</td>
                  <td className="py-3 px-4 font-semibold">${invoice.amount || '0'}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                      invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {invoice.status || 'pending'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-500">
                    {invoice.date ? new Date(invoice.date).toLocaleDateString() : 'Unknown'}
                  </td>
                  <td className="py-3 px-4">
                    <button className="p-1 text-slate-400 hover:text-[#1251C5] transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function PaymentsTab({ payments, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1251C5]"></div>
        <span className="ml-3 text-slate-500">Loading payments...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#f8faff] border-b border-[#dce9ff]">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Payment ID</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Customer</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Amount</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Method</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-500">
                  No payments found
                </td>
              </tr>
            ) : (
              payments.map((payment, index) => (
                <tr key={payment.id || index} className="border-b border-[#f0f5ff] hover:bg-[#f8faff] transition-colors">
                  <td className="py-3 px-4 font-mono text-sm">{payment.id || `PAY-${index + 1}`}</td>
                  <td className="py-3 px-4">{payment.customer_name || 'Unknown'}</td>
                  <td className="py-3 px-4 font-semibold">${payment.amount || '0'}</td>
                  <td className="py-3 px-4">{payment.method || 'Card'}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                      payment.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {payment.status || 'completed'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-500">
                    {payment.date ? new Date(payment.date).toLocaleDateString() : 'Unknown'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}