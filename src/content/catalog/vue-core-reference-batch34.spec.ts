import { describe, expect, it } from 'vitest'
import { learningCatalog } from '@/content/catalog'

describe('Vue Core Reference 第 34 批', () => {
  it('Options 组合与杂项八项指向两篇主题页', () => {
    const overview = learningCatalog.getReferenceOverview({ ecosystem: 'vue', module: 'core' })
    const optionsSections =
      overview?.groups.find((group) => group.id === 'options-api')?.sections ?? []
    const batchItems = optionsSections
      .filter((section) => ['options-composition', 'options-misc'].includes(section.id))
      .flatMap((section) => section.items)
    expect(
      batchItems.map((item) => [item.id, item.status, item.target?.entryId, item.target?.anchor]),
    ).toEqual([
      [
        'options-composition.provide',
        'available',
        'vue.core.reference.options-api.composition-options',
        'provide',
      ],
      [
        'options-composition.inject',
        'available',
        'vue.core.reference.options-api.composition-options',
        'inject',
      ],
      [
        'options-composition.mixins',
        'available',
        'vue.core.reference.options-api.composition-options',
        'mixins',
      ],
      [
        'options-composition.extends',
        'available',
        'vue.core.reference.options-api.composition-options',
        'extends',
      ],
      ['options-misc.name', 'available', 'vue.core.reference.options-api.misc-options', 'name'],
      [
        'options-misc.inherit-attrs',
        'available',
        'vue.core.reference.options-api.misc-options',
        'inheritattrs',
      ],
      [
        'options-misc.components',
        'available',
        'vue.core.reference.options-api.misc-options',
        'components',
      ],
      [
        'options-misc.directives',
        'available',
        'vue.core.reference.options-api.misc-options',
        'directives',
      ],
    ])
  })
})
