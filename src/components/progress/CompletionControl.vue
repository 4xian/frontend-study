<script setup lang="ts">
defineProps<{ completed: boolean }>()

const emit = defineEmits<{
  change: [completed: boolean]
}>()
</script>

<template>
  <section class="completion-control" :class="{ completed }" aria-label="课程完成状态">
    <div>
      <p class="completion-label">本课进度</p>
      <strong>{{ completed ? '已完成' : '学习完成后记录进度' }}</strong>
    </div>
    <button type="button" :aria-pressed="completed" @click="emit('change', !completed)">
      {{ completed ? '取消完成' : '标记为已完成' }}
    </button>
  </section>
</template>

<style scoped>
.completion-control {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-5);
  margin-top: var(--space-7);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
  transition:
    border-color var(--duration-base) var(--ease-out),
    background-color var(--duration-base) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.completion-control.completed {
  border-color: color-mix(in srgb, var(--color-accent) 42%, var(--color-border));
  background: var(--color-accent-soft);
}

.completion-label {
  margin-bottom: var(--space-1);
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.completion-control strong {
  line-height: 1.4;
}

button {
  flex: 0 0 auto;
  min-height: 40px;
  padding: 0 var(--space-4);
  margin-left: var(--space-5);
  border-radius: var(--radius-full);
  background: var(--color-accent);
  color: var(--color-on-accent);
  font-size: var(--font-size-sm);
  font-weight: 600;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    opacity var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

button:hover {
  background: var(--color-accent-hover);
}

button:active {
  opacity: 0.78;
  transform: scale(0.97);
}

@media (max-width: 520px) {
  .completion-control {
    align-items: stretch;
    flex-direction: column;
  }

  button {
    width: 100%;
    margin-top: var(--space-4);
    margin-left: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .completion-control,
  button {
    transition-property: background-color, opacity;
  }

  button:active {
    transform: none;
  }
}
</style>
