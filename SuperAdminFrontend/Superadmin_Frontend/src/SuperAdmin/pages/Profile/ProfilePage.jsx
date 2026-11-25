import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  ArrowLeft, Mail, Phone, MapPin, Calendar, Shield, Clock, CheckCircle, AlertCircle,
  Loader2, Edit2, Save, X,
} from 'lucide-react'
import SuperAdminTopBar from '../../components/TopBar'
import superAdminService from '../../../services/superAdminService'

export default function ProfilePage() {
  const navigate = useNavigate()
  const [profileData, setProfileData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Edit form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    timezone: '',
    locale: '',
  })

  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true)
      setError(null)

      try {
        console.log('🔄 Fetching user profile')
        const data = await superAdminService.getUserProfile()

        if (!data) {
          setError('No profile data available')
          return
        }

        console.log('✅ Profile data received:', data)
        setProfileData(data)

        // Initialize form data
        if (data.user) {
          setFormData({
            first_name: data.user.first_name || '',
            last_name: data.user.last_name || '',
            phone: data.user.phone || '',
            timezone: data.user.timezone || '',
            locale: data.user.locale || '',
          })
        }
      } catch (err) {
        console.error('❌ Failed to fetch profile:', err)
        setError(err?.message || 'Failed to load profile')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)

    try {
      console.log('🔄 Saving profile changes:', formData)
      const result = await superAdminService.updateUserProfile(formData)
      
      console.log('✅ Profile updated successfully:', result)
      
      // Update the profile data with new values
      setProfileData(prev => ({
        ...prev,
        user: {
          ...prev.user,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          timezone: formData.timezone,
          locale: formData.locale,
          display_name: `${formData.first_name} ${formData.last_name}`.trim(),
        }
      }))
      
      setIsEditing(false)
      alert('Profile updated successfully!')
    } catch (err) {
      console.error('❌ Failed to save profile:', err)
      alert('Failed to save profile: ' + (err?.message || 'Unknown error'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Reset form to original data
    if (profileData?.user) {
      setFormData({
        first_name: profileData.user.first_name || '',
        last_name: profileData.user.last_name || '',
        phone: profileData.user.phone || '',
        timezone: profileData.user.timezone || '',
        locale: profileData.user.locale || '',
      })
    }
  }

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target
    setPasswordForm(prev => ({
      ...prev,
      [name]: value,
    }))
    setPasswordError(null)
  }

  const handleForgotPassword = async () => {
    if (!profileData?.user?.email) return

    setIsChangingPassword(true)
    setPasswordError(null)

    try {
      console.log('🔄 Requesting password reset')
      const result = await superAdminService.forgotPassword(profileData.user.email)

      console.log('✅ Password reset email sent:', result)
      setPasswordSuccess(true)
      setShowPasswordModal(false)
      alert('Password reset email has been sent to your email address!')
    } catch (err) {
      console.error('❌ Failed to send password reset email:', err)
      setPasswordError(err?.message || 'Failed to send password reset email')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleChangePassword = async () => {
    // Validation
    if (!passwordForm.currentPassword) {
      setPasswordError('Current password is required')
      return
    }

    if (!passwordForm.newPassword) {
      setPasswordError('New password is required')
      return
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }

    setIsChangingPassword(true)
    setPasswordError(null)

    try {
      console.log('🔄 Changing password')
      const result = await superAdminService.changePassword(passwordForm.currentPassword, passwordForm.newPassword)
      
      console.log('✅ Password changed successfully')
      setPasswordSuccess(true)
      setShowPasswordModal(false)
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      alert('Password changed successfully!')
    } catch (err) {
      console.error('❌ Failed to change password:', err)
      setPasswordError(err?.message || 'Failed to change password')
    } finally {
      setIsChangingPassword(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f0f5ff]">
        <SuperAdminTopBar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-10 w-10 text-[#1251C5] animate-spin" />
        </div>
      </div>
    )
  }

  if (error || !profileData) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f0f5ff]">
        <SuperAdminTopBar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <p className="text-lg font-bold text-slate-900">{error || 'Profile not found'}</p>
          <button
            onClick={() => navigate('/super-admin')}
            className="text-[#1251C5] font-bold hover:underline"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const user = profileData.user
  const tenant = profileData.tenant

  return (
    <div className="flex min-h-screen flex-col bg-[#f0f5ff]">
      <SuperAdminTopBar />

      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/super-admin')}
                className="flex items-center justify-center h-10 w-10 rounded-lg border border-[#dce9ff] hover:bg-[#f0f5ff] transition"
              >
                <ArrowLeft className="h-5 w-5 text-slate-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
                <p className="text-sm text-slate-500 mt-1">Manage your account settings</p>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1251C5] text-white font-semibold hover:bg-[#0d3a9e] transition"
              >
                <Edit2 className="h-4 w-4" />
                Edit Profile
              </button>
            )}
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Profile Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-white border border-[#dce9ff] p-6"
              >
                <h2 className="text-lg font-bold text-slate-900 mb-4">Personal Information</h2>

                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">First Name</label>
                        <input
                          type="text"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleInputChange}
                          disabled={isSaving}
                          className="w-full px-4 py-2 rounded-lg border border-[#dce9ff] focus:outline-none focus:border-[#1251C5] focus:ring-2 focus:ring-[#1251C5]/20 disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
                        <input
                          type="text"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleInputChange}
                          disabled={isSaving}
                          className="w-full px-4 py-2 rounded-lg border border-[#dce9ff] focus:outline-none focus:border-[#1251C5] focus:ring-2 focus:ring-[#1251C5]/20 disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full px-4 py-2 rounded-lg border border-[#dce9ff] bg-slate-50 text-slate-500 cursor-not-allowed"
                      />
                      <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={isSaving}
                        className="w-full px-4 py-2 rounded-lg border border-[#dce9ff] focus:outline-none focus:border-[#1251C5] focus:ring-2 focus:ring-[#1251C5]/20 disabled:opacity-50"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Timezone</label>
                        <input
                          type="text"
                          name="timezone"
                          value={formData.timezone}
                          onChange={handleInputChange}
                          disabled={isSaving}
                          className="w-full px-4 py-2 rounded-lg border border-[#dce9ff] focus:outline-none focus:border-[#1251C5] focus:ring-2 focus:ring-[#1251C5]/20 disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Locale</label>
                        <input
                          type="text"
                          name="locale"
                          value={formData.locale}
                          onChange={handleInputChange}
                          disabled={isSaving}
                          className="w-full px-4 py-2 rounded-lg border border-[#dce9ff] focus:outline-none focus:border-[#1251C5] focus:ring-2 focus:ring-[#1251C5]/20 disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleCancel}
                        disabled={isSaving}
                        className="flex-1 px-4 py-2 rounded-lg border border-[#dce9ff] text-slate-600 font-semibold hover:bg-[#f0f5ff] disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-1 px-4 py-2 rounded-lg bg-[#1251C5] text-white font-semibold hover:bg-[#0d3a9e] disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-[#f8faff] rounded-lg">
                      <span className="text-sm text-slate-600">Full Name</span>
                      <span className="text-sm font-semibold text-slate-900">{user.display_name}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[#f8faff] rounded-lg">
                      <span className="text-sm text-slate-600 flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </span>
                      <span className="text-sm font-semibold text-slate-900">{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center justify-between p-3 bg-[#f8faff] rounded-lg">
                        <span className="text-sm text-slate-600 flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Phone
                        </span>
                        <span className="text-sm font-semibold text-slate-900">{user.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between p-3 bg-[#f8faff] rounded-lg">
                      <span className="text-sm text-slate-600 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Timezone
                      </span>
                      <span className="text-sm font-semibold text-slate-900">{user.timezone}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[#f8faff] rounded-lg">
                      <span className="text-sm text-slate-600">Locale</span>
                      <span className="text-sm font-semibold text-slate-900">{user.locale}</span>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Account Security */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl bg-white border border-[#dce9ff] p-6"
              >
                <h2 className="text-lg font-bold text-slate-900 mb-4">Account Security</h2>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-[#f8faff] rounded-lg">
                    <span className="text-sm text-slate-600 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Email Verified
                    </span>
                    <span className={`text-sm font-semibold ${user.email_verified ? 'text-green-600' : 'text-red-600'}`}>
                      {user.email_verified ? '✅ Yes' : '❌ No'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-[#f8faff] rounded-lg">
                    <span className="text-sm text-slate-600 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Two-Factor Authentication
                    </span>
                    <span className={`text-sm font-semibold ${user.mfa_enabled ? 'text-green-600' : 'text-slate-600'}`}>
                      {user.mfa_enabled ? '✅ Enabled' : '❌ Disabled'}
                    </span>
                  </div>

                  {user.last_login_at && (
                    <div className="flex items-center justify-between p-3 bg-[#f8faff] rounded-lg">
                      <span className="text-sm text-slate-600 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Last Login
                      </span>
                      <span className="text-sm font-semibold text-slate-900">
                        {new Date(user.last_login_at).toLocaleDateString()} {new Date(user.last_login_at).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Password Change Buttons */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-[#f0f5ff]">
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="flex-1 px-4 py-2 rounded-lg bg-[#1251C5] text-white text-sm font-semibold hover:bg-[#0d3a9e] transition"
                  >
                    Change Password
                  </button>
                  <button
                    onClick={handleForgotPassword}
                    disabled={isChangingPassword}
                    className="flex-1 px-4 py-2 rounded-lg border border-[#dce9ff] text-slate-600 text-sm font-semibold hover:bg-[#f0f5ff] transition disabled:opacity-50"
                  >
                    Forgot Password
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Tenant & Account Info */}
            <div className="space-y-6">
              {/* Tenant Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl bg-white border border-[#dce9ff] p-6"
              >
                <h2 className="text-lg font-bold text-slate-900 mb-4">Tenant Information</h2>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Tenant Name</p>
                    <p className="text-sm font-bold text-slate-900 mt-1">{tenant.name}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Status</p>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 mt-1">
                      {tenant.status}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Region</p>
                    <p className="text-sm font-bold text-slate-900 mt-1">{tenant.primary_region}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Currency</p>
                    <p className="text-sm font-bold text-slate-900 mt-1">{tenant.primary_currency}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Timezone</p>
                    <p className="text-sm font-bold text-slate-900 mt-1">{tenant.timezone}</p>
                  </div>
                </div>
              </motion.div>

              {/* Account Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl bg-white border border-[#dce9ff] p-6"
              >
                <h2 className="text-lg font-bold text-slate-900 mb-4">Account Details</h2>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">User Type</p>
                    <p className="text-sm font-bold text-slate-900 mt-1">{user.user_type}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Role</p>
                    <p className="text-sm font-bold text-slate-900 mt-1">{user.role}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Status</p>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 mt-1">
                      {user.status}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Member Since</p>
                    <p className="text-sm font-bold text-slate-900 mt-1">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Password Change Modal */}
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => !isChangingPassword && setShowPasswordModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl border border-[#dce9ff] max-w-md w-full p-6"
            >
              <h2 className="text-lg font-bold text-slate-900 mb-4">Change Password</h2>

              {passwordError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{passwordError}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordInputChange}
                    disabled={isChangingPassword}
                    placeholder="Enter your current password"
                    className="w-full px-4 py-2 rounded-lg border border-[#dce9ff] focus:outline-none focus:border-[#1251C5] focus:ring-2 focus:ring-[#1251C5]/20 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordInputChange}
                    disabled={isChangingPassword}
                    placeholder="Enter your new password (min 8 characters)"
                    className="w-full px-4 py-2 rounded-lg border border-[#dce9ff] focus:outline-none focus:border-[#1251C5] focus:ring-2 focus:ring-[#1251C5]/20 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordInputChange}
                    disabled={isChangingPassword}
                    placeholder="Confirm your new password"
                    className="w-full px-4 py-2 rounded-lg border border-[#dce9ff] focus:outline-none focus:border-[#1251C5] focus:ring-2 focus:ring-[#1251C5]/20 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  disabled={isChangingPassword}
                  className="flex-1 px-4 py-2 rounded-lg border border-[#dce9ff] text-slate-600 font-semibold hover:bg-[#f0f5ff] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={isChangingPassword}
                  className="flex-1 px-4 py-2 rounded-lg bg-[#1251C5] text-white font-semibold hover:bg-[#0d3a9e] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    'Change Password'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
