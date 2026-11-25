import { useState, useMemo, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Calendar, Clock, Video, Building2, User, Plus,
  MessageSquare, ChevronDown, Check, X, Minus,
  Search, Filter, CheckCircle2
} from 'lucide-react'
import { INTERVIEWS } from '../data/recruitmentData'
import { StatusBadge, SkeletonRow, EmptyState, Modal, Avatar, StarRating, TableShell } from './shared'
import recruitmentService from '../../../services/recruitmentService'

const MODE_ICON = { 'Video Call': Video, 'Onsite': Building2, 'Phone': Clock }
const DECISION_OPTIONS = ['pass', 'reject', 'hold']
const DECISION_STYLE = {
  pass:   { btn: 'bg-emerald-600 hover:bg-emerald-700 text-white', label: 'Pass' },
  reject: { btn: 'bg-red-600    hover:bg-red-700    text-white',   label: 'Reject' },
  hold:   { btn: 'bg-amber-500  hover:bg-amber-600  text-white',   label: 'Hold'   },
}

const emptyFeedback = { rating: 0, comments: '', decision: '' }

// ── Feedback Form Modal ───────────────────────────────────────────────────────
const FeedbackModal = ({ open, onClose, interview, onSubmit }) => {
  const [form, setForm] = useState(interview?.feedback || emptyFeedback)
  if (!interview) return null

  const handleStar = (n) => setForm(p => ({ ...p, rating: n }))

  return (
    <Modal open={open} onClose={onClose} title={`Feedback: ${interview.candidate}`} size="md">
      <div className="space-y-5">
        {/* Rating */}
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">Rating</label>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map(n => (
              <motion.button key={n}
                whileTap={{ scale: 0.88 }}
                onClick={() => handleStar(n)}
                className="transition cursor-pointer"
              >
                <svg className={`h-8 w-8 transition ${n <= (form.rating || 0) ? 'text-amber-400' : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </motion.button>
            ))}
            <span className="ml-2 self-center text-sm font-semibold text-slate-600">{form.rating > 0 ? `${form.rating}/5` : 'Not rated'}</span>
          </div>
        </div>

        {/* Comments */}
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Comments</label>
          <textarea
            rows={4}
            value={form.comments || ''}
            onChange={e => setForm(p => ({ ...p, comments: e.target.value }))}
            placeholder="Write detailed feedback about candidate performance…"
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
          />
        </div>

        {/* Decision */}
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">Decision</label>
          <div className="flex gap-2">
            {DECISION_OPTIONS.map(d => (
              <button key={d}
                onClick={() => setForm(p => ({ ...p, decision: d }))}
                className={`flex-1 rounded-xl py-2 text-xs font-bold uppercase tracking-wide transition cursor-pointer ${
                  form.decision === d ? DECISION_STYLE[d].btn : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}>
                {DECISION_STYLE[d].label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer">Cancel</button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => { onSubmit(form); onClose() }}
            className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 cursor-pointer shadow-xs">
            Save Feedback
          </motion.button>
        </div>
      </div>
    </Modal>
  )
}

// ── Schedule Interview Modal ──────────────────────────────────────────────────
const ScheduleModal = ({ open, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    candidate: '', role: '', round: 'Technical Round 1',
    interviewer: '', date: '', time: '10:00 AM',
    duration: '45 min', mode: 'Video Call',
  })

  return (
    <Modal open={open} onClose={onClose} title="Schedule New Interview" size="md">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Candidate Name *</label>
            <input value={form.candidate} placeholder="e.g. Priya Sharma"
              onChange={e => setForm(p => ({ ...p, candidate: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Applied Role *</label>
            <input value={form.role} placeholder="e.g. Senior Frontend Dev"
              onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Round</label>
            <select value={form.round} onChange={e => setForm(p => ({ ...p, round: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none">
              {['Screening Call', 'Technical Round 1', 'Technical Round 2', 'System Design', 'Managerial Round', 'HR Discussion'].map(r => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Interviewer *</label>
            <input value={form.interviewer} placeholder="e.g. Tech Lead"
              onChange={e => setForm(p => ({ ...p, interviewer: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Date</label>
            <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Time</label>
            <input value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))}
              placeholder="10:00 AM"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Mode</label>
            <select value={form.mode} onChange={e => setForm(p => ({ ...p, mode: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none">
              <option value="Video Call">Video Call</option>
              <option value="Onsite">Onsite</option>
              <option value="Phone">Phone</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer">Cancel</button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => { onSubmit(form); onClose() }}
            className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 cursor-pointer shadow-xs">
            Confirm Schedule
          </motion.button>
        </div>
      </div>
    </Modal>
  )
}

// ── Main Interviews Page ──────────────────────────────────────────────────────
export default function InterviewsPage() {
  const [interviews, setInterviews] = useState(INTERVIEWS)
  const [loading, setLoading]       = useState(false)
  const [search, setSearch]         = useState('')
  const [statusF, setStatusF]       = useState('all')
  const [fbTarget, setFbTarget]     = useState(null)
  const [schModal, setSchModal]     = useState(false)
  const [msg, setMsg]               = useState('')

  const loadInterviews = useCallback(async () => {
    try {
      setLoading(true)
      const res = await recruitmentService.getInterviews()
      if (Array.isArray(res) && res.length > 0) {
        setInterviews(res)
      }
    } catch (err) {
      console.warn('Backend interviews unavailable, using fallback data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadInterviews()
  }, [loadInterviews])

  const filtered = useMemo(() => interviews.filter(iv => {
    const q = search.toLowerCase()
    return (
      (statusF === 'all' || iv.status === statusF) &&
      (!q || iv.candidate?.toLowerCase().includes(q) || iv.role?.toLowerCase().includes(q) || iv.interviewer?.toLowerCase().includes(q))
    )
  }), [interviews, search, statusF])

  const handleScheduleSubmit = async (data) => {
    try {
      const payload = {
        candidate: data.candidate,
        role: data.role,
        round: data.round,
        interviewer: data.interviewer,
        date: data.date || new Date().toISOString().split('T')[0],
        time: data.time || '10:00 AM',
        mode: data.mode,
        duration: data.duration || '45 min',
        status: 'scheduled'
      }
      await recruitmentService.scheduleInterview(payload)
      setMsg(`Interview scheduled for ${data.candidate}!`)
      setTimeout(() => setMsg(''), 4000)
      await loadInterviews()
    } catch (err) {
      alert(err.message || 'Failed to schedule interview')
    }
  }

  const handleFeedbackSubmit = async (feedback) => {
    if (!fbTarget) return
    try {
      await recruitmentService.updateInterview(fbTarget.id, {
        feedback,
        status: 'completed'
      })
      setMsg(`Interview feedback recorded for ${fbTarget.candidate}!`)
      setTimeout(() => setMsg(''), 4000)
      await loadInterviews()
      setFbTarget(null)
    } catch (err) {
      alert(err.message || 'Failed to save feedback')
    }
  }

  const scheduled  = interviews.filter(i => i.status === 'scheduled').length
  const completed  = interviews.filter(i => i.status === 'completed').length
  const passCount  = interviews.filter(i => i.feedback?.decision === 'pass').length
  const rejectCount= interviews.filter(i => i.feedback?.decision === 'reject').length

  return (
    <div className="p-6">
      {/* ── Notification Banner ── */}
      <AnimatePresence>
        {msg && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-xs font-semibold text-emerald-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> {msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Summary ── */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Scheduled', value: scheduled,   color: 'text-blue-700 bg-blue-50 border-blue-200' },
          { label: 'Completed', value: completed,   color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
          { label: 'Passed',    value: passCount,   color: 'text-green-700 bg-green-50 border-green-200' },
          { label: 'Rejected',  value: rejectCount, color: 'text-red-700 bg-red-50 border-red-200' },
        ].map((c, i) => (
          <motion.div key={c.label}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className={`flex items-center gap-3 rounded-2xl border p-4 ${c.color}`}>
            <Calendar className="h-8 w-8 opacity-50" />
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
            placeholder="Candidate, interviewer, round…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        {['all', 'scheduled', 'completed', 'cancelled'].map(s => (
          <button key={s} onClick={() => setStatusF(s)}
            className={`rounded-xl px-3 py-2 text-sm font-medium transition cursor-pointer ${
              statusF === s ? 'bg-blue-600 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}>
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
        <span className="ml-auto text-sm text-slate-500">{filtered.length} interview{filtered.length !== 1 ? 's' : ''}</span>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={() => setSchModal(true)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 cursor-pointer shadow-xs">
          <Plus className="h-4 w-4" /> Schedule Interview
        </motion.button>
      </div>

      {/* ── Table ── */}
      <TableShell headers={['Candidate', 'Role', 'Round', 'Interviewer', 'Date & Time', 'Mode', 'Status', 'Feedback', 'Actions']}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={9} />)
        ) : filtered.length === 0 ? (
          <tr><td colSpan={9}><EmptyState icon={Calendar} title="No interviews" description="No interviews match your current filters." /></td></tr>
        ) : (
          filtered.map((iv, i) => {
            const ModeIcon = MODE_ICON[iv.mode] || Video
            return (
              <motion.tr key={iv.id || i}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                className="group border-b border-slate-100 transition hover:bg-slate-50">
                <td className="pl-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <Avatar initials={iv.candidate ? iv.candidate.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0, 2) : 'U'} color={iv.avatarColor || iv.avatar_color || 'bg-blue-600'} size="sm" />
                    <span className="font-semibold text-slate-900">{iv.candidate}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-sm text-slate-600">{iv.role}</td>
                <td className="px-4 py-3.5">
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{iv.round}</span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">{iv.interviewer}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-xs text-slate-600">
                  <div className="font-semibold text-slate-800">{iv.date}</div>
                  <div className="text-slate-400">{iv.time} ({iv.duration || '45m'})</div>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <ModeIcon className="h-3.5 w-3.5 text-slate-400" />
                    <span>{iv.mode}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5"><StatusBadge status={iv.status} size="xs" /></td>
                <td className="px-4 py-3.5">
                  {iv.feedback ? (
                    <div className="flex items-center gap-1.5">
                      <StarRating value={iv.feedback.rating || 0} />
                      {iv.feedback.decision && (
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          iv.feedback.decision === 'pass' ? 'bg-emerald-50 text-emerald-700' :
                          iv.feedback.decision === 'reject' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {iv.feedback.decision}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No feedback yet</span>
                  )}
                </td>
                <td className="pr-5 py-3.5">
                  <button onClick={() => setFbTarget(iv)}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer">
                    <MessageSquare className="h-3.5 w-3.5 text-blue-500" /> Feedback
                  </button>
                </td>
              </motion.tr>
            )
          })
        )}
      </TableShell>

      {/* ── Feedback Modal ── */}
      <FeedbackModal open={!!fbTarget} onClose={() => setFbTarget(null)} interview={fbTarget} onSubmit={handleFeedbackSubmit} />

      {/* ── Schedule Modal ── */}
      <ScheduleModal open={schModal} onClose={() => setSchModal(false)} onSubmit={handleScheduleSubmit} />
    </div>
  )
}
