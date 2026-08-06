<script setup lang="ts">
/* watch 侦听源形式演示：ref 源与 getter 源、新旧值（自包含） */
import { reactive, ref, watch } from 'vue'

const count = ref(0)
const state = reactive({ price: 10, qty: 1 })

/** 侦听日志 */
const logs = ref<string[]>([])

// 侦听 ref 源：回调拿到新旧值
watch(count, (newVal, oldVal) => {
  logs.value.unshift(`[ref 源] count: ${oldVal} → ${newVal}`)
})

// 侦听 getter 源：只有总价变化才触发
watch(
  () => state.price * state.qty,
  (newVal, oldVal) => {
    logs.value.unshift(`[getter 源] 总价: ${oldVal} → ${newVal}`)
  },
)
</script>

<template>
  <div class="demo">
    <div class="row">
      <button class="btn" @click="count++">count++（ref 源）</button>
      <button class="btn" @click="state.qty++">qty++（getter 源）</button>
    </div>
    <p class="meta">count = {{ count }}，总价 = {{ state.price * state.qty }}</p>
    <ul class="logs">
      <li v-for="(log, i) in logs.slice(0, 5)" :key="logs.length - i">{{ log }}</li>
    </ul>
  </div>
</template>

<style scoped>
.demo {
  font-size: 14px;
}

.row {
  display: flex;
  flex-wrap: wrap;
}

.btn {
  margin-right: 8px;
  padding: 4px 14px;
  border: 1px solid #0071e3;
  border-radius: 980px;
  color: #0071e3;
  font-size: 13px;
}

.btn:hover {
  background: rgba(0, 113, 227, 0.1);
}

.meta {
  margin-top: 8px;
  font-size: 12px;
  opacity: 0.65;
}

.logs {
  margin-top: 8px;
  padding-left: 20px;
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 12px;
  line-height: 1.9;
}
</style>
