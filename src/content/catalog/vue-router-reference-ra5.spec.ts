import { describe, expect, it } from 'vitest'
import { headingId } from '@/components/blocks/heading-id'
import { learningCatalog } from '@/content/catalog'

const ra5Entries = [
  ['typed-routes', 'vue.router.reference.typed-routes.route-map'],
  ['file-based', 'vue.router.reference.file-based.overview'],
  ['file-based', 'vue.router.reference.file-based.virtual-modules'],
  ['tooling', 'vue.router.reference.tooling.unplugin'],
  ['tooling', 'vue.router.reference.tooling.volar-migration'],
] as const

const packageExportKeys = [
  '.',
  './vetur/*',
  './package.json',
  './experimental',
  './experimental/pinia-colada',
  './auto-resolver',
  './auto-routes',
  './auto',
  './vite',
  './unplugin',
  './unplugin/*',
  './volar/sfc-route-blocks',
  './volar/sfc-typed-router',
  './dist/*',
] as const

describe('Vue Router Reference RA5', () => {
  it('上线最后 19 项并覆盖固定包导出入口', async () => {
    const overview = learningCatalog.getReferenceOverview({ ecosystem: 'vue', module: 'router' })
    const groups = overview?.groups ?? []
    const items = groups.flatMap((group) => group.sections.flatMap((section) => section.items))
    const typedGroup = groups.find((group) => group.id === 'typed-file-based')
    const typedItems = typedGroup?.sections.flatMap((section) => section.items) ?? []

    expect({ available: overview?.availableCount, total: overview?.total }).toEqual({
      available: 118,
      total: 118,
    })
    expect(items.filter((item) => item.status === 'planned')).toEqual([])
    expect(typedGroup?.sections.map((section) => [section.id, section.items.length])).toEqual([
      ['route-map', 19],
    ])
    expect(typedItems.every((item) => item.status === 'available')).toBe(true)

    const stableTargetIds = new Set(
      items.flatMap((item) => (item.target ? [item.target.entryId] : [])),
    )
    expect(stableTargetIds.size).toBe(14)

    const stableEntries = await Promise.all(
      [...stableTargetIds].map((entryId) => learningCatalog.loadEntry(entryId)),
    )
    const stableEntriesById = new Map(stableEntries.map((entry) => [entry.meta.id, entry]))
    for (const item of items) {
      expect(item.target, item.id).toBeDefined()
      if (!item.target) continue

      const entry = stableEntriesById.get(item.target.entryId)
      const headingIds =
        entry?.blocks.flatMap((block) =>
          block.type === 'heading' ? [headingId(block.content)] : [],
        ) ?? []
      expect(headingIds, item.id).toContain(item.target.anchor)
      expect(item.path, item.id).toContain(`#${item.target.anchor}`)
    }

    for (const collection of ['typed-routes', 'file-based', 'tooling'] as const) {
      const navigation = learningCatalog.getNavigation({
        purpose: 'reference',
        ecosystem: 'vue',
        module: 'router',
        collection,
      })
      expect(navigation.entries.map((entry) => entry.entryId)).toEqual(
        ra5Entries
          .filter(([entryCollection]) => entryCollection === collection)
          .map(([, entryId]) => entryId),
      )
    }

    const ra5LoadedEntries = await Promise.all(
      ra5Entries.map(([, entryId]) => learningCatalog.loadEntry(entryId)),
    )
    expect(ra5LoadedEntries.map((entry) => entry.meta.collection)).toEqual(
      ra5Entries.map(([collection]) => collection),
    )
    expect(
      ra5LoadedEntries.every(
        (entry) =>
          'signature' in entry &&
          entry.signature.trim().length > 0 &&
          entry.meta.anchors?.includes('易错使用提示') &&
          entry.meta.anchors.includes('源码推导与适用场景'),
      ),
    ).toBe(true)
    expect(
      ra5LoadedEntries.flatMap((entry) =>
        entry.blocks.flatMap((block) => (block.type === 'demo' ? [block.id] : [])),
      ),
    ).toEqual([])

    const documentedExportKeys = new Set(
      ra5LoadedEntries.flatMap((entry) =>
        entry.blocks.flatMap((block) =>
          block.type === 'table' ? block.rows.flatMap((row) => row) : [],
        ),
      ),
    )
    expect(packageExportKeys.filter((key) => documentedExportKeys.has(key))).toEqual(
      packageExportKeys,
    )
  })
})
