import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { Sun, Moon, LayoutDashboard, User } from 'lucide-react';
import { buildSignInUrl, buildRegisterUrl } from '../../utils/authSession';

export default function Navbar({ onOpenAuth }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isLight, toggleTheme } = useTheme();
  const { session, role, getRoleLanding, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate(buildSignInUrl({ ref: 'navbar', mode: 'enterprise' }));
  };

  const handleRegister = () => {
    navigate(buildRegisterUrl({ ref: 'navbar', mode: 'new-company' }));
  };

  const handleDashboardClick = () => {
    const landing = getRoleLanding ? getRoleLanding(role) : '/dashboard';
    navigate(landing);
  };

  const handleLogoClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  return (
    <header id="main-nav" className="hero-nav fixed top-0 left-0 right-0 z-50 h-[68px] glass-nav will-change-transform transition-colors duration-300">
      <div className="max-w-[1340px] h-full mx-auto px-6 sm:px-10 flex items-center justify-between relative">

        {/* Left Side Navigation Links (hidden on mobile, visible on tablet/desktop) */}
        <nav className="hidden md:flex items-center gap-7 md:gap-9">
          <a
            href="#solutions"
            className={`text-[13px] md:text-[14px] font-light transition-colors duration-200 tracking-wide ${isLight ? 'text-gray-700 hover:text-black' : 'text-white/85 hover:text-white'
              }`}
          >
            Solutions
          </a>
          <a
            href="#services"
            className={`text-[13px] md:text-[14px] font-light transition-colors duration-200 tracking-wide ${isLight ? 'text-gray-700 hover:text-black' : 'text-white/85 hover:text-white'
              }`}
          >
            Services
          </a>
          <a
            href="#pricing"
            className={`text-[13px] md:text-[14px] font-light transition-colors duration-200 tracking-wide ${isLight ? 'text-gray-700 hover:text-black' : 'text-white/85 hover:text-white'
              }`}
          >
            Pricing
          </a>
        </nav>

        {/* Center: Senti Logo & Brand (Independently Centered) */}
        <div
          onClick={handleLogoClick}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 select-none pointer-events-auto cursor-pointer group"
          title="Back to Top"
        >
          <div className="relative w-6 h-6 flex items-center justify-center">
            {/* Elegant geometric logo mark */}
            <svg
              className={`w-5 h-5 transition-colors duration-300 ${isLight ? 'text-gray-950 group-hover:text-[#FF7A18]' : 'text-white group-hover:text-[#FF7A18]'
                }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L3 7v9l9 6 9-6V7l-9-5z" />
              <path d="M12 22V12" />
              <path d="M12 12L3 7" />
              <path d="M12 12l9-5" />
            </svg>
            <div className="absolute inset-0 bg-[#FF7A18]/20 blur-md rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <span className={`text-[19px] tracking-[0.06em] font-light transition-colors ${isLight ? 'text-gray-950 group-hover:text-black' : 'text-white group-hover:text-white/90'
            }`}>
            Senti
          </span>
        </div>

        {/* Right Side: Theme Toggle, Dashboard / Sign In / Register Buttons & Minimal Hamburger Icon */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Light / Dark Mode Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 border active:scale-90 cursor-pointer ${isLight
                ? 'bg-orange-50 border-orange-200 text-[#FF6B00] hover:bg-orange-100 shadow-sm'
                : 'bg-white/10 border-white/20 text-yellow-300 hover:bg-white/20 hover:text-yellow-200'
              }`}
          >
            {isLight ? (
              <Moon className="w-4 h-4 fill-current transition-transform duration-300" />
            ) : (
              <Sun className="w-4 h-4 fill-current transition-transform duration-300" />
            )}
          </button>

          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleDashboardClick}
              className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full bg-[#FF6B00] hover:bg-[#FF7B18] text-[#0A0505] shadow-[0_2px_12px_rgba(255,107,0,0.35)] transition-all cursor-pointer"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Go to Dashboard</span>
            </button>
          ) : (
            <>
              {/* Sign In Button */}
              <button
                type="button"
                onClick={handleSignIn}
                className={`hidden sm:inline-flex items-center text-xs font-semibold tracking-wide transition-colors duration-200 cursor-pointer ${isLight ? 'text-gray-700 hover:text-black' : 'text-white/85 hover:text-white'
                  }`}
              >
                Sign In
              </button>

              <button
                type="button"
                onClick={handleRegister}
                className={`hidden sm:inline-flex items-center justify-center text-[11px] font-medium tracking-[0.14em] uppercase px-5 py-1.5 rounded-full border active:scale-95 transition-all duration-200 cursor-pointer ${isLight
                    ? 'text-gray-900 border-gray-300 hover:border-gray-500 hover:bg-black/[0.04]'
                    : 'text-white/95 border-white/25 hover:border-white/60 hover:bg-white/10'
                  }`}
              >
                REGISTER
              </button>
            </>
          )}

          {/* Minimal 2-bar hamburger menu icon */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            className="p-1.5 flex flex-col justify-center items-end gap-[5px] transition-colors cursor-pointer"
          >
            <span className={`w-5 h-[1.5px] rounded-full transition-transform ${isLight ? 'bg-gray-900' : 'bg-white'}`} />
            <span className={`w-3.5 h-[1.5px] rounded-full transition-transform ${isLight ? 'bg-gray-900' : 'bg-white'}`} />
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Responsive fallback) */}
      {mobileMenuOpen && (
        <div className={`sm:hidden absolute top-[68px] left-0 w-full backdrop-blur-xl border-b p-6 flex flex-col gap-4 animate-in fade-in duration-200 ${isLight ? 'bg-white/95 border-gray-200 text-gray-900' : 'bg-[#180808]/95 border-white/10 text-white'
          }`}>
          <div className="flex items-center justify-between pb-3 border-b border-gray-200/50">
            <span className="text-sm font-semibold">Theme</span>
            <button
              type="button"
              onClick={toggleTheme}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${isLight ? 'bg-orange-50 border-orange-200 text-[#FF6B00]' : 'bg-white/10 border-white/20 text-yellow-300'
                }`}
            >
              {isLight ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
              <span>{isLight ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
          </div>
          <a
            href="#solutions"
            onClick={() => setMobileMenuOpen(false)}
            className={`text-base py-1 transition-colors ${isLight ? 'hover:text-[#FF6B00] text-gray-800' : 'hover:text-[#FF6B00] text-white/90'
              }`}
          >
            Solutions
          </a>
          <a
            href="#services"
            onClick={() => setMobileMenuOpen(false)}
            className={`text-base py-1 transition-colors ${isLight ? 'hover:text-[#FF6B00] text-gray-800' : 'hover:text-[#FF6B00] text-white/90'
              }`}
          >
            Services
          </a>
          <a
            href="#pricing"
            onClick={() => setMobileMenuOpen(false)}
            className={`text-base py-1 transition-colors ${isLight ? 'hover:text-[#FF6B00] text-gray-800' : 'hover:text-[#FF6B00] text-white/90'
              }`}
          >
            Pricing
          </a>

          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                handleDashboardClick();
              }}
              className="mt-2 text-xs uppercase tracking-widest text-center py-2.5 rounded-full bg-[#FF6B00] text-[#0A0505] font-semibold"
            >
              Go to Dashboard
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleSignIn();
                }}
                className="text-base py-1 text-left font-medium text-[#FF6B00] cursor-pointer"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleRegister();
                }}
                className={`mt-2 text-xs uppercase tracking-widest text-center py-2.5 rounded-full border font-medium cursor-pointer ${isLight
                    ? 'border-gray-400/50 text-gray-900 hover:bg-black/5'
                    : 'border-white/30 text-white hover:bg-white/10'
                  }`}
              >
                REGISTER
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
