import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Lock, Eye, EyeOff, Check, Camera, ShieldCheck, 
  User, FileText, HelpCircle, ChevronRight, X, Loader2,
  LogIn, LogOut, Globe, Activity, Laptop, Smartphone
} from 'lucide-react'
import employeeSelfService from '../../../services/employeeSelfService'

export default function EmployeeSettingsPage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [alertOpen, setAlertOpen] = useState(true)
  const [showLoginActivity, setShowLoginActivity] = useState(false)

  // Form password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Password visibility state
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // Load employee profile details
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const res = await employeeSelfService.getProfile()
        setProfile(res)
      } catch (err) {
        console.error('Failed to load profile details:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  // Password requirements checks
  const { newPassword } = passwordData
  const metLength = newPassword.length >= 8
  const metUppercase = /[A-Z]/.test(newPassword)
  const metNumber = /[0-9]/.test(newPassword)
  const metSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
  const metNotCommon = newPassword.length > 0 && !['12345678', 'password', 'password123', 'admin123', 'workmatrix'].includes(newPassword.toLowerCase())

  const requirementsCount = [metLength, metUppercase, metNumber, metSpecial, metNotCommon].filter(Boolean).length

  // Password strength label and color
  let strengthLabel = 'Weak'
  let strengthColor = 'text-rose-500'
  if (requirementsCount >= 5) {
    strengthLabel = 'Strong'
    strengthColor = 'text-emerald-500 font-bold'
  } else if (requirementsCount >= 3) {
    strengthLabel = 'Medium'
    strengthColor = 'text-amber-500 font-semibold'
  }

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 5000)
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (!passwordData.currentPassword) {
      showMessage('error', 'Please enter your current password')
      return
    }
    if (requirementsCount < 5) {
      showMessage('error', 'Please satisfy all security requirements')
      return
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage('error', 'New passwords do not match')
      return
    }

    try {
      setSaving(true)
      await employeeSelfService.changePassword(passwordData.newPassword)
      showMessage('success', 'Password updated successfully')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      showMessage('error', err.response?.data?.detail || 'Failed to update password')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-64px)] w-full flex-col bg-slate-50/50 overflow-hidden font-sans">
      {/* Top Header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-100 bg-white px-6 py-4 shrink-0">
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Settings</h1>
      </div>

      {/* Message Banner */}
      {message.text && (
        <div className={`p-3 text-center text-xs font-bold shrink-0 animate-fade-in border-b ${
          message.type === 'error' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
        }`}>
          {message.text}
        </div>
      )}

      {/* Main Split Layout */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start max-w-6xl mx-auto">
          
          {/* LEFT COLUMN: Change Password Card */}
          <div className="lg:col-span-2 bg-white border border-slate-150 rounded-2xl p-6 shadow-xs space-y-6">
            
            {/* Header Lock Icon */}
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Change Password</h2>
                <p className="text-xs font-semibold text-slate-400 mt-1">Ensure your account is using a long, random password to stay secure.</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handlePasswordChange} className="space-y-6">
              
              {/* Current Password */}
              <div className="relative">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Current Password</label>
                <div className="relative">
                  <input 
                    type={showCurrent ? 'text' : 'password'} 
                    required 
                    placeholder="••••••••••••"
                    value={passwordData.currentPassword} 
                    onChange={e => setPasswordData(p => ({...p, currentPassword: e.target.value}))} 
                    className="w-full bg-slate-50 border border-slate-150 rounded-xl py-3 px-4 pr-12 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500/20 transition shadow-inner"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 transition cursor-pointer"
                  >
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="relative">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">New Password</label>
                <div className="relative">
                  <input 
                    type={showNew ? 'text' : 'password'} 
                    required 
                    placeholder="••••••••••••"
                    value={passwordData.newPassword} 
                    onChange={e => setPasswordData(p => ({...p, newPassword: e.target.value}))} 
                    className="w-full bg-slate-50 border border-slate-150 rounded-xl py-3 px-4 pr-12 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500/20 transition shadow-inner"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 transition cursor-pointer"
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Strength Indicator Bar */}
              {newPassword.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-400">Password Strength</span>
                    <span className={strengthColor}>{strengthLabel}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className={`h-1.5 rounded-full transition-all ${requirementsCount >= 1 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                    <div className={`h-1.5 rounded-full transition-all ${requirementsCount >= 3 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                    <div className={`h-1.5 rounded-full transition-all ${requirementsCount >= 5 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                  </div>
                </div>
              )}

              {/* Checklist */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5 pt-2">
                <div className="flex items-center gap-2.5">
                  <Check className={`h-4 w-4 shrink-0 transition-colors ${metLength ? 'text-emerald-500' : 'text-slate-300'}`} />
                  <span className={`text-xs font-bold transition-colors ${metLength ? 'text-slate-700' : 'text-slate-450'}`}>Minimum 8 characters</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className={`h-4 w-4 shrink-0 transition-colors ${metSpecial ? 'text-emerald-500' : 'text-slate-300'}`} />
                  <span className={`text-xs font-bold transition-colors ${metSpecial ? 'text-slate-700' : 'text-slate-450'}`}>1 special character (!@#$%^&*)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className={`h-4 w-4 shrink-0 transition-colors ${metUppercase ? 'text-emerald-500' : 'text-slate-300'}`} />
                  <span className={`text-xs font-bold transition-colors ${metUppercase ? 'text-slate-700' : 'text-slate-450'}`}>1 uppercase letter (A-Z)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className={`h-4 w-4 shrink-0 transition-colors ${metNotCommon ? 'text-emerald-500' : 'text-slate-300'}`} />
                  <span className={`text-xs font-bold transition-colors ${metNotCommon ? 'text-slate-700' : 'text-slate-450'}`}>Password should not be common</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className={`h-4 w-4 shrink-0 transition-colors ${metNumber ? 'text-emerald-500' : 'text-slate-300'}`} />
                  <span className={`text-xs font-bold transition-colors ${metNumber ? 'text-slate-700' : 'text-slate-450'}`}>1 number (0-9)</span>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="relative pt-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <input 
                    type={showConfirm ? 'text' : 'password'} 
                    required 
                    placeholder="••••••••••••"
                    value={passwordData.confirmPassword} 
                    onChange={e => setPasswordData(p => ({...p, confirmPassword: e.target.value}))} 
                    className="w-full bg-slate-50 border border-slate-150 rounded-xl py-3 px-4 pr-12 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500/20 transition shadow-inner"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 transition cursor-pointer"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })}
                  className="border border-slate-200 hover:bg-slate-50 text-slate-750 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-blue-100 transition cursor-pointer disabled:bg-blue-400"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="h-4 w-4" />
                  )}
                  Update Password
                </button>
              </div>

            </form>
          </div>

          {/* RIGHT COLUMN: Info Cards */}
          <div className="space-y-6">
            
            {/* Card 1: Profile Summary */}
            <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs space-y-5">
              <h3 className="text-sm font-black text-slate-800 tracking-tight">Profile Summary</h3>
              
              {loading ? (
                <div className="flex items-center gap-4 py-3">
                  <div className="h-12 w-12 animate-pulse bg-slate-100 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-24 bg-slate-100 animate-pulse rounded" />
                    <div className="h-3 w-16 bg-slate-100 animate-pulse rounded" />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="h-12 w-12 rounded-full bg-violet-100 text-violet-700 font-black text-sm flex items-center justify-center uppercase select-none">
                        {profile ? `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}` : 'U'}
                      </div>
                      <button type="button" className="absolute bottom-0 right-0 p-1 bg-white border border-slate-200 rounded-full shadow-xs hover:bg-slate-50 transition cursor-pointer" title="Update photo">
                        <Camera className="h-3 w-3 text-slate-500" />
                      </button>
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-800 tracking-tight">{profile ? `${profile.first_name} ${profile.last_name}` : 'User Name'}</h4>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">{profile ? profile.employee_number : 'EMP-xxxxx'}</p>
                    </div>
                  </div>

                  <div className="space-y-3.5 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-400">Department</span>
                      <span className="text-slate-800">{profile ? profile.department_name : '—'}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-400">Designation</span>
                      <span className="text-slate-800">{profile ? profile.job_title : '—'}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-400">Email</span>
                      <span className="text-slate-800 truncate max-w-[180px]">{profile ? profile.email_work : '—'}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-400">Phone</span>
                      <span className="text-slate-800">{profile ? (profile.phone_work || profile.phone_personal || '—') : '—'}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Card 2: Security Overview */}
            <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-800 tracking-tight">Security Overview</h3>
              <div className="flex items-center gap-3 bg-emerald-50/20 border border-emerald-100/30 rounded-2xl p-3.5">
                <div className="h-10 w-10 shrink-0 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-800">Your account is secure</h4>
                  <p className="text-[10px] font-semibold text-slate-450 mt-0.5">Last password change: 15 May 2026</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowLoginActivity(true)}
                className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
              >
                View Login Activity
              </button>
            </div>

            {/* Card 3: Quick Links */}
            <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-800 tracking-tight">Quick Links</h3>
              <div className="divide-y divide-slate-100">
                <button 
                  onClick={() => navigate('/my-profile')}
                  className="w-full flex items-center justify-between py-3 hover:bg-slate-50 transition text-left cursor-pointer"
                >
                  <span className="flex items-center gap-2.5 text-xs font-bold text-slate-750">
                    <User className="h-4 w-4 text-slate-400" />
                    My Profile
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-350" />
                </button>
                <button 
                  onClick={() => navigate('/my-documents')}
                  className="w-full flex items-center justify-between py-3 hover:bg-slate-50 transition text-left cursor-pointer"
                >
                  <span className="flex items-center gap-2.5 text-xs font-bold text-slate-750">
                    <FileText className="h-4 w-4 text-slate-400" />
                    My Documents
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-350" />
                </button>
                <button 
                  onClick={() => navigate('/my-help-desk')}
                  className="w-full flex items-center justify-between py-3 hover:bg-slate-50 transition text-left cursor-pointer"
                >
                  <span className="flex items-center gap-2.5 text-xs font-bold text-slate-750">
                    <HelpCircle className="h-4 w-4 text-slate-400" />
                    Help Desk
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-350" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Bottom Danger Alert banner */}
      {alertOpen && (
        <div className="mx-6 mb-6 shrink-0 bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between text-xs font-bold text-emerald-800 shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Never share your password with anyone.
          </div>
          <button onClick={() => setAlertOpen(false)} className="p-1 hover:bg-emerald-100/50 rounded-lg text-emerald-600 transition cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Login Activity Modal */}
      {showLoginActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl shadow-2xl p-6 relative">
            <button 
              onClick={() => setShowLoginActivity(false)}
              className="absolute right-4 top-4 p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            
            <h2 className="text-xl font-black text-slate-900 tracking-tight mb-2">Login Activity & Sessions</h2>
            <p className="text-xs text-slate-500 font-medium mb-6">Monitor your active sessions and login history to keep your account secure.</p>

            {/* Top Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              
              {/* Card 1: Last Login */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <LogIn className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Last Login</span>
                </div>
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  05 Jun 2026<br />
                  <span className="text-[10px] text-slate-500 font-semibold mt-0.5 inline-block">09:02 AM</span>
                </div>
              </div>

              {/* Card 2: Total Logins */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <Activity className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Total Logins</span>
                </div>
                <div className="text-2xl font-black text-slate-900 leading-none">
                  22
                  <span className="text-[10px] text-slate-500 font-semibold block mt-1">This Month</span>
                </div>
              </div>

              {/* Card 3: Current Session */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Globe className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Current Session</span>
                </div>
                <div className="space-y-1">
                  <span className="inline-flex px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Active
                  </span>
                  <span className="text-[9px] text-slate-500 font-semibold block">New Delhi, IN</span>
                </div>
              </div>

              {/* Card 4: Last Logout */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <LogOut className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Last Logout</span>
                </div>
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  04 Jun 2026<br />
                  <span className="text-[10px] text-slate-500 font-semibold mt-0.5 inline-block">06:15 PM</span>
                </div>
              </div>

            </div>

            {/* Recent Logins Log Table */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Recent Login History</h3>
              <div className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto max-h-48 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
                        <th className="px-4 py-3">Date & Time</th>
                        <th className="px-4 py-3">Device & Browser</th>
                        <th className="px-4 py-3">IP Address</th>
                        <th className="px-4 py-3">Location</th>
                        <th className="px-4 py-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-xs font-bold text-slate-700">
                      {[
                        { date: '06 Jun 2026, 10:45 AM', device: 'Chrome / Windows', ip: '192.168.1.12', loc: 'Delhi, IN', status: 'Success' },
                        { date: '05 Jun 2026, 09:02 AM', device: 'Firefox / Windows', ip: '192.168.1.12', loc: 'Delhi, IN', status: 'Success' },
                        { date: '04 Jun 2026, 02:30 PM', device: 'Chrome / Android', ip: '103.88.22.45', loc: 'Delhi, IN', status: 'Success' },
                        { date: '03 Jun 2026, 09:15 AM', device: 'Chrome / Windows', ip: '192.168.1.12', loc: 'Delhi, IN', status: 'Success' },
                      ].map((log, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-bold text-slate-800">{log.date}</td>
                          <td className="px-4 py-3 text-slate-650 flex items-center gap-1.5 py-3.5">
                            {log.device.includes('Android') ? (
                              <Smartphone className="h-3.5 w-3.5 text-slate-400" />
                            ) : (
                              <Laptop className="h-3.5 w-3.5 text-slate-400" />
                            )}
                            {log.device}
                          </td>
                          <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">{log.ip}</td>
                          <td className="px-4 py-3 text-slate-650">{log.loc}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex px-2 py-0.5 rounded-lg text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100/50">
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer close button */}
            <div className="flex justify-end pt-4 mt-6 border-t border-slate-50">
              <button 
                type="button" 
                onClick={() => setShowLoginActivity(false)}
                className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg transition cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
