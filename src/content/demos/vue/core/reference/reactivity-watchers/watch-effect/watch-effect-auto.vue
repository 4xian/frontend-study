<script setup lang="ts">
/* watchEffect 自动依赖收集演示：读到哪个就追踪哪个（自包含） */
import { ref, watchEffect } from 'vue'

const a = ref(1)
const b = ref(10)
const useB = ref(false)
const logs = ref<string[]>([])

// 自动追踪：只有"本次执行实际读取"的源才是依赖
watchEffect(() => {
  const val = useB.value ? b.value : a.value
  logs.value.unshift(`effect 执行：当前读取的是 ${useB.value ? 'b' : 'a'}，值 = ${val}`)
})
</script>

<template>
  <div class="demo">
    <div class="row">
      <button class="btn" @click="a++">a++（{{ a }}）</button>
      <button class="btn" @click="b++">b++（{{ b }}）</button>
      <button class="btn" @click="useB = !useB">切换读取源（当前读 {{ useB ? 'b' : 'a' }}）</button>
    </div>
    <p class="meta">读 a 时改 b 不会触发 effect；切换后依赖关系随之改变</p>
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
  margin-bottom: 6px;
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
  margin-top: 6px;
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
