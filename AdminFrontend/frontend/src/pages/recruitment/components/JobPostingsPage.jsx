import { useState, useMemo, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Plus, Search, Eye, Globe, MapPin, Briefcase,
  Users, TrendingUp, ToggleLeft, ToggleRight, X, Clock, ExternalLink, Settings,
  Loader2, Trash2, RefreshCw
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import jobPostingService from '../../../services/jobPostingService'
import jobTitleService from '../../../services/jobTitleService'
import { useJobTitles } from '../../../hooks/useJobTitles'
import { StatusBadge, SkeletonCard, EmptyState, Modal, Avatar } from './shared'

const TYPE_COLORS = {
  'Full-time': 'bg-blue-50 text-blue-700',
  'Contract':  'bg-violet-50 text-violet-700',
  'Part-time': 'bg-amber-50 text-amber-700',
}

const INITIAL_FORM = {
  job_title: '',
  location: '',
  job_description: '',
  publish_company_website: true,
  publish_linkedin: false,
  publish_indeed: false,
  publish_naukri: false,
}

export default function JobPostingsPage() {
  const navigate = useNavigate()
  const { jobTitles, refetch: refetchJobTitles } = useJobTitles()

  // ── State ──────────────────────────────────────────────────────────────────
  const [jobs, setJobs]            = useState([])
  const [loading, setLoading]      = useState(true)
  const [submitting, setSubmitting]= useState(false)
  const [error, setError]          = useState(null)
  const [search, setSearch]        = useState('')
  const [statusF, setStatus]       = useState('all')
  const [viewJob, setViewJob]      = useState(null)
  const [createModal, setCreateModal] = useState(false)
  const [form, setForm]            = useState({ ...INITIAL_FORM })

  // ── Fetch all job postings ─────────────────────────────────────────────────
  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await jobPostingService.getAll()
      setJobs(data)
    } catch (err) {
      console.error('Failed to fetch job postings:', err)
      setError(err.message || 'Failed to load job postings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  // ── Filters ────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => jobs.filter(j => {
    const q = search.toLowerCase()
    return (
      (statusF === 'all' || j.status === statusF) &&
      (!q || j.title.toLowerCase().includes(q) || j.location.toLowerCase().includes(q))
    )
  }), [jobs, search, statusF])

  // ── Toggle Publish / Unpublish ─────────────────────────────────────────────
  const togglePublish = async (id, currentStatus) => {
    try {
      const updated = await jobPostingService.togglePublish(id, currentStatus)
      if (updated) {
        setJobs(prev => prev.map(j => j.id === id ? updated : j))
      }
    } catch (err) {
      console.error('Toggle publish failed:', err)
      alert('Failed to update status: ' + (err.message || 'Unknown error'))
    }
  }

  // ── Delete Job ─────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) return
    try {
      await jobPostingService.remove(id)
      setJobs(prev => prev.filter(j => j.id !== id))
      setViewJob(null)
    } catch (err) {
      console.error('Delete failed:', err)
      alert('Failed to delete: ' + (err.message || 'Unknown error'))
    }
  }

  // ── Create Job ─────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    console.log('📝 Form state at submit:', JSON.stringify(form))

    const title = (form.job_title || '').trim()
    const loc   = (form.location || '').trim()
    const desc  = (form.job_description || '').trim()

    if (!title || !loc || !desc) {
      alert(`Please fill in all required fields.\n\nJob Title: "${title}"\nLocation: "${loc}"\nDescription: "${desc ? desc.slice(0, 30) + '...' : ''}"`)
      return
    }

    try {
      setSubmitting(true)
      
      // Check if job title exists, if not create it globally
      const titleExists = jobTitles.some(jt => (jt.name || jt.title || '').toLowerCase() === title.toLowerCase())
      if (!titleExists) {
        try {
          await jobTitleService.createJobTitle({ name: title })
          refetchJobTitles()
        } catch (jtErr) {
          console.error('Failed to create new job title globally:', jtErr)
          // Continue creating job posting even if this fails
        }
      }

      const payload = {
        job_title: title,
        location: loc,
        job_description: desc,
        publish_company_website: form.publish_company_website,
        publish_linkedin: form.publish_linkedin,
        publish_indeed: form.publish_indeed,
        publish_naukri: form.publish_naukri,
      }
      console.log('🚀 Sending payload:', payload)
      const newJob = await jobPostingService.create(payload)
      if (newJob) {
        setJobs(prev => [newJob, ...prev])
      }
      setForm({ ...INITIAL_FORM })
      setCreateModal(false)
    } catch (err) {
      console.error('Create failed:', err)
      alert('Failed to create job: ' + (err.message || 'Unknown error'))
    } finally {
      setSubmitting(false)
    }
  }

  // ── Form helpers ───────────────────────────────────────────────────────────
  const updateField = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  // ── Summary stats ──────────────────────────────────────────────────────────
  const published  = jobs.filter(j => j.status === 'published').length
  const drafts     = jobs.filter(j => j.status === 'draft').length
  const totalViews = jobs.reduce((s, j) => s + (j.views || 0), 0)
  const totalApps  = jobs.reduce((s, j) => s + (j.applications || 0), 0)

  return (
    <div className="p-6">

      {/* ── Summary Row ── */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Live Jobs',    value: published,  icon: Globe,       color: 'text-blue-700 bg-blue-50 border-blue-200'     },
          { label: 'Draft',        value: drafts,     icon: Clock,       color: 'text-slate-600 bg-slate-50 border-slate-200'  },
          { label: 'Total Views',  value: totalViews, icon: TrendingUp,  color: 'text-violet-700 bg-violet-50 border-violet-200' },
          { label: 'Applications', value: totalApps,  icon: Users,       color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
        ].map((c, i) => (
          <motion.div key={c.label}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className={`flex items-center gap-3 rounded-2xl border p-4 ${c.color}`}>
            <c.icon className="h-8 w-8 opacity-60" />
            <div>
              <div className="text-2xl font-bold">{c.value.toLocaleString()}</div>
              <div className="text-xs font-medium text-slate-500">{c.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-56">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search title or location…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        {['all', 'published', 'draft'].map(s => (
          <button key={s} onClick={() => setStatus(s)}
            className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
              statusF === s ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}>
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
        <span className="ml-auto text-sm text-slate-500">{filtered.length} posting{filtered.length !== 1 ? 's' : ''}</span>
        <button
          onClick={fetchJobs}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
        <button 
          onClick={() => navigate('/recruitment/sources')}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
        >
          <Settings className="h-4 w-4" /> Manage Sources
        </button>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={() => setCreateModal(true)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 shadow-lg shadow-blue-100"
        >
          <Plus className="h-4 w-4" /> New Job Posting
        </motion.button>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="mb-5 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <span className="font-semibold">⚠ Error:</span> {error}
          <button onClick={fetchJobs} className="ml-auto rounded-lg bg-red-100 px-3 py-1 text-xs font-bold hover:bg-red-200 transition">
            Retry
          </button>
        </motion.div>
      )}

      {/* ── Job Cards Grid ── */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Briefcase} title="No job postings" description="No postings match your current filters." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((job, i) => (
              <motion.div
                key={job.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ delay: i * 0.04 }}
                className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md"
              >
                {/* Card Header */}
                <div className="mb-4 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                      <Briefcase className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 leading-tight">{job.title}</div>
                      <div className="text-xs font-mono text-slate-400">{job.id?.slice(-8)}</div>
                    </div>
                  </div>
                  <StatusBadge status={job.status} size="xs" />
                </div>

                {/* Details */}
                <div className="mb-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />{job.location}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" />{job.type}
                    {job.closingDate && <span className="ml-auto text-slate-400">Closes {job.closingDate}</span>}
                  </div>
                </div>

                {/* Sources / Publish Tags */}
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {(job.sources && job.sources.length > 0 ? job.sources : ['No sources']).map(s => (
                    <span key={s} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">{s}</span>
                  ))}
                </div>

                {/* Stats */}
                <div className="mb-4 flex items-center gap-4 rounded-xl bg-slate-50 px-3 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-700">{(job.views || 0).toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400">views</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-700">{job.applications || 0}</span>
                    <span className="text-[10px] text-slate-400">applied</span>
                  </div>
                  <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${TYPE_COLORS[job.type] || 'bg-slate-100 text-slate-600'}`}>
                    {job.type}
                  </span>
                </div>

                {/* Actions */}
                <div className="mt-auto flex gap-2">
                  <button onClick={() => setViewJob(job)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">
                    <Eye className="h-3.5 w-3.5" /> View Details
                  </button>
                  <button onClick={() => handleDelete(job.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100"
                    title="Delete Job Posting">
                    <Trash2 className="h-4 w-4" />
                  </button>
                  {job.status !== 'draft' && (
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={() => togglePublish(job.id, job.status)}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition ${
                        job.status === 'published'
                          ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}>
                      {job.status === 'published' ? (
                        <><ToggleRight className="h-3.5 w-3.5" /> Unpublish</>
                      ) : (
                        <><Globe className="h-3.5 w-3.5" /> Publish</>
                      )}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── Detail Modal ── */}
      <Modal open={!!viewJob} onClose={() => setViewJob(null)} title="Job Posting Details" size="lg">
        {viewJob && (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{viewJob.title}</h3>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{viewJob.location}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{viewJob.type}</span>
                </div>
              </div>
              <StatusBadge status={viewJob.status} />
            </div>

            <p className="text-sm leading-relaxed text-slate-600">{viewJob.description}</p>

            <div>
              <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Published Sources</div>
              <div className="flex flex-wrap gap-2">
                {(viewJob.sources && viewJob.sources.length > 0) ? viewJob.sources.map(s => (
                  <span key={s} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{s}</span>
                )) : (
                  <span className="text-xs text-slate-400 italic">No sources configured</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Applications', value: viewJob.applications || 0 },
                { label: 'Views',        value: (viewJob.views || 0).toLocaleString() },
                { label: 'Created At',   value: viewJob.createdAt || 'N/A' },
              ].map(r => (
                <div key={r.label} className="rounded-xl bg-slate-50 px-4 py-3 text-center">
                  <div className="text-xl font-bold text-slate-900">{r.value}</div>
                  <div className="text-xs text-slate-500">{r.label}</div>
                </div>
              ))}
            </div>

            {/* Delete from detail modal */}
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => handleDelete(viewJob.id)}
                className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 transition-all"
              >
                <Trash2 className="h-4 w-4" /> Delete This Job
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Create Modal ── */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Create New Job Posting" size="lg">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Job Title</label>
              <input 
                type="text" 
                list="job-titles-list"
                value={form.job_title}
                onChange={e => updateField('job_title', e.target.value)}
                placeholder="e.g. Senior Backend Engineer"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-400 outline-hidden"
              />
              <datalist id="job-titles-list">
                {jobTitles.map(jt => (
                  <option key={jt.id || jt.name} value={jt.name || jt.title} />
                ))}
              </datalist>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Location</label>
              <input 
                type="text" 
                value={form.location}
                onChange={e => updateField('location', e.target.value)}
                placeholder="e.g. Remote / Mumbai"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-400 outline-hidden"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Job Description</label>
            <textarea 
              rows={4}
              value={form.job_description}
              onChange={e => updateField('job_description', e.target.value)}
              placeholder="Enter role responsibilities and requirements..."
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-400 outline-hidden"
            />
          </div>

          {/* Source Selection */}
          <div className="space-y-3">
             <label className="text-xs font-bold text-slate-500 uppercase ml-1">Publish to Sources</label>
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { field: 'publish_company_website', name: 'Company Website', icon: Globe },
                  { field: 'publish_linkedin',        name: 'LinkedIn',        icon: Globe },
                  { field: 'publish_indeed',          name: 'Indeed',          icon: Globe },
                  { field: 'publish_naukri',          name: 'Naukri.com',      icon: Globe },
                ].map(s => (
                  <label key={s.field} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50 cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-all group">
                     <input
                       type="checkbox"
                       checked={form[s.field]}
                       onChange={e => updateField(s.field, e.target.checked)}
                       className="h-4 w-4 rounded border-slate-300 accent-blue-600"
                     />
                     <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700">{s.name}</span>
                        <span className="text-[9px] text-slate-400 uppercase font-black">Webhook Sync</span>
                     </div>
                  </label>
                ))}
             </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
             <div className="flex items-center gap-2 text-emerald-600">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold">API Integrations Active</span>
             </div>
             <div className="flex gap-2">
                <button type="button" onClick={() => setCreateModal(false)} className="rounded-xl px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all">Cancel</button>
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2 text-sm font-bold text-white shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {submitting ? 'Posting…' : 'Post Job Now'}
                </button>
             </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
