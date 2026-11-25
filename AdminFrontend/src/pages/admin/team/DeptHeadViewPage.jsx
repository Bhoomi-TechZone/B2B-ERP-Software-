import { useState } from 'react'
import { Users, UserPlus, TrendingUp, AlertCircle, Search } from 'lucide-react'

const DeptHeadViewPage = () => {
  const [unassignedLeads] = useState([
    { id: '1', company: 'TechStart Inc', contact: 'John Doe', source: 'Website', priority: 'Hot', region: 'US' },
    { id: '2', company: 'Global Corp', contact: 'Jane Smith', source: 'Referral', priority: 'Warm', region: 'UK' },
    { id: '3', company: 'Innovate Ltd', contact: 'Mike Johnson', source: 'LinkedIn', priority: 'Cold', region: 'IN' },
  ])

  const [teamLeads] = useState([
    { id: '1', name: 'Priya Sharma', workload: 12, capacity: 15, performance: 92 },
    { id: '2', name: 'Vikram Reddy', workload: 14, capacity: 15, performance: 88 },
    { id: '3', name: 'Anjali Gupta', workload: 8, capacity: 15, performance: 95 },
  ])

  const getPriorityColor = (priority) => {
    const colors = {
      Hot: 'bg-red-100 text-red-700',
      Warm: 'bg-yellow-100 text-yellow-700',
      Cold: 'bg-blue-100 text-blue-700',
    }
    return colors[priority] || 'bg-slate-100 text-slate-700'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">17.1 Dept Head View</h1>
        <p className="mt-1 text-sm text-slate-600">
          Department head lead assignment
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Unassigned Leads</p>
              <p className="text-2xl font-bold text-slate-900">23</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Team Leads</p>
              <p className="text-2xl font-bold text-slate-900">8</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Avg Team Performance</p>
              <p className="text-2xl font-bold text-slate-900">91%</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-50 p-2">
              <UserPlus className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Assigned Today</p>
              <p className="text-2xl font-bold text-slate-900">12</p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Workload */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 font-semibold text-slate-900">Team Workload View</h3>
        <div className="space-y-4">
          {teamLeads.map((lead) => (
            <div key={lead.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">{lead.name}</h4>
                  <div className="mt-2 flex items-center gap-6">
                    <div>
                      <p className="text-xs text-slate-500">Workload</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {lead.workload} / {lead.capacity}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Performance</p>
                      <p className="text-sm font-semibold text-green-600">{lead.performance}%</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full ${
                          (lead.workload / lead.capacity) * 100 > 90
                            ? 'bg-red-500'
                            : (lead.workload / lead.capacity) * 100 > 70
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${(lead.workload / lead.capacity) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
                <button className="ml-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                  Assign Lead
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Unassigned Leads Queue */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Unassigned Leads Queue</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search leads..."
              className="rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="space-y-3">
          {unassignedLeads.map((lead) => (
            <div
              key={lead.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 p-4 hover:border-blue-300 transition-all"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-slate-900">{lead.company}</h4>
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${getPriorityColor(lead.priority)}`}>
                    {lead.priority}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-4 text-sm text-slate-600">
                  <span>Contact: {lead.contact}</span>
                  <span>•</span>
                  <span>Source: {lead.source}</span>
                  <span>•</span>
                  <span>Region: {lead.region}</span>
                </div>
              </div>
              <button className="ml-4 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                <UserPlus className="h-4 w-4" />
                Assign
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DeptHeadViewPage
