import React from 'react';
import { motion } from 'framer-motion';

export default function FuturisticTeamIllustration({ isLight }) {
  return (
    <div className="relative w-full h-[540px] lg:h-[620px] flex items-center justify-center select-none overflow-visible bg-transparent">
      
      {/* Ambient Warm Nebula Glow - Blended without bounding box */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255, 110, 0, 0.22) 0%, rgba(180, 45, 0, 0.08) 50%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* 2. Secondary Background Thin Orbital Ring */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <svg
          viewBox="0 0 460 380"
          className="w-[130%] h-[130%] rotate-[26deg] overflow-visible"
        >
          <ellipse
            cx="230"
            cy="190"
            rx="210"
            ry="75"
            fill="none"
            stroke="rgba(255, 120, 30, 0.35)"
            strokeWidth="1.2"
            strokeDasharray="4 3"
          />
          {/* Subtle node on orbit */}
          <circle cx="435" cy="190" r="2.5" fill="#FFA500" opacity="0.8" />
          <circle cx="25" cy="190" r="2" fill="#FFFFFF" opacity="0.6" />
        </svg>
      </div>

      {/* 3. Main Primary Orbital Ring (Back Half - Behind Card) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <svg
          viewBox="0 0 440 360"
          className="w-[125%] h-[125%] -rotate-[24deg] overflow-visible"
        >
          {/* Back segment of main elliptical orbit */}
          <path
            d="M 30 180 A 190 70 0 0 1 410 180"
            fill="none"
            stroke="rgba(255, 100, 0, 0.35)"
            strokeWidth="2"
            strokeDasharray="5 3"
          />
        </svg>
      </div>

      {/* 4. Central 3D Isometric Floating Composition */}
      <motion.div
        animate={{
          y: [-8, 8, -8],
          rotateZ: [-0.6, 0.6, -0.6],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative z-10 flex items-center justify-center"
        style={{
          transformStyle: 'preserve-3d',
          perspective: '1200px',
        }}
      >
        {/* Floating Top Badge: Security Shield (Centered Above Glass Slab) */}
        <motion.div
          animate={{
            y: [-4, 5, -4],
          }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.2,
          }}
          className="absolute -top-14 left-1/2 -translate-x-1/2 z-20 w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-xl border cursor-default shadow-lg"
          style={{
            transform: 'rotateY(-22deg) rotateX(12deg)',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.16) 0%, rgba(30, 8, 5, 0.8) 100%)',
            borderColor: 'rgba(255, 160, 110, 0.45)',
            boxShadow: '0 8px 25px rgba(255, 110, 0, 0.28), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
          }}
        >
          {/* Shield with Checkmark Icon */}
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-white drop-shadow-[0_0_8px_rgba(255,160,80,0.8)]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </motion.div>

        {/* Floating Bottom-Left Badge: Analytics Bar Chart */}
        <motion.div
          animate={{
            y: [5, -5, 5],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.6,
          }}
          className="absolute -bottom-6 -left-10 z-20 w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-xl border cursor-default shadow-lg"
          style={{
            transform: 'rotateY(-22deg) rotateX(12deg)',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.16) 0%, rgba(30, 8, 5, 0.8) 100%)',
            borderColor: 'rgba(255, 160, 110, 0.45)',
            boxShadow: '0 8px 25px rgba(255, 110, 0, 0.28), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
          }}
        >
          {/* 3-Bar Ascending Chart Icon */}
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-white drop-shadow-[0_0_8px_rgba(255,160,80,0.8)]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        </motion.div>

        {/* Main Isometric Glass Slab */}
        <div
          className="relative w-[230px] sm:w-[250px] h-[270px] sm:h-[290px] rounded-3xl p-6 flex items-center justify-center backdrop-blur-2xl border shadow-2xl transition-all"
          style={{
            transform: 'rotateY(-24deg) rotateX(12deg) rotateZ(-3deg)',
            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.14) 0%, rgba(60, 16, 8, 0.45) 45%, rgba(18, 4, 3, 0.82) 100%)',
            borderColor: 'rgba(255, 150, 90, 0.38)',
            boxShadow: '0 25px 70px rgba(0, 0, 0, 0.85), 0 0 45px rgba(255, 110, 0, 0.22), inset 0 1px 2px rgba(255, 255, 255, 0.45)',
          }}
        >
          {/* Glass specular rim reflection line */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-transparent via-white/[0.04] to-white/20 pointer-events-none" />

          {/* Dual Team Silhouette Avatar with Specular Sheen */}
          <div className="relative z-10 flex items-center justify-center">
            <svg
              viewBox="0 0 120 120"
              className="w-28 h-28 sm:w-32 sm:h-32 drop-shadow-[0_6px_20px_rgba(255,110,0,0.6)]"
            >
              <defs>
                <linearGradient id="teamGradFront" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFAE80" />
                  <stop offset="40%" stopColor="#FF7A26" />
                  <stop offset="100%" stopColor="#DF4800" />
                </linearGradient>
                <linearGradient id="teamGradBack" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF9155" />
                  <stop offset="60%" stopColor="#DD5205" />
                  <stop offset="100%" stopColor="#9E2A00" />
                </linearGradient>
              </defs>

              {/* Back Person (Right / Smaller) */}
              <circle cx="85" cy="46" r="14" fill="url(#teamGradBack)" opacity="0.9" />
              <path
                d="M 66 94 C 66 78, 76 70, 88 70 C 100 70, 110 78, 110 94 Z"
                fill="url(#teamGradBack)"
                opacity="0.9"
              />

              {/* Front Person (Left / Dominant) */}
              <circle cx="50" cy="40" r="18" fill="url(#teamGradFront)" />
              <path
                d="M 20 96 C 20 74, 32 64, 50 64 C 68 64, 80 74, 80 96 Z"
                fill="url(#teamGradFront)"
              />

              {/* Specular Light Reflection Glint on Front Person */}
              <circle cx="43" cy="33" r="3" fill="#FFFFFF" opacity="0.65" />
            </svg>
          </div>
        </div>
      </motion.div>

      {/* 5. Main Primary Orbital Ring (Front Half - Sweeps IN FRONT of Card) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
        <svg
          viewBox="0 0 440 360"
          className="w-[125%] h-[125%] -rotate-[24deg] overflow-visible"
        >
          <defs>
            <linearGradient id="frontOrbitGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF4500" stopOpacity="0.4" />
              <stop offset="25%" stopColor="#FF7900" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#FFC875" stopOpacity="1" />
              <stop offset="75%" stopColor="#FF850A" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#FF4500" stopOpacity="0.3" />
            </linearGradient>
            <filter id="laserGlow" x="-20%" y="-40%" width="140%" height="180%">
              <feGaussianBlur stdDeviation="4" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Front Sweeping Luminous Laser Arc */}
          <path
            d="M 410 180 A 190 70 0 0 1 30 180"
            fill="none"
            stroke="url(#frontOrbitGrad)"
            strokeWidth="3.2"
            filter="url(#laserGlow)"
          />

          {/* Core White-Hot Hotspot Beam */}
          <path
            d="M 330 205 A 190 70 0 0 1 110 205"
            fill="none"
            stroke="#FFF2CC"
            strokeWidth="1.2"
            filter="drop-shadow(0 0 6px #FFA500)"
            opacity="0.85"
          />

          {/* Glowing Orbit Particle Node */}
          <circle cx="160" cy="225" r="3.5" fill="#FFFFFF" filter="drop-shadow(0 0 8px #FFA500)" />
        </svg>
      </div>

    </div>
  );
}
