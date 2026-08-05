<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import {
  createPinia,
  defineStore,
  disposePinia,
  shouldHydrate,
  skipHydrate,
  type Pinia,
} from 'pinia'
import { preserveActivePinia } from '@/content/demos/vue/pinia/preserve-active-pinia'

interface RequestState {
  requestLabel: string
  count: number
}

type RootState = Pinia['state']['value']

const requestStoreId = 'pinia-p05-ssr-request-state'
const setupStoreId = 'pinia-p05-setup-hydration-state'
const clientDefaultLabel = 'client-default'
const clientRegularFixture = 'client-regular-fixture'
const clientOnlyFixture = 'client-only-fixture'
const serverRegularFixture = 'server-regular-fixture'
const serverClientOnlyFixture = 'server-client-only-fixture'

const useRequestStore = defineStore(requestStoreId, {
  /** 创建客户端尚未恢复快照时的 Options Store 默认状态。 */
  state: (): RequestState => ({ requestLabel: clientDefaultLabel, count: 0 }),
})

/** 创建同时包含普通 ref 与 client-only ref 的 Setup Store。 */
const useSetupHydrationStore = defineStore(setupStoreId, () => {
  const regularMessage = ref(clientRegularFixture)
  const clientOnlyMessage = skipHydrate(ref(clientOnlyFixture))
  return { regularMessage, clientOnlyMessage }
})

const requestARoot = ref('尚未创建')
const requestBRoot = ref('尚未创建')
const isolationResult = ref('尚未运行')
const snapshotAResult = ref('尚未克隆')
const snapshotBResult = ref('尚未克隆')
const serializerStatus = ref('Deferred/not-installed')
const correctOrderResult = ref('尚未运行')
const wrongOrderResult = ref('尚未运行')
const setupHydrationResult = ref('尚未运行')
const shouldHydrateResult = ref('尚未运行')
const timeline = ref<string[]>([])
const ownedPinia: Pinia[] = []

let requestAPinia: Pinia | undefined
let requestBPinia: Pinia | undefined
let requestAStore: ReturnType<typeof useRequestStore> | undefined
let requestBStore: ReturnType<typeof useRequestStore> | undefined
let correctClientPinia: Pinia | undefined
let wrongClientPinia: Pinia | undefined
let setupClientPinia: Pinia | undefined
let requestASnapshot: RootState | undefined
let requestBSnapshot: RootState | undefined

/** 追加最近八条确定性实验事件。 */
function appendEvent(message: string): void {
  timeline.value = [...timeline.value, message].slice(-8)
}

/** 登记一个由当前 Demo 独占并负责释放的 Pinia。 */
function ownPinia(pinia: Pinia): Pinia {
  ownedPinia.push(pinia)
  return pinia
}

/** 释放指定 Pinia，并从当前 Demo 的所有权列表移除。 */
function releasePinia(pinia: Pinia | undefined): void {
  if (!pinia) return
  const index = ownedPinia.indexOf(pinia)
  if (index >= 0) ownedPinia.splice(index, 1)
  preserveActivePinia(() => disposePinia(pinia))
}

/** 释放当前 Demo 创建的全部 request/client Pinia。 */
function disposeAllPinia(): void {
  for (const pinia of ownedPinia.splice(0)) {
    preserveActivePinia(() => disposePinia(pinia))
  }
  requestAPinia = undefined
  requestBPinia = undefined
  requestAStore = undefined
  requestBStore = undefined
  correctClientPinia = undefined
  wrongClientPinia = undefined
  setupClientPinia = undefined
}

/** 用 JSON-compatible round-trip 克隆 Pinia root state。 */
function cloneRootState(rootState: RootState): RootState {
  return JSON.parse(JSON.stringify(rootState)) as RootState
}

/** 读取已知 request Store 在公开 root state 中的教学状态。 */
function readRequestState(rootState: RootState): RequestState {
  return rootState[requestStoreId] as RequestState
}

/** 把两个模拟 request 的公开 root state 同步到面板。 */
function syncRequestPanels(): void {
  requestARoot.value = requestAPinia
    ? preserveActivePinia(() => JSON.stringify(requestAPinia!.state.value))
    : '尚未创建'
  requestBRoot.value = requestBPinia
    ? preserveActivePinia(() => JSON.stringify(requestBPinia!.state.value))
    : '尚未创建'
}

/** 克隆两份 JSON-compatible root state，不生成或执行 HTML。 */
function captureSnapshots(): void {
  if (!requestAPinia || !requestBPinia) createRequestBaseline()
  if (!requestAPinia || !requestBPinia) return

  requestASnapshot = preserveActivePinia(() => cloneRootState(requestAPinia!.state.value))
  requestBSnapshot = preserveActivePinia(() => cloneRootState(requestBPinia!.state.value))
  snapshotAResult.value = JSON.stringify(requestASnapshot)
  snapshotBResult.value = JSON.stringify(requestBSnapshot)
  serializerStatus.value = 'JSON-compatible 内存 clone；HTML/XSS/CSP：Deferred/not-installed'
  appendEvent('克隆两份 root state；未执行 HTML 序列化或注入')
}

/** 为模拟 request A/B 创建相同 Store ID 下的独立 Pinia 基线。 */
function createRequestBaseline(): void {
  releasePinia(requestAPinia)
  releasePinia(requestBPinia)

  const nextRequestAPinia = ownPinia(createPinia())
  const nextRequestBPinia = ownPinia(createPinia())
  requestAPinia = nextRequestAPinia
  requestBPinia = nextRequestBPinia
  requestAStore = preserveActivePinia(() => useRequestStore(nextRequestAPinia))
  requestBStore = preserveActivePinia(() => useRequestStore(nextRequestBPinia))

  preserveActivePinia(() => {
    requestAStore!.$patch({ requestLabel: 'request-A', count: 7 })
    requestBStore!.$patch({ requestLabel: 'request-B', count: 22 })
  })

  isolationResult.value = '初始隔离：A=7 · B=22 · 相同 Store ID'
  syncRequestPanels()
  requestASnapshot = undefined
  requestBSnapshot = undefined
  appendEvent('request A/B：分别 createPinia，建立 7/22 基线')
  captureSnapshots()
}

/** 只修改 request A，并核对 request B 保持原值。 */
function mutateRequestA(): void {
  if (!requestAStore || !requestBStore) createRequestBaseline()
  if (!requestAStore || !requestBStore) return

  const result = preserveActivePinia(() => {
    requestAStore!.count++
    return { a: requestAStore!.count, b: requestBStore!.count }
  })
  isolationResult.value = `修改 A 后：A=${result.a} · B=${result.b} · B 未改变=${result.b === 22}`
  syncRequestPanels()
  appendEvent(`只修改 A：A=${result.a}，B=${result.b}`)
}

/** 返回一份独立 request A 快照，缺少时先重建确定性基线。 */
function requireRequestASnapshot(): RootState {
  if (!requestASnapshot) captureSnapshots()
  return cloneRootState(requestASnapshot!)
}

/** 先恢复 root state，再首次创建 Options Store。 */
function runCorrectRestoreOrder(): void {
  releasePinia(correctClientPinia)
  const currentPinia = ownPinia(createPinia())
  correctClientPinia = currentPinia
  const initialState = requireRequestASnapshot()
  const store = preserveActivePinia(() => {
    currentPinia.state.value = initialState
    return useRequestStore(currentPinia)
  })
  const result = preserveActivePinia(() => {
    const root = readRequestState(currentPinia.state.value)
    return {
      directLabel: store.requestLabel,
      directCount: store.count,
      stateCount: store.$state.count,
      rootCount: root.count,
    }
  })
  const consistent =
    result.directCount === result.stateCount && result.stateCount === result.rootCount
  correctOrderResult.value =
    `direct=${result.directLabel}/${result.directCount} · $state=${result.stateCount} · ` +
    `root=${result.rootCount} · 一致=${consistent}`
  appendEvent('正确顺序：恢复 root -> 首次 useStore，三处一致')
}

/** 先创建 Options Store，再整体替换 root state 形成错误顺序。 */
function runWrongRestoreOrder(): void {
  releasePinia(wrongClientPinia)
  const currentPinia = ownPinia(createPinia())
  wrongClientPinia = currentPinia
  const store = preserveActivePinia(() => useRequestStore(currentPinia))
  const initialState = requireRequestASnapshot()
  preserveActivePinia(() => {
    currentPinia.state.value = initialState
  })
  const result = preserveActivePinia(() => {
    const root = readRequestState(currentPinia.state.value)
    return {
      directLabel: store.requestLabel,
      directCount: store.count,
      stateCount: store.$state.count,
      rootCount: root.count,
    }
  })
  const diverged =
    result.directCount !== result.stateCount && result.stateCount === result.rootCount
  wrongOrderResult.value =
    `direct=${result.directLabel}/${result.directCount} · $state=${result.stateCount} · ` +
    `root=${result.rootCount} · 分叉=${diverged}`
  appendEvent('错误顺序：首次 useStore -> 替换 root，direct/root 分叉')
}

/** 用预置 initial state 运行 Setup Store 顶层水合对照。 */
function runSetupStoreHydration(): void {
  releasePinia(setupClientPinia)
  const currentPinia = ownPinia(createPinia())
  setupClientPinia = currentPinia
  const store = preserveActivePinia(() => {
    currentPinia.state.value = {
      [setupStoreId]: {
        regularMessage: serverRegularFixture,
        clientOnlyMessage: serverClientOnlyFixture,
      },
    }
    return useSetupHydrationStore(currentPinia)
  })
  const ordinaryProbe = ref('ordinary-probe')
  const skippedProbe = skipHydrate(ref('skipped-probe'))
  const result = preserveActivePinia(() => {
    const root = currentPinia.state.value[setupStoreId]!
    return {
      regularMessage: store.regularMessage,
      clientOnlyMessage: store.clientOnlyMessage,
      rootRegular: String(root.regularMessage),
      rootClientOnly: String(root.clientOnlyMessage),
    }
  })
  setupHydrationResult.value =
    `普通 ref=${result.regularMessage} · skipHydrate ref=${result.clientOnlyMessage} · ` +
    `root=${result.rootRegular}/${result.rootClientOnly}`
  shouldHydrateResult.value = `普通 ref=${shouldHydrate(ordinaryProbe)} · skipHydrate ref=${shouldHydrate(skippedProbe)}`
  appendEvent('Setup Store：普通 ref 接收 server，标记 ref 保留 client')
}

/** 释放全部实例并重新建立可重复的 request A/B 基线。 */
function resetDemo(): void {
  disposeAllPinia()
  requestASnapshot = undefined
  requestBSnapshot = undefined
  requestARoot.value = '尚未创建'
  requestBRoot.value = '尚未创建'
  isolationResult.value = '尚未运行'
  snapshotAResult.value = '尚未克隆'
  snapshotBResult.value = '尚未克隆'
  serializerStatus.value = 'Deferred/not-installed'
  correctOrderResult.value = '尚未运行'
  wrongOrderResult.value = '尚未运行'
  setupHydrationResult.value = '尚未运行'
  shouldHydrateResult.value = '尚未运行'
  timeline.value = []
  createRequestBaseline()
}

resetDemo()

/** 卸载时只释放资源，不重新创建实验基线。 */
onBeforeUnmount(() => {
  disposeAllPinia()
  timeline.value = []
})
</script>

<template>
  <article class="pinia-demo" aria-label="Pinia SSR 与 Hydration 顺序实验">
    <header class="demo-header">
      <p class="eyebrow">L13 · SSR 与 Hydration</p>
      <h3>在公开 Root State 上观察隔离与恢复顺序</h3>
      <p>当前运行 Pinia 4.0.2 的 SPA 内存实验，不执行真实 SSR renderer 或 DOM hydration。</p>
    </header>

    <section class="experiment-section" aria-labelledby="request-title">
      <h4 id="request-title">模拟 Request A/B</h4>
      <div class="state-row" aria-live="polite">
        <div class="state-item">
          <strong>Request A root</strong>
          <code data-testid="ssr-request-a-root">{{ requestARoot }}</code>
        </div>
        <div class="state-item">
          <strong>Request B root</strong>
          <code data-testid="ssr-request-b-root">{{ requestBRoot }}</code>
        </div>
      </div>
      <p class="result-line" data-testid="ssr-request-isolation">{{ isolationResult }}</p>
      <div class="controls" aria-label="请求隔离操作">
        <button type="button" @click="createRequestBaseline">重建 Request A/B</button>
        <button type="button" @click="mutateRequestA">只修改 Request A</button>
      </div>
    </section>

    <section class="experiment-section" aria-labelledby="snapshot-title">
      <h4 id="snapshot-title">Root State 内存快照</h4>
      <p data-testid="ssr-snapshot-a">
        <strong>A：</strong><code>{{ snapshotAResult }}</code>
      </p>
      <p data-testid="ssr-snapshot-b">
        <strong>B：</strong><code>{{ snapshotBResult }}</code>
      </p>
      <p class="status-line" data-testid="ssr-serializer-status">{{ serializerStatus }}</p>
      <div class="controls">
        <button type="button" @click="captureSnapshots">克隆当前两份快照</button>
      </div>
    </section>

    <section class="experiment-section" aria-labelledby="order-title">
      <h4 id="order-title">Options Store 恢复顺序</h4>
      <div class="comparison-row" aria-live="polite">
        <div class="comparison-item correct-item">
          <strong>先恢复，后 useStore</strong>
          <p data-testid="ssr-correct-order">{{ correctOrderResult }}</p>
        </div>
        <div class="comparison-item wrong-item">
          <strong>先 useStore，后替换 Root</strong>
          <p data-testid="ssr-wrong-order">{{ wrongOrderResult }}</p>
        </div>
      </div>
      <div class="controls" aria-label="恢复顺序操作">
        <button type="button" @click="runCorrectRestoreOrder">运行正确恢复顺序</button>
        <button type="button" @click="runWrongRestoreOrder">运行错误恢复顺序</button>
      </div>
    </section>

    <section class="experiment-section" aria-labelledby="setup-title">
      <h4 id="setup-title">Setup Store 顶层属性</h4>
      <p class="result-line" data-testid="ssr-setup-hydration">{{ setupHydrationResult }}</p>
      <p class="result-line" data-testid="ssr-should-hydrate">{{ shouldHydrateResult }}</p>
      <div class="controls">
        <button type="button" @click="runSetupStoreHydration">运行 Setup Store 水合</button>
      </div>
    </section>

    <section class="evidence-section" aria-labelledby="evidence-title">
      <h4 id="evidence-title">当前证据状态</h4>
      <ul>
        <li data-testid="ssr-memory-status">Pinia 4.0.2 request/root state 内存 seam：可运行</li>
        <li data-testid="ssr-node-status">Node SSR / renderToString：Deferred/not-run</li>
        <li data-testid="ssr-security-status">
          安全 HTML 注入 / XSS / CSP：Deferred/not-installed
        </li>
        <li data-testid="ssr-hydration-status">
          浏览器 Vue hydration / mismatch：Deferred/not-run
        </li>
      </ul>
    </section>

    <section class="footer-controls" aria-label="实验重置">
      <button type="button" @click="resetDemo">重置全部实验</button>
    </section>

    <ol class="timeline" aria-label="最近 SSR 与 Hydration 实验事件">
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
.experiment-section h4,
.experiment-section p,
.evidence-section h4 {
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

.experiment-section,
.evidence-section {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--color-border);
}

.experiment-section h4,
.evidence-section h4 {
  font-size: var(--font-size-sm);
}

.state-row,
.comparison-row,
.controls {
  display: flex;
  flex-wrap: wrap;
}

.state-row,
.comparison-row {
  margin-top: 8px;
}

.state-item,
.comparison-item {
  flex: 1 1 260px;
  min-width: 0;
  margin: 4px 8px 4px 0;
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-bg-sunken);
}

.state-item strong,
.state-item code,
.comparison-item strong,
.comparison-item p {
  display: block;
}

.state-item code,
.experiment-section code,
.comparison-item p,
.result-line,
.status-line {
  overflow-wrap: anywhere;
}

.state-item code,
.comparison-item p {
  margin-top: 6px;
}

.correct-item {
  border-left: 3px solid var(--color-success, #16803c);
}

.wrong-item {
  border-left: 3px solid var(--color-warning, #b45309);
}

.result-line,
.status-line,
.experiment-section > p + p {
  margin-top: 8px;
}

.status-line {
  color: var(--color-text-secondary);
}

.controls {
  margin-top: 8px;
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

button:hover {
  border-color: var(--color-accent);
}

button:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.evidence-section ul {
  margin: 8px 0 0;
  padding-left: 22px;
}

.evidence-section li + li {
  margin-top: 5px;
}

.footer-controls {
  margin-top: 12px;
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

  .state-item,
  .comparison-item,
  button {
    flex: 1 1 180px;
  }
}
</style>
