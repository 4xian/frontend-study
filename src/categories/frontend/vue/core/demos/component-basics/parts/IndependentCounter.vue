<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)

/**
 * 增加当前组件实例自己的计数。
 */
function increment(): void {
  count.value += 1
}
</script>

<template>
  <div class="counter">
    <div class="counter-value">
      <span>当前计数</span>
      <output aria-live="polite">{{ count }}</output>
    </div>
    <button type="button" @click="increment">增加当前实例</button>
  </div>
</template>

<style scoped>
.counter {
  margin-top: 16px;
}

.counter-value {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  min-width: 0;
}

.counter-value span {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.counter-value output {
  margin-left: 12px;
  color: var(--color-text);
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 32px;
  font-weight: 600;
  line-height: 1;
}

button {
  width: 100%;
  min-height: 44px;
  padding: 8px 14px;
  margin-top: 18px;
  border: 1px solid var(--color-accent);
  border-radius: 7px;
  background: var(--color-accent);
  color: var(--color-on-accent);
  font: inherit;
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out),
    opacity var(--duration-fast) var(--ease-out);
}

button:hover {
  background: var(--color-accent-hover);
}

button:active {
  transform: scale(0.98);
  opacity: 0.76;
}

button:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  button {
    transition:
      background-color var(--duration-fast) linear,
      opacity var(--duration-fast) linear;
  }

  button:active {
    transform: none;
  }
}
</style>
