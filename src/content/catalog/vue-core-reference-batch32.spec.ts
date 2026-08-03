import { describe, expect, it } from 'vitest'
import { learningCatalog } from '@/content/catalog'

describe('Vue Core Reference 第 32 批', () => {
  it('Options 状态与渲染的十一项均指向两篇正文的唯一锚点', () => {
    const overview = learningCatalog.getReferenceOverview({ ecosystem: 'vue', module: 'core' })
    const batchItems =
      overview?.groups
        .find((group) => group.id === 'options-api')
        ?.sections.filter((section) => ['options-state', 'options-rendering'].includes(section.id))
        .flatMap((section) => section.items) ?? []
    expect(
      batchItems.map((item) => ({
        id: item.id,
        status: item.status,
        entryId: item.target?.entryId,
        anchor: item.target?.anchor,
      })),
    ).toEqual([
      {
        id: 'options-state.data',
        status: 'available',
        entryId: 'vue.core.reference.options-api.state-options',
        anchor: 'data',
      },
      {
        id: 'options-state.props',
        status: 'available',
        entryId: 'vue.core.reference.options-api.state-options',
        anchor: 'props',
      },
      {
        id: 'options-state.computed',
        status: 'available',
        entryId: 'vue.core.reference.options-api.state-options',
        anchor: 'computed',
      },
      {
        id: 'options-state.methods',
        status: 'available',
        entryId: 'vue.core.reference.options-api.state-options',
        anchor: 'methods',
      },
      {
        id: 'options-state.watch',
        status: 'available',
        entryId: 'vue.core.reference.options-api.state-options',
        anchor: 'watch',
      },
      {
        id: 'options-state.emits',
        status: 'available',
        entryId: 'vue.core.reference.options-api.state-options',
        anchor: 'emits',
      },
      {
        id: 'options-state.expose',
        status: 'available',
        entryId: 'vue.core.reference.options-api.state-options',
        anchor: 'expose',
      },
      {
        id: 'options-rendering.template',
        status: 'available',
        entryId: 'vue.core.reference.options-api.rendering-options',
        anchor: 'template',
      },
      {
        id: 'options-rendering.render',
        status: 'available',
        entryId: 'vue.core.reference.options-api.rendering-options',
        anchor: 'render',
      },
      {
        id: 'options-rendering.compiler-options',
        status: 'available',
        entryId: 'vue.core.reference.options-api.rendering-options',
        anchor: 'compileroptions',
      },
      {
        id: 'options-rendering.slots',
        status: 'available',
        entryId: 'vue.core.reference.options-api.rendering-options',
        anchor: 'slots',
      },
    ])
  })
})
