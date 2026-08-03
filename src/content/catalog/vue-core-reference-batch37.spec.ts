import { describe, expect, it } from 'vitest'
import { learningCatalog } from '@/content/catalog'

const templateEntryId = 'vue.core.reference.built-ins.template-primitives'
const sfcEntryId = 'vue.core.reference.single-file-component.syntax'

const batchMappings = [
  ['built-in-special-elements.component', templateEntryId, 'component'],
  ['built-in-special-elements.template', templateEntryId, 'template'],
  ['built-in-special-attributes.key', templateEntryId, 'key'],
  ['built-in-special-attributes.is', templateEntryId, 'is'],
  ['sfc-spec.overview', sfcEntryId, '总览'],
  ['sfc-spec.language-blocks', sfcEntryId, '相应语言块'],
  ['sfc-spec.automatic-name-inference', sfcEntryId, '自动名称推导'],
  ['sfc-spec.pre-processors', sfcEntryId, '预处理器'],
  ['sfc-spec.src-imports', sfcEntryId, 'src-导入'],
  ['sfc-spec.comments', sfcEntryId, '注释'],
] as const

describe('Vue Core Reference 第 37 批', () => {
  it('公开模板原语与 SFC 语法', async () => {
    const overview = learningCatalog.getReferenceOverview({ ecosystem: 'vue', module: 'core' })
    const items =
      overview?.groups.flatMap((group) => group.sections.flatMap((section) => section.items)) ?? []
    const itemsById = new Map(items.map((item) => [item.id, item]))
    const navigation = learningCatalog.getNavigation({
      purpose: 'reference',
      ecosystem: 'vue',
      module: 'core',
    })
    const builtInsNavigation = learningCatalog.getNavigation({
      purpose: 'reference',
      ecosystem: 'vue',
      module: 'core',
      collection: 'built-ins',
    })
    const sfcNavigation = learningCatalog.getNavigation({
      purpose: 'reference',
      ecosystem: 'vue',
      module: 'core',
      collection: 'single-file-component',
    })

    expect(
      batchMappings.map(([id]) => {
        const item = itemsById.get(id)
        return [item?.id, item?.status, item?.target?.entryId, item?.target?.anchor]
      }),
    ).toEqual(batchMappings.map(([id, entryId, anchor]) => [id, 'available', entryId, anchor]))
    expect(navigation.collections).toHaveLength(9)
    expect(builtInsNavigation.entries.map((entry) => entry.entryId)).toContain(templateEntryId)
    expect(sfcNavigation.entries.map((entry) => entry.entryId)).toContain(sfcEntryId)

    const [templateEntry, sfcEntry] = await Promise.all([
      learningCatalog.loadEntry(templateEntryId),
      learningCatalog.loadEntry(sfcEntryId),
    ])
    const expectedHeadings = [
      ['<component>', '<template>', 'key', 'is'],
      ['总览', '相应语言块', '自动名称推导', '预处理器', 'src 导入', '注释'],
    ]
    const entries = [templateEntry, sfcEntry]

    expect(
      entries.map((entry) =>
        entry.blocks
          .filter((block) => block.type === 'heading')
          .map((block) => block.content)
          .filter((heading) => !['易错使用提示', '源码推导与适用场景'].includes(heading)),
      ),
    ).toEqual(expectedHeadings)
    expect(
      entries.map((entry) =>
        entry.blocks
          .filter((block) => block.type === 'pitfalls')
          .reduce((total, block) => total + block.items.length, 0),
      ),
    ).toEqual([6, 4])
    expect(
      entries.map((entry) =>
        entry.blocks
          .filter((block) => block.type === 'steps')
          .reduce((total, block) => total + block.items.length, 0),
      ),
    ).toEqual([5, 5])
    expect(
      entries.every((entry) =>
        entry.blocks.every((block) => block.type !== 'demo' && block.type !== 'interactive'),
      ),
    ).toBe(true)
  })
})
