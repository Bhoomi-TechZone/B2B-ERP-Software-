import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Link, useNavigate } from 'react-router-dom'
import {
  LayoutGrid, List, Search, Filter, Plus, AlertTriangle, TrendingUp,
  Users, CheckSquare, Clock, ChevronRight, ExternalLink, Pencil,
  CheckCircle2, XCircle,
} from 'lucide-react'

import {
  PRIORITY_CONFIG, STATUS_CONFIG, PROJECT_STATUS_CONFIG, HEALTH_CONFIG,
} from './data/mockData'
import TaskDetailModal from './components/TaskDetailModal'
import CreateTaskModal from './components/CreateTaskModal'
import { CreateProjectModal } from './ProjectListPage'
import pmService from '../../services/pmService'
import { useAuth } from '../../hooks/useAuth'

const spring = { type: 'spring', stiffness: 340, damping: 26 }
const fadeUp  = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.36 } } }

// ─── Safe string helpers ──────────────────────────────────────────────────────
const safeStr = (v) => (v != null ? String(v) : '')
const safeLC  = (v) => safeStr(v).toLowerCase()

// Map form display values → backend enums
const TYPE_MAP = {
  'Client Implementation': 'client_implementation',
  'Internal':              'internal',
  'Product Feature':       'product_feature',
  'Support':               'support',
  'Sales Pursuit':         'sales_pursuit',
}
const STATUS_FORM_MAP = {
  'Not Started': 'not_started',
  'Planning':    'planning',
  'In Progress': 'in_progress',
  'On Hold':     'on_hold',
  'Completed':   'completed',
}
const PRIORITY_MAP = {
  'Low':      'low',
  'Medium':   'medium',
  'High':     'high',
  'Critical': 'critical',
}

// ─── Toast Notification ───────────────────────────────────────────────────────
function Toast({ toasts }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className={`pointer-events-auto flex items-center gap-3 rounded-2xl px-5 py-3.5 shadow-xl ${
              t.type === 'success'
                ? 'bg-emerald-600 text-white'
                : 'bg-red-600 text-white'
            }`}
          >
            {t.type === 'success'
              ? <CheckCircle2 className="h-4 w-4 shrink-0" />
              : <XCircle      className="h-4 w-4 shrink-0" />}
            <p className="text-sm font-semibold">{t.message}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color, delay }) {
  return (
    <motion.div variants={fadeUp} transition={{ delay }}
      className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5"
    >
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className="text-2xl font-extrabold text-slate-900">{value}</p>
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        {sub && <p className={`text-xs ${color.includes('red') ? 'text-red-500' : 'text-slate-400'}`}>{sub}</p>}
      </div>
    </motion.div>
  )
}

// ─── Project Card ─────────────────────────────────────────────────────────────
function ProjectCard({ project, index, getMember, onEdit, canEdit }) {
  const mgr       = getMember(project.managerId)
  const health    = HEALTH_CONFIG[project.health] || HEALTH_CONFIG['on-track']
  const statusCfg = PROJECT_STATUS_CONFIG[project.status] || PROJECT_STATUS_CONFIG.Active
  const teamMembers = project.team.slice(0, 4).map(id => getMember(id)).filter(Boolean)
  const budgetPct = project.budget > 0 ? Math.round((project.spent / project.budget) * 100) : null

  return (
    <motion.div variants={fadeUp} transition={{ delay: index * 0.07 }}
      className="group relative flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5 hover:shadow-md transition-shadow"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold text-white ${project.clientColor}`}>
            {project.clientLogo}
          </div>
          <div className="min-w-0">
            <Link to={`/projects/${project.id}`}
              className="block truncate text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors">
              {project.name}
            </Link>
            <p className="text-xs text-slate-400">{project.client}</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${statusCfg.badge}`}>{project.status}</span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${health.badge}`}>{health.label}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Progress</span>
          <span className="font-bold text-slate-700">{project.progress}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-slate-100">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${project.progress}%` }}
            transition={{ duration: 0.8, delay: index * 0.07, ease: 'easeOut' }}
            className={`h-full rounded-full ${project.progress >= 80 ? 'bg-emerald-500' : project.progress >= 40 ? 'bg-blue-500' : 'bg-amber-500'}`}
          />
        </div>
      </div>

      {/* Task counts */}
      <div className="mt-3 flex gap-3 text-xs text-slate-500">
        {[
          { label: 'To Do',  val: project.taskCounts.todo,       cls: 'text-slate-500' },
          { label: 'Active', val: project.taskCounts.inProgress, cls: 'text-blue-600'  },
          { label: 'Review', val: project.taskCounts.review,     cls: 'text-violet-600'},
          { label: 'Done',   val: project.taskCounts.done,       cls: 'text-emerald-600'},
        ].map(s => (
          <div key={s.label} className="text-center">
            <p className={`font-extrabold text-base ${s.cls}`}>{s.val}</p>
            <p>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Footer: team + budget + due + manager */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center">
          {teamMembers.map((m, i) => (
            <div key={m.id}
              title={m.name}
              style={{ marginLeft: i > 0 ? '-8px' : '0', zIndex: teamMembers.length - i }}
              className={`relative flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ring-2 ring-white ${m.color}`}
            >{m.initials}</div>
          ))}
          {project.team.length > 4 && (
            <div className="relative -ml-2 flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600 ring-2 ring-white">
              +{project.team.length - 4}
            </div>
          )}
        </div>
        <div className="text-right">
          {budgetPct !== null && (
            <p className={`text-xs font-bold ${budgetPct > 90 ? 'text-red-500' : 'text-slate-600'}`}>
              {budgetPct}% budget
            </p>
          )}
          <p className="text-xs text-slate-400">Due {project.endDate}</p>
        </div>
      </div>

      {mgr && (
        <div className="mt-3 flex items-center gap-1.5 border-t border-slate-100 pt-3">
          <div className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white ${mgr.color}`}>{mgr.initials}</div>
          <span className="text-xs text-slate-500">{mgr.name}</span>
          <span className="text-xs text-slate-400">· PM</span>
        </div>
      )}

      <div className="absolute right-3 top-3 flex gap-1.5">
        {canEdit && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(); }}
            title="Edit Project"
            className="flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-700 cursor-pointer shadow-sm"
          >
            <Pencil className="h-3 w-3" /> Edit
          </button>
        )}
        <Link to={`/projects/${project.id}`}
          className="flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-650 hover:bg-slate-200">
          Open <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </motion.div>
  )
}

// ─── Team Workload Panel ──────────────────────────────────────────────────────
function TeamWorkloadPanel({ workloads, onAssignTask }) {
  const maxActive = useMemo(() => {
    return workloads.length > 0 ? Math.max(...workloads.map(w => w.activeTasks), 1) : 1
  }, [workloads])

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800">Team Workload</h3>
        <span className="text-xs text-slate-400">{workloads.length} members</span>
      </div>

      <div className="space-y-3">
        {workloads.map((w, i) => (
          <motion.div key={w.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, ...spring }}
            className="group"
          >
            <div className="flex items-center gap-2.5">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${w.color}`}>
                {w.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="truncate text-xs font-semibold text-slate-700">{w.name}</p>
                  <div className="flex items-center gap-1.5">
                    {w.overdueTasks > 0 && (
                      <motion.span animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}
                        className="rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-bold text-red-600">
                        {w.overdueTasks} overdue
                      </motion.span>
                    )}
                    <span className="text-xs font-bold text-slate-500">{w.activeTasks}</span>
                  </div>
                </div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(w.activeTasks / maxActive) * 100}%` }}
                    transition={{ duration: 0.6, delay: i * 0.04, ease: 'easeOut' }}
                    className={`h-full rounded-full ${
                      w.overdueTasks > 0 ? 'bg-red-500' :
                      w.activeTasks  >= 4 ? 'bg-amber-500' : 'bg-blue-500'
                    }`}
                  />
                </div>
                {w.projects?.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {w.projects.map(p => (
                      <span key={p.id} className={`rounded px-1.5 py-0.5 text-xs font-bold text-white ${p.clientColor}`}>
                        {p.clientLogo}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => onAssignTask(w.id)}
                className="hidden shrink-0 rounded-lg bg-blue-50 px-2 py-1 text-xs font-bold text-blue-600 hover:bg-blue-100 group-hover:block"
              >
                + Assign
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ─── All Tasks Table ──────────────────────────────────────────────────────────
function AllTasksTable({ tasks, projects, members, onOpenTask, onCreateTask }) {
  const [search, setSearch]     = useState('')
  const [filterProject, setFP]  = useState('')
  const [filterAssignee, setFA] = useState('')
  const [filterStatus, setFS]   = useState('')
  const [filterPriority, setFPr]= useState('')

  const today = new Date()
  const getMember = (id) => members.find(m => m.id === id || m.id === String(id))

  const filtered = useMemo(() => {
    return tasks.filter(t => {
      const q = search.toLowerCase()
      if (q && !t.title.toLowerCase().includes(q) && !t.tags?.join(' ').toLowerCase().includes(q)) return false
      if (filterProject  && t.projectId !== filterProject)  return false
      if (filterAssignee && t.assignee  !== filterAssignee) return false
      if (filterStatus   && t.status    !== filterStatus)   return false
      if (filterPriority && t.priority  !== filterPriority) return false
      return true
    })
  }, [tasks, search, filterProject, filterAssignee, filterStatus, filterPriority])

  const hasFilters = search || filterProject || filterAssignee || filterStatus || filterPriority

  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5">
      {/* Table header + filters */}
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-5">
        <h3 className="text-sm font-bold text-slate-800 mr-2">All Tasks</h3>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">{filtered.length}</span>

        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="h-8 w-44 rounded-xl border border-slate-200 pl-8 pr-3 text-xs text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
        </div>

        {/* Filter: Project */}
        <select value={filterProject} onChange={e => setFP(e.target.value)}
          className="h-8 rounded-xl border border-slate-200 px-2 pr-7 text-xs text-slate-700 outline-none focus:border-blue-400">
          <option value="">All Projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.clientLogo} {p.name}</option>)}
        </select>

        {/* Filter: Assignee */}
        <select value={filterAssignee} onChange={e => setFA(e.target.value)}
          className="h-8 rounded-xl border border-slate-200 px-2 pr-7 text-xs text-slate-700 outline-none focus:border-blue-400">
          <option value="">All Members</option>
          {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>

        {/* Filter: Status */}
        <select value={filterStatus} onChange={e => setFS(e.target.value)}
          className="h-8 rounded-xl border border-slate-200 px-2 pr-7 text-xs text-slate-700 outline-none focus:border-blue-400">
          <option value="">All Statuses</option>
          {['To Do','In Progress','Review','Done'].map(s => <option key={s}>{s}</option>)}
        </select>

        {/* Filter: Priority */}
        <select value={filterPriority} onChange={e => setFPr(e.target.value)}
          className="h-8 rounded-xl border border-slate-200 px-2 pr-7 text-xs text-slate-700 outline-none focus:border-blue-400">
          <option value="">All Priorities</option>
          {['Critical','High','Medium','Low'].map(p => <option key={p}>{p}</option>)}
        </select>

        {hasFilters && (
          <button onClick={() => { setSearch(''); setFP(''); setFA(''); setFS(''); setFPr('') }}
            className="h-8 rounded-xl border border-red-200 bg-red-50 px-3 text-xs font-bold text-red-600 hover:bg-red-100">
            Clear filters
          </button>
        )}

        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={onCreateTask}
          className="ml-auto flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700">
          <Plus className="h-3.5 w-3.5" /> New Task
        </motion.button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 text-left">
              {['Task', 'Project', 'Assignee', 'Priority', 'Status', 'Due Date', ''].map(h => (
                <th key={h} className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filtered.map((task, i) => {
                const assignee  = getMember(task.assignee)
                const project   = projects.find(p => p.id === task.projectId)
                const priCfg    = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.Medium
                const stsCfg    = STATUS_CONFIG[task.status]     || STATUS_CONFIG['To Do']
                const isOverdue = task.status !== 'Done' && new Date(task.dueDate) < today

                return (
                  <motion.tr key={task.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.02 }}
                    onClick={() => onOpenTask(task)}
                    className={`group cursor-pointer border-b border-slate-50 transition hover:bg-slate-50 ${isOverdue ? 'bg-red-50' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {isOverdue && <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-500" />}
                        <div>
                          <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">{task.title}</p>
                          {task.tags?.length > 0 && (
                            <div className="mt-0.5 flex gap-1">
                              {task.tags.slice(0, 2).map(tag => (
                                <span key={tag} className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">{tag}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {project && (
                        <div className="flex items-center gap-1.5">
                          <div className={`flex h-5 w-5 items-center justify-center rounded text-xs font-bold text-white ${project.clientColor}`}>
                            {project.clientLogo}
                          </div>
                          <span className="text-xs text-slate-600 truncate max-w-28">{project.name}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {assignee && (
                        <div className="flex items-center gap-1.5">
                          <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${assignee.color}`}>
                            {assignee.initials}
                          </div>
                          <span className="text-xs text-slate-600">{assignee.name}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${priCfg.badge}`}>{task.priority}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${stsCfg.badge}`}>{task.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold ${isOverdue ? 'text-red-600' : 'text-slate-600'}`}>
                        {task.dueDate}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                    </td>
                  </motion.tr>
                )
              })}
            </AnimatePresence>
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <Filter className="mx-auto mb-2 h-8 w-8 text-slate-300" />
            <p className="text-sm font-semibold text-slate-400">No tasks match your filters</p>
            <button onClick={() => { setSearch(''); setFP(''); setFA(''); setFS(''); setFPr('') }}
              className="mt-2 text-xs text-blue-500 hover:underline">Clear all filters</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main ProjectsDashboard ───────────────────────────────────────────────────
export default function ProjectsDashboard() {
  const navigate = useNavigate()
  const { role } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [stats, setStats] = useState({ activeProjects: 0, openTasks: 0, overdueTasks: 0, totalMembers: 0 })
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [workloads, setWorkloads] = useState([])
  const [members, setMembers] = useState([])
  
  const [selectedTask, setSelectedTask]     = useState(null)
  const [showCreateModal, setShowCreate]    = useState(false)
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [defaultAssignee, setDefaultAssignee] = useState('')
  const [toasts, setToasts] = useState([])

  const showToast = (message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }

  const getMember = (id) => members.find(m => m.id === id || m.id === String(id))

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const data = await pmService.getDashboardSummary()
      setStats(data.stats)
      setProjects(data.projects || [])
      setTasks(data.tasks || [])
      setWorkloads(data.workloads || [])
      setMembers(data.members || [])
      setError(null)
    } catch (err) {
      console.error('Failed to load PM Command Center data:', err)
      setError(err.message || 'Failed to load PM dashboard statistics.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleTaskSaved = async () => {
    await fetchDashboardData()
  }

  function handleAssignToMember(memberId) {
    setDefaultAssignee(memberId)
    setShowCreate(true)
  }

  if (loading && projects.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-sm font-semibold text-slate-500 font-sans">Loading projects command center...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/60 p-6">
      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Project &amp; Task Command Center</h1>
          <p className="mt-0.5 text-sm text-slate-500">Admin view · All projects, team workload, full task board</p>
        </div>
        <div className="flex gap-3">
          <motion.button whileHover={{ scale: 1.03, boxShadow: '0 8px 24px -4px rgb(37 99 235/.35)' }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowCreateProject(true)}
            className="flex items-center gap-2 rounded-2xl border border-blue-200 bg-white px-5 py-2.5 text-sm font-bold text-blue-600 hover:bg-blue-50"
          >
            <Plus className="h-4 w-4" /> New Project
          </motion.button>
          <motion.button whileHover={{ scale: 1.03, boxShadow: '0 8px 24px -4px rgb(37 99 235/.35)' }} whileTap={{ scale: 0.97 }}
            onClick={() => { setDefaultAssignee(''); setShowCreate(true) }}
            className="flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> Create Task
          </motion.button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
        className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        <StatCard icon={LayoutGrid}  label="Active Projects"   value={stats.activeProjects} color="bg-blue-500"    delay={0}    />
        <StatCard icon={CheckSquare} label="Open Tasks"        value={stats.openTasks}      color="bg-violet-500"  delay={0.07} />
        <StatCard icon={AlertTriangle} label="Overdue Tasks"   value={stats.overdueTasks}
          sub={stats.overdueTasks > 0 ? 'Needs attention' : 'All on track'}
          color={stats.overdueTasks > 0 ? 'bg-red-500' : 'bg-emerald-500'} delay={0.14} />
        <StatCard icon={Users}       label="Team Members"      value={stats.totalMembers}   color="bg-rose-500"    delay={0.21} />
      </motion.div>

      {/* Project cards + workload panel */}
      <div className="mb-6 grid gap-5 lg:grid-cols-3">
        {/* Project grid — takes 2/3 */}
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-700">Projects ({projects.length})</h2>
            <div className="flex gap-2 text-xs text-slate-500">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span>{projects.filter(p => p.health === 'on-track').length} on track</span>
              <span className="text-amber-500">{projects.filter(p => p.health === 'at-risk').length} at risk</span>
              <span className="text-red-500">{projects.filter(p => p.health === 'blocked').length} blocked</span>
            </div>
          </div>
          <motion.div initial="hidden" animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
            className="grid gap-4 sm:grid-cols-2"
          >
            {projects.map((p, i) => (
              <ProjectCard 
                key={p.id} 
                project={p} 
                index={i} 
                getMember={getMember} 
                onEdit={() => setEditingProject(p)}
                canEdit={true}
              />
            ))}
          </motion.div>
        </div>

        {/* Workload panel — takes 1/3 */}
        <div className="lg:col-span-1">
          <div className="mb-3">
            <h2 className="text-sm font-bold text-slate-700">Team Workload Matrix</h2>
            <p className="text-xs text-slate-400">Click + Assign to create a task for that member</p>
          </div>
          <TeamWorkloadPanel workloads={workloads} onAssignTask={handleAssignToMember} />
        </div>
      </div>

      {/* All tasks table */}
      <AllTasksTable tasks={tasks} projects={projects} members={members} onOpenTask={setSelectedTask} onCreateTask={() => { setDefaultAssignee(''); setShowCreate(true) }} />

      {/* Modals */}
      <AnimatePresence>
        {selectedTask && <TaskDetailModal task={selectedTask} projects={projects} members={members} onClose={() => setSelectedTask(null)} onSave={handleTaskSaved} />}
      </AnimatePresence>
      <AnimatePresence>
        {showCreateModal && (
          <CreateTaskModal
            onClose={() => { setShowCreate(false); setDefaultAssignee('') }}
            defaultAssignee={defaultAssignee}
            projects={projects}
            members={members}
            onSave={handleTaskSaved}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCreateProject && (
          <CreateProjectModal
            members={members}
            onClose={() => setShowCreateProject(false)}
            onSave={async (formData) => {
              try {
                await pmService.createProject({
                  name: safeStr(formData.name),
                  type: TYPE_MAP[formData.type] || safeLC(formData.type).replace(/ /g, '_') || 'internal',
                  client_tenant_id: null,
                  department: safeStr(formData.department),
                  priority: PRIORITY_MAP[formData.priority] || safeLC(formData.priority) || 'medium',
                  start_date: formData.startDate ? new Date(formData.startDate).toISOString() : null,
                  end_date: formData.endDate ? new Date(formData.endDate).toISOString() : null,
                  budget: formData.budget ? parseFloat(formData.budget) : 0,
                  currency: 'INR',
                  description_html: safeStr(formData.description),
                  tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
                  lead_id: formData.leadId,
                  team_members: formData.team,
                  client: formData.client || (formData.type !== 'Client Implementation' ? 'Internal' : ''),
                })
                showToast('Project created successfully!')
                await fetchDashboardData()
              } catch (err) {
                showToast('Failed to create project: ' + (err.message || 'Unknown error'), 'error')
              }
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingProject && (
          <CreateProjectModal
            project={editingProject}
            members={members}
            onClose={() => setEditingProject(null)}
            onSave={async (formData) => {
              try {
                // Sanitize lead_id — must be a valid UUID string or null
                const leadId = formData.leadId && formData.leadId.trim() !== '' ? formData.leadId : null
                // Sanitize team_members — filter out any empty strings
                const teamMembers = (formData.team || []).filter(id => id && String(id).trim() !== '')

                await pmService.updateProject(editingProject.id, {
                  name:             safeStr(formData.name),
                  type:             TYPE_MAP[formData.type] || safeLC(formData.type).replace(/ /g, '_') || 'internal',
                  department:       safeStr(formData.department) || null,
                  priority:         PRIORITY_MAP[formData.priority] || safeLC(formData.priority) || 'medium',
                  status:           STATUS_FORM_MAP[formData.status] || safeLC(formData.status).replace(/ /g, '_') || 'not_started',
                  start_date:       formData.startDate ? new Date(formData.startDate).toISOString() : null,
                  end_date:         formData.endDate   ? new Date(formData.endDate).toISOString()   : null,
                  budget:           formData.budget    ? parseFloat(formData.budget)                 : null,
                  description_html: safeStr(formData.description) || null,
                  tags:             formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
                  lead_id:          leadId,
                  team_members:     teamMembers,
                  client:           formData.client || (formData.type !== 'Client Implementation' ? 'Internal' : ''),
                })
                showToast('Project updated successfully!')
                setEditingProject(null)
                await fetchDashboardData()
              } catch (err) {
                showToast('Failed to update project: ' + (err.message || 'Something went wrong'), 'error')
              }
            }}
          />
        )}
      </AnimatePresence>

      <Toast toasts={toasts} />
    </div>
  )
}
