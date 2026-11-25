import { Database, Table, FileText } from 'lucide-react'

const ProjectTablesPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">19.2 Project Data</h1>
        <p className="mt-1 text-sm text-slate-600">Project data structure</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2">
              <Database className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Tables</p>
              <p className="text-2xl font-bold text-slate-900">3</p>
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
              <p className="text-2xl font-bold text-slate-900">1,245</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Projects</p>
              <p className="text-2xl font-bold text-slate-900">234</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-50 p-2">
              <Table className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Milestones</p>
              <p className="text-2xl font-bold text-slate-900">567</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 font-semibold text-slate-900">Project Database Tables</h3>
        <p className="text-sm text-slate-600">Tables: projects, project_members, project_milestones</p>
      </div>
    </div>
  )
}

export default ProjectTablesPage
