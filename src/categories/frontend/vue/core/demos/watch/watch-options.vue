<script setup lang="ts">
/* watch 选项演示：immediate / once / 停止侦听（自包含） */
import { ref, watch } from 'vue'

const value = ref(0)
const logs = ref<string[]>([])

// immediate：创建时立即执行一次（oldVal 为 undefined）
watch(
  value,
  (newVal, oldVal) => {
    logs.value.unshift(`[immediate] ${oldVal === undefined ? '创建即执行' : '变化'}：${newVal}`)
  },
  { immediate: true },
)

// once：只触发一次后自动停止（3.4+）
watch(
  value,
  (newVal) => {
    logs.value.unshift(`[once] 只会出现一次：${newVal}`)
  },
  { once: true },
)

/** 可手动停止的侦听器句柄 */
const stoppable = watch(value, (newVal) => {
  logs.value.unshift(`[可停止] ${newVal}`)
})

/** 是否已停止 */
const stopped = ref(false)

/**
 * 调用 WatchHandle 停止侦听
 */
function stopIt() {
  stoppable.stop()
  stopped.value = true
  logs.value.unshift('[可停止] 已调用 stop()，之后不再触发')
}
</script>

<template>
  <div class="demo">
    <div class="row">
      <button class="btn" @click="value++">value++（当前 {{ value }}）</button>
      <button class="btn" :disabled="stopped" @click="stopIt">
        {{ stopped ? '已停止' : '停止第三个侦听器' }}
      </button>
    </div>
    <ul class="logs">
      <li v-for="(log, i) in logs.slice(0, 6)" :key="logs.length - i">{{ log }}</li>
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

.btn:hover:not(:disabled) {
  background: rgba(0, 113, 227, 0.1);
}

.btn:disabled {
  opacity: 0.45;
  cursor: default;
}

.logs {
  margin-top: 8px;
  padding-left: 20px;
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 12px;
  line-height: 1.9;
}
</style>
