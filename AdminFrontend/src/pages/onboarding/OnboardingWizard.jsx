import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { 
  Building2, Globe, Users, Plane, Clock, 
  Banknote, CheckCircle2, ChevronRight, ChevronLeft, 
  Upload, MapPin, Briefcase, ShieldCheck, ArrowRight,
  Plus, Trash2, Calendar, FileText, Smartphone, Network,
  X, Info, Save, Settings, Loader2, Image as ImageIcon,
  Link2, Mail, Hash, CreditCard, Percent, Flag,
  UserPlus, Download, Sparkles, PartyPopper, AlertCircle,
  Check, Building, Landmark, Wallet, MoreHorizontal,
  Search, Clock3, CalendarDays, BadgeCheck
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import onboardingService from '../../services/onboardingService'

// ── STEP DEFINITIONS ─────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Company Profile',   icon: Building2, desc: 'Legal entity & brand identity' },
  { id: 2, label: 'Legal Entity',      icon: Briefcase, desc: 'First employer entity setup' },
  { id: 3, label: 'Invite Team',       icon: Users,     desc: 'Add admins & HR managers' },
  { id: 4, label: 'Payroll Config',    icon: Banknote,  desc: 'Pay cycles & salary setup' },
  { id: 5, label: 'Leave Policy',      icon: Plane,     desc: 'Time-off configuration' },
  { id: 6, label: 'Go Live',           icon: Sparkles,  desc: 'Complete & launch' },
]

// ── ROLE OPTIONS ─────────────────────────────────────────────────────────────
const ROLE_OPTIONS = [
  { value: 'hr_admin', label: 'Hr Admin', desc: 'Full HR management access' },
  { value: 'payroll_admin', label: 'Payroll Admin', desc: 'Manage payroll & compliance' },
  { value: 'sales_admin', label: 'Sales Admin', desc: 'Manage sales & leads' },
  { value: 'manager', label: 'Manager', desc: 'Manage team and resources' },
  { value: 'employee', label: 'Employee', desc: 'General employee access' },
]

// ── PAY FREQUENCY OPTIONS ────────────────────────────────────────────────────
const PAY_FREQUENCIES = [
  { value: 'weekly', label: 'Weekly', desc: '52 pay periods/year' },
  { value: 'biweekly', label: 'Bi-weekly', desc: '26 pay periods/year' },
  { value: 'semimonthly', label: 'Semi-monthly', desc: '24 pay periods/year' },
  { value: 'monthly', label: 'Monthly', desc: '12 pay periods/year' },
]

// ── ENTITY TYPES ─────────────────────────────────────────────────────────────
const ENTITY_TYPES = [
  { value: 'limited_company', label: 'Limited Company' },
  { value: 'llc', label: 'LLC' },
  { value: 'sole_trader', label: 'Sole Trader' },
  { value: 'plc', label: 'PLC (Public Limited Company)' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'llp', label: 'LLP (Limited Liability Partnership)' },
]

// ── COUNTRY DEFAULTS ───────────────────────────────────────────────────────────
const COUNTRY_DEFAULTS = {
  IN: { currency: 'INR', workingHours: 48, overtimeRule: 'factories_act', pfRequired: true, esiRequired: true, vatLabel: 'GSTIN', vatFormat: '15-char alphanumeric', vatPlaceholder: '22AAAAA0000A1Z5' },
  US: { currency: 'USD', workingHours: 40, overtimeRule: 'flsa', pfRequired: false, esiRequired: false, vatLabel: null, vatFormat: null, vatPlaceholder: null },
  GB: { currency: 'GBP', workingHours: 37.5, overtimeRule: 'wtr', pfRequired: false, esiRequired: false, vatLabel: 'VAT Reg No', vatFormat: '9-12 digits', vatPlaceholder: '123456789' },
  AU: { currency: 'AUD', workingHours: 38, overtimeRule: 'custom', pfRequired: false, esiRequired: false, vatLabel: 'ABN', vatFormat: '11 digits', vatPlaceholder: '12345678901' },
  CA: { currency: 'CAD', workingHours: 40, overtimeRule: 'custom', pfRequired: false, esiRequired: false, vatLabel: 'GST/HST', vatFormat: '9 digits + RT', vatPlaceholder: '123456789RT0001' },
}

// ── SALARY STRUCTURE TEMPLATES ───────────────────────────────────────────────
const SALARY_TEMPLATES = {
  US: { value: 'us_standard', label: 'US Standard', components: ['Base Salary', 'Federal Tax', 'State Tax', 'Social Security', 'Medicare', '401(k)'] },
  GB: { value: 'uk_paye', label: 'UK PAYE', components: ['Gross Salary', 'Income Tax', 'National Insurance', 'Pension', 'Student Loan'] },
  IN: { value: 'india_ctc', label: 'India CTC', components: ['Basic', 'HRA', 'DA', 'Special Allowance', 'PF (Employer)', 'ESI (Employer)', 'Gratuity', 'Professional Tax'] },
  CUSTOM: { value: 'custom', label: 'Custom Structure', components: ['Configure your own components'] },
}

// ── LEAVE POLICY TEMPLATES ───────────────────────────────────────────────────
const LEAVE_TEMPLATES = {
  US: { value: 'us_pto', label: 'US PTO Policy', annual: 15, sick: 10, carryForward: 5 },
  GB: { value: 'uk_statutory', label: 'UK Statutory Minimum', annual: 28, sick: 0, carryForward: 0, note: '28 days includes bank holidays' },
  IN: { value: 'india_statutory', label: 'India Statutory', annual: 21, sick: 12, carryForward: 30 },
  CUSTOM: { value: 'custom', label: 'Custom Policy', annual: 20, sick: 10, carryForward: 5 },
}

// ── PUBLIC HOLIDAYS BY COUNTRY ───────────────────────────────────────────────
const PUBLIC_HOLIDAYS = {
  IN: [
    { date: '2024-01-26', name: 'Republic Day', type: 'national' },
    { date: '2024-08-15', name: 'Independence Day', type: 'national' },
    { date: '2024-10-02', name: 'Gandhi Jayanti', type: 'national' },
    { date: '2024-05-01', name: 'Labour Day', type: 'national' },
    { date: '2024-12-25', name: 'Christmas', type: 'national' },
    { date: '2024-11-12', name: 'Diwali', type: 'optional' },
    { date: '2024-03-25', name: 'Holi', type: 'optional' },
  ],
  US: [
    { date: '2024-01-01', name: "New Year's Day", type: 'federal' },
    { date: '2024-01-15', name: 'Martin Luther King Jr. Day', type: 'federal' },
    { date: '2024-02-19', name: "Presidents' Day", type: 'federal' },
    { date: '2024-05-27', name: 'Memorial Day', type: 'federal' },
    { date: '2024-06-19', name: 'Juneteenth', type: 'federal' },
    { date: '2024-07-04', name: 'Independence Day', type: 'federal' },
    { date: '2024-09-02', name: 'Labor Day', type: 'federal' },
    { date: '2024-10-14', name: 'Columbus Day', type: 'federal' },
    { date: '2024-11-11', name: "Veterans Day", type: 'federal' },
    { date: '2024-11-28', name: 'Thanksgiving', type: 'federal' },
    { date: '2024-12-25', name: 'Christmas', type: 'federal' },
  ],
  GB: [
    { date: '2024-01-01', name: "New Year's Day", type: 'bank' },
    { date: '2024-03-29', name: 'Good Friday', type: 'bank' },
    { date: '2024-04-01', name: 'Easter Monday', type: 'bank' },
    { date: '2024-05-06', name: 'Early May Bank Holiday', type: 'bank' },
    { date: '2024-05-27', name: 'Spring Bank Holiday', type: 'bank' },
    { date: '2024-08-26', name: 'Summer Bank Holiday', type: 'bank' },
    { date: '2024-12-25', name: 'Christmas Day', type: 'bank' },
    { date: '2024-12-26', name: 'Boxing Day', type: 'bank' },
  ],
}

// ── INDIAN STATES ──────────────────────────────────────────────────────────────
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
]

// ── US STATES ──────────────────────────────────────────────────────────────────
const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming', 'District of Columbia',
]

// ── MONTHS ─────────────────────────────────────────────────────────────────────
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

// ── OVERTIME RULES ─────────────────────────────────────────────────────────────
const OVERTIME_RULES = {
  flsa: { label: 'FLSA (US)', desc: '1.5x after 40 hours/week' },
  wtr: { label: 'WTR (UK)', desc: '1.5x after 48 hours/week' },
  factories_act: { label: 'Factories Act (India)', desc: '2x after 48 hours/week' },
  custom: { label: 'Custom', desc: 'Define your own rules' },
}

// ── CONFETTI COMPONENT ────────────────────────────────────────────────────────
const Confetti = () => {
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            y: -20,
            rotate: 0,
            scale: Math.random() * 0.5 + 0.5,
          }}
          animate={{ 
            y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 20,
            rotate: Math.random() * 720 - 360,
          }}
          transition={{ 
            duration: Math.random() * 3 + 2,
            delay: Math.random() * 2,
            ease: 'linear',
          }}
          style={{
            position: 'absolute',
            width: Math.random() * 10 + 5,
            height: Math.random() * 10 + 5,
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            borderRadius: Math.random() > 0.5 ? '50%' : '0%',
          }}
        />
      ))}
    </div>
  )
}

// ── Helper: Restore Form Data from API Response ─────────────────────────────
const restoreFormDataFromApi = (apiData) => {
  if (!apiData) return {}
  
  const restored = {}
  
  // Step 1 data
  if (apiData.company_legal_name !== undefined) {
    restored.companyLegalName = apiData.company_legal_name || ''
    restored.tradingName = apiData.trading_name || ''
    restored.website = apiData.website || ''
    restored.companyRegNo = apiData.company_registration_no || ''
    restored.billingEmail = apiData.billing_contact_email || ''
    restored.vatGstNumber = apiData.vat_gst_number || ''
    restored.fiscalYearStart = apiData.fiscal_year_start 
      ? MONTHS[apiData.fiscal_year_start - 1] 
      : 'April'
    restored.companyLogo = apiData.company_logo || null
    
    restored.registeredAddress = {
      line1: apiData.address_line1 || '',
      line2: apiData.address_line2 || '',
      city: apiData.city || '',
      state: apiData.state || '',
      postalCode: apiData.postal_code || '',
      country: apiData.country || 'IN',
    }
  }
  
  // Step 2 data
  if (apiData.entity_legal_name !== undefined) {
    restored.entityLegalName = apiData.entity_legal_name || ''
    restored.entityType = apiData.entity_type || 'limited_company'
    restored.countryOfIncorporation = apiData.country_of_incorporation || 'IN'
    restored.taxEmployerId = apiData.tax_employer_id || ''
    restored.pfRegistrationNo = apiData.pf_registration_no || ''
    restored.esiRegistrationNo = apiData.esi_registration_no || ''
    restored.stateProvince = apiData.state_province || ''
    restored.payFrequency = apiData.pay_frequency || 'monthly'
    restored.currency = apiData.currency || 'INR'
    
    restored.bankAccount = {
      bankName: apiData.bank_details?.bank_name || '',
      accountNumber: apiData.bank_details?.account_number || '',
      ifscCode: apiData.bank_details?.ifsc_code || '',
      routingNumber: apiData.bank_details?.routing_number || '',
      sortCode: apiData.bank_details?.sort_code || '',
    }
  }
  
  // Step 3 data
  if (apiData.invitations !== undefined) {
    restored.invitations = apiData.invitations?.map((inv, idx) => ({
      id: idx,
      email: inv.email || '',
      role: inv.role || 'hr_admin',
      firstName: inv.first_name || '',
      lastName: inv.last_name || '',
    })) || []
  }
  
  // Step 4 data
  if (apiData.next_pay_date !== undefined) {
    restored.nextPayDate = apiData.next_pay_date || ''
    restored.salaryStructureTemplate = apiData.salary_structure_template || 'india_ctc'
    restored.defaultWorkingHours = apiData.default_working_hours || 48
    restored.overtimeRule = apiData.overtime_rules || 'factories_act'
  }
  
  // Step 5 data
  if (apiData.leave_policy_template !== undefined) {
    restored.leavePolicyTemplate = apiData.leave_policy_template || 'india_statutory'
    restored.annualLeaveDays = apiData.annual_leave_days || 21
    restored.sickLeaveDays = apiData.sick_leave_days || 12
    restored.leaveYearStart = apiData.leave_year_start 
      ? MONTHS[apiData.leave_year_start - 1] 
      : 'April'
    restored.carryForwardLimit = apiData.carry_forward_limit || 30
    restored.selectedPublicHolidays = apiData.public_holidays || []
  }
  
  return restored
}

// ── MAIN ONBOARDING WIZARD COMPONENT ─────────────────────────────────────────
const OnboardingWizard = () => {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)
  const [apiProgress, setApiProgress] = useState(null)
  
  // ── Form State ──
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('hrms_onboarding_data')
    const initialData = saved ? JSON.parse(saved) : {
      // Step 1: Company Profile
      companyLogo: null,
      companyLegalName: '',
      tradingName: '',
      website: '',
      companyRegNo: '',
      registeredAddress: { line1: '', line2: '', city: '', state: '', postalCode: '', country: 'IN' },
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
      bankAccount: { bankName: '', accountNumber: '', ifscCode: '', routingNumber: '', sortCode: '' },
      
      // Step 3: Invite Team Members
      invitations: [],
      
      // Step 4: Payroll Configuration
      nextPayDate: '',
      salaryStructureTemplate: 'india_ctc',
      defaultWorkingHours: 48,
      overtimeRule: 'factories_act',
      
      // Step 5: Leave Policy
      leavePolicyTemplate: 'india_statutory',
      annualLeaveDays: 21,
      sickLeaveDays: 12,
      leaveYearStart: 'April',
      carryForwardLimit: 30,
      selectedPublicHolidays: [],
      
      // Step 6: Completion tracking
      completedSteps: [],
    }
    return initialData
  })

  // ── Load Progress from API on Mount ──
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const token = session?.token || session?.user?.token || localStorage.getItem('access_token')
        if (!token) {
          setIsLoading(false)
          return
        }
        
        const response = await onboardingService.getProgress(token)
        setApiProgress(response.progress)
        
        // Restore form data from API if available
        if (response.step_data) {
          const restoredData = restoreFormDataFromApi(response.step_data)
          setFormData(prev => ({ ...prev, ...restoredData }))
        }
        
        // Set current step based on API progress
        if (response.current_step) {
          setCurrentStep(response.current_step)
        }
        
        // If already completed, redirect to dashboard
        if (response.progress?.is_completed) {
          navigate('/dashboard')
        }
      } catch (err) {
        console.error('Failed to load progress:', err)
        // Continue with localStorage data
      } finally {
        setIsLoading(false)
      }
    }
    
    loadProgress()
  }, [session])

  // Persistence to localStorage (backup)
  useEffect(() => {
    localStorage.setItem('hrms_onboarding_data', JSON.stringify(formData))
  }, [formData])

  const updateFormData = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const updateNested = (key, subKey, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: { ...prev[key], [subKey]: value },
    }))
  }

  // ── Save Current Step to API ──
  const saveCurrentStep = async () => {
    const token = session?.token || session?.user?.token || localStorage.getItem('access_token')
    if (!token) {
      throw new Error('No authentication token found')
    }
    
    switch (currentStep) {
      case 1:
        return await onboardingService.saveStep1CompanyProfile(formData, token)
      case 2:
        return await onboardingService.saveStep2LegalEntity(formData, token)
      case 3:
        return await onboardingService.saveStep3TeamInvitations(formData, token)
      case 4:
        return await onboardingService.saveStep4PayrollConfig(formData, token)
      case 5:
        return await onboardingService.saveStep5LeavePolicy(formData, token)
      case 6:
        return await onboardingService.completeOnboarding(token)
      default:
        return null
    }
  }

  const handleNext = async () => {
    setIsSubmitting(true)
    setError('')
    
    try {
      // Save current step to API
      const response = await saveCurrentStep()
      
      if (response?.progress) {
        setApiProgress(response.progress)
      }
      
      if (currentStep < 6) {
        setFormData(prev => ({
          ...prev,
          completedSteps: [...new Set([...prev.completedSteps, currentStep])],
        }))
        setCurrentStep(currentStep + 1)
        window.scrollTo(0, 0)
      } else {
        // Final step - show confetti and redirect
        setShowConfetti(true)
        localStorage.removeItem('hrms_onboarding_data')
        
        setTimeout(() => {
          navigate('/dashboard')
        }, 3000)
      }
    } catch (err) {
      console.error('Step save error:', err)
      setError(err.message || 'Failed to save step. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleSkipStep = async () => {
    // Skip step 3 — save with empty invitations, move to next step
    setIsSubmitting(true)
    setError('')
    try {
      await onboardingService.saveStep3TeamInvitations({ invitations: [] })
      setFormData(prev => ({
        ...prev,
        completedSteps: [...new Set([...prev.completedSteps, 3])],
      }))
      setCurrentStep(4)
      window.scrollTo(0, 0)
    } catch (err) {
      // Even if API fails, allow skip — invitations are optional
      setFormData(prev => ({
        ...prev,
        completedSteps: [...new Set([...prev.completedSteps, 3])],
      }))
      setCurrentStep(4)
      window.scrollTo(0, 0)
    } finally {
      setIsSubmitting(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.companyLegalName.trim() && formData.registeredAddress.line1.trim() && 
               formData.registeredAddress.city.trim() && formData.billingEmail.trim()
      case 2:
        return formData.entityLegalName.trim() && formData.taxEmployerId.trim()
      case 3:
        return true // Optional step
      case 4:
        return formData.nextPayDate && formData.defaultWorkingHours > 0
      case 5:
        return formData.annualLeaveDays >= 0 && formData.selectedPublicHolidays.length > 0
      case 6:
        return true
      default:
        return true
    }
  }

  const getStepProgress = () => {
    const requiredForStep = {
      1: ['companyLegalName', 'registeredAddress.line1', 'billingEmail'],
      2: ['entityLegalName', 'taxEmployerId'],
      3: [],
      4: ['nextPayDate'],
      5: ['selectedPublicHolidays'],
      6: [],
    }
    
    const required = requiredForStep[currentStep] || []
    if (required.length === 0) return 100
    
    let completed = 0
    required.forEach(field => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.')
        if (formData[parent]?.[child]?.trim()) completed++
      } else if (Array.isArray(formData[field])) {
        if (formData[field].length > 0) completed++
      } else if (formData[field]?.trim && formData[field].trim()) {
        completed++
      } else if (formData[field]) {
        completed++
      }
    })
    
    return Math.round((completed / required.length) * 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex flex-col font-sans">
      {showConfetti && <Confetti />}
      
      {/* ── Header ── */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-6 lg:px-8 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ rotate: 10 }} 
              className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200"
            >
              <Building2 className="h-6 w-6 text-white" />
            </motion.div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold text-slate-900 leading-none">HRMS Setup</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-slate-500 font-medium">Active Session</span>
              </div>
            </div>
          </div>
          
          {/* Progress Stepper */}
          <div className="hidden md:flex items-center gap-1">
            {STEPS.map((step) => (
              <div key={step.id} className="flex items-center">
                <motion.div 
                  className={`h-8 w-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    currentStep > step.id 
                      ? 'bg-emerald-500 text-white' 
                      : currentStep === step.id 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                        : 'bg-slate-100 text-slate-400'
                  }`}
                  whileHover={currentStep === step.id ? { scale: 1.05 } : {}}
                >
                  {currentStep > step.id ? <CheckCircle2 className="h-4 w-4" /> : <step.icon className="h-4 w-4" />}
                </motion.div>
                <div className="hidden lg:block ml-2">
                  <p className={`text-[10px] font-semibold ${currentStep === step.id ? 'text-slate-900' : 'text-slate-400'}`}>
                    {step.label}
                  </p>
                </div>
                {step.id < 6 && (
                  <div className="w-4 lg:w-8 h-0.5 mx-1 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-emerald-500"
                      initial={{ width: '0%' }}
                      animate={{ width: currentStep > step.id ? '100%' : '0%' }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-[10px] text-slate-500">Progress</p>
              <p className="text-sm font-bold text-slate-900">{Math.round(((currentStep - 1) / 6) * 100)}%</p>
            </div>
            <button 
              onClick={() => navigate('/dashboard')} 
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
              title="Exit setup"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col items-center py-8 lg:py-12 px-4 sm:px-6">
        <div className="max-w-5xl w-full">
          {isLoading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-3xl lg:rounded-[40px] p-12 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center justify-center min-h-[400px]"
            >
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
              <p className="text-slate-600 font-medium">Loading your progress...</p>
            </motion.div>
          ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl lg:rounded-[40px] p-6 lg:p-12 shadow-xl shadow-slate-200/50 border border-slate-100"
            >
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm"
                >
                  <AlertCircle className="h-5 w-5 flex-shrink-0" /> 
                  <span>{error}</span>
                </motion.div>
              )}
              
              {/* Step Header */}
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 mb-4 text-[11px] font-semibold uppercase tracking-wide">
                  <span>Step {currentStep} of 6</span>
                  <div className="h-1 w-1 rounded-full bg-blue-400" />
                  <span>{STEPS[currentStep-1].label}</span>
                </div>
                
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">
                      {STEPS[currentStep-1].label}
                    </h2>
                    <p className="text-slate-500 text-base max-w-xl">
                      {STEPS[currentStep-1].desc}
                    </p>
                  </div>
                  
                  {/* Progress Ring */}
                  <div className="hidden sm:flex items-center gap-3">
                    <div className="relative h-14 w-14">
                      <svg className="h-14 w-14 transform -rotate-90">
                        <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="3" fill="none" className="text-slate-100" />
                        <circle 
                          cx="28" 
                          cy="28" 
                          r="24" 
                          stroke="currentColor" 
                          strokeWidth="3" 
                          fill="none" 
                          className="text-blue-600 transition-all duration-500"
                          strokeDasharray={`${getStepProgress() * 1.51} 151`}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700">
                        {getStepProgress()}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step Content */}
              <div className="min-h-[400px]">
                {currentStep === 1 && (
                  <Step1CompanyProfile 
                    data={formData} 
                    update={updateFormData} 
                    updateNested={updateNested}
                  />
                )}
                {currentStep === 2 && (
                  <Step2LegalEntity 
                    data={formData} 
                    update={updateFormData} 
                    updateNested={updateNested}
                  />
                )}
                {currentStep === 3 && (
                  <Step3InviteTeam 
                    data={formData} 
                    update={updateFormData}
                  />
                )}
                {currentStep === 4 && (
                  <Step4PayrollConfig 
                    data={formData} 
                    update={updateFormData}
                    updateNested={updateNested}
                  />
                )}
                {currentStep === 5 && (
                  <Step5LeavePolicy 
                    data={formData} 
                    update={updateFormData}
                  />
                )}
                {currentStep === 6 && (
                  <Step6GoLive 
                    data={formData}
                    completedSteps={formData.completedSteps}
                    invitationCount={formData.invitations.length}
                  />
                )}
              </div>

              {/* Navigation */}
              <div className="mt-10 flex items-center justify-between gap-4 pt-6 border-t border-slate-100">
                <button
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="px-6 py-3 rounded-xl font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all flex items-center gap-2 disabled:opacity-0"
                >
                  <ChevronLeft className="h-5 w-5" />
                  Back
                </button>

                <div className="flex items-center gap-3">
                  {/* Skip button — only for step 3 */}
                  {currentStep === 3 && (
                    <button
                      onClick={handleSkipStep}
                      disabled={isSubmitting}
                      className="px-6 py-3 rounded-xl font-semibold text-slate-400 border border-slate-200 hover:bg-slate-50 hover:text-slate-600 transition-all disabled:opacity-50"
                    >
                      Skip for now
                    </button>
                  )}

                  <button
                    onClick={handleNext}
                    disabled={isSubmitting || !canProceed()}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-200 transition-all flex items-center gap-2 group active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Finalizing...
                      </>
                    ) : (
                      <>
                        {currentStep === 6 ? (
                          <>
                            <Sparkles className="h-5 w-5" />
                            Complete Setup & Launch
                          </>
                        ) : (
                          <>
                            {currentStep === 3 && formData.invitations.length > 0 ? 'Send Invites & Continue' : 'Continue'}
                            <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          )}

          {!isLoading && (
            <p className="mt-6 text-center text-[10px] font-medium text-slate-400">
              Secured with Enterprise-grade encryption · Data stored in your region
            </p>
          )}
        </div>
      </main>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 1: COMPANY PROFILE
// ═══════════════════════════════════════════════════════════════════════════════
const Step1CompanyProfile = ({ data, update, updateNested }) => {
  const fileInputRef = useRef(null)
  const [logoPreview, setLogoPreview] = useState(data.companyLogo)
  const [isDragging, setIsDragging] = useState(false)

  const countryDefaults = COUNTRY_DEFAULTS[data.registeredAddress.country] || COUNTRY_DEFAULTS.IN

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB')
        return
      }
      const reader = new FileReader()
      reader.onload = (event) => {
        setLogoPreview(event.target.result)
        update({ companyLogo: event.target.result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && (file.type.startsWith('image/') || file.type === 'image/svg+xml')) {
      handleLogoUpload({ target: { files: [file] } })
    }
  }

  const ensureHttps = (url) => {
    if (!url) return url
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`
    }
    return url
  }

  const getRegPlaceholder = () => {
    switch (data.registeredAddress.country) {
      case 'IN': return 'CIN/LLPIN (e.g., L12345MH6789ABC123456)'
      case 'US': return 'EIN (XX-XXXXXXX)'
      case 'GB': return 'Companies House number'
      default: return 'Company Registration Number'
    }
  }

  return (
    <div className="space-y-8">
      {/* Logo Upload */}
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex-shrink-0">
          <div 
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`h-32 w-32 rounded-full border-2 flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group ${
              isDragging 
                ? 'border-blue-500 bg-blue-50' 
                : logoPreview 
                  ? 'border-emerald-300' 
                  : 'border-dashed border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50'
            }`}
          >
            {logoPreview ? (
              <img src={logoPreview} alt="Logo preview" className="h-full w-full object-cover" />
            ) : (
              <>
                <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center mb-2 group-hover:bg-blue-200 transition-colors">
                  <ImageIcon className="h-6 w-6 text-slate-400 group-hover:text-blue-500" />
                </div>
                <span className="text-[10px] font-medium text-slate-500 text-center px-2">
                  Upload Logo
                </span>
              </>
            )}
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/png,image/svg+xml,image/jpeg" 
              className="hidden"
              onChange={handleLogoUpload}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-2 text-center">PNG/SVG, min 200×200px</p>
        </div>
        
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input 
            label="Company Legal Name *" 
            value={data.companyLegalName} 
            onChange={v => update({ companyLegalName: v })} 
            placeholder="e.g., Acme Corporation Ltd."
            required
          />
          <Input 
            label="Trading Name" 
            value={data.tradingName} 
            onChange={v => update({ tradingName: v })} 
            placeholder="Name shown on payslips (if different)"
            hint="Optional"
          />
          <Input 
            label="Website" 
            value={data.website} 
            onChange={v => update({ website: ensureHttps(v) })} 
            placeholder="https://company.com"
            icon={Link2}
          />
          <Input 
            label={`Company Registration No. (${data.registeredAddress.country === 'US' ? 'EIN' : data.registeredAddress.country === 'GB' ? 'Companies House' : 'CIN/LLPIN'})`}
            value={data.companyRegNo} 
            onChange={v => update({ companyRegNo: v })} 
            placeholder={getRegPlaceholder()}
            icon={Hash}
          />
        </div>
      </div>
      
      {/* Registered Address */}
      <div className="p-6 bg-slate-50 rounded-2xl space-y-5 border border-slate-100">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-slate-400" />
          <h4 className="text-sm font-semibold text-slate-700">Registered Address *</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="Address Line 1 *" 
            value={data.registeredAddress.line1} 
            onChange={v => updateNested('registeredAddress', 'line1', v)} 
            placeholder="Street address"
          />
          <Input 
            label="Address Line 2" 
            value={data.registeredAddress.line2} 
            onChange={v => updateNested('registeredAddress', 'line2', v)} 
            placeholder="Suite, floor, building (optional)"
          />
          <Input 
            label="City *" 
            value={data.registeredAddress.city} 
            onChange={v => updateNested('registeredAddress', 'city', v)} 
            placeholder="City"
          />
          <Input 
            label="State/Province *" 
            value={data.registeredAddress.state} 
            onChange={v => updateNested('registeredAddress', 'state', v)} 
            placeholder="State or Province"
          />
          <Input 
            label="Postal/ZIP Code *" 
            value={data.registeredAddress.postalCode} 
            onChange={v => updateNested('registeredAddress', 'postalCode', v)} 
            placeholder="Postal code"
          />
          <Select 
            label="Country *" 
            value={data.registeredAddress.country} 
            options={[
              { value: 'IN', label: 'India' },
              { value: 'US', label: 'United States' },
              { value: 'GB', label: 'United Kingdom' },
              { value: 'AU', label: 'Australia' },
              { value: 'CA', label: 'Canada' },
            ]}
            onChange={v => updateNested('registeredAddress', 'country', v)}
          />
        </div>
      </div>

      {/* Billing & Tax */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input 
          label="Billing Contact Email *" 
          type="email"
          value={data.billingEmail} 
          onChange={v => update({ billingEmail: v })} 
          placeholder="finance@company.com"
          icon={Mail}
          hint="Used for invoices and billing alerts"
        />
        
        {countryDefaults.vatLabel && (
          <Input 
            label={`${countryDefaults.vatLabel} (${countryDefaults.vatFormat})`}
            value={data.vatGstNumber} 
            onChange={v => update({ vatGstNumber: v })} 
            placeholder={countryDefaults.vatPlaceholder}
            icon={Percent}
          />
        )}
        
        <Select 
          label="Fiscal Year Start *" 
          value={data.fiscalYearStart} 
          options={MONTHS.map(m => ({ value: m, label: m }))}
          onChange={v => update({ fiscalYearStart: v })}
          hint="Determines your annual reporting periods"
        />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 2: FIRST LEGAL ENTITY
// ═══════════════════════════════════════════════════════════════════════════════
const Step2LegalEntity = ({ data, update, updateNested }) => {
  const countryDefaults = COUNTRY_DEFAULTS[data.countryOfIncorporation] || COUNTRY_DEFAULTS.IN
  
  useEffect(() => {
    // Auto-set currency based on country
    update({ currency: countryDefaults.currency })
  }, [data.countryOfIncorporation])

  const getTaxIdLabel = () => {
    switch (data.countryOfIncorporation) {
      case 'US': return 'EIN (Employer Identification Number) *'
      case 'GB': return 'PAYE Reference (Employer Reference Number) *'
      case 'IN': return 'TAN (Tax Deduction Account Number) *'
      default: return 'Tax / Employer ID *'
    }
  }

  const getTaxIdPlaceholder = () => {
    switch (data.countryOfIncorporation) {
      case 'US': return 'XX-XXXXXXX'
      case 'GB': return '123/AB456'
      case 'IN': return 'XXXXX0000X'
      default: return 'Tax ID'
    }
  }

  const getBankLabel = () => {
    switch (data.countryOfIncorporation) {
      case 'US': return 'Routing Number'
      case 'GB': return 'Sort Code'
      case 'IN': return 'IFSC Code'
      default: return 'Bank Code'
    }
  }

  const getBankPlaceholder = () => {
    switch (data.countryOfIncorporation) {
      case 'US': return '9-digit routing'
      case 'GB': return 'XX-XX-XX'
      case 'IN': return 'ABC0DEF1234'
      default: return 'Bank code'
    }
  }

  return (
    <div className="space-y-8">
      {/* Entity Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input 
          label="Entity Legal Name *" 
          value={data.entityLegalName} 
          onChange={v => update({ entityLegalName: v })} 
          placeholder="e.g., Acme Corp US LLC"
          icon={Building}
        />
        <Select 
          label="Entity Type *" 
          value={data.entityType} 
          options={ENTITY_TYPES}
          onChange={v => update({ entityType: v })}
        />
        <Select 
          label="Country of Incorporation *" 
          value={data.countryOfIncorporation} 
          options={[
            { value: 'IN', label: 'India' },
            { value: 'US', label: 'United States' },
            { value: 'GB', label: 'United Kingdom' },
            { value: 'AU', label: 'Australia' },
            { value: 'CA', label: 'Canada' },
          ]}
          onChange={v => update({ countryOfIncorporation: v })}
          hint="Drives statutory compliance requirements"
        />
        <Input 
          label={getTaxIdLabel()} 
          value={data.taxEmployerId} 
          onChange={v => update({ taxEmployerId: v })} 
          placeholder={getTaxIdPlaceholder()}
          icon={Hash}
        />
      </div>

      {/* India-specific fields */}
      {data.countryOfIncorporation === 'IN' && (
        <div className="p-6 bg-amber-50/50 rounded-2xl space-y-4 border border-amber-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-amber-600" />
            <h4 className="text-sm font-semibold text-amber-800">India Statutory Registrations</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="PF Registration No." 
              value={data.pfRegistrationNo} 
              onChange={v => update({ pfRegistrationNo: v })} 
              placeholder="e.g., MH/BAN/0000000"
              hint="Employer PF code from EPFO"
            />
            <Input 
              label="ESI Registration No." 
              value={data.esiRegistrationNo} 
              onChange={v => update({ esiRegistrationNo: v })} 
              placeholder="ESI employer code"
            />
          </div>
        </div>
      )}



      {/* Pay & Currency */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Select 
          label="Pay Frequency *" 
          value={data.payFrequency} 
          options={PAY_FREQUENCIES}
          onChange={v => update({ payFrequency: v })}
          hint="Sets payroll calendar"
        />
        <Select 
          label="Currency *" 
          value={data.currency} 
          options={[
            { value: 'INR', label: 'INR - Indian Rupee' },
            { value: 'USD', label: 'USD - US Dollar' },
            { value: 'GBP', label: 'GBP - British Pound' },
            { value: 'EUR', label: 'EUR - Euro' },
            { value: 'AUD', label: 'AUD - Australian Dollar' },
            { value: 'CAD', label: 'CAD - Canadian Dollar' },
          ]}
          onChange={v => update({ currency: v })}
          hint="Auto-set from country"
        />
      </div>


    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 3: INVITE TEAM MEMBERS
// ═══════════════════════════════════════════════════════════════════════════════
const Step3InviteTeam = ({ data, update }) => {
  const [newInvite, setNewInvite] = useState({ email: '', firstName: '', lastName: '', role: 'hr_admin' })
  const [showCSVModal, setShowCSVModal] = useState(false)
  const [csvData, setCsvData] = useState('')

  const addInvite = () => {
    if (!newInvite.email.trim() || !newInvite.email.includes('@')) {
      return
    }
    if (data.invitations.length >= 10) {
      alert('Maximum 10 invitations at a time')
      return
    }
    update({
      invitations: [...data.invitations, { ...newInvite, id: Date.now() }]
    })
    setNewInvite({ email: '', firstName: '', lastName: '', role: 'hr_admin' })
  }

  const removeInvite = (id) => {
    update({
      invitations: data.invitations.filter(inv => inv.id !== id)
    })
  }

  const getRoleLabel = (roleValue) => {
    return ROLE_OPTIONS.find(r => r.value === roleValue)?.label || roleValue
  }

  const downloadCSVTemplate = () => {
    const template = 'email,first_name,last_name,role\nexample@company.com,John,Doe,hr_admin\nhr@company.com,Jane,Smith,payroll_admin'
    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'team_invite_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const processCSV = () => {
    const lines = csvData.trim().split('\n')
    const newInvites = []
    
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',')
      if (cols.length >= 2 && cols[0].includes('@')) {
        newInvites.push({
          id: Date.now() + i,
          email: cols[0].trim(),
          firstName: cols[1]?.trim() || '',
          lastName: cols[2]?.trim() || '',
          role: ROLE_OPTIONS.find(r => r.value === cols[3]?.trim()) ? cols[3].trim() : 'hr_admin'
        })
      }
    }
    
    if (newInvites.length > 0) {
      update({ invitations: [...data.invitations, ...newInvites].slice(0, 10) })
      setShowCSVModal(false)
      setCsvData('')
    }
  }

  return (
    <div className="space-y-6">
      {/* Invite Row */}
      <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <Input 
              label="Email Address *" 
              type="email"
              value={newInvite.email} 
              onChange={v => setNewInvite({ ...newInvite, email: v })} 
              placeholder="colleague@company.com"
              icon={Mail}
            />
          </div>
          <Select 
            label="Role *" 
            value={newInvite.role} 
            options={ROLE_OPTIONS}
            onChange={v => setNewInvite({ ...newInvite, role: v })}
          />
          <button
            onClick={addInvite}
            disabled={!newInvite.email.includes('@') || data.invitations.length >= 10}
            className="px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Add Invite
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Input 
            label="First Name (optional)" 
            value={newInvite.firstName} 
            onChange={v => setNewInvite({ ...newInvite, firstName: v })} 
            placeholder="Pre-personalizes invite email"
          />
          <Input 
            label="Last Name (optional)" 
            value={newInvite.lastName} 
            onChange={v => setNewInvite({ ...newInvite, lastName: v })} 
            placeholder=""
          />
        </div>
      </div>

      {/* Invite Preview - Badge List */}
      {data.invitations.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-700">
              Invitations ({data.invitations.length}/10)
            </h4>
            <button 
              onClick={() => update({ invitations: [] })}
              className="text-xs text-red-500 hover:text-red-600"
            >
              Clear all
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {data.invitations.map(invite => (
              <motion.div 
                key={invite.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-full shadow-sm"
              >
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                  {invite.firstName?.[0]?.toUpperCase() || invite.email[0].toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-slate-700">{invite.email}</span>
                  <span className="text-[10px] text-slate-400">{getRoleLabel(invite.role)}</span>
                </div>
                <button 
                  onClick={() => removeInvite(invite.id)}
                  className="ml-1 p-1 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* CSV Upload */}
      <div className="flex items-center justify-between py-4 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-600">Bulk invite via CSV</span>
        </div>
        <button 
          onClick={() => setShowCSVModal(true)}
          className="text-sm text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1"
        >
          <Download className="h-4 w-4" />
          Invite from CSV
        </button>
      </div>

      {/* Skip Option */}
      <div className="p-4 bg-slate-50 rounded-xl text-center">
        <p className="text-sm text-slate-500">
          You can skip this step and invite team members later from{' '}
          <span className="font-semibold text-slate-700">Settings → Team</span>
        </p>
      </div>

      {/* CSV Modal */}
      <AnimatePresence>
        {showCSVModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">Bulk Invite via CSV</h3>
                <button onClick={() => setShowCSVModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium mb-2">Required columns:</p>
                  <code className="text-xs bg-white px-2 py-1 rounded">email, first_name, last_name, role</code>
                  <button 
                    onClick={downloadCSVTemplate}
                    className="mt-2 text-xs text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Download className="h-3 w-3" />
                    Download template
                  </button>
                </div>
                
                <textarea
                  value={csvData}
                  onChange={e => setCsvData(e.target.value)}
                  placeholder="Paste CSV data here...&#10;email,first_name,last_name,role&#10;john@company.com,John,Doe,hr_admin"
                  className="w-full h-40 p-3 border border-slate-200 rounded-xl text-sm font-mono resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowCSVModal(false)}
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={processCSV}
                    disabled={!csvData.trim()}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    Import Invites
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 4: PAYROLL CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════
const Step4PayrollConfig = ({ data, update, updateNested }) => {
  const template = SALARY_TEMPLATES[data.countryOfIncorporation === 'US' ? 'US' : data.countryOfIncorporation === 'GB' ? 'GB' : 'IN']
  
  const handleTemplateChange = (templateKey) => {
    update({ salaryStructureTemplate: templateKey })
    // Auto-set defaults based on country
    const country = data.countryOfIncorporation
    const defaults = COUNTRY_DEFAULTS[country] || COUNTRY_DEFAULTS.IN
    update({ 
      defaultWorkingHours: defaults.workingHours,
      overtimeRule: defaults.overtimeRule,
    })
  }

  return (
    <div className="space-y-8">
      {/* Next Pay Date */}
      <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="h-5 w-5 text-blue-600" />
          <h4 className="text-sm font-semibold text-slate-800">First Payroll Date</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="Next Pay Date *" 
            type="date"
            value={data.nextPayDate} 
            onChange={v => update({ nextPayDate: v })} 
            min={new Date().toISOString().split('T')[0]}
            hint="First payday on the platform. Must be a future date."
          />
        </div>
      </div>

      {/* Salary Structure Template */}
      <div className="space-y-4">
        <label className="text-sm font-semibold text-slate-700">Salary Structure Template *</label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(SALARY_TEMPLATES).map(([key, template]) => (
            <button
              key={key}
              onClick={() => handleTemplateChange(template.value)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                data.salaryStructureTemplate === template.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                  data.salaryStructureTemplate === template.value ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  <FileText className="h-4 w-4" />
                </div>
                <span className={`font-semibold ${data.salaryStructureTemplate === template.value ? 'text-blue-900' : 'text-slate-700'}`}>
                  {template.label}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {template.components.slice(0, 4).map((comp, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 bg-slate-100 rounded-full text-slate-600">
                    {comp}
                  </span>
                ))}
                {template.components.length > 4 && (
                  <span className="text-[10px] px-2 py-0.5 bg-slate-100 rounded-full text-slate-600">
                    +{template.components.length - 4} more
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Working Hours & Overtime */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <Clock3 className="h-4 w-4 text-slate-400" />
            <h4 className="text-sm font-semibold text-slate-700">Working Hours</h4>
          </div>
          
          <Input 
            label="Default Working Hours/Week *" 
            type="number"
            min={1}
            max={80}
            value={data.defaultWorkingHours} 
            onChange={v => update({ defaultWorkingHours: parseInt(v) || 0 })} 
            hint={`${data.countryOfIncorporation === 'US' ? 'US: 40' : data.countryOfIncorporation === 'GB' ? 'UK: 37.5' : 'India: 48'} (drives OT calculations)`}
          />
        </div>

        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <MoreHorizontal className="h-4 w-4 text-slate-400" />
            <h4 className="text-sm font-semibold text-slate-700">Overtime Rules</h4>
          </div>
          
          <Select 
            label="Overtime Rule *" 
            value={data.overtimeRule} 
            options={Object.entries(OVERTIME_RULES).map(([key, rule]) => ({
              value: key,
              label: rule.label,
              desc: rule.desc
            }))}
            onChange={v => update({ overtimeRule: v })}
            hint="Auto-set by region"
          />
          
          {OVERTIME_RULES[data.overtimeRule] && (
            <p className="text-xs text-slate-500 mt-2">
              {OVERTIME_RULES[data.overtimeRule].desc}
            </p>
          )}
        </div>
      </div>

      {/* Bank Details Skip Note */}
      <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">Bank details can be added later</p>
            <p className="text-xs text-amber-600 mt-1">
              You can add bank account details before running payroll in Settings → Payroll → Bank Accounts
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 5: LEAVE POLICY SETUP
// ═══════════════════════════════════════════════════════════════════════════════
const Step5LeavePolicy = ({ data, update }) => {
  const country = data.countryOfIncorporation || 'IN'
  const holidays = PUBLIC_HOLIDAYS[country] || PUBLIC_HOLIDAYS.IN

  const handleTemplateChange = (templateKey) => {
    const template = LEAVE_TEMPLATES[templateKey]
    update({
      leavePolicyTemplate: templateKey,
      annualLeaveDays: template.annual,
      sickLeaveDays: template.sick,
      carryForwardLimit: template.carryForward,
    })
  }

  const toggleHoliday = (holidayName) => {
    const current = data.selectedPublicHolidays || []
    if (current.includes(holidayName)) {
      update({ selectedPublicHolidays: current.filter(h => h !== holidayName) })
    } else {
      update({ selectedPublicHolidays: [...current, holidayName] })
    }
  }

  // Auto-select all national holidays on mount if none selected
  useEffect(() => {
    if (!data.selectedPublicHolidays || data.selectedPublicHolidays.length === 0) {
      const nationalHolidays = holidays.filter(h => h.type === 'national' || h.type === 'federal' || h.type === 'bank').map(h => h.name)
      update({ selectedPublicHolidays: nationalHolidays })
    }
  }, [])

  return (
    <div className="space-y-8">
      {/* Policy Template */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-slate-700">Leave Policy Template *</label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(LEAVE_TEMPLATES).map(([key, template]) => (
            <button
              key={key}
              onClick={() => handleTemplateChange(template.value)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                data.leavePolicyTemplate === template.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`font-semibold ${data.leavePolicyTemplate === template.value ? 'text-blue-900' : 'text-slate-700'}`}>
                  {template.label}
                </span>
                {data.leavePolicyTemplate === template.value && (
                  <Check className="h-5 w-5 text-blue-600" />
                )}
              </div>
              <div className="flex gap-2 text-xs">
                <span className="px-2 py-0.5 bg-slate-100 rounded-full text-slate-600">
                  {template.annual} days annual
                </span>
                <span className="px-2 py-0.5 bg-slate-100 rounded-full text-slate-600">
                  {template.sick} days sick
                </span>
              </div>
              {template.note && (
                <p className="text-[10px] text-slate-500 mt-2">{template.note}</p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Leave Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input 
          label="Annual Leave Days *" 
          type="number"
          min={0}
          max={365}
          value={data.annualLeaveDays} 
          onChange={v => update({ annualLeaveDays: parseInt(v) || 0 })} 
          hint={country === 'GB' ? 'UK statutory minimum: 28 days' : country === 'US' ? 'No federal minimum' : 'India Factories Act: 21 days'}
        />
        <Input 
          label="Sick Leave Days *" 
          type="number"
          min={0}
          max={365}
          value={data.sickLeaveDays} 
          onChange={v => update({ sickLeaveDays: parseInt(v) || 0 })} 
        />
        <Select 
          label="Leave Year Start *" 
          value={data.leaveYearStart} 
          options={MONTHS.map(m => ({ value: m, label: m }))}
          onChange={v => update({ leaveYearStart: v })}
          hint="Default: same as fiscal year start"
        />
        <Input 
          label="Carry Forward Limit *" 
          type="number"
          min={0}
          max={365}
          value={data.carryForwardLimit} 
          onChange={v => update({ carryForwardLimit: parseInt(v) || 0 })} 
          hint="Max days to next year. 0 = no carry-forward"
        />
      </div>

      {/* Public Holidays */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-700">Public Holidays *</label>
          <button 
            onClick={() => update({ selectedPublicHolidays: holidays.map(h => h.name) })}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            Select all
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {holidays.map(holiday => (
            <button
              key={holiday.name}
              onClick={() => toggleHoliday(holiday.name)}
              className={`p-3 rounded-xl border text-left transition-all ${
                data.selectedPublicHolidays?.includes(holiday.name)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  data.selectedPublicHolidays?.includes(holiday.name)
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-slate-300'
                }`}>
                  {data.selectedPublicHolidays?.includes(holiday.name) && (
                    <Check className="h-3.5 w-3.5 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${
                    data.selectedPublicHolidays?.includes(holiday.name) ? 'text-blue-900' : 'text-slate-700'
                  }`}>
                    {holiday.name}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {holiday.date} · {holiday.type}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
        
        <p className="text-xs text-slate-500">
          Employees can also select state/regional holidays after onboarding
        </p>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 6: GO LIVE CHECKLIST
// ═══════════════════════════════════════════════════════════════════════════════
const Step6GoLive = ({ data, completedSteps, invitationCount }) => {
  const checklist = [
    { id: 'email', label: 'Email verified', icon: BadgeCheck, status: true },
    { id: 'profile', label: 'Company profile', icon: Building2, status: completedSteps.includes(1) || data.companyLegalName },
    { id: 'entity', label: 'First entity configured', icon: Briefcase, status: completedSteps.includes(2) || data.entityLegalName },
    { id: 'team', label: `Team invited ${invitationCount > 0 ? `(${invitationCount} pending)` : '(skipped)'}`, icon: Users, status: true },
    { id: 'payroll', label: 'Payroll configured', icon: Banknote, status: completedSteps.includes(4) || data.nextPayDate },
    { id: 'leave', label: 'Leave policy set', icon: Plane, status: completedSteps.includes(5) || data.selectedPublicHolidays?.length > 0 },
  ]

  const completedCount = checklist.filter(item => item.status).length

  return (
    <div className="space-y-8">
      {/* Welcome Message */}
      <div className="text-center py-8">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="inline-flex items-center justify-center h-20 w-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full mb-6 shadow-lg shadow-emerald-200"
        >
          <PartyPopper className="h-10 w-10 text-white" />
        </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-slate-900 mb-2"
        >
          Ready to go live!
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-slate-500 max-w-md mx-auto"
        >
          Welcome to your HRMS Platform! Here's what you've accomplished:
        </motion.p>
      </div>

      {/* Setup Checklist */}
      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-slate-700">Setup Checklist</h4>
          <span className="text-xs font-medium text-slate-500">
            {completedCount}/{checklist.length} completed
          </span>
        </div>
        
        <div className="space-y-3">
          {checklist.map((item, index) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className={`flex items-center gap-3 p-3 rounded-xl ${
                item.status ? 'bg-emerald-50 border border-emerald-100' : 'bg-amber-50 border border-amber-100'
              }`}
            >
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                item.status ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-white'
              }`}>
                {item.status ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <item.icon className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${item.status ? 'text-emerald-900' : 'text-amber-900'}`}>
                  {item.label}
                </p>
              </div>
              {!item.status && (
                <span className="text-[10px] text-amber-600 font-medium bg-amber-100 px-2 py-0.5 rounded-full">
                  Optional
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Incomplete Items Note */}
      {completedCount < checklist.length && (
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">You can complete these later</p>
              <p className="text-xs text-amber-600 mt-1">
                Incomplete items won't block your dashboard access. Complete them from Settings when ready.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Invite Notification */}
      {invitationCount > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-3"
        >
          <Mail className="h-5 w-5 text-blue-600" />
          <p className="text-sm text-blue-800">
            <span className="font-semibold">{invitationCount}</span> invitation email{invitationCount > 1 ? 's' : ''} will be sent to your team
          </p>
        </motion.div>
      )}

      {/* Quick Start Link */}
      <div className="text-center">
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1">
          <FileText className="h-4 w-4" />
          View Quick Start Guide
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════
const Input = ({ label, value, onChange, placeholder, type = 'text', icon: Icon, hint, required, min, max, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      )}
      <input 
        type={type}
        value={value} 
        onChange={e => onChange(e.target.value)} 
        placeholder={placeholder}
        min={min}
        max={max}
        className={`w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
          Icon ? 'pl-10' : ''
        }`}
        {...props}
      />
    </div>
    {hint && <p className="text-[10px] text-slate-400">{hint}</p>}
  </div>
)

const Select = ({ label, value, options, onChange, hint, required }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <select 
        value={value} 
        onChange={e => onChange(e.target.value)}
        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 rotate-90 pointer-events-none" />
    </div>
    {hint && <p className="text-[10px] text-slate-400">{hint}</p>}
  </div>
)

export default OnboardingWizard
