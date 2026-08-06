<script setup lang="ts">
import { createApp, defineComponent, h, onBeforeUnmount, onMounted, ref, type App } from 'vue'
import { createPinia, defineStore, disposePinia } from 'pinia'
import { preserveActivePinia } from '../preserve-active-pinia'

type GateOutcome = { type: 'resolve'; value: string } | { type: 'reject'; message: string }

let releaseGate: ((outcome: GateOutcome) => void) | undefined

/** 创建只由界面按钮结算的确定性 Promise。 */
function waitForGate(): Promise<GateOutcome> {
  return new Promise((resolve) => {
    releaseGate = resolve
  })
}

const useSubscriptionStore = defineStore('pinia-p03-subscription-lifecycle', {
  /** 创建订阅实验的单一数值 state。 */
  state: () => ({ count: 0 }),
  actions: {
    /** 同步返回供 after 观察的结果。 */
    succeed(label: string): string {
      return `saved:${label}`
    },
    /** 同步抛出供 onError 与调用方共同观察的错误。 */
    fail(): never {
      throw new Error('sync failure')
    },
    /** 等待手动 Gate，并按选择 resolve 或 reject。 */
    async deferred(label: string): Promise<string> {
      const outcome = await waitForGate()
      releaseGate = undefined
      if (outcome.type === 'reject') throw new Error(outcome.message)
      return `${outcome.value}:${label}`
    },
  },
})

const pinia = createPinia()
const store = preserveActivePinia(() => useSubscriptionStore(pinia))
const observerHost = ref<HTMLElement>()
const componentStatus = ref('等待挂载')
const scopedStateCount = ref(0)
const detachedStateCount = ref(0)
const scopedActionCount = ref(0)
const detachedActionCount = ref(0)
const syncCount = ref(0)
const preCount = ref(0)
const postCount = ref(0)
const lastMutation = ref('尚无 mutation')
const lastPayload = ref('无')
const directTiming = ref('尚未执行 direct')
const patchTiming = ref('尚未执行 patch')
const lastAction = ref('尚无 action')
const callerResult = ref('尚未调用')
const timeline = ref<string[]>([])
const detachedStops: Array<() => void> = []
let observerApp: App<Element> | undefined
let requestNumber = 0
let active = true

/** 追加最近十二条确定性订阅事件。 */
function appendEvent(message: string): void {
  if (!active) return
  timeline.value = [...timeline.value, message].slice(-12)
}

/** 记录稳定 mutation 字段，并仅为 patch object 展示 payload。 */
function recordMutation(mutation: {
  type: string
  storeId: string
  payload?: Record<string, unknown>
}): void {
  lastMutation.value = `${mutation.type} · ${mutation.storeId}`
  lastPayload.value = 'payload' in mutation ? JSON.stringify(mutation.payload) : '无'
  appendEvent(`state：${mutation.type}`)
}

const SubscriptionObserver = defineComponent({
  name: 'PiniaSubscriptionObserver',
  /** 在真实 mini-app scope 中注册 scoped 与 detached 订阅。 */
  setup() {
    const scopedStore = useSubscriptionStore()

    scopedStore.$subscribe(
      () => {
        scopedStateCount.value++
      },
      { flush: 'sync' },
    )

    detachedStops.push(
      scopedStore.$subscribe(
        (mutation) => {
          detachedStateCount.value++
          recordMutation(mutation)
        },
        { detached: true, flush: 'sync' },
      ),
      scopedStore.$subscribe(
        () => {
          syncCount.value++
        },
        { detached: true, flush: 'sync' },
      ),
      scopedStore.$subscribe(
        () => {
          preCount.value++
        },
        { detached: true, flush: 'pre' },
      ),
      scopedStore.$subscribe(
        () => {
          postCount.value++
        },
        { detached: true, flush: 'post' },
      ),
    )

    scopedStore.$onAction(({ name, args, after, onError }) => {
      scopedActionCount.value++
      lastAction.value = `before:${name}(${args.map(String).join(', ')})`
      after((result) => {
        lastAction.value = `after:${name} -> ${String(result)}`
        appendEvent(lastAction.value)
      })
      onError((error) => {
        const message = error instanceof Error ? error.message : String(error)
        lastAction.value = `onError:${name} -> ${message}`
        appendEvent(lastAction.value)
      })
    })

    detachedStops.push(
      scopedStore.$onAction(({ name, args, after, onError }) => {
        detachedActionCount.value++
        lastAction.value = `before:${name}(${args.map(String).join(', ')})`
        after((result) => {
          lastAction.value = `after:${name} -> ${String(result)}`
        })
        onError((error) => {
          const message = error instanceof Error ? error.message : String(error)
          lastAction.value = `onError:${name} -> ${message}`
        })
      }, true),
    )

    componentStatus.value = '已挂载'

    /** 渲染 mini-app 的 scope 标记。 */
    function renderObserver() {
      return h('p', { class: 'observer-marker' }, '订阅组件 scope 正在运行')
    }

    return renderObserver
  },
})

/** 对 state 做一次 direct mutation，并保存回调的同步快照。 */
function mutateDirect(): void {
  preserveActivePinia(() => {
    store.count++
  })
  directTiming.value = `sync=${syncCount.value}, pre=${preCount.value}, post=${postCount.value}`
}

/** 使用 patch object 设置确定值，并保存同步聚合快照。 */
function patchObject(): void {
  preserveActivePinia(() => store.$patch({ count: 5 }))
  patchTiming.value = `sync=${syncCount.value}, pre=${preCount.value}, post=${postCount.value}`
}

/** 使用 patch function 完成两次写入并观察一次通知。 */
function patchFunction(): void {
  preserveActivePinia(() =>
    store.$patch((state) => {
      state.count++
      state.count++
    }),
  )
  patchTiming.value = `sync=${syncCount.value}, pre=${preCount.value}, post=${postCount.value}`
}

/** 调用同步成功 action，并记录调用方返回值。 */
function runSuccess(): void {
  callerResult.value = preserveActivePinia(() => store.succeed('draft'))
}

/** 调用同步失败 action，并证明错误仍传播给调用方。 */
function runFailure(): void {
  try {
    preserveActivePinia(() => store.fail())
  } catch (error) {
    callerResult.value = `caught:${error instanceof Error ? error.message : String(error)}`
  }
}

/** 启动等待手动 Gate 的异步 action。 */
function startDeferred(): void {
  if (releaseGate) return
  requestNumber++
  const label = `request-${requestNumber}`
  callerResult.value = `pending:${label}`
  void preserveActivePinia(() => store.deferred(label))
    .then((result) => {
      if (active) callerResult.value = result
    })
    .catch((error: unknown) => {
      if (!active) return
      callerResult.value = `rejected:${error instanceof Error ? error.message : String(error)}`
    })
}

/** 让当前异步 action 成功 resolve。 */
function resolveDeferred(): void {
  releaseGate?.({ type: 'resolve', value: 'resolved' })
}

/** 让当前异步 action 以 rejection 结束。 */
function rejectDeferred(): void {
  releaseGate?.({ type: 'reject', message: `async failure ${requestNumber}` })
}

/** 卸载 mini-app，使默认 scoped 订阅随 scope 清理。 */
function unmountObserver(): void {
  if (!observerApp) return
  preserveActivePinia(() => observerApp?.unmount())
  observerApp = undefined
  componentStatus.value = '已卸载'
}

/** 在 mini-app 卸载后触发一次 direct mutation。 */
function mutateAfterUnmount(): void {
  preserveActivePinia(() => {
    store.count++
  })
}

/** 在 mini-app 卸载后调用一次 action。 */
function actionAfterUnmount(): void {
  callerResult.value = preserveActivePinia(() => store.succeed('after-unmount'))
}

/** 显式停止所有 detached state/action/flush 订阅。 */
function stopDetachedSubscriptions(): void {
  for (const stop of detachedStops.splice(0)) stop()
  componentStatus.value = '已卸载；detached 已停止'
}

/** 在 stop 后同时执行 mutation 与 action，供计数保持断言。 */
function continueAfterStop(): void {
  preserveActivePinia(() => {
    store.count++
    store.succeed('after-stop')
  })
  callerResult.value = '停止后操作完成'
}

onMounted(() => {
  if (!observerHost.value) return
  preserveActivePinia(() => {
    observerApp = createApp(SubscriptionObserver)
    observerApp.use(pinia)
    observerApp.mount(observerHost.value!)
  })
})

onBeforeUnmount(() => {
  active = false
  releaseGate?.({ type: 'reject', message: 'demo unmounted' })
  releaseGate = undefined
  unmountObserver()
  for (const stop of detachedStops.splice(0)) stop()
  preserveActivePinia(() => disposePinia(pinia))
})
</script>

<template>
  <article class="pinia-demo" aria-label="订阅生命周期实验">
    <header class="demo-header">
      <p class="eyebrow">L09 · 状态与 Action 订阅</p>
      <h3>比较 mutation、hook 与订阅寿命</h3>
      <p>所有事件来自独立 Pinia 和 mini-app，不使用网络、随机值或墙钟。</p>
    </header>

    <div ref="observerHost" class="observer-host" aria-live="polite"></div>

    <section class="metrics" aria-label="订阅计数">
      <div>
        <span>scoped state</span>
        <strong data-testid="subscription-scoped-state">{{ scopedStateCount }}</strong>
      </div>
      <div>
        <span>detached state</span>
        <strong data-testid="subscription-detached-state">{{ detachedStateCount }}</strong>
      </div>
      <div>
        <span>scoped action</span>
        <strong data-testid="subscription-scoped-action">{{ scopedActionCount }}</strong>
      </div>
      <div>
        <span>detached action</span>
        <strong data-testid="subscription-detached-action">{{ detachedActionCount }}</strong>
      </div>
    </section>

    <section class="result-panel" aria-label="最近订阅结果">
      <p data-testid="subscription-component-status">组件：{{ componentStatus }}</p>
      <p data-testid="subscription-mutation">mutation：{{ lastMutation }}</p>
      <p data-testid="subscription-payload">payload：{{ lastPayload }}</p>
      <p data-testid="subscription-direct-timing">direct 同步快照：{{ directTiming }}</p>
      <p data-testid="subscription-patch-timing">patch 同步快照：{{ patchTiming }}</p>
      <p data-testid="subscription-flush-counts">
        flush 当前计数：sync={{ syncCount }}, pre={{ preCount }}, post={{ postCount }}
      </p>
      <p data-testid="subscription-action">action：{{ lastAction }}</p>
      <p data-testid="subscription-caller">调用方：{{ callerResult }}</p>
    </section>

    <section class="controls" aria-label="订阅实验操作">
      <div class="actions">
        <button type="button" @click="mutateDirect">Direct 修改</button>
        <button type="button" @click="patchObject">Patch Object</button>
        <button type="button" @click="patchFunction">Patch Function</button>
      </div>
      <div class="actions">
        <button type="button" @click="runSuccess">同步 Action 成功</button>
        <button type="button" @click="runFailure">同步 Action 抛错</button>
        <button type="button" :disabled="Boolean(releaseGate)" @click="startDeferred">
          启动异步 Action
        </button>
        <button type="button" :disabled="!releaseGate" @click="resolveDeferred">
          Resolve Gate
        </button>
        <button type="button" :disabled="!releaseGate" @click="rejectDeferred">Reject Gate</button>
      </div>
      <div class="actions">
        <button type="button" :disabled="!observerApp" @click="unmountObserver">
          卸载订阅组件
        </button>
        <button type="button" :disabled="Boolean(observerApp)" @click="mutateAfterUnmount">
          卸载后直接修改
        </button>
        <button type="button" :disabled="Boolean(observerApp)" @click="actionAfterUnmount">
          卸载后调用 Action
        </button>
        <button type="button" @click="stopDetachedSubscriptions">停止 detached 订阅</button>
        <button type="button" @click="continueAfterStop">停止后继续操作</button>
      </div>
    </section>

    <ol class="timeline" aria-label="最近订阅事件">
      <li v-for="(event, index) in timeline" :key="`${index}-${event}`">{{ event }}</li>
    </ol>
  </article>
</template>

<style scoped>
.pinia-demo {
  width: 100%;
  padding: 20px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg-elevated);
}

.demo-header p,
.demo-header h3,
.result-panel p {
  margin: 0;
}

.eyebrow {
  color: var(--color-accent);
  font-size: var(--font-size-xs);
  font-weight: 700;
}

.demo-header h3 {
  margin-top: 4px;
  font-size: var(--font-size-lg);
}

.demo-header p:last-child {
  margin-top: 8px;
  color: var(--color-text-secondary);
}

.observer-host {
  min-height: 24px;
  margin-top: 12px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
}

.observer-host :deep(p) {
  margin: 0;
}

.metrics {
  display: flex;
  flex-wrap: wrap;
  margin-top: 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-bg-sunken);
}

.metrics > div {
  flex: 1 1 130px;
  padding: 12px;
}

.metrics span,
.metrics strong {
  display: block;
}

.metrics span {
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
}

.metrics strong {
  margin-top: 4px;
}

.result-panel {
  margin-top: 12px;
  padding: 14px;
  border-left: 3px solid var(--color-accent);
  background: var(--color-bg-sunken);
}

.result-panel p + p {
  margin-top: 6px;
}

.result-panel p {
  overflow-wrap: anywhere;
}

.controls {
  margin-top: 12px;
}

.actions {
  display: flex;
  flex-wrap: wrap;
}

.actions + .actions {
  margin-top: 6px;
}

button {
  min-height: 40px;
  margin: 4px 8px 4px 0;
  padding: 0 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text-primary);
  background: var(--color-bg-sunken);
  cursor: pointer;
}

button:hover:not(:disabled) {
  border-color: var(--color-accent);
}

button:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.timeline {
  margin: 12px 0 0;
  padding: 12px 12px 12px 34px;
  background: var(--color-bg-sunken);
}

.timeline li + li {
  margin-top: 5px;
}

@media (max-width: 520px) {
  .pinia-demo {
    padding: 14px;
  }

  .metrics > div {
    flex-basis: 50%;
  }
}
</style>
