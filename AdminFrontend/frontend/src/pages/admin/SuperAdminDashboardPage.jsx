import { Users, Building2, CreditCard, TrendingUp, Package, Activity } from 'lucide-react'

const SuperAdminDashboardPage = () => {
  const stats = [
    { label: 'Total Tenants', value: '24', icon: Building2, color: 'bg-blue-500', change: '+12%' },
    { label: 'Active Users', value: '1,248', icon: Users, color: 'bg-green-500', change: '+8%' },
    { label: 'Revenue (MRR)', value: '$45.2K', icon: CreditCard, color: 'bg-purple-500', change: '+23%' },
    { label: 'Active Plans', value: '8', icon: Package, color: 'bg-orange-500', change: '+2' },
  ]

  const recentTenants = [
    { name: 'Acme Corp', users: 45, plan: 'Enterprise', status: 'Active', date: '2026-05-10' },
    { name: 'TechStart Inc', users: 12, plan: 'Professional', status: 'Active', date: '2026-05-09' },
    { name: 'Global Solutions', users: 78, plan: 'Enterprise', status: 'Active', date: '2026-05-08' },
    { name: 'Digital Agency', users: 23, plan: 'Business', status: 'Trial', date: '2026-05-07' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Platform overview and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm font-semibold text-green-600">{stat.change}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
            </div>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tenants */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Recent Tenants</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {recentTenants.map((tenant, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{tenant.name}</h3>
                  <p className="text-sm text-gray-600">{tenant.users} users • {tenant.plan}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                    tenant.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {tenant.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{tenant.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">System Health</h2>
            <Activity className="h-5 w-5 text-green-500" />
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">API Response Time</span>
                <span className="text-sm font-semibold text-green-600">125ms</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Database Load</span>
                <span className="text-sm font-semibold text-blue-600">45%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Server Uptime</span>
                <span className="text-sm font-semibold text-green-600">99.9%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '99%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Storage Used</span>
                <span className="text-sm font-semibold text-orange-600">67%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: '67%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <Building2 className="h-8 w-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Add Tenant</span>
          </button>
          <button className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <Users className="h-8 w-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Manage Users</span>
          </button>
          <button className="flex flex-col items-center justify-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <Package className="h-8 w-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">View Plans</span>
          </button>
          <button className="flex flex-col items-center justify-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
            <TrendingUp className="h-8 w-8 text-orange-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Analytics</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default SuperAdminDashboardPage
