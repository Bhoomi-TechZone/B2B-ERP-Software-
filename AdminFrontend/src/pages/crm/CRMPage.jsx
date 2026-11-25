import { useLocation } from 'react-router-dom'
import LeadsPage from './LeadsPage'
import OpportunitiesModule from './components/OpportunitiesModule'
import DealsModule from './components/DealsModule'
import ClientsModule from './components/ClientsModule'
import DemoSchedule from './components/DemoSchedule'
const CRMPage = () => {
  const location = useLocation()
  const path = location.pathname

  // Render content based on URL path
  const renderContent = () => {
    // Leads section (with subsections handled by LeadsPage)
    if (path.startsWith('/crm/leads') || path === '/crm' || path.startsWith('/leads/management') || path.startsWith('/leads')) {
      return <LeadsPage />
    }

    // Main CRM sections
    if (path === '/crm/opportunities') {
      return <OpportunitiesModule />
    }

    if (path === '/crm/deals') {
      return <DealsModule />
    }

    if (path === '/crm/clients') {
      return <ClientsModule />
    }

    if (path === '/crm/demo-schedule') {
      return <DemoSchedule />
    }

    // Default fallback
    return <LeadsPage />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {renderContent()}
    </div>
  )
}

export default CRMPage
