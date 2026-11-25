import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import axios from 'axios'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  RefreshCw,
  Calendar,
  MapPin,
  Loader2,
} from 'lucide-react'

import { API_BASE_URL as CONFIG_API_BASE } from '../../../../config/api'

// Strip trailing /api so endpoints work on both local and production
const API_ROOT = (CONFIG_API_BASE || '').replace(/\/api\/?$/, '') ||
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8000'
    : 'https://b2bbackend.btplsoft.com')

const api = axios.create({
  baseURL: API_ROOT,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token') || localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

const REGIONS = [
  'All India',
  'North',
  'South',
  'East',
  'West',
  'Central',
]

const TYPE_COLOR = {
  National: 'bg-blue-100 text-blue-700 border-blue-200',
  Festival: 'bg-purple-100 text-purple-700 border-purple-200',
  Religious: 'bg-amber-100 text-amber-700 border-amber-200',
  Regional: 'bg-green-100 text-green-700 border-green-200',
}

function HolidayModal({
  open,
  onClose,
  onSave,
  initial,
  saving,
}) {
  const [form, setForm] = useState({
    name: '',
    holiday_date: '',
    type: 'National',
    region: 'All India',
    description: '',
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (open && initial) {
      setForm({
        name: initial.name || '',
        holiday_date: initial.holiday_date || '',
        type: initial.type || 'National',
        region: initial.region || 'All India',
        description: initial.description || '',
      })
    } else if (open) {
      setForm({
        name: '',
        holiday_date: '',
        type: 'National',
        region: 'All India',
        description: '',
      })
    }

    setErrors({})
  }, [open, initial])

  const set = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }))

    setErrors((prev) => ({
      ...prev,
      [key]: '',
    }))
  }

  const validate = () => {
    const errs = {}

    if (!form.name.trim()) {
      errs.name = 'Holiday name is required'
    }

    if (!form.holiday_date) {
      errs.holiday_date = 'Date is required'
    }

    setErrors(errs)

    return Object.keys(errs).length === 0
  }

  const handleSave = () => {
    if (!validate()) return

    onSave(form)
  }

  if (!open) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-xl rounded-3xl bg-white shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <h2 className="text-xl font-bold text-slate-900">
              {initial ? 'Edit Holiday' : 'Add Holiday'}
            </h2>

            <button
              onClick={onClose}
              className="rounded-xl p-2 transition hover:bg-slate-100"
            >
              <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>

          <div className="space-y-5 p-6">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase text-slate-500">
                Holiday Name *
              </label>

              <input
                type="text"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Enter holiday name"
                className={`w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none transition ${
                  errors.name
                    ? 'border-red-400'
                    : 'border-slate-200 focus:border-blue-500'
                }`}
              />

              {errors.name && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase text-slate-500">
                  Date *
                </label>

                <input
                  type="date"
                  value={form.holiday_date}
                  onChange={(e) => set('holiday_date', e.target.value)}
                  className={`w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none transition ${
                    errors.holiday_date
                      ? 'border-red-400'
                      : 'border-slate-200 focus:border-blue-500'
                  }`}
                />

                {errors.holiday_date && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.holiday_date}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase text-slate-500">
                  Type
                </label>

                <select
                  value={form.type}
                  onChange={(e) => set('type', e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                >
                  <option value="National">National</option>
                  <option value="Festival">Festival</option>
                  <option value="Religious">Religious</option>
                  <option value="Regional">Regional</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase text-slate-500">
                Region
              </label>

              <select
                value={form.region}
                onChange={(e) => set('region', e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              >
                {REGIONS.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase text-slate-500">
                Description
              </label>

              <textarea
                rows={3}
                value={form.description}
                onChange={(e) =>
                  set('description', e.target.value)
                }
                placeholder="Enter description"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-5">
            <button
              onClick={onClose}
              disabled={saving}
              className="rounded-2xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white"
            >
              {saving && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}

              {initial ? 'Update Holiday' : 'Add Holiday'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default function HolidayCalendarPage() {
  const [holidays, setHolidays] = useState([])

  const [loading, setLoading] = useState(true)

  const [saving, setSaving] = useState(false)

  const [deletingId, setDeletingId] = useState(null)

  const [search, setSearch] = useState('')

  const [typeFilter, setTypeFilter] = useState('all')

  const [regionFilter, setRegionFilter] = useState('all')

  const [addOpen, setAddOpen] = useState(false)

  const [editTarget, setEditTarget] = useState(null)

  // ====================================================
  // FETCH HOLIDAYS API
  // ====================================================

  const fetchHolidays = async () => {
    try {
      setLoading(true)

      const response = await api.get('/api/holidays/')

      const data = response.data?.data || response.data || []

      setHolidays(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch holidays', error)
      setHolidays([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHolidays()
  }, [])

  // ====================================================
  // FILTERS
  // ====================================================

  const filtered = useMemo(() => {
    return holidays.filter((holiday) => {
      if (
        search &&
        !holiday.name
          ?.toLowerCase()
          .includes(search.toLowerCase())
      ) {
        return false
      }

      if (
        typeFilter !== 'all' &&
        holiday.type !== typeFilter
      ) {
        return false
      }

      if (
        regionFilter !== 'all' &&
        holiday.region !== regionFilter
      ) {
        return false
      }

      return true
    })
  }, [holidays, search, typeFilter, regionFilter])

  // ====================================================
  // CREATE HOLIDAY
  // ====================================================

  const handleAdd = async (formData) => {
    try {
      setSaving(true)

      await api.post('/api/holidays/', formData)

      await fetchHolidays()
      setAddOpen(false)

    } catch (error) {
      console.error('Failed to create holiday', error)
      alert(error.response?.data?.detail || 'Failed to create holiday')
    } finally {
      setSaving(false)
    }
  }

  // ====================================================
  // UPDATE HOLIDAY
  // ====================================================

  const handleUpdate = async (formData) => {
    try {
      setSaving(true)

      const targetId = editTarget?._id || editTarget?.id
      await api.put(
        `/api/holidays/${targetId}/`,
        formData
      )

      await fetchHolidays()

      setEditTarget(null)
    } catch (error) {
      console.error('Failed to update holiday', error)
      alert('Failed to update holiday')
    } finally {
      setSaving(false)
    }
  }

  // ====================================================
  // DELETE HOLIDAY
  // ====================================================

 const handleDelete = async (id) => {
  if (!window.confirm('Are you sure you want to delete this holiday?')) {
    return
  }

  try {
    setDeletingId(id)

    await api.delete(`/api/holidays/${id}/`)

    await fetchHolidays()

  } catch (error) {
    console.error('Failed to delete holiday', error)
    alert('Failed to delete holiday')
  } finally {
    setDeletingId(null)
  }
}

  // ====================================================
  // STATS
  // ====================================================

  const stats = {
    total: holidays.length,

    national: holidays.filter(
      (h) => h.type === 'National'
    ).length,

    festival: holidays.filter(
      (h) => h.type === 'Festival'
    ).length,

    religious: holidays.filter(
      (h) => h.type === 'Religious'
    ).length,
  }

  return (
    <div className="space-y-6 p-6">
      {/* TOP STATS */}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            label: 'Total Holidays',
            value: stats.total,
            bg: 'bg-blue-50',
            color: 'text-blue-700',
          },

          {
            label: 'National',
            value: stats.national,
            bg: 'bg-indigo-50',
            color: 'text-indigo-700',
          },

          {
            label: 'Festival',
            value: stats.festival,
            bg: 'bg-purple-50',
            color: 'text-purple-700',
          },

          {
            label: 'Religious',
            value: stats.religious,
            bg: 'bg-amber-50',
            color: 'text-amber-700',
          },
        ].map((item) => (
          <div
            key={item.label}
            className={`${item.bg} rounded-3xl p-5`}
          >
            <h3
              className={`text-3xl font-bold ${item.color}`}
            >
              {item.value}
            </h3>

            <p className="mt-1 text-sm font-medium text-slate-500">
              {item.label}
            </p>
          </div>
        ))}
      </div>

      {/* TOOLBAR */}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />

            <input
              type="text"
              placeholder="Search holidays..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) =>
              setTypeFilter(e.target.value)
            }
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm"
          >
            <option value="all">All Types</option>
            <option value="National">National</option>
            <option value="Festival">Festival</option>
            <option value="Religious">Religious</option>
            <option value="Regional">Regional</option>
          </select>

          <select
            value={regionFilter}
            onChange={(e) =>
              setRegionFilter(e.target.value)
            }
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm"
          >
            <option value="all">All Regions</option>

            {REGIONS.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" />
          Add Holiday
        </button>
      </div>

      {/* TABLE */}

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                {[
                  'Holiday',
                  'Date',
                  'Type',
                  'Region',
                  'Description',
                  'Actions',
                ].map((head) => (
                  <th
                    key={head}
                    className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-16 text-center"
                  >
                    <div className="flex justify-center">
                      <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-16 text-center text-sm text-slate-400"
                  >
                    No holidays found
                  </td>
                </tr>
              ) : (
                filtered.map((holiday) => {
                  const isDeleting =
                    deletingId === holiday._id

                  return (
                    <tr
                      key={holiday._id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-600" />

                          <span className="font-semibold text-slate-800">
                            {holiday.name}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {holiday.date}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${TYPE_COLOR[holiday.type]}`}
                        >
                          {holiday.type}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <MapPin className="h-4 w-4" />
                          {holiday.region}
                        </div>
                      </td>

                      <td className="max-w-[250px] truncate px-6 py-4 text-sm text-slate-500">
                        {holiday.description}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              setEditTarget(holiday)
                            }
                            className="rounded-xl p-2 transition hover:bg-blue-50"
                          >
                            <Edit2 className="h-4 w-4 text-blue-600" />
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(holiday._id)
                            }
                            disabled={isDeleting}
                            className="rounded-xl p-2 transition hover:bg-red-50"
                          >
                            {isDeleting ? (
                              <RefreshCw className="h-4 w-4 animate-spin text-red-600" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-red-600" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > 0 && (
          <div className="border-t border-slate-100 px-6 py-4 text-xs text-slate-500">
            Showing {filtered.length} holidays
          </div>
        )}
      </div>

      {/* ADD MODAL */}

      <HolidayModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={handleAdd}
        saving={saving}
      />

      {/* EDIT MODAL */}

      <HolidayModal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSave={handleUpdate}
        initial={editTarget}
        saving={saving}
      />
    </div>
  )
}