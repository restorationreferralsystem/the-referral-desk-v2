import { prisma } from '@/lib/prisma'
import { APP_NAME } from '@/lib/constants'
import { AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface ReferralConfirmPageProps {
  params: {
    token: string
  }
}

async function getReferralByToken(token: string) {
  try {
    const referral = await prisma.referral.findUnique({
      where: { confirmationToken: token },
      include: {
        agent: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        company: {
          select: {
            name: true,
          },
        },
      },
    })
    return referral
  } catch {
    return null
  }
}

export default async function ReferralConfirmPage({ params }: ReferralConfirmPageProps) {
  const referral = await getReferralByToken(params.token)

  // Referral not found
  if (!referral) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1B4F72] to-[#2E86C1] flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-red-100 rounded-full">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{APP_NAME}</h1>
            <h2 className="text-xl font-semibold text-red-600 mb-3">Invalid or Expired Link</h2>
            <p className="text-gray-600 mb-6">
              This referral link is no longer valid or has already been used. If you believe this is an error, please contact the person who sent you this referral.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-2 bg-[#1B4F72] text-white rounded-lg font-medium hover:bg-[#2E86C1] transition-colors"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Already confirmed
  if (referral.confirmedAt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1B4F72] to-[#2E86C1] flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-green-100 rounded-full">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{APP_NAME}</h1>
            <h2 className="text-xl font-semibold text-green-600 mb-3">Already Confirmed</h2>
            <p className="text-gray-600 mb-4">
              This referral was already confirmed on{' '}
              <span className="font-semibold">
                {referral.confirmedAt.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </p>
            <p className="text-gray-600 text-sm mb-6">
              Thank you for confirming your referral.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-2 bg-[#1B4F72] text-white rounded-lg font-medium hover:bg-[#2E86C1] transition-colors"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Show confirmation form
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B4F72] to-[#2E86C1] flex items-center justify-center px-6 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#1B4F72] mb-2">{APP_NAME}</h1>
            <p className="text-gray-600 text-sm">Referral Confirmation</p>
          </div>

          {/* Referral Details */}
          <div className="mb-8 space-y-4 bg-gray-50 p-6 rounded-lg">
            <h2 className="font-semibold text-gray-900 text-lg mb-4">
              Referral Details
            </h2>

            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                From Company
              </p>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {referral.company.name}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Agent
              </p>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {referral.agent.firstName} {referral.agent.lastName}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Reference Code
              </p>
              <p className="text-lg font-mono font-semibold text-gray-900 mt-1">
                {referral.referenceCode}
              </p>
            </div>

            {referral.jobType && (
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Job Type
                </p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {referral.jobType}
                </p>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Direction
              </p>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {referral.direction === 'INBOUND' ? 'Agent → Contractor' : 'Contractor → Agent'}
              </p>
            </div>
          </div>

          {/* Confirm Button */}
          <form action={`/api/referrals/confirm/${params.token}`} method="POST">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#27AE60] text-white rounded-lg font-semibold hover:bg-[#229954] transition-all active:scale-95"
            >
              <CheckCircle className="w-5 h-5" />
              Confirm Receipt
            </button>
          </form>

          {/* Help Text */}
          <p className="text-xs text-center text-gray-500 mt-6">
            By confirming, you acknowledge receipt of this referral and take responsibility for follow-up.
          </p>
        </div>

        {/* Alternative Contact */}
        <div className="mt-6 text-center text-white text-sm">
          <p>
            Questions? Contact the company that sent you this referral.
          </p>
        </div>
      </div>
    </div>
  )
}
