<script setup lang="ts">
import {
  computed,
  createApp,
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  ref,
  shallowRef,
  watch,
  type App,
} from 'vue'
import {
  createPinia,
  defineStore,
  disposePinia,
  getActivePinia,
  setActivePinia,
  type Pinia,
} from 'pinia'
import { preserveActivePinia } from '../preserve-active-pinia'

type LabPhase =
  'initial' | 'consumer-unmounted' | 'store-disposed' | 'store-recreated' | 'pinia-disposed'

const lifecycleStoreId = 'pinia-p05-store-lifecycle-maintenance'
const storeScopeObserverCount = ref(0)

/** 创建带 Store scope watcher 的生命周期实验 Store。 */
const useLifecycleStore = defineStore(lifecycleStoreId, () => {
  const count = ref(0)

  watch(
    count,
    () => {
      storeScopeObserverCount.value++
    },
    { flush: 'sync' },
  )

  /** 通过公开 action 增加状态。 */
  function increment(): void {
    count.value++
  }

  return { count, increment }
})

type LifecycleStore = ReturnType<typeof useLifecycleStore>

const hostActivePinia = getActivePinia()
const consumerHost = ref<HTMLElement>()
const labPinia = shallowRef<Pinia>()
const currentStore = shallowRef<LifecycleStore>()
const phase = ref<LabPhase>('initial')
const consumerStatus = ref('等待挂载')
const firstIdentity = ref('等待创建')
const repeatedIdentity = ref('等待创建')
const repeatedUseProof = ref('尚未比较')
const disposeStoreProof = ref('尚未执行')
const rebuildProof = ref('尚未重建')
const disposePiniaProof = ref('尚未执行')
const consumerObserverCount = ref(0)
const stateSubscriptionCount = ref(0)
const actionSubscriptionCount = ref(0)
const rebuiltSubscriptionCount = ref(0)
const timeline = ref<string[]>([])
const explicitStops: Array<() => void> = []
let consumerApp: App<Element> | undefined
let consumerNode: HTMLElement | undefined
let identityLabels = new WeakMap<object, string>()
let identitySequence = 0
let eventSequence = 0
let demoActive = true

/** 为 Store 对象分配仅用于本次实验的稳定 identity 标签。 */
function getIdentityLabel(store: LifecycleStore): string {
  const knownLabel = identityLabels.get(store)
  if (knownLabel) return knownLabel

  identitySequence++
  const nextLabel = `Store #${identitySequence}`
  identityLabels.set(store, nextLabel)
  return nextLabel
}

/** 追加带稳定序号的最近十条生命周期事件。 */
function appendEvent(message: string): void {
  if (!demoActive) return
  eventSequence++
  timeline.value = [
    ...timeline.value,
    `${String(eventSequence).padStart(2, '0')} · ${message}`,
  ].slice(-10)
}

/** 显式停止并丢弃当前实验保存的订阅 stop。 */
function releaseExplicitSubscriptions(): void {
  for (const stop of explicitStops.splice(0)) stop()
}

const LifecycleConsumer = defineComponent({
  name: 'PiniaLifecycleMaintenanceConsumer',
  /** 在独立 mini-app 的组件 scope 中注册公开 watcher。 */
  setup() {
    const store = useLifecycleStore()

    watch(
      () => store.count,
      () => {
        consumerObserverCount.value++
      },
      { flush: 'sync' },
    )
    consumerStatus.value = '已挂载；组件 observer 活跃'

    /** 渲染当前 consumer 读取到的 Store state。 */
    function renderConsumer() {
      return h('p', { class: 'consumer-marker' }, `consumer state：${store.count}`)
    }

    return renderConsumer
  },
})

/** 为首个 Store 注册 detached state 与 action subscription。 */
function registerInitialSubscriptions(store: LifecycleStore): void {
  explicitStops.push(
    store.$subscribe(
      () => {
        stateSubscriptionCount.value++
      },
      { detached: true, flush: 'sync' },
    ),
    store.$onAction(() => {
      actionSubscriptionCount.value++
    }, true),
  )
}

/** 为重建 Store 重新注册一条最小 state subscription。 */
function registerRebuiltSubscription(store: LifecycleStore): void {
  explicitStops.push(
    store.$subscribe(
      () => {
        rebuiltSubscriptionCount.value++
      },
      { detached: true, flush: 'sync' },
    ),
  )
}

/** 卸载 mini-app consumer，并删除它自己的临时节点。 */
function unmountConsumer(): void {
  if (consumerApp) preserveActivePinia(() => consumerApp?.unmount())
  consumerNode?.remove()
  consumerApp = undefined
  consumerNode = undefined
  consumerStatus.value = '已卸载；组件 observer 已结束'
  if (phase.value === 'initial') phase.value = 'consumer-unmounted'
  appendEvent('consumer unmount：Store 仍保留')
}

/** 释放当前实验拥有的全部资源。 */
function teardownLab(): void {
  const pinia = labPinia.value
  const piniaWasDisposed = phase.value === 'pinia-disposed'

  releaseExplicitSubscriptions()
  if (consumerApp) preserveActivePinia(() => consumerApp?.unmount())
  consumerNode?.remove()
  if (pinia && !piniaWasDisposed) preserveActivePinia(() => disposePinia(pinia))

  consumerApp = undefined
  consumerNode = undefined
  currentStore.value = undefined
  labPinia.value = undefined
  setActivePinia(hostActivePinia)
}

/** 重置所有公开计数与结果文案。 */
function resetObservations(): void {
  phase.value = 'initial'
  consumerStatus.value = '等待挂载'
  firstIdentity.value = '等待创建'
  repeatedIdentity.value = '等待创建'
  repeatedUseProof.value = '尚未比较'
  disposeStoreProof.value = '尚未执行'
  rebuildProof.value = '尚未重建'
  disposePiniaProof.value = '尚未执行'
  storeScopeObserverCount.value = 0
  consumerObserverCount.value = 0
  stateSubscriptionCount.value = 0
  actionSubscriptionCount.value = 0
  rebuiltSubscriptionCount.value = 0
  timeline.value = []
  identityLabels = new WeakMap<object, string>()
  identitySequence = 0
  eventSequence = 0
}

/** 创建全新的 Pinia、Store 与可卸载 mini-app consumer。 */
function createLab(): void {
  teardownLab()
  resetObservations()
  if (!consumerHost.value) return

  const pinia = createPinia()
  const app = createApp(LifecycleConsumer)
  const node = document.createElement('div')

  preserveActivePinia(() => app.use(pinia))
  const firstStore = preserveActivePinia(() => useLifecycleStore(pinia))
  const repeatedStore = preserveActivePinia(() => useLifecycleStore(pinia))
  registerInitialSubscriptions(firstStore)

  firstIdentity.value = getIdentityLabel(firstStore)
  repeatedIdentity.value = getIdentityLabel(repeatedStore)
  repeatedUseProof.value = firstStore === repeatedStore ? '同一实例：是' : '同一实例：否'
  labPinia.value = pinia
  currentStore.value = firstStore
  consumerApp = app
  consumerNode = node
  consumerHost.value.append(node)
  preserveActivePinia(() => app.mount(node))
  setActivePinia(hostActivePinia)
  appendEvent('fresh Pinia：首次与重复 useStore 完成')
}

/** 运行挂载期基线 action，让各层 observer 产生公开计数。 */
function runBaselineAction(): void {
  const store = currentStore.value
  if (!store || phase.value !== 'initial') return
  preserveActivePinia(() => store.increment())
  appendEvent(`挂载期 action：state=${store.count}`)
}

/** 在 consumer 卸载后运行同一个 Store action。 */
function runAfterConsumerUnmount(): void {
  const store = currentStore.value
  if (!store || phase.value !== 'consumer-unmounted') return
  preserveActivePinia(() => store.increment())
  appendEvent(`卸载后 action：state=${store.count}，consumer observer 保持`)
}

/** Dispose 单个 Store，并以一次受控 action 比较旧计数。 */
function disposeCurrentStore(): void {
  const store = currentStore.value
  if (!store || phase.value !== 'consumer-unmounted') return

  const identity = getIdentityLabel(store)
  const stateBefore = store.count
  const scopeBefore = storeScopeObserverCount.value
  const stateSubscriptionBefore = stateSubscriptionCount.value
  const actionSubscriptionBefore = actionSubscriptionCount.value

  preserveActivePinia(() => store.$dispose())
  preserveActivePinia(() => store.increment())

  disposeStoreProof.value = [
    `${identity} state ${stateBefore} -> ${store.count}`,
    `scope ${scopeBefore} -> ${storeScopeObserverCount.value}`,
    `state sub ${stateSubscriptionBefore} -> ${stateSubscriptionCount.value}`,
    `action sub ${actionSubscriptionBefore} -> ${actionSubscriptionCount.value}`,
  ].join('；')
  currentStore.value = undefined
  phase.value = 'store-disposed'
  releaseExplicitSubscriptions()
  appendEvent('$dispose：root state 保留，旧 Store 计数停止')
}

/** 重新 useStore，并比较新 identity 与保留的 root state。 */
function recreateStore(): void {
  const pinia = labPinia.value
  if (!pinia || phase.value !== 'store-disposed') return

  const retainedState = (pinia.state.value[lifecycleStoreId] as { count?: number } | undefined)
    ?.count
  const store = preserveActivePinia(() => useLifecycleStore(pinia))
  const rebuiltIdentity = getIdentityLabel(store)

  registerRebuiltSubscription(store)
  currentStore.value = store
  phase.value = 'store-recreated'
  rebuildProof.value = `Store #1 -> ${rebuiltIdentity}；identity 不同：${rebuiltIdentity === 'Store #1' ? '否' : '是'}；state ${String(retainedState)} -> ${store.count}`
  appendEvent(`重建：${rebuiltIdentity} 从 state=${store.count} 起步`)
}

/** 修改重建 Store，证明新订阅需要重新注册且可以正常触发。 */
function mutateRebuiltStore(): void {
  const store = currentStore.value
  if (!store || phase.value !== 'store-recreated') return
  preserveActivePinia(() => store.increment())
  appendEvent(`重建 Store action：state=${store.count}，新订阅=${rebuiltSubscriptionCount.value}`)
}

/** Dispose 整个 Pinia，并只从公开 root state 记录清理结果。 */
function disposeWholePinia(): void {
  const pinia = labPinia.value
  if (!pinia || phase.value !== 'store-recreated') return

  const rootBefore = JSON.stringify(pinia.state.value)
  preserveActivePinia(() => disposePinia(pinia))
  const rootAfter = JSON.stringify(pinia.state.value)
  disposePiniaProof.value = `root ${rootBefore} -> ${rootAfter}；实例不可复用`
  currentStore.value = undefined
  phase.value = 'pinia-disposed'
  releaseExplicitSubscriptions()
  setActivePinia(hostActivePinia)
  appendEvent('disposePinia：root={}，后续操作已锁定')
}

const visibleState = computed(() => currentStore.value?.count ?? '无活跃 Store')
const rootState = computed(() => JSON.stringify(labPinia.value?.state.value ?? {}))
const phaseLabel = computed(() => {
  const labels: Record<LabPhase, string> = {
    initial: 'consumer 已挂载',
    'consumer-unmounted': 'consumer 已卸载，Store 活跃',
    'store-disposed': 'Store 已 dispose，root state 保留',
    'store-recreated': 'Store 已重建',
    'pinia-disposed': 'Pinia 已 dispose，不可复用',
  }
  return labels[phase.value]
})

onMounted(() => createLab())

/** 在外层响应式更新后恢复宿主 active Pinia。 */
onUpdated(() => setActivePinia(hostActivePinia))

onBeforeUnmount(() => {
  demoActive = false
  teardownLab()
  setActivePinia(hostActivePinia)
})
</script>

<template>
  <article class="pinia-demo" aria-label="Store lifecycle 维护实验">
    <header class="demo-header">
      <p class="eyebrow">L14 · HMR、Devtools 与维护</p>
      <h3>逐层结束 Consumer、Store 与 Pinia</h3>
      <p>实验只读取公开 identity、state 与订阅计数，不读取 Pinia 内部 registry。</p>
    </header>

    <div ref="consumerHost" class="consumer-host" aria-live="polite"></div>

    <section class="result-panel" aria-label="生命周期结果" aria-live="polite">
      <p data-testid="lifecycle-phase">阶段：{{ phaseLabel }}</p>
      <p data-testid="lifecycle-consumer-status">consumer：{{ consumerStatus }}</p>
      <p data-testid="lifecycle-identity">
        identity：first={{ firstIdentity }} · repeat={{ repeatedIdentity }} ·
        {{ repeatedUseProof }}
      </p>
      <p data-testid="lifecycle-store-state">当前 Store state：{{ visibleState }}</p>
      <p data-testid="lifecycle-root-state">Pinia root state：{{ rootState }}</p>
      <p data-testid="lifecycle-store-dispose-proof">$dispose：{{ disposeStoreProof }}</p>
      <p data-testid="lifecycle-rebuild-proof">重建：{{ rebuildProof }}</p>
      <p data-testid="lifecycle-pinia-dispose-proof">disposePinia：{{ disposePiniaProof }}</p>
    </section>

    <section class="metrics" aria-label="Observer 与订阅计数">
      <div>
        <span>consumer observer</span>
        <strong data-testid="lifecycle-consumer-observer">{{ consumerObserverCount }}</strong>
      </div>
      <div>
        <span>Store scope watcher</span>
        <strong data-testid="lifecycle-store-scope-observer">{{ storeScopeObserverCount }}</strong>
      </div>
      <div>
        <span>state subscription</span>
        <strong data-testid="lifecycle-state-subscription">{{ stateSubscriptionCount }}</strong>
      </div>
      <div>
        <span>action subscription</span>
        <strong data-testid="lifecycle-action-subscription">{{ actionSubscriptionCount }}</strong>
      </div>
      <div>
        <span>rebuilt subscription</span>
        <strong data-testid="lifecycle-rebuilt-subscription">{{ rebuiltSubscriptionCount }}</strong>
      </div>
    </section>

    <section class="controls" aria-label="生命周期实验操作">
      <div class="actions">
        <button type="button" :disabled="phase !== 'initial'" @click="runBaselineAction">
          运行挂载期 Action
        </button>
        <button type="button" :disabled="phase !== 'initial'" @click="unmountConsumer">
          卸载 Consumer
        </button>
        <button
          type="button"
          :disabled="phase !== 'consumer-unmounted'"
          @click="runAfterConsumerUnmount"
        >
          卸载后运行 Action
        </button>
        <button
          type="button"
          :disabled="phase !== 'consumer-unmounted'"
          @click="disposeCurrentStore"
        >
          Dispose Store
        </button>
      </div>
      <div class="actions">
        <button type="button" :disabled="phase !== 'store-disposed'" @click="recreateStore">
          重新 useStore
        </button>
        <button type="button" :disabled="phase !== 'store-recreated'" @click="mutateRebuiltStore">
          修改重建 Store
        </button>
        <button type="button" :disabled="phase !== 'store-recreated'" @click="disposeWholePinia">
          Dispose Pinia
        </button>
        <button type="button" @click="createLab">重置实验</button>
      </div>
    </section>

    <section class="evidence" aria-label="外部证据状态">
      <p data-testid="lifecycle-hmr-status">HMR：需要真实 Vite file update：Deferred/not-run</p>
      <p data-testid="lifecycle-devtools-status">Devtools：需要真实 client：Deferred/not-run</p>
    </section>

    <ol class="timeline" aria-label="最近生命周期事件">
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
.result-panel p,
.evidence p {
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

.consumer-host {
  min-height: 30px;
  margin-top: 12px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.consumer-host :deep(p) {
  margin: 0;
}

.result-panel,
.evidence {
  margin-top: 12px;
  padding: 14px;
  border-left: 3px solid var(--color-accent);
  background: var(--color-bg-sunken);
}

.result-panel p,
.evidence p {
  overflow-wrap: anywhere;
}

.result-panel p + p,
.evidence p + p {
  margin-top: 6px;
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
  flex: 1 1 145px;
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
  font-size: var(--font-size-lg);
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

  button {
    flex: 1 1 180px;
  }
}
</style>
