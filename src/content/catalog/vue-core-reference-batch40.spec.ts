import { describe, expect, it } from 'vitest'
import { learningCatalog } from '@/content/catalog'

const utilityEntryId = 'vue.core.reference.advanced.utility-types'
const flagsEntryId = 'vue.core.reference.advanced.compile-time-flags'

const batchMappings = [
  ['utility-types.prop-type', utilityEntryId, 'proptypet'],
  ['utility-types.maybe-ref', utilityEntryId, 'maybereft'],
  ['utility-types.maybe-ref-or-getter', utilityEntryId, 'maybereforgettert'],
  ['utility-types.extract-prop-types', utilityEntryId, 'extractproptypest'],
  ['utility-types.extract-public-prop-types', utilityEntryId, 'extractpublicproptypest'],
  ['utility-types.component-custom-properties', utilityEntryId, 'componentcustomproperties'],
  ['utility-types.component-custom-options', utilityEntryId, 'componentcustomoptions'],
  ['utility-types.component-custom-props', utilityEntryId, 'componentcustomprops'],
  ['utility-types.css-properties', utilityEntryId, 'cssproperties'],
  ['compile-time-flags.options-api', flagsEntryId, '__vue_options_api__'],
  ['compile-time-flags.prod-devtools', flagsEntryId, '__vue_prod_devtools__'],
  [
    'compile-time-flags.prod-hydration-mismatch-details',
    flagsEntryId,
    '__vue_prod_hydration_mismatch_details__',
  ],
] as const

describe('Vue Core Reference 第 40 批', () => {
  it('上线 TypeScript 工具类型与编译标志', async () => {
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
    const [utilityEntry, flagsEntry] = await Promise.all([
      learningCatalog.loadEntry(utilityEntryId),
      learningCatalog.loadEntry(flagsEntryId),
    ])
    expect({
      loadedIds: [utilityEntry.meta.id, flagsEntry.meta.id],
      collections: [utilityEntry.meta.collection, flagsEntry.meta.collection],
      utilityHeadings: utilityEntry.blocks
        .filter((block) => block.type === 'heading')
        .map((block) => block.content),
      flagsHeadings: flagsEntry.blocks
        .filter((block) => block.type === 'heading')
        .map((block) => block.content),
      demoIds: [utilityEntry, flagsEntry].flatMap((entry) =>
        entry.blocks.flatMap((block) => (block.type === 'demo' ? [block.id] : [])),
      ),
      pitfalls: [utilityEntry, flagsEntry].map((entry) =>
        entry.blocks
          .filter((block) => block.type === 'pitfalls')
          .reduce((count, block) => count + block.items.length, 0),
      ),
      inferences: [utilityEntry, flagsEntry].map((entry) =>
        entry.blocks
          .filter((block) => block.type === 'steps')
          .reduce((count, block) => count + block.items.length, 0),
      ),
    }).toEqual({
      loadedIds: [utilityEntryId, flagsEntryId],
      collections: ['advanced', 'advanced'],
      utilityHeadings: [
        'PropType<T>',
        'MaybeRef<T>',
        'MaybeRefOrGetter<T>',
        'ExtractPropTypes<T>',
        'ExtractPublicPropTypes<T>',
        'ComponentCustomProperties',
        'ComponentCustomOptions',
        'ComponentCustomProps',
        'CSSProperties',
        '易错使用提示',
        '源码推导与适用场景',
      ],
      flagsHeadings: [
        '编译时标志是什么',
        '__VUE_OPTIONS_API__',
        '__VUE_PROD_DEVTOOLS__',
        '__VUE_PROD_HYDRATION_MISMATCH_DETAILS__',
        '构建配置边界',
        '易错使用提示',
        '源码推导与适用场景',
      ],
      demoIds: [],
      pitfalls: [6, 5],
      inferences: [9, 6],
    })
  })
})
