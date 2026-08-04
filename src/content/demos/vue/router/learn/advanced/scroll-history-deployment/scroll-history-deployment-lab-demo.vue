<script setup lang="ts">
import { createApp, defineComponent, h, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import type { App } from 'vue'
import { RouterView, createMemoryHistory, createRouter, useRoute, useRouter } from 'vue-router'
import type { RouteLocationRaw, RouteRecordRaw, Router, RouterHistory } from 'vue-router'

interface DeferredSignal {
  promise: Promise<void>
  resolve: () => void
}

const miniAppHost = ref<HTMLElement | null>(null)
const ready = ref(false)
const busy = ref(false)
const generation = ref(0)
const hostPath = ref('等待挂载')
const hostScroll = ref('等待挂载')
const hostHistoryLength = ref('等待挂载')
const currentPath = ref('尚未初始化')
const matchedNames = ref('无')
const currentParams = ref('无')
const currentQuery = ref('无')
const navigationOutcome = ref('尚未执行')
const scrollCallCount = ref(0)
const lastScrollTo = ref('尚未执行')
const lastScrollFrom = ref('尚未执行')
const lastSavedPosition = ref('尚未执行')
const lastScrollReturn = ref('尚未执行')
const historyBase = ref('尚未初始化')
const guideHref = ref('尚未初始化')
const restorationBefore = ref('不支持')
const restorationActive = ref('不支持')
const lastRestored = ref('尚未执行')
const navigationLog = ref<string[]>([])
const scrollLog = ref<string[]>([])

let miniApp: App<Element> | undefined
let activeHistory: RouterHistory | undefined
let savedScrollRestoration: ScrollRestoration | undefined
let scrollSignal = createDeferredSignal()

/** 创建一个只结算一次的真实回调等待信号。 */
function createDeferredSignal(): DeferredSignal {
  let settle!: () => void
  const promise = new Promise<void>((resolve) => {
    settle = resolve
  })
  let settled = false

  return {
    promise,
    resolve: () => {
      if (settled) return
      settled = true
      settle()
    },
  }
}

/** 把 route params 或 query 转换为稳定的可见文本。 */
function formatRecord(value: Record<string, unknown>): string {
  return Object.keys(value).length === 0 ? '无' : JSON.stringify(value)
}

/** 把 matched records 的具名身份转换为可见文本。 */
function formatMatchedNames(router: Router): string {
  const names = router.currentRoute.value.matched.map((record) => String(record.name ?? '未命名'))
  return names.length === 0 ? '无' : names.join(' -> ')
}

/** 记录一条独立 Router 导航时间线。 */
function appendNavigation(message: string): void {
  navigationLog.value = [...navigationLog.value, message]
}

/** 记录一条由真实 scrollBehavior 产生的时间线。 */
function appendScroll(message: string): void {
  scrollLog.value = [...scrollLog.value, message]
}

/** 同步独立 Router 与宿主页面的可见状态。 */
async function syncVisibleState(router: Router): Promise<void> {
  await nextTick()
  const route = router.currentRoute.value
  currentPath.value = route.fullPath
  matchedNames.value = formatMatchedNames(router)
  currentParams.value = formatRecord(route.params)
  currentQuery.value = formatRecord(route.query)
  hostPath.value = `${window.location.pathname}${window.location.search}${window.location.hash}`
  hostScroll.value = `${window.scrollX},${window.scrollY}`
  hostHistoryLength.value = String(window.history.length)
}

/** 渲染一个读取当前 route 的轻量页面。 */
function createRoutePage(title: string, marker: string) {
  return defineComponent({
    name: `ScrollHistory${marker}Page`,
    /** 渲染当前独立 RouterView 的 route 证据。 */
    setup() {
      const route = useRoute()
      return () =>
        h('section', { class: 'route-card', 'data-testid': 'scroll-route-view' }, [
          h('p', { class: 'route-kicker' }, marker),
          h('h4', title),
          h('p', { 'data-testid': 'scroll-route-card-path' }, route.fullPath),
        ])
    },
  })
}

const routes: RouteRecordRaw[] = [
  {
    path: '/guide/:chapter',
    name: 'guide',
    component: createRoutePage('指南章节', 'guide'),
  },
  {
    path: '/search',
    name: 'search',
    component: createRoutePage('站内搜索', 'search'),
  },
]

/** 执行一次导航，并等待真实 scrollBehavior 写入完成信号。 */
async function navigate(router: Router, label: string, to: RouteLocationRaw): Promise<void> {
  if (busy.value) return
  busy.value = true
  scrollSignal = createDeferredSignal()
  appendNavigation(`command ${label}`)

  try {
    const failure = await router.push(to)
    await scrollSignal.promise
    await syncVisibleState(router)
    navigationOutcome.value = failure
      ? `NavigationFailure -> ${router.currentRoute.value.fullPath}`
      : `success -> ${router.currentRoute.value.fullPath}`
    appendNavigation(navigationOutcome.value)
  } finally {
    busy.value = false
  }
}

const MiniAppRoot = defineComponent({
  name: 'ScrollHistoryDeploymentMiniApp',
  /** 渲染三个导航命令与独立 RouterView。 */
  setup() {
    const router = useRouter()

    return () =>
      h('div', { class: 'mini-app-root' }, [
        h('div', { class: 'command-actions', 'aria-label': '滚动回调导航命令' }, [
          h(
            'button',
            {
              type: 'button',
              disabled: busy.value,
              onClick: () => navigate(router, 'search', { name: 'search', query: { q: 'router' } }),
            },
            '前往搜索页',
          ),
          h(
            'button',
            {
              type: 'button',
              disabled: busy.value,
              onClick: () =>
                navigate(router, 'guide/deploy', {
                  name: 'guide',
                  params: { chapter: 'deploy' },
                  query: { mode: 'check' },
                }),
            },
            '前往部署章节',
          ),
          h(
            'button',
            {
              type: 'button',
              disabled: busy.value,
              onClick: () =>
                navigate(router, 'guide/start', {
                  name: 'guide',
                  params: { chapter: 'start' },
                  query: { mode: 'read' },
                }),
            },
            '返回开始章节',
          ),
        ]),
        h(RouterView),
      ])
  },
})

/** 卸载独立应用、销毁 adapter，并归还宿主滚动恢复策略。 */
function teardownDemo(): void {
  miniApp?.unmount()
  miniApp = undefined
  activeHistory?.destroy()
  activeHistory = undefined

  if (savedScrollRestoration !== undefined) {
    window.history.scrollRestoration = savedScrollRestoration
    lastRestored.value = savedScrollRestoration
    savedScrollRestoration = undefined
  }
}

/** 清空状态并建立新的独立 memory router。 */
async function initializeDemo(): Promise<void> {
  if (!miniAppHost.value) return

  teardownDemo()
  ready.value = false
  busy.value = false
  generation.value += 1
  currentPath.value = '尚未初始化'
  matchedNames.value = '无'
  currentParams.value = '无'
  currentQuery.value = '无'
  navigationOutcome.value = '尚未执行'
  scrollCallCount.value = 0
  lastScrollTo.value = '尚未执行'
  lastScrollFrom.value = '尚未执行'
  lastSavedPosition.value = '尚未执行'
  lastScrollReturn.value = '尚未执行'
  navigationLog.value = []
  scrollLog.value = []

  const generationId = generation.value
  savedScrollRestoration = window.history.scrollRestoration
  restorationBefore.value = savedScrollRestoration
  scrollSignal = createDeferredSignal()

  const routerHistory = createMemoryHistory('/academy')
  activeHistory = routerHistory
  historyBase.value = routerHistory.base
  guideHref.value = routerHistory.createHref('/guide/start?mode=read')
  const router = createRouter({
    history: routerHistory,
    routes,
    scrollBehavior(to, from, savedPosition) {
      if (generation.value !== generationId) return false
      scrollCallCount.value += 1
      lastScrollTo.value = to.fullPath
      lastScrollFrom.value = from.fullPath
      lastSavedPosition.value = savedPosition ? JSON.stringify(savedPosition) : 'null'
      lastScrollReturn.value = 'false'
      appendScroll(
        `#${scrollCallCount.value} ${from.fullPath} -> ${to.fullPath}; saved=${lastSavedPosition.value}; return=false`,
      )
      scrollSignal.resolve()
      return false
    },
  })
  restorationActive.value = window.history.scrollRestoration

  await router.replace({
    name: 'guide',
    params: { chapter: 'start' },
    query: { mode: 'read' },
  })
  await router.isReady()
  await scrollSignal.promise

  miniApp = createApp(MiniAppRoot)
  miniApp.use(router)
  miniApp.mount(miniAppHost.value)
  await syncVisibleState(router)
  navigationOutcome.value = `initial -> ${router.currentRoute.value.fullPath}`
  appendNavigation(navigationOutcome.value)
  ready.value = true
}

/** 在课程页挂载后初始化滚动与 history 实验。 */
onMounted(() => {
  void initializeDemo()
})

/** 离开课程时完整归还宿主状态。 */
onBeforeUnmount(() => {
  teardownDemo()
})
</script>

<template>
  <section class="scroll-history-lab" aria-label="滚动、历史模式与部署实验">
    <div class="lab-copy">
      <p class="eyebrow">memory router + real scrollBehavior</p>
      <h3>导航、滚动与部署各自留下证据</h3>
      <p>运行区只验证独立 Router；下方责任表不冒充真实服务器测试。</p>
    </div>

    <div ref="miniAppHost" class="mini-app-host" />

    <button class="reset-button" type="button" :disabled="!ready || busy" @click="initializeDemo">
      重置实验
    </button>

    <div class="status-list" data-testid="scroll-status" aria-live="polite">
      <p>
        <span>ready</span><strong data-testid="scroll-ready">{{ ready }}</strong>
      </p>
      <p>
        <span>generation</span><strong data-testid="scroll-generation">{{ generation }}</strong>
      </p>
      <p>
        <span>宿主路径</span><strong data-testid="scroll-host-path">{{ hostPath }}</strong>
      </p>
      <p>
        <span>宿主 scroll x,y</span
        ><strong data-testid="scroll-host-position">{{ hostScroll }}</strong>
      </p>
      <p>
        <span>宿主 history.length</span>
        <strong data-testid="scroll-host-history-length">{{ hostHistoryLength }}</strong>
      </p>
      <p>
        <span>current fullPath</span
        ><strong data-testid="scroll-current-path">{{ currentPath }}</strong>
      </p>
      <p>
        <span>matched names</span
        ><strong data-testid="scroll-matched-names">{{ matchedNames }}</strong>
      </p>
      <p>
        <span>params</span><strong data-testid="scroll-params">{{ currentParams }}</strong>
      </p>
      <p>
        <span>query</span><strong data-testid="scroll-query">{{ currentQuery }}</strong>
      </p>
      <p>
        <span>navigation outcome</span>
        <strong data-testid="scroll-navigation-outcome">{{ navigationOutcome }}</strong>
      </p>
      <p>
        <span>callback count</span
        ><strong data-testid="scroll-call-count">{{ scrollCallCount }}</strong>
      </p>
      <p>
        <span>last to</span><strong data-testid="scroll-last-to">{{ lastScrollTo }}</strong>
      </p>
      <p>
        <span>last from</span><strong data-testid="scroll-last-from">{{ lastScrollFrom }}</strong>
      </p>
      <p>
        <span>savedPosition</span>
        <strong data-testid="scroll-saved-position">{{ lastSavedPosition }}</strong>
      </p>
      <p>
        <span>return</span><strong data-testid="scroll-return">{{ lastScrollReturn }}</strong>
      </p>
      <p>
        <span>memory base</span><strong data-testid="scroll-history-base">{{ historyBase }}</strong>
      </p>
      <p>
        <span>createHref</span><strong data-testid="scroll-guide-href">{{ guideHref }}</strong>
      </p>
      <p>
        <span>scrollRestoration before</span>
        <strong data-testid="scroll-restoration-before">{{ restorationBefore }}</strong>
      </p>
      <p>
        <span>scrollRestoration active</span>
        <strong data-testid="scroll-restoration-active">{{ restorationActive }}</strong>
      </p>
      <p>
        <span>last teardown restored</span>
        <strong data-testid="scroll-restoration-restored">{{ lastRestored }}</strong>
      </p>
    </div>

    <div class="timeline-row">
      <section>
        <h4>导航时间线</h4>
        <ol data-testid="scroll-navigation-log">
          <li v-for="(event, index) in navigationLog" :key="`${index}-${event}`">{{ event }}</li>
        </ol>
      </section>
      <section>
        <h4>scrollBehavior 时间线</h4>
        <ol data-testid="scroll-callback-log">
          <li v-for="(event, index) in scrollLog" :key="`${index}-${event}`">{{ event }}</li>
        </ol>
      </section>
    </div>

    <div class="table-scroll">
      <table>
        <caption>
          history mode 责任表
        </caption>
        <thead>
          <tr>
            <th>模式</th>
            <th>URL / 初始位置</th>
            <th>base</th>
            <th>服务器责任</th>
          </tr>
        </thead>
        <tbody>
          <tr data-testid="history-mode-row">
            <th>web</th>
            <td>正常 pathname / 当前 URL</td>
            <td>公开路径根</td>
            <td>深链接 fallback</td>
          </tr>
          <tr data-testid="history-mode-row">
            <th>hash</th>
            <td># 后 / 当前 hash</td>
            <td>入口路径与 #</td>
            <td>route fragment 不发送</td>
          </tr>
          <tr data-testid="history-mode-row">
            <th>memory</th>
            <td>不改地址栏 / nowhere</td>
            <td>createHref 根</td>
            <td>SSR 或宿主选择初始 URL</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="responsibility-note" data-testid="deployment-responsibility">
      <strong>两层页面责任</strong>
      <p>服务器 fallback：让深链接进入 SPA；应用 catch-all：显示 NotFound。</p>
      <p>真实 HTTP 404：由服务器或 SSR matcher 决定，不能由浏览器内静态表证明。</p>
    </div>
  </section>
</template>

<style scoped>
.scroll-history-lab {
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-primary);
}

.lab-copy h3,
.lab-copy p,
.status-list p,
.timeline-row h4,
.responsibility-note p {
  margin: 0;
}

.lab-copy > * + *,
.responsibility-note > * + * {
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

.mini-app-host :deep(.command-actions),
.status-list,
.timeline-row {
  display: flex;
  flex-wrap: wrap;
  margin-right: calc(var(--space-2) * -1);
}

.mini-app-host :deep(.command-actions button),
.reset-button {
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
.reset-button:hover:not(:disabled) {
  border-color: var(--color-accent);
  background: var(--color-accent-soft);
}

.mini-app-host :deep(button:active:not(:disabled)),
.reset-button:active:not(:disabled) {
  transform: scale(0.97);
}

.mini-app-host :deep(.route-card),
.status-list p,
.timeline-row section,
.responsibility-note {
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

.reset-button,
.status-list,
.timeline-row,
.table-scroll,
.responsibility-note {
  margin-top: var(--space-3);
}

.status-list p {
  min-width: 180px;
  flex: 1 1 180px;
  margin: 0 var(--space-2) var(--space-2) 0;
}

.status-list span {
  display: block;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.status-list strong,
.timeline-row li,
.responsibility-note p,
td,
th {
  overflow-wrap: anywhere;
}

.timeline-row section {
  min-width: 240px;
  flex: 1 1 280px;
  margin: 0 var(--space-2) var(--space-2) 0;
}

.timeline-row ol {
  padding-left: var(--space-4);
  margin: var(--space-2) 0 0;
}

.timeline-row li + li {
  margin-top: var(--space-1);
}

.table-scroll {
  max-width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 620px;
  border-collapse: collapse;
}

caption {
  padding-bottom: var(--space-2);
  color: var(--color-text-primary);
  font-weight: 700;
  text-align: left;
}

th,
td {
  padding: var(--space-2);
  border: 1px solid var(--color-border);
  text-align: left;
  vertical-align: top;
}

thead th {
  background: var(--color-bg-secondary);
}

.responsibility-note {
  border-left: 3px solid var(--color-accent);
}

@media (max-width: 640px) {
  .scroll-history-lab {
    padding: var(--space-3);
  }

  .mini-app-host :deep(.command-actions button),
  .reset-button,
  .status-list p,
  .timeline-row section {
    box-sizing: border-box;
    width: calc(100% - var(--space-2));
    min-width: 0;
    flex-basis: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .mini-app-host :deep(.command-actions button),
  .reset-button {
    transition: none;
  }
}
</style>
