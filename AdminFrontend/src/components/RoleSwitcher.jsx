import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { Shield, Target, Users, BarChart3, User } from 'lucide-react'

import { useAuth } from '../hooks/useAuth'
import { ROLES, ROLE_IDS, getRoleLanding } from '../config/roles'

const ICON_MAP = {
  [ROLE_IDS.SUPER_ADMIN]: Shield,
  [ROLE_IDS.HR]:          Users,
  [ROLE_IDS.MANAGER]:     BarChart3,
  [ROLE_IDS.SALES]:       Target,
  [ROLE_IDS.EMPLOYEE]:    User,
}

const ACCENT_MAP = {
  [ROLE_IDS.SUPER_ADMIN]: { active: 'border-purple-500 bg-purple-50',  icon: 'text-purple-600',  text: 'text-purple-700'  },
  [ROLE_IDS.HR]:          { active: 'border-orange-500 bg-orange-50',  icon: 'text-orange-600',  text: 'text-orange-700'  },
  [ROLE_IDS.MANAGER]:     { active: 'border-emerald-500 bg-emerald-50', icon: 'text-emerald-600', text: 'text-emerald-700' },
  [ROLE_IDS.SALES]:       { active: 'border-blue-500 bg-blue-50',      icon: 'text-blue-600',    text: 'text-blue-700'    },
  [ROLE_IDS.EMPLOYEE]:    { active: 'border-slate-500 bg-slate-50',    icon: 'text-slate-700',   text: 'text-slate-700'   },
}

/**
 * Demo role switcher — production builds usually drive this through
 * real user invitations, not a UI toggle. Embedded in Settings for testing.
 */
const RoleSwitcher = () => {
  const navigate = useNavigate()
  const { role, switchRole } = useAuth()

  const handleSwitch = (rid) => {
    const next = switchRole(rid)
    if (next) navigate(getRoleLanding(next.role))
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="mb-1 text-sm font-bold text-gray-900">Switch User Role (Demo)</h3>
      <p className="mb-4 text-xs text-gray-500">
        Current role: <span className="font-semibold">{ROLES[role]?.label || '—'}</span>
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Object.values(ROLES).map((meta) => {
          const Icon   = ICON_MAP[meta.id]
          const accent = ACCENT_MAP[meta.id]
          const active = role === meta.id
          return (
            <motion.button
              key={meta.id}
              onClick={() => handleSwitch(meta.id)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className={`flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition ${
                active ? accent.active : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <Icon className={`h-6 w-6 ${active ? accent.icon : 'text-gray-400'}`} />
              <span className={`text-xs font-semibold ${active ? accent.text : 'text-gray-600'}`}>
                {meta.short}
              </span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

export default RoleSwitcher
