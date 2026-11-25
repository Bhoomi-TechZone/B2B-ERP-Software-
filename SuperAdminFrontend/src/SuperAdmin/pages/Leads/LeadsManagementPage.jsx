import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  Users, Search, Filter, Eye, Edit, Trash2, Mail, Phone,
  Calendar, RefreshCw, Download, UserPlus, Building2
} from 'lucide-react'
import SuperAdminTopBar from '../../components/TopBar'
import superAdminService from '../../../services/superAdminService'

export default function LeadsManagementPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialStatus = searchParams.get('status') || 'all'

  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState(initialStatus)

  useEffect(() => {
    const qStatus = searchParams.get('status')
    if (qStatus && qStatus !== statusFilter) {
      setStatusFilter(qStatus)
    }
  }, [searchParams])

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    try {
      setLoading(true)
      const data = await superAdminService.getLeads()
      setLeads(Array.isArray(data) ? data : (data?.leads || []))
    } catch (error) {
      console.error('Failed to fetch leads:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleDelete = async (leadId) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await superAdminService.deleteLead(leadId)
        fetchLeads()
      } catch (error) {
        console.error('Failed to delete lead:', error)
      }
    }
  }

  const handleUpdateStatus = async (leadId, newStatus) => {
    try {
      await superAdminService.updateLead(leadId, { status: newStatus })
      fetchLeads()
    } catch (error) {
      console.error('Failed to update lead status:', error)
    }
  }

  const handleExportLeads = () => {
    const listToExport = filteredLeads.length > 0 ? filteredLeads : leads
    if (listToExport.length === 0) {
      alert('No leads available to export')
      return
    }
    const headers = ['ID', 'Company Name', 'Contact Name', 'Email', 'Phone', 'Plan', 'Region', 'Status', 'Created At']
    const rows = listToExport.map(l => [
      l.id || '',
      l.company_name || '',
      l.contact_name || '',
      l.email || '',
      l.phone || '',
      l.plan || '',
      l.region || '',
      l.status || '',
      l.created_at || ''
    ])
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `leads_${new Date().toISOString().split('T')[0]}.csv`
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
            <h1 className="text-2xl font-bold text-slate-900">Leads Management</h1>
            <p className="text-sm text-slate-500 mt-1">Manage registration leads and prospects</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchLeads}
              className="flex items-center gap-2 px-4 py-2 border border-[#dce9ff] bg-white rounded-lg hover:bg-[#f0f5ff] transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button
              onClick={handleExportLeads}
              className="flex items-center gap-2 px-4 py-2 border border-[#dce9ff] bg-white rounded-lg hover:bg-[#f0f5ff] transition-colors cursor-pointer"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-[#dce9ff] p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[#1251C5]" />
              <span className="text-sm font-medium text-slate-600">Total Leads</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-1">{leads.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-[#dce9ff] p-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-slate-600">New</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {leads.filter(l => l.status === 'new' || !l.status).length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-[#dce9ff] p-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm font-medium text-slate-600">Contacted</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {leads.filter(l => l.status === 'contacted').length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-[#dce9ff] p-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-slate-600">Converted</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {leads.filter(l => l.status === 'converted').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-[#dce9ff] p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search leads..."
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
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="converted">Converted</option>
                <option value="lost">Lost</option>
              </select>
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-xl border border-[#dce9ff] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f8faff] border-b border-[#dce9ff]">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Lead</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Contact</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Company</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Source</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1251C5]"></div>
                        <span className="ml-2 text-slate-500">Loading leads...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-500">
                      No leads found
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead, index) => (
                    <motion.tr
                      key={lead.id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-[#f0f5ff] hover:bg-[#f8faff] transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-gradient-to-br from-[#1251C5] to-[#4f9cf9] rounded-full flex items-center justify-center text-white font-semibold">
                            {(lead.first_name?.charAt(0) || lead.last_name?.charAt(0) || 'L')}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {lead.first_name} {lead.last_name}
                            </p>
                            <p className="text-sm text-slate-500">{lead.id || 'No ID'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3 text-slate-400" />
                            <span className="text-sm text-slate-900">{lead.email || 'No email'}</span>
                          </div>
                          {lead.phone_number && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3 text-slate-400" />
                              <span className="text-sm text-slate-500">
                                {lead.phone_country_code} {lead.phone_number}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-slate-400" />
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {lead.company_name || 'No company'}
                            </p>
                            <p className="text-xs text-slate-500">
                              {lead.company_size || 'Unknown size'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={lead.status || 'new'}
                          onChange={(e) => handleUpdateStatus(lead.id, e.target.value)}
                          className={`text-xs font-medium px-2.5 py-0.5 rounded-full border-0 outline-none cursor-pointer ${
                            (lead.status || 'new') === 'new' ? 'bg-blue-100 text-blue-800' :
                            lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                            lead.status === 'qualified' ? 'bg-purple-100 text-purple-800' :
                            lead.status === 'converted' ? 'bg-green-100 text-green-800' :
                            lead.status === 'lost' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="qualified">Qualified</option>
                          <option value="converted">Converted</option>
                          <option value="lost">Lost</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-slate-600">
                          {lead.source || 'Website'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : 'Unknown'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDelete(lead.id)}
                            className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="mt-6 bg-white rounded-xl border border-[#dce9ff] p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Lead Conversion Funnel</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { stage: 'New Leads', count: leads.filter(l => l.status === 'new' || !l.status).length, color: 'bg-blue-500' },
              { stage: 'Contacted', count: leads.filter(l => l.status === 'contacted').length, color: 'bg-yellow-500' },
              { stage: 'Qualified', count: leads.filter(l => l.status === 'qualified').length, color: 'bg-purple-500' },
              { stage: 'Converted', count: leads.filter(l => l.status === 'converted').length, color: 'bg-green-500' },
              { stage: 'Lost', count: leads.filter(l => l.status === 'lost').length, color: 'bg-red-500' }
            ].map((stage, index) => (
              <div key={index} className="text-center">
                <div className={`h-16 ${stage.color} rounded-lg flex items-center justify-center text-white font-bold text-xl mb-2`}>
                  {stage.count}
                </div>
                <p className="text-sm font-medium text-slate-700">{stage.stage}</p>
                <p className="text-xs text-slate-500">
                  {leads.length > 0 ? Math.round((stage.count / leads.length) * 100) : 0}%
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}