<script setup lang="ts">
defineProps<{ items: { title: string; content: string }[] }>()
</script>

<template>
  <ol class="steps">
    <li v-for="step in items" :key="step.title">
      <strong>{{ step.title }}</strong>
      <p>{{ step.content }}</p>
    </li>
  </ol>
</template>

<style scoped>
.steps {
  padding-left: var(--space-6);
}

.steps li + li {
  margin-top: var(--space-4);
}

.steps li::marker {
  color: var(--color-accent);
  font-weight: 600;
}

.steps strong {
  display: block;
  font-size: var(--font-size-md);
  line-height: 1.45;
}

.steps p {
  margin-top: var(--space-2);
  color: var(--color-text-secondary);
  line-height: 1.7;
}
</style>
