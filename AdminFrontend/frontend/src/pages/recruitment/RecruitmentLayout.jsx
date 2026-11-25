import { useState, useEffect, useMemo } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  ClipboardList, Briefcase, Users, Columns,
  CalendarDays, FileText, TrendingUp, Settings
} from 'lucide-react'
import { STATS } from './data/recruitmentData'
import recruitmentService from '../../services/recruitmentService'

export default function RecruitmentLayout() {
  const location = useLocation()
  const [stats, setStats] = useState({
    openRequisitions: STATS.openRequisitions,
    activeJobs: STATS.activeJobs,
    totalCandidates: STATS.totalCandidates,
    scheduledInterviews: STATS.scheduledInterviews,
    offersOut: STATS.offersOut,
    hired: STATS.hired,
  })

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await recruitmentService.getStats()
        if (res && res.total_candidates !== undefined) {
          setStats({
            openRequisitions: 3,
            activeJobs: 3,
            totalCandidates: res.total_candidates,
            scheduledInterviews: res.interviews_count || 0,
            offersOut: res.offers_count || 0,
            hired: res.pipeline?.hired || 0,
          })
        }
      } catch (err) {
        console.warn('Backend recruitment stats unavailable, using fallback:', err)
      }
    }
    loadStats()
  }, [])

  const tabs = useMemo(() => [
    { path: '/recruitment/requisitions', label: 'Requisitions', icon: ClipboardList, count: stats.openRequisitions },
    { path: '/recruitment/jobs',         label: 'Job Postings', icon: Briefcase,    count: stats.activeJobs       },
    { path: '/recruitment/candidates',   label: 'Candidates',   icon: Users,        count: stats.totalCandidates  },
    { path: '/recruitment/applications', label: 'Pipeline',     icon: Columns,      count: null                   },
    { path: '/recruitment/interviews',   label: 'Interviews',   icon: CalendarDays, count: stats.scheduledInterviews },
    { path: '/recruitment/offers',       label: 'Offers',       icon: FileText,     count: stats.offersOut        },
    { path: '/recruitment/hired',        label: 'Hired',        icon: TrendingUp,   count: stats.hired            },
    { path: '/recruitment/sources',      label: 'Sources',      icon: Settings,     count: null                   },
  ], [stats])

  const currentIdx = tabs.findIndex(t => location.pathname.startsWith(t.path))

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#F7F8FA]">

      {/* ── Header + Stats Bar ── */}
      <div className="shrink-0 border-b border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">Recruitment & ATS</h1>
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                Live Dynamic
              </span>
            </div>
            <p className="text-sm text-slate-500">End-to-end applicant tracking — Requisition to Hired</p>
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Open Req', value: stats.openRequisitions, color: 'text-blue-700 bg-blue-50'     },
              { label: 'Live Jobs', value: stats.activeJobs,       color: 'text-indigo-700 bg-indigo-50' },
              { label: 'Candidates', value: stats.totalCandidates, color: 'text-violet-700 bg-violet-50' },
              { label: 'Interviews', value: stats.scheduledInterviews, color: 'text-amber-700 bg-amber-50' },
              { label: 'Hired',    value: stats.hired,             color: 'text-emerald-700 bg-emerald-50'},
            ].map(s => (
              <div key={s.label} className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 ${s.color}`}>
                <span className="text-lg font-bold">{s.value}</span>
                <span className="text-xs font-medium text-slate-500">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex overflow-x-auto border-t border-slate-100 px-6">
          {tabs.map((tab, i) => {
            const Icon = tab.icon
            const active = location.pathname.startsWith(tab.path)
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={`relative flex items-center gap-2 py-3 px-4 text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  active
                    ? 'text-blue-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                {tab.label}
                {tab.count !== null && (
                  <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    active ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {tab.count}
                  </span>
                )}
                {active && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </NavLink>
            )
          })}
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  )
}
