import { describe, expect, it } from 'vitest'
import { learningCatalog } from '@/content/catalog'
import { resolveDemo } from '@/content/interactive/registry'

describe('Vue Router B08 课程', () => {
  it('按顺序开放路由 Meta 与导航守卫课程，并注册唯一隔离 Demo', async () => {
    const previousEntryId = 'vue.router.learn.intermediate.named-views-route-props'
    const entryId = 'vue.router.learn.intermediate.meta-navigation-guards'
    const demoId = `${entryId}.meta-navigation-guards-lab-demo`
    const track = learningCatalog.getLearningTrack({ ecosystem: 'vue', module: 'router' })
    const entry = learningCatalog.getEntry(entryId)

    expect(track?.entries.slice(0, 8).map((item) => item.entryId)).toEqual([
      'vue.router.learn.basics.setup-first-router',
      'vue.router.learn.basics.router-link-view-active',
      'vue.router.learn.basics.route-params-query-matching',
      'vue.router.learn.basics.nested-routes',
      'vue.router.learn.basics.composition-programmatic-navigation',
      'vue.router.learn.intermediate.named-routes-redirects-aliases',
      previousEntryId,
      entryId,
    ])
    expect(entry).toMatchObject({
      id: entryId,
      title: '路由 Meta 与导航守卫',
      collection: 'intermediate',
      prerequisites: [
        'vue.router.learn.basics.composition-programmatic-navigation',
        'vue.router.learn.intermediate.named-routes-redirects-aliases',
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
