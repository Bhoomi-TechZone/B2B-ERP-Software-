import axios from 'axios'
import { API_BASE_URL as CONFIG_API_BASE } from '../config/api'

// Strip trailing /api so endpoints like /api/holidays work properly on both local and production
const API_ROOT = (CONFIG_API_BASE || '').replace(/\/api\/?$/, '') ||
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8000'
    : 'https://b2bbackend.btplsoft.com')

// Create axios instance with default config
const api = axios.create({
  baseURL: API_ROOT,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token') || localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const leaveService = {
  // ========== LEAVE POLICIES ==========
  
  /**
   * Get all leave policies
   * @returns {Promise<Array>}
   */
  getPolicies: async () => {
    const response = await api.get('/api/leave-policy')
    return response.data
  },

  /**
   * Get single leave policy
   * @param {string} policyId
   * @returns {Promise<Object>}
   */
  getPolicy: async (policyId) => {
    const response = await api.get(`/api/leave-policy/${policyId}`)
    return response.data
  },

  /**
   * Create new leave policy
   * @param {Object} policyData
   * @returns {Promise<Object>}
   */
  createPolicy: async (policyData) => {
    const response = await api.post('/api/leave-policy', policyData)
    return response.data
  },

  /**
   * Update leave policy
   * @param {string} policyId
   * @param {Object} policyData
   * @returns {Promise<Object>}
   */
  updatePolicy: async (policyId, policyData) => {
    const response = await api.put(`/api/leave-policy/${policyId}`, policyData)
    return response.data
  },

  /**
   * Delete leave policy
   * @param {string} policyId
   * @returns {Promise<Object>}
   */
  deletePolicy: async (policyId) => {
    const response = await api.delete(`/api/leave-policy/${policyId}`)
    return response.data
  },

  // ========== LEAVE REQUESTS ==========
  
  /**
   * Get all leave requests (HR view)
   * @param {Object} filters - { status, department, employee_id }
   * @returns {Promise<Array>}
   */
  getAllLeaveRequests: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString()
    const response = await api.get(`/api/employee-leave/all?${params}`)
    return response.data
  },

  /**
   * Get employee's own leave requests
   * @returns {Promise<Array>}
   */
  getMyLeaveRequests: async () => {
    const response = await api.get('/api/leave-requests/me')
    return response.data
  },

  /**
   * Apply for leave
   * @param {Object} leaveData - { leave_type, start_date, end_date, reason, half_day, contact_number }
   * @returns {Promise<Object>}
   */
  applyLeave: async (leaveData) => {
    const response = await api.post('/api/leave-requests', leaveData)
    return response.data
  },

  /**
   * Approve leave request (HR only)
   * @param {string} requestId
   * @param {string} comments
   * @returns {Promise<Object>}
   */
  approveLeaveRequest: async (requestId, comments = '') => {
    const response = await api.put(`/api/employee-leave/${requestId}/action`, { 
      status: 'Approved',
      reason: comments 
    })
    return response.data
  },

  /**
   * Reject leave request (HR only)
   * @param {string} requestId
   * @param {string} reason
   * @returns {Promise<Object>}
   */
  rejectLeaveRequest: async (requestId, reason = '') => {
    const response = await api.put(`/api/employee-leave/${requestId}/action`, { 
      status: 'Rejected',
      reason: reason 
    })
    return response.data
  },

  /**
   * Cancel leave request
   * @param {string} requestId
   * @returns {Promise<Object>}
   */
  cancelLeaveRequest: async (requestId) => {
    const response = await api.put(`/api/employee-leave/${requestId}/cancel`)
    return response.data
  },

  // ========== LEAVE BALANCE ==========
  
  /**
   * Get employee's leave balance
   * @returns {Promise<Array>}
   */
  getMyLeaveBalance: async () => {
    const response = await api.get('/api/leave-assignment/my-balance')
    return response.data
  },

  /**
   * Get all employees' leave balance (HR view)
   * @param {Object} filters - { department, leave_type, employee_id }
   * @returns {Promise<Array>}
   */
  getAllLeaveBalances: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString()
    const response = await api.get(`/api/leave-assignment/leave-balance?${params}`)
    return response.data
  },

  /**
   * Get specific employee's leave balance (HR view)
   * @param {string} employeeId
   * @returns {Promise<Array>}
   */
  getEmployeeLeaveBalance: async (employeeId) => {
    const response = await api.get(`/api/leave-balance/${employeeId}`)
    return response.data
  },

  // ========== LEAVE ASSIGNMENT ==========
  
  /**
   * Assign leave policy to employees
   * @param {Object} assignmentData - { policy_id, employee_ids[], effective_from }
   * @returns {Promise<Object>}
   */
  assignPolicyToEmployees: async (assignmentData) => {
    const response = await api.post('/api/leave-assignment/assign', assignmentData)
    return response.data
  },

  /**
   * Get all leave assignments
   * @returns {Promise<Array>}
   */
  getLeaveAssignments: async () => {
    const response = await api.get('/api/leave-assignment')
    return response.data
  },

  /**
   * Get my leave assignments
   * @returns {Promise<Array>}
   */
  getMyLeaveAssignments: async () => {
    const response = await api.get('/api/leave-assignment/my')
    return response.data
  },

  /**
   * Update leave assignment
   * @param {string} assignmentId
   * @param {Object} updateData - { total_days, remaining_days, status }
   * @returns {Promise<Object>}
   */
  updateLeaveAssignment: async (assignmentId, updateData) => {
    const response = await api.put(`/api/leave-assignment/${assignmentId}`, updateData)
    return response.data
  },

  /**
   * Delete leave assignment
   * @param {string} assignmentId
   * @returns {Promise<Object>}
   */
  deleteLeaveAssignment: async (assignmentId) => {
    const response = await api.delete(`/api/leave-assignment/${assignmentId}`)
    return response.data
  },

  // ========== HOLIDAYS ==========
  
  /**
   * Get all holidays
   * @param {Object} filters - { year, region, type }
   * @returns {Promise<Array>}
   */
  getHolidays: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString()
    const query = params ? `?${params}` : ''
    const response = await api.get(`/api/holidays/${query}`)
    return response.data
  },

  /**
   * Create holiday
   * @param {Object} holidayData - { name, date, type, region, description }
   * @returns {Promise<Object>}
   */
  createHoliday: async (holidayData) => {
    const response = await api.post('/api/holidays/', holidayData)
    return response.data
  },

  /**
   * Update holiday
   * @param {string} holidayId
   * @param {Object} holidayData
   * @returns {Promise<Object>}
   */
  updateHoliday: async (holidayId, holidayData) => {
    const response = await api.put(`/api/holidays/${holidayId}/`, holidayData)
    return response.data
  },

  /**
   * Delete holiday
   * @param {string} holidayId
   * @returns {Promise<Object>}
   */
  deleteHoliday: async (holidayId) => {
    const response = await api.delete(`/api/holidays/${holidayId}/`)
    return response.data
  },

  // ========== LEAVE ADJUSTMENT ==========
  
  /**
   * Add leave balance to employee
   * @param {Object} adjustmentData - { employee_id, days, reason, effective_date, type }
   * @returns {Promise<Object>}
   */
  addLeaveBalance: async (adjustmentData) => {
    const response = await api.post('/api/leave-assignment/add-leave', adjustmentData)
    return response.data
  },

  /**
   * Deduct leave balance from employee
   * @param {Object} adjustmentData - { employee_id, days, reason, effective_date, type }
   * @returns {Promise<Object>}
   */
  deductLeaveBalance: async (adjustmentData) => {
    const response = await api.post('/api/leave-assignment/deduct-leave', adjustmentData)
    return response.data
  },

  // ========== LEAVE CALENDAR ==========
  
  /**
   * Get team leave calendar
   * @param {Object} filters - { start_date, end_date, department }
   * @returns {Promise<Array>}
   */
  getTeamLeaveCalendar: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString()
    const response = await api.get(`/api/leave-calendar?${params}`)
    return response.data
  },

  // ========== DASHBOARD / SUMMARY ==========
  
  /**
   * Get leave dashboard summary
   * @returns {Promise<Object>}
   */
  getLeaveDashboard: async () => {
    const response = await api.get('/api/leave-dashboard')
    return response.data
  },
}

export default leaveService
