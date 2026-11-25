import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  AlertTriangle, Clock, CheckCircle, Calendar, ChevronDown, ChevronUp,
  Inbox, Plus, Filter, Layers, RefreshCw, FolderKanban, CheckSquare, ChevronRight, X, Pencil
} from 'lucide-react'
import { PRIORITY_CONFIG, STATUS_CONFIG, PROJECT_STATUS_CONFIG } from './data/mockData'
import TaskDetailModal from './components/TaskDetailModal'
import pmService from '../../services/pmService'
import { useAuth } from '../../hooks/useAuth'

export default function MyTasksPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth?.() || {}
  
  const [activeTab, setActiveTab] = useState(() => {
    return location.pathname === '/projects' ? 'projects' : 'tasks'
  })

  useEffect(() => {
    const tab = location.pathname === '/projects' ? 'projects' : 'tasks'
    setActiveTab(tab)
  }, [location.pathname])
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)
  
  // Filters
  const [filterProject, setFilterProject] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
  // Update project progress
  const [editingProgressProject, setEditingProgressProject] = useState(null)
  const [progressValue, setProgressValue] = useState(0)
  const [savingProgress, setSavingProgress] = useState(false)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const fetchData = async () => {
    try {
      setLoading(true)
      const summary = await pmService.getEmployeeSummary()
      setData(summary)
      setError(null)
    } catch (err) {
      console.error('MyTasksPage: failed to load summary', err)
      setError('Failed to load project and task data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Handle task updates from details modal
  const handleTaskSaved = async () => {
    await fetchData()
  }

  // Filter tasks based on selections
  const filteredTasks = useMemo(() => {
    if (!data?.tasks) return []
    return data.tasks.filter(t => {
      if (filterProject && t.projectId !== filterProject) return false
      if (filterStatus && t.status !== filterStatus) return false
      return true
    })
  }, [data?.tasks, filterProject, filterStatus])

  // Paginated tasks
  const paginatedTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage
    return filteredTasks.slice(startIndex, startIndex + rowsPerPage)
  }, [filteredTasks, currentPage, rowsPerPage])

  const totalPages = Math.max(Math.ceil(filteredTasks.length / rowsPerPage), 1)

  const handlePageChange = (p) => {
    if (p >= 1 && p <= totalPages) {
      setCurrentPage(p)
    }
  }

  const formatCurrency = (val) => {
    if (val === undefined || val === null) return '0'
    return Number(val).toLocaleString('en-IN')
  }

  if (loading && !data) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-sm font-semibold text-slate-500 font-sans">Loading your projects & tasks...</p>
        </div>
      </div>
    )
  }

  const stats = data?.stats || { assignedProjects: 0, myTasks: 0, inProgressTasks: 0, completedTasks: 0, overdueTasks: 0 }
  const projectsList = data?.projects || []
  const members = data?.members || []
  const getMember = (id) => members.find(m => m.id === id || m.id === String(id))

  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 font-sans">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Projects & Tasks</h1>
          <p className="mt-0.5 text-xs font-semibold text-slate-400">
            View your assigned projects, tasks and track your progress
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-none border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition cursor-pointer self-start md:self-auto"
          title="Refresh Data"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation Tabs & Stats Summary Cards */}
      <div className="space-y-6">
        
        {/* Navigation Tabs */}
        <div className="border-b border-slate-100 bg-white px-6 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/projects')}
              className={`flex items-center gap-2 pb-3.5 pt-4 text-xs font-black transition-all relative border-b-2 cursor-pointer ${
                activeTab === 'projects'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-650'
              }`}
            >
              <FolderKanban className="h-4 w-4" />
              My Projects
            </button>
            <button
              onClick={() => navigate('/tasks')}
              className={`flex items-center gap-2 pb-3.5 pt-4 text-xs font-black transition-all relative border-b-2 cursor-pointer ${
                activeTab === 'tasks'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-650'
              }`}
            >
              <CheckSquare className="h-4 w-4" />
              My Tasks
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Card 1: Assigned Projects */}
          <div className="bg-white border border-slate-150 rounded-none p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-2">
              <span className="text-2xl font-black text-slate-900 tracking-tight">{stats.assignedProjects}</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Assigned Projects</span>
              <button 
                onClick={() => navigate('/projects')}
                className="text-[10px] font-black text-blue-650 hover:text-blue-750 flex items-center gap-0.5 cursor-pointer"
              >
                View Details <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-none flex items-center justify-center shrink-0">
              <FolderKanban className="h-5 w-5" />
            </div>
          </div>

          {/* Card 2: My Tasks */}
          <div className="bg-white border border-slate-150 rounded-none p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-2">
              <span className="text-2xl font-black text-slate-900 tracking-tight">{stats.myTasks}</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">My Tasks</span>
              <button 
                onClick={() => navigate('/tasks')}
                className="text-[10px] font-black text-blue-650 hover:text-blue-750 flex items-center gap-0.5 cursor-pointer"
              >
                View Tasks <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            <div className="h-10 w-10 bg-purple-50 text-purple-600 rounded-none flex items-center justify-center shrink-0">
              <CheckSquare className="h-5 w-5" />
            </div>
          </div>

          {/* Card 3: Tasks In Progress */}
          <div className="bg-white border border-slate-150 rounded-none p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-2">
              <span className="text-2xl font-black text-slate-900 tracking-tight">{stats.inProgressTasks}</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Tasks In Progress</span>
              <span className="text-[10px] font-bold text-slate-400 block">Keep Going!</span>
            </div>
            <div className="h-10 w-10 bg-orange-50 text-orange-600 rounded-none flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5" />
            </div>
          </div>

          {/* Card 4: Tasks Completed */}
          <div className="bg-white border border-slate-150 rounded-none p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-2">
              <span className="text-2xl font-black text-slate-900 tracking-tight">{stats.completedTasks}</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Tasks Completed</span>
              <span className="text-[10px] font-bold text-emerald-600 block">Good Job!</span>
            </div>
            <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-none flex items-center justify-center shrink-0">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>

          {/* Card 5: Tasks Overdue */}
          <div className="bg-white border border-slate-150 rounded-none p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-2">
              <span className="text-2xl font-black text-slate-900 tracking-tight">{stats.overdueTasks}</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Tasks Overdue</span>
              <span className="text-[10px] font-bold text-red-500 block">Need Attention</span>
            </div>
            <div className="h-10 w-10 bg-red-50 text-red-600 rounded-none flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>

        </div>

        {/* Tab Content Panels */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">My Assigned Projects</h2>
              <button 
                onClick={() => navigate('/tasks')}
                className="text-xs font-black text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                View All Tasks <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projectsList.map((project) => {
                const statusCfg = PROJECT_STATUS_CONFIG[project.status] || PROJECT_STATUS_CONFIG.Active
                const taskStats = project.taskCounts || { total: 0, todo: 0, in_progress: 0, review: 0, done: 0, overdue: 0 }

                return (
                  <div 
                    key={project.id}
                    className="bg-white border border-slate-150 rounded-none p-5 shadow-xs flex flex-col space-y-4 relative group hover:shadow-md transition"
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-none text-xs font-black text-white ${project.clientColor || 'bg-blue-600'}`}>
                          {project.clientLogo || 'PR'}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-black text-slate-800 tracking-tight truncate">
                            {project.name}
                          </h3>
                          <p className="text-xs font-semibold text-slate-400">{project.client}</p>
                        </div>
                      </div>
                      <span className={`rounded-none px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${statusCfg.badge}`}>
                        {project.status}
                      </span>
                    </div>

                    {/* Middle Details */}
                    <div className="space-y-1.5 text-xs text-slate-500 font-bold">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Project Lead:</span>
                        <span className="text-slate-700">{project.leadName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Timeline:</span>
                        <span className="text-slate-700">
                          {project.startDate || '—'} - {project.endDate || '—'}
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div>
                      <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1 items-center">
                        <span className="flex items-center gap-1.5">
                          Progress
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingProgressProject(project)
                              setProgressValue(project.progress)
                            }}
                            className="text-blue-600 hover:text-blue-700 cursor-pointer p-0.5 rounded hover:bg-slate-100"
                            title="Update Progress"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                        </span>
                        <span className="font-extrabold text-slate-800">{project.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-none bg-slate-100">
                        <div
                          style={{ width: `${project.progress}%` }}
                          className={`h-full rounded-none ${
                            project.progress >= 80 ? 'bg-emerald-500' : 'bg-blue-500'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Task Breakdown Metrics Footer */}
                    <div className="border-t border-slate-100 pt-3 flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-bold text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                        <span>{taskStats.total} Tasks Total</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-orange-500" />
                        <span>{taskStats.in_progress + taskStats.review} In Progress</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span>{taskStats.done} Completed</span>
                      </div>
                      {taskStats.overdue > 0 && (
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-red-500" />
                          <span className="text-red-500 font-black">{taskStats.overdue} Overdue</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}

              {projectsList.length === 0 && (
                <div className="col-span-2 py-16 text-center bg-white border border-slate-150 rounded-none">
                  <Inbox className="mx-auto mb-3 h-12 w-12 text-slate-200" />
                  <p className="text-base font-bold text-slate-500">No projects found</p>
                  <p className="mt-1 text-sm text-slate-400">You are not assigned to any projects at the moment.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="bg-white border border-slate-150 rounded-none p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">My Tasks</h2>
              
              {/* Filters toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-1.5 border px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                    showFilters || filterProject || filterStatus
                      ? 'border-blue-200 bg-blue-50/50 text-blue-600'
                      : 'border-slate-200 bg-white text-slate-650 hover:bg-slate-50'
                  }`}
                >
                  <Filter className="h-3.5 w-3.5" />
                  Filter
                </button>
              </div>
            </div>

            {/* Collapsible Filter Bar */}
            {showFilters && (
              <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-4 border border-slate-150 rounded-none mb-2">
                <div className="flex flex-col space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Project</span>
                  <select 
                    value={filterProject} 
                    onChange={e => {
                      setFilterProject(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="bg-white border border-slate-150 rounded-none px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 cursor-pointer w-48"
                  >
                    <option value="">All Projects</option>
                    {projectsList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                <div className="flex flex-col space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Status</span>
                  <select 
                    value={filterStatus} 
                    onChange={e => {
                      setFilterStatus(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="bg-white border border-slate-150 rounded-none px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 cursor-pointer w-44"
                  >
                    <option value="">All Statuses</option>
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Review">Review</option>
                    <option value="Done">Done</option>
                  </select>
                </div>

                {(filterProject || filterStatus) && (
                  <button 
                    onClick={() => {
                      setFilterProject('')
                      setFilterStatus('')
                      setCurrentPage(1)
                    }}
                    className="self-end border border-red-200 bg-red-50 hover:bg-red-100 px-3 py-2 text-xs font-bold text-red-650 rounded-none transition cursor-pointer"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}

            {/* Tasks Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50/50">
                    <th className="py-3 px-4">Task</th>
                    <th className="py-3 px-4">Project</th>
                    <th className="py-3 px-4">Assigned By</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs font-bold text-slate-700">
                  {paginatedTasks.map((task) => {
                    const isOverdue = task.status !== 'Done' && task.dueDate && task.dueDate < todayStr
                    const priCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.Medium
                    const stsCfg = STATUS_CONFIG[task.status] || STATUS_CONFIG['To Do']

                    return (
                      <tr 
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${
                          isOverdue ? 'bg-red-50/30' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-start gap-2.5">
                            {isOverdue ? (
                              <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                            ) : task.status === 'Done' ? (
                              <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                            ) : (
                              <Clock className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                            )}
                            <div>
                              <span className={`text-slate-800 font-extrabold block ${task.status === 'Done' ? 'line-through text-slate-400' : ''}`}>
                                {task.title}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium block mt-0.5 truncate max-w-md">
                                {task.description?.replace(/<[^>]*>/g, '') || 'No description provided'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-semibold">
                          {task.projectName}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-black text-white ${task.assignedByColor || 'bg-slate-500'}`}>
                              {task.assignedByInitials}
                            </div>
                            <span className="text-slate-700 font-semibold">{task.assignedByName}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`rounded-none px-2 py-0.5 text-[10px] font-bold ${priCfg.badge}`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`rounded-none px-2 py-0.5 text-[10px] font-bold ${stsCfg.badge}`}>
                            {task.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`font-black ${isOverdue ? 'text-red-500' : 'text-slate-500'}`}>
                            {task.dueDate || '—'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <ChevronRight className="h-4 w-4 text-slate-300 hover:text-slate-600 transition" />
                        </td>
                      </tr>
                    )
                  })}

                  {filteredTasks.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold">
                        No tasks found matching current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-[11px] font-bold text-slate-400">
              <span>
                Showing {filteredTasks.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} to {Math.min(currentPage * rowsPerPage, filteredTasks.length)} of {filteredTasks.length} tasks
              </span>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-black uppercase text-slate-400">Rows:</span>
                  <select
                    value={rowsPerPage}
                    onChange={e => {
                      setRowsPerPage(Number(e.target.value))
                      setCurrentPage(1)
                    }}
                    className="bg-slate-50 border border-slate-150 rounded-none px-2 py-1 text-[10px] font-bold text-slate-700 outline-none cursor-pointer"
                  >
                    <option value={5}>5 / page</option>
                    <option value={10}>10 / page</option>
                    <option value={20}>20 / page</option>
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-2 py-1 border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 text-[10px] font-bold transition rounded-none cursor-pointer"
                  >
                    &lt;
                  </button>
                  <span className="px-3 py-1 border border-blue-200 bg-blue-50 text-blue-700 text-[10px] font-black rounded-none">
                    {currentPage}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-2 py-1 border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 text-[10px] font-bold transition rounded-none cursor-pointer"
                  >
                    &gt;
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Task Details Modal */}
      <AnimatePresence>
        {selectedTask && (
          <TaskDetailModal
            task={selectedTask}
            projects={projectsList}
            members={members}
            onClose={() => setSelectedTask(null)}
            onSave={handleTaskSaved}
          />
        )}
      </AnimatePresence>

      {/* Update Progress Modal */}
      <AnimatePresence>
        {editingProgressProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 truncate">
                  Update Progress: {editingProgressProject.name}
                </h3>
                <button
                  onClick={() => setEditingProgressProject(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>Progress Percentage</span>
                  <span className="text-blue-650 font-black text-sm">{progressValue}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progressValue}
                  onChange={(e) => setProgressValue(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-50">
                <button
                  onClick={() => setEditingProgressProject(null)}
                  disabled={savingProgress}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-655 hover:bg-slate-50 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setSavingProgress(true)
                    try {
                      await pmService.updateProject(editingProgressProject.id, {
                        progress: progressValue
                      })
                      setEditingProgressProject(null)
                      await fetchData()
                    } catch (err) {
                      alert("Failed to update progress: " + err.message)
                    } finally {
                      setSavingProgress(false)
                    }
                  }}
                  disabled={savingProgress}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2 text-xs font-bold text-white shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {savingProgress ? 'Saving...' : 'Save Progress'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
