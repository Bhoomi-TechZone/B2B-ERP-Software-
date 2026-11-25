import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { buildSignInUrl } from '../../utils/authSession'
import authService from '../../services/authService'
import onboardingService from '../../services/onboardingService'
import plansService from '../../services/plansService'
import { getInitialRegion } from '../../utils/geoDetection'

import SidebarPanel        from './components/SidebarPanel'
import NewStepOneAccount   from './components/NewStepOneAccount'
import NewStepTwoCompany   from './components/NewStepTwoCompany'
import RegistrationSuccess from './components/RegistrationSuccess'

const EMAIL_REGEX   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']
const INDUSTRIES    = ['Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail', 'Education', 'Other']
const PRIMARY_REGIONS = [
  { id: 'IN', label: 'India' },
  { id: 'US', label: 'US'   },
  { id: 'UK', label: 'UK'   },
  { id: 'EU', label: 'EU'   },
]
const BILLING_CYCLES = [
  { id: 'monthly', label: 'Monthly', desc: 'Pay as you go'      },
  { id: 'annual',  label: 'Annual',  desc: 'Save up to 20%'     },
]

export default function RegistrationPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // ── Read plan info from URL params (set by landing page pricing section)
  const rawUrlPlan = searchParams.get('plan')
  const hasUrlPlan = Boolean(rawUrlPlan && rawUrlPlan !== 'starter')
  const urlPlan    = rawUrlPlan || ''
  const urlBilling = searchParams.get('billing') || 'monthly'
  const urlRegion  = searchParams.get('region')  || ''

  const [step, setStep] = useState(1)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // ── Check if user is already logged in and verified ──
  useEffect(() => {
    const checkAuthStatus = async () => {
      const accessToken = localStorage.getItem('access_token')
      
      if (accessToken) {
        try {
          // Check onboarding progress
          const progress = await onboardingService.getProgress()
          
          if (progress && !progress.is_completed) {
            // User is verified but onboarding not complete - redirect to onboarding
            navigate('/onboarding', { replace: true })
          } else if (progress && progress.is_completed) {
            // User has completed onboarding - redirect to login
            navigate(buildSignInUrl({ ref: 'register', op: 'authorize', mode: 'enterprise' }), { replace: true })
          }
        } catch {
          // Token invalid or expired, continue with registration
          console.log('No valid session, showing registration')
        }
      }
      
      setIsCheckingAuth(false)
    }

    checkAuthStatus()
  }, [navigate])

  const [firstName,       setFirstName]       = useState('')
  const [lastName,        setLastName]        = useState('')
  const [email,           setEmail]           = useState('')
  const [phone,           setPhone]           = useState('')
  const [password,        setPassword]        = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [termsAccepted,   setTermsAccepted]   = useState(false)
  const [marketingOptIn,  setMarketingOptIn]  = useState(false)

  // Step 2 — pre-filled from URL
  const [verificationToken, setVerificationToken] = useState('')
  const [companyName,   setCompanyName]   = useState('')
  const [companySize,   setCompanySize]   = useState('')
  const [primaryRegion, setPrimaryRegion] = useState(urlRegion || getInitialRegion())
  const [industry,      setIndustry]      = useState('')
  const [promoCode,     setPromoCode]     = useState('')
  const [billingCycle,  setBillingCycle]  = useState(urlBilling === 'yearly' ? 'annual' : urlBilling)
  const [selectedPlan,  setSelectedPlan]  = useState(urlPlan)
  const [plans,         setPlans]         = useState([])

  // Load active plans from backend
  useEffect(() => {
    plansService.getActivePlans()
      .then(data => {
        const list = Array.isArray(data) ? data : (data?.plans || data?.data || data?.items || [])
        if (list && list.length > 0) {
          setPlans(list)
          setSelectedPlan(prev => {
            if (prev && prev !== 'starter' && list.some(p => p.slug === prev)) {
              return prev
            }
            return list[0]?.slug || 'pro-plan'
          })
        }
      })
      .catch(err => console.error('Failed to load plans:', err))
  }, [])

  const [apiError,     setApiError]     = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)

  // Show loading while checking auth status
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Checking your status...</p>
        </div>
      </div>
    )
  }

  const isEmailValid  = (email || '').trim().length > 0 && EMAIL_REGEX.test((email || '').trim()) && !(email || '').includes('+')
  const passwordRules = {
    length:  (password || '').length >= 8,
    upper:   /[A-Z]/.test(password || ''),
    number:  /\d/.test(password || ''),
    special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password || ''),
  }
  const passwordsMatch = (password || '').length > 0 && password === confirmPassword

  const handleNext = async () => {
    setApiError('')
    setIsSubmitting(true)
    try {
      if (step === 1) {
        const phoneParts = phone.trim().split(' ')
        const result = await authService.registerStep1({
          first_name:         firstName.trim(),
          last_name:          lastName.trim(),
          email:              email.trim(),
          phone_country_code: phoneParts[0] || '+91',
          phone_number:       phoneParts.slice(1).join('').replace(/\D/g, ''),
          password,
          terms_accepted:     termsAccepted,
        })

        if (result?.status === 'pending_verification_resent') {
          localStorage.setItem('last_registered_email', email.trim())
          setIsRegistered(true)
          window.scrollTo(0, 0)
          return
        }

        setStep(2)
        window.scrollTo(0, 0)
      } else {
        await authService.registerStep2({
          email:          email.trim(),
          company_name:   companyName.trim(),
          company_size:   companySize,
          industry,
          primary_region: primaryRegion,
          plan_slug:      selectedPlan || (plans[0]?.slug || 'pro-plan'),
          billing_cycle:  billingCycle,
          promo_code:     promoCode.trim() || null,
        })
          localStorage.setItem('last_registered_email', email.trim())
          setIsRegistered(true)
          window.scrollTo(0, 0)
        }
    } catch (err) {
      setApiError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const sidebarHeading = isRegistered
    ? 'Verify your identity to get started'
    : step === 1
      ? 'Let us unify your data on one customer platform'
      : 'Set up your company workspace'

  return (
    <main className="min-h-screen bg-white text-[#1d2433]">
      <div className="flex min-h-screen">
        <SidebarPanel heading={sidebarHeading} />

        <section className="flex w-full flex-col bg-white px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center">

            {isRegistered ? (
              <RegistrationSuccess
                email={email}
                onBackToRegister={() => { setIsRegistered(false); setStep(1) }}
              />
            ) : (
              <div className="w-full transition-all duration-300">
                {step === 1 && (
                  <NewStepOneAccount
                    firstName={firstName}       onFirstNameChange={setFirstName}
                    lastName={lastName}         onLastNameChange={setLastName}
                    email={email}               onEmailChange={setEmail}
                    phone={phone}               onPhoneChange={setPhone}
                    password={password}         onPasswordChange={setPassword}
                    confirmPassword={confirmPassword} onConfirmPasswordChange={setConfirmPassword}
                    termsAccepted={termsAccepted}     onTermsChange={setTermsAccepted}
                    marketingOptIn={marketingOptIn}   onMarketingChange={setMarketingOptIn}
                    isEmailValid={isEmailValid}
                    passwordRules={passwordRules}
                    passwordsMatch={passwordsMatch}
                    onNext={handleNext}
                    onGoHome={() => navigate('/')}
                  />
                )}

                {step === 2 && (
                  <NewStepTwoCompany
                    companyName={companyName}     onCompanyNameChange={setCompanyName}
                    companySize={companySize}     onSizeSelect={setCompanySize}
                    industry={industry}           onIndustrySelect={setIndustry}
                    primaryRegion={primaryRegion} onRegionSelect={setPrimaryRegion}
                    promoCode={promoCode}         onPromoCodeChange={setPromoCode}
                    billingCycle={billingCycle}   onBillingCycleChange={setBillingCycle}
                    selectedPlan={selectedPlan}   onPlanChange={setSelectedPlan}
                    verificationToken={verificationToken} onTokenChange={setVerificationToken}
                    companySizes={COMPANY_SIZES}
                    industries={INDUSTRIES}
                    regions={PRIMARY_REGIONS}
                    billingCycles={BILLING_CYCLES}
                    plans={plans}
                    hasUrlPlan={hasUrlPlan}
                    isSubmitting={isSubmitting}
                    onBack={() => setStep(1)}
                    onSubmit={handleNext}
                  />
                )}
              </div>
            )}

            {apiError && !isRegistered && (
              <div className="mt-6 rounded-2xl bg-red-50 p-4 border border-red-100 text-sm font-bold text-red-600 text-center">
                {apiError && apiError.toString()}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

