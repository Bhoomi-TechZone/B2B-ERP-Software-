// EU Member State country codes
const EU_COUNTRIES = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'IS', 'NO', 'CH'
])

export const VALID_PRICING_REGIONS = ['US', 'UK', 'EU', 'IN']

/**
 * 1. Synchronous Instant Detection (0 ms):
 * Reads user's stored preference, or detects from browser timezone and locale.
 */
export function getInitialRegion() {
  if (typeof window === 'undefined') return 'US'

  // 1. Manually saved user preference (highest priority)
  const savedPref = localStorage.getItem('preferred_pricing_region')
  if (savedPref && VALID_PRICING_REGIONS.includes(savedPref)) {
    return savedPref
  }

  // 2. Previously detected in current session
  const sessionDetected = sessionStorage.getItem('detected_pricing_region')
  if (sessionDetected && VALID_PRICING_REGIONS.includes(sessionDetected)) {
    return sessionDetected
  }

  // 3. Detect from browser Timezone & Language
  try {
    const tz = (Intl.DateTimeFormat().resolvedOptions().timeZone || '').toLowerCase()
    
    // India
    if (tz.includes('kolkata') || tz.includes('calcutta') || tz.includes('india')) {
      return 'IN'
    }

    // UK
    if (tz.includes('london') || tz.includes('belfast')) {
      return 'UK'
    }

    // Europe
    if (tz.startsWith('europe/')) {
      return 'EU'
    }

    // Language fallback (e.g. en-IN, hi-IN, en-GB)
    const languages = navigator.languages || [navigator.language || '']
    for (const lang of languages) {
      const lower = lang.toLowerCase()
      if (lower.endsWith('-in')) return 'IN'
      if (lower.endsWith('-gb')) return 'UK'
    }
  } catch (err) {
    console.warn('Browser timezone/locale detection error:', err)
  }

  // Default for US and Global / Rest of the World
  return 'US'
}

/**
 * 2. Background Asynchronous Verification:
 * Fetches user country via lightweight IP geolocation API.
 * Updates sessionStorage and returns verified region if different.
 */
export async function fetchAndVerifyRegion() {
  if (typeof window === 'undefined') return null

  // If user has explicitly picked a preference, don't override
  const savedPref = localStorage.getItem('preferred_pricing_region')
  if (savedPref && VALID_PRICING_REGIONS.includes(savedPref)) {
    return savedPref
  }

  // If already verified in this session, return cached
  const sessionVerified = sessionStorage.getItem('detected_pricing_region')
  if (sessionVerified && VALID_PRICING_REGIONS.includes(sessionVerified)) {
    return sessionVerified
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2500) // 2.5s max timeout

    const res = await fetch('https://api.country.is/', {
      signal: controller.signal
    })
    clearTimeout(timeoutId)

    if (!res.ok) return null
    const data = await res.json()
    const country = (data.country || '').toUpperCase()

    let detectedRegion = 'US'
    if (country === 'IN') {
      detectedRegion = 'IN'
    } else if (country === 'GB') {
      detectedRegion = 'UK'
    } else if (EU_COUNTRIES.has(country)) {
      detectedRegion = 'EU'
    } else {
      detectedRegion = 'US' // USA and all other global countries
    }

    sessionStorage.setItem('detected_pricing_region', detectedRegion)
    return detectedRegion
  } catch {
    // Silently ignore if offline, timed out, or blocked by ad-blocker
    return null
  }
}

/**
 * 3. Save explicit user choice when they click any tab
 */
export function saveUserRegionPreference(regionCode) {
  if (VALID_PRICING_REGIONS.includes(regionCode)) {
    localStorage.setItem('preferred_pricing_region', regionCode)
  }
}
