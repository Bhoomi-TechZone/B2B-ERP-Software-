import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Search, 
  Filter, 
  Plus, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  ArrowRight, 
  Edit, 
  Trash2,
  UserPlus,
  Users,
  RotateCw,
  Clock,
  AlertCircle,
  CheckCircle,
  X,
  ClipboardList,
  PhoneCall,
  StickyNote,
  History,
  Bell,
  CheckSquare,
  Video,
  MessageSquare,
  FileText,
  Activity,
  TrendingUp,
  Award,
  Send,
  Paperclip,
  Target,
  Banknote,
  Briefcase,
  Lightbulb,
  Eye,
} from 'lucide-react'
import AddLeadModal from './AddLeadModal'
import crmService from '../../../services/crmService'

// Helper to normalize backend leads to frontend format
const normalizeLead = (backendLead, agents = []) => {
  const contactName = `${backendLead.first_name || ''} ${backendLead.last_name || ''}`.trim() || 'N/A'
  
  // Find agent name
  let agentName = null
  if (backendLead.assigned_to) {
    const agent = agents.find(a => a.id === backendLead.assigned_to)
    agentName = agent ? agent.name : backendLead.assigned_to
  }

  // Calculate SLA status and hours based on created_at
  const createdDate = new Date(backendLead.created_at || new Date())
  const hoursSinceCreation = Math.floor((new Date() - createdDate) / (1000 * 60 * 60))
  let slaStatus = 'on-time'
  let slaHours = 24 - hoursSinceCreation
  if (slaHours < 0) {
    slaStatus = 'breached'
    slaHours = Math.abs(slaHours)
  } else if (slaHours <= 6) {
    slaStatus = 'warning'
  } else if (!backendLead.assigned_to) {
    slaStatus = 'pending'
    slaHours = 24
  }

  // Normalize priority to badge names (high/medium/low vs hot/warm/cold)
  let priority = 'low'
  const p = (backendLead.priority || '').toLowerCase()
  if (p === 'hot' || p === 'high') priority = 'high'
  else if (p === 'warm' || p === 'medium') priority = 'medium'

  // Notes
  const notes = backendLead.notes ? [{ id: '1', text: backendLead.notes, date: backendLead.updated_at || backendLead.created_at, by: 'System' }] : []

  // Lead Value: read real value from DB (deal_value / estimated_value / value)
  const leadRawValue = backendLead.deal_value !== undefined && backendLead.deal_value !== null ? backendLead.deal_value :
    (backendLead.estimated_value !== undefined && backendLead.estimated_value !== null ? backendLead.estimated_value :
    (backendLead.value !== undefined && backendLead.value !== null ? backendLead.value :
    (backendLead.qualification_score ? backendLead.qualification_score * 1000 : 0)))

  return {
    id: backendLead.id || backendLead._id,
    name: backendLead.company_name || 'N/A',
    contact: contactName,
    email: backendLead.email,
    phone: backendLead.phone || 'N/A',
    source: backendLead.source || 'manual',
    status: backendLead.status || 'new',
    value: Number(leadRawValue) || 0,
    location: backendLead.region || 'N/A',
    created: backendLead.created_at || new Date().toISOString(),
    score: backendLead.qualification_score || 0,
    assignedTo: agentName,
    assignedToId: backendLead.assigned_to,
    assignedDate: backendLead.updated_at || null,
    slaStatus,
    slaHours: Math.max(0, slaHours),
    priority,
    rawPriority: backendLead.priority,
    activities: [],
    notes,
    lastActivity: backendLead.updated_at || null,
    _raw: backendLead,
  }
}

const LeadsModule = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [agentFilter, setAgentFilter] = useState('all')
  const [showMoreFilters, setShowMoreFilters] = useState(false)
  const [selectedLeads, setSelectedLeads] = useState([])
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showCallModal, setShowCallModal] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showMeetingModal, setShowMeetingModal] = useState(false)
  const [meetingFormData, setMeetingFormData] = useState({
    subject: 'Product Demonstration',
    duration: '30 mins',
    notes: ''
  })
  const [showAddLeadModal, setShowAddLeadModal] = useState(false)
  const [editingLead, setEditingLead] = useState(null)
  const [selectedLead, setSelectedLead] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  const [leads, setLeads] = useState([])
  const [salesUsers, setSalesUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedAgentId, setSelectedAgentId] = useState('')

  // Qualify lead modal states
  const [showQualifyModal, setShowQualifyModal] = useState(false)
  const [qualifyFormData, setQualifyFormData] = useState({
    budget: 'Confirmed ₹5L-10L (20 pts)',
    authority: 'Decision Maker (20 pts)',
    need: 'Critical pain point (20 pts)',
    timeline: 'Within 2 months (20 pts)',
    budget_notes: '',
    qualification_notes: '',
    estimated_headcount: 50,
    current_solution: ''
  })

  // Email form states
  const emailFileInputRef = useRef(null)
  const [emailFormData, setEmailFormData] = useState({
    template: '',
    subject: '',
    message: '',
    attachments: []
  })

  // Real backend lead activities
  const [selectedLeadActivities, setSelectedLeadActivities] = useState([])

  // Call form state
  const [callFormData, setCallFormData] = useState({
    outcome: 'Connected - Interested',
    duration: '5 mins',
    notes: '',
    nextAction: 'Follow up call'
  })

  // Note state
  const [noteText, setNoteText] = useState('')
  const [selectedLeadNotes, setSelectedLeadNotes] = useState([])

  // Assignment history
  const [assignmentHistory, setAssignmentHistory] = useState([
    {
      id: 1,
      leadId: 2,
      action: 'Assigned',
      from: null,
      to: 'Sarah Smith',
      date: '2026-04-19 10:30 AM',
      assignedBy: 'System (Round Robin)',
    }
  ])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      // 1. Fetch agents
      let agentsList = []
      try {
        const fetchedAgents = await crmService.getSalesAgents()
        agentsList = fetchedAgents.map(a => ({
          id: a.id,
          name: a.name,
          email: a.email,
          avatar: a.name.split(' ').map(n => n[0]).join('').toUpperCase(),
          leads: 0 // Will count below
        }))
      } catch (err) {
        console.error('Error fetching sales agents:', err)
      }

      // 2. Fetch leads
      const fetchedLeads = await crmService.getLeads({
        status: statusFilter,
        source: sourceFilter,
        priority: priorityFilter,
        assigned_to: agentFilter,
        search: searchTerm
      })

      // Update agent lead counts
      agentsList.forEach(agent => {
        agent.leads = fetchedLeads.filter(l => l.assigned_to === agent.id).length
      })
      setSalesUsers(agentsList)

      // Normalize leads
      const normalized = fetchedLeads.map(lead => normalizeLead(lead, agentsList))
      setLeads(normalized)
    } catch (err) {
      console.error('Error fetching CRM data:', err)
      setError(err.message || 'Failed to fetch data from server')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [statusFilter, sourceFilter, priorityFilter, agentFilter, searchTerm])

  const statusBadge = (status) => {
    const styles = {
      new: 'bg-blue-100 text-blue-700',
      contacted: 'bg-yellow-100 text-yellow-700',
      qualified: 'bg-green-100 text-green-700',
      demo_scheduled: 'bg-indigo-100 text-indigo-700',
      demo_done: 'bg-cyan-100 text-cyan-700',
      proposal_sent: 'bg-purple-100 text-purple-700',
      negotiation: 'bg-amber-100 text-amber-700',
      won: 'bg-emerald-100 text-emerald-700',
      lost: 'bg-rose-100 text-rose-700',
      dormant: 'bg-gray-100 text-gray-700',
      converted: 'bg-teal-100 text-teal-700',
    }
    return styles[status] || 'bg-gray-100 text-gray-700'
  }

  const slaBadge = (slaStatus) => {
    const styles = {
      pending: 'bg-gray-100 text-gray-700',
      'on-time': 'bg-green-100 text-green-700',
      warning: 'bg-orange-100 text-orange-700',
      breached: 'bg-red-100 text-red-700',
    }
    return styles[slaStatus] || 'bg-gray-100 text-gray-700'
  }

  const priorityBadge = (priority) => {
    const styles = {
      high: 'bg-red-100 text-red-700',
      hot: 'bg-red-100 text-red-700',
      medium: 'bg-yellow-100 text-yellow-700',
      warm: 'bg-yellow-100 text-yellow-700',
      low: 'bg-blue-100 text-blue-700',
      cold: 'bg-blue-100 text-blue-700',
    }
    return styles[priority] || 'bg-gray-100 text-gray-700'
  }

  const scoreBadge = (score) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const toggleLeadSelection = (leadId) => {
    setSelectedLeads((prev) =>
      prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]
    )
  }

  const selectAllLeads = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([])
    } else {
      setSelectedLeads(leads.map((lead) => lead.id))
    }
  }

  const assignLeadRoundRobin = () => {
    if (salesUsers.length === 0) return 'None'
    const userWithLeastLeads = salesUsers.reduce((prev, current) =>
      prev.leads < current.leads ? prev : current
    )
    return userWithLeastLeads
  }

  const handleBulkAssign = () => {
    const selectedCount = selectedLeads.length
    if (selectedCount > 0) {
      setSelectedLead(null)
      setShowAssignModal(true)
    }
  }

  const handleAssignSubmit = async () => {
    let agentId = selectedAgentId
    if (!agentId) {
      const rrAgent = assignLeadRoundRobin()
      if (rrAgent !== 'None') {
        agentId = rrAgent.id
      }
    }

    if (!agentId) {
      alert('Please select an agent to assign.')
      return
    }

    const leadIdsToAssign = selectedLead ? [selectedLead.id] : selectedLeads
    
    setLoading(true)
    try {
      await crmService.assignLeads(leadIdsToAssign, agentId)
      
      // Update local assignment history
      const agent = salesUsers.find(u => u.id === agentId)
      const newHistory = leadIdsToAssign.map(leadId => {
        const lead = leads.find(l => l.id === leadId)
        return {
          id: Date.now() + Math.random(),
          leadId,
          action: lead?.assignedTo ? 'Reassigned' : 'Assigned',
          from: lead?.assignedTo || null,
          to: agent ? agent.name : 'Unknown Agent',
          date: new Date().toLocaleString(),
          assignedBy: 'Admin',
        }
      })
      
      setAssignmentHistory(prev => [...newHistory, ...prev])
      setSelectedLeads([])
      setShowAssignModal(false)
      setSelectedAgentId('')
      await fetchData()
    } catch (err) {
      console.error('Error assigning lead:', err)
      alert(err.message || 'Failed to assign leads')
    } finally {
      setLoading(false)
    }
  }

  const fetchLeadActivities = async (leadId) => {
    try {
      console.log('Fetching activities for lead:', leadId)
      const res = await crmService.getLeadActivities(leadId)
      console.log('Activities response:', res)
      
      // Handle different response structures
      const activities = res.data || res || []
      console.log('Parsed activities:', activities)
      
      setSelectedLeadActivities(Array.isArray(activities) ? activities : [])
      
      // Filter notes from activities
      const notes = activities.filter(a => a.activity_type === 'note')
      setSelectedLeadNotes(notes)
    } catch (err) {
      console.error('Error fetching lead activities:', err)
      setSelectedLeadActivities([])
      setSelectedLeadNotes([])
    }
  }

  const handleSaveNote = async () => {
    if (!noteText.trim()) {
      alert('Please enter a note')
      return
    }

    if (!selectedLead?.id) {
      alert('No lead selected')
      return
    }

    setLoading(true)
    try {
      console.log('Saving note for lead:', selectedLead.id)
      
      await crmService.logLeadActivity(selectedLead.id, {
        activity_type: 'note',
        subject: 'Note added',
        body: noteText,
        direction: 'internal'
      })
      
      setNoteText('')
      await fetchLeadActivities(selectedLead.id)
      alert('Note saved successfully!')
    } catch (err) {
      console.error('Error saving note:', err)
      alert('Failed to save note: ' + (err.response?.data?.detail || err.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const openDetailModal = (lead) => {
    setSelectedLead(lead)
    setShowDetailModal(true)
    setActiveTab('overview')
    fetchLeadActivities(lead.id)
  }

  const handleEditLead = (lead) => {
    setEditingLead(lead)
    setShowDetailModal(false)
    setShowAddLeadModal(true)
  }

  const handleCall = (lead) => {
    setSelectedLead(lead)
    setCallFormData({
      outcome: 'Connected - Interested',
      duration: '5 mins',
      notes: '',
      nextAction: 'Follow up call'
    })
    setShowCallModal(true)
  }

  const handleCallSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedLead?.id) {
      alert('No lead selected')
      return
    }

    setLoading(true)
    try {
      console.log('Logging call for lead:', selectedLead.id)
      console.log('Call data:', callFormData)

      const response = await crmService.logLeadActivity(selectedLead.id, {
        activity_type: 'call',
        subject: `Call: ${callFormData.outcome}`,
        body: `Outcome: ${callFormData.outcome}\nDuration: ${callFormData.duration}\nNext Action: ${callFormData.nextAction}\nNotes: ${callFormData.notes}`,
        outcome: callFormData.outcome,
        duration: callFormData.duration,
        direction: 'outbound'
      })
      
      console.log('Call logged successfully:', response)
      
      setShowCallModal(false)
      setCallFormData({
        outcome: 'Connected - Interested',
        duration: '5 mins',
        notes: '',
        nextAction: 'Follow up call'
      })
      
      await fetchData()
      await fetchLeadActivities(selectedLead.id)
      
      alert('Call logged successfully!')
    } catch (err) {
      console.error('Error logging call:', err)
      console.error('Error details:', err.response?.data || err.message)
      alert('Failed to log call: ' + (err.response?.data?.detail || err.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const handleEmail = (lead) => {
    setSelectedLead(lead)
    setEmailFormData({ template: '', subject: '', message: '' })
    setShowEmailModal(true)
  }

  const handleMeeting = (lead) => {
    setSelectedLead(lead)
    setMeetingFormData({
      subject: 'Product Demonstration',
      duration: '30 mins',
      notes: ''
    })
    setShowMeetingModal(true)
  }

  const handleMeetingSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedLead?.id) {
      alert('No lead selected')
      return
    }

    setLoading(true)
    try {
      console.log('Logging meeting for lead:', selectedLead.id)
      console.log('Meeting data:', meetingFormData)

      const response = await crmService.logLeadActivity(selectedLead.id, {
        activity_type: 'meeting',
        subject: `Meeting: ${meetingFormData.subject}`,
        body: `Subject: ${meetingFormData.subject}\nDuration: ${meetingFormData.duration}\nNotes: ${meetingFormData.notes}`,
        duration: meetingFormData.duration,
        direction: 'outbound'
      })
      
      console.log('Meeting logged successfully:', response)
      
      setShowMeetingModal(false)
      setMeetingFormData({
        subject: 'Product Demonstration',
        duration: '30 mins',
        notes: ''
      })
      
      await fetchData()
      await fetchLeadActivities(selectedLead.id)
      
      alert('Meeting logged successfully!')
    } catch (err) {
      console.error('Error logging meeting:', err)
      console.error('Error details:', err.response?.data || err.message)
      alert('Failed to log meeting: ' + (err.response?.data?.detail || err.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const handleTemplateChange = (e) => {
    const val = e.target.value
    let subject = ''
    let message = ''
    
    if (val === 'Introduction Email') {
      subject = `Introducing B2B HRMS for ${selectedLead?.name || 'your company'}`
      message = `Hi ${selectedLead?.contact || 'there'},\n\nI hope this email finds you well.\n\nI wanted to introduce our fully integrated HRMS platform designed to help companies of size ${selectedLead?._raw?.company_size || 'your scale'} automate payroll, employee onboarding, performance management, and compliance in one unified system.\n\nWould you be open to a brief 10-minute exploratory call this week?\n\nBest regards,\nPlatform Sales Team`
    } else if (val === 'Follow Up - After Call') {
      subject = `Great connecting with you today! - B2B HRMS`
      message = `Hi ${selectedLead?.contact || 'there'},\n\nThank you for taking the time to speak with me today regarding your HR and Payroll operations.\n\nAs discussed, our system solves manual processing delays and legacy software integration issues.\n\nI've attached our brochure for your reference. Let's touch base again on the scheduled date.\n\nBest regards,\nPlatform Sales Team`
    } else if (val === 'Product Demo Invite') {
      subject = `Product Demo Invitation: B2B HRMS Platform`
      message = `Hi ${selectedLead?.contact || 'there'},\n\nFollowing up on our qualification discussion, I would love to invite you to a live demonstration of our platform.\n\nDuring this demo, we'll walk through our dynamic payroll engine, compliance dashboard, and reporting features tailored specifically to your industry.\n\nPlease let me know your availability for a 30-minute Microsoft Teams meeting next week.\n\nBest regards,\nPlatform Sales Team`
    } else if (val === 'Proposal Submission') {
      subject = `Commercial Proposal - B2B HRMS Implementation`
      message = `Hi ${selectedLead?.contact || 'there'},\n\nI am pleased to submit our commercial proposal for the implementation of B2B HRMS at ${selectedLead?.name || 'your company'}.\n\nThe proposal includes detailed pricing structures, implementation timelines, and custom modules configured for your specific needs.\n\nLet me know if you would like to schedule a call to review the terms together.\n\nBest regards,\nPlatform Sales Team`
    } else if (val === 'Meeting Confirmation') {
      subject = `Confirmed: B2B HRMS Exploratory Meeting`
      message = `Hi ${selectedLead?.contact || 'there'},\n\nThis is to confirm our meeting scheduled to discuss the B2B HRMS platform capabilities.\n\nWe will review your current software setup and explore how our modules can optimize your HR workflows.\n\nLooking forward to speaking with you!\n\nBest regards,\nPlatform Sales Team`
    }
    
    setEmailFormData(prev => ({
      ...prev,
      template: val,
      subject,
      message
    }))
  }

  const handleFileAttach = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is larger than 10MB limit.`)
        return
      }
      const reader = new FileReader()
      reader.onload = (event) => {
        setEmailFormData(prev => ({
          ...prev,
          attachments: [
            ...(prev.attachments || []),
            {
              filename: file.name,
              content: event.target.result,
              size: file.size
            }
          ]
        }))
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const removeAttachment = (index) => {
    setEmailFormData(prev => ({
      ...prev,
      attachments: (prev.attachments || []).filter((_, i) => i !== index)
    }))
  }

  const handleSendEmailSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedLead?.id) {
      alert('No lead selected')
      return
    }

    if (!emailFormData.subject || !emailFormData.message) {
      alert('Please fill in subject and message')
      return
    }

    setLoading(true)
    try {
      console.log('Sending email to lead:', selectedLead.id)
      console.log('Email data:', emailFormData)

      const response = await crmService.sendLeadEmail(selectedLead.id, {
        subject: emailFormData.subject,
        message: emailFormData.message,
        template: emailFormData.template || 'Custom Email',
        attachments: emailFormData.attachments?.length ? emailFormData.attachments : undefined
      })
      
      console.log('Email sent response:', response)
      
      setShowEmailModal(false)
      setEmailFormData({ template: '', subject: '', message: '', attachments: [] })
      
      await fetchData()
      await fetchLeadActivities(selectedLead.id)
      
      if (response?.delivery_success) {
        alert(`Email sent successfully via SMTP to ${selectedLead.contact || selectedLead.name}!`)
      } else {
        alert(`Email activity logged in CRM for ${selectedLead.contact || selectedLead.name}.\n\nNote: SMTP delivery status: ${response?.delivery_message || 'Please check SMTP settings in .env'}`)
      }
    } catch (err) {
      console.error('Error sending email:', err)
      console.error('Error details:', err.response?.data || err.message)
      alert('Failed to send email: ' + (err.response?.data?.detail || err.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteLead = async (leadId) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return
    
    setLoading(true)
    try {
      await crmService.deleteLead(leadId)
      setShowDetailModal(false)
      await fetchData()
    } catch (err) {
      console.error('Error deleting lead:', err)
      alert(err.message || 'Failed to delete lead')
    } finally {
      setLoading(false)
    }
  }

  const handleMoveToOpportunity = (lead) => {
    setSelectedLead(lead)
    
    const isBudgetConfirmed = lead._raw?.budget_confirmed
    const isAuthorityConfirmed = lead._raw?.authority_confirmed
    
    setQualifyFormData({
      budget: isBudgetConfirmed ? 'Confirmed ₹5L-10L (20 pts)' : 'Budget planned (10 pts)',
      authority: isAuthorityConfirmed ? 'Decision Maker (20 pts)' : 'Influencer (10 pts)',
      need: (lead._raw?.pain_points?.length || 0) > 0 ? 'Critical pain point (20 pts)' : 'Moderate pain point (15 pts)',
      timeline: lead._raw?.timeline === 'Immediate (<1 month)' ? 'Urgent / immediate (25 pts)' : 'Within 2 months (20 pts)',
      budget_notes: lead._raw?.budget_notes || '',
      qualification_notes: lead._raw?.authority_notes || '',
      estimated_headcount: lead._raw?.estimated_headcount || 50,
      current_solution: lead._raw?.current_solution || ''
    })
    setShowQualifyModal(true)
  }

  const handleQualifySubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    const getPts = (opt) => {
      const m = (opt || '').match(/\((\d+)\s*pts\)/)
      return m ? parseInt(m[1]) : 0
    }
    
    const budgetScore = getPts(qualifyFormData.budget)
    const authorityScore = getPts(qualifyFormData.authority)
    const needScore = getPts(qualifyFormData.need)
    const timelineScore = getPts(qualifyFormData.timeline)
    const totalScore = budgetScore + authorityScore + needScore + timelineScore

    try {
      const payload = {
        budget_confirmed: budgetScore >= 15,
        budget_notes: qualifyFormData.budget_notes,
        authority_confirmed: authorityScore >= 20,
        authority_notes: qualifyFormData.qualification_notes,
        pain_points: needScore >= 10 ? ["HR Operations Inefficiency"] : [],
        timeline: timelineScore >= 20 ? "Short-term (1-3M)" : timelineScore >= 15 ? "Mid-term (3-6M)" : "Long-term (6M+)",
        estimated_headcount: qualifyFormData.estimated_headcount || 50,
        current_solution: qualifyFormData.current_solution
      }
      
      if (qualifyFormData.timeline.includes("Urgent")) {
        payload.timeline = "Immediate (<1 month)"
      }

      await crmService.qualifyLead(selectedLead.id, payload)
      setShowQualifyModal(false)
      setShowDetailModal(false)
      await fetchData()
      
      if (totalScore >= 60) {
        alert(`BANT Qualified! Total Score: ${totalScore}%. Lead qualified successfully and opportunity generated in pipeline!`)
      } else {
        alert(`BANT Complete! Total Score: ${totalScore}%. Lead status updated. (Score must be >= 60% to automatically generate an opportunity)`)
      }
    } catch (err) {
      console.error('Error qualifying lead:', err)
      alert(err.message || 'Failed to qualify lead')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkLost = async (lead) => {
    if (!window.confirm(`Are you sure you want to mark "${lead.name}" as Lost?`)) return
    
    setLoading(true)
    try {
      await crmService.updateLead(lead.id, { status: 'lost' })
      setShowDetailModal(false)
      await fetchData()
    } catch (err) {
      console.error('Error updating status to lost:', err)
      alert(err.message || 'Failed to update status')
    } finally {
      setLoading(false)
    }
  }

  const activityIcon = (type) => {
    switch(type) {
      case 'call': return <Phone className="h-4 w-4 text-blue-600" />
      case 'email': return <Mail className="h-4 w-4 text-purple-600" />
      case 'meeting': return <Video className="h-4 w-4 text-green-600" />
      default: return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Lead Management</h1>
          <p className="text-sm text-gray-500">Manage leads with SLA tracking and assignment control</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistoryModal(true)}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            <History className="h-4 w-4" />
            History
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
            <Bell className="h-4 w-4" />
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {leads.filter((l) => !l.assignedTo).length}
            </span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-5 px-6">
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <div className="mb-1 text-xs font-medium text-gray-500">Total Leads</div>
          <div className="text-xl font-bold text-gray-900">{leads.length}</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <div className="mb-1 text-xs font-medium text-gray-500">Unassigned</div>
          <div className="text-xl font-bold text-orange-600">
            {leads.filter((l) => !l.assignedTo).length}
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <div className="mb-1 text-xs font-medium text-gray-500">Assigned</div>
          <div className="text-xl font-bold text-green-600">
            {leads.filter((l) => l.assignedTo).length}
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <div className="mb-1 text-xs font-medium text-gray-500">SLA Warning</div>
          <div className="text-xl font-bold text-orange-600">
            {leads.filter((l) => l.slaStatus === 'warning').length}
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <div className="mb-1 text-xs font-medium text-gray-500">Selected</div>
          <div className="text-xl font-bold text-blue-600">{selectedLeads.length}</div>
        </div>
      </div>

      {/* Header Actions */}
      <div className="mb-4 flex flex-wrap items-center gap-3 px-6">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="demo_scheduled">Demo Scheduled</option>
            <option value="demo_done">Demo Done</option>
            <option value="proposal_sent">Proposal Sent</option>
            <option value="negotiation">Negotiation</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
            <option value="dormant">Dormant</option>
          </select>

          {/* Source Filter */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
          >
            <option value="all">All Sources</option>
            <option value="web_form">Website / Form</option>
            <option value="manual">Manual Entry</option>
            <option value="referral">Referral</option>
            <option value="linkedin">LinkedIn</option>
            <option value="email">Email Campaign</option>
            <option value="ppc_google">Google Ads</option>
            <option value="meta_ads">Social Ads</option>
            <option value="local_listing">Local Listing</option>
          </select>

          <button
            onClick={() => setShowMoreFilters(!showMoreFilters)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
              showMoreFilters || priorityFilter !== 'all' || agentFilter !== 'all'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4" />
            More Filters
            {(priorityFilter !== 'all' || agentFilter !== 'all') && (
              <span className="flex h-2 w-2 rounded-full bg-blue-600" />
            )}
          </button>

          {(showMoreFilters || priorityFilter !== 'all' || agentFilter !== 'all') && (
            <>
              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="rounded-lg border border-blue-200 bg-blue-50/50 px-3 py-2 text-sm outline-none focus:border-blue-500 text-gray-700"
              >
                <option value="all">All Priorities</option>
                <option value="hot">Hot (High)</option>
                <option value="warm">Warm (Medium)</option>
                <option value="cold">Cold (Low)</option>
              </select>

              {/* Assigned Agent Filter */}
              <select
                value={agentFilter}
                onChange={(e) => setAgentFilter(e.target.value)}
                className="rounded-lg border border-blue-200 bg-blue-50/50 px-3 py-2 text-sm outline-none focus:border-blue-500 text-gray-700"
              >
                <option value="all">All Agents</option>
                <option value="unassigned">Unassigned Only</option>
                {salesUsers.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </>
          )}

          {(statusFilter !== 'all' || sourceFilter !== 'all' || priorityFilter !== 'all' || agentFilter !== 'all' || searchTerm) && (
            <button
              onClick={() => {
                setStatusFilter('all')
                setSourceFilter('all')
                setPriorityFilter('all')
                setAgentFilter('all')
                setSearchTerm('')
              }}
              className="text-xs text-red-600 hover:underline px-2 py-1 font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>

        {selectedLeads.length > 0 ? (
          <button
            onClick={handleBulkAssign}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Users className="h-4 w-4" />
            Bulk Assign ({selectedLeads.length})
          </button>
        ) : (
          <button 
            onClick={() => setShowAddLeadModal(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add New Lead
          </button>
        )}
      </div>

      {/* Leads Table */}
      <div className="flex-1 overflow-hidden mx-6 mb-6 rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="h-full overflow-auto">
          <table className="w-full min-w-350">
            <thead className="sticky top-0 border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedLeads.length === leads.length}
                    onChange={selectAllLeads}
                    className="cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Score
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Company / Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Contact Info
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Value
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Source
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Priority
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  SLA Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Assigned To
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leads.map((lead, index) => (
                <motion.tr
                  key={lead.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`transition hover:bg-gray-50 ${selectedLeads.includes(lead.id) ? 'bg-blue-50' : ''}`}
                >
                  {/* Checkbox */}
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedLeads.includes(lead.id)}
                      onChange={() => toggleLeadSelection(lead.id)}
                      className="cursor-pointer"
                    />
                  </td>

                  {/* Score */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${scoreBadge(lead.score)}`} />
                      <span className="text-sm font-semibold text-gray-900">{lead.score}</span>
                    </div>
                  </td>

                  {/* Company / Contact */}
                  <td className="px-4 py-4">
                    <div>
                      <div className="font-semibold text-gray-900">{lead.name}</div>
                      <div className="text-sm text-gray-500">{lead.contact}</div>
                    </div>
                  </td>

                  {/* Contact Info */}
                  <td className="px-4 py-4">
                    <div className="min-w-50 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{lead.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        <span>{lead.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{lead.location}</span>
                      </div>
                    </div>
                  </td>

                  {/* Value */}
                  <td className="px-4 py-4">
                    <span className="font-bold text-green-600">${lead.value.toLocaleString()}</span>
                  </td>

                  {/* Source */}
                  <td className="px-4 py-4">
                    <span className="rounded-full bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-700 capitalize">
                      {lead.source ? lead.source.replace('_', ' ') : 'manual'}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusBadge(lead.status)}`}>
                      {lead.status}
                    </span>
                  </td>

                  {/* Priority */}
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${priorityBadge(lead.priority)}`}>
                      {lead.priority}
                    </span>
                  </td>

                  {/* SLA Status */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${slaBadge(lead.slaStatus)}`}>
                        {lead.slaStatus === 'pending' && <Clock className="h-3 w-3" />}
                        {lead.slaStatus === 'on-time' && <CheckCircle className="h-3 w-3" />}
                        {lead.slaStatus === 'warning' && <AlertCircle className="h-3 w-3" />}
                        {lead.slaStatus === 'breached' && <AlertCircle className="h-3 w-3" />}
                        {lead.slaHours}h
                      </span>
                    </div>
                  </td>

                  {/* Assigned To */}
                  <td className="px-4 py-4">
                    {lead.assignedTo ? (
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{lead.assignedTo}</div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {new Date(lead.assignedDate).toLocaleDateString()}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm italic text-gray-400">Unassigned</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Call Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCall(lead)
                        }}
                        className="rounded-lg p-1.5 text-blue-600 transition hover:bg-blue-50"
                        title="Call"
                      >
                        <Phone className="h-4 w-4" />
                      </button>

                      {/* Email Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEmail(lead)
                        }}
                        className="rounded-lg p-1.5 text-purple-600 transition hover:bg-purple-50"
                        title="Email"
                      >
                        <Mail className="h-4 w-4" />
                      </button>

                      {/* View Details Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          openDetailModal(lead)
                        }}
                        className="rounded-lg p-1.5 text-gray-600 transition hover:bg-gray-50"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      {/* Edit Lead Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditLead(lead)
                        }}
                        className="rounded-lg p-1.5 text-blue-600 transition hover:bg-blue-50"
                        title="Edit Lead"
                      >
                        <Edit className="h-4 w-4" />
                      </button>

                      {/* Move to Opportunities - Only for Qualified Leads */}
                      {lead.status === 'qualified' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleMoveToOpportunity(lead)
                          }}
                          className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700"
                          title="Move to Opportunities"
                        >
                          <TrendingUp className="mr-1 inline h-3 w-3" />
                          Move
                        </button>
                      )}

                      {/* Assign/Reassign Button */}
                      {!lead.assignedTo ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedLead(lead)
                            setShowAssignModal(true)
                          }}
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                        >
                          <UserPlus className="mr-1 inline h-3 w-3" />
                          Assign
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedLead(lead)
                            setShowAssignModal(true)
                          }}
                          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                        >
                          <RotateCw className="mr-1 inline h-3 w-3" />
                          Reassign
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assignment Modal */}
      <AnimatePresence>
        {showAssignModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">
                  {selectedLead ? `Assign Lead: ${selectedLead.name}` : `Bulk Assign ${selectedLeads.length} Leads`}
                </h2>
                <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-4 space-y-3">
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-blue-900">
                    <RotateCw className="h-4 w-4" />
                    Round Robin Assignment
                  </div>
                  <p className="mt-1 text-xs text-blue-700">
                    System will automatically assign to user with least leads: <strong>{assignLeadRoundRobin()?.name || 'None'}</strong>
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Or manually select user:</label>
                  <div className="grid grid-cols-2 gap-3">
                    {salesUsers.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => setSelectedAgentId(user.id)}
                        className={`flex items-center gap-3 rounded-lg border p-3 text-left transition ${
                          selectedAgentId === user.id
                            ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-100'
                            : 'border-gray-200 bg-white hover:border-blue-500 hover:bg-blue-50'
                        }`}
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-purple-600 text-sm font-bold text-white">
                          {user.avatar}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-500">{user.leads} leads</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAssignSubmit}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Assign Lead(s)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* History Modal */}
      <AnimatePresence>
        {showHistoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl rounded-lg bg-white p-6 shadow-xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Assignment History</h2>
                <button onClick={() => setShowHistoryModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3">
                {assignmentHistory.map((item) => (
                  <div key={item.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        item.action === 'Assigned' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {item.action}
                      </span>
                      <span className="text-xs text-gray-500">{item.date}</span>
                    </div>
                    <div className="text-sm text-gray-900">
                      {item.from ? (
                        <span>From <strong>{item.from}</strong> to <strong>{item.to}</strong></span>
                      ) : (
                        <span>Assigned to <strong>{item.to}</strong></span>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">By: {item.assignedBy}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============= LEAD DETAIL MODAL ============= */}
      <AnimatePresence>
        {showDetailModal && selectedLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex w-full max-w-4xl max-h-[90vh] flex-col overflow-hidden rounded-lg bg-white shadow-xl"
            >
              {/* Detail Modal Header */}
              <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg text-lg font-bold text-white ${
                      selectedLead.score >= 80 ? 'bg-green-500' : selectedLead.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}>
                      {selectedLead.score}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedLead.name}</h2>
                      <p className="text-sm text-gray-500">{selectedLead.contact} • {selectedLead.source}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-sm font-semibold capitalize ${statusBadge(selectedLead.status)}`}>
                      {selectedLead.status}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-sm font-semibold capitalize ${priorityBadge(selectedLead.priority)}`}>
                      {selectedLead.priority} Priority
                    </span>
                    <span className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold ${slaBadge(selectedLead.slaStatus)}`}>
                      {selectedLead.slaStatus === 'pending' && <Clock className="h-3.5 w-3.5" />}
                      {selectedLead.slaStatus === 'on-time' && <CheckCircle className="h-3.5 w-3.5" />}
                      {selectedLead.slaStatus === 'warning' && <AlertCircle className="h-3.5 w-3.5" />}
                      SLA: {selectedLead.slaHours}h
                    </span>
                    <span className="text-lg font-bold text-green-600">${selectedLead.value.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedLead.status !== 'qualified' && selectedLead.status !== 'lost' && (
                    <button 
                      onClick={() => { setShowDetailModal(false); handleMoveToOpportunity(selectedLead) }}
                      className="flex items-center gap-1.5 rounded-lg bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:from-blue-700 hover:to-indigo-700 transition"
                    >
                      <Target className="h-4 w-4" />
                      Qualify Lead
                    </button>
                  )}
                  <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Detail Tabs */}
              <div className="border-b border-gray-200 bg-white px-6">
                <div className="flex gap-6">
                  {['overview', 'activity', 'notes'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setActiveTab(tab)
                        // Refresh activities when switching to activity tab
                        if (tab === 'activity' && selectedLead?.id) {
                          fetchLeadActivities(selectedLead.id)
                        }
                      }}
                      className={`border-b-2 px-1 py-3 text-sm font-semibold capitalize transition ${
                        activeTab === tab
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab === 'overview' && <span className="flex items-center gap-1"><ClipboardList className="h-3.5 w-3.5" /> Overview</span>}
                      {tab === 'activity' && <span className="flex items-center gap-1"><PhoneCall className="h-3.5 w-3.5" /> Activity ({selectedLeadActivities?.length || 0})</span>}
                      {tab === 'notes' && <span className="flex items-center gap-1"><StickyNote className="h-3.5 w-3.5" /> Notes ({selectedLeadNotes?.length || 0})</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Detail Modal Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* === OVERVIEW TAB === */}
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {/* Contact Information */}
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                          <Users className="h-5 w-5 text-blue-600" />
                          Contact Information
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-sm">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-700">{selectedLead.email}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-700">{selectedLead.phone}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-700">{selectedLead.location}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-700">Created: {new Date(selectedLead.created).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Lead Details */}
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                          <Activity className="h-5 w-5 text-green-600" />
                          Lead Details
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Source:</span>
                            <span className="rounded-full bg-purple-100 px-2.5 py-0.5 font-semibold text-purple-700">{selectedLead.source}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Deal Value:</span>
                            <span className="font-bold text-green-600">${selectedLead.value.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Lead Score:</span>
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-16 overflow-hidden rounded-full bg-gray-200">
                                <div className={`h-full rounded-full ${selectedLead.score >= 80 ? 'bg-green-500' : selectedLead.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${selectedLead.score}%` }} />
                              </div>
                              <span className="font-bold text-gray-900">{selectedLead.score}/100</span>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Assigned To:</span>
                            <span className="font-semibold text-gray-900">{selectedLead.assignedTo || 'Unassigned'}</span>
                          </div>
                          {selectedLead.lastActivity && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Last Activity:</span>
                              <span className="font-semibold text-gray-900">{new Date(selectedLead.lastActivity).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* SLA Tracking Section */}
                    <div className={`rounded-lg border p-4 ${
                      selectedLead.slaStatus === 'on-time' ? 'border-green-200 bg-green-50' :
                      selectedLead.slaStatus === 'warning' ? 'border-orange-200 bg-orange-50' :
                      selectedLead.slaStatus === 'breached' ? 'border-red-200 bg-red-50' :
                      'border-gray-200 bg-gray-50'
                    }`}>
                      <h3 className="mb-2 flex items-center gap-2 font-semibold text-gray-900">
                        <Clock className="h-5 w-5" />
                        SLA Tracking
                      </h3>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Status</div>
                          <div className="mt-1 font-bold capitalize">{selectedLead.slaStatus}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Time Remaining</div>
                          <div className="mt-1 font-bold">{selectedLead.slaHours}h</div>
                        </div>
                        <div>
                          <div className="text-gray-600">SLA Limit</div>
                          <div className="mt-1 font-bold">24 hours</div>
                        </div>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            selectedLead.slaStatus === 'on-time' ? 'bg-green-500' :
                            selectedLead.slaStatus === 'warning' ? 'bg-orange-500' :
                            selectedLead.slaStatus === 'breached' ? 'bg-red-500' :
                            'bg-gray-400'
                          }`}
                          style={{ width: `${Math.max(0, Math.min(100, (selectedLead.slaHours / 24) * 100))}%` }}
                        />
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                      <button 
                        onClick={() => { setShowDetailModal(false); handleCall(selectedLead) }}
                        className="flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                      >
                        <Phone className="h-4 w-4" />
                        Call
                      </button>
                      <button 
                        onClick={() => { setShowDetailModal(false); handleEmail(selectedLead) }}
                        className="flex items-center justify-center gap-2 rounded-lg border border-purple-200 bg-purple-50 p-3 text-sm font-semibold text-purple-700 transition hover:bg-purple-100"
                      >
                        <Mail className="h-4 w-4" />
                        Email
                      </button>
                      <button 
                        onClick={() => { setShowDetailModal(false); handleMeeting(selectedLead) }}
                        className="flex items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm font-semibold text-green-700 transition hover:bg-green-100"
                      >
                        <Video className="h-4 w-4" />
                        Schedule Meeting
                      </button>
                      {selectedLead.status !== 'qualified' && selectedLead.status !== 'lost' && (
                        <button 
                          onClick={() => { setShowDetailModal(false); handleMoveToOpportunity(selectedLead) }}
                          className="flex items-center justify-center gap-2 rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm font-semibold text-orange-700 transition hover:bg-orange-100"
                        >
                          <Target className="h-4 w-4" />
                          Qualify Lead (BANT)
                        </button>
                      )}
                      {selectedLead.status !== 'qualified' && (
                        <button
                          onClick={() => handleEditLead(selectedLead)}
                          className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                        >
                          <Edit className="h-4 w-4" />
                          Edit Lead
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* === ACTIVITY TAB === */}
                {activeTab === 'activity' && (
                  <div className="space-y-4">
                    {/* Add Activity Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => { setShowDetailModal(false); handleCall(selectedLead) }}
                        className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                      >
                        <Phone className="h-3.5 w-3.5" /> Log Call
                      </button>
                      <button 
                        onClick={() => { setShowDetailModal(false); handleEmail(selectedLead) }}
                        className="flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-xs font-semibold text-purple-700 transition hover:bg-purple-100"
                      >
                        <Mail className="h-3.5 w-3.5" /> Log Email
                      </button>
                      <button 
                        onClick={() => { setShowDetailModal(false); handleMeeting(selectedLead) }}
                        className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 transition hover:bg-green-100"
                      >
                        <Video className="h-3.5 w-3.5" /> Log Meeting
                      </button>
                    </div>

                    {/* Activity Timeline */}
                    {selectedLeadActivities && selectedLeadActivities.length > 0 ? (
                      <div className="relative space-y-4 pl-8">
                        {/* Timeline Line */}
                        <div className="absolute left-3 top-2 h-[calc(100%-20px)] w-0.5 bg-gray-200" />

                        {selectedLeadActivities.map((activity) => (
                          <div key={activity.id} className="relative">
                            {/* Timeline Dot */}
                            <div className="absolute -left-8 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white border-2 border-gray-200">
                              {activityIcon(activity.activity_type)}
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-white p-4">
                              <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                  <div className="font-semibold text-gray-900">{activity.subject}</div>
                                  {activity.body && (
                                    <p className="text-sm text-gray-600 bg-gray-50 rounded p-2 border border-gray-100 whitespace-pre-wrap">{activity.body}</p>
                                  )}
                                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {activity.completed_at ? new Date(activity.completed_at).toLocaleString() : 
                                       activity.scheduled_at ? new Date(activity.scheduled_at).toLocaleString() :
                                       activity.created_at ? new Date(activity.created_at).toLocaleString() : 'N/A'}
                                    </span>
                                    <span>•</span>
                                    <span>By {activity.created_by_name || 'Sales Team'}</span>
                                    {activity.duration && (
                                      <>
                                        <span>•</span>
                                        <span>{activity.duration}</span>
                                      </>
                                    )}
                                    {activity.outcome && (
                                      <>
                                        <span>•</span>
                                        <span className="font-semibold text-blue-600">{activity.outcome}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                                  activity.activity_type === 'call' ? 'bg-blue-100 text-blue-700' :
                                  activity.activity_type === 'email' ? 'bg-purple-100 text-purple-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                  {activity.activity_type}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center text-gray-500">
                        <Activity className="mx-auto mb-2 h-10 w-10 text-gray-300" />
                        <p className="font-semibold">No activities yet</p>
                        <p className="mt-1 text-sm">Use the buttons above to log your first activity</p>
                      </div>
                    )}
                  </div>
                )}

                {/* === NOTES TAB === */}
                {activeTab === 'notes' && (
                  <div className="space-y-4">
                    {/* Add Note Input */}
                    <div className="rounded-lg border border-gray-200 bg-white p-4">
                      <textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Add a note about this lead..."
                        rows={3}
                        className="w-full resize-none rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                      <div className="mt-2 flex justify-end">
                        <button 
                          onClick={handleSaveNote}
                          disabled={loading || !noteText.trim()}
                          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                        >
                          <Send className="h-4 w-4" />
                          {loading ? 'Saving...' : 'Save Note'}
                        </button>
                      </div>
                    </div>

                    {/* Notes List */}
                    {selectedLeadNotes && selectedLeadNotes.length > 0 ? (
                      selectedLeadNotes.map((note) => (
                        <div key={note.id} className="rounded-lg border border-gray-200 bg-amber-50 p-4">
                          <div className="mb-2 text-sm text-gray-900 whitespace-pre-wrap">{note.body || note.subject}</div>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {note.completed_at ? new Date(note.completed_at).toLocaleString() : 
                               note.created_at ? new Date(note.created_at).toLocaleString() : 'N/A'}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center text-gray-500">
                        <MessageSquare className="mx-auto mb-2 h-10 w-10 text-gray-300" />
                        <p className="font-semibold">No notes yet</p>
                        <p className="mt-1 text-sm">Add your first note above</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Detail Modal Footer */}
              <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 p-4">
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleMarkLost(selectedLead)}
                    className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                    Mark as Lost
                  </button>
                  <button 
                    onClick={() => handleDeleteLead(selectedLead.id)}
                    className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Lead
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Close
                  </button>
                  {selectedLead.status !== 'qualified' && selectedLead.status !== 'lost' && (
                    <button 
                      onClick={() => { setShowDetailModal(false); handleMoveToOpportunity(selectedLead) }}
                      className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
                    >
                      <Target className="h-4 w-4" />
                      Qualify Lead
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============= CALL MODAL ============= */}
      <AnimatePresence>
        {showCallModal && selectedLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                  <Phone className="h-5 w-5 text-blue-600" />
                  Log Call - {selectedLead.name}
                </h2>
                <button onClick={() => setShowCallModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Contact Info */}
              <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-blue-900">
                  <Phone className="h-4 w-4" />
                  {selectedLead.phone}
                </div>
                <p className="mt-1 text-xs text-blue-700">Contact: {selectedLead.contact}</p>
              </div>

              {/* Call Form */}
              <form onSubmit={handleCallSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Call Outcome</label>
                  <select 
                    value={callFormData.outcome}
                    onChange={(e) => setCallFormData(prev => ({ ...prev, outcome: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  >
                    <option>Connected - Interested</option>
                    <option>Connected - Not Interested</option>
                    <option>Connected - Follow Up Needed</option>
                    <option>Voicemail Left</option>
                    <option>No Answer</option>
                    <option>Wrong Number</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Duration</label>
                  <select 
                    value={callFormData.duration}
                    onChange={(e) => setCallFormData(prev => ({ ...prev, duration: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  >
                    <option>5 mins</option>
                    <option>10 mins</option>
                    <option>15 mins</option>
                    <option>20 mins</option>
                    <option>25 mins</option>
                    <option>30 mins</option>
                    <option>45 mins</option>
                    <option>60+ mins</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Notes</label>
                  <textarea 
                    rows={3}
                    value={callFormData.notes}
                    onChange={(e) => setCallFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="What was discussed..."
                    className="w-full resize-none rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Next Action</label>
                  <select 
                    value={callFormData.nextAction}
                    onChange={(e) => setCallFormData(prev => ({ ...prev, nextAction: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  >
                    <option>Follow up call</option>
                    <option>Send email</option>
                    <option>Schedule demo</option>
                    <option>Send proposal</option>
                    <option>No action needed</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCallModal(false)}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Save Call Log
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============= MEETING MODAL ============= */}
      <AnimatePresence>
        {showMeetingModal && selectedLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                  <Video className="h-5 w-5 text-green-600" />
                  Log Meeting - {selectedLead.name}
                </h2>
                <button onClick={() => setShowMeetingModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Contact Info */}
              <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-green-900">
                  <Video className="h-4 w-4" />
                  {selectedLead.email}
                </div>
                <p className="mt-1 text-xs text-green-700">Contact: {selectedLead.contact}</p>
              </div>

              {/* Meeting Form */}
              <form onSubmit={handleMeetingSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Meeting Topic / Subject</label>
                  <input
                    type="text"
                    required
                    value={meetingFormData.subject}
                    onChange={(e) => setMeetingFormData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="e.g., Product Demonstration, Requirements Gathering"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Duration</label>
                  <select 
                    value={meetingFormData.duration}
                    onChange={(e) => setMeetingFormData(prev => ({ ...prev, duration: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-green-500"
                  >
                    <option>15 mins</option>
                    <option>30 mins</option>
                    <option>45 mins</option>
                    <option>60 mins</option>
                    <option>90 mins</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Meeting Notes</label>
                  <textarea 
                    rows={4}
                    value={meetingFormData.notes}
                    onChange={(e) => setMeetingFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Key discussions, feedback from the meeting, and decisions..."
                    className="w-full resize-none rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowMeetingModal(false)}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
                  >
                    Save Meeting Log
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============= EMAIL MODAL ============= */}
      <AnimatePresence>
        {showEmailModal && selectedLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl"
            >
              <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
                <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                  <Mail className="h-5 w-5 text-purple-600" />
                  Send Email - {selectedLead.contact || selectedLead.name}
                </h2>
                <button onClick={() => setShowEmailModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Email Form */}
              <form onSubmit={handleSendEmailSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">To</label>
                  <input 
                    type="email" 
                    value={selectedLead.email}
                    readOnly
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none text-gray-500 font-medium"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Template</label>
                  <select 
                    value={emailFormData.template}
                    onChange={handleTemplateChange}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                  >
                    <option value="">Select template (optional)</option>
                    <option value="Introduction Email">Introduction Email</option>
                    <option value="Follow Up - After Call">Follow Up - After Call</option>
                    <option value="Product Demo Invite">Product Demo Invite</option>
                    <option value="Proposal Submission">Proposal Submission</option>
                    <option value="Meeting Confirmation">Meeting Confirmation</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Subject <span className="text-red-500">*</span></label>
                  <input 
                    type="text"
                    required
                    value={emailFormData.subject}
                    onChange={(e) => setEmailFormData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Email subject line..."
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Message <span className="text-red-500">*</span></label>
                  <textarea 
                    rows={6}
                    required
                    value={emailFormData.message}
                    onChange={(e) => setEmailFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Write your email message..."
                    className="w-full resize-none rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>

                {/* Attached Files Preview */}
                {emailFormData.attachments?.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {emailFormData.attachments.map((file, idx) => (
                      <span key={idx} className="flex items-center gap-1.5 rounded-lg bg-purple-50 border border-purple-200 px-3 py-1.5 text-xs text-purple-800">
                        <Paperclip className="h-3.5 w-3.5 text-purple-600" />
                        <span className="max-w-[180px] truncate font-medium">{file.filename}</span>
                        <span className="text-[10px] text-purple-500">({(file.size / 1024).toFixed(0)} KB)</span>
                        <button
                          type="button"
                          onClick={() => removeAttachment(idx)}
                          className="ml-1 text-purple-400 hover:text-red-500 font-bold"
                          title="Remove attachment"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      ref={emailFileInputRef}
                      onChange={handleFileAttach}
                      multiple
                      className="hidden"
                    />
                    <button 
                      type="button" 
                      onClick={() => emailFileInputRef.current?.click()}
                      className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-100"
                    >
                      <Paperclip className="h-3.5 w-3.5" />
                      Attach File
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowEmailModal(false)}
                      className="rounded-lg border border-gray-200 bg-white px-5 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2 text-sm font-bold text-white shadow-md transition hover:bg-purple-700 disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                      {loading ? 'Sending...' : 'Send Email'}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add / Edit Lead Modal */}
      <AddLeadModal
        isOpen={showAddLeadModal}
        onClose={() => {
          setShowAddLeadModal(false)
          setEditingLead(null)
        }}
        editLead={editingLead}
        onSuccess={() => {
          fetchData()
        }}
      />

      {/* Qualify Lead Modal */}
      <AnimatePresence>
        {showQualifyModal && selectedLead && (() => {
          const getPts = (opt) => {
            const m = (opt || '').match(/\((\d+)\s*pts\)/)
            return m ? parseInt(m[1]) : 0
          }
          const currentBantScore = getPts(qualifyFormData.budget) + getPts(qualifyFormData.authority) + getPts(qualifyFormData.need) + getPts(qualifyFormData.timeline)

          const bantFields = [
            {
              category: 'Budget (B)',
              label: 'Budget Status',
              field: 'budget',
              options: [
                'No budget allocated (0 pts)',
                'Budget planned (10 pts)',
                'Approved ₹1L-5L (15 pts)',
                'Confirmed ₹5L-10L (20 pts)',
                'Confirmed >₹10L (25 pts)',
              ],
              icon: Banknote,
              color: 'text-green-600',
              bgColor: 'bg-green-50/50',
              borderColor: 'focus:border-green-500 focus:ring-green-100',
            },
            {
              category: 'Authority (A)',
              label: 'Decision Making Power',
              field: 'authority',
              options: [
                'No authority (0 pts)',
                'Influencer (10 pts)',
                'Manager (recommends) (15 pts)',
                'Decision Maker (20 pts)',
                'C-Level Final Approver (25 pts)',
              ],
              icon: Briefcase,
              color: 'text-blue-600',
              bgColor: 'bg-blue-50/50',
              borderColor: 'focus:border-blue-500 focus:ring-blue-100',
            },
            {
              category: 'Need (N)',
              label: 'Pain Point Severity',
              field: 'need',
              options: [
                'Nice to have (0 pts)',
                'Operational inefficiency (10 pts)',
                'Moderate pain point (15 pts)',
                'Critical pain point (20 pts)',
                'Business blocker (25 pts)',
              ],
              icon: Target,
              color: 'text-purple-600',
              bgColor: 'bg-purple-50/50',
              borderColor: 'focus:border-purple-500 focus:ring-purple-100',
            },
            {
              category: 'Timeline (T)',
              label: 'Purchase Timeline',
              field: 'timeline',
              options: [
                'No timeline / exploring (0 pts)',
                'Within 6-12 months (10 pts)',
                'Within 3-6 months (15 pts)',
                'Within 2 months (20 pts)',
                'Urgent / immediate (25 pts)',
              ],
              icon: Clock,
              color: 'text-amber-600',
              bgColor: 'bg-amber-50/50',
              borderColor: 'focus:border-amber-500 focus:ring-amber-100',
            },
          ]

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
              >
                {/* Header */}
                <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">BANT Qualification Form</h2>
                    <p className="text-sm text-gray-500">Qualify lead "{selectedLead.name}" to generate opportunity</p>
                  </div>
                  <button onClick={() => setShowQualifyModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleQualifySubmit} className="space-y-6">
                  {/* Dynamic Score display */}
                  <div className="flex items-center gap-6 rounded-xl bg-linear-to-r from-blue-50 to-indigo-50 p-5 border border-blue-100/50 shadow-xs">
                    <div className="text-center bg-white px-5 py-3 rounded-lg shadow-xs border border-blue-100/30">
                      <div className="text-5xl font-black text-blue-600 leading-none">{currentBantScore}</div>
                      <div className="mt-1 text-[10px] uppercase tracking-wider font-bold text-slate-500">BANT Score</div>
                    </div>
                    <div className="flex-1">
                      <div className="mb-2 text-xs font-semibold text-slate-700 flex justify-between">
                        <span>Qualification Progress</span>
                        <span>{currentBantScore}% / 100%</span>
                      </div>
                      <div className="h-3.5 w-full overflow-hidden rounded-full bg-slate-200">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${currentBantScore}%` }}
                          transition={{ duration: 0.4 }}
                          className={`h-full rounded-full bg-linear-to-r ${
                            currentBantScore >= 60 ? 'from-green-500 to-emerald-600' : 'from-blue-500 to-indigo-600'
                          }`}
                        />
                      </div>
                      <div className="mt-2 text-xs text-slate-600 font-medium">
                        {currentBantScore >= 60 ? (
                          <span className="flex items-center gap-1 text-green-600 font-bold">
                            ✓ Score &ge; 60 = Qualified — Lead automatically move hoti hai "Qualified" stage mein & opportunity generate hogi!
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-600 font-bold">
                            Score &lt; 60 = Not Qualified — Needs more qualification or nurturing
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* BANT Fields Grid */}
                  <div className="grid gap-4 md:grid-cols-2">
                    {bantFields.map((field, idx) => {
                      const Icon = field.icon
                      return (
                        <div key={idx} className={`rounded-xl border border-slate-100 p-4 ${field.bgColor}`}>
                          <div className="mb-3 flex items-center gap-2">
                            <Icon className={`h-5 w-5 shrink-0 ${field.color}`} />
                            <div>
                              <h3 className={`text-xs font-bold uppercase tracking-wide ${field.color}`}>{field.category}</h3>
                              <p className="text-xs text-slate-500 font-semibold">{field.label}</p>
                            </div>
                          </div>
                          <select
                            value={qualifyFormData[field.field]}
                            onChange={(e) => setQualifyFormData(prev => ({ ...prev, [field.field]: e.target.value }))}
                            className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-offset-1 ${field.borderColor}`}
                          >
                            {field.options.map((option, oIdx) => (
                              <option key={oIdx} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>
                      )
                    })}
                  </div>

                  {/* Additional Input Fields */}
                  <div className="grid gap-4 md:grid-cols-2 pt-2">
                    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                      <label className="mb-2 block text-xs font-bold text-slate-700 uppercase tracking-wide">
                        Budget Details (Optional)
                      </label>
                      <textarea
                        rows={3}
                        value={qualifyFormData.budget_notes}
                        onChange={(e) => setQualifyFormData(prev => ({ ...prev, budget_notes: e.target.value }))}
                        placeholder="Budget source, approval processes, constraints..."
                        className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none transition"
                      />
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                      <label className="mb-2 block text-xs font-bold text-slate-700 uppercase tracking-wide">
                        Qualification Notes <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={qualifyFormData.qualification_notes}
                        onChange={(e) => setQualifyFormData(prev => ({ ...prev, qualification_notes: e.target.value }))}
                        placeholder="Key insights from qualification call, authority hierarchy..."
                        className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none transition"
                      />
                    </div>
                  </div>

                  {/* Technical Scope */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-gray-700">Estimated Employee Headcount</label>
                      <input
                        type="number"
                        value={qualifyFormData.estimated_headcount}
                        onChange={(e) => setQualifyFormData(prev => ({ ...prev, estimated_headcount: parseInt(e.target.value) || 0 }))}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-gray-700">Current SaaS Solution</label>
                      <input
                        type="text"
                        value={qualifyFormData.current_solution}
                        onChange={(e) => setQualifyFormData(prev => ({ ...prev, current_solution: e.target.value }))}
                        placeholder="e.g. Spreadsheets / Legacy tool"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                      />
                    </div>
                  </div>

                  {/* Info Explanation block */}
                  <div className="rounded-lg bg-blue-50/50 p-4 border border-blue-100/30 flex items-start gap-2.5">
                    <Lightbulb className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-800 font-medium">
                      <strong>BANT Rule:</strong> Score 60% or higher translates to a Qualified lead. Once qualified, an <strong>Opportunity</strong> will be automatically generated with an initial 20% deal probability in your pipeline!
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowQualifyModal(false)}
                      className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-linear-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:from-blue-700 hover:to-indigo-700 transition"
                    >
                      Save BANT Qualification
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )
        })()}
      </AnimatePresence>
    </div>
  )
}

export default LeadsModule
