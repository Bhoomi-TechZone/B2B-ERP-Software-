import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Search, Building2, DollarSign, Calendar, TrendingUp, Mail, Phone,
  MapPin, Award, Activity, Plus, X, Edit, Trash2, Eye, Send,
  MessageSquare, CheckCircle, AlertCircle, Clock, User, Users,
  FileText, Upload, Download, ArrowRight, Briefcase, Star, Shield,
  RefreshCw, AlertTriangle, ThumbsUp, TrendingDown, Paperclip,
  LifeBuoy, Target, Handshake, Receipt, ChevronDown, Filter,
  BarChart2, Zap, Heart, Flag, CheckSquare, Circle
} from 'lucide-react'
import crmService from '../../../services/crmService'
import { useAuth } from '../../../hooks/useAuth'


// ”------------------------------------------------------------------------------------------------------------------------€
// Helpers
// ”------------------------------------------------------------------------------------------------------------------------€
const healthConfig = {
  excellent: { badge: 'bg-green-100 text-green-700 border border-green-200', dot: 'bg-green-500', label: 'Excellent', bar: 'bg-green-500', pct: 95 },
  good:      { badge: 'bg-blue-100 text-blue-700 border border-blue-200',  dot: 'bg-blue-500',  label: 'Good',      bar: 'bg-blue-500',  pct: 70 },
  'at-risk': { badge: 'bg-red-100 text-red-700 border border-red-200',     dot: 'bg-red-500',   label: 'At Risk',   bar: 'bg-red-500',   pct: 30 },
}

const onboardingConfig = {
  completed:    { badge: 'bg-green-100 text-green-700', label: 'Completed' },
  'in-progress':{ badge: 'bg-blue-100 text-blue-700',  label: 'In Progress' },
  stalled:      { badge: 'bg-red-100 text-red-700',     label: 'Stalled' },
}

const renewalConfig = {
  'on-track':     { badge: 'bg-green-100 text-green-700', icon: CheckCircle },
  'in-discussion':{ badge: 'bg-blue-100 text-blue-700',   icon: MessageSquare },
  'at-risk':      { badge: 'bg-red-100 text-red-700',     icon: AlertTriangle },
  early:          { badge: 'bg-gray-100 text-gray-600',   icon: Clock },
}

const ticketPriority = {
  critical: 'bg-red-100 text-red-700',
  high:     'bg-orange-100 text-orange-700',
  medium:   'bg-yellow-100 text-yellow-700',
  low:      'bg-gray-100 text-gray-600',
}
const ticketStatus = {
  open:         'bg-red-50 text-red-700 border border-red-200',
  'in-progress':'bg-yellow-50 text-yellow-700 border border-yellow-200',
  resolved:     'bg-green-50 text-green-700 border border-green-200',
}

const activityIcon = (type) => {
  const cls = 'h-3.5 w-3.5'
  switch (type) {
    case 'call':    return <Phone className={`${cls} text-blue-500`} />
    case 'email':   return <Mail className={`${cls} text-purple-500`} />
    case 'meeting': return <Users className={`${cls} text-green-500`} />
    default:        return <Activity className={`${cls} text-gray-400`} />
  }
}

const daysUntilRenewal = (dateStr) =>
  Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24))

// ”------------------------------------------------------------------------------------------------------------------------€
// Main Component
// ”------------------------------------------------------------------------------------------------------------------------€
const ClientsModule = () => {
  const { user } = useAuth()
  const [clients, setClients]                     = useState([])
  const [loading, setLoading]                     = useState(false)
  const [error, setError]                         = useState(null)
  const [searchTerm, setSearchTerm]               = useState('')
  const [healthFilter, setHealthFilter]           = useState('all')
  const [industryFilter, setIndustryFilter]       = useState('all')
  const [statusFilter, setStatusFilter]           = useState('all')
  const [selectedClient, setSelectedClient]       = useState(null)
  const [showDetailModal, setShowDetailModal]     = useState(false)
  const [showTicketModal, setShowTicketModal]     = useState(false)
  const [showUpsellModal, setShowUpsellModal]     = useState(false)
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [activeTab, setActiveTab]                 = useState('overview')
  const [showAddClientModal, setShowAddClientModal] = useState(false)
  const [addClientSubmitting, setAddClientSubmitting] = useState(false)
  const [addClientError, setAddClientError]       = useState(null)
  const [addClientForm, setAddClientForm]         = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    location: '',
    industry: '',
    deal_value: '',
    currency: 'USD',
    notes: '',
  })
  const [addClientFieldErrors, setAddClientFieldErrors] = useState({})

  // New interactive states
  const [quickNoteText, setQuickNoteText] = useState('')
  const [ticketForm, setTicketForm] = useState({
    title: '',
    priority: 'Medium',
    category: 'Technical Bug',
    description: '',
    assignTo: 'Support Team'
  })
  const [ticketFieldErrors, setTicketFieldErrors] = useState({})
  
  const [upsellForm, setUpsellForm] = useState({
    title: '',
    type: 'Upsell -- Higher Tier',
    status: 'Identified',
    value: '',
    probability: '60',
    notes: ''
  })
  const [upsellFieldErrors, setUpsellFieldErrors] = useState({})
  const [editingUpsellId, setEditingUpsellId] = useState(null)

  const [activityForm, setActivityForm] = useState({
    type: 'Call',
    outcome: 'Positive -- Moving Forward',
    description: '',
    dateTime: new Date().toISOString().substring(0, 16),
    followUp: '',
    updateHealth: false
  })
  const [activityFieldErrors, setActivityFieldErrors] = useState({})

  const [showEditClientModal, setShowEditClientModal] = useState(false)
  const [editClientSubmitting, setEditClientSubmitting] = useState(false)
  const [editClientError, setEditClientError] = useState(null)
  const [editClientFieldErrors, setEditClientFieldErrors] = useState({})
  const [editClientForm, setEditClientForm] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    location: '',
    industry: '',
    deal_value: '',
    currency: 'USD',
    notes: '',
    account_status: 'active'
  })

  // Currency symbol map
  const CURRENCY_SYMBOLS = { USD: '$', EUR: '€', GBP: '£', INR: '₹', AUD: 'A$', CAD: 'C$' }
  const tenantCurrency = user?.tenant?.currency || 'USD'
  const primaryCurrencySymbol = CURRENCY_SYMBOLS[tenantCurrency] || (clients.length > 0 && clients[0].currency ? (CURRENCY_SYMBOLS[clients[0].currency] || '$') : '$')
  const currencySymbol = CURRENCY_SYMBOLS[addClientForm.currency] || primaryCurrencySymbol
  const selectedClientCurrencySymbol = selectedClient ? (CURRENCY_SYMBOLS[selectedClient.currency] || primaryCurrencySymbol) : primaryCurrencySymbol

  // Fetch clients from API
  const fetchClients = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await crmService.getClients()
      // Transform API data to match component expectations
      const transformedClients = data.map(client => {
        const cf = client.custom_fields || {}
        
        // Define default values if not defined in custom_fields
        const onboarding = cf.onboarding || {
          status: 'in-progress',
          completedSteps: 2,
          totalSteps: 6,
          steps: [
            { id: 1, label: 'Kickoff Call', done: true, date: client.created_at ? client.created_at.split('T')[0] : new Date().toISOString().split('T')[0] },
            { id: 2, label: 'System Configuration', done: true, date: client.created_at ? client.created_at.split('T')[0] : new Date().toISOString().split('T')[0] },
            { id: 3, label: 'Data Migration', done: false },
            { id: 4, label: 'Admin Training', done: false },
            { id: 5, label: 'User Acceptance Testing', done: false },
            { id: 6, label: 'Go Live', done: false }
          ]
        }
        
        const dealVal = client.deal_value || 0
        const revenue = {
          current: dealVal,
          lastYear: cf.revenue?.lastYear || Math.round(dealVal * 0.9),
          growth: cf.revenue?.growth || 11,
          breakdown: cf.revenue?.breakdown || [
            { label: 'Implementation Fee', amount: Math.round(dealVal * 0.15), date: client.created_at ? client.created_at.split('T')[0] : new Date().toISOString().split('T')[0] },
            { label: 'Annual Subscription', amount: Math.round(dealVal * 0.85), date: client.created_at ? client.created_at.split('T')[0] : new Date().toISOString().split('T')[0] }
          ]
        }

        const renewal = {
          date: cf.renewal?.date || client.go_live_date || new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
          value: dealVal,
          status: cf.renewal?.status || 'on-track',
          notes: cf.renewal?.notes || client.notes || 'Renewal conversation in progress.'
        }

        const upsell = cf.upsell || []
        const supportTickets = cf.support_tickets || []
        const activities = cf.activities || [
          { id: 1, type: 'email', description: 'Client onboarding details sent', date: client.created_at ? new Date(client.created_at).toLocaleString() : new Date().toLocaleString(), by: 'System' }
        ]
        const notes = cf.notes || []
        const health = cf.health || 'excellent'

        return {
          id: client.id,
          company: client.company_name,
          contact: client.contact_name,
          email: client.email,
          phone: client.phone,
          location: client.location || 'N/A',
          industry: client.industry || 'N/A',
          status: client.account_status || 'active',
          health: health,
          accountManager: cf.account_manager || (user ? user.name : 'Anna Brown'),
          currency: client.currency || 'USD',
          totalRevenue: dealVal,
          dealsWon: cf.deals_won || 1,
          clientSince: client.created_at ? new Date(client.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          lastActivity: client.updated_at ? new Date(client.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          renewalDate: renewal.date,
          renewalValue: renewal.value,
          tags: cf.tags || ['Active Client', client.industry || 'Tech'].filter(Boolean),
          onboarding: onboarding,
          revenue: revenue,
          upsell: upsell,
          renewal: renewal,
          supportTickets: supportTickets,
          activities: activities,
          notes: notes
        }
      })
      setClients(transformedClients)
      
      // Keep selected client updated in case of updates
      setSelectedClient(prev => {
        if (!prev) return null
        const fresh = transformedClients.find(c => c.id === prev.id)
        return fresh || prev
      })
    } catch (err) {
      console.error('Error fetching clients:', err)
      setError(err.message || 'Failed to load clients')
      setClients([])
    } finally {
      setLoading(false)
    }
  }

  // Handle client updates through service
  const handleUpdateClientFields = async (clientId, updatedFields) => {
    try {
      await crmService.updateClient(clientId, updatedFields)
      await fetchClients()
      return true
    } catch (err) {
      console.error('Error updating client fields:', err)
      alert('Failed to update client details: ' + (err.message || err))
      return false
    }
  }


  // ── ONBOARDING INTERACTION ──────────────────────────────────────────
  const handleToggleOnboardingStep = async (stepId) => {
    if (!selectedClient) return
    const currentSteps = selectedClient.onboarding?.steps || []
    const updatedSteps = currentSteps.map(step => {
      if (step.id === stepId) {
        return {
          ...step,
          done: !step.done,
          date: !step.done ? new Date().toISOString().split('T')[0] : null
        }
      }
      return step
    })

    const completedSteps = updatedSteps.filter(s => s.done).length
    const totalSteps = updatedSteps.length
    let status = 'in-progress'
    if (completedSteps === totalSteps) {
      status = 'completed'
    } else if (completedSteps === 0) {
      status = 'stalled'
    }

    const onboardingPayload = {
      custom_fields: {
        onboarding: {
          status,
          completedSteps,
          totalSteps,
          steps: updatedSteps
        }
      }
    }

    await handleUpdateClientFields(selectedClient.id, onboardingPayload)
  }

  // ── SUPPORT TICKETS INTERACTION ─────────────────────────────────────
  const validateTicketField = (name, value) => {
    switch (name) {
      case 'title':
        if (!value.trim()) return 'Issue title is required'
        if (value.trim().length < 3) return 'Must be at least 3 characters'
        return ''
      case 'description':
        if (!value.trim()) return 'Detailed description is required'
        if (value.trim().length < 5) return 'Must be at least 5 characters'
        return ''
      default:
        return ''
    }
  }

  const handleTicketFieldChange = (name, value) => {
    setTicketForm(f => ({ ...f, [name]: value }))
    setTicketFieldErrors(errs => ({ ...errs, [name]: validateTicketField(name, value) }))
  }

  const handleRaiseTicket = async (e) => {
    if (e) e.preventDefault()
    if (!selectedClient) return

    const newErrors = {
      title: validateTicketField('title', ticketForm.title),
      description: validateTicketField('description', ticketForm.description)
    }

    if (Object.values(newErrors).some(err => err)) {
      setTicketFieldErrors(newErrors)
      return
    }

    const newTicket = {
      id: Date.now().toString(),
      title: ticketForm.title.trim(),
      priority: ticketForm.priority.toLowerCase(),
      category: ticketForm.category,
      status: 'open',
      raised: new Date().toISOString(),
      resolved: null,
      by: ticketForm.assignTo,
      description: ticketForm.description.trim()
    }

    const existingTickets = selectedClient.supportTickets || []
    const updatedTickets = [...existingTickets, newTicket]

    // Create an activity entry
    const newActivity = {
      id: 'act_' + Date.now(),
      type: 'activity',
      description: `Raised Support Ticket: ${newTicket.title} (Priority: ${ticketForm.priority})`,
      date: new Date().toLocaleString(),
      by: selectedClient.accountManager || 'Account Manager'
    }
    const existingActivities = selectedClient.activities || []
    const updatedActivities = [newActivity, ...existingActivities]

    const payload = {
      custom_fields: {
        support_tickets: updatedTickets,
        activities: updatedActivities
      }
    }

    const success = await handleUpdateClientFields(selectedClient.id, payload)
    if (success) {
      setShowTicketModal(false)
      // Reset form
      setTicketForm({
        title: '',
        priority: 'Medium',
        category: 'Technical Bug',
        description: '',
        assignTo: 'Support Team'
      })
      setTicketFieldErrors({})
    }
  }

  const handleResolveTicket = async (ticketId) => {
    if (!selectedClient) return
    const existingTickets = selectedClient.supportTickets || []
    const ticketToResolve = existingTickets.find(t => t.id === ticketId)
    if (!ticketToResolve) return

    const updatedTickets = existingTickets.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: 'resolved',
          resolved: new Date().toISOString()
        }
      }
      return t
    })

    const newActivity = {
      id: 'act_' + Date.now(),
      type: 'meeting',
      description: `Resolved Support Ticket: ${ticketToResolve.title}`,
      date: new Date().toLocaleString(),
      by: selectedClient.accountManager || 'Account Manager'
    }
    const existingActivities = selectedClient.activities || []
    const updatedActivities = [newActivity, ...existingActivities]

    const payload = {
      custom_fields: {
        support_tickets: updatedTickets,
        activities: updatedActivities
      }
    }

    await handleUpdateClientFields(selectedClient.id, payload)
  }

  // ── UPSELL INTERACTION ──────────────────────────────────────────────
  const validateUpsellField = (name, value) => {
    switch (name) {
      case 'title':
        if (!value.trim()) return 'Opportunity title is required'
        if (value.trim().length < 3) return 'Must be at least 3 characters'
        return ''
      case 'value':
        if (!value) return 'Value is required'
        if (isNaN(Number(value)) || Number(value) <= 0) return 'Must be a positive number'
        return ''
      case 'probability':
        if (!value) return 'Probability is required'
        const val = Number(value)
        if (isNaN(val) || val < 0 || val > 100) return 'Probability must be between 0 and 100'
        return ''
      default:
        return ''
    }
  }

  const handleUpsellFieldChange = (name, value) => {
    if (name === 'value') {
      const cleaned = value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1')
      setUpsellForm(f => ({ ...f, [name]: cleaned }))
      setUpsellFieldErrors(errs => ({ ...errs, [name]: validateUpsellField(name, cleaned) }))
      return
    }
    if (name === 'probability') {
      const cleaned = value.replace(/[^\d]/g, '')
      setUpsellForm(f => ({ ...f, [name]: cleaned }))
      setUpsellFieldErrors(errs => ({ ...errs, [name]: validateUpsellField(name, cleaned) }))
      return
    }
    setUpsellForm(f => ({ ...f, [name]: value }))
    setUpsellFieldErrors(errs => ({ ...errs, [name]: validateUpsellField(name, value) }))
  }

  const handleAddUpsell = async (e) => {
    if (e) e.preventDefault()
    if (!selectedClient) return

    const newErrors = {
      title: validateUpsellField('title', upsellForm.title),
      value: validateUpsellField('value', upsellForm.value),
      probability: validateUpsellField('probability', upsellForm.probability)
    }

    if (Object.values(newErrors).some(err => err)) {
      setUpsellFieldErrors(newErrors)
      return
    }

    const existingUpsell = selectedClient.upsell || []
    let updatedUpsell = []

    if (editingUpsellId) {
      updatedUpsell = existingUpsell.map(opp => {
        if (opp.id === editingUpsellId) {
          return {
            ...opp,
            title: upsellForm.title.trim(),
            type: upsellForm.type,
            status: upsellForm.status.toLowerCase(),
            value: parseFloat(upsellForm.value) || 0,
            probability: parseInt(upsellForm.probability) || 50,
            notes: upsellForm.notes.trim()
          }
        }
        return opp
      })
    } else {
      const newOpp = {
        id: Date.now().toString(),
        title: upsellForm.title.trim(),
        type: upsellForm.type,
        status: upsellForm.status.toLowerCase(),
        value: parseFloat(upsellForm.value) || 0,
        probability: parseInt(upsellForm.probability) || 50,
        notes: upsellForm.notes.trim(),
        createdDate: new Date().toISOString().split('T')[0]
      }
      updatedUpsell = [...existingUpsell, newOpp]
    }

    // Log Activity
    const newActivity = {
      id: 'act_' + Date.now(),
      type: 'call',
      description: editingUpsellId
        ? `Updated Upsell Opportunity: ${upsellForm.title} (Value: ${currencySymbol}${parseFloat(upsellForm.value).toLocaleString()})`
        : `Identified Upsell Opportunity: ${upsellForm.title} (Valued at ${currencySymbol}${parseFloat(upsellForm.value).toLocaleString()})`,
      date: new Date().toLocaleString(),
      by: selectedClient.accountManager || 'Account Manager'
    }
    const existingActivities = selectedClient.activities || []
    const updatedActivities = [newActivity, ...existingActivities]

    const payload = {
      custom_fields: {
        upsell: updatedUpsell,
        activities: updatedActivities
      }
    }

    const success = await handleUpdateClientFields(selectedClient.id, payload)
    if (success) {
      setShowUpsellModal(false)
      setEditingUpsellId(null)
      setUpsellForm({
        title: '',
        type: 'Upsell -- Higher Tier',
        status: 'Identified',
        value: '',
        probability: '60',
        notes: ''
      })
      setUpsellFieldErrors({})
    }
  }

  const handleDeleteUpsell = async (oppId) => {
    if (!selectedClient) return
    if (!confirm('Are you sure you want to delete this upsell opportunity?')) return

    const existingUpsell = selectedClient.upsell || []
    const oppToDelete = existingUpsell.find(o => o.id === oppId)
    if (!oppToDelete) return

    const updatedUpsell = existingUpsell.filter(o => o.id !== oppId)

    const newActivity = {
      id: 'act_' + Date.now(),
      type: 'call',
      description: `Deleted Upsell Opportunity: ${oppToDelete.title}`,
      date: new Date().toLocaleString(),
      by: selectedClient.accountManager || 'Account Manager'
    }
    const existingActivities = selectedClient.activities || []
    const updatedActivities = [newActivity, ...existingActivities]

    const payload = {
      custom_fields: {
        upsell: updatedUpsell,
        activities: updatedActivities
      }
    }

    await handleUpdateClientFields(selectedClient.id, payload)
  }

  const handlePrepareProposal = async () => {
    if (!selectedClient) return
    const newActivity = {
      id: 'act_' + Date.now(),
      type: 'email',
      description: `Drafted & prepared formal Renewal Proposal (Value: ${CURRENCY_SYMBOLS[selectedClient.revenue?.currency || 'USD'] || '$'}${selectedClient.renewalValue.toLocaleString()})`,
      date: new Date().toLocaleString(),
      by: selectedClient.accountManager || 'Account Manager'
    }
    const existingActivities = selectedClient.activities || []
    const updatedActivities = [newActivity, ...existingActivities]

    const payload = {
      custom_fields: {
        activities: updatedActivities
      }
    }
    
    const success = await handleUpdateClientFields(selectedClient.id, payload)
    if (success) {
      alert('Renewal Proposal prepared and logged successfully!')
    }
  }

  const handleSendRenewalEmail = async () => {
    if (!selectedClient) return
    const newActivity = {
      id: 'act_' + Date.now(),
      type: 'email',
      description: `Sent formal Renewal reminder email to ${selectedClient.email}`,
      date: new Date().toLocaleString(),
      by: selectedClient.accountManager || 'Account Manager'
    }
    const existingActivities = selectedClient.activities || []
    const updatedActivities = [newActivity, ...existingActivities]

    const payload = {
      custom_fields: {
        activities: updatedActivities
      }
    }
    
    const success = await handleUpdateClientFields(selectedClient.id, payload)
    if (success) {
      alert(`Renewal reminder email sent to ${selectedClient.email} successfully!`)
    }
  }

  const handleSendUpsellProposal = async (oppId) => {
    if (!selectedClient) return
    const existingUpsell = selectedClient.upsell || []
    const opp = existingUpsell.find(o => o.id === oppId)
    if (!opp) return

    const updatedUpsell = existingUpsell.map(o => {
      if (o.id === oppId) {
        return {
          ...o,
          status: 'proposed',
          probability: Math.min(o.probability + 15, 90)
        }
      }
      return o
    })

    const newActivity = {
      id: 'act_' + Date.now(),
      type: 'email',
      description: `Sent Proposal for Upsell Opportunity: ${opp.title}`,
      date: new Date().toLocaleString(),
      by: selectedClient.accountManager || 'Account Manager'
    }
    const existingActivities = selectedClient.activities || []
    const updatedActivities = [newActivity, ...existingActivities]

    const payload = {
      custom_fields: {
        upsell: updatedUpsell,
        activities: updatedActivities
      }
    }

    await handleUpdateClientFields(selectedClient.id, payload)
  }

  // ── LOG ACTIVITY INTERACTION ───────────────────────────────────────
  const validateActivityField = (name, value) => {
    switch (name) {
      case 'description':
        if (!value.trim()) return 'Activity description is required'
        if (value.trim().length < 3) return 'Must be at least 3 characters'
        return ''
      case 'dateTime':
        if (!value) return 'Date and time is required'
        return ''
      default:
        return ''
    }
  }

  const handleActivityFieldChange = (name, value) => {
    setActivityForm(f => ({ ...f, [name]: value }))
    setActivityFieldErrors(errs => ({ ...errs, [name]: validateActivityField(name, value) }))
  }

  const handleLogActivitySubmit = async (e) => {
    if (e) e.preventDefault()
    if (!selectedClient) return

    const newErrors = {
      description: validateActivityField('description', activityForm.description),
      dateTime: validateActivityField('dateTime', activityForm.dateTime)
    }

    if (Object.values(newErrors).some(err => err)) {
      setActivityFieldErrors(newErrors)
      return
    }

    const typeLabel = activityForm.type
    let formattedDesc = `${typeLabel}: ${activityForm.description.trim()} (Outcome: ${activityForm.outcome})`
    if (activityForm.followUp) {
      formattedDesc += ` -- Next Follow-up: ${activityForm.followUp}`
    }

    const newActivity = {
      id: 'act_' + Date.now(),
      type: activityForm.type.toLowerCase(),
      description: formattedDesc,
      date: new Date(activityForm.dateTime).toLocaleString(),
      by: selectedClient.accountManager || 'Account Manager'
    }

    const existingActivities = selectedClient.activities || []
    const updatedActivities = [newActivity, ...existingActivities]

    const payload = {
      custom_fields: {
        activities: updatedActivities
      }
    }

    // Explicit relation health score upgrade if check is active
    if (activityForm.updateHealth) {
      let newHealth = selectedClient.health
      if (activityForm.outcome.includes('Positive')) {
        newHealth = selectedClient.health === 'at-risk' ? 'good' : 'excellent'
      } else if (activityForm.outcome.includes('Churn Risk')) {
        newHealth = 'at-risk'
      }
      payload.custom_fields.health = newHealth
    }

    const success = await handleUpdateClientFields(selectedClient.id, payload)
    if (success) {
      setShowActivityModal(false)
      setActivityForm({
        type: 'Call',
        outcome: 'Positive -- Moving Forward',
        description: '',
        dateTime: new Date().toISOString().substring(0, 16),
        followUp: '',
        updateHealth: false
      })
      setActivityFieldErrors({})
    }
  }

  // ── QUICK NOTES ────────────────────────────────────────────────────
  const handleSaveQuickNote = async () => {
    if (!selectedClient || !quickNoteText.trim()) return

    const newNote = {
      id: 'note_' + Date.now(),
      text: quickNoteText.trim(),
      date: new Date().toISOString(),
      by: selectedClient.accountManager || 'Account Manager'
    }

    const existingNotes = selectedClient.notes || []
    const updatedNotes = [newNote, ...existingNotes]

    const payload = {
      custom_fields: {
        notes: updatedNotes
      }
    }

    const success = await handleUpdateClientFields(selectedClient.id, payload)
    if (success) {
      setQuickNoteText('')
    }
  }

  const handleDeleteQuickNote = async (noteId) => {
    if (!selectedClient) return
    if (!confirm('Are you sure you want to delete this note?')) return

    const existingNotes = selectedClient.notes || []
    const updatedNotes = existingNotes.filter(n => n.id !== noteId)

    const payload = {
      custom_fields: {
        notes: updatedNotes
      }
    }

    await handleUpdateClientFields(selectedClient.id, payload)
  }

  // ── RELATIONSHIP AT-RISK TOGGLE ──────────────────────────────────
  const handleToggleAtRisk = async () => {
    if (!selectedClient) return
    const isCurrentlyAtRisk = selectedClient.health === 'at-risk'
    const newHealth = isCurrentlyAtRisk ? 'excellent' : 'at-risk'

    const payload = {
      custom_fields: {
        health: newHealth
      }
    }

    // Add activity trail for this critical alert
    const newActivity = {
      id: 'act_' + Date.now(),
      type: isCurrentlyAtRisk ? 'meeting' : 'call',
      description: isCurrentlyAtRisk
        ? 'Removed Relationship Churn At-Risk Alert Flag'
        : 'Relationship Health flagged as AT-RISK Churn Concern!',
      date: new Date().toLocaleString(),
      by: selectedClient.accountManager || 'Account Manager'
    }
    const existingActivities = selectedClient.activities || []
    payload.custom_fields.activities = [newActivity, ...existingActivities]

    await handleUpdateClientFields(selectedClient.id, payload)
  }

  // ── EDIT ACCOUNT DIALOG ──────────────────────────────────────────
  const validateEditClientField = (name, value) => {
    switch (name) {
      case 'company_name':
        if (!value.trim()) return 'Company name is required'
        if (value.trim().length < 2) return 'Must be at least 2 characters'
        return ''
      case 'contact_name':
        if (!value.trim()) return 'Contact name is required'
        if (!/^[a-zA-Z\s.'-]+$/.test(value.trim())) return 'Only letters, spaces, and . \' - are allowed'
        if (value.trim().length < 2) return 'Must be at least 2 characters'
        return ''
      case 'email':
        if (!value.trim()) return 'Email is required'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Enter a valid email address'
        return ''
      case 'phone':
        if (value && !/^[+\d][\d\s()\-+]{4,18}$/.test(value.trim())) return 'Enter a valid phone number (digits, +, -, spaces, () only)'
        return ''
      case 'deal_value':
        if (value !== '' && (isNaN(Number(value)) || Number(value) < 0)) return 'Enter a valid positive number'
        return ''
      default:
        return ''
    }
  }

  const handleEditClientFieldChange = (name, value) => {
    if (name === 'phone') {
      const cleaned = value.replace(/[^\d+()\-\s]/g, '')
      setEditClientForm(f => ({ ...f, [name]: cleaned }))
      setEditClientFieldErrors(errs => ({ ...errs, [name]: validateEditClientField(name, cleaned) }))
      return
    }
    if (name === 'deal_value') {
      const cleaned = value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1')
      setEditClientForm(f => ({ ...f, [name]: cleaned }))
      setEditClientFieldErrors(errs => ({ ...errs, [name]: validateEditClientField(name, cleaned) }))
      return
    }
    setEditClientForm(f => ({ ...f, [name]: value }))
    setEditClientFieldErrors(errs => ({ ...errs, [name]: validateEditClientField(name, value) }))
  }

  const openEditClientModal = (client) => {
    setEditClientForm({
      company_name: client.company || '',
      contact_name: client.contact || '',
      email: client.email || '',
      phone: client.phone || '',
      location: client.location || '',
      industry: client.industry || '',
      deal_value: client.totalRevenue ? client.totalRevenue.toString() : '',
      currency: client.revenue?.currency || 'USD',
      notes: client.notes?.[0]?.text || '',
      account_status: client.status || 'active'
    })
    setEditClientError(null)
    setEditClientFieldErrors({})
    setShowEditClientModal(true)
  }

  const handleEditClientSubmit = async (e) => {
    if (e) e.preventDefault()
    if (!selectedClient) return

    const fields = ['company_name', 'contact_name', 'email', 'phone', 'deal_value']
    const newErrors = {}
    fields.forEach(f => {
      const err = validateEditClientField(f, editClientForm[f])
      if (err) newErrors[f] = err
    })

    if (Object.keys(newErrors).length > 0) {
      setEditClientFieldErrors(newErrors)
      setEditClientError('Please fix the highlighted errors before submitting.')
      return
    }

    setEditClientSubmitting(true)
    setEditClientError(null)
    try {
      const updatedFields = {
        company_name: editClientForm.company_name.trim(),
        contact_name: editClientForm.contact_name.trim(),
        email: editClientForm.email.trim().toLowerCase(),
        phone: editClientForm.phone.trim(),
        location: editClientForm.location.trim(),
        industry: editClientForm.industry,
        deal_value: parseFloat(editClientForm.deal_value) || 0,
        currency: editClientForm.currency,
        account_status: editClientForm.account_status,
      }

      await crmService.updateClient(selectedClient.id, updatedFields)
      setShowEditClientModal(false)
      await fetchClients()
    } catch (err) {
      console.error('Failed to edit client:', err)
      setEditClientError(err?.message || 'Failed to update client. Please try again.')
    } finally {
      setEditClientSubmitting(false)
    }
  }
  useEffect(() => {
    fetchClients()
  }, [])

  // Derived stats
  const totalRevenue   = clients.reduce((s, c) => s + c.totalRevenue, 0)
  const excellentCount = clients.filter(c => c.health === 'excellent').length
  const atRiskCount    = clients.filter(c => c.health === 'at-risk').length
  const renewalSoon    = clients.filter(c => { const d = daysUntilRenewal(c.renewalDate); return d >= 0 && d <= 90 }).length
  const upsellPipeline = clients.reduce((s, c) => s + c.upsell.reduce((u, o) => u + o.value, 0), 0)
  const openTickets    = clients.reduce((s, c) => s + c.supportTickets.filter(t => t.status !== 'resolved').length, 0)

  // Filtered clients
  const filtered = useMemo(() => clients.filter(c => {
    const q = searchTerm.toLowerCase()
    const matchSearch   = !q || c.company.toLowerCase().includes(q) || c.contact.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q)
    const matchHealth   = healthFilter === 'all' || c.health === healthFilter
    const matchIndustry = industryFilter === 'all' || c.industry === industryFilter
    return matchSearch && matchHealth && matchIndustry
  }), [clients, searchTerm, healthFilter, industryFilter])

  const openDetail = (client) => {
    setSelectedClient(client)
    setActiveTab('overview')
    setShowDetailModal(true)
  }

  const openAddClientModal = () => {
    setAddClientForm({ company_name: '', contact_name: '', email: '', phone: '', location: '', industry: '', deal_value: '', currency: 'USD', notes: '' })
    setAddClientError(null)
    setAddClientFieldErrors({})
    setShowAddClientModal(true)
  }

  // Per-field validation helpers
  const validateAddClientField = (name, value) => {
    switch (name) {
      case 'company_name':
        if (!value.trim()) return 'Company name is required'
        if (value.trim().length < 2) return 'Must be at least 2 characters'
        return ''
      case 'contact_name':
        if (!value.trim()) return 'Contact name is required'
        if (!/^[a-zA-Z\s.'-]+$/.test(value.trim())) return 'Only letters, spaces, and . \' - are allowed'
        if (value.trim().length < 2) return 'Must be at least 2 characters'
        return ''
      case 'email':
        if (!value.trim()) return 'Email is required'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Enter a valid email address'
        return ''
      case 'phone':
        if (value && !/^[+\d][\d\s()\-+]{4,18}$/.test(value.trim())) return 'Enter a valid phone number (digits, +, -, spaces, () only)'
        return ''
      case 'deal_value':
        if (value !== '' && (isNaN(Number(value)) || Number(value) < 0)) return 'Enter a valid positive number'
        return ''
      default:
        return ''
    }
  }

  const handleAddClientFieldChange = (name, value) => {
    // Phone: only allow +, digits, spaces, (), -
    if (name === 'phone') {
      const cleaned = value.replace(/[^\d+()\-\s]/g, '')
      setAddClientForm(f => ({ ...f, [name]: cleaned }))
      setAddClientFieldErrors(errs => ({ ...errs, [name]: validateAddClientField(name, cleaned) }))
      return
    }
    // deal_value: only allow digits and one dot (no letters, no negatives)
    if (name === 'deal_value') {
      const cleaned = value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1') // allow only one dot
      if (cleaned !== '' && parseFloat(cleaned) < 0) return
      setAddClientForm(f => ({ ...f, [name]: cleaned }))
      setAddClientFieldErrors(errs => ({ ...errs, [name]: validateAddClientField(name, cleaned) }))
      return
    }
    setAddClientForm(f => ({ ...f, [name]: value }))
    setAddClientFieldErrors(errs => ({ ...errs, [name]: validateAddClientField(name, value) }))
  }

  const handleAddClient = async (e) => {
    e.preventDefault()
    // Run full validation
    const fields = ['company_name', 'contact_name', 'email', 'phone', 'deal_value']
    const newErrors = {}
    fields.forEach(f => {
      const err = validateAddClientField(f, addClientForm[f])
      if (err) newErrors[f] = err
    })
    if (Object.keys(newErrors).length > 0) {
      setAddClientFieldErrors(newErrors)
      setAddClientError('Please fix the highlighted errors before submitting.')
      return
    }
    setAddClientSubmitting(true)
    setAddClientError(null)
    try {
      await crmService.createClient({
        ...addClientForm,
        deal_value: parseFloat(addClientForm.deal_value) || 0,
        custom_fields: {
          account_manager: user ? user.name : 'Unassigned'
        }
      })
      setShowAddClientModal(false)
      await fetchClients()
    } catch (err) {
      console.error('Failed to add client:', err)
      setAddClientError(err?.message || 'Failed to create client. Please try again.')
    } finally {
      setAddClientSubmitting(false)
    }
  }

  const industries = [...new Set(clients.map(c => c.industry))].sort()

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#F7F8FA]">

      {/* ”--€ Page Header & Stats ”--€ */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
            <p className="mt-0.5 text-sm text-gray-500">Active client accounts, health monitoring &amp; growth</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => fetchClients()}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button
              onClick={openAddClientModal}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />Add Client
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="mt-4 rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-700 flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Loading clients...
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {/* Stats Row */}
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-6">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
            <div className="text-xs font-semibold text-blue-600">Total Clients</div>
            <div className="mt-1 text-xl font-bold text-blue-700">{clients.length}</div>
          </div>
          <div className="rounded-xl border border-purple-200 bg-purple-50 p-3">
            <div className="text-xs font-semibold text-purple-600">Total Revenue</div>
            <div className="mt-1 text-xl font-bold text-purple-700">{primaryCurrencySymbol}{(totalRevenue / 1000000).toFixed(1)}M</div>
          </div>
          <div className="rounded-xl border border-green-200 bg-green-50 p-3">
            <div className="text-xs font-semibold text-green-600">Health: Excellent</div>
            <div className="mt-1 text-xl font-bold text-green-700">{excellentCount}</div>
          </div>
          <div className="rounded-xl border border-red-200 bg-red-50 p-3">
            <div className="text-xs font-semibold text-red-600">At Risk</div>
            <div className="mt-1 text-xl font-bold text-red-700">{atRiskCount}</div>
          </div>
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-3">
            <div className="text-xs font-semibold text-orange-600">Renewals &lt;=90d</div>
            <div className="mt-1 text-xl font-bold text-orange-700">{renewalSoon}</div>
          </div>
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-3">
            <div className="text-xs font-semibold text-yellow-700">Upsell Pipeline</div>
            <div className="mt-1 text-xl font-bold text-yellow-700">{primaryCurrencySymbol}{(upsellPipeline / 1000).toFixed(0)}K</div>
          </div>
        </div>
      </div>

      {/* ”--€ Filters ”--€ */}
      <div className="border-b border-gray-200 bg-white px-6 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients, contacts, industry..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <select value={healthFilter} onChange={e => setHealthFilter(e.target.value)} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500">
            <option value="all">All Health</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="at-risk">At Risk</option>
          </select>
          <select value={industryFilter} onChange={e => setIndustryFilter(e.target.value)} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500">
            <option value="all">All Industries</option>
            {industries.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
          <span className="text-xs text-gray-500">Showing {filtered.length} of {clients.length} clients</span>
        </div>
      </div>

      {/* ”--€ Clients List ”--€ */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* At-Risk Banner */}
        {atRiskCount > 0 && (
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-red-500" />
            <p className="text-sm font-semibold text-red-800">
              {atRiskCount} client{atRiskCount > 1 ? 's are' : ' is'} at-risk -- immediate action required to prevent churn
            </p>
            <button onClick={() => setHealthFilter('at-risk')} className="ml-auto rounded-lg bg-red-600 px-3 py-1 text-xs font-bold text-white hover:bg-red-700">View At-Risk</button>
          </div>
        )}

        {/* Renewals Banner */}
        {renewalSoon > 0 && (
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
            <RefreshCw className="h-5 w-5 shrink-0 text-orange-500" />
            <p className="text-sm font-semibold text-orange-800">
              {renewalSoon} renewal{renewalSoon > 1 ? 's' : ''} due within 90 days -- initiate renewal conversations now
            </p>
          </div>
        )}

        {/* Open Tickets Banner */}
        {openTickets > 0 && (
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3">
            <LifeBuoy className="h-5 w-5 shrink-0 text-yellow-600" />
            <p className="text-sm font-semibold text-yellow-800">
              {openTickets} open support ticket{openTickets > 1 ? 's' : ''} need attention
            </p>
          </div>
        )}

        {/* Client Cards Grid */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {filtered.map((client, i) => {
            const hc = healthConfig[client.health]
            const oc = onboardingConfig[client.onboarding.status]
            const rc = renewalConfig[client.renewal.status]
            const RenewalIcon = rc.icon
            const daysRenewal = daysUntilRenewal(client.renewalDate)
            const clientOpenTickets = client.supportTickets.filter(t => t.status !== 'resolved').length
            const clientCurrencySymbol = CURRENCY_SYMBOLS[client.currency] || '$'

            return (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="group cursor-pointer rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md hover:border-gray-300"
                onClick={() => openDetail(client)}
              >
                {/* Card Header */}
                <div className="p-4 pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${hc.dot}`} />
                        <span className="truncate text-base font-bold text-gray-900">{client.company}</span>
                      </div>
                      <div className="mt-0.5 text-xs text-gray-500">{client.contact} · {client.title}</div>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${hc.badge}`}>{hc.label}</span>
                  </div>

                  {/* Tags */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    <span className="rounded-full bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-700">{client.industry}</span>
                    {client.tags.map(tag => (
                      <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Health Bar */}
                <div className="px-4 pb-3">
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-gray-500">Relationship Health</span>
                    <span className="font-semibold text-gray-700">{hc.pct}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                    <div className={`h-full rounded-full ${hc.bar}`} style={{ width: `${hc.pct}%` }} />
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 divide-x divide-gray-100 border-t border-gray-100">
                  <div className="p-3 text-center">
                    <div className="text-xs text-gray-500">Revenue</div>
                    <div className="mt-0.5 text-sm font-bold text-gray-900">{clientCurrencySymbol}{(client.totalRevenue / 1000).toFixed(0)}K</div>
                  </div>
                  <div className="p-3 text-center">
                    <div className="text-xs text-gray-500">Deals Won</div>
                    <div className="mt-0.5 text-sm font-bold text-gray-900">{client.dealsWon}</div>
                  </div>
                  <div className="p-3 text-center">
                    <div className="text-xs text-gray-500">Since</div>
                    <div className="mt-0.5 text-sm font-bold text-gray-900">{new Date(client.clientSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
                  </div>
                </div>

                {/* Status Chips */}
                <div className="flex flex-wrap items-center gap-1.5 border-t border-gray-100 px-4 py-2.5">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${oc.badge}`}>
                    Onboarding: {oc.label}
                  </span>
                  <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${rc.badge}`}>
                    <RenewalIcon className="h-3 w-3" />
                    {daysRenewal <= 90 && daysRenewal >= 0 ? `Renewal: ${daysRenewal}d` : 'Renewal: ' + new Date(client.renewalDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                  {client.upsell.length > 0 && (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      {client.upsell.length} Upsell
                    </span>
                  )}
                  {clientOpenTickets > 0 && (
                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
                      {clientOpenTickets} Ticket{clientOpenTickets > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between border-t border-gray-100 px-4 py-2.5">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <User className="h-3.5 w-3.5" />
                    {client.accountManager}
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); openDetail(client) }}
                    className="flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                  >
                    <Eye className="h-3 w-3" /> View Account
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-gray-500">
            <Building2 className="mx-auto mb-3 h-12 w-12 text-gray-200" />
            <p className="font-semibold">No clients match your filters</p>
          </div>
        )}
      </div>

      {/* ••••••••••••••••••••••••••••••••••••••••
          CLIENT DETAIL MODAL
      •••••••••••••••••••••••••••••••••••••••• */}
      <AnimatePresence>
        {showDetailModal && selectedClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex w-full max-w-4xl max-h-[92vh] flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
            >
              {/* Header */}
              <div className="border-b border-gray-200 bg-linear-to-r from-gray-900 to-gray-700 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${healthConfig[selectedClient.health].dot}`} />
                      <h2 className="text-xl font-bold text-white">{selectedClient.company}</h2>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${healthConfig[selectedClient.health].badge}`}>
                        {healthConfig[selectedClient.health].label}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-white/70">{selectedClient.contact} · {selectedClient.title} · {selectedClient.location}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <span className="text-2xl font-extrabold text-green-400">{selectedClientCurrencySymbol}{selectedClient.totalRevenue.toLocaleString()}</span>
                      <span className="rounded-lg bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">{selectedClient.industry}</span>
                      <span className="rounded-lg bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">Client since {new Date(selectedClient.clientSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                      {selectedClient.tags.map(t => (
                        <span key={t} className="rounded-lg bg-white/10 px-2 py-0.5 text-xs text-white/70">{t}</span>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => setShowDetailModal(false)} className="text-white/60 hover:text-white">
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 bg-white px-6">
                <div className="flex gap-4 overflow-x-auto">
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'onboarding', label: `Onboarding (${selectedClient.onboarding.completedSteps}/${selectedClient.onboarding.totalSteps})` },
                    { id: 'revenue', label: 'Revenue' },
                    { id: 'renewal', label: 'Renewal' },
                    { id: 'upsell', label: `Upsell (${selectedClient.upsell.length})` },
                    { id: 'tickets', label: `Support (${selectedClient.supportTickets.length})` },
                    { id: 'activity', label: `Activity (${selectedClient.activities.length})` },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`shrink-0 border-b-2 px-1 py-3 text-sm font-semibold transition ${
                        activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-6">

                {/* ”----€ OVERVIEW ”----€ */}
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900"><User className="h-4 w-4 text-blue-600" />Contact Information</h3>
                        <div className="space-y-2 text-sm">
                          {[[Mail, selectedClient.email], [Phone, selectedClient.phone], [MapPin, selectedClient.location], [Briefcase, selectedClient.industry], [User, `Account Mgr: ${selectedClient.accountManager}`]].map(([Icon, val], i) => (
                            <div key={i} className="flex items-center gap-2 text-gray-700"><Icon className="h-4 w-4 shrink-0 text-gray-400" />{val}</div>
                          ))}
                        </div>
                      </div>

                      <div className={`rounded-lg border p-4 ${
                        selectedClient.health === 'excellent' ? 'border-green-200 bg-green-50' :
                        selectedClient.health === 'good' ? 'border-blue-200 bg-blue-50' :
                        'border-red-200 bg-red-50'
                      }`}>
                        <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900"><Heart className="h-4 w-4 text-red-500" />Relationship Health</h3>
                        <div className="mb-3 flex items-end gap-2">
                          <span className="text-4xl font-extrabold text-gray-900">{healthConfig[selectedClient.health].pct}%</span>
                          <span className={`mb-1 rounded-full px-2 py-0.5 text-sm font-bold ${healthConfig[selectedClient.health].badge}`}>{healthConfig[selectedClient.health].label}</span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-gray-200">
                          <div className={`h-full rounded-full ${healthConfig[selectedClient.health].bar} transition-all`} style={{ width: `${healthConfig[selectedClient.health].pct}%` }} />
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                          <div><span className="text-gray-600">Deals Won:</span> <span className="font-bold">{selectedClient.dealsWon}</span></div>
                          <div><span className="text-gray-600">Open Tickets:</span> <span className="font-bold">{selectedClient.supportTickets.filter(t => t.status !== 'resolved').length}</span></div>
                          <div><span className="text-gray-600">Upsell Opps:</span> <span className="font-bold">{selectedClient.upsell.length}</span></div>
                          <div><span className="text-gray-600">Last Activity:</span> <span className="font-bold">{new Date(selectedClient.lastActivity).toLocaleDateString()}</span></div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="rounded-lg border border-gray-200 bg-white p-4">
                        <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900"><DollarSign className="h-4 w-4 text-green-600" />Revenue Summary</h3>
                        <div className="text-3xl font-extrabold text-green-600">{selectedClientCurrencySymbol}{selectedClient.totalRevenue.toLocaleString()}</div>
                        {selectedClient.revenue.lastYear > 0 && (
                          <div className="mt-1 flex items-center gap-1 text-sm text-green-700">
                            <TrendingUp className="h-4 w-4" />
                            +{selectedClient.revenue.growth}% YoY growth
                          </div>
                        )}
                        <div className="mt-2 text-xs text-gray-500">{selectedClient.revenue.breakdown.length} transactions · {selectedClient.dealsWon} deals won</div>
                      </div>

                      <div className={`rounded-lg border p-4 ${
                        selectedClient.renewal.status === 'at-risk' ? 'border-red-200 bg-red-50' :
                        selectedClient.renewal.status === 'in-discussion' ? 'border-blue-200 bg-blue-50' :
                        selectedClient.renewal.status === 'on-track' ? 'border-green-200 bg-green-50' :
                        'border-gray-200 bg-gray-50'
                      }`}>
                        <h3 className="mb-2 flex items-center gap-2 font-semibold text-gray-900"><RefreshCw className="h-4 w-4 text-blue-600" />Renewal</h3>
                        <div className="mb-3 flex items-baseline gap-2">
                          <span className="text-3xl font-extrabold text-gray-900">
                            {daysUntilRenewal(selectedClient.renewalDate) > 0 ? daysUntilRenewal(selectedClient.renewalDate) : 0} days
                          </span>
                          <span className="text-xs text-gray-500">({new Date(selectedClient.renewalDate).toLocaleDateString()})</span>
                        </div>
                        <p className="text-xs text-gray-600">Value: ${selectedClient.renewalValue.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="rounded-lg border border-gray-200 bg-white p-4">
                      <h3 className="mb-3 font-semibold text-gray-900">Quick Actions</h3>
                      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        <button onClick={() => setShowActivityModal(true)}
                          className="flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition duration-200 cursor-pointer">
                          <Phone className="h-4 w-4" />Log Activity
                        </button>
                        <button onClick={() => setShowTicketModal(true)}
                          className="flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700 hover:bg-red-100 transition duration-200 cursor-pointer">
                          <LifeBuoy className="h-4 w-4" />Raise Ticket
                        </button>
                        <button onClick={() => setShowUpsellModal(true)}
                          className="flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition duration-200 cursor-pointer">
                          <TrendingUp className="h-4 w-4" />Add Upsell
                        </button>
                        <button onClick={() => openEditClientModal(selectedClient)}
                          className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition duration-200 cursor-pointer">
                          <Edit className="h-4 w-4" />Edit Account
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── ONBOARDING ── */}
                {activeTab === 'onboarding' && (
                  <div className="space-y-4">
                    <div className={`rounded-xl border p-4 transition-all duration-200 ${
                      selectedClient.onboarding.status === 'completed' ? 'border-green-200 bg-green-50/50' :
                      selectedClient.onboarding.status === 'stalled' ? 'border-red-200 bg-red-50/50' :
                      'border-blue-200 bg-blue-50/50'
                    }`}>
                      <div className="flex items-center gap-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-full transition-all ${
                          selectedClient.onboarding.status === 'completed' ? 'bg-green-500' :
                          selectedClient.onboarding.status === 'stalled' ? 'bg-red-500' : 'bg-blue-500'
                        }`}>
                          {selectedClient.onboarding.status === 'completed'
                            ? <CheckCircle className="h-6 w-6 text-white" />
                            : selectedClient.onboarding.status === 'stalled'
                            ? <AlertTriangle className="h-6 w-6 text-white" />
                            : <Activity className="h-6 w-6 text-white" />}
                        </div>
                        <div>
                          <div className="text-lg font-bold text-gray-900 capitalize">Onboarding {onboardingConfig[selectedClient.onboarding.status].label}</div>
                          <div className="text-sm text-gray-600">{selectedClient.onboarding.completedSteps} of {selectedClient.onboarding.totalSteps} steps completed</div>
                        </div>
                        <div className="ml-auto text-right">
                          <div className="text-2xl font-extrabold text-gray-900">{Math.round((selectedClient.onboarding.completedSteps / selectedClient.onboarding.totalSteps) * 100)}%</div>
                          <div className="text-xs text-gray-500">complete</div>
                        </div>
                      </div>
                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${selectedClient.onboarding.status === 'completed' ? 'bg-green-500' : selectedClient.onboarding.status === 'stalled' ? 'bg-red-500' : 'bg-blue-500'}`}
                          style={{ width: `${(selectedClient.onboarding.completedSteps / selectedClient.onboarding.totalSteps) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-4">
                      <h3 className="mb-4 font-semibold text-gray-900">Onboarding Checklist</h3>
                      <div className="space-y-3">
                        {selectedClient.onboarding.steps.map((step, i) => (
                          <div key={step.id} className={`flex items-center gap-4 rounded-lg p-3 transition hover:shadow-xs ${step.done ? 'bg-green-50/70' : 'bg-gray-50'}`}>
                            <button
                              onClick={() => handleToggleOnboardingStep(step.id)}
                              title={step.done ? "Mark incomplete" : "Mark complete"}
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold text-sm transition-all duration-200 cursor-pointer ${
                                step.done 
                                  ? 'bg-green-500 text-white hover:bg-green-600 shadow-sm' 
                                  : 'bg-white border-2 border-gray-300 text-gray-400 hover:border-blue-500 hover:text-blue-500'
                              }`}
                            >
                              {step.done ? <CheckCircle className="h-4 w-4" /> : i + 1}
                            </button>
                            <div className="flex-1 cursor-pointer" onClick={() => handleToggleOnboardingStep(step.id)}>
                              <div className={`text-sm font-semibold transition-colors duration-200 ${step.done ? 'text-gray-900 line-through decoration-gray-400' : 'text-gray-700 hover:text-blue-600'}`}>{step.label}</div>
                              {step.date && <div className="text-xs text-gray-500">Completed: {new Date(step.date).toLocaleDateString()}</div>}
                            </div>
                            {!step.done && i === selectedClient.onboarding.completedSteps && (
                              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700 animate-pulse">Next Step</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── REVENUE ── */}
                {activeTab === 'revenue' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center">
                        <div className="text-xs text-green-600">Total Revenue</div>
                        <div className="mt-1 text-2xl font-extrabold text-green-700">{selectedClientCurrencySymbol}{selectedClient.revenue.current.toLocaleString()}</div>
                      </div>
                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
                        <div className="text-xs text-gray-600">Last Year</div>
                        <div className="mt-1 text-2xl font-bold text-gray-700">{selectedClientCurrencySymbol}{selectedClient.revenue.lastYear.toLocaleString()}</div>
                      </div>
                      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-center">
                        <div className="text-xs text-blue-600">YoY Growth</div>
                        <div className="mt-1 text-2xl font-extrabold text-blue-700">+{selectedClient.revenue.growth}%</div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-4">
                      <h3 className="mb-3 font-semibold text-gray-900">Revenue Breakdown</h3>
                      <div className="mb-3 space-y-2">
                        {selectedClient.revenue.breakdown.map((item, i) => {
                          const pct = Math.round((item.amount / selectedClient.revenue.current) * 100)
                          return (
                            <div key={i} className="rounded-lg bg-gray-50 p-3">
                              <div className="mb-1 flex items-center justify-between text-sm">
                                <span className="font-medium text-gray-900">{item.label}</span>
                                <div className="text-right">
                                  <span className="font-bold text-gray-900">{selectedClientCurrencySymbol}{item.amount.toLocaleString()}</span>
                                  <span className="ml-2 text-xs text-gray-500">{pct}%</span>
                                </div>
                              </div>
                              <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
                                <div className="h-full rounded-full bg-blue-500 animate-all duration-300" style={{ width: `${pct}%` }} />
                              </div>
                              <div className="mt-1 text-xs text-gray-500">{new Date(item.date).toLocaleDateString()}</div>
                            </div>
                          )
                        })}
                      </div>
                      <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                        <span className="font-bold text-gray-900">Total</span>
                        <span className="text-lg font-extrabold text-green-600">{selectedClientCurrencySymbol}{selectedClient.revenue.current.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                      <h3 className="mb-2 flex items-center gap-2 font-semibold text-gray-900"><TrendingUp className="h-4 w-4 text-emerald-600" />Revenue Growth Potential</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Renewal Value</div>
                          <div className="mt-1 text-lg font-bold text-gray-900">{selectedClientCurrencySymbol}{selectedClient.renewalValue.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Upsell Potential</div>
                          <div className="mt-1 text-lg font-bold text-emerald-700">
                            +{selectedClientCurrencySymbol}{selectedClient.upsell.reduce((s, u) => s + u.value, 0).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── RENEWAL ── */}
                {activeTab === 'renewal' && (
                  <div className="space-y-4">
                    <div className={`rounded-xl border p-5 transition-all duration-200 ${
                      selectedClient.renewal.status === 'at-risk' ? 'border-red-200 bg-red-50' :
                      selectedClient.renewal.status === 'in-discussion' ? 'border-blue-200 bg-blue-50' :
                      selectedClient.renewal.status === 'on-track' ? 'border-green-200 bg-green-50' :
                      'border-gray-200 bg-gray-50'
                    }`}>
                      <div className="flex items-center gap-4">
                        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-extrabold text-white transition-all ${
                          selectedClient.renewal.status === 'at-risk' ? 'bg-red-500' :
                          selectedClient.renewal.status === 'in-discussion' ? 'bg-blue-500' :
                          selectedClient.renewal.status === 'on-track' ? 'bg-green-500' : 'bg-gray-400'
                        }`}>
                          {daysUntilRenewal(selectedClient.renewalDate) > 0 ? `${daysUntilRenewal(selectedClient.renewalDate)}d` : '0d'}
                        </div>
                        <div>
                          <div className="text-lg font-bold text-gray-900">Renewal due {new Date(selectedClient.renewalDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                          <div className="mt-0.5 text-sm text-gray-600">Renewal Value: <strong>{selectedClientCurrencySymbol}{selectedClient.renewalValue.toLocaleString()}</strong></div>
                          <span className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-bold capitalize ${renewalConfig[selectedClient.renewal.status].badge}`}>
                            {selectedClient.renewal.status.replace('-', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-4">
                      <h3 className="mb-2 font-semibold text-gray-900">Renewal Notes</h3>
                      <p className="text-sm text-gray-700">{selectedClient.renewal.notes}</p>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-4">
                      <h3 className="mb-3 font-semibold text-gray-900">Renewal Action Plan</h3>
                      <div className="space-y-2">
                        {[
                          'Review contract terms and pricing',
                          'Prepare renewal proposal with upsell options',
                          'Schedule renewal negotiation meeting',
                          'Get legal approval on new contract',
                          'Send contract for signature',
                          'Confirm payment terms',
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-3 rounded-lg bg-gray-50 p-2.5">
                            <CheckSquare className="h-4 w-4 shrink-0 text-gray-300" />
                            <span className="text-sm text-gray-700">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={handlePrepareProposal}
                        className="flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition duration-200 cursor-pointer"
                      >
                        <FileText className="h-4 w-4" />Prepare Renewal Proposal
                      </button>
                      <button 
                        onClick={handleSendRenewalEmail}
                        className="flex items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm font-semibold text-green-700 hover:bg-green-100 transition duration-200 cursor-pointer"
                      >
                        <Send className="h-4 w-4" />Send Renewal Email
                      </button>
                    </div>
                  </div>
                )}

                {/* ── UPSELL ── */}
                {activeTab === 'upsell' && (
                  <div className="space-y-4">
                    <button onClick={() => setShowUpsellModal(true)}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-emerald-300 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition duration-200 cursor-pointer">
                      <Plus className="h-4 w-4" />Add Upsell / Cross-sell Opportunity
                    </button>

                    {selectedClient.upsell && selectedClient.upsell.length > 0 ? (
                      selectedClient.upsell.map(opp => (
                        <div key={opp.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-2xs hover:shadow-xs transition">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="font-bold text-gray-900">{opp.title}</div>
                              <div className="mt-1 text-2xl font-extrabold text-emerald-600">{selectedClientCurrencySymbol}{opp.value.toLocaleString()}</div>
                            </div>
                            <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                              opp.status === 'negotiating' ? 'bg-blue-100 text-blue-700' :
                              opp.status === 'proposed' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {opp.status}
                            </span>
                          </div>
                          <div className="mt-3">
                            <div className="mb-1 flex justify-between text-xs text-gray-600">
                              <span>Win Probability</span>
                              <span className="font-bold">{opp.probability}%</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${opp.probability >= 70 ? 'bg-green-500' : opp.probability >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${opp.probability}%` }}
                              />
                            </div>
                          </div>
                          {opp.notes && <p className="mt-2 text-xs italic text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-100">{opp.notes}</p>}
                          <div className="mt-3 flex gap-2">
                            {opp.status !== 'proposed' && opp.status !== 'negotiating' && (
                              <button 
                                onClick={() => handleSendUpsellProposal(opp.id)}
                                className="flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition cursor-pointer"
                              >
                                <Send className="h-3 w-3" />Send Proposal
                              </button>
                            )}
                            <button 
                              onClick={() => {
                                setEditingUpsellId(opp.id)
                                setUpsellForm({
                                  title: opp.title,
                                  type: opp.type,
                                  status: opp.status.charAt(0).toUpperCase() + opp.status.slice(1),
                                  value: opp.value.toString(),
                                  probability: opp.probability.toString(),
                                  notes: opp.notes || ''
                                })
                                setShowUpsellModal(true)
                              }}
                              className="flex items-center gap-1 rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                            >
                              <Edit className="h-3 w-3" />Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteUpsell(opp.id)}
                              className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition cursor-pointer"
                            >
                              <Trash2 className="h-3 w-3" />Delete
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-lg border border-gray-200 bg-gray-50 py-10 text-center text-gray-500">
                        <Target className="mx-auto mb-2 h-10 w-10 text-gray-300" />
                        <p className="font-semibold">No upsell opportunities yet</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ── SUPPORT TICKETS ── */}
                {activeTab === 'tickets' && (
                  <div className="space-y-4">
                    <button onClick={() => setShowTicketModal(true)}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700 hover:bg-red-100 transition duration-200 cursor-pointer">
                      <Plus className="h-4 w-4" />Raise New Support Ticket
                    </button>

                    {selectedClient.supportTickets && selectedClient.supportTickets.length > 0 ? (
                      selectedClient.supportTickets.map(ticket => (
                        <div key={ticket.id} className={`rounded-xl border bg-white p-4 shadow-2xs hover:shadow-xs transition ${ticket.status !== 'resolved' ? 'border-red-200 bg-red-50/10' : 'border-gray-200'}`}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900">{ticket.title}</div>
                              {ticket.description && <p className="mt-1 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100">{ticket.description}</p>}
                              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                <span>Raised: {new Date(ticket.raised).toLocaleDateString()}</span>
                                {ticket.resolved && <span>· Resolved: {new Date(ticket.resolved).toLocaleDateString()}</span>}
                                <span>· {ticket.by}</span>
                              </div>
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-1">
                              <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${ticketPriority[ticket.priority] || 'bg-gray-100 text-gray-700'}`}>{ticket.priority}</span>
                              <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${ticketStatus[ticket.status]}`}>{ticket.status}</span>
                            </div>
                          </div>
                          {ticket.status !== 'resolved' && (
                            <button 
                              onClick={() => handleResolveTicket(ticket.id)}
                              className="mt-2.5 flex items-center gap-1 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-100 transition cursor-pointer"
                            >
                              <CheckCircle className="h-3 w-3" />Mark Resolved
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="rounded-lg border border-gray-200 bg-gray-50 py-10 text-center text-gray-500">
                        <LifeBuoy className="mx-auto mb-2 h-10 w-10 text-gray-300" />
                        <p className="font-semibold">No support tickets -- all clear!</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ── ACTIVITY & NOTES ── */}
                {activeTab === 'activity' && (
                  <div className="space-y-4">
                    <button onClick={() => setShowActivityModal(true)}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-blue-200 bg-blue-50 p-3 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition duration-200 cursor-pointer">
                      <Plus className="h-4 w-4" />Log New Activity
                    </button>

                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-2xs">
                      <textarea 
                        rows={2} 
                        placeholder="Quick note about this account..."
                        value={quickNoteText}
                        onChange={e => setQuickNoteText(e.target.value)}
                        className="w-full resize-none rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" 
                      />
                      <div className="mt-2 flex justify-end">
                        <button 
                          onClick={handleSaveQuickNote}
                          disabled={!quickNoteText.trim()}
                          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <Send className="h-4 w-4" />Save Note
                        </button>
                      </div>
                    </div>

                    {selectedClient.notes && selectedClient.notes.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gray-700 text-sm">Account Notes</h3>
                        {selectedClient.notes.map(note => (
                          <div key={note.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-3xs relative group">
                            <p className="text-sm text-gray-950 font-medium leading-relaxed whitespace-pre-wrap">{note.text}</p>
                            <div className="mt-2 flex justify-between items-center text-xs text-gray-500 border-t border-gray-50 pt-2">
                              <span>{new Date(note.date).toLocaleString()} · {note.by}</span>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleDeleteQuickNote(note.id)}
                                  className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition cursor-pointer"
                                  title="Delete Note"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedClient.activities && selectedClient.activities.length > 0 ? (
                      <div className="relative space-y-4 pl-8 pt-2">
                        <div className="absolute left-3 top-2 h-[calc(100%-16px)] w-0.5 bg-gray-200" />
                        <h3 className="-ml-8 font-semibold text-gray-700 text-sm mb-1">Activity Log</h3>
                        {selectedClient.activities.map(act => (
                          <div key={act.id} className="relative">
                            <div className="absolute -left-8 top-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-gray-200 bg-white shadow-3xs">
                              {activityIcon(act.type)}
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-3xs">
                              <div className="font-semibold text-gray-900 leading-snug">{act.description}</div>
                              <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                                <Clock className="h-3 w-3" />{act.date} · {act.by}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-gray-200 bg-gray-50 py-8 text-center text-gray-500">
                        <Activity className="mx-auto mb-2 h-10 w-10 text-gray-300" />
                        <p className="font-semibold">No activities yet</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Detail Modal Footer */}
              <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 p-4">
                <button 
                  onClick={handleToggleAtRisk}
                  className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                    selectedClient.health === 'at-risk' 
                      ? 'border-green-200 bg-green-50 text-green-600 hover:bg-green-100 shadow-3xs' 
                      : 'border-red-200 bg-white text-red-600 hover:bg-red-50 shadow-3xs'
                  }`}
                >
                  <TrendingDown className="h-4 w-4" />
                  {selectedClient.health === 'at-risk' ? 'Remove At-Risk Flag' : 'Mark as At-Risk'}
                </button>
                <div className="flex gap-2">
                  <button onClick={() => setShowDetailModal(false)} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer">Close</button>
                  <button 
                    onClick={() => openEditClientModal(selectedClient)}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition shadow-xs cursor-pointer"
                  >
                    <Edit className="h-4 w-4" />Edit Account
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • 
          RAISE SUPPORT TICKET MODAL
      • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • •  */}
      <AnimatePresence>
        {showTicketModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                  <LifeBuoy className="h-5 w-5 text-red-600" />Raise Support Ticket
                </h2>
                <button onClick={() => setShowTicketModal(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
              </div>
              {selectedClient && (
                <div className="mb-4 rounded-lg border border-red-100 bg-red-50 p-3 text-sm font-semibold text-red-800">{selectedClient.company}</div>
              )}
              <form onSubmit={handleRaiseTicket} className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Issue Title <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    placeholder="Brief description of the issue..." 
                    value={ticketForm.title}
                    onChange={e => handleTicketFieldChange('title', e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 ${
                      ticketFieldErrors.title ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                    }`} 
                  />
                  {ticketFieldErrors.title && <p className="mt-0.5 text-xs text-red-500">{ticketFieldErrors.title}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Priority</label>
                    <select 
                      value={ticketForm.priority}
                      onChange={e => handleTicketFieldChange('priority', e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Category</label>
                    <select 
                      value={ticketForm.category}
                      onChange={e => handleTicketFieldChange('category', e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white"
                    >
                      <option value="Technical Bug">Technical Bug</option>
                      <option value="Feature Request">Feature Request</option>
                      <option value="Performance">Performance</option>
                      <option value="Integration">Integration</option>
                      <option value="Data Issue">Data Issue</option>
                      <option value="Access / Login">Access / Login</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Description <span className="text-red-500">*</span></label>
                  <textarea 
                    rows={4} 
                    placeholder="Detailed description, steps to reproduce..." 
                    value={ticketForm.description}
                    onChange={e => handleTicketFieldChange('description', e.target.value)}
                    className={`w-full resize-none rounded-lg border p-3 text-sm outline-none focus:ring-2 focus:ring-blue-100 ${
                      ticketFieldErrors.description ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                    }`} 
                  />
                  {ticketFieldErrors.description && <p className="mt-0.5 text-xs text-red-500">{ticketFieldErrors.description}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Assign To Team</label>
                  <select 
                    value={ticketForm.assignTo}
                    onChange={e => handleTicketFieldChange('assignTo', e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="Support Team">Support Team</option>
                    <option value="Dev Team">Dev Team</option>
                    <option value="DevOps Team">DevOps Team</option>
                    <option value="Compliance Team">Compliance Team</option>
                    <option value="Account Manager">Account Manager</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="notifyClient" className="h-4 w-4 rounded border-gray-300" defaultChecked />
                  <label htmlFor="notifyClient" className="text-sm text-gray-700">Notify client via email about ticket creation</label>
                </div>
                <div className="mt-4 flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowTicketModal(false)} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition shadow-xs cursor-pointer">
                    <LifeBuoy className="h-4 w-4" />Raise Ticket
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • 
          ADD UPSELL OPPORTUNITY MODAL
      • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • •  */}
      <AnimatePresence>
        {showUpsellModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />Add Upsell / Cross-sell
                </h2>
                <button onClick={() => setShowUpsellModal(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
              </div>
              {selectedClient && (
                <div className="mb-4 rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-sm font-semibold text-emerald-900">{selectedClient.company}</div>
              )}
              <form onSubmit={handleAddUpsell} className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Opportunity Title <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    placeholder="e.g. AI Analytics Module Upgrade" 
                    value={upsellForm.title}
                    onChange={e => handleUpsellFieldChange('title', e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 ${
                      upsellFieldErrors.title ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                    }`} 
                  />
                  {upsellFieldErrors.title && <p className="mt-0.5 text-xs text-red-500">{upsellFieldErrors.title}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Type</label>
                    <select 
                      value={upsellForm.type}
                      onChange={e => handleUpsellFieldChange('type', e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white"
                    >
                      <option value="Upsell -- Higher Tier">Upsell -- Higher Tier</option>
                      <option value="Cross-sell -- New Product">Cross-sell -- New Product</option>
                      <option value="Add-on Module">Add-on Module</option>
                      <option value="Seat Expansion">Seat Expansion</option>
                      <option value="Professional Services">Professional Services</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Status</label>
                    <select 
                      value={upsellForm.status}
                      onChange={e => handleUpsellFieldChange('status', e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white"
                    >
                      <option value="Identified">Identified</option>
                      <option value="Proposed">Proposed</option>
                      <option value="Negotiating">Negotiating</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Estimated Value ({currencySymbol}) <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-semibold">{currencySymbol}</span>
                      <input 
                        type="text" 
                        placeholder="50000" 
                        value={upsellForm.value}
                        onChange={e => handleUpsellFieldChange('value', e.target.value)}
                        className={`w-full rounded-lg border py-2 pl-7 pr-3 text-sm outline-none focus:ring-2 focus:ring-blue-100 ${
                          upsellFieldErrors.value ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                        }`} 
                      />
                    </div>
                    {upsellFieldErrors.value && <p className="mt-0.5 text-xs text-red-500">{upsellFieldErrors.value}</p>}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Win Probability (%) <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      placeholder="60" 
                      value={upsellForm.probability}
                      onChange={e => handleUpsellFieldChange('probability', e.target.value)}
                      className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 ${
                        upsellFieldErrors.probability ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                      }`} 
                    />
                    {upsellFieldErrors.probability && <p className="mt-0.5 text-xs text-red-500">{upsellFieldErrors.probability}</p>}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Notes / Trigger</label>
                  <textarea 
                    rows={3} 
                    placeholder="What triggered this opportunity?" 
                    value={upsellForm.notes}
                    onChange={e => handleUpsellFieldChange('notes', e.target.value)}
                    className="w-full resize-none rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200" 
                  />
                </div>
                <div className="mt-4 flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowUpsellModal(false)} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition shadow-xs cursor-pointer">
                    <Plus className="h-4 w-4" />Add Opportunity
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • 
          LOG ACTIVITY MODAL
      • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • •  */}
      <AnimatePresence>
        {showActivityModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                  <Activity className="h-5 w-5 text-blue-600" />Log Activity
                </h2>
                <button onClick={() => setShowActivityModal(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
              </div>
              {selectedClient && (
                <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm font-semibold text-blue-900">{selectedClient.company}</div>
              )}
              <form onSubmit={handleLogActivitySubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Activity Type</label>
                    <select 
                      value={activityForm.type}
                      onChange={e => handleActivityFieldChange('type', e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white"
                    >
                      <option value="Call">Call</option>
                      <option value="Email">Email</option>
                      <option value="Meeting">Meeting</option>
                      <option value="Demo">Demo</option>
                      <option value="Site Visit">Site Visit</option>
                      <option value="QBR (Quarterly Review)">QBR (Quarterly Review)</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Outcome</label>
                    <select 
                      value={activityForm.outcome}
                      onChange={e => handleActivityFieldChange('outcome', e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white"
                    >
                      <option value="Positive -- Moving Forward">Positive -- Moving Forward</option>
                      <option value="Neutral -- Follow-up Needed">Neutral -- Follow-up Needed</option>
                      <option value="Concern Raised">Concern Raised</option>
                      <option value="Renewal Discussion">Renewal Discussion</option>
                      <option value="Upsell Interest">Upsell Interest</option>
                      <option value="Churn Risk Flagged">Churn Risk Flagged</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Description <span className="text-red-500">*</span></label>
                  <textarea 
                    rows={4} 
                    placeholder="What was discussed? Key takeaways, next steps..." 
                    value={activityForm.description}
                    onChange={e => handleActivityFieldChange('description', e.target.value)}
                    className={`w-full resize-none rounded-lg border p-3 text-sm outline-none focus:ring-2 focus:ring-blue-100 ${
                      activityFieldErrors.description ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                    }`} 
                  />
                  {activityFieldErrors.description && <p className="mt-0.5 text-xs text-red-500">{activityFieldErrors.description}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Date & Time <span className="text-red-500">*</span></label>
                    <input 
                      type="datetime-local" 
                      value={activityForm.dateTime}
                      onChange={e => handleActivityFieldChange('dateTime', e.target.value)}
                      className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 ${
                        activityFieldErrors.dateTime ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                      }`} 
                    />
                    {activityFieldErrors.dateTime && <p className="mt-0.5 text-xs text-red-500">{activityFieldErrors.dateTime}</p>}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Next Follow-up</label>
                    <input 
                      type="date" 
                      value={activityForm.followUp}
                      onChange={e => handleActivityFieldChange('followUp', e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white" 
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="updateHealth" 
                    checked={activityForm.updateHealth}
                    onChange={e => handleActivityFieldChange('updateHealth', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300" 
                  />
                  <label htmlFor="updateHealth" className="text-sm text-gray-700">Update relationship health score based on this interaction</label>
                </div>
                <div className="mt-4 flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowActivityModal(false)} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition shadow-xs cursor-pointer">
                    <CheckCircle className="h-4 w-4" />Save Activity
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ••••••••••••••••••••••••••••••••••••••••
          ADD CLIENT MODAL
      •••••••••••••••••••••••••••••••••••••••• */}
      <AnimatePresence>
        {showAddClientModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Add New Client</h2>
                    <p className="text-xs text-blue-100">Create a direct client record</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddClientModal(false)}
                  className="rounded-lg p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleAddClient} className="overflow-y-auto max-h-[70vh] p-6">
                {/* Error Alert */}
                {addClientError && (
                  <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {addClientError}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Company Name */}
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={addClientForm.company_name}
                        onChange={e => handleAddClientFieldChange('company_name', e.target.value)}
                        placeholder="e.g. Acme Corporation"
                        className={`w-full rounded-lg border bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:bg-white focus:ring-2 ${
                          addClientFieldErrors.company_name ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                        }`}
                      />
                    </div>
                    {addClientFieldErrors.company_name && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="h-3 w-3" />{addClientFieldErrors.company_name}
                      </p>
                    )}
                  </div>

                  {/* Contact Name */}
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                      Contact Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={addClientForm.contact_name}
                        onChange={e => handleAddClientFieldChange('contact_name', e.target.value)}
                        placeholder="Primary contact person"
                        className={`w-full rounded-lg border bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:bg-white focus:ring-2 ${
                          addClientFieldErrors.contact_name ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                        }`}
                      />
                    </div>
                    {addClientFieldErrors.contact_name && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="h-3 w-3" />{addClientFieldErrors.contact_name}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                      Work Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={addClientForm.email}
                        onChange={e => handleAddClientFieldChange('email', e.target.value)}
                        placeholder="contact@company.com"
                        className={`w-full rounded-lg border bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:bg-white focus:ring-2 ${
                          addClientFieldErrors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                        }`}
                      />
                    </div>
                    {addClientFieldErrors.email && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="h-3 w-3" />{addClientFieldErrors.email}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={addClientForm.phone}
                        onChange={e => handleAddClientFieldChange('phone', e.target.value)}
                        placeholder="+91 98765 43210"
                        maxLength={18}
                        className={`w-full rounded-lg border bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:bg-white focus:ring-2 ${
                          addClientFieldErrors.phone ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                        }`}
                      />
                    </div>
                    {addClientFieldErrors.phone ? (
                      <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="h-3 w-3" />{addClientFieldErrors.phone}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-gray-400">Digits, +, -, spaces, () only</p>
                    )}
                  </div>

                  {/* Location */}
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={addClientForm.location}
                        onChange={e => handleAddClientFieldChange('location', e.target.value)}
                        placeholder="City, Country"
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  {/* Industry */}
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">Industry</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <select
                        value={addClientForm.industry}
                        onChange={e => setAddClientForm(f => ({ ...f, industry: e.target.value }))}
                        className="w-full appearance-none rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="">Select industry...</option>
                        {['Technology', 'Finance', 'Healthcare', 'Manufacturing', 'Retail', 'Logistics', 'Automotive', 'Education', 'Consulting', 'R&D', 'Government', 'Other'].map(i => (
                          <option key={i} value={i}>{i}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Contract Value */}
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">Contract Value</label>
                    <div className="flex gap-2">
                      <select
                        value={addClientForm.currency}
                        onChange={e => setAddClientForm(f => ({ ...f, currency: e.target.value }))}
                        className="w-24 rounded-lg border border-gray-200 bg-gray-50 px-2 py-2.5 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-white"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="INR">INR (₹)</option>
                        <option value="AUD">AUD (A$)</option>
                        <option value="CAD">CAD (C$)</option>
                      </select>
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500 select-none">
                          {currencySymbol}
                        </span>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={addClientForm.deal_value}
                          onChange={e => handleAddClientFieldChange('deal_value', e.target.value)}
                          placeholder="0.00"
                          className={`w-full rounded-lg border bg-gray-50 py-2.5 pl-8 pr-4 text-sm outline-none transition focus:bg-white focus:ring-2 ${
                            addClientFieldErrors.deal_value ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                          }`}
                        />
                      </div>
                    </div>
                    {addClientFieldErrors.deal_value && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="h-3 w-3" />{addClientFieldErrors.deal_value}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-400">Only positive numbers allowed. {currencySymbol} symbol updates automatically.</p>
                  </div>

                  {/* Notes */}
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">Notes</label>
                    <textarea
                      rows={3}
                      value={addClientForm.notes}
                      onChange={e => setAddClientForm(f => ({ ...f, notes: e.target.value }))}
                      placeholder="Any additional details about this client..."
                      className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddClientModal(false)}
                    className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                    disabled={addClientSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addClientSubmitting}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {addClientSubmitting ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Create Client
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ••••••••••••••••••••••••••••••••••••••••
          EDIT CLIENT MODAL
      •••••••••••••••••••••••••••••••••••••••• */}
      <AnimatePresence>
        {showEditClientModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-blue-700 to-indigo-800 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                    <Edit className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Edit Client Account</h2>
                    <p className="text-xs text-blue-100">Update account details for {editClientForm.company_name}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEditClientModal(false)}
                  className="rounded-lg p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleEditClientSubmit} className="overflow-y-auto max-h-[70vh] p-6">
                {/* Error Alert */}
                {editClientError && (
                  <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {editClientError}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Company Name */}
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={editClientForm.company_name}
                        onChange={e => handleEditClientFieldChange('company_name', e.target.value)}
                        placeholder="e.g. Acme Corporation"
                        className={`w-full rounded-lg border bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:bg-white focus:ring-2 ${
                          editClientFieldErrors.company_name ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                        }`}
                      />
                    </div>
                    {editClientFieldErrors.company_name && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="h-3 w-3" />{editClientFieldErrors.company_name}
                      </p>
                    )}
                  </div>

                  {/* Contact Name */}
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                      Contact Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={editClientForm.contact_name}
                        onChange={e => handleEditClientFieldChange('contact_name', e.target.value)}
                        placeholder="Primary contact person"
                        className={`w-full rounded-lg border bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:bg-white focus:ring-2 ${
                          editClientFieldErrors.contact_name ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                        }`}
                      />
                    </div>
                    {editClientFieldErrors.contact_name && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="h-3 w-3" />{editClientFieldErrors.contact_name}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                      Work Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={editClientForm.email}
                        onChange={e => handleEditClientFieldChange('email', e.target.value)}
                        placeholder="contact@company.com"
                        className={`w-full rounded-lg border bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:bg-white focus:ring-2 ${
                          editClientFieldErrors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                        }`}
                      />
                    </div>
                    {editClientFieldErrors.email && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="h-3 w-3" />{editClientFieldErrors.email}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={editClientForm.phone}
                        onChange={e => handleEditClientFieldChange('phone', e.target.value)}
                        placeholder="+91 98765 43210"
                        maxLength={18}
                        className={`w-full rounded-lg border bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:bg-white focus:ring-2 ${
                          editClientFieldErrors.phone ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                        }`}
                      />
                    </div>
                    {editClientFieldErrors.phone ? (
                      <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="h-3 w-3" />{editClientFieldErrors.phone}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-gray-400">Digits, +, -, spaces, () only</p>
                    )}
                  </div>

                  {/* Location */}
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={editClientForm.location}
                        onChange={e => handleEditClientFieldChange('location', e.target.value)}
                        placeholder="City, Country"
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  {/* Industry */}
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">Industry</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <select
                        value={editClientForm.industry}
                        onChange={e => setEditClientForm(f => ({ ...f, industry: e.target.value }))}
                        className="w-full appearance-none rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="">Select industry...</option>
                        {['Technology', 'Finance', 'Healthcare', 'Manufacturing', 'Retail', 'Logistics', 'Automotive', 'Education', 'Consulting', 'R&D', 'Government', 'Other'].map(i => (
                          <option key={i} value={i}>{i}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Account Status */}
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">Account Status</label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <select
                        value={editClientForm.account_status}
                        onChange={e => setEditClientForm(f => ({ ...f, account_status: e.target.value }))}
                        className="w-full appearance-none rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                  </div>

                  {/* Contract Value */}
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">Contract Value</label>
                    <div className="flex gap-2">
                      <select
                        value={editClientForm.currency}
                        onChange={e => setEditClientForm(f => ({ ...f, currency: e.target.value }))}
                        className="w-24 rounded-lg border border-gray-200 bg-gray-50 px-2 py-2.5 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-white"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="INR">INR (₹)</option>
                        <option value="AUD">AUD (A$)</option>
                        <option value="CAD">CAD (C$)</option>
                      </select>
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500 select-none">
                          {CURRENCY_SYMBOLS[editClientForm.currency] || '$'}
                        </span>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={editClientForm.deal_value}
                          onChange={e => handleEditClientFieldChange('deal_value', e.target.value)}
                          placeholder="0.00"
                          className={`w-full rounded-lg border bg-gray-50 py-2.5 pl-8 pr-4 text-sm outline-none transition focus:bg-white focus:ring-2 ${
                            editClientFieldErrors.deal_value ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                          }`}
                        />
                      </div>
                    </div>
                    {editClientFieldErrors.deal_value && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="h-3 w-3" />{editClientFieldErrors.deal_value}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-400">Only positive numbers allowed. Currency symbol updates automatically.</p>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditClientModal(false)}
                    className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                    disabled={editClientSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editClientSubmitting}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {editClientSubmitting ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
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

export default ClientsModule
