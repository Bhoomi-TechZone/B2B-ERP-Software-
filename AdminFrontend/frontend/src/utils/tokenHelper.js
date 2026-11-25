/**
 * JWT Token Helper Utilities
 */

/**
 * Decode JWT token (without verification - client-side only for debugging)
 */
export function decodeJWT(token) {
  if (!token) return null
  
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const payload = parts[1]
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    return decoded
  } catch (err) {
    console.error('Failed to decode JWT:', err)
    return null
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token) {
  const decoded = decodeJWT(token)
  if (!decoded || !decoded.exp) return true
  
  const now = Math.floor(Date.now() / 1000)
  return decoded.exp < now
}

/**
 * Get token expiry time
 */
export function getTokenExpiry(token) {
  const decoded = decodeJWT(token)
  if (!decoded || !decoded.exp) return null
  
  return new Date(decoded.exp * 1000)
}

/**
 * Check if user has required role
 */
export function hasRole(token, requiredRole) {
  const decoded = decodeJWT(token)
  if (!decoded) return false
  
  // Check various possible role fields
  const userRole = decoded.role || decoded.user_type || decoded.user_role || decoded.type
  
  return userRole === requiredRole
}

/**
 * Get user info from token
 */
export function getUserFromToken(token) {
  const decoded = decodeJWT(token)
  if (!decoded) return null
  
  return {
    id: decoded.sub || decoded.user_id || decoded.id,
    email: decoded.email,
    role: decoded.role || decoded.user_type || decoded.user_role,
    tenantId: decoded.tenant_id,
    exp: decoded.exp,
    iat: decoded.iat,
  }
}
