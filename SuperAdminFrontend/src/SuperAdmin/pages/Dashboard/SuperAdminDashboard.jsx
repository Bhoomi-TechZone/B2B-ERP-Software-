import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  Building2, Users, DollarSign, Activity, TrendingUp, TrendingDown,
  RefreshCw, Download, UserPlus, ArrowRight, AlertTriangle, Shield,
  CreditCard, Zap, Globe, BarChart3, PieChart, MapPin, Clock,
  CheckCircle2, XCircle, Eye, Server, Database, Wifi
} from 'lucide-react'
import { useAuth } from '../../../hooks/useAuth.js'
import superAdminService from '../../../services/superAdminService'
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
  const maxValue = Math.max(1, ...(data || []).map(d => Number(d.tenants) || 0))
  
  return (
    <div className="h-64 w-full">
      <h3 className="text-sm font-bold text-slate-900 mb-4">{title}</h3>
      <div className="relative h-48 flex items-end justify-between px-4">
        {(data || []).map((item, i) => {
          const height = Math.min(100, Math.max(4, ((Number(item.tenants) || 0) / maxValue) * 100))
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
  const maxRevenue = Math.max(1, ...(data || []).map(d => Number(d.revenue) || 0))
  
  return (
    <div className="h-64 w-full">
      <h3 className="text-sm font-bold text-slate-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {(data || []).map((item, i) => {
          const width = Math.min(100, Math.max(2, ((Number(item.revenue) || 0) / maxRevenue) * 100))
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
              <span className="text-xs font-bold text-slate-700 w-16">
                ${Number(item.revenue) >= 1000 ? `${(Number(item.revenue) / 1000).toFixed(0)}K` : item.revenue}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DonutChart({ data, title }) {
  const total = (data || []).reduce((sum, item) => sum + (Number(item.count) || 0), 0)
  
  return (
    <div className="h-64 w-full">
      <h3 className="text-sm font-bold text-slate-900 mb-4">{title}</h3>
      <div className="flex items-center justify-center">
        <div className="relative w-32 h-32">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="8" />
            {(data || []).map((item, i) => {
              const circumference = 2 * Math.PI * 40
              const percentage = total > 0 ? ((Number(item.count) || 0) / total) * 100 : (Number(item.percentage) || 0)
              const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`
              const prevPercentage = data.slice(0, i).reduce((sum, prev) => sum + (total > 0 ? ((Number(prev.count) || 0) / total) * 100 : (Number(prev.percentage) || 0)), 0)
              const strokeDashoffset = -((prevPercentage / 100) * circumference)
              
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
          {(data || []).map(item => (
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
  const [refreshing, setRefreshing] = useState(false)
  const [statsData, setStatsData] = useState(null)

  const loadData = async (isRefresh = false) => {
    if (!session) {
      navigate('/super-admin/login')
      return
    }
    
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)

      const res = await superAdminService.getDashboardStats()
      if (res && res.data) {
        setStatsData(res.data)
      } else if (res && res.metric_cards) {
        setStatsData(res)
      }
    } catch (err) {
      console.error('Failed to load super admin stats:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [session, navigate])

  // Dynamic KPI data from backend
  const kpiData = useMemo(() => {
    const cards = statsData?.metric_cards
    if (!cards) {
      return [
        { label: 'Total Tenants', value: '0', delta: '0%', up: true, icon: Building2, bgColor: 'bg-gradient-to-br from-[#1251C5] to-[#1a6fe8]' },
        { label: 'Active Tenants', value: '0', delta: '0%', up: true, icon: CheckCircle2, bgColor: 'bg-gradient-to-br from-[#059669] to-[#10b981]' },
        { label: 'Trial Tenants', value: '0', delta: '0%', up: true, icon: Clock, bgColor: 'bg-gradient-to-br from-[#d97706] to-[#f59e0b]' },
        { label: 'MRR', value: '$0', delta: '0%', up: true, icon: DollarSign, bgColor: 'bg-gradient-to-br from-[#8b5cf6] to-[#a78bfa]' },
        { label: 'ARR', value: '$0', delta: '0%', up: true, icon: BarChart3, bgColor: 'bg-gradient-to-br from-[#0891b2] to-[#22d3ee]' },
        { label: 'Payroll Runs', value: '0', delta: '0%', up: true, icon: Users, bgColor: 'bg-gradient-to-br from-[#7c3aed] to-[#a855f7]' },
        { label: 'Failed Payments', value: '0', delta: '0%', up: false, icon: XCircle, bgColor: 'bg-gradient-to-br from-[#dc2626] to-[#ef4444]' },
        { label: 'API Errors', value: '0', delta: '0%', up: false, icon: AlertTriangle, bgColor: 'bg-gradient-to-br from-[#ea580c] to-[#f97316]' },
        { label: 'Security Flags', value: '0', delta: '0%', up: false, icon: Shield, bgColor: 'bg-gradient-to-br from-[#be123c] to-[#e11d48]' },
      ]
    }

    return [
      {
        label: 'Total Tenants',
        value: String(cards.total_tenants?.value ?? 0),
        delta: cards.total_tenants?.change ?? '0%',
        up: cards.total_tenants?.trend === 'up',
        icon: Building2,
        bgColor: 'bg-gradient-to-br from-[#1251C5] to-[#1a6fe8]',
      },
      {
        label: 'Active Tenants',
        value: String(cards.active_tenants?.value ?? 0),
        delta: cards.active_tenants?.change ?? '0%',
        up: cards.active_tenants?.trend === 'up',
        icon: CheckCircle2,
        bgColor: 'bg-gradient-to-br from-[#059669] to-[#10b981]',
      },
      {
        label: 'Trial Tenants',
        value: String(cards.trial_tenants?.value ?? 0),
        delta: cards.trial_tenants?.change ?? '0%',
        up: cards.trial_tenants?.trend === 'up',
        icon: Clock,
        bgColor: 'bg-gradient-to-br from-[#d97706] to-[#f59e0b]',
      },
      {
        label: 'MRR',
        value: cards.mrr?.value ? `$${cards.mrr.value.toLocaleString()}` : '$0',
        delta: cards.mrr?.change ?? '0%',
        up: cards.mrr?.trend === 'up',
        icon: DollarSign,
        bgColor: 'bg-gradient-to-br from-[#8b5cf6] to-[#a78bfa]',
      },
      {
        label: 'ARR',
        value: cards.arr?.value ? `$${cards.arr.value.toLocaleString()}` : '$0',
        delta: cards.arr?.change ?? '0%',
        up: cards.arr?.trend === 'up',
        icon: BarChart3,
        bgColor: 'bg-gradient-to-br from-[#0891b2] to-[#22d3ee]',
      },
      {
        label: 'Payroll Runs',
        value: String(cards.payroll_runs?.value ?? 0),
        delta: cards.payroll_runs?.change ?? '0%',
        up: cards.payroll_runs?.trend === 'up',
        icon: Users,
        bgColor: 'bg-gradient-to-br from-[#7c3aed] to-[#a855f7]',
      },
      {
        label: 'Failed Payments',
        value: String(cards.failed_payments?.value ?? 0),
        delta: cards.failed_payments?.change ?? '0%',
        up: cards.failed_payments?.trend === 'up',
        icon: XCircle,
        bgColor: 'bg-gradient-to-br from-[#dc2626] to-[#ef4444]',
      },
      {
        label: 'API Errors',
        value: String(cards.api_errors?.value ?? 0),
        delta: cards.api_errors?.change ?? '0%',
        up: cards.api_errors?.trend === 'up',
        icon: AlertTriangle,
        bgColor: 'bg-gradient-to-br from-[#ea580c] to-[#f97316]',
      },
      {
        label: 'Security Flags',
        value: String(cards.security_flags?.value ?? 0),
        delta: cards.security_flags?.change ?? '0%',
        up: cards.security_flags?.trend === 'up',
        icon: Shield,
        bgColor: 'bg-gradient-to-br from-[#be123c] to-[#e11d48]',
      },
    ]
  }, [statsData])

  // Dynamic Chart Data Mapping
  const tenantGrowthData = useMemo(() => {
    if (statsData?.charts?.tenant_growth?.labels && statsData?.charts?.tenant_growth?.datasets?.[0]) {
      const labels = statsData.charts.tenant_growth.labels
      const values = statsData.charts.tenant_growth.datasets[0].data
      return labels.map((month, idx) => ({
        month,
        tenants: values[idx] ?? 0
      }))
    }
    return TENANT_GROWTH_DATA
  }, [statsData])

  const revenueByPlanData = useMemo(() => {
    if (statsData?.charts?.revenue_by_plan?.datasets) {
      const colors = ['#1251C5', '#4f9cf9', '#a78bfa', '#f59e0b']
      return statsData.charts.revenue_by_plan.datasets.map((ds, idx) => ({
        plan: ds.label,
        revenue: ds.data && ds.data.length ? ds.data[ds.data.length - 1] : 0,
        color: colors[idx % colors.length]
      }))
    }
    return REVENUE_BY_PLAN
  }, [statsData])

  const geographicData = useMemo(() => {
    if (statsData?.charts?.geographic_distribution?.data) {
      const total = statsData.charts.geographic_distribution.data.reduce((sum, d) => sum + (Number(d.tenants) || 0), 0) || 1
      return statsData.charts.geographic_distribution.data.map(d => ({
        country: d.country,
        tenants: d.tenants,
        percentage: Math.round(((Number(d.tenants) || 0) / total) * 100)
      }))
    }
    return GEOGRAPHIC_DATA
  }, [statsData])

  const trialFunnelData = useMemo(() => {
    if (statsData?.charts?.trial_funnel?.stages) {
      return statsData.charts.trial_funnel.stages.map(s => ({
        stage: s.name,
        count: s.value,
        percentage: Math.round(Number(s.percentage) || 0)
      }))
    }
    return TRIAL_FUNNEL_DATA
  }, [statsData])

  const subscriptionStatusData = useMemo(() => {
    if (statsData?.charts?.subscription_status?.data) {
      return statsData.charts.subscription_status.data.map(d => ({
        status: d.label,
        count: Number(d.value) || 0,
        percentage: Number(d.percentage) || 0,
        color: d.color
      }))
    }
    return SUBSCRIPTION_STATUS
  }, [statsData])

  const securityEventsData = useMemo(() => {
    if (statsData?.charts?.security_events?.datasets) {
      return statsData.charts.security_events.datasets.map(ds => {
        const total = (ds.data || []).reduce((acc, curr) => acc + (Number(curr) || 0), 0)
        const severity = ds.label.includes('Failed') ? 'medium' : ds.label.includes('Suspicious') ? 'high' : 'low'
        return {
          type: ds.label,
          count: total,
          severity
        }
      })
    }
    return SECURITY_EVENTS
  }, [statsData])

  const handleExportDashboard = () => {
    if (!kpiData || kpiData.length === 0) return
    const headers = ['Metric', 'Value', 'Change', 'Trend']
    const rows = kpiData.map(kpi => [
      `"${kpi.label}"`,
      `"${kpi.value}"`,
      `"${kpi.delta}"`,
      kpi.up ? '"Up"' : '"Down"'
    ])
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', `superadmin_metrics_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

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
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 rounded-lg border border-[#dce9ff] bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-[#f0f5ff] transition disabled:opacity-50">
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-[#1251C5]' : ''}`} /> Refresh
            </motion.button>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={handleExportDashboard}
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
            <LineChart data={tenantGrowthData} title="Tenant Growth" />
          </motion.div>

          {/* Revenue by Plan - Stacked Bar */}
          <motion.div variants={fadeUp} className="rounded-2xl bg-white border border-[#dce9ff] p-6">
            <StackedBarChart data={revenueByPlanData} title="Revenue by Plan" />
          </motion.div>

          {/* Geographic Distribution - Map representation */}
          <motion.div variants={fadeUp} className="rounded-2xl bg-white border border-[#dce9ff] p-6">
            <div className="h-64 w-full">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Geographic Distribution</h3>
              <div className="space-y-3">
                {geographicData.map((item, i) => (
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
            <FunnelChart data={trialFunnelData} title="Trial Funnel" />
          </motion.div>

          {/* Subscription Status - Donut */}
          <motion.div variants={fadeUp} className="rounded-2xl bg-white border border-[#dce9ff] p-6">
            <DonutChart data={subscriptionStatusData} title="Subscription Status" />
          </motion.div>
        </div>

        {/* Security Events Bar Chart */}
        <motion.div variants={fadeUp} className="rounded-2xl bg-white border border-[#dce9ff] p-6">
          <div className="h-64 w-full">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Security Events</h3>
            <div className="flex items-end justify-between h-40 px-4">
              {securityEventsData.map((event, i) => {
                const maxCount = Math.max(1, ...securityEventsData.map(e => e.count))
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
            { icon: BarChart3, label: 'Analytics', action: () => navigate('/super-admin/plans') },
            { icon: Shield, label: 'Security', action: () => navigate('/super-admin/settings') },
            { icon: Server, label: 'System Health', action: () => navigate('/super-admin/settings') },
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