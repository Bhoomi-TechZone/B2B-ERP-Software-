import { useState, useMemo, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Plus, Search, FileText, Download, Send, Check, X,
  DollarSign, Calendar, User, Building2, Clock,
  TrendingUp, Award, AlertCircle, CheckCircle2
} from 'lucide-react'
import { jsPDF } from 'jspdf'
import { OFFERS } from '../data/recruitmentData'
import { StatusBadge, SkeletonRow, EmptyState, Modal, Avatar, TableShell } from './shared'
import recruitmentService from '../../../services/recruitmentService'

const STATUS_ICON = {
  accepted: { icon: Check,    color: 'text-emerald-500' },
  pending:  { icon: Clock,    color: 'text-amber-500'   },
  rejected: { icon: X,        color: 'text-red-500'     },
  draft:    { icon: FileText, color: 'text-slate-400'   },
}

const formatINR = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

// Dynamic Client-side PDF Offer Letter Generator
const generateOfferLetterPDF = (offer) => {
  if (!offer) return
  const doc = new jsPDF()

  // Header / Branding
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(18, 81, 197) // Royal Blue
  doc.text('WORKMATRIX HRMS', 20, 25)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 116, 139)
  doc.text(`Employment Offer Letter | Ref: ${offer.offer_id || offer.id || 'OFR-VERIFIED'}`, 20, 32)

  doc.setDrawColor(226, 232, 240)
  doc.line(20, 36, 190, 36)

  // Date & Candidate Details
  doc.setFontSize(11)
  doc.setTextColor(30, 41, 59)
  doc.text(`Date: ${offer.sent_on || offer.sentOn || new Date().toLocaleDateString('en-GB')}`, 20, 46)
  doc.text(`Dear ${offer.candidate || 'Candidate'},`, 20, 56)

  doc.setFont('helvetica', 'normal')
  doc.text(`We are pleased to offer you the position of ${offer.role || 'Team Member'} at our organization.`, 20, 66)
  doc.text(`We were thoroughly impressed with your experience and believe your contributions`, 20, 73)
  doc.text(`will be instrumental to our continued growth and success.`, 20, 80)

  // Offer Summary Box
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(20, 88, 170, 45, 3, 3, 'F')
  doc.setFont('helvetica', 'bold')
  doc.text('Position:', 26, 98)
  doc.setFont('helvetica', 'normal')
  doc.text(offer.role || 'Designation', 75, 98)

  doc.setFont('helvetica', 'bold')
  doc.text('Annual CTC:', 26, 107)
  doc.setFont('helvetica', 'normal')
  doc.text(offer.ctc || 'As discussed', 75, 107)

  doc.setFont('helvetica', 'bold')
  doc.text('Joining Date:', 26, 116)
  doc.setFont('helvetica', 'normal')
  doc.text(offer.joining_date || offer.joiningDate || 'Immediate', 75, 116)

  doc.setFont('helvetica', 'bold')
  doc.text('Notice Period:', 26, 125)
  doc.setFont('helvetica', 'normal')
  doc.text(offer.notice || '30 days', 75, 125)

  // Salary Component Breakdown
  doc.setFont('helvetica', 'bold')
  doc.text('Compensation Breakdown (Annual):', 20, 146)
  doc.setFont('helvetica', 'normal')
  let y = 156
  const breakdown = offer.breakdown || { basic: 700000, hra: 350000, special_allowance: 400000 }
  Object.entries(breakdown).forEach(([k, v]) => {
    const label = k.replace(/_/g, ' ').toUpperCase()
    doc.text(label, 26, y)
    doc.text(typeof v === 'number' ? formatINR(v) : String(v), 150, y)
    y += 9
  })

  doc.line(20, y + 2, 190, y + 2)
  y += 12
  doc.setFont('helvetica', 'bold')
  doc.text('Total CTC:', 26, y)
  doc.text(offer.ctc || 'Total', 150, y)

  // Signoff
  y += 24
  doc.setFont('helvetica', 'normal')
  doc.text('Sincerely,', 20, y)
  doc.text('Human Resources & Talent Acquisition', 20, y + 8)
  doc.text('WorkMatrix Enterprise Platform', 20, y + 15)

  doc.save(`Offer_Letter_${(offer.candidate || 'Candidate').replace(/\s+/g, '_')}.pdf`)
}

// ── Offer Detail Drawer ───────────────────────────────────────────────────────
const OfferDrawer = ({ offer, onClose, onDownload, onSend }) => {
  if (!offer) return null
  const breakdown = offer.breakdown || { basic: 700000, hra: 350000, special: 400000 }
  const total = Object.values(breakdown).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0)

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]" />
      <motion.div
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        className="fixed right-0 top-0 z-50 flex h-full w-96 flex-col border-l border-slate-200 bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <Avatar initials={offer.avatar || offer.candidate?.slice(0, 2).toUpperCase()} color={offer.avatarColor || offer.avatar_color || 'bg-emerald-600'} size="lg" />
            <div>
              <div className="font-bold text-slate-900 text-lg">{offer.candidate}</div>
              <div className="text-xs text-slate-500">{offer.role}</div>
              <div className="mt-1 flex items-center gap-2">
                <StatusBadge status={offer.status} size="xs" />
              </div>
            </div>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* CTC Hero */}
          <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-5 text-white">
            <div className="text-xs font-semibold uppercase tracking-wide text-blue-200 mb-1">Total CTC</div>
            <div className="text-3xl font-bold">{offer.ctc}</div>
            <div className="mt-2 flex items-center gap-3 text-xs text-blue-200">
              <span>Joining: {offer.joining_date || offer.joiningDate || 'TBD'}</span>
              <span>Notice: {offer.notice || '30 days'}</span>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Hiring Manager', value: offer.hm || 'HR Admin' },
              { label: 'Sent On',        value: offer.sent_on || offer.sentOn || 'Draft' },
              { label: 'Expires On',     value: offer.expires_on || offer.expiresOn || '30 days' },
              { label: 'Notice Period',  value: offer.notice || '30 days' },
            ].map(r => (
              <div key={r.label} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
                <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{r.label}</div>
                <div className="text-xs font-semibold text-slate-800 mt-0.5">{r.value}</div>
              </div>
            ))}
          </div>

          {/* Salary Breakdown */}
          <div>
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Compensation Breakdown</h4>
            <div className="space-y-2">
              {Object.entries(breakdown).map(([k, val]) => {
                const numVal = typeof val === 'number' ? val : 0
                const pct = total > 0 ? Math.round((numVal / total) * 100) : 0
                return (
                  <div key={k} className="rounded-xl border border-slate-100 p-2.5">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-600 capitalize">{k.replace(/_/g, ' ')}</span>
                      <span className="font-bold text-slate-900">{formatINR(numVal)} <span className="text-[10px] text-slate-400 font-normal">({pct}%)</span></span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
              <div className="flex items-center justify-between rounded-xl bg-blue-50 px-3 py-2.5 mt-2">
                <span className="text-sm font-bold text-blue-800">Total CTC (Annual)</span>
                <span className="text-sm font-bold text-blue-800">{formatINR(total)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => onDownload(offer)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 cursor-pointer shadow-xs">
              <Download className="h-4 w-4" /> Download Letter
            </motion.button>
            {offer.status === 'draft' && (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => onSend(offer)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100 cursor-pointer">
                <Send className="h-4 w-4" /> Send Offer
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </>
  )
}

// ── Generate Offer Modal ──────────────────────────────────────────────────────
const GenerateModal = ({ open, onClose, onSubmit }) => {
  const [form, setForm] = useState({ candidate: '', role: '', ctc: '', joiningDate: '', hm: '', notice: '30 days' })
  return (
    <Modal open={open} onClose={onClose} title="Generate Offer Letter" size="md">
      <div className="space-y-4">
        {[
          { key: 'candidate',   label: 'Candidate Name',   placeholder: 'e.g. Rahul Verma'         },
          { key: 'role',        label: 'Role',             placeholder: 'e.g. Frontend Engineer'    },
          { key: 'ctc',         label: 'CTC Package',      placeholder: 'e.g. ₹18,00,000 LPA'      },
          { key: 'hm',          label: 'Hiring Manager',   placeholder: 'e.g. Arjun Mehta'          },
        ].map(f => (
          <div key={f.key}>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">{f.label}</label>
            <input value={form[f.key]} placeholder={f.placeholder}
              onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none" />
          </div>
        ))}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Joining Date</label>
            <input type="date" value={form.joiningDate} onChange={e => setForm(p => ({...p, joiningDate: e.target.value}))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Notice Period</label>
            <select value={form.notice} onChange={e => setForm(p => ({...p, notice: e.target.value}))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none">
              {['Immediate', '15 days', '30 days', '60 days', '90 days'].map(n => <option key={n}>{n}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer">Cancel</button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => { onSubmit(form); onClose() }}
            className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 cursor-pointer shadow-xs">
            Generate Offer
          </motion.button>
        </div>
      </div>
    </Modal>
  )
}

// ── Main Offers Page ──────────────────────────────────────────────────────────
export default function OffersPage() {
  const [offers, setOffers]       = useState(OFFERS)
  const [loading, setLoading]     = useState(false)
  const [search, setSearch]       = useState('')
  const [statusF, setStatusF]     = useState('all')
  const [viewOffer, setViewOffer] = useState(null)
  const [genModal, setGenModal]   = useState(false)
  const [msg, setMsg]             = useState('')

  const loadOffers = useCallback(async () => {
    try {
      setLoading(true)
      const res = await recruitmentService.getOffers()
      if (Array.isArray(res) && res.length > 0) {
        setOffers(res)
      }
    } catch (err) {
      console.warn('Backend offers unavailable, using fallback data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOffers()
  }, [loadOffers])

  const filtered = useMemo(() => offers.filter(o => {
    const q = search.toLowerCase()
    return (
      (statusF === 'all' || o.status === statusF) &&
      (!q || o.candidate?.toLowerCase().includes(q) || o.role?.toLowerCase().includes(q))
    )
  }), [offers, search, statusF])

  const handleGenerate = async (data) => {
    try {
      const payload = {
        candidate: data.candidate,
        role: data.role,
        ctc: data.ctc,
        joining_date: data.joiningDate || new Date().toISOString().split('T')[0],
        notice: data.notice,
        status: 'draft',
        breakdown: { basic: 700000, hra: 350000, special: 400000 }
      }
      await recruitmentService.createOffer(payload)
      setMsg(`Offer letter drafted for ${data.candidate}!`)
      setTimeout(() => setMsg(''), 4000)
      await loadOffers()
    } catch (err) {
      alert(err.message || 'Failed to create offer')
    }
  }

  const handleSendOffer = async (offer) => {
    try {
      await recruitmentService.updateOffer(offer.id, { status: 'pending' })
      setMsg(`Offer extended to ${offer.candidate}!`)
      setTimeout(() => setMsg(''), 4000)
      await loadOffers()
      setViewOffer(null)
    } catch (err) {
      alert(err.message || 'Failed to send offer')
    }
  }

  const accepted = offers.filter(o => o.status === 'accepted').length
  const pending  = offers.filter(o => o.status === 'pending').length
  const rejected = offers.filter(o => o.status === 'rejected').length

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
          { label: 'Total Offers', value: offers.length, color: 'text-slate-700 bg-slate-50 border-slate-200' },
          { label: 'Accepted',     value: accepted,      color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
          { label: 'Pending',      value: pending,       color: 'text-amber-700 bg-amber-50 border-amber-200' },
          { label: 'Declined',     value: rejected,      color: 'text-red-700 bg-red-50 border-red-200' },
        ].map((c, i) => (
          <motion.div key={c.label}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className={`flex items-center gap-3 rounded-2xl border p-4 ${c.color}`}>
            <Award className="h-8 w-8 opacity-50" />
            <div>
              <div className="text-2xl font-bold">{c.value}</div>
              <div className="text-xs font-medium text-slate-500">{c.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-56">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Candidate or role…"
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-blue-400 focus:outline-none" />
          </div>
          <select value={statusF} onChange={e => setStatusF(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none">
            {['all', 'draft', 'pending', 'accepted', 'rejected'].map(s => (
              <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>

        <button onClick={() => setGenModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition cursor-pointer shadow-xs">
          <Plus className="h-4 w-4" /> Create Offer
        </button>
      </div>

      {/* ── Table ── */}
      <TableShell headers={['Candidate', 'Role', 'CTC Package', 'Joining Date', 'Status', 'Sent On', 'Actions']}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={7} />)
        ) : filtered.length === 0 ? (
          <tr><td colSpan={7}><EmptyState icon={FileText} title="No offers found" description="Generate your first candidate offer letter." /></td></tr>
        ) : (
          filtered.map((o, i) => (
            <motion.tr key={o.id || i}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              className="group border-b border-slate-100 transition hover:bg-slate-50">
              <td className="pl-5 py-3.5">
                <div className="flex items-center gap-3">
                  <Avatar initials={o.avatar || o.candidate?.slice(0, 2).toUpperCase()} color={o.avatarColor || o.avatar_color || 'bg-emerald-600'} size="md" />
                  <span className="font-semibold text-slate-900">{o.candidate}</span>
                </div>
              </td>
              <td className="px-4 py-3.5 text-sm font-medium text-slate-700">{o.role}</td>
              <td className="px-4 py-3.5 text-sm font-bold text-slate-900">{o.ctc}</td>
              <td className="px-4 py-3.5 text-sm text-slate-600">{o.joining_date || o.joiningDate || 'Immediate'}</td>
              <td className="px-4 py-3.5"><StatusBadge status={o.status} size="xs" /></td>
              <td className="px-4 py-3.5 text-xs text-slate-400">{o.sent_on || o.sentOn || 'Draft'}</td>
              <td className="pr-5 py-3.5">
                <div className="flex items-center gap-2">
                  <button onClick={() => setViewOffer(o)}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition cursor-pointer">
                    <FileText className="h-3.5 w-3.5" /> View
                  </button>
                  <button onClick={() => generateOfferLetterPDF(o)}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                    title="Download PDF Offer Letter">
                    <Download className="h-3.5 w-3.5" /> Download
                  </button>
                </div>
              </td>
            </motion.tr>
          ))
        )}
      </TableShell>

      {/* ── Detail Drawer ── */}
      <AnimatePresence>
        {viewOffer && (
          <OfferDrawer
            offer={viewOffer}
            onClose={() => setViewOffer(null)}
            onDownload={generateOfferLetterPDF}
            onSend={handleSendOffer}
          />
        )}
      </AnimatePresence>

      {/* ── Generate Modal ── */}
      <GenerateModal open={genModal} onClose={() => setGenModal(false)} onSubmit={handleGenerate} />
    </div>
  )
}
