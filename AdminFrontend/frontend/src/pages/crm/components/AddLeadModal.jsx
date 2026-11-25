import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Plus, Loader, Edit } from 'lucide-react'
import crmService from '../../../services/crmService'

const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Manufacturing',
  'Retail',
  'Education',
  'Real Estate',
  'Consulting',
  'Other'
]

const EMPTY_FORM = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  company_name: '',
  company_size: '',
  industry: '',
  region: '',
  utm_source: '',
  utm_medium: '',
  utm_campaign: '',
  notes: '',
  deal_value: '',
  source: 'manual',
  priority: 'warm',
  assigned_to: '',
}

const AddLeadModal = ({ isOpen, onClose, onSuccess, editLead = null }) => {
  const isEditMode = !!editLead
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [formData, setFormData] = useState(EMPTY_FORM)

  // When editLead changes, pre-fill or reset form
  useEffect(() => {
    if (editLead) {
      // Map normalized frontend lead back to API field names
      const nameParts = (editLead.contact || '').split(' ')
      setFormData({
        first_name: editLead._raw?.first_name || nameParts[0] || '',
        last_name: editLead._raw?.last_name || nameParts.slice(1).join(' ') || '',
        email: editLead.email || '',
        phone: editLead.phone === 'N/A' ? '' : (editLead.phone || ''),
        company_name: editLead.name || '',
        company_size: editLead._raw?.company_size || '',
        industry: editLead._raw?.industry || '',
        region: editLead.location === 'N/A' ? '' : (editLead.location || ''),
        utm_source: editLead._raw?.utm_source || '',
        utm_medium: editLead._raw?.utm_medium || '',
        utm_campaign: editLead._raw?.utm_campaign || '',
        notes: editLead._raw?.notes || '',
        deal_value: editLead._raw?.deal_value ?? editLead._raw?.estimated_value ?? (editLead.value !== undefined ? editLead.value : ''),
        source: editLead.source || 'manual',
        priority: editLead.rawPriority || 'hot',
        assigned_to: editLead.assignedToId || '',
      })
    } else {
      setFormData(EMPTY_FORM)
    }
    setError(null)
  }, [editLead, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const payload = { ...formData }
      if (payload.deal_value !== '' && payload.deal_value !== null && payload.deal_value !== undefined) {
        payload.deal_value = parseFloat(payload.deal_value) || 0
        payload.estimated_value = payload.deal_value
      } else {
        payload.deal_value = 0
        payload.estimated_value = 0
      }
      if (!payload.assigned_to) {
        delete payload.assigned_to
      }

      let data
      if (isEditMode) {
        data = await crmService.updateLead(editLead.id, payload)
      } else {
        data = await crmService.createLead(payload)
      }

      // Reset form
      setFormData(EMPTY_FORM)

      if (onSuccess) {
        onSuccess(data)
      }

      onClose()
    } catch (err) {
      console.error(isEditMode ? 'Error updating lead:' : 'Error creating lead:', err)
      setError(err.message || (isEditMode ? 'Failed to update lead.' : 'Failed to create lead. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {isEditMode ? 'Edit Lead' : 'Add New Lead'}
              </h2>
              <p className="text-sm text-gray-500">
                {isEditMode ? `Editing: ${editLead?.name || ''}` : 'Fill in the lead information below'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Error Message */}
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Contact Information */}
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">Contact Information</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="John"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Doe"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="john.doe@example.com"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>
            </div>

            {/* Company Information */}
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">Company Information</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Acme Corporation"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Company Size</label>
                  <select
                    name="company_size"
                    value={formData.company_size}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Select size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="501-1000">501-1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Industry</label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Select industry</option>
                    {INDUSTRIES.map(ind => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                    {formData.industry && !INDUSTRIES.includes(formData.industry) && (
                      <option value={formData.industry}>{formData.industry}</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Region</label>
                  <input
                    type="text"
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="North America, Europe, etc."
                  />
                </div>
              </div>
            </div>

            {/* Lead Details */}
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">Lead Details</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Source</label>
                  <select
                    name="source"
                    value={formData.source}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="manual">Manual Entry</option>
                    <option value="web_form">Website / Form</option>
                    <option value="referral">Referral</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="email">Email Campaign</option>
                    <option value="ppc_google">Google Ads (PPC)</option>
                    <option value="meta_ads">Social / Meta Ads</option>
                    <option value="local_listing">Local Listing / Event</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="cold">Low (Cold)</option>
                    <option value="warm">Medium (Warm)</option>
                    <option value="hot">High (Hot)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Estimated Value ($)</label>
                  <input
                    type="number"
                    name="deal_value"
                    value={formData.deal_value}
                    onChange={handleChange}
                    min="0"
                    step="any"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="e.g. 50000"
                  />
                </div>
              </div>
            </div>

            {/* UTM Parameters */}
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">UTM Parameters (Optional)</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">UTM Source</label>
                  <input
                    type="text"
                    name="utm_source"
                    value={formData.utm_source}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="google, facebook, etc."
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">UTM Medium</label>
                  <input
                    type="text"
                    name="utm_medium"
                    value={formData.utm_medium}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="cpc, email, social, etc."
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">UTM Campaign</label>
                  <input
                    type="text"
                    name="utm_campaign"
                    value={formData.utm_campaign}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="spring_sale, product_launch, etc."
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Add any additional notes about this lead..."
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    {isEditMode ? 'Saving...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    {isEditMode ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {isEditMode ? 'Save Changes' : 'Create Lead'}
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default AddLeadModal
