<script setup lang="ts">
import { createApp, defineComponent, h, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import type { App } from 'vue'
import { RouterView, createMemoryHistory, createRouter, useRouter } from 'vue-router'
import type { NavigationFailure, Router, RouteRecordRaw } from 'vue-router'

type LoaderPhase = 'idle' | 'waiting-release' | 'importing' | 'resolved' | 'reused'
type NavigationState = 'idle' | 'pending' | 'committed' | 'failed'
type GateState = 'idle' | 'waiting' | 'released'

interface ImportGate {
  promise: Promise<void>
  release: () => void
}

const miniAppHost = ref<HTMLElement | null>(null)
const ready = ref(false)
const currentPath = ref('尚未初始化')
const targetPath = ref('无')
const hostPath = ref('等待挂载')
const navigationState = ref<NavigationState>('idle')
const loaderPhase = ref<LoaderPhase>('idle')
const gateState = ref<GateState>('idle')
const loaderCalls = ref(0)
const importCalls = ref(0)
const resolvedCalls = ref(0)
const eventLog = ref<string[]>([])

let miniApp: App<Element> | undefined
let demoRouter: Router | undefined
let importGate: ImportGate = createImportGate()

/** 创建一个只能放行一次的动态 import gate。 */
function createImportGate(): ImportGate {
  let releasePromise!: () => void
  const promise = new Promise<void>((resolve) => {
    releasePromise = resolve
  })
  let released = false

  return {
    promise,
    release: () => {
      if (released) return
      released = true
      releasePromise()
    },
  }
}

/** 向确定性事件日志追加一条记录。 */
function appendEvent(message: string): void {
  eventLog.value = [...eventLog.value, message]
}

/** 从指定独立 router 同步已提交路径与宿主路径。 */
async function syncVisibleState(router: Router): Promise<void> {
  await nextTick()
  currentPath.value = router.currentRoute.value.fullPath
  hostPath.value = `${window.location.pathname}${window.location.search}${window.location.hash}`
}

/** 等待手动 gate 后执行真实动态 import，并把模块交给 Router 解析。 */
async function loadLazyReportRoute() {
  loaderCalls.value += 1
  loaderPhase.value = 'waiting-release'
  gateState.value = 'waiting'
  appendEvent(`loader call #${loaderCalls.value}`)
  appendEvent('gate waiting')

  await importGate.promise
  importCalls.value += 1
  loaderPhase.value = 'importing'
  appendEvent(`import call #${importCalls.value}`)
  const module = await import('./lazy-report-route')
  resolvedCalls.value += 1
  loaderPhase.value = 'resolved'
  appendEvent(`import resolved #${resolvedCalls.value}`)
  return module
}

const HomeRoute = defineComponent({
  name: 'LazyLoadingHomeRoute',
  /** 渲染懒路由实验的 eager 起点。 */
  setup() {
    return () =>
      h('section', { class: 'route-card', 'data-testid': 'lazy-home-view' }, [
        h('p', { class: 'route-kicker' }, 'eager route'),
        h('h4', '首页已提交'),
        h('p', '进入报表页前，懒路由 loader 不应调用。'),
      ])
  },
})

/** 为每次重置创建未解析的全新 route records。 */
function createRoutes(): RouteRecordRaw[] {
  return [
    { path: '/', name: 'lazy-home', component: HomeRoute },
    { path: '/report', name: 'lazy-report', component: loadLazyReportRoute },
  ]
}

const MiniAppRoot = defineComponent({
  name: 'LazyLoadingMiniApp',
  /** 渲染导航命令与独立 RouterView。 */
  setup() {
    const router = useRouter()

    /** 非阻塞地发起报表页导航，使 gate 控件仍可交互。 */
    function navigateToReport(): void {
      const revisit = loaderCalls.value > 0
      targetPath.value = '/report'
      navigationState.value = 'pending'
      if (revisit) loaderPhase.value = 'reused'
      appendEvent(revisit ? 'navigation start /report (revisit)' : 'navigation start /report')

      void router.push({ name: 'lazy-report' }).catch((caught: unknown) => {
        navigationState.value = 'failed'
        appendEvent(`navigation failed: ${String(caught)}`)
      })
    }

    /** 返回 eager 首页，为再次进入懒路由建立路径。 */
    function navigateHome(): void {
      targetPath.value = '/'
      navigationState.value = 'pending'
      appendEvent('navigation start /')
      void router.push({ name: 'lazy-home' }).catch((caught: unknown) => {
        navigationState.value = 'failed'
        appendEvent(`navigation failed: ${String(caught)}`)
      })
    }

    return () =>
      h('div', { class: 'mini-app-root' }, [
        h('div', { class: 'route-actions', 'aria-label': '懒路由导航' }, [
          h(
            'button',
            {
              type: 'button',
              disabled:
                navigationState.value === 'pending' || router.currentRoute.value.path === '/report',
              onClick: navigateToReport,
            },
            '进入报表页',
          ),
          h(
            'button',
            {
              type: 'button',
              disabled:
                navigationState.value === 'pending' || router.currentRoute.value.path === '/',
              onClick: navigateHome,
            },
            '返回首页',
          ),
        ]),
        h(RouterView),
      ])
  },
})

/** 放行首次懒路由的真实动态 import。 */
function releaseImport(): void {
  if (gateState.value !== 'waiting') return
  gateState.value = 'released'
  appendEvent('gate released')
  importGate.release()
}

/** 清理旧 mini-app，并重建未解析的独立 router 实验。 */
async function initializeDemo(): Promise<void> {
  if (!miniAppHost.value) return

  ready.value = false
  miniApp?.unmount()
  importGate = createImportGate()
  currentPath.value = '尚未初始化'
  targetPath.value = '无'
  navigationState.value = 'idle'
  loaderPhase.value = 'idle'
  gateState.value = 'idle'
  loaderCalls.value = 0
  importCalls.value = 0
  resolvedCalls.value = 0
  eventLog.value = []

  const router = createRouter({ history: createMemoryHistory(), routes: createRoutes() })
  demoRouter = router
  await router.replace({ name: 'lazy-home' })
  await router.isReady()
  router.afterEach((to, _from, failure: NavigationFailure | void) => {
    navigationState.value = failure ? 'failed' : 'committed'
    targetPath.value = '无'
    const successMessage =
      to.path === '/report' && loaderPhase.value === 'reused'
        ? 'navigation commit /report (loader unchanged)'
        : `navigation commit ${to.fullPath}`
    appendEvent(failure ? `navigation failed ${to.fullPath}` : successMessage)
    void syncVisibleState(router)
  })

  miniApp = createApp(MiniAppRoot)
  miniApp.use(router)
  miniApp.mount(miniAppHost.value)
  await syncVisibleState(router)
  navigationState.value = 'idle'
  ready.value = true
}

/** 在课程页挂载后初始化懒路由实验。 */
onMounted(() => {
  void initializeDemo()
})

/** 离开课程时卸载独立 mini-app。 */
onBeforeUnmount(() => {
  miniApp?.unmount()
  demoRouter = undefined
})
</script>

<template>
  <section class="lazy-loading-lab" aria-label="路由懒加载实验">
    <div class="lab-copy">
      <p class="eyebrow">memory router + deferred gate + dynamic import</p>
      <h3>先看见 loader，再放行 import</h3>
      <p>计数只回答 Router 的解析时序，不猜测 chunk 名称或网络缓存。</p>
    </div>

    <div ref="miniAppHost" class="mini-app-host" />

    <div class="gate-actions">
      <button type="button" :disabled="!ready || gateState !== 'waiting'" @click="releaseImport">
        允许 import
      </button>
      <button
        type="button"
        :disabled="!ready || navigationState === 'pending'"
        @click="initializeDemo"
      >
        重置实验
      </button>
    </div>

    <div class="state-strip" aria-live="polite">
      <p>
        <span>current route</span>
        <strong data-testid="lazy-current-path">{{ currentPath }}</strong>
      </p>
      <p>
        <span>target</span>
        <strong data-testid="lazy-target-path">{{ targetPath }}</strong>
      </p>
      <p>
        <span>navigation</span>
        <strong data-testid="lazy-navigation-state">{{ navigationState }}</strong>
      </p>
      <p>
        <span>loader phase</span>
        <strong data-testid="lazy-loader-phase">{{ loaderPhase }}</strong>
      </p>
      <p>
        <span>gate</span>
        <strong data-testid="lazy-gate-state">{{ gateState }}</strong>
      </p>
      <p>
        <span>宿主路径</span>
        <strong data-testid="lazy-host-path">{{ hostPath }}</strong>
      </p>
    </div>

    <div class="counter-strip" aria-label="懒加载计数">
      <p>
        loader calls <strong data-testid="loader-calls">{{ loaderCalls }}</strong>
      </p>
      <p>
        import calls <strong data-testid="import-calls">{{ importCalls }}</strong>
      </p>
      <p>
        resolved calls <strong data-testid="resolved-calls">{{ resolvedCalls }}</strong>
      </p>
    </div>

    <h4 class="event-heading">事件时间线</h4>
    <ol class="event-log" data-testid="lazy-event-log">
      <li v-for="(event, index) in eventLog" :key="`${index}-${event}`">{{ event }}</li>
    </ol>
  </section>
</template>

<style scoped>
.lazy-loading-lab {
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-primary);
}

.lab-copy h3,
.lab-copy p,
.state-strip p,
.counter-strip p,
.event-heading {
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

.mini-app-host :deep(.route-actions),
.gate-actions,
.state-strip,
.counter-strip {
  display: flex;
  flex-wrap: wrap;
  margin-right: calc(var(--space-2) * -1);
}

.gate-actions,
.state-strip,
.counter-strip {
  margin-top: var(--space-3);
}

.mini-app-host :deep(.route-actions button),
.gate-actions button {
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
.gate-actions button:hover:not(:disabled) {
  border-color: var(--color-accent);
  background: var(--color-accent-soft);
}

.mini-app-host :deep(button:active:not(:disabled)),
.gate-actions button:active:not(:disabled) {
  transform: scale(0.97);
}

.mini-app-host :deep(.route-card),
.state-strip p,
.counter-strip p {
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

.state-strip p,
.counter-strip p {
  min-width: 160px;
  flex: 1 1 160px;
  margin: 0 var(--space-2) var(--space-2) 0;
}

.state-strip span {
  display: block;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.state-strip strong,
.counter-strip strong {
  overflow-wrap: anywhere;
}

.event-heading {
  padding-top: var(--space-3);
  margin-top: var(--space-2);
  border-top: 1px solid var(--color-border);
}

.event-log {
  padding-left: var(--space-4);
  margin: var(--space-2) 0 0;
}

.event-log li {
  overflow-wrap: anywhere;
}

.event-log li + li {
  margin-top: var(--space-1);
}

@media (max-width: 640px) {
  .lazy-loading-lab {
    padding: var(--space-3);
  }

  .mini-app-host :deep(.route-actions button),
  .gate-actions button,
  .state-strip p,
  .counter-strip p {
    box-sizing: border-box;
    width: calc(100% - var(--space-2));
    flex-basis: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .mini-app-host :deep(.route-actions button),
  .gate-actions button {
    transition: none;
  }
}
</style>
