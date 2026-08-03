<script setup lang="ts">
import { computed, defineComponent, h, ref, shallowRef } from 'vue'
import type { Component } from 'vue'

type BoundaryPhase = 'pending' | 'fallback' | 'resolved'
type BoundaryEventName = 'pending' | 'fallback' | 'resolve'
type BoundaryMode = 'immediate' | 'delayed'

interface BoundaryEvent {
  id: number
  mode: BoundaryMode
  round: number
  name: BoundaryEventName
}

const ASYNC_DELAY = 500
const DELAYED_FALLBACK = 1200

const immediateRound = ref(1)
const delayedRound = ref(1)
const immediatePhase = ref<BoundaryPhase>('pending')
const delayedPhase = ref<BoundaryPhase>('pending')
const eventLog = ref<BoundaryEvent[]>([])
let nextEventId = 0

/** 创建一轮会在固定演示延迟后完成的 async setup 根组件。 */
function createAsyncRound(mode: BoundaryMode, roundNumber: number): Component {
  return defineComponent({
    name: `SuspenseLab${mode}Round${roundNumber}`,
    /** 等待演示延迟后返回该轮正式内容。 */
    async setup() {
      await new Promise<void>((resolve) => setTimeout(resolve, ASYNC_DELAY))
      return () =>
        h(
          'section',
          {
            class: 'resolved-content',
            'data-testid': `resolved-content-${mode}`,
          },
          [
            h('p', { class: 'panel-kicker' }, `Round ${roundNumber}`),
            h('h4', `第 ${roundNumber} 轮内容`),
            h('p', '这一轮 async setup 已完成，完整 default 根现在可以进入真实容器。'),
          ],
        )
    },
  })
}

const immediateComponent = shallowRef(createAsyncRound('immediate', immediateRound.value))
const delayedComponent = shallowRef(createAsyncRound('delayed', delayedRound.value))

const summary = computed(
  () =>
    `立即边界：${getPhaseLabel(immediatePhase.value)}；延迟边界：${getPhaseLabel(delayedPhase.value)}`,
)

/** 把边界阶段转换为学习者可读的状态。 */
function getPhaseLabel(phase: BoundaryPhase): string {
  if (phase === 'pending') return '等待新根'
  if (phase === 'fallback') return '显示后备内容'
  return '正式内容已解析'
}

/** 记录 Suspense 公开事件及其所属轮次。 */
function recordEvent(mode: BoundaryMode, name: BoundaryEventName): void {
  const currentRound = mode === 'immediate' ? immediateRound.value : delayedRound.value
  const phase = name === 'resolve' ? 'resolved' : name
  if (mode === 'immediate') immediatePhase.value = phase
  else delayedPhase.value = phase
  eventLog.value.push({ id: nextEventId++, mode, round: currentRound, name })
}

/** 替换 timeout 0 边界的 default 根。 */
function startImmediateRound(): void {
  immediateRound.value += 1
  immediateComponent.value = createAsyncRound('immediate', immediateRound.value)
}

/** 替换 timeout 1200 边界的 default 根。 */
function startDelayedRound(): void {
  delayedRound.value += 1
  delayedComponent.value = createAsyncRound('delayed', delayedRound.value)
}

/** 清空公开事件日志，不重建当前 Suspense 边界。 */
function clearEvents(): void {
  eventLog.value = []
}
</script>

<template>
  <article class="suspense-boundary-lab-demo">
    <header class="demo-heading">
      <p class="eyebrow">Suspense 边界实验台</p>
      <h3>比较立即 fallback 与保留旧内容</h3>
      <p>每次命令都会替换 default 根；事件日志只记录公开的 pending、fallback 与 resolve。</p>
    </header>

    <p
      class="summary-line"
      data-testid="boundary-phase"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ summary }}
    </p>

    <div class="command-row" aria-label="Suspense 实验命令">
      <button type="button" data-testid="show-fallback-now" @click="startImmediateRound">
        立即显示后备内容
      </button>
      <button type="button" data-testid="keep-stale-content" @click="startDelayedRound">
        保留旧内容
      </button>
      <button type="button" data-testid="clear-suspense-events" @click="clearEvents">
        清空事件
      </button>
    </div>

    <section class="boundary-stage" aria-labelledby="suspense-stage-title">
      <div class="section-heading">
        <p class="section-number">01 · Boundary output</p>
        <h4 id="suspense-stage-title">当前活动分支</h4>
      </div>

      <section class="boundary-case" aria-labelledby="immediate-boundary-title">
        <div class="case-heading">
          <h4 id="immediate-boundary-title">timeout 0 · 立即 fallback</h4>
          <p>当前目标：第 {{ immediateRound }} 轮</p>
        </div>
        <Suspense
          :timeout="0"
          @pending="recordEvent('immediate', 'pending')"
          @fallback="recordEvent('immediate', 'fallback')"
          @resolve="recordEvent('immediate', 'resolve')"
        >
          <component :is="immediateComponent" :key="immediateRound" />

          <template #fallback>
            <section
              class="fallback-content"
              data-testid="fallback-content-immediate"
              aria-busy="true"
            >
              <p class="panel-kicker">Fallback</p>
              <h4>正在准备第 {{ immediateRound }} 轮内容</h4>
              <p>timeout 为 0，因此根替换后立即显示后备分支。</p>
            </section>
          </template>
        </Suspense>
      </section>

      <section class="boundary-case" aria-labelledby="delayed-boundary-title">
        <div class="case-heading">
          <h4 id="delayed-boundary-title">timeout 1200 · 保留旧内容</h4>
          <p>当前目标：第 {{ delayedRound }} 轮</p>
        </div>
        <Suspense
          :timeout="DELAYED_FALLBACK"
          @pending="recordEvent('delayed', 'pending')"
          @fallback="recordEvent('delayed', 'fallback')"
          @resolve="recordEvent('delayed', 'resolve')"
        >
          <component :is="delayedComponent" :key="delayedRound" />

          <template #fallback>
            <section
              class="fallback-content"
              data-testid="fallback-content-delayed"
              aria-busy="true"
            >
              <p class="panel-kicker">Fallback</p>
              <h4>正在准备第 {{ delayedRound }} 轮内容</h4>
              <p>只有依赖超过 1200ms 时，这个后备分支才会实际出现。</p>
            </section>
          </template>
        </Suspense>
      </section>
    </section>

    <section class="event-section" aria-labelledby="suspense-events-title">
      <div class="section-heading">
        <p class="section-number">02 · Public events</p>
        <h4 id="suspense-events-title">事件日志</h4>
      </div>
      <p v-if="eventLog.length === 0" class="empty-log" data-testid="empty-event-log">暂无事件</p>
      <ol v-else data-testid="suspense-event-log">
        <li
          v-for="event in eventLog"
          :key="event.id"
          :data-event="event.name"
          :data-mode="event.mode"
          :data-round="event.round"
        >
          {{ event.mode === 'immediate' ? '立即边界' : '延迟边界' }} · 第 {{ event.round }} 轮 ·
          {{ event.name }}
        </li>
      </ol>
    </section>
  </article>
</template>

<style scoped>
.suspense-boundary-lab-demo {
  width: 100%;
  max-width: 920px;
  min-width: 0;
}

.demo-heading,
.command-row,
.boundary-stage,
.event-section,
.section-heading,
.boundary-case,
.case-heading,
.resolved-content,
.fallback-content {
  min-width: 0;
}

.demo-heading {
  padding: 4px 2px 2px;
}

.eyebrow,
.section-number,
.panel-kicker {
  color: var(--color-accent);
  font-size: var(--font-size-xs);
  font-weight: 700;
  letter-spacing: 0;
}

.demo-heading h3,
.section-heading h4,
.resolved-content h4,
.fallback-content h4 {
  color: var(--color-text);
  overflow-wrap: anywhere;
}

.demo-heading h3 {
  margin-top: 5px;
  font-size: var(--font-size-lg);
  line-height: 1.35;
}

.demo-heading > p:last-child,
.case-heading p,
.resolved-content > p:last-child,
.fallback-content > p:last-child,
.empty-log {
  margin-top: 8px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.summary-line {
  min-width: 0;
  margin-top: 16px;
  padding: 12px 14px;
  border-left: 3px solid var(--color-accent);
  background: var(--color-accent-soft);
  color: var(--color-text);
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: var(--font-size-sm);
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.command-row {
  display: flex;
  flex-wrap: wrap;
  margin: 11px -5px -5px;
}

.command-row button {
  min-width: 44px;
  min-height: 44px;
  margin: 5px;
  padding: 10px 16px;
  border: 1px solid var(--color-accent);
  border-radius: 7px;
  background: var(--color-accent);
  color: var(--color-on-accent);
  font: inherit;
  font-size: var(--font-size-sm);
  font-weight: 700;
  line-height: 1.4;
  overflow-wrap: anywhere;
  cursor: pointer;
  transition:
    opacity var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.command-row button:last-child {
  border-color: var(--color-border);
  background: var(--color-bg-elevated);
  color: var(--color-text);
}

.command-row button:hover {
  opacity: 0.86;
}

.command-row button:active {
  transform: scale(0.98);
}

.command-row button:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--color-accent) 28%, transparent);
  outline-offset: 2px;
}

.boundary-stage,
.event-section {
  padding: 20px 2px;
  border-top: 1px solid var(--color-border);
}

.boundary-stage {
  margin-top: 20px;
}

.boundary-case {
  min-height: 236px;
  padding: 18px 0;
}

.boundary-case + .boundary-case {
  border-top: 1px solid var(--color-border);
}

.case-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  margin: 0 -5px;
}

.case-heading h4,
.case-heading p {
  margin: 5px;
}

.case-heading p {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.section-heading h4,
.resolved-content h4,
.fallback-content h4 {
  margin-top: 4px;
  font-size: var(--font-size-md);
  line-height: 1.4;
}

.resolved-content,
.fallback-content {
  margin-top: 14px;
  padding: 18px;
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-accent);
  border-radius: 8px;
  background: var(--color-bg-sunken);
}

.fallback-content {
  border-left-color: var(--color-warning);
}

.event-section ol {
  margin: 14px 0 0;
  padding-left: 24px;
  color: var(--color-text-secondary);
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: var(--font-size-sm);
  line-height: 1.7;
}

.event-section li {
  padding: 3px 0;
  overflow-wrap: anywhere;
}

@media (max-width: 480px) {
  .command-row {
    flex-direction: column;
    margin-right: 0;
    margin-left: 0;
  }

  .command-row button {
    width: 100%;
    margin-right: 0;
    margin-left: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .command-row button {
    transition: none;
  }
}
</style>
