import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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

export default function AuthPage({ initialView = 'signin', onClose, selectedPlan = 'pro-plan' }) {
  const navigate = useNavigate();
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/');
    }
  };
  const { isLight, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash === '#register' || hash === '#signup') return 'register';
      if (hash === '#signin' || hash === '#login') return 'signin';
    }
    return initialView;
  }); // 'signin' | 'register'
  const [successData, setSuccessData] = useState(null);
  const formScrollRef = useRef(null);

  const handlePageWheel = (e) => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) return;
    if (e.target.closest('[data-scroll-lock="true"]')) return;

    const inForm = formScrollRef.current && formScrollRef.current.contains(e.target);

    if (!inForm && formScrollRef.current) {
      formScrollRef.current.scrollTop += e.deltaY;
    }
  };

  // Sync hash with browser URL
  useEffect(() => {
    if (activeTab === 'signin') {
      window.history.replaceState(null, '', '#signin');
    } else {
      window.history.replaceState(null, '', '#register');
    }
  }, [activeTab]);

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
      className={`fixed inset-0 z-50 overflow-hidden select-none transition-colors duration-300 flex flex-col ${
        isLight
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

      {/* Top-Right Ambient Cosmic Rim (Page-level, seamlessly blended in space) */}
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
      {/* 1. TOP HEADER: Fixed in place (non-scrollable)            */}
      {/* ========================================================= */}
      <header className="relative z-30 shrink-0 w-full max-w-[1560px] mx-auto px-5 sm:px-10 pt-4 sm:pt-6 pb-2">
        <div className="relative flex items-center justify-between w-full">
          {/* Left: Back to Home Button */}
          <button
            type="button"
            onClick={handleClose}
            className={`group px-3.5 sm:px-4 py-1.5 rounded-full border text-xs sm:text-[13px] font-medium tracking-wide transition-all duration-200 flex items-center gap-2 active:scale-95 cursor-pointer ${
              isLight
                ? 'border-gray-300 bg-white/70 hover:bg-white text-gray-800 shadow-sm'
                : 'border-white/15 bg-white/[0.06] hover:bg-white/[0.12] text-white'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Home</span>
          </button>

          {/* Center: Original Senti Logo & Branding (Dead-center aligned) */}
          <div
            onClick={handleClose}
            className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex items-center gap-2 cursor-pointer group select-none"
            title="Senti Home"
          >
            <div className="relative w-6 h-6 flex items-center justify-center">
              <svg
                className={`w-5 h-5 transition-colors ${
                  isLight ? 'text-gray-950 group-hover:text-[#FF7900]' : 'text-white group-hover:text-[#FF7900]'
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
            <span className={`text-[19px] tracking-[0.06em] font-light ${
              isLight ? 'text-gray-950' : 'text-white'
            }`}>
              Senti
            </span>
          </div>

          {/* Right: Theme Toggle Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 border active:scale-90 ${
              isLight
                ? 'bg-orange-50 border-orange-200 text-[#FF7900] hover:bg-orange-100 shadow-sm'
                : 'bg-white/10 border-white/20 text-yellow-300 hover:bg-white/20 hover:text-yellow-200'
            }`}
            aria-label="Toggle Theme"
          >
            {isLight ? <Moon className="w-4 h-4 fill-current" /> : <Sun className="w-4 h-4 fill-current" />}
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. MAIN 2-COLUMN WORKSPACE: Locked on Desktop             */}
      {/* ========================================================= */}
      <main
        onWheel={handlePageWheel}
        className="relative z-20 flex-1 overflow-y-auto lg:overflow-hidden no-scrollbar flex flex-col items-center px-4 pt-1 sm:pt-1.5 pb-4 lg:pb-6"
      >
        
        {/* 2-Column / 3-Zone Responsive Layout - Expansive across viewport */}
        <div className="w-full max-w-[1520px] my-auto lg:my-0 mx-auto px-3 sm:px-8 lg:px-12 xl:px-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 xl:gap-6 items-start">
          
          {/* LEFT SECTION: Stuck in place, auto-fading feature cards */}
          <div className="hidden lg:flex lg:col-span-5 xl:col-span-4 w-full justify-start items-start pt-2 lg:pt-4 pl-2 lg:pl-4 xl:pl-6">
            <FuturisticCityscape isLight={isLight} />
          </div>

          {/* CENTER GAP BRIDGE: Full-Vertical Animated Cosmic Hands */}
          <div className="hidden xl:flex xl:col-span-2 w-full h-full items-center justify-center self-stretch select-none pointer-events-none">
            <FuturisticHandsBridge isLight={isLight} />
          </div>

          {/* RIGHT SECTION: Shifted higher up and to the right */}
          <div className="col-span-12 lg:col-span-7 xl:col-span-6 w-full flex flex-col items-center lg:items-end justify-start lg:mt-0 pr-2 lg:pr-4 xl:pr-6">
            
            <div className="w-full max-w-[620px] sm:max-w-[660px] flex flex-col items-center">
              
              {/* Form 3D Flip Card Container */}
              <div className="w-full flex justify-center [perspective:1400px]">
                <motion.div
                  animate={{ rotateY: activeTab === 'register' ? 180 : 0 }}
                  transition={{
                    duration: 0.65,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  style={{
                    transformStyle: 'preserve-3d',
                  }}
                  className="w-full relative grid [grid-template-areas:'card'] items-start justify-items-center"
                >
                  {/* FRONT FACE: Sign In */}
                  <div
                    style={{
                      gridArea: 'card',
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      pointerEvents: activeTab === 'signin' ? 'auto' : 'none',
                    }}
                    className={`w-full flex justify-center transition-opacity duration-200 ${
                      activeTab === 'signin' ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'
                    }`}
                  >
                    <SignInForm
                      isLight={isLight}
                      onSwitchToRegister={() => setActiveTab('register')}
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
                    className={`w-full flex justify-center transition-opacity duration-200 ${
                      activeTab === 'register' ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'
                    }`}
                  >
                    <RegisterWizard
                      isLight={isLight}
                      onSwitchToSignIn={() => setActiveTab('signin')}
                      defaultPlan={selectedPlan}
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
      {/* PANORAMIC CONTINUOUS HORIZON (Unifies Left, Center, Right) */}
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

            {/* Left Planet Night-Side City Lights (under Left Illustration) */}
            <g opacity="0.65" fill="#FFA500">
              <circle cx="80" cy="140" r="1.3" />
              <circle cx="85" cy="144" r="0.9" />
              <circle cx="92" cy="138" r="1.6" />
              <circle cx="110" cy="148" r="1.2" />
              <circle cx="130" cy="155" r="1.5" />
              <circle cx="160" cy="142" r="1.8" fill="#FFC875" />
              <circle cx="168" cy="146" r="1.1" />
              <circle cx="190" cy="150" r="1.4" />
              <circle cx="230" cy="158" r="1.5" />
              <circle cx="280" cy="165" r="1.7" fill="#FFE28A" />
              <circle cx="340" cy="172" r="1.4" />
              <circle cx="410" cy="180" r="1.3" />
            </g>

            {/* Continuous Glowing Neon Orange Horizon Arc Line */}
            <path
              d="M -50 240 C 250 85, 800 135, 1650 215"
              fill="none"
              stroke="#FF7900"
              strokeWidth="3.2"
              filter="url(#panGlow)"
            />
            <path
              d="M -50 240 C 250 85, 800 135, 1650 215"
              fill="none"
              stroke="#FFE6A3"
              strokeWidth="1"
              opacity="0.9"
            />
          </svg>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. BOTTOM FOOTER: Compliance & Security Badges            */}
      {/* ========================================================= */}
      <footer className="relative z-20 w-full py-4 px-6 text-center text-xs text-gray-500 flex flex-wrap items-center justify-center gap-6">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>SOC-2 Type II Certified & End-to-End Encrypted</span>
        </div>
        <span>•</span>
        <span>© 2026 HRMSB2B Inc. All rights reserved.</span>
      </footer>

    </div>
  );
}
