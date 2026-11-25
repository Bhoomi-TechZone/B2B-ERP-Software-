
import { API_BASE_URL } from '../config/api'

const getAccessToken  = () => localStorage.getItem('access_token')
const getRefreshToken = () => localStorage.getItem('refresh_token')

const saveTokens = ({ access_token, refresh_token }) => {
  if (access_token)  localStorage.setItem('access_token',  access_token)
  if (refresh_token) localStorage.setItem('refresh_token', refresh_token)
}

const clearSession = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('workmatrix.auth.v1')
}

// ── Refresh access token ──────────────────────────────────────────────────────
let isRefreshing = false
let refreshQueue = []   // pending requests waiting for new token

const processQueue = (error, token = null) => {
  refreshQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  )
  refreshQueue = []
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) throw new Error('No refresh token')

  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
    body:    JSON.stringify({ refresh_token: refreshToken }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || err.message || 'Token refresh failed')
  }

  const data = await res.json()
  saveTokens(data)
  return data.access_token
}

// ── Core request function ─────────────────────────────────────────────────────
async function request(url, options = {}, _retry = false) {
  const token = getAccessToken()

  const headers = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }

  if (options.body instanceof FormData) {
    delete headers['Content-Type']
  }

  const res = await fetch(url, { ...options, headers })

  // ── 401 handling ────────────────────────────────────────────────────────────
  if (res.status === 401 && !_retry) {
    if (isRefreshing) {
      // Queue this request until refresh completes
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject })
      }).then(newToken =>
        request(url, {
          ...options,
          headers: { ...headers, Authorization: `Bearer ${newToken}` },
        }, true)
      )
    }

    isRefreshing = true
    try {
      const newToken = await refreshAccessToken()
      processQueue(null, newToken)
      isRefreshing = false
      // Retry original request with new token
      return request(url, {
        ...options,
        headers: { ...headers, Authorization: `Bearer ${newToken}` },
      }, true)
    } catch (err) {
      processQueue(err)
      isRefreshing = false
      console.error('🔴 Token refresh failed or no refresh token. Redirecting to login.')
      clearSession()
      window.location.href = '/login'
      throw err
    }
  }

  // ── Parse response ───────────────────────────────────────────────────────────
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}))
    console.error('❌ API Error:', res.status, JSON.stringify(errData, null, 2))
    
    if (res.status === 429) {
      throw new Error('Too many requests. You have reached the rate limit for this action. Please wait a while before trying again.')
    }
    
    // FastAPI 422 returns { detail: [ { loc, msg, type } ] }
    let message = errData.message || errData.detail
    if (Array.isArray(errData.detail)) {
      message = errData.detail.map(e => `${e.loc?.slice(-1)[0] || 'field'}: ${e.msg}`).join(', ')
    }
    throw new Error(message || `Request failed (${res.status})`)
  }

  // Handle 204 No Content
  if (res.status === 204) return null

  return res.json()
}

// ── Public API ────────────────────────────────────────────────────────────────
const apiClient = {
  get:    (url, opts = {}) => request(url, { ...opts, method: 'GET'    }),
  post:   (url, body, opts = {}) => {
    const isForm = body instanceof FormData
    return request(url, { ...opts, method: 'POST', body: isForm ? body : JSON.stringify(body) })
  },
  put:    (url, body, opts = {}) => {
    const isForm = body instanceof FormData
    return request(url, { ...opts, method: 'PUT', body: isForm ? body : JSON.stringify(body) })
  },
  patch:  (url, body, opts = {}) => {
    const isForm = body instanceof FormData
    return request(url, { ...opts, method: 'PATCH', body: isForm ? body : JSON.stringify(body) })
  },
  delete: (url, opts = {}) => request(url, { ...opts, method: 'DELETE' }),
}

export default apiClient
