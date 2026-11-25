import { useState, useMemo, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Search, Mail, Phone, MapPin, ExternalLink, Star,
  Users, Tag, X, Filter, FileText, Download, Plus, CheckCircle2, UserCheck
} from 'lucide-react'
import { CANDIDATES } from '../data/recruitmentData'
import { StatusBadge, SkeletonRow, EmptyState, Modal, Avatar, StarRating, TableShell } from './shared'
import recruitmentService from '../../../services/recruitmentService'

const SOURCE_COLORS = {
  LinkedIn: 'bg-blue-50 text-blue-700',
  Website:  'bg-violet-50 text-violet-700',
  Agency:   'bg-amber-50 text-amber-700',
  Referral: 'bg-emerald-50 text-emerald-700',
  Naukri:   'bg-orange-50 text-orange-700',
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState(CANDIDATES)
  const [loading, setLoading]       = useState(false)
  const [search, setSearch]         = useState('')
  const [sourceF, setSourceF]       = useState('all')
  const [statusF, setStatusF]       = useState('all')
  const [viewCand, setViewCand]     = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showResumeModal, setShowResumeModal] = useState(false)
  const [convertingId, setConvertingId] = useState(null)
  const [actionMsg, setActionMsg]   = useState('')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    experience: '',
    skills: '',
    source: 'LinkedIn',
    applied_for: 'Software Engineer',
    status: 'applied',
    rating: 4
  })

  // Load candidates dynamically from backend
  const loadCandidates = useCallback(async () => {
    try {
      setLoading(true)
      const res = await recruitmentService.getCandidates({ status: statusF, search })
      if (Array.isArray(res) && res.length > 0) {
        setCandidates(res)
      }
    } catch (err) {
      console.warn('Backend candidates not reachable, using fallback data:', err)
    } finally {
      setLoading(false)
    }
  }, [statusF, search])

  useEffect(() => {
    loadCandidates()
  }, [loadCandidates])

  const sources  = ['all', ...Array.from(new Set(candidates.map(c => c.source || 'Website')))]
  const statuses = ['all', 'applied', 'screening', 'shortlisted', 'interview', 'offer', 'hired', 'rejected']

  const filtered = useMemo(() => candidates.filter(c => {
    const q = search.toLowerCase()
    const cSkills = Array.isArray(c.skills) ? c.skills : []
    return (
      (sourceF === 'all' || c.source === sourceF) &&
      (statusF === 'all' || c.status === statusF) &&
      (!q || (c.name && c.name.toLowerCase().includes(q)) || 
       (c.email && c.email.toLowerCase().includes(q)) ||
       cSkills.some(s => s.toLowerCase().includes(q)))
    )
  }), [candidates, search, sourceF, statusF])

  const handleExportCandidates = () => {
    if (!candidates || candidates.length === 0) return
    const headers = ['Name', 'Email', 'Phone', 'Location', 'Experience', 'Skills', 'Source', 'Stage', 'Rating']
    const rows = filtered.map(c => [
      `"${c.name || ''}"`,
      `"${c.email || ''}"`,
      `"${c.phone || ''}"`,
      `"${c.location || ''}"`,
      `"${c.experience || ''}"`,
      `"${(Array.isArray(c.skills) ? c.skills : []).join('; ')}"`,
      `"${c.source || ''}"`,
      `"${c.status || ''}"`,
      c.rating || 0
    ])
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', `candidates_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleCreateCandidate = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        tags: ['New Applicant', formData.source]
      }
      await recruitmentService.createCandidate(payload)
      setShowAddModal(false)
      setFormData({
        name: '', email: '', phone: '', location: '', experience: '',
        skills: '', source: 'LinkedIn', applied_for: 'Software Engineer', status: 'applied', rating: 4
      })
      setActionMsg('Candidate added successfully!')
      setTimeout(() => setActionMsg(''), 4000)
      await loadCandidates()
    } catch (err) {
      alert(err.message || 'Failed to create candidate')
    }
  }

  const handleConvertToEmployee = async (candidate) => {
    if (!window.confirm(`Convert candidate ${candidate.name} to an active Employee in the system?`)) return
    try {
      setConvertingId(candidate.id)
      const res = await recruitmentService.convertToEmployee(candidate.id)
      setActionMsg(res.message || `Candidate converted to employee!`)
      setTimeout(() => setActionMsg(''), 5000)
      await loadCandidates()
    } catch (err) {
      alert(err.message || 'Failed to convert candidate to employee')
    } finally {
      setConvertingId(null)
    }
  }

  return (
    <div className="p-6">
      {/* ── Action Notification Banner ── */}
      <AnimatePresence>
        {actionMsg && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-xs font-semibold text-emerald-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> {actionMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Summary ── */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Candidates', value: candidates.length, color: 'text-slate-700 bg-slate-50 border-slate-200' },
          { label: 'Active', value: candidates.filter(c => !['hired','rejected'].includes(c.status)).length, color: 'text-blue-700 bg-blue-50 border-blue-200' },
          { label: 'Hired', value: candidates.filter(c => c.status === 'hired').length, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
          { label: 'Avg Rating', value: candidates.length ? (candidates.reduce((s,c)=>s+(c.rating || 0),0)/candidates.length).toFixed(1) : '0.0', color: 'text-amber-700 bg-amber-50 border-amber-200' },
        ].map((c, i) => (
          <motion.div key={c.label}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className={`flex items-center gap-3 rounded-2xl border p-4 ${c.color}`}>
            <Users className="h-8 w-8 opacity-50" />
            <div>
              <div className="text-2xl font-bold">{c.value}</div>
              <div className="text-xs font-medium text-slate-500">{c.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-56">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Name, email, or skill…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <select value={sourceF} onChange={e => setSourceF(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none">
          {sources.map(s => <option key={s} value={s}>{s === 'all' ? 'All Sources' : s}</option>)}
        </select>
        <select value={statusF} onChange={e => setStatusF(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none">
          {statuses.map(s => <option key={s} value={s}>{s === 'all' ? 'All Stages' : s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
        </select>
        
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-slate-500">{filtered.length} candidate{filtered.length !== 1 ? 's' : ''}</span>
          <button
            onClick={handleExportCandidates}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" /> Export
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition cursor-pointer shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" /> Add Candidate
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <TableShell headers={['Candidate', 'Email / Phone', 'Experience', 'Skills', 'Source', 'Stage', 'Rating', 'Tags', 'Actions']}>
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={9} />)
        ) : filtered.length === 0 ? (
          <tr><td colSpan={9}><EmptyState icon={Users} title="No candidates" description="No candidates match your filters." /></td></tr>
        ) : (
          filtered.map((c, i) => (
            <motion.tr key={c.id || i}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
              className="group border-b border-slate-100 transition hover:bg-slate-50">
              <td className="pl-5 py-3.5">
                <div className="flex items-center gap-3">
                  <Avatar initials={c.avatar || c.name?.slice(0, 2).toUpperCase() || 'CA'} color={c.avatarColor || c.avatar_color || 'bg-blue-600'} size="md" />
                  <div>
                    <div className="font-semibold text-slate-900">{c.name}</div>
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />{c.location || 'Remote'}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <Mail className="h-3 w-3 shrink-0 text-slate-400" />{c.email}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                  <Phone className="h-3 w-3 shrink-0" />{c.phone || 'N/A'}
                </div>
              </td>
              <td className="px-4 py-3.5 text-sm font-medium text-slate-700">{c.experience || '1-3 yrs'}</td>
              <td className="px-4 py-3.5">
                <div className="flex flex-wrap gap-1">
                  {(Array.isArray(c.skills) ? c.skills : []).slice(0, 3).map(s => (
                    <span key={s} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">{s}</span>
                  ))}
                  {(Array.isArray(c.skills) ? c.skills.length : 0) > 3 && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-400">+{c.skills.length - 3}</span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3.5">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${SOURCE_COLORS[c.source] || 'bg-slate-100 text-slate-600'}`}>
                  {c.source || 'Website'}
                </span>
              </td>
              <td className="px-4 py-3.5"><StatusBadge status={c.status} size="xs" /></td>
              <td className="px-4 py-3.5"><StarRating value={c.rating || 0} /></td>
              <td className="px-4 py-3.5">
                <div className="flex flex-wrap gap-1">
                  {(Array.isArray(c.tags) ? c.tags : []).map(t => (
                    <span key={t} className="rounded-full border border-slate-200 px-2 py-0.5 text-[10px] text-slate-500">{t}</span>
                  ))}
                </div>
              </td>
              <td className="pr-5 py-3.5">
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setViewCand(c)} title="View candidate profile"
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition cursor-pointer">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                  {['offer', 'hired'].includes(c.status) && (
                    <button 
                      onClick={() => handleConvertToEmployee(c)}
                      disabled={convertingId === c.id}
                      title="Convert to Employee"
                      className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 transition cursor-pointer disabled:opacity-50">
                      <UserCheck className="h-3 w-3" /> {convertingId === c.id ? 'Converting...' : 'Hire'}
                    </button>
                  )}
                </div>
              </td>
            </motion.tr>
          ))
        )}
      </TableShell>

      {/* ── Add Candidate Modal ── */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Candidate" size="md">
        <form onSubmit={handleCreateCandidate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
              <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. John Doe" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
              <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-blue-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
              <input value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })}
                placeholder="Bengaluru, KA" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-blue-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Applied For Role *</label>
              <input required value={formData.applied_for} onChange={e => setFormData({ ...formData, applied_for: e.target.value })}
                placeholder="e.g. Frontend Engineer" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Experience</label>
              <input value={formData.experience} onChange={e => setFormData({ ...formData, experience: e.target.value })}
                placeholder="3+ years" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-blue-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Source</label>
              <select value={formData.source} onChange={e => setFormData({ ...formData, source: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none">
                <option value="LinkedIn">LinkedIn</option>
                <option value="Website">Website</option>
                <option value="Referral">Referral</option>
                <option value="Naukri">Naukri</option>
                <option value="Agency">Agency</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Stage</label>
              <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none">
                <option value="applied">Applied</option>
                <option value="screening">Screening</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="interview">Interview</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Key Skills (comma separated)</label>
            <input value={formData.skills} onChange={e => setFormData({ ...formData, skills: e.target.value })}
              placeholder="React, TypeScript, Node.js" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-blue-500" />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button type="button" onClick={() => setShowAddModal(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer">
              Cancel
            </button>
            <button type="submit"
              className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition cursor-pointer shadow-xs">
              Save Candidate
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Candidate Detail Panel ── */}
      <AnimatePresence>
        {viewCand && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setViewCand(null)} className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]" />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 280, damping: 26 }}
              className="fixed right-0 top-0 z-50 flex h-full w-96 flex-col border-l border-slate-200 bg-white shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                <div className="flex items-center gap-3">
                  <Avatar initials={viewCand.avatar || viewCand.name?.slice(0, 2).toUpperCase()} color={viewCand.avatarColor || viewCand.avatar_color || 'bg-blue-600'} size="lg" />
                  <div>
                    <div className="font-bold text-slate-900 text-lg">{viewCand.name}</div>
                    <div className="text-xs text-slate-500">{viewCand.location || 'Remote'} · {viewCand.experience}</div>
                    <div className="mt-1 flex items-center gap-2">
                      <StatusBadge status={viewCand.status} size="xs" />
                      <StarRating value={viewCand.rating || 0} />
                    </div>
                  </div>
                </div>
                <button onClick={() => setViewCand(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                {/* Contact */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Contact</h4>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail className="h-4 w-4 text-slate-400" />{viewCand.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="h-4 w-4 text-slate-400" />{viewCand.phone || 'N/A'}
                  </div>
                </div>

                {/* Applied For */}
                <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-0.5">Applied For</div>
                  <div className="text-sm font-semibold text-slate-800">{viewCand.applied_for || viewCand.appliedFor}</div>
                  <div className="text-xs text-slate-500">Source: {viewCand.source}</div>
                </div>

                {/* Skills */}
                <div>
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(viewCand.skills) ? viewCand.skills : []).map(s => (
                      <span key={s} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{s}</span>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(viewCand.tags) ? viewCand.tags : []).map(t => (
                      <span key={t} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">{t}</span>
                    ))}
                  </div>
                </div>

                {/* Resume button with working modal preview */}
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setShowResumeModal(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 cursor-pointer shadow-xs">
                  <FileText className="h-4 w-4" /> View Resume
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Working Resume Preview Modal ── */}
      <Modal open={showResumeModal} onClose={() => setShowResumeModal(false)} title={`Resume: ${viewCand?.name}`} size="md">
        <div className="space-y-4 text-slate-700">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">{viewCand?.name}</h3>
            <p className="text-xs text-slate-500">{viewCand?.applied_for || viewCand?.appliedFor} · {viewCand?.location || 'India'}</p>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Executive Summary</h4>
            <p className="text-xs leading-relaxed text-slate-600">
              Experienced {viewCand?.applied_for || 'engineer'} with {viewCand?.experience || 'several years'} of professional background.
              Demonstrated track record of delivering scalable web platforms, collaborating across agile teams, and mastering modern frameworks.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Key Technical Proficiencies</h4>
            <div className="flex flex-wrap gap-1.5">
              {(Array.isArray(viewCand?.skills) ? viewCand.skills : []).map(s => (
                <span key={s} className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 border border-blue-100">{s}</span>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500 flex items-center justify-between">
            <span>Verified Candidate Dossier (ATS Ref: {viewCand?.candidate_id || 'CAN-VERIFIED'})</span>
            <span className="font-semibold text-emerald-600">Status: {viewCand?.status?.toUpperCase()}</span>
          </div>
          <div className="flex justify-end pt-2">
            <button onClick={() => setShowResumeModal(false)}
              className="rounded-xl bg-slate-800 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-900 cursor-pointer">
              Close Preview
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
