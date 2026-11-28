import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import {
  Check,
  ArrowRight,
  Sparkles,
  Users,
  Shield,
  Clock,
  UserCheck,
} from 'lucide-react';
import plansService from '../../services/plansService';
import { buildRegisterUrl } from '../../utils/authSession';

const DEFAULT_PLANS = [
  {
    id: 'pro-plan',
    slug: 'pro-plan',
    name: 'Professional Plan',
    tagline: 'Ideal for small agile teams building revenue & operations.',
    badge: 'Starter Choice',
    featured: false,
    monthlyPrice: 5000,
    yearlyPrice: Math.round(5000 * 0.93),
    trialDays: 14,
    teamSize: 'Up to 3 Employees',
    adminSeats: '1 Admin User',
    adminControl: 'Admin has full control',
    highlightColor: 'from-orange-500/15 via-transparent to-transparent',
    borderColor: 'border-white/10 hover:border-white/20',
    buttonStyle: 'border border-white/20 hover:border-white/40 bg-white/[0.04] hover:bg-white/[0.08] text-white',
    ctaText: 'Start 14-Day Free Trial',
    modules: [
      { name: 'CRM (Lead Capture & Routing)', included: true },
      { name: 'HRMS (HR Management Modules)', included: true },
      { name: 'Projects & Task Management', included: true },
      { name: 'Reports & Analytics Dashboard', included: true },
      { name: 'SSO / SAML Authentication', included: true },
      { name: 'Support through email', included: true },
    ],
  },
  {
    id: 'enterprise-plan',
    slug: 'enterprise-plan',
    name: 'Enterprise Plan',
    tagline: 'For fast-growing organizations needing complete control.',
    badge: 'MOST POPULAR',
    featured: true,
    monthlyPrice: 7000,
    yearlyPrice: Math.round(7000 * 0.93),
    trialDays: 14,
    teamSize: 'Up to 5 Employees',
    adminSeats: '2 Admin Users',
    adminControl: 'Multi-Admin Governance',
    highlightColor: 'from-[#FF6B00]/20 via-orange-500/5 to-transparent',
    borderColor: 'border-[#FF6B00]/50 shadow-[0_0_25px_rgba(255,107,0,0.15)]',
    buttonStyle: 'bg-[#FF6B00] hover:bg-[#FF7B18] text-[#0A0505] shadow-[0_3px_20px_rgba(255,107,0,0.45)]',
    ctaText: 'Start 14-Day Free Trial',
    modules: [
      { name: 'Complete Enterprise Management', included: true },
      { name: 'Advanced CRM & Lead Routing', included: true },
      { name: 'Full HRMS (Lifecycle & Clearance)', included: true },
      { name: 'Cross-team Projects & Sprint Tasks', included: true },
      { name: 'Executive BI Reports & Analytics', included: true },
      { name: 'Support through email (Priority)', included: true },
    ],
  },
];

export default function PricingSection({ onOpenRegister }) {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'
  const { isLight } = useTheme();
  const [plans, setPlans] = useState(DEFAULT_PLANS);

  const handlePlanClick = (planSlug) => {
    if (onOpenRegister) {
      onOpenRegister(planSlug);
    } else {
      navigate(buildRegisterUrl({ ref: 'pricing', plan: planSlug, billing: billingCycle, mode: 'new-company' }));
    }
  };

  // Fetch real plans from the backend API
  useEffect(() => {
    plansService
      .getActivePlans()
      .then((data) => {
        const list = Array.isArray(data)
          ? data
          : data?.plans || data?.data || data?.items || [];
        if (list && list.length > 0) {
          const mapped = list.map((p, idx) => {
            const isFeatured = idx === 1 || p.slug?.includes('enterprise');
            const monthlyPrice = p.price_monthly_inr || 5000;
            const yearlyPrice = p.price_yearly_inr
              ? Math.round(p.price_yearly_inr / 12)
              : Math.round(monthlyPrice * 0.93);
            const trialDays = p.trial_days || 14;

            // Generate modules list from modules_json or defaults
            const modules = [];
            if (p.modules_json && Object.keys(p.modules_json).length > 0) {
              if (p.modules_json.crm) modules.push({ name: 'CRM (Lead Capture & Routing)', included: true });
              if (p.modules_json.hrms || p.modules_json.payroll) modules.push({ name: 'HRMS (HR Management & Payroll)', included: true });
              if (p.modules_json.projects) modules.push({ name: 'Projects & Task Management', included: true });
              if (p.modules_json.reporting) modules.push({ name: 'Reports & Analytics Dashboard', included: true });
              if (p.sso_enabled) modules.push({ name: 'SSO / SAML Authentication', included: true });
              if (p.support_tier) modules.push({ name: `Support: ${p.support_tier}`, included: true });
            }
            if (modules.length === 0) {
              modules.push(
                { name: 'CRM (Lead Capture & Routing)', included: true },
                { name: 'HRMS (HR Management Modules)', included: true },
                { name: 'Projects & Task Management', included: true },
                { name: 'Reports & Analytics Dashboard', included: true },
                { name: 'Enterprise Governance', included: true },
                { name: 'Email & Platform Support', included: true }
              );
            }

            return {
              id: p.slug || p.id,
              slug: p.slug || p.id,
              name: p.name,
              tagline: p.description || 'Full-suite intelligent enterprise management platform.',
              badge: isFeatured ? 'MOST POPULAR' : 'RECOMMENDED',
              featured: isFeatured,
              monthlyPrice: monthlyPrice,
              yearlyPrice: yearlyPrice,
              trialDays: trialDays,
              teamSize: p.max_employees > 0 ? `Up to ${p.max_employees} Employees` : 'Unlimited Employees',
              adminSeats: `${p.max_admin_users || (isFeatured ? 2 : 1)} Admin User${(p.max_admin_users || (isFeatured ? 2 : 1)) > 1 ? 's' : ''}`,
              adminControl: isFeatured ? 'Multi-Admin Governance' : 'Admin Full Control',
              highlightColor: isFeatured
                ? 'from-[#FF6B00]/20 via-orange-500/5 to-transparent'
                : 'from-orange-500/15 via-transparent to-transparent',
              borderColor: isFeatured
                ? 'border-[#FF6B00]/50 shadow-[0_0_25px_rgba(255,107,0,0.15)]'
                : 'border-white/10 hover:border-white/20',
              buttonStyle: isFeatured
                ? 'bg-[#FF6B00] hover:bg-[#FF7B18] text-[#0A0505] shadow-[0_3px_20px_rgba(255,107,0,0.45)]'
                : 'border border-white/20 hover:border-white/40 bg-white/[0.04] hover:bg-white/[0.08] text-white',
              ctaText: `Start ${trialDays}-Day Free Trial`,
              modules: modules,
            };
          });
          setPlans(mapped);
        }
      })
      .catch((err) => {
        console.warn('Using default pricing plans:', err);
      });
  }, []);

  return (
    <section
      id="pricing"
      className={`relative w-full py-12 sm:py-16 px-4 sm:px-8 lg:px-12 select-none transition-colors duration-300 ${isLight ? 'text-gray-900' : 'text-white'
        }`}
      style={{
        background: isLight
          ? 'linear-gradient(180deg, #F6F1EC 0%, #FAF7F5 35%, #F4EFEB 70%, #EFE9E4 100%)'
          : 'linear-gradient(180deg, #100302 0%, #150604 35%, #0e0404 70%, #0a0404 100%)',
      }}
    >
      {/* Background Architectural Grid Lines */}
      <div className={`absolute inset-0 bg-grid-lines pointer-events-none ${isLight ? 'opacity-10' : 'opacity-15'}`} />

      {/* Ambient Radial Warmth */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[550px] rounded-full pointer-events-none"
        style={{
          background: isLight
            ? 'radial-gradient(circle, rgba(255, 107, 0, 0.08) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(255, 107, 0, 0.10) 0%, rgba(85, 23, 11, 0.25) 45%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-[1100px] mx-auto">

        {/* ========================================================= */}
        {/* HEADER: Pill, Title, Subtitle & Billing Switcher          */}
        {/* ========================================================= */}
        <div className="text-center max-w-[680px] mx-auto space-y-2.5 mb-7 sm:mb-9">

          {/* Section Pill */}
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border backdrop-blur-md ${isLight ? 'bg-black/[0.04] border-black/10' : 'bg-white/[0.06] border-white/10'
            }`}>
            <Sparkles className="w-3 h-3 text-[#FF6B00]" />
            <span className={`text-[10px] font-semibold tracking-widest uppercase ${isLight ? 'text-gray-800' : 'text-gray-300'
              }`}>
              Subscription Plans & Free Trials
            </span>
          </div>

          {/* Heading */}
          <h2 className={`text-2xl sm:text-3xl lg:text-[36px] font-[200] tracking-[-0.03em] leading-[1.12] ${isLight ? 'text-gray-950' : 'text-white'
            }`}>
            Predictable pricing for every <span className={`font-semibold text-transparent bg-clip-text bg-gradient-to-r ${isLight ? 'from-gray-900 via-orange-950 to-[#FF6B00]' : 'from-white via-orange-100 to-[#FF6B00]'
              }`}>stage of growth.</span>
          </h2>

          {/* Subtitle */}
          <p className={`text-xs sm:text-[13px] font-light leading-relaxed max-w-[540px] mx-auto ${isLight ? 'text-gray-600' : 'text-gray-400'
            }`}>
            Select a plan tailored to your team size and management requirements. Start risk-free with zero setup fees.
          </p>

          {/* Billing Switcher with 7% Yearly Discount Badge */}
          <div className="pt-1.5 flex items-center justify-center">
            <div className={`relative inline-flex items-center p-1 rounded-full backdrop-blur-md border ${isLight ? 'bg-black/[0.05] border-black/10' : 'bg-white/[0.04] border-white/10'
              }`}>
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`relative px-4 py-1.5 rounded-full text-xs font-medium transition-colors duration-200 z-10 cursor-pointer ${billingCycle === 'monthly'
                    ? isLight ? 'text-white font-semibold' : 'text-black font-semibold'
                    : isLight ? 'text-gray-600 hover:text-black' : 'text-gray-400 hover:text-white'
                  }`}
              >
                {billingCycle === 'monthly' && (
                  <motion.div
                    layoutId="billingPill"
                    className={`absolute inset-0 rounded-full shadow-sm -z-10 ${isLight ? 'bg-gray-900' : 'bg-white'
                      }`}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                Monthly
              </button>

              <button
                type="button"
                onClick={() => setBillingCycle('yearly')}
                className={`relative px-4 py-1.5 rounded-full text-xs font-medium transition-colors duration-200 flex items-center gap-1.5 z-10 cursor-pointer ${billingCycle === 'yearly'
                    ? isLight ? 'text-white font-semibold' : 'text-black font-semibold'
                    : isLight ? 'text-gray-600 hover:text-black' : 'text-gray-400 hover:text-white'
                  }`}
              >
                {billingCycle === 'yearly' && (
                  <motion.div
                    layoutId="billingPill"
                    className={`absolute inset-0 rounded-full shadow-sm -z-10 ${isLight ? 'bg-gray-900' : 'bg-white'
                      }`}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span>Yearly</span>
                <span className="px-1.5 py-0.5 rounded-full bg-[#FF6B00] text-[#0A0505] text-[9px] font-extrabold uppercase">
                  -7%
                </span>
              </button>
            </div>
          </div>

        </div>

        {/* ========================================================= */}
        {/* CARDS GRID: 3D Flip Card Animation on Billing Switch     */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 max-w-[920px] mx-auto items-stretch">
          {plans.map((plan, index) => {
            const isYearly = billingCycle === 'yearly';

            const renderCardContent = (cycle) => {
              const price = cycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
              const billedAnnuallyText = cycle === 'yearly' ? `(Billed ₹${(plan.yearlyPrice * 12).toLocaleString('en-IN')}/yr)` : '';

              return (
                <div
                  className={`relative flex flex-col justify-between rounded-2xl p-5 sm:p-6 backdrop-blur-md border transition-all duration-300 h-full ${isLight
                      ? plan.featured
                        ? 'bg-white/95 border-[#FF6B00]/40 shadow-[0_12px_36px_rgba(255,107,0,0.12)]'
                        : 'bg-white/95 border-gray-200/90 shadow-[0_12px_36px_rgba(0,0,0,0.06)]'
                      : `${plan.borderColor} bg-white/[0.03] shadow-[0_8px_32px_rgba(0,0,0,0.45)]`
                    }`}
                >
                  {/* Gradient Glow */}
                  <div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${plan.highlightColor} pointer-events-none opacity-70`}
                  />

                  <div className="relative z-10 space-y-3.5">

                    {/* Top: Plan Name & Badge */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className={`text-[10px] font-bold tracking-widest uppercase block ${isLight ? 'text-gray-500' : 'text-gray-400'
                          }`}>
                          Subscription Plan {cycle === 'yearly' && <span className="text-[#FF6B00]">· Annual</span>}
                        </span>
                        <h3 className={`text-lg sm:text-xl font-bold tracking-tight ${isLight ? 'text-gray-950' : 'text-white'
                          }`}>
                          {plan.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {cycle === 'yearly' && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 border border-emerald-500/30 text-[9px] font-extrabold uppercase tracking-wide">
                            7% Saved
                          </span>
                        )}
                        {plan.featured ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-[#FF6B00] text-[#0A0505] text-[10px] font-bold tracking-wider shadow-[0_0_12px_rgba(255,107,0,0.4)]">
                            {plan.badge}
                          </span>
                        ) : (
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${isLight
                              ? 'bg-gray-100 text-gray-700 border-gray-200'
                              : 'bg-white/10 text-gray-300 border-white/15'
                            }`}>
                            {plan.badge}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Pricing Display */}
                    <div className={`pt-1 pb-2.5 border-b flex items-baseline justify-between ${isLight ? 'border-gray-200' : 'border-white/10'
                      }`}>
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className={`text-3xl sm:text-[34px] font-extrabold tracking-tight ${isLight ? 'text-gray-950' : 'text-white'
                            }`}>
                            ₹{Number(price).toLocaleString('en-IN')}
                          </span>
                          <span className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>/ mo</span>
                        </div>
                        {cycle === 'yearly' ? (
                          <span className="text-[10px] text-emerald-600 block mt-0.5 font-medium">
                            7% off applied {billedAnnuallyText}
                          </span>
                        ) : (
                          <span className={`text-[10px] block mt-0.5 font-light ${isLight ? 'text-gray-500' : 'text-gray-400'
                            }`}>
                            Standard monthly billing
                          </span>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] font-semibold text-[#FF6B00] block">
                          {plan.trialDays}-Day Free Trial
                        </span>
                        <span className={`text-[10px] ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Zero card charge</span>
                      </div>
                    </div>

                    {/* Limits Bar: Team Limit & Admin Control */}
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className={`rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 border ${isLight
                          ? 'bg-gray-50 border-gray-200 text-gray-700'
                          : 'bg-white/[0.04] border-white/[0.08] text-gray-300'
                        }`}>
                        <Users className="w-3.5 h-3.5 text-[#FF6B00] shrink-0" />
                        <span className="truncate">{plan.teamSize}</span>
                      </div>
                      <div className={`rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 border ${isLight
                          ? 'bg-gray-50 border-gray-200 text-gray-700'
                          : 'bg-white/[0.04] border-white/[0.08] text-gray-300'
                        }`}>
                        <Shield className="w-3.5 h-3.5 text-[#FF6B00] shrink-0" />
                        <span className="truncate">{plan.adminSeats}</span>
                      </div>
                    </div>

                    {/* Admin Note */}
                    <div className={`text-[11px] rounded-lg px-2.5 py-1 flex items-center gap-1.5 border ${isLight
                        ? 'text-orange-900 bg-orange-50 border-orange-200'
                        : 'text-orange-200/90 bg-orange-500/10 border-orange-500/15'
                      }`}>
                      <UserCheck className="w-3 h-3 text-[#FF6B00] shrink-0" />
                      <span>{plan.adminControl}</span>
                    </div>

                    {/* Included Modules */}
                    <div className="space-y-1.5 pt-0.5">
                      <span className={`text-[10px] font-bold tracking-wider uppercase block ${isLight ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                        Included Modules
                      </span>
                      <ul className="space-y-1.5 text-xs">
                        {plan.modules.map((mod, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className={`text-[11px] sm:text-xs ${isLight ? 'text-gray-700' : 'text-gray-300'
                              }`}>{mod.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                  </div>

                  {/* Bottom CTA Button */}
                  <div className={`relative z-10 pt-3.5 mt-3.5 border-t ${isLight ? 'border-gray-200' : 'border-white/10'
                    }`}>
                    <button
                      type="button"
                      onClick={() => handlePlanClick(plan.slug || plan.id)}
                      className={`w-full py-2.5 px-4 rounded-full font-semibold text-xs sm:text-[13px] tracking-wide transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer ${isLight && !plan.featured
                          ? 'border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-900 shadow-sm'
                          : plan.buttonStyle
                        }`}
                    >
                      <span>{plan.ctaText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              );
            };

            return (
              <div
                key={plan.id}
                className="w-full relative [perspective:1400px]"
              >
                <motion.div
                  animate={{ rotateY: isYearly ? 180 : 0 }}
                  transition={{
                    duration: 0.45,
                    ease: [0.22, 1, 0.36, 1],
                    delay: index * 0.04,
                  }}
                  style={{
                    transformStyle: 'preserve-3d',
                  }}
                  className="w-full h-full relative"
                >
                  {/* FRONT FACE: Monthly */}
                  <div
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      pointerEvents: isYearly ? 'none' : 'auto',
                    }}
                    className="w-full h-full"
                  >
                    {renderCardContent('monthly')}
                  </div>

                  {/* BACK FACE: Yearly */}
                  <div
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      pointerEvents: isYearly ? 'auto' : 'none',
                    }}
                    className="w-full h-full absolute inset-0"
                  >
                    {renderCardContent('yearly')}
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Bottom Fast Assurance Strip */}
        <div className="mt-6 pt-3.5 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-[11px] text-gray-400">
          <span>✓ Prices in Indian Rupees (INR)</span>
          <span>✓ 7% Yearly Discount</span>
          <span>✓ Free Trial on All Plans</span>
          <span>✓ Cancel Anytime</span>
        </div>

      </div>
    </section>
  );
}
