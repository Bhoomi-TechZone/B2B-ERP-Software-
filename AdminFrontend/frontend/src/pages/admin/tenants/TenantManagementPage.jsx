// TenantManagementPage.jsx

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  Search,
  RefreshCw,
  Eye,
  Download,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

import SuperAdminTopBar from '../../components/TopBar'
import superAdminService from '../../../services/superAdminService'

const STATUS_OPTIONS = ['active', 'trial', 'suspended', 'past_due', 'cancelled']
const REGION_OPTIONS = ['US', 'UK', 'EU', 'IN', 'AU', 'CA', 'SG']
const BILLING_CYCLE_OPTIONS = ['monthly', 'yearly']

const STATUS_COLORS = {
  active: 'bg-emerald-100 text-emerald-700',
  trial: 'bg-amber-100 text-amber-700',
  suspended: 'bg-red-100 text-red-700',
  past_due: 'bg-orange-100 text-orange-700',
  cancelled: 'bg-slate-100 text-slate-600',
}

export default function TenantManagementPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [tenants, setTenants] = useState([])
  const [search, setSearch] = useState('')
  const [selectedTenants, setSelectedTenants] = useState(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [showFilters, setShowFilters] = useState(false)
  
  // Filter states
  const [filters, setFilters] = useState({
    status: 'all',
    region: 'all',
    plan: 'all',
    billingCycle: 'all',
  })

  const fetchTenants = async () => {
    try {
      setLoading(true)

      const response = await superAdminService.getTenants()

      console.log('Tenants Response:', response)

      setTenants(response?.tenants || response || [])
    } catch (error) {
      console.error(error)

      alert('Failed to load tenants')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTenants()
  }, [])

  const handleViewTenant = (tenantId) => {
    navigate(`/super-admin/tenants/${tenantId}`)
  }

  const handleSelectTenant = (tenantId) => {
    const newSelected = new Set(selectedTenants)
    if (newSelected.has(tenantId)) {
      newSelected.delete(tenantId)
    } else {
      newSelected.add(tenantId)
    }
    setSelectedTenants(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedTenants.size === filteredTenants.length) {
      setSelectedTenants(new Set())
    } else {
      const allIds = new Set(filteredTenants.map(t => t.id))
      setSelectedTenants(allIds)
    }
  }

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }))
    setCurrentPage(1)
  }

  const handleExport = async () => {
    try {
      // Show loading state
      const exportBtn = event.target.closest('button')
      const originalText = exportBtn.textContent
      exportBtn.textContent = 'Exporting...'
      exportBtn.disabled = true

      // Fetch complete data for each tenant
      const completeTenantsData = await Promise.all(
        filteredTenants.map(async (tenant) => {
          try {
            const fullData = await superAdminService.getTenant(tenant.id)
            console.log(`✅ Full tenant data for ${tenant.id}:`, fullData)
            return fullData || tenant
          } catch (error) {
            console.warn(`Failed to fetch full data for tenant ${tenant.id}:`, error)
            return tenant
          }
        })
      )

      console.log('📊 Complete tenants data before export:', completeTenantsData)

      const dataToExport = completeTenantsData.map(tenant => {
        const row = {
          'Tenant ID': tenant.id || '',
          'Tenant Name': tenant.name || '',
          'Slug': tenant.slug || '',
          'Subdomain': tenant.subdomain || '',
          'Status': tenant.status || '',
          'Region': tenant.primary_region || '',
          'Currency': tenant.primary_currency || '',
          'Billing Cycle': tenant.billing_cycle || '',
          'Admin Email': tenant.admin_email || '',
          'Admin Name': tenant.admin_name || '',
          'Logo URL': tenant.logo_url || '',
          'Brand Color': tenant.brand_color || '',
          'Timezone': tenant.timezone || '',
          'Date Format': tenant.date_format || '',
          'Created At': tenant.created_at ? new Date(tenant.created_at).toLocaleString() : '',
          'Updated At': tenant.updated_at ? new Date(tenant.updated_at).toLocaleString() : '',
        }
        console.log('Row data:', row)
        return row
      })

      console.log('📋 Data to export:', dataToExport)

      if (dataToExport.length === 0) {
        alert('No data to export')
        return
      }

      const headers = Object.keys(dataToExport[0])
      console.log('📝 CSV Headers:', headers)
      
      const csv = [
        headers.join(','),
        ...dataToExport.map(row => 
          headers.map(header => {
            const value = row[header]
            // Escape quotes and wrap in quotes if contains comma or quotes
            const escaped = String(value).replace(/"/g, '""')
            return escaped.includes(',') || escaped.includes('"') ? `"${escaped}"` : escaped
          }).join(',')
        )
      ].join('\n')

      console.log('📄 CSV Content:', csv)

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `tenants-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)

      // Restore button state
      exportBtn.textContent = originalText
      exportBtn.disabled = false
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export data: ' + error.message)
    }
  }

  const handleBulkAction = (action) => {
    if (selectedTenants.size === 0) {
      alert('Please select at least one tenant')
      return
    }

    const selectedIds = Array.from(selectedTenants)
    console.log(`Performing ${action} on tenants:`, selectedIds)
    
    // TODO: Implement bulk actions (activate, suspend, delete, etc.)
    alert(`${action} action on ${selectedIds.length} tenant(s)`)
  }

  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch = 
      tenant.name?.toLowerCase().includes(search.toLowerCase()) ||
      tenant.slug?.toLowerCase().includes(search.toLowerCase()) ||
      tenant.admin_email?.toLowerCase().includes(search.toLowerCase())

    const matchesStatus = filters.status === 'all' || tenant.status === filters.status
    const matchesRegion = filters.region === 'all' || tenant.primary_region === filters.region
    const matchesBillingCycle = filters.billingCycle === 'all' || tenant.billing_cycle === filters.billingCycle

    return matchesSearch && matchesStatus && matchesRegion && matchesBillingCycle
  })

  // Pagination
  const totalPages = Math.ceil(filteredTenants.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTenants = filteredTenants.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="min-h-screen bg-[#f0f5ff]">
      <SuperAdminTopBar />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Tenant Management
            </h1>

            <p className="text-sm text-slate-500">
              Manage all tenants ({filteredTenants.length} total)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchTenants}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-[#dce9ff] rounded-lg hover:bg-[#f0f5ff] transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-[#dce9ff] rounded-lg hover:bg-[#f0f5ff] transition-colors"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white border border-[#dce9ff] rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, slug, or email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-10 pr-4 py-2 border border-[#dce9ff] rounded-lg outline-none focus:ring-2 focus:ring-[#1251C5]"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-[#dce9ff] rounded-lg hover:bg-[#f0f5ff] transition-colors"
            >
              <Filter className="h-4 w-4" />
              Filters
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-[#dce9ff]"
            >
              {/* Status Filter */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-[#dce9ff] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1251C5]"
                >
                  <option value="all">All Status</option>
                  {STATUS_OPTIONS.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Region Filter */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Region</label>
                <select
                  value={filters.region}
                  onChange={(e) => handleFilterChange('region', e.target.value)}
                  className="w-full px-3 py-2 border border-[#dce9ff] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1251C5]"
                >
                  <option value="all">All Regions</option>
                  {REGION_OPTIONS.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>

              {/* Billing Cycle Filter */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Billing Cycle</label>
                <select
                  value={filters.billingCycle}
                  onChange={(e) => handleFilterChange('billingCycle', e.target.value)}
                  className="w-full px-3 py-2 border border-[#dce9ff] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1251C5]"
                >
                  <option value="all">All Cycles</option>
                  {BILLING_CYCLE_OPTIONS.map(cycle => (
                    <option key={cycle} value={cycle}>
                      {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilters({ status: 'all', region: 'all', plan: 'all', billingCycle: 'all' })
                    setCurrentPage(1)
                  }}
                  className="w-full px-3 py-2 border border-[#dce9ff] rounded-lg text-sm font-medium text-slate-600 hover:bg-[#f0f5ff] transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedTenants.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center justify-between"
          >
            <span className="text-sm font-semibold text-blue-900">
              {selectedTenants.size} tenant{selectedTenants.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkAction('activate')}
                className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-200 transition-colors"
              >
                Activate
              </button>
              <button
                onClick={() => handleBulkAction('suspend')}
                className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-200 transition-colors"
              >
                Suspend
              </button>
              <button
                onClick={() => handleBulkAction('export')}
                className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
              >
                Export
              </button>
            </div>
          </motion.div>
        )}

        {/* Table */}
        <div className="bg-white border border-[#dce9ff] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f8faff] border-b border-[#dce9ff]">
                <tr>
                  <th className="text-left py-3 px-4 w-12">
                    <input
                      type="checkbox"
                      checked={selectedTenants.size === paginatedTenants.length && paginatedTenants.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-[#dce9ff]"
                    />
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Slug</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Region</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Billing</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-10">
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-5 w-5 border-2 border-slate-200 border-t-[#1251C5] rounded-full animate-spin" />
                        <span className="text-slate-500">Loading tenants...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedTenants.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-10 text-slate-500">
                      No tenants found
                    </td>
                  </tr>
                ) : (
                  paginatedTenants.map((tenant, index) => (
                    <motion.tr
                      key={tenant.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-[#f0f5ff] hover:bg-[#f8faff]"
                    >
                      <td className="py-4 px-4">
                        <input
                          type="checkbox"
                          checked={selectedTenants.has(tenant.id)}
                          onChange={() => handleSelectTenant(tenant.id)}
                          className="rounded border-[#dce9ff]"
                        />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-[#1251C5] text-white flex items-center justify-center font-bold">
                            {tenant.name?.charAt(0)}
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900">
                              {tenant.name}
                            </p>

                            <p className="text-xs text-slate-500">
                              {tenant.admin_email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-sm text-slate-600">
                        {tenant.slug}
                      </td>

                      <td className="py-4 px-4 text-sm text-slate-600">
                        {tenant.primary_region}
                      </td>

                      <td className="py-4 px-4 text-sm text-slate-600">
                        {tenant.billing_cycle}
                      </td>

                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[tenant.status] || 'bg-slate-100 text-slate-600'}`}>
                          {tenant.status?.charAt(0).toUpperCase() + tenant.status?.slice(1)}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleViewTenant(tenant.id)}
                          className="p-2 hover:bg-[#f0f5ff] rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4 text-[#1251C5]" />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-slate-600">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTenants.length)} of {filteredTenants.length} tenants
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-[#dce9ff] rounded-lg hover:bg-[#f0f5ff] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-[#1251C5] text-white'
                      : 'border border-[#dce9ff] hover:bg-[#f0f5ff]'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-[#dce9ff] rounded-lg hover:bg-[#f0f5ff] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}