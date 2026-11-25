import { Briefcase, Users, UserCheck, Shield } from 'lucide-react'

const ClientTeamAssignmentPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">18. Client Team Assignment</h1>
        <p className="mt-1 text-sm text-slate-600">Post-sale account team setup</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2">
              <Briefcase className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Active Clients</p>
              <p className="text-2xl font-bold text-slate-900">189</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">CSMs</p>
              <p className="text-2xl font-bold text-slate-900">12</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2">
              <UserCheck className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Onboarding Specialists</p>
              <p className="text-2xl font-bold text-slate-900">8</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-50 p-2">
              <Shield className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Support Leads</p>
              <p className="text-2xl font-bold text-slate-900">6</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 font-semibold text-slate-900">Client Team Assignment</h3>
        <p className="text-sm text-slate-600">Assign Primary CSM, Secondary CSM, Onboarding Specialist, Technical Support Lead, and Account Executive to each client.</p>
      </div>
    </div>
  )
}

export default ClientTeamAssignmentPage
