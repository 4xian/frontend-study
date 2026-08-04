import { describe, expect, it } from 'vitest'
import { headingId } from '@/components/blocks/heading-id'
import { learningCatalog } from '@/content/catalog'

const createRouterEntryId = 'vue.router.reference.configuration.create-router'
const routerInstanceEntryId = 'vue.router.reference.configuration.router-instance'
const historyEntryId = 'vue.router.reference.configuration.history'

const ra1Mappings = [
  ['interfaces.routerclassic', routerInstanceEntryId, 'router-classic'],
  ['interfaces.historystate', historyEntryId, 'history-state'],
  ['interfaces.routerhistory', historyEntryId, 'router-history'],
  ['interfaces.routeroptions', createRouterEntryId, 'router-options'],
  ['interfaces.routerscrollbehavior', historyEntryId, 'router-scroll-behavior'],
  ['type-aliases.router', routerInstanceEntryId, 'router'],
  ['functions.creatememoryhistory', historyEntryId, 'create-memory-history'],
  ['functions.createrouter', createRouterEntryId, 'create-router'],
  ['functions.createwebhashhistory', historyEntryId, 'create-web-hash-history'],
  ['functions.createwebhistory', historyEntryId, 'create-web-history'],
] as const

/** 将计数维度转换为稳定对象，避免测试依赖条目排列细节。 */
function countBy<T>(values: T[], select: (value: T) => string): Record<string, number> {
  return values.reduce<Record<string, number>>((counts, value) => {
    const key = select(value)
    counts[key] = (counts[key] ?? 0) + 1
    return counts
  }, {})
}

describe('Vue Router Reference RA1', () => {
  it('登记完整稳定索引，并保持配置、实例与 history 的 10 项可用', async () => {
    const overview = learningCatalog.getReferenceOverview({ ecosystem: 'vue', module: 'router' })
    const items =
      overview?.groups.flatMap((group) => group.sections.flatMap((section) => section.items)) ?? []
    const itemsById = new Map(items.map((item) => [item.id, item]))
    const plannedItems = items.filter((item) => item.status === 'planned')

    expect({
      total: overview?.total,
      groups: overview?.groups.map((group) => [
        group.title,
        group.sections.reduce((total, section) => total + section.items.length, 0),
      ]),
      sourceTags: countBy(items, (item) => item.sourceTag ?? 'missing'),
      depths: countBy(items, (item) => item.depth),
    }).toEqual({
      total: 118,
      groups: [
        ['Configuration', 10],
        ['Matching', 58],
        ['Components & Composables', 17],
        ['Navigation', 14],
        ['Typed & File-Based', 19],
      ],
      sourceTags: { public: 81, internal: 35, alpha: 1, deprecated: 1 },
      depths: { quick: 37, detail: 25, merged: 56 },
    })
    expect(
      ra1Mappings.map(([id]) => {
        const item = itemsById.get(id)
        return [item?.id, item?.status, item?.target?.entryId, item?.target?.anchor, item?.path]
      }),
    ).toEqual(
      ra1Mappings.map(([id, entryId, anchor]) => [
        id,
        'available',
        entryId,
        anchor,
        `/reference/vue/router/configuration/${entryId.split('.').at(-1)}#${anchor}`,
      ]),
    )
    expect(plannedItems.every((item) => item.target === undefined && item.path === undefined)).toBe(
      true,
    )

    const navigation = learningCatalog.getNavigation({
      purpose: 'reference',
      ecosystem: 'vue',
      module: 'router',
      collection: 'configuration',
    })
    expect(navigation.entries.map((entry) => entry.entryId)).toEqual([
      createRouterEntryId,
      routerInstanceEntryId,
      historyEntryId,
    ])

    const entries = await Promise.all(
      [createRouterEntryId, routerInstanceEntryId, historyEntryId].map((id) =>
        learningCatalog.loadEntry(id),
      ),
    )
    expect(entries.map((entry) => entry.meta.collection)).toEqual([
      'configuration',
      'configuration',
      'configuration',
    ])
    expect(
      entries.map((entry) =>
        entry.blocks
          .filter((block) => block.type === 'pitfalls')
          .reduce((total, block) => total + block.items.length, 0),
      ),
    ).toEqual([5, 7, 6])
    expect(
      entries.flatMap((entry) =>
        entry.blocks.flatMap((block) => (block.type === 'demo' ? [block.id] : [])),
      ),
    ).toEqual([])
    expect(
      entries.every((entry) => 'signature' in entry && entry.signature.trim().length > 0),
    ).toBe(true)

    const entriesById = new Map(entries.map((entry) => [entry.meta.id, entry]))
    for (const [, entryId, anchor] of ra1Mappings) {
      const entry = entriesById.get(entryId)
      const headingIds =
        entry?.blocks.flatMap((block) =>
          block.type === 'heading' ? [headingId(block.content)] : [],
        ) ?? []
      expect(new Set(headingIds).size, entryId).toBe(headingIds.length)
      expect(headingIds, `${entryId}#${anchor}`).toContain(anchor)
      expect(
        entry?.meta.sources.some((source) => source.url.includes('router.vuejs.org/api')),
      ).toBe(true)
      expect(
        entry?.meta.sources.some((source) =>
          source.url.includes('6e5f8d253b9444a76eb58f176ebe08d686c937cb'),
        ),
      ).toBe(true)
    }
    expect(
      entries.map((entry) =>
        entry.blocks
          .filter((block) => block.type === 'heading')
          .map((block) => block.content)
          .filter((heading) => ['易错使用提示', '源码推导与适用场景'].includes(heading)),
      ),
    ).toEqual([
      ['易错使用提示', '源码推导与适用场景'],
      ['易错使用提示', '源码推导与适用场景'],
      ['易错使用提示', '源码推导与适用场景'],
    ])

    const routerEntry = entries[1]
    const routerText = routerEntry?.blocks
      .flatMap((block) => ('content' in block ? [block.content] : []))
      .join('\n')
    expect(routerText).toContain('19 个公开成员')
    expect(routerText).toContain('app.use(router)')
    expect(routerText).toContain('不得手动调用')
  })
})
