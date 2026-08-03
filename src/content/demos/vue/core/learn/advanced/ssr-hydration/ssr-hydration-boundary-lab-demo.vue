<script setup lang="ts">
import { computed, ref } from 'vue'

type Scenario = 'deterministic' | 'text-drift' | 'structure-drift'
type BoundaryMode = 'hydrate' | 'client-only'
type ResultState = 'waiting' | 'match' | 'mismatch' | 'boundary'

interface ScenarioSnapshot {
  serverMarkup: string
  clientMarkup: string
  clientContent: string
  mismatchKind: '无' | '文本不匹配' | '节点不匹配'
}

const scenario = ref<Scenario>('deterministic')
const boundaryMode = ref<BoundaryMode>('hydrate')
const hasCompared = ref(false)
const clientUpdateCount = ref(0)

const snapshots: Record<Scenario, ScenarioSnapshot> = {
  deterministic: {
    serverMarkup: '<article><h4>SSR 课程</h4><p>课程 #42</p></article>',
    clientMarkup: '<article><h4>SSR 课程</h4><p>课程 #42</p></article>',
    clientContent: '课程 #42',
    mismatchKind: '无',
  },
  'text-drift': {
    serverMarkup: '<article><h4>课程时刻</h4><time>08:00 UTC</time></article>',
    clientMarkup: '<article><h4>课程时刻</h4><time>16:00 UTC+8</time></article>',
    clientContent: '16:00 UTC+8',
    mismatchKind: '文本不匹配',
  },
  'structure-drift': {
    serverMarkup: '<article><p><span>服务端摘要</span></p></article>',
    clientMarkup: '<article><p>客户端摘要</p><div>额外节点</div></article>',
    clientContent: '客户端摘要与额外节点',
    mismatchKind: '节点不匹配',
  },
}

/** 当前情景对应的固定服务端与客户端模型快照。 */
const activeSnapshot = computed(() => snapshots[scenario.value])

/** 客户端边界在两端首次渲染时共用的稳定占位。 */
const boundaryPlaceholder = '<section aria-busy="true">客户端区域占位</section>'

/** 当前模型展示的服务端 HTML。 */
const serverMarkup = computed(() =>
  boundaryMode.value === 'client-only' ? boundaryPlaceholder : activeSnapshot.value.serverMarkup,
)

/** 当前模型展示的客户端首次 VNode 结构。 */
const clientFirstMarkup = computed(() =>
  boundaryMode.value === 'client-only' ? boundaryPlaceholder : activeSnapshot.value.clientMarkup,
)

/** 激活或客户端边界完成后的可观察内容。 */
const clientAfterMount = computed(() => {
  if (!hasCompared.value) return '等待模型比对后开放客户端更新'

  const content =
    boundaryMode.value === 'client-only' ? activeSnapshot.value.clientContent : '首次 DOM 已接管'
  return `${content}，交互计数 ${clientUpdateCount.value}`
})

/** 当前比对结果所使用的语义状态。 */
const resultState = computed<ResultState>(() => {
  if (!hasCompared.value) return 'waiting'
  if (boundaryMode.value === 'client-only') return 'boundary'
  return activeSnapshot.value.mismatchKind === '无' ? 'match' : 'mismatch'
})

/** 把当前比对结果转换为简短结论。 */
const resultSummary = computed(() => {
  if (!hasCompared.value) return '等待执行模型比对'
  if (boundaryMode.value === 'client-only') return '客户端边界：两端首轮占位一致'
  if (activeSnapshot.value.mismatchKind === '无') return '首次渲染匹配：可以复用现有 DOM'
  return `${activeSnapshot.value.mismatchKind}：Vue 会恢复 DOM，但应修复输入差异`
})

/** 解释当前结果对应的真实工程边界。 */
const resultDetail = computed(() => {
  if (!hasCompared.value) return '选择情景与边界后，结果只比较两份固定模型快照。'
  if (boundaryMode.value === 'client-only')
    return '浏览器专属内容在挂载后出现；该区域没有真实 SSR 内容，应预留稳定布局。'
  if (activeSnapshot.value.mismatchKind === '无')
    return '节点类型、顺序与文本相同，hydration 才具备复用服务端节点的前提。'
  if (activeSnapshot.value.mismatchKind === '文本不匹配')
    return '时间与时区改变了客户端首轮文本；应共享快照或推迟到挂载后转换。'
  return '客户端首轮多出不同节点；恢复会移除或补挂 DOM，不能当作无成本成功。'
})

/** 当前实验阶段的公开时间线。 */
const timeline = computed(() => {
  const finalStep = hasCompared.value
    ? boundaryMode.value === 'client-only'
      ? '挂载后开放客户端区域'
      : activeSnapshot.value.mismatchKind === '无'
        ? '复用节点并绑定交互'
        : `分类为${activeSnapshot.value.mismatchKind}并恢复 DOM`
    : '等待比对结果'

  return ['服务器快照准备完成', '浏览器解析为 DOM', '客户端首次渲染准备完成', finalStep]
})

/** 切换确定性情景并清除上一轮结果。 */
function selectScenario(nextScenario: Scenario): void {
  if (scenario.value === nextScenario) return
  scenario.value = nextScenario
  hasCompared.value = false
  clientUpdateCount.value = 0
}

/** 切换直接激活或客户端边界，并清除上一轮结果。 */
function selectBoundary(nextMode: BoundaryMode): void {
  if (boundaryMode.value === nextMode) return
  boundaryMode.value = nextMode
  hasCompared.value = false
  clientUpdateCount.value = 0
}

/** 执行一次固定快照比对并开放后续客户端交互。 */
function runComparison(): void {
  hasCompared.value = true
  clientUpdateCount.value = 0
}

/** 模拟激活完成后由客户端事件触发的普通更新。 */
function updateClientState(): void {
  if (!hasCompared.value) return
  clientUpdateCount.value += 1
}

/** 把实验台恢复为确定性输入与直接激活的初始状态。 */
function resetLab(): void {
  scenario.value = 'deterministic'
  boundaryMode.value = 'hydrate'
  hasCompared.value = false
  clientUpdateCount.value = 0
}
</script>

<template>
  <section class="ssr-hydration-boundary-lab-demo" aria-labelledby="ssr-lab-title">
    <header class="demo-header">
      <p class="eyebrow">SSR / Hydration 边界模型</p>
      <h3 id="ssr-lab-title">确定性首次渲染实验台</h3>
      <p>
        当前页面不执行 Node SSR 或真实 hydration；实验只比较固定快照，帮助识别需要进入真实 SSR
        反馈环的差异。
      </p>
    </header>

    <section class="control-section" aria-labelledby="scenario-title">
      <h4 id="scenario-title">输入情景</h4>
      <div class="segmented-control" role="group" aria-label="选择输入情景">
        <button
          type="button"
          :aria-pressed="scenario === 'deterministic'"
          @click="selectScenario('deterministic')"
        >
          确定性输入
        </button>
        <button
          type="button"
          :aria-pressed="scenario === 'text-drift'"
          @click="selectScenario('text-drift')"
        >
          时间文本漂移
        </button>
        <button
          type="button"
          :aria-pressed="scenario === 'structure-drift'"
          @click="selectScenario('structure-drift')"
        >
          节点结构漂移
        </button>
      </div>
    </section>

    <section class="control-section" aria-labelledby="boundary-title">
      <h4 id="boundary-title">客户端策略</h4>
      <div class="segmented-control" role="group" aria-label="选择客户端策略">
        <button
          type="button"
          :aria-pressed="boundaryMode === 'hydrate'"
          @click="selectBoundary('hydrate')"
        >
          参与首次激活
        </button>
        <button
          type="button"
          :aria-pressed="boundaryMode === 'client-only'"
          @click="selectBoundary('client-only')"
        >
          客户端边界
        </button>
      </div>
    </section>

    <div class="snapshot-list" aria-label="首次渲染快照">
      <section class="snapshot-panel" aria-labelledby="server-snapshot-title">
        <p class="snapshot-label">步骤 1</p>
        <h4 id="server-snapshot-title">服务器 HTML 快照</h4>
        <code data-testid="server-markup">{{ serverMarkup }}</code>
      </section>

      <section class="snapshot-panel" aria-labelledby="client-snapshot-title">
        <p class="snapshot-label">步骤 2</p>
        <h4 id="client-snapshot-title">客户端首次渲染</h4>
        <code data-testid="client-markup">{{ clientFirstMarkup }}</code>
      </section>
    </div>

    <section
      class="comparison-result"
      :data-state="resultState"
      data-testid="comparison-result"
      aria-live="polite"
      aria-atomic="true"
    >
      <p class="result-label">模型结论</p>
      <strong>{{ resultSummary }}</strong>
      <p>{{ resultDetail }}</p>
    </section>

    <section class="timeline-panel" aria-labelledby="timeline-title">
      <h4 id="timeline-title">阶段记录</h4>
      <ol>
        <li v-for="(step, index) in timeline" :key="step">
          <span aria-hidden="true">{{ index + 1 }}</span>
          <p>{{ step }}</p>
        </li>
      </ol>
    </section>

    <section class="client-output" aria-labelledby="client-output-title">
      <h4 id="client-output-title">挂载后客户端区域</h4>
      <output data-testid="client-after-mount">{{ clientAfterMount }}</output>
    </section>

    <div class="actions">
      <button
        type="button"
        class="primary-action"
        data-testid="run-comparison"
        @click="runComparison"
      >
        执行模型比对
      </button>
      <button
        type="button"
        data-testid="update-client-state"
        :disabled="!hasCompared"
        @click="updateClientState"
      >
        触发客户端更新
      </button>
      <button type="button" data-testid="reset-lab" @click="resetLab">重置</button>
    </div>
  </section>
</template>

<style scoped>
.ssr-hydration-boundary-lab-demo {
  min-width: 0;
  color: var(--color-text);
}

.ssr-hydration-boundary-lab-demo :where(h3, h4, p, ol) {
  margin: 0;
}

.demo-header {
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.demo-header .eyebrow,
.snapshot-label,
.result-label {
  color: var(--color-accent);
  font-size: var(--font-size-xs);
  font-weight: 700;
}

.demo-header h3 {
  margin-top: var(--space-1);
  font-size: var(--font-size-lg);
  line-height: 1.3;
}

.demo-header p:last-child,
.comparison-result p,
.timeline-panel p {
  margin-top: var(--space-2);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.65;
}

.control-section,
.snapshot-list,
.comparison-result,
.timeline-panel,
.client-output,
.actions {
  margin-top: var(--space-4);
}

.control-section h4,
.snapshot-panel h4,
.timeline-panel h4,
.client-output h4 {
  font-size: var(--font-size-base);
  line-height: 1.45;
}

.segmented-control,
.snapshot-list,
.actions {
  display: flex;
  flex-wrap: wrap;
}

.segmented-control {
  margin-top: var(--space-2);
  margin-right: calc(-1 * var(--space-2));
  margin-bottom: calc(-1 * var(--space-2));
}

button {
  min-width: 44px;
  min-height: 44px;
  padding: var(--space-2) var(--space-3);
  margin-right: var(--space-2);
  margin-bottom: var(--space-2);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
  color: var(--color-text);
  font: inherit;
  font-weight: 600;
  line-height: 1.35;
  overflow-wrap: anywhere;
  touch-action: manipulation;
  transition:
    border-color var(--duration-fast) var(--ease-out),
    background-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out);
}

button:hover:not(:disabled) {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

button:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
}

button[aria-pressed='true'],
.primary-action {
  border-color: var(--color-accent);
  background: var(--color-accent);
  color: var(--color-on-accent);
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.48;
}

.snapshot-list {
  margin-right: calc(-1 * var(--space-2));
  margin-bottom: calc(-1 * var(--space-2));
}

.snapshot-panel {
  min-width: 0;
  flex: 1 1 240px;
  padding: var(--space-3) 0 var(--space-4);
  margin-right: var(--space-2);
  margin-bottom: var(--space-2);
  border-top: 1px solid var(--color-border);
}

.snapshot-panel h4 {
  margin-top: var(--space-1);
}

.snapshot-panel code {
  display: block;
  min-width: 0;
  padding-top: var(--space-3);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.6;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.comparison-result {
  padding: var(--space-4);
  border-left: 4px solid var(--color-border-strong);
  background: var(--color-bg-sunken);
}

.comparison-result[data-state='match'],
.comparison-result[data-state='boundary'] {
  border-left-color: var(--color-vue);
}

.comparison-result[data-state='mismatch'] {
  border-left-color: var(--color-warning);
  background: var(--color-warning-bg);
}

.comparison-result strong {
  display: block;
  margin-top: var(--space-1);
  line-height: 1.45;
  overflow-wrap: anywhere;
}

.timeline-panel {
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
}

.timeline-panel ol {
  padding: 0;
  list-style: none;
}

.timeline-panel li {
  display: flex;
  align-items: flex-start;
  min-width: 0;
  margin-top: var(--space-2);
}

.timeline-panel li > span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  margin-right: var(--space-2);
  border: 1px solid var(--color-border-strong);
  border-radius: 50%;
  color: var(--color-accent);
  font-size: var(--font-size-xs);
  font-weight: 700;
}

.timeline-panel li p {
  min-width: 0;
  margin-top: 2px;
  overflow-wrap: anywhere;
}

.client-output {
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
}

.client-output output {
  display: block;
  margin-top: var(--space-2);
  color: var(--color-text-secondary);
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.actions {
  margin-right: calc(-1 * var(--space-2));
  margin-bottom: calc(-1 * var(--space-2));
}

@media (max-width: 520px) {
  .snapshot-panel {
    flex-basis: 100%;
  }

  .segmented-control button,
  .actions button {
    flex: 1 1 140px;
  }
}

@media (prefers-reduced-motion: reduce) {
  button {
    transition: none;
  }
}
</style>
