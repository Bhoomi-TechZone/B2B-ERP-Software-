import { API_BASE_URL } from '../config/api'
import apiClient from './apiClient'

const employeeService = {
  /**
   * Create a new employee
   * POST /api/employees/
   * @param {Object} employeeData - The employee data matching the API schema
   */
  async createEmployee(employeeData) {
    return apiClient.post(`${API_BASE_URL}/employees/`, employeeData)
  },

  /**
   * Get all employees with pagination
   * GET /api/employees/?page=1&per_page=20
   */
  async getEmployees(page = 1, perPage = 20) {
    return apiClient.get(`${API_BASE_URL}/employees/?page=${page}&per_page=${perPage}`)
  },

  /**
   * Get a single employee by ID
   * GET /api/employees/{employeeId}
   */
  async getEmployee(employeeId) {
    return apiClient.get(`${API_BASE_URL}/employees/${employeeId}`)
  },

  /**
   * Update an existing employee
   * PUT /api/employees/{employeeId}
   */
  async updateEmployee(employeeId, employeeData) {
    return apiClient.put(`${API_BASE_URL}/employees/${employeeId}`, employeeData)
  },

  /**
   * Deactivate an employee
   * DELETE /api/employees/{employeeId}
   */
  async deactivateEmployee(employeeId) {
    await apiClient.delete(`${API_BASE_URL}/employees/${employeeId}`)
    return true
  },

  /**
   * Update the linked login user's role for an employee
   * PATCH /api/users/employees/{employeeId}/role
   */
  async updateEmployeeRole(employeeId, role) {
    return apiClient.patch(`${API_BASE_URL}/users/employees/${employeeId}/role`, { role })
  },

  /**
   * Send password reset link to the linked login user for an employee
   * POST /api/users/employees/{employeeId}/password-reset
   */
  async sendEmployeePasswordReset(employeeId) {
    return apiClient.post(`${API_BASE_URL}/users/employees/${employeeId}/password-reset`, {})
  },

  /**
   * Get employee documents
   * GET /api/employees/{employeeId}/documents
   */
  async getEmployeeDocuments(employeeId) {
    return apiClient.get(`${API_BASE_URL}/employees/${employeeId}/documents`)
  },

  /**
   * Add employee document
   * POST /api/employees/{employeeId}/documents
   */
  async addEmployeeDocument(employeeId, documentData) {
    return apiClient.post(`${API_BASE_URL}/employees/${employeeId}/documents`, documentData)
  },

  /**
   * Get employee notes
   * GET /api/employees/{employeeId}/notes
   */
  async getEmployeeNotes(employeeId) {
    return apiClient.get(`${API_BASE_URL}/employees/${employeeId}/notes`)
  },

  /**
   * Add employee note
   * POST /api/employees/{employeeId}/notes
   */
  async addEmployeeNote(employeeId, noteData) {
    return apiClient.post(`${API_BASE_URL}/employees/${employeeId}/notes`, noteData)
  },

  /**
   * Get employee attendance logs
   * GET /api/v1/attendance/logs
   */
  async getEmployeeAttendanceLogs(employeeId, startDate, endDate) {
    return apiClient.get(`${API_BASE_URL}/v1/attendance/logs?start_date=${startDate}&end_date=${endDate}&employee_id=${employeeId}`)
  },

  /**
   * Get dynamic dashboard summary for employee dashboard
   * GET /api/employees/me/dashboard-summary
   */
  async getDashboardSummary() {
    return apiClient.get(`${API_BASE_URL}/employees/me/dashboard-summary`)
  },

  /**
   * Apply for leave dynamically
   * POST /api/employees/me/apply-leave
   */
  async applyLeave(leaveData) {
    return apiClient.post(`${API_BASE_URL}/employees/me/apply-leave`, leaveData)
  },

  /**
   * Update task status from the dashboard
   * PATCH /api/v1/pm/tasks/{taskId}/status
   */
  async updateTaskStatus(taskId, status) {
    return apiClient.patch(`${API_BASE_URL}/v1/pm/tasks/${taskId}/status`, { status })
  }
}

export default employeeService
