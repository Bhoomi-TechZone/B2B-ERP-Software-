import { memo, useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { CheckCircle2, User, Mail, Calendar, MapPin, Building2, TrendingUp, Users } from 'lucide-react'
import { CANDIDATES } from '../data/recruitmentData'
import recruitmentService from '../../../services/recruitmentService'

const HiredPage = memo(() => {
  const [hiredCandidates, setHiredCandidates] = useState(CANDIDATES.filter(c => c.status === 'hired'))
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchHired() {
      try {
        setLoading(true)
        const res = await recruitmentService.getCandidates({ status: 'hired' })
        if (Array.isArray(res) && res.length > 0) {
          setHiredCandidates(res)
        }
      } catch (err) {
        console.warn('Backend hired candidates unavailable, using fallback:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchHired()
  }, [])

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Hired Candidates</h2>
          <p className="text-sm text-slate-500 mt-1">Successfully onboarded talent and new team members.</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shadow-xs">
          <TrendingUp className="h-5 w-5" />
        </div>
      </div>

      {hiredCandidates.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <Users className="h-10 w-10 text-slate-300 mb-3" />
          <h3 className="font-bold text-slate-700">No hired candidates yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Transition shortlisted candidates to the "Hired" stage in the Application Pipeline to see them appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {hiredCandidates.map((candidate, i) => (
            <motion.div
              key={candidate.id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group relative overflow-hidden rounded-[24px] border border-slate-200 bg-white p-6 shadow-xs transition-all hover:border-emerald-200 hover:shadow-lg"
            >
              <div className="absolute right-4 top-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md shadow-emerald-200">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-sm ${candidate.avatarColor || candidate.avatar_color || 'bg-emerald-600'}`}>
                  {candidate.avatar || candidate.name?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">{candidate.name}</h3>
                  <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mt-0.5">{candidate.applied_for || candidate.role || 'Software Engineer'}</p>
                </div>
              </div>

              <div className="mt-6 space-y-2.5">
                <div className="flex items-center gap-2.5 text-xs text-slate-600 font-medium">
                  <Mail className="h-4 w-4 text-slate-400" /> {candidate.email}
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-600 font-medium">
                  <Building2 className="h-4 w-4 text-slate-400" /> {candidate.department || 'Engineering Department'}
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-600 font-medium">
                  <Calendar className="h-4 w-4 text-slate-400" /> {candidate.joining_date ? `Joined: ${candidate.joining_date}` : 'Recently Onboarded'}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Onboarding Status</span>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">Active Team Member</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
})

export default HiredPage
