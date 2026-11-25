import apiClient from './apiClient'
import { API_BASE_URL } from '../config/api'

const employeeSelfService = {
  async getProfile() {
    return await apiClient.get(`${API_BASE_URL}/me/profile`)
  },
  
  async updateProfile(data) {
    return await apiClient.put(`${API_BASE_URL}/me/profile`, data)
  },
  
  async getPayroll() {
    return await apiClient.get(`${API_BASE_URL}/me/payroll`)
  },
  
  async getDocuments() {
    return await apiClient.get(`${API_BASE_URL}/me/documents`)
  },
  
  async getTickets() {
    return await apiClient.get(`${API_BASE_URL}/me/tickets`)
  },
  
  async createTicket(data) {
    return await apiClient.post(`${API_BASE_URL}/me/tickets`, data)
  },
  
  async changePassword(newPassword) {
    return await apiClient.put(`${API_BASE_URL}/me/settings/password`, { new_password: newPassword })
  },

  async submitReimbursement(data) {
    return await apiClient.post(`${API_BASE_URL}/me/payroll/reimbursement`, data)
  },

  async updateTaxDetails(data) {
    return await apiClient.put(`${API_BASE_URL}/me/payroll/tax-details`, data)
  }
}

export default employeeSelfService
