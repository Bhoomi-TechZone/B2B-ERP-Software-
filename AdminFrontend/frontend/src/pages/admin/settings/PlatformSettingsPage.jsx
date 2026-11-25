import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  Settings, Save, RefreshCw, Shield, Mail, Database,
  Bell, Eye, EyeOff, AlertCircle, CheckCircle2, History,
  Server, Key, Lock, Fingerprint, Clock, Inbox, Hash, Send, X, AlertTriangle,
  Palette, Upload
} from 'lucide-react'

import superAdminService from '../../../services/superAdminService'
import { useAuth } from '../../../hooks/useAuth'
import { useBranding } from '../../../context/BrandingContext'

export default function PlatformSettingsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { branding, updateBranding } = useBranding()
  const [settings, setSettings] = useState({})
  const [originalSettings, setOriginalSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [showApiKey, setShowApiKey] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [errorLoading, setErrorLoading] = useState(false)
  const [auditLogs, setAuditLogs] = useState([])
  const [showConfirm, setShowConfirm] = useState({ visible: false, setting: '', value: null })
  const [brandingState, setBrandingState] = useState({ ...branding })
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(branding.logo)

  // Check if any changes were made to enable Save button
  const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings)

  useEffect(() => {
    fetchSettings()
    fetchAuditLogs()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      setErrorLoading(false)
      const res = await superAdminService.getSettings()
      // Axios responses usually wrap data
      const data = res.data || res
      setSettings(data)
      setOriginalSettings(data)
    } catch (error) {
      console.error('Failed to fetch settings:', error)
      setErrorLoading(true)
    } finally {
      setLoading(false)
    }
  }

  const fetchAuditLogs = async () => {
    try {
      const res = await superAdminService.getSettingsAudit()
      setAuditLogs(res.data || res || [])
    } catch (error) {
      console.error('Failed to fetch audit logs:', error)
    }
  }

  const showToast = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 4000)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const payload = { ...settings }
      delete payload.id
      delete payload._id
      delete payload.updated_at
      delete payload.created_at
      
      // Sanitize properties that shouldn't be null
      if (isNaN(payload.smtp_port) || !payload.smtp_port) payload.smtp_port = 587;
      if (isNaN(payload.api_rate_limit) || !payload.api_rate_limit) payload.api_rate_limit = 1000;
      if (isNaN(payload.session_timeout) || !payload.session_timeout) payload.session_timeout = 60;
      if (isNaN(payload.jwt_expiry_hours) || !payload.jwt_expiry_hours) payload.jwt_expiry_hours = 24;
      if (isNaN(payload.min_password_length) || !payload.min_password_length) payload.min_password_length = 8;
      if (isNaN(payload.password_expiry_days) || !payload.password_expiry_days) payload.password_expiry_days = 90;

      // Update branding in context and API
      const brandingPayload = {
        companyName: brandingState.companyName,
        brandColor: brandingState.brandColor,
        logo: logoPreview,
        supportEmail: brandingState.supportEmail,
      }
      
      // Save branding to backend
      try {
        await superAdminService.updateBranding(brandingPayload)
      } catch (err) {
        console.warn('Branding save failed (API may not support it):', err)
      }

      // Upload logo if selected
      if (logoFile) {
        try {
          const uploadRes = await superAdminService.uploadBrandLogo(logoFile)
          const uploadData = uploadRes.data || uploadRes
          if (uploadData.logoUrl) {
            brandingPayload.logo = uploadData.logoUrl
            setLogoPreview(uploadData.logoUrl)
          }
        } catch (err) {
          console.warn('Logo upload failed:', err)
        }
      }

      // Update branding context (triggers Sidebar/Header re-render)
      updateBranding(brandingPayload)

      const res = await superAdminService.updateSettings(payload)
      const data = res.data || res
      setSettings(data)
      setOriginalSettings(data)
      showToast('success', 'Settings saved successfully')
      fetchAuditLogs() // refresh logs after save
      
      // Removed automatic navigation away so the user stays on the page
    } catch (error) {
      console.error('Failed to save settings:', error)
      showToast('error', 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleSetting = (key, value) => {
    if (key === 'maintenance_mode' && value === true) {
      setShowConfirm({ visible: true, setting: key, value })
      return
    }
    updateSetting(key, value)
    
    // Quick inline toast for toggle feedback
    if (typeof value === 'boolean') {
      const state = value ? 'enabled' : 'disabled'
      showToast('success', `${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} ${state}`)
    }
  }

  const confirmToggle = () => {
    updateSetting(showConfirm.setting, showConfirm.value)
    setShowConfirm({ visible: false, setting: '', value: null })
    showToast('success', 'Maintenance mode enabled')
  }

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleBrandingChange = (key, value) => {
    setBrandingState(prev => ({ ...prev, [key]: value }))
  }

  const handleLogoSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = (ev) => setLogoPreview(ev.target.result)
      reader.readAsDataURL(file)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f5ff] p-6 flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 text-[#1251C5] animate-spin mb-4" />
        <span className="text-slate-600 font-medium">Loading platform settings...</span>
      </div>
    )
  }

  if (errorLoading) {
    return (
      <div className="min-h-screen bg-[#f0f5ff] p-6 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-sm max-w-md w-full text-center border border-red-100">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Failed to Load Settings</h2>
          <p className="text-slate-500 mb-6">There was an error communicating with the server. Please try again.</p>
          <button 
            onClick={fetchSettings}
            className="w-full py-3 bg-[#1251C5] text-white rounded-lg hover:bg-[#0d3d9e] transition flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-5 w-5" /> Retry Connection
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f0f5ff] pb-12">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Platform Settings</h1>
            <p className="text-sm text-slate-500 mt-1">Configure platform-wide system preferences</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchSettings}
              className="flex items-center gap-2 px-4 py-2 border border-[#dce9ff] bg-white text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors ${
                saving
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                : 'bg-[#1251C5] text-white hover:bg-[#0d3d9e] shadow-md hover:shadow-lg'
              }`}
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Global Toast Message */}
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`fixed top-6 right-6 z-50 p-4 rounded-lg shadow-xl border flex items-center gap-3 min-w-[300px] ${
              message.type === 'success' 
                ? 'bg-white border-green-200 text-green-800' 
                : 'bg-white border-red-200 text-red-800'
            }`}
          >
            {message.type === 'success' ? (
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            ) : (
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                <AlertCircle className="h-5 w-5" />
              </div>
            )}
            <span className="font-medium">{message.text}</span>
            <button onClick={() => setMessage({text: ''})} className="ml-auto text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4"/>
            </button>
          </motion.div>
        )}

        {/* Confirmation Modal */}
        {showConfirm.visible && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-100">
              <div className="h-12 w-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Enable Maintenance Mode?</h3>
              <p className="text-slate-600 mb-6">
                Are you sure you want to enable Maintenance Mode? This will temporarily lock out all tenant users from the platform until you turn it back off.
              </p>
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setShowConfirm({ visible: false, setting: '', value: null })}
                  className="px-5 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmToggle}
                  className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                >
                  Yes, Enable
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Vertical Tabs Sidebar */}
          <div className="w-full lg:w-64 shrink-0">
            <div className="bg-white rounded-xl border border-[#dce9ff] p-2 space-y-1 shadow-sm sticky top-6">
              {[
                { id: 'general', label: 'Platform Info', icon: Server },
                { id: 'branding', label: 'Branding', icon: Palette },
                { id: 'security', label: 'Access Control', icon: Shield },
                { id: 'email', label: 'Email Configuration', icon: Mail },
                { id: 'api', label: 'Integrations & API', icon: Database },
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'audit', label: 'Audit Logs', icon: History }
              ].map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-[#1251C5] text-white shadow-md'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Settings Content Area */}
          <div className="flex-1 bg-white rounded-xl border border-[#dce9ff] shadow-sm overflow-hidden">
            <div className="p-8">
              {activeTab === 'general' && <GeneralSettings settings={settings} updateSetting={updateSetting} handleToggleSetting={handleToggleSetting} />}
              {activeTab === 'branding' && (
                <BrandingSettings 
                  brandingState={brandingState} 
                  handleBrandingChange={handleBrandingChange}
                  logoPreview={logoPreview}
                  handleLogoSelect={handleLogoSelect}
                />
              )}
              {activeTab === 'security' && <SecuritySettings settings={settings} updateSetting={updateSetting} handleToggleSetting={handleToggleSetting} />}
              {activeTab === 'email' && <EmailSettings settings={settings} updateSetting={updateSetting} />}
              {activeTab === 'api' && <ApiSettings settings={settings} updateSetting={updateSetting} showApiKey={showApiKey} setShowApiKey={setShowApiKey} />}
              {activeTab === 'notifications' && <NotificationSettings settings={settings} updateSetting={updateSetting} handleToggleSetting={handleToggleSetting} />}
              {activeTab === 'audit' && <AuditLogs logs={auditLogs} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Loader2(props) {
  return (
    <svg {...props} xmlns="http://www.000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  )
}

// -------------------------------------------------------------
// Branding Settings Component
// -------------------------------------------------------------
function BrandingSettings({ brandingState, handleBrandingChange, logoPreview, handleLogoSelect }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-6">
          <Palette className="h-5 w-5 text-[#1251C5]" /> Branding Settings
        </h3>
        <p className="text-sm text-slate-500 mb-6">
          Customize the look and feel of your platform. Changes will be visible across the entire application.
        </p>

        {/* Logo Upload */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Upload className="h-4 w-4 text-slate-400" /> Company Logo
          </label>
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-xl border-2 border-dashed border-slate-300 bg-white flex items-center justify-center overflow-hidden">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo preview" className="h-full w-full object-contain p-2" />
              ) : (
                <Upload className="h-8 w-8 text-slate-400" />
              )}
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoSelect}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#1251C5] file:text-white hover:file:bg-[#0d3d9e]"
              />
              <p className="text-xs text-slate-500 mt-2">Recommended: PNG or JPG, at least 200x200px</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Settings className="h-4 w-4 text-slate-400" /> Company Name
            </label>
            <input
              type="text"
              value={brandingState.companyName || ''}
              onChange={(e) => handleBrandingChange('companyName', e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1251C5] focus:border-transparent outline-none transition"
              placeholder="WorkMatrix HRMS"
            />
            <p className="text-xs text-slate-500 mt-2">This name appears in emails, headers, and the browser tab.</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Mail className="h-4 w-4 text-slate-400" /> Support Email
            </label>
            <input
              type="email"
              value={brandingState.supportEmail || ''}
              onChange={(e) => handleBrandingChange('supportEmail', e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1251C5] focus:border-transparent outline-none transition"
              placeholder="support@workmatrix.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Palette className="h-4 w-4 text-slate-400" /> Brand Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={brandingState.brandColor || '#1251C5'}
                onChange={(e) => handleBrandingChange('brandColor', e.target.value)}
                className="h-12 w-12 rounded-lg border border-slate-200 cursor-pointer bg-white p-1"
              />
              <input
                type="text"
                value={brandingState.brandColor || '#1251C5'}
                onChange={(e) => handleBrandingChange('brandColor', e.target.value)}
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1251C5] focus:border-transparent outline-none transition font-mono"
                placeholder="#1251C5"
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Used for sidebar active items, buttons, and theme accents.
              {' '}
              <span 
                className="inline-block h-4 w-4 rounded align-middle" 
                style={{ backgroundColor: brandingState.brandColor || '#1251C5' }}
              />
            </p>
          </div>
        </div>

        {/* Preview */}
        <div className="mt-8 p-6 rounded-xl border border-slate-200 bg-white">
          <h4 className="text-sm font-bold text-slate-700 mb-4">Preview</h4>
          <div className="flex items-center gap-4 p-4 rounded-lg" style={{ backgroundColor: `${brandingState.brandColor || '#1251C5'}10` }}>
            <div className="h-12 w-12 rounded-lg bg-white flex items-center justify-center p-1 shadow-sm">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="h-full w-full object-contain" />
              ) : (
                <Settings className="h-6 w-6" style={{ color: brandingState.brandColor || '#1251C5' }} />
              )}
            </div>
            <div>
              <p className="text-lg font-bold" style={{ color: brandingState.brandColor || '#1251C5' }}>
                {brandingState.companyName || 'WorkMatrix HRMS'}
              </p>
              <p className="text-sm text-slate-500">{brandingState.supportEmail || 'support@workmatrix.com'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// Component Sections
// -------------------------------------------------------------

function GeneralSettings({ settings, updateSetting, handleToggleSetting }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-6">
          <Server className="h-5 w-5 text-[#1251C5]" /> System Basics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Settings className="h-4 w-4 text-slate-400" /> Platform Name
            </label>
            <input
              type="text"
              value={settings.platform_name || ''}
              onChange={(e) => updateSetting('platform_name', e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1251C5] focus:border-transparent outline-none transition"
              placeholder="WorkMatrix HRMS"
            />
            <p className="text-xs text-slate-500 mt-2">This name appears in emails and global headers.</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Mail className="h-4 w-4 text-slate-400" /> Support Email
            </label>
            <input
              type="email"
              value={settings.support_email || ''}
              onChange={(e) => updateSetting('support_email', e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1251C5] focus:border-transparent outline-none transition"
              placeholder="support@workmatrix.com"
            />
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-100">
        <h3 className="text-xl font-bold text-slate-900 mb-6">System Controls</h3>
        <div className="space-y-4">
          <div className="flex items-start justify-between p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div>
              <p className="font-bold text-slate-900 text-lg">Maintenance Mode</p>
              <p className="text-sm text-slate-500 mt-1">Temporarily disable platform access for all users during upgrades.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer mt-1">
              <input
                type="checkbox"
                checked={settings.maintenance_mode || false}
                onChange={(e) => handleToggleSetting('maintenance_mode', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-500"></div>
            </label>
          </div>

          <div className="flex items-start justify-between p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div>
              <p className="font-bold text-slate-900 text-lg">Allow New Registrations</p>
              <p className="text-sm text-slate-500 mt-1">Enable or disable public signup for new tenant accounts.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer mt-1">
              <input
                type="checkbox"
                checked={settings.registration_enabled !== false}
                onChange={(e) => handleToggleSetting('registration_enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#1251C5]"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

function SecuritySettings({ settings, updateSetting, handleToggleSetting }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-6">
          <Lock className="h-5 w-5 text-[#1251C5]" /> Access Control
        </h3>
        
        <div className="flex items-start justify-between p-5 bg-white rounded-xl border border-slate-200 shadow-sm mb-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
              <Fingerprint className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-lg">Two-Factor Authentication</p>
              <p className="text-sm text-slate-500">Enforce mandatory 2FA for all administrative accounts.</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer mt-2">
            <input
              type="checkbox"
              checked={settings.require_2fa || false}
              onChange={(e) => handleToggleSetting('require_2fa', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#1251C5]"></div>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" /> Session Timeout (minutes)
            </label>
            <input
              type="number"
              value={settings.session_timeout || 60}
              onChange={(e) => updateSetting('session_timeout', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1251C5] focus:border-transparent outline-none transition"
            />
            <p className="text-xs text-slate-500 mt-2">Users are logged out after this duration of inactivity.</p>
          </div>
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Key className="h-4 w-4 text-slate-400" /> JWT Expiry Time (hours)
            </label>
            <input
              type="number"
              value={settings.jwt_expiry_hours || 24}
              onChange={(e) => updateSetting('jwt_expiry_hours', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1251C5] focus:border-transparent outline-none transition"
            />
            <p className="text-xs text-slate-500 mt-2">Maximum lifespan of the underlying authentication token.</p>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-100">
        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Shield className="h-5 w-5 text-[#1251C5]" /> Password Policy
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Minimum Length</label>
            <input
              type="number"
              value={settings.min_password_length || 8}
              onChange={(e) => updateSetting('min_password_length', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1251C5] focus:border-transparent outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Password Expiry (days)</label>
            <input
              type="number"
              value={settings.password_expiry_days || 90}
              onChange={(e) => updateSetting('password_expiry_days', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1251C5] focus:border-transparent outline-none transition"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function EmailSettings({ settings, updateSetting }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-6">
          <Send className="h-5 w-5 text-[#1251C5]" /> SMTP Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Server className="h-4 w-4 text-slate-400" /> SMTP Host
            </label>
            <input
              type="text"
              value={settings.smtp_host || ''}
              onChange={(e) => updateSetting('smtp_host', e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1251C5] focus:border-transparent outline-none"
              placeholder="smtp.gmail.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Hash className="h-4 w-4 text-slate-400" /> SMTP Port
            </label>
            <input
              type="number"
              value={settings.smtp_port || 587}
              onChange={(e) => updateSetting('smtp_port', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1251C5] focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Inbox className="h-4 w-4 text-slate-400" /> SMTP Username
            </label>
            <input
              type="text"
              value={settings.smtp_username || ''}
              onChange={(e) => updateSetting('smtp_username', e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1251C5] focus:border-transparent outline-none"
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Key className="h-4 w-4 text-slate-400" /> SMTP Password
            </label>
            <input
              type="password"
              value={settings.smtp_password || ''}
              onChange={(e) => updateSetting('smtp_password', e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1251C5] focus:border-transparent outline-none"
              placeholder="••••••••••••"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Mail className="h-4 w-4 text-slate-400" /> Default Email Sender
            </label>
            <input
              type="text"
              value={settings.email_sender || ''}
              onChange={(e) => updateSetting('email_sender', e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1251C5] focus:border-transparent outline-none"
              placeholder="noreply@workmatrix.com"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end">
        </div>
      </div>
    </div>
  )
}

function ApiSettings({ settings, updateSetting, showApiKey, setShowApiKey }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-6">
          <Database className="h-5 w-5 text-[#1251C5]" /> Integrations & API
        </h3>
        <div className="space-y-6">
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
            <label className="block text-sm font-semibold text-slate-700 mb-2">API Rate Limit (requests/minute)</label>
            <input
              type="number"
              value={settings.api_rate_limit || 1000}
              onChange={(e) => updateSetting('api_rate_limit', parseInt(e.target.value))}
              className="w-full md:w-64 px-4 py-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1251C5] focus:border-transparent outline-none"
            />
            <p className="text-sm text-slate-500 mt-2">Global throttle to prevent abuse across tenant APIs.</p>
          </div>

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Key className="h-4 w-4 text-slate-400" /> Master Webhook Key
            </label>
            <div className="flex items-center gap-2 max-w-lg">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={settings.master_api_key || ''}
                onChange={(e) => updateSetting('master_api_key', e.target.value)}
                className="flex-1 px-4 py-3 bg-white border border-slate-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-[#1251C5] outline-none"
                placeholder="sk-..."
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="p-3 bg-white border border-slate-300 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition"
              >
                {showApiKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function NotificationSettings({ settings, updateSetting, handleToggleSetting }) {
  const toggles = [
    { key: 'email_notifications', label: 'Email Delivery System', desc: 'Enable sending system notifications via SMTP' },
    { key: 'in_app_notifications', label: 'In-App Web Sockets', desc: 'Allow real-time bell notifications in dashboard' },
    { key: 'announcement_alerts', label: 'Global Announcement Alerts', desc: 'Push important announcements instantly' },
    { key: 'notify_new_tenant', label: 'New Tenant Signups', desc: 'Alert SuperAdmins when a new organization joins' },
    { key: 'notify_payment_failed', label: 'Billing Failures', desc: 'Alert when a tenant subscription payment fails' },
    { key: 'notify_system_errors', label: 'Critical Errors', desc: 'Send alerts for internal 500 server errors' }
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-6">
        <Bell className="h-5 w-5 text-[#1251C5]" /> Global Notifications
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {toggles.map(t => (
          <div key={t.key} className="flex items-start justify-between p-5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <p className="font-bold text-slate-900">{t.label}</p>
              <p className="text-sm text-slate-500 mt-1">{t.desc}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer mt-1">
              <input
                type="checkbox"
                checked={settings[t.key] !== false}
                onChange={(e) => handleToggleSetting(t.key, e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1251C5]"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}

function AuditLogs({ logs }) {
  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-16 animate-in fade-in duration-300">
        <History className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-900">No Audit Logs Found</h3>
        <p className="text-slate-500">Settings changes will be recorded here automatically.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-6">
        <History className="h-5 w-5 text-[#1251C5]" /> Configuration Change Log
      </h3>
      
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Timestamp</th>
                <th className="px-6 py-4 font-semibold">Administrator</th>
                <th className="px-6 py-4 font-semibold">Action Performed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id || log._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-slate-900">
                      {new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(log.timestamp))}
                    </span>
                    <span className="text-slate-500 ml-2">
                      {new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(log.timestamp))}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">{log.user_name}</span>
                      <span className="text-xs text-slate-500">{log.user_email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-medium">
                      {log.action}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}