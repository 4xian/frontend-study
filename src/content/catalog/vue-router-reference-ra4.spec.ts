import { describe, expect, it } from 'vitest'
import { headingId } from '@/components/blocks/heading-id'
import { learningCatalog } from '@/content/catalog'

const ra4Sections = [
  {
    id: 'guards',
    entryId: 'vue.router.reference.navigation.guards',
    items: [
      ['interfaces.navigationguard', 'navigation-guard'],
      ['interfaces.navigationguardnext', 'navigation-guard-next'],
      ['interfaces.navigationguardwiththis', 'navigation-guard-with-this'],
      ['interfaces.navigationhookafter', 'navigation-hook-after'],
      ['type-aliases.awaitable', 'internal-awaitable'],
      ['type-aliases.navigationguardnextcallback', 'navigation-guard-next-callback'],
      ['type-aliases.navigationguardreturn', 'navigation-guard-return'],
      ['functions.onbeforerouteleave', 'on-before-route-leave'],
      ['functions.onbeforerouteupdate', 'on-before-route-update'],
    ],
  },
  {
    id: 'failures',
    entryId: 'vue.router.reference.navigation.failures',
    items: [
      ['enumerations.errortypes', 'error-types'],
      ['enumerations.navigationfailuretype', 'navigation-failure-type'],
      ['interfaces.navigationfailure', 'navigation-failure'],
      ['interfaces.navigationredirecterror', 'navigation-redirect-error'],
      ['functions.isnavigationfailure', 'is-navigation-failure'],
    ],
  },
] as const

describe('Vue Router Reference RA4', () => {
  it('上线 Navigation 的 14 项', async () => {
    const overview = learningCatalog.getReferenceOverview({ ecosystem: 'vue', module: 'router' })
    const groups = overview?.groups ?? []
    const items = groups.flatMap((group) => group.sections.flatMap((section) => section.items))
    const navigationGroup = groups.find((group) => group.id === 'navigation')
    const navigationItems = navigationGroup?.sections.flatMap((section) => section.items) ?? []
    const itemsById = new Map(items.map((item) => [item.id, item]))

    expect(overview?.total).toBe(118)
    expect(navigationGroup?.sections.map((section) => [section.id, section.items.length])).toEqual(
      ra4Sections.map((section) => [section.id, section.items.length]),
    )
    expect(navigationItems.every((item) => item.status === 'available')).toBe(true)

    const navigation = learningCatalog.getNavigation({
      purpose: 'reference',
      ecosystem: 'vue',
      module: 'router',
      collection: 'navigation',
    })
    expect(navigation.entries.map((entry) => entry.entryId)).toEqual(
      ra4Sections.map((section) => section.entryId),
    )

    const entries = await Promise.all(
      ra4Sections.map((section) => learningCatalog.loadEntry(section.entryId)),
    )
    const entriesById = new Map(entries.map((entry) => [entry.meta.id, entry]))

    expect(entries.map((entry) => entry.meta.collection)).toEqual(['navigation', 'navigation'])
    expect(
      entries.every((entry) => 'signature' in entry && entry.signature.trim().length > 0),
    ).toBe(true)
    expect(
      entries.flatMap((entry) =>
        entry.blocks.flatMap((block) => (block.type === 'demo' ? [block.id] : [])),
      ),
    ).toEqual([])

    for (const { id, entryId, items: expectedItems } of ra4Sections) {
      const section = navigationGroup?.sections.find((item) => item.id === id)
      const entry = entriesById.get(entryId)
      const headingIds =
        entry?.blocks.flatMap((block) =>
          block.type === 'heading' ? [headingId(block.content)] : [],
        ) ?? []
      const pitfallCount =
        entry?.blocks
          .filter((block) => block.type === 'pitfalls')
          .reduce((total, block) => total + block.items.length, 0) ?? 0

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

      expect(
        section?.items.map((item) => [
          item.id,
          item.status,
          item.target?.entryId,
          item.target?.anchor,
          item.path,
        ]),
      ).toEqual(
        expectedItems.map(([itemId, anchor]) => [
          itemId,
          'available',
          entryId,
          anchor,
          `/reference/vue/router/navigation/${entryId.split('.').at(-1)}#${anchor}`,
        ]),
      )
      for (const [, anchor] of expectedItems) {
        expect(headingIds, `${entryId}#${anchor}`).toContain(anchor)
      }
    }

    expect(
      [
        'enumerations.errortypes',
        'interfaces.navigationredirecterror',
        'type-aliases.awaitable',
      ].map((id) => [id, itemsById.get(id)?.sourceTag]),
    ).toEqual([
      ['enumerations.errortypes', 'internal'],
      ['interfaces.navigationredirecterror', 'internal'],
      ['type-aliases.awaitable', 'internal'],
    ])
    expect(itemsById.get('interfaces.navigationguardnext')?.sourceTag).toBe('deprecated')
  })
})
