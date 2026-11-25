// Automatically detect development vs production:
// When running on localhost / 127.0.0.1, talk to local FastAPI backend (http://localhost:8000/api)
// When running in production (hrmsb2b.btplsoft.com), talk to production backend
const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

export const API_BASE_URL = isLocalhost 
  ? "http://localhost:8000/api"
  : "https://b2bbackend.btplsoft.com/api"

export const API_V1_BASE_URL = `${API_BASE_URL}/v1`

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REFRESH: `${API_BASE_URL}/auth/refresh`,
    REGISTER_STEP1: `${API_BASE_URL}/auth/register/step1`,
    REGISTER_STEP2: `${API_BASE_URL}/auth/register/step2`,
    VERIFY_EMAIL: `${API_BASE_URL}/auth/verify-email`,
    RESEND_VERIFICATION: `${API_BASE_URL}/auth/resend-verification`,
    FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
    VERIFY_RESET_TOKEN: `${API_BASE_URL}/auth/verify-reset-token`,
  },
  USERS: {
    ME: `${API_BASE_URL}/users/me`,
  },
  PLANS: `${API_V1_BASE_URL}/plans`,
  SUPER_ADMIN: {
    LEADS: `${API_V1_BASE_URL}/superadmin/leads`,
    TENANTS: `${API_V1_BASE_URL}/superadmin/tenants`,
    TENANT_DETAIL: (id) => `${API_V1_BASE_URL}/superadmin/tenants/${id}`,
    PLANS: `${API_V1_BASE_URL}/superadmin/plans`,
    PLAN_DETAIL: (id) => `${API_V1_BASE_URL}/superadmin/plans/${id}`,
    DASHBOARD_STATS: `${API_V1_BASE_URL}/superadmin/dashboard/stats`,
  },
  EMPLOYEES: `${API_V1_BASE_URL}/employees`,
  CRM: {
    DEALS: `${API_V1_BASE_URL}/crm/deals`,
    DEAL_DETAIL: (id) => `${API_V1_BASE_URL}/crm/deals/${id}`,
    DEAL_STAGE: (id) => `${API_V1_BASE_URL}/crm/deals/${id}/stage`,
    DEAL_ACTIVITY: (id) => `${API_V1_BASE_URL}/crm/deals/${id}/activities`,
    LEADS: `${API_V1_BASE_URL}/crm/leads`,
    OPPORTUNITIES: `${API_V1_BASE_URL}/crm/opportunities`,
  },
  NOTES: {
    BASE: `${API_V1_BASE_URL}/notes`,
    STATS: `${API_V1_BASE_URL}/notes/stats`,
    RESOURCE: (resourceType, resourceId) => `${API_V1_BASE_URL}/notes/resource/${resourceType}/${resourceId}`,
    DETAIL: (id) => `${API_V1_BASE_URL}/notes/${id}`,
    REACTIONS: (id) => `${API_V1_BASE_URL}/notes/${id}/reactions`,
  },
  JOB_POSTINGS: {
    BASE: `${API_BASE_URL}/job-postings`,
    DETAIL: (id) => `${API_BASE_URL}/job-postings/${id}`,
  },
}
