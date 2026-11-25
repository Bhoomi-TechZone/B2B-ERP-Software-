import { useState, memo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, ChevronDown, Calendar, CheckCircle } from 'lucide-react'
import { PRIORITY_CONFIG } from '../data/mockData'
import pmService from '../../../services/pmService'

const spring = { type: 'spring', stiffness: 350, damping: 26 }

const CreateTaskModal = memo(({ onClose, defaultProjectId, defaultStatus, projects = [], members = [], onSave }) => {
  const TEAM_MEMBERS = members
  const TASKS = []

  const getMember = (id) => TEAM_MEMBERS.find(m => m.id === id || m.id === String(id))
  const getProject = (id) => projects.find(p => p.id === id || p.id === String(id))

  const [form, setForm] = useState({
    title: '',
    desc: '',
    projectId: defaultProjectId || '',
    assignee: '',
    priority: 'Medium',
    dueDate: '',
    tags: '',
    status: defaultStatus || 'To Do',
  })
  const [step, setStep] = useState(1)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const selectedProject = getProject(form.projectId)
  const availableMembers = selectedProject && selectedProject.team
    ? TEAM_MEMBERS.filter(m => selectedProject.team.includes(m.id) || selectedProject.team.includes(String(m.id)))
    : TEAM_MEMBERS
  const selectedAssignee = getMember(form.assignee)

  const canGoNext = form.title.trim() && form.projectId
  const canCreate = canGoNext && form.assignee

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden"
        initial={{ scale: 0.88, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.88, y: 30 }}
        transition={spring}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Create &amp; Assign Task</h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Step {step} of 2 &mdash; {step === 1 ? 'Task Details' : 'Assign to Team Member'}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </motion.button>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2 px-6 pt-4">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  step >= s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                }`}
              >
                {s}
              </div>
              {s < 2 && <div className={`h-0.5 w-20 ${step > s ? 'bg-blue-600' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        {/* Body */}
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 p-6"
            >
              {/* Title */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Task Title <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.title}
                  onChange={e => set('title', e.target.value)}
                  placeholder="e.g. Configure payroll tax slabs for FY2026"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Project */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Project <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={form.projectId}
                    onChange={e => { set('projectId', e.target.value); set('assignee', '') }}
                    className="w-full appearance-none rounded-xl border border-slate-200 px-3.5 py-2.5 pr-9 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Select project...</option>
                    {projects.filter(p => p.status !== 'Completed').map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
                {selectedProject && (
                  <p className="mt-1 text-xs text-slate-400">
                    <span className={`mr-1 inline-block h-2 w-2 rounded-full ${selectedProject.clientColor}`} />
                    {selectedProject.client} &middot; {selectedProject.team?.length || 0} team members
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Description</label>
                <textarea
                  rows={3}
                  value={form.desc}
                  onChange={e => set('desc', e.target.value)}
                  placeholder="What needs to be done? Include acceptance criteria..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Priority + Due Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Priority</label>
                  <div className="relative">
                    <select
                      value={form.priority}
                      onChange={e => set('priority', e.target.value)}
                      className="w-full appearance-none rounded-xl border border-slate-200 px-3.5 py-2.5 pr-8 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      {['Low', 'Medium', 'High', 'Critical'].map(p => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Due Date</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={e => set('dueDate', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Tags <span className="font-normal text-slate-400">(comma separated)</span>
                </label>
                <input
                  value={form.tags}
                  onChange={e => set('tags', e.target.value)}
                  placeholder="Backend, Compliance, QA"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6"
            >
              <p className="mb-1 text-xs font-semibold text-slate-600">
                Assign to Team Member <span className="text-red-500">*</span>
              </p>
              <p className="mb-3 text-xs text-slate-400">
                {selectedProject
                  ? `${availableMembers.length} members on ${selectedProject.name}`
                  : 'All team members'}
              </p>

              {/* Task summary pill */}
              <div className="mb-4 rounded-xl bg-slate-50 p-3">
                <p className="text-sm font-bold text-slate-800">{form.title}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <span className={`rounded px-2 py-0.5 text-xs font-bold ${(PRIORITY_CONFIG[form.priority] || PRIORITY_CONFIG.Medium).badge}`}>
                    {form.priority}
                  </span>
                  {form.dueDate && (
                    <span className="flex items-center gap-1 rounded bg-slate-200 px-2 py-0.5 text-xs text-slate-600">
                      <Calendar className="h-3 w-3" />{form.dueDate}
                    </span>
                  )}
                  {selectedAssignee && (
                    <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold text-white ${selectedAssignee.color}`}>
                      <CheckCircle className="h-3 w-3" />{selectedAssignee.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Member list */}
              <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {availableMembers.map((m, i) => {
                  const active  = TASKS.filter(t => t.assignee === m.id && t.status !== 'Done').length
                  const overdue = TASKS.filter(t => t.assignee === m.id && new Date(t.dueDate) < new Date() && t.status !== 'Done').length
                  const sel = form.assignee === m.id
                  return (
                    <motion.button
                      key={m.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, ...spring }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => set('assignee', m.id)}
                      className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition-all ${
                        sel ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${m.color}`}>
                        {m.initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-800">{m.name}</p>
                        <p className="text-xs text-slate-400">{m.title}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className={`text-xs font-bold ${active >= 4 ? 'text-red-600' : active >= 2 ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {active} active
                        </p>
                        {overdue > 0 && <p className="text-xs text-red-500">{overdue} overdue</p>}
                      </div>
                      {sel && (
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600">
                          <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3 text-white">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      )}
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => step > 1 ? setStep(1) : onClose()}
            className="rounded-xl border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            {step > 1 ? '← Back' : 'Cancel'}
          </motion.button>
          {step < 2 ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => canGoNext && setStep(2)}
              className={`rounded-xl px-5 py-2 text-sm font-semibold text-white ${
                canGoNext ? 'bg-blue-600 hover:bg-blue-700' : 'cursor-not-allowed bg-slate-300'
              }`}
            >
              Next: Assign →
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={async () => {
                if (canCreate) {
                  try {
                    await pmService.createTask({
                      title: form.title,
                      description_html: form.desc,
                      project_id: form.projectId,
                      assigned_to: form.assignee,
                      priority: form.priority.toLowerCase(),
                      status: form.status.toLowerCase().replace(" ", "_"),
                      due_at: form.dueDate ? new Date(form.dueDate).toISOString() : new Date().toISOString(),
                      tags: form.tags ? form.tags.split(",").map(t => t.trim()) : []
                    })
                    if (onSave) await onSave()
                    onClose()
                  } catch (err) {
                    alert("Failed to create task: " + err.message)
                  }
                }
              }}
              className={`rounded-xl px-5 py-2 text-sm font-semibold text-white ${
                canCreate ? 'bg-blue-600 hover:bg-blue-700' : 'cursor-not-allowed bg-slate-300'
              }`}
            >
              Create &amp; Assign Task
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
})

CreateTaskModal.displayName = 'CreateTaskModal'
export default CreateTaskModal
