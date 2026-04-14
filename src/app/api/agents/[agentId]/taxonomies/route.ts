/**
 * /api/agents/[agentId]/taxonomies
 *
 *   GET  — list every taxonomy offering the agent places business with
 *   POST — tag the agent with a taxonomy leaf
 *
 * Authorization:
 *   MASTER_ADMIN and anyone in the agent's *company* (COMPANY_ADMIN or
 *   SALES_REP) may read/write the agent's taxonomies. An AGENT user may
 *   not edit agent records through this endpoint.
 *
 * Leaf enforcement: see src/lib/taxonomy.ts.
 */
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { assertAssignableTaxonomy } from '@/lib/taxonomy'

export const dynamic = 'force-dynamic'

async function authorize(agentId: string) {
  const session = await auth()
  if (!session?.user) {
    return { ok: false as const, res: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    select: { id: true, companyId: true },
  })
  if (!agent) {
    return { ok: false as const, res: NextResponse.json({ error: 'Agent not found' }, { status: 404 }) }
  }

  const role = session.user.role
  const ownCompanyId = session.user.companyId
  const allowed =
    role === 'MASTER_ADMIN' ||
    ((role === 'COMPANY_ADMIN' || role === 'SALES_REP') && ownCompanyId === agent.companyId)

  if (!allowed) {
    return { ok: false as const, res: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { ok: true as const, session, agent }
}

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ agentId: string }> },
) {
  const { agentId } = await ctx.params
  const authz = await authorize(agentId)
  if (!authz.ok) return authz.res

  const rows = await prisma.agentTaxonomy.findMany({
    where: { agentId },
    include: {
      taxonomy: {
        select: {
          id: true, level: true, label: true, fullPath: true,
          industryKey: true, isLeaf: true,
        },
      },
    },
    orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
  })

  return NextResponse.json({ agentId, count: rows.length, assignments: rows })
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ agentId: string }> },
) {
  const { agentId } = await ctx.params
  const authz = await authorize(agentId)
  if (!authz.ok) return authz.res

  let body: { taxonomyId?: string; isPrimary?: boolean; notes?: string | null }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body?.taxonomyId || typeof body.taxonomyId !== 'string') {
    return NextResponse.json({ error: 'taxonomyId is required' }, { status: 400 })
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
    if (isPrimary) {
      await tx.agentTaxonomy.updateMany({
        where: { agentId, isPrimary: true },
        data: { isPrimary: false },
      })
    }

    return tx.agentTaxonomy.upsert({
      where: {
        agentId_taxonomyId: { agentId, taxonomyId: body.taxonomyId! },
      },
      create: {
        agentId,
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
