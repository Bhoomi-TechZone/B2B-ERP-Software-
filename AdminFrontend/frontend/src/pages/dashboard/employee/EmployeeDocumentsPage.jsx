import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  FileText, Briefcase, FileSignature, Files, Download, Loader2, Eye, X
} from 'lucide-react'
import employeeSelfService from '../../../services/employeeSelfService'

const canPreviewDocument = (doc) => {
  const url = doc?.url || ''
  const type = (doc?.type || '').toLowerCase()
  return (
    url.startsWith('data:image') ||
    url.startsWith('data:application/pdf') ||
    url.startsWith('http') ||
    url.startsWith('/') ||
    type === 'pdf'
  )
}

const DocumentPreview = ({ doc }) => {
  if (!doc?.url) {
    return <div className="flex h-full items-center justify-center text-sm text-slate-500">No preview file found.</div>
  }

  if (doc.url.startsWith('blob:')) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center">
        <div>
          <FileText className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="text-sm font-semibold text-slate-700">Preview unavailable for this older upload.</p>
          <p className="mt-1 text-xs text-slate-500">Please upload this document again so it is saved permanently.</p>
        </div>
      </div>
    )
  }

  if (doc.url.startsWith('data:image')) {
    return <img src={doc.url} alt={doc.name} className="h-full w-full object-contain p-4" />
  }

  if (canPreviewDocument(doc)) {
    return <object data={doc.url} type="application/pdf" className="h-full w-full"><iframe title={doc.name} src={doc.url} className="h-full w-full border-0" /></object>
  }

  return (
    <div className="flex h-full items-center justify-center p-8 text-center">
      <div>
        <FileText className="mx-auto mb-3 h-10 w-10 text-slate-300" />
        <p className="text-sm font-semibold text-slate-700">Preview not supported for this file type.</p>
        <p className="mt-1 text-xs text-slate-500">Use the download button to view it locally.</p>
      </div>
    </div>
  )
}

export default function EmployeeDocumentsPage() {
  const [activeTab, setActiveTab] = useState('official')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [previewDoc, setPreviewDoc] = useState(null)

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const res = await employeeSelfService.getDocuments()
      setData(res.data || res || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (doc) => {
    if (!doc.file_url) return
    const link = document.createElement('a')
    link.href = doc.file_url
    link.download = doc.file_name || 'document'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePreview = (doc) => {
    setPreviewDoc({
      name: doc.file_name,
      url: doc.file_url,
      type: ((doc.file_name || '').split('.').pop() || doc.document_type || 'FILE').toUpperCase(),
      size: doc.file_url ? `${Math.ceil((doc.file_url.length * 0.75) / 1024)} KB` : 'Stored',
      date: doc.created_at ? new Date(doc.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
    })
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const tabs = [
    { id: 'official', label: 'Official Letters', icon: FileSignature },
    { id: 'policies', label: 'Policy Documents', icon: Briefcase },
    { id: 'forms', label: 'Company Forms', icon: Files },
    { id: 'personal', label: 'Personal Documents', icon: FileText }
  ]

  const officialDocs = data.filter(d => ['offer_letter', 'appointment_letter', 'contract'].includes(d.document_type))
  const policies = data.filter(d => d.document_type === 'policy')
  const forms = data.filter(d => d.document_type === 'form')
  const personalDocs = data.filter(d => ['id_proof', 'certificate', 'passport', 'other', 'contract'].includes(d.document_type))

  const renderDocumentList = (docs, emptyText) => {
    if (!docs || docs.length === 0) {
      return (
        <div className="text-center p-10 border border-dashed border-slate-300 rounded-xl bg-slate-50/50">
          <FileText className="h-10 w-10 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">{emptyText}</p>
        </div>
      )
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {docs.map((doc, i) => (
          <div key={i} className="flex flex-col p-4 border border-slate-200 rounded-xl bg-white hover:shadow-md transition">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                <FileText className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-slate-900 line-clamp-1" title={doc.file_name}>{doc.file_name}</h3>
                <p className="text-xs text-slate-500 uppercase tracking-wide">{(doc.document_type || 'other').replace('_', ' ')}</p>
              </div>
            </div>
            <div className="mt-auto flex gap-2 pt-3 border-t border-slate-100">
               <button 
                 onClick={() => handlePreview(doc)}
                 className="flex-1 flex justify-center items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 py-2 rounded-lg transition"
               >
                 <Eye className="h-4 w-4" /> View
               </button>
               <button 
                 onClick={() => handleDownload(doc)}
                 className="flex-1 flex justify-center items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 py-2 rounded-lg transition"
               >
                 <Download className="h-4 w-4" /> Download
               </button>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-slate-50 overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 shrink-0">
        <h1 className="text-xl font-bold text-slate-900">Documents</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row min-h-[500px]">
          
          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 border-r border-slate-100 bg-slate-50/50 p-4 shrink-0">
            <nav className="space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-white' : 'text-slate-400'}`} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-4xl"
              >
                {activeTab === 'official' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Official Letters</h2>
                      <p className="text-sm text-slate-500">Offer letter, appointment letter, and contracts</p>
                    </div>
                    {renderDocumentList(officialDocs, 'No official letters available.')}
                  </div>
                )}

                {activeTab === 'policies' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Policy Documents</h2>
                      <p className="text-sm text-slate-500">Company rules, regulations, and handbooks</p>
                    </div>
                    {renderDocumentList(policies, 'No policies published yet.')}
                  </div>
                )}

                {activeTab === 'forms' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Company Forms</h2>
                      <p className="text-sm text-slate-500">Downloadable templates and forms</p>
                    </div>
                    {renderDocumentList(forms, 'No forms available.')}
                  </div>
                )}

                {activeTab === 'personal' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Personal Documents</h2>
                      <p className="text-sm text-slate-500">Your uploaded identity proofs, certificates, and contracts</p>
                    </div>
                    {renderDocumentList(personalDocs, 'No personal documents uploaded yet.')}
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {previewDoc && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm">
          <div className="flex h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-900">{previewDoc.name}</h4>
                <p className="text-xs text-slate-500">{previewDoc.type} · {previewDoc.size} · Uploaded {previewDoc.date}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = previewDoc.url
                    link.download = previewDoc.name
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                  }}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
                >
                  <Download className="h-3.5 w-3.5" /> Download
                </button>
                <button onClick={() => setPreviewDoc(null)} className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 bg-slate-50">
              <DocumentPreview doc={previewDoc} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
