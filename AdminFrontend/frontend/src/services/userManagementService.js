import { API_V1_BASE_URL } from '../config/api'

const getToken = () => localStorage.getItem('access_token')

const authHeaders = () => ({
  'Authorization': `Bearer ${getToken()}`,
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true',
})

const userManagementService = {
  /**
   * Get all users across all tenants (for super admin)
   * This aggregates users from all tenants
   */
  async getAllUsers() {
    const response = await fetch(`${API_V1_BASE_URL}/superadmin/users`, {
      headers: authHeaders(),
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ getAllUsers failed:', response.status, errorData)
      throw new Error(errorData.message || errorData.detail || `Failed to fetch users (${response.status})`)
    }
    return response.json()
  },

  /**
   * Get all team invitations across all tenants
   */
  async getAllInvitations() {
    const response = await fetch(`${API_V1_BASE_URL}/superadmin/invitations`, {
      headers: authHeaders(),
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ getAllInvitations failed:', response.status, errorData)
      throw new Error(errorData.message || errorData.detail || `Failed to fetch invitations (${response.status})`)
    }
    return response.json()
  },

  /**
   * Get user detail by ID
   */
  async getUserDetail(userId) {
    const response = await fetch(`${API_V1_BASE_URL}/superadmin/users/${userId}`, {
      headers: authHeaders(),
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ getUserDetail failed:', response.status, errorData)
      throw new Error(errorData.message || errorData.detail || `Failed to fetch user details (${response.status})`)
    }
    return response.json()
  },
}

export default userManagementService
