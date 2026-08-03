import { describe, expect, it } from 'vitest'
import { learningCatalog } from '@/content/catalog'

describe('Vue Core Reference 第 33 批', () => {
  it('Options 生命周期十四项持续指向单一主题页', () => {
    const overview = learningCatalog.getReferenceOverview({ ecosystem: 'vue', module: 'core' })
    const optionsSections =
      overview?.groups.find((group) => group.id === 'options-api')?.sections ?? []
    const batchItems =
      optionsSections.find((section) => section.id === 'options-lifecycle')?.items ?? []
    expect(
      batchItems.map((item) => [item.id, item.status, item.target?.entryId, item.target?.anchor]),
    ).toEqual([
      [
        'options-lifecycle.before-create',
        'available',
        'vue.core.reference.options-api.lifecycle-options',
        'beforecreate',
      ],
      [
        'options-lifecycle.created',
        'available',
        'vue.core.reference.options-api.lifecycle-options',
        'created',
      ],
      [
        'options-lifecycle.before-mount',
        'available',
        'vue.core.reference.options-api.lifecycle-options',
        'beforemount',
      ],
      [
        'options-lifecycle.mounted',
        'available',
        'vue.core.reference.options-api.lifecycle-options',
        'mounted',
      ],
      [
        'options-lifecycle.before-update',
        'available',
        'vue.core.reference.options-api.lifecycle-options',
        'beforeupdate',
      ],
      [
        'options-lifecycle.updated',
        'available',
        'vue.core.reference.options-api.lifecycle-options',
        'updated',
      ],
      [
        'options-lifecycle.before-unmount',
        'available',
        'vue.core.reference.options-api.lifecycle-options',
        'beforeunmount',
      ],
      [
        'options-lifecycle.unmounted',
        'available',
        'vue.core.reference.options-api.lifecycle-options',
        'unmounted',
      ],
      [
        'options-lifecycle.error-captured',
        'available',
        'vue.core.reference.options-api.lifecycle-options',
        'errorcaptured',
      ],
      [
        'options-lifecycle.render-tracked',
        'available',
        'vue.core.reference.options-api.lifecycle-options',
        'rendertracked',
      ],
      [
        'options-lifecycle.render-triggered',
        'available',
        'vue.core.reference.options-api.lifecycle-options',
        'rendertriggered',
      ],
      [
        'options-lifecycle.activated',
        'available',
        'vue.core.reference.options-api.lifecycle-options',
        'activated',
      ],
      [
        'options-lifecycle.deactivated',
        'available',
        'vue.core.reference.options-api.lifecycle-options',
        'deactivated',
      ],
      [
        'options-lifecycle.server-prefetch',
        'available',
        'vue.core.reference.options-api.lifecycle-options',
        'serverprefetch',
      ],
    ])
  })
})
