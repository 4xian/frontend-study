<script setup lang="ts">
/* 提示块：info / warning 两种样式（需求文档 §3.3 tip 块） */
const props = defineProps<{ style: 'info' | 'warning'; content: string }>()
</script>

<template>
  <aside class="tip" :class="props.style">
    <span class="icon">{{ props.style === 'info' ? 'ⓘ' : '⚠' }}</span>
    <p class="content">{{ props.content }}</p>
  </aside>
</template>

<style scoped>
.tip {
  display: flex;
  align-items: flex-start;
  margin: var(--space-4) 0;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
}

.tip.info {
  background: var(--color-info-bg);
}

.tip.warning {
  background: var(--color-warning-bg);
}

.icon {
  flex-shrink: 0;
  font-size: var(--font-size-base);
  line-height: 1.6;
}

.info .icon {
  color: var(--color-info);
}

.warning .icon {
  color: var(--color-warning);
}

.content {
  margin-left: var(--space-3);
  font-size: var(--font-size-sm);
  line-height: 1.7;
}
</style>
