function StepEightCompanyName({ companyName, onCompanyNameChange }) {
  return (
    <div className="flex flex-col">
      <h2 className="text-[1.55rem] leading-tight font-bold text-[#101828]">What is your company's name?</h2>
      <p className="mt-3 text-sm text-[#3a4355]">We'll use your company name to make things feel more familiar.</p>

      <div className="mt-10 max-w-96">
        <label className="mb-1.5 block text-sm font-semibold text-[#111827]">Company name *</label>
        <input
          type="text"
          value={companyName}
          onChange={(event) => onCompanyNameChange(event.target.value)}
          className="w-full rounded-md border border-[#0091ae] px-4 py-3 text-sm outline-none focus:border-[#1e66d0] focus:ring-2 focus:ring-[#1e66d0]/20"
        />
      </div>

      <div className="mt-auto pt-16">
        <p className="text-xs text-[#3a4355]">
          Your data will be hosted in the <span className="font-semibold text-[#111827]">United States</span>. By creating an
          account you are agreeing to the{' '}
          <button type="button" className="underline">
            HubSpot Customer Terms of Service
          </button>
        </p>
      </div>
    </div>
  )
}

export default StepEightCompanyName
