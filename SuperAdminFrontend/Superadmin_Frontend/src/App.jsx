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
        <Route path="/" element={<Navigate to="/super-admin" replace />} />
        
        {/* Super Admin Login */}
        <Route path="/super-admin/login" element={<SuperAdminLoginPage />} />
        
        {/* Protected Super Admin Routes */}
        <Route path="/super-admin" element={
          <ProtectedSuperAdminRoute>
            <SuperAdminDashboard />
          </ProtectedSuperAdminRoute>
        } />
        
        <Route path="/super-admin/tenants" element={
          <ProtectedSuperAdminRoute>
            <TenantManagementPage />
          </ProtectedSuperAdminRoute>
        } />
        
        <Route path="/super-admin/tenants/:id" element={
          <ProtectedSuperAdminRoute>
            <TenantDetailPage />
          </ProtectedSuperAdminRoute>
        } />
        
        <Route path="/super-admin/users" element={
          <ProtectedSuperAdminRoute>
            <UserManagementPage />
          </ProtectedSuperAdminRoute>
        } />
        
        <Route path="/super-admin/users/:id" element={
          <ProtectedSuperAdminRoute>
            <UserDetailPage />
          </ProtectedSuperAdminRoute>
        } />
        
        <Route path="/super-admin/plans" element={
          <ProtectedSuperAdminRoute>
            <PlansManagementPage />
          </ProtectedSuperAdminRoute>
        } />
        
        <Route path="/super-admin/billing" element={
          <ProtectedSuperAdminRoute>
            <BillingPage />
          </ProtectedSuperAdminRoute>
        } />
        
        <Route path="/super-admin/leads" element={
          <ProtectedSuperAdminRoute>
            <LeadsManagementPage />
          </ProtectedSuperAdminRoute>
        } />
        
        <Route path="/super-admin/onboarding" element={
          <ProtectedSuperAdminRoute>
            <OnboardingManagementPage />
          </ProtectedSuperAdminRoute>
        } />
        
        <Route path="/super-admin/team" element={
          <ProtectedSuperAdminRoute>
            <SuperAdminTeamPage />
          </ProtectedSuperAdminRoute>
        } />
        
        <Route path="/super-admin/settings" element={
          <ProtectedSuperAdminRoute>
            <PlatformSettingsPage />
          </ProtectedSuperAdminRoute>
        } />
        
        <Route path="/super-admin/profile" element={
          <ProtectedSuperAdminRoute>
            <ProfilePage />
          </ProtectedSuperAdminRoute>
        } />
        
        <Route path="/super-admin/create-tenant" element={
          <ProtectedSuperAdminRoute>
            <CreateTenantModal />
          </ProtectedSuperAdminRoute>
        } />
        
        {/* Catch all route - redirect to super admin */}
        <Route path="*" element={<Navigate to="/super-admin" replace />} />
      </Routes>
    </div>
  )
}

export default App
