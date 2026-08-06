<script setup lang="ts">
import { ref } from 'vue'
import CourseActionPanel from './parts/CourseActionPanel.vue'

const initialQuantity = 2
const minimum = 0
const maximum = 5
const quantity = ref(initialQuantity)
const lastDecision = ref('尚无子级请求，父级等待裁决。')
const acceptedCount = ref(0)
const rejectedCount = ref(0)

/** 裁决子组件的变化请求，并仅在候选数量合法时更新父级状态。 */
function applyChange(delta: number): void {
  const candidate = quantity.value + delta
  const action = delta > 0 ? '增加' : '减少'

  if (candidate < minimum || candidate > maximum) {
    rejectedCount.value += 1
    lastDecision.value = `子级请求${action}到 ${candidate}，父级决定拒绝：允许范围是 ${minimum} 至 ${maximum}。`
    return
  }

  quantity.value = candidate
  acceptedCount.value += 1
  lastDecision.value = `子级请求${action}到 ${candidate}，父级决定接受并更新数量。`
}

/** 接受子组件的重置请求，并恢复父级定义的初始数量。 */
function resetQuantity(): void {
  quantity.value = initialQuantity
  acceptedCount.value += 1
  lastDecision.value = `子级请求重置，父级决定接受并恢复为 ${initialQuantity}。`
}

/** 不经过子组件事件，直接把父级拥有的数量设为最小值。 */
function setToMinimum(): void {
  quantity.value = minimum
  lastDecision.value = `没有子级请求，父级直接把数量设为最小值 ${minimum}。`
}
</script>

<template>
  <article class="emits-flow-demo">
    <header class="demo-header">
      <p class="eyebrow">Emits 意图回路实验台</p>
      <h3>子级请求，父级决定</h3>
      <p>子组件发出变化意图，父组件裁决后再把最终数量通过 Props 返回。</p>
    </header>

    <div class="demo-body">
      <section class="parent-panel" aria-labelledby="parent-decision-title">
        <header class="panel-heading">
          <p>01 · 状态所有者</p>
          <h4 id="parent-decision-title">父组件裁决面板</h4>
        </header>

        <dl class="parent-state">
          <div>
            <dt>当前 quantity</dt>
            <dd>{{ quantity }}</dd>
          </div>
          <div>
            <dt>允许范围</dt>
            <dd>{{ minimum }} 至 {{ maximum }}</dd>
          </div>
          <div>
            <dt>父级接受次数</dt>
            <dd>{{ acceptedCount }}</dd>
          </div>
          <div>
            <dt>父级拒绝次数</dt>
            <dd>{{ rejectedCount }}</dd>
          </div>
        </dl>

        <div class="decision-status">
          <p class="status-label">最近决定</p>
          <p aria-live="polite">{{ lastDecision }}</p>
        </div>

        <button type="button" class="owner-action" @click="setToMinimum">父级直接设为最小值</button>
      </section>

      <div class="child-panel">
        <CourseActionPanel
          :quantity="quantity"
          :minimum="minimum"
          :maximum="maximum"
          @change-request="applyChange"
          @reset-request="resetQuantity"
        />
      </div>
    </div>
  </article>
</template>

<style scoped>
.emits-flow-demo {
  width: 100%;
  max-width: 900px;
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg-elevated);
}

.demo-header {
  padding: 22px;
  border-bottom: 1px solid var(--color-border);
}

.eyebrow,
.panel-heading p {
  color: var(--color-accent);
  font-size: var(--font-size-xs);
  font-weight: 700;
}

.demo-header h3 {
  margin-top: 5px;
  color: var(--color-text);
  font-size: var(--font-size-lg);
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.demo-header > p:last-child {
  margin-top: 8px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.demo-body {
  display: flex;
  align-items: stretch;
  padding: 22px;
}

.parent-panel,
.child-panel {
  width: calc(50% - 7px);
  min-width: 0;
}

.parent-panel {
  padding: 18px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg-sunken);
}

.child-panel {
  margin-left: 14px;
}

.panel-heading {
  padding-bottom: 14px;
  border-bottom: 1px solid var(--color-border);
}

.panel-heading h4 {
  margin-top: 4px;
  color: var(--color-text);
  font-size: var(--font-size-md);
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.parent-state {
  margin-top: 14px;
}

.parent-state > div {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  min-width: 0;
  padding: 9px 0;
  border-bottom: 1px solid var(--color-border);
}

.parent-state dt,
.parent-state dd {
  min-width: 0;
  font-size: var(--font-size-sm);
  line-height: 1.45;
  overflow-wrap: anywhere;
}

.parent-state dt {
  flex: 1 1 auto;
  color: var(--color-text-secondary);
}

.parent-state dd {
  flex: 0 1 auto;
  margin-left: 12px;
  color: var(--color-text);
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-weight: 700;
  text-align: right;
}

.decision-status {
  min-width: 0;
  margin-top: 16px;
  padding: 14px;
  border-left: 3px solid var(--color-warning);
  background: var(--color-warning-bg);
}

.decision-status p {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.55;
  overflow-wrap: anywhere;
}

.decision-status .status-label {
  margin-bottom: 4px;
  color: var(--color-text);
  font-size: var(--font-size-xs);
  font-weight: 700;
}

.owner-action {
  width: 100%;
  min-height: 44px;
  margin-top: 14px;
  padding: 9px 12px;
  border: 1px solid var(--color-text-secondary);
  border-radius: 7px;
  background: var(--color-bg-elevated);
  color: var(--color-text);
  font: inherit;
  font-size: var(--font-size-sm);
  font-weight: 600;
  line-height: 1.35;
  white-space: normal;
  overflow-wrap: anywhere;
  cursor: pointer;
  transition:
    border-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.owner-action:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.owner-action:active {
  transform: scale(0.98);
}

.owner-action:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

@media (max-width: 680px) {
  .demo-body {
    flex-direction: column;
    padding: 18px;
  }

  .parent-panel,
  .child-panel {
    width: 100%;
  }

  .child-panel {
    margin-top: 14px;
    margin-left: 0;
  }
}

@media (max-width: 480px) {
  .demo-header,
  .demo-body {
    padding: 16px;
  }

  .parent-panel {
    padding: 16px;
  }

  .parent-state > div {
    align-items: flex-start;
    flex-direction: column;
  }

  .parent-state dd {
    margin-top: 3px;
    margin-left: 0;
    text-align: left;
  }
}

@media (prefers-reduced-motion: reduce) {
  .owner-action {
    transition:
      border-color var(--duration-fast) linear,
      color var(--duration-fast) linear;
  }

  .owner-action:active {
    transform: none;
  }
}
</style>
