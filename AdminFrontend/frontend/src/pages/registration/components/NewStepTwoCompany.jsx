import { useState } from 'react'
import {
  Building2, Users, Globe, Tag,
  CheckCircle2, ChevronLeft,
  AlertCircle, Sparkles, Loader2, Package,
} from 'lucide-react'

const REGION_FLAGS = { US: '🇺🇸', UK: '🇬🇧', EU: '🇪🇺', IN: '🇮🇳' }

const FALLBACK_PLANS = [
  {
    name: 'Professional',
    slug: 'pro-plan',
    description: 'HR Management modules with full control for admin',
    price_monthly_inr: 5000,
    price_yearly_inr: 55000,
    price_monthly_usd: 200,
    price_yearly_usd: 1800,
    price_monthly_gbp: 3000,
    price_yearly_gbp: 13000,
    price_monthly_eur: 4000,
    price_yearly_eur: 14000,
    max_employees: 3,
  },
  {
    name: 'Enterprise',
    slug: 'enterprise-plan',
    description: 'Full suite including CRM, HRMS, and enterprise tools',
    price_monthly_inr: 7000,
    price_yearly_inr: 80000,
    price_monthly_usd: 360,
    price_yearly_usd: 2650,
    price_monthly_gbp: 60,
    price_yearly_gbp: 550,
    price_monthly_eur: 80,
    price_yearly_eur: 650,
    max_employees: 5,
  }
]

const REGION_CONFIG = {
  IN: { symbol: '₹', code: 'INR', monthlyKey: 'price_monthly_inr', yearlyKey: 'price_yearly_inr' },
  US: { symbol: '$', code: 'USD', monthlyKey: 'price_monthly_usd', yearlyKey: 'price_yearly_usd' },
  UK: { symbol: '£', code: 'GBP', monthlyKey: 'price_monthly_gbp', yearlyKey: 'price_yearly_gbp' },
  EU: { symbol: '€', code: 'EUR', monthlyKey: 'price_monthly_eur', yearlyKey: 'price_yearly_eur' },
}

export default function NewStepTwoCompany({
  companyName, onCompanyNameChange,
  companySize, onSizeSelect,
  industry, onIndustrySelect,
  primaryRegion, onRegionSelect,
  promoCode, onPromoCodeChange,
  billingCycle, onBillingCycleChange,
  selectedPlan, onPlanChange,
  companySizes,
  industries,
  regions,
  billingCycles,
  plans = [],
  hasUrlPlan = false,
  isSubmitting,
  onBack,
  onSubmit,
}) {
  const [touched, setTouched] = useState({})

  const allPlans = plans && plans.length > 0 ? plans : FALLBACK_PLANS
  const activePlan = allPlans.find(p => p.slug === selectedPlan) || allPlans[0]
  const currentRegion = primaryRegion || 'IN'
  const cur = REGION_CONFIG[currentRegion] || REGION_CONFIG.IN

  const monthlyPrice = Number(activePlan?.[cur.monthlyKey] || 0)
  const annualPrice = Number(activePlan?.[cur.yearlyKey] || 0)
  const annualEquivalentMonthly = Math.round(annualPrice / 12)
  const fullYearMonthly = monthlyPrice * 12
  const savingsAmount = fullYearMonthly > annualPrice ? fullYearMonthly - annualPrice : 0
  const savingsPercent = fullYearMonthly > 0 && savingsAmount > 0 
    ? Math.round((savingsAmount / fullYearMonthly) * 100) 
    : 0

  const errors = {
    companyName: companyName.trim().length < 2 && touched.companyName,
    companySize: !companySize && touched.companySize,
    region: !primaryRegion && touched.region,
  }

  const canSubmit = companyName.trim().length >= 2 && companySize && primaryRegion && billingCycle
  const handleBlur = (field) => setTouched(prev => ({ ...prev, [field]: true }))
  const isPlanFromLanding = Boolean(hasUrlPlan && selectedPlan && selectedPlan !== 'starter')

  return (
    <div className="flex flex-col transition-opacity duration-300">
      <div className="mb-6">
        <button onClick={onBack}
          className="flex items-center gap-1.5 text-[11px] font-black text-slate-400 hover:text-[#1251C5] transition uppercase tracking-widest mb-6">
          <ChevronLeft className="h-4 w-4" /> Back to Step 1
        </button>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-amber-500 fill-amber-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Final Step</span>
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Company Workspace</h2>
        <p className="text-slate-500 mt-2">Almost ready! Configure your organization's legal workspace.</p>
      </div>

      {/* ── Pre-selected Plan Summary ── */}
      {isPlanFromLanding && (
        <div className="mb-6 rounded-2xl border-2 border-[#f68b1f] bg-gradient-to-r from-[#fff8f0] to-white p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-4 w-4 text-[#f68b1f]" />
            <span className="text-[11px] font-black uppercase tracking-widest text-[#f68b1f]">Plan Selected from Pricing</span>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#f68b1f] to-[#ffab4f]">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-base font-black text-slate-900 capitalize">{selectedPlan.replace(/-/g, ' ')}</p>
                <p className="text-xs text-slate-500">Pre-selected from pricing page</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {primaryRegion && (
                <span className="flex items-center gap-1 rounded-full bg-white border border-slate-200 px-3 py-1 text-xs font-bold text-slate-700">
                  {REGION_FLAGS[primaryRegion]} {primaryRegion}
                </span>
              )}
              <span className="rounded-full bg-[#1251C5] px-3 py-1 text-xs font-bold text-white capitalize">
                {billingCycle === 'annual' ? 'Annual' : 'Monthly'}
              </span>
              <button type="button" onClick={() => onPlanChange?.('starter')}
                className="text-[10px] font-bold text-slate-400 hover:text-red-500 underline">
                Change plan
              </button>
            </div>
          </div>
        </div>
      )}

      <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); if (canSubmit) onSubmit() }}>

        {/* Company Name */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-slate-700 uppercase tracking-widest">Company Name *</label>
          <div className="relative group">
            <Building2 className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${errors.companyName ? 'text-red-400' : 'text-slate-400 group-focus-within:text-[#1251C5]'}`} />
            <input type="text" placeholder="e.g. Acme Corporation"
              value={companyName}
              onBlur={() => handleBlur('companyName')}
              onChange={(e) => onCompanyNameChange(e.target.value)}
              className={`w-full rounded-xl border pl-10 pr-4 py-3 text-sm outline-none transition focus:ring-4 ${
                errors.companyName
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                  : 'border-slate-200 focus:border-[#1251C5] focus:ring-[#1251C5]/10'
              }`} />
          </div>
          {errors.companyName && (
            <p className="text-[10px] font-bold text-red-500 flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3" /> Required
            </p>
          )}
        </div>

        {/* Size & Region */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-700 uppercase tracking-widest">Workforce Size *</label>
            <div className="relative group">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#1251C5]" />
              <select value={companySize} onBlur={() => handleBlur('companySize')} onChange={(e) => onSizeSelect(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-sm outline-none appearance-none bg-white focus:border-[#1251C5]">
                <option value="">Select Size</option>
                {companySizes.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
              Legal Region *
              {primaryRegion && isPlanFromLanding && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-black text-emerald-700 normal-case tracking-normal">Auto-filled</span>
              )}
            </label>
            <div className="relative group">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#1251C5]" />
              <select value={primaryRegion} onBlur={() => handleBlur('region')} onChange={(e) => onRegionSelect(e.target.value)}
                className={`w-full rounded-xl border pl-10 pr-4 py-3 text-sm outline-none appearance-none bg-white focus:border-[#1251C5] ${
                  primaryRegion && isPlanFromLanding ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200'
                }`}>
                <option value="">Select Region</option>
                {regions.map(r => <option key={r.id} value={r.id}>{REGION_FLAGS[r.id]} {r.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Industry & Promo */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-700 uppercase tracking-widest">Industry</label>
            <div className="relative group">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#1251C5]" />
              <select value={industry} onChange={(e) => onIndustrySelect(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-sm focus:border-[#1251C5] outline-none transition appearance-none bg-white">
                <option value="">Select Industry</option>
                {industries.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-700 uppercase tracking-widest">Promo Code</label>
            <div className="relative group">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#1251C5]" />
              <input type="text" placeholder="Optional" value={promoCode}
                onChange={(e) => onPromoCodeChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-sm focus:border-[#1251C5] outline-none transition uppercase" />
            </div>
          </div>
        </div>

        {/* Package / Plan Selection */}
        <div className="space-y-2">
          <label className="text-[11px] font-black text-slate-700 uppercase tracking-widest flex items-center justify-between">
            <span>Select Package *</span>
            <span className="text-[10px] font-bold text-slate-400">
              Active: <span className="text-[#1251C5] font-black">{activePlan?.name}</span>
            </span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {allPlans.map(p => {
              const isSelected = activePlan?.slug === p.slug
              const pMonthly = Number(p[cur.monthlyKey] || 0)
              const pYearly = Number(p[cur.yearlyKey] || 0)
              const pDisplay = billingCycle === 'annual' ? pYearly : pMonthly
              const pPeriod = billingCycle === 'annual' ? '/yr' : '/mo'

              return (
                <button
                  key={p.slug}
                  type="button"
                  onClick={() => onPlanChange?.(p.slug)}
                  className={`relative p-3.5 rounded-xl border-2 text-left transition-all ${
                    isSelected 
                      ? 'border-[#1251C5] bg-[#f0f5ff] shadow-sm' 
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[13px] font-black ${isSelected ? 'text-[#1251C5]' : 'text-slate-800'}`}>
                      {p.name}
                    </span>
                    {isSelected && <CheckCircle2 className="h-4 w-4 text-[#1251C5]" />}
                  </div>
                  <div className="text-base font-black text-slate-900 my-0.5">
                    {cur.symbol}{pDisplay.toLocaleString()}
                    <span className="text-[11px] font-normal text-slate-500 ml-1">{pPeriod}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-1">
                    {p.max_employees ? `Up to ${p.max_employees} employees` : p.description}
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Billing Frequency with Live Package Amounts */}
        <div className="space-y-3">
          <label className="text-[11px] font-black text-slate-700 uppercase tracking-widest flex items-center justify-between">
            <span>Billing Frequency *</span>
            {savingsPercent > 0 && (
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Save {savingsPercent}% with Annual
              </span>
            )}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Monthly Option */}
            <button
              type="button"
              onClick={() => onBillingCycleChange('monthly')}
              className={`relative flex flex-col p-4 rounded-xl border-2 text-left transition-all ${
                billingCycle === 'monthly'
                  ? 'border-[#1251C5] bg-[#f0f5ff] shadow-sm ring-2 ring-[#1251C5]/20'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className={`text-[12px] font-black uppercase tracking-wider ${
                  billingCycle === 'monthly' ? 'text-[#1251C5]' : 'text-slate-700'
                }`}>
                  Monthly
                </span>
                {billingCycle === 'monthly' && <CheckCircle2 className="h-4 w-4 text-[#1251C5]" />}
              </div>
              <div className="my-1.5">
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {cur.symbol}{monthlyPrice.toLocaleString()}
                </span>
                <span className="text-xs font-semibold text-slate-500 ml-1">/ month</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-0.5">
                Pay as you go · Billed monthly
              </span>
            </button>

            {/* Annual Option */}
            <button
              type="button"
              onClick={() => onBillingCycleChange('annual')}
              className={`relative flex flex-col p-4 rounded-xl border-2 text-left transition-all ${
                billingCycle === 'annual'
                  ? 'border-[#1251C5] bg-[#f0f5ff] shadow-sm ring-2 ring-[#1251C5]/20'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[12px] font-black uppercase tracking-wider ${
                    billingCycle === 'annual' ? 'text-[#1251C5]' : 'text-slate-700'
                  }`}>
                    Annual
                  </span>
                  {savingsPercent > 0 && (
                    <span className="rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-0.5">
                      Save {savingsPercent}%
                    </span>
                  )}
                </div>
                {billingCycle === 'annual' && <CheckCircle2 className="h-4 w-4 text-[#1251C5]" />}
              </div>
              <div className="my-1.5">
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {cur.symbol}{annualPrice.toLocaleString()}
                </span>
                <span className="text-xs font-semibold text-slate-500 ml-1">/ year</span>
              </div>
              <span className="text-[11px] text-emerald-600 font-bold mt-0.5">
                {savingsAmount > 0
                  ? `Save ${cur.symbol}${savingsAmount.toLocaleString()} / year (${cur.symbol}${annualEquivalentMonthly.toLocaleString()}/mo)`
                  : 'Billed annually'}
              </span>
            </button>
          </div>
        </div>

        <button type="submit" disabled={!canSubmit || isSubmitting}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#1251C5] py-4 text-sm font-black text-white disabled:opacity-40 transition-all mt-6 uppercase tracking-widest shadow-xl shadow-blue-100">
          {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Complete Registration'}
        </button>
      </form>
    </div>
  )
}
