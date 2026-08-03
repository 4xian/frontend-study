<script setup lang="ts">
import {
  computed,
  customRef,
  defineComponent,
  h,
  onUnmounted,
  onUpdated,
  ref,
  watchEffect,
} from 'vue'
import type { PropType, Ref } from 'vue'

interface PublishedSnapshot {
  text: string
  revision: number
}

interface SnapshotController {
  value: Ref<PublishedSnapshot>
  pending: Ref<boolean>
  triggerCount: Ref<number>
  cleanupCount: Ref<number>
  lastAction: Ref<string>
  cancelPendingCommit: () => void
}

const COMMIT_DELAY = 320
const INITIAL_TEXT = 'Vue 3'

/** 创建会缓存对象身份、延迟提交并公开清理状态的 CustomRef。 */
function createDebouncedSnapshotRef(initialText: string, delay: number): SnapshotController {
  let committedSnapshot = Object.freeze<PublishedSnapshot>({ text: initialText, revision: 0 })
  let pendingText = initialText
  let timer: ReturnType<typeof setTimeout> | undefined

  const pending = ref(false)
  const triggerCount = ref(0)
  const cleanupCount = ref(0)
  const lastAction = ref('等待输入')

  /** 清除当前待提交定时器，并记录一次资源释放。 */
  function cancelPendingCommit(): void {
    if (timer === undefined) return
    clearTimeout(timer)
    timer = undefined
    pending.value = false
    pendingText = committedSnapshot.text
    cleanupCount.value += 1
  }

  const value = customRef<PublishedSnapshot>((track, trigger) => ({
    /** 收集当前响应式消费方并返回稳定的已提交快照。 */
    get() {
      track()
      return committedSnapshot
    },
    /** 合并连续草稿，并在停顿后替换快照和触发依赖。 */
    set(nextSnapshot) {
      if (timer !== undefined) cancelPendingCommit()

      pendingText = nextSnapshot.text
      pending.value = true
      lastAction.value = `等待 ${delay}ms 后提交“${pendingText || '空文本'}”`
      timer = setTimeout(() => {
        timer = undefined
        pending.value = false

        if (Object.is(pendingText, committedSnapshot.text)) {
          lastAction.value = '草稿与已提交值相同，没有触发依赖'
          return
        }

        committedSnapshot = Object.freeze({
          text: pendingText,
          revision: committedSnapshot.revision + 1,
        })
        triggerCount.value += 1
        lastAction.value = `已提交版本 ${committedSnapshot.revision}，随后调用 trigger()`
        trigger()
      }, delay)
    },
  }))

  return { value, pending, triggerCount, cleanupCount, lastAction, cancelPendingCommit }
}

const SnapshotPreview = defineComponent({
  name: 'CustomRefStableSnapshotPreview',
  props: {
    snapshot: {
      type: Object as PropType<PublishedSnapshot>,
      required: true,
    },
  },
  emits: ['updated'],
  /** 渲染接收稳定快照的子预览，并报告真实组件更新。 */
  setup(props, { emit }) {
    onUpdated(() => emit('updated'))

    /** 渲染当前已提交快照。 */
    function renderSnapshotPreview() {
      return h(
        'section',
        {
          class: 'snapshot-panel published-snapshot',
          'data-testid': 'published-snapshot',
          'data-revision': String(props.snapshot.revision),
          'aria-labelledby': 'published-snapshot-title',
        },
        [
          h('p', { class: 'snapshot-label' }, '子组件 Prop'),
          h('h4', { id: 'published-snapshot-title' }, '已提交快照'),
          h('strong', { class: 'snapshot-value' }, props.snapshot.text || '空文本'),
          h('span', { class: 'snapshot-revision' }, `版本 ${props.snapshot.revision}`),
        ],
      )
    }

    return renderSnapshotPreview
  },
})

const controller = createDebouncedSnapshotRef(INITIAL_TEXT, COMMIT_DELAY)
const controlledSnapshot = controller.value
const draftText = ref(INITIAL_TEXT)
const observedText = ref(INITIAL_TEXT)
const observedRevision = ref(0)
const effectRuns = ref(0)
let effectRunCount = 0
const unrelatedUpdates = ref(0)
const childUpdates = ref(0)
const identityChecks = ref(0)
const identityStable = ref(true)

watchEffect(() => {
  const snapshot = controlledSnapshot.value
  observedText.value = snapshot.text
  observedRevision.value = snapshot.revision
  effectRunCount += 1
  effectRuns.value = effectRunCount
})

/** 当前待提交状态的简短名称。 */
const pendingLabel = computed(() => (controller.pending.value ? '等待提交' : '空闲'))

/** 当前 track 与 trigger 边界的可读结论。 */
const dependencySummary = computed(
  () => `响应式消费运行 ${effectRuns.value} 次；trigger 调用 ${controller.triggerCount.value} 次`,
)

/** 读取原生输入值并交给 CustomRef setter 安排提交。 */
function queueDraft(event: Event): void {
  const input = event.currentTarget as HTMLInputElement
  draftText.value = input.value
  controlledSnapshot.value = { text: input.value, revision: observedRevision.value }
}

/** 触发父级无关更新并检查 getter 是否继续返回同一个快照对象。 */
function updateUnrelatedState(): void {
  const beforeUpdate = controlledSnapshot.value
  unrelatedUpdates.value += 1
  const afterUpdate = controlledSnapshot.value
  identityChecks.value += 1
  identityStable.value = Object.is(beforeUpdate, afterUpdate)
}

/** 记录子预览因快照 Prop 变化发生的一次真实更新。 */
function recordChildUpdate(): void {
  childUpdates.value += 1
}

/** 从控制按钮取消待提交草稿并解释当前资源状态。 */
function cancelFromControl(): void {
  if (!controller.pending.value) return
  controller.cancelPendingCommit()
  controller.lastAction.value = '已取消待提交定时器；已提交快照保持不变'
}

onUnmounted(controller.cancelPendingCommit)
</script>

<template>
  <section
    class="custom-ref-trigger-control-lab-demo"
    aria-labelledby="custom-ref-trigger-lab-title"
  >
    <header class="demo-header">
      <p class="eyebrow">CustomRef trigger control lab</p>
      <h3 id="custom-ref-trigger-lab-title">把草稿、提交与通知分开</h3>
      <p>输入会立即改变草稿，但只有停顿 {{ COMMIT_DELAY }}ms 后才替换稳定快照并调用 trigger。</p>
    </header>

    <section class="input-section" aria-labelledby="draft-input-title">
      <div class="section-heading">
        <h4 id="draft-input-title">即时草稿</h4>
        <span
          :data-state="controller.pending.value ? 'pending' : 'idle'"
          data-testid="pending-state"
        >
          {{ pendingLabel }}
        </span>
      </div>
      <label for="custom-ref-draft">课程标题</label>
      <input
        id="custom-ref-draft"
        data-testid="draft-input"
        type="text"
        :value="draftText"
        aria-describedby="draft-input-help"
        autocomplete="off"
        @input="queueDraft"
      />
      <p id="draft-input-help">
        草稿：<strong data-testid="draft-value">{{ draftText || '空文本' }}</strong>
      </p>
    </section>

    <div class="actions" aria-label="实验控制">
      <button type="button" data-testid="unrelated-update" @click="updateUnrelatedState">
        触发无关父更新
      </button>
      <button
        type="button"
        data-testid="cancel-pending"
        :disabled="!controller.pending.value"
        @click="cancelFromControl"
      >
        取消待提交
      </button>
    </div>

    <section class="snapshot-flow" aria-label="草稿与提交快照">
      <section class="snapshot-panel draft-snapshot" aria-labelledby="draft-snapshot-title">
        <p class="snapshot-label">setter 接收</p>
        <h4 id="draft-snapshot-title">当前草稿</h4>
        <strong class="snapshot-value" data-testid="draft-snapshot-value">
          {{ draftText || '空文本' }}
        </strong>
        <span class="snapshot-revision">输入立即可见</span>
      </section>

      <SnapshotPreview :snapshot="controlledSnapshot" @updated="recordChildUpdate" />
    </section>

    <section class="metrics" aria-label="触发与身份指标">
      <div class="metric-item">
        <span>track 消费轮次</span>
        <strong data-testid="effect-runs">{{ effectRuns }}</strong>
      </div>
      <div class="metric-item">
        <span>trigger 次数</span>
        <strong data-testid="trigger-count">{{ controller.triggerCount.value }}</strong>
      </div>
      <div class="metric-item">
        <span>已清理定时器</span>
        <strong data-testid="cleanup-count">{{ controller.cleanupCount.value }}</strong>
      </div>
      <div class="metric-item">
        <span>子预览更新</span>
        <strong data-testid="child-update-count">{{ childUpdates }}</strong>
      </div>
    </section>

    <section class="observation" aria-live="polite" aria-atomic="true">
      <p data-testid="dependency-summary">{{ dependencySummary }}</p>
      <p data-testid="observed-snapshot">
        响应式消费看到“{{ observedText || '空文本' }}”，版本 {{ observedRevision }}
      </p>
      <p data-testid="identity-result">
        无关父更新 {{ unrelatedUpdates }} 次；身份检查 {{ identityChecks }} 次；
        {{ identityStable ? 'getter 仍返回同一快照对象' : 'getter 返回了新对象' }}
      </p>
      <p data-testid="last-action">{{ controller.lastAction.value }}</p>
    </section>
  </section>
</template>

<style scoped>
.custom-ref-trigger-control-lab-demo {
  min-width: 0;
  color: var(--color-text);
}

.custom-ref-trigger-control-lab-demo :where(h3, h4, p) {
  margin: 0;
}

.demo-header {
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.eyebrow,
.snapshot-label {
  color: var(--color-accent);
  font-size: var(--font-size-xs);
  font-weight: 700;
}

.demo-header h3 {
  margin-top: var(--space-1);
  font-size: var(--font-size-lg);
  line-height: 1.35;
}

.demo-header p:last-child,
.input-section p,
.observation p {
  margin-top: var(--space-2);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.65;
}

.input-section,
.actions,
.snapshot-flow,
.metrics,
.observation {
  margin-top: var(--space-4);
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
}

.section-heading h4 {
  min-width: 0;
  overflow-wrap: anywhere;
}

.section-heading span {
  flex: 0 0 auto;
  padding: 0.25rem 0.55rem;
  margin-left: var(--space-2);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  font-weight: 700;
}

.section-heading span[data-state='pending'] {
  border-color: var(--color-warning);
  background: var(--color-warning-bg);
  color: var(--color-text);
}

.input-section label {
  display: block;
  margin-top: var(--space-3);
  font-size: var(--font-size-sm);
  font-weight: 650;
}

.input-section input {
  width: 100%;
  min-width: 0;
  min-height: 44px;
  padding: var(--space-2) var(--space-3);
  margin-top: var(--space-2);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
  color: var(--color-text);
  font: inherit;
  line-height: 1.5;
}

.input-section input:focus-visible,
button:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
}

.actions,
.snapshot-flow,
.metrics {
  display: flex;
  flex-wrap: wrap;
  margin-right: calc(-1 * var(--space-2));
  margin-bottom: calc(-1 * var(--space-2));
}

button {
  min-width: 44px;
  min-height: 44px;
  flex: 1 1 180px;
  padding: var(--space-2) var(--space-3);
  margin-right: var(--space-2);
  margin-bottom: var(--space-2);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
  color: var(--color-text);
  font: inherit;
  font-weight: 650;
  line-height: 1.4;
  overflow-wrap: anywhere;
  touch-action: manipulation;
}

button:hover:not(:disabled) {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.snapshot-panel {
  min-width: 0;
  flex: 1 1 220px;
  padding: var(--space-4);
  margin-right: var(--space-2);
  margin-bottom: var(--space-2);
  border-top: 3px solid var(--color-border-strong);
  background: var(--color-bg-sunken);
}

.draft-snapshot {
  border-top-color: var(--color-warning);
}

.custom-ref-trigger-control-lab-demo :deep(.published-snapshot) {
  border-top-color: var(--color-vue);
}

.snapshot-panel h4,
.custom-ref-trigger-control-lab-demo :deep(.snapshot-panel h4) {
  margin-top: var(--space-1);
  font-size: var(--font-size-base);
}

.snapshot-value,
.custom-ref-trigger-control-lab-demo :deep(.snapshot-value) {
  display: block;
  margin-top: var(--space-3);
  font-size: var(--font-size-lg);
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.snapshot-revision,
.custom-ref-trigger-control-lab-demo :deep(.snapshot-revision) {
  display: block;
  margin-top: var(--space-2);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  overflow-wrap: anywhere;
}

.metric-item {
  min-width: 0;
  flex: 1 1 150px;
  padding: var(--space-3) 0;
  margin-right: var(--space-2);
  margin-bottom: var(--space-2);
  border-bottom: 1px solid var(--color-border);
}

.metric-item span {
  display: block;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  overflow-wrap: anywhere;
}

.metric-item strong {
  display: block;
  margin-top: var(--space-1);
  color: var(--color-accent);
  font-size: var(--font-size-lg);
}

.observation {
  padding: var(--space-4);
  border-left: 4px solid var(--color-accent);
  background: var(--color-bg-sunken);
}

.observation p {
  overflow-wrap: anywhere;
}

.observation p:first-child {
  margin-top: 0;
  color: var(--color-text);
  font-weight: 700;
}

@media (max-width: 520px) {
  .actions button,
  .snapshot-panel,
  .metric-item {
    flex-basis: 100%;
  }

  .observation,
  .snapshot-panel {
    padding: var(--space-3);
  }
}
</style>
