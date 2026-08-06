<script setup lang="ts">
import { computed, ref } from 'vue'

interface ReadSnapshot {
  value: string
  runs: number
  dependencies: string[]
  label: string
}

const price = ref(80)
const quantity = ref(2)
const discountEnabled = ref(false)
const discountRate = ref(10)
const note = ref('')
const snapshot = ref<ReadSnapshot>({
  value: '尚未读取',
  runs: 0,
  dependencies: [],
  label: '等待第一次读取',
})

let getterRuns = 0
let latestDependencies: string[] = []

// 计数和依赖列表仅用于展示 getter 执行过程，不代表业务 getter 应写入外部状态。
const total = computed(() => {
  getterRuns++
  const dependencies = ['price', 'quantity', 'discountEnabled']
  let value = price.value * quantity.value

  if (discountEnabled.value) {
    dependencies.push('discountRate')
    value *= 1 - discountRate.value / 100
  }

  latestDependencies = dependencies
  return Math.round(value * 100) / 100
})

/**
 * 按指定次数读取同一个计算属性，并记录本轮可观察结果。
 */
function captureReads(reads: number): void {
  let value = total.value

  for (let index = 1; index < reads; index++) {
    value = total.value
  }

  snapshot.value = {
    value: '¥' + value.toFixed(2),
    runs: getterRuns,
    dependencies: [...latestDependencies],
    label: reads === 1 ? '读取一次' : '连续读取两次',
  }
}

/**
 * 读取一次派生总价。
 */
function readOnce(): void {
  captureReads(1)
}

/**
 * 连续读取两次，用于验证同一缓存被重复复用。
 */
function readTwice(): void {
  captureReads(2)
}
</script>

<template>
  <article class="computed-demo">
    <header class="demo-header">
      <p class="eyebrow">缓存实验台</p>
      <h3>getter 什么时候真的执行</h3>
      <p>结果区只在点击读取按钮时访问 total，源状态变化不会自动读取它。</p>
    </header>

    <section class="experiment-section" aria-labelledby="computed-source-title">
      <div class="section-heading">
        <div>
          <p class="section-index">01</p>
          <h4 id="computed-source-title">调整源状态</h4>
        </div>
        <p>折扣关闭时修改折扣率，可以验证条件分支的动态依赖。</p>
      </div>

      <div class="controls">
        <label class="field">
          <span>单价</span>
          <input v-model.number="price" type="number" min="0" step="1" />
        </label>
        <label class="field">
          <span>数量</span>
          <input v-model.number="quantity" type="number" min="1" step="1" />
        </label>
        <label class="field">
          <span>折扣率（%）</span>
          <input v-model.number="discountRate" type="number" min="0" max="100" step="1" />
        </label>
        <label class="field">
          <span>无关备注</span>
          <input v-model="note" type="text" placeholder="不会成为 total 的依赖" />
        </label>
      </div>

      <label class="discount-toggle">
        <input v-model="discountEnabled" type="checkbox" />
        <span>启用折扣</span>
      </label>

      <div class="actions">
        <button type="button" @click="readOnce">读取一次</button>
        <button type="button" @click="readTwice">连续读取两次</button>
      </div>
    </section>

    <section class="result-section" aria-labelledby="computed-result-title">
      <div class="section-heading">
        <div>
          <p class="section-index">02</p>
          <h4 id="computed-result-title">查看缓存快照</h4>
        </div>
        <p>{{ snapshot.label }}</p>
      </div>

      <div class="result-value">
        <span>最后读取结果</span>
        <strong>{{ snapshot.value }}</strong>
      </div>

      <div class="stats" aria-label="计算属性运行状态">
        <div class="stat">
          <span>getter 执行次数</span>
          <strong>{{ snapshot.runs }}</strong>
        </div>
        <div class="stat">
          <span>当前备注</span>
          <strong>{{ note || '空' }}</strong>
        </div>
      </div>

      <div class="dependencies">
        <span>本次实际依赖</span>
        <div v-if="snapshot.dependencies.length" class="dependency-list">
          <code v-for="dependency in snapshot.dependencies" :key="dependency">
            {{ dependency }}
          </code>
        </div>
        <p v-else>第一次读取后显示</p>
      </div>

      <p class="instrument-note">
        执行次数与依赖列表是教学仪表。业务 computed getter 应保持纯计算，不写入外部状态。
      </p>
    </section>
  </article>
</template>

<style scoped>
.computed-demo {
  width: 100%;
  max-width: 760px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg-sunken);
}

.demo-header,
.experiment-section,
.result-section {
  padding: 20px;
}

.demo-header {
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-elevated);
}

.eyebrow,
.section-index {
  color: var(--color-accent);
  font-size: var(--font-size-xs);
  font-weight: 700;
}

.demo-header h3 {
  margin-top: 4px;
  color: var(--color-text-primary);
  font-size: var(--font-size-lg);
  line-height: 1.25;
}

.demo-header > p:last-child {
  margin-top: 8px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.6;
}

.experiment-section {
  border-bottom: 1px solid var(--color-border);
}

.result-section {
  background: var(--color-bg-elevated);
}

.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.section-heading > div {
  margin-right: 18px;
}

.section-heading h4 {
  margin-top: 3px;
  color: var(--color-text-primary);
  font-size: var(--font-size-md);
  line-height: 1.35;
}

.section-heading > p {
  max-width: 360px;
  margin-top: 6px;
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
  line-height: 1.55;
}

.controls {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  margin-right: -12px;
}

.field {
  display: flex;
  flex: 1 1 220px;
  flex-direction: column;
  min-width: 0;
  margin-right: 12px;
  margin-bottom: 12px;
}

.field span,
.result-value span,
.stat span,
.dependencies > span {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.field input {
  width: 100%;
  min-width: 0;
  min-height: 44px;
  margin-top: 6px;
  padding: 9px 11px;
  border: 1px solid var(--color-border);
  border-radius: 7px;
  background: var(--color-bg-elevated);
  color: var(--color-text-primary);
  font: inherit;
}

.field input:focus-visible,
.actions button:focus-visible,
.discount-toggle:focus-within {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.discount-toggle {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
}

.discount-toggle input {
  width: 18px;
  height: 18px;
  margin-right: 8px;
  accent-color: var(--color-accent);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  margin-top: 10px;
}

.actions button {
  min-height: 44px;
  margin-right: 10px;
  margin-bottom: 8px;
  padding: 9px 15px;
  border: 1px solid var(--color-border-strong);
  border-radius: 7px;
  background: var(--color-bg-elevated);
  color: var(--color-text-primary);
  font: inherit;
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  transition:
    border-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.actions button:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.actions button:active {
  transform: scale(0.98);
}

.result-value {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  min-height: 56px;
  padding: 12px 0;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
}

.result-value strong {
  margin-left: 16px;
  color: var(--color-accent);
  font-size: 26px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.stats {
  display: flex;
  flex-wrap: wrap;
  padding: 14px 0 2px;
}

.stat {
  min-width: 150px;
  margin-right: 32px;
  margin-bottom: 12px;
}

.stat strong {
  display: block;
  min-height: 24px;
  margin-top: 4px;
  color: var(--color-text-primary);
  font-size: var(--font-size-md);
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}

.dependencies {
  padding-top: 12px;
  border-top: 1px solid var(--color-border);
}

.dependency-list {
  display: flex;
  flex-wrap: wrap;
  margin-top: 7px;
}

.dependency-list code {
  margin-right: 7px;
  margin-bottom: 7px;
  padding: 4px 8px;
  border: 1px solid var(--color-border);
  border-radius: 5px;
  background: var(--color-bg-sunken);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
}

.dependencies > p {
  margin-top: 7px;
  color: var(--color-text-tertiary);
  font-size: var(--font-size-sm);
}

.instrument-note {
  margin-top: 11px;
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
  line-height: 1.55;
}

@media (max-width: 520px) {
  .demo-header,
  .experiment-section,
  .result-section {
    padding: 16px;
  }

  .controls {
    margin-right: 0;
  }

  .field {
    flex-basis: 100%;
    margin-right: 0;
  }

  .actions {
    flex-direction: column;
  }

  .actions button {
    width: 100%;
    margin-right: 0;
  }

  .result-value {
    align-items: flex-start;
    flex-direction: column;
  }

  .result-value strong {
    margin-top: 8px;
    margin-left: 0;
  }

  .stat {
    width: 100%;
    margin-right: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .actions button {
    transition-property: color;
  }

  .actions button:active {
    transform: none;
  }
}
</style>
