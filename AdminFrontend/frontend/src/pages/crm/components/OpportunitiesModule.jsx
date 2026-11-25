import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Plus, 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  User, 
  Building2,
  X,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Upload,
  MessageSquare,
  Video,
  Edit,
  Trash2,
  ArrowRight,
  Target,
  Users,
  Briefcase,
  Timer,
  CheckSquare,
  Award,
  Activity,
  Paperclip,
  RotateCw,
} from 'lucide-react'
import crmService from '../../../services/crmService'
import DemoScheduleModal from './DemoScheduleModal'
import DemoCompleteModal from './DemoCompleteModal'

// Helper to normalize backend opportunity to frontend format
const normalizeOpportunity = (item) => {
  const opp = item.opportunity || {}
  const lead = item.lead || {}
  const contactName = `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'N/A'
  
  // Category mapping for Kanban columns
  let category = 'discovery'
  if (opp.stage === 'demo_scheduled') category = 'demoScheduled'
  else if (opp.stage === 'demo_done') category = 'demoCompleted'
  else if (opp.stage === 'proposal_sent') category = 'proposalSent'
  else if (opp.stage === 'negotiation') category = 'negotiation'
  else if (opp.stage === 'won') category = 'closedWon'
  else if (opp.stage === 'lost') category = 'closedLost'
  
  // Calculate days in stage
  const updatedDate = new Date(opp.updated_at || opp.created_at || new Date())
  const daysInStage = Math.max(1, Math.ceil((new Date() - updatedDate) / (1000 * 60 * 60 * 24)))

  let priority = 'medium'
  if (lead.priority === 'hot') priority = 'high'
  else if (lead.priority === 'cold') priority = 'low'
  
  const bant = {
    budget: { confirmed: lead.budget_confirmed || false, value: opp.deal_value || 0, authority: lead.budget_notes || 'N/A' },
    authority: { hasDecisionMaker: lead.authority_confirmed || false, decisionMaker: lead.authority_notes || 'N/A', meetingScheduled: !!opp.demo_date },
    need: { identified: (lead.pain_points || []).length > 0, painPoints: lead.pain_points || [] },
    timeline: { defined: !!lead.timeline, expectedDate: opp.close_date || new Date().toISOString(), urgency: lead.timeline || 'medium' }
  }

  const notes = lead.notes ? [{ id: '1', text: lead.notes, date: lead.updated_at || lead.created_at, by: 'System' }] : []

  return {
    id: opp.id || opp._id,
    leadId: lead.id || lead._id,
    company: lead.company_name || 'N/A',
    contact: contactName,
    email: lead.email || '',
    phone: lead.phone || 'N/A',
    location: lead.region || 'N/A',
    value: opp.deal_value || 0,
    probability: opp.probability_pct || 0,
    daysInStage,
    source: lead.source || 'manual',
    createdDate: opp.created_at || new Date().toISOString(),
    expectedCloseDate: opp.close_date || new Date(Date.now() + 30*24*60*60*1000).toISOString(),
    assignedTo: item.agent_name || 'Unassigned',
    priority,
    bant,
    activities: [],
    notes,
    files: [],
    category,
    rawStage: opp.stage,
    rawOpp: opp,
    rawLead: lead
  }
}

const OpportunitiesModule = () => {
  const [selectedOpportunity, setSelectedOpportunity] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [draggedItem, setDraggedItem] = useState(null)
  
  // Loading & error states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Modals visibility states
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [showDemoModal, setShowDemoModal] = useState(false)
  const [showCompleteDemoModal, setShowCompleteDemoModal] = useState(false)
  const [showProposalModal, setShowProposalModal] = useState(false)
  const [showWonModal, setShowWonModal] = useState(false)
  const [showLostModal, setShowLostModal] = useState(false)

  // Options from backend
  const [plans, setPlans] = useState([])
  const [agents, setAgents] = useState([])

  // Form states
  const [demoFormData, setDemoFormData] = useState({
    demo_type: 'discovery',
    demo_date: '',
    demo_duration: 30,
    demo_meeting_link: '',
    demo_focus_areas: '',
  })

  const [completeDemoFormData, setCompleteDemoFormData] = useState({
    demo_notes: '',
    demo_outcome: 'highly_interested',
    follow_up_date: '',
  })

  const [proposalFormData, setProposalFormData] = useState({
    plan_id: '',
    employees_count: 50,
    contract_duration: 'annual',
    discount_pct: 0,
    template_id: 'default_template',
  })

  const [wonFormData, setWonFormData] = useState({
    contract_signed_date: new Date().toISOString().split('T')[0],
    go_live_date: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
    assigned_csm: '',
    won_reason: '',
    auto_provision_tenant: true,
  })

  const [lostFormData, setLostFormData] = useState({
    lost_reason: 'price',
    competitor_chosen: '',
    lost_notes: '',
    reengage_date: '',
  })

  const [opportunities, setOpportunities] = useState({
    discovery: [],
    demoScheduled: [],
    demoCompleted: [],
    proposalSent: [],
    negotiation: [],
    closedWon: [],
    closedLost: [],
  })

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await crmService.getOpportunities()
      const normalized = data.map(normalizeOpportunity)
      const grouped = {
        discovery: [],
        demoScheduled: [],
        demoCompleted: [],
        proposalSent: [],
        negotiation: [],
        closedWon: [],
        closedLost: [],
      }
      normalized.forEach(opp => {
        if (grouped[opp.category]) {
          grouped[opp.category].push(opp)
        } else {
          grouped.discovery.push(opp)
        }
      })
      setOpportunities(grouped)

      // Refresh selected opportunity in modal if it is open
      if (selectedOpportunity) {
        const updatedSelected = normalized.find(o => o.id === selectedOpportunity.id)
        if (updatedSelected) {
          setSelectedOpportunity(updatedSelected)
        }
      }
    } catch (err) {
      console.error('Error fetching opportunities:', err)
      setError(err.message || 'Failed to load opportunities')
    } finally {
      setLoading(false)
    }
  }

  const fetchOptions = async () => {
    try {
      const activePlans = await crmService.getPlans()
      setPlans(activePlans.plans || [])
      
      const salesAgents = await crmService.getSalesAgents()
      setAgents(salesAgents || [])
      if (salesAgents && salesAgents.length > 0) {
        setWonFormData(prev => ({ ...prev, assigned_csm: salesAgents[0].id }))
      }
    } catch (err) {
      console.error('Error fetching options:', err)
    }
  }

  useEffect(() => {
    fetchData()
    fetchOptions()
  }, [])

  const stages = [
    { id: 'discovery', label: 'Discovery', color: 'blue', count: opportunities.discovery.length },
    { id: 'demoScheduled', label: 'Demo Scheduled', color: 'cyan', count: opportunities.demoScheduled.length },
    { id: 'demoCompleted', label: 'Demo Completed', color: 'teal', count: opportunities.demoCompleted.length },
    { id: 'proposalSent', label: 'Proposal Sent', color: 'purple', count: opportunities.proposalSent.length },
    { id: 'negotiation', label: 'Negotiation', color: 'orange', count: opportunities.negotiation.length },
    { id: 'closedWon', label: 'Closed Won', color: 'green', count: opportunities.closedWon.length },
    { id: 'closedLost', label: 'Closed Lost', color: 'red', count: opportunities.closedLost.length },
  ]

  const stageColors = {
    blue: 'border-blue-500 bg-blue-50',
    cyan: 'border-cyan-500 bg-cyan-50',
    teal: 'border-teal-500 bg-teal-50',
    purple: 'border-purple-500 bg-purple-50',
    orange: 'border-orange-500 bg-orange-50',
    green: 'border-green-500 bg-green-50',
    red: 'border-red-500 bg-red-50',
  }

  const stageBadgeColors = {
    blue: 'bg-blue-500',
    cyan: 'bg-cyan-500',
    teal: 'bg-teal-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
  }

  const probabilityColor = (prob) => {
    if (prob >= 75) return 'text-green-600 bg-green-100'
    if (prob >= 50) return 'text-yellow-600 bg-yellow-100'
    if (prob >= 25) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  const priorityBadge = (priority) => {
    const styles = {
      high: 'bg-red-100 text-red-700 border-red-200',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      low: 'bg-blue-100 text-blue-700 border-blue-200',
    }
    return styles[priority] || 'bg-gray-100 text-gray-700 border-gray-200'
  }

  const getBantScore = (bant) => {
    let score = 0
    if (bant.budget.confirmed) score += 25
    if (bant.authority.hasDecisionMaker) score += 25
    if (bant.need.identified) score += 25
    if (bant.timeline.defined) score += 25
    return score
  }

  const calculateDaysUntilClose = (expectedDate) => {
    const today = new Date()
    const closeDate = new Date(expectedDate)
    const diffTime = closeDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const handleDragStart = (e, opportunity, stageId) => {
    setDraggedItem({ opportunity, fromStage: stageId })
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e, toStageId) => {
    e.preventDefault()
    if (!draggedItem) return

    const { opportunity, fromStage } = draggedItem

    if (fromStage === toStageId) {
      setDraggedItem(null)
      return
    }

    const stageMapping = {
      discovery: 'qualified',
      demoScheduled: 'demo_scheduled',
      demoCompleted: 'demo_done',
      proposalSent: 'proposal_sent',
      negotiation: 'negotiation',
      closedWon: 'won',
      closedLost: 'lost',
    }

    const newBackendStage = stageMapping[toStageId] || 'qualified'

    try {
      await crmService.updateOpportunityStage(opportunity.id, newBackendStage)
      await fetchData()
    } catch (err) {
      console.error('Error updating opportunity stage:', err)
      alert(err.message || 'Failed to update opportunity stage')
    }

    setDraggedItem(null)
  }

  const openDetailModal = (opportunity) => {
    setSelectedOpportunity(opportunity)
    setShowDetailModal(true)
    setActiveTab('overview')
  }

  const activityIcon = (type) => {
    switch(type) {
      case 'call': return <Phone className="h-4 w-4 text-blue-600" />
      case 'email': return <Mail className="h-4 w-4 text-purple-600" />
      case 'meeting': return <Video className="h-4 w-4 text-green-600" />
      default: return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  // Action Submissions
  const handleScheduleDemo = async (payload) => {
    setLoading(true)
    try {
      console.log('Scheduling demo for opportunity:', selectedOpportunity.id)
      console.log('Demo payload:', payload)
      
      await crmService.scheduleDemo(selectedOpportunity.id, payload)
      
      setShowDemoModal(false)
      setShowDetailModal(false)
      await fetchData()
      
      alert('Demo scheduled successfully! Status updated to "demo_scheduled"')
    } catch (err) {
      console.error('Error scheduling demo:', err)
      console.error('Error details:', err.response?.data || err.message)
      alert('Failed to schedule demo: ' + (err.response?.data?.detail || err.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteDemo = async (payload) => {
    setLoading(true)
    try {
      console.log('Completing demo for opportunity:', selectedOpportunity.id)
      console.log('Demo completion payload:', payload)
      
      await crmService.completeDemo(selectedOpportunity.id, payload)
      
      setShowCompleteDemoModal(false)
      setShowDetailModal(false)
      await fetchData()
      
      alert('Demo completed successfully! Next step: Click "Send Proposal" to move to Proposal stage.')
    } catch (err) {
      console.error('Error completing demo:', err)
      console.error('Error details:', err.response?.data || err.message)
      alert('Failed to complete demo: ' + (err.response?.data?.detail || err.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProposal = async (e) => {
    e.preventDefault()
    if (!proposalFormData.plan_id) {
      alert('Please select a plan')
      return
    }
    try {
      await crmService.createProposal(selectedOpportunity.id, proposalFormData)
      setShowProposalModal(false)
      await fetchData()
    } catch (err) {
      alert(err.message || 'Failed to create proposal')
    }
  }

  const handleMarkWon = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...wonFormData,
        won_reason: wonFormData.won_reason.split(',').map(s => s.trim()).filter(Boolean),
      }
      await crmService.markOpportunityWon(selectedOpportunity.id, payload)
      
      // Create client from opportunity
      const clientData = {
        company_name: selectedOpportunity.company,
        contact_name: selectedOpportunity.contact,
        email: selectedOpportunity.email,
        phone: selectedOpportunity.phone,
        location: selectedOpportunity.location,
        deal_value: selectedOpportunity.value,
        opportunity_id: selectedOpportunity.id,
        lead_id: selectedOpportunity.leadId,
        assigned_csm: wonFormData.assigned_csm,
        contract_signed_date: wonFormData.contract_signed_date,
        go_live_date: wonFormData.go_live_date,
        status: 'active',
      }
      await crmService.createClient(clientData)
      
      setShowWonModal(false)
      setShowDetailModal(false)
      await fetchData()
      alert('Deal won! Client created successfully and moved to Clients module.')
    } catch (err) {
      alert(err.message || 'Failed to mark won')
    }
  }

  const handleMarkLost = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...lostFormData,
        reengage_date: lostFormData.reengage_date || null,
      }
      await crmService.markOpportunityLost(selectedOpportunity.id, payload)
      setShowLostModal(false)
      setShowDetailModal(false)
      await fetchData()
    } catch (err) {
      alert(err.message || 'Failed to mark lost')
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#F7F8FA] p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Opportunity Pipeline</h2>
          <p className="text-sm text-gray-500">Drag and drop cards to move opportunities between stages</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => fetchData()}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            <RotateCw className="h-4 w-4" />
            Refresh
          </button>
          {/* <button 
            onClick={() => setShowInfoModal(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Opportunity
          </button> */}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex h-64 items-center justify-center rounded-xl bg-white border shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <RotateCw className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-sm font-medium text-gray-500">Loading pipeline...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex h-64 items-center justify-center rounded-xl bg-red-50 border border-red-200 shadow-sm">
          <div className="flex flex-col items-center gap-3 text-center p-6">
            <AlertCircle className="h-10 w-10 text-red-500" />
            <h3 className="font-bold text-red-900">Failed to Load Opportunities</h3>
            <p className="text-sm text-red-700 max-w-md">{error}</p>
            <button 
              onClick={() => fetchData()}
              className="mt-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      {!loading && !error && (
        <>
          {/* Stats Summary */}
          <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-5">
            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <div className="mb-1 text-xs font-medium text-gray-500">Total Pipeline</div>
              <div className="text-xl font-bold text-gray-900">
                ${((Object.values(opportunities).flat().reduce((sum, opp) => sum + opp.value, 0)) / 1000).toFixed(0)}K
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <div className="mb-1 text-xs font-medium text-gray-500">Opportunities</div>
              <div className="text-xl font-bold text-blue-600">
                {Object.values(opportunities).flat().length}
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <div className="mb-1 text-xs font-medium text-gray-500">Avg Deal Size</div>
              <div className="text-xl font-bold text-green-600">
                ${Object.values(opportunities).flat().length ? ((Object.values(opportunities).flat().reduce((sum, opp) => sum + opp.value, 0)) / Object.values(opportunities).flat().length / 1000).toFixed(0) : 0}K
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <div className="mb-1 text-xs font-medium text-gray-500">High Priority</div>
              <div className="text-xl font-bold text-red-600">
                {Object.values(opportunities).flat().filter(o => o.priority === 'high').length}
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <div className="mb-1 text-xs font-medium text-gray-500">Closing Soon</div>
              <div className="text-xl font-bold text-orange-600">
                {Object.values(opportunities).flat().filter(o => calculateDaysUntilClose(o.expectedCloseDate) <= 7).length}
              </div>
            </div>
          </div>

          <div className="mb-4 flex flex-1 gap-4 overflow-x-auto pb-2">
            {stages.map((stage) => (
              <div 
                key={stage.id} 
                className="flex w-80 shrink-0 flex-col"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                {/* Column Header */}
                <div className={`mb-3 flex items-center justify-between rounded-t-lg border-t-4 ${stageColors[stage.color]} p-3`}>
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${stageBadgeColors[stage.color]}`} />
                    <h3 className="font-semibold text-gray-900">{stage.label}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-700">
                      {stage.count}
                    </span>
                    <span className="text-xs font-semibold text-gray-700">
                      ${(opportunities[stage.id].reduce((sum, opp) => sum + opp.value, 0) / 1000).toFixed(0)}K
                    </span>
                  </div>
                </div>

                {/* Cards Container */}
                <div className="flex max-h-[calc(100vh-400px)] flex-1 flex-col gap-3 overflow-y-auto rounded-b-lg bg-gray-50 p-3">
                  {opportunities[stage.id].map((opp, index) => {
                    const daysUntilClose = calculateDaysUntilClose(opp.expectedCloseDate)
                    const bantScore = getBantScore(opp.bant)

                    return (
                      <motion.div
                        key={opp.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        draggable
                        onDragStart={(e) => handleDragStart(e, opp, stage.id)}
                        onClick={() => openDetailModal(opp)}
                        className={`cursor-pointer rounded-lg border p-4 shadow-sm transition hover:shadow-md ${
                          opp.rawStage === 'won' ? 'border-green-300 bg-green-50/50' : 
                          opp.rawStage === 'lost' ? 'border-red-200 bg-red-50/30' : 'border-gray-200 bg-white'
                        }`}
                      >
                        {/* Header: Company & Priority */}
                        <div className="mb-3 flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-gray-400" />
                              <h4 className="font-semibold text-gray-900">{opp.company}</h4>
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                              <User className="h-3 w-3" />
                              {opp.contact}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1.5">
                            <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold uppercase ${priorityBadge(opp.priority)}`}>
                              {opp.priority}
                            </span>
                            {opp.rawStage === 'won' && (
                              <span className="rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                                Won
                              </span>
                            )}
                            {opp.rawStage === 'lost' && (
                              <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                                Lost
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Value & Probability */}
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="text-lg font-bold text-green-600">
                              ${opp.value.toLocaleString()}
                            </span>
                          </div>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${probabilityColor(opp.probability)}`}>
                            {opp.probability}%
                          </span>
                        </div>

                        {/* Win Probability Bar */}
                        <div className="mb-3">
                          <div className="mb-1 flex items-center justify-between text-xs">
                            <span className="font-medium text-gray-600">Win Probability</span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
                            <div
                              className="h-full rounded-full bg-linear-to-r from-blue-500 to-green-500 transition-all"
                              style={{ width: `${opp.probability}%` }}
                            />
                          </div>
                        </div>

                        {/* BANT Score */}
                        <div className="mb-3 flex items-center justify-between rounded-lg bg-blue-50 p-2">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-blue-600" />
                            <span className="text-xs font-semibold text-blue-900">BANT Score</span>
                          </div>
                          <span className="text-sm font-bold text-blue-600">{bantScore}%</span>
                        </div>

                        {/* Expected Close Date */}
                        <div className="mb-3 flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-2">
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Close Date</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {daysUntilClose <= 7 && (
                              <AlertCircle className="h-3.5 w-3.5 text-orange-500" />
                            )}
                            <span className={`text-xs font-semibold ${daysUntilClose <= 7 ? 'text-orange-600' : 'text-gray-700'}`}>
                              {daysUntilClose > 0 ? `${daysUntilClose}d` : 'Overdue'}
                            </span>
                          </div>
                        </div>

                        {/* Assigned To */}
                        <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            <span>{opp.assignedTo}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            <span>Stage: <span className="font-semibold text-gray-700 capitalize">{opp.rawStage.replace('_', ' ')}</span></span>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add Opportunity Info Modal */}
      <AnimatePresence>
        {showInfoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
            >
              <div className="mb-4 flex items-center justify-between border-b pb-3">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Adding Opportunities
                </h3>
                <button onClick={() => setShowInfoModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  In this CRM workflow, opportunities are created automatically when a lead successfully passes BANT qualification.
                </p>
                <div className="rounded-lg bg-blue-50 p-3 text-blue-900 border border-blue-100">
                  <strong>How to create an opportunity:</strong>
                  <ol className="mt-2 ml-4 list-decimal space-y-1.5 text-xs text-blue-800">
                    <li>Navigate to the <strong>Leads</strong> module from the sidebar.</li>
                    <li>Click on an active lead to open its details.</li>
                    <li>Click <strong>Qualify Lead</strong> in the top action bar.</li>
                    <li>Fill out the BANT (Budget, Authority, Need, Timeline) score. If the score is 60% or higher, the lead automatically qualifies and an opportunity will be generated in this pipeline!</li>
                  </ol>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={() => setShowInfoModal(false)}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Understood
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Opportunity Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedOpportunity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-lg bg-white shadow-xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-6 w-6 text-blue-600" />
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedOpportunity.company}</h2>
                      <p className="text-sm text-gray-500">{selectedOpportunity.contact} • {selectedOpportunity.email}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="flex items-center gap-1 text-2xl font-bold text-green-600">
                      <DollarSign className="h-6 w-6" />
                      ${selectedOpportunity.value.toLocaleString()}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-sm font-semibold ${probabilityColor(selectedOpportunity.probability)}`}>
                      {selectedOpportunity.probability}% Win Rate
                    </span>
                    <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${priorityBadge(selectedOpportunity.priority)}`}>
                      {selectedOpportunity.priority} Priority
                    </span>
                    <span className="rounded-full bg-blue-100 text-blue-800 px-3 py-1 text-sm font-semibold capitalize">
                      Stage: {selectedOpportunity.rawStage.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 bg-white px-6">
                <div className="flex gap-6">
                  {['overview', 'bant', 'activity', 'notes', 'files'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`border-b-2 px-1 py-3 text-sm font-semibold capitalize transition ${
                        activeTab === tab
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Content */}
              <div className="max-h-[calc(90vh-250px)] overflow-y-auto p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    {/* Flow controls */}
                    <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                      <h4 className="font-bold text-blue-900 mb-2 text-sm flex items-center gap-1.5">
                        <TrendingUp className="h-4 w-4" />
                        Stage-Specific Workflow Actions
                      </h4>
                      <div className="flex flex-wrap gap-2.5">
                        {selectedOpportunity.rawStage === 'qualified' && (
                          <button
                            onClick={() => {
                              setDemoFormData(prev => ({ ...prev, demo_meeting_link: `https://meet.google.com/xyz-${Math.random().toString(36).substring(7)}` }))
                              setShowDemoModal(true)
                            }}
                            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition"
                          >
                            <Calendar className="h-3.5 w-3.5" />
                            Schedule Product Demo
                          </button>
                        )}
                        {selectedOpportunity.rawStage === 'demo_scheduled' && (
                          <button
                            onClick={() => setShowCompleteDemoModal(true)}
                            className="flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-xs font-bold text-white hover:bg-green-700 transition"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            Log Demo Outcome
                          </button>
                        )}
                        {selectedOpportunity.rawStage === 'demo_done' && (
                          <button
                            onClick={() => setShowProposalModal(true)}
                            className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700 transition"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            Send Proposal
                          </button>
                        )}
                        {selectedOpportunity.rawStage === 'proposal_sent' && (
                          <button
                            onClick={() => {
                              setProposalFormData(prev => ({ ...prev }))
                              setShowProposalModal(true)
                            }}
                            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            Move to Negotiation
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Contact Information */}
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <h3 className="mb-3 font-semibold text-gray-900">Contact Information</h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-700">{selectedOpportunity.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-700">{selectedOpportunity.phone}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-700">{selectedOpportunity.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-700">Assigned to: {selectedOpportunity.assignedTo}</span>
                          </div>
                        </div>
                      </div>

                      {/* Deal Timeline */}
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <h3 className="mb-3 font-semibold text-gray-900">Timeline</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Created:</span>
                            <span className="font-semibold text-gray-900">
                              {new Date(selectedOpportunity.createdDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Expected Close:</span>
                            <span className="font-semibold text-gray-900">
                              {new Date(selectedOpportunity.expectedCloseDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Days Until Close:</span>
                            <span className={`font-semibold ${
                              calculateDaysUntilClose(selectedOpportunity.expectedCloseDate) <= 7 
                                ? 'text-orange-600' 
                                : 'text-gray-900'
                            }`}>
                              {calculateDaysUntilClose(selectedOpportunity.expectedCloseDate)} days
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Days in Stage:</span>
                            <span className="font-semibold text-gray-900">{selectedOpportunity.daysInStage} days</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* BANT Quick Status */}
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="font-semibold text-blue-900">BANT Qualification Score</h3>
                        <span className="text-2xl font-bold text-blue-600">{getBantScore(selectedOpportunity.bant)}%</span>
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        <div className="text-center">
                          <div className={`mb-1 ${selectedOpportunity.bant.budget.confirmed ? 'text-green-600' : 'text-gray-400'}`}>
                            {selectedOpportunity.bant.budget.confirmed ? <CheckCircle className="mx-auto h-6 w-6" /> : <AlertCircle className="mx-auto h-6 w-6" />}
                          </div>
                          <div className="text-xs font-semibold text-gray-700">Budget</div>
                        </div>
                        <div className="text-center">
                          <div className={`mb-1 ${selectedOpportunity.bant.authority.hasDecisionMaker ? 'text-green-600' : 'text-gray-400'}`}>
                            {selectedOpportunity.bant.authority.hasDecisionMaker ? <CheckCircle className="mx-auto h-6 w-6" /> : <AlertCircle className="mx-auto h-6 w-6" />}
                          </div>
                          <div className="text-xs font-semibold text-gray-700">Authority</div>
                        </div>
                        <div className="text-center">
                          <div className={`mb-1 ${selectedOpportunity.bant.need.identified ? 'text-green-600' : 'text-gray-400'}`}>
                            {selectedOpportunity.bant.need.identified ? <CheckCircle className="mx-auto h-6 w-6" /> : <AlertCircle className="mx-auto h-6 w-6" />}
                          </div>
                          <div className="text-xs font-semibold text-gray-700">Need</div>
                        </div>
                        <div className="text-center">
                          <div className={`mb-1 ${selectedOpportunity.bant.timeline.defined ? 'text-green-600' : 'text-gray-400'}`}>
                            {selectedOpportunity.bant.timeline.defined ? <CheckCircle className="mx-auto h-6 w-6" /> : <AlertCircle className="mx-auto h-6 w-6" />}
                          </div>
                          <div className="text-xs font-semibold text-gray-700">Timeline</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* BANT Tab */}
                {activeTab === 'bant' && (
                  <div className="space-y-4">
                    {/* Budget */}
                    <div className="rounded-lg border border-gray-200 bg-white p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                          <DollarSign className="h-5 w-5 text-green-600" />
                          Budget
                        </h3>
                        {selectedOpportunity.bant.budget.confirmed ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-orange-500" />
                        )}
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Confirmed:</span>
                          <span className="font-semibold">{selectedOpportunity.bant.budget.confirmed ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Estimated Deal Value:</span>
                          <span className="font-semibold">${selectedOpportunity.bant.budget.value.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Budget Details:</span>
                          <span className="font-semibold">{selectedOpportunity.bant.budget.authority}</span>
                        </div>
                      </div>
                    </div>

                    {/* Authority */}
                    <div className="rounded-lg border border-gray-200 bg-white p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                          <Users className="h-5 w-5 text-purple-600" />
                          Authority
                        </h3>
                        {selectedOpportunity.bant.authority.hasDecisionMaker ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-orange-500" />
                        )}
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Decision Maker Identified:</span>
                          <span className="font-semibold">{selectedOpportunity.bant.authority.hasDecisionMaker ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Decision Maker Details:</span>
                          <span className="font-semibold">{selectedOpportunity.bant.authority.decisionMaker}</span>
                        </div>
                      </div>
                    </div>

                    {/* Need */}
                    <div className="rounded-lg border border-gray-200 bg-white p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                          <Target className="h-5 w-5 text-blue-600" />
                          Need
                        </h3>
                        {selectedOpportunity.bant.need.identified ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-orange-500" />
                        )}
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Need Identified:</span>
                          <span className="font-semibold">{selectedOpportunity.bant.need.identified ? 'Yes' : 'No'}</span>
                        </div>
                        <div>
                          <span className="mb-1 block text-gray-600">Pain Points:</span>
                          <ul className="ml-4 list-disc space-y-1">
                            {selectedOpportunity.bant.need.painPoints.map((point, idx) => (
                              <li key={idx} className="text-gray-900">{point}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="rounded-lg border border-gray-200 bg-white p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                          <Calendar className="h-5 w-5 text-orange-600" />
                          Timeline
                        </h3>
                        {selectedOpportunity.bant.timeline.defined ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-orange-500" />
                        )}
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Timeline Defined:</span>
                          <span className="font-semibold">{selectedOpportunity.bant.timeline.defined ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Timeline Details:</span>
                          <span className="font-semibold">{selectedOpportunity.bant.timeline.urgency}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Activity Tab */}
                {activeTab === 'activity' && (
                  <div className="space-y-3">
                    {/* Live Demo Status */}
                    {selectedOpportunity.rawOpp.demo_date && (
                      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                        <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-1.5">
                          <Video className="h-4 w-4" />
                          Scheduled Product Demo Details
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div><span className="text-gray-500">Type:</span> <span className="font-semibold text-gray-800 capitalize">{selectedOpportunity.rawOpp.demo_type}</span></div>
                          <div><span className="text-gray-500">Date/Time:</span> <span className="font-semibold text-gray-800">{new Date(selectedOpportunity.rawOpp.demo_date).toLocaleString()}</span></div>
                          <div><span className="text-gray-500">Duration:</span> <span className="font-semibold text-gray-800">{selectedOpportunity.rawOpp.demo_duration} mins</span></div>
                          {selectedOpportunity.rawOpp.demo_meeting_link && (
                            <div><span className="text-gray-500">Meeting Link:</span> <a href={selectedOpportunity.rawOpp.demo_meeting_link} target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold break-all">{selectedOpportunity.rawOpp.demo_meeting_link}</a></div>
                          )}
                        </div>
                        {selectedOpportunity.rawOpp.demo_focus_areas && selectedOpportunity.rawOpp.demo_focus_areas.length > 0 && (
                          <div className="mt-2 text-sm">
                            <span className="text-gray-500">Focus Areas:</span>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {selectedOpportunity.rawOpp.demo_focus_areas.map((f, i) => (
                                <span key={i} className="rounded bg-blue-100 text-blue-800 text-xs px-2 py-0.5 font-medium">{f}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {selectedOpportunity.rawOpp.demo_notes && (
                          <div className="mt-2 text-sm border-t pt-2 border-blue-100">
                            <span className="text-gray-500">Demo Outcome Notes:</span>
                            <p className="mt-1 text-gray-800 italic">{selectedOpportunity.rawOpp.demo_notes}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {selectedOpportunity.activities.map((activity) => (
                      <div key={activity.id} className="flex gap-3 rounded-lg border border-gray-200 bg-white p-4">
                        <div className="shrink-0">
                          {activityIcon(activity.type)}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{activity.description}</div>
                          <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>{activity.date}</span>
                            <span>•</span>
                            <span>By {activity.by}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {!selectedOpportunity.rawOpp.demo_date && (
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center text-gray-500">
                        <Activity className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                        <p>No activity logged yet.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Notes Tab */}
                {activeTab === 'notes' && (
                  <div className="space-y-3">
                    {selectedOpportunity.notes.length > 0 ? (
                      selectedOpportunity.notes.map((note) => (
                        <div key={note.id} className="rounded-lg border border-gray-200 bg-white p-4">
                          <div className="mb-2 text-gray-900">{note.text}</div>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{new Date(note.date).toLocaleDateString()} • {note.by}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center text-gray-500">
                        <MessageSquare className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                        <p>No notes yet</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Files Tab */}
                {activeTab === 'files' && (
                  <div className="space-y-3">
                    {selectedOpportunity.files.length > 0 ? (
                      selectedOpportunity.files.map((file) => (
                        <div key={file.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
                          <div className="flex items-center gap-3">
                            <Paperclip className="h-5 w-5 text-gray-400" />
                            <div>
                              <div className="font-semibold text-gray-900">{file.name}</div>
                              <div className="text-xs text-gray-500">{file.size} • Uploaded {file.uploadedDate}</div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center text-gray-500">
                        <FileText className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                        <p>No files uploaded</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 p-4">
                <div className="flex gap-2">
                  {selectedOpportunity.rawStage !== 'lost' && selectedOpportunity.rawStage !== 'won' && (
                    <button 
                      onClick={() => setShowLostModal(true)}
                      className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                      Mark as Lost
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowDetailModal(false)}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                  {selectedOpportunity.rawStage !== 'won' && selectedOpportunity.rawStage !== 'lost' && (
                    <button 
                      onClick={() => setShowWonModal(true)}
                      className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                    >
                      <Award className="h-4 w-4" />
                      Win Deal
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Schedule Demo Modal - New Component */}
      <AnimatePresence>
        {showDemoModal && selectedOpportunity && (
          <DemoScheduleModal
            opportunity={selectedOpportunity}
            onClose={() => setShowDemoModal(false)}
            onSubmit={handleScheduleDemo}
            loading={loading}
          />
        )}
      </AnimatePresence>

      {/* Complete Demo Modal - New Component */}
      <AnimatePresence>
        {showCompleteDemoModal && selectedOpportunity && (
          <DemoCompleteModal
            opportunity={selectedOpportunity}
            onClose={() => setShowCompleteDemoModal(false)}
            onSubmit={handleCompleteDemo}
            loading={loading}
          />
        )}
      </AnimatePresence>

      {/* Create Proposal Form Modal */}
      <AnimatePresence>
        {showProposalModal && selectedOpportunity && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-60 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl border"
            >
              <div className="mb-4 flex items-center justify-between border-b pb-3">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  Create Contract Proposal
                </h3>
                <button onClick={() => setShowProposalModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleCreateProposal} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Select SaaS Plan</label>
                  <select 
                    required
                    value={proposalFormData.plan_id}
                    onChange={(e) => setProposalFormData(prev => ({ ...prev, plan_id: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm"
                  >
                    <option value="">-- Choose Plan --</option>
                    {plans.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (${(p.price_monthly_usd/100).toFixed(2)}/mo)</option>
                    ))}
                    {plans.length === 0 && (
                      <option value="00000000-0000-0000-0000-000000000000">Standard Plan ($99.00/mo)</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Estimated Employee Headcount</label>
                  <input 
                    type="number"
                    required
                    min="1"
                    value={proposalFormData.employees_count}
                    onChange={(e) => setProposalFormData(prev => ({ ...prev, employees_count: parseInt(e.target.value) }))}
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Contract Duration</label>
                  <select 
                    value={proposalFormData.contract_duration}
                    onChange={(e) => setProposalFormData(prev => ({ ...prev, contract_duration: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="annual">Annual (Save 15%)</option>
                    <option value="2-year">2 Years (Save 25%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Discounts (%)</label>
                  <input 
                    type="number"
                    min="0"
                    max="100"
                    value={proposalFormData.discount_pct}
                    onChange={(e) => setProposalFormData(prev => ({ ...prev, discount_pct: parseFloat(e.target.value) }))}
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm"
                  />
                </div>
                <div className="mt-6 flex justify-end gap-2 border-t pt-3">
                  <button 
                    type="button"
                    onClick={() => setShowProposalModal(false)}
                    className="rounded-lg border px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
                  >
                    Generate Proposal
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Convert to Deal Won Modal */}
      <AnimatePresence>
        {showWonModal && selectedOpportunity && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-60 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl border"
            >
              <div className="mb-4 flex items-center justify-between border-b pb-3">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Award className="h-5 w-5 text-green-600" />
                  Mark Opportunity as Won
                </h3>
                <button onClick={() => setShowWonModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleMarkWon} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Contract Signed Date</label>
                  <input 
                    type="date"
                    required
                    value={wonFormData.contract_signed_date}
                    onChange={(e) => setWonFormData(prev => ({ ...prev, contract_signed_date: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Go Live Date</label>
                  <input 
                    type="date"
                    required
                    value={wonFormData.go_live_date}
                    onChange={(e) => setWonFormData(prev => ({ ...prev, go_live_date: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Assign Customer Success Manager (CSM)</label>
                  <select 
                    required
                    value={wonFormData.assigned_csm}
                    onChange={(e) => setWonFormData(prev => ({ ...prev, assigned_csm: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm"
                  >
                    {agents.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                    {agents.length === 0 && (
                      <option value="00000000-0000-0000-0000-000000000000">Admin User</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Won Reasons (Comma separated)</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Robust product, Pricing transparency, SSO support"
                    value={wonFormData.won_reason}
                    onChange={(e) => setWonFormData(prev => ({ ...prev, won_reason: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm"
                  />
                </div>
                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded border">
                  <input 
                    type="checkbox"
                    id="auto_provision_tenant"
                    checked={wonFormData.auto_provision_tenant}
                    onChange={(e) => setWonFormData(prev => ({ ...prev, auto_provision_tenant: e.target.checked }))}
                    className="rounded text-green-600 focus:ring-green-500"
                  />
                  <label htmlFor="auto_provision_tenant" className="text-xs font-medium text-gray-700 cursor-pointer">
                    Auto-provision active client tenant space instantly
                  </label>
                </div>
                <div className="mt-6 flex justify-end gap-2 border-t pt-3">
                  <button 
                    type="button"
                    onClick={() => setShowWonModal(false)}
                    className="rounded-lg border px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                  >
                    Win Deal 🎉
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mark Lost Modal */}
      <AnimatePresence>
        {showLostModal && selectedOpportunity && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-60 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl border"
            >
              <div className="mb-4 flex items-center justify-between border-b pb-3">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <X className="h-5 w-5 text-red-600" />
                  Mark Opportunity as Lost
                </h3>
                <button onClick={() => setShowLostModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleMarkLost} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Primary Lost Reason</label>
                  <select 
                    value={lostFormData.lost_reason}
                    onChange={(e) => setLostFormData(prev => ({ ...prev, lost_reason: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm"
                  >
                    <option value="price">Price is too high</option>
                    <option value="features_gap">Missing critical features</option>
                    <option value="competitor">Lost to a competitor</option>
                    <option value="budget_frozen">Client budget frozen</option>
                    <option value="no_response">Client stopped responding</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Competitor Chosen (Optional)</label>
                  <input 
                    type="text"
                    placeholder="e.g. Gusto, Rippling, Workday"
                    value={lostFormData.competitor_chosen}
                    onChange={(e) => setLostFormData(prev => ({ ...prev, competitor_chosen: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Lost Notes / Feedbacks</label>
                  <textarea 
                    required
                    placeholder="Describe detail lost reasons or feedback..."
                    value={lostFormData.lost_notes}
                    onChange={(e) => setLostFormData(prev => ({ ...prev, lost_notes: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm h-24 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Re-engage Date (Optional)</label>
                  <input 
                    type="date"
                    value={lostFormData.reengage_date}
                    onChange={(e) => setLostFormData(prev => ({ ...prev, reengage_date: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm"
                  />
                </div>
                <div className="mt-6 flex justify-end gap-2 border-t pt-3">
                  <button 
                    type="button"
                    onClick={() => setShowLostModal(false)}
                    className="rounded-lg border px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                  >
                    Mark Lost
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default OpportunitiesModule
