import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  User, Mail, Phone, Lock, Eye, EyeOff, 
  CheckCircle2, AlertCircle, ArrowRight 
} from 'lucide-react'

const COUNTRY_CONFIGS = {
  '+91': { label: 'IN +91', digits: 10, placeholder: '98765 43210', country: 'India', displayLength: 11 },
  '+1':  { label: 'US +1',  digits: 10, placeholder: '(202) 555-0123', country: 'US', displayLength: 14 },
  '+44': { label: 'UK +44', digits: 11, placeholder: '07123 456789', country: 'UK', displayLength: 12 },
}

const formatPhone = (digits, prefix) => {
  const d = digits.replace(/\D/g, '')
  if (prefix === '+1') {
    if (d.length <= 3) return d
    if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 10)}`
  }
  if (prefix === '+91') {
    if (d.length <= 5) return d
    return `${d.slice(0, 5)} ${d.slice(5, 10)}`
  }
  if (prefix === '+44') {
    if (d.length <= 5) return d
    return `${d.slice(0, 5)} ${d.slice(5, 11)}`
  }
  return d
}

export default function NewStepOneAccount({
  firstName, onFirstNameChange,
  lastName, onLastNameChange,
  email, onEmailChange,
  phone, onPhoneChange,
  password, onPasswordChange,
  confirmPassword, onConfirmPasswordChange,
  termsAccepted, onTermsChange,
  isEmailValid,
  passwordRules,
  passwordsMatch,
  onNext,
  onGoHome
}) {
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const currentPrefix = phone.match(/^\+\d+/)?.[0] || '+91'
  const config = COUNTRY_CONFIGS[currentPrefix] || COUNTRY_CONFIGS['+91']

  const strength = Object.values(passwordRules).filter(Boolean).length
  const strengthText = ['Very Weak', 'Weak', 'Good', 'Strong', 'Very Strong'][strength]
  const strengthColor = ['bg-slate-200', 'bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-emerald-500'][strength]

  const phoneDigits = phone.replace(/^\+\d+\s?/, '').replace(/\D/g, '')
  const errors = {
    firstName: (submitted || touched.firstName) && firstName.trim().length < 2,
    lastName:  (submitted || touched.lastName)  && lastName.trim().length < 2,
    email:     (submitted || touched.email)     && (!email || !isEmailValid),
    phone:     (submitted || touched.phone)     && phoneDigits.length !== config.digits,
    password:  (submitted || touched.password)  && strength < 4,
    passMatch: (submitted || touched.confirmPassword) && (!passwordsMatch || !confirmPassword),
    terms:     submitted && !termsAccepted,
  }

  const canProceed = 
    firstName.trim().length >= 2 && 
    lastName.trim().length >= 2 && 
    isEmailValid && 
    phoneDigits.length === config.digits &&
    strength >= 4 && 
    passwordsMatch && 
    termsAccepted

  const handleFormSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    if (canProceed) {
      onNext()
    }
  }

  const handleBlur = (field) => setTouched(prev => ({ ...prev, [field]: true }))

  return (
    <div className="flex flex-col">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#1251C5] mb-3">
            Step 1 of 2 — Account Setup
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Create your account</h2>
          <p className="text-slate-500 mt-2">Join 2,500+ companies streamlining their HR operations.</p>
        </div>
        <div className="flex flex-col items-end gap-1.5 pt-2">
          {onGoHome && (
            <button
              type="button"
              onClick={onGoHome}
              className="text-xs font-bold text-slate-500 hover:text-[#1251C5] transition-colors cursor-pointer"
            >
              Back to Home
            </button>
          )}
          <Link
            to="/login"
            className="text-xs font-bold text-[#1251C5] hover:underline"
          >
            Sign In &rarr;
          </Link>
        </div>
      </div>

      <form className="space-y-5" onSubmit={handleFormSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-700 uppercase tracking-widest">First Name *</label>
            <div className="relative group">
              <User className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${errors.firstName ? 'text-red-400' : 'text-slate-400 group-focus-within:text-[#1251C5]'}`} />
              <input
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => onFirstNameChange(e.target.value)}
                onBlur={() => handleBlur('firstName')}
                className={`w-full rounded-xl border pl-10 pr-4 py-3 text-sm outline-none transition focus:ring-4 ${
                  errors.firstName 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                  : 'border-slate-200 focus:border-[#1251C5] focus:ring-[#1251C5]/10'
                }`}
              />
            </div>
            {errors.firstName && <p className="text-[10px] font-bold text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Required</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-700 uppercase tracking-widest">Last Name *</label>
            <div className="relative group">
              <User className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${errors.lastName ? 'text-red-400' : 'text-slate-400 group-focus-within:text-[#1251C5]'}`} />
              <input
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => onLastNameChange(e.target.value)}
                onBlur={() => handleBlur('lastName')}
                className={`w-full rounded-xl border pl-10 pr-4 py-3 text-sm outline-none transition focus:ring-4 ${
                  errors.lastName 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                  : 'border-slate-200 focus:border-[#1251C5] focus:ring-[#1251C5]/10'
                }`}
              />
            </div>
            {errors.lastName && <p className="text-[10px] font-bold text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Required</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-slate-700 uppercase tracking-widest">Work Email *</label>
          <div className="relative group">
            <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${errors.email ? 'text-red-400' : 'text-slate-400 group-focus-within:text-[#1251C5]'}`} />
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              onBlur={() => handleBlur('email')}
              className={`w-full rounded-xl border pl-10 pr-10 py-3 text-sm outline-none transition focus:ring-4 ${
                errors.email 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                : 'border-slate-200 focus:border-[#1251C5] focus:ring-[#1251C5]/10'
              }`}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isEmailValid ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : null}
            </div>
          </div>
          {errors.email && (
            <p className="text-[10px] font-bold text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> Please enter a valid work email address
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-slate-700 uppercase tracking-widest">Phone Number *</label>
          <div className="flex gap-2">
            <select 
              className="w-24 rounded-xl border border-slate-200 bg-white px-2 py-3 text-sm font-bold outline-none focus:border-[#1251C5]"
              value={currentPrefix}
              onChange={(e) => {
                const code = e.target.value
                const rawNum = phone.replace(/^\+\d+\s?/, '').replace(/\D/g, '').slice(0, COUNTRY_CONFIGS[code].digits)
                const formatted = formatPhone(rawNum, code)
                onPhoneChange(code + ' ' + formatted)
              }}
            >
              {Object.entries(COUNTRY_CONFIGS).map(([code, cfg]) => (
                <option key={code} value={code}>{cfg.label}</option>
              ))}
            </select>
            <div className="relative flex-1 group">
              <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${errors.phone ? 'text-red-400' : 'text-slate-400 group-focus-within:text-[#1251C5]'}`} />
              <input
                type="tel"
                placeholder={config.placeholder}
                maxLength={config.displayLength}
                value={phone.replace(/^\+\d+\s?/, '')}
                onBlur={() => handleBlur('phone')}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, '').slice(0, config.digits)
                  const formatted = formatPhone(raw, currentPrefix)
                  onPhoneChange(currentPrefix + ' ' + formatted)
                }}
                className={`w-full rounded-xl border pl-10 pr-4 py-3 text-sm outline-none transition focus:ring-4 ${
                  errors.phone 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                  : 'border-slate-200 focus:border-[#1251C5] focus:ring-[#1251C5]/10'
                }`}
              />
            </div>
          </div>
          {errors.phone && (
            <p className="text-[10px] font-bold text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> Please enter a valid {config.digits}-digit phone number
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-700 uppercase tracking-widest">Password *</label>
            <div className="relative group">
              <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${errors.password ? 'text-red-400' : 'text-slate-400 group-focus-within:text-[#1251C5]'}`} />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={password}
                onBlur={() => handleBlur('password')}
                onChange={(e) => onPasswordChange(e.target.value)}
                className={`w-full rounded-xl border pl-10 pr-10 py-3 text-sm outline-none transition focus:ring-4 ${
                  errors.password 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                  : 'border-slate-200 focus:border-[#1251C5] focus:ring-[#1251C5]/10'
                }`}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[10px] font-bold text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> Password does not meet requirements
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-700 uppercase tracking-widest">Confirm *</label>
            <div className="relative group">
              <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${errors.passMatch ? 'text-red-400' : 'text-slate-400 group-focus-within:text-[#1251C5]'}`} />
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={confirmPassword}
                onBlur={() => handleBlur('confirmPassword')}
                onChange={(e) => onConfirmPasswordChange(e.target.value)}
                className={`w-full rounded-xl border pl-10 pr-12 py-3 text-sm outline-none transition focus:ring-4 ${
                  errors.passMatch 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                  : 'border-slate-200 focus:border-[#1251C5] focus:ring-[#1251C5]/10'
                }`}
              />
              <button 
                type="button" 
                onClick={() => setShowConfirm(!showConfirm)} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.passMatch && (
              <p className="text-[10px] font-bold text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> Passwords do not match
              </p>
            )}
          </div>
        </div>

        {/* Live Password Checklist & Strength */}
        <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/80 space-y-2.5">
          {password.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-slate-500">Password Strength</span>
                <span className={strength <= 1 ? 'text-red-500' : strength === 2 ? 'text-amber-500' : strength === 3 ? 'text-blue-500' : 'text-emerald-600'}>
                  {strengthText}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${strengthColor} ${
                    strength <= 1 ? 'w-1/4' : strength === 2 ? 'w-1/2' : strength === 3 ? 'w-3/4' : 'w-full'
                  }`}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <span className={`flex items-center gap-1.5 ${passwordRules.length ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
              <CheckCircle2 className={`h-3.5 w-3.5 ${passwordRules.length ? 'text-emerald-500' : 'text-slate-300'}`} />
              Min. 8 characters
            </span>
            <span className={`flex items-center gap-1.5 ${passwordRules.upper ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
              <CheckCircle2 className={`h-3.5 w-3.5 ${passwordRules.upper ? 'text-emerald-500' : 'text-slate-300'}`} />
              One uppercase (A-Z)
            </span>
            <span className={`flex items-center gap-1.5 ${passwordRules.number ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
              <CheckCircle2 className={`h-3.5 w-3.5 ${passwordRules.number ? 'text-emerald-500' : 'text-slate-300'}`} />
              One number (0-9)
            </span>
            <span className={`flex items-center gap-1.5 ${passwordRules.special ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
              <CheckCircle2 className={`h-3.5 w-3.5 ${passwordRules.special ? 'text-emerald-500' : 'text-slate-300'}`} />
              One special character
            </span>
          </div>
        </div>

        <div className="space-y-1 pt-1">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center mt-0.5">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => onTermsChange(e.target.checked)}
                className={`h-5 w-5 cursor-pointer rounded-md border-2 transition-all ${
                  errors.terms ? 'border-red-400' : 'border-slate-200 checked:bg-[#1251C5]'
                }`}
              />
            </div>
            <span className="text-xs text-slate-500 font-medium">
              I agree to the <a href="#" className="text-[#1251C5] font-black hover:underline">Terms</a> and <a href="#" className="text-[#1251C5] font-black hover:underline">Privacy Policy</a>.
            </span>
          </label>
          {errors.terms && (
            <p className="text-[10px] font-bold text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> Please agree to the Terms and Privacy Policy
            </p>
          )}
        </div>

        {submitted && !canProceed && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs font-semibold text-red-600 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Please complete all required fields and satisfy all password rules above.</span>
          </div>
        )}

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#1251C5] hover:bg-[#0e42a3] py-4 text-sm font-black text-white shadow-md hover:shadow-lg transition-all mt-4 uppercase tracking-widest cursor-pointer"
        >
          Proceed to Step 2 <ArrowRight className="h-4 w-4" />
        </button>

        <p className="text-center text-xs font-semibold text-slate-500 pt-1">
          Already have an account?{' '}
          <Link to="/login" className="text-[#1251C5] font-black hover:underline">
            Sign In &rarr;
          </Link>
        </p>
      </form>
    </div>
  )
}
