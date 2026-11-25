import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, Search, Edit2, Trash2, X, CheckCircle, XCircle, ChevronDown, RefreshCw, AlertCircle } from 'lucide-react'
import { getPolicies, createPolicy, updatePolicy, deletePolicy } from '../data/leaveData'

// ── Leave Types ────────────────────────────────────────────────────────────────
const LEAVE_TYPES = [
  { id: 'CL',  label: 'Casual Leave' },
  { id: 'SL',  label: 'Sick Leave' },
  { id: 'EL',  label: 'Earned Leave' },
  { id: 'ML',  label: 'Maternity Leave' },
  { id: 'PL',  label: 'Paternity Leave' },
  { id: 'LWP', label: 'Leave Without Pay' },
  { id: 'CO',  label: 'Compensatory Off' },
]

// ── Helpers ────────────────────────────────────────────────────────────────────
const TYPE_COLOR = {
  CL:  'bg-blue-100 text-blue-700',
  SL:  'bg-red-100 text-red-700',
  EL:  'bg-green-100 text-green-700',
  ML:  'bg-pink-100 text-pink-700',
  PL:  'bg-violet-100 text-violet-700',
  LWP: 'bg-orange-100 text-orange-700',
  CO:  'bg-amber-100 text-amber-700',
}

const typeLabel = (id) => LEAVE_TYPES.find(t => t.id === id)?.label ?? id

function StatusBadge({ status }) {
  const isActive = status?.toLowerCase() === 'active'
  return isActive
    ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700"><CheckCircle className="h-3 w-3" />Active</span>
    : <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500"><XCircle className="h-3 w-3" />Inactive</span>
}

// ── Add / Edit Modal ───────────────────────────────────────────────────────────
const EMPTY_FORM = {
  policy_name:       '',
  leave_type:        'CL',
  total_days:        '',
  carry_forward_days: 0,
  is_paid:           true,
  status:            'Active',
}

function PolicyModal({ open, onClose, onSave, initial, saving }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})

  // Sync form whenever modal opens or target changes
  useEffect(() => {
    if (open) {
      if (initial) {
        setForm({
          policy_name:       initial.policy_name       ?? '',
          leave_type:        initial.leave_type        ?? 'CL',
          total_days:        initial.total_days        ?? '',
          carry_forward_days: initial.carry_forward_days ?? 0,
          is_paid:           initial.is_paid           ?? true,
          status:            initial.status            ?? 'Active',
        })
      } else {
        setForm(EMPTY_FORM)
      }
      setErrors({})
    }
  }, [open, initial])

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.policy_name.trim()) errs.policy_name = 'Policy name is required'
    if (!form.total_days || Number(form.total_days) < 1) errs.total_days = 'Total days must be at least 1'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    onSave({
      ...form,
      total_days:        parseInt(form.total_days),
      carry_forward_days: parseInt(form.carry_forward_days) || 0,
    })
  }

  if (!open) return null

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="policy-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            key="policy-modal"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', stiffness: 340, damping: 26 }}
            className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-bold text-slate-900">
                {initial ? 'Edit Policy' : 'Add Leave Policy'}
              </h2>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="space-y-4 px-6 py-5">
              {/* Policy Name */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Policy Name *
                </label>
                <input
                  value={form.policy_name}
                  onChange={e => set('policy_name', e.target.value)}
                  placeholder="e.g. Annual Earned Leave"
                  className={`w-full rounded-xl border bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:bg-white focus:ring-2 ${errors.policy_name ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100'}`}
                />
                {errors.policy_name && <p className="mt-1 text-xs text-red-500">{errors.policy_name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Leave Type */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Leave Type *
                  </label>
                  <div className="relative">
                    <select
                      value={form.leave_type}
                      onChange={e => set('leave_type', e.target.value)}
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    >
                      {LEAVE_TYPES.map(t => (
                        <option key={t.id} value={t.id}>{t.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                {/* Total Days */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Total Days *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.total_days}
                    onChange={e => set('total_days', e.target.value)}
                    placeholder="e.g. 12"
                    className={`w-full rounded-xl border bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:bg-white focus:ring-2 ${errors.total_days ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100'}`}
                  />
                  {errors.total_days && <p className="mt-1 text-xs text-red-500">{errors.total_days}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Carry Forward */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Carry Forward Days
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.carry_forward_days}
                    onChange={e => set('carry_forward_days', e.target.value)}
                    placeholder="0"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </label>
                  <div className="relative">
                    <select
                      value={form.status}
                      onChange={e => set('status', e.target.value)}
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Paid Toggle */}
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Paid Leave</p>
                  <p className="text-xs text-slate-500">Employees receive salary during this leave</p>
                </div>
                <button
                  onClick={() => set('is_paid', !form.is_paid)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${form.is_paid ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${form.is_paid ? 'left-5' : 'left-0.5'}`}
                  />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button
                onClick={onClose}
                disabled={saving}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
              >
                {saving && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                {initial ? 'Save Changes' : 'Add Policy'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function PoliciesPage() {
  const [policies, setPolicies]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [search, setSearch]         = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [addOpen, setAddOpen]       = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [saving, setSaving]         = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  // ── Fetch ──
  useEffect(() => { fetchPolicies() }, [])

  async function fetchPolicies() {
    try {
      setLoading(true)
      setError(null)
      const data = await getPolicies()
      setPolicies(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to fetch policies:', err)
      setError(err.message || 'Failed to load policies')
      setPolicies([])
    } finally {
      setLoading(false)
    }
  }

  // ── Create ──
  const handleAddPolicy = async (formData) => {
    setSaving(true)
    try {
      await createPolicy({
        policy_name:       formData.policy_name,
        leave_type:        formData.leave_type,
        total_days:        formData.total_days,
        carry_forward_days: formData.carry_forward_days,
        is_paid:           formData.is_paid,
        status:            formData.status,
      })
      setAddOpen(false)
      await fetchPolicies()
    } catch (err) {
      console.error('Failed to create policy:', err)
      alert('Failed to create policy: ' + (err.response?.data?.detail || err.message || 'Unknown error'))
    } finally {
      setSaving(false)
    }
  }

  // ── Update ──
  const handleUpdatePolicy = async (formData) => {
    if (!editTarget) return
    const policyId = editTarget._id || editTarget.id
    setSaving(true)
    try {
      await updatePolicy(policyId, {
        policy_name:       formData.policy_name,
        leave_type:        formData.leave_type,
        total_days:        formData.total_days,
        carry_forward_days: formData.carry_forward_days,
        is_paid:           formData.is_paid,
        status:            formData.status,
      })
      setEditTarget(null)
      await fetchPolicies()
    } catch (err) {
      console.error('Failed to update policy:', err)
      alert('Failed to update policy: ' + (err.response?.data?.detail || err.message || 'Unknown error'))
    } finally {
      setSaving(false)
    }
  }

  // ── Delete ──
  const handleDeletePolicy = async (policyId) => {
  if (!policyId) {
    console.error("Policy ID is missing!", policyId);
    alert("Invalid policy ID");
    return;
  }

  if (!window.confirm('Are you sure you want to delete this policy?')) return;

  setDeletingId(policyId);

  try {
    await deletePolicy(policyId);
    await fetchPolicies();
  } catch (err) {
    console.error('Failed to delete policy:', err);
    alert(
      'Failed to delete policy: ' +
      (err.response?.data?.detail || err.message || 'Unknown error')
    );
  } finally {
    setDeletingId(null);
  }
};

  // ── Derived data ──
  const filtered = policies.filter(p => {
    const name = p.policy_name?.toLowerCase() ?? ''
    const type = p.leave_type?.toLowerCase() ?? ''
    if (search && !name.includes(search.toLowerCase()) && !type.includes(search.toLowerCase())) return false
    if (typeFilter !== 'all' && p.leave_type !== typeFilter) return false
    if (statusFilter !== 'all' && p.status?.toLowerCase() !== statusFilter) return false
    return true
  })

  const activeCount   = policies.filter(p => p.status?.toLowerCase() === 'active').length
  const inactiveCount = policies.length - activeCount
  const uniqueTypes   = new Set(policies.map(p => p.leave_type)).size

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
        <div className="h-10 w-full rounded-xl bg-slate-100 animate-pulse" />
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-14 border-b border-slate-100 animate-pulse bg-slate-50" />
          ))}
        </div>
      </div>
    )
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-64 gap-4">
        <div className="flex items-center gap-2 text-red-500">
          <AlertCircle className="h-5 w-5" />
          <p className="font-semibold">{error}</p>
        </div>
        <button
          onClick={fetchPolicies}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Policies', value: policies.length, bg: 'bg-blue-50',    text: 'text-blue-700'    },
          { label: 'Active',         value: activeCount,     bg: 'bg-emerald-50', text: 'text-emerald-700' },
          { label: 'Inactive',       value: inactiveCount,   bg: 'bg-slate-50',   text: 'text-slate-600'   },
          { label: 'Leave Types',    value: uniqueTypes,     bg: 'bg-violet-50',  text: 'text-violet-700'  },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`rounded-2xl ${s.bg} p-4 border border-white`}
          >
            <p className={`text-3xl font-bold ${s.text}`}>{s.value}</p>
            <p className="mt-1 text-sm font-medium text-slate-500">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search policies…"
              className="rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Type filter */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-400"
            >
              <option value="all">All Types</option>
              {LEAVE_TYPES.map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-slate-400" />
          </div>

          {/* Status filter */}
          <div className="flex rounded-xl border border-slate-200 bg-white p-0.5 shadow-sm text-sm">
            {[
              { value: 'all',      label: 'All'      },
              { value: 'active',   label: 'Active'   },
              { value: 'inactive', label: 'Inactive' },
            ].map(s => (
              <button
                key={s.value}
                onClick={() => setStatusFilter(s.value)}
                className={`rounded-lg px-3 py-1.5 font-medium transition ${statusFilter === s.value ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Refresh */}
          <button
            onClick={fetchPolicies}
            title="Refresh"
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-400 shadow-sm transition hover:text-blue-600 hover:border-blue-300"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> Add Policy
        </motion.button>
      </div>

      {/* ── Table ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                {['Policy Name', 'Leave Type', 'Total Days', 'Carry Forward', 'Paid', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-sm text-slate-400">
                    {policies.length === 0
                      ? 'No policies found. Click "Add Policy" to create one.'
                      : 'No policies match your filters.'
                    }
                  </td>
                </tr>
              ) : (
                filtered.map((p, i) => {
                  // Handle both id and _id from backend
                  const policyId = p.id || p._id
                  const isDeleting = deletingId === policyId 
                  return (
                    <motion.tr
                      key={policyId ?? i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={`group transition hover:bg-slate-50 ${isDeleting ? 'opacity-40' : ''}`}
                    >
                      {/* Policy Name */}
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-slate-800">{p.policy_name}</p>
                      </td>

                      {/* Leave Type */}
                      <td className="px-5 py-3.5">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${TYPE_COLOR[p.leave_type] ?? 'bg-slate-100 text-slate-600'}`}>
                          {typeLabel(p.leave_type)}
                        </span>
                      </td>

                      {/* Total Days */}
                      <td className="px-5 py-3.5 text-sm font-semibold text-slate-700">
                        {p.total_days} days
                      </td>

                      {/* Carry Forward */}
                      <td className="px-5 py-3.5">
                        {p.carry_forward_days > 0
                          ? <span className="text-sm font-medium text-emerald-600">Up to {p.carry_forward_days} days</span>
                          : <span className="text-sm text-slate-400">None</span>
                        }
                      </td>

                      {/* Paid */}
                      <td className="px-5 py-3.5">
                        {p.is_paid
                          ? <span className="text-sm font-medium text-emerald-600">✓ Paid</span>
                          : <span className="text-sm text-slate-400">Unpaid</span>
                        }
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <StatusBadge status={p.status} />
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1 opacity-100">
                          <button
                            onClick={() => setEditTarget(p)}
                            disabled={isDeleting}
                            title="Edit policy"
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600 disabled:pointer-events-none"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePolicy(policyId)}
                            disabled={isDeleting}
                            title="Delete policy"
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:pointer-events-none"
                          >
                            {isDeleting
                              ? <RefreshCw className="h-4 w-4 animate-spin" />
                              : <Trash2 className="h-4 w-4" />
                            }
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="border-t border-slate-100 px-5 py-3">
            <p className="text-xs text-slate-400">
              Showing <span className="font-semibold text-slate-600">{filtered.length}</span> of{' '}
              <span className="font-semibold text-slate-600">{policies.length}</span> policies
            </p>
          </div>
        )}
      </motion.div>

      {/* ── Modals ── */}
      <PolicyModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={handleAddPolicy}
        initial={null}
        saving={saving}
      />
      <PolicyModal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSave={handleUpdatePolicy}
        initial={editTarget}
        saving={saving}
      />
    </div>
  )
}
