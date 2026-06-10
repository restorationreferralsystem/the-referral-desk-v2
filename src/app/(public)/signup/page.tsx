'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { APP_NAME } from '@/lib/constants'
import {
  PARTNER_TYPES,
  PARTNER_TYPE_LABELS,
  PARTNER_TYPE_DESCRIPTIONS,
  type PartnerType,
} from '@/lib/partners'
import { Building2, Users2, Handshake, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react'

type SignupRole = 'company_owner' | 'team_member' | 'referral_partner'

const ROLE_CARDS: Array<{
  value: SignupRole
  title: string
  description: string
  icon: React.ReactNode
}> = [
  {
    value: 'company_owner',
    title: 'Company Owner',
    description: 'Set up your company, invite your team, and manage referral partners.',
    icon: <Building2 className="w-6 h-6" />,
  },
  {
    value: 'team_member',
    title: 'Team Member',
    description: 'Join your company to manage your partner pipeline and calls.',
    icon: <Users2 className="w-6 h-6" />,
  },
  {
    value: 'referral_partner',
    title: 'Referral Partner',
    description: 'Track the referrals you send and receive in the partner portal.',
    icon: <Handshake className="w-6 h-6" />,
  },
]

export default function SignupPage() {
  const [role, setRole] = useState<SignupRole | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Shared fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  // Company owner
  const [companyName, setCompanyName] = useState('')
  const [website, setWebsite] = useState('')

  // Team member
  const [inviteCode, setInviteCode] = useState('')

  // Referral partner
  const [partnerType, setPartnerType] = useState<PartnerType>('INSURANCE_AGENT')
  const [organization, setOrganization] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!role) return
    setError(null)
    setSubmitting(true)

    const payload: Record<string, unknown> = { role, name, email }
    if (role === 'company_owner') {
      payload.companyName = companyName
      if (website) payload.website = website
    } else if (role === 'team_member') {
      if (inviteCode) payload.inviteCode = inviteCode
    } else if (role === 'referral_partner') {
      payload.partnerType = partnerType
      if (organization) payload.organization = organization
    }

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Could not create your account. Please try again.')
        setSubmitting(false)
        return
      }

      // Account created — hand off to the existing Google auth flow, then on
      // to the role-appropriate onboarding wizard. login_hint pre-selects the
      // Google account matching the email they just registered with.
      await signIn('google', { callbackUrl: '/onboarding' }, { login_hint: email })
    } catch {
      setError('Could not reach the server. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B4F72] to-[#2E86C1] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Branding */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#1B4F72] mb-2">{APP_NAME}</h1>
            <p className="text-gray-600 text-sm">Create your account</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {!role ? (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">How will you use {APP_NAME}?</h2>
              <p className="text-sm text-gray-600 mb-6">Choose the option that fits you best.</p>
              <div className="space-y-3">
                {ROLE_CARDS.map((card) => (
                  <button
                    key={card.value}
                    type="button"
                    onClick={() => {
                      setError(null)
                      setRole(card.value)
                    }}
                    className="w-full text-left flex items-start gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-[#2E86C1] hover:bg-[#F8FAFB] transition-colors"
                  >
                    <span className="flex-shrink-0 p-3 bg-[#1B4F72] text-white rounded-lg">
                      {card.icon}
                    </span>
                    <span>
                      <span className="block font-semibold text-gray-900">{card.title}</span>
                      <span className="block text-sm text-gray-600 mt-0.5">{card.description}</span>
                    </span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <button
                type="button"
                onClick={() => setRole(null)}
                className="inline-flex items-center gap-1 text-sm text-[#2E86C1] hover:underline"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              <div>
                <span className="inline-block px-3 py-1 bg-[#EAF2F8] text-[#1B4F72] text-xs font-semibold rounded-full">
                  {ROLE_CARDS.find((c) => c.value === role)?.title}
                </span>
              </div>

              <Field label="Full name" htmlFor="name">
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                  placeholder="Jane Smith"
                />
              </Field>

              <Field label="Work email" htmlFor="email" hint="Use the Google email you'll sign in with.">
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="jane@company.com"
                />
              </Field>

              {role === 'company_owner' && (
                <>
                  <Field label="Company name" htmlFor="companyName">
                    <input
                      id="companyName"
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className={inputClass}
                      placeholder="Acme Restoration"
                    />
                  </Field>
                  <Field label="Website" htmlFor="website" hint="Optional">
                    <input
                      id="website"
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className={inputClass}
                      placeholder="https://acme-restoration.com"
                    />
                  </Field>
                </>
              )}

              {role === 'team_member' && (
                <Field
                  label="Company invite code"
                  htmlFor="inviteCode"
                  hint="Optional — paste the code from your invite if you have one."
                >
                  <input
                    id="inviteCode"
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    className={inputClass}
                    placeholder="Invite code"
                  />
                </Field>
              )}

              {role === 'referral_partner' && (
                <>
                  <Field label="What kind of partner are you?" htmlFor="partnerType">
                    <select
                      id="partnerType"
                      value={partnerType}
                      onChange={(e) => setPartnerType(e.target.value as PartnerType)}
                      className={inputClass}
                    >
                      {PARTNER_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {PARTNER_TYPE_LABELS[t]}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <p className="text-xs text-gray-500 -mt-2">
                    {PARTNER_TYPE_DESCRIPTIONS[partnerType]}
                  </p>
                  <Field label="Organization" htmlFor="organization" hint="Optional">
                    <input
                      id="organization"
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      className={inputClass}
                      placeholder="Your agency or company"
                    />
                  </Field>
                </>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#E67E22] text-white rounded-lg font-semibold hover:bg-[#D35400] transition-colors disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Creating account…
                  </>
                ) : (
                  'Create account & continue with Google'
                )}
              </button>
            </form>
          )}

          <p className="text-sm text-center text-gray-600 mt-8">
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-[#2E86C1] font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

const inputClass =
  'w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent'

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string
  htmlFor: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </div>
  )
}
