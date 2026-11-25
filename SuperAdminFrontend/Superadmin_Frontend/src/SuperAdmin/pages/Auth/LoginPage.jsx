import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Eye, EyeOff, Layers, Lock, Mail, AlertCircle } from 'lucide-react'
import { useAuth } from '../../../hooks/useAuth.js'
import { API_ENDPOINTS } from '../../../config/api.js'

export default function SuperAdminLoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  
  const [formData, setFormData] = useState({
    email: 'vikashchaudhary0475@gmail.com',
    password: 'Vikash@20021'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('🔐 Login attempt started...')
      console.log('Form data:', formData)
      
      // Real API call to login endpoint
      const loginPayload = {
        email: formData.email,
        password: formData.password,
        device_fingerprint: 'web-browser-' + Date.now(),
        remember_me: true
      }
      
      console.log('📡 Calling API:', API_ENDPOINTS.AUTH.LOGIN)
      
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(loginPayload)
      })
      
      console.log('📥 API Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ API Error:', errorData)
        throw new Error(errorData.detail || errorData.message || `Login failed (${response.status})`)
      }
      
      const data = await response.json()
      console.log('✅ Login successful:', data)
      
      // Extract tokens from response
      const { access_token, refresh_token, user } = data
      
      if (!access_token) {
        throw new Error('No access token received from server')
      }
      
      // Save tokens to localStorage
      localStorage.setItem('access_token', access_token)
      if (refresh_token) {
        localStorage.setItem('refresh_token', refresh_token)
      }
      
      console.log('💾 Tokens saved to localStorage')
      
      // Login with user data from API response
      const loginResult = login('super_admin', {
        id: user?.id || 'USR001',
        name: user?.name || user?.full_name || 'Super Admin',
        email: user?.email || formData.email,
        department: user?.department || 'Platform',
        token: access_token
      })
      
      console.log('🎯 Login result:', loginResult)
      console.log('🚀 Navigating to /super-admin...')
      
      navigate('/super-admin', { replace: true })
      
    } catch (err) {
      console.error('💥 Login error:', err)
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f5ff] via-white to-[#f0f5ff] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#1251C5] to-[#1a6fe8] shadow-lg">
              <Layers className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Super Admin Portal</h1>
          <p className="text-sm text-slate-500">Sign in to access the admin dashboard</p>
        </div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl border border-[#dce9ff] p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200"
              >
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-700">{error}</span>
              </motion.div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-[#dce9ff] rounded-lg focus:ring-2 focus:ring-[#1251C5] focus:border-transparent outline-none transition-all"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 border border-[#dce9ff] rounded-lg focus:ring-2 focus:ring-[#1251C5] focus:border-transparent outline-none transition-all"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-[#1251C5] to-[#1a6fe8] text-white font-semibold py-3 px-4 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </motion.button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-[#f0f5ff] rounded-lg border border-[#dce9ff]">
            <p className="text-xs font-semibold text-slate-600 mb-2">Demo Credentials:</p>
            <p className="text-xs text-slate-500">Email: vikashchaudhary0475@gmail.com</p>
            <p className="text-xs text-slate-500">Password: Vikash@20021</p>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-slate-400">
            © 2024 WorkMatrix HRMS. All rights reserved.
          </p>
        </div>
      </motion.div>
    </div>
  )
}