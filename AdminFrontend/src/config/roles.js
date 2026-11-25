/**
 * Single source of truth for application roles.
 *
 * In a real backend setup, the role IDs and permissions matrix should
 * come from the auth/JWT claims. The frontend uses these constants
 * everywhere (sidebar filtering, route guards, dashboards) so that
 * permissions stay consistent.
 */

export const ROLE_IDS = {
  SUPER_ADMIN:   'admin',
  HR:            'hr',
  MANAGER:       'manager',
  SALES:         'sales',
  EMPLOYEE:      'employee',
  // Invite-specific roles
  HR_ADMIN:      'hr_admin',
  PAYROLL_ADMIN: 'payroll_admin',
  RECRUITER:     'recruiter',
  FINANCE_VIEWER:'finance_viewer',
  IT_ADMIN:      'it_admin',
}

export const ROLE_LIST = [
  ROLE_IDS.SUPER_ADMIN,
  ROLE_IDS.HR,
  ROLE_IDS.MANAGER,
  ROLE_IDS.SALES,
  ROLE_IDS.EMPLOYEE,
  ROLE_IDS.PAYROLL_ADMIN,
  ROLE_IDS.RECRUITER,
  ROLE_IDS.FINANCE_VIEWER,
  ROLE_IDS.IT_ADMIN,
]

/**
 * Display metadata for each role — labels, theme colors, default landing page.
 */
export const ROLES = {
  [ROLE_IDS.SUPER_ADMIN]: {
    id:          ROLE_IDS.SUPER_ADMIN,
    label:       'Admin',
    short:       'Admin',
    description: 'Full access across the organisation',
    landing:     '/admin/dashboard',
    badgeClass:  'bg-purple-100 text-purple-700',
    avatarClass: 'bg-linear-to-br from-purple-500 to-indigo-600',
    initial:     'A',
  },
  [ROLE_IDS.HR]: {
    id:          ROLE_IDS.HR,
    label:       'HR Manager',
    short:       'HR',
    description: 'Employees, payroll, leave, recruitment',
    landing:     '/hr/dashboard',
    badgeClass:  'bg-orange-100 text-orange-700',
    avatarClass: 'bg-linear-to-br from-orange-400 to-rose-500',
    initial:     'H',
  },
  [ROLE_IDS.MANAGER]: {
    id:          ROLE_IDS.MANAGER,
    label:       'Team Manager',
    short:       'Manager',
    description: 'Team attendance, approvals, projects, performance',
    landing:     '/manager/dashboard',
    badgeClass:  'bg-emerald-100 text-emerald-700',
    avatarClass: 'bg-linear-to-br from-emerald-500 to-teal-600',
    initial:     'M',
  },
  [ROLE_IDS.SALES]: {
    id:          ROLE_IDS.SALES,
    label:       'Sales Executive',
    short:       'Sales',
    description: 'Leads, deals, quota, customer pipeline',
    landing:     '/sales/dashboard',
    badgeClass:  'bg-blue-100 text-blue-700',
    avatarClass: 'bg-linear-to-br from-blue-500 to-cyan-600',
    initial:     'S',
  },
  [ROLE_IDS.EMPLOYEE]: {
    id:          ROLE_IDS.EMPLOYEE,
    label:       'Employee',
    short:       'Employee',
    description: 'Self-service: attendance, leave, payslips, tasks',
    landing:     '/employee/dashboard',
    badgeClass:  'bg-slate-100 text-slate-700',
    avatarClass: 'bg-linear-to-br from-slate-500 to-slate-700',
    initial:     'E',
  },
  // Invite-specific role definitions
  [ROLE_IDS.HR_ADMIN]: {
    id:          ROLE_IDS.HR_ADMIN,
    label:       'HR Admin',
    short:       'HR Admin',
    description: 'Employee management, policies, and HR operations',
    landing:     '/hr/dashboard',
    badgeClass:  'bg-orange-100 text-orange-700',
    avatarClass: 'bg-linear-to-br from-orange-500 to-rose-500',
    initial:     'HA',
  },
  [ROLE_IDS.PAYROLL_ADMIN]: {
    id:          ROLE_IDS.PAYROLL_ADMIN,
    label:       'Payroll Admin',
    short:       'Payroll',
    description: 'Payroll processing, salary management, and payments',
    landing:     '/payroll-admin/dashboard',
    badgeClass:  'bg-emerald-100 text-emerald-700',
    avatarClass: 'bg-linear-to-br from-emerald-500 to-teal-600',
    initial:     'PA',
  },
  [ROLE_IDS.RECRUITER]: {
    id:          ROLE_IDS.RECRUITER,
    label:       'Recruiter',
    short:       'Recruiter',
    description: 'Hiring, candidates, interviews, and talent acquisition',
    landing:     '/recruiter/dashboard',
    badgeClass:  'bg-violet-100 text-violet-700',
    avatarClass: 'bg-linear-to-br from-violet-500 to-purple-600',
    initial:     'R',
  },
  [ROLE_IDS.FINANCE_VIEWER]: {
    id:          ROLE_IDS.FINANCE_VIEWER,
    label:       'Finance Viewer',
    short:       'Finance',
    description: 'Financial reports, budgets, and expense viewing',
    landing:     '/finance-viewer/dashboard',
    badgeClass:  'bg-blue-100 text-blue-700',
    avatarClass: 'bg-linear-to-br from-blue-500 to-cyan-600',
    initial:     'FV',
  },
  [ROLE_IDS.IT_ADMIN]: {
    id:          ROLE_IDS.IT_ADMIN,
    label:       'IT Admin',
    short:       'IT Admin',
    description: 'System settings, integrations, and technical administration',
    landing:     '/it-admin/dashboard',
    badgeClass:  'bg-indigo-100 text-indigo-700',
    avatarClass: 'bg-linear-to-br from-indigo-500 to-blue-600',
    initial:     'IT',
  },
}

/**
 * Map registration "role" choices (free-form labels in StepFiveRole)
 * to canonical role IDs above. Default fallback is EMPLOYEE.
 */
export const REGISTRATION_ROLE_MAP = {
  'Owner':          ROLE_IDS.SUPER_ADMIN,
  'Executive Team': ROLE_IDS.SUPER_ADMIN,
  'Manager':        ROLE_IDS.MANAGER,
  'Employee':       ROLE_IDS.EMPLOYEE,
  'Student':        ROLE_IDS.EMPLOYEE,
  'Intern':         ROLE_IDS.EMPLOYEE,
  'Freelancer':     ROLE_IDS.EMPLOYEE,
  'Other':          ROLE_IDS.EMPLOYEE,
}

export const mapRegistrationRole = (label) =>
  REGISTRATION_ROLE_MAP[label] || ROLE_IDS.EMPLOYEE

/**
 * Default landing route for a given role ID.
 */
export const getRoleLanding = (roleId) =>
  ROLES[roleId]?.landing || ROLES[ROLE_IDS.EMPLOYEE].landing

/**
 * Mock seed users — used by the demo RoleSwitcher and as a fallback
 * profile when no real authentication has occurred yet.
 */
export const SEED_USERS = {
  [ROLE_IDS.SUPER_ADMIN]:   { id: 'USR001', name: 'Aarav Mehta',      email: 'admin@workmatrix.com',       department: 'Executive'   },
  [ROLE_IDS.HR]:            { id: 'USR002', name: 'Priya Patel',      email: 'hr@workmatrix.com',          department: 'HR'          },
  [ROLE_IDS.MANAGER]:       { id: 'USR003', name: 'Rohan Verma',      email: 'manager@workmatrix.com',     department: 'Engineering' },
  [ROLE_IDS.SALES]:         { id: 'USR004', name: 'Amit Kumar',       email: 'sales@workmatrix.com',       department: 'Sales'       },
  [ROLE_IDS.EMPLOYEE]:      { id: 'USR005', name: 'Sneha Iyer',       email: 'employee@workmatrix.com',    department: 'Operations'  },
  [ROLE_IDS.HR_ADMIN]:      { id: 'USR006', name: 'Anita Rao',        email: 'hradmin@workmatrix.com',   department: 'HR'          },
  [ROLE_IDS.PAYROLL_ADMIN]: { id: 'USR007', name: 'Vikram Singh',     email: 'payroll@workmatrix.com',   department: 'Finance'     },
  [ROLE_IDS.RECRUITER]:     { id: 'USR008', name: 'Meera Gupta',      email: 'recruiter@workmatrix.com', department: 'HR'          },
  [ROLE_IDS.FINANCE_VIEWER]:{ id: 'USR009', name: 'Rajesh Sharma',    email: 'finance@workmatrix.com',   department: 'Finance'     },
  [ROLE_IDS.IT_ADMIN]:      { id: 'USR010', name: 'Karthik Iyer',     email: 'itadmin@workmatrix.com',   department: 'IT'          },
}
