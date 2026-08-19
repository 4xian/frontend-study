<script setup lang="ts">
import CodeBlock from '@/common/ui/CodeBlock.vue'

defineProps<{ title: string; code: string; lang: string }>()
</script>

<template>
  <details class="code-details">
    <summary>{{ title }}</summary>
    <div class="code-details-body">
      <CodeBlock :code="code" :lang="lang" :collapsible="false" />
    </div>
  </details>
</template>

<style scoped>
.code-details {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-elevated);
  overflow: hidden;
}

.code-details summary {
  position: relative;
  min-height: 48px;
  padding: var(--space-3) var(--space-7) var(--space-3) var(--space-4);
  color: var(--color-text);
  font-weight: 650;
  line-height: 1.5;
  cursor: pointer;
  list-style: none;
}

.code-details summary::-webkit-details-marker {
  display: none;
}

.code-details summary::after {
  position: absolute;
  top: 50%;
  right: var(--space-4);
  content: '›';
  color: var(--color-text-secondary);
  font-size: var(--font-size-xl);
  transform: translateY(-50%) rotate(90deg);
  transition: transform var(--duration-fast) var(--ease-out);
}

.code-details[open] summary {
  border-bottom: 1px solid var(--color-border);
}

.code-details[open] summary::after {
  transform: translateY(-50%) rotate(-90deg);
}

.code-details-body {
  padding: var(--space-3);
}

.code-details-body :deep(.code-block) {
  margin: 0;
}
</style>
