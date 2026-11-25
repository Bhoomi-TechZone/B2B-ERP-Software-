import { memo } from 'react'
import { Outlet } from 'react-router-dom'

const ProjectsLayout = memo(() => {
  return (
    <div className="flex h-full flex-col bg-slate-50/60">
      {/* Page content */}
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  )
})

ProjectsLayout.displayName = 'ProjectsLayout'
export default ProjectsLayout
