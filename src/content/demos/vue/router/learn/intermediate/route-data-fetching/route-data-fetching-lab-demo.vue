<script setup lang="ts">
import {
  createApp,
  defineComponent,
  h,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch,
} from 'vue'
import type { App } from 'vue'
import { RouterView, createMemoryHistory, createRouter, useRoute, useRouter } from 'vue-router'
import type {
  NavigationFailure,
  RouteLocationNormalizedLoaded,
  Router,
  RouteRecordRaw,
} from 'vue-router'

type FetchStrategy = 'after' | 'before'
type RequestState = 'pending' | 'resolved' | 'rejected' | 'aborted'

interface UserData {
  id: string
  label: string
}

interface DeferredRequest {
  token: number
  strategy: FetchStrategy
  routeId: string
  targetFullPath: string
  state: RequestState
  controller: AbortController
  promise: Promise<UserData>
  resolve: () => void
  reject: () => void
  abort: (reason: string) => void
}

const miniAppHost = ref<HTMLElement | null>(null)
const ready = ref(false)
const currentPath = ref('尚未初始化')
const hostPath = ref('等待挂载')
const navigationResult = ref('等待导航')
const localLoading = ref(false)
const localData = ref('无')
const localError = ref('无')
const globalPending = ref(false)
const globalTarget = ref('无')
const globalError = ref('无')
const preparedKey = ref('无')
const requests = shallowRef<DeferredRequest[]>([])
const timeline = ref<string[]>([])

let miniApp: App<Element> | undefined
let demoRouter: Router | undefined
let activeAfterRequest: DeferredRequest | undefined
let activeBeforeRequest: DeferredRequest | undefined
let requestToken = 0
let pendingAction = 'initial'
const preparedByPath = new Map<string, UserData>()
const pendingNavigations = new Set<Promise<NavigationFailure | void>>()

/** 触发请求列表视图更新。 */
function touchRequests(): void {
  requests.value = [...requests.value]
}

/** 向确定性事件时间线追加一条记录。 */
function appendTimeline(message: string): void {
  timeline.value = [...timeline.value, message]
}

/** 创建一条可手动完成、拒绝或取消的请求。 */
function createDeferredRequest(
  strategy: FetchStrategy,
  routeId: string,
  targetFullPath: string,
): DeferredRequest {
  const token = ++requestToken
  const controller = new AbortController()
  let resolvePromise!: (value: UserData) => void
  let rejectPromise!: (reason: Error) => void
  const promise = new Promise<UserData>((resolve, reject) => {
    resolvePromise = resolve
    rejectPromise = reject
  })
  let request!: DeferredRequest

  /** 以当前 id 的假数据完成 pending 请求。 */
  function resolve(): void {
    if (request.state !== 'pending') {
      appendTimeline(`#${token} ${strategy} late resolve ignored`)
      return
    }
    request.state = 'resolved'
    appendTimeline(`#${token} ${strategy} id=${routeId} resolve`)
    resolvePromise({ id: routeId, label: `用户 ${routeId}` })
    touchRequests()
  }

  /** 以确定性业务错误拒绝 pending 请求。 */
  function reject(): void {
    if (request.state !== 'pending') return
    request.state = 'rejected'
    appendTimeline(`#${token} ${strategy} id=${routeId} reject`)
    rejectPromise(new Error(`用户 ${routeId} 数据获取失败`))
    touchRequests()
  }

  /** 取消过期请求，并让等待方进入可结算的 AbortError 分支。 */
  function abort(reason: string): void {
    if (request.state !== 'pending') return
    request.state = 'aborted'
    controller.abort()
    appendTimeline(`#${token} ${strategy} id=${routeId} abort：${reason}`)
    rejectPromise(new DOMException(reason, 'AbortError'))
    touchRequests()
  }

  request = {
    token,
    strategy,
    routeId,
    targetFullPath,
    state: 'pending',
    controller,
    promise,
    resolve,
    reject,
    abort,
  }
  requests.value = [...requests.value, request]
  appendTimeline(`#${token} ${strategy} ${targetFullPath} start`)
  return request
}

/** 把请求策略转换为界面文字。 */
function formatStrategy(strategy: FetchStrategy): string {
  return strategy === 'after' ? '导航后' : '导航前'
}

/** 把导航结果转换为稳定文字。 */
function formatNavigationResult(failure: NavigationFailure | void): string {
  return failure ? `取消（type ${failure.type}）` : `成功（${pendingAction}）`
}

/** 从独立 router 同步当前路由与宿主隔离状态。 */
async function syncVisibleState(): Promise<void> {
  if (!demoRouter) return
  await nextTick()
  currentPath.value = demoRouter.currentRoute.value.fullPath
  hostPath.value = `${window.location.pathname}${window.location.search}${window.location.hash}`
}

const StartPage = defineComponent({
  name: 'RouteDataFetchingStartPage',
  /** 渲染两种取数策略共享的中立起点。 */
  setup() {
    return () =>
      h('section', { class: 'route-card', 'data-testid': 'mini-route-view' }, [
        h('p', { class: 'route-kicker' }, '公开起点'),
        h('h4', '路由取数实验'),
        h('p', '先选择导航后或导航前取数，再手动结算请求。'),
      ])
  },
})

const AfterUserPage = defineComponent({
  name: 'AfterNavigationUserPage',
  /** 以精确参数 watcher 管理导航后的局部数据状态。 */
  setup() {
    const route = useRoute()

    watch(
      () => String(route.params.id),
      async (routeId, _previousId, onCleanup) => {
        activeAfterRequest?.abort('新参数使旧 watcher 失效')
        const request = createDeferredRequest('after', routeId, route.fullPath)
        activeAfterRequest = request
        localLoading.value = true
        localData.value = '无'
        localError.value = '无'

        onCleanup(() => request.abort('watch cleanup'))

        try {
          const data = await request.promise
          if (activeAfterRequest !== request || String(route.params.id) !== routeId) {
            appendTimeline(`#${request.token} after stale commit ignored`)
            return
          }
          localData.value = `${data.label}（id=${data.id}）`
          appendTimeline(`#${request.token} after data commit`)
        } catch (caught) {
          if (request.state === 'aborted') return
          if (activeAfterRequest === request) localError.value = String(caught)
        } finally {
          if (activeAfterRequest === request) localLoading.value = false
        }
      },
      { immediate: true },
    )

    return () =>
      h('section', { class: 'route-card', 'data-testid': 'mini-route-view' }, [
        h('p', { class: 'route-kicker' }, '导航后取数'),
        h('h4', `用户 ${String(route.params.id)} 页面已提交`),
        h('p', '当前页面拥有局部 loading、data 与 error。'),
      ])
  },
})

const BeforeUserPage = defineComponent({
  name: 'BeforeNavigationUserPage',
  /** 读取守卫为当前 fullPath 准备的数据。 */
  setup() {
    const route = useRoute()

    return () => {
      const data = preparedByPath.get(route.fullPath)
      return h('section', { class: 'route-card', 'data-testid': 'mini-route-view' }, [
        h('p', { class: 'route-kicker' }, '导航前取数'),
        h('h4', `用户 ${String(route.params.id)} 页面已提交`),
        h('p', data ? `${data.label} 已在导航确认前准备完成。` : '没有找到准备好的数据。'),
      ])
    }
  },
})

const routes: RouteRecordRaw[] = [
  { path: '/start', name: 'data-start', component: StartPage },
  { path: '/after/:id', name: 'data-after', component: AfterUserPage },
  { path: '/before/:id', name: 'data-before', component: BeforeUserPage },
]

/** 在导航确认前等待当前 before 请求，并处理成功、失败和过期分支。 */
async function prepareBeforeNavigation(to: RouteLocationNormalizedLoaded): Promise<false | void> {
  if (to.name !== 'data-before') {
    activeBeforeRequest?.abort('导航到非导航前取数页面')
    return
  }

  activeBeforeRequest?.abort('新的导航前请求开始')
  const routeId = String(to.params.id)
  const request = createDeferredRequest('before', routeId, to.fullPath)
  activeBeforeRequest = request
  globalPending.value = true
  globalTarget.value = to.fullPath
  globalError.value = '无'

  try {
    const data = await request.promise
    if (activeBeforeRequest !== request) {
      appendTimeline(`#${request.token} before stale prepare ignored`)
      return
    }
    preparedByPath.set(to.fullPath, data)
    preparedKey.value = to.fullPath
    appendTimeline(`#${request.token} before prepared ${to.fullPath}`)
  } catch (caught) {
    if (request.state === 'aborted') return
    if (activeBeforeRequest === request) globalError.value = String(caught)
    return false
  } finally {
    if (activeBeforeRequest === request) globalPending.value = false
  }
}

/** 在 afterEach 中记录已结算导航，并同步 currentRoute。 */
function recordNavigation(
  to: RouteLocationNormalizedLoaded,
  from: RouteLocationNormalizedLoaded,
  failure: NavigationFailure | void,
): void {
  navigationResult.value = formatNavigationResult(failure)
  appendTimeline(`afterEach：${from.fullPath} → ${to.fullPath}；${navigationResult.value}`)
  void syncVisibleState()
}

const MiniAppRoot = defineComponent({
  name: 'RouteDataFetchingMiniApp',
  /** 渲染确定性的导航命令与真实 RouterView。 */
  setup() {
    const router = useRouter()

    /** 导航到立即提交并由页面 watcher 取数的目标。 */
    async function navigateAfter(routeId: string): Promise<void> {
      pendingAction = `after/${routeId}`
      await router.push({ name: 'data-after', params: { id: routeId } })
    }

    /** 发起在 beforeResolve 中等待的导航，但不阻塞界面请求控件。 */
    function navigateBefore(routeId: string): void {
      pendingAction = `before/${routeId}`
      const navigation = router.push({ name: 'data-before', params: { id: routeId } })
      pendingNavigations.add(navigation)
      void navigation
        .then((failure) => {
          if (failure) navigationResult.value = formatNavigationResult(failure)
        })
        .catch((caught: unknown) => {
          globalError.value = String(caught)
        })
        .finally(() => pendingNavigations.delete(navigation))
    }

    return () =>
      h('div', { class: 'mini-app-root' }, [
        h('div', { class: 'strategy-actions', 'aria-label': '路由取数导航' }, [
          h('button', { type: 'button', onClick: () => navigateAfter('1') }, '导航后：用户 1'),
          h('button', { type: 'button', onClick: () => navigateAfter('2') }, '导航后：用户 2'),
          h('button', { type: 'button', onClick: () => navigateBefore('3') }, '导航前：用户 3'),
          h('button', { type: 'button', onClick: () => navigateBefore('4') }, '导航前：用户 4'),
        ]),
        h(RouterView),
      ])
  },
})

/** 清理旧 mini-app，并从中立位置重建实验。 */
async function initializeDemo(): Promise<void> {
  if (!miniAppHost.value) return

  ready.value = false
  activeAfterRequest?.abort('重置实验')
  activeBeforeRequest?.abort('重置实验')
  miniApp?.unmount()
  await Promise.allSettled(pendingNavigations)
  await nextTick()
  activeAfterRequest = undefined
  activeBeforeRequest = undefined
  requestToken = 0
  requests.value = []
  preparedByPath.clear()
  timeline.value = []
  localLoading.value = false
  localData.value = '无'
  localError.value = '无'
  globalPending.value = false
  globalTarget.value = '无'
  globalError.value = '无'
  preparedKey.value = '无'
  pendingAction = 'initial'

  demoRouter = createRouter({ history: createMemoryHistory(), routes })
  demoRouter.beforeResolve(prepareBeforeNavigation)
  demoRouter.afterEach(recordNavigation)
  await demoRouter.replace({ name: 'data-start' })
  await demoRouter.isReady()

  miniApp = createApp(MiniAppRoot)
  miniApp.use(demoRouter)
  miniApp.mount(miniAppHost.value)
  ready.value = true
  await syncVisibleState()
}

/** 在页面挂载后初始化隔离取数实验。 */
onMounted(() => {
  void initializeDemo()
})

/** 离开课程时取消 pending 请求并卸载 mini-app。 */
onBeforeUnmount(() => {
  activeAfterRequest?.abort('课程卸载')
  activeBeforeRequest?.abort('课程卸载')
  miniApp?.unmount()
})
</script>

<template>
  <section class="route-data-lab" aria-label="路由数据获取实验">
    <div class="lab-copy">
      <p class="eyebrow">watch + beforeResolve + deferred request</p>
      <h3>同一份数据，两种导航提交时机</h3>
      <p>请求只在点击“完成”或“拒绝”后结算，不依赖网络或计时器。</p>
    </div>

    <div ref="miniAppHost" class="mini-app-host" />

    <div class="state-strip" aria-live="polite">
      <p>
        <span>current route</span>
        <strong data-testid="mini-current-path">{{ currentPath }}</strong>
      </p>
      <p>
        <span>navigation result</span>
        <strong data-testid="mini-navigation-result">{{ navigationResult }}</strong>
      </p>
      <p>
        <span>宿主页面路径</span>
        <strong data-testid="host-path-now">{{ hostPath }}</strong>
      </p>
    </div>

    <div class="ownership-panels" aria-live="polite">
      <section aria-label="导航后页面状态">
        <h4>页面局部状态</h4>
        <p>
          loading：<strong data-testid="local-loading">{{ localLoading }}</strong>
        </p>
        <p>
          data：<strong data-testid="local-data">{{ localData }}</strong>
        </p>
        <p>
          error：<strong data-testid="local-error">{{ localError }}</strong>
        </p>
      </section>
      <section aria-label="导航前全局状态">
        <h4>全局导航状态</h4>
        <p>
          pending：<strong data-testid="global-pending">{{ globalPending }}</strong>
        </p>
        <p>
          target：<strong data-testid="global-target">{{ globalTarget }}</strong>
        </p>
        <p>
          error：<strong data-testid="global-error">{{ globalError }}</strong>
        </p>
        <p>
          prepared：<strong data-testid="prepared-key">{{ preparedKey }}</strong>
        </p>
      </section>
    </div>

    <div class="panel-heading">
      <h4>受控请求队列</h4>
      <button type="button" :disabled="!ready" @click="initializeDemo">重置实验</button>
    </div>
    <ul class="request-list" data-testid="request-list">
      <li v-for="request in requests" :key="request.token">
        <p>
          <strong>#{{ request.token }} {{ formatStrategy(request.strategy) }}</strong>
          <span>{{ request.targetFullPath }} · {{ request.state }}</span>
        </p>
        <div class="request-actions">
          <button type="button" :disabled="request.state !== 'pending'" @click="request.resolve">
            完成 #{{ request.token }}
          </button>
          <button type="button" :disabled="request.state !== 'pending'" @click="request.reject">
            拒绝 #{{ request.token }}
          </button>
        </div>
      </li>
    </ul>

    <h4 class="timeline-heading">事件时间线</h4>
    <ol class="timeline" data-testid="request-timeline">
      <li v-for="(item, index) in timeline" :key="`${index}-${item}`">{{ item }}</li>
    </ol>
  </section>
</template>

<style scoped>
.route-data-lab {
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-primary);
}

.lab-copy h3,
.lab-copy p,
.state-strip p,
.ownership-panels h4,
.ownership-panels p,
.panel-heading h4,
.request-list p,
.timeline-heading {
  margin: 0;
}

.lab-copy > * + * {
  margin-top: var(--space-2);
}

.eyebrow,
.mini-app-host :deep(.route-kicker) {
  color: var(--color-accent);
  font-size: var(--font-size-sm);
  font-weight: 700;
}

.mini-app-host {
  margin-top: var(--space-4);
}

.mini-app-host :deep(.strategy-actions) {
  display: flex;
  flex-wrap: wrap;
  margin-right: calc(var(--space-2) * -1);
}

.mini-app-host :deep(.strategy-actions button),
.panel-heading button,
.request-actions button {
  min-height: 40px;
  padding: var(--space-2) var(--space-3);
  margin: 0 var(--space-2) var(--space-2) 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
  overflow-wrap: anywhere;
  background: var(--color-bg-elevated);
  transition:
    transform var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out),
    background-color var(--duration-fast) var(--ease-out);
}

.mini-app-host :deep(button:hover:not(:disabled)),
.panel-heading button:hover:not(:disabled),
.request-actions button:hover:not(:disabled) {
  border-color: var(--color-accent);
  background: var(--color-accent-soft);
}

.mini-app-host :deep(button:active:not(:disabled)),
.panel-heading button:active:not(:disabled),
.request-actions button:active:not(:disabled) {
  transform: scale(0.97);
}

.mini-app-host :deep(.route-card),
.ownership-panels section,
.request-list li {
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
}

.mini-app-host :deep(.route-card) {
  margin-top: var(--space-2);
  border-left: 3px solid var(--color-accent);
}

.mini-app-host :deep(.route-card > *) {
  margin: 0;
  overflow-wrap: anywhere;
}

.mini-app-host :deep(.route-card > * + *) {
  margin-top: var(--space-2);
}

.state-strip,
.ownership-panels {
  display: flex;
  flex-wrap: wrap;
  margin: var(--space-3) calc(var(--space-2) * -1) 0 0;
}

.state-strip p,
.ownership-panels section {
  min-width: 200px;
  flex: 1 1 200px;
  padding: var(--space-3);
  margin: 0 var(--space-2) var(--space-2) 0;
}

.state-strip p {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
}

.state-strip span,
.request-list span {
  display: block;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.state-strip strong,
.ownership-panels strong,
.request-list strong,
.request-list span {
  overflow-wrap: anywhere;
}

.ownership-panels p + p {
  margin-top: var(--space-1);
}

.panel-heading {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  padding-top: var(--space-3);
  margin-top: var(--space-2);
  margin-right: calc(var(--space-2) * -1);
  border-top: 1px solid var(--color-border);
}

.panel-heading h4 {
  margin-right: var(--space-2);
  margin-bottom: var(--space-2);
}

.request-list {
  padding: 0;
  margin: 0;
  list-style: none;
}

.request-list li + li {
  margin-top: var(--space-2);
}

.request-actions {
  display: flex;
  flex-wrap: wrap;
  margin-top: var(--space-2);
  margin-right: calc(var(--space-2) * -1);
}

.timeline-heading {
  padding-top: var(--space-3);
  margin-top: var(--space-3);
  border-top: 1px solid var(--color-border);
}

.timeline {
  padding-left: var(--space-4);
  margin: var(--space-2) 0 0;
}

.timeline li {
  overflow-wrap: anywhere;
}

.timeline li + li {
  margin-top: var(--space-1);
}

@media (max-width: 640px) {
  .route-data-lab {
    padding: var(--space-3);
  }

  .mini-app-host :deep(.strategy-actions button),
  .state-strip p,
  .ownership-panels section,
  .panel-heading button,
  .request-actions button {
    box-sizing: border-box;
    width: calc(100% - var(--space-2));
    flex-basis: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .mini-app-host :deep(.strategy-actions button),
  .panel-heading button,
  .request-actions button {
    transition: none;
  }
}
</style>
