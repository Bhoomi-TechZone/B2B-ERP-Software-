import apiClient from './apiClient'
import { API_V1_BASE_URL } from '../config/api'

export const pmService = {
  getDashboardSummary: async () => {
    return await apiClient.get(`${API_V1_BASE_URL}/pm/dashboard-summary`)
  },
  
  getMembers: async () => {
    return await apiClient.get(`${API_V1_BASE_URL}/pm/members`)
  },
  
  createProject: async (projectData) => {
    return await apiClient.post(`${API_V1_BASE_URL}/pm/projects`, projectData)
  },

  updateProject: async (projectId, projectData) => {
    return await apiClient.patch(`${API_V1_BASE_URL}/pm/projects/${projectId}`, projectData)
  },
  
  createTask: async (taskData) => {
    return await apiClient.post(`${API_V1_BASE_URL}/pm/tasks`, taskData)
  },
  
  updateTaskStatus: async (taskId, status) => {
    return await apiClient.patch(`${API_V1_BASE_URL}/pm/tasks/${taskId}/status`, { status })
  },

  updateTaskPriority: async (taskId, priority) => {
    return await apiClient.patch(`${API_V1_BASE_URL}/pm/tasks/${taskId}/status`, { priority })
  },

  getEmployeeSummary: async () => {
    return await apiClient.get(`${API_V1_BASE_URL}/pm/employee/summary`)
  },

  addTaskComment: async (taskId, commentText) => {
    return await apiClient.post(`${API_V1_BASE_URL}/pm/tasks/${taskId}/comments`, { text: commentText })
  },

  uploadTaskAttachment: async (taskId, file) => {
    const formData = new FormData()
    formData.append('file', file)
    return await apiClient.post(`${API_V1_BASE_URL}/pm/tasks/${taskId}/attachments`, formData)
  },

  deleteTaskAttachment: async (taskId, attachmentId) => {
    return await apiClient.delete(`${API_V1_BASE_URL}/pm/tasks/${taskId}/attachments/${attachmentId}`)
  },

  uploadProjectAttachment: async (projectId, file) => {
    const formData = new FormData()
    formData.append('file', file)
    return await apiClient.post(`${API_V1_BASE_URL}/pm/projects/${projectId}/attachments`, formData)
  },

  deleteProjectAttachment: async (projectId, attachmentId) => {
    return await apiClient.delete(`${API_V1_BASE_URL}/pm/projects/${projectId}/attachments/${attachmentId}`)
  }
}

export default pmService
