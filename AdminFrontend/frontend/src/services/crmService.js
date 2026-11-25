import apiClient from './apiClient'
import { API_V1_BASE_URL } from '../config/api'

const BASE = `${API_V1_BASE_URL}/crm`

const crmService = {
  getLeads: (params = {}) => {
    const query = new URLSearchParams()
    if (params.status && params.status !== 'all') query.append('status', params.status)
    if (params.source && params.source !== 'all') query.append('source', params.source)
    if (params.priority && params.priority !== 'all') query.append('priority', params.priority)
    if (params.assigned_to && params.assigned_to !== 'all') query.append('assigned_to', params.assigned_to)
    if (params.search) query.append('search', params.search)
    
    const queryString = query.toString()
    return apiClient.get(`${BASE}/leads${queryString ? `?${queryString}` : ''}`)
  },
  getLeadById: (id) => apiClient.get(`${BASE}/leads/${id}`),
  createLead: (data) => apiClient.post(`${BASE}/leads`, data),
  updateLead: (id, data) => apiClient.put(`${BASE}/leads/${id}`, data),
  deleteLead: (id) => apiClient.delete(`${BASE}/leads/${id}`),
  assignLeads: (leadIds, assignedTo) => apiClient.patch(`${BASE}/leads/assign`, { lead_ids: leadIds, assigned_to: assignedTo }),
  getSalesAgents: () => apiClient.get(`${API_V1_BASE_URL}/crm/sales-agents`),
  getOpportunities: () => apiClient.get(`${BASE}/opportunities`),
  getPlans: () => apiClient.get(`${API_V1_BASE_URL}/plans`),
  updateOpportunityStage: (oppId, stage) => apiClient.patch(`${BASE}/opportunities/${oppId}/stage?stage=${stage}`),
  qualifyLead: (id, data) => apiClient.patch(`${BASE}/leads/${id}/qualify`, data),
  scheduleDemo: (oppId, data) => apiClient.post(`${BASE}/opportunities/${oppId}/demo/schedule`, data),
  completeDemo: (oppId, data) => apiClient.post(`${BASE}/opportunities/${oppId}/demo/complete`, data),
  createProposal: (oppId, data) => apiClient.post(`${BASE}/opportunities/${oppId}/proposals`, data),
  markOpportunityWon: (oppId, data) => apiClient.post(`${BASE}/opportunities/${oppId}/won`, data),
  markOpportunityLost: (oppId, data) => apiClient.post(`${BASE}/opportunities/${oppId}/lost`, data),
  createClient: (data) => apiClient.post(`${BASE}/clients`, data),
  getClients: () => apiClient.get(`${BASE}/clients`),
  updateClient: (id, data) => apiClient.patch(`${BASE}/clients/${id}`, data),
  sendLeadEmail: (leadId, data) => apiClient.post(`${BASE}/leads/${leadId}/email`, data),
  getLeadActivities: (leadId) => apiClient.get(`${BASE}/leads/${leadId}/activities`),
  logLeadActivity: (leadId, data) => apiClient.post(`${BASE}/leads/${leadId}/activities`, data),
}


export default crmService
