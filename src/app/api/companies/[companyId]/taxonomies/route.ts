/**
 * /api/companies/[companyId]/taxonomies
 *
 *   GET  — list every taxonomy offering assigned to this company
 *   POST — assign a taxonomy leaf to the company
 *
 * Authorization:
 *   - MASTER_ADMIN may read/write any company
 *   - COMPANY_ADMIN may read/write only their own company
 *   - Everyone else: 403
 *
 * Leaf enforcement:
 *   POST requires `taxonomyId` to resolve to an isLeaf = true Taxonomy row.
 *   See src/lib/taxonomy.ts for the shared check.
 */
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { assertAssignableTaxonomy } from '@/lib/taxonomy'

export const dynamic = 'force-dynamic'

async function authorize(companyId: string) {
  const session = await auth()
  if (!session?.user) {
    return { ok: false as const, res: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  const role = session.user.role
  const ownCompanyId = session.user.companyId

  if (role === 'MASTER_ADMIN') return { ok: true as const, session }
  if (role === 'COMPANY_ADMIN' && ownCompanyId === companyId) {
    return { ok: true as const, session }
  }
  return { ok: false as const, res: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
}

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ companyId: string }> },
) {
  const { companyId } = await ctx.params
  const auth = await authorize(companyId)
  if (!auth.ok) return auth.res

  const rows = await prisma.companyTaxonomy.findMany({
    where: { companyId },
    include: {
      taxonomy: {
        select: {
          id: true,
          level: true,
          label: true,
          fullPath: true,
          industryKey: true,
          isLeaf: true,
        },
      },
    },
    orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
  })

  return NextResponse.json({
    companyId,
    count: rows.length,
    assignments: rows,
  })
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ companyId: string }> },
) {
  const { companyId } = await ctx.params
  const authResult = await authorize(companyId)
  if (!authResult.ok) return authResult.res

  let body: { taxonomyId?: string; isPrimary?: boolean; notes?: string | null }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body?.taxonomyId || typeof body.taxonomyId !== 'string') {
    return NextResponse.json({ error: 'taxonomyId is required' }, { status: 400 })
  }

  // Make sure the company exists (prevents silently assigning to nothing)
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true },
  })
  if (!company) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 })
  }

  // Enforce "Leaves only, any level"
  const check = await assertAssignableTaxonomy(body.taxonomyId)
  if (!check.ok) {
    return NextResponse.json(
      { error: check.message, code: check.code },
      { status: check.status },
    )
  }

  const isPrimary = Boolean(body.isPrimary)

  const created = await prisma.$transaction(async (tx) => {
    // Only one primary offering per company. If this one is primary, demote
    // the others so we always have at most one.
    if (isPrimary) {
      await tx.companyTaxonomy.updateMany({
        where: { companyId, isPrimary: true },
        data: { isPrimary: false },
      })
    }

    return tx.companyTaxonomy.upsert({
      where: {
        companyId_taxonomyId: { companyId, taxonomyId: body.taxonomyId! },
      },
      create: {
        companyId,
        taxonomyId: body.taxonomyId!,
        isPrimary,
        notes: body.notes ?? null,
      },
      update: {
        isPrimary,
        notes: body.notes ?? null,
      },
      include: {
        taxonomy: {
          select: {
            id: true, level: true, label: true, fullPath: true,
            industryKey: true, isLeaf: true,
          },
        },
      },
    })
  })

  return NextResponse.json({ assignment: created }, { status: 201 })
}
