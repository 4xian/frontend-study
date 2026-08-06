<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { createPinia, defineStore, disposePinia } from 'pinia'
import { preserveActivePinia } from '../preserve-active-pinia'

type GateOutcome = { type: 'resolve'; value: string } | { type: 'reject'; message: string }

let releaseGate: ((outcome: GateOutcome) => void) | undefined

/** 创建只由界面按钮结算的确定性 Promise。 */
function waitForManualGate(): Promise<GateOutcome> {
  return new Promise((resolve) => {
    releaseGate = resolve
  })
}

const useActionStore = defineStore('pinia-p01-action-lifecycle', {
  /** 创建 action 执行计数。 */
  state: () => ({ executionCount: 0 }),
  actions: {
    /** 同步返回一个确定结果。 */
    succeedSynchronously(label: string): string {
      this.executionCount++
      appendEvent(`action body：同步返回 ${label}`)
      return `saved:${label}`
    },
    /** 同步抛出一个确定错误。 */
    failSynchronously(): never {
      this.executionCount++
      appendEvent('action body：即将同步 throw')
      throw new Error('sync failure')
    },
    /** 等待手动 Gate，并按按钮选择 resolve 或 reject。 */
    async waitForDecision(label: string): Promise<string> {
      this.executionCount++
      appendEvent(`action body：${label} 等待 Gate`)
      const outcome = await waitForManualGate()
      releaseGate = undefined
      if (outcome.type === 'reject') {
        appendEvent(`action body：Promise reject ${outcome.message}`)
        throw new Error(outcome.message)
      }
      appendEvent(`action body：Promise resolve ${outcome.value}`)
      return outcome.value
    },
  },
})

const pinia = createPinia()
const store = preserveActivePinia(() => useActionStore(pinia))
const pending = ref(false)
const lastResult = ref('尚未执行')
const timeline = ref<string[]>([])
let eventNumber = 0
let requestNumber = 0
let active = true

/** 追加稳定序号记录，并只保留最近十条。 */
function appendEvent(message: string): void {
  if (!active) return
  eventNumber++
  timeline.value = [
    ...timeline.value,
    `${String(eventNumber).padStart(2, '0')} · ${message}`,
  ].slice(-10)
}

const unsubscribe = store.$onAction(({ name, args, after, onError }) => {
  appendEvent(`$onAction start：${name}(${args.map(String).join(', ')})`)
  after((result) => {
    appendEvent(`after：${name} -> ${String(result)}`)
  })
  onError((error) => {
    appendEvent(`onError：${name} -> ${error instanceof Error ? error.message : String(error)}`)
  })
}, true)

/** 调用同步成功 action，并记录调用方拿到的返回值。 */
function runSyncSuccess(): void {
  const result = preserveActivePinia(() => store.succeedSynchronously('draft'))
  lastResult.value = result
  appendEvent(`caller：收到 ${result}`)
}

/** 调用同步失败 action，并由调用方捕获重新抛出的错误。 */
function runSyncFailure(): void {
  try {
    preserveActivePinia(() => store.failSynchronously())
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    lastResult.value = `caught:${message}`
    appendEvent(`caller catch：${message}`)
  }
}

/** 启动一个停在手动 Gate 的异步 action。 */
function startAsyncAction(): void {
  if (pending.value) return
  requestNumber++
  const label = `request-${requestNumber}`
  pending.value = true
  lastResult.value = `pending:${label}`
  void preserveActivePinia(() => store.waitForDecision(label))
    .then((result) => {
      lastResult.value = `resolved:${result}`
      appendEvent(`caller then：${result}`)
    })
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error)
      lastResult.value = `rejected:${message}`
      appendEvent(`caller catch：${message}`)
    })
    .finally(() => {
      pending.value = false
      appendEvent('caller finally：pending = false')
    })
}

/** 让当前异步 action 成功 resolve。 */
function resolveAsyncAction(): void {
  if (!releaseGate) return
  appendEvent('界面：Gate 选择 resolve')
  releaseGate({ type: 'resolve', value: `result-${requestNumber}` })
}

/** 让当前异步 action 以 Promise rejection 结束。 */
function rejectAsyncAction(): void {
  if (!releaseGate) return
  appendEvent('界面：Gate 选择 reject')
  releaseGate({ type: 'reject', message: `async failure ${requestNumber}` })
}

/** 清空教学结果；pending 时不允许丢失当前结算轨迹。 */
function clearTimeline(): void {
  if (pending.value) return
  timeline.value = []
  eventNumber = 0
  lastResult.value = '尚未执行'
}

onBeforeUnmount(() => {
  active = false
  releaseGate?.({ type: 'reject', message: 'demo unmounted' })
  releaseGate = undefined
  unsubscribe()
  preserveActivePinia(() => disposePinia(pinia))
})
</script>

<template>
  <article class="pinia-demo">
    <header class="demo-header">
      <div>
        <p class="eyebrow">Action 结算实验</p>
        <h3>观察 start、after 与 onError</h3>
        <p>异步流程只由手动 Gate 结算，不使用网络和墙钟时间。</p>
      </div>
      <button type="button" :disabled="pending" @click="clearTimeline">清空记录</button>
    </header>

    <section class="status-panel" aria-live="polite">
      <div>
        <span>执行次数</span>
        <strong>{{ store.executionCount }}</strong>
      </div>
      <div>
        <span>异步状态</span>
        <strong>{{ pending ? 'pending' : 'settled' }}</strong>
      </div>
      <div>
        <span>调用方结果</span>
        <strong>{{ lastResult }}</strong>
      </div>
    </section>

    <section class="control-section" aria-labelledby="pinia-action-controls-title">
      <div class="section-heading">
        <p>01</p>
        <h4 id="pinia-action-controls-title">触发一种结算路径</h4>
      </div>
      <div class="actions">
        <button type="button" :disabled="pending" @click="runSyncSuccess">同步成功</button>
        <button type="button" :disabled="pending" @click="runSyncFailure">同步 Throw</button>
        <button type="button" :disabled="pending" @click="startAsyncAction">启动异步 Action</button>
      </div>
      <div class="gate-actions" aria-label="手动异步 Gate">
        <button type="button" :disabled="!pending" @click="resolveAsyncAction">Resolve Gate</button>
        <button type="button" :disabled="!pending" @click="rejectAsyncAction">Reject Gate</button>
      </div>
    </section>

    <section class="timeline-section" aria-labelledby="pinia-action-timeline-title">
      <div class="section-heading">
        <p>02</p>
        <h4 id="pinia-action-timeline-title">最近十条确定事件</h4>
      </div>
      <ol v-if="timeline.length" class="timeline">
        <li v-for="event in timeline" :key="event">{{ event }}</li>
      </ol>
      <p v-else class="empty-state">选择一个 action 开始。</p>
    </section>
  </article>
</template>

<style scoped>
.pinia-demo {
  width: 100%;
  max-width: 780px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg-sunken);
}

.demo-header,
.control-section,
.timeline-section {
  padding: 20px;
}

.demo-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-elevated);
}

.demo-header > div {
  flex: 1 1 430px;
  min-width: 0;
  margin-right: 16px;
}

.eyebrow,
.section-heading p {
  color: var(--color-accent);
  font-size: var(--font-size-xs);
  font-weight: 700;
}

.demo-header h3 {
  margin-top: 4px;
  color: var(--color-text-primary);
  font-size: var(--font-size-lg);
}

.demo-header p:last-child,
.empty-state {
  margin-top: 8px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.6;
}

button {
  min-height: 38px;
  padding: 0 14px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text-primary);
  background: var(--color-bg-elevated);
  font-weight: 600;
  touch-action: manipulation;
}

button:hover:not(:disabled) {
  border-color: var(--color-accent);
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.status-panel {
  display: flex;
  align-items: stretch;
  flex-wrap: wrap;
  padding: 14px 8px 2px;
  border-bottom: 1px solid var(--color-border);
}

.status-panel > div {
  flex: 1 1 180px;
  min-width: 0;
  padding: 0 12px 12px;
}

.status-panel span {
  display: block;
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
}

.status-panel strong {
  display: block;
  margin-top: 4px;
  overflow-wrap: anywhere;
  color: var(--color-text-primary);
}

.control-section {
  border-bottom: 1px solid var(--color-border);
}

.timeline-section {
  min-height: 180px;
  background: var(--color-bg-elevated);
}

.section-heading {
  display: flex;
  align-items: baseline;
  margin-bottom: 14px;
}

.section-heading p {
  margin-right: 10px;
}

.section-heading h4 {
  color: var(--color-text-primary);
  font-size: var(--font-size-md);
}

.actions,
.gate-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-right: -10px;
  margin-bottom: -10px;
}

.actions button,
.gate-actions button {
  margin-right: 10px;
  margin-bottom: 10px;
}

.gate-actions {
  padding-top: 14px;
  margin-top: 14px;
  border-top: 1px solid var(--color-border);
}

.timeline {
  padding-left: 20px;
  color: var(--color-text-secondary);
  font-family: var(--font-mono);
  font-size: var(--font-size-sm);
  line-height: 1.75;
}

@media (max-width: 520px) {
  .demo-header,
  .control-section,
  .timeline-section {
    padding: 16px;
  }

  .demo-header > div {
    margin-right: 0;
    margin-bottom: 12px;
  }

  .demo-header > button,
  .actions button,
  .gate-actions button {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  button {
    transition: none;
  }
}
</style>
