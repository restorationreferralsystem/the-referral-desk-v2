/**
 * Enum definitions matching Prisma schema
 * Used for validation and runtime checks before Prisma client generation
 */

export const USER_ROLES = [
  'MASTER_ADMIN',
  'COMPANY_ADMIN',
  'SALES_REP',
  'AGENT',
] as const

export const PLAN_TIERS = [
  'FREE',
  'PROFESSIONAL',
  'ENTERPRISE',
] as const

export const AGENT_TYPES = [
  'CAPTIVE',
  'INDEPENDENT',
  'BROKER',
] as const

export const AGENCY_SIZES = [
  'SOLO',
  'SMALL',
  'MEDIUM',
  'LARGE',
] as const

export const AGENT_SOURCES = [
  'MANUAL',
  'CSV_IMPORT',
  'API_DISCOVERY',
  'REFERRAL',
] as const

export const PIPELINE_STAGES = [
  'PROSPECT',
  'FIRST_CONTACT',
  'ENGAGED',
  'MEETING_SET',
  'ACTIVE_PARTNER',
  'TOP_PRODUCER',
  'INACTIVE',
] as const

export const ACTIVITY_TYPES = [
  'CALL',
  'EMAIL',
  'MEETING',
  'REFERRAL_GIVEN',
  'REFERRAL_RECEIVED',
  'NOTE',
  'APPOINTMENT_SET',
  'FOLLOW_UP',
] as const

export const CALL_TYPES = [
  'COLD',
  'ORGANIC',
  'PAST_CLIENT',
  'FOLLOW_UP',
] as const

export const CALL_OUTCOMES = [
  'APPOINTMENT_SET',
  'CALLBACK_REQUESTED',
  'LEFT_VOICEMAIL',
  'NOT_INTERESTED',
  'GATEKEEPER_BLOCK',
  'NO_ANSWER',
  'OTHER',
] as const

export const APPOINTMENT_STATUSES = [
  'SCHEDULED',
  'CONFIRMED',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
] as const

export const REFERRAL_DIRECTIONS = [
  'INBOUND',
  'OUTBOUND',
] as const

export const REFERRAL_STATUSES = [
  'RECEIVED',
  'CONTACTED',
  'INSPECTION_SCHEDULED',
  'ESTIMATE_SENT',
  'APPROVED',
  'WORK_IN_PROGRESS',
  'COMPLETE',
  'CANCELLED',
] as const
