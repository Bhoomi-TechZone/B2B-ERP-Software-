import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  CheckCircle2, Loader2, AlertCircle, Eye, EyeOff,
  UserCheck, User, Phone, Lock, ChevronRight, ShieldCheck,
} from 'lucide-react'
import invitationService from '../../services/invitationService'

const spring = { type: 'spring', stiffness: 340, damping: 28 }

// ── Password strength ─────────────────────────────────────────────────────
const getStrength = (pwd) => {
  let score = 0
  if (pwd.length >= 8)          score++
  if (/[A-Z]/.test(pwd))        score++
  if (/[0-9]/.test(pwd))        score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++
  return score // 0-4
}
const STRENGTH_LABEL = ['', 'Weak', 'Fair', 'Good', 'Strong']
const STRENGTH_COLOR = ['', 'bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-emerald-500']

export default function AcceptInvitePage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''

  // ── Validation state ──────────────────────────────────────────────────
  const [validating, setValidating]   = useState(true)
  const [inviteData, setInviteData]   = useState(null)
  const [tokenError, setTokenError]   = useState('')

  // ── Multi-step: 1=info, 2=password, 3=success ────────────────────────
  const [step, setStep] = useState(1)

  // ── Form state ────────────────────────────────────────────────────────
  const [preferred_name, setPreferredName] = useState('')
  const [phone, setPhone]                  = useState('')
  const [password, setPassword]            = useState('')
  const [confirm_password, setConfirm]     = useState('')
  const [showPwd, setShowPwd]              = useState(false)
  const [showConfirm, setShowConfirm]      = useState(false)

  // ── Submit state ──────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // ── Validate token on mount ───────────────────────────────────────────
  useEffect(() => {
    if (!token) { setTokenError('Invalid or missing invitation token.'); setValidating(false); return }
    invitationService.validate(token)
      .then(data => {
        setInviteData(data)
        setPreferredName(`${data.first_name || ''} ${data.last_name || ''}`.trim())
        setValidating(false)
      })
      .catch(err => {
        setTokenError(err.message || 'Invalid or expired invitation.')
        setValidating(false)
      })
  }, [token])

  const strength = getStrength(password)
  const pwdMatch = password && confirm_password && password === confirm_password

  const handleSubmit = async () => {
    if (password !== confirm_password) { setSubmitError('Passwords do not match'); return }
    if (strength < 2) { setSubmitError('Password is too weak'); return }
    setSubmitting(true); setSubmitError('')
    try {
      await invitationService.accept({
        token,
        password,
        confirm_password,
        preferred_name,
        phone,
        avatar_url:         '',
        personal_details:   {},
        setup_mfa:          false,
        mfa_type:           '',
        notification_prefs: {},
      })
      setStep(3)
      setTimeout(() => navigate('/login'), 4000)
    } catch (err) {
      setSubmitError(err.message || 'Failed to create account')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Loading ───────────────────────────────────────────────────────────
  if (validating) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="text-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto" />
        <p className="mt-3 text-sm text-slate-500">Validating your invitation...</p>
      </div>
    </div>
  )

  // ── Invalid token ─────────────────────────────────────────────────────
  if (tokenError) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 mx-auto mb-4">
          <AlertCircle className="h-7 w-7 text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Invitation Invalid</h2>
        <p className="mt-2 text-sm text-slate-500">{tokenError}</p>
        <button onClick={() => navigate('/login')}
          className="mt-6 w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
          Go to Login
        </button>
      </motion.div>
    </div>
  )

  // ── Success ───────────────────────────────────────────────────────────
  if (step === 3) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={spring}
        className="w-full max-w-sm rounded-2xl bg-white p-10 shadow-lg text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, ...spring }}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mx-auto mb-5">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </motion.div>
        <h2 className="text-xl font-bold text-slate-900">Account Created!</h2>
        <p className="mt-2 text-sm text-slate-500">
          Welcome, <span className="font-semibold text-slate-700">{preferred_name || inviteData?.email}</span>
        </p>
        <p className="mt-1 text-xs text-slate-400">Redirecting to login in a moment...</p>
        <button onClick={() => navigate('/login')}
          className="mt-6 w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
          Go to Login
        </button>
      </motion.div>
    </div>
  )

  // ── Main form ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md">

        {/* Card */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-xl">

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-7 py-6 text-white">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 mb-3">
              <UserCheck className="h-5 w-5" />
            </div>
            <h1 className="text-lg font-bold">Set up your account</h1>
            {inviteData && (
              <p className="text-sm text-blue-100 mt-0.5">
                Invited as{' '}
                <span className="font-semibold text-white capitalize">
                  {inviteData.role?.replace(/_/g, ' ')}
                </span>
              </p>
            )}
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-0 border-b border-slate-100 bg-slate-50 px-7 py-3">
            {[
              { n: 1, label: 'Your info' },
              { n: 2, label: 'Set password' },
            ].map((s, i) => (
              <div key={s.n} className="flex items-center gap-2">
                {i > 0 && <div className={`h-px w-8 ${step > i ? 'bg-blue-500' : 'bg-slate-200'}`} />}
                <div className="flex items-center gap-1.5">
                  <div className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition ${
                    step === s.n ? 'bg-blue-600 text-white' :
                    step > s.n  ? 'bg-emerald-500 text-white' :
                    'bg-slate-200 text-slate-500'
                  }`}>
                    {step > s.n ? '✓' : s.n}
                  </div>
                  <span className={`text-xs font-semibold ${step === s.n ? 'text-slate-800' : 'text-slate-400'}`}>
                    {s.label}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-7">
            {/* Pre-filled invite info */}
            {inviteData && (
              <div className="mb-5 flex items-center gap-3 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  {(inviteData.first_name?.[0] || inviteData.email?.[0] || '?').toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {inviteData.first_name} {inviteData.last_name}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{inviteData.email}</p>
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">

              {/* ── Step 1: Personal info ─────────────────────────────── */}
              {step === 1 && (
                <motion.div key="step1"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
                  className="space-y-4">
                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                      <User className="h-3.5 w-3.5 text-slate-400" /> Preferred Name
                    </label>
                    <input
                      type="text"
                      value={preferred_name}
                      onChange={e => setPreferredName(e.target.value)}
                      placeholder="What should we call you?"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                    <p className="mt-1 text-[11px] text-slate-400">Pre-filled from your invite — edit if needed</p>
                  </div>
                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                      <Phone className="h-3.5 w-3.5 text-slate-400" /> Phone <span className="font-normal text-slate-400">(optional)</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 transition"
                  >
                    Continue <ChevronRight className="h-4 w-4" />
                  </button>
                </motion.div>
              )}

              {/* ── Step 2: Password ──────────────────────────────────── */}
              {step === 2 && (
                <motion.div key="step2"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
                  className="space-y-4">

                  {submitError && (
                    <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                      <AlertCircle className="h-4 w-4 shrink-0" /> {submitError}
                    </div>
                  )}

                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                      <Lock className="h-3.5 w-3.5 text-slate-400" /> Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPwd ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Min 8 characters"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 pr-10 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                      <button type="button" onClick={() => setShowPwd(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {/* Strength bar */}
                    {password && (
                      <div className="mt-2 space-y-1">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map(i => (
                            <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? STRENGTH_COLOR[strength] : 'bg-slate-100'}`} />
                          ))}
                        </div>
                        <p className={`text-[11px] font-semibold ${strength <= 1 ? 'text-red-500' : strength === 2 ? 'text-amber-500' : strength === 3 ? 'text-blue-500' : 'text-emerald-600'}`}>
                          {STRENGTH_LABEL[strength]}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                      <ShieldCheck className="h-3.5 w-3.5 text-slate-400" /> Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        required
                        value={confirm_password}
                        onChange={e => setConfirm(e.target.value)}
                        placeholder="Repeat password"
                        className={`w-full rounded-xl border px-3 py-2.5 pr-10 text-sm outline-none transition focus:ring-2 ${
                          confirm_password
                            ? pwdMatch
                              ? 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-100'
                              : 'border-red-300 focus:border-red-400 focus:ring-red-100'
                            : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                        }`}
                      />
                      <button type="button" onClick={() => setShowConfirm(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {confirm_password && !pwdMatch && (
                      <p className="mt-1 text-[11px] text-red-500">Passwords don't match</p>
                    )}
                    {pwdMatch && (
                      <p className="mt-1 text-[11px] text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Passwords match
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={() => { setStep(1); setSubmitError('') }}
                      className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
                      Back
                    </button>
                    <button
                      type="button"
                      disabled={submitting || !pwdMatch || strength < 2}
                      onClick={handleSubmit}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition"
                    >
                      {submitting
                        ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</>
                        : 'Create Account'
                      }
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          Having trouble?{' '}
          <a href="mailto:support@workmatrix.io" className="text-blue-600 hover:underline">Contact support</a>
        </p>
      </motion.div>
    </div>
  )
}
