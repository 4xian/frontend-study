<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  completed: number
  total: number
  stageTitle?: string
}>()

/** 当前课程完成百分比。 */
const percentage = computed(() =>
  props.total ? Math.round((props.completed / props.total) * 100) : 0,
)
</script>

<template>
  <section class="course-progress" aria-label="课程进度">
    <div class="progress-copy">
      <span>{{ stageTitle ?? '学习路径' }}</span>
      <strong>{{ completed }} / {{ total }}</strong>
    </div>
    <progress :value="completed" :max="total || 1">{{ percentage }}%</progress>
  </section>
</template>

<style scoped>
.course-progress {
  width: 100%;
}

.progress-copy {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
}

.progress-copy strong {
  margin-left: var(--space-3);
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
}

progress {
  display: block;
  width: 100%;
  height: 5px;
  margin-top: var(--space-2);
  border: 0;
  border-radius: var(--radius-full);
  overflow: hidden;
  background: var(--color-border);
}

progress::-webkit-progress-bar {
  background: var(--color-border);
}

progress::-webkit-progress-value {
  border-radius: var(--radius-full);
  background: var(--color-accent);
  transition: width var(--duration-base) var(--ease-out);
}

progress::-moz-progress-bar {
  border-radius: var(--radius-full);
  background: var(--color-accent);
}

@media (prefers-reduced-motion: reduce) {
  progress::-webkit-progress-value {
    transition: none;
  }
}
</style>
