/**
 * Step 6 — Company Size (per doc §4.2)
 *
 * Required. Grid buttons: 1–10 / 11–50 / 51–200 / 201–500 / 501–1000 / 1000+
 * Routes to the correct plan recommendation.
 */
function StepSixCompanySize({ companySizes, selectedSize, onSizeSelect }) {
  return (
    <div className="flex flex-col">
      <h2 className="text-[1.55rem] leading-tight font-bold text-[#101828]">How big is your company?</h2>
      <p className="mt-3 text-sm text-[#3a4355]">We'll recommend the best plan based on your company size.</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {companySizes.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onSizeSelect(item.value)}
            className={`rounded-md border px-5 py-3 text-sm font-semibold transition ${
              selectedSize === item.value
                ? 'border-[#f68b1f] bg-[#fff3e6] text-[#8c5f28]'
                : 'border-[#b9bec8] bg-white text-[#111827] hover:bg-[#f7f8fb]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default StepSixCompanySize
