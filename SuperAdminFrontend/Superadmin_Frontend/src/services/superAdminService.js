import { API_BASE_URL, API_V1_BASE_URL } from '../config/api'
import apiClient from './apiClient'

/**
 * Super Admin Service
 * Handles all API calls for super admin functionality
 */

const API_V1_SUPERADMIN = `${API_BASE_URL}/v1/superadmin`

const superAdminService = {
  // ── Dashboard Data ──────────────────────────────────────────────────────────
  async getDashboardStats() {
    try {
      return await apiClient.get(`${API_BASE_URL}/super-admin/dashboard/stats`)
    } catch (error) {
      console.warn('Dashboard stats endpoint not available, using mock data')

      return {
        total_tenants: 0,
        active_tenants: 0,
        trial_tenants: 0,
        total_users: 0,
        monthly_revenue: 0,
        system_health: 'operational',
      }
    }
  },

  // ── Leads Management ────────────────────────────────────────────────────────
  async getLeads() {
    try {
      return await apiClient.get(`${API_BASE_URL}/super-admin/leads`)
    } catch (error) {
      console.warn('Leads endpoint not available, using mock data')
      return []
    }
  },

  async getLead(id) {
    try {
      return await apiClient.get(`${API_BASE_URL}/super-admin/leads/${id}`)
    } catch (error) {
      console.warn(`Lead ${id} endpoint not available`)
      return null
    }
  },

  async updateLead(id, data) {
    try {
      return await apiClient.patch(
        `${API_BASE_URL}/super-admin/leads/${id}`,
        data
      )
    } catch (error) {
      console.error('Failed to update lead:', error)
      throw error
    }
  },

  async deleteLead(id) {
    try {
      return await apiClient.delete(
        `${API_BASE_URL}/super-admin/leads/${id}`
      )
    } catch (error) {
      console.error('Failed to delete lead:', error)
      throw error
    }
  },

  // ── Tenant Management ───────────────────────────────────────────────────────
  async getTenants() {
    try {
      const response = await apiClient.get(`${API_BASE_URL}/super-admin/tenants`)
      console.log('getTenants response:', response)
      return response
    } catch (error) {
      console.error('getTenants error:', error)
      console.warn('Tenants endpoint not available, using mock data')
      return { tenants: [] }
    }
  },

  async getTenant(id) {
    try {
      const response = await apiClient.get(`${API_BASE_URL}/super-admin/tenants/${id}`)
      console.log('getTenant response:', response)
      return response
    } catch (error) {
      console.error('getTenant error:', error)
      console.warn(`Tenant ${id} endpoint not available`)
      return null
    }
  },

  async createTenant(data) {
    try {
      return await apiClient.post(
        `${API_BASE_URL}/super-admin/tenants`,
        data
      )
    } catch (error) {
      console.error('Failed to create tenant:', error)
      throw error
    }
  },

  async updateTenant(id, data) {
    try {
      return await apiClient.patch(
        `${API_BASE_URL}/super-admin/tenants/${id}`,
        data
      )
    } catch (error) {
      console.error('Failed to update tenant:', error)
      throw error
    }
  },

  async suspendTenant(id, reason) {
    try {
      return await apiClient.post(
        `${API_BASE_URL}/super-admin/tenants/${id}/suspend`,
        { reason }
      )
    } catch (error) {
      console.error('Failed to suspend tenant:', error)
      throw error
    }
  },

  async activateTenant(id) {
    try {
      return await apiClient.post(
        `${API_BASE_URL}/super-admin/tenants/${id}/activate`
      )
    } catch (error) {
      console.error('Failed to activate tenant:', error)
      throw error
    }
  },

  async deleteTenant(id) {
    try {
      return await apiClient.delete(
        `${API_BASE_URL}/super-admin/tenants/${id}`
      )
    } catch (error) {
      console.error('Failed to delete tenant:', error)
      throw error
    }
  },

  async markTenantForDeletion(id) {
    try {
      return await apiClient.post(
        `${API_BASE_URL}/super-admin/tenants/${id}/mark-deletion`
      )
    } catch (error) {
      console.error('Failed to mark tenant for deletion:', error)
      throw error
    }
  },

  async bulkUpdateTenantStatus(tenantIds, status) {
    try {
      return await apiClient.post(
        `${API_BASE_URL}/super-admin/tenants/bulk-status`,
        { tenant_ids: tenantIds, status }
      )
    } catch (error) {
      console.error('Failed to bulk update tenant status:', error)
      throw error
    }
  },

  // ── User Management ─────────────────────────────────────────────────────────
  async getUsers() {
    try {
      return await apiClient.get(`${API_BASE_URL}/super-admin/users`)
    } catch (error) {
      console.warn('Users endpoint not available, using mock data')
      return []
    }
  },

  async getUser(id) {
    try {
      return await apiClient.get(`${API_BASE_URL}/super-admin/users/${id}`)
    } catch (error) {
      console.warn(`User ${id} endpoint not available`)
      return null
    }
  },

  async updateUser(id, data) {
    try {
      return await apiClient.patch(
        `${API_BASE_URL}/super-admin/users/${id}`,
        data
      )
    } catch (error) {
      console.error('Failed to update user:', error)
      throw error
    }
  },

  async suspendUser(id, reason) {
    try {
      return await apiClient.post(
        `${API_BASE_URL}/super-admin/users/${id}/suspend`,
        { reason }
      )
    } catch (error) {
      console.error('Failed to suspend user:', error)
      throw error
    }
  },

  async activateUser(id) {
    try {
      return await apiClient.post(
        `${API_BASE_URL}/super-admin/users/${id}/activate`
      )
    } catch (error) {
      console.error('Failed to activate user:', error)
      throw error
    }
  },

  async deleteUser(id) {
    try {
      return await apiClient.delete(
        `${API_BASE_URL}/super-admin/users/${id}`
      )
    } catch (error) {
      console.error('Failed to delete user:', error)
      throw error
    }
  },

  // ── Plans Management ────────────────────────────────────────────────────────

  async getPlans() {
    try {
      return await apiClient.get(
        `${API_V1_SUPERADMIN}/plans`
      )
    } catch (error) {
      console.error('Failed to fetch plans:', error)
      throw error
    }
  },

  async getPlan(id) {
    try {
      return await apiClient.get(
        `${API_V1_SUPERADMIN}/plans/${id}`
      )
    } catch (error) {
      console.error('Failed to fetch plan:', error)
      throw error
    }
  },

  async createPlan(data) {
    try {
      return await apiClient.post(
        `${API_V1_SUPERADMIN}/plans`,
        data
      )
    } catch (error) {
      console.error('Failed to create plan:', error)
      throw error
    }
  },

  async updatePlan(id, data) {
    try {
      return await apiClient.put(
        `${API_V1_SUPERADMIN}/plans/${id}`,
        data
      )
    } catch (error) {
      console.error('Failed to update plan:', error)
      throw error
    }
  },

  async deletePlan(id) {
    try {
      return await apiClient.delete(
        `${API_V1_SUPERADMIN}/plans/${id}`
      )
    } catch (error) {
      console.error('Failed to delete plan:', error)
      throw error
    }
  },

  // ── Billing Management ──────────────────────────────────────────────────────
  async getBillingStats() {
    try {
      return await apiClient.get(
        `${API_BASE_URL}/super-admin/billing/stats`
      )
    } catch (error) {
      console.warn('Billing stats endpoint not available, using mock data')

      return {
        total_revenue: 284390,
        monthly_revenue: 284390,
        arr: 3412680,
        mrr: 284390,
        churn_rate: 1.8,
      }
    }
  },

  async getInvoices() {
    try {
      return await apiClient.get(
        `${API_BASE_URL}/super-admin/billing/invoices`
      )
    } catch (error) {
      console.warn('Invoices endpoint not available, using mock data')
      return []
    }
  },

  async getPayments() {
    try {
      return await apiClient.get(
        `${API_BASE_URL}/super-admin/billing/payments`
      )
    } catch (error) {
      console.warn('Payments endpoint not available, using mock data')
      return []
    }
  },

  // ── System Health ───────────────────────────────────────────────────────────
  async getSystemHealth() {
    try {
      return await apiClient.get(
        `${API_BASE_URL}/super-admin/system/health`
      )
    } catch (error) {
      console.warn('System health endpoint not available, using mock data')

      return {
        status: 'operational',
        uptime: '99.97%',
        services: [
          {
            name: 'API Gateway',
            status: 'operational',
            latency: '12ms',
          },
          {
            name: 'Database',
            status: 'operational',
            latency: '3ms',
          },
          {
            name: 'Auth Service',
            status: 'operational',
            latency: '8ms',
          },
        ],
      }
    }
  },

  async getAuditLogs() {
    try {
      return await apiClient.get(
        `${API_BASE_URL}/super-admin/audit-logs`
      )
    } catch (error) {
      console.warn('Audit logs endpoint not available, using mock data')
      return []
    }
  },

  // ── Platform Settings ───────────────────────────────────────────────────────
  async getSettings() {
    try {
      return await apiClient.get(
        `${API_BASE_URL}/super-admin/platform-settings`
      )
    } catch (error) {
      console.warn('Platform settings endpoint error, trying legacy settings:', error)
      try {
        return await apiClient.get(`${API_BASE_URL}/super-admin/settings`)
      } catch (e) {
        return {
          platform_name: 'WorkMatrix HRMS',
          maintenance_mode: false,
          registration_enabled: true,
          email_notifications: true,
        }
      }
    }
  },

  async updateSettings(data) {
    try {
      return await apiClient.put(
        `${API_BASE_URL}/super-admin/platform-settings`,
        data
      )
    } catch (error) {
      console.warn('PUT failed, trying PATCH:', error)
      return await apiClient.patch(
        `${API_BASE_URL}/super-admin/platform-settings`,
        data
      )
    }
  },

  async sendTestEmail(toEmail, customSettings = {}) {
    return await apiClient.post(
      `${API_BASE_URL}/super-admin/platform-settings/test-email`,
      { to_email: toEmail, ...customSettings }
    )
  },

  // ── Onboarding Management ───────────────────────────────────────────────────
  async getOnboardingStats() {
    try {
      return await apiClient.get(
        `${API_BASE_URL}/super-admin/onboarding/stats`
      )
    } catch (error) {
      console.warn('Onboarding stats endpoint not available, using mock data')

      return {
        total_onboarding: 0,
        completed_onboarding: 0,
        pending_onboarding: 0,
        completion_rate: 0,
      }
    }
  },

  async getOnboardingTenants() {
    try {
      return await apiClient.get(
        `${API_BASE_URL}/super-admin/onboarding/tenants`
      )
    } catch (error) {
      console.warn('Onboarding tenants endpoint not available, using mock data')
      return []
    }
  },

  async getOnboardingProgress(tenantId) {
    try {
      const url = `${API_V1_BASE_URL}/onboarding/progress/${tenantId}`
      console.log('🔄 Calling onboarding progress API:', url)
      
      const response = await apiClient.get(url)
      
      console.log('✅ Onboarding progress API response:', response)
      return response
    } catch (error) {
      console.error('❌ Failed to fetch onboarding progress:', error)
      console.error('Error details:', error.message)
      return null
    }
  },

  async getOnboardingProgressDetailed(tenantId) {
    try {
      const url = `${API_V1_BASE_URL}/onboarding/progress/detailed`
      console.log('🔄 Calling onboarding progress detailed API:', url)
      
      const response = await apiClient.get(url)
      
      console.log('✅ Onboarding progress detailed API response:', response)
      return response
    } catch (error) {
      console.error('❌ Failed to fetch detailed onboarding progress:', error)
      return null
    }
  },

  async updateOnboardingStatus(tenantId, status) {
    try {
      return await apiClient.patch(
        `${API_BASE_URL}/super-admin/onboarding/tenants/${tenantId}`,
        { status }
      )
    } catch (error) {
      console.error('Failed to update onboarding status:', error)
      throw error
    }
  },

  // ── Subscription Management ─────────────────────────────────────────────────
  async getSubscription(tenantId) {
    try {
      const url = `${API_BASE_URL}/super-admin/tenants/${tenantId}/subscription`
      console.log('🔄 Fetching subscription for tenant:', tenantId, 'URL:', url)
      
      const response = await apiClient.get(url)
      
      console.log('✅ Subscription data received:', response)
      return response
    } catch (error) {
      console.error('❌ Failed to fetch subscription:', error)
      console.error('   Error message:', error?.message)
      return null
    }
  },

  async updateSubscription(tenantId, data) {
    try {
      return await apiClient.patch(
        `${API_BASE_URL}/super-admin/tenants/${tenantId}/subscription`,
        data
      )
    } catch (error) {
      console.error('Failed to update subscription:', error)
      throw error
    }
  },

  async cancelSubscription(tenantId, reason) {
    try {
      return await apiClient.post(
        `${API_BASE_URL}/super-admin/tenants/${tenantId}/subscription/cancel`,
        { reason }
      )
    } catch (error) {
      console.error('Failed to cancel subscription:', error)
      throw error
    }
  },

  async changePlan(tenantId, newPlanId, changeImmediately = true) {
    try {
      const url = `${API_BASE_URL}/super-admin/tenants/${tenantId}/subscription/change-plan`
      console.log('🔄 Changing plan for tenant:', tenantId, 'to plan:', newPlanId)
      
      const response = await apiClient.post(url, {
        new_plan_id: newPlanId,
        change_immediately: changeImmediately,
      })
      
      console.log('✅ Plan changed successfully:', response)
      return response
    } catch (error) {
      console.error('❌ Failed to change plan:', error)
      throw error
    }
  },

  async getPlans() {
    try {
      const url = `${API_V1_BASE_URL}/plans`
      console.log('🔄 Fetching available plans from:', url)
      
      const response = await apiClient.get(url)
      
      console.log('✅ Plans fetched successfully:', response)
      return response
    } catch (error) {
      console.error('❌ Failed to fetch plans:', error)
      throw error
    }
  },

  async applyDiscount(tenantId, discountPercentage, reason) {
    try {
      const url = `${API_BASE_URL}/super-admin/tenants/${tenantId}/subscription/apply-discount`
      console.log('🔄 Applying discount to tenant:', tenantId, 'Discount:', discountPercentage + '%')
      
      const response = await apiClient.post(url, {
        discount_percentage: discountPercentage,
        reason: reason || '',
      })
      
      console.log('✅ Discount applied successfully:', response)
      return response
    } catch (error) {
      console.error('❌ Failed to apply discount:', error)
      throw error
    }
  },

  async extendTrial(tenantId, extensionDays, reason) {
    try {
      const url = `${API_BASE_URL}/super-admin/tenants/${tenantId}/subscription/extend-trial`
      console.log('🔄 Extending trial for tenant:', tenantId, 'Days:', extensionDays)
      
      const response = await apiClient.post(url, {
        extension_days: extensionDays,
        reason: reason || '',
      })
      
      console.log('✅ Trial extended successfully:', response)
      return response
    } catch (error) {
      console.error('❌ Failed to extend trial:', error)
      throw error
    }
  },

  async changeSubscriptionStatus(tenantId, status, reason) {
    try {
      const url = `${API_BASE_URL}/super-admin/tenants/${tenantId}/subscription/status`
      console.log('🔄 Changing subscription status for tenant:', tenantId, 'Status:', status)
      
      const response = await apiClient.post(url, {
        status: status,
        reason: reason || '',
      })
      
      console.log('✅ Subscription status changed successfully:', response)
      return response
    } catch (error) {
      console.error('❌ Failed to change subscription status:', error)
      throw error
    }
  },

  async getBillingHistory(tenantId, page = 1, perPage = 20) {
    try {
      const url = `${API_BASE_URL}/super-admin/tenants/${tenantId}/billing-history`
      console.log('🔄 Fetching billing history for tenant:', tenantId, 'Page:', page)
      
      const response = await apiClient.get(url, {
        params: {
          page,
          per_page: perPage,
        }
      })
      
      console.log('✅ Billing history fetched successfully:', response)
      return response
    } catch (error) {
      console.error('❌ Failed to fetch billing history:', error)
      throw error
    }
  },

  async getModules(tenantId) {
    try {
      const url = `${API_BASE_URL}/super-admin/tenants/${tenantId}/modules`
      console.log('🔄 Fetching modules for tenant:', tenantId)
      
      const response = await apiClient.get(url)
      
      console.log('✅ Modules fetched successfully:', response)
      return response
    } catch (error) {
      console.error('❌ Failed to fetch modules:', error)
      throw error
    }
  },

  async updateModules(tenantId, data) {
    try {
      const url = `${API_BASE_URL}/super-admin/tenants/${tenantId}/modules`
      
      // Extract only the fields that the API expects
      const updatePayload = {
        use_plan_defaults: data.use_plan_defaults,
        core_hr_enabled: data.core_hr_enabled,
        payroll_enabled: data.payroll_enabled,
        leave_enabled: data.leave_enabled,
        attendance_enabled: data.attendance_enabled,
        recruitment_enabled: data.recruitment_enabled,
        performance_enabled: data.performance_enabled,
        benefits_enabled: data.benefits_enabled,
        compliance_enabled: data.compliance_enabled,
        api_access_enabled: data.api_access_enabled,
        api_rate_limit: data.api_rate_limit || 0,
        white_label_enabled: data.white_label_enabled,
        sso_enabled: data.sso_enabled,
        multi_entity_enabled: data.multi_entity_enabled,
        advanced_analytics_enabled: data.advanced_analytics_enabled,
      }
      
      console.log('🔄 Updating modules for tenant:', tenantId, 'Payload:', updatePayload)
      
      const response = await apiClient.put(url, updatePayload)
      
      console.log('✅ Modules updated successfully:', response)
      return response
    } catch (error) {
      console.error('❌ Failed to update modules:', error)
      throw error
    }
  },

  async getBillingEvents(tenantId, page = 1, perPage = 20) {
    try {
      const url = `${API_BASE_URL}/super-admin/tenants/${tenantId}/billing-events`
      console.log('🔄 Fetching billing events for tenant:', tenantId, 'Page:', page)
      
      const response = await apiClient.get(url, {
        params: {
          page,
          per_page: perPage,
        }
      })
      
      console.log('✅ Billing events fetched successfully:', response)
      return response
    } catch (error) {
      console.error('❌ Failed to fetch billing events:', error)
      throw error
    }
  },

  async updateModuleLimits(tenantId, data) {
    try {
      const url = `${API_BASE_URL}/super-admin/tenants/${tenantId}/modules/limits`
      
      const updatePayload = {
        max_employees_override: data.max_employees_override || 0,
        max_admin_users_override: data.max_admin_users_override || 0,
        max_entities_override: data.max_entities_override || 0,
      }
      
      console.log('🔄 Updating module limits for tenant:', tenantId, 'Payload:', updatePayload)
      
      const response = await apiClient.post(url, updatePayload)
      
      console.log('✅ Module limits updated successfully:', response)
      return response
    } catch (error) {
      console.error('❌ Failed to update module limits:', error)
      throw error
    }
  },

  // ── User Profile ────────────────────────────────────────────────────────────
  async getUserProfile() {
    try {
      const url = `${API_BASE_URL}/users/me`
      console.log('🔄 Fetching user profile')
      
      const response = await apiClient.get(url)
      
      console.log('✅ User profile fetched successfully:', response)
      return response
    } catch (error) {
      console.error('❌ Failed to fetch user profile:', error)
      throw error
    }
  },

  async forgotPassword(email) {
    try {
      const url = `${API_BASE_URL}/auth/forgot-password`
      console.log('🔄 Requesting password reset for email:', email)
      
      const response = await apiClient.post(url, { email })
      
      console.log('✅ Password reset email sent successfully:', response)
      return response
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error)
      throw error
    }
  },

  async resetPassword(token, newPassword) {
    try {
      const url = `${API_BASE_URL}/auth/reset-password`
      console.log('🔄 Resetting password with token')
      
      const response = await apiClient.post(url, {
        token,
        new_password: newPassword,
      })
      
      console.log('✅ Password reset successfully:', response)
      return response
    } catch (error) {
      console.error('❌ Failed to reset password:', error)
      throw error
    }
  },

  async changePassword(currentPassword, newPassword) {
    try {
      const url = `${API_BASE_URL}/auth/change-password`
      console.log('🔄 Changing password')
      
      const response = await apiClient.post(url, {
        current_password: currentPassword,
        new_password: newPassword,
      })
      
      console.log('✅ Password changed successfully:', response)
      return response
    } catch (error) {
      console.error('❌ Failed to change password:', error)
      throw error
    }
  },

  async updateUserProfile(profileData) {
    try {
      const url = `${API_BASE_URL}/users/me`
      console.log('🔄 Updating user profile')
      
      const response = await apiClient.patch(url, {
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        display_name: profileData.display_name,
        phone: profileData.phone,
        avatar_url: profileData.avatar_url,
        timezone: profileData.timezone,
        locale: profileData.locale,
      })
      
      console.log('✅ User profile updated successfully:', response)
      return response
    } catch (error) {
      console.error('❌ Failed to update user profile:', error)
      throw error
    }
  },
}

export default superAdminService