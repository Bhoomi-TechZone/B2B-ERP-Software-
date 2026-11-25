import apiClient from './apiClient'
import { API_V1_BASE_URL } from '../config/api'

const BASE = `${API_V1_BASE_URL}/recruitment`

const recruitmentService = {
  // ── Candidates ──────────────────────────────────────────────────────────
  getCandidates: (params = {}) => {
    const query = new URLSearchParams()
    if (params.status && params.status !== 'all') query.append('status', params.status)
    if (params.stage && params.stage !== 'all') query.append('stage', params.stage)
    if (params.search) query.append('search', params.search)
    const qs = query.toString()
    return apiClient.get(`${BASE}/candidates${qs ? `?${qs}` : ''}`)
  },

  getCandidateById: (id) => apiClient.get(`${BASE}/candidates/${id}`),

  createCandidate: (data) => apiClient.post(`${BASE}/candidates`, data),

  updateCandidate: (id, data) => apiClient.patch(`${BASE}/candidates/${id}`, data),

  updateCandidateStage: (id, stage) => apiClient.patch(`${BASE}/candidates/${id}/stage`, { stage }),

  deleteCandidate: (id) => apiClient.delete(`${BASE}/candidates/${id}`),

  convertToEmployee: (id) => apiClient.post(`${BASE}/candidates/${id}/convert-to-employee`),

  // ── Interviews ──────────────────────────────────────────────────────────
  getInterviews: () => apiClient.get(`${BASE}/interviews`),

  scheduleInterview: (data) => apiClient.post(`${BASE}/interviews`, data),

  updateInterview: (id, data) => apiClient.patch(`${BASE}/interviews/${id}`, data),

  // ── Offers ──────────────────────────────────────────────────────────────
  getOffers: () => apiClient.get(`${BASE}/offers`),

  createOffer: (data) => apiClient.post(`${BASE}/offers`, data),

  updateOffer: (id, data) => apiClient.patch(`${BASE}/offers/${id}`, data),

  // ── Stats ───────────────────────────────────────────────────────────────
  getStats: () => apiClient.get(`${BASE}/stats`),
}

export default recruitmentService
