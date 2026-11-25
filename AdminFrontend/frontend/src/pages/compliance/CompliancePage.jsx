import { useState, memo } from 'react'
import { motion } from 'motion/react'
import { BarChart2, Scale, FileText, Search, PenLine, CheckCircle2, AlertTriangle, Clock, Siren } from 'lucide-react'

const CompliancePage = memo(() => {
  const [activeTab, setActiveTab] = useState('dashboard')

  const tabs = [
    { id: 'dashboard', label: 'Compliance Dashboard', icon: BarChart2 },
    { id: 'labor-laws', label: 'Labor Laws', icon: Scale },
    { id: 'documents', label: 'Document Management', icon: FileText },
    { id: 'audit', label: 'Audit Trail', icon: Search },
    { id: 'policies', label: 'Policy Acknowledgment', icon: PenLine },
  ]

  const complianceStats = [
    { label: 'Compliance Score', value: '94%', color: 'from-green-500 to-emerald-600', icon: CheckCircle2 },
    { label: 'Pending Actions', value: '7', color: 'from-orange-500 to-amber-600', icon: AlertTriangle },
    { label: 'Expiring Soon', value: '12', color: 'from-red-500 to-rose-600', icon: Clock },
    { label: 'Audits This Year', value: '3', color: 'from-blue-500 to-indigo-600', icon: Search },
  ]

  const laborLawCompliance = [
    {
      id: 1,
      region: 'India',
      law: 'PF & ESI Compliance',
      status: 'compliant',
      lastChecked: '2026-04-15',
      nextReview: '2026-05-15',
      details: 'All employees enrolled, contributions up to date',
    },
    {
      id: 2,
      region: 'India',
      law: 'Gratuity Act Compliance',
      status: 'compliant',
      lastChecked: '2026-04-10',
      nextReview: '2026-07-10',
      details: '18 employees eligible, funds allocated',
    },
    {
      id: 3,
      region: 'USA',
      law: 'FLSA - Fair Labor Standards Act',
      status: 'action-required',
      lastChecked: '2026-04-18',
      nextReview: '2026-04-25',
      details: '3 employees exceeded 40hrs/week without overtime pay',
    },
    {
      id: 4,
      region: 'UK',
      law: 'Working Time Regulations (WTR)',
      status: 'compliant',
      lastChecked: '2026-04-12',
      nextReview: '2026-05-12',
      details: 'All employees within 48hr/week limit',
    },
    {
      id: 5,
      region: 'EU',
      law: 'GDPR - Data Protection',
      status: 'action-required',
      lastChecked: '2026-04-14',
      nextReview: '2026-04-21',
      details: 'Privacy policy update required, 5 employees need consent refresh',
    },
  ]

  const expiringDocuments = [
    {
      id: 1,
      employee: 'Maria Gonzalez',
      docType: 'Work Permit (H1-B)',
      expiryDate: '2026-05-10',
      daysLeft: 20,
      priority: 'high',
    },
    {
      id: 2,
      employee: 'Ahmed Khan',
      docType: 'Passport',
      expiryDate: '2026-06-15',
      daysLeft: 56,
      priority: 'medium',
    },
    {
      id: 3,
      employee: 'Chen Wei',
      docType: 'Employment Contract',
      expiryDate: '2026-05-01',
      daysLeft: 11,
      priority: 'high',
    },
    {
      id: 4,
      employee: 'Sarah Johnson',
      docType: 'Background Verification',
      expiryDate: '2026-07-20',
      daysLeft: 91,
      priority: 'low',
    },
    {
      id: 5,
      employee: 'Raj Patel',
      docType: 'Professional Certification (PMP)',
      expiryDate: '2026-05-25',
      daysLeft: 35,
      priority: 'medium',
    },
  ]

  const auditLogs = [
    {
      id: 1,
      action: 'Document Access',
      user: 'Priya Singh (HR Manager)',
      resource: 'Employee Salary Records - March 2026',
      timestamp: '2026-04-20 14:35:22',
      ipAddress: '192.168.1.45',
    },
    {
      id: 2,
      action: 'Policy Updated',
      user: 'Admin User',
      resource: 'Leave Policy - Sick Leave',
      timestamp: '2026-04-20 11:20:15',
      ipAddress: '192.168.1.10',
    },
    {
      id: 3,
      action: 'Data Export',
      user: 'Deepak Gupta (Finance Head)',
      resource: 'Payroll Report - Q1 2026',
      timestamp: '2026-04-19 16:45:00',
      ipAddress: '192.168.1.28',
    },
    {
      id: 4,
      action: 'Employee Termination',
      user: 'HR Manager',
      resource: 'Employee ID: EMP-2048',
      timestamp: '2026-04-18 10:15:30',
      ipAddress: '192.168.1.45',
    },
  ]

  const policyAcknowledgments = [
    {
      id: 1,
      policy: 'Code of Conduct 2026',
      totalEmployees: 248,
      acknowledged: 236,
      pending: 12,
      deadline: '2026-05-01',
    },
    {
      id: 2,
      policy: 'Data Privacy & GDPR Policy',
      totalEmployees: 248,
      acknowledged: 244,
      pending: 4,
      deadline: '2026-04-30',
    },
    {
      id: 3,
      policy: 'Anti-Harassment Policy',
      totalEmployees: 248,
      acknowledged: 248,
      pending: 0,
      deadline: '2026-04-15',
    },
    {
      id: 4,
      policy: 'Remote Work Policy',
      totalEmployees: 248,
      acknowledged: 220,
      pending: 28,
      deadline: '2026-05-10',
    },
  ]

  return (
    <div className="h-full overflow-y-auto bg-[#F7F8FA] p-6">
      {/* Stats Cards */}
      <div className="mb-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {complianceStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-linear-to-br ${stat.color} shadow-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                  <div className="text-xs text-slate-600">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 bg-white px-6">
          <div className="flex gap-0 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

      {/* Content */}
      <div className="p-6">
          {activeTab === 'dashboard' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-bold text-slate-900">Compliance Overview</h3>

              {/* Critical Alerts */}
              <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <Siren className="h-6 w-6 text-red-600 shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-bold text-red-900">Critical Compliance Issues</h4>
                    <ul className="mt-2 space-y-1 text-sm text-red-800">
                      <li>• 3 USA employees exceeded FLSA overtime limits (Action required)</li>
                      <li>• 5 EU employees need GDPR consent refresh (Deadline: Apr 21)</li>
                      <li>• 2 work permits expiring in 20 days (Immediate renewal needed)</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Documents Expiring Soon */}
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <h4 className="mb-4 text-base font-bold text-slate-900">
                  Documents Expiring Soon (Next 90 Days)
                </h4>
                <div className="space-y-3">
                  {expiringDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className={`flex items-center justify-between rounded-lg p-3 ${
                        doc.priority === 'high'
                          ? 'bg-red-50'
                          : doc.priority === 'medium'
                            ? 'bg-orange-50'
                            : 'bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full">
                          {doc.priority === 'high' ? <span className="h-3 w-3 rounded-full bg-red-500 block" /> : doc.priority === 'medium' ? <span className="h-3 w-3 rounded-full bg-amber-400 block" /> : <span className="h-3 w-3 rounded-full bg-green-500 block" />}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{doc.employee}</div>
                          <div className="text-sm text-slate-600">{doc.docType}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900">
                          {doc.daysLeft} days left
                        </div>
                        <div className="text-xs text-slate-600">Expires: {doc.expiryDate}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'labor-laws' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-bold text-slate-900">
                Labor Law & Regulatory Compliance
              </h3>

              <div className="space-y-4">
                {laborLawCompliance.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="text-lg font-bold text-slate-900">{item.law}</h4>
                          {item.status === 'compliant' && (
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Compliant
                            </span>
                          )}
                          {item.status === 'action-required' && (
                            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" /> Action Required
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-sm font-semibold text-slate-600">
                          Region: {item.region}
                        </div>
                        <div className="mt-3 text-sm text-slate-700">{item.details}</div>
                        <div className="mt-3 flex gap-4 text-xs text-slate-600">
                          <span>Last Checked: {item.lastChecked}</span>
                          <span>•</span>
                          <span>Next Review: {item.nextReview}</span>
                        </div>
                      </div>
                      <button className="ml-4 text-sm font-medium text-blue-600 hover:text-blue-700">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'documents' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Document Management</h3>
                <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
                  + Upload Document
                </button>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                <table className="w-full">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                        Employee
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                        Document Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                        Expiry Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {expiringDocuments.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-semibold text-slate-900">{doc.employee}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">{doc.docType}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">{doc.expiryDate}</td>
                        <td className="px-4 py-3">
                          {doc.priority === 'high' && (
                            <span className="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
                              Urgent
                            </span>
                          )}
                          {doc.priority === 'medium' && (
                            <span className="inline-flex rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-700">
                              Expiring Soon
                            </span>
                          )}
                          {doc.priority === 'low' && (
                            <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                            Renew
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'audit' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Audit Trail</h3>
                <div className="flex gap-2">
                  <input
                    type="date"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                  <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
                    Export Logs
                  </button>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                <table className="w-full">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                        Timestamp
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                        User
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                        Action
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                        Resource
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                        IP Address
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm text-slate-700">{log.timestamp}</td>
                        <td className="px-4 py-3 font-semibold text-slate-900">{log.user}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">{log.resource}</td>
                        <td className="px-4 py-3 text-xs text-slate-600">{log.ipAddress}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'policies' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Policy Acknowledgment Tracking</h3>
                <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
                  + Create Policy
                </button>
              </div>

              <div className="space-y-4">
                {policyAcknowledgments.map((policy) => (
                  <div
                    key={policy.id}
                    className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-slate-900">{policy.policy}</h4>
                        <div className="mt-2 text-sm text-slate-600">
                          Deadline: {policy.deadline}
                        </div>

                        <div className="mt-4">
                          <div className="mb-2 flex items-center justify-between text-sm">
                            <span className="font-semibold text-slate-700">
                              Acknowledgment Progress
                            </span>
                            <span className="font-bold text-slate-900">
                              {policy.acknowledged}/{policy.totalEmployees} employees (
                              {Math.round((policy.acknowledged / policy.totalEmployees) * 100)}%)
                            </span>
                          </div>
                          <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{
                                width: `${(policy.acknowledged / policy.totalEmployees) * 100}%`,
                              }}
                              transition={{ duration: 0.5 }}
                              className={`h-full rounded-full ${
                                policy.pending === 0 ? 'bg-green-500' : 'bg-blue-500'
                              }`}
                            />
                          </div>
                        </div>

                        {policy.pending > 0 && (
                          <div className="mt-3 rounded-lg bg-orange-50 p-2">
                            <span className="text-xs font-semibold text-orange-800 flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" /> {policy.pending} employees pending acknowledgment
                            </span>
                          </div>
                        )}
                      </div>

                      <button className="ml-4 text-sm font-medium text-blue-600 hover:text-blue-700">
                        Send Reminder
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
      </div>
    </div>
  )
})

CompliancePage.displayName = 'CompliancePage'

export default CompliancePage
