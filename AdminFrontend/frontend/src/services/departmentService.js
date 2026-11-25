import { API_BASE_URL } from '../config/api'

const getToken = () => localStorage.getItem('access_token')

const authHeaders = () => ({
  'Authorization': `Bearer ${getToken()}`,
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true',
})

const departmentService = {
  /**
   * Get all departments
   * GET /api/employees/departments
   */
  async getDepartments() {
    const response = await fetch(`${API_BASE_URL}/employees/departments`, {
      headers: authHeaders(),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || errorData.detail || 'Failed to fetch departments')
    }

    return response.json()
  },

  /**
   * Create a new department
   * POST /api/employees/departments
   * @param {Object} departmentData - { name, parent_id?, head_id?, cost_center_code? }
   */
  async createDepartment(departmentData) {
    const response = await fetch(`${API_BASE_URL}/employees/departments`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(departmentData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ createDepartment failed:', response.status, errorData)
      throw new Error(errorData.message || errorData.detail || `Failed to create department (${response.status})`)
    }

    return response.json()
  },

  /**
   * Update a department
   * PUT /api/employees/departments/{id}
   */
  async updateDepartment(id, departmentData) {
    const response = await fetch(`${API_BASE_URL}/employees/departments/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(departmentData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || errorData.detail || 'Failed to update department')
    }

    return response.json()
  },

  /**
   * Delete a department
   * DELETE /api/employees/departments/{id}
   */
  async deleteDepartment(id) {
    const response = await fetch(`${API_BASE_URL}/employees/departments/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || errorData.detail || 'Failed to delete department')
    }

    return response.json()
  }
}

export default departmentService
