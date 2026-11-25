import { API_BASE_URL } from '../config/api'
import apiClient from './apiClient'

// ── Map backend response → frontend shape ─────────────────────────────────────
const mapBackendToFrontend = (b) => {
  if (!b) return null

  // Build sources array from publish flags
  const sources = []
  if (b.publish_company_website) sources.push('Company Website')
  if (b.publish_linkedin) sources.push('LinkedIn')
  if (b.publish_indeed) sources.push('Indeed')
  if (b.publish_naukri) sources.push('Naukri.com')

  return {
    id: b._id ?? b.id ?? '',
    title: b.job_title ?? '',
    location: b.location ?? '',
    description: b.job_description ?? '',
    status: (b.status ?? 'Draft').toLowerCase(),       // "Published" → "published"
    createdAt: b.created_at
      ? new Date(b.created_at).toLocaleDateString()
      : '',
    updatedAt: b.updated_at
      ? new Date(b.updated_at).toLocaleDateString()
      : '',

    // Publish source flags
    publish_company_website: b.publish_company_website ?? false,
    publish_linkedin: b.publish_linkedin ?? false,
    publish_indeed: b.publish_indeed ?? false,
    publish_naukri: b.publish_naukri ?? false,

    // Derived
    sources,

    // Fields the backend doesn't track yet – safe defaults
    type: 'Full-time',
    skills: sources.length > 0 ? sources : ['General'],
    views: 0,
    applications: 0,
    closingDate: '',
    reqId: '',
  }
}

const jobPostingService = {
  /**
   * Get all job postings for the current tenant
   * GET /api/job-postings/
   */
  async getAll() {
    const data = await apiClient.get(`${API_BASE_URL}/job-postings/`)
    if (Array.isArray(data)) {
      return data.map(mapBackendToFrontend)
    }
    // Handle wrapped responses
    if (data?.data && Array.isArray(data.data)) {
      return data.data.map(mapBackendToFrontend)
    }
    return []
  },

  /**
   * Get a single job posting
   * GET /api/job-postings/{jobId}
   */
  async getOne(jobId) {
    const data = await apiClient.get(`${API_BASE_URL}/job-postings/${jobId}`)
    return mapBackendToFrontend(data?.data ?? data)
  },

  /**
   * Create a new job posting
   * POST /api/job-postings/
   * @param {Object} payload – { job_title, location, job_description, publish_company_website, publish_linkedin, publish_indeed, publish_naukri }
   */
  async create(payload) {
    const data = await apiClient.post(`${API_BASE_URL}/job-postings/`, payload)
    return mapBackendToFrontend(data?.data ?? data)
  },

  /**
   * Update a job posting
   * PUT /api/job-postings/{jobId}
   * @param {string} jobId
   * @param {Object} payload – partial update fields
   */
  async update(jobId, payload) {
    const data = await apiClient.put(`${API_BASE_URL}/job-postings/${jobId}`, payload)
    return mapBackendToFrontend(data?.data ?? data)
  },

  /**
   * Delete a job posting
   * DELETE /api/job-postings/{jobId}
   */
  async remove(jobId) {
    await apiClient.delete(`${API_BASE_URL}/job-postings/${jobId}`)
    return true
  },

  /**
   * Toggle publish / unpublish a job posting
   * PUT /api/job-postings/{jobId}  with { status: "Published" | "Draft" }
   */
  async togglePublish(jobId, currentStatus) {
    const newStatus = currentStatus === 'published' ? 'Draft' : 'Published'
    const data = await apiClient.put(`${API_BASE_URL}/job-postings/${jobId}`, {
      status: newStatus,
    })
    return mapBackendToFrontend(data?.data ?? data)
  },
}

export default jobPostingService
