import { describe, expect, it } from 'vitest'
import { headingId } from '@/components/blocks/heading-id'
import { learningCatalog } from '@/content/catalog'

const ra3Entries = [
  ['router-link', 'vue.router.reference.components.router-link', 'components', 6],
  ['router-view', 'vue.router.reference.components.router-view', 'components', 3],
  ['navigation-composables', 'vue.router.reference.composables.navigation', 'composables', 3],
  ['injection-keys', 'vue.router.reference.composables.injection-keys', 'composables', 5],
] as const

describe('Vue Router Reference RA3', () => {
  it('上线 Components、Composables 与 Injection Keys 的 17 项', async () => {
    const overview = learningCatalog.getReferenceOverview({ ecosystem: 'vue', module: 'router' })
    const groups = overview?.groups ?? []
    const items = groups.flatMap((group) => group.sections.flatMap((section) => section.items))
    const ra3Group = groups.find((group) => group.id === 'components-composables')
    const ra3Items = ra3Group?.sections.flatMap((section) => section.items) ?? []
    const plannedItems = items.filter((item) => item.status === 'planned')

    expect(overview?.total).toBe(118)
    expect(ra3Group?.sections.map((section) => [section.id, section.items.length])).toEqual(
      ra3Entries.map(([sectionId, , , count]) => [sectionId, count]),
    )
    expect(ra3Items.every((item) => item.status === 'available')).toBe(true)
    expect(plannedItems.every((item) => item.target === undefined && item.path === undefined)).toBe(
      true,
    )

    for (const collection of ['components', 'composables'] as const) {
      const navigation = learningCatalog.getNavigation({
        purpose: 'reference',
        ecosystem: 'vue',
        module: 'router',
        collection,
      })
      expect(navigation.entries.map((entry) => entry.entryId)).toEqual(
        ra3Entries.filter(([, , value]) => value === collection).map(([, entryId]) => entryId),
      )
    }

    const entries = await Promise.all(
      ra3Entries.map(([, entryId]) => learningCatalog.loadEntry(entryId)),
    )
    const entriesById = new Map(entries.map((entry) => [entry.meta.id, entry]))

    expect(entries.map((entry) => entry.meta.collection)).toEqual(
      ra3Entries.map(([, , collection]) => collection),
    )
    expect(
      entries.every((entry) => 'signature' in entry && entry.signature.trim().length > 0),
    ).toBe(true)
    expect(
      entries.flatMap((entry) =>
        entry.blocks.flatMap((block) => (block.type === 'demo' ? [block.id] : [])),
      ),
    ).toEqual([])

    for (const [sectionId, entryId, collection, count] of ra3Entries) {
      const section = ra3Group?.sections.find((item) => item.id === sectionId)
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
          `/reference/vue/router/${collection}/${entryId.split('.').at(-1)}#${item.target?.anchor}`,
        )
      }
    }

    const injectionSection = ra3Group?.sections.find((section) => section.id === 'injection-keys')
    expect(injectionSection?.items.every((item) => item.sourceTag === 'internal')).toBe(true)
  })
})
