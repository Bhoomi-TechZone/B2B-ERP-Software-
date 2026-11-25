
import {
  Users, DollarSign, Plane, CheckSquare, Briefcase, TrendingUp,
  Shield, Contact, FolderKanban, Settings,
  CreditCard, LayoutDashboard,
  BarChart3, Clock, Calendar, StickyNote,
  HeartPulse, HelpCircle, Ticket, Handshake,
  Building2, Package, Megaphone, FileText,
  DoorOpen, ShieldCheck
} from 'lucide-react'

import { ROLE_IDS } from './roles'

const ALL_ROLES = Object.values(ROLE_IDS)
const STAFF = [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.HR, ROLE_IDS.MANAGER, ROLE_IDS.HR_ADMIN]
const HR_TEAM = [ROLE_IDS.HR, ROLE_IDS.HR_ADMIN, ROLE_IDS.RECRUITER]
const FINANCE = [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.PAYROLL_ADMIN, ROLE_IDS.FINANCE_VIEWER]
const IT_TEAM = [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.IT_ADMIN]

/**
 * @typedef {object} NavChild
 * @property {string} label
 * @property {string} path
 * @property {any}    icon
 * @property {string[]=} roles
 *
 * @typedef {object} NavItem
 * @property {string} label
 * @property {string} path
 * @property {any}    icon
 * @property {string=} badge
 * @property {string[]=} roles
 * @property {NavChild[]=} children
 *
 * @typedef {object} NavSection
 * @property {string}    title
 * @property {string[]=} roles
 * @property {NavItem[]} items
 */

/** @type {NavSection[]} */
export const NAV_SECTIONS = [
  // ── Dashboard ──────────────────────────────────────────────────────────
  {
    title: 'DASHBOARD',
    items: [
      { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, roles: [ROLE_IDS.SUPER_ADMIN] },
      { label: 'Dashboard', path: '/hr/dashboard', icon: LayoutDashboard, roles: [ROLE_IDS.HR, ROLE_IDS.HR_ADMIN] },
      { label: 'Dashboard', path: '/payroll-admin/dashboard', icon: LayoutDashboard, roles: [ROLE_IDS.PAYROLL_ADMIN] },
      { label: 'Dashboard', path: '/recruiter/dashboard', icon: LayoutDashboard, roles: [ROLE_IDS.RECRUITER] },
      { label: 'Dashboard', path: '/finance-viewer/dashboard', icon: LayoutDashboard, roles: [ROLE_IDS.FINANCE_VIEWER] },
      { label: 'Dashboard', path: '/it-admin/dashboard', icon: LayoutDashboard, roles: [ROLE_IDS.IT_ADMIN] },
      { label: 'Dashboard', path: '/manager/dashboard', icon: LayoutDashboard, roles: [ROLE_IDS.MANAGER] },
      { label: 'Dashboard', path: '/sales/dashboard', icon: LayoutDashboard, roles: [ROLE_IDS.SALES] },
      { label: 'Dashboard', path: '/employee/dashboard', icon: LayoutDashboard, roles: [ROLE_IDS.EMPLOYEE], module: 'dashboard_employee' },
      { label: 'My Profile', path: '/my-profile', icon: Contact, roles: [ROLE_IDS.EMPLOYEE], module: 'my_profile' },
    ],
  },

  // ── CRM & Sales ────────────────────────────────────────────────────────
  {
    title: 'CRM & SALES',
    module: 'crm',
    items: [
      { label: 'Leads', path: '/crm/leads/sales-lead', icon: Contact, roles: [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.SALES, ROLE_IDS.MANAGER] },
      { label: 'Opportunities', path: '/crm/opportunities', icon: TrendingUp, roles: [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.SALES, ROLE_IDS.MANAGER] },
      { label: 'Demo Schedule', path: '/crm/demo-schedule', icon: Calendar, roles: [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.SALES, ROLE_IDS.MANAGER] },
      { label: 'Clients', path: '/crm/clients', icon: Users, roles: [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.SALES, ROLE_IDS.MANAGER] },
    ],
  },

  // ── HR Management ──────────────────────────────────────────────────────
  {
    title: 'HR MANAGEMENT',
    items: [
      { label: 'Employees', path: '/employees', icon: Users, module: 'employees', roles: [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.HR, ROLE_IDS.HR_ADMIN] },
      { label: 'Departments', path: '/departments', icon: Building2, module: 'departments', roles: [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.HR, ROLE_IDS.HR_ADMIN] },
      { label: 'Exit Management', path: '/employees/exit', icon: DoorOpen, module: 'employees', roles: [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.HR, ROLE_IDS.HR_ADMIN] },
      {
        label: 'Attendance',
        path: '/attendance',
        icon: Clock,
        module: 'attendance',
        roles: [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.HR, ROLE_IDS.EMPLOYEE],
        children: [
          { label: 'Monitoring', path: '/attendance/daily', roles: [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.HR] },
          { label: 'Monthly Logs', path: '/attendance/monthly', roles: [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.HR] },
          { label: 'Shift Roster', path: '/attendance/shifts', roles: [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.HR] },
          { label: 'Regularization', path: '/attendance/requests', roles: [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.HR, ROLE_IDS.EMPLOYEE] },
          { label: 'Compliance', path: '/attendance/compliance', roles: [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.HR] },
          { label: 'Integrations', path: '/attendance/biometric', roles: [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.HR] },
        ]
      },
      {
        label: 'Leave',
        path: '/leave',
        icon: Plane,
        module: 'leave',
        roles: [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.HR, ROLE_IDS.PAYROLL_ADMIN],
        children: [
          { label: 'Policies', path: '/leave/policies', roles: [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.HR] },
          { label: 'Balance', path: '/leave/balance', roles: [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.HR] },
          { label: 'Requests', path: '/leave/requests', roles: [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.HR] },
          { label: 'Calendar', path: '/leave/calendar', roles: [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.HR] },
        ]
      },
      { label: 'Payroll', path: '/payroll', icon: DollarSign, module: 'payroll', roles: [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.HR, ROLE_IDS.PAYROLL_ADMIN] },
      { label: 'My Payroll', path: '/my-payroll', icon: DollarSign, roles: [ROLE_IDS.EMPLOYEE], module: 'my_payroll' },
      { label: 'My Documents', path: '/my-documents', icon: FileText, roles: [ROLE_IDS.EMPLOYEE], module: 'my_documents' },
      {
        label: 'Recruitment',
        path: '/recruitment',
        icon: Briefcase,
        module: 'ats',
        roles: [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.HR, ROLE_IDS.RECRUITER],
        children: [
          { label: 'Sources', path: '/recruitment/sources' },
          { label: 'Requisitions', path: '/recruitment/requisitions' },
          { label: 'Jobs', path: '/recruitment/jobs' },
          { label: 'Candidates', path: '/recruitment/candidates' },
          { label: 'Pipeline', path: '/recruitment/applications' },
          { label: 'Interviews', path: '/recruitment/interviews' },
          { label: 'Offers', path: '/recruitment/offers' },
          { label: 'Hired', path: '/recruitment/hired' },
        ]
      },
    ],
  },

  // ── Projects & Tasks ───────────────────────────────────────────────────
  {
    title: 'PROJECTS & TASKS',
    module: 'projects',
    items: [
      { label: 'Projects', path: '/projects', icon: FolderKanban, roles: ALL_ROLES },
      { label: 'Notes', path: '/notes', icon: StickyNote, roles: STAFF },
      { label: 'Announcements', path: '/announcements', icon: Megaphone, roles: ALL_ROLES, module: 'announcements' },
    ],
  },


  // ── Administration ─────────────────────────────────────────────────────
  {
    title: 'ADMINISTRATION',
    items: [
      { label: 'Users & Roles', path: '/admin/users', icon: Users, module: 'administration', roles: [ROLE_IDS.SUPER_ADMIN] },
      { label: 'Billing', path: '/admin/subscription', icon: CreditCard, module: 'administration', roles: [ROLE_IDS.SUPER_ADMIN] },
      { label: 'Reports', path: '/admin/reports', icon: BarChart3, module: 'reports', roles: [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.HR, ROLE_IDS.HR_ADMIN] },
      { label: 'Settings', path: '/settings', icon: Settings, module: 'settings', roles: [ROLE_IDS.SUPER_ADMIN] },
      { label: 'My Settings', path: '/my-settings', icon: Settings, roles: [ROLE_IDS.EMPLOYEE], module: 'my_settings' },
    ],
  },

  // ── Support ────────────────────────────────────────────────────────────
  {
    title: 'SUPPORT & COMPLIANCE',
    items: [
      { label: 'Compliance', path: '/compliance', icon: ShieldCheck, module: 'compliance', roles: STAFF },
      { label: 'Tickets', path: '/tickets', icon: Ticket, module: 'tickets', roles: STAFF },
      { label: 'Help Desk', path: '/my-help-desk', icon: HelpCircle, roles: [ROLE_IDS.EMPLOYEE], module: 'my_help_desk' },
    ],
  },
]

export const EMPLOYEE_NAV = [
  {
    title: '',
    items: [
      { label: 'Dashboard', path: '/employee/dashboard', icon: LayoutDashboard, roles: [ROLE_IDS.EMPLOYEE], module: 'dashboard_employee' },
      { label: 'My Profile', path: '/my-profile', icon: Contact, roles: [ROLE_IDS.EMPLOYEE], module: 'my_profile' },
      {
        label: 'Attendance',
        path: '/attendance',
        icon: Clock,
        module: 'attendance_employee',
        roles: [ROLE_IDS.EMPLOYEE],
        children: [
          { label: 'My Attendance', path: '/attendance/my-attendance', roles: [ROLE_IDS.EMPLOYEE], module: 'attendance_employee' },
          { label: 'Monthly Logs', path: '/attendance/my-logs', roles: [ROLE_IDS.EMPLOYEE], module: 'attendance_employee' },
          { label: 'Regularization Requests', path: '/attendance/my-requests', roles: [ROLE_IDS.EMPLOYEE], module: 'attendance_employee' },
        ]
      },
      {
        label: 'Leave Management',
        path: '/leave',
        icon: Plane,
        module: 'leave_employee',
        roles: [ROLE_IDS.EMPLOYEE],
        children: [
          { label: 'Leave Balance', path: '/leave/balance', roles: [ROLE_IDS.EMPLOYEE], module: 'leave_employee' },
          { label: 'Leave History', path: '/leave/history', roles: [ROLE_IDS.EMPLOYEE], module: 'leave_employee' },
        ]
      },
      { label: 'Payroll', path: '/my-payroll', icon: DollarSign, roles: [ROLE_IDS.EMPLOYEE], module: 'my_payroll' },
      { label: 'My Documents', path: '/my-documents', icon: FileText, roles: [ROLE_IDS.EMPLOYEE], module: 'my_documents' },
      {
        label: 'Projects & Tasks',
        path: '/projects',
        icon: FolderKanban,
        module: 'projects_employee',
        roles: [ROLE_IDS.EMPLOYEE],
        children: [
          { label: 'My Projects', path: '/projects', icon: FolderKanban, roles: [ROLE_IDS.EMPLOYEE], module: 'projects_employee' },
          { label: 'My Tasks', path: '/tasks', icon: CheckSquare, roles: [ROLE_IDS.EMPLOYEE], module: 'projects_employee' },
        ]
      },
      { label: 'Announcements', path: '/announcements', icon: Megaphone, roles: [ROLE_IDS.EMPLOYEE], module: 'announcements' },
      { label: 'Help Desk', path: '/my-help-desk', icon: HelpCircle, roles: [ROLE_IDS.EMPLOYEE], module: 'my_help_desk' },
      { label: 'Settings', path: '/my-settings', icon: Settings, roles: [ROLE_IDS.EMPLOYEE], module: 'my_settings' },
    ]
  }
]

/**
 * Returns route → allowed-roles map flattened from NAV_SECTIONS and EMPLOYEE_NAV,
 * used by ProtectedRoute / RoleRoute to gate access.
 */
export const buildRoutePermissions = () => {
  const map = {}
  const visit = (path, roles, module) => {
    if (!path || !roles?.length) return
    map[path] = { roles, module }
  }
  const traverse = (sections) => {
    for (const section of sections) {
      const sectionRoles = section.roles
      const sectionModule = section.module
      for (const item of section.items) {
        const itemRoles = item.roles || sectionRoles
        const itemModule = item.module || sectionModule
        visit(item.path, itemRoles, itemModule)
        if (item.children) {
          for (const child of item.children) {
            const childModule = child.module || itemModule
            visit(child.path, child.roles || itemRoles, childModule)
          }
        }
      }
    }
  }
  traverse(NAV_SECTIONS)
  traverse(EMPLOYEE_NAV)
  return map
}

/**
 * Helper to determine if a module is active, handling name normalization
 * and mapping between frontend keys and superadmin predefined module names.
 *
 * @param {string} moduleName
 * @param {object} activeModules
 * @returns {boolean}
 */
export function isModuleActive(moduleName, activeModules = {}) {
  if (!moduleName) return true
  if (!activeModules) return false

  const normalizedKey = moduleName.toLowerCase().trim()

  const checkValue = (val) => val === true || (val && val.read === true)

  // 1. Direct match check
  if (checkValue(activeModules[moduleName]) || checkValue(activeModules[normalizedKey])) {
    return true
  }

  // 2. Map of expected frontend keys to potential superadmin predefined module keys or user modules keys
  const superadminMappings = {
    crm: ['CRM', 'crm'],
    projects: ['Projects & Tasks', 'projects_&_tasks', 'projects_and_tasks', 'projects'],
    hrms: ['HRMS'],
    attendance: ['HRMS', 'attendance'],
    leave: ['HRMS', 'leave', 'leaves'],
    payroll: ['HRMS', 'payroll'],
    ats: ['HRMS', 'recruitment', 'ats'],
    recruitment: ['HRMS', 'recruitment', 'ats'],
    compliance: ['Reports & Analytics', 'reports_&_analytics', 'reports_and_analytics', 'compliance'],
    support: ['Support', 'tickets'],
    tickets: ['Support', 'tickets']
  }

  const legacyKeys = superadminMappings[normalizedKey] || []
  for (const key of legacyKeys) {
    const snakeCaseKey = key.replace(/\s+/g, '_').toLowerCase()
    if (
      checkValue(activeModules[key]) ||
      checkValue(activeModules[key.toLowerCase()]) ||
      checkValue(activeModules[snakeCaseKey])
    ) {
      return true
    }
  }

  // 3. Fallback fuzzy check across all keys in activeModules
  const cleanKey = normalizedKey.replace(/[\s&_]+/g, '')
  for (const [k, v] of Object.entries(activeModules)) {
    if (k.toLowerCase().trim() === normalizedKey && checkValue(v)) return true
    if (k.toLowerCase().replace(/[\s&_]+/g, '') === cleanKey && checkValue(v)) return true
  }

  return false
}

export const ROUTE_PERMISSIONS = buildRoutePermissions()

/**
 * Filter nav sections by the current role and active modules. A section is shown only if at
 * least one item is visible to the current role and its required module is active; sub-children are also filtered.
 */
export const filterNavForRole = (roleId, activeModules = {}, userModules = null) => {
  // If roleId is not in the built-in ROLE_IDS, it's a dynamic custom role from the DB.
  // Every custom role should inherently have basic 'employee' access.
  const isCustomRole = !Object.values(ROLE_IDS).includes(roleId);

  const isAllowed = (itemRoles, module) => {
    if (roleId === ROLE_IDS.SUPER_ADMIN) {
      return !itemRoles || itemRoles.includes(roleId);
    }

    // Core self-service modules that should always be visible based on static role check,
    // regardless of userModules configuration.
    const coreSelfServiceModules = [
      'my_profile', 'my_payroll', 'my_documents', 'my_settings', 'my_help_desk',
      'dashboard_employee', 'announcements', 'administration', 'settings'
    ];

    // 1. If we have userModules from database, check permissions
    if (userModules) {
      if (!module) {
        // Structural or header items that don't map to a module: check role access statically
        return !itemRoles || itemRoles.includes(roleId);
      }

      // Core self-service modules bypass userModules — just check static role
      if (coreSelfServiceModules.includes(module)) {
        return !itemRoles || itemRoles.includes(roleId);
      }

      const isEmployeeRole = roleId === ROLE_IDS.EMPLOYEE;
      let hasAccess = false;
      let hasExplicitConfig = false;
      
      // Check admin module permission
      let adminConfig = userModules[module];
      if (adminConfig === undefined && (module === 'departments' || module === 'employees')) {
        adminConfig = userModules['employees'];
      }
      if (adminConfig === undefined && module === 'reports') {
        adminConfig = userModules['reports'] || userModules['administration'] || { read: true, write: true };
      }
      if (adminConfig === undefined && module === 'compliance') {
        adminConfig = userModules['compliance'] || userModules['employees'] || { read: true, write: true };
      }
      if (adminConfig !== undefined) {
        hasExplicitConfig = true;
        hasAccess = hasAccess || adminConfig.read === true || adminConfig.write === true;
      }
      
      // Check employee-specific module permission if the user is an employee
      if (isEmployeeRole) {
        let empModule = null;
        if (module === 'leave') empModule = 'leave_employee';
        if (module === 'attendance') empModule = 'attendance_employee';
        if (module === 'projects') empModule = 'projects_employee';
        
        if (empModule) {
          const empConfig = userModules[empModule];
          if (empConfig !== undefined) {
            hasExplicitConfig = true;
            hasAccess = hasAccess || empConfig.read === true || empConfig.write === true;
          } else if (empModule !== 'projects') {
            // Fallback to true if employee self-service module is not configured in database yet
            hasAccess = true;
            hasExplicitConfig = true;
          }
        }
      }
      
      // If the module was configured in database, use that access check.
      // If userModules is active but this specific module is NOT configured, hide it by default.
      return hasExplicitConfig && hasAccess;
    }

    // 2. Fallback to static role checking
    return !itemRoles || itemRoles.includes(roleId);
  };

  const isTenantModuleActive = (mod) => {
    if (!mod) return true;
    const coreModules = [
      'administration', 'settings', 'employees', 'departments', 'reports', 'tickets', 'compliance',
      'dashboard_employee', 'my_profile', 'my_payroll', 'my_documents', 'my_settings', 'my_help_desk', 'announcements', 'leave_employee', 'attendance_employee', 'projects_employee'
    ];
    if (coreModules.includes(mod)) return true;
    return isModuleActive(mod, activeModules);
  };

  const sectionsToFilter = roleId === ROLE_IDS.EMPLOYEE ? EMPLOYEE_NAV : NAV_SECTIONS

  return sectionsToFilter
    .filter(s => {
      if (s.module && !isTenantModuleActive(s.module)) return false
      return isAllowed(s.roles, s.module)
    })
    .map(section => {
      const items = section.items
        .filter(i => {
          const mod = i.module || section.module
          if (mod && !isTenantModuleActive(mod)) return false
          return isAllowed(i.roles, mod)
        })
        .map(item => {
          if (!item.children) return item
          const children = item.children.filter(c => {
            const mod = c.module || item.module || section.module
            if (mod && !isTenantModuleActive(mod)) return false
            const allowedRoles = c.roles || item.roles
            return isAllowed(allowedRoles, mod)
          })
          return { ...item, children }
        })
        .filter(item => !item.children || item.children.length > 0 || item.path)
      return { ...section, items }
    })
    .filter(section => section.items.length > 0)
}
