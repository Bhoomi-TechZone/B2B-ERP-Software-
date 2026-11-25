import { API_V1_BASE_URL } from '../config/api'

const getToken = () => localStorage.getItem('access_token')

const authHeaders = () => ({
  'Authorization': `Bearer ${getToken()}`,
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true',
})

const superAdminOnboardingService = {
  async getAllTenantsOnboarding(filters = {}) {
    const queryParams = new URLSearchParams()
    if (filters.status)   queryParams.append('status', filters.status)
    if (filters.country)  queryParams.append('country', filters.country)
    if (filters.dateFrom) queryParams.append('date_from', filters.dateFrom)
    if (filters.dateTo)   queryParams.append('date_to', filters.dateTo)
    if (filters.search)   queryParams.append('search', filters.search)
    const url = `${API_V1_BASE_URL}/superadmin/onboarding/tenants${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    const response = await fetch(url, { headers: authHeaders() })
    const result = await response.json()
    if (!response.ok) throw new Error(result.message || 'Failed to fetch tenants onboarding data')
    return result
  },

  async getTenantOnboardingDetails(tenantId) {
    const response = await fetch(`${API_V1_BASE_URL}/superadmin/onboarding/tenants/${tenantId}`, { headers: authHeaders() })
    const result = await response.json()
    if (!response.ok) throw new Error(result.message || 'Failed to fetch tenant onboarding details')
    return result
  },

  async getCompanyOnboardingProgress(tenantId) {
    const response = await fetch(`${API_V1_BASE_URL}/onboarding/progress/${tenantId}`, { headers: authHeaders() })
    const result = await response.json()
    if (!response.ok) throw new Error(result.message || 'Failed to fetch tenant onboarding details')
    return result
  },

  async updateTenantStep(tenantId, stepNumber, stepData) {
    const response = await fetch(`${API_V1_BASE_URL}/superadmin/onboarding/tenants/${tenantId}/step/${stepNumber}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ step_data: stepData }),
    })
    const result = await response.json()
    if (!response.ok) throw new Error(result.message || `Failed to update step ${stepNumber}`)
    return result
  },

  async forceCompleteOnboarding(tenantId) {
    const response = await fetch(`${API_V1_BASE_URL}/superadmin/onboarding/tenants/${tenantId}/complete`, {
      method: 'POST',
      headers: authHeaders(),
    })
    const result = await response.json()
    if (!response.ok) throw new Error(result.message || 'Failed to complete onboarding')
    return result
  },

  async resetTenantOnboarding(tenantId, options = {}) {
    const response = await fetch(`${API_V1_BASE_URL}/superadmin/onboarding/tenants/${tenantId}/reset`, {
      method: 'DELETE',
      headers: authHeaders(),
      body: JSON.stringify({ keep_company_data: options.keepCompanyData || false, reason: options.reason || '' }),
    })
    const result = await response.json()
    if (!response.ok) throw new Error(result.message || 'Failed to reset onboarding')
    return result
  },

  async getOnboardingStats(period = '30d') {
    const response = await fetch(`${API_V1_BASE_URL}/superadmin/onboarding/stats?period=${period}`, { headers: authHeaders() })
    const result = await response.json()
    if (!response.ok) throw new Error(result.message || 'Failed to fetch onboarding statistics')
    return result
  },

  async getTenantInvitations(tenantId) {
    const response = await fetch(`${API_V1_BASE_URL}/superadmin/onboarding/tenants/${tenantId}/invitations`, { headers: authHeaders() })
    const result = await response.json()
    if (!response.ok) throw new Error(result.message || 'Failed to fetch tenant invitations')
    return result
  },

  async resendInvitation(tenantId, invitationId) {
    const response = await fetch(`${API_V1_BASE_URL}/superadmin/onboarding/tenants/${tenantId}/invitations/${invitationId}/resend`, {
      method: 'POST',
      headers: authHeaders(),
    })
    const result = await response.json()
    if (!response.ok) throw new Error(result.message || 'Failed to resend invitation')
    return result
  },

  async bulkOperation(operation, tenantIds, options = {}) {
    const response = await fetch(`${API_V1_BASE_URL}/superadmin/onboarding/bulk`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ operation, tenant_ids: tenantIds, options }),
    })
    const result = await response.json()
    if (!response.ok) throw new Error(result.message || 'Bulk operation failed')
    return result
  },

  async exportOnboardingData(format = 'csv', filters = {}) {
    const queryParams = new URLSearchParams()
    queryParams.append('format', format)
    if (filters.status)   queryParams.append('status', filters.status)
    if (filters.dateFrom) queryParams.append('date_from', filters.dateFrom)
    if (filters.dateTo)   queryParams.append('date_to', filters.dateTo)
    const response = await fetch(`${API_V1_BASE_URL}/superadmin/onboarding/export?${queryParams.toString()}`, {
      headers: { 'Authorization': `Bearer ${getToken()}`, 'ngrok-skip-browser-warning': 'true' },
    })
    if (!response.ok) {
      const result = await response.json()
      throw new Error(result.message || 'Export failed')
    }
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `onboarding_export_${new Date().toISOString().split('T')[0]}.${format}`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
    return { success: true }
  },

  async getTenantAuditLog(tenantId, pagination = {}) {
    const queryParams = new URLSearchParams()
    if (pagination.page)  queryParams.append('page', pagination.page)
    if (pagination.limit) queryParams.append('limit', pagination.limit)
    const response = await fetch(`${API_V1_BASE_URL}/superadmin/onboarding/tenants/${tenantId}/audit?${queryParams.toString()}`, { headers: authHeaders() })
    const result = await response.json()
    if (!response.ok) throw new Error(result.message || 'Failed to fetch audit log')
    return result
  },

  async validateTenantData(tenantId) {
    const response = await fetch(`${API_V1_BASE_URL}/superadmin/onboarding/tenants/${tenantId}/validate`, {
      method: 'POST',
      headers: authHeaders(),
    })
    const result = await response.json()
    if (!response.ok) throw new Error(result.message || 'Validation failed')
    return result
  },
}

export default superAdminOnboardingService
