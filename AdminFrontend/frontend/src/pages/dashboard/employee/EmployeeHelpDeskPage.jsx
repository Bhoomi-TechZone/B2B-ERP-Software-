import { useState, useMemo, useEffect } from 'react'
import { 
  Search, Eye, Filter, Download, Plus, 
  X, Send, Paperclip, Smile, AlertCircle, FileText,
  Layers, Inbox, Clock, CheckSquare, ChevronRight
} from 'lucide-react'
import ticketService from '../../../services/ticketService'
import { useAuth } from '../../../hooks/useAuth'

const getAvatarColorForDept = (dept) => {
  const d = (dept || '').toLowerCase()
  if (d.includes('it')) return 'bg-purple-100 text-purple-700'
  if (d.includes('hr')) return 'bg-pink-100 text-pink-700'
  if (d.includes('finance')) return 'bg-emerald-100 text-emerald-700'
  if (d.includes('marketing')) return 'bg-rose-100 text-rose-700'
  if (d.includes('operations')) return 'bg-yellow-100 text-yellow-700'
  return 'bg-blue-100 text-blue-700'
}

const mapBackendTicket = (t) => {
  return {
    id: t.id,
    ticketSeqId: t.ticket_seq_id || t.ticketSeqId,
    employeeName: t.employee_name || t.employeeName,
    employeeId: t.employee_id || t.employeeId,
    department: t.department,
    issueType: t.issue_type || t.issueType,
    priority: t.priority,
    status: t.status,
    createdDate: t.created_at ? new Date(t.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : t.createdDate,
    createdTime: t.created_at ? new Date(t.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : t.createdTime,
    avatarLetter: (t.employee_name || t.employeeName || 'U').charAt(0).toUpperCase(),
    avatarColor: getAvatarColorForDept(t.department),
    description: t.description,
    assignedTo: t.assigned_to || t.assignedTo || 'Unassigned',
    assignedToId: t.assigned_to_id || t.assignedToId,
    assignedRole: t.assigned_role || t.assignedRole || '',
    attachments: t.attachments || [],
    comments: (t.comments || []).map(c => ({
      sender: c.sender,
      role: c.role,
      text: c.text,
      time: c.time ? new Date(c.time).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : c.time,
      isMe: c.isMe !== undefined ? c.isMe : (c.user_id === localStorage.getItem('userId')),
      avatarLetter: c.avatar_letter,
      userId: c.user_id
    }))
  }
}

export default function EmployeeHelpDeskPage() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedTicketId, setSelectedTicketId] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [newTicketModal, setNewTicketModal] = useState(false)
  const [activeTab, setActiveTab] = useState('Conversation')

  // --- Comment Input State ---
  const [replyText, setReplyText] = useState('')

  // --- New Ticket Form State ---
  const [newTicketDept, setNewTicketDept] = useState('IT Department')
  const [newTicketIssue, setNewTicketIssue] = useState('Login Issue')
  const [newTicketPriority, setNewTicketPriority] = useState('Medium')
  const [newTicketDesc, setNewTicketDesc] = useState('')

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const res = await ticketService.getTickets()
      if (res && res.tickets) {
        const mapped = res.tickets.map(mapBackendTicket)
        setTickets(mapped)
        if (mapped.length > 0) {
          setSelectedTicketId(mapped[0].id)
        }
      }
    } catch (err) {
      console.error(err)
      setError('Failed to load tickets from backend.')
      setTickets([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  // --- Selected Ticket Detail ---
  const selectedTicket = useMemo(() => {
    return tickets.find(t => t.id === selectedTicketId) || tickets[0] || null
  }, [tickets, selectedTicketId])

  // --- Filter Logic ---
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const idStr = t.ticketSeqId || t.id || ''
      const matchSearch = idStr.toLowerCase().includes(search.toLowerCase()) || 
                          (t.employeeName || '').toLowerCase().includes(search.toLowerCase()) ||
                          (t.issueType || '').toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'All' || t.status === statusFilter
      const matchPriority = priorityFilter === 'All' || t.priority === priorityFilter
      return matchSearch && matchStatus && matchPriority
    })
  }, [tickets, search, statusFilter, priorityFilter])

  // --- Status Change Handler ---
  const handleChangeStatus = async (id, newStatus) => {
    try {
      const res = await ticketService.updateStatus(id, newStatus)
      if (res) {
        setTickets(prev => prev.map(t => t.id === id ? mapBackendTicket(res) : t))
      }
    } catch (err) {
      console.error(err)
      alert('Failed to update status on server.')
    }
  }

  // --- Send Message/Reply Handler ---
  const handleSendMessage = async () => {
    if (!replyText.trim()) return
    const text = replyText.trim()
    setReplyText('')

    try {
      const res = await ticketService.addComment(selectedTicket.id, text)
      if (res) {
        const mappedComment = {
          sender: res.sender,
          role: res.role,
          text: res.text,
          time: res.time ? new Date(res.time).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleString(),
          isMe: true,
          avatarLetter: res.avatar_letter,
          userId: res.user_id
        }
        setTickets(prev => prev.map(t => {
          if (t.id === selectedTicket.id) {
            return {
              ...t,
              comments: [...(t.comments || []), mappedComment]
            }
          }
          return t
        }))
      }
    } catch (err) {
      console.error(err)
      alert('Failed to send message to backend.')
    }
  }

  // --- New Ticket Creator ---
  const handleCreateTicket = async (e) => {
    e.preventDefault()
    if (!newTicketDesc.trim()) return

    const ticketData = {
      employee_name: user?.name || 'Employee',
      department: newTicketDept,
      issue_type: newTicketIssue,
      priority: newTicketPriority,
      description: newTicketDesc.trim(),
      attachments: []
    }

    try {
      const res = await ticketService.createTicket(ticketData)
      if (res) {
        const mapped = mapBackendTicket(res)
        setTickets([mapped, ...tickets])
        setSelectedTicketId(mapped.id)
        setNewTicketModal(false)
        setNewTicketDesc('')
      }
    } catch (err) {
      console.error(err)
      alert('Failed to create ticket on server.')
    }
  }

  // --- Export to CSV ---
  const handleExportCSV = () => {
    if (filteredTickets.length === 0) {
      alert('No tickets to export.')
      return
    }

    const headers = [
      'Ticket ID',
      'Employee Name',
      'Department',
      'Issue Type',
      'Priority',
      'Status',
      'Created Date',
      'Created Time',
      'Description',
      'Assigned To'
    ]

    const rows = filteredTickets.map(t => [
      t.ticketSeqId || t.id,
      t.employeeName,
      t.department,
      t.issueType,
      t.priority,
      t.status,
      t.createdDate,
      t.createdTime,
      t.description ? t.description.replace(/"/g, '""') : '',
      t.assignedTo
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${val}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `tickets_export_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)] w-full bg-slate-50/50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-xs font-bold text-slate-550">Loading My Support Tickets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-64px)] w-full bg-slate-50/50 font-sans overflow-hidden">
      {/* LEFT: Ticket List & Table */}
      <div className="flex-1 flex flex-col p-6 overflow-y-auto border-r border-slate-100">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Tickets</h1>
          <p className="text-xs font-medium text-slate-500 mt-1">Raise, track and manage your support tickets</p>
        </div>

        {/* Filters Bar */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 mb-4 shadow-xs">
          <div className="flex flex-wrap items-center gap-4 flex-1">
            <div className="relative min-w-[200px] max-w-xs flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search tickets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 pl-10 pr-4 text-sm font-semibold outline-none focus:bg-white focus:border-blue-500/30 transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-slate-450 uppercase tracking-wider">Status:</span>
              <select 
                value={statusFilter} 
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 text-xs font-bold text-slate-700 outline-none cursor-pointer"
              >
                <option value="All">All</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-slate-450 uppercase tracking-wider">Priority:</span>
              <select 
                value={priorityFilter} 
                onChange={e => setPriorityFilter(e.target.value)}
                className="bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 text-xs font-bold text-slate-700 outline-none cursor-pointer"
              >
                <option value="All">All</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <button className="flex items-center gap-2 border border-slate-150 hover:bg-slate-50 rounded-xl px-3 py-2 text-xs font-bold text-slate-650 transition cursor-pointer">
              <Filter className="h-3.5 w-3.5" />
              Filters
            </button>
            
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-2 border border-slate-150 hover:bg-slate-50 rounded-xl px-3 py-2 text-xs font-bold text-slate-650 transition cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
          </div>

          <button 
            onClick={() => setNewTicketModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-100 transition-all cursor-pointer shrink-0 animate-fade-in"
          >
            <Plus className="h-4 w-4" />
            New Ticket
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* All Tickets Card */}
          <div 
            onClick={() => setStatusFilter('All')}
            className={`bg-white border rounded-2xl p-5 flex items-center justify-between shadow-xs hover:shadow-md hover:border-blue-200 transition-all cursor-pointer select-none ${
              statusFilter === 'All' ? 'border-blue-500 ring-2 ring-blue-500/10' : 'border-slate-100'
            }`}
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-550">
                  <Layers className="h-4 w-4" />
                </div>
                <span className="text-xs font-black text-slate-550 tracking-tight">All Tickets</span>
              </div>
              <span className="text-3xl font-black text-slate-900 leading-none">{tickets.length}</span>
            </div>
            {statusFilter === 'All' && (
              <ChevronRight className="h-5 w-5 text-blue-600 animate-pulse" />
            )}
          </div>

          {/* Open Tickets Card */}
          <div 
            onClick={() => setStatusFilter('Open')}
            className={`bg-white border rounded-2xl p-5 flex items-center justify-between shadow-xs hover:shadow-md hover:border-blue-200 transition-all cursor-pointer select-none ${
              statusFilter === 'Open' ? 'border-blue-500 ring-2 ring-blue-500/10' : 'border-slate-100'
            }`}
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <Inbox className="h-4 w-4" />
                </div>
                <span className="text-xs font-black text-slate-550 tracking-tight">Open</span>
              </div>
              <span className="text-3xl font-black text-slate-900 leading-none">
                {tickets.filter(t => t.status === 'Open').length}
              </span>
            </div>
            {statusFilter === 'Open' && (
              <ChevronRight className="h-5 w-5 text-blue-600 animate-pulse" />
            )}
          </div>

          {/* In Progress Tickets Card */}
          <div 
            onClick={() => setStatusFilter('In Progress')}
            className={`bg-white border rounded-2xl p-5 flex items-center justify-between shadow-xs hover:shadow-md hover:border-amber-200 transition-all cursor-pointer select-none ${
              statusFilter === 'In Progress' ? 'border-amber-500 ring-2 ring-amber-500/10' : 'border-slate-100'
            }`}
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                  <Clock className="h-4 w-4" />
                </div>
                <span className="text-xs font-black text-slate-550 tracking-tight">In Progress</span>
              </div>
              <span className="text-3xl font-black text-slate-900 leading-none">
                {tickets.filter(t => t.status === 'In Progress').length}
              </span>
            </div>
            {statusFilter === 'In Progress' && (
              <ChevronRight className="h-5 w-5 text-amber-600 animate-pulse" />
            )}
          </div>

          {/* Closed Tickets Card */}
          <div 
            onClick={() => setStatusFilter('Closed')}
            className={`bg-white border rounded-2xl p-5 flex items-center justify-between shadow-xs hover:shadow-md hover:border-green-200 transition-all cursor-pointer select-none ${
              statusFilter === 'Closed' ? 'border-green-500 ring-2 ring-green-500/10' : 'border-slate-100'
            }`}
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                  <CheckSquare className="h-4 w-4" />
                </div>
                <span className="text-xs font-black text-slate-550 tracking-tight">Closed</span>
              </div>
              <span className="text-3xl font-black text-slate-900 leading-none">
                {tickets.filter(t => t.status === 'Closed').length}
              </span>
            </div>
            {statusFilter === 'Closed' && (
              <ChevronRight className="h-5 w-5 text-green-600 animate-pulse" />
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Ticket ID</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400"></th> {/* Subject detail column - empty header */}
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Issue Type</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Priority</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Created Date</th>
                  <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-wider text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-sm font-semibold text-slate-400">
                      No support tickets found matching current filters.
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map(ticket => {
                    const isSelected = selectedTicket && selectedTicket.id === ticket.id
                    
                    return (
                      <tr 
                        key={ticket.id}
                        onClick={() => setSelectedTicketId(ticket.id)}
                        className={`group hover:bg-slate-50/50 transition-colors cursor-pointer ${isSelected ? 'bg-blue-50/20' : ''}`}
                      >
                        <td className="px-6 py-4">
                          <span className="text-xs font-black text-slate-800 tracking-tight">{ticket.ticketSeqId || ticket.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-xs font-bold text-slate-800">{ticket.issueType} in HRMS</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{ticket.department}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-semibold text-slate-750">{ticket.issueType}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              ticket.priority === 'High' ? 'bg-red-500' :
                              ticket.priority === 'Medium' ? 'bg-amber-500' : 'bg-green-500'
                            }`} />
                            <span className="text-xs font-bold text-slate-705">{ticket.priority}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                            ticket.status === 'Open' ? 'bg-blue-50 text-blue-700 border border-blue-100/50' :
                            ticket.status === 'In Progress' ? 'bg-amber-50 text-amber-700 border border-amber-100/50' :
                            'bg-green-50 text-green-700 border border-green-100/50'
                          }`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-xs font-bold text-slate-800">{ticket.createdDate}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{ticket.createdTime}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-center">
                            <button 
                              onClick={() => setSelectedTicketId(ticket.id)}
                              title="View Detail"
                              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-650 transition"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Showing 1 to {filteredTickets.length} of {filteredTickets.length} tickets</span>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <button className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-white text-xs disabled:opacity-40" disabled>&lt;</button>
                <button className="h-8 w-8 flex items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold shadow-xs">1</button>
                <button className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-white text-xs disabled:opacity-40" disabled>&gt;</button>
              </div>

              <select className="bg-white border border-slate-250 rounded-lg py-1 px-2 text-xs font-bold outline-none cursor-pointer">
                <option>10 / page</option>
                <option>20 / page</option>
                <option>50 / page</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Collapsible Ticket Detail View Panel */}
      <div className="w-[420px] bg-white border-l border-slate-100 flex flex-col h-full overflow-hidden shadow-2xl shadow-slate-100">
        {!selectedTicket ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">
            <AlertCircle className="h-8 w-8 text-slate-350 mb-2" />
            <p className="text-xs font-bold">No Ticket Selected</p>
            <p className="text-[10px] mt-1">Select a ticket from the list to view details and start a conversation.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-slate-800 tracking-tight">{selectedTicket.ticketSeqId || selectedTicket.id}</span>
                  <span className={`inline-flex px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                    selectedTicket.priority === 'High' ? 'bg-red-50 text-red-700' :
                    selectedTicket.priority === 'Medium' ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'
                  }`}>
                    {selectedTicket.priority} Priority
                  </span>
                </div>
                <button 
                  onClick={() => setSelectedTicketId('')}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-450 hover:text-slate-700 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-black text-slate-900 leading-tight tracking-tight truncate flex-1">{selectedTicket.issueType} in HRMS</h2>
                <select 
                  value={selectedTicket.status} 
                  onChange={(e) => handleChangeStatus(selectedTicket.id, e.target.value)}
                  className="bg-blue-50/50 hover:bg-blue-50 border border-blue-100 text-blue-700 rounded-xl px-3 py-1.5 text-xs font-bold outline-none cursor-pointer transition"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {/* User Profile */}
              <div className="flex gap-4">
                <div className={`h-10 w-10 rounded-full ${selectedTicket.avatarColor || 'bg-slate-100 text-slate-700'} flex items-center justify-center font-black text-sm shrink-0`}>
                  {selectedTicket.avatarLetter}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-800 truncate">{selectedTicket.employeeName}</p>
                    <p className="text-[10px] text-slate-400">{selectedTicket.createdDate} {selectedTicket.createdTime}</p>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedTicket.department}</p>
                </div>
              </div>

              {/* Details Metadata */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="flex items-center text-xs">
                  <span className="font-bold text-slate-400 w-24 shrink-0">Issue Type</span>
                  <span className="font-bold text-slate-800">{selectedTicket.issueType}</span>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-400">Description</h4>
                  <p className="text-xs text-slate-650 leading-relaxed font-semibold">{selectedTicket.description}</p>
                </div>
              </div>

              {/* Attachments */}
              {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Attachments ({selectedTicket.attachments.length})</h4>
                  <div className="space-y-2">
                    {selectedTicket.attachments.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-3">
                        <div className="flex items-center gap-2.5">
                          <FileText className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="text-xs font-bold text-slate-700 truncate max-w-[180px]">{file.name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{file.size}</p>
                          </div>
                        </div>
                        <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-450 hover:text-slate-705 transition cursor-pointer">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tabs */}
              <div className="border-b border-slate-100 flex gap-6">
                {['Conversation', 'Activity'].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-2 text-xs font-bold tracking-wide relative ${activeTab === tab ? 'text-blue-600' : 'text-slate-400 hover:text-slate-650'} cursor-pointer`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />
                    )}
                  </button>
                ))}
              </div>

              {/* Comments List */}
              {activeTab === 'Conversation' ? (
                <div className="space-y-4">
                  {selectedTicket.comments && selectedTicket.comments.length > 0 ? (
                    selectedTicket.comments.map((comment, index) => {
                      const isStaffComment = comment.role.toLowerCase() !== 'employee'
                      return (
                        <div key={index} className={`flex gap-3 ${isStaffComment ? 'flex-row-reverse' : ''}`}>
                          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-xs shrink-0 select-none">
                            {comment.avatarLetter}
                          </div>
                          <div className={`flex flex-col max-w-[280px] ${isStaffComment ? 'items-end' : ''}`}>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1">
                              <span className="font-bold">{comment.sender}</span>
                              <span>•</span>
                              <span>{comment.time}</span>
                            </div>
                            <div className={`p-3 rounded-2xl text-xs font-medium ${
                              isStaffComment 
                                ? 'bg-blue-50 border border-blue-100/30 text-slate-800 rounded-tr-none' 
                                : 'bg-slate-100 text-slate-750 rounded-tl-none'
                            }`}>
                              {comment.text}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="py-6 text-center text-xs text-slate-400 font-semibold flex flex-col items-center gap-1.5">
                      <AlertCircle className="h-5 w-5 text-slate-350" />
                      No messages yet.
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3 text-xs text-slate-600 font-medium">
                  <div className="flex items-start gap-2 border-l-2 border-blue-500 pl-3 py-1">
                    <div>
                      <p className="font-bold text-slate-707">Ticket created by employee</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{selectedTicket.createdDate} {selectedTicket.createdTime}</p>
                    </div>
                  </div>
                  {selectedTicket.assignedTo !== 'Unassigned' && (
                    <div className="flex items-start gap-2 border-l-2 border-green-500 pl-3 py-1">
                      <div>
                        <p className="font-bold text-slate-707">Ticket assigned to {selectedTicket.assignedTo}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{selectedTicket.createdDate} {selectedTicket.createdTime}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Message Input Footer */}
            {activeTab === 'Conversation' && (
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-2">
                <input 
                  type="text" 
                  placeholder="Type your reply..."
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  className="w-full bg-white border border-slate-150 rounded-xl py-3 px-4 text-xs font-semibold outline-none focus:border-blue-500/30 transition shadow-inner"
                />
                <div className="flex items-center justify-end">
                  <button 
                    onClick={handleSendMessage}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-md shadow-blue-100 cursor-pointer"
                  >
                    Send
                    <Send className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* --- CREATE NEW TICKET MODAL --- */}
      {newTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-lg shadow-2xl p-6 relative">
            <button 
              onClick={() => setNewTicketModal(false)}
              className="absolute right-4 top-4 p-2 hover:bg-slate-100 rounded-lg text-slate-405 hover:text-slate-650 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            
            <h2 className="text-xl font-black text-slate-900 tracking-tight mb-2">Raise Support Ticket</h2>
            <p className="text-xs text-slate-450 font-medium mb-6">Need help with IT, HR, or Finance? File a support ticket below.</p>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Employee Name</label>
                <input 
                  type="text"
                  disabled
                  value={user?.name || ''}
                  className="w-full bg-slate-100 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-500 outline-none cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Target Department</label>
                  <select 
                    value={newTicketDept}
                    onChange={e => setNewTicketDept(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="IT Department">IT Department</option>
                    <option value="HR Department">HR Department</option>
                    <option value="Finance Department">Finance Department</option>
                    <option value="Marketing Department">Marketing Department</option>
                    <option value="Operations Department">Operations Department</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Issue Type</label>
                  <select 
                    value={newTicketIssue}
                    onChange={e => setNewTicketIssue(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="Login Issue">Login Issue</option>
                    <option value="Payslip Issue">Payslip Issue</option>
                    <option value="Salary Discrepancy">Salary Discrepancy</option>
                    <option value="Leave Balance">Leave Balance</option>
                    <option value="System Error">System Error</option>
                    <option value="Access Issue">Access Issue</option>
                    <option value="Tax Document">Tax Document</option>
                    <option value="Profile Update">Profile Update</option>
                    <option value="Email Issue">Email Issue</option>
                    <option value="Software Request">Software Request</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Priority</label>
                <div className="flex gap-4">
                  {['Low', 'Medium', 'High'].map(p => (
                    <label key={p} className="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-705">
                      <input 
                        type="radio" 
                        name="priority"
                        value={p}
                        checked={newTicketPriority === p}
                        onChange={() => setNewTicketPriority(p)}
                        className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      {p}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Issue Description</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Detail the issue you are facing..."
                  value={newTicketDesc}
                  onChange={e => setNewTicketDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500/20 transition resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
                <button 
                  type="button" 
                  onClick={() => setNewTicketModal(false)}
                  className="border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-blue-100 transition cursor-pointer"
                >
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
