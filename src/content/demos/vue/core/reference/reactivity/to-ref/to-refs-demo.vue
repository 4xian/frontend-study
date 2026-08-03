<script setup lang="ts">
/* toRefs 对比演示：直接解构 reactive 失去响应性，toRefs 解构保持响应性（自包含，可作 playground 初始代码） */
import { reactive, toRefs } from 'vue'

const state = reactive({ count: 0 })

// 直接解构：plainCount 只是解构那一刻的普通数字，与 state.count 断开
const { count: plainCount } = state

// toRefs 解构：refCount 是与 state.count 双向同步的 ref
const { count: refCount } = toRefs(state)
</script>

<template>
  <div class="demo">
    <button class="btn" @click="state.count++">state.count++</button>
    <div class="row">
      <span class="label">state.count（源对象）</span>
      <span class="value live">{{ state.count }}</span>
    </div>
    <div class="row">
      <span class="label">直接解构 const { count } = state</span>
      <span class="value dead">{{ plainCount }}</span>
      <span class="note">停在解构那一刻，不再更新</span>
    </div>
    <div class="row">
      <span class="label">toRefs 解构 const { count } = toRefs(state)</span>
      <span class="value live">{{ refCount }}</span>
      <span class="note">与源对象保持同步</span>
    </div>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  flex-direction: column;
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 13px;
}

.btn {
  align-self: flex-start;
  margin-bottom: 12px;
  padding: 4px 14px;
  border: 1px solid var(--color-accent);
  border-radius: 980px;
  color: var(--color-accent);
  font-size: 13px;
  font-family: inherit;
}

.btn:hover {
  background: var(--color-accent-soft);
}

.row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.label {
  min-width: 260px;
  margin-right: 12px;
}

.value {
  min-width: 32px;
  margin-right: 12px;
  text-align: center;
  border-radius: 6px;
  padding: 2px 8px;
  font-weight: 600;
}

.live {
  color: var(--color-accent);
  background: var(--color-accent-soft);
}

.dead {
  color: var(--color-warning);
  background: var(--color-warning-bg);
}

.note {
  color: var(--color-text-tertiary);
  font-size: 12px;
}
</style>
