<script setup lang="ts">
export interface PrerequisiteItem {
  id: string
  title: string
  path: string
}

defineProps<{ items: PrerequisiteItem[] }>()
</script>

<template>
  <aside v-if="items.length" class="prerequisite-notice" aria-labelledby="prerequisite-title">
    <p class="notice-eyebrow">学习建议</p>
    <h2 id="prerequisite-title">建议先完成</h2>
    <RouterLink v-for="item in items" :key="item.id" :to="item.path">
      <span>{{ item.title }}</span>
      <small>尚未完成</small>
    </RouterLink>
  </aside>
</template>

<style scoped>
.prerequisite-notice {
  padding: var(--space-4) var(--space-5);
  margin-bottom: var(--space-6);
  border-left: 3px solid var(--color-warning);
  background: var(--color-bg-sunken);
}

.notice-eyebrow {
  color: var(--color-warning);
  font-size: var(--font-size-xs);
  font-weight: 600;
}

h2 {
  margin-top: var(--space-1);
  font-size: var(--font-size-base);
  line-height: 1.4;
}

a {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: var(--space-3);
  color: var(--color-accent);
  font-size: var(--font-size-sm);
}

a + a {
  margin-top: var(--space-1);
  border-top: 1px solid var(--color-border);
}

small {
  flex: 0 0 auto;
  margin-left: var(--space-4);
  color: var(--color-text-tertiary);
}
</style>
