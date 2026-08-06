<script setup lang="ts">
import { ref } from 'vue'

const message = ref('请选择一种抛出值')

/** 把任意抛出值转换为可显示消息。 */
function normalizeError(error: unknown): string {
  if (error instanceof Error) return `Error：${error.message}`
  return `非 Error：${String(error)}`
}

/** 捕获指定抛出值并显示收窄后的结果。 */
function captureThrown(value: unknown): void {
  try {
    throw value
  } catch (error) {
    message.value = normalizeError(error)
  }
}
</script>

<template>
  <section class="error-demo" aria-label="unknown 错误收窄演示">
    <div class="error-demo__controls" aria-label="选择抛出值">
      <button type="button" @click="captureThrown(new Error('模块加载失败'))">抛出 Error</button>
      <button type="button" @click="captureThrown('连接已断开')">抛出字符串</button>
    </div>
    <p class="error-demo__result" aria-live="polite">{{ message }}</p>
  </section>
</template>

<style scoped>
.error-demo {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 20px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.error-demo__controls {
  display: flex;
  flex-wrap: wrap;
  margin: -4px;
}

.error-demo__controls button {
  min-height: 44px;
  margin: 4px;
  padding: 8px 14px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text);
  background: var(--color-bg-elevated);
  cursor: pointer;
}

.error-demo__controls button:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.error-demo__result {
  min-height: 24px;
  margin: 16px 0 0;
  font-weight: 650;
}
</style>
