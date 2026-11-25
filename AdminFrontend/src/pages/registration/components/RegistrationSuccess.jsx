import { useState } from 'react'
import { motion } from 'motion/react'
import { Mail, ArrowLeft, RefreshCw, ExternalLink, Loader2, CheckCircle2 } from 'lucide-react'
import authService from '../../../services/authService'

const RegistrationSuccess = ({ email, onBackToRegister }) => {
  const [isResending, setIsResending] = useState(false)
  const [resendStatus, setResendStatus] = useState('idle') // idle | loading | success | error
  const [cooldown, setCooldown] = useState(0)

  const handleResend = async () => {
    console.log('📬 Resend requested for:', email)
    if (isResending || cooldown > 0) {
      console.log('⏳ Resend blocked: isResending=', isResending, 'cooldown=', cooldown)
      return
    }
    
    if (!email) {
      console.error('❌ Cannot resend: Email is missing')
      setResendStatus('error')
      setTimeout(() => setResendStatus('idle'), 3000)
      return
    }

    setIsResending(true)
    setResendStatus('loading')
    
    try {
      await authService.resendVerification(email)
      console.log('✅ Resend successful')
      setResendStatus('success')
      setCooldown(60)
      
      const timer = setInterval(() => {
        setCooldown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
      setTimeout(() => setResendStatus('idle'), 3000)
    } catch (error) {
      console.error('❌ Resend failed:', error)
      setResendStatus('error')
      setTimeout(() => setResendStatus('idle'), 3000)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="flex flex-col items-center text-center max-w-md mx-auto">
      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="h-20 w-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-8"
      >
        <div className="h-14 w-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
          <Mail className="h-7 w-7 text-white" />
        </div>
      </motion.div>

      <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Check your email</h2>
      <p className="text-slate-500 text-lg leading-relaxed mb-8">
        We've sent a verification link to <span className="font-bold text-slate-900">{email}</span>. 
        Please click the link to activate your account.
      </p>

      <div className="w-full space-y-4">
        <button 
          onClick={() => window.open('https://gmail.com', '_blank')}
          className="w-full bg-black text-white rounded-2xl py-4 font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 group"
        >
          Open Mail App
          <ExternalLink className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>

        <div className="pt-4">
          <p className="text-sm text-slate-400 mb-4">
            Didn't receive the email? Check your spam folder or
          </p>
          <div className="flex items-center justify-center gap-6">
            <button 
              disabled={isResending || cooldown > 0}
              onClick={handleResend}
              className={`text-sm font-bold flex items-center gap-1.5 transition-colors p-2 -m-2 ${
                resendStatus === 'success' ? 'text-emerald-600' : 
                resendStatus === 'error' ? 'text-red-600' :
                cooldown > 0 ? 'text-slate-400 cursor-not-allowed' :
                'text-blue-600 hover:text-blue-700'
              }`}
            >
              {resendStatus === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : 
               resendStatus === 'success' ? <CheckCircle2 className="h-4 w-4" /> :
               <RefreshCw className={`h-4 w-4 ${isResending ? 'animate-spin' : ''}`} />}
              
              {resendStatus === 'success' ? 'Sent!' : 
               resendStatus === 'error' ? 'Failed' :
               cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Email'}
            </button>
            <div className="h-4 w-px bg-slate-200" />
            <button 
              onClick={onBackToRegister}
              className="text-sm font-bold text-slate-500 hover:text-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Change Email
            </button>
          </div>
        </div>
      </div>

      <div className="mt-12 p-4 bg-slate-50 rounded-2xl border border-slate-100">
        <p className="text-[11px] text-slate-400 uppercase font-black tracking-widest mb-1">Security Note</p>
        <p className="text-xs text-slate-500">
          The verification link will expire in 48 hours for your account security.
        </p>
      </div>
    </div>
  )
}

export default RegistrationSuccess
