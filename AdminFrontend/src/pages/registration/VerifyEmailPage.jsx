import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, XCircle, RefreshCw, ArrowRight, Sun, Moon } from 'lucide-react';
import authService from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { ROLE_IDS } from '../../config/roles';
import { buildRegisterUrl, buildOnboardingUrl } from '../../utils/authSession';

/**
 * Modern High-Tech Orbital Spinner Component
 */
function ModernOrbitalSpinner({ isLight }) {
  return (
    <div className="relative w-20 h-20 flex items-center justify-center mx-auto mb-6">
      {/* Outer Glow Halo */}
      <div
        className="absolute inset-0 rounded-full blur-xl opacity-60 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255,107,0,0.4) 0%, transparent 70%)',
        }}
      />

      {/* Outer Rotating Segment Ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#FF6B00] border-r-[#FFA447]/60"
      />

      {/* Counter-Rotating Inner Dotted / Dashed Ring */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-2 rounded-full border border-dashed border-[#FF7900]/40"
      />

      {/* Pulsing Core Sphere */}
      <motion.div
        animate={{ scale: [0.85, 1.15, 0.85], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF6B00] to-[#FFA447] flex items-center justify-center shadow-[0_0_15px_rgba(255,107,0,0.6)]"
      >
        <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
      </motion.div>
    </div>
  );
}

/**
 * Professional Verify Email Page — Conforming to Senti Design System
 */
export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isLight, toggleTheme } = useTheme();

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'expired' | 'invalid'
  const [cooldown, setCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const verifyEmail = useCallback(async () => {
    if (!token) {
      setStatus('invalid');
      return;
    }

    try {
      const result = await authService.verifyEmail(token);
      const accessToken = result.access || result.access_token;
      const refreshToken = result.refresh || result.refresh_token;

      if (accessToken) {
        localStorage.setItem('access_token', accessToken);
        if (refreshToken) localStorage.setItem('refresh_token', refreshToken);

        if (result.tenant?.primary_region) {
          const reg = result.tenant.primary_region;
          localStorage.setItem('registered_region', reg);
          const countryMapping = { IN: 'India', US: 'United States', UK: 'United Kingdom', GB: 'United Kingdom', EU: 'United Kingdom' };
          localStorage.setItem('registered_country', countryMapping[reg] || 'India');
        }
        if (result.tenant?.name) {
          localStorage.setItem('registered_company_name', result.tenant.name);
        }

        login(ROLE_IDS.SUPER_ADMIN, {
          email: email || result.email || 'admin@company.com',
          token: accessToken,
          tenant: result.tenant,
        });
      }

      setStatus('success');

      // Auto-redirect to workspace onboarding with professional secure URL
      setTimeout(() => {
        navigate(buildOnboardingUrl({ ref: 'email_verified' }), { replace: true });
      }, 2400);
    } catch (error) {
      const msg = error.message ? error.message.toLowerCase() : '';
      if (msg.includes('410') || msg.includes('expired')) {
        setStatus('expired');
      } else {
        setStatus('invalid');
      }
    }
  }, [token, email, login, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      verifyEmail();
    }, 1200);
    return () => clearTimeout(timer);
  }, [verifyEmail]);

  // Cooldown countdown
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResend = async () => {
    const activeEmail = email || localStorage.getItem('last_registered_email');
    if (cooldown > 0 || isResending) return;

    if (!activeEmail) {
      navigate(buildRegisterUrl({ ref: 'verify_expired' }));
      return;
    }

    setIsResending(true);
    setResendMessage('');
    try {
      await authService.resendVerification(activeEmail);
      setCooldown(60);
      setResendMessage('A fresh verification link has been delivered to your inbox.');
    } catch (error) {
      setResendMessage(error.message || 'Failed to resend. Please try again shortly.');
    } finally {
      setIsResending(false);
    }
  };

  const glassCardClasses = isLight
    ? 'bg-white/95 backdrop-blur-2xl border border-gray-200/90 shadow-[0_24px_50px_rgba(0,0,0,0.06)] text-gray-900'
    : 'bg-[#120504]/90 backdrop-blur-2xl border border-[#FF7900]/30 shadow-[0_0_60px_rgba(255,121,0,0.16),0_25px_50px_rgba(0,0,0,0.85)] text-white';

  return (
    <div
      className={`min-h-screen flex flex-col justify-between p-4 sm:p-6 transition-colors duration-300 relative select-none overflow-hidden ${isLight ? 'bg-[#FBF9F7] text-gray-900' : 'bg-[#070202] text-white'
        }`}
      style={{
        background: isLight
          ? 'linear-gradient(180deg, #FFFFFF 0%, #FFF5F2 25%, #FCE8E2 50%, #F5ECE7 80%, #EFE9E4 100%)'
          : 'linear-gradient(180deg, #070202 0%, #150604 22%, #240A06 48%, #180503 75%, #080202 100%)',
      }}
    >
      {/* Background Architectural Grid Lines & Subtle Ambient Glow */}
      <div className={`fixed inset-0 bg-grid-lines pointer-events-none ${isLight ? 'opacity-10' : 'opacity-15'}`} />
      <div
        className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[580px] h-[580px] rounded-full pointer-events-none"
        style={{
          background: isLight
            ? 'radial-gradient(circle, rgba(255, 121, 0, 0.08) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(140, 35, 15, 0.4) 0%, rgba(255, 121, 0, 0.1) 40%, transparent 70%)',
          filter: 'blur(75px)',
        }}
      />

      {/* Top Header */}
      <header className="relative z-20 w-full max-w-[1200px] mx-auto flex items-center justify-between py-2">
        {/* Brand Logo */}
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
          title="Return to Home"
        >
          <div className="relative w-6 h-6 flex items-center justify-center">
            <svg
              className={`w-5 h-5 transition-colors ${isLight ? 'text-gray-950 group-hover:text-[#FF7900]' : 'text-white group-hover:text-[#FF7900]'
                }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L3 7v9l9 6 9-6V7l-9-5z" />
              <path d="M12 22V12" />
              <path d="M12 12L3 7" />
              <path d="M12 12l9-5" />
            </svg>
          </div>
          <span className={`text-[19px] tracking-[0.06em] font-light ${isLight ? 'text-gray-950' : 'text-white'}`}>
            Senti
          </span>
        </div>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 border active:scale-90 cursor-pointer ${isLight
            ? 'bg-orange-50 border-orange-200 text-[#FF6B00] hover:bg-orange-100 shadow-sm'
            : 'bg-white/10 border-white/20 text-yellow-300 hover:bg-white/20 hover:text-yellow-200'
            }`}
        >
          {isLight ? <Moon className="w-4 h-4 fill-current" /> : <Sun className="w-4 h-4 fill-current" />}
        </button>
      </header>

      {/* Main Content Area */}
      <main className="relative z-20 flex-1 flex items-center justify-center py-8">
        <div className="w-full max-w-[460px]">
          <AnimatePresence mode="wait">
            {/* LOADING STATE */}
            {status === 'loading' && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3 }}
                className={`w-full rounded-3xl p-8 sm:p-10 text-center transition-all ${glassCardClasses}`}
              >
                <ModernOrbitalSpinner isLight={isLight} />
                <h2 className={`text-xl sm:text-2xl font-bold tracking-tight mb-2 ${isLight ? 'text-gray-950' : 'text-white'}`}>
                  Verifying Security Credentials
                </h2>
                <p className={`text-xs sm:text-sm leading-relaxed ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                  Validating cryptographic token and provisioning your tenant environment...
                </p>

                <div className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold text-[#FF6B00] bg-[#FF6B00]/10 border border-[#FF6B00]/25 rounded-full py-1.5 px-4 max-w-fit mx-auto">
                  <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-ping" />
                  <span>Establishing Enterprise Session</span>
                </div>
              </motion.div>
            )}

            {/* SUCCESS STATE */}
            {status === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className={`w-full rounded-3xl p-8 sm:p-10 text-center transition-all ${glassCardClasses}`}
              >
                {/* Glowing Success Badge */}
                <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
                  <div className="relative w-16 h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500 flex items-center justify-center text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.35)]">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                </div>

                <h2 className={`text-2xl font-bold tracking-tight mb-2 ${isLight ? 'text-gray-950' : 'text-white'}`}>
                  Email Verified!
                </h2>
                <p className={`text-xs sm:text-sm leading-relaxed mb-6 ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>
                  Authentication successful. We are transitioning you to configure your organization workspace...
                </p>

                {/* Redirecting Progress Pill */}
                <div className="space-y-3">
                  <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 2.2, ease: 'easeInOut' }}
                      className="h-full bg-gradient-to-r from-emerald-500 via-[#FF6B00] to-[#FF8C00] shadow-[0_0_10px_#FF6B00]"
                    />
                  </div>

                  <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#FF6B00]">
                    <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-pulse" />
                    <span>Launching Workspace Setup...</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/onboarding', { replace: true })}
                  className="mt-6 inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors font-medium cursor-pointer"
                >
                  <span>Click here if not redirected automatically</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}

            {/* EXPIRED STATE */}
            {status === 'expired' && (
              <motion.div
                key="expired"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3 }}
                className={`w-full rounded-3xl p-8 sm:p-10 text-center transition-all ${glassCardClasses}`}
              >
                <div className="w-16 h-16 rounded-full bg-amber-500/15 border-2 border-amber-500 flex items-center justify-center mx-auto text-amber-500 mb-6 shadow-[0_0_30px_rgba(245,158,11,0.25)]">
                  <AlertCircle className="w-8 h-8" />
                </div>

                <h2 className={`text-2xl font-bold tracking-tight mb-2 ${isLight ? 'text-gray-950' : 'text-white'}`}>
                  Verification Link Expired
                </h2>
                <p className={`text-xs sm:text-sm leading-relaxed mb-6 ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>
                  Security verification links expire after 48 hours. You can request a fresh verification link below.
                </p>

                {resendMessage && (
                  <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
                    {resendMessage}
                  </div>
                )}

                <button
                  type="button"
                  disabled={cooldown > 0 || isResending}
                  onClick={handleResend}
                  className="w-full py-3.5 px-6 rounded-xl font-semibold text-sm tracking-wide bg-[#FF6B00] hover:bg-[#FF7B18] text-[#0A0505] shadow-[0_4px_25px_rgba(255,107,0,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />
                  <span>{cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Verification Email'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="mt-4 w-full text-xs text-gray-400 hover:text-white transition-colors py-1 cursor-pointer"
                >
                  Return to Home
                </button>
              </motion.div>
            )}

            {/* INVALID STATE */}
            {status === 'invalid' && (
              <motion.div
                key="invalid"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3 }}
                className={`w-full rounded-3xl p-8 sm:p-10 text-center transition-all ${glassCardClasses}`}
              >
                <div className="w-16 h-16 rounded-full bg-rose-500/15 border-2 border-rose-500 flex items-center justify-center mx-auto text-rose-500 mb-6 shadow-[0_0_30px_rgba(244,63,94,0.25)]">
                  <XCircle className="w-8 h-8" />
                </div>

                <h2 className={`text-2xl font-bold tracking-tight mb-2 ${isLight ? 'text-gray-950' : 'text-white'}`}>
                  Invalid or Used Link
                </h2>
                <p className={`text-xs sm:text-sm leading-relaxed mb-6 ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>
                  This verification token is unrecognized or has already been used. Please try signing in or registering again.
                </p>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => navigate(buildRegisterUrl({ ref: 'invalid_token' }))}
                    className="w-full py-3 px-6 rounded-xl font-semibold text-sm tracking-wide bg-[#FF6B00] hover:bg-[#FF7B18] text-[#0A0505] shadow-[0_4px_20px_rgba(255,107,0,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                  >
                    <span>Register New Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="w-full text-xs text-gray-400 hover:text-white transition-colors py-2 cursor-pointer font-medium"
                  >
                    Back to Home
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 text-center py-2 text-xs text-gray-500 select-none">
        <p>SOC-2 Type II Certified · End-to-End Encrypted · &copy; 2026 Senti Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
