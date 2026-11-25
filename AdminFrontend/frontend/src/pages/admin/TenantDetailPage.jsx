import { useParams } from 'react-router-dom'

const TenantDetailPage = () => {
  const { id } = useParams()
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Tenant Details - {id}</h1>
      <p className="text-gray-600">Tenant detail content will be displayed here.</p>
    </div>
  )
}

export default TenantDetailPage
