import { motion } from 'motion/react'
import { useState } from 'react'
import { Banknote, Timer, Zap, Search } from 'lucide-react'

function LeadPipeline() {
  const [leads] = useState({
    new: [
      { id: 1, company: 'TechCorp Pvt Ltd', contact: 'Rahul Sharma · CEO', priority: 'Hot', region: 'India', value: '₹12L' },
      { id: 2, company: 'Apex Solutions', contact: 'Priya Menon · HR Dir.', priority: 'Warm', region: 'India', value: '₹8L' },
    ],
    contacted: [
      { id: 3, company: 'Meridian Ltd', contact: 'James H. · Founder', priority: 'Hot', region: 'UK', value: '₹15L' },
    ],
    qualified: [
      { id: 4, company: 'NovaMed Inc', contact: 'Sarah K. · VP HR', priority: 'Warm', region: 'US', value: '₹22L' },
    ],
    demo: [
      { id: 5, company: 'Horizon Retail', contact: 'Amit Patel · MD', priority: 'Hot', region: 'India', value: '₹18L' },
    ],
    proposal: [
      { id: 6, company: 'BlueSky Tech', contact: 'Emma W. · CEO', priority: 'Warm', region: 'UK', value: '₹25L' },
    ],
    negotiation: [
      { id: 7, company: 'Granite Corp', contact: 'Mike R. · CFO', priority: 'Hot', region: 'US', value: '₹35L' },
    ],
    won: [
      { id: 8, company: 'Zephyr Foods', contact: 'Neha Joshi · HR', priority: 'Hot', region: 'India', value: '₹10L' },
    ],
    lost: [
      { id: 9, company: 'Pinnacle Mfg', contact: 'Chose BambooHR', priority: 'Cold', region: 'US', value: '₹12L' },
    ],
  })

  const stages = [
    { id: 'new', label: 'New', count: 87, color: 'bg-slate-100 text-slate-700' },
    { id: 'contacted', label: 'Contacted', count: 64, color: 'bg-blue-100 text-blue-700' },
    { id: 'qualified', label: 'Qualified', count: 38, color: 'bg-green-100 text-green-700' },
    { id: 'demo', label: 'Demo', count: 23, color: 'bg-amber-100 text-amber-700' },
    { id: 'proposal', label: 'Proposal', count: 19, color: 'bg-purple-100 text-purple-700' },
    { id: 'negotiation', label: 'Negotiation', count: 11, color: 'bg-orange-100 text-orange-700' },
    { id: 'won', label: 'Won', count: 18, color: 'bg-emerald-100 text-emerald-700' },
    { id: 'lost', label: 'Lost', count: 47, color: 'bg-red-100 text-red-700' },
  ]

  const priorityColors = {
    Hot: 'bg-red-100 text-red-700',
    Warm: 'bg-amber-100 text-amber-700',
    Cold: 'bg-blue-100 text-blue-700',
  }

  const regionColors = {
    India: 'bg-green-100 text-green-700',
    UK: 'bg-purple-100 text-purple-700',
    US: 'bg-blue-100 text-blue-700',
  }

  return (
    <div className="space-y-6">
      {/* Pipeline Header */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">
          Kanban Pipeline — Drag & Drop Lead Cards
        </h2>
        <p className="mt-1 text-xs text-slate-600">
          Deal Value Display — Har stage column mein total expected ARR dikhao
        </p>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <div key={stage.id} className="min-w-[200px] flex-shrink-0">
            {/* Stage Header */}
            <div
              className={`mb-3 rounded-lg px-3 py-2 text-center text-xs font-bold ${stage.color}`}
            >
              {stage.label} ({stage.count})
            </div>

            {/* Lead Cards */}
            <div className="space-y-2">
              {leads[stage.id]?.map((lead) => (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  className="cursor-move rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="text-sm font-bold text-slate-900">{lead.company}</div>
                  <div className="mt-1 text-xs text-slate-600">{lead.contact}</div>
                  <div className="mt-2 text-xs font-bold text-green-700">{lead.value}</div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-semibold ${
                        priorityColors[lead.priority]
                      }`}
                    >
                      {lead.priority}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-semibold ${
                        regionColors[lead.region]
                      }`}
                    >
                      {lead.region}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline Features */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-bold text-slate-900">
          Pipeline Page Ke Additional Features
        </h3>
        <div className="space-y-2">
          {[
            {
              title: 'Deal Value Display',
              desc: 'Har stage column mein total expected ARR dikhao — e.g. "Proposal Sent: ₹18.2L"',
              icon: Banknote,
            },
            {
              title: 'Stage Age Indicator',
              desc: 'Lead kitne din se ek stage mein stuck hai — red badge agar too long (e.g. >7 days in Demo Done)',
              icon: Timer,
            },
            {
              title: 'Quick Actions on Card',
              desc: 'Card pe hover karo — Add Note / Schedule Call / Move Stage buttons turant available',
              icon: Zap,
            },
            {
              title: 'Filter by Rep / Region',
              desc: 'Sales rep dropdown + Region filter — Team Lead apni team ka pipeline dekhe, Dept Head sab dekhe',
              icon: Search,
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="flex items-start gap-3 rounded border border-slate-200 bg-slate-50 p-2 text-xs"
            >
              <feature.icon className="h-5 w-5 shrink-0 text-blue-500" />
              <div>
                <div className="font-bold text-slate-900">{feature.title}</div>
                <div className="text-slate-600">{feature.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LeadPipeline
