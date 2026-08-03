<script setup lang="ts">
import { computed, defineComponent, h, onErrorCaptured, ref } from 'vue'
import type { PropType } from 'vue'

type BoundaryLevel = 'inner' | 'outer'

interface CapturePayload {
  boundary: BoundaryLevel
  message: string
  info: string
}

interface CaptureEntry extends CapturePayload {
  id: number
  round: number
}

const stopAtInner = ref(true)
const subtreeRound = ref(1)
const captureLog = ref<CaptureEntry[]>([])
let nextCaptureId = 1

/** 当前传播设置对应的可读状态。 */
const propagationSummary = computed(() =>
  stopAtInner.value ? '内层边界停止传播' : '错误继续传播到外层边界',
)

/** 把未知错误转换为稳定的展示文本。 */
function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

/** 把边界层级转换为中文名称。 */
function getBoundaryLabel(boundary: BoundaryLevel): string {
  return boundary === 'inner' ? '内层边界' : '外层边界'
}

const ErrorBoundary = defineComponent({
  name: 'ErrorBoundaryLabBoundary',
  props: {
    level: {
      type: String as PropType<BoundaryLevel>,
      required: true,
    },
    stopPropagation: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['capture', 'recover'],
  /** 为当前边界注册捕获钩子并维护后备界面。 */
  setup(props, { emit, slots }) {
    const failed = ref(false)

    /** 通知父 Demo 通过 key 重新挂载完整子树。 */
    function requestRecovery(): void {
      emit('recover')
    }

    /** 捕获后代错误，切换后备界面并决定是否继续向上传播。 */
    onErrorCaptured((error, _instance, info) => {
      failed.value = true
      emit('capture', {
        boundary: props.level,
        message: getErrorMessage(error),
        info,
      } satisfies CapturePayload)

      if (props.level === 'outer' || props.stopPropagation) return false
      return undefined
    })

    /** 根据捕获状态渲染后代内容或当前层级的后备界面。 */
    return () => {
      if (!failed.value) return slots.default?.()

      const label = getBoundaryLabel(props.level)
      return h(
        'section',
        {
          class: ['boundary-fallback', `boundary-fallback--${props.level}`],
          role: 'alert',
          'data-testid': 'error-boundary-fallback',
          'data-boundary': props.level,
        },
        [
          h('p', { class: 'panel-kicker' }, label),
          h('h4', `${label}已接管当前子树`),
          h('p', { class: 'fallback-status' }, '故障后代已卸载，可以重新挂载一个全新实例。'),
          h(
            'button',
            {
              type: 'button',
              class: 'primary-button',
              'data-testid': 'reset-error-boundary',
              'data-boundary': props.level,
              onClick: requestRecovery,
            },
            '重新挂载子树',
          ),
        ],
      )
    }
  },
})

const FaultyDescendant = defineComponent({
  name: 'ErrorBoundaryLabDescendant',
  props: {
    round: {
      type: Number,
      required: true,
    },
  },
  /** 建立两条由 Vue 运行时接收的确定性错误路径。 */
  setup(props) {
    const failDuringRender = ref(false)

    /** 通过响应式更新让下一次后代渲染抛出错误。 */
    function triggerRenderFailure(): void {
      failDuringRender.value = true
    }

    /** 返回一个会拒绝的 Promise，交由 Vue 原生事件处理链捕获。 */
    async function triggerAsyncEventFailure(): Promise<void> {
      await Promise.resolve()
      throw new Error('异步事件 Promise 已拒绝')
    }

    /** 渲染正常后代；故障开关开启后从同一渲染函数抛错。 */
    return () => {
      if (failDuringRender.value) throw new Error('后代渲染发生错误')

      return h('section', { class: 'fault-panel', 'data-testid': 'healthy-boundary-content' }, [
        h('p', { class: 'panel-kicker' }, '后代组件'),
        h('h4', `第 ${props.round} 轮内容正常`),
        h('p', { class: 'healthy-status' }, '当前子树可以安全响应命令。'),
        h('div', { class: 'fault-actions' }, [
          h(
            'button',
            {
              type: 'button',
              class: 'danger-button',
              'data-testid': 'trigger-render-error',
              onClick: triggerRenderFailure,
            },
            '触发后代渲染错误',
          ),
          h(
            'button',
            {
              type: 'button',
              class: 'danger-button',
              'data-testid': 'trigger-async-error',
              onClick: triggerAsyncEventFailure,
            },
            '触发异步事件拒绝',
          ),
        ]),
      ])
    }
  },
})

/** 按 Vue 实际触发顺序追加一条边界捕获记录。 */
function appendCapture(payload: CapturePayload): void {
  captureLog.value = [
    ...captureLog.value,
    {
      id: nextCaptureId++,
      round: subtreeRound.value,
      ...payload,
    },
  ]
}

/** 增加 key，重新创建外层、内层和故障后代实例。 */
function remountSubtree(): void {
  subtreeRound.value += 1
}

/** 清空捕获记录但不改变当前边界或后代实例。 */
function clearCaptureLog(): void {
  captureLog.value = []
}
</script>

<template>
  <article class="error-boundary-lab-demo">
    <header class="lab-header">
      <div>
        <p class="eyebrow">Error boundary lab</p>
        <h3>嵌套错误边界实验台</h3>
      </div>
      <p class="propagation-status" data-testid="propagation-status" aria-live="polite">
        {{ propagationSummary }}
      </p>
    </header>

    <section class="controls" aria-label="错误传播设置">
      <label class="toggle-control">
        <input v-model="stopAtInner" type="checkbox" data-testid="stop-at-inner" />
        <span>内层停止传播</span>
      </label>
      <button
        type="button"
        class="secondary-button"
        data-testid="clear-capture-log"
        :disabled="captureLog.length === 0"
        @click="clearCaptureLog"
      >
        清空捕获日志
      </button>
    </section>

    <section class="boundary-stage" aria-label="嵌套错误边界">
      <ErrorBoundary
        :key="subtreeRound"
        level="outer"
        @capture="appendCapture"
        @recover="remountSubtree"
      >
        <ErrorBoundary
          level="inner"
          :stop-propagation="stopAtInner"
          @capture="appendCapture"
          @recover="remountSubtree"
        >
          <FaultyDescendant :round="subtreeRound" />
        </ErrorBoundary>
      </ErrorBoundary>
    </section>

    <section class="capture-section" aria-labelledby="capture-log-title">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Captured errors</p>
          <h4 id="capture-log-title">捕获日志</h4>
        </div>
        <span class="capture-count">{{ captureLog.length }} 条</span>
      </div>

      <p v-if="captureLog.length === 0" class="empty-log">尚无捕获记录</p>
      <ol v-else class="capture-list" data-testid="capture-log">
        <li
          v-for="entry in captureLog"
          :key="entry.id"
          :data-round="entry.round"
          :data-boundary="entry.boundary"
        >
          <div class="capture-meta">
            <strong>{{ getBoundaryLabel(entry.boundary) }}</strong>
            <span>#{{ entry.id }}</span>
          </div>
          <p class="capture-message">{{ entry.message }}</p>
          <p class="capture-source">来源：{{ entry.info }}</p>
        </li>
      </ol>
    </section>
  </article>
</template>

<style scoped>
.error-boundary-lab-demo {
  min-width: 0;
  color: var(--color-text);
}

.lab-header,
.controls,
.section-heading,
.capture-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
}

.lab-header > div,
.section-heading > div {
  min-width: 0;
}

.eyebrow,
.error-boundary-lab-demo :deep(.panel-kicker) {
  color: var(--color-accent);
  font-size: var(--font-size-xs);
  font-weight: 700;
  text-transform: uppercase;
}

h3,
.error-boundary-lab-demo :deep(h4),
p,
.error-boundary-lab-demo :deep(p) {
  overflow-wrap: anywhere;
}

h3 {
  margin-top: 4px;
  font-size: var(--font-size-lg);
  line-height: 1.3;
}

.error-boundary-lab-demo :deep(h4) {
  margin-top: 4px;
  font-size: var(--font-size-md);
  line-height: 1.4;
}

.propagation-status {
  max-width: 220px;
  margin-left: 16px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: 600;
  line-height: 1.5;
  text-align: right;
}

.controls {
  flex-wrap: wrap;
  margin-top: 18px;
  padding: 12px 0;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
}

.toggle-control {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  min-height: 44px;
  margin: 4px 12px 4px 0;
  color: var(--color-text);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
}

.toggle-control input {
  width: 18px;
  height: 18px;
  margin: 0 10px 0 0;
  accent-color: var(--color-accent);
}

.boundary-stage {
  min-width: 0;
  margin-top: 18px;
}

.error-boundary-lab-demo :deep(.fault-panel),
.error-boundary-lab-demo :deep(.boundary-fallback) {
  min-width: 0;
  padding: 18px;
  border: 1px solid var(--color-border-strong);
  border-radius: 8px;
  background: var(--color-bg-elevated);
  transition:
    border-color var(--duration-fast) var(--ease-out),
    background-color var(--duration-fast) var(--ease-out);
}

.error-boundary-lab-demo :deep(.boundary-fallback--inner) {
  border-color: var(--color-accent);
  background: var(--color-accent-soft);
}

.error-boundary-lab-demo :deep(.boundary-fallback--outer) {
  border-color: var(--color-warning);
  background: color-mix(in srgb, var(--color-warning) 10%, var(--color-bg-elevated));
}

.error-boundary-lab-demo :deep(.fault-actions) {
  display: flex;
  flex-wrap: wrap;
  margin: 12px -4px -4px;
}

.error-boundary-lab-demo :deep(.fault-actions button) {
  flex: 1 1 190px;
  margin: 4px;
}

.error-boundary-lab-demo :deep(.fallback-status),
.error-boundary-lab-demo :deep(.healthy-status) {
  margin-top: 8px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.6;
}

.error-boundary-lab-demo :deep(.boundary-fallback .primary-button) {
  margin-top: 14px;
}

button,
.error-boundary-lab-demo :deep(button) {
  min-width: 0;
  min-height: 44px;
  padding: 8px 14px;
  border: 1px solid transparent;
  border-radius: 7px;
  font: inherit;
  font-size: var(--font-size-sm);
  font-weight: 700;
  line-height: 1.35;
  white-space: normal;
  overflow-wrap: anywhere;
  cursor: pointer;
  touch-action: manipulation;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

button:active:not(:disabled),
.error-boundary-lab-demo :deep(button:active:not(:disabled)) {
  transform: scale(0.98);
}

button:focus-visible,
.toggle-control input:focus-visible,
.error-boundary-lab-demo :deep(button:focus-visible) {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

button:disabled,
.error-boundary-lab-demo :deep(button:disabled) {
  cursor: not-allowed;
  opacity: 0.5;
}

.error-boundary-lab-demo :deep(.primary-button) {
  background: var(--color-accent);
  color: var(--color-bg);
}

.error-boundary-lab-demo :deep(.danger-button) {
  border-color: var(--color-warning);
  background: color-mix(in srgb, var(--color-warning) 12%, transparent);
  color: var(--color-text);
}

.secondary-button {
  margin: 4px 0;
  border-color: var(--color-border-strong);
  background: var(--color-bg-elevated);
  color: var(--color-text-secondary);
}

.capture-section {
  min-width: 0;
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid var(--color-border);
}

.capture-count {
  flex: 0 0 auto;
  margin-left: 12px;
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
  font-weight: 700;
}

.empty-log {
  margin-top: 12px;
  color: var(--color-text-tertiary);
  font-size: var(--font-size-sm);
}

.capture-list {
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
}

.capture-list li {
  min-width: 0;
  padding: 12px 0;
  border-top: 1px solid var(--color-border);
}

.capture-list li:first-child {
  border-top: 0;
}

.capture-meta strong,
.capture-meta span {
  font-size: var(--font-size-xs);
}

.capture-meta span {
  flex: 0 0 auto;
  margin-left: 12px;
  color: var(--color-text-tertiary);
}

.capture-message {
  margin-top: 6px;
  font-size: var(--font-size-sm);
  font-weight: 650;
  line-height: 1.5;
}

.capture-source {
  margin-top: 4px;
  color: var(--color-text-secondary);
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: var(--font-size-xs);
  line-height: 1.55;
}

@media (max-width: 520px) {
  .lab-header,
  .controls {
    align-items: stretch;
    flex-direction: column;
  }

  .propagation-status {
    max-width: none;
    margin: 10px 0 0;
    text-align: left;
  }

  .toggle-control {
    width: 100%;
    margin-right: 0;
  }

  .secondary-button {
    width: 100%;
  }

  .error-boundary-lab-demo :deep(.fault-panel),
  .error-boundary-lab-demo :deep(.boundary-fallback) {
    padding: 14px;
  }

  .error-boundary-lab-demo :deep(.fault-actions) {
    flex-direction: column;
  }

  .error-boundary-lab-demo :deep(.fault-actions button) {
    flex-basis: auto;
    width: calc(100% - 8px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .error-boundary-lab-demo :deep(.fault-panel),
  .error-boundary-lab-demo :deep(.boundary-fallback),
  button,
  .error-boundary-lab-demo :deep(button) {
    transition: none;
  }

  button:active:not(:disabled),
  .error-boundary-lab-demo :deep(button:active:not(:disabled)) {
    transform: none;
  }
}
</style>
