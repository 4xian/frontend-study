import { describe, expect, it } from 'vitest'
import { learningCatalog } from '@/content/catalog'

const customElementsEntryId = 'vue.core.reference.advanced.custom-elements'
const serverRenderingEntryId = 'vue.core.reference.advanced.server-rendering'
const customRendererEntryId = 'vue.core.reference.advanced.custom-renderer'

const batchMappings = [
  ['custom-elements.define-custom-element', customElementsEntryId, 'definecustomelement'],
  ['custom-elements.use-host', customElementsEntryId, 'usehost'],
  ['custom-elements.use-shadow-root', customElementsEntryId, 'useshadowroot'],
  ['custom-elements.host', customElementsEntryId, 'thishost'],
  ['ssr.render-to-string', serverRenderingEntryId, 'rendertostring'],
  ['ssr.render-to-node-stream', serverRenderingEntryId, 'rendertonodestream'],
  ['ssr.pipe-to-node-writable', serverRenderingEntryId, 'pipetonodewritable'],
  ['ssr.render-to-web-stream', serverRenderingEntryId, 'rendertowebstream'],
  ['ssr.pipe-to-web-writable', serverRenderingEntryId, 'pipetowebwritable'],
  ['ssr.render-to-simple-stream', serverRenderingEntryId, 'rendertosimplestream'],
  ['ssr.use-ssr-context', serverRenderingEntryId, 'usessrcontext'],
  ['ssr.data-allow-mismatch', serverRenderingEntryId, 'data-allow-mismatch'],
  ['custom-renderer.create-renderer', customRendererEntryId, 'createrenderer'],
] as const

const expectedHeadings = {
  [customElementsEntryId]: [
    'defineCustomElement()',
    'useHost()',
    'useShadowRoot()',
    'this.$host',
    '3.5+ 配置选项',
    '易错使用提示',
    '源码推导与适用场景',
  ],
  [serverRenderingEntryId]: [
    'renderToString()',
    'renderToNodeStream()',
    'pipeToNodeWritable()',
    'renderToWebStream()',
    'pipeToWebWritable()',
    'renderToSimpleStream()',
    'useSSRContext()',
    'data-allow-mismatch',
    '运行环境选择',
    '易错使用提示',
    '源码推导与适用场景',
  ],
  [customRendererEntryId]: [
    'createRenderer()',
    'Host operations 契约',
    '返回的 render 与 createApp',
    'Hydration 能力边界',
    '易错使用提示',
    '源码推导与适用场景',
  ],
} as const

describe('Vue Core Reference 第 41 批', () => {
  it('上线平台边界三篇速查并关闭 Vue Core API 补全范围', async () => {
    const overview = learningCatalog.getReferenceOverview({ ecosystem: 'vue', module: 'core' })
    const items =
      overview?.groups.flatMap((group) => group.sections.flatMap((section) => section.items)) ?? []
    const itemsById = new Map(items.map((item) => [item.id, item]))

    expect(
      batchMappings.map(([id]) => {
        const item = itemsById.get(id)
        return [item?.id, item?.status, item?.target?.entryId, item?.target?.anchor]
      }),
    ).toEqual(batchMappings.map(([id, entryId, anchor]) => [id, 'available', entryId, anchor]))
    expect({
      available: overview?.availableCount,
      planned: items.filter((item) => item.status === 'planned').length,
      total: overview?.total,
    }).toEqual({ available: 206, planned: 0, total: 206 })

    const entryIds = [customElementsEntryId, serverRenderingEntryId, customRendererEntryId] as const
    const entries = await Promise.all(entryIds.map((entryId) => learningCatalog.loadEntry(entryId)))

    expect(entries.map((entry) => entry.meta.id)).toEqual(entryIds)
    expect(entries.map((entry) => entry.meta.collection)).toEqual([
      'advanced',
      'advanced',
      'advanced',
    ])
    expect(
      Object.fromEntries(
        entries.map((entry) => [
          entry.meta.id,
          entry.blocks.filter((block) => block.type === 'heading').map((block) => block.content),
        ]),
      ),
    ).toEqual(expectedHeadings)
    expect(
      entries.flatMap((entry) =>
        entry.blocks.flatMap((block) => (block.type === 'demo' ? [block.id] : [])),
      ),
    ).toEqual([])
    expect(
      entries.map((entry) =>
        entry.blocks
          .filter((block) => block.type === 'pitfalls')
          .reduce((count, block) => count + block.items.length, 0),
      ),
    ).toEqual([6, 7, 5])
    expect(
      entries.map((entry) =>
        entry.blocks
          .filter((block) => block.type === 'steps')
          .reduce((count, block) => count + block.items.length, 0),
      ),
    ).toEqual([6, 8, 6])
    expect(overview?.groups).toHaveLength(6)
    expect(overview?.groups.flatMap((group) => group.sections)).toHaveLength(28)
  })
})
