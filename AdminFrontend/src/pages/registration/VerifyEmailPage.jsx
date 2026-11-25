import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle2, XCircle, AlertCircle, Loader2, Mail, ArrowRight, RefreshCw } from 'lucide-react'
import authService from '../../services/authService'
import { useAuth } from '../../hooks/useAuth'
import { ROLE_IDS } from '../../config/roles'

/**
 * Section 5.2 Verify Email Page — UI States
 * 1. Loading: POSTs token to API immediately
 * 2. Success: Stores tokens, establishes session, redirects to onboarding
 * 3. Expired: Shows resend option with 60s cooldown
 * 4. Invalid: Shows support link
 */
const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { login } = useAuth()
  
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  const [status, setStatus] = useState('loading') // loading | success | expired | invalid
  const [cooldown, setCooldown] = useState(0)
  const [isResending, setIsResending] = useState(false)

  const verifyEmail = useCallback(async () => {
    if (!token) {
      setStatus('invalid')
      return
    }

    try {
      // POST /api/auth/verify-email { token }
      const result = await authService.verifyEmail(token)
      
      // 1. Extract tokens from backend response
      const accessToken  = result.access || result.access_token
      const refreshToken = result.refresh || result.refresh_token

      // 2. Store tokens in localStorage as requested
      if (accessToken) {
        localStorage.setItem('access_token', accessToken)
        localStorage.setItem('refresh_token', refreshToken)
        console.log('✅ Tokens stored and session established:', { accessToken, refreshToken })
        
        // 3. Establish application session (Admin role for Tenant Creator)
        login(ROLE_IDS.SUPER_ADMIN, {
          email: email || 'user@company.com',
          token: accessToken
        })
      } else {
        console.warn('⚠️ No access token received from verification')
      }

      setStatus('success')
      
      // 4. Auto-redirect to onboarding after 2.5 seconds
      setTimeout(() => {
        navigate('/onboarding', { replace: true })
      }, 2500)

    } catch (error) {
      if (error.message.includes('410') || error.message.toLowerCase().includes('expired')) {
        setStatus('expired')
      } else {
        setStatus('invalid')
      }
    }
  }, [token, email, login, navigate])

  useEffect(() => {
    const timer = setTimeout(() => {
      verifyEmail()
    }, 1500) // Small delay for UX feel
    return () => clearTimeout(timer)
  }, [verifyEmail])

  // Cooldown timer for resend
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  const handleResend = async () => {
    // Try to recover email if missing from URL
    const activeEmail = email || localStorage.getItem('last_registered_email')
    console.log('📬 Resend requested in VerifyEmailPage for:', activeEmail)

    if (cooldown > 0 || isResending) {
       console.log('⏳ Resend blocked: isResending=', isResending, 'cooldown=', cooldown)
       return
    }

    if (!activeEmail) {
      console.error('❌ Cannot resend: No email address found')
      alert('Could not find your email address. Please try registering again.')
      return
    }
    
    setIsResending(true)
    try {
      await authService.resendVerification(activeEmail)
      setCooldown(60)
      console.log('✅ Resend successful')
      alert('Verification email resent!')
    } catch (error) {
      console.error('❌ Resend failed:', error)
      alert('Failed to resend. Please try again later.')
    } finally {
      setIsResending(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full">
        <div className="flex justify-center mb-8">
          <img 
            src="/logo/WorkMatrix1_logo_design-removebg-preview.png" 
            alt="WorkMatrix" 
            className="h-12 w-auto"
          />
        </div>

        <AnimatePresence mode="wait">
          {status === 'loading' && (
            <motion.div 
              key="loading" variants={containerVariants} initial="hidden" animate="visible" exit="exit"
              className="bg-white rounded-3xl p-8 shadow-xl text-center border border-slate-100"
            >
              <div className="relative flex justify-center mb-6">
                <div className="absolute inset-0 bg-blue-100 rounded-full blur-xl opacity-50 animate-pulse" />
                <Loader2 className="h-16 w-16 text-blue-600 animate-spin relative" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Verifying Your Email</h2>
              <p className="text-slate-500">Please wait while we secure your account access...</p>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div 
              key="success" variants={containerVariants} initial="hidden" animate="visible" exit="exit"
              className="bg-white rounded-3xl p-8 shadow-xl text-center border border-slate-100"
            >
              <div className="flex justify-center mb-6">
                <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-12 w-12 text-emerald-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Email Verified!</h2>
              <p className="text-slate-500 mb-8">Authentication successful. Redirecting you to set up your workspace...</p>
              
              <div className="flex items-center justify-center gap-2 text-blue-600 font-bold text-sm animate-pulse">
                <Loader2 className="h-4 w-4 animate-spin" /> Preparing Onboarding
              </div>
            </motion.div>
          )}

          {status === 'expired' && (
            <motion.div 
              key="expired" variants={containerVariants} initial="hidden" animate="visible" exit="exit"
              className="bg-white rounded-3xl p-8 shadow-xl text-center border border-slate-100"
            >
              <div className="flex justify-center mb-6">
                <div className="h-20 w-20 bg-amber-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-12 w-12 text-amber-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Link Expired</h2>
              <p className="text-slate-500 mb-8">Verification links expire after 48 hours. Click below to get a new one.</p>
              
              <button
                disabled={cooldown > 0 || isResending}
                onClick={handleResend}
                className="w-full bg-amber-600 text-white rounded-2xl py-4 font-bold flex items-center justify-center gap-2 hover:bg-amber-700 transition-all disabled:opacity-50"
              >
                {isResending ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Verification Email'}
              </button>
            </motion.div>
          )}

          {status === 'invalid' && (
            <motion.div 
              key="invalid" variants={containerVariants} initial="hidden" animate="visible" exit="exit"
              className="bg-white rounded-3xl p-8 shadow-xl text-center border border-slate-100"
            >
              <div className="flex justify-center mb-6">
                <div className="h-20 w-20 bg-rose-100 rounded-full flex items-center justify-center">
                  <XCircle className="h-12 w-12 text-rose-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Invalid Link</h2>
              <p className="text-slate-500 mb-8">This link is invalid or already used. Please try registering again.</p>
              
              <button
                onClick={() => navigate('/registration')}
                className="w-full bg-slate-100 text-slate-800 rounded-2xl py-4 font-bold hover:bg-slate-200"
              >
                Back to Registration
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mt-8 text-center text-xs text-slate-400">
          WorkMatrix Cloud v3.0 &copy; 2026. Secure Verification System.
        </p>
      </div>
    </div>
  )
}

export default VerifyEmailPage
