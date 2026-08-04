<script setup lang="ts">
import { createApp, defineComponent, h, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import type { App } from 'vue'
import { RouterView, createMemoryHistory, createRouter, useRoute } from 'vue-router'
import type {
  NavigationFailure,
  RouteLocationNormalizedLoaded,
  RouteLocationRaw,
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

let miniApp: App<Element> | undefined
let demoRouter: Router | undefined

const TeamHomePage = defineComponent({
  name: 'NestedRoutesTeamHomePage',
  /** 渲染空路径 child 对应的默认二级内容。 */
  setup() {
    return () =>
      h('section', { class: 'child-route-page', 'data-testid': 'child-outlet-content' }, [
        h('p', { class: 'outlet-label' }, '内层 outlet 内容'),
        h('h5', '团队默认页'),
        h('p', '空路径 child 没有增加 URL segment。'),
      ])
  },
})

const TeamMemberPage = defineComponent({
  name: 'NestedRoutesTeamMemberPage',
  /** 渲染详情 child，并显示从嵌套 URL 读取的成员参数。 */
  setup() {
    const route = useRoute()
    return () =>
      h('section', { class: 'child-route-page', 'data-testid': 'child-outlet-content' }, [
        h('p', { class: 'outlet-label' }, '内层 outlet 内容'),
        h('h5', `成员详情 ${String(route.params.memberId)}`),
        h('p', 'members/:memberId 为父地址追加两个 segment。'),
      ])
  },
})

const TeamLayout = defineComponent({
  name: 'NestedRoutesTeamLayout',
  /** 渲染父记录 layout，并为 child record 提供第二层 RouterView。 */
  setup() {
    const route = useRoute()
    return () =>
      h('article', { class: 'team-layout', 'data-testid': 'parent-outlet-content' }, [
        h('p', { class: 'outlet-label' }, '外层 outlet 内容 · depth 0 · matched[0]'),
        h('h4', `团队 ${String(route.params.teamId)} 布局`),
        h('p', '切换 child 时，这个父 layout 保持可见。'),
        h('div', { class: 'nested-outlet-shell' }, [
          h('p', { class: 'outlet-depth', 'data-testid': 'child-outlet-depth' }, [
            '第二层 RouterView · depth 1 · matched[1]',
          ]),
          h(RouterView),
        ]),
      ])
  },
})

const routes: RouteRecordRaw[] = [
  {
    path: '/teams/:teamId',
    name: 'team-layout',
    component: TeamLayout,
    children: [
      {
        path: '',
        name: 'team-home',
        component: TeamHomePage,
      },
      {
        path: 'members/:memberId',
        name: 'team-member',
        component: TeamMemberPage,
      },
    ],
  },
]

const MiniAppRoot = defineComponent({
  name: 'NestedRoutesMiniApp',
  /** 渲染 mini-app 的第一层 RouterView。 */
  setup() {
    return () => h('div', { class: 'mini-app-root' }, [h(RouterView)])
  },
})

/** 把 afterEach 的公开 failure 参数转换为可见导航结果。 */
function formatNavigationResult(failure: NavigationFailure | void): string {
  return failure ? `失败（type ${failure.type}）` : '成功'
}

/** 同步独立 router 的公开状态与宿主页面地址。 */
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

/** 记录每次导航的 matched 结果，并刷新可见状态。 */
function recordNavigation(
  to: RouteLocationNormalizedLoaded,
  from: RouteLocationNormalizedLoaded,
  failure: NavigationFailure | void,
): void {
  const result = formatNavigationResult(failure)
  navigationResult.value = result
  const names = to.matched.map((record) => String(record.name ?? record.path)).join(' → ')
  timeline.value = [
    ...timeline.value,
    `afterEach：${from.fullPath} → ${to.fullPath}；matched：${names}；结果：${result}`,
  ]
  void syncVisibleState()
}

/** 导航到独立 router 的指定父子位置。 */
async function navigate(target: RouteLocationRaw): Promise<void> {
  if (!demoRouter) return
  await demoRouter.push(target)
  await syncVisibleState()
}

/** 恢复空路径默认 child 的初始位置。 */
async function resetDemo(): Promise<void> {
  if (!demoRouter) return
  timeline.value = []
  await demoRouter.replace({
    name: 'team-home',
    params: { teamId: 'core' },
    query: { tab: 'overview' },
  })
  await syncVisibleState()
}

/** 挂载独立 mini-app，并显式提交首个 memory 位置。 */
onMounted(async () => {
  if (!miniAppHost.value) return

  demoRouter = createRouter({
    history: createMemoryHistory(),
    routes,
  })
  demoRouter.afterEach(recordNavigation)

  await demoRouter.replace({
    name: 'team-home',
    params: { teamId: 'core' },
    query: { tab: 'overview' },
  })
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
  <section class="nested-routes-lab" aria-label="嵌套路由层级实验">
    <div class="lab-copy">
      <p class="eyebrow">children + view depth</p>
      <h3>一条 matched 链，两层 RouterView</h3>
      <p>切换空路径默认 child 与详情 child，观察父 layout 留在原位而内层 outlet 更新。</p>
    </div>

    <div class="route-actions" aria-label="嵌套路由导航命令">
      <button
        type="button"
        :disabled="!ready"
        @click="
          navigate({
            name: 'team-member',
            params: { teamId: 'core', memberId: '42' },
            query: { tab: 'profile' },
          })
        "
      >
        成员详情
      </button>
      <button
        type="button"
        :disabled="!ready"
        @click="
          navigate({
            name: 'team-home',
            params: { teamId: 'core' },
            query: { tab: 'overview' },
          })
        "
      >
        默认子路由
      </button>
      <button type="button" :disabled="!ready" @click="resetDemo">重置</button>
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

    <div class="timeline-panel">
      <h4>事件时间线</h4>
      <ol data-testid="mini-navigation-timeline">
        <li v-for="(item, index) in timeline" :key="`${index}-${item}`">{{ item }}</li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.nested-routes-lab {
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-primary);
}

.lab-copy h3,
.lab-copy p,
.state-strip p,
.timeline-panel h4 {
  margin: 0;
}

.lab-copy > * + * {
  margin-top: var(--space-2);
}

.eyebrow,
.mini-app-host :deep(.outlet-label) {
  color: var(--color-accent);
  font-size: var(--font-size-sm);
  font-weight: 700;
}

.route-actions {
  display: flex;
  flex-wrap: wrap;
  margin: var(--space-4) calc(var(--space-2) * -1) 0 0;
}

.route-actions button {
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

.route-actions button:hover:not(:disabled) {
  border-color: var(--color-accent);
  background: var(--color-accent-soft);
}

.route-actions button:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.route-actions button:active:not(:disabled) {
  transform: scale(0.97);
}

.mini-app-host {
  margin-top: var(--space-2);
}

.mini-app-host :deep(.team-layout) {
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-accent);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
}

.mini-app-host :deep(.team-layout > *),
.mini-app-host :deep(.child-route-page > *) {
  margin: 0;
}

.mini-app-host :deep(.team-layout > * + *),
.mini-app-host :deep(.child-route-page > * + *) {
  margin-top: var(--space-2);
}

.mini-app-host :deep(.nested-outlet-shell) {
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border);
}

.mini-app-host :deep(.outlet-depth) {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  overflow-wrap: anywhere;
}

.mini-app-host :deep(.child-route-page) {
  padding: var(--space-3);
  margin-top: var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-primary);
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

.timeline-panel {
  padding: var(--space-3);
  margin-top: var(--space-3);
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
  .nested-routes-lab {
    padding: var(--space-3);
  }

  .route-actions button,
  .state-strip p {
    box-sizing: border-box;
    width: calc(100% - var(--space-2));
    flex-basis: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .route-actions button {
    transition: none;
  }
}
</style>
