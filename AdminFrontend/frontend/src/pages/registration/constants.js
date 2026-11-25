export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// Document 4.1 — No +alias allowed in work email
export const EMAIL_NO_ALIAS_REGEX = /^[^\s@+]+@[^\s@]+\.[^\s@]{2,}$/

// Document 4.2 — Company Size options (Matching API expectations)
export const COMPANY_SIZES = [
  { value: '1-10',     label: '1–10' },
  { value: '11-50',    label: '11–50' },
  { value: '51-200',   label: '51–200' },
  { value: '201-500',  label: '201–500' },
  { value: '501-1000', label: '501–1000' },
  { value: '1000+',    label: '1000+' },
]

// Document 4.2 — ~30 Industry options (searchable dropdown, optional)
export const INDUSTRIES = [
  'Accounting',
  'Aerospace & Defense',
  'Agriculture',
  'Automotive',
  'Banking & Financial Services',
  'Biotechnology',
  'Chemicals',
  'Computer Software',
  'Construction & Engineering',
  'Consulting',
  'Consumer Goods',
  'E-Commerce',
  'Education',
  'Energy & Utilities',
  'Entertainment & Media',
  'Food & Beverage',
  'Government & Public Sector',
  'Healthcare',
  'Hospitality & Travel',
  'Insurance',
  'Legal Services',
  'Logistics & Supply Chain',
  'Manufacturing',
  'Marketing & Advertising',
  'Mining & Metals',
  'Nonprofits',
  'Pharmaceuticals',
  'Real Estate',
  'Retail',
  'Technology & IT Services',
  'Telecommunications',
  'Transportation',
]

// Document 4.2 — Primary Region
export const PRIMARY_REGIONS = [
  { value: 'US', label: 'United States' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'IN', label: 'India' },
]

// Document 4.2 — Billing Cycle (radio)
export const BILLING_CYCLES = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'annual',  label: 'Annual'  },
]

// Document 4.2 — Plans
export const PLANS = [
  { slug: 'starter',    label: 'Starter (Free Trial)' },
  { slug: 'growth',     label: 'Growth'                },
  { slug: 'business',   label: 'Business'              },
  { slug: 'enterprise', label: 'Enterprise'            },
]
