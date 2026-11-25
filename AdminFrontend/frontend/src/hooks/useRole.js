import { useAuth } from './useAuth'
import { ROLE_IDS, SEED_USERS } from '../config/roles'

/**
 * Backwards-compatible role hook.
 *
 * Older modules in the codebase use the legacy role IDs ('admin', 'hr', 'sales').
 * We now derive role from the auth context but expose the same API surface
 * (isAdmin / isHR / isSales / canManage) so existing call sites keep working.
 *
 * New code should prefer `useAuth()` directly to access manager / employee roles.
 */
export const useRole = () => {
  const { role } = useAuth()

  const isAdmin    = role === ROLE_IDS.SUPER_ADMIN
  const isHR       = role === ROLE_IDS.HR
  const isManager  = role === ROLE_IDS.MANAGER
  const isSales    = role === ROLE_IDS.SALES
  const isEmployee = role === ROLE_IDS.EMPLOYEE

  const canManage = isAdmin || isHR || isManager

  // Legacy-shaped role string used by some older components.
  const legacyRole = isHR ? 'hr' : isSales ? 'sales' : 'admin'

  return { role: legacyRole, isAdmin, isHR, isManager, isSales, isEmployee, canManage }
}

/**
 * @deprecated Use `useAuth().user` instead. Kept for older imports.
 */
export const CURRENT_USER = {
  admin: { id: SEED_USERS[ROLE_IDS.SUPER_ADMIN].id, name: SEED_USERS[ROLE_IDS.SUPER_ADMIN].name, department: SEED_USERS[ROLE_IDS.SUPER_ADMIN].department, avatar: 'AM', avatarColor: 'bg-blue-500'   },
  hr:    { id: SEED_USERS[ROLE_IDS.HR].id,          name: SEED_USERS[ROLE_IDS.HR].name,          department: SEED_USERS[ROLE_IDS.HR].department,          avatar: 'PP', avatarColor: 'bg-violet-500' },
  sales: { id: SEED_USERS[ROLE_IDS.SALES].id,       name: SEED_USERS[ROLE_IDS.SALES].name,       department: SEED_USERS[ROLE_IDS.SALES].department,       avatar: 'AK', avatarColor: 'bg-green-500'  },
}

/**
 * @deprecated Use `useAuth().user` instead. Reads from localStorage so it
 * keeps working in any non-component code paths.
 */
export const getCurrentUser = () => {
  let role = 'admin'
  try {
    const raw = localStorage.getItem('userRole')
    if (raw && CURRENT_USER[raw]) role = raw
  } catch { /* noop */ }
  return CURRENT_USER[role] || CURRENT_USER.admin
}
