function StepSevenCompanySize({ companySizes, selectedSize, onSizeSelect }) {
  return (
    <div className="flex flex-col">
      <h2 className="text-[1.55rem] leading-tight font-bold text-[#101828]">How big is your company?</h2>
      <p className="mt-3 text-sm text-[#3a4355]">We'll use this to recommend the best plan for your business.</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {companySizes.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onSizeSelect(item)}
            className={`rounded-md border px-5 py-3 text-sm font-semibold transition ${
              selectedSize === item
                ? 'border-[#f68b1f] bg-[#fff3e6] text-[#8c5f28]'
                : 'border-[#b9bec8] bg-white text-[#111827] hover:bg-[#f7f8fb]'
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  )
}

export default StepSevenCompanySize
