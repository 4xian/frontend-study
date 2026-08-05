import { createPinia, getActivePinia, setActivePinia } from 'pinia'
import { createApp, nextTick } from 'vue'
import { describe, expect, it } from 'vitest'
import { learningCatalog } from '@/content/catalog'
import StoreToRefsDemo from '@/content/demos/vue/pinia/learn/basics/component-store-to-refs/pinia-store-to-refs-lab-demo.vue'
import SetupStoreDemo from '@/content/demos/vue/pinia/learn/intermediate/setup-stores/pinia-setup-store-contract-lab-demo.vue'
import { resolveDemo } from '@/content/interactive/registry'

const p01EntryIds = [
  'vue.pinia.learn.basics.setup-first-store',
  'vue.pinia.learn.basics.state-patch-reset',
  'vue.pinia.learn.basics.getters',
  'vue.pinia.learn.basics.actions-async',
] as const

const p02Lessons = [
  {
    entryId: 'vue.pinia.learn.basics.component-store-to-refs',
    demoId: 'vue.pinia.learn.basics.component-store-to-refs.pinia-store-to-refs-lab-demo',
    prerequisites: [...p01EntryIds],
    related: [
      'vue.pinia.learn.basics.actions-async',
      'vue.core.learn.basics.reactive-state',
      'vue.pinia.reference.stores.store-to-refs',
    ],
  },
  {
    entryId: 'vue.pinia.learn.intermediate.setup-stores',
    demoId: 'vue.pinia.learn.intermediate.setup-stores.pinia-setup-store-contract-lab-demo',
    prerequisites: [...p01EntryIds, 'vue.pinia.learn.basics.component-store-to-refs'],
    related: [
      'vue.pinia.learn.basics.component-store-to-refs',
      'vue.core.learn.basics.watchers',
      'vue.core.learn.intermediate.composables',
      'vue.pinia.reference.stores.define-store',
    ],
  },
] as const

describe('Pinia P02 课程', () => {
  it('原子开放前六课及 P02 唯一 Demo', async () => {
    const track = learningCatalog.getLearningTrack({ ecosystem: 'vue', module: 'pinia' })
    const roadmap =
      track?.stages.flatMap((stage) => stage.categories.flatMap((category) => category.entries)) ??
      []
    const availableEntryIds = [...p01EntryIds, ...p02Lessons.map(({ entryId }) => entryId)]

    expect(roadmap.map((entry) => entry.entryId)).toHaveLength(14)
    expect(roadmap.slice(0, 6).map((entry) => [entry.entryId, entry.status])).toEqual(
      availableEntryIds.map((entryId) => [entryId, 'available']),
    )
    expect(track?.entries.slice(0, 6).map((entry) => entry.entryId)).toEqual(availableEntryIds)

    for (const lessonContract of p02Lessons) {
      const meta = learningCatalog.getEntry(lessonContract.entryId)
      const lesson = await learningCatalog.loadEntry(lessonContract.entryId)
      const demoBlocks = lesson.blocks.filter((block) => block.type === 'demo')

      expect(meta?.prerequisites).toEqual(lessonContract.prerequisites)
      expect(meta?.related).toEqual(lessonContract.related)
      expect(demoBlocks).toEqual([
        expect.objectContaining({ type: 'demo', id: lessonContract.demoId }),
      ])
      expect(resolveDemo(lessonContract.demoId)).not.toBeNull()

      for (const relatedId of lessonContract.related) {
        expect(learningCatalog.getEntry(relatedId)?.id).toBe(relatedId)
      }
    }
  })

  it('L05 对比停滞快照、持续 refs、解构 action 与插件字段筛选', async () => {
    const hostPinia = createPinia()
    setActivePinia(hostPinia)
    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp(StoreToRefsDemo)
    app.mount(host)
    await nextTick()

    expect(getActivePinia()).toBe(hostPinia)
    expect(host.querySelector('[data-testid="snapshot-count"]')?.textContent).toContain('0')
    expect(host.querySelector('[data-testid="snapshot-double"]')?.textContent).toContain('0')
    expect(host.querySelector('[data-testid="store-count"]')?.textContent).toContain('0')
    expect(host.querySelector('[data-testid="store-double"]')?.textContent).toContain('0')
    expect(
      host.querySelector('[data-testid="getter-evaluations-after-refs"]')?.textContent,
    ).toContain('0')
    expect(
      host.querySelector('[data-testid="getter-evaluations-after-read"]')?.textContent,
    ).toContain('1')
    expect(host.querySelector('[data-testid="ref-count"]')?.textContent).toContain('0')
    expect(host.querySelector('[data-testid="ref-double"]')?.textContent).toContain('0')
    expect(host.querySelector('[data-testid="plugin-ref"]')?.textContent).toContain('ready-0')
    expect(host.querySelector('[data-testid="extracted-keys"]')?.textContent).toContain(
      'count, doubleCount, pluginStatus',
    )
    expect(host.querySelector('[data-testid="ignored-keys"]')?.textContent).toContain(
      'increment, pluginLabel',
    )
    expect(host.querySelector('[data-testid="last-operation"]')?.textContent).toContain('初始化')
    expect(host.querySelector('[data-testid="last-result"]')?.textContent).toContain('count=0')
    expect(host.querySelectorAll('[data-testid="timeline-item"]').length).toBeLessThanOrEqual(6)

    const actionButton = Array.from(host.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === '调用解构 action',
    )
    expect(actionButton).toBeDefined()
    actionButton?.click()
    expect(getActivePinia()).toBe(hostPinia)
    await nextTick()

    expect(getActivePinia()).toBe(hostPinia)
    expect(host.querySelector('[data-testid="snapshot-count"]')?.textContent).toContain('0')
    expect(host.querySelector('[data-testid="snapshot-double"]')?.textContent).toContain('0')
    expect(host.querySelector('[data-testid="store-count"]')?.textContent).toContain('1')
    expect(host.querySelector('[data-testid="store-double"]')?.textContent).toContain('2')
    expect(host.querySelector('[data-testid="ref-count"]')?.textContent).toContain('1')
    expect(host.querySelector('[data-testid="ref-double"]')?.textContent).toContain('2')
    expect(host.querySelector('[data-testid="last-operation"]')?.textContent).toContain(
      '调用解构 action',
    )
    expect(host.querySelector('[data-testid="last-result"]')?.textContent).toContain('count=1')

    const pluginButton = Array.from(host.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === '更新插件 ref',
    )
    expect(pluginButton).toBeDefined()
    pluginButton?.click()
    await nextTick()

    expect(getActivePinia()).toBe(hostPinia)
    expect(host.querySelector('[data-testid="plugin-ref"]')?.textContent).toContain('ready-1')
    expect(host.querySelector('[data-testid="last-operation"]')?.textContent).toContain(
      '更新插件 ref',
    )
    expect(host.querySelectorAll('[data-testid="timeline-item"]')).toHaveLength(3)

    app.unmount()
    expect(getActivePinia()).toBe(hostPinia)
    host.remove()
    setActivePinia(undefined)
  })

  it('L06 展示 Setup 映射、自定义 reset 与 Store scope 的 dispose 边界', async () => {
    const hostPinia = createPinia()
    setActivePinia(hostPinia)
    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp(SetupStoreDemo)
    app.mount(host)
    await nextTick()

    expect(getActivePinia()).toBe(hostPinia)
    expect(host.querySelector('[data-testid="setup-state-keys"]')?.textContent).toContain('count')
    expect(host.querySelector('[data-testid="setup-getter"]')?.textContent).toContain('doubleCount')
    expect(host.querySelector('[data-testid="setup-action"]')?.textContent).toContain('increment')
    expect(host.querySelector('[data-testid="options-state-keys"]')?.textContent).toContain('count')
    expect(host.querySelector('[data-testid="options-getter-keys"]')?.textContent).toContain(
      'doubleCount',
    )
    expect(host.querySelector('[data-testid="options-action-keys"]')?.textContent).toContain(
      'increment',
    )
    expect(host.querySelector('[data-testid="setup-count"]')?.textContent).toContain('0')
    expect(host.querySelector('[data-testid="setup-double"]')?.textContent).toContain('0')
    expect(host.querySelector('[data-testid="watch-runs"]')?.textContent).toContain('0')
    expect(host.querySelector('[data-testid="consumer"]')?.textContent).toContain('count：0')
    expect(host.querySelector('[data-testid="operation-count"]')?.textContent).toContain('0')
    expect(host.querySelector('[data-testid="last-operation"]')?.textContent).toContain('初始化')
    expect(host.querySelector('[data-testid="last-result"]')?.textContent).toContain('count=0')
    expect(host.querySelectorAll('[data-testid="timeline-item"]').length).toBeLessThanOrEqual(6)

    /** 按可见文案查找当前 Demo 按钮。 */
    const findButton = (label: string) =>
      Array.from(host.querySelectorAll('button')).find(
        (button) => button.textContent?.trim() === label,
      )

    findButton('调用 Setup action')?.click()
    await nextTick()
    expect(host.querySelector('[data-testid="setup-count"]')?.textContent).toContain('1')
    expect(host.querySelector('[data-testid="setup-double"]')?.textContent).toContain('2')
    expect(host.querySelector('[data-testid="watch-runs"]')?.textContent).toContain('1')
    expect(host.querySelector('[data-testid="operation-count"]')?.textContent).toContain('1')
    expect(host.querySelector('[data-testid="last-result"]')?.textContent).toContain('count=1')

    findButton('调用自定义 $reset')?.click()
    await nextTick()
    expect(host.querySelector('[data-testid="setup-count"]')?.textContent).toContain('0')
    expect(host.querySelector('[data-testid="watch-runs"]')?.textContent).toContain('2')

    findButton('调用 Setup action')?.click()
    await nextTick()
    findButton('卸载消费组件')?.click()
    await nextTick()
    expect(host.querySelector('[data-testid="consumer"]')).toBeNull()
    expect(host.querySelector('[data-testid="consumer-status"]')?.textContent).toContain('已卸载')

    findButton('组件卸载后继续修改')?.click()
    await nextTick()
    expect(getActivePinia()).toBe(hostPinia)
    expect(host.querySelector('[data-testid="setup-count"]')?.textContent).toContain('2')
    expect(host.querySelector('[data-testid="watch-runs"]')?.textContent).toContain('4')

    findButton('调用 store.$dispose')?.click()
    await nextTick()
    findButton('修改旧 Store state')?.click()
    await nextTick()
    expect(getActivePinia()).toBe(hostPinia)
    expect(host.querySelector('[data-testid="setup-count"]')?.textContent).toContain('3')
    expect(host.querySelector('[data-testid="watch-runs"]')?.textContent).toContain('4')
    expect(host.querySelector('[data-testid="dispose-status"]')?.textContent).toContain(
      'watcher 已停止，state 仍保留',
    )
    expect(host.querySelector('[data-testid="operation-count"]')?.textContent).toContain('7')
    expect(host.querySelector('[data-testid="last-operation"]')?.textContent).toContain(
      '修改旧 Store state',
    )
    expect(host.querySelectorAll('[data-testid="timeline-item"]')).toHaveLength(6)

    app.unmount()
    expect(getActivePinia()).toBe(hostPinia)
    host.remove()
    setActivePinia(undefined)
  })
})
