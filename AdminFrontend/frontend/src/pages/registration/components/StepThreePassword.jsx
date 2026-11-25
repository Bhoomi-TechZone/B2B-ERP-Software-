/**
 * Step 3 — Password + Confirm Password (per doc §4.1)
 *
 * Password: Min 8 chars, 1 uppercase, 1 number, 1 special character.
 * Live strength meter bar + requirements checklist tooltip.
 * Show/hide toggle. Confirm Password must match.
 */
function StepThreePassword({
  password,
  showPassword,
  passwordRules,
  onPasswordChange,
  onToggleShowPassword,
  confirmPassword,
  showConfirmPassword,
  onConfirmPasswordChange,
  onToggleShowConfirmPassword,
}) {
  const isPasswordValid = Object.values(passwordRules).every(Boolean)
  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword
  const strengthCount = Object.values(passwordRules).filter(Boolean).length

  return (
    <div className="flex flex-col">
      <h2 className="text-[1.55rem] leading-tight font-bold text-[#101828]">Create your password</h2>

      {/* ── Password ── */}
      <label className="mt-8 block text-base font-semibold text-[#111827]">Password *</label>
      <div className="mt-3 flex max-w-140 gap-3">
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
          className="flex-1 rounded-md border border-[#9ca3af] px-4 py-3 text-sm outline-none focus:border-[#1e66d0] focus:ring-2 focus:ring-[#1e66d0]/20"
        />
        <button
          type="button"
          onClick={onToggleShowPassword}
          className="rounded-md border border-[#9ca3af] px-4 text-base font-semibold text-[#374151]"
        >
          {showPassword ? 'Hide' : 'Show'}
        </button>
      </div>

      {/* Live strength meter bar (per doc §4.1) */}
      {password.length > 0 && (
        <div className="mt-3 max-w-140">
          <div className="h-1.5 w-full rounded-full bg-[#e5e7eb] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                strengthCount <= 1
                  ? 'w-1/4 bg-red-500'
                  : strengthCount === 2
                    ? 'w-1/2 bg-orange-400'
                    : strengthCount === 3
                      ? 'w-3/4 bg-yellow-400'
                      : 'w-full bg-green-500'
              }`}
            />
          </div>
          <p className={`mt-1 text-xs font-medium ${
            strengthCount <= 1 ? 'text-red-500' : strengthCount === 2 ? 'text-orange-500' : strengthCount === 3 ? 'text-yellow-600' : 'text-green-600'
          }`}>
            {strengthCount <= 1 ? 'Weak' : strengthCount === 2 ? 'Fair' : strengthCount === 3 ? 'Good' : 'Strong'}
          </p>
        </div>
      )}

      {/* Requirements checklist (per doc §4.1) */}
      <ul className="mt-5 space-y-3 text-sm text-[#3f4757]">
        {[
          { label: 'At least 8 characters',     ok: passwordRules.length },
          { label: 'One uppercase character',    ok: passwordRules.upper },
          { label: 'One number',                 ok: passwordRules.number },
          { label: 'One special character',      ok: passwordRules.special },
        ].map((rule) => (
          <li key={rule.label} className="flex items-center gap-3">
            <span
              className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                rule.ok ? 'bg-[#0e8f44] text-white' : 'bg-[#d1d5db] text-[#4b5563]'
              }`}
            >
              {rule.ok ? '✓' : '!'}
            </span>
            <span>{rule.label}</span>
          </li>
        ))}
      </ul>

      {/* ── Confirm Password (per doc §4.1) ── */}
      <label className="mt-8 block text-base font-semibold text-[#111827]">Confirm Password *</label>
      <div className="mt-3 flex max-w-140 gap-3">
        <input
          type={showConfirmPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(event) => onConfirmPasswordChange(event.target.value)}
          className={`flex-1 rounded-md border px-4 py-3 text-sm outline-none focus:ring-2 ${
            confirmPassword.length > 0 && !passwordsMatch
              ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
              : 'border-[#9ca3af] focus:border-[#1e66d0] focus:ring-[#1e66d0]/20'
          }`}
        />
        <button
          type="button"
          onClick={onToggleShowConfirmPassword}
          className="rounded-md border border-[#9ca3af] px-4 text-base font-semibold text-[#374151]"
        >
          {showConfirmPassword ? 'Hide' : 'Show'}
        </button>
      </div>
      {confirmPassword.length > 0 && !passwordsMatch && (
        <p className="mt-2 text-xs font-medium text-red-600">Passwords do not match.</p>
      )}
      {confirmPassword.length > 0 && passwordsMatch && (
        <p className="mt-2 text-xs font-medium text-green-600">✓ Passwords match</p>
      )}
    </div>
  )
}

export default StepThreePassword
