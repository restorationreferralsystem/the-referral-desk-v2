/**
 * Taxonomy assignment helpers.
 *
 * Platform rule: "Leaves only, any level"
 *
 * Any record that *points to* a Taxonomy node (CompanyTaxonomy, AgentTaxonomy)
 * must reference a row where `isLeaf = true`. A leaf can live at level 2, 3,
 * or 4 — what matters is that it is a terminal offering, not an internal
 * navigation node. This helper centralizes that check so the rule can't drift
 * between routes.
 */
import { prisma } from './prisma'

export type TaxonomyAssignmentError =
  | { ok: false; status: 404; code: 'TAXONOMY_NOT_FOUND'; message: string }
  | { ok: false; status: 422; code: 'TAXONOMY_NOT_LEAF'; message: string }

export type TaxonomyAssignmentOk = {
  ok: true
  taxonomy: {
    id: string
    level: number
    label: string
    fullPath: string
    industryKey: string
    isLeaf: boolean
  }
}

/**
 * Resolve a taxonomy id and confirm it is assignable (isLeaf = true).
 * Returns either { ok: true, taxonomy } or a ready-to-return error payload.
 */
export async function assertAssignableTaxonomy(
  taxonomyId: string,
): Promise<TaxonomyAssignmentOk | TaxonomyAssignmentError> {
  const tx = await prisma.taxonomy.findUnique({
    where: { id: taxonomyId },
    select: {
      id: true,
      level: true,
      label: true,
      fullPath: true,
      industryKey: true,
      isLeaf: true,
    },
  })

  if (!tx) {
    return {
      ok: false,
      status: 404,
      code: 'TAXONOMY_NOT_FOUND',
      message: `Taxonomy node '${taxonomyId}' does not exist.`,
    }
  }

  if (!tx.isLeaf) {
    return {
      ok: false,
      status: 422,
      code: 'TAXONOMY_NOT_LEAF',
      message:
        `Taxonomy '${tx.label}' (${tx.fullPath}) is a grouping node and cannot ` +
        `be assigned directly. Pick one of its leaf descendants.`,
    }
  }

  return { ok: true, taxonomy: tx }
}
