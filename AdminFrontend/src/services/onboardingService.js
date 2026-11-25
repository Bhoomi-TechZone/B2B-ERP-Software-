import { API_V1_BASE_URL } from '../config/api'
import apiClient from './apiClient'

const BASE = `${API_V1_BASE_URL}/onboarding`

/**
 * All methods now use apiClient which handles:
 * - Automatic Bearer token injection
 * - 401 → refresh token → retry
 * - Redirect to login if refresh fails
 *
 * token param kept for backward compat but ignored (apiClient reads from localStorage)
 */
const onboardingService = {
  getProgress:         (_token)        => apiClient.get(`${BASE}/progress`),
  getDetailedProgress: (_token)        => apiClient.get(`${BASE}/progress/detailed`),
  getInvitations:      ()              => apiClient.get(`${BASE}/invitations`),

  async updateStep(step, stepData, _token) {
    // Send step data directly without wrapping in step_data
    return apiClient.patch(`${BASE}/progress?step=${step}`, stepData)
  },

  /**
   * Step 1: Save Company Profile
   */
  async saveStep1CompanyProfile(data, token) {
    const stepData = {
      company_legal_name: data.companyLegalName,
      trading_name: data.tradingName,
      website: data.website,
      address_line1: data.registeredAddress?.line1,
      address_line2: data.registeredAddress?.line2,
      city: data.registeredAddress?.city,
      state: data.registeredAddress?.state,
      postal_code: data.registeredAddress?.postalCode,
      country: data.registeredAddress?.country,
      billing_contact_email: data.billingEmail,
      vat_gst_number: data.vatGstNumber,
      fiscal_year_start: MONTHS.indexOf(data.fiscalYearStart) + 1, // Convert month name to number (1-12)
      company_logo: data.companyLogo, // Base64 or URL
    }
    return this.updateStep(1, stepData, token)
  },

  /**
   * Step 2: Save First Legal Entity
   */
  async saveStep2LegalEntity(data, token) {
    const stepData = {
      entity_legal_name: data.entityLegalName,
      entity_type: data.entityType,
      country_of_incorporation: data.countryOfIncorporation,
      tax_employer_id: data.taxEmployerId,
      pf_registration_no: data.pfRegistrationNo,
      esi_registration_no: data.esiRegistrationNo,
      state_province: data.stateProvince,
      pay_frequency: data.payFrequency,
      currency: data.currency,
      bank_details: data.bankAccount?.bankName ? {
        bank_name: data.bankAccount.bankName,
        account_number: data.bankAccount.accountNumber,
        ifsc_code: data.bankAccount.ifscCode,
        routing_number: data.bankAccount.routingNumber,
        sort_code: data.bankAccount.sortCode,
      } : undefined,
    }
    return this.updateStep(2, stepData, token)
  },

  /**
   * Step 3: Save Team Invitations
   */
  async saveStep3TeamInvitations(data, token) {
    const stepData = {
      invitations: data.invitations?.map(inv => ({
        email: inv.email,
        role: inv.role,
        first_name: inv.firstName,
        last_name: inv.lastName,
      })) || [],
      skip: data.invitations?.length === 0,
    }
    return this.updateStep(3, stepData, token)
  },

  /**
   * Step 4: Save Payroll Configuration
   */
  async saveStep4PayrollConfig(data, token) {
    const stepData = {
      next_pay_date: data.nextPayDate,
      salary_structure_template: data.salaryStructureTemplate,
      default_working_hours: data.defaultWorkingHours,
      overtime_rules: data.overtimeRule,
    }
    return this.updateStep(4, stepData, token)
  },

  /**
   * Step 5: Save Leave Policy
   */
  async saveStep5LeavePolicy(data, token) {
    const stepData = {
      leave_policy_template: data.leavePolicyTemplate,
      annual_leave_days: data.annualLeaveDays,
      sick_leave_days: data.sickLeaveDays,
      leave_year_start: MONTHS.indexOf(data.leaveYearStart) + 1, // Convert month name to number
      carry_forward_limit: data.carryForwardLimit,
      public_holidays: data.selectedPublicHolidays?.map(holidayName => {
        // Find the holiday date from the public holidays list
        const country = data.countryOfIncorporation || 'IN'
        const holiday = PUBLIC_HOLIDAYS[country]?.find(h => h.name === holidayName)
        return holiday?.date || holidayName
      }) || [],
    }
    return this.updateStep(5, stepData, token)
  },

  /**
   * Step 6: Complete Onboarding
   */
  async completeOnboarding(token) {
    return this.updateStep(6, {}, token)
  },

  /**
   * Submit full onboarding (legacy - use step-by-step instead)
   */
  async submitOnboarding(payload, _token) {
    try {
      await this.saveStep1CompanyProfile(payload)
      await this.saveStep2LegalEntity(payload)
      await this.saveStep3TeamInvitations(payload)
      await this.saveStep4PayrollConfig(payload)
      await this.saveStep5LeavePolicy(payload)
      return await this.completeOnboarding()
    } catch (error) {
      console.warn('Step-by-step failed, trying legacy endpoint:', error)
      return apiClient.post(`${API_V1_BASE_URL}/onboarding/complete`, payload)
    }
  },
}

// Helper constants for conversions
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const PUBLIC_HOLIDAYS = {
  IN: [
    { date: '2026-01-26', name: 'Republic Day', type: 'national' },
    { date: '2026-08-15', name: 'Independence Day', type: 'national' },
    { date: '2026-10-02', name: 'Gandhi Jayanti', type: 'national' },
    { date: '2026-05-01', name: 'Labour Day', type: 'national' },
    { date: '2026-12-25', name: 'Christmas', type: 'national' },
    { date: '2026-11-12', name: 'Diwali', type: 'optional' },
    { date: '2026-03-25', name: 'Holi', type: 'optional' },
  ],
  US: [
    { date: '2026-01-01', name: "New Year's Day", type: 'federal' },
    { date: '2026-01-15', name: 'Martin Luther King Jr. Day', type: 'federal' },
    { date: '2026-02-19', name: "Presidents' Day", type: 'federal' },
    { date: '2026-05-27', name: 'Memorial Day', type: 'federal' },
    { date: '2026-06-19', name: 'Juneteenth', type: 'federal' },
    { date: '2026-07-04', name: 'Independence Day', type: 'federal' },
    { date: '2026-09-02', name: 'Labor Day', type: 'federal' },
    { date: '2026-10-14', name: 'Columbus Day', type: 'federal' },
    { date: '2026-11-11', name: "Veterans Day", type: 'federal' },
    { date: '2026-11-28', name: 'Thanksgiving', type: 'federal' },
    { date: '2026-12-25', name: 'Christmas', type: 'federal' },
  ],
  GB: [
    { date: '2026-01-01', name: "New Year's Day", type: 'bank' },
    { date: '2026-03-29', name: 'Good Friday', type: 'bank' },
    { date: '2026-04-01', name: 'Easter Monday', type: 'bank' },
    { date: '2026-05-06', name: 'Early May Bank Holiday', type: 'bank' },
    { date: '2026-05-27', name: 'Spring Bank Holiday', type: 'bank' },
    { date: '2026-08-26', name: 'Summer Bank Holiday', type: 'bank' },
    { date: '2026-12-25', name: 'Christmas Day', type: 'bank' },
    { date: '2026-12-26', name: 'Boxing Day', type: 'bank' },
  ],
}

export default onboardingService
