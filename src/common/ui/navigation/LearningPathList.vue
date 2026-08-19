<script setup lang="ts">
import type { LearningTrackStage } from '@/common/catalog'

defineProps<{
  stages: LearningTrackStage[]
  currentEntryId: string
}>()

const emit = defineEmits<{ select: [] }>()
</script>

<template>
  <nav class="learning-path-list" aria-label="学习路径">
    <section v-for="stage in stages" :key="stage.id" class="path-group">
      <p class="path-group-title">{{ stage.title }}</p>
      <RouterLink
        v-for="item in stage.entries"
        :key="item.entryId"
        :to="item.path"
        class="path-link"
        :class="{ active: item.entryId === currentEntryId }"
        :aria-current="item.entryId === currentEntryId ? 'page' : undefined"
        @click="emit('select')"
      >
        {{ item.title }}
      </RouterLink>
    </section>
  </nav>
</template>

<style scoped>
.learning-path-list {
  display: flex;
  flex-direction: column;
}

.path-group + .path-group {
  margin-top: var(--space-5);
}

.path-group-title {
  margin-bottom: var(--space-1);
  color: var(--color-text);
  font-size: var(--font-size-xs);
  font-weight: 600;
  line-height: 1.35;
}

.path-link {
  display: block;
  padding: var(--space-2) 0;
  color: var(--color-text);
  font-size: var(--font-size-sm);
  line-height: 1.35;
  transition:
    color var(--duration-fast) var(--ease-out),
    opacity var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.path-link:hover,
.path-link.active {
  color: var(--color-accent);
}

.path-link.active {
  font-weight: 600;
}

.path-link:active {
  opacity: 0.72;
  transform: scale(0.98);
}

@media (prefers-reduced-motion: reduce) {
  .path-link {
    transition-property: opacity;
  }

  .path-link:active {
    transform: none;
  }
}
</style>
