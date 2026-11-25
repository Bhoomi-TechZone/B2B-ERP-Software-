import { motion } from 'motion/react'
import { ClipboardList, BarChart2, AlertTriangle, Search, CheckSquare, RefreshCw, Upload, Clock } from 'lucide-react'

function LeadOverview() {
  const stats = [
    {
      label: 'Total Leads',
      value: '1,248',
      subtext: '+34 this week',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'New (Uncontacted)',
      value: '87',
      subtext: 'Needs first contact',
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
    },
    {
      label: 'Demos Scheduled',
      value: '23',
      subtext: 'Next 7 days',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Proposals Sent',
      value: '41',
      subtext: '12 viewed, 6 signed',
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      label: 'Won This Month',
      value: '18',
      subtext: '₹8.4L ARR added',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Avg. BANT Score',
      value: '67',
      subtext: 'Target: >60 = Qualified',
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ]

  const features = [
    {
      title: 'Lead List (Table View)',
      desc: 'Company name, contact person, source, status, assigned rep, priority (Hot/Warm/Cold), created date — sortable & filterable',
      icon: ClipboardList,
      color: 'text-blue-600',
    },
    {
      title: 'Kanban Pipeline View',
      desc: 'New → Contacted → Qualified → Demo Scheduled → Demo Done → Proposal Sent → Negotiation → Won / Lost — drag & drop',
      icon: BarChart2,
      color: 'text-blue-600',
    },
    {
      title: 'Uncontacted 24hr Alert',
      desc: 'Naya lead assign hua aur 24 ghante mein contact nahi hua toh rep + Team Lead ko escalation alert jaata hai',
      icon: AlertTriangle,
      color: 'text-amber-600',
    },
    {
      title: 'Search & Advanced Filters',
      desc: 'Source, Region (US/UK/IN), Company size, Industry, Priority, Status, Assigned rep, Date range se filter karo',
      icon: Search,
      color: 'text-blue-600',
    },
    {
      title: 'Bulk Actions',
      desc: 'Multiple leads select karke bulk reassign, bulk status change, bulk export CSV',
      icon: CheckSquare,
      color: 'text-green-600',
    },
    {
      title: 'Duplicate Detection',
      desc: 'Same email ya company domain se naya lead add karo toh "Possible duplicate" warning — existing lead ka link dikhta hai',
      icon: RefreshCw,
      color: 'text-blue-600',
    },
    {
      title: 'Lead Import (CSV)',
      desc: 'CSV upload wizard — column mapping, saved mapping templates per source (Justdial, Sulekha, Yelp), deduplication by email OR phone',
      icon: Upload,
      color: 'text-purple-600',
    },
    {
      title: 'Dormant Leads Queue',
      desc: 'Lost leads jinka re-engage date aa gaya — CSM ko re-contact ke liye remind karo',
      icon: Clock,
      color: 'text-red-600',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`rounded-lg border border-slate-200 ${stat.bgColor} p-4 shadow-sm`}
          >
            <div className="text-xs font-semibold text-slate-600">{stat.label}</div>
            <div className="mt-2 text-2xl font-bold text-slate-900">{stat.value}</div>
            <div className="mt-1 text-xs text-slate-600">{stat.subtext}</div>
          </motion.div>
        ))}
      </div>

      {/* Features List */}
      <div>
        <h2 className="mb-4 text-lg font-bold text-slate-900">
          Lead Management Page Me Kya Hoga — Full List
        </h2>
        <div className="grid gap-3 lg:grid-cols-2">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              className="flex gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className={`shrink-0 ${feature.color}`}><feature.icon className="h-6 w-6" /></div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-900">{feature.title}</h3>
                <p className="mt-1 text-xs text-slate-600">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LeadOverview
