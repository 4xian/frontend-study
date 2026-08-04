<script setup lang="ts">
import { createApp, defineComponent, h, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import type { App } from 'vue'
import {
  RouterView,
  createMemoryHistory,
  createRouter,
  useLink,
  useRoute,
  useRouter,
} from 'vue-router'
import type { RouteRecordRaw, Router, RouterHistory } from 'vue-router'

const featureRouteName = 'feature-tool'

const miniAppHost = ref<HTMLElement | null>(null)
const ready = ref(false)
const busy = ref(false)
const generation = ref(0)
const hostPath = ref('等待挂载')
const currentPath = ref('尚未初始化')
const matchedNames = ref('无')
const currentParams = ref('无')
const currentQuery = ref('无')
const navigationOutcome = ref('尚未执行')
const hasFeatureRoute = ref(false)
const routeCount = ref(0)
const routeNames = ref('无')
const disposerState = ref('尚未创建')
const matcherLog = ref<string[]>([])
const navigationLog = ref<string[]>([])

let miniApp: App<Element> | undefined
let activeHistory: RouterHistory | undefined
let featureDisposer: (() => void) | undefined

/** 把 params 或 query 转换为稳定的可见文本。 */
function formatRecord(value: Record<string, unknown>): string {
  return Object.keys(value).length === 0 ? '无' : JSON.stringify(value)
}

/** 记录一条 matcher 操作时间线。 */
function appendMatcher(message: string): void {
  matcherLog.value = [...matcherLog.value, message]
}

/** 记录一条导航结算时间线。 */
function appendNavigation(message: string): void {
  navigationLog.value = [...navigationLog.value, message]
}

/** 同步当前 matcher 的公开可观察状态。 */
function syncMatcherState(router: Router): void {
  const names = router
    .getRoutes()
    .map((record) => String(record.name ?? '未命名'))
    .sort()
  hasFeatureRoute.value = router.hasRoute(featureRouteName)
  routeCount.value = names.length
  routeNames.value = names.length === 0 ? '无' : names.join(', ')
}

/** 同步独立 Router 与宿主页面的可见 route 状态。 */
async function syncRouteState(router: Router): Promise<void> {
  await nextTick()
  const route = router.currentRoute.value
  const names = route.matched.map((record) => String(record.name ?? '未命名'))
  currentPath.value = route.fullPath
  matchedNames.value = names.length === 0 ? '无' : names.join(' -> ')
  currentParams.value = formatRecord(route.params)
  currentQuery.value = formatRecord(route.query)
  hostPath.value = `${window.location.pathname}${window.location.search}${window.location.hash}`
}

/** 渲染一个读取当前 route 的轻量页面。 */
function createRoutePage(title: string, marker: string) {
  return defineComponent({
    name: `DynamicRouting${marker}Page`,
    /** 渲染当前独立 RouterView 的匹配证据。 */
    setup() {
      const route = useRoute()
      return () =>
        h('section', { class: 'route-card', 'data-testid': 'dynamic-route-view' }, [
          h('p', { class: 'route-kicker', 'data-testid': 'dynamic-route-marker' }, marker),
          h('h4', title),
          h('p', { 'data-testid': 'dynamic-route-card-path' }, route.fullPath),
        ])
    },
  })
}

const HomePage = createRoutePage('实验首页', 'home')
const FallbackPage = createRoutePage('Fallback 页面', 'fallback')
const FeaturePage = createRoutePage('动态 Feature 工具', 'feature')

const baseRoutes: RouteRecordRaw[] = [
  { path: '/home', name: 'home', component: HomePage },
  { path: '/:pathMatch(.*)*', name: 'fallback', component: FallbackPage },
]

const featureRoute: RouteRecordRaw = {
  path: '/feature/tool',
  name: featureRouteName,
  component: FeaturePage,
}

/** 注册固定动态记录，但不重新解析当前 route。 */
function registerFeatureRoute(router: Router): void {
  if (router.hasRoute(featureRouteName)) return
  featureDisposer = router.addRoute(featureRoute)
  disposerState.value = 'ready'
  appendMatcher('addRoute feature-tool')
  syncMatcherState(router)
}

/** 用最新 matcher 显式重新解析并替换当前地址。 */
async function refreshCurrentRoute(router: Router): Promise<void> {
  if (busy.value) return
  busy.value = true
  appendNavigation(`replace ${router.currentRoute.value.fullPath}`)
  try {
    await router.replace(router.currentRoute.value.fullPath)
    await syncRouteState(router)
  } finally {
    busy.value = false
  }
}

/** 按公开 route name 移除动态记录，但保留旧 disposer 供 no-op 观察。 */
function removeFeatureByName(router: Router): void {
  router.removeRoute(featureRouteName)
  disposerState.value = featureDisposer ? 'stale after removeRoute' : '尚未创建'
  appendMatcher('removeRoute feature-tool')
  syncMatcherState(router)
}

/** 调用本次 addRoute 返回的 disposer。 */
function callFeatureDisposer(router: Router): void {
  if (!featureDisposer) return
  featureDisposer()
  featureDisposer = undefined
  disposerState.value = 'used'
  appendMatcher('dispose current registration')
  syncMatcherState(router)
}

const CustomRouterLink = defineComponent({
  name: 'DynamicRoutingCustomLink',
  props: {
    linkId: { type: String, required: true },
    label: { type: String, required: true },
    to: { type: String, required: true },
  },
  /** 用 useLink 建立不复制 RouterLink 算法的自定义链接。 */
  setup(props) {
    const { route, href, isActive, isExactActive, navigate } = useLink(props)

    return () =>
      h(
        'a',
        {
          class: ['custom-link', { active: isActive.value, exact: isExactActive.value }],
          href: href.value,
          'aria-label': props.label,
          'aria-current': isExactActive.value ? 'page' : undefined,
          'data-testid': `${props.linkId}-link`,
          onClick: navigate,
        },
        [
          h('strong', props.label),
          h('span', { 'data-testid': `${props.linkId}-href` }, `href: ${href.value}`),
          h(
            'span',
            { 'data-testid': `${props.linkId}-active` },
            `active=${isActive.value}; exact=${isExactActive.value}`,
          ),
          h(
            'span',
            { 'data-testid': `${props.linkId}-resolved-matched` },
            `resolved matched: ${
              route.value.matched.map((record) => String(record.name ?? '未命名')).join(' -> ') ||
              '无'
            }`,
          ),
        ],
      )
  },
})

const MiniAppRoot = defineComponent({
  name: 'DynamicRoutingRouterLinkMiniApp',
  /** 渲染 matcher 命令、自定义站内链接、原生外链与 RouterView。 */
  setup() {
    const router = useRouter()

    return () =>
      h('div', { class: 'mini-app-root' }, [
        h('div', { class: 'matcher-actions', 'aria-label': '动态 matcher 命令' }, [
          h(
            'button',
            {
              type: 'button',
              disabled: busy.value || hasFeatureRoute.value,
              onClick: () => registerFeatureRoute(router),
            },
            '注册 Feature route',
          ),
          h(
            'button',
            {
              type: 'button',
              disabled: busy.value,
              onClick: () => refreshCurrentRoute(router),
            },
            'replace 当前地址',
          ),
          h(
            'button',
            {
              type: 'button',
              disabled: busy.value || !hasFeatureRoute.value,
              onClick: () => removeFeatureByName(router),
            },
            '按名称移除',
          ),
          h(
            'button',
            {
              type: 'button',
              disabled: busy.value || !featureDisposer,
              onClick: () => callFeatureDisposer(router),
            },
            '调用当前 disposer',
          ),
        ]),
        h('nav', { class: 'custom-links', 'aria-label': 'useLink 自定义链接' }, [
          h(CustomRouterLink, { linkId: 'home', label: '实验首页链接', to: '/home' }),
          h(CustomRouterLink, {
            linkId: 'feature',
            label: 'Feature 工具链接',
            to: '/feature/tool?mode=inspect',
          }),
          h(
            'a',
            {
              class: 'custom-link external',
              href: 'https://router.vuejs.org/',
              target: '_blank',
              rel: 'noopener noreferrer',
              'aria-label': 'Vue Router 官网',
              'data-testid': 'external-link',
            },
            [h('strong', 'Vue Router 官网'), h('span', '原生外链旁路')],
          ),
        ]),
        h(RouterView),
      ])
  },
})

/** 清理动态记录、独立应用和 memory history。 */
function teardownDemo(): void {
  featureDisposer?.()
  featureDisposer = undefined
  miniApp?.unmount()
  miniApp = undefined
  activeHistory?.destroy()
  activeHistory = undefined
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
  disposerState.value = '尚未创建'
  matcherLog.value = []
  navigationLog.value = []

  const routerHistory = createMemoryHistory('/lab')
  activeHistory = routerHistory
  const router = createRouter({ history: routerHistory, routes: baseRoutes })
  router.afterEach((to, from, failure) => {
    navigationOutcome.value = failure
      ? `failure(${failure.type}): ${from.fullPath} -> ${to.fullPath}`
      : `success: ${from.fullPath} -> ${to.fullPath}`
    appendNavigation(navigationOutcome.value)
    void syncRouteState(router)
  })

  await router.replace('/feature/tool?mode=inspect')
  await router.isReady()
  miniApp = createApp(MiniAppRoot)
  miniApp.use(router)
  miniApp.mount(miniAppHost.value)
  syncMatcherState(router)
  await syncRouteState(router)
  ready.value = true
}

/** 在课程页挂载后初始化动态路由实验。 */
onMounted(() => {
  void initializeDemo()
})

/** 离开课程时销毁独立 Router 的全部状态。 */
onBeforeUnmount(() => {
  teardownDemo()
})
</script>

<template>
  <section class="dynamic-routing-lab" aria-label="动态路由与 RouterLink 扩展实验">
    <div class="lab-copy">
      <p class="eyebrow">runtime matcher + useLink</p>
      <h3>先改变 matcher，再决定何时提交当前视图</h3>
      <p>所有按钮与链接都属于独立 memory router，宿主 URL 保持不变。</p>
    </div>

    <div ref="miniAppHost" class="mini-app-host" />

    <button class="reset-button" type="button" :disabled="!ready || busy" @click="initializeDemo">
      重置实验
    </button>

    <div class="status-list" data-testid="dynamic-status" aria-live="polite">
      <p>
        <span>ready</span><strong data-testid="dynamic-ready">{{ ready }}</strong>
      </p>
      <p>
        <span>generation</span><strong data-testid="dynamic-generation">{{ generation }}</strong>
      </p>
      <p>
        <span>宿主路径</span><strong data-testid="dynamic-host-path">{{ hostPath }}</strong>
      </p>
      <p>
        <span>current fullPath</span
        ><strong data-testid="dynamic-current-path">{{ currentPath }}</strong>
      </p>
      <p>
        <span>matched names</span
        ><strong data-testid="dynamic-matched-names">{{ matchedNames }}</strong>
      </p>
      <p>
        <span>params</span><strong data-testid="dynamic-params">{{ currentParams }}</strong>
      </p>
      <p>
        <span>query</span><strong data-testid="dynamic-query">{{ currentQuery }}</strong>
      </p>
      <p>
        <span>navigation outcome</span>
        <strong data-testid="dynamic-navigation-outcome">{{ navigationOutcome }}</strong>
      </p>
      <p>
        <span>hasRoute</span><strong data-testid="dynamic-has-route">{{ hasFeatureRoute }}</strong>
      </p>
      <p>
        <span>getRoutes count</span
        ><strong data-testid="dynamic-route-count">{{ routeCount }}</strong>
      </p>
      <p>
        <span>route names</span><strong data-testid="dynamic-route-names">{{ routeNames }}</strong>
      </p>
      <p>
        <span>disposer</span><strong data-testid="dynamic-disposer">{{ disposerState }}</strong>
      </p>
    </div>

    <div class="timeline-row">
      <section>
        <h4>Matcher 时间线</h4>
        <ol data-testid="dynamic-matcher-log">
          <li v-for="(event, index) in matcherLog" :key="`${index}-${event}`">{{ event }}</li>
        </ol>
      </section>
      <section>
        <h4>导航时间线</h4>
        <ol data-testid="dynamic-navigation-log">
          <li v-for="(event, index) in navigationLog" :key="`${index}-${event}`">{{ event }}</li>
        </ol>
      </section>
    </div>
  </section>
</template>

<style scoped>
.dynamic-routing-lab {
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-primary);
}

.lab-copy h3,
.lab-copy p,
.status-list p,
.timeline-row h4 {
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

.mini-app-host :deep(.matcher-actions),
.mini-app-host :deep(.custom-links),
.status-list,
.timeline-row {
  display: flex;
  flex-wrap: wrap;
  margin-right: calc(var(--space-2) * -1);
}

.mini-app-host :deep(.matcher-actions button),
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

.mini-app-host :deep(.custom-links) {
  margin-top: var(--space-2);
}

.mini-app-host :deep(.custom-link) {
  display: flex;
  flex: 1 1 190px;
  flex-direction: column;
  min-width: 0;
  padding: var(--space-3);
  margin: 0 var(--space-2) var(--space-2) 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
  text-decoration: none;
  background: var(--color-bg-elevated);
  transition:
    border-color var(--duration-fast) var(--ease-out),
    background-color var(--duration-fast) var(--ease-out);
}

.mini-app-host :deep(.custom-link:hover),
.mini-app-host :deep(.custom-link.active) {
  border-color: var(--color-accent);
  background: var(--color-accent-soft);
}

.mini-app-host :deep(.custom-link span) {
  margin-top: var(--space-1);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  overflow-wrap: anywhere;
}

.mini-app-host :deep(.route-card),
.status-list p,
.timeline-row section {
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
.timeline-row {
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
.timeline-row li {
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

@media (max-width: 640px) {
  .dynamic-routing-lab {
    padding: var(--space-3);
  }

  .mini-app-host :deep(.matcher-actions button),
  .reset-button,
  .mini-app-host :deep(.custom-link),
  .status-list p,
  .timeline-row section {
    box-sizing: border-box;
    width: calc(100% - var(--space-2));
    min-width: 0;
    flex-basis: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .mini-app-host :deep(.matcher-actions button),
  .reset-button,
  .mini-app-host :deep(.custom-link) {
    transition: none;
  }
}
</style>
