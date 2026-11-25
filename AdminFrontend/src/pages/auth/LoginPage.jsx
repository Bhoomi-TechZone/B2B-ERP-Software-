import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { buildSignInUrl, buildRegisterUrl } from '../../utils/authSession'
import { 
  Mail, Lock, Eye, EyeOff, LogIn, 
  Globe, ShieldCheck, ArrowRight,
  Loader2, AlertCircle, KeyRound, 
  Fingerprint, Smartphone, CheckCircle2,
  Building2, Users, Briefcase, UserCircle,
  X, ExternalLink, ArrowLeft
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { ROLE_IDS, getRoleLanding, ROLES } from '../../config/roles'
import authService from '../../services/authService'
import apiClient from '../../services/apiClient'
import { API_BASE_URL } from '../../config/api'

// ─── Animation variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
}
const shake = {
  hidden:  { x: 0 },
  shake:   { x: [0, -8, 8, -6, 6, -3, 3, 0], transition: { duration: 0.45 } },
}

// ─── Company Admin Login Page ─────────────────────────────────────────────────
const LoginPage = ({ initialRecoveryOpen = false }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [shakeKey, setShakeKey] = useState(0)
  const [mfaStep, setMfaStep] = useState(false)
  const [mfaCode, setMfaCode] = useState(['', '', '', '', '', ''])

  const [searchParams] = useSearchParams()
  // ── Password Recovery Modal State ──
  const [showRecoveryModal, setShowRecoveryModal] = useState(initialRecoveryOpen || searchParams.get('recovery') === 'true')
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const [isRecovering, setIsRecovering] = useState(false)
  const [recoverySuccess, setRecoverySuccess] = useState(false)
  const [recoveryError, setRecoveryError] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => {
      setResendCooldown(prev => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  const handleRecoverySubmit = async (e) => {
    if (e) e.preventDefault()
    const cleanEmail = (recoveryEmail || '').trim().toLowerCase()
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setRecoveryError('Please enter a valid corporate email.')
      return
    }
    setIsRecovering(true)
    setRecoveryError('')
    try {
      await authService.forgotPassword(cleanEmail)
      setRecoverySuccess(true)
      setResendCooldown(30)
    } catch (err) {
      setRecoveryError(err.message || 'Failed to send recovery email. Please try again.')
    } finally {
      setIsRecovering(false)
    }
  }

  const handleResendRecovery = () => {
    if (resendCooldown > 0 || isRecovering) return
    handleRecoverySubmit()
  }

  const navigate = useNavigate()
  const { login } = useAuth()

  // Decode JWT payload without a library
  const decodeJwt = (token) => {
    try {
      const payload = token.split('.')[1]
      return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    } catch { return null }
  }

  // Map API role to frontend role ID
  const mapApiRoleToFrontend = (apiRole) => {
    const roleMap = {
      // Platform level
      'platform_admin':  ROLE_IDS.SUPER_ADMIN,
      // Tenant admin roles
      'tenant_admin':    ROLE_IDS.SUPER_ADMIN,
      'owner':           ROLE_IDS.SUPER_ADMIN,
      'admin':           ROLE_IDS.SUPER_ADMIN,
      // HR roles → HR dashboard
      'hr_admin':        ROLE_IDS.HR_ADMIN,
      'hr_manager':      ROLE_IDS.HR,
      'hr':              ROLE_IDS.HR,
      // Payroll → HR dashboard (closest match)
      'payroll_admin':   ROLE_IDS.PAYROLL_ADMIN,
      // Recruiter → HR dashboard
      'recruiter':       ROLE_IDS.RECRUITER,
      // Finance → HR dashboard (read-only)
      'finance_viewer':  ROLE_IDS.FINANCE_VIEWER,
      // IT admin → Super admin dashboard
      'it_admin':        ROLE_IDS.IT_ADMIN,
      // Manager
      'manager':         ROLE_IDS.MANAGER,
      // Sales
      'sales':           ROLE_IDS.SALES,
      'sales_executive': ROLE_IDS.SALES,
      // Employee (default)
      'employee':        ROLE_IDS.EMPLOYEE,
    }
    
    const normalized = (apiRole || '').toLowerCase().trim().replace(/\s+/g, '_')
    const mapped = roleMap[normalized]
    if (mapped && mapped !== ROLE_IDS.EMPLOYEE) return mapped

    const exact = (apiRole || '').trim()
    if (exact && exact.toLowerCase() !== 'employee') return exact

    return ROLE_IDS.EMPLOYEE
  }

  // Handle login submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please enter both email and password.')
      setShakeKey(k => k + 1)
      return
    }

    setIsSubmitting(true)

    try {
      // Call the same API as Admin
      const result = await authService.login(email.trim(), password)
      
      // Check if MFA is required
      if (result.mfa_required || result.requires_mfa) {
        setMfaStep(true)
        setIsSubmitting(false)
        return
      }

      // ── Persist token to localStorage immediately so getProfile can use it ──────────────────────
      const token = result.access_token || result.token
      if (token) {
        localStorage.setItem('access_token', token)
        console.log('✅ Token saved successfully')
      } else {
        console.error('❌ No token in API response! Cannot save to localStorage')
      }

      // ── Fetch the enriched database profile ──────────────────────
      console.log('📋 Fetching enriched profile from /users/me...')
      const me = await authService.getProfile()
      console.log('✅ /users/me response:', me)

      const userObj = me?.user || result.user
      const tenantObj = me?.tenant || result.tenant

      const jwtPayload = decodeJwt(token)
      console.log('🔑 JWT payload:', jwtPayload)

      // Check JWT first
      const jwtRole = jwtPayload?.roles?.[0] || jwtPayload?.role

      // Check user object role
      const userRole = userObj?.role 
        || userObj?.user_type 
        || userObj?.user_role
        || userObj?.tenant_role
        || userObj?.assigned_role

      // Check top-level response
      const responseRole = result.user_type || result.role

      // Priority: userRole > jwtRole > responseRole
      let apiRole = userRole || jwtRole || responseRole || 'employee'
      const roleId = mapApiRoleToFrontend(apiRole)

      console.log('=== Login Debug ===')
      console.log('JWT roles[]:', jwtPayload?.roles, '| JWT user_type:', jwtPayload?.user_type)
      console.log('Final apiRole:', apiRole, '→ roleId:', roleId)
      console.log('Landing:', getRoleLanding(roleId))
      
      // Build profile from enriched API response
      const profile = {
        id: userObj?.id || userObj?.user_id,
        name: userObj?.display_name || `${userObj?.first_name} ${userObj?.last_name}`.trim() || email.split('@')[0],
        email: userObj?.email || email.trim(),
        token: token,
        department: userObj?.department || 'Company',
        company: tenantObj?.id || result.tenant_id || result.company_id,
        tenant: tenantObj ? {
          id: tenantObj.id,
          name: tenantObj.name,
          slug: tenantObj.slug,
          subdomain: tenantObj.subdomain,
          status: tenantObj.status,
          region: tenantObj.primary_region,
          currency: tenantObj.primary_currency,
          logoUrl: tenantObj.logo_url,
          brandColor: tenantObj.brand_color,
          timezone: tenantObj.timezone,
          dateFormat: tenantObj.date_format,
          onboardingCompleted: tenantObj.onboarding_completed,
          onboardingStep: tenantObj.onboarding_step,
          planId: tenantObj.plan_id,
          modules: tenantObj.modules || {},
          planLimits: tenantObj.plan_limits || {},
          planUsage: tenantObj.plan_usage || {},
        } : null
      }

      // Fetch user custom modules if applicable
      try {
        const data = await apiClient.get(`${API_BASE_URL}/roles/user/permissions`)
        if (data && data.permissions) {
          profile.userModules = data.permissions
        }
      } catch(e) {
        console.error('Failed to fetch user modules during login', e)
      }

      console.log('📦 Session Profile to save:', profile)

      // Update auth context
      login(roleId, profile)

      // Navigate to onboarding if tenant admin has not completed onboarding
      if (roleId === ROLE_IDS.SUPER_ADMIN && tenantObj && !tenantObj.onboarding_completed) {
        navigate('/onboarding', { replace: true })
      } else {
        const landingRoute = getRoleLanding(roleId)
        navigate(landingRoute, { replace: true })
      }
      
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.')
      setShakeKey(k => k + 1)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle MFA verification
  const handleMfaSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // TODO: Implement actual MFA verification API call
      // For now, simulate success
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // After MFA, proceed with login (reuse the original login data or store it)
      // For now, navigate to dashboard
      navigate('/admin/dashboard/overview?ref=login&tab=overview', { replace: true })
    } catch {
      setError('Invalid verification code. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle MFA code input
  const handleMfaInput = (index, value) => {
    if (value.length > 1) return
    const newCode = [...mfaCode]
    newCode[index] = value
    setMfaCode(newCode)
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`mfa-${index + 1}`)
      nextInput?.focus()
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Premium Backdrop (Section 7.1 Zero Distraction) */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),rgba(255,255,255,0))]" />
        <motion.div 
          animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute -top-40 -left-40 w-96 h-96 bg-blue-100/40 rounded-full blur-[100px]" 
        />
        <motion.div 
          animate={{ x: [0, -80, 0], y: [0, 100, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-100/40 rounded-full blur-[100px]" 
        />
      </div>

      <div className="max-w-[440px] w-full">
        {/* Header & Brand */}
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors mb-5"
          >
            &larr; Back to Home
          </Link>
          <div>
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center justify-center h-16 w-16 bg-white rounded-[24px] shadow-xl shadow-blue-100 mb-5 border border-slate-50"
            >
              <img src="/logo/WorkMatrix1_logo_design-removebg-preview.png" alt="W" className="h-10 w-auto" />
            </motion.div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">WorkMatrix<span className="text-blue-600">.</span></h2>
            <p className="text-slate-500 mt-2 font-medium text-lg">Secure Enterprise Access</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!mfaStep ? (
            <motion.div 
              key={`login-${shakeKey}`}
              variants={shake}
              initial="hidden"
              animate={shakeKey > 0 ? 'shake' : 'visible'}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white/80 backdrop-blur-2xl rounded-[44px] p-12 shadow-[0_32px_80px_-20px_rgba(0,0,0,0.08)] border border-white"
            >
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Email (Section 7.2) */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Corporate Email</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-blue-600 transition-colors">
                       <Mail className="h-full w-full" />
                    </div>
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@company.com"
                      className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 ring-blue-600/5 focus:border-blue-600/30 transition-all"
                    />
                  </div>
                </div>

                {/* Password (Section 7.2) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Security Key</label>
                    <button
                      type="button"
                      onClick={() => {
                        setRecoveryEmail(email || '')
                        setRecoveryError('')
                        setRecoverySuccess(false)
                        setShowRecoveryModal(true)
                      }}
                      className="text-[10px] font-black text-blue-600 uppercase hover:underline tracking-widest cursor-pointer"
                    >
                      Recovery
                    </button>
                  </div>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-blue-600 transition-colors">
                       <Lock className="h-full w-full" />
                    </div>
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-4 pl-12 pr-12 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 ring-blue-600/5 focus:border-blue-600/30 transition-all"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Error Logic (Rate Limiting Simulation) */}
                <AnimatePresence>
                  {error && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="bg-red-50 p-4 rounded-2xl border border-red-100 flex items-start gap-3"
                    >
                      <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                      <p className="text-[11px] font-bold text-red-600 leading-tight uppercase tracking-tight">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Remember Me */}
                <div className="flex items-center gap-3 ml-1">
                   <div 
                    onClick={() => setRememberMe(!rememberMe)}
                    className={`h-5 w-5 rounded-lg border-2 transition-all flex items-center justify-center cursor-pointer ${rememberMe ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-100' : 'border-slate-200 hover:border-slate-300'}`}
                   >
                     {rememberMe && <CheckCircle2 className="h-3 w-3 text-white" />}
                   </div>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Stay Signed In</span>
                </div>

                {/* CTA Button */}
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-[60px] bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 group relative overflow-hidden cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-10 transition-opacity" />
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}
                  {isSubmitting ? 'Verifying...' : 'Authenticate'}
                </button>

                <p className="text-center text-xs font-semibold text-slate-500 pt-1">
                  Don't have an account?{' '}
                  <Link to={buildRegisterUrl({ ref: 'login', mode: 'new-company' })} className="text-blue-600 font-black hover:underline">
                    Register company &rarr;
                  </Link>
                </p>
              </form>

              {/* Social Login Section (Section 7.2) */}
              <div className="mt-12 pt-8 border-t border-slate-50">
                <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest mb-6">Enterprise Directory SSO</p>
                <div className="grid grid-cols-2 gap-4">
                  <button className="flex items-center justify-center gap-3 py-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:border-blue-200 transition-all group">
                    <Globe className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                    <span className="text-[11px] font-black text-slate-900 uppercase">Google</span>
                  </button>
                  <button className="flex items-center justify-center gap-3 py-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:border-blue-200 transition-all group">
                    <ShieldCheck className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                    <span className="text-[11px] font-black text-slate-900 uppercase">Microsoft</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Section 7.3: MFA Step */
            <motion.div 
              key="mfa"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, x: -20 }}
              className="bg-white/80 backdrop-blur-2xl rounded-[44px] p-12 shadow-[0_32px_80px_-20px_rgba(0,0,0,0.08)] border border-white"
            >
              <div className="text-center mb-8">
                <div className="h-20 w-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">Two-Factor Authentication</h3>
                <p className="text-slate-500 text-sm mt-2 font-medium">Enter the 6-digit code from your authenticator app.</p>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-red-50 p-4 rounded-2xl border border-red-100 flex items-start gap-3 mb-6"
                  >
                    <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] font-bold text-red-600 leading-tight uppercase tracking-tight">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleMfaSubmit} className="space-y-8">
                <div className="flex justify-between gap-2">
                  {mfaCode.map((digit, i) => (
                    <input 
                      key={i}
                      id={`mfa-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleMfaInput(i, e.target.value)}
                      className="w-12 h-16 bg-slate-50 border border-slate-100 rounded-xl text-center text-xl font-black text-slate-900 focus:ring-4 ring-blue-500/10 focus:border-blue-600 outline-none transition-all"
                    />
                  ))}
                </div>
                <button 
                  type="submit"
                  disabled={isSubmitting || mfaCode.join('').length !== 6}
                  className="w-full h-[60px] bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-slate-200 hover:bg-slate-800 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
                  {isSubmitting ? 'Verifying...' : 'Verify & Access'}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setMfaStep(false)
                    setMfaCode(['', '', '', '', '', ''])
                    setError('')
                  }}
                  className="w-full text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600"
                >
                  Back to Login
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Password Recovery Modal (Option 1) ── */}
        <AnimatePresence>
          {showRecoveryModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowRecoveryModal(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />

              {/* Modal Box */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
                className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl z-10 border border-slate-100"
              >
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setShowRecoveryModal(false)}
                  className="absolute right-5 top-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>

                {recoverySuccess ? (
                  <div className="text-center py-4 space-y-4">
                    <div className="h-16 w-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 shadow-md shadow-emerald-100">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Check Your Inbox</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      If an account is associated with <span className="font-bold text-slate-900">{recoveryEmail}</span>, we have sent a password reset link to your email.
                    </p>
                    <div className="pt-2 space-y-3">
                      <button
                        type="button"
                        onClick={() => window.open('https://gmail.com', '_blank')}
                        className="w-full bg-slate-900 text-white rounded-2xl py-3.5 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                      >
                        Open Gmail
                        <ExternalLink className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        disabled={isRecovering || resendCooldown > 0}
                        onClick={handleResendRecovery}
                        className="w-full py-2.5 text-xs font-bold text-blue-600 hover:text-blue-700 disabled:text-slate-400 transition"
                      >
                        {isRecovering ? 'Sending...' : resendCooldown > 0 ? `Resend link in ${resendCooldown}s` : "Didn't receive it? Resend link"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowRecoveryModal(false)}
                        className="w-full py-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600"
                      >
                        Back to Login
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleRecoverySubmit} className="space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[#1251C5] shadow-sm">
                        <KeyRound className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Account Recovery</h3>
                        <p className="text-xs text-slate-400 font-semibold">Forgot your security key?</p>
                      </div>
                    </div>

                    <p className="text-slate-500 text-xs leading-relaxed">
                      Enter your corporate email address. We will send you a secure, one-click link to set a new password.
                    </p>

                    {recoveryError && (
                      <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-xs font-bold text-red-600">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{recoveryError}</span>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest">
                        Corporate Email *
                      </label>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-[#1251C5] transition-colors">
                          <Mail className="h-full w-full" />
                        </div>
                        <input
                          type="email"
                          required
                          value={recoveryEmail}
                          onChange={(e) => setRecoveryEmail(e.target.value)}
                          placeholder="e.g. abhay@company.com"
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 ring-blue-600/10 focus:border-[#1251C5] transition-all"
                        />
                      </div>
                    </div>

                    <div className="pt-2 space-y-3">
                      <button
                        type="submit"
                        disabled={isRecovering}
                        className="w-full h-[54px] bg-[#1251C5] text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {isRecovering ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Sending link...
                          </>
                        ) : (
                          <>
                            Send Reset Link
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowRecoveryModal(false)}
                        className="w-full text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 py-1"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Footer Info */}
        <div className="mt-12 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <Fingerprint className="h-4 w-4" />
            Biometric Ready
          </div>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <ShieldCheck className="h-4 w-4" />
            AES-256 Encrypted
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
