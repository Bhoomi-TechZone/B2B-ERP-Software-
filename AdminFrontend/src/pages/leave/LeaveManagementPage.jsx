import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import {
  FileText, BarChart2, PlusCircle, ClipboardList, CalendarDays,
  Umbrella, RefreshCw, Clock, Users, ArrowRightLeft
} from 'lucide-react'
import { getPolicies } from './data/leaveData'
import { useAuth } from "../../hooks/useAuth"
import leaveService from '../../services/leaveService'
import attendanceService from '../../services/attendanceService'
import employeeService from '../../services/employeeService'
import PoliciesPage from './components/PoliciesPage'
import BalancePage from './components/BalancePage'
import HRLeaveBalancePage from './components/HRLeaveBalancePage'
import ApplyLeavePage from './components/ApplyLeavePage'
import HRLeaveRequestsPage from './components/HRLeaveRequestsPage'
import CalendarPage from './components/CalendarPage'

const FLOW = ['Policy', 'Assignment', 'Balance', 'Request', 'Approval', 'Attendance', 'Payroll']

const TABS = [
  { id: 'policies', label: 'Policies', path: '/leave/policies/overview?ref=sidebar&tab=policies', icon: FileText },
  { id: 'balance', label: 'Balance', path: '/leave/balance/overview?ref=sidebar&tab=balance', icon: BarChart2 },
  // { id: 'apply', label: 'Apply Leave', path: '/leave/apply/overview?ref=sidebar&tab=apply', icon: PlusCircle },
  { id: 'requests', label: 'Requests', path: '/leave/requests/overview?ref=sidebar&tab=requests&status=all&page=1', icon: ClipboardList },
  { id: 'calendar', label: 'Calendar', path: '/leave/calendar/overview?ref=sidebar&tab=calendar', icon: CalendarDays },
  { id: 'shift-rotation', label: 'Shift Rotation', path: '/leave/shift-rotation/overview?ref=sidebar&tab=shift-rotation', icon: ArrowRightLeft },
]

export default function LeaveManagementPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, role: authRole } = useAuth()

  const role = authRole ?? localStorage.getItem("role") ?? "employee"
  const isAdmin = role === 'admin' || role === 'hr' || role === 'hr_admin'
  const isEmployee = role === 'employee'

  const [stats, setStats] = useState({
    activePolicies: 0,
    pendingRequests: 0,
    approvedThisMonth: 0,
    onLeaveToday: 0,
  })
  const [loading, setLoading] = useState(true)

  // Determine active tab from query params or path
  const getActiveTabFromPath = () => {
    const qTab = searchParams.get('tab')
    if (qTab && ['policies', 'balance', 'apply', 'requests', 'calendar', 'shift-rotation'].includes(qTab)) {
      return qTab
    }
    const path = location.pathname
    if (path.includes('policies')) return 'policies'
    if (path.includes('balance')) return 'balance'
    if (path.includes('apply')) return 'apply'
    if (path.includes('requests')) return 'requests'
    if (path.includes('calendar')) return 'calendar'
    if (path.includes('shift-rotation')) return 'shift-rotation'
    return 'policies'
  }

  const activeTab = getActiveTabFromPath()

  const filteredTabs = TABS.filter(tab => {
    if (tab.id === 'apply') {
      return !isAdmin
    }
    return true
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        // Fetch policies for active count
        const policies = await getPolicies()
        const list = Array.isArray(policies) ? policies : []
        const activePolicies = list.filter(p => p.status?.toLowerCase() === 'active').length

        // Fetch real leave request counts (HR/Admin only)
        let pendingRequests = 0
        let approvedThisMonth = 0
        let onLeaveToday = 0
        try {
          const requests = await leaveService.getAllLeaveRequests()
          const reqList = Array.isArray(requests) ? requests : []
          pendingRequests = reqList.filter(r => (r.status || '').toLowerCase() === 'pending').length

          // Approved this month
          const now = new Date()
          approvedThisMonth = reqList.filter(r => {
            if ((r.status || '').toLowerCase() !== 'approved') return false
            const date = new Date(r.created_at || r.start_date || r.from || '')
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
          }).length

          // On leave today (approved leave spanning today)
          const todayStr = now.toISOString().split('T')[0]
          onLeaveToday = reqList.filter(r => {
            if ((r.status || '').toLowerCase() !== 'approved') return false
            const start = r.start_date || r.from || ''
            const end = r.end_date || r.to || start
            return start <= todayStr && todayStr <= end
          }).length
        } catch {
          // silently fall back to 0 for request stats
        }

        setStats({
          activePolicies,
          pendingRequests,
          approvedThisMonth,
          onLeaveToday,
        })
      } catch (err) {
        console.error('Failed to fetch leave stats:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [location.pathname])

  const handleTabChange = (tab) => {
    navigate(tab.path)
  }

  const flowIdx = (() => {
    if (activeTab === 'policies') return 0
    if (activeTab === 'balance') return 2
    if (activeTab === 'apply') return 3
    if (activeTab === 'requests') return 4
    if (activeTab === 'calendar') return 5
    return 0
  })()

  const renderContent = () => {
    switch (activeTab) {
      case 'policies':
        return <PoliciesPage />
      case 'balance':
        return isAdmin ? <HRLeaveBalancePage /> : <BalancePage />
      case 'apply':
        return <ApplyLeavePage />
      case 'requests':
        return <HRLeaveRequestsPage />
      case 'calendar':
        return <CalendarPage />
      case 'shift-rotation':
        return <ShiftRotationPage />
      default:
        return <PoliciesPage />
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#F7F8FA]">
      {/* HEADER */}
      <div className="shrink-0 border-b border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Leave Management</h1>
            <p className="text-sm text-slate-500">
              Policy → Assignment → Balance → Request → Approval
            </p>
          </div>

          {/* STATS */}
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Active Policies', value: stats.activePolicies, color: 'text-blue-700 bg-blue-50' },
              { label: 'Pending', value: stats.pendingRequests, color: 'text-amber-700 bg-amber-50' },
              { label: 'Approved', value: stats.approvedThisMonth, color: 'text-emerald-700 bg-emerald-50' },
              { label: 'On Leave Today', value: stats.onLeaveToday, color: 'text-rose-700 bg-rose-50' },
            ].map(s => (
              <div key={s.label} className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm ${s.color}`}>
                <span className="text-lg font-bold">{s.value}</span>
                <span className="text-xs opacity-70">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FLOW INDICATOR */}
        <div className="flex items-center gap-0 overflow-x-auto px-6 pb-3 [&::-webkit-scrollbar]:hidden">
          {FLOW.map((step, i) => (
            <div key={step} className="flex items-center shrink-0">
              <div className={`rounded-full px-3 py-1 text-[11px] font-semibold ${i <= flowIdx ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                {step}
              </div>
              {i < FLOW.length - 1 && (
                <div className={`mx-1 h-px w-5 ${i < flowIdx ? 'bg-slate-900' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* TABS */}
        <div className="flex overflow-x-auto border-t border-slate-100 px-6 [&::-webkit-scrollbar]:hidden">
          {filteredTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab)}
              className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-hidden">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="h-full overflow-auto"
        >
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-sm font-semibold text-slate-500">Loading leave management...</p>
              </div>
            </div>
          ) : (
            renderContent()
          )}
        </motion.div>
      </div>
    </div>
  )
}

// ── Shift Rotation Page (Inline component) ──
function ShiftRotationPage() {
  const navigate = useNavigate()
  const [shifts, setShifts] = useState([])
  const [employees, setEmployees] = useState([])
  const [roster, setRoster] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const getMonday = (d) => {
    const date = new Date(d)
    const day = date.getDay()
    const diff = date.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(date.setDate(diff))
    const yyyy = monday.getFullYear()
    const mm = String(monday.getMonth() + 1).padStart(2, '0')
    const dd = String(monday.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const monday = getMonday(new Date())
        const [shiftsData, rosterData, employeesData] = await Promise.all([
          attendanceService.getShifts(),
          attendanceService.getWeeklyRoster(monday),
          employeeService.getEmployees(1, 1000)
        ])

        setShifts(Array.isArray(shiftsData) ? shiftsData : [])
        setRoster(rosterData)

        // Handle employee data structure
        if (Array.isArray(employeesData)) {
          setEmployees(employeesData)
        } else if (employeesData && Array.isArray(employeesData.employees)) {
          setEmployees(employeesData.employees)
        } else {
          setEmployees([])
        }
      } catch (err) {
        console.error('Failed to fetch shift rotation data:', err)
        setError('Failed to load shift rotation data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const getShiftName = (shiftId) => {
    if (!shiftId) return { name: 'OFF', timing: '' }
    const s = shifts.find(item => String(item.id || item._id) === String(shiftId))
    if (s) {
      return {
        name: s.name,
        timing: `${s.start_time} - ${s.end_time}`,
        fullName: `${s.name} (${s.start_time} - ${s.end_time})`
      }
    }
    return { name: 'Fixed Shift', timing: '', fullName: 'Fixed Shift' }
  }

  const getShiftDetails = (employee) => {
    // First check if employee has a default_shift_id in custom_fields_json
    const defaultShiftId = employee.custom_fields_json?.default_shift_id

    if (defaultShiftId) {
      const shift = getShiftName(defaultShiftId)
      return {
        current: shift.fullName || shift.name,
        currentName: shift.name,
        currentTiming: shift.timing,
        next: shift.fullName || shift.name,
        nextName: shift.name,
        nextTiming: shift.timing,
        nextDate: 'Ongoing',
        hasShift: true
      }
    }

    // Fallback to roster-based assignment (for rotational shifts)
    if (!roster || !roster.assignments || roster.assignments.length === 0) {
      return {
        current: 'Not Assigned',
        currentName: 'Not Assigned',
        currentTiming: '',
        next: 'Not Assigned',
        nextName: 'Not Assigned',
        nextTiming: '',
        nextDate: 'N/A',
        hasShift: false
      }
    }

    const assignment = roster.assignments.find(a =>
      String(a.employee_id) === String(employee.id)
    )

    if (!assignment || !assignment.schedule) {
      return {
        current: 'Not Assigned',
        currentName: 'Not Assigned',
        currentTiming: '',
        next: 'Not Assigned',
        nextName: 'Not Assigned',
        nextTiming: '',
        nextDate: 'N/A',
        hasShift: false
      }
    }

    // Find today's day offset (0 = Monday, 6 = Sunday)
    const today = new Date()
    let todayOffset = today.getDay() - 1 // getDay() is 0 (Sun) to 6 (Sat)
    if (todayOffset < 0) todayOffset = 6 // Map Sunday to 6

    const todaySched = assignment.schedule[todayOffset] || assignment.schedule[String(todayOffset)]
    let currentShift = { name: 'Weekly OFF', timing: '', fullName: 'Weekly OFF' }
    if (todaySched && !todaySched.is_holiday && !todaySched.is_leave && todaySched.shift_id) {
      currentShift = getShiftName(todaySched.shift_id)
    }

    // Find next day's shift
    const nextOffset = (todayOffset + 1) % 7
    const nextSched = assignment.schedule[nextOffset] || assignment.schedule[String(nextOffset)]
    let nextShift = { name: 'Weekly OFF', timing: '', fullName: 'Weekly OFF' }
    if (nextSched && !nextSched.is_holiday && !nextSched.is_leave && nextSched.shift_id) {
      nextShift = getShiftName(nextSched.shift_id)
    }

    const tomorrow = new Date()
    tomorrow.setDate(today.getDate() + 1)
    const nextDateStr = tomorrow.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })

    return {
      current: currentShift.fullName || currentShift.name,
      currentName: currentShift.name,
      currentTiming: currentShift.timing,
      next: nextShift.fullName || nextShift.name,
      nextName: nextShift.name,
      nextTiming: nextShift.timing,
      nextDate: nextDateStr,
      hasShift: true
    }
  }

  // Calculate dynamic stats from real data
  const activeRotationsCount = shifts.length
  const employeesRotatedCount = roster?.assignments?.length || 0

  // Count employees who have shifts assigned (either via custom_fields or roster)
  const employeesWithShifts = employees.filter(emp => {
    const hasDefaultShift = emp.custom_fields_json?.default_shift_id
    const hasRosterShift = roster?.assignments?.some(a => String(a.employee_id) === String(emp.id))
    return hasDefaultShift || hasRosterShift
  }).length

  const upcomingChangesCount = Math.max(0, Math.round(employeesRotatedCount / 2))

  // Generate table rows from real employees
  const tableRows = employees.slice(0, 10).map(emp => {
    const details = getShiftDetails(emp)
    return {
      id: emp.id,
      name: `${emp.first_name} ${emp.last_name}`,
      current: details.current,
      currentName: details.currentName,
      currentTiming: details.currentTiming,
      nextDate: details.nextDate,
      next: details.next,
      nextName: details.nextName,
      nextTiming: details.nextTiming,
      status: details.hasShift ? 'Active' : 'Not Assigned'
    }
  })

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-12">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm font-semibold text-slate-500">Loading shift rotation data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Shift Rotation</h2>
          <p className="text-sm text-slate-500 mt-1">Manage shift rotations and assignments for employees</p>
        </div>
        <button
          onClick={() => navigate('/attendance/shifts')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition cursor-pointer shadow-sm"
        >
          <Clock className="h-4 w-4" />
          Go to Shift Management
        </button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Active Shifts', value: String(activeRotationsCount), icon: ArrowRightLeft, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Employees with Shifts', value: String(employeesWithShifts), icon: Users, color: 'text-blue-600 bg-blue-50' },
          { label: 'Total Employees', value: String(employees.length), icon: CalendarDays, color: 'text-amber-600 bg-amber-50' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
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

      {/* Quick overview table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4">
          <h3 className="text-md font-bold text-slate-900">Current Rotation Schedule</h3>
          <p className="text-xs text-slate-500 mt-1">
            {tableRows.length > 0 ? `Showing ${tableRows.length} of ${employees.length} employees` : 'No employees found'}
          </p>
        </div>
        <div className="overflow-x-auto">
          {tableRows.length === 0 ? (
            <div className="flex items-center justify-center p-12">
              <div className="text-center">
                <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-500">No employees found</p>
                <p className="text-xs text-slate-400 mt-1">Add employees to see their shift rotation</p>
              </div>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Employee</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Shift</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Shift Timing</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Next Rotation</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Next Shift</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {tableRows.map((row, i) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{row.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {row.currentName === 'Not Assigned' ? (
                        <span className="inline-flex rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-500">
                          {row.currentName}
                        </span>
                      ) : (
                        <span className="inline-flex rounded-lg bg-blue-50 border border-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                          {row.currentName}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono font-bold text-slate-700">
                      {row.currentTiming || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{row.nextDate}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {row.nextName === 'Not Assigned' ? (
                        <span className="inline-flex rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-500">
                          {row.nextName}
                        </span>
                      ) : (
                        <span className="inline-flex rounded-lg bg-purple-50 border border-purple-100 px-2.5 py-1 text-xs font-semibold text-purple-700">
                          {row.nextName}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {row.status === 'Active' ? (
                        <span className="inline-flex rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                          {row.status}
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-amber-50 border border-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                          {row.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Link to full shift management */}
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-indigo-900 text-sm">Full Shift Configuration</h4>
            <p className="text-xs text-indigo-700 mt-1">
              Configure shift timings, assign employees to shifts, and manage weekly rosters in the dedicated Shift Management module.
            </p>
          </div>
          <button
            onClick={() => navigate('/attendance/shifts')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition cursor-pointer shadow-sm whitespace-nowrap"
          >
            <ArrowRightLeft className="h-4 w-4" />
            Open Shift Manager
          </button>
        </div>
      </div>

      {/* Shift Assignment Details */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4">
          <h3 className="text-md font-bold text-slate-900">Shift Assignment Details</h3>
          <p className="text-xs text-slate-500 mt-1">Complete list of all employees and their assigned shifts</p>
        </div>
        <div className="p-6">
          {employees.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-500">No employees found</p>
                <p className="text-xs text-slate-400 mt-1">Add employees to assign shifts</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {employees.map(emp => {
                const details = getShiftDetails(emp)
                const hasShift = details.hasShift
                return (
                  <div key={emp.id} className={`rounded-xl border p-4 ${hasShift ? 'bg-blue-50/30 border-blue-100' : 'bg-slate-50/30 border-slate-200'}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-slate-900">{emp.first_name} {emp.last_name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{emp.employee_number}</p>
                      </div>
                      {hasShift ? (
                        <span className="inline-flex rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">
                          ASSIGNED
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-slate-400 px-2 py-0.5 text-[10px] font-bold text-white">
                          NOT ASSIGNED
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      {hasShift ? (
                        <>
                          <div className="rounded-lg bg-white/60 border border-blue-200/50 p-2.5">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Current Shift</span>
                              <Clock className="h-3 w-3 text-blue-600" />
                            </div>
                            <p className="text-sm font-bold text-blue-900">{details.currentName}</p>
                            {details.currentTiming && (
                              <p className="text-xs font-mono font-bold text-blue-700 mt-1">
                                {details.currentTiming}
                              </p>
                            )}
                          </div>
                          {details.nextDate !== 'Ongoing' && (
                            <>
                              <div className="flex items-center justify-between text-xs pt-1">
                                <span className="text-slate-500 font-medium">Next Rotation:</span>
                                <span className="font-semibold text-slate-700">{details.nextDate}</span>
                              </div>
                              <div className="rounded-lg bg-white/60 border border-purple-200/50 p-2.5">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Next Shift</span>
                                  <ArrowRightLeft className="h-3 w-3 text-purple-600" />
                                </div>
                                <p className="text-sm font-bold text-purple-900">{details.nextName}</p>
                                {details.nextTiming && (
                                  <p className="text-xs font-mono font-bold text-purple-700 mt-1">
                                    {details.nextTiming}
                                  </p>
                                )}
                              </div>
                            </>
                          )}
                        </>
                      ) : (
                        <div className="rounded-lg bg-white/40 border border-slate-200 p-3 text-center">
                          <p className="text-xs font-semibold text-slate-500">No shift assigned</p>
                          <p className="text-[10px] text-slate-400 mt-1">Assign shift in Attendance → Shifts</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
