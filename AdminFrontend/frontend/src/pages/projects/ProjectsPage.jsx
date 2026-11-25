import { useState, memo } from 'react'
import { motion } from 'motion/react'

const ProjectsPage = memo(() => {
  const [activeView, setActiveView] = useState('board')

  const tasks = [
    {
      id: 1,
      title: 'Update employee onboarding flow',
      status: 'In Progress',
      priority: 'High',
      assignee: 'Rahul Sharma',
      dueDate: '2026-04-25',
      project: 'HR Automation',
    },
    {
      id: 2,
      title: 'Fix payroll calculation bug',
      status: 'In Progress',
      priority: 'Critical',
      assignee: 'Priya Singh',
      dueDate: '2026-04-22',
      project: 'Payroll System',
    },
    {
      id: 3,
      title: 'Design new dashboard widgets',
      status: 'Todo',
      priority: 'Medium',
      assignee: 'Amit Kumar',
      dueDate: '2026-04-30',
      project: 'UI Improvement',
    },
    {
      id: 4,
      title: 'Implement attendance geo-fence',
      status: 'Done',
      priority: 'High',
      assignee: 'Sneha Reddy',
      dueDate: '2026-04-18',
      project: 'Attendance',
    },
  ]

  const tasksByStatus = {
    'Todo': tasks.filter((t) => t.status === 'Todo'),
    'In Progress': tasks.filter((t) => t.status === 'In Progress'),
    'Done': tasks.filter((t) => t.status === 'Done'),
  }

  const priorityColors = {
    Critical: 'bg-red-600 text-white',
    High: 'bg-orange-600 text-white',
    Medium: 'bg-amber-600 text-white',
    Low: 'bg-blue-600 text-white',
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#F7F8FA]">
      {/* View Toggle */}
      <div className="border-b border-gray-200 bg-white px-6 py-3">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setActiveView('board')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              activeView === 'board'
                ? 'bg-blue-600 text-white'
                : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Board View
          </button>
          <button
            onClick={() => setActiveView('list')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              activeView === 'list'
                ? 'bg-blue-600 text-white'
                : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            List View
          </button>
          <button className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700">
            + New Task
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
          {activeView === 'board' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Stats */}
              <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="text-sm text-slate-600">Total Tasks</div>
                  <div className="mt-2 text-3xl font-bold text-slate-900">{tasks.length}</div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="text-sm text-slate-600">In Progress</div>
                  <div className="mt-2 text-3xl font-bold text-blue-600">
                    {tasksByStatus['In Progress'].length}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="text-sm text-slate-600">Completed</div>
                  <div className="mt-2 text-3xl font-bold text-green-600">
                    {tasksByStatus['Done'].length}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="text-sm text-slate-600">Overdue</div>
                  <div className="mt-2 text-3xl font-bold text-red-600">0</div>
                </div>
              </div>

              {/* Kanban Board */}
              <div className="grid gap-4 lg:grid-cols-3">
                {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
                  <div key={status}>
                    <div className="mb-3 flex items-center justify-between rounded-lg bg-white p-3 shadow-sm">
                      <div className="font-bold text-slate-900">{status}</div>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                        {statusTasks.length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {statusTasks.map((task) => (
                        <motion.div
                          key={task.id}
                          whileHover={{ scale: 1.02 }}
                          className="cursor-pointer rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                        >
                          <div className="mb-2 flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-semibold text-slate-900">{task.title}</div>
                              <div className="mt-1 text-xs text-slate-500">{task.project}</div>
                            </div>
                            <span
                              className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                                priorityColors[task.priority]
                              }`}
                            >
                              {task.priority}
                            </span>
                          </div>
                          <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                            <div>
                              <span className="font-semibold">Assignee:</span> {task.assignee}
                            </div>
                            <div>Due: {task.dueDate}</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeView === 'list' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-slate-200 bg-white shadow-sm"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                        Task
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                        Project
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                        Assignee
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                        Priority
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                        Due Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tasks.map((task) => (
                      <tr key={task.id} className="transition hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">{task.title}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">{task.project}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">{task.assignee}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                              task.status === 'Done'
                                ? 'bg-green-100 text-green-700'
                                : task.status === 'In Progress'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {task.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${priorityColors[task.priority]}`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">{task.dueDate}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                              View
                            </button>
                            <button className="text-sm font-medium text-slate-600 hover:text-slate-700">
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
      </div>
    </div>
  )
})

ProjectsPage.displayName = 'ProjectsPage'

export default ProjectsPage
