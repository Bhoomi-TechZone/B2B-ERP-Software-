import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  Building2,
  Globe2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Tag,
  Check,
  ShieldCheck,
  Briefcase,
  Search,
  ChevronDown,
} from "lucide-react";
import {
  checkPasswordRules,
  getPasswordMissingRequirements,
} from "./PasswordStrengthMeter";
import { ALL_COUNTRIES } from "./countriesData";

// Supported countries with calling codes & required digit counts
const COUNTRY_CALLING_CODES = ALL_COUNTRIES;

const COMPANY_SIZES = [
  "1–10",
  "11–50",
  "51–200",
  "201–500",
  "501–1000",
  "1000+",
];

const INDUSTRY_TYPES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Manufacturing",
  "Retail",
  "Education",
  "Other",
];

const OPERATING_REGIONS = [
  { id: "IN", name: "India (IN)", flag: "🇮🇳" },
  { id: "US", name: "United States (US)", flag: "🇺🇸" },
  { id: "UK", name: "United Kingdom (UK)", flag: "🇬🇧" },
  { id: "EU", name: "Europe (EU)", flag: "🇪🇺" },
];

const SUBSCRIPTION_PLANS = [
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: 2500,
    yearlyPrice: Math.round(2500 * 0.93),
    desc: "Up to 2 employees · Basic CRM & HRMS",
  },
  {
    id: "professional",
    name: "Professional",
    monthlyPrice: 5000,
    yearlyPrice: Math.round(5000 * 0.93),
    desc: "Up to 3 employees · CRM, HRMS, Projects & Analytics",
    featured: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthlyPrice: 7000,
    yearlyPrice: Math.round(7000 * 0.93),
    desc: "Up to 5 employees · Full Suite & Priority Support",
  },
];

export default function RegisterWizard({
  isLight,
  onSwitchToSignIn,
  onRegisterComplete,
  defaultPlan = "professional",
  scrollRef,
}) {
  const [currentStep, setCurrentStep] = useState(1); // 1: Personal Credentials | 2: Company Setup | 3: Complete Success

  // STEP 1 Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(
    COUNTRY_CALLING_CODES[0],
  );
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [marketingAgreed, setMarketingAgreed] = useState(true);

  // STEP 2 Form State
  const [companyName, setCompanyName] = useState("");
  const [companySize, setCompanySize] = useState("11–50");
  const [industry, setIndustry] = useState("Technology");
  const [region, setRegion] = useState("IN");
  const [planId, setPlanId] = useState(defaultPlan);
  const [billingCycle, setBillingCycle] = useState("monthly"); // 'monthly' | 'yearly'
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  // Errors state
  const [step1Errors, setStep1Errors] = useState({});
  const [step2Errors, setStep2Errors] = useState({});

  // Country calling code searchable dropdown state
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState("");
  const countryDropdownRef = useRef(null);
  const countrySearchInputRef = useRef(null);

  // Close country dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(e.target)
      ) {
        setIsCountryDropdownOpen(false);
      }
    };
    if (isCountryDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isCountryDropdownOpen]);

  // Focus search input on dropdown open
  useEffect(() => {
    if (isCountryDropdownOpen && countrySearchInputRef.current) {
      countrySearchInputRef.current.focus();
    }
  }, [isCountryDropdownOpen]);

  // Filter countries by query (matches country name, calling code, or ISO code)
  const filteredCountries = useMemo(() => {
    const q = countrySearchQuery.trim().toLowerCase();
    if (!q) return ALL_COUNTRIES;
    const cleanQ = q.startsWith("+") ? q.slice(1) : q;
    return ALL_COUNTRIES.filter(
      (c) =>
        c.country.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.code.replace("+", "").includes(cleanQ) ||
        (c.iso && c.iso.toLowerCase().includes(q)),
    );
  }, [countrySearchQuery]);

  // Work Email Validator (disallows '+' email aliases)
  const validateWorkEmail = (email) => {
    if (!email) return "Work email is required.";
    if (email.includes("+")) {
      return 'Email aliases containing "+" are not permitted for corporate accounts.';
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid corporate email (e.g. Enter Mail).";
    }
    return null;
  };

  // Phone validator based on selected country
  const validatePhone = (digits, country) => {
    const cleanDigits = digits.replace(/\D/g, "");
    if (!cleanDigits) return "Phone number is required.";
    if (cleanDigits.length !== country.digits) {
      return `${country.country} numbers must be exactly ${country.digits} digits (currently ${cleanDigits.length}).`;
    }
    return null;
  };

  // Handle Step 1 Validation & Proceed
  const handleStep1Submit = (e) => {
    e.preventDefault();
    const errors = {};

    if (!firstName.trim() || firstName.trim().length < 2) {
      errors.firstName = "First name must be at least 2 characters.";
    }
    if (!lastName.trim() || lastName.trim().length < 2) {
      errors.lastName = "Last name must be at least 2 characters.";
    }

    const emailErr = validateWorkEmail(workEmail.trim());
    if (emailErr) errors.workEmail = emailErr;

    const phoneErr = validatePhone(phoneNumber, selectedCountry);
    if (phoneErr) errors.phoneNumber = phoneErr;

    const passwordError = getPasswordMissingRequirements(password);
    if (passwordError) {
      errors.password = passwordError;
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match character-by-character.";
    }

    if (!termsAgreed) {
      errors.termsAgreed =
        "You must agree to the Terms of Service & Privacy Policy.";
    }

    setStep1Errors(errors);
    if (Object.keys(errors).length === 0) {
      setCurrentStep(2);
    }
  };

  // Handle Step 2 Validation & Finish
  const handleStep2Submit = (e) => {
    e.preventDefault();
    const errors = {};

    if (!companyName.trim() || companyName.trim().length < 2) {
      errors.companyName =
        "Company / organization name is required (min 2 characters).";
    }

    setStep2Errors(errors);
    if (Object.keys(errors).length === 0) {
      setCurrentStep(3);
      if (onRegisterComplete) {
        onRegisterComplete({
          firstName,
          lastName,
          workEmail,
          phone: `${selectedCountry.code} ${phoneNumber}`,
          companyName,
          companySize,
          industry,
          region,
          planId,
          billingCycle,
        });
      }
    }
  };

  // Glass card styles
  const glassCardClasses = isLight
    ? "bg-white/90 backdrop-blur-2xl border border-gray-200/90 shadow-[0_24px_50px_rgba(0,0,0,0.06)] text-gray-900"
    : "bg-[#120504]/85 backdrop-blur-2xl border border-[#FF7900]/35 shadow-[0_0_60px_rgba(255,121,0,0.16),0_25px_50px_rgba(0,0,0,0.85)] text-white";

  const inputClasses = (hasError) => `
    w-full py-2.5 px-3.5 rounded-[10px] text-sm transition-all duration-200 outline-none
    ${isLight
      ? `bg-gray-50/80 border ${hasError ? "border-rose-500" : "border-gray-200 hover:border-gray-300 focus:border-[#FF6B00]"} text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-[#FF6B00]/15`
      : `bg-white/[0.04] border ${hasError ? "border-rose-500" : "border-white/10 hover:border-white/20 focus:border-[#FF7900]"} text-white placeholder:text-gray-500 focus:bg-white/[0.08] focus:ring-2 focus:ring-[#FF7900]/25`
    }
  `;

  return (
    <div
      className={`w-full max-w-[620px] sm:max-w-[660px] lg:min-h-[calc(100vh-155px)] flex flex-col justify-center rounded-3xl p-6 sm:p-8 md:px-9 md:py-7 transition-all ${glassCardClasses}`}
    >
      <div className="w-full">
        {/* ========================================================= */}
        {/* 2-STEP STEPPER HEADER                                     */}
        {/* ========================================================= */}
        {currentStep < 3 && (
          <div className="mb-4 select-none">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider mb-2">
              <span
                className={
                  currentStep === 1
                    ? "text-[#FF7900] font-bold"
                    : isLight
                      ? "text-gray-500"
                      : "text-gray-400"
                }
              >
                1. PERSONAL CREDENTIALS
              </span>
              <div className="flex-1 mx-3 border-b border-dashed border-white/20" />
              <span
                className={
                  currentStep === 2
                    ? "text-[#FF7900] font-bold"
                    : isLight
                      ? "text-gray-500"
                      : "text-gray-400"
                }
              >
                2. WORKSPACE SETUP
              </span>
            </div>

            {/* Stepper Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                animate={{ width: currentStep === 1 ? "50%" : "100%" }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="h-full bg-gradient-to-r from-orange-500 to-[#FF7900] shadow-[0_0_10px_#FF7900]"
              />
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 1: PERSONAL & ACCOUNT CREDENTIALS                    */}
        {/* ========================================================= */}
        {currentStep === 1 && (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 15 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            <div className="text-center">
              <h2
                className={`text-lg sm:text-xl font-bold tracking-tight ${isLight ? "text-gray-950" : "text-white"}`}
              >
                Create your Senti account
              </h2>
            </div>

            <form onSubmit={handleStep1Submit} className="space-y-4" noValidate>
              {/* Full-height Fields + Submit Container (Scrolls only if viewport is unusually short) */}
              <div
                ref={scrollRef}
                className="lg:max-h-[calc(100vh-250px)] overflow-y-auto pr-1 space-y-4 no-scrollbar sm:custom-scrollbar"
              >
                {/* First Name & Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label
                      className={`text-xs font-semibold block ${isLight ? "text-gray-700" : "text-gray-300"}`}
                    >
                      First Name *
                    </label>
                    <div className="relative">
                      <User
                        className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isLight ? "text-gray-400" : "text-gray-500"}`}
                      />
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => {
                          setFirstName(e.target.value);
                          if (step1Errors.firstName)
                            setStep1Errors({ ...step1Errors, firstName: null });
                        }}
                        placeholder="Name"
                        className={`${inputClasses(Boolean(step1Errors.firstName))} pl-10`}
                      />
                    </div>
                    {step1Errors.firstName && (
                      <p className="text-[11px] text-rose-500 font-medium">
                        {step1Errors.firstName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label
                      className={`text-xs font-semibold block ${isLight ? "text-gray-700" : "text-gray-300"}`}
                    >
                      Last Name *
                    </label>
                    <div className="relative">
                      <User
                        className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isLight ? "text-gray-400" : "text-gray-500"}`}
                      />
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => {
                          setLastName(e.target.value);
                          if (step1Errors.lastName)
                            setStep1Errors({ ...step1Errors, lastName: null });
                        }}
                        placeholder="Lastname"
                        className={`${inputClasses(Boolean(step1Errors.lastName))} pl-10`}
                      />
                    </div>
                    {step1Errors.lastName && (
                      <p className="text-[11px] text-rose-500 font-medium">
                        {step1Errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Work Email (Disallow aliases with +) */}
                <div className="space-y-1">
                  <label
                    className={`text-xs font-semibold block ${isLight ? "text-gray-700" : "text-gray-300"}`}
                  >
                    Corporate Work Email *
                  </label>
                  <div className="relative">
                    <Mail
                      className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isLight ? "text-gray-400" : "text-gray-500"}`}
                    />
                    <input
                      type="email"
                      value={workEmail}
                      onChange={(e) => {
                        setWorkEmail(e.target.value);
                        if (step1Errors.workEmail)
                          setStep1Errors({ ...step1Errors, workEmail: null });
                      }}
                      placeholder="Enter Mail"
                      className={`${inputClasses(Boolean(step1Errors.workEmail))} pl-10`}
                    />
                  </div>
                  {step1Errors.workEmail && (
                    <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{step1Errors.workEmail}</span>
                    </p>
                  )}
                </div>

                {/* Country Calling Code & Phone Number */}
                <div className="space-y-1">
                  <label
                    className={`text-xs font-semibold block ${isLight ? "text-gray-700" : "text-gray-300"}`}
                  >
                    Business Phone Number *
                  </label>
                  <div className="flex items-center gap-2">
                    {/* Searchable Country Code Combobox */}
                    <div ref={countryDropdownRef} className="relative shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setIsCountryDropdownOpen((prev) => !prev);
                          setCountrySearchQuery("");
                        }}
                        className={`h-[42px] py-2 px-3 rounded-[10px] text-xs sm:text-sm font-medium outline-none transition-all flex items-center gap-2 cursor-pointer border ${isCountryDropdownOpen
                          ? "border-[#FF6B00] ring-2 ring-[#FF6B00]/20"
                          : isLight
                            ? "bg-gray-100/80 border-gray-200 hover:border-gray-300 text-gray-900"
                            : "bg-white/[0.04] border-white/10 hover:border-white/20 text-white"
                          }`}
                      >
                        <span className="text-base leading-none">{selectedCountry.flag}</span>
                        <span className="font-semibold tracking-tight">{selectedCountry.code}</span>
                        <span className="hidden sm:inline text-xs opacity-75 max-w-[85px] truncate">
                          ({selectedCountry.country})
                        </span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 text-gray-400 ${isCountryDropdownOpen ? "rotate-180 text-[#FF6B00]" : ""
                            }`}
                        />
                      </button>

                      {/* Dropdown Popover */}
                      <AnimatePresence>
                        {isCountryDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 6, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 4, scale: 0.98 }}
                            transition={{ duration: 0.15 }}
                            className={`absolute left-0 top-full mt-1.5 w-72 sm:w-80 rounded-2xl p-2.5 z-50 shadow-2xl backdrop-blur-2xl border ${isLight
                              ? "bg-white/95 border-gray-200 text-gray-900 shadow-[0_16px_36px_rgba(0,0,0,0.14)]"
                              : "bg-[#180A0A]/95 border-white/15 text-white shadow-[0_20px_45px_rgba(0,0,0,0.7)]"
                              }`}
                          >
                            {/* Search Bar Input */}
                            <div className="relative mb-2">
                              <Search
                                className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? "text-gray-400" : "text-gray-500"
                                  }`}
                              />
                              <input
                                ref={countrySearchInputRef}
                                type="text"
                                value={countrySearchQuery}
                                onChange={(e) => setCountrySearchQuery(e.target.value)}
                                placeholder="Search country or code (e.g. +91, UK)..."
                                className={`w-full py-1.5 pl-8 pr-3 rounded-lg text-xs outline-none transition-all ${isLight
                                  ? "bg-gray-100 border border-gray-200 focus:border-[#FF6B00] text-gray-900 placeholder:text-gray-400"
                                  : "bg-white/[0.06] border border-white/10 focus:border-[#FF6B00] text-white placeholder:text-gray-500"
                                  }`}
                              />
                            </div>

                            {/* Filtered Country List */}
                            <div
                              data-scroll-lock="true"
                              className="max-h-56 overflow-y-auto space-y-0.5 pr-1 no-scrollbar sm:custom-scrollbar"
                            >
                              {filteredCountries.length > 0 ? (
                                filteredCountries.map((c) => {
                                  const isSelected =
                                    selectedCountry.code === c.code &&
                                    selectedCountry.country === c.country;
                                  return (
                                    <button
                                      key={`${c.iso || c.country}-${c.code}`}
                                      type="button"
                                      onClick={() => {
                                        setSelectedCountry(c);
                                        setIsCountryDropdownOpen(false);
                                        setCountrySearchQuery("");
                                      }}
                                      className={`w-full py-1.5 px-2.5 rounded-lg text-xs flex items-center justify-between text-left transition-colors cursor-pointer ${isSelected
                                        ? "bg-[#FF6B00]/15 text-[#FF6B00] font-semibold"
                                        : isLight
                                          ? "hover:bg-gray-100 text-gray-800"
                                          : "hover:bg-white/[0.08] text-gray-200"
                                        }`}
                                    >
                                      <div className="flex items-center gap-2 truncate">
                                        <span className="text-base leading-none">{c.flag}</span>
                                        <span className="truncate">{c.country}</span>
                                      </div>
                                      <span
                                        className={`text-[11px] font-mono shrink-0 ml-2 ${isSelected
                                          ? "text-[#FF6B00] font-bold"
                                          : "text-gray-400"
                                          }`}
                                      >
                                        {c.code}
                                      </span>
                                    </button>
                                  );
                                })
                              ) : (
                                <div className="py-4 text-center text-xs text-gray-400">
                                  No countries found matching "{countrySearchQuery}"
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Phone Input */}
                    <div className="relative flex-1">
                      <Phone
                        className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isLight ? "text-gray-400" : "text-gray-500"}`}
                      />
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => {
                          const val = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, selectedCountry.digits);
                          setPhoneNumber(val);
                          if (step1Errors.phoneNumber)
                            setStep1Errors({ ...step1Errors, phoneNumber: null });
                        }}
                        placeholder={selectedCountry.placeholder}
                        className={`${inputClasses(Boolean(step1Errors.phoneNumber))} pl-10`}
                      />
                    </div>
                  </div>
                  {step1Errors.phoneNumber && (
                    <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{step1Errors.phoneNumber}</span>
                    </p>
                  )}
                </div>

                {/* Account Password & Confirm Password (Same Row) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                  {/* Password */}
                  <div className="space-y-1">
                    <label
                      className={`text-xs font-semibold block ${isLight ? "text-gray-700" : "text-gray-300"}`}
                    >
                      Account Password *
                    </label>
                    <div className="relative">
                      <Lock
                        className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isLight ? "text-gray-400" : "text-gray-500"}`}
                      />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPassword(val);
                          if (step1Errors.password) {
                            const err = getPasswordMissingRequirements(val);
                            setStep1Errors((prev) => ({ ...prev, password: err }));
                          }
                        }}
                        onBlur={() => {
                          if (password) {
                            const err = getPasswordMissingRequirements(password);
                            if (err) {
                              setStep1Errors((prev) => ({ ...prev, password: err }));
                            }
                          }
                        }}
                        placeholder="Create secure password"
                        className={`${inputClasses(Boolean(step1Errors.password))} pl-10 pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`w-8 h-8 absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center justify-center ${isLight
                          ? "text-gray-400 hover:text-gray-700"
                          : "text-gray-500 hover:text-gray-200"
                          }`}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {step1Errors.password && (
                      <p className="text-[11px] text-rose-500 font-medium flex items-start gap-1 pt-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{step1Errors.password}</span>
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1">
                    <label
                      className={`text-xs font-semibold block ${isLight ? "text-gray-700" : "text-gray-300"}`}
                    >
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock
                        className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isLight ? "text-gray-400" : "text-gray-500"}`}
                      />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (step1Errors.confirmPassword)
                            setStep1Errors({ ...step1Errors, confirmPassword: null });
                        }}
                        placeholder="Re-enter password"
                        className={`${inputClasses(Boolean(step1Errors.confirmPassword))} pl-10 pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className={`w-8 h-8 absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center justify-center ${isLight
                          ? "text-gray-400 hover:text-gray-700"
                          : "text-gray-500 hover:text-gray-200"
                          }`}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-[11px] text-rose-500 font-medium">
                        Passwords do not match.
                      </p>
                    )}
                    {step1Errors.confirmPassword && (
                      <p className="text-[11px] text-rose-500 font-medium">
                        {step1Errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                {/* Agreements */}
                <div className="space-y-2 pt-1 border-t border-white/10">
                  <label className="flex items-start gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={termsAgreed}
                      onChange={(e) => setTermsAgreed(e.target.checked)}
                      className="w-4 h-4 rounded mt-0.5 text-[#FF6B00] accent-[#FF6B00] cursor-pointer"
                    />
                    <span
                      className={`text-xs leading-relaxed ${isLight ? "text-gray-700" : "text-gray-300"}`}
                    >
                      I agree to the{" "}
                      <span className="text-[#FF6B00] underline">
                        Terms of Service
                      </span>{" "}
                      and{" "}
                      <span className="text-[#FF6B00] underline">
                        Privacy Policy
                      </span>{" "}
                      (Mandatory) *
                    </span>
                  </label>
                  {step1Errors.termsAgreed && (
                    <p className="text-[11px] text-rose-500 font-medium">
                      {step1Errors.termsAgreed}
                    </p>
                  )}
                </div>

                {/* Step 1 Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl font-semibold text-sm tracking-wide bg-[#FF6B00] hover:bg-[#FF7B18] text-[#0A0505] shadow-[0_4px_20px_rgba(255,107,0,0.35)] transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <span>Continue to Workspace Setup</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Switch to Sign In */}
                <div className="text-center pt-2 border-t border-white/10 text-xs">
                  <span className={isLight ? "text-gray-600" : "text-gray-400"}>
                    Already have an enterprise account?{" "}
                  </span>
                  <button
                    type="button"
                    onClick={onSwitchToSignIn}
                    className="text-[#FF6B00] font-semibold hover:underline"
                  >
                    Sign in
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}

        {/* ========================================================= */}
        {/* STEP 2: COMPANY & WORKSPACE CONFIGURATION                 */}
        {/* ========================================================= */}
        {currentStep === 2 && (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            <div className="text-center relative">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="sm:absolute sm:left-0 sm:top-1 inline-flex items-center gap-1.5 text-xs text-[#FF6B00] hover:underline mb-1 sm:mb-0 font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <h2
                className={`text-lg sm:text-xl font-bold tracking-tight ${isLight ? "text-gray-950" : "text-white"}`}
              >
                Configure your workspace
              </h2>
            </div>

            <form onSubmit={handleStep2Submit} className="space-y-4" noValidate>
              {/* Full-height Step 2 Container */}
              <div
                ref={scrollRef}
                className="lg:max-h-[calc(100vh-250px)] overflow-y-auto pr-1 space-y-4 no-scrollbar sm:custom-scrollbar"
              >
                {/* Company / Organization Name */}
                <div className="space-y-1">
                  <label
                    className={`text-xs font-semibold block ${isLight ? "text-gray-700" : "text-gray-300"}`}
                  >
                    Company / Organization Name *
                  </label>
                  <div className="relative">
                    <Building2
                      className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isLight ? "text-gray-400" : "text-gray-500"}`}
                    />
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => {
                        setCompanyName(e.target.value);
                        if (step2Errors.companyName)
                          setStep2Errors({ ...step2Errors, companyName: null });
                      }}
                      placeholder="Acme Global Technologies Inc."
                      className={`${inputClasses(Boolean(step2Errors.companyName))} pl-10`}
                    />
                  </div>
                  {step2Errors.companyName && (
                    <p className="text-[11px] text-rose-500 font-medium">
                      {step2Errors.companyName}
                    </p>
                  )}
                </div>

                {/* Company Size Chips */}
                <div className="space-y-1.5">
                  <label
                    className={`text-xs font-semibold block ${isLight ? "text-gray-700" : "text-gray-300"}`}
                  >
                    Total Employee Count *
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                    {COMPANY_SIZES.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setCompanySize(size)}
                        className={`py-2 px-1 rounded-xl text-xs font-medium border text-center transition-all ${companySize === size
                          ? "bg-[#FF6B00] text-[#0A0505] border-[#FF6B00] font-bold shadow-sm"
                          : isLight
                            ? "border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-800"
                            : "border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white/80"
                          }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Industry Type & Operating Region */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label
                      className={`text-xs font-semibold block ${isLight ? "text-gray-700" : "text-gray-300"}`}
                    >
                      Industry Sector
                    </label>
                    <div className="relative">
                      <Briefcase
                        className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isLight ? "text-gray-400" : "text-gray-500"}`}
                      />
                      <select
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className={`${inputClasses(false)} pl-10 cursor-pointer`}
                      >
                        {INDUSTRY_TYPES.map((ind) => (
                          <option
                            key={ind}
                            value={ind}
                            className="bg-gray-900 text-white"
                          >
                            {ind}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label
                      className={`text-xs font-semibold block ${isLight ? "text-gray-700" : "text-gray-300"}`}
                    >
                      Primary Operating Region
                    </label>
                    <div className="relative">
                      <Globe2
                        className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isLight ? "text-gray-400" : "text-gray-500"}`}
                      />
                      <select
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className={`${inputClasses(false)} pl-10 cursor-pointer`}
                      >
                        {OPERATING_REGIONS.map((r) => (
                          <option
                            key={r.id}
                            value={r.id}
                            className="bg-gray-900 text-white"
                          >
                            {r.flag} {r.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Plan Selector & Billing Cadence */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <label
                      className={`text-xs font-semibold block ${isLight ? "text-gray-700" : "text-gray-300"}`}
                    >
                      Selected Subscription Plan
                    </label>

                    {/* Billing Cycle Switch */}
                    <div
                      className={`p-0.5 rounded-full border flex items-center text-[10px] ${isLight
                        ? "bg-gray-100 border-gray-300"
                        : "bg-white/[0.04] border-white/10"
                        }`}
                    >
                      <button
                        type="button"
                        onClick={() => setBillingCycle("monthly")}
                        className={`px-2 py-0.5 rounded-full transition-all ${billingCycle === "monthly"
                          ? "bg-white text-gray-950 font-bold shadow-xs"
                          : "text-gray-400"
                          }`}
                      >
                        Monthly
                      </button>
                      <button
                        type="button"
                        onClick={() => setBillingCycle("yearly")}
                        className={`px-2 py-0.5 rounded-full flex items-center gap-1 transition-all ${billingCycle === "yearly"
                          ? "bg-[#FF6B00] text-black font-bold shadow-xs"
                          : "text-gray-400"
                          }`}
                      >
                        <span>Annual</span>
                        <span className="text-[9px] bg-black/20 text-white px-1 rounded-sm font-semibold">
                          -7%
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Plans cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {SUBSCRIPTION_PLANS.map((plan) => {
                      const isSelected = planId === plan.id;
                      const price =
                        billingCycle === "yearly"
                          ? plan.yearlyPrice
                          : plan.monthlyPrice;

                      return (
                        <div
                          key={plan.id}
                          onClick={() => setPlanId(plan.id)}
                          className={`p-3 rounded-2xl border cursor-pointer transition-all duration-200 select-none ${isSelected
                            ? "border-[#FF6B00] bg-[#FF6B00]/10 shadow-[0_0_16px_rgba(255,107,0,0.2)]"
                            : isLight
                              ? "border-gray-200 bg-gray-50/70 hover:bg-gray-100/70 text-gray-800"
                              : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-white/80"
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold">{plan.name}</span>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-[#FF6B00]" />
                            )}
                          </div>
                          <div className="text-base font-extrabold text-[#FF6B00] mt-1">
                            ₹{price.toLocaleString("en-IN")}{" "}
                            <span className="text-[10px] font-normal text-gray-400">
                              /mo
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1 line-clamp-2 leading-tight">
                            {plan.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Promo Code Input */}
                <div className="space-y-1 pt-1">
                  <label
                    className={`text-xs font-semibold block ${isLight ? "text-gray-700" : "text-gray-300"}`}
                  >
                    Promo / Referral Code (Optional)
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Tag
                        className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isLight ? "text-gray-400" : "text-gray-500"}`}
                      />
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder="ENTERPRISE2026"
                        className={`${inputClasses(false)} pl-10 uppercase`}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (promoCode.trim()) setPromoApplied(true);
                      }}
                      className="px-4 py-2.5 rounded-xl border border-white/20 text-xs font-semibold hover:border-[#FF6B00] hover:text-[#FF6B00] transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {promoApplied && (
                    <p className="text-[11px] text-emerald-500 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>
                        Promo code applied! 10% discount activated for 1 year.
                      </span>
                    </p>
                  )}
                </div>

                {/* Step 2 Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm tracking-wide bg-[#FF6B00] hover:bg-[#FF7B18] text-[#0A0505] shadow-[0_4px_25px_rgba(255,107,0,0.4)] transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] mt-2"
                >
                  <span>Complete Setup & Launch Senti Workspace</span>
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* ========================================================= */}
        {/* STEP 3: REGISTRATION SUCCESS CONFIRMATION                 */}
        {/* ========================================================= */}
        {currentStep === 3 && (
          <motion.div
            key="step-success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center py-6 space-y-5"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2
                className={`text-2xl font-bold ${isLight ? "text-gray-950" : "text-white"}`}
              >
                Workspace Initialized!
              </h2>
              <p
                className={`text-xs sm:text-sm max-w-[360px] mx-auto leading-relaxed ${isLight ? "text-gray-600" : "text-gray-300"}`}
              >
                Welcome aboard,{" "}
                <span className="font-semibold text-[#FF6B00]">{firstName}</span>.
                Your enterprise organization{" "}
                <span className="font-semibold">{companyName}</span> has been
                provisioned with audit-ready security.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 max-w-[380px] mx-auto text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-400">Organization:</span>
                <span className="font-semibold">{companyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Admin Email:</span>
                <span className="font-semibold">{workEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Subscription Tier:</span>
                <span className="font-semibold capitalize text-[#FF6B00]">
                  {planId} Plan ({billingCycle})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Region:</span>
                <span className="font-semibold">{region} Datacenter</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onSwitchToSignIn}
              className="w-full max-w-[380px] mx-auto py-3 px-6 rounded-xl font-semibold text-sm tracking-wide bg-[#FF6B00] hover:bg-[#FF7B18] text-[#0A0505] shadow-[0_4px_20px_rgba(255,107,0,0.35)] transition-all flex items-center justify-center gap-2"
            >
              <span>Proceed to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
