import apiClient from './apiClient'
import { API_BASE_URL } from '../config/api'

const BASE = `${API_BASE_URL}/v1/superadmin`

const superAdminService = {
  getLeads:         ()           => apiClient.get(`${BASE}/leads`),
  getTenants:       ()           => apiClient.get(`${BASE}/tenants?page=1&limit=20`),
  getTenantDetail:  (id)         => apiClient.get(`${BASE}/tenants/${id}`),
  getPlans:         ()           => apiClient.get(`${BASE}/plans`),
  getPlanById:      (id)         => apiClient.get(`${BASE}/plans/${id}`),

  createPlan:       (data)       => apiClient.post(`${BASE}/plans`, data),
  updatePlan:       (id, data)   => apiClient.put(`${BASE}/plans/${id}`, data),
  deletePlan:       (id)         => apiClient.delete(`${BASE}/plans/${id}`),

  getSettings:      ()           => apiClient.get(`${API_BASE_URL}/super-admin/platform-settings`),
  updateSettings:   (data)       => apiClient.put(`${API_BASE_URL}/super-admin/platform-settings`, data),
  getSettingsAudit: ()           => apiClient.get(`${API_BASE_URL}/super-admin/platform-settings/audit`),

  // ── Branding APIs ──
  getBranding:      ()           => apiClient.get(`${API_BASE_URL}/super-admin/branding`),
  updateBranding:   (data)       => apiClient.put(`${API_BASE_URL}/super-admin/branding`, data),
  uploadBrandLogo:  (file)       => {
    const formData = new FormData()
    formData.append('logo', file)
    return apiClient.post(`${API_BASE_URL}/super-admin/branding/logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

export default superAdminService
