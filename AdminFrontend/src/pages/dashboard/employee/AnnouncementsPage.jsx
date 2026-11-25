import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Megaphone, CalendarCheck, Star, CalendarDays,
  Search, Bell, MoreVertical, FileText, Users, User,
  Leaf, ChevronLeft, ChevronRight, Loader2, AlertTriangle,
  Plus, X
} from 'lucide-react'
import announcementService from '../../../services/announcementService'
import { useAuth } from '../../../hooks/useAuth'

export default function AnnouncementsPage() {
  const { user, role } = useAuth()
  const [data, setData] = useState({ stats: null, announcements: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [filter, setFilter] = useState('All') // All, Important, General, HR Updates
  const [sort, setSort] = useState('Latest First') // Latest First, Oldest First
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const itemsPerPage = 5

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    type: 'general', // general, important, hr_updates
    content: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [activeMenuId, setActiveMenuId] = useState(null)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault()
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
      alert("Please fill in all fields.")
      return
    }
    try {
      setSubmitting(true)
      await announcementService.createAnnouncement(newAnnouncement)
      setIsModalOpen(false)
      setNewAnnouncement({ title: '', type: 'general', content: '' })
      await fetchAnnouncements()
    } catch (err) {
      console.error(err)
      alert("Failed to create announcement.")
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    fetchAnnouncements()
    
    const handleOutsideClick = () => {
      setActiveMenuId(null)
    }
    document.addEventListener('click', handleOutsideClick)
    return () => document.removeEventListener('click', handleOutsideClick)
  }, [])

  const fetchAnnouncements = async () => {
    try {
      setLoading(true)
      const res = await announcementService.getAnnouncements()
      setData(res)
    } catch (err) {
      console.error(err)
      setError("Failed to fetch announcements.")
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id, isRead) => {
    if (isRead) return
    try {
      await announcementService.markAsRead(id)
      setData(prev => ({
        ...prev,
        stats: {
           ...prev.stats,
           unread: Math.max(0, prev.stats.unread - 1)
        },
        announcements: prev.announcements.map(a => a.id === id ? { ...a, is_read: true } : a)
      }))
    } catch (err) {
      console.error("Failed to mark as read", err)
    }
  }

  // Derived styling helpers
  const getBadgeType = (type) => {
    const t = type?.toLowerCase() || 'general'
    if (t === 'important') return { text: 'IMPORTANT', color: 'text-red-500', border: 'border-l-red-500', bg: 'bg-red-50', icon: FileText }
    if (t === 'hr_updates' || t === 'hr updates') return { text: 'HR UPDATES', color: 'text-purple-500', border: 'border-l-purple-500', bg: 'bg-purple-50', icon: Users }
    return { text: 'GENERAL', color: 'text-blue-500', border: 'border-l-blue-500', bg: 'bg-blue-50', icon: Megaphone } // Green fallback for general handled dynamically if needed
  }

  // Formatting date natively
  const formatDate = (isoStr) => {
    try {
      const date = new Date(isoStr)
      return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(date)
    } catch (e) {
      return isoStr
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50">
        <div className="text-center text-slate-500">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600 mb-2" />
          <p>Loading announcements...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-slate-50">
        <AlertTriangle className="h-10 w-10 text-red-500 mb-3" />
        <h3 className="text-lg font-bold text-slate-800">Oops!</h3>
        <p className="text-sm text-slate-500 mb-4">{error}</p>
        <button onClick={fetchAnnouncements} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
          Try Again
        </button>
      </div>
    )
  }

  const { stats, announcements } = data

  // Filter & Sort
  let displayList = announcements.filter(a => {
    if (filter !== 'All') {
      const t = a.type?.toLowerCase() || ''
      if (filter === 'Important' && t !== 'important') return false
      if (filter === 'General' && t !== 'general') return false
      if (filter === 'HR Updates' && t !== 'hr_updates') return false
    }
    if (search) {
      if (!a.title.toLowerCase().includes(search.toLowerCase()) && !a.content.toLowerCase().includes(search.toLowerCase())) return false
    }
    return true
  })

  displayList.sort((a, b) => {
    const d1 = new Date(a.created_at).getTime()
    const d2 = new Date(b.created_at).getTime()
    return sort === 'Latest First' ? d2 - d1 : d1 - d2
  })

  const totalPages = Math.ceil(displayList.length / itemsPerPage)
  const paginatedList = displayList.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  return (
    <div className="flex h-full flex-col bg-slate-50 overflow-hidden">
      {/* Top Header Row (Mimicking the top bar from screenshot) */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 shrink-0">
        <h1 className="text-xl font-bold text-slate-900">Announcements</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
          {role !== 'employee' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-full text-sm font-bold transition shadow-md shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>New Announcement</span>
            </button>
          )}
          <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition">
            <Bell className="h-5 w-5" />
            {stats?.unread > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            )}
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white shadow-sm">
              {user?.name ? user.name.substring(0, 2).toUpperCase() : 'ME'}
            </div>
            <div className="hidden flex-col sm:flex">
              <span className="text-sm font-bold text-slate-800 leading-tight">{user?.name || 'Employee'}</span>
              <span className="text-[10px] text-slate-500 leading-tight">Employee</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Title Section */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Announcements</h2>
          <p className="text-sm text-slate-500 mt-1">Stay updated with the latest company news and important information.</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-50">
              <Megaphone className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Total Announcements</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-black text-slate-900">{stats?.total || 0}</p>
              </div>
              <p className="text-[11px] text-slate-400">All time</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
              <CalendarCheck className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Unread</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-black text-slate-900">{stats?.unread || 0}</p>
              </div>
              <p className="text-[11px] text-slate-400">New updates</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50">
              <Star className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Important</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-black text-slate-900">{stats?.important || 0}</p>
              </div>
              <p className="text-[11px] text-slate-400">High priority</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50">
              <CalendarDays className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">This Week</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-black text-slate-900">{stats?.this_week || 0}</p>
              </div>
              <p className="text-[11px] text-slate-400">New this week</p>
            </div>
          </div>
        </div>

        {/* Filters & Sorting */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-b border-slate-200">
          <div className="flex items-center gap-2">
            {['All', 'Important', 'General', 'HR Updates'].map(f => (
              <button
                key={f}
                onClick={() => { setFilter(f); setPage(1); }}
                className={`px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2 transition-all ${
                  filter === f ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {f === 'Important' && <Star className="h-3.5 w-3.5" />}
                {f === 'General' && <Megaphone className="h-3.5 w-3.5" />}
                {f === 'HR Updates' && <Users className="h-3.5 w-3.5" />}
                {f === 'All' && <div className="grid grid-cols-2 gap-0.5"><span className="h-1 w-1 bg-current rounded-sm"></span><span className="h-1 w-1 bg-current rounded-sm"></span><span className="h-1 w-1 bg-current rounded-sm"></span><span className="h-1 w-1 bg-current rounded-sm"></span></div>}
                {f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-500">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-white border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-3 py-1.5 font-semibold shadow-sm outline-none cursor-pointer"
            >
              <option value="Latest First">Latest First</option>
              <option value="Oldest First">Oldest First</option>
            </select>
          </div>
        </div>

        {/* List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {paginatedList.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10 text-slate-500">
                No announcements found.
              </motion.div>
            )}
            {paginatedList.map((ann, i) => {
              const meta = getBadgeType(ann.type)
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  key={ann.id}
                  onClick={() => handleMarkAsRead(ann.id, ann.is_read)}
                  className={`relative flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4 ${meta.border}`}
                >
                  {/* Left Icon Area */}
                  <div className="flex flex-col items-center shrink-0 w-24">
                    <span className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${meta.color}`}>{meta.text}</span>
                    <div className={`flex h-14 w-14 items-center justify-center rounded-full ${meta.bg}`}>
                      <meta.icon className={`h-6 w-6 ${meta.color}`} />
                    </div>
                  </div>

                  {/* Body Area */}
                  <div className="flex-1 min-w-0 pr-4 mt-2">
                    <h3 className="text-base font-bold text-slate-900 leading-tight">{ann.title}</h3>
                    <p className="mt-1 text-sm text-slate-600 line-clamp-2">{ann.content}</p>
                    <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                      <User className="h-3.5 w-3.5 shrink-0" />
                      <span>{ann.author_name || 'Admin'}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300 mx-1"></span>
                      <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                      <span>{formatDate(ann.created_at)}</span>
                    </div>
                  </div>

                  {/* Right Actions Area */}
                  <div className="flex flex-col items-end justify-between self-stretch shrink-0 w-24">
                    <div className="flex items-center gap-2 mt-2">
                      {ann.is_read ? (
                         <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Read</span>
                      ) : (
                         <span className={`text-[10px] font-bold ${meta.color} ${meta.bg} px-2 py-1 rounded-md ring-1 ring-inset ${meta.color.replace('text', 'ring').replace('500', '200')}`}>New</span>
                      )}
                      <div className="relative">
                        <button
                          className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-md transition"
                          onClick={(e) => {
                            e.stopPropagation()
                            setActiveMenuId(activeMenuId === ann.id ? null : ann.id)
                          }}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {activeMenuId === ann.id && (
                          <div className="absolute right-0 mt-1 w-32 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20 border border-slate-100 py-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedAnnouncement(ann)
                                setIsDetailModalOpen(true)
                                setActiveMenuId(null)
                              }}
                              className="flex w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                            >
                              View Details
                            </button>
                            {!ann.is_read && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleMarkAsRead(ann.id, ann.is_read)
                                  setActiveMenuId(null)
                                }}
                                className="flex w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 border-t border-slate-50 transition"
                              >
                                Mark as Read
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`flex h-8 w-8 items-center justify-center rounded-md text-sm font-semibold transition ${
                  page === i + 1 ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isDetailModalOpen && selectedAnnouncement && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDetailModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl z-10"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${getBadgeType(selectedAnnouncement.type).bg} ${getBadgeType(selectedAnnouncement.type).color}`}>
                    {getBadgeType(selectedAnnouncement.type).text}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">Announcement Details</h3>
                </div>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 space-y-4">
                <h4 className="text-xl font-extrabold text-slate-900 leading-tight">
                  {selectedAnnouncement.title}
                </h4>
                
                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium pb-2 border-b border-slate-100">
                  <User className="h-3.5 w-3.5 shrink-0" />
                  <span>{selectedAnnouncement.author_name || 'Admin'}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300 mx-1"></span>
                  <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                  <span>{formatDate(selectedAnnouncement.created_at)}</span>
                </div>

                <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap max-h-[60vh] overflow-y-auto pr-1">
                  {selectedAnnouncement.content}
                </div>
              </div>

              <div className="flex justify-end pt-4 mt-6 border-t border-slate-100">
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition shadow-md"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl z-10"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-900">Create New Announcement</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateAnnouncement} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter announcement title..."
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Type
                  </label>
                  <select
                    value={newAnnouncement.type}
                    onChange={(e) => setNewAnnouncement(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all cursor-pointer bg-white"
                  >
                    <option value="general">General</option>
                    <option value="important">Important</option>
                    <option value="hr_updates">HR Updates</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Content
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={newAnnouncement.content}
                    onChange={(e) => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Write details of the announcement here..."
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-bold transition shadow-md disabled:opacity-50"
                  >
                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    <span>Post Announcement</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
