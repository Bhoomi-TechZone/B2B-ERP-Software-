export const DEPARTMENTS = ['All Departments', 'Engineering', 'HR', 'Sales', 'Finance', 'Marketing', 'Operations']

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

// ── Daily Attendance ──────────────────────────────────────────────────────────
export const dailyEmployees = [
  { id: 'EMP001', name: 'Rahul Sharma',  department: 'Engineering', avatar: 'RS', avatarColor: 'bg-blue-500',   checkIn: '09:05 AM', checkOut: '06:30 PM', totalHours: '9h 25m', status: 'Present', overtime: false, late: false },
  { id: 'EMP002', name: 'Priya Patel',   department: 'HR',          avatar: 'PP', avatarColor: 'bg-violet-500', checkIn: '09:45 AM', checkOut: '06:00 PM', totalHours: '8h 15m', status: 'Late',    overtime: false, late: true  },
  { id: 'EMP003', name: 'Amit Kumar',    department: 'Sales',       avatar: 'AK', avatarColor: 'bg-green-500',  checkIn: '—',        checkOut: '—',        totalHours: '—',      status: 'Absent',  overtime: false, late: false },
  { id: 'EMP004', name: 'Sneha Tiwari',  department: 'Finance',     avatar: 'ST', avatarColor: 'bg-pink-500',   checkIn: '08:55 AM', checkOut: '08:10 PM', totalHours: '11h 15m',status: 'Present', overtime: true,  late: false },
  { id: 'EMP005', name: 'Vikram Singh',  department: 'Engineering', avatar: 'VS', avatarColor: 'bg-amber-500',  checkIn: '09:00 AM', checkOut: '06:00 PM', totalHours: '9h 00m', status: 'Present', overtime: false, late: false },
  { id: 'EMP006', name: 'Neha Gupta',    department: 'Marketing',   avatar: 'NG', avatarColor: 'bg-teal-500',   checkIn: '—',        checkOut: '—',        totalHours: '—',      status: 'Leave',   overtime: false, late: false },
  { id: 'EMP007', name: 'Arjun Mehta',   department: 'Operations',  avatar: 'AM', avatarColor: 'bg-indigo-500', checkIn: '10:15 AM', checkOut: '07:00 PM', totalHours: '8h 45m', status: 'Late',    overtime: false, late: true  },
  { id: 'EMP008', name: 'Kavita Rao',    department: 'HR',          avatar: 'KR', avatarColor: 'bg-rose-500',   checkIn: '09:02 AM', checkOut: '06:05 PM', totalHours: '9h 03m', status: 'Present', overtime: false, late: false },
  { id: 'EMP009', name: 'Suresh Nair',   department: 'Finance',     avatar: 'SN', avatarColor: 'bg-orange-500', checkIn: '08:50 AM', checkOut: '09:20 PM', totalHours: '12h 30m',status: 'Present', overtime: true,  late: false },
  { id: 'EMP010', name: 'Divya Sharma',  department: 'Sales',       avatar: 'DS', avatarColor: 'bg-cyan-500',   checkIn: '—',        checkOut: '—',        totalHours: '—',      status: 'Absent',  overtime: false, late: false },
  { id: 'EMP011', name: 'Rohan Verma',   department: 'Engineering', avatar: 'RV', avatarColor: 'bg-sky-500',    checkIn: '09:10 AM', checkOut: '06:15 PM', totalHours: '9h 05m', status: 'Present', overtime: false, late: false },
  { id: 'EMP012', name: 'Ananya Singh',  department: 'Marketing',   avatar: 'AS', avatarColor: 'bg-fuchsia-500',checkIn: '09:30 AM', checkOut: '05:45 PM', totalHours: '8h 15m', status: 'Present', overtime: false, late: false },
]

// ── Monthly Calendar Employees ────────────────────────────────────────────────
export const monthlyEmployees = [
  { id: 'EMP001', name: 'Rahul Sharma',  department: 'Engineering', avatar: 'RS', avatarColor: 'bg-blue-500'    },
  { id: 'EMP002', name: 'Priya Patel',   department: 'HR',          avatar: 'PP', avatarColor: 'bg-violet-500'  },
  { id: 'EMP003', name: 'Amit Kumar',    department: 'Sales',       avatar: 'AK', avatarColor: 'bg-green-500'   },
  { id: 'EMP004', name: 'Sneha Tiwari',  department: 'Finance',     avatar: 'ST', avatarColor: 'bg-pink-500'    },
  { id: 'EMP005', name: 'Vikram Singh',  department: 'Engineering', avatar: 'VS', avatarColor: 'bg-amber-500'   },
  { id: 'EMP006', name: 'Neha Gupta',    department: 'Marketing',   avatar: 'NG', avatarColor: 'bg-teal-500'    },
  { id: 'EMP007', name: 'Arjun Mehta',   department: 'Operations',  avatar: 'AM', avatarColor: 'bg-indigo-500'  },
  { id: 'EMP008', name: 'Kavita Rao',    department: 'HR',          avatar: 'KR', avatarColor: 'bg-rose-500'    },
]

// Month-specific patterns: absents and leaves by day number
const PATTERNS = {
  EMP001: { absents: [4, 16],           leaves: [10, 26]       },
  EMP002: { absents: [5, 9, 18, 24],    leaves: [1, 13, 29]    },
  EMP003: { absents: [2, 8, 15, 22, 28],leaves: [6, 20]        },
  EMP004: { absents: [3, 17],           leaves: [11, 25]       },
  EMP005: { absents: [7, 19],           leaves: [14]           },
  EMP006: { absents: [4, 12, 21],       leaves: [8, 22, 28]    },
  EMP007: { absents: [6, 20],           leaves: [3, 17, 27]    },
  EMP008: { absents: [9, 23],           leaves: [5, 19]        },
}

/**
 * Returns { [day]: 'P' | 'A' | 'L' | 'WO' } for a given year/month/employee
 */
export const generateMonthData = (year, month, employeeId) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const pattern = PATTERNS[employeeId] || { absents: [], leaves: [] }
  const data = {}
  for (let d = 1; d <= daysInMonth; d++) {
    const dow = new Date(year, month, d).getDay()
    if (dow === 0 || dow === 6)       data[d] = 'WO'
    else if (pattern.leaves.includes(d))  data[d] = 'L'
    else if (pattern.absents.includes(d)) data[d] = 'A'
    else                              data[d] = 'P'
  }
  return data
}

// ── Geo-Location Logs ─────────────────────────────────────────────────────────
export const geoLogs = [
  { id: 1, employee: 'Rahul Sharma', action: 'Clock In',  time: '09:05 AM', location: 'Office — Block A',   status: 'inside'  },
  { id: 2, employee: 'Priya Patel',  action: 'Clock In',  time: '09:45 AM', location: 'Sector 18, Noida',   status: 'outside' },
  { id: 3, employee: 'Sneha Tiwari', action: 'Clock Out', time: '08:10 PM', location: 'Office — Block A',   status: 'inside'  },
  { id: 4, employee: 'Vikram Singh', action: 'Clock In',  time: '09:00 AM', location: 'Office — Block B',   status: 'inside'  },
  { id: 5, employee: 'Arjun Mehta',  action: 'Clock In',  time: '10:15 AM', location: 'Connaught Place, Delhi', status: 'outside' },
  { id: 6, employee: 'Kavita Rao',   action: 'Clock Out', time: '06:05 PM', location: 'Office — Block A',   status: 'inside'  },
]

// ── Requests ──────────────────────────────────────────────────────────────────
export const requestsData = [
  { id: 1, employee: 'Rahul Sharma',  avatar: 'RS', avatarColor: 'bg-blue-500',    department: 'Engineering', date: '2026-04-15', type: 'Regularisation',      reason: 'Forgot to clock in – worked from office',       requestedIn: '09:00 AM', requestedOut: '06:00 PM', status: 'Pending'  },
  { id: 2, employee: 'Priya Patel',   avatar: 'PP', avatarColor: 'bg-violet-500',  department: 'HR',          date: '2026-04-12', type: 'Regularisation',      reason: 'System glitch, biometric not captured',         requestedIn: '09:30 AM', requestedOut: '05:30 PM', status: 'Approved' },
  { id: 3, employee: 'Arjun Mehta',   avatar: 'AM', avatarColor: 'bg-indigo-500',  department: 'Operations',  date: '2026-04-10', type: 'Late Mark Removal',   reason: 'Metro delay – proof attached',                  requestedIn: '09:20 AM', requestedOut: '06:00 PM', status: 'Rejected' },
  { id: 4, employee: 'Kavita Rao',    avatar: 'KR', avatarColor: 'bg-rose-500',    department: 'HR',          date: '2026-04-18', type: 'Regularisation',      reason: 'Work from client site, forgot to mark attendance',requestedIn: '09:00 AM', requestedOut: '05:00 PM', status: 'Pending'  },
  { id: 5, employee: 'Suresh Nair',   avatar: 'SN', avatarColor: 'bg-orange-500',  department: 'Finance',     date: '2026-04-17', type: 'Overtime Claim',      reason: 'Quarter-end financial closing',                  requestedIn: '09:00 AM', requestedOut: '10:00 PM', status: 'Pending'  },
  { id: 6, employee: 'Divya Sharma',  avatar: 'DS', avatarColor: 'bg-cyan-500',    department: 'Sales',       date: '2026-04-14', type: 'Regularisation',      reason: 'Client visit – no office check-in',              requestedIn: '10:00 AM', requestedOut: '07:00 PM', status: 'Approved' },
  { id: 7, employee: 'Vikram Singh',  avatar: 'VS', avatarColor: 'bg-amber-500',   department: 'Engineering', date: '2026-04-09', type: 'Late Mark Removal',   reason: 'Vehicle breakdown, rescheduled cab',             requestedIn: '09:45 AM', requestedOut: '06:30 PM', status: 'Pending'  },
  { id: 8, employee: 'Neha Gupta',    avatar: 'NG', avatarColor: 'bg-teal-500',    department: 'Marketing',   date: '2026-04-08', type: 'Regularisation',      reason: 'Power outage in office – biometric offline',     requestedIn: '09:00 AM', requestedOut: '05:30 PM', status: 'Approved' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────
export const getStatusColor = (status) => {
  switch (status) {
    case 'Present':  return 'bg-green-100 text-green-700 border border-green-200'
    case 'Absent':   return 'bg-red-100 text-red-700 border border-red-200'
    case 'Late':     return 'bg-amber-100 text-amber-700 border border-amber-200'
    case 'Leave':    return 'bg-blue-100 text-blue-700 border border-blue-200'
    case 'Pending':  return 'bg-amber-100 text-amber-700 border border-amber-200'
    case 'Approved': return 'bg-green-100 text-green-700 border border-green-200'
    case 'Rejected': return 'bg-red-100 text-red-700 border border-red-200'
    default:         return 'bg-slate-100 text-slate-600 border border-slate-200'
  }
}

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
