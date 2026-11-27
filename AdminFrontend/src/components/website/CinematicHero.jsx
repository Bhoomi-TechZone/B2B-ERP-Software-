import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import AnalyticsCard from './AnalyticsCard';
import ScanningCard from './ScanningCard';
import PlatformCTASection from './PlatformCTASection';
import { useTheme } from '../../context/ThemeContext';

gsap.registerPlugin(ScrollTrigger);

export default function CinematicHero({ onOpenRegister }) {
  const { isLight } = useTheme();
  const containerRef = useRef(null);
  const pinnedViewportRef = useRef(null);
  const heroLayerRef = useRef(null);
  const bgLayerRef = useRef(null);
  const auraRef = useRef(null);
  const footGlowRef = useRef(null);
  const whiteBloomRef = useRef(null);
  const vignetteRef = useRef(null);
  const headingRef = useRef(null);
  const leftCardRef = useRef(null);
  const rightCardRef = useRef(null);
  const hotColdRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return;
    }

    const nav = document.getElementById('main-nav');
    const params = new URLSearchParams(window.location.search);
    const progressVal = params.get('progress');

    const ctx = gsap.context(() => {
      // Single unified GSAP timeline with pin: true and fast 1-scroll scrub
      const tl = gsap.timeline({
        scrollTrigger: progressVal !== null ? undefined : {
          trigger: containerRef.current,
          start: 'top top',
          end: () => '+=' + Math.round(window.innerHeight * 0.65),
          pin: pinnedViewportRef.current,
          pinSpacing: true,
          scrub: 0.35,
          anticipatePin: 1,
        },
      });

      gsap.set([bgLayerRef.current, heroLayerRef.current, whiteBloomRef.current], {
        force3D: true,
      });

      // ==========================================
      // STAGE 1: 0.0 - 0.02 (Immediate Start on Scroll)
      // ==========================================
      tl.to({}, { duration: 0.02 });

      // ==========================================
      // STAGE 2: 0.02 - 0.35 (Camera Zoom & Disperse Floating UI)
      // ==========================================
      // 1. Navigation fades out
      if (nav) {
        tl.to(nav, {
          opacity: 0,
          y: -25,
          ease: 'power1.out',
          duration: 0.18,
        }, 0.02);
      }

      // 2. Vignette fades out so it doesn't stretch during camera zoom
      tl.to(vignetteRef.current, {
        opacity: 0,
        ease: 'power1.out',
        duration: 0.18,
      }, 0.02);

      // 3. Main heading drifts up and fades
      tl.to(headingRef.current, {
        opacity: 0,
        y: -40,
        scale: 1.05,
        ease: 'power1.out',
        duration: 0.20,
      }, 0.02);

      // 4. Left card + Hot indicator drifts left and fades
      tl.to(leftCardRef.current, {
        opacity: 0,
        x: -80,
        ease: 'power1.out',
        duration: 0.20,
      }, 0.02);

      // 5. Right card + Cold indicator drifts right and fades
      tl.to(rightCardRef.current, {
        opacity: 0,
        x: 80,
        ease: 'power1.out',
        duration: 0.20,
      }, 0.02);

      // 6. Hot/Cold indicator connectors
      tl.to(hotColdRef.current, {
        opacity: 0,
        scale: 0.85,
        ease: 'power1.out',
        duration: 0.18,
      }, 0.02);

      // 7. START NOW CTA drops and fades
      tl.to(ctaRef.current, {
        opacity: 0,
        y: 35,
        scale: 0.90,
        ease: 'power1.out',
        duration: 0.18,
      }, 0.02);

      // 8. Background landscape expands outward, zooming toward silhouette chest (Focal: 50% 52%)
      tl.to(bgLayerRef.current, {
        scale: 2.6,
        transformOrigin: '50% 52%',
        ease: 'power1.inOut',
        duration: 0.28,
      }, 0.02);

      // ==========================================
      // STAGE 3: 0.35 - 0.62 (Silhouette Fills Viewport & Glow Intensifies)
      // ==========================================
      tl.to(bgLayerRef.current, {
        scale: 7.2,
        transformOrigin: '50% 52%',
        ease: 'power1.inOut',
        duration: 0.27,
      }, 0.35);

      tl.to(footGlowRef.current, {
        opacity: 0,
        duration: 0.18,
      }, 0.30);

      tl.to(auraRef.current, {
        scale: 3.4,
        opacity: 1,
        ease: 'power1.inOut',
        duration: 0.27,
      }, 0.35);

      // ==========================================
      // STAGE 4: 0.60 - 0.78 (Enter Silhouette & Bright White Light Bloom)
      // ==========================================
      tl.to(bgLayerRef.current, {
        scale: 11.5,
        transformOrigin: '50% 52%',
        ease: 'power2.in',
        duration: 0.18,
      }, 0.60);

      tl.to(auraRef.current, {
        scale: 5.8,
        opacity: 1,
        ease: 'power2.in',
        duration: 0.18,
      }, 0.60);

      // Radiant white light bloom floods viewport as camera enters person
      tl.to(whiteBloomRef.current, {
        opacity: 1,
        ease: 'power2.in',
        duration: 0.18,
      }, 0.60);

      // Hero layer fades out behind the pure white light bloom to reveal Platform CTA screen
      tl.to(heroLayerRef.current, {
        opacity: 0,
        pointerEvents: 'none',
        ease: 'power1.in',
        duration: 0.10,
      }, 0.70);

      // ==========================================
      // STAGE 5: 0.80 - 0.98 (Light Fades & Seamless Background Emerges)
      // ==========================================
      // As light fades, the seamless background underneath appears covering entire screen
      tl.to(whiteBloomRef.current, {
        opacity: 0,
        ease: 'power1.out',
        duration: 0.18,
      }, 0.80);

      // Buffer at end of timeline before unpin release
      tl.to({}, { duration: 0.02 });

      // Direct deterministic progress testing support (?progress=0.X)
      if (progressVal !== null) {
        const p = parseFloat(progressVal);
        tl.progress(p);
        tl.pause();
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full z-30"
    >
      {/* Pinned Viewport Container */}
      <div
        ref={pinnedViewportRef}
        className="relative w-full h-screen min-h-[540px] md:min-h-[697px] overflow-hidden select-none z-30 transition-colors duration-300"
        style={{
          background: isLight
            ? 'linear-gradient(180deg, #FFFFFF 0%, #FFF5F2 28%, #FFEAE5 50%, #FAD7CF 72%, #F1BEB4 88%, #E7A79A 100%)'
            : 'linear-gradient(180deg, #F8C5D1 0%, #F9CED1 32%, #F6B8AB 54%, #DF8573 70%, #9B3B2B 86%, #6B1F11 96%, #55170B 100%)',
        }}
      >
        {/* Layer 0: Platform CTA Section (The Next Screen) */}
        <div className="absolute inset-0 w-full h-full z-10">
          <PlatformCTASection embedded onOpenRegister={onOpenRegister} />
        </div>

        {/* Layer 1: Hero Scene */}
        <section
          ref={heroLayerRef}
          className="absolute inset-0 w-full h-full flex flex-col justify-between items-center pt-[68px] pb-6 sm:pb-8 md:pb-10 will-change-transform bg-[#0c0404] z-20"
        >
          {/* Zoomable Background Layer */}
          <div
            ref={bgLayerRef}
            className="absolute inset-0 w-full h-full bg-cover bg-no-repeat pointer-events-none z-0"
            style={{
              backgroundImage: "url('/assets/hero-silhouette.png')",
              backgroundPosition: 'center center',
              backgroundSize: 'cover',
              transformOrigin: '50% 52%',
            }}
          />

          {/* Foot Warm Illumination (Independent layer to avoid GPU texture blowout) */}
          <div
            ref={footGlowRef}
            className="absolute left-1/2 bottom-[16%] -translate-x-1/2 w-[420px] h-[160px] rounded-full pointer-events-none z-[1]"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(255, 115, 10, 0.5) 0%, rgba(255, 80, 0, 0.22) 35%, rgba(255, 60, 0, 0.08) 55%, transparent 75%)',
            }}
          />

          {/* Silhouette Core Radiant Aura (Independent layer centered on chest) */}
          <div
            ref={auraRef}
            className="absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2 w-[260px] h-[340px] rounded-full pointer-events-none z-[2] animate-pulse-glow"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.45) 0%, rgba(255, 210, 150, 0.25) 30%, rgba(255, 180, 100, 0.1) 50%, transparent 75%)',
              transformOrigin: '50% 50%',
            }}
          />

          {/* Vignette Overlay (Separated from bgLayer so it does not scale during camera push) */}
          <div ref={vignetteRef} className="absolute inset-0 pointer-events-none z-10 will-change-transform">
            {/* Top Navbar Contrast Vignette */}
            <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-black/60 via-black/20 to-transparent" />
            {/* Bottom Smooth Ambient Fade */}
            <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-black/40 via-black/15 to-transparent" />
          </div>

          {/* Upper-Middle Area: Main Heading */}
          <div
            ref={headingRef}
            className="relative z-20 w-full max-w-[1240px] mx-auto px-6 pt-2 sm:pt-4 md:pt-5 flex flex-col items-center text-center will-change-transform"
          >
            <h1 className="text-3xl sm:text-5xl md:text-[58px] lg:text-[64px] font-[200] text-white tracking-[-0.025em] leading-[1.08] max-w-[820px] drop-shadow-[0_4px_24px_rgba(0,0,0,0.65)]">
              CRM That Detects<br />
              Your Leads
            </h1>
          </div>

          {/* Mid Area: Floating Cards & Interactive HUD Elements */}
          <div className="relative z-20 w-full max-w-[1200px] mx-auto px-4 sm:px-10 flex-1 flex items-center justify-between pointer-events-none my-1">
            
            {/* Left Floating Card */}
            <div ref={leftCardRef} className="relative flex items-center pointer-events-auto will-change-transform scale-[0.78] sm:scale-95 md:scale-100 origin-left">
              <AnalyticsCard />

              {/* Curved connecting line to Hot Indicator */}
              <div ref={hotColdRef} className="hidden lg:flex items-center ml-3 relative">
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

            {/* Right Floating Card */}
            <div ref={rightCardRef} className="relative flex items-center flex-row-reverse pointer-events-auto will-change-transform scale-[0.78] sm:scale-95 md:scale-100 origin-right">
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
          <div ref={ctaRef} className="relative z-20 flex flex-col items-center will-change-transform">
            <button
              type="button"
              onClick={() => onOpenRegister ? onOpenRegister('starter') : null}
              className="group relative inline-flex items-center justify-center w-[135px] h-[44px] rounded-full bg-[#FF6B00] hover:bg-[#FF7B18] active:scale-95 text-[#0A0505] font-semibold text-[13px] tracking-[0.08em] shadow-[0_4px_24px_rgba(255,107,0,0.5)] hover:shadow-[0_4px_34px_rgba(255,107,0,0.75)] transition-all duration-300"
            >
              <span>START NOW</span>
              <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </button>
          </div>
        </section>

        {/* White Luminous Exposure Bloom Fixed Overlay */}
        <div
          ref={whiteBloomRef}
          className="fixed inset-0 pointer-events-none z-50 opacity-0 will-change-transform bg-white"
          style={{
            background: 'radial-gradient(ellipse at 50% 52%, #FFFFFF 0%, #FFFFFF 70%, #FFF8F2 90%, #FFFFFF 100%)',
            transformOrigin: '50% 52%',
          }}
        />
      </div>
    </div>
  );
}
