import { useState } from 'react'
import { motion } from 'motion/react'
import {
  Search,
  Filter,
  User,
  Clock,
  AlertCircle,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  RotateCw,
} from 'lucide-react'

const LeadsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAssignModal, setShowAssignModal] = useState(false)

  const leads = [
    {
      id: 1,
      company: 'Acme Corporation',
      contact: 'John Smith',
      email: 'john@acme.com',
      phone: '+1 234 567 8900',
      location: 'New York, USA',
      value: 50000,
      status: 'new',
      slaStatus: 'on-time',
      slaHours: 18,
      assignedTo: 'You',
      assignedDate: '2026-04-20',
      source: 'Website',
    },
    {
      id: 2,
      company: 'Tech Innovations Ltd',
      contact: 'Sarah Johnson',
      email: 'sarah@techinno.com',
      phone: '+1 234 567 8901',
      location: 'San Francisco, USA',
      value: 75000,
      status: 'contacted',
      slaStatus: 'warning',
      slaHours: 4,
      assignedTo: 'You',
      assignedDate: '2026-04-19',
      source: 'Referral',
    },
    {
      id: 3,
      company: 'Global Solutions Inc',
      contact: 'Mike Brown',
      email: 'mike@globalsol.com',
      phone: '+1 234 567 8902',
      location: 'London, UK',
      value: 120000,
      status: 'qualified',
      slaStatus: 'breached',
      slaHours: -2,
      assignedTo: 'You',
      assignedDate: '2026-04-18',
      source: 'LinkedIn',
    },
  ]

  const statusBadge = (status) => {
    const styles = {
      new: 'bg-blue-100 text-blue-700',
      contacted: 'bg-yellow-100 text-yellow-700',
      qualified: 'bg-green-100 text-green-700',
      lost: 'bg-red-100 text-red-700',
    }
    return styles[status] || 'bg-gray-100 text-gray-700'
  }

  const slaBadge = (slaStatus) => {
    const styles = {
      'on-time': 'bg-green-100 text-green-700',
      warning: 'bg-orange-100 text-orange-700',
      breached: 'bg-red-100 text-red-700',
    }
    return styles[slaStatus] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="flex h-full flex-col bg-[#F7F8FA] p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Leads</h1>
          <p className="text-sm text-gray-500">Manage your assigned leads</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
        >
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="lost">Lost</option>
        </select>
        <select className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500">
          <option value="all">All SLA Status</option>
          <option value="on-time">On Time</option>
          <option value="warning">Warning</option>
          <option value="breached">Breached</option>
        </select>
      </div>

      {/* Leads List */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-3">
          {leads.map((lead, index) => (
            <motion.div
              key={lead.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              {/* Header */}
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{lead.company}</h3>
                  <p className="text-sm text-gray-500">{lead.contact}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadge(lead.status)}`}>
                    {lead.status}
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${slaBadge(lead.slaStatus)}`}>
                    {lead.slaStatus === 'on-time' && <CheckCircle className="mr-1 inline h-3 w-3" />}
                    {lead.slaStatus === 'warning' && <Clock className="mr-1 inline h-3 w-3" />}
                    {lead.slaStatus === 'breached' && <AlertCircle className="mr-1 inline h-3 w-3" />}
                    SLA: {Math.abs(lead.slaHours)}h {lead.slaHours < 0 ? 'overdue' : 'left'}
                  </span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="mb-3 grid grid-cols-3 gap-4 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span className="truncate">{lead.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4 shrink-0" />
                  {lead.phone}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 shrink-0" />
                  {lead.location}
                </div>
              </div>

              {/* Meta Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="text-xs font-medium text-gray-500">Lead Value</div>
                    <div className="text-base font-bold text-green-600">${lead.value.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500">Source</div>
                    <div className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                      {lead.source}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500">Assigned</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {new Date(lead.assignedDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
                    Update Status
                  </button>
                  <button className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
                    View Details
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LeadsPage
