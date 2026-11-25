import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, RefreshCw, Plus, Trash2, X, ChevronDown, Loader2 } from 'lucide-react'
import leaveService from '../../../services/leaveService'
import { useAuth } from '../../../hooks/useAuth'

const REGIONS = [
  'All India',
  'North',
  'South',
  'East',
  'West',
  'Central',
]

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}


function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay()
}

function HolidayModal({ open, onClose, onSave, saving }) {
  const [form, setForm] = useState({
    name: '',
    holiday_date: '',
    type: 'National',
    region: 'All India',
    description: '',
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (open) {
      setForm({
        name: '',
        holiday_date: '',
        type: 'National',
        region: 'All India',
        description: '',
      })
      setErrors({})
    }
  }, [open])

  const set = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
    setErrors(prev => ({ ...prev, [key]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Holiday name is required'
    if (!form.holiday_date) errs.holiday_date = 'Date is required'
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
          onClick={e => e.stopPropagation()}
          className="w-full max-w-xl rounded-3xl bg-white shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <h2 className="text-xl font-bold text-slate-900">Add Holiday</h2>
            <button onClick={onClose} className="rounded-xl p-2 transition hover:bg-slate-100">
              <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>

          <div className="space-y-5 p-6">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase text-slate-500">Holiday Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="Enter holiday name"
                className={`w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none transition ${errors.name ? 'border-red-400' : 'border-slate-200 focus:border-blue-500'}`}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase text-slate-500">Date *</label>
                <input
                  type="date"
                  value={form.holiday_date}
                  onChange={e => set('holiday_date', e.target.value)}
                  className={`w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none transition ${errors.holiday_date ? 'border-red-400' : 'border-slate-200 focus:border-blue-500'}`}
                />
                {errors.holiday_date && <p className="mt-1 text-xs text-red-500">{errors.holiday_date}</p>}
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase text-slate-500">Type</label>
                <select
                  value={form.type}
                  onChange={e => set('type', e.target.value)}
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
              <label className="mb-2 block text-xs font-bold uppercase text-slate-500">Region</label>
              <select
                value={form.region}
                onChange={e => set('region', e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              >
                {REGIONS.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase text-slate-500">Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Enter description"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-5">
            <button onClick={onClose} disabled={saving} className="rounded-2xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Add Holiday
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}


export default function CalendarPage() {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [view, setView] = useState('month')

  const { role: authRole } = useAuth()
  const role = authRole ?? localStorage.getItem("role") ?? "employee"
  const isAdmin = role === 'admin' || role === 'hr' || role === 'hr_admin'

  const [holidays, setHolidays] = useState([])
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [addHolidayOpen, setAddHolidayOpen] = useState(false)
  const [savingHoliday, setSavingHoliday] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const holRes = await leaveService.getHolidays()
      const holList = holRes?.data || holRes || []
      setHolidays(Array.isArray(holList) ? holList : [])

      const leavesRes = await leaveService.getAllLeaveRequests()
      setLeaves(Array.isArray(leavesRes) ? leavesRes : [])
    } catch (err) {
      console.error('Failed to load leave calendar data:', err)
      setError('Failed to load calendar data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAddHoliday = async (formData) => {
    try {
      setSavingHoliday(true)
      await leaveService.createHoliday(formData)
      setAddHolidayOpen(false)
      await loadData()
    } catch (err) {
      console.error('Failed to create holiday:', err)
      alert(err.response?.data?.detail || err.message || 'Failed to create holiday. Please try again.')
    } finally {
      setSavingHoliday(false)
    }
  }

  const handleDeleteHoliday = async (holidayId) => {
    if (!holidayId) return
    if (!window.confirm('Are you sure you want to delete this holiday?')) return
    try {
      await leaveService.deleteHoliday(holidayId)
      await loadData()
    } catch (err) {
      console.error('Failed to delete holiday:', err)
      alert(err.response?.data?.detail || err.message || 'Failed to delete holiday. Please try again.')
    }
  }

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const getDateString = (day) => {
    return `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const getLeaveForDate = (day) => {
    const dateStr = getDateString(day)
    const dayTime = new Date(dateStr).getTime()

    const match = leaves.find(l => {
      if ((l.status || '').toLowerCase() !== 'approved') return false
      const start = new Date(l.start_date.split('T')[0]).getTime()
      const end = new Date(l.end_date.split('T')[0]).getTime()
      return dayTime >= start && dayTime <= end
    })

    if (!match) return null

    const type = match.leave_type || match.leaveType || 'Casual'
    const colorClass = type.toLowerCase().includes('sick') ? 'bg-green-100 text-green-700' :
                       type.toLowerCase().includes('casual') ? 'bg-blue-100 text-blue-700' :
                       'bg-purple-100 text-purple-700'

    return {
      type: `${match.employee_name || match.empName || 'Staff'}: ${type}`,
      color: colorClass
    }
  }

  const getHolidayForDate = (day) => {
    const dateStr = getDateString(day)
    const match = holidays.find(h => {
      if (!h.holiday_date) return false
      const hDate = new Date(h.holiday_date).toISOString().split('T')[0]
      return hDate === dateStr
    })

    if (!match) return null
    return {
      name: match.name || match.holiday_name,
      color: 'bg-amber-100 text-amber-700'
    }
  }

  const isTodayDate = (day) => {
    return day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()
  }

  const isWeekend = (day) => {
    const date = new Date(currentYear, currentMonth, day)
    const dayOfWeek = date.getDay()
    return dayOfWeek === 0 || dayOfWeek === 6
  }

  // Generate calendar days
  const calendarDays = []
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  // Filter and format upcoming holidays
  const upcomingHolidays = holidays
    .filter(h => {
      if (!h.holiday_date) return false
      const hDate = new Date(h.holiday_date)
      hDate.setHours(0,0,0,0)
      const now = new Date()
      now.setHours(0,0,0,0)
      return hDate >= now
    })
    .sort((a, b) => new Date(a.holiday_date) - new Date(b.holiday_date))
    .slice(0, 5)
    .map(h => {
      const d = new Date(h.holiday_date)
      return {
        id: h._id || h.id,
        date: String(d.getDate()).padStart(2, '0'),
        month: d.toLocaleDateString('en-US', { month: 'short' }),
        name: h.name || h.holiday_name,
        subtitle: h.description || 'Public Holiday',
        type: h.type || 'Holiday'
      }
    })

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50 p-12">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm font-semibold text-slate-500">Loading leave calendar...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full bg-slate-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center shadow-sm">
            <p className="text-sm font-medium text-red-700">{error}</p>
            <button
              onClick={loadData}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-650 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Leave Calendar</h1>
            <p className="text-sm text-slate-500">View team holidays and team leaves</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setAddHolidayOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Add Holiday
            </button>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Calendar */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden"
          >
            {/* Calendar Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-900">
                {MONTHS[currentMonth]} {currentYear}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={prevMonth}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextMonth}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-6">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {DAYS.map(day => (
                  <div key={day} className="text-center text-xs font-semibold text-slate-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => {
                  if (!day) {
                    return <div key={`empty-${index}`} className="aspect-square" />
                  }

                  const leave = getLeaveForDate(day)
                  const holiday = getHolidayForDate(day)
                  const todayCheck = isTodayDate(day)
                  const isWeekendDay = isWeekend(day)

                  return (
                    <motion.div
                      key={day}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.005 }}
                      className={`aspect-square rounded-lg border p-2 transition cursor-pointer ${
                        todayCheck
                          ? 'border-blue-500 bg-blue-50'
                          : holiday
                          ? 'border-amber-200 bg-amber-50'
                          : leave
                          ? `border-${leave.color.split('-')[1]}-200 ${leave.color.split(' ')[0]}`
                          : isWeekendDay
                          ? 'border-slate-100 bg-slate-50'
                          : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex flex-col h-full">
                        <div className={`text-sm font-semibold ${
                          todayCheck
                            ? 'text-blue-700'
                            : holiday
                            ? 'text-amber-700'
                            : leave
                            ? leave.color.split(' ')[1]
                            : isWeekendDay
                            ? 'text-slate-400'
                            : 'text-slate-700'
                        }`}>
                          {day}
                        </div>

                        {leave && (
                          <div className="mt-1 min-w-0">
                            <div className={`text-[10px] truncate rounded px-1 py-0.5 font-medium ${leave.color}`} title={leave.type}>
                              {leave.type}
                            </div>
                          </div>
                        )}

                        {holiday && (
                          <div className="mt-1 min-w-0">
                            <div className="text-[10px] truncate rounded bg-amber-100 px-1 py-0.5 text-amber-700 font-medium" title={holiday.name}>
                              {holiday.name}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="border-t border-slate-100 px-6 py-4">
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-blue-100" />
                  <span className="text-slate-600">Casual Leave</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-green-100" />
                  <span className="text-slate-600">Sick Leave</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-purple-100" />
                  <span className="text-slate-600">Other Leave</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-amber-100" />
                  <span className="text-slate-600">Holiday</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-slate-100" />
                  <span className="text-slate-600">Weekend</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Holidays Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-slate-200 bg-white shadow-sm self-start"
          >
            <div className="border-b border-slate-100 px-6 py-4">
              <h3 className="text-base font-bold text-slate-900">Upcoming Holidays</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {upcomingHolidays.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-400">
                  No upcoming holidays.
                </div>
              ) : (
                upcomingHolidays.map((holiday, i) => (
                  <div key={holiday.id || i} className="flex items-center gap-4 px-6 py-4">
                    <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-amber-50 border border-amber-200 flex-shrink-0">
                      <span className="text-lg font-bold text-amber-700">{holiday.date}</span>
                      <span className="text-[10px] font-semibold uppercase text-amber-600">{holiday.month}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate" title={holiday.name}>{holiday.name}</p>
                      <p className="text-xs text-slate-500 truncate" title={holiday.subtitle}>{holiday.subtitle}</p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 flex-shrink-0 mr-1">
                      {holiday.type}
                    </span>
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteHoliday(holiday.id)}
                        className="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 transition cursor-pointer flex-shrink-0"
                        title="Delete Holiday"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
      <HolidayModal
        open={addHolidayOpen}
        onClose={() => setAddHolidayOpen(false)}
        onSave={handleAddHoliday}
        saving={savingHoliday}
      />
    </div>
  )
}
