/**
 * Payroll Service - handles India, US, and UK payroll operations
 */
import apiClient from './apiClient'
import { API_BASE_URL } from '../config/api'

const payrollService = {
  // ─── Employee Payroll Config ─────────────────────────────────────────────────
  /**
   * Create or update employee payroll configuration
   * @param {Object} data - Payroll config data
   * @returns {Promise<Object>}
   */
  async createOrUpdateConfig(data) {
    return apiClient.post(`${API_BASE_URL}/payroll/config`, data)
  },

  /**
   * Get all employee payroll configs for a region
   * @param {string} region - IN, US, or UK
   * @returns {Promise<Array>}
   */
  async getConfigs(region) {
    return apiClient.get(`${API_BASE_URL}/payroll/config/${region}`)
  },

  // ─── Dashboard ───────────────────────────────────────────────────────────────
  /**
   * Get payroll dashboard with employee list, summary, and dept breakdown
   * @param {string} region - IN, US, or UK
   * @returns {Promise<Object>}
   */
  async getDashboard(region) {
    return apiClient.get(`${API_BASE_URL}/payroll/dashboard/${region}`)
  },

  // ─── Preview Payroll ─────────────────────────────────────────────────────────
  /**
   * Preview payroll calculations before running
   * @param {string} region - IN, US, or UK
   * @param {number} month - 1-12
   * @param {number} year - Year
   * @param {Array<string>} employeeIds - Optional array of employee IDs
   * @returns {Promise<Object>}
   */
  async previewPayroll(region, month, year, employeeIds = null) {
    const params = new URLSearchParams({ month, year })
    if (employeeIds && employeeIds.length > 0) {
      params.append('employee_ids', employeeIds.join(','))
    }
    return apiClient.get(`${API_BASE_URL}/payroll/preview/${region}?${params}`)
  },

  // ─── Run Payroll ─────────────────────────────────────────────────────────────
  /**
   * Execute payroll run and generate payslips
   * @param {Object} data - { region, month, year, employee_ids? }
   * @returns {Promise<Object>}
   */
  async runPayroll(data) {
    return apiClient.post(`${API_BASE_URL}/payroll/run`, data)
  },

  // ─── Get Payslips ────────────────────────────────────────────────────────────
  /**
   * Get payslips with filters
   * @param {string} region - IN, US, or UK
   * @param {Object} filters - { month?, year?, status?, search? }
   * @returns {Promise<Array>}
   */
  async getPayslips(region, filters = {}) {
    const params = new URLSearchParams()
    if (filters.month) params.append('month', filters.month)
    if (filters.year) params.append('year', filters.year)
    if (filters.status) params.append('status', filters.status)
    if (filters.search) params.append('search', filters.search)
    
    const queryString = params.toString()
    const url = `${API_BASE_URL}/payroll/payslips/${region}${queryString ? `?${queryString}` : ''}`
    return apiClient.get(url)
  },
}

export default payrollService
