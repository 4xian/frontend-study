import { describe, expect, it } from 'vitest'
import { learningCatalog } from '@/content/catalog'
import { resolveDemo } from '@/content/interactive/registry'

describe('Vue Router B01 课程', () => {
  it('开放第一课正文与隔离 Demo，并保持为课程首项', async () => {
    const entryId = 'vue.router.learn.basics.setup-first-router'
    const demoId = `${entryId}.first-router-lab-demo`
    const track = learningCatalog.getLearningTrack({ ecosystem: 'vue', module: 'router' })
    const entry = learningCatalog.getEntry(entryId)

    expect(track?.stages[0]?.entries[0]?.entryId).toBe(entryId)
    expect(entry).toMatchObject({
      id: entryId,
      title: '建立第一个路由器',
      prerequisites: [],
    })
    await expect(learningCatalog.loadEntry(entryId)).resolves.toMatchObject({
      meta: { id: entryId },
    })
    expect(resolveDemo(demoId)).not.toBeNull()
  })
})
