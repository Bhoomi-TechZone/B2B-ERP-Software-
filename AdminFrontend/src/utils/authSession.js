/**
 * authSession.js
 * ──────────────────────────────────────────────────────────────────────────
 * Generates opaque, URL-safe session-state tokens for auth page navigation.
 *
 * The token is NOT a real JWT or crypto secret — it is a client-side state
 * blob encoded as Base64url so the URL looks professional and secure
 * (similar to OAuth 2.0 `state` or `op_token` parameters used by
 * Booking.com, Google, Microsoft, etc.).
 *
 * Format of decoded payload:
 *   <timestamp_ms>.<fingerprint>.<scope>.<nonce>
 *
 * Example URL produced:
 *   /auth/sign-in?session_token=MzUxNzIzOTQ1NjgzLmM4ZTQ2YWE.authorize.enterprise&op=authorize&ref=portal&mode=enterprise
 */

/** Encode bytes to URL-safe Base64 (no padding). */
const toBase64Url = (str) =>
  btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')

/**
 * Generate a lightweight browser fingerprint fragment.
 * Not for security — just makes the token look non-trivial.
 */
const browserFragment = () => {
  const nav = typeof navigator !== 'undefined' ? navigator : {}
  const raw = [
    nav.language || 'en',
    nav.platform || 'web',
    screen?.colorDepth || '24',
    new Date().getTimezoneOffset(),
  ].join('|')
  // Simple djb2 hash → hex
  let h = 5381
  for (let i = 0; i < raw.length; i++) h = ((h << 5) + h) ^ raw.charCodeAt(i)
  return (h >>> 0).toString(16).padStart(8, '0')
}

/**
 * Build a 6-char alphanumeric nonce.
 */
const nonce = () =>
  Math.random().toString(36).substring(2, 8).toUpperCase()

/**
 * Generate a URL-safe session-state token.
 *
 * @param {string} scope   - e.g. 'enterprise', 'invite', 'recovery'
 * @returns {string}       - URL-safe Base64url token
 */
export const generateSessionToken = (scope = 'enterprise') => {
  const ts = Date.now()
  const fp = browserFragment()
  const nc = nonce()
  const payload = `${ts}.${fp}.${scope}.${nc}`
  return toBase64Url(payload)
}

/**
 * Build the full sign-in URL with a fresh session token.
 *
 * @param {object} opts
 * @param {string} opts.ref    - Referrer context  (e.g. 'portal', 'invite', 'recovery')
 * @param {string} opts.mode   - Auth mode         (e.g. 'enterprise', 'sso', 'mfa')
 * @param {string} opts.op     - OAuth operation   (e.g. 'authorize', 'recovery', 'accept')
 * @param {string} opts.scope  - Token scope label (e.g. 'enterprise', 'invite')
 * @returns {string}           - Full relative URL
 */
export const buildSignInUrl = ({
  ref   = 'portal',
  mode  = 'enterprise',
  op    = 'authorize',
  scope = 'enterprise',
} = {}) => {
  const token = generateSessionToken(scope)
  return `/auth/sign-in?session_token=${token}&op=${op}&ref=${ref}&mode=${mode}`
}

/**
 * Build the account-recovery URL with a fresh session token.
 */
export const buildRecoveryUrl = ({ ref = 'login' } = {}) => {
  const token = generateSessionToken('recovery')
  return `/auth/account-recovery?session_token=${token}&op=recovery&ref=${ref}&mode=enterprise`
}

/**
 * Build the registration URL with plan context.
 */
export const buildRegisterUrl = ({
  ref     = 'portal',
  plan    = '',
  billing = 'monthly',
  region  = 'IN',
} = {}) => {
  const token = generateSessionToken('register')
  const params = new URLSearchParams({
    session_token: token,
    op:            'register',
    ref,
    mode:          'new-company',
    ...(plan    ? { plan }    : {}),
    ...(billing ? { billing } : {}),
    ...(region  ? { region }  : {}),
  })
  return `/auth/register?${params.toString()}`
}
