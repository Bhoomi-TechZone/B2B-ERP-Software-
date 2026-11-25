import { useState, memo, useEffect } from 'react'
import { motion } from 'motion/react'
import {
  Building2, Palette, Users, Banknote, Umbrella, Link, ImageIcon,
  Upload, Trash2, Brush, CheckCircle2, Save, Loader2, AlertCircle,
  Globe, Mail, MapPin, Hash, Calendar, CreditCard, Landmark,
  Phone, FileText, DollarSign, Clock, Shield, RefreshCw,
  UserCheck, UserX, Clock3, LayoutDashboard, UserCircle, BarChart2, Settings,
} from 'lucide-react'

import UsersAndRolesSection from './components/UsersAndRolesSection'
import { useAuth } from '../../hooks/useAuth'
import onboardingService from '../../services/onboardingService'

// ── Helper ────────────────────────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value, mono = false }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50">
        <Icon className="h-4 w-4 text-slate-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className={`mt-0.5 text-sm font-semibold text-slate-800 break-words ${mono ? 'font-mono' : ''}`}>{value}</p>
      </div>
    </div>
  )
}

function SectionCard({ title, icon: Icon, color = 'blue', children }) {
  const colors = {
    blue:   'from-blue-500 to-blue-600',
    green:  'from-emerald-500 to-emerald-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    slate:  'from-slate-500 to-slate-600',
  }
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className={`flex items-center gap-3 bg-gradient-to-r ${colors[color]} px-5 py-3.5`}>
        <Icon className="h-5 w-5 text-white" />
        <h3 className="text-sm font-bold text-white">{title}</h3>
      </div>
      <div className="px-5 py-1">{children}</div>
    </div>
  )
}

const MONTHS = ['', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

const SettingsPage = memo(() => {
  const [activeTab, setActiveTab] = useState('company')
  const { session } = useAuth()

  // ── Company Profile from API ──────────────────────────────────────────────
  const [profileData, setProfileData]   = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState('')

  const fetchProfile = async () => {
    setProfileLoading(true)
    setProfileError('')
    try {
      const res = await onboardingService.getDetailedProgress()
      console.log('🏢 Onboarding detailed response:', JSON.stringify(res, null, 2))
      setProfileData(res)
    } catch (err) {
      setProfileError(err.message || 'Failed to load company profile')
    } finally {
      setProfileLoading(false)
    }
  }

  useEffect(() => { fetchProfile() }, [])
  
  // Branding & Theme State - Initialize from localStorage
  const [logoPreview, setLogoPreview] = useState(() => {
    return localStorage.getItem('companyLogo') || null
  })
  const [primaryColor, setPrimaryColor] = useState('#3b82f6')
  const [accentColor, setAccentColor] = useState('#8b5cf6')
  const [sidebarColor, setSidebarColor] = useState('#0f172a')

  const tabs = [
    { id: 'company', label: 'Company Profile', icon: Building2 },
    { id: 'branding', label: 'Branding & Theme', icon: Palette },
    { id: 'users', label: 'Users & Roles', icon: Users },
    { id: 'payroll', label: 'Payroll Settings', icon: Banknote },
    { id: 'leave', label: 'Leave Policies', icon: Umbrella },
    { id: 'integrations', label: 'Integrations', icon: Link },
  ]

  const handleLogoUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const logoData = reader.result
        setLogoPreview(logoData)
        // Save to localStorage
        localStorage.setItem('companyLogo', logoData)
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('logoUpdated', { detail: logoData }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveLogo = () => {
    setLogoPreview(null)
    // Remove from localStorage
    localStorage.removeItem('companyLogo')
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('logoUpdated', { detail: null }))
  }

  const colorThemes = [
    { name: 'Blue Ocean', primary: '#3b82f6', accent: '#8b5cf6', sidebar: '#0f172a' },
    { name: 'Forest Green', primary: '#10b981', accent: '#059669', sidebar: '#064e3b' },
    { name: 'Purple Haze', primary: '#8b5cf6', accent: '#ec4899', sidebar: '#1e1b4b' },
    { name: 'Sunset Orange', primary: '#f97316', accent: '#ef4444', sidebar: '#292524' },
    { name: 'Dark Professional', primary: '#1e293b', accent: '#475569', sidebar: '#020617' },
  ]

  const applyTheme = (theme) => {
    setPrimaryColor(theme.primary)
    setAccentColor(theme.accent)
    setSidebarColor(theme.sidebar)
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#F7F8FA]">
      {/* Tabs - Fixed at top */}
      <div className="border-b border-gray-200 bg-white px-6">
        <div className="flex gap-0 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6">{activeTab === 'company' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="mx-auto max-w-8xl space-y-5">

              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Company Profile</h2>
                  <p className="text-sm text-slate-500">Details from your onboarding setup</p>
                </div>
                <button onClick={fetchProfile} disabled={profileLoading}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">
                  <RefreshCw className={`h-4 w-4 ${profileLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {profileError && (
                <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <AlertCircle className="h-5 w-5 shrink-0" /> {profileError}
                </div>
              )}

              {profileLoading && (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                    <p className="mt-3 text-sm text-slate-500">Loading company profile...</p>
                  </div>
                </div>
              )}

              {!profileLoading && profileData && (() => {
                // API response shape:
                // { step_1_company_profile: {...}, step_2_entity: {...},
                //   step_4_payroll_config: {...}, step_5_leave_policy: {...},
                //   step_1_completed: true, ... }
                const raw = profileData?.data || profileData

                const s1 = raw?.step_1_company_profile || {}
                const s2 = raw?.step_2_entity          || {}
                const s3 = raw?.step_3_team_invites    || {}
                const s4 = raw?.step_4_payroll_config  || {}
                const s5 = raw?.step_5_leave_policy    || {}
                const bank = s2?.bank_details          || {}

                // Completed steps from flat booleans
                const completedSteps = [1,2,3,4,5,6].filter(n => raw?.[`step_${n}_completed`])

                return (
                  <div className="grid gap-5 md:grid-cols-2">

                    {/* ── Company Info ── */}
                    <SectionCard title="Company Information" icon={Building2} color="blue">
                      {s1.company_logo && (
                        <div className="flex justify-center py-4 border-b border-slate-100">
                          <img
                            src={s1.company_logo}
                            alt="Company Logo"
                            className="max-h-20 max-w-full object-contain rounded"
                          />
                        </div>
                      )}
                      <InfoRow icon={Building2} label="Legal Name"       value={s1.company_legal_name} />
                      <InfoRow icon={Building2} label="Trading Name"     value={s1.trading_name} />
                      <InfoRow icon={Globe}     label="Website"          value={s1.website} />
                      <InfoRow icon={Mail}      label="Billing Email"    value={s1.billing_contact_email} />
                      <InfoRow icon={Calendar}  label="Fiscal Year Start"
                        value={s1.fiscal_year_start ? MONTHS[s1.fiscal_year_start] : null} />
                    </SectionCard>

                    {/* ── Registered Address ── */}
                    <SectionCard title="Registered Address" icon={MapPin} color="green">
                      <InfoRow icon={MapPin} label="Address Line 1" value={s1.address_line1} />
                      <InfoRow icon={MapPin} label="Address Line 2" value={s1.address_line2} />
                      <InfoRow icon={MapPin} label="City"           value={s1.city} />
                      <InfoRow icon={MapPin} label="State"          value={s1.state} />
                      <InfoRow icon={Hash}   label="Postal Code"    value={s1.postal_code} />
                      <InfoRow icon={Globe}  label="Country"        value={s1.country} />
                    </SectionCard>

                    {/* ── Tax & Registration ── */}
                    <SectionCard title="Tax & Registration" icon={Shield} color="purple">
                      <InfoRow icon={Hash} label="VAT / GST Number"     value={s1.vat_gst_number} mono />
                      <InfoRow icon={Hash} label="Tax / Employer ID"    value={s2.tax_employer_id} mono />
                      <InfoRow icon={Hash} label="PF Registration No."  value={s2.pf_registration_no} mono />
                      <InfoRow icon={Hash} label="ESI Registration No." value={s2.esi_registration_no} mono />
                    </SectionCard>

                    {/* ── Legal Entity ── */}
                    <SectionCard title="Legal Entity" icon={Landmark} color="orange">
                      <InfoRow icon={Building2}  label="Entity Legal Name"        value={s2.entity_legal_name} />
                      <InfoRow icon={FileText}   label="Entity Type"              value={s2.entity_type} />
                      <InfoRow icon={Globe}      label="Country of Incorporation" value={s2.country_of_incorporation} />
                      <InfoRow icon={MapPin}     label="State / Province"         value={s2.state_province} />
                      <InfoRow icon={DollarSign} label="Currency"                 value={s2.currency} />
                      <InfoRow icon={Calendar}   label="Pay Frequency"            value={s2.pay_frequency} />
                    </SectionCard>

                    {/* ── Bank Details ── */}
                    {(bank.bank_name || bank.account_number) && (
                      <SectionCard title="Bank Details" icon={CreditCard} color="slate">
                        <InfoRow icon={Landmark} label="Bank Name"      value={bank.bank_name} />
                        <InfoRow icon={Hash}     label="Account Number" value={bank.account_number} mono />
                        <InfoRow icon={Hash}     label="IFSC Code"      value={bank.ifsc_code} mono />
                        <InfoRow icon={Hash}     label="Routing Number" value={bank.routing_number} mono />
                        <InfoRow icon={Hash}     label="Sort Code"      value={bank.sort_code} mono />
                      </SectionCard>
                    )}

                    {/* ── Payroll Config ── */}
                    {(s4.next_pay_date || s4.default_working_hours) && (
                      <SectionCard title="Payroll Configuration" icon={Banknote} color="green">
                        <InfoRow icon={Calendar} label="Next Pay Date"         value={s4.next_pay_date} />
                        <InfoRow icon={FileText} label="Salary Structure"      value={s4.salary_structure_template} />
                        <InfoRow icon={Clock}    label="Default Working Hours" value={s4.default_working_hours ? `${s4.default_working_hours} hrs/day` : null} />
                        <InfoRow icon={FileText} label="Overtime Rules"        value={s4.overtime_rules} />
                      </SectionCard>
                    )}

                    {/* ── Leave Policy ── */}
                    {(s5.annual_leave_days != null || s5.leave_policy_template) && (
                      <SectionCard title="Leave Policy" icon={Umbrella} color="purple">
                        <InfoRow icon={FileText}  label="Policy Template"    value={s5.leave_policy_template} />
                        <InfoRow icon={Calendar}  label="Annual Leave Days"  value={s5.annual_leave_days != null ? `${s5.annual_leave_days} days` : null} />
                        <InfoRow icon={Calendar}  label="Sick Leave Days"    value={s5.sick_leave_days != null ? `${s5.sick_leave_days} days` : null} />
                        <InfoRow icon={Calendar}  label="Leave Year Start"   value={s5.leave_year_start ? MONTHS[s5.leave_year_start] : null} />
                        <InfoRow icon={Hash}      label="Carry Forward Limit" value={s5.carry_forward_limit != null ? `${s5.carry_forward_limit} days` : null} />
                      </SectionCard>
                    )}

                    {/* ── Team Invites ── */}
                    {s3?.members?.length > 0 && (
                      <div className="md:col-span-2">
                        <SectionCard title="Team Invitations" icon={Users} color="blue">
                          <div className="py-2 space-y-1">
                            {/* Summary row */}
                            <div className="flex flex-wrap gap-3 py-2 border-b border-slate-100">
                              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                                <Users className="h-3.5 w-3.5 text-slate-400" />
                                Total: {s3.invitations_count}
                              </span>
                              <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                                <Clock3 className="h-3.5 w-3.5" />
                                Pending: {s3.pending_count}
                              </span>
                              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                                <UserCheck className="h-3.5 w-3.5" />
                                Accepted: {s3.accepted_count}
                              </span>
                            </div>
                            {/* Member rows */}
                            {s3.members.map(m => (
                              <div key={m.id} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-xs font-bold shrink-0">
                                    {(m.first_name?.[0] || m.email[0]).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-slate-800">
                                      {m.first_name || ''} {m.last_name || ''}
                                      {!m.first_name && !m.last_name && m.email}
                                    </p>
                                    {(m.first_name || m.last_name) && (
                                      <p className="text-xs text-slate-400">{m.email}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 capitalize">
                                    {m.role?.replace(/_/g, ' ')}
                                  </span>
                                  <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                    m.status === 'accepted'
                                      ? 'bg-emerald-50 text-emerald-700'
                                      : 'bg-amber-50 text-amber-700'
                                  }`}>
                                    {m.status === 'accepted'
                                      ? <UserCheck className="h-3 w-3" />
                                      : <Clock3 className="h-3 w-3" />
                                    }
                                    {m.status}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </SectionCard>
                      </div>
                    )}

                    {/* ── Onboarding Status ── */}
                    <div className="md:col-span-2">
                      <SectionCard title="Onboarding Status" icon={CheckCircle2} color="green">
                        <div className="flex flex-wrap gap-3 py-3">
                          {[1,2,3,4,5,6].map(step => {
                            const done = completedSteps.includes(step)
                            const labels = ['Company Profile','Legal Entity','Team Invites','Payroll Config','Leave Policy','Go Live']
                            return (
                              <div key={step} className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                                done
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-400 border border-slate-200'
                              }`}>
                                {done
                                  ? <CheckCircle2 className="h-3.5 w-3.5" />
                                  : <span className="h-3.5 w-3.5 rounded-full border-2 border-current inline-block" />
                                }
                                Step {step}: {labels[step-1]}
                              </div>
                            )
                          })}
                        </div>
                      </SectionCard>
                    </div>

                    {/* ── Raw Debug (remove in prod) ── */}
                    {import.meta.env.DEV && (
                      <div className="md:col-span-2">
                        <details className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                          <summary className="text-xs font-bold text-slate-400 cursor-pointer">Debug: Raw API Response</summary>
                          <pre className="mt-3 text-[10px] text-slate-600 overflow-auto max-h-64">
                            {JSON.stringify(raw, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}

                  </div>
                )
              })()}

              {!profileLoading && !profileData && !profileError && (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
                  <Building2 className="mx-auto h-12 w-12 text-slate-300" />
                  <p className="mt-4 text-sm font-semibold text-slate-500">No company profile found</p>
                  <p className="text-xs text-slate-400 mt-1">Complete the onboarding wizard to set up your company</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'branding' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto max-w-8xl space-y-6"
            >
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Left Column - Settings */}
                <div className="space-y-6">
                  {/* Logo Upload Section */}
                  <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900"><ImageIcon className="h-5 w-5 text-blue-600" /> Company Logo</h3>
                    <div className="space-y-4">
                      {/* Logo Preview */}
                      <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-8">
                        <img
                          src={logoPreview || '/logo/WorkMatrix1_logo_design-removebg-preview.png'}
                          alt="Logo Preview"
                          className="max-h-32 max-w-full object-contain"
                        />
                      </div>
                      
                      {/* Logo Status */}
                      <div className="text-center text-sm text-slate-600">
                        {logoPreview ? (
                          <span className="text-green-600 font-semibold flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Custom logo uploaded</span>
                        ) : (
                          <span>Using default company logo</span>
                        )}
                      </div>

                      {/* Upload Button */}
                      <div>
                        <label className="block w-full cursor-pointer rounded-lg bg-blue-600 px-4 py-3 text-center font-semibold text-white transition hover:bg-blue-700">
                          <Upload className="inline h-4 w-4 mr-1" /> Upload Logo
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                        </label>
                        <p className="mt-2 text-xs text-slate-500">
                          Recommended: PNG or SVG, Max 2MB, 200x50px
                        </p>
                      </div>

                      {logoPreview && (
                        <button
                          onClick={handleRemoveLogo}
                          className="w-full rounded-lg border-2 border-red-600 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          <Trash2 className="inline h-4 w-4 mr-1" /> Remove Logo
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Color Theme Section */}
                  <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900"><Brush className="h-5 w-5 text-purple-600" /> Color Theme</h3>
                    
                    {/* Preset Themes */}
                    <div className="mb-6">
                      <label className="mb-3 block text-sm font-semibold text-slate-700">
                        Preset Themes
                      </label>
                      <div className="space-y-2">
                        {colorThemes.map((theme, index) => (
                          <button
                            key={index}
                            onClick={() => applyTheme(theme)}
                            className="flex w-full items-center justify-between rounded-lg border border-slate-200 p-3 transition hover:border-blue-500 hover:bg-blue-50"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex gap-1">
                                <div
                                  className="h-6 w-6 rounded"
                                  style={{ backgroundColor: theme.primary }}
                                />
                                <div
                                  className="h-6 w-6 rounded"
                                  style={{ backgroundColor: theme.accent }}
                                />
                                <div
                                  className="h-6 w-6 rounded"
                                  style={{ backgroundColor: theme.sidebar }}
                                />
                              </div>
                              <span className="font-semibold text-slate-900">{theme.name}</span>
                            </div>
                            <span className="text-sm text-blue-600">Apply →</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Color Pickers */}
                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Primary Color (Buttons, Links)
                        </label>
                        <div className="flex gap-3">
                          <input
                            type="color"
                            value={primaryColor}
                            onChange={(e) => setPrimaryColor(e.target.value)}
                            className="h-12 w-20 cursor-pointer rounded-lg border border-slate-300"
                          />
                          <input
                            type="text"
                            value={primaryColor}
                            onChange={(e) => setPrimaryColor(e.target.value)}
                            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm outline-none focus:border-blue-500"
                            placeholder="#3b82f6"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Accent Color (Highlights, Badges)
                        </label>
                        <div className="flex gap-3">
                          <input
                            type="color"
                            value={accentColor}
                            onChange={(e) => setAccentColor(e.target.value)}
                            className="h-12 w-20 cursor-pointer rounded-lg border border-slate-300"
                          />
                          <input
                            type="text"
                            value={accentColor}
                            onChange={(e) => setAccentColor(e.target.value)}
                            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm outline-none focus:border-blue-500"
                            placeholder="#8b5cf6"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Sidebar Color (Navigation Background)
                        </label>
                        <div className="flex gap-3">
                          <input
                            type="color"
                            value={sidebarColor}
                            onChange={(e) => setSidebarColor(e.target.value)}
                            className="h-12 w-20 cursor-pointer rounded-lg border border-slate-300"
                          />
                          <input
                            type="text"
                            value={sidebarColor}
                            onChange={(e) => setSidebarColor(e.target.value)}
                            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm outline-none focus:border-blue-500"
                            placeholder="#0f172a"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Live Preview */}
                <div className="space-y-6">
                  <div className="sticky top-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900"><Eye className="h-5 w-5 text-indigo-600" /> Live Preview</h3>
                    
                    {/* Mini Dashboard Preview */}
                    <div className="overflow-hidden rounded-lg border-2 border-slate-200 shadow-lg">
                      {/* Mini Header */}
                      <div className="border-b border-slate-200 bg-white px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img 
                            src={logoPreview || '/logo/WorkMatrix1_logo_design-removebg-preview.png'} 
                            alt="Logo" 
                            className="h-8 w-auto object-contain" 
                          />
                          <div className="text-sm font-bold text-slate-900">Dashboard Preview</div>
                        </div>
                      </div>

                      {/* Mini Sidebar + Content */}
                      <div className="flex h-64">
                        {/* Mini Sidebar */}
                        <div
                          className="w-16 p-2"
                          style={{ backgroundColor: sidebarColor }}
                        >
                          <div className="space-y-2">
                            {[LayoutDashboard, UserCircle, BarChart2, Settings].map((IconComp, i) => (
                              <div
                                key={i}
                                className="flex h-10 items-center justify-center rounded-lg text-white transition hover:bg-white/10"
                              >
                                <IconComp className="h-4 w-4" />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Mini Content */}
                        <div className="flex-1 bg-slate-50 p-4">
                          {/* Sample Button */}
                          <button
                            className="mb-3 w-full rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                            style={{ backgroundColor: primaryColor }}
                          >
                            Primary Button
                          </button>

                          {/* Sample Badge */}
                          <div className="mb-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold text-white"
                            style={{ backgroundColor: accentColor }}
                          >
                            Accent Badge
                          </div>

                          {/* Sample Card */}
                          <div className="rounded-lg border border-slate-200 bg-white p-3">
                            <div className="mb-2 text-sm font-bold text-slate-900">Sample Card</div>
                            <div className="text-xs text-slate-600">
                              This preview shows how your branding will appear across the dashboard.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Color Values Display */}
                    <div className="mt-4 space-y-2 rounded-lg bg-slate-50 p-3">
                      <div className="text-xs font-semibold uppercase text-slate-500">
                        Current Theme Values
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Primary:</span>
                          <span className="font-mono font-semibold text-slate-900">
                            {primaryColor}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Accent:</span>
                          <span className="font-mono font-semibold text-slate-900">
                            {accentColor}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Sidebar:</span>
                          <span className="font-mono font-semibold text-slate-900">
                            {sidebarColor}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Save Button */}
                    <button className="mt-4 w-full rounded-lg bg-green-600 px-4 py-3 font-semibold text-white shadow-lg transition hover:bg-green-700 flex items-center justify-center gap-2">
                      <Save className="h-4 w-4" /> Save Branding & Apply Theme
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && <UsersAndRolesSection />}

          {(activeTab === 'payroll' || activeTab === 'leave' || activeTab === 'integrations') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto max-w-8xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
                {activeTab === 'payroll' && <><Banknote className="h-5 w-5 text-yellow-500" /> Payroll Settings</>}
                {activeTab === 'leave' && <><Umbrella className="h-5 w-5 text-blue-500" /> Leave Policies</>}
                {activeTab === 'integrations' && <><Link className="h-5 w-5 text-purple-500" /> Integrations</>}
              </h3>
              <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-sm text-blue-900">
                  {activeTab === 'payroll' &&
                    'Configure salary components, tax settings, PF/ESI rates, and payment schedules.'}
                  {activeTab === 'leave' &&
                    'Set up leave types, accrual rules, carry-forward policies, and approval workflows.'}
                  {activeTab === 'integrations' &&
                    'Connect with third-party tools: Slack, Microsoft Teams, Zoom, Banking APIs, etc.'}
                </p>
              </div>
            </motion.div>
          )}
      </div>
    </div>
  )
})

SettingsPage.displayName = 'SettingsPage'

export default SettingsPage
