import { API_BASE_URL } from '../config/api'

const getToken = () => localStorage.getItem('access_token')

const authHeaders = () => ({
  'Authorization': `Bearer ${getToken()}`,
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true',
})

const attendanceService = {
  /**
   * Fetch today's attendance summary for the logged-in employee
   * GET /api/v1/attendance/today
   */
  async getTodaySummary() {
    const response = await fetch(`${API_BASE_URL}/v1/attendance/today`, {
      headers: authHeaders(),
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || errorData.detail || 'Failed to fetch today\'s summary')
    }
    return response.json()
  },

  /**
   * Web/Mobile Clock In or Clock Out
   * POST /api/v1/attendance/punch
   * @param {Object} punchData - The request payload
   * @param {string} punchData.action - 'check_in' or 'check_out'
   * @param {string} punchData.work_mode - 'office', 'wfh', or 'field'
   * @param {Object} [punchData.location] - optional { latitude, longitude }
   * @param {string} [punchData.notes] - optional notes
   */
  async punch(punchData) {
    const response = await fetch(`${API_BASE_URL}/v1/attendance/punch`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(punchData),
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || errorData.detail || 'Punch request failed')
    }
    return response.json()
  },

  /**
   * Fetch attendance logs for reporting (Admins/HR)
   * GET /api/v1/attendance/logs
   * @param {string} startDate - YYYY-MM-DD
   * @param {string} endDate - YYYY-MM-DD
   * @param {string} [employeeId] - optional filter by employee UUID
   * @param {string} [statusFilter] - optional filter by status
   */
  async getAttendanceLogs(startDate, endDate, employeeId = null, statusFilter = null) {
    let url = `${API_BASE_URL}/v1/attendance/logs?start_date=${startDate}&end_date=${endDate}`
    if (employeeId && employeeId !== 'all') {
      url += `&employee_id=${employeeId}`
    }
    if (statusFilter && statusFilter !== 'All') {
      // Map frontend status label to backend status enum
      // present, absent, late, half_day, on_leave, holiday, wfh
      let mappedStatus = statusFilter.toLowerCase();
      if (mappedStatus === 'present') mappedStatus = 'present'
      else if (mappedStatus === 'absent') mappedStatus = 'absent'
      else if (mappedStatus === 'late') mappedStatus = 'late'
      else if (mappedStatus === 'leave' || mappedStatus === 'on leave') mappedStatus = 'on_leave'
      
      url += `&status_filter=${mappedStatus}`
    }

    const response = await fetch(url, {
      headers: authHeaders(),
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || errorData.detail || 'Failed to fetch attendance logs')
    }
    return response.json()
  },

  /**
   * Request attendance correction/regularisation
   * POST /api/v1/attendance/regularisation/{logId}
   * @param {string} logId - The attendance log UUID
   * @param {Object} data - correction data
   */
  async requestRegularisation(logId, data) {
    const response = await fetch(`${API_BASE_URL}/v1/attendance/regularisation/${logId}`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || errorData.detail || 'Failed to submit regularisation')
    }
    return response.json()
  },

  /**
   * Get attendance regularisation requests
   * GET /api/v1/attendance/regularisations
   */
  async getRegularisations() {
    const response = await fetch(`${API_BASE_URL}/v1/attendance/regularisations`, {
      headers: authHeaders(),
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || errorData.detail || 'Failed to fetch regularisations')
    }
    return response.json()
  },

  /**
   * Approve or Reject regularisation request
   * POST /api/v1/attendance/regularisation/{reqId}/approve
   */
  async processRegularisation(reqId, action, reason = null) {
    let url = `${API_BASE_URL}/v1/attendance/regularisation/${reqId}/approve?action=${action}`
    if (reason) {
      url += `&reason=${encodeURIComponent(reason)}`
    }
    const response = await fetch(url, {
      method: 'POST',
      headers: authHeaders(),
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || errorData.detail || `Failed to ${action} request`)
    }
    return response.json()
  },

  /**
   * Admin Override Attendance Log
   * PUT /api/v1/attendance/logs/{logId}
   * @param {string} logId - The log UUID
   * @param {Object} updateData - update body matching schema
   */
  async adminUpdateLog(logId, updateData) {
    const response = await fetch(`${API_BASE_URL}/v1/attendance/logs/${logId}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(updateData),
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || errorData.detail || 'Failed to update attendance log')
    }
    return response.json()
  },

  /**
   * Fetch all active shift configurations
   * GET /api/v1/attendance/shifts
   */
  async getShifts() {
    const response = await fetch(`${API_BASE_URL}/v1/attendance/shifts`, {
      headers: authHeaders(),
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || errorData.detail || 'Failed to fetch shift configurations')
    }
    return response.json()
  },

  /**
   * Create a new shift configuration
   * POST /api/v1/attendance/shifts
   */
  async createShift(shiftData) {
    const response = await fetch(`${API_BASE_URL}/v1/attendance/shifts`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(shiftData),
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || errorData.detail || 'Failed to create shift configuration')
    }
    return response.json()
  },

  /**
   * Update shift configuration
   * PUT /api/v1/attendance/shifts/{shiftId}
   */
  async updateShift(shiftId, shiftData) {
    const response = await fetch(`${API_BASE_URL}/v1/attendance/shifts/${shiftId}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(shiftData),
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || errorData.detail || 'Failed to update shift configuration')
    }
    return response.json()
  },

  /**
   * Delete shift configuration
   * DELETE /api/v1/attendance/shifts/{shiftId}
   */
  async deleteShift(shiftId) {
    const response = await fetch(`${API_BASE_URL}/v1/attendance/shifts/${shiftId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || errorData.detail || 'Failed to delete shift configuration')
    }
    return response.json()
  },

  /**
   * Direct map shift policy to selected staff
   * POST /api/v1/attendance/shifts/assign
   */
  async assignShift(assignData) {
    const response = await fetch(`${API_BASE_URL}/v1/attendance/shifts/assign`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(assignData),
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || errorData.detail || 'Failed to map shift assignments')
    }
    return response.json()
  },

  /**
   * Fetch tenant global attendance policies
   * GET /api/v1/attendance/policies
   */
  async getGlobalPolicy() {
    const response = await fetch(`${API_BASE_URL}/v1/attendance/policies`, {
      headers: authHeaders(),
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || errorData.detail || 'Failed to fetch global policies')
    }
    return response.json()
  },

  /**
   * Update global attendance policies
   * PUT /api/v1/attendance/policies
   */
  async updateGlobalPolicy(policyData) {
    const response = await fetch(`${API_BASE_URL}/v1/attendance/policies`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(policyData),
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || errorData.detail || 'Failed to update global policies')
    }
    return response.json()
  },

  /**
   * Fetch weekly roster assignments sheet
   * GET /api/v1/attendance/roster?week_start=YYYY-MM-DD
   */
  async getWeeklyRoster(weekStart) {
    const response = await fetch(`${API_BASE_URL}/v1/attendance/roster?week_start=${weekStart}`, {
      headers: authHeaders(),
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || errorData.detail || 'Failed to fetch weekly roster')
    }
    return response.json()
  },

  /**
   * Run Weekly Auto-Roster Engine
   * POST /api/v1/attendance/roster/generate
   */
  async runAutoRoster(weekStart) {
    const response = await fetch(`${API_BASE_URL}/v1/attendance/roster/generate`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ week_start: weekStart }),
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || errorData.detail || 'Failed to generate weekly roster')
    }
    return response.json()
  }
}

export default attendanceService
