import { Database, Table, FileText, CheckSquare, Users, TrendingUp } from 'lucide-react'

const TABLES = [
  {
    name: 'client_onboardings',
    description: 'Main onboarding records',
    columns: ['id', 'tenant_id', 'stage', 'start_date', 'expected_go_live', 'actual_go_live', 'specialist_id', 'csm_id', 'status'],
    records: 156,
  },
  {
    name: 'onboarding_milestones',
    description: 'Stage completion tracking',
    columns: ['id', 'onboarding_id', 'stage', 'completed_at', 'completed_by', 'notes'],
    records: 892,
  },
  {
    name: 'onboarding_training_sessions',
    description: 'Training schedule and attendance',
    columns: ['id', 'onboarding_id', 'session_type', 'scheduled_at', 'duration_minutes', 'attendees', 'recording_url'],
    records: 423,
  },
  {
    name: 'onboarding_configurations',
    description: 'Client-specific setup configs',
    columns: ['id', 'onboarding_id', 'config_type', 'config_data', 'applied_at', 'applied_by'],
    records: 1247,
  },
  {
    name: 'onboarding_uat_results',
    description: 'User acceptance testing results',
    columns: ['id', 'onboarding_id', 'test_case', 'status', 'tested_by', 'tested_at', 'issues'],
    records: 678,
  },
  {
    name: 'client_health_scores',
    description: 'Post-onboarding health metrics',
    columns: ['id', 'tenant_id', 'score', 'calculated_at', 'factors', 'risk_level'],
    records: 156,
  },
]

const OnboardingTablesPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">15.2 Onboarding Data</h1>
        <p className="mt-1 text-sm text-slate-600">
          Onboarding data management tables
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2">
              <Database className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Tables</p>
              <p className="text-2xl font-bold text-slate-900">6</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2">
              <Table className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Records</p>
              <p className="text-2xl font-bold text-slate-900">3,552</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Active Clients</p>
              <p className="text-2xl font-bold text-slate-900">156</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-50 p-2">
              <TrendingUp className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Avg Health Score</p>
              <p className="text-2xl font-bold text-slate-900">87%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tables List */}
      <div className="space-y-4">
        {TABLES.map((table, index) => (
          <div
            key={table.name}
            className="rounded-xl border border-slate-200 bg-white p-6 hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-50 p-2">
                    <Table className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{table.name}</h3>
                    <p className="mt-1 text-sm text-slate-600">{table.description}</p>
                  </div>
                </div>

                {/* Columns */}
                <div className="mt-4">
                  <p className="mb-2 text-xs font-medium text-slate-500">Columns ({table.columns.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {table.columns.map((col) => (
                      <span
                        key={col}
                        className="inline-flex rounded-lg bg-slate-100 px-2 py-1 text-xs font-mono text-slate-700"
                      >
                        {col}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-4 flex items-center gap-4 rounded-lg bg-slate-50 p-3">
                  <div>
                    <p className="text-xs text-slate-500">Total Records</p>
                    <p className="mt-1 text-lg font-bold text-slate-900">{table.records.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
              <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                <FileText className="h-4 w-4" />
                View Schema
              </button>
              <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Query Data
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default OnboardingTablesPage
