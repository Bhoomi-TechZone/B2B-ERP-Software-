import { API_BASE_URL } from '../config/api'

const getToken = () => localStorage.getItem('access_token')

const authHeaders = () => ({
  'Authorization': `Bearer ${getToken()}`,
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true',
})

const jobTitleService = {
  /**
   * Get all job titles
   * GET /api/employees/job-titles
   */
  async getJobTitles() {
    const response = await fetch(`${API_BASE_URL}/employees/job-titles`, {
      headers: authHeaders(),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || errorData.detail || 'Failed to fetch job titles')
    }

    return response.json()
  },

  /**
   * Create a new job title
   * POST /api/employees/job-titles
   * @param {Object} jobTitleData - { title, description?, department_id? }
   */
  async createJobTitle(jobTitleData) {
    const response = await fetch(`${API_BASE_URL}/employees/job-titles`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(jobTitleData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ createJobTitle failed:', response.status, errorData)
      let errMsg = errorData.message || 'Failed to create job title'
      if (errorData.detail) {
        errMsg = typeof errorData.detail === 'string' 
          ? errorData.detail 
          : JSON.stringify(errorData.detail)
      }
      throw new Error(errMsg)
    }

    return response.json()
  }
}

export default jobTitleService
