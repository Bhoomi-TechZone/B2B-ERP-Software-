import apiClient from './apiClient'
import { API_BASE_URL } from '../config/api'

const announcementService = {
  async getAnnouncements() {
    return await apiClient.get(`${API_BASE_URL}/announcements`)
  },
  
  async markAsRead(announcementId) {
    return await apiClient.post(`${API_BASE_URL}/announcements/${announcementId}/read`)
  },

  async createAnnouncement(payload) {
    return await apiClient.post(`${API_BASE_URL}/announcements`, payload)
  }
}

export default announcementService
