import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'workmatrix.branding.v1'
const DEFAULT_LOGO = '/logo/WorkMatrix1_logo_design-removebg-preview.png'

const readBranding = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const writeBranding = (data) => {
  try {
    if (data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    }
  } catch {
    /* ignore */
  }
}

export const BrandingContext = createContext(null)

export function BrandingProvider({ children }) {
  const [branding, setBranding] = useState(() => readBranding() || {
    companyName: 'WorkMatrix HRMS',
    logo: DEFAULT_LOGO,
    brandColor: '#1251C5',
    favicon: null,
    supportEmail: 'support@workmatrix.com',
  })

  // Persist branding changes
  useEffect(() => {
    writeBranding(branding)
    // Dispatch custom event so Sidebar/Header can react
    window.dispatchEvent(new CustomEvent('brandingUpdated', { detail: branding }))
  }, [branding])

  // Listen for branding updates from settings page
  useEffect(() => {
    const handler = (e) => {
      if (e.detail) setBranding(e.detail)
    }
    window.addEventListener('brandingUpdated', handler)
    return () => window.removeEventListener('brandingUpdated', handler)
  }, [])

  const updateBranding = useCallback((updates) => {
    setBranding(prev => ({ ...prev, ...updates }))
  }, [])

  const value = useMemo(() => ({
    branding,
    updateBranding,
    companyName: branding.companyName,
    logo: branding.logo,
    brandColor: branding.brandColor,
    favicon: branding.favicon,
    supportEmail: branding.supportEmail,
  }), [branding, updateBranding])

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  )
}

export function useBranding() {
  const ctx = useContext(BrandingContext)
  if (!ctx) {
    return {
      branding: {
        companyName: 'WorkMatrix HRMS',
        logo: DEFAULT_LOGO,
        brandColor: '#1251C5',
        favicon: null,
        supportEmail: 'support@workmatrix.com',
      },
      updateBranding: () => {},
      companyName: 'WorkMatrix HRMS',
      logo: DEFAULT_LOGO,
      brandColor: '#1251C5',
    }
  }
  return ctx
}