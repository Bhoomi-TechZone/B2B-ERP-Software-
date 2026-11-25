import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowLeft, User, Mail, Building2, Calendar } from 'lucide-react'
import SuperAdminTopBar from '../../components/TopBar'
import superAdminService from '../../../services/superAdminService'

export default function UserDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser()
  }, [id])

  const fetchUser = async () => {
    try {
      setLoading(true)
      const data = await superAdminService.getUser(id)
      setUser(data)
    } catch (error) {
      console.error('Failed to fetch user:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f5ff]">
        <SuperAdminTopBar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1251C5]"></div>
          <span className="ml-3 text-slate-500">Loading user details...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f0f5ff]">
      <SuperAdminTopBar />
      
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/super-admin/users')}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">User Details</h1>
            <p className="text-sm text-slate-500 mt-1">View and manage user information</p>
          </div>
        </div>

        {user ? (
          <div className="bg-white rounded-xl border border-[#dce9ff] p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">User Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <p className="text-slate-900">{user.name || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <p className="text-slate-900">{user.email || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <p className="text-slate-900">{user.role || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.status === 'active' ? 'bg-green-100 text-green-800' :
                  user.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {user.status || 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#dce9ff] p-8 text-center">
            <p className="text-slate-500">User not found</p>
          </div>
        )}
      </div>
    </div>
  )
}