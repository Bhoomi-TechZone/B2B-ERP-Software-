import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

gsap.registerPlugin(ScrollTrigger);
import {
  TrendingUp,
  Users,
  FolderKanban,
  UserCheck,
  Clock,
  ShieldCheck,
  ArrowRight,
  Check,
  Sparkles,
  ArrowUpRight,
  Layers,
  Zap,
  Lock,
  Headphones,
  BarChart3,
  Shield
} from 'lucide-react';

const PRODUCT_CARDS = [
  {
    id: 'crm',
    category: 'SALES & GROWTH',
    title: 'Intelligent Sales CRM & Lead Routing',
    description:
      'Accelerate revenue with automated lead capture, BANT qualification scoring, and SLA tracking. Automatically distribute incoming leads to sales reps via smart round-robin routing.',
    badge: 'Round-Robin Active',
    icon: TrendingUp,
    accent: {
      text: 'text-[#FF6B00]',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/20',
      badgeBg: 'bg-orange-500/15 text-orange-400',
    },
    metric: '98.4% Match Rate',
    stats: '14m SLA Countdown',
  },
  {
    id: 'hrms',
    category: 'HUMAN RESOURCES',
    title: 'Complete Employee Lifecycle Management',
    description:
      'Centralize your global workforce from day one through offboarding. Manage digital employee profiles, departmental hierarchies, and full-and-final exit clearances in one unified system.',
    badge: '360° Directory',
    icon: Users,
    accent: {
      text: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      badgeBg: 'bg-rose-500/15 text-rose-300',
    },
    metric: '92% Onboarding Done',
    stats: 'Automated FnF',
  },
  {
    id: 'projects',
    category: 'WORKFLOW & COLLABORATION',
    title: 'Agile Projects & Interactive Kanban Boards',
    description:
      'Keep cross-functional teams aligned and shipping on time. Visualize project progress with drag-and-drop Kanban boards, sprint task tracking, and team workload balancing.',
    badge: 'Sprint 42 Active',
    icon: FolderKanban,
    accent: {
      text: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
      badgeBg: 'bg-indigo-500/15 text-indigo-300',
    },
    metric: '88 Velocity Pts',
    stats: 'Balanced Workload',
  },
  {
    id: 'ats',
    category: 'TALENT ACQUISITION',
    title: 'Modern ATS & Candidate Pipeline',
    description:
      'Attract and hire top talent without spreadsheets. Publish branded job listings, track candidates through visual hiring stages, and convert hires into employees with a single click.',
    badge: '1-Click Hire',
    icon: UserCheck,
    accent: {
      text: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      badgeBg: 'bg-purple-500/15 text-purple-300',
    },
    metric: '4.9/5 Scorecard',
    stats: '12 Roles Open',
  },
  {
    id: 'time',
    category: 'TIME TRACKING',
    title: 'Automated Rosters & Shift Scheduling',
    description:
      'Eliminate scheduling conflicts and manual timesheets. Auto-generate weekly shift rosters across departments, capture daily punch logs, and manage multi-level leave approvals.',
    badge: '0 Conflicts',
    icon: Clock,
    accent: {
      text: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      badgeBg: 'bg-amber-500/15 text-amber-300',
    },
    metric: '100% Shift Coverage',
    stats: 'Real-time Punch',
  },
  {
    id: 'payroll',
    category: 'PAYROLL & LEGAL',
    title: 'Multi-Currency Payroll & Statutory Compliance',
    description:
      'Pay your team accurately and stay audit-ready in every market. Configure custom salary structures, automate deductions, generate digital payslips, and store compliance documents safely.',
    badge: 'Audit Ready',
    icon: ShieldCheck,
    accent: {
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      badgeBg: 'bg-emerald-500/15 text-emerald-300',
    },
    metric: '$142.5k Disbursed',
    stats: 'USD • EUR • GBP • INR',
  },
  {
    id: 'analytics',
    category: 'DATA & INSIGHTS',
    title: 'Predictive Revenue & Executive Analytics',
    description:
      'Surface real-time operational bottlenecks, forecast quarterly deal closures, and track workforce productivity with customizable AI-powered executive dashboards.',
    badge: 'AI Forecast Active',
    icon: BarChart3,
    accent: {
      text: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
      badgeBg: 'bg-cyan-500/15 text-cyan-300',
    },
    metric: '99.2% Forecast Accuracy',
    stats: 'Real-time BI Sync',
  },
  {
    id: 'security',
    category: 'SECURITY & GOVERNANCE',
    title: 'Zero-Trust Access & Audit Governance',
    description:
      'Protect sensitive company data with granular role-based access control (RBAC), SSO authentication logs, and automated SOC-2 and GDPR compliance audits.',
    badge: 'Zero-Trust Active',
    icon: Shield,
    accent: {
      text: 'text-teal-400',
      bg: 'bg-teal-500/10',
      border: 'border-teal-500/20',
      badgeBg: 'bg-teal-500/15 text-teal-300',
    },
    metric: 'SOC-2 Type II Certified',
    stats: 'End-to-End Encrypted',
  },
];

export default function ProductSuiteStickySection() {
  const sectionRef = useRef(null);
  const leftColRef = useRef(null);
  const rightColRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const mm = gsap.matchMedia();

    mm.add('(min-width: 1024px)', () => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top+=20',
        end: 'bottom bottom',
        pin: leftColRef.current,
        pinSpacing: false,
        anticipatePin: 1,
      });
    });

    return () => mm.revert();
  }, []);

  const { isLight } = useTheme();

  return (
    <section
      ref={sectionRef}
      className={`relative w-full pt-12 sm:pt-16 pb-24 sm:pb-32 px-5 sm:px-10 lg:px-16 select-none transition-colors duration-300 ${
        isLight ? 'text-gray-900' : 'text-white'
      }`}
      style={{
        background: isLight
          ? 'linear-gradient(180deg, #F4ECE7 0%, #FAF6F4 25%, #FAF7F5 60%, #F5EFEA 100%)'
          : 'linear-gradient(180deg, #120403 0%, #0e0404 20%, #0a0404 45%, #0a0404 80%, #140503 100%)',
      }}
    >
      
      {/* Background Architectural Grid Lines */}
      <div className={`absolute inset-0 bg-grid-lines pointer-events-none ${isLight ? 'opacity-10' : 'opacity-20'}`} />

      {/* Ambient Lighting Accents with #55170B Warmth */}
      <div
        className="absolute top-1/4 left-10 w-[450px] h-[450px] rounded-full pointer-events-none"
        style={{
          background: isLight
            ? 'radial-gradient(circle, rgba(255, 107, 0, 0.08) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(85, 23, 11, 0.45) 0%, rgba(255, 107, 0, 0.08) 45%, transparent 70%)',
        }}
      />
      <div
        className="absolute bottom-1/4 right-10 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: isLight
            ? 'radial-gradient(circle, rgba(235, 160, 140, 0.15) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(85, 23, 11, 0.3) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-[1320px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* ========================================================= */}
          {/* LEFT COLUMN: Pinned Hero Overview & Dual CTAs             */}
          {/* ========================================================= */}
          <div ref={leftColRef} className="lg:col-span-5 self-start space-y-5 sm:space-y-6 z-10 will-change-transform lg:-mt-7">
            
            {/* Tag Pill */}
            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border backdrop-blur-md ${
              isLight ? 'bg-black/[0.04] border-black/10' : 'bg-white/[0.06] border-white/10'
            }`}>
              <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-pulse" />
              <span className={`text-[12px] font-semibold tracking-widest uppercase ${
                isLight ? 'text-gray-800' : 'text-gray-200'
              }`}>
                Enterprise Suite
              </span>
            </div>

            {/* Heading */}
            <h2 className={`text-3xl sm:text-4xl lg:text-[50px] xl:text-[54px] font-[200] tracking-[-0.035em] leading-[1.08] ${
              isLight ? 'text-gray-950' : 'text-white'
            }`}>
              Unified intelligence across every <span className={`font-semibold text-transparent bg-clip-text bg-gradient-to-r ${
                isLight ? 'from-gray-900 via-orange-950 to-[#FF6B00]' : 'from-white via-orange-100 to-[#FF6B00]'
              }`}>business engine.</span>
            </h2>

            {/* Description */}
            <p className={`text-[15px] sm:text-base font-light leading-relaxed max-w-[480px] ${
              isLight ? 'text-gray-700' : 'text-gray-300'
            }`}>
              Replace fragmented point solutions with an integrated operating system. Connect high-intent lead routing, global workforce HRMS, agile sprint boards, and compliance-first payroll in real time.
            </p>

            {/* Dual CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <button
                type="button"
                className="group relative inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-[#FF6B00] hover:bg-[#FF7B18] active:scale-95 text-[#0A0505] font-semibold text-sm tracking-[0.06em] shadow-[0_4px_26px_rgba(255,107,0,0.55)] hover:shadow-[0_4px_36px_rgba(255,107,0,0.8)] transition-all duration-300"
              >
                <span>START FREE TRIAL</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                className={`inline-flex items-center justify-center px-7 py-3.5 rounded-full border active:scale-95 text-sm font-medium tracking-wide transition-all duration-200 ${
                  isLight
                    ? 'border-gray-300 bg-white/70 hover:bg-white text-gray-900 shadow-sm'
                    : 'border-white/20 hover:border-white/40 bg-white/[0.04] hover:bg-white/[0.08] text-white'
                }`}
              >
                <span>Book a Demo</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className={`pt-5 border-t grid grid-cols-2 gap-3 max-w-[460px] ${
              isLight ? 'border-gray-300/60' : 'border-white/10'
            }`}>
              <div className={`flex items-center gap-2.5 text-[13px] ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                <Check className="w-4 h-4 text-[#FF6B00] shrink-0" />
                <span>99.9% Uptime SLA</span>
              </div>
              <div className={`flex items-center gap-2.5 text-[13px] ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                <Check className="w-4 h-4 text-[#FF6B00] shrink-0" />
                <span>SOC-2 Type II Certified</span>
              </div>
              <div className={`flex items-center gap-2.5 text-[13px] ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                <Check className="w-4 h-4 text-[#FF6B00] shrink-0" />
                <span>No Credit Card Required</span>
              </div>
              <div className={`flex items-center gap-2.5 text-[13px] ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                <Check className="w-4 h-4 text-[#FF6B00] shrink-0" />
                <span>24/7 Dedicated Support</span>
              </div>
            </div>

          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: 2-Column Progressive Scroll Card Grid        */}
          {/* ========================================================= */}
          <div ref={rightColRef} className="lg:col-span-7 pb-20 sm:pb-32">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-7">
              {PRODUCT_CARDS.map((card, idx) => {
                const IconComponent = card.icon;

                return (
                  <motion.div
                    key={card.id}
                    id={card.id}
                    initial={{ opacity: 0, y: 35, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: false, amount: 0.2 }}
                    transition={{
                      duration: 0.65,
                      ease: [0.22, 1, 0.36, 1],
                      delay: (idx % 2) * 0.1,
                    }}
                    whileHover={{ y: -4, transition: { duration: 0.25 } }}
                    className={`group relative backdrop-blur-md rounded-2xl p-6 sm:p-7 min-h-[280px] border transition-all duration-300 flex flex-col justify-between ${
                      isLight
                        ? 'bg-white/90 hover:bg-white border-gray-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.1)]'
                        : 'bg-white/[0.035] hover:bg-white/[0.06] border-white/10 hover:border-white/25 shadow-lg'
                    }`}
                  >
                    
                    {/* Top Glow on Hover */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300" />

                    <div>
                      {/* Card Header: Icon & Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-10 h-10 rounded-xl ${card.accent.bg} border ${card.accent.border} flex items-center justify-center ${card.accent.text}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${card.accent.badgeBg}`}>
                          {card.badge}
                        </span>
                      </div>

                      {/* Category Label */}
                      <span className={`text-[10px] font-bold tracking-widest uppercase block mb-1 ${
                        isLight ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        {card.category}
                      </span>

                      {/* Card Title */}
                      <h3 className={`text-base font-bold tracking-tight leading-snug mb-2 group-hover:text-[#FF7A18] transition-colors ${
                        isLight ? 'text-gray-950' : 'text-white'
                      }`}>
                        {card.title}
                      </h3>

                      {/* Card Description */}
                      <p className={`text-xs sm:text-[13px] leading-relaxed mb-4 ${
                        isLight ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {card.description}
                      </p>
                    </div>

                    {/* Bottom Area: Metric & Learn More Link */}
                    <div className={`pt-3 border-t flex items-center justify-between ${
                      isLight ? 'border-gray-200/70' : 'border-white/[0.08]'
                    }`}>
                      <span className={`text-[11px] font-medium ${
                        isLight ? 'text-gray-800' : 'text-gray-300'
                      }`}>
                        {card.metric}
                      </span>
                      <a
                        href={`#${card.id}`}
                        className={`inline-flex items-center gap-1 text-xs font-semibold transition-colors ${
                          isLight ? 'text-gray-800 hover:text-black' : 'text-white/80 group-hover:text-white'
                        }`}
                      >
                        <span>Learn more</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </a>
                    </div>

                  </motion.div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
