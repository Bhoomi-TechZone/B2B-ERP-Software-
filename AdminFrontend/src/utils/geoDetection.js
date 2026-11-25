// EU Member State country codes
const EU_COUNTRIES = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'IS', 'NO', 'CH'
])

export const VALID_PRICING_REGIONS = ['US', 'UK', 'EU', 'IN']

/**
 * 1. Synchronous Instant Detection (0 ms):
 * Reads user's active session choice, or detects accurately from system timezone & offset.
 */
export function getInitialRegion() {
  if (typeof window === 'undefined') return 'IN'

  // If user explicitly picked a region during THIS session, respect it
  const sessionUserChoice = sessionStorage.getItem('user_selected_region')
  if (sessionUserChoice && VALID_PRICING_REGIONS.includes(sessionUserChoice)) {
    return sessionUserChoice
  }

  // Clear any legacy test keys in localStorage that might have been saved on localhost
  try {
    localStorage.removeItem('preferred_pricing_region')
  } catch {}

  try {
    // 1. Timezone offset check:
    // Indian Standard Time (IST) is UTC+5:30. In JavaScript, getTimezoneOffset() returns -330 minutes.
    // This is 100% reliable hardware-level detection for India.
    const offset = new Date().getTimezoneOffset()
    if (offset === -330) {
      return 'IN'
    }

    // 2. Timezone name check
    const tz = (Intl.DateTimeFormat().resolvedOptions().timeZone || '').toLowerCase()
    if (
      tz.includes('kolkata') ||
      tz.includes('calcutta') ||
      tz.includes('india') ||
      tz.includes('asia/kolkata') ||
      tz.includes('asia/calcutta')
    ) {
      return 'IN'
    }

    if (tz.includes('london') || tz.includes('belfast') || tz.includes('europe/london')) {
      return 'UK'
    }

    if (tz.startsWith('europe/')) {
      return 'EU'
    }

    if (tz.startsWith('america/')) {
      return 'US'
    }

    // 3. Browser Language fallback
    const languages = navigator.languages || [navigator.language || '']
    for (const lang of languages) {
      const lower = lang.toLowerCase()
      if (lower.endsWith('-in') || lower.startsWith('hi-') || lower === 'hi') return 'IN'
      if (lower.endsWith('-gb')) return 'UK'
      if (lower.endsWith('-us')) return 'US'
    }
  } catch (err) {
    console.warn('Browser timezone/locale detection error:', err)
  }

  // Default fallback
  return 'US'
}

/**
 * 2. Background Asynchronous Verification:
 * Fetches user country via lightweight IP geolocation API.
 */
export async function fetchAndVerifyRegion() {
  if (typeof window === 'undefined') return null

  // If user has explicitly picked a preference in this session, keep it
  const sessionUserChoice = sessionStorage.getItem('user_selected_region')
  if (sessionUserChoice && VALID_PRICING_REGIONS.includes(sessionUserChoice)) {
    return sessionUserChoice
  }

  // Instant check: If timezone offset is -330, visitor is definitely in India
  if (new Date().getTimezoneOffset() === -330) {
    return 'IN'
  }

  // IP Geolocation fallback
  const fetchCountry = async (url, extractCountry) => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 2000)
      const res = await fetch(url, { signal: controller.signal })
      clearTimeout(timeoutId)
      if (!res.ok) return null
      const data = await res.json()
      return extractCountry(data)
    } catch {
      return null
    }
  }

  const providers = [
    { url: 'https://freeipapi.com/api/json', fn: (d) => d.countryCode },
    { url: 'https://ipapi.co/json/', fn: (d) => d.country_code },
    { url: 'https://ipwho.is/', fn: (d) => d.country_code },
  ]

  let country = null
  for (const provider of providers) {
    country = await fetchCountry(provider.url, provider.fn)
    if (country) break
  }

  if (!country) return null

  country = country.toUpperCase()
  let detectedRegion = 'US'
  if (country === 'IN') {
    detectedRegion = 'IN'
  } else if (country === 'GB') {
    detectedRegion = 'UK'
  } else if (EU_COUNTRIES.has(country)) {
    detectedRegion = 'EU'
  } else {
    detectedRegion = 'US'
  }

  return detectedRegion
}

/**
 * 3. Save explicit user choice when changed via dropdown
 */
export function saveUserRegionPreference(regionCode) {
  if (VALID_PRICING_REGIONS.includes(regionCode)) {
    sessionStorage.setItem('user_selected_region', regionCode)
  }
}
