import apiClient from './apiClient'
import { API_V1_BASE_URL } from '../config/api'

export const exitService = {
  getExitRequests: async () => {
    const response = await apiClient.get(`${API_V1_BASE_URL}/exit-requests`)
    return response.data || response
  },

  createExitRequest: async (data) => {
    const response = await apiClient.post(`${API_V1_BASE_URL}/exit-requests`, data)
    return response.data || response
  },

  updateExitRequest: async (id, data) => {
    const response = await apiClient.patch(`${API_V1_BASE_URL}/exit-requests/${id}`, data)
    return response.data || response
  },

  deleteExitRequest: async (id) => {
    const response = await apiClient.delete(`${API_V1_BASE_URL}/exit-requests/${id}`)
    return response.data || response
  }
}

export default exitService
