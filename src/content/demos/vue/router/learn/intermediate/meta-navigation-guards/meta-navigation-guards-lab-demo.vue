<script setup lang="ts">
import { createApp, defineComponent, h, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import type { App } from 'vue'
import { RouterView, createMemoryHistory, createRouter, useRouter } from 'vue-router'
import type {
  NavigationFailure,
  NavigationGuard,
  RouteLocationNormalizedLoaded,
  Router,
  RouteRecordRaw,
} from 'vue-router'

type DemoRole = 'guest' | 'member' | 'admin'

const miniAppHost = ref<HTMLElement | null>(null)
const ready = ref(false)
const activeRole = ref<DemoRole>('guest')
const currentPathname = ref('尚未初始化')
const matchedNames = ref('无')
const currentMeta = ref('无')
const matchedMeta = ref('无')
const redirectedFrom = ref('无')
const navigationResult = ref('等待导航')
const hostPath = ref('等待挂载')
const timeline = ref<string[]>([])

let miniApp: App<Element> | undefined
let demoRouter: Router | undefined
let pendingAction = 'initial'

/** 向守卫时间线追加一条可观察事件。 */
function appendTimeline(message: string): void {
  timeline.value = [...timeline.value, message]
}

const StartPage = defineComponent({
  name: 'MetaGuardsStartPage',
  /** 渲染权限实验的公开起点。 */
  setup() {
    return () =>
      h('section', { class: 'route-card', 'data-testid': 'mini-route-view' }, [
        h('p', { class: 'route-kicker' }, '公开记录'),
        h('h4', '守卫实验起点'),
        h('p', '选择角色后访问同一份管理报表。'),
      ])
  },
})

const LoginPage = defineComponent({
  name: 'MetaGuardsLoginPage',
  /** 渲染访客重定向后的登录页。 */
  setup() {
    return () =>
      h('section', { class: 'route-card warning-card', 'data-testid': 'mini-route-view' }, [
        h('p', { class: 'route-kicker' }, '重定向目标'),
        h('h4', '请先登录'),
        h('p', '登录页未声明 requiresAuth，因此不会重定向自身。'),
      ])
  },
})

const AdminLayout = defineComponent({
  name: 'MetaGuardsAdminLayout',
  /** 渲染带有子出口的管理区布局。 */
  setup() {
    return () =>
      h('section', { class: 'admin-layout', 'data-testid': 'admin-layout' }, [
        h('p', { class: 'route-kicker' }, '父记录：requiresAuth'),
        h(RouterView),
      ])
  },
})

const ReportsPage = defineComponent({
  name: 'MetaGuardsReportsPage',
  /** 记录新组件进入守卫的执行顺序。 */
  beforeRouteEnter() {
    appendTimeline('4 beforeRouteEnter：报表组件准备激活')
  },
  /** 渲染只允许管理员进入的报表页。 */
  setup() {
    return () =>
      h('section', { class: 'route-card success-card', 'data-testid': 'mini-route-view' }, [
        h('p', { class: 'route-kicker' }, '子记录：requiredRole=admin'),
        h('h4', '管理报表'),
        h('p', '全部前置守卫通过，导航已确认。'),
      ])
  },
})

/** 记录父记录 beforeEnter。 */
const parentBeforeEnter: NavigationGuard = () => {
  appendTimeline('2 beforeEnter：父记录')
}

/** 记录子记录 beforeEnter。 */
const childBeforeEnter: NavigationGuard = () => {
  appendTimeline('3 beforeEnter：报表子记录')
}

const routes: RouteRecordRaw[] = [
  {
    path: '/start',
    name: 'guard-start',
    component: StartPage,
  },
  {
    path: '/login',
    name: 'guard-login',
    component: LoginPage,
  },
  {
    path: '/admin',
    name: 'admin-layout',
    component: AdminLayout,
    beforeEnter: parentBeforeEnter,
    meta: {
      requiresAuth: true,
      area: 'workspace',
      policy: { audit: true, owner: 'parent' },
    },
    children: [
      {
        path: 'reports',
        name: 'admin-reports',
        component: ReportsPage,
        beforeEnter: childBeforeEnter,
        meta: {
          requiredRole: 'admin',
          area: 'reports',
          policy: { export: true },
        },
      },
    ],
  },
]

/** 执行全局登录与角色决策。 */
const globalBeforeEach: NavigationGuard = (to) => {
  appendTimeline(`1 beforeEach：role=${activeRole.value}；target=${to.fullPath}`)

  if (to.meta.requiresAuth && activeRole.value === 'guest') {
    appendTimeline('1.1 decision：redirect 到登录页')
    return { name: 'guard-login', query: { redirect: to.fullPath } }
  }
  if (to.meta.requiredRole && activeRole.value !== to.meta.requiredRole) {
    appendTimeline('1.1 decision：return false 取消')
    return false
  }
  appendTimeline('1.1 decision：allow')
}

/** 记录所有进入守卫完成后的全局解析阶段。 */
const globalBeforeResolve: NavigationGuard = (to) => {
  appendTimeline(`5 beforeResolve：${to.fullPath}`)
}

/** 把公开导航结果转换为可观察文字。 */
function formatNavigationResult(
  to: RouteLocationNormalizedLoaded,
  failure: NavigationFailure | void,
): string {
  if (failure) return `取消（type ${failure.type}）`
  if (to.redirectedFrom) return `重定向完成（${to.fullPath}）`
  return `成功（${pendingAction}）`
}

/** 从独立 currentRoute 同步公开 route 与 meta 状态。 */
async function syncVisibleState(): Promise<void> {
  if (!demoRouter) return
  await nextTick()
  const route = demoRouter.currentRoute.value
  currentPathname.value = route.path
  matchedNames.value = route.matched.map((record) => String(record.name ?? record.path)).join(' → ')
  currentMeta.value = Object.keys(route.meta).length > 0 ? JSON.stringify(route.meta) : '无'
  matchedMeta.value =
    route.matched.length > 0
      ? JSON.stringify(
          route.matched.map((record) => ({
            name: String(record.name ?? record.path),
            meta: record.meta,
          })),
        )
      : '无'
  redirectedFrom.value = route.redirectedFrom?.fullPath ?? '无'
  hostPath.value = `${window.location.pathname}${window.location.search}${window.location.hash}`
}

/** 在 afterEach 中记录已结算结果，不再尝试改变导航。 */
function recordNavigation(
  to: RouteLocationNormalizedLoaded,
  from: RouteLocationNormalizedLoaded,
  failure: NavigationFailure | void,
): void {
  navigationResult.value = formatNavigationResult(to, failure)
  appendTimeline(`6 afterEach：${from.fullPath} → ${to.fullPath}；${navigationResult.value}`)
  void syncVisibleState()
}

const MiniAppRoot = defineComponent({
  name: 'MetaNavigationGuardsMiniApp',
  /** 渲染角色控制、导航命令和真实 RouterView。 */
  setup() {
    const router = useRouter()

    /** 切换当前演示角色。 */
    function selectRole(role: DemoRole): void {
      activeRole.value = role
    }

    /** 使用当前角色访问同一份管理报表。 */
    async function openReports(): Promise<void> {
      timeline.value = []
      pendingAction = `${activeRole.value} allow`
      await router.push({ name: 'admin-reports' })
    }

    return () =>
      h('div', { class: 'mini-app-root' }, [
        h(
          'div',
          { class: 'role-switcher', role: 'group', 'aria-label': '访问角色' },
          (['guest', 'member', 'admin'] as DemoRole[]).map((role) =>
            h(
              'button',
              {
                type: 'button',
                class: { selected: activeRole.value === role },
                'aria-pressed': activeRole.value === role,
                onClick: () => selectRole(role),
              },
              role === 'guest' ? '访客' : role === 'member' ? '成员' : '管理员',
            ),
          ),
        ),
        h(
          'button',
          { class: 'navigate-button', type: 'button', onClick: openReports },
          '访问管理报表',
        ),
        h(RouterView),
      ])
  },
})

/** 清空旧 mini-app，并从唯一公开位置重建实验。 */
async function initializeDemo(): Promise<void> {
  if (!miniAppHost.value) return

  ready.value = false
  miniApp?.unmount()
  activeRole.value = 'guest'
  timeline.value = []
  navigationResult.value = '等待导航'
  pendingAction = 'initial'

  demoRouter = createRouter({
    history: createMemoryHistory(),
    routes,
  })
  demoRouter.beforeEach(globalBeforeEach)
  demoRouter.beforeResolve(globalBeforeResolve)
  demoRouter.afterEach(recordNavigation)
  await demoRouter.replace({ name: 'guard-start' })
  await demoRouter.isReady()

  miniApp = createApp(MiniAppRoot)
  miniApp.use(demoRouter)
  miniApp.mount(miniAppHost.value)
  ready.value = true
  await syncVisibleState()
}

/** 在页面挂载后初始化隔离守卫实验。 */
onMounted(() => {
  void initializeDemo()
})

/** 离开课程时卸载独立 mini-app。 */
onBeforeUnmount(() => {
  miniApp?.unmount()
})
</script>

<template>
  <section class="meta-guards-lab" aria-label="路由 Meta 与导航守卫实验">
    <div class="lab-copy">
      <p class="eyebrow">RouteMeta + guard pipeline</p>
      <h3>同一目标，三种角色结果</h3>
      <p>分别观察 redirect、cancel 与 allow，并对照 matched meta 和浅合并结果。</p>
    </div>

    <div ref="miniAppHost" class="mini-app-host" />

    <div class="state-strip" aria-live="polite">
      <p>
        <span>role</span>
        <strong data-testid="active-role">{{ activeRole }}</strong>
      </p>
      <p>
        <span>pathname</span>
        <strong data-testid="mini-pathname">{{ currentPathname }}</strong>
      </p>
      <p>
        <span>matched names</span>
        <strong data-testid="mini-matched-names">{{ matchedNames }}</strong>
      </p>
      <p>
        <span>redirectedFrom</span>
        <strong data-testid="mini-redirected-from">{{ redirectedFrom }}</strong>
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

    <div class="meta-panel">
      <p>
        <span>route.meta 浅合并</span>
        <strong data-testid="current-meta">{{ currentMeta }}</strong>
      </p>
      <p>
        <span>matched 原始 meta</span>
        <strong data-testid="matched-meta">{{ matchedMeta }}</strong>
      </p>
    </div>

    <div class="panel-heading">
      <h4>守卫时间线</h4>
      <button type="button" :disabled="!ready" @click="initializeDemo">重置实验</button>
    </div>
    <ol class="timeline" data-testid="guard-timeline">
      <li v-for="(item, index) in timeline" :key="`${index}-${item}`">{{ item }}</li>
    </ol>
  </section>
</template>

<style scoped>
.meta-guards-lab {
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-primary);
}

.lab-copy h3,
.lab-copy p,
.state-strip p,
.meta-panel p,
.panel-heading h4 {
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

.mini-app-host :deep(.role-switcher) {
  display: inline-flex;
  max-width: 100%;
  padding: 3px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
}

.mini-app-host :deep(.role-switcher button),
.mini-app-host :deep(.navigate-button),
.panel-heading button {
  min-height: 40px;
  padding: var(--space-2) var(--space-3);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
  overflow-wrap: anywhere;
  background: transparent;
  transition:
    transform var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out),
    background-color var(--duration-fast) var(--ease-out);
}

.mini-app-host :deep(.role-switcher button + button) {
  margin-left: var(--space-1);
}

.mini-app-host :deep(.role-switcher button.selected) {
  border-color: var(--color-border);
  background: var(--color-bg-primary);
}

.mini-app-host :deep(.navigate-button) {
  display: block;
  margin-top: var(--space-3);
  border-color: var(--color-accent);
  background: var(--color-accent-soft);
}

.mini-app-host :deep(button:hover),
.panel-heading button:hover:not(:disabled) {
  border-color: var(--color-accent);
  background: var(--color-accent-soft);
}

.mini-app-host :deep(button:active),
.panel-heading button:active:not(:disabled) {
  transform: scale(0.97);
}

.mini-app-host :deep(.admin-layout),
.mini-app-host :deep(.route-card) {
  padding: var(--space-3);
  margin-top: var(--space-3);
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-accent);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
}

.mini-app-host :deep(.route-card > *),
.mini-app-host :deep(.admin-layout > p) {
  margin: 0;
  overflow-wrap: anywhere;
}

.mini-app-host :deep(.route-card > * + *) {
  margin-top: var(--space-2);
}

.mini-app-host :deep(.admin-layout .route-card) {
  margin-top: var(--space-2);
}

.state-strip,
.meta-panel {
  display: flex;
  flex-wrap: wrap;
  margin: var(--space-3) calc(var(--space-2) * -1) 0 0;
}

.state-strip p,
.meta-panel p {
  min-width: 160px;
  flex: 1 1 160px;
  padding: var(--space-3);
  margin: 0 var(--space-2) var(--space-2) 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
}

.meta-panel p {
  min-width: 240px;
}

.state-strip span,
.meta-panel span {
  display: block;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.state-strip strong,
.meta-panel strong {
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

.panel-heading button {
  margin: 0 var(--space-2) var(--space-2) 0;
  border-color: var(--color-border);
  background: var(--color-bg-elevated);
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
  .meta-guards-lab {
    padding: var(--space-3);
  }

  .mini-app-host :deep(.role-switcher) {
    display: flex;
    width: 100%;
    box-sizing: border-box;
  }

  .mini-app-host :deep(.role-switcher button) {
    min-width: 0;
    flex: 1 1 0;
    padding-right: var(--space-2);
    padding-left: var(--space-2);
  }

  .mini-app-host :deep(.navigate-button),
  .panel-heading button,
  .state-strip p,
  .meta-panel p {
    box-sizing: border-box;
    width: calc(100% - var(--space-2));
    flex-basis: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .mini-app-host :deep(.role-switcher button),
  .mini-app-host :deep(.navigate-button),
  .panel-heading button {
    transition: none;
  }
}
</style>
