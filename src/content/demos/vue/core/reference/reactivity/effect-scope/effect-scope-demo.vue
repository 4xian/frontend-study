<script setup lang="ts">
/* effectScope 演示：scope 内创建两个副作用，stop() 后一次性全部停止（自包含，可作 playground 初始代码） */
import { computed, effectScope, ref, watch, watchEffect } from 'vue'

const counter = ref(0)
const logs = ref<string[]>([])
const stopped = ref(false)

const scope = effectScope()

scope.run(() => {
  const doubled = computed(() => counter.value * 2)

  watch(doubled, (val) => {
    logs.value.push(`watch: doubled 变为 ${val}`)
  })

  watchEffect(() => {
    logs.value.push(`watchEffect: count = ${counter.value}`)
  })
})

/**
 * 增加计数器；作用域未停止时，两个侦听器都会输出日志。
 */
function increment() {
  counter.value++
}

/**
 * 停止作用域内的 watch 与 watchEffect，后续修改数据不再输出日志。
 */
function stopScope() {
  scope.stop()
  stopped.value = true
  logs.value.push('—— scope.stop() 已调用 ——')
}
</script>

<template>
  <div class="demo">
    <p class="value">count = {{ counter }}</p>
    <div class="row">
      <button class="btn" @click="increment">count++</button>
      <button class="btn" :disabled="stopped" @click="stopScope">scope.stop()</button>
    </div>
    <ul class="logs">
      <li v-for="(log, i) in logs" :key="i">{{ log }}</li>
    </ul>
    <p class="hint">先点几次 count++ 观察两条日志；stop() 之后再点 count++，不再有任何输出。</p>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  flex-direction: column;
}

.value {
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  margin-bottom: 12px;
}

.row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.btn {
  margin-right: 8px;
  margin-bottom: 8px;
  padding: 4px 14px;
  border: 1px solid var(--color-accent);
  border-radius: 980px;
  color: var(--color-accent);
  font-size: 13px;
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
}

.btn:hover:not(:disabled) {
  background: var(--color-accent-soft);
}

.btn:disabled {
  opacity: 0.4;
}

.logs {
  margin: 8px 0 0;
  padding: 8px 12px;
  max-height: 160px;
  overflow-y: auto;
  list-style: none;
  background: var(--color-bg-sunken);
  border-radius: 8px;
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 12px;
  line-height: 1.8;
}

.hint {
  margin-top: 8px;
  font-size: 13px;
  color: var(--color-text-secondary);
}
</style>
