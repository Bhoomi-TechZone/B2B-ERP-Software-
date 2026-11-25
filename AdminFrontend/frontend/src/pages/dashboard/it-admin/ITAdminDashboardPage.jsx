import { useState, memo } from 'react'
import { motion } from 'motion/react'
import {
  Shield, Server, Users, AlertTriangle, CheckCircle, Clock,
  ArrowRight, ChevronLeft, ChevronRight, Settings, Wifi, Database,
  Lock, Key, RefreshCw, Download, BarChart3, Globe, Folder
} from 'lucide-react'

import { useAuth } from '../../../hooks/useAuth'

const SYSTEM_STATS = {
  uptime: '99.97%', activeUsers: 248, apiRequests: '1.2M',
  storageUsed: '450 GB', storageTotal: '1 TB',
  pendingTickets: 12, resolvedToday: 8, criticalAlerts: 2,
}

const SERVER_STATUS = [
  { name: 'App Server 1', status: 'online', cpu: 45, memory: 62, uptime: '45d 12h' },
  { name: 'App Server 2', status: 'online', cpu: 38, memory: 55, uptime: '45d 12h' },
  { name: 'Database Primary', status: 'online', cpu: 52, memory: 78, uptime: '60d 8h' },
  { name: 'Database Replica', status: 'online', cpu: 35, memory: 45, uptime: '60d 8h' },
  { name: 'Cache Server', status: 'warning', cpu: 78, memory: 85, uptime: '30d 4h' },
]

const RECENT_ACTIVITIES = [
  { id: 1, type: 'deployment', desc: 'Production deployment v2.4.1', time: '2 hours ago', status: 'success' },
  { id: 2, type: 'security', desc: 'Security patch CVE-2026-1234', time: '5 hours ago', status: 'success' },
  { id: 3, type: 'backup', desc: 'Daily database backup completed', time: '8 hours ago', status: 'success' },
  { id: 4, type: 'alert', desc: 'High memory on Cache Server', time: '12 hours ago', status: 'warning' },
  { id: 5, type: 'user', desc: 'New admin user created', time: '1 day ago', status: 'success' },
]

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }
const fadeUp = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }
const spring = { type: 'spring', stiffness: 380, damping: 26 }

const ITAdminDashboardPage = memo(() => {
  const { user } = useAuth()
  const [activityPage, setActivityPage] = useState(0)

  const today = new Date()
  const hour = today.getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

  const PER_PAGE = 3
  const totalActivityPages = Math.ceil(RECENT_ACTIVITIES.length / PER_PAGE)
  const visibleActivities = RECENT_ACTIVITIES.slice(activityPage * PER_PAGE, activityPage * PER_PAGE + PER_PAGE)

  return (
    <div className="h-full overflow-y-auto bg-slate-50">
      <motion.div className="space-y-5 p-6" variants={stagger} initial="hidden" animate="visible">
        
        {/* Greeting Banner */}
        <motion.div variants={fadeUp}
          whileHover={{ scale: 1.005, boxShadow: '0 8px 24px -4px rgb(0 0 0 / 0.10)' }}
          transition={spring}
          className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-linear-to-r from-indigo-50 via-blue-50 to-cyan-50 border border-indigo-200 px-6 py-4 shadow-sm cursor-default">
          <div className="flex items-center gap-4">
            <motion.div whileHover={{ rotate: 8, scale: 1.1 }} transition={spring}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-200 text-lg font-bold text-indigo-800 ring-2 ring-indigo-300">
              IT
            </motion.div>
            <div>
              <p className="text-sm text-slate-500">{greeting},</p>
              <p className="text-xl font-bold text-slate-800">Hi {user?.name?.split(' ')[0] || 'IT Admin'} — System Administration</p>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <motion.div className="text-center" whileHover={{ scale: 1.1 }} transition={spring}>
              <p className="text-xl font-bold text-slate-800">{SYSTEM_STATS.uptime}</p>
              <p className="text-xs text-slate-500">System Uptime</p>
            </motion.div>
            <div className="h-8 w-px bg-slate-300" />
            <motion.div className="text-center" whileHover={{ scale: 1.1 }} transition={spring}>
              <p className="text-xl font-bold text-slate-800">{SYSTEM_STATS.criticalAlerts}</p>
              <p className="text-xs text-slate-500">Critical Alerts</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Stat Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Active Users', value: SYSTEM_STATS.activeUsers, icon: Users, color: 'bg-blue-100 text-blue-600' },
            { label: 'API Requests', value: SYSTEM_STATS.apiRequests, icon: BarChart3, color: 'bg-amber-100 text-amber-600' },
            { label: 'Storage Used', value: SYSTEM_STATS.storageUsed, icon: Folder, color: 'bg-emerald-100 text-emerald-600' },
            { label: 'Pending Tickets', value: SYSTEM_STATS.pendingTickets, icon: AlertTriangle, color: 'bg-rose-100 text-rose-600' },
          ].map((stat, i) => (
            <motion.div key={stat.label} variants={fadeUp}
              whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
              transition={spring}
              className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <motion.div whileHover={{ rotate: -10, scale: 1.15 }} transition={spring}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </motion.div>
                <span className="text-sm font-semibold text-slate-600">{stat.label}</span>
              </div>
              <p className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Server Status + Recent Activities */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Server Status */}
          <motion.div variants={fadeUp}
            whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
            transition={spring}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Server Status</h3>
              <motion.button whileHover={{ x: 3 }} transition={spring} className="text-xs font-semibold text-indigo-600 hover:underline">
                View all <ArrowRight className="inline h-3 w-3" />
              </motion.button>
            </div>
            <div className="space-y-3">
              {SERVER_STATUS.map((server, i) => (
                <motion.div key={server.name}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i, ...spring }}
                  whileHover={{ x: 3 }}
                  className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${server.status === 'online' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                    <div>
                      <p className="text-sm font-bold text-slate-800">{server.name}</p>
                      <p className="text-[11px] text-slate-500">CPU: {server.cpu}% · Memory: {server.memory}%</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${server.status === 'online' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {server.status}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-0.5">{server.uptime}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activities */}
          <motion.div variants={fadeUp}
            whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
            transition={spring}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recent Activities</h3>
                <p className="text-xs text-slate-500">System events</p>
              </div>
              <div className="flex items-center gap-2">
                <motion.button onClick={() => setActivityPage(p => Math.max(0, p - 1))} disabled={activityPage === 0}
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} transition={spring}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40">
                  <ChevronLeft className="h-4 w-4" />
                </motion.button>
                <motion.button onClick={() => setActivityPage(p => Math.min(totalActivityPages - 1, p + 1))} disabled={activityPage === totalActivityPages - 1}
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} transition={spring}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40">
                  <ChevronRight className="h-4 w-4" />
                </motion.button>
              </div>
            </div>
            <div className="space-y-2">
              {visibleActivities.map((activity, i) => (
                <motion.div key={activity.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i, ...spring }}
                  whileHover={{ x: 4, scale: 1.01 }}
                  className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${activity.status === 'success' ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                      {activity.type === 'deployment' ? <Server className={`h-4 w-4 ${activity.status === 'success' ? 'text-emerald-600' : 'text-amber-600'}`} /> :
                       activity.type === 'security' ? <Shield className={`h-4 w-4 ${activity.status === 'success' ? 'text-emerald-600' : 'text-amber-600'}`} /> :
                       activity.type === 'backup' ? <Database className={`h-4 w-4 ${activity.status === 'success' ? 'text-emerald-600' : 'text-amber-600'}`} /> :
                       activity.type === 'alert' ? <AlertTriangle className={`h-4 w-4 ${activity.status === 'success' ? 'text-emerald-600' : 'text-amber-600'}`} /> :
                       <Users className={`h-4 w-4 ${activity.status === 'success' ? 'text-emerald-600' : 'text-amber-600'}`} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{activity.desc}</p>
                      <p className="text-[11px] text-slate-500">{activity.time}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div variants={fadeUp}
          whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
          transition={spring}
          className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-bold text-slate-800">Quick Actions</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'System Settings', icon: Settings, tone: 'bg-indigo-50 text-indigo-700' },
              { label: 'User Management', icon: Users, tone: 'bg-blue-50 text-blue-700' },
              { label: 'Security Audit', icon: Lock, tone: 'bg-emerald-50 text-emerald-700' },
              { label: 'View Logs', icon: Globe, tone: 'bg-amber-50 text-amber-700' },
            ].map((q, i) => (
              <motion.button key={q.label} type="button"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05, ...spring }}
                whileHover={{ y: -3, scale: 1.02 }}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold ${q.tone}`}>
                <q.icon className="h-5 w-5" />
                {q.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

      </motion.div>
    </div>
  )
})

ITAdminDashboardPage.displayName = 'ITAdminDashboardPage'
export default ITAdminDashboardPage
