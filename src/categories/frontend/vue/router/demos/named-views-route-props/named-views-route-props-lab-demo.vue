<script setup lang="ts">
import { createApp, defineComponent, h, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import type { App } from 'vue'
import { RouterView, createMemoryHistory, createRouter, useRoute, useRouter } from 'vue-router'
import type {
  NavigationFailure,
  RouteLocationNormalizedLoaded,
  Router,
  RouteRecordRaw,
} from 'vue-router'

const miniAppHost = ref<HTMLElement | null>(null)
const ready = ref(false)
const currentPathname = ref('尚未初始化')
const matchedNames = ref('无')
const currentParams = ref('无')
const currentQuery = ref('无')
const navigationResult = ref('等待导航')
const hostPath = ref('等待挂载')
const timeline = ref<string[]>([])
const comparisonMode = ref<'props' | 'route'>('props')

let miniApp: App<Element> | undefined
let demoRouter: Router | undefined
let pendingAction = 'initial'

/** 向时间线追加一条可观察事件。 */
function appendTimeline(message: string): void {
  timeline.value = [...timeline.value, message]
}

const StartPage = defineComponent({
  name: 'NamedViewsStartPage',
  /** 渲染隔离路由的中立起点。 */
  setup() {
    return () =>
      h('section', { class: 'route-card start-card', 'data-testid': 'default-view' }, [
        h('p', { class: 'route-kicker' }, 'default outlet'),
        h('h4', '中立起点'),
        h('p', '进入工作台后，三个同层 outlet 会同时渲染。'),
      ])
  },
})

const PropsDrivenWorkspaceMain = defineComponent({
  name: 'PropsDrivenWorkspaceMain',
  props: {
    teamId: { type: String, required: true },
  },
  /** 仅依赖普通 Props 渲染可脱离路由复用的主视图。 */
  setup(props) {
    return () =>
      h('section', { class: 'route-card main-card', 'data-testid': 'default-view' }, [
        h('p', { class: 'route-kicker' }, 'default outlet · Props 输入'),
        h('h4', `团队 ${props.teamId} 工作台`),
        h('p', { 'data-testid': 'default-props' }, `teamId=${props.teamId}`),
        h('small', '当前组件使用声明的 Props，可脱离 RouterView 复用。'),
      ])
  },
})

const RouteCoupledWorkspaceMain = defineComponent({
  name: 'RouteCoupledWorkspaceMain',
  /** 直接读取当前 route，作为与 Props 组件的耦合对照。 */
  setup() {
    const route = useRoute()

    return () =>
      h('section', { class: 'route-card main-card', 'data-testid': 'default-view' }, [
        h('p', { class: 'route-kicker' }, 'default outlet · route 直读'),
        h('h4', `团队 ${String(route.params.teamId)} 工作台`),
        h('p', { 'data-testid': 'default-props' }, `teamId=${String(route.params.teamId)}`),
        h('small', '组件直接读取 useRoute()，复用时需要 router 上下文。'),
      ])
  },
})

const WorkspaceMainComparison = defineComponent({
  name: 'WorkspaceMainComparison',
  props: {
    teamId: { type: String, required: true },
  },
  /** 根据对照开关渲染 Props 组件或 route 耦合组件。 */
  setup(props) {
    return () =>
      comparisonMode.value === 'props'
        ? h(PropsDrivenWorkspaceMain, { teamId: props.teamId })
        : h(RouteCoupledWorkspaceMain)
  },
})

const WorkspaceSidebar = defineComponent({
  name: 'NamedViewsWorkspaceSidebar',
  props: {
    teamId: { type: String, required: true },
    filter: { type: String, required: true },
  },
  /** 只从 function 模式传入的 Props 渲染侧栏视图。 */
  setup(props) {
    return () =>
      h('section', { class: 'route-card sidebar-card', 'data-testid': 'sidebar-view' }, [
        h('p', { class: 'route-kicker' }, 'sidebar outlet · function props'),
        h('h4', '筛选器'),
        h(
          'p',
          { 'data-testid': 'sidebar-props' },
          `teamId=${props.teamId}；filter=${props.filter}`,
        ),
        h('small', 'query.filter 已在 RouterView 边界转换。'),
      ])
  },
})

const WorkspaceHelper = defineComponent({
  name: 'NamedViewsWorkspaceHelper',
  props: {
    mode: { type: String, required: true },
  },
  /** 只从 object 模式传入的 Props 渲染辅助视图。 */
  setup(props) {
    return () =>
      h('section', { class: 'route-card helper-card', 'data-testid': 'helper-view' }, [
        h('p', { class: 'route-kicker' }, 'helper outlet · object props'),
        h('h4', '工作台提示'),
        h('p', { 'data-testid': 'helper-props' }, `mode=${props.mode}`),
        h('small', '静态模式不依赖 params 或 query。'),
      ])
  },
})

const routes: RouteRecordRaw[] = [
  {
    path: '/start',
    name: 'named-views-start',
    component: StartPage,
  },
  {
    path: '/workspace/:teamId',
    name: 'workspace-layout',
    components: {
      default: WorkspaceMainComparison,
      sidebar: WorkspaceSidebar,
      helper: WorkspaceHelper,
    },
    props: {
      default: true,
      sidebar: (route) => ({
        teamId: String(route.params.teamId),
        filter: String(route.query.filter ?? 'all'),
      }),
      helper: { mode: 'tips' },
    },
  },
]

/** 把公开导航结果转换为可观察文字。 */
function formatNavigationResult(failure: NavigationFailure | void): string {
  return failure ? `失败（type ${failure.type}）` : `成功（${pendingAction}）`
}

/** 从独立 currentRoute 同步全部公开状态。 */
async function syncVisibleState(): Promise<void> {
  if (!demoRouter) return
  await nextTick()
  const route = demoRouter.currentRoute.value
  currentPathname.value = route.path
  matchedNames.value = route.matched.map((record) => String(record.name ?? record.path)).join(' → ')
  currentParams.value = Object.keys(route.params).length > 0 ? JSON.stringify(route.params) : '无'
  currentQuery.value = Object.keys(route.query).length > 0 ? JSON.stringify(route.query) : '无'
  hostPath.value = `${window.location.pathname}${window.location.search}${window.location.hash}`
}

/** 记录 afterEach 结果并同步屏幕状态。 */
function recordNavigation(
  to: RouteLocationNormalizedLoaded,
  from: RouteLocationNormalizedLoaded,
  failure: NavigationFailure | void,
): void {
  navigationResult.value = formatNavigationResult(failure)
  appendTimeline(
    `afterEach：${from.fullPath} → ${to.fullPath}；views：${Object.keys(to.matched.at(-1)?.components ?? {}).join(' / ') || '无'}；${navigationResult.value}`,
  )
  void syncVisibleState()
}

const MiniAppRoot = defineComponent({
  name: 'NamedViewsRoutePropsMiniApp',
  /** 渲染导航控件与三个真实同层 RouterView。 */
  setup() {
    const router = useRouter()

    /** 进入 core 团队的 open 视图。 */
    async function openCoreWorkspace(): Promise<void> {
      pendingAction = 'core/open'
      await router.push({
        name: 'workspace-layout',
        params: { teamId: 'core' },
        query: { filter: 'open' },
      })
    }

    /** 进入 platform 团队的 closed 视图。 */
    async function openPlatformWorkspace(): Promise<void> {
      pendingAction = 'platform/closed'
      await router.push({
        name: 'workspace-layout',
        params: { teamId: 'platform' },
        query: { filter: 'closed' },
      })
    }

    /** 切换主视图对 route 直读和 Props 输入的对照模式。 */
    function toggleComparisonMode(): void {
      comparisonMode.value = comparisonMode.value === 'props' ? 'route' : 'props'
    }

    return () =>
      h('div', { class: 'mini-app-root' }, [
        h('div', { class: 'route-actions', 'aria-label': '命名视图导航' }, [
          h('button', { type: 'button', onClick: openCoreWorkspace }, '打开 core / open'),
          h('button', { type: 'button', onClick: openPlatformWorkspace }, '打开 platform / closed'),
          h(
            'button',
            {
              type: 'button',
              'data-testid': 'toggle-route-props',
              'aria-pressed': comparisonMode.value === 'route',
              onClick: toggleComparisonMode,
            },
            `对照：${comparisonMode.value === 'props' ? 'Props 输入' : 'route 直读'}`,
          ),
        ]),
        h('div', { class: 'outlet-stage' }, [
          h('div', { class: 'outlet-column main-outlet', 'data-testid': 'default-outlet' }, [
            h('span', { class: 'outlet-label' }, 'RouterView default'),
            h(RouterView),
          ]),
          h('div', { class: 'outlet-column', 'data-testid': 'sidebar-outlet' }, [
            h('span', { class: 'outlet-label' }, 'RouterView sidebar'),
            h(RouterView, { name: 'sidebar' }),
          ]),
          h('div', { class: 'outlet-column', 'data-testid': 'helper-outlet' }, [
            h('span', { class: 'outlet-label' }, 'RouterView helper'),
            h(RouterView, { name: 'helper' }),
          ]),
        ]),
      ])
  },
})

/** 清空旧 mini-app，并从唯一中立位置重建实验。 */
async function initializeDemo(): Promise<void> {
  if (!miniAppHost.value) return

  ready.value = false
  miniApp?.unmount()
  comparisonMode.value = 'props'
  timeline.value = []
  navigationResult.value = '等待导航'
  pendingAction = 'initial'

  demoRouter = createRouter({
    history: createMemoryHistory(),
    routes,
  })
  demoRouter.afterEach(recordNavigation)
  await demoRouter.replace({ name: 'named-views-start' })
  await demoRouter.isReady()

  miniApp = createApp(MiniAppRoot)
  miniApp.use(demoRouter)
  miniApp.mount(miniAppHost.value)
  ready.value = true
  await syncVisibleState()
}

/** 在页面挂载后初始化隔离路由实验。 */
onMounted(() => {
  void initializeDemo()
})

/** 离开课程时卸载独立 mini-app。 */
onBeforeUnmount(() => {
  miniApp?.unmount()
})
</script>

<template>
  <section class="named-views-props-lab" aria-label="命名视图与路由 Props 实验">
    <div class="lab-copy">
      <p class="eyebrow">components + named RouterView + props</p>
      <h3>一条记录，三个独立组件边界</h3>
      <p>同时观察 default、sidebar 和 helper 如何接收各自的 Props。</p>
    </div>

    <div ref="miniAppHost" class="mini-app-host" />

    <div class="state-strip" aria-live="polite">
      <p>
        <span>pathname</span>
        <strong data-testid="mini-pathname">{{ currentPathname }}</strong>
      </p>
      <p>
        <span>matched names</span>
        <strong data-testid="mini-matched-names">{{ matchedNames }}</strong>
      </p>
      <p>
        <span>params</span>
        <strong data-testid="mini-route-params">{{ currentParams }}</strong>
      </p>
      <p>
        <span>query</span>
        <strong data-testid="mini-route-query">{{ currentQuery }}</strong>
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

    <div class="panel-heading">
      <h4>视图事件时间线</h4>
      <button type="button" :disabled="!ready" @click="initializeDemo">重置实验</button>
    </div>
    <ol class="timeline" data-testid="mini-navigation-timeline">
      <li v-for="(item, index) in timeline" :key="`${index}-${item}`">{{ item }}</li>
    </ol>
  </section>
</template>

<style scoped>
.named-views-props-lab {
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-primary);
}

.lab-copy h3,
.lab-copy p,
.state-strip p,
.panel-heading h4 {
  margin: 0;
}

.lab-copy > * + * {
  margin-top: var(--space-2);
}

.eyebrow,
.mini-app-host :deep(.route-kicker),
.mini-app-host :deep(.outlet-label) {
  color: var(--color-accent);
  font-size: var(--font-size-sm);
  font-weight: 700;
}

.mini-app-host {
  margin-top: var(--space-4);
}

.mini-app-host :deep(.route-actions) {
  display: flex;
  flex-wrap: wrap;
  margin-right: calc(var(--space-2) * -1);
}

.mini-app-host :deep(.route-actions button),
.panel-heading button {
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

.mini-app-host :deep(.route-actions button:hover),
.panel-heading button:hover:not(:disabled) {
  border-color: var(--color-accent);
  background: var(--color-accent-soft);
}

.mini-app-host :deep(.route-actions button:active),
.panel-heading button:active:not(:disabled) {
  transform: scale(0.97);
}

.mini-app-host :deep(.outlet-stage) {
  display: flex;
  align-items: stretch;
  margin: var(--space-2) calc(var(--space-2) * -1) 0 0;
}

.mini-app-host :deep(.outlet-column) {
  min-width: 0;
  flex: 1 1 0;
  padding: var(--space-2);
  margin-right: var(--space-2);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-sm);
}

.mini-app-host :deep(.main-outlet) {
  flex-grow: 1.4;
}

.mini-app-host :deep(.route-card) {
  min-height: 150px;
  padding: var(--space-3);
  margin-top: var(--space-2);
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-accent);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
}

.mini-app-host :deep(.route-card > *) {
  margin: 0;
  overflow-wrap: anywhere;
}

.mini-app-host :deep(.route-card > * + *) {
  margin-top: var(--space-2);
}

.state-strip {
  display: flex;
  flex-wrap: wrap;
  margin: var(--space-3) calc(var(--space-2) * -1) 0 0;
}

.state-strip p {
  min-width: 160px;
  flex: 1 1 160px;
  padding: var(--space-3);
  margin: 0 var(--space-2) var(--space-2) 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
}

.state-strip span {
  display: block;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.state-strip strong {
  display: block;
  margin-top: var(--space-1);
  overflow-wrap: anywhere;
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

@media (max-width: 760px) {
  .mini-app-host :deep(.outlet-stage) {
    flex-direction: column;
    margin-right: 0;
  }

  .mini-app-host :deep(.outlet-column) {
    width: 100%;
    box-sizing: border-box;
    margin-right: 0;
  }

  .mini-app-host :deep(.outlet-column + .outlet-column) {
    margin-top: var(--space-2);
  }
}

@media (max-width: 640px) {
  .named-views-props-lab {
    padding: var(--space-3);
  }

  .mini-app-host :deep(.route-actions button),
  .panel-heading button,
  .state-strip p {
    box-sizing: border-box;
    width: calc(100% - var(--space-2));
    flex-basis: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .mini-app-host :deep(.route-actions button),
  .panel-heading button {
    transition: none;
  }
}
</style>
