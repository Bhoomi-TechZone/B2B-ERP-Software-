import { useState, memo } from 'react'
import { motion } from 'motion/react'
import { CheckSquare, Banknote, Umbrella, ClipboardList, Users, Download } from 'lucide-react'

const ReportsPage = memo(() => {
  const [activeCategory, setActiveCategory] = useState('attendance')

  const reportCategories = [
    { id: 'attendance', label: 'Attendance Reports', icon: CheckSquare },
    { id: 'payroll', label: 'Payroll Reports', icon: Banknote },
    { id: 'leave', label: 'Leave Reports', icon: Umbrella },
    { id: 'compliance', label: 'Compliance Reports', icon: ClipboardList },
    { id: 'recruitment', label: 'Recruitment Reports', icon: Users },
  ]

  const attendanceReports = [
    {
      id: 1,
      name: 'Daily Attendance Summary',
      description: 'Present, Absent, Late employees for selected date',
      format: ['PDF', 'Excel'],
    },
    {
      id: 2,
      name: 'Monthly Attendance Report',
      description: 'Full month attendance with percentages & trends',
      format: ['PDF', 'Excel'],
    },
    {
      id: 3,
      name: 'Late Arrival Report',
      description: 'Employees with frequent late arrivals',
      format: ['PDF', 'Excel'],
    },
    {
      id: 4,
      name: 'Absenteeism Report',
      description: 'Department-wise attendance patterns',
      format: ['PDF', 'Excel'],
    },
  ]

  const payrollReports = [
    {
      id: 1,
      name: 'Monthly Payroll Summary',
      description: 'Total gross, deductions, and net payroll',
      format: ['PDF', 'Excel'],
    },
    {
      id: 2,
      name: 'Department-wise Cost',
      description: 'Payroll breakdown by department',
      format: ['PDF', 'Excel'],
    },
    {
      id: 3,
      name: 'Tax Deduction Report (TDS)',
      description: 'Employee-wise tax deductions for filing',
      format: ['PDF', 'Excel'],
    },
    {
      id: 4,
      name: 'PF/ESI Contribution',
      description: 'Statutory deductions summary',
      format: ['PDF', 'Excel'],
    },
  ]

  const complianceReports = [
    {
      id: 1,
      name: 'FLSA Compliance Report (US)',
      description: 'Fair Labor Standards Act overtime tracking',
      format: ['PDF'],
    },
    {
      id: 2,
      name: 'Working Time Regulations (UK)',
      description: '48-hour work week compliance check',
      format: ['PDF'],
    },
    {
      id: 3,
      name: 'India Labor Law Report',
      description: 'PF, ESI, Gratuity compliance summary',
      format: ['PDF'],
    },
    {
      id: 4,
      name: 'Document Expiry Alert',
      description: 'Visa, passport, work permit expiring soon',
      format: ['PDF', 'Excel'],
    },
  ]

  const getCurrentReports = () => {
    switch (activeCategory) {
      case 'attendance':
        return attendanceReports
      case 'payroll':
        return payrollReports
      case 'compliance':
        return complianceReports
      default:
        return []
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#F7F8FA]">
      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Categories */}
          <div className="w-64 border-r border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-bold uppercase text-slate-500">Report Categories</h3>
            <div className="space-y-1">
              {reportCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                    activeCategory === category.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <category.icon className="h-4 w-4 shrink-0" />
                  <span>{category.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Reports List */}
          <div className="flex-1 overflow-y-auto p-6">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {getCurrentReports().map((report) => (
                <div
                  key={report.id}
                  className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900">{report.name}</h3>
                      <p className="mt-1 text-sm text-slate-600">{report.description}</p>

                      {/* Date Filters */}
                      <div className="mt-4 flex gap-3">
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-slate-700">
                            From Date
                          </label>
                          <input
                            type="date"
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-slate-700">
                            To Date
                          </label>
                          <input
                            type="date"
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Export Buttons */}
                    <div className="ml-4 flex shrink-0 gap-2">
                      {report.format.map((format) => (
                        <button
                          key={format}
                          className="rounded-lg border-2 border-green-600 bg-white px-4 py-2 text-sm font-semibold text-green-600 transition hover:bg-green-600 hover:text-white"
                        >
                          <Download className="h-4 w-4" /> Export {format}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {activeCategory === 'leave' && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <div className="text-sm text-blue-900">
                    Leave reports coming soon: Balance summary, Usage trends, Approval analytics
                  </div>
                </div>
              )}

              {activeCategory === 'recruitment' && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <div className="text-sm text-blue-900">
                    Recruitment reports coming soon: Hiring funnel, Time-to-hire, Source effectiveness
                  </div>
                </div>
              )}
            </motion.div>
          </div>
      </div>
    </div>
  )
})

ReportsPage.displayName = 'ReportsPage'

export default ReportsPage
