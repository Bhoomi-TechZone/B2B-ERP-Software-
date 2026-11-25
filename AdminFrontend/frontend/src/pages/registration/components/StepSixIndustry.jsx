function StepSixIndustry({ industries, selectedIndustry, onIndustrySelect }) {
  return (
    <div className="flex flex-col">
      <h2 className="text-[1.55rem] leading-tight font-bold text-[#101828]">What industry are you in?</h2>
      <p className="mt-3 text-sm text-[#3a4355]">We'll focus your experience based on your choice.</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {industries.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onIndustrySelect(item)}
            className={`rounded-md border px-5 py-3 text-sm font-semibold transition ${
              selectedIndustry === item
                ? 'border-[#f68b1f] bg-[#fff3e6] text-[#8c5f28]'
                : 'border-[#b9bec8] bg-white text-[#111827] hover:bg-[#f7f8fb]'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <p className="mt-6 text-sm text-[#3a4355]">
        Industry not listed?{' '}
        <button type="button" className="font-semibold text-[#0091ae] underline">
          Search all
        </button>
      </p>
    </div>
  )
}

export default StepSixIndustry
