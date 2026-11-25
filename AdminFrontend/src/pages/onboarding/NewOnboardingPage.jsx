import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { 
  Building2, Globe, Users, Plane, Banknote, CheckCircle2, 
  ChevronRight, ChevronLeft, Upload, X, Settings, Loader2,
  ArrowRight, Plus, Trash2, Calendar, Mail, User, FileText,
  Download, AlertCircle, Sparkles
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import onboardingService from '../../services/onboardingService'

// ── Constants ──────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Company Profile',      icon: Building2, desc: 'Legal entity & brand details' },
  { id: 2, label: 'First Legal Entity',   icon: Globe,     desc: 'Statutory compliance setup'  },
  { id: 3, label: 'Invite Team Members',  icon: Users,     desc: 'Add your team (optional)'   },
  { id: 4, label: 'Payroll Quick Setup',  icon: Banknote,  desc: 'First payday & structure'   },
  { id: 5, label: 'Leave Policy Setup',   icon: Plane,     desc: 'Time-off management'        },
  { id: 6, label: 'Go Live',              icon: CheckCircle2, desc: 'Complete setup'          },
]

const FISCAL_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const ENTITY_TYPES = [
  { value: 'limited_company', label: 'Limited Company' },
  { value: 'llc', label: 'LLC' },
  { value: 'sole_trader', label: 'Sole Trader' },
  { value: 'plc', label: 'PLC' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'llp', label: 'LLP' },
]

const COUNTRIES = [
  { code: 'IN', label: 'India', currency: 'INR' },
  { code: 'US', label: 'United States', currency: 'USD' },
  { code: 'GB', label: 'United Kingdom', currency: 'GBP' },
]

const PAY_FREQUENCIES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'bi_weekly', label: 'Bi-weekly' },
  { value: 'semi_monthly', label: 'Semi-monthly' },
  { value: 'monthly', label: 'Monthly' },
]

const SALARY_TEMPLATES = [
  { value: 'us_standard', label: 'US Standard' },
  { value: 'uk_paye', label: 'UK PAYE' },
  { value: 'india_ctc', label: 'India CTC' },
  { value: 'custom', label: 'Custom' },
]

const OVERTIME_RULES = [
  { value: 'flsa', label: 'FLSA (US)' },
  { value: 'wtr', label: 'WTR (UK)' },
  { value: 'factories_act', label: 'Factories Act (India)' },
  { value: 'custom', label: 'Custom' },
]

const LEAVE_TEMPLATES = [
  { value: 'us_pto', label: 'US PTO' },
  { value: 'uk_statutory', label: 'UK Statutory Minimum' },
  { value: 'india_statutory', label: 'India Statutory' },
  { value: 'custom', label: 'Custom' },
]

const TEAM_ROLES = [
  { value: 'hr_admin', label: 'HR Admin' },
  { value: 'payroll_admin', label: 'Payroll Admin' },
  { value: 'recruiter', label: 'Recruiter' },
  { value: 'finance_viewer', label: 'Finance Viewer' },
  { value: 'it_admin', label: 'IT Admin' },
]

const PUBLIC_HOLIDAYS_BY_COUNTRY = {
  IN: [
    { date: '2026-01-26', name: 'Republic Day' },
    { date: '2026-08-15', name: 'Independence Day' },
    { date: '2026-10-02', name: 'Gandhi Jayanti' },
    { date: '2026-11-12', name: 'Diwali' },
    { date: '2026-03-25', name: 'Holi' },
  ],
  US: [
    { date: '2026-01-01', name: "New Year's Day" },
    { date: '2026-07-04', name: 'Independence Day' },
    { date: '2026-11-28', name: 'Thanksgiving' },
    { date: '2026-12-25', name: 'Christmas' },
  ],
  GB: [
    { date: '2026-01-01', name: "New Year's Day" },
    { date: '2026-03-29', name: 'Good Friday' },
    { date: '2026-12-25', name: 'Christmas Day' },
    { date: '2026-12-26', name: 'Boxing Day' },
  ],
}

// ── Main Component ─────────────────────────────────────────────────────────
const NewOnboardingPage = () => {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [isCheckingProgress, setIsCheckingProgress] = useState(true)
  
  // Form state
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('wm_onboarding_data')
    return saved ? JSON.parse(saved) : {
      // Step 1: Company Profile
      companyLogo: null,
      companyLogoPreview: null,
      companyLegalName: '',
      tradingName: '',
      companyRegNo: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      billingEmail: '',
      vatGstNumber: '',
      fiscalYearStart: 'April',
      
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
      defaultWorkingHours: 48,
      overtimeRules: 'factories_act',
      
      // Step 5: Leave Policy
      leavePolicyTemplate: 'india_statutory',
      annualLeaveDays: 21,
      sickLeaveDays: 12,
      leaveYearStart: 'April',
      carryForwardLimit: 5,
      selectedHolidays: ['Republic Day', 'Independence Day', 'Gandhi Jayanti'],
    }
  })

  // Persistence
  useEffect(() => {
    localStorage.setItem('wm_onboarding_data', JSON.stringify(formData))
  }, [formData])
  
  // Check progress on mount
  useEffect(() => {
    const checkProgress = async () => {
      const token = session?.token || session?.user?.token || localStorage.getItem('access_token')
      
      if (!token) {
        navigate('/registration', { replace: true })
        return
      }

      try {
        const progress = await onboardingService.getProgress(token)
        console.log('Onboarding Progress:', progress)
        
        if (progress.is_completed) {
          navigate('/login', { replace: true })
          return
        }
        
        // Calculate next step
        let nextStep = 1
        if (progress.step_6_completed) nextStep = 7
        else if (progress.step_5_completed) nextStep = 6
        else if (progress.step_4_completed) nextStep = 5
        else if (progress.step_3_completed) nextStep = 4
        else if (progress.step_2_completed) nextStep = 3
        else if (progress.step_1_completed) nextStep = 2
        
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

  // Loading state
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
      
      if (currentStep > 6) {
        setError('Invalid step number')
        setIsSubmitting(false)
        return
      }
      
      // Submit current step
      if (currentStep === 1) {
        await onboardingService.updateStep(1, {
          company_logo_url: formData.companyLogoPreview || null,
          company_legal_name: formData.companyLegalName || 'Company Name',
          trading_name: formData.tradingName || null,
          website: null,
          company_registration_no: formData.companyRegNo || null,
          address_line1: formData.addressLine1 || 'Address Line 1',
          address_line2: formData.addressLine2 || null,
          city: formData.city || 'City',
          state: formData.state || 'State',
          postal_code: formData.postalCode || '000000',
          country: formData.country || 'India',
          billing_contact_email: formData.billingEmail || 'billing@company.com',
          vat_gst_number: formData.vatGstNumber || null,
          fiscal_year_start: FISCAL_MONTHS.indexOf(formData.fiscalYearStart) + 1,
        }, token)
      } else if (currentStep === 2) {
        await onboardingService.updateStep(2, {
          entity_legal_name: formData.entityLegalName || 'Entity Name',
          entity_type: formData.entityType,
          country_of_incorporation: formData.countryOfIncorporation,
          tax_employer_id: formData.taxEmployerId || 'TEMP-ID-12345',
          pf_registration_no: formData.pfRegistrationNo || null,
          esi_registration_no: formData.esiRegistrationNo || null,
          state_province: formData.stateProvince || null,
          pay_frequency: formData.payFrequency,
          currency: formData.currency,
          bank_name: formData.bankName || null,
          account_number: formData.accountNumber || null,
          routing_number: formData.routingNumber || null,
        }, token)
      } else if (currentStep === 3) {
        await onboardingService.updateStep(3, {
          invitations: formData.invitations,
          skip: formData.skipTeamInvite || formData.invitations.length === 0,
        }, token)
      } else if (currentStep === 4) {
        await onboardingService.updateStep(4, {
          next_pay_date: formData.nextPayDate || new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
          salary_structure_template: formData.salaryStructureTemplate,
          default_working_hours: formData.defaultWorkingHours,
          overtime_rules: formData.overtimeRules,
        }, token)
      } else if (currentStep === 5) {
        const holidays = PUBLIC_HOLIDAYS_BY_COUNTRY[formData.countryOfIncorporation] || PUBLIC_HOLIDAYS_BY_COUNTRY.IN
        await onboardingService.updateStep(5, {
          leave_policy_template: formData.leavePolicyTemplate,
          annual_leave_days: formData.annualLeaveDays,
          sick_leave_days: formData.sickLeaveDays,
          leave_year_start: FISCAL_MONTHS.indexOf(formData.leaveYearStart) + 1,
          carry_forward_limit: formData.carryForwardLimit,
          public_holidays: formData.selectedHolidays.map(name => {
            const holiday = holidays.find(h => h.name === name)
            return holiday?.date || '2026-01-01'
          }),
        }, token)
      } else if (currentStep === 6) {
        await onboardingService.updateStep(6, {}, token)
        localStorage.removeItem('wm_onboarding_data')
        setCurrentStep(7)
        setIsSubmitting(false)
        return
      }
      
      if (currentStep < 6) {
        setCurrentStep(currentStep + 1)
        window.scrollTo(0, 0)
      }
    } catch (err) {
      console.error('Onboarding Error:', err)
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to save step.'
      setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    if (currentStep > 1 && currentStep < 7) setCurrentStep(currentStep - 1)
  }

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Completion screen
  if (currentStep === 7) {
    return <CompletionScreen navigate={navigate} />
  }

  return (
    <div className="min-h-screen bg-[#f4f7fe] flex flex-col font-sans">
      {/* Header */}
      <Header currentStep={currentStep} navigate={navigate} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center py-16 px-6">
        <div className="max-w-4xl w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-[48px] p-12 shadow-xl border border-white"
            >
              {error && <ErrorAlert error={error} onClose={() => setError('')} />}
              
              <StepBadge currentStep={currentStep} />
              <StepTitle currentStep={currentStep} />
              
              <div className="min-h-[400px] mt-8">
                {currentStep === 1 && <Step1CompanyProfile data={formData} update={updateField} />}
                {currentStep === 2 && <Step2LegalEntity data={formData} update={updateField} />}
                {currentStep === 3 && <Step3TeamInvites data={formData} update={updateField} setFormData={setFormData} />}
                {currentStep === 4 && <Step4PayrollSetup data={formData} update={updateField} />}
                {currentStep === 5 && <Step5LeavePolicy data={formData} update={updateField} />}
                {currentStep === 6 && <Step6GoLive />}
              </div>

              {/* Navigation */}
              <NavigationButtons 
                currentStep={currentStep}
                isSubmitting={isSubmitting}
                onBack={handleBack}
                onNext={handleNext}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}

// ── Sub Components ─────────────────────────────────────────────────────────

const Header = ({ currentStep, navigate }) => (
  <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-8 py-4 sticky top-0 z-50">
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
          <Settings className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-base font-black text-slate-900 uppercase tracking-widest">Workspace Setup</h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-slate-400 font-bold uppercase">Active Session</span>
          </div>
        </div>
      </div>
      
      {/* Progress Tracker */}
      <div className="hidden lg:flex items-center gap-2">
        {STEPS.map((step) => (
          <div key={step.id} className="flex items-center">
            <div className={`h-10 w-10 rounded-2xl flex items-center justify-center text-xs font-black transition-all ${
              currentStep >= step.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'
            }`}>
              {currentStep > step.id ? <CheckCircle2 className="h-5 w-5" /> : step.id}
            </div>
            {step.id < 6 && <div className="w-6 h-0.5 mx-1 bg-slate-200 rounded-full" />}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase">Progress</p>
          <p className="text-sm font-black text-slate-900">{Math.round((currentStep / 6) * 100)}%</p>
        </div>
        <button onClick={() => navigate('/')} className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-400">
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  </header>
)

const ErrorAlert = ({ error, onClose }) => (
  <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold">
    <AlertCircle className="h-5 w-5" />
    {error}
    <button onClick={onClose} className="ml-auto"><X className="h-4 w-4" /></button>
  </div>
)

const StepBadge = ({ currentStep }) => (
  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 border border-blue-100/50">
    <span className="text-[10px] font-black uppercase">Step {currentStep} of 6</span>
    <div className="h-1 w-1 rounded-full bg-blue-300" />
    <span className="text-[10px] font-bold uppercase">{STEPS[currentStep-1].label}</span>
  </div>
)

const StepTitle = ({ currentStep }) => (
  <>
    <h2 className="text-4xl font-black text-slate-900 mt-6 mb-3">{STEPS[currentStep-1].label}</h2>
    <p className="text-slate-500 text-lg font-medium">{STEPS[currentStep-1].desc}</p>
  </>
)

const NavigationButtons = ({ currentStep, isSubmitting, onBack, onNext }) => (
  <div className="mt-16 flex items-center justify-between gap-6 pt-10 border-t border-slate-100/60">
    <button
      onClick={onBack}
      disabled={currentStep === 1 || isSubmitting}
      className="px-8 py-4 rounded-2xl font-black uppercase text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all flex items-center gap-3 disabled:opacity-0"
    >
      <ChevronLeft className="h-5 w-5" />
      Back
    </button>
    
    <button
      onClick={onNext}
      disabled={isSubmitting}
      className="px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-[24px] font-black uppercase hover:shadow-2xl transition-all flex items-center gap-3 group disabled:opacity-50"
    >
      {isSubmitting ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          Saving...
        </>
      ) : (
        <>
          {currentStep === 6 ? 'Complete Setup' : 'Save & Continue'}
          <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </>
      )}
    </button>
  </div>
)

// ── Step Components (to be continued in next message) ─────────────────────

export default NewOnboardingPage
