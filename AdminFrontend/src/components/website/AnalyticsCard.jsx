import React from 'react';

export default function AnalyticsCard() {
  return (
    <div className="relative w-[184px] p-3.5 glass-panel rounded-2xl animate-float-1 select-none pointer-events-auto">
      {/* Title */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[11px] font-normal tracking-wide text-white/90">
          Analyze lead behavior
        </h3>
      </div>

      {/* Chart container */}
      <div className="relative w-full h-[88px] flex items-center justify-center overflow-visible">
        
        {/* Subtle background horizontal grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between py-1.5 opacity-20 pointer-events-none">
          <div className="w-full border-b border-dashed border-white/40" />
          <div className="w-full border-b border-dashed border-white/40" />
          <div className="w-full border-b border-dashed border-white/40" />
        </div>

        {/* SVG curved analytics wave */}
        <svg
          className="w-full h-full overflow-visible"
          viewBox="0 0 160 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#FF6B00" stopOpacity="0.0" />
            </linearGradient>
            <filter id="glowOrange" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Area under curve */}
          <path
            d="M 5 62 C 30 60, 50 24, 75 22 C 100 20, 120 54, 155 35 L 155 75 L 5 75 Z"
            fill="url(#curveGradient)"
          />

          {/* Orange graph line */}
          <path
            d="M 5 62 C 30 60, 50 24, 75 22 C 100 20, 120 54, 155 35"
            stroke="#FF7A18"
            strokeWidth="2.2"
            strokeLinecap="round"
            filter="url(#glowOrange)"
          />

          {/* Peak Indicator Dot */}
          <circle
            cx="75"
            cy="22"
            r="3.2"
            fill="#FFFFFF"
            stroke="#FF7A18"
            strokeWidth="1.5"
            className="animate-ping opacity-75"
          />
          <circle
            cx="75"
            cy="22"
            r="3.2"
            fill="#FFFFFF"
            stroke="#FF7A18"
            strokeWidth="1.5"
          />
        </svg>

        {/* Floating White Pill (+4.8%) positioned right above indicator */}
        <div className="absolute top-[3px] left-[52px] bg-white text-[#180808] text-[9.5px] font-bold px-2 py-0.5 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.5)] flex items-center gap-0.5 transition-transform hover:scale-105">
          <span>+4.8%</span>
        </div>
      </div>
    </div>
  );
}
