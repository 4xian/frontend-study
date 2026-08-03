import { describe, expect, it } from 'vitest'
import { learningCatalog } from '@/content/catalog'

const cssEntryId = 'vue.core.reference.single-file-component.css-features'
const renderEntryId = 'vue.core.reference.advanced.render-function'

const batchMappings = [
  ['sfc-css-features.scoped-css', cssEntryId, '组件作用域-css'],
  ['sfc-css-features.css-modules', cssEntryId, 'css-modules'],
  ['sfc-css-features.v-bind-in-css', cssEntryId, 'css-中的-v-bind'],
  ['render-function.merge-props', renderEntryId, 'mergeprops'],
  ['render-function.clone-vnode', renderEntryId, 'clonevnode'],
  ['render-function.is-vnode', renderEntryId, 'isvnode'],
  ['render-function.resolve-directive', renderEntryId, 'resolvedirective'],
  ['render-function.with-directives', renderEntryId, 'withdirectives'],
] as const

describe('Vue Core Reference 第 39 批', () => {
  it('公开 SFC CSS 与渲染辅助', async () => {
    const overview = learningCatalog.getReferenceOverview({ ecosystem: 'vue', module: 'core' })
    const items =
      overview?.groups.flatMap((group) => group.sections.flatMap((section) => section.items)) ?? []
    const itemsById = new Map(items.map((item) => [item.id, item]))
    const sfcNavigation = learningCatalog.getNavigation({
      purpose: 'reference',
      ecosystem: 'vue',
      module: 'core',
      collection: 'single-file-component',
    })
    const sfcEntries = await Promise.all(
      sfcNavigation.entries.map((entry) => learningCatalog.loadEntry(entry.entryId)),
    )

    expect(
      batchMappings.map(([id]) => {
        const item = itemsById.get(id)
        return [item?.id, item?.status, item?.target?.entryId, item?.target?.anchor]
      }),
    ).toEqual(batchMappings.map(([id, entryId, anchor]) => [id, 'available', entryId, anchor]))
    expect(sfcNavigation.entries.map((entry) => entry.entryId)).toEqual([
      'vue.core.reference.single-file-component.syntax',
      'vue.core.reference.single-file-component.script-setup',
      cssEntryId,
    ])
    expect({
      loadedIds: sfcEntries.map((entry) => entry.meta.id),
      collections: sfcEntries.map((entry) => entry.meta.collection),
      demoIds: sfcEntries.flatMap((entry) =>
        entry.blocks.flatMap((block) => (block.type === 'demo' ? [block.id] : [])),
      ),
    }).toEqual({
      loadedIds: sfcNavigation.entries.map((entry) => entry.entryId),
      collections: ['single-file-component', 'single-file-component', 'single-file-component'],
      demoIds: [],
    })

    const [cssEntry, renderEntry] = await Promise.all([
      learningCatalog.loadEntry(cssEntryId),
      learningCatalog.loadEntry(renderEntryId),
    ])
    const cssHeadings = cssEntry.blocks
      .filter((block) => block.type === 'heading')
      .map((block) => block.content)
    const renderHeadings = renderEntry.blocks
      .filter((block) => block.type === 'heading')
      .map((block) => block.content)
    const pitfallCounts = [cssEntry, renderEntry].map((entry) =>
      entry.blocks
        .filter((block) => block.type === 'pitfalls')
        .reduce((total, block) => total + block.items.length, 0),
    )
    const inferenceCounts = [cssEntry, renderEntry].map((entry) =>
      entry.blocks
        .filter((block) => block.type === 'steps')
        .reduce((total, block) => total + block.items.length, 0),
    )

    expect(cssHeadings).toEqual([
      '组件作用域 CSS',
      'CSS Modules',
      'CSS 中的 v-bind()',
      '易错使用提示',
      '源码推导与适用场景',
    ])
    expect(renderHeadings).toEqual(
      expect.arrayContaining([
        'mergeProps()',
        'cloneVNode()',
        'isVNode()',
        'resolveDirective()',
        'withDirectives()',
      ]),
    )
    expect(pitfallCounts).toEqual([4, 10])
    expect(inferenceCounts).toEqual([5, 6])
    expect(cssEntry.blocks.every((block) => block.type !== 'demo')).toBe(true)
  })
})
