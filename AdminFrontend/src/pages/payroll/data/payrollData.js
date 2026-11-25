// ═══════════════════════════════════════════════════════════════
// SHARED UTILITIES
// ═══════════════════════════════════════════════════════════════
export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
export const PAY_CYCLES = ['Monthly', 'Bi-Weekly']

export const formatINR = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

export const formatUSD = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

export const formatGBP = (n) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n)

export const getPayStatusColor = (s) => {
  switch (s) {
    case 'Processed': return 'bg-emerald-100 text-emerald-700'
    case 'Pending':   return 'bg-amber-100  text-amber-700'
    case 'On Hold':   return 'bg-slate-100  text-slate-600'
    case 'Failed':    return 'bg-red-100    text-red-700'
    default:          return 'bg-slate-100  text-slate-500'
  }
}

// ═══════════════════════════════════════════════════════════════
// INDIA PAYROLL DATA (PF 12%, ESI 3.25%, Prof Tax, TDS)
// ═══════════════════════════════════════════════════════════════
const IN_RAW = [
  { id: 'IN001', name: 'Rahul Sharma',  avatar: 'RS', avatarColor: 'bg-blue-500',   dept: 'Engineering', designation: 'Sr. Developer',   basic: 65000,  hra: 26000, allowances: 12000, status: 'Processed' },
  { id: 'IN002', name: 'Priya Patel',   avatar: 'PP', avatarColor: 'bg-violet-500', dept: 'HR',          designation: 'HR Manager',      basic: 55000,  hra: 22000, allowances:  9000, status: 'Processed' },
  { id: 'IN003', name: 'Amit Kumar',    avatar: 'AK', avatarColor: 'bg-green-500',  dept: 'Sales',       designation: 'Sales Executive', basic: 45000,  hra: 18000, allowances:  8500, status: 'Pending'   },
  { id: 'IN004', name: 'Sneha Reddy',   avatar: 'SR', avatarColor: 'bg-pink-500',   dept: 'Marketing',   designation: 'Marketing Lead',  basic: 58000,  hra: 23200, allowances: 10000, status: 'Processed' },
  { id: 'IN005', name: 'Vikram Singh',  avatar: 'VS', avatarColor: 'bg-orange-500', dept: 'Finance',     designation: 'Finance Analyst', basic: 62000,  hra: 24800, allowances: 11000, status: 'On Hold'   },
  { id: 'IN006', name: 'Nisha Gupta',   avatar: 'NG', avatarColor: 'bg-teal-500',   dept: 'Engineering', designation: 'Frontend Dev',    basic: 52000,  hra: 20800, allowances:  9500, status: 'Processed' },
  { id: 'IN007', name: 'Arjun Mehta',   avatar: 'AM', avatarColor: 'bg-indigo-500', dept: 'Operations',  designation: 'Ops Manager',     basic: 70000,  hra: 28000, allowances: 13000, status: 'Processed' },
  { id: 'IN008', name: 'Kavya Thomas',  avatar: 'KT', avatarColor: 'bg-rose-500',   dept: 'Design',      designation: 'UI Designer',     basic: 48000,  hra: 19200, allowances:  8000, status: 'Failed'    },
  { id: 'IN009', name: 'Rohan Joshi',   avatar: 'RJ', avatarColor: 'bg-cyan-500',   dept: 'Engineering', designation: 'Backend Dev',     basic: 68000,  hra: 27200, allowances: 12500, status: 'Processed' },
  { id: 'IN010', name: 'Divya Nair',    avatar: 'DN', avatarColor: 'bg-lime-600',   dept: 'HR',          designation: 'HR Executive',    basic: 42000,  hra: 16800, allowances:  7500, status: 'Pending'   },
  { id: 'IN011', name: 'Suresh Pillai', avatar: 'SP', avatarColor: 'bg-amber-600',  dept: 'Finance',     designation: 'CFO',             basic: 120000, hra: 48000, allowances: 25000, status: 'Processed' },
  { id: 'IN012', name: 'Meera Iyer',    avatar: 'MI', avatarColor: 'bg-purple-500', dept: 'Marketing',   designation: 'Content Writer',  basic: 38000,  hra: 15200, allowances:  6500, status: 'Processed' },
]

// India deduction calculation
const calcINDeductions = (e) => {
  const gross = e.basic + e.hra + e.allowances
  const pf = Math.round(e.basic * 0.12)                        // PF: 12% of basic
  const esi = gross <= 21000 ? Math.round(gross * 0.0325) : 0  // ESI: 3.25% if gross ≤ 21k
  const profTax = gross > 15000 ? 200 : gross > 10000 ? 150 : 0 // Slab-based
  // TDS: simplified slab
  const annual = gross * 12
  let tds = 0
  if (annual > 1500000) tds = Math.round((annual - 1500000) * 0.30 / 12)
  else if (annual > 1200000) tds = Math.round((annual - 1200000) * 0.20 / 12)
  else if (annual > 900000)  tds = Math.round((annual - 900000)  * 0.15 / 12)
  else if (annual > 600000)  tds = Math.round((annual - 600000)  * 0.10 / 12)
  return { pf, esi, profTax, tds, gross }
}

export const inEmployees = IN_RAW.map(e => {
  const { pf, esi, profTax, tds, gross } = calcINDeductions(e)
  const deductions = pf + esi + profTax + tds
  return { ...e, gross, pf, esi, profTax, tds, deductions, netPay: gross - deductions }
})

const IN_PAST_MONTHS = [
  { label: 'March 2026',    payDate: '31 Mar 2026', sfx: 'MAR26' },
  { label: 'February 2026', payDate: '28 Feb 2026', sfx: 'FEB26' },
  { label: 'January 2026',  payDate: '31 Jan 2026', sfx: 'JAN26' },
]
export const inPayslips = IN_PAST_MONTHS.flatMap(m =>
  inEmployees.map(e => ({
    ...e, month: m.label, payDate: m.payDate,
    slipId: `IN-${m.sfx}-${e.id}`,
    status: e.status === 'Failed' && m.sfx === 'MAR26' ? 'Failed' : 'Processed',
  }))
)

// ═══════════════════════════════════════════════════════════════
// US PAYROLL DATA (Federal, State, FICA, Benefits)
// ═══════════════════════════════════════════════════════════════
const US_RAW = [
  { id: 'US001', name: 'James Wilson',   avatar: 'JW', avatarColor: 'bg-blue-500',   dept: 'Engineering', designation: 'Sr. Engineer',    payType: 'Salary',  gross: 9583,  state: 'CA', k401Rate: 0.06, healthIns: 250 },
  { id: 'US002', name: 'Sarah Johnson',  avatar: 'SJ', avatarColor: 'bg-violet-500', dept: 'HR',          designation: 'HR Director',     payType: 'Salary',  gross: 7916,  state: 'NY', k401Rate: 0.05, healthIns: 220 },
  { id: 'US003', name: 'Michael Brown',  avatar: 'MB', avatarColor: 'bg-green-500',  dept: 'Sales',       designation: 'Sales Rep',       payType: 'Hourly',  gross: 6240,  state: 'TX', k401Rate: 0.04, healthIns: 180 },
  { id: 'US004', name: 'Emily Davis',    avatar: 'ED', avatarColor: 'bg-pink-500',   dept: 'Marketing',   designation: 'Marketing Mgr',   payType: 'Salary',  gross: 7083,  state: 'WA', k401Rate: 0.06, healthIns: 230 },
  { id: 'US005', name: 'Robert Garcia',  avatar: 'RG', avatarColor: 'bg-orange-500', dept: 'Finance',     designation: 'Controller',      payType: 'Salary',  gross: 10416, state: 'IL', k401Rate: 0.08, healthIns: 300 },
  { id: 'US006', name: 'Amanda Miller',  avatar: 'AM', avatarColor: 'bg-teal-500',   dept: 'Engineering', designation: 'Frontend Dev',    payType: 'Salary',  gross: 8333,  state: 'CA', k401Rate: 0.05, healthIns: 250 },
  { id: 'US007', name: 'David Martinez', avatar: 'DM', avatarColor: 'bg-indigo-500', dept: 'Operations',  designation: 'Ops Manager',     payType: 'Salary',  gross: 8750,  state: 'FL', k401Rate: 0.06, healthIns: 200 },
  { id: 'US008', name: 'Jennifer Lee',   avatar: 'JL', avatarColor: 'bg-rose-500',   dept: 'Design',      designation: 'UX Designer',     payType: 'Hourly',  gross: 5600,  state: 'OR', k401Rate: 0.04, healthIns: 180 },
  { id: 'US009', name: 'Chris Anderson', avatar: 'CA', avatarColor: 'bg-cyan-500',   dept: 'Engineering', designation: 'Backend Dev',     payType: 'Salary',  gross: 9166,  state: 'TX', k401Rate: 0.07, healthIns: 250 },
  { id: 'US010', name: 'Lisa Thompson',  avatar: 'LT', avatarColor: 'bg-lime-600',   dept: 'HR',          designation: 'HR Specialist',   payType: 'Salary',  gross: 6250,  state: 'NY', k401Rate: 0.05, healthIns: 220 },
]

const US_STATE_TAX = { CA: 0.093, NY: 0.0685, TX: 0, WA: 0, IL: 0.0495, FL: 0, OR: 0.099 }

const calcUSDeductions = (e) => {
  const federalTax = Math.round(e.gross * 0.22)
  const stateTax   = Math.round(e.gross * (US_STATE_TAX[e.state] ?? 0.05))
  const socialSec  = Math.round(e.gross * 0.062)
  const medicare   = Math.round(e.gross * 0.0145)
  const k401       = Math.round(e.gross * e.k401Rate)
  const healthIns  = e.healthIns
  const totalDed   = federalTax + stateTax + socialSec + medicare + k401 + healthIns
  return { federalTax, stateTax, socialSec, medicare, k401, healthIns, totalDed }
}

export const usEmployees = US_RAW.map(e => {
  const { federalTax, stateTax, socialSec, medicare, k401, healthIns, totalDed } = calcUSDeductions(e)
  return { ...e, federalTax, stateTax, socialSec, medicare, k401, healthIns, deductions: totalDed, netPay: e.gross - totalDed, status: 'Processed' }
})

const US_PAST_PERIODS = [
  { label: 'March 2026',    payDate: '31 Mar 2026', sfx: 'MAR26' },
  { label: 'February 2026', payDate: '28 Feb 2026', sfx: 'FEB26' },
  { label: 'January 2026',  payDate: '31 Jan 2026', sfx: 'JAN26' },
]
export const usPayslips = US_PAST_PERIODS.flatMap(m =>
  usEmployees.map(e => ({
    ...e, month: m.label, payDate: m.payDate,
    slipId: `US-${m.sfx}-${e.id}`, status: 'Processed',
  }))
)

// ═══════════════════════════════════════════════════════════════
// UK PAYROLL DATA (PAYE, NI, Pension auto-enrolment)
// ═══════════════════════════════════════════════════════════════
const UK_RAW = [
  { id: 'UK001', name: 'Oliver Smith',   avatar: 'OS', avatarColor: 'bg-blue-500',   dept: 'Engineering', designation: 'Sr. Developer',   gross: 6250, niCode: 'A', pensionRate: 0.05 },
  { id: 'UK002', name: 'Emma Johnson',   avatar: 'EJ', avatarColor: 'bg-violet-500', dept: 'HR',          designation: 'HR Manager',      gross: 5416, niCode: 'A', pensionRate: 0.05 },
  { id: 'UK003', name: 'William Brown',  avatar: 'WB', avatarColor: 'bg-green-500',  dept: 'Sales',       designation: 'Sales Exec',      gross: 4166, niCode: 'A', pensionRate: 0.05 },
  { id: 'UK004', name: 'Sophia Davis',   avatar: 'SD', avatarColor: 'bg-pink-500',   dept: 'Marketing',   designation: 'Marketing Mgr',   gross: 5000, niCode: 'A', pensionRate: 0.05 },
  { id: 'UK005', name: 'James Wilson',   avatar: 'JW', avatarColor: 'bg-orange-500', dept: 'Finance',     designation: 'Finance Director', gross: 8333, niCode: 'A', pensionRate: 0.08 },
  { id: 'UK006', name: 'Charlotte Moore',avatar: 'CM', avatarColor: 'bg-teal-500',   dept: 'Engineering', designation: 'Frontend Dev',    gross: 5750, niCode: 'A', pensionRate: 0.05 },
  { id: 'UK007', name: 'Henry Taylor',   avatar: 'HT', avatarColor: 'bg-indigo-500', dept: 'Operations',  designation: 'Ops Manager',     gross: 6666, niCode: 'A', pensionRate: 0.05 },
  { id: 'UK008', name: 'Amelia Anderson',avatar: 'AA', avatarColor: 'bg-rose-500',   dept: 'Design',      designation: 'UX Designer',     gross: 4583, niCode: 'A', pensionRate: 0.05 },
  { id: 'UK009', name: 'Alexander Thomas',avatar:'AT', avatarColor: 'bg-cyan-500',   dept: 'Engineering', designation: 'Backend Dev',     gross: 6083, niCode: 'A', pensionRate: 0.06 },
  { id: 'UK010', name: 'Mia Jackson',    avatar: 'MJ', avatarColor: 'bg-lime-600',   dept: 'HR',          designation: 'HR Specialist',   gross: 3916, niCode: 'A', pensionRate: 0.05 },
]

// UK PAYE monthly personal allowance threshold: £1047.50/month
const UK_PA_MONTHLY = 1047.5
const calcUKDeductions = (e) => {
  const taxable = Math.max(0, e.gross - UK_PA_MONTHLY)
  // PAYE: 20% basic rate up to £4189/mo, 40% above
  const basicBand = 4189
  let paye = 0
  if (taxable <= basicBand) paye = Math.round(taxable * 0.20)
  else paye = Math.round(basicBand * 0.20 + (taxable - basicBand) * 0.40)

  // NI: 12% between £1048 - £4189/mo, 2% above
  const niLower = 1048, niUpper = 4189
  let ni = 0
  if (e.gross > niLower) {
    const niable = Math.min(e.gross, niUpper) - niLower
    ni = Math.round(niable * 0.12)
    if (e.gross > niUpper) ni += Math.round((e.gross - niUpper) * 0.02)
  }

  // Pension: auto-enrolment
  const pension = Math.round(e.gross * e.pensionRate)
  const totalDed = paye + ni + pension
  return { paye, ni, pension, totalDed }
}

export const ukEmployees = UK_RAW.map(e => {
  const { paye, ni, pension, totalDed } = calcUKDeductions(e)
  return {
    ...e, paye, ni, pension, deductions: totalDed, netPay: e.gross - totalDed,
    status: 'Processed',
  }
})

const UK_PAST_MONTHS = [
  { label: 'March 2026',    payDate: '28 Mar 2026', sfx: 'MAR26' },
  { label: 'February 2026', payDate: '28 Feb 2026', sfx: 'FEB26' },
  { label: 'January 2026',  payDate: '31 Jan 2026', sfx: 'JAN26' },
]
export const ukPayslips = UK_PAST_MONTHS.flatMap(m =>
  ukEmployees.map(e => ({
    ...e, month: m.label, payDate: m.payDate,
    slipId: `UK-${m.sfx}-${e.id}`, status: 'Processed',
  }))
)

// ═══════════════════════════════════════════════════════════════
// SHARED DEPT COLORS
// ═══════════════════════════════════════════════════════════════
export const DEPT_COLORS = {
  Engineering: 'bg-blue-500',
  HR:          'bg-orange-500',
  Sales:       'bg-green-500',
  Marketing:   'bg-pink-500',
  Finance:     'bg-emerald-500',
  Operations:  'bg-indigo-500',
  Design:      'bg-purple-500',
}

export const DEPT_TEXT_COLORS = {
  Engineering: 'text-blue-700',
  HR:          'text-orange-600',
  Sales:       'text-green-700',
  Marketing:   'text-pink-600',
  Finance:     'text-emerald-700',
  Operations:  'text-indigo-700',
  Design:      'text-purple-700',
}

export const getDeptBreakdown = (emps) => {
  const map = {}
  emps.forEach(e => {
    if (!map[e.dept])
      map[e.dept] = { dept: e.dept, netPay: 0, count: 0, color: DEPT_COLORS[e.dept] || 'bg-slate-500' }
    map[e.dept].netPay += e.netPay
    map[e.dept].count  += 1
  })
  return Object.values(map).sort((a, b) => b.netPay - a.netPay)
}

// Legacy aliases (existing pages still import these)
export const payrollEmployees = inEmployees
export const payslips = inPayslips
export const getPayrollSummary = (emps = inEmployees) => ({
  totalNet:        emps.reduce((s, e) => s + e.netPay, 0),
  totalGross:      emps.reduce((s, e) => s + e.gross, 0),
  totalDeductions: emps.reduce((s, e) => s + e.deductions, 0),
  pendingCount:    emps.filter(e => e.status === 'Pending' || e.status === 'On Hold').length,
  processedCount:  emps.filter(e => e.status === 'Processed').length,
  lastRun:         '31 Mar 2026',
  employees:       emps.length,
})
