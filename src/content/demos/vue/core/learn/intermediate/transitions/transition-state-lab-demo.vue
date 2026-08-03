<script setup lang="ts">
import { computed, ref } from 'vue'

type ViewId = 'summary' | 'details'

interface TopicItem {
  id: 'alpha' | 'beta' | 'gamma'
  label: string
}

const initialTopics: TopicItem[] = [
  { id: 'alpha', label: 'Alpha' },
  { id: 'beta', label: 'Beta' },
  { id: 'gamma', label: 'Gamma' },
]

const noticeVisible = ref(true)
const activeView = ref<ViewId>('summary')
const topics = ref<TopicItem[]>(initialTopics.map((item) => ({ ...item })))

const noticeState = computed(() => (noticeVisible.value ? '已显示' : '已隐藏'))
const activeViewLabel = computed(() => (activeView.value === 'summary' ? '摘要视图' : '详细视图'))
const switchViewLabel = computed(() =>
  activeView.value === 'summary' ? '切换到详细视图' : '切换到摘要视图',
)
const summary = computed(
  () =>
    `通知：${noticeState.value}；视图：${activeView.value === 'summary' ? '摘要' : '详情'}；顺序：${topics.value.map((item) => item.label).join(' → ')}`,
)

/** 切换通知节点的存在状态。 */
function toggleNotice(): void {
  noticeVisible.value = !noticeVisible.value
}

/** 在摘要与详情身份之间切换。 */
function switchView(): void {
  activeView.value = activeView.value === 'summary' ? 'details' : 'summary'
}

/** 把最后一项稳定地轮换到列表首位。 */
function rotateTopics(): void {
  topics.value = [topics.value.at(-1)!, ...topics.value.slice(0, -1)]
}

/** 恢复三个实验区的初始业务状态。 */
function resetLab(): void {
  noticeVisible.value = true
  activeView.value = 'summary'
  topics.value = initialTopics.map((item) => ({ ...item }))
}
</script>

<template>
  <article class="transition-state-lab-demo">
    <header class="demo-heading">
      <p class="eyebrow">过渡身份实验台</p>
      <h3>让存在、身份和列表顺序各自表达真实变化</h3>
      <p>操作三个区域，观察视觉过程与最终业务状态如何保持分离。</p>
    </header>

    <p
      class="summary-line"
      data-state="transition-summary"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ summary }}
    </p>

    <section class="lab-section" aria-labelledby="transition-presence-title">
      <div class="section-heading">
        <p class="section-number">01 · Presence</p>
        <h4 id="transition-presence-title">通知是否存在</h4>
        <p>
          通知：<strong data-state="notice">{{ noticeState }}</strong>
        </p>
      </div>

      <div class="transition-surface">
        <Transition name="lab">
          <p v-if="noticeVisible" data-testid="transition-notice" class="notice-message">
            资料已保存，可以继续学习。
          </p>
        </Transition>
      </div>

      <div class="control-row">
        <button type="button" @click="toggleNotice">
          {{ noticeVisible ? '隐藏通知' : '显示通知' }}
        </button>
      </div>
    </section>

    <section class="lab-section" aria-labelledby="transition-identity-title">
      <div class="section-heading">
        <p class="section-number">02 · Identity</p>
        <h4 id="transition-identity-title">互斥视图交接</h4>
        <p>
          当前视图：<strong data-state="active-view">{{ activeViewLabel }}</strong>
        </p>
      </div>

      <div class="transition-surface">
        <Transition name="lab" mode="out-in">
          <p :key="activeView" data-testid="keyed-view" :data-view="activeView" class="keyed-view">
            {{ activeViewLabel }}
          </p>
        </Transition>
      </div>

      <div class="control-row">
        <button type="button" @click="switchView">{{ switchViewLabel }}</button>
      </div>
    </section>

    <section class="lab-section" aria-labelledby="transition-list-title">
      <div class="section-heading">
        <p class="section-number">03 · Collection</p>
        <h4 id="transition-list-title">稳定业务 key 的列表重排</h4>
        <p>每次把最后一项移到首位，最终 DOM 顺序就是结果。</p>
      </div>

      <TransitionGroup name="topic" tag="ol" class="topic-list" data-testid="transition-topic-list">
        <li v-for="topic in topics" :key="topic.id">{{ topic.label }}</li>
      </TransitionGroup>

      <div class="control-row">
        <button type="button" @click="rotateTopics">轮换顺序</button>
        <button type="button" class="secondary-button" @click="resetLab">重置实验</button>
      </div>
    </section>
  </article>
</template>

<style scoped>
.transition-state-lab-demo {
  width: 100%;
  max-width: 920px;
  min-width: 0;
}

.demo-heading,
.section-heading,
.transition-surface,
.topic-list,
.control-row {
  min-width: 0;
}

.demo-heading {
  padding: 4px 2px 2px;
}

.eyebrow,
.section-number {
  color: var(--color-accent);
  font-size: var(--font-size-xs);
  font-weight: 700;
  letter-spacing: 0;
}

.demo-heading h3,
.section-heading h4 {
  color: var(--color-text);
  overflow-wrap: anywhere;
}

.demo-heading h3 {
  margin-top: 5px;
  font-size: var(--font-size-lg);
  line-height: 1.35;
}

.demo-heading > p:last-child,
.section-heading > p:last-child {
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

.lab-section {
  min-width: 0;
  padding: 20px 2px;
  border-top: 1px solid var(--color-border);
}

.lab-section:first-of-type {
  margin-top: 18px;
}

.section-heading h4 {
  margin-top: 4px;
  font-size: var(--font-size-md);
  line-height: 1.4;
}

.section-heading strong {
  color: var(--color-text);
}

.transition-surface {
  display: flex;
  align-items: center;
  min-height: 62px;
  margin-top: 14px;
}

.notice-message,
.keyed-view {
  width: 100%;
  min-width: 0;
  margin: 0;
  padding: 12px 14px;
  border: 1px solid var(--color-border);
  border-radius: 7px;
  background: var(--color-bg-sunken);
  color: var(--color-text);
  line-height: 1.55;
  overflow-wrap: anywhere;
}

.keyed-view {
  border-left: 3px solid var(--color-accent);
  font-weight: 650;
}

.control-row {
  display: flex;
  flex-wrap: wrap;
  margin: 9px -5px -5px;
}

.control-row button {
  min-width: 0;
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
  white-space: normal;
  overflow-wrap: anywhere;
  cursor: pointer;
  transition:
    opacity var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.control-row button:hover {
  opacity: 0.88;
}

.control-row button:active {
  transform: scale(0.98);
}

.control-row button:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--color-accent) 28%, transparent);
  outline-offset: 2px;
}

.control-row .secondary-button {
  background: var(--color-bg-elevated);
  color: var(--color-accent);
}

.topic-list {
  margin: 14px 0 0;
  padding-left: 30px;
}

.topic-list li {
  min-width: 0;
  padding: 10px 12px;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text);
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.topic-list li::marker {
  color: var(--color-accent);
  font-weight: 700;
}

.lab-enter-active,
.lab-leave-active,
.topic-enter-active,
.topic-leave-active,
.topic-move {
  transition:
    opacity 220ms ease,
    transform 220ms ease;
}

.lab-enter-from,
.lab-leave-to,
.topic-enter-from,
.topic-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@media (max-width: 480px) {
  .control-row {
    flex-direction: column;
    margin-right: 0;
    margin-left: 0;
  }

  .control-row button {
    width: 100%;
    margin-right: 0;
    margin-left: 0;
  }

  .topic-list {
    padding-left: 26px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .control-row button,
  .lab-enter-active,
  .lab-leave-active,
  .topic-enter-active,
  .topic-leave-active,
  .topic-move {
    transition: none;
  }

  .control-row button:active,
  .lab-enter-from,
  .lab-leave-to,
  .topic-enter-from,
  .topic-leave-to {
    transform: none;
  }

  .lab-enter-from,
  .lab-leave-to,
  .topic-enter-from,
  .topic-leave-to {
    opacity: 1;
  }
}
</style>
