import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Fingerprint, Database, Smartphone, Globe, 
  QrCode, Zap, ShieldCheck, Server, Plus,
  Settings2, Activity, Terminal, Code
} from 'lucide-react'
import { API_V1_BASE_URL } from '../../config/api'

const INTEGRATIONS = [
  {
    id: 'biometric',
    name: 'Biometric Devices',
    desc: 'ZKTeco / eSSL Device SDK Integration',
    icon: Fingerprint,
    status: 'connected',
    devices: 12,
    color: 'bg-indigo-600'
  },
  {
    id: 'mobile',
    name: 'Mobile GPS Punch',
    desc: 'Geo-fencing & Map Validation',
    icon: Smartphone,
    status: 'active',
    devices: 450,
    color: 'bg-blue-600'
  },
  {
    id: 'qr',
    name: 'Dynamic QR Scan',
    desc: 'Rotating 60s JWT Tokens',
    icon: QrCode,
    status: 'active',
    devices: 5,
    color: 'bg-emerald-600'
  },
  {
    id: 'web',
    name: 'Web Portal Punch',
    desc: 'Browser-based attendance for WFH',
    icon: Globe,
    status: 'active',
    devices: 'Global',
    color: 'bg-amber-600'
  }
]

export default function BiometricConfigPage() {
  const [selected, setSelected] = useState(INTEGRATIONS[0])

  return (
    <div className="p-6 space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Attendance Capture Integrations</h2>
          <p className="text-sm text-slate-500">Configure biometric devices, mobile GPS, and API webhooks</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white shadow-lg transition-all hover:bg-slate-800">
           <Plus className="h-4 w-4" />
           Add Integration
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* ── Sidebar Integrations ── */}
        <div className="space-y-3">
           {INTEGRATIONS.map(item => (
             <button
               key={item.id}
               onClick={() => setSelected(item)}
               className={`flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition-all ${
                 selected.id === item.id 
                 ? 'border-blue-600 bg-blue-50 shadow-md' 
                 : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
               }`}
             >
                <div className={`rounded-xl p-2.5 text-white ${item.color} shadow-lg`}>
                   <item.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                   <div className="text-sm font-bold text-slate-900 truncate">{item.name}</div>
                   <div className="text-[10px] font-medium text-slate-500 truncate mt-0.5">{item.desc}</div>
                   <div className="mt-2 flex items-center gap-1.5">
                      <div className={`h-1.5 w-1.5 rounded-full ${item.status === 'connected' || item.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{item.status}</span>
                   </div>
                </div>
             </button>
           ))}
        </div>

        {/* ── Main Config Panel ── */}
        <div className="lg:col-span-3">
           <AnimatePresence mode="wait">
             <motion.div
               key={selected.id}
               initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
               className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm h-full"
             >
                <div className="flex items-start justify-between mb-8">
                   <div className="flex items-center gap-4">
                      <div className={`rounded-2xl p-4 text-white ${selected.color} shadow-xl shadow-blue-100`}>
                         <selected.icon className="h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900">{selected.name} Configuration</h3>
                        <p className="text-sm text-slate-500">{selected.desc}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-2">
                      <button className="rounded-xl border border-slate-200 p-2 text-slate-400 hover:bg-slate-50">
                         <Settings2 className="h-5 w-5" />
                      </button>
                      <button className="rounded-xl border border-slate-200 p-2 text-slate-400 hover:bg-slate-50">
                         <Activity className="h-5 w-5" />
                      </button>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {/* Connection Settings */}
                   <div className="space-y-6">
                      <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6 space-y-4">
                         <div className="flex items-center gap-2 mb-2">
                            <Server className="h-4 w-4 text-blue-600" />
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Gateway Configuration</span>
                         </div>
                         
                         <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1.5">API Endpoint URL</label>
                            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-mono text-slate-500">
                               {API_V1_BASE_URL}/attendance/{selected.id}
                            </div>
                         </div>

                         <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1.5">Authentication Token</label>
                            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-mono text-slate-500">
                               ••••••••••••••••••••••••••••••••
                               <button className="ml-auto text-[10px] font-bold text-blue-600 hover:underline">REVEAL</button>
                            </div>
                         </div>
                      </div>

                      <div className="rounded-2xl border border-slate-100 bg-white p-6 space-y-4 shadow-sm">
                         <div className="flex items-center gap-2 mb-2">
                            <ShieldCheck className="h-4 w-4 text-emerald-600" />
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Security & Protocol</span>
                         </div>
                         <div className="space-y-3">
                            {[
                              { label: 'HMAC Signature Verification', active: true },
                              { label: 'IP Whitelisting Enabled', active: true },
                              { label: 'TLS 1.3 Encryption', active: true },
                              { label: 'Anti-Proxy Punch Guard', active: selected.id === 'qr' },
                            ].map(s => (
                              <div key={s.label} className="flex items-center justify-between">
                                 <span className="text-xs font-medium text-slate-600">{s.label}</span>
                                 <div className={`h-4 w-8 rounded-full p-0.5 transition-colors ${s.active ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                                    <div className={`h-3 w-3 rounded-full bg-white transition-transform ${s.active ? 'translate-x-4' : ''}`} />
                                 </div>
                              </div>
                            ))}
                         </div>
                      </div>
                   </div>

                   {/* Code & SDK Section */}
                   <div className="space-y-6">
                      <div className="rounded-2xl bg-slate-900 p-6 font-mono text-xs text-slate-300 shadow-xl border border-slate-800">
                         <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                            <div className="flex items-center gap-2">
                               <Terminal className="h-4 w-4 text-emerald-500" />
                               <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Integration Webhook (NodeJS)</span>
                            </div>
                            <Code className="h-4 w-4 text-slate-600" />
                         </div>
<pre className="overflow-x-auto">
{`app.post('/api/attendance/${selected.id}', async (req, res) => {
  const { employee_id, timestamp, secret } = req.body;
  
  // Verify HMAC signature
  if (!verifySignature(req)) return res.status(401).send();

  // Process raw punch to Attendance Engine
  await attendanceProcessor.process({
    id: employee_id,
    time: timestamp,
    source: '${selected.name}'
  });

  res.status(200).json({ success: true });
});`}
</pre>
                      </div>

                      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
                         <h4 className="text-sm font-bold text-blue-900 mb-2">Integration Stats (Last 24h)</h4>
                         <div className="flex items-center justify-between mt-4">
                            <div>
                               <div className="text-[10px] font-bold text-blue-400 uppercase">Requests</div>
                               <div className="text-xl font-bold text-blue-700">14.5k</div>
                            </div>
                            <div>
                               <div className="text-[10px] font-bold text-blue-400 uppercase">Avg Response</div>
                               <div className="text-xl font-bold text-blue-700">42ms</div>
                            </div>
                            <div>
                               <div className="text-[10px] font-bold text-blue-400 uppercase">Errors</div>
                               <div className="text-xl font-bold text-rose-600">0.02%</div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="mt-12 flex justify-end gap-3 pt-6 border-t border-slate-100">
                   <button className="rounded-xl px-6 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all">
                      Download SDK Docs
                   </button>
                   <button className={`rounded-xl px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-100 transition-all active:scale-95 ${selected.color}`}>
                      Test Connection
                   </button>
                </div>
             </motion.div>
           </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
