import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, LogOut, Search, UserCircle, X, Mail, Shield, Building2 } from 'lucide-react'

import { useAuth } from '../hooks/useAuth'
import { useBranding } from '../context/BrandingContext'
import { ROLE_IDS, ROLES } from '../config/roles'

// Centralised page-title map. Falls back to a humanised path segment.
const TITLE_MAP = {
  '/dashboard':           'Dashboard',
  '/admin/dashboard':     'Admin Dashboard',
  '/admin/users':         'User Management',
  '/admin/reports':       'System Reports',
  '/hr/dashboard':        'HR Dashboard',
  '/hr/employees':        'Employee Management',
  '/manager/dashboard':   'Manager Dashboard',
  '/sales/dashboard':     'Sales Dashboard',
  '/sales/leads':         'My Leads',
  '/sales/deals':         'My Deals',
  '/employee/dashboard':  'My Workspace',
  '/employees':           'Employees',
  '/employees/create':    'Add Employee',
  '/employees/exit':      'Exit Management',
  '/payroll':             'Payroll',
  '/leave':               'Leave Management',
  '/attendance':          'Attendance',
  '/attendance/daily':    'Daily Attendance',
  '/attendance/monthly':  'Monthly Attendance',
  '/attendance/requests': 'Attendance Requests',
  '/crm':                 'Lead Management (CRM)',
  '/recruitment':         'Recruitment (ATS)',
  '/projects':            'Projects & Tasks',
  '/tasks':               'My Tasks',
  '/performance':         'Performance',
  '/compliance':          'Compliance',
  '/reports':             'Reports',
  '/settings':            'Settings',
  '/onboarding':          'Client Onboarding',
}

const humanise = (segment) =>
  segment.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

const Header = memo(() => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, role, roleMeta, logout } = useAuth()
  const { companyName, brandColor } = useBranding()

  const [open, setOpen] = useState(false)
  const [showProfileCard, setShowProfileCard] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (!dropdownRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const pageName = useMemo(() => {
    const exact = TITLE_MAP[location.pathname]
    if (exact) return exact
    if (location.pathname.startsWith('/employees/')) return 'Employee Profile'
    const segs = location.pathname.split('/').filter(Boolean)
    if (segs.length === 0) return 'Dashboard'
    return humanise(segs[segs.length - 1])
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    setOpen(false)
    navigate('/login')
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{pageName}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <input
            type="text"
            placeholder="Search..."
            className="w-64 rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white"
          />
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>

        <button
          type="button"
          className="relative rounded-lg p-2 text-gray-600 transition hover:bg-gray-100"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
          </span>
        </button>

        {/* ── Profile + role switcher ─────────────────────────────── */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setOpen(p => !p)}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 transition hover:bg-gray-50"
          >
            {user?.avatarUrl ? (
              <img 
                src={user.avatarUrl} 
                alt={user?.name || 'User'} 
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white ${roleMeta?.avatarClass || 'bg-gray-400'}`}>
                {(user?.name || roleMeta?.label || 'U').slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500">{roleMeta?.label || 'Guest'}</p>
            </div>
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.18 }}
                className="absolute right-0 z-50 mt-2 w-72 origin-top-right overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
              >
                <div className="border-b border-gray-100 p-3">
                  <div className="flex items-center gap-3">
                    {user?.avatarUrl ? (
                      <img 
                        src={user.avatarUrl} 
                        alt={user?.name || 'User'} 
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ${roleMeta?.avatarClass || 'bg-gray-400'}`}>
                        {(user?.name || 'U').slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900">{user?.name || 'User'}</p>
                      <p className="truncate text-xs text-gray-500">{user?.email || ''}</p>
                    </div>
                  </div>
                  {roleMeta && (
                    <span className={`mt-3 inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase ${roleMeta.badgeClass}`}>
                      {roleMeta.label}
                    </span>
                  )}
                </div>

                <div className="p-2 space-y-1">
                  <button
                    type="button"
                    onClick={() => { setOpen(false); setShowProfileCard(true) }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    <UserCircle className="h-4 w-4 text-gray-500" />
                    My Profile
                  </button>

                  {role === ROLE_IDS.SUPER_ADMIN && (
                    <button
                      type="button"
                      onClick={() => { setOpen(false); navigate('/settings') }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      <UserCircle className="h-4 w-4 text-gray-500" />
                      Platform Settings
                    </button>
                  )}
                </div>

                <div className="border-t border-gray-100 p-2">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {/* ── Profile Card Modal ──────────────────────────────── */}
      <AnimatePresence>
        {showProfileCard && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
              onClick={() => setShowProfileCard(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gray-200 bg-white shadow-2xl"
            >
              {/* Close button */}
              <button
                type="button"
                onClick={() => setShowProfileCard(false)}
                className="absolute right-3 top-3 rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Card content */}
              <div className="p-6 text-center">
                {/* Avatar */}
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user?.name || 'User'}
                    className="mx-auto h-20 w-20 rounded-full object-cover shadow-md"
                  />
                ) : (
                  <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white shadow-md ${roleMeta?.avatarClass || 'bg-gray-400'}`}>
                    {(user?.name || 'U').slice(0, 2).toUpperCase()}
                  </div>
                )}

                {/* Name & Role */}
                <h2 className="mt-4 text-xl font-bold text-gray-900">{user?.name || 'User'}</h2>
                {roleMeta && (
                  <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase ${roleMeta.badgeClass}`}>
                    {roleMeta.label}
                  </span>
                )}

                {/* Details */}
                <div className="mt-5 space-y-3 border-t border-gray-100 pt-4 text-left">
                  {user?.email && (
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>
                  )}
                  {user?.department && (
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span>{user.department}</span>
                    </div>
                  )}
                  {roleMeta && (
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Shield className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span>{roleMeta.label}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </header>
  )
})

Header.displayName = 'Header'
export default Header
