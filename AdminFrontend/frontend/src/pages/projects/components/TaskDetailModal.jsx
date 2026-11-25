import { useState, memo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  X, Tag, Calendar, User, MessageSquare,
  Paperclip, CheckCircle2, Clock, Send,
  ChevronDown, FileText, Image, File, Trash2, Upload,
} from 'lucide-react'
import {
  PRIORITY_CONFIG, STATUS_CONFIG
} from '../data/mockData'
import pmService from '../../../services/pmService'

const spring = { type: 'spring', stiffness: 350, damping: 26 }

const STATUSES  = ['To Do', 'In Progress', 'Review', 'Done']
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical']

const TaskDetailModal = memo(({ taskId, task: propTask, projects = [], members = [], onClose, onSave }) => {
  const TEAM_MEMBERS = members

  const getMember = (id) => TEAM_MEMBERS.find(m => m.id === id || m.id === String(id))

  const task = propTask
  if (!task) return null

  const project    = projects.find(p => p.id === task.projectId || p.id === String(task.projectId))
  const assignee   = getMember(task.assignee)
  
  const [comment, setComment] = useState('')
  const [localComments, setLocalComments] = useState(task.comments || [])
  const [attachments, setAttachments] = useState(task.attachments || [])
  const [savingStatus, setSavingStatus] = useState(false)
  const [savingPriority, setSavingPriority] = useState(false)
  const [currentStatus, setCurrentStatus] = useState(task.status)
  const [currentPriority, setCurrentPriority] = useState(
    task.priority === 'low' ? 'Low' :
    task.priority === 'medium' ? 'Medium' :
    task.priority === 'high' ? 'High' :
    task.priority === 'critical' ? 'Critical' :
    task.priority || 'Medium'
  )

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done'

  const addComment = async () => {
    if (!comment.trim()) return
    try {
      const newComment = await pmService.addTaskComment(task.id, comment.trim())
      setLocalComments(prev => [...prev, newComment])
      setComment('')
      if (onSave) await onSave()
    } catch (err) {
      alert("Failed to add comment: " + err.message)
    }
  }

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return
    
    for (const file of files) {
      try {
        const att = await pmService.uploadTaskAttachment(task.id, file)
        setAttachments(prev => [...prev, att])
      } catch (err) {
        alert(`Failed to upload ${file.name}: ` + err.message)
      }
    }
    if (onSave) await onSave()
    e.target.value = ''
  }

  const removeAttachment = async (id) => {
    try {
      await pmService.deleteTaskAttachment(task.id, id)
      setAttachments(prev => prev.filter(a => a.id !== id))
      if (onSave) await onSave()
    } catch (err) {
      alert("Failed to delete attachment: " + err.message)
    }
  }

  const getFileIcon = (type) => {
    if (type?.startsWith('image/')) return <Image className="h-4 w-4 text-blue-500" />
    if (type === 'application/pdf') return <FileText className="h-4 w-4 text-red-500" />
    return <File className="h-4 w-4 text-slate-500" />
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const handleStatusChange = async (nextStatus) => {
    setSavingStatus(true)
    const statusMap = {
      "To Do": "to_do",
      "In Progress": "in_progress",
      "Review": "in_review",
      "Done": "done"
    }
    try {
      await pmService.updateTaskStatus(task.id, statusMap[nextStatus])
      setCurrentStatus(nextStatus)
      if (onSave) await onSave()
    } catch (err) {
      alert("Failed to update status: " + err.message)
    } finally {
      setSavingStatus(false)
    }
  }

  const handlePriorityChange = async (nextPriority) => {
    setSavingPriority(true)
    try {
      await pmService.updateTaskPriority(task.id, nextPriority.toLowerCase())
      setCurrentPriority(nextPriority)
      if (onSave) await onSave()
    } catch (err) {
      setCurrentPriority(nextPriority)
    } finally {
      setSavingPriority(false)
    }
  }

  const currentPriCfg  = PRIORITY_CONFIG[currentPriority]  ?? PRIORITY_CONFIG.Medium
  const currentStatCfg = STATUS_CONFIG[currentStatus]      ?? STATUS_CONFIG['To Do']

  function Avatar({ uid, size = 'h-8 w-8 text-sm' }) {
    const m = getMember(uid)
    if (!m) return null
    return (
      <div className={`flex shrink-0 items-center justify-center rounded-full font-bold text-white ${size} ${m.color}`}>
        {m.initials}
      </div>
    )
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col bg-white shadow-2xl overflow-hidden rounded-3xl"
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        transition={spring}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex-1 pr-4">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${currentPriCfg.badge}`}>
                {currentPriority}
              </span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${currentStatCfg.badge}`}>
                {currentStatus}
              </span>
              {isOverdue && (
                <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                  Overdue
                </span>
              )}
            </div>
            <h2 className="text-base font-bold text-slate-900 leading-snug">{task.title}</h2>
            <p className="mt-1 text-xs text-slate-400">
              {project?.name} · created {task.createdAt || 'recently'}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} transition={spring}
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </motion.button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto">
          {/* Meta section */}
          <div className="grid grid-cols-2 gap-4 border-b border-slate-100 px-6 py-4">
            {/* Assignee */}
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <User className="h-3 w-3" /> Assignee
              </p>
              {assignee ? (
                <div className="flex items-center gap-2">
                  <Avatar uid={task.assignee} />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{assignee.name}</p>
                    <p className="text-[11px] text-slate-400">{assignee.title || 'Team Member'}</p>
                  </div>
                </div>
              ) : <p className="text-sm text-slate-400">Unassigned</p>}
            </div>

            {/* Due Date */}
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <Calendar className="h-3 w-3" /> Due Date
              </p>
              <p className={`text-sm font-semibold ${isOverdue ? 'text-red-600' : 'text-slate-800'}`}>
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No due date'}
              </p>
              {isOverdue && <p className="text-[11px] text-red-500 mt-0.5">Past due date</p>}
            </div>

            {/* Status selector */}
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <CheckCircle2 className="h-3 w-3" /> Status
              </p>
              <div className="relative inline-block">
                <select
                  value={currentStatus}
                  disabled={savingStatus}
                  className={`appearance-none rounded-lg px-3 py-1.5 pr-7 text-xs font-semibold outline-none cursor-pointer ${currentStatCfg.badge} disabled:opacity-60`}
                  onChange={async (e) => {
                    await handleStatusChange(e.target.value)
                  }}
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 opacity-60" />
              </div>
              {savingStatus && <p className="text-[10px] text-blue-500 mt-1">Saving...</p>}
            </div>

            {/* Priority selector */}
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <Clock className="h-3 w-3" /> Priority
              </p>
              <div className="relative inline-block">
                <select
                  value={currentPriority}
                  disabled={savingPriority}
                  className={`appearance-none rounded-lg px-3 py-1.5 pr-7 text-xs font-semibold outline-none cursor-pointer ${currentPriCfg.badge} disabled:opacity-60`}
                  onChange={async (e) => {
                    await handlePriorityChange(e.target.value)
                  }}
                >
                  {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 opacity-60" />
              </div>
              {savingPriority && <p className="text-[10px] text-blue-500 mt-1">Saving...</p>}
            </div>
          </div>

          {/* Description */}
          <div className="border-b border-slate-100 px-6 py-4">
            <p className="mb-2 text-xs font-semibold text-slate-500">Description</p>
            <p className="text-sm leading-relaxed text-slate-700">{task.description?.replace(/<[^>]*>/g, '') || 'No description provided.'}</p>
          </div>

          {/* Tags */}
          {task.tags?.length > 0 && (
            <div className="border-b border-slate-100 px-6 py-4">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <Tag className="h-3 w-3" /> Tags
              </p>
              <div className="flex flex-wrap gap-1.5">
                {task.tags.map(t => (
                  <span key={t} className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* Attachments */}
          <div className="border-b border-slate-100 px-6 py-4">
            <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <Paperclip className="h-3 w-3" /> Attachments
              {attachments.length > 0 && (
                <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">
                  {attachments.length}
                </span>
              )}
            </p>
            {attachments.length > 0 && (
              <div className="mb-2 space-y-1.5">
                {attachments.map(att => (
                  <motion.div
                    key={att.id}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                  >
                    {getFileIcon(att.type)}
                    <div className="min-w-0 flex-1">
                      <a 
                        href={`https://b2bbackend.btplsoft.com${att.url}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="truncate text-xs font-semibold text-blue-600 hover:underline block"
                      >
                        {att.name}
                      </a>
                      <p className="text-[10px] text-slate-400">{formatFileSize(att.size)}</p>
                    </div>
                    <button
                      onClick={() => removeAttachment(att.id)}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
            <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-3 text-xs font-semibold text-slate-400 transition-colors hover:border-blue-400 hover:text-blue-500">
              <Upload className="h-3.5 w-3.5" />
              Click to upload files
              <input
                type="file"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>

          {/* Comments */}
          <div className="px-6 py-4">
            <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <MessageSquare className="h-3 w-3" /> Comments ({localComments.length})
            </p>
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {localComments.map(c => {
                  const author = getMember(c.userId)
                  return (
                    <motion.div key={c.id}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }} transition={spring}
                      className="flex gap-3"
                    >
                      <Avatar uid={c.userId} size="h-7 w-7 text-[11px]" />
                      <div className="flex-1 rounded-xl bg-slate-50 px-3.5 py-2.5">
                        <div className="mb-0.5 flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800">{author?.name || 'You'}</span>
                          <span className="text-[11px] text-slate-400">{c.time}</span>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed">{c.text}</p>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
              {localComments.length === 0 && (
                <p className="text-xs text-slate-400 italic">No comments yet. Be the first to comment!</p>
              )}
            </div>
          </div>
        </div>

        {/* Comment input — pinned bottom */}
        <div className="shrink-0 border-t border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              Me
            </div>
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
              <input
                value={comment} onChange={e => setComment(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addComment()}
                placeholder="Add a comment..."
                className="flex-1 text-sm text-slate-700 outline-none bg-transparent"
              />
              <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={addComment}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white disabled:opacity-40"
                disabled={!comment.trim()}
              >
                <Send className="h-3.5 w-3.5" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
})

TaskDetailModal.displayName = 'TaskDetailModal'
export default TaskDetailModal
