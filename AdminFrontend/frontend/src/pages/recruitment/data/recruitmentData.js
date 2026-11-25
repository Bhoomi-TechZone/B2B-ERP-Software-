import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL || "https://b2bbackend.btplsoft.com"}/api`,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "69420",
  },
  timeout: 10000, // 10 second timeout
});

// Token attach karo (agar available ho)
API.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - errors ko clearly handle karo
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ERR_NETWORK" || error.code === "ECONNREFUSED") {
      console.error(`❌ Backend server chal nahi raha (${import.meta.env.VITE_API_BASE_URL || "https://b2bbackend.btplsoft.com"})`);
    } else if (error.response?.status === 401) {
      console.error("❌ Unauthorized - token invalid ya expire ho gaya");
      localStorage.removeItem("access_token");
    } else if (error.response?.status === 403) {
      console.error("❌ Forbidden - permission nahi hai");
    } else {
      console.error("❌ API Error:", error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

// Helper mapping functions to align frontend properties with backend properties
const mapBackendToFrontend = (b) => {
  if (!b) return null;
  return {
    id: b._id ?? b.id ?? '',
    title: b.job_title ?? b.title ?? '',
    department: b.department ?? '',
    hiringManager: b.hiring_manager ?? b.hiringManager ?? '',
    headcount: b.headcount ?? 1,
    priority: (b.priority ?? 'medium').toLowerCase(),
    status: (b.status ?? 'open').toLowerCase(),
    createdAt: b.created_at ? new Date(b.created_at).toLocaleDateString() : (b.createdAt ?? ''),
    budget: b.budget_range ?? b.budget ?? '',
  };
};

const mapFrontendToBackend = (f) => {
  return {
    job_title: f.title,
    department: f.department,
    hiring_manager: f.hiringManager,
    headcount: Number(f.headcount),
    priority: f.priority ? (f.priority.charAt(0).toUpperCase() + f.priority.slice(1)) : 'Medium', // capitalize e.g., 'Medium'
    budget_range: f.budget,
    status: f.status ? (f.status.charAt(0).toUpperCase() + f.status.slice(1)) : 'Open', // capitalize e.g., 'Open'
  };
};

// GET all requisitions
export const getRequisitions = async () => {
  const res = await API.get("/job-requisition/");
  if (res.data) {
    if (Array.isArray(res.data)) {
      res.data = res.data.map(mapBackendToFrontend);
    } else if (Array.isArray(res.data.results)) {
      res.data.results = res.data.results.map(mapBackendToFrontend);
    } else if (Array.isArray(res.data.data)) {
      res.data.data = res.data.data.map(mapBackendToFrontend);
    }
  }
  return res;
};

// CREATE requisition
export const createRequisition = async (data) => {
  const backendData = mapFrontendToBackend(data);
  const res = await API.post("/job-requisition/", backendData);
  if (res.data) {
    if (res.data.data) {
      res.data.data = mapBackendToFrontend(res.data.data);
    } else {
      res.data = mapBackendToFrontend(res.data);
    }
  }
  return res;
};

// UPDATE status — trailing slash fix (some Django backends need it)
export const updateStatus = (id, status) => {
  const backendStatus = status.charAt(0).toUpperCase() + status.slice(1);
  return API.put(`/job-requisition/${id}/`, { status: backendStatus });
};

// ── Mock Data for other pages to prevent crashes ──────────────────────────────

export const STATS = {
  openRequisitions: 12,
  activeJobs: 8,
  totalCandidates: 145,
  scheduledInterviews: 6,
  offersOut: 3,
  hired: 24,
};

export const PIPELINE_STAGES = [
  { id: 'applied',     label: 'Applied',      color: 'slate',   gradient: 'from-slate-500 to-slate-600' },
  { id: 'screening',   label: 'Screening',    color: 'blue',    gradient: 'from-blue-500 to-blue-600' },
  { id: 'shortlisted', label: 'Shortlisted',  color: 'violet',  gradient: 'from-violet-500 to-violet-600' },
  { id: 'interview',   label: 'Interview',    color: 'amber',   gradient: 'from-amber-500 to-amber-600' },
  { id: 'offer',       label: 'Offer',        color: 'emerald', gradient: 'from-emerald-500 to-emerald-600' },
  { id: 'hired',       label: 'Hired',        color: 'green',   gradient: 'from-green-500 to-green-600' },
];

export const PIPELINE_CARDS = {
  applied: [
    { id: 'APP-001', name: 'Aarav Sharma', role: 'React Developer', experience: '3 years', source: 'LinkedIn', appliedOn: '2 days ago', avatar: 'AS', avatarColor: 'bg-blue-500' },
    { id: 'APP-002', name: 'Isha Gupta', role: 'UI Designer', experience: '2 years', source: 'Website', appliedOn: '3 days ago', avatar: 'IG', avatarColor: 'bg-violet-500' }
  ],
  screening: [
    { id: 'APP-003', name: 'Kabir Singh', role: 'Backend Engineer', experience: '5 years', source: 'Referral', appliedOn: '5 days ago', avatar: 'KS', avatarColor: 'bg-emerald-500' }
  ],
  shortlisted: [
    { id: 'APP-004', name: 'Riya Sen', role: 'Product Manager', experience: '4 years', source: 'Indeed', appliedOn: '1 week ago', avatar: 'RS', avatarColor: 'bg-orange-500' }
  ],
  interview: [],
  offer: [],
  hired: []
};

export const CANDIDATES = [
  {
    id: 'CAN-001',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    phone: '+91 98765 43210',
    location: 'Mumbai, IN',
    experience: '3 years',
    skills: ['React', 'JavaScript', 'TailwindCSS'],
    source: 'LinkedIn',
    status: 'applied',
    rating: 4,
    tags: ['Fast Learner', 'Good Comm'],
    avatar: 'AS',
    avatarColor: 'bg-blue-500',
    appliedFor: 'React Developer',
    lastActive: '2 hours ago'
  },
  {
    id: 'CAN-002',
    name: 'Isha Gupta',
    email: 'isha.gupta@example.com',
    phone: '+91 87654 32109',
    location: 'Delhi, IN',
    experience: '2 years',
    skills: ['Figma', 'UI Design', 'Prototyping'],
    source: 'Website',
    status: 'applied',
    rating: 3,
    tags: ['Creative'],
    avatar: 'IG',
    avatarColor: 'bg-violet-500',
    appliedFor: 'UI Designer',
    lastActive: '1 day ago'
  },
  {
    id: 'CAN-003',
    name: 'Kabir Singh',
    email: 'kabir.singh@example.com',
    phone: '+91 76543 21098',
    location: 'Bangalore, IN',
    experience: '5 years',
    skills: ['Node.js', 'Express', 'MongoDB'],
    source: 'Referral',
    status: 'screening',
    rating: 5,
    tags: ['Strong Tech', 'Lead Potential'],
    avatar: 'KS',
    avatarColor: 'bg-emerald-500',
    appliedFor: 'Backend Engineer',
    lastActive: '3 hours ago'
  },
  {
    id: 'CAN-004',
    name: 'Riya Sen',
    email: 'riya.sen@example.com',
    phone: '+91 65432 10987',
    location: 'Remote',
    experience: '4 years',
    skills: ['Product Strategy', 'Agile', 'Roadmapping'],
    source: 'Naukri',
    status: 'hired',
    rating: 4,
    tags: ['Organized'],
    avatar: 'RS',
    avatarColor: 'bg-orange-500',
    appliedFor: 'Product Manager',
    lastActive: '5 days ago'
  }
];

export const JOB_POSTINGS = [
  {
    id: 'JOB-001',
    reqId: 'REQ-001',
    title: 'React Developer',
    location: 'Mumbai / Remote',
    type: 'Full-time',
    status: 'published',
    closingDate: '2026-06-30',
    skills: ['React', 'Redux', 'TailwindCSS'],
    views: 1240,
    applications: 45,
    description: 'We are looking for a Senior React Developer who has experience in building scalable web applications.'
  },
  {
    id: 'JOB-002',
    reqId: 'REQ-002',
    title: 'UI Designer',
    location: 'Delhi',
    type: 'Full-time',
    status: 'published',
    closingDate: '2026-06-15',
    skills: ['Figma', 'Adobe XD', 'Sketch'],
    views: 890,
    applications: 24,
    description: 'Design intuitive interfaces and create high fidelity prototypes for our main products.'
  },
  {
    id: 'JOB-003',
    reqId: 'REQ-003',
    title: 'Backend Engineer',
    location: 'Bangalore',
    type: 'Full-time',
    status: 'draft',
    closingDate: '',
    skills: ['Node.js', 'Express', 'MongoDB'],
    views: 0,
    applications: 0,
    description: 'Build robust REST APIs and design database schemas using NoSQL databases.'
  }
];

export const INTERVIEWS = [
  {
    id: 'INT-001',
    candidate: 'Kabir Singh',
    role: 'Backend Engineer',
    round: 'Technical Round 1',
    interviewer: 'Arjun Mehta',
    interviewerAvatar: 'AM',
    date: '2026-06-01',
    time: '11:00 AM',
    duration: '60 min',
    mode: 'Video Call',
    status: 'scheduled',
    feedback: null,
    avatarColor: 'bg-blue-500'
  },
  {
    id: 'INT-002',
    candidate: 'Riya Sen',
    role: 'Product Manager',
    round: 'HR Round',
    interviewer: 'Neha Roy',
    interviewerAvatar: 'NR',
    date: '2026-05-25',
    time: '03:00 PM',
    duration: '30 min',
    mode: 'Video Call',
    status: 'completed',
    feedback: {
      rating: 4,
      comments: 'Excellent communication and strong grasp on Agile methodologies. Recommended for hire.',
      decision: 'pass'
    },
    avatarColor: 'bg-orange-500'
  }
];

export const OFFERS = [
  {
    id: 'OFR-001',
    candidateId: 'CAN-004',
    candidate: 'Riya Sen',
    role: 'Product Manager',
    avatar: 'RS',
    avatarColor: 'bg-orange-500',
    ctc: '₹16,50,000 LPA',
    joiningDate: '2026-06-15',
    status: 'accepted',
    sentOn: '2026-05-26',
    expiresOn: '2026-06-02',
    hm: 'Neha Roy',
    notice: '30 days',
    breakdown: { basic: 660000, hra: 330000, special: 495000, pf: 79200, bonus: 85800 }
  }
];