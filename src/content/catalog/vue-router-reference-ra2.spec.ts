import { describe, expect, it } from 'vitest'
import { headingId } from '@/components/blocks/heading-id'
import { learningCatalog } from '@/content/catalog'

const matchingEntries = [
  ['matcher', 'vue.router.reference.matching.matcher', 6],
  ['route-records', 'vue.router.reference.matching.route-records', 14],
  ['route-locations', 'vue.router.reference.matching.route-locations', 21],
  ['params-query', 'vue.router.reference.matching.params-query', 17],
] as const

describe('Vue Router Reference RA2', () => {
  it('上线 Matching 的 58 项，并保持后续条目不可导航', async () => {
    const overview = learningCatalog.getReferenceOverview({ ecosystem: 'vue', module: 'router' })
    const groups = overview?.groups ?? []
    const items = groups.flatMap((group) => group.sections.flatMap((section) => section.items))
    const matchingGroup = groups.find((group) => group.id === 'matching')
    const matchingItems = matchingGroup?.sections.flatMap((section) => section.items) ?? []
    const plannedItems = items.filter((item) => item.status === 'planned')

    expect(overview?.total).toBe(118)
    expect(matchingGroup?.sections.map((section) => [section.id, section.items.length])).toEqual(
      matchingEntries.map(([sectionId, , count]) => [sectionId, count]),
    )
    expect(matchingItems.every((item) => item.status === 'available')).toBe(true)
    expect(plannedItems.every((item) => item.target === undefined && item.path === undefined)).toBe(
      true,
    )

    const navigation = learningCatalog.getNavigation({
      purpose: 'reference',
      ecosystem: 'vue',
      module: 'router',
      collection: 'matching',
    })
    expect(navigation.entries.map((entry) => entry.entryId)).toEqual(
      matchingEntries.map(([, entryId]) => entryId),
    )

    const entries = await Promise.all(
      matchingEntries.map(([, entryId]) => learningCatalog.loadEntry(entryId)),
    )
    const entriesById = new Map(entries.map((entry) => [entry.meta.id, entry]))

    expect(entries.every((entry) => entry.meta.collection === 'matching')).toBe(true)
    expect(
      entries.every((entry) => 'signature' in entry && entry.signature.trim().length > 0),
    ).toBe(true)
    expect(
      entries.flatMap((entry) =>
        entry.blocks.flatMap((block) => (block.type === 'demo' ? [block.id] : [])),
      ),
    ).toEqual([])

    for (const [sectionId, entryId, count] of matchingEntries) {
      const section = matchingGroup?.sections.find((item) => item.id === sectionId)
      const entry = entriesById.get(entryId)
      const headingIds =
        entry?.blocks.flatMap((block) =>
          block.type === 'heading' ? [headingId(block.content)] : [],
        ) ?? []
      const pitfallCount =
        entry?.blocks
          .filter((block) => block.type === 'pitfalls')
          .reduce((total, block) => total + block.items.length, 0) ?? 0

      expect(section?.items.length, sectionId).toBe(count)
      expect(entry && 'anchors' in entry.meta, entryId).toBe(true)
      if (!entry || !('anchors' in entry.meta)) continue

      expect(new Set(headingIds).size, entryId).toBe(headingIds.length)
      expect(pitfallCount, entryId).toBeGreaterThanOrEqual(5)
      expect(pitfallCount, entryId).toBeLessThanOrEqual(10)
      expect(entry.meta.anchors, entryId).toEqual(
        expect.arrayContaining(['易错使用提示', '源码推导与适用场景']),
      )
      expect(entry.meta.sources.some((source) => source.url.includes('router.vuejs.org/api'))).toBe(
        true,
      )
      expect(
        entry.meta.sources.some((source) =>
          source.url.includes('6e5f8d253b9444a76eb58f176ebe08d686c937cb'),
        ),
      ).toBe(true)

      for (const item of section?.items ?? []) {
        expect(item.target?.entryId, item.id).toBe(entryId)
        expect(item.target?.anchor, item.id).toBeTruthy()
        expect(headingIds, item.id).toContain(item.target?.anchor)
        expect(item.path, item.id).toBe(
          `/reference/vue/router/matching/${entryId.split('.').at(-1)}#${item.target?.anchor}`,
        )
      }
    }
  })
})
