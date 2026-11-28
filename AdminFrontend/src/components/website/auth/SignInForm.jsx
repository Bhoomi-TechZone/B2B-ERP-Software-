import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import authService from "../../../services/authService";
import apiClient from "../../../services/apiClient";
import { API_BASE_URL } from "../../../config/api";
import { ROLE_IDS, getRoleLanding } from "../../../config/roles";
import { buildRecoveryUrl, buildSignInUrl } from "../../../utils/authSession";

export default function SignInForm({
  isLight,
  onSwitchToRegister,
  onSignInSuccess,
  initialRecoveryOpen = false,
}) {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Main form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // MFA Flow states
  const [step, setStep] = useState(initialRecoveryOpen ? "forgot_password" : "credentials"); // 'credentials' | 'mfa' | 'forgot_password'
  const [mfaDigits, setMfaDigits] = useState(["", "", "", "", "", ""]);
  const [mfaError, setMfaError] = useState("");
  const mfaInputRefs = useRef([]);

  // Forgot Password Flow states
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // 30-second cooldown timer
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const interval = setInterval(() => {
      setCooldownSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  // Decode JWT payload without an external library
  const decodeJwt = (token) => {
    try {
      const payload = token.split(".")[1];
      return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    } catch {
      return null;
    }
  };

  // Map backend API role to internal frontend role
  const mapApiRoleToFrontend = (apiRole) => {
    const roleMap = {
      platform_admin: ROLE_IDS.SUPER_ADMIN,
      super_admin: ROLE_IDS.SUPER_ADMIN,
      tenant_admin: ROLE_IDS.SUPER_ADMIN,
      owner: ROLE_IDS.SUPER_ADMIN,
      admin: ROLE_IDS.SUPER_ADMIN,
      admin_user: ROLE_IDS.SUPER_ADMIN,
      hr_admin: ROLE_IDS.HR_ADMIN,
      hr_manager: ROLE_IDS.HR,
      hr: ROLE_IDS.HR,
      payroll_admin: ROLE_IDS.PAYROLL_ADMIN,
      recruiter: ROLE_IDS.RECRUITER,
      finance_viewer: ROLE_IDS.FINANCE_VIEWER,
      it_admin: ROLE_IDS.IT_ADMIN,
      manager: ROLE_IDS.MANAGER,
      sales: ROLE_IDS.SALES,
      sales_executive: ROLE_IDS.SALES,
      employee: ROLE_IDS.EMPLOYEE,
    };

    const normalized = (apiRole || "").toLowerCase().trim().replace(/\s+/g, "_");
    const mapped = roleMap[normalized];
    if (mapped && mapped !== ROLE_IDS.EMPLOYEE) return mapped;

    const exact = (apiRole || "").trim();
    if (exact && exact.toLowerCase() !== "employee") return exact;

    return ROLE_IDS.EMPLOYEE;
  };

  // Email validation regex (standard corporate format)
  const isValidWorkEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val);
  };

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    setApiError("");

    if (!email.trim()) {
      newErrors.email = "Work email is required.";
    } else if (!isValidWorkEmail(email.trim())) {
      newErrors.email = "Please enter a valid corporate email.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);

    try {
      const result = await authService.login(email.trim(), password);

      // Check if MFA is required
      if (result.mfa_required || result.requires_mfa) {
        setStep("mfa");
        setIsLoading(false);
        return;
      }

      // Persist token immediately
      const token = result.access_token || result.token;
      if (token) {
        localStorage.setItem("access_token", token);
      }

      // Fetch enriched database profile
      let me = null;
      try {
        me = await authService.getProfile();
      } catch (profileErr) {
        console.warn("Could not fetch enriched /users/me profile:", profileErr);
      }

      const userObj = me?.user || result.user;
      const tenantObj = me?.tenant || result.tenant;
      const jwtPayload = decodeJwt(token);

      const jwtRole = jwtPayload?.roles?.[0] || jwtPayload?.role;
      const userRole =
        userObj?.role ||
        userObj?.user_type ||
        userObj?.user_role ||
        userObj?.tenant_role ||
        userObj?.assigned_role;
      const responseRole = result.user_type || result.role;

      const apiRole = userRole || jwtRole || responseRole || "employee";
      const roleId = mapApiRoleToFrontend(apiRole);

      const profile = {
        id: userObj?.id || userObj?.user_id,
        name:
          userObj?.display_name ||
          `${userObj?.first_name || ""} ${userObj?.last_name || ""}`.trim() ||
          email.split("@")[0],
        email: userObj?.email || email.trim(),
        token: token,
        department: userObj?.department || "Company",
        company: tenantObj?.id || result.tenant_id || result.company_id,
        tenant: tenantObj
          ? {
            id: tenantObj.id,
            name: tenantObj.name,
            slug: tenantObj.slug,
            subdomain: tenantObj.subdomain,
            status: tenantObj.status,
            region: tenantObj.primary_region,
            currency: tenantObj.primary_currency,
            logoUrl: tenantObj.logo_url,
            brandColor: tenantObj.brand_color,
            timezone: tenantObj.timezone,
            dateFormat: tenantObj.date_format,
            onboardingCompleted: tenantObj.onboarding_completed,
            onboardingStep: tenantObj.onboarding_step,
            planId: tenantObj.plan_id,
            modules: tenantObj.modules || {},
            planLimits: tenantObj.plan_limits || {},
            planUsage: tenantObj.plan_usage || {},
          }
          : null,
      };

      try {
        const data = await apiClient.get(`${API_BASE_URL}/roles/user/permissions`);
        if (data && data.permissions) {
          profile.userModules = data.permissions;
        }
      } catch (permErr) {
        console.warn("Could not load user custom permissions:", permErr);
      }

      // Update AuthContext session
      login(roleId, profile);

      if (onSignInSuccess) {
        onSignInSuccess({ email, roleId, profile });
      }

      // Navigate to onboarding if tenant admin has not completed onboarding
      if (
        roleId === ROLE_IDS.SUPER_ADMIN &&
        tenantObj &&
        !tenantObj.onboarding_completed
      ) {
        navigate("/onboarding", { replace: true });
      } else {
        const landingRoute = getRoleLanding(roleId);
        navigate(landingRoute, { replace: true });
      }
    } catch (err) {
      setApiError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // MFA Digit Input Handlers
  const handleMfaChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newDigits = [...mfaDigits];
    newDigits[index] = value;
    setMfaDigits(newDigits);
    setMfaError("");

    if (value && index < 5) {
      mfaInputRefs.current[index + 1]?.focus();
    }
  };

  const handleMfaKeyDown = (index, e) => {
    if (e.key === "Backspace" && !mfaDigits[index] && index > 0) {
      mfaInputRefs.current[index - 1]?.focus();
    }
  };

  const handleMfaPaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").trim();
    if (/^[0-9]{6}$/.test(paste)) {
      const splitDigits = paste.split("");
      setMfaDigits(splitDigits);
      mfaInputRefs.current[5]?.focus();
    }
  };

  const handleMfaSubmit = async (e) => {
    e.preventDefault();
    const fullCode = mfaDigits.join("");
    if (fullCode.length !== 6) {
      setMfaError("Please enter all 6 digits.");
      return;
    }

    setIsLoading(true);
    try {
      // Simulate/submit MFA code
      await new Promise((resolve) => setTimeout(resolve, 600));
      if (onSignInSuccess) {
        onSignInSuccess({ email, rememberMe, mfaVerified: true });
      }
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setMfaError(err.message || "Failed to verify security code.");
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot password submit
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = forgotEmail.trim().toLowerCase();
    if (!cleanEmail || !isValidWorkEmail(cleanEmail)) {
      setErrors({
        forgotEmail: "Please enter a valid registered corporate email.",
      });
      return;
    }

    setErrors({});
    setForgotError("");
    setIsLoading(true);
    try {
      await authService.forgotPassword(cleanEmail);
      setForgotSent(true);
      setCooldownSeconds(30);
    } catch (err) {
      setForgotError(
        err.message || "Failed to send reset link. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Glass panel style helpers
  const glassCardClasses = isLight
    ? "bg-white/90 backdrop-blur-2xl border border-gray-200/90 shadow-[0_24px_50px_rgba(0,0,0,0.06)] text-gray-900"
    : "bg-[#120504]/80 backdrop-blur-2xl border border-[#FF7900]/30 shadow-[0_0_60px_rgba(255,121,0,0.16),0_25px_50px_rgba(0,0,0,0.85)] text-white";

  const inputClasses = (hasError) => `
    w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all duration-200 outline-none
    ${isLight
      ? `bg-gray-50/80 border ${hasError ? "border-rose-500" : "border-gray-200 hover:border-gray-300 focus:border-[#FF6B00]"} text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-[#FF6B00]/15`
      : `bg-white/[0.04] border ${hasError ? "border-rose-500" : "border-white/10 hover:border-white/20 focus:border-[#FF7900]"} text-white placeholder:text-gray-500 focus:bg-white/[0.08] focus:ring-2 focus:ring-[#FF7900]/25`
    }
  `;

  return (
    <div
      className={`w-full max-w-[620px] sm:max-w-[660px] min-h-[460px] lg:min-h-[calc(100vh-155px)] flex flex-col justify-start rounded-3xl p-6 sm:p-8 md:px-9 md:pt-10 md:pb-8 transition-all ${glassCardClasses}`}
    >
      <div className="w-full">
        {/* ========================================================= */}
        {/* 1. CREDENTIALS VIEW: Email & Password                     */}
        {/* ========================================================= */}
        {step === "credentials" && (
          <motion.div
            key="step-credentials"
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 15 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="space-y-2 text-center pb-2">
              <h2
                className={`text-2xl sm:text-[26px] font-bold tracking-tight ${isLight ? "text-gray-950" : "text-white"}`}
              >
                Sign in to your account
              </h2>
              <p
                className={`text-sm sm:text-[14.5px] ${isLight ? "text-gray-600" : "text-gray-400"}`}
              >
                Access your Senti enterprise CRM, HRMS, and intelligence hub.
              </p>
            </div>

            {/* API Error Alert */}
            {apiError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            <form
              onSubmit={handleCredentialsSubmit}
              className="space-y-4"
              noValidate
            >
              {/* Work Email Field */}
              <div className="space-y-1.5">
                <label
                  className={`text-xs font-semibold uppercase tracking-wider block ${isLight ? "text-gray-700" : "text-gray-300"}`}
                >
                  Work Email Address
                </label>
                <div className="relative">
                  <Mail
                    className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isLight ? "text-gray-400" : "text-gray-500"}`}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: null });
                      if (apiError) setApiError("");
                    }}
                    placeholder="name@company.com"
                    className={inputClasses(Boolean(errors.email))}
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 pt-0.5">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    className={`text-xs font-semibold uppercase tracking-wider block ${isLight ? "text-gray-700" : "text-gray-300"}`}
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setStep("forgot_password");
                      setForgotError("");
                      const recoveryUrl = buildRecoveryUrl({ ref: 'login' });
                      window.history.replaceState(null, '', recoveryUrl);
                    }}
                    className="text-xs text-[#FF6B00] hover:underline font-medium cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock
                    className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isLight ? "text-gray-400" : "text-gray-500"}`}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password)
                        setErrors({ ...errors, password: null });
                      if (apiError) setApiError("");
                    }}
                    placeholder="••••••••••••"
                    className={`${inputClasses(Boolean(errors.password))} pr-11`}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`w-8 h-8 absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center justify-center transition-colors ${isLight
                        ? "text-gray-400 hover:text-gray-700"
                        : "text-gray-500 hover:text-gray-200"
                      }`}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 pt-0.5">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.password}</span>
                  </p>
                )}
              </div>

              {/* Remember Me & MFA Protection Indicator */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#FF6B00] focus:ring-[#FF6B00] accent-[#FF6B00] cursor-pointer"
                  />
                  <span
                    className={`text-xs ${isLight ? "text-gray-700" : "text-gray-300"}`}
                  >
                    Remember this device
                  </span>
                </label>

                <div className="flex items-center gap-1 text-[11px] text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Enterprise Security</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl font-semibold text-sm tracking-wide bg-[#FF6B00] hover:bg-[#FF7B18] text-[#0A0505] shadow-[0_4px_20px_rgba(255,107,0,0.35)] transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Switch to Registration */}
            <div className="text-center pt-2 border-t border-white/10 text-xs">
              <span className={isLight ? "text-gray-600" : "text-gray-400"}>
                Don't have an enterprise workspace?{" "}
              </span>
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-[#FF6B00] font-semibold hover:underline"
              >
                Register here
              </button>
            </div>
          </motion.div>
        )}

        {/* ========================================================= */}
        {/* 2. MFA VERIFICATION VIEW: 6-Digit Code                    */}
        {/* ========================================================= */}
        {step === "mfa" && (
          <motion.div
            key="step-mfa"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="space-y-1.5 text-center sm:text-left">
              <button
                type="button"
                onClick={() => setStep("credentials")}
                className="inline-flex items-center gap-1.5 text-xs text-[#FF6B00] hover:underline mb-2 font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to credentials</span>
              </button>
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#FF6B00]" />
                <h2
                  className={`text-2xl font-bold tracking-tight ${isLight ? "text-gray-950" : "text-white"}`}
                >
                  Two-Factor Authentication
                </h2>
              </div>
              <p
                className={`text-xs sm:text-[13px] ${isLight ? "text-gray-600" : "text-gray-400"}`}
              >
                Enter the 6-digit numeric verification code sent to your
                registered authenticator or email:
              </p>
              <p className="text-xs font-semibold text-[#FF6B00] pt-0.5">
                {email}
              </p>
            </div>

            <form onSubmit={handleMfaSubmit} className="space-y-5">
              {/* 6 Digit Inputs */}
              <div
                className="flex items-center justify-between gap-1.5 sm:gap-2"
                onPaste={handleMfaPaste}
              >
                {mfaDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (mfaInputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleMfaChange(idx, e.target.value)}
                    onKeyDown={(e) => handleMfaKeyDown(idx, e)}
                    className={`w-11 sm:w-12 h-13 sm:h-14 text-center text-lg font-bold rounded-xl outline-none transition-all ${isLight
                        ? "bg-gray-100 border border-gray-300 text-gray-950 focus:bg-white focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20"
                        : "bg-white/[0.05] border border-white/15 text-white focus:bg-white/[0.1] focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/30"
                      }`}
                    autoFocus={idx === 0}
                  />
                ))}
              </div>

              {mfaError && (
                <p className="text-[11px] text-rose-500 font-medium flex items-center justify-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{mfaError}</span>
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading || mfaDigits.join("").length < 6}
                className="w-full py-3 px-4 rounded-xl font-semibold text-sm tracking-wide bg-[#FF6B00] hover:bg-[#FF7B18] text-[#0A0505] shadow-[0_4px_20px_rgba(255,107,0,0.35)] transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <span>Verify & Access Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}

        {/* ========================================================= */}
        {/* 3. FORGOT PASSWORD VIEW: Email with 30s Cooldown          */}
        {/* ========================================================= */}
        {step === "forgot_password" && (
          <motion.div
            key="step-forgot"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            {/* Header */}
            <div className="space-y-1.5 text-center sm:text-left">
              <button
                type="button"
                onClick={() => {
                  setStep("credentials");
                  setForgotSent(false);
                  setForgotError("");
                  const signInUrl = buildSignInUrl({ ref: 'recovery_back', mode: 'enterprise' });
                  window.history.replaceState(null, '', signInUrl);
                }}
                className="inline-flex items-center gap-1.5 text-xs text-[#FF6B00] hover:underline mb-2 font-medium cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to sign in</span>
              </button>
              <h2
                className={`text-2xl font-bold tracking-tight ${isLight ? "text-gray-950" : "text-white"}`}
              >
                Reset your password
              </h2>
              <p
                className={`text-xs sm:text-[13px] ${isLight ? "text-gray-600" : "text-gray-400"}`}
              >
                Enter your registered corporate email to receive a secure
                password recovery link.
              </p>
            </div>

            {forgotError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSent ? (
              <div className="space-y-4 pt-1">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-semibold text-emerald-500">
                      Reset instructions dispatched!
                    </p>
                    <p className={isLight ? "text-gray-600" : "text-gray-300"}>
                      A secure password recovery email has been sent to{" "}
                      <span className="font-semibold text-emerald-400">
                        {forgotEmail}
                      </span>
                      .
                    </p>
                  </div>
                </div>

                {/* 30-Second Cooldown Button */}
                <button
                  type="button"
                  disabled={cooldownSeconds > 0 || isLoading}
                  onClick={handleForgotSubmit}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all duration-200 flex items-center justify-center gap-2 ${cooldownSeconds > 0
                      ? isLight
                        ? "border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed"
                        : "border-white/10 text-gray-500 bg-white/[0.03] cursor-not-allowed"
                      : "border-[#FF6B00]/40 text-[#FF6B00] hover:bg-[#FF6B00]/10 active:scale-95 cursor-pointer"
                    }`}
                >
                  {cooldownSeconds > 0 ? (
                    <span>Resend link available in {cooldownSeconds}s</span>
                  ) : (
                    <span>Resend Reset Link</span>
                  )}
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleForgotSubmit}
                className="space-y-4"
                noValidate
              >
                <div className="space-y-1.5">
                  <label
                    className={`text-xs font-semibold uppercase tracking-wider block ${isLight ? "text-gray-700" : "text-gray-300"}`}
                  >
                    Registered Work Email
                  </label>
                  <div className="relative">
                    <Mail
                      className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isLight ? "text-gray-400" : "text-gray-500"}`}
                    />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => {
                        setForgotEmail(e.target.value);
                        if (errors.forgotEmail) setErrors({ ...errors, forgotEmail: null });
                        if (forgotError) setForgotError("");
                      }}
                      placeholder="name@company.com"
                      className={inputClasses(Boolean(errors.forgotEmail))}
                      autoComplete="email"
                    />
                  </div>
                  {errors.forgotEmail && (
                    <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 pt-0.5">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.forgotEmail}</span>
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl font-semibold text-sm tracking-wide bg-[#FF6B00] hover:bg-[#FF7B18] text-[#0A0505] shadow-[0_4px_20px_rgba(255,107,0,0.35)] transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending Reset Link...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Password Reset Link</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
