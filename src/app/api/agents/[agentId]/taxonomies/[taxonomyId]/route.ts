/**
 * DELETE /api/agents/[agentId]/taxonomies/[taxonomyId]
 *
 * Idempotent unassignment of an agent's taxonomy tag.
 */
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ agentId: string; taxonomyId: string }> },
) {
  const { agentId, taxonomyId } = await ctx.params

  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    select: { companyId: true },
  })
  if (!agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
  }

  const role = session.user.role
  const ownCompanyId = session.user.companyId
  const allowed =
    role === 'MASTER_ADMIN' ||
    ((role === 'COMPANY_ADMIN' || role === 'SALES_REP') && ownCompanyId === agent.companyId)
  if (!allowed) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.agentTaxonomy.deleteMany({
    where: { agentId, taxonomyId },
  })

  return new NextResponse(null, { status: 204 })
}
