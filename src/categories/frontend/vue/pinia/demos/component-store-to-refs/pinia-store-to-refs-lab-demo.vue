<script setup lang="ts">
import { computed, createApp, onBeforeUnmount, onUpdated, ref, type Ref } from 'vue'
import {
  createPinia,
  defineStore,
  disposePinia,
  getActivePinia,
  setActivePinia,
  storeToRefs,
} from 'pinia'
import { preserveActivePinia } from '../preserve-active-pinia'

interface DemoPluginFields {
  pluginStatus: Ref<string>
  pluginLabel: string
}

const getterEvaluations = ref(0)

const useCounterStore = defineStore('pinia-p02-store-to-refs', {
  /** 创建组件解构实验的计数状态。 */
  state: () => ({ count: 0 }),
  getters: {
    /** 返回计数的两倍。 */
    doubleCount: (state) => {
      getterEvaluations.value++
      return state.count * 2
    },
  },
  actions: {
    /** 递增当前 Store 的计数。 */
    increment(): void {
      this.count++
    },
  },
})

const hostActivePinia = getActivePinia()
const pinia = createPinia()

/** 向实验 Store 添加一个响应式字段和一个普通字段。 */
pinia.use(() => ({
  pluginStatus: ref('ready-0'),
  pluginLabel: 'plain-plugin-value',
}))

const miniAppHost = document.createElement('div')
const miniApp = createApp({
  name: 'PiniaStoreToRefsMiniApp',
  /** 渲染只负责安装 Pinia 插件的空根组件。 */
  render() {
    return null
  },
})

preserveActivePinia(() => miniApp.use(pinia))
preserveActivePinia(() => miniApp.mount(miniAppHost))

const store = preserveActivePinia(() => useCounterStore(pinia))
const storeWithPlugin = store as typeof store & DemoPluginFields
const storeRefs = preserveActivePinia(() => storeToRefs(storeWithPlugin))
const extracted = storeRefs as typeof storeRefs & { pluginStatus: Ref<string> }
const countRef = extracted.count
const doubleCountRef = extracted.doubleCount
const pluginStatusRef = extracted.pluginStatus
const getterEvaluationsAfterRefs = ref(getterEvaluations.value)
const getterRefInitialValue = preserveActivePinia(() => doubleCountRef.value)
const getterEvaluationsAfterRead = ref(getterEvaluations.value)
const snapshot = preserveActivePinia(() => {
  const { count, doubleCount } = store
  return { count, doubleCount }
})
const storeCount = computed(() => preserveActivePinia(() => store.count))
const storeDouble = computed(() => preserveActivePinia(() => store.doubleCount))
const liveCount = computed(() => preserveActivePinia(() => countRef.value))
const liveDouble = computed(() => preserveActivePinia(() => doubleCountRef.value))
const livePluginStatus = computed(() => preserveActivePinia(() => pluginStatusRef.value))
const { increment } = store
const extractedKeys = Object.keys(extracted).join(', ')
const ignoredKeys = ['increment', 'pluginLabel'].filter((key) => !(key in extracted)).join(', ')
let pluginVersion = 0
const lastOperation = ref('初始化')
const lastResult = ref(`count=${store.count}`)
const timeline = ref<string[]>([`初始化：count=${store.count}`])

/** 记录最后一次操作，并保留最近六条确定性事件。 */
function recordOperation(operation: string, result: string): void {
  lastOperation.value = operation
  lastResult.value = result
  timeline.value = [...timeline.value, `${operation}：${result}`].slice(-6)
}

/** 调用脱离 Store 对象的 action，并记录最新结果。 */
function runExtractedAction(): void {
  preserveActivePinia(() => increment())
  recordOperation(
    '调用解构 action',
    preserveActivePinia(() => `count=${store.count}, doubleCount=${store.doubleCount}`),
  )
}

/** 修改 storeToRefs 提取出的插件 ref，并记录最新结果。 */
function updatePluginRef(): void {
  pluginVersion++
  preserveActivePinia(() => {
    pluginStatusRef.value = `ready-${pluginVersion}`
  })
  recordOperation('更新插件 ref', `pluginStatus=${pluginStatusRef.value}`)
}

/** 在响应式重渲染完成后恢复宿主 active Pinia。 */
onUpdated(() => {
  setActivePinia(hostActivePinia)
})

onBeforeUnmount(() => {
  miniApp.unmount()
  preserveActivePinia(() => disposePinia(pinia))
})
</script>

<template>
  <article class="pinia-demo" aria-label="storeToRefs 实验">
    <header class="demo-header">
      <p class="demo-kicker">L05 · 组件接入</p>
      <h3>解构边界实验</h3>
      <p>同一个 Store 同时保留直接解构快照与 <code>storeToRefs()</code> 结果。</p>
    </header>

    <section class="comparison" aria-label="快照与响应式对比">
      <div class="result-panel snapshot-panel">
        <p class="panel-label">直接解构快照</p>
        <dl>
          <div>
            <dt>count</dt>
            <dd data-testid="snapshot-count">{{ snapshot.count }}</dd>
          </div>
          <div>
            <dt>doubleCount</dt>
            <dd data-testid="snapshot-double">{{ snapshot.doubleCount }}</dd>
          </div>
        </dl>
        <p class="panel-note">创建时只读取一次，后续保持不变。</p>
      </div>

      <div class="result-panel live-panel">
        <p class="panel-label">storeToRefs 持续结果</p>
        <dl>
          <div>
            <dt>count</dt>
            <dd data-testid="ref-count">{{ liveCount }}</dd>
          </div>
          <div>
            <dt>doubleCount</dt>
            <dd data-testid="ref-double">{{ liveDouble }}</dd>
          </div>
        </dl>
        <p class="panel-note">模板直接消费 refs，操作后自动显示最新值。</p>
      </div>

      <div class="result-panel store-panel">
        <p class="panel-label">Store 当前值</p>
        <dl>
          <div>
            <dt>count</dt>
            <dd data-testid="store-count">{{ storeCount }}</dd>
          </div>
          <div>
            <dt>doubleCount</dt>
            <dd data-testid="store-double">{{ storeDouble }}</dd>
          </div>
        </dl>
        <p class="panel-note">同一 Store 的当前 state/getter，不是复制副本。</p>
      </div>
    </section>

    <section class="plugin-panel" aria-label="插件字段筛选">
      <div class="plugin-copy">
        <p class="panel-label">插件字段</p>
        <p data-testid="plugin-ref">
          响应式 pluginStatus：<strong>{{ livePluginStatus }}</strong>
        </p>
      </div>
      <dl class="key-list">
        <div>
          <dt>已提取</dt>
          <dd data-testid="extracted-keys">{{ extractedKeys }}</dd>
        </div>
        <div>
          <dt>已忽略</dt>
          <dd data-testid="ignored-keys">{{ ignoredKeys }}</dd>
        </div>
      </dl>
    </section>

    <section class="observation-panel" aria-label="getter 求值与操作记录">
      <div class="observation-metrics">
        <p>
          storeToRefs() 后 getter 求值：
          <strong data-testid="getter-evaluations-after-refs">{{
            getterEvaluationsAfterRefs
          }}</strong>
        </p>
        <p>
          首次读取 getter ref：<strong data-testid="getter-evaluations-after-read">{{
            getterEvaluationsAfterRead
          }}</strong>
        </p>
        <p>
          getter ref 初值：<strong>{{ getterRefInitialValue }}</strong>
        </p>
      </div>
      <p class="operation-summary">
        最后操作：<strong data-testid="last-operation">{{ lastOperation }}</strong
        >；结果：<strong data-testid="last-result">{{ lastResult }}</strong>
      </p>
      <ol class="timeline" aria-label="最近操作">
        <li v-for="(item, index) in timeline" :key="index" data-testid="timeline-item">
          {{ item }}
        </li>
      </ol>
    </section>

    <div class="actions" aria-label="实验操作">
      <button type="button" @click="runExtractedAction">调用解构 action</button>
      <button type="button" class="secondary" @click="updatePluginRef">更新插件 ref</button>
    </div>
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

.demo-header h3,
.demo-header p,
.result-panel p,
.plugin-panel p,
.key-list,
.key-list dd {
  margin: 0;
}

.demo-header h3 {
  margin-top: 4px;
  font-size: 1.15rem;
}

.demo-header > p:last-child {
  margin-top: 8px;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.demo-kicker,
.panel-label {
  color: var(--color-primary);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.comparison {
  display: flex;
  margin-top: 18px;
}

.result-panel {
  flex: 1 1 0;
  min-width: 0;
  padding: 16px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
}

.result-panel + .result-panel {
  margin-left: 12px;
}

.snapshot-panel {
  background: var(--color-bg-soft);
}

.live-panel {
  border-color: var(--color-primary);
}

.result-panel dl {
  display: flex;
  margin: 14px 0 0;
}

.result-panel dl div {
  flex: 1 1 0;
  min-width: 0;
}

.result-panel dl div + div {
  margin-left: 10px;
}

.result-panel dt,
.key-list dt {
  color: var(--color-text-secondary);
  font-size: 0.75rem;
}

.result-panel dd {
  margin: 4px 0 0;
  font-size: 1.4rem;
  font-weight: 700;
}

.panel-note {
  margin-top: 12px !important;
  color: var(--color-text-secondary);
  font-size: 0.8rem;
  line-height: 1.5;
}

.plugin-panel {
  display: flex;
  align-items: flex-start;
  margin-top: 12px;
  padding: 16px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
}

.observation-panel {
  margin-top: 12px;
  padding: 14px 16px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-bg-soft);
}

.observation-metrics {
  display: flex;
  flex-wrap: wrap;
  margin: -4px -8px 0;
}

.observation-metrics p {
  margin: 4px 8px 0;
  color: var(--color-text-secondary);
  font-size: 0.8rem;
}

.observation-metrics strong,
.operation-summary strong {
  color: var(--color-text);
}

.operation-summary {
  margin: 12px 0 0 !important;
  color: var(--color-text-secondary);
  font-size: 0.82rem;
  line-height: 1.5;
}

.timeline {
  max-height: 132px;
  margin: 10px 0 0;
  padding-left: 20px;
  overflow-y: auto;
  color: var(--color-text-secondary);
  font-size: 0.78rem;
  line-height: 1.5;
}

.timeline li + li {
  margin-top: 3px;
}

.plugin-copy,
.key-list {
  flex: 1 1 0;
  min-width: 0;
}

.plugin-copy > p:last-child {
  margin-top: 8px;
  overflow-wrap: anywhere;
}

.key-list {
  margin-left: 20px;
}

.key-list div + div {
  margin-top: 10px;
}

.key-list dd {
  margin-top: 3px;
  overflow-wrap: anywhere;
  font-family: var(--font-mono);
  font-size: 0.78rem;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  margin-top: 16px;
}

.actions button {
  min-height: 40px;
  padding: 8px 14px;
  border: 1px solid var(--color-primary);
  border-radius: 6px;
  background: var(--color-primary);
  color: white;
  cursor: pointer;
  font: inherit;
  font-weight: 600;
}

.actions button + button {
  margin-left: 8px;
}

.actions .secondary {
  background: transparent;
  color: var(--color-primary);
}

.actions button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

@media (max-width: 560px) {
  .pinia-demo {
    padding: 16px;
  }

  .comparison,
  .plugin-panel,
  .observation-metrics {
    display: block;
  }

  .result-panel + .result-panel,
  .key-list {
    margin-top: 12px;
    margin-left: 0;
  }

  .observation-metrics p {
    margin-right: 0;
    margin-left: 0;
  }

  .actions button {
    width: 100%;
  }

  .actions button + button {
    margin-top: 8px;
    margin-left: 0;
  }
}
</style>
