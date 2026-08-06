<script setup lang="ts">
defineProps<{
  title: string
  instructions: string
  acceptance?: string
  answer?: string
}>()
</script>

<template>
  <section class="exercise">
    <h2>{{ title }}</h2>
    <p>{{ instructions }}</p>
    <div v-if="acceptance" class="exercise-acceptance">
      <strong>验收标准</strong>
      <p>{{ acceptance }}</p>
    </div>
    <details v-if="answer" class="exercise-answer">
      <summary>查看参考答案</summary>
      <p>{{ answer }}</p>
    </details>
  </section>
</template>

<style scoped>
.exercise {
  padding: var(--space-5);
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-accent);
  border-radius: var(--radius-sm);
  background: var(--color-accent-soft);
}

.exercise h2 {
  font-size: var(--font-size-lg);
  line-height: 1.3;
}

.exercise > p,
.exercise-acceptance,
.exercise-answer {
  margin-top: var(--space-3);
}

.exercise-acceptance {
  padding: var(--space-3) var(--space-4);
  border-left: 3px solid var(--color-accent);
  background: var(--color-bg-elevated);
}

.exercise-acceptance strong {
  display: block;
  font-size: var(--font-size-sm);
}

.exercise-acceptance p {
  margin-top: var(--space-1);
}

.exercise-answer {
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border);
}

.exercise-answer summary {
  width: fit-content;
  cursor: pointer;
  color: var(--color-accent);
  font-size: var(--font-size-sm);
  font-weight: 600;
  transition:
    transform var(--duration-fast) var(--ease-out),
    opacity var(--duration-fast) var(--ease-out);
}

.exercise-answer summary:active {
  opacity: 0.72;
  transform: scale(0.98);
}

@media (prefers-reduced-motion: reduce) {
  .exercise-answer summary {
    transition: opacity var(--duration-fast) linear;
  }

  .exercise-answer summary:active {
    transform: none;
  }
}
</style>
