// ─── UI Display Config Only ───────────────────────────────────────────────────
// All project/task/team DATA is fetched dynamically from the backend API.
// This file contains only static UI styling/config constants used across components.

export const PRIORITY_CONFIG = {
  Critical: { color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-200',    badge: 'bg-red-100 text-red-700'       },
  High:     { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700'  },
  Medium:   { color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-200',  badge: 'bg-amber-100 text-amber-700'   },
  Low:      { color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200',   badge: 'bg-blue-100 text-blue-700'     },
}

export const STATUS_CONFIG = {
  'To Do':       { color: 'text-slate-600',  bg: 'bg-slate-100',  badge: 'bg-slate-100 text-slate-600'    },
  'In Progress': { color: 'text-blue-600',   bg: 'bg-blue-100',   badge: 'bg-blue-100 text-blue-700'      },
  'Review':      { color: 'text-violet-600', bg: 'bg-violet-100', badge: 'bg-violet-100 text-violet-700'  },
  'Done':        { color: 'text-emerald-600',bg: 'bg-emerald-100',badge: 'bg-emerald-100 text-emerald-700'},
}

export const PROJECT_STATUS_CONFIG = {
  Active:    { badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  'On Hold': { badge: 'bg-amber-100 text-amber-700',     dot: 'bg-amber-400'   },
  Completed: { badge: 'bg-blue-100 text-blue-700',       dot: 'bg-blue-500'    },
}

export const HEALTH_CONFIG = {
  'on-track': { label: 'On Track', badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  'at-risk':  { label: 'At Risk',  badge: 'bg-amber-100 text-amber-700',     dot: 'bg-amber-400'   },
  'blocked':  { label: 'Blocked',  badge: 'bg-red-100 text-red-700',         dot: 'bg-red-500'     },
}

// ─── Legacy stubs — kept so existing imports don't break ──────────────────────
// All actual data comes from the backend API via pmService.
export const TEAM_MEMBERS = []
export const PROJECTS      = []
export const TASKS         = []
export const COMMENTS      = {}
export const FILES         = {}
export const ACTIVITY_LOG  = {}
export const CURRENT_USER  = { id: '', name: '', role: '', initials: '', color: '' }

export const getMember         = () => undefined
export const getProject        = () => undefined
export const getTasksByProject = () => []
export const getMyTasks        = () => []
export const getWorkload       = () => []
