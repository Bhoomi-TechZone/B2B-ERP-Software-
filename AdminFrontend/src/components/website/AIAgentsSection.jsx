import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import {
  Sparkles,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  CheckCircle2,
  Users,
  Search,
  Zap,
  TrendingUp,
  Clock,
  ShieldCheck,
  Coins,
  LayoutGrid,
  UserCheck,
  FolderKanban,
  Check,
  Calendar,
  Briefcase,
  Layers,
  ArrowRight,
} from "lucide-react";

const CARDS_DATA = [
  {
    id: 0,
    name: "Sales CRM & Pipeline Automation",
    category: "SALES & GROWTH",
    title: "Intelligent Sales CRM & Lead Routing",
    description:
      "Accelerate revenue with automated lead capture, BANT qualification scoring, and SLA tracking. Automatically distribute incoming leads to sales reps via smart round-robin routing with a complete reassignment audit trail.",
    highlights: [
      "Automated round-robin lead distribution",
      "Real-time SLA breach countdowns & notifications",
      "Visual deal stages from demo to won client",
    ],
    accent: {
      text: "text-orange-600",
      bg: "bg-orange-50",
      border: "border-orange-200/80",
      pill: "bg-orange-500/10 text-[#FF6B00]",
      gradient: "from-orange-500/20 to-amber-500/20",
      shadow: "rgba(255, 107, 0, 0.35)",
    },
    icon: TrendingUp,
    badgeText: "Active Lead Engine",
    mockupType: "crm",
  },
  {
    id: 1,
    name: "Core HRMS & People Operations",
    category: "HUMAN RESOURCES",
    title: "Complete Employee Lifecycle Management",
    description:
      "Centralize your global workforce from day one through offboarding. Manage digital employee profiles, departmental hierarchies, and full-and-final (FnF) exit clearances in one unified system of record.",
    highlights: [
      "360° employee directory & organizational chart",
      "Guided onboarding & offboarding workflows",
      "Team collaboration notes with live @mentions",
    ],
    accent: {
      text: "text-rose-600",
      bg: "bg-rose-50",
      border: "border-rose-200/80",
      pill: "bg-rose-500/10 text-rose-600",
      gradient: "from-rose-500/20 to-pink-500/20",
      shadow: "rgba(244, 63, 94, 0.35)",
    },
    icon: Users,
    badgeText: "Unified HR System",
    mockupType: "hrms",
  },
  {
    id: 2,
    name: "Project & Task Management",
    category: "WORKFLOW & COLLABORATION",
    title: "Agile Projects & Interactive Kanban Boards",
    description:
      "Keep cross-functional teams aligned and shipping on time. Visualize project progress with drag-and-drop Kanban boards, sprint task tracking, deadline alerts, and team workload balancing.",
    highlights: [
      "Drag-and-drop task boards (To Do ➔ Done)",
      "Workload balancing across team members",
      "Task attachments, checklists, and priority tags",
    ],
    accent: {
      text: "text-indigo-600",
      bg: "bg-indigo-50",
      border: "border-indigo-200/80",
      pill: "bg-indigo-500/10 text-indigo-600",
      gradient: "from-indigo-500/20 to-violet-500/20",
      shadow: "rgba(99, 102, 241, 0.35)",
    },
    icon: FolderKanban,
    badgeText: "Agile Sprint Active",
    mockupType: "projects",
  },
  {
    id: 3,
    name: "Recruitment & Applicant Tracking System (ATS)",
    category: "TALENT ACQUISITION",
    title: "Modern ATS & Candidate Pipeline",
    description:
      "Attract and hire top talent without spreadsheets. Publish branded job listings, track candidates through visual hiring stages, evaluate interview feedback scorecards, and convert hires into employees with a single click.",
    highlights: [
      "Branded public careers portal & job postings",
      "Visual hiring pipeline (Applied ➔ Interview ➔ Offer)",
      "1-click candidate-to-employee onboarding conversion",
    ],
    accent: {
      text: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-200/80",
      pill: "bg-purple-500/10 text-purple-600",
      gradient: "from-purple-500/20 to-fuchsia-500/20",
      shadow: "rgba(168, 85, 247, 0.35)",
    },
    icon: UserCheck,
    badgeText: "12 Roles Open",
    mockupType: "ats",
  },
  {
    id: 4,
    name: "Time, Attendance & Shift Roster Engine",
    category: "TIME TRACKING",
    title: "Automated Rosters & Shift Scheduling",
    description:
      "Eliminate scheduling conflicts and manual timesheets. Auto-generate weekly shift rosters across departments, capture daily punch-in/out logs, and manage multi-level leave approvals effortlessly.",
    highlights: [
      "1-click AI/Auto shift roster generator",
      "Real-time punch logs & overtime tracking",
      "Multi-tier leave requests & approval workflows",
    ],
    accent: {
      text: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200/80",
      pill: "bg-amber-500/10 text-amber-600",
      gradient: "from-amber-500/20 to-orange-500/20",
      shadow: "rgba(245, 158, 11, 0.35)",
    },
    icon: Clock,
    badgeText: "100% Shift Coverage",
    mockupType: "time",
  },
  {
    id: 5,
    name: "Global Payroll & Compliance Autopilot",
    category: "PAYROLL & LEGAL",
    title: "Multi-Currency Payroll & Statutory Compliance",
    description:
      "Pay your team accurately and stay audit-ready in every market. Configure custom salary structures, automate deductions, generate digital payslips, and keep up with country-specific labor laws.",
    highlights: [
      "Multi-region currency support (USD, GBP, EUR, INR)",
      "Automated tax, deductions, and payslip generation",
      "Compliance document vault with expiry alerts",
    ],
    accent: {
      text: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200/80",
      pill: "bg-emerald-500/10 text-emerald-600",
      gradient: "from-emerald-500/20 to-teal-500/20",
      shadow: "rgba(16, 185, 129, 0.35)",
    },
    icon: ShieldCheck,
    badgeText: "Audit Ready • Multi-Region",
    mockupType: "payroll",
  },
];

export default function AIAgentsSection() {
  const { isLight } = useTheme();
  const [activeIndex, setActiveIndex] = useState(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      const c = parseInt(p.get("card"), 10);
      if (!isNaN(c) && c >= 0 && c < CARDS_DATA.length) return c;
    }
    return 0;
  });
  const [hasEntered, setHasEntered] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [atsHired, setAtsHired] = useState(false);

  const totalCards = CARDS_DATA.length;

  const handlePrev = () => {
    setHasEntered(true);
    setActiveIndex((prev) => (prev === 0 ? totalCards - 1 : prev - 1));
  };

  const handleNext = () => {
    setHasEntered(true);
    setActiveIndex((prev) => (prev === totalCards - 1 ? 0 : prev + 1));
  };

  // Continuous horizontal carousel auto-scroll (activates after initial entrance lands, pauses on hover)
  useEffect(() => {
    if (!hasEntered || isHovered) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev === totalCards - 1 ? 0 : prev + 1));
    }, 3000);

    return () => clearInterval(timer);
  }, [totalCards, hasEntered, isHovered]);

  // Dynamic organic offsets for the "random/scattered" bottom entrance
  const getEntranceInitial = (index) => {
    let diff = index - activeIndex;
    if (diff < -2) diff += totalCards;
    if (diff > 3) diff -= totalCards;

    if (diff === 0) {
      return {
        y: 190,
        rotate: 0,
        scale: 0.84,
        opacity: 0,
        x: "0%",
      };
    }
    if (diff === -1) {
      return {
        y: 240,
        rotate: -5,
        scale: 0.76,
        opacity: 0,
        x: "-68%",
      };
    }
    if (diff === 1) {
      return {
        y: 145,
        rotate: 4.5,
        scale: 0.76,
        opacity: 0,
        x: "68%",
      };
    }
    return {
      y: 270,
      rotate: 0,
      scale: 0.7,
      opacity: 0,
      x: diff < 0 ? "-135%" : "135%",
    };
  };

  const getEntranceDelay = (index) => {
    let diff = index - activeIndex;
    if (diff < -2) diff += totalCards;
    if (diff > 3) diff -= totalCards;

    if (diff === 1) return 0.08; // Right card floats up first
    if (diff === 0) return 0.22; // Center card surges up second
    if (diff === -1) return 0.38; // Left card floats up third
    return 0.45;
  };

  // Helper to calculate circular card position & motion styles relative to active index
  const getCardStyle = (index) => {
    let diff = index - activeIndex;
    if (diff < -2) diff += totalCards;
    if (diff > 3) diff -= totalCards;

    if (diff === 0) {
      return {
        x: "0%",
        y: 0,
        rotate: 0,
        scale: 1,
        opacity: 1,
        zIndex: 30,
        rotateY: 0,
        filter: "blur(0px)",
        pointerEvents: "auto",
      };
    }

    if (diff === -1) {
      return {
        x: "-68%",
        y: 0,
        rotate: 0,
        scale: 0.88,
        opacity: 0.55,
        zIndex: 20,
        rotateY: 8,
        filter: "blur(0px)",
        pointerEvents: "auto",
      };
    }

    if (diff === 1) {
      return {
        x: "68%",
        y: 0,
        rotate: 0,
        scale: 0.88,
        opacity: 0.55,
        zIndex: 20,
        rotateY: -8,
        filter: "blur(0px)",
        pointerEvents: "auto",
      };
    }

    if (diff < -1) {
      return {
        x: "-135%",
        y: 0,
        rotate: 0,
        scale: 0.74,
        opacity: 0,
        zIndex: 10,
        rotateY: 15,
        filter: "blur(4px)",
        pointerEvents: "none",
      };
    }

    return {
      x: "135%",
      y: 0,
      rotate: 0,
      scale: 0.74,
      opacity: 0,
      zIndex: 10,
      rotateY: -15,
      filter: "blur(4px)",
      pointerEvents: "none",
    };
  };

  // Mini-UI Widget renderer for each card
  const renderMockup = (type) => {
    switch (type) {
      case "crm":
        return (
          <div className="bg-[#12141a] text-white p-4 rounded-2xl shadow-inner border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-pulse" />
                <span className="font-medium text-gray-300">
                  Smart Round-Robin Routing
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium text-[11px]">
                SLA: 14m 20s remaining
              </span>
            </div>

            {/* Deal Stages Pipeline */}
            <div className="grid grid-cols-4 gap-1.5 py-1">
              {[
                { name: "Lead In", active: true, color: "bg-orange-500" },
                { name: "BANT Demo", active: true, color: "bg-orange-500" },
                { name: "Proposal", active: true, color: "bg-[#FF7A18]" },
                { name: "Won Client", active: false, color: "bg-white/10" },
              ].map((stage, i) => (
                <div key={i} className="text-center">
                  <div className={`h-1.5 rounded-full mb-1 ${stage.color}`} />
                  <span className="text-[10px] text-gray-400 block truncate">
                    {stage.name}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
              <span className="text-gray-400">
                Assigned: Sarah Jenkins (Tier 1 Rep)
              </span>
              <span className="text-[#FF7A18] font-semibold">
                98.4% Match Score
              </span>
            </div>
          </div>
        );

      case "hrms":
        return (
          <div className="bg-[#12141a] text-white p-4 rounded-2xl shadow-inner border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-rose-500/30 text-rose-300 flex items-center justify-center font-bold text-[10px]">
                  ER
                </div>
                <div>
                  <span className="font-semibold text-white block leading-tight">
                    Elena Rostova
                  </span>
                  <span className="text-[10px] text-gray-400">
                    Head of People & Culture
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-medium text-[11px]">
                360° Directory
              </span>
            </div>

            {/* Lifecycle Stages */}
            <div className="bg-white/5 p-2.5 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-gray-300">Guided Onboarding (Day 3)</span>
              </div>
              <span className="text-xs font-semibold text-emerald-400">
                92% Done
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-white/10 text-gray-400">
              <span>Full-and-Final (FnF) Clearance Engine</span>
              <span className="text-gray-300 font-medium">
                Auto-Audit Ready
              </span>
            </div>
          </div>
        );

      case "projects":
        return (
          <div className="bg-[#12141a] text-white p-4 rounded-2xl shadow-inner border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-300">
                  Sprint 42 Kanban Board
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-medium text-[11px]">
                Velocity: 88 pts
              </span>
            </div>

            {/* Kanban Columns */}
            <div className="grid grid-cols-3 gap-2 py-1">
              <div className="bg-white/5 p-2 rounded-xl text-center">
                <span className="text-[10px] text-gray-400 block mb-1">
                  To Do (4)
                </span>
                <div className="bg-white/10 p-1 rounded text-[10px] text-gray-300 truncate">
                  API Webhook
                </div>
              </div>
              <div className="bg-white/5 p-2 rounded-xl text-center border border-indigo-500/30">
                <span className="text-[10px] text-indigo-300 block mb-1">
                  In Progress (3)
                </span>
                <div className="bg-indigo-500/30 p-1 rounded text-[10px] text-white font-medium truncate">
                  Auth Sync
                </div>
              </div>
              <div className="bg-white/5 p-2 rounded-xl text-center">
                <span className="text-[10px] text-emerald-400 block mb-1">
                  Done (18)
                </span>
                <div className="bg-emerald-500/20 p-1 rounded text-[10px] text-emerald-300 truncate">
                  Lead Scoring
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-white/10">
              <span className="text-gray-400">
                Team Workload: Balanced (78%)
              </span>
              <span className="text-indigo-400 font-semibold">
                Priority: High
              </span>
            </div>
          </div>
        );

      case "ats":
        return (
          <div className="bg-[#12141a] text-white p-4 rounded-2xl shadow-inner border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">
                  Staff Product Designer
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-medium text-[11px]">
                Score: 4.9/5 ★
              </span>
            </div>

            {/* Hiring Pipeline Stage */}
            <div className="flex items-center gap-1.5 py-1 text-xs">
              <span className="px-2 py-1 bg-white/10 rounded-lg text-[11px] text-gray-400">
                Applied
              </span>
              <ArrowRight className="w-3 h-3 text-gray-500" />
              <span className="px-2 py-1 bg-white/10 rounded-lg text-[11px] text-gray-400">
                Screen
              </span>
              <ArrowRight className="w-3 h-3 text-gray-500" />
              <span className="px-2 py-1 bg-purple-500/30 text-purple-200 border border-purple-500/40 rounded-lg text-[11px] font-semibold">
                Offer Stage
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10">
              <span className="text-gray-400">Candidate: David Chen</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setAtsHired(!atsHired);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all duration-200 active:scale-95 ${atsHired
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                    : "bg-purple-600 hover:bg-purple-500 text-white"
                  }`}
              >
                {atsHired ? "✓ Hired & Onboarded" : "1-Click Hire ➔ Onboard"}
              </button>
            </div>
          </div>
        );

      case "time":
        return (
          <div className="bg-[#12141a] text-white p-4 rounded-2xl shadow-inner border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-medium text-gray-300">
                  Automated Weekly Shift Roster
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium text-[11px]">
                0 Scheduling Conflicts
              </span>
            </div>

            {/* Punch Log Status */}
            <div className="bg-white/5 p-2.5 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-gray-400 block">
                  Daily Punch Status
                </span>
                <span className="text-xs font-semibold text-white">
                  09:00 AM – 05:30 PM (On Time)
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-400 block">
                  Leave Balance
                </span>
                <span className="text-xs font-semibold text-emerald-400">
                  18 Days Available
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-white/10 text-gray-400">
              <span>Multi-tier Leave Sign-off</span>
              <span className="text-amber-400 font-medium">
                ⚡ 1-Click Auto-Schedule
              </span>
            </div>
          </div>
        );

      case "payroll":
        return (
          <div className="bg-[#12141a] text-white p-4 rounded-2xl shadow-inner border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Coins className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-medium text-gray-300">
                  Global Multi-Currency Payroll
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                <span>USD</span>•<span>EUR</span>•<span>GBP</span>•
                <span>INR</span>
              </div>
            </div>

            {/* Payroll Cycle Metric */}
            <div className="bg-white/5 p-2.5 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-gray-400 block">
                  Monthly Payroll Run
                </span>
                <span className="text-sm font-bold text-white">
                  $142,500.00
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-400 block">
                  Compliance Status
                </span>
                <span className="text-xs font-semibold text-emerald-400">
                  100% Audit Ready
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-white/10 text-gray-400">
              <span>Statutory Tax & Payslip Vault</span>
              <span className="text-emerald-400 font-medium">
                0 Pending Expiries
              </span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section
      id="ai-agents-hub"
      className="relative w-full h-full min-h-screen flex flex-col justify-between overflow-hidden pt-8 sm:pt-10 lg:pt-12 pb-5 sm:pb-6 lg:pb-8 px-4 sm:px-8 lg:px-14 select-none transition-colors duration-300"
      style={{
        background: isLight
          ? "linear-gradient(180deg, #E7A79A 0%, #F0C4BB 22%, #F6E1DB 50%, #FAF0EB 80%, #F4ECE7 100%)"
          : "linear-gradient(180deg, #55170B 0%, #4D1409 25%, #350D06 60%, #1E0704 85%, #120403 100%)",
      }}
    >
      {/* Top Ambient Bloom - Seamless blend matching theme */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[260px] rounded-full pointer-events-none"
        style={{
          background: isLight
            ? "radial-gradient(ellipse at center, rgba(231, 167, 154, 0.4) 0%, rgba(244, 236, 231, 0.1) 60%, transparent 80%)"
            : "radial-gradient(ellipse at center, rgba(140, 35, 15, 0.45) 0%, rgba(85, 23, 11, 0.2) 60%, transparent 80%)",
          filter: "blur(50px)",
        }}
      />
      {/* Subtle Ambient Radial Lighting Highlights */}
      <div
        className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(255, 107, 0, 0.16) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-10 right-1/4 w-[450px] h-[450px] rounded-full pointer-events-none"
        style={{
          background: isLight
            ? "radial-gradient(circle, rgba(255, 184, 157, 0.25) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(140, 35, 15, 0.35) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-[1320px] w-full mx-auto flex-1 flex flex-col justify-between">
        {/* ========================================================= */}
        {/* TOP SECTION: Icon, Dashed Divider & Explore Button        */}
        {/* ========================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center justify-between gap-3 mb-3 sm:mb-5">
            {/* Left: Small rounded-square container with orange AI icon */}
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl backdrop-blur-md border shadow-[0_4px_16px_rgba(0,0,0,0.15)] flex items-center justify-center shrink-0 ${isLight
                  ? "bg-white/80 border-gray-200 shadow-sm"
                  : "bg-white/10 border-white/20"
                }`}
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF6B00]" />
            </div>

            {/* Center: Thin horizontal dashed divider */}
            <div
              className={`flex-1 mx-3 sm:mx-8 border-b border-dashed ${isLight ? "border-gray-400/40" : "border-white/20"}`}
            />

            {/* Right: Outlined button labelled "Explore Agent Hub" */}
            <button
              type="button"
              className={`group px-4 sm:px-5 py-1.5 sm:py-2 rounded-full border active:scale-95 text-xs sm:text-[13px] font-medium tracking-wide transition-all duration-200 shadow-sm flex items-center gap-1.5 shrink-0 ${isLight
                  ? "border-gray-300 bg-white/80 hover:bg-white text-gray-900 shadow-sm"
                  : "border-white/20 bg-white/10 hover:bg-white/20 text-white"
                }`}
            >
              <span>Explore Agent Hub</span>
              <ArrowUpRight
                className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${isLight ? "text-gray-700" : "text-gray-300"
                  }`}
              />
            </button>
          </div>

          {/* Below: Two-column layout (Heading & Description) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-8 mb-4 sm:mb-6 items-end">
            {/* Left heading */}
            <div className="lg:col-span-7">
              <h2
                className={`text-2xl sm:text-3xl md:text-[36px] lg:text-[40px] font-[500] tracking-[-0.025em] leading-[1.12] ${isLight ? "text-gray-950" : "text-white"
                  }`}
              >
                Built-in AI agents that work for you 24/7.
              </h2>
            </div>

            {/* Right description */}
            <div className="lg:col-span-5 pb-1">
              <p
                className={`text-xs sm:text-[13px] md:text-[14px] font-light leading-relaxed ${isLight ? "text-gray-700" : "text-gray-300"
                  }`}
              >
                Automate your entire organization from revenue growth to
                workforce compliance. Always-on intelligent agents handling
                pipelines, people, projects, and payroll.
              </p>
            </div>
          </div>

          {/* Quick Category Tabs Bar */}
          <div className="hidden sm:flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 mb-2">
            {CARDS_DATA.map((card, idx) => (
              <button
                key={card.id}
                type="button"
                onClick={() => {
                  setHasEntered(true);
                  setActiveIndex(idx);
                }}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider transition-all duration-200 whitespace-nowrap ${activeIndex === idx
                    ? "bg-[#FF6B00] text-black font-bold shadow-md"
                    : isLight
                      ? "bg-white/80 text-gray-800 hover:bg-white border border-gray-300 shadow-sm"
                      : "bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white border border-white/10"
                  }`}
              >
                {card.category}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ========================================================= */}
        {/* MAIN FOCUS: 6-Card Carousel with Framer Motion 3D Physics */}
        {/* ========================================================= */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative w-full h-[470px] sm:h-[490px] md:h-[510px] flex items-center justify-center overflow-visible my-auto [perspective:1400px]"
        >
          {CARDS_DATA.map((card, index) => {
            const motionStyle = getCardStyle(index);
            const isCenter = index === activeIndex;
            const IconComponent = card.icon;

            return (
              <motion.div
                key={card.id}
                initial={getEntranceInitial(index)}
                whileInView={{
                  x: motionStyle.x,
                  y: motionStyle.y,
                  rotate: motionStyle.rotate,
                  scale: motionStyle.scale,
                  opacity: motionStyle.opacity,
                  zIndex: motionStyle.zIndex,
                  rotateY: motionStyle.rotateY,
                  filter: motionStyle.filter,
                }}
                viewport={{ once: true, amount: 0.15 }}
                onAnimationComplete={() => {
                  if (isCenter && !hasEntered) {
                    setHasEntered(true);
                  }
                }}
                animate={
                  hasEntered
                    ? {
                      x: motionStyle.x,
                      y: motionStyle.y,
                      rotate: motionStyle.rotate,
                      scale: motionStyle.scale,
                      opacity: motionStyle.opacity,
                      zIndex: motionStyle.zIndex,
                      rotateY: motionStyle.rotateY,
                      filter: motionStyle.filter,
                    }
                    : undefined
                }
                transition={
                  !hasEntered
                    ? {
                      type: "spring",
                      stiffness: 90,
                      damping: 14,
                      mass: 0.9,
                      delay: getEntranceDelay(index),
                    }
                    : {
                      duration: 0.45,
                      ease: [0.22, 1, 0.36, 1],
                    }
                }
                drag={isCenter ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(e, { offset, velocity }) => {
                  if (offset.x < -60 || velocity.x < -300) {
                    handleNext();
                  } else if (offset.x > 60 || velocity.x > 300) {
                    handlePrev();
                  }
                }}
                style={{
                  position: "absolute",
                  transformStyle: "preserve-3d",
                  pointerEvents: motionStyle.pointerEvents,
                }}
                className="select-none"
              >
                <div
                  onClick={() => !isCenter && setActiveIndex(index)}
                  className={`w-[92vw] sm:w-[500px] md:w-[560px] lg:w-[640px] bg-white rounded-[28px] p-5 sm:p-6 md:p-7 border border-white/90 flex flex-col justify-between transition-all duration-300 ${isCenter
                      ? "shadow-[0_30px_70px_-15px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.9)] cursor-default"
                      : "shadow-[0_20px_40px_-15px_rgba(0,0,0,0.4)] cursor-pointer hover:opacity-85 hover:scale-[0.91]"
                    }`}
                >
                  <div>
                    {/* Card Header: Category & Badge */}
                    <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-xl ${card.accent.bg} border ${card.accent.border} flex items-center justify-center ${card.accent.text}`}
                        >
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div>
                          <span
                            className={`text-[10px] font-bold tracking-widest uppercase block ${card.accent.text}`}
                          >
                            {card.category}
                          </span>
                          <h4 className="text-sm font-semibold text-gray-900 leading-tight">
                            {card.name}
                          </h4>
                        </div>
                      </div>
                      <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {card.badgeText}
                      </span>
                    </div>

                    {/* Title & Context Description */}
                    <div className="mt-3.5 mb-3">
                      <h3 className="text-base sm:text-lg font-bold text-gray-950 tracking-tight leading-snug mb-1.5">
                        {card.title}
                      </h3>
                      <p className="text-gray-600 text-xs sm:text-[13px] leading-relaxed line-clamp-2 sm:line-clamp-3">
                        {card.description}
                      </p>
                    </div>

                    {/* High-Fidelity Mini-UI Widget Mockup */}
                    <div className="my-2.5">
                      {renderMockup(card.mockupType)}
                    </div>
                  </div>

                  {/* Key Highlights Checklist (Exact Highlights from User) */}
                  <div className="pt-3 border-t border-gray-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
                      Key Highlights
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {card.highlights.map((highlight, hIdx) => (
                        <div
                          key={hIdx}
                          className="flex items-start gap-1.5 bg-gray-50/80 p-2 rounded-xl border border-gray-100"
                        >
                          <Check
                            className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${card.accent.text}`}
                          />
                          <span className="text-[11px] font-medium text-gray-800 leading-snug line-clamp-2">
                            {highlight}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ========================================================= */}
        {/* BOTTOM NAVIGATION: Circular Arrow Buttons & 6 Indicators  */}
        {/* ========================================================= */}
        <div className="mt-3 sm:mt-5 pb-2 flex items-center justify-between">
          {/* Circular Previous Button */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous Agent Card"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center text-gray-800 transition-all duration-200 border border-white/60"
          >
            <ChevronLeft className="w-5 h-5 text-gray-800" />
          </button>

          {/* Dots Indicator for all 6 cards */}
          <div className="flex items-center gap-2">
            {CARDS_DATA.map((card, idx) => (
              <button
                key={card.id}
                type="button"
                onClick={() => {
                  setHasEntered(true);
                  setActiveIndex(idx);
                }}
                aria-label={`Go to ${card.title}`}
                className={`transition-all duration-300 rounded-full ${activeIndex === idx
                    ? "w-7 sm:w-8 h-2 sm:h-2.5 bg-[#FF6B00] shadow-[0_0_10px_#FF6B00]"
                    : isLight
                      ? "w-2 sm:w-2.5 h-2 sm:h-2.5 bg-black/20 hover:bg-black/40"
                      : "w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white/25 hover:bg-white/50"
                  }`}
              />
            ))}
          </div>

          {/* Circular Next Button */}
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next Agent Card"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center text-gray-800 transition-all duration-200 border border-white/60"
          >
            <ChevronRight className="w-5 h-5 text-gray-800" />
          </button>
        </div>
      </div>

      {/* Floating Dark Circular Chat Button at Bottom-Right */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          aria-label="Open AI Agent Chat"
          className="w-13 h-13 p-3.5 rounded-full bg-gray-950 text-white shadow-[0_8px_25px_rgba(0,0,0,0.35)] hover:bg-black hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center group"
        >
          <MessageSquare className="w-6 h-6 text-white group-hover:scale-105 transition-transform" />
          <span className="absolute top-0 right-0 w-3 h-3 bg-[#FF6B00] border-2 border-white rounded-full" />
        </button>
      </div>
    </section>
  );
}
