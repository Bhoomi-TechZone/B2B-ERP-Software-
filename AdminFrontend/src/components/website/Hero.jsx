import React from 'react';
import AnalyticsCard from './AnalyticsCard';
import ScanningCard from './ScanningCard';

export default function Hero() {
  return (
    <section className="relative w-full min-h-[540px] md:min-h-[697px] h-screen max-h-[850px] flex flex-col justify-between items-center overflow-hidden pt-[68px] pb-6 sm:pb-8 md:pb-10 select-none">
      
      {/* Full-screen Cinematic Landscape Background */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-no-repeat pointer-events-none z-0"
        style={{
          backgroundImage: "url('/assets/hero-silhouette.png')",
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
        }}
      >
        {/* Foot Warm Illumination */}
        <div
          className="absolute left-1/2 bottom-[12%] -translate-x-1/2 w-[420px] h-[180px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(255, 115, 10, 0.55) 0%, rgba(255, 80, 0, 0.22) 45%, transparent 70%)',
            filter: 'blur(22px)',
          }}
        />

        {/* Silhouette Core Radiant Aura */}
        <div
          className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 w-[280px] h-[360px] rounded-full pointer-events-none animate-pulse-glow"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.25) 0%, rgba(255, 180, 100, 0.12) 40%, transparent 75%)',
            filter: 'blur(26px)',
          }}
        />

        {/* Top Navbar Contrast Vignette */}
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-black/60 via-black/20 to-transparent pointer-events-none" />

        {/* Bottom Smooth Fade into Dark Reddish-Brown About Section */}
        <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-[#120606] via-[#120606]/85 to-transparent pointer-events-none" />
      </div>

      {/* Upper-Middle Area: Main Heading */}
      <div className="relative z-20 w-full max-w-[1240px] mx-auto px-6 pt-2 sm:pt-4 md:pt-5 flex flex-col items-center text-center">
        <h1 className="text-3xl sm:text-5xl md:text-[58px] lg:text-[64px] font-[200] text-white tracking-[-0.025em] leading-[1.08] max-w-[820px] drop-shadow-[0_4px_24px_rgba(0,0,0,0.65)]">
          CRM That Detects<br />
          Your Leads
        </h1>
      </div>

      {/* Mid Area: Floating Cards & Interactive HUD Elements */}
      <div className="relative z-20 w-full max-w-[1200px] mx-auto px-6 sm:px-10 flex-1 flex items-center justify-between pointer-events-none my-1">
        
        {/* Left Floating Card + Hot Indicator & Connector */}
        <div className="relative flex items-center pointer-events-auto">
          <AnalyticsCard />

          {/* Curved connecting line to Hot Indicator */}
          <div className="hidden lg:flex items-center ml-3 relative">
            <svg width="140" height="40" viewBox="0 0 140 40" fill="none" className="overflow-visible">
              <path
                d="M 0 20 C 35 20, 60 20, 95 20"
                stroke="rgba(255, 255, 255, 0.3)"
                strokeWidth="1.2"
                strokeDasharray="3 3"
              />
              <circle cx="95" cy="20" r="2.5" fill="#FFFFFF" />
            </svg>

            {/* Hot Pill Badge */}
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 shadow-lg -ml-4">
              <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#ffffff] animate-ping" />
              <span className="text-[11px] font-light text-white tracking-wider">Hot</span>
            </div>
          </div>
        </div>

        {/* Right Floating Card + Cold Indicator & Connector */}
        <div className="relative flex items-center flex-row-reverse pointer-events-auto">
          <ScanningCard />

          {/* Curved connecting line to Cold Indicator */}
          <div className="hidden lg:flex items-center flex-row-reverse mr-3 relative">
            <svg width="140" height="40" viewBox="0 0 140 40" fill="none" className="overflow-visible">
              <path
                d="M 140 20 C 105 20, 80 20, 45 20"
                stroke="rgba(255, 255, 255, 0.3)"
                strokeWidth="1.2"
                strokeDasharray="3 3"
              />
              <circle cx="45" cy="20" r="2.5" fill="#FFFFFF" />
            </svg>

            {/* Cold Pill Badge */}
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 shadow-lg -mr-4">
              <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#ffffff] animate-ping" />
              <span className="text-[11px] font-light text-white tracking-wider">Cold</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lower Area: Main CTA Button */}
      <div className="relative z-20 flex flex-col items-center">
        <button
          type="button"
          className="group relative inline-flex items-center justify-center w-[135px] h-[44px] rounded-full bg-[#FF6B00] hover:bg-[#FF7B18] active:scale-95 text-[#0A0505] font-semibold text-[13px] tracking-[0.08em] shadow-[0_4px_24px_rgba(255,107,0,0.5)] hover:shadow-[0_4px_34px_rgba(255,107,0,0.75)] transition-all duration-300"
        >
          <span>START NOW</span>
          <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </button>
      </div>

    </section>
  );
}
