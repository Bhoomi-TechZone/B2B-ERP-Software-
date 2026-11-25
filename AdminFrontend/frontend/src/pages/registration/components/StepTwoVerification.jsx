function StepTwoVerification({
  email,
  verificationCode,
  codeRefs,
  onCodeChange,
  onCodeKeyDown,
  onEditEmail,
}) {
  return (
    <div className="flex flex-col">
      <h2 className="text-[1.55rem] leading-tight font-bold text-[#101828]">Check your email</h2>
      <p className="mt-2 text-sm text-[#3a4355]">
        We have sent your verification code to <span className="font-semibold text-[#111827]">{email}</span>
      </p>

      <p className="mt-8 text-sm font-semibold text-[#111827]">Verification code *</p>
      <div className="mt-4 flex flex-wrap gap-3">
        {verificationCode.map((digit, index) => (
          <input
            key={String(index)}
            ref={(node) => {
              codeRefs.current[index] = node
            }}
            value={digit}
            onChange={(event) => onCodeChange(index, event.target.value)}
            onKeyDown={(event) => onCodeKeyDown(index, event)}
            maxLength={1}
            className="h-14 w-14 rounded-md border border-[#4ab67c] text-center text-sm outline-none focus:border-[#1e66d0] focus:ring-2 focus:ring-[#1e66d0]/25"
          />
        ))}
      </div>

      <p className="mt-6 text-sm text-[#343b48]">
        Did not get the email?{' '}
        <button type="button" className="font-semibold text-[#101828] underline">Resend</button>
        {' '}or{' '}
        <button type="button" onClick={onEditEmail} className="font-semibold text-[#101828] underline">
          edit your email address
        </button>
      </p>
    </div>
  )
}

export default StepTwoVerification
