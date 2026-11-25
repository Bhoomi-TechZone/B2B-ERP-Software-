import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { 
  X, 
  Calendar, 
  Clock, 
  Video, 
  Users, 
  Mail, 
  CheckCircle, 
  AlertCircle,
  Building2,
  User,
  DollarSign,
  Target,
  Bell,
  Send,
  Save,
  Lightbulb,
  Link as LinkIcon,
  Zap
} from 'lucide-react'

const DemoScheduleModal = ({ opportunity, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    demo_type: 'discovery',
    demo_date: '',
    demo_time: '',
    demo_duration: 30,
    demo_meeting_link: '',
    demo_focus_areas: '',
    attendee_emails: '',
    send_calendar_invite: true,
    reminder_before: '1_hour',
    meeting_platform: 'zoom',
    demo_notes: ''
  })

  const [errors, setErrors] = useState({})
  const [isDraft, setIsDraft] = useState(false)

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const draftKey = `demo_draft_${opportunity?.id}`
    const savedDraft = localStorage.getItem(draftKey)
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft)
        setFormData(prev => ({ ...prev, ...parsed }))
        setIsDraft(true)
      } catch (e) {
        console.error('Failed to load draft:', e)
      }
    }

    const interval = setInterval(() => {
      if (formData.demo_date || formData.demo_meeting_link) {
        localStorage.setItem(draftKey, JSON.stringify(formData))
        setIsDraft(true)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [formData, opportunity?.id])

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.demo_date) {
      newErrors.demo_date = 'Demo date is required'
    } else {
      const selectedDate = new Date(formData.demo_date + 'T' + (formData.demo_time || '00:00'))
      const now = new Date()
      if (selectedDate < now) {
        newErrors.demo_date = 'Cannot schedule demo in the past'
      }
    }

    if (!formData.demo_time) {
      newErrors.demo_time = 'Demo time is required'
    }

    if (!formData.demo_meeting_link) {
      newErrors.demo_meeting_link = 'Meeting link is required'
    } else {
      try {
        new URL(formData.demo_meeting_link)
      } catch (e) {
        newErrors.demo_meeting_link = 'Please enter a valid URL'
      }
    }

    if (formData.attendee_emails) {
      const emails = formData.attendee_emails.split(',').map(e => e.trim())
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const invalidEmails = emails.filter(email => !emailRegex.test(email))
      if (invalidEmails.length > 0) {
        newErrors.attendee_emails = `Invalid email(s): ${invalidEmails.join(', ')}`
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
      demo_type: formData.demo_type,
      demo_date: new Date(formData.demo_date + 'T' + formData.demo_time).toISOString(),
      demo_duration: parseInt(formData.demo_duration),
      demo_meeting_link: formData.demo_meeting_link,
      demo_focus_areas: formData.demo_focus_areas.split(',').map(s => s.trim()).filter(Boolean),
      internal_attendees: [],
      send_calendar_invite: formData.send_calendar_invite,
      reminder_before: formData.reminder_before,
      meeting_platform: formData.meeting_platform,
      attendee_emails: formData.attendee_emails.split(',').map(e => e.trim()).filter(Boolean),
      demo_notes: formData.demo_notes
    }

    // Clear draft after successful submit
    localStorage.removeItem(`demo_draft_${opportunity?.id}`)
    
    onSubmit(payload)
  }

  const handleSaveDraft = () => {
    const draftKey = `demo_draft_${opportunity?.id}`
    localStorage.setItem(draftKey, JSON.stringify(formData))
    setIsDraft(true)
    alert('Draft saved successfully!')
  }

  const clearDraft = () => {
    const draftKey = `demo_draft_${opportunity?.id}`
    localStorage.removeItem(draftKey)
    setIsDraft(false)
    setFormData({
      demo_type: 'discovery',
      demo_date: '',
      demo_time: '',
      demo_duration: 30,
      demo_meeting_link: '',
      demo_focus_areas: '',
      attendee_emails: '',
      send_calendar_invite: true,
      reminder_before: '1_hour',
      meeting_platform: 'zoom',
      demo_notes: ''
    })
  }

  const getMinDateTime = () => {
    const now = new Date()
    return now.toISOString().split('T')[0]
  }

  const platformIcons = {
    zoom: '🔵',
    google_meet: '🟢',
    microsoft_teams: '🟣',
    other: '🔗'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <Video className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Schedule Product Demo</h2>
                  <p className="text-sm text-gray-600">Book a demonstration session with the prospect</p>
                </div>
              </div>
              
              {/* Context Card */}
              <div className="mt-4 rounded-lg border border-blue-200 bg-white p-4 shadow-sm">
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
                      Stage: {opportunity?.rawStage?.replace('_', ' ') || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {isDraft && (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
                  <Save className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-semibold text-amber-800">Draft saved • Auto-saving enabled</span>
                  <button 
                    onClick={clearDraft}
                    className="ml-auto text-xs font-semibold text-amber-700 hover:text-amber-900 underline"
                  >
                    Clear Draft
                  </button>
                </div>
              )}
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
          {/* Demo Type & Duration */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold text-gray-700">
                Demo Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.demo_type}
                onChange={(e) => setFormData(prev => ({ ...prev, demo_type: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="discovery">Discovery Demo (Overview)</option>
                <option value="technical">Technical Deep Dive</option>
                <option value="executive">Executive Presentation</option>
                <option value="custom">Custom Demo</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-700">
                Duration <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.demo_duration}
                onChange={(e) => setFormData(prev => ({ ...prev, demo_duration: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
              </select>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold text-gray-700">
                Demo Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.demo_date}
                onChange={(e) => setFormData(prev => ({ ...prev, demo_date: e.target.value }))}
                min={getMinDateTime()}
                className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:ring-2 ${
                  errors.demo_date 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
                }`}
              />
              {errors.demo_date && (
                <div className="mt-1 flex items-center gap-1 text-xs text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  {errors.demo_date}
                </div>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-700">
                Demo Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={formData.demo_time}
                onChange={(e) => setFormData(prev => ({ ...prev, demo_time: e.target.value }))}
                className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:ring-2 ${
                  errors.demo_time 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
                }`}
              />
              {errors.demo_time && (
                <div className="mt-1 flex items-center gap-1 text-xs text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  {errors.demo_time}
                </div>
              )}
            </div>
          </div>

          {/* Meeting Platform & Link */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold text-gray-700">
                Meeting Platform <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.meeting_platform}
                onChange={(e) => setFormData(prev => ({ ...prev, meeting_platform: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="zoom">{platformIcons.zoom} Zoom</option>
                <option value="google_meet">{platformIcons.google_meet} Google Meet</option>
                <option value="microsoft_teams">{platformIcons.microsoft_teams} Microsoft Teams</option>
                <option value="other">{platformIcons.other} Other Platform</option>
              </select>
              <div className="mt-2 flex items-center gap-2">
                {formData.meeting_platform === 'zoom' && (
                  <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                    <CheckCircle className="h-3 w-3" />
                    Zoom Connected
                  </span>
                )}
                {formData.meeting_platform === 'google_meet' && (
                  <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                    <CheckCircle className="h-3 w-3" />
                    Google Meet Connected
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-700">
                Meeting Link <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="url"
                  value={formData.demo_meeting_link}
                  onChange={(e) => setFormData(prev => ({ ...prev, demo_meeting_link: e.target.value }))}
                  placeholder="https://zoom.us/j/..."
                  className={`w-full rounded-lg border pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 ${
                    errors.demo_meeting_link 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
                  }`}
                />
              </div>
              {errors.demo_meeting_link && (
                <div className="mt-1 flex items-center gap-1 text-xs text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  {errors.demo_meeting_link}
                </div>
              )}
            </div>
          </div>

          {/* Attendee Emails */}
          <div>
            <label className="mb-2 block text-sm font-bold text-gray-700">
              Attendee Emails (comma-separated)
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={formData.attendee_emails}
                onChange={(e) => setFormData(prev => ({ ...prev, attendee_emails: e.target.value }))}
                placeholder="john@company.com, jane@company.com"
                className={`w-full rounded-lg border pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 ${
                  errors.attendee_emails 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
                }`}
              />
            </div>
            {errors.attendee_emails && (
              <div className="mt-1 flex items-center gap-1 text-xs text-red-600">
                <AlertCircle className="h-3 w-3" />
                {errors.attendee_emails}
              </div>
            )}
          </div>

          {/* Focus Areas */}
          <div>
            <label className="mb-2 block text-sm font-bold text-gray-700">
              Demo Focus Areas (comma-separated)
            </label>
            <textarea
              rows={3}
              value={formData.demo_focus_areas}
              onChange={(e) => setFormData(prev => ({ ...prev, demo_focus_areas: e.target.value }))}
              placeholder="Payroll automation, Employee onboarding, Performance management"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
            />
          </div>

          {/* Demo Notes */}
          <div>
            <label className="mb-2 block text-sm font-bold text-gray-700">
              Internal Demo Notes
            </label>
            <textarea
              rows={3}
              value={formData.demo_notes}
              onChange={(e) => setFormData(prev => ({ ...prev, demo_notes: e.target.value }))}
              placeholder="Preparation notes, special requirements, key stakeholders..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
            />
          </div>

          {/* Email & Reminder Options */}
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-blue-900">
              <Zap className="h-4 w-4" />
              Automation Settings
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.send_calendar_invite}
                  onChange={(e) => setFormData(prev => ({ ...prev, send_calendar_invite: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-semibold text-gray-700">Send calendar invite to attendees</span>
                </div>
              </label>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Send reminder before:
                </label>
                <select
                  value={formData.reminder_before}
                  onChange={(e) => setFormData(prev => ({ ...prev, reminder_before: e.target.value }))}
                  disabled={!formData.send_calendar_invite}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="15_min">15 minutes before</option>
                  <option value="30_min">30 minutes before</option>
                  <option value="1_hour">1 hour before</option>
                  <option value="1_day">1 day before</option>
                  <option value="2_days">2 days before</option>
                </select>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
              <div className="text-xs text-amber-900">
                <p className="font-bold mb-1">What happens after scheduling?</p>
                <ul className="ml-4 list-disc space-y-1">
                  <li>Opportunity status will automatically update to <strong>"demo_scheduled"</strong></li>
                  <li>Calendar invites will be sent to all attendees (if enabled)</li>
                  <li>Automated reminder emails will be triggered before the demo</li>
                  <li>A task will be created for the assigned sales rep</li>
                  <li>Activity timeline will be updated with demo details</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 border-t border-gray-200 pt-6">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              <Save className="h-4 w-4" />
              Save Draft
            </button>
            
            <div className="flex items-center gap-3">
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
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg transition hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4" />
                    Schedule Demo
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default DemoScheduleModal
