/**
 * DELETE /api/companies/[companyId]/taxonomies/[taxonomyId]
 *
 * Remove a company's taxonomy assignment. Idempotent — returns 204 whether
 * the row existed or not (allows the UI to treat this as "ensure removed").
 */
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ companyId: string; taxonomyId: string }> },
) {
  const { companyId, taxonomyId } = await ctx.params

  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const role = session.user.role
  const ownCompanyId = session.user.companyId
  const allowed =
    role === 'MASTER_ADMIN' ||
    (role === 'COMPANY_ADMIN' && ownCompanyId === companyId)
  if (!allowed) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.companyTaxonomy.deleteMany({
    where: { companyId, taxonomyId },
  })

  return new NextResponse(null, { status: 204 })
}
