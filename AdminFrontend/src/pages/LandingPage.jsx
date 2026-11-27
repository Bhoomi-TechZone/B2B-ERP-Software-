import React, { useState, useEffect } from 'react';
import Navbar from '../components/website/Navbar';
import CinematicHero from '../components/website/CinematicHero';
import PlatformCTASection from '../components/website/PlatformCTASection';
import AIAgentsSection from '../components/website/AIAgentsSection';
import ProductSuiteStickySection from '../components/website/ProductSuiteStickySection';
import CustomerReviewScrollSection from '../components/website/CustomerReviewScrollSection';
import PricingSection from '../components/website/PricingSection';
import CustomerTrustSection from '../components/website/CustomerTrustSection';
import AuthPage from '../components/website/auth/AuthPage';
import { useTheme } from '../context/ThemeContext';

export default function LandingPage() {
  const { isLight } = useTheme();

  // Auth View State: null | 'signin' | 'register'
  const [authView, setAuthView] = useState(() => {
    if (typeof window === 'undefined') return null;
    const hash = window.location.hash;
    if (hash === '#signin' || hash === '#login') return 'signin';
    if (hash === '#register' || hash === '#signup') return 'register';
    const params = new URLSearchParams(window.location.search);
    const auth = params.get('auth');
    if (auth === 'signin' || auth === 'login') return 'signin';
    if (auth === 'register' || auth === 'signup') return 'register';
    return null;
  });

  const [selectedPlan, setSelectedPlan] = useState('pro-plan');

  // Listen to browser hash changes (e.g. back button or direct anchor links)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#signin' || hash === '#login') {
        setAuthView('signin');
      } else if (hash === '#register' || hash === '#signup') {
        setAuthView('register');
      } else if (!hash || hash === '#' || hash === '#solutions' || hash === '#services' || hash === '#pricing') {
        setAuthView(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleOpenAuth = (view, plan = 'pro-plan') => {
    setSelectedPlan(plan);
    setAuthView(view);
  };

  const handleCloseAuth = () => {
    setAuthView(null);
    if (window.location.hash === '#signin' || window.location.hash === '#register') {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  };

  return (
    <div className={`min-h-screen ${isLight ? 'bg-[#FBF9F7] text-gray-900' : 'bg-[#0c0404] text-white'} flex flex-col transition-colors duration-300 selection:bg-[#FF6B00] selection:text-black`}>
      {/* Navigation Bar */}
      <Navbar onOpenAuth={handleOpenAuth} />

      {/* Main Flow: Hero Zoom (with embedded Platform CTA) -> AI Agents Section -> Sticky Product Suite -> Customer Reviews -> Pricing -> Customer Trust */}
      <main className="flex-1 w-full">
        <CinematicHero onOpenRegister={(plan) => handleOpenAuth('register', plan)} />
        <AIAgentsSection />
        <ProductSuiteStickySection />
        <CustomerReviewScrollSection />
        <PricingSection onOpenRegister={(planId) => handleOpenAuth('register', planId)} />
        <CustomerTrustSection />
      </main>

      {/* Full-screen Luxury Glassmorphism Auth Page Modal */}
      {authView && (
        <AuthPage
          initialView={authView}
          onClose={handleCloseAuth}
          selectedPlan={selectedPlan}
        />
      )}
    </div>
  );
}
