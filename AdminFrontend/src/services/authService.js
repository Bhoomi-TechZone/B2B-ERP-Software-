import { API_ENDPOINTS, API_BASE_URL, API_V1_BASE_URL } from '../config/api'
import apiClient from './apiClient'

// Public requests (no auth needed) — plain fetch with ngrok header
const publicPost = async (url, body) => {
  let res
  try {
    res = await fetch(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
      body:    JSON.stringify(body),
    })
  } catch (netErr) {
    console.error('Fetch network error:', netErr)
    throw new Error('Unable to connect to the authentication server. Please check your network or server status.')
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 409) {
      throw new Error(data.detail || data.message || 'This email is already registered. Please check your email for the verification link or sign in.')
    }
    if (res.status === 429) {
      throw new Error(
        typeof data.detail === 'string' && data.detail.includes('per')
          ? 'Too many attempts (maximum 100 per hour). Please wait a while before trying again.'
          : (data.detail || data.message || 'Too many attempts (maximum 100 per hour). Please wait a while before trying again.')
      )
    }
    const rawDetail = data.detail || data.message
    if (typeof rawDetail === 'string' && rawDetail.includes('per') && (rawDetail.includes('hour') || rawDetail.includes('minute'))) {
      throw new Error('Too many attempts from this network. Please wait a while before trying again.')
    }
    throw new Error(rawDetail || `Request failed (${res.status})`)
  }
  return data
}

const authService = {
  async login(email, password) {
    const data = await publicPost(API_ENDPOINTS.AUTH.LOGIN, { email, password })
    // Save both tokens
    if (data.access_token)  localStorage.setItem('access_token',  data.access_token)
    if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token)
    if (data.tenant?.primary_region) {
      localStorage.setItem('registered_region', data.tenant.primary_region)
      const countryMapping = { IN: 'India', US: 'United States', UK: 'United Kingdom', GB: 'United Kingdom', EU: 'United Kingdom' }
      localStorage.setItem('registered_country', countryMapping[data.tenant.primary_region] || 'India')
    }
    if (data.tenant?.name) {
      localStorage.setItem('registered_company_name', data.tenant.name)
    }
    return data
  },

  async registerStep1(payload) {
    if (payload.email) payload.email = payload.email.trim().toLowerCase()
    return publicPost(API_ENDPOINTS.AUTH.REGISTER_STEP1, payload)
  },

  async registerStep2(payload) {
    if (payload.email) payload.email = payload.email.trim().toLowerCase()
    return publicPost(API_ENDPOINTS.AUTH.REGISTER_STEP2, payload)
  },

  async verifyEmail(token) {
    const data = await publicPost(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { token })
    if (data.access_token)  localStorage.setItem('access_token',  data.access_token)
    if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token)
    if (data.tenant?.primary_region) {
      localStorage.setItem('registered_region', data.tenant.primary_region)
      const countryMapping = { IN: 'India', US: 'United States', UK: 'United Kingdom', GB: 'United Kingdom', EU: 'United Kingdom' }
      localStorage.setItem('registered_country', countryMapping[data.tenant.primary_region] || 'India')
    }
    if (data.tenant?.name) {
      localStorage.setItem('registered_company_name', data.tenant.name)
    }
    return data
  },

  async resendVerification(email) {
    const normalizedEmail = (email || '').trim().toLowerCase()
    return publicPost(API_ENDPOINTS.AUTH.RESEND_VERIFICATION, { email: normalizedEmail })
  },

  async forgotPassword(email) {
    const normalizedEmail = (email || '').trim().toLowerCase()
    return publicPost(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email: normalizedEmail })
  },

  async resetPassword(payload) {
    return publicPost(API_ENDPOINTS.AUTH.RESET_PASSWORD, payload)
  },

  async verifyResetToken(token) {
    return publicPost(API_ENDPOINTS.AUTH.VERIFY_RESET_TOKEN, { token })
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

  /**
   * Update current user's profile (partial update — only send fields to change).
   * @param {{ first_name?, last_name?, display_name?, phone?, avatar_url?, timezone?, locale? }} data
   */
  async updateProfile(data) {
    return await apiClient.patch(`${API_BASE_URL}/users/me`, data)
  },
}

export default authService
