import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  Bell, Settings, ChevronDown, LogOut, Layers, Search,
  LayoutDashboard, Building2, CreditCard, Activity, BarChart2, Sliders, Users, Package,
  User, Mail, Phone, MapPin, Loader2,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth.js'
import { useState } from 'react'
import superAdminService from '../../services/superAdminService.js'

const NAV_LINKS = [
  { label: 'Dashboard',     icon: LayoutDashboard, path: '/super-admin',          exact: true  },
  { label: 'Tenants',       icon: Building2,        path: '/super-admin/tenants',  exact: false },
  { label: 'Users',         icon: Users,            path: '/super-admin/users',    exact: false },
  { label: 'Plans',         icon: Package,          path: '/super-admin/plans',    exact: false },
  { label: 'Billing',       icon: CreditCard,       path: '/super-admin/billing',  exact: false },
  { label: 'Leads',         icon: BarChart2,        path: '/super-admin/leads',    exact: false },
  { label: 'System Health', icon: Activity,         path: null,                    exact: false },
  { label: 'Reports',       icon: BarChart2,        path: null,                    exact: false },
  { label: 'Settings',      icon: Sliders,          path: '/super-admin/settings', exact: false },
]

export default function SuperAdminTopBar() {
  const navigate   = useNavigate()
  const location   = useLocation()
  const { logout } = useAuth()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [profileData, setProfileData] = useState(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(3)

  const notifications = [
    { id: 1, title: 'Security Audit', desc: 'Zero anomalies detected in last 24h compliance scan.', time: '10m ago', unread: true },
    { id: 2, title: 'Automated Backup', desc: 'MongoDB snapshot completed successfully.', time: '1h ago', unread: true },
    { id: 3, title: 'Tenant Onboarding', desc: 'New tenant registered and trial active.', time: '3h ago', unread: true },
  ]

  const handleProfileClick = async () => {
    if (showProfileMenu) {
      setShowProfileMenu(false)
      return
    }

    if (!profileData) {
      setIsLoadingProfile(true)
      try {
        console.log('🔄 Fetching user profile')
        const data = await superAdminService.getUserProfile()
        console.log('✅ Profile data received:', data)
        setProfileData(data)
      } catch (err) {
        console.error('❌ Failed to fetch profile:', err)
      } finally {
        setIsLoadingProfile(false)
      }
    }

    setShowProfileMenu(!showProfileMenu)
  }

  const handleLogout = () => {
    logout()
    navigate('/super-admin/login', { replace: true })
  }

  const isActive = (link) => {
    if (!link.path) return false
    if (link.exact) return location.pathname === link.path
    return location.pathname.startsWith(link.path)
  }

  return (
    <div className="shrink-0 border-b border-[#dce9ff] bg-white">
      {/* ── Row 1: Brand · Search · Controls ── */}
      <div className="flex h-14 items-center justify-between px-6">

        {/* Brand */}
        <div
          className="flex items-center gap-2.5 cursor-pointer select-none"
          onClick={() => navigate('/super-admin')}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#1251C5] to-[#1a6fe8] shadow">
            <Layers className="h-4 w-4 text-white" />
          </div>
          <div className="leading-none">
            <p className="text-[11px] font-semibold tracking-widest text-[#1251C5] uppercase">HRMS Cloud</p>
            <p className="text-[10px] text-slate-400">Admin Console</p>
          </div>
        </div>

        {/* Search */}
        <div className="hidden md:flex items-center gap-2 h-8 rounded-lg border border-[#dce9ff] bg-[#f0f5ff] px-3 w-64 focus-within:ring-2 focus-within:ring-[#1251C5]/20 focus-within:border-[#1251C5] transition">
          <Search className="h-3.5 w-3.5 text-slate-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                navigate(`/super-admin/tenants?search=${encodeURIComponent(searchQuery.trim())}`)
              }
            }}
            className="flex-1 bg-transparent text-xs text-slate-600 outline-none placeholder:text-slate-400"
            placeholder="Search tenants, users, plans… (Enter)"
          />
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-[#dce9ff] bg-white hover:bg-[#f0f5ff] transition cursor-pointer"
            >
              <Bell className="h-4 w-4 text-slate-500" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#1251C5] text-[9px] font-bold text-white shadow-sm">
                  {unreadCount}
                </span>
              )}
            </motion.button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full right-0 mt-2 w-80 rounded-2xl bg-white border border-[#dce9ff] shadow-xl z-50 overflow-hidden"
                >
                  <div className="flex items-center justify-between border-b border-[#f0f5ff] px-4 py-3 bg-[#f8faff]">
                    <span className="text-xs font-bold text-slate-800">Platform Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => setUnreadCount(0)}
                        className="text-[10px] font-semibold text-[#1251C5] hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="divide-y divide-[#f0f5ff]">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-3 hover:bg-[#f8faff] transition">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-800">{n.title}</p>
                          <span className="text-[10px] text-slate-400">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{n.desc}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/super-admin/settings')}
            title="Platform Settings"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#dce9ff] bg-white hover:bg-[#f0f5ff] transition cursor-pointer"
          >
            <Settings className="h-4 w-4 text-slate-500" />
          </motion.button>

          <div className="flex items-center gap-2 cursor-pointer select-none relative">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#1251C5] to-[#4f9cf9] text-[11px] font-bold text-white shadow">
              GC
            </div>
            <div className="hidden md:block leading-none">
              <p className="text-xs font-semibold text-slate-800">Gerry Connolly</p>
              <p className="text-[10px] text-slate-400">Admin</p>
            </div>
            <motion.button
              onClick={handleProfileClick}
              className="flex items-center gap-1"
            >
              <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
            </motion.button>

            {/* Profile Dropdown Menu */}
            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full right-0 mt-2 w-80 rounded-2xl bg-white border border-[#dce9ff] shadow-lg z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  {isLoadingProfile ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin text-[#1251C5]" />
                      <span className="ml-2 text-xs text-slate-500">Loading profile...</span>
                    </div>
                  ) : profileData ? (
                    <>
                      {/* User Info */}
                      <div className="border-b border-[#f0f5ff] p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#1251C5] to-[#4f9cf9] text-sm font-bold text-white">
                            {profileData.user?.first_name?.[0]}{profileData.user?.last_name?.[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{profileData.user?.display_name || 'User'}</p>
                            <p className="text-xs text-slate-500">{profileData.user?.user_type || 'platform_admin'}</p>
                          </div>
                        </div>
                      </div>

                      {/* User Details */}
                      <div className="space-y-2 p-4 border-b border-[#f0f5ff]">
                        {profileData.user?.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-slate-400" />
                            <span className="text-xs text-slate-600">{profileData.user.email}</span>
                          </div>
                        )}
                        {profileData.user?.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-slate-400" />
                            <span className="text-xs text-slate-600">{profileData.user.phone}</span>
                          </div>
                        )}
                        {profileData.user?.timezone && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-slate-400" />
                            <span className="text-xs text-slate-600">{profileData.user.timezone}</span>
                          </div>
                        )}
                      </div>

                      {/* Tenant Info */}
                      {profileData.tenant && (
                        <div className="space-y-2 p-4 border-b border-[#f0f5ff]">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Tenant</p>
                          <p className="text-sm font-semibold text-slate-900">{profileData.tenant.name}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="inline-flex items-center rounded-full px-2 py-0.5 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                              {profileData.tenant.status}
                            </span>
                            <span>{profileData.tenant.primary_currency}</span>
                          </div>
                        </div>
                      )}

                      {/* Account Status */}
                      <div className="space-y-2 p-4 border-b border-[#f0f5ff]">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Email Verified</span>
                          <span className={profileData.user?.email_verified ? '✅' : '❌'}>
                            {profileData.user?.email_verified ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">MFA Enabled</span>
                          <span className={profileData.user?.mfa_enabled ? '✅' : '❌'}>
                            {profileData.user?.mfa_enabled ? 'Yes' : 'No'}
                          </span>
                        </div>
                        {profileData.user?.last_login_at && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500">Last Login</span>
                            <span className="text-slate-700">{new Date(profileData.user.last_login_at).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 p-4">
                        <button
                          onClick={() => {
                            navigate('/super-admin/profile')
                            setShowProfileMenu(false)
                          }}
                          className="flex-1 px-3 py-2 rounded-lg border border-[#dce9ff] text-slate-600 text-xs font-semibold hover:bg-[#f0f5ff] transition flex items-center justify-center gap-1"
                        >
                          <User className="h-3.5 w-3.5" />
                          Edit Profile
                        </button>
                        <button
                          onClick={handleLogout}
                          className="flex-1 px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition flex items-center justify-center gap-1"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          Logout
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-xs text-slate-500">Failed to load profile</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="flex items-center gap-1.5 h-8 rounded-lg border border-[#dce9ff] bg-white px-3 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-slate-500 transition text-xs font-semibold"
          >
            <LogOut className="h-3.5 w-3.5" /> Logout
          </motion.button>
        </div>
      </div>

      {/* ── Row 2: Navigation links ── */}
      <div className="flex items-center gap-1 px-6 overflow-x-auto">
        {NAV_LINKS.map((link) => {
          const Icon   = link.icon
          const active = isActive(link)
          const disabled = !link.path

          return (
            <button
              key={link.label}
              disabled={disabled}
              onClick={() => link.path && navigate(link.path)}
              className={`relative flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors
                ${disabled
                  ? 'cursor-not-allowed text-slate-300'
                  : active
                    ? 'text-[#1251C5]'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {link.label}
              {disabled && (
                <span className="ml-1 rounded px-1 py-0.5 text-[9px] font-bold uppercase bg-slate-100 text-slate-400 leading-none">soon</span>
              )}
              {/* active underline */}
              {active && (
                <motion.span
                  layoutId="superAdminNavUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#1251C5]"
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
