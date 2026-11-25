import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  X, Phone, Mail, Video, Calendar, MapPin, Building, User, DollarSign,
  Clock, Target, CheckCircle, AlertCircle, Trash2, Edit, Send, Plus,
  PhoneCall, MessageSquare, FileText, Activity, TrendingUp
} from 'lucide-react'
import crmService from '../../../services/crmService'
import BANTQualification from './BANTQualification'

export default function LeadDetailModal({ lead, isOpen, onClose, onUpdate }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [activities, setActivities] = useState([])
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(false)
  const [showQualifyModal, setShowQualifyModal] = useState(false)
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [activityType, setActivityType] = useState('call')
  const [showNoteModal, setShowNoteModal] = useState(false)
  
  // Activity form state
  const [activityForm, setActivityForm] = useState({
    subject: '',
    notes: '',
    outcome: '',
    duration: '',
    scheduled_at: '',
  })

  // Note form state
  const [noteText, setNoteText] = useState('')

  useEffect(() => {
    if (isOpen && lead) {
      fetchActivities()
      fetchNotes()
    }
  }, [isOpen, lead])

  const fetchActivities = async () => {
    if (!lead?.id) return
    try {
      const response = await crmService.getLeadActivities(lead.id)
      setActivities(response.data || response || [])
    } catch (error) {
      console.error('Failed to fetch activities:', error)
      setActivities([])
    }
  }

  const fetchNotes = async () => {
    // Notes can be part of activities or separate
    // For now, filter activities that are notes
    const noteActivities = activities.filter(a => a.activity_type === 'note')
    setNotes(noteActivities)
  }

  const handleLogActivity = async () => {
    if (!lead?.id) return
    setLoading(true)
    try {
      await crmService.logLeadActivity(lead.id, {
        activity_type: activityType,
        subject: activityForm.subject,
        notes: activityForm.notes,
        outcome: activityForm.outcome,
        duration_minutes: activityForm.duration ? parseInt(activityForm.duration) : null,
        scheduled_at: activityForm.scheduled_at || null,
      })
      
      setShowActivityModal(false)
      setActivityForm({ subject: '', notes: '', outcome: '', duration: '', scheduled_at: '' })
      await fetchActivities()
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('Failed to log activity:', error)
      alert('Failed to log activity: ' + (error.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const handleAddNote = async () => {
    if (!lead?.id || !noteText.trim()) return
    setLoading(true)
    try {
      await crmService.logLeadActivity(lead.id, {
        activity_type: 'note',
        subject: 'Note added',
        notes: noteText,
      })
      
      setShowNoteModal(false)
      setNoteText('')
      await fetchActivities()
      fetchNotes()
    } catch (error) {
      console.error('Failed to add note:', error)
      alert('Failed to add note')
    } finally {
      setLoading(false)
    }
  }

  const handleQualifyLead = () => {
    setShowQualifyModal(true)
  }

  const handleMarkAsLost = async () => {
    if (!confirm('Are you sure you want to mark this lead as lost?')) return
    setLoading(true)
    try {
      await crmService.updateLead(lead.id, { status: 'lost' })
      alert('Lead marked as lost')
      onClose()
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('Failed to mark as lost:', error)
      alert('Failed to mark as lost')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteLead = async () => {
    if (!confirm('Are you sure you want to delete this lead? This action cannot be undone.')) return
    setLoading(true)
    try {
      await crmService.deleteLead(lead.id)
      alert('Lead deleted successfully')
      onClose()
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('Failed to delete lead:', error)
      alert('Failed to delete lead')
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'call': return <PhoneCall className="h-4 w-4" />
      case 'email': return <Mail className="h-4 w-4" />
      case 'meeting': return <Video className="h-4 w-4" />
      case 'note': return <FileText className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getActivityColor = (type) => {
    switch (type) {
      case 'call': return 'bg-blue-100 text-blue-600'
      case 'email': return 'bg-purple-100 text-purple-600'
      case 'meeting': return 'bg-green-100 text-green-600'
      case 'note': return 'bg-amber-100 text-amber-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  if (!isOpen || !lead) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-gray-200 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-xl font-bold text-white">
                {lead.name?.[0] || 'L'}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{lead.name}</h2>
                <p className="text-sm text-gray-500">{lead.contact} • {lead.source}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    lead.status === 'new' ? 'bg-blue-100 text-blue-700' :
                    lead.status === 'contacted' ? 'bg-amber-100 text-amber-700' :
                    lead.status === 'qualified' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {lead.status}
                  </span>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    lead.priority === 'high' ? 'bg-red-100 text-red-700' :
                    lead.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {lead.priority} Priority
                  </span>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    lead.slaStatus === 'breached' ? 'bg-red-100 text-red-700' :
                    lead.slaStatus === 'warning' ? 'bg-amber-100 text-amber-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    SLA: {lead.slaHours}h
                  </span>
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                    ${Number(lead.value || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleQualifyLead}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Target className="mr-1.5 inline h-4 w-4" />
                Qualify Lead
              </button>
              <button onClick={onClose} className="rounded-lg p-2 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 px-6">
            <div className="flex gap-6">
              {['overview', 'activity', 'notes'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`border-b-2 px-1 py-3 text-sm font-semibold capitalize transition ${
                    activeTab === tab
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab} {tab === 'activity' && `(${activities.length})`} {tab === 'notes' && `(${notes.length})`}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="max-h-[calc(90vh-280px)] overflow-y-auto p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Contact Information */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900">
                    <User className="h-4 w-4" /> Contact Information
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{lead.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{lead.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{lead.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{lead.name}</span>
                    </div>
                  </div>
                </div>

                {/* Lead Details */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900">
                    <TrendingUp className="h-4 w-4" /> Lead Details
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <div className="text-xs text-gray-500">Source</div>
                      <div className="text-sm font-semibold text-gray-900">{lead.source}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Estimated Value</div>
                      <div className="text-sm font-bold text-emerald-600">${Number(lead.value || 0).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Lead Score</div>
                      <div className="text-sm font-semibold text-gray-900">{lead.score}/100</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Assigned To</div>
                      <div className="text-sm font-semibold text-gray-900">{lead.assignedTo || 'Unassigned'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Created</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {new Date(lead.created).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activities */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900">
                    <Activity className="h-4 w-4" /> Recent Activities
                  </h3>
                  {activities.length === 0 ? (
                    <p className="text-sm text-gray-500">No activities yet</p>
                  ) : (
                    <div className="space-y-2">
                      {activities.slice(0, 3).map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3 rounded-lg bg-white p-3">
                          <div className={`rounded-lg p-2 ${getActivityColor(activity.activity_type)}`}>
                            {getActivityIcon(activity.activity_type)}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-900">{activity.subject}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(activity.created_at).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">Activity Timeline</h3>
                  <button
                    onClick={() => setShowActivityModal(true)}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    <Plus className="mr-1.5 inline h-4 w-4" />
                    Log Activity
                  </button>
                </div>

                {activities.length === 0 ? (
                  <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                    <Activity className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm font-semibold text-gray-900">No activities yet</p>
                    <p className="text-xs text-gray-500">Log your first call, email, or meeting</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activities.map((activity) => (
                      <div key={activity.id} className="rounded-lg border border-gray-200 bg-white p-4">
                        <div className="flex items-start gap-3">
                          <div className={`rounded-lg p-2 ${getActivityColor(activity.activity_type)}`}>
                            {getActivityIcon(activity.activity_type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="text-sm font-semibold text-gray-900">{activity.subject}</div>
                                <div className="text-xs text-gray-500">
                                  {new Date(activity.created_at).toLocaleString()}
                                </div>
                              </div>
                              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700 capitalize">
                                {activity.activity_type}
                              </span>
                            </div>
                            {activity.notes && (
                              <p className="mt-2 text-sm text-gray-600">{activity.notes}</p>
                            )}
                            {activity.outcome && (
                              <div className="mt-2 flex items-center gap-2">
                                <span className="text-xs font-semibold text-gray-500">Outcome:</span>
                                <span className="text-xs text-gray-700">{activity.outcome}</span>
                              </div>
                            )}
                            {activity.duration_minutes && (
                              <div className="mt-1 flex items-center gap-2">
                                <Clock className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-600">{activity.duration_minutes} minutes</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">Notes</h3>
                  <button
                    onClick={() => setShowNoteModal(true)}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    <Plus className="mr-1.5 inline h-4 w-4" />
                    Add Note
                  </button>
                </div>

                {notes.length === 0 ? (
                  <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm font-semibold text-gray-900">No notes yet</p>
                    <p className="text-xs text-gray-500">Add your first note about this lead</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notes.map((note) => (
                      <div key={note.id} className="rounded-lg border border-gray-200 bg-amber-50 p-4">
                        <div className="flex items-start gap-3">
                          <FileText className="h-5 w-5 text-amber-600" />
                          <div className="flex-1">
                            <div className="text-xs text-gray-500">
                              {new Date(note.created_at).toLocaleString()}
                            </div>
                            <p className="mt-1 text-sm text-gray-700">{note.notes}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between border-t border-gray-200 p-6">
            <div className="flex gap-2">
              <button
                onClick={handleMarkAsLost}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                Mark as Lost
              </button>
              <button
                onClick={handleDeleteLead}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete Lead
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={handleQualifyLead}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <CheckCircle className="mr-1.5 inline h-4 w-4" />
                Qualify Lead
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Log Activity Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
            <h3 className="mb-4 text-lg font-bold text-gray-900">Log Activity</h3>
            
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Activity Type</label>
                <select
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="call">Call</option>
                  <option value="email">Email</option>
                  <option value="meeting">Meeting</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Subject *</label>
                <input
                  type="text"
                  value={activityForm.subject}
                  onChange={(e) => setActivityForm({ ...activityForm, subject: e.target.value })}
                  placeholder="e.g., Initial discovery call"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Notes</label>
                <textarea
                  value={activityForm.notes}
                  onChange={(e) => setActivityForm({ ...activityForm, notes: e.target.value })}
                  rows={3}
                  placeholder="Add details about this activity..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Outcome</label>
                <input
                  type="text"
                  value={activityForm.outcome}
                  onChange={(e) => setActivityForm({ ...activityForm, outcome: e.target.value })}
                  placeholder="e.g., Interested, Follow up needed"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Duration (minutes)</label>
                <input
                  type="number"
                  value={activityForm.duration}
                  onChange={(e) => setActivityForm({ ...activityForm, duration: e.target.value })}
                  placeholder="30"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setShowActivityModal(false)}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleLogActivity}
                disabled={loading || !activityForm.subject}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Logging...' : 'Log Activity'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
            <h3 className="mb-4 text-lg font-bold text-gray-900">Add Note</h3>
            
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={5}
              placeholder="Write your note here..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setShowNoteModal(false)}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNote}
                disabled={loading || !noteText.trim()}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Note'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Qualify Modal */}
      {showQualifyModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Qualify Lead - BANT Assessment</h3>
              <button onClick={() => setShowQualifyModal(false)} className="rounded-lg p-2 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <BANTQualification lead={lead} onClose={() => setShowQualifyModal(false)} onUpdate={onUpdate} />
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
