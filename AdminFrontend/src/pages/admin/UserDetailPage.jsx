import { useParams } from 'react-router-dom'

const UserDetailPage = () => {
  const { id } = useParams()
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">User Details - {id}</h1>
      <p className="text-gray-600">User detail content will be displayed here.</p>
    </div>
  )
}

export default UserDetailPage
