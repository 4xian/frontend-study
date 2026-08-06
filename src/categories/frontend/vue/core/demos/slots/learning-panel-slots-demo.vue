<script setup lang="ts">
import LearningSlotPanel from './parts/LearningSlotPanel.vue'

const parentNote = '父级备注：内容布局由父组件决定'
const parentAudience = 'Vue 中级学习者'
</script>

<template>
  <article class="learning-panel-slots-demo">
    <header class="demo-heading">
      <p class="eyebrow">学习面板插槽实验</p>
      <h3>父级提供内容，子级管理出口</h3>
      <p>观察父级内容如何读取自己的变量，并通过子组件给出的窄命令更新子级状态。</p>
    </header>

    <LearningSlotPanel>
      <template #header>
        <p class="slot-label">父级具名插槽</p>
        <h4 id="learning-slot-panel-title">插槽学习面板</h4>
        <p class="audience">适合：{{ parentAudience }}</p>
      </template>

      <template #default="{ activeTopic, activeTopicLabel, detailsVisible, selectTopic }">
        <section class="topic-content" aria-labelledby="learning-topic-status">
          <div id="learning-topic-status" class="status-block" aria-live="polite">
            <p>当前主题：{{ activeTopicLabel }}</p>
            <p>详情状态：{{ detailsVisible ? '已展开' : '已收起' }}</p>
          </div>

          <section class="topic-selector" aria-labelledby="topic-selector-title">
            <h5 id="topic-selector-title">选择学习主题</h5>
            <div class="topic-buttons">
              <button
                type="button"
                :aria-pressed="activeTopic === 'template'"
                @click="selectTopic('template')"
              >
                选择模板
              </button>
              <button
                type="button"
                :aria-pressed="activeTopic === 'source'"
                @click="selectTopic('source')"
              >
                选择源码
              </button>
            </div>
          </section>

          <section
            v-show="detailsVisible"
            id="learning-topic-details"
            class="topic-details"
            aria-labelledby="topic-details-title"
          >
            <h5 id="topic-details-title">{{ activeTopicLabel }}主题详情</h5>
            <p>{{ parentNote }}</p>
            <p v-if="activeTopic === 'template'">
              模板片段由父组件定义，最终显示位置由子组件的默认插槽出口决定。
            </p>
            <p v-else>子组件只公开当前主题值和选择命令，父组件无法直接改写内部状态。</p>
          </section>
        </section>
      </template>

      <template #actions="{ detailsVisible, toggleDetails }">
        <button
          type="button"
          class="details-button"
          :aria-expanded="detailsVisible"
          aria-controls="learning-topic-details"
          @click="toggleDetails"
        >
          {{ detailsVisible ? '收起详情' : '展开详情' }}
        </button>
      </template>
    </LearningSlotPanel>
  </article>
</template>

<style scoped>
.learning-panel-slots-demo {
  width: 100%;
  max-width: 920px;
  min-width: 0;
}

.demo-heading {
  min-width: 0;
  padding: 4px 2px 2px;
}

.eyebrow,
.slot-label {
  color: var(--color-accent);
  font-size: var(--font-size-xs);
  font-weight: 700;
}

.demo-heading h3,
.panel-header h4,
.topic-selector h5,
.topic-details h5 {
  color: var(--color-text);
  overflow-wrap: anywhere;
}

.demo-heading h3 {
  margin-top: 5px;
  font-size: var(--font-size-lg);
  line-height: 1.35;
}

.demo-heading > p:last-child {
  margin-top: 8px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.panel-header h4 {
  margin-top: 5px;
  font-size: var(--font-size-md);
  line-height: 1.4;
}

.audience {
  min-width: 0;
  margin-top: 7px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.topic-content,
.topic-selector,
.topic-details {
  min-width: 0;
}

.status-block {
  min-width: 0;
  padding: 11px 13px;
  border-left: 3px solid var(--color-accent);
  background: var(--color-accent-soft);
  color: var(--color-text);
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: var(--font-size-sm);
  line-height: 1.55;
  overflow-wrap: anywhere;
}

.status-block p + p {
  margin-top: 3px;
}

.topic-selector {
  margin-top: 17px;
}

.topic-selector h5,
.topic-details h5 {
  font-size: var(--font-size-sm);
  line-height: 1.4;
}

.topic-buttons {
  display: flex;
  flex-wrap: wrap;
  min-width: 0;
  margin: 7px -4px -4px;
}

.topic-buttons button,
.details-button {
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
}

.topic-buttons button {
  flex: 1 1 150px;
  margin: 4px;
}

.topic-buttons button[aria-pressed='true'],
.topic-buttons button:hover,
.details-button:hover {
  background: var(--color-accent);
  color: var(--color-on-accent);
}

.topic-buttons button:focus-visible,
.details-button:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.topic-details {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}

.topic-details p {
  min-width: 0;
  margin-top: 8px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.details-button {
  flex: 0 1 180px;
  margin: 4px;
}

@media (max-width: 480px) {
  .demo-heading {
    padding-right: 0;
    padding-left: 0;
  }

  .topic-buttons {
    flex-direction: column;
    margin-right: 0;
    margin-left: 0;
  }

  .topic-buttons button,
  .details-button {
    width: 100%;
    flex: 0 0 auto;
    margin-right: 0;
    margin-left: 0;
  }
}
</style>
