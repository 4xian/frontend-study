import { describe, expect, it } from 'vitest'
import { learningCatalog } from '@/content/catalog'
import { resolveDemo } from '@/content/interactive/registry'

describe('Vue Router B05 课程', () => {
  it('按顺序开放组合式 API 与编程式导航课程，并注册唯一隔离 Demo', async () => {
    const firstEntryId = 'vue.router.learn.basics.setup-first-router'
    const linkViewEntryId = 'vue.router.learn.basics.router-link-view-active'
    const matchingEntryId = 'vue.router.learn.basics.route-params-query-matching'
    const nestedEntryId = 'vue.router.learn.basics.nested-routes'
    const entryId = 'vue.router.learn.basics.composition-programmatic-navigation'
    const demoId = `${entryId}.composition-navigation-lab-demo`
    const track = learningCatalog.getLearningTrack({ ecosystem: 'vue', module: 'router' })
    const entry = learningCatalog.getEntry(entryId)

    expect(track?.stages[0]?.entries.slice(0, 5).map((item) => item.entryId)).toEqual([
      firstEntryId,
      linkViewEntryId,
      matchingEntryId,
      nestedEntryId,
      entryId,
    ])
    expect(entry).toMatchObject({
      id: entryId,
      title: '组合式 API 与编程式导航',
      prerequisites: [matchingEntryId, nestedEntryId],
    })

    const lesson = await learningCatalog.loadEntry(entryId)
    const demoBlocks = lesson.blocks.filter((block) => block.type === 'demo')

    expect(lesson.meta.id).toBe(entryId)
    expect(learningCatalog.getNeighbors(entryId).previous?.id).toBe(nestedEntryId)
    expect(demoBlocks).toEqual([
      expect.objectContaining({
        type: 'demo',
        id: demoId,
      }),
    ])
    expect(resolveDemo(demoId)).not.toBeNull()
  })
})
