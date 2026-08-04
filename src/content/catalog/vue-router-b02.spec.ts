import { describe, expect, it } from 'vitest'
import { learningCatalog } from '@/content/catalog'
import { resolveDemo } from '@/content/interactive/registry'

describe('Vue Router B02 课程', () => {
  it('按顺序开放链接与视图课程，并注册独立激活状态 Demo', async () => {
    const firstEntryId = 'vue.router.learn.basics.setup-first-router'
    const entryId = 'vue.router.learn.basics.router-link-view-active'
    const demoId = `${entryId}.router-link-view-active-lab-demo`
    const track = learningCatalog.getLearningTrack({ ecosystem: 'vue', module: 'router' })
    const entry = learningCatalog.getEntry(entryId)

    expect(track?.stages[0]?.entries.slice(0, 2).map((item) => item.entryId)).toEqual([
      firstEntryId,
      entryId,
    ])
    expect(entry).toMatchObject({
      id: entryId,
      title: '链接、视图与激活状态',
      prerequisites: [firstEntryId],
    })
    await expect(learningCatalog.loadEntry(entryId)).resolves.toMatchObject({
      meta: { id: entryId },
    })
    expect(learningCatalog.getNeighbors(entryId).previous?.id).toBe(firstEntryId)
    expect(resolveDemo(demoId)).not.toBeNull()
  })
})
