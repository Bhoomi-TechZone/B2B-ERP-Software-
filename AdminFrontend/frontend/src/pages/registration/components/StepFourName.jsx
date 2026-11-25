/**
 * Step 4 — First Name + Last Name + Phone Number (per doc §4.1)
 *
 * First Name: 2–50 chars, no numbers. Side-by-side with Last Name on desktop.
 * Phone Number: Optional, E.164 format, country auto-selected from geo-IP.
 */
function StepFourName({ firstName, lastName, phone, onFirstNameChange, onLastNameChange, onPhoneChange }) {
  return (
    <div className="flex flex-col">
      <h2 className="text-[1.55rem] leading-tight font-bold text-[#101828]">Welcome, what is your name?</h2>
      <p className="mt-3 text-sm text-[#3a4355]">We'll use this to personalise your experience.</p>

      <div className="mt-10 max-w-160 space-y-5">
        {/* Side-by-side on desktop per doc §4.1 */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="mb-1.5 block text-base font-semibold text-[#111827]">First Name *</label>
            <input
              type="text"
              autoFocus
              placeholder="John"
              maxLength={50}
              value={firstName}
              onChange={(event) => onFirstNameChange(event.target.value)}
              className="w-full rounded-md border border-[#9ca3af] px-4 py-3 text-sm outline-none focus:border-[#1e66d0] focus:ring-2 focus:ring-[#1e66d0]/20"
            />
            {firstName.length > 0 && firstName.trim().length < 2 && (
              <p className="mt-1 text-xs text-red-500">Minimum 2 characters</p>
            )}
            {firstName.length > 0 && /\d/.test(firstName) && (
              <p className="mt-1 text-xs text-red-500">Numbers are not allowed</p>
            )}
          </div>

          <div className="flex-1">
            <label className="mb-1.5 block text-base font-semibold text-[#111827]">Last Name *</label>
            <input
              type="text"
              placeholder="Doe"
              maxLength={50}
              value={lastName}
              onChange={(event) => onLastNameChange(event.target.value)}
              className="w-full rounded-md border border-[#9ca3af] px-4 py-3 text-sm outline-none focus:border-[#1e66d0] focus:ring-2 focus:ring-[#1e66d0]/20"
            />
            {lastName.length > 0 && lastName.trim().length < 2 && (
              <p className="mt-1 text-xs text-red-500">Minimum 2 characters</p>
            )}
          </div>
        </div>

        {/* Phone Number — Required, E.164, used for MFA fallback (per doc §4.1) */}
        <div>
          <label className="mb-1.5 block text-base font-semibold text-[#111827]">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <select 
              className="w-24 rounded-md border border-[#9ca3af] bg-white px-2 py-3 text-sm outline-none focus:border-[#1e66d0] focus:ring-2 focus:ring-[#1e66d0]/20"
              value={phone.match(/^\+\d+/)?.[0] || '+91'}
              onChange={(e) => {
                const code = e.target.value
                const currentNumber = phone.replace(/^\+\d+\s?/, '')
                onPhoneChange(code + ' ' + currentNumber)
              }}
            >
              <option value="+91">🇮🇳 +91</option>
              <option value="+1">🇺🇸 +1</option>
              <option value="+44">🇬🇧 +44</option>
            </select>
            <input
              type="tel"
              placeholder="98765 43210"
              maxLength={10} // Most common for these 3 countries
              value={phone.replace(/^\+\d+\s?/, '')}
              onChange={(event) => {
                const val = event.target.value.replace(/\D/g, '')
                const prefix = phone.match(/^\+\d+\s?/)?.[0] || '+91 '
                onPhoneChange(prefix.trim() + ' ' + val)
              }}
              className="flex-1 rounded-md border border-[#9ca3af] px-4 py-3 text-sm outline-none focus:border-[#1e66d0] focus:ring-2 focus:ring-[#1e66d0]/20"
            />
          </div>
          {phone.replace(/^\+\d+\s?/, '').length > 0 && phone.replace(/^\+\d+\s?/, '').length < 10 && (
            <p className="mt-1 text-xs text-red-500">Please enter a valid 10-digit number</p>
          )}
          <p className="mt-1 text-xs text-[#8b95a8]">Used for MFA fallback. Choose your country code.</p>
        </div>
      </div>
    </div>
  )
}

export default StepFourName
