<script setup lang="ts">
import { createApp, defineComponent, h, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import type { App } from 'vue'
import {
  NavigationFailureType,
  RouterView,
  createMemoryHistory,
  createRouter,
  isNavigationFailure,
  useRouter,
} from 'vue-router'
import type { NavigationFailure, Router, RouteRecordRaw } from 'vue-router'

type CommandName = 'success' | 'aborted' | 'duplicated' | 'cancelled'

interface DeferredSignal {
  promise: Promise<void>
  resolve: () => void
}

const miniAppHost = ref<HTMLElement | null>(null)
const ready = ref(false)
const busy = ref(false)
const currentPath = ref('尚未初始化')
const hostPath = ref('等待挂载')
const command = ref('尚未执行')
const promiseOutcome = ref('尚未执行')
const failureCheck = ref('false')
const failureType = ref('none')
const failureTo = ref('不适用')
const failureFrom = ref('不适用')
const combinedCheck = ref('false')
const eventLog = ref<string[]>([])

let miniApp: App<Element> | undefined
let slowGate = createDeferredSignal()
let slowGuardReached = createDeferredSignal()

/** 创建一个由实验命令手动结算的 Promise 信号。 */
function createDeferredSignal(): DeferredSignal {
  let settle!: () => void
  const promise = new Promise<void>((resolve) => {
    settle = resolve
  })
  let settled = false

  return {
    promise,
    resolve: () => {
      if (settled) return
      settled = true
      settle()
    },
  }
}

/** 向确定性事件时间线追加一条记录。 */
function appendEvent(message: string): void {
  eventLog.value = [...eventLog.value, message]
}

/** 把导航失败类型转换为课程使用的稳定标签。 */
function getFailureLabel(failure: NavigationFailure | void): string {
  if (!failure) return 'success'
  if (isNavigationFailure(failure, NavigationFailureType.aborted)) return 'aborted'
  if (isNavigationFailure(failure, NavigationFailureType.cancelled)) return 'cancelled'
  if (isNavigationFailure(failure, NavigationFailureType.duplicated)) return 'duplicated'
  return 'unknown'
}

/** 同步独立 router 的已提交位置与宿主课程地址。 */
async function syncVisibleState(router: Router): Promise<void> {
  await nextTick()
  currentPath.value = router.currentRoute.value.fullPath
  hostPath.value = `${window.location.pathname}${window.location.search}${window.location.hash}`
}

/** 将一次真实 push 的结算值写入结果面板。 */
async function publishResult(
  commandName: CommandName,
  failure: NavigationFailure | void,
  router: Router,
): Promise<void> {
  const label = getFailureLabel(failure)
  const isFailure = isNavigationFailure(failure)
  command.value = commandName
  promiseOutcome.value = failure ? 'NavigationFailure' : 'undefined (success)'
  failureCheck.value = String(isFailure)
  failureType.value = failure ? `${label} (${failure.type})` : 'none'
  failureTo.value = failure?.to.fullPath ?? '不适用'
  failureFrom.value = failure?.from.fullPath ?? '不适用'
  combinedCheck.value = String(
    isNavigationFailure(failure, NavigationFailureType.aborted | NavigationFailureType.cancelled),
  )
  appendEvent(`promise ${commandName}: ${label}`)
  await syncVisibleState(router)
}

/** 渲染一个用于确认已提交位置的轻量路由组件。 */
function createRoutePage(title: string, marker: string) {
  return defineComponent({
    name: `NavigationFailure${marker}Page`,
    /** 渲染当前独立 RouterView 的位置。 */
    setup() {
      return () =>
        h('section', { class: 'route-card', 'data-testid': 'failure-route-view' }, [
          h('p', { class: 'route-kicker' }, marker),
          h('h4', title),
          h('p', '只有导航成功提交后，这里的 RouterView 才会切换。'),
        ])
    },
  })
}

const routes: RouteRecordRaw[] = [
  { path: '/home', component: createRoutePage('导航实验起点', 'home') },
  { path: '/open', component: createRoutePage('普通导航已提交', 'open') },
  { path: '/blocked', component: createRoutePage('不应被渲染', 'blocked') },
  { path: '/slow', component: createRoutePage('旧慢导航', 'slow') },
  { path: '/fast-a', component: createRoutePage('更新导航 A 已提交', 'fast-a') },
  { path: '/fast-b', component: createRoutePage('更新导航 B 已提交', 'fast-b') },
]

/** 执行普通成功导航并发布 undefined 结果。 */
async function runSuccess(router: Router): Promise<void> {
  const target = router.currentRoute.value.path === '/open' ? '/home' : '/open'
  appendEvent(`command success -> ${target}`)
  const failure = await router.push(target)
  await publishResult('success', failure, router)
}

/** 执行被 beforeEach 返回 false 阻止的导航。 */
async function runAborted(router: Router): Promise<void> {
  appendEvent('command aborted -> /blocked')
  const failure = await router.push('/blocked')
  await publishResult('aborted', failure, router)
}

/** 对当前位置再次 push，生成 duplicated 结果。 */
async function runDuplicated(router: Router): Promise<void> {
  const target = router.currentRoute.value.fullPath
  appendEvent(`command duplicated -> ${target}`)
  const failure = await router.push(target)
  await publishResult('duplicated', failure, router)
}

/** 用 deferred guard 冻结旧导航，再用更新导航生成 cancelled。 */
async function runCancelled(router: Router): Promise<void> {
  slowGate = createDeferredSignal()
  slowGuardReached = createDeferredSignal()
  appendEvent('command cancelled -> /slow')
  const slowNavigation = router.push('/slow')
  await slowGuardReached.promise

  const fastTarget = router.currentRoute.value.path === '/fast-a' ? '/fast-b' : '/fast-a'
  appendEvent(`fast navigation start -> ${fastTarget}`)
  await router.push(fastTarget)
  appendEvent(`fast navigation committed -> ${fastTarget}`)
  appendEvent('old guard release')
  slowGate.resolve()

  const failure = await slowNavigation
  await publishResult('cancelled', failure, router)
}

/** 执行选中的导航命令，并在结算后恢复按钮状态。 */
async function executeCommand(commandName: CommandName, router: Router): Promise<void> {
  if (busy.value) return
  busy.value = true
  try {
    if (commandName === 'success') await runSuccess(router)
    if (commandName === 'aborted') await runAborted(router)
    if (commandName === 'duplicated') await runDuplicated(router)
    if (commandName === 'cancelled') await runCancelled(router)
  } finally {
    busy.value = false
  }
}

const MiniAppRoot = defineComponent({
  name: 'NavigationFailuresMiniApp',
  /** 渲染四个导航命令与独立 RouterView。 */
  setup() {
    const router = useRouter()

    return () =>
      h('div', { class: 'mini-app-root' }, [
        h('div', { class: 'command-actions', 'aria-label': '导航结果命令' }, [
          h(
            'button',
            {
              type: 'button',
              disabled: busy.value,
              onClick: () => executeCommand('success', router),
            },
            '执行成功导航',
          ),
          h(
            'button',
            {
              type: 'button',
              disabled: busy.value,
              onClick: () => executeCommand('aborted', router),
            },
            '执行守卫阻止',
          ),
          h(
            'button',
            {
              type: 'button',
              disabled: busy.value,
              onClick: () => executeCommand('duplicated', router),
            },
            '执行重复导航',
          ),
          h(
            'button',
            {
              type: 'button',
              disabled: busy.value,
              onClick: () => executeCommand('cancelled', router),
            },
            '执行竞态取消',
          ),
        ]),
        h(RouterView),
      ])
  },
})

/** 清空结果状态并建立新的独立 memory router。 */
async function initializeDemo(): Promise<void> {
  if (!miniAppHost.value) return

  ready.value = false
  miniApp?.unmount()
  currentPath.value = '尚未初始化'
  hostPath.value = '等待挂载'
  command.value = '尚未执行'
  promiseOutcome.value = '尚未执行'
  failureCheck.value = 'false'
  failureType.value = 'none'
  failureTo.value = '不适用'
  failureFrom.value = '不适用'
  combinedCheck.value = 'false'
  eventLog.value = []
  busy.value = false
  slowGate = createDeferredSignal()
  slowGuardReached = createDeferredSignal()

  const router = createRouter({ history: createMemoryHistory(), routes })
  router.beforeEach(async (to) => {
    if (to.path === '/blocked') {
      appendEvent('guard /blocked -> false')
      return false
    }
    if (to.path === '/slow') {
      appendEvent('guard /slow waiting')
      slowGuardReached.resolve()
      await slowGate.promise
      appendEvent('guard /slow resumed')
    }
  })
  await router.replace('/home')
  await router.isReady()
  router.afterEach((to, from, failure) => {
    appendEvent(`afterEach ${from.fullPath} -> ${to.fullPath}: ${getFailureLabel(failure)}`)
    void syncVisibleState(router)
  })

  miniApp = createApp(MiniAppRoot)
  miniApp.use(router)
  miniApp.mount(miniAppHost.value)
  await syncVisibleState(router)
  ready.value = true
}

/** 在课程页挂载后初始化导航失败实验。 */
onMounted(() => {
  void initializeDemo()
})

/** 离开课程时卸载独立 mini-app。 */
onBeforeUnmount(() => {
  slowGate.resolve()
  miniApp?.unmount()
})
</script>

<template>
  <section class="navigation-failures-lab" aria-label="导航失败实验">
    <div class="lab-copy">
      <p class="eyebrow">memory router + real navigation outcomes</p>
      <h3>同一个 push Promise，不同的结算值</h3>
      <p>四个命令都由真实 Router 产生结果；事件文本不依赖计时器。</p>
    </div>

    <div ref="miniAppHost" class="mini-app-host" />

    <button class="reset-button" type="button" :disabled="!ready || busy" @click="initializeDemo">
      重置实验
    </button>

    <div class="result-strip" aria-live="polite">
      <p>
        <span>command</span>
        <strong data-testid="failure-command">{{ command }}</strong>
      </p>
      <p>
        <span>Promise outcome</span>
        <strong data-testid="failure-promise-outcome">{{ promiseOutcome }}</strong>
      </p>
      <p>
        <span>isNavigationFailure</span>
        <strong data-testid="failure-check">{{ failureCheck }}</strong>
      </p>
      <p>
        <span>type</span>
        <strong data-testid="failure-type">{{ failureType }}</strong>
      </p>
      <p>
        <span>to</span>
        <strong data-testid="failure-to">{{ failureTo }}</strong>
      </p>
      <p>
        <span>from</span>
        <strong data-testid="failure-from">{{ failureFrom }}</strong>
      </p>
      <p>
        <span>aborted | cancelled</span>
        <strong data-testid="failure-combined-check">{{ combinedCheck }}</strong>
      </p>
      <p>
        <span>current route</span>
        <strong data-testid="failure-current-path">{{ currentPath }}</strong>
      </p>
      <p>
        <span>宿主路径</span>
        <strong data-testid="failure-host-path">{{ hostPath }}</strong>
      </p>
    </div>

    <h4 class="event-heading">Promise 与 afterEach 时间线</h4>
    <ol class="event-log" data-testid="failure-event-log">
      <li v-for="(event, index) in eventLog" :key="`${index}-${event}`">{{ event }}</li>
    </ol>
  </section>
</template>

<style scoped>
.navigation-failures-lab {
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-primary);
}

.lab-copy h3,
.lab-copy p,
.result-strip p,
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

.mini-app-host :deep(.command-actions),
.result-strip {
  display: flex;
  flex-wrap: wrap;
  margin-right: calc(var(--space-2) * -1);
}

.mini-app-host :deep(.command-actions button),
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

.mini-app-host :deep(.route-card),
.result-strip p {
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
.result-strip {
  margin-top: var(--space-3);
}

.result-strip p {
  min-width: 170px;
  flex: 1 1 170px;
  margin: 0 var(--space-2) var(--space-2) 0;
}

.result-strip span {
  display: block;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.result-strip strong {
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
  .navigation-failures-lab {
    padding: var(--space-3);
  }

  .mini-app-host :deep(.command-actions button),
  .reset-button,
  .result-strip p {
    box-sizing: border-box;
    width: calc(100% - var(--space-2));
    flex-basis: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .mini-app-host :deep(.command-actions button),
  .reset-button {
    transition: none;
  }
}
</style>
