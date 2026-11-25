import { useState, memo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Search, MapPin, Briefcase, Clock, ChevronRight, 
  ArrowRight, Globe, Users, Star, Filter, X
} from 'lucide-react'
import { JOB_POSTINGS } from '../recruitment/data/recruitmentData'

const CareersPage = memo(() => {
  const [search, setSearch] = useState('')
  const [selectedDept, setSelectedDept] = useState('All')
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const depts = ['All', ...new Set(JOB_POSTINGS.map(j => j.title.split(' ')[1] || 'Other'))] // Mock extraction
  
  const filteredJobs = JOB_POSTINGS.filter(j => 
    j.status === 'published' &&
    (search === '' || j.title.toLowerCase().includes(search.toLowerCase())) &&
    (selectedDept === 'All' || j.title.includes(selectedDept))
  )

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* ── Public Navbar ── */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">W</div>
            <span className="text-xl font-black tracking-tight text-slate-800">WorkMatrix<span className="text-blue-600">Careers</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-600">
            <a href="#" className="hover:text-blue-600 transition-colors">Our Culture</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Benefits</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Teams</a>
            <button className="rounded-full bg-slate-900 px-6 py-2.5 text-white hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
              Apply Now
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <header className="relative overflow-hidden bg-slate-900 py-24 text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80')] opacity-10 bg-cover bg-center" />
        <div className="absolute inset-0 bg-linear-to-b from-blue-600/20 to-transparent" />
        
        <div className="relative mx-auto max-w-7xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="mb-4 inline-block rounded-full bg-blue-500/20 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-blue-400">
              Join our mission
            </span>
            <h1 className="mb-6 text-5xl md:text-7xl font-black tracking-tight">
              Build the future of <br />
              <span className="bg-linear-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Enterprise Software</span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-400">
              We're a team of designers, engineers, and dreamers building the most advanced B2B HRMS platform in the world. Come build with us.
            </p>

            {/* Search Bar */}
            <div className="mx-auto max-w-2xl overflow-hidden rounded-3xl bg-white p-2 shadow-2xl ring-8 ring-white/10">
              <div className="flex items-center">
                <Search className="ml-4 h-6 w-6 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search roles, skills, or teams..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full border-0 bg-transparent px-4 py-4 text-slate-900 outline-hidden font-medium placeholder:text-slate-400"
                />
                <button className="hidden sm:block rounded-2xl bg-blue-600 px-8 py-3.5 text-sm font-black text-white hover:bg-blue-700 transition-colors">
                  Find Jobs
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* ── Jobs List ── */}
      <main className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="sticky top-28 space-y-8">
              <div>
                <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Filter className="h-3 w-3" /> Filter by Team
                </h3>
                <div className="flex flex-wrap lg:flex-col gap-2">
                  {depts.map(dept => (
                    <button
                      key={dept}
                      onClick={() => setSelectedDept(dept)}
                      className={`rounded-xl px-4 py-2.5 text-sm font-bold transition-all text-left ${
                        selectedDept === dept 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                          : 'bg-white text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl bg-linear-to-br from-indigo-600 to-blue-700 p-6 text-white shadow-xl shadow-blue-200">
                <Star className="mb-4 h-8 w-8 text-amber-300" />
                <h4 className="mb-2 text-lg font-bold">Don't see a fit?</h4>
                <p className="mb-4 text-xs text-blue-100 leading-relaxed">Send us your CV anyway and we'll let you know when a role opens up.</p>
                <button className="w-full rounded-xl bg-white/20 py-3 text-xs font-black uppercase tracking-widest backdrop-blur-md hover:bg-white/30 transition-colors">
                  General Application
                </button>
              </div>
            </div>
          </aside>

          {/* Job Cards */}
          <section className="flex-1 space-y-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-slate-800">
                Open Positions <span className="text-slate-300 ml-2">{filteredJobs.length}</span>
              </h2>
              <div className="flex items-center gap-2 text-sm text-slate-500 font-bold">
                Sorted by: <span className="text-slate-800">Newest</span>
              </div>
            </div>

            <div className="grid gap-4">
              <AnimatePresence mode='popLayout'>
                {filteredJobs.map((job, i) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                    className="group relative overflow-hidden rounded-[32px] border border-white bg-white p-6 shadow-sm transition-all hover:border-blue-200 hover:shadow-2xl"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="flex-1">
                        <div className="mb-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-blue-600">
                            {job.type}
                          </span>
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-600">
                            New
                          </span>
                        </div>
                        <h3 className="mb-2 text-xl font-black text-slate-800 group-hover:text-blue-600 transition-colors">
                          {job.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-slate-300" /> {job.location}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Briefcase className="h-4 w-4 text-slate-300" /> Engineering
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="hidden sm:block text-right">
                          <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Posted</p>
                          <p className="text-sm font-bold text-slate-600">{job.postedOn}</p>
                        </div>
                        <button className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-all group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-200">
                          <ArrowRight className="h-6 w-6" />
                        </button>
                      </div>
                    </div>

                    {/* Hover Decoration */}
                    <div className="absolute -bottom-1 -right-1 h-24 w-24 rounded-full bg-blue-50/50 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredJobs.length === 0 && (
                <div className="py-20 text-center">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-300">
                    <Search className="h-10 w-10" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">No matching roles found</h3>
                  <p className="text-slate-500 mt-2">Try adjusting your filters or search keywords.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* ── Stats / Benefits ── */}
      <section className="bg-white py-20 border-t border-slate-100">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 md:grid-cols-3">
            {[
              { icon: Globe, title: 'Remote First', desc: 'Work from anywhere in the world. We value output over seat time.' },
              { icon: Users, title: 'Diverse Culture', desc: 'Join a team of 45+ nationalities building for a global audience.' },
              { icon: Clock, title: 'Flexible Hours', desc: 'Life happens. We offer flexible schedules to support your life balance.' },
            ].map((item, i) => (
              <div key={i} className="text-center md:text-left">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <item.icon className="h-6 w-6" />
                </div>
                <h4 className="mb-3 text-lg font-black text-slate-800">{item.title}</h4>
                <p className="text-sm font-medium text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-slate-900 py-12 text-center text-slate-500 border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-sm font-bold mb-4">&copy; 2026 WorkMatrix Inc. All rights reserved.</p>
          <div className="flex items-center justify-center gap-6 text-xs font-black uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Settings</a>
          </div>
        </div>
      </footer>
    </div>
  )
})

CareersPage.displayName = 'CareersPage'
export default CareersPage
