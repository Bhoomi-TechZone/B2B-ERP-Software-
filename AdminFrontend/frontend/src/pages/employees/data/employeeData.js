// ─────────────────────────────────────────────────────────
// Mock Employee Data — Shared across Employee Management UI
// ─────────────────────────────────────────────────────────

export const DEPARTMENTS = ['Engineering', 'Human Resources', 'Sales', 'Finance', 'Marketing', 'Design', 'Operations', 'Legal', 'Product']
export const MANAGERS = ['Vikram Nair', 'Priya Singh', 'Rahul Sharma', 'Anjali Verma', 'Suresh Menon', 'Neha Joshi']
export const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Intern', 'Consultant']
export const LOCATIONS = ['Delhi Office', 'Mumbai Office', 'Bangalore Office', 'Hyderabad Office', 'Remote']

const AVATAR_COLORS = [
  'bg-blue-600', 'bg-indigo-600', 'bg-purple-600', 'bg-pink-600',
  'bg-rose-600', 'bg-orange-600', 'bg-teal-600', 'bg-cyan-600',
  'bg-green-600', 'bg-emerald-600'
]

export const employees = [
  {
    id: 'EMP001',
    firstName: 'Rahul', lastName: 'Sharma', fullName: 'Rahul Sharma',
    email: 'rahul.sharma@workmatrix.com', phone: '+91 98765 43210',
    gender: 'Male', avatar: 'RS', avatarColor: AVATAR_COLORS[0],
    department: 'Engineering', role: 'Senior Developer', manager: 'Vikram Nair',
    joinDate: '2024-01-15', employmentType: 'Full-time',
    status: 'Active', location: 'Delhi Office',
    salary: 95000, payType: 'Monthly', bankAccount: '1234567890', ifsc: 'HDFC0001234',
    present: 22, absent: 1, leaves: 3,
    leaveBalance: { casual: 8, earned: 12, sick: 5, maternity: 0 },
    documents: [
      { name: 'Offer Letter', type: 'PDF', size: '245 KB', date: '2024-01-10' },
      { name: 'Aadhar Card', type: 'PDF', size: '1.2 MB', date: '2024-01-10' },
      { name: 'PAN Card', type: 'PDF', size: '380 KB', date: '2024-01-10' },
      { name: 'Degree Certificate', type: 'PDF', size: '2.1 MB', date: '2024-01-10' },
    ],
    notes: [
      { id: 1, author: 'Priya Singh', text: 'Excellent performance in Q1. Recommended for promotion review.', date: '2026-03-15', type: 'performance' },
      { id: 2, author: 'Vikram Nair', text: 'Completed AWS certification. Reimbursement processed.', date: '2026-02-20', type: 'achievement' },
    ],
    payslips: [
      { month: 'March 2026', gross: 95000, deductions: 9750, net: 85250, status: 'Paid' },
      { month: 'February 2026', gross: 95000, deductions: 9750, net: 85250, status: 'Paid' },
      { month: 'January 2026', gross: 95000, deductions: 9750, net: 85250, status: 'Paid' },
    ],
    leaveHistory: [
      { id: 1, type: 'Casual Leave', from: '2026-03-10', to: '2026-03-11', days: 2, reason: 'Personal work', status: 'Approved' },
      { id: 2, type: 'Sick Leave', from: '2026-02-05', to: '2026-02-06', days: 2, reason: 'Fever', status: 'Approved' },
    ],
  },
  {
    id: 'EMP002',
    firstName: 'Priya', lastName: 'Singh', fullName: 'Priya Singh',
    email: 'priya.singh@workmatrix.com', phone: '+91 88776 65544',
    gender: 'Female', avatar: 'PS', avatarColor: AVATAR_COLORS[3],
    department: 'HR', role: 'HR Manager', manager: 'Anjali Verma',
    joinDate: '2023-06-10', employmentType: 'Full-time',
    status: 'Active', location: 'Mumbai Office',
    salary: 75000, payType: 'Monthly', bankAccount: '9876543210', ifsc: 'ICIC0002345',
    present: 23, absent: 0, leaves: 3,
    leaveBalance: { casual: 10, earned: 15, sick: 7, maternity: 84 },
    documents: [
      { name: 'Offer Letter', type: 'PDF', size: '245 KB', date: '2023-06-05' },
      { name: 'Aadhar Card', type: 'PDF', size: '1.1 MB', date: '2023-06-05' },
      { name: 'PAN Card', type: 'PDF', size: '360 KB', date: '2023-06-05' },
    ],
    notes: [
      { id: 1, author: 'Anjali Verma', text: 'Led successful campus recruitment drive. Hired 28 interns.', date: '2026-03-01', type: 'achievement' },
    ],
    payslips: [
      { month: 'March 2026', gross: 75000, deductions: 7650, net: 67350, status: 'Paid' },
      { month: 'February 2026', gross: 75000, deductions: 7650, net: 67350, status: 'Paid' },
    ],
    leaveHistory: [
      { id: 1, type: 'Earned Leave', from: '2026-01-26', to: '2026-01-28', days: 3, reason: 'Family function', status: 'Approved' },
    ],
  },
  {
    id: 'EMP003',
    firstName: 'Amit', lastName: 'Kumar', fullName: 'Amit Kumar',
    email: 'amit.kumar@workmatrix.com', phone: '+91 77665 54433',
    gender: 'Male', avatar: 'AK', avatarColor: AVATAR_COLORS[5],
    department: 'Sales', role: 'Sales Executive', manager: 'Suresh Menon',
    joinDate: '2026-02-01', employmentType: 'Full-time',
    status: 'Probation', location: 'Bangalore Office',
    salary: 45000, payType: 'Monthly', bankAccount: '5678901234', ifsc: 'AXIS0003456',
    present: 19, absent: 3, leaves: 4,
    leaveBalance: { casual: 2, earned: 0, sick: 3, maternity: 0 },
    documents: [
      { name: 'Offer Letter', type: 'PDF', size: '245 KB', date: '2026-01-25' },
      { name: 'Aadhar Card', type: 'PDF', size: '1.0 MB', date: '2026-01-25' },
    ],
    notes: [],
    payslips: [
      { month: 'March 2026', gross: 45000, deductions: 4500, net: 40500, status: 'Paid' },
    ],
    leaveHistory: [],
  },
  {
    id: 'EMP004',
    firstName: 'Neha', lastName: 'Joshi', fullName: 'Neha Joshi',
    email: 'neha.joshi@workmatrix.com', phone: '+91 99887 76655',
    gender: 'Female', avatar: 'NJ', avatarColor: AVATAR_COLORS[4],
    department: 'Finance', role: 'Finance Manager', manager: 'Anjali Verma',
    joinDate: '2022-09-01', employmentType: 'Full-time',
    status: 'Active', location: 'Delhi Office',
    salary: 88000, payType: 'Monthly', bankAccount: '4321098765', ifsc: 'SBI00045678',
    present: 21, absent: 2, leaves: 3,
    leaveBalance: { casual: 6, earned: 18, sick: 4, maternity: 0 },
    documents: [
      { name: 'Offer Letter', type: 'PDF', size: '245 KB', date: '2022-08-20' },
      { name: 'CA Certificate', type: 'PDF', size: '3.2 MB', date: '2022-08-20' },
      { name: 'PAN Card', type: 'PDF', size: '360 KB', date: '2022-08-20' },
    ],
    notes: [
      { id: 1, author: 'Anjali Verma', text: 'Completed FY2026 audit with zero discrepancies. Outstanding work.', date: '2026-04-05', type: 'performance' },
    ],
    payslips: [
      { month: 'March 2026', gross: 88000, deductions: 9240, net: 78760, status: 'Paid' },
      { month: 'February 2026', gross: 88000, deductions: 9240, net: 78760, status: 'Paid' },
    ],
    leaveHistory: [
      { id: 1, type: 'Casual Leave', from: '2026-03-21', to: '2026-03-21', days: 1, reason: 'Medical appointment', status: 'Approved' },
    ],
  },
  {
    id: 'EMP005',
    firstName: 'Vikram', lastName: 'Nair', fullName: 'Vikram Nair',
    email: 'vikram.nair@workmatrix.com', phone: '+91 76543 21098',
    gender: 'Male', avatar: 'VN', avatarColor: AVATAR_COLORS[8],
    department: 'Engineering', role: 'VP Engineering', manager: 'Anjali Verma',
    joinDate: '2021-04-01', employmentType: 'Full-time',
    status: 'Active', location: 'Bangalore Office',
    salary: 180000, payType: 'Monthly', bankAccount: '7890123456', ifsc: 'KOTAK006789',
    present: 22, absent: 0, leaves: 4,
    leaveBalance: { casual: 10, earned: 22, sick: 8, maternity: 0 },
    documents: [
      { name: 'Offer Letter', type: 'PDF', size: '320 KB', date: '2021-03-20' },
      { name: 'ESOP Agreement', type: 'PDF', size: '1.8 MB', date: '2021-03-20' },
      { name: 'NDA', type: 'PDF', size: '420 KB', date: '2021-03-20' },
    ],
    notes: [
      { id: 1, author: 'Anjali Verma', text: 'Promoted to VP Engineering effective Q1 2025. Salary revised accordingly.', date: '2025-01-01', type: 'promotion' },
    ],
    payslips: [
      { month: 'March 2026', gross: 180000, deductions: 21600, net: 158400, status: 'Paid' },
      { month: 'February 2026', gross: 180000, deductions: 21600, net: 158400, status: 'Paid' },
    ],
    leaveHistory: [],
  },
  {
    id: 'EMP006',
    firstName: 'Anjali', lastName: 'Verma', fullName: 'Anjali Verma',
    email: 'anjali.verma@workmatrix.com', phone: '+91 89900 12233',
    gender: 'Female', avatar: 'AV', avatarColor: AVATAR_COLORS[2],
    department: 'HR', role: 'HR Executive', manager: 'Priya Singh',
    joinDate: '2024-07-01', employmentType: 'Full-time',
    status: 'Active', location: 'Mumbai Office',
    salary: 40000, payType: 'Monthly', bankAccount: '3456789012', ifsc: 'HDFC0007890',
    present: 20, absent: 3, leaves: 3,
    leaveBalance: { casual: 7, earned: 5, sick: 6, maternity: 0 },
    documents: [
      { name: 'Offer Letter', type: 'PDF', size: '245 KB', date: '2024-06-25' },
      { name: 'Degree Certificate', type: 'PDF', size: '1.5 MB', date: '2024-06-25' },
    ],
    notes: [],
    payslips: [
      { month: 'March 2026', gross: 40000, deductions: 3800, net: 36200, status: 'Paid' },
    ],
    leaveHistory: [
      { id: 1, type: 'Sick Leave', from: '2026-03-03', to: '2026-03-04', days: 2, reason: 'Viral fever', status: 'Approved' },
    ],
  },
  {
    id: 'EMP007',
    firstName: 'Suresh', lastName: 'Menon', fullName: 'Suresh Menon',
    email: 'suresh.menon@workmatrix.com', phone: '+91 91234 56789',
    gender: 'Male', avatar: 'SM', avatarColor: AVATAR_COLORS[7],
    department: 'Sales', role: 'Sales Manager', manager: 'Vikram Nair',
    joinDate: '2023-01-10', employmentType: 'Full-time',
    status: 'Active', location: 'Hyderabad Office',
    salary: 70000, payType: 'Monthly', bankAccount: '6789012345', ifsc: 'ICIC0008901',
    present: 21, absent: 2, leaves: 3,
    leaveBalance: { casual: 9, earned: 14, sick: 5, maternity: 0 },
    documents: [
      { name: 'Offer Letter', type: 'PDF', size: '245 KB', date: '2023-01-05' },
      { name: 'Previous Experience Letter', type: 'PDF', size: '560 KB', date: '2023-01-05' },
    ],
    notes: [
      { id: 1, author: 'Vikram Nair', text: 'Exceeded Q4 target by 132%. Bonus processed.', date: '2026-01-10', type: 'achievement' },
    ],
    payslips: [
      { month: 'March 2026', gross: 70000, deductions: 7000, net: 63000, status: 'Paid' },
    ],
    leaveHistory: [],
  },
  {
    id: 'EMP008',
    firstName: 'Kavita', lastName: 'Rao', fullName: 'Kavita Rao',
    email: 'kavita.rao@workmatrix.com', phone: '+91 86754 32109',
    gender: 'Female', avatar: 'KR', avatarColor: AVATAR_COLORS[9],
    department: 'Design', role: 'UI/UX Designer', manager: 'Vikram Nair',
    joinDate: '2024-03-15', employmentType: 'Full-time',
    status: 'Active', location: 'Remote',
    salary: 65000, payType: 'Monthly', bankAccount: '2345678901', ifsc: 'AXIS0009012',
    present: 22, absent: 1, leaves: 3,
    leaveBalance: { casual: 8, earned: 10, sick: 7, maternity: 0 },
    documents: [
      { name: 'Offer Letter', type: 'PDF', size: '245 KB', date: '2024-03-10' },
      { name: 'Portfolio Agreement', type: 'PDF', size: '890 KB', date: '2024-03-10' },
    ],
    notes: [],
    payslips: [
      { month: 'March 2026', gross: 65000, deductions: 6500, net: 58500, status: 'Paid' },
    ],
    leaveHistory: [],
  },
  {
    id: 'EMP009',
    firstName: 'Deepak', lastName: 'Mishra', fullName: 'Deepak Mishra',
    email: 'deepak.mishra@workmatrix.com', phone: '+91 73456 78901',
    gender: 'Male', avatar: 'DM', avatarColor: AVATAR_COLORS[6],
    department: 'Marketing', role: 'Marketing Head', manager: 'Anjali Verma',
    joinDate: '2022-11-01', employmentType: 'Full-time',
    status: 'Inactive', location: 'Delhi Office',
    salary: 0, payType: 'Monthly', bankAccount: '8901234567', ifsc: 'SBI00090123',
    present: 0, absent: 26, leaves: 0,
    leaveBalance: { casual: 0, earned: 0, sick: 0, maternity: 0 },
    documents: [
      { name: 'Resignation Letter', type: 'PDF', size: '180 KB', date: '2026-02-28' },
      { name: 'Exit Interview', type: 'PDF', size: '320 KB', date: '2026-03-31' },
    ],
    notes: [
      { id: 1, author: 'Priya Singh', text: 'Employee resigned on 28 Feb 2026. Last working day: 31 March 2026. Exit formalities completed.', date: '2026-03-31', type: 'exit' },
    ],
    payslips: [],
    leaveHistory: [],
  },
  {
    id: 'EMP010',
    firstName: 'Riya', lastName: 'Patel', fullName: 'Riya Patel',
    email: 'riya.patel@workmatrix.com', phone: '+91 84567 89012',
    gender: 'Female', avatar: 'RP', avatarColor: AVATAR_COLORS[1],
    department: 'Legal', role: 'Legal Counsel', manager: 'Anjali Verma',
    joinDate: '2025-08-01', employmentType: 'Contract',
    status: 'Active', location: 'Mumbai Office',
    salary: 55000, payType: 'Monthly', bankAccount: '0123456789', ifsc: 'KOTAK0010123',
    present: 21, absent: 1, leaves: 4,
    leaveBalance: { casual: 4, earned: 6, sick: 3, maternity: 0 },
    documents: [
      { name: 'Contract Agreement', type: 'PDF', size: '1.2 MB', date: '2025-07-25' },
      { name: 'Bar Council Certificate', type: 'PDF', size: '640 KB', date: '2025-07-25' },
    ],
    notes: [],
    payslips: [
      { month: 'March 2026', gross: 55000, deductions: 5500, net: 49500, status: 'Paid' },
    ],
    leaveHistory: [],
  },
]

export const exitEmployees = [
  {
    id: 'EXIT001', employeeId: 'EMP009',
    name: 'Deepak Mishra', department: 'Marketing',
    role: 'Marketing Head', avatar: 'DM', avatarColor: 'bg-teal-600',
    exitDate: '2026-03-31', noticePeriod: '30 days',
    reason: 'Personal — Better opportunity', status: 'Completed',
    initiatedBy: 'Priya Singh', initiatedOn: '2026-02-28',
    assetsReturned: true, fnfProcessed: true, accessRevoked: true,
  },
  {
    id: 'EXIT002', employeeId: 'EMP011',
    name: 'Arjun Das', department: 'Operations',
    role: 'Operations Lead', avatar: 'AD', avatarColor: 'bg-orange-600',
    exitDate: '2026-05-15', noticePeriod: '45 days',
    reason: 'Resignation — Relocation', status: 'Notice Period',
    initiatedBy: 'Priya Singh', initiatedOn: '2026-04-01',
    assetsReturned: false, fnfProcessed: false, accessRevoked: false,
  },
  {
    id: 'EXIT003', employeeId: 'EMP012',
    name: 'Sneha Kapoor', department: 'Sales',
    role: 'Sales Executive', avatar: 'SK', avatarColor: 'bg-pink-600',
    exitDate: '2026-04-30', noticePeriod: '30 days',
    reason: 'Termination — Performance', status: 'Notice Period',
    initiatedBy: 'Vikram Nair', initiatedOn: '2026-04-01',
    assetsReturned: false, fnfProcessed: false, accessRevoked: true,
  },
]

export const getStatusColor = (status) => {
  const normStatus = (status || '').toLowerCase();
  switch (normStatus) {
    case 'active': return 'bg-green-100 text-green-700'
    case 'inactive':
    case 'terminated':
      return 'bg-slate-100 text-slate-600'
    case 'probation': return 'bg-amber-100 text-amber-700'
    case 'notice period': return 'bg-orange-100 text-orange-700'
    case 'pending start':
    case 'pending_start':
      return 'bg-blue-100 text-blue-700'
    default:
      // Fallback to exact match checks if status is already title-case
      if (status === 'Active') return 'bg-green-100 text-green-700'
      if (status === 'Inactive') return 'bg-slate-100 text-slate-600'
      if (status === 'Probation') return 'bg-amber-100 text-amber-700'
      if (status === 'Notice Period') return 'bg-orange-100 text-orange-700'
      if (status === 'Pending Start') return 'bg-blue-100 text-blue-700'
      return 'bg-slate-100 text-slate-600'
  }
}
