import { useState, memo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Globe, Send, Webhook, ShieldCheck, 
  Settings, CheckCircle2, AlertCircle, RefreshCw,
  ExternalLink, Plus, Trash2, Key, Info, Check
} from 'lucide-react'

const INTEGRATIONS = [
  { id: 'linkedin', name: 'LinkedIn', icon: Globe, color: 'text-blue-600 bg-blue-50', status: 'connected', url: 'https://linkedin.com' },
  { id: 'indeed',   name: 'Indeed',   icon: Globe,    color: 'text-indigo-600 bg-indigo-50', status: 'disconnected', url: 'https://indeed.com' },
  { id: 'glassdoor', name: 'Glassdoor', icon: Globe,   color: 'text-emerald-600 bg-emerald-50', status: 'connected', url: 'https://glassdoor.com' },
  { id: 'naukri',   name: 'Naukri.com', icon: Globe,   color: 'text-orange-600 bg-orange-50', status: 'connected', url: 'https://naukri.com' },
]

const SourcesPage = memo(() => {
  const [sources, setSources] = useState(INTEGRATIONS)
  const [webhookUrl, setWebhookUrl] = useState('https://api.workmatrix.com/webhooks/inbound/linkedin_q82j')
  const [testStatus, setTestStatus] = useState('idle') // idle | testing | success | error

  const handleTestWebhook = () => {
    setTestStatus('testing')
    setTimeout(() => setTestStatus('success'), 2000)
  }

  return (
    <div className="p-6 h-full overflow-y-auto bg-slate-50">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">Job Board Integrations</h1>
        <p className="text-sm text-slate-500 mt-1">Configure webhooks and API keys to post jobs automatically and receive candidates from external portals.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── Integrations List ── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sources.map((src) => (
              <motion.div 
                key={src.id}
                whileHover={{ y: -4 }}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${src.color}`}>
                    <src.icon className="h-6 w-6" />
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    src.status === 'connected' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'
                  }`}>
                    {src.status === 'connected' ? <><Check className="h-3 w-3" /> Connected</> : 'Not Linked'}
                  </div>
                </div>
                
                <h3 className="text-lg font-black text-slate-800">{src.name}</h3>
                <p className="text-xs text-slate-500 mb-5">Auto-post jobs and sync candidate applications via API.</p>
                
                <div className="flex gap-2">
                  <button className="flex-1 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors">
                    {src.status === 'connected' ? 'Manage API' : 'Connect Now'}
                  </button>
                  <button className="rounded-xl border border-slate-200 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
            
            <button className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-blue-300 hover:bg-blue-50/30 hover:text-blue-500 transition-all group">
              <div className="h-12 w-12 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <Plus className="h-6 w-6" />
              </div>
              <span className="font-bold text-sm">Add Custom Source</span>
            </button>
          </div>

          {/* ── API Documentation / Help ── */}
          <div className="rounded-3xl bg-linear-to-br from-indigo-600 to-blue-700 p-8 text-white shadow-xl shadow-blue-200/50">
             <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                  <Key className="h-6 w-6" />
                </div>
                <div>
                   <h3 className="text-xl font-black">API Documentation</h3>
                   <p className="text-blue-100 text-sm mt-1 mb-6">Build your own custom integrations using our REST API. Push jobs to your internal portals or mobile apps.</p>
                   <div className="flex gap-4">
                      <button className="rounded-xl bg-white px-5 py-2 text-xs font-black text-blue-700 hover:bg-blue-50 transition-all">View API Docs</button>
                      <button className="rounded-xl bg-white/10 px-5 py-2 text-xs font-black text-white hover:bg-white/20 transition-all">Download SDK</button>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* ── Webhooks Panel ── */}
        <div className="space-y-6">
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
             <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-violet-50 flex items-center justify-center">
                   <Webhook className="h-5 w-5 text-violet-600" />
                </div>
                <h3 className="font-black text-slate-800">Global Webhook</h3>
             </div>

             <div className="space-y-4">
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Endpoint URL</label>
                   <div className="flex gap-2">
                      <input 
                        type="text" 
                        readOnly 
                        value={webhookUrl}
                        className="flex-1 rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5 text-[11px] font-mono font-bold text-slate-600 outline-hidden"
                      />
                      <button className="rounded-xl bg-slate-900 px-3 text-white hover:bg-slate-800 transition-colors">
                         <RefreshCw className="h-4 w-4" />
                      </button>
                   </div>
                </div>

                <div className="pt-4 border-t border-slate-50">
                   <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
                      Candidates applying on external portals will be pushed to this endpoint. Ensure your webhook is listening for <code className="text-violet-600 font-bold font-mono">POST</code> requests.
                   </p>
                   
                   <button 
                    onClick={handleTestWebhook}
                    disabled={testStatus === 'testing'}
                    className={`w-full rounded-xl py-3 text-xs font-black transition-all flex items-center justify-center gap-2 ${
                      testStatus === 'success' ? 'bg-emerald-500 text-white' : 
                      testStatus === 'testing' ? 'bg-slate-100 text-slate-400' :
                      'bg-violet-600 text-white hover:bg-violet-700 shadow-lg shadow-violet-100'
                    }`}
                   >
                      {testStatus === 'testing' ? <RefreshCw className="h-4 w-4 animate-spin" /> : 
                       testStatus === 'success' ? <CheckCircle2 className="h-4 w-4" /> : 
                       <Send className="h-4 w-4" />}
                      {testStatus === 'testing' ? 'Testing Connection...' : 
                       testStatus === 'success' ? 'Connection Verified' : 
                       'Send Test Webhook'}
                   </button>
                </div>
             </div>
          </div>

          {/* ── Status Widget ── */}
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
             <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                   <Info className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-black text-slate-800">Recent Sync Logs</h3>
             </div>

             <div className="space-y-3">
                {[
                  { event: 'LinkedIn Sync', time: '2 mins ago', status: 'success' },
                  { event: 'Webhook Receive', time: '1 hr ago', status: 'success' },
                  { event: 'Indeed Job Post', time: '5 hrs ago', status: 'error' },
                ].map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-50 bg-slate-50/30">
                     <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${log.status === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <div>
                           <p className="text-[11px] font-black text-slate-700 uppercase tracking-tighter">{log.event}</p>
                           <p className="text-[10px] text-slate-400 font-bold">{log.time}</p>
                        </div>
                     </div>
                     {log.status === 'error' && <AlertCircle className="h-3.5 w-3.5 text-rose-500" />}
                  </div>
                ))}
             </div>
          </div>
        </div>

      </div>
    </div>
  )
})

SourcesPage.displayName = 'SourcesPage'
export default SourcesPage
