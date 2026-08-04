import { describe, expect, it } from 'vitest'
import { learningCatalog } from '@/content/catalog'
import { resolveDemo } from '@/content/interactive/registry'

describe('Vue Router B13 课程', () => {
  it('按顺序开放滚动、历史模式与部署课程', async () => {
    const previousEntryId = 'vue.router.learn.advanced.router-view-slots-transitions'
    const entryId = 'vue.router.learn.advanced.scroll-history-deployment'
    const nextEntryId = 'vue.router.learn.advanced.dynamic-routing-router-link'
    const demoId = `${entryId}.scroll-history-deployment-lab-demo`
    const track = learningCatalog.getLearningTrack({ ecosystem: 'vue', module: 'router' })
    const entry = learningCatalog.getEntry(entryId)

    expect(track?.entries.slice(0, 13).map((item) => item.entryId)).toEqual([
      'vue.router.learn.basics.setup-first-router',
      'vue.router.learn.basics.router-link-view-active',
      'vue.router.learn.basics.route-params-query-matching',
      'vue.router.learn.basics.nested-routes',
      'vue.router.learn.basics.composition-programmatic-navigation',
      'vue.router.learn.intermediate.named-routes-redirects-aliases',
      'vue.router.learn.intermediate.named-views-route-props',
      'vue.router.learn.intermediate.meta-navigation-guards',
      'vue.router.learn.intermediate.route-data-fetching',
      'vue.router.learn.intermediate.lazy-loading',
      'vue.router.learn.advanced.navigation-failures',
      previousEntryId,
      entryId,
    ])
    expect(entry).toMatchObject({
      id: entryId,
      title: '滚动、历史模式与部署',
      collection: 'advanced',
      prerequisites: [
        'vue.router.learn.basics.setup-first-router',
        'vue.router.learn.basics.composition-programmatic-navigation',
        'vue.router.learn.advanced.navigation-failures',
      ],
    })

    const lesson = await learningCatalog.loadEntry(entryId)
    const demoBlocks = lesson.blocks.filter((block) => block.type === 'demo')

    expect(lesson.meta.id).toBe(entryId)
    expect(learningCatalog.getNeighbors(entryId).previous?.id).toBe(previousEntryId)
    expect(learningCatalog.getNeighbors(entryId).next?.id).toBe(nextEntryId)
    expect(demoBlocks).toEqual([
      expect.objectContaining({
        type: 'demo',
        id: demoId,
      }),
    ])
    expect(resolveDemo(demoId)).not.toBeNull()
  })
})
