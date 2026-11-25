import { useState } from 'react'
import { motion } from 'motion/react'
import { Users, UserPlus, Shield } from 'lucide-react'
import SuperAdminTopBar from '../../components/TopBar'

export default function SuperAdminTeamPage() {
  return (
    <div className="min-h-screen bg-[#f0f5ff]">
      <SuperAdminTopBar />
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Super Admin Team</h1>
            <p className="text-sm text-slate-500 mt-1">Manage platform administrators</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#dce9ff] p-8 text-center">
          <div className="max-w-md mx-auto">
            <Shield className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Team Management</h3>
            <p className="text-slate-500 mb-4">
              Manage super admin team members, roles, and permissions.
            </p>
            <div className="text-sm text-slate-400">
              Features coming soon:
              <ul className="mt-2 space-y-1">
                <li>• Add/remove admin users</li>
                <li>• Role-based permissions</li>
                <li>• Activity logging</li>
                <li>• Team collaboration tools</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}