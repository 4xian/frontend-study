import type {
  ReferenceIndexItemManifest,
  ReferenceIndexSectionManifest,
} from '@/common/catalog/types'

export type ReferenceItemDefinition = readonly [
  id: string,
  name: string,
  officialAnchor: string,
  depth: ReferenceIndexItemManifest['depth'],
  status: ReferenceIndexItemManifest['status'],
  entryId?: string,
  anchor?: string,
]

const officialBaseUrl = 'https://cn.vuejs.org/api'

/** 将一个官方页面的条目定义转换为参考索引小节。 */
export function referenceSection(
  id: string,
  title: string,
  definitions: readonly ReferenceItemDefinition[],
): ReferenceIndexSectionManifest {
  return {
    id,
    title,
    items: definitions.map(([itemId, name, officialAnchor, depth, status, entryId, anchor]) => ({
      id: `${id}.${itemId}`,
      name,
      officialUrl: `${officialBaseUrl}/${id}.html#${officialAnchor}`,
      depth,
      status,
      target: entryId ? { entryId, anchor } : undefined,
    })),
  }
}
