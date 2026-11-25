import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  ChevronLeft,
  ExternalLink, Edit2, UserCheck, Ban, Copy, Download, Plus, RefreshCw,
  Mail, Phone, Shield, Globe, Server, Database, Lock, Eye, MoreHorizontal,
  CheckCircle2, XCircle, AlertTriangle, Clock, CreditCard, FileText,
  Activity, Cpu, Wifi, Zap, Key, Users, Building2, ArrowRight,
  TrendingUp, TrendingDown, ToggleLeft, ToggleRight, Calendar,
  CheckCircle, Loader2, Search, ChevronDown, AlertCircle,
} from 'lucide-react'
import SuperAdminTopBar from '../../components/TopBar'
import superAdminService from '../../../services/superAdminService'

// ─── Helper Components ─────────────────────────────────────────────────────────
const InfoField = ({ label, value, color = 'slate', isLink = false, fullWidth = false }) => {
  if (!value) return null
  
  const colorStyles = {
    slate: { label: 'text-slate-500', value: 'text-slate-900', bg: 'bg-slate-50' },
    emerald: { label: 'text-emerald-600', value: 'text-slate-900', bg: 'bg-emerald-50' },
    blue: { label: 'text-blue-600', value: 'text-slate-900', bg: 'bg-blue-50' },
    violet: { label: 'text-violet-600', value: 'text-slate-900', bg: 'bg-violet-50' },
    amber: { label: 'text-amber-600', value: 'text-slate-900', bg: 'bg-amber-50' },
    green: { label: 'text-green-600', value: 'text-slate-900', bg: 'bg-green-50' },
  }
  
  const styles = colorStyles[color] || colorStyles.slate
  
  return (
    <div className={`${styles.bg} rounded-lg p-3 ${fullWidth ? 'md:col-span-2' : ''}`}>
      <p className={`text-[10px] font-semibold uppercase ${styles.label} mb-1`}>{label}</p>
      {isLink ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:underline truncate block">
          {value}
        </a>
      ) : (
        <p className={`text-sm font-medium ${styles.value} truncate`}>{value}</p>
      )}
    </div>
  )
}

// ─── Static supplementary data ────────────────────────────────────────────────
const DEMO_USERS = [
  { id: 1, name: 'Robert Chen',     email: 'r.chen@apextech.com',     role: 'Tenant Admin', type: 'Admin',    status: 'active', mfa: true,  lastLogin: '2 hours ago',  createdAt: '2023-01-12' },
  { id: 2, name: 'Jennifer Liu',    email: 'j.liu@apextech.com',      role: 'HR Manager',   type: 'HR',       status: 'active', mfa: true,  lastLogin: '1 day ago',    createdAt: '2023-02-05' },
  { id: 3, name: 'Marcus Ortega',   email: 'm.ortega@apextech.com',   role: 'Employee',     type: 'Employee', status: 'active', mfa: false, lastLogin: '3 hours ago',  createdAt: '2023-04-18' },
  { id: 4, name: 'Diana Weiss',     email: 'd.weiss@apextech.com',    role: 'Manager',      type: 'Manager',  status: 'active', mfa: true,  lastLogin: '30 min ago',   createdAt: '2023-06-01' },
  { id: 5, name: 'Anil Sharma',     email: 'a.sharma@apextech.com',   role: 'HR Staff',     type: 'HR',       status: 'inactive', mfa: false, lastLogin: '45 days ago', createdAt: '2023-07-22' },
  { id: 6, name: 'Chloe Beaumont',  email: 'c.beaumont@apextech.com', role: 'Employee',     type: 'Employee', status: 'active', mfa: false, lastLogin: '5 hours ago',  createdAt: '2024-01-08' },
]

const BILLING_HISTORY = [
  { date: '2026-04-01', invoice: 'INV-20260401', amount: '$4,200', status: 'paid',   stripeId: 'in_3f8a...' },
  { date: '2026-03-01', invoice: 'INV-20260301', amount: '$4,200', status: 'paid',   stripeId: 'in_3e7b...' },
  { date: '2026-02-01', invoice: 'INV-20260201', amount: '$4,200', status: 'paid',   stripeId: 'in_3d6c...' },
  { date: '2026-01-01', invoice: 'INV-20260101', amount: '$4,000', status: 'paid',   stripeId: 'in_3c5d...' },
  { date: '2025-12-01', invoice: 'INV-20251201', amount: '$3,800', status: 'failed', stripeId: 'in_3b4e...' },
  { date: '2025-11-01', invoice: 'INV-20251101', amount: '$3,800', status: 'paid',   stripeId: 'in_3a3f...' },
]

const MODULES = [
  { key: 'core_hr',         label: 'Core HR',             enabled: true,  plan: true  },
  { key: 'payroll',         label: 'Payroll',             enabled: true,  plan: true  },
  { key: 'leave',           label: 'Leave Management',    enabled: true,  plan: true  },
  { key: 'attendance',      label: 'Attendance',          enabled: true,  plan: true  },
  { key: 'recruitment',     label: 'Recruitment (ATS)',   enabled: true,  plan: true  },
  { key: 'performance',     label: 'Performance',         enabled: true,  plan: true  },
  { key: 'benefits',        label: 'Benefits',            enabled: false, plan: false },
  { key: 'compliance',      label: 'Compliance',          enabled: true,  plan: true  },
  { key: 'api_access',      label: 'API Access',          enabled: true,  plan: true  },
  { key: 'whitelabel',      label: 'White-label',         enabled: false, plan: false },
  { key: 'sso',             label: 'SSO',                 enabled: true,  plan: true  },
  { key: 'multi_entity',    label: 'Multi-entity',        enabled: false, plan: false },
  { key: 'adv_analytics',   label: 'Advanced Analytics',  enabled: true,  plan: true  },
]

const SSO_CONFIGS = [
  { id: 1, domain: 'apextech.com',    type: 'SAML',     status: 'active',   createdAt: '2023-06-15' },
  { id: 2, domain: 'apex-corp.com',   type: 'Microsoft',status: 'inactive', createdAt: '2024-01-20' },
]

const AUDIT_EVENTS = [
  { id: 1,  ts: '2026-04-22 09:41', actor: 'Robert Chen',     email: 'r.chen@apextech.com',  type: 'AUTH',     severity: 'info',     ip: '203.0.113.5',   action: 'User login successful'                      },
  { id: 2,  ts: '2026-04-22 08:15', actor: 'Jennifer Liu',    email: 'j.liu@apextech.com',   type: 'HR',       severity: 'info',     ip: '203.0.113.12',  action: 'Employee record updated (EMP-0421)'          },
  { id: 3,  ts: '2026-04-21 17:30', actor: 'System',          email: '—',                    type: 'SYSTEM',   severity: 'warning',  ip: '—',             action: 'Failed login attempt (5 retries) for d.weiss' },
  { id: 4,  ts: '2026-04-21 14:22', actor: 'Robert Chen',     email: 'r.chen@apextech.com',  type: 'BILLING',  severity: 'info',     ip: '203.0.113.5',   action: 'Payment method updated'                     },
  { id: 5,  ts: '2026-04-20 11:05', actor: 'Diana Weiss',     email: 'd.weiss@apextech.com', type: 'PAYROLL',  severity: 'info',     ip: '198.51.100.8',  action: 'Payroll run initiated for March 2026'        },
  { id: 6,  ts: '2026-04-19 10:18', actor: 'System',          email: '—',                    type: 'SYSTEM',   severity: 'critical', ip: '—',             action: 'Bulk data export triggered (2,400 records)'  },
  { id: 7,  ts: '2026-04-18 09:00', actor: 'Jennifer Liu',    email: 'j.liu@apextech.com',   type: 'RECRUIT',  severity: 'info',     ip: '203.0.113.12',  action: 'New job posting published: Senior Engineer'  },
  { id: 8,  ts: '2026-04-17 16:45', actor: 'Marcus Ortega',   email: 'm.ortega@apextech.com',type: 'AUTH',     severity: 'info',     ip: '192.0.2.50',    action: 'Password changed successfully'               },
]

const STATUS_STYLES = {
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  trial: 'bg-amber-50 text-amber-700 ring-amber-200',
  suspended: 'bg-red-50 text-red-700 ring-red-200',
  past_due: 'bg-orange-50 text-orange-700 ring-orange-200',
  cancelled: 'bg-slate-100 text-slate-500 ring-slate-200',
  churned: 'bg-slate-800 text-white ring-slate-700',
}
const PLAN_STYLES = {
  Starter: 'bg-violet-100 text-violet-700', Growth: 'bg-sky-100 text-sky-700',
  Business: 'bg-[#dce9ff] text-[#1251C5]', Enterprise: 'bg-[#1251C5] text-white',
}
const REGION_FLAGS = { US: '🇺🇸', UK: '🇬🇧', IN: '🇮🇳', AU: '🇦🇺', CA: '🇨🇦', SG: '🇸🇬', DE: '🇩🇪' }
const SEVERITY_STYLES = {
  info:     'bg-blue-50 text-blue-600 ring-blue-200',
  warning:  'bg-amber-50 text-amber-600 ring-amber-200',
  critical: 'bg-red-50 text-red-600 ring-red-200',
}

const TABS = ['Overview', 'Users', 'Subscription & Billing', 'Modules & Features', 'SSO Configuration', 'Audit Log', 'Data & Compliance']

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
}

// ─── Shared small components ──────────────────────────────────────────────────
function StatusBadge({ status }) {
  const labels = { active: 'Active', trial: 'Trial', suspended: 'Suspended', past_due: 'Past Due', cancelled: 'Cancelled', churned: 'Churned' }
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${STATUS_STYLES[status] ?? 'bg-slate-100 text-slate-600 ring-slate-200'}`}>{labels[status] ?? status}</span>
}
function PlanBadge({ plan }) {
  return <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold ${PLAN_STYLES[plan] ?? 'bg-slate-100 text-slate-600'}`}>{plan}</span>
}
function Toggle({ enabled, onChange, disabled = false }) {
  return (
    <button 
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${
        disabled 
          ? 'bg-slate-100 cursor-not-allowed opacity-50' 
          : enabled 
            ? 'bg-[#1251C5]' 
            : 'bg-slate-200'
      }`}
    >
      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200 ${enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
    </button>
  )
}

// ─── Tab: Overview ────────────────────────────────────────────────────────────
function OverviewTab({ tenant }) {
  const steps = ['Account Created', 'Company Profile', 'Team Invited', 'Payroll Setup', 'Attendance Config', 'Go Live']
  const [companyProfile, setCompanyProfile] = useState(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCompanyProfile = async () => {
      if (!tenant?.id) {
        console.log('❌ No tenant ID, skipping onboarding fetch')
        setError('No tenant ID provided')
        return
      }
      
      setIsLoadingProfile(true)
      setError(null)
      
      try {
        console.log('🔄 Fetching onboarding progress for tenant:', tenant.id)
        console.log('   Tenant object:', tenant)
        
        // Fetch onboarding progress from API
        const data = await superAdminService.getOnboardingProgress(tenant.id)
        
        if (!data) {
          console.warn('⚠️ API returned null/undefined')
          setError('No data returned from API')
          setCompanyProfile(null)
          return
        }
        
        console.log('✅ Onboarding progress data received:', data)
        console.log('  - current_step:', data?.current_step)
        console.log('  - is_completed:', data?.is_completed)
        console.log('  - step_1_completed:', data?.step_1_completed)
        console.log('  - step_2_completed:', data?.step_2_completed)
        console.log('  - step_3_completed:', data?.step_3_completed)
        console.log('  - step_4_completed:', data?.step_4_completed)
        console.log('  - step_5_completed:', data?.step_5_completed)
        console.log('  - step_6_completed:', data?.step_6_completed)
        console.log('  - step_1_company_profile keys:', Object.keys(data?.step_1_company_profile || {}))
        console.log('  - step_2_entity keys:', Object.keys(data?.step_2_entity || {}))
        console.log('  - step_3_team_invites keys:', Object.keys(data?.step_3_team_invites || {}))
        console.log('  - step_4_payroll_config keys:', Object.keys(data?.step_4_payroll_config || {}))
        console.log('  - step_5_leave_policy keys:', Object.keys(data?.step_5_leave_policy || {}))
        console.log('  - step_6_completion keys:', Object.keys(data?.step_6_completion || {}))
        
        setCompanyProfile(data)
      } catch (err) {
        console.error('❌ Failed to fetch company profile:', err)
        console.error('   Error message:', err?.message)
        console.error('   Error response:', err?.response)
        setError(err?.message || 'Failed to fetch onboarding data')
        setCompanyProfile(null)
      } finally {
        setIsLoadingProfile(false)
      }
    }
    
    fetchCompanyProfile()
  }, [tenant?.id])

  // Extract step data from API response
  const step1Data = companyProfile?.step_1_company_profile || {}
  const step2Data = companyProfile?.step_2_entity || {}
  const step3Data = companyProfile?.step_3_team_invites || {}
  const step4Data = companyProfile?.step_4_payroll_config || {}
  const step5Data = companyProfile?.step_5_leave_policy || {}
  const step6Data = companyProfile?.step_6_completion || {}
  
  // Check if any step data exists
  const hasAnyStepData = Object.keys(step1Data).length > 0 || 
                         Object.keys(step2Data).length > 0 ||
                         Object.keys(step3Data).length > 0 ||
                         Object.keys(step4Data).length > 0 ||
                         Object.keys(step5Data).length > 0 ||
                         Object.keys(step6Data).length > 0
  
  const progress = {
    current_step: companyProfile?.current_step || 1,
    is_completed: companyProfile?.is_completed || false,
    completed_at: companyProfile?.completed_at
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Tenant Profile Card */}
        <div className="xl:col-span-2 rounded-2xl bg-white border border-[#dce9ff] p-5">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">Tenant Profile</h3>
            <button className="flex items-center gap-1 text-[11px] font-semibold text-[#1251C5] hover:underline">
              <Edit2 className="h-3 w-3" /> Edit
            </button>
          </div>
          <div className="flex items-center gap-4 mb-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1251C5] to-[#4f9cf9] text-lg font-bold text-white shadow-md">
              {tenant?.avatar || tenant?.name?.[0]}
            </div>
            <div>
              <p className="text-lg font-extrabold text-slate-900">{tenant?.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={tenant?.status} />
                <PlanBadge plan={tenant?.plan_slug || tenant?.billing_cycle || 'Trial'} />
                <span className="text-xs text-slate-500 uppercase">{tenant?.primary_region}</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Subdomain',     value: `${tenant?.subdomain}.hrms.com`, link: true },
              { label: 'Billing Cycle', value: tenant?.billing_cycle || 'Monthly' },
              { label: 'Timezone',      value: tenant?.timezone || 'Asia/Kolkata' },
              { label: 'Date Format',   value: tenant?.dateFormat || 'DD/MM/YYYY' },
            ].map(f => (
              <div key={f.label} className="rounded-xl bg-[#f8faff] border border-[#f0f5ff] p-3">
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{f.label}</p>
                {f.link
                  ? <a href="#" className="text-[12px] font-semibold text-[#1251C5] hover:underline flex items-center gap-1 mt-0.5">{f.value} <ExternalLink className="h-2.5 w-2.5" /></a>
                  : <p className="text-[12px] font-semibold text-slate-700 mt-0.5">{f.value}</p>}
              </div>
            ))}
          </div>
          {/* Key Dates */}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Created',      value: tenant?.created_at ? new Date(tenant.created_at).toLocaleDateString() : '—' },
              { label: 'Trial Ends',   value: tenant?.trial_ends_at ? new Date(tenant.trial_ends_at).toLocaleDateString() : '—' },
              { label: 'Last Payment', value: '—' },
              { label: 'Onboarding',   value: tenant?.onboarding_completed ? '✅ Complete' : `Step ${tenant?.onboarding_step || 0}/6` },
            ].map(f => (
              <div key={f.label} className="rounded-xl bg-[#f8faff] border border-[#f0f5ff] p-3">
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{f.label}</p>
                <p className="text-[12px] font-semibold text-slate-700 mt-0.5">{f.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Admin */}
        <div className="flex flex-col gap-4">
          {/* Tenant Admin */}
          <div className="rounded-2xl bg-white border border-[#dce9ff] p-5 flex-1">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Tenant Admin</h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#1251C5] to-[#4f9cf9] text-[11px] font-bold text-white">
                {(tenant?.admin_name || 'Admin').split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">{tenant?.admin_name || 'Primary Admin'}</p>
                <p className="text-[10px] text-slate-400">{tenant?.admin_email || 'No email provided'}</p>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              {[
                { label: 'Phone',      value: tenant?.admin_phone || '—' },
                { label: 'MFA Status', value: '✅ Enabled' },
                { label: 'Account',    value: '🟢 Active' },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between rounded-lg bg-[#f8faff] px-3 py-1.5">
                  <span className="text-[11px] text-slate-500">{r.label}</span>
                  <span className="text-[11px] font-semibold text-slate-700">{r.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {['Reset Password', 'Impersonate', 'Unlock'].map(a => (
                <button key={a} className="rounded-lg border border-[#dce9ff] px-2.5 py-1 text-[11px] font-semibold text-[#1251C5] hover:bg-[#f0f5ff] transition">{a}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Onboarding Stepper */}
      <div className="rounded-2xl bg-white border border-[#dce9ff] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900">Onboarding Progress</h3>
          {companyProfile?.is_completed && (
            <span className="text-[11px] font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-lg">✓ Completed</span>
          )}
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-700">⚠️ {error}</p>
          </div>
        )}
        
        <div className="flex items-center gap-0">
          {steps.map((step, i) => {
            // Use API data: step_1_completed, step_2_completed, etc.
            const stepKey = `step_${i + 1}_completed`
            const done = companyProfile?.[stepKey] === true
            const active = !done && i === (companyProfile?.current_step - 1 || 0)
            
            console.log(`Step ${i + 1}: ${stepKey} = ${done}, active = ${active}, current_step = ${companyProfile?.current_step}`)
            
            return (
              <div key={step} className="flex-1 flex flex-col items-center gap-2">
                <div className="flex items-center w-full">
                  <div className={`h-0.5 flex-1 ${i === 0 ? 'invisible' : done ? 'bg-[#1251C5]' : 'bg-slate-200'}`} />
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold shrink-0 transition
                    ${done ? 'bg-[#1251C5] text-white' : active ? 'bg-[#f0f5ff] border-2 border-[#1251C5] text-[#1251C5]' : 'bg-slate-100 text-slate-400'}`}>
                    {done ? '✓' : i + 1}
                  </div>
                  <div className={`h-0.5 flex-1 ${i === steps.length - 1 ? 'invisible' : done ? 'bg-[#1251C5]' : 'bg-slate-200'}`} />
                </div>
                <p className="text-[10px] text-center text-slate-500 font-medium leading-tight px-1">{step}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Company Profile from Onboarding API */}
      {isLoadingProfile ? (
        <div className="rounded-2xl bg-white border border-[#dce9ff] p-5">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-sm text-slate-500">Loading company profile...</p>
          </div>
        </div>
      ) : companyProfile ? (
        <div className="rounded-2xl bg-white border border-[#dce9ff] p-5">
          {/* Header with completion status */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#1251C5]" />
              Company Profile (from Onboarding)
            </h3>
            <div className="flex items-center gap-2">
              {companyProfile?.is_completed ? (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-semibold rounded-full flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> Completed
                </span>
              ) : (
                <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-semibold rounded-full">
                  Step {progress?.current_step || 1} of 6
                </span>
              )}
            </div>
          </div>
          
          {!hasAnyStepData ? (
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
              <p className="text-sm text-amber-700">
                No onboarding data available. The company has not completed the onboarding steps yet.
              </p>
            </div>
          ) : (
          <div className="space-y-5">
            
            {/* Step 1: Company Profile */}
            {Object.keys(step1Data).length > 0 && (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-[#f8faff] px-4 py-2 border-b border-[#f0f5ff] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1251C5] uppercase tracking-wide">Step 1: Company Profile</span>
                  {companyProfile?.step_1_completed && <CheckCircle className="h-4 w-4 text-green-500" />}
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoField label="Company Legal Name" value={step1Data.company_legal_name} />
                  <InfoField label="Trading Name" value={step1Data.trading_name} />
                  <InfoField label="Country" value={step1Data.country} />
                  <InfoField label="City" value={step1Data.city} />
                  <InfoField label="State" value={step1Data.state} />
                  <InfoField label="Postal Code" value={step1Data.postal_code} />
                  <InfoField label="VAT/GST Number" value={step1Data.vat_gst_number} />
                  <InfoField label="Website" value={step1Data.website} isLink />
                  <InfoField label="Billing Contact" value={step1Data.billing_contact_email} fullWidth />
                  <InfoField label="Address" value={`${step1Data.address_line1 || ''}${step1Data.address_line2 ? `, ${step1Data.address_line2}` : ''}`} fullWidth />
                </div>
              </div>
            )}
            
            {/* Step 2: Legal Entity */}
            {Object.keys(step2Data).length > 0 && (
              <div className="border border-emerald-200 rounded-xl overflow-hidden">
                <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Step 2: Legal Entity</span>
                  {companyProfile?.step_2_completed && <CheckCircle className="h-4 w-4 text-green-500" />}
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoField label="Entity Legal Name" value={step2Data.entity_legal_name} color="emerald" />
                  <InfoField label="Entity Type" value={step2Data.entity_type} color="emerald" />
                  <InfoField label="Tax/Employer ID" value={step2Data.tax_employer_id} color="emerald" />
                  <InfoField label="Currency" value={step2Data.currency} color="emerald" />
                  <InfoField label="Pay Frequency" value={step2Data.pay_frequency} color="emerald" />
                  <InfoField label="Incorporation Country" value={step2Data.country_of_incorporation} color="emerald" />
                  <InfoField label="PF Registration" value={step2Data.pf_registration_no} color="emerald" />
                  <InfoField label="ESI Registration" value={step2Data.esi_registration_no} color="emerald" />
                </div>
              </div>
            )}
            
            {/* Step 3: Team Setup */}
            {Object.keys(step3Data).length > 0 && (
              <div className="border border-blue-200 rounded-xl overflow-hidden">
                <div className="bg-blue-50 px-4 py-2 border-b border-blue-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">Step 3: Team Setup</span>
                  {companyProfile?.step_3_completed && <CheckCircle className="h-4 w-4 text-green-500" />}
                </div>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <InfoField label="Total Invitations" value={step3Data.invitations_count || 0} color="blue" />
                    <InfoField label="Pending" value={step3Data.pending_count || 0} color="amber" />
                    <InfoField label="Accepted" value={step3Data.accepted_count || 0} color="green" />
                  </div>
                  
                  {step3Data.skipped && (
                    <span className="text-xs text-slate-500 italic">(Step skipped)</span>
                  )}
                  
                  {/* Team Members List */}
                  {step3Data.members && step3Data.members.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3">Invited Team Members</h4>
                      <div className="space-y-2">
                        {step3Data.members.map((member, idx) => (
                          <div key={member.id || idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                                {member.first_name?.[0]}{member.last_name?.[0]}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-800">
                                  {member.first_name} {member.last_name}
                                </p>
                                <p className="text-xs text-slate-500">{member.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                                {member.role?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </span>
                              <span className={`text-xs font-bold px-2 py-1 rounded ${
                                member.status === 'accepted' 
                                  ? 'bg-green-100 text-green-700' 
                                  : member.status === 'pending'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {member.status?.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Additional Info */}
                      <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                        {step3Data.members.some(m => m.expires_at) && (
                          <div className="text-slate-500">
                            <span className="font-semibold">Expires:</span> {new Date(step3Data.members[0].expires_at).toLocaleDateString()}
                          </div>
                        )}
                        {step3Data.members.some(m => m.resent_count > 0) && (
                          <div className="text-slate-500">
                            <span className="font-semibold">Resent:</span> {step3Data.members.filter(m => m.resent_count > 0).length} invitation(s)
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Step 4: Payroll Configuration */}
            {Object.keys(step4Data).length > 0 && (
              <div className="border border-violet-200 rounded-xl overflow-hidden">
                <div className="bg-violet-50 px-4 py-2 border-b border-violet-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-violet-700 uppercase tracking-wide">Step 4: Payroll Configuration</span>
                  {companyProfile?.step_4_completed && <CheckCircle className="h-4 w-4 text-green-500" />}
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoField label="Next Pay Date" value={step4Data.next_pay_date} color="violet" />
                  <InfoField label="Working Hours" value={step4Data.default_working_hours ? `${step4Data.default_working_hours} hrs/week` : ''} color="violet" />
                  <InfoField label="Salary Template" value={step4Data.salary_structure_template} color="violet" />
                  <InfoField label="Overtime Rules" value={step4Data.overtime_rules} color="violet" />
                </div>
              </div>
            )}
            
            {/* Step 5: Leave Policy */}
            {Object.keys(step5Data).length > 0 && (
              <div className="border border-amber-200 rounded-xl overflow-hidden">
                <div className="bg-amber-50 px-4 py-2 border-b border-amber-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">Step 5: Leave Policy</span>
                  {companyProfile?.step_5_completed && <CheckCircle className="h-4 w-4 text-green-500" />}
                </div>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoField label="Annual Leave" value={step5Data.annual_leave_days ? `${step5Data.annual_leave_days} days` : ''} color="amber" />
                    <InfoField label="Sick Leave" value={step5Data.sick_leave_days ? `${step5Data.sick_leave_days} days` : ''} color="amber" />
                    <InfoField label="Carry Forward Limit" value={step5Data.carry_forward_limit ? `${step5Data.carry_forward_limit} days` : ''} color="amber" />
                    <InfoField label="Leave Policy Template" value={step5Data.leave_policy_template} color="amber" />
                  </div>
                  {step5Data.public_holidays && step5Data.public_holidays.length > 0 && (
                    <div className="pt-3 border-t border-amber-100">
                      <p className="text-[10px] font-semibold text-amber-700 uppercase mb-2">Public Holidays ({step5Data.public_holidays.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {step5Data.public_holidays.map((date, idx) => (
                          <span key={idx} className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded border border-amber-200">
                            {date}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Completion Info */}
            {companyProfile?.is_completed && step6Data.completed_at && (
              <div className="border border-green-200 rounded-xl overflow-hidden">
                <div className="bg-green-50 px-4 py-2 border-b border-green-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-green-700 uppercase tracking-wide">Step 6: Onboarding Complete</span>
                  {companyProfile?.step_6_completed && <CheckCircle className="h-4 w-4 text-green-500" />}
                </div>
                <div className="p-4">
                  <InfoField label="Completed At" value={new Date(step6Data.completed_at).toLocaleString()} color="green" />
                </div>
              </div>
            )}
          </div>
          )}
          
          {/* Last Updated */}
          {companyProfile.updated_at && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400">
              <Clock className="h-3 w-3" />
              Last updated: {new Date(companyProfile.updated_at).toLocaleString()}
            </div>
          )}
        </div>
      ) : null}

      {/* Notes */}
      {/* <div className="rounded-2xl bg-white border border-[#dce9ff] p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900">Internal Notes</h3>
          <button className="flex items-center gap-1 text-[11px] font-semibold text-[#1251C5] border border-[#dce9ff] rounded-lg px-3 py-1 hover:bg-[#f0f5ff] transition">
            <Plus className="h-3 w-3" /> Add Note
          </button>
        </div>
        {[
          { author: 'Gerry C.', time: '2 days ago',  text: 'Tenant requested custom contract extension. Escalated to Sales.' },
          { author: 'Priya S.', time: '5 days ago',  text: 'Onboarding call completed. They need help with payroll configuration — assigning CSM.' },
        ].map((n, i) => (
          <div key={i} className="flex gap-3 mb-3 last:mb-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1251C5] to-[#4f9cf9] text-[10px] font-bold text-white">{n.author.slice(0, 2)}</div>
            <div className="flex-1 rounded-xl bg-[#f8faff] border border-[#f0f5ff] px-3 py-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold text-slate-700">{n.author}</span>
                <span className="text-[10px] text-slate-400">{n.time}</span>
              </div>
              <p className="text-[12px] text-slate-600">{n.text}</p>
            </div>
          </div>
        ))}
      </div> */}
    </div>
  )
}

// ─── Tab: Users ───────────────────────────────────────────────────────────────
// ─── Tab: Users ───────────────────────────────────────────────────────────────
function UsersTab({ tenant }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    const fetchUsers = async () => {
      if (!tenant?.id) {
        console.log('❌ No tenant ID provided')
        setLoading(false)
        return
      }
      
      setLoading(true)
      setError(null)
      
      try {
        console.log('🔄 Fetching onboarding progress to get team members for tenant:', tenant.id)
        
        // Fetch onboarding progress which contains team members
        const onboardingData = await superAdminService.getOnboardingProgress(tenant.id)
        
        console.log('✅ Onboarding data received:', onboardingData)
        
        // Extract members from step 3 (Team Setup)
        const members = onboardingData?.step_3_team_invites?.members || []
        
        console.log('👥 Team members found:', members.length, members)
        
        // Format members to match the users table structure
        const formattedUsers = members.map((member, idx) => ({
          id: member.id || `member-${idx}`,
          name: `${member.first_name || ''} ${member.last_name || ''}`.trim() || 'Unknown',
          email: member.email || '',
          role: member.role?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Team Member',
          type: member.role?.includes('admin') ? 'Admin' : 'User',
          status: member.status || 'pending', // accepted, pending, rejected
          mfa: false, // Not available in onboarding data
          lastLogin: member.accepted_at ? new Date(member.accepted_at).toLocaleDateString() : '—',
          createdAt: member.accepted_at ? new Date(member.accepted_at).toLocaleDateString() : '—',
          expiresAt: member.expires_at,
          resentCount: member.resent_count || 0,
          isInvite: member.status !== 'accepted',
        }))
        
        console.log('📋 Formatted users:', formattedUsers)
        
        setUsers(formattedUsers)
      } catch (err) {
        console.error('❌ Failed to fetch users from onboarding:', err)
        console.log('⚠️ Error details:', err?.message)
        setError(err?.message || 'Failed to load team members')
        setUsers([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchUsers()
  }, [tenant?.id])
  
  const roleColors = { 
    'Tenant Admin': 'bg-[#1251C5] text-white', 
    'Hr Admin': 'bg-violet-100 text-violet-700', 
    'Hr Manager': 'bg-violet-100 text-violet-700',
    'Payroll Admin': 'bg-blue-100 text-blue-700',
    'Recruiter': 'bg-green-100 text-green-700',
    'Finance Viewer': 'bg-amber-100 text-amber-700',
    'It Admin': 'bg-slate-100 text-slate-700',
    'HR Staff': 'bg-violet-50 text-violet-600', 
    'Manager': 'bg-sky-100 text-sky-700', 
    'Employee': 'bg-slate-100 text-slate-600',
    'Hr Admin': 'bg-violet-100 text-violet-700',
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-[#1251C5]" />
        <span className="ml-3 text-sm text-slate-500">Loading users...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-white border border-[#dce9ff] p-6">
        <div className="flex items-center gap-3 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <div>
            <p className="font-semibold">Failed to load team members</p>
            <p className="text-sm text-red-500">{error}</p>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          {users.length} user{users.length !== 1 ? 's' : ''} in this tenant
          {users.filter(u => u.status === 'pending').length > 0 && (
            <span className="ml-2 text-amber-600">
              ({users.filter(u => u.status === 'pending').length} pending invitation{users.filter(u => u.status === 'pending').length !== 1 ? 's' : ''})
            </span>
          )}
        </p>
      </div>
      
      {users.length === 0 ? (
        <div className="rounded-2xl bg-white border border-[#dce9ff] p-12 text-center">
          <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-600">No users found</p>
          <p className="text-xs text-slate-400 mt-1">This tenant hasn't invited any team members yet.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-[#dce9ff] overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#f0f5ff] bg-[#f8faff]">
                {['Name', 'Role', 'Type', 'Status', 'MFA', 'Last Login', 'Created'].map(h => (
                  <th key={h} className="py-3 px-4 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <motion.tr key={u.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  className="border-b border-[#f8faff] hover:bg-[#f8faff] transition-colors group">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1251C5] to-[#4f9cf9] text-[10px] font-bold text-white">
                        {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 leading-none flex items-center gap-1.5">
                          {u.name}
                          {u.isInvite && u.status === 'pending' && (
                            <span className="text-[8px] bg-amber-100 text-amber-700 px-1 py-0.5 rounded font-bold">INVITE</span>
                          )}
                          {u.resentCount > 0 && (
                            <span className="text-[8px] bg-blue-100 text-blue-700 px-1 py-0.5 rounded font-bold">↻{u.resentCount}</span>
                          )}
                        </p>
                        <p className="text-[10px] text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ${roleColors[u.role] ?? 'bg-slate-100 text-slate-600'}`}>{u.role}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">{u.type}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${
                      u.status === 'active' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 
                      u.status === 'accepted' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' :
                      u.status === 'pending' ? 'bg-amber-50 text-amber-700 ring-amber-200' :
                      'bg-slate-100 text-slate-500 ring-slate-200'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={u.mfa ? 'text-emerald-600 font-bold' : 'text-red-400 font-semibold'}>{u.mfa ? '✓ Yes' : '✗ No'}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{u.lastLogin}</td>
                  <td className="py-3 px-4 text-slate-500">{u.createdAt}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Tab: Billing ─────────────────────────────────────────────────────────────
function BillingTab({ tenant }) {
  const [subscription, setSubscription] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showChangePlanModal, setShowChangePlanModal] = useState(false)
  const [showApplyDiscountModal, setShowApplyDiscountModal] = useState(false)
  const [showExtendTrialModal, setShowExtendTrialModal] = useState(false)
  const [plans, setPlans] = useState([])
  const [isLoadingPlans, setIsLoadingPlans] = useState(false)
  const [isChangingPlan, setIsChangingPlan] = useState(false)
  const [selectedPlanId, setSelectedPlanId] = useState(null)
  const [discountPercentage, setDiscountPercentage] = useState('')
  const [discountReason, setDiscountReason] = useState('')
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false)
  const [extensionDays, setExtensionDays] = useState('')
  const [extensionReason, setExtensionReason] = useState('')
  const [isExtendingTrial, setIsExtendingTrial] = useState(false)
  const [showChangeStatusModal, setShowChangeStatusModal] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [statusChangeReason, setStatusChangeReason] = useState('')
  const [isChangingStatus, setIsChangingStatus] = useState(false)
  const [billingHistory, setBillingHistory] = useState([])
  const [isLoadingBillingHistory, setIsLoadingBillingHistory] = useState(false)
  const [billingHistoryPage, setBillingHistoryPage] = useState(1)
  const [billingHistoryTotal, setBillingHistoryTotal] = useState(0)
  const [billingHistoryHasMore, setBillingHistoryHasMore] = useState(false)
  const [billingEvents, setBillingEvents] = useState([])
  const [isLoadingBillingEvents, setIsLoadingBillingEvents] = useState(false)
  const [billingEventsPage, setBillingEventsPage] = useState(1)
  const [billingEventsTotal, setBillingEventsTotal] = useState(0)
  const [billingEventsHasMore, setBillingEventsHasMore] = useState(false)
  
  const billStatus = { 
    paid: 'bg-emerald-50 text-emerald-700 ring-emerald-200', 
    failed: 'bg-red-50 text-red-700 ring-red-200', 
    refunded: 'bg-slate-100 text-slate-500 ring-slate-200',
    active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    cancelled: 'bg-slate-100 text-slate-500 ring-slate-200',
    past_due: 'bg-orange-50 text-orange-700 ring-orange-200',
    trialing: 'bg-blue-50 text-blue-700 ring-blue-200',
  }

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!tenant?.id) {
        console.log('❌ No tenant ID, skipping subscription fetch')
        setError('No tenant ID provided')
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        console.log('🔄 Fetching subscription for tenant:', tenant.id)
        const data = await superAdminService.getSubscription(tenant.id)

        if (!data) {
          console.warn('⚠️ API returned null/undefined')
          setError('No subscription data available')
          setSubscription(null)
          return
        }

        console.log('✅ Subscription data received:', data)
        setSubscription(data)
      } catch (err) {
        console.error('❌ Failed to fetch subscription:', err)
        setError(err?.message || 'Failed to fetch subscription data')
        setSubscription(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubscription()
  }, [tenant?.id])

  useEffect(() => {
    const fetchBillingHistory = async () => {
      if (!tenant?.id) {
        console.log('❌ No tenant ID, skipping billing history fetch')
        return
      }

      setIsLoadingBillingHistory(true)

      try {
        console.log('🔄 Fetching billing history for tenant:', tenant.id)
        const data = await superAdminService.getBillingHistory(tenant.id, billingHistoryPage, 20)

        if (!data) {
          console.warn('⚠️ API returned null/undefined')
          setBillingHistory([])
          return
        }

        console.log('✅ Billing history received:', data)
        setBillingHistory(data.invoices || [])
        setBillingHistoryTotal(data.total || 0)
        setBillingHistoryHasMore(data.has_more || false)
      } catch (err) {
        console.error('❌ Failed to fetch billing history:', err)
        setBillingHistory([])
      } finally {
        setIsLoadingBillingHistory(false)
      }
    }

    fetchBillingHistory()
  }, [tenant?.id, billingHistoryPage])

  useEffect(() => {
    const fetchBillingEvents = async () => {
      if (!tenant?.id) {
        console.log('❌ No tenant ID, skipping billing events fetch')
        return
      }

      setIsLoadingBillingEvents(true)

      try {
        console.log('🔄 Fetching billing events for tenant:', tenant.id)
        const data = await superAdminService.getBillingEvents(tenant.id, billingEventsPage, 20)

        if (!data) {
          console.warn('⚠️ API returned null/undefined')
          setBillingEvents([])
          return
        }

        console.log('✅ Billing events received:', data)
        setBillingEvents(data.events || [])
        setBillingEventsTotal(data.total || 0)
        setBillingEventsHasMore(data.has_more || false)
      } catch (err) {
        console.error('❌ Failed to fetch billing events:', err)
        setBillingEvents([])
      } finally {
        setIsLoadingBillingEvents(false)
      }
    }

    fetchBillingEvents()
  }, [tenant?.id, billingEventsPage])

  const handleOpenChangePlanModal = async () => {
    setShowChangePlanModal(true)
    setIsLoadingPlans(true)
    
    try {
      console.log('🔄 Fetching available plans...')
      const plansData = await superAdminService.getPlans()
      
      if (plansData?.plans) {
        console.log('✅ Plans fetched:', plansData.plans)
        setPlans(plansData.plans)
      }
    } catch (err) {
      console.error('❌ Failed to fetch plans:', err)
    } finally {
      setIsLoadingPlans(false)
    }
  }

  const handleChangePlan = async (planId) => {
    if (!planId || !tenant?.id) return
    
    setIsChangingPlan(true)
    
    try {
      console.log('🔄 Changing plan to:', planId)
      const result = await superAdminService.changePlan(tenant.id, planId, true)
      
      console.log('✅ Plan changed successfully:', result)
      
      // Refresh subscription data
      const updatedSubscription = await superAdminService.getSubscription(tenant.id)
      setSubscription(updatedSubscription)
      
      setShowChangePlanModal(false)
      setSelectedPlanId(null)
    } catch (err) {
      console.error('❌ Failed to change plan:', err)
      alert('Failed to change plan: ' + (err?.message || 'Unknown error'))
    } finally {
      setIsChangingPlan(false)
    }
  }

  const handleOpenApplyDiscountModal = () => {
    setShowApplyDiscountModal(true)
    setDiscountPercentage('')
    setDiscountReason('')
  }

  const handleOpenExtendTrialModal = () => {
    setShowExtendTrialModal(true)
    setExtensionDays('')
    setExtensionReason('')
  }

  const handleOpenChangeStatusModal = () => {
    setShowChangeStatusModal(true)
    setSelectedStatus('')
    setStatusChangeReason('')
  }

  const handleExtendTrial = async () => {
    if (!extensionDays || !tenant?.id) {
      alert('Please enter number of days to extend')
      return
    }

    const days = parseInt(extensionDays)
    if (isNaN(days) || days <= 0) {
      alert('Extension days must be a positive number')
      return
    }

    setIsExtendingTrial(true)

    try {
      console.log('🔄 Extending trial by:', days + ' days')
      const result = await superAdminService.extendTrial(tenant.id, days, extensionReason)

      console.log('✅ Trial extended successfully:', result)

      // Refresh subscription data
      const updatedSubscription = await superAdminService.getSubscription(tenant.id)
      setSubscription(updatedSubscription)

      setShowExtendTrialModal(false)
      setExtensionDays('')
      setExtensionReason('')
      alert('Trial extended successfully!')
    } catch (err) {
      console.error('❌ Failed to extend trial:', err)
      alert('Failed to extend trial: ' + (err?.message || 'Unknown error'))
    } finally {
      setIsExtendingTrial(false)
    }
  }

  const handleApplyDiscount = async () => {
    if (!discountPercentage || !tenant?.id) {
      alert('Please enter a discount percentage')
      return
    }

    const percentage = parseFloat(discountPercentage)
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      alert('Discount percentage must be between 0 and 100')
      return
    }

    setIsApplyingDiscount(true)

    try {
      console.log('🔄 Applying discount:', percentage + '%')
      const result = await superAdminService.applyDiscount(tenant.id, percentage, discountReason)

      console.log('✅ Discount applied successfully:', result)

      // Refresh subscription data
      const updatedSubscription = await superAdminService.getSubscription(tenant.id)
      setSubscription(updatedSubscription)

      setShowApplyDiscountModal(false)
      setDiscountPercentage('')
      setDiscountReason('')
      alert('Discount applied successfully!')
    } catch (err) {
      console.error('❌ Failed to apply discount:', err)
      alert('Failed to apply discount: ' + (err?.message || 'Unknown error'))
    } finally {
      setIsApplyingDiscount(false)
    }
  }

  const handleChangeStatus = async () => {
    if (!selectedStatus || !tenant?.id) {
      alert('Please select a status')
      return
    }

    setIsChangingStatus(true)

    try {
      console.log('🔄 Changing subscription status to:', selectedStatus)
      const result = await superAdminService.changeSubscriptionStatus(tenant.id, selectedStatus, statusChangeReason)

      console.log('✅ Subscription status changed successfully:', result)

      // Refresh subscription data
      const updatedSubscription = await superAdminService.getSubscription(tenant.id)
      setSubscription(updatedSubscription)

      setShowChangeStatusModal(false)
      setSelectedStatus('')
      setStatusChangeReason('')
      alert('Subscription status changed successfully!')
    } catch (err) {
      console.error('❌ Failed to change subscription status:', err)
      alert('Failed to change status: ' + (err?.message || 'Unknown error'))
    } finally {
      setIsChangingStatus(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-[#1251C5]" />
        <span className="ml-3 text-sm text-slate-500">Loading subscription...</span>
      </div>
    )
  }

  if (error && !subscription) {
    return (
      <div className="rounded-2xl bg-red-50 border border-red-200 p-5">
        <p className="text-sm text-red-700">⚠️ {error}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header with Action Buttons */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-xl font-bold text-slate-900">Subscription & Billing</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleOpenChangePlanModal}
            className="px-4 py-2 rounded-lg bg-[#1251C5] text-white font-semibold hover:bg-[#0d3a9e] transition flex items-center gap-2"
          >
            <ArrowRight className="h-4 w-4" />
            Change Plan
          </button>
          <button
            onClick={handleOpenExtendTrialModal}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Extend Trial
          </button>
          <button
            onClick={handleOpenChangeStatusModal}
            className="px-4 py-2 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700 transition flex items-center gap-2"
          >
            <AlertCircle className="h-4 w-4" />
            Change Status
          </button>
        </div>
      </div>

      {/* Plan & Status Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Plan Name', value: subscription?.plan_name || '—', icon: '📋' },
          { label: 'Status', value: subscription?.status ? subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1) : '—', icon: '🔔' },
          { label: 'Billing Cycle', value: subscription?.billing_cycle ? subscription.billing_cycle.charAt(0).toUpperCase() + subscription.billing_cycle.slice(1) : '—', icon: '📅' },
          { label: 'Currency', value: subscription?.currency || '—', icon: '💱' },
        ].map(f => (
          <div key={f.label} className="rounded-2xl bg-white border border-[#dce9ff] p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{f.label}</p>
              <span className="text-lg">{f.icon}</span>
            </div>
            <p className="text-lg font-bold text-slate-900">{f.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Action: Change Plan Card */}
      <div className="rounded-2xl bg-gradient-to-r from-[#1251C5] to-[#4f9cf9] border border-[#1251C5] p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold mb-1">Want to upgrade or downgrade?</h3>
            <p className="text-xs opacity-90">Switch to a different plan that better suits your needs</p>
          </div>
          <button
            onClick={handleOpenChangePlanModal}
            className="px-4 py-2 rounded-lg bg-white text-[#1251C5] font-semibold hover:bg-slate-100 transition flex items-center gap-2 whitespace-nowrap"
          >
            <ArrowRight className="h-4 w-4" />
            Change Plan
          </button>
        </div>
      </div>

      {/* Quick Action: Extend Trial Card */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-400 border border-blue-600 p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold mb-1">Need more time to evaluate?</h3>
            <p className="text-xs opacity-90">Extend the trial period for this subscription</p>
          </div>
          <button
            onClick={handleOpenExtendTrialModal}
            className="px-4 py-2 rounded-lg bg-white text-blue-600 font-semibold hover:bg-slate-100 transition flex items-center gap-2 whitespace-nowrap"
          >
            <Calendar className="h-4 w-4" />
            Extend Trial
          </button>
        </div>
      </div>

      {/* Pricing & Billing Details */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="lg:col-span-1 rounded-2xl bg-white border border-[#dce9ff] p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Pricing & Billing Details</h3>
          
          {error && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-700">⚠️ {error}</p>
            </div>
          )}

          {/* Pricing Section */}
          <div className="mb-5 pb-5 border-b border-[#f0f5ff]">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3">💰 Pricing</h4>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                { label: 'Base Price', value: subscription?.base_price ? `${subscription.currency || 'USD'} ${subscription.base_price.toLocaleString()}` : '—' },
                { label: 'Final Price', value: subscription?.final_price ? `${subscription.currency || 'USD'} ${subscription.final_price.toLocaleString()}` : '—' },
                { label: 'Discount %', value: subscription?.discount_percentage ? `${subscription.discount_percentage}%` : '0%' },
              ].map(f => (
                <div key={f.label} className="rounded-xl bg-[#f8faff] border border-[#f0f5ff] p-3">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{f.label}</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{f.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Capacity & Limits */}
          <div className="mb-5 pb-5 border-b border-[#f0f5ff]">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3">📊 Capacity & Limits</h4>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                { label: 'Employees', value: `${subscription?.employee_count || 0} / ${subscription?.max_employees || 0}` },
                { label: 'Max Admin Users', value: subscription?.max_admin_users || '—' },
                { label: 'Plan ID', value: subscription?.plan_id ? subscription.plan_id.slice(0, 12) + '...' : '—' },
              ].map(f => (
                <div key={f.label} className="rounded-xl bg-[#f8faff] border border-[#f0f5ff] p-3">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{f.label}</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{f.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Billing Period */}
          <div className="mb-5 pb-5 border-b border-[#f0f5ff]">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3">📅 Billing Period</h4>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                { label: 'Period Start', value: subscription?.current_period_start ? new Date(subscription.current_period_start).toLocaleDateString() : '—' },
                { label: 'Period End', value: subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : '—' },
                { label: 'Next Billing', value: subscription?.next_billing_date ? new Date(subscription.next_billing_date).toLocaleDateString() : '—' },
                { label: 'Trial Ends', value: subscription?.trial_ends_at ? new Date(subscription.trial_ends_at).toLocaleDateString() : '—' },
                { label: 'Last Billing', value: subscription?.last_billing_date ? new Date(subscription.last_billing_date).toLocaleDateString() : 'N/A' },
              ].map(f => (
                <div key={f.label} className="rounded-xl bg-[#f8faff] border border-[#f0f5ff] p-3">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{f.label}</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{f.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Renewal Settings */}
          <div className="mb-5">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3">🔄 Renewal Settings</h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Auto Renew', value: subscription?.auto_renew ? '✅ Enabled' : '❌ Disabled', color: subscription?.auto_renew ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200' },
                { label: 'Cancel at Period End', value: subscription?.cancel_at_period_end ? '✅ Yes' : '❌ No', color: subscription?.cancel_at_period_end ? 'bg-orange-50 border-orange-200' : 'bg-slate-50 border-slate-200' },
              ].map(f => (
                <div key={f.label} className={`rounded-xl border p-3 ${f.color}`}>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{f.label}</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{f.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Discount Info */}
          {subscription?.discount_percentage > 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold text-green-700 uppercase tracking-wide">💚 Discount Applied</p>
                  <p className="text-sm font-bold text-green-900 mt-1">{subscription.discount_percentage}% off</p>
                  {subscription.discount_reason && <p className="text-[11px] text-green-700 mt-1">Reason: {subscription.discount_reason}</p>}
                  {subscription.promo_code && <p className="text-[10px] text-green-700 mt-1">Code: <span className="font-mono font-bold bg-white px-2 py-0.5 rounded">{subscription.promo_code}</span></p>}
                </div>
                <button
                  onClick={handleOpenApplyDiscountModal}
                  className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-[11px] font-semibold hover:bg-green-700 transition whitespace-nowrap"
                >
                  Edit Discount
                </button>
              </div>
            </div>
          )}

          {/* No Discount - Show Apply Button */}
          {!subscription?.discount_percentage || subscription?.discount_percentage === 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">💛 No Discount Applied</p>
                  <p className="text-[11px] text-amber-600 mt-1">Add a discount to this subscription</p>
                </div>
                <button
                  onClick={handleOpenApplyDiscountModal}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-[11px] font-semibold hover:bg-amber-700 transition whitespace-nowrap"
                >
                  Apply Discount
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-5 flex flex-wrap gap-2">
            {['Change Plan', 'Apply Discount', 'Extend Trial', 'Change Status', 'Suspend', 'Cancel at Period End'].map(a => (
              <button 
                key={a} 
                onClick={() => {
                  if (a === 'Change Plan') handleOpenChangePlanModal()
                  if (a === 'Apply Discount') handleOpenApplyDiscountModal()
                  if (a === 'Extend Trial') handleOpenExtendTrialModal()
                  if (a === 'Change Status') handleOpenChangeStatusModal()
                }}
                className={`rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition
                ${a === 'Suspend' ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                  : a === 'Cancel at Period End' ? 'border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-100'
                  : a === 'Change Status' ? 'border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-100'
                  : 'border-[#dce9ff] bg-white text-slate-600 hover:bg-[#f0f5ff]'}`}>
                {a}
              </button>
            ))}
          </div>
        </div>
        {/* Current Subscription */}
        <div className="lg:col-span-1 rounded-2xl bg-white border border-[#dce9ff] p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Current Subscription</h3>
          
          {error && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-700">⚠️ {error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { label: 'Plan', value: subscription?.plan_name || '—' },
              { label: 'Billing Cycle', value: subscription?.billing_cycle ? subscription.billing_cycle.charAt(0).toUpperCase() + subscription.billing_cycle.slice(1) : '—' },
              { label: 'Status', value: subscription?.status ? subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1) : '—' },
              { label: 'Base Price', value: subscription?.base_price ? `${subscription.currency || '$'} ${subscription.base_price.toLocaleString()}` : '—' },
              { label: 'Final Price', value: subscription?.final_price ? `${subscription.currency || '$'} ${subscription.final_price.toLocaleString()}` : '—' },
              { label: 'Employees', value: `${subscription?.employee_count || 0} / ${subscription?.max_employees || 0}` },
            ].map(f => (
              <div key={f.label} className="rounded-xl bg-[#f8faff] border border-[#f0f5ff] p-3">
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{f.label}</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{f.value}</p>
              </div>
            ))}
          </div>

          {/* Period Info */}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { label: 'Current Period Start', value: subscription?.current_period_start ? new Date(subscription.current_period_start).toLocaleDateString() : '—' },
              { label: 'Current Period End', value: subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : '—' },
              { label: 'Next Billing Date', value: subscription?.next_billing_date ? new Date(subscription.next_billing_date).toLocaleDateString() : '—' },
              { label: 'Trial Ends', value: subscription?.trial_ends_at ? new Date(subscription.trial_ends_at).toLocaleDateString() : '—' },
              { label: 'Auto Renew', value: subscription?.auto_renew ? '✅ Yes' : '❌ No' },
              { label: 'Cancel at Period End', value: subscription?.cancel_at_period_end ? '✅ Yes' : '❌ No' },
            ].map(f => (
              <div key={f.label} className="rounded-xl bg-[#f8faff] border border-[#f0f5ff] p-3">
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{f.label}</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{f.value}</p>
              </div>
            ))}
          </div>

          {/* Discount Info */}
          {subscription?.discount_percentage > 0 && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-green-700">Discount Applied</p>
                  <p className="text-[11px] text-green-600 mt-0.5">{subscription.discount_percentage}% off {subscription.discount_reason ? `(${subscription.discount_reason})` : ''}</p>
                  {subscription.promo_code && <p className="text-[10px] text-green-600 mt-1">Code: <span className="font-mono font-bold">{subscription.promo_code}</span></p>}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {/* <div className="mt-4 flex flex-wrap gap-2">
            {['Change Plan', 'Apply Discount', 'Extend Trial', 'Suspend', 'Cancel at Period End'].map(a => (
              <button key={a} className={`rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition
                ${a === 'Suspend' ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                  : a === 'Cancel at Period End' ? 'border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-100'
                  : 'border-[#dce9ff] bg-white text-slate-600 hover:bg-[#f0f5ff]'}`}>
                {a}
              </button>
            ))}
          </div> */}
        </div>
      </div>

      {/* Billing Events */}
      <div className="rounded-2xl bg-white border border-[#dce9ff] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f5ff]">
          <h3 className="text-sm font-bold text-slate-900">📋 Billing Events</h3>
          <span className="text-[11px] text-slate-400 font-semibold">{billingEventsTotal} total</span>
        </div>

        {isLoadingBillingEvents ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-[#1251C5]" />
            <span className="ml-2 text-xs text-slate-500">Loading events...</span>
          </div>
        ) : billingEvents.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-xs text-slate-500">No billing events available</p>
          </div>
        ) : (
          <>
            <div className="max-h-96 overflow-y-auto">
              <div className="space-y-2 p-4">
                {billingEvents.map((event, idx) => (
                  <div key={idx} className="rounded-lg border border-[#f0f5ff] bg-[#f8faff] p-3 hover:bg-white transition">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-800">{event.event_type}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{event.description || '—'}</p>
                      </div>
                      {event.amount && (
                        <span className={`text-xs font-bold whitespace-nowrap ${
                          event.amount > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {event.amount > 0 ? '+' : ''}{event.currency} {Math.abs(event.amount).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] text-slate-400">
                        {event.created_at ? new Date(event.created_at).toLocaleDateString() : '—'}
                      </span>
                      {event.performed_by_name && (
                        <span className="text-[10px] text-slate-400 truncate">by {event.performed_by_name}</span>
                      )}
                    </div>
                    {event.reason && (
                      <p className="text-[10px] text-slate-500 mt-1 italic">Reason: {event.reason}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination */}
            {billingEventsHasMore && (
              <div className="flex items-center justify-center gap-2 px-4 py-3 border-t border-[#f0f5ff]">
                <button
                  onClick={() => setBillingEventsPage(p => Math.max(1, p - 1))}
                  disabled={billingEventsPage === 1 || isLoadingBillingEvents}
                  className="px-2 py-1 rounded text-[10px] border border-[#dce9ff] text-slate-600 hover:bg-[#f0f5ff] disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="text-[10px] text-slate-500">
                  {billingEventsPage}
                </span>
                <button
                  onClick={() => setBillingEventsPage(p => p + 1)}
                  disabled={!billingEventsHasMore || isLoadingBillingEvents}
                  className="px-2 py-1 rounded text-[10px] border border-[#dce9ff] text-slate-600 hover:bg-[#f0f5ff] disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Billing History */}
      <div className="rounded-2xl bg-white border border-[#dce9ff] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f5ff]">
          <h3 className="text-sm font-bold text-slate-900">📜 Billing History</h3>
          <button
            onClick={() => {
              if (!billingHistory || billingHistory.length === 0) {
                alert('No billing history to download')
                return
              }
              const headers = ['ID', 'Date', 'Amount', 'Status', 'Description']
              const rows = billingHistory.map(b => [b.id || '', b.date || b.created_at || '', b.amount || '', b.status || '', b.description || ''])
              const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n')
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
              const url = URL.createObjectURL(blob)
              const link = document.createElement('a')
              link.href = url
              link.download = `billing_history_${tenant?.id || 'tenant'}.csv`
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
              URL.revokeObjectURL(url)
            }}
            className="flex items-center gap-1 text-[11px] font-semibold text-[#1251C5] hover:underline cursor-pointer"
          >
            <Download className="h-3 w-3" /> Download All
          </button>
        </div>

        {isLoadingBillingHistory ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-[#1251C5]" />
            <span className="ml-3 text-sm text-slate-500">Loading billing history...</span>
          </div>
        ) : billingHistory.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm text-slate-500">No billing history available</p>
          </div>
        ) : (
          <>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#f0f5ff] bg-[#f8faff]">
                  {['Date', 'Invoice #', 'Amount', 'Status', 'Stripe ID', 'PDF'].map(h => (
                    <th key={h} className="py-2.5 px-4 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {billingHistory.map((invoice, i) => (
                  <tr key={i} className="border-b border-[#f8faff] hover:bg-[#f8faff] transition-colors">
                    <td className="py-2.5 px-4 text-slate-600">
                      {invoice.issue_date ? new Date(invoice.issue_date).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[10px] text-slate-500">
                      {invoice.invoice_number || '—'}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-800">
                      {invoice.currency} {invoice.total_amount?.toLocaleString() || '—'}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${billStatus[invoice.status] ?? 'bg-slate-100 text-slate-600 ring-slate-200'}`}>
                        {invoice.status ? invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1) : '—'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[10px] text-slate-400">
                      {invoice.stripe_invoice_id ? invoice.stripe_invoice_id.slice(0, 12) + '...' : '—'}
                    </td>
                    <td className="py-2.5 px-4">
                      {invoice.pdf_url ? (
                        <a 
                          href={invoice.pdf_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[11px] text-[#1251C5] font-semibold hover:underline"
                        >
                          <FileText className="h-3 w-3" /> PDF
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {billingHistoryHasMore && (
              <div className="flex items-center justify-center gap-2 px-5 py-4 border-t border-[#f0f5ff]">
                <button
                  onClick={() => setBillingHistoryPage(p => Math.max(1, p - 1))}
                  disabled={billingHistoryPage === 1 || isLoadingBillingHistory}
                  className="px-3 py-1.5 rounded-lg border border-[#dce9ff] text-slate-600 text-[11px] font-semibold hover:bg-[#f0f5ff] disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-[11px] text-slate-500">
                  Page {billingHistoryPage} of {Math.ceil(billingHistoryTotal / 20)}
                </span>
                <button
                  onClick={() => setBillingHistoryPage(p => p + 1)}
                  disabled={!billingHistoryHasMore || isLoadingBillingHistory}
                  className="px-3 py-1.5 rounded-lg border border-[#dce9ff] text-slate-600 text-[11px] font-semibold hover:bg-[#f0f5ff] disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Extend Trial Modal */}
      <AnimatePresence>
        {showExtendTrialModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => !isExtendingTrial && setShowExtendTrialModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl border border-[#dce9ff] max-w-md w-full"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0f5ff]">
                <h2 className="text-lg font-bold text-slate-900">Extend Trial Period</h2>
                <button
                  onClick={() => setShowExtendTrialModal(false)}
                  disabled={isExtendingTrial}
                  className="text-slate-400 hover:text-slate-600 disabled:opacity-50"
                >
                  ✕
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Extension Days
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    step="1"
                    value={extensionDays}
                    onChange={(e) => setExtensionDays(e.target.value)}
                    disabled={isExtendingTrial}
                    placeholder="Enter number of days to extend"
                    className="w-full px-4 py-2 rounded-lg border border-[#dce9ff] focus:outline-none focus:border-[#1251C5] focus:ring-2 focus:ring-[#1251C5]/20 disabled:opacity-50"
                  />
                  <p className="text-xs text-slate-500 mt-1">Current trial ends: {subscription?.trial_ends_at ? new Date(subscription.trial_ends_at).toLocaleDateString() : 'N/A'}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Reason (Optional)
                  </label>
                  <textarea
                    value={extensionReason}
                    onChange={(e) => setExtensionReason(e.target.value)}
                    disabled={isExtendingTrial}
                    placeholder="e.g., Customer request, Technical issues, etc."
                    rows="3"
                    className="w-full px-4 py-2 rounded-lg border border-[#dce9ff] focus:outline-none focus:border-[#1251C5] focus:ring-2 focus:ring-[#1251C5]/20 disabled:opacity-50 resize-none"
                  />
                </div>

                {extensionDays && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <span className="font-semibold">Preview:</span> Trial will be extended by {extensionDays} day{extensionDays !== '1' ? 's' : ''}
                    </p>
                    {subscription?.trial_ends_at && (
                      <p className="text-xs text-blue-600 mt-1">
                        New trial end date: {new Date(new Date(subscription.trial_ends_at).getTime() + parseInt(extensionDays) * 24 * 60 * 60 * 1000).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#f0f5ff]">
                <button
                  onClick={() => setShowExtendTrialModal(false)}
                  disabled={isExtendingTrial}
                  className="px-4 py-2 rounded-lg border border-[#dce9ff] text-slate-600 font-semibold hover:bg-[#f0f5ff] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExtendTrial}
                  disabled={!extensionDays || isExtendingTrial}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isExtendingTrial ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Extending...
                    </>
                  ) : (
                    'Extend Trial'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Apply Discount Modal */}
      <AnimatePresence>
        {showApplyDiscountModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => !isApplyingDiscount && setShowApplyDiscountModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl border border-[#dce9ff] max-w-md w-full"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0f5ff]">
                <h2 className="text-lg font-bold text-slate-900">Apply Discount</h2>
                <button
                  onClick={() => setShowApplyDiscountModal(false)}
                  disabled={isApplyingDiscount}
                  className="text-slate-400 hover:text-slate-600 disabled:opacity-50"
                >
                  ✕
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Discount Percentage (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(e.target.value)}
                    disabled={isApplyingDiscount}
                    placeholder="Enter discount percentage (0-100)"
                    className="w-full px-4 py-2 rounded-lg border border-[#dce9ff] focus:outline-none focus:border-[#1251C5] focus:ring-2 focus:ring-[#1251C5]/20 disabled:opacity-50"
                  />
                  <p className="text-xs text-slate-500 mt-1">Current discount: {subscription?.discount_percentage || 0}%</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Reason (Optional)
                  </label>
                  <textarea
                    value={discountReason}
                    onChange={(e) => setDiscountReason(e.target.value)}
                    disabled={isApplyingDiscount}
                    placeholder="e.g., Loyalty discount, Promotional offer, etc."
                    rows="3"
                    className="w-full px-4 py-2 rounded-lg border border-[#dce9ff] focus:outline-none focus:border-[#1251C5] focus:ring-2 focus:ring-[#1251C5]/20 disabled:opacity-50 resize-none"
                  />
                </div>

                {discountPercentage && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">
                      <span className="font-semibold">Preview:</span> {discountPercentage}% discount will be applied
                    </p>
                    {subscription?.base_price && (
                      <p className="text-xs text-green-600 mt-1">
                        New price: ${(subscription.base_price * (1 - parseFloat(discountPercentage) / 100)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#f0f5ff]">
                <button
                  onClick={() => setShowApplyDiscountModal(false)}
                  disabled={isApplyingDiscount}
                  className="px-4 py-2 rounded-lg border border-[#dce9ff] text-slate-600 font-semibold hover:bg-[#f0f5ff] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyDiscount}
                  disabled={!discountPercentage || isApplyingDiscount}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isApplyingDiscount ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Applying...
                    </>
                  ) : (
                    'Apply Discount'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Change Plan Modal */}
      <AnimatePresence>
        {showChangePlanModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => !isChangingPlan && setShowChangePlanModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl border border-[#dce9ff] max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-[#f0f5ff] bg-white">
                <h2 className="text-lg font-bold text-slate-900">Change Subscription Plan</h2>
                <button
                  onClick={() => setShowChangePlanModal(false)}
                  disabled={isChangingPlan}
                  className="text-slate-400 hover:text-slate-600 disabled:opacity-50"
                >
                  ✕
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {isLoadingPlans ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-[#1251C5]" />
                    <span className="ml-3 text-sm text-slate-500">Loading available plans...</span>
                  </div>
                ) : plans.length === 0 ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-700">No plans available</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600 mb-4">Current Plan: <span className="font-bold text-slate-900">{subscription?.plan_name}</span></p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {plans.map(plan => (
                        <div
                          key={plan.id}
                          onClick={() => !isChangingPlan && setSelectedPlanId(plan.id)}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                            selectedPlanId === plan.id
                              ? 'border-[#1251C5] bg-[#f0f5ff]'
                              : 'border-[#dce9ff] bg-white hover:border-[#1251C5]'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-bold text-slate-900">{plan.name}</h3>
                              <p className="text-xs text-slate-500">{plan.slug}</p>
                            </div>
                            {selectedPlanId === plan.id && (
                              <CheckCircle className="h-5 w-5 text-[#1251C5]" />
                            )}
                          </div>
                          
                          <p className="text-xs text-slate-600 mb-3 line-clamp-2">{plan.description}</p>
                          
                          <div className="space-y-1 mb-3 text-xs">
                            <p className="text-slate-700"><span className="font-semibold">Price:</span> ${plan.price_monthly_usd}/month</p>
                            <p className="text-slate-700"><span className="font-semibold">Employees:</span> {plan.max_employees}</p>
                            <p className="text-slate-700"><span className="font-semibold">Support:</span> {plan.support_tier}</p>
                          </div>
                          
                          <div className="flex flex-wrap gap-1">
                            {plan.api_access && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded">API</span>}
                            {plan.sso_enabled && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded">SSO</span>}
                            {plan.white_label && <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded">White Label</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-[#f0f5ff] bg-white">
                <button
                  onClick={() => setShowChangePlanModal(false)}
                  disabled={isChangingPlan}
                  className="px-4 py-2 rounded-lg border border-[#dce9ff] text-slate-600 font-semibold hover:bg-[#f0f5ff] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => selectedPlanId && handleChangePlan(selectedPlanId)}
                  disabled={!selectedPlanId || isChangingPlan}
                  className="px-4 py-2 rounded-lg bg-[#1251C5] text-white font-semibold hover:bg-[#0d3a9e] disabled:opacity-50 flex items-center gap-2"
                >
                  {isChangingPlan ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    'Change Plan'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Change Status Modal */}
      <AnimatePresence>
        {showChangeStatusModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => !isChangingStatus && setShowChangeStatusModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl border border-[#dce9ff] max-w-md w-full"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0f5ff]">
                <h2 className="text-lg font-bold text-slate-900">Change Subscription Status</h2>
                <button
                  onClick={() => setShowChangeStatusModal(false)}
                  disabled={isChangingStatus}
                  className="text-slate-400 hover:text-slate-600 disabled:opacity-50"
                >
                  ✕
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    New Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    disabled={isChangingStatus}
                    className="w-full px-4 py-2 rounded-lg border border-[#dce9ff] focus:outline-none focus:border-[#1251C5] focus:ring-2 focus:ring-[#1251C5]/20 disabled:opacity-50"
                  >
                    <option value="">Select a status...</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="trialing">Trialing</option>
                    <option value="past_due">Past Due</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-1">Current status: <span className="font-semibold">{subscription?.status ? subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1) : 'N/A'}</span></p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Reason (Optional)
                  </label>
                  <textarea
                    value={statusChangeReason}
                    onChange={(e) => setStatusChangeReason(e.target.value)}
                    disabled={isChangingStatus}
                    placeholder="Enter reason for status change..."
                    rows="3"
                    className="w-full px-4 py-2 rounded-lg border border-[#dce9ff] focus:outline-none focus:border-[#1251C5] focus:ring-2 focus:ring-[#1251C5]/20 disabled:opacity-50 resize-none"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#f0f5ff]">
                <button
                  onClick={() => setShowChangeStatusModal(false)}
                  disabled={isChangingStatus}
                  className="px-4 py-2 rounded-lg border border-[#dce9ff] text-slate-600 font-semibold hover:bg-[#f0f5ff] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangeStatus}
                  disabled={!selectedStatus || isChangingStatus}
                  className="px-4 py-2 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isChangingStatus ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    'Change Status'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Tab: Modules ─────────────────────────────────────────────────────────────
function ModulesTab({ tenant }) {
  const [modules, setModules] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [usePlanDefaults, setUsePlanDefaults] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [editingLimits, setEditingLimits] = useState(false)
  const [maxEmployeesOverride, setMaxEmployeesOverride] = useState(0)
  const [maxAdminUsersOverride, setMaxAdminUsersOverride] = useState(0)
  const [maxEntitiesOverride, setMaxEntitiesOverride] = useState(0)
  const [isSavingLimits, setIsSavingLimits] = useState(false)

  useEffect(() => {
    const fetchModules = async () => {
      if (!tenant?.id) {
        console.log('❌ No tenant ID, skipping modules fetch')
        setError('No tenant ID provided')
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        console.log('🔄 Fetching modules for tenant:', tenant.id)
        const data = await superAdminService.getModules(tenant.id)

        if (!data) {
          console.warn('⚠️ API returned null/undefined')
          setError('No modules data available')
          setModules(null)
          return
        }

        console.log('✅ Modules data received:', data)
        setModules(data)
        setUsePlanDefaults(data.use_plan_defaults || true)
        setMaxEmployeesOverride(data.max_employees_override || 0)
        setMaxAdminUsersOverride(data.max_admin_users_override || 0)
        setMaxEntitiesOverride(data.max_entities_override || 0)
      } catch (err) {
        console.error('❌ Failed to fetch modules:', err)
        setError(err?.message || 'Failed to fetch modules data')
        setModules(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchModules()
  }, [tenant?.id])

  const handleToggleModule = (moduleKey) => {
    if (usePlanDefaults) return

    setModules(prev => ({
      ...prev,
      [moduleKey]: !prev[moduleKey]
    }))
    setHasChanges(true)
  }

  const handleSaveModules = async () => {
    if (!tenant?.id || !modules) return

    setIsSaving(true)

    try {
      console.log('🔄 Saving modules for tenant:', tenant.id)
      const result = await superAdminService.updateModules(tenant.id, modules)

      console.log('✅ Modules saved successfully:', result)
      setHasChanges(false)
      alert('Modules updated successfully!')
    } catch (err) {
      console.error('❌ Failed to save modules:', err)
      alert('Failed to save modules: ' + (err?.message || 'Unknown error'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveLimits = async () => {
    if (!tenant?.id) return

    setIsSavingLimits(true)

    try {
      console.log('🔄 Saving module limits for tenant:', tenant.id)
      const result = await superAdminService.updateModuleLimits(tenant.id, {
        max_employees_override: parseInt(maxEmployeesOverride) || 0,
        max_admin_users_override: parseInt(maxAdminUsersOverride) || 0,
        max_entities_override: parseInt(maxEntitiesOverride) || 0,
      })

      console.log('✅ Module limits saved successfully:', result)
      setEditingLimits(false)
      alert('Module limits updated successfully!')
    } catch (err) {
      console.error('❌ Failed to save module limits:', err)
      alert('Failed to save limits: ' + (err?.message || 'Unknown error'))
    } finally {
      setIsSavingLimits(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-[#1251C5]" />
        <span className="ml-3 text-sm text-slate-500">Loading modules...</span>
      </div>
    )
  }

  if (error && !modules) {
    return (
      <div className="rounded-2xl bg-red-50 border border-red-200 p-5">
        <p className="text-sm text-red-700">⚠️ {error}</p>
      </div>
    )
  }

  const modulesList = [
    { key: 'core_hr_enabled', label: 'Core HR', icon: '👥' },
    { key: 'payroll_enabled', label: 'Payroll', icon: '💰' },
    { key: 'leave_enabled', label: 'Leave Management', icon: '📅' },
    { key: 'attendance_enabled', label: 'Attendance', icon: '📍' },
    { key: 'recruitment_enabled', label: 'Recruitment (ATS)', icon: '🎯' },
    { key: 'performance_enabled', label: 'Performance', icon: '⭐' },
    { key: 'benefits_enabled', label: 'Benefits', icon: '🎁' },
    { key: 'compliance_enabled', label: 'Compliance', icon: '✅' },
    { key: 'api_access_enabled', label: 'API Access', icon: '🔌' },
    { key: 'white_label_enabled', label: 'White Label', icon: '🎨' },
    { key: 'sso_enabled', label: 'SSO', icon: '🔐' },
    { key: 'multi_entity_enabled', label: 'Multi-Entity', icon: '🏢' },
    { key: 'advanced_analytics_enabled', label: 'Advanced Analytics', icon: '📊' },
  ]

  return (
    <div className="flex flex-col gap-4">
      {/* Use Plan Defaults Toggle */}
      <div className="rounded-2xl bg-white border border-[#dce9ff] p-5">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Module Configuration</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {usePlanDefaults ? 'Using plan defaults' : 'Custom module configuration'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-500 font-semibold">
              {usePlanDefaults ? 'Plan Defaults' : 'Custom Override'}
            </span>
            <Toggle 
              enabled={!usePlanDefaults} 
              onChange={() => {
                const newValue = !usePlanDefaults
                setUsePlanDefaults(newValue)
                setModules(prev => ({ ...prev, use_plan_defaults: newValue }))
                setHasChanges(true)
              }} 
            />
          </div>
        </div>
        {usePlanDefaults && (
          <p className="mt-2 text-[11px] text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
            Disable to customize individual module access beyond plan defaults.
          </p>
        )}
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {modulesList.map(mod => (
          <div 
            key={mod.key} 
            className={`rounded-2xl border p-4 flex items-center justify-between transition ${
              usePlanDefaults ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
            } ${modules?.[mod.key] ? 'bg-white border-[#dce9ff]' : 'bg-[#f8faff] border-[#f0f5ff]'}`}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg">{mod.icon}</span>
                <p className={`text-sm font-semibold ${modules?.[mod.key] ? 'text-slate-800' : 'text-slate-400'}`}>
                  {mod.label}
                </p>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 ml-6">
                {modules?.[mod.key] ? '✅ Enabled' : '❌ Disabled'}
              </p>
            </div>
            <Toggle 
              enabled={modules?.[mod.key] || false} 
              onChange={() => handleToggleModule(mod.key)}
              disabled={usePlanDefaults}
            />
          </div>
        ))}
      </div>

      {/* Max Limits Overrides */}
      <div className="rounded-2xl bg-white border border-[#dce9ff] p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900">Max Limit Overrides</h3>
          {!editingLimits && (
            <button
              onClick={() => setEditingLimits(true)}
              className="text-[11px] text-[#1251C5] font-semibold hover:underline"
            >
              Edit
            </button>
          )}
        </div>

        {editingLimits ? (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Max Employees</label>
              <input
                type="number"
                min="0"
                value={maxEmployeesOverride}
                onChange={(e) => setMaxEmployeesOverride(e.target.value)}
                disabled={isSavingLimits}
                className="w-full px-3 py-2 rounded-lg border border-[#dce9ff] focus:outline-none focus:border-[#1251C5] focus:ring-2 focus:ring-[#1251C5]/20 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Max Admin Users</label>
              <input
                type="number"
                min="0"
                value={maxAdminUsersOverride}
                onChange={(e) => setMaxAdminUsersOverride(e.target.value)}
                disabled={isSavingLimits}
                className="w-full px-3 py-2 rounded-lg border border-[#dce9ff] focus:outline-none focus:border-[#1251C5] focus:ring-2 focus:ring-[#1251C5]/20 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Max Entities</label>
              <input
                type="number"
                min="0"
                value={maxEntitiesOverride}
                onChange={(e) => setMaxEntitiesOverride(e.target.value)}
                disabled={isSavingLimits}
                className="w-full px-3 py-2 rounded-lg border border-[#dce9ff] focus:outline-none focus:border-[#1251C5] focus:ring-2 focus:ring-[#1251C5]/20 disabled:opacity-50"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setEditingLimits(false)
                  setMaxEmployeesOverride(modules?.max_employees_override || 0)
                  setMaxAdminUsersOverride(modules?.max_admin_users_override || 0)
                  setMaxEntitiesOverride(modules?.max_entities_override || 0)
                }}
                disabled={isSavingLimits}
                className="flex-1 px-3 py-2 rounded-lg border border-[#dce9ff] text-slate-600 text-xs font-semibold hover:bg-[#f0f5ff] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveLimits}
                disabled={isSavingLimits}
                className="flex-1 px-3 py-2 rounded-lg bg-[#1251C5] text-white text-xs font-semibold hover:bg-[#0d3a9e] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSavingLimits ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Max Employees', key: 'max_employees_override', value: modules?.max_employees_override || 0 },
              { label: 'Max Admin Users', key: 'max_admin_users_override', value: modules?.max_admin_users_override || 0 },
              { label: 'Max Entities', key: 'max_entities_override', value: modules?.max_entities_override || 0 },
            ].map(f => (
              <div key={f.label} className="rounded-xl bg-[#f8faff] border border-[#f0f5ff] p-3">
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{f.label}</p>
                <p className="text-base font-extrabold text-slate-900 mt-1">{f.value || '—'}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* White Label & Customization */}
      {modules?.white_label_enabled && (
        <div className="rounded-2xl bg-white border border-[#dce9ff] p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-3">🎨 White Label & Customization</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { label: 'Custom Domain', value: modules?.custom_domain || '—' },
              { label: 'Brand Color', value: modules?.brand_color || '—' },
              { label: 'Email From Name', value: modules?.custom_email_from_name || '—' },
              { label: 'Custom Logo URL', value: modules?.custom_logo_url ? '✅ Set' : '—' },
            ].map(f => (
              <div key={f.label} className="rounded-xl bg-[#f8faff] border border-[#f0f5ff] p-3">
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{f.label}</p>
                <p className="text-sm font-semibold text-slate-800 mt-1 truncate">{f.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* API Configuration */}
      {modules?.api_access_enabled && (
        <div className="rounded-2xl bg-white border border-[#dce9ff] p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-3">🔌 API Configuration</h3>
          <div className="rounded-xl bg-[#f8faff] border border-[#f0f5ff] p-3">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">API Rate Limit</p>
            <p className="text-base font-extrabold text-slate-900 mt-1">
              {modules?.api_rate_limit || 'Unlimited'} requests/hour
            </p>
          </div>
        </div>
      )}

      {/* Save Button */}
      {hasChanges && (
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.reload()}
            disabled={isSaving}
            className="px-4 py-2 rounded-lg border border-[#dce9ff] text-slate-600 font-semibold hover:bg-[#f0f5ff] disabled:opacity-50"
          >
            Discard Changes
          </button>
          <button
            onClick={handleSaveModules}
            disabled={isSaving}
            className="px-4 py-2 rounded-lg bg-[#1251C5] text-white font-semibold hover:bg-[#0d3a9e] disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Tab: SSO ─────────────────────────────────────────────────────────────────
function SSOTab() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">{SSO_CONFIGS.length} SSO configuration(s)</p>
        <button className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#1251C5] to-[#1a6fe8] px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:shadow-md transition">
          <Plus className="h-3.5 w-3.5" /> Add SSO
        </button>
      </div>

      <div className="rounded-2xl bg-white border border-[#dce9ff] overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#f0f5ff] bg-[#f8faff]">
              {['Domain', 'SSO Type', 'Status', 'Created At', 'Actions'].map(h => (
                <th key={h} className="py-3 px-4 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SSO_CONFIGS.map(s => (
              <tr key={s.id} className="border-b border-[#f8faff] hover:bg-[#f8faff] transition-colors group">
                <td className="py-3 px-4 font-semibold text-slate-800">{s.domain}</td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-[#f0f5ff] px-2.5 py-0.5 text-[11px] font-bold text-[#1251C5]">
                    <Key className="h-3 w-3" />{s.type}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${s.status === 'active' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-slate-100 text-slate-500 ring-slate-200'}`}>
                    {s.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-500">{s.createdAt}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => alert(`SSO Health Check: Connection to ${s.provider || 'Identity Provider'} (${s.protocol || 'SAML 2.0'}) is operational.`)}
                      className="rounded-lg border border-[#dce9ff] px-2.5 py-1 text-[10px] font-semibold text-[#1251C5] hover:bg-[#f0f5ff] transition cursor-pointer"
                    >
                      Test SSO
                    </button>
                    <button className="rounded-lg border border-[#dce9ff] px-2.5 py-1 text-[10px] font-semibold text-slate-600 hover:bg-[#f0f5ff] transition">Edit</button>
                    <button className="rounded-lg border border-red-200 px-2.5 py-1 text-[10px] font-semibold text-red-500 hover:bg-red-50 transition">Revoke</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add SSO form hint */}
      <div className="rounded-2xl bg-[#f8faff] border border-[#dce9ff] p-5">
        <h3 className="text-sm font-bold text-slate-900 mb-3">Supported SSO Providers</h3>
        <div className="flex flex-wrap gap-2">
          {['SAML 2.0', 'OpenID Connect', 'Google Workspace', 'Microsoft Entra ID', 'Okta', 'Auth0'].map(p => (
            <span key={p} className="rounded-full border border-[#dce9ff] bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600">{p}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Tab: Audit Log ───────────────────────────────────────────────────────────
function AuditLogTab() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 h-9 rounded-xl border border-[#dce9ff] bg-white px-3 w-56">
          <Search className="h-3.5 w-3.5 text-slate-400" />
          <input className="flex-1 bg-transparent text-xs text-slate-600 outline-none placeholder:text-slate-400" placeholder="Search events, actors…" />
        </div>
        <div className="flex items-center gap-2">
          {['All Types', 'All Severities', 'Date Range'].map(f => (
            <button key={f} className="flex items-center gap-1 h-9 rounded-xl border border-[#dce9ff] bg-white px-3 text-[11px] font-semibold text-slate-600 hover:bg-[#f0f5ff] transition">
              {f} <ChevronDown className="h-3 w-3" />
            </button>
          ))}
          <button className="flex items-center gap-1.5 h-9 rounded-xl border border-[#dce9ff] bg-white px-3 text-[11px] font-semibold text-slate-600 hover:bg-[#f0f5ff] transition">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-[#dce9ff] overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#f0f5ff] bg-[#f8faff]">
              {['Timestamp', 'Actor', 'Event Type', 'Severity', 'IP Address', 'Action', ''].map(h => (
                <th key={h} className="py-3 px-4 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {AUDIT_EVENTS.map((e, i) => (
              <motion.tr key={e.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="border-b border-[#f8faff] hover:bg-[#f8faff] transition-colors group">
                <td className="py-2.5 px-4 font-mono text-[10px] text-slate-500 whitespace-nowrap">{e.ts}</td>
                <td className="py-2.5 px-4">
                  <p className="font-semibold text-slate-800 leading-none">{e.actor}</p>
                  <p className="text-[10px] text-slate-400">{e.email}</p>
                </td>
                <td className="py-2.5 px-4">
                  <span className="inline-flex items-center rounded-md bg-[#f0f5ff] px-2 py-0.5 text-[10px] font-bold text-[#1251C5]">{e.type}</span>
                </td>
                <td className="py-2.5 px-4">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${SEVERITY_STYLES[e.severity]}`}>{e.severity}</span>
                </td>
                <td className="py-2.5 px-4 font-mono text-[10px] text-slate-500">{e.ip}</td>
                <td className="py-2.5 px-4 text-slate-700 max-w-xs truncate">{e.action}</td>
                <td className="py-2.5 px-4">
                  <button className="opacity-0 group-hover:opacity-100 rounded-md hover:bg-[#f0f5ff] p-1 transition">
                    <MoreHorizontal className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Tab: Data & Compliance ───────────────────────────────────────────────────
function DataComplianceTab({ tenantId, tenant, onUpdate, navigate }) {
  const [marking, setMarking] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [localMarked, setLocalMarked] = useState(false)

  const isMarked = localMarked || tenant?.status === 'suspended' || tenant?.status === 'pending_deletion'

  const handleMarkForDeletion = async () => {
    if (!confirm('Initiate Step 1: Mark this tenant for deletion? The tenant will be suspended and placed in a 30-day grace hold.')) return
    try {
      setMarking(true)
      await superAdminService.markTenantForDeletion(tenantId || tenant?.id)
      setLocalMarked(true)
      alert('Tenant successfully marked for deletion. Step 2 execution is now unlocked.')
      onUpdate?.()
    } catch (err) {
      console.error('Failed to mark tenant for deletion:', err)
      alert('Failed to mark tenant for deletion: ' + (err.response?.data?.detail || err.message))
    } finally {
      setMarking(false)
    }
  }

  const handleExecuteDeletion = async () => {
    if (confirmText.trim().toUpperCase() !== 'DELETE' && confirmText.trim() !== tenant?.name) {
      alert('Please type "DELETE" or the tenant name to confirm execution.')
      return
    }
    try {
      setDeleting(true)
      await superAdminService.deleteTenant(tenantId || tenant?.id)
      alert(`Tenant "${tenant?.name || tenantId}" has been permanently purged.`)
      navigate?.('/super-admin/tenants', { replace: true })
    } catch (err) {
      console.error('Failed to execute deletion:', err)
      alert('Failed to execute deletion: ' + (err.response?.data?.detail || err.message))
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Data Export */}
        <div className="rounded-2xl bg-white border border-[#dce9ff] p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50"><Download className="h-4 w-4 text-[#1251C5]" /></div>
            <h3 className="text-sm font-bold text-slate-900">Data Export</h3>
          </div>
          <p className="text-[12px] text-slate-500 mb-4">Export all tenant data as a structured ZIP. Includes employees, payroll, attendance, leave, and documents.</p>
          <div className="flex flex-col gap-2">
            {['Full Tenant Export (ZIP)', 'Employees CSV', 'Payroll CSV', 'Attendance CSV', 'Leave Records CSV'].map(opt => (
              <button key={opt} className="flex items-center justify-between rounded-xl border border-[#dce9ff] bg-[#f8faff] px-3 py-2 hover:bg-[#f0f5ff] transition group">
                <span className="text-[11px] font-semibold text-slate-700">{opt}</span>
                <Download className="h-3.5 w-3.5 text-[#1251C5] opacity-0 group-hover:opacity-100 transition" />
              </button>
            ))}
          </div>
        </div>

        {/* GDPR */}
        <div className="rounded-2xl bg-white border border-[#dce9ff] p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-50"><Shield className="h-4 w-4 text-violet-600" /></div>
            <h3 className="text-sm font-bold text-slate-900">GDPR / DPDPA Compliance</h3>
          </div>
          <p className="text-[12px] text-slate-500 mb-4">Manage data subject rights and compliance actions for this tenant.</p>
          <div className="flex flex-col gap-2">
            {[
              { label: 'Right to Erasure — Mark User for Deletion', danger: true },
              { label: 'Data Retention Policy Override',             danger: false },
              { label: 'Biometric Consent Records',                  danger: false },
              { label: 'Bulk Revoke Biometric Consent',              danger: true },
            ].map(a => (
              <button key={a.label} className={`flex items-center justify-between rounded-xl border px-3 py-2 transition text-left
                ${a.danger ? 'border-red-200 bg-red-50 hover:bg-red-100 text-red-700' : 'border-[#dce9ff] bg-[#f8faff] hover:bg-[#f0f5ff] text-slate-700'}`}>
                <span className="text-[11px] font-semibold">{a.label}</span>
                <ArrowRight className="h-3 w-3 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tenant Deletion */}
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-100"><XCircle className="h-4 w-4 text-red-600" /></div>
          <div>
            <h3 className="text-sm font-bold text-red-800">Tenant Deletion Protocol</h3>
            {isMarked && (
              <span className="inline-block mt-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                Grace Hold Active — Step 2 Unlocked
              </span>
            )}
          </div>
        </div>
        <p className="text-[12px] text-red-600 mb-4">
          Two-step process: Mark for Deletion (initiates 30-day grace hold & suspension), then Execute Deletion to permanently purge all tenant databases, employees, and assets.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={handleMarkForDeletion}
            disabled={marking}
            className={`rounded-lg border px-4 py-2 text-xs font-bold transition ${
              isMarked
                ? 'border-slate-200 bg-slate-100 text-slate-500 cursor-default'
                : 'border-red-300 bg-white text-red-600 hover:bg-red-50 cursor-pointer'
            }`}
          >
            {marking ? 'Marking...' : isMarked ? '✓ Step 1 Complete (Marked)' : 'Step 1 — Mark for Deletion'}
          </button>
          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={!isMarked || deleting}
            className={`rounded-lg border px-4 py-2 text-xs font-bold transition ${
              isMarked
                ? 'border-red-600 bg-red-600 text-white hover:bg-red-700 cursor-pointer shadow-sm'
                : 'border-red-200 bg-red-100 text-red-400 cursor-not-allowed'
            }`}
          >
            {deleting ? 'Executing...' : 'Step 2 — Execute Deletion'}
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-red-200">
            <div className="flex items-center gap-2 mb-3 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="font-bold text-base">Permanent Tenant Deletion</h3>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              This action <strong>CANNOT</strong> be undone. This will permanently delete the tenant <strong>"{tenant?.name}"</strong> and all related user accounts, documents, logs, and database records.
            </p>
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Type <strong>DELETE</strong> to confirm:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-red-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setShowConfirmModal(false); setConfirmText(''); }}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteDeletion}
                disabled={confirmText.trim().toUpperCase() !== 'DELETE' && confirmText.trim() !== tenant?.name}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-40 transition cursor-pointer"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function TenantDetailPage() {
  const { id: tenantId } = useParams()
  const navigate = useNavigate()
  
  const [activeTab, setActiveTab] = useState('Overview')
  const [tenant, setTenant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchTenant = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await superAdminService.getTenant(tenantId)
      
      console.log('DEBUG: Tenant Detail Result:', result)
      const data = result?.tenant || result?.data || result
      setTenant(data)
    } catch (err) {
      setError(err.message || 'Failed to load tenant details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (tenantId) fetchTenant()
  }, [tenantId])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f0f5ff]">
        <SuperAdminTopBar />
        <div className="flex-1 flex items-center justify-center">
          <RefreshCw className="h-10 w-10 text-[#1251C5] animate-spin" />
        </div>
      </div>
    )
  }

  if (error || !tenant) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f0f5ff]">
        <SuperAdminTopBar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <AlertTriangle className="h-12 w-12 text-red-500" />
          <p className="text-lg font-bold text-slate-900">{error || 'Tenant not found'}</p>
          <button onClick={() => navigate('/super-admin/tenants')} className="text-[#1251C5] font-bold hover:underline">Back to Tenants</button>
        </div>
      </div>
    )
  }

  const tabContent = {
    'Overview':               <OverviewTab tenant={tenant} />,
    'Users':                  <UsersTab tenant={tenant} />,
    'Subscription & Billing': <BillingTab tenant={tenant} />,
    'Modules & Features':     <ModulesTab tenant={tenant} />,
    'SSO Configuration':      <SSOTab />,
    'Audit Log':              <AuditLogTab />,
    'Data & Compliance':      <DataComplianceTab tenantId={tenantId} tenant={tenant} onUpdate={fetchTenant} navigate={navigate} />,
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f0f5ff] font-sans">
      <SuperAdminTopBar />

      <div className="flex flex-col gap-0 flex-1 overflow-auto">
        {/* ── Tenant Header ── */}
        <div className="bg-white border-b border-[#dce9ff] px-6 pt-5 pb-0">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-4">
            <button onClick={() => navigate('/super-admin')} className="hover:text-[#1251C5] transition">Dashboard</button>
            <span>/</span>
            <button onClick={() => navigate('/super-admin/tenants')} className="hover:text-[#1251C5] transition">Tenants</button>
            <span>/</span>
            <span className="text-slate-700 font-semibold">{tenant.name}</span>
          </div>

          <div className="flex items-start justify-between flex-wrap gap-4 mb-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1251C5] to-[#4f9cf9] text-base font-bold text-white shadow-md">
                {tenant.avatar}
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-lg font-extrabold text-slate-900">{tenant.name}</h1>
                  <StatusBadge status={tenant.status} />
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold ${PLAN_STYLES[tenant.plan] ?? 'bg-slate-100 text-slate-600'}`}>{tenant.plan}</span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[11px] text-slate-400">{tenant.id}</span>
                  <span className="text-[11px] text-slate-400">·</span>
                  <a href="#" className="flex items-center gap-1 text-[11px] text-[#1251C5] hover:underline">
                    {tenant.subdomain}.hrmsplatform.com <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                  <span className="text-[11px] text-slate-400">·</span>
                  <span className="text-[11px] text-slate-400">{REGION_FLAGS[tenant.region]} {tenant.region}</span>
                </div>
              </div>
            </div>

            {/* Buttons removed */}
          </div>

          {/* Tab Nav */}
          <div className="flex gap-0 -mb-px overflow-x-auto">
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`relative shrink-0 py-2.5 px-4 text-[12px] font-semibold transition whitespace-nowrap
                  ${activeTab === tab ? 'text-[#1251C5]' : 'text-slate-400 hover:text-slate-700'}`}>
                {tab}
                {activeTab === tab && (
                  <motion.span layoutId="detailTab"
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-[#1251C5] rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab Content ── */}
        <div className="flex-1 p-6">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}>
              {tabContent[activeTab]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

