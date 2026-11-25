import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { 
  Building2, Globe, Users, Plane, Clock, 
  Banknote, CheckCircle2, ChevronRight, ChevronLeft, 
  Upload, MapPin, Briefcase, ShieldCheck, ArrowRight,
  Plus, Trash2, Calendar, FileText, Smartphone, Network,
  X, Info, Save, Settings, Loader2, User, Download
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import onboardingService from '../../services/onboardingService'

// ── Section 6: Advanced Post-Verification Onboarding Wizard ──────────────────
const STEPS = [
  { id: 1, label: 'Company Profile',      icon: Building2, desc: 'Legal entity & brand details' },
  { id: 2, label: 'First Legal Entity',   icon: Globe,     desc: 'Statutory compliance setup'  },
  { id: 3, label: 'Invite Team Members',  icon: Users,     desc: 'Add your team (optional)'   },
  { id: 4, label: 'Payroll Quick Setup',  icon: Banknote,  desc: 'First payday & structure'   },
  { id: 5, label: 'Leave Policy Setup',   icon: Plane,     desc: 'Time-off management'        },
  { id: 6, label: 'Go Live',              icon: CheckCircle2, desc: 'Complete setup'          },
]

// Fiscal year start months
const FISCAL_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

// Entity types
const ENTITY_TYPES = [
  { value: 'limited_company', label: 'Limited Company' },
  { value: 'llc', label: 'LLC' },
  { value: 'sole_trader', label: 'Sole Trader' },
  { value: 'plc', label: 'PLC' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'llp', label: 'LLP' },
]

// Pay frequencies
const PAY_FREQUENCIES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'bi_weekly', label: 'Bi-weekly' },
  { value: 'semi_monthly', label: 'Semi-monthly' },
  { value: 'monthly', label: 'Monthly' },
]

// Salary structure templates
const SALARY_TEMPLATES = [
  { value: 'us_standard', label: 'US Standard' },
  { value: 'uk_paye', label: 'UK PAYE' },
  { value: 'india_ctc', label: 'India CTC' },
  { value: 'custom', label: 'Custom' },
]

// Overtime rules
const OVERTIME_RULES = [
  { value: 'flsa', label: 'FLSA (US)' },
  { value: 'wtr', label: 'WTR (UK)' },
  { value: 'factories_act', label: 'Factories Act (India)' },
  { value: 'custom', label: 'Custom' },
]

// Leave policy templates
const LEAVE_TEMPLATES = [
  { value: 'us_pto', label: 'US PTO' },
  { value: 'uk_statutory', label: 'UK Statutory Minimum' },
  { value: 'india_statutory', label: 'India Statutory' },
  { value: 'custom', label: 'Custom' },
]

// Team roles
const TEAM_ROLES = [
  { value: 'hr_admin', label: 'Hr Admin' },
  { value: 'payroll_admin', label: 'Payroll Admin' },
  { value: 'sales_admin', label: 'Sales Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'employee', label: 'Employee' },
]

const OnboardingPage = () => {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [isCheckingProgress, setIsCheckingProgress] = useState(true)
  
  // ── Fully Functional Form State (must be before any conditional returns) ──
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('wm_onboarding_data')
    return saved ? JSON.parse(saved) : {
      // Step 1: Company Profile
      companyLogo: null,
      companyLogoPreview: null,
      legalName: '',
      tradingName: '',
      regNo: '',
      address: {
        line1: '',
        line2: '',
        city: '',
        state: '',
        postal: '',
        country: 'India'
      },
      billingEmail: '',
      vatGstNumber: '',
      fiscalYearStart: 'April', // Month name
      
      // Step 2: First Legal Entity
      entityLegalName: '',
      entityType: 'limited_company',
      countryOfIncorporation: 'IN',
      taxEmployerId: '',
      pfRegistrationNo: '',
      esiRegistrationNo: '',
      stateProvince: '',
      payFrequency: 'monthly',
      currency: 'INR',
      bankName: '',
      accountNumber: '',
      routingNumber: '',
      
      // Step 3: Team Invitations
      invitations: [],
      skipTeamInvite: false,
      
      // Step 4: Payroll Quick Setup
      nextPayDate: '',
      salaryStructureTemplate: 'india_ctc',
      defaultWorkingHours: 40,
      overtimeRules: 'custom',
      
      // Step 5: Leave Policy
      leavePolicyTemplate: 'india_statutory',
      annualLeaveDays: 21,
      sickLeaveDays: 12,
      leaveYearStart: 'April',
      carryForwardLimit: 5,
      publicHolidays: ['Republic Day', 'Independence Day', 'Gandhi Jayanti', 'Diwali', 'Holi']
    }
  })

  // Persistence logic
  useEffect(() => {
    localStorage.setItem('wm_onboarding_data', JSON.stringify(formData))
  }, [formData])
  
  // ── Check existing onboarding progress on mount ──
  useEffect(() => {
    const checkProgress = async () => {
      const token = session?.token || session?.user?.token || localStorage.getItem('access_token')
      console.log('🔍 Onboarding check: token exists?', !!token)
      
      if (!token) {
        console.warn('❌ No token found in session or storage, redirecting to registration')
        // No token, redirect to registration
        navigate('/registration', { replace: true })
        return
      }

      try {
        const progress = await onboardingService.getProgress(token)
        console.log('Onboarding Progress:', progress)
        
        if (progress.is_completed) {
          // Onboarding already completed, redirect to login
          navigate('/login', { replace: true })
          return
        }
        
        // Calculate which step to show based on completed steps
        let nextStep = 1
        if (progress.step_6_completed) {
          nextStep = 7 // Show completion screen
        } else if (progress.step_5_completed) {
          nextStep = 6
        } else if (progress.step_4_completed) {
          nextStep = 5
        } else if (progress.step_3_completed) {
          nextStep = 4
        } else if (progress.step_2_completed) {
          nextStep = 3
        } else if (progress.step_1_completed) {
          nextStep = 2
        }
        
        console.log('Resuming from step:', nextStep)
        setCurrentStep(nextStep)
        
      } catch (error) {
        console.log('Could not fetch progress, starting fresh:', error)
      } finally {
        setIsCheckingProgress(false)
      }
    }

    checkProgress()
  }, [navigate, session])

  // Show loading while checking progress
  if (isCheckingProgress) {
    return (
      <div className="min-h-screen bg-[#f4f7fe] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading your progress...</p>
        </div>
      </div>
    )
  }

  const handleNext = async () => {
    setIsSubmitting(true)
    setError('')
    
    try {
      const token = session?.token || session?.user?.token || localStorage.getItem('access_token')
      
      // Validate we're not trying to submit beyond step 6
      if (currentStep > 6) {
        console.error('Invalid step:', currentStep)
        setError('Invalid step number')
        setIsSubmitting(false)
        return
      }
      
      // Save current step data to backend with exact schema match
      if (currentStep === 1) {
        // Step 1: Company Profile
        const fiscalYearStartMonth = FISCAL_MONTHS.indexOf(formData.fiscalYearStart) !== -1 
          ? FISCAL_MONTHS.indexOf(formData.fiscalYearStart) + 1 
          : 4;

        const step1Data = {
          company_logo_url: formData.companyLogoPreview || null,
          company_legal_name: formData.legalName || formData.companyLegalName || 'Company Name',
          trading_name: formData.tradingName || null,
          website: null,
          company_registration_no: formData.regNo || formData.companyRegNo || null,
          address_line1: formData.address?.line1 || formData.addressLine1 || 'Address Line 1',
          address_line2: formData.address?.line2 || formData.addressLine2 || null,
          city: formData.address?.city || formData.city || 'City',
          state: formData.address?.state || formData.state || 'State',
          postal_code: formData.address?.postal || formData.postalCode || '000000',
          country: formData.address?.country || formData.country || 'India',
          billing_contact_email: formData.billingEmail || 'billing@company.com',
          vat_gst_number: formData.vatGstNumber || null,
          fiscal_year_start: fiscalYearStartMonth,
        }
        console.log('Submitting Step 1:', step1Data)
        await onboardingService.updateStep(1, step1Data, token)
      } else if (currentStep === 2) {
        // Step 2: First Legal Entity
        const step2Data = {
          entity_legal_name: formData.entityLegalName || formData.legalName || 'Entity Name',
          entity_type: formData.entityType || 'limited_company',
          country_of_incorporation: formData.countryOfIncorporation || (formData.address?.country === 'India' ? 'IN' : 'US'),
          tax_employer_id: formData.taxEmployerId || formData.regNo || 'TEMP-ID-12345',
          pf_registration_no: formData.pfRegistrationNo || null,
          esi_registration_no: formData.esiRegistrationNo || null,
          state_province: formData.stateProvince || formData.address?.state || null,
          pay_frequency: formData.payFrequency || 'monthly',
          currency: formData.currency || 'INR',
          bank_name: formData.bankName || null,
          account_number: formData.accountNumber || null,
          routing_number: formData.routingNumber || null,
        }
        console.log('Submitting Step 2:', step2Data)
        await onboardingService.updateStep(2, step2Data, token)
      } else if (currentStep === 3) {
        // Step 3: Team Invitations
        const step3Data = {
          invitations: (formData.invitations || []).map(inv => ({
            email: inv.email,
            role: inv.role || 'hr_admin',
            first_name: inv.first_name || null,
            last_name: inv.last_name || null
          })),
          skip: formData.skipTeamInvite || (formData.invitations || []).length === 0,
        }
        console.log('Submitting Step 3:', step3Data)
        await onboardingService.updateStep(3, step3Data, token)
      } else if (currentStep === 4) {
        // Step 4: Payroll Configuration
        const today = new Date()
        const defaultNextPayDate = new Date(today.getFullYear(), today.getMonth() + 1, 25).toISOString().split('T')[0]
        
        const step4Data = {
          next_pay_date: formData.nextPayDate || defaultNextPayDate,
          salary_structure_template: formData.salaryStructureTemplate || 'india_ctc',
          default_working_hours: parseInt(formData.defaultWorkingHours) || 40,
          overtime_rules: formData.overtimeRules || 'custom',
        }
        console.log('Submitting Step 4:', step4Data)
        await onboardingService.updateStep(4, step4Data, token)
      } else if (currentStep === 5) {
        // Step 5: Leave Policy
        const leaveYearStartMonth = FISCAL_MONTHS.indexOf(formData.leaveYearStart) !== -1 
          ? FISCAL_MONTHS.indexOf(formData.leaveYearStart) + 1 
          : 4;

        let publicHolidaysList = (formData.publicHolidays || []).map(h => {
          const holidayMap = {
            'Republic Day': '2026-01-26',
            'Independence Day': '2026-08-15',
            'Gandhi Jayanti': '2026-10-02',
            'Diwali': '2026-11-08',
            'Holi': '2026-03-23',
          }
          if (holidayMap[h]) return holidayMap[h]
          if (/^\d{4}-\d{2}-\d{2}$/.test(h)) return h
          return '2026-12-25'
        })
        
        if (publicHolidaysList.length === 0) {
          publicHolidaysList = ['2026-01-01']
        }

        const step5Data = {
          leave_policy_template: formData.leavePolicyTemplate || 'india_statutory',
          annual_leave_days: parseInt(formData.annualLeaveDays) ?? 21,
          sick_leave_days: parseInt(formData.sickLeaveDays) ?? 12,
          leave_year_start: leaveYearStartMonth,
          carry_forward_limit: parseInt(formData.carryForwardLimit) ?? 5,
          public_holidays: publicHolidaysList,
        }
        console.log('Submitting Step 5:', step5Data)
        await onboardingService.updateStep(5, step5Data, token)
      } else if (currentStep === 6) {
        // Step 6: Completion (empty body as per backend schema)
        console.log('Submitting Step 6 (completion)')
        await onboardingService.updateStep(6, {}, token)
        
        // Mark onboarding as complete
        localStorage.removeItem('wm_onboarding_data')
        setCurrentStep(7) // Show completion screen (local state only, not sent to backend)
        setIsSubmitting(false)
        return
      }
      
      // Move to next step (only for steps 1-5)
      if (currentStep < 6) {
        setCurrentStep(currentStep + 1)
        window.scrollTo(0, 0)
      }
    } catch (err) {
      console.error('Onboarding Error:', err)
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to save step. Please try again.'
      setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const updateNested = (key, subKey, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: { ...prev[key], [subKey]: value }
    }))
  }

  // Completion screen
  if (currentStep === 7) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6 font-sans">
        <div className="max-w-2xl w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[48px] p-12 shadow-2xl text-center"
          >
            <div className="flex justify-center mb-8">
              <div className="h-24 w-24 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-16 w-16 text-emerald-600" />
              </div>
            </div>
            
            <h1 className="text-4xl font-black text-slate-900 mb-4">
              🎉 Onboarding Complete!
            </h1>
            <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
              Your workspace is now fully configured. You can now login to access your admin dashboard and start managing your organization.
            </p>
            
            <button
              onClick={() => navigate('/login')}
              className="px-12 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-[24px] font-black uppercase tracking-widest hover:shadow-2xl hover:shadow-blue-200 transition-all flex items-center gap-3 mx-auto group active:scale-95"
            >
              Login to Dashboard
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <p className="mt-8 text-xs text-slate-400">
              Use your registered email and password to login
            </p>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f4f7fe] flex flex-col font-sans selection:bg-blue-100">
      {/* ── Advanced Header ── */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-8 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div whileHover={{ rotate: 10 }} className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Settings className="h-6 w-6 text-white" />
            </motion.div>
            <div className="hidden sm:block">
              <h1 className="text-base font-black text-slate-900 uppercase tracking-widest leading-none">Workspace Setup</h1>
              <div className="flex items-center gap-2 mt-1">
                 <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active Onboarding Session</span>
              </div>
            </div>
          </div>
          
          {/* Progress Tracker */}
          <div className="hidden lg:flex items-center gap-2">
            {STEPS.map((step) => (
              <div key={step.id} className="flex items-center">
                <div className={`h-10 w-10 rounded-2xl flex items-center justify-center text-xs font-black transition-all duration-500 ${
                  currentStep >= step.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-slate-100 text-slate-400'
                }`}>
                  {currentStep > step.id ? <CheckCircle2 className="h-5 w-5" /> : step.id}
                </div>
                {step.id < 6 && (
                  <div className="w-6 h-0.5 mx-1 relative overflow-hidden bg-slate-200 rounded-full">
                    <motion.div 
                      className="absolute inset-0 bg-blue-600"
                      initial={{ x: '-100%' }}
                      animate={{ x: currentStep > step.id ? '0%' : '-100%' }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
               <p className="text-[10px] font-black text-slate-400 uppercase">Setup Progress</p>
               <p className="text-sm font-black text-slate-900">{Math.round((currentStep / 6) * 100)}%</p>
            </div>
            <button onClick={() => navigate('/')} className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center py-16 px-6 relative">
        {/* Decorative background elements */}
        <div className="absolute top-40 left-10 w-72 h-72 bg-blue-400/10 blur-[100px] rounded-full -z-10" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400/10 blur-[120px] rounded-full -z-10" />

        <div className="max-w-4xl w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-[48px] p-12 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] border border-white relative overflow-hidden"
            >
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold">
                  <X className="h-5 w-5" /> {error}
                </div>
              )}
              {/* Step Info Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 mb-8 border border-blue-100/50">
                <span className="text-[10px] font-black uppercase tracking-widest">Step {currentStep} of 6</span>
                <div className="h-1 w-1 rounded-full bg-blue-300" />
                <span className="text-[10px] font-bold uppercase tracking-widest">{STEPS[currentStep-1].label}</span>
              </div>

              <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-3">
                {STEPS[currentStep-1].label}
              </h2>
              <p className="text-slate-500 text-lg mb-12 font-medium max-w-xl">
                {STEPS[currentStep-1].desc}. Proper configuration ensures accurate compliance and payroll.
              </p>

              <div className="min-h-[400px]">
                {currentStep === 1 && <Step1Profile data={formData} update={setFormData} />}
                {currentStep === 2 && <Step2Region data={formData} update={setFormData} />}
                {currentStep === 3 && <Step3Org data={formData} update={setFormData} />}
                {currentStep === 4 && <Step4Leave data={formData} update={setFormData} />}
                {currentStep === 5 && <Step5Attendance data={formData} update={setFormData} />}
                {currentStep === 6 && <Step6Payroll data={formData} update={setFormData} />}
              </div>

              {/* Navigation Actions */}
              <div className="mt-16 flex items-center justify-between gap-6 pt-10 border-t border-slate-100/60">
                <button
                  onClick={handleBack}
                  disabled={currentStep === 1 || isSubmitting}
                  className="px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all flex items-center gap-3 disabled:opacity-0"
                >
                  <ChevronLeft className="h-5 w-5" />
                  Back
                </button>
                
                <button
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-[24px] font-black uppercase tracking-widest hover:shadow-2xl hover:shadow-blue-200 transition-all flex items-center gap-3 group active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {currentStep === 6 ? 'Complete Onboarding' : 'Save & Continue'}
                      <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

          <p className="mt-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] opacity-60">
            Powered by WorkMatrix Enterprise Cloud · Tier 1 Security
          </p>
        </div>
      </main>
    </div>
  )
}

// ── STEP 1: COMPANY PROFILE ──────────────────────────────────────────────────
const Step1Profile = ({ data, update }) => {
  const [logoPreview, setLogoPreview] = useState(data.companyLogoPreview || null)
  const fileInputRef = useRef(null)

  const handleLogoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!['image/png', 'image/svg+xml', 'image/jpeg'].includes(file.type)) {
        alert('Please upload PNG, SVG, or JPG image')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result)
        update({...data, companyLogo: file, companyLogoPreview: reader.result})
      }
      reader.readAsDataURL(file)
    }
  }

  const removeLogo = () => {
    setLogoPreview(null)
    update({...data, companyLogo: null, companyLogoPreview: null})
  }

  // Get initials from company name
  const getInitials = () => {
    const name = data.legalName || data.companyLegalName || 'CO'
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
  }

  // Get label for Company Reg No based on country
  const getRegNoLabel = () => {
    const labels = {
      'India': 'CIN (Company Identification Number)',
      'United Kingdom': 'Companies House Number',
      'United States': 'EIN (Employer Identification Number)',
    }
    return labels[data.country] || 'Company Registration Number'
  }

  // Check if VAT/GST should be shown
  const showVatGst = data.country !== 'United States'
  const getVatGstLabel = () => {
    if (data.country === 'India') return 'GSTIN (GST Identification Number)'
    if (data.country === 'United Kingdom') return 'VAT Registration Number'
    return 'VAT/GST Number'
  }

  // Default fiscal year by region
  const getFiscalYearDefault = () => {
    const defaults = {
      'India': 'April',
      'United Kingdom': 'April',
      'United States': 'January',
    }
    return defaults[data.country] || 'January'
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Logo Upload Section */}
      <div className="flex flex-col md:flex-row items-start gap-10">
        <div className="space-y-4 text-center">
          <div className="relative">
            {logoPreview ? (
              <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-blue-100 shadow-lg relative group">
                <img src={logoPreview} alt="Company Logo" className="h-full w-full object-cover" />
                <button
                  onClick={removeLogo}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-6 w-6 text-white" />
                </button>
              </div>
            ) : (
              <div className="h-32 w-32 rounded-full border-2 border-dashed border-slate-300 bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:shadow-lg transition-all relative overflow-hidden group">
                {data.legalName || data.companyLegalName ? (
                  <div className="text-3xl font-black text-blue-600">{getInitials()}</div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-slate-400 group-hover:text-blue-500 group-hover:scale-110 transition-all" />
                    <span className="text-[10px] font-black text-slate-400 uppercase mt-2 group-hover:text-blue-500 transition-colors">Upload Logo</span>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/svg+xml,image/jpeg"
                  onChange={handleLogoUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            )}
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">PNG, SVG, JPG</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Min 200×200px</p>
            {!logoPreview && (
              <p className="text-[8px] text-blue-600 mt-1">Initials shown if skipped</p>
            )}
          </div>
        </div>
        
        {/* Basic Info */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <Input 
            label="Company Legal Name *" 
            value={data.legalName || data.companyLegalName} 
            onChange={v => update({...data, legalName: v, companyLegalName: v})} 
            placeholder="e.g. Acme Corp Ltd"
            required
          />
          <Input 
            label="Trading Name" 
            value={data.tradingName} 
            onChange={v => update({...data, tradingName: v})} 
            placeholder="Optional - shown on payslips"
          />
          <Input 
            label={getRegNoLabel()} 
            value={data.regNo || data.companyRegNo} 
            onChange={v => update({...data, regNo: v, companyRegNo: v})} 
            placeholder={data.country === 'India' ? 'U12345MH2020PTC123456' : 'Registration number'}
          />
          <Input 
            label="Billing Contact Email *" 
            type="email"
            value={data.billingEmail} 
            onChange={v => update({...data, billingEmail: v})} 
            placeholder="finance@company.com"
            required
          />
        </div>
      </div>
      
      {/* Registered Address */}
      <div className="p-8 bg-slate-50 rounded-[32px] space-y-6 border border-slate-100">
        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em]">Registered Address *</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Input 
              label="Address Line 1 *" 
              value={data.address?.line1 || data.addressLine1} 
              onChange={v => update({...data, address: {...(data.address || {}), line1: v}, addressLine1: v})}
              placeholder="Street address"
              required
            />
          </div>
          <Input 
            label="Address Line 2" 
            value={data.address?.line2 || data.addressLine2} 
            onChange={v => update({...data, address: {...(data.address || {}), line2: v}, addressLine2: v})}
            placeholder="Suite, floor (optional)"
          />
          <Input 
            label="City *" 
            value={data.address?.city || data.city} 
            onChange={v => update({...data, address: {...(data.address || {}), city: v}, city: v})}
            placeholder="City"
            required
          />
          <Input 
            label="State / County *" 
            value={data.address?.state || data.state} 
            onChange={v => update({...data, address: {...(data.address || {}), state: v}, state: v})}
            placeholder="State or County"
            required
          />
          <Input 
            label="Postal Code *" 
            value={data.address?.postal || data.postalCode} 
            onChange={v => update({...data, address: {...(data.address || {}), postal: v}, postalCode: v})}
            placeholder="Postal/ZIP code"
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Country *"
            value={data.country}
            options={['India', 'United States', 'United Kingdom']}
            onChange={v => update({...data, country: v})}
          />
          <Select
            label="Fiscal Year Start *"
            value={data.fiscalYearStart || getFiscalYearDefault()}
            options={FISCAL_MONTHS}
            onChange={v => update({...data, fiscalYearStart: v})}
          />
        </div>
      </div>

      {/* VAT/GST Number - Conditional */}
      {showVatGst && (
        <div className="p-6 bg-blue-50 rounded-[32px] border border-blue-100">
          <Input 
            label={getVatGstLabel()} 
            value={data.vatGstNumber} 
            onChange={v => update({...data, vatGstNumber: v})}
            placeholder={data.country === 'India' ? '22AAAAA0000A1Z5' : 'VAT number'}
          />
          <p className="text-xs text-blue-600 mt-2">
            {data.country === 'India' ? 'Required for GST compliance and invoicing' : 'Required for tax compliance'}
          </p>
        </div>
      )}
    </div>
  )
}

// ── STEP 2: FIRST LEGAL ENTITY ────────────────────────────────────────────────
const Step2Region = ({ data, update }) => {
  // Auto-set currency based on country
  useEffect(() => {
    const currencyMap = {
      'IN': 'INR',
      'US': 'USD',
      'GB': 'GBP',
    }
    const newCurrency = currencyMap[data.countryOfIncorporation] || 'INR'
    if (data.currency !== newCurrency) {
      update({...data, currency: newCurrency})
    }
  }, [data.countryOfIncorporation])

  // Get label for Tax/Employer ID based on country
  const getTaxIdLabel = () => {
    const labels = {
      'IN': 'TAN (Tax Deduction Account Number)',
      'US': 'EIN (Employer Identification Number)',
      'GB': 'ERN (PAYE Reference)',
    }
    return labels[data.countryOfIncorporation] || 'Tax / Employer ID *'
  }

  const getTaxIdPlaceholder = () => {
    const placeholders = {
      'IN': 'ABCD12345E',
      'US': 'XX-XXXXXXX',
      'GB': '123/AB45678',
    }
    return placeholders[data.countryOfIncorporation] || 'Tax ID'
  }

  // Check if India-specific fields should show
  const showIndiaFields = data.countryOfIncorporation === 'IN'

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Entity Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input 
          label="Entity Legal Name *" 
          value={data.entityLegalName} 
          onChange={v => update({...data, entityLegalName: v})}
          placeholder="e.g., Acme Corp US LLC"
          required
        />
        <Select
          label="Entity Type *"
          value={data.entityType}
          options={ENTITY_TYPES}
          onChange={v => update({...data, entityType: v})}
        />
      </div>

      {/* Country & Tax Info */}
      <div className="p-8 bg-slate-50 rounded-[32px] space-y-6 border border-slate-100">
        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em]">Statutory Compliance</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Country of Incorporation *"
            value={data.countryOfIncorporation}
            options={[
              { value: 'IN', label: 'India' },
              { value: 'US', label: 'United States' },
              { value: 'GB', label: 'United Kingdom' },
            ]}
            onChange={v => update({...data, countryOfIncorporation: v})}
          />
          <Input 
            label={getTaxIdLabel()} 
            value={data.taxEmployerId} 
            onChange={v => update({...data, taxEmployerId: v})}
            placeholder={getTaxIdPlaceholder()}
            required
          />
        </div>

        {/* India-specific fields */}
        {showIndiaFields && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
            <Input 
              label="PF Registration No" 
              value={data.pfRegistrationNo} 
              onChange={v => update({...data, pfRegistrationNo: v})}
              placeholder="MH/BAN/12345/000/1234567"
            />
            <Input 
              label="ESI Registration No" 
              value={data.esiRegistrationNo} 
              onChange={v => update({...data, esiRegistrationNo: v})}
              placeholder="12-34-567890-000-0000"
            />
          </div>
        )}



        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-700">
            <p className="font-bold mb-1">Statutory Compliance Info:</p>
            <p>
              {data.countryOfIncorporation === 'IN' && 'India: PF (Provident Fund) + ESI (Employee State Insurance)'}
              {data.countryOfIncorporation === 'US' && 'US: EIN + FUTA (Federal Unemployment Tax)'}
              {data.countryOfIncorporation === 'GB' && 'UK: PAYE + National Insurance'}
            </p>
          </div>
        </div>
      </div>

      {/* Payroll Settings */}
      <div className="p-8 bg-slate-50 rounded-[32px] space-y-6 border border-slate-100">
        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em]">Payroll Configuration</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Pay Frequency *"
            value={data.payFrequency}
            options={PAY_FREQUENCIES}
            onChange={v => update({...data, payFrequency: v})}
          />
          <Select
            label="Currency *"
            value={data.currency}
            options={[
              { value: 'INR', label: 'INR (₹)' },
              { value: 'USD', label: 'USD ($)' },
              { value: 'GBP', label: 'GBP (£)' },
            ]}
            onChange={v => update({...data, currency: v})}
          />
        </div>
        <p className="text-xs text-slate-500">
          Currency is auto-selected based on country but can be changed if needed.
        </p>
      </div>


    </div>
  )
}



// ── STEP 3: INVITE TEAM MEMBERS ───────────────────────────────────────────────
const Step3Org = ({ data, update }) => {
  const [showCsvUpload, setShowCsvUpload] = useState(false)

  const addInvitation = () => {
    if ((data.invitations || []).length < 10) {
      const newInvitations = [...(data.invitations || []), {
        id: Date.now(),
        email: '',
        role: 'hr_admin',
        first_name: '',
        last_name: ''
      }]
      update({...data, invitations: newInvitations})
    }
  }

  const removeInvitation = (id) => {
    const newInvitations = (data.invitations || []).filter(inv => inv.id !== id)
    update({...data, invitations: newInvitations})
  }

  const updateInvitation = (id, field, value) => {
    const newInvitations = (data.invitations || []).map(inv =>
      inv.id === id ? { ...inv, [field]: value } : inv
    )
    update({...data, invitations: newInvitations})
  }

  const handleSkip = () => {
    update({...data, skipTeamInvite: true, invitations: []})
  }

  const invitations = data.invitations || []

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Info Banner */}
      <div className="p-6 bg-blue-50 rounded-[32px] border border-blue-100 flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-700">
          <p className="font-bold mb-1">Invite your team to collaborate</p>
          <p className="text-xs">You can invite up to 10 team members now. More can be added later from Settings.</p>
        </div>
      </div>

      {/* Invitation Rows */}
      {invitations.length > 0 && (
        <div className="space-y-4">
          {invitations.map((inv, index) => (
            <motion.div
              key={inv.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6 bg-slate-50 rounded-[32px] border border-slate-200 hover:border-blue-300 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  Team Member {index + 1}
                </h4>
                <button
                  onClick={() => removeInvitation(inv.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  label="Email Address *"
                  type="email"
                  value={inv.email}
                  onChange={(v) => updateInvitation(inv.id, 'email', v)}
                  placeholder="colleague@company.com"
                  required
                />
                <Select
                  label="Role *"
                  value={inv.role}
                  options={TEAM_ROLES}
                  onChange={(v) => updateInvitation(inv.id, 'role', v)}
                />
                <Input 
                  label="First Name"
                  value={inv.first_name}
                  onChange={(v) => updateInvitation(inv.id, 'first_name', v)}
                  placeholder="Optional"
                />
                <Input 
                  label="Last Name"
                  value={inv.last_name}
                  onChange={(v) => updateInvitation(inv.id, 'last_name', v)}
                  placeholder="Optional"
                />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Another Button */}
      {invitations.length < 10 && (
        <button
          onClick={addInvitation}
          className="w-full py-6 border-2 border-dashed border-slate-300 rounded-[32px] text-slate-600 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-all flex items-center justify-center gap-3 font-bold"
        >
          <Plus className="h-5 w-5" />
          {invitations.length === 0 ? 'Add Team Member' : 'Add Another Team Member'}
        </button>
      )}

      {invitations.length >= 10 && (
        <p className="text-center text-sm text-amber-600 font-bold">
          Maximum 10 invitations reached. You can add more team members later from Settings.
        </p>
      )}

      {/* Bulk CSV Upload */}
      <div className="border-t border-slate-200 pt-6">
        <button
          onClick={() => setShowCsvUpload(!showCsvUpload)}
          className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
        >
          <Upload className="h-4 w-4" />
          Bulk Invite via CSV
          <ChevronRight className={`h-4 w-4 transition-transform ${showCsvUpload ? 'rotate-90' : ''}`} />
        </button>

        {showCsvUpload && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="mt-4 p-6 bg-slate-50 rounded-[32px] border border-slate-200"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">Upload a CSV file with team member details</p>
                <button className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                  <Download className="h-3 w-3" />
                  Download Template
                </button>
              </div>
              
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer">
                <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-600">Click to upload or drag and drop</p>
                <p className="text-xs text-slate-400 mt-1">CSV file with columns: email, first_name, last_name, role</p>
                <input type="file" accept=".csv" className="hidden" />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Skip Option */}
      <div className="text-center pt-4 border-t border-slate-200">
        <button
          onClick={handleSkip}
          className="text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors"
        >
          Skip for now — invite team later from Settings
        </button>
      </div>
    </div>
  )
}

// ── STEP 4: PAYROLL QUICK SETUP ───────────────────────────────────────────────
const Step4Leave = ({ data, update }) => {
  const [showBankDetails, setShowBankDetails] = useState(false)

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Info Banner */}
      <div className="p-6 bg-blue-50 rounded-[32px] border border-blue-100 flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-700">
          <p className="font-bold mb-1">Configure your first payroll cycle</p>
          <p className="text-xs">Set up basic payroll parameters. You can refine these settings later.</p>
        </div>
      </div>

      {/* Next Pay Date & Salary Structure */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input 
          label="Next Pay Date *" 
          type="date"
          min={today}
          value={data.nextPayDate}
          onChange={v => update({...data, nextPayDate: v})}
          placeholder="mm/dd/yyyy"
          required
        />
        <Select
          label="Salary Structure Template *"
          value={data.salaryStructureTemplate}
          options={SALARY_TEMPLATES}
          onChange={v => update({...data, salaryStructureTemplate: v})}
        />
      </div>

      {/* Working Hours & Overtime */}
      <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 space-y-6">
        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em]">Working Hours & Overtime</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input 
            label="Default Working Hours/Week *" 
            type="number"
            min="1"
            max="80"
            value={data.defaultWorkingHours}
            onChange={v => update({...data, defaultWorkingHours: parseInt(v) || 40})}
            placeholder="e.g., 40"
            required
          />
          <Select
            label="Overtime Rules *"
            value={data.overtimeRules}
            options={OVERTIME_RULES}
            onChange={v => update({...data, overtimeRules: v})}
          />
        </div>
        <p className="text-xs text-slate-500">
          Default: US (40 hrs), UK (37.5 hrs), India (48 hrs)
        </p>
      </div>

      {/* Bank Details - Collapsible */}
      <div className="border border-slate-200 rounded-[32px] overflow-hidden bg-white">
        <button
          onClick={() => setShowBankDetails(!showBankDetails)}
          className="w-full p-6 hover:bg-slate-50 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Banknote className="h-5 w-5 text-slate-600" />
            <div className="text-left">
              <h4 className="text-sm font-black text-slate-900">Bank Details</h4>
              <p className="text-xs text-slate-500">Optional - Add before running payroll</p>
            </div>
          </div>
          <ChevronRight className={`h-5 w-5 text-slate-400 transition-transform ${showBankDetails ? 'rotate-90' : ''}`} />
        </button>
        
        {showBankDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="p-6 bg-slate-50 border-t border-slate-200"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Bank Name" 
                value={data.bankName} 
                onChange={v => update({...data, bankName: v})}
                placeholder="e.g., HDFC Bank"
              />
              <Input 
                label="Account Number" 
                value={data.accountNumber} 
                onChange={v => update({...data, accountNumber: v})}
                placeholder="Account number"
              />
              <Input 
                label="Routing Number / IFSC / Sort Code" 
                value={data.routingNumber} 
                onChange={v => update({...data, routingNumber: v})}
                placeholder="Bank routing code"
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Skip Message */}
      <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
        <span className="text-amber-500">💡</span>
        <span>You can skip bank details for now and add them before running your first payroll</span>
      </div>
    </div>
  )
}

// ── STEP 5: LEAVE POLICY SETUP ────────────────────────────────────────────────
const Step5Attendance = ({ data, update }) => {
  const [customHoliday, setCustomHoliday] = useState('')

  const addCustomHoliday = () => {
    if (customHoliday.trim()) {
      const newHolidays = [...(data.publicHolidays || []), customHoliday.trim()]
      update({...data, publicHolidays: newHolidays})
      setCustomHoliday('')
    }
  }

  const removeHoliday = (holiday) => {
    const newHolidays = (data.publicHolidays || []).filter(h => h !== holiday)
    update({...data, publicHolidays: newHolidays})
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addCustomHoliday()
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Info Banner */}
      <div className="p-6 bg-blue-50 rounded-[32px] border border-blue-100 flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-700">
          <p className="font-bold mb-1">Configure leave and time-off policies</p>
          <p className="text-xs">Set up annual leave, sick leave, and public holidays for your organization.</p>
        </div>
      </div>

      {/* Leave Policy Template & Leave Year Start */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label="Leave Policy Template *"
          value={data.leavePolicyTemplate}
          options={LEAVE_TEMPLATES}
          onChange={v => update({...data, leavePolicyTemplate: v})}
        />
        <Select
          label="Leave Year Start *"
          value={data.leaveYearStart}
          options={FISCAL_MONTHS}
          onChange={v => update({...data, leaveYearStart: v})}
        />
      </div>

      {/* Leave Days Configuration */}
      <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 space-y-6">
        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em]">Leave Entitlements</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input 
            label="Annual Leave Days *" 
            type="number"
            min="0"
            max="365"
            value={data.annualLeaveDays}
            onChange={v => update({...data, annualLeaveDays: parseInt(v) || 0})}
            placeholder="e.g., 21"
            required
          />
          <Input 
            label="Sick Leave Days *" 
            type="number"
            min="0"
            max="365"
            value={data.sickLeaveDays}
            onChange={v => update({...data, sickLeaveDays: parseInt(v) || 0})}
            placeholder="e.g., 12"
            required
          />
          <Input 
            label="Carry Forward Limit *" 
            type="number"
            min="0"
            max="365"
            value={data.carryForwardLimit}
            onChange={v => update({...data, carryForwardLimit: parseInt(v) || 0})}
            placeholder="0 = no carry-forward"
            required
          />
        </div>
        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
          <p className="text-xs text-blue-700">
            <span className="font-bold">Statutory Minimums:</span> UK: 28 days | India: 21 days | US: No federal minimum
          </p>
        </div>
      </div>

      {/* Public Holidays */}
      <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em]">Public Holidays *</h4>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-black rounded-full">
            {(data.publicHolidays || []).length} holidays
          </span>
        </div>
        
        <p className="text-xs text-slate-600">
          Pre-loaded holidays based on your country. You can add or remove holidays as needed.
        </p>

        {/* Holiday List */}
        {(data.publicHolidays || []).length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {(data.publicHolidays || []).map((holiday, index) => (
              <motion.span 
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="px-4 py-2 bg-white text-slate-900 text-xs font-black rounded-xl border border-slate-200 shadow-sm flex items-center gap-2 hover:border-red-300 hover:bg-red-50 transition-all group"
              >
                <Calendar className="h-3.5 w-3.5 text-blue-600 group-hover:text-red-500 transition-colors" />
                {holiday}
                <button 
                  onClick={() => removeHoliday(holiday)} 
                  className="text-slate-400 hover:text-red-500 transition-colors ml-1"
                  title="Remove holiday"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.span>
            ))}
          </div>
        ) : (
          <div className="p-6 bg-white rounded-2xl border-2 border-dashed border-slate-200 text-center">
            <Calendar className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No holidays added yet</p>
            <p className="text-xs text-slate-400 mt-1">Add your first holiday below</p>
          </div>
        )}

        {/* Add Custom Holiday */}
        <div className="pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <Plus className="h-4 w-4 text-blue-600" />
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Add Holiday</p>
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              value={customHoliday}
              onChange={e => setCustomHoliday(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter holiday name (e.g., Christmas Day)"
              className="flex-1 bg-white border border-slate-200 rounded-[20px] px-5 py-4 text-sm font-bold text-slate-700 focus:ring-2 ring-blue-500 outline-none transition placeholder:text-slate-400"
            />
            <button
              onClick={addCustomHoliday}
              disabled={!customHoliday.trim()}
              className="px-8 py-4 bg-blue-600 text-white rounded-[20px] font-black uppercase tracking-wide hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 active:scale-95"
            >
              <Plus className="h-5 w-5" />
              Add Holiday
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            💡 Press Enter to quickly add a holiday
          </p>
        </div>
      </div>
    </div>
  )
}

// ── STEP 6: GO LIVE ───────────────────────────────────────────────────────────
const Step6Payroll = ({ data, update }) => {
  // Calculate completion status
  const checklistItems = [
    { label: 'Email verified', completed: true, icon: CheckCircle2 },
    { label: 'Company profile', completed: !!data.legalName, icon: Building2 },
    { label: 'First entity', completed: !!data.entityLegalName, icon: Globe },
    { label: 'Team invited', completed: (data.invitations || []).length > 0 || data.skipTeamInvite, icon: Users, optional: true },
    { label: 'Payroll configured', completed: !!data.nextPayDate, icon: Banknote },
    { label: 'Leave policy', completed: data.annualLeaveDays > 0, icon: Plane },
  ]

  const completedCount = checklistItems.filter(item => item.completed).length
  const requiredCount = checklistItems.filter(item => !item.optional).length
  const allRequiredComplete = checklistItems.filter(item => !item.optional).every(item => item.completed)

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Celebration Banner */}
      <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[32px] border border-blue-100 text-center">
        <div className="flex justify-center mb-4">
          <div className="h-20 w-20 bg-blue-600 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-12 w-12 text-white" />
          </div>
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-2">Almost Ready to Go Live! 🎉</h3>
        <p className="text-slate-600 max-w-md mx-auto">
          You've completed the essential setup. Review your configuration below and launch your workspace.
        </p>
      </div>

      {/* Setup Checklist */}
      <div className="p-8 bg-white rounded-[32px] border border-slate-200 space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Setup Checklist</h4>
          <div className="flex items-center gap-2">
            <div className="h-2 w-32 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
                style={{ width: `${(completedCount / checklistItems.length) * 100}%` }}
              />
            </div>
            <span className="text-xs font-black text-slate-600">{completedCount}/{checklistItems.length}</span>
          </div>
        </div>

        {checklistItems.map((item, index) => {
          const Icon = item.icon
          return (
            <div 
              key={index}
              className={`flex items-center justify-between p-4 rounded-2xl transition-all ${
                item.completed 
                  ? 'bg-emerald-50 border border-emerald-200' 
                  : 'bg-amber-50 border border-amber-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                  item.completed ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className={`text-sm font-bold ${item.completed ? 'text-emerald-900' : 'text-amber-900'}`}>
                    {item.label}
                    {item.optional && <span className="text-xs ml-2 opacity-60">(Optional)</span>}
                  </p>
                </div>
              </div>
              {item.completed ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <span className="text-xs font-bold text-amber-600 uppercase">Incomplete</span>
              )}
            </div>
          )
        })}
      </div>

      {/* Incomplete Items Warning */}
      {!allRequiredComplete && (
        <div className="p-6 bg-amber-50 rounded-[32px] border border-amber-200 flex items-start gap-3">
          <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-800">
            <p className="font-bold mb-1">Some required items are incomplete</p>
            <p className="text-xs">Please go back and complete all required steps before launching your workspace.</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {allRequiredComplete && (
        <div className="p-6 bg-emerald-50 rounded-[32px] border border-emerald-200 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-emerald-800">
            <p className="font-bold mb-1">All required setup complete!</p>
            <p className="text-xs">Click "Complete Onboarding" below to launch your workspace and access the dashboard.</p>
          </div>
        </div>
      )}

      {/* What's Next */}
      <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-200">
        <h4 className="text-sm font-black text-slate-900 mb-4 uppercase tracking-widest">What's Next?</h4>
        <ul className="space-y-3">
          <li className="flex items-start gap-3 text-sm text-slate-600">
            <div className="h-6 w-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-black text-blue-600">1</span>
            </div>
            <span>Access your admin dashboard and explore all features</span>
          </li>
          <li className="flex items-start gap-3 text-sm text-slate-600">
            <div className="h-6 w-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-black text-blue-600">2</span>
            </div>
            <span>Add employees and configure their profiles</span>
          </li>
          <li className="flex items-start gap-3 text-sm text-slate-600">
            <div className="h-6 w-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-black text-blue-600">3</span>
            </div>
            <span>Run your first payroll cycle</span>
          </li>
          <li className="flex items-start gap-3 text-sm text-slate-600">
            <div className="h-6 w-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-black text-blue-600">4</span>
            </div>
            <span>Invite additional team members from Settings</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

// ── UTILITY COMPONENTS ───────────────────────────────────────────────────────
const Input = ({ label, value, onChange, placeholder, ...props }) => (
  <div className="space-y-2">
    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
    <input 
      value={value} 
      onChange={e => onChange(e.target.value)} 
      placeholder={placeholder}
      className="w-full bg-slate-50 border-none rounded-[20px] p-4 text-sm font-bold text-slate-700 focus:ring-2 ring-blue-500 outline-none transition shadow-sm hover:bg-slate-100/50" 
      {...props} 
    />
  </div>
)

const Select = ({ label, value, options, onChange }) => (
  <div className="space-y-2">
    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
    <div className="relative group">
      <select 
        value={value} 
        onChange={e => onChange(e.target.value)}
        className="w-full bg-slate-50 border-none rounded-[20px] p-4 text-sm font-bold text-slate-700 focus:ring-2 ring-blue-500 outline-none transition shadow-sm appearance-none cursor-pointer hover:bg-slate-100/50"
      >
        {options.map(o => {
          // Handle both string and object options
          const optionValue = typeof o === 'string' ? o : o.value
          const optionLabel = typeof o === 'string' ? o : o.label
          return <option key={optionValue} value={optionValue}>{optionLabel}</option>
        })}
      </select>
      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 rotate-90 pointer-events-none" />
    </div>
  </div>
)

const ToggleCard = ({ icon: Icon, title, desc, active, onToggle }) => (
  <div className={`p-6 rounded-[32px] border transition-all duration-300 flex items-center justify-between ${active ? 'bg-blue-600 border-blue-600 shadow-xl shadow-blue-100' : 'bg-white border-slate-200'}`}>
    <div className="flex items-center gap-4">
      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-colors ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className={`text-sm font-black ${active ? 'text-white' : 'text-slate-900'}`}>{title}</p>
        <p className={`text-[10px] font-bold uppercase tracking-tight ${active ? 'text-blue-100' : 'text-slate-400'}`}>{desc}</p>
      </div>
    </div>
    <div 
      onClick={onToggle}
      className={`h-7 w-12 rounded-full p-1 cursor-pointer transition-all duration-300 flex ${active ? 'bg-white' : 'bg-slate-200'}`}
    >
      <motion.div 
        layout
        className={`h-5 w-5 rounded-full shadow-md ${active ? 'bg-blue-600 ml-auto' : 'bg-white'}`} 
      />
    </div>
  </div>
)

export default OnboardingPage
