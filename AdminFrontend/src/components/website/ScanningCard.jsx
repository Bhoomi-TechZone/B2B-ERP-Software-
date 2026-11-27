import React from 'react';

export default function ScanningCard() {
  return (
    <div className="relative w-[184px] p-3 glass-panel rounded-2xl animate-float-2 select-none pointer-events-auto">
      {/* Title */}
      <div className="mb-2.5">
        <h3 className="text-[11px] font-normal tracking-wide text-white/90">
          AI-powered lead scanning
        </h3>
      </div>

      {/* Portrait with HUD corner brackets and scanning line */}
      <div className="relative w-full aspect-[4/4.3] rounded-xl overflow-hidden bg-[#1f0b09] border border-white/10 group">
        
        {/* Professional Human Portrait */}
        <img
          src="/assets/scanner-portrait.jpg"
          alt="Lead scanning portrait"
          className="w-full h-full object-cover object-top filter brightness-[0.92] contrast-[1.05] group-hover:scale-105 transition-transform duration-500"
        />

        {/* Gradient dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />

        {/* HUD 4 White Corner Brackets */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t-[1.5px] border-l-[1.5px] border-white/80 pointer-events-none" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t-[1.5px] border-r-[1.5px] border-white/80 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-[1.5px] border-l-[1.5px] border-white/80 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b-[1.5px] border-r-[1.5px] border-white/80 pointer-events-none" />

        {/* Animated Laser Scanning Line */}
        <div className="absolute left-1 right-1 h-[2px] bg-gradient-to-r from-transparent via-[#FF8A00] to-transparent shadow-[0_0_8px_#FF8A00] animate-scan-line pointer-events-none" />
      </div>

      {/* Orange circular play button positioned centered below the card */}
      <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2">
        <button
          type="button"
          aria-label="Play scanning demo"
          className="w-7 h-7 rounded-full bg-[#FF6B00] hover:bg-[#FF801E] active:scale-90 text-white flex items-center justify-center shadow-[0_4px_12px_rgba(255,107,0,0.5)] border border-white/20 transition-all duration-200"
        >
          <svg
            className="w-3 h-3 fill-current ml-0.5"
            viewBox="0 0 24 24"
          >
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
