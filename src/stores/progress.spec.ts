import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { LearningTrack } from '@/content/catalog'
import { PROGRESS_STORAGE_KEY, useProgressStore } from './progress'

const track: LearningTrack = {
  stages: [],
  entries: [
    {
      id: 'template-syntax',
      entryId: 'vue.core.learn.basics.template-syntax',
      title: '模板语法',
      path: '/learn/vue/core/basics/template-syntax',
      status: 'available',
    },
    {
      id: 'reactive-state',
      entryId: 'vue.core.learn.basics.reactive-state',
      title: '响应式状态',
      path: '/learn/vue/core/basics/reactive-state',
      status: 'available',
    },
  ],
  total: 2,
  roadmapTotal: 2,
}

beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-07-29T03:00:00.000Z'))
})

describe('课程进度', () => {
  it('持久化完成与最近访问状态，并在损坏数据时恢复为空进度', () => {
    const progress = useProgressStore()

    progress.setCompleted('vue.core.learn.basics.template-syntax', true)
    progress.recordVisit('vue.core.learn.basics.template-syntax')

    setActivePinia(createPinia())
    const restored = useProgressStore()
    expect({
      snapshot: restored.snapshot,
      track: restored.getTrackProgress(track),
    }).toMatchObject({
      snapshot: {
        schemaVersion: 1,
        completedEntryIds: ['vue.core.learn.basics.template-syntax'],
        recentEntryId: 'vue.core.learn.basics.template-syntax',
        updatedAt: '2026-07-29T03:00:00.000Z',
      },
      track: {
        completedCount: 1,
        totalCount: 2,
        ratio: 0.5,
        hasStarted: true,
        continueEntry: { entryId: 'vue.core.learn.basics.reactive-state' },
      },
    })

    restored.setCompleted('vue.core.learn.basics.template-syntax', false)
    expect(restored.isCompleted('vue.core.learn.basics.template-syntax')).toBe(false)

    localStorage.setItem(PROGRESS_STORAGE_KEY, '{broken')
    setActivePinia(createPinia())
    const recovered = useProgressStore()
    expect(recovered.snapshot).toMatchObject({
      schemaVersion: 1,
      completedEntryIds: [],
      recentEntryId: null,
      updatedAt: null,
    })
    expect(localStorage.getItem(PROGRESS_STORAGE_KEY)).toBeNull()
  })
})
