import { memo, useMemo, useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Search, Bell, ChevronDown, Menu, ChevronRight, LogOut, UserCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '../../../hooks/useAuth'

const Header = memo(({ onMenuClick }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownOpen])

  const handleLogout = () => {
    logout()
    setDropdownOpen(false)
    navigate('/login')
  }

  const breadcrumbs = useMemo(() => {
    const path = location.pathname
    const routes = {
      '/dashboard': ['Dashboard'],
      '/employees': ['Dashboard', 'HR Management', 'Employees'],
      '/payroll': ['Dashboard', 'HR Management', 'Payroll'],
      '/leave': ['Dashboard', 'HR Management', 'Leave Management'],
      '/attendance': ['Dashboard', 'HR Management', 'Attendance'],
      '/crm': ['Dashboard', 'Operations', 'CRM'],
      '/recruitment': ['Dashboard', 'HR Management', 'Recruitment'],
      '/projects': ['Dashboard', 'Operations', 'Projects'],
      '/performance': ['Dashboard', 'HR Management', 'Performance'],
      '/compliance': ['Dashboard', 'HR Management', 'Compliance'],
      '/reports': ['Dashboard', 'Admin', 'Reports'],
      '/settings': ['Dashboard', 'Admin', 'Settings'],
    }
    return routes[path] || ['Dashboard']
  }, [location.pathname])

  return (
    <header className="border-b border-slate-200 bg-white px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left Side - Breadcrumb */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center gap-2">
                {index > 0 && <ChevronRight className="h-4 w-4 text-slate-400" />}
                <span className={index === breadcrumbs.length - 1 ? 'font-semibold text-slate-900' : 'text-slate-500 hover:text-slate-700'}>
                  {crumb}
                </span>
              </div>
            ))}
          </nav>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-56 rounded-md border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white"
              />
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* Notifications */}
          <button className="relative rounded-md p-2 text-slate-600 transition hover:bg-slate-100">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
            </span>
          </button>

          {/* Profile with Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2 py-1.5 transition hover:bg-slate-50"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="hidden pr-1 text-left sm:block">
                <p className="text-xs font-semibold text-slate-900">{user?.name || 'Admin'}</p>
                <p className="text-xs text-slate-500">{user?.email || 'Admin'}</p>
              </div>
              <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 z-50 mt-2 w-56 origin-top-right overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg"
                >
                  {/* User Info */}
                  <div className="border-b border-slate-100 p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
                        {user?.name?.[0]?.toUpperCase() || 'A'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">{user?.name || 'Admin'}</p>
                        <p className="truncate text-xs text-slate-500">{user?.email || ''}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setDropdownOpen(false)
                        navigate('/settings')
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                    >
                      <UserCircle className="h-4 w-4" />
                      Profile & Settings
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-slate-100 p-2">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  )
})

Header.displayName = 'Header'

export default Header