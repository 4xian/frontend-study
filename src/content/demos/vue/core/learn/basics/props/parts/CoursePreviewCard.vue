<script setup lang="ts">
interface CourseMeta {
  level: string
}

interface Props {
  eyebrow: string
  title: string
  durationMinutes: number
  featured: boolean
  topics: string[]
  courseMeta: CourseMeta
  description?: string
}

const props = withDefaults(defineProps<Props>(), {
  description: '父组件未提供说明，子组件使用自己的默认文案。',
})
</script>

<template>
  <article class="props-summary">
    <p class="card-eyebrow">{{ props.eyebrow }}</p>
    <h5>{{ props.title }}</h5>
    <p class="description">{{ props.description }}</p>
    <p class="sync-status" aria-live="polite">
      输入已同步：{{ props.title }}，{{ props.durationMinutes }} 分钟
    </p>

    <dl class="prop-values">
      <div>
        <dt>时长</dt>
        <dd>{{ props.durationMinutes }} 分钟（number）</dd>
      </div>
      <div>
        <dt>推荐</dt>
        <dd>{{ props.featured ? '是' : '否' }}（boolean）</dd>
      </div>
      <div>
        <dt>级别</dt>
        <dd>{{ props.courseMeta.level }}（object）</dd>
      </div>
    </dl>

    <ul aria-label="课程主题">
      <li v-for="topic in props.topics" :key="topic">{{ topic }}</li>
    </ul>
  </article>
</template>

<style scoped>
.props-summary {
  min-width: 0;
  margin-top: 14px;
  padding: 16px;
  border: 1px solid var(--color-border-strong);
  border-radius: 8px;
  background: var(--color-bg-elevated);
  transition:
    border-color var(--duration-slow) var(--ease-out),
    box-shadow var(--duration-slow) var(--ease-out);
}

.props-summary:hover {
  border-color: var(--color-accent);
  box-shadow: 0 8px 24px color-mix(in srgb, var(--color-text) 8%, transparent);
}

.card-eyebrow {
  color: var(--color-accent);
  font-size: var(--font-size-xs);
  font-weight: 700;
}

h5 {
  margin-top: 5px;
  color: var(--color-text);
  font-size: var(--font-size-md);
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.description {
  margin-top: 8px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.55;
  overflow-wrap: anywhere;
}

.sync-status {
  margin-top: 10px;
  color: var(--color-accent);
  font-size: var(--font-size-xs);
  font-weight: 600;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.prop-values {
  margin-top: 14px;
}

.prop-values > div {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  min-width: 0;
  padding: 8px 0;
  border-top: 1px solid var(--color-border);
}

.prop-values dt,
.prop-values dd {
  font-size: var(--font-size-xs);
}

.prop-values dt {
  flex: 0 0 auto;
  color: var(--color-text-tertiary);
}

.prop-values dd {
  min-width: 0;
  margin-left: 12px;
  color: var(--color-text);
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  text-align: right;
  overflow-wrap: anywhere;
}

ul {
  display: flex;
  flex-wrap: wrap;
  margin: 10px -3px -3px;
  padding: 0;
  list-style: none;
}

li {
  margin: 3px;
  padding: 4px 8px;
  border-radius: 7px;
  background: var(--color-accent-soft);
  color: var(--color-accent);
  font-size: var(--font-size-xs);
  overflow-wrap: anywhere;
}

@media (prefers-reduced-motion: reduce) {
  .props-summary {
    transition: none;
  }
}
</style>
