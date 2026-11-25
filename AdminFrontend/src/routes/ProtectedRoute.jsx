import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ROUTE_PERMISSIONS, isModuleActive } from '../config/navigation'
import { ROLE_IDS, getRoleLanding } from '../config/roles'

/**
 * Gate access to a tree of routes:
 *   - Unauthenticated users → /login
 *   - Authenticated but not allowed → role's default landing page
 *
 * Permission check: matches the longest prefix in ROUTE_PERMISSIONS.
 * If no rule matches, the route is considered open to any authenticated user.
 */
function isRouteAllowed(pathname, role, activeModules = {}, userModules = null) {
  if (!role) return false
  const matches = Object.keys(ROUTE_PERMISSIONS)
    .filter(p => pathname === p || pathname.startsWith(p + '/'))
    .sort((a, b) => b.length - a.length)
  if (matches.length === 0) return true
  
  const routeReq = ROUTE_PERMISSIONS[matches[0]]
  
  const isTenantModuleActive = (mod) => {
    if (!mod) return true;
    const coreModules = [
      'administration', 'settings', 'employees', 'reports', 'tickets', 'compliance',
      'dashboard_employee', 'my_profile', 'my_payroll', 'my_documents', 'my_settings', 'my_help_desk', 'announcements', 'leave_employee', 'attendance_employee', 'projects_employee'
    ];
    if (coreModules.includes(mod)) return true;
    return isModuleActive(mod, activeModules);
  };

  const isCustomRole = !Object.values(ROLE_IDS).includes(role);
  const isEmployeeSelfService = routeReq.roles && routeReq.roles.includes(ROLE_IDS.EMPLOYEE);

  if (role === ROLE_IDS.SUPER_ADMIN) return true;

  // 1. If we have userModules from database, check permissions
  if (userModules) {
    if (!routeReq.module) {
      // Structural/open routes: check role access statically
      return routeReq.roles.includes(role) || (isCustomRole && isEmployeeSelfService);
    }

    let hasAccess = false;
    let hasExplicitConfig = false;
    
    // Check admin module permission
    const adminConfig = userModules[routeReq.module];
    if (adminConfig !== undefined) {
      hasExplicitConfig = true;
      hasAccess = hasAccess || adminConfig.read === true || adminConfig.write === true;
    }
    
    // Check employee-specific module permission if the user is an employee
    const isEmployeeRole = role === ROLE_IDS.EMPLOYEE;
    if (isEmployeeRole) {
      let empModule = null;
      if (routeReq.module === 'leave') empModule = 'leave_employee';
      if (routeReq.module === 'attendance') empModule = 'attendance_employee';
      if (routeReq.module === 'projects') empModule = 'projects_employee';
      
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
    
    // If the module was explicitly configured in the database permissions, use that check.
    // Otherwise, default to false (hide/restrict access).
    if (hasExplicitConfig) {
      return hasAccess && isTenantModuleActive(routeReq.module);
    } else {
      return false;
    }
  }

  // 4. Static role check (for non-custom roles or fallback)
  if (!routeReq.roles.includes(role)) return false;
  if (routeReq.module && !isTenantModuleActive(routeReq.module)) return false;
  
  return true;
}

export default function ProtectedRoute() {
  const { isAuthenticated, role, tenant, user } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  // Force un-onboarded administrators to finish the onboarding wizard
  if (role === ROLE_IDS.SUPER_ADMIN && tenant && !tenant.onboardingCompleted) {
    return <Navigate to="/onboarding" replace />
  }

  if (!isRouteAllowed(location.pathname, role, tenant?.modules || {}, user?.userModules)) {
    return <Navigate to={getRoleLanding(role)} replace />
  }

  return <Outlet />
}
