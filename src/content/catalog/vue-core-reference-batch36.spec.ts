import { describe, expect, it } from 'vitest'
import { learningCatalog } from '@/content/catalog'

describe('Vue Core Reference 第 36 批', () => {
  it('十五个内置指令指向单一主题页', () => {
    const overview = learningCatalog.getReferenceOverview({ ecosystem: 'vue', module: 'core' })
    const builtInSections =
      overview?.groups.find((group) => group.id === 'built-ins')?.sections ?? []
    const batchItems =
      builtInSections.find((section) => section.id === 'built-in-directives')?.items ?? []
    const entryId = 'vue.core.reference.built-ins.directives'

    expect(
      batchItems.map((item) => [item.id, item.status, item.target?.entryId, item.target?.anchor]),
    ).toEqual(
      [
        'v-text',
        'v-html',
        'v-show',
        'v-if',
        'v-else',
        'v-else-if',
        'v-for',
        'v-on',
        'v-bind',
        'v-model',
        'v-slot',
        'v-pre',
        'v-once',
        'v-memo',
        'v-cloak',
      ].map((anchor) => [`built-in-directives.${anchor}`, 'available', entryId, anchor]),
    )
  })
})
