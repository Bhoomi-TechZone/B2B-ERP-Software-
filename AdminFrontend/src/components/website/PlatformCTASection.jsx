import React from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowUpRight, ArrowRight, CheckCircle2 } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function PlatformCTASection({
  embedded = false,
  onOpenRegister,
}) {
  const { isLight } = useTheme();

  return (
    <section
      id="platform-cta"
      className={`relative w-full overflow-hidden select-none flex flex-col z-10 transition-colors duration-300 ${
        embedded
          ? "h-full pt-14 sm:pt-16 pb-8 sm:pb-10 justify-between"
          : "min-h-screen pt-16 sm:pt-20 pb-28 sm:pb-36 justify-between"
      } px-5 sm:px-10 lg:px-16`}
      style={{
        background: isLight
          ? "linear-gradient(180deg, #FFFFFF 0%, #FFF5F2 28%, #FFEAE5 50%, #FAD7CF 72%, #F1BEB4 88%, #E7A79A 100%)"
          : "linear-gradient(180deg, #F8C5D1 0%, #F9CED1 32%, #F6B8AB 54%, #DF8573 70%, #9B3B2B 86%, #6B1F11 96%, #55170B 100%)",
      }}
    >
      {/* Subtle Ambient Radial Glows */}
      <div
        className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(255, 255, 255, 0.45) 0%, transparent 70%)",
          filter: "blur(55px)",
        }}
      />
      <div
        className="absolute bottom-10 right-1/4 w-[450px] h-[450px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(255, 184, 157, 0.4) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <motion.div
        initial={embedded ? false : { opacity: 0, scale: 0.94, y: 35 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        animate={embedded ? { opacity: 1, scale: 1, y: 0 } : undefined}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 max-w-[1320px] mx-auto w-full flex-1 flex flex-col justify-between"
      >
        {/* Top Bar: Icon on Left, Dashed Divider, Outlined CTA on Right */}
        <motion.div
          initial={embedded ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          animate={embedded ? { opacity: 1, y: 0 } : undefined}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-between gap-3 mb-3 sm:mb-5"
        >
          {/* Small icon on the left */}
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/75 backdrop-blur-md border border-white/80 shadow-[0_4px_16px_rgba(240,140,130,0.18)] flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-[#FF6B00]" />
          </div>

          {/* Horizontal dashed divider */}
          <div className="flex-1 mx-3 sm:mx-8 border-b border-dashed border-gray-400/40" />

          {/* Outlined CTA button on the right */}
          <button
            type="button"
            className="group px-5 py-2.5 rounded-full border border-gray-900/15 bg-white/45 hover:bg-white/85 active:scale-95 text-gray-900 text-xs sm:text-[13px] font-medium tracking-wide transition-all duration-200 shadow-sm flex items-center gap-1.5 shrink-0"
          >
            <span>Explore Platform</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-gray-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </motion.div>

        {/* Center Call-to-Action Content with Smooth Upward Transition */}
        <motion.div
          initial={embedded ? false : { opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          animate={embedded ? { opacity: 1, y: 0 } : undefined}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="max-w-[880px] mx-auto text-center space-y-5 sm:space-y-6"
        >
          <h2 className="text-3xl sm:text-5xl lg:text-[56px] font-[500] text-gray-950 tracking-[-0.03em] leading-[1.08]">
            Automate your revenue & global workforce in one intelligent
            platform.
          </h2>

          <p className="text-gray-700 text-sm sm:text-base md:text-[17px] font-normal leading-relaxed max-w-[620px] mx-auto">
            Join thousands of fast-growing teams identifying high-intent
            accounts, automating hiring pipelines, and running audit-ready
            global payroll with Senti.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              type="button"
              onClick={() =>
                onOpenRegister ? onOpenRegister("starter") : null
              }
              className="group relative inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-gray-950 hover:bg-black active:scale-95 text-white font-semibold text-sm tracking-wide shadow-[0_4px_25px_rgba(0,0,0,0.25)] hover:shadow-[0_4px_35px_rgba(0,0,0,0.35)] transition-all duration-300"
            >
              <span>GET STARTED TODAY</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              type="button"
              className="inline-flex items-center justify-center px-7 py-3.5 rounded-full border border-gray-900/20 hover:border-gray-900/40 bg-white/40 hover:bg-white/70 active:scale-95 text-gray-950 font-medium text-sm tracking-wide transition-all duration-200"
            >
              <span>Talk to Sales</span>
            </button>
          </div>

          {/* Key Assurance Badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-800 font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Zero setup fee</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Ambient Lighting Warmth */}
      <div
        className="absolute bottom-16 right-1/4 w-[500px] h-[300px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(168, 69, 51, 0.4) 0%, rgba(85, 23, 11, 0.2) 60%, transparent 80%)",
          filter: "blur(45px)",
        }}
      />
    </section>
  );
}
