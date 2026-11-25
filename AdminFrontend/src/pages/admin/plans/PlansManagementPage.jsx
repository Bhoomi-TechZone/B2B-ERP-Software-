import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Package, Plus, Edit2, Trash2, Search, Users,
  Shield, Zap, Crown, Star, X, Globe, Tag, Eye,
  DollarSign, CheckCircle2, XCircle, Calendar, BarChart3
} from 'lucide-react'
import superAdminService from '../../../services/superAdminService'
import SuperAdminTopBar from '../../components/TopBar'

// ── Constants ─────────────────────────────────────────────────────────────────
const REGIONS = [
  { code: 'US', label: 'United States', flag: '🇺🇸', currency: 'USD', symbol: '$' },
  { code: 'UK', label: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', symbol: '£' },
  { code: 'EU', label: 'Europe',         flag: '🇪🇺', currency: 'EUR', symbol: '€' },
  { code: 'IN', label: 'India',          flag: '🇮🇳', currency: 'INR', symbol: '₹' },
]

const REGION_PRICE_KEYS = {
  US: { monthly: 'price_monthly_usd', yearly: 'price_yearly_usd' },
  UK: { monthly: 'price_monthly_gbp', yearly: 'price_yearly_gbp' },
  EU: { monthly: 'price_monthly_eur', yearly: 'price_yearly_eur' },
  IN: { monthly: 'price_monthly_inr', yearly: 'price_yearly_inr' },
}

const PREDEFINED_MODULES = ['payroll', 'ats', 'performance', 'attendance', 'crm', 'compliance', 'leave', 'projects', 'onboarding']

const SUPPORT_TIERS = ['email', 'chat', 'phone', 'dedicated']

const EMPTY_FORM = {
  name: '', slug: '', description: '',
  price_monthly_usd: 0, price_yearly_usd: 0,
  price_monthly_gbp: 0, price_yearly_gbp: 0,
  price_monthly_eur: 0, price_yearly_eur: 0,
  price_monthly_inr: 0, price_yearly_inr: 0,
  max_employees: 100, max_admin_users: 1,
  modules_json: {},
  api_access: false, sso_enabled: false, white_label: false,
  support_tier: 'email',
  trial_days: 14,
  regions_allowed: [],
  sort_order: 0,
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
      {children}
    </div>
  )
}

function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 rounded-full transition-colors ${checked ? 'bg-[#1251C5]' : 'bg-slate-200'}`}
      >
        <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </div>
      <span className="text-sm text-slate-700">{label}</span>
    </label>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function PlansManagementPage() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  const [viewingPlanId, setViewingPlanId] = useState(null)
  const [viewRegion, setViewRegion] = useState('US')
  const [billingCycle, setBillingCycle] = useState('monthly')

  useEffect(() => { fetchPlans() }, [])

  const fetchPlans = async () => {
    try {
      setLoading(true); setError('')
      const data = await superAdminService.getPlans()
      setPlans(Array.isArray(data) ? data : (data?.plans || data?.data || []))
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this plan?')) return
    try { await superAdminService.deletePlan(id); fetchPlans() }
    catch (err) { alert(err.message) }
  }

  const filtered = plans.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.slug?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const activeRegion = REGIONS.find(r => r.code === viewRegion)

  return (
    <div className="flex min-h-screen flex-col bg-[#f0f5ff]">
      <SuperAdminTopBar />
      <div className="flex-1 p-6">
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-5">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">Plans Management</h1>
              <p className="text-sm text-slate-500 mt-0.5">Manage subscription plans and pricing</p>
            </div>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={() => { setEditingPlan(null); setShowModal(true) }}
              className="flex items-center gap-2 rounded-lg bg-[#1251C5] px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-[#0d3d9e]">
              <Plus className="h-4 w-4" /> Create Plan
            </motion.button>
          </div>

          {/* Filters row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="flex items-center gap-2 rounded-lg border border-[#dce9ff] bg-white px-3 py-2 flex-1 min-w-48">
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
              <input type="text" placeholder="Search plans..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none" />
            </div>

            {/* Region selector */}
            <div className="flex items-center gap-1 rounded-lg border border-[#dce9ff] bg-white p-1">
              {REGIONS.map(r => (
                <button key={r.code} onClick={() => setViewRegion(r.code)}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition ${
                    viewRegion === r.code ? 'bg-[#1251C5] text-white' : 'text-slate-500 hover:text-slate-800'
                  }`}>
                  {r.flag} {r.code}
                </button>
              ))}
            </div>

            {/* Billing cycle */}
            <div className="flex items-center gap-1 rounded-lg border border-[#dce9ff] bg-white p-1">
              {['monthly', 'yearly'].map(c => (
                <button key={c} onClick={() => setBillingCycle(c)}
                  className={`rounded-md px-3 py-1.5 text-xs font-bold capitalize transition ${
                    billingCycle === c ? 'bg-[#1251C5] text-white' : 'text-slate-500 hover:text-slate-800'
                  }`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1251C5] border-r-transparent" />
            </div>
          )}

          {!loading && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map(plan => (
                <PlanCard key={plan.id || plan.slug} plan={plan}
                  region={activeRegion} billingCycle={billingCycle}
                  onView={() => setViewingPlanId(plan.id)}
                  onEdit={() => { setEditingPlan(plan); setShowModal(true) }}
                  onDelete={() => handleDelete(plan.id)} />
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="rounded-xl border border-[#dce9ff] bg-white p-16 text-center">
              <Package className="mx-auto h-12 w-12 text-slate-200" />
              <p className="mt-4 text-sm font-semibold text-slate-500">No plans found</p>
            </div>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {showModal && (
          <PlanModal plan={editingPlan}
            onClose={() => setShowModal(false)}
            onSuccess={() => { setShowModal(false); fetchPlans() }} />
        )}
        {viewingPlanId && (
          <PlanDetailModal
            planId={viewingPlanId}
            onClose={() => setViewingPlanId(null)}
            onEdit={(plan) => { setViewingPlanId(null); setEditingPlan(plan); setShowModal(true) }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Plan Card ─────────────────────────────────────────────────────────────────
function PlanCard({ plan, region, billingCycle, onEdit, onDelete }) {
  const Icon = plan.name?.toLowerCase().includes('enterprise') ? Crown
    : plan.name?.toLowerCase().includes('business') || plan.name?.toLowerCase().includes('pro') ? Star : Package

  const priceKey = REGION_PRICE_KEYS[region.code]?.[billingCycle]
  const price = plan[priceKey] ?? 0
  const displayPrice = price === 0 ? 'Free'
    : `${region.symbol}${price.toLocaleString()}`

  const modules = Object.entries(plan.modules_json || {}).filter(([, v]) => v)

  return (
    <motion.div whileHover={{ y: -4 }}
      className="rounded-xl border border-[#dce9ff] bg-white p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#1251C5] to-[#1a6fe8]">
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{plan.name}</h3>
            <p className="text-xs text-slate-400">{plan.slug}</p>
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={onEdit} className="rounded p-1.5 hover:bg-slate-100">
            <Edit2 className="h-3.5 w-3.5 text-slate-500" />
          </button>
          <button onClick={onDelete} className="rounded p-1.5 hover:bg-red-50">
            <Trash2 className="h-3.5 w-3.5 text-red-500" />
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-500 mb-4 line-clamp-2">{plan.description}</p>

      {/* Price for selected region */}
      <div className="mb-4 rounded-lg bg-[#f0f5ff] px-4 py-3 text-center">
        <p className="text-2xl font-extrabold text-[#1251C5]">{displayPrice}</p>
        <p className="text-xs text-slate-400 mt-0.5">{region.flag} {region.label} · {billingCycle}</p>
      </div>

      {/* Limits */}
      <div className="space-y-1.5 mb-4">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Users className="h-3.5 w-3.5 text-slate-400" />
          {plan.max_employees === -1 ? 'Unlimited employees' : `${plan.max_employees} employees`}
        </div>
        {plan.api_access && <div className="flex items-center gap-2 text-xs text-slate-600"><Zap className="h-3.5 w-3.5 text-green-500" /> API Access</div>}
        {plan.sso_enabled && <div className="flex items-center gap-2 text-xs text-slate-600"><Shield className="h-3.5 w-3.5 text-purple-500" /> SSO Enabled</div>}
        {plan.white_label && <div className="flex items-center gap-2 text-xs text-slate-600"><Tag className="h-3.5 w-3.5 text-amber-500" /> White Label</div>}
      </div>

      {/* Modules */}
      {modules.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {modules.map(([key]) => (
            <span key={key} className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 capitalize">
              {key.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      )}

      {/* Regions */}
      {plan.regions_allowed?.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap mb-3">
          <Globe className="h-3 w-3 text-slate-400" />
          {plan.regions_allowed.map(r => {
            const reg = REGIONS.find(x => x.code === r)
            return <span key={r} className="text-xs text-slate-500">{reg?.flag} {r}</span>
          })}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-xs text-slate-500">Trial: <span className="font-semibold">{plan.trial_days}d</span></span>
        <span className="rounded-full bg-[#f0f5ff] px-2 py-0.5 text-xs font-semibold text-[#1251C5] capitalize">{plan.support_tier}</span>
      </div>
    </motion.div>
  )
}

// ── Plan Modal ────────────────────────────────────────────────────────────────
function PlanModal({ plan, onClose, onSuccess }) {
  const [formData, setFormData] = useState(plan ? { ...EMPTY_FORM, ...plan } : EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeRegionTab, setActiveRegionTab] = useState('US')
  const [moduleKey, setModuleKey] = useState('')

  const set = (key, val) => setFormData(f => ({ ...f, [key]: val }))

  const handleNameChange = (val) => {
    set('name', val)
    if (!plan) set('slug', val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
  }

  const toggleModule = (key) =>
    setFormData(f => ({ ...f, modules_json: { ...f.modules_json, [key]: !f.modules_json[key] } }))

  const addCustomModule = () => {
    const key = moduleKey.trim().toLowerCase().replace(/\s+/g, '_')
    if (key && !(key in formData.modules_json)) {
      setFormData(f => ({ ...f, modules_json: { ...f.modules_json, [key]: true } }))
    }
    setModuleKey('')
  }

  const removeModule = (key) => {
    const updated = { ...formData.modules_json }
    delete updated[key]
    set('modules_json', updated)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      if (plan) await superAdminService.updatePlan(plan.id, formData)
      else await superAdminService.createPlan(formData)
      onSuccess()
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const activeRegion = REGIONS.find(r => r.code === activeRegionTab)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
          <h2 className="text-base font-bold text-slate-900">{plan ? 'Edit Plan' : 'Create New Plan'}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-100">
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          {/* ── Basic Info ── */}
          <div className="rounded-xl border border-slate-100 p-4 space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Basic Info</p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Plan Name *">
                <input required value={formData.name} onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Professional"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1251C5]" />
              </Field>
              <Field label="Slug *">
                <input required value={formData.slug} onChange={(e) => set('slug', e.target.value)}
                  placeholder="e.g. professional"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1251C5]" />
              </Field>
            </div>
            <Field label="Description">
              <textarea value={formData.description} onChange={(e) => set('description', e.target.value)}
                rows={2} placeholder="Brief description..."
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1251C5] resize-none" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Sort Order">
                <input type="number" value={formData.sort_order} onChange={(e) => set('sort_order', parseInt(e.target.value) || 0)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1251C5]" />
              </Field>
              <Field label="Support Tier">
                <select value={formData.support_tier} onChange={(e) => set('support_tier', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1251C5]">
                  {SUPPORT_TIERS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
            </div>
          </div>

          {/* ── Pricing by Region ── */}
          <div className="rounded-xl border border-slate-100 p-4 space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Pricing by Region</p>

            {/* Region tabs */}
            <div className="flex gap-1 border-b border-slate-100">
              {REGIONS.map(r => (
                <button key={r.code} type="button" onClick={() => setActiveRegionTab(r.code)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition ${
                    activeRegionTab === r.code
                      ? 'border-b-2 border-[#1251C5] text-[#1251C5]'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}>
                  {r.flag} {r.code}
                </button>
              ))}
            </div>

            {/* Price inputs for active region */}
            <div className="grid grid-cols-2 gap-4">
              <Field label={`Monthly (${activeRegion.currency})`}>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">{activeRegion.symbol}</span>
                  <input type="number" min="0" step="1"
                    value={formData[REGION_PRICE_KEYS[activeRegionTab].monthly] || 0}
                    onChange={(e) => set(REGION_PRICE_KEYS[activeRegionTab].monthly, parseInt(e.target.value) || 0)}
                    placeholder="e.g. 9900"
                    className="w-full rounded-lg border border-slate-200 pl-8 pr-3 py-2 text-sm outline-none focus:border-[#1251C5]" />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Enter full amount (e.g. 9900 for {activeRegion.symbol}99)</p>
              </Field>
              <Field label={`Yearly (${activeRegion.currency})`}>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">{activeRegion.symbol}</span>
                  <input type="number" min="0" step="1"
                    value={formData[REGION_PRICE_KEYS[activeRegionTab].yearly] || 0}
                    onChange={(e) => set(REGION_PRICE_KEYS[activeRegionTab].yearly, parseInt(e.target.value) || 0)}
                    placeholder="e.g. 99000"
                    className="w-full rounded-lg border border-slate-200 pl-8 pr-3 py-2 text-sm outline-none focus:border-[#1251C5]" />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Enter full amount (e.g. 99000 for {activeRegion.symbol}990)</p>
              </Field>
            </div>
          </div>

          {/* ── Limits ── */}
          <div className="rounded-xl border border-slate-100 p-4 space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Limits</p>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Max Employees (-1 = unlimited)">
                <input type="number" value={formData.max_employees} onChange={(e) => set('max_employees', parseInt(e.target.value) || -1)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1251C5]" />
              </Field>
              <Field label="Max Admin Users">
                <input type="number" min="1" value={formData.max_admin_users} onChange={(e) => set('max_admin_users', parseInt(e.target.value) || 1)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1251C5]" />
              </Field>
              <Field label="Trial Days">
                <input type="number" min="0" value={formData.trial_days} onChange={(e) => set('trial_days', parseInt(e.target.value) || 0)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1251C5]" />
              </Field>
            </div>
          </div>

          {/* ── Features ── */}
          <div className="rounded-xl border border-slate-100 p-4 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Features</p>
            <Toggle checked={formData.api_access} onChange={(v) => set('api_access', v)} label="API Access" />
            <Toggle checked={formData.sso_enabled} onChange={(v) => set('sso_enabled', v)} label="SSO / SAML" />
            <Toggle checked={formData.white_label} onChange={(v) => set('white_label', v)} label="White Label" />
          </div>

          {/* ── Regions Allowed ── */}
          <div className="rounded-xl border border-slate-100 p-4 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Regions Allowed</p>
            <div className="flex flex-wrap gap-2">
              {REGIONS.map(r => {
                const selected = formData.regions_allowed.includes(r.code)
                return (
                  <button key={r.code} type="button"
                    onClick={() => set('regions_allowed', selected
                      ? formData.regions_allowed.filter(x => x !== r.code)
                      : [...formData.regions_allowed, r.code]
                    )}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border transition ${
                      selected
                        ? 'bg-[#1251C5] border-[#1251C5] text-white'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-[#1251C5]'
                    }`}>
                    {r.flag} {r.code}
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── Modules ── */}
          <div className="rounded-xl border border-slate-100 p-4 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Modules (modules_json)</p>

            {/* Predefined modules */}
            <div className="flex flex-wrap gap-2">
              {PREDEFINED_MODULES.map(mod => {
                const enabled = formData.modules_json[mod] === true
                return (
                  <button key={mod} type="button" onClick={() => toggleModule(mod)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold border transition ${
                      enabled
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-400'
                    }`}>
                    {enabled ? '✓ ' : '+ '}{mod}
                  </button>
                )
              })}
            </div>

            {/* Custom module */}
            <div className="flex gap-2">
              <input type="text" value={moduleKey} onChange={(e) => setModuleKey(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomModule())}
                placeholder="Custom module key — press Enter"
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1251C5]" />
              <button type="button" onClick={addCustomModule}
                className="rounded-lg bg-[#1251C5] px-3 py-2 text-sm font-bold text-white hover:bg-[#0d3d9e]">
                Add
              </button>
            </div>

            {/* Active modules list */}
            {Object.keys(formData.modules_json).length > 0 && (
              <div className="space-y-2 rounded-lg bg-slate-50 p-3">
                {Object.entries(formData.modules_json).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700 capitalize">{key.replace(/_/g, ' ')}</span>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => toggleModule(key)}
                        className={`relative h-5 w-9 rounded-full transition-colors ${val ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                        <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${val ? 'translate-x-4' : ''}`} />
                      </button>
                      <button type="button" onClick={() => removeModule(key)}>
                        <X className="h-3.5 w-3.5 text-red-400 hover:text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Actions ── */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 rounded-lg bg-[#1251C5] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0d3d9e] disabled:opacity-50">
              {loading ? 'Saving...' : plan ? 'Update Plan' : 'Create Plan'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
