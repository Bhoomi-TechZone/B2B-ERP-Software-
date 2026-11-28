import { useEffect } from 'react'
import { Route, Routes, Navigate, useParams, useNavigate, useLocation } from 'react-router-dom'

import Layout from './components/Layout'
import ProtectedRoute from './routes/ProtectedRoute'
import RoleRedirect from './routes/RoleRedirect'
import { useAuth } from './hooks/useAuth'
import { ROLE_IDS } from './config/roles'

// ── Public ─────────────────────────────────────────────────────────────────
import LandingPage from './pages/LandingPage'
import AuthPage from './components/website/auth/AuthPage'
import VerifyEmailPage from './pages/registration/VerifyEmailPage'
import AcceptInvitePage from './pages/auth/AcceptInvitePage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import CareersPage from './pages/public/CareersPage'
import { buildSignInUrl, buildRegisterUrl, buildRecoveryUrl } from './utils/authSession'

/**
 * HashInterceptor:
 * Catches legacy / bookmark hash routes like #register, #signin, #signup, #login
 * and redirects immediately to Canonical Secure Professional URLs.
 */
function HashInterceptor() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash
      if (!hash) return

      if (hash === '#register' || hash === '#signup' || hash.startsWith('#/register') || hash.startsWith('#/signup')) {
        window.history.replaceState(null, '', window.location.pathname)
        navigate(buildRegisterUrl({ ref: 'direct', mode: 'new-company' }), { replace: true })
      } else if (hash === '#signin' || hash === '#login' || hash.startsWith('#/signin') || hash.startsWith('#/login') || hash.startsWith('#/sign-in')) {
        window.history.replaceState(null, '', window.location.pathname)
        navigate(buildSignInUrl({ ref: 'direct', mode: 'enterprise' }), { replace: true })
      }
    }

    handleHash()
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [navigate, location])

  return null
}

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
    <>
      <HashInterceptor />
      <Routes>
        {/* ── Public ───────────────────────────────────────── */}
        <Route path="/" element={<LandingPage />} />
        {/* ── Auth — Canonical Secure Professional URLs ────────────────────── */}
        <Route path="/auth/sign-in" element={<AuthPage initialView="signin" />} />
        <Route path="/auth/account-recovery" element={<AuthPage initialView="signin" initialRecoveryOpen={true} />} />
        <Route path="/auth/register" element={<ErrorBoundary><AuthPage initialView="register" /></ErrorBoundary>} />
        <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/invite/accept" element={<AcceptInvitePage />} />

        {/* ── Auth — Legacy redirects (backward-compat) ────────────────────── */}
        <Route path="/login" element={<Navigate to={buildSignInUrl({ ref: 'legacy' })} replace />} />
        <Route path="/auth/login/overview" element={<Navigate to={buildSignInUrl({ ref: 'legacy' })} replace />} />
        <Route path="/forgot-password" element={<Navigate to={buildRecoveryUrl({ ref: 'legacy' })} replace />} />
        <Route path="/auth/forgot-password/overview" element={<Navigate to={buildRecoveryUrl({ ref: 'legacy' })} replace />} />
        <Route path="/registration" element={<Navigate to={buildRegisterUrl({ ref: 'legacy' })} replace />} />
        <Route path="/auth/register/overview" element={<Navigate to={buildRegisterUrl({ ref: 'legacy' })} replace />} />
        <Route path="/verify-email" element={<Navigate to="/auth/verify-email?op=verify&ref=legacy" replace />} />
        <Route path="/auth/verify-email/overview" element={<Navigate to="/auth/verify-email?op=verify&ref=legacy" replace />} />
        <Route path="/reset-password" element={<Navigate to="/auth/reset-password?op=reset&ref=legacy" replace />} />
        <Route path="/auth/reset-password/overview" element={<Navigate to="/auth/reset-password?op=reset&ref=legacy" replace />} />
        <Route path="/invite/accept" element={<Navigate to="/auth/invite/accept?op=accept&ref=legacy" replace />} />
        <Route path="/accept-invite" element={<Navigate to="/auth/invite/accept?op=accept&ref=legacy" replace />} />
        <Route path="/auth/invite/accept/overview" element={<Navigate to="/auth/invite/accept?op=accept&ref=legacy" replace />} />

        <Route path="/onboarding" element={<ErrorBoundary><OnboardingPage /></ErrorBoundary>} />
        <Route path="/careers" element={<CareersPage />} />

        {/* ── Authenticated ───────────────────────────────── */}
        <Route element={<ProtectedRoute />}>
          {/* All roles use the regular Sidebar/Layout */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<RoleRedirect />} />

            {/* ── Professional URLs (Canonical) ─────────────────── */}
            {/* Admin */}
            <Route path="/admin/dashboard/overview" element={<AdminDashboardPage />} />
            <Route path="/admin/reports/overview" element={<AdminReportsPage />} />
            <Route path="/admin/users/overview" element={<UserManagementPage />} />
            <Route path="/admin/users/:id" element={<UserDetailPage />} />
            <Route path="/admin/settings/overview" element={<PlatformSettingsPage />} />
            <Route path="/admin/notes/overview" element={<NotesSystemPage />} />

            {/* Finance & Payments (User Specification) */}
            <Route path="/finance/payments/overview" element={<SubscriptionPage />} />
            <Route path="/finance/billing/overview" element={<SubscriptionPage />} />
            <Route path="/finance/subscription/overview" element={<SubscriptionPage />} />

            {/* Leads & CRM (User Specification) */}
            <Route path="/leads/management/overview" element={<CRMPage />} />
            <Route path="/leads/*" element={<CRMPage />} />
            <Route path="/crm/leads/overview" element={<CRMPage />} />
            <Route path="/crm/opportunities/overview" element={<CRMPage />} />
            <Route path="/crm/deals/overview" element={<CRMPage />} />
            <Route path="/crm/clients/overview" element={<CRMPage />} />
            <Route path="/crm/demo-schedule/overview" element={<CRMPage />} />
            <Route path="/crm/*" element={<CRMPage />} />

            {/* HR Management */}
            <Route path="/hr/dashboard/overview" element={<HRDashboardPage />} />
            <Route path="/hr/employees/overview" element={<EmployeesPage />} />
            <Route path="/hr/employees/create" element={<AddEmployeePage />} />
            <Route path="/hr/employees/exit/overview" element={<ExitManagementPage />} />
            <Route path="/hr/employees/:id" element={<EmployeeProfilePage />} />
            <Route path="/hr/departments/overview" element={<DepartmentsPage />} />

            {/* Attendance */}
            <Route path="/attendance/monitoring/overview" element={<DailyAttendancePage />} />
            <Route path="/attendance/logs/overview" element={<MonthlyAttendancePage />} />
            <Route path="/attendance/shifts/overview" element={<ShiftManagementPage />} />
            <Route path="/attendance/requests/overview" element={<RequestsPage />} />
            <Route path="/attendance/compliance/overview" element={<AttendanceCompliance />} />
            <Route path="/attendance/reports/overview" element={<AttendanceReportsPage />} />
            <Route path="/attendance/biometric/overview" element={<BiometricConfigPage />} />
            <Route path="/attendance/my-attendance/overview" element={<MyAttendancePage />} />
            <Route path="/attendance/my-logs/overview" element={<MyLogsPage />} />
            <Route path="/attendance/my-requests/overview" element={<MyRequestsPage />} />

            {/* Leave Management */}
            <Route path="/leave/management/overview" element={<LeaveIndex />} />
            <Route path="/leave/policies/overview" element={<LeaveManagementPage />} />
            <Route path="/leave/balance/overview" element={<LeaveBalanceIndex />} />
            <Route path="/leave/apply/overview" element={<LeaveApplyIndex />} />
            <Route path="/leave/history/overview" element={<LeaveHistoryIndex />} />
            <Route path="/leave/requests/overview" element={<LeaveManagementPage />} />
            <Route path="/leave/calendar/overview" element={<LeaveManagementPage />} />
            <Route path="/leave/shift-rotation/overview" element={<LeaveManagementPage />} />

            {/* Payroll – Multi-Region */}
            <Route path="/payroll/management/overview" element={<Navigate to="/payroll/in/dashboard/overview?ref=sidebar&region=in&tab=dashboard" replace />} />
            <Route path="/payroll/employee/overview" element={<EmployeePayrollPage />} />

            {/* Recruitment ATS */}
            <Route path="/recruitment/sources/overview" element={<SourcesPage />} />
            <Route path="/recruitment/requisitions/overview" element={<RequisitionsPage />} />
            <Route path="/recruitment/jobs/overview" element={<JobPostingsPage />} />
            <Route path="/recruitment/candidates/overview" element={<CandidatesRecPage />} />
            <Route path="/recruitment/pipeline/overview" element={<ApplicationPipelinePage />} />
            <Route path="/recruitment/interviews/overview" element={<InterviewsPage />} />
            <Route path="/recruitment/offers/overview" element={<OffersPage />} />
            <Route path="/recruitment/hired/overview" element={<HiredPage />} />

            {/* Projects & Tasks */}
            <Route path="/projects/management/overview" element={<ProjectsIndex />} />
            <Route path="/projects/management/details/:id" element={<ProjectDetailPage />} />
            <Route path="/tasks/management/overview" element={<MyTasksPage />} />
            <Route path="/announcements/management/overview" element={<AnnouncementsPage />} />

            {/* Support & Compliance */}
            <Route path="/compliance/management/overview" element={<CompliancePage />} />
            <Route path="/support/tickets/overview" element={<TicketsPage />} />
            <Route path="/support/help-desk/overview" element={<EmployeeHelpDeskPage />} />

            {/* Employee Self-Service */}
            <Route path="/employee/dashboard/overview" element={<EmployeeDashboardPage />} />
            <Route path="/employee/profile/overview" element={<MyProfilePage />} />
            <Route path="/employee/documents/overview" element={<EmployeeDocumentsPage />} />
            <Route path="/employee/settings/overview" element={<EmployeeSettingsPage />} />
            <Route path="/employee/notifications/overview" element={<NotificationsPage />} />

            {/* Role Dashboards */}
            <Route path="/manager/dashboard/overview" element={<ManagerDashboardPage />} />
            <Route path="/sales/dashboard/overview" element={<SalesDashboardPage />} />
            <Route path="/sales/leads/overview" element={<SalesLeadsPage />} />
            <Route path="/sales/deals/overview" element={<SalesDealsPage />} />
            <Route path="/payroll-admin/dashboard/overview" element={<PayrollAdminDashboardPage />} />
            <Route path="/recruiter/dashboard/overview" element={<RecruiterDashboardPage />} />
            <Route path="/finance-viewer/dashboard/overview" element={<FinanceViewerDashboardPage />} />
            <Route path="/it-admin/dashboard/overview" element={<ITAdminDashboardPage />} />

            {/* ── Legacy Path Redirections (100% Backwards Compatible) ── */}
            <Route path="/admin/dashboard" element={<Navigate to="/admin/dashboard/overview?ref=sidebar&tab=overview" replace />} />
            <Route path="/admin/reports" element={<Navigate to="/admin/reports/overview?ref=sidebar&tab=summary&page=1" replace />} />
            <Route path="/admin/users" element={<Navigate to="/admin/users/overview?ref=sidebar&tab=users&status=active&page=1" replace />} />
            <Route path="/super-admin/users" element={<Navigate to="/admin/users/overview?ref=sidebar&tab=users&status=active&page=1" replace />} />
            <Route path="/super-admin/users/:id" element={<LegacySuperAdminUserRedirect />} />
            <Route path="/admin/subscription" element={<Navigate to="/finance/payments/overview?ref=sidebar&tab=invoices&status=all&page=1" replace />} />
            <Route path="/admin/billing" element={<Navigate to="/finance/payments/overview?ref=sidebar&tab=invoices&status=all&page=1" replace />} />
            <Route path="/billing" element={<Navigate to="/finance/payments/overview?ref=sidebar&tab=invoices&status=all&page=1" replace />} />

            <Route path="/hr/dashboard" element={<Navigate to="/hr/dashboard/overview?ref=sidebar&tab=overview" replace />} />
            <Route path="/hr/employees" element={<Navigate to="/hr/employees/overview?ref=sidebar&tab=all&status=active&page=1" replace />} />
            <Route path="/employees" element={<Navigate to="/hr/employees/overview?ref=sidebar&tab=all&status=active&page=1" replace />} />
            <Route path="/employees/create" element={<Navigate to="/hr/employees/create?ref=sidebar" replace />} />
            <Route path="/employees/exit" element={<Navigate to="/hr/employees/exit/overview?ref=sidebar&tab=all&status=pending" replace />} />
            <Route path="/employees/:id" element={<EmployeeProfilePage />} />
            <Route path="/departments" element={<Navigate to="/hr/departments/overview?ref=sidebar&tab=all&status=active" replace />} />

            <Route path="/manager/dashboard" element={<Navigate to="/manager/dashboard/overview?ref=sidebar&tab=overview" replace />} />
            <Route path="/sales/dashboard" element={<Navigate to="/sales/dashboard/overview?ref=sidebar&tab=overview" replace />} />
            <Route path="/sales/leads" element={<Navigate to="/sales/leads/overview?ref=sidebar&tab=all&status=new" replace />} />
            <Route path="/sales/deals" element={<Navigate to="/sales/deals/overview?ref=sidebar&tab=all&status=all" replace />} />

            <Route path="/employee/dashboard" element={<Navigate to="/employee/dashboard/overview?ref=sidebar&tab=overview" replace />} />
            <Route path="/my-profile" element={<Navigate to="/employee/profile/overview?ref=sidebar&tab=personal" replace />} />
            <Route path="/my-payroll" element={<Navigate to="/payroll/employee/overview?ref=sidebar&tab=payslips&page=1" replace />} />
            <Route path="/my-documents" element={<Navigate to="/employee/documents/overview?ref=sidebar&tab=all" replace />} />
            <Route path="/my-help-desk" element={<Navigate to="/support/help-desk/overview?ref=sidebar&tab=all" replace />} />
            <Route path="/my-settings" element={<Navigate to="/employee/settings/overview?ref=sidebar&tab=preferences" replace />} />
            <Route path="/notifications" element={<Navigate to="/employee/notifications/overview?ref=sidebar&tab=all" replace />} />

            <Route path="/attendance/my-attendance" element={<Navigate to="/attendance/my-attendance/overview?ref=sidebar&tab=my-attendance" replace />} />
            <Route path="/attendance/my-logs" element={<Navigate to="/attendance/my-logs/overview?ref=sidebar&tab=logs&page=1" replace />} />
            <Route path="/attendance/my-requests" element={<Navigate to="/attendance/my-requests/overview?ref=sidebar&tab=requests&status=all" replace />} />

            <Route path="/payroll-admin/dashboard" element={<Navigate to="/payroll-admin/dashboard/overview?ref=sidebar&tab=overview" replace />} />
            <Route path="/recruiter/dashboard" element={<Navigate to="/recruiter/dashboard/overview?ref=sidebar&tab=overview" replace />} />
            <Route path="/finance-viewer/dashboard" element={<Navigate to="/finance-viewer/dashboard/overview?ref=sidebar&tab=overview" replace />} />
            <Route path="/it-admin/dashboard" element={<Navigate to="/it-admin/dashboard/overview?ref=sidebar&tab=overview" replace />} />

            <Route path="/notes" element={<Navigate to="/admin/notes/overview?ref=sidebar&tab=all" replace />} />
            <Route path="/settings" element={<Navigate to="/admin/settings/overview?ref=sidebar&tab=general" replace />} />
            <Route path="/announcements" element={<Navigate to="/announcements/management/overview?ref=sidebar&tab=all&page=1" replace />} />
            <Route path="/compliance" element={<Navigate to="/compliance/management/overview?ref=sidebar&tab=all&status=active" replace />} />
            <Route path="/tickets" element={<Navigate to="/support/tickets/overview?ref=sidebar&tab=tickets&status=open&page=1" replace />} />

            {/* Payroll Multi-Region Nested */}
            <Route path="/payroll" element={<PayrollLayout />}>
              <Route index element={<Navigate to="/payroll/in/dashboard/overview?ref=sidebar&region=in&tab=dashboard" replace />} />
              <Route path="in" element={<Navigate to="/payroll/in/dashboard/overview?ref=sidebar&region=in&tab=dashboard" replace />} />
              <Route path="in/dashboard" element={<InDashboard />} />
              <Route path="in/dashboard/overview" element={<InDashboard />} />
              <Route path="in/run" element={<InRunPayroll />} />
              <Route path="in/run/overview" element={<InRunPayroll />} />
              <Route path="in/payslips" element={<InPayslips />} />
              <Route path="in/payslips/overview" element={<InPayslips />} />

              <Route path="us" element={<Navigate to="/payroll/us/dashboard/overview?ref=sidebar&region=us&tab=dashboard" replace />} />
              <Route path="us/dashboard" element={<UsDashboard />} />
              <Route path="us/dashboard/overview" element={<UsDashboard />} />
              <Route path="us/run" element={<UsRunPayroll />} />
              <Route path="us/run/overview" element={<UsRunPayroll />} />
              <Route path="us/payslips" element={<UsPayslips />} />
              <Route path="us/payslips/overview" element={<UsPayslips />} />

              <Route path="uk" element={<Navigate to="/payroll/uk/dashboard/overview?ref=sidebar&region=uk&tab=dashboard" replace />} />
              <Route path="uk/dashboard" element={<UkDashboard />} />
              <Route path="uk/dashboard/overview" element={<UkDashboard />} />
              <Route path="uk/run" element={<UkRunPayroll />} />
              <Route path="uk/run/overview" element={<UkRunPayroll />} />
              <Route path="uk/payslips" element={<UkPayslips />} />
              <Route path="uk/payslips/overview" element={<UkPayslips />} />
            </Route>

            {/* Leave Nested */}
            <Route path="/leave" element={<LeaveIndex />} />
            <Route path="/leave/policies" element={<Navigate to="/leave/policies/overview?ref=sidebar&tab=policies" replace />} />
            <Route path="/leave/balance" element={<Navigate to="/leave/balance/overview?ref=sidebar&tab=balance" replace />} />
            <Route path="/leave/apply" element={<Navigate to="/leave/apply/overview?ref=sidebar&tab=apply" replace />} />
            <Route path="/leave/history" element={<Navigate to="/leave/history/overview?ref=sidebar&tab=history&page=1" replace />} />
            <Route path="/leave/requests" element={<Navigate to="/leave/requests/overview?ref=sidebar&tab=requests&status=all&page=1" replace />} />
            <Route path="/leave/calendar" element={<Navigate to="/leave/calendar/overview?ref=sidebar&tab=calendar" replace />} />
            <Route path="/leave/shift-rotation" element={<Navigate to="/leave/shift-rotation/overview?ref=sidebar&tab=shift-rotation" replace />} />

            {/* Attendance Nested */}
            <Route path="/attendance" element={<AttendanceLayout />}>
              <Route index element={<Navigate to="/attendance/monitoring/overview?ref=sidebar&tab=daily&status=all&page=1" replace />} />
              <Route path="daily" element={<DailyAttendancePage />} />
              <Route path="monthly" element={<MonthlyAttendancePage />} />
              <Route path="shifts" element={<ShiftManagementPage />} />
              <Route path="requests" element={<RequestsPage />} />
              <Route path="compliance" element={<AttendanceCompliance />} />
              <Route path="reports" element={<AttendanceReportsPage />} />
              <Route path="biometric" element={<BiometricConfigPage />} />
            </Route>

            {/* Recruitment Nested */}
            <Route path="/recruitment" element={<RecruitmentLayout />}>
              <Route index element={<Navigate to="/recruitment/requisitions/overview?ref=sidebar&tab=requisitions&status=all&page=1" replace />} />
              <Route path="sources" element={<SourcesPage />} />
              <Route path="requisitions" element={<RequisitionsPage />} />
              <Route path="jobs" element={<JobPostingsPage />} />
              <Route path="candidates" element={<CandidatesRecPage />} />
              <Route path="applications" element={<ApplicationPipelinePage />} />
              <Route path="interviews" element={<InterviewsPage />} />
              <Route path="offers" element={<OffersPage />} />
              <Route path="hired" element={<HiredPage />} />
            </Route>

            {/* Projects Nested */}
            <Route path="/projects" element={<ProjectsLayout />}>
              <Route index element={<ProjectsIndex />} />
              <Route path=":id" element={<ProjectDetailPage />} />
            </Route>
            <Route path="/tasks" element={<ProjectsLayout />}>
              <Route index element={<MyTasksPage />} />
            </Route>

            <Route path="/onboarding-wizard" element={<OnboardingWizard />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
