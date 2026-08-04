import { describe, expect, it } from 'vitest'
import { learningCatalog } from '@/content/catalog'

describe('Vue Router B15 课程', () => {
  it('在既定前置之后开放类型化与文件路由，并作为当前课程终点', async () => {
    const previousEntryId = 'vue.router.learn.advanced.dynamic-routing-router-link'
    const entryId = 'vue.router.learn.advanced.typed-file-based-routing'
    const track = learningCatalog.getLearningTrack({ ecosystem: 'vue', module: 'router' })
    const entry = learningCatalog.getEntry(entryId)

    expect(track?.entries.map((item) => item.entryId)).toEqual([
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
      'vue.router.learn.advanced.router-view-slots-transitions',
      'vue.router.learn.advanced.scroll-history-deployment',
      previousEntryId,
      entryId,
    ])
    expect(entry).toMatchObject({
      id: entryId,
      title: '类型化与文件路由',
      collection: 'advanced',
      prerequisites: [
        'vue.router.learn.basics.route-params-query-matching',
        'vue.router.learn.basics.nested-routes',
        'vue.router.learn.basics.composition-programmatic-navigation',
        'vue.router.learn.intermediate.named-routes-redirects-aliases',
        'vue.router.learn.intermediate.named-views-route-props',
        'vue.router.learn.intermediate.lazy-loading',
        previousEntryId,
      ],
    })

    const lesson = await learningCatalog.loadEntry(entryId)

    expect(lesson.meta.id).toBe(entryId)
    expect(lesson.blocks.filter((block) => block.type === 'demo')).toEqual([])
    expect(learningCatalog.getNeighbors(entryId).previous?.id).toBe(previousEntryId)
    expect(learningCatalog.getNeighbors(entryId).next).toBeUndefined()
  })
})
