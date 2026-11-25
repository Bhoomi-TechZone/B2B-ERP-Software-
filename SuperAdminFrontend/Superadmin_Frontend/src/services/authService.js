import { API_ENDPOINTS, API_BASE_URL, API_V1_BASE_URL } from '../config/api'
import apiClient from './apiClient'

// Public requests (no auth needed) — plain fetch with ngrok header
const publicPost = async (url, body) => {
  const res = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
    body:    JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || data.detail || `Request failed (${res.status})`)
  return data
}

const authService = {
  async login(email, password) {
    const data = await publicPost(API_ENDPOINTS.AUTH.LOGIN, { email, password })
    // Save both tokens
    if (data.access_token)  localStorage.setItem('access_token',  data.access_token)
    if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token)
    return data
  },

  async registerStep1(payload) {
    return publicPost(API_ENDPOINTS.AUTH.REGISTER_STEP1, payload)
  },

  async registerStep2(payload) {
    return publicPost(API_ENDPOINTS.AUTH.REGISTER_STEP2, payload)
  },

  async verifyEmail(token) {
    const data = await publicPost(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { token })
    if (data.access_token)  localStorage.setItem('access_token',  data.access_token)
    if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token)
    return data
  },

  async resendVerification(email) {
    return publicPost(API_ENDPOINTS.AUTH.RESEND_VERIFICATION, { email })
  },

  // Authenticated calls use apiClient (auto-refresh on 401)
  async getProfile() {
    // Try multiple possible endpoints
    try {
      return await apiClient.get(`${API_BASE_URL}/users/me`)
    } catch (e1) {
      try {
        return await apiClient.get(`${API_V1_BASE_URL}/users/me`)
      } catch (e2) {
        console.warn('No /users/me endpoint available')
        throw new Error('Profile endpoint not found')
      }
    }
  },
}

export default authService
