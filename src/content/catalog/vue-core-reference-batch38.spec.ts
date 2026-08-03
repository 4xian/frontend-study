import { describe, expect, it } from 'vitest'
import { learningCatalog } from '@/content/catalog'

const scriptSetupEntryId = 'vue.core.reference.single-file-component.script-setup'

const batchMappings = [
  ['sfc-script-setup.basic-syntax', '基本语法'],
  ['sfc-script-setup.reactivity', '响应式'],
  ['sfc-script-setup.using-components', '使用组件'],
  ['sfc-script-setup.using-custom-directives', '使用自定义指令'],
  ['sfc-script-setup.define-props-and-emits', 'defineprops-和-defineemits'],
  ['sfc-script-setup.define-options', 'defineoptions'],
  ['sfc-script-setup.use-slots-and-use-attrs', 'useslots-和-useattrs'],
  ['sfc-script-setup.normal-script', '与普通的-script-一起使用'],
  ['sfc-script-setup.top-level-await', '顶层-await'],
  ['sfc-script-setup.import-statements', '导入语句'],
  ['sfc-script-setup.generics', '泛型'],
  ['sfc-script-setup.restrictions', '限制'],
] as const

const expectedHeadings = [
  '基本语法',
  '响应式',
  '使用组件',
  '使用自定义指令',
  'defineProps() 和 defineEmits()',
  'defineOptions()',
  'useSlots() 和 useAttrs()',
  '与普通的 <script> 一起使用',
  '顶层 await',
  '导入语句',
  '泛型',
  '限制',
]

describe('Vue Core Reference 第 38 批', () => {
  it('公开 script setup 主题', async () => {
    const overview = learningCatalog.getReferenceOverview({ ecosystem: 'vue', module: 'core' })
    const items =
      overview?.groups.flatMap((group) => group.sections.flatMap((section) => section.items)) ?? []
    const itemsById = new Map(items.map((item) => [item.id, item]))
    const navigation = learningCatalog.getNavigation({
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
    ).toEqual(batchMappings.map(([id, anchor]) => [id, 'available', scriptSetupEntryId, anchor]))
    expect(navigation.entries.map((entry) => entry.entryId)).toEqual([
      'vue.core.reference.single-file-component.syntax',
      scriptSetupEntryId,
      'vue.core.reference.single-file-component.css-features',
    ])

    const entry = await learningCatalog.loadEntry(scriptSetupEntryId)
    const headings = entry.blocks
      .filter((block) => block.type === 'heading')
      .map((block) => block.content)
      .filter((heading) => !['易错使用提示', '源码推导与适用场景'].includes(heading))
    const pitfallCount = entry.blocks
      .filter((block) => block.type === 'pitfalls')
      .reduce((total, block) => total + block.items.length, 0)
    const inferenceCount = entry.blocks
      .filter((block) => block.type === 'steps')
      .reduce((total, block) => total + block.items.length, 0)

    expect(headings).toEqual(expectedHeadings)
    expect(pitfallCount).toBe(9)
    expect(inferenceCount).toBe(11)
    expect(
      entry.blocks.every((block) => block.type !== 'demo' && block.type !== 'interactive'),
    ).toBe(true)
  })
})
