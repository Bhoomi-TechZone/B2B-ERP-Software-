import { FolderKanban, Calendar, Users, TrendingUp } from 'lucide-react'

const ProjectsListPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">19.1 Projects List</h1>
        <p className="mt-1 text-sm text-slate-600">Project management</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2">
              <FolderKanban className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Active Projects</p>
              <p className="text-2xl font-bold text-slate-900">34</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">On Track</p>
              <p className="text-2xl font-bold text-slate-900">28</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-50 p-2">
              <TrendingUp className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">At Risk</p>
              <p className="text-2xl font-bold text-slate-900">4</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Team Members</p>
              <p className="text-2xl font-bold text-slate-900">156</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 font-semibold text-slate-900">Projects Management</h3>
        <p className="text-sm text-slate-600">Manage projects with details like Project Name, Type, Client/Tenant, Project Lead, Department, Team Members, Start/End Date, Status, Priority, Budget, Description, and Tags.</p>
      </div>
    </div>
  )
}

export default ProjectsListPage
