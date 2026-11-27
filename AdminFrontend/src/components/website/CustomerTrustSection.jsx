import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import {
  Sparkles,
  ArrowUpRight,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Zap,
  Globe2,
  Award
} from 'lucide-react';

const TRUSTED_LOGOS = [
  {
    name: 'Amazon',
    svg: (
      <svg className="h-6 w-auto fill-current" viewBox="0 0 100 30">
        <path d="M59.3 22.8c-7.8 5.7-19.1 8.8-28.7 8.8-13.6 0-25.8-5-30.6-13.5-.4-.7-.2-1.6.5-1.9.7-.3 1.5-.1 1.9.6 4.3 7.7 15.6 12.2 28.2 12.2 9 0 19.6-3 27-8.3.8-.5 1.7.3 1.2 1.1-.1.3-.3.7-.5 1z" />
        <path d="M62.2 20.3c-.6-.8-4.2-.4-5.8-.2-.5.1-.6-.4-.2-.7 2.7-1.9 7.1-1.3 7.6-.7.6.7-.2 5.1-2.7 7.2-.4.3-.8.1-.6-.4.5-1.3 2.3-4.4 1.7-5.2z" />
        <path d="M14.7 17.5c0 3.2-1.8 4.9-4.8 4.9-2.7 0-4.5-1.7-4.5-4.9 0-3.3 1.8-5 4.6-5 2.9 0 4.7 1.8 4.7 5zm2.8 0c0-4.7-3.2-7.3-7.5-7.3-4.4 0-7.4 2.6-7.4 7.3s3.1 7.2 7.4 7.2c4.3 0 7.5-2.5 7.5-7.2zm9.8 6.9h2.7V10.5h-2.7v2.1c-1.1-1.5-2.7-2.4-4.8-2.4-4.1 0-7.1 2.8-7.1 7.1 0 4.4 3 7.1 7.1 7.1 2.1 0 3.8-.9 4.8-2.4v2.4zm-4.6-2.3c-2.7 0-4.5-1.8-4.5-4.8s1.8-4.8 4.5-4.8 4.5 1.8 4.5 4.8-1.8 4.8-4.5 4.8zm15.4 2.3h2.7v-7.9c0-2.8 1.4-4.2 3.6-4.2 2 0 3.2 1.3 3.2 3.8v8.3h2.7v-8.7c0-3.7-2.1-5.8-5.3-5.8-2.3 0-4.1 1.1-5 2.9v-2.5h-2.7v14.1zm19.6 0h2.7V10.5H55v2.1c-1.1-1.5-2.7-2.4-4.8-2.4-4.1 0-7.1 2.8-7.1 7.1 0 4.4 3 7.1 7.1 7.1 2.1 0 3.8-.9 4.8-2.4v2.4zm-4.6-2.3c-2.7 0-4.5-1.8-4.5-4.8s1.8-4.8 4.5-4.8 4.5 1.8 4.5 4.8-1.8 4.8-4.5 4.8z" />
      </svg>
    ),
  },
  {
    name: 'Snowflake',
    svg: (
      <svg className="h-6 w-auto fill-current" viewBox="0 0 110 24">
        <path d="M12 2v20M2 12h20M5 5l14 14M5 19L19 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <text x="30" y="17" className="font-bold text-[14px]" fill="currentColor" letterSpacing="0.05em">snowflake</text>
      </svg>
    ),
  },
  {
    name: 'Stripe',
    svg: (
      <svg className="h-6 w-auto fill-current" viewBox="0 0 70 24">
        <text x="0" y="18" className="font-extrabold text-[18px]" fill="currentColor" letterSpacing="-0.03em">stripe</text>
      </svg>
    ),
  },
  {
    name: 'Scale AI',
    svg: (
      <svg className="h-6 w-auto fill-current" viewBox="0 0 90 24">
        <rect x="0" y="5" width="14" height="14" rx="3" fill="#FF6B00" />
        <text x="22" y="17" className="font-bold text-[14px]" fill="currentColor" letterSpacing="0.04em">scale ai</text>
      </svg>
    ),
  },
  {
    name: 'Revolut',
    svg: (
      <svg className="h-6 w-auto fill-current" viewBox="0 0 85 24">
        <text x="0" y="17" className="font-black text-[16px]" fill="currentColor" letterSpacing="0.02em">Revolut</text>
      </svg>
    ),
  },
  {
    name: 'Vercel',
    svg: (
      <svg className="h-6 w-auto fill-current" viewBox="0 0 75 24">
        <path d="M8 4L16 18H0L8 4Z" fill="currentColor" />
        <text x="24" y="16" className="font-semibold text-[14px]" fill="currentColor" letterSpacing="0.04em">▲ Vercel</text>
      </svg>
    ),
  },
];

export default function CustomerTrustSection() {
  const { isLight } = useTheme();

  return (
    <div className="relative w-full overflow-hidden select-none">
      {/* ========================================================= */}
      {/* CUSTOMER-TRUST SECTION CONTAINING COMPANY LOGOS           */}
      {/* ========================================================= */}
      <section
        className={`relative w-full py-16 sm:py-24 px-5 sm:px-10 transition-colors duration-300 ${
          isLight ? 'bg-[#EFE9E4]' : 'bg-[#0a0404]'
        }`}
      >
        <div className="max-w-[1320px] mx-auto text-center space-y-10">
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className={`text-[11px] sm:text-xs font-semibold tracking-[0.2em] uppercase ${
              isLight ? 'text-gray-600' : 'text-gray-400'
            }`}>
              TRUSTED BY HIGH-GROWTH INDUSTRY LEADERS
            </p>
          </motion.div>

          {/* Logo Grid with Elegant Hover and Opacity */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 sm:gap-12 items-center justify-items-center opacity-85"
          >
            {TRUSTED_LOGOS.map((company, i) => (
              <div
                key={company.name}
                className={`transition-colors duration-300 flex items-center justify-center p-2 ${
                  isLight
                    ? 'text-gray-600 hover:text-gray-950'
                    : 'text-gray-400 hover:text-white'
                }`}
                title={company.name}
              >
                {company.svg}
              </div>
            ))}
          </motion.div>

          {/* Bottom Footer Info */}
          <div className={`pt-12 border-t flex flex-col sm:flex-row items-center justify-between text-xs gap-4 ${
            isLight ? 'border-gray-300/80 text-gray-600' : 'border-white/10 text-gray-500'
          }`}>
            <div className="flex items-center gap-2">
              <span className={`font-semibold ${isLight ? 'text-gray-900' : 'text-gray-300'}`}>Senti</span>
              <span>© 2026 Senti Technologies Inc. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#privacy" className={`transition-colors ${isLight ? 'hover:text-black' : 'hover:text-gray-300'}`}>Privacy Policy</a>
              <a href="#terms" className={`transition-colors ${isLight ? 'hover:text-black' : 'hover:text-gray-300'}`}>Terms of Service</a>
              <a href="#security" className={`transition-colors ${isLight ? 'hover:text-black' : 'hover:text-gray-300'}`}>Security & Compliance</a>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
