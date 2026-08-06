<script setup lang="ts">
import CodeBlock from '@/common/ui/CodeBlock.vue'
import TextBlock from '@/common/ui/blocks/TextBlock.vue'
import type { PitfallItem } from '@/common/content/blocks'

defineProps<{ items: PitfallItem[] }>()
</script>

<template>
  <ol class="pitfalls">
    <li v-for="(item, index) in items" :key="item.title" class="pitfall-item">
      <h3>{{ index + 1 }}. {{ item.title }}</h3>
      <TextBlock v-if="!item.cause" class="pitfall-description" :content="item.description" />
      <div v-if="item.trigger" class="pitfall-detail pitfall-trigger">
        <strong>触发条件</strong>
        <TextBlock :content="item.trigger" />
      </div>
      <div v-if="item.cause" class="pitfall-detail pitfall-cause">
        <strong>原因</strong>
        <TextBlock :content="item.cause" />
      </div>
      <div class="pitfall-consequence">
        <strong>实际后果</strong>
        <TextBlock :content="item.consequence" />
      </div>
      <div class="pitfall-examples">
        <section class="pitfall-example wrong">
          <p class="example-label">错误示范</p>
          <CodeBlock :code="item.wrong.content" :lang="item.wrong.lang" />
        </section>
        <section class="pitfall-example correct">
          <p class="example-label">正确示范</p>
          <CodeBlock :code="item.correct.content" :lang="item.correct.lang" />
        </section>
      </div>
      <div v-if="item.verification" class="pitfall-detail pitfall-verification">
        <strong>验证方式</strong>
        <TextBlock :content="item.verification" />
      </div>
    </li>
  </ol>
</template>

<style scoped>
.pitfalls {
  padding: 0;
  list-style: none;
}

.pitfall-item {
  padding: var(--space-5) 0;
  border-top: 1px solid var(--color-border);
}

.pitfall-item:first-child {
  padding-top: 0;
  border-top: 0;
}

.pitfall-item h3 {
  overflow-wrap: anywhere;
  color: var(--color-warning);
  font-size: var(--font-size-lg);
  line-height: 1.4;
  letter-spacing: 0;
}

.pitfall-description {
  margin-top: var(--space-2);
  color: var(--color-text-secondary);
}

.pitfall-detail {
  margin-top: var(--space-3);
}

.pitfall-detail strong {
  display: block;
  font-size: var(--font-size-sm);
}

.pitfall-detail :deep(.text) {
  margin: var(--space-1) 0 0;
}

.pitfall-consequence {
  margin-top: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-left: 3px solid var(--color-warning);
  background: var(--color-warning-bg);
}

.pitfall-consequence strong {
  display: block;
  color: var(--color-warning);
  font-size: var(--font-size-sm);
}

.pitfall-consequence :deep(.text) {
  margin: var(--space-1) 0 0;
}

.pitfall-examples {
  display: flex;
  align-items: stretch;
  margin-top: var(--space-4);
}

.pitfall-example {
  flex: 1;
  min-width: 0;
}

.pitfall-example + .pitfall-example {
  margin-left: var(--space-3);
}

.example-label {
  margin-bottom: var(--space-2);
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.wrong .example-label {
  color: var(--color-warning);
}

.correct .example-label {
  color: var(--color-success, #248a3d);
}

@media (max-width: 720px) {
  .pitfall-examples {
    display: block;
  }

  .pitfall-example + .pitfall-example {
    margin-top: var(--space-4);
    margin-left: 0;
  }
}
</style>
