import { useState, useMemo } from 'react'

/**
 * Registration Step 2 — Company Details (per document §4.2)
 *
 * Fields: Company Name*, Company Size*, Industry (searchable, optional),
 *         Primary Region*, Referral / Promo Code (optional),
 *         Plan (read-only), Billing Cycle* (radio)
 */
function StepTwoCompanyDetails({
  companyName,
  onCompanyNameChange,
  companySize,
  companySizes,
  onCompanySizeSelect,
  industry,
  industries,
  onIndustrySelect,
  primaryRegion,
  regions,
  onRegionSelect,
  promoCode,
  onPromoCodeChange,
  promoStatus,
  selectedPlan,
  plans,
  billingCycle,
  billingCycles,
  onBillingCycleChange,
}) {
  const [industrySearch, setIndustrySearch] = useState('')
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false)

  const filteredIndustries = useMemo(() => {
    if (!industrySearch.trim()) return industries
    const q = industrySearch.toLowerCase()
    return industries.filter((i) => i.toLowerCase().includes(q))
  }, [industrySearch, industries])

  return (
    <div className="flex flex-col">
      <h2 className="text-[1.55rem] leading-tight font-bold text-[#101828]">
        Tell us about your company
      </h2>
      <p className="mt-2 text-sm text-[#3a4355]">
        This information helps us set up your workspace with the right defaults.
      </p>

      <div className="mt-8 max-w-160 space-y-5">

        {/* ── Company Name * ── */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[#111827]">
            Company Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            autoFocus
            placeholder="Acme Corporation"
            maxLength={100}
            value={companyName}
            onChange={(e) => onCompanyNameChange(e.target.value)}
            className="w-full rounded-md border border-[#9ca3af] px-4 py-3 text-sm outline-none focus:border-[#1e66d0] focus:ring-2 focus:ring-[#1e66d0]/20"
          />
          <p className="mt-1 text-xs text-[#8b95a8]">Shown on payslips and reports</p>
          {companyName.length > 0 && companyName.trim().length < 2 && (
            <p className="mt-1 text-xs text-red-500">Minimum 2 characters</p>
          )}
        </div>

        {/* ── Company Size * (grid buttons) ── */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-[#111827]">
            Company Size <span className="text-red-500">*</span>
          </label>
          <div className="grid gap-3 sm:grid-cols-3">
            {companySizes.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onCompanySizeSelect(item)}
                className={`rounded-md border px-4 py-2.5 text-sm font-semibold transition ${
                  companySize === item
                    ? 'border-[#f68b1f] bg-[#fff3e6] text-[#8c5f28]'
                    : 'border-[#b9bec8] bg-white text-[#111827] hover:bg-[#f7f8fb]'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-[#8b95a8]">Routes you to the recommended plan</p>
        </div>

        {/* ── Industry (searchable dropdown, optional) ── */}
        <div className="relative">
          <label className="mb-1.5 block text-sm font-semibold text-[#111827]">
            Industry <span className="text-xs font-normal text-[#8b95a8]">(Optional)</span>
          </label>
          <input
            type="text"
            placeholder="Search industry..."
            value={industry || industrySearch}
            onChange={(e) => {
              setIndustrySearch(e.target.value)
              if (industry) onIndustrySelect('')
              setShowIndustryDropdown(true)
            }}
            onFocus={() => setShowIndustryDropdown(true)}
            onBlur={() => setTimeout(() => setShowIndustryDropdown(false), 200)}
            className="w-full rounded-md border border-[#9ca3af] px-4 py-3 text-sm outline-none focus:border-[#1e66d0] focus:ring-2 focus:ring-[#1e66d0]/20"
          />
          {industry && (
            <button
              type="button"
              onClick={() => { onIndustrySelect(''); setIndustrySearch('') }}
              className="absolute right-3 top-9 text-xs text-[#8b95a8] hover:text-red-500"
            >
              ✕
            </button>
          )}
          {showIndustryDropdown && filteredIndustries.length > 0 && !industry && (
            <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-[#d5d9e3] bg-white shadow-lg">
              {filteredIndustries.map((item) => (
                <button
                  key={item}
                  type="button"
                  onMouseDown={() => {
                    onIndustrySelect(item)
                    setIndustrySearch('')
                    setShowIndustryDropdown(false)
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-[#111827] hover:bg-[#f7f8fb] transition"
                >
                  {item}
                </button>
              ))}
            </div>
          )}
          {showIndustryDropdown && filteredIndustries.length === 0 && !industry && (
            <div className="absolute z-20 mt-1 w-full rounded-md border border-[#d5d9e3] bg-white p-3 shadow-lg">
              <p className="text-sm text-[#8b95a8]">No matching industry found</p>
            </div>
          )}
        </div>

        {/* ── Primary Region * ── */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-[#111827]">
            Primary Region <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-3">
            {regions.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => onRegionSelect(r.value)}
                className={`flex-1 rounded-md border px-4 py-2.5 text-sm font-semibold transition ${
                  primaryRegion === r.value
                    ? 'border-[#f68b1f] bg-[#fff3e6] text-[#8c5f28]'
                    : 'border-[#b9bec8] bg-white text-[#111827] hover:bg-[#f7f8fb]'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-[#8b95a8]">Sets compliance defaults. Additional regions can be added post-onboarding.</p>
        </div>

        {/* ── Referral / Promo Code (optional) ── */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[#111827]">
            Referral / Promo Code <span className="text-xs font-normal text-[#8b95a8]">(Optional)</span>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => onPromoCodeChange(e.target.value)}
              className={`w-full rounded-md border px-4 py-3 text-sm outline-none focus:ring-2 transition ${
                promoStatus === 'valid'
                  ? 'border-green-400 focus:border-green-500 focus:ring-green-200'
                  : promoStatus === 'invalid'
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                    : 'border-[#9ca3af] focus:border-[#1e66d0] focus:ring-[#1e66d0]/20'
              }`}
            />
            {promoStatus === 'valid' && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs font-semibold text-green-600">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-white text-[10px]">✓</span>
                Discount applied
              </span>
            )}
          </div>
          {promoStatus === 'invalid' && (
            <p className="mt-1 text-xs text-red-500">Invalid promo code</p>
          )}
        </div>

        {/* ── Plan (read-only, pre-selected) ── */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[#111827]">
            Selected Plan
          </label>
          <div className="flex items-center gap-3 rounded-md border border-[#d5d9e3] bg-[#f9fafb] px-4 py-3">
            <span className="flex-1 text-sm font-semibold text-[#111827]">
              {plans.find((p) => p.slug === selectedPlan)?.label || 'Starter (Free Trial)'}
            </span>
            <span className="text-xs text-[#0091ae] font-semibold cursor-pointer hover:underline">
              Change plan
            </span>
          </div>
          <p className="mt-1 text-xs text-[#8b95a8]">Defaults to Trial (Starter) if none selected</p>
        </div>

        {/* ── Billing Cycle * (radio) ── */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-[#111827]">
            Billing Cycle <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-4">
            {billingCycles.map((bc) => (
              <label
                key={bc.value}
                className={`flex flex-1 cursor-pointer items-center gap-3 rounded-md border px-4 py-3 text-sm font-semibold transition ${
                  billingCycle === bc.value
                    ? 'border-[#f68b1f] bg-[#fff3e6] text-[#8c5f28]'
                    : 'border-[#b9bec8] bg-white text-[#111827] hover:bg-[#f7f8fb]'
                }`}
              >
                <input
                  type="radio"
                  name="billingCycle"
                  value={bc.value}
                  checked={billingCycle === bc.value}
                  onChange={() => onBillingCycleChange(bc.value)}
                  className="accent-[#f68b1f]"
                />
                <span>{bc.label}</span>
                {bc.value === 'annual' && (
                  <span className="ml-auto rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
                    Save 20%
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* ── Legal footer ── */}
      <div className="mt-auto pt-10">
        <p className="text-xs text-[#3a4355]">
          By creating an account you are agreeing to the{' '}
          <a href="#" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#111]">
            HRMS Platform Customer Terms of Service
          </a>
          . Your data will be hosted based on your selected primary region.
        </p>
      </div>
    </div>
  )
}

export default StepTwoCompanyDetails
