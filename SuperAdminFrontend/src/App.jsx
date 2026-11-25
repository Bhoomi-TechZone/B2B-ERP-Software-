import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth.js'

// Import Super Admin components from organized structure
import {
  SuperAdminLoginPage,
  SuperAdminDashboard,
  TenantManagementPage,
  UserManagementPage,
  PlansManagementPage,
  BillingPage,
  LeadsManagementPage,
  PlatformSettingsPage,
  OnboardingManagementPage,
  TenantDetailPage,
  UserDetailPage,
  SuperAdminTeamPage,
  CreateTenantModal
} from './SuperAdmin'

// Import Profile Page
import ProfilePage from './SuperAdmin/pages/Profile/ProfilePage'

// Protected Route Component for Super Admin only
function ProtectedSuperAdminRoute({ children }) {
  const { isAuthenticated, role, session } = useAuth()
  
  console.log('🛡️ ProtectedSuperAdminRoute Check:')
  console.log('  - isAuthenticated:', isAuthenticated)
  console.log('  - role:', role)
  console.log('  - session:', session)
  
  // Check if user is authenticated and has super admin role
  if (!isAuthenticated) {
    console.log('❌ Not authenticated, redirecting to login')
    return <Navigate to="/super-admin/login" replace />
  }
  
  // Check for super admin role
  const allowedRoles = ['super_admin', 'platform_admin', 'admin']
  if (!allowedRoles.includes(role)) {
    console.log('❌ Role not allowed:', role, 'Allowed roles:', allowedRoles)
    return <Navigate to="/super-admin/login" replace />
  }
  
  console.log('✅ Authentication passed, rendering children')
  return children
}

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Default redirect to Super Admin */}
        <Route path="/" element={<Navigate to="/super-admin/dashboard/overview?ref=sidebar&tab=overview" replace />} />
        
        {/* Super Admin Login */}
        <Route path="/super-admin/login" element={<SuperAdminLoginPage />} />
        
        {/* ── Professional Canonical Routes ── */}
        <Route path="/super-admin/dashboard/overview" element={
          <ProtectedSuperAdminRoute>
            <SuperAdminDashboard />
          </ProtectedSuperAdminRoute>
        } />

        <Route path="/super-admin/tenants/overview" element={
          <ProtectedSuperAdminRoute>
            <TenantManagementPage />
          </ProtectedSuperAdminRoute>
        } />
        <Route path="/tenants/management/overview" element={
          <ProtectedSuperAdminRoute>
            <TenantManagementPage />
          </ProtectedSuperAdminRoute>
        } />

        <Route path="/super-admin/tenants/:id" element={
          <ProtectedSuperAdminRoute>
            <TenantDetailPage />
          </ProtectedSuperAdminRoute>
        } />
        
        <Route path="/super-admin/users/overview" element={
          <ProtectedSuperAdminRoute>
            <UserManagementPage />
          </ProtectedSuperAdminRoute>
        } />
        <Route path="/users/management/overview" element={
          <ProtectedSuperAdminRoute>
            <UserManagementPage />
          </ProtectedSuperAdminRoute>
        } />
        
        <Route path="/super-admin/users/:id" element={
          <ProtectedSuperAdminRoute>
            <UserDetailPage />
          </ProtectedSuperAdminRoute>
        } />
        
        <Route path="/super-admin/plans/overview" element={
          <ProtectedSuperAdminRoute>
            <PlansManagementPage />
          </ProtectedSuperAdminRoute>
        } />
        <Route path="/plans/management/overview" element={
          <ProtectedSuperAdminRoute>
            <PlansManagementPage />
          </ProtectedSuperAdminRoute>
        } />
        
        {/* Professional Finance / Payments / Billing */}
        <Route path="/finance/payments/overview" element={
          <ProtectedSuperAdminRoute>
            <BillingPage />
          </ProtectedSuperAdminRoute>
        } />
        <Route path="/finance/billing/overview" element={
          <ProtectedSuperAdminRoute>
            <BillingPage />
          </ProtectedSuperAdminRoute>
        } />
        <Route path="/super-admin/billing/overview" element={
          <ProtectedSuperAdminRoute>
            <BillingPage />
          </ProtectedSuperAdminRoute>
        } />
        
        {/* Professional Leads Management */}
        <Route path="/leads/management/overview" element={
          <ProtectedSuperAdminRoute>
            <LeadsManagementPage />
          </ProtectedSuperAdminRoute>
        } />
        <Route path="/super-admin/leads/overview" element={
          <ProtectedSuperAdminRoute>
            <LeadsManagementPage />
          </ProtectedSuperAdminRoute>
        } />
        
        <Route path="/super-admin/onboarding/overview" element={
          <ProtectedSuperAdminRoute>
            <OnboardingManagementPage />
          </ProtectedSuperAdminRoute>
        } />
        
        <Route path="/super-admin/team/overview" element={
          <ProtectedSuperAdminRoute>
            <SuperAdminTeamPage />
          </ProtectedSuperAdminRoute>
        } />
        
        <Route path="/super-admin/settings/overview" element={
          <ProtectedSuperAdminRoute>
            <PlatformSettingsPage />
          </ProtectedSuperAdminRoute>
        } />
        <Route path="/settings/platform/overview" element={
          <ProtectedSuperAdminRoute>
            <PlatformSettingsPage />
          </ProtectedSuperAdminRoute>
        } />
        
        <Route path="/super-admin/profile/overview" element={
          <ProtectedSuperAdminRoute>
            <ProfilePage />
          </ProtectedSuperAdminRoute>
        } />
        
        <Route path="/super-admin/create-tenant" element={
          <ProtectedSuperAdminRoute>
            <CreateTenantModal />
          </ProtectedSuperAdminRoute>
        } />

        {/* ── Legacy Redirections (100% Backwards Compatible) ── */}
        <Route path="/super-admin" element={<Navigate to="/super-admin/dashboard/overview?ref=sidebar&tab=overview" replace />} />
        <Route path="/super-admin/tenants" element={<Navigate to="/super-admin/tenants/overview?ref=sidebar&tab=all&status=active&page=1" replace />} />
        <Route path="/super-admin/users" element={<Navigate to="/super-admin/users/overview?ref=sidebar&tab=all&status=active&page=1" replace />} />
        <Route path="/super-admin/plans" element={<Navigate to="/super-admin/plans/overview?ref=sidebar&tab=plans&status=active" replace />} />
        <Route path="/super-admin/billing" element={<Navigate to="/finance/payments/overview?ref=sidebar&tab=invoices&status=all&page=1" replace />} />
        <Route path="/super-admin/leads" element={<Navigate to="/leads/management/overview?ref=sidebar&tab=all&status=new" replace />} />
        <Route path="/super-admin/onboarding" element={<Navigate to="/super-admin/onboarding/overview?ref=sidebar" replace />} />
        <Route path="/super-admin/team" element={<Navigate to="/super-admin/team/overview?ref=sidebar" replace />} />
        <Route path="/super-admin/settings" element={<Navigate to="/super-admin/settings/overview?ref=sidebar&tab=general" replace />} />
        <Route path="/super-admin/profile" element={<Navigate to="/super-admin/profile/overview?ref=sidebar" replace />} />
        
        {/* Catch all route - redirect to super admin overview */}
        <Route path="*" element={<Navigate to="/super-admin/dashboard/overview?ref=sidebar&tab=overview" replace />} />
      </Routes>
    </div>
  )
}

export default App
