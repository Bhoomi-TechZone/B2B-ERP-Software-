import { useState } from 'react'
import { Rocket, CheckCircle, Clock, AlertCircle, Users, Calendar, ArrowRight } from 'lucide-react'

const STAGES = [
  { id: 1, name: 'Kickoff', color: 'blue', icon: Rocket },
  { id: 2, name: 'Setup', color: 'purple', icon: Clock },
  { id: 3, name: 'Data Migration', color: 'yellow', icon: AlertCircle },
  { id: 4, name: 'Training', color: 'green', icon: Users },
  { id: 5, name: 'UAT', color: 'orange', icon: CheckCircle },
  { id: 6, name: 'Go-Live', color: 'emerald', icon: Rocket },
  { id: 7, name: 'Hypercare', color: 'slate', icon: Calendar },
]

const OnboardingPipelinePage = () => {
  const [clients, setClients] = useState([
    {
      id: '1',
      company: 'TechCorp India',
      plan: 'Business',
      employees: 150,
      stage: 3,
      startDate: '2026-05-08',
      expectedGoLive: '2026-06-15',
      specialist: 'Amit Singh',
      csm: 'Priya Kumar',
      progress: 45,
    },
    {
      id: '2',
      company: 'Global HR Solutions',
      plan: 'Growth',
      employees: 75,
      stage: 5,
      startDate: '2026-04-20',
      expectedGoLive: '2026-05-25',
      specialist: 'Raj Malhotra',
      csm: 'Neha Patel',
      progress: 78,
    },
  ])

  const getStageColor = (stageId) => {
    const stage = STAGES.find(s => s.id === stageId)
    return stage?.color || 'slate'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">15. Onboarding Pipeline</h1>
        <p className="mt-1 text-sm text-slate-600">
          7-stage client onboarding process
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Active Onboardings</p>
              <p className="text-2xl font-bold text-slate-900">23</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Completed (30d)</p>
              <p className="text-2xl font-bold text-slate-900">18</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-50 p-2">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Avg Duration</p>
              <p className="text-2xl font-bold text-slate-900">38d</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">At Risk</p>
              <p className="text-2xl font-bold text-slate-900">3</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Stages */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 font-semibold text-slate-900">Onboarding Stages</h3>
        <div className="flex items-center justify-between">
          {STAGES.map((stage, index) => {
            const Icon = stage.icon
            return (
              <div key={stage.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`rounded-lg bg-${stage.color}-50 p-3`}>
                    <Icon className={`h-5 w-5 text-${stage.color}-600`} />
                  </div>
                  <p className="mt-2 text-xs font-medium text-slate-700">{stage.name}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {index === 0 ? '5' : index === 1 ? '8' : index === 2 ? '4' : index === 3 ? '3' : index === 4 ? '2' : index === 5 ? '1' : '0'} clients
                  </p>
                </div>
                {index < STAGES.length - 1 && (
                  <ArrowRight className="mx-2 h-4 w-4 text-slate-300" />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Active Onboardings */}
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900">Active Onboardings</h3>
        {clients.map((client) => {
          const currentStage = STAGES.find(s => s.id === client.stage)
          const StageIcon = currentStage?.icon || Clock
          
          return (
            <div
              key={client.id}
              className="rounded-xl border border-slate-200 bg-white p-6 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-slate-900">{client.company}</h3>
                    <span className={`rounded-full bg-${getStageColor(client.stage)}-100 px-2 py-1 text-xs font-medium text-${getStageColor(client.stage)}-700`}>
                      {currentStage?.name}
                    </span>
                  </div>

                  {/* Client Details */}
                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-xs font-medium text-slate-500">Plan</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{client.plan}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500">Employees</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{client.employees}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500">Start Date</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {new Date(client.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500">Expected Go-Live</p>
                      <p className="mt-1 text-sm font-semibold text-blue-600">
                        {new Date(client.expectedGoLive).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-slate-600">Overall Progress</span>
                      <span className="font-semibold text-slate-900">{client.progress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${client.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Team */}
                  <div className="mt-4 flex items-center gap-6 rounded-lg bg-slate-50 p-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-xs text-slate-500">Specialist</p>
                        <p className="text-sm font-medium text-slate-900">{client.specialist}</p>
                      </div>
                    </div>
                    <div className="h-8 w-px bg-slate-200" />
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-purple-600" />
                      <div>
                        <p className="text-xs text-slate-500">CSM</p>
                        <p className="text-sm font-medium text-slate-900">{client.csm}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                  View Details
                </button>
                <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Update Stage
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default OnboardingPipelinePage
