/**
 * Step 5 — Company Name (per doc §4.2)
 *
 * Required, 2–100 chars. Becomes the tenant name.
 * Shown on payslips/reports.
 */
function StepFiveCompanyName({ companyName, onCompanyNameChange }) {
  return (
    <div className="flex flex-col">
      <h2 className="text-[1.55rem] leading-tight font-bold text-[#101828]">What is your company's name?</h2>
      <p className="mt-3 text-sm text-[#3a4355]">This becomes your tenant name and appears on payslips & reports.</p>

      <div className="mt-10 max-w-96">
        <label className="mb-1.5 block text-sm font-semibold text-[#111827]">Company Name *</label>
        <input
          type="text"
          autoFocus
          placeholder="Acme Corporation"
          maxLength={100}
          value={companyName}
          onChange={(event) => onCompanyNameChange(event.target.value)}
          className="w-full rounded-md border border-[#0091ae] px-4 py-3 text-sm outline-none focus:border-[#1e66d0] focus:ring-2 focus:ring-[#1e66d0]/20"
        />
        {companyName.length > 0 && companyName.trim().length < 2 && (
          <p className="mt-2 text-xs text-red-500">Minimum 2 characters required</p>
        )}
      </div>
    </div>
  )
}

export default StepFiveCompanyName
