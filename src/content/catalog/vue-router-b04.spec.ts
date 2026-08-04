import { describe, expect, it } from 'vitest'
import { learningCatalog } from '@/content/catalog'
import { resolveDemo } from '@/content/interactive/registry'

describe('Vue Router B04 课程', () => {
  it('按顺序开放嵌套路由课程，并注册唯一隔离 Demo', async () => {
    const firstEntryId = 'vue.router.learn.basics.setup-first-router'
    const linkViewEntryId = 'vue.router.learn.basics.router-link-view-active'
    const matchingEntryId = 'vue.router.learn.basics.route-params-query-matching'
    const entryId = 'vue.router.learn.basics.nested-routes'
    const demoId = `${entryId}.nested-routes-lab-demo`
    const track = learningCatalog.getLearningTrack({ ecosystem: 'vue', module: 'router' })
    const entry = learningCatalog.getEntry(entryId)

    expect(track?.stages[0]?.entries.slice(0, 4).map((item) => item.entryId)).toEqual([
      firstEntryId,
      linkViewEntryId,
      matchingEntryId,
      entryId,
    ])
    expect(entry).toMatchObject({
      id: entryId,
      title: '嵌套路由',
      prerequisites: [linkViewEntryId, matchingEntryId],
    })

    const lesson = await learningCatalog.loadEntry(entryId)
    const demoBlocks = lesson.blocks.filter((block) => block.type === 'demo')

    expect(lesson.meta.id).toBe(entryId)
    expect(learningCatalog.getNeighbors(entryId).previous?.id).toBe(matchingEntryId)
    expect(demoBlocks).toEqual([
      expect.objectContaining({
        type: 'demo',
        id: demoId,
      }),
    ])
    expect(resolveDemo(demoId)).not.toBeNull()
  })
})
