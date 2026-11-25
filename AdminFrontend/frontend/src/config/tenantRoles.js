/**
 * Tenant-side roles per HRMS_B2B_Complete_Specification_v3.docx §7.5
 *
 * Permission string format: {module}:{action}:{scope}
 *   modules : employees | payroll | leave | attendance | recruitment | performance |
 *             benefits | reports | settings | billing | crm | users | compliance | self
 *   actions : read | write | delete | export | approve | run | configure | invite | impersonate
 *   scopes  : all | own_entity | own_department | own_team | self
 *
 * Used by Settings → Users & Roles section.
 * (Routing/landing still uses /config/roles.js for the dashboards already built.)
 */

export const TENANT_ROLES = [
  {
    id:          'tenant_admin',
    name:        'Tenant Admin',
    short:       'Owner',
    description: 'Founder / first registered user. Super-admin of the tenant. Owns billing & configuration.',
    isSystem:    true,
    isDefaultEmployee: false,
    badgeClass:  'bg-purple-100 text-purple-700 border-purple-200',
    avatarClass: 'bg-linear-to-br from-purple-500 to-indigo-600',
    initial:     'T',
    permissions: ['all:*:all'],
  },
  {
    id:          'hr_admin',
    name:        'HR Admin',
    short:       'HR',
    description: 'Manages people, leave, attendance and read-only payroll across the tenant.',
    isSystem:    true,
    isDefaultEmployee: false,
    badgeClass:  'bg-orange-100 text-orange-700 border-orange-200',
    avatarClass: 'bg-linear-to-br from-orange-400 to-rose-500',
    initial:     'H',
    permissions: ['employees:*:all', 'leave:*:all', 'payroll:read:all', 'attendance:*:all'],
  },
  {
    id:          'payroll_admin',
    name:        'Payroll Admin',
    short:       'Payroll',
    description: 'Runs payroll, configures structures, reads employee data only.',
    isSystem:    true,
    isDefaultEmployee: false,
    badgeClass:  'bg-amber-100 text-amber-800 border-amber-200',
    avatarClass: 'bg-linear-to-br from-amber-400 to-orange-500',
    initial:     'P',
    permissions: ['payroll:*:all', 'employees:read:all'],
  },
  {
    id:          'recruiter',
    name:        'Recruiter',
    short:       'Recruit',
    description: 'Owns the ATS — requisitions, jobs, candidates, interviews, offers.',
    isSystem:    true,
    isDefaultEmployee: false,
    badgeClass:  'bg-pink-100 text-pink-700 border-pink-200',
    avatarClass: 'bg-linear-to-br from-pink-400 to-rose-500',
    initial:     'R',
    permissions: ['recruitment:*:all', 'employees:read:all', 'reports:read:all'],
  },
  {
    id:          'finance_viewer',
    name:        'Finance Viewer',
    short:       'Finance',
    description: 'Read-only access to payroll, billing and finance reports for audit.',
    isSystem:    true,
    isDefaultEmployee: false,
    badgeClass:  'bg-cyan-100 text-cyan-700 border-cyan-200',
    avatarClass: 'bg-linear-to-br from-cyan-400 to-blue-500',
    initial:     'F',
    permissions: ['payroll:read:all', 'billing:read:all', 'reports:read:all', 'employees:read:all'],
  },
  {
    id:          'it_admin',
    name:        'IT Admin',
    short:       'IT',
    description: 'Manages users, roles, SSO, integrations and system settings.',
    isSystem:    true,
    isDefaultEmployee: false,
    badgeClass:  'bg-slate-200 text-slate-700 border-slate-300',
    avatarClass: 'bg-linear-to-br from-slate-500 to-slate-700',
    initial:     'I',
    permissions: ['users:*:all', 'settings:*:all', 'billing:read:all'],
  },
  {
    id:          'manager',
    name:        'Manager',
    short:       'Manager',
    description: 'Manages own team — view employees, approve leaves, monitor attendance.',
    isSystem:    true,
    isDefaultEmployee: false,
    badgeClass:  'bg-emerald-100 text-emerald-700 border-emerald-200',
    avatarClass: 'bg-linear-to-br from-emerald-500 to-teal-600',
    initial:     'M',
    permissions: ['employees:read:own_team', 'leave:approve:own_team', 'attendance:read:own_team', 'performance:write:own_team'],
  },
  {
    id:          'employee',
    name:        'Employee',
    short:       'Employee',
    description: 'Self-service: own profile, leave requests, payslips, tasks.',
    isSystem:    true,
    isDefaultEmployee: true,
    badgeClass:  'bg-blue-100 text-blue-700 border-blue-200',
    avatarClass: 'bg-linear-to-br from-blue-500 to-cyan-600',
    initial:     'E',
    permissions: ['self:*:self', 'leave:write:self', 'payslips:read:self', 'attendance:write:self'],
  },
]

export const TENANT_ROLE_MAP = TENANT_ROLES.reduce((acc, r) => { acc[r.id] = r; return acc }, {})

/** Canonical modules per spec §7.5. */
export const PERMISSION_MODULES = [
  { id: 'employees',    label: 'Employees'    },
  { id: 'attendance',   label: 'Attendance'   },
  { id: 'leave',        label: 'Leave'        },
  { id: 'payroll',      label: 'Payroll'      },
  { id: 'recruitment',  label: 'Recruitment'  },
  { id: 'performance',  label: 'Performance'  },
  { id: 'benefits',     label: 'Benefits'     },
  { id: 'reports',      label: 'Reports'      },
  { id: 'settings',     label: 'Settings'     },
  { id: 'billing',      label: 'Billing'      },
  { id: 'crm',          label: 'CRM'          },
  { id: 'users',        label: 'Users'        },
  { id: 'compliance',   label: 'Compliance'   },
]

/** Permission action set per spec §7.5. */
export const PERMISSION_ACTIONS = [
  'read', 'write', 'delete', 'export', 'approve', 'run', 'configure', 'invite', 'impersonate',
]

/** Permission scopes per spec §7.5. */
export const PERMISSION_SCOPES = [
  { id: 'all',             label: 'All',             tone: 'bg-emerald-100 text-emerald-700' },
  { id: 'own_entity',      label: 'Own entity',      tone: 'bg-blue-100 text-blue-700'      },
  { id: 'own_department',  label: 'Own dept',        tone: 'bg-violet-100 text-violet-700'  },
  { id: 'own_team',        label: 'Own team',        tone: 'bg-amber-100 text-amber-700'    },
  { id: 'self',            label: 'Self',            tone: 'bg-slate-100 text-slate-600'    },
]

/**
 * For a given role id and module id, return the highest scope that role has access to.
 * Returns 'none' if no permission grants access. Used by the permission matrix UI.
 *
 * Examples:
 *   resolve('tenant_admin','payroll') -> 'all'         (matches all:*:all)
 *   resolve('manager','leave')        -> 'own_team'    (matches leave:approve:own_team)
 *   resolve('employee','payroll')     -> 'self'        (matches payslips:read:self)
 *   resolve('payroll_admin','crm')    -> 'none'
 */
const SCOPE_RANK = { all: 5, own_entity: 4, own_department: 3, own_team: 2, self: 1, none: 0 }

export const resolveAccessLevel = (roleId, moduleId) => {
  const role = TENANT_ROLE_MAP[roleId]
  if (!role) return 'none'
  let best = 'none'
  for (const p of role.permissions) {
    const [mod, , scope = 'all'] = p.split(':')
    if (mod === 'all' || mod === moduleId || (mod === 'self' && moduleId === 'employees')) {
      if (SCOPE_RANK[scope] > SCOPE_RANK[best]) best = scope
    }
    // employee read of own payroll is via payslips:read:self
    if (mod === 'payslips' && moduleId === 'payroll' && SCOPE_RANK[scope] > SCOPE_RANK[best]) best = scope
  }
  return best
}

/** Invitation status enum per spec §6.3 user_invitations.status. */
export const INVITATION_STATUS = ['pending', 'accepted', 'expired', 'revoked']

export const INVITATION_STATUS_TONE = {
  pending:  'bg-amber-100 text-amber-700',
  accepted: 'bg-emerald-100 text-emerald-700',
  expired:  'bg-slate-200 text-slate-600',
  revoked:  'bg-rose-100 text-rose-700',
}

/** User account status (soft state on top of invitation acceptance). */
export const USER_STATUS_TONE = {
  active:   'bg-emerald-100 text-emerald-700',
  inactive: 'bg-slate-200 text-slate-600',
  locked:   'bg-rose-100 text-rose-700',
}
