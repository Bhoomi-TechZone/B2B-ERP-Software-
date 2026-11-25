import { useState, memo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Briefcase, Users, Calendar, FileText, TrendingUp, Clock,
  CheckCircle, AlertCircle, ArrowRight, ChevronLeft, ChevronRight,
  Mail, Phone, Star, Award, Target, Filter, Search
} from 'lucide-react'

import { useAuth } from '../../../hooks/useAuth'

// ─── Mock data ─────────────────────────────────────────────────────────────
const RECRUITMENT_STATS = {
  openPositions: 18,
  activeCandidates: 124,
  interviewsThisWeek: 15,
  offersPending: 6,
  timeToHire: 18,
  avgApplicationsPerRole: 42,
}

const PIPELINE_STAGES = [
  { stage: 'Sourced', count: 45, color: 'bg-slate-400' },
  { stage: 'Applied', count: 32, color: 'bg-blue-400' },
  { stage: 'Screening', count: 28, color: 'bg-violet-400' },
  { stage: 'Interview', count: 15, color: 'bg-amber-400' },
  { stage: 'Offer', count: 8, color: 'bg-emerald-400' },
  { stage: 'Hired', count: 6, color: 'bg-rose-400' },
]

const ACTIVE_JOBS = [
  { id: 1, title: 'Senior React Developer', department: 'Engineering', location: 'Remote', applicants: 45, status: 'active', daysOpen: 12 },
  { id: 2, title: 'Product Manager', department: 'Product', location: 'Mumbai', applicants: 32, status: 'active', daysOpen: 8 },
  { id: 3, title: 'Sales Executive', department: 'Sales', location: 'Delhi', applicants: 28, status: 'active', daysOpen: 5 },
  { id: 4, title: 'UX Designer', department: 'Design', location: 'Bangalore', applicants: 38, status: 'active', daysOpen: 15 },
  { id: 5, title: 'HR Specialist', department: 'HR', location: 'Hyderabad', applicants: 18, status: 'active', daysOpen: 20 },
]

const TOP_CANDIDATES = [
  { id: 1, name: 'Rahul Sharma', role: 'React Developer', experience: '5 years', rating: 4.8, stage: 'interview', initials: 'RS', color: 'bg-blue-500' },
  { id: 2, name: 'Priya Patel', role: 'Product Manager', experience: '7 years', rating: 4.9, stage: 'offer', initials: 'PP', color: 'bg-violet-500' },
  { id: 3, name: 'Amit Kumar', role: 'UX Designer', experience: '4 years', rating: 4.7, stage: 'interview', initials: 'AK', color: 'bg-emerald-500' },
  { id: 4, name: 'Sneha Iyer', role: 'Sales Executive', experience: '3 years', rating: 4.6, stage: 'screening', initials: 'SI', color: 'bg-amber-500' },
]

const UPCOMING_INTERVIEWS = [
  { id: 1, candidate: 'Rahul Sharma', role: 'React Developer', time: '10:00 AM', date: 'Today', type: 'Technical', interviewer: 'Tech Lead' },
  { id: 2, candidate: 'Priya Patel', role: 'Product Manager', time: '2:00 PM', date: 'Today', type: 'Final', interviewer: 'VP Product' },
  { id: 3, candidate: 'Vikram Singh', role: 'Backend Dev', time: '11:00 AM', date: 'Tomorrow', type: 'Technical', interviewer: 'Senior Engineer' },
  { id: 4, candidate: 'Anita Rao', role: 'UX Designer', time: '3:30 PM', date: 'Tomorrow', type: 'Portfolio', interviewer: 'Design Lead' },
]

// ─── Animations ────────────────────────────────────────────────────────────
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }
const fadeUp = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }
const spring = { type: 'spring', stiffness: 380, damping: 26 }

const RecruiterDashboardPage = memo(() => {
  const { user } = useAuth()
  const [candidatePage, setCandidatePage] = useState(0)
  const [interviewPage, setInterviewPage] = useState(0)
  
  const today = new Date()
  const hour = today.getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

  const PER_PAGE = 3
  const totalCandidatePages = Math.ceil(TOP_CANDIDATES.length / PER_PAGE)
  const visibleCandidates = TOP_CANDIDATES.slice(candidatePage * PER_PAGE, candidatePage * PER_PAGE + PER_PAGE)
  
  const totalInterviewPages = Math.ceil(UPCOMING_INTERVIEWS.length / PER_PAGE)
  const visibleInterviews = UPCOMING_INTERVIEWS.slice(interviewPage * PER_PAGE, interviewPage * PER_PAGE + PER_PAGE)

  return (
    <div className="h-full overflow-y-auto bg-slate-50">
      <motion.div className="space-y-5 p-6" variants={stagger} initial="hidden" animate="visible">
        
        {/* ── 1. Greeting Banner ── */}
        <motion.div variants={fadeUp}
          whileHover={{ scale: 1.005, boxShadow: '0 8px 24px -4px rgb(0 0 0 / 0.10)' }}
          transition={spring}
          className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-linear-to-r from-violet-50 via-purple-50 to-pink-50 border border-violet-200 px-6 py-4 shadow-sm cursor-default">
          <div className="flex items-center gap-4">
            <motion.div whileHover={{ rotate: 8, scale: 1.1 }} transition={spring}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-200 text-lg font-bold text-violet-800 ring-2 ring-violet-300">
              R
            </motion.div>
            <div>
              <p className="text-sm text-slate-500">{greeting},</p>
              <p className="text-xl font-bold text-slate-800">Hi {user?.name?.split(' ')[0] || 'Recruiter'} — Talent Acquisition</p>
            </div>
          </div>
          <motion.div whileHover={{ scale: 1.04 }} transition={spring}
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 shadow-sm border border-violet-200">
            <Calendar className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-semibold text-slate-700">
              {RECRUITMENT_STATS.interviewsThisWeek} interviews this week
            </span>
          </motion.div>
          <div className="flex items-center gap-5">
            <motion.div className="text-center" whileHover={{ scale: 1.1 }} transition={spring}>
              <p className="text-xl font-bold text-slate-800">{RECRUITMENT_STATS.openPositions}</p>
              <p className="text-xs text-slate-500">Open Roles</p>
            </motion.div>
            <div className="h-8 w-px bg-slate-300" />
            <motion.div className="text-center" whileHover={{ scale: 1.1 }} transition={spring}>
              <p className="text-xl font-bold text-slate-800">{RECRUITMENT_STATS.offersPending}</p>
              <p className="text-xs text-slate-500">Offers Pending</p>
            </motion.div>
          </div>
        </motion.div>

        {/* ── 2. Summary Stat Cards ── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div variants={fadeUp}
            whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
            transition={spring}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <motion.div whileHover={{ rotate: -10, scale: 1.15 }} transition={spring}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100">
                <Briefcase className="h-5 w-5 text-violet-600" />
              </motion.div>
              <span className="text-sm font-semibold text-slate-600">Open Positions</span>
            </div>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{RECRUITMENT_STATS.openPositions}</p>
            <div className="mt-1 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-[11px] text-slate-500">{ACTIVE_JOBS.filter(j => j.daysOpen < 7).length} new this week</span>
            </div>
          </motion.div>

          <motion.div variants={fadeUp}
            whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
            transition={spring}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <motion.div whileHover={{ rotate: -10, scale: 1.15 }} transition={spring}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100">
                <Users className="h-5 w-5 text-blue-600" />
              </motion.div>
              <span className="text-sm font-semibold text-slate-600">Active Candidates</span>
            </div>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{RECRUITMENT_STATS.activeCandidates}</p>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="text-[11px] text-slate-500">In pipeline</span>
            </div>
          </motion.div>

          <motion.div variants={fadeUp}
            whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
            transition={spring}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <motion.div whileHover={{ rotate: -10, scale: 1.15 }} transition={spring}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100">
                <Clock className="h-5 w-5 text-amber-600" />
              </motion.div>
              <span className="text-sm font-semibold text-slate-600">Time to Hire</span>
            </div>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{RECRUITMENT_STATS.timeToHire} days</p>
            <div className="mt-1 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-[11px] text-emerald-500">2 days faster</span>
            </div>
          </motion.div>

          <motion.div variants={fadeUp}
            whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
            transition={spring}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <motion.div whileHover={{ rotate: -10, scale: 1.15 }} transition={spring}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </motion.div>
              <span className="text-sm font-semibold text-slate-600">Offers Pending</span>
            </div>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{RECRUITMENT_STATS.offersPending}</p>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="text-[11px] text-slate-500">Awaiting response</span>
            </div>
          </motion.div>
        </div>

        {/* ── 3. Pipeline Overview ── */}
        <motion.div variants={fadeUp}
          whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
          transition={spring}
          className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Recruitment Pipeline</h3>
            <motion.button whileHover={{ x: 3 }} transition={spring} className="text-xs font-semibold text-violet-600 hover:underline">
              View all candidates <ArrowRight className="inline h-3 w-3" />
            </motion.button>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {PIPELINE_STAGES.map((stage, i) => (
              <motion.div key={stage.stage}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, ...spring }}
                whileHover={{ y: -4, scale: 1.03 }}
                className="rounded-xl border border-slate-100 p-3 text-center cursor-pointer">
                <p className="text-xs font-semibold text-slate-500">{stage.stage}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{stage.count}</p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: '100%' }}
                    transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
                    className={`h-full ${stage.color}`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── 4. Active Jobs + Top Candidates ── */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Active Jobs */}
          <motion.div variants={fadeUp}
            whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
            transition={spring}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Active Job Postings</h3>
              <motion.button whileHover={{ scale: 1.05 }} transition={spring}
                className="flex items-center gap-1 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700">
                <Briefcase className="h-3.5 w-3.5" /> Post New Job
              </motion.button>
            </div>
            <div className="space-y-3">
              {ACTIVE_JOBS.map((job, i) => (
                <motion.div key={job.id}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i, ...spring }}
                  whileHover={{ x: 4 }}
                  className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 cursor-pointer hover:bg-slate-50">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-800">{job.title}</p>
                    <p className="text-[11px] text-slate-500">{job.department} · {job.location} · {job.daysOpen} days open</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-800">{job.applicants}</p>
                      <p className="text-[10px] text-slate-500">applicants</p>
                    </div>
                    <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">
                      {job.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Top Candidates */}
          <motion.div variants={fadeUp}
            whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
            transition={spring}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Top Candidates</h3>
                <p className="text-xs text-slate-500">High rated prospects</p>
              </div>
              <div className="flex items-center gap-2">
                <motion.button onClick={() => setCandidatePage(p => Math.max(0, p - 1))} disabled={candidatePage === 0}
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} transition={spring}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40">
                  <ChevronLeft className="h-3 w-3" />
                </motion.button>
                <motion.button onClick={() => setCandidatePage(p => Math.min(totalCandidatePages - 1, p + 1))} disabled={candidatePage === totalCandidatePages - 1}
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} transition={spring}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40">
                  <ChevronRight className="h-3 w-3" />
                </motion.button>
              </div>
            </div>
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {visibleCandidates.map((candidate, i) => (
                  <motion.div key={candidate.id} layout
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ delay: 0.05 * i, ...spring }}
                    whileHover={{ x: 4, scale: 1.01 }}
                    className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white ${candidate.color}`}>
                        {candidate.initials}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{candidate.name}</p>
                        <p className="text-[11px] text-slate-500">{candidate.role} · {candidate.experience}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5">
                        <Star className="h-3 w-3 text-amber-600" />
                        <span className="text-[10px] font-bold text-amber-700">{candidate.rating}</span>
                      </div>
                      <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        candidate.stage === 'interview' ? 'bg-blue-100 text-blue-700' :
                        candidate.stage === 'offer' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {candidate.stage}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* ── 5. Upcoming Interviews + Quick Actions ── */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Upcoming Interviews */}
          <motion.div variants={fadeUp}
            whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
            transition={spring}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Upcoming Interviews</h3>
                <p className="text-xs text-slate-500">Schedule for next 2 days</p>
              </div>
              <div className="flex items-center gap-2">
                <motion.button onClick={() => setInterviewPage(p => Math.max(0, p - 1))} disabled={interviewPage === 0}
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} transition={spring}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40">
                  <ChevronLeft className="h-4 w-4" />
                </motion.button>
                <motion.button onClick={() => setInterviewPage(p => Math.min(totalInterviewPages - 1, p + 1))} disabled={interviewPage === totalInterviewPages - 1}
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} transition={spring}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40">
                  <ChevronRight className="h-4 w-4" />
                </motion.button>
              </div>
            </div>
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {visibleInterviews.map((interview, i) => (
                  <motion.div key={interview.id} layout
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ delay: 0.05 * i, ...spring }}
                    whileHover={{ x: 4, scale: 1.01 }}
                    className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100">
                        <Calendar className="h-4 w-4 text-violet-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{interview.candidate}</p>
                        <p className="text-[11px] text-slate-500">{interview.role} · {interview.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-800">{interview.time}</p>
                        <p className="text-[11px] text-slate-500">{interview.date}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="rounded-lg bg-violet-100 p-1.5 hover:bg-violet-200">
                          <Mail className="h-4 w-4 text-violet-600" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={fadeUp}
            whileHover={{ y: -4, boxShadow: '0 12px 28px -4px rgb(0 0 0 / 0.12)' }}
            transition={spring}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Quick Actions</h3>
            <div className="space-y-3">
              {[
                { label: 'Post New Job', icon: Briefcase, tone: 'bg-violet-50 text-violet-700' },
                { label: 'Search Candidates', icon: Search, tone: 'bg-blue-50 text-blue-700' },
                { label: 'Schedule Interview', icon: Calendar, tone: 'bg-emerald-50 text-emerald-700' },
                { label: 'Send Bulk Email', icon: Mail, tone: 'bg-amber-50 text-amber-700' },
              ].map((q, i) => {
                const Icon = q.icon
                return (
                  <motion.button key={q.label} type="button"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05, ...spring }}
                    whileHover={{ y: -3, scale: 1.02 }}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold ${q.tone}`}>
                    <Icon className="h-5 w-5" />
                    {q.label}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        </div>

      </motion.div>
    </div>
  )
})

RecruiterDashboardPage.displayName = 'RecruiterDashboardPage'
export default RecruiterDashboardPage
