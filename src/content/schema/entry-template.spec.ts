import { describe, expect, it } from 'vitest'
import { headingId } from '@/components/blocks/heading-id'
import { vueCoreReferenceIndexManifest } from '@/content/catalog/manifests/vue-core-reference-index'
import type { ContentBlock } from './blocks'
import type { LessonEntry, ReferenceEntry } from './entries'

const referenceModules = import.meta.glob<{ default: ReferenceEntry }>(
  '../entries/reference/**/*.ts',
  { eager: true },
)

const lessonModules = import.meta.glob<{ default: LessonEntry }>('../entries/learn/**/*.ts', {
  eager: true,
})

/** 校验条目包含数量合理且内容完整的结构化易错提示。 */
function expectStructuredPitfalls(path: string, blocks: ContentBlock[]): void {
  const pitfallIndex = blocks.findIndex(
    (block) => block.type === 'heading' && block.content === '易错使用提示',
  )
  const pitfalls = blocks[pitfallIndex + 1]

  expect(pitfallIndex, path).toBeGreaterThanOrEqual(0)
  expect(pitfalls, path).toMatchObject({ type: 'pitfalls' })
  if (pitfalls?.type !== 'pitfalls') return

  expect(pitfalls.items.length, path).toBeGreaterThanOrEqual(1)
  expect(pitfalls.items.length, path).toBeLessThanOrEqual(10)
  for (const item of pitfalls.items) {
    expect(item.title.trim(), path).not.toBe('')
    expect(item.description.trim(), path).not.toBe('')
    expect(item.consequence.trim(), path).not.toBe('')
    expect(item.wrong.content.trim(), path).not.toBe('')
    expect(item.correct.content.trim(), path).not.toBe('')
  }
}

describe('参考条目模板', () => {
  it.each(Object.entries(referenceModules))('%s 包含可定位的结构化易错使用提示', (path, module) => {
    const entry = module.default
    expect(entry.signature?.trim(), path).toBeTruthy()
    expectStructuredPitfalls(path, entry.blocks)
    expect(entry.meta.anchors, path).toContain('易错使用提示')
  })

  it('已上线 Vue Core API 索引项均指向真实正文和标题锚点', () => {
    const entriesById = new Map(
      Object.values(referenceModules).map((module) => [module.default.meta.id, module.default]),
    )
    const availableItems = vueCoreReferenceIndexManifest.groups.flatMap((group) =>
      group.sections.flatMap((section) =>
        section.items.filter((item) => item.status === 'available'),
      ),
    )
    const useIdItem = availableItems.find((item) => item.id === 'composition-api-helpers.use-id')
    const createSsrAppItem = availableItems.find((item) => item.id === 'application.create-ssr-app')
    const idPrefixItem = availableItems.find(
      (item) => item.id === 'application.app-config-id-prefix',
    )

    expect(useIdItem?.target?.anchor).toBe('概述')
    expect(createSsrAppItem?.target).toEqual({
      entryId: 'vue.core.reference.application.create-ssr-app',
      anchor: '概述',
    })
    expect(idPrefixItem?.target).toEqual({
      entryId: 'vue.core.reference.application.application-configuration',
      anchor: 'appconfigidprefix',
    })

    for (const item of availableItems) {
      const entry = entriesById.get(item.target?.entryId ?? '')
      expect(entry, item.id).toBeDefined()
      if (!entry || !item.target?.anchor) continue

      const headingIds = entry.blocks.flatMap((block) =>
        block.type === 'heading' ? [headingId(block.content)] : [],
      )
      expect(headingIds, item.id).toContain(item.target.anchor)
    }
  })
})

describe('课程条目模板', () => {
  it.each(Object.entries(lessonModules))(
    '%s 包含目标、总结和结构化易错使用提示',
    (path, module) => {
      const entry = module.default

      expect(entry.objectives.length, path).toBeGreaterThan(0)
      expect(entry.recap?.length, path).toBeGreaterThan(0)
      expectStructuredPitfalls(path, entry.blocks)
    },
  )
})
