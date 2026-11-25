import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowLeft, Save, Building2 } from 'lucide-react'
import SuperAdminTopBar from '../TopBar'
import superAdminService from '../../../services/superAdminService'

export default function CreateTenantModal() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    plan: 'starter',
    admin_name: '',
    admin_email: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await superAdminService.createTenant(formData)
      navigate('/super-admin/tenants')
    } catch (error) {
      setError(error.message || 'Failed to create tenant')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-[#f0f5ff]">
      <SuperAdminTopBar />
      
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/super-admin/tenants')}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Create New Tenant</h1>
            <p className="text-sm text-slate-500 mt-1">Add a new organization to the platform</p>
          </div>
        </div>

        <div className="max-w-2xl">
          <div className="bg-white rounded-xl border border-[#dce9ff] p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Organization Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Organization Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[#dce9ff] rounded-lg focus:ring-2 focus:ring-[#1251C5] focus:border-transparent outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[#dce9ff] rounded-lg focus:ring-2 focus:ring-[#1251C5] focus:border-transparent outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[#dce9ff] rounded-lg focus:ring-2 focus:ring-[#1251C5] focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Plan *
                    </label>
                    <select
                      name="plan"
                      value={formData.plan}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[#dce9ff] rounded-lg focus:ring-2 focus:ring-[#1251C5] focus:border-transparent outline-none"
                      required
                    >
                      <option value="starter">Starter</option>
                      <option value="business">Business</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Admin User</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Admin Name *
                    </label>
                    <input
                      type="text"
                      name="admin_name"
                      value={formData.admin_name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[#dce9ff] rounded-lg focus:ring-2 focus:ring-[#1251C5] focus:border-transparent outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Admin Email *
                    </label>
                    <input
                      type="email"
                      name="admin_email"
                      value={formData.admin_email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[#dce9ff] rounded-lg focus:ring-2 focus:ring-[#1251C5] focus:border-transparent outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-[#1251C5] text-white rounded-lg hover:bg-[#0d3d9e] transition-colors disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {loading ? 'Creating...' : 'Create Tenant'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/super-admin/tenants')}
                  className="px-6 py-2 border border-[#dce9ff] text-slate-600 rounded-lg hover:bg-[#f0f5ff] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}