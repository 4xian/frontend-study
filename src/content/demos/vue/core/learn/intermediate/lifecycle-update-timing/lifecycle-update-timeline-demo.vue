<script setup lang="ts">
import { nextTick, onBeforeUpdate, onUpdated, ref } from 'vue'
import LifecycleChildPanel from './parts/LifecycleChildPanel.vue'

const count = ref(0)
const childVisible = ref(true)
const timeline = ref<string[]>([])
const pendingEntries: string[] = []
let recording = false

/** 仅在业务动作记录期间暂存一条生命周期事件。 */
function recordEntry(entry: string): void {
  if (recording) pendingEntries.push(entry)
}

/** 清空普通数组并开始记录一轮生命周期事件。 */
function beginRecording(): void {
  pendingEntries.length = 0
  recording = true
}

/** 先关闭记录门控，再一次性发布本轮完整时间线。 */
function publishTimeline(): void {
  recording = false
  timeline.value = [...pendingEntries]
}

/** 在同一同步任务中连续增加两次，并在本轮 DOM 更新后发布记录。 */
async function incrementTwice(): Promise<void> {
  beginRecording()
  count.value++
  count.value++
  await nextTick()
  publishTimeline()
}

/** 切换子组件的挂载状态，并在本轮 DOM 更新后发布记录。 */
async function toggleChild(): Promise<void> {
  beginRecording()
  childVisible.value = !childVisible.value
  await nextTick()
  publishTimeline()
}

/** 清空已发布记录，且不把这次界面更新计入业务时间线。 */
function clearTimeline(): void {
  recording = false
  timeline.value = []
}

onBeforeUpdate(() => recordEntry('父组件 onBeforeUpdate'))
onUpdated(() => recordEntry('父组件 onUpdated'))
</script>

<template>
  <article class="lifecycle-timeline-demo">
    <header class="demo-header">
      <p class="eyebrow">生命周期更新时序实验台</p>
      <h3>一轮更新，一条完整时间线</h3>
      <p>父级同步修改两次状态，等待本轮 Vue DOM flush 后再一次性发布父子钩子顺序。</p>
    </header>

    <section class="control-strip" aria-labelledby="lifecycle-control-title">
      <div class="control-summary">
        <p class="section-number">01 · 当前状态</p>
        <h4 id="lifecycle-control-title">父组件控制台</h4>
        <dl class="state-list">
          <div>
            <dt>父级 count</dt>
            <dd>{{ count }}</dd>
          </div>
          <div>
            <dt>子组件状态</dt>
            <dd>{{ childVisible ? '已挂载' : '已卸载' }}</dd>
          </div>
        </dl>
      </div>

      <div class="control-actions" aria-label="触发生命周期更新">
        <button type="button" class="primary-action" @click="incrementTwice">同步增加两次</button>
        <button type="button" @click="toggleChild">
          {{ childVisible ? '隐藏子组件' : '显示子组件' }}
        </button>
        <button type="button" class="quiet-action" @click="clearTimeline">清空记录</button>
      </div>
    </section>

    <div class="experiment-body">
      <section class="child-stage" aria-labelledby="lifecycle-child-stage-title">
        <header class="section-heading">
          <div>
            <p class="section-number">02 · 普通父子树</p>
            <h4 id="lifecycle-child-stage-title">子组件现场</h4>
          </div>
          <span class="mount-status">{{ childVisible ? '已挂载' : '已卸载' }}</span>
        </header>

        <LifecycleChildPanel v-if="childVisible" :count="count" @record-entry="recordEntry" />
        <div v-else class="unmounted-state">
          <strong>子组件已卸载</strong>
          <p>再次显示时会创建新的子组件实例，并记录 mount 钩子。</p>
        </div>
      </section>

      <section class="timeline-panel" aria-labelledby="lifecycle-timeline-title">
        <header class="section-heading">
          <div>
            <p class="section-number">03 · 本轮结果</p>
            <h4 id="lifecycle-timeline-title">生命周期时间线</h4>
          </div>
          <span class="entry-count">{{ timeline.length }} 项</span>
        </header>

        <div class="timeline-output" aria-live="polite" aria-atomic="true">
          <ol v-if="timeline.length" class="timeline-list">
            <li v-for="(entry, index) in timeline" :key="`${index}-${entry}`">
              <span class="entry-index">{{ index + 1 }}</span>
              <code>{{ entry }}</code>
            </li>
          </ol>
          <p v-else class="empty-timeline">尚无记录。执行一次状态更新或切换子组件。</p>
        </div>
      </section>
    </div>

    <dl class="timing-boundaries">
      <div>
        <dt>响应式状态</dt>
        <dd>两次 count++ 在同步代码中立即完成。</dd>
      </div>
      <div>
        <dt>Vue DOM flush</dt>
        <dd>时间线在 await nextTick() 后一次发布。</dd>
      </div>
      <div>
        <dt>浏览器绘制</dt>
        <dd>本实验不测量绘制帧，nextTick 也不承诺绘制完成。</dd>
      </div>
    </dl>
  </article>
</template>

<style scoped>
.lifecycle-timeline-demo {
  width: 100%;
  max-width: 920px;
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
.section-number {
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

.control-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
  padding: 18px 22px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-sunken);
}

.control-summary {
  flex: 1 1 auto;
  min-width: 0;
}

.control-summary h4,
.section-heading h4 {
  margin-top: 4px;
  color: var(--color-text);
  font-size: var(--font-size-md);
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.state-list {
  display: flex;
  flex-wrap: wrap;
  margin-top: 10px;
}

.state-list > div {
  min-width: 128px;
  margin-right: 24px;
  margin-top: 4px;
}

.state-list dt {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
}

.state-list dd {
  margin-top: 2px;
  color: var(--color-text);
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: var(--font-size-md);
  font-weight: 700;
  overflow-wrap: anywhere;
}

.control-actions {
  display: flex;
  flex: 0 1 430px;
  flex-wrap: wrap;
  justify-content: flex-end;
  min-width: 0;
  margin: -4px;
}

.control-actions button {
  min-height: 44px;
  min-width: 0;
  flex: 1 1 130px;
  margin: 4px;
  padding: 9px 12px;
  border: 1px solid var(--color-accent);
  border-radius: 7px;
  background: var(--color-bg-elevated);
  color: var(--color-accent);
  font: inherit;
  font-size: var(--font-size-sm);
  font-weight: 650;
  line-height: 1.35;
  white-space: normal;
  overflow-wrap: anywhere;
  cursor: pointer;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.control-actions button:hover,
.control-actions .primary-action {
  background: var(--color-accent);
  color: var(--color-on-accent);
}

.control-actions .quiet-action {
  border-color: var(--color-border-strong);
  color: var(--color-text-secondary);
}

.control-actions .quiet-action:hover {
  border-color: var(--color-text-secondary);
  background: var(--color-bg-elevated);
  color: var(--color-text);
}

.control-actions button:active {
  transform: scale(0.98);
}

.control-actions button:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.experiment-body {
  display: flex;
  align-items: stretch;
  min-width: 0;
  padding: 22px;
}

.child-stage,
.timeline-panel {
  width: calc(50% - 7px);
  min-width: 0;
}

.timeline-panel {
  margin-left: 14px;
}

.section-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  min-width: 0;
  padding-bottom: 13px;
  border-bottom: 1px solid var(--color-border);
}

.section-heading > div {
  min-width: 0;
}

.mount-status,
.entry-count {
  flex: 0 0 auto;
  margin-left: 12px;
  padding: 4px 8px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  line-height: 1.35;
}

.unmounted-state,
.timeline-output {
  min-width: 0;
  margin-top: 14px;
  padding: 18px;
  border: 1px dashed var(--color-border-strong);
  border-radius: 8px;
  background: var(--color-bg-sunken);
}

.unmounted-state {
  min-height: 190px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
}

.unmounted-state strong {
  color: var(--color-text);
  font-size: var(--font-size-md);
}

.unmounted-state p,
.empty-timeline {
  margin-top: 7px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.55;
  overflow-wrap: anywhere;
}

.timeline-output {
  min-height: 190px;
}

.timeline-list li {
  display: flex;
  align-items: flex-start;
  min-width: 0;
}

.timeline-list li + li {
  margin-top: 10px;
}

.entry-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  margin-right: 9px;
  border-radius: 50%;
  background: var(--color-accent-soft);
  color: var(--color-accent);
  font-size: var(--font-size-xs);
  font-weight: 700;
}

.timeline-list code {
  min-width: 0;
  padding-top: 2px;
  color: var(--color-text);
  font-size: var(--font-size-sm);
  line-height: 1.45;
  white-space: normal;
  overflow-wrap: anywhere;
}

.timing-boundaries {
  display: flex;
  align-items: stretch;
  min-width: 0;
  padding: 0 22px 22px;
}

.timing-boundaries > div {
  width: calc(33.333% - 8px);
  min-width: 0;
  padding: 13px;
  border-left: 3px solid var(--color-border-strong);
  background: var(--color-bg-sunken);
}

.timing-boundaries > div + div {
  margin-left: 12px;
}

.timing-boundaries dt {
  color: var(--color-text);
  font-size: var(--font-size-xs);
  font-weight: 700;
}

.timing-boundaries dd {
  margin-top: 4px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  line-height: 1.5;
  overflow-wrap: anywhere;
}

@media (max-width: 720px) {
  .control-strip,
  .experiment-body,
  .timing-boundaries {
    flex-direction: column;
  }

  .control-strip {
    align-items: stretch;
  }

  .control-actions {
    flex: 0 0 auto;
    justify-content: flex-start;
    margin-top: 14px;
  }

  .child-stage,
  .timeline-panel,
  .timing-boundaries > div {
    width: 100%;
  }

  .timeline-panel,
  .timing-boundaries > div + div {
    margin-top: 16px;
    margin-left: 0;
  }
}

@media (max-width: 480px) {
  .demo-header,
  .control-strip,
  .experiment-body {
    padding: 16px;
  }

  .state-list {
    flex-direction: column;
  }

  .state-list > div {
    margin-right: 0;
  }

  .control-actions {
    flex-direction: column;
    margin-right: 0;
    margin-left: 0;
    margin-bottom: 0;
  }

  .control-actions button {
    width: 100%;
    flex: 0 0 auto;
    margin: 8px 0 0;
  }

  .control-actions button:first-child {
    margin-top: 0;
  }

  .timing-boundaries {
    padding: 0 16px 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .control-actions button {
    transition:
      background-color var(--duration-fast) linear,
      border-color var(--duration-fast) linear,
      color var(--duration-fast) linear;
  }

  .control-actions button:active {
    transform: none;
  }
}
</style>
