/**
 * POST /api/register
 *
 * Public, ungated account creation for the /signup page. Creates the user
 * record up-front so the user can then complete Google OAuth (the existing
 * auth flow) and land in onboarding. Three roles are supported:
 *
 *   company_owner    → COMPANY_ADMIN (creates a Company + 250 trial credits)
 *   team_member      → SALES_REP    (optionally joins a company via invite code)
 *   referral_partner → AGENT        (partner-portal user)
 *
 * No RRS-membership gating and no pending-approval state — open to anyone.
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { registerSchema } from '@/lib/validation'
import { TRIAL_CREDITS } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const data = parsed.data
  const email = data.email.trim().toLowerCase()
  const name = data.name.trim()

  try {
    // Duplicate email — handle gracefully (no leaking of internal state).
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Try signing in instead.' },
        { status: 409 },
      )
    }

    if (data.role === 'company_owner') {
      const result = await prisma.$transaction(async (tx: typeof prisma) => {
        const company = await tx.company.create({
          data: {
            name: data.companyName.trim(),
            website: data.website ? data.website.trim() : null,
          },
        })

        const user = await tx.user.create({
          data: {
            email,
            name,
            role: 'COMPANY_ADMIN',
            companyId: company.id,
            onboardingComplete: false,
          },
        })

        // One-time 250-credit trial grant for the new company.
        await tx.creditAllocation.create({
          data: {
            companyId: company.id,
            amount: TRIAL_CREDITS,
            type: 'trial',
            reference: 'signup_trial',
          },
        })

        return { user, company }
      })

      return NextResponse.json(
        { ok: true, role: 'COMPANY_ADMIN', userId: result.user.id, next: '/onboarding' },
        { status: 201 },
      )
    }

    if (data.role === 'team_member') {
      let companyId: string | null = null
      let role: 'SALES_REP' | 'COMPANY_ADMIN' | 'MASTER_ADMIN' | 'AGENT' = 'SALES_REP'

      const code = data.inviteCode?.trim()
      if (code) {
        const invitation = await prisma.invitation.findUnique({ where: { token: code } })
        if (!invitation || invitation.acceptedAt || invitation.expiresAt < new Date()) {
          return NextResponse.json(
            { error: 'That invite code is invalid or has expired.' },
            { status: 400 },
          )
        }
        companyId = invitation.companyId
        role = invitation.role
      }

      const user = await prisma.user.create({
        data: { email, name, role, companyId, onboardingComplete: false },
      })

      if (code) {
        await prisma.invitation.updateMany({
          where: { token: code, acceptedAt: null },
          data: { acceptedAt: new Date() },
        })
      }

      return NextResponse.json(
        { ok: true, role, userId: user.id, next: '/onboarding' },
        { status: 201 },
      )
    }

    // referral_partner → AGENT. partnerType is a display-layer concept and has
    // no column yet, so it is accepted for routing/onboarding but not persisted.
    const user = await prisma.user.create({
      data: { email, name, role: 'AGENT', companyId: null, onboardingComplete: false },
    })

    return NextResponse.json(
      { ok: true, role: 'AGENT', userId: user.id, next: '/onboarding' },
      { status: 201 },
    )
  } catch (err: unknown) {
    // Unique-constraint race on email → treat as duplicate.
    if (typeof err === 'object' && err !== null && 'code' in err && (err as { code?: string }).code === 'P2002') {
      return NextResponse.json(
        { error: 'An account with this email already exists. Try signing in instead.' },
        { status: 409 },
      )
    }
    console.error('register error', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
