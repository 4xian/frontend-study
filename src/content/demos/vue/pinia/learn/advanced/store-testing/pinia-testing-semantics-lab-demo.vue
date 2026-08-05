<script setup lang="ts">
import { createApp, defineComponent, onBeforeUnmount, onUpdated, ref } from 'vue'
import {
  createPinia,
  defineStore,
  disposePinia,
  getActivePinia,
  setActivePinia,
  type Pinia,
  type PiniaPlugin,
} from 'pinia'
import { preserveActivePinia } from '@/content/demos/vue/pinia/preserve-active-pinia'

declare module 'pinia' {
  export interface PiniaCustomProperties {
    testPluginField?: string
  }
}

const hostActivePinia = getActivePinia()
const realCaseResult = ref('尚未运行')
const isolatedCaseResult = ref('尚未运行')
const pluginCaseResult = ref('尚未运行')
const counterexampleResult = ref('尚未运行')
const timeline = ref<string[]>([])
const ownedPinia: Pinia[] = []
let caseAPinia: Pinia | undefined
let caseAStore: ReturnType<typeof useCounterStore> | undefined
let caseBPinia: Pinia | undefined
let pluginPinia: Pinia | undefined
let counterexamplePinia: Pinia | undefined

const useCounterStore = defineStore('pinia-p04-real-action-case', {
  /** 创建每个测试 case 都应重新得到的默认 state。 */
  state: () => ({ count: 0 }),
  getters: {
    /** 返回当前计数的两倍，供公开行为断言。 */
    double: (state) => state.count * 2,
  },
  actions: {
    /** 执行真实加法逻辑，并把最新计数返回调用方。 */
    add(amount: number): number {
      this.count += amount
      return this.count
    },
  },
})

const pluginStoreOptions = {
  /** 创建 plugin 正确路径使用的最小 state。 */
  state: () => ({ count: 0 }),
}

const usePluginStore = defineStore('pinia-p04-plugin-test-case', pluginStoreOptions)
const useCounterexampleStore = defineStore('pinia-p04-plugin-counterexample', {
  /** 创建未安装 app 反例使用的独立 state。 */
  state: () => ({ count: 0 }),
})

const FakeAppRoot = defineComponent({
  name: 'PiniaTestingFakeAppRoot',
  /** 渲染仅提供 plugin 安装上下文的空根节点。 */
  render() {
    return null
  },
})

/** 追加最近八条确定性 case 事件。 */
function appendEvent(message: string): void {
  timeline.value = [...timeline.value, message].slice(-8)
}

/** 登记由当前 Demo 拥有、卸载时必须 dispose 的 Pinia。 */
function ownPinia(pinia: Pinia): Pinia {
  ownedPinia.push(pinia)
  return pinia
}

/** 提前释放一个已完成 case 的 Pinia，并从总清理列表移除。 */
function releasePinia(pinia: Pinia | undefined): void {
  if (!pinia) return
  const index = ownedPinia.indexOf(pinia)
  if (index >= 0) ownedPinia.splice(index, 1)
  preserveActivePinia(() => disposePinia(pinia))
}

/** 运行 fresh Pinia A 上的真实 action 行为 case。 */
function runRealStoreCase(): void {
  releasePinia(caseAPinia)
  caseAPinia = ownPinia(createPinia())
  const currentStore = preserveActivePinia(() => {
    setActivePinia(caseAPinia)
    return useCounterStore()
  })
  caseAStore = currentStore
  const before = currentStore.count
  const result = preserveActivePinia(() => currentStore.add(2))
  realCaseResult.value = `before=${before} · return=${result} · count=${currentStore.count} · double=${currentStore.double}`
  setActivePinia(hostActivePinia)
  appendEvent('case A：fresh Pinia -> 真实 action -> getter')
}

/** 运行同一 Store ID 的 fresh Pinia B，并与 A 的 registry/state 对照。 */
function runIsolatedStoreCase(): void {
  if (!caseAPinia || !caseAStore) runRealStoreCase()
  const storeA = caseAStore
  if (!storeA) return
  releasePinia(caseBPinia)
  caseBPinia = ownPinia(createPinia())
  const storeB = preserveActivePinia(() => {
    setActivePinia(caseBPinia)
    return useCounterStore()
  })
  const before = storeB.count
  preserveActivePinia(() => storeB.add(3))
  isolatedCaseResult.value = `A=${storeA.count} · B-before=${before} · B-after=${storeB.count} · distinct=${storeB !== storeA}`
  setActivePinia(hostActivePinia)
  appendEvent('case B：相同 Store ID，registry 与 state 仍隔离')
}

/** 创建记录 context identity 与扩展字段的最小测试插件。 */
function createTeachingPlugin(
  expectedPinia: Pinia,
  expectedApp: ReturnType<typeof createApp>,
  onRun: (result: string) => void,
): PiniaPlugin {
  return ({ pinia, app, store, options }) => {
    onRun(
      `pinia=${pinia === expectedPinia} · app=${app === expectedApp} · store=${store.$id === 'pinia-p04-plugin-test-case'} · options=${options.state === pluginStoreOptions.state}`,
    )
    return { testPluginField: 'ready' }
  }
}

/** 按 use(plugin) -> app.use(pinia) -> useStore() 运行正确 plugin case。 */
function runPluginCase(): void {
  releasePinia(pluginPinia)
  pluginPinia = ownPinia(createPinia())
  const fakeApp = createApp(FakeAppRoot)
  let runs = 0
  let identity = 'pinia=false · app=false · store=false · options=false'
  pluginPinia.use(
    createTeachingPlugin(pluginPinia, fakeApp, (result) => {
      runs++
      identity = result
    }),
  )
  preserveActivePinia(() => fakeApp.use(pluginPinia!))
  const store = preserveActivePinia(() => usePluginStore(pluginPinia!))
  pluginCaseResult.value = `runs=${runs} · ${identity} · field=${store.testPluginField ?? 'missing'}`
  setActivePinia(hostActivePinia)
  appendEvent('plugin case：fake app 安装后扩展 Store')
}

/** 只设 active Pinia 而不安装 app，证明普通 plugin 仍停在队列。 */
function runPluginCounterexample(): void {
  releasePinia(counterexamplePinia)
  counterexamplePinia = ownPinia(createPinia())
  let runs = 0
  counterexamplePinia.use(() => {
    runs++
    return { testPluginField: 'ready' }
  })
  const store = preserveActivePinia(() => {
    setActivePinia(counterexamplePinia)
    return useCounterexampleStore()
  })
  counterexampleResult.value = `runs=${runs} · field=${store.testPluginField ?? 'missing'}`
  setActivePinia(hostActivePinia)
  appendEvent('反例：未 app.use(pinia)，plugin 未执行')
}

/** 清理所有 case Pinia，并恢复确定性初始面板。 */
function resetCases(): void {
  for (const pinia of ownedPinia.splice(0)) preserveActivePinia(() => disposePinia(pinia))
  caseAPinia = undefined
  caseAStore = undefined
  caseBPinia = undefined
  pluginPinia = undefined
  counterexamplePinia = undefined
  realCaseResult.value = '尚未运行'
  isolatedCaseResult.value = '尚未运行'
  pluginCaseResult.value = '尚未运行'
  counterexampleResult.value = '尚未运行'
  timeline.value = []
  setActivePinia(hostActivePinia)
}

/** 在外层响应式更新后继续恢复宿主 active Pinia。 */
onUpdated(() => setActivePinia(hostActivePinia))

onBeforeUnmount(() => {
  resetCases()
  setActivePinia(hostActivePinia)
})
</script>

<template>
  <article class="pinia-demo" aria-label="Store 测试语义实验">
    <header class="demo-header">
      <p class="eyebrow">L12 · Store 测试</p>
      <h3>区分真实业务测试与 testing package 能力</h3>
      <p>面板执行普通 Pinia 的真实 runtime；它不是浏览器内 Vitest runner。</p>
    </header>

    <section class="result-panel" aria-label="真实 Store case" aria-live="polite">
      <p data-testid="testing-case-a">case A：{{ realCaseResult }}</p>
      <p data-testid="testing-case-b">case B：{{ isolatedCaseResult }}</p>
      <p data-testid="testing-plugin-case">plugin case：{{ pluginCaseResult }}</p>
      <p data-testid="testing-plugin-counterexample">未安装反例：{{ counterexampleResult }}</p>
    </section>

    <section class="controls" aria-label="Store 测试实验操作">
      <button type="button" @click="runRealStoreCase">运行真实 Store case</button>
      <button type="button" @click="runIsolatedStoreCase">再次运行隔离 case</button>
      <button type="button" @click="runPluginCase">运行 plugin case</button>
      <button type="button" @click="runPluginCounterexample">运行未安装反例</button>
      <button type="button" @click="resetCases">重置全部 case</button>
    </section>

    <section class="deferred-panel" aria-label="未安装 testing package 能力">
      <p data-testid="testing-package-status">@pinia/testing@2.0.1：Deferred/not-installed</p>
      <ul>
        <li>默认 stub actions / stubActions:false</li>
        <li>initialState / stubPatch / stubReset</li>
        <li>plugins / fakeApp / createSpy / getter override</li>
      </ul>
      <p>以上是固定官方能力说明，不是当前项目运行通过的证据。</p>
    </section>

    <ol class="timeline" aria-label="最近 Store 测试事件">
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
.deferred-panel p {
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

.demo-header p:last-child,
.deferred-panel p:last-child {
  margin-top: 8px;
  color: var(--color-text-secondary);
}

.result-panel,
.deferred-panel {
  margin-top: 12px;
  padding: 14px;
  background: var(--color-bg-sunken);
}

.result-panel {
  border-left: 3px solid var(--color-accent);
}

.result-panel p {
  overflow-wrap: anywhere;
}

.result-panel p + p {
  margin-top: 6px;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  margin-top: 12px;
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

.deferred-panel ul {
  margin: 10px 0 0;
  padding-left: 22px;
}

.deferred-panel li + li {
  margin-top: 4px;
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
