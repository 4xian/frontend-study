import { createPinia, getActivePinia, setActivePinia } from 'pinia'
import { createApp, nextTick } from 'vue'
import { describe, expect, it } from 'vitest'
import { learningCatalog } from '@/content/catalog'
import ActionLifecycleDemo from '@/content/demos/vue/pinia/learn/basics/actions-async/pinia-action-lifecycle-lab-demo.vue'
import GetterDependencyDemo from '@/content/demos/vue/pinia/learn/basics/getters/pinia-getter-dependency-lab-demo.vue'
import FirstStoreDemo from '@/content/demos/vue/pinia/learn/basics/setup-first-store/pinia-first-store-lab-demo.vue'
import StateMutationDemo from '@/content/demos/vue/pinia/learn/basics/state-patch-reset/pinia-state-mutation-lab-demo.vue'
import { resolveDemo } from '@/content/interactive/registry'

const p01Lessons = [
  [
    'vue.pinia.learn.basics.setup-first-store',
    'vue.pinia.learn.basics.setup-first-store.pinia-first-store-lab-demo',
  ],
  [
    'vue.pinia.learn.basics.state-patch-reset',
    'vue.pinia.learn.basics.state-patch-reset.pinia-state-mutation-lab-demo',
  ],
  [
    'vue.pinia.learn.basics.getters',
    'vue.pinia.learn.basics.getters.pinia-getter-dependency-lab-demo',
  ],
  [
    'vue.pinia.learn.basics.actions-async',
    'vue.pinia.learn.basics.actions-async.pinia-action-lifecycle-lab-demo',
  ],
] as const

const p01DemoCases = [
  [FirstStoreDemo, '调用 increment()'],
  [StateMutationDemo, '对象 Patch'],
  [GetterDependencyDemo, '价格 +10'],
  [ActionLifecycleDemo, '同步成功'],
] as const

describe('Pinia P01 课程', () => {
  it('原子开放前四课及其唯一 Demo', async () => {
    const track = learningCatalog.getLearningTrack({ ecosystem: 'vue', module: 'pinia' })
    const roadmap =
      track?.stages.flatMap((stage) => stage.categories.flatMap((category) => category.entries)) ??
      []

    expect(roadmap.map((entry) => entry.entryId)).toHaveLength(14)
    expect(roadmap.slice(0, 4).map((entry) => [entry.entryId, entry.status])).toEqual(
      p01Lessons.map(([entryId]) => [entryId, 'available']),
    )
    expect(track?.entries.slice(0, 4).map((entry) => entry.entryId)).toEqual(
      p01Lessons.map(([entryId]) => entryId),
    )

    for (const [entryId, demoId] of p01Lessons) {
      const lesson = await learningCatalog.loadEntry(entryId)
      const demoBlocks = lesson.blocks.filter((block) => block.type === 'demo')

      expect(learningCatalog.getEntry(entryId)?.id).toBe(entryId)
      expect(demoBlocks).toEqual([expect.objectContaining({ type: 'demo', id: demoId })])
      expect(resolveDemo(demoId)).not.toBeNull()
    }
  })

  it('四个 Demo 挂载和卸载都不改变宿主 active Pinia', async () => {
    const hostPinia = createPinia()
    const observations: boolean[] = []

    for (const [demoComponent, actionLabel] of p01DemoCases) {
      setActivePinia(hostPinia)
      const host = document.createElement('div')
      document.body.append(host)
      const app = createApp(demoComponent)
      app.mount(host)
      await nextTick()
      expect(host.querySelector('.pinia-demo')).not.toBeNull()
      observations.push(getActivePinia() === hostPinia)

      const actionButton = Array.from(host.querySelectorAll('button')).find(
        (button) => button.textContent?.trim() === actionLabel,
      )
      expect(actionButton).toBeDefined()
      actionButton?.click()
      await nextTick()
      observations.push(getActivePinia() === hostPinia)

      app.unmount()
      observations.push(getActivePinia() === hostPinia)
      host.remove()
    }

    setActivePinia(undefined)
    expect(observations).toEqual(Array.from({ length: 12 }, () => true))
  })

  it('L01 明确呈现 Vue 应用与组件基础前置', async () => {
    expect(
      learningCatalog.getEntry('vue.pinia.learn.basics.setup-first-store')?.prerequisites,
    ).toEqual(['vue.core.learn.basics.component-basics'])

    const lesson = await learningCatalog.loadEntry('vue.pinia.learn.basics.setup-first-store')
    expect(lesson.blocks).toContainEqual(
      expect.objectContaining({
        type: 'tip',
        content: expect.stringContaining('前置：Vue 应用与组件基础'),
      }),
    )
  })
})
