import { useState, useCallback, memo, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, Pencil, UserMinus, Mail, Phone, MapPin, Calendar,
  Briefcase, Users, Banknote, FileText, Clock, MessageSquare,
  Download, Plus, CheckCircle2, XCircle, Clock3, ChevronRight,
  Building2, User, Shield, Upload, X, Eye,
} from 'lucide-react'
import { getStatusColor } from './data/employeeData'
import employeeService from '../../services/employeeService'
import EditEmployeeModal from '../../components/EditEmployeeModal'
import { useAuth } from '../../hooks/useAuth'

const formatDate = (dateStr, monthFormat = 'long') => {
  if (!dateStr || dateStr === '—') return '—'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: monthFormat, year: 'numeric' })
}

// ─── Tab config ───────────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview', label: 'Overview', icon: User },
  { id: 'job', label: 'Job Info', icon: Briefcase },
  { id: 'attendance', label: 'Attendance', icon: Clock },
  { id: 'leave', label: 'Leave', icon: Calendar },
  { id: 'payroll', label: 'Payroll', icon: Banknote },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'notes', label: 'Notes', icon: MessageSquare },
]

// ─── Info Card ────────────────────────────────────────────────────────────────
const InfoCard = memo(({ title, icon: Icon, children }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="mb-4 flex items-center gap-2">
      <Icon className="h-4 w-4 text-blue-500" />
      <h4 className="text-sm font-semibold text-slate-700">{title}</h4>
    </div>
    {children}
  </div>
))
InfoCard.displayName = 'InfoCard'

const InfoRow = memo(({ label, value }) => (
  <div className="flex items-start justify-between py-2.5 border-b border-slate-50 last:border-0">
    <span className="text-xs font-medium text-slate-400 w-36 shrink-0">{label}</span>
    <span className="text-sm font-medium text-slate-800 text-right">{value || '—'}</span>
  </div>
))
InfoRow.displayName = 'InfoRow'

// ─── Leave Status Badge ───────────────────────────────────────────────────────
const LeaveStatusBadge = memo(({ status }) => {
  const map = { Approved: 'bg-green-100 text-green-700', Rejected: 'bg-red-100 text-red-700', Pending: 'bg-amber-100 text-amber-700' }
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${map[status] || 'bg-slate-100 text-slate-600'}`}>{status}</span>
})
LeaveStatusBadge.displayName = 'LeaveStatusBadge'

// ─── Calendar View (Attendance) ───────────────────────────────────────────────
const CalendarCell = memo(({ day, type }) => {
  const color = type === 'present' ? 'bg-green-500' : type === 'absent' ? 'bg-red-400' : type === 'leave' ? 'bg-blue-400' : type === 'weekend' ? 'bg-slate-100 text-slate-400' : 'bg-white border border-slate-200'
  return (
    <div className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-medium ${color} ${type === 'present' || type === 'absent' || type === 'leave' ? 'text-white' : 'text-slate-700'}`}>
      {day}
    </div>
  )
})
CalendarCell.displayName = 'CalendarCell'

const DOC_TYPES = [
  { id: 'aadhar', label: 'Aadhar Card', documentType: 'id_proof', required: true },
  { id: 'pan', label: 'PAN Card', documentType: 'id_proof', required: true },
  { id: 'rental', label: 'Rental Agreement', documentType: 'contract', required: true },
  { id: 'police', label: 'Police Verification', documentType: 'certificate', required: true },
  { id: 'passport', label: 'Passport', documentType: 'passport', required: false },
  { id: 'photo', label: 'Photo', documentType: 'other', required: true },
  { id: 'address_proof', label: 'Address Proof', documentType: 'id_proof', required: true },
]

const formatINR = (value) => `₹${Math.round(Number(value) || 0).toLocaleString('en-IN')}`

const fileToDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onloadend = () => resolve(reader.result)
  reader.onerror = reject
  reader.readAsDataURL(file)
})

const getDocId = (doc) => {
  const fileName = (doc.file_name || '').toLowerCase()
  if (doc.document_type === 'id_proof') {
    if (fileName.includes('pan')) return 'pan'
    if (fileName.includes('address')) return 'address_proof'
    return 'aadhar'
  }
  const map = { contract: 'rental', certificate: 'police', passport: 'passport', other: fileName.includes('photo') ? 'photo' : 'photo' }
  return map[doc.document_type] || 'photo'
}

const canPreviewDocument = (doc) => {
  const url = doc?.url || ''
  const type = (doc?.type || '').toLowerCase()
  return (
    url.startsWith('data:image') ||
    url.startsWith('data:application/pdf') ||
    url.startsWith('http') ||
    url.startsWith('/') ||
    type === 'pdf'
  )
}

const DocumentPreview = ({ doc }) => {
  if (!doc?.url) {
    return <div className="flex h-full items-center justify-center text-sm text-slate-500">No preview file found.</div>
  }

  if (doc.url.startsWith('blob:')) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center">
        <div>
          <FileText className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="text-sm font-semibold text-slate-700">Preview unavailable for this older upload.</p>
          <p className="mt-1 text-xs text-slate-500">Please upload this document again so it is saved permanently.</p>
        </div>
      </div>
    )
  }

  if (doc.url.startsWith('data:image')) {
    return <img src={doc.url} alt={doc.name} className="h-full w-full object-contain p-4" />
  }

  if (canPreviewDocument(doc)) {
    return <object data={doc.url} type="application/pdf" className="h-full w-full"><iframe title={doc.name} src={doc.url} className="h-full w-full border-0" /></object>
  }

  return (
    <div className="flex h-full items-center justify-center p-8 text-center">
      <div>
        <FileText className="mx-auto mb-3 h-10 w-10 text-slate-300" />
        <p className="text-sm font-semibold text-slate-700">Preview not supported for this file type.</p>
        <p className="mt-1 text-xs text-slate-500">Use the download button to view it locally.</p>
      </div>
    </div>
  )
}

const buildPayroll = (salary, hireDate) => {
  const gross = Number(salary) || 0
  const pf = Math.round(gross * 0.12)
  const professionalTax = gross > 0 ? 200 : 0
  const tds = Math.round(gross * 0.0175)
  const deductions = pf + professionalTax + tds
  const net = Math.max(0, gross - deductions)
  const start = (hireDate && hireDate !== '—') ? new Date(hireDate) : new Date()
  const now = new Date()
  const payslips = []

  for (let i = 1; i <= 6; i += 1) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
    if (monthDate < new Date(start.getFullYear(), start.getMonth(), 1)) break
    payslips.push({
      month: monthDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
      gross,
      deductions,
      net,
      status: 'Paid',
    })
  }

  return { gross, pf, professionalTax, tds, deductions, net, payslips }
}

// ─── Main Component ───────────────────────────────────────────────────────────
const EmployeeProfilePage = memo(() => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { session } = useAuth()

  const canWriteEmployees = useMemo(() => {
    const roleLower = (session?.role || session?.user?.role || session?.user?.user_type || '').toLowerCase();
    if (roleLower.includes('admin') && !roleLower.includes('hr_admin')) return true; // System admins override
    if (roleLower === 'tenant_admin') return true;
    return session?.user?.userModules?.employees?.write === true;
  }, [session]);

  const [activeTab, setActiveTab] = useState('overview')
  const [noteText, setNoteText] = useState('')
  const [notes, setNotes] = useState([])
  const [documents, setDocuments] = useState([])
  const [attendanceLogs, setAttendanceLogs] = useState([])
  const [emp, setEmp] = useState(null)
  const [rawEmp, setRawEmp] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [previewDoc, setPreviewDoc] = useState(null)
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [showDocumentPicker, setShowDocumentPicker] = useState(false)
  const [isDeactivating, setIsDeactivating] = useState(false)

  const fetchEmployeeDetails = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const targetId = id || 'me'
      const data = await employeeService.getEmployee(targetId)
      setRawEmp(data)
      
      const employeeUuid = data.id
      let fetchedNotes = []
      let fetchedDocs = []
      let fetchedAttendance = []
      try {
        fetchedNotes = await employeeService.getEmployeeNotes(employeeUuid)
      } catch (e) {
        console.error("Failed to load notes", e)
      }
      try {
        fetchedDocs = await employeeService.getEmployeeDocuments(employeeUuid)
      } catch (e) {
        console.error("Failed to load documents", e)
      }
      try {
        const todayStr = new Date().toISOString().split('T')[0]
        const thirtyDaysAgoStr = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        fetchedAttendance = await employeeService.getEmployeeAttendanceLogs(employeeUuid, thirtyDaysAgoStr, todayStr)
      } catch (e) {
        console.error("Failed to load attendance logs", e)
      }

      setNotes(fetchedNotes.map(n => ({
        id: n.id,
        author: 'HR Admin',
        text: n.note_text,
        date: new Date(n.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        type: n.is_private ? 'exit' : 'note'
      })))

      setDocuments(fetchedDocs.map(d => ({
        id: d.id,
        docId: getDocId(d),
        type: ((d.file_name || '').split('.').pop() || d.document_type || 'FILE').toUpperCase(),
        name: d.file_name || 'Document',
        size: d.file_url ? `${Math.ceil((d.file_url.length * 0.75) / 1024)} KB` : 'Stored',
        date: new Date(d.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        url: d.file_url,
        documentType: d.document_type || 'other',
      })))

      setAttendanceLogs(fetchedAttendance)
      let custom = {}
      if (typeof data.custom_fields_json === 'string') {
        try {
          custom = JSON.parse(data.custom_fields_json || '{}')
        } catch (e) {
          custom = {}
        }
      } else {
        custom = data.custom_fields_json || {}
      }
      const salary = Number(custom.salary) || 0
      const payroll = buildPayroll(salary, data.hire_date)
      
      // Normalize employee details to match UI expectations
      const normalized = {
        id: data.employee_number || data.id,
        objectId: data.id,
        fullName: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
        email: data.email_work || data.email || '—',
        phone: data.phone_work || data.phone || '—',
        department: data.department_name || '—',
        role: data.job_title || '—',
        status: (() => {
          const rawStatus = (data.employment_status || '').toLowerCase();
          if (rawStatus === 'active') return 'Active';
          if (rawStatus === 'probation') return 'Probation';
          if (rawStatus === 'terminated' || rawStatus === 'inactive') return 'Inactive';
          if (rawStatus === 'pending_start') return 'Pending Start';
          return data.employment_status || 'Active';
        })(),
        joinDate: data.hire_date || '—',
        location: data.region || '—',
        manager: data.manager_name || '—',
        avatar: (data.first_name?.[0] || 'U') + (data.last_name?.[0] || ''),
        avatarColor: 'bg-blue-500',
        gender: data.gender || '—',
        employmentType: data.employment_type || '—',
        department_id: data.department_id || '',
        job_title_id: data.job_title_id || '',
        manager_id: data.manager_id || '',
        // Mock fallback fields for attendance/leave/payroll details
        leaveBalance: { casual: 8, earned: 12, sick: 5, maternity: 0 },
        leaveHistory: [],
        salary,
        payroll,
        bankAccount: custom.bank_account || '—',
        bankName: custom.bank_name || '—',
        ifsc: custom.ifsc || '—',
        payslips: payroll.payslips,
      }
      setEmp(normalized)
    } catch (err) {
      console.error('Failed to fetch employee details:', err)
      setError(err.message || 'Failed to load employee details')
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchEmployeeDetails()
  }, [fetchEmployeeDetails])

  const addNote = useCallback(async () => {
    if (!noteText.trim() || !rawEmp?.id) return
    setIsAddingNote(true)
    try {
      const newNote = await employeeService.addEmployeeNote(rawEmp.id, {
        note_text: noteText,
        is_private: false
      })
      setNotes(p => [
        {
          id: newNote.id,
          author: 'You',
          text: newNote.note_text,
          date: new Date(newNote.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          type: newNote.is_private ? 'exit' : 'note'
        },
        ...p
      ])
      setNoteText('')
    } catch (err) {
      console.error("Failed to add note", err)
      alert("Failed to add note: " + err.message)
    } finally {
      setIsAddingNote(false)
    }
  }, [noteText, id, rawEmp])

  const handleUploadDocument = useCallback((docConfig = null) => {
    if (!rawEmp?.id) return
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '*/*'
    input.onchange = async (e) => {
      const file = e.target.files[0]
      if (!file) return
      try {
        const fileUrl = await fileToDataUrl(file)
        const labelPrefix = docConfig?.label ? `${docConfig.label} - ` : ''
        
        await employeeService.addEmployeeDocument(rawEmp.id, {
          document_type: docConfig?.documentType || 'other',
          file_url: fileUrl,
          file_name: `${labelPrefix}${file.name}`
        })
        
        setShowDocumentPicker(false)
        await fetchEmployeeDetails()
      } catch (err) {
        console.error("Failed to upload document", err)
        alert("Failed to upload document: " + err.message)
      }
    }
    input.click()
  }, [id, fetchEmployeeDetails, rawEmp])

  const handleDeactivateEmployee = useCallback(async () => {
    if (!emp || isDeactivating) return

    const confirmed = window.confirm(`Deactivate ${emp.fullName}? This will mark the employee as terminated.`)
    if (!confirmed) return

    setIsDeactivating(true)
    try {
      await employeeService.deactivateEmployee(rawEmp?.id)
      await fetchEmployeeDetails()
      alert('Employee deactivated successfully.')
    } catch (err) {
      console.error('Failed to deactivate employee:', err)
      alert(`Failed to deactivate employee: ${err.message}`)
    } finally {
      setIsDeactivating(false)
    }
  }, [emp, rawEmp, id, fetchEmployeeDetails, isDeactivating])

  // Generate attendance calendar data dynamically based on backend logs
  const calendarDays = useMemo(() => {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const year = todayStart.getFullYear()
    const month = todayStart.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    return Array.from({ length: daysInMonth }, (_, i) => {
      const dayNum = i + 1
      const dow = new Date(year, month, dayNum).getDay()
      const isWeekend = dow === 0 || dow === 6
      
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
      
      const log = attendanceLogs.find(l => {
        let logDate = null
        if (l.date) {
          logDate = typeof l.date === 'string' ? l.date.split('T')[0] : new Date(l.date).toISOString().split('T')[0]
        } else if (l.check_in_at) {
          logDate = typeof l.check_in_at === 'string' ? l.check_in_at.split('T')[0] : new Date(l.check_in_at).toISOString().split('T')[0]
        }
        return logDate === dateStr
      })
      
      let type = null
      if (log) {
        const status = (log.status || '').toLowerCase()
        if (status === 'absent') type = 'absent'
        else if (status === 'on_leave' || status === 'leave') type = 'leave'
        else type = 'present'
      } else if (isWeekend) {
        type = 'weekend'
      } else if (new Date(year, month, dayNum) < todayStart) {
        type = 'absent'
      }
      return { day: dayNum, type }
    })
  }, [attendanceLogs])

  const presentCount = useMemo(() => calendarDays.filter(d => d.type === 'present').length, [calendarDays])
  const absentCount = useMemo(() => calendarDays.filter(d => d.type === 'absent').length, [calendarDays])
  const leaveCount = useMemo(() => calendarDays.filter(d => d.type === 'leave').length, [calendarDays])

  const calendarOffset = useMemo(() => {
    const now = new Date()
    const firstDayIndex = new Date(now.getFullYear(), now.getMonth(), 1).getDay()
    return (firstDayIndex + 6) % 7
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F7F8FA]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-2 text-sm text-slate-500">Loading employee profile...</p>
        </div>
      </div>
    )
  }

  if (error || !emp) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F7F8FA] p-6">
        <div className="text-center max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-red-500 font-semibold mb-2">Error Loading Profile</div>
          <p className="text-sm text-slate-500 mb-4">{error || 'Employee not found'}</p>
          <button onClick={() => navigate('/employees')} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            Back to Employees
          </button>
        </div>
      </div>
    )
  }

  const allNotes = [...notes, ...(emp.notes || [])]

  return (
    <div className="min-h-full bg-[#F7F8FA] p-6">
      <div className="mx-auto max-w-300 space-y-6">

        {/* Back */}
        {id && (
          <button onClick={() => navigate('/employees')} className="flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-800">
            <ArrowLeft className="h-4 w-4" /> Back to Employees
          </button>
        )}

        {/* ── Profile Header ──────────────────────────────────────── */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start gap-6">
            {/* Avatar */}
            <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-white ${emp.avatarColor}`}>
              {emp.avatar}
            </div>
            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-bold text-slate-900">{emp.fullName}</h2>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(emp.status)}`}>
                  <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                    emp.status === 'Active' ? 'bg-green-500' :
                    emp.status === 'Probation' ? 'bg-amber-500' :
                    emp.status === 'Pending Start' ? 'bg-blue-500' :
                    'bg-slate-400'
                  }`} />
                  {emp.status}
                </span>
              </div>
              <p className="mt-1 text-slate-600">{emp.role} · {emp.department}</p>
              <div className="mt-3 flex flex-wrap gap-4">
                <span className="flex items-center gap-1.5 text-sm text-slate-500"><Mail className="h-4 w-4" /> {emp.email}</span>
                <span className="flex items-center gap-1.5 text-sm text-slate-500"><Phone className="h-4 w-4" /> {emp.phone}</span>
                <span className="flex items-center gap-1.5 text-sm text-slate-500"><MapPin className="h-4 w-4" /> {emp.location}</span>
                <span className="flex items-center gap-1.5 text-sm text-slate-500"><Calendar className="h-4 w-4" /> Joined {formatDate(emp.joinDate, 'long')}</span>
              </div>
            </div>
            {/* Actions */}
            {canWriteEmployees && (
              <div className="flex gap-2">
                <button onClick={() => setShowEditModal(true)} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
                  <Pencil className="h-4 w-4 text-indigo-500" /> Edit
                </button>
                <button
                  onClick={handleDeactivateEmployee}
                  disabled={isDeactivating || emp.status === 'terminated'}
                  className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isDeactivating ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                  ) : (
                    <UserMinus className="h-4 w-4" />
                  )}
                  {emp.status === 'terminated' ? 'Deactivated' : isDeactivating ? 'Deactivating...' : 'Deactivate'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Tabs ──────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex overflow-x-auto border-b border-slate-200">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-5 py-3.5 text-sm font-medium transition ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>

                {/* ── Overview ──────────────────────── */}
                {activeTab === 'overview' && (
                  <div className="grid gap-5 lg:grid-cols-2">
                    <InfoCard title="Personal Information" icon={User}>
                      <InfoRow label="Full Name" value={emp.fullName} />
                      <InfoRow label="Gender" value={emp.gender} />
                      <InfoRow label="Employee ID" value={emp.id} />
                      <InfoRow label="Employment Type" value={emp.employmentType} />
                    </InfoCard>
                    <InfoCard title="Contact Information" icon={Mail}>
                      <InfoRow label="Email" value={emp.email} />
                      <InfoRow label="Phone" value={emp.phone} />
                      <InfoRow label="Location" value={emp.location} />
                    </InfoCard>
                  </div>
                )}

                {/* ── Job Info ──────────────────────── */}
                {activeTab === 'job' && (
                  <div className="grid gap-5 lg:grid-cols-2">
                    <InfoCard title="Job Details" icon={Briefcase}>
                      <InfoRow label="Department" value={emp.department} />
                      <InfoRow label="Role / Designation" value={emp.role} />
                      <InfoRow label="Reports To" value={emp.manager} />
                      <InfoRow label="Joining Date" value={formatDate(emp.joinDate, 'long')} />
                      <InfoRow label="Employment Type" value={emp.employmentType} />
                    </InfoCard>
                    <InfoCard title="Organisation" icon={Building2}>
                      <InfoRow label="Company" value="WorkMatrix India Pvt. Ltd." />
                      <InfoRow label="Office Location" value={emp.location} />
                      <InfoRow label="Work Mode" value={emp.location === 'Remote' ? 'Remote' : 'On-site'} />
                      <InfoRow label="Status" value={emp.status} />
                    </InfoCard>
                  </div>
                )}

                {/* ── Attendance ────────────────────── */}
                {activeTab === 'attendance' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: 'Present', value: presentCount, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
                        { label: 'Absent', value: absentCount, icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
                        { label: 'On Leave', value: leaveCount, icon: Clock3, color: 'text-blue-500', bg: 'bg-blue-50' },
                      ].map(s => (
                        <div key={s.label} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${s.bg}`}><s.icon className={`h-5 w-5 ${s.color}`} /></div>
                          <div><div className="text-2xl font-bold text-slate-900">{s.value}</div><div className="text-xs text-slate-500">{s.label}</div></div>
                        </div>
                      ))}
                    </div>
                    <InfoCard title={`${new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })} — Attendance Calendar`} icon={Calendar}>
                      <div className="mb-3 flex gap-4 text-xs">
                        {[['bg-green-500', 'Present'], ['bg-red-400', 'Absent'], ['bg-blue-400', 'Leave'], ['bg-slate-100', 'Weekend']].map(([c, l]) => (
                          <span key={l} className="flex items-center gap-1.5"><span className={`h-2.5 w-2.5 rounded-sm ${c}`} />{l}</span>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1.5">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                          <div key={d} className="text-center text-xs font-semibold text-slate-400 py-1">{d}</div>
                        ))}
                        {/* Monthly Dynamic Offset */}
                        {[...Array(calendarOffset)].map((_, i) => <div key={`empty-${i}`} />)}
                        {calendarDays.map((d, i) => (
                          <div key={i} className="flex justify-center"><CalendarCell day={d.day} type={d.type} /></div>
                        ))}
                      </div>
                    </InfoCard>
                  </div>
                )}

                {/* ── Leave ─────────────────────────── */}
                {activeTab === 'leave' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                      {Object.entries(emp.leaveBalance).map(([type, days]) => {
                        const labels = { casual: 'Casual Leave', earned: 'Earned Leave', sick: 'Sick Leave', maternity: 'Maternity' }
                        const colors = { casual: 'text-blue-600 bg-blue-50', earned: 'text-purple-600 bg-purple-50', sick: 'text-rose-600 bg-rose-50', maternity: 'text-pink-600 bg-pink-50' }
                        return (
                          <div key={type} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-center">
                            <div className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl ${colors[type]?.split(' ')[1] || 'bg-slate-50'}`}>
                              <span className={`text-lg font-bold ${colors[type]?.split(' ')[0] || 'text-slate-600'}`}>{days}</span>
                            </div>
                            <div className="text-sm font-semibold text-slate-700">{labels[type]}</div>
                            <div className="mt-0.5 text-xs text-slate-400">days remaining</div>
                          </div>
                        )
                      })}
                    </div>
                    <InfoCard title="Leave History" icon={Calendar}>
                      {emp.leaveHistory.length === 0 ? (
                        <p className="py-6 text-center text-sm text-slate-400">No leave history available</p>
                      ) : (
                        <table className="w-full text-sm">
                          <thead><tr className="border-b border-slate-100">
                            {['Type', 'From', 'To', 'Days', 'Reason', 'Status'].map(h => (
                              <th key={h} className="py-2.5 text-left text-xs font-semibold uppercase text-slate-400">{h}</th>
                            ))}
                          </tr></thead>
                          <tbody className="divide-y divide-slate-50">
                            {emp.leaveHistory.map(l => (
                              <tr key={l.id}>
                                <td className="py-2.5 font-medium text-slate-700">{l.type}</td>
                                <td className="py-2.5 text-slate-600">{l.from}</td>
                                <td className="py-2.5 text-slate-600">{l.to}</td>
                                <td className="py-2.5 text-slate-600">{l.days}</td>
                                <td className="py-2.5 text-slate-500">{l.reason}</td>
                                <td className="py-2.5"><LeaveStatusBadge status={l.status} /></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </InfoCard>
                  </div>
                )}

                {/* ── Payroll ───────────────────────── */}
                {activeTab === 'payroll' && (
                  <div className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                      <InfoCard title="Salary Breakdown" icon={Banknote}>
                        <div className="space-y-3">
                          {[
                            { label: 'Gross Salary', value: emp.payroll.gross, color: 'text-slate-900' },
                            { label: 'PF Deduction (12%)', value: emp.payroll.pf * -1, color: 'text-red-600' },
                            { label: 'Professional Tax', value: emp.payroll.professionalTax * -1, color: 'text-red-600' },
                            { label: 'TDS (approx.)', value: emp.payroll.tds * -1, color: 'text-red-600' },
                          ].map(r => (
                            <div key={r.label} className="flex items-center justify-between border-b border-slate-50 pb-2.5 last:border-0">
                              <span className="text-sm text-slate-600">{r.label}</span>
                              <span className={`font-semibold ${r.color}`}>
                                {r.value < 0 ? '-' : ''}{formatINR(Math.abs(r.value))}
                              </span>
                            </div>
                          ))}
                          <div className="flex items-center justify-between rounded-xl bg-green-50 px-4 py-3">
                            <span className="font-semibold text-slate-700">Net Take-Home</span>
                            <span className="text-lg font-bold text-green-600">{formatINR(emp.payroll.net)}</span>
                          </div>
                        </div>
                      </InfoCard>

                      <InfoCard title="Bank Account Details" icon={Briefcase}>
                        <div className="space-y-4">
                          <InfoRow label="Bank Name" value={emp.bankName} />
                          <InfoRow label="Account Number" value={emp.bankAccount} />
                          <InfoRow label="IFSC Code" value={emp.ifsc} />
                        </div>
                      </InfoCard>
                    </div>

                    <InfoCard title="Payslip History" icon={FileText}>
                      {emp.payslips.length === 0 ? (
                        <p className="py-6 text-center text-sm text-slate-400">No payslips available</p>
                      ) : (
                        <table className="w-full text-sm">
                          <thead><tr className="border-b border-slate-100">
                            {['Month', 'Gross', 'Deductions', 'Net Pay', 'Status', ''].map(h => (
                              <th key={h} className="py-2.5 text-left text-xs font-semibold uppercase text-slate-400">{h}</th>
                            ))}
                          </tr></thead>
                          <tbody className="divide-y divide-slate-50">
                            {emp.payslips.map((p, i) => (
                              <tr key={i}>
                                <td className="py-2.5 font-medium text-slate-800">{p.month}</td>
                                <td className="py-2.5 text-slate-600">{formatINR(p.gross)}</td>
                                <td className="py-2.5 text-red-600">-{formatINR(p.deductions)}</td>
                                <td className="py-2.5 font-semibold text-green-700">{formatINR(p.net)}</td>
                                <td className="py-2.5"><span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">{p.status}</span></td>
                                <td className="py-2.5"><button className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"><Download className="h-3.5 w-3.5" /> PDF</button></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </InfoCard>
                  </div>
                )}

                {/* ── Documents ─────────────────────── */}
                {activeTab === 'documents' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-500">{documents.length} document{documents.length !== 1 ? 's' : ''} on file</p>
                    </div>

                    {showDocumentPicker && (
                      <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-semibold text-slate-800">Select document type</h4>
                            <p className="text-xs text-slate-500">Upload will save to backend and appear in the matching card.</p>
                          </div>
                          <button onClick={() => setShowDocumentPicker(false)} className="rounded-lg p-2 text-slate-500 transition hover:bg-white">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                          {DOC_TYPES.map(docType => (
                            <button
                              key={docType.id}
                              onClick={() => handleUploadDocument(docType)}
                              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-600"
                            >
                              {docType.label}
                              <Upload className="h-3.5 w-3.5" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                      {DOC_TYPES.map(docType => {
                        const file = documents.find(doc => doc.docId === docType.id)
                        return (
                          <div key={docType.id} className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-slate-300">
                            <div className="mb-3 flex items-center justify-between">
                              <span className="font-semibold text-slate-800">
                                {docType.label} {docType.required && <span className="text-red-500">*</span>}
                              </span>
                              {file ? (
                                <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-emerald-500 bg-emerald-50">
                                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                </div>
                              ) : (
                                <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-red-300 bg-red-50">
                                  <span className="text-xs font-semibold text-red-500">!</span>
                                </div>
                              )}
                            </div>

                            <div className="mt-2 flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50 p-2.5">
                              <div className="min-w-0">
                                {file ? (
                                  <>
                                    <p className="truncate text-xs font-semibold text-slate-700">{file.name}</p>
                                    <p className="mt-0.5 text-[10px] text-slate-400">{file.size} · Uploaded {file.date}</p>
                                  </>
                                ) : (
                                  <p className="text-xs font-medium italic text-slate-400">No document uploaded</p>
                                )}
                              </div>

                              <div className="flex shrink-0 items-center gap-1.5">
                                {file ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => setPreviewDoc(file)}
                                      className="flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
                                    >
                                      <Eye className="h-3.5 w-3.5" /> Preview
                                    </button>
                                    <button
                                      onClick={() => {
                                        const link = document.createElement('a')
                                        link.href = file.url
                                        link.download = file.name
                                        document.body.appendChild(link)
                                        link.click()
                                        document.body.removeChild(link)
                                      }}
                                      className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                                      title="Download"
                                    >
                                      <Download className="h-4 w-4" />
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => handleUploadDocument(docType)}
                                    className="flex items-center gap-1 rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-600"
                                  >
                                    <Upload className="h-3 w-3" /> Upload
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                  </div>
                )}

                {/* ── Notes ─────────────────────────── */}
                {activeTab === 'notes' && (
                  <div className="space-y-5">
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">HR</div>
                      <div className="flex-1">
                        <textarea
                          value={noteText}
                          onChange={e => setNoteText(e.target.value)}
                          placeholder="Add a note about this employee…"
                          rows={3}
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
                        />
                        <div className="mt-2 flex justify-end">
                          <button onClick={addNote} disabled={!noteText.trim() || isAddingNote} className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-40">
                            <Plus className="h-4 w-4" /> {isAddingNote ? 'Saving...' : 'Add Note'}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {allNotes.length === 0 ? (
                        <p className="py-8 text-center text-sm text-slate-400">No notes yet. Add the first one above.</p>
                      ) : (
                        allNotes.map(note => {
                          const typeColors = { performance: 'bg-blue-50 border-blue-200', achievement: 'bg-green-50 border-green-200', promotion: 'bg-purple-50 border-purple-200', exit: 'bg-red-50 border-red-200', note: 'bg-slate-50 border-slate-200' }
                          return (
                            <div key={note.id} className={`rounded-2xl border p-4 ${typeColors[note.type] || typeColors.note}`}>
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white shadow-sm text-xs font-bold text-slate-600">
                                    {note.author.slice(0, 1)}
                                  </div>
                                  <span className="text-sm font-semibold text-slate-800">{note.author}</span>
                                  {note.type !== 'note' && (
                                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-600 shadow-sm capitalize">{note.type}</span>
                                  )}
                                </div>
                                <span className="shrink-0 text-xs text-slate-400">{note.date}</span>
                              </div>
                              <p className="mt-2 text-sm text-slate-700 leading-relaxed">{note.text}</p>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Edit Employee Modal ──────────────────────────────────── */}
      <EditEmployeeModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        employee={rawEmp}
        onSuccess={() => {
          fetchEmployeeDetails()
          alert('Employee details updated successfully!')
        }}
      />

      {previewDoc && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm">
          <div className="flex h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-900">{previewDoc.name}</h4>
                <p className="text-xs text-slate-500">{previewDoc.type} · {previewDoc.size} · Uploaded {previewDoc.date}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = previewDoc.url
                    link.download = previewDoc.name
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                  }}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
                >
                  <Download className="h-3.5 w-3.5" /> Download
                </button>
                <button onClick={() => setPreviewDoc(null)} className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 bg-slate-50">
              <DocumentPreview doc={previewDoc} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

EmployeeProfilePage.displayName = 'EmployeeProfilePage'
export default EmployeeProfilePage
