import { useState, useCallback, memo, useEffect } from 'react'
import employeeService from '../services/employeeService'
import { useDepartments } from '../hooks/useDepartments'
import { useJobTitles } from '../hooks/useJobTitles'
import { useRoles } from '../hooks/useRoles'
import { motion, AnimatePresence } from 'motion/react'
import {
  User, Briefcase, Banknote, FileText, ClipboardCheck,
  ChevronLeft, ChevronRight, Check, Upload, X,
  AlertCircle, Calendar,
} from 'lucide-react'
import { DEPARTMENTS, MANAGERS, EMPLOYMENT_TYPES } from '../pages/employees/data/employeeData'

// ——————————————————————————————————————————————————————————————————————————————
const STEPS = [
  { id: 1, label: 'Basic Info', icon: User },
  { id: 2, label: 'Job Info', icon: Briefcase },
  { id: 3, label: 'Compensation', icon: Banknote },
  { id: 4, label: 'Documents', icon: FileText },
  { id: 5, label: 'Review', icon: ClipboardCheck },
]

// ——————————————————————————————————————————————————————————————————————————————
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

// ——————————————————————————————————————————————————————————————————————————————
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

// ——————————————————————————————————————————————————————————————————————————————
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

// ——————————————————————————————————————————————————————————————————————————————
const AddEmployeeModal = memo(({ isOpen, onClose, onSuccess }) => {
  // Fetch departments and job titles dynamically
  const { departments, loading: departmentsLoading } = useDepartments()
  const { jobTitles, loading: jobTitlesLoading, refetch: refetchJobTitles } = useJobTitles()
  const { roles: dynamicRoles, loading: rolesLoading } = useRoles()
  
  const [managersList, setManagersList] = useState([])
  const [managersLoading, setManagersLoading] = useState(false)

  useEffect(() => {
    let isMounted = true
    const fetchManagers = async () => {
      try {
        setManagersLoading(true)
        const res = await employeeService.getEmployees(1, 100)
        if (!isMounted) return
        
        const employeeList = Array.isArray(res) ? res : (res?.employees || res?.data || res?.items || [])
        const allowedRoles = ['admin', 'manager', 'hr_admin', 'tl']
        
        const valid = employeeList.filter(emp => {
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
  }, [isOpen])
  
  const [isAddingJobTitle, setIsAddingJobTitle] = useState(false)
  const [newJobTitle, setNewJobTitle] = useState('')
  const [addingJobTitleLoading, setAddingJobTitleLoading] = useState(false)
  const [isAddingManager, setIsAddingManager] = useState(false)
  const [newManager, setNewManager] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  })
  const [addingManagerLoading, setAddingManagerLoading] = useState(false)
  const [managerError, setManagerError] = useState('')

  const handleSaveNewJobTitle = async () => {
    if (!newJobTitle.trim()) return
    setAddingJobTitleLoading(true)
    try {
      const { default: jobTitleService } = await import('../services/jobTitleService.js')
      const created = await jobTitleService.createJobTitle({ 
        name: newJobTitle.trim(),
        department_id: form.department || undefined
      })
      
      // Refetch to make sure it appears in the dropdown options
      if (refetchJobTitles) {
        await refetchJobTitles()
      }

      // Auto-select the newly created job title
      const newId = created.id || created.job_title_id || created._id || created.name || newJobTitle.trim()
      set('role', newId)
      
      setIsAddingJobTitle(false)
      setNewJobTitle('')
    } catch (err) {
      alert('Failed to add job title:\n' + err.message)
    } finally {
      setAddingJobTitleLoading(false)
    }
  }

  const handleSelectJobTitle = (e) => {
    const val = e.target.value
    if (val === '__add_new__') {
      setIsAddingJobTitle(true)
      set('role', '')
    } else {
      set('role', val)
    }
  }

  const handleSelectManager = async (e) => {
    const val = e.target.value
    if (val === '__add_new__') {
      setIsAddingManager(true)
      setManagerError('')
      set('manager', '')
    } else {
      setIsAddingManager(false)
      setManagerError('')
      set('manager', val)
    }
  }

  const handleSaveNewManager = async () => {
    const firstName = newManager.firstName.trim()
    const lastName = newManager.lastName.trim()
    const email = newManager.email.trim()
    const phone = newManager.phone.trim()

    if (!firstName || !lastName || !email) {
      setManagerError('First name, last name, and email are required')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setManagerError('Enter a valid manager email')
      return
    }

    setAddingManagerLoading(true)
    setManagerError('')

    try {
      const { default: jobTitleService } = await import('../services/jobTitleService.js')
      const existingManagerTitle = jobTitles.find(jt => {
        const name = (jt.name || jt.title || '').toLowerCase()
        return name.includes('manager') || name.includes('admin') || name.includes('lead')
      })

      let managerJobTitleId = existingManagerTitle?.id
      let managerJobTitleName = existingManagerTitle?.name || existingManagerTitle?.title || 'Manager'

      if (!managerJobTitleId) {
        const createdTitle = await jobTitleService.createJobTitle({ name: 'Manager' })
        managerJobTitleId = createdTitle.id || createdTitle.job_title_id || createdTitle._id
        managerJobTitleName = createdTitle.name || 'Manager'
        if (refetchJobTitles) await refetchJobTitles()
      }

      const today = new Date().toISOString().split('T')[0]
      const createdManager = await employeeService.createEmployee({
        first_name: firstName,
        last_name: lastName,
        preferred_name: firstName,
        email_work: email,
        email_personal: email,
        phone_work: phone || undefined,
        gender: 'prefer_not_to_say',
        employment_status: 'active',
        employment_type: 'full_time',
        hire_date: today,
        notice_period_days: 30,
        department_id: form.department || undefined,
        job_title_id: managerJobTitleId,
        region: (form.region || 'North India').trim(),
        timezone: form.timezone || 'Asia/Kolkata',
        custom_fields_json: {
          salary: 0,
          pay_type: 'Monthly',
        },
      })

      const managerOption = {
        id: createdManager.id || createdManager.employee_id,
        name: `${createdManager.first_name || firstName} ${createdManager.last_name || lastName}`.trim(),
        role: createdManager.job_title || managerJobTitleName,
      }

      setManagersList(prev => [managerOption, ...prev.filter(m => m.id !== managerOption.id)])
      set('manager', managerOption.id)
      setIsAddingManager(false)
      setNewManager({ firstName: '', lastName: '', email: '', phone: '' })
    } catch (err) {
      setManagerError(err.message || 'Failed to add manager')
    } finally {
      setAddingManagerLoading(false)
    }
  }
  
  // Load saved state from localStorage on mount
  const loadSavedState = () => {
    const defaultForm = getDefaultForm()
    try {
      const saved = localStorage.getItem('addEmployeeFormState')
      if (saved) {
        const parsed = JSON.parse(saved)
        return {
          step: parsed.step || 1,
          // Merge saved form with defaults to ensure all fields exist
          form: { ...defaultForm, ...parsed.form },
          uploadedFiles: []
        }
      }
    } catch (err) {
      console.error('Failed to load saved form state:', err)
    }
    return {
      step: 1,
      form: defaultForm,
      uploadedFiles: []
    }
  }

  const getDefaultForm = () => ({
    // Basic Info
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
    // Address
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    // Job Info
    department: '', 
    role: '', 
    manager: '', 
    workLocation: '',
    joinDate: '', 
    employmentType: 'full_time',
    employmentStatus: 'active',
    noticePeriodDays: 30,
    region: '',
    timezone: 'Asia/Kolkata',
    // Compensation
    salary: '', 
    payType: 'Monthly', 
    bankAccount: '', 
    ifsc: '',
    bankName: ''
  })

  const savedState = loadSavedState()
  const [step, setStep] = useState(savedState.step)
  const [errors, setErrors] = useState({})
  const [uploadedFiles, setUploadedFiles] = useState(savedState.uploadedFiles)
  const [isDragging, setIsDragging] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')

  const [form, setForm] = useState(savedState.form)

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (isOpen) {
      const stateToSave = {
        step,
        form
      }
      localStorage.setItem('addEmployeeFormState', JSON.stringify(stateToSave))
    }
  }, [step, form, isOpen])

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
      // Job title is now optional
      if (!form.joinDate) e.joinDate = 'Hire date is required'
      if (!form.employmentType) e.employmentType = 'Employment type is required'
      if (!form.employmentStatus) e.employmentStatus = 'Employment status is required'
    }
    if (step === 3) {
      if (!form.salary) e.salary = 'Salary is required'
      else if (isNaN(Number(form.salary))) e.salary = 'Must be a number'
    }
    if (step === 4) {
      const requiredDocs = ['aadhar', 'pan', 'rental', 'police', 'photo', 'address_proof']
      const uploadedDocIds = uploadedFiles.map(f => f.docId)
      const missingDocs = requiredDocs.filter(docId => !uploadedDocIds.includes(docId))
      if (missingDocs.length > 0) {
        e.documents = 'Please upload all required documents (' + missingDocs.map(d => d.replace('_', ' ')).join(', ') + ')'
      }
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }, [step, form, uploadedFiles])

  const next = useCallback(() => {
    if (validate()) setStep(s => Math.min(5, s + 1))
  }, [validate])

  const prev = useCallback(() => setStep(s => Math.max(1, s - 1)), [])

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setIsDragging(false)
    const files = [...e.dataTransfer.files]
    setUploadedFiles(p => [...p, ...files.map(f => ({ name: f.name, size: (f.size / 1024).toFixed(0) + ' KB', type: f.name.split('.').pop().toUpperCase() }))])
  }, [])

  const removeFile = useCallback((idx) => {
    setUploadedFiles(p => p.filter((_, i) => i !== idx))
  }, [])

  const handleClose = useCallback(() => {
    setStep(1)
    setErrors({})
    setUploadedFiles([])
    setApiError('')
    setForm(getDefaultForm())
    // Clear saved state from localStorage
    localStorage.removeItem('addEmployeeFormState')
    onClose()
  }, [onClose])

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true)
    setApiError('')

    try {
      const docTypeMap = {
        aadhar: 'id_proof',
        pan: 'id_proof',
        rental: 'contract',
        police: 'certificate',
        passport: 'passport',
        photo: 'other',
        address_proof: 'id_proof'
      }

      // Map form data to complete API schema with safe defaults
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
        hire_date: form.joinDate || new Date().toISOString().split('T')[0],
        notice_period_days: parseInt(form.noticePeriodDays) || 30,
        department_id: form.department, // Use the selected department ID from dropdown
        region: (form.region || 'North India').trim(),
        timezone: form.timezone || 'Asia/Kolkata',
        custom_fields_json: {
          salary: parseFloat(form.salary) || 0,
          pay_type: form.payType || 'Monthly',
          bank_account: (form.bankAccount || '').trim(),
          ifsc: (form.ifsc || '').trim(),
          bank_name: (form.bankName || '').trim()
        },
        documents: (uploadedFiles || [])
          .filter(doc => doc.fileUrlBase64)
          .map(doc => ({
            document_type: docTypeMap[doc.docId] || 'other',
            file_url: doc.fileUrlBase64,
            file_name: doc.name
          }))
      }

      // Only add optional fields if they have values
      if (form.role) {
        payload.job_title_id = form.role
      }
      if (form.manager) {
        payload.manager_id = form.manager 
      }
      if (form.workLocation) {
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(form.workLocation)) {
          payload.work_location_id = form.workLocation
        } else {
          payload.custom_fields_json.work_location = form.workLocation
        }
      }

      const result = await employeeService.createEmployee(payload)

      if (onSuccess) onSuccess(result)
      handleClose()
    } catch (err) {
      console.error('❌ Submission error:', err)
      setApiError(err.message || 'Failed to create employee. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [form, uploadedFiles, onSuccess, handleClose])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 p-6 sticky top-0 bg-white z-10">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-slate-900">Add New Employee</h3>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Auto-saved
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1">Step {step} of {STEPS.length} — {STEPS[step - 1].label}</p>
            </div>
            <button onClick={handleClose} className="rounded-lg p-2 hover:bg-slate-100 transition-colors">
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* API Error Message */}
            {apiError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center gap-3 text-red-600 shadow-sm">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="text-sm font-medium">{apiError}</p>
              </div>
            )}

            {/* Stepper */}
            <Stepper current={step} />

            {/* Form Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.2 }}
              >
                {/* — Step 1: Basic Info ————————————————————————————— */}
                {step === 1 && (
                  <div className="space-y-5">
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-800"><User className="h-5 w-5 text-blue-500" /> Basic Information</h3>
                    
                    {/* Name Fields */}
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field label="First Name" required error={errors.firstName}>
                        <input value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="Rahul" className={inputCls(errors.firstName)} />
                      </Field>
                      <Field label="Last Name" required error={errors.lastName}>
                        <input value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Verma" className={inputCls(errors.lastName)} />
                      </Field>
                      <Field label="Preferred Name">
                        <input value={form.preferredName} onChange={e => set('preferredName', e.target.value)} placeholder="RV (optional)" className={inputCls(false)} />
                      </Field>
                      <Field label="Pronouns">
                        <input value={form.pronouns} onChange={e => set('pronouns', e.target.value)} placeholder="He/Him (optional)" className={inputCls(false)} />
                      </Field>
                    </div>

                    {/* Contact Fields */}
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

                    {/* Personal Details */}
                    <div className="grid gap-5 sm:grid-cols-3">
                      <Field label="Date of Birth" required error={errors.dateOfBirth}>
                        <div className="relative">
                          <Calendar className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} className={`${inputCls(errors.dateOfBirth)} pl-10`} />
                        </div>
                      </Field>
                      <Field label="Nationality">
                        <select value={form.nationality} onChange={e => set('nationality', e.target.value)} className={inputCls(false)}>
                          <option value="IN">India</option>
                          <option value="US">United States</option>
                          <option value="GB">United Kingdom</option>
                          <option value="CA">Canada</option>
                          <option value="AU">Australia</option>
                        </select>
                      </Field>
                      <Field label="Country of Residence">
                        <select value={form.countryOfResidence} onChange={e => set('countryOfResidence', e.target.value)} className={inputCls(false)}>
                          <option value="IN">India</option>
                          <option value="US">United States</option>
                          <option value="GB">United Kingdom</option>
                          <option value="CA">Canada</option>
                          <option value="AU">Australia</option>
                        </select>
                      </Field>
                    </div>

                    <Field label="Gender" required error={errors.gender}>
                      <div className="flex gap-4">
                        {[
                          { value: 'male', label: 'Male' },
                          { value: 'female', label: 'Female' },
                          { value: 'other', label: 'Other' },
                          { value: 'prefer_not_to_say', label: 'Prefer not to say' }
                        ].map(g => (
                          <label key={g.value} className="flex cursor-pointer items-center gap-2">
                            <input type="radio" name="gender" value={g.value} checked={form.gender === g.value} onChange={() => set('gender', g.value)} className="h-4 w-4 accent-blue-600" />
                            <span className="text-sm text-slate-700">{g.label}</span>
                          </label>
                        ))}
                      </div>
                    </Field>

                    {/* Address Fields */}
                    <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <h4 className="text-sm font-semibold text-slate-700">Address</h4>
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

                {/* — Step 2: Job Info ———————————————————————————————— */}
                {step === 2 && (
                  <div className="space-y-5">
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-800"><Briefcase className="h-5 w-5 text-indigo-500" /> Job Information</h3>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field label="Department" required error={errors.department}>
                        <select value={form.department} onChange={e => set('department', e.target.value)} className={inputCls(errors.department)} disabled={departmentsLoading}>
                          <option value="">{departmentsLoading ? 'Loading departments...' : 'Select Department'}</option>
                          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                      </Field>
                      <Field label="Job Title" error={errors.role}>
                        {isAddingJobTitle ? (
                          <div className="flex items-center gap-2">
                            <input 
                              type="text" 
                              value={newJobTitle} 
                              onChange={e => setNewJobTitle(e.target.value)} 
                              placeholder="Enter new Job Title..." 
                              className={inputCls(false)} 
                              autoFocus
                            />
                            <button 
                              type="button"
                              onClick={handleSaveNewJobTitle}
                              disabled={addingJobTitleLoading || !newJobTitle.trim()}
                              className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                            >
                              {addingJobTitleLoading ? 'Saving...' : 'Save'}
                            </button>
                            <button 
                              type="button"
                              onClick={() => { setIsAddingJobTitle(false); setNewJobTitle(''); }}
                              className="rounded-lg bg-slate-100 p-2 text-slate-500 hover:bg-slate-200"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <select value={form.role} onChange={handleSelectJobTitle} className={inputCls(errors.role)} disabled={jobTitlesLoading}>
                            <option value="">{jobTitlesLoading ? 'Loading job titles...' : 'Select Job Title (optional)'}</option>
                            {jobTitles.map(jt => <option key={jt.id} value={jt.id}>{jt.name || jt.title || 'Unknown Title'}</option>)}
                            <option value="__add_new__" className="font-semibold text-blue-600">+ Add New Job Title</option>
                          </select>
                        )}
                      </Field>
                      <Field label="Manager">
                        {isAddingManager ? (
                          <div className="space-y-3 rounded-xl border border-blue-100 bg-blue-50/50 p-3">
                            <div className="grid gap-3 sm:grid-cols-2">
                              <input
                                value={newManager.firstName}
                                onChange={e => {
                                  setNewManager(p => ({ ...p, firstName: e.target.value }))
                                  setManagerError('')
                                }}
                                placeholder="Manager first name"
                                className={inputCls(false)}
                                autoFocus
                              />
                              <input
                                value={newManager.lastName}
                                onChange={e => {
                                  setNewManager(p => ({ ...p, lastName: e.target.value }))
                                  setManagerError('')
                                }}
                                placeholder="Manager last name"
                                className={inputCls(false)}
                              />
                              <input
                                type="email"
                                value={newManager.email}
                                onChange={e => {
                                  setNewManager(p => ({ ...p, email: e.target.value }))
                                  setManagerError('')
                                }}
                                placeholder="manager@company.com"
                                className={inputCls(false)}
                              />
                              <input
                                value={newManager.phone}
                                onChange={e => setNewManager(p => ({ ...p, phone: e.target.value }))}
                                placeholder="Phone (optional)"
                                className={inputCls(false)}
                              />
                            </div>
                            {managerError && (
                              <span className="flex items-center gap-1 text-xs text-red-500">
                                <AlertCircle className="h-3 w-3" /> {managerError}
                              </span>
                            )}
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={handleSaveNewManager}
                                disabled={addingManagerLoading}
                                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                              >
                                {addingManagerLoading ? 'Saving...' : 'Save Manager'}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsAddingManager(false)
                                  setManagerError('')
                                  setNewManager({ firstName: '', lastName: '', email: '', phone: '' })
                                }}
                                className="rounded-lg bg-white p-2 text-slate-500 hover:bg-slate-100"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <select value={form.manager} onChange={handleSelectManager} className={inputCls(false)} disabled={managersLoading}>
                            <option value="">{managersLoading ? 'Loading managers...' : 'Select Manager (optional)'}</option>
                            {managersList.map(m => <option key={m.id} value={m.id}>{m.name} ({m.role})</option>)}
                            <option value="__add_new__" className="font-semibold text-blue-600">+ Add New Manager</option>
                          </select>
                        )}
                      </Field>
                    
                      <Field label="Work Location">
                        <input value={form.workLocation} onChange={e => set('workLocation', e.target.value)} placeholder="Office location (optional)" className={inputCls(false)} />
                      </Field>
                      <Field label="Hire Date" required error={errors.joinDate}>
                        <div className="relative">
                          <Calendar className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input type="date" value={form.joinDate} onChange={e => set('joinDate', e.target.value)} className={`${inputCls(errors.joinDate)} pl-10`} />
                        </div>
                      </Field>
                      <Field label="Employment Type" required error={errors.employmentType}>
                        <select value={form.employmentType} onChange={e => set('employmentType', e.target.value)} className={inputCls(errors.employmentType)}>
                          <option value="">Select Type</option>
                          <option value="full_time">Full Time</option>
                          <option value="part_time">Part Time</option>
                          <option value="contract">Contract</option>
                          <option value="intern">Intern</option>
                          <option value="consultant">Consultant</option>
                        </select>
                      </Field>
                      <Field label="Employment Status" required error={errors.employmentStatus}>
                        <select value={form.employmentStatus} onChange={e => set('employmentStatus', e.target.value)} className={inputCls(errors.employmentStatus)}>
                          <option value="active">Active</option>
                          <option value="pending_start">Pending Start</option>
                          <option value="on_leave">On Leave</option>
                          <option value="notice_period">Notice Period</option>
                          <option value="terminated">Terminated</option>
                        </select>
                      </Field>
                      <Field label="Notice Period (Days)">
                        <input type="number" value={form.noticePeriodDays} onChange={e => set('noticePeriodDays', e.target.value)} placeholder="30" className={inputCls(false)} />
                      </Field>
                      <Field label="Region">
                        <input value={form.region} onChange={e => set('region', e.target.value)} placeholder="North India" className={inputCls(false)} />
                      </Field>
                      <Field label="Timezone">
                        <select value={form.timezone} onChange={e => set('timezone', e.target.value)} className={inputCls(false)}>
                          <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                          <option value="America/New_York">America/New_York (EST)</option>
                          <option value="Europe/London">Europe/London (GMT)</option>
                          <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                          <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                        </select>
                      </Field>
                    </div>
                  </div>
                )}

                {/* ── Step 3: Compensation ───────────────────────────── */}
                {step === 3 && (
                  <div className="space-y-5">
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-800"><Banknote className="h-5 w-5 text-yellow-500" /> Compensation & Banking</h3>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field label="Monthly Salary (INR)" required error={errors.salary}>
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
                        <Field label="Bank Name">
                          <input value={form.bankName || ''} onChange={e => set('bankName', e.target.value)} placeholder="HDFC Bank" className={inputCls(false)} />
                        </Field>
                        <Field label="Account Number">
                          <input value={form.bankAccount} onChange={e => set('bankAccount', e.target.value)} placeholder="50100..." className={inputCls(false)} />
                        </Field>
                        <Field label="IFSC Code">
                          <input value={form.ifsc} onChange={e => set('ifsc', e.target.value)} placeholder="HDFC000123" className={inputCls(false)} />
                        </Field>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Step 4: Documents ────────────────────────────── */}
                {step === 4 && (
                  <div className="space-y-5">
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-800"><FileText className="h-5 w-5 text-purple-500" /> Document Upload</h3>
                    {errors.documents && (
                      <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center gap-3 text-red-600 shadow-sm">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <p className="text-sm font-medium">{errors.documents}</p>
                      </div>
                    )}
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
                                  <AlertCircle className="h-3 w-3 text-red-500" />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-3">
                              {file ? (
                                <>
                                  <button 
                                    type="button" 
                                    onClick={() => {
                                      if (file.fileUrlBase64) {
                                        const win = window.open()
                                        win.document.write('<iframe src="' + file.fileUrlBase64  + '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>')
                                      }
                                    }}
                                    className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
                                  >
                                    <FileText className="h-4 w-4" /> Preview
                                  </button>
                                  <button type="button" onClick={() => setUploadedFiles(p => p.filter(f => f.docId !== doc.id))} className="flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-600">
                                    <X className="h-4 w-4" /> Delete
                                  </button>
                                </>
                              ) : (
                                <label className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-blue-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-600 transition-colors">
                                  <Upload className="h-4 w-4" /> Upload
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
                                            fileUrlBase64: reader.result
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
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* ── Step 5: Review ─────────────────────────────── */}
                {step === 5 && (
                  <div className="space-y-5">
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-800"><ClipboardCheck className="h-5 w-5 text-green-500" /> Review & Confirm</h3>
                    <div className="space-y-4">
                      <ReviewSection title="Basic Information" icon={User} items={[
                        { label: 'Full Name', value: `${form.firstName} ${form.lastName}` },
                        { label: 'Email', value: form.email },
                        { label: 'Phone', value: form.phone },
                        { label: 'Gender', value: form.gender },
                      ]} />
                      <ReviewSection title="Job Information" icon={Briefcase} items={[
                        { label: 'Department', value: departments.find(d => d.id === form.department)?.name || form.department },
                        { label: 'Role', value: jobTitles.find(jt => jt.id === form.role)?.name || jobTitles.find(jt => jt.id === form.role)?.title || form.role || 'Not assigned' },
                        { label: 'Manager', value: managersList.find(m => m.id === form.manager)?.name || form.manager || 'Not assigned' },
                        { label: 'Joining Date', value: form.joinDate ? new Date(form.joinDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '' },
                        { label: 'Employment Type', value: form.employmentType },
                      ]} />
                      <ReviewSection title="Compensation & Banking" icon={Banknote} items={[
                        { label: 'Salary', value: form.salary ? `₹${Number(form.salary).toLocaleString('en-IN')} / ${form.payType}` : '' },
                        { label: 'Bank Name', value: form.bankName || '—' },
                        { label: 'Bank Account', value: form.bankAccount ? `****${form.bankAccount.slice(-4)}` : '—' },
                        { label: 'IFSC Code', value: form.ifsc || '—' },
                      ]} />
                      {uploadedFiles.length > 0 && (
                        <ReviewSection title="Documents" icon={FileText} items={uploadedFiles.map(f => ({ label: (f.docId || '').replace('_', ' ').toUpperCase(), value: f.name }))} />
                      )}
                    </div>
                    <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                      <strong>Ready to submit!</strong> Please verify all information above before creating the employee record. An onboarding email will be sent automatically.
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                onClick={step === 1 ? handleClose : prev}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
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
                <button onClick={next} className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95">
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" /> Create Employee
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
})

AddEmployeeModal.displayName = 'AddEmployeeModal'
export default AddEmployeeModal
