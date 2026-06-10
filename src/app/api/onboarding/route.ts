/**
 * POST /api/onboarding
 *
 * Marks the signed-in user's onboarding as complete. Company Owners may also
 * update their company's basic details here. Auth-gated.
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { completeOnboardingSchema } from '@/lib/validation'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown = {}
  try {
    body = await req.json()
  } catch {
    // Empty body is fine — a "just finish" request.
  }

  const parsed = completeOnboardingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const { companyName, website, timezone } = parsed.data
  const user = session.user

  try {
    // Company Admins with a company can update its basics during onboarding.
    if (user.companyId && user.role === 'COMPANY_ADMIN') {
      const data: Record<string, unknown> = {}
      if (companyName) data.name = companyName.trim()
      if (website !== undefined) data.website = website ? website.trim() : null
      if (timezone) data.timezone = timezone
      if (Object.keys(data).length > 0) {
        await prisma.company.update({ where: { id: user.companyId }, data })
      }
    }

    if (timezone) {
      await prisma.user.update({ where: { id: user.id }, data: { timezone } })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { onboardingComplete: true },
    })

    return NextResponse.json({ ok: true, next: '/dashboard' })
  } catch (err) {
    console.error('onboarding error', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
