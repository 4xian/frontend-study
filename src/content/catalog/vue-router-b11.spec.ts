import { describe, expect, it } from 'vitest'
import { learningCatalog } from '@/content/catalog'
import { resolveDemo } from '@/content/interactive/registry'

describe('Vue Router B11 课程', () => {
  it('按顺序开放导航失败课程', async () => {
    const previousEntryId = 'vue.router.learn.intermediate.lazy-loading'
    const entryId = 'vue.router.learn.advanced.navigation-failures'
    const demoId = `${entryId}.navigation-failures-lab-demo`
    const track = learningCatalog.getLearningTrack({ ecosystem: 'vue', module: 'router' })
    const entry = learningCatalog.getEntry(entryId)

    expect(track?.entries.slice(0, 11).map((item) => item.entryId)).toEqual([
      'vue.router.learn.basics.setup-first-router',
      'vue.router.learn.basics.router-link-view-active',
      'vue.router.learn.basics.route-params-query-matching',
      'vue.router.learn.basics.nested-routes',
      'vue.router.learn.basics.composition-programmatic-navigation',
      'vue.router.learn.intermediate.named-routes-redirects-aliases',
      'vue.router.learn.intermediate.named-views-route-props',
      'vue.router.learn.intermediate.meta-navigation-guards',
      'vue.router.learn.intermediate.route-data-fetching',
      previousEntryId,
      entryId,
    ])
    expect(entry).toMatchObject({
      id: entryId,
      title: '导航失败',
      collection: 'advanced',
      prerequisites: [
        'vue.router.learn.basics.composition-programmatic-navigation',
        'vue.router.learn.intermediate.meta-navigation-guards',
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
