<script setup lang="ts">
/* 模板语法演示：静态顶层数据通过插值、属性绑定、v-if 与 v-for 进入模板。 */
const courseTitle = 'Vue 模板语法入门'
const courseDescription = '这段文字来自绑定后的 title attribute'
const courseAvailable = true
const topics = [
  { id: 'interpolation', name: '文本插值' },
  { id: 'attribute', name: '属性绑定' },
  { id: 'condition', name: '条件渲染' },
  { id: 'list', name: '列表渲染' },
]
</script>

<template>
  <article class="demo" :title="courseDescription">
    <p class="eyebrow">静态课程摘要</p>
    <h3>{{ courseTitle }}</h3>
    <p class="binding-note">将鼠标停在卡片上，可以看到由 <code>:title</code> 绑定的提示。</p>
    <p v-if="courseAvailable" class="status">课程已开放</p>
    <ul class="topic-list">
      <li v-for="topic in topics" :key="topic.id">{{ topic.name }}</li>
    </ul>
  </article>
</template>

<style scoped>
.demo {
  max-width: 560px;
  padding: 18px;
  border: 1px solid var(--color-border);
  border-left: 4px solid var(--color-accent);
  border-radius: 8px;
  background: var(--color-bg-sunken);
}

.eyebrow {
  margin: 0;
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
  font-weight: 600;
}

h3 {
  margin: 6px 0 0;
  color: var(--color-text);
  font-size: var(--font-size-lg);
}

.binding-note {
  margin: 10px 0 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.6;
}

code {
  color: var(--color-accent);
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 0.95em;
}

.status {
  display: inline-block;
  margin: 14px 0 0;
  padding: 4px 10px;
  border: 1px solid var(--color-accent);
  border-radius: 8px;
  color: var(--color-accent);
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.topic-list {
  margin: 14px 0 0;
  padding-left: 22px;
  color: var(--color-text-secondary);
}

.topic-list li + li {
  margin-top: 6px;
}
</style>
