import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  FileBarChart2, Download, Filter, CalendarDays, FileSpreadsheet,
  FileText, Clock, MapPin, Globe, AlertCircle, TrendingDown,
  Fingerprint, ChevronRight, CheckCircle2, ArrowDown, AlertTriangle
} from 'lucide-react'
import apiClient from '../../services/apiClient'
import { API_BASE_URL } from '../../config/api'

// Icon map for dynamic icon selection
const ICON_MAP = {
  FileBarChart2, Download, Filter, CalendarDays, FileSpreadsheet,
  FileText, Clock, MapPin, Globe, AlertCircle, TrendingDown,
  Fingerprint, ChevronRight, CheckCircle2, ArrowDown
}

// Fallback mock data for development
const FALLBACK_REPORTS = [
  {
    id: 'daily',
    title: 'Daily Attendance Report',
    desc: 'All employees — Shift, Check-in, Check-out, Hours Worked, OT Hours',
    icon: 'CalendarDays',
    format: 'CSV',
    color: 'from-blue-500 to-indigo-600',
    badge: 'Daily',
    fields: ['Employee', 'Dept', 'Shift', 'Check-In', 'Check-Out', 'Hours', 'OT Hrs', 'Status'],
    filters: ['Date Range', 'Department', 'Employee', 'Status'],
  },
  {
    id: 'monthly',
    title: 'Monthly Attendance Summary',
    desc: 'One row per employee, columns per day. P/A/L/H/WH/HD colour-coded',
    icon: 'FileSpreadsheet',
    format: 'XLSX',
    color: 'from-violet-500 to-purple-600',
    badge: 'Monthly',
    fields: ['Employee', 'Day 1', 'Day 2', '…', 'Day 31', 'Total P', 'Total A'],
    filters: ['Month', 'Department', 'Employee', 'Status'],
  },
  {
    id: 'late',
    title: 'Late Arrivals Report',
    desc: 'Count, dates, minutes late, Bradford Factor score',
    icon: 'TrendingDown',
    format: 'CSV',
    color: 'from-rose-500 to-pink-600',
    badge: 'Compliance',
    fields: ['Employee', 'Date', 'Scheduled', 'Actual In', 'Mins Late', 'Bradford Pts'],
    filters: ['Date Range', 'Department', 'Employee'],
  },
  {
    id: 'absence',
    title: 'Absence Report',
    desc: 'Unexplained absences + approved leave, Bradford Factor (UK)',
    icon: 'AlertCircle',
    format: 'CSV',
    color: 'from-slate-600 to-slate-800',
    badge: 'HR',
    fields: ['Employee', 'Date', 'Type', 'Leave Code', 'Approved', 'Bradford Score'],
    filters: ['Date Range', 'Department', 'Employee', 'Type'],
  },
]

const FALLBACK_STATS = [
  { label: 'Reports Available', value: '4', color: 'bg-blue-600' },
  { label: 'CSV Exports', value: '3', color: 'bg-emerald-600' },
  { label: 'Excel Exports', value: '1', color: 'bg-violet-600' },
]

const FALLBACK_GROUPS = [
  { 
    label: '📋 Attendance Reports', 
    reports: ['daily', 'monthly', 'late', 'absence'] 
  },
]

function ReportCard({ report, index, onPreview }) {
  const [loading, setLoading] = useState(false)
  
  // Get icon from map, fallback to FileBarChart2
  const IconComponent = ICON_MAP[report.icon] || FileBarChart2

  const handleDownload = async () => {
    setLoading(true)
    try {
      // Get date range - default to last 30 days
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 30)
      
      const startStr = startDate.toISOString().split('T')[0]
      const endStr = endDate.toISOString().split('T')[0]
      
      // Fetch data from the report's data API
      let csvContent = ''
      let logs = []
      
      try {
        console.log('Fetching report data for:', report.id)
        console.log('Date range:', startStr, 'to', endStr)
        
        if (report.id === 'daily_attendance' || report.id === 'daily') {
          // Fetch attendance logs
          try {
            const response = await apiClient.get(
              `${API_BASE_URL}/v1/attendance/logs?start_date=${startStr}&end_date=${endStr}`
            )
            
            console.log('API Response:', response)
            
            // Handle different response structures
            if (Array.isArray(response)) {
              logs = response
            } else if (response.data && Array.isArray(response.data)) {
              logs = response.data
            } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
              logs = response.data.data
            } else if (typeof response === 'object' && response !== null) {
              // Check if response itself has log properties
              logs = [response]
            }
            
            console.log('Processed logs:', logs.length, 'records')
            
            // Log unique employees to verify
            const uniqueEmployees = [...new Set(logs.map(log => log.employee_name || log.employee_id))]
            console.log('Unique employees found:', uniqueEmployees.length, 'employees')
            console.log('Employee names:', uniqueEmployees.slice(0, 10))
            
          } catch (apiErr) {
            console.error('API call failed:', apiErr)
            logs = []
          }
          
          // Create CSV header
          csvContent = 'Employee Name,Employee ID,Department,Date,Shift,Check-In,Check-Out,Working Hours,Overtime Hours,Status,Work Mode,Location\n'
          
          // Add data rows
          if (logs.length > 0) {
            logs.forEach(log => {
              const employeeName = log.employee_name || log.employee?.name || log.name || 'Unknown'
              const employeeId = log.employee_number || log.employee_id || log.employee?.employee_number || '-'
              const department = log.department_name || log.department || log.employee?.department || '-'
              const date = log.date ? (typeof log.date === 'string' ? log.date : new Date(log.date).toLocaleDateString()) : '-'
              const shift = log.shift_name || log.shift || '-'
              const checkIn = log.check_in_at ? new Date(log.check_in_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'
              const checkOut = log.check_out_at ? new Date(log.check_out_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'
              const workingHours = (log.working_hours !== undefined && log.working_hours !== null) ? Number(log.working_hours).toFixed(2) : '0.00'
              const overtimeHours = (log.overtime_hours !== undefined && log.overtime_hours !== null) ? Number(log.overtime_hours).toFixed(2) : '0.00'
              const status = (log.status || 'present').toString().toUpperCase()
              const workMode = log.is_wfh ? 'WFH' : (log.work_mode || 'Office')
              const location = log.check_in_location_json?.address || log.location || '-'
              
              csvContent += `"${employeeName}","${employeeId}","${department}","${date}","${shift}","${checkIn}","${checkOut}","${workingHours}","${overtimeHours}","${status}","${workMode}","${location}"\n`
            })
          } else {
            // Add sample row if no records
            csvContent += '"No attendance data available for the selected date range","-","-","-","-","-","-","0.00","0.00","-","-","-"\n'
            csvContent += '"Please ensure employees have checked in/out during this period","-","-","-","-","-","-","0.00","0.00","-","-","-"\n'
          }
        } else if (report.id === 'late_arrivals' || report.id === 'late') {
          // Late Arrivals Report
          try {
            const response = await apiClient.get(
              `${API_BASE_URL}/v1/attendance/logs?start_date=${startStr}&end_date=${endStr}`
            )
            
            logs = Array.isArray(response) ? response : (response.data || response || [])
            
            console.log('Late arrivals report - logs fetched:', logs.length)
            
            csvContent = 'Employee Name,Employee ID,Date,Scheduled Time,Actual Check-In,Minutes Late,Status\n'
            
            // Filter for late arrivals
            const lateLogs = logs.filter(log => {
              const status = (log.status || '').toLowerCase()
              return status === 'late'
            })
            
            console.log('Late logs found:', lateLogs.length)
            
            if (lateLogs.length > 0) {
              lateLogs.forEach(log => {
                const employeeName = log.employee_name || 'Unknown'
                const employeeId = log.employee_number || '-'
                const date = log.date ? (typeof log.date === 'string' ? log.date.split('T')[0] : new Date(log.date).toLocaleDateString()) : '-'
                const scheduledTime = log.shift_start_time || '09:00'
                const actualCheckIn = log.check_in_at ? new Date(log.check_in_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'
                
                // Calculate minutes late
                let minsLate = 0
                if (log.check_in_at && log.shift_start_time) {
                  const checkInTime = new Date(log.check_in_at)
                  const [schedHour, schedMin] = log.shift_start_time.split(':').map(Number)
                  const scheduledDate = new Date(checkInTime)
                  scheduledDate.setHours(schedHour, schedMin, 0, 0)
                  minsLate = Math.max(0, Math.round((checkInTime - scheduledDate) / 60000))
                }
                
                const status = (log.status || 'late').toUpperCase()
                
                csvContent += `"${employeeName}","${employeeId}","${date}","${scheduledTime}","${actualCheckIn}","${minsLate}","${status}"\n`
              })
            } else {
              csvContent += '"No late arrivals found for the selected period","-","-","-","-","0","-"\n'
            }
          } catch (apiErr) {
            console.error('Late arrivals API error:', apiErr)
            csvContent = 'Employee Name,Employee ID,Date,Scheduled Time,Actual Check-In,Minutes Late,Status\n'
            csvContent += '"API Error - Unable to fetch late arrival data","-","-","-","-","0","-"\n'
          }
        } else if (report.id === 'overtime') {
          // Overtime Report
          try {
            const response = await apiClient.get(
              `${API_BASE_URL}/v1/attendance/logs?start_date=${startStr}&end_date=${endStr}`
            )
            
            logs = Array.isArray(response) ? response : (response.data || response || [])
            
            console.log('Overtime report - Total logs fetched:', logs.length)
            console.log('Sample log structure:', logs[0])
            
            csvContent = 'Employee Name,Employee ID,Date,Regular Hours,Overtime Hours,OT Rate,OT Pay\n'
            
            // Check overtime values in all logs
            logs.forEach((log, index) => {
              if (index < 5) { // Log first 5 for debugging
                console.log(`Log ${index + 1} - Employee: ${log.employee_name}, Working Hours: ${log.working_hours}, OT Hours: ${log.overtime_hours}`)
              }
            })
            
            // Filter for records with overtime - check multiple conditions
            const otLogs = logs.filter(log => {
              const ot = Number(log.overtime_hours || 0)
              const working = Number(log.working_hours || 0)
              // Consider OT if overtime_hours > 0 OR working_hours > 8
              return ot > 0 || working > 8
            })
            
            console.log('Overtime logs found:', otLogs.length)
            console.log('Overtime logs details:', otLogs)
            
            if (otLogs.length > 0) {
              otLogs.forEach(log => {
                const employeeName = log.employee_name || 'Unknown'
                const employeeId = log.employee_number || '-'
                
                // Better date formatting - ensure simple date string
                let dateStr = '-'
                if (log.date) {
                  try {
                    if (typeof log.date === 'string') {
                      // If it's ISO string, extract just the date part
                      dateStr = log.date.includes('T') ? log.date.split('T')[0] : log.date
                    } else {
                      // If it's a Date object
                      const d = new Date(log.date)
                      const year = d.getFullYear()
                      const month = String(d.getMonth() + 1).padStart(2, '0')
                      const day = String(d.getDate()).padStart(2, '0')
                      dateStr = `${year}-${month}-${day}`
                    }
                  } catch (e) {
                    console.error('Date parsing error:', e)
                    dateStr = String(log.date).substring(0, 10)
                  }
                }
                
                const workingHours = Number(log.working_hours || 0)
                const overtimeHours = Number(log.overtime_hours || 0)
                
                // If overtime_hours is 0 but working > 8, calculate OT
                let actualOT = overtimeHours
                let actualRegular = workingHours - overtimeHours
                
                if (overtimeHours === 0 && workingHours > 8) {
                  actualOT = workingHours - 8
                  actualRegular = 8
                }
                
                const regularHours = actualRegular.toFixed(2)
                const otHours = actualOT.toFixed(2)
                const otRate = '1.5x'
                // Assuming hourly rate of 500 for calculation (can be adjusted)
                const otPay = (actualOT * 1.5 * 500).toFixed(2)
                
                csvContent += `"${employeeName}","${employeeId}","${dateStr}","${regularHours}","${otHours}","${otRate}","${otPay}"\n`
              })
            } else {
              // If no OT found, show sample of all records for debugging
              csvContent += '"No overtime records found. Showing sample attendance records below:","-","-","-","-","-","-"\n'
              
              logs.slice(0, 10).forEach(log => {
                const employeeName = log.employee_name || 'Unknown'
                const employeeId = log.employee_number || '-'
                const date = log.date ? (typeof log.date === 'string' ? log.date.split('T')[0] : new Date(log.date).toLocaleDateString()) : '-'
                const workingHours = Number(log.working_hours || 0).toFixed(2)
                const overtimeHours = Number(log.overtime_hours || 0).toFixed(2)
                
                csvContent += `"${employeeName}","${employeeId}","${date}","${workingHours}","${overtimeHours}","-","Sample data"\n`
              })
            }
          } catch (apiErr) {
            console.error('Overtime API error:', apiErr)
            csvContent = 'Employee Name,Employee ID,Date,Regular Hours,Overtime Hours,OT Rate,OT Pay\n'
            csvContent += '"API Error - Unable to fetch overtime data","-","-","0.00","0.00","-","0.00"\n'
          }
        } else if (report.id === 'absence') {
          // Absence Report
          try {
            const response = await apiClient.get(
              `${API_BASE_URL}/v1/attendance/logs?start_date=${startStr}&end_date=${endStr}`
            )
            
            logs = Array.isArray(response) ? response : (response.data || response || [])
            
            console.log('Absence report - Total logs fetched:', logs.length)
            console.log('Sample log for debugging:', logs[0])
            
            csvContent = 'Employee Name,Employee ID,Date,Type,Leave Code,Approved,Reason\n'
            
            // Filter for absences and leaves - check multiple variations
            const absenceLogs = logs.filter(log => {
              const status = (log.status || '').toLowerCase().trim()
              console.log('Checking log - Employee:', log.employee_name, 'Status:', status)
              return status === 'absent' || 
                     status === 'on_leave' || 
                     status === 'leave' ||
                     status === 'on leave' ||
                     status.includes('absent') ||
                     status.includes('leave')
            })
            
            console.log('Absence logs found:', absenceLogs.length)
            console.log('Absence logs details:', absenceLogs)
            
            if (absenceLogs.length > 0) {
              absenceLogs.forEach(log => {
                const employeeName = log.employee_name || 'Unknown'
                const employeeId = log.employee_number || '-'
                const date = log.date ? (typeof log.date === 'string' ? log.date.split('T')[0] : new Date(log.date).toLocaleDateString()) : '-'
                const status = (log.status || '').toLowerCase()
                const type = (status.includes('leave') || status === 'on_leave') ? 'Approved Leave' : 'Absence'
                const leaveCode = log.leave_type || log.leave_code || '-'
                const approved = (status.includes('leave') || status === 'on_leave') ? 'Yes' : 'No'
                const reason = log.notes || log.reason || '-'
                
                csvContent += `"${employeeName}","${employeeId}","${date}","${type}","${leaveCode}","${approved}","${reason}"\n`
              })
            } else {
              // Still add all records but mark as info message first
              csvContent += '"No absence/leave records found for selected period. Showing all attendance records below:","-","-","-","-","-","-"\n'
              
              // Add all logs for debugging (first 10)
              logs.slice(0, 10).forEach(log => {
                const employeeName = log.employee_name || 'Unknown'
                const employeeId = log.employee_number || '-'
                
                // Better date formatting
                let dateStr = '-'
                if (log.date) {
                  try {
                    if (typeof log.date === 'string') {
                      dateStr = log.date.includes('T') ? log.date.split('T')[0] : log.date
                    } else {
                      const d = new Date(log.date)
                      const year = d.getFullYear()
                      const month = String(d.getMonth() + 1).padStart(2, '0')
                      const day = String(d.getDate()).padStart(2, '0')
                      dateStr = `${year}-${month}-${day}`
                    }
                  } catch (e) {
                    dateStr = String(log.date).substring(0, 10)
                  }
                }
                
                const status = (log.status || 'N/A').toUpperCase()
                csvContent += `"${employeeName}","${employeeId}","${dateStr}","Status: ${status}","-","-","All records for review"\n`
              })
            }
          } catch (apiErr) {
            console.error('Absence API error:', apiErr)
            csvContent = 'Employee Name,Employee ID,Date,Type,Leave Code,Approved,Reason\n'
            csvContent += '"API Error - Unable to fetch absence data","-","-","-","-","-","-"\n'
          }
        } else if (report.id === 'monthly') {
          // Monthly summary report - Fetch attendance logs and aggregate by employee
          try {
            const response = await apiClient.get(
              `${API_BASE_URL}/v1/attendance/logs?start_date=${startStr}&end_date=${endStr}`
            )
            
            logs = Array.isArray(response) ? response : (response.data || response || [])
            
            console.log('Monthly report - logs fetched:', logs.length)
            
            // Aggregate by employee
            const employeeStats = {}
            
            logs.forEach(log => {
              const empId = log.employee_id
              if (!employeeStats[empId]) {
                employeeStats[empId] = {
                  name: log.employee_name || 'Unknown',
                  employeeNumber: log.employee_number || '-',
                  department: log.department || '-',
                  totalDays: 0,
                  present: 0,
                  absent: 0,
                  late: 0,
                  onLeave: 0,
                  holidays: 0,
                  wfh: 0
                }
              }
              
              const stats = employeeStats[empId]
              stats.totalDays++
              
              const status = (log.status || '').toLowerCase()
              
              if (status === 'present') stats.present++
              else if (status === 'absent') stats.absent++
              else if (status === 'late') {
                stats.present++
                stats.late++
              }
              else if (status === 'on_leave' || status === 'leave') stats.onLeave++
              else if (status === 'holiday') stats.holidays++
              
              if (log.is_wfh) stats.wfh++
            })
            
            // Create CSV
            csvContent = 'Employee Name,Employee ID,Department,Total Days,Present,Absent,Late,On Leave,Holidays,WFH\n'
            
            if (Object.keys(employeeStats).length > 0) {
              Object.values(employeeStats).forEach(stats => {
                csvContent += `"${stats.name}","${stats.employeeNumber}","${stats.department}","${stats.totalDays}","${stats.present}","${stats.absent}","${stats.late}","${stats.onLeave}","${stats.holidays}","${stats.wfh}"\n`
              })
            } else {
              csvContent += '"No attendance data available for the selected month","-","-","0","0","0","0","0","0","0"\n'
              csvContent += '"Please ensure employees have logged attendance during this period","-","-","0","0","0","0","0","0","0"\n'
            }
          } catch (apiErr) {
            console.error('Monthly report API error:', apiErr)
            csvContent = 'Employee Name,Employee ID,Department,Total Days,Present,Absent,Late,On Leave,Holidays,WFH\n'
            csvContent += '"API Error - Unable to fetch monthly data","-","-","0","0","0","0","0","0","0"\n'
          }
        } else {
          // For other reports, create template CSV
          csvContent = report.fields ? (report.fields.join(',') + '\n') : 'Column1,Column2,Column3\n'
          csvContent += `"${report.title} - Data will be populated once attendance records are available","-","-"\n`
          csvContent += '"Please check back after employees have logged attendance","-","-"\n'
        }
      } catch (apiError) {
        console.error('Detailed API Error:', apiError)
        console.error('Error name:', apiError.name)
        console.error('Error message:', apiError.message)
        console.error('Error response:', apiError.response)
        
        // Create meaningful error CSV
        csvContent = report.fields ? (report.fields.join(',') + '\n') : 'Error,Message,Details\n'
        csvContent += `"API Connection Error","${apiError.message}","Please check if backend server is running"\n`
        csvContent += '"Common fixes:","1. Verify backend is running on correct port","2. Check API_BASE_URL configuration"\n'
      }
      
      console.log('CSV Content (first 200 chars):', csvContent.substring(0, 200))
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', `${report.id}_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up URL
      setTimeout(() => URL.revokeObjectURL(url), 100)
      
      console.log('CSV download initiated successfully')
      
    } catch (error) {
      console.error('Download failed - Outer catch:', error)
      console.error('Error details:', error.message, error.stack)
      alert(`Failed to generate report: ${error.message}.\n\nPlease check browser console for details.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 260, damping: 22 }}
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
    >
      {/* Card Header Gradient */}
      <div className={`rounded-t-2xl bg-gradient-to-r ${report.color} p-4`}>
        <div className="flex items-start justify-between">
          <div className="rounded-xl bg-white/20 p-2.5 backdrop-blur-sm">
            <IconComponent className="h-5 w-5 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
              {report.badge}
            </span>
            <span className="rounded-full bg-black/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
              {report.format}
            </span>
          </div>
        </div>
        <h3 className="mt-3 text-sm font-bold leading-tight text-white">{report.title}</h3>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs leading-relaxed text-slate-500">{report.desc}</p>

        {/* Column preview */}
        <div className="mt-3 flex flex-wrap gap-1">
          {report.fields?.slice(0, 4).map(f => (
            <span key={f} className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-500">{f}</span>
          ))}
          {report.fields?.length > 4 && (
            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-400">+{report.fields.length - 4} more</span>
          )}
        </div>

        {/* Actions */}
        <div className="mt-auto pt-4">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleDownload}
            className={`flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${report.color} px-3 py-2 text-xs font-bold text-white shadow-sm transition-all hover:opacity-90`}
          >
            {loading ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                  className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white"
                />
                Generating…
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5" />
                Export {report.format}
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

function PreviewPanel({ report, onClose }) {
  // Get icon from map, fallback to FileBarChart2
  const IconComponent = ICON_MAP[report?.icon] || FileBarChart2
  
  return (
    <AnimatePresence>
      {report && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 40 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex flex-col border border-slate-200 bg-white shadow-2xl rounded-3xl w-96 max-h-[85vh] overflow-hidden"
          >
            <div className={`bg-gradient-to-r ${report.color} p-6`}>
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-white/20 p-2.5">
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                <button onClick={onClose} className="rounded-xl bg-white/20 p-1.5 text-white hover:bg-white/30 transition-all">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <h3 className="mt-4 text-lg font-bold text-white">{report.title}</h3>
              <div className="mt-2 flex gap-2">
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold text-white">{report.badge}</span>
                <span className="rounded-full bg-black/20 px-2.5 py-0.5 text-[10px] font-bold text-white">{report.format}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Report Description</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{report.desc}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Data Columns</h4>
                <div className="space-y-2">
                  {report.fields?.map((f, i) => (
                    <div key={f} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[9px] font-black text-slate-500">{i+1}</span>
                      <span className="text-sm font-medium text-slate-700">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Filters Available</h4>
                <div className="space-y-2">
                  {report.filters?.map(f => (
                    <div key={f} className="flex items-center gap-2">
                      <Filter className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-sm text-slate-600">{f}</span>
                    </div>
                  )) || ['Date Range', 'Department', 'Employee', 'Region'].map(f => (
                    <div key={f} className="flex items-center gap-2">
                      <Filter className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-sm text-slate-600">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 p-4">
              <motion.button whileTap={{ scale: 0.97 }}
                className={`flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${report.color} py-3 text-sm font-bold text-white shadow-lg`}
              >
                <Download className="h-4 w-4" />
                Generate & Export {report.format}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default function AttendanceReportsPage() {
  const [preview, setPreview] = useState(null)
  const [dateRange, setDateRange] = useState({ from: '', to: '' })
  const [reports, setReports] = useState([])
  const [stats, setStats] = useState([])
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Try to fetch reports from API, but use fallback if not available
        try {
          const reportsRes = await apiClient.get(`${API_BASE_URL}/v1/attendance/reports`)
          const reportsData = Array.isArray(reportsRes.data) ? reportsRes.data : reportsRes.data?.reports || reportsRes || FALLBACK_REPORTS
          setReports(reportsData)

          const statsRes = await apiClient.get(`${API_BASE_URL}/v1/attendance/reports/stats`)
          const statsData = Array.isArray(statsRes.data) ? statsRes.data : statsRes.data?.stats || statsRes || FALLBACK_STATS
          setStats(statsData)

          const groupsRes = await apiClient.get(`${API_BASE_URL}/v1/attendance/reports/groups`)
          let groupsData = Array.isArray(groupsRes.data) ? groupsRes.data : groupsRes.data?.groups || groupsRes || FALLBACK_GROUPS
          
          // Merge all reports into a single group
          if (Array.isArray(groupsData) && groupsData.length > 0) {
            const allReports = groupsData.flatMap(g => g.reports || [])
            groupsData = [{ label: '📋 Attendance Reports', reports: allReports }]
          }
          
          setGroups(groupsData)
        } catch (apiErr) {
          // API not available, use fallback
          console.log('Using fallback data - API endpoints not available yet')
          setReports(FALLBACK_REPORTS)
          setStats(FALLBACK_STATS)
          const mergedGroups = [{ label: '📋 Attendance Reports', reports: FALLBACK_REPORTS.map(r => r.id) }]
          setGroups(mergedGroups)
        }
      } catch (err) {
        console.error('Error:', err)
        // Final fallback
        setReports(FALLBACK_REPORTS)
        setStats(FALLBACK_STATS)
        const mergedGroups = [{ label: '📋 Attendance Reports', reports: FALLBACK_REPORTS.map(r => r.id) }]
        setGroups(mergedGroups)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-slate-200 border-t-blue-600"
          />
          <p className="text-sm text-slate-600">Loading reports...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-red-900">Error Loading Reports</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 rounded-lg bg-red-600 px-3 py-1 text-sm font-semibold text-white hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Attendance Reports & Exports</h2>
          <p className="text-sm text-slate-500">Section 29 — All statutory and operational exports</p>
        </div>

        {/* Global date filter */}
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
          <CalendarDays className="h-4 w-4 text-slate-400" />
          <input type="date" value={dateRange.from} onChange={e => setDateRange(p => ({ ...p, from: e.target.value }))}
            className="text-sm text-slate-700 focus:outline-none" />
          <span className="text-slate-300">→</span>
          <input type="date" value={dateRange.to} onChange={e => setDateRange(p => ({ ...p, to: e.target.value }))}
            className="text-sm text-slate-700 focus:outline-none" />
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div key={s.label || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className={`h-2 w-2 rounded-full ${s.color}`} />
            <div>
              <div className="text-xl font-black text-slate-900">{s.value}</div>
              <div className="text-xs font-medium text-slate-500">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Region grouping */}
      {groups.map((group, gIdx) => (
        <div key={group.label || gIdx}>
          <h3 className="mb-4 text-sm font-black uppercase tracking-widest text-slate-500">{group.label}</h3>
          <div className="grid gap-2 w-full" style={{gridTemplateColumns: 'repeat(4, 1fr)'}}>
            {group.reports && group.reports.length > 0 ? (
              group.reports.map((reportId, idx) => {
                const report = reports.find(r => r.id === reportId)
                return report ? (
                  <div key={report.id} style={{minWidth: 0}}>
                    <ReportCard report={report} index={idx} onPreview={setPreview} />
                  </div>
                ) : null
              })
            ) : (
              <div className="col-span-full text-center py-8 text-slate-500">
                No reports available in this category
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Fallback if no groups */}
      {groups.length === 0 && reports.length > 0 && (
        <div>
          <h3 className="mb-4 text-sm font-black uppercase tracking-widest text-slate-500">All Reports</h3>
          <div className="grid gap-2 w-full" style={{gridTemplateColumns: 'repeat(4, 1fr)'}}>
            {reports.map((report, i) => (
              <div key={report.id} style={{minWidth: 0}}>
                <ReportCard report={report} index={i} onPreview={setPreview} />
              </div>
            ))}
          </div>
        </div>
      )}

      <PreviewPanel report={preview} onClose={() => setPreview(null)} />
    </div>
  )
}
