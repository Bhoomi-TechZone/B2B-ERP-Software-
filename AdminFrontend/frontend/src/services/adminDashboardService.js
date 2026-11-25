import apiClient from './apiClient'
import { API_BASE_URL } from '../config/api'

const adminDashboardService = {
  async getDashboardStats() {
    return await apiClient.get(`${API_BASE_URL}/admin-dashboard/stats`)
  }
}

export default adminDashboardService
