from typing import Dict, Any, List
from uuid import UUID
from datetime import datetime, timezone, date, timedelta
from Models.employee import Employee, Department
from Models.tenant_user import Tenant, User
from Models.leave import LeavePolicy
from Models.employeeleave import LeaveApplication
from Models.payroll import PayrollRun
from Models.attendance import Shift, GlobalAttendancePolicy
from Models.login_security import LoginEvent
from Schema.admin_dashboard import AdminDashboardResponse

class AdminDashboardService:
    @staticmethod
    async def get_dashboard_stats(tenant_id: UUID) -> AdminDashboardResponse:
        # Fetch employees
        employees = await Employee.find(Employee.tenant_id == tenant_id).to_list()
        total_employees = len(employees)
        
        now = datetime.now(timezone.utc)
        today_date = now.date()
        today_dt = datetime(today_date.year, today_date.month, today_date.day)
        
        active_today = 0
        for emp in employees:
            if hasattr(emp, 'employment_status') and emp.employment_status == "Active":
                active_today += 1
            elif not hasattr(emp, 'employment_status') or str(emp.employment_status).lower() == 'active':
                active_today += 1

        # Real leaves covering today
        active_leaves = await LeaveApplication.find(
            LeaveApplication.tenant_id == tenant_id,
            LeaveApplication.status == "Approved",
            LeaveApplication.start_date <= today_dt,
            LeaveApplication.end_date >= today_dt
        ).to_list()
        on_leave_count = len(active_leaves)
        on_leave_emp_ids = {str(l.employee_id) for l in active_leaves}

        # Attendance stats
        present_count = max(0, active_today - on_leave_count)
        absent_count = max(0, total_employees - present_count - on_leave_count)
        rate = round((present_count / total_employees * 100), 1) if total_employees > 0 else 0.0

        attendance_stats = {
            "present": present_count,
            "absent": absent_count,
            "late": 0,
            "onLeave": on_leave_count,
            "total": total_employees,
            "rate": rate
        }

        # Departments
        departments = await Department.find(Department.tenant_id == tenant_id).to_list()
        dept_dict = {str(d.id): d.name for d in departments}
        dept_counts = {}
        for emp in employees:
            d_name = dept_dict.get(str(emp.department_id), "Unassigned") if emp.department_id else "Unassigned"
            dept_counts[d_name] = dept_counts.get(d_name, 0) + 1

        dept_stats = []
        for name, count in dept_counts.items():
            dept_stats.append({
                "name": name,
                "headcount": count,
                "onLeave": 0,
                "avgLeave": 0.0,
                "trend": "stable"
            })

        # Dynamic Absent Employees (real on-leave or inactive employees)
        absent_employees = []
        colors = ["bg-blue-500", "bg-pink-500", "bg-amber-500", "bg-violet-500", "bg-emerald-500", "bg-rose-500"]
        for i, emp in enumerate(employees):
            if str(emp.id) in on_leave_emp_ids or getattr(emp, 'employment_status', 'Active') != 'Active':
                first = emp.first_name or ""
                last = emp.last_name or ""
                name = f"{first} {last}".strip() or "Employee"
                initials = f"{first[:1]}{last[:1]}".upper() if first or last else "EM"
                d_name = dept_dict.get(str(emp.department_id), "General") if emp.department_id else "General"
                absent_employees.append({
                    "id": str(emp.id),
                    "name": name,
                    "role": getattr(emp, 'designation', 'Employee') or 'Employee',
                    "dept": d_name,
                    "initials": initials,
                    "color": colors[i % len(colors)]
                })

        # Dynamic Recent Activity from real login events and employee events
        activities = []
        try:
            recent_logins = await LoginEvent.find().sort(-LoginEvent.created_at).limit(5).to_list()
            user_ids = [l.user_id for l in recent_logins if l.user_id]
            users = await User.find({"_id": {"$in": user_ids}}).to_list() if user_ids else []
            user_map = {str(u.id): (u.name or u.email.split('@')[0]) for u in users}

            for idx, log in enumerate(recent_logins):
                u_name = user_map.get(str(log.user_id), "Admin User")
                created = log.created_at.replace(tzinfo=None) if log.created_at else datetime.utcnow()
                diff_sec = (datetime.utcnow() - created).total_seconds()
                if diff_sec < 60:
                    time_ago = "Just now"
                elif diff_sec < 3600:
                    time_ago = f"{int(diff_sec // 60)}m ago"
                elif diff_sec < 86400:
                    time_ago = f"{int(diff_sec // 3600)}h ago"
                else:
                    time_ago = f"{int(diff_sec // 86400)}d ago"

                is_success = "success" in str(getattr(log, 'event_type', '')).lower()
                action_text = "signed in securely" if is_success else "session authentication"
                activities.append({
                    "id": str(log.id),
                    "user": u_name,
                    "action": action_text,
                    "time": time_ago,
                    "avatar": (u_name[:2]).upper() if len(u_name) >= 2 else "US",
                    "color": "bg-gradient-to-br from-blue-500 to-blue-600",
                    "icon": "CheckCircle2"
                })
        except Exception:
            pass

        if not activities:
            activities = [
                {"id": "1", "user": "System Admin", "action": "active session", "time": "Just now", "avatar": "SA", "color": "bg-gradient-to-br from-blue-500 to-blue-600", "icon": "CheckCircle2"}
            ]

        # Dynamic Onboarding Checklist from real MongoDB collections
        has_leave_policies = (await LeavePolicy.find(LeavePolicy.tenant_id == tenant_id).count()) > 0
        has_compliance_rules = (await GlobalAttendancePolicy.find(GlobalAttendancePolicy.tenant_id == tenant_id).count()) > 0 or (await Shift.find(Shift.tenant_id == tenant_id).count()) > 0
        has_payroll_run = (await PayrollRun.find(PayrollRun.tenant_id == tenant_id).count()) > 0

        checklist = [
            {"task": "Add First Employee", "completed": total_employees > 0},
            {"task": "Configure Departments", "completed": len(departments) > 0},
            {"task": "Set Up Leave Policies", "completed": has_leave_policies},
            {"task": "Define Compliance Rules", "completed": has_compliance_rules},
            {"task": "Invite Team Members", "completed": total_employees > 1},
            {"task": "Run First Payroll", "completed": has_payroll_run}
        ]

        # Dynamic Compliance / Leaves review
        pending_leaves = await LeaveApplication.find(
            LeaveApplication.tenant_id == tenant_id,
            LeaveApplication.status == "Pending"
        ).count()

        compliance = []
        if pending_leaves > 0:
            compliance.append({
                "id": "1",
                "subject": f"Review {pending_leaves} Pending Leave Requests",
                "time": "Today",
                "start": today_date.strftime("%d-%m-%Y"),
                "end": today_date.strftime("%d-%m-%Y"),
                "priority": "High" if pending_leaves > 3 else "Medium",
                "audience": "HR Dept",
                "dot": "bg-amber-500" if pending_leaves <= 3 else "bg-red-500"
            })
        else:
            compliance.append({
                "id": "1",
                "subject": "All Leave Requests Reviewed",
                "time": "Up to date",
                "start": today_date.strftime("%d-%m-%Y"),
                "end": today_date.strftime("%d-%m-%Y"),
                "priority": "Low",
                "audience": "HR Dept",
                "dot": "bg-emerald-500"
            })
        
        # Dynamic Schedule
        recent_payroll = await PayrollRun.find(PayrollRun.tenant_id == tenant_id).sort(-PayrollRun.created_at).first_or_none()
        schedule = []
        if recent_payroll and getattr(recent_payroll, 'status', None) == 'draft':
            schedule.append({
                "id": "1",
                "title": f"Payroll Draft for {getattr(recent_payroll, 'month', 'Current Cycle')}",
                "time": "Review Pending",
                "highlight": True
            })
        else:
            schedule.append({
                "id": "1",
                "title": "Monthly Payroll Processing",
                "time": "Next Cycle Scheduled",
                "highlight": False
            })

        # CRM Stats
        crm_stats = {
            "totalRevenue": "₹0",
            "revenueGrowth": 0.0,
            "pendingRevenue": "₹0",
            "collectedRevenue": "₹0",
            "totalLeads": 0,
            "newLeadsToday": 0,
            "leadConversionRate": 0.0,
            "winRateData": [0, 0, 0]
        }

        tenant = await Tenant.get(tenant_id)
        active_modules = tenant.modules if tenant and hasattr(tenant, 'modules') else []
        has_crm = any(m.get('id') == 'crm' for m in active_modules) if active_modules else False
        
        return {
            "attendance": attendance_stats,
            "departments": dept_stats,
            "schedule": schedule,
            "compliance": compliance,
            "absentEmployees": absent_employees,
            "activities": activities,
            "checklist": checklist,
            "crm_stats": crm_stats if has_crm else None
        }
