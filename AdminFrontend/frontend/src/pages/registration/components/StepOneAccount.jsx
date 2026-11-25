/**
 * Step 1 — Work Email entry (per doc §4.1)
 * SSO buttons + email input, same UI pattern as original.
 * Hint: 'Use your company email'. No +alias allowed.
 */
function StepOneAccount({
  email,
  isEmailValid,
  onEmailChange,
  onVerify,
  onGoHome,
}) {
  const hasAlias = email.includes('+')

  return (
    <>
      <div className="px-8 pt-7">
        <button type="button" onClick={onGoHome}>
          <img
            src="/logo/WorkMatrix1_logo_design-removebg-preview.png"
            alt="WorkMatrix1"
            className="h-10 w-48 object-contain"
          />
        </button>
      </div>

      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          <h1 className="text-center text-[2rem] font-bold text-[#1d2433]">Create your free account</h1>
          <p className="mt-2 text-center text-sm text-[#6b7688]">100% free. No credit card needed.</p>

          <div className="mt-8 space-y-3">
            <button
              type="button"
              className="flex w-full items-center gap-4 rounded-md border border-[#d5d9e3] bg-white px-5 py-3 text-sm font-semibold text-[#1d2433] transition hover:bg-[#f5f6f8]"
            >
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span className="flex-1 text-center">Continue with Google</span>
            </button>

            <button
              type="button"
              className="flex w-full items-center gap-4 rounded-md border border-[#d5d9e3] bg-white px-5 py-3 text-sm font-semibold text-[#1d2433] transition hover:bg-[#f5f6f8]"
            >
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 21 21">
                <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                <rect x="11" y="1" width="9" height="9" fill="#00a4ef" />
                <rect x="1" y="11" width="9" height="9" fill="#7fba00" />
                <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
              </svg>
              <span className="flex-1 text-center">Sign up with Microsoft</span>
            </button>

            <button
              type="button"
              className="flex w-full items-center gap-4 rounded-md border border-[#d5d9e3] bg-white px-5 py-3 text-sm font-semibold text-[#1d2433] transition hover:bg-[#f5f6f8]"
            >
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 814 1000">
                <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.7 0 663 0 541.8c0-207.5 135.4-317.3 269-317.3 70.1 0 128.4 46.4 172.5 46.4 42.8 0 109.6-49 191.8-49 28.6 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z" />
              </svg>
              <span className="flex-1 text-center">Sign up with Apple</span>
            </button>
          </div>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#e2e6ef]" />
            <span className="text-xs font-semibold tracking-widest text-[#8b95a8]">OR</span>
            <div className="h-px flex-1 bg-[#e2e6ef]" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#1d2433]">
              Work Email <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(event) => onEmailChange(event.target.value)}
                className={`flex-1 rounded-md border px-3 py-2.5 text-sm outline-none transition focus:ring-2 ${
                  email.length > 0 && (!isEmailValid || hasAlias)
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                    : 'border-[#d2d9e7] focus:border-[#f68b1f] focus:ring-[#f68b1f]/20'
                } bg-white`}
              />
              <button
                type="button"
                onClick={onVerify}
                disabled={!isEmailValid || hasAlias}
                className={`rounded-md px-4 py-2.5 text-sm font-semibold transition ${
                  isEmailValid && !hasAlias
                    ? 'bg-[#f68b1f] text-white hover:bg-[#e07e1b]'
                    : 'cursor-not-allowed bg-[#e9eaf0] text-[#6b7688]'
                }`}
              >
                Verify email
              </button>
            </div>
            {email.length > 0 && !isEmailValid && (
              <p className="mt-2 text-xs font-medium text-red-600">Enter a valid business email address.</p>
            )}
            {email.length > 0 && hasAlias && isEmailValid && (
              <p className="mt-2 text-xs font-medium text-red-600">Email aliases with + are not allowed.</p>
            )}

            <p className="mt-3 text-xs leading-relaxed text-[#8b95a8]">
              Use your company email. We may contact you with relevant content, products, and services.
              You can unsubscribe at any time. Learn more in our{' '}
              <a href="#" className="underline hover:text-[#1d2433]">Privacy Policy</a>.
            </p>
          </div>

          <p className="mt-6 text-center text-sm text-[#4d5566]">
            Have an account?{' '}
            <button
              type="button"
              onClick={onGoHome}
              className="font-semibold text-[#f68b1f] underline underline-offset-2 hover:text-[#d97b18]"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </>
  )
}

export default StepOneAccount
