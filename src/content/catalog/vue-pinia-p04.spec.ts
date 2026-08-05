import { flushPromises } from '@vue/test-utils'
import { createPinia, disposePinia, getActivePinia, setActivePinia } from 'pinia'
import { createApp, nextTick, type App } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { learningCatalog } from '@/content/catalog'
import { resolveDemo } from '@/content/interactive/registry'

const persistenceKey = 'vue3-study:vue.pinia.learn.advanced.plugins-persistence:v1'

const p03EntryIds = [
  'vue.pinia.learn.basics.setup-first-store',
  'vue.pinia.learn.basics.state-patch-reset',
  'vue.pinia.learn.basics.getters',
  'vue.pinia.learn.basics.actions-async',
  'vue.pinia.learn.basics.component-store-to-refs',
  'vue.pinia.learn.intermediate.setup-stores',
  'vue.pinia.learn.intermediate.store-composition',
  'vue.pinia.learn.intermediate.store-modeling',
  'vue.pinia.learn.intermediate.subscriptions-actions',
  'vue.pinia.learn.intermediate.outside-components-router',
] as const

const p04Lessons = [
  {
    entryId: 'vue.pinia.learn.advanced.plugins-persistence',
    demoId:
      'vue.pinia.learn.advanced.plugins-persistence.pinia-plugin-persistence-boundary-lab-demo',
    prerequisites: [...p03EntryIds],
    related: [
      'vue.pinia.learn.basics.state-patch-reset',
      'vue.pinia.learn.intermediate.subscriptions-actions',
      'vue.pinia.reference.plugins.plugin-contracts',
    ],
  },
  {
    entryId: 'vue.pinia.learn.advanced.store-testing',
    demoId: 'vue.pinia.learn.advanced.store-testing.pinia-testing-semantics-lab-demo',
    prerequisites: [...p03EntryIds, 'vue.pinia.learn.advanced.plugins-persistence'],
    related: [
      'vue.pinia.learn.basics.actions-async',
      'vue.pinia.learn.advanced.plugins-persistence',
      'vue.pinia.reference.plugins.plugin-contracts',
    ],
  },
] as const

/** 通过公开 registry 挂载真实 Demo，并等待异步组件完成解析。 */
async function mountRegisteredDemo(demoId: string): Promise<{
  app: App<Element>
  host: HTMLElement
}> {
  const resolved = resolveDemo(demoId)
  expect(resolved).not.toBeNull()
  if (!resolved) throw new Error(`Demo 未注册：${demoId}`)

  const host = document.createElement('div')
  document.body.append(host)
  const app = createApp(resolved.component)
  app.use(getActivePinia() ?? createPinia())
  app.mount(host)
  await flushPromises()
  await nextTick()
  await vi.waitFor(() => expect(host.querySelector('.pinia-demo')).not.toBeNull())
  return { app, host }
}

/** 按可见文案查找 Demo 按钮。 */
function findButton(host: HTMLElement, label: string): HTMLButtonElement {
  const button = Array.from(host.querySelectorAll('button')).find(
    (candidate) => candidate.textContent?.trim() === label,
  )
  expect(button, `缺少按钮：${label}`).toBeDefined()
  if (!button) throw new Error(`缺少按钮：${label}`)
  return button
}

describe('Pinia P04 课程', () => {
  it('原子开放前十二课与两个唯一 Demo', async () => {
    const track = learningCatalog.getLearningTrack({ ecosystem: 'vue', module: 'pinia' })
    const roadmap =
      track?.stages.flatMap((stage) => stage.categories.flatMap((category) => category.entries)) ??
      []
    const availableEntryIds = [...p03EntryIds, ...p04Lessons.map(({ entryId }) => entryId)]

    expect(roadmap.map((entry) => entry.entryId)).toHaveLength(14)
    expect(roadmap.slice(0, 12).map((entry) => [entry.entryId, entry.status])).toEqual(
      availableEntryIds.map((entryId) => [entryId, 'available']),
    )
    expect(track?.entries.slice(0, 12).map((entry) => entry.entryId)).toEqual(availableEntryIds)

    for (const lessonContract of p04Lessons) {
      const meta = learningCatalog.getEntry(lessonContract.entryId)
      const lesson = await learningCatalog.loadEntry(lessonContract.entryId)
      const demoBlocks = lesson.blocks.filter((block) => block.type === 'demo')

      expect(meta?.prerequisites).toEqual(lessonContract.prerequisites)
      expect(meta?.related).toEqual(lessonContract.related)
      expect(demoBlocks).toEqual([
        expect.objectContaining({ type: 'demo', id: lessonContract.demoId }),
      ])
      expect(resolveDemo(lessonContract.demoId)).not.toBeNull()

      for (const linkedId of [...lessonContract.prerequisites, ...lessonContract.related]) {
        expect(learningCatalog.getEntry(linkedId)?.id).toBe(linkedId)
      }
    }
  })

  it('L11 验证 plugin 时序、v1 allowlist、解码、外部 patch 抑制与清理', async () => {
    const hostPinia = createPinia()
    const hostUrl = window.location.href
    const storageBaseline = localStorage.getItem(persistenceKey)
    const validBaseline = JSON.stringify({
      version: 1,
      data: { colorMode: 'dark', compact: true },
    })
    const nativeAddEventListener = window.addEventListener.bind(window)
    const nativeRemoveEventListener = window.removeEventListener.bind(window)
    const storageListenerWrappers = new Map<EventListenerOrEventListenerObject, EventListener>()
    let storageHandlerRuns = 0
    const addEventListenerSpy = vi
      .spyOn(window, 'addEventListener')
      .mockImplementation((type, listener, options) => {
        if (type !== 'storage') {
          nativeAddEventListener(type, listener, options)
          return
        }
        /** 记录 storage 监听调用并转发至原始处理器。 */
        const wrappedListener: EventListener = (event) => {
          storageHandlerRuns++
          if (typeof listener === 'function') listener.call(window, event)
          else listener.handleEvent(event)
        }
        storageListenerWrappers.set(listener, wrappedListener)
        nativeAddEventListener(type, wrappedListener, options)
      })
    const removeEventListenerSpy = vi
      .spyOn(window, 'removeEventListener')
      .mockImplementation((type, listener, options) => {
        const registeredListener =
          type === 'storage' ? (storageListenerWrappers.get(listener) ?? listener) : listener
        nativeRemoveEventListener(type, registeredListener, options)
        if (type === 'storage') storageListenerWrappers.delete(listener)
      })
    localStorage.setItem(persistenceKey, validBaseline)
    setActivePinia(hostPinia)
    let mounted: Awaited<ReturnType<typeof mountRegisteredDemo>> | undefined

    try {
      mounted = await mountRegisteredDemo(p04Lessons[0].demoId)
      const { host } = mounted
      const storageRegistration = addEventListenerSpy.mock.calls.find(
        ([type]) => type === 'storage',
      )

      expect(storageRegistration).toBeDefined()
      expect(host.querySelector('[data-testid="plugin-checkpoints"]')?.textContent).toContain(
        'use=0 · install=0 · first=2 · repeat=2',
      )
      expect(host.querySelector('[data-testid="plugin-contexts"]')?.textContent).toContain(
        'pinia ✓ · app ✓ · store ✓ · options ✓',
      )
      expect(host.querySelector('[data-testid="plugin-contexts"]')?.textContent).toContain(
        'persist=true / persist=false',
      )
      expect(host.querySelector('[data-testid="persistence-state"]')?.textContent).toContain(
        'dark · compact',
      )
      expect(host.querySelector('[data-testid="plugin-state-alias"]')?.textContent).toContain(
        'store=0 · $state=0',
      )
      expect(getActivePinia()).toBe(hostPinia)

      findButton(host, '修改并保存偏好').click()
      await nextTick()
      expect(JSON.parse(localStorage.getItem(persistenceKey) ?? '')).toEqual({
        version: 1,
        data: { colorMode: 'light', compact: false },
      })

      findButton(host, '增加插件 state').click()
      findButton(host, '运行默认 $reset').click()
      await nextTick()
      expect(host.querySelector('[data-testid="default-reset-result"]')?.textContent).toContain(
        'pluginState=1',
      )
      findButton(host, '运行包装 $reset').click()
      await nextTick()
      expect(host.querySelector('[data-testid="wrapped-reset-result"]')?.textContent).toContain(
        'pluginState=0',
      )

      for (const [buttonLabel, expectedStatus] of [
        ['写入损坏 JSON 并重建', '损坏 JSON：使用默认偏好'],
        ['写入未知版本并重建', '未知版本：使用默认偏好'],
        ['写入错误 Schema 并重建', 'Schema 错误：使用默认偏好'],
      ] as const) {
        findButton(host, buttonLabel).click()
        await nextTick()
        expect(host.querySelector('[data-testid="decoder-status"]')?.textContent).toContain(
          expectedStatus,
        )
        expect(host.querySelector('[data-testid="persistence-state"]')?.textContent).toContain(
          'light · comfortable',
        )
      }

      const ignoredExternalStatus = host.querySelector(
        '[data-testid="external-patch-status"]',
      )?.textContent
      for (const eventInit of [
        { key: 'vue3-study:other-demo', storageArea: localStorage },
        { key: persistenceKey, storageArea: sessionStorage },
      ]) {
        window.dispatchEvent(
          new StorageEvent('storage', {
            ...eventInit,
            newValue: JSON.stringify({
              version: 1,
              data: { colorMode: 'dark', compact: true },
            }),
          }),
        )
      }
      await nextTick()
      expect(host.querySelector('[data-testid="persistence-state"]')?.textContent).toContain(
        'light · comfortable',
      )
      expect(host.querySelector('[data-testid="external-patch-status"]')?.textContent).toBe(
        ignoredExternalStatus,
      )

      const externalValue = JSON.stringify({
        version: 1,
        data: { colorMode: 'dark', compact: true },
      })
      localStorage.removeItem(persistenceKey)
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: persistenceKey,
          newValue: externalValue,
          storageArea: localStorage,
        }),
      )
      await nextTick()
      expect(host.querySelector('[data-testid="persistence-state"]')?.textContent).toContain(
        'dark · compact',
      )
      expect(localStorage.getItem(persistenceKey)).toBeNull()
      expect(host.querySelector('[data-testid="external-patch-status"]')?.textContent).toContain(
        '已应用且未回写',
      )

      window.dispatchEvent(
        new StorageEvent('storage', {
          key: persistenceKey,
          newValue: null,
          storageArea: localStorage,
        }),
      )
      await nextTick()
      expect(host.querySelector('[data-testid="persistence-state"]')?.textContent).toContain(
        'light · comfortable',
      )
      expect(host.querySelector('[data-testid="external-patch-status"]')?.textContent).toContain(
        '外部删除：已恢复默认且未回写',
      )
      expect(host.querySelector('[data-testid="persistence-write-count"]')?.textContent).toContain(
        '订阅写入次数：0',
      )

      findButton(host, '修改并保存偏好').click()
      findButton(host, '增加插件 state').click()
      findButton(host, '清空持久化并重置').click()
      await nextTick()
      expect(localStorage.getItem(persistenceKey)).toBeNull()
      expect(host.querySelector('[data-testid="persistence-state"]')?.textContent).toContain(
        'light · comfortable',
      )
      expect(host.querySelector('[data-testid="plugin-state-alias"]')?.textContent).toContain(
        'store=0 · $state=0',
      )
      expect(host.querySelector('[data-testid="decoder-status"]')?.textContent).toContain(
        '已清空 Demo key 并恢复默认',
      )
      findButton(host, '运行默认 $reset').click()
      await nextTick()
      expect(host.querySelector('[data-testid="default-reset-result"]')?.textContent).toContain(
        'pluginState=0',
      )
      expect(getActivePinia()).toBe(hostPinia)

      mounted.app.unmount()
      const storageRunsAfterUnmount = storageHandlerRuns
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: persistenceKey,
          newValue: externalValue,
          storageArea: localStorage,
        }),
      )
      expect(storageHandlerRuns).toBe(storageRunsAfterUnmount)
      mounted.host.remove()
      expect(mounted.host.isConnected).toBe(false)
      mounted = undefined
      expect(getActivePinia()).toBe(hostPinia)
      expect(window.location.href).toBe(hostUrl)
      expect(localStorage.getItem(persistenceKey)).toBe(validBaseline)
      expect(removeEventListenerSpy).toHaveBeenCalledWith('storage', storageRegistration?.[1])
    } finally {
      mounted?.app.unmount()
      mounted?.host.remove()
      if (storageBaseline === null) localStorage.removeItem(persistenceKey)
      else localStorage.setItem(persistenceKey, storageBaseline)
      addEventListenerSpy.mockRestore()
      removeEventListenerSpy.mockRestore()
      setActivePinia(undefined)
      disposePinia(hostPinia)
    }
  })

  it('L11 在 storage 读取、写入或删除失败时保留可观察状态', async () => {
    const hostPinia = createPinia()
    const storageBaseline = localStorage.getItem(persistenceKey)
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('storage denied', 'SecurityError')
    })
    setActivePinia(hostPinia)
    let mounted: Awaited<ReturnType<typeof mountRegisteredDemo>> | undefined

    try {
      mounted = await mountRegisteredDemo(p04Lessons[0].demoId)
      expect(mounted.host.querySelector('[data-testid="decoder-status"]')?.textContent).toContain(
        '读取失败：保留内存偏好',
      )
      getItemSpy.mockRestore()

      findButton(mounted.host, '修改并保存偏好').click()
      await nextTick()
      const persistedValue = localStorage.getItem(persistenceKey)
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new DOMException('storage full', 'QuotaExceededError')
      })
      try {
        findButton(mounted.host, '写入损坏 JSON 并重建').click()
        await nextTick()
        expect(mounted.host.querySelector('[data-testid="decoder-status"]')?.textContent).toContain(
          '写入失败：保留内存偏好',
        )
        expect(
          mounted.host.querySelector('[data-testid="persistence-state"]')?.textContent,
        ).toContain('dark · compact')
      } finally {
        setItemSpy.mockRestore()
      }

      const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new DOMException('storage denied', 'SecurityError')
      })
      try {
        findButton(mounted.host, '清空持久化并重置').click()
        await nextTick()
        expect(mounted.host.querySelector('[data-testid="decoder-status"]')?.textContent).toContain(
          '删除失败：保留内存偏好',
        )
        expect(
          mounted.host.querySelector('[data-testid="persistence-state"]')?.textContent,
        ).toContain('light · comfortable')
        expect(localStorage.getItem(persistenceKey)).toBe(persistedValue)
      } finally {
        removeItemSpy.mockRestore()
      }
    } finally {
      mounted?.app.unmount()
      mounted?.host.remove()
      getItemSpy.mockRestore()
      if (storageBaseline === null) localStorage.removeItem(persistenceKey)
      else localStorage.setItem(persistenceKey, storageBaseline)
      setActivePinia(undefined)
      disposePinia(hostPinia)
    }
  })

  it('L12 以 fresh Pinia 执行真实 action，并区分 fake-app plugin 与未安装反例', async () => {
    const hostPinia = createPinia()
    const hostUrl = window.location.href
    setActivePinia(hostPinia)
    let mounted: Awaited<ReturnType<typeof mountRegisteredDemo>> | undefined

    try {
      mounted = await mountRegisteredDemo(p04Lessons[1].demoId)
      const { host } = mounted
      const demoSource = await resolveDemo(p04Lessons[1].demoId)?.loadSource()

      expect(demoSource).not.toContain("from '@pinia/testing'")
      expect(demoSource).not.toContain("from 'vitest'")
      expect(demoSource).not.toContain("from '@vue/test-utils'")
      expect(host.querySelector('[data-testid="testing-package-status"]')?.textContent).toContain(
        'Deferred/not-installed',
      )

      findButton(host, '运行真实 Store case').click()
      await nextTick()
      expect(host.querySelector('[data-testid="testing-case-a"]')?.textContent).toContain(
        'before=0 · return=2 · count=2 · double=4',
      )

      findButton(host, '再次运行隔离 case').click()
      await nextTick()
      expect(host.querySelector('[data-testid="testing-case-b"]')?.textContent).toContain(
        'A=2 · B-before=0 · B-after=3 · distinct=true',
      )

      findButton(host, '运行 plugin case').click()
      await nextTick()
      expect(host.querySelector('[data-testid="testing-plugin-case"]')?.textContent).toContain(
        'runs=1 · pinia=true · app=true · store=true · options=true · field=ready',
      )

      findButton(host, '运行未安装反例').click()
      await nextTick()
      expect(
        host.querySelector('[data-testid="testing-plugin-counterexample"]')?.textContent,
      ).toContain('runs=0 · field=missing')
      expect(getActivePinia()).toBe(hostPinia)

      mounted.app.unmount()
      mounted.host.remove()
      expect(mounted.host.isConnected).toBe(false)
      mounted = undefined
      expect(getActivePinia()).toBe(hostPinia)
      expect(window.location.href).toBe(hostUrl)
    } finally {
      mounted?.app.unmount()
      mounted?.host.remove()
      setActivePinia(undefined)
      disposePinia(hostPinia)
    }
  })
})
