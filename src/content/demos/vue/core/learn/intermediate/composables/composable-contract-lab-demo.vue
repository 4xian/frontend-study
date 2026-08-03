<script setup lang="ts">
import { computed, ref } from 'vue'
import { composableCounterTickEvent, useEventCounter } from './useEventCounter'

const baseStep = ref(1)
const { count: countA, running: runningA, reset: resetA } = useEventCounter(baseStep)
const {
  count: countB,
  running: runningB,
  start: startB,
  stop: stopB,
} = useEventCounter(() => baseStep.value * 2)
const currentStepA = computed(() => baseStep.value)
const currentStepB = computed(() => baseStep.value * 2)

/** 派发一次两个 composable 实例共同监听的浏览器事件。 */
function dispatchSharedTick(): void {
  window.dispatchEvent(new Event(composableCounterTickEvent))
}

/** 把基础步长设为三，验证 ref 与 getter 输入会同步更新。 */
function setBaseStepToThree(): void {
  baseStep.value = 3
}

/** 在停止与重启之间切换实例 B 的外部事件监听。 */
function toggleCounterB(): void {
  if (runningB.value) {
    stopB()
    return
  }

  startB()
}
</script>

<template>
  <article class="composable-contract-demo">
    <header class="demo-header">
      <p class="eyebrow">组合式函数契约实验台</p>
      <h3>同一事件，独立状态，实时响应式输入</h3>
      <p>两个 composable 共享 tick 来源，但分别维护计数与监听生命周期。</p>
    </header>

    <section class="step-panel" aria-labelledby="composable-step-title">
      <div class="step-summary">
        <p class="section-number">01 · 响应式输入</p>
        <h4 id="composable-step-title">基础步长：{{ baseStep }}</h4>
        <p>A 直接接收 ref；B 接收 getter，并始终取基础步长的两倍。</p>
      </div>
      <button type="button" class="secondary-action" @click="setBaseStepToThree">
        将基础步长设为 3
      </button>
    </section>

    <div class="counter-list">
      <section class="counter-card" aria-labelledby="composable-counter-a-title">
        <header class="counter-heading">
          <div>
            <p class="section-number">02 · ref 输入</p>
            <h4 id="composable-counter-a-title">计数器 A</h4>
          </div>
          <span class="listener-status" :class="{ inactive: !runningA }">
            {{ runningA ? '运行中' : '已停止' }}
          </span>
        </header>

        <dl class="counter-stats">
          <div>
            <dt>当前计数</dt>
            <dd aria-live="polite">{{ countA }}</dd>
          </div>
          <div>
            <dt>本次步长</dt>
            <dd>{{ currentStepA }}</dd>
          </div>
        </dl>

        <button type="button" class="card-action" @click="resetA">仅重置计数器 A</button>
      </section>

      <section class="counter-card" aria-labelledby="composable-counter-b-title">
        <header class="counter-heading">
          <div>
            <p class="section-number">03 · getter 输入</p>
            <h4 id="composable-counter-b-title">计数器 B</h4>
          </div>
          <span class="listener-status" :class="{ inactive: !runningB }">
            {{ runningB ? '运行中' : '已停止' }}
          </span>
        </header>

        <dl class="counter-stats">
          <div>
            <dt>当前计数</dt>
            <dd aria-live="polite">{{ countB }}</dd>
          </div>
          <div>
            <dt>本次步长</dt>
            <dd>{{ currentStepB }}</dd>
          </div>
        </dl>

        <button type="button" class="card-action" @click="toggleCounterB">
          {{ runningB ? '停止计数器 B 监听' : '重新启动计数器 B 监听' }}
        </button>
      </section>
    </div>

    <section class="event-console" aria-labelledby="composable-event-title">
      <div>
        <p class="section-number">04 · 共享外部事件</p>
        <h4 id="composable-event-title">派发一次 tick</h4>
        <p>监听中的实例会按事件发生时的步长增长；已停止的实例保持不变。</p>
      </div>
      <button type="button" class="primary-action" @click="dispatchSharedTick">
        触发共享 tick
      </button>
    </section>
  </article>
</template>

<style scoped>
.composable-contract-demo {
  width: 100%;
  max-width: 920px;
  min-width: 0;
}

.demo-header {
  padding: 22px;
  border-bottom: 1px solid var(--color-border);
}

.eyebrow,
.section-number {
  color: var(--color-accent);
  font-size: var(--font-size-xs);
  font-weight: 700;
}

.demo-header h3,
.step-summary h4,
.counter-heading h4,
.event-console h4 {
  color: var(--color-text);
  overflow-wrap: anywhere;
}

.demo-header h3 {
  margin-top: 5px;
  font-size: var(--font-size-lg);
  line-height: 1.35;
}

.demo-header > p:last-child,
.step-summary > p:last-child,
.event-console > div > p:last-child {
  margin-top: 8px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.step-panel,
.event-console {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
  padding: 18px 22px;
}

.step-panel {
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-sunken);
}

.step-summary,
.event-console > div {
  flex: 1 1 auto;
  min-width: 0;
}

.step-summary h4,
.event-console h4,
.counter-heading h4 {
  margin-top: 4px;
  font-size: var(--font-size-md);
  line-height: 1.4;
}

.counter-list {
  display: flex;
  flex-wrap: wrap;
  min-width: 0;
  padding: 15px;
}

.counter-card {
  width: calc(50% - 14px);
  min-width: 0;
  margin: 7px;
  padding: 18px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg-sunken);
}

.counter-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  min-width: 0;
}

.counter-heading > div {
  min-width: 0;
}

.listener-status {
  flex: 0 0 auto;
  margin-left: 12px;
  padding: 4px 8px;
  border-radius: 999px;
  background: var(--color-accent-soft);
  color: var(--color-accent);
  font-size: var(--font-size-xs);
  font-weight: 700;
  line-height: 1.4;
}

.listener-status.inactive {
  background: var(--color-bg-elevated);
  color: var(--color-text-tertiary);
}

.counter-stats {
  display: flex;
  min-width: 0;
  margin: 18px -5px 0;
}

.counter-stats > div {
  flex: 1 1 0;
  min-width: 0;
  margin: 0 5px;
  padding: 4px 12px;
}

.counter-stats > div + div {
  border-left: 1px solid var(--color-border);
}

.counter-stats dt {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
  line-height: 1.4;
}

.counter-stats dd {
  margin-top: 5px;
  color: var(--color-text);
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: var(--font-size-xl);
  font-weight: 750;
  line-height: 1.2;
  overflow-wrap: anywhere;
  transition:
    color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.card-action,
.secondary-action,
.primary-action {
  min-width: 0;
  min-height: 44px;
  padding: 9px 13px;
  border: 1px solid var(--color-accent);
  border-radius: 7px;
  background: var(--color-bg-elevated);
  color: var(--color-accent);
  font: inherit;
  font-size: var(--font-size-sm);
  font-weight: 650;
  line-height: 1.4;
  white-space: normal;
  overflow-wrap: anywhere;
  cursor: pointer;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.card-action {
  width: 100%;
  margin-top: 14px;
}

.secondary-action,
.primary-action {
  flex: 0 1 210px;
  margin-left: 18px;
}

.card-action:hover,
.secondary-action:hover,
.primary-action {
  background: var(--color-accent);
  color: var(--color-on-accent);
}

.primary-action:hover {
  opacity: 0.86;
}

.card-action:active,
.secondary-action:active,
.primary-action:active {
  transform: scale(0.98);
}

.card-action:focus-visible,
.secondary-action:focus-visible,
.primary-action:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.event-console {
  border-top: 1px solid var(--color-border);
}

@media (max-width: 520px) {
  .demo-header,
  .step-panel,
  .event-console {
    padding: 18px;
  }

  .step-panel,
  .event-console {
    align-items: stretch;
    flex-direction: column;
  }

  .secondary-action,
  .primary-action {
    width: 100%;
    flex: 0 0 auto;
    margin-top: 14px;
    margin-left: 0;
  }

  .counter-list {
    flex-direction: column;
    padding: 11px;
  }

  .counter-card {
    width: auto;
    margin: 5px;
    padding: 16px;
  }

  .counter-heading {
    align-items: stretch;
    flex-direction: column;
  }

  .listener-status {
    align-self: flex-start;
    margin-top: 10px;
    margin-left: 0;
  }
}

@media (max-width: 360px) {
  .counter-stats {
    flex-direction: column;
    margin-right: 0;
    margin-left: 0;
  }

  .counter-stats > div {
    margin-right: 0;
    margin-left: 0;
  }

  .counter-stats > div + div {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid var(--color-border);
    border-left: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .counter-stats dd,
  .card-action,
  .secondary-action,
  .primary-action {
    transition:
      background-color var(--duration-fast) linear,
      border-color var(--duration-fast) linear,
      color var(--duration-fast) linear;
  }

  .card-action:active,
  .secondary-action:active,
  .primary-action:active {
    transform: none;
  }
}
</style>
