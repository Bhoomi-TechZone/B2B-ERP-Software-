import { API_ENDPOINTS, API_BASE_URL } from '../config/api'
import apiClient from './apiClient'

const RESOURCE_ID = '00000000-0000-0000-0000-000000000021'

export const DEFAULT_NOTES_RESOURCE = {
  resourceType: 'project',
  resourceId: RESOURCE_ID,
}

export const notesService = {
  getStats() {
    return apiClient.get(API_ENDPOINTS.NOTES.STATS)
  },

  getResourceNotes(resourceType = DEFAULT_NOTES_RESOURCE.resourceType, resourceId = DEFAULT_NOTES_RESOURCE.resourceId) {
    return apiClient.get(API_ENDPOINTS.NOTES.RESOURCE(resourceType, resourceId))
  },

  createNote(payload) {
    return apiClient.post(API_ENDPOINTS.NOTES.BASE, {
      resource_type: DEFAULT_NOTES_RESOURCE.resourceType,
      resource_id: DEFAULT_NOTES_RESOURCE.resourceId,
      ...payload,
    })
  },

  updateNote(noteId, payload) {
    return apiClient.patch(API_ENDPOINTS.NOTES.DETAIL(noteId), payload)
  },

  deleteNote(noteId) {
    return apiClient.delete(API_ENDPOINTS.NOTES.DETAIL(noteId))
  },

  addReaction(noteId, emoji) {
    return apiClient.post(API_ENDPOINTS.NOTES.REACTIONS(noteId), { emoji })
  },

  async searchEmployees(query = '') {
    const params = new URLSearchParams({ per_page: '8' })
    if (query.trim()) params.set('search', query.trim())
    return apiClient.get(`${API_BASE_URL}/employees/?${params.toString()}`)
  },
}

