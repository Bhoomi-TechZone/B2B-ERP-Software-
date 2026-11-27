import React from 'react';

export default function ConnectingLines() {
  return (
    <div className="absolute inset-0 pointer-events-none select-none z-10 hidden md:block">
      
      {/* Left Hot Indicator & Line */}
      <div className="absolute left-[27%] lg:left-[31%] top-[51%] -translate-y-1/2 flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
          <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#ffffff] animate-ping" />
          <span className="text-[11px] font-light text-white/90 tracking-wide">Hot</span>
        </div>
      </div>

      {/* Right Cold Indicator & Line */}
      <div className="absolute right-[27%] lg:right-[31%] top-[51%] -translate-y-1/2 flex items-center gap-2 flex-row-reverse">
        <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
          <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#ffffff] animate-ping" />
          <span className="text-[11px] font-light text-white/90 tracking-wide">Cold</span>
        </div>
      </div>

      {/* SVG Connecting Curves */}
      <svg
        className="w-full h-full"
        viewBox="0 0 1200 800"
        preserveAspectRatio="none"
        fill="none"
      >
        <defs>
          <linearGradient id="lineGradLeft" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
            <stop offset="60%" stopColor="rgba(255,255,255,0.35)" />
            <stop offset="100%" stopColor="rgba(255,160,80,0.8)" />
          </linearGradient>
          <linearGradient id="lineGradRight" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
            <stop offset="60%" stopColor="rgba(255,255,255,0.35)" />
            <stop offset="100%" stopColor="rgba(255,160,80,0.8)" />
          </linearGradient>
        </defs>

        {/* Curve from left area towards central silhouette waist */}
        <path
          d="M 280 410 C 370 410, 470 425, 545 425"
          stroke="url(#lineGradLeft)"
          strokeWidth="1.2"
          strokeDasharray="3 3"
        />

        {/* Curve from right area towards central silhouette waist */}
        <path
          d="M 920 410 C 830 410, 730 425, 655 425"
          stroke="url(#lineGradRight)"
          strokeWidth="1.2"
          strokeDasharray="3 3"
        />

        {/* Central silhouette contact dots */}
        <circle cx="545" cy="425" r="2.5" fill="#FFFFFF" />
        <circle cx="655" cy="425" r="2.5" fill="#FFFFFF" />
      </svg>
    </div>
  );
}
