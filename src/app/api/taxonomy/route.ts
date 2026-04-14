/**
 * GET /api/taxonomy
 *
 * Returns the full Taxonomy set as a flat array. Use ?tree=1 for a nested
 * tree, ?industry=<industryKey> to scope to a single industry, ?level=<n> to
 * filter by level, and ?leafOnly=1 for only assignable (isLeaf = true) nodes.
 *
 * This endpoint is read-only and does not mutate state.
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

type TaxonomyNode = {
  id: string
  parentId: string | null
  level: number
  label: string
  slug: string
  fullPath: string
  industryKey: string
  isLeaf: boolean
  sortOrder: number
  notes: string | null
  children?: TaxonomyNode[]
}

function buildTree(flat: TaxonomyNode[]): TaxonomyNode[] {
  const byId = new Map<string, TaxonomyNode>()
  for (const n of flat) byId.set(n.id, { ...n, children: [] })

  const roots: TaxonomyNode[] = []
  for (const n of byId.values()) {
    if (n.parentId && byId.has(n.parentId)) {
      byId.get(n.parentId)!.children!.push(n)
    } else {
      roots.push(n)
    }
  }

  // Sort children by sortOrder then label everywhere
  const sortRecursive = (node: TaxonomyNode) => {
    if (node.children && node.children.length) {
      node.children.sort((a, b) =>
        a.sortOrder - b.sortOrder || a.label.localeCompare(b.label),
      )
      node.children.forEach(sortRecursive)
    }
  }
  roots.sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label))
  roots.forEach(sortRecursive)

  return roots
}

export async function GET(req: NextRequest) {
  // Session is required — taxonomy is used during onboarding/editing and
  // we don't want unauthenticated scraping of the full tree.
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const tree = searchParams.get('tree') === '1'
  const industry = searchParams.get('industry') || undefined
  const levelParam = searchParams.get('level')
  const level = levelParam ? Number(levelParam) : undefined
  const leafOnly = searchParams.get('leafOnly') === '1'

  if (level !== undefined && (!Number.isInteger(level) || level < 1 || level > 4)) {
    return NextResponse.json({ error: 'level must be an integer in [1,4]' }, { status: 400 })
  }

  const where: Record<string, unknown> = {}
  if (industry) where.industryKey = industry
  if (level !== undefined) where.level = level
  if (leafOnly) where.isLeaf = true

  const rows = await prisma.taxonomy.findMany({
    where,
    orderBy: [{ level: 'asc' }, { sortOrder: 'asc' }, { label: 'asc' }],
  })

  const nodes: TaxonomyNode[] = rows.map((r) => ({
    id: r.id,
    parentId: r.parentId,
    level: r.level,
    label: r.label,
    slug: r.slug,
    fullPath: r.fullPath,
    industryKey: r.industryKey,
    isLeaf: r.isLeaf,
    sortOrder: r.sortOrder,
    notes: r.notes,
  }))

  if (tree) {
    return NextResponse.json({ count: nodes.length, tree: buildTree(nodes) })
  }

  return NextResponse.json({ count: nodes.length, nodes })
}
