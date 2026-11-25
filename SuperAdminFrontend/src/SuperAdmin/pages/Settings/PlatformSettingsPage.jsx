import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import {
  Settings, Save, RefreshCw, Shield, Mail, Globe, Database,
  Bell, Users, Lock, Eye, EyeOff, AlertCircle, CheckCircle2,
  Send, Server
} from 'lucide-react'
import SuperAdminTopBar from '../../components/TopBar'
import superAdminService from '../../../services/superAdminService'

export default function PlatformSettingsPage() {
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [showApiKey, setShowApiKey] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const data = await superAdminService.getSettings()
      setSettings(data || {})
    } catch (error) {
      console.error('Failed to fetch settings:', error)
      setMessage({ type: 'error', text: 'Failed to load settings' })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await superAdminService.updateSettings(settings)
      setMessage({ type: 'success', text: 'Settings saved successfully' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      console.error('Failed to save settings:', error)
      setMessage({ type: 'error', text: 'Failed to save settings' })
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f5ff]">
        <SuperAdminTopBar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1251C5]"></div>
          <span className="ml-3 text-slate-500">Loading settings...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f0f5ff]">
      <SuperAdminTopBar />
      
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Platform Settings</h1>
            <p className="text-sm text-slate-500 mt-1">Configure platform-wide settings and preferences</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchSettings}
              className="flex items-center gap-2 px-4 py-2 border border-[#dce9ff] bg-white rounded-lg hover:bg-[#f0f5ff] transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-[#1251C5] text-white rounded-lg hover:bg-[#0d3d9e] transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Message */}
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg border ${
              message.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              {message.text}
            </div>
          </motion.div>
        )}

        {/* Settings Tabs */}
        <div className="bg-white rounded-xl border border-[#dce9ff] overflow-hidden">
          <div className="flex border-b border-[#f0f5ff] overflow-x-auto">
            {[
              { id: 'general', label: 'General', icon: Settings },
              { id: 'security', label: 'Security', icon: Shield },
              { id: 'email', label: 'Email', icon: Mail },
              { id: 'api', label: 'API', icon: Database },
              { id: 'notifications', label: 'Notifications', icon: Bell }
            ].map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors relative whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-[#1251C5] bg-[#f0f5ff]'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeSettingsTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1251C5]"
                    />
                  )}
                </button>
              )
            })}
          </div>

          <div className="p-6">
            {activeTab === 'general' && <GeneralSettings settings={settings} updateSetting={updateSetting} />}
            {activeTab === 'security' && <SecuritySettings settings={settings} updateSetting={updateSetting} />}
            {activeTab === 'email' && <EmailSettings settings={settings} updateSetting={updateSetting} />}
            {activeTab === 'api' && <ApiSettings settings={settings} updateSetting={updateSetting} showApiKey={showApiKey} setShowApiKey={setShowApiKey} />}
            {activeTab === 'notifications' && <NotificationSettings settings={settings} updateSetting={updateSetting} />}
          </div>
        </div>
      </div>
    </div>
  )
}

function GeneralSettings({ settings, updateSetting }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Platform Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Platform Name</label>
            <input
              type="text"
              value={settings.platform_name || ''}
              onChange={(e) => updateSetting('platform_name', e.target.value)}
              className="w-full px-3 py-2 border border-[#dce9ff] rounded-lg focus:ring-2 focus:ring-[#1251C5] focus:border-transparent outline-none"
              placeholder="WorkMatrix HRMS"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Support Email</label>
            <input
              type="email"
              value={settings.support_email || ''}
              onChange={(e) => updateSetting('support_email', e.target.value)}
              className="w-full px-3 py-2 border border-[#dce9ff] rounded-lg focus:ring-2 focus:ring-[#1251C5] focus:border-transparent outline-none"
              placeholder="support@workmatrix.com"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Platform Status</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-[#f8faff] rounded-lg border border-[#dce9ff]">
            <div>
              <p className="font-medium text-slate-900">Maintenance Mode</p>
              <p className="text-sm text-slate-500">Temporarily disable platform access for maintenance</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenance_mode || false}
                onChange={(e) => updateSetting('maintenance_mode', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#1251C5]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1251C5]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#f8faff] rounded-lg border border-[#dce9ff]">
            <div>
              <p className="font-medium text-slate-900">New Registrations</p>
              <p className="text-sm text-slate-500">Allow new tenant registrations</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.registration_enabled !== false}
                onChange={(e) => updateSetting('registration_enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#1251C5]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1251C5]"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

function SecuritySettings({ settings, updateSetting }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Authentication</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Session Timeout (minutes)</label>
            <input
              type="number"
              value={settings.session_timeout || 60}
              onChange={(e) => updateSetting('session_timeout', parseInt(e.target.value))}
              className="w-full md:w-48 px-3 py-2 border border-[#dce9ff] rounded-lg focus:ring-2 focus:ring-[#1251C5] focus:border-transparent outline-none"
              min="5"
              max="1440"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-[#f8faff] rounded-lg border border-[#dce9ff]">
            <div>
              <p className="font-medium text-slate-900">Two-Factor Authentication</p>
              <p className="text-sm text-slate-500">Require 2FA for all admin accounts</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.require_2fa || false}
                onChange={(e) => updateSetting('require_2fa', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#1251C5]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1251C5]"></div>
            </label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Password Policy</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Minimum Length</label>
            <input
              type="number"
              value={settings.min_password_length || 8}
              onChange={(e) => updateSetting('min_password_length', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-[#dce9ff] rounded-lg focus:ring-2 focus:ring-[#1251C5] focus:border-transparent outline-none"
              min="6"
              max="32"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Password Expiry (days)</label>
            <input
              type="number"
              value={settings.password_expiry_days || 90}
              onChange={(e) => updateSetting('password_expiry_days', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-[#dce9ff] rounded-lg focus:ring-2 focus:ring-[#1251C5] focus:border-transparent outline-none"
              min="30"
              max="365"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function EmailSettings({ settings, updateSetting }) {
  const [testEmail, setTestEmail] = useState('')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState({ type: '', text: '' })
  const [showSmtpPassword, setShowSmtpPassword] = useState(false)

  const handleSendTest = async () => {
    if (!testEmail) {
      setTestResult({ type: 'error', text: 'Please enter a recipient email address' })
      return
    }
    try {
      setTesting(true)
      setTestResult({ type: '', text: '' })
      const res = await superAdminService.sendTestEmail(testEmail, {
        smtp_host: settings.smtp_host,
        smtp_port: settings.smtp_port,
        smtp_username: settings.smtp_username,
        smtp_password: settings.smtp_password,
        smtp_use_tls: settings.smtp_use_tls,
        email_sender: settings.email_sender,
      })
      setTestResult({
        type: 'success',
        text: res.message || 'Test email dispatched successfully! Please check your inbox and spam folder.'
      })
    } catch (err) {
      const detail = err.response?.data?.detail || err.message || 'Failed to send test email'
      setTestResult({
        type: 'error',
        text: `Test failed: ${detail}`
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* SMTP Configuration Form */}
      <div className="p-5 bg-white border border-[#dce9ff] rounded-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#f0f5ff]">
          <div>
            <h4 className="font-semibold text-slate-900 flex items-center gap-2">
              <Server className="h-4 w-4 text-[#1251C5]" />
              SMTP Server Configuration
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">Configure platform-wide outgoing SMTP mail server (Gmail, Outlook, Amazon SES, or custom)</p>
          </div>
          <span className="text-xs text-slate-400">Values are securely encrypted and dynamically loaded</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">SMTP Host</label>
            <input
              type="text"
              value={settings.smtp_host || ''}
              onChange={(e) => updateSetting('smtp_host', e.target.value)}
              className="w-full px-3 py-2 border border-[#dce9ff] rounded-lg focus:ring-2 focus:ring-[#1251C5] focus:border-transparent outline-none text-sm"
              placeholder="smtp.gmail.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">SMTP Port</label>
            <input
              type="number"
              value={settings.smtp_port || 587}
              onChange={(e) => updateSetting('smtp_port', parseInt(e.target.value) || 587)}
              className="w-full px-3 py-2 border border-[#dce9ff] rounded-lg focus:ring-2 focus:ring-[#1251C5] focus:border-transparent outline-none text-sm"
              placeholder="587"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">SMTP Username / Email</label>
            <input
              type="text"
              value={settings.smtp_username || ''}
              onChange={(e) => updateSetting('smtp_username', e.target.value)}
              className="w-full px-3 py-2 border border-[#dce9ff] rounded-lg focus:ring-2 focus:ring-[#1251C5] focus:border-transparent outline-none text-sm"
              placeholder="your-email@gmail.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">SMTP Password / App Password</label>
            <div className="relative">
              <input
                type={showSmtpPassword ? 'text' : 'password'}
                value={settings.smtp_password || ''}
                onChange={(e) => updateSetting('smtp_password', e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-[#dce9ff] rounded-lg focus:ring-2 focus:ring-[#1251C5] focus:border-transparent outline-none text-sm"
                placeholder="App Password (16 characters)"
              />
              <button
                type="button"
                onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showSmtpPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sender Email ("From" Address)</label>
            <input
              type="text"
              value={settings.email_sender || ''}
              onChange={(e) => updateSetting('email_sender', e.target.value)}
              className="w-full px-3 py-2 border border-[#dce9ff] rounded-lg focus:ring-2 focus:ring-[#1251C5] focus:border-transparent outline-none text-sm"
              placeholder="noreply@workmatrix.com or same as username"
            />
          </div>
          <div className="flex items-center pt-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.smtp_use_tls !== false}
                onChange={(e) => updateSetting('smtp_use_tls', e.target.checked)}
                className="w-4 h-4 text-[#1251C5] border-gray-300 rounded focus:ring-[#1251C5]"
              />
              <div>
                <span className="text-sm font-medium text-slate-700">Enable TLS / STARTTLS Encryption</span>
                <p className="text-xs text-slate-400">Recommended for port 587 (Gmail, Outlook, Amazon SES)</p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* URL & Platform Links */}
      <div className="p-5 bg-white border border-[#dce9ff] rounded-xl space-y-4">
        <h4 className="font-semibold text-slate-900 flex items-center gap-2">
          <Globe className="h-4 w-4 text-[#1251C5]" />
          Application & Verification URLs
        </h4>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Frontend Application URL</label>
          <input
            type="url"
            value={settings.frontend_url || ''}
            onChange={(e) => updateSetting('frontend_url', e.target.value)}
            className="w-full md:w-2/3 px-3 py-2 border border-[#dce9ff] rounded-lg focus:ring-2 focus:ring-[#1251C5] focus:border-transparent outline-none text-sm"
            placeholder="http://localhost:5679 or https://hrmsb2b.btplsoft.com"
          />
          <p className="text-xs text-slate-400 mt-1">This URL is embedded in email verification buttons, password reset links, and employee invitations.</p>
        </div>
      </div>

      {/* Live Email Testing Console */}
      <div className="p-5 bg-gradient-to-br from-[#f8faff] to-[#f0f5ff] border border-[#dce9ff] rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-slate-900 flex items-center gap-2">
              <Send className="h-4 w-4 text-[#1251C5]" />
              Test Email Connection
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">Send a test message to verify your credentials before saving.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Enter destination email (e.g. your email)"
            className="flex-1 px-3 py-2 border border-[#dce9ff] rounded-lg focus:ring-2 focus:ring-[#1251C5] focus:border-transparent outline-none bg-white text-sm"
          />
          <button
            type="button"
            onClick={handleSendTest}
            disabled={testing}
            className="flex items-center justify-center gap-2 px-5 py-2 bg-[#1251C5] text-white rounded-lg hover:bg-[#0d3d9e] transition-colors disabled:opacity-50 text-sm font-medium shadow-sm whitespace-nowrap"
          >
            {testing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Sending Test...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Test Email
              </>
            )}
          </button>
        </div>

        {testResult.text && (
          <div
            className={`p-3 rounded-lg text-sm border flex items-start gap-2 ${
              testResult.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {testResult.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
            )}
            <span>{testResult.text}</span>
          </div>
        )}
      </div>

      {/* Email Preferences */}
      <div className="p-5 bg-white border border-[#dce9ff] rounded-xl space-y-4">
        <h4 className="font-semibold text-slate-900">Email Notification Preferences</h4>
        <div className="flex items-center justify-between p-4 bg-[#f8faff] rounded-lg border border-[#dce9ff]">
          <div>
            <p className="font-medium text-slate-900">System Email Notifications</p>
            <p className="text-xs text-slate-500">Allow platform to send transactional emails, registration alerts, and trial expiry warnings</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.email_notifications !== false}
              onChange={(e) => updateSetting('email_notifications', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#1251C5]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1251C5]"></div>
          </label>
        </div>
      </div>
    </div>
  )
}

function ApiSettings({ settings, updateSetting, showApiKey, setShowApiKey }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">API Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">API Rate Limit (requests per minute)</label>
            <input
              type="number"
              value={settings.api_rate_limit || 1000}
              onChange={(e) => updateSetting('api_rate_limit', parseInt(e.target.value))}
              className="w-full md:w-48 px-3 py-2 border border-[#dce9ff] rounded-lg focus:ring-2 focus:ring-[#1251C5] focus:border-transparent outline-none"
              min="10"
              max="10000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Master API Key</label>
            <div className="flex items-center gap-2">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={settings.master_api_key || 'sk-1234567890abcdef'}
                readOnly
                className="flex-1 px-3 py-2 border border-[#dce9ff] rounded-lg bg-gray-50 font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">This key provides full platform access. Keep it secure.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function NotificationSettings({ settings, updateSetting }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">System Notifications</h3>
        <div className="space-y-4">
          {[
            { key: 'notify_new_tenant', label: 'New Tenant Registration', desc: 'Notify when a new tenant registers' },
            { key: 'notify_payment_failed', label: 'Payment Failures', desc: 'Notify when tenant payments fail' },
            { key: 'notify_system_errors', label: 'System Errors', desc: 'Notify about critical system errors' },
            { key: 'notify_security_alerts', label: 'Security Alerts', desc: 'Notify about security incidents' }
          ].map(notification => (
            <div key={notification.key} className="flex items-center justify-between p-4 bg-[#f8faff] rounded-lg border border-[#dce9ff]">
              <div>
                <p className="font-medium text-slate-900">{notification.label}</p>
                <p className="text-sm text-slate-500">{notification.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings[notification.key] !== false}
                  onChange={(e) => updateSetting(notification.key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#1251C5]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1251C5]"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}