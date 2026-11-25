import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { CheckCircle2, AlertTriangle, Clock, XCircle, FileText, Bell, Check, Trash2 } from 'lucide-react'

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('All')
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Your leave request for 12 June 2026 has been approved.',
      time: '10:30 AM',
      date: 'Today',
      type: 'Leave',
      status: 'success',
      read: false
    },
    {
      id: 2,
      title: 'You have a missing check-out on 02 June 2026.',
      time: 'Yesterday',
      date: 'Yesterday',
      type: 'Attendance',
      status: 'warning',
      read: false
    },
    {
      id: 3,
      title: 'Regularization request for 20 May 2026 is under review.',
      time: '03 Jun 2026',
      date: '03 Jun 2026',
      type: 'Requests',
      status: 'info',
      read: true
    },
    {
      id: 4,
      title: 'Your leave request for 25 May 2026 has been rejected.',
      time: '02 Jun 2026',
      date: '02 Jun 2026',
      type: 'Leave',
      status: 'error',
      read: true
    },
    {
      id: 5,
      title: 'Monthly attendance report for May 2026 is new available.',
      time: '01 Jun 2026',
      date: '01 Jun 2026',
      type: 'Attendance',
      status: 'doc',
      read: true
    },
    {
      id: 6,
      title: 'Your regularization request for 20 May 2026 has been approved.',
      time: '30 May 2026',
      date: '30 May 2026',
      type: 'Requests',
      status: 'success',
      read: true
    },
    {
      id: 7,
      title: "Don't forget to mark your attendance.",
      time: '29 May 2026',
      date: '29 May 2026',
      type: 'Attendance',
      status: 'alert',
      read: true
    }
  ])

  const tabs = ['All', 'Attendance', 'Leave', 'Requests']

  const filtered = useMemo(() => {
    if (activeTab === 'All') return notifications
    return notifications.filter(n => n.type === activeTab)
  }, [notifications, activeTab])

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const toggleRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n))
  }

  return (
    <div className="min-h-full bg-slate-50/50 p-6">
      <div className="mx-auto max-w-4xl space-y-6">

        {/* Breadcrumb */}
        <div className="text-xs text-slate-500">
          <span>Dashboard</span> <span className="mx-1">/</span> <span className="text-slate-800 font-semibold">Notifications</span>
        </div>

        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-850 flex items-center gap-2">
            <Bell className="h-6 w-6 text-violet-600" />
            Notifications
          </h2>
          {notifications.some(n => !n.read) && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs font-semibold text-slate-650 hover:bg-slate-50 transition cursor-pointer"
            >
              <Check className="h-3.5 w-3.5 text-green-600" />
              Mark all as read
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          
          {/* Tabs header */}
          <div className="flex border-b border-slate-100 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 px-6 text-sm font-bold border-b-2 cursor-pointer transition-all ${
                  activeTab === tab
                    ? 'border-violet-650 text-violet-650'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {filtered.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <Bell className="h-10 w-10 mx-auto text-slate-200 mb-2" />
                  <p className="text-sm font-medium">No notifications in this category</p>
                </div>
              ) : (
                filtered.map((item) => {
                  const iconStyle = 
                    item.status === 'success' ? { bg: 'bg-green-50', text: 'text-green-600', icon: CheckCircle2 } :
                    item.status === 'warning' ? { bg: 'bg-orange-50', text: 'text-orange-500', icon: AlertTriangle } :
                    item.status === 'error' ? { bg: 'bg-red-50', text: 'text-red-500', icon: XCircle } :
                    item.status === 'info' ? { bg: 'bg-purple-50', text: 'text-purple-500', icon: Clock } :
                    item.status === 'doc' ? { bg: 'bg-blue-50', text: 'text-blue-500', icon: FileText } :
                    { bg: 'bg-amber-50', text: 'text-amber-500', icon: AlertTriangle }

                  const Icon = iconStyle.icon

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all hover:bg-slate-50/50 ${
                        item.read 
                          ? 'bg-white border-slate-100' 
                          : 'bg-violet-50/20 border-violet-100/40 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${iconStyle.bg} ${iconStyle.text}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm ${item.read ? 'text-slate-650' : 'text-slate-800 font-semibold'}`}>
                            {item.title}
                          </p>
                          <p className="text-xs text-slate-400 font-medium mt-1">
                            {item.time}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 opacity-60 hover:opacity-100">
                        <button
                          onClick={() => toggleRead(item.id)}
                          title={item.read ? 'Mark as unread' : 'Mark as read'}
                          className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                        >
                          <Check className={`h-4 w-4 ${item.read ? 'text-slate-300' : 'text-green-600'}`} />
                        </button>
                        <button
                          onClick={() => deleteNotification(item.id)}
                          title="Delete notification"
                          className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </motion.div>
          </AnimatePresence>

        </div>

      </div>
    </div>
  )
}
