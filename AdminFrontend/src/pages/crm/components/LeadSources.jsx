import { motion } from 'motion/react'
import { Globe, Mail, Search, Share2, MapPin, ClipboardList, Briefcase, PenLine, Settings, Map, Inbox, Upload, Link2, RefreshCw, CheckSquare } from 'lucide-react'

function LeadSources() {
  const sources = [
    {
      name: 'Website Form',
      icon: Globe,
      desc: 'POST /api/leads/web-form, UTM params capture, reCAPTCHA v3',
      leads: 342,
      conversion: '12.4%',
      color: 'bg-blue-50',
    },
    {
      name: 'Email Inbound',
      icon: Mail,
      desc: 'SendGrid Inbound Parse, NLP se company/phone extract',
      leads: 128,
      conversion: '8.2%',
      color: 'bg-purple-50',
    },
    {
      name: 'Google PPC',
      icon: Search,
      desc: 'Google Ads API webhook, gclid capture, Conversion API trigger',
      leads: 267,
      conversion: '15.8%',
      color: 'bg-green-50',
    },
    {
      name: 'Meta / Facebook',
      icon: Share2,
      desc: 'Graph API leadgen webhook, HMAC verify, fb_lead_id',
      leads: 189,
      conversion: '10.5%',
      color: 'bg-indigo-50',
    },
    {
      name: 'Google Business',
      icon: MapPin,
      desc: 'CSV export import, source = local_listing',
      leads: 45,
      conversion: '6.3%',
      color: 'bg-amber-50',
    },
    {
      name: 'Justdial / Sulekha',
      icon: ClipboardList,
      desc: 'CSV import wizard, custom column mapping, saved templates',
      leads: 98,
      conversion: '7.1%',
      color: 'bg-orange-50',
    },
    {
      name: 'LinkedIn',
      icon: Briefcase,
      desc: 'Marketing API ya Zapier bridge, poll every 15 min',
      leads: 156,
      conversion: '18.2%',
      color: 'bg-cyan-50',
    },
    {
      name: 'Manual Entry',
      icon: PenLine,
      desc: 'Sales rep enters from cold call / event / referral',
      leads: 23,
      conversion: '22.5%',
      color: 'bg-slate-50',
    },
  ]

  const autoAssignmentRules = [
    {
      title: 'Rule Builder',
      desc: 'IF source = meta_ads AND region = US THEN assign to [Team Lead X] — round robin. Up to 10 rules configure kar sakte ho',
      icon: Settings,
      color: 'text-purple-600',
    },
    {
      title: 'Territory Rules',
      desc: 'Region basis pe (US/UK/IN), Industry basis pe, Company size band basis pe auto-assign',
      icon: Map,
      color: 'text-blue-600',
    },
    {
      title: 'Unassigned Queue',
      desc: 'Koi rule match nahi hua toh lead unassigned queue mein jaata hai — Dept Head manually assign kare',
      icon: Inbox,
      color: 'text-green-600',
    },
  ]

  const importSteps = [
    {
      step: 'Step 1 — File Upload',
      desc: 'CSV ya Excel file upload karo. System columns detect karta hai',
      icon: Upload,
    },
    {
      step: 'Step 2 — Column Mapping',
      desc: 'Apne CSV ka column HRMS field se map karo. Mapping template save karo future use ke liye',
      icon: Link2,
    },
    {
      step: 'Step 3 — Deduplication',
      desc: 'Email OR phone se duplicates detect, skip karo ya merge karo',
      icon: RefreshCw,
    },
    {
      step: 'Step 4 — Import Result',
      desc: 'Total rows, success count, failed rows, duplicate count — failed rows ka error report download karo',
      icon: CheckSquare,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Sources Grid */}
      <div>
        <h2 className="mb-4 text-lg font-bold text-slate-900">
          Lead Capture Sources — Sab Automatic + Manual
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {sources.map((source, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`rounded-lg border border-slate-200 ${source.color} p-4 shadow-sm`}
            >
              <div className="flex justify-center"><source.icon className="h-8 w-8 text-blue-600" /></div>
              <h3 className="mt-3 text-center text-sm font-bold text-slate-900">
                {source.name}
              </h3>
              <p className="mt-2 text-center text-xs text-slate-600">{source.desc}</p>
              <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-200 pt-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-slate-900">{source.leads}</div>
                  <div className="text-xs text-slate-600">Leads</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-700">{source.conversion}</div>
                  <div className="text-xs text-slate-600">Conv. Rate</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Auto-Assignment Rules */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-slate-900">
          Auto-Assignment Rules (Admin Config)
        </h3>
        <div className="space-y-3">
          {autoAssignmentRules.map((rule, index) => (
            <div
              key={index}
              className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4"
            >
              <rule.icon className={`h-6 w-6 shrink-0 ${rule.color}`} />
              <div>
                <h4 className="text-sm font-bold text-slate-900">{rule.title}</h4>
                <p className="mt-1 text-xs text-slate-600">{rule.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CSV Import Wizard */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-slate-900">CSV Import Wizard</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {importSteps.map((step, index) => (
            <div key={index} className="rounded-lg border-2 border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <step.icon className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">{step.step}</h4>
              <p className="mt-2 text-xs text-slate-600">{step.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-semibold text-white shadow-lg transition hover:bg-blue-700">
            <Upload className="h-5 w-5" /> Start CSV Import
          </button>
        </div>
      </div>
    </div>
  )
}

export default LeadSources
