import { z } from 'zod'
import {
  AGENT_TYPES,
  CALL_TYPES,
  CALL_OUTCOMES,
  REFERRAL_DIRECTIONS,
  REFERRAL_STATUSES,
  USER_ROLES,
} from './enums'
import { PARTNER_TYPES } from './partners'

// ---------------------------------------------------------------------------
// Public signup / registration
// ---------------------------------------------------------------------------

/**
 * Signup roles offered on the public /signup page. These map to the existing
 * UserRole enum values — display names are partner-aware:
 *   company_owner    → COMPANY_ADMIN
 *   team_member      → SALES_REP
 *   referral_partner → AGENT
 */
export const SIGNUP_ROLES = ['company_owner', 'team_member', 'referral_partner'] as const
export type SignupRole = (typeof SIGNUP_ROLES)[number]

const baseRegisterFields = {
  name: z.string().min(1, 'Your name is required').max(120),
  email: z.string().email('A valid email is required'),
}

export const registerSchema = z.discriminatedUnion('role', [
  z.object({
    role: z.literal('company_owner'),
    ...baseRegisterFields,
    companyName: z.string().min(1, 'Company name is required').max(160),
    website: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  }),
  z.object({
    role: z.literal('team_member'),
    ...baseRegisterFields,
    // Optional invite code lets a team member join an existing company.
    inviteCode: z.string().optional().or(z.literal('')),
  }),
  z.object({
    role: z.literal('referral_partner'),
    ...baseRegisterFields,
    partnerType: z.enum(PARTNER_TYPES),
    organization: z.string().max(160).optional().or(z.literal('')),
  }),
])

export type RegisterInput = z.infer<typeof registerSchema>

/** Mark the current user's onboarding as complete (and update company basics). */
export const completeOnboardingSchema = z.object({
  companyName: z.string().min(1).max(160).optional(),
  website: z.string().url().optional().or(z.literal('')),
  timezone: z.string().optional(),
})

export type CompleteOnboardingInput = z.infer<typeof completeOnboardingSchema>

// Agent schemas
export const createAgentSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  agencyName: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  zip: z.string().optional().or(z.literal('')),
  agentType: z.enum(AGENT_TYPES).optional(),
})

export type CreateAgentInput = z.infer<typeof createAgentSchema>

// Call log schemas
export const createCallLogSchema = z.object({
  agentId: z.string().min(1, 'Agent ID is required'),
  callType: z.enum(CALL_TYPES),
  outcome: z.enum(CALL_OUTCOMES),
  duration: z.number().int().positive('Duration must be positive').optional(),
  notes: z.string().optional().or(z.literal('')),
})

export type CreateCallLogInput = z.infer<typeof createCallLogSchema>

// Appointment schemas
export const createAppointmentSchema = z.object({
  agentId: z.string().min(1, 'Agent ID is required'),
  title: z.string().min(1, 'Title is required'),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  description: z.string().optional().or(z.literal('')),
  location: z.string().optional().or(z.literal('')),
})

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>

// Referral schemas
export const createReferralSchema = z.object({
  agentId: z.string().min(1, 'Agent ID is required'),
  direction: z.enum(REFERRAL_DIRECTIONS),
  jobType: z.string().min(1, 'Job type is required'),
  estimatedValue: z.number().positive('Estimated value must be positive').optional(),
  notes: z.string().optional().or(z.literal('')),
})

export type CreateReferralInput = z.infer<typeof createReferralSchema>

// Invitation schemas
export const createInvitationSchema = z.object({
  email: z.string().email('Valid email is required'),
  role: z.enum(USER_ROLES),
  companyId: z.string().min(1, 'Company ID is required'),
})

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>

// Update referral status
export const updateReferralStatusSchema = z.object({
  status: z.enum(REFERRAL_STATUSES),
})

export type UpdateReferralStatusInput = z.infer<typeof updateReferralStatusSchema>

// Search agents schema
export const searchAgentsSchema = z.object({
  query: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  agentType: z.enum(AGENT_TYPES).optional(),
  carrier: z.string().optional().or(z.literal('')),
  minHealthScore: z.number().min(0).max(100).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export type SearchAgentsInput = z.infer<typeof searchAgentsSchema>
