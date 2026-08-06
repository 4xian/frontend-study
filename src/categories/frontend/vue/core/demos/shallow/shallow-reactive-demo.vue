<script setup lang="ts">
/* shallowReactive 演示：根级属性响应式，嵌套对象不转换（自包含，可作 playground 初始代码） */
import { isReactive, shallowReactive } from 'vue'

const state = shallowReactive({
  foo: 0,
  nested: { bar: 0 },
})

/**
 * 修改根级响应式属性并触发视图更新。
 */
function mutateRoot() {
  state.foo++
}

/**
 * 修改未转换为响应式代理的嵌套属性，不触发视图更新。
 */
function mutateNested() {
  state.nested.bar++
}
</script>

<template>
  <div class="demo">
    <p class="value">state.foo = {{ state.foo }}，state.nested.bar = {{ state.nested.bar }}</p>
    <p class="value">isReactive(state.nested) = {{ isReactive(state.nested) }}</p>
    <div class="row">
      <button class="btn" @click="mutateRoot">state.foo++（根级，触发）</button>
      <button class="btn" @click="mutateNested">state.nested.bar++（嵌套，不触发）</button>
    </div>
    <p class="hint">
      连点"嵌套"按钮后再点一次"根级"按钮：根级更新引发的重渲染会把 bar
      的真实值一并带出来——值一直在变，只是没人通知视图。
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
  margin-bottom: 8px;
}

.row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 4px;
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
