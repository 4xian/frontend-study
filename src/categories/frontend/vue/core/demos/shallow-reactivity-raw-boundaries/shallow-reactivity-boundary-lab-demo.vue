<script setup lang="ts">
import {
  isReactive,
  markRaw,
  reactive,
  ref,
  shallowReactive,
  shallowRef,
  toRaw,
  triggerRef,
  watchEffect,
} from 'vue'

const shallowDocument = shallowRef({ title: '初始标题', revision: 0 })
const shallowObservedTitle = ref('')
const shallowObservedRevision = ref(0)
const shallowEffectRuns = ref(0)
const shallowLastAction = ref('等待操作')
let shallowRunCount = 0

watchEffect(() => {
  shallowRunCount += 1
  shallowEffectRuns.value = shallowRunCount
  shallowObservedTitle.value = shallowDocument.value.title
  shallowObservedRevision.value = shallowDocument.value.revision
})

const shallowContainer = shallowReactive({
  mode: '草稿',
  nested: { count: 0 },
  source: ref(1),
})
const observedMode = ref('')
const observedNestedCount = ref(0)
const shallowReactiveRuns = ref(0)
const shallowReactiveLastAction = ref('等待操作')
let shallowReactiveRunCount = 0

watchEffect(() => {
  shallowReactiveRunCount += 1
  shallowReactiveRuns.value = shallowReactiveRunCount
  observedMode.value = shallowContainer.mode
  observedNestedCount.value = shallowContainer.nested.count
})

const shallowPayload = shallowRef({ id: 'snapshot-1' })
const originalRecord = { id: 'record-1' }
const proxiedRecord = reactive(originalRecord)
const rawEngine = markRaw({ id: 'engine-1', nested: { id: 'node-1' } })
const engineHost = reactive({ engine: rawEngine })
const nestedHost = reactive({ nested: rawEngine.nested })

const shallowPayloadIsRaw = !isReactive(shallowPayload.value)
const toRawRestoresOriginal = toRaw(proxiedRecord) === originalRecord
const markedRootKeepsIdentity = engineHost.engine === rawEngine && !isReactive(engineHost.engine)
const nestedIdentityHazard = rawEngine.nested !== nestedHost.nested

/** 原地修改 shallowRef 内部值，但不发送响应式通知。 */
function mutateShallowInside(): void {
  shallowDocument.value.title = `内部修改 ${shallowDocument.value.revision + 1}`
  shallowDocument.value.revision += 1
  shallowLastAction.value = '已深改内部对象，尚未通知'
}

/** 显式通知依赖当前 shallowRef 的副作用重新读取。 */
function notifyShallowDependents(): void {
  triggerRef(shallowDocument)
  shallowLastAction.value = '已调用 triggerRef，观察快照同步'
}

/** 创建新根对象并通过 shallowRef 的默认协议提交。 */
function replaceShallowRoot(): void {
  const nextRevision = shallowDocument.value.revision + 1
  shallowDocument.value = {
    title: `根替换 ${nextRevision}`,
    revision: nextRevision,
  }
  shallowLastAction.value = '已替换 .value 根对象，自动通知'
}

/** 原地修改 shallowReactive 的嵌套 raw 对象。 */
function mutateNestedValue(): void {
  shallowContainer.nested.count += 1
  shallowReactiveLastAction.value = '已深改 nested，尚未触发根依赖'
}

/** 修改 shallowReactive 的根级 mode 属性。 */
function updateRootMode(): void {
  shallowContainer.mode = shallowContainer.mode === '草稿' ? '已发布' : '草稿'
  shallowReactiveLastAction.value = '已修改根属性 mode，观察快照重新读取'
}

/** 替换 shallowReactive 的 nested 根属性。 */
function replaceNestedRoot(): void {
  shallowContainer.nested = { count: shallowContainer.nested.count + 1 }
  shallowReactiveLastAction.value = '已替换根属性 nested，自动通知'
}
</script>

<template>
  <section class="shallow-reactivity-boundary-lab-demo" aria-labelledby="shallow-lab-title">
    <header class="lab-header">
      <p class="lab-eyebrow">边界实验</p>
      <h3 id="shallow-lab-title">原对象变化，不等于依赖已经收到通知</h3>
      <p>
        左侧数据展示对象当前值，右侧快照只在 watchEffect 真正重跑时更新。用运行次数判断触发边界，
        避免把其他原因造成的组件重渲染误认为深层写入自动触发。
      </p>
    </header>

    <section class="lab-section" aria-labelledby="shallow-ref-title">
      <div class="section-heading">
        <p class="section-index">01</p>
        <div>
          <h4 id="shallow-ref-title">shallowRef 根信号</h4>
          <p>先深改内部对象，再分别比较显式通知与不可变根替换。</p>
        </div>
      </div>

      <div class="evidence-row">
        <article class="evidence-panel">
          <span>原对象当前值</span>
          <strong data-testid="shallow-raw-title">{{ shallowDocument.title }}</strong>
          <small data-testid="shallow-raw-revision">revision {{ shallowDocument.revision }}</small>
        </article>
        <article class="evidence-panel evidence-panel-observed">
          <span>watchEffect 观察快照</span>
          <strong data-testid="shallow-observed-title">{{ shallowObservedTitle }}</strong>
          <small data-testid="shallow-observed-revision">
            revision {{ shallowObservedRevision }}
          </small>
        </article>
        <article class="evidence-panel">
          <span>副作用运行</span>
          <strong data-testid="shallow-effect-runs">{{ shallowEffectRuns }} 次</strong>
          <small>初始收集计为 1 次</small>
        </article>
      </div>

      <div class="control-row" aria-label="shallowRef 操作">
        <button type="button" data-testid="mutate-shallow-inside" @click="mutateShallowInside">
          深改内部对象
        </button>
        <button type="button" data-testid="trigger-shallow-ref" @click="notifyShallowDependents">
          调用 triggerRef
        </button>
        <button type="button" data-testid="replace-shallow-root" @click="replaceShallowRoot">
          替换 .value 根对象
        </button>
      </div>
      <p class="action-status" role="status" data-testid="shallow-last-action">
        {{ shallowLastAction }}
      </p>
    </section>

    <section class="lab-section" aria-labelledby="shallow-reactive-title">
      <div class="section-heading">
        <p class="section-index">02</p>
        <div>
          <h4 id="shallow-reactive-title">shallowReactive 根属性</h4>
          <p>nested 是 raw；mode 和 nested 这两个根 key 仍然经过代理。</p>
        </div>
      </div>

      <div class="evidence-row">
        <article class="evidence-panel">
          <span>容器当前值</span>
          <strong data-testid="container-raw-mode">{{ shallowContainer.mode }}</strong>
          <small data-testid="container-raw-nested">
            nested.count {{ shallowContainer.nested.count }}
          </small>
        </article>
        <article class="evidence-panel evidence-panel-observed">
          <span>watchEffect 观察快照</span>
          <strong data-testid="container-observed-mode">{{ observedMode }}</strong>
          <small data-testid="container-observed-nested">
            nested.count {{ observedNestedCount }}
          </small>
        </article>
        <article class="evidence-panel">
          <span>副作用运行</span>
          <strong data-testid="container-effect-runs">{{ shallowReactiveRuns }} 次</strong>
          <small data-testid="container-ref-boundary">
            根 source 保留 Ref：{{ shallowContainer.source.value }}
          </small>
        </article>
      </div>

      <div class="control-row" aria-label="shallowReactive 操作">
        <button type="button" data-testid="mutate-nested-value" @click="mutateNestedValue">
          深改 nested
        </button>
        <button type="button" data-testid="update-root-mode" @click="updateRootMode">
          修改根属性 mode
        </button>
        <button type="button" data-testid="replace-nested-root" @click="replaceNestedRoot">
          替换根属性 nested
        </button>
      </div>
      <p class="action-status" role="status" data-testid="container-last-action">
        {{ shallowReactiveLastAction }}
      </p>
    </section>

    <section class="lab-section identity-section" aria-labelledby="identity-title">
      <div class="section-heading">
        <p class="section-index">03</p>
        <div>
          <h4 id="identity-title">raw / proxy 身份诊断</h4>
          <p>这些结果只读取公开 API，不通过 raw 引用修改状态。</p>
        </div>
      </div>

      <dl class="identity-list">
        <div>
          <dt>shallowRef 内部保持 raw</dt>
          <dd data-testid="identity-shallow-raw">{{ shallowPayloadIsRaw ? '是' : '否' }}</dd>
        </div>
        <div>
          <dt>toRaw(proxy) 恢复 original</dt>
          <dd data-testid="identity-to-raw">{{ toRawRestoresOriginal ? '是' : '否' }}</dd>
        </div>
        <div>
          <dt>markRaw 根保持同一身份</dt>
          <dd data-testid="identity-marked-root">{{ markedRootKeepsIdentity ? '是' : '否' }}</dd>
        </div>
        <div class="identity-warning">
          <dt>未标记 nested 单独进入 reactive 后身份不同</dt>
          <dd data-testid="identity-nested-hazard">{{ nestedIdentityHazard ? '是' : '否' }}</dd>
        </div>
      </dl>
    </section>

    <p class="result-summary" data-testid="boundary-summary">
      推荐协议：大型快照优先根替换；外部原地事务完成后才显式通知；raw 只在短小边界内使用。
    </p>
  </section>
</template>

<style scoped>
.shallow-reactivity-boundary-lab-demo {
  width: 100%;
  min-width: 0;
  color: var(--color-text);
}

.lab-header,
.lab-section,
.result-summary {
  min-width: 0;
}

.lab-header h3,
.lab-header p,
.section-heading h4,
.section-heading p,
.action-status,
.result-summary {
  overflow-wrap: anywhere;
}

.lab-header h3 {
  margin: 0;
  font-size: var(--font-size-xl);
  line-height: 1.25;
}

.lab-header > p:last-child {
  margin: var(--space-3) 0 0;
  color: var(--color-text-secondary);
  line-height: 1.7;
}

.lab-eyebrow,
.section-index {
  margin: 0 0 var(--space-2);
  color: var(--color-accent);
  font-size: var(--font-size-sm);
  font-weight: 700;
}

.lab-section {
  margin-top: var(--space-6);
  padding-top: var(--space-5);
  border-top: 1px solid var(--color-border);
}

.section-heading {
  display: flex;
  align-items: flex-start;
}

.section-heading .section-index {
  flex: 0 0 34px;
  margin: 2px var(--space-3) 0 0;
}

.section-heading > div {
  min-width: 0;
}

.section-heading h4 {
  margin: 0;
  font-size: var(--font-size-lg);
}

.section-heading p {
  margin: var(--space-2) 0 0;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.evidence-row {
  display: flex;
  align-items: stretch;
  flex-wrap: wrap;
  margin: var(--space-4) calc(var(--space-2) * -1) 0;
}

.evidence-panel {
  display: flex;
  flex: 1 1 180px;
  flex-direction: column;
  min-width: 0;
  margin: 0 var(--space-2) var(--space-3);
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
}

.evidence-panel-observed {
  border-color: color-mix(in srgb, var(--color-accent) 44%, var(--color-border));
  background: var(--color-accent-soft);
}

.evidence-panel span,
.evidence-panel small {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.evidence-panel strong {
  margin: var(--space-2) 0;
  font-size: var(--font-size-lg);
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.control-row {
  display: flex;
  align-items: stretch;
  flex-wrap: wrap;
  margin: 0 calc(var(--space-2) * -1);
}

.control-row button {
  flex: 1 1 170px;
  min-width: 0;
  min-height: 44px;
  margin: 0 var(--space-2) var(--space-3);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
  color: var(--color-text);
  font: inherit;
  font-weight: 650;
  line-height: 1.35;
  overflow-wrap: anywhere;
  cursor: pointer;
  touch-action: manipulation;
}

.control-row button:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.control-row button:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
}

.action-status {
  min-height: 24px;
  margin: 0;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.identity-list {
  margin: var(--space-4) 0 0;
}

.identity-list > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--color-border);
}

.identity-list dt {
  min-width: 0;
  margin-right: var(--space-4);
  color: var(--color-text-secondary);
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.identity-list dd {
  flex: 0 0 auto;
  margin: 0;
  color: var(--color-accent);
  font-weight: 750;
}

.identity-list .identity-warning dd {
  color: var(--color-warning);
}

.result-summary {
  margin: var(--space-5) 0 0;
  padding: var(--space-4);
  border-left: 3px solid var(--color-accent);
  background: var(--color-accent-soft);
  line-height: 1.7;
}

@media (max-width: 520px) {
  .section-heading {
    display: block;
  }

  .section-heading .section-index {
    margin: 0 0 var(--space-2);
  }

  .evidence-row,
  .control-row {
    display: block;
    margin-right: 0;
    margin-left: 0;
  }

  .evidence-panel,
  .control-row button {
    width: 100%;
    margin-right: 0;
    margin-left: 0;
  }

  .identity-list > div {
    display: block;
  }

  .identity-list dt {
    margin: 0 0 var(--space-2);
  }
}

@media (prefers-reduced-motion: reduce) {
  .control-row button {
    scroll-behavior: auto;
  }
}
</style>
