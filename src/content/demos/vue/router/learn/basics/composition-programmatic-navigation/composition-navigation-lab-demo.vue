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
import {
  RouterView,
  createMemoryHistory,
  createRouter,
  onBeforeRouteLeave,
  onBeforeRouteUpdate,
  useRoute,
  useRouter,
} from 'vue-router'
import type {
  NavigationFailure,
  RouteLocationNormalizedLoaded,
  Router,
  RouteRecordRaw,
} from 'vue-router'

type HistoryOperation = { kind: 'push' } | { kind: 'replace' } | { kind: 'go'; delta: number }

const miniAppHost = ref<HTMLElement | null>(null)
const ready = ref(false)
const currentPathname = ref('尚未初始化')
const matchedNames = ref('无')
const currentParams = ref('无')
const currentQuery = ref('无')
const navigationResult = ref('等待导航')
const hostPath = ref('等待挂载')
const historyEntries = ref<string[]>([])
const historyIndex = ref(-1)
const watchedIdChanges = ref(0)
const updateGuardRuns = ref(0)
const leaveGuardRuns = ref(0)
const unsavedChanges = ref(false)
const timeline = ref<string[]>([])

let miniApp: App<Element> | undefined
let demoRouter: Router | undefined
let pendingHistoryOperation: HistoryOperation | undefined

/** 向时间线追加一条可观察事件。 */
function appendTimeline(message: string): void {
  timeline.value = [...timeline.value, message]
}

const UserEditorPage = defineComponent({
  name: 'CompositionNavigationUserEditorPage',
  /** 注册定向 watch 和两类组件内路由守卫。 */
  setup() {
    const route = useRoute()

    watch(
      () => route.params.id,
      (id, previousId) => {
        watchedIdChanges.value += 1
        appendTimeline(`watch params.id：${String(previousId)} → ${String(id)}`)
      },
    )

    onBeforeRouteUpdate((to, from) => {
      updateGuardRuns.value += 1
      appendTimeline(`update guard：${String(from.params.id)} → ${String(to.params.id)}`)
    })

    onBeforeRouteLeave((to, from) => {
      leaveGuardRuns.value += 1
      if (!unsavedChanges.value) {
        appendTimeline(`leave guard：${from.fullPath} → ${to.fullPath}；放行`)
        return
      }
      appendTimeline(`leave guard：${from.fullPath} → ${to.fullPath}；拒绝未保存更改`)
      return false
    })

    return () =>
      h('section', { class: 'route-page', 'data-testid': 'mini-route-view' }, [
        h('p', { class: 'route-kicker' }, '当前记录：user-editor'),
        h('h4', `用户 ${String(route.params.id)} 编辑页`),
        h('p', '同一记录内切换 id 时复用该组件。'),
      ])
  },
})

const DonePage = defineComponent({
  name: 'CompositionNavigationDonePage',
  /** 渲染离开用户记录后的目标页。 */
  setup() {
    return () =>
      h('section', { class: 'route-page', 'data-testid': 'mini-route-view' }, [
        h('p', { class: 'route-kicker' }, '当前记录：done'),
        h('h4', '完成页'),
        h('p', 'leave guard 已放行这次导航。'),
      ])
  },
})

const routes: RouteRecordRaw[] = [
  {
    path: '/users/:id',
    name: 'user-editor',
    component: UserEditorPage,
  },
  {
    path: '/done',
    name: 'done',
    component: DonePage,
  },
]

/** 把 afterEach 的公开 failure 参数转换为可见结果。 */
function formatNavigationResult(failure: NavigationFailure | void): string {
  return failure ? `失败（type ${failure.type}）` : '成功'
}

/** 只在导航成功后应用当前 history 操作。 */
function applySuccessfulHistory(to: RouteLocationNormalizedLoaded): void {
  const operation = pendingHistoryOperation
  if (!operation) return

  if (operation.kind === 'push') {
    const retainedEntries = historyEntries.value.slice(0, historyIndex.value + 1)
    historyEntries.value = [...retainedEntries, to.fullPath]
    historyIndex.value = historyEntries.value.length - 1
  } else if (operation.kind === 'replace') {
    if (historyIndex.value < 0) {
      historyEntries.value = [to.fullPath]
      historyIndex.value = 0
    } else {
      historyEntries.value = historyEntries.value.map((entry, index) =>
        index === historyIndex.value ? to.fullPath : entry,
      )
    }
  } else {
    historyIndex.value = Math.max(
      0,
      Math.min(historyIndex.value + operation.delta, historyEntries.value.length - 1),
    )
  }
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

/** 记录导航结果，失败时保持可见 history 不变。 */
function recordNavigation(
  to: RouteLocationNormalizedLoaded,
  from: RouteLocationNormalizedLoaded,
  failure: NavigationFailure | void,
): void {
  const result = formatNavigationResult(failure)
  navigationResult.value = result
  if (!failure) applySuccessfulHistory(to)
  appendTimeline(`afterEach：${from.fullPath} → ${to.fullPath}；结果：${result}`)
  pendingHistoryOperation = undefined
  void syncVisibleState()
}

const MiniAppRoot = defineComponent({
  name: 'CompositionNavigationMiniApp',
  /** 通过 useRouter/useRoute 提供真实编程式导航控件。 */
  setup() {
    const router = useRouter()
    const route = useRoute()

    /** 用 push 新增用户 2 的历史条目。 */
    async function pushUserTwo(): Promise<void> {
      pendingHistoryOperation = { kind: 'push' }
      await router.push({ name: 'user-editor', params: { id: '2' }, query: { tab: 'profile' } })
    }

    /** 用 replace 覆盖当前条目为用户 3。 */
    async function replaceUserThree(): Promise<void> {
      pendingHistoryOperation = { kind: 'replace' }
      await router.replace({ name: 'user-editor', params: { id: '3' }, query: { tab: 'activity' } })
    }

    /** 使用真实 history go 返回上一条记录。 */
    function goBack(): void {
      if (historyIndex.value <= 0) return
      pendingHistoryOperation = { kind: 'go', delta: -1 }
      router.go(-1)
    }

    /** 离开用户记录，交给 leave guard 决定是否放行。 */
    async function leaveEditor(): Promise<void> {
      pendingHistoryOperation = { kind: 'push' }
      await router.push({ name: 'done' })
    }

    /** 同步未保存勾选状态。 */
    function updateUnsavedState(event: Event): void {
      unsavedChanges.value = (event.target as HTMLInputElement).checked
    }

    return () =>
      h('div', { class: 'mini-app-root' }, [
        h('div', { class: 'composition-status', 'data-testid': 'composition-status' }, [
          h('span', 'useRoute() pathname'),
          h('strong', route.path),
          h('span', 'useRouter()'),
          h('strong', router === demoRouter ? '已注入独立 router' : '注入异常'),
        ]),
        h('div', { class: 'route-actions', 'aria-label': '组合式导航命令' }, [
          h('button', { type: 'button', onClick: pushUserTwo }, 'push 用户 2'),
          h('button', { type: 'button', onClick: replaceUserThree }, 'replace 用户 3'),
          h(
            'button',
            { type: 'button', disabled: historyIndex.value <= 0, onClick: goBack },
            'go(-1)',
          ),
          h('button', { type: 'button', onClick: leaveEditor }, '离开到完成页'),
        ]),
        h('label', { class: 'unsaved-control' }, [
          h('input', {
            type: 'checkbox',
            checked: unsavedChanges.value,
            onChange: updateUnsavedState,
          }),
          h('span', '有未保存更改'),
        ]),
        h(RouterView),
      ])
  },
})

/** 清空旧 mini-app，并从唯一初始位置重建实验。 */
async function initializeDemo(): Promise<void> {
  if (!miniAppHost.value) return

  ready.value = false
  miniApp?.unmount()
  historyEntries.value = []
  historyIndex.value = -1
  watchedIdChanges.value = 0
  updateGuardRuns.value = 0
  leaveGuardRuns.value = 0
  unsavedChanges.value = false
  timeline.value = []
  navigationResult.value = '等待导航'

  demoRouter = createRouter({
    history: createMemoryHistory(),
    routes,
  })
  demoRouter.afterEach(recordNavigation)
  pendingHistoryOperation = { kind: 'replace' }
  await demoRouter.replace({
    name: 'user-editor',
    params: { id: '1' },
    query: { tab: 'profile' },
  })
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
  <section class="composition-navigation-lab" aria-label="组合式导航与守卫实验">
    <div class="lab-copy">
      <p class="eyebrow">useRoute + useRouter + guards</p>
      <h3>同一导航管线，三种历史命令</h3>
      <p>先对比 push、replace 与 go，再用未保存状态观察 leave guard 取消导航。</p>
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

    <div class="history-panel">
      <div class="panel-heading">
        <h4>可见 history 序列</h4>
        <button type="button" :disabled="!ready" @click="initializeDemo">重置实验</button>
      </div>
      <ol data-testid="mini-history-sequence">
        <li
          v-for="(entry, index) in historyEntries"
          :key="`${index}-${entry}`"
          :class="{ current: index === historyIndex }"
        >
          <span>{{ index === historyIndex ? '当前' : '历史' }}</span>
          <strong>{{ entry }}</strong>
        </li>
      </ol>
    </div>

    <div class="counter-panel">
      <p>
        <span>watch params.id</span>
        <strong data-testid="watch-id-count">{{ watchedIdChanges }}</strong>
      </p>
      <p>
        <span>update guard</span>
        <strong data-testid="update-guard-count">{{ updateGuardRuns }}</strong>
      </p>
      <p>
        <span>leave guard</span>
        <strong data-testid="leave-guard-count">{{ leaveGuardRuns }}</strong>
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
.composition-navigation-lab {
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-primary);
}

.lab-copy h3,
.lab-copy p,
.state-strip p,
.history-panel h4,
.counter-panel p,
.timeline-panel h4 {
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

.mini-app-host :deep(.composition-status) {
  display: flex;
  flex-wrap: wrap;
  padding: var(--space-3);
  margin-right: calc(var(--space-2) * -1);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
}

.mini-app-host :deep(.composition-status span),
.mini-app-host :deep(.composition-status strong) {
  margin-right: var(--space-2);
  margin-bottom: var(--space-1);
  overflow-wrap: anywhere;
}

.mini-app-host :deep(.composition-status span) {
  color: var(--color-text-secondary);
}

.mini-app-host :deep(.route-actions) {
  display: flex;
  flex-wrap: wrap;
  margin: var(--space-3) calc(var(--space-2) * -1) 0 0;
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

.mini-app-host :deep(.route-actions button:hover:not(:disabled)),
.panel-heading button:hover:not(:disabled) {
  border-color: var(--color-accent);
  background: var(--color-accent-soft);
}

.mini-app-host :deep(.route-actions button:active:not(:disabled)),
.panel-heading button:active:not(:disabled) {
  transform: scale(0.97);
}

.mini-app-host :deep(.unsaved-control) {
  display: flex;
  align-items: center;
  min-height: 40px;
  margin-top: var(--space-1);
}

.mini-app-host :deep(.unsaved-control input) {
  width: 20px;
  height: 20px;
  margin: 0 var(--space-2) 0 0;
}

.mini-app-host :deep(.route-page) {
  min-height: 120px;
  padding: var(--space-3);
  margin-top: var(--space-3);
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-accent);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
}

.mini-app-host :deep(.route-page > *) {
  margin: 0;
}

.mini-app-host :deep(.route-page > * + *) {
  margin-top: var(--space-2);
}

.state-strip,
.counter-panel {
  display: flex;
  flex-wrap: wrap;
  margin: var(--space-3) calc(var(--space-2) * -1) 0 0;
}

.state-strip p,
.counter-panel p {
  min-width: 160px;
  flex: 1 1 160px;
  padding: var(--space-3);
  margin: 0 var(--space-2) var(--space-2) 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
}

.state-strip span,
.counter-panel span,
.history-panel li span {
  display: block;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.state-strip strong,
.counter-panel strong,
.history-panel li strong {
  display: block;
  margin-top: var(--space-1);
  overflow-wrap: anywhere;
}

.history-panel,
.timeline-panel {
  padding: var(--space-3);
  margin-top: var(--space-3);
  border-top: 1px solid var(--color-border);
}

.panel-heading {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  margin-right: calc(var(--space-2) * -1);
}

.panel-heading h4 {
  margin-right: var(--space-2);
  margin-bottom: var(--space-2);
}

.history-panel ol {
  padding: 0;
  margin: var(--space-2) 0 0;
  list-style: none;
}

.history-panel li {
  padding: var(--space-2) var(--space-3);
  border-left: 3px solid var(--color-border);
  background: var(--color-bg-elevated);
}

.history-panel li + li {
  margin-top: var(--space-2);
}

.history-panel li.current {
  border-left-color: var(--color-accent);
  background: var(--color-accent-soft);
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
  .composition-navigation-lab {
    padding: var(--space-3);
  }

  .mini-app-host :deep(.route-actions button),
  .panel-heading button,
  .state-strip p,
  .counter-panel p {
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
