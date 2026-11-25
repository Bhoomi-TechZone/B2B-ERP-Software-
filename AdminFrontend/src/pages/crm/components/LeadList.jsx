import { useState } from 'react'
import { Lightbulb } from 'lucide-react'
import { motion } from 'motion/react'

function LeadList() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSource, setFilterSource] = useState('all')
  const [filterRegion, setFilterRegion] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const leads = [
    {
      id: 1,
      company: 'TechCorp Pvt Ltd',
      contact: 'Rahul Sharma',
      email: 'rahul@techcorp.in',
      phone: '+91 98765 43210',
      source: 'Website Form',
      status: 'New',
      priority: 'Hot',
      region: 'India',
      assignedTo: 'Priya M.',
      createdAt: 'Apr 18, 2026',
      value: '₹12L',
    },
    {
      id: 2,
      company: 'Meridian Ltd',
      contact: 'James Harrison',
      email: 'james@meridian.uk',
      phone: '+44 20 1234 5678',
      source: 'LinkedIn',
      status: 'Contacted',
      priority: 'Hot',
      region: 'UK',
      assignedTo: 'Amit K.',
      createdAt: 'Apr 17, 2026',
      value: '₹15L',
    },
    {
      id: 3,
      company: 'NovaMed Inc',
      contact: 'Sarah Klein',
      email: 'sarah@novamed.com',
      phone: '+1 555 678 9012',
      source: 'Google PPC',
      status: 'Qualified',
      priority: 'Warm',
      region: 'US',
      assignedTo: 'Rohan S.',
      createdAt: 'Apr 15, 2026',
      value: '₹22L',
    },
    {
      id: 4,
      company: 'Apex Solutions',
      contact: 'Priya Menon',
      email: 'priya@apex.in',
      phone: '+91 98111 22334',
      source: 'Justdial',
      status: 'Demo',
      priority: 'Warm',
      region: 'India',
      assignedTo: 'Priya M.',
      createdAt: 'Apr 12, 2026',
      value: '₹8L',
    },
    {
      id: 5,
      company: 'BlueSky Tech',
      contact: 'Emma Williams',
      email: 'emma@bluesky.uk',
      phone: '+44 20 9876 5432',
      source: 'Meta Ads',
      status: 'Proposal',
      priority: 'Hot',
      region: 'UK',
      assignedTo: 'Amit K.',
      createdAt: 'Apr 10, 2026',
      value: '₹25L',
    },
    {
      id: 6,
      company: 'Greenfield Corp',
      contact: 'Ananya Rao',
      email: 'ananya@greenfield.in',
      phone: '+91 80 7788 9900',
      source: 'Google Business',
      status: 'Negotiation',
      priority: 'Hot',
      region: 'India',
      assignedTo: 'Rohan S.',
      createdAt: 'Apr 8, 2026',
      value: '₹20L',
    },
    {
      id: 7,
      company: 'Vista Dynamics',
      contact: 'Michael Chen',
      email: 'michael@vista.com',
      phone: '+1 415 333 4444',
      source: 'Email',
      status: 'Won',
      priority: 'Hot',
      region: 'US',
      assignedTo: 'Amit K.',
      createdAt: 'Mar 28, 2026',
      value: '₹30L',
    },
    {
      id: 8,
      company: 'Blaze Marketing',
      contact: 'Sneha Iyer',
      email: 'sneha@blaze.in',
      phone: '+91 22 5544 3322',
      source: 'Manual Entry',
      status: 'Lost',
      priority: 'Cold',
      region: 'India',
      assignedTo: 'Priya M.',
      createdAt: 'Mar 20, 2026',
      value: '₹5L',
    },
  ]

  const statusColors = {
    New: 'bg-slate-100 text-slate-700',
    Contacted: 'bg-blue-100 text-blue-700',
    Qualified: 'bg-green-100 text-green-700',
    Demo: 'bg-amber-100 text-amber-700',
    Proposal: 'bg-purple-100 text-purple-700',
    Negotiation: 'bg-indigo-100 text-indigo-700',
    Won: 'bg-emerald-100 text-emerald-700',
    Lost: 'bg-red-100 text-red-700',
  }

  const priorityColors = {
    Hot: 'bg-red-500 text-white',
    Warm: 'bg-amber-500 text-white',
    Cold: 'bg-blue-500 text-white',
  }

  // Filter leads based on search and filters
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      searchTerm === '' ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSource = filterSource === 'all' || lead.source === filterSource
    const matchesRegion = filterRegion === 'all' || lead.region === filterRegion
    const matchesStatus = filterStatus === 'all' || lead.status === filterStatus

    return matchesSearch && matchesSource && matchesRegion && matchesStatus
  })

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="min-w-[250px] flex-1">
            <input
              type="text"
              placeholder="Search company, contact, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Filter: Source */}
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
          >
            <option value="all">All Sources</option>
            <option value="Website Form">Website Form</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Google PPC">Google PPC</option>
            <option value="Meta Ads">Meta Ads</option>
            <option value="Justdial">Justdial</option>
            <option value="Google Business">Google Business</option>
            <option value="Email">Email</option>
            <option value="Manual Entry">Manual Entry</option>
          </select>

          {/* Filter: Region */}
          <select
            value={filterRegion}
            onChange={(e) => setFilterRegion(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
          >
            <option value="all">All Regions</option>
            <option value="India">India</option>
            <option value="UK">UK</option>
            <option value="US">US</option>
          </select>

          {/* Filter: Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Demo">Demo</option>
            <option value="Proposal">Proposal</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Won">Won</option>
            <option value="Lost">Lost</option>
          </select>

          {/* Action Buttons */}
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700">
            + Add Lead
          </button>
          <button className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
            Import CSV
          </button>
          <button className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
            Export
          </button>
        </div>

        {/* Active Filters Info */}
        {(searchTerm || filterSource !== 'all' || filterRegion !== 'all' || filterStatus !== 'all') && (
          <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
            <span className="font-medium">Active filters:</span>
            {searchTerm && (
              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
                Search: &quot;{searchTerm}&quot;
              </span>
            )}
            {filterSource !== 'all' && (
              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
                Source: {filterSource}
              </span>
            )}
            {filterRegion !== 'all' && (
              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
                Region: {filterRegion}
              </span>
            )}
            {filterStatus !== 'all' && (
              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
                Status: {filterStatus}
              </span>
            )}
            <button
              onClick={() => {
                setSearchTerm('')
                setFilterSource('all')
                setFilterRegion('all')
                setFilterStatus('all')
              }}
              className="ml-2 text-xs font-medium text-red-600 underline hover:text-red-700"
            >
              Clear all
            </button>
          </div>
        )}
      </motion.div>

      {/* Results Count */}
      <div className="text-sm text-slate-600">
        Showing <span className="font-semibold text-slate-900">{filteredLeads.length}</span> of{' '}
        <span className="font-semibold text-slate-900">{leads.length}</span> leads
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input type="checkbox" className="rounded border-slate-300" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                  Company
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                  Source
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                  Priority
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                  Region
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                  Value
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                  Assigned
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                  Created
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan="11" className="px-4 py-12 text-center text-sm text-slate-500">
                    No leads found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-4 py-3">
                      <input type="checkbox" className="rounded border-slate-300" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{lead.company}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <div className="font-medium text-slate-900">{lead.contact}</div>
                        <div className="text-slate-500">{lead.email}</div>
                        <div className="text-slate-500">{lead.phone}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-700">{lead.source}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          statusColors[lead.status]
                        }`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          priorityColors[lead.priority]
                        }`}
                      >
                        {lead.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-700">{lead.region}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-900">{lead.value}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-700">{lead.assignedTo}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-500">{lead.createdAt}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                          View
                        </button>
                        <button className="text-sm font-medium text-slate-600 hover:text-slate-700">
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3">
          <div className="text-sm text-slate-600">
            Page <span className="font-medium">1</span> of <span className="font-medium">1</span>
          </div>
          <div className="flex gap-2">
            <button
              disabled
              className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm font-medium text-slate-400"
            >
              Previous
            </button>
            <button className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-1 text-sm font-medium text-white">
              1
            </button>
            <button
              disabled
              className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm font-medium text-slate-400"
            >
              Next
            </button>
          </div>
        </div>
      </motion.div>

      {/* Bulk Actions Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="rounded-lg border border-blue-200 bg-blue-50 p-4"
      >
        <h3 className="flex items-center gap-2 text-sm font-semibold text-blue-900"><Lightbulb className="h-4 w-4 text-amber-500" /> Bulk Actions Available</h3>
        <ul className="mt-2 space-y-1 text-sm text-blue-700">
          <li>• Select multiple leads (checkbox) → Bulk Assign to sales rep</li>
          <li>• Bulk Status Update (New → Contacted, etc.)</li>
          <li>• Bulk Delete or Archive</li>
          <li>• Export selected leads to CSV</li>
        </ul>
      </motion.div>
    </div>
  )
}

export default LeadList
