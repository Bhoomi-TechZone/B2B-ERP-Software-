import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  CheckCircle2, Loader2, AlertCircle, Eye, EyeOff,
  Lock, ShieldCheck, KeyRound,
} from 'lucide-react'
import authService from '../../services/authService'

const spring = { type: 'spring', stiffness: 340, damping: 28 }

// ── Password strength ─────────────────────────────────────────────────────
const getStrength = (pwd) => {
  let score = 0
  if (pwd.length >= 8)          score++
  if (/[A-Z]/.test(pwd))        score++
  if (/[a-z]/.test(pwd))        score++  // Added lowercase check
  if (/[0-9]/.test(pwd))        score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++
  return Math.min(score, 4) // Cap at 4
}
const STRENGTH_LABEL = ['', 'Weak', 'Fair', 'Good', 'Strong']
const STRENGTH_COLOR = ['', 'bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-emerald-500']

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''

  // ── Validation state ──────────────────────────────────────────────────
  const [validating, setValidating]   = useState(() => Boolean(token))
  const [tokenError, setTokenError]   = useState(() => (!token ? 'Invalid or missing reset token.' : ''))

  // ── Form state ────────────────────────────────────────────────────────
  const [password, setPassword]            = useState('')
  const [confirm_password, setConfirm]     = useState('')
  const [showPwd, setShowPwd]              = useState(false)
  const [showConfirm, setShowConfirm]      = useState(false)

  // ── Submit state ──────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [success, setSuccess] = useState(false)

  // ── Validate token on mount ───────────────────────────────────────────
  useEffect(() => {
    if (!token) return

    let cancelled = false
    const checkToken = async () => {
      try {
        await authService.verifyResetToken(token)
        if (!cancelled) setValidating(false)
      } catch (err) {
        if (!cancelled) {
          setTokenError(err.message || 'Invalid or expired reset token.')
          setValidating(false)
        }
      }
    }
    checkToken()

    return () => {
      cancelled = true
    }
  }, [token])

  const strength = getStrength(password)
  const pwdMatch = password && confirm_password && password === confirm_password

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm_password) {
      setSubmitError('Passwords do not match')
      return
    }
    if (password.length < 8) {
      setSubmitError('Password must be at least 8 characters')
      return
    }
    if (strength < 2) {
      setSubmitError('Password is too weak')
      return
    }
    
    setSubmitting(true)
    setSubmitError('')
    
    try {
      await authService.resetPassword({
        token,
        new_password: password,
        confirm_password: confirm_password,
      })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 4000)
    } catch (err) {
      setSubmitError(err.message || 'Failed to reset password')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Loading ───────────────────────────────────────────────────────────
  if (validating) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="text-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto" />
        <p className="mt-3 text-sm text-slate-500">Validating your reset link...</p>
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
        <h2 className="text-lg font-bold text-slate-900">Reset Link Expired or Invalid</h2>
        <p className="mt-2 text-sm text-slate-500">{tokenError}</p>
        <div className="mt-6 space-y-2">
          <button onClick={() => navigate('/login?recovery=true')}
            className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition shadow-md shadow-blue-200">
            Request New Reset Link
          </button>
          <button onClick={() => navigate('/login')}
            className="w-full rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
            Go to Login
          </button>
        </div>
      </motion.div>
    </div>
  )

  // ── Success ───────────────────────────────────────────────────────────
  if (success) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={spring}
        className="w-full max-w-sm rounded-2xl bg-white p-10 shadow-lg text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, ...spring }}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mx-auto mb-5">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </motion.div>
        <h2 className="text-xl font-bold text-slate-900">Password Reset!</h2>
        <p className="mt-2 text-sm text-slate-500">
          Your password has been successfully reset.
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
              <KeyRound className="h-5 w-5" />
            </div>
            <h1 className="text-lg font-bold">Reset Your Password</h1>
            <p className="text-sm text-blue-100 mt-0.5">
              Enter your new password below
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-7">
            <div className="space-y-4">

              {/* Password Requirements Info */}
              <div className="flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-700">
                <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-blue-500" />
                <div>
                  <p className="font-semibold">Password Requirements:</p>
                  <ul className="mt-1 space-y-0.5 list-disc list-inside text-[11px]">
                    <li>At least 8 characters long</li>
                    <li>Include uppercase, lowercase, numbers & symbols</li>
                  </ul>
                </div>
              </div>

              {submitError && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">Unable to reset password</p>
                    <p className="text-xs mt-0.5">{submitError}</p>
                    {submitError.toLowerCase().includes('token') && (
                      <button
                        type="button"
                        onClick={() => navigate('/login?recovery=true')}
                        className="mt-2 inline-flex items-center text-xs font-bold text-blue-600 hover:underline"
                      >
                        Request a new reset link &rarr;
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <Lock className="h-3.5 w-3.5 text-slate-400" /> New Password *
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
                    <div className="flex items-center justify-between">
                      <p className={`text-[11px] font-semibold ${strength <= 1 ? 'text-red-500' : strength === 2 ? 'text-amber-500' : strength === 3 ? 'text-blue-500' : 'text-emerald-600'}`}>
                        {STRENGTH_LABEL[strength]}
                      </p>
                      <p className={`text-[11px] ${password.length >= 8 ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {password.length}/8 chars
                      </p>
                    </div>
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

              <button
                type="submit"
                disabled={submitting || !pwdMatch || strength < 2 || password.length < 8}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {submitting
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Resetting...</>
                  : 'Reset Password'
                }
              </button>
            </div>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          Remember your password?{' '}
          <button onClick={() => navigate('/login')} className="text-blue-600 hover:underline">
            Back to Login
          </button>
        </p>
      </motion.div>
    </div>
  )
}
