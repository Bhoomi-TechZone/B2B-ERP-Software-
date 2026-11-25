import { API_V1_BASE_URL } from '../config/api'

const plansService = {
  /**
   * Public endpoint — no auth required
   * GET /api/v1/plans?page=1&per_page=20
   */
  async getActivePlans(page = 1, perPage = 20) {
    const response = await fetch(
      `${API_V1_BASE_URL}/plans?page=${page}&per_page=${perPage}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      }
    )
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || err.detail || `Failed to fetch plans (${response.status})`)
    }
    return response.json()
  },
}

export default plansService
