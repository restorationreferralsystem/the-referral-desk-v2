import { USER_ROLES } from './enums'

type UserRole = (typeof USER_ROLES)[number]

export const APP_NAME = 'The Referral Desk'
export const APP_TAGLINE = 'Restoration Referral System'

// Brand colors
export const COLORS = {
  primary: '#1B4F72',
  primaryLight: '#2E86C1',
  accent: '#E67E22',
  success: '#27AE60',
  background: '#F8FAFB',
  dark: '#2C3E50',
  error: '#E74C3C',
  warning: '#F39C12',
  info: '#3498DB',
} as const

// Pipeline stages with display names and colors
export const PIPELINE_STAGES_CONFIG = [
  { value: 'PROSPECT', label: 'Prospect', color: '#95A5A6' },
  { value: 'FIRST_CONTACT', label: 'First Contact', color: '#E67E22' },
  { value: 'ENGAGED', label: 'Engaged', color: '#F39C12' },
  { value: 'MEETING_SET', label: 'Meeting Set', color: '#3498DB' },
  { value: 'ACTIVE_PARTNER', label: 'Active Partner', color: '#27AE60' },
  { value: 'TOP_PRODUCER', label: 'Top Producer', color: '#1B4F72' },
  { value: 'INACTIVE', label: 'Inactive', color: '#7F8C8D' },
] as const

export const AGENT_TYPES_CONFIG = [
  { value: 'CAPTIVE', label: 'Captive Agent' },
  { value: 'INDEPENDENT', label: 'Independent Agent' },
  { value: 'BROKER', label: 'Broker' },
] as const

export const AGENCY_SIZES_CONFIG = [
  { value: 'SOLO', label: 'Solo Agent' },
  { value: 'SMALL', label: 'Small (2-5 agents)' },
  { value: 'MEDIUM', label: 'Medium (6-20 agents)' },
  { value: 'LARGE', label: 'Large (20+ agents)' },
] as const

export const CARRIERS = [
  'State Farm',
  'Allstate',
  'Geico',
  'Progressive',
  'Nationwide',
  'Liberty Mutual',
  'USAA',
  'Farmers',
  'Travelers',
  'Amica Mutual',
  'Hartford',
  'SCPIE',
  'AIG',
  'Other',
] as const

export const LINES_OF_BUSINESS = [
  'Homeowners',
  'Commercial',
  'Auto',
  'Umbrella',
  'Flood',
  'Wind',
  'Specialty',
  'Other',
] as const

// Credit system
export const CREDITS = {
  FREE: 25,
  PRO: 100,
  ENTERPRISE: 500,
  COST: 1, // cost per credit in cents
} as const

// Subscription plans
export const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    credits: CREDITS.FREE,
    features: [
      'Up to 25 agents',
      'Basic pipeline tracking',
      'Email & call logging',
      'Standard support',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 49,
    credits: CREDITS.PRO,
    features: [
      'Up to 100 agents',
      'Advanced pipeline analytics',
      'AI call companion',
      'Google Calendar sync',
      'Appointment scheduling',
      'Priority support',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 149,
    credits: CREDITS.ENTERPRISE,
    features: [
      'Unlimited agents',
      'Custom integrations',
      'Dedicated account manager',
      'Advanced team management',
      'Custom reporting',
      'SLA support',
    ],
  },
] as const

// Navigation items by role
export const NAV_ITEMS: Record<UserRole, Array<{ label: string; href: string; icon: string }>> = {
  SALES_REP: [
    { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
    { label: 'Agents', href: '/agents', icon: 'Users' },
    { label: 'Pipeline', href: '/pipeline', icon: 'TrendingUp' },
    { label: 'Calls', href: '/calls', icon: 'Phone' },
    { label: 'Appointments', href: '/appointments', icon: 'Calendar' },
    { label: 'Referrals', href: '/referrals', icon: 'Gift' },
  ],
  COMPANY_ADMIN: [
    { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
    { label: 'Agents', href: '/agents', icon: 'Users' },
    { label: 'Pipeline', href: '/pipeline', icon: 'TrendingUp' },
    { label: 'Calls', href: '/calls', icon: 'Phone' },
    { label: 'Appointments', href: '/appointments', icon: 'Calendar' },
    { label: 'Referrals', href: '/referrals', icon: 'Gift' },
    { label: 'Team', href: '/team', icon: 'Users2' },
    { label: 'Messaging', href: '/messaging', icon: 'MessageCircle' },
    { label: 'Analytics', href: '/analytics', icon: 'BarChart3' },
    { label: 'Settings', href: '/settings', icon: 'Settings' },
  ],
  MASTER_ADMIN: [
    { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
    { label: 'Companies', href: '/admin/companies', icon: 'Building2' },
    { label: 'All Agents', href: '/admin/agents', icon: 'Users' },
    { label: 'Ecosystem', href: '/admin/ecosystem', icon: 'Globe' },
    { label: 'Settings', href: '/settings', icon: 'Settings' },
  ],
  AGENT: [
    { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
    { label: 'Referrals', href: '/referrals', icon: 'Gift' },
    { label: 'Submit Referral', href: '/referrals/submit', icon: 'Plus' },
  ],
}

// Role display names
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  MASTER_ADMIN: 'Master Admin',
  COMPANY_ADMIN: 'Company Admin',
  SALES_REP: 'Sales Rep',
  AGENT: 'Agent',
}
