<script setup lang="ts">
import { createApp, defineComponent, h, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import type { App } from 'vue'
import { RouterView, createMemoryHistory, createRouter, useRoute } from 'vue-router'
import type { NavigationFailure, RouteLocationRaw, Router, RouteRecordRaw } from 'vue-router'

type NavigationMode = 'name' | 'redirect' | 'alias'

const miniAppHost = ref<HTMLElement | null>(null)
const ready = ref(false)
const requestedLocation = ref('等待导航')
const currentPathname = ref('尚未初始化')
const matchedNames = ref('无')
const aliasOf = ref('无')
const currentParams = ref('无')
const currentQuery = ref('无')
const redirectedFrom = ref('无')
const navigationResult = ref('等待导航')
const hostPath = ref('等待挂载')
const guardTrace = ref<string[]>([])
const redirectRecordGuardRuns = ref(0)

let miniApp: App<Element> | undefined
let demoRouter: Router | undefined

/** 将一条 record guard 事件追加到可见轨迹。 */
function appendGuardTrace(message: string): void {
  guardTrace.value = [...guardTrace.value, message]
}

const NeutralPage = defineComponent({
  name: 'NamedRouteNeutralPage',
  /** 渲染三种导航共同使用的中立起点。 */
  setup() {
    return () =>
      h('section', { class: 'route-page', 'data-testid': 'mini-route-view' }, [
        h('p', { class: 'route-kicker' }, '当前记录：route-entry'),
        h('h4', '中立起点'),
        h('p', '三个入口都会先回到这里，再开始一条独立导航。'),
      ])
  },
})

const DirectoryLayout = defineComponent({
  name: 'NamedRouteDirectoryLayout',
  /** 渲染原记录和绝对 alias 共用的父级 RouterView。 */
  setup() {
    return () =>
      h('article', { class: 'directory-layout' }, [
        h('p', { class: 'layout-label' }, '目录父记录'),
        h(RouterView),
      ])
  },
})

const ProfilePage = defineComponent({
  name: 'NamedRouteProfilePage',
  /** 从当前 route 呈现解码后的参数与入口来源。 */
  setup() {
    const route = useRoute()
    return () =>
      h('section', { class: 'route-page', 'data-testid': 'mini-route-view' }, [
        h('p', { class: 'route-kicker' }, '目标记录：profile-main'),
        h('h4', `用户 ${String(route.params.username)} 的资料页`),
        h('p', `入口来源：${String(route.query.source ?? '无')}`),
      ])
  },
})

const routes: RouteRecordRaw[] = [
  {
    path: '/start',
    name: 'route-entry',
    component: NeutralPage,
  },
  {
    path: '/directory',
    name: 'directory-layout',
    component: DirectoryLayout,
    children: [
      {
        path: 'profiles/:username',
        name: 'profile-main',
        component: ProfilePage,
        alias: ['alternative/:username', '/members/:username'],
        beforeEnter: (to, from) => {
          appendGuardTrace(`目标 record guard：${from.fullPath} → ${to.fullPath}`)
        },
      },
    ],
  },
  {
    path: '/legacy/:username',
    beforeEnter: () => {
      redirectRecordGuardRuns.value += 1
      appendGuardTrace('redirect record guard：不应出现')
    },
    redirect: (to) => ({
      name: 'profile-main',
      params: { username: to.params.username },
      query: to.query,
    }),
  },
]

const MiniAppRoot = defineComponent({
  name: 'NamedRoutesRedirectsAliasesMiniApp',
  /** 渲染独立 router 的当前匹配视图。 */
  setup() {
    return () => h('div', { class: 'mini-app-root' }, [h(RouterView)])
  },
})

/** 把对象字段转换为稳定的可见 JSON，没有字段时显示“无”。 */
function formatRecord(value: Record<string, unknown>): string {
  return Object.keys(value).length > 0 ? JSON.stringify(value) : '无'
}

/** 把导航 Promise 的公开结果转换为可见文本。 */
function formatNavigationResult(mode: NavigationMode, failure: NavigationFailure | void): string {
  return failure ? `失败（type ${failure.type}）` : `成功（${mode}）`
}

/** 从独立 currentRoute 同步地址、匹配与宿主隔离状态。 */
async function syncVisibleState(): Promise<void> {
  if (!demoRouter) return
  await nextTick()
  const route = demoRouter.currentRoute.value
  currentPathname.value = route.path
  matchedNames.value = route.matched.map((record) => String(record.name ?? record.path)).join(' → ')
  aliasOf.value =
    route.matched
      .filter((record) => record.aliasOf)
      .map(
        (record) =>
          `${String(record.name ?? record.path)} ← ${String(record.aliasOf?.path ?? '未知')}`,
      )
      .join(' → ') || '无'
  currentParams.value = formatRecord(route.params)
  currentQuery.value = formatRecord(route.query)
  redirectedFrom.value = route.redirectedFrom?.fullPath ?? '无'
  hostPath.value = `${window.location.pathname}${window.location.search}${window.location.hash}`
}

/** 从中立页开始一次独立导航，并在 Promise 结束后公开结果。 */
async function runFromNeutral(
  mode: NavigationMode,
  to: RouteLocationRaw,
  input: string,
): Promise<void> {
  if (!demoRouter) return
  if (demoRouter.currentRoute.value.path !== '/start') await demoRouter.replace('/start')
  guardTrace.value = []
  requestedLocation.value = input
  navigationResult.value = '导航中'
  const failure = await demoRouter.push(to)
  navigationResult.value = formatNavigationResult(mode, failure)
  await syncVisibleState()
}

/** 使用唯一 name 和含特殊字符的 params 进入目标记录。 */
async function navigateByName(): Promise<void> {
  await runFromNeutral(
    'name',
    {
      name: 'profile-main',
      params: { username: 'Jian Li/演示' },
      query: { source: 'name' },
    },
    'name: profile-main；username: Jian Li/演示',
  )
}

/** 访问 redirect 地址，让路由器替换为目标记录地址。 */
async function navigateByRedirect(): Promise<void> {
  await runFromNeutral(
    'redirect',
    '/legacy/legacy%20user?source=redirect',
    '/legacy/legacy%20user?source=redirect',
  )
}

/** 访问绝对 alias，并保留 alias pathname。 */
async function navigateByAlias(): Promise<void> {
  await runFromNeutral(
    'alias',
    '/members/alias-user?source=alias',
    '/members/alias-user?source=alias',
  )
}

/** 返回中立页并清空本次输入与守卫轨迹。 */
async function returnToNeutral(): Promise<void> {
  if (!demoRouter) return
  await demoRouter.replace('/start')
  requestedLocation.value = '等待导航'
  navigationResult.value = '成功（neutral）'
  guardTrace.value = []
  await syncVisibleState()
}

onMounted(async () => {
  if (!miniAppHost.value) return

  demoRouter = createRouter({
    history: createMemoryHistory(),
    routes,
  })
  await demoRouter.push('/start')
  await demoRouter.isReady()

  miniApp = createApp(MiniAppRoot)
  miniApp.use(demoRouter)
  miniApp.mount(miniAppHost.value)
  navigationResult.value = '成功（neutral）'
  await syncVisibleState()
  ready.value = true
})

onBeforeUnmount(() => {
  miniApp?.unmount()
  miniApp = undefined
  demoRouter = undefined
})
</script>

<template>
  <section class="named-route-lab" aria-labelledby="named-route-lab-title">
    <div class="lab-copy">
      <p class="eyebrow">独立 memory router</p>
      <h3 id="named-route-lab-title">命名路由、重定向与别名实验</h3>
      <p>三种入口共享目标组件，但地址和匹配来源各自可见。</p>
    </div>

    <div ref="miniAppHost" class="mini-app-host" :aria-busy="!ready" />

    <div class="route-actions" aria-label="路由入口">
      <button type="button" :disabled="!ready" @click="navigateByName">按 name 导航</button>
      <button type="button" :disabled="!ready" @click="navigateByRedirect">访问 redirect</button>
      <button type="button" :disabled="!ready" @click="navigateByAlias">访问 alias</button>
      <button type="button" :disabled="!ready" @click="returnToNeutral">返回中立页</button>
    </div>

    <div class="state-panel" data-testid="router-state-panel">
      <p>
        <span>输入 location</span>
        <strong data-testid="requested-location">{{ requestedLocation }}</strong>
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
        <span>aliasOf</span>
        <strong data-testid="mini-alias-of">{{ aliasOf }}</strong>
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
        <span>redirectedFrom</span>
        <strong data-testid="mini-redirected-from">{{ redirectedFrom }}</strong>
      </p>
      <p>
        <span>导航结果</span>
        <strong data-testid="mini-navigation-result">{{ navigationResult }}</strong>
      </p>
      <p>
        <span>redirect record guard 次数</span>
        <strong data-testid="redirect-record-guard-count">{{ redirectRecordGuardRuns }}</strong>
      </p>
      <p>
        <span>宿主 URL</span>
        <strong data-testid="host-path-now">{{ hostPath }}</strong>
      </p>
    </div>

    <div class="guard-panel">
      <h4>record guard 轨迹</h4>
      <ol data-testid="guard-trace">
        <li v-if="guardTrace.length === 0">暂无 record guard</li>
        <li v-for="(item, index) in guardTrace" :key="`${index}-${item}`">{{ item }}</li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.named-route-lab {
  min-width: 0;
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-primary);
}

.lab-copy h3,
.lab-copy p,
.state-panel p,
.guard-panel h4,
.guard-panel ol {
  margin: 0;
}

.lab-copy > * + * {
  margin-top: var(--space-2);
}

.eyebrow,
.mini-app-host :deep(.route-kicker),
.mini-app-host :deep(.layout-label) {
  color: var(--color-accent);
  font-size: var(--font-size-sm);
  font-weight: 700;
}

.mini-app-host {
  min-width: 0;
  margin-top: var(--space-4);
}

.mini-app-host :deep(.mini-app-root),
.mini-app-host :deep(.directory-layout),
.mini-app-host :deep(.route-page) {
  min-width: 0;
}

.mini-app-host :deep(.directory-layout),
.mini-app-host :deep(.route-page) {
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
}

.mini-app-host :deep(.directory-layout .route-page) {
  margin-top: var(--space-2);
}

.mini-app-host :deep(.route-page > *),
.mini-app-host :deep(.directory-layout > *) {
  margin-top: 0;
  margin-bottom: 0;
  overflow-wrap: anywhere;
}

.mini-app-host :deep(.route-page > * + *),
.mini-app-host :deep(.directory-layout > * + *) {
  margin-top: var(--space-2);
}

.route-actions {
  display: flex;
  flex-wrap: wrap;
  margin: var(--space-4) calc(var(--space-2) * -1) 0 0;
}

.route-actions button {
  min-width: 0;
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

.route-actions button:hover:not(:disabled),
.route-actions button:focus-visible {
  border-color: var(--color-accent);
  background: var(--color-accent-soft);
}

.route-actions button:active:not(:disabled) {
  transform: scale(0.98);
}

.state-panel,
.guard-panel {
  min-width: 0;
  padding: var(--space-3);
  margin-top: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
}

.state-panel p {
  display: flex;
  align-items: flex-start;
  min-width: 0;
}

.state-panel p + p {
  padding-top: var(--space-2);
  margin-top: var(--space-2);
  border-top: 1px solid var(--color-border);
}

.state-panel span {
  flex: 0 0 10rem;
  color: var(--color-text-secondary);
  overflow-wrap: anywhere;
}

.state-panel strong {
  min-width: 0;
  overflow-wrap: anywhere;
}

.guard-panel ol {
  padding-left: var(--space-5);
  margin-top: var(--space-2);
}

.guard-panel li {
  overflow-wrap: anywhere;
}

.guard-panel li + li {
  margin-top: var(--space-1);
}

@media (max-width: 640px) {
  .named-route-lab {
    padding: var(--space-3);
  }

  .state-panel p {
    display: block;
  }

  .state-panel span,
  .state-panel strong {
    display: block;
  }

  .state-panel strong {
    margin-top: var(--space-1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .route-actions button {
    transition: none;
  }

  .route-actions button:active:not(:disabled) {
    transform: none;
  }
}
</style>
