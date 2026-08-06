<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'

const searchTerm = ref('响应式更新')
const searchInput = useTemplateRef<HTMLInputElement>('search-input')

/** 清空子组件自己的搜索词，并把焦点留在输入框中。 */
function clearAndFocus(): void {
  searchTerm.value = ''
  searchInput.value?.focus()
}

defineExpose({ clearAndFocus })
</script>

<template>
  <section class="exposed-search-panel" aria-labelledby="exposed-search-title">
    <p class="component-label">私有 ExposedSearchPanel</p>
    <h5 id="exposed-search-title">子组件维护自己的输入状态</h5>

    <label for="exposed-search-input">子组件搜索词</label>
    <input
      id="exposed-search-input"
      ref="search-input"
      v-model="searchTerm"
      type="search"
      placeholder="输入搜索词"
    />

    <p class="search-preview">当前值：{{ searchTerm || '（空）' }}</p>
  </section>
</template>

<style scoped>
.exposed-search-panel {
  min-width: 0;
  margin-top: 16px;
  padding: 16px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg-elevated);
}

.component-label {
  color: var(--color-accent);
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: var(--font-size-xs);
  font-weight: 700;
  overflow-wrap: anywhere;
}

.exposed-search-panel h5 {
  margin-top: 5px;
  color: var(--color-text);
  font-size: var(--font-size-md);
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.exposed-search-panel label {
  display: block;
  margin-top: 14px;
  margin-bottom: 7px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  font-weight: 700;
}

.exposed-search-panel input {
  width: 100%;
  min-width: 0;
  min-height: 44px;
  padding: 9px 11px;
  border: 1px solid var(--color-border-strong);
  border-radius: 7px;
  background: var(--color-bg-sunken);
  color: var(--color-text);
  font: inherit;
  font-size: var(--font-size-sm);
}

.exposed-search-panel input:focus-visible {
  border-color: var(--color-accent);
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.search-preview {
  min-width: 0;
  margin-top: 10px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.5;
  overflow-wrap: anywhere;
}

@media (max-width: 480px) {
  .exposed-search-panel {
    padding: 14px;
  }
}
</style>
