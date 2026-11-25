import { API_BASE_URL, API_V1_BASE_URL } from '../config/api'
import apiClient from './apiClient'

const BASE = `${API_BASE_URL}/invitations`

const invitationService = {
  /**
   * POST /api/invitations/invite
   * { email, first_name, last_name, phone, role, personal_details, notification_prefs }
   */
  invite({ email, first_name, last_name, phone = '', role, personal_details = {}, notification_prefs = {} }) {
    return apiClient.post(`${BASE}/invite`, {
      email,
      first_name,
      last_name,
      phone,
      role,
      personal_details,
      notification_prefs,
    })
  },

  /**
   * GET /api/invitations/validate?token=xxx  (public)
   */
  async validate(token) {
    const res = await fetch(`${BASE}/validate?token=${encodeURIComponent(token)}`, {
      headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.message || data.detail || `Validation failed (${res.status})`)
    return data
  },

  /**
   * POST /api/invitations/accept  (public)
   * { token, password, confirm_password, preferred_name, phone, avatar_url,
   *   personal_details, setup_mfa, mfa_type, notification_prefs }
   */
  async accept({ token, password, confirm_password, preferred_name = '', phone = '',
    avatar_url = '', personal_details = {}, setup_mfa = false, mfa_type = '', notification_prefs = {} }) {
    const res = await fetch(`${BASE}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
      body: JSON.stringify({
        token, password, confirm_password, preferred_name, phone,
        avatar_url, personal_details, setup_mfa, mfa_type, notification_prefs,
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      let message = data.message || data.detail
      if (Array.isArray(data.detail)) {
        message = data.detail.map(e => `${e.loc?.slice(-1)[0] || 'field'}: ${e.msg}`).join(', ')
      }
      throw new Error(message || `Accept failed (${res.status})`)
    }
    return data
  },

  /**
   * POST /api/invitations/revoke
   * { invitation_id, reason }
   */
  revoke(invitation_id, reason = '') {
    return apiClient.post(`${BASE}/revoke`, { invitation_id, reason })
  },

  /**
   * POST /api/v1/onboarding/invitations/{id}/resend
   */
  resend(id) {
    return apiClient.post(`${API_V1_BASE_URL}/onboarding/invitations/${id}/resend`)
  },
}

export default invitationService
