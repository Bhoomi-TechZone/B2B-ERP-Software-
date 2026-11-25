import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Plus, DollarSign, Calendar, TrendingUp, User, Building2, X,
  Phone, Mail, MapPin, Clock, CheckCircle, AlertCircle, FileText,
  Upload, MessageSquare, Video, Edit, Trash2, ArrowRight, Target,
  Users, Briefcase, Timer, CheckSquare, Award, Activity, Paperclip,
  Send, Shield, Gavel, CreditCard, ThumbsUp, ThumbsDown, RotateCw,
  Eye, Download, PenLine, AlertTriangle, Flag, ChevronDown, ChevronUp,
  Circle, ArrowLeft, Handshake, Receipt, Lock, Unlock, Star, TrendingDown,
  Banknote, ClipboardList, FileCheck, PhoneCall, StickyNote, PartyPopper,
  Loader2,
} from 'lucide-react'
import { dealsService } from '../../../services/dealsService'

// ─────────────────────────────────────────────
// Stage configuration
// ─────────────────────────────────────────────
const STAGES = [
  { id: 'proposal_sent',  label: 'Proposal Sent',   color: 'indigo', icon: FileText },
  { id: 'contract_sent',  label: 'Contract Sent',   color: 'blue',   icon: Send },
  { id: 'under_review',   label: 'Under Review',    color: 'yellow', icon: Eye },
  { id: 'approved',       label: 'Approved',        color: 'green',  icon: CheckCircle },
  { id: 'signed',         label: 'Signed',          color: 'purple', icon: PenLine },
  { id: 'won',            label: 'Won / Closed',    color: 'emerald',icon: Star },
  { id: 'lost',           label: 'Lost',            color: 'red',    icon: TrendingDown },
]

const STAGE_COLORS = {
  'proposal_sent': { bg: 'bg-indigo-50',  header: 'bg-indigo-600',  badge: 'bg-indigo-100 text-indigo-700', border: 'border-indigo-200',  dot: 'bg-indigo-500' },
  'contract_sent': { bg: 'bg-blue-50',    header: 'bg-blue-600',    badge: 'bg-blue-100 text-blue-700',    border: 'border-blue-200',    dot: 'bg-blue-500' },
  'under_review':  { bg: 'bg-yellow-50',  header: 'bg-yellow-500',  badge: 'bg-yellow-100 text-yellow-700', border: 'border-yellow-200',  dot: 'bg-yellow-500' },
  'approved':      { bg: 'bg-green-50',   header: 'bg-green-600',   badge: 'bg-green-100 text-green-700',  border: 'border-green-200',   dot: 'bg-green-500' },
  'signed':        { bg: 'bg-purple-50',  header: 'bg-purple-600',  badge: 'bg-purple-100 text-purple-700', border: 'border-purple-200',  dot: 'bg-purple-500' },
  'won':           { bg: 'bg-emerald-50', header: 'bg-emerald-600', badge: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  'lost':          { bg: 'bg-red-50',     header: 'bg-red-500',     badge: 'bg-red-100 text-red-700',      border: 'border-red-200',     dot: 'bg-red-500' },
}

// Initial empty state - will be populated from API
const INITIAL_DEALS = {
  'proposal_sent': [],
  'contract_sent': [],
  'under_review': [],
  'approved': [],
  'signed': [],
  'won': [],
  'lost': [],
}

// ─────────────────────────────────────────────
// Helper badge functions
// ─────────────────────────────────────────────
const priorityBadge = (p) => ({
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-gray-100 text-gray-600',
}[p] || 'bg-gray-100 text-gray-600')

const legalBadge = (s) => ({
  'pending':   'bg-gray-100 text-gray-600',
  'in-review': 'bg-yellow-100 text-yellow-700',
  'approved':  'bg-green-100 text-green-700',
  'rejected':  'bg-red-100 text-red-700',
}[s] || 'bg-gray-100 text-gray-600')

const approvalBadge = (s) => ({
  'pending':     'bg-gray-100 text-gray-600',
  'in-progress': 'bg-blue-100 text-blue-700',
  'in-review':   'bg-yellow-100 text-yellow-700',
  'approved':    'bg-green-100 text-green-700',
  'rejected':    'bg-red-100 text-red-700',
}[s] || 'bg-gray-100 text-gray-600')

const activityIcon = (type) => {
  const cls = 'h-3.5 w-3.5'
  switch (type) {
    case 'call':     return <Phone className={`${cls} text-blue-500`} />
    case 'email':    return <Mail className={`${cls} text-purple-500`} />
    case 'contract': return <FileText className={`${cls} text-orange-500`} />
    case 'meeting':  return <Video className={`${cls} text-green-500`} />
    default:         return <Activity className={`${cls} text-gray-400`} />
  }
}

const daysUntilClose = (dateStr) => {
  const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24))
  return diff
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
const DealsModule = () => {
  const [deals, setDeals]                       = useState(INITIAL_DEALS)
  const [selectedDeal, setSelectedDeal]         = useState(null)
  const [showDetailModal, setShowDetailModal]   = useState(false)
  const [showContractModal, setShowContractModal] = useState(false)
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const [showNotesModal, setShowNotesModal]     = useState(false)
  const [showWinModal, setShowWinModal]         = useState(false)
  const [showLoseModal, setShowLoseModal]       = useState(false)
  const [activeTab, setActiveTab]               = useState('overview')
  const [draggedDeal, setDraggedDeal]           = useState(null)
  const [draggedFromStage, setDraggedFromStage] = useState(null)
  const [loseReason, setLoseReason]             = useState('')
  const [loading, setLoading]                   = useState(true)
  const [error, setError]                       = useState(null)

  // ── Fetch deals from API ──
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true)
        const data = await dealsService.getDeals()
        setDeals(data || INITIAL_DEALS)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch deals:', err)
        setError('Failed to load deals. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchDeals()
  }, [])

  // ── Derived stats ──
  const allDeals = Object.values(deals).flat()
  const totalPipeline = ['proposal_sent', 'contract_sent', 'under_review', 'approved', 'signed'].reduce(
    (sum, s) => sum + (deals[s] || []).reduce((a, d) => a + d.value, 0), 0
  )
  const wonValue = (deals['won'] || []).reduce((a, d) => a + d.value, 0)
  const closingSoon = allDeals.filter(d => {
    const days = daysUntilClose(d.expectedCloseDate)
    return days >= 0 && days <= 7 && !['won', 'lost'].includes(d.stage)
  }).length
  const approvalPending = allDeals.filter(d => d.approval?.status === 'pending' || d.approval?.status === 'in-progress').length

  // ── Drag & drop ──
  const handleDragStart = (deal, fromStage) => {
    setDraggedDeal(deal)
    setDraggedFromStage(fromStage)
  }
  const handleDragOver = (e) => { e.preventDefault() }
  const handleDrop = async (e, toStage) => {
    e.preventDefault()
    if (!draggedDeal || draggedFromStage === toStage) return
    
    try {
      // Call API to move deal stage
      await dealsService.moveDealStage(draggedDeal.id, toStage)
      
      // Update local state
      setDeals(prev => {
        const fromList = prev[draggedFromStage].filter(d => d.id !== draggedDeal.id)
        const toList   = [...prev[toStage], { ...draggedDeal, daysInStage: 0, stage: toStage }]
        return { ...prev, [draggedFromStage]: fromList, [toStage]: toList }
      })
      
      // Refresh deals to get updated data
      const updatedDeals = await dealsService.getDeals()
      setDeals(updatedDeals || INITIAL_DEALS)
    } catch (err) {
      console.error('Failed to move deal:', err)
      setError('Failed to move deal. Please try again.')
    }
    
    setDraggedDeal(null)
    setDraggedFromStage(null)
  }

  // ── Modals helpers ──
  const openDetail = (deal) => {
    setSelectedDeal(deal)
    setActiveTab('overview')
    setShowDetailModal(true)
  }

  const handleWinDeal = (deal) => {
    setSelectedDeal(deal)
    setShowWinModal(true)
  }

  const confirmWin = async () => {
    if (!selectedDeal) return
    
    try {
      // Call API to move deal to won stage
      await dealsService.moveDealStage(selectedDeal.id, 'won')
      
      // Update local state
      setDeals(prev => {
        const fromStage = Object.keys(prev).find(s => prev[s].some(d => d.id === selectedDeal.id))
        if (!fromStage) return prev
        const fromList = prev[fromStage].filter(d => d.id !== selectedDeal.id)
        const wonList  = [...(prev['won'] || []), { ...selectedDeal, daysInStage: 0, stage: 'won' }]
        return { ...prev, [fromStage]: fromList, won: wonList }
      })
      
      // Refresh deals to get updated data
      const updatedDeals = await dealsService.getDeals()
      setDeals(updatedDeals || INITIAL_DEALS)
      
      setShowWinModal(false)
      setShowDetailModal(false)
      setSelectedDeal(null)
    } catch (err) {
      console.error('Failed to mark deal as won:', err)
      setError('Failed to mark deal as won. Please try again.')
    }
  }

  const confirmLose = async () => {
    if (!selectedDeal) return
    
    try {
      // Call API to move deal to lost stage
      await dealsService.moveDealStage(selectedDeal.id, 'lost')
      
      // Update local state
      setDeals(prev => {
        const fromStage = Object.keys(prev).find(s => prev[s].some(d => d.id === selectedDeal.id))
        if (!fromStage) return prev
        const fromList  = prev[fromStage].filter(d => d.id !== selectedDeal.id)
        const lostList  = [...(prev['lost'] || []), { ...selectedDeal, daysInStage: 0, stage: 'lost', lostReason: loseReason }]
        return { ...prev, [fromStage]: fromList, lost: lostList }
      })
      
      // Refresh deals to get updated data
      const updatedDeals = await dealsService.getDeals()
      setDeals(updatedDeals || INITIAL_DEALS)
      
      setLoseReason('')
      setShowLoseModal(false)
      setShowDetailModal(false)
      setSelectedDeal(null)
    } catch (err) {
      console.error('Failed to mark deal as lost:', err)
      setError('Failed to mark deal as lost. Please try again.')
    }
  }

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#F7F8FA]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading deals...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-[#F7F8FA]">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="h-8 w-8 text-red-600" />
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#F7F8FA]">

      {/* ── Page Header ── */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Banknote className="h-6 w-6 text-yellow-500" /> Deals Pipeline</h1>
            <p className="mt-0.5 text-sm text-gray-500">Manage contracts, approvals, and deal closures</p>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            New Deal
          </button>
        </div>

        {/* Stats Row */}
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
            <div className="text-xs font-semibold text-blue-600">Pipeline Value</div>
            <div className="mt-1 text-xl font-bold text-blue-700">${(totalPipeline / 1000).toFixed(0)}K</div>
          </div>
          <div className="rounded-xl border border-green-200 bg-green-50 p-3">
            <div className="text-xs font-semibold text-green-600">Won (This Month)</div>
            <div className="mt-1 text-xl font-bold text-green-700">${(wonValue / 1000).toFixed(0)}K</div>
          </div>
          <div className="rounded-xl border border-purple-200 bg-purple-50 p-3">
            <div className="text-xs font-semibold text-purple-600">Active Deals</div>
            <div className="mt-1 text-xl font-bold text-purple-700">{allDeals.filter(d => !['won','lost'].includes(Object.keys(deals).find(s => deals[s].includes(d)))).length}</div>
          </div>
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-3">
            <div className="text-xs font-semibold text-orange-600">Closing ≤ 7 Days</div>
            <div className="mt-1 text-xl font-bold text-orange-700">{closingSoon}</div>
          </div>
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-3">
            <div className="text-xs font-semibold text-yellow-700">Pending Approvals</div>
            <div className="mt-1 text-xl font-bold text-yellow-700">{approvalPending}</div>
          </div>
        </div>
      </div>

      {/* ── Kanban Board ── */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-4">
        <div className="flex h-full min-w-max gap-4">
          {STAGES.map((stage) => {
            const stageDeals = deals[stage.id] || []
            const stageTotal = stageDeals.reduce((a, d) => a + d.value, 0)
            const sc = STAGE_COLORS[stage.id]

            return (
              <div
                key={stage.id}
                className={`flex w-72 shrink-0 flex-col rounded-xl border ${sc.border} ${sc.bg}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                {/* Stage Header */}
                <div className={`flex items-center justify-between rounded-t-xl ${sc.header} px-4 py-3`}>
                  <div className="flex items-center gap-2">
                    <stage.icon className="h-4 w-4 text-white" />
                    <span className="text-sm font-bold text-white">{stage.label}</span>
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold text-white">{stageDeals.length}</span>
                  </div>
                  <span className="text-xs font-semibold text-white/90">${(stageTotal / 1000).toFixed(0)}K</span>
                </div>

                {/* Cards */}
                <div className="flex-1 space-y-3 overflow-y-auto p-3">
                  {stageDeals.length === 0 && (
                    <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-xs text-gray-400">
                      Drop deals here
                    </div>
                  )}

                  {stageDeals.map((deal) => {
                    const days = daysUntilClose(deal.expectedCloseDate)
                    const isUrgent = days >= 0 && days <= 7
                    const isOverdue = days < 0

                    return (
                      <div
                        key={deal.id}
                        draggable
                        onDragStart={() => handleDragStart(deal, stage.id)}
                        className="group cursor-grab rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition active:cursor-grabbing hover:shadow-md hover:border-gray-300"
                      >
                        {/* Card Header */}
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-bold text-gray-900">{deal.company}</div>
                            <div className="truncate text-xs text-gray-500">{deal.contact}</div>
                          </div>
                          <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${priorityBadge(deal.priority)}`}>
                            {deal.priority}
                          </span>
                        </div>

                        {/* Deal Value */}
                        <div className="mb-2 flex items-center gap-1 text-lg font-bold text-gray-900">
                          <DollarSign className="h-4 w-4 text-green-500" />
                          {deal.value.toLocaleString()}
                          {deal.pricing.discountPct > 0 && (
                            <span className="ml-1 rounded bg-green-50 px-1 text-xs font-semibold text-green-600">
                              -{deal.pricing.discountPct}%
                            </span>
                          )}
                        </div>

                        {/* Status Chips */}
                        <div className="mb-2 flex flex-wrap gap-1">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${legalBadge(deal.legal.reviewStatus)}`}>
                            Legal: {deal.legal.reviewStatus}
                          </span>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${approvalBadge(deal.approval.status)}`}>
                            {deal.approval.status === 'approved' ? 'Approved' : deal.approval.status === 'in-progress' ? 'In Progress' : 'Pending'}
                          </span>
                        </div>

                        {/* Close Date */}
                        <div className={`mb-2 flex items-center gap-1.5 text-xs font-semibold ${
                          isOverdue ? 'text-red-600' : isUrgent ? 'text-orange-600' : 'text-gray-500'
                        }`}>
                          <Calendar className="h-3 w-3" />
                          {isOverdue ? `${Math.abs(days)}d overdue` : isUrgent ? `${days}d left` : `Close: ${new Date(deal.expectedCloseDate).toLocaleDateString()}`}
                        </div>

                        {/* Assigned + Days in stage */}
                        <div className="mb-3 flex items-center justify-between text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {deal.assignedTo}
                          </span>
                          <span>{deal.daysInStage}d in stage</span>
                        </div>

                        {/* Card Actions */}
                        <div className="flex gap-1 border-t border-gray-100 pt-2">
                          <button
                            onClick={() => openDetail(deal)}
                            className="flex flex-1 items-center justify-center gap-1 rounded-md bg-gray-50 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-blue-50 hover:text-blue-700"
                          >
                            <Eye className="h-3.5 w-3.5" /> View
                          </button>
                          {!['won', 'lost'].includes(stage.id) && (
                            <>
                              <button
                                onClick={() => { setSelectedDeal(deal); setShowContractModal(true) }}
                                className="flex flex-1 items-center justify-center gap-1 rounded-md bg-gray-50 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-orange-50 hover:text-orange-700"
                              >
                                <Upload className="h-3.5 w-3.5" /> Contract
                              </button>
                              {stage.id === 'approved' && (
                                <button
                                  onClick={() => { setSelectedDeal(deal); setShowSignatureModal(true) }}
                                  className="flex flex-1 items-center justify-center gap-1 rounded-md bg-gray-50 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-purple-50 hover:text-purple-700"
                                >
                                  <PenLine className="h-3.5 w-3.5" /> Sign
                                </button>
                              )}
                            </>
                          )}
                          {stage.id === 'signed' && (
                            <button
                              onClick={() => handleWinDeal(deal)}
                              className="flex flex-1 items-center justify-center gap-1 rounded-md bg-emerald-50 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
                            >
                              <Star className="h-3.5 w-3.5" /> Win
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Stage Footer */}
                <div className="border-t border-gray-200 px-3 py-2 text-right text-xs text-gray-500">
                  {stageDeals.length} deal{stageDeals.length !== 1 ? 's' : ''} · ${(stageTotal / 1000).toFixed(0)}K
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ════════════════════════════════════════
          DEAL DETAIL MODAL
      ════════════════════════════════════════ */}
      <AnimatePresence>
        {showDetailModal && selectedDeal && (
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
                      <Building2 className="h-6 w-6 text-white/70" />
                      <h2 className="text-xl font-bold text-white">{selectedDeal.company}</h2>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${priorityBadge(selectedDeal.priority)}`}>
                        {selectedDeal.priority} Priority
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-white/70">{selectedDeal.contact} · {selectedDeal.location}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <span className="text-2xl font-extrabold text-green-400">${selectedDeal.value.toLocaleString()}</span>
                      <span className="rounded-lg bg-white/10 px-3 py-1 text-sm font-semibold text-white/90">
                        Contract {selectedDeal.contract.version}
                      </span>
                      <span className={`rounded-lg px-3 py-1 text-xs font-bold ${legalBadge(selectedDeal.legal.reviewStatus)}`}>
                        Legal: {selectedDeal.legal.reviewStatus}
                      </span>
                      <span className={`rounded-lg px-3 py-1 text-xs font-bold ${approvalBadge(selectedDeal.approval.status)}`}>
                        Approval: {selectedDeal.approval.status}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => setShowDetailModal(false)} className="text-white/60 hover:text-white">
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 bg-white px-6">
                <div className="flex gap-6 overflow-x-auto">
                  {['overview', 'contract', 'pricing', 'approval', 'activity', 'notes'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`shrink-0 border-b-2 px-1 py-3 text-sm font-semibold capitalize transition ${
                        activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab === 'overview' && <span className="flex items-center gap-1"><ClipboardList className="h-3.5 w-3.5" /> Overview</span>}
                      {tab === 'contract' && <span className="flex items-center gap-1"><FileCheck className="h-3.5 w-3.5" /> Contract</span>}
                      {tab === 'pricing' && <span className="flex items-center gap-1"><Banknote className="h-3.5 w-3.5" /> Pricing</span>}
                      {tab === 'approval' && <span className="flex items-center gap-1"><CheckSquare className="h-3.5 w-3.5" /> Approval ({selectedDeal.approval.approvers.length})</span>}
                      {tab === 'activity' && <span className="flex items-center gap-1"><PhoneCall className="h-3.5 w-3.5" /> Activity ({selectedDeal.activities.length})</span>}
                      {tab === 'notes' && <span className="flex items-center gap-1"><StickyNote className="h-3.5 w-3.5" /> Notes ({selectedDeal.notes.length})</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-6">

                {/* ─── Overview Tab ─── */}
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {/* Contact Info */}
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                          <User className="h-4 w-4 text-blue-600" />Contact Information
                        </h3>
                        <div className="space-y-2 text-sm">
                          {[
                            [Mail, selectedDeal.email],
                            [Phone, selectedDeal.phone],
                            [MapPin, selectedDeal.location],
                            [Calendar, `Close: ${new Date(selectedDeal.expectedCloseDate).toLocaleDateString()}`],
                            [User, `Assigned: ${selectedDeal.assignedTo}`],
                          ].map(([Icon, val], i) => (
                            <div key={i} className="flex items-center gap-2 text-gray-700">
                              <Icon className="h-4 w-4 shrink-0 text-gray-400" />{val}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Deal Summary */}
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                          <DollarSign className="h-4 w-4 text-green-600" />Deal Summary
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Base Price</span>
                            <span className="font-semibold">${selectedDeal.pricing.basePrice.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Discount</span>
                            <span className="font-semibold text-red-600">-{selectedDeal.pricing.discountPct}%</span>
                          </div>
                          <div className="flex justify-between border-t border-gray-200 pt-2">
                            <span className="font-bold text-gray-900">Final Price</span>
                            <span className="font-extrabold text-green-600">${selectedDeal.pricing.finalPrice.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between pt-1">
                            <span className="text-gray-600">Payment Type</span>
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 capitalize">{selectedDeal.paymentTerms.type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Source</span>
                            <span className="font-medium">{selectedDeal.source}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Legal Review */}
                    <div className={`rounded-lg border p-4 ${
                      selectedDeal.legal.reviewStatus === 'approved' ? 'border-green-200 bg-green-50' :
                      selectedDeal.legal.reviewStatus === 'in-review' ? 'border-yellow-200 bg-yellow-50' :
                      'border-gray-200 bg-gray-50'
                    }`}>
                      <h3 className="mb-2 flex items-center gap-2 font-semibold text-gray-900">
                        <Shield className="h-4 w-4 text-blue-600" />Legal Review
                      </h3>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Status</div>
                          <div className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${legalBadge(selectedDeal.legal.reviewStatus)}`}>
                            {selectedDeal.legal.reviewStatus}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">Reviewer</div>
                          <div className="mt-1 font-semibold text-gray-900">{selectedDeal.legal.reviewer || '—'}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Review Date</div>
                          <div className="mt-1 font-semibold text-gray-900">{selectedDeal.legal.reviewedDate ? new Date(selectedDeal.legal.reviewedDate).toLocaleDateString() : '—'}</div>
                        </div>
                      </div>
                      {selectedDeal.legal.notes && (
                        <p className="mt-3 rounded-lg bg-white/70 p-2 text-sm text-gray-700">
                          {selectedDeal.legal.notes}
                        </p>
                      )}
                    </div>

                    {/* Close Date & Files Quick Preview */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className={`rounded-lg border p-4 ${
                        daysUntilClose(selectedDeal.expectedCloseDate) < 0 ? 'border-red-200 bg-red-50' :
                        daysUntilClose(selectedDeal.expectedCloseDate) <= 7 ? 'border-orange-200 bg-orange-50' :
                        'border-blue-200 bg-blue-50'
                      }`}>
                        <h3 className="mb-2 flex items-center gap-2 font-semibold text-gray-900">
                          <Clock className="h-4 w-4" />Close Date Tracking
                        </h3>
                        <div className="text-2xl font-extrabold text-gray-900">
                          {daysUntilClose(selectedDeal.expectedCloseDate) > 0
                            ? `${daysUntilClose(selectedDeal.expectedCloseDate)} days left`
                            : daysUntilClose(selectedDeal.expectedCloseDate) === 0
                            ? 'Due today'
                            : `${Math.abs(daysUntilClose(selectedDeal.expectedCloseDate))} days overdue`
                          }
                        </div>
                        <div className="mt-1 text-xs text-gray-600">{new Date(selectedDeal.expectedCloseDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                      </div>

                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <h3 className="mb-2 flex items-center gap-2 font-semibold text-gray-900">
                          <Paperclip className="h-4 w-4 text-gray-500" />Files ({selectedDeal.files.length})
                        </h3>
                        {selectedDeal.files.length > 0 ? (
                          selectedDeal.files.map(f => (
                            <div key={f.id} className="flex items-center justify-between rounded-lg bg-white p-2 mb-1 text-sm border border-gray-100">
                              <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-orange-500" /><span className="truncate">{f.name}</span></div>
                              <button className="text-blue-600 hover:text-blue-800"><Download className="h-3.5 w-3.5" /></button>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-gray-400">No files attached</p>
                        )}
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                      <button onClick={() => { setShowDetailModal(false); setShowContractModal(true) }}
                        className="flex items-center justify-center gap-2 rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm font-semibold text-orange-700 hover:bg-orange-100">
                        <Upload className="h-4 w-4" />Upload Contract
                      </button>
                      <button onClick={() => { setShowDetailModal(false); setShowSignatureModal(true) }}
                        className="flex items-center justify-center gap-2 rounded-lg border border-purple-200 bg-purple-50 p-3 text-sm font-semibold text-purple-700 hover:bg-purple-100">
                        <PenLine className="h-4 w-4" />Send for Signature
                      </button>
                      <button onClick={() => { setShowDetailModal(false); setShowNotesModal(true) }}
                        className="flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm font-semibold text-blue-700 hover:bg-blue-100">
                        <MessageSquare className="h-4 w-4" />Add Note
                      </button>
                      <button onClick={() => { setShowDetailModal(false); handleWinDeal(selectedDeal) }}
                        className="flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-100">
                        <Star className="h-4 w-4" />Win Deal
                      </button>
                    </div>
                  </div>
                )}

                {/* ─── Contract Tab ─── */}
                {activeTab === 'contract' && (
                  <div className="space-y-4">
                    {/* Contract Status Banner */}
                    <div className={`rounded-xl border p-5 ${
                      selectedDeal.contract.status === 'signed'   ? 'border-emerald-200 bg-emerald-50' :
                      selectedDeal.contract.status === 'approved' ? 'border-green-200 bg-green-50' :
                      selectedDeal.contract.status === 'under-review' ? 'border-yellow-200 bg-yellow-50' :
                      selectedDeal.contract.status === 'rejected' ? 'border-red-200 bg-red-50' :
                      'border-blue-200 bg-blue-50'
                    }`}>
                      <div className="flex items-center gap-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                          selectedDeal.contract.status === 'signed' ? 'bg-emerald-500' :
                          selectedDeal.contract.status === 'approved' ? 'bg-green-500' :
                          selectedDeal.contract.status === 'under-review' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`}>
                          {selectedDeal.contract.status === 'signed' ? <CheckCircle className="h-6 w-6 text-white" /> :
                           selectedDeal.contract.status === 'approved' ? <ThumbsUp className="h-6 w-6 text-white" /> :
                           <FileText className="h-6 w-6 text-white" />}
                        </div>
                        <div>
                          <div className="text-lg font-bold text-gray-900 capitalize">Contract {selectedDeal.contract.status}</div>
                          <div className="text-sm text-gray-600">Version: {selectedDeal.contract.version}</div>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
                        <div>
                          <div className="text-gray-600">Sent Date</div>
                          <div className="font-semibold text-gray-900">{new Date(selectedDeal.contract.sentDate).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Signed Date</div>
                          <div className="font-semibold text-gray-900">{selectedDeal.contract.signedDate ? new Date(selectedDeal.contract.signedDate).toLocaleDateString() : 'Not yet signed'}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">File</div>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-orange-500" />
                            <span className="font-semibold text-blue-600">{selectedDeal.contract.file}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contract Actions */}
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                      <button onClick={() => { setShowDetailModal(false); setShowContractModal(true) }}
                        className="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm font-semibold text-orange-700 hover:bg-orange-100">
                        <Upload className="h-4 w-4" />Upload New Version
                      </button>
                      <button onClick={() => { setShowDetailModal(false); setShowSignatureModal(true) }}
                        className="flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 p-3 text-sm font-semibold text-purple-700 hover:bg-purple-100">
                        <Send className="h-4 w-4" />Send for Signature
                      </button>
                      <button className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm font-semibold text-blue-700 hover:bg-blue-100">
                        <Download className="h-4 w-4" />Download Contract
                      </button>
                    </div>

                    {/* Contract Timeline */}
                    <div className="rounded-lg border border-gray-200 bg-white p-4">
                      <h3 className="mb-4 font-semibold text-gray-900">Contract Stages</h3>
                      <div className="relative">
                        {['Draft', 'Sent', 'Under Review', 'Approved', 'Signed'].map((s, i) => {
                          const statuses = ['draft', 'sent', 'under-review', 'approved', 'signed']
                          const currentIdx = statuses.indexOf(selectedDeal.contract.status)
                          const isDone = i <= currentIdx
                          return (
                            <div key={s} className="mb-3 flex items-center gap-4 last:mb-0">
                              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${isDone ? 'border-green-500 bg-green-500' : 'border-gray-300 bg-white'}`}>
                                {isDone ? <CheckCircle className="h-4 w-4 text-white" /> : <Circle className="h-4 w-4 text-gray-300" />}
                              </div>
                              <div className="flex-1">
                                <div className={`text-sm font-semibold ${isDone ? 'text-gray-900' : 'text-gray-400'}`}>{s}</div>
                              </div>
                              {i === currentIdx && (
                                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">Current</span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── Pricing Tab ─── */}
                {activeTab === 'pricing' && (
                  <div className="space-y-4">
                    {/* Price Summary */}
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-xs text-gray-500">Base Price</div>
                          <div className="text-xl font-bold text-gray-700">${selectedDeal.pricing.basePrice.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Discount</div>
                          <div className="text-xl font-bold text-red-600">-{selectedDeal.pricing.discountPct}%</div>
                          <div className="text-xs text-red-500">-${(selectedDeal.pricing.basePrice - selectedDeal.pricing.finalPrice).toLocaleString()}</div>
                        </div>
                        <div className="rounded-lg bg-green-50 p-2">
                          <div className="text-xs text-green-600">Final Price</div>
                          <div className="text-2xl font-extrabold text-green-700">${selectedDeal.pricing.finalPrice.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>

                    {/* Price Breakdown Table */}
                    <div className="rounded-lg border border-gray-200 overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            {['Item', 'Qty', 'Rate', 'Total'].map(h => (
                              <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-600">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {selectedDeal.pricing.breakdown.map((row, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="px-4 py-3 font-medium text-gray-900">{row.item}</td>
                              <td className="px-4 py-3 text-gray-600">{row.qty}</td>
                              <td className="px-4 py-3 text-gray-600">${row.rate.toLocaleString()}</td>
                              <td className="px-4 py-3 font-semibold text-gray-900">${row.total.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50">
                          <tr>
                            <td colSpan={3} className="px-4 py-3 text-right text-sm font-bold text-gray-900">Total</td>
                            <td className="px-4 py-3 text-sm font-extrabold text-green-700">${selectedDeal.pricing.finalPrice.toLocaleString()}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {/* Payment Schedule */}
                    <div className="rounded-lg border border-gray-200 bg-white p-4">
                      <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                        <CreditCard className="h-4 w-4 text-blue-600" />
                        Payment Schedule
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700 capitalize">{selectedDeal.paymentTerms.type}</span>
                      </h3>
                      <div className="space-y-2">
                        {selectedDeal.paymentTerms.schedule.map((s, i) => (
                          <div key={i} className={`flex items-center justify-between rounded-lg p-3 ${
                            s.status === 'paid' ? 'bg-green-50 border border-green-200' :
                            s.status === 'cancelled' ? 'bg-red-50 border border-red-200' :
                            'bg-gray-50 border border-gray-200'
                          }`}>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">{s.milestone}</div>
                              <div className="text-xs text-gray-500">Due: {new Date(s.dueDate).toLocaleDateString()}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-gray-900">${s.amount.toLocaleString()}</div>
                              <span className={`text-xs font-semibold capitalize ${
                                s.status === 'paid' ? 'text-green-600' :
                                s.status === 'cancelled' ? 'text-red-600' :
                                'text-yellow-600'
                              }`}>
                                {s.status === 'paid' ? 'Paid' : s.status === 'cancelled' ? 'Cancelled' : 'Pending'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── Approval Tab ─── */}
                {activeTab === 'approval' && (
                  <div className="space-y-4">
                    {/* Overall Status */}
                    <div className={`rounded-xl border p-4 ${
                      selectedDeal.approval.status === 'approved' ? 'border-green-200 bg-green-50' :
                      selectedDeal.approval.status === 'rejected' ? 'border-red-200 bg-red-50' :
                      'border-blue-200 bg-blue-50'
                    }`}>
                      <div className="flex items-center gap-3">
                        {selectedDeal.approval.status === 'approved'
                          ? <CheckCircle className="h-7 w-7 text-green-500" />
                          : selectedDeal.approval.status === 'rejected'
                          ? <AlertTriangle className="h-7 w-7 text-red-500" />
                          : <Clock className="h-7 w-7 text-blue-500" />
                        }
                        <div>
                          <div className="text-lg font-bold text-gray-900 capitalize">Approval {selectedDeal.approval.status}</div>
                          <div className="text-sm text-gray-600">
                            {selectedDeal.approval.approvers.filter(a => a.status === 'approved').length} of {selectedDeal.approval.approvers.length} approvers signed off
                          </div>
                        </div>
                      </div>
                      {/* Progress Bar */}
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full rounded-full bg-green-500 transition-all"
                          style={{ width: `${(selectedDeal.approval.approvers.filter(a => a.status === 'approved').length / selectedDeal.approval.approvers.length) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Approver Cards */}
                    {selectedDeal.approval.approvers.map((approver, i) => (
                      <div key={i} className={`rounded-lg border p-4 ${
                        approver.status === 'approved' ? 'border-green-200 bg-green-50' :
                        approver.status === 'rejected' ? 'border-red-200 bg-red-50' :
                        approver.status === 'in-review' ? 'border-yellow-200 bg-yellow-50' :
                        'border-gray-200 bg-gray-50'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ${
                              approver.status === 'approved' ? 'bg-green-500' :
                              approver.status === 'rejected' ? 'bg-red-500' :
                              approver.status === 'in-review' ? 'bg-yellow-500' :
                              'bg-gray-400'
                            }`}>
                              {approver.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{approver.name}</div>
                              <div className="text-xs text-gray-500">{approver.role}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${approvalBadge(approver.status)}`}>
                              {approver.status === 'approved' ? 'Approved' :
                               approver.status === 'rejected' ? 'Rejected' :
                               approver.status === 'in-review' ? 'In Review' :
                               'Pending'}
                            </span>
                            {approver.date && <div className="mt-1 text-xs text-gray-500">{new Date(approver.date).toLocaleDateString()}</div>}
                          </div>
                        </div>
                        {approver.comment && (
                          <div className="mt-2 rounded-lg bg-white/70 p-2 text-sm italic text-gray-700">
                            &ldquo;{approver.comment}&rdquo;
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* ─── Activity Tab ─── */}
                {activeTab === 'activity' && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {[
                        { icon: Phone, label: 'Log Call', color: 'blue' },
                        { icon: Mail, label: 'Log Email', color: 'purple' },
                        { icon: Video, label: 'Log Meeting', color: 'green' },
                        { icon: FileText, label: 'Contract Action', color: 'orange' },
                      ].map(({ icon: Icon, label, color }) => (
                        <button key={label} className={`flex items-center gap-2 rounded-lg border border-${color}-200 bg-${color}-50 px-3 py-2 text-xs font-semibold text-${color}-700 hover:bg-${color}-100`}>
                          <Icon className="h-3.5 w-3.5" />{label}
                        </button>
                      ))}
                    </div>

                    {selectedDeal.activities.length > 0 ? (
                      <div className="relative space-y-4 pl-8">
                        <div className="absolute left-3 top-2 h-[calc(100%-16px)] w-0.5 bg-gray-200" />
                        {selectedDeal.activities.map((act) => (
                          <div key={act.id} className="relative">
                            <div className="absolute -left-8 top-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-gray-200 bg-white">
                              {activityIcon(act.type)}
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-white p-4">
                              <div className="font-semibold text-gray-900">{act.description}</div>
                              <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                                <Clock className="h-3 w-3" />{act.date} · {act.by}
                                <span className={`ml-1 rounded-full px-2 py-0.5 capitalize font-semibold ${
                                  act.type === 'call' ? 'bg-blue-100 text-blue-700' :
                                  act.type === 'email' ? 'bg-purple-100 text-purple-700' :
                                  act.type === 'contract' ? 'bg-orange-100 text-orange-700' :
                                  'bg-green-100 text-green-700'
                                }`}>{act.type}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-gray-200 bg-gray-50 py-10 text-center text-gray-500">
                        <Activity className="mx-auto mb-2 h-10 w-10 text-gray-300" />
                        <p className="font-semibold">No activities logged yet</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ─── Notes Tab ─── */}
                {activeTab === 'notes' && (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-gray-200 bg-white p-4">
                      <textarea
                        placeholder="Add a note or condition about this deal..."
                        rows={3}
                        className="w-full resize-none rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                      <div className="mt-2 flex justify-end">
                        <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                          <Send className="h-4 w-4" />Save Note
                        </button>
                      </div>
                    </div>

                    {selectedDeal.notes.length > 0 ? (
                      selectedDeal.notes.map((note) => (
                        <div key={note.id} className="rounded-lg border border-gray-200 bg-white p-4">
                          <p className="text-sm text-gray-900">{note.text}</p>
                          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                            <span>{new Date(note.date).toLocaleDateString()} · {note.by}</span>
                            <div className="flex gap-2">
                              <button className="text-blue-600 hover:text-blue-700"><Edit className="h-3.5 w-3.5" /></button>
                              <button className="text-red-500 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-lg border border-gray-200 bg-gray-50 py-8 text-center text-gray-500">
                        <MessageSquare className="mx-auto mb-2 h-10 w-10 text-gray-300" />
                        <p className="font-semibold">No notes yet</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 p-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowDetailModal(false); setShowLoseModal(true) }}
                    className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    <ThumbsDown className="h-4 w-4" />Lose Deal
                  </button>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowDetailModal(false)} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                    Close
                  </button>
                  <button
                    onClick={() => { setShowDetailModal(false); handleWinDeal(selectedDeal) }}
                    className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    <Star className="h-4 w-4" />Win Deal → Move to Clients
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════
          CONTRACT UPLOAD MODAL
      ════════════════════════════════════════ */}
      <AnimatePresence>
        {showContractModal && selectedDeal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                  <Upload className="h-5 w-5 text-orange-600" />Upload Contract
                </h2>
                <button onClick={() => setShowContractModal(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
              </div>

              <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                <strong>{selectedDeal.company}</strong> · Current version: {selectedDeal.contract.version}
              </div>

              {/* Upload Area */}
              <div className="mb-4 cursor-pointer rounded-xl border-2 border-dashed border-gray-300 p-8 text-center transition hover:border-blue-400 hover:bg-blue-50">
                <Upload className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                <p className="text-sm font-semibold text-gray-700">Drag & drop contract file here</p>
                <p className="mt-1 text-xs text-gray-500">PDF, DOCX up to 20MB</p>
                <button className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700">Browse Files</button>
              </div>

              <div className="mb-4 space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Contract Version</label>
                  <input type="text" defaultValue="v2.0" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Notes / Changes</label>
                  <textarea rows={2} placeholder="What changed in this version..." className="w-full resize-none rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Legal Review Required</label>
                  <select className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500">
                    <option>Yes — send to legal team</option>
                    <option>No — already reviewed</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={() => setShowContractModal(false)} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={() => setShowContractModal(false)} className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700">
                  <Upload className="h-4 w-4" />Upload Contract
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════
          SEND FOR SIGNATURE MODAL
      ════════════════════════════════════════ */}
      <AnimatePresence>
        {showSignatureModal && selectedDeal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                  <PenLine className="h-5 w-5 text-purple-600" />Send for Signature
                </h2>
                <button onClick={() => setShowSignatureModal(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
              </div>

              {/* Recipient Info */}
              <div className="mb-4 rounded-lg border border-purple-200 bg-purple-50 p-4">
                <div className="text-sm font-bold text-purple-900">{selectedDeal.company}</div>
                <div className="mt-1 flex items-center gap-2 text-sm text-purple-700">
                  <User className="h-3.5 w-3.5" />{selectedDeal.contact}
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-sm text-purple-700">
                  <Mail className="h-3.5 w-3.5" />{selectedDeal.email}
                </div>
              </div>

              <div className="mb-4 space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Contract to Send</label>
                  <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <FileText className="h-5 w-5 text-orange-500" />
                    <span className="text-sm font-medium text-gray-800">{selectedDeal.contract.file}</span>
                    <span className="ml-auto rounded bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">{selectedDeal.contract.version}</span>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Signature Method</label>
                  <select className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500">
                    <option>DocuSign — Electronic Signature</option>
                    <option>Adobe Sign — Electronic Signature</option>
                    <option>HelloSign</option>
                    <option>Manual — Wet Signature (Print & Scan)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Signing Deadline</label>
                  <input type="date" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500" defaultValue={selectedDeal.expectedCloseDate} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Message to Signer</label>
                  <textarea
                    rows={3}
                    defaultValue={`Dear ${selectedDeal.contact},\n\nPlease review and sign the attached contract at your earliest convenience.`}
                    className="w-full resize-none rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="reminder" className="h-4 w-4 rounded border-gray-300" defaultChecked />
                  <label htmlFor="reminder" className="text-sm text-gray-700">Send automatic reminder after 3 days if unsigned</label>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={() => setShowSignatureModal(false)} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={() => setShowSignatureModal(false)} className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700">
                  <Send className="h-4 w-4" />Send for Signature
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════
          NOTES / CONDITIONS MODAL
      ════════════════════════════════════════ */}
      <AnimatePresence>
        {showNotesModal && selectedDeal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                  <MessageSquare className="h-5 w-5 text-blue-600" />Add Note / Condition
                </h2>
                <button onClick={() => setShowNotesModal(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
              </div>

              <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm font-semibold text-blue-800">
                {selectedDeal.company}
              </div>

              <div className="mb-4 space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Note Type</label>
                  <select className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500">
                    <option>General Note</option>
                    <option>Special Condition</option>
                    <option>Client Request</option>
                    <option>Pricing Note</option>
                    <option>Legal Condition</option>
                    <option>Internal Only</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Note</label>
                  <textarea
                    rows={5}
                    placeholder="Enter note or special condition for this deal..."
                    className="w-full resize-none rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="notify" className="h-4 w-4 rounded border-gray-300" />
                  <label htmlFor="notify" className="text-sm text-gray-700">Notify team members via email</label>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={() => setShowNotesModal(false)} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={() => setShowNotesModal(false)} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                  <Send className="h-4 w-4" />Save Note
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════
          WIN DEAL CONFIRMATION
      ════════════════════════════════════════ */}
      <AnimatePresence>
        {showWinModal && selectedDeal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"
            >
              <div className="mb-4 text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                  <Star className="h-8 w-8 text-emerald-600" />
                </div>
                <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2"><PartyPopper className="h-6 w-6 text-emerald-500" /> Win This Deal?</h2>
                <p className="mt-1 text-sm text-gray-500">This deal will be marked as WON and moved to the Clients module.</p>
              </div>

              <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">{selectedDeal.company}</div>
                  <div className="mt-1 text-3xl font-extrabold text-emerald-600">${selectedDeal.value.toLocaleString()}</div>
                  <div className="mt-1 text-sm text-gray-500">{selectedDeal.contact} · {selectedDeal.assignedTo}</div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowWinModal(false)} className="flex-1 rounded-lg border border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={confirmWin} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-sm font-bold text-white hover:bg-emerald-700">
                  <Star className="h-4 w-4" />Confirm Win → Clients
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════
          LOSE DEAL CONFIRMATION
      ════════════════════════════════════════ */}
      <AnimatePresence>
        {showLoseModal && selectedDeal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"
            >
              <div className="mb-4 text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                  <TrendingDown className="h-8 w-8 text-red-500" />
                </div>
                <h2 className="text-xl font-extrabold text-gray-900">Mark Deal as Lost?</h2>
                <p className="mt-1 text-sm text-gray-500">The deal will be moved to Lost. You can reopen it from the Lost column.</p>
              </div>

              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-center">
                <div className="font-bold text-gray-900">{selectedDeal.company}</div>
                <div className="text-lg font-extrabold text-red-600">${selectedDeal.value.toLocaleString()}</div>
              </div>

              <div className="mb-4">
                <label className="mb-1 block text-sm font-semibold text-gray-700">Reason for Loss <span className="text-red-500">*</span></label>
                <select
                  value={loseReason}
                  onChange={(e) => setLoseReason(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-red-400"
                >
                  <option value="">Select reason...</option>
                  <option>Lost to Competitor</option>
                  <option>Budget Constraints</option>
                  <option>Timeline Mismatch</option>
                  <option>No Decision Made</option>
                  <option>Product Not a Fit</option>
                  <option>Pricing Too High</option>
                  <option>Deal Cancelled by Client</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="mb-5">
                <label className="mb-1 block text-sm font-semibold text-gray-700">Additional Notes</label>
                <textarea
                  rows={2}
                  placeholder="Any additional context..."
                  className="w-full resize-none rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-red-400"
                />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowLoseModal(false)} className="flex-1 rounded-lg border border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
                <button
                  onClick={confirmLose}
                  disabled={!loseReason}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ThumbsDown className="h-4 w-4" />Confirm Lost → Back to Opportunities
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}

export default DealsModule
