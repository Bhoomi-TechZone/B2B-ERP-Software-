import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronLeft, ChevronRight, LogOut, UserCircle } from 'lucide-react'

import { filterNavForRole } from '../../../config/navigation'
import { useAuth } from '../../../hooks/useAuth'
import { useBranding } from '../../../context/BrandingContext'

const DEFAULT_LOGO = '/logo/WorkMatrix1_logo_design-removebg-preview.png'

/**
 * Production sidebar:
 *  - Driven entirely by `config/navigation.js` (no hard-coded role checks)
 *  - Filtered per the auth-context role
 *  - Items with `children` render as collapsible groups
 *  - Animated via framer-motion with reduced re-renders (memoised)
 */
const Sidebar = memo(() => {
  const navigate = useNavigate()
  const location = useLocation()
  const { role, roleMeta, user, tenant, logout } = useAuth()
  const { logo: companyLogo, branding } = useBranding()

  const [profileOpen, setProfileOpen] = useState(false)
  const profileMenuRef = useRef(null)

  // Dynamic brand color for active items
  const brandColor = branding?.brandColor || '#1251C5'

  // Close profile dropdown on click outside
  useEffect(() => {
    if (!profileOpen) return
    const onClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [profileOpen])

  const handleLogout = useCallback(() => {
    logout()
    setProfileOpen(false)
    navigate('/login')
  }, [logout, navigate])

  // â”€â”€ Collapse state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [isCollapsed, setIsCollapsed] = useState(false)
  const toggleCollapse = useCallback(() => setIsCollapsed(p => !p), [])

  // ──── Nav (filtered by role and dynamic modules) ────────────────────────────
  const sections = useMemo(() => filterNavForRole(role, tenant?.modules || {}, user?.userModules), [role, tenant?.modules, user?.userModules])

  // ──── Auto-open the group whose child matches the current path ──────────────
  const initiallyOpen = useMemo(() => {
    const map = {}
    for (const s of sections) {
      for (const item of s.items) {
        if (item.children?.some(c => location.pathname.startsWith(c.path) || location.pathname === item.path)) {
          map[item.path] = true
        }
      }
    }
    return map
  }, [sections, location.pathname])

  const [openGroups, setOpenGroups] = useState(initiallyOpen)
  useEffect(() => { setOpenGroups(prev => ({ ...prev, ...initiallyOpen })) }, [initiallyOpen])

  // â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleNav = useCallback((path) => navigate(path), [navigate])

  const isActive = useCallback((path) => {
    if (location.pathname === path) return true
    if (path !== '/' && location.pathname.startsWith(path + '/')) return true
    return false
  }, [location.pathname])

  const badgeClass = (b) => {
    switch (b) {
      case 'NEW':   return 'bg-green-100 text-green-700'
      case 'ADMIN': return 'bg-purple-100 text-purple-700'
      case 'SALES': return 'bg-blue-100 text-blue-700'
      case 'HR':    return 'bg-orange-100 text-orange-700'
      case 'MGR':   return 'bg-emerald-100 text-emerald-700'
      case 'ME':    return 'bg-slate-100 text-slate-700'
      default:      return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 80 : 256 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="hidden shrink-0 border-r border-gray-200 bg-white lg:block"
    >
      <div className="flex h-full flex-col">
        {/* â”€â”€ Logo & Collapse Toggle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => handleNav(roleMeta?.landing || '/dashboard')}
            className={`cursor-pointer transition-opacity hover:opacity-80 ${isCollapsed ? 'mx-auto' : ''}`}
            aria-label="Go to home"
          >
            <img src={companyLogo} alt="Company Logo" className="h-10 w-auto object-contain" />
          </motion.button>
          <button
            onClick={toggleCollapse}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition hover:bg-gray-200 hover:text-gray-900"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* ────────────────────────────────────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {sections.map((section, idx) => {
            const activeBgClass = role === 'employee' ? 'bg-blue-600 text-white shadow-sm' : 'bg-black text-white shadow-sm'
            return (
              <div key={`${section.title}-${idx}`} className="mb-6">
                {!isCollapsed && section.title && (
                  <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    {section.title}
                  </h3>
                )}
                {isCollapsed && section.title && <div className="mb-2 h-px bg-gray-200" />}

                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon  = item.icon
                    const open  = !!openGroups[item.path]
                    const grouped = !!item.children?.length

                    if (!grouped) {
                      return (
                        <motion.button
                          key={item.path}
                          onClick={() => handleNav(item.path)}
                          title={isCollapsed ? item.label : ''}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                            isActive(item.path) ? activeBgClass : 'text-gray-700 hover:bg-gray-100'
                          } ${isCollapsed ? 'justify-center' : ''}`}
                          style={isActive(item.path) ? { backgroundColor: brandColor, color: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.12)' } : {}}
                        >
                          <Icon className="h-5 w-5" />
                          {!isCollapsed && (
                            <>
                              <span className="flex-1 text-left">{item.label}</span>
                              {item.badge && (
                                <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${badgeClass(item.badge)}`}>
                                  {item.badge}
                                </span>
                              )}
                            </>
                          )}
                        </motion.button>
                      )
                    }

                    // Grouped item with children
                    const firstChildPath = item.children[0]?.path || item.path
                    const isGroupActive = isActive(item.path) || (item.children && item.children.some(c => isActive(c.path)))
                    return (
                      <div key={item.path}>
                        <motion.button
                          onClick={() => isCollapsed
                            ? handleNav(firstChildPath)
                            : setOpenGroups(p => ({ ...p, [item.path]: !p[item.path] }))}
                          title={isCollapsed ? item.label : ''}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                            isGroupActive ? activeBgClass : 'text-gray-700 hover:bg-gray-100'
                          } ${isCollapsed ? 'justify-center' : ''}`}
                          style={isGroupActive ? { backgroundColor: brandColor, color: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.12)' } : {}}
                        >
                          <Icon className="h-5 w-5" />
                          {!isCollapsed && (
                            <>
                              <span className="flex-1 text-left">{item.label}</span>
                              <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                <ChevronDown className="h-4 w-4" />
                              </motion.div>
                            </>
                          )}
                        </motion.button>

                        <AnimatePresence initial={false}>
                          {!isCollapsed && open && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="ml-4 mt-1 space-y-1 overflow-hidden border-l-2 border-gray-100 pl-3"
                            >
                              {item.children.map(sub => {
                                const SubIcon = sub.icon
                                const subActive = location.pathname === sub.path
                                  || location.pathname.startsWith(sub.path + '/')
                                return (
                                  <motion.button
                                    key={sub.path}
                                    onClick={() => handleNav(sub.path)}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                                      subActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                  >
                                    {SubIcon && <SubIcon className="h-3.5 w-3.5" />}
                                    {sub.label}
                                  </motion.button>
                                )
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </nav>

        {/* ──── User Profile ───────────────────────────────────────────── */}
        <div className="relative border-t border-gray-200 p-4" ref={profileMenuRef}>
          {!isCollapsed ? (
            <button
              type="button"
              onClick={() => setProfileOpen(p => !p)}
              className="flex w-full items-center gap-3 rounded-lg bg-gray-50 p-3 text-left transition hover:bg-gray-100 cursor-pointer"
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${roleMeta?.avatarClass || 'bg-gray-400'}`}>
                {(user?.name || roleMeta?.label || 'U').slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">{user?.name || roleMeta?.label || 'User'}</p>
                <p className="truncate text-xs text-gray-500">{user?.email || ''}</p>
              </div>
              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setProfileOpen(p => !p)}
              className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white transition hover:opacity-85 cursor-pointer ${roleMeta?.avatarClass || 'bg-gray-400'}`}
            >
              {(user?.name || roleMeta?.label || 'U').slice(0, 1).toUpperCase()}
            </button>
          )}

          {/* Floating Popup above the profile block */}
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ duration: 0.18 }}
                className={`absolute bottom-20 z-50 w-64 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg ${
                  isCollapsed ? 'left-4' : 'left-4 right-4 w-auto'
                }`}
              >
                <div className="border-b border-gray-100 p-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${roleMeta?.avatarClass || 'bg-gray-400'}`}>
                      {(user?.name || 'U').slice(0, 1).toUpperCase()}
                    </div>
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

                <div className="p-2">
                  <button
                    type="button"
                    onClick={() => { setProfileOpen(false); navigate('/my-profile') }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    <UserCircle className="h-4 w-4 text-gray-500" />
                    My Profile
                  </button>
                </div>

                <div className="border-t border-gray-100 p-2">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
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
    </motion.aside>
  )
})

Sidebar.displayName = 'Sidebar'
export default Sidebar