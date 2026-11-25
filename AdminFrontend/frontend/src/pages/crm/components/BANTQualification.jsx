import { motion } from 'motion/react'
import { useState } from 'react'
import { Banknote, Briefcase, Target, Clock, Lightbulb } from 'lucide-react'
import crmService from '../../../services/crmService'

function BANTQualification({ lead, onClose, onUpdate }) {
  const [loading, setLoading] = useState(false)
  const [bantScore, setBantScore] = useState(0)
  const [formData, setFormData] = useState({
    budget: 'No budget allocated (0 pts)',
    authority: 'No authority (0 pts)',
    need: 'Nice to have (0 pts)',
    timeline: 'No timeline / exploring (0 pts)',
    budgetDetails: '',
    notes: '',
  })

  // Calculate score based on selections
  const calculateScore = (data) => {
    const extractPoints = (str) => {
      const match = str.match(/\((\d+) pts\)/)
      return match ? parseInt(match[1]) : 0
    }

    const total = 
      extractPoints(data.budget) +
      extractPoints(data.authority) +
      extractPoints(data.need) +
      extractPoints(data.timeline)

    setBantScore(total)
    return total
  }

  const handleFieldChange = (field, value) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    calculateScore(newData)
  }

  const handleSubmit = async () => {
    if (!formData.notes.trim()) {
      alert('Please add qualification notes')
      return
    }

    setLoading(true)
    try {
      // Extract points from selections
      const getPts = (opt) => {
        const m = (opt || '').match(/\((\d+)\s*pts\)/)
        return m ? parseInt(m[1]) : 0
      }

      const budgetScore = getPts(formData.budget)
      const authorityScore = getPts(formData.authority)
      const needScore = getPts(formData.need)
      const timelineScore = getPts(formData.timeline)
      const totalScore = budgetScore + authorityScore + needScore + timelineScore

      console.log('BANT Score Calculation:', { budgetScore, authorityScore, needScore, timelineScore, totalScore })

      // Build payload matching backend schema
      const payload = {
        budget_confirmed: budgetScore >= 15,
        budget_notes: formData.budgetDetails || null,
        authority_confirmed: authorityScore >= 20,
        authority_notes: formData.notes,
        pain_points: needScore >= 10 ? ["HR Operations Inefficiency"] : [],
        timeline: timelineScore >= 20 ? "Short-term (1-3M)" : timelineScore >= 15 ? "Mid-term (3-6M)" : "Long-term (6M+)",
        estimated_headcount: 50,
        required_regions: [],
        current_solution: null
      }

      // Handle urgent timeline
      if (formData.timeline.includes("Urgent") || formData.timeline.includes("immediate")) {
        payload.timeline = "Immediate (<1 month)"
      }

      console.log('Submitting qualification payload:', payload)

      const response = await crmService.qualifyLead(lead.id, payload)
      console.log('Qualification response:', response)

      if (totalScore >= 60) {
        alert(`BANT Qualified! Total Score: ${totalScore}%. Lead qualified successfully and opportunity generated in pipeline!`)
      } else {
        alert(`BANT Complete! Total Score: ${totalScore}%. Lead status updated. (Score must be >= 60% to automatically generate an opportunity)`)
      }

      if (onClose) onClose()
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('Failed to qualify lead:', error)
      console.error('Error details:', error.response?.data || error.message)
      alert('Failed to qualify lead: ' + (error.response?.data?.detail || error.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

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
    },
  ]

  return (
    <div className="space-y-6">
      {/* BANT Score Widget */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-slate-900">
          BANT Qualification Form — Lead ko Qualify karne ke liye
        </h2>

        {/* Score Display */}
        <div className="mb-6 flex items-center gap-6 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-blue-600">{bantScore}</div>
            <div className="mt-1 text-xs font-semibold text-slate-600">BANT Score</div>
          </div>
          <div className="flex-1">
            <div className="mb-2 text-xs font-semibold text-slate-600">
              Qualification progress
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${bantScore}%` }}
                transition={{ duration: 1 }}
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
              />
            </div>
            <div className="mt-2 text-xs text-slate-600">
              {bantScore >= 60 ? (
                <span className="font-bold text-green-600">
                  ✓ Score &gt;60 = Qualified — Lead automatically move hoti hai "Qualified" stage
                  mein
                </span>
              ) : (
                <span className="font-bold text-amber-600">
                  Score &lt;60 = Not Qualified — More qualification needed
                </span>
              )}
            </div>
          </div>
        </div>

        {/* BANT Form */}
        <div className="grid gap-6 lg:grid-cols-2">
          {bantFields.map((field, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-lg border border-slate-200 bg-slate-50 p-4"
            >
              <div className="mb-3 flex items-center gap-2">
                <field.icon className={`h-6 w-6 shrink-0 ${field.color}`} />
                <div>
                  <h3 className={`text-sm font-bold ${field.color}`}>{field.category}</h3>
                  <p className="text-xs text-slate-600">{field.label}</p>
                </div>
              </div>
              <select
                value={formData[field.field]}
                onChange={(e) => handleFieldChange(field.field, e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                {field.options.map((option, idx) => (
                  <option key={idx} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </motion.div>
          ))}
        </div>

        {/* Additional Fields */}
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <label className="mb-2 block text-xs font-semibold text-slate-700">
              Budget Details (Optional)
            </label>
            <textarea
              rows={3}
              value={formData.budgetDetails}
              onChange={(e) => handleFieldChange('budgetDetails', e.target.value)}
              placeholder="Budget source, approval process, constraints..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <label className="mb-2 block text-xs font-semibold text-slate-700">
              Qualification Notes <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
              placeholder="Key insights from qualification call..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button 
            onClick={handleSubmit}
            disabled={loading || !formData.notes.trim()}
            className="flex-1 rounded-lg bg-blue-600 py-3 font-semibold text-white shadow-lg transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save BANT Qualification'}
          </button>
          <button 
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* BANT Explanation */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
        <h3 className="mb-3 text-sm font-bold text-blue-900">
          What is BANT Qualification?
        </h3>
        <div className="space-y-2 text-xs text-blue-800">
          <p>
            <strong>Budget (B):</strong> Does the prospect have budget allocated for HRMS? Kitna
            budget hai?
          </p>
          <p>
            <strong>Authority (A):</strong> Kiski baat kar rahe ho? Decision maker hai ya
            influencer? C-Level se baat ho rahi hai?
          </p>
          <p>
            <strong>Need (N):</strong> Unka pain point kitna critical hai? Manual HR processes se
            kitna suffer kar rahe hain?
          </p>
          <p>
            <strong>Timeline (T):</strong> Kab tak decision lena hai? Urgent need hai ya just
            exploring?
          </p>
          <p className="mt-3 rounded bg-blue-100 p-2 font-bold text-blue-900">
              <span className="inline-flex items-center gap-1"><Lightbulb className="h-4 w-4 text-amber-500" /> Total score 0-100. Score &gt;60 = Qualified lead — worth pursuing with demo. Score
            &lt;40 = Nurture campaign mein daal do.</span>
            </p>
        </div>
      </div>
    </div>
  )
}

export default BANTQualification
