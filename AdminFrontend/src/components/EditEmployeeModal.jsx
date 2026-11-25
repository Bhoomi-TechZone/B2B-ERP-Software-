import { useState, useCallback, memo, useEffect } from 'react'
import employeeService from '../services/employeeService'
import { useDepartments } from '../hooks/useDepartments'
import { useJobTitles } from '../hooks/useJobTitles'
import { motion, AnimatePresence } from 'motion/react'
import {
  User, Briefcase, Banknote, FileText, ClipboardCheck,
  ChevronLeft, ChevronRight, Check, Upload, X,
  AlertCircle, Calendar, Save
} from 'lucide-react'

// ─── Step Config ─────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Basic Info', icon: User },
  { id: 2, label: 'Job Info', icon: Briefcase },
  { id: 3, label: 'Compensation', icon: Banknote },
  { id: 4, label: 'Documents', icon: FileText },
  { id: 5, label: 'Review', icon: ClipboardCheck },
]

const EMPLOYMENT_TYPES = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'intern', label: 'Intern' },
  { value: 'temporary', label: 'Temporary' }
]

// ─── Reusable Field ──────────────────────────────────────────────────────────
const Field = memo(({ label, required, error, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-slate-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && (
      <span className="flex items-center gap-1 text-xs text-red-500">
        <AlertCircle className="h-3 w-3" /> {error}
      </span>
    )}
  </div>
))
Field.displayName = 'Field'

const inputCls = (error) =>
  `w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-blue-500/20 ${
    error ? 'border-red-400 bg-red-50 focus:border-red-400' : 'border-slate-200 bg-white focus:border-blue-500'
  }`

// ─── Stepper ────────────────────────────────────────────────────────────────
const Stepper = memo(({ current }) => (
  <div className="flex items-center">
    {STEPS.map((step, idx) => {
      const done = current > step.id
      const active = current === step.id
      return (
        <div key={step.id} className="flex flex-1 items-center">
          <div className="flex flex-col items-center gap-1.5">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
              done ? 'border-blue-600 bg-blue-600 text-white' :
              active ? 'border-blue-600 bg-white text-blue-600' :
              'border-slate-200 bg-white text-slate-400'
            }`}>
              {done ? <Check className="h-5 w-5" /> : <step.icon className="h-4 w-4" />}
            </div>
            <span className={`hidden text-xs font-medium sm:block ${active ? 'text-blue-600' : done ? 'text-slate-700' : 'text-slate-400'}`}>
              {step.label}
            </span>
          </div>
          {idx < STEPS.length - 1 && (
            <div className={`mx-2 h-0.5 flex-1 transition-all ${done ? 'bg-blue-600' : 'bg-slate-200'}`} />
          )}
        </div>
      )
    })}
  </div>
))
Stepper.displayName = 'Stepper'

// ─── Review Card ────────────────────────────────────────────────────────────
const ReviewSection = memo(({ title, icon: Icon, items }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="mb-4 flex items-center gap-2">
      <Icon className="h-5 w-5 text-blue-500" />
      <h4 className="font-semibold text-slate-800">{title}</h4>
    </div>
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map(({ label, value }) => (
        <div key={label}>
          <div className="text-xs font-medium text-slate-400">{label}</div>
          <div className="mt-0.5 text-sm font-medium text-slate-800">{value || <span className="text-slate-300">—</span>}</div>
        </div>
      ))}
    </div>
  </div>
))
ReviewSection.displayName = 'ReviewSection'

// ─── Main Modal Component ────────────────────────────────────────────────────
const EditEmployeeModal = memo(({ isOpen, onClose, employee, onSuccess }) => {
  const { departments, loading: departmentsLoading } = useDepartments()
  const { jobTitles, loading: jobTitlesLoading, refetch: refetchJobTitles } = useJobTitles()
  
  const [managersList, setManagersList] = useState([])
  const [managersLoading, setManagersLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState({})
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    preferredName: '',
    pronouns: '',
    email: '',
    emailPersonal: '',
    phone: '',
    phonePersonal: '',
    dateOfBirth: '',
    gender: 'male',
    nationality: 'IN',
    countryOfResidence: 'IN',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    department: '',
    role: '',
    manager: '',
    workLocation: '',
    joinDate: '',
    employmentType: 'full_time',
    employmentStatus: 'active',
    noticePeriodDays: 30,
    region: 'India',
    timezone: 'Asia/Kolkata',
    salary: '',
    payType: 'Monthly',
    bankAccount: '',
    ifsc: '',
    bankName: ''
  })

  // Load managers list
  useEffect(() => {
    let isMounted = true
    const fetchManagers = async () => {
      try {
        setManagersLoading(true)
        const res = await employeeService.getEmployees(1, 1000)
        if (!isMounted) return
        
        const employeeList = Array.isArray(res) ? res : (res?.employees || res?.data || res?.items || [])
        const allowedRoles = ['admin', 'manager', 'hr_admin', 'tl']
        
        const valid = employeeList.filter(emp => {
          if (employee && emp.id === employee.id) return false
          const roleStr = (emp.system_role || emp.role || emp.job_title || '').toLowerCase()
          return allowedRoles.some(r => roleStr.includes(r)) || allowedRoles.includes(emp.system_role)
        }).map(emp => ({
          id: emp.id || emp.employee_id,
          name: `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || emp.name || emp.email,
          role: emp.system_role || emp.role || emp.job_title || 'Manager'
        }))
        
        setManagersList(valid)
      } catch (err) {
        console.error('Failed to fetch managers:', err)
      } finally {
        if (isMounted) setManagersLoading(false)
      }
    }
    
    if (isOpen) {
      fetchManagers()
    }
    
    return () => { isMounted = false }
  }, [isOpen, employee])

  // Prepopulate form data & fetch documents
  useEffect(() => {
    if (isOpen && employee) {
      // Parse custom_fields_json if it's a string
      let custom = {}
      if (typeof employee.custom_fields_json === 'string') {
        try {
          custom = JSON.parse(employee.custom_fields_json)
        } catch (e) {
          console.error('Failed to parse custom_fields_json:', e)
          custom = {}
        }
      } else {
        custom = employee.custom_fields_json || {}
      }
      
      // Parse address_json if it's a string
      let address = {}
      if (typeof employee.address_json === 'string') {
        try {
          address = JSON.parse(employee.address_json)
        } catch (e) {
          console.error('Failed to parse address_json:', e)
          address = {}
        }
      } else {
        address = employee.address_json || {}
      }
      
      setForm({
        firstName: employee.first_name || '',
        lastName: employee.last_name || '',
        preferredName: employee.preferred_name || employee.first_name || '',
        pronouns: employee.pronouns || '',
        email: employee.email_work || employee.email || '',
        emailPersonal: employee.email_personal || '',
        phone: employee.phone_work || employee.phone || '',
        phonePersonal: employee.phone_personal || '',
        dateOfBirth: employee.date_of_birth ? employee.date_of_birth.substring(0, 10) : '',
        gender: employee.gender || 'male',
        nationality: employee.nationality || 'IN',
        countryOfResidence: employee.country_of_residence || 'IN',
        
        addressLine1: address.line1 || '',
        addressLine2: address.line2 || '',
        city: address.city || '',
        state: address.state || '',
        postalCode: address.postal_code || '',
        country: address.country || 'India',

        department: employee.department_id || '',
        role: employee.job_title_id || '',
        manager: employee.manager_id || '',
        workLocation: employee.work_location_id || '',
        joinDate: employee.hire_date ? employee.hire_date.substring(0, 10) : '',
        employmentType: employee.employment_type || 'full_time',
        employmentStatus: employee.employment_status || 'active',
        noticePeriodDays: employee.notice_period_days || 30,
        region: employee.region || 'India',
        timezone: employee.timezone || 'Asia/Kolkata',

        salary: custom.salary || '',
        payType: custom.pay_type || 'Monthly',
        bankAccount: custom.bank_account || '',
        ifsc: custom.ifsc || '',
        bankName: custom.bank_name || ''
      })

      const fetchDocs = async () => {
        try {
          const res = await employeeService.getEmployeeDocuments(employee.id)
          const docs = Array.isArray(res) ? res : []
          const typeToId = {
            id_proof: 'aadhar',
            contract: 'rental',
            passport: 'passport',
            certificate: 'police',
            other: 'photo'
          }
          const loaded = docs.map(d => {
            let docId = 'other'
            if (d.document_type === 'id_proof') {
              const nameLower = (d.file_name || '').toLowerCase()
              if (nameLower.includes('pan')) docId = 'pan'
              else if (nameLower.includes('aadhar')) docId = 'aadhar'
              else docId = 'address_proof'
            } else {
              docId = typeToId[d.document_type] || 'other'
            }
            return {
              docId,
              name: d.file_name || 'Uploaded File',
              size: 'Existing',
              type: (d.file_name || '').split('.').pop().toUpperCase() || 'PDF',
              fileUrlBase64: d.file_url,
              isExisting: true
            }
          })
          setUploadedFiles(loaded)
        } catch (e) {
          console.error("Failed to load documents:", e)
        }
      }
      fetchDocs()
      setStep(1)
      setErrors({})
      setApiError('')
    }
  }, [isOpen, employee])

  const set = useCallback((field, val) => {
    setForm(p => ({ ...p, [field]: val }))
    setErrors(p => { const n = { ...p }; delete n[field]; return n })
    if (apiError) setApiError('')
  }, [apiError])

  const validate = useCallback(() => {
    const e = {}
    if (step === 1) {
      if (!form.firstName.trim()) e.firstName = 'First name is required'
      if (!form.lastName.trim()) e.lastName = 'Last name is required'
      if (!form.email.trim()) e.email = 'Work email is required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format'
      if (!form.phone.trim()) e.phone = 'Work phone is required'
      if (!form.dateOfBirth) e.dateOfBirth = 'Date of birth is required'
      if (!form.gender) e.gender = 'Please select gender'
    }
    if (step === 2) {
      if (!form.department) e.department = 'Department is required'
      if (!form.joinDate) e.joinDate = 'Hire date is required'
      if (!form.employmentType) e.employmentType = 'Employment type is required'
      if (!form.employmentStatus) e.employmentStatus = 'Employment status is required'
    }
    if (step === 3) {
      if (!form.salary) e.salary = 'Salary is required'
      else if (isNaN(Number(form.salary))) e.salary = 'Must be a number'
      if (!form.bankAccount.trim()) e.bankAccount = 'Account number is required'
      if (!form.ifsc.trim()) e.ifsc = 'IFSC code is required'
      if (!form.bankName.trim()) e.bankName = 'Bank name is required'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }, [step, form])

  const next = useCallback(() => {
    if (validate()) setStep(s => Math.min(5, s + 1))
  }, [validate])

  const prev = useCallback(() => setStep(s => Math.max(1, s - 1)), [])

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true)
    setApiError('')

    try {
      const payload = {
        first_name: (form.firstName || '').trim(),
        last_name: (form.lastName || '').trim(),
        preferred_name: (form.preferredName || form.firstName || '').trim(),
        pronouns: (form.pronouns || '').trim(),
        email_work: (form.email || '').trim(),
        email_personal: (form.emailPersonal || '').trim(),
        phone_work: (form.phone || '').trim(),
        phone_personal: (form.phonePersonal || '').trim(),
        date_of_birth: form.dateOfBirth || '1990-01-01',
        gender: form.gender || 'male',
        nationality: form.nationality || 'IN',
        country_of_residence: form.countryOfResidence || 'IN',
        address_json: {
          line1: (form.addressLine1 || '').trim(),
          line2: (form.addressLine2 || '').trim(),
          city: (form.city || '').trim(),
          state: (form.state || '').trim(),
          postal_code: (form.postalCode || '').trim(),
          country: form.country || 'India'
        },
        employment_status: form.employmentStatus || 'active',
        employment_type: form.employmentType || 'full_time',
        hire_date: form.joinDate,
        notice_period_days: parseInt(form.noticePeriodDays) || 30,
        department_id: form.department,
        region: (form.region || 'India').trim(),
        timezone: form.timezone || 'Asia/Kolkata',
        custom_fields_json: {
          salary: parseFloat(form.salary) || 0,
          pay_type: form.payType || 'Monthly',
          bank_account: (form.bankAccount || '').trim(),
          ifsc: (form.ifsc || '').trim(),
          bank_name: (form.bankName || '').trim()
        }
      }

      if (form.role) payload.job_title_id = form.role
      if (form.manager) payload.manager_id = form.manager
      if (form.workLocation) payload.work_location_id = form.workLocation

      const result = await employeeService.updateEmployee(employee.id, payload)
      
      // Upload newly added files in Step 4
      const newFiles = uploadedFiles.filter(f => !f.isExisting)
      if (newFiles.length > 0) {
        const docTypeMap = {
          aadhar: 'id_proof',
          pan: 'id_proof',
          rental: 'contract',
          police: 'certificate',
          passport: 'passport',
          photo: 'other',
          address_proof: 'id_proof'
        }
        
        const docPromises = newFiles.map(async (doc) => {
          const apiDocType = docTypeMap[doc.docId] || 'other'
          if (!doc.fileUrlBase64) return
          try {
            await employeeService.addEmployeeDocument(employee.id, {
              document_type: apiDocType,
              file_url: doc.fileUrlBase64,
              file_name: doc.name
            })
          } catch (e) {
            console.error("Failed to upload document during edit:", e)
          }
        })
        await Promise.all(docPromises)
      }

      if (onSuccess) onSuccess(result)
      onClose()
    } catch (err) {
      console.error('❌ Update submission error:', err)
      setApiError(err.message || 'Failed to update employee details. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [form, uploadedFiles, employee, onSuccess, onClose])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-4xl rounded-3xl border border-slate-100 bg-white shadow-2xl overflow-hidden"
        >
          <div className="flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Edit Employee Details</h3>
                <p className="text-sm text-slate-500 mt-1">Step {step} of {STEPS.length} — {STEPS[step - 1].label}</p>
              </div>
              <button onClick={onClose} className="rounded-xl p-2 hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Scrollable Form Content */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1">
              {apiError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center gap-3 text-red-600 shadow-sm">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p className="text-sm font-medium">{apiError}</p>
                </div>
              )}

              {/* Stepper */}
              <Stepper current={step} />

              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* ── Step 1: Basic Info ── */}
                  {step === 1 && (
                    <div className="space-y-5">
                      <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-800"><User className="h-5 w-5 text-blue-500" /> Basic Information</h3>
                      
                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field label="First Name" required error={errors.firstName}>
                          <input value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="Rahul" className={inputCls(errors.firstName)} />
                        </Field>
                        <Field label="Last Name" required error={errors.lastName}>
                          <input value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Verma" className={inputCls(errors.lastName)} />
                        </Field>
                        <Field label="Preferred Name">
                          <input value={form.preferredName} onChange={e => set('preferredName', e.target.value)} placeholder="RV" className={inputCls(false)} />
                        </Field>
                        <Field label="Pronouns">
                          <input value={form.pronouns} onChange={e => set('pronouns', e.target.value)} placeholder="He/Him" className={inputCls(false)} />
                        </Field>
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field label="Work Email" required error={errors.email}>
                          <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="rahul.v@company.com" className={inputCls(errors.email)} />
                        </Field>
                        <Field label="Personal Email">
                          <input type="email" value={form.emailPersonal} onChange={e => set('emailPersonal', e.target.value)} placeholder="rahul.personal@gmail.com" className={inputCls(false)} />
                        </Field>
                        <Field label="Work Phone" required error={errors.phone}>
                          <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91-9876543210" className={inputCls(errors.phone)} />
                        </Field>
                        <Field label="Personal Phone">
                          <input type="tel" value={form.phonePersonal} onChange={e => set('phonePersonal', e.target.value)} placeholder="+91-9999988888" className={inputCls(false)} />
                        </Field>
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field label="Date of Birth" required error={errors.dateOfBirth}>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} className={`${inputCls(errors.dateOfBirth)} pl-9`} />
                          </div>
                        </Field>
                        <Field label="Gender" required error={errors.gender}>
                          <div className="flex gap-4 py-2">
                            {[
                              { value: 'male', label: 'Male' },
                              { value: 'female', label: 'Female' },
                              { value: 'other', label: 'Other' }
                            ].map(g => (
                              <label key={g.value} className="flex cursor-pointer items-center gap-2">
                                <input type="radio" name="gender" value={g.value} checked={form.gender === g.value} onChange={() => set('gender', g.value)} className="h-4 w-4 accent-blue-600" />
                                <span className="text-sm text-slate-700 font-medium">{g.label}</span>
                              </label>
                            ))}
                          </div>
                        </Field>
                      </div>

                      {/* Address Fields */}
                      <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <h4 className="text-sm font-semibold text-slate-700">Address Details</h4>
                        <div className="grid gap-4">
                          <Field label="Address Line 1">
                            <input value={form.addressLine1} onChange={e => set('addressLine1', e.target.value)} placeholder="123 Tech Park" className={inputCls(false)} />
                          </Field>
                          <Field label="Address Line 2">
                            <input value={form.addressLine2} onChange={e => set('addressLine2', e.target.value)} placeholder="Sector 62" className={inputCls(false)} />
                          </Field>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="City">
                              <input value={form.city} onChange={e => set('city', e.target.value)} placeholder="Noida" className={inputCls(false)} />
                            </Field>
                            <Field label="State">
                              <input value={form.state} onChange={e => set('state', e.target.value)} placeholder="UP" className={inputCls(false)} />
                            </Field>
                            <Field label="Postal Code">
                              <input value={form.postalCode} onChange={e => set('postalCode', e.target.value)} placeholder="201301" className={inputCls(false)} />
                            </Field>
                            <Field label="Country">
                              <input value={form.country} onChange={e => set('country', e.target.value)} placeholder="India" className={inputCls(false)} />
                            </Field>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Step 2: Job Info ── */}
                  {step === 2 && (
                    <div className="space-y-5">
                      <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-800"><Briefcase className="h-5 w-5 text-indigo-500" /> Job Information</h3>
                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field label="Department" required error={errors.department}>
                          <select value={form.department} onChange={e => set('department', e.target.value)} className={inputCls(errors.department)} disabled={departmentsLoading}>
                            <option value="">Select Department</option>
                            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                          </select>
                        </Field>
                        <Field label="Job Title / Role">
                          <select value={form.role} onChange={e => set('role', e.target.value)} className={inputCls(false)} disabled={jobTitlesLoading}>
                            <option value="">Select Job Title</option>
                            {jobTitles.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
                          </select>
                        </Field>
                        <Field label="Reporting Manager" error={errors.manager}>
                          <select value={form.manager} onChange={e => set('manager', e.target.value)} className={inputCls(false)} disabled={managersLoading}>
                            <option value="">No Manager (Top Level)</option>
                            {managersList.map(m => <option key={m.id} value={m.id}>{m.name} ({m.role})</option>)}
                          </select>
                        </Field>
                        <Field label="Joining Date" required error={errors.joinDate}>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input type="date" value={form.joinDate} onChange={e => set('joinDate', e.target.value)} className={`${inputCls(errors.joinDate)} pl-9`} />
                          </div>
                        </Field>
                        <Field label="Employment Type" required error={errors.employmentType}>
                          <select value={form.employmentType} onChange={e => set('employmentType', e.target.value)} className={inputCls(errors.employmentType)}>
                            {EMPLOYMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                          </select>
                        </Field>
                        <Field label="Employment Status" required error={errors.employmentStatus}>
                          <select value={form.employmentStatus} onChange={e => set('employmentStatus', e.target.value)} className={inputCls(errors.employmentStatus)}>
                            <option value="active">Active</option>
                            <option value="probation">Probation</option>
                            <option value="notice_period">Notice Period</option>
                            <option value="suspended">Suspended</option>
                            <option value="terminated">Terminated</option>
                          </select>
                        </Field>
                      </div>
                    </div>
                  )}

                  {/* ── Step 3: Compensation & Banking ── */}
                  {step === 3 && (
                    <div className="space-y-5">
                      <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-800"><Banknote className="h-5 w-5 text-emerald-500" /> Compensation & Bank details</h3>
                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field label="Monthly Salary (Gross INR)" required error={errors.salary}>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">₹</span>
                            <input type="number" value={form.salary} onChange={e => set('salary', e.target.value)} placeholder="85000" className={`${inputCls(errors.salary)} pl-8`} />
                          </div>
                        </Field>
                        <Field label="Pay Type">
                          <div className="flex overflow-hidden rounded-xl border border-slate-200">
                            {['Monthly', 'Hourly'].map(t => (
                              <button key={t} type="button" onClick={() => set('payType', t)}
                                className={`flex-1 py-2.5 text-sm font-medium transition ${form.payType === t ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
                                {t}
                              </button>
                            ))}
                          </div>
                        </Field>
                      </div>
                      
                      <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4 mt-4">
                        <h4 className="text-sm font-semibold text-slate-700">Bank Details</h4>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Field label="Bank Name" required error={errors.bankName}>
                            <input value={form.bankName} onChange={e => set('bankName', e.target.value)} placeholder="HDFC Bank" className={inputCls(errors.bankName)} />
                          </Field>
                          <Field label="Account Number" required error={errors.bankAccount}>
                            <input value={form.bankAccount} onChange={e => set('bankAccount', e.target.value)} placeholder="50100..." className={inputCls(errors.bankAccount)} />
                          </Field>
                          <Field label="IFSC Code" required error={errors.ifsc}>
                            <input value={form.ifsc} onChange={e => set('ifsc', e.target.value.toUpperCase())} placeholder="HDFC000123" className={inputCls(errors.ifsc)} maxLength={11} />
                          </Field>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Step 4: Documents ── */}
                  {step === 4 && (
                    <div className="space-y-5">
                      <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-800"><FileText className="h-5 w-5 text-purple-500" /> Document Upload</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {[
                          { id: 'aadhar', label: 'Aadhar Card', required: true },
                          { id: 'pan', label: 'PAN Card', required: true },
                          { id: 'rental', label: 'Rental Agreement', required: true },
                          { id: 'police', label: 'Police Verification', required: true },
                          { id: 'passport', label: 'Passport', required: false },
                          { id: 'photo', label: 'Photo', required: true },
                          { id: 'address_proof', label: 'Address Proof', required: true }
                        ].map(doc => {
                          const file = uploadedFiles.find(f => f.docId === doc.id)
                          return (
                            <div key={doc.id} className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-300 transition-colors">
                              <div className="flex items-center justify-between mb-3">
                                <span className="font-semibold text-slate-800">
                                  {doc.label} {doc.required && <span className="text-red-500">*</span>}
                                </span>
                                {file ? (
                                  <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-emerald-500 bg-emerald-50">
                                    <Check className="h-3 w-3 text-emerald-600" />
                                  </div>
                                ) : (
                                  <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-red-300 bg-red-50">
                                    <span className="text-red-500 text-xs font-semibold">!</span>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center justify-between gap-2 mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                <div className="min-w-0">
                                  {file ? (
                                    <>
                                      <p className="truncate text-xs font-semibold text-slate-700">{file.name}</p>
                                      <p className="text-[10px] text-slate-400 mt-0.5">{file.size} · {file.type}</p>
                                    </>
                                  ) : (
                                    <p className="text-xs font-medium text-slate-400 italic">No document uploaded</p>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {file ? (
                                    <button type="button" onClick={() => setUploadedFiles(p => p.filter(f => f.docId !== doc.id))} className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-600 transition">
                                      <X className="h-3.5 w-3.5" /> Remove
                                    </button>
                                  ) : (
                                    <label className="flex cursor-pointer items-center gap-1 rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-600 transition shadow-sm">
                                      <Upload className="h-3 w-3" /> Upload
                                      <input type="file" className="hidden" onChange={e => {
                                        const selected = e.target.files[0]
                                        if (selected) {
                                          const reader = new FileReader()
                                          reader.onloadend = () => {
                                            setUploadedFiles(p => {
                                              const next = p.filter(f => f.docId !== doc.id)
                                              next.push({
                                                docId: doc.id,
                                                name: selected.name,
                                                size: (selected.size / 1024).toFixed(0) + ' KB',
                                                type: selected.name.split('.').pop().toUpperCase(),
                                                fileUrlBase64: reader.result,
                                                isExisting: false
                                              })
                                              return next
                                            })
                                          }
                                          reader.readAsDataURL(selected)
                                        }
                                      }} />
                                    </label>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* ── Step 5: Review ── */}
                  {step === 5 && (
                    <div className="space-y-5">
                      <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-800"><ClipboardCheck className="h-5 w-5 text-green-500" /> Review & Confirm</h3>
                      <div className="space-y-4">
                        <ReviewSection title="Basic Information" icon={User} items={[
                          { label: 'Full Name', value: `${form.firstName} ${form.lastName}` },
                          { label: 'Work Email', value: form.email },
                          { label: 'Work Phone', value: form.phone },
                          { label: 'Gender', value: form.gender },
                        ]} />
                        <ReviewSection title="Job Details" icon={Briefcase} items={[
                          { label: 'Department', value: departments.find(d => d.id === form.department)?.name || '—' },
                          { label: 'Role / Designation', value: jobTitles.find(j => j.id === form.role)?.name || '—' },
                          { label: 'Joining Date', value: form.joinDate },
                          { label: 'Employment Status', value: form.employmentStatus },
                        ]} />
                        <ReviewSection title="Compensation & Bank Account" icon={Banknote} items={[
                          { label: 'Monthly Gross Salary', value: form.salary ? `₹${Number(form.salary).toLocaleString('en-IN')}` : '—' },
                          { label: 'Bank Name', value: form.bankName },
                          { label: 'Bank Account Number', value: form.bankAccount },
                          { label: 'IFSC Code', value: form.ifsc },
                        ]} />
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Locked Footer */}
            <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-white shrink-0 z-10">
              <button
                type="button"
                onClick={step === 1 ? onClose : prev}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                <ChevronLeft className="h-4 w-4" />
                {step === 1 ? 'Cancel' : 'Previous'}
              </button>

              <div className="flex items-center gap-2">
                {STEPS.map(s => (
                  <div key={s.id} className={`h-2 w-2 rounded-full transition-all ${s.id === step ? 'w-6 bg-blue-600' : s.id < step ? 'bg-blue-300' : 'bg-slate-200'}`} />
                ))}
              </div>

              {step < 5 ? (
                <button
                  type="button"
                  onClick={next}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-700 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" /> Save Details
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
})

EditEmployeeModal.displayName = 'EditEmployeeModal'
export default EditEmployeeModal
