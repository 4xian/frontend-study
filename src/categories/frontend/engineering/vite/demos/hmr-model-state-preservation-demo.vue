<script setup lang="ts">
import { computed, ref } from 'vue'

const updateCount = import.meta.hot?.data.updateCount ?? 0
const counter = ref(import.meta.hot?.data.counter ?? 0)
const draft = ref(import.meta.hot?.data.draft ?? '')
const hmrAvailable = Boolean(import.meta.hot)
const statusText = computed(() =>
  hmrAvailable
    ? `开发期 HMR 已连接，已接收 ${updateCount} 次模块替换`
    : '当前为生产构建，无 HMR 运行时',
)

/** 增加组件内计数，用于观察热替换前后的状态。 */
function incrementCounter(): void {
  counter.value += 1
}

if (import.meta.hot) {
  import.meta.hot.dispose((data) => {
    data.counter = counter.value
    data.draft = draft.value
    data.updateCount = updateCount + 1
  })
}
</script>

<template>
  <section class="hmr-demo" aria-labelledby="hmr-demo-title">
    <div class="hmr-demo__header">
      <div>
        <h3 id="hmr-demo-title">HMR 状态观察</h3>
        <p aria-live="polite">{{ statusText }}</p>
      </div>
      <span class="hmr-demo__mode">{{ hmrAvailable ? 'DEV' : 'BUILD' }}</span>
    </div>

    <div class="hmr-demo__controls">
      <button type="button" @click="incrementCounter">计数 {{ counter }}</button>
      <label>
        草稿
        <input v-model="draft" type="text" placeholder="输入后触发真实文件更新" />
      </label>
    </div>
  </section>
</template>

<style scoped>
.hmr-demo {
  padding: var(--space-5);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
}

.hmr-demo__header,
.hmr-demo__controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hmr-demo__header p {
  margin-top: var(--space-1);
  color: var(--color-text-secondary);
}

.hmr-demo__mode {
  padding: 4px 8px;
  margin-left: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: var(--font-size-small);
  font-weight: 700;
}

.hmr-demo__controls {
  align-items: flex-end;
  margin-top: var(--space-5);
}

.hmr-demo__controls button,
.hmr-demo__controls input {
  min-height: 44px;
}

.hmr-demo__controls button {
  padding: 0 var(--space-4);
}

.hmr-demo__controls label {
  display: flex;
  flex: 1;
  flex-direction: column;
  margin-left: var(--space-4);
  color: var(--color-text-secondary);
}

.hmr-demo__controls input {
  width: 100%;
  padding: 0 var(--space-3);
  margin-top: var(--space-1);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text-primary);
  background: var(--color-background);
}

@media (max-width: 520px) {
  .hmr-demo__controls {
    align-items: stretch;
    flex-direction: column;
  }

  .hmr-demo__controls label {
    margin-top: var(--space-3);
    margin-left: 0;
  }
}
</style>
