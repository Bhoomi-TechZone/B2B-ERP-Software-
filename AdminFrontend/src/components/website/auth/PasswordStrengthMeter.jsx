import React from 'react';
import { Check, X } from 'lucide-react';

export const checkPasswordRules = (password) => {
  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);

  const score = [hasLength, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
  const isValid = score === 4;

  return {
    hasLength,
    hasUpper,
    hasNumber,
    hasSpecial,
    score,
    isValid,
  };
};

export const getPasswordMissingRequirements = (pwd) => {
  if (!pwd) return "Account password is required.";
  const { hasLength, hasUpper, hasNumber, hasSpecial, isValid } = checkPasswordRules(pwd);
  if (isValid) return null;

  const missing = [];
  if (!hasLength) missing.push("minimum 8 characters");
  if (!hasUpper) missing.push("at least 1 uppercase letter (A–Z)");
  if (!hasNumber) missing.push("at least 1 numeric digit (0–9)");
  if (!hasSpecial) missing.push("at least 1 special symbol (!@#$%...)");

  return `Password must include: ${missing.join(", ")}.`;
};

export default function PasswordStrengthMeter({ password, isLight }) {
  const { hasLength, hasUpper, hasNumber, hasSpecial, score } = checkPasswordRules(password);

  const rules = [
    { label: 'Minimum 8 characters', met: hasLength },
    { label: 'At least one uppercase letter (A-Z)', met: hasUpper },
    { label: 'At least one numeric digit (0-9)', met: hasNumber },
    { label: 'At least one special symbol (!@#$%...)', met: hasSpecial },
  ];

  const getStrengthLabel = () => {
    if (score === 0) return { label: 'Enter a secure password', color: 'text-gray-400' };
    if (score === 1) return { label: 'Weak (1/4)', color: 'text-rose-500' };
    if (score === 2) return { label: 'Fair (2/4)', color: 'text-amber-500' };
    if (score === 3) return { label: 'Good (3/4)', color: 'text-yellow-500' };
    return { label: 'Strong (4/4 Satisfied)', color: 'text-emerald-500' };
  };

  const strength = getStrengthLabel();

  return (
    <div className="space-y-2.5 pt-1 select-none">
      {/* 4-Bar Visual Indicator */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px]">
          <span className={isLight ? 'text-gray-600 font-medium' : 'text-gray-400 font-light'}>
            Security Policy:
          </span>
          <span className={`font-semibold ${strength.color}`}>
            {strength.label}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1.5 h-1.5">
          {[1, 2, 3, 4].map((step) => {
            const isFilled = score >= step;
            let barColor = 'bg-white/10';
            if (isLight) barColor = 'bg-gray-200';

            if (isFilled) {
              if (score <= 1) barColor = 'bg-rose-500';
              else if (score === 2) barColor = 'bg-amber-500';
              else if (score === 3) barColor = 'bg-yellow-500';
              else barColor = 'bg-emerald-500';
            }

            return (
              <div
                key={step}
                className={`h-full rounded-full transition-all duration-300 ${barColor}`}
              />
            );
          })}
        </div>
      </div>

      {/* 4-Rule Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
        {rules.map((rule, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-1.5 transition-colors duration-200 ${
              rule.met
                ? 'text-emerald-500 font-medium'
                : isLight
                ? 'text-gray-500 font-normal'
                : 'text-gray-400 font-normal'
            }`}
          >
            <div
              className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                rule.met
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500'
                  : isLight
                  ? 'border-gray-300 text-gray-400 bg-gray-100'
                  : 'border-white/15 text-white/30 bg-white/[0.04]'
              }`}
            >
              {rule.met ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : <X className="w-2.5 h-2.5" />}
            </div>
            <span>{rule.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
