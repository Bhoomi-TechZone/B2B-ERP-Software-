import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/website/Navbar';
import CinematicHero from '../components/website/CinematicHero';
import PlatformCTASection from '../components/website/PlatformCTASection';
import AIAgentsSection from '../components/website/AIAgentsSection';
import ProductSuiteStickySection from '../components/website/ProductSuiteStickySection';
import CustomerReviewScrollSection from '../components/website/CustomerReviewScrollSection';
import PricingSection from '../components/website/PricingSection';
import CustomerTrustSection from '../components/website/CustomerTrustSection';
import { useTheme } from '../context/ThemeContext';
import { buildSignInUrl, buildRegisterUrl } from '../utils/authSession';

export default function LandingPage() {
  const { isLight } = useTheme();
  const navigate = useNavigate();

  // If user lands with hash (#register or #signin), instantly redirect to professional canonical URL
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#register' || hash === '#signup') {
      window.history.replaceState(null, '', window.location.pathname);
      navigate(buildRegisterUrl({ ref: 'hash', mode: 'new-company' }), { replace: true });
    } else if (hash === '#signin' || hash === '#login') {
      window.history.replaceState(null, '', window.location.pathname);
      navigate(buildSignInUrl({ ref: 'hash', mode: 'enterprise' }), { replace: true });
    }
  }, [navigate]);

  const handleOpenAuth = (view, plan = 'pro-plan') => {
    if (view === 'signin' || view === 'login') {
      navigate(buildSignInUrl({ ref: 'landing', mode: 'enterprise' }));
    } else {
      navigate(buildRegisterUrl({ ref: 'landing', plan, mode: 'new-company' }));
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
    </div>
  );
}
