<script setup lang="ts">
import { nextTick, onMounted, ref, useTemplateRef } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import ExposedSearchPanel from './parts/ExposedSearchPanel.vue'

interface ExposedSearchPanelApi {
  clearAndFocus: () => void
}

interface Topic {
  id: string
  name: string
}

type DomReferenceStatus = 'null' | 'HTMLInputElement'

const domInput = useTemplateRef<HTMLInputElement>('dom-input')
const searchPanel = useTemplateRef<ExposedSearchPanelApi>('search-panel')
const domInputVisible = ref(true)
const domReferenceStatus = ref<DomReferenceStatus>('null')
const focusedTopic = ref('尚未选择')
const topics = ref<Topic[]>([
  { id: 'template', name: '模板' },
  { id: 'api', name: 'API' },
  { id: 'source', name: '源码' },
])
const topicButtons = new Map<string, HTMLButtonElement>()

/** 根据当前模板引用值同步可观察的 DOM 引用状态。 */
function updateDomReferenceStatus(): void {
  domReferenceStatus.value =
    domInput.value instanceof HTMLInputElement ? 'HTMLInputElement' : 'null'
}

/** 切换输入框是否渲染，并等待 DOM 更新后读取最新引用。 */
async function toggleDomInput(): Promise<void> {
  domInputVisible.value = !domInputVisible.value
  await nextTick()
  updateDomReferenceStatus()
}

/** 通过 DOM 模板引用聚焦当前仍在页面中的输入框。 */
function focusDomInput(): void {
  domInput.value?.focus()
}

/** 调用子组件唯一公开的清空并聚焦命令。 */
function invokeChildCommand(): void {
  searchPanel.value?.clearAndFocus()
}

/** 按稳定业务 ID 登记或移除列表中的按钮元素。 */
function setTopicButton(id: string, element: Element | ComponentPublicInstance | null): void {
  if (element instanceof HTMLButtonElement) {
    topicButtons.set(id, element)
    return
  }

  topicButtons.delete(id)
}

/** 将列表首项移动到末尾，演示业务 ID 不随位置变化。 */
function rotateTopicOrder(): void {
  const [firstTopic, ...remainingTopics] = topics.value
  if (!firstTopic) return
  topics.value = [...remainingTopics, firstTopic]
}

/** 通过业务 ID 从 Map 中定位并聚焦 API 按钮。 */
function focusApiTopic(): void {
  const apiButton = topicButtons.get('api')
  if (!apiButton) return
  apiButton.focus()
  focusedTopic.value = 'API'
}

onMounted(updateDomReferenceStatus)
</script>

<template>
  <article class="template-ref-lab-demo">
    <header class="demo-header">
      <p class="eyebrow">模板引用实验台</p>
      <h3>在 DOM、组件和动态列表之间建立明确引用</h3>
      <p>分别观察引用的生命周期、子组件公开边界，以及不受列表顺序影响的元素索引。</p>
    </header>

    <div class="lab-body">
      <section class="lab-panel" aria-labelledby="dom-reference-title">
        <header class="panel-heading">
          <p>01 · DOM 引用</p>
          <h4 id="dom-reference-title">元素存在时才能访问</h4>
        </header>

        <div class="field-area">
          <label for="template-ref-dom-input">DOM 引用目标</label>
          <input
            v-if="domInputVisible"
            id="template-ref-dom-input"
            ref="dom-input"
            type="text"
            value="可被父组件直接聚焦"
          />
          <p v-else class="empty-state">输入框未渲染，模板引用已回到 null。</p>
        </div>

        <p class="status-line" aria-live="polite">引用状态：{{ domReferenceStatus }}</p>

        <div class="action-row" aria-label="DOM 引用操作">
          <button type="button" @click="toggleDomInput">
            {{ domInputVisible ? '隐藏输入框' : '显示输入框' }}
          </button>
          <button type="button" :disabled="!domInputVisible" @click="focusDomInput">
            聚焦输入框
          </button>
        </div>
      </section>

      <section class="lab-panel" aria-labelledby="component-reference-title">
        <header class="panel-heading">
          <p>02 · 组件引用</p>
          <h4 id="component-reference-title">只调用明确公开的能力</h4>
        </header>

        <ExposedSearchPanel ref="search-panel" />

        <button type="button" class="wide-action" @click="invokeChildCommand">
          调用子组件公开命令
        </button>
      </section>

      <section class="lab-panel list-panel" aria-labelledby="list-reference-title">
        <header class="panel-heading">
          <p>03 · 列表函数引用</p>
          <h4 id="list-reference-title">用稳定业务 ID 找到动态元素</h4>
        </header>

        <div class="topic-list" aria-label="学习主题列表">
          <button
            v-for="topic in topics"
            :key="topic.id"
            :ref="(element) => setTopicButton(topic.id, element)"
            :aria-label="topic.name"
            type="button"
            class="topic-button"
          >
            <span>{{ topic.name }}</span>
            <small>ID · {{ topic.id }}</small>
          </button>
        </div>

        <p class="status-line" aria-live="polite">当前聚焦：{{ focusedTopic }}</p>

        <div class="action-row" aria-label="列表引用操作">
          <button type="button" @click="rotateTopicOrder">轮换列表顺序</button>
          <button type="button" class="primary-action" @click="focusApiTopic">
            按 ID 聚焦 API
          </button>
        </div>
      </section>
    </div>
  </article>
</template>

<style scoped>
.template-ref-lab-demo {
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

.lab-body {
  display: flex;
  flex-wrap: wrap;
  min-width: 0;
  padding: 15px;
}

.lab-panel {
  width: calc(50% - 14px);
  min-width: 0;
  margin: 7px;
  padding: 18px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg-sunken);
}

.list-panel {
  width: calc(100% - 14px);
}

.panel-heading {
  padding-bottom: 13px;
  border-bottom: 1px solid var(--color-border);
}

.panel-heading h4 {
  margin-top: 4px;
  color: var(--color-text);
  font-size: var(--font-size-md);
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.field-area {
  min-height: 102px;
  margin-top: 16px;
}

.field-area label {
  display: block;
  margin-bottom: 7px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  font-weight: 700;
}

.field-area input {
  width: 100%;
  min-width: 0;
  min-height: 44px;
  padding: 9px 11px;
  border: 1px solid var(--color-border-strong);
  border-radius: 7px;
  background: var(--color-bg-elevated);
  color: var(--color-text);
  font: inherit;
  font-size: var(--font-size-sm);
}

.field-area input:focus-visible {
  border-color: var(--color-accent);
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.empty-state {
  min-height: 44px;
  padding: 10px 12px;
  border: 1px dashed var(--color-border-strong);
  border-radius: 7px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.status-line {
  min-width: 0;
  margin-top: 14px;
  padding: 10px 12px;
  border-left: 3px solid var(--color-accent);
  background: var(--color-accent-soft);
  color: var(--color-text);
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: var(--font-size-sm);
  line-height: 1.45;
  overflow-wrap: anywhere;
}

.action-row {
  display: flex;
  flex-wrap: wrap;
  margin: 10px -4px -4px;
}

.action-row button,
.wide-action {
  min-width: 0;
  min-height: 44px;
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
    opacity var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.action-row button {
  flex: 1 1 130px;
  margin: 4px;
}

.action-row button:hover:not(:disabled),
.wide-action:hover,
.action-row .primary-action {
  background: var(--color-accent);
  color: var(--color-on-accent);
}

.action-row button:active:not(:disabled),
.wide-action:active {
  transform: scale(0.98);
}

.action-row button:focus-visible,
.wide-action:focus-visible,
.topic-button:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.action-row button:disabled {
  border-color: var(--color-border);
  color: var(--color-text-tertiary);
  cursor: not-allowed;
  opacity: 0.65;
}

.wide-action {
  width: 100%;
  margin-top: 14px;
}

.topic-list {
  display: flex;
  flex-wrap: wrap;
  min-width: 0;
  margin: 10px -5px -5px;
}

.topic-button {
  min-width: 0;
  min-height: 74px;
  flex: 1 1 150px;
  margin: 5px;
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg-elevated);
  color: var(--color-text);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    border-color var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.topic-button:hover,
.topic-button:focus-visible {
  border-color: var(--color-accent);
  box-shadow: var(--shadow-sm);
  transform: translateY(-2px);
}

.topic-button span,
.topic-button small {
  display: block;
  min-width: 0;
  overflow-wrap: anywhere;
}

.topic-button span {
  font-size: var(--font-size-md);
  font-weight: 700;
}

.topic-button small {
  margin-top: 5px;
  color: var(--color-text-tertiary);
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: var(--font-size-xs);
}

@media (max-width: 680px) {
  .lab-body {
    flex-direction: column;
    padding: 11px;
  }

  .lab-panel,
  .list-panel {
    width: calc(100% - 10px);
    margin: 5px;
  }
}

@media (max-width: 480px) {
  .demo-header {
    padding: 16px;
  }

  .lab-body {
    padding: 8px;
  }

  .lab-panel,
  .list-panel {
    width: calc(100% - 8px);
    margin: 4px;
    padding: 16px;
  }

  .action-row,
  .topic-list {
    flex-direction: column;
    margin-right: 0;
    margin-left: 0;
  }

  .action-row button,
  .topic-button {
    width: 100%;
    flex: 0 0 auto;
    margin-right: 0;
    margin-left: 0;
  }

  .topic-button {
    min-height: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .action-row button,
  .wide-action,
  .topic-button {
    transition:
      background-color var(--duration-fast) linear,
      border-color var(--duration-fast) linear,
      color var(--duration-fast) linear,
      opacity var(--duration-fast) linear;
  }

  .action-row button:active:not(:disabled),
  .wide-action:active,
  .topic-button:hover,
  .topic-button:focus-visible {
    transform: none;
  }
}
</style>
