import apiClient from "../../../services/apiClient";
import { API_BASE_URL } from "../../../config/api";

// ── Static Definitions ─────────────────────────────────────────────────────────
export const LEAVE_TYPES = [
  { id: 'CL',  label: 'Casual Leave' },
  { id: 'SL',  label: 'Sick Leave' },
  { id: 'EL',  label: 'Earned Leave' },
  { id: 'ML',  label: 'Maternity Leave' },
  { id: 'PL',  label: 'Paternity Leave' },
  { id: 'LWP', label: 'Leave Without Pay' },
  { id: 'CO',  label: 'Compensatory Off' },
];

const SEED_BALANCES = [
  { id: 'B1', empId: 'EMP001', name: 'Aarav Mehta', avatar: 'AM', avatarColor: 'bg-blue-500', department: 'Engineering', leaveType: 'CL', total: 12, used: 3, remaining: 9 },
  { id: 'B2', empId: 'EMP001', name: 'Aarav Mehta', avatar: 'AM', avatarColor: 'bg-blue-500', department: 'Engineering', leaveType: 'SL', total: 10, used: 2, remaining: 8 },
  { id: 'B3', empId: 'EMP001', name: 'Aarav Mehta', avatar: 'AM', avatarColor: 'bg-blue-500', department: 'Engineering', leaveType: 'EL', total: 15, used: 5, remaining: 10 },
  { id: 'B4', empId: 'EMP002', name: 'Ishita Sharma', avatar: 'IS', avatarColor: 'bg-emerald-500', department: 'Product', leaveType: 'CL', total: 12, used: 2, remaining: 10 },
  { id: 'B5', empId: 'EMP002', name: 'Ishita Sharma', avatar: 'IS', avatarColor: 'bg-emerald-500', department: 'Product', leaveType: 'SL', total: 10, used: 1, remaining: 9 },
  { id: 'B6', empId: 'EMP003', name: 'Rohan Gupta', avatar: 'RG', avatarColor: 'bg-violet-500', department: 'Sales', leaveType: 'CL', total: 12, used: 4, remaining: 8 },
  { id: 'B7', empId: 'EMP003', name: 'Rohan Gupta', avatar: 'RG', avatarColor: 'bg-violet-500', department: 'Sales', leaveType: 'SL', total: 10, used: 3, remaining: 7 },
];

const SEED_REQUESTS = [
  { id: 'REQ101', empId: 'EMP001', name: 'Aarav Mehta', avatar: 'AM', avatarColor: 'bg-blue-500', department: 'Engineering', leaveType: 'CL', from: '2026-06-01', to: '2026-06-02', days: 2, halfDay: false, appliedOn: '2026-05-24', status: 'pending', reason: 'Personal work at home', approvedBy: '' },
  { id: 'REQ102', empId: 'EMP002', name: 'Ishita Sharma', avatar: 'IS', avatarColor: 'bg-emerald-500', department: 'Product', leaveType: 'SL', from: '2026-05-20', to: '2026-05-20', days: 1, halfDay: false, appliedOn: '2026-05-19', status: 'approved', reason: 'Fever and cold', approvedBy: 'Admin' },
  { id: 'REQ103', empId: 'EMP003', name: 'Rohan Gupta', avatar: 'RG', avatarColor: 'bg-violet-500', department: 'Sales', leaveType: 'CL', from: '2026-05-28', to: '2026-05-28', days: 0.5, halfDay: true, appliedOn: '2026-05-25', status: 'pending', reason: 'Dentist appointment', approvedBy: '' },
];

const SEED_EVENTS = [
  { id: 'E1', type: 'leave', date: '2026-06-01', endDate: '2026-06-02', empName: 'Aarav Mehta', leaveType: 'CL', color: 'blue' },
  { id: 'E2', type: 'leave', date: '2026-05-20', endDate: '2026-05-20', empName: 'Ishita Sharma', leaveType: 'SL', color: 'red' },
  { id: 'E3', type: 'holiday', date: '2026-05-01', endDate: '2026-05-01', label: 'May Day', color: 'amber' },
  { id: 'E4', type: 'holiday', date: '2026-08-15', endDate: '2026-08-15', label: 'Independence Day', color: 'amber' },
];

// ── LocalStorage Initialization & Synchronization (Robust Array check) ─────────
const getOrInit = (key, seed) => {
  const val = localStorage.getItem(key);
  if (!val) {
    localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  }
  try {
    const parsed = JSON.parse(val);
    if (!parsed || !Array.isArray(parsed)) {
      localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }
    return parsed;
  } catch (e) {
    localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  }
};

// Exported mutable arrays for backward compatibility / direct imports
export const LEAVE_BALANCES = [];
export const LEAVE_REQUESTS = [];
export const CALENDAR_EVENTS = [];

const syncExportedArrays = () => {
  const balances = getOrInit('b2b_hrms_leave_balances_v1', SEED_BALANCES);
  const requests = getOrInit('b2b_hrms_leave_requests_v1', SEED_REQUESTS);
  const events = getOrInit('b2b_hrms_leave_events_v1', SEED_EVENTS);

  LEAVE_BALANCES.length = 0;
  LEAVE_BALANCES.push(...balances);

  LEAVE_REQUESTS.length = 0;
  LEAVE_REQUESTS.push(...requests);

  CALENDAR_EVENTS.length = 0;
  CALENDAR_EVENTS.push(...events);
};

// Trigger initial population
syncExportedArrays();

// ── Dynamic Write Handlers ─────────────────────────────────────────────────────
export const applyLeaveRequest = async (payload) => {
  try {
    const response = await apiClient.post(`${API_BASE_URL}/employee-leave/apply`, payload);
    // apiClient returns parsed JSON directly
    return response;
  } catch (error) {
    console.error('Failed to apply leave request:', error);
    throw error;
  }
};

// ── Fetch User's Leave Balances ──────────────────────────────────────────────
export const getLeaveBalances = async () => {
  try {
    // Calls /api/leave-assignment/my-balance which returns the logged-in
    // employee's leave balance with used_days computed from approved leaves.
    const response = await apiClient.get(`${API_BASE_URL}/leave-assignment/my-balance`);
    console.log('My leave balance response:', response);

    // apiClient returns parsed JSON directly (array of balance objects)
    if (Array.isArray(response)) {
      return response;
    }
    console.warn('Unexpected leave balance response:', response);
    return [];
  } catch (error) {
    console.error('Failed to fetch leave balances:', error);
    throw error;
  }
};

// ── Fetch User's Leave Requests ───────────────────────────────────────────────
export const getMyLeaves = async () => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/employee-leave/my-leaves`);
    console.log('My leaves API response:', response);
    console.log('Response type:', typeof response);
    console.log('Is array?', Array.isArray(response));
    
    // apiClient returns parsed JSON directly, not axios response
    if (Array.isArray(response)) {
      console.log('Response is array with', response.length, 'items');
      return response;
    } else {
      console.warn('Unexpected response structure:', response);
      return Array.isArray(response) ? response : [];
    }
  } catch (error) {
    console.error('Failed to fetch my leaves:', error);
    throw error;
  }
};

export const updateLeaveRequestStatusInStorage = (requestId, status, approvedBy = 'Admin') => {
  const balances = getOrInit('b2b_hrms_leave_balances_v1', SEED_BALANCES);
  const requests = getOrInit('b2b_hrms_leave_requests_v1', SEED_REQUESTS);
  const events = getOrInit('b2b_hrms_leave_events_v1', SEED_EVENTS);

  const reqIndex = requests.findIndex(r => r.id === requestId);
  if (reqIndex !== -1) {
    const oldStatus = requests[reqIndex].status;
    requests[reqIndex].status = status;
    requests[reqIndex].approvedBy = status === 'approved' ? approvedBy : '';

    // If rejected, refund the deducted balance
    if (status === 'rejected' && oldStatus !== 'rejected') {
      const daysCount = requests[reqIndex].days;
      const balIdx = balances.findIndex(b => b.empId === requests[reqIndex].empId && b.leaveType === requests[reqIndex].leaveType);
      if (balIdx !== -1) {
        balances[balIdx].used = Math.max(0, balances[balIdx].used - daysCount);
        balances[balIdx].remaining = balances[balIdx].total - balances[balIdx].used;
      }
    }
    // If re-approved from rejected, re-deduct
    if (status === 'approved' && oldStatus === 'rejected') {
      const daysCount = requests[reqIndex].days;
      const balIdx = balances.findIndex(b => b.empId === requests[reqIndex].empId && b.leaveType === requests[reqIndex].leaveType);
      if (balIdx !== -1) {
        balances[balIdx].used += daysCount;
        balances[balIdx].remaining = Math.max(0, balances[balIdx].total - balances[balIdx].used);
      }
    }
  }

  // Save back to storage
  localStorage.setItem('b2b_hrms_leave_balances_v1', JSON.stringify(balances));
  localStorage.setItem('b2b_hrms_leave_requests_v1', JSON.stringify(requests));
  localStorage.setItem('b2b_hrms_leave_events_v1', JSON.stringify(events));

  // Sync current memory exports
  syncExportedArrays();
};

// ── FastAPI / Beanie API Requests (using authorized apiClient) ──────────────────



// GET all policies
export const getPolicies = async () => {
  return apiClient.get(`${API_BASE_URL}/leave-policy`);
};

// GET single policy
export const getPolicyById = async (policyId) => {
  return apiClient.get(`${API_BASE_URL}/leave-policy/${policyId}`);
};


// CREATE policy
export const createPolicy = async (data) => {
  return apiClient.post(`${API_BASE_URL}/leave-policy`, data);
};

// UPDATE policy
export const updatePolicy = async (policyId, data) => {
  return apiClient.put(`${API_BASE_URL}/leave-policy/${policyId}`, data);
};

// DELETE policy
export const deletePolicy = async (policyId) => {
  return apiClient.delete(`${API_BASE_URL}/leave-policy/${policyId}`);
};