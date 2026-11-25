import { useState, useEffect } from 'react'
import { AnimatePresence, motion as Motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { Check, Zap, Shield, Tag, Users, Globe, X, Crown, Star, Package, ChevronRight } from 'lucide-react'
import plansService from '../services/plansService'
import onboardingService from '../services/onboardingService'
import { getInitialRegion, fetchAndVerifyRegion, saveUserRegionPreference } from '../utils/geoDetection'

const PRICING_REGIONS = [
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

function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  const [plans, setPlans] = useState([])
  const [plansLoading, setPlansLoading] = useState(true)
  const [billingCycle, setBillingCycle] = useState('monthly')
  const [pricingRegion, setPricingRegion] = useState(() => getInitialRegion())
  const [showPlanModal, setShowPlanModal] = useState(false)

  // Method C: Background IP Geolocation verification
  useEffect(() => {
    fetchAndVerifyRegion().then(verified => {
      if (verified) {
        setPricingRegion(prev => (prev !== verified ? verified : prev))
      }
    })
  }, [])

  const handleRegionChange = (newRegion) => {
    setPricingRegion(newRegion)
    saveUserRegionPreference(newRegion)
  }

  // Calculate avg saving % across plans for selected region
  const avgSaving = (() => {
    const keys = REGION_PRICE_KEYS[pricingRegion]
    const validPlans = plans.filter(p => p[keys.monthly] > 0 && p[keys.yearly] > 0)
    if (!validPlans.length) return null
    const savings = validPlans.map(p => {
      const monthlyAnnual = p[keys.monthly] * 12
      return Math.round(((monthlyAnnual - p[keys.yearly]) / monthlyAnnual) * 100)
    })
    const avg = Math.round(savings.reduce((a, b) => a + b, 0) / savings.length)
    return avg > 0 ? avg : null
  })()

  useEffect(() => {
    // Check if user is already logged in
    const checkAuthStatus = async () => {
      const accessToken = localStorage.getItem('access_token')
      
      if (accessToken) {
        try {
          const progress = await onboardingService.getProgress()
          
          if (progress && !progress.is_completed) {
            // User has verified email but not completed onboarding
            navigate('/onboarding', { replace: true })
          } else if (progress && progress.is_completed) {
            // User has completed onboarding
            navigate('/dashboard', { replace: true })
          }
        } catch {
          // Token invalid, continue showing landing page
          console.log('No valid session')
        }
      }
    }

    checkAuthStatus()

    // Fetch plans
    plansService.getActivePlans()
      .then(data => {
        const list = Array.isArray(data) ? data : (data?.plans || data?.data || data?.items || [])
        setPlans(list)
      })
      .catch(console.error)
      .finally(() => setPlansLoading(false))
  }, [navigate])

  return (
    <main className="relative min-h-screen bg-[#f7f5ef] text-[#1d2433]">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_20%,rgba(247,151,39,0.18),transparent_35%),radial-gradient(circle_at_88%_18%,rgba(36,89,229,0.2),transparent_33%),radial-gradient(circle_at_55%_90%,rgba(16,185,129,0.12),transparent_32%)]" />

      <header className="sticky top-0 z-40 border-b border-black/10 bg-white/85 backdrop-blur-xl">
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-8">
            <img
              src="/logo/WorkMatrix1_logo_design-removebg-preview.png"
              alt="WorkMatrix1"
              className="h-10 w-52 object-contain sm:h-12 sm:w-64 lg:h-14 lg:w-72"
            />
            <div className="hidden items-center gap-7 text-[1rem] font-semibold text-[#252b38] lg:flex">
              <a href="#" className="transition hover:text-[#f68b1f]">Platform</a>
              <a href="#" className="transition hover:text-[#f68b1f]">Use Cases</a>
              <a href="#" className="transition hover:text-[#f68b1f]">Compliance</a>
              <a href="#pricing" onClick={(e) => { e.preventDefault(); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }) }} className="transition hover:text-[#f68b1f]">Pricing</a>
            </div>
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="px-4 py-2.5 text-sm font-bold text-[#273047] transition hover:text-[#f68b1f] cursor-pointer"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="rounded-xl border border-[#d5d9e3] bg-white px-5 py-2.5 text-sm font-bold text-[#273047] transition hover:border-[#9ba4b9] cursor-pointer"
            >
              Book demo
            </button>
            <button
              type="button"
              onClick={() => setShowPlanModal(true)}
              className="rounded-xl bg-linear-to-r from-[#f68b1f] to-[#ffab4f] px-5 py-2.5 text-sm font-bold text-white shadow-[0_10px_25px_rgba(246,139,31,0.25)] transition hover:brightness-105 cursor-pointer"
            >
              Get started free
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-black/15 bg-white lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? 'x' : '='}
          </button>
        </nav>

        <AnimatePresence>
          {mobileMenuOpen && (
            <Motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="border-t border-black/10 bg-white px-5 py-4 lg:hidden"
            >
              <div className="space-y-1 text-base font-semibold text-[#252b38]">
                <a href="#" className="block rounded-lg px-3 py-2 hover:bg-black/5">Platform</a>
                <a href="#" className="block rounded-lg px-3 py-2 hover:bg-black/5">Use Cases</a>
                <a href="#" className="block rounded-lg px-3 py-2 hover:bg-black/5">Compliance</a>
                <a href="#" className="block rounded-lg px-3 py-2 hover:bg-black/5">Pricing</a>
              </div>
              <div className="mt-4 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigate('/login')
                    setMobileMenuOpen(false)
                  }}
                  className="w-full rounded-xl border border-[#d5d9e3] bg-white px-4 py-2.5 text-sm font-bold text-[#273047] text-center"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPlanModal(true)
                    setMobileMenuOpen(false)
                  }}
                  className="w-full rounded-xl bg-linear-to-r from-[#f68b1f] to-[#ffab4f] px-4 py-2.5 text-sm font-bold text-white text-center shadow-md"
                >
                  Get started free
                </button>
              </div>
            </Motion.div>
          )}
        </AnimatePresence>
      </header>

      <section className="mx-auto w-full max-w-7xl px-5 pb-16 pt-10 sm:px-8 sm:pt-14 lg:pt-16">
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_1fr] lg:gap-12">
          <Motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="relative lg:pr-2"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-[#f2d8ba] bg-[#fff3e6] px-4 py-1.5 text-sm font-semibold text-[#8c5f28]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#f68b1f]" />
              Trusted by growing companies worldwide
            </span>

            <h1 className="mt-6 text-3xl font-extrabold leading-[1.08] text-[#1d2433] sm:text-4xl lg:text-[3.2rem] xl:text-[3.5rem]">
              The smartest way to
              <span className="block text-[#f68b1f]">hire, manage &amp; scale globally.</span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#4d5566] sm:text-[1.05rem]">
              WorkMatrix is a B2B HRMS platform purpose-built for global teams. From legal entity registration to payroll compliance, we unify every step of your workforce journey internationally - in one intelligent system of record.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Motion.button
                type="button"
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowPlanModal(true)}
                className="rounded-xl bg-linear-to-r from-[#f68b1f] to-[#ffab4f] px-7 py-3.5 text-base font-bold text-white shadow-[0_16px_30px_rgba(246,139,31,0.25)]"
              >
                Get started free
              </Motion.button>
              <button
                type="button"
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                className="rounded-xl border border-[#d0d6e3] bg-white px-7 py-3.5 text-base font-bold text-[#2a3348] transition hover:border-[#9fa9bf] cursor-pointer"
              >
                Book a demo
              </button>
            </div>

            <div className="mt-10 flex flex-wrap gap-8">
              {[
                { stat: 'Global', label: 'Companies trusted us' },
                { stat: 'Worldwide', label: 'Market coverage' },
                { stat: '8 min', label: 'Avg. setup time' },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-2xl font-extrabold text-[#1d2433]">{item.stat}</p>
                  <p className="mt-0.5 text-sm text-[#6b7688]">{item.label}</p>
                </div>
              ))}
            </div>
          </Motion.div>

          <Motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative flex items-center justify-center lg:justify-end"
          >
            <img
              src="/logo/hero-section.png"
              alt="WorkMatrix HRMS Platform"
              className="w-full max-w-160 object-contain lg:w-[104%]"
            />
          </Motion.div>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {[
            {
              title: 'Global Entity Registration',
              copy: 'Register your company internationally with country-specific compliance fields auto-populated from day one.',
            },
            {
              title: 'Unified HR & Payroll Engine',
              copy: 'Manage employees, contracts, leaves, and payroll across multiple markets from a single, real-time dashboard.',
            },
            {
              title: 'Compliance Autopilot',
              copy: 'Stay audit-ready with automated checks for labor laws, tax filings, and statutory obligations in every operating country.',
            },
          ].map((card, idx) => (
            <Motion.div
              key={card.title}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.22 + idx * 0.08 }}
              className="rounded-2xl border border-[#dde2ec] bg-white px-5 py-5 shadow-[0_10px_24px_rgba(15,22,40,0.08)]"
            >
              <h4 className="text-lg font-bold text-[#222b3f]">{card.title}</h4>
              <p className="mt-2 text-sm leading-relaxed text-[#556078]">{card.copy}</p>
            </Motion.div>
          ))}
        </div>
      </section>

      {/* ── Pricing Section ─────────────────────────────────────────────── */}
      <section id="pricing" className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8">
        {/* Heading */}
        <Motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[#f2d8ba] bg-[#fff3e6] px-4 py-1.5 text-sm font-semibold text-[#8c5f28] mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-[#f68b1f]" />
            Simple, transparent pricing
          </span>
          <h2 className="text-3xl font-extrabold text-[#1d2433] sm:text-4xl">
            Choose the plan that fits your team
          </h2>
          <p className="mt-3 text-base text-[#556078]">
            Start free, scale as you grow. No hidden fees.
          </p>

          {/* Controls row */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {/* Region selector */}
            <div className="flex items-center gap-1 rounded-xl border border-[#dde2ec] bg-white p-1">
              {PRICING_REGIONS.map(r => (
                <button key={r.code} onClick={() => handleRegionChange(r.code)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold transition ${
                    pricingRegion === r.code
                      ? 'bg-[#f68b1f] text-white shadow'
                      : 'text-[#556078] hover:text-[#1d2433]'
                  }`}>
                  {r.flag} {r.code}
                </button>
              ))}
            </div>

            {/* Billing toggle */}
            <div className="flex items-center gap-1 rounded-xl border border-[#dde2ec] bg-white p-1">
              {['monthly', 'yearly'].map(cycle => (
                <button key={cycle} onClick={() => setBillingCycle(cycle)}
                  className={`rounded-lg px-4 py-2 text-sm font-bold capitalize transition ${
                    billingCycle === cycle
                      ? 'bg-[#f68b1f] text-white shadow'
                      : 'text-[#556078] hover:text-[#1d2433]'
                  }`}>
                  {cycle}
                  {cycle === 'yearly' && avgSaving && (
                    <span className="ml-1.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">Save {avgSaving}%</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </Motion.div>

        {/* Loading skeleton */}
        {plansLoading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-96 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        )}

        {/* Plans grid */}
        {!plansLoading && plans.length > 0 && (
          <div className={`grid gap-6 ${plans.length === 1 ? 'max-w-sm mx-auto' : plans.length === 2 ? 'md:grid-cols-2 max-w-3xl mx-auto' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
            {plans.map((plan, idx) => (
              <PricingCard
                key={plan.id || plan.slug}
                plan={plan}
                region={PRICING_REGIONS.find(r => r.code === pricingRegion)}
                billingCycle={billingCycle}
                featured={idx === Math.floor(plans.length / 2)}
                onGetStarted={(slug, cycle, region) =>
                  navigate(`/registration?plan=${slug}&billing=${cycle}&region=${region}`)
                }
              />
            ))}
          </div>
        )}

        {/* Fallback if no plans */}
        {!plansLoading && plans.length === 0 && (
          <div className="text-center py-12 text-[#556078]">
            <p className="text-base">Pricing plans coming soon. <button onClick={() => setShowPlanModal(true)} className="text-[#f68b1f] font-bold underline">Get started free</button></p>
          </div>
        )}
      </section>

      {/* ── Plan Selection Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showPlanModal && (
          <PlanSelectModal
            plans={plans}
            loading={plansLoading}
            initialRegion={pricingRegion}
            onClose={() => setShowPlanModal(false)}
            onSelect={(slug, billing, region) => {
              setShowPlanModal(false)
              navigate(`/registration?plan=${slug}&billing=${billing}&region=${region}`)
            }}
          />
        )}
      </AnimatePresence>

    </main>
  )
}

// ── Plan Select Modal ─────────────────────────────────────────────────────────
function PlanSelectModal({ plans, loading, initialRegion = 'US', onClose, onSelect }) {
  const [region, setRegion]   = useState(initialRegion)
  const [billing, setBilling] = useState('monthly')
  const [selected, setSelected] = useState(null)

  const activeRegion = PRICING_REGIONS.find(r => r.code === region)
  const keys = REGION_PRICE_KEYS[region]

  const availablePlans = plans.filter(p =>
    !p.regions_allowed?.length || p.regions_allowed.includes(region)
  )

  // Calculate avg saving for this region
  const avgSaving = (() => {
    const validPlans = availablePlans.filter(p => p[keys.monthly] > 0 && p[keys.yearly] > 0)
    if (!validPlans.length) return null
    const savings = validPlans.map(p => {
      const monthlyAnnual = p[keys.monthly] * 12
      return Math.round(((monthlyAnnual - p[keys.yearly]) / monthlyAnnual) * 100)
    })
    const avg = Math.round(savings.reduce((a, b) => a + b, 0) / savings.length)
    return avg > 0 ? avg : null
  })()

  const getPlanIcon = (name = '') => {
    if (name.toLowerCase().includes('enterprise')) return Crown
    if (name.toLowerCase().includes('business') || name.toLowerCase().includes('pro') || name.toLowerCase().includes('growth')) return Star
    return Package
  }

  const getPrice = (plan) => {
    const raw = plan[keys[billing]] ?? 0
    return raw === 0 ? 'Free' : `${activeRegion.symbol}${raw.toLocaleString()}`
  }

  const getSaving = (plan) => {
    const m = plan[keys.monthly] ?? 0
    const y = plan[keys.yearly]  ?? 0
    if (!m || !y) return null
    const pct = Math.round(((m * 12 - y) / (m * 12)) * 100)
    return pct > 0 ? pct : null
  }

  return (
    <Motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <Motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-8 py-5 flex items-center justify-between rounded-t-3xl">
          <div>
            <h2 className="text-xl font-extrabold text-[#1d2433]">Choose your plan</h2>
            <p className="text-sm text-slate-500 mt-0.5">Select a plan to continue with registration</p>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 hover:bg-slate-100 transition">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="p-8">
          {/* Region + Billing toggles */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
              {PRICING_REGIONS.map(r => (
                <button key={r.code} onClick={() => setRegion(r.code)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold transition ${
                    region === r.code ? 'bg-white shadow text-[#1d2433]' : 'text-slate-400 hover:text-slate-700'
                  }`}>
                  {r.flag} {r.code}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
              {['monthly', 'yearly'].map(c => (
                <button key={c} onClick={() => setBilling(c)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold capitalize transition ${
                    billing === c ? 'bg-white shadow text-[#1d2433]' : 'text-slate-400 hover:text-slate-700'
                  }`}>
                  {c}
                  {c === 'yearly' && avgSaving && (
                    <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">Save {avgSaving}%</span>
                  )}
                  {c === 'yearly' && !avgSaving && (
                    <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">Save</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#f68b1f] border-r-transparent" />
            </div>
          )}

          {/* Plans grid */}
          {!loading && (
            <div className={`grid gap-4 ${availablePlans.length <= 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
              {availablePlans.map((plan, idx) => {
                const Icon     = getPlanIcon(plan.name)
                const price    = getPrice(plan)
                const saving   = billing === 'yearly' ? getSaving(plan) : null
                const isSelected = selected?.slug === plan.slug
                const isFeatured = idx === Math.floor(availablePlans.length / 2)

                return (
                  <Motion.div
                    key={plan.id || plan.slug}
                    whileHover={{ y: -4 }}
                    onClick={() => setSelected(plan)}
                    className={`relative cursor-pointer rounded-2xl border-2 p-5 transition-all ${
                      isSelected
                        ? 'border-[#f68b1f] bg-[#fff8f0] shadow-[0_8px_30px_rgba(246,139,31,0.2)]'
                        : isFeatured
                          ? 'border-[#1251C5] bg-[#f0f5ff]'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    {isFeatured && !isSelected && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#1251C5] px-3 py-0.5 text-[10px] font-bold text-white">
                        Most Popular
                      </span>
                    )}
                    {isSelected && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#f68b1f] px-3 py-0.5 text-[10px] font-bold text-white flex items-center gap-1">
                        <Check className="h-3 w-3" /> Selected
                      </span>
                    )}

                    <div className="flex items-center gap-3 mb-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isSelected ? 'bg-[#f68b1f]' : 'bg-gradient-to-br from-[#1251C5] to-[#1a6fe8]'}`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-[#1d2433]">{plan.name}</h3>
                        <p className="text-xs text-slate-400">{plan.trial_days}d free trial</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 mb-3 line-clamp-2">{plan.description}</p>

                    <div className="mb-3">
                      <span className="text-2xl font-extrabold text-[#1d2433]">{price}</span>
                      {price !== 'Free' && <span className="text-xs text-slate-400 ml-1">/ {billing === 'monthly' ? 'mo' : 'yr'}</span>}
                      {saving && (
                        <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          Save {saving}%
                        </span>
                      )}
                    </div>

                    <ul className="space-y-1.5 mb-4">
                      <li className="flex items-center gap-2 text-xs text-slate-600">
                        <Users className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        {plan.max_employees === -1 ? 'Unlimited employees' : `Up to ${plan.max_employees} employees`}
                      </li>
                      {plan.api_access && <li className="flex items-center gap-2 text-xs text-slate-600"><Zap className="h-3.5 w-3.5 text-green-500 shrink-0" /> API Access</li>}
                      {plan.sso_enabled && <li className="flex items-center gap-2 text-xs text-slate-600"><Shield className="h-3.5 w-3.5 text-purple-500 shrink-0" /> SSO</li>}
                      {Object.entries(plan.modules_json || {}).filter(([,v]) => v).slice(0, 3).map(([mod]) => (
                        <li key={mod} className="flex items-center gap-2 text-xs text-slate-600">
                          <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span className="capitalize">{mod.replace(/_/g, ' ')}</span>
                        </li>
                      ))}
                    </ul>

                    <div className={`w-full rounded-xl py-2 text-center text-xs font-bold transition ${
                      isSelected
                        ? 'bg-[#f68b1f] text-white'
                        : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                    }`}>
                      {isSelected ? '✓ Selected' : 'Select Plan'}
                    </div>
                  </Motion.div>
                )
              })}
            </div>
          )}

          {/* CTA */}
          <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
            <button onClick={onClose} className="text-sm font-semibold text-slate-400 hover:text-slate-700">
              Cancel
            </button>
            <Motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              disabled={!selected}
              onClick={() => selected && onSelect(selected.slug, billing, region)}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#f68b1f] to-[#ffab4f] px-8 py-3 text-sm font-bold text-white shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue with {selected ? selected.name : 'a plan'}
              <ChevronRight className="h-4 w-4" />
            </Motion.button>
          </div>
        </div>
      </Motion.div>
    </Motion.div>
  )
}

// ── Pricing Card ─────────────────────────────────────────────────────────────
function PricingCard({ plan, region, billingCycle, featured, onGetStarted }) {
  const priceKey = REGION_PRICE_KEYS[region.code]?.[billingCycle]
  const rawPrice = plan[priceKey] ?? 0
  const displayPrice = rawPrice === 0 ? 'Free'
    : `${region.symbol}${rawPrice.toLocaleString()}`

  // Calculate saving % for this plan in this region
  const monthlyKey = REGION_PRICE_KEYS[region.code]?.monthly
  const yearlyKey  = REGION_PRICE_KEYS[region.code]?.yearly
  const monthly = plan[monthlyKey] ?? 0
  const yearly  = plan[yearlyKey] ?? 0
  const savingPct = (monthly > 0 && yearly > 0)
    ? Math.round(((monthly * 12 - yearly) / (monthly * 12)) * 100)
    : null

  const modules = Object.entries(plan.modules_json || {}).filter(([, v]) => v)
  const isAvailableInRegion = plan.regions_allowed?.includes(region.code)

  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
      className={`relative flex flex-col rounded-2xl border p-7 transition-shadow hover:shadow-xl ${
        featured
          ? 'border-[#f68b1f] bg-gradient-to-b from-[#fff8f0] to-white shadow-[0_16px_40px_rgba(246,139,31,0.18)]'
          : 'border-[#dde2ec] bg-white shadow-[0_8px_24px_rgba(15,22,40,0.07)]'
      } ${!isAvailableInRegion ? 'opacity-50' : ''}`}
    >
      {featured && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#f68b1f] px-4 py-1 text-xs font-bold text-white shadow">
          Most Popular
        </span>
      )}

      {!isAvailableInRegion && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-slate-400 px-4 py-1 text-xs font-bold text-white">
          Not available in {region.code}
        </span>
      )}

      {/* Plan name */}
      <div className="mb-5">
        <h3 className="text-lg font-extrabold text-[#1d2433]">{plan.name}</h3>
        {plan.description && (
          <p className="mt-1.5 text-sm text-[#556078] leading-relaxed">{plan.description}</p>
        )}
      </div>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-end gap-1">
          <span className="text-4xl font-extrabold text-[#1d2433]">{displayPrice}</span>
          {rawPrice > 0 && <span className="mb-1 text-sm text-[#8a93a6]">/ {billingCycle === 'monthly' ? 'mo' : 'yr'}</span>}
        </div>
        <p className="mt-1 text-xs text-slate-400">{region.flag} {region.label} · {region.currency}</p>
        {billingCycle === 'yearly' && savingPct > 0 && (
          <span className="mt-1.5 inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
            Save {savingPct}% vs monthly
          </span>
        )}
        {plan.trial_days > 0 && (
          <p className="mt-1 text-xs text-emerald-600 font-semibold">{plan.trial_days}-day free trial</p>
        )}
      </div>

      {/* Limits & features */}
      <ul className="mb-6 space-y-2.5">
        <li className="flex items-center gap-2 text-sm text-[#3d4a5c]">
          <Users className="h-4 w-4 shrink-0 text-[#f68b1f]" />
          {plan.max_employees === -1 ? 'Unlimited employees' : `Up to ${plan.max_employees} employees`}
        </li>
        <li className="flex items-center gap-2 text-sm text-[#3d4a5c]">
          <Check className="h-4 w-4 shrink-0 text-[#f68b1f]" />
          {plan.max_admin_users} admin {plan.max_admin_users === 1 ? 'user' : 'users'}
        </li>
        {plan.api_access && (
          <li className="flex items-center gap-2 text-sm text-[#3d4a5c]">
            <Zap className="h-4 w-4 shrink-0 text-[#f68b1f]" /> API Access
          </li>
        )}
        {plan.sso_enabled && (
          <li className="flex items-center gap-2 text-sm text-[#3d4a5c]">
            <Shield className="h-4 w-4 shrink-0 text-[#f68b1f]" /> SSO / SAML
          </li>
        )}
        {plan.white_label && (
          <li className="flex items-center gap-2 text-sm text-[#3d4a5c]">
            <Tag className="h-4 w-4 shrink-0 text-[#f68b1f]" /> White Label
          </li>
        )}
        {modules.map(([mod]) => (
          <li key={mod} className="flex items-center gap-2 text-sm text-[#3d4a5c]">
            <Check className="h-4 w-4 shrink-0 text-emerald-500" />
            <span className="capitalize">{mod.replace(/_/g, ' ')}</span>
          </li>
        ))}
      </ul>

      {/* Support */}
      <div className="mb-6 rounded-lg bg-slate-50 px-3 py-2 text-xs text-[#556078]">
        Support: <span className="font-semibold capitalize text-[#1d2433]">{plan.support_tier}</span>
      </div>

      {/* CTA */}
      <button
        onClick={() => onGetStarted(plan.slug, billingCycle, region.code)}
        disabled={!isAvailableInRegion}
        className={`mt-auto w-full rounded-xl py-3 text-sm font-bold transition disabled:cursor-not-allowed ${
          featured
            ? 'bg-gradient-to-r from-[#f68b1f] to-[#ffab4f] text-white shadow-[0_10px_25px_rgba(246,139,31,0.25)] hover:brightness-105'
            : 'border border-[#d0d6e3] bg-white text-[#2a3348] hover:border-[#f68b1f] hover:text-[#f68b1f]'
        }`}
      >
        {!isAvailableInRegion ? `Not available in ${region.code}` : rawPrice === 0 ? 'Get started free' : 'Start free trial'}
      </button>
    </Motion.div>
  )
}

export default LandingPage
