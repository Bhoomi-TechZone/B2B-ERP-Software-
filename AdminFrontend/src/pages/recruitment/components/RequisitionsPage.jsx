import { useState, useMemo, useEffect } from 'react'
import { Plus, Search, Check, X, Building2, Hash, Clock, Eye, AlertCircle } from 'lucide-react'
import { getRequisitions, createRequisition, updateStatus } from '../data/recruitmentData'

// ─── Constants ───────────────────────────────────────────────────────────────
const DEPT_OPTIONS = ['All', 'Engineering', 'Product', 'Design', 'Sales', 'Analytics', 'HR', 'Marketing']
const STATUS_OPTIONS = ['all', 'open', 'pending', 'closed']

const initialForm = {
  title: '',
  department: 'Engineering',
  hiringManager: '',
  headcount: 1,
  priority: 'medium',
  budget: ''
}

// ─── Inline shared components (framer-motion pe dependency nahi) ──────────────

function StatusBadge({ status }) {
  const map = {
    open:    'bg-green-100 text-green-700 border border-green-200',
    pending: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    closed:  'bg-red-100 text-red-700 border border-red-200',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}

function PriorityBadge({ priority }) {
  const map = {
    high:   'bg-red-50 text-red-600 border border-red-200',
    medium: 'bg-orange-50 text-orange-600 border border-orange-200',
    low:    'bg-blue-50 text-blue-600 border border-blue-200',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${map[priority] ?? 'bg-gray-100 text-gray-600'}`}>
      {priority}
    </span>
  )
}

function SkeletonRow({ cols }) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </td>
      ))}
    </tr>
  )
}

function EmptyState({ title = 'No Data', subtitle = '' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <Hash className="w-10 h-10 mb-3 opacity-30" />
      <p className="font-medium text-gray-500">{title}</p>
      {subtitle && <p className="text-sm mt-1">{subtitle}</p>}
    </div>
  )
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X size={18} className="text-gray-500" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

// ─── View Detail Modal ────────────────────────────────────────────────────────
function ViewModal({ req, onClose }) {
  if (!req) return null
  return (
    <Modal open={!!req} onClose={onClose} title="Requisition Details">
      <div className="space-y-3 text-sm">
        {[
          ['ID', req.id],
          ['Title', req.title],
          ['Department', req.department],
          ['Hiring Manager', req.hiringManager],
          ['Headcount', req.headcount],
          ['Priority', req.priority],
          ['Status', req.status],
          ['Created At', req.createdAt],
          ['Budget', req.budget ?? '—'],
        ].map(([label, val]) => (
          <div key={label} className="flex justify-between">
            <span className="text-gray-500 font-medium">{label}</span>
            <span className="text-gray-800">{val}</span>
          </div>
        ))}
      </div>
    </Modal>
  )
}

// ─── Error Banner ─────────────────────────────────────────────────────────────
function ErrorBanner({ message, onRetry }) {
  return (
    <div className="mb-4 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
      <AlertCircle size={16} className="shrink-0" />
      <span className="flex-1">{message}</span>
      {onRetry && (
        <button onClick={onRetry} className="underline font-medium hover:text-red-900">
          Retry
        </button>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RequisitionsPage() {
  const [loading, setLoading]     = useState(true)
  const [reqs, setReqs]           = useState([])
  const [search, setSearch]       = useState('')
  const [deptF, setDeptF]         = useState('All')
  const [statusF, setStatusF]     = useState('all')
  const [modalOpen, setModal]     = useState(false)
  const [viewItem, setView]       = useState(null)
  const [form, setForm]           = useState(initialForm)
  const [error, setError]         = useState(null)
  const [saving, setSaving]       = useState(false)
  const [actionId, setActionId]   = useState(null) // track which row is being updated

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await getRequisitions()
      // Handle both array and {data: [...]} shapes
      const list = Array.isArray(res.data) ? res.data : (res.data?.results ?? res.data?.data ?? [])
      setReqs(list)
    } catch (err) {
      const msg = err.code === 'ERR_NETWORK'
        ? 'Backend server se connection nahi ho pa raha (https://b2bbackend.btplsoft.com). Server chal raha hai?'
        : `Data load nahi hua: ${err.response?.data?.detail ?? err.message}`
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData()
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => reqs.filter(r => {
    const q = search.toLowerCase()
    return (
      (deptF === 'All' || r.department === deptF) &&
      (statusF === 'all' || r.status === statusF) &&
      (!q ||
        (r.title ?? '').toLowerCase().includes(q) ||
        (r.hiringManager ?? '').toLowerCase().includes(q))
    )
  }), [reqs, search, deptF, statusF])

  // ── Create ─────────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!form.title.trim() || !form.hiringManager.trim()) {
      alert('Title aur Manager dono zaroori hain')
      return
    }
    try {
      setSaving(true)
      const res = await createRequisition(form)
      const newItem = res.data?.data ?? res.data
      setReqs(prev => [newItem, ...prev])
      setForm(initialForm)
      setModal(false)
    } catch (err) {
      alert(`Create nahi hua: ${err.response?.data?.detail ?? err.message}`)
    } finally {
      setSaving(false)
    }
  }

  // ── Approve ────────────────────────────────────────────────────────────────
  const handleApprove = async (id) => {
    try {
      setActionId(id)
      await updateStatus(id, 'open')
      setReqs(prev => prev.map(r => r.id === id ? { ...r, status: 'open' } : r))
    } catch (err) {
      alert(`Approve nahi hua: ${err.response?.data?.detail ?? err.message}`)
    } finally {
      setActionId(null)
    }
  }

  // ── Reject ─────────────────────────────────────────────────────────────────
  const handleReject = async (id) => {
    try {
      setActionId(id)
      await updateStatus(id, 'closed')
      setReqs(prev => prev.map(r => r.id === id ? { ...r, status: 'closed' } : r))
    } catch (err) {
      alert(`Reject nahi hua: ${err.response?.data?.detail ?? err.message}`)
    } finally {
      setActionId(null)
    }
  }

  // ── Stats ──────────────────────────────────────────────────────────────────
  const openCount   = reqs.filter(r => r.status === 'open').length
  const closedCount = reqs.filter(r => r.status === 'closed').length
  const deptCount   = [...new Set(reqs.map(r => r.department))].length

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 min-h-screen bg-gray-50">

      {/* PAGE HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Job Requisitions</h1>
        <p className="text-sm text-gray-500 mt-1">Manage and track all hiring requests</p>
      </div>

      {/* ERROR BANNER */}
      {error && <ErrorBanner message={error} onRetry={fetchData} />}

      {/* SUMMARY CARDS */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total',       value: reqs.length, icon: Hash,      color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Open',        value: openCount,   icon: Clock,     color: 'text-green-600',  bg: 'bg-green-50'  },
          { label: 'Closed',      value: closedCount, icon: Check,     color: 'text-red-500',    bg: 'bg-red-50'    },
          { label: 'Departments', value: deptCount,   icon: Building2, color: 'text-blue-600',   bg: 'bg-blue-50'   },
        ].map(c => (
          <div key={c.label} className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
            <div className={`inline-flex p-2 rounded-lg mb-2 ${c.bg}`}>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{loading ? '—' : c.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{c.label}</div>
          </div>
        ))}
      </div>

      {/* FILTER BAR */}
      <div className="mb-4 flex flex-wrap gap-3 items-center bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search title or manager..."
            className="pl-8 pr-3 py-2 w-full text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <select
          value={deptF}
          onChange={e => setDeptF(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          {DEPT_OPTIONS.map(d => <option key={d}>{d}</option>)}
        </select>

        <select
          value={statusF}
          onChange={e => setStatusF(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          {STATUS_OPTIONS.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>

        <button
          onClick={() => setModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={15} />
          New Requisition
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['ID', 'Title', 'Department', 'Manager', 'Count', 'Priority', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={9} />)
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <EmptyState
                      title={error ? 'Data load nahi hua' : 'Koi requisition nahi mili'}
                      subtitle={error ? 'Upar error check karein' : 'Filter change karein ya naya create karein'}
                    />
                  </td>
                </tr>
              ) : (
                filtered.map(req => (
                  <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{req.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{req.title}</td>
                    <td className="px-4 py-3 text-gray-600">{req.department}</td>
                    <td className="px-4 py-3 text-gray-600">{req.hiringManager}</td>
                    <td className="px-4 py-3 text-center font-medium">{req.headcount}</td>
                    <td className="px-4 py-3"><PriorityBadge priority={req.priority} /></td>
                    <td className="px-4 py-3"><StatusBadge status={req.status} /></td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{req.createdAt}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {/* View */}
                        <button
                          onClick={() => setView(req)}
                          title="View"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          <Eye size={15} />
                        </button>

                        {/* Approve */}
                        <button
                          onClick={() => handleApprove(req.id)}
                          disabled={actionId === req.id || req.status === 'open'}
                          title="Approve"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Check size={15} />
                        </button>

                        {/* Reject */}
                        <button
                          onClick={() => handleReject(req.id)}
                          disabled={actionId === req.id || req.status === 'closed'}
                          title="Reject"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* TABLE FOOTER */}
        {!loading && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} dikh rahe hain
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      <Modal open={modalOpen} onClose={() => { setModal(false); setForm(initialForm) }} title="Naya Requisition Create Karein">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Job Title *</label>
            <input
              placeholder="e.g. Senior React Developer"
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Department</label>
            <select
              value={form.department}
              onChange={e => setForm(p => ({ ...p, department: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {DEPT_OPTIONS.filter(d => d !== 'All').map(d => <option key={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Hiring Manager *</label>
            <input
              placeholder="e.g. Rahul Sharma"
              value={form.hiringManager}
              onChange={e => setForm(p => ({ ...p, hiringManager: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Headcount</label>
              <input
                type="number"
                min={1}
                value={form.headcount}
                onChange={e => setForm(p => ({ ...p, headcount: Number(e.target.value) }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
              <select
                value={form.priority}
                onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {['low', 'medium', 'high'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Budget (optional)</label>
            <input
              placeholder="e.g. 12,00,000"
              value={form.budget}
              onChange={e => setForm(p => ({ ...p, budget: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => { setModal(false); setForm(initialForm) }}
              className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={saving}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-medium py-2 rounded-lg transition-colors"
            >
              {saving ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>

      {/* VIEW DETAIL MODAL */}
      <ViewModal req={viewItem} onClose={() => setView(null)} />

    </div>
  )
}
