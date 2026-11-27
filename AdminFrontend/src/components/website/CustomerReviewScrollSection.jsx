import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import {
  Sparkles,
  ArrowRight,
  Check,
  Bot,
  Send,
  ShieldCheck,
  GitBranch,
  Star,
  Activity,
  MousePointer
} from 'lucide-react';

const CARDS_DATA = [
  {
    id: 0,
    title: 'Precision Inbound & Outbound Campaigns',
    category: 'CUSTOMER STORY · REVENUE',
    quote: '"Senti doubled our pipeline velocity in 6 weeks without adding sales headcount."',
    author: 'Sarah Jenkins',
    role: 'VP of Growth, ApexGlobal',
    stat: '+142% Inbound Pipeline',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80',
    panelType: 'campaign',
  },
  {
    id: 1,
    title: 'Autonomous AI Orchestration & Routing',
    category: 'CUSTOMER STORY · OPERATIONS',
    quote: '"AI agent routing replaced 14 manual qualification steps across our SDR team."',
    author: 'David Chen',
    role: 'Chief Operating Officer, ScaleStack',
    stat: '4.8 hrs saved/rep/week',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=1200&q=80',
    panelType: 'assistant',
  },
  {
    id: 2,
    title: 'Audit-Ready Governance & Clearances',
    category: 'CUSTOMER STORY · COMPLIANCE',
    quote: '"Full-and-final exit sign-offs and payroll audits now happen in a single click."',
    author: 'Elena Rostova',
    role: 'Head of People & Finance, NexaCorp',
    stat: '100% SLA Compliance',
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=1200&q=80',
    panelType: 'approval',
  },
];

export default function CustomerReviewScrollSection() {
  const [activeCard, setActiveCard] = useState(-1); // -1: equal, 0: left, 1: middle, 2: right
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Render the specific floating UI overlay for each card on hover
  const renderFloatingPanel = (panelType) => {
    switch (panelType) {
      case 'campaign':
        return (
          <div className="w-[92%] max-w-[340px] bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-[0_12px_36px_rgba(0,0,0,0.75)] space-y-3">
            {/* Panel Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-ping" />
                <span className="text-[11px] font-bold tracking-wider text-white uppercase">
                  Campaign Studio
                </span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full">
                Active 98.6%
              </span>
            </div>

            {/* Input with Action Icon */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">
                Targeted Audience Query
              </label>
              <div className="flex items-center gap-2 bg-white/[0.08] border border-white/10 rounded-xl px-3 py-2">
                <input
                  type="text"
                  readOnly
                  value="Q3 Enterprise Outbound VP"
                  className="bg-transparent text-xs text-white outline-none w-full font-light"
                />
                <button
                  type="button"
                  className="w-7 h-7 rounded-lg bg-[#FF6B00] text-[#0A0505] flex items-center justify-center shadow-md shrink-0 hover:scale-105 transition-transform"
                >
                  <Send className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>
            </div>

            {/* Campaign Summary Meta */}
            <div className="flex items-center justify-between text-[11px] text-gray-300 pt-1">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-[#FF6B00]" />
                <span>1,420 Verified Accounts</span>
              </span>
              <span className="text-gray-400">Auto-Filtered</span>
            </div>
          </div>
        );

      case 'assistant':
        return (
          <div className="w-[92%] max-w-[340px] bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-[0_12px_36px_rgba(0,0,0,0.75)] space-y-3">
            {/* Panel Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-[#FF6B00]" />
                <span className="text-[11px] font-bold tracking-wider text-white uppercase">
                  Select AI Assistant
                </span>
              </div>
              <span className="text-[10px] font-semibold text-[#FF6B00] bg-orange-500/15 px-2 py-0.5 rounded-full">
                Multi-Agent
              </span>
            </div>

            {/* Options List */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between p-2 rounded-xl bg-orange-500/15 border border-[#FF6B00]/40 text-xs text-white">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#FF6B00] flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-black stroke-[3]" />
                  </div>
                  <span className="font-medium text-[11px]">Autonomous Prospecting SDR</span>
                </div>
                <span className="text-[10px] text-orange-300 font-semibold">Active</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full border border-white/20" />
                  <span className="text-[11px]">BANT Deal Qualifier Bot</span>
                </div>
                <span className="text-[10px] text-gray-500">Standby</span>
              </div>
            </div>

            {/* Workflow Connection Node */}
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.06] border border-white/10 text-[10px] text-gray-300">
              <GitBranch className="w-3.5 h-3.5 text-[#FF6B00] shrink-0" />
              <span>Workflow: Auto-route to Tier 1 Reps</span>
            </div>
          </div>
        );

      case 'approval':
        return (
          <div className="w-[92%] max-w-[340px] bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-[0_12px_36px_rgba(0,0,0,0.75)] space-y-3">
            {/* Panel Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-[11px] font-bold tracking-wider text-white uppercase">
                  Executive Sign-Off
                </span>
              </div>
              <span className="text-[10px] font-semibold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-full">
                SLA: 04:12
              </span>
            </div>

            {/* Notification Details */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 text-[11px]">Contract Valuation:</span>
                <span className="text-white font-bold text-xs">₹24,50,000 ARR</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 text-[11px]">Approval Flow:</span>
                <span className="text-emerald-400 font-medium text-[11px]">2/2 Legal Verified</span>
              </div>
            </div>

            {/* Orange Approval Button */}
            <button
              type="button"
              className="w-full py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#FF7B18] text-[#0A0505] font-bold text-xs tracking-wide shadow-[0_4px_16px_rgba(255,107,0,0.4)] flex items-center justify-center gap-1.5 transition-transform active:scale-95"
            >
              <span>Approve & Execute</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  const { isLight } = useTheme();

  return (
    <section
      id="customer-stories"
      className={`relative w-full py-20 sm:py-28 px-5 sm:px-10 lg:px-16 select-none transition-colors duration-300 ${
        isLight ? 'text-gray-900' : 'text-white'
      }`}
      style={{
        background: isLight
          ? 'linear-gradient(180deg, #F5EFEA 0%, #F3E4DF 25%, #EED2C9 50%, #F3E4DF 75%, #F6F1EC 100%)'
          : 'linear-gradient(180deg, #140503 0%, #2A0B05 15%, #421208 30%, #55170B 50%, #421208 75%, #250904 90%, #100302 100%)',
      }}
    >
      {/* Background Architectural Grid Lines */}
      <div className={`absolute inset-0 bg-grid-lines pointer-events-none ${isLight ? 'opacity-10' : 'opacity-20'}`} />

      {/* Ambient Lighting Accents with #55170B Warmth */}
      <div
        className="absolute top-1/4 left-10 w-[550px] h-[550px] rounded-full pointer-events-none"
        style={{
          background: isLight
            ? 'radial-gradient(circle, rgba(255, 107, 0, 0.08) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(85, 23, 11, 0.6) 0%, rgba(255, 107, 0, 0.12) 45%, transparent 70%)',
        }}
      />
      <div
        className="absolute bottom-1/4 right-10 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: isLight
            ? 'radial-gradient(circle, rgba(235, 160, 140, 0.15) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(85, 23, 11, 0.5) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-[1360px] w-full mx-auto space-y-8">
        
        {/* ========================================================= */}
        {/* SECTION HEADER: Pill, Title & Hover Guide                 */}
        {/* ========================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 max-w-[1280px]">
          <div className="space-y-3">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border backdrop-blur-md ${
              isLight ? 'bg-black/[0.04] border-black/10' : 'bg-white/[0.06] border-white/10'
            }`}>
              <Sparkles className="w-3 h-3 text-[#FF6B00]" />
              <span className={`text-[11px] font-semibold tracking-widest uppercase ${
                isLight ? 'text-gray-800' : 'text-gray-300'
              }`}>
                Customer Stories & Impact
              </span>
            </div>

            <h2 className={`text-2xl sm:text-4xl lg:text-[44px] font-[200] tracking-[-0.03em] leading-[1.12] ${
              isLight ? 'text-gray-950' : 'text-white'
            }`}>
              Loved by revenue leaders. <span className={`font-semibold text-transparent bg-clip-text bg-gradient-to-r ${
                isLight ? 'from-gray-900 via-orange-950 to-[#FF6B00]' : 'from-white via-orange-100 to-[#FF6B00]'
              }`}>Engineered for scale.</span>
            </h2>
          </div>

          {/* Hover Explore Indicator on Desktop */}
          <div className="hidden lg:flex items-center gap-2 text-xs pb-1">
            <MousePointer className="w-3.5 h-3.5 text-[#FF6B00]" />
            <span className={`text-[11px] tracking-widest uppercase ${
              isLight ? 'text-gray-600' : 'text-gray-300'
            }`}>
              Hover over a card to expand
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* THREE-CARD EXPANDING ROW (HOVER-DRIVEN)                    */}
        {/* ========================================================= */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-5 w-full h-auto lg:h-[500px] xl:h-[530px] items-stretch">
          {CARDS_DATA.map((card, idx) => {
            const isFocused = activeCard === idx;
            const isShrunk = !isMobile && activeCard !== -1 && !isFocused;
            
            // Dynamic flexible width sizing on hover:
            // When neutral (activeCard === -1): equal flex 1.
            // When focused: hovered card gets flex 2.4, others shrink to 0.75.
            let flexValue = 1;
            if (activeCard !== -1) {
              flexValue = isFocused ? 2.4 : 0.75;
            }

            return (
              <motion.div
                key={card.id}
                onMouseEnter={() => !isMobile && setActiveCard(idx)}
                onMouseLeave={() => !isMobile && setActiveCard(-1)}
                onClick={() => isMobile && setActiveCard(activeCard === idx ? -1 : idx)}
                animate={{
                  flex: isMobile ? 1 : flexValue,
                }}
                transition={{
                  duration: 0.20,
                  ease: [0.12, 1, 0.25, 1],
                }}
                className={`group relative rounded-3xl overflow-hidden min-h-[380px] lg:min-h-0 border transition-all duration-150 flex flex-col justify-between cursor-pointer ${
                  isFocused
                    ? 'border-[#FF6B00]/70 shadow-[0_0_35px_rgba(255,107,0,0.3)]'
                    : 'border-white/10 hover:border-white/30 shadow-lg'
                }`}
                style={{
                  backgroundImage: `url(${card.image})`,
                  backgroundPosition: 'center center',
                  backgroundSize: 'cover',
                }}
              >
                {/* Dark Overlays: Dark gradient for high contrast readability with #55170B warmth */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-[#55170B]/30 pointer-events-none" />
                
                {/* Warm #55170B & orange top sheen on active card */}
                <div
                  className={`absolute inset-0 bg-gradient-to-b from-[#FF6B00]/25 via-[#55170B]/25 to-transparent pointer-events-none transition-opacity duration-300 ${
                    isFocused ? 'opacity-100' : 'opacity-0'
                  }`}
                />

                {/* Card Top Header: Category Tag & Impact Metric */}
                <div className="relative z-10 p-5 sm:p-6 flex items-start justify-between gap-2 overflow-hidden">
                  <span className={`text-[10px] font-bold tracking-widest uppercase text-white/90 bg-black/60 backdrop-blur-md px-2.5 sm:px-3 py-1 rounded-full border border-white/10 whitespace-nowrap transition-all duration-200 truncate ${
                    isShrunk ? 'max-w-full' : 'max-w-[65%]'
                  }`}>
                    {isShrunk ? (
                      card.category.replace('CUSTOMER STORY · ', '')
                    ) : (
                      <>
                        <span className="hidden xl:inline">CUSTOMER STORY · </span>
                        <span>{card.category.replace('CUSTOMER STORY · ', '')}</span>
                      </>
                    )}
                  </span>

                  <span className={`text-[11px] font-bold tracking-wide text-emerald-400 bg-emerald-950/80 backdrop-blur-md px-2.5 sm:px-3 py-1 rounded-full border border-emerald-500/30 whitespace-nowrap shrink-0 transition-all duration-200 ${
                    isShrunk ? 'hidden opacity-0 scale-90 pointer-events-none' : 'inline-flex opacity-100 scale-100'
                  }`}>
                    {card.stat}
                  </span>
                </div>

                {/* CENTER FLOATING SOFTWARE INTERFACE PANEL (Appears on Hover) */}
                <div className="relative z-20 w-full flex items-center justify-center p-4">
                  <AnimatePresence mode="wait">
                    {isFocused && (
                      <motion.div
                        key={`panel-${card.id}`}
                        initial={{ opacity: 0, scale: 0.92, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.94, y: -16 }}
                        transition={{
                          duration: 0.16,
                          ease: [0.12, 1, 0.25, 1],
                        }}
                        className="w-full flex justify-center"
                      >
                        {renderFloatingPanel(card.panelType)}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Card Bottom Area: Title, Quote & Author */}
                <div className="relative z-10 p-5 sm:p-7 space-y-3">
                  <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
                    {card.title}
                  </h3>

                  <p className="text-gray-300 text-xs sm:text-sm font-light italic leading-relaxed line-clamp-2">
                    {card.quote}
                  </p>

                  <div className="pt-2 border-t border-white/15 flex items-center justify-between text-xs text-gray-400">
                    <div>
                      <span className="font-semibold text-white block">
                        {card.author}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {card.role}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[#FF6B00]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
