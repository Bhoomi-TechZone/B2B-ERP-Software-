import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { ROLE_IDS, ROLES, SEED_USERS, getRoleLanding } from '../config/roles'

const STORAGE_KEY = 'superadmin.auth.v1'

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

const buildSession = (roleId, overrides = {}) => {
  console.log('=== buildSession called ===')
  console.log('Input roleId:', roleId)
  console.log('Overrides:', overrides)
  
  const roleExists = ROLES[roleId]
  console.log('Role exists in ROLES:', !!roleExists)
  
  const role = roleExists ? roleId : ROLE_IDS.SUPER_ADMIN
  console.log('Final role assigned:', role)
  
  const seed = SEED_USERS[role]
  const session = {
    role,
    user: {
      id:         overrides.id         || seed.id,
      name:       overrides.name       || seed.name,
      email:      overrides.email      || seed.email,
      department: overrides.department || seed.department,
      token:      overrides.token      || null,
    },
    company: overrides.company || null,
  }
  console.log('Built session:', session)
  return session
}

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    const existing = readStorage()
    if (existing) {
      return existing
    }
    return null
  })

  // Persist on every change.
  useEffect(() => {
    writeStorage(session)
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
  }, [])

  const switchRole = useCallback((roleId) => {
    if (!ROLES[roleId]) return null
    const next = buildSession(roleId, { company: session?.company })
    setSession(next)
    return next
  }, [session?.company])

  const value = useMemo(() => {
    const role     = session?.role || null
    const roleMeta = role ? ROLES[role] : null
    return {
      session,
      role,
      roleMeta,
      user:    session?.user    || null,
      company: session?.company || null,
      isAuthenticated: !!session,
      login,
      logout,
      switchRole,
      getRoleLanding,
    }
  }, [session, login, logout, switchRole])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}