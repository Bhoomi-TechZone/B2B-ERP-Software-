import { useState, useEffect, memo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, Calendar, MessageSquare, AlertCircle } from 'lucide-react'
import { PRIORITY_CONFIG } from '../data/mockData'

const spring = { type: 'spring', stiffness: 350, damping: 28 }

const COLUMNS = [
  { id: 'To Do',       label: 'To Do',       color: 'bg-slate-400',   headerBg: 'bg-slate-50',   border: 'border-slate-200'  },
  { id: 'In Progress', label: 'In Progress', color: 'bg-blue-500',    headerBg: 'bg-blue-50',    border: 'border-blue-200'   },
  { id: 'Review',      label: 'Review',      color: 'bg-violet-500',  headerBg: 'bg-violet-50',  border: 'border-violet-200' },
  { id: 'Done',        label: 'Done',        color: 'bg-emerald-500', headerBg: 'bg-emerald-50', border: 'border-emerald-200'},
]

// ─── Task Card ────────────────────────────────────────────────────────────────
function TaskCard({ task, onClick, members = [] }) {
  const priCfg    = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.Medium
  const assignee  = members.find(m => m.id === task.assignee || m.id === String(task.assignee))
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.88, y: -12 }}
      whileHover={{ y: -3, boxShadow: '0 8px 24px -6px rgb(0 0 0 / 0.12)' }}
      whileTap={{ scale: 0.97 }}
      transition={spring}
      onClick={() => onClick(task)}
      className={`cursor-pointer rounded-xl border bg-white p-3.5 shadow-sm ${
        isOverdue ? 'border-red-200 ring-1 ring-red-100' : 'border-slate-100'
      }`}
    >
      {/* Priority + overdue */}
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${priCfg.badge}`}>{task.priority}</span>
        {isOverdue && (
          <motion.span
            animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }}
            className="flex items-center gap-0.5 rounded-md bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600"
          >
            <AlertCircle className="h-2.5 w-2.5" /> Overdue
          </motion.span>
        )}
        {(task.tags ?? []).slice(0, 2).map(t => (
          <span key={t} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{t}</span>
        ))}
      </div>

      {/* Title */}
      <p className="mb-3 text-sm font-semibold leading-snug text-slate-800">{task.title}</p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-1 text-xs font-medium ${isOverdue ? 'text-red-500' : 'text-slate-400'}`}>
          <Calendar className="h-3 w-3" />
          {new Date(task.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
        </div>
        <div className="flex items-center gap-2">
          {assignee && (
            <motion.div
              whileHover={{ scale: 1.15 }} transition={spring}
              title={assignee.name}
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm ${assignee.color}`}
            >
              {assignee.initials}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Column ───────────────────────────────────────────────────────────────────
function KanbanColumn({ column, tasks, members, onCardClick, isDraggedOver, onDragOver, onDragLeave, onRealDrop, onAddTask }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: COLUMNS.findIndex(c => c.id === column.id) * 0.07 }}
      onDragOver={e => { e.preventDefault(); onDragOver(column.id) }}
      onDragLeave={onDragLeave}
      onDrop={e => onRealDrop(e, column.id)}
      className={`flex flex-col rounded-2xl border bg-slate-50 transition-all ${column.border} ${
        isDraggedOver ? 'ring-2 ring-blue-400 ring-offset-1 bg-blue-50/40' : ''
      }`}
      style={{ minWidth: '260px', flex: '1 1 0' }}
    >
      {/* Column header */}
      <div className={`flex items-center justify-between rounded-t-2xl px-4 py-3 ${column.headerBg}`}>
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${column.color}`} />
          <span className="text-sm font-bold text-slate-700">{column.label}</span>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-600 shadow-sm">
            {tasks.length}
          </span>
        </div>
        <motion.button
          whileHover={{ scale: 1.15, rotate: 90 }} whileTap={{ scale: 0.9 }} transition={spring}
          onClick={() => onAddTask(column.id)}
          title={`Add task to ${column.label}`}
          className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 hover:bg-white hover:text-blue-600"
        >
          <Plus className="h-3.5 w-3.5" />
        </motion.button>
      </div>

      {/* Cards */}
      <div className="flex flex-1 flex-col gap-2.5 p-3" style={{ minHeight: '200px' }}>
        <AnimatePresence>
          {tasks.map(task => (
            <div key={task.id} draggable onDragStart={e => e.dataTransfer.setData('taskId', task.id)}>
              <TaskCard task={task} onClick={onCardClick} members={members} />
            </div>
          ))}
        </AnimatePresence>

        {tasks.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-1 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-8 text-xs text-slate-400"
          >
            Drop tasks here
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

// ─── Main KanbanBoard ─────────────────────────────────────────────────────────
const KanbanBoard = memo(({ tasks: initialTasks, members = [], onOpenTask, onCreateTask, onTaskDrop }) => {
  const [tasks,    setTasks]  = useState(initialTasks ?? [])
  const [dragOver, setDragOver] = useState(null)

  useEffect(() => {
    setTasks(initialTasks ?? [])
  }, [initialTasks])

  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col.id] = tasks.filter(t => t.status === col.id)
    return acc
  }, {})

  const handleRealDrop = (e, colId) => {
    const taskId = e.dataTransfer.getData('taskId')
    if (!taskId) return
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: colId } : t))
    setDragOver(null)
    onTaskDrop?.(taskId, colId)
  }

  const handleAddTask  = (status) => onCreateTask?.(status)
  const handleCardClick = (task) => onOpenTask?.(task)

  return (
    <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '420px' }}>
      {COLUMNS.map(col => (
        <KanbanColumn
          key={col.id}
          column={col}
          tasks={grouped[col.id] ?? []}
          onCardClick={handleCardClick}
          members={members}
          isDraggedOver={dragOver === col.id}
          onDragOver={setDragOver}
          onDragLeave={() => setDragOver(null)}
          onRealDrop={handleRealDrop}
          onAddTask={handleAddTask}
        />
      ))}
    </div>
  )
})

KanbanBoard.displayName = 'KanbanBoard'
export default KanbanBoard
