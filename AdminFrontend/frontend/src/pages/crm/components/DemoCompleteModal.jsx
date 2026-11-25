import { useState } from 'react'
import { motion } from 'motion/react'
import { 
  X, 
  CheckCircle, 
  XCircle, 
  MinusCircle,
  Calendar,
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
  Building2,
  User,
  DollarSign,
  Target,
  AlertCircle,
  Lightbulb,
  ArrowRight,
  Clock
} from 'lucide-react'

const DemoCompleteModal = ({ opportunity, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    demo_notes: '',
    demo_outcome: 'highly_interested',
    follow_up_date: '',
    next_action: 'send_proposal',
    key_concerns: '',
    decision_timeline: '',
    competitors_mentioned: ''
  })

  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.demo_notes.trim()) {
      newErrors.demo_notes = 'Demo notes are required'
    }

    if (formData.demo_outcome === 'not_interested' && !formData.key_concerns.trim()) {
      newErrors.key_concerns = 'Please specify concerns when marking as not interested'
    }

    if (formData.follow_up_date) {
      const followUpDate = new Date(formData.follow_up_date)
      const now = new Date()
      if (followUpDate < now) {
        newErrors.follow_up_date = 'Follow-up date cannot be in the past'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const payload = {
      demo_notes: formData.demo_notes,
      demo_outcome: formData.demo_outcome,
      follow_up_date: formData.follow_up_date || null,
      next_action: formData.next_action,
      key_concerns: formData.key_concerns || null,
      decision_timeline: formData.decision_timeline || null,
      competitors_mentioned: formData.competitors_mentioned || null
    }

    onSubmit(payload)
  }

  const outcomes = [
    {
      value: 'highly_interested',
      label: 'Highly Interested',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      description: 'Prospect is very interested and ready to move forward',
      nextStage: 'Proposal'
    },
    {
      value: 'interested',
      label: 'Interested',
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      description: 'Prospect showed interest but needs more information',
      nextStage: 'Follow-up'
    },
    {
      value: 'neutral',
      label: 'Neutral',
      icon: Minus,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      description: 'Prospect is evaluating options, no strong signal',
      nextStage: 'Nurture'
    },
    {
      value: 'not_interested',
      label: 'Not Interested',
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      description: 'Prospect is not interested at this time',
      nextStage: 'Mark Lost'
    }
  ]

  const nextActions = {
    highly_interested: [
      { value: 'send_proposal', label: 'Send Proposal' },
      { value: 'schedule_technical_demo', label: 'Schedule Technical Demo' },
      { value: 'schedule_executive_meeting', label: 'Schedule Executive Meeting' }
    ],
    interested: [
      { value: 'send_case_study', label: 'Send Case Study' },
      { value: 'schedule_follow_up', label: 'Schedule Follow-up Call' },
      { value: 'send_additional_info', label: 'Send Additional Information' }
    ],
    neutral: [
      { value: 'schedule_follow_up', label: 'Schedule Follow-up Call' },
      { value: 'add_to_nurture', label: 'Add to Nurture Campaign' },
      { value: 'send_roi_calculator', label: 'Send ROI Calculator' }
    ],
    not_interested: [
      { value: 'mark_lost', label: 'Mark as Lost' },
      { value: 'schedule_future_follow_up', label: 'Schedule Future Follow-up' },
      { value: 'add_to_long_term_nurture', label: 'Add to Long-term Nurture' }
    ]
  }

  const selectedOutcome = outcomes.find(o => o.value === formData.demo_outcome)
  const OutcomeIcon = selectedOutcome?.icon || CheckCircle

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-600 text-white">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Complete Demo Session</h2>
                  <p className="text-sm text-gray-600">Record demo outcome and next steps</p>
                </div>
              </div>
              
              {/* Context Card */}
              <div className="mt-4 rounded-lg border border-green-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-500" />
                    <span className="font-semibold text-gray-900">{opportunity?.company || 'N/A'}</span>
                  </div>
                  <div className="h-4 w-px bg-gray-300" />
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{opportunity?.contact || 'N/A'}</span>
                  </div>
                  <div className="h-4 w-px bg-gray-300" />
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-bold text-green-600">${opportunity?.value?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="h-4 w-px bg-gray-300" />
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-600">
                      Current: {opportunity?.rawStage?.replace('_', ' ') || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Hidden field for opportunity ID */}
          <input type="hidden" name="opportunity_id" value={opportunity?.id} />
          
          {/* Demo Outcome Selection */}
          <div>
            <label className="mb-3 block text-sm font-bold text-gray-700">
              Demo Outcome <span className="text-red-500">*</span>
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              {outcomes.map((outcome) => {
                const Icon = outcome.icon
                const isSelected = formData.demo_outcome === outcome.value
                return (
                  <button
                    key={outcome.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, demo_outcome: outcome.value, next_action: nextActions[outcome.value][0].value }))}
                    className={`flex items-start gap-3 rounded-lg border-2 p-4 text-left transition ${
                      isSelected
                        ? `${outcome.borderColor} ${outcome.bgColor} ring-2 ring-offset-2 ${outcome.color.replace('text-', 'ring-')}`
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`h-6 w-6 shrink-0 ${isSelected ? outcome.color : 'text-gray-400'}`} />
                    <div className="flex-1">
                      <div className={`font-bold ${isSelected ? outcome.color : 'text-gray-900'}`}>
                        {outcome.label}
                      </div>
                      <div className="mt-1 text-xs text-gray-600">{outcome.description}</div>
                      <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-gray-500">
                        <ArrowRight className="h-3 w-3" />
                        Next: {outcome.nextStage}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Next Action */}
          <div>
            <label className="mb-2 block text-sm font-bold text-gray-700">
              Next Action <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.next_action}
              onChange={(e) => setFormData(prev => ({ ...prev, next_action: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {nextActions[formData.demo_outcome]?.map((action) => (
                <option key={action.value} value={action.value}>
                  {action.label}
                </option>
              ))}
            </select>
          </div>

          {/* Demo Notes */}
          <div>
            <label className="mb-2 block text-sm font-bold text-gray-700">
              Demo Notes <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={5}
              value={formData.demo_notes}
              onChange={(e) => setFormData(prev => ({ ...prev, demo_notes: e.target.value }))}
              placeholder="What was discussed? Key features shown? Prospect's reactions? Questions asked?"
              className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:ring-2 resize-none ${
                errors.demo_notes 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
              }`}
            />
            {errors.demo_notes && (
              <div className="mt-1 flex items-center gap-1 text-xs text-red-600">
                <AlertCircle className="h-3 w-3" />
                {errors.demo_notes}
              </div>
            )}
          </div>

          {/* Additional Details Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Key Concerns */}
            <div>
              <label className="mb-2 block text-sm font-bold text-gray-700">
                Key Concerns / Objections {formData.demo_outcome === 'not_interested' && <span className="text-red-500">*</span>}
              </label>
              <textarea
                rows={3}
                value={formData.key_concerns}
                onChange={(e) => setFormData(prev => ({ ...prev, key_concerns: e.target.value }))}
                placeholder="Pricing concerns, feature gaps, integration issues..."
                className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:ring-2 resize-none ${
                  errors.key_concerns 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
                }`}
              />
              {errors.key_concerns && (
                <div className="mt-1 flex items-center gap-1 text-xs text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  {errors.key_concerns}
                </div>
              )}
            </div>

            {/* Decision Timeline */}
            <div>
              <label className="mb-2 block text-sm font-bold text-gray-700">
                Decision Timeline
              </label>
              <select
                value={formData.decision_timeline}
                onChange={(e) => setFormData(prev => ({ ...prev, decision_timeline: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Select timeline...</option>
                <option value="immediate">Immediate (1 week)</option>
                <option value="short_term">Short-term (1-4 weeks)</option>
                <option value="medium_term">Medium-term (1-3 months)</option>
                <option value="long_term">Long-term (3-6 months)</option>
                <option value="no_timeline">No specific timeline</option>
              </select>
            </div>
          </div>

          {/* Competitors Mentioned */}
          <div>
            <label className="mb-2 block text-sm font-bold text-gray-700">
              Competitors Mentioned
            </label>
            <input
              type="text"
              value={formData.competitors_mentioned}
              onChange={(e) => setFormData(prev => ({ ...prev, competitors_mentioned: e.target.value }))}
              placeholder="e.g., Workday, BambooHR, Zenefits"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Follow-up Date */}
          <div>
            <label className="mb-2 block text-sm font-bold text-gray-700">
              Follow-up Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={formData.follow_up_date}
                onChange={(e) => setFormData(prev => ({ ...prev, follow_up_date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full rounded-lg border pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 ${
                  errors.follow_up_date 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
                }`}
              />
            </div>
            {errors.follow_up_date && (
              <div className="mt-1 flex items-center gap-1 text-xs text-red-600">
                <AlertCircle className="h-3 w-3" />
                {errors.follow_up_date}
              </div>
            )}
          </div>

          {/* Status Update Info */}
          <div className={`rounded-lg border p-4 ${selectedOutcome?.bgColor} ${selectedOutcome?.borderColor}`}>
            <div className="flex items-start gap-3">
              <OutcomeIcon className={`h-5 w-5 shrink-0 ${selectedOutcome?.color} mt-0.5`} />
              <div className="text-xs text-gray-900">
                <p className="font-bold mb-1">What happens after completing this demo?</p>
                <ul className="ml-4 list-disc space-y-1">
                  <li>Opportunity status will update to <strong>"demo_done"</strong></li>
                  {formData.demo_outcome === 'highly_interested' && (
                    <>
                      <li>Opportunity will move to <strong>Proposal</strong> stage</li>
                      <li>Proposal creation task will be auto-assigned</li>
                    </>
                  )}
                  {formData.demo_outcome === 'interested' && (
                    <>
                      <li>Follow-up task will be created for {formData.follow_up_date || 'specified date'}</li>
                      <li>Opportunity remains in current stage for nurturing</li>
                    </>
                  )}
                  {formData.demo_outcome === 'neutral' && (
                    <>
                      <li>Opportunity will be added to nurture campaign</li>
                      <li>Automated follow-up sequence will begin</li>
                    </>
                  )}
                  {formData.demo_outcome === 'not_interested' && (
                    <>
                      <li>Opportunity will be marked as <strong>Lost</strong></li>
                      <li>Re-engagement date can be set for future follow-up</li>
                    </>
                  )}
                  <li>Activity timeline will be updated with demo completion details</li>
                  <li>All notes will be saved to opportunity history</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-bold text-white shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${
                selectedOutcome?.value === 'highly_interested' 
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                  : selectedOutcome?.value === 'not_interested'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
              }`}
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Complete Demo & Update Status
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default DemoCompleteModal
