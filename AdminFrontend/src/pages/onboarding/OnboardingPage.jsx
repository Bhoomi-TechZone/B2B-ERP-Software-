import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Building2, Globe, Users, Plane, Banknote, CheckCircle2, ChevronRight, ChevronLeft,
  Upload, Trash2, Calendar, X, Info, Settings, Loader2, User, Download, Sun, Moon, ArrowRight, Lock
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../context/ThemeContext'
import onboardingService from '../../services/onboardingService'
import { buildOnboardingUrl, buildSignInUrl, buildRegisterUrl, generateSessionToken } from '../../utils/authSession'

// ── Step Definitions & Slugs ─────────────────────────────────────────────────
const STEP_SLUGS = {
  1: 'company-profile',
  2: 'legal-entity',
  3: 'team-invitations',
  4: 'payroll-setup',
  5: 'leave-policy',
  6: 'workspace-launch',
  7: 'complete',
}
const STEPS = [
  { id: 1, label: 'Company Profile', short: 'Profile', icon: Building2, desc: 'Legal entity & brand details' },
  { id: 2, label: 'Legal Entity', short: 'Entity', icon: Globe, desc: 'Statutory compliance setup' },
  { id: 3, label: 'Invite Team', short: 'Team', icon: Users, desc: 'Add team members (optional)' },
  { id: 4, label: 'Payroll Setup', short: 'Payroll', icon: Banknote, desc: 'First payday & structure' },
  { id: 5, label: 'Leave Policy', short: 'Policy', icon: Plane, desc: 'Time-off management' },
  { id: 6, label: 'Go Live', short: 'Launch', icon: CheckCircle2, desc: 'Review & launch workspace' },
]

const FISCAL_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

// ── Regional State/Province Dictionaries ──────────────────────────────────────
const REGION_STATES = {
  'India': [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi (NCT)', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
  ],
  'United States': [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
    'Connecticut', 'Delaware', 'District of Columbia', 'Florida', 'Georgia',
    'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
    'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
    'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
    'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
    'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
    'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia',
    'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
  ],
  'United Kingdom': [
    'England', 'Scotland', 'Wales', 'Northern Ireland',
    'Greater London', 'West Midlands', 'Greater Manchester', 'West Yorkshire',
    'Merseyside', 'South Yorkshire', 'Tyne and Wear', 'Hampshire', 'Kent',
    'Essex', 'Lancashire', 'Surrey', 'Hertfordshire', 'Berkshire'
  ]
}

// ── Regional Statutory Tax Metadata ──────────────────────────────────────────
const REGION_TAX_INFO = {
  'India': {
    regNoLabel: 'CIN (Corporate Identity Number)',
    regNoPlaceholder: 'Enter CIN number',
    stateLabel: 'State / Union Territory',
    statePlaceholder: 'Select Indian State / UT',
    taxLabel: 'GST Number',
    taxHint: 'Mandatory for Indian GST compliance',
    taxPlaceholder: 'Enter GST number',
    postalLabel: 'Postal PIN Code',
    postalPlaceholder: 'Enter PIN code',
  },
  'United States': {
    regNoLabel: 'EIN / Corporate Filing Number',
    regNoPlaceholder: 'Enter EIN number',
    stateLabel: 'State',
    statePlaceholder: 'Select US State',
    taxLabel: 'State Sales Tax ID / EIN Reference',
    taxHint: 'State Department of Revenue ID or Federal EIN',
    taxPlaceholder: 'Enter State sales tax ID or EIN',
    postalLabel: 'ZIP Code',
    postalPlaceholder: 'Enter ZIP code',
  },
  'United Kingdom': {
    regNoLabel: 'Companies House CRN (Company Registration Number)',
    regNoPlaceholder: 'Enter CRN number',
    stateLabel: 'Country / County / Region',
    statePlaceholder: 'Select UK Country / County',
    taxLabel: 'VAT Number',
    taxHint: 'HMRC Value Added Tax identifier',
    taxPlaceholder: 'Enter VAT number',
    postalLabel: 'Postcode',
    postalPlaceholder: 'Enter Postcode',
  }
}

// ── Helper to resolve Country locked to the registered plan & region ─────────
const resolveLockedCountry = (savedData = {}) => {
  const reg = localStorage.getItem('registered_region') || localStorage.getItem('tenant_region')
  if (reg === 'US') return 'United States'
  if (reg === 'UK' || reg === 'GB' || reg === 'EU') return 'United Kingdom'
  if (reg === 'IN') return 'India'

  const savedCountry = localStorage.getItem('registered_country') || savedData.country || savedData.address?.country
  if (savedCountry && (savedCountry === 'India' || savedCountry === 'United States' || savedCountry === 'United Kingdom')) {
    return savedCountry
  }
  return 'India'
}

const ENTITY_TYPES = [
  { value: 'limited_company', label: 'Limited Company (Ltd / Pvt Ltd)' },
  { value: 'llc', label: 'Limited Liability Company (LLC)' },
  { value: 'sole_trader', label: 'Sole Proprietorship / Trader' },
  { value: 'plc', label: 'Public Limited Company (PLC)' },
  { value: 'partnership', label: 'General Partnership' },
  { value: 'llp', label: 'Limited Liability Partnership (LLP)' },
]

const PAY_FREQUENCIES = [
  { value: 'monthly', label: 'Monthly (Recommended)' },
  { value: 'semi_monthly', label: 'Semi-monthly (Twice a month)' },
  { value: 'bi_weekly', label: 'Bi-weekly (Every 2 weeks)' },
  { value: 'weekly', label: 'Weekly' },
]

const SALARY_TEMPLATES = [
  { value: 'india_ctc', label: 'India Standard CTC (Basic + HRA + Allowances)' },
  { value: 'us_standard', label: 'US Standard W2 Salary' },
  { value: 'uk_paye', label: 'UK Standard PAYE' },
  { value: 'custom', label: 'Custom Compensation Structure' },
]

const OVERTIME_RULES = [
  { value: 'factories_act', label: 'Factories Act Standard (2.0x standard rate)' },
  { value: 'flsa', label: 'FLSA Standard (1.5x after 40h)' },
  { value: 'wtr', label: 'WTR Standard' },
  { value: 'custom', label: 'Exempt / Custom Overtime Rules' },
]

const LEAVE_TEMPLATES = [
  { value: 'india_statutory', label: 'India Statutory Leave (Earned + Casual + Sick)' },
  { value: 'us_pto', label: 'US Flexible PTO' },
  { value: 'uk_statutory', label: 'UK Statutory Minimum (28 Days)' },
  { value: 'custom', label: 'Custom Leave Policy' },
]

const TEAM_ROLES = [
  { value: 'hr_admin', label: 'HR Administrator' },
  { value: 'payroll_admin', label: 'Payroll Administrator' },
  { value: 'sales_admin', label: 'Sales & CRM Admin' },
  { value: 'manager', label: 'Department Manager' },
  { value: 'employee', label: 'Team Member' },
]

/**
 * Modern High-Tech Orbital Spinner Component
 */
function ModernOrbitalSpinner({ size = 'default' }) {
  const isSmall = size === 'small'
  return (
    <div className={`relative ${isSmall ? 'w-5 h-5' : 'w-16 h-16'} flex items-center justify-center mx-auto`}>
      <div
        className="absolute inset-0 rounded-full blur-md opacity-50 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,107,0,0.4) 0%, transparent 70%)' }}
      />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
        className={`absolute inset-0 rounded-full border-2 border-transparent border-t-[#FF6B00] border-r-[#FFA447]/60`}
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        className={`absolute ${isSmall ? 'inset-1' : 'inset-2'} rounded-full border border-dashed border-[#FF7900]/40`}
      />
      {!isSmall && (
        <motion.div
          animate={{ scale: [0.85, 1.15, 0.85], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#FF6B00] to-[#FFA447] flex items-center justify-center shadow-[0_0_12px_rgba(255,107,0,0.6)]"
        >
          <div className="w-2 h-2 rounded-full bg-white" />
        </motion.div>
      )}
    </div>
  )
}

export default function OnboardingPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { session } = useAuth()
  const { isLight, toggleTheme } = useTheme()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [isCheckingProgress, setIsCheckingProgress] = useState(true)

  // Sync professional URL query whenever step changes
  useEffect(() => {
    if (currentStep <= 6) {
      const slug = STEP_SLUGS[currentStep] || 'company-profile'
      const sessionToken = searchParams.get('session_token') || generateSessionToken('onboarding')
      const ref = searchParams.get('ref') || 'verification'
      const newUrl = `/onboarding/workspace-setup?session_token=${sessionToken}&op=setup_wizard&step=${slug}&ref=${ref}&mode=workspace-setup`
      window.history.replaceState(null, '', newUrl)
    }
  }, [currentStep, searchParams])

  // ── Form State ─────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('wm_onboarding_data')
    let parsed = {}
    if (saved) {
      try {
        parsed = JSON.parse(saved)
      } catch (e) {
        console.error('Failed to parse onboarding data', e)
      }
    }
    const country = resolveLockedCountry(parsed)
    const states = REGION_STATES[country] || []
    const state = (parsed.address?.state && states.includes(parsed.address.state))
      ? parsed.address.state
      : (parsed.state && states.includes(parsed.state))
        ? parsed.state
        : (states[0] || 'Maharashtra')

    const countryCode = country === 'India' ? 'IN' : country === 'United States' ? 'US' : 'GB'
    const currencyCode = country === 'India' ? 'INR' : country === 'United States' ? 'USD' : 'GBP'
    const defaultFiscal = country === 'United States' ? 'January' : 'April'
    const registeredCompany = localStorage.getItem('registered_company_name') || ''
    const registeredEmail = localStorage.getItem('last_registered_email') || ''
    const registeredAdminName = localStorage.getItem('registered_admin_name') || ''
    const initialCompanyName = (parsed.legalName && parsed.legalName !== 'Company Name' && parsed.legalName.trim() !== '')
      ? parsed.legalName
      : (parsed.companyLegalName && parsed.companyLegalName !== 'Company Name' && parsed.companyLegalName.trim() !== '')
        ? parsed.companyLegalName
        : registeredCompany
    const initialBillingEmail = (parsed.billingEmail && parsed.billingEmail !== 'billing@company.com' && parsed.billingEmail.trim() !== '')
      ? parsed.billingEmail
      : registeredEmail
    const initialAdminName = parsed.adminName || registeredAdminName || ''
    const initialAdminEmail = parsed.adminEmail || initialBillingEmail || ''

    return {
      // Step 1: Admin & Company Profile
      companyLogo: parsed.companyLogo || null,
      companyLogoPreview: parsed.companyLogoPreview || null,
      adminName: initialAdminName,
      adminEmail: initialAdminEmail,
      legalName: initialCompanyName,
      companyLegalName: initialCompanyName,
      tradingName: parsed.tradingName || '',
      regNo: parsed.regNo || '',
      country,
      state,
      address: {
        line1: '',
        line2: '',
        city: '',
        postal: '',
        ...(parsed.address || {}),
        country,
        state,
      },
      billingEmail: initialBillingEmail,
      vatGstNumber: parsed.vatGstNumber || '',
      fiscalYearStart: parsed.fiscalYearStart || defaultFiscal,

      // Step 2: First Legal Entity
      entityLegalName: parsed.entityLegalName || initialCompanyName || '',
      entityType: parsed.entityType || 'limited_company',
      countryOfIncorporation: countryCode,
      taxEmployerId: parsed.taxEmployerId || '',
      pfRegistrationNo: parsed.pfRegistrationNo || '',
      esiRegistrationNo: parsed.esiRegistrationNo || '',
      stateProvince: parsed.stateProvince || state,
      payFrequency: parsed.payFrequency || 'monthly',
      currency: parsed.currency || currencyCode,
      bankName: parsed.bankName || '',
      accountNumber: parsed.accountNumber || '',
      routingNumber: parsed.routingNumber || '',

      // Step 3: Team Invitations
      invitations: parsed.invitations || [],
      skipTeamInvite: parsed.skipTeamInvite || false,

      // Step 4: Payroll Quick Setup
      nextPayDate: parsed.nextPayDate || '',
      salaryStructureTemplate: parsed.salaryStructureTemplate || (country === 'India' ? 'india_ctc' : 'standard_hourly'),
      defaultWorkingHours: parsed.defaultWorkingHours || 40,
      overtimeRules: parsed.overtimeRules || 'custom',

      // Step 5: Leave Policy
      leavePolicyTemplate: parsed.leavePolicyTemplate || (country === 'India' ? 'india_statutory' : 'standard_policy'),
      annualLeaveDays: parsed.annualLeaveDays || 21,
      sickLeaveDays: parsed.sickLeaveDays || 12,
      leaveYearStart: parsed.leaveYearStart || defaultFiscal,
      carryForwardLimit: parsed.carryForwardLimit || 5,
      publicHolidays: parsed.publicHolidays || (country === 'India' ? ['Republic Day', 'Independence Day', 'Gandhi Jayanti', 'Diwali', 'Holi'] : ["New Year's Day", 'Labor Day', 'Christmas Day']),
    }
  })

  // Persistence logic
  useEffect(() => {
    localStorage.setItem('wm_onboarding_data', JSON.stringify(formData))
  }, [formData])

  // ── Check progress on mount ────────────────────────────────────────────────
  useEffect(() => {
    const checkProgress = async () => {
      const token = session?.token || session?.user?.token || localStorage.getItem('access_token')

      if (!token) {
        navigate(buildRegisterUrl({ ref: 'onboarding_unauthenticated' }), { replace: true })
        return
      }

      try {
        const progress = await onboardingService.getProgress(token)
        if (progress.admin_name) {
          localStorage.setItem('registered_admin_name', progress.admin_name)
          setFormData(prev => ({
            ...prev,
            adminName: prev.adminName || progress.admin_name,
          }))
        }
        if (progress.admin_email) {
          localStorage.setItem('last_registered_email', progress.admin_email)
          setFormData(prev => ({
            ...prev,
            adminEmail: prev.adminEmail || progress.admin_email,
            billingEmail: prev.billingEmail || progress.admin_email,
          }))
        }
        if (progress.company_name) {
          const compName = progress.company_name
          localStorage.setItem('registered_company_name', compName)
          setFormData(prev => ({
            ...prev,
            legalName: prev.legalName && prev.legalName !== 'Company Name' && prev.legalName.trim() !== '' ? prev.legalName : compName,
            companyLegalName: prev.companyLegalName && prev.companyLegalName !== 'Company Name' && prev.companyLegalName.trim() !== '' ? prev.companyLegalName : compName,
            entityLegalName: prev.entityLegalName && prev.entityLegalName !== 'Company Name' && prev.entityLegalName.trim() !== '' ? prev.entityLegalName : compName,
          }))
        }
        if (progress.primary_region) {
          localStorage.setItem('registered_region', progress.primary_region)
          const countryMap = { IN: 'India', US: 'United States', UK: 'United Kingdom', GB: 'United Kingdom' }
          if (countryMap[progress.primary_region]) {
            localStorage.setItem('registered_country', countryMap[progress.primary_region])
          }
        }
        if (progress.is_completed) {
          navigate(buildSignInUrl({ ref: 'onboarding_completed' }), { replace: true })
          return
        }

        let nextStep = 1
        if (progress.step_6_completed) {
          nextStep = 7
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
        setCurrentStep(nextStep)
      } catch (err) {
        console.log('Could not fetch progress, starting fresh:', err)
      } finally {
        setIsCheckingProgress(false)
      }
    }

    checkProgress()
  }, [navigate, session])

  const handleNext = async () => {
    setIsSubmitting(true)
    setError('')

    try {
      const token = session?.token || session?.user?.token || localStorage.getItem('access_token')

      if (currentStep > 6) {
        setIsSubmitting(false)
        return
      }

      // Step 1: Company Profile
      if (currentStep === 1) {
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
        await onboardingService.updateStep(5, step5Data, token)
      } else if (currentStep === 6) {
        // Step 6: Completion
        await onboardingService.updateStep(6, {}, token)
        localStorage.removeItem('wm_onboarding_data')
        setCurrentStep(7)
        setIsSubmitting(false)
        return
      }

      if (currentStep < 6) {
        setCurrentStep(currentStep + 1)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch (err) {
      console.error('Onboarding Error:', err)
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to save step. Please check required fields.'
      setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // ── Loading Screen with Modern Orbital Spinner ─────────────────────────────
  if (isCheckingProgress) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${isLight ? 'bg-[#FBF9F7] text-gray-900' : 'bg-[#070202] text-white'}`}>
        <div className="text-center space-y-4">
          <ModernOrbitalSpinner />
          <h3 className="text-sm font-semibold tracking-wider uppercase text-[#FF6B00]">Loading Workspace Setup</h3>
          <p className="text-xs text-gray-400">Restoring your configuration progress...</p>
        </div>
      </div>
    )
  }

  // ── Completion Screen (Direct on Page, Clean Senti Design) ─────────────────
  if (currentStep === 7) {
    return (
      <div className={`min-h-screen flex flex-col justify-between p-6 sm:p-12 transition-colors duration-300 ${isLight ? 'bg-[#FBF9F7] text-gray-900' : 'bg-[#070202] text-white'}`}>
        <header className="flex items-center justify-between max-w-4xl w-full mx-auto">
          <div className="flex items-center gap-2.5">
            <svg className="w-6 h-6 text-[#FF6B00]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            <span className="text-lg font-bold tracking-tight">Senti</span>
          </div>
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl transition-all ${isLight ? 'bg-black/5 hover:bg-black/10 text-gray-700' : 'bg-white/5 hover:bg-white/10 text-neutral-300'}`}
          >
            {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </header>

        <main className="max-w-xl w-full mx-auto my-auto text-center py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#FF6B00]">Setup Complete</span>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Workspace is Ready</h1>
              <p className={`text-sm sm:text-base max-w-md mx-auto ${isLight ? 'text-gray-600' : 'text-neutral-400'}`}>
                Your enterprise workspace has been configured with legal entities, payroll schedule, and organizational policies.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate(buildSignInUrl({ ref: 'onboarding_complete_dashboard', mode: 'enterprise' }))}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#FF6B00] to-[#FF8533] hover:from-[#FF7900] hover:to-[#FF9447] text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-none"
              >
                Access Admin Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </main>

        <footer className="text-center py-4">
          <p className="text-[11px] font-medium tracking-wide uppercase text-neutral-500">
            Senti Enterprise Cloud · SOC-2 Type II Certified
          </p>
        </footer>
      </div>
    )
  }

  const activeStepMeta = STEPS[currentStep - 1]

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isLight ? 'bg-[#FBF9F7] text-gray-900' : 'bg-[#070202] text-white'}`}>
      {/* ── Top Bar / Minimal Header ── */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors ${isLight ? 'bg-[#FBF9F7]/90 border-gray-200/80' : 'bg-[#070202]/90 border-white/10'
        }`}>
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#FF6B00]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
              <span className="text-base font-bold tracking-tight">Senti</span>
            </div>
            <div className="h-4 w-[1px] bg-neutral-300 dark:bg-white/20 mx-1" />
            <span className={`text-xs font-medium tracking-wide ${isLight ? 'text-gray-500' : 'text-neutral-400'}`}>
              Workspace Setup
            </span>
          </div>

          {/* Minimal Step Tracker Pills */}
          <div className="hidden md:flex items-center gap-1.5">
            {STEPS.map((s) => {
              const isActive = s.id === currentStep
              const isDone = s.id < currentStep
              return (
                <div
                  key={s.id}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all ${isActive
                    ? 'bg-[#FF6B00]/15 text-[#FF6B00] font-semibold border border-[#FF6B00]/30'
                    : isDone
                      ? (isLight ? 'text-gray-700' : 'text-neutral-300')
                      : (isLight ? 'text-gray-400' : 'text-neutral-600')
                    }`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${isActive
                    ? 'bg-[#FF6B00] text-white'
                    : isDone
                      ? 'bg-emerald-500/20 text-emerald-500'
                      : (isLight ? 'bg-gray-200 text-gray-500' : 'bg-white/10 text-neutral-500')
                    }`}>
                    {isDone ? '✓' : s.id}
                  </span>
                  <span className="hidden lg:inline">{s.short}</span>
                </div>
              )
            })}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            <span className={`text-xs font-mono font-medium ${isLight ? 'text-gray-500' : 'text-neutral-400'}`}>
              {Math.round((currentStep / 6) * 100)}%
            </span>
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl transition-all ${isLight ? 'bg-black/5 hover:bg-black/10 text-gray-700' : 'bg-white/5 hover:bg-white/10 text-neutral-300'}`}
              title="Toggle theme"
            >
              {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            <button
              onClick={() => navigate('/')}
              className={`p-2 rounded-xl transition-all ${isLight ? 'hover:bg-black/5 text-gray-400 hover:text-gray-700' : 'hover:bg-white/10 text-neutral-500 hover:text-neutral-200'}`}
              title="Exit setup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Thin Orange Progress Indicator Bar */}
        <div className="w-full h-0.5 bg-neutral-200/50 dark:bg-white/5 overflow-hidden">
          <motion.div
            className="h-full bg-[#FF6B00]"
            animate={{ width: `${(currentStep / 6) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </header>

      {/* ── Main Canvas (NO ENCLOSING CARDS - Form sits directly on page canvas) ── */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-10 sm:py-14">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-8"
          >
            {/* Error Notification */}
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-start gap-3">
                <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{error}</div>
              </div>
            )}

            {/* Step Typography Header */}
            <div className="space-y-2 border-b pb-6 transition-colors border-neutral-200/80 dark:border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#FF6B00]">
                  Step 0{currentStep} / 06
                </span>
                <span className="text-neutral-400 text-xs">·</span>
                <span className={`text-[11px] font-semibold uppercase tracking-wider ${isLight ? 'text-gray-400' : 'text-neutral-500'}`}>
                  {activeStepMeta.label}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {activeStepMeta.label}
              </h1>
              <p className={`text-sm ${isLight ? 'text-gray-500' : 'text-neutral-400'}`}>
                {activeStepMeta.desc}. Fill in the details to establish accurate organizational compliance.
              </p>
            </div>

            {/* Direct Form Fields (No Card Wrapper) */}
            <div className="pt-2">
              {currentStep === 1 && <Step1Profile data={formData} update={setFormData} isLight={isLight} session={session} />}
              {currentStep === 2 && <Step2Region data={formData} update={setFormData} isLight={isLight} session={session} />}
              {currentStep === 3 && <Step3Org data={formData} update={setFormData} isLight={isLight} />}
              {currentStep === 4 && <Step4Leave data={formData} update={setFormData} isLight={isLight} />}
              {currentStep === 5 && <Step5Attendance data={formData} update={setFormData} isLight={isLight} />}
              {currentStep === 6 && <Step6Payroll data={formData} update={setFormData} isLight={isLight} />}
            </div>

            {/* Navigation Actions */}
            <div className={`pt-10 mt-12 border-t flex items-center justify-between gap-4 transition-colors ${isLight ? 'border-gray-200' : 'border-white/10'
              }`}>
              <button
                type="button"
                onClick={handleBack}
                disabled={currentStep === 1 || isSubmitting}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${currentStep === 1
                  ? 'opacity-0 pointer-events-none'
                  : isLight
                    ? 'text-gray-600 hover:text-gray-900 hover:bg-black/5'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous Step
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-[#FF6B00] to-[#FF8533] hover:from-[#FF7900] hover:to-[#FF9447] text-white rounded-xl text-sm font-medium active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-none"
              >
                {isSubmitting ? (
                  <>
                    <ModernOrbitalSpinner size="small" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>{currentStep === 6 ? 'Complete Onboarding' : 'Continue'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        <p className={`mt-16 text-center text-[11px] font-medium tracking-wide uppercase transition-colors ${isLight ? 'text-gray-400' : 'text-neutral-600'
          }`}>
          Senti Enterprise Platform · High Assurance Data Security
        </p>
      </main>
    </div>
  )
}

// ── MINIMAL FORM CONTROLS (RENDER DIRECTLY ON PAGE CANVAS) ───────────────────

function FieldLabel({ label, required, hint, isLight }) {
  return (
    <div className="flex items-center justify-between mb-1.5">
      <label className={`text-[12px] font-medium tracking-wide transition-colors ${isLight ? 'text-gray-800' : 'text-neutral-200'
        }`}>
        {label}
        {required && <span className="text-[#FF6B00] ml-1 font-bold">*</span>}
      </label>
      {hint && (
        <span className={`text-[11px] font-normal tracking-tight ${isLight ? 'text-gray-500' : 'text-neutral-400'}`}>
          {hint}
        </span>
      )}
    </div>
  )
}

function InputField({ label, required, hint, value, onChange, placeholder, type = 'text', isLight, ...props }) {
  return (
    <div className="w-full">
      {label && <FieldLabel label={label} required={required} hint={hint} isLight={isLight} />}
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-xl px-4 py-2.5 text-sm transition-all outline-none ${isLight
            ? 'bg-white border border-gray-300/80 text-gray-900 placeholder:text-gray-400 hover:border-gray-400 focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/15'
            : 'bg-white/[0.03] border border-white/10 text-white placeholder:text-neutral-500 hover:border-white/20 focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20'
          }`}
        {...props}
      />
    </div>
  )
}

function SelectField({ label, required, hint, value, options, onChange, placeholder, isLight }) {
  return (
    <div className="w-full">
      {label && <FieldLabel label={label} required={required} hint={hint} isLight={isLight} />}
      <div className="relative">
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded-xl px-4 py-2.5 text-sm transition-all outline-none appearance-none cursor-pointer pr-10 ${isLight
              ? 'bg-white border border-gray-300/80 text-gray-900 hover:border-gray-400 focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/15'
              : 'bg-[#120504] border border-white/10 text-white hover:border-white/20 focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20'
            }`}
        >
          {placeholder && (
            <option value="" disabled className={isLight ? 'bg-white text-gray-400' : 'bg-[#120504] text-neutral-500'}>
              {placeholder}
            </option>
          )}
          {options.map((o) => {
            const val = typeof o === 'string' ? o : o.value
            const lbl = typeof o === 'string' ? o : o.label
            return (
              <option key={val} value={val} className={isLight ? 'bg-white text-gray-900' : 'bg-[#120504] text-white'}>
                {lbl}
              </option>
            )
          })}
        </select>
        <ChevronRight className={`absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 rotate-90 pointer-events-none ${isLight ? 'text-gray-400' : 'text-neutral-500'
          }`} />
      </div>
    </div>
  )
}

function SectionHeading({ number, title, description, isLight }) {
  return (
    <div className="pt-6 pb-2.5 border-b mb-6 transition-colors border-neutral-200/60 dark:border-white/5">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-mono font-semibold text-[#FF6B00]">{number}</span>
        <h3 className="text-xs sm:text-sm font-semibold tracking-wider uppercase">{title}</h3>
      </div>
      {description && (
        <p className={`text-xs mt-1 font-normal ${isLight ? 'text-gray-500' : 'text-neutral-400'}`}>
          {description}
        </p>
      )}
    </div>
  )
}

// ── STEP 1: COMPANY PROFILE ──────────────────────────────────────────────────
function Step1Profile({ data, update, isLight, session }) {
  const [logoPreview, setLogoPreview] = useState(data.companyLogoPreview || null)
  const fileInputRef = useRef(null)

  const currentCountry = resolveLockedCountry(data)
  const taxInfo = REGION_TAX_INFO[currentCountry] || REGION_TAX_INFO['India']
  const stateOptions = REGION_STATES[currentCountry] || []
  const currentState = (data.address?.state && stateOptions.includes(data.address.state))
    ? data.address.state
    : (data.state && stateOptions.includes(data.state))
      ? data.state
      : (stateOptions[0] || '')

  // Resolve pre-registered admin details & company name from session or localStorage
  const registeredAdminName = session?.user?.name || `${session?.user?.firstName || ''} ${session?.user?.lastName || ''}`.trim() || localStorage.getItem('registered_admin_name') || ''
  const registeredAdminEmail = session?.user?.email || localStorage.getItem('last_registered_email') || ''
  const registeredCompany = session?.tenant?.name || session?.user?.tenant?.name || localStorage.getItem('registered_company_name') || ''
  const companyName = data.legalName || data.companyLegalName || registeredCompany || ''
  const adminName = data.adminName || registeredAdminName || ''
  const adminEmail = data.adminEmail || registeredAdminEmail || ''

  useEffect(() => {
    let changed = false
    const updated = { ...data }
    if ((!data.legalName || data.legalName === 'Company Name' || data.legalName.trim() === '') && registeredCompany) {
      updated.legalName = registeredCompany
      updated.companyLegalName = registeredCompany
      updated.entityLegalName = data.entityLegalName || registeredCompany
      changed = true
    }
    if (!data.adminName && registeredAdminName) {
      updated.adminName = registeredAdminName
      changed = true
    }
    if (!data.adminEmail && registeredAdminEmail) {
      updated.adminEmail = registeredAdminEmail
      if (!data.billingEmail) updated.billingEmail = registeredAdminEmail
      changed = true
    }
    if (changed) update(updated)
  }, [registeredCompany, registeredAdminName, registeredAdminEmail])

  const handleLogoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!['image/png', 'image/svg+xml', 'image/jpeg'].includes(file.type)) {
        alert('Please upload PNG, SVG, or JPG image')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result)
        update({ ...data, companyLogo: file, companyLogoPreview: reader.result })
      }
      reader.readAsDataURL(file)
    }
  }

  const removeLogo = () => {
    setLogoPreview(null)
    update({ ...data, companyLogo: null, companyLogoPreview: null })
  }

  const getInitials = () => {
    const name = data.adminName || adminName || data.legalName || companyName || 'AD'
    return name.split(' ').filter(Boolean).map(word => word[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className="space-y-6">
      {/* 01 / Admin Profile */}
      <SectionHeading number="01" title="Administrator Profile" isLight={isLight} />

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Circular Admin Profile Avatar Zone */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative group">
            {logoPreview ? (
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#FF6B00]/40 relative shadow-sm">
                <img src={logoPreview} alt="Admin Profile" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={removeLogo}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white rounded-full"
                  title="Remove photo"
                >
                  <Trash2 className="w-5 h-5 text-red-400" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`w-24 h-24 rounded-full border-2 border-dashed flex flex-col items-center justify-center text-center p-2 transition-all relative ${isLight
                  ? 'border-gray-300 hover:border-[#FF6B00] bg-gray-50/50 hover:bg-[#FF6B00]/5 text-gray-500'
                  : 'border-white/15 hover:border-[#FF6B00] bg-white/[0.02] hover:bg-[#FF6B00]/5 text-neutral-400'
                  }`}
              >
                {getInitials() ? (
                  <span className="text-xl font-bold text-[#FF6B00]">{getInitials()}</span>
                ) : (
                  <User className="w-7 h-7 mb-1 text-[#FF6B00] opacity-80" />
                )}
                <span className="text-[9px] font-medium tracking-tight mt-0.5">Upload</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/svg+xml,image/jpeg"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </div>
          <span className="text-[10px] font-mono text-neutral-400">Admin Photo · &lt; 5MB</span>
        </div>

        {/* Admin Identity Inputs */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          <InputField
            label="Administrator Name"
            required
            value={data.adminName || adminName}
            onChange={(v) => update({ ...data, adminName: v })}
            placeholder="Enter administrator name"
            isLight={isLight}
          />
          <InputField
            label="Work Email"
            required
            type="email"
            value={data.adminEmail || adminEmail}
            onChange={(v) => update({ ...data, adminEmail: v, billingEmail: data.billingEmail || v })}
            placeholder="Enter work email"
            isLight={isLight}
          />
        </div>
      </div>

      {/* 02 / Registered Address & Jurisdiction */}
      <SectionHeading
        number="02"
        title="Registered Address & Statutory Jurisdiction"
        description={`Statutory state compliance and tax identifiers configured for ${currentCountry}`}
        isLight={isLight}
      />

      {/* Row 1: Country Jurisdiction (Locked to Plan Region) & Fiscal Year Begins */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <FieldLabel
            label="Country Jurisdiction"
            required
            isLight={isLight}
          />
          <div
            className={`w-full rounded-xl px-4 py-2.5 text-xs font-medium flex items-center border cursor-not-allowed select-none transition-all ${isLight
                ? 'bg-gray-100/90 border-gray-200 text-gray-800'
                : 'bg-white/[0.04] border-white/10 text-neutral-200'
              }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base select-none">
                {currentCountry === 'United States' ? '🇺🇸' : currentCountry === 'United Kingdom' ? '🇬🇧' : '🇮🇳'}
              </span>
              <span className="font-semibold tracking-wide">{currentCountry}</span>
            </div>
          </div>
        </div>
        <SelectField
          label="Fiscal Year Begins"
          required
          value={data.fiscalYearStart || (currentCountry === 'United States' ? 'January' : 'April')}
          options={FISCAL_MONTHS}
          onChange={(v) => update({ ...data, fiscalYearStart: v })}
          isLight={isLight}
        />
      </div>

      {/* Address Line 1 */}
      <div className="pt-1">
        <InputField
          label="Address Line 1"
          required
          value={data.address?.line1 || data.addressLine1}
          onChange={(v) => update({ ...data, address: { ...(data.address || {}), line1: v }, addressLine1: v })}
          placeholder="Enter street address, building or floor"
          isLight={isLight}
        />
      </div>

      {/* Address Line 2 */}
      <div className="pt-1">
        <InputField
          label="Address Line 2"
          hint="Optional"
          value={data.address?.line2 || data.addressLine2}
          onChange={(v) => update({ ...data, address: { ...(data.address || {}), line2: v }, addressLine2: v })}
          placeholder="Enter apartment, suite, unit, or floor (optional)"
          isLight={isLight}
        />
      </div>

      {/* Row 3: City, State Dropdown (as per region!), and Postal Code */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
        <InputField
          label="City"
          required
          value={data.address?.city || data.city}
          onChange={(v) => update({ ...data, address: { ...(data.address || {}), city: v }, city: v })}
          placeholder="Enter city"
          isLight={isLight}
        />
        <SelectField
          label={taxInfo.stateLabel}
          required
          placeholder={taxInfo.statePlaceholder}
          value={currentState}
          options={stateOptions}
          onChange={(v) => update({ ...data, address: { ...(data.address || {}), state: v }, state: v, stateProvince: v })}
          isLight={isLight}
        />
        <InputField
          label={taxInfo.postalLabel}
          required
          value={data.address?.postal || data.postalCode}
          onChange={(v) => update({ ...data, address: { ...(data.address || {}), postal: v }, postalCode: v })}
          placeholder={taxInfo.postalPlaceholder}
          isLight={isLight}
        />
      </div>

      {/* Row 4: Professional Regional Tax Number (GST for India / VAT for UK / Sales Tax for US) */}
      <div className="pt-2">
        <InputField
          label={taxInfo.taxLabel}
          required={currentCountry === 'India' || currentCountry === 'United Kingdom'}
          hint={taxInfo.taxHint}
          value={data.vatGstNumber}
          onChange={(v) => update({ ...data, vatGstNumber: v.toUpperCase() })}
          placeholder={taxInfo.taxPlaceholder}
          maxLength={currentCountry === 'India' ? 15 : undefined}
          isLight={isLight}
        />
        {currentCountry === 'India' && data.vatGstNumber && data.vatGstNumber.trim().length >= 15 && !/^[0-9]{2}[A-Z0-9]{13}$/i.test(data.vatGstNumber.trim()) && (
          <p className="text-[12px] text-rose-500 font-medium mt-1.5 flex items-center gap-1.5">
            Please enter a valid GST number
          </p>
        )}
        {currentCountry === 'United Kingdom' && data.vatGstNumber && data.vatGstNumber.replace(/\s+/g, '').length >= 9 && !/^(GB)?\d{9}$/i.test(data.vatGstNumber.replace(/\s+/g, '')) && (
          <p className="text-[12px] text-rose-500 font-medium mt-1.5 flex items-center gap-1.5">
            Please enter a valid VAT number
          </p>
        )}
      </div>
    </div>
  )
}

// ── STEP 2: FIRST LEGAL ENTITY ────────────────────────────────────────────────
function Step2Region({ data, update, isLight, session }) {
  const registeredCompany = session?.tenant?.name || session?.user?.tenant?.name || localStorage.getItem('registered_company_name') || data.legalName || data.companyLegalName || ''
  const registeredEmail = session?.user?.email || localStorage.getItem('last_registered_email') || data.adminEmail || ''

  useEffect(() => {
    if ((!data.entityLegalName || data.entityLegalName === 'Entity Name' || data.entityLegalName.trim() === '') && registeredCompany) {
      update({ ...data, entityLegalName: registeredCompany })
    }
  }, [registeredCompany])

  useEffect(() => {
    const currencyMap = { IN: 'INR', US: 'USD', GB: 'GBP' }
    const newCurrency = currencyMap[data.countryOfIncorporation] || 'INR'
    if (data.currency !== newCurrency) {
      update({ ...data, currency: newCurrency })
    }
  }, [data.countryOfIncorporation])

  const countryKey = data.countryOfIncorporation === 'US' ? 'United States' : data.countryOfIncorporation === 'GB' ? 'United Kingdom' : 'India'
  const step2States = REGION_STATES[countryKey] || []
  const step2TaxInfo = REGION_TAX_INFO[countryKey] || REGION_TAX_INFO['India']

  const getTaxIdLabel = () => {
    const labels = {
      IN: 'TAN (Tax Deduction Account Number)',
      US: 'EIN (Employer Identification Number)',
      GB: 'ERN (PAYE Reference)',
    }
    return labels[data.countryOfIncorporation] || 'Tax / Employer Identification Number'
  }

  const getTaxIdPlaceholder = () => {
    const placeholders = {
      IN: 'Enter TAN number',
      US: 'Enter EIN number',
      GB: 'Enter ERN number',
    }
    return placeholders[data.countryOfIncorporation] || 'Enter tax identification number'
  }

  const showIndiaFields = data.countryOfIncorporation === 'IN'

  return (
    <div className="space-y-6">
      <SectionHeading number="01" title="Legal Structure" isLight={isLight} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          label="Entity Legal Name"
          required
          value={data.entityLegalName || registeredCompany}
          onChange={(v) => update({ ...data, entityLegalName: v })}
          placeholder="Enter legal entity name"
          isLight={isLight}
        />
        <SelectField
          label="Entity Classification"
          required
          value={data.entityType}
          options={ENTITY_TYPES}
          onChange={(v) => update({ ...data, entityType: v })}
          isLight={isLight}
        />
      </div>

      {/* Row 2: Statutory CIN / Reg Number & Billing Contact Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        <InputField
          label={step2TaxInfo.regNoLabel}
          value={data.regNo || data.companyRegNo}
          onChange={(v) => update({ ...data, regNo: v, companyRegNo: v })}
          placeholder={step2TaxInfo.regNoPlaceholder}
          isLight={isLight}
        />
        <InputField
          label="Billing Contact Email"
          required
          type="email"
          value={data.billingEmail || registeredEmail}
          onChange={(v) => update({ ...data, billingEmail: v })}
          placeholder="Enter billing contact email address"
          isLight={isLight}
        />
      </div>

      <SectionHeading number="02" title="Statutory Registration & Tax Jurisdiction" isLight={isLight} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <FieldLabel
            label="Country of Incorporation"
            required
            isLight={isLight}
          />
          <div
            className={`w-full rounded-xl px-4 py-2.5 text-xs font-medium flex items-center border cursor-not-allowed select-none transition-all ${isLight
                ? 'bg-gray-100/90 border-gray-200 text-gray-800'
                : 'bg-white/[0.04] border-white/10 text-neutral-200'
              }`}
          >
            <div className="flex items-center gap-2">
              <span>{data.countryOfIncorporation === 'US' ? '🇺🇸' : data.countryOfIncorporation === 'GB' ? '🇬🇧' : '🇮🇳'}</span>
              <span className="font-semibold">{data.countryOfIncorporation === 'US' ? 'United States (US)' : data.countryOfIncorporation === 'GB' ? 'United Kingdom (UK)' : 'India (IN)'}</span>
            </div>
          </div>
        </div>
        <SelectField
          label={step2TaxInfo.stateLabel}
          required
          value={data.stateProvince || data.address?.state || (step2States[0] || '')}
          options={step2States}
          onChange={(v) => update({ ...data, stateProvince: v })}
          isLight={isLight}
        />
        <InputField
          label={getTaxIdLabel()}
          required
          value={data.taxEmployerId}
          onChange={(v) => update({ ...data, taxEmployerId: v })}
          placeholder={getTaxIdPlaceholder()}
          isLight={isLight}
        />
      </div>

      {showIndiaFields && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <InputField
            label="PF Registration Number"
            hint="Provident Fund Code"
            value={data.pfRegistrationNo}
            onChange={(v) => update({ ...data, pfRegistrationNo: v })}
            placeholder="Enter PF establishment code (optional)"
            isLight={isLight}
          />
          <InputField
            label="ESI Registration Number"
            hint="Employee State Insurance"
            value={data.esiRegistrationNo}
            onChange={(v) => update({ ...data, esiRegistrationNo: v })}
            placeholder="Enter ESI registration number (optional)"
            isLight={isLight}
          />
        </div>
      )}

      <SectionHeading number="03" title="Payroll Parameters" isLight={isLight} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectField
          label="Disbursement Frequency"
          required
          value={data.payFrequency}
          options={PAY_FREQUENCIES}
          onChange={(v) => update({ ...data, payFrequency: v })}
          isLight={isLight}
        />
        <SelectField
          label="Base Operating Currency"
          required
          value={data.currency}
          options={[
            { value: 'INR', label: 'INR (₹) - Indian Rupee' },
            { value: 'USD', label: 'USD ($) - US Dollar' },
            { value: 'GBP', label: 'GBP (£) - British Pound' },
          ]}
          onChange={(v) => update({ ...data, currency: v })}
          isLight={isLight}
        />
      </div>
    </div>
  )
}

// ── STEP 3: INVITE TEAM MEMBERS ───────────────────────────────────────────────
function Step3Org({ data, update, isLight }) {
  const invitations = data.invitations || []

  const addInvitation = () => {
    if (invitations.length < 10) {
      const newInv = [
        ...invitations,
        { id: Date.now(), email: '', role: 'hr_admin', first_name: '', last_name: '' }
      ]
      update({ ...data, invitations: newInv, skipTeamInvite: false })
    }
  }

  const removeInvitation = (id) => {
    const newInv = invitations.filter(inv => inv.id !== id)
    update({ ...data, invitations: newInv })
  }

  const updateInvitation = (id, field, value) => {
    const newInv = invitations.map(inv => inv.id === id ? { ...inv, [field]: value } : inv)
    update({ ...data, invitations: newInv })
  }

  const handleSkip = () => {
    update({ ...data, skipTeamInvite: true, invitations: [] })
  }

  return (
    <div className="space-y-6">
      <SectionHeading number="01" title="Initial Team Invites" description="Invite core administrators now or skip and invite everyone later from Settings." isLight={isLight} />

      {/* Invitations directly on page */}
      {invitations.length > 0 && (
        <div className="space-y-4">
          {invitations.map((inv, idx) => (
            <div
              key={inv.id}
              className={`p-4 rounded-xl border transition-colors ${isLight ? 'bg-white border-gray-200' : 'bg-white/[0.02] border-white/10'
                }`}
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-200/50 dark:border-white/5">
                <span className="text-xs font-semibold text-[#FF6B00] uppercase tracking-wider">
                  Member #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeInvitation(inv.id)}
                  className="text-neutral-400 hover:text-red-500 text-xs flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <InputField
                    label="Work Email"
                    required
                    type="email"
                    value={inv.email}
                    onChange={(v) => updateInvitation(inv.id, 'email', v)}
                    placeholder="Enter team member work email"
                    isLight={isLight}
                  />
                </div>
                <div className="sm:col-span-2">
                  <SelectField
                    label="Access Role"
                    required
                    value={inv.role}
                    options={TEAM_ROLES}
                    onChange={(v) => updateInvitation(inv.id, 'role', v)}
                    isLight={isLight}
                  />
                </div>
                <InputField
                  label="First Name"
                  value={inv.first_name}
                  onChange={(v) => updateInvitation(inv.id, 'first_name', v)}
                  placeholder="Enter first name"
                  isLight={isLight}
                />
                <InputField
                  label="Last Name"
                  value={inv.last_name}
                  onChange={(v) => updateInvitation(inv.id, 'last_name', v)}
                  placeholder="Enter last name"
                  isLight={isLight}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add member button */}
      {invitations.length < 10 && (
        <button
          type="button"
          onClick={addInvitation}
          className={`w-full py-3.5 rounded-xl border border-dashed text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${isLight
            ? 'border-gray-300 hover:border-[#FF6B00] hover:text-[#FF6B00] text-gray-600 bg-white hover:bg-[#FF6B00]/5'
            : 'border-white/15 hover:border-[#FF6B00] hover:text-[#FF6B00] text-neutral-300 bg-white/[0.02] hover:bg-[#FF6B00]/5'
            }`}
        >
          + {invitations.length === 0 ? 'Add First Administrator' : 'Add Another Member'}
        </button>
      )}

      {/* Skip button note */}
      <div className="pt-4 text-center">
        <button
          type="button"
          onClick={handleSkip}
          className={`text-xs underline hover:text-[#FF6B00] transition-colors ${isLight ? 'text-gray-500' : 'text-neutral-400'
            }`}
        >
          Skip team invites for now (add members anytime in Settings)
        </button>
      </div>
    </div>
  )
}

// ── STEP 4: PAYROLL QUICK SETUP ───────────────────────────────────────────────
function Step4Leave({ data, update, isLight }) {
  const [showBankDetails, setShowBankDetails] = useState(false)
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-6">
      <SectionHeading number="01" title="Payroll Schedule & Salary Framework" isLight={isLight} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          label="First Payday / Next Pay Date"
          required
          type="date"
          min={today}
          value={data.nextPayDate}
          onChange={(v) => update({ ...data, nextPayDate: v })}
          isLight={isLight}
        />
        <SelectField
          label="Compensation Template"
          required
          value={data.salaryStructureTemplate}
          options={SALARY_TEMPLATES}
          onChange={(v) => update({ ...data, salaryStructureTemplate: v })}
          isLight={isLight}
        />
      </div>

      <SectionHeading number="02" title="Standard Working Schedule" isLight={isLight} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          label="Weekly Working Hours"
          required
          type="number"
          min="1"
          max="80"
          value={data.defaultWorkingHours}
          onChange={(v) => update({ ...data, defaultWorkingHours: parseInt(v) || 40 })}
          placeholder="Enter standard weekly hours"
          isLight={isLight}
        />
        <SelectField
          label="Overtime Calculation Rule"
          required
          value={data.overtimeRules}
          options={OVERTIME_RULES}
          onChange={(v) => update({ ...data, overtimeRules: v })}
          isLight={isLight}
        />
      </div>

      {/* Optional Bank Account Details (No giant nested cards) */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowBankDetails(!showBankDetails)}
          className={`text-xs font-semibold flex items-center gap-1.5 transition-colors ${isLight ? 'text-gray-700 hover:text-[#FF6B00]' : 'text-neutral-300 hover:text-[#FF6B00]'
            }`}
        >
          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showBankDetails ? 'rotate-90' : ''}`} />
          {showBankDetails ? 'Hide Corporate Bank Details' : '+ Add Corporate Disbursement Account (Optional)'}
        </button>

        {showBankDetails && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <InputField
              label="Bank Name"
              value={data.bankName}
              onChange={(v) => update({ ...data, bankName: v })}
              placeholder="Enter corporate banking institution name"
              isLight={isLight}
            />
            <InputField
              label="Account Number"
              value={data.accountNumber}
              onChange={(v) => update({ ...data, accountNumber: v })}
              placeholder="Enter corporate bank account number"
              isLight={isLight}
            />
            <InputField
              label="IFSC / Sort / Routing"
              value={data.routingNumber}
              onChange={(v) => update({ ...data, routingNumber: v })}
              placeholder="Enter IFSC, routing, or sort code"
              isLight={isLight}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ── STEP 5: LEAVE POLICY SETUP ────────────────────────────────────────────────
function Step5Attendance({ data, update, isLight }) {
  const [customHoliday, setCustomHoliday] = useState('')

  const addCustomHoliday = () => {
    if (customHoliday.trim()) {
      const newHolidays = [...(data.publicHolidays || []), customHoliday.trim()]
      update({ ...data, publicHolidays: newHolidays })
      setCustomHoliday('')
    }
  }

  const removeHoliday = (holiday) => {
    const newHolidays = (data.publicHolidays || []).filter(h => h !== holiday)
    update({ ...data, publicHolidays: newHolidays })
  }

  return (
    <div className="space-y-6">
      <SectionHeading number="01" title="Time-Off Policy Rules" isLight={isLight} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectField
          label="Leave Policy Framework"
          required
          value={data.leavePolicyTemplate}
          options={LEAVE_TEMPLATES}
          onChange={(v) => update({ ...data, leavePolicyTemplate: v })}
          isLight={isLight}
        />
        <SelectField
          label="Leave Year Commences"
          required
          value={data.leaveYearStart}
          options={FISCAL_MONTHS}
          onChange={(v) => update({ ...data, leaveYearStart: v })}
          isLight={isLight}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <InputField
          label="Annual Earned Leave (Days)"
          required
          type="number"
          min="0"
          value={data.annualLeaveDays}
          onChange={(v) => update({ ...data, annualLeaveDays: parseInt(v) || 0 })}
          placeholder="Enter annual leave days entitlement"
          isLight={isLight}
        />
        <InputField
          label="Sick / Medical Leave (Days)"
          required
          type="number"
          min="0"
          value={data.sickLeaveDays}
          onChange={(v) => update({ ...data, sickLeaveDays: parseInt(v) || 0 })}
          placeholder="Enter paid sick leave days"
          isLight={isLight}
        />
        <InputField
          label="Annual Carry-Forward Limit"
          required
          type="number"
          min="0"
          value={data.carryForwardLimit}
          onChange={(v) => update({ ...data, carryForwardLimit: parseInt(v) || 0 })}
          placeholder="Enter max carry-forward leave days (0 for none)"
          isLight={isLight}
        />
      </div>

      <SectionHeading number="02" title="Public Holidays Calendar" description="Standard statutory holidays. Add or remove dates as per company policy." isLight={isLight} />

      {/* Holiday Pills directly on canvas */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {(data.publicHolidays || []).map((h, idx) => (
            <span
              key={idx}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${isLight
                ? 'bg-white border-gray-200 text-gray-800'
                : 'bg-white/[0.04] border-white/10 text-neutral-200'
                }`}
            >
              <Calendar className="w-3.5 h-3.5 text-[#FF6B00]" />
              {h}
              <button
                type="button"
                onClick={() => removeHoliday(h)}
                className="text-neutral-400 hover:text-red-500 ml-1 transition-colors"
                title="Remove"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        {/* Add custom holiday */}
        <div className="flex gap-2 max-w-md pt-2">
          <input
            type="text"
            value={customHoliday}
            onChange={(e) => setCustomHoliday(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addCustomHoliday()
              }
            }}
            placeholder="Enter public holiday name"
            className={`flex-1 rounded-xl px-4 py-2 text-xs transition-all outline-none ${isLight
              ? 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-[#FF6B00]'
              : 'bg-white/[0.03] border border-white/10 text-white placeholder-neutral-500 focus:border-[#FF6B00]'
              }`}
          />
          <button
            type="button"
            onClick={addCustomHoliday}
            disabled={!customHoliday.trim()}
            className="px-4 py-2 bg-[#FF6B00] text-white rounded-xl text-xs font-medium hover:bg-[#FF7900] disabled:opacity-40 transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}

// ── STEP 6: GO LIVE ───────────────────────────────────────────────────────────
function Step6Payroll({ data, update, isLight }) {
  const checklist = [
    { label: 'Admin Email & Credentials Verified', status: 'verified' },
    { label: `Company Identity: ${data.legalName || 'Configured'}`, status: data.legalName ? 'verified' : 'pending' },
    { label: `Entity Jurisdiction: ${data.countryOfIncorporation || 'IN'} (${data.currency})`, status: 'verified' },
    { label: `Payroll Cycle: ${data.payFrequency} (Next: ${data.nextPayDate || 'Scheduled'})`, status: 'verified' },
    { label: `Leave Policy: ${data.annualLeaveDays} Annual + ${data.sickLeaveDays} Sick Days`, status: 'verified' },
  ]

  return (
    <div className="space-y-6">
      <SectionHeading number="01" title="Configuration Verification" description="Review all validated organizational parameters before final provisioning." isLight={isLight} />

      <div className="space-y-2">
        {checklist.map((item, i) => (
          <div
            key={i}
            className={`flex items-center justify-between p-3.5 rounded-xl border transition-colors ${isLight ? 'bg-white border-gray-200' : 'bg-white/[0.02] border-white/10'
              }`}
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium">{item.label}</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-500 uppercase tracking-wider font-semibold">
              Ready
            </span>
          </div>
        ))}
      </div>

      <div className={`p-4 rounded-xl border text-xs leading-relaxed transition-colors ${isLight ? 'bg-[#FF6B00]/5 border-[#FF6B00]/20 text-gray-700' : 'bg-[#FF6B00]/10 border-[#FF6B00]/20 text-neutral-300'
        }`}>
        <strong className="text-[#FF6B00] block mb-1">Final Activation Notice:</strong>
        Clicking <strong>Complete Onboarding</strong> activates your organization instance, provisions your database tenant, and opens access to all administrative modules.
      </div>
    </div>
  )
}
