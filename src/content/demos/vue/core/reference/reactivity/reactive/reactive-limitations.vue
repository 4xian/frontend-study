<script setup lang="ts">
/* reactive 局限性演示：解构原始值属性后与源对象断开响应连接（自包含，可作 playground 初始代码） */
import { reactive, ref } from 'vue'

const state = reactive({ count: 0 })

// 解构得到的是普通 number，与 state.count 断开了响应连接
let { count } = state

/** 操作日志：观察解构副本与 state.count 的脱节 */
const logs = ref<string[]>([])

/**
 * 记录一条操作日志，并只保留最近四条。
 */
function log(msg: string) {
  logs.value.push(msg)
  if (logs.value.length > 4) logs.value.shift()
}

/**
 * 增加解构出的普通变量，不影响原响应式对象。
 */
function addCopy() {
  count++
  log(`副本 count = ${count}，state.count 仍是 ${state.count}`)
}

/**
 * 增加代理对象上的属性，触发依赖追踪与视图更新。
 */
function addState() {
  state.count++
  log(`state.count = ${state.count}，副本 count 仍是 ${count}`)
}
</script>

<template>
  <div class="demo">
    <p class="value">state.count = {{ state.count }}</p>
    <div class="btns">
      <button class="btn" @click="addState">state.count++（代理属性）</button>
      <button class="btn" @click="addCopy">count++（解构副本）</button>
    </div>
    <ul class="logs">
      <li v-for="(item, i) in logs" :key="i" class="log-item">{{ item }}</li>
    </ul>
  </div>
</template>

<style scoped>
.value {
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  margin-bottom: 8px;
}

.btns {
  display: flex;
  flex-wrap: wrap;
}

.btn {
  margin-right: 8px;
  padding: 4px 14px;
  border: 1px solid var(--color-accent);
  border-radius: 980px;
  color: var(--color-accent);
  font-size: 13px;
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
}

.btn:hover {
  background: var(--color-accent-soft);
}

.logs {
  margin-top: 10px;
  padding-left: 0;
  list-style: none;
}

.log-item {
  margin-top: 4px;
  font-size: 12px;
  color: var(--color-text-secondary);
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
}
</style>
