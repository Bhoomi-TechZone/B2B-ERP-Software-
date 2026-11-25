import { API_BASE_URL } from '../config/api'
import apiClient from './apiClient'

const TENANT_BASE = `${API_BASE_URL}/super-admin/tenants`

const tenantsService = {
  // Get all tenants
  async getTenants(params = '') {
    try {
      return await apiClient.get(
        `${TENANT_BASE}${params}`
      )
    } catch (error) {
      console.error('Failed to fetch tenants:', error)
      throw error
    }
  },

  // Get single tenant
  async getTenant(id) {
    try {
      return await apiClient.get(
        `${TENANT_BASE}/${id}`
      )
    } catch (error) {
      console.error('Failed to fetch tenant:', error)
      throw error
    }
  },

  // Update tenant status
  async updateTenantStatus(id, status) {
    try {
      return await apiClient.put(
        `${TENANT_BASE}/${id}/status`,
        { status }
      )
    } catch (error) {
      console.error('Failed to update tenant status:', error)
      throw error
    }
  },
}

export default tenantsService