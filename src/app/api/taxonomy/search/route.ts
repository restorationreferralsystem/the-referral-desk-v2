/**
 * GET /api/taxonomy/search?q=<term>
 *
 * Fuzzy label + fullPath lookup across the taxonomy. Used by type-ahead
 * pickers when a contractor or agent is tagging offerings. Limits to 50
 * results by default; use ?limit=<n> (max 200) to override.
 *
 * Query modifiers:
 *   - leafOnly=1  — only return assignable (isLeaf = true) nodes. This is
 *                   the default when no explicit value is given because the
 *                   platform's rule is "Leaves only, any level".
 *   - industry=<industryKey> — scope to a single industry.
 *   - level=<n>   — scope to a single level (1–4).
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const DEFAULT_LIMIT = 50
const MAX_LIMIT = 200

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const q = (searchParams.get('q') || '').trim()
  const industry = searchParams.get('industry') || undefined
  const levelParam = searchParams.get('level')
  const level = levelParam ? Number(levelParam) : undefined
  // Default to leafOnly=true unless explicitly disabled with leafOnly=0
  const leafOnlyParam = searchParams.get('leafOnly')
  const leafOnly = leafOnlyParam === null ? true : leafOnlyParam === '1'

  const limitRaw = Number(searchParams.get('limit') || DEFAULT_LIMIT)
  const limit = Math.min(Math.max(Number.isFinite(limitRaw) ? limitRaw : DEFAULT_LIMIT, 1), MAX_LIMIT)

  if (q.length < 2) {
    return NextResponse.json(
      { error: 'q must be at least 2 characters' },
      { status: 400 },
    )
  }
  if (level !== undefined && (!Number.isInteger(level) || level < 1 || level > 4)) {
    return NextResponse.json({ error: 'level must be an integer in [1,4]' }, { status: 400 })
  }

  const where: Prisma.TaxonomyWhereInput = {
    OR: [
      { label:    { contains: q, mode: 'insensitive' } },
      { fullPath: { contains: q, mode: 'insensitive' } },
      { slug:     { contains: q, mode: 'insensitive' } },
    ],
  }
  if (industry) where.industryKey = industry
  if (level !== undefined) where.level = level
  if (leafOnly) where.isLeaf = true

  const rows = await prisma.taxonomy.findMany({
    where,
    orderBy: [{ level: 'asc' }, { sortOrder: 'asc' }, { label: 'asc' }],
    take: limit,
  })

  return NextResponse.json({
    count: rows.length,
    query: q,
    leafOnly,
    results: rows.map((r) => ({
      id: r.id,
      parentId: r.parentId,
      level: r.level,
      label: r.label,
      slug: r.slug,
      fullPath: r.fullPath,
      industryKey: r.industryKey,
      isLeaf: r.isLeaf,
    })),
  })
}
