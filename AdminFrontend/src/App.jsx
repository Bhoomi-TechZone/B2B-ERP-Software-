import { Route, Routes, Navigate, useParams } from 'react-router-dom'

import Layout from './components/Layout'
import ProtectedRoute from './routes/ProtectedRoute'
import RoleRedirect from './routes/RoleRedirect'
import { useAuth } from './hooks/useAuth'
import { ROLE_IDS } from './config/roles'

// ── Public ─────────────────────────────────────────────────────────────────
import LandingPage from './pages/LandingPage'
import RegistrationPage from './pages/registration/RegistrationPage'
import VerifyEmailPage from './pages/registration/VerifyEmailPage'
import LoginPage from './pages/auth/LoginPage'
import AcceptInvitePage from './pages/auth/AcceptInvitePage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import CareersPage from './pages/public/CareersPage'

// ── Role-specific dashboards ───────────────────────────────────────────────
import AdminDashboardPage from './pages/dashboard/admin/AdminDashboardPage'
import AdminReportsPage from './pages/dashboard/admin/ReportsPage'

// ── Super Admin Pages ──────────────────────────────────────────────────────
import SuperAdminDashboardPage from './pages/admin/SuperAdminDashboardPage'
import TenantManagementPage from './pages/admin/TenantManagementPage'
import TenantDetailPage from './pages/admin/TenantDetailPage'
import UserManagementPage from './pages/admin/UserManagementPage'
import UserDetailPage from './pages/admin/UserDetailPage'
import SuperAdminBillingPage from './pages/admin/SubscriptionPage'
import SuperAdminTeamPage from './pages/admin/SuperAdminTeamPage'
import LeadsManagementPage from './pages/admin/LeadsManagementPage'
import OnboardingManagementPage from './pages/admin/OnboardingManagementPage'
import PlansManagementPage from './pages/admin/PlansManagementPage'

import HRDashboardPage from './pages/dashboard/hr/HRDashboardPage'
import HREmployeesPage from './pages/dashboard/hr/EmployeesPage'

import SalesDashboardPage from './pages/dashboard/sales/SalesDashboardPage'
import SalesLeadsPage from './pages/dashboard/sales/LeadsPage'
import SalesDealsPage from './pages/dashboard/sales/DealsPage'

import ManagerDashboardPage from './pages/dashboard/manager/ManagerDashboardPage'
import EmployeeDashboardPage from './pages/dashboard/employee/EmployeeDashboardPage'
import MyProfilePage from './pages/dashboard/employee/MyProfilePage'
import EmployeePayrollPage from './pages/dashboard/employee/EmployeePayrollPage'
import EmployeeDocumentsPage from './pages/dashboard/employee/EmployeeDocumentsPage'
import EmployeeHelpDeskPage from './pages/dashboard/employee/EmployeeHelpDeskPage'
import EmployeeSettingsPage from './pages/dashboard/employee/EmployeeSettingsPage'

// Employee specific pages matching design
import MyAttendancePage from './pages/attendance/employee/MyAttendancePage'
import MyLogsPage from './pages/attendance/employee/MyLogsPage'
import MyRequestsPage from './pages/attendance/employee/MyRequestsPage'
import EmployeeLeavePage from './pages/leave/employee/EmployeeLeavePage'
import NotificationsPage from './pages/dashboard/employee/NotificationsPage'


// ── Invite-specific dashboards ─────────────────────────────────────────
import PayrollAdminDashboardPage from './pages/dashboard/payroll-admin/PayrollAdminDashboardPage'
import RecruiterDashboardPage from './pages/dashboard/recruiter/RecruiterDashboardPage'
import FinanceViewerDashboardPage from './pages/dashboard/finance-viewer/FinanceViewerDashboardPage'
import ITAdminDashboardPage from './pages/dashboard/it-admin/ITAdminDashboardPage'

// ── CRM ────────────────────────────────────────────────────────────────────
import CRMPage from './pages/crm/CRMPage'

// ── HR / People modules ────────────────────────────────────────────────────
import EmployeesPage from './pages/employees/EmployeesPage'
import DepartmentsPage from './pages/departments/DepartmentsPage'
import AddEmployeePage from './pages/employees/AddEmployeePage'
import EmployeeProfilePage from './pages/employees/EmployeeProfilePage'
import ExitManagementPage from './pages/employees/ExitManagementPage'

import PayrollLayout from './pages/payroll/PayrollLayout'

// ── India Payroll ──────────────────────────────────────────────────────────────
import InDashboard from './pages/payroll/in/InDashboard'
import InRunPayroll from './pages/payroll/in/InRunPayroll'
import InPayslips from './pages/payroll/in/InPayslips'

// ── US Payroll ─────────────────────────────────────────────────────────────────
import UsDashboard from './pages/payroll/us/UsDashboard'
import UsRunPayroll from './pages/payroll/us/UsRunPayroll'
import UsPayslips from './pages/payroll/us/UsPayslips'

// ── UK Payroll ─────────────────────────────────────────────────────────────────
import UkDashboard from './pages/payroll/uk/UkDashboard'
import UkRunPayroll from './pages/payroll/uk/UkRunPayroll'
import UkPayslips from './pages/payroll/uk/UkPayslips'

import LeaveManagementPage from './pages/leave/LeaveManagementPage'

import AttendanceLayout from './pages/attendance/AttendanceLayout'
import DailyAttendancePage from './pages/attendance/DailyAttendancePage'
import MonthlyAttendancePage from './pages/attendance/MonthlyAttendancePage'
import RequestsPage from './pages/attendance/RequestsPage'
import BiometricConfigPage from './pages/attendance/BiometricConfigPage'
import ShiftManagementPage from './pages/attendance/ShiftManagementPage'
import AttendanceCompliance from './pages/attendance/AttendanceCompliance'
import AttendanceReportsPage from './pages/attendance/AttendanceReportsPage'

import RecruitmentLayout from './pages/recruitment/RecruitmentLayout'
import RequisitionsPage from './pages/recruitment/components/RequisitionsPage'
import JobPostingsPage from './pages/recruitment/components/JobPostingsPage'
import CandidatesRecPage from './pages/recruitment/components/CandidatesPage'
import ApplicationPipelinePage from './pages/recruitment/components/ApplicationPipelinePage'
import InterviewsPage from './pages/recruitment/components/InterviewsPage'
import OffersPage from './pages/recruitment/components/OffersPage'
import HiredPage from './pages/recruitment/components/HiredPage'
import SourcesPage from './pages/recruitment/components/SourcesPage'

import ProjectsLayout from './pages/projects/ProjectsLayout'
import ProjectsDashboard from './pages/projects/ProjectsDashboard'
import ProjectDetailPage from './pages/projects/ProjectDetailPage'
import MyTasksPage from './pages/projects/MyTasksPage'

// ── Cross-cutting modules ──────────────────────────────────────────────────
import OnboardingPage from './pages/onboarding/OnboardingPage'
import OnboardingWizard from './pages/onboarding/OnboardingWizard'
import ErrorBoundary from './components/ErrorBoundary'

import CompliancePage from './pages/compliance/CompliancePage'
import TicketsPage from './pages/tickets/TicketsPage'

// ── Subscription Management ────────────────────────────────────────────────
import SubscriptionPage from './pages/admin/SubscriptionPage'
import NotesSystemPage from "./pages/admin/notes/NotesSystemPage";
import PlatformSettingsPage from './pages/admin/settings/PlatformSettingsPage'
import AnnouncementsPage from './pages/dashboard/employee/AnnouncementsPage'

function LegacySuperAdminUserRedirect() {
  const { id } = useParams()
  return <Navigate to={`/admin/users/${id}`} replace />
}

function ProjectsIndex() {
  const { role } = useAuth()
  if (role === ROLE_IDS.EMPLOYEE) {
    return <MyTasksPage />
  }
  return <ProjectsDashboard />
}

function LeaveIndex() {
  const { role } = useAuth()
  const isEmployee = role === ROLE_IDS.EMPLOYEE || role === 'employee'
  if (isEmployee) {
    return <Navigate to="/leave/balance" replace />
  }
  return <LeaveManagementPage />
}

function LeaveBalanceIndex() {
  const { role } = useAuth()
  const isEmployee = role === ROLE_IDS.EMPLOYEE || role === 'employee'
  if (isEmployee) {
    return <EmployeeLeavePage activeTab="balance" />
  }
  return <LeaveManagementPage />
}

function LeaveApplyIndex() {
  const { role } = useAuth()
  const isEmployee = role === ROLE_IDS.EMPLOYEE || role === 'employee'
  if (isEmployee) {
    return <EmployeeLeavePage activeTab="apply" />
  }
  return <Navigate to="/leave/policies" replace />
}

function LeaveHistoryIndex() {
  const { role } = useAuth()
  const isEmployee = role === ROLE_IDS.EMPLOYEE || role === 'employee'
  if (isEmployee) {
    return <EmployeeLeavePage activeTab="history" />
  }
  return <Navigate to="/leave/policies" replace />
}


function App() {
  return (
    <Routes>
      {/* ── Public ───────────────────────────────────────── */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<LoginPage initialRecoveryOpen={true} />} />
      <Route path="/registration" element={<ErrorBoundary><RegistrationPage /></ErrorBoundary>} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/onboarding" element={<ErrorBoundary><OnboardingPage /></ErrorBoundary>} />
      <Route path="/invite/accept" element={<AcceptInvitePage />} />
      <Route path="/accept-invite" element={<AcceptInvitePage />} />
      <Route path="/careers" element={<CareersPage />} />

      {/* ── Authenticated ───────────────────────────────── */}
      <Route element={<ProtectedRoute />}>
        {/* All roles use the regular Sidebar/Layout */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<RoleRedirect />} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/reports" element={<AdminReportsPage />} />
          <Route path="/admin/users" element={<UserManagementPage />} />
          <Route path="/admin/users/:id" element={<UserDetailPage />} />
          <Route path="/super-admin/users" element={<Navigate to="/admin/users" replace />} />
          <Route path="/super-admin/users/:id" element={<LegacySuperAdminUserRedirect />} />
          <Route path="/admin/subscription" element={<SubscriptionPage />} />
          <Route path="/admin/billing" element={<Navigate to="/admin/subscription" replace />} />
          {/* HR */}
          <Route path="/hr/dashboard" element={<HRDashboardPage />} />
          <Route path="/hr/employees" element={<HREmployeesPage />} />

          {/* Manager */}
          <Route path="/manager/dashboard" element={<ManagerDashboardPage />} />

          {/* Sales */}
          <Route path="/sales/dashboard" element={<SalesDashboardPage />} />
          <Route path="/sales/leads" element={<SalesLeadsPage />} />
          <Route path="/sales/deals" element={<SalesDealsPage />} />

          {/* Employee self-service */}
          <Route path="/employee/dashboard" element={<EmployeeDashboardPage />} />
          <Route path="/my-profile" element={<MyProfilePage />} />
          <Route path="/my-payroll" element={<EmployeePayrollPage />} />
          <Route path="/my-documents" element={<EmployeeDocumentsPage />} />
          <Route path="/my-help-desk" element={<EmployeeHelpDeskPage />} />
          <Route path="/my-settings" element={<EmployeeSettingsPage />} />

          {/* Custom high-fidelity employee pages */}
          <Route path="/attendance/my-attendance" element={<MyAttendancePage />} />
          <Route path="/attendance/my-logs" element={<MyLogsPage />} />
          <Route path="/attendance/my-requests" element={<MyRequestsPage />} />


          {/* Invite-specific roles */}
          <Route path="/payroll-admin/dashboard" element={<PayrollAdminDashboardPage />} />
          <Route path="/recruiter/dashboard" element={<RecruiterDashboardPage />} />
          <Route path="/finance-viewer/dashboard" element={<FinanceViewerDashboardPage />} />
          <Route path="/it-admin/dashboard" element={<ITAdminDashboardPage />} />

          {/* CRM */}
          <Route path="/crm/*" element={<CRMPage />} />

          {/* Employees (HR) */}
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/employees/create" element={<AddEmployeePage />} />
          <Route path="/employees/exit" element={<ExitManagementPage />} />
          <Route path="/employees/:id" element={<EmployeeProfilePage />} />

          {/* Departments */}
          <Route path="/departments" element={<DepartmentsPage />} />
          <Route path="/notes" element={<NotesSystemPage />} />
          <Route path="/settings" element={<PlatformSettingsPage />} />
          <Route path="/announcements" element={<AnnouncementsPage />} />

          {/* Payroll – Multi-Region */}
          <Route path="/payroll" element={<PayrollLayout />}>
            {/* Root → India dashboard */}
            <Route index element={<Navigate to="/payroll/in/dashboard" replace />} />

            {/* India */}
            <Route path="in" element={<Navigate to="/payroll/in/dashboard" replace />} />
            <Route path="in/dashboard" element={<InDashboard />} />
            <Route path="in/run" element={<InRunPayroll />} />
            <Route path="in/payslips" element={<InPayslips />} />

            {/* US */}
            <Route path="us" element={<Navigate to="/payroll/us/dashboard" replace />} />
            <Route path="us/dashboard" element={<UsDashboard />} />
            <Route path="us/run" element={<UsRunPayroll />} />
            <Route path="us/payslips" element={<UsPayslips />} />

            {/* UK */}
            <Route path="uk" element={<Navigate to="/payroll/uk/dashboard" replace />} />
            <Route path="uk/dashboard" element={<UkDashboard />} />
            <Route path="uk/run" element={<UkRunPayroll />} />
            <Route path="uk/payslips" element={<UkPayslips />} />
          </Route>

          {/* Leave - HR/Admin & Employee Unified */}
          <Route path="/leave" element={<LeaveIndex />} />
          <Route path="/leave/policies" element={<LeaveManagementPage />} />
          <Route path="/leave/balance" element={<LeaveBalanceIndex />} />
          <Route path="/leave/apply" element={<LeaveApplyIndex />} />
          <Route path="/leave/history" element={<LeaveHistoryIndex />} />
          <Route path="/leave/requests" element={<LeaveManagementPage />} />
          <Route path="/leave/calendar" element={<LeaveManagementPage />} />
          <Route path="/leave/shift-rotation" element={<LeaveManagementPage />} />

          {/* Attendance Monitoring (Part 6) */}
          <Route path="/attendance" element={<AttendanceLayout />}>
            <Route index element={<Navigate to="/attendance/daily" replace />} />
            <Route path="daily" element={<DailyAttendancePage />} />
            <Route path="monthly" element={<MonthlyAttendancePage />} />
            <Route path="shifts" element={<ShiftManagementPage />} />
            <Route path="requests" element={<RequestsPage />} />
            <Route path="compliance" element={<AttendanceCompliance />} />
            <Route path="reports" element={<AttendanceReportsPage />} />
            <Route path="biometric" element={<BiometricConfigPage />} />
          </Route>

          {/* Recruitment ATS */}
          <Route path="/recruitment" element={<RecruitmentLayout />}>
            <Route index element={<Navigate to="/recruitment/requisitions" replace />} />
            <Route path="sources" element={<SourcesPage />} />
            <Route path="requisitions" element={<RequisitionsPage />} />
            <Route path="jobs" element={<JobPostingsPage />} />
            <Route path="candidates" element={<CandidatesRecPage />} />
            <Route path="applications" element={<ApplicationPipelinePage />} />
            <Route path="interviews" element={<InterviewsPage />} />
            <Route path="offers" element={<OffersPage />} />
            <Route path="hired" element={<HiredPage />} />
          </Route>

          {/* Projects */}
          <Route path="/projects" element={<ProjectsLayout />}>
            <Route index element={<ProjectsIndex />} />
            <Route path=":id" element={<ProjectDetailPage />} />
          </Route>
          <Route path="/tasks" element={<ProjectsLayout />}>
            <Route index element={<MyTasksPage />} />
          </Route>

          {/* Misc */}

          <Route path="/compliance" element={<CompliancePage />} />
          <Route path="/tickets" element={<TicketsPage />} />
          <Route path="/onboarding-wizard" element={<OnboardingWizard />} />

          {/* Placeholder routes — point to a known component until real pages land */}
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/billing"       element={<SuperAdminBillingPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
