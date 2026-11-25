import apiClient from './apiClient'
import { API_BASE_URL } from '../config/api'

const ticketService = {
  async getTickets() {
    return await apiClient.get(`${API_BASE_URL}/v1/tickets`)
  },

  async createTicket(data) {
    return await apiClient.post(`${API_BASE_URL}/v1/tickets`, data)
  },

  async updateStatus(ticketId, status) {
    return await apiClient.patch(`${API_BASE_URL}/v1/tickets/${ticketId}/status`, { status })
  },

  async assignAgent(ticketId, assignData) {
    return await apiClient.patch(`${API_BASE_URL}/v1/tickets/${ticketId}/assign`, assignData)
  },

  async addComment(ticketId, text) {
    return await apiClient.post(`${API_BASE_URL}/v1/tickets/${ticketId}/comments`, { text })
  },

  async bulkUpdateStatus(ticketIds, status) {
    return await apiClient.post(`${API_BASE_URL}/v1/tickets/bulk/status`, { ticket_ids: ticketIds, status })
  },

  async bulkAssign(ticketIds, assignData) {
    return await apiClient.post(`${API_BASE_URL}/v1/tickets/bulk/assign`, {
      ticket_ids: ticketIds,
      assigned_to: assignData.assigned_to,
      assigned_to_id: assignData.assigned_to_id,
      assigned_role: assignData.assigned_role
    })
  },

  async bulkDelete(ticketIds) {
    return await apiClient.post(`${API_BASE_URL}/v1/tickets/bulk/delete`, { ticket_ids: ticketIds })
  }
}

export default ticketService
