import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Users, ArrowRight, X, Briefcase, Clock, Tag,
  TrendingUp, Zap, Target, CheckCircle2, Award,
  Columns,
} from 'lucide-react'
import { PIPELINE_STAGES, PIPELINE_CARDS } from '../data/recruitmentData'
import { StatusBadge, Avatar } from './shared'
import recruitmentService from '../../../services/recruitmentService'

const STAGE_BG = {
  slate:   { light: 'bg-slate-50',   text: 'text-slate-700',   border: 'border-slate-200', ring: 'ring-slate-200'  },
  blue:    { light: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',  ring: 'ring-blue-200'   },
  violet:  { light: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-200',ring: 'ring-violet-200' },
  amber:   { light: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200', ring: 'ring-amber-200'  },
  emerald: { light: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', ring: 'ring-emerald-200' },
  green:   { light: 'bg-green-50',   text: 'text-green-700',   border: 'border-green-200', ring: 'ring-green-200'  },
}

const SOURCE_CHIP = {
  LinkedIn: 'bg-blue-50 text-blue-600',
  Website:  'bg-violet-50 text-violet-600',
  Agency:   'bg-amber-50 text-amber-600',
  Referral: 'bg-emerald-50 text-emerald-600',
  Naukri:   'bg-orange-50 text-orange-600',
}

// ── Pipeline Card ─────────────────────────────────────────────────────────────
const PipelineCard = ({ card, onDragStart, onDragEnd, onClick, stageColor }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.18 }}
      draggable
      onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; onDragStart(card) }}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className="group cursor-grab rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs transition hover:border-blue-300 hover:shadow-md active:cursor-grabbing"
    >
      {/* Name + Avatar */}
      <div className="mb-2.5 flex items-center gap-2.5">
        <Avatar initials={card.avatar || card.name?.slice(0, 2).toUpperCase()} color={card.avatarColor || card.avatar_color || 'bg-blue-600'} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-bold text-slate-900">{card.name}</div>
          <div className="truncate text-[11px] text-slate-400">{card.role || card.applied_for || 'Software Engineer'}</div>
        </div>
      </div>

      {/* Details */}
      <div className="mb-2.5 flex items-center gap-2 text-[11px] text-slate-500">
        <Clock className="h-3 w-3 shrink-0 text-slate-300" />
        {card.experience || '2+ yrs'}
        <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold ${SOURCE_CHIP[card.source] || 'bg-slate-50 text-slate-500'}`}>
          {card.source || 'Website'}
        </span>
      </div>

      {/* Applied date */}
      <div className="text-[10px] text-slate-400">Applied {card.appliedOn || 'Recently'}</div>
    </motion.div>
  )
}

// ── Card Detail Drawer ────────────────────────────────────────────────────────
const CardDetailDrawer = ({ card, currentStage, stages, onClose, onMove }) => {
  if (!card) return null
  const stage = stages.find(s => s.id === currentStage)

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]" />
      <motion.div
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        className="fixed right-0 top-0 z-50 flex h-full w-80 flex-col border-l border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <Avatar initials={card.avatar || card.name?.slice(0, 2).toUpperCase()} color={card.avatarColor || card.avatar_color || 'bg-blue-600'} size="lg" />
            <div>
              <div className="font-bold text-slate-900">{card.name}</div>
              <div className="text-xs text-slate-500">{card.role || card.applied_for}</div>
            </div>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Current Stage */}
          {stage && (
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">Current Stage</div>
              <StatusBadge status={stage.id} />
            </div>
          )}
          {/* Details */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Experience', value: card.experience || '2+ yrs' },
              { label: 'Source',     value: card.source || 'Website'     },
              { label: 'Applied',    value: card.appliedOn || 'Recent'  },
              { label: 'App ID',     value: card.candidate_id || card.id },
            ].map(r => (
              <div key={r.label} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
                <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{r.label}</div>
                <div className="text-xs font-semibold text-slate-800 mt-0.5">{r.value}</div>
              </div>
            ))}
          </div>

          {/* Move to Stage */}
          <div>
            <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Move to Stage</div>
            <div className="space-y-1.5">
              {stages.filter(s => s.id !== currentStage).map(s => (
                <motion.button key={s.id}
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  onClick={() => { onMove(card, currentStage, s.id); onClose() }}
                  className="flex w-full items-center gap-2 rounded-xl border border-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer">
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400" />{s.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}

// ── Main Application Pipeline Page ───────────────────────────────────────────
export default function ApplicationPipelinePage() {
  const [boards, setBoards]       = useState(PIPELINE_CARDS)
  const [dragging, setDragging]   = useState(null)
  const [overStage, setOverStage] = useState(null)
  const [selected, setSelected]   = useState(null)
  const [selectedStage, setSelStg]= useState(null)

  // Load real candidates and distribute into stages
  useEffect(() => {
    async function fetchLivePipeline() {
      try {
        const liveCandidates = await recruitmentService.getCandidates()
        if (Array.isArray(liveCandidates) && liveCandidates.length > 0) {
          const newBoards = {
            applied: [],
            screening: [],
            shortlisted: [],
            interview: [],
            offer: [],
            hired: [],
          }
          liveCandidates.forEach(c => {
            const st = (c.status || 'applied').toLowerCase()
            const cardObj = {
              id: c.id,
              candidate_id: c.candidate_id,
              name: c.name,
              role: c.applied_for || 'Software Engineer',
              experience: c.experience,
              source: c.source,
              appliedOn: c.created_at ? new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Today',
              avatar: c.avatar || c.name?.slice(0, 2).toUpperCase(),
              avatarColor: c.avatarColor || c.avatar_color || 'bg-blue-600',
              status: st
            }
            if (newBoards[st]) {
              newBoards[st].push(cardObj)
            } else {
              newBoards.applied.push(cardObj)
            }
          })
          setBoards(newBoards)
        }
      } catch (err) {
        console.warn('Using fallback pipeline cards:', err)
      }
    }
    fetchLivePipeline()
  }, [])

  const allCards = Object.values(boards).flat()
  const total    = allCards.length

  const handleDragStart = useCallback((card, fromStage) => setDragging({ card, fromStage }), [])
  const handleDragEnd   = useCallback(() => { setDragging(null); setOverStage(null) }, [])

  const handleDragOver = useCallback((e, stageId) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setOverStage(stageId)
  }, [])

  const handleDrop = useCallback(async (e, toId) => {
    e.preventDefault()
    if (!dragging || dragging.fromStage === toId) return
    const cardToMove = dragging.card
    setBoards(prev => ({
      ...prev,
      [dragging.fromStage]: (prev[dragging.fromStage] || []).filter(c => c.id !== cardToMove.id),
      [toId]: [...(prev[toId] || []), { ...cardToMove, status: toId }],
    }))
    setDragging(null)
    setOverStage(null)

    try {
      await recruitmentService.updateCandidateStage(cardToMove.id, toId)
    } catch (err) {
      console.warn('Backend stage update error:', err)
    }
  }, [dragging])

  const handleMove = useCallback(async (card, fromStage, toStage) => {
    setBoards(prev => ({
      ...prev,
      [fromStage]: (prev[fromStage] || []).filter(c => c.id !== card.id),
      [toStage]:   [...(prev[toStage] || []), { ...card, status: toStage }],
    }))
    try {
      await recruitmentService.updateCandidateStage(card.id, toStage)
    } catch (err) {
      console.warn('Backend stage update error:', err)
    }
  }, [])

  const handleCardClick = useCallback((card, stageId) => {
    setSelected(card)
    setSelStg(stageId)
  }, [])

  return (
    <div className="flex h-full flex-col overflow-hidden">

      {/* ── Header ── */}
      <div className="shrink-0 border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-slate-900">Application Pipeline</h2>
            <p className="text-xs text-slate-500">Live Kanban board · Drag cards to transition candidate stages</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {total} Total Applicants
            </span>
          </div>
        </div>
      </div>

      {/* ── Board ── */}
      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-4 items-start" style={{ minWidth: `${PIPELINE_STAGES.length * 280}px` }}>
          {PIPELINE_STAGES.map(stage => {
            const cards = boards[stage.id] || []
            const isOver = overStage === stage.id
            const colors = STAGE_BG[stage.color] || STAGE_BG.slate

            return (
              <div
                key={stage.id}
                onDragOver={e => handleDragOver(e, stage.id)}
                onDrop={e => handleDrop(e, stage.id)}
                className={`flex w-72 shrink-0 flex-col rounded-2xl border transition-all ${
                  isOver
                    ? 'border-blue-400 bg-blue-50/50 shadow-md ring-2 ring-blue-200'
                    : 'border-slate-200 bg-slate-50/60'
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between p-4 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800">{stage.label}</span>
                    <span className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold ${colors.light} ${colors.text}`}>
                      {cards.length}
                    </span>
                  </div>
                </div>

                {/* Card List */}
                <div className="flex flex-col gap-2.5 p-3 pt-0 min-h-32">
                  <AnimatePresence>
                    {cards.map(card => (
                      <PipelineCard
                        key={card.id}
                        card={card}
                        stageColor={stage.color}
                        onDragStart={c => handleDragStart(c, stage.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => handleCardClick(card, stage.id)}
                      />
                    ))}
                  </AnimatePresence>
                  {cards.length === 0 && (
                    <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
                      Drop candidate here
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Detail Drawer ── */}
      <AnimatePresence>
        {selected && (
          <CardDetailDrawer
            card={selected}
            currentStage={selectedStage}
            stages={PIPELINE_STAGES}
            onClose={() => setSelected(null)}
            onMove={handleMove}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
