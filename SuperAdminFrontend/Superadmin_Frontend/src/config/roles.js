/**
 * Super Admin Role Configuration
 * Simplified for Super Admin panel only
 */

export const ROLE_IDS = {
  SUPER_ADMIN: 'super_admin',
  PLATFORM_ADMIN: 'platform_admin',
  ADMIN: 'admin',
}

export const ROLE_LIST = [
  ROLE_IDS.SUPER_ADMIN,
  ROLE_IDS.PLATFORM_ADMIN,
  ROLE_IDS.ADMIN,
]

/**
 * Display metadata for Super Admin roles only
 */
export const ROLES = {
  [ROLE_IDS.SUPER_ADMIN]: {
    id: ROLE_IDS.SUPER_ADMIN,
    label: 'Super Admin',
    short: 'Super Admin',
    description: 'Full platform access and control',
    landing: '/super-admin',
    badgeClass: 'bg-purple-100 text-purple-700',
    avatarClass: 'bg-gradient-to-br from-purple-500 to-indigo-600',
    initial: 'SA',
  },
  [ROLE_IDS.PLATFORM_ADMIN]: {
    id: ROLE_IDS.PLATFORM_ADMIN,
    label: 'Platform Admin',
    short: 'Platform Admin',
    description: 'Platform administration and management',
    landing: '/super-admin',
    badgeClass: 'bg-blue-100 text-blue-700',
    avatarClass: 'bg-gradient-to-br from-blue-500 to-cyan-600',
    initial: 'PA',
  },
  [ROLE_IDS.ADMIN]: {
    id: ROLE_IDS.ADMIN,
    label: 'Admin',
    short: 'Admin',
    description: 'Administrative access',
    landing: '/super-admin',
    badgeClass: 'bg-indigo-100 text-indigo-700',
    avatarClass: 'bg-gradient-to-br from-indigo-500 to-blue-600',
    initial: 'A',
  },
}

/**
 * Default landing route for Super Admin roles
 */
export const getRoleLanding = (roleId) =>
  ROLES[roleId]?.landing || '/super-admin'

/**
 * Mock seed users for Super Admin roles
 */
export const SEED_USERS = {
  [ROLE_IDS.SUPER_ADMIN]: {
    id: 'USR001',
    name: 'Gerry Connolly',
    email: 'admin@workmatrix.com',
    department: 'Platform',
  },
  [ROLE_IDS.PLATFORM_ADMIN]: {
    id: 'USR002',
    name: 'Platform Admin',
    email: 'platform@workmatrix.com',
    department: 'Platform',
  },
  [ROLE_IDS.ADMIN]: {
    id: 'USR003',
    name: 'System Admin',
    email: 'system@workmatrix.com',
    department: 'System',
  },
}
