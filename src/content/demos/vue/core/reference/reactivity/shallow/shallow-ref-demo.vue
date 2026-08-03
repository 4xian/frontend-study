<script setup lang="ts">
/* shallowRef 演示：深层修改不触发更新 vs 替换 .value 触发更新，triggerRef 强制触发（自包含，可作 playground 初始代码） */
import { shallowRef, triggerRef } from 'vue'

const state = shallowRef({ count: 0 })

/**
 * 直接修改内部对象属性；内部值会变化，但不会触发视图更新。
 */
function mutateDeep() {
  state.value.count++
}

/**
 * 整体替换浅层 ref 的值，触发视图更新。
 */
function replaceValue() {
  state.value = { count: state.value.count + 1 }
}

/**
 * 手动触发依赖该 shallowRef 的副作用，将内部变化更新到视图。
 */
function forceTrigger() {
  triggerRef(state)
}
</script>

<template>
  <div class="demo">
    <p class="value">视图渲染的 count = {{ state.count }}</p>
    <div class="row">
      <button class="btn" @click="mutateDeep">state.value.count++（深层修改）</button>
      <button class="btn" @click="replaceValue">state.value = {...}（整体替换）</button>
      <button class="btn" @click="forceTrigger">triggerRef(state)</button>
    </div>
    <p class="hint">
      连点几次"深层修改"：内部值一直在增加，但视图纹丝不动；再点"triggerRef"或"整体替换"，累积的真实值会一次性刷出来。
    </p>
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

.btn:hover {
  background: var(--color-accent-soft);
}

.hint {
  margin-top: 4px;
  font-size: 13px;
  color: var(--color-text-secondary);
}
</style>
