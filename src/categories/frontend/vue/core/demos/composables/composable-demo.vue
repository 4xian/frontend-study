<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

/**
 * 追踪鼠标在页面中的坐标，并随组件生命周期清理监听器。
 */
function useMouse() {
  const x = ref(0)
  const y = ref(0)

  /** 记录最新鼠标坐标。 */
  function update(event: MouseEvent) {
    x.value = event.pageX
    y.value = event.pageY
  }

  onMounted(() => window.addEventListener('mousemove', update))
  onUnmounted(() => window.removeEventListener('mousemove', update))

  return { x, y }
}

/**
 * 创建一份可递增和重置的独立计数状态。
 */
function useCounter() {
  const count = ref(0)

  /** 计数加一。 */
  function increment() {
    count.value++
  }

  /** 将计数恢复为零。 */
  function reset() {
    count.value = 0
  }

  return { count, increment, reset }
}

const { x, y } = useMouse()
const first = useCounter()
const second = useCounter()
</script>

<template>
  <div class="demo">
    <p class="value">useMouse：鼠标坐标 ({{ x }}, {{ y }})</p>
    <div class="row">
      <span class="value">计数器 A = {{ first.count.value }}</span>
      <button type="button" class="btn" @click="first.increment">A + 1</button>
      <button type="button" class="btn" @click="first.reset">重置 A</button>
    </div>
    <div class="row">
      <span class="value">计数器 B = {{ second.count.value }}</span>
      <button type="button" class="btn" @click="second.increment">B + 1</button>
      <button type="button" class="btn" @click="second.reset">重置 B</button>
    </div>
    <p class="hint">x 与 y 解构后仍是 ref；两个计数器来自两次 useCounter 调用，状态互不影响。</p>
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
  margin-top: 8px;
}

.value {
  margin-right: 12px;
  margin-bottom: 8px;
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 13px;
}

.btn {
  margin-right: 8px;
  margin-bottom: 8px;
  padding: 4px 12px;
  border: 1px solid #0071e3;
  border-radius: 8px;
  color: #0071e3;
  font-size: 13px;
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
}

.btn:hover {
  background: rgba(0, 113, 227, 0.1);
}

.hint {
  margin-top: 4px;
  font-size: 13px;
  color: #6e6e73;
}
</style>
