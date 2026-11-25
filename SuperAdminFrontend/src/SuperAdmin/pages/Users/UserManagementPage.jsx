import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  Users, Search, Filter, Eye, Edit, Trash2, Play, Pause,
  Download, RefreshCw, UserPlus, Building2, Mail, Phone
} from 'lucide-react'
import SuperAdminTopBar from '../../components/TopBar'
import superAdminService from '../../../services/superAdminService'

export default function UserManagementPage() {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await superAdminService.getUsers()
      setUsers(Array.isArray(data) ? data : (data?.users || []))
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.tenant_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesStatus && matchesRole
  })

  const handleSuspend = async (userId) => {
    if (window.confirm('Are you sure you want to suspend this user?')) {
      try {
        await superAdminService.suspendUser(userId, 'Suspended by admin')
        fetchUsers()
      } catch (error) {
        console.error('Failed to suspend user:', error)
      }
    }
  }

  const handleActivate = async (userId) => {
    try {
      await superAdminService.activateUser(userId)
      fetchUsers()
    } catch (error) {
      console.error('Failed to activate user:', error)
    }
  }

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await superAdminService.deleteUser(userId)
        fetchUsers()
      } catch (error) {
        console.error('Failed to delete user:', error)
      }
    }
  }

  const handleExportUsers = () => {
    const listToExport = filteredUsers.length > 0 ? filteredUsers : users
    if (listToExport.length === 0) {
      alert('No users available to export')
      return
    }
    const headers = ['ID', 'Name', 'Email', 'Role', 'Tenant', 'Status', 'Created At']
    const rows = listToExport.map(u => [
      u.id || '',
      u.name || '',
      u.email || '',
      u.role || '',
      u.tenant_name || '',
      u.status || '',
      u.created_at || ''
    ])
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `platform_users_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-[#f0f5ff]">
      <SuperAdminTopBar />
      
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
            <p className="text-sm text-slate-500 mt-1">Manage all platform users across tenants</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchUsers}
              className="flex items-center gap-2 px-4 py-2 border border-[#dce9ff] bg-white rounded-lg hover:bg-[#f0f5ff] transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button
              onClick={handleExportUsers}
              className="flex items-center gap-2 px-4 py-2 border border-[#dce9ff] bg-white rounded-lg hover:bg-[#f0f5ff] transition-colors cursor-pointer"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-[#dce9ff] p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search users, emails, or organizations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#dce9ff] rounded-lg focus:ring-2 focus:ring-[#1251C5] focus:border-transparent outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-[#dce9ff] rounded-lg focus:ring-2 focus:ring-[#1251C5] focus:border-transparent outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-[#dce9ff] rounded-lg focus:ring-2 focus:ring-[#1251C5] focus:border-transparent outline-none"
              >
                <option value="all">All Roles</option>
                <option value="tenant_admin">Tenant Admin</option>
                <option value="hr_admin">HR Admin</option>
                <option value="manager">Manager</option>
                <option value="employee">Employee</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl border border-[#dce9ff] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f8faff] border-b border-[#dce9ff]">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">User</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Contact</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Organization</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Role</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Last Login</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1251C5]"></div>
                        <span className="ml-2 text-slate-500">Loading users...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user.id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-[#f0f5ff] hover:bg-[#f8faff] transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-gradient-to-br from-[#1251C5] to-[#4f9cf9] rounded-full flex items-center justify-center text-white font-semibold">
                            {user.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{user.name || 'Unknown User'}</p>
                            <p className="text-sm text-slate-500">{user.id || 'No ID'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3 text-slate-400" />
                            <span className="text-sm text-slate-900">{user.email || 'No email'}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3 text-slate-400" />
                              <span className="text-sm text-slate-500">{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-slate-400" />
                          <div>
                            <p className="text-sm font-medium text-slate-900">{user.tenant_name || 'No Organization'}</p>
                            <p className="text-xs text-slate-500">{user.tenant_id || 'No ID'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'tenant_admin' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'hr_admin' ? 'bg-orange-100 text-orange-800' :
                          user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role?.replace('_', ' ') || 'No Role'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.status === 'active' ? 'bg-green-100 text-green-800' :
                          user.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                          user.status === 'suspended' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-500">
                        {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats Footer */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-[#dce9ff] p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[#1251C5]" />
              <span className="text-sm font-medium text-slate-600">Total Users</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-1">{users.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-[#dce9ff] p-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-slate-600">Active</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {users.filter(u => u.status === 'active').length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-[#dce9ff] p-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm font-medium text-slate-600">Inactive</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {users.filter(u => u.status === 'inactive').length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-[#dce9ff] p-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-red-500 rounded-full"></div>
              <span className="text-sm font-medium text-slate-600">Suspended</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {users.filter(u => u.status === 'suspended').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}