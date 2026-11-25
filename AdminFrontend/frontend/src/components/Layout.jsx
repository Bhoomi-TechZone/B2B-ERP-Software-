import { memo } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../pages/dashboard/components/Sidebar'
import Header from './Header'

const Layout = memo(() => {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F8FA]">
      {/* Sidebar - Persistent across routes */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header - Fixed at top */}
        <Header />
        
        {/* Page Content - Scrollable */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
})

Layout.displayName = 'Layout'

export default Layout
