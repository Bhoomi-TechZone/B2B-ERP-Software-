import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { CheckCircle2, Clock, AlertCircle, RefreshCw } from 'lucide-react'
import SuperAdminTopBar from '../../components/TopBar'
import superAdminService from '../../../services/superAdminService'

export default function OnboardingManagementPage() {
  const [stats, setStats] = useState({})
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [statsData, tenantsData] = await Promise.all([
        superAdminService.getOnboardingStats(),
        superAdminService.getOnboardingTenants()
      ])
      setStats(statsData || {})
      setTenants(Array.isArray(tenantsData) ? tenantsData : [])
    } catch (error) {
      console.error('Failed to fetch onboarding data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f0f5ff]">
      <SuperAdminTopBar />
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Onboarding Management</h1>
            <p className="text-sm text-slate-500 mt-1">Monitor tenant onboarding progress</p>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 border border-[#dce9ff] bg-white rounded-lg hover:bg-[#f0f5ff] transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl border border-[#dce9ff] p-6">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium text-slate-600">In Progress</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.pending_onboarding || 0}</p>
          </div>
          <div className="bg-white rounded-xl border border-[#dce9ff] p-6">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-slate-600">Completed</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.completed_onboarding || 0}</p>
          </div>
          <div className="bg-white rounded-xl border border-[#dce9ff] p-6">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium text-slate-600">Total</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.total_onboarding || 0}</p>
          </div>
          <div className="bg-white rounded-xl border border-[#dce9ff] p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-5 w-5 bg-purple-500 rounded-full"></div>
              <span className="text-sm font-medium text-slate-600">Success Rate</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.completion_rate || 0}%</p>
          </div>
        </div>

        {/* Placeholder Content */}
        <div className="bg-white rounded-xl border border-[#dce9ff] p-8 text-center">
          <div className="max-w-md mx-auto">
            <CheckCircle2 className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Onboarding Management</h3>
            <p className="text-slate-500 mb-4">
              This page will show detailed onboarding progress, step-by-step tracking, and management tools for tenant onboarding processes.
            </p>
            <div className="text-sm text-slate-400">
              Features coming soon:
              <ul className="mt-2 space-y-1">
                <li>• Step-by-step onboarding tracking</li>
                <li>• Automated onboarding workflows</li>
                <li>• Progress analytics and reporting</li>
                <li>• Custom onboarding templates</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}