import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Users, BarChart3, Sparkles, ShieldCheck, Wallet, Layers, Activity } from 'lucide-react';

const FEATURES = [
  {
    icon: Zap,
    title: 'Automate Workflows',
    desc: 'Work smarter, not harder',
  },
  {
    icon: Users,
    title: 'Unified HRMS & People',
    desc: 'Complete employee lifecycle management',
  },
  {
    icon: BarChart3,
    title: 'Sales CRM & Revenue',
    desc: 'Intelligent lead capture & deal routing',
  },
  {
    icon: Sparkles,
    title: '24/7 AI Autonomous Agents',
    desc: 'Always-on agents handling operations',
  },
  {
    icon: ShieldCheck,
    title: 'Enterprise Ready',
    desc: 'Secure. Scalable. Audit-compliant.',
  },
  {
    icon: Wallet,
    title: 'Global Payroll & Compliance',
    desc: 'Multi-currency payouts & statutory sync',
  },
  {
    icon: Layers,
    title: 'Agile Projects & Rosters',
    desc: 'Kanban boards, sprints & shift scheduling',
  },
  {
    icon: Activity,
    title: 'Real-Time Analytics',
    desc: 'Live workforce & pipeline intelligence',
  },
];

// 2 sets of 4 cards so every feature fades smoothly in and out
const CARD_SETS = [
  [FEATURES[0], FEATURES[1], FEATURES[2], FEATURES[3]],
  [FEATURES[4], FEATURES[5], FEATURES[6], FEATURES[7]],
];

export default function FuturisticCityscape({ isLight }) {
  const [activeSet, setActiveSet] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveSet((prev) => (prev + 1) % CARD_SETS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const visibleCards = CARD_SETS[activeSet];

  return (
    <div className="relative w-full max-w-[420px] xl:max-w-[460px] flex flex-col justify-start select-none overflow-visible bg-transparent">
      
      {/* 1. Top Promotional Content & Typography (Pinned, non-scrollable) */}
      <div className="relative z-10 shrink-0 space-y-3.5">
        {/* Main Heading */}
        <h2 className="text-3xl sm:text-4xl lg:text-[38px] xl:text-[42px] font-extrabold tracking-tight leading-[1.12]">
          <span className={isLight ? 'text-gray-950' : 'text-white'}>Build. </span>
          <span className={isLight ? 'text-gray-950' : 'text-white'}>Manage. </span>
          <span className="text-[#FF7900] drop-shadow-[0_0_24px_rgba(255,121,0,0.55)]">Grow.</span>
        </h2>

        {/* Subtitle */}
        <p className={`text-sm sm:text-[15px] font-normal leading-relaxed ${
          isLight ? 'text-gray-700' : 'text-gray-300'
        }`}>
          Your enterprise journey starts here with <span className="font-semibold text-white">HRMSB2B</span>.
        </p>

        {/* Glowing Orange Divider with Terminal Node */}
        <div className="flex items-center gap-2 pt-1 pb-1">
          <div className="relative flex items-center">
            <div className="h-[2px] w-44 bg-gradient-to-r from-[#FF7900] via-[#FFA447] to-[#FF7900] shadow-[0_0_10px_#FF7900]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF7900] shadow-[0_0_14px_#FF7900] -ml-1 border border-white/60" />
          </div>
        </div>
      </div>

      {/* 2. Auto-Fading Feature Glass Cards (Non-scrollable, smooth cross-fade) */}
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="relative z-10 mt-4 pt-1"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSet}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="space-y-2.5"
          >
            {visibleCards.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="group flex items-center gap-3.5 p-2.5 sm:p-3 rounded-2xl backdrop-blur-xl border transition-all duration-200 cursor-default"
                  style={{
                    background: isLight
                      ? 'rgba(255, 255, 255, 0.75)'
                      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(30, 8, 5, 0.45) 100%)',
                    borderColor: isLight ? 'rgba(255, 121, 0, 0.25)' : 'rgba(255, 121, 0, 0.25)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
                  }}
                >
                  {/* Icon Glass Square */}
                  <div
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 border shadow-md transition-transform group-hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 121, 0, 0.2) 0%, rgba(30, 8, 5, 0.8) 100%)',
                      borderColor: 'rgba(255, 121, 0, 0.5)',
                      boxShadow: '0 0 12px rgba(255, 121, 0, 0.25)',
                    }}
                  >
                    <Icon className="w-5 h-5 text-[#FF7900] drop-shadow-[0_0_8px_rgba(255,121,0,0.8)]" />
                  </div>

                  {/* Text Content */}
                  <div className="space-y-0.5">
                    <h4 className={`text-sm sm:text-[15px] font-bold leading-tight ${isLight ? 'text-gray-950' : 'text-white'}`}>
                      {item.title}
                    </h4>
                    <p className={`text-xs sm:text-[12.5px] font-light leading-snug ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}
