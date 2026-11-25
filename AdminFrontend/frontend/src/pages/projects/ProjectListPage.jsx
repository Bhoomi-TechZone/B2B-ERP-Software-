import { useState, useEffect, memo, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  Plus, Search, FolderKanban, ChevronRight, Users,
  CheckCircle2, Clock, AlertCircle, TrendingUp, Filter,
  RefreshCw,
} from 'lucide-react'
import {
  PRIORITY_CONFIG, PROJECT_STATUS_CONFIG, HEALTH_CONFIG,
} from './data/mockData'
import pmService from '../../services/pmService'

// ─── Animation variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
}
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }
const spring  = { type: 'spring', stiffness: 350, damping: 26 }

// ─── Create Project Modal ────────────────────────────────────────────────────
export function CreateProjectModal({ onClose, onSave, members: propMembers = [], project }) {
  const TEAM_MEMBERS = propMembers
  const [form, setForm] = useState({
    name: project ? project.name : '',
    type: project ? (project.type === 'client_implementation' ? 'Client Implementation' : project.type === 'internal' ? 'Internal' : project.type === 'product_feature' ? 'Product Feature' : project.type === 'support' ? 'Support' : project.type === 'sales_pursuit' ? 'Sales Pursuit' : 'Client Implementation') : 'Client Implementation',
    client: project ? project.client : '',
    leadId: project ? project.managerId : '',
    department: project ? project.department || 'Engineering' : 'Engineering',
    team: project ? project.team || [] : [],
    startDate: project ? (project.startDate ? project.startDate.split('T')[0] : '') : '',
    endDate: project ? (project.endDate ? project.endDate.split('T')[0] : '') : '',
    status: project ? (project.status === 'Active' ? 'In Progress' : project.status === 'On Hold' ? 'On Hold' : project.status === 'Completed' ? 'Completed' : 'Planning') : 'Planning',
    priority: project ? (
      project.priority === 'low' ? 'Low' :
      project.priority === 'medium' ? 'Medium' :
      project.priority === 'high' ? 'High' :
      project.priority === 'critical' ? 'Critical' :
      project.priority || 'Medium'
    ) : 'Medium',
    budget: project ? project.budget || '' : '',
    description: project ? project.description : '',
    tags: project ? (project.tags || []).join(', ') : '',
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    if (errors[k]) setErrors(prev => ({ ...prev, [k]: null }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Project name is required'
    if (form.type === 'Client Implementation' && !form.client.trim()) e.client = 'Client name is required'
    if (!form.leadId) e.leadId = 'Project lead is required'
    if (!form.startDate) e.startDate = 'Start date is required'
    if (!form.endDate) e.endDate = 'End date is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const toggleTeamMember = (id) => {
    setForm(f => ({
      ...f,
      team: f.team.includes(id) ? f.team.filter(m => m !== id) : [...f.team, id]
    }))
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      await onSave(form)
      onClose()
    } catch (err) {
      alert('Failed to create project: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="my-8 w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden"
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }} transition={spring}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-8 py-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{project ? 'Edit Project' : 'Create New Project'}</h2>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">Project Specification</p>
          </div>
          <motion.button whileHover={{ scale: 1.1, backgroundColor: '#fee2e2', color: '#ef4444' }} whileTap={{ scale: 0.9 }} onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-colors">
            <Plus className="h-5 w-5 rotate-45" />
          </motion.button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-8">
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Project Name */}
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-bold text-slate-700">Project Name *</label>
              <input
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="e.g. Acme Corp — HRMS Implementation"
                className={`w-full rounded-xl border ${errors.name ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50/50'} px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100`}
              />
              {errors.name && <p className="mt-1.5 text-xs font-medium text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.name}</p>}
            </div>

            {/* Project Type */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Project Type *</label>
              <select
                value={form.type}
                onChange={e => set('type', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              >
                <option>Client Implementation</option>
                <option>Internal</option>
                <option>Product Feature</option>
                <option>Support</option>
                <option>Sales Pursuit</option>
              </select>
            </div>

            {/* Client (Conditional) */}
            <div>
              <label className={`mb-2 block text-sm font-bold ${form.type === 'Client Implementation' ? 'text-slate-700' : 'text-slate-400'}`}>
                Client / Tenant {form.type === 'Client Implementation' && '*'}
              </label>
              <input
                disabled={form.type !== 'Client Implementation'}
                value={form.client}
                onChange={e => set('client', e.target.value)}
                placeholder={form.type === 'Client Implementation' ? 'Enter client name...' : 'N/A for internal projects'}
                className={`w-full rounded-xl border ${errors.client ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50/50'} px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:opacity-50`}
              />
              {errors.client && <p className="mt-1.5 text-xs font-medium text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.client}</p>}
            </div>

            {/* Project Lead */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Project Lead *</label>
              <select
                value={form.leadId}
                onChange={e => set('leadId', e.target.value)}
                className={`w-full rounded-xl border ${errors.leadId ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50/50'} px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100`}
              >
                <option value="">Select Lead Owner</option>
                {TEAM_MEMBERS.map(m => (
                  <option key={m.id} value={m.id}>{m.name} {m.title ? `(${m.title})` : ''}</option>
                ))}
              </select>
              {errors.leadId && <p className="mt-1.5 text-xs font-medium text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.leadId}</p>}
            </div>

            {/* Department */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Owning Department *</label>
              <select
                value={form.department}
                onChange={e => set('department', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              >
                <option>Engineering</option>
                <option>Customer Success</option>
                <option>Product</option>
                <option>Sales</option>
                <option>Operations</option>
              </select>
            </div>

            {/* Team Members */}
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-bold text-slate-700">Team Members</label>
              {TEAM_MEMBERS.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No team members found. Add employees first.</p>
              ) : (
                <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-slate-50/30 p-3">
                  {TEAM_MEMBERS.map(m => {
                    const active = form.team.includes(m.id)
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => toggleTeamMember(m.id)}
                        className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                          active ? 'bg-blue-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'
                        }`}
                      >
                        <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[8px] font-bold ${active ? 'bg-white/20 text-white' : `${m.color} text-white`}`}>
                          {m.initials}
                        </div>
                        {m.name}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Dates */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Start Date *</label>
              <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)}
                className={`w-full rounded-xl border ${errors.startDate ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50/50'} px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100`} />
              {errors.startDate && <p className="mt-1.5 text-xs font-medium text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.startDate}</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Target End Date *</label>
              <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)}
                className={`w-full rounded-xl border ${errors.endDate ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50/50'} px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100`} />
              {errors.endDate && <p className="mt-1.5 text-xs font-medium text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.endDate}</p>}
            </div>

            {/* Status & Priority */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Status *</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100">
                <option>Not Started</option>
                <option>Planning</option>
                <option>In Progress</option>
                <option>On Hold</option>
                <option>Completed</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Priority *</label>
              <select value={form.priority} onChange={e => set('priority', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </div>

            {/* Budget */}
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-bold text-slate-700">Project Budget (Optional)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  value={form.budget}
                  onChange={e => set('budget', e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-9 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-bold text-slate-700">Description</label>
              <textarea rows={4} value={form.description} onChange={e => set('description', e.target.value)}
                placeholder="Project brief, objectives, and success metrics..."
                className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" />
            </div>

            {/* Tags */}
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-bold text-slate-700">Tags (comma separated)</label>
              <input value={form.tags} onChange={e => set('tags', e.target.value)}
                placeholder="e.g. Migration, Backend, Q3-Sprint"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-8 py-5">
          <p className="text-xs text-slate-400 font-medium">* Required fields</p>
          <div className="flex gap-3">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-bold text-slate-600 transition-all">
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: '#1d4ed8' }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all disabled:opacity-60">
              {saving && <RefreshCw className="h-4 w-4 animate-spin" />}
              {saving ? (project ? 'Saving...' : 'Creating...') : (project ? 'Save Changes' : 'Create Project')}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color, delay }) {
  return (
    <motion.div variants={fadeUp} transition={{ delay }}
      whileHover={{ y: -4, boxShadow: '0 12px 28px -6px rgb(0 0 0 / 0.1)' }}
      className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm cursor-default">
      <div className="mb-3 flex items-center justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        {sub && <span className="text-xs font-semibold text-emerald-600">{sub}</span>}
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-0.5 text-xs text-slate-500">{label}</p>
    </motion.div>
  )
}

// ─── Project Row ──────────────────────────────────────────────────────────────
function ProjectRow({ project, members, onClick }) {
  const statusCfg = PROJECT_STATUS_CONFIG[project.status] ?? PROJECT_STATUS_CONFIG.Active
  const totalTasks = project.taskCounts
    ? Object.values(project.taskCounts).reduce((a, b) => a + b, 0)
    : 0

  const getMember = (id) => members.find(m => m.id === id || m.id === String(id))

  return (
    <motion.tr variants={fadeUp}
      whileHover={{ backgroundColor: '#f8fafc' }}
      className="cursor-pointer border-b border-slate-100 transition-colors"
      onClick={() => onClick(project.id)}
    >
      {/* Project Name */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white ${project.clientColor || 'bg-slate-500'}`}>
            {project.clientLogo || project.name?.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">{project.name}</p>
            <div className="mt-0.5 flex flex-wrap gap-1">
              {(project.tags || []).map(t => (
                <span key={t} className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </td>

      {/* Client */}
      <td className="px-6 py-4 text-sm text-slate-600">{project.client || '—'}</td>

      {/* Status */}
      <td className="px-6 py-4">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${statusCfg.badge}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
          {project.status}
        </span>
      </td>

      {/* Progress */}
      <td className="px-6 py-4">
        <div className="flex min-w-30 items-center gap-2.5">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
            <motion.div
              className={`h-full rounded-full ${project.progress === 100 ? 'bg-emerald-500' : project.progress >= 60 ? 'bg-blue-500' : project.progress >= 30 ? 'bg-amber-500' : 'bg-red-400'}`}
              initial={{ width: 0 }} animate={{ width: `${project.progress || 0}%` }}
              transition={{ duration: 1, ease: [0.34, 1.56, 0.64, 1] }}
            />
          </div>
          <span className="text-xs font-bold text-slate-700">{project.progress || 0}%</span>
        </div>
      </td>

      {/* Tasks */}
      <td className="px-6 py-4">
        <span className="text-sm font-semibold text-slate-700">{totalTasks}</span>
        <span className="ml-1 text-xs text-slate-400">tasks</span>
      </td>

      {/* Due Date */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-sm text-slate-600">
            {project.endDate
              ? new Date(project.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
              : '—'}
          </span>
        </div>
      </td>

      {/* Team */}
      <td className="px-6 py-4">
        <div className="flex -space-x-2">
          {(project.team || []).slice(0, 4).map(uid => {
            const m = getMember(uid)
            return (
              <motion.div key={uid} whileHover={{ scale: 1.2, zIndex: 10 }} transition={spring}
                title={m?.name}
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white shadow-sm ${m?.color || 'bg-slate-400'}`}>
                {m?.initials || uid?.toString().slice(0, 2).toUpperCase()}
              </motion.div>
            )
          })}
          {(project.team || []).length > 4 && (
            <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-[10px] font-bold text-slate-600">
              +{project.team.length - 4}
            </div>
          )}
        </div>
      </td>

      {/* Action */}
      <td className="px-6 py-4">
        <motion.div whileHover={{ x: 3 }} className="flex items-center gap-1 text-blue-600">
          <span className="text-xs font-semibold">View</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </motion.div>
      </td>
    </motion.tr>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const ProjectListPage = memo(() => {
  const navigate  = useNavigate()
  const [search,   setSearch]  = useState('')
  const [filter,   setFilter]  = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState([])
  const [members,  setMembers]  = useState([])
  const [error, setError] = useState(null)

  const statuses = ['All', 'Active', 'On Hold', 'Completed']

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const summary = await pmService.getDashboardSummary()
      setProjects(summary.projects || [])
      setMembers(summary.members || [])
    } catch (err) {
      console.error('Failed to load projects:', err)
      setError(err.message || 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filtered = useMemo(() => projects.filter(p => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase()) ||
                        p.client?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'All' || p.status === filter
    return matchSearch && matchFilter
  }), [projects, search, filter])

  const stats = useMemo(() => ({
    total:     projects.length,
    active:    projects.filter(p => p.status === 'Active').length,
    onHold:    projects.filter(p => p.status === 'On Hold').length,
    completed: projects.filter(p => p.status === 'Completed').length,
  }), [projects])

  const handleCreateProject = async (formData) => {
    await pmService.createProject({
      name: formData.name,
      type: formData.type.toLowerCase().replace(/ /g, '_'),
      client_tenant_id: null,
      department: formData.department,
      priority: (formData.priority || 'Medium').toLowerCase(),
      start_date: formData.startDate ? new Date(formData.startDate).toISOString() : null,
      end_date: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      budget: formData.budget ? parseFloat(formData.budget) : 0,
      currency: 'INR',
      description_html: formData.description,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      lead_id: formData.leadId,
      team_members: formData.team,
      // store client name as a tag for display
      client: formData.client || (formData.type !== 'Client Implementation' ? 'Internal' : ''),
    })
    await fetchData()
  }

  return (
    <motion.div
      className="p-6 space-y-6"
      variants={stagger} initial="hidden" animate="visible"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Projects</h1>
          <p className="mt-0.5 text-sm text-slate-500">Manage all client onboarding and internal projects</p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={fetchData}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03, boxShadow: '0 8px 20px -4px rgb(37 99 235 / 0.4)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
          >
            <Plus className="h-4 w-4" />
            New Project
          </motion.button>
        </div>
      </motion.div>

      {/* Stat cards */}
      <motion.div variants={stagger} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FolderKanban}  label="Total Projects" value={stats.total}     color="bg-blue-500"    delay={0}    />
        <StatCard icon={TrendingUp}    label="Active"         value={stats.active}    color="bg-emerald-500" delay={0.05} />
        <StatCard icon={AlertCircle}   label="On Hold"        value={stats.onHold}    color="bg-amber-500"   delay={0.1}  />
        <StatCard icon={CheckCircle2}  label="Completed"      value={stats.completed} color="bg-violet-500"  delay={0.15} />
      </motion.div>

      {/* Filters & Search */}
      <motion.div variants={fadeUp} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1.5">
          {statuses.map(s => (
            <motion.button key={s} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={() => setFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                filter === s ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}>
              {s}
            </motion.button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </motion.div>

      {/* Error state */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          ⚠️ {error} — <button onClick={fetchData} className="font-bold underline">Retry</button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="space-y-3 p-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      {!loading && (
        <motion.div variants={fadeUp} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Project', 'Client', 'Status', 'Progress', 'Tasks', 'Due Date', 'Team', ''].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-bold tracking-wide text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <motion.tbody variants={stagger}>
                <AnimatePresence>
                  {filtered.length > 0 ? filtered.map(p => (
                    <ProjectRow key={p.id} project={p} members={members} onClick={id => navigate(`/projects/${id}`)} />
                  )) : (
                    <tr>
                      <td colSpan={8} className="py-16 text-center">
                        <Filter className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                        <p className="text-sm font-semibold text-slate-400">
                          {search || filter !== 'All' ? 'No projects match your filters' : 'No projects yet — create your first one!'}
                        </p>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </motion.tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showModal && (
          <CreateProjectModal
            members={members}
            onClose={() => setShowModal(false)}
            onSave={handleCreateProject}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
})

ProjectListPage.displayName = 'ProjectListPage'
export default ProjectListPage
