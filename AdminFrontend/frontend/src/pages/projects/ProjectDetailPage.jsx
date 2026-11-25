import { useState, useMemo, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  ArrowLeft, LayoutGrid, List, Users, FileText, Activity,
  AlertTriangle, Plus, Calendar, Upload, Clock, RefreshCw,
  Download, Trash2, CheckCircle2,
} from 'lucide-react'
import {
  PRIORITY_CONFIG, STATUS_CONFIG, PROJECT_STATUS_CONFIG, HEALTH_CONFIG,
} from './data/mockData'
import KanbanBoard from './components/KanbanBoard'
import TaskDetailModal from './components/TaskDetailModal'
import CreateTaskModal from './components/CreateTaskModal'
import pmService from '../../services/pmService'

const spring = { type: 'spring', stiffness: 340, damping: 26 }

const TABS = [
  { id: 'overview', label: 'Overview',  icon: LayoutGrid },
  { id: 'board',    label: 'Board',     icon: LayoutGrid },
  { id: 'list',     label: 'List',      icon: List       },
  { id: 'team',     label: 'Team',      icon: Users      },
  { id: 'files',    label: 'Files',     icon: FileText   },
  { id: 'activity', label: 'Activity',  icon: Activity   },
]

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({ project, tasks, members }) {
  const today    = new Date()
  const getMember = (id) => members.find(m => m.id === id || m.id === String(id))
  const manager  = getMember(project.managerId)
  const teamMembers = (project.team || []).map(id => getMember(id)).filter(Boolean)
  const health   = HEALTH_CONFIG[project.health]  || HEALTH_CONFIG['on-track']
  const stsCfg   = PROJECT_STATUS_CONFIG[project.status] || PROJECT_STATUS_CONFIG.Active
  const daysLeft = project.endDate ? Math.ceil((new Date(project.endDate) - today) / 86400000) : null
  const budgetPct = project.budget > 0 ? Math.round((project.spent / project.budget) * 100) : null

  const statusGroups = ['To Do', 'In Progress', 'Review', 'Done'].map(s => ({
    label: s, count: tasks.filter(t => t.status === s).length,
  }))

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {/* Left: description + progress + task breakdown */}
      <div className="space-y-5 lg:col-span-2">
        {/* Description */}
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
          <h3 className="mb-2 text-sm font-bold text-slate-800">About this project</h3>
          <p className="text-sm text-slate-600 leading-relaxed">{project.description || 'No description provided.'}</p>
          {(project.tags || []).length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {project.tags.map(tag => (
                <span key={tag} className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-600">{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-800">Completion Progress</h3>
            <span className="text-2xl font-extrabold text-blue-600">{project.progress || 0}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${project.progress || 0}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full rounded-full ${(project.progress || 0) >= 80 ? 'bg-emerald-500' : (project.progress || 0) >= 40 ? 'bg-blue-500' : 'bg-amber-500'}`}
            />
          </div>
          <div className="mt-4 grid grid-cols-4 gap-3 text-center">
            {statusGroups.map(sg => {
              const cfg = STATUS_CONFIG[sg.label] || STATUS_CONFIG['To Do']
              return (
                <div key={sg.label} className={`rounded-xl p-3 ${cfg.bg}`}>
                  <p className={`text-2xl font-extrabold ${cfg.color}`}>{sg.count}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{sg.label}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Budget */}
        {budgetPct !== null && (
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
            <h3 className="mb-3 text-sm font-bold text-slate-800">Budget Utilization</h3>
            <div className="flex items-end justify-between mb-2">
              <div>
                <p className="text-2xl font-extrabold text-slate-800">&#8377;{((project.spent || 0) / 1000).toFixed(0)}K</p>
                <p className="text-xs text-slate-400">of &#8377;{(project.budget / 1000).toFixed(0)}K budget</p>
              </div>
              <span className={`text-2xl font-extrabold ${budgetPct > 90 ? 'text-red-500' : 'text-emerald-600'}`}>{budgetPct}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(budgetPct, 100)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`h-full rounded-full ${budgetPct > 90 ? 'bg-red-500' : budgetPct > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Right: meta info */}
      <div className="space-y-4">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
          <h3 className="mb-3 text-sm font-bold text-slate-800">Project Info</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Status</span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${stsCfg.badge}`}>{project.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Health</span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${health.badge}`}>{health.label}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Start Date</span>
              <span className="font-semibold text-slate-700">{project.startDate ? new Date(project.startDate).toLocaleDateString('en-GB') : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">End Date</span>
              <span className={`font-semibold ${daysLeft !== null && daysLeft < 7 && daysLeft > 0 ? 'text-amber-600' : daysLeft !== null && daysLeft <= 0 ? 'text-red-600' : 'text-slate-700'}`}>
                {project.endDate ? new Date(project.endDate).toLocaleDateString('en-GB') : '—'}
                {daysLeft !== null && (daysLeft > 0 ? ` (${daysLeft}d left)` : ' (overdue)')}
              </span>
            </div>
            {manager && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Manager</span>
                <div className="flex items-center gap-1.5">
                  <div className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white ${manager.color}`}>{manager.initials}</div>
                  <span className="font-semibold text-slate-700">{manager.name}</span>
                </div>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Client</span>
              <div className="flex items-center gap-1.5">
                <div className={`flex h-5 w-5 items-center justify-center rounded text-xs font-bold text-white ${project.clientColor || 'bg-slate-500'}`}>{project.clientLogo}</div>
                <span className="font-semibold text-slate-700">{project.client}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
          <h3 className="mb-3 text-sm font-bold text-slate-800">Team ({teamMembers.length})</h3>
          <div className="space-y-2.5">
            {teamMembers.length === 0 ? (
              <p className="text-xs text-slate-400">No team members assigned</p>
            ) : teamMembers.map(m => (
              <div key={m.id} className="flex items-center gap-2.5">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${m.color}`}>{m.initials}</div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">{m.name}</p>
                  <p className="text-xs text-slate-400">{m.title}</p>
                </div>
                {m.id === project.managerId && (
                  <span className="ml-auto rounded-full bg-blue-50 px-1.5 py-0.5 text-xs font-bold text-blue-600">PM</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── List Tab ─────────────────────────────────────────────────────────────────
function ListTab({ tasks, members, onOpenTask, onCreateTask }) {
  const today = new Date()
  const groups = ['To Do', 'In Progress', 'Review', 'Done']
  const getMember = (id) => members.find(m => m.id === id || m.id === String(id))

  return (
    <div className="space-y-4">
      {groups.map(status => {
        const groupTasks = tasks.filter(t => t.status === status)
        const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['To Do']
        return (
          <div key={status} className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5 overflow-hidden">
            <div className={`flex items-center gap-2 border-b border-slate-100 px-5 py-3 ${cfg.bg}`}>
              <span className={`text-sm font-bold ${cfg.color}`}>{status}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${cfg.badge}`}>{groupTasks.length}</span>
            </div>
            {groupTasks.length === 0 ? (
              <div className="px-5 py-4 text-xs text-slate-400">No tasks in this column</div>
            ) : (
              <table className="w-full">
                <tbody>
                  {groupTasks.map(task => {
                    const assignee = getMember(task.assignee)
                    const priCfg   = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.Medium
                    const isOverdue = task.status !== 'Done' && task.dueDate && new Date(task.dueDate) < today
                    return (
                      <tr key={task.id} onClick={() => onOpenTask(task)}
                        className={`group cursor-pointer border-b border-slate-50 last:border-0 hover:bg-slate-50 ${isOverdue ? 'bg-red-50' : ''}`}>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            {isOverdue && <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />}
                            <span className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">{task.title}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`rounded px-2 py-0.5 text-xs font-bold ${priCfg.badge}`}>{task.priority}</span>
                        </td>
                        <td className="px-5 py-3">
                          {assignee && (
                            <div className="flex items-center gap-1.5">
                              <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${assignee.color}`}>{assignee.initials}</div>
                              <span className="text-xs text-slate-500">{assignee.name}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-xs font-semibold ${isOverdue ? 'text-red-600' : 'text-slate-500'}`}>{task.dueDate || '—'}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        )
      })}

      <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
        onClick={() => onCreateTask()}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 py-3 text-sm font-semibold text-slate-400 hover:border-blue-300 hover:text-blue-500 transition-colors">
        <Plus className="h-4 w-4" /> Add Task
      </motion.button>
    </div>
  )
}

// ─── Team Tab ─────────────────────────────────────────────────────────────────
function TeamTab({ project, tasks, members, onOpenTask }) {
  const today = new Date()
  const getMember = (id) => members.find(m => m.id === id || m.id === String(id))
  const teamMembers = (project.team || []).map(id => getMember(id)).filter(Boolean)

  return (
    <div className="space-y-4">
      {teamMembers.length === 0 && (
        <div className="py-12 text-center text-sm text-slate-400">No team members assigned to this project.</div>
      )}
      {teamMembers.map((m, i) => {
        const memberTasks  = tasks.filter(t => t.assignee === m.id || t.assignee === String(m.id))
        const activeTasks  = memberTasks.filter(t => t.status !== 'Done')
        const overdueTasks = activeTasks.filter(t => t.dueDate && new Date(t.dueDate) < today)
        const pct = memberTasks.length > 0 ? Math.round((memberTasks.filter(t => t.status === 'Done').length / memberTasks.length) * 100) : 0

        return (
          <motion.div key={m.id}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, ...spring }}
            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
            <div className="flex items-center gap-3 mb-4">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-extrabold text-white ${m.color}`}>{m.initials}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-slate-800">{m.name}</p>
                  {m.id === project.managerId && <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-600">PM</span>}
                </div>
                <p className="text-xs text-slate-400">{m.title} · {m.dept}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-lg font-extrabold text-slate-800">{pct}%</p>
                <p className="text-xs text-slate-400">done</p>
              </div>
            </div>

            <div className="mb-3">
              <div className="h-1.5 w-full rounded-full bg-slate-100">
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.7, delay: i * 0.06 }}
                  className={`h-full rounded-full ${pct >= 80 ? 'bg-emerald-500' : pct >= 40 ? 'bg-blue-500' : 'bg-amber-400'}`}
                />
              </div>
              <div className="mt-1 flex gap-3 text-xs text-slate-400">
                <span>{activeTasks.length} active</span>
                {overdueTasks.length > 0 && <span className="font-bold text-red-500">{overdueTasks.length} overdue</span>}
                <span>{memberTasks.filter(t => t.status === 'Done').length} done</span>
              </div>
            </div>

            {memberTasks.length > 0 && (
              <div className="space-y-1.5">
                {memberTasks.map(task => {
                  const priCfg  = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.Medium
                  const stsCfg  = STATUS_CONFIG[task.status]     || STATUS_CONFIG['To Do']
                  const isOverdue = task.status !== 'Done' && task.dueDate && new Date(task.dueDate) < today
                  return (
                    <div key={task.id} onClick={() => onOpenTask(task)}
                      className={`flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 transition hover:bg-slate-50 ${isOverdue ? 'bg-red-50' : 'bg-slate-50/50'}`}>
                      {isOverdue && <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-500" />}
                      <span className="flex-1 text-xs font-semibold text-slate-700">{task.title}</span>
                      <span className={`rounded px-1.5 py-0.5 text-xs font-bold ${priCfg.badge}`}>{task.priority?.[0]}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${stsCfg.badge}`}>{task.status}</span>
                      <span className={`text-xs ${isOverdue ? 'font-bold text-red-500' : 'text-slate-400'}`}>{task.dueDate || '—'}</span>
                    </div>
                  )
                })}
              </div>
            )}
            {memberTasks.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-2">No tasks assigned in this project</p>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

// ─── Files Tab ────────────────────────────────────────────────────────────────
function FilesTab({ project, tasks = [], onUpload, onDelete, uploading }) {
  const fileInputRef = useRef(null)

  const projectFiles = (project?.attachments || []).map(f => ({
    ...f,
    source: 'Project',
    canDelete: true,
  }))

  const taskFiles = tasks.flatMap(t => 
    (t.attachments || []).map(f => ({
      ...f,
      source: `Task: ${t.title}`,
      canDelete: false,
    }))
  )

  const allFiles = [...projectFiles, ...taskFiles]

  const formatSize = (bytes) => {
    if (!bytes) return '—'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={onUpload}
      />
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Project Files & Attachments</h3>
          <p className="text-xs text-slate-400 mt-0.5">Documents, assets, and deliverables for this project</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
        >
          <Upload className="h-3.5 w-3.5" />
          {uploading ? 'Uploading...' : 'Upload File'}
        </motion.button>
      </div>

      {allFiles.length === 0 ? (
        <div className="py-16 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 ring-1 ring-slate-200">
            <FileText className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-sm font-semibold text-slate-700">No files uploaded yet</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Upload project briefs, design deliverables, or documents here.</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> Choose a file to upload
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-100">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 font-semibold">File Name</th>
                <th className="px-4 py-3 font-semibold">Origin</th>
                <th className="px-4 py-3 font-semibold">Size</th>
                <th className="px-4 py-3 font-semibold">Uploaded</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {allFiles.map((file, idx) => (
                <tr key={file.id || idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                      <span className="font-semibold text-slate-800 truncate max-w-xs">{file.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${file.source === 'Project' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                      {file.source}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatSize(file.size)}</td>
                  <td className="px-4 py-3 text-slate-500">{file.uploadedAt || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {file.url && (
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                          title="Open/Download"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </a>
                      )}
                      {file.canDelete && (
                        <button
                          onClick={() => onDelete(file.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                          title="Delete File"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Activity Tab ─────────────────────────────────────────────────────────────
function ActivityTab({ project, tasks = [], members = [] }) {
  const getMember = (id) => members.find(m => m.id === id || m.id === String(id))
  
  const activities = []
  
  if (project?.startDate) {
    activities.push({
      id: 'proj-start',
      type: 'project',
      title: `Project "${project.name}" started`,
      date: project.startDate,
      icon: Activity,
      color: 'bg-blue-500'
    })
  }

  tasks.forEach(task => {
    if (task.status === 'Done') {
      const assignee = getMember(task.assignee)
      activities.push({
        id: `task-done-${task.id}`,
        type: 'task',
        title: `Task completed: "${task.title}"`,
        subtitle: assignee ? `By ${assignee.name}` : undefined,
        date: task.dueDate || task.createdAt,
        icon: CheckCircle2,
        color: 'bg-emerald-500'
      })
    } else if (task.status === 'In Progress') {
      activities.push({
        id: `task-prog-${task.id}`,
        type: 'task',
        title: `Task in progress: "${task.title}"`,
        date: task.createdAt,
        icon: Clock,
        color: 'bg-blue-500'
      })
    }
  })

  activities.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-800">Project Activity Timeline</h3>
        <p className="text-xs text-slate-400 mt-0.5">Live milestones and task executions</p>
      </div>

      {activities.length === 0 ? (
        <div className="py-12 text-center text-sm text-slate-400">No activity recorded yet for this project.</div>
      ) : (
        <div className="space-y-4">
          {activities.map((act, index) => {
            const Icon = act.icon
            return (
              <div key={act.id || index} className="flex items-start gap-3">
                <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white ${act.color}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800">{act.title}</p>
                  {act.subtitle && <p className="text-xs text-slate-400">{act.subtitle}</p>}
                </div>
                <div className="text-xs text-slate-400 shrink-0">
                  {act.date ? new Date(act.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'Recent'}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProjectDetailPage() {
  const { id } = useParams()
  const [tab, setTab]             = useState('overview')
  const [loading, setLoading]     = useState(true)
  const [project, setProject]     = useState(null)
  const [tasks, setTasks]         = useState([])
  const [members, setMembers]     = useState([])
  const [projects, setProjects]   = useState([])
  const [selectedTask, setSelectedTask] = useState(null)
  const [showCreate, setShowCreate]     = useState(false)
  const [createStatus, setCreateStatus] = useState('To Do')
  const [uploadingFile, setUploadingFile] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const summary = await pmService.getDashboardSummary()
      const found   = (summary.projects || []).find(p => p.id === id)
      setProject(found || null)
      setTasks((summary.tasks || []).filter(t => t.projectId === id))
      setMembers(summary.members || [])
      setProjects(summary.projects || [])
    } catch (err) {
      console.error('ProjectDetailPage: failed to load', err)
    } finally {
      setLoading(false)
    }
  }

  const handleTaskDrop = async (taskId, colId) => {
    try {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: colId } : t))
      await pmService.updateTaskStatus(taskId, colId)
    } catch (err) {
      console.error('Failed to update task status:', err)
      fetchData()
    }
  }

  const handleUploadProjectFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setUploadingFile(true)
      await pmService.uploadProjectAttachment(id, file)
      await fetchData()
    } catch (err) {
      console.error('Failed to upload project file:', err)
      alert('Failed to upload file: ' + (err.response?.data?.detail || err.message))
    } finally {
      setUploadingFile(false)
      if (e.target) e.target.value = ''
    }
  }

  const handleDeleteProjectFile = async (attId) => {
    if (!confirm('Are you sure you want to delete this attachment?')) return
    try {
      await pmService.deleteProjectAttachment(id, attId)
      await fetchData()
    } catch (err) {
      console.error('Failed to delete file:', err)
      alert('Failed to delete file: ' + (err.response?.data?.detail || err.message))
    }
  }

  useEffect(() => { fetchData() }, [id])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-sm text-slate-500">Loading project...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-bold text-slate-600">Project not found</p>
          <Link to="/projects" className="mt-2 block text-sm text-blue-500 hover:underline">← Back to projects</Link>
        </div>
      </div>
    )
  }

  const health = HEALTH_CONFIG[project.health]  || HEALTH_CONFIG['on-track']
  const stsCfg = PROJECT_STATUS_CONFIG[project.status] || PROJECT_STATUS_CONFIG.Active

  return (
    <div className="min-h-screen bg-slate-50/60 p-6">
      {/* Breadcrumb + header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <Link to="/projects" className="mb-4 flex items-center gap-1.5 text-sm text-slate-400 hover:text-blue-500 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Projects
        </Link>

        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-extrabold text-white ${project.clientColor || 'bg-slate-500'}`}>
              {project.clientLogo}
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">{project.name}</h1>
              <div className="mt-1 flex items-center gap-2 flex-wrap">
                <span className="text-sm text-slate-500">{project.client}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${stsCfg.badge}`}>{project.status}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${health.badge}`}>{health.label}</span>
                {(project.tags || []).map(t => (
                  <span key={t} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{t}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={fetchData}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50">
              <RefreshCw className="h-4 w-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => { setCreateStatus('To Do'); setShowCreate(true) }}
              className="flex shrink-0 items-center gap-1.5 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">
              <Plus className="h-4 w-4" /> Add Task
            </motion.button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="mb-5 flex gap-1 overflow-x-auto rounded-2xl bg-white p-1 shadow-sm ring-1 ring-slate-900/5">
          {TABS.map(t => {
            const Icon = t.icon
            const active = tab === t.id
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`relative flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors ${
                  active ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
                }`}>
                {active && <motion.div layoutId="tab-bg" className="absolute inset-0 rounded-xl bg-blue-50" transition={spring} />}
                <Icon className="relative h-4 w-4" />
                <span className="relative">{t.label}</span>
                {t.id === 'team' && <span className="relative ml-0.5 rounded-full bg-slate-200 px-1.5 py-0.5 text-xs font-bold text-slate-600">{(project.team || []).length}</span>}
                {(t.id === 'board' || t.id === 'list') && <span className="relative ml-0.5 rounded-full bg-slate-200 px-1.5 py-0.5 text-xs font-bold text-slate-600">{tasks.length}</span>}
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div key={tab}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}>
          {tab === 'overview'  && <OverviewTab project={project} tasks={tasks} members={members} />}
          {tab === 'board'     && <KanbanBoard tasks={tasks} members={members} projectId={id} onOpenTask={setSelectedTask} onCreateTask={(status) => { setCreateStatus(status); setShowCreate(true) }} onTaskDrop={handleTaskDrop} />}
          {tab === 'list'      && <ListTab tasks={tasks} members={members} onOpenTask={setSelectedTask} onCreateTask={() => setShowCreate(true)} />}
          {tab === 'team'      && <TeamTab project={project} tasks={tasks} members={members} onOpenTask={setSelectedTask} />}
          {tab === 'files'     && <FilesTab project={project} tasks={tasks} onUpload={handleUploadProjectFile} onDelete={handleDeleteProjectFile} uploading={uploadingFile} />}
          {tab === 'activity'  && <ActivityTab project={project} tasks={tasks} members={members} />}
        </motion.div>
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {selectedTask && (
          <TaskDetailModal
            task={selectedTask}
            projects={projects}
            members={members}
            onClose={() => setSelectedTask(null)}
            onSave={fetchData}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showCreate && (
          <CreateTaskModal
            defaultProjectId={id}
            defaultStatus={createStatus}
            projects={projects}
            members={members}
            onClose={() => setShowCreate(false)}
            onSave={fetchData}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
