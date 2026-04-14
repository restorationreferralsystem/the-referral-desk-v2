/**
 * GET /api/taxonomy/tree
 *
 * Convenience endpoint — equivalent to /api/taxonomy?tree=1 but with a
 * stable shape intended for dropdown/pick-tree UI consumption.
 *
 *   {
 *     count: number,
 *     tree:  TaxonomyNode[]   // roots only; each has `children`
 *   }
 *
 * Supports ?industry=<industryKey> to scope to a single industry subtree.
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
  children: TaxonomyNode[]
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const industry = searchParams.get('industry') || undefined

  const rows = await prisma.taxonomy.findMany({
    where: industry ? { industryKey: industry } : undefined,
    orderBy: [{ level: 'asc' }, { sortOrder: 'asc' }, { label: 'asc' }],
  })

  const byId = new Map<string, TaxonomyNode>()
  for (const r of rows) {
    byId.set(r.id, {
      id: r.id,
      parentId: r.parentId,
      level: r.level,
      label: r.label,
      slug: r.slug,
      fullPath: r.fullPath,
      industryKey: r.industryKey,
      isLeaf: r.isLeaf,
      sortOrder: r.sortOrder,
      children: [],
    })
  }

  const roots: TaxonomyNode[] = []
  for (const n of byId.values()) {
    if (n.parentId && byId.has(n.parentId)) {
      byId.get(n.parentId)!.children.push(n)
    } else {
      roots.push(n)
    }
  }

  const sortRecursive = (node: TaxonomyNode) => {
    node.children.sort((a, b) =>
      a.sortOrder - b.sortOrder || a.label.localeCompare(b.label),
    )
    node.children.forEach(sortRecursive)
  }
  roots.sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label))
  roots.forEach(sortRecursive)

  return NextResponse.json({ count: rows.length, tree: roots })
}
