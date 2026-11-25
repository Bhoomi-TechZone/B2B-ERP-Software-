/**
 * Step 8 — Billing Cycle + Promo Code + Terms & Marketing + Plan display (per doc §4.1 & §4.2)
 *
 * Billing Cycle: Monthly / Annual radio. Annual shows savings badge.
 * Referral / Promo Code: Optional, validated on blur. Green tick on valid.
 * Plan: Read-only, pre-selected. 'Change plan' link.
 * Terms & Privacy: Required checkbox. Links open in new tab.
 * Marketing Opt-in: Optional, pre-unchecked.
 */
function StepEightBillingTerms({
  billingCycle,
  billingCycles,
  onBillingCycleChange,
  promoCode,
  onPromoCodeChange,
  promoStatus,
  selectedPlan,
  plans,
  termsAccepted,
  onTermsChange,
  marketingOptIn,
  onMarketingChange,
}) {
  return (
    <div className="flex flex-col">
      <h2 className="text-[1.55rem] leading-tight font-bold text-[#101828]">Almost there! Choose your plan</h2>
      <p className="mt-3 text-sm text-[#3a4355]">Select your billing preference and review before creating your account.</p>

      <div className="mt-10 max-w-160 space-y-6">

        {/* ── Plan (read-only, pre-selected) ── */}
        <div>
          <label className="mb-1.5 block text-base font-semibold text-[#111827]">Selected Plan</label>
          <div className="flex items-center gap-3 rounded-md border border-[#d5d9e3] bg-[#f9fafb] px-4 py-3">
            <span className="flex-1 text-sm font-semibold text-[#111827]">
              {plans.find((p) => p.slug === selectedPlan)?.label || 'Starter (Free Trial)'}
            </span>
            <span className="text-xs text-[#0091ae] font-semibold cursor-pointer hover:underline">
              Change plan
            </span>
          </div>
          <p className="mt-1 text-xs text-[#8b95a8]">Defaults to Trial (Starter) if none selected from pricing page</p>
        </div>

        {/* ── Billing Cycle * (radio per doc §4.2) ── */}
        <div>
          <label className="mb-2 block text-base font-semibold text-[#111827]">Billing Cycle *</label>
          <div className="flex gap-4">
            {billingCycles.map((bc) => (
              <label
                key={bc.value}
                className={`flex flex-1 cursor-pointer items-center gap-3 rounded-md border px-5 py-3 text-sm font-semibold transition ${
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

        {/* ── Referral / Promo Code (optional, validated on blur) ── */}
        <div>
          <label className="mb-1.5 block text-base font-semibold text-[#111827]">
            Referral / Promo Code <span className="text-sm font-normal text-[#8b95a8]">(Optional)</span>
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
            <p className="mt-1 text-xs text-red-500">Invalid or expired promo code</p>
          )}
        </div>

        {/* ── Terms & Privacy * ── */}
        <div className="space-y-3 pt-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => onTermsChange(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-[#d2d9e7] accent-[#f68b1f]"
            />
            <span className="text-sm text-[#4d5566]">
              I agree to the{' '}
              <a href="#" target="_blank" rel="noopener noreferrer" className="font-semibold underline hover:text-[#1d2433]">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" target="_blank" rel="noopener noreferrer" className="font-semibold underline hover:text-[#1d2433]">
                Privacy Policy
              </a>{' '}
              <span className="text-red-500">*</span>
            </span>
          </label>

          {/* Marketing Opt-in (pre-unchecked per doc §4.1) */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={marketingOptIn}
              onChange={(e) => onMarketingChange(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-[#d2d9e7] accent-[#f68b1f]"
            />
            <span className="text-sm text-[#4d5566]">
              I'd like to receive product updates, tips, and marketing communications.
            </span>
          </label>
        </div>
      </div>

      {/* ── Legal footer ── */}
      <div className="mt-auto pt-12">
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

export default StepEightBillingTerms
