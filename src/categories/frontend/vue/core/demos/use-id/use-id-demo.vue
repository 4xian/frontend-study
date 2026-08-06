<script setup lang="ts">
import { ref } from 'vue'
import AccessibleField from './parts/AccessibleField.vue'

const showSecondField = ref(true)

/** 切换第二个字段实例，展示每个组件实例拥有独立 ID。 */
function toggleSecondField(): void {
  showSecondField.value = !showSecondField.value
}
</script>

<template>
  <section class="use-id-demo" aria-label="useId 唯一性演示">
    <div class="field-list">
      <AccessibleField label="联系邮箱" />
      <AccessibleField v-if="showSecondField" label="备用邮箱" />
    </div>
    <button type="button" class="toggle-button" @click="toggleSecondField">
      {{ showSecondField ? '移除备用字段' : '重新创建备用字段' }}
    </button>
    <p class="hint">点击任一标签时，焦点只会进入同一字段实例的输入框。</p>
  </section>
</template>

<style scoped>
.use-id-demo {
  display: flex;
  flex-direction: column;
}

.field-list {
  display: flex;
  flex-wrap: wrap;
  margin: -6px;
}

.field-list > * {
  flex: 1 1 220px;
  margin: 6px;
}

.toggle-button {
  align-self: flex-start;
  min-height: 44px;
  padding: 0 16px;
  margin-top: 14px;
  border: 1px solid var(--color-accent);
  border-radius: 8px;
  color: var(--color-accent);
  font-weight: 600;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.toggle-button:hover {
  background: var(--color-accent-soft);
}

.toggle-button:active {
  transform: scale(0.97);
}

.toggle-button:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
}

.hint {
  margin-top: 10px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

@media (prefers-reduced-motion: reduce) {
  .toggle-button {
    transition: none;
  }

  .toggle-button:active {
    transform: none;
  }
}
</style>
