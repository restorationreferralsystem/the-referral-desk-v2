/**
 * Partner display-layer helpers.
 *
 * The platform was originally built roofer → insurance-agent, but is now
 * universal for any referral relationship. The database still calls these
 * records "Agent" (model/table/route names are intentionally unchanged), but
 * EVERY user-facing string should read in partner-aware language.
 *
 * `partnerType` is a display-layer concept: when we know the kind of partner
 * we use the specific label (e.g. "Realtor"); otherwise we fall back to the
 * generic "Referral Partner". There is no `partnerType` database column yet,
 * so this lives purely in the display/prompt layer.
 */

export const PARTNER_TYPES = [
  'INSURANCE_AGENT',
  'REALTOR',
  'SERVICE_PROVIDER',
  'PAST_CUSTOMER',
  'HOMEOWNER',
] as const

export type PartnerType = (typeof PARTNER_TYPES)[number]

/** Singular display label for a known partner type. */
export const PARTNER_TYPE_LABELS: Record<PartnerType, string> = {
  INSURANCE_AGENT: 'Insurance Agent',
  REALTOR: 'Realtor',
  SERVICE_PROVIDER: 'Service Provider',
  PAST_CUSTOMER: 'Past Customer',
  HOMEOWNER: 'Homeowner',
}

/** Plural display label for a known partner type. */
export const PARTNER_TYPE_LABELS_PLURAL: Record<PartnerType, string> = {
  INSURANCE_AGENT: 'Insurance Agents',
  REALTOR: 'Realtors',
  SERVICE_PROVIDER: 'Service Providers',
  PAST_CUSTOMER: 'Past Customers',
  HOMEOWNER: 'Homeowners',
}

/** Short description shown when a person picks their partner type. */
export const PARTNER_TYPE_DESCRIPTIONS: Record<PartnerType, string> = {
  INSURANCE_AGENT: 'Property & casualty agents who refer claims work',
  REALTOR: 'Real estate agents who refer buyers and sellers',
  SERVICE_PROVIDER: 'Plumbers, electricians, and other trades who cross-refer',
  PAST_CUSTOMER: 'Happy customers who send you their network',
  HOMEOWNER: 'Homeowners who refer their friends and neighbors',
}

const GENERIC_LABEL = 'Referral Partner'
const GENERIC_LABEL_PLURAL = 'Referral Partners'

function normalize(type?: string | null): PartnerType | null {
  if (!type) return null
  const upper = type.toUpperCase()
  return (PARTNER_TYPES as readonly string[]).includes(upper)
    ? (upper as PartnerType)
    : null
}

/**
 * Display name for a partner. Uses the specific type when known
 * (e.g. "Realtor"), otherwise the generic "Referral Partner".
 */
export function partnerLabel(type?: string | null): string {
  const t = normalize(type)
  return t ? PARTNER_TYPE_LABELS[t] : GENERIC_LABEL
}

/** Plural display name for a partner type. */
export function partnerLabelPlural(type?: string | null): string {
  const t = normalize(type)
  return t ? PARTNER_TYPE_LABELS_PLURAL[t] : GENERIC_LABEL_PLURAL
}

/** True when the partner is an insurance agent — gate insurance-only copy. */
export function isInsurancePartner(type?: string | null): boolean {
  return normalize(type) === 'INSURANCE_AGENT'
}
