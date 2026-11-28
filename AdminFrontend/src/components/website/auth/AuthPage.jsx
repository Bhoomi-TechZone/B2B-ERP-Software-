import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import {
  ArrowLeft,
  Sun,
  Moon,
  ShieldCheck,
  CheckCircle2,
  Lock
} from 'lucide-react';
import SignInForm from './SignInForm';
import RegisterWizard from './RegisterWizard';
import FuturisticCityscape from './FuturisticCityscape';
import FuturisticHandsBridge from './FuturisticHandsBridge';
import { buildSignInUrl, buildRegisterUrl } from '../../../utils/authSession';

export default function AuthPage({ initialView = 'signin', onClose, selectedPlan = 'pro-plan', initialRecoveryOpen = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/');
    }
  };

  const { isLight, toggleTheme } = useTheme();

  // Determine initial view from URL path
  const [activeTab, setActiveTab] = useState(() => {
    if (location.pathname.includes('register')) return 'register';
    if (location.pathname.includes('sign-in') || location.pathname.includes('account-recovery')) return 'signin';
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    if (hash === '#register' || hash === '#signup') return 'register';
    if (hash === '#signin' || hash === '#login') return 'signin';
    return initialView;
  }); // 'signin' | 'register'

  const [successData, setSuccessData] = useState(null);
  const formScrollRef = useRef(null);

  const urlPlan = searchParams.get('plan') || selectedPlan || 'pro-plan';
  const urlBilling = searchParams.get('billing') || 'monthly';
  const urlRegion = searchParams.get('region') || 'IN';

  // Listen to browser forward/back navigation
  useEffect(() => {
    if (location.pathname.includes('/auth/register')) {
      setActiveTab('register');
    } else if (location.pathname.includes('/auth/sign-in') || location.pathname.includes('/auth/account-recovery')) {
      setActiveTab('signin');
    }
  }, [location.pathname]);

  const handleSwitchToRegister = () => {
    setActiveTab('register');
    const professionalUrl = buildRegisterUrl({
      ref: searchParams.get('ref') || 'portal',
      plan: urlPlan,
      billing: urlBilling,
      region: urlRegion,
      mode: 'new-company',
    });
    navigate(professionalUrl, { replace: true });
  };

  const handleSwitchToSignIn = () => {
    setActiveTab('signin');
    const professionalUrl = buildSignInUrl({
      ref: searchParams.get('ref') || 'portal',
      mode: 'enterprise',
      op: 'authorize',
    });
    navigate(professionalUrl, { replace: true });
  };

  const handlePageWheel = (e) => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) return;
    if (e.target.closest('[data-scroll-lock="true"]')) return;

    const inForm = formScrollRef.current && formScrollRef.current.contains(e.target);

    if (!inForm && formScrollRef.current) {
      formScrollRef.current.scrollTop += e.deltaY;
    }
  };

  // Synchronize browser address bar with Canonical Secure Professional URLs
  useEffect(() => {
    const currentPath = window.location.pathname;
    const currentSearch = window.location.search;
    const hasSessionToken = currentSearch.includes('session_token=');

    // Clean hash completely if present
    if (window.location.hash) {
      window.history.replaceState(null, '', currentPath + (currentSearch || ''));
    }

    if (activeTab === 'signin') {
      if (!currentPath.includes('/auth/sign-in') || !hasSessionToken) {
        const professionalUrl = buildSignInUrl({
          ref: searchParams.get('ref') || 'portal',
          mode: searchParams.get('mode') || 'enterprise',
          op: 'authorize',
        });
        navigate(professionalUrl, { replace: true });
      }
    } else if (activeTab === 'register') {
      if (!currentPath.includes('/auth/register') || !hasSessionToken) {
        const professionalUrl = buildRegisterUrl({
          ref: searchParams.get('ref') || 'portal',
          plan: urlPlan,
          billing: urlBilling,
          region: urlRegion,
          mode: 'new-company',
        });
        navigate(professionalUrl, { replace: true });
      }
    }
  }, [activeTab, urlPlan, urlBilling, urlRegion, searchParams, navigate]);

  // Lock background body scroll to eliminate duplicate scrollbar
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden select-none transition-colors duration-300 flex flex-col ${isLight
          ? 'bg-[#FBF9F7] text-gray-900'
          : 'bg-[#070202] text-white'
        }`}
      style={{
        background: isLight
          ? 'linear-gradient(180deg, #FFFFFF 0%, #FFF5F2 25%, #FCE8E2 50%, #F5ECE7 80%, #EFE9E4 100%)'
          : 'linear-gradient(180deg, #070202 0%, #150604 22%, #240A06 48%, #180503 75%, #080202 100%)',
      }}
    >
      {/* Background Architectural Grid Lines & Starfield Dust */}
      <div className={`fixed inset-0 bg-grid-lines pointer-events-none ${isLight ? 'opacity-10' : 'opacity-15'}`} />
      {!isLight && (
        <div
          className="fixed inset-0 opacity-35 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(1px 1px at 40px 60px, #ffffff, rgba(0,0,0,0)),
                              radial-gradient(1.5px 1.5px at 180px 120px, #ffb088, rgba(0,0,0,0)),
                              radial-gradient(1px 1px at 380px 220px, #ffffff, rgba(0,0,0,0)),
                              radial-gradient(1.5px 1.5px at 640px 90px, #ffa07a, rgba(0,0,0,0)),
                              radial-gradient(1px 1px at 890px 320px, #ffffff, rgba(0,0,0,0)),
                              radial-gradient(2px 2px at 1100px 180px, #ff8c00, rgba(0,0,0,0)),
                              radial-gradient(1px 1px at 1340px 140px, #ffffff, rgba(0,0,0,0)),
                              radial-gradient(1.5px 1.5px at 1480px 290px, #ffa07a, rgba(0,0,0,0))`,
            backgroundRepeat: 'repeat',
            backgroundSize: '800px 600px',
          }}
        />
      )}

      {/* Floating Ambient Radial Glows */}
      <div
        className="fixed top-1/4 left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: isLight
            ? 'radial-gradient(circle, rgba(255, 121, 0, 0.08) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(140, 35, 15, 0.45) 0%, rgba(255, 121, 0, 0.12) 40%, transparent 70%)',
          filter: 'blur(70px)',
        }}
      />
      <div
        className="fixed bottom-10 right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: isLight
            ? 'radial-gradient(circle, rgba(235, 160, 140, 0.2) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(255, 121, 0, 0.16) 0%, transparent 70%)',
          filter: 'blur(75px)',
        }}
      />

      {/* Top-Right Ambient Cosmic Rim */}
      {!isLight && (
        <div className="fixed -top-10 -right-10 w-[540px] h-[380px] pointer-events-none z-0 overflow-hidden">
          <svg viewBox="0 0 540 380" className="w-full h-full">
            <defs>
              <linearGradient id="pageTopCosmicRim" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="35%" stopColor="#FF7900" stopOpacity="0.5" />
                <stop offset="75%" stopColor="#FFA447" stopOpacity="0.75" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <path
              d="M 120 0 C 260 140, 420 250, 540 300"
              fill="none"
              stroke="url(#pageTopCosmicRim)"
              strokeWidth="2"
              filter="drop-shadow(0 0 8px #FF7900)"
              opacity="0.65"
            />
          </svg>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. TOP HEADER: Fixed in place                             */}
      {/* ========================================================= */}
      <header className="relative z-30 shrink-0 w-full max-w-[1560px] mx-auto px-5 sm:px-10 pt-4 sm:pt-6 pb-2">
        <div className="relative flex items-center justify-between w-full">
          {/* Left: Back to Home Button */}
          <button
            type="button"
            onClick={handleClose}
            className={`group px-3.5 sm:px-4 py-1.5 rounded-full border text-xs sm:text-[13px] font-medium tracking-wide transition-all duration-200 flex items-center gap-2 active:scale-95 cursor-pointer ${isLight
                ? 'border-gray-300 bg-white/70 hover:bg-white text-gray-800 shadow-sm'
                : 'border-white/15 bg-white/[0.06] hover:bg-white/[0.12] text-white'
              }`}
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Home</span>
          </button>

          {/* Center: Original Senti Logo & Branding */}
          <div
            onClick={handleClose}
            className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex items-center gap-2 cursor-pointer group select-none"
            title="Back to Home"
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
            <span className={`text-[19px] tracking-[0.06em] font-light ${isLight ? 'text-gray-950' : 'text-white'
              }`}>
              Senti
            </span>
          </div>

          {/* Right: Theme Toggle Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 border active:scale-90 cursor-pointer ${isLight
                ? 'bg-orange-50 border-orange-200 text-[#FF6B00] hover:bg-orange-100 shadow-sm'
                : 'bg-white/10 border-white/20 text-yellow-300 hover:bg-white/20 hover:text-yellow-200'
              }`}
          >
            {isLight ? (
              <Moon className="w-4 h-4 fill-current transition-transform duration-300" />
            ) : (
              <Sun className="w-4 h-4 fill-current transition-transform duration-300" />
            )}
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. MAIN 3-COLUMN CONTENT CANVAS                           */}
      {/* ========================================================= */}
      <main
        onWheel={handlePageWheel}
        className="relative z-20 flex-1 w-full max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-10 flex flex-col justify-center py-2 sm:py-4 overflow-y-auto no-scrollbar"
      >
        <div className="w-full flex-1 flex flex-col justify-center items-center">

          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center max-w-[1400px] mx-auto">

            {/* LEFT COLUMN: Futuristic Illustration */}
            <div className="hidden lg:flex lg:col-span-5 flex-col justify-center items-start pl-2 xl:pl-6 select-none relative">
              <FuturisticCityscape isLight={isLight} />
            </div>

            {/* RIGHT COLUMN: 3D Flip Card Container */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center relative w-full">

              <div className="w-full max-w-[620px] sm:max-w-[660px] relative [perspective:1600px]">
                <motion.div
                  animate={{ rotateY: activeTab === 'register' ? 180 : 0 }}
                  transition={{
                    duration: 0.55,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  style={{
                    transformStyle: 'preserve-3d',
                    display: 'grid',
                    gridTemplateAreas: '"card"',
                  }}
                  className="w-full relative"
                >
                  {/* FRONT FACE: Sign In Credentials */}
                  <div
                    style={{
                      gridArea: 'card',
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      pointerEvents: activeTab === 'signin' ? 'auto' : 'none',
                    }}
                    className={`w-full flex justify-center transition-opacity duration-200 ${activeTab === 'signin' ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'
                      }`}
                  >
                    <SignInForm
                      isLight={isLight}
                      initialRecoveryOpen={initialRecoveryOpen || location.pathname.includes('account-recovery')}
                      onSwitchToRegister={handleSwitchToRegister}
                      onSignInSuccess={(data) => {
                        setSuccessData(data);
                        setTimeout(() => {
                          handleClose();
                        }, 1200);
                      }}
                    />
                  </div>

                  {/* BACK FACE: Create Account / Register Wizard */}
                  <div
                    style={{
                      gridArea: 'card',
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      pointerEvents: activeTab === 'register' ? 'auto' : 'none',
                    }}
                    className={`w-full flex justify-center transition-opacity duration-200 ${activeTab === 'register' ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'
                      }`}
                  >
                    <RegisterWizard
                      isLight={isLight}
                      onSwitchToSignIn={handleSwitchToSignIn}
                      defaultPlan={urlPlan}
                      scrollRef={formScrollRef}
                      onRegisterComplete={(data) => {
                        setSuccessData(data);
                      }}
                    />
                  </div>
                </motion.div>
              </div>

            </div>

          </div>

        </div>

      </main>

      {/* ========================================================= */}
      {/* PANORAMIC CONTINUOUS HORIZON                              */}
      {/* ========================================================= */}
      {!isLight && (
        <div className="fixed bottom-0 left-0 right-0 h-[220px] pointer-events-none z-10 overflow-hidden">
          <svg
            viewBox="0 0 1600 240"
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="panAtmosphere" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FF7900" stopOpacity="0.75" />
                <stop offset="25%" stopColor="#FF4500" stopOpacity="0.35" />
                <stop offset="60%" stopColor="#801505" stopOpacity="0.12" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
              <linearGradient id="panPlanetBody" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1E0704" />
                <stop offset="35%" stopColor="#120403" />
                <stop offset="100%" stopColor="#070202" />
              </linearGradient>
              <filter id="panGlow" x="-10%" y="-30%" width="120%" height="160%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Atmosphere Glow Under Horizon */}
            <path
              d="M -50 240 C 250 80, 800 130, 1650 210 Z"
              fill="url(#panAtmosphere)"
              filter="blur(10px)"
            />

            {/* Planet Body Beneath Horizon */}
            <path
              d="M -50 240 C 250 85, 800 135, 1650 215 L 1650 260 L -50 260 Z"
              fill="url(#panPlanetBody)"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
