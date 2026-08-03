import { describe, expect, it } from 'vitest'
import { learningCatalog } from '@/content/catalog'

describe('Vue Core Reference 第 35 批', () => {
  it('组件公共实例十三项指向单一主题页', () => {
    const overview = learningCatalog.getReferenceOverview({ ecosystem: 'vue', module: 'core' })
    const optionsSections =
      overview?.groups.find((group) => group.id === 'options-api')?.sections ?? []
    const batchItems =
      optionsSections.find((section) => section.id === 'component-instance')?.items ?? []
    const entryId = 'vue.core.reference.options-api.component-instance'

    expect(
      batchItems.map((item) => [item.id, item.status, item.target?.entryId, item.target?.anchor]),
    ).toEqual([
      ['component-instance.data', 'available', entryId, 'data'],
      ['component-instance.props', 'available', entryId, 'props'],
      ['component-instance.el', 'available', entryId, 'el'],
      ['component-instance.options', 'available', entryId, 'options'],
      ['component-instance.parent', 'available', entryId, 'parent'],
      ['component-instance.root', 'available', entryId, 'root'],
      ['component-instance.slots', 'available', entryId, 'slots'],
      ['component-instance.refs', 'available', entryId, 'refs'],
      ['component-instance.attrs', 'available', entryId, 'attrs'],
      ['component-instance.watch', 'available', entryId, 'watch'],
      ['component-instance.emit', 'available', entryId, 'emit'],
      ['component-instance.force-update', 'available', entryId, 'forceupdate'],
      ['component-instance.next-tick', 'available', entryId, 'nexttick'],
    ])
  })
})
