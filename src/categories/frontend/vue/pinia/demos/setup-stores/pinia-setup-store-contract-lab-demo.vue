<script setup lang="ts">
import {
  computed,
  defineComponent,
  h,
  onBeforeUnmount,
  onUnmounted,
  ref,
  watch,
  type PropType,
} from 'vue'
import { createPinia, defineStore, disposePinia } from 'pinia'
import { preserveActivePinia } from '../preserve-active-pinia'

const watcherRuns = ref(0)

const useOptionsStore = defineStore('pinia-p02-options-store-contract', {
  /** 创建 Options Store 对照所需的计数状态。 */
  state: () => ({ count: 0 }),
  getters: {
    /** 返回 Options Store 计数的两倍。 */
    doubleCount: (state) => state.count * 2,
  },
  actions: {
    /** 递增 Options Store 的计数。 */
    increment(): void {
      this.count++
    },
  },
})

const useLifecycleStore = defineStore('pinia-p02-setup-store-contract', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)

  /** 记录 Store scope 内 watcher 的实际执行次数。 */
  watch(
    count,
    () => {
      watcherRuns.value++
    },
    { flush: 'sync' },
  )

  /** 通过 Setup Store action 递增计数。 */
  function increment(): void {
    count.value++
  }

  /** 恢复 Setup Store 明确拥有的 state。 */
  function $reset(): void {
    count.value = 0
  }

  return { count, doubleCount, increment, $reset }
})

const pinia = createPinia()
const optionsStore = preserveActivePinia(() => useOptionsStore(pinia))
const store = preserveActivePinia(() => useLifecycleStore(pinia))
const visibleCount = ref(0)
const visibleDouble = ref(0)
const consumerMounted = ref(true)
const consumerStatus = ref('已挂载')
const disposed = ref(false)
const disposeStatus = ref('尚未调用 $dispose()')
const optionsStateKeys = Object.keys(optionsStore.$state).join(', ')
const optionsGetterKeys = preserveActivePinia(() =>
  !Object.hasOwn(optionsStore.$state, 'doubleCount') && typeof optionsStore.doubleCount === 'number'
    ? 'doubleCount'
    : '',
)
const optionsActionKeys = typeof optionsStore.increment === 'function' ? 'increment' : ''
const setupStateKeys = Object.keys(store.$state).join(', ')
const setupGetterKeys = preserveActivePinia(() =>
  !Object.hasOwn(store.$state, 'doubleCount') && typeof store.doubleCount === 'number'
    ? 'doubleCount'
    : '',
)
const setupActionKeys = [
  typeof store.increment === 'function' ? 'increment' : '',
  typeof store.$reset === 'function' ? '$reset' : '',
]
  .filter(Boolean)
  .join(', ')
const operationCount = ref(0)
const lastOperation = ref('初始化')
const lastResult = ref('count=0, watcher=0')
const timeline = ref<string[]>(['初始化：count=0, watcher=0'])

const SetupStoreConsumer = defineComponent({
  name: 'SetupStoreConsumer',
  props: {
    store: {
      type: Object as PropType<typeof store>,
      required: true,
    },
  },
  /** 建立只消费 Store state 的教学子组件。 */
  setup(props) {
    /** 在真实组件卸载时更新外层生命周期记录。 */
    onUnmounted(() => {
      consumerStatus.value = '已卸载'
    })

    /** 渲染消费组件读取到的最新计数。 */
    function renderConsumer() {
      return h(
        'p',
        { class: 'consumer-value', 'data-testid': 'consumer' },
        `消费组件读到 count：${props.store.count}`,
      )
    }

    return renderConsumer
  },
})

/** 读取 Setup Store 的 state 与 getter，并同步到纯展示状态。 */
function syncDisplay(): void {
  const current = preserveActivePinia(() => ({
    count: store.count,
    doubleCount: store.doubleCount,
  }))
  visibleCount.value = current.count
  visibleDouble.value = current.doubleCount
}

/** 记录最后一次操作，并保留最近六条确定性事件。 */
function recordOperation(operation: string, result: string): void {
  operationCount.value++
  lastOperation.value = operation
  lastResult.value = result
  timeline.value = [...timeline.value, `${operation}：${result}`].slice(-6)
}

/** 调用 Setup Store action 并刷新映射结果。 */
function runSetupAction(): void {
  preserveActivePinia(() => store.increment())
  syncDisplay()
  recordOperation('调用 Setup action', `count=${visibleCount.value}, watcher=${watcherRuns.value}`)
}

/** 调用 Setup Store 自定义 reset 并刷新状态。 */
function resetSetupStore(): void {
  preserveActivePinia(() => store.$reset())
  syncDisplay()
  recordOperation('调用自定义 $reset', `count=${visibleCount.value}, watcher=${watcherRuns.value}`)
}

/** 卸载当前消费组件，但保留 Store 实例。 */
function unmountConsumer(): void {
  consumerMounted.value = false
  recordOperation('卸载消费组件', 'Store 引用继续保留')
}

/** 在消费组件卸载后继续调用同一 Store action。 */
function mutateAfterConsumerUnmount(): void {
  preserveActivePinia(() => store.increment())
  syncDisplay()
  recordOperation('组件卸载后继续修改', `count=${visibleCount.value}, watcher=${watcherRuns.value}`)
}

/** 显式停止 Store effect scope 并保留旧 Store 引用。 */
function disposeStore(): void {
  preserveActivePinia(() => store.$dispose())
  disposed.value = true
  disposeStatus.value = '已调用 $dispose()，等待修改旧 state'
  recordOperation('调用 store.$dispose', 'Store scope 已停止，state 未重置')
}

/** 在 dispose 后直接修改旧 Store state，观察 watcher 不再运行。 */
function mutateDisposedStore(): void {
  preserveActivePinia(() => {
    store.count++
  })
  visibleCount.value = preserveActivePinia(() => store.count)
  disposeStatus.value = `watcher 已停止，state 仍保留：count=${visibleCount.value}`
  recordOperation('修改旧 Store state', `count=${visibleCount.value}, watcher=${watcherRuns.value}`)
}

syncDisplay()

onBeforeUnmount(() => {
  preserveActivePinia(() => disposePinia(pinia))
})
</script>

<template>
  <article class="pinia-demo" aria-label="Setup Store 契约实验">
    <header class="demo-header">
      <p class="demo-kicker">L06 · Setup Store</p>
      <h3>返回值与 effect scope 边界</h3>
      <p>用同一个 Store 对照映射、重置、消费组件卸载与显式 dispose。</p>
    </header>

    <section class="mapping-panel" aria-label="Options Store 与 Setup Store 映射对照">
      <div class="mapping-row">
        <p class="mapping-label">Options Store</p>
        <dl>
          <div>
            <dt>state()</dt>
            <dd data-testid="options-state-keys">{{ optionsStateKeys }}</dd>
          </div>
          <div>
            <dt>getters</dt>
            <dd data-testid="options-getter-keys">{{ optionsGetterKeys }}</dd>
          </div>
          <div>
            <dt>actions</dt>
            <dd data-testid="options-action-keys">{{ optionsActionKeys }}</dd>
          </div>
        </dl>
      </div>
      <div class="mapping-row">
        <p class="mapping-label">Setup Store</p>
        <dl>
          <div>
            <dt>ref → state</dt>
            <dd data-testid="setup-state-keys">{{ setupStateKeys }}</dd>
          </div>
          <div>
            <dt>computed → getter</dt>
            <dd data-testid="setup-getter">{{ setupGetterKeys }}</dd>
          </div>
          <div>
            <dt>function → action</dt>
            <dd data-testid="setup-action">{{ setupActionKeys }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <section class="metrics" aria-label="Store 当前结果">
      <div>
        <span>count</span>
        <strong data-testid="setup-count">{{ visibleCount }}</strong>
      </div>
      <div>
        <span>doubleCount</span>
        <strong data-testid="setup-double">{{ visibleDouble }}</strong>
      </div>
      <div>
        <span>watcher 执行</span>
        <strong data-testid="watch-runs">{{ watcherRuns }}</strong>
      </div>
    </section>

    <section class="consumer-panel" aria-label="消费组件生命周期">
      <div class="consumer-heading">
        <div>
          <p class="panel-label">消费组件</p>
          <p data-testid="consumer-status">状态：{{ consumerStatus }}</p>
        </div>
        <span class="scope-badge">Store scope 独立存续</span>
      </div>
      <SetupStoreConsumer v-if="consumerMounted" :store="store" />
      <p v-else class="consumer-empty">组件节点已移除，Store 引用仍由实验器保留。</p>
    </section>

    <p class="dispose-status" data-testid="dispose-status">{{ disposeStatus }}</p>

    <section class="observation-panel" aria-label="操作结果与最近事件">
      <p>
        操作计数：<strong data-testid="operation-count">{{ operationCount }}</strong>
      </p>
      <p>
        最后操作：<strong data-testid="last-operation">{{ lastOperation }}</strong
        >；结果：<strong data-testid="last-result">{{ lastResult }}</strong>
      </p>
      <ol class="timeline" aria-label="最近操作">
        <li v-for="(item, index) in timeline" :key="index" data-testid="timeline-item">
          {{ item }}
        </li>
      </ol>
    </section>

    <div class="actions" aria-label="Setup Store 实验操作">
      <button type="button" :disabled="disposed" @click="runSetupAction">调用 Setup action</button>
      <button type="button" :disabled="disposed" @click="resetSetupStore">调用自定义 $reset</button>
      <button type="button" :disabled="!consumerMounted || disposed" @click="unmountConsumer">
        卸载消费组件
      </button>
      <button
        type="button"
        :disabled="consumerMounted || disposed"
        @click="mutateAfterConsumerUnmount"
      >
        组件卸载后继续修改
      </button>
      <button type="button" :disabled="disposed" @click="disposeStore">调用 store.$dispose</button>
      <button type="button" :disabled="!disposed" @click="mutateDisposedStore">
        修改旧 Store state
      </button>
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
.mapping-panel p,
.consumer-panel p,
.dispose-status {
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
.panel-label,
.mapping-label {
  color: var(--color-primary);
  font-size: 0.75rem;
  font-weight: 700;
}

.mapping-panel {
  margin-top: 18px;
  padding: 14px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-bg-soft);
}

.mapping-row {
  display: flex;
  align-items: flex-start;
}

.mapping-row + .mapping-row {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid var(--color-border);
}

.mapping-row > .mapping-label {
  flex: 0 0 104px;
  margin-top: 4px;
}

.mapping-row dl {
  display: flex;
  flex: 1 1 0;
  min-width: 0;
  margin: 0;
}

.mapping-row dl > div {
  flex: 1 1 0;
  min-width: 0;
}

.mapping-row dl > div + div {
  margin-left: 14px;
  padding-left: 14px;
  border-left: 1px solid var(--color-border);
}

.mapping-row dt {
  color: var(--color-text-secondary);
  font-size: 0.75rem;
}

.mapping-row dd {
  display: block;
  margin-top: 5px;
  overflow-wrap: anywhere;
  font-family: var(--font-mono);
  font-size: 0.8rem;
}

.metrics {
  display: flex;
  margin-top: 12px;
}

.metrics > div {
  display: flex;
  flex: 1 1 0;
  align-items: baseline;
  justify-content: space-between;
  min-width: 0;
  padding: 12px 14px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
}

.metrics > div + div {
  margin-left: 8px;
}

.metrics span {
  color: var(--color-text-secondary);
  font-size: 0.78rem;
}

.metrics strong {
  margin-left: 8px;
  font-size: 1.25rem;
}

.consumer-panel {
  margin-top: 12px;
  padding: 16px;
  border: 1px solid var(--color-primary);
  border-radius: 6px;
}

.consumer-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.consumer-heading > div > p:last-child {
  margin-top: 4px;
  color: var(--color-text-secondary);
  font-size: 0.82rem;
}

.scope-badge {
  margin-left: 12px;
  padding: 4px 8px;
  border-radius: 999px;
  background: var(--color-bg-soft);
  color: var(--color-text-secondary);
  font-size: 0.72rem;
  white-space: nowrap;
}

.consumer-value,
.consumer-empty {
  margin-top: 14px !important;
  padding-top: 12px;
  border-top: 1px solid var(--color-border);
}

.consumer-empty {
  color: var(--color-text-secondary);
}

.dispose-status {
  min-height: 22px;
  margin-top: 12px;
  color: var(--color-text-secondary);
  font-size: 0.82rem;
}

.observation-panel {
  padding: 14px 16px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-bg-soft);
}

.observation-panel p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.82rem;
  line-height: 1.5;
}

.observation-panel p + p {
  margin-top: 5px;
}

.observation-panel strong {
  color: var(--color-text);
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

.actions {
  display: flex;
  flex-wrap: wrap;
  margin-top: 10px;
  margin-right: -8px;
  margin-bottom: -8px;
}

.actions button {
  min-height: 40px;
  margin-right: 8px;
  margin-bottom: 8px;
  padding: 8px 12px;
  border: 1px solid var(--color-primary);
  border-radius: 6px;
  background: transparent;
  color: var(--color-primary);
  cursor: pointer;
  font: inherit;
  font-weight: 600;
}

.actions button:first-child {
  background: var(--color-primary);
  color: white;
}

.actions button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.actions button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

@media (max-width: 620px) {
  .pinia-demo {
    padding: 16px;
  }

  .metrics,
  .mapping-row,
  .mapping-row dl {
    display: block;
  }

  .mapping-row > .mapping-label {
    margin-top: 0;
  }

  .mapping-row dl {
    margin-top: 10px;
  }

  .mapping-row dl > div + div {
    margin-top: 12px;
    margin-left: 0;
    padding-top: 12px;
    padding-left: 0;
    border-top: 1px solid var(--color-border);
    border-left: 0;
  }

  .metrics > div + div {
    margin-top: 8px;
    margin-left: 0;
  }

  .consumer-heading {
    align-items: flex-start;
  }

  .scope-badge {
    white-space: normal;
  }

  .actions {
    margin-right: 0;
  }

  .actions button {
    width: 100%;
    margin-right: 0;
  }
}
</style>
