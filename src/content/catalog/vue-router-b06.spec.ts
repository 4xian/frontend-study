import { describe, expect, it } from 'vitest'
import { learningCatalog } from '@/content/catalog'
import { resolveDemo } from '@/content/interactive/registry'

describe('Vue Router B06 课程', () => {
  it('按顺序开放命名路由、重定向与别名课程，并注册唯一隔离 Demo', async () => {
    const previousEntryId = 'vue.router.learn.basics.composition-programmatic-navigation'
    const entryId = 'vue.router.learn.intermediate.named-routes-redirects-aliases'
    const demoId = `${entryId}.named-routes-redirects-aliases-lab-demo`
    const track = learningCatalog.getLearningTrack({ ecosystem: 'vue', module: 'router' })
    const entry = learningCatalog.getEntry(entryId)

    expect(track?.entries.slice(0, 6).map((item) => item.entryId)).toEqual([
      'vue.router.learn.basics.setup-first-router',
      'vue.router.learn.basics.router-link-view-active',
      'vue.router.learn.basics.route-params-query-matching',
      'vue.router.learn.basics.nested-routes',
      previousEntryId,
      entryId,
    ])
    expect(entry).toMatchObject({
      id: entryId,
      title: '命名路由、重定向与别名',
      collection: 'intermediate',
      prerequisites: [
        'vue.router.learn.basics.route-params-query-matching',
        'vue.router.learn.basics.nested-routes',
        previousEntryId,
      ],
    })

    const lesson = await learningCatalog.loadEntry(entryId)
    const demoBlocks = lesson.blocks.filter((block) => block.type === 'demo')

    expect(lesson.meta.id).toBe(entryId)
    expect(learningCatalog.getNeighbors(entryId).previous?.id).toBe(previousEntryId)
    expect(demoBlocks).toEqual([
      expect.objectContaining({
        type: 'demo',
        id: demoId,
      }),
    ])
    expect(resolveDemo(demoId)).not.toBeNull()
  })
})
