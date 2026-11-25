# WorkMatrix HRMS & SuperAdmin - Dynamic Implementation Roadmap

This document outlines the step-by-step implementation tasks to transition all remaining mock/static modules into fully functional, database-backed dynamic features.

*(Note: Third-party OAuth authentication, Biometric physical hardware integration, and Payment Gateway checkouts are intentionally excluded).*

---

## 🗺️ Step-by-Step Task Breakdown

### Phase 1: Recruitment & Applicant Tracking System (ATS)
- [ ] **Step 1.1 (Backend)**: Create `Routes/recruitment.py` implementing REST endpoints for:
  - `GET /api/v1/recruitment/candidates`: Filter by stage, job title, search query, and pagination.
  - `POST /api/v1/recruitment/candidates`: Add new candidate with experience, skills, and resume.
  - `PATCH /api/v1/recruitment/candidates/{id}/stage`: Update hiring stage (`applied` ➔ `screening` ➔ `shortlisted` ➔ `interview` ➔ `offer` ➔ `hired` ➔ `rejected`).
  - `GET / POST / PATCH /api/v1/recruitment/interviews`: Schedule rounds, assign interviewers, and record feedback.
  - `GET / POST / PATCH /api/v1/recruitment/offers`: Draft and manage offers with CTC breakdown.
  - `POST /api/v1/recruitment/candidates/{id}/convert-to-employee`: Seamlessly migrate hired candidate into Employee/User collection.
- [ ] **Step 1.2 (Backend)**: Register `recruitment.py` in `Routes/__init__.py`.
- [ ] **Step 1.3 (Frontend)**: Create `src/services/recruitmentService.js` with all corresponding API methods.
- [ ] **Step 1.4 (Frontend)**: Connect UI components to live data:
  - `CandidatesPage.jsx`: Replace `initialCandidates` with real API fetching and creation.
  - `ApplicationPipelinePage.jsx`: Connect drag-and-drop Kanban state changes to stage update API.
  - `InterviewsPage.jsx`: Dynamic schedule viewer and feedback submission.
  - `OffersPage.jsx`: Dynamic offer cards and branded PDF generation.
  - `RecruitmentLayout.jsx`: Dynamic metrics (total candidates, interviews, offers).

### Phase 2: Project Management (PM) & Live Kanban Board
- [ ] **Step 2.1 (Frontend)**: Replace `mockData.js` in `KanbanBoard.jsx` with calls to `/api/v1/pm/tasks`.
- [ ] **Step 2.2 (Frontend)**: Wire drag-and-drop column transitions to `PATCH /api/v1/pm/tasks/{id}` (`todo` ➔ `in_progress` ➔ `review` ➔ `done`).
- [ ] **Step 2.3 (Frontend)**: In `CreateTaskModal.jsx`, wire task creation to `POST /api/v1/pm/tasks` and load live assignees from `/api/v1/pm/members`.
- [ ] **Step 2.4 (Frontend)**: In `MyTasksPage.jsx`, dynamically filter tasks for the logged-in user.
- [ ] **Step 2.5 (Frontend)**: In `ProjectDetailPage.jsx`, wire task attachment upload.

### Phase 3: Attendance Roster Engine & Shift Generation
- [ ] **Step 3.1 (Backend)**: Update `get_roster` in `Routes/attendance.py` to default to current week start and end dates to eliminate 422 errors.
- [ ] **Step 3.2 (Frontend)**: In `WeeklyRosterPage.jsx`, bind week selector to `/api/v1/attendance/roster`.
- [ ] **Step 3.3 (Frontend)**: Wire the "Auto Generate Roster" button to `POST /api/v1/attendance/roster/generate`.

### Phase 4: Unified Employee Notes System
- [ ] **Step 4.1 (Frontend)**: In `NotesSystemPage.jsx`, replace `SAMPLE_EMPLOYEES` with `employeeService.getEmployees()` and `SAMPLE_NOTES` with `noteService.getNotes()`.
- [ ] **Step 4.2 (Frontend)**: Implement live `@mention` autocomplete from active employee roster.
- [ ] **Step 4.3 (Frontend)**: Wire note creation, editing, privacy toggles, and deletion to `Routes/note.py`.

### Phase 5: Employee Exit & Offboarding Management (FnF)
- [ ] **Step 5.1 (Backend)**: Create `Routes/exit_management.py` exposing:
  - `POST /api/v1/exit-requests`: Resignation/termination submission.
  - `GET /api/v1/exit-requests`: Pending, active, and completed offboarding.
  - `PATCH /api/v1/exit-requests/{id}/clearance`: Update clearance flags (`assets_returned`, `access_revoked`, `fnf_processed`).
  - `POST /api/v1/exit-requests/{id}/complete`: Finalize offboarding and mark employee terminated.
- [ ] **Step 5.2 (Backend)**: Register `exit_management.py` in `Routes/__init__.py`.
- [ ] **Step 5.3 (Frontend)**: Create `src/services/exitService.js` and build the Exit Clearance view in Tenant Admin.

### Phase 6: Superadmin Operations & Bulk Management
- [ ] **Step 6.1 (Backend)**: Implement two-step deletion endpoints in `Routes/tenents.py`:
  - `POST /api/super-admin/tenants/{id}/mark-deletion`
  - `DELETE /api/super-admin/tenants/{id}`
- [ ] **Step 6.2 (Backend)**: Implement bulk tenant actions (`POST /api/super-admin/tenants/bulk-action`).
- [ ] **Step 6.3 (Frontend)**: Wire Step 1 and Step 2 deletion modals in `TenantDetailPage.jsx`.
- [ ] **Step 6.4 (Frontend)**: Wire bulk selection bar (Activate, Suspend, Export CSV) in `TenantManagementPage.jsx`.
- [ ] **Step 6.5 (Frontend)**: Wire TopBar quick search modal.

### Phase 7: Compliance Documents & Universal Table Cleanup
- [ ] **Step 7.1 (Backend)**: Expose compliance certificate upload and reminder endpoints in `Routes/attendance.py`.
- [ ] **Step 7.2 (Frontend)**: Wire statutory document upload modal and expiration alerts in `CompliancePage.jsx`.
- [ ] **Step 7.3 (Frontend)**: Standardize pagination (`<`, `1`, `>`) across secondary tables (Tickets, Leaves, CRM).

---

## 🛠️ Execution Tracking

| Phase | Description | Status |
| :---: | :--- | :---: |
| 1 | Recruitment & ATS Dynamic Pipeline | 🔄 In Progress |
| 2 | Project Management & Live Kanban | ⏳ Pending |
| 3 | Attendance Roster & Shift Generator | ⏳ Pending |
| 4 | Employee Notes & Mentions | ⏳ Pending |
| 5 | Exit Management & Clearance (FnF) | ⏳ Pending |
| 6 | Superadmin Two-Step Deletion & Bulk Ops | ⏳ Pending |
| 7 | Compliance Docs & Table Pagination | ⏳ Pending |
