import { createPinia, getActivePinia, setActivePinia, type Pinia } from 'pinia'
import { createApp, nextTick, type App } from 'vue'
import { flushPromises } from '@vue/test-utils'
import { createMemoryHistory, createRouter, type Router } from 'vue-router'
import { describe, expect, it, vi } from 'vitest'
import { learningCatalog } from '@/content/catalog'
import { resolveDemo } from '@/content/interactive/registry'

const p02EntryIds = [
  'vue.pinia.learn.basics.setup-first-store',
  'vue.pinia.learn.basics.state-patch-reset',
  'vue.pinia.learn.basics.getters',
  'vue.pinia.learn.basics.actions-async',
  'vue.pinia.learn.basics.component-store-to-refs',
  'vue.pinia.learn.intermediate.setup-stores',
] as const

const routerBasicsId = 'vue.router.learn.basics.setup-first-router'

const p03Lessons = [
  {
    entryId: 'vue.pinia.learn.intermediate.store-composition',
    demoId: 'vue.pinia.learn.intermediate.store-composition.pinia-store-composition-lab-demo',
    prerequisites: [...p02EntryIds],
    related: [
      'vue.pinia.learn.intermediate.setup-stores',
      'vue.pinia.learn.basics.actions-async',
      'vue.pinia.reference.stores.define-store',
    ],
  },
  {
    entryId: 'vue.pinia.learn.intermediate.store-modeling',
    demoId: 'vue.pinia.learn.intermediate.store-modeling.pinia-store-responsibility-lab-demo',
    prerequisites: [...p02EntryIds, 'vue.pinia.learn.intermediate.store-composition'],
    related: [
      'vue.pinia.learn.intermediate.store-composition',
      'vue.pinia.learn.intermediate.setup-stores',
      'vue.pinia.reference.stores.define-store',
    ],
  },
  {
    entryId: 'vue.pinia.learn.intermediate.subscriptions-actions',
    demoId:
      'vue.pinia.learn.intermediate.subscriptions-actions.pinia-subscription-lifecycle-lab-demo',
    prerequisites: [
      ...p02EntryIds,
      'vue.pinia.learn.intermediate.store-composition',
      'vue.pinia.learn.intermediate.store-modeling',
    ],
    related: [
      'vue.pinia.learn.basics.state-patch-reset',
      'vue.pinia.learn.basics.actions-async',
      'vue.pinia.reference.observation.subscriptions',
    ],
  },
  {
    entryId: 'vue.pinia.learn.intermediate.outside-components-router',
    demoId:
      'vue.pinia.learn.intermediate.outside-components-router.pinia-outside-component-context-lab-demo',
    prerequisites: [
      ...p02EntryIds,
      'vue.pinia.learn.intermediate.store-composition',
      'vue.pinia.learn.intermediate.store-modeling',
      'vue.pinia.learn.intermediate.subscriptions-actions',
      routerBasicsId,
    ],
    related: [
      'vue.pinia.learn.intermediate.subscriptions-actions',
      'vue.router.learn.intermediate.meta-navigation-guards',
      'vue.pinia.reference.core.pinia-instance',
    ],
  },
] as const

/** 通过公开 registry 挂载真实 Demo，并等待异步组件完成解析。 */
async function mountRegisteredDemo(
  demoId: string,
  hostPinia?: Pinia,
  hostRouter?: Router,
): Promise<{
  app: App<Element>
  host: HTMLElement
} | null> {
  const resolved = resolveDemo(demoId)
  expect(resolved).not.toBeNull()
  if (!resolved) return null

  const host = document.createElement('div')
  document.body.append(host)
  const app = createApp(resolved.component)
  if (hostPinia) app.use(hostPinia)
  if (hostRouter) app.use(hostRouter)
  app.mount(host)
  await flushPromises()
  await nextTick()
  await vi.waitFor(() => expect(host.querySelector('.pinia-demo')).not.toBeNull())
  return { app, host }
}

/** 按可见文案查找 Demo 按钮。 */
function findButton(host: HTMLElement, label: string): HTMLButtonElement | undefined {
  return Array.from(host.querySelectorAll('button')).find(
    (button) => button.textContent?.trim() === label,
  )
}

describe('Pinia P03 课程', () => {
  it('原子开放前十课及 P03 唯一 Demo', async () => {
    const track = learningCatalog.getLearningTrack({ ecosystem: 'vue', module: 'pinia' })
    const roadmap =
      track?.stages.flatMap((stage) => stage.categories.flatMap((category) => category.entries)) ??
      []
    const availableEntryIds = [...p02EntryIds, ...p03Lessons.map(({ entryId }) => entryId)]

    expect(roadmap.map((entry) => entry.entryId)).toHaveLength(14)
    expect(roadmap.slice(0, 10).map((entry) => [entry.entryId, entry.status])).toEqual(
      availableEntryIds.map((entryId) => [entryId, 'available']),
    )
    expect(track?.entries.slice(0, 10).map((entry) => entry.entryId)).toEqual(availableEntryIds)

    for (const lessonContract of p03Lessons) {
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

  it('L07 将循环互读推迟到 computed 与 action，并保持宿主 Pinia', async () => {
    const demo = resolveDemo(p03Lessons[0].demoId)
    const source = await demo?.loadSource()
    expect(source).toContain('const visibleSummary = computed(() => cart.summary)')
    expect(source).not.toContain('syncSummary')

    const hostPinia = createPinia()
    setActivePinia(hostPinia)
    const mounted = await mountRegisteredDemo(p03Lessons[0].demoId, hostPinia)
    if (!mounted) {
      setActivePinia(undefined)
      return
    }

    const { app, host } = mounted
    expect(getActivePinia()).toBe(hostPinia)
    expect(host.querySelector('[data-testid="composition-summary"]')?.textContent).toContain(
      '访客 · 0 件',
    )
    expect(host.querySelector('[data-testid="composition-read-phase"]')?.textContent).toContain(
      '尚未执行 action 读取',
    )

    findButton(host, '加入商品')?.click()
    await nextTick()
    expect(host.querySelector('[data-testid="composition-summary"]')?.textContent).toContain(
      '访客 · 1 件',
    )

    findButton(host, '切换为会员')?.click()
    await nextTick()
    expect(host.querySelector('[data-testid="composition-summary"]')?.textContent).toContain(
      '会员 · 1 件',
    )

    findButton(host, 'Action 读取购物车')?.click()
    await nextTick()
    expect(host.querySelector('[data-testid="composition-read-phase"]')?.textContent).toContain(
      'action 执行时读取：1 件',
    )
    expect(host.querySelector('[data-testid="composition-instance"]')?.textContent).toContain(
      '同一隔离 Pinia',
    )
    expect(getActivePinia()).toBe(hostPinia)

    app.unmount()
    expect(getActivePinia()).toBe(hostPinia)
    host.remove()
    setActivePinia(undefined)
  })

  it('L08 重挂载时重置局部 UI，并保留 Store 业务状态与客户端缓存', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const hostPinia = createPinia()
    setActivePinia(hostPinia)
    const mounted = await mountRegisteredDemo(p03Lessons[1].demoId, hostPinia)
    if (!mounted) {
      warnSpy.mockRestore()
      setActivePinia(undefined)
      return
    }

    const { app, host } = mounted
    expect(host.querySelector('[data-testid="modeling-panel"]')?.textContent).toContain('已关闭')
    expect(host.querySelector('[data-testid="modeling-draft"]')?.textContent).toContain('空')
    expect(host.querySelector('[data-testid="modeling-task"]')?.textContent).toContain('待完成')
    expect(host.querySelector('[data-testid="modeling-cache"]')?.textContent).toContain('v1')

    findButton(host, '打开局部面板')?.click()
    findButton(host, '填写本地草稿')?.click()
    findButton(host, '完成业务任务')?.click()
    findButton(host, '刷新客户端缓存')?.click()
    await nextTick()
    expect(host.querySelector('[data-testid="modeling-panel"]')?.textContent).toContain('已打开')
    expect(host.querySelector('[data-testid="modeling-draft"]')?.textContent).toContain(
      '待提交说明',
    )
    expect(host.querySelector('[data-testid="modeling-task"]')?.textContent).toContain('已完成')
    expect(host.querySelector('[data-testid="modeling-cache"]')?.textContent).toContain('v2')

    findButton(host, '重挂载局部组件')?.click()
    await nextTick()
    expect(host.querySelector('[data-testid="modeling-panel"]')?.textContent).toContain('已关闭')
    expect(host.querySelector('[data-testid="modeling-draft"]')?.textContent).toContain('空')
    expect(host.querySelector('[data-testid="modeling-task"]')?.textContent).toContain('已完成')
    expect(host.querySelector('[data-testid="modeling-cache"]')?.textContent).toContain('v2')
    expect(host.querySelector('[data-testid="modeling-authority"]')?.textContent).toContain(
      '服务端 fixture 是权威源',
    )
    const operationTimeline = host.querySelector('[aria-label="状态所有权操作时间线"]')
    expect(operationTimeline?.textContent).toContain('taskStore.completeTask() 修改业务状态')
    expect(operationTimeline?.textContent).toContain('taskStore.refreshCache() 更新客户端缓存')
    expect(operationTimeline?.textContent).toContain('局部组件已重挂载，Store 未销毁')

    for (let index = 0; index < 7; index++) findButton(host, '重挂载局部组件')?.click()
    await nextTick()
    expect(operationTimeline?.querySelectorAll('li')).toHaveLength(6)
    const warnings = warnSpy.mock.calls.map(([message]) => String(message))
    warnSpy.mockRestore()
    expect(warnings).toEqual([])
    expect(getActivePinia()).toBe(hostPinia)

    app.unmount()
    expect(getActivePinia()).toBe(hostPinia)
    host.remove()
    setActivePinia(undefined)
  })

  it('L09 区分 mutation、flush、action hook 与 scoped/detached 生命周期', async () => {
    const hostPinia = createPinia()
    setActivePinia(hostPinia)
    const mounted = await mountRegisteredDemo(p03Lessons[2].demoId, hostPinia)
    if (!mounted) {
      setActivePinia(undefined)
      return
    }

    const { app, host } = mounted
    expect(
      host.querySelector('[data-testid="subscription-component-status"]')?.textContent,
    ).toContain('已挂载')

    findButton(host, 'Direct 修改')?.click()
    await nextTick()
    expect(host.querySelector('[data-testid="subscription-mutation"]')?.textContent).toContain(
      'direct',
    )
    expect(host.querySelector('[data-testid="subscription-direct-timing"]')?.textContent).toContain(
      'sync=1, pre=0, post=0',
    )
    expect(host.querySelector('[data-testid="subscription-flush-counts"]')?.textContent).toContain(
      'sync=1, pre=1, post=1',
    )

    findButton(host, 'Patch Object')?.click()
    await nextTick()
    expect(host.querySelector('[data-testid="subscription-mutation"]')?.textContent).toContain(
      'patch object',
    )
    expect(host.querySelector('[data-testid="subscription-payload"]')?.textContent).toContain(
      '{"count":5}',
    )
    expect(host.querySelector('[data-testid="subscription-patch-timing"]')?.textContent).toContain(
      'sync=2, pre=2, post=2',
    )

    findButton(host, 'Patch Function')?.click()
    await nextTick()
    expect(host.querySelector('[data-testid="subscription-mutation"]')?.textContent).toContain(
      'patch function',
    )
    expect(host.querySelector('[data-testid="subscription-payload"]')?.textContent).toContain('无')

    findButton(host, '同步 Action 成功')?.click()
    await nextTick()
    expect(host.querySelector('[data-testid="subscription-action"]')?.textContent).toContain(
      'after:succeed -> saved:draft',
    )

    findButton(host, '同步 Action 抛错')?.click()
    await nextTick()
    expect(host.querySelector('[data-testid="subscription-action"]')?.textContent).toContain(
      'onError:fail -> sync failure',
    )
    expect(host.querySelector('[data-testid="subscription-caller"]')?.textContent).toContain(
      'caught:sync failure',
    )

    findButton(host, '启动异步 Action')?.click()
    await nextTick()
    expect(host.querySelector('[data-testid="subscription-caller"]')?.textContent).toContain(
      'pending',
    )
    findButton(host, 'Resolve Gate')?.click()
    await flushPromises()
    await nextTick()
    expect(host.querySelector('[data-testid="subscription-action"]')?.textContent).toContain(
      'after:deferred -> resolved:request-1',
    )

    const scopedStateBefore = host.querySelector(
      '[data-testid="subscription-scoped-state"]',
    )?.textContent
    const detachedStateBefore = Number(
      host.querySelector('[data-testid="subscription-detached-state"]')?.textContent,
    )
    const scopedActionBefore = host.querySelector(
      '[data-testid="subscription-scoped-action"]',
    )?.textContent
    const detachedActionBefore = Number(
      host.querySelector('[data-testid="subscription-detached-action"]')?.textContent,
    )

    findButton(host, '卸载订阅组件')?.click()
    await nextTick()
    findButton(host, '卸载后直接修改')?.click()
    findButton(host, '卸载后调用 Action')?.click()
    await nextTick()
    expect(host.querySelector('[data-testid="subscription-scoped-state"]')?.textContent).toBe(
      scopedStateBefore,
    )
    expect(host.querySelector('[data-testid="subscription-scoped-action"]')?.textContent).toBe(
      scopedActionBefore,
    )
    expect(
      Number(host.querySelector('[data-testid="subscription-detached-state"]')?.textContent),
    ).toBe(detachedStateBefore + 1)
    expect(
      Number(host.querySelector('[data-testid="subscription-detached-action"]')?.textContent),
    ).toBe(detachedActionBefore + 1)

    findButton(host, '停止 detached 订阅')?.click()
    const detachedStateStopped = host.querySelector(
      '[data-testid="subscription-detached-state"]',
    )?.textContent
    const detachedActionStopped = host.querySelector(
      '[data-testid="subscription-detached-action"]',
    )?.textContent
    findButton(host, '停止后继续操作')?.click()
    await nextTick()
    expect(host.querySelector('[data-testid="subscription-detached-state"]')?.textContent).toBe(
      detachedStateStopped,
    )
    expect(host.querySelector('[data-testid="subscription-detached-action"]')?.textContent).toBe(
      detachedActionStopped,
    )
    expect(getActivePinia()).toBe(hostPinia)

    app.unmount()
    expect(getActivePinia()).toBe(hostPinia)
    host.remove()
    setActivePinia(undefined)
  })

  it('L10 在 memory router guard 内延迟取 Store，并保持宿主上下文不变', async () => {
    const hostUrl = window.location.href
    const hostPinia = createPinia()
    const hostRouter = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/pinia-lesson', component: { template: '<p>host lesson</p>' } }],
    })
    await hostRouter.push('/pinia-lesson')
    await hostRouter.isReady()
    const hostRoute = hostRouter.currentRoute.value.fullPath
    setActivePinia(hostPinia)
    const mounted = await mountRegisteredDemo(p03Lessons[3].demoId, hostPinia, hostRouter)
    if (!mounted) {
      setActivePinia(undefined)
      return
    }

    const { app, host } = mounted
    await vi.waitFor(() =>
      expect(host.querySelector('[data-testid="outside-memory-route"]')?.textContent).toContain(
        '/public',
      ),
    )
    expect(host.querySelector('[data-testid="outside-early-call"]')?.textContent).toContain(
      '未执行模块顶层 useStore()',
    )

    findButton(host, '访问受保护页')?.click()
    await flushPromises()
    await nextTick()
    expect(host.querySelector('[data-testid="outside-memory-route"]')?.textContent).toContain(
      '/login',
    )
    expect(host.querySelector('[data-testid="outside-guard"]')?.textContent).toContain(
      'guard 内延迟取得 Store：redirect',
    )

    findButton(host, '登录独立 Store')?.click()
    findButton(host, '显式读取 Store')?.click()
    await nextTick()
    expect(host.querySelector('[data-testid="outside-explicit"]')?.textContent).toContain(
      '与 guard 为同一隔离实例',
    )

    findButton(host, '访问受保护页')?.click()
    await flushPromises()
    await nextTick()
    expect(host.querySelector('[data-testid="outside-memory-route"]')?.textContent).toContain(
      '/secure',
    )
    expect(host.querySelector('[data-testid="outside-guard"]')?.textContent).toContain(
      'guard 内延迟取得 Store：allow',
    )
    expect(host.querySelector('[aria-label="最近路由事件"]')?.textContent).toContain(
      'pinia-p03-outside-access',
    )
    expect(host.querySelector('[data-testid="outside-host-url"]')?.textContent).toContain(
      '宿主 URL 未变化',
    )
    expect(host.querySelector('[data-testid="outside-host-route"]')?.textContent).toContain(
      '宿主 Router route 未变化',
    )
    expect(window.location.href).toBe(hostUrl)
    expect(hostRouter.currentRoute.value.fullPath).toBe(hostRoute)
    expect(getActivePinia()).toBe(hostPinia)

    app.unmount()
    expect(window.location.href).toBe(hostUrl)
    expect(getActivePinia()).toBe(hostPinia)
    host.remove()
    setActivePinia(undefined)
  })
})
