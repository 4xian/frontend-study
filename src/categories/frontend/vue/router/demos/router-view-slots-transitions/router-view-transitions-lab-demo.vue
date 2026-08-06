<script setup lang="ts">
import {
  KeepAlive,
  Transition,
  cloneVNode,
  createApp,
  defineComponent,
  h,
  nextTick,
  onActivated,
  onBeforeUnmount,
  onDeactivated,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from 'vue'
import type { App, VNode } from 'vue'
import { RouterView, createMemoryHistory, createRouter, useRouter } from 'vue-router'
import type { RouteLocationNormalizedLoaded, RouteRecordRaw, Router } from 'vue-router'

type ViewKind = 'workspace' | 'review'
type TransitionStage = 'before-leave' | 'after-leave' | 'before-enter' | 'after-enter'

interface RouterViewSlotState {
  Component?: VNode
  route: RouteLocationNormalizedLoaded
}

const miniAppHost = ref<HTMLElement | null>(null)
const ready = ref(false)
const readyBeforeMount = ref(false)
const miniAppMounted = ref(false)
const busy = ref(false)
const keepAliveEnabled = ref(false)
const pathKeyEnabled = ref(false)
const transitionEnabled = ref(true)
const generation = ref(0)
const currentPath = ref('尚未初始化')
const hostPath = ref('等待挂载')
const matchedNames = ref('无')
const currentParams = ref('无')
const currentQuery = ref('无')
const activeComponent = ref('无')
const activeInstanceId = ref('无')
const activeCount = ref(0)
const navigationOutcome = ref('尚未执行')
const initialTransitionCount = ref(0)
const lifecycleLog = ref<string[]>([])
const transitionLog = ref<string[]>([])
const navigationLog = ref<string[]>([])

let miniApp: App<Element> | undefined
let instanceSerial = 0

/** 追加一条组件生命周期记录。 */
function appendLifecycle(message: string): void {
  lifecycleLog.value = [...lifecycleLog.value, message]
}

/** 追加一条 route transition hook 记录。 */
function appendTransition(message: string): void {
  transitionLog.value = [...transitionLog.value, message]
}

/** 追加一条独立 router 的导航记录。 */
function appendNavigation(message: string): void {
  navigationLog.value = [...navigationLog.value, message]
}

/** 从路由组件根元素读取稳定的实例标签。 */
function getViewInstanceLabel(element: Element): string {
  if (!(element instanceof HTMLElement)) return 'unknown'
  return element.dataset.viewInstance ?? 'unknown'
}

/** 创建只接受当前 generation 事件的 transition hook。 */
function createTransitionHandler(generationId: number, stage: TransitionStage) {
  return (element: Element): void => {
    if (generation.value !== generationId) return
    appendTransition(`${stage}:${getViewInstanceLabel(element)}`)
  }
}

/** 同步独立 router 与宿主页面的可见路径。 */
async function syncPaths(router: Router): Promise<void> {
  await nextTick()
  const route = router.currentRoute.value
  currentPath.value = route.fullPath
  matchedNames.value = route.matched
    .map((record) => String(record.name ?? record.path))
    .join(' -> ')
  currentParams.value = Object.keys(route.params).length > 0 ? JSON.stringify(route.params) : '无'
  currentQuery.value = Object.keys(route.query).length > 0 ? JSON.stringify(route.query) : '无'
  hostPath.value = `${window.location.pathname}${window.location.search}${window.location.hash}`
}

/** 创建带内部状态和完整缓存生命周期诊断的路由组件。 */
function createTrackedRoute(viewKind: ViewKind, title: string) {
  return defineComponent({
    name: `${title.replaceAll(' ', '')}Route`,
    props: {
      displayPath: { type: String, required: true },
    },
    /** 建立当前实例的内部计数与生命周期观察。 */
    setup(props) {
      const instanceId = ++instanceSerial
      const instanceLabel = `${viewKind}#${instanceId}`
      const count = ref(0)
      const active = ref(false)

      /** 把当前活动实例快照发布到实验状态区。 */
      function publishActiveSnapshot(): void {
        activeComponent.value = viewKind
        activeInstanceId.value = String(instanceId)
        activeCount.value = count.value
      }

      /** 增加当前实例的局部计数并发布新快照。 */
      function incrementCount(): void {
        count.value += 1
        publishActiveSnapshot()
      }

      watch(
        () => props.displayPath,
        () => {
          if (active.value) publishActiveSnapshot()
        },
      )

      onMounted(() => {
        active.value = true
        appendLifecycle(`mounted:${instanceLabel}:${props.displayPath}`)
        publishActiveSnapshot()
      })

      onActivated(() => {
        active.value = true
        appendLifecycle(`activated:${instanceLabel}:${props.displayPath}`)
        publishActiveSnapshot()
      })

      onDeactivated(() => {
        active.value = false
        appendLifecycle(`deactivated:${instanceLabel}:${props.displayPath}`)
      })

      onUnmounted(() => {
        active.value = false
        appendLifecycle(`unmounted:${instanceLabel}:${props.displayPath}`)
      })

      return () =>
        h(
          'section',
          {
            class: 'route-view-card',
            'data-testid': 'route-view-card',
            'data-view-instance': instanceLabel,
          },
          [
            h('p', { class: 'route-kicker' }, viewKind),
            h('h4', title),
            h('p', [
              'route：',
              h('strong', { 'data-testid': 'route-card-path' }, props.displayPath),
            ]),
            h('p', [
              'instance ID：',
              h('strong', { 'data-testid': 'route-card-instance' }, String(instanceId)),
            ]),
            h('p', [
              '内部 count：',
              h('strong', { 'data-testid': 'route-card-count' }, String(count.value)),
            ]),
            h(
              'button',
              {
                type: 'button',
                onClick: incrementCount,
              },
              '增加当前实例计数',
            ),
          ],
        )
    },
  })
}

const WorkspaceRoute = createTrackedRoute('workspace', 'Workspace 视图')
const ReviewRoute = createTrackedRoute('review', 'Review 视图')

/** 为每个 generation 创建固定的两条 memory-router 记录。 */
function createRoutes(): RouteRecordRaw[] {
  return [
    {
      path: '/workspace/:id',
      name: 'workspace',
      component: WorkspaceRoute,
      props: (route) => ({ displayPath: route.fullPath }),
    },
    {
      path: '/review',
      name: 'review',
      component: ReviewRoute,
      props: (route) => ({ displayPath: route.fullPath }),
    },
  ]
}

/** 直接消费 slot VNode，仅在 path key 模式为它建立 pathname 身份。 */
function resolveRouteVNode(Component: VNode, route: RouteLocationNormalizedLoaded): VNode {
  return pathKeyEnabled.value ? cloneVNode(Component, { key: route.path }) : Component
}

/** 按 Transition、KeepAlive、route component 的顺序组合当前视图。 */
function renderRouterViewSlot({ Component, route }: RouterViewSlotState): VNode | null {
  if (!Component) return null
  const routeComponent = Component

  /** 返回当前 slot route 对应的组件 VNode。 */
  function renderRouteVNode(): VNode {
    return resolveRouteVNode(routeComponent, route)
  }

  /** 按当前配置创建直接包裹 route component 的缓存层。 */
  function renderCachedVNode(): VNode {
    if (!keepAliveEnabled.value) return renderRouteVNode()
    return h(KeepAlive, null, [renderRouteVNode()])
  }

  if (!transitionEnabled.value) return renderCachedVNode()

  const generationId = generation.value
  return h(
    Transition,
    {
      name: 'route-fade',
      mode: 'out-in',
      onBeforeEnter: createTransitionHandler(generationId, 'before-enter'),
      onAfterEnter: createTransitionHandler(generationId, 'after-enter'),
      onBeforeLeave: createTransitionHandler(generationId, 'before-leave'),
      onAfterLeave: createTransitionHandler(generationId, 'after-leave'),
    },
    { default: () => [renderCachedVNode()] },
  )
}

const MiniAppRoot = defineComponent({
  name: 'RouterViewTransitionsMiniApp',
  /** 渲染独立导航控件与使用 scoped slot 的 RouterView。 */
  setup() {
    const router = useRouter()

    /** 发起一次真实导航，并把 Promise 结算与视觉过渡分开记录。 */
    async function navigate(target: string): Promise<void> {
      if (busy.value || router.currentRoute.value.fullPath === target) return

      busy.value = true
      navigationOutcome.value = `pending -> ${target}`
      appendNavigation(`pending:${target}`)
      try {
        const failure = await router.push(target)
        navigationOutcome.value = failure ? `failure -> ${target}` : `success -> ${target}`
        appendNavigation(failure ? `failure:${target}` : `success:${target}`)
        await syncPaths(router)
      } finally {
        busy.value = false
      }
    }

    return () =>
      h('div', { class: 'mini-app-root' }, [
        h('div', { class: 'route-actions', 'aria-label': '独立路由导航' }, [
          h(
            'button',
            {
              type: 'button',
              disabled: router.currentRoute.value.fullPath === '/workspace/alpha',
              onClick: () => navigate('/workspace/alpha'),
            },
            '前往 Workspace alpha',
          ),
          h(
            'button',
            {
              type: 'button',
              disabled: router.currentRoute.value.fullPath === '/workspace/beta',
              onClick: () => navigate('/workspace/beta'),
            },
            '前往 Workspace beta',
          ),
          h(
            'button',
            {
              type: 'button',
              disabled: router.currentRoute.value.fullPath === '/review',
              onClick: () => navigate('/review'),
            },
            '前往 Review',
          ),
        ]),
        h(
          RouterView,
          { route: router.currentRoute.value },
          {
            default: (slotState: RouterViewSlotState) => renderRouterViewSlot(slotState),
          },
        ),
      ])
  },
})

/** 卸载旧 mini-app，并按当前三个结构配置创建全新 generation。 */
async function initializeDemo(): Promise<void> {
  if (!miniAppHost.value) return

  ready.value = false
  miniAppMounted.value = false
  miniApp?.unmount()

  generation.value += 1
  currentPath.value = '尚未初始化'
  hostPath.value = '等待挂载'
  matchedNames.value = '无'
  currentParams.value = '无'
  currentQuery.value = '无'
  activeComponent.value = '无'
  activeInstanceId.value = '无'
  activeCount.value = 0
  navigationOutcome.value = '尚未执行'
  initialTransitionCount.value = 0
  lifecycleLog.value = []
  transitionLog.value = []
  navigationLog.value = []
  busy.value = false
  readyBeforeMount.value = false

  const router = createRouter({ history: createMemoryHistory(), routes: createRoutes() })
  await router.push('/workspace/alpha')
  await router.isReady()
  readyBeforeMount.value = true
  await syncPaths(router)
  appendNavigation('initial-ready:/workspace/alpha')

  miniApp = createApp(MiniAppRoot)
  miniApp.use(router)
  miniApp.mount(miniAppHost.value)
  miniAppMounted.value = true
  await nextTick()
  initialTransitionCount.value = transitionLog.value.length
  ready.value = true
}

/** 在课程页挂载后创建第一代 RouterView 实验。 */
onMounted(() => {
  void initializeDemo()
})

/** 离开课程时卸载独立 mini-app 与 memory router。 */
onBeforeUnmount(() => {
  miniApp?.unmount()
})
</script>

<template>
  <section class="router-view-transitions-lab" aria-label="RouterView 过渡与缓存实验">
    <div class="lab-copy">
      <p class="eyebrow">memory router + RouterView slot</p>
      <h3>同一条路由，三种不同的实例结局</h3>
      <p>每次配置变化都会重建实验；导航、生命周期与过渡事件分别记录。</p>
    </div>

    <fieldset class="config-controls" :disabled="!ready || busy">
      <legend>实例与过渡配置</legend>
      <label>
        <input v-model="keepAliveEnabled" type="checkbox" @change="initializeDemo" />
        启用 KeepAlive
      </label>
      <label>
        <input v-model="pathKeyEnabled" type="checkbox" @change="initializeDemo" />
        使用 route.path key
      </label>
      <label>
        <input v-model="transitionEnabled" type="checkbox" @change="initializeDemo" />
        启用 route transition
      </label>
    </fieldset>

    <div ref="miniAppHost" class="mini-app-host" />

    <button class="reset-button" type="button" :disabled="!ready || busy" @click="initializeDemo">
      重置实验
    </button>

    <div class="state-strip">
      <p>
        <span>generation</span><strong data-testid="transition-generation">{{ generation }}</strong>
      </p>
      <p>
        <span>宿主路径</span><strong data-testid="transition-host-path">{{ hostPath }}</strong>
      </p>
      <p>
        <span>current route</span
        ><strong data-testid="transition-current-path">{{ currentPath }}</strong>
      </p>
      <p>
        <span>matched names</span
        ><strong data-testid="transition-matched-names">{{ matchedNames }}</strong>
      </p>
      <p>
        <span>params</span><strong data-testid="transition-params">{{ currentParams }}</strong>
      </p>
      <p>
        <span>query</span><strong data-testid="transition-query">{{ currentQuery }}</strong>
      </p>
      <p>
        <span>ready</span><strong data-testid="transition-ready">{{ ready }}</strong>
      </p>
      <p>
        <span>ready before mount</span>
        <strong data-testid="transition-ready-before-mount">{{ readyBeforeMount }}</strong>
      </p>
      <p>
        <span>mini-app mounted</span
        ><strong data-testid="transition-mounted">{{ miniAppMounted }}</strong>
      </p>
      <p>
        <span>KeepAlive</span
        ><strong data-testid="transition-keep-alive">{{ keepAliveEnabled }}</strong>
      </p>
      <p>
        <span>key</span
        ><strong data-testid="transition-key-mode">{{
          pathKeyEnabled ? 'route.path' : 'none'
        }}</strong>
      </p>
      <p>
        <span>transition</span
        ><strong data-testid="transition-enabled">{{ transitionEnabled }}</strong>
      </p>
      <p>
        <span>active component</span
        ><strong data-testid="transition-active-component">{{ activeComponent }}</strong>
      </p>
      <p>
        <span>instance ID</span
        ><strong data-testid="transition-instance-id">{{ activeInstanceId }}</strong>
      </p>
      <p>
        <span>active count</span><strong data-testid="transition-count">{{ activeCount }}</strong>
      </p>
      <p>
        <span>navigation outcome</span>
        <strong data-testid="transition-navigation-outcome">{{ navigationOutcome }}</strong>
      </p>
      <p>
        <span>initial transition count</span>
        <strong data-testid="transition-initial-count">{{ initialTransitionCount }}</strong>
      </p>
      <p>
        <span>transition event count</span>
        <strong data-testid="transition-event-count">{{ transitionLog.length }}</strong>
      </p>
    </div>

    <p class="status-summary" role="status" data-testid="transition-status">
      {{ currentPath }}；{{ activeComponent }} #{{ activeInstanceId }}；count {{ activeCount }}；{{
        navigationOutcome
      }}
    </p>

    <div class="timeline-columns">
      <section aria-labelledby="navigation-log-heading">
        <h4 id="navigation-log-heading">导航结算</h4>
        <ol data-testid="transition-navigation-log">
          <li v-for="(event, index) in navigationLog" :key="`${index}-${event}`">{{ event }}</li>
        </ol>
      </section>
      <section aria-labelledby="lifecycle-log-heading">
        <h4 id="lifecycle-log-heading">组件生命周期</h4>
        <ol data-testid="transition-lifecycle-log">
          <li v-for="(event, index) in lifecycleLog" :key="`${index}-${event}`">{{ event }}</li>
        </ol>
      </section>
      <section aria-labelledby="transition-log-heading">
        <h4 id="transition-log-heading">Transition hooks</h4>
        <ol data-testid="transition-hook-log">
          <li v-if="transitionLog.length === 0">暂无事件</li>
          <li v-for="(event, index) in transitionLog" :key="`${index}-${event}`">{{ event }}</li>
        </ol>
      </section>
    </div>
  </section>
</template>

<style scoped>
.router-view-transitions-lab {
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-primary);
}

.lab-copy h3,
.lab-copy p,
.state-strip p,
.status-summary,
.timeline-columns h4 {
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

.config-controls {
  display: flex;
  flex-wrap: wrap;
  padding: var(--space-3);
  margin: var(--space-4) 0 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.config-controls legend {
  padding: 0 var(--space-1);
  font-weight: 700;
}

.config-controls label {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  margin: 0 var(--space-4) var(--space-2) 0;
  overflow-wrap: anywhere;
}

.config-controls input {
  width: 18px;
  height: 18px;
  margin: 0 var(--space-2) 0 0;
  accent-color: var(--color-accent);
}

.mini-app-host {
  margin-top: var(--space-3);
}

.mini-app-host :deep(.route-actions),
.state-strip,
.timeline-columns {
  display: flex;
  flex-wrap: wrap;
  margin-right: calc(var(--space-2) * -1);
}

.mini-app-host :deep(.route-actions button),
.mini-app-host :deep(.route-view-card button),
.reset-button {
  min-height: 44px;
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
  transform: scale(0.98);
}

.mini-app-host :deep(button:focus-visible),
.reset-button:focus-visible,
.config-controls input:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
}

.mini-app-host :deep(.route-view-card) {
  padding: var(--space-3);
  margin-top: var(--space-2);
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-accent);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
  transition:
    opacity 140ms ease,
    transform 140ms ease;
}

.mini-app-host :deep(.route-view-card > *) {
  margin: 0;
  overflow-wrap: anywhere;
}

.mini-app-host :deep(.route-view-card > * + *) {
  margin-top: var(--space-2);
}

.mini-app-host :deep(.route-fade-enter-from),
.mini-app-host :deep(.route-fade-leave-to) {
  opacity: 0;
  transform: translateY(6px);
}

.reset-button {
  margin-top: var(--space-3);
}

.state-strip {
  margin-top: var(--space-3);
}

.state-strip p {
  min-width: 170px;
  flex: 1 1 170px;
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

.state-strip strong,
.status-summary,
.timeline-columns li {
  overflow-wrap: anywhere;
}

.status-summary {
  padding: var(--space-3);
  border-left: 3px solid var(--color-success);
  background: var(--color-bg-elevated);
}

.timeline-columns {
  margin-top: var(--space-3);
}

.timeline-columns section {
  min-width: 210px;
  flex: 1 1 210px;
  padding: var(--space-3);
  margin: 0 var(--space-2) var(--space-2) 0;
  border-top: 1px solid var(--color-border);
}

.timeline-columns ol {
  padding-left: var(--space-4);
  margin: var(--space-2) 0 0;
}

.timeline-columns li + li {
  margin-top: var(--space-1);
}

@media (max-width: 640px) {
  .router-view-transitions-lab {
    padding: var(--space-3);
  }

  .config-controls,
  .config-controls label {
    display: block;
  }

  .config-controls label {
    box-sizing: border-box;
    width: 100%;
    padding: var(--space-2) 0;
    margin-right: 0;
  }

  .mini-app-host :deep(.route-actions button),
  .mini-app-host :deep(.route-view-card button),
  .reset-button,
  .state-strip p,
  .timeline-columns section {
    box-sizing: border-box;
    width: calc(100% - var(--space-2));
    flex-basis: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .mini-app-host :deep(.route-view-card),
  .mini-app-host :deep(button),
  .reset-button {
    transition: none;
  }

  .mini-app-host :deep(.route-fade-enter-from),
  .mini-app-host :deep(.route-fade-leave-to) {
    transform: none;
  }
}
</style>
