/**
 * JWT Token Helper Functions
 * Utilities for handling JWT tokens in the frontend
 */

/**
 * Decode JWT token (without verification - for frontend use only)
 * @param {string} token - JWT token
 * @returns {object|null} - Decoded payload or null if invalid
 */
export function decodeJWT(token) {
  try {
    if (!token) return null
    
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const payload = parts[1]
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    
    return decoded
  } catch (error) {
    console.error('Error decoding JWT:', error)
    return null
  }
}

/**
 * Check if JWT token is expired
 * @param {string} token - JWT token
 * @returns {boolean} - True if expired, false otherwise
 */
export function isTokenExpired(token) {
  try {
    const decoded = decodeJWT(token)
    if (!decoded || !decoded.exp) return true
    
    const currentTime = Math.floor(Date.now() / 1000)
    return decoded.exp < currentTime
  } catch (error) {
    console.error('Error checking token expiration:', error)
    return true
  }
}

/**
 * Get user information from JWT token
 * @param {string} token - JWT token
 * @returns {object|null} - User info or null if invalid
 */
export function getUserFromToken(token) {
  try {
    const decoded = decodeJWT(token)
    if (!decoded) return null
    
    return {
      id: decoded.sub || decoded.user_id || decoded.id,
      name: decoded.name || decoded.full_name,
      email: decoded.email,
      role: decoded.role || decoded.user_role,
      permissions: decoded.permissions || [],
      tenant_id: decoded.tenant_id,
      exp: decoded.exp,
      iat: decoded.iat
    }
  } catch (error) {
    console.error('Error extracting user from token:', error)
    return null
  }
}

/**
 * Get token expiration time in human readable format
 * @param {string} token - JWT token
 * @returns {string|null} - Formatted expiration time or null
 */
export function getTokenExpiration(token) {
  try {
    const decoded = decodeJWT(token)
    if (!decoded || !decoded.exp) return null
    
    const expDate = new Date(decoded.exp * 1000)
    return expDate.toLocaleString()
  } catch (error) {
    console.error('Error getting token expiration:', error)
    return null
  }
}

/**
 * Check if user has specific role
 * @param {string} token - JWT token
 * @param {string|string[]} requiredRoles - Required role(s)
 * @returns {boolean} - True if user has required role
 */
export function hasRole(token, requiredRoles) {
  try {
    const user = getUserFromToken(token)
    if (!user || !user.role) return false
    
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
    return roles.includes(user.role)
  } catch (error) {
    console.error('Error checking user role:', error)
    return false
  }
}

/**
 * Check if user has specific permission
 * @param {string} token - JWT token
 * @param {string} permission - Required permission
 * @returns {boolean} - True if user has permission
 */
export function hasPermission(token, permission) {
  try {
    const user = getUserFromToken(token)
    if (!user || !user.permissions) return false
    
    return user.permissions.includes(permission)
  } catch (error) {
    console.error('Error checking user permission:', error)
    return false
  }
}

/**
 * Get time until token expires (in minutes)
 * @param {string} token - JWT token
 * @returns {number|null} - Minutes until expiration or null
 */
export function getTimeUntilExpiration(token) {
  try {
    const decoded = decodeJWT(token)
    if (!decoded || !decoded.exp) return null
    
    const currentTime = Math.floor(Date.now() / 1000)
    const timeLeft = decoded.exp - currentTime
    
    return Math.floor(timeLeft / 60) // Convert to minutes
  } catch (error) {
    console.error('Error calculating time until expiration:', error)
    return null
  }
}

/**
 * Create a mock JWT token for development/testing
 * @param {object} payload - Token payload
 * @param {number} expiresInHours - Expiration time in hours (default: 24)
 * @returns {string} - Mock JWT token
 */
export function createMockToken(payload, expiresInHours = 24) {
  const header = {
    typ: 'JWT',
    alg: 'HS256'
  }
  
  const now = Math.floor(Date.now() / 1000)
  const exp = now + (expiresInHours * 60 * 60)
  
  const tokenPayload = {
    iat: now,
    exp: exp,
    ...payload
  }
  
  // Base64 encode (for demo purposes only - not secure)
  const encodedHeader = btoa(JSON.stringify(header))
  const encodedPayload = btoa(JSON.stringify(tokenPayload))
  const signature = 'mock_signature'
  
  return `${encodedHeader}.${encodedPayload}.${signature}`
}