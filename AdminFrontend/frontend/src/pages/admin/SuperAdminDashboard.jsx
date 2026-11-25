import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  Building2, Users, DollarSign, Activity, TrendingUp, TrendingDown,
  RefreshCw, Download, UserPlus, ArrowRight, AlertTriangle, Shield,
  CreditCard, Zap, Globe, BarChart3, PieChart, MapPin, Clock,
  CheckCircle2, XCircle, Eye, Server, Database, Wifi
} from 'lucide-react'
import { useAuth } from '../../../hooks/useAuth.js'
import SuperAdminTopBar from '../../components/TopBar'

// Animation variants
const page = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
}

// Mock data for charts
const TENANT_GROWTH_DATA = [
  { month: 'Jan', tenants: 45 },
  { month: 'Feb', tenants: 52 },
  { month: 'Mar', tenants: 61 },
  { month: 'Apr', tenants: 73 },
  { month: 'May', tenants: 89 },
  { month: 'Jun', tenants: 108 }
]

const REVENUE_BY_PLAN = [
  { plan: 'Enterprise', revenue: 145000, color: '#1251C5' },
  { plan: 'Business', revenue: 89000, color: '#4f9cf9' },
  { plan: 'Starter', revenue: 34000, color: '#a78bfa' },
  { plan: 'Trial', revenue: 0, color: '#f59e0b' }
]

const GEOGRAPHIC_DATA = [
  { country: 'United States', tenants: 45, percentage: 42 },
  { country: 'United Kingdom', tenants: 23, percentage: 21 },
  { country: 'Canada', tenants: 18, percentage: 17 },
  { country: 'Australia', tenants: 12, percentage: 11 },
  { country: 'Germany', tenants: 10, percentage: 9 }
]

const TRIAL_FUNNEL_DATA = [
  { stage: 'Signups', count: 1250, percentage: 100 },
  { stage: 'Activated', count: 875, percentage: 70 },
  { stage: 'Engaged', count: 525, percentage: 42 },
  { stage: 'Converted', count: 175, percentage: 14 }
]

const SUBSCRIPTION_STATUS = [
  { status: 'Active', count: 89, percentage: 68, color: '#10b981' },
  { status: 'Trial', count: 23, percentage: 18, color: '#f59e0b' },
  { status: 'Suspended', count: 12, percentage: 9, color: '#ef4444' },
  { status: 'Cancelled', count: 7, percentage: 5, color: '#64748b' }
]

const SECURITY_EVENTS = [
  { type: 'Failed Logins', count: 45, severity: 'medium' },
  { type: 'Suspicious Activity', count: 12, severity: 'high' },
  { type: 'Data Access', count: 8, severity: 'low' },
  { type: 'Permission Changes', count: 23, severity: 'medium' }
]

// Chart Components
function LineChart({ data, title }) {
  const maxValue = Math.max(...data.map(d => d.tenants))
  
  return (
    <div className="h-64 w-full">
      <h3 className="text-sm font-bold text-slate-900 mb-4">{title}</h3>
      <div className="relative h-48 flex items-end justify-between px-4">
        {data.map((item, i) => {
          const height = (item.tenants / maxValue) * 100
          return (
            <div key={item.month} className="flex flex-col items-center gap-2">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                className="w-8 bg-gradient-to-t from-[#1251C5] to-[#4f9cf9] rounded-t-md min-h-[4px]"
              />
              <span className="text-xs text-slate-500">{item.month}</span>
              <span className="text-xs font-bold text-slate-700">{item.tenants}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StackedBarChart({ data, title }) {
  const maxRevenue = Math.max(...data.map(d => d.revenue))
  
  return (
    <div className="h-64 w-full">
      <h3 className="text-sm font-bold text-slate-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, i) => {
          const width = (item.revenue / maxRevenue) * 100
          return (
            <div key={item.plan} className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-700 w-20">{item.plan}</span>
              <div className="flex-1 bg-slate-100 rounded-full h-6 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${width}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: item.color }}
                />
              </div>
              <span className="text-xs font-bold text-slate-700 w-16">${(item.revenue / 1000).toFixed(0)}K</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DonutChart({ data, title }) {
  const total = data.reduce((sum, item) => sum + item.count, 0)
  
  return (
    <div className="h-64 w-full">
      <h3 className="text-sm font-bold text-slate-900 mb-4">{title}</h3>
      <div className="flex items-center justify-center">
        <div className="relative w-32 h-32">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="8" />
            {data.map((item, i) => {
              const circumference = 2 * Math.PI * 40
              const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`
              const strokeDashoffset = -data.slice(0, i).reduce((sum, prev) => sum + (prev.percentage / 100) * circumference, 0)
              
              return (
                <motion.circle
                  key={item.status}
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={item.color}
                  strokeWidth="8"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  initial={{ strokeDasharray: `0 ${circumference}` }}
                  animate={{ strokeDasharray }}
                  transition={{ duration: 1, delay: i * 0.2 }}
                />
              )
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-slate-900">{total}</span>
            <span className="text-xs text-slate-500">Total</span>
          </div>
        </div>
        <div className="ml-6 space-y-2">
          {data.map(item => (
            <div key={item.status} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-slate-700">{item.status}</span>
              <span className="text-xs font-bold text-slate-900">{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function FunnelChart({ data, title }) {
  return (
    <div className="h-64 w-full">
      <h3 className="text-sm font-bold text-slate-900 mb-4">{title}</h3>
      <div className="space-y-2">
        {data.map((item, i) => (
          <div key={item.stage} className="relative">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-700">{item.stage}</span>
              <span className="text-xs text-slate-500">{item.percentage}%</span>
            </div>
            <div className="bg-slate-100 rounded-full h-8 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.percentage}%` }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                className="h-full bg-gradient-to-r from-[#1251C5] to-[#4f9cf9] flex items-center justify-center"
              >
                <span className="text-xs font-bold text-white">{item.count}</span>
              </motion.div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// KPI Card Component
function KpiCard({ kpi }) {
  const Icon = kpi.icon
  return (
    <motion.div variants={fadeUp}
      whileHover={{ y: -3, boxShadow: '0 12px 32px -8px rgba(18,81,197,0.18)' }}
      className="relative overflow-hidden rounded-2xl bg-white border border-[#dce9ff] p-5 flex flex-col gap-3 cursor-default transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{kpi.label}</p>
          <p className="mt-1 text-2xl font-extrabold text-slate-900 leading-none">{kpi.value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${kpi.bgColor} shadow-md`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        {kpi.up
          ? <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
          : <TrendingDown className="h-3.5 w-3.5 text-red-500" />}
        <span className={`text-xs font-bold ${kpi.up ? 'text-emerald-600' : 'text-red-600'}`}>{kpi.delta}</span>
        <span className="text-[11px] text-slate-400">vs last month</span>
      </div>
    </motion.div>
  )
}

export default function SuperAdminDashboard() {
  const navigate = useNavigate()
  const { session } = useAuth()
  
  const [loading, setLoading] = useState(true)

  // Load data
  useEffect(() => {
    const loadData = async () => {
      if (!session) {
        navigate('/login')
        return
      }
      
      // Simulate loading
      await new Promise(resolve => setTimeout(resolve, 1000))
      setLoading(false)
    }
    
    loadData()
  }, [session, navigate])

  // Complete KPI data according to spec
  const kpiData = [
    {
      label: 'Total Tenants',
      value: '131',
      delta: '+12.4%',
      up: true,
      icon: Building2,
      bgColor: 'bg-gradient-to-br from-[#1251C5] to-[#1a6fe8]',
    },
    {
      label: 'Active Tenants',
      value: '89',
      delta: '+8.1%',
      up: true,
      icon: CheckCircle2,
      bgColor: 'bg-gradient-to-br from-[#059669] to-[#10b981]',
    },
    {
      label: 'Trial Tenants',
      value: '23',
      delta: '+15.2%',
      up: true,
      icon: Clock,
      bgColor: 'bg-gradient-to-br from-[#d97706] to-[#f59e0b]',
    },
    {
      label: 'MRR',
      value: '$284K',
      delta: '+5.7%',
      up: true,
      icon: DollarSign,
      bgColor: 'bg-gradient-to-br from-[#8b5cf6] to-[#a78bfa]',
    },
    {
      label: 'ARR',
      value: '$3.41M',
      delta: '+18.3%',
      up: true,
      icon: BarChart3,
      bgColor: 'bg-gradient-to-br from-[#0891b2] to-[#22d3ee]',
    },
    {
      label: 'Payroll Runs',
      value: '1,247',
      delta: '+3.2%',
      up: true,
      icon: Users,
      bgColor: 'bg-gradient-to-br from-[#7c3aed] to-[#a855f7]',
    },
    {
      label: 'Failed Payments',
      value: '12',
      delta: '-8.5%',
      up: false,
      icon: XCircle,
      bgColor: 'bg-gradient-to-br from-[#dc2626] to-[#ef4444]',
    },
    {
      label: 'API Errors',
      value: '34',
      delta: '-12.1%',
      up: false,
      icon: AlertTriangle,
      bgColor: 'bg-gradient-to-br from-[#ea580c] to-[#f97316]',
    },
    {
      label: 'Security Flags',
      value: '7',
      delta: '-25.0%',
      up: false,
      icon: Shield,
      bgColor: 'bg-gradient-to-br from-[#be123c] to-[#e11d48]',
    },
  ]

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f0f5ff]">
        <SuperAdminTopBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#1251C5] border-r-transparent"></div>
            <p className="mt-4 text-sm text-slate-500">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f0f5ff] font-sans">
      <SuperAdminTopBar />

      <motion.div
        variants={page}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-6 p-6 flex-1 overflow-auto"
      >
        {/* Page Header */}
        <motion.div variants={fadeUp} className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Super Admin Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Platform overview and analytics — {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-1.5 rounded-lg border border-[#dce9ff] bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-[#f0f5ff] transition">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </motion.button>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-1.5 rounded-lg border border-[#dce9ff] bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-[#f0f5ff] transition">
              <Download className="h-3.5 w-3.5" /> Export
            </motion.button>
          </div>
        </motion.div>

        {/* Metric Cards - All 9 cards as per spec */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
          {kpiData.map(kpi => <KpiCard key={kpi.label} kpi={kpi} />)}
        </div>

        {/* Dashboard Charts - Row 1 */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Tenant Growth - Line Chart */}
          <motion.div variants={fadeUp} className="rounded-2xl bg-white border border-[#dce9ff] p-6">
            <LineChart data={TENANT_GROWTH_DATA} title="Tenant Growth" />
          </motion.div>

          {/* Revenue by Plan - Stacked Bar */}
          <motion.div variants={fadeUp} className="rounded-2xl bg-white border border-[#dce9ff] p-6">
            <StackedBarChart data={REVENUE_BY_PLAN} title="Revenue by Plan" />
          </motion.div>

          {/* Geographic Distribution - Map representation */}
          <motion.div variants={fadeUp} className="rounded-2xl bg-white border border-[#dce9ff] p-6">
            <div className="h-64 w-full">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Geographic Distribution</h3>
              <div className="space-y-3">
                {GEOGRAPHIC_DATA.map((item, i) => (
                  <div key={item.country} className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-[#1251C5]" />
                    <span className="text-xs font-semibold text-slate-700 flex-1">{item.country}</span>
                    <span className="text-xs text-slate-500">{item.tenants}</span>
                    <div className="w-16 bg-slate-100 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percentage}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        className="h-full bg-[#1251C5] rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Dashboard Charts - Row 2 */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* User Activity Heatmap */}
          <motion.div variants={fadeUp} className="rounded-2xl bg-white border border-[#dce9ff] p-6">
            <div className="h-64 w-full">
              <h3 className="text-sm font-bold text-slate-900 mb-4">User Activity Heatmap</h3>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 35 }, (_, i) => {
                  const intensity = Math.random()
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="aspect-square rounded-sm"
                      style={{
                        backgroundColor: intensity > 0.7 ? '#1251C5' : 
                                        intensity > 0.4 ? '#4f9cf9' : 
                                        intensity > 0.2 ? '#bfdbfe' : '#f1f5f9'
                      }}
                    />
                  )
                })}
              </div>
              <div className="flex items-center justify-between mt-4 text-xs text-slate-500">
                <span>Less</span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-sm bg-[#f1f5f9]" />
                  <div className="w-3 h-3 rounded-sm bg-[#bfdbfe]" />
                  <div className="w-3 h-3 rounded-sm bg-[#4f9cf9]" />
                  <div className="w-3 h-3 rounded-sm bg-[#1251C5]" />
                </div>
                <span>More</span>
              </div>
            </div>
          </motion.div>

          {/* Trial Funnel */}
          <motion.div variants={fadeUp} className="rounded-2xl bg-white border border-[#dce9ff] p-6">
            <FunnelChart data={TRIAL_FUNNEL_DATA} title="Trial Funnel" />
          </motion.div>

          {/* Subscription Status - Donut */}
          <motion.div variants={fadeUp} className="rounded-2xl bg-white border border-[#dce9ff] p-6">
            <DonutChart data={SUBSCRIPTION_STATUS} title="Subscription Status" />
          </motion.div>
        </div>

        {/* Security Events Bar Chart */}
        <motion.div variants={fadeUp} className="rounded-2xl bg-white border border-[#dce9ff] p-6">
          <div className="h-64 w-full">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Security Events</h3>
            <div className="flex items-end justify-between h-40 px-4">
              {SECURITY_EVENTS.map((event, i) => {
                const maxCount = Math.max(...SECURITY_EVENTS.map(e => e.count))
                const height = (event.count / maxCount) * 100
                const color = event.severity === 'high' ? '#ef4444' : 
                             event.severity === 'medium' ? '#f59e0b' : '#10b981'
                
                return (
                  <div key={event.type} className="flex flex-col items-center gap-2">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      className="w-12 rounded-t-md min-h-[4px]"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs text-slate-500 text-center max-w-16">{event.type}</span>
                    <span className="text-xs font-bold text-slate-700">{event.count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {[
            { icon: Building2, label: 'Add Tenant', action: () => navigate('/super-admin/tenants') },
            { icon: Users, label: 'Manage Users', action: () => navigate('/super-admin/users') },
            { icon: CreditCard, label: 'Billing', action: () => navigate('/super-admin/billing') },
            { icon: BarChart3, label: 'Analytics', action: () => {} },
            { icon: Shield, label: 'Security', action: () => {} },
            { icon: Server, label: 'System Health', action: () => {} },
          ].map(item => {
            const Icon = item.icon
            return (
              <motion.button
                key={item.label}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={item.action}
                className="flex flex-col items-center gap-2 rounded-xl bg-white border border-[#dce9ff] py-4 px-3 text-center hover:bg-[#f8faff] transition-colors"
              >
                <Icon className="h-5 w-5 text-[#1251C5]" />
                <span className="text-xs font-semibold text-slate-700">{item.label}</span>
              </motion.button>
            )
          })}
        </motion.div>
      </motion.div>
    </div>
  )
}