<script setup lang="ts">
import {
  createApp,
  defineComponent,
  h,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue'
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
const paramsShape = ref('无')
const currentQuery = ref('无')
const currentHash = ref('无')
const resolvedHref = ref('尚未解析')
const navigationResult = ref('等待导航')
const hostPath = ref('等待挂载')
const userMountCount = ref(0)
const userParamChangeCount = ref(0)
const timeline = ref<string[]>([])

let miniApp: App<Element> | undefined
let demoRouter: Router | undefined

const UserRoutePage = defineComponent({
  name: 'RouteMatchingUserPage',
  /** 观察同一用户记录在参数变化时复用组件实例。 */
  setup() {
    const route = useRoute()

    onMounted(() => {
      userMountCount.value += 1
    })

    watch(
      () => route.params.id,
      () => {
        userParamChangeCount.value += 1
      },
    )

    return () =>
      h('section', { class: 'route-page', 'data-testid': 'mini-route-view' }, [
        h('p', { class: 'route-kicker' }, '同一用户记录'),
        h('h4', `用户 ${String(route.params.id)}`),
        h('p', `tab: ${String(route.query.tab ?? '无')} · hash: ${route.hash || '无'}`),
      ])
  },
})

const TagsRoutePage = defineComponent({
  name: 'RouteMatchingTagsPage',
  /** 渲染重复参数解析出的数组值。 */
  setup() {
    const route = useRoute()
    return () =>
      h('section', { class: 'route-page', 'data-testid': 'mini-route-view' }, [
        h('p', { class: 'route-kicker' }, '重复参数记录'),
        h('h4', '标签结果'),
        h('p', `tags: ${JSON.stringify(route.params.tags)}`),
      ])
  },
})

const CatchAllRoutePage = defineComponent({
  name: 'RouteMatchingCatchAllPage',
  /** 渲染 catch-all 参数保留的未知路径层级。 */
  setup() {
    const route = useRoute()
    return () =>
      h('section', { class: 'route-page', 'data-testid': 'mini-route-view' }, [
        h('p', { class: 'route-kicker' }, 'Catch-all 记录'),
        h('h4', '未匹配路径'),
        h('p', `pathMatch: ${JSON.stringify(route.params.pathMatch)}`),
      ])
  },
})

const routes: RouteRecordRaw[] = [
  {
    path: '/users/:id',
    name: 'user-detail',
    component: UserRoutePage,
  },
  {
    path: '/tags/:tags+',
    name: 'tag-results',
    component: TagsRoutePage,
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: CatchAllRoutePage,
  },
]

const MiniAppRoot = defineComponent({
  name: 'RouteMatchingMiniApp',
  /** 只渲染独立 router 当前匹配的页面组件。 */
  setup() {
    return () => h('div', { class: 'mini-app-root' }, [h(RouterView)])
  },
})

/** 把标准化 params 转成可读 JSON。 */
function formatParams(params: RouteLocationNormalizedLoaded['params']): string {
  return Object.keys(params).length > 0 ? JSON.stringify(params) : '无'
}

/** 标注每个参数当前是 string 还是 string[]。 */
function formatParamShapes(params: RouteLocationNormalizedLoaded['params']): string {
  const entries = Object.entries(params)
  if (entries.length === 0) return '无'
  return entries
    .map(([key, value]) => `${key}: ${Array.isArray(value) ? `array(${value.length})` : 'string'}`)
    .join(' · ')
}

/** 把导航 failure 转成实验台可见结果。 */
function formatNavigationResult(failure: NavigationFailure | void): string {
  return failure ? `失败（type ${failure.type}）` : '成功'
}

/** 从独立 currentRoute 同步全部可观察状态。 */
async function syncVisibleState(): Promise<void> {
  if (!demoRouter) return
  await nextTick()
  const route = demoRouter.currentRoute.value
  currentPathname.value = route.path
  matchedNames.value = route.matched.map((record) => String(record.name ?? record.path)).join(' → ')
  currentParams.value = formatParams(route.params)
  paramsShape.value = formatParamShapes(route.params)
  currentQuery.value = Object.keys(route.query).length > 0 ? JSON.stringify(route.query) : '无'
  currentHash.value = route.hash || '无'
  hostPath.value = `${window.location.pathname}${window.location.search}${window.location.hash}`
}

/** 记录每次导航的起点、终点和最终结果。 */
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

/** 先 resolve 目标地址，再提交给独立 memory router。 */
async function navigate(to: RouteLocationRaw): Promise<void> {
  if (!demoRouter) return
  resolvedHref.value = demoRouter.resolve(to).href
  await demoRouter.push(to)
  await syncVisibleState()
}

/** 回到初始用户位置，并清空此前的导航时间线。 */
async function resetDemo(): Promise<void> {
  if (!demoRouter) return
  timeline.value = []
  const target: RouteLocationRaw = {
    name: 'user-detail',
    params: { id: '42' },
    query: { tab: 'profile' },
    hash: '#bio',
  }
  resolvedHref.value = demoRouter.resolve(target).href
  await demoRouter.replace(target)
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

  const initialLocation: RouteLocationRaw = {
    name: 'user-detail',
    params: { id: '42' },
    query: { tab: 'profile' },
    hash: '#bio',
  }
  resolvedHref.value = demoRouter.resolve(initialLocation).href
  await demoRouter.replace(initialLocation)
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
  <section class="route-matching-lab" aria-label="路由参数与匹配实验">
    <div class="lab-copy">
      <p class="eyebrow">Params + query + resolve</p>
      <h3>同一套路由器，三种参数形态</h3>
      <p>先观察 resolve href，再核对导航后的标准化 route 与组件复用计数。</p>
    </div>

    <div class="route-actions" aria-label="参数导航命令">
      <button
        type="button"
        :disabled="!ready"
        @click="
          navigate({
            name: 'user-detail',
            params: { id: '84' },
            query: { tab: 'activity' },
            hash: '#history',
          })
        "
      >
        用户 84
      </button>
      <button
        type="button"
        :disabled="!ready"
        @click="
          navigate({
            name: 'tag-results',
            params: { tags: ['vue', 'router'] },
            query: { sort: 'recent' },
          })
        "
      >
        两级 tags
      </button>
      <button
        type="button"
        :disabled="!ready"
        @click="
          navigate({
            name: 'not-found',
            params: { pathMatch: ['missing', 'guide'] },
            query: { from: 'demo' },
          })
        "
      >
        Catch-all
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
        <span>params shape</span>
        <strong data-testid="mini-params-shape">{{ paramsShape }}</strong>
      </p>
      <p>
        <span>query</span>
        <strong data-testid="mini-route-query">{{ currentQuery }}</strong>
      </p>
      <p>
        <span>hash</span>
        <strong data-testid="mini-route-hash">{{ currentHash }}</strong>
      </p>
      <p>
        <span>resolved href</span>
        <strong data-testid="mini-resolved-href">{{ resolvedHref }}</strong>
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

    <div class="reuse-panel">
      <h4>用户组件复用</h4>
      <p>
        <span>挂载次数</span>
        <strong data-testid="user-mount-count">{{ userMountCount }}</strong>
      </p>
      <p>
        <span>id 变化次数</span>
        <strong data-testid="user-param-change-count">{{ userParamChangeCount }}</strong>
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
.route-matching-lab {
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-primary);
}

.lab-copy h3,
.lab-copy p,
.state-strip p,
.reuse-panel h4,
.reuse-panel p,
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

.route-actions {
  display: flex;
  flex-wrap: wrap;
  margin: var(--space-4) calc(var(--space-2) * -1) 0 0;
}

.route-actions button {
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

.route-actions button:hover:not(:disabled) {
  border-color: var(--color-accent);
  background: var(--color-accent-soft);
}

.route-actions button:active:not(:disabled) {
  transform: scale(0.97);
}

.mini-app-host {
  margin-top: var(--space-2);
}

.mini-app-host :deep(.route-page) {
  min-height: 128px;
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-accent);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
}

.mini-app-host :deep(.route-page > *),
.mini-app-host :deep(.route-page h4) {
  margin: 0;
}

.mini-app-host :deep(.route-page > * + *) {
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

.state-strip span,
.reuse-panel span {
  display: block;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.state-strip strong,
.reuse-panel strong {
  display: block;
  margin-top: var(--space-1);
  overflow-wrap: anywhere;
}

.reuse-panel,
.timeline-panel {
  margin-top: var(--space-3);
  padding: var(--space-3);
  border-top: 1px solid var(--color-border);
}

.reuse-panel {
  display: flex;
  flex-wrap: wrap;
  margin-right: calc(var(--space-2) * -1);
}

.reuse-panel h4 {
  flex-basis: 100%;
  margin-right: var(--space-2);
  margin-bottom: var(--space-2);
}

.reuse-panel p {
  min-width: 128px;
  flex: 1 1 128px;
  margin-right: var(--space-2);
  margin-bottom: var(--space-2);
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
  .route-matching-lab {
    padding: var(--space-3);
  }

  .route-actions button,
  .state-strip p,
  .reuse-panel p {
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
