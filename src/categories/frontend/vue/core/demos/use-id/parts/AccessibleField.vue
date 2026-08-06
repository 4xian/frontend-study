<script setup lang="ts">
import { useId } from 'vue'

defineProps<{ label: string }>()

const inputId = useId()
</script>

<template>
  <div class="field">
    <label class="label" :for="inputId">{{ label }}</label>
    <input :id="inputId" class="input" type="email" placeholder="name@example.com" />
    <code class="generated-id">{{ inputId }}</code>
  </div>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 14px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg-secondary);
}

.label {
  margin-bottom: 7px;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.input {
  width: 100%;
  min-height: 44px;
  padding: 0 11px;
  border: 1px solid var(--color-border-strong);
  border-radius: 6px;
  background: var(--color-bg-elevated);
  color: var(--color-text-primary);
}

.input:focus-visible {
  border-color: var(--color-accent);
  outline: 2px solid var(--color-accent-soft);
  outline-offset: 2px;
}

.generated-id {
  overflow-wrap: anywhere;
  margin-top: 8px;
  color: var(--color-text-secondary);
  font-size: 12px;
}
</style>
