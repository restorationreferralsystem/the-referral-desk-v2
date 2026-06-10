'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { APP_NAME } from '@/lib/constants'
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react'

interface OnboardingWizardProps {
  role: string
  companyName: string
  website: string
  timezone: string
}

const COMMON_TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Phoenix',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu',
]

export function OnboardingWizard({ role, companyName, website, timezone }: OnboardingWizardProps) {
  const router = useRouter()
  const [name, setName] = useState(companyName)
  const [site, setSite] = useState(website)
  const [tz, setTz] = useState(timezone)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isOwner = role === 'COMPANY_ADMIN'

  async function finish() {
    setError(null)
    setSubmitting(true)

    const payload: Record<string, unknown> = { timezone: tz }
    if (isOwner) {
      payload.companyName = name
      payload.website = site || ''
    }

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Could not finish setup. Please try again.')
        setSubmitting(false)
        return
      }
      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Could not reach the server. Please try again.')
      setSubmitting(false)
    }
  }

  const heading = isOwner
    ? "Let's set up your company"
    : role === 'AGENT'
      ? 'Welcome to your partner portal'
      : 'Welcome to your workspace'

  const blurb = isOwner
    ? 'Confirm a few details and you can start adding referral partners.'
    : role === 'AGENT'
      ? 'Track the referrals you send and receive. You can update your details any time.'
      : 'You can manage your partner pipeline, calls, and appointments from your dashboard.'

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <p className="text-sm font-semibold text-[#2E86C1]">{APP_NAME}</p>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">{heading}</h1>
            <p className="text-gray-600 mt-2 text-sm">{blurb}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {isOwner && (
              <>
                <div>
                  <label htmlFor="cname" className="block text-sm font-medium text-gray-700 mb-1">
                    Company name
                  </label>
                  <input
                    id="cname"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="csite" className="block text-sm font-medium text-gray-700 mb-1">
                    Website <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    id="csite"
                    type="url"
                    value={site}
                    onChange={(e) => setSite(e.target.value)}
                    className={inputClass}
                    placeholder="https://"
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="ctz" className="block text-sm font-medium text-gray-700 mb-1">
                Time zone
              </label>
              <select
                id="ctz"
                value={tz}
                onChange={(e) => setTz(e.target.value)}
                className={inputClass}
              >
                {COMMON_TIMEZONES.map((z) => (
                  <option key={z} value={z}>
                    {z.replace('America/', '').replace('Pacific/', '').replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={finish}
            disabled={submitting || (isOwner && !name.trim())}
            className="mt-8 w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#E67E22] text-white rounded-lg font-semibold hover:bg-[#D35400] transition-colors disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Finishing…
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" /> Go to dashboard
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

const inputClass =
  'w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent'
