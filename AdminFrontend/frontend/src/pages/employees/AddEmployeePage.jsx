import { useState, useCallback, memo, useEffect } from 'react'
import employeeService from '../../services/employeeService'
import roleService from '../../services/roleService'
import { motion, AnimatePresence } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import {
  User, Briefcase, Banknote, FileText, ClipboardCheck,
  ChevronLeft, ChevronRight, Check, Upload, X, ArrowLeft,
  AlertCircle, Calendar,
} from 'lucide-react'
import { MANAGERS, EMPLOYMENT_TYPES } from './data/employeeData'
import { useDepartments } from '../../hooks/useDepartments'

// ─── Step Config ─────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Basic Info', icon: User },
  { id: 2, label: 'Job Info', icon: Briefcase },
  { id: 3, label: 'Compensation', icon: Banknote },
  { id: 4, label: 'Documents', icon: FileText },
  { id: 5, label: 'Review', icon: ClipboardCheck },
]

// ─── Reusable Field ───────────────────────────────────────────────────────────
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

// ─── Stepper ─────────────────────────────────────────────────────────────────
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

// ─── Review Card ─────────────────────────────────────────────────────────────
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

// ─── Main Component ───────────────────────────────────────────────────────────
const AddEmployeePage = memo(() => {
  const navigate = useNavigate()
  const { departments } = useDepartments()
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState({})
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')
  const [roles, setRoles] = useState([])
  const [rolesLoading, setRolesLoading] = useState(true)

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', gender: 'Male',
    department: '', role: '', manager: '', joinDate: '', employmentType: 'Full-time',
    salary: '', payType: 'Monthly', bankAccount: '', ifsc: '',
  })

  // Fetch roles from API
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setRolesLoading(true)
        const response = await roleService.getRoles()
        const rolesData = response?.data?.data || response?.data || []
        const rolesList = Array.isArray(rolesData) ? rolesData : []
        setRoles(rolesList.map(r => ({
          id: r.id,
          name: r.role_name || r.name
        })))
      } catch (err) {
        console.error('Failed to fetch roles:', err)
        setRoles([])
      } finally {
        setRolesLoading(false)
      }
    }
    fetchRoles()
  }, [])

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
      if (!form.email.trim()) e.email = 'Email is required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format'
      if (!form.phone.trim()) e.phone = 'Phone is required'
      if (!form.gender) e.gender = 'Please select gender'
    }
    if (step === 2) {
      if (!form.department) e.department = 'Department is required'
      if (!form.role) e.role = 'Role is required'
      if (!form.joinDate) e.joinDate = 'Joining date is required'
      if (!form.employmentType) e.employmentType = 'Employment type is required'
    }
    if (step === 3) {
      if (!form.salary) e.salary = 'Salary is required'
      else if (isNaN(Number(form.salary))) e.salary = 'Must be a number'
      if (!form.bankAccount.trim()) e.bankAccount = 'Account number is required'
      if (!form.ifsc.trim()) e.ifsc = 'IFSC code is required'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }, [step, form])

  const next = useCallback(() => {
    if (validate()) setStep(s => Math.min(5, s + 1))
  }, [validate])

  const prev = useCallback(() => setStep(s => Math.max(1, s - 1)), [])

  const handleFileSelection = useCallback((files) => {
    files.forEach(f => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setUploadedFiles(p => {
          if (p.some(existing => existing.name === f.name)) return p
          return [...p, {
            name: f.name,
            size: (f.size / 1024).toFixed(0) + ' KB',
            type: f.name.split('.').pop().toUpperCase(),
            fileUrlBase64: reader.result
          }]
        })
      }
      reader.readAsDataURL(f)
    })
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setIsDragging(false)
    const files = [...e.dataTransfer.files]
    handleFileSelection(files)
  }, [handleFileSelection])

  const removeFile = useCallback((idx) => {
    setUploadedFiles(p => p.filter((_, i) => i !== idx))
  }, [])

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true)
    setApiError('')

    try {
      // Map frontend form to the requested API payload schema
      const payload = {
        entity_id: "3fa85f64-5717-4562-b3fc-2c963f66afa6", 
        first_name: form.firstName,
        last_name: form.lastName,
        preferred_name: form.firstName,
        pronouns: "",
        email_work: form.email,
        email_personal: "",
        phone_work: form.phone,
        phone_personal: "",
        date_of_birth: "1990-01-01", 
        gender: form.gender.toLowerCase() === 'male' ? 'male' : form.gender.toLowerCase() === 'female' ? 'female' : 'other',
        nationality: "Indian",
        country_of_residence: "India",
        address_json: {
          line1: "",
          line2: "",
          city: "",
          state: "",
          postal_code: "",
          country: "India"
        },
        employment_status: "pending_start",
        employment_type: form.employmentType.toLowerCase().replace('-', '_'),
        hire_date: form.joinDate,
        probation_end_date: form.joinDate,
        notice_period_days: 30,
        department_id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        job_title_id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        manager_id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        work_location_id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        region: "India",
        timezone: "IST",
        custom_fields_json: {
          salary: form.salary,
          bank_account: form.bankAccount,
          ifsc: form.ifsc,
          pay_type: form.payType
        }
      }

      const result = await employeeService.createEmployee(payload)
      
      // Upload documents dynamically
      if (uploadedFiles && uploadedFiles.length > 0) {
        const getDocType = (fileName) => {
          const lower = fileName.toLowerCase()
          if (lower.includes('aadhar')) return 'id_proof'
          if (lower.includes('pan')) return 'id_proof'
          if (lower.includes('passport')) return 'passport'
          if (lower.includes('contract') || lower.includes('agreement')) return 'contract'
          if (lower.includes('police') || lower.includes('verification')) return 'certificate'
          if (lower.includes('photo') || lower.includes('image')) return 'other'
          return 'other'
        }

        const docPromises = uploadedFiles.map(async (doc) => {
          if (!doc.fileUrlBase64) return
          const apiDocType = getDocType(doc.name)
          try {
            await employeeService.addEmployeeDocument(result.id, {
              document_type: apiDocType,
              file_url: doc.fileUrlBase64,
              file_name: doc.name
            })
          } catch (e) {
            console.error("Failed to upload document during onboarding:", e)
          }
        })
        await Promise.all(docPromises)
      }
      
      alert('Employee created successfully!')
      navigate('/employees')
    } catch (err) {
      console.error('Submission error:', err)
      setApiError(err.message || 'Failed to create employee. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [form, uploadedFiles, navigate])

  return (
    <div className="min-h-full bg-[#F7F8FA] p-6">
      <div className="mx-auto  space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/employees')} className="flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-800">
            <ArrowLeft className="h-4 w-4" /> Back to Employees
          </button>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Add New Employee</h2>
          <p className="mt-0.5 text-sm text-slate-500">Step {step} of {STEPS.length} — {STEPS[step - 1].label}</p>
        </div>

        {/* API Error Message */}
        {apiError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center gap-3 text-red-600 shadow-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">{apiError}</p>
          </div>
        )}

        {/* Stepper */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <Stepper current={step} />
        </div>

        {/* Form Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            {/* ── Step 1: Basic Info ─────────────────── */}
            {step === 1 && (
              <div className="space-y-5">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-800"><User className="h-5 w-5 text-blue-500" /> Basic Information</h3>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="First Name" required error={errors.firstName}>
                    <input value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="Rahul" className={inputCls(errors.firstName)} />
                  </Field>
                  <Field label="Last Name" required error={errors.lastName}>
                    <input value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Sharma" className={inputCls(errors.lastName)} />
                  </Field>
                  <Field label="Email Address" required error={errors.email}>
                    <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="rahul.sharma@company.com" className={inputCls(errors.email)} />
                  </Field>
                  <Field label="Phone Number" required error={errors.phone}>
                    <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" className={inputCls(errors.phone)} />
                  </Field>
                </div>
                <Field label="Gender" required error={errors.gender}>
                  <div className="flex gap-4">
                    {['Male', 'Female', 'Other', 'Prefer not to say'].map(g => (
                      <label key={g} className="flex cursor-pointer items-center gap-2">
                        <input type="radio" name="gender" value={g} checked={form.gender === g} onChange={() => set('gender', g)} className="h-4 w-4 accent-blue-600" />
                        <span className="text-sm text-slate-700">{g}</span>
                      </label>
                    ))}
                  </div>
                  {errors.gender && <span className="flex items-center gap-1 text-xs text-red-500"><AlertCircle className="h-3 w-3" /> {errors.gender}</span>}
                </Field>
              </div>
            )}

            {/* ── Step 2: Job Info ───────────────────── */}
            {step === 2 && (
              <div className="space-y-5">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-800"><Briefcase className="h-5 w-5 text-indigo-500" /> Job Information</h3>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Department" required error={errors.department}>
                    <select value={form.department} onChange={e => set('department', e.target.value)} className={inputCls(errors.department)}>
                      <option value="">Select Department</option>
                      {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                    </select>
                  </Field>
                  <Field label="Role" required error={errors.role}>
                    <select value={form.role} onChange={e => set('role', e.target.value)} className={inputCls(errors.role)} disabled={rolesLoading}>
                      <option value="">{rolesLoading ? 'Loading roles...' : 'Select Role'}</option>
                      {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                    </select>
                  </Field>
                  <Field label="Manager">
                    <select value={form.manager} onChange={e => set('manager', e.target.value)} className={inputCls(false)}>
                      <option value="">Select Manager (optional)</option>
                      {MANAGERS.map(m => <option key={m}>{m}</option>)}
                    </select>
                  </Field>
                  <Field label="Joining Date" required error={errors.joinDate}>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input type="date" value={form.joinDate} onChange={e => set('joinDate', e.target.value)} className={`${inputCls(errors.joinDate)} pl-10`} />
                    </div>
                  </Field>
                  <Field label="Employment Type" required error={errors.employmentType}>
                    <select value={form.employmentType} onChange={e => set('employmentType', e.target.value)} className={inputCls(errors.employmentType)}>
                      <option value="">Select Type</option>
                      {EMPLOYMENT_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </Field>
                </div>
              </div>
            )}

            {/* ── Step 3: Compensation ───────────────── */}
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
                  <Field label="Bank Account Number" required error={errors.bankAccount}>
                    <input value={form.bankAccount} onChange={e => set('bankAccount', e.target.value)} placeholder="1234567890" className={inputCls(errors.bankAccount)} />
                  </Field>
                  <Field label="IFSC Code" required error={errors.ifsc}>
                    <input value={form.ifsc} onChange={e => set('ifsc', e.target.value.toUpperCase())} placeholder="HDFC0001234" className={inputCls(errors.ifsc)} maxLength={11} />
                  </Field>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <p className="text-xs text-amber-800"><strong>Note:</strong> Banking details are encrypted and only accessible to Finance & HR teams. Ensure details are accurate before submission.</p>
                </div>
              </div>
            )}

            {/* ── Step 4: Documents ──────────────────── */}
            {step === 4 && (
              <div className="space-y-5">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-800"><FileText className="h-5 w-5 text-purple-500" /> Document Upload</h3>
                <div
                  onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-10 text-center transition ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/50'}`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100">
                    <Upload className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700">Drag & drop files here</p>
                    <p className="mt-1 text-sm text-slate-400">or</p>
                    <label className="mt-2 inline-block cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                      Browse Files
                      <input type="file" multiple className="hidden" onChange={e => {
                        const files = [...e.target.files]
                        handleFileSelection(files)
                      }} />
                    </label>
                  </div>
                  <p className="text-xs text-slate-400">Accepted: PDF, JPG, PNG, DOCX · Max 10MB per file</p>
                </div>
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700">{uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''} ready</p>
                    {uploadedFiles.map((f, i) => (
                      <div key={i} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-blue-700">{f.type}</div>
                          <div>
                            <div className="text-sm font-medium text-slate-800">{f.name}</div>
                            <div className="text-xs text-slate-400">{f.size}</div>
                          </div>
                        </div>
                        <button onClick={() => removeFile(i)} className="rounded-lg p-1 text-slate-400 transition hover:bg-red-50 hover:text-red-500"><X className="h-4 w-4" /></button>
                      </div>
                    ))}
                  </div>
                )}
                {uploadedFiles.length === 0 && (
                  <p className="text-center text-xs text-slate-400">No documents uploaded yet. You can also add documents later from the employee profile.</p>
                )}
              </div>
            )}

            {/* ── Step 5: Review ─────────────────────── */}
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
                    { label: 'Department', value: form.department },
                    { label: 'Role', value: form.role },
                    { label: 'Manager', value: form.manager || 'Not assigned' },
                    { label: 'Joining Date', value: form.joinDate ? new Date(form.joinDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '' },
                    { label: 'Employment Type', value: form.employmentType },
                  ]} />
                  <ReviewSection title="Compensation" icon={Banknote} items={[
                    { label: 'Salary', value: form.salary ? `₹${Number(form.salary).toLocaleString('en-IN')} / ${form.payType}` : '' },
                    { label: 'Bank Account', value: form.bankAccount ? `****${form.bankAccount.slice(-4)}` : '' },
                    { label: 'IFSC Code', value: form.ifsc },
                  ]} />
                  {uploadedFiles.length > 0 && (
                    <ReviewSection title="Documents" icon={FileText} items={uploadedFiles.map(f => ({ label: f.type, value: f.name }))} />
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
        <div className="flex items-center justify-between">
          <button
            onClick={step === 1 ? () => navigate('/employees') : prev}
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
    </div>
  )
})

AddEmployeePage.displayName = 'AddEmployeePage'
export default AddEmployeePage
