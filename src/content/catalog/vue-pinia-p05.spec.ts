import { flushPromises } from '@vue/test-utils'
import { createPinia, disposePinia, getActivePinia, setActivePinia } from 'pinia'
import { createApp, defineComponent, h, nextTick, ref, type App } from 'vue'
import { createMemoryHistory, createRouter, useRouter, type Router } from 'vue-router'
import { describe, expect, it, vi } from 'vitest'
import { learningCatalog } from '@/content/catalog'
import { resolveDemo } from '@/content/interactive/registry'

const p04EntryIds = [
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
  'vue.pinia.learn.advanced.plugins-persistence',
  'vue.pinia.learn.advanced.store-testing',
] as const

const vueSsrEntryId = 'vue.core.learn.advanced.ssr-hydration'

const p05Lessons = [
  {
    entryId: 'vue.pinia.learn.advanced.ssr-hydration',
    demoId: 'vue.pinia.learn.advanced.ssr-hydration.pinia-ssr-hydration-model-lab-demo',
    prerequisites: [...p04EntryIds, vueSsrEntryId],
    related: [
      'vue.pinia.learn.intermediate.outside-components-router',
      'vue.pinia.learn.advanced.plugins-persistence',
      'vue.pinia.reference.runtime.hydration',
    ],
  },
  {
    entryId: 'vue.pinia.learn.advanced.hmr-devtools-maintenance',
    demoId:
      'vue.pinia.learn.advanced.hmr-devtools-maintenance.pinia-store-lifecycle-maintenance-lab-demo',
    prerequisites: [...p04EntryIds, 'vue.pinia.learn.advanced.ssr-hydration'],
    related: [
      'vue.pinia.learn.intermediate.subscriptions-actions',
      'vue.pinia.learn.advanced.store-testing',
      'vue.pinia.reference.runtime.hmr',
    ],
  },
] as const

/** 通过公开 registry 挂载真实 Demo，并等待异步组件完成解析。 */
async function mountRegisteredDemo(
  demoId: string,
  hostRouter: Router,
): Promise<{
  app: App<Element>
  host: HTMLElement
  unmountDemo: () => Promise<void>
}> {
  const resolved = resolveDemo(demoId)
  expect(resolved).not.toBeNull()
  if (!resolved) throw new Error(`Demo 未注册：${demoId}`)
  const demoComponent = resolved.component

  const host = document.createElement('div')
  document.body.append(host)
  const showDemo = ref(true)
  const HostRoot = defineComponent({
    name: 'PiniaP05TestHost',
    /** 在宿主 app 内渲染或卸载真实 Demo 子组件。 */
    setup() {
      /** 渲染当前仍挂载的 Demo。 */
      function renderHost() {
        return showDemo.value ? h(demoComponent) : null
      }

      return renderHost
    },
  })
  const app = createApp(HostRoot)
  app.use(getActivePinia() ?? createPinia())
  app.use(hostRouter)
  app.mount(host)
  await flushPromises()
  await nextTick()
  await vi.waitFor(() => expect(host.querySelector('.pinia-demo')).not.toBeNull())

  /** 只卸载 Demo 子组件，保留宿主 app 与 Router。 */
  async function unmountDemo(): Promise<void> {
    showDemo.value = false
    await nextTick()
    await flushPromises()
  }

  return { app, host, unmountDemo }
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

/** 点击按钮并等待 Vue 同步可见结果。 */
async function clickButton(host: HTMLElement, label: string): Promise<void> {
  findButton(host, label).click()
  await nextTick()
  await flushPromises()
}

/** 读取指定测试标记的可见文本。 */
function readTestText(host: HTMLElement, testId: string): string {
  const element = host.querySelector(`[data-testid="${testId}"]`)
  expect(element, `缺少测试标记：${testId}`).not.toBeNull()
  return element?.textContent?.trim() ?? ''
}

/** 以稳定 key 顺序记录 Storage 当前内容。 */
function snapshotStorage(storage: Storage): Array<[string, string | null]> {
  return Array.from({ length: storage.length }, (_, index) => storage.key(index)!)
    .sort()
    .map((key) => [key, storage.getItem(key)])
}

describe('Pinia P05 课程', () => {
  it('原子开放十四课，并在 L14 后结束课程主线', () => {
    const track = learningCatalog.getLearningTrack({ ecosystem: 'vue', module: 'pinia' })
    const roadmap =
      track?.stages.flatMap((stage) => stage.categories.flatMap((category) => category.entries)) ??
      []
    const availableEntryIds = [...p04EntryIds, ...p05Lessons.map(({ entryId }) => entryId)]

    expect(roadmap.map((entry) => [entry.entryId, entry.status])).toEqual(
      availableEntryIds.map((entryId) => [entryId, 'available']),
    )
    expect(track?.entries.map((entry) => entry.entryId)).toEqual(availableEntryIds)
    expect(learningCatalog.getNeighbors(p05Lessons[0].entryId)).toMatchObject({
      previous: { id: p04EntryIds.at(-1) },
      next: { id: p05Lessons[1].entryId },
    })
    expect(learningCatalog.getNeighbors(p05Lessons[1].entryId)).toEqual({
      previous: expect.objectContaining({ id: p05Lessons[0].entryId }),
      next: undefined,
    })
  })

  it('登记 L13-L14 的冻结前置、related 与唯一 Demo', async () => {
    for (const lessonContract of p05Lessons) {
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

  it('L13 证明 request 隔离、恢复顺序与顶层 skipHydrate', async () => {
    const previousActivePinia = getActivePinia()
    const hostPinia = createPinia()
    const hostRouter = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: {} },
        { path: '/pinia-p05-host/l13', component: {} },
      ],
    })
    const hostUrl = window.location.href
    let hostRoute = ''
    const localStorageBefore = snapshotStorage(localStorage)
    const sessionStorageBefore = snapshotStorage(sessionStorage)
    let mounted: Awaited<ReturnType<typeof mountRegisteredDemo>> | undefined

    setActivePinia(hostPinia)
    try {
      mounted = await mountRegisteredDemo(p05Lessons[0].demoId, hostRouter)

      expect(mounted.app.runWithContext(() => useRouter())).toBe(hostRouter)
      await hostRouter.push('/pinia-p05-host/l13?mode=baseline')
      await hostRouter.isReady()
      hostRoute = hostRouter.currentRoute.value.fullPath

      expect(readTestText(mounted.host, 'ssr-request-a-root')).toContain('"count":7')
      expect(readTestText(mounted.host, 'ssr-request-b-root')).toContain('"count":22')
      await clickButton(mounted.host, '只修改 Request A')
      expect(readTestText(mounted.host, 'ssr-request-a-root')).toContain('"count":8')
      expect(readTestText(mounted.host, 'ssr-request-b-root')).toContain('"count":22')

      await clickButton(mounted.host, '运行正确恢复顺序')
      await clickButton(mounted.host, '运行错误恢复顺序')
      await clickButton(mounted.host, '运行 Setup Store 水合')
      expect(readTestText(mounted.host, 'ssr-correct-order')).toContain(
        'direct=request-A/7 · $state=7 · root=7 · 一致=true',
      )
      expect(readTestText(mounted.host, 'ssr-wrong-order')).toContain(
        'direct=client-default/0 · $state=7 · root=7 · 分叉=true',
      )
      expect(readTestText(mounted.host, 'ssr-setup-hydration')).toContain(
        '普通 ref=server-regular-fixture · skipHydrate ref=client-only-fixture',
      )
      expect(readTestText(mounted.host, 'ssr-should-hydrate')).toBe(
        '普通 ref=true · skipHydrate ref=false',
      )
      expect(readTestText(mounted.host, 'ssr-security-status')).toContain('Deferred/not-installed')
      expect(readTestText(mounted.host, 'ssr-hydration-status')).toContain('Deferred/not-run')

      expect(getActivePinia()).toBe(hostPinia)
      expect(window.location.href).toBe(hostUrl)
      expect(hostRouter.currentRoute.value.fullPath).toBe(hostRoute)
      expect(snapshotStorage(localStorage)).toEqual(localStorageBefore)
      expect(snapshotStorage(sessionStorage)).toEqual(sessionStorageBefore)
    } finally {
      await mounted?.unmountDemo()
      if (hostRoute) expect(hostRouter.currentRoute.value.fullPath).toBe(hostRoute)
      mounted?.app.unmount()
      mounted?.host.remove()
      disposePinia(hostPinia)
      setActivePinia(previousActivePinia)
    }
  })

  it('L14 证明 consumer、Store 与 Pinia 的三层寿命', async () => {
    const previousActivePinia = getActivePinia()
    const hostPinia = createPinia()
    const hostRouter = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: {} },
        { path: '/pinia-p05-host/l14', component: {} },
      ],
    })
    const hostUrl = window.location.href
    let hostRoute = ''
    const localStorageBefore = snapshotStorage(localStorage)
    const sessionStorageBefore = snapshotStorage(sessionStorage)
    let mounted: Awaited<ReturnType<typeof mountRegisteredDemo>> | undefined

    setActivePinia(hostPinia)
    try {
      mounted = await mountRegisteredDemo(p05Lessons[1].demoId, hostRouter)

      expect(mounted.app.runWithContext(() => useRouter())).toBe(hostRouter)
      await hostRouter.push('/pinia-p05-host/l14?mode=baseline')
      await hostRouter.isReady()
      hostRoute = hostRouter.currentRoute.value.fullPath

      expect(readTestText(mounted.host, 'lifecycle-identity')).toContain(
        'first=Store #1 · repeat=Store #1 · 同一实例：是',
      )
      await clickButton(mounted.host, '运行挂载期 Action')
      expect(readTestText(mounted.host, 'lifecycle-consumer-observer')).toBe('1')
      expect(readTestText(mounted.host, 'lifecycle-store-scope-observer')).toBe('1')
      expect(readTestText(mounted.host, 'lifecycle-state-subscription')).toBe('1')
      expect(readTestText(mounted.host, 'lifecycle-action-subscription')).toBe('1')

      await clickButton(mounted.host, '卸载 Consumer')
      await clickButton(mounted.host, '卸载后运行 Action')
      expect(readTestText(mounted.host, 'lifecycle-consumer-observer')).toBe('1')
      expect(readTestText(mounted.host, 'lifecycle-store-scope-observer')).toBe('2')
      expect(readTestText(mounted.host, 'lifecycle-state-subscription')).toBe('2')
      expect(readTestText(mounted.host, 'lifecycle-action-subscription')).toBe('2')

      await clickButton(mounted.host, 'Dispose Store')
      expect(readTestText(mounted.host, 'lifecycle-store-dispose-proof')).toContain(
        'Store #1 state 2 -> 3；scope 2 -> 2；state sub 2 -> 2；action sub 2 -> 2',
      )
      expect(readTestText(mounted.host, 'lifecycle-root-state')).toContain('"count":3')

      await clickButton(mounted.host, '重新 useStore')
      expect(readTestText(mounted.host, 'lifecycle-rebuild-proof')).toContain(
        'Store #1 -> Store #2；identity 不同：是；state 3 -> 3',
      )
      await clickButton(mounted.host, '修改重建 Store')
      expect(readTestText(mounted.host, 'lifecycle-rebuilt-subscription')).toBe('1')
      expect(readTestText(mounted.host, 'lifecycle-root-state')).toContain('"count":4')

      await clickButton(mounted.host, 'Dispose Pinia')
      expect(readTestText(mounted.host, 'lifecycle-root-state')).toBe('Pinia root state：{}')
      expect(readTestText(mounted.host, 'lifecycle-pinia-dispose-proof')).toContain(
        '-> {}；实例不可复用',
      )
      expect(findButton(mounted.host, '修改重建 Store').disabled).toBe(true)
      expect(findButton(mounted.host, 'Dispose Pinia').disabled).toBe(true)
      expect(readTestText(mounted.host, 'lifecycle-hmr-status')).toContain('Deferred/not-run')
      expect(readTestText(mounted.host, 'lifecycle-devtools-status')).toContain('Deferred/not-run')

      expect(getActivePinia()).toBe(hostPinia)
      expect(window.location.href).toBe(hostUrl)
      expect(hostRouter.currentRoute.value.fullPath).toBe(hostRoute)
      expect(snapshotStorage(localStorage)).toEqual(localStorageBefore)
      expect(snapshotStorage(sessionStorage)).toEqual(sessionStorageBefore)
    } finally {
      await mounted?.unmountDemo()
      if (hostRoute) expect(hostRouter.currentRoute.value.fullPath).toBe(hostRoute)
      mounted?.app.unmount()
      mounted?.host.remove()
      disposePinia(hostPinia)
      setActivePinia(previousActivePinia)
    }
  })
})
