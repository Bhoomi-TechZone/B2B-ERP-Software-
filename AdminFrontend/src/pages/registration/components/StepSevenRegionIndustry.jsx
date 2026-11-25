import { useState, useMemo } from 'react'

/**
 * Step 7 — Primary Region + Industry (per doc §4.2)
 *
 * Primary Region: Required. US / UK / India. Sets compliance defaults.
 * Industry: Searchable dropdown, ~30 options, optional.
 */
function StepSevenRegionIndustry({
  primaryRegion,
  regions,
  onRegionSelect,
  industry,
  industries,
  onIndustrySelect,
}) {
  const [industrySearch, setIndustrySearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  const filteredIndustries = useMemo(() => {
    if (!industrySearch.trim()) return industries
    const q = industrySearch.toLowerCase()
    return industries.filter((i) => i.toLowerCase().includes(q))
  }, [industrySearch, industries])

  return (
    <div className="flex flex-col">
      <h2 className="text-[1.55rem] leading-tight font-bold text-[#101828]">Where does your company operate?</h2>
      <p className="mt-3 text-sm text-[#3a4355]">This sets your compliance defaults and regional features.</p>

      {/* ── Primary Region * ── */}
      <div className="mt-10">
        <label className="mb-3 block text-base font-semibold text-[#111827]">Primary Region *</label>
        <div className="grid gap-4 sm:grid-cols-3">
          {regions.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => onRegionSelect(r.value)}
              className={`rounded-md border px-5 py-3 text-sm font-semibold transition ${
                primaryRegion === r.value
                  ? 'border-[#f68b1f] bg-[#fff3e6] text-[#8c5f28]'
                  : 'border-[#b9bec8] bg-white text-[#111827] hover:bg-[#f7f8fb]'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-[#8b95a8]">Additional regions can be added post-onboarding.</p>
      </div>

      {/* ── Industry (searchable dropdown, optional) ── */}
      <div className="mt-8 relative">
        <label className="mb-1.5 block text-base font-semibold text-[#111827]">
          Industry <span className="text-sm font-normal text-[#8b95a8]">(Optional)</span>
        </label>
        <div className="relative max-w-140">
          <input
            type="text"
            placeholder="Search industry..."
            value={industry || industrySearch}
            onChange={(e) => {
              setIndustrySearch(e.target.value)
              if (industry) onIndustrySelect('')
              setShowDropdown(true)
            }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            className="w-full rounded-md border border-[#9ca3af] px-4 py-3 text-sm outline-none focus:border-[#1e66d0] focus:ring-2 focus:ring-[#1e66d0]/20"
          />
          {industry && (
            <button
              type="button"
              onClick={() => { onIndustrySelect(''); setIndustrySearch('') }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#8b95a8] hover:text-red-500"
            >
              ✕
            </button>
          )}
          {showDropdown && !industry && filteredIndustries.length > 0 && (
            <div className="absolute z-20 mt-1 max-h-52 w-full overflow-y-auto rounded-md border border-[#d5d9e3] bg-white shadow-lg">
              {filteredIndustries.map((item) => (
                <button
                  key={item}
                  type="button"
                  onMouseDown={() => {
                    onIndustrySelect(item)
                    setIndustrySearch('')
                    setShowDropdown(false)
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-[#111827] hover:bg-[#f7f8fb] transition"
                >
                  {item}
                </button>
              ))}
            </div>
          )}
          {showDropdown && !industry && filteredIndustries.length === 0 && (
            <div className="absolute z-20 mt-1 w-full rounded-md border border-[#d5d9e3] bg-white p-3 shadow-lg">
              <p className="text-sm text-[#8b95a8]">No matching industry found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StepSevenRegionIndustry
