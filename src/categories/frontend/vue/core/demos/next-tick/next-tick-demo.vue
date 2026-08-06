<script setup lang="ts">
/* nextTick 演示：对照同一事件中 DOM 更新前后的读取结果（自包含，可作 playground 初始代码） */
import { nextTick, ref } from 'vue'

const count = ref(0)
const counterElement = ref<HTMLElement | null>(null)
const logs = ref<string[]>([])

/**
 * 增加响应式状态，并在 DOM 冲刷前后分别记录元素文本。
 */
async function increment(): Promise<void> {
  count.value++
  logs.value.unshift(`状态已变为 ${count.value}，此刻 DOM = “${counterElement.value?.textContent}”`)

  await nextTick()
  logs.value.unshift(`await nextTick() 后，DOM = “${counterElement.value?.textContent}”`)
}
</script>

<template>
  <div class="demo">
    <div class="row">
      <span ref="counterElement" class="counter">{{ count }}</span>
      <button class="btn" @click="increment">count++ 并读取 DOM</button>
    </div>
    <ul v-if="logs.length" class="logs" aria-live="polite">
      <li v-for="log in logs" :key="log">{{ log }}</li>
    </ul>
    <p v-else class="hint">点击后会依次记录：状态已更新时的旧 DOM，以及 await 后的新 DOM。</p>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  flex-direction: column;
}

.row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.counter {
  margin-right: 12px;
  padding: 2px 14px;
  border-radius: 8px;
  background: #f5f5f7;
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 16px;
}

.btn {
  padding: 4px 14px;
  border: 1px solid #0071e3;
  border-radius: 980px;
  color: #0071e3;
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 13px;
}

.btn:hover {
  background: rgba(0, 113, 227, 0.1);
}

.logs {
  max-height: 160px;
  padding: 8px 12px;
  margin: 0;
  overflow-y: auto;
  border-radius: 8px;
  background: #f5f5f7;
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 12px;
  line-height: 1.8;
  list-style: none;
}

.hint {
  margin-top: 8px;
  color: #6e6e73;
  font-size: 13px;
}
</style>
