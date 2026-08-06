<script setup lang="ts">
import { createApp, defineComponent, h, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import type { App } from 'vue'
import { RouterLink, RouterView, createMemoryHistory, createRouter } from 'vue-router'
import type {
  NavigationFailure,
  RouteLocationNormalizedLoaded,
  Router,
  RouteRecordRaw,
} from 'vue-router'

interface RouterLinkSlotState {
  isActive: boolean
  isExactActive: boolean
}

interface LinkState {
  id: string
  label: string
  className: string
  ariaCurrent: string
}

const miniAppHost = ref<HTMLElement | null>(null)
const ready = ref(false)
const currentPathname = ref('尚未初始化')
const matchedNames = ref('无')
const currentParams = ref('无')
const currentQuery = ref('无')
const navigationResult = ref('等待导航')
const hostPath = ref('等待挂载')
const linkStates = ref<LinkState[]>([])
const timeline = ref<string[]>([])

let miniApp: App<Element> | undefined
let demoRouter: Router | undefined

/** 创建带稳定组件名的子路由页面。 */
function createRoutePage(name: string, title: string, description: string) {
  return defineComponent({
    name,
    /** 渲染当前子路由对应的可见内容。 */
    setup() {
      return () =>
        h('section', { class: 'route-page', 'data-testid': 'mini-route-view' }, [
          h('p', { class: 'route-kicker' }, 'RouterView 当前内容'),
          h('h4', title),
          h('p', description),
        ])
    },
  })
}

const WorkspaceLayout = defineComponent({
  name: 'RouterLinkWorkspaceLayout',
  /** 渲染父记录内容，并把子记录交给下一层 RouterView。 */
  setup() {
    return () =>
      h('article', { class: 'workspace-layout' }, [
        h('p', { class: 'workspace-title' }, '工作区父记录'),
        h(RouterView),
      ])
  },
})

const routes: RouteRecordRaw[] = [
  {
    path: '/workspace',
    name: 'workspace',
    component: WorkspaceLayout,
    children: [
      {
        path: 'overview',
        name: 'workspace-overview',
        component: createRoutePage(
          'RouterLinkOverviewPage',
          '概览页',
          '父记录与概览记录同时匹配，只有概览链接是 exact active。',
        ),
      },
      {
        path: 'settings',
        name: 'workspace-settings',
        component: createRoutePage(
          'RouterLinkSettingsPage',
          '设置页',
          '切换子记录后，父链接保持 active，设置链接变为 exact active。',
        ),
      },
    ],
  },
]

/** 渲染 RouterLink scoped slot 直接提供的激活布尔值。 */
function renderLinkContent(id: string, label: string, state: RouterLinkSlotState) {
  return [
    h('span', { class: 'link-label' }, label),
    h(
      'span',
      {
        class: 'link-slot-state',
        'aria-hidden': 'true',
        'data-testid': `link-slot-state-${id}`,
      },
      [
        h('span', `isActive: ${state.isActive}`),
        h('span', `isExactActive: ${state.isExactActive}`),
      ],
    ),
  ]
}

const MiniAppRoot = defineComponent({
  name: 'RouterLinkActiveMiniApp',
  /** 渲染真实 RouterLink 导航与对应 RouterView。 */
  setup() {
    return () =>
      h('div', { class: 'mini-app-root' }, [
        h('nav', { class: 'mini-links', 'aria-label': '工作区路由链接' }, [
          h(
            RouterLink,
            { to: { name: 'workspace' }, 'data-mini-link': 'parent' },
            {
              /** 直接呈现父链接 slot 的激活状态。 */
              default: (state: RouterLinkSlotState) => renderLinkContent('parent', '工作区', state),
            },
          ),
          h(
            RouterLink,
            { to: { name: 'workspace-overview' }, 'data-mini-link': 'overview' },
            {
              /** 直接呈现概览链接 slot 的激活状态。 */
              default: (state: RouterLinkSlotState) => renderLinkContent('overview', '概览', state),
            },
          ),
          h(
            RouterLink,
            { to: { name: 'workspace-settings' }, 'data-mini-link': 'settings' },
            {
              /** 直接呈现设置链接 slot 的激活状态。 */
              default: (state: RouterLinkSlotState) => renderLinkContent('settings', '设置', state),
            },
          ),
        ]),
        h(RouterView),
      ])
  },
})

const linkLabels: Record<string, string> = {
  parent: '工作区',
  overview: '概览',
  settings: '设置',
}

/** 同步 currentRoute 字段，并从真实锚点读取 class 与 aria-current。 */
async function syncVisibleState(): Promise<void> {
  if (!demoRouter) return
  await nextTick()
  const route = demoRouter.currentRoute.value
  currentPathname.value = route.path
  matchedNames.value = route.matched.map((record) => String(record.name ?? record.path)).join(' → ')
  currentParams.value = Object.keys(route.params).length > 0 ? JSON.stringify(route.params) : '无'
  currentQuery.value = String(route.query.mode ?? '无')
  hostPath.value = `${window.location.pathname}${window.location.search}${window.location.hash}`

  if (!miniAppHost.value) return
  linkStates.value = Array.from(
    miniAppHost.value.querySelectorAll<HTMLAnchorElement>('[data-mini-link]'),
  ).map((link) => {
    const id = link.dataset.miniLink ?? 'unknown'
    return {
      id,
      label: linkLabels[id] ?? id,
      className: link.className || '无',
      ariaCurrent: link.getAttribute('aria-current') ?? '无',
    }
  })
}

/** 把 afterEach 的公开 failure 参数转换为可见导航结果。 */
function formatNavigationResult(failure: NavigationFailure | void): string {
  return failure ? `失败（type ${failure.type}）` : '成功'
}

/** 记录每次导航的起点、终点和最终结果，并刷新可见状态。 */
function recordNavigation(
  to: RouteLocationNormalizedLoaded,
  from: RouteLocationNormalizedLoaded,
  failure: NavigationFailure | void,
): void {
  const result = formatNavigationResult(failure)
  navigationResult.value = result
  timeline.value = [
    ...timeline.value,
    `afterEach：${from.fullPath} → ${to.fullPath}；结果：${result}`,
  ]
  void syncVisibleState()
}

/** 切换概览页 query，验证链接激活状态不比较 query。 */
async function toggleOverviewQuery(): Promise<void> {
  if (!demoRouter) return
  const nextMode = demoRouter.currentRoute.value.query.mode === 'detail' ? 'summary' : 'detail'
  await demoRouter.push({ name: 'workspace-overview', query: { mode: nextMode } })
  await syncVisibleState()
}

/** 恢复初始概览位置与 query。 */
async function resetDemo(): Promise<void> {
  if (!demoRouter) return
  timeline.value = []
  await demoRouter.replace({ name: 'workspace-overview', query: { mode: 'summary' } })
  await syncVisibleState()
}

/** 挂载独立 mini-app，并提交确定的首个 memory 位置。 */
onMounted(async () => {
  if (!miniAppHost.value) return

  demoRouter = createRouter({
    history: createMemoryHistory(),
    routes,
  })
  demoRouter.afterEach(recordNavigation)

  // 在安装前先提交 memory 位置，避免浏览器 install 自动解析空位置。
  await demoRouter.replace({ name: 'workspace-overview', query: { mode: 'summary' } })
  await demoRouter.isReady()

  miniApp = createApp(MiniAppRoot)
  miniApp.use(demoRouter)
  miniApp.mount(miniAppHost.value)
  ready.value = true
  await syncVisibleState()
})

/** 离开课程时卸载独立 mini-app。 */
onBeforeUnmount(() => {
  miniApp?.unmount()
})
</script>

<template>
  <section class="router-link-lab" aria-label="链接激活状态实验">
    <div class="lab-copy">
      <p class="eyebrow">RouterLink + RouterView</p>
      <h3>同一条 matched 链上的两种激活状态</h3>
      <p>父链接可以 active 但不 exact；query 改变不会取消记录与参数匹配。</p>
    </div>

    <div class="route-actions">
      <button type="button" :disabled="!ready" @click="toggleOverviewQuery">切换概览 query</button>
      <button type="button" :disabled="!ready" @click="resetDemo">重置</button>
    </div>

    <div ref="miniAppHost" class="mini-app-host" />

    <div class="route-state" aria-live="polite">
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
        <span>query.mode</span>
        <strong data-testid="mini-query-mode">{{ currentQuery }}</strong>
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

    <ul class="link-state-list" aria-label="链接公开状态">
      <li v-for="state in linkStates" :key="state.id" :data-testid="`link-state-${state.id}`">
        <strong>{{ state.label }}</strong>
        <span>实际 class: {{ state.className }}</span>
        <span>实际 aria-current: {{ state.ariaCurrent }}</span>
      </li>
    </ul>

    <div class="timeline-panel">
      <h4>事件时间线</h4>
      <ol data-testid="mini-navigation-timeline">
        <li v-for="(item, index) in timeline" :key="`${index}-${item}`">{{ item }}</li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.router-link-lab {
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-primary);
}

.lab-copy h3,
.lab-copy p,
.route-state p,
.timeline-panel h4 {
  margin: 0;
}

.lab-copy > * + * {
  margin-top: var(--space-2);
}

.eyebrow,
.route-kicker {
  color: var(--color-accent);
  font-size: var(--font-size-sm);
  font-weight: 700;
}

.route-actions,
.mini-app-host :deep(.mini-links) {
  display: flex;
  flex-wrap: wrap;
  margin: var(--space-4) calc(var(--space-2) * -1) 0 0;
}

.route-actions button,
.mini-app-host :deep(.mini-links a) {
  min-height: 40px;
  padding: 0 var(--space-3);
  margin: 0 var(--space-2) var(--space-2) 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
  background: var(--color-bg-elevated);
  transition:
    transform var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out),
    background-color var(--duration-fast) var(--ease-out);
}

.mini-app-host :deep(.mini-links a) {
  display: inline-flex;
  flex-direction: column;
  align-items: stretch;
  text-decoration: none;
}

.mini-app-host :deep(.link-slot-state) {
  display: block;
  margin-top: var(--space-1);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: 400;
}

.mini-app-host :deep(.link-slot-state span) {
  display: block;
  overflow-wrap: anywhere;
}

.route-actions button:hover:not(:disabled),
.mini-app-host :deep(.mini-links a:hover) {
  border-color: var(--color-accent);
  background: var(--color-accent-soft);
}

.mini-app-host :deep(.mini-links .router-link-active) {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.mini-app-host :deep(.mini-links .router-link-exact-active) {
  color: var(--color-on-accent);
  background: var(--color-accent);
}

.mini-app-host {
  margin-top: var(--space-2);
}

.mini-app-host :deep(.workspace-layout) {
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
}

.mini-app-host :deep(.workspace-title),
.mini-app-host :deep(.route-page p),
.mini-app-host :deep(.route-page h4) {
  margin: 0;
}

.mini-app-host :deep(.route-page) {
  min-height: 128px;
  padding: var(--space-3);
  margin-top: var(--space-3);
  border-left: 3px solid var(--color-accent);
  background: var(--color-bg-primary);
}

.mini-app-host :deep(.route-page > * + *) {
  margin-top: var(--space-2);
}

.route-state,
.link-state-list {
  display: flex;
  flex-wrap: wrap;
  margin: var(--space-3) calc(var(--space-2) * -1) 0 0;
}

.route-state p,
.link-state-list li {
  min-width: 160px;
  flex: 1 1 160px;
  padding: var(--space-3);
  margin: 0 var(--space-2) var(--space-2) 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
}

.route-state span,
.link-state-list span,
.link-state-list strong {
  display: block;
}

.route-state span,
.link-state-list span {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.route-state strong,
.link-state-list span,
.link-state-list strong {
  margin-top: var(--space-1);
  overflow-wrap: anywhere;
}

.link-state-list {
  padding: 0;
  list-style: none;
}

.timeline-panel {
  margin-top: var(--space-3);
  padding: var(--space-3);
  border-top: 1px solid var(--color-border);
}

.timeline-panel ol {
  padding-left: var(--space-4);
  margin: var(--space-2) 0 0;
}

.timeline-panel li {
  overflow-wrap: anywhere;
}

.timeline-panel li + li {
  margin-top: var(--space-1);
}

@media (max-width: 640px) {
  .router-link-lab {
    padding: var(--space-3);
  }

  .route-actions button,
  .mini-app-host :deep(.mini-links a),
  .route-state p,
  .link-state-list li {
    flex-basis: 100%;
  }

  .mini-app-host :deep(.mini-links a) {
    box-sizing: border-box;
    width: calc(100% - var(--space-2));
    flex-basis: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .route-actions button,
  .mini-app-host :deep(.mini-links a) {
    transition: none;
  }
}
</style>
