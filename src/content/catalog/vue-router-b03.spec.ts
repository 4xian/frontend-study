import { describe, expect, it } from 'vitest'
import { learningCatalog } from '@/content/catalog'
import { resolveDemo } from '@/content/interactive/registry'

describe('Vue Router B03 课程', () => {
  it('按顺序开放参数与匹配课程，并注册独立匹配 Demo', async () => {
    const firstEntryId = 'vue.router.learn.basics.setup-first-router'
    const previousEntryId = 'vue.router.learn.basics.router-link-view-active'
    const entryId = 'vue.router.learn.basics.route-params-query-matching'
    const demoId = `${entryId}.route-matching-lab-demo`
    const track = learningCatalog.getLearningTrack({ ecosystem: 'vue', module: 'router' })
    const entry = learningCatalog.getEntry(entryId)

    expect(track?.stages[0]?.entries.slice(0, 3).map((item) => item.entryId)).toEqual([
      firstEntryId,
      previousEntryId,
      entryId,
    ])
    expect(entry).toMatchObject({
      id: entryId,
      title: '路由参数、查询与匹配',
      prerequisites: [firstEntryId, previousEntryId],
    })
    await expect(learningCatalog.loadEntry(entryId)).resolves.toMatchObject({
      meta: { id: entryId },
    })
    expect(learningCatalog.getNeighbors(entryId).previous?.id).toBe(previousEntryId)
    expect(resolveDemo(demoId)).not.toBeNull()
  })
})
