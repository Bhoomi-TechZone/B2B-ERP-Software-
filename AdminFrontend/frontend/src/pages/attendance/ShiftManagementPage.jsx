import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Clock, Plus, Filter, Search, MoreVertical, 
  Settings2, Users, Calendar, ArrowRightLeft,
  Moon, Sun, Coffee, Zap, ShieldAlert,
  Edit, Trash2, Check, X, AlertTriangle,
  ChevronLeft, ChevronRight, Copy, Info,
  Briefcase, Download, RefreshCw, Eye
} from 'lucide-react'
import attendanceService from '../../services/attendanceService'
import employeeService from '../../services/employeeService'
import departmentService from '../../services/departmentService'

const SHIFT_TYPES = [
  { id: 'fixed',      label: 'Fixed Shift',    icon: Sun,            color: 'text-orange-600 bg-orange-50 border-orange-100' },
  { id: 'night',      label: 'Night Shift',    icon: Moon,           color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
  { id: 'flexible',   label: 'Flexible',       icon: Zap,            color: 'text-blue-600 bg-blue-50 border-blue-100' },
  { id: 'rotational', label: 'Rotational',    icon: ArrowRightLeft, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
  { id: 'split',      label: 'Split Shift',    icon: Coffee,         color: 'text-amber-600 bg-amber-50 border-amber-100' },
]

// Day mapping labels
const WEEK_DAYS = [
  { value: 0, label: 'Mon' },
  { value: 1, label: 'Tue' },
  { value: 2, label: 'Wed' },
  { value: 3, label: 'Thu' },
  { value: 4, label: 'Fri' },
  { value: 5, label: 'Sat' },
  { value: 6, label: 'Sun' },
]

export default function ShiftManagementPage() {
  // --- States ---
  const [shifts, setShifts] = useState([])
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [globalPolicy, setGlobalPolicy] = useState(null)
  const [roster, setRoster] = useState({ week_start: '', draft_id: null, assignments: [] })
  
  // Navigation & Filtering
  const [activeView, setActiveView] = useState('list') // 'list' or 'roster'
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all')
  const [rosterSearchQuery, setRosterSearchQuery] = useState('')
  const [shiftSearchQuery, setShiftSearchQuery] = useState('')
  const [weekStart, setWeekStart] = useState('')
  
  // Interaction & UI
  const [isLoading, setIsLoading] = useState(true)
  const [isRosterLoading, setIsRosterLoading] = useState(false)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [notification, setNotification] = useState(null)
  const [activeShiftMenu, setActiveShiftMenu] = useState(null) // shift.id for action popup
  const [quickAssignCell, setQuickAssignCell] = useState(null) // { employeeId, dateStr, currentShiftId, employeeName }
  
  // Modals & Slideovers
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false)
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  
  // Form Values
  const [selectedShiftForAction, setSelectedShiftForAction] = useState(null)
  const [shiftToDelete, setShiftToDelete] = useState(null)
  const [selectedShiftForDetails, setSelectedShiftForDetails] = useState(null)
  const [shiftForm, setShiftForm] = useState({
    name: '',
    shift_type: 'fixed',
    start_time: '09:00',
    end_time: '18:00',
    break_duration_mins: 60,
    is_break_paid: false,
    overtime_after_hrs: 8.0,
    ot_rate_multiplier: 1.5,
    grace_period_mins: 15,
    working_days: [0, 1, 2, 3, 4],
  })
  
  const [assignForm, setAssignForm] = useState({
    employee_ids: [],
    shift_id: '',
    start_date: '',
    end_date: '',
  })
  
  const [policyForm, setPolicyForm] = useState({
    weekly_offs: [5, 6],
    late_marking_rule: '3 Lates = 1 Half Day',
    grace_period_mins: 15,
    ot_multiplier: 1.5,
  })

  // --- Helper Functions ---
  const getMonday = (d) => {
    const date = new Date(d)
    const day = date.getDay()
    const diff = date.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is Sunday
    const monday = new Date(date.setDate(diff))
    const yyyy = monday.getFullYear()
    const mm = String(monday.getMonth() + 1).padStart(2, '0')
    const dd = String(monday.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  const formatDateString = (d) => {
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  const getWeekDates = (startStr) => {
    if (!startStr) return []
    const dates = []
    const start = new Date(startStr)
    for (let i = 0; i < 7; i++) {
      const next = new Date(start)
      next.setDate(start.getDate() + i)
      dates.push(next)
    }
    return dates
  }

  const showNotification = (type, message) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 4000)
  }

  // --- API Loaders ---
  const fetchShiftsData = async () => {
    try {
      const data = await attendanceService.getShifts()
      // Normalize _id → id to handle Beanie/MongoDB alias serialization
      const normalized = (data || []).map(s => ({ ...s, id: s.id ?? s._id }))
      setShifts(normalized)
    } catch (err) {
      console.error('Failed to load shifts:', err)
    }
  }

  const fetchEmployeesData = async () => {
    try {
      const response = await employeeService.getEmployees(1, 1000)
      if (Array.isArray(response)) {
        setEmployees(response)
      } else if (response && Array.isArray(response.employees)) {
        setEmployees(response.employees)
      } else {
        setEmployees([])
      }
    } catch (err) {
      console.error('Failed to load employees:', err)
    }
  }

  const fetchPolicyData = async () => {
    try {
      const data = await attendanceService.getGlobalPolicy()
      setGlobalPolicy(data)
    } catch (err) {
      console.error('Failed to load global policy:', err)
    }
  }

  const fetchDepartmentsData = async () => {
    try {
      const data = await departmentService.getDepartments()
      if (Array.isArray(data)) {
        setDepartments(data)
      } else if (data && Array.isArray(data.departments)) {
        setDepartments(data.departments)
      } else {
        setDepartments([])
      }
    } catch (err) {
      console.error('Failed to load departments:', err)
    }
  }

  const fetchRosterData = async () => {
    if (!weekStart) return
    try {
      setIsRosterLoading(true)
      const data = await attendanceService.getWeeklyRoster(weekStart)
      setRoster(data || { week_start: weekStart, draft_id: null, assignments: [] })
    } catch (err) {
      console.error('Failed to load roster:', err)
    } finally {
      setIsRosterLoading(false)
    }
  }

  // --- Initialization Effects ---
  useEffect(() => {
    const monday = getMonday(new Date())
    setWeekStart(monday)
    
    setIsLoading(true)
    Promise.all([
      fetchShiftsData(),
      fetchEmployeesData(),
      fetchDepartmentsData(),
      fetchPolicyData()
    ]).finally(() => {
      setIsLoading(false)
    })
  }, [])

  useEffect(() => {
    if (weekStart) {
      fetchRosterData()
    }
  }, [weekStart])

  // --- Statistics Calculation ---
  const stats = (() => {
    const activeShifts = shifts.length
    const totalStaff = employees.length
    const nightShifts = shifts.filter(s => s.shift_type === 'night').length
    
    // Unassigned today
    let unassigned = 0
    if (roster && roster.assignments && weekStart) {
      const today = new Date()
      const start = new Date(weekStart)
      const diffTime = today.getTime() - start.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays >= 0 && diffDays < 7) {
        roster.assignments.forEach(assign => {
          const schedule = assign.schedule || {}
          const cell = schedule[diffDays] || schedule[String(diffDays)]
          if (!cell || !cell.shift_id) {
            unassigned++
          }
        })
      } else {
        unassigned = employees.filter(e => !e.custom_fields_json?.default_shift_id).length
      }
    } else {
      unassigned = employees.filter(e => !e.custom_fields_json?.default_shift_id).length
    }

    return {
      activeShifts: String(activeShifts).padStart(2, '0'),
      totalStaff: String(totalStaff),
      nightShifts: String(nightShifts).padStart(2, '0'),
      unassigned: String(unassigned)
    }
  })()

  // --- Date Range Controls ---
  const handlePrevWeek = () => {
    const current = new Date(weekStart)
    current.setDate(current.getDate() - 7)
    setWeekStart(formatDateString(current))
  }

  const handleNextWeek = () => {
    const current = new Date(weekStart)
    current.setDate(current.getDate() + 7)
    setWeekStart(formatDateString(current))
  }

  // --- CRUD Handlers ---
  const handleCreateShift = async (e) => {
    e.preventDefault()
    try {
      setIsActionLoading(true)
      await attendanceService.createShift(shiftForm)
      showNotification('success', 'Shift configuration created successfully!')
      setIsCreateModalOpen(false)
      // Reset form
      setShiftForm({
        name: '',
        shift_type: 'fixed',
        start_time: '09:00',
        end_time: '18:00',
        break_duration_mins: 60,
        is_break_paid: false,
        overtime_after_hrs: 8.0,
        ot_rate_multiplier: 1.5,
        grace_period_mins: 15,
        working_days: [0, 1, 2, 3, 4],
      })
      await fetchShiftsData()
    } catch (err) {
      showNotification('error', err.message || 'Failed to create shift')
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleEditShift = async (e) => {
    e.preventDefault()
    try {
      setIsActionLoading(true)
      await attendanceService.updateShift(selectedShiftForAction.id, shiftForm)
      showNotification('success', 'Shift configuration updated successfully!')
      setIsEditModalOpen(false)
      await fetchShiftsData()
      await fetchRosterData()
    } catch (err) {
      showNotification('error', err.message || 'Failed to update shift')
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleDeleteShift = async () => {
    try {
      setIsActionLoading(true)
      await attendanceService.deleteShift(shiftToDelete.id)
      showNotification('success', 'Shift deleted successfully')
      setIsDeleteConfirmOpen(false)
      setShiftToDelete(null)
      await fetchShiftsData()
      await fetchRosterData()
    } catch (err) {
      showNotification('error', err.message || 'Failed to delete shift')
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleUpdatePolicy = async (e) => {
    e.preventDefault()
    try {
      setIsActionLoading(true)
      await attendanceService.updateGlobalPolicy(policyForm)
      showNotification('success', 'Global attendance policy updated successfully!')
      setIsPolicyModalOpen(false)
      await fetchPolicyData()
    } catch (err) {
      showNotification('error', err.message || 'Failed to update policy')
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleAssignShift = async (e) => {
    e.preventDefault()
    if (assignForm.employee_ids.length === 0) {
      showNotification('warning', 'Please select at least one employee')
      return
    }
    try {
      setIsActionLoading(true)
      await attendanceService.assignShift(assignForm)
      showNotification('success', 'Shift mapped successfully to selected staff members!')
      setIsAssignModalOpen(false)
      await fetchEmployeesData()
      await fetchRosterData()
    } catch (err) {
      showNotification('error', err.message || 'Failed to assign shift')
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleRunRosterEngine = async () => {
    if (!weekStart) return
    try {
      setIsRosterLoading(true)
      const res = await attendanceService.runAutoRoster(weekStart)
      showNotification('success', res.message || 'Weekly roster generated successfully!')
      await fetchRosterData()
    } catch (err) {
      showNotification('error', err.message || 'Failed to run roster engine')
    } finally {
      setIsRosterLoading(false)
    }
  }

  // --- Draggable Handlers ---
  const handleDragStart = (e, shiftId) => {
    e.dataTransfer.setData('text/plain', shiftId)
  }

  const handleDrop = async (e, employeeId, dateStr) => {
    e.preventDefault()
    const shiftId = e.dataTransfer.getData('text/plain')
    if (!shiftId) return
    try {
      setIsRosterLoading(true)
      await attendanceService.assignShift({
        employee_ids: [employeeId],
        shift_id: shiftId,
        start_date: dateStr,
        end_date: dateStr
      })
      showNotification('success', 'Roster slot updated successfully!')
      await fetchRosterData()
    } catch (err) {
      showNotification('error', err.message || 'Failed to assign roster slot')
    } finally {
      setIsRosterLoading(false)
    }
  }

  const handleQuickCellAssign = async (shiftIdOrType) => {
    if (!quickAssignCell) return
    const { employeeId, dateStr } = quickAssignCell
    try {
      setIsRosterLoading(true)
      setQuickAssignCell(null)
      
      if (shiftIdOrType === 'off' || shiftIdOrType === 'leave') {
        // Map as special flags inside notes / dates
        showNotification('warning', 'Special day assignments can be edited in global planner. Mapping shift instead.')
        return
      }

      await attendanceService.assignShift({
        employee_ids: [employeeId],
        shift_id: shiftIdOrType,
        start_date: dateStr,
        end_date: dateStr
      })
      showNotification('success', 'Assignment updated successfully!')
      await fetchRosterData()
    } catch (err) {
      showNotification('error', err.message || 'Failed to update roster slot')
    } finally {
      setIsRosterLoading(false)
    }
  }

  // --- Dynamic Mappers ---
  const getShiftStaffCount = (shiftId) => {
    return employees.filter(emp => emp.custom_fields_json?.default_shift_id === String(shiftId)).length
  }

  const getCellAssignment = (empRoster, offset) => {
    if (!empRoster || !empRoster.schedule) return null
    return empRoster.schedule[offset] || empRoster.schedule[String(offset)] || null
  }

  const hasConflict = (cell) => {
    if (!cell) return false
    if (cell.shift_id && (cell.is_leave || cell.is_holiday)) return true
    if (cell.notes && (cell.notes.toLowerCase().includes('warning') || cell.notes.toLowerCase().includes('conflict') || cell.notes.toLowerCase().includes('overlap'))) return true
    return false
  }

  // --- Action Openers ---
  const handleOpenEdit = (shift) => {
    setSelectedShiftForAction(shift)
    setShiftForm({
      name: shift.name,
      shift_type: shift.shift_type || 'fixed',
      start_time: shift.start_time ? shift.start_time.slice(0, 5) : '09:00',
      end_time: shift.end_time ? shift.end_time.slice(0, 5) : '18:00',
      break_duration_mins: shift.break_duration_mins || 60,
      is_break_paid: shift.is_break_paid || false,
      overtime_after_hrs: shift.overtime_after_hrs || 8.0,
      ot_rate_multiplier: shift.ot_rate_multiplier || 1.5,
      grace_period_mins: shift.grace_period_mins || 15,
      working_days: shift.working_days || [0, 1, 2, 3, 4],
    })
    setIsEditModalOpen(true)
    setActiveShiftMenu(null)
  }

  const handleOpenClone = (shift) => {
    setShiftForm({
      name: `${shift.name} (Clone)`,
      shift_type: shift.shift_type || 'fixed',
      start_time: shift.start_time ? shift.start_time.slice(0, 5) : '09:00',
      end_time: shift.end_time ? shift.end_time.slice(0, 5) : '18:00',
      break_duration_mins: shift.break_duration_mins || 60,
      is_break_paid: shift.is_break_paid || false,
      overtime_after_hrs: shift.overtime_after_hrs || 8.0,
      ot_rate_multiplier: shift.ot_rate_multiplier || 1.5,
      grace_period_mins: shift.grace_period_mins || 15,
      working_days: shift.working_days || [0, 1, 2, 3, 4],
    })
    setIsCreateModalOpen(true)
    setActiveShiftMenu(null)
  }

  const handleOpenAssign = (shift) => {
    setSelectedShiftForAction(shift)
    setAssignForm({
      employee_ids: [],
      shift_id: shift.id,
      start_date: formatDateString(new Date()),
      end_date: formatDateString(new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)),
    })
    setIsAssignModalOpen(true)
    setActiveShiftMenu(null)
  }

  const handleOpenDetails = (shift) => {
    setSelectedShiftForDetails(shift)
    setIsDetailsDrawerOpen(true)
    setActiveShiftMenu(null)
  }

  const handleOpenPolicy = () => {
    if (globalPolicy) {
      setPolicyForm({
        weekly_offs: globalPolicy.weekly_offs || [5, 6],
        late_marking_rule: globalPolicy.late_marking_rule || '3 Lates = 1 Half Day',
        grace_period_mins: globalPolicy.grace_period_mins || 15,
        ot_multiplier: globalPolicy.ot_multiplier || 1.5,
      })
    }
    setIsPolicyModalOpen(true)
  }

  // --- Filtering employee lists ---
  const filteredEmployees = employees.filter(emp => {
    const matchSearch = `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(rosterSearchQuery.toLowerCase())
    const matchDept = selectedDeptFilter === 'all' || emp.department_id === selectedDeptFilter
    return matchSearch && matchDept
  })

  const filteredShifts = shifts.filter(s => 
    s.name.toLowerCase().includes(shiftSearchQuery.toLowerCase())
  )

  const weekDates = getWeekDates(weekStart)

  return (
    <div className="p-6 space-y-6 min-h-screen bg-slate-50/30">
      
      {/* ── Notification Banner ── */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: '-50%' }} 
            animate={{ opacity: 1, y: 0, x: '-50%' }} 
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-sm font-semibold max-w-md ${
              notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
              notification.type === 'warning' ? 'bg-amber-50 text-amber-800 border-amber-200' :
              'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {notification.type === 'success' && <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0" />}
            {notification.type === 'warning' && <AlertTriangle className="h-4.5 w-4.5 text-amber-600 shrink-0" />}
            {notification.type === 'error' && <ShieldAlert className="h-4.5 w-4.5 text-rose-600 shrink-0" />}
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Shift Configuration & Rosters</h2>
          <p className="text-sm text-slate-500 font-medium">Define shift policies and assign weekly rosters dynamically</p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl bg-white p-1 shadow-sm border border-slate-200">
           <button 
             onClick={() => setActiveView('list')}
             className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeView === 'list' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
           >
             Manage Shifts
           </button>
           <button 
             onClick={() => setActiveView('roster')}
             className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeView === 'roster' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
           >
             Weekly Roster
           </button>
        </div>
      </div>

      {/* ── Shift Summary Stats ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
         {[
           { label: 'Active Shifts', value: stats.activeShifts, icon: Clock, color: 'text-blue-600 bg-blue-50' },
           { label: 'Total Staff Rotated', value: stats.totalStaff, icon: Users, color: 'text-indigo-600 bg-indigo-50' },
           { label: 'Night Shift Active', value: stats.nightShifts, icon: Moon, color: 'text-purple-600 bg-purple-50' },
           { label: 'Unassigned Today', value: stats.unassigned, icon: ShieldAlert, color: 'text-rose-600 bg-rose-50' },
         ].map((s, i) => (
           <motion.div key={s.label}
             initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
             className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
           >
             <div className="flex items-center justify-between">
               <div className={`rounded-xl p-3 ${s.color}`}>
                 <s.icon className="h-5 w-5" />
               </div>
               <span className="text-3xl font-extrabold text-slate-900">{s.value}</span>
             </div>
             <div className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{s.label}</div>
           </motion.div>
         ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <RefreshCw className="h-10 w-10 text-indigo-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Loading configurations & active rosters...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-start">
          {/* ── Main Panel ── */}
          <div className="lg:col-span-2 space-y-6">
            
            {activeView === 'list' ? (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                   <div>
                     <h3 className="text-md font-bold text-slate-900">Configured Shifts</h3>
                     <p className="text-xs text-slate-400 font-medium">Create and manage your workforce timings</p>
                   </div>
                   <div className="flex items-center gap-3">
                     <div className="relative">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                       <input 
                         type="text" 
                         placeholder="Search shift..." 
                         value={shiftSearchQuery}
                         onChange={e => setShiftSearchQuery(e.target.value)}
                         className="pl-8.5 pr-4 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white min-w-[150px]"
                       />
                     </div>
                     <button 
                       onClick={() => {
                         setShiftForm({
                           name: '',
                           shift_type: 'fixed',
                           start_time: '09:00',
                           end_time: '18:00',
                           break_duration_mins: 60,
                           is_break_paid: false,
                           overtime_after_hrs: 8.0,
                           ot_rate_multiplier: 1.5,
                           grace_period_mins: 15,
                           working_days: [0, 1, 2, 3, 4],
                         })
                         setIsCreateModalOpen(true)
                       }}
                       className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition-all cursor-pointer"
                     >
                        <Plus className="h-3.5 w-3.5" />
                        Create Shift
                     </button>
                   </div>
                </div>
                
                <div className="overflow-x-auto min-h-[280px]">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Shift Name</th>
                        <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Timing</th>
                        <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Rules</th>
                        <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Staff Count</th>
                        <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredShifts.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-12 text-center text-sm font-semibold text-slate-400">
                            No shifts configured yet. Click 'Create Shift' to get started!
                          </td>
                        </tr>
                      ) : (
                        filteredShifts.map((s, i) => {
                          const typeInfo = SHIFT_TYPES.find(t => t.id === s.shift_type) || { label: s.shift_type, icon: Clock, color: 'text-slate-600 bg-slate-50 border-slate-100' }
                          return (
                            <motion.tr key={s.id} 
                              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                              className="hover:bg-slate-50/80 transition-colors group relative"
                            >
                              <td className="px-6 py-4">
                                 <div className="flex items-center gap-3">
                                    <div className={`rounded-xl p-2.5 border ${typeInfo.color}`}>
                                       <typeInfo.icon className="h-4.5 w-4.5" />
                                    </div>
                                    <div>
                                      <div className="text-sm font-bold text-slate-900">{s.name}</div>
                                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{typeInfo.label}</div>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-6 py-4">
                                 <div className="text-sm font-extrabold text-slate-700">{s.start_time.slice(0,5)} - {s.end_time.slice(0,5)}</div>
                                 <div className="text-[10px] font-semibold text-slate-400 mt-0.5">Break: {s.break_duration_mins} mins {s.is_break_paid ? '(Paid)' : '(Unpaid)'}</div>
                              </td>
                              <td className="px-6 py-4">
                                 <div className="flex flex-wrap gap-1.5">
                                    <span className="rounded-md bg-slate-100 border border-slate-200/60 px-1.5 py-0.5 text-[9px] font-bold text-slate-600">Grace: {s.grace_period_mins}m</span>
                                    <span className="rounded-md bg-blue-50 border border-blue-100 px-1.5 py-0.5 text-[9px] font-bold text-blue-600">OT: {s.overtime_after_hrs}h</span>
                                 </div>
                              </td>
                              <td className="px-6 py-4">
                                 <div className="flex items-center gap-2">
                                    <div className="w-12 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                       <div className="h-full bg-indigo-500" style={{ width: `${Math.min((getShiftStaffCount(s.id) / Math.max(employees.length, 1)) * 100, 100)}%` }} />
                                    </div>
                                    <span className="text-xs font-bold text-slate-600">{getShiftStaffCount(s.id)}</span>
                                 </div>
                              </td>
                              <td className="px-6 py-4 text-right relative">
                                 <div className="inline-block text-left">
                                   <button 
                                     onClick={() => setActiveShiftMenu(activeShiftMenu === s.id ? null : s.id)}
                                     className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                                   >
                                      <MoreVertical className="h-4 w-4" />
                                   </button>
                                   
                                   {/* ── Floating ⋮ Action Dropdown Menu ── */}
                                   <AnimatePresence>
                                     {activeShiftMenu === s.id && (
                                       <>
                                         <div className="fixed inset-0 z-10" onClick={() => setActiveShiftMenu(null)} />
                                         <motion.div 
                                           initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                           animate={{ opacity: 1, scale: 1, y: 0 }}
                                           exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                           className="absolute right-6 mt-1.5 w-44 rounded-xl bg-white border border-slate-200/80 shadow-lg py-1.5 z-20 text-left"
                                         >
                                           <button 
                                             onClick={() => handleOpenDetails(s)}
                                             className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 w-full cursor-pointer"
                                           >
                                             <Eye className="h-3.5 w-3.5 text-slate-400" />
                                             View Details
                                           </button>
                                           <button 
                                             onClick={() => handleOpenEdit(s)}
                                             className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 w-full cursor-pointer"
                                           >
                                             <Edit className="h-3.5 w-3.5 text-slate-400" />
                                             Edit Shift
                                           </button>
                                           <button 
                                             onClick={() => handleOpenAssign(s)}
                                             className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 w-full cursor-pointer"
                                           >
                                             <Users className="h-3.5 w-3.5 text-slate-400" />
                                             Assign Employees
                                           </button>
                                           <hr className="border-slate-100 my-1" />
                                           <button 
                                             onClick={() => {
                                               setShiftToDelete(s)
                                               setIsDeleteConfirmOpen(true)
                                               setActiveShiftMenu(null)
                                             }}
                                             className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 w-full cursor-pointer"
                                           >
                                             <Trash2 className="h-3.5 w-3.5 text-red-400" />
                                             Delete Shift
                                           </button>
                                         </motion.div>
                                       </>
                                     )}
                                   </AnimatePresence>
                                 </div>
                              </td>
                            </motion.tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              // ── Tab 2: Weekly Roster Grid Table Sheet ──
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden space-y-4 p-6">
                
                {/* Drag-and-Drop Top Badge Slots Panel */}
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5 text-slate-400" />
                    Quick Draggable Shift Badges (Drag onto grid cells to reassign shifts)
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {shifts.map(s => {
                      const typeInfo = SHIFT_TYPES.find(t => t.id === s.shift_type) || { color: 'text-slate-600 bg-slate-50 border-slate-200' }
                      return (
                        <div
                          key={s.id}
                          draggable="true"
                          onDragStart={(e) => handleDragStart(e, s.id)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold cursor-grab active:cursor-grabbing select-none flex items-center gap-1.5 shadow-sm transition-all hover:scale-102 ${typeInfo.color}`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {s.name}
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  {/* Calendar Range Navigator */}
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handlePrevWeek}
                      className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 cursor-pointer"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-extrabold text-slate-800 bg-slate-100/60 border border-slate-200/50 px-3.5 py-1.5 rounded-xl">
                      {weekStart ? new Date(weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                      {' — '}
                      {weekDates.length > 0 ? weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                    </span>
                    <button 
                      onClick={handleNextWeek}
                      className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 cursor-pointer"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Filters and Searches */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Search employee..." 
                        value={rosterSearchQuery}
                        onChange={e => setRosterSearchQuery(e.target.value)}
                        className="pl-8.5 pr-4 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white min-w-[150px]"
                      />
                    </div>
                    
                    <select
                      value={selectedDeptFilter}
                      onChange={e => setSelectedDeptFilter(e.target.value)}
                      className="text-xs font-bold rounded-xl border border-slate-200 bg-white px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                    >
                      <option value="all">All Departments</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {isRosterLoading ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin" />
                    <p className="text-xs font-bold text-slate-400">Updating weekly grid assignments...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-200/60 rounded-xl">
                    <table className="w-full border-collapse text-left text-xs min-w-[800px]">
                      <thead className="bg-slate-50/50 border-b border-slate-200/60">
                        <tr>
                          <th className="px-4 py-3.5 font-extrabold text-slate-500 w-[180px]">Employee</th>
                          {weekDates.map((d, index) => (
                            <th key={index} className="px-3 py-3.5 font-extrabold text-slate-500 text-center">
                              <div>{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">{d.getDate()} {d.toLocaleDateString('en-US', { month: 'short' })}</div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredEmployees.length === 0 ? (
                          <tr>
                            <td colSpan="8" className="px-6 py-12 text-center text-sm font-semibold text-slate-400">
                              No employees found matching filter.
                            </td>
                          </tr>
                        ) : (
                          filteredEmployees.map(emp => {
                            // Find their roster assignment
                            const empRoster = roster.assignments.find(a => a.employee_id === emp.id)
                            return (
                              <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-4 py-3.5">
                                  <div className="font-extrabold text-slate-900">{emp.first_name} {emp.last_name}</div>
                                  <div className="text-[9px] font-bold text-indigo-500 uppercase tracking-wider mt-0.5">{emp.department_name || 'General'}</div>
                                </td>
                                {weekDates.map((dateObj, offset) => {
                                  const cell = getCellAssignment(empRoster, offset)
                                  const dateStr = formatDateString(dateObj)
                                  
                                  let badgeColor = 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100 hover:text-slate-700'
                                  let label = 'OFF'
                                  
                                  if (cell) {
                                    if (cell.is_leave) {
                                      badgeColor = 'bg-rose-50 text-rose-600 border-rose-100'
                                      label = 'LEAVE'
                                    } else if (cell.is_holiday) {
                                      badgeColor = 'bg-amber-50 text-amber-600 border-amber-100'
                                      label = 'HOLIDAY'
                                    } else if (cell.shift_id) {
                                      const matchedShift = shifts.find(sh => sh.id === cell.shift_id)
                                      if (matchedShift) {
                                        label = matchedShift.name
                                        const typeInfo = SHIFT_TYPES.find(t => t.id === matchedShift.shift_type)
                                        if (typeInfo) {
                                          badgeColor = typeInfo.color + ' hover:brightness-95'
                                        }
                                      } else {
                                        label = 'Shift Assigned'
                                      }
                                    }
                                  }

                                  const warning = hasConflict(cell)

                                  return (
                                    <td 
                                      key={offset} 
                                      className="px-2 py-3.5 text-center relative"
                                      onDragOver={(e) => e.preventDefault()}
                                      onDrop={(e) => handleDrop(e, emp.id, dateStr)}
                                    >
                                      <div 
                                        onClick={() => setQuickAssignCell({
                                          employeeId: emp.id,
                                          dateStr,
                                          currentShiftId: cell?.shift_id || '',
                                          employeeName: `${emp.first_name} ${emp.last_name}`
                                        })}
                                        className={`mx-auto max-w-[90px] px-2.5 py-1.5 rounded-lg border text-[10px] font-extrabold cursor-pointer transition-all truncate select-none shadow-xs flex items-center justify-center gap-1 relative ${badgeColor}`}
                                      >
                                        {warning && (
                                          <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 items-center justify-center text-[7px] text-white font-extrabold">!</span>
                                          </span>
                                        )}
                                        {label}
                                      </div>
                                    </td>
                                  )
                                })}
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Side Config Panel ── */}
          <div className="space-y-6">
             <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-md font-bold text-slate-900 flex items-center gap-2">
                   <Calendar className="h-5 w-5 text-indigo-600" />
                   Global Shift Policies
                </h3>
                <div className="space-y-4">
                   {[
                     { label: 'Weekly Offs', value: globalPolicy?.weekly_offs?.map(v => ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][v]).join(', ') || 'Saturday, Sunday' },
                     { label: 'Late Marking', value: globalPolicy?.late_marking_rule || '3 Lates = 1 Half Day' },
                     { label: 'Grace Period', value: globalPolicy ? `${globalPolicy.grace_period_mins} mins (Standard)` : '15 mins (Standard)' },
                     { label: 'OT Multiplier', value: globalPolicy ? `${globalPolicy.ot_multiplier}x Hourly Rate` : '1.5x Hourly Rate' },
                   ].map(p => (
                     <div key={p.label} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{p.label}</span>
                        <span className="text-xs font-bold text-slate-800 text-right">{p.value}</span>
                     </div>
                   ))}
                </div>
                <button 
                  onClick={handleOpenPolicy}
                  className="mt-6 w-full rounded-xl border border-slate-200 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-widest cursor-pointer"
                >
                   Edit Policy
                </button>
             </div>

             <div className="rounded-2xl border border-slate-200 bg-indigo-600 p-6 shadow-lg shadow-indigo-100 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <h4 className="font-extrabold text-lg tracking-tight">Auto-Roster Engine</h4>
                  <p className="text-xs text-indigo-100 mt-1.5 font-medium leading-relaxed">Automatically generate weekly shift assignments based on default employee configurations, overlap rules, leaves and weekly off policies.</p>
                  <button 
                    onClick={handleRunRosterEngine}
                    disabled={isRosterLoading}
                    className="mt-6 flex items-center justify-center gap-2 w-full rounded-xl bg-white py-3 text-xs font-extrabold text-indigo-600 shadow-xl transition-all active:scale-95 disabled:opacity-75 cursor-pointer"
                  >
                     {isRosterLoading ? (
                       <RefreshCw className="h-4 w-4 animate-spin text-indigo-600" />
                     ) : (
                       <Zap className="h-4 w-4 fill-current text-indigo-600" />
                     )}
                     Run Roster Engine
                  </button>
                </div>
                <Zap className="absolute -bottom-6 -right-6 h-32 w-32 text-indigo-500/20 rotate-12" />
             </div>
          </div>
        </div>
      )}

      {/* ── Modals & Drawers ── */}

      {/* Modal: Create Shift */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" 
              onClick={() => setIsCreateModalOpen(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 z-10 overflow-hidden"
            >
              <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-md">Create Shift Configuration</h3>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">Establish shift parameters and thresholds</p>
                </div>
                <button onClick={() => setIsCreateModalOpen(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <form onSubmit={handleCreateShift} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Shift Name</label>
                    <input 
                      type="text" required placeholder="e.g. General Shift" 
                      value={shiftForm.name}
                      onChange={e => setShiftForm({ ...shiftForm, name: e.target.value })}
                      className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Shift Type</label>
                    <select 
                      value={shiftForm.shift_type}
                      onChange={e => setShiftForm({ ...shiftForm, shift_type: e.target.value })}
                      className="w-full text-xs font-bold border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                    >
                      <option value="fixed">Fixed</option>
                      <option value="night">Night Shift</option>
                      <option value="flexible">Flexible</option>
                      <option value="rotational">Rotational</option>
                      <option value="split">Split Shift</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Grace Period (Minutes)</label>
                    <input 
                      type="number" required min="0"
                      value={shiftForm.grace_period_mins}
                      onChange={e => setShiftForm({ ...shiftForm, grace_period_mins: parseInt(e.target.value) || 0 })}
                      className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Start Time</label>
                    <input 
                      type="time" required
                      value={shiftForm.start_time}
                      onChange={e => setShiftForm({ ...shiftForm, start_time: e.target.value })}
                      className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">End Time</label>
                    <input 
                      type="time" required
                      value={shiftForm.end_time}
                      onChange={e => setShiftForm({ ...shiftForm, end_time: e.target.value })}
                      className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Break Duration (Mins)</label>
                    <input 
                      type="number" required min="0"
                      value={shiftForm.break_duration_mins}
                      onChange={e => setShiftForm({ ...shiftForm, break_duration_mins: parseInt(e.target.value) || 0 })}
                      className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                  <div className="flex items-center pt-6">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={shiftForm.is_break_paid}
                        onChange={e => setShiftForm({ ...shiftForm, is_break_paid: e.target.checked })}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Paid Break Option</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">OT Threshold (Hrs/Day)</label>
                    <input 
                      type="number" step="0.5" required min="0"
                      value={shiftForm.overtime_after_hrs}
                      onChange={e => setShiftForm({ ...shiftForm, overtime_after_hrs: parseFloat(e.target.value) || 8.0 })}
                      className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">OT Rate Multiplier</label>
                    <input 
                      type="number" step="0.1" required min="1"
                      value={shiftForm.ot_rate_multiplier}
                      onChange={e => setShiftForm({ ...shiftForm, ot_rate_multiplier: parseFloat(e.target.value) || 1.5 })}
                      className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Shift Working Days</label>
                  <div className="flex flex-wrap gap-2.5">
                    {WEEK_DAYS.map(day => {
                      const isSelected = shiftForm.working_days.includes(day.value)
                      return (
                        <button
                          key={day.value} type="button"
                          onClick={() => {
                            const current = [...shiftForm.working_days]
                            if (isSelected) {
                              setShiftForm({ ...shiftForm, working_days: current.filter(v => v !== day.value) })
                            } else {
                              setShiftForm({ ...shiftForm, working_days: [...current, day.value].sort() })
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            isSelected ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          {day.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-5 flex items-center justify-end gap-3 mt-6">
                  <button 
                    type="button" onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" disabled={isActionLoading}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-xs font-bold text-white shadow-md hover:bg-slate-800 disabled:opacity-70 flex items-center gap-1.5 cursor-pointer"
                  >
                    {isActionLoading && <RefreshCw className="h-3 w-3 animate-spin" />}
                    Save Shift
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Edit Shift */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" 
              onClick={() => setIsEditModalOpen(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 z-10 overflow-hidden"
            >
              <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-md">Edit Shift Configuration</h3>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">Modify configured workforce parameters</p>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <form onSubmit={handleEditShift} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Shift Name</label>
                    <input 
                      type="text" required placeholder="e.g. General Shift" 
                      value={shiftForm.name}
                      onChange={e => setShiftForm({ ...shiftForm, name: e.target.value })}
                      className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Shift Type</label>
                    <select 
                      value={shiftForm.shift_type}
                      onChange={e => setShiftForm({ ...shiftForm, shift_type: e.target.value })}
                      className="w-full text-xs font-bold border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                    >
                      <option value="fixed">Fixed</option>
                      <option value="night">Night Shift</option>
                      <option value="flexible">Flexible</option>
                      <option value="rotational">Rotational</option>
                      <option value="split">Split Shift</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Grace Period (Minutes)</label>
                    <input 
                      type="number" required min="0"
                      value={shiftForm.grace_period_mins}
                      onChange={e => setShiftForm({ ...shiftForm, grace_period_mins: parseInt(e.target.value) || 0 })}
                      className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Start Time</label>
                    <input 
                      type="time" required
                      value={shiftForm.start_time}
                      onChange={e => setShiftForm({ ...shiftForm, start_time: e.target.value })}
                      className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">End Time</label>
                    <input 
                      type="time" required
                      value={shiftForm.end_time}
                      onChange={e => setShiftForm({ ...shiftForm, end_time: e.target.value })}
                      className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Break Duration (Mins)</label>
                    <input 
                      type="number" required min="0"
                      value={shiftForm.break_duration_mins}
                      onChange={e => setShiftForm({ ...shiftForm, break_duration_mins: parseInt(e.target.value) || 0 })}
                      className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                  <div className="flex items-center pt-6">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={shiftForm.is_break_paid}
                        onChange={e => setShiftForm({ ...shiftForm, is_break_paid: e.target.checked })}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Paid Break Option</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">OT Threshold (Hrs/Day)</label>
                    <input 
                      type="number" step="0.5" required min="0"
                      value={shiftForm.overtime_after_hrs}
                      onChange={e => setShiftForm({ ...shiftForm, overtime_after_hrs: parseFloat(e.target.value) || 8.0 })}
                      className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">OT Rate Multiplier</label>
                    <input 
                      type="number" step="0.1" required min="1"
                      value={shiftForm.ot_rate_multiplier}
                      onChange={e => setShiftForm({ ...shiftForm, ot_rate_multiplier: parseFloat(e.target.value) || 1.5 })}
                      className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Shift Working Days</label>
                  <div className="flex flex-wrap gap-2.5">
                    {WEEK_DAYS.map(day => {
                      const isSelected = shiftForm.working_days.includes(day.value)
                      return (
                        <button
                          key={day.value} type="button"
                          onClick={() => {
                            const current = [...shiftForm.working_days]
                            if (isSelected) {
                              setShiftForm({ ...shiftForm, working_days: current.filter(v => v !== day.value) })
                            } else {
                              setShiftForm({ ...shiftForm, working_days: [...current, day.value].sort() })
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            isSelected ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          {day.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-5 flex items-center justify-end gap-3 mt-6">
                  <button 
                    type="button" onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" disabled={isActionLoading}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-xs font-bold text-white shadow-md hover:bg-slate-800 disabled:opacity-70 flex items-center gap-1.5 cursor-pointer"
                  >
                    {isActionLoading && <RefreshCw className="h-3 w-3 animate-spin" />}
                    Update Shift
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Direct Assign Shift */}
      <AnimatePresence>
        {isAssignModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" 
              onClick={() => setIsAssignModalOpen(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 z-10 overflow-hidden"
            >
              <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-md">Assign Shift to Employees</h3>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">Map shift schedule rules directly to staff members</p>
                </div>
                <button onClick={() => setIsAssignModalOpen(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <form onSubmit={handleAssignShift} className="p-6 space-y-4">
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Shift Configuration</label>
                  <select 
                    value={assignForm.shift_id}
                    onChange={e => setAssignForm({ ...assignForm, shift_id: e.target.value })}
                    className="w-full text-xs font-bold border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                  >
                    <option value="" disabled>Choose shift configuration...</option>
                    {shifts.map(sh => (
                      <option key={sh.id} value={sh.id}>{sh.name} ({sh.start_time.slice(0,5)} - {sh.end_time.slice(0,5)})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Start Date</label>
                    <input 
                      type="date" required
                      value={assignForm.start_date}
                      onChange={e => setAssignForm({ ...assignForm, start_date: e.target.value })}
                      className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">End Date</label>
                    <input 
                      type="date" required
                      value={assignForm.end_date}
                      onChange={e => setAssignForm({ ...assignForm, end_date: e.target.value })}
                      className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                    Select Staff Members ({assignForm.employee_ids.length} selected)
                  </label>
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white max-h-[160px] overflow-y-auto divide-y divide-slate-100">
                    {employees.map(emp => {
                      const isSelected = assignForm.employee_ids.includes(emp.id)
                      return (
                        <div 
                          key={emp.id} 
                          onClick={() => {
                            const current = [...assignForm.employee_ids]
                            if (isSelected) {
                              setAssignForm({ ...assignForm, employee_ids: current.filter(v => v !== emp.id) })
                            } else {
                              setAssignForm({ ...assignForm, employee_ids: [...current, emp.id] })
                            }
                          }}
                          className={`flex items-center gap-3 px-4 py-2.5 text-xs font-semibold cursor-pointer transition-colors ${
                            isSelected ? 'bg-slate-50' : 'hover:bg-slate-50/50'
                          }`}
                        >
                          <input 
                            type="checkbox" readOnly
                            checked={isSelected}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <div>
                            <div className="font-extrabold text-slate-800">{emp.first_name} {emp.last_name}</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{emp.department_name || 'General'}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-5 flex items-center justify-end gap-3 mt-6">
                  <button 
                    type="button" onClick={() => setIsAssignModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" disabled={isActionLoading}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-xs font-bold text-white shadow-md hover:bg-slate-800 disabled:opacity-70 flex items-center gap-1.5 cursor-pointer"
                  >
                    {isActionLoading && <RefreshCw className="h-3 w-3 animate-spin" />}
                    Assign Shift
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Edit Global Policy */}
      <AnimatePresence>
        {isPolicyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" 
              onClick={() => setIsPolicyModalOpen(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 z-10 overflow-hidden"
            >
              <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-md">Global Attendance Policy</h3>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">Establish default organizational time policies</p>
                </div>
                <button onClick={() => setIsPolicyModalOpen(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <form onSubmit={handleUpdatePolicy} className="p-6 space-y-5">
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Weekly Off Days</label>
                  <div className="flex flex-wrap gap-2.5">
                    {WEEK_DAYS.map(day => {
                      const isOff = policyForm.weekly_offs.includes(day.value)
                      return (
                        <button
                          key={day.value} type="button"
                          onClick={() => {
                            const current = [...policyForm.weekly_offs]
                            if (isOff) {
                              setPolicyForm({ ...policyForm, weekly_offs: current.filter(v => v !== day.value) })
                            } else {
                              setPolicyForm({ ...policyForm, weekly_offs: [...current, day.value].sort() })
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            isOff ? 'bg-red-500 border-red-500 text-white shadow-xs' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          {day.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Late Marking Rule Threshold</label>
                    <input 
                      type="text" required placeholder="e.g. 3 Lates = 1 Half Day" 
                      value={policyForm.late_marking_rule}
                      onChange={e => setPolicyForm({ ...policyForm, late_marking_rule: e.target.value })}
                      className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Grace Period (Minutes)</label>
                    <input 
                      type="number" required min="0"
                      value={policyForm.grace_period_mins}
                      onChange={e => setPolicyForm({ ...policyForm, grace_period_mins: parseInt(e.target.value) || 15 })}
                      className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">OT Hourly Multiplier (x)</label>
                    <input 
                      type="number" step="0.1" required min="1"
                      value={policyForm.ot_multiplier}
                      onChange={e => setPolicyForm({ ...policyForm, ot_multiplier: parseFloat(e.target.value) || 1.5 })}
                      className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-5 flex items-center justify-end gap-3 mt-6">
                  <button 
                    type="button" onClick={() => setIsPolicyModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" disabled={isActionLoading}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-xs font-bold text-white shadow-md hover:bg-slate-800 disabled:opacity-70 flex items-center gap-1.5 cursor-pointer"
                  >
                    {isActionLoading && <RefreshCw className="h-3 w-3 animate-spin" />}
                    Update Policy
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Quick Cell Shift Assign */}
      <AnimatePresence>
        {quickAssignCell && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" 
              onClick={() => setQuickAssignCell(null)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-slate-200 z-10 overflow-hidden"
            >
              <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-3.5 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Quick Shift Planner</h4>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">{quickAssignCell.employeeName} on {quickAssignCell.dateStr}</p>
                </div>
                <button onClick={() => setQuickAssignCell(null)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-5 space-y-2">
                <p className="text-[11px] font-semibold text-slate-400 mb-3 uppercase tracking-wider">Select new roster configuration:</p>
                {shifts.map(sh => (
                  <button
                    key={sh.id}
                    onClick={() => handleQuickCellAssign(sh.id)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-left text-xs font-bold text-slate-700 cursor-pointer"
                  >
                    <span>{sh.name}</span>
                    <span className="text-[10px] text-slate-400">{sh.start_time.slice(0,5)} - {sh.end_time.slice(0,5)}</span>
                  </button>
                ))}
                
                <hr className="border-slate-100 my-2" />
                
                <button
                  onClick={() => handleQuickCellAssign('off')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-dashed border-slate-200 hover:bg-slate-50 transition-colors text-left text-xs font-extrabold text-slate-500 flex items-center gap-2 cursor-pointer"
                >
                  <span className="h-2 w-2 rounded-full bg-slate-400" />
                  Mark OFF (Weekend/Holiday)
                </button>
                <button
                  onClick={() => handleQuickCellAssign('leave')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-dashed border-red-200 hover:bg-red-50/50 transition-colors text-left text-xs font-extrabold text-red-600 flex items-center gap-2 cursor-pointer"
                >
                  <span className="h-2 w-2 rounded-full bg-red-400" />
                  Mark Employee LEAVE
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Delete Shift Confirmation */}
      <AnimatePresence>
        {isDeleteConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" 
              onClick={() => setIsDeleteConfirmOpen(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-slate-200 z-10 p-6 space-y-4"
            >
              <div className="flex items-center gap-3 text-red-600">
                <div className="p-2.5 bg-red-50 border border-red-100 rounded-xl">
                  <Trash2 className="h-5 w-5" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-md">Delete Shift Configuration</h4>
              </div>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Are you absolutely sure you want to delete <strong className="text-slate-800">"{shiftToDelete?.name}"</strong>? This will remove all default associations for staff. This action is irreversible.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button 
                  type="button" onClick={() => setIsDeleteConfirmOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteShift} disabled={isActionLoading}
                  className="px-4 py-2 rounded-xl bg-red-600 text-xs font-bold text-white shadow-md hover:bg-red-700 disabled:opacity-70 flex items-center gap-1.5 cursor-pointer"
                >
                  {isActionLoading && <RefreshCw className="h-3 w-3 animate-spin" />}
                  Delete Shift
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: View Details Center-aligned Modal */}
      <AnimatePresence>
        {isDetailsDrawerOpen && selectedShiftForDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" 
              onClick={() => setIsDetailsDrawerOpen(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-200 z-10 flex flex-col max-h-[85vh] overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-md">Shift Configuration Details</h3>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">Parameters for "{selectedShiftForDetails.name}"</p>
                </div>
                <button onClick={() => setIsDetailsDrawerOpen(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Visual Header card */}
                <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-100/50 flex items-center gap-4">
                  <div className="p-3 bg-white border border-indigo-200 rounded-2xl text-indigo-600">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-indigo-900 text-sm">{selectedShiftForDetails.name}</h4>
                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mt-0.5">
                      {selectedShiftForDetails.shift_type} Shift Configuration
                    </p>
                  </div>
                </div>

                {/* Shift Details Parameters */}
                <div className="space-y-4">
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Schedule Parameters</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Start Time', value: selectedShiftForDetails.start_time.slice(0, 5) },
                      { label: 'End Time', value: selectedShiftForDetails.end_time.slice(0, 5) },
                      { label: 'Break Length', value: `${selectedShiftForDetails.break_duration_mins} Minutes` },
                      { label: 'Paid Break', value: selectedShiftForDetails.is_break_paid ? 'Yes' : 'No' },
                      { label: 'Grace Period', value: `${selectedShiftForDetails.grace_period_mins} Minutes` },
                      { label: 'OT Allowed', value: selectedShiftForDetails.overtime_after_hrs ? `After ${selectedShiftForDetails.overtime_after_hrs} hrs` : 'No' },
                      { label: 'OT Multiplier', value: `${selectedShiftForDetails.ot_rate_multiplier}x` },
                      { label: 'Active Staff Count', value: getShiftStaffCount(selectedShiftForDetails.id) },
                    ].map(param => (
                      <div key={param.label} className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{param.label}</div>
                        <div className="text-xs font-extrabold text-slate-800 mt-1">{param.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scheduled days */}
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Working Days</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {WEEK_DAYS.map(day => {
                      const isWorking = selectedShiftForDetails.working_days.includes(day.value)
                      return (
                        <span 
                          key={day.value}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold ${
                            isWorking ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-slate-50/50 border-slate-200/55 text-slate-400'
                          }`}
                        >
                          {day.label}
                        </span>
                      )
                    })}
                  </div>
                </div>

                {/* Assigned employees list */}
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Assigned Staff Members</h4>
                  <div className="border border-slate-200/60 rounded-xl divide-y divide-slate-100 overflow-hidden bg-white max-h-[200px] overflow-y-auto">
                    {employees.filter(emp => emp.custom_fields_json?.default_shift_id === String(selectedShiftForDetails.id)).length === 0 ? (
                      <div className="p-4 text-center text-xs font-semibold text-slate-400">
                        No employees directly mapped to this shift.
                      </div>
                    ) : (
                      employees.filter(emp => emp.custom_fields_json?.default_shift_id === String(selectedShiftForDetails.id)).map(emp => (
                        <div key={emp.id} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50/50">
                          <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                          <div>
                            <div className="text-xs font-extrabold text-slate-800">{emp.first_name} {emp.last_name}</div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{emp.department_name || 'General'}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center gap-3 shrink-0">
                <button 
                  onClick={() => {
                    setIsDetailsDrawerOpen(false)
                    handleOpenEdit(selectedShiftForDetails)
                  }}
                  className="flex-1 py-3 text-center text-xs font-bold bg-slate-900 text-white rounded-xl shadow-md hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Edit Configuration
                </button>
                <button 
                  onClick={() => setIsDetailsDrawerOpen(false)}
                  className="py-3 px-5 text-center text-xs font-bold border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
