import apiClient from './apiClient'
import { API_BASE_URL } from '../config/api'

const BASE = `${API_BASE_URL}`

const roleService = {
  // Role CRUD
  getRoles:    ()         => apiClient.get(`${BASE}/roles`),
  getAllRoles: (search)   => apiClient.get(`${BASE}/roles`, { params: { search } }),
  getRole:     (id)       => apiClient.get(`${BASE}/roles/${id}`),
  createRole:  (data)     => apiClient.post(`${BASE}/roles`, data),
  updateRole:  (id, data) => apiClient.put(`${BASE}/roles/${id}`, data),
  deleteRole:  (id)       => apiClient.delete(`${BASE}/roles/${id}`),
  
  // Permission Toggle
  togglePermission: (roleId, data) => 
    apiClient.patch(`${BASE}/roles/${roleId}/permissions`, data),
  
  updatePermission: (roleId, module, permission, value) => 
    apiClient.patch(`${BASE}/roles/${roleId}/permissions`, {
      module,
      permission,
      value
    }),
  
  // User Permissions
  getUserPermissions: () => apiClient.get(`${BASE}/roles/user/permissions`),
  
  // Users
  getUsers: () => apiClient.get(`${BASE}/users`),
}

export default roleService
