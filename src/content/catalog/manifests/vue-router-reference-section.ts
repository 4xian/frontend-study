import type {
  ReferenceCoverageDepth,
  ReferenceIndexGroupManifest,
  ReferenceSourceTag,
} from '../types'

export type VueRouterReferenceItemDefinition = readonly [
  id: string,
  name: string,
  sourceTag: ReferenceSourceTag,
  depth: ReferenceCoverageDepth,
  entryId: string,
  anchor: string,
]

export interface VueRouterReferenceSectionDefinition {
  id: string
  title: string
  items: readonly VueRouterReferenceItemDefinition[]
}

const officialBaseUrl = 'https://router.vuejs.org/api'

/** 将 RA0 冻结定义转换为 Vue Router 参考索引分组。 */
export function vueRouterReferenceGroup(
  id: string,
  title: string,
  sections: readonly VueRouterReferenceSectionDefinition[],
  availableEntryIds: ReadonlySet<string>,
): ReferenceIndexGroupManifest {
  return {
    id,
    title,
    sections: sections.map((section) => ({
      id: section.id,
      title: section.title,
      items: section.items.map(([itemId, name, sourceTag, depth, entryId, anchor]) => {
        const available = availableEntryIds.has(entryId)
        return {
          id: itemId,
          name,
          officialUrl: `${officialBaseUrl}/${itemId.replace('.', '/')}`,
          sourceTag,
          depth,
          status: available ? ('available' as const) : ('planned' as const),
          target: available ? { entryId, anchor } : undefined,
        }
      }),
    })),
  }
}
