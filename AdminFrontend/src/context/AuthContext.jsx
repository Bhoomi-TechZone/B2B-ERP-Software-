import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { ROLE_IDS, ROLES, SEED_USERS, getRoleLanding } from '../config/roles'
import { API_ENDPOINTS, API_BASE_URL } from '../config/api'
import apiClient from '../services/apiClient'

const STORAGE_KEY = 'workmatrix.auth.v1'

const readStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.role || !ROLES[parsed.role]) return null
    return parsed
  } catch {
    return null
  }
}

const writeStorage = (state) => {
  try {
    if (state) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    /* ignore quota / availability errors in private mode */
  }
}

/** Fetch user profile from API */
const fetchUserProfile = async () => {
  try {
    const token = localStorage.getItem('access_token')
    if (!token) return null
    return await apiClient.get(API_ENDPOINTS.USERS.ME)
  } catch (error) {
    console.error('Failed to fetch user profile:', error)
    return null
  }
}

/** Legacy key from the original RoleSwitcher demo — kept in sync for back-compat. */
const LEGACY_ROLE_KEY = 'userRole'
const LEGACY_ROLE_MAP = {
  admin: ROLE_IDS.SUPER_ADMIN,
  hr:    ROLE_IDS.HR,
  sales: ROLE_IDS.SALES,
}
const REVERSE_LEGACY = {
  [ROLE_IDS.SUPER_ADMIN]: 'admin',
  [ROLE_IDS.HR]:          'hr',
  [ROLE_IDS.SALES]:       'sales',
  [ROLE_IDS.MANAGER]:     'manager',
  [ROLE_IDS.EMPLOYEE]:    'employee',
}
const syncLegacy = (roleId) => {
  try { localStorage.setItem(LEGACY_ROLE_KEY, REVERSE_LEGACY[roleId] || 'admin') } catch { /* noop */ }
}

const buildSession = (roleId, overrides = {}) => {
  console.log('=== buildSession called ===')
  console.log('Input roleId:', roleId)
  console.log('Overrides:', overrides)
  
  const roleExists = ROLES[roleId]
  console.log('Role exists in ROLES:', !!roleExists)
  
  const role = roleExists ? roleId : (roleId || ROLE_IDS.EMPLOYEE)
  console.log('Final role assigned:', role)
  
  const seed = SEED_USERS[role] || SEED_USERS[ROLE_IDS.EMPLOYEE]
  const session = {
    role,
    user: {
      id:         overrides.id         || seed.id,
      name:       overrides.name       || seed.name,
      email:      overrides.email      || seed.email,
      department: overrides.department || seed.department,
      token:      overrides.token      || null,
      firstName:  overrides.firstName  || null,
      lastName:   overrides.lastName   || null,
      displayName: overrides.displayName || null,
      phone:      overrides.phone      || null,
      avatarUrl:  overrides.avatarUrl  || null,
      status:     overrides.status     || 'active',
      userModules: overrides.userModules || null,
    },
    company: overrides.company || null,
    tenant: overrides.tenant || null,
  }
  console.log('Built session:', session)
  return session
}

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    // First boot: try new key; fall back to legacy "userRole" demo key.
    const existing = readStorage()
    if (existing) {
      syncLegacy(existing.role)
      return existing
    }
    const legacyRaw = (() => { try { return localStorage.getItem(LEGACY_ROLE_KEY) } catch { return null } })()
    if (legacyRaw && LEGACY_ROLE_MAP[legacyRaw]) {
      const next = buildSession(LEGACY_ROLE_MAP[legacyRaw])
      writeStorage(next)
      return next
    }
    return null
  })

  // Fetch user profile on mount if token exists
  useEffect(() => {
    const loadUserProfile = async () => {
      const token = localStorage.getItem('access_token')
      if (!token) return

      const profileData = await fetchUserProfile()
      if (profileData) {
        const { user, tenant } = profileData
        
        // Map API role to internal role
        const roleMap = {
          'super_admin': ROLE_IDS.SUPER_ADMIN,
          'tenant_admin': ROLE_IDS.SUPER_ADMIN,
          'owner': ROLE_IDS.SUPER_ADMIN,
          'admin': ROLE_IDS.SUPER_ADMIN,
          'admin_user': ROLE_IDS.SUPER_ADMIN,
          'platform_admin': ROLE_IDS.SUPER_ADMIN,
          'hr_admin': ROLE_IDS.HR_ADMIN,
          'hr_manager': ROLE_IDS.HR,
          'hr': ROLE_IDS.HR,
          'manager': ROLE_IDS.MANAGER,
          'sales': ROLE_IDS.SALES,
          'sales_executive': ROLE_IDS.SALES,
          'employee': ROLE_IDS.EMPLOYEE,
          'payroll_admin': ROLE_IDS.PAYROLL_ADMIN,
          'recruiter': ROLE_IDS.RECRUITER,
          'finance_viewer': ROLE_IDS.FINANCE_VIEWER,
          'it_admin': ROLE_IDS.IT_ADMIN,
        }
        
        const apiRole = (user.role || user.user_type || '').toLowerCase().trim().replace(/\s+/g, '_')
        const apiMappedRole = apiRole ? roleMap[apiRole] : null
        const exactRoleName = (user.role || user.user_type || '').trim()

        let userModules = null
        try {
          const data = await apiClient.get(`${API_BASE_URL}/roles/user/permissions`)
          if (data && data.permissions) {
            userModules = data.permissions
          }
        } catch(e) {
          console.error('Failed to load user modules:', e)
        }

        setSession(prev => {
          const existingRole = prev?.role
          let finalRole
          if (!existingRole) {
            finalRole = apiMappedRole || exactRoleName || ROLE_IDS.EMPLOYEE
          } else if (apiMappedRole && apiMappedRole !== ROLE_IDS.EMPLOYEE) {
            finalRole = apiMappedRole
          } else if (exactRoleName && exactRoleName.toLowerCase() !== 'employee') {
            finalRole = exactRoleName
          } else {
            finalRole = existingRole
          }

          return buildSession(finalRole, {
            ...(prev?.user || {}),
            userModules,
            id: user.id,
            name: user.display_name || `${user.first_name} ${user.last_name}`.trim(),
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            displayName: user.display_name,
            phone: user.phone,
            avatarUrl: user.avatar_url,
            status: user.status,
            token,
            company: prev?.company,
            tenant: {
              ...(prev?.tenant || {}),
              id: tenant.id,
              name: tenant.name,
              slug: tenant.slug,
              subdomain: tenant.subdomain,
              status: tenant.status,
              region: tenant.primary_region,
              currency: tenant.primary_currency,
              logoUrl: tenant.logo_url,
              brandColor: tenant.brand_color,
              timezone: tenant.timezone,
              dateFormat: tenant.date_format,
              onboardingCompleted: tenant.onboarding_completed,
              onboardingStep: tenant.onboarding_step,
              planId: tenant.plan_id,
              modules: tenant.modules || {},
              planLimits: tenant.plan_limits || {},
              planUsage: tenant.plan_usage || {},
            },
          })
        })
      }
    }

    loadUserProfile()
  }, []) // Run once on mount

  // Persist on every change.
  useEffect(() => {
    writeStorage(session)
    if (session?.role) syncLegacy(session.role)
  }, [session])

  const login = useCallback((roleId, profile = {}) => {
    const next = buildSession(roleId, profile)
    setSession(next)
    return next
  }, [])

  const logout = useCallback(() => {
    setSession(null)
    try { localStorage.removeItem('access_token')  } catch { /* noop */ }
    try { localStorage.removeItem('refresh_token') } catch { /* noop */ }
    try { localStorage.removeItem(LEGACY_ROLE_KEY) } catch { /* noop */ }
  }, [])

  const switchRole = useCallback((roleId) => {
    if (!ROLES[roleId]) return null
    const next = buildSession(roleId, { 
      company: session?.company,
      tenant: session?.tenant,
      ...session?.user, // Preserve user data when switching roles
    })
    setSession(next)
    return next
  }, [session])

  const refreshProfile = useCallback(async () => {
    const token = localStorage.getItem('access_token')
    if (!token) return
    const profileData = await fetchUserProfile()
    if (profileData) {
      const { user, tenant } = profileData
      const roleMap = {
        'super_admin': ROLE_IDS.SUPER_ADMIN,
        'tenant_admin': ROLE_IDS.SUPER_ADMIN,
        'owner': ROLE_IDS.SUPER_ADMIN,
        'admin': ROLE_IDS.SUPER_ADMIN,
        'admin_user': ROLE_IDS.SUPER_ADMIN,
        'platform_admin': ROLE_IDS.SUPER_ADMIN,
        'hr_admin': ROLE_IDS.HR_ADMIN,
        'hr_manager': ROLE_IDS.HR,
        'hr': ROLE_IDS.HR,
        'manager': ROLE_IDS.MANAGER,
        'sales': ROLE_IDS.SALES,
        'sales_executive': ROLE_IDS.SALES,
        'employee': ROLE_IDS.EMPLOYEE,
        'payroll_admin': ROLE_IDS.PAYROLL_ADMIN,
        'recruiter': ROLE_IDS.RECRUITER,
        'finance_viewer': ROLE_IDS.FINANCE_VIEWER,
        'it_admin': ROLE_IDS.IT_ADMIN,
      }
      const apiRole = (user.role || user.user_type || '').toLowerCase().trim().replace(/\s+/g, '_')
      const apiMappedRole = apiRole ? roleMap[apiRole] : null
      const exactRoleName = (user.role || user.user_type || '').trim()

      let userModules = null
      try {
        const data = await apiClient.get(`${API_BASE_URL}/roles/user/permissions`)
        if (data && data.permissions) {
          userModules = data.permissions
        }
      } catch(e) {
        console.error('Failed to refresh user modules:', e)
      }
      
      setSession(prev => {
        const existingRole = prev?.role
        let finalRole
        if (!existingRole) {
          finalRole = apiMappedRole || exactRoleName || ROLE_IDS.EMPLOYEE
        } else if (apiMappedRole && apiMappedRole !== ROLE_IDS.EMPLOYEE) {
          finalRole = apiMappedRole
        } else if (exactRoleName && exactRoleName.toLowerCase() !== 'employee') {
          finalRole = exactRoleName
        } else {
          finalRole = existingRole
        }

        return buildSession(finalRole, {
          ...(prev?.user || {}),
          userModules,
          id: user.id,
          name: user.display_name || `${user.first_name} ${user.last_name}`.trim(),
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          displayName: user.display_name,
          phone: user.phone,
          avatarUrl: user.avatar_url,
          status: user.status,
          token,
          company: prev?.company,
          tenant: {
            ...(prev?.tenant || {}),
            id: tenant.id,
            name: tenant.name,
            slug: tenant.slug,
            subdomain: tenant.subdomain,
            status: tenant.status,
            region: tenant.primary_region,
            currency: tenant.primary_currency,
            logoUrl: tenant.logo_url,
            brandColor: tenant.brand_color,
            timezone: tenant.timezone,
            dateFormat: tenant.date_format,
            onboardingCompleted: tenant.onboarding_completed,
            onboardingStep: tenant.onboarding_step,
            planId: tenant.plan_id,
            modules: tenant.modules || {},
            planLimits: tenant.plan_limits || {},
            planUsage: tenant.plan_usage || {},
          },
        })
      })
    }
  }, [])

  const value = useMemo(() => {
    const role     = session?.role || null
    const roleMeta = role ? ROLES[role] : null
    return {
      session,
      role,
      roleMeta,
      user:    session?.user    || null,
      company: session?.company || null,
      tenant:  session?.tenant  || null,
      isAuthenticated: !!session,
      login,
      logout,
      switchRole,
      refreshProfile,
      getRoleLanding,
    }
  }, [session, login, logout, switchRole, refreshProfile])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
