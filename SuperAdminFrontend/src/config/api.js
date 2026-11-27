// Super Admin API Configuration
const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

export const BACKEND_URL = isLocalhost 
  ? 'http://localhost:8000'
  : 'https://b2bbackend.btplsoft.com'

export const API_ROOT = BACKEND_URL

export const API_BASE_URL = `${BACKEND_URL}/api`

export const API_V1_BASE_URL = `${API_BASE_URL}/v1`

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REFRESH: `${API_BASE_URL}/auth/refresh`,
    FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
    CHANGE_PASSWORD: `${API_BASE_URL}/auth/change-password`,
  },
  USER: {
    ME: `${API_BASE_URL}/users/me`,
    UPDATE_PROFILE: `${API_BASE_URL}/users/me`,
  },
  SUPER_ADMIN: {
    DASHBOARD: `${API_BASE_URL}/super-admin/dashboard`,
    LEADS: `${API_BASE_URL}/super-admin/leads`,
    TENANTS: `${API_BASE_URL}/super-admin/tenants`,
    TENANT_DETAIL: (id) => `${API_BASE_URL}/super-admin/tenants/${id}`,
    TENANT_STATUS: (id) => `${API_BASE_URL}/super-admin/tenants/${id}/status`,
    USERS: `${API_BASE_URL}/v1/super-admin/users`,
    USER_DETAIL: (id) => `${API_BASE_URL}/v1/super-admin/users/${id}`,  
    PLANS: `${API_V1_BASE_URL}/superadmin/plans`,
    PLAN_DETAIL: (id) => `${API_V1_BASE_URL}/superadmin/plans/${id}`,
    BILLING: `${API_BASE_URL}/super-admin/billing`,
    SETTINGS: `${API_BASE_URL}/super-admin/settings`,
    ONBOARDING: `${API_BASE_URL}/super-admin/onboarding`,
    SYSTEM_HEALTH: `${API_BASE_URL}/super-admin/system/health`,
    AUDIT_LOGS: `${API_BASE_URL}/super-admin/audit-logs`,
  },
  ONBOARDING: {
    PROGRESS: `${API_V1_BASE_URL}/onboarding/progress`,
    PROGRESS_DETAILED: `${API_V1_BASE_URL}/onboarding/progress/detailed`,
    PROGRESS_BY_TENANT: (tenantId) => `${API_V1_BASE_URL}/onboarding/progress/${tenantId}`,
  },
  SUBSCRIPTION: {
    GET_BY_TENANT: (tenantId) => `${API_BASE_URL}/super-admin/tenants/${tenantId}/subscription`,
    CHANGE_PLAN: (tenantId) => `${API_BASE_URL}/super-admin/tenants/${tenantId}/subscription/change-plan`,
    APPLY_DISCOUNT: (tenantId) => `${API_BASE_URL}/super-admin/tenants/${tenantId}/subscription/apply-discount`,
    EXTEND_TRIAL: (tenantId) => `${API_BASE_URL}/super-admin/tenants/${tenantId}/subscription/extend-trial`,
    CHANGE_STATUS: (tenantId) => `${API_BASE_URL}/super-admin/tenants/${tenantId}/subscription/status`,
    BILLING_HISTORY: (tenantId) => `${API_BASE_URL}/super-admin/tenants/${tenantId}/billing-history`,
    BILLING_EVENTS: (tenantId) => `${API_BASE_URL}/super-admin/tenants/${tenantId}/billing-events`,
  },
  MODULES: {
    GET_BY_TENANT: (tenantId) => `${API_BASE_URL}/super-admin/tenants/${tenantId}/modules`,
    UPDATE_BY_TENANT: (tenantId) => `${API_BASE_URL}/super-admin/tenants/${tenantId}/modules`,
    UPDATE_LIMITS: (tenantId) => `${API_BASE_URL}/super-admin/tenants/${tenantId}/modules/limits`,
  },
  PLANS: {
    LIST: `${API_V1_BASE_URL}/plans`,
  },
}

export default {
  BACKEND_URL,
  API_ROOT,
  API_BASE_URL,
  API_V1_BASE_URL,
  API_ENDPOINTS,
}
