<script setup lang="ts">
/* readonly 演示：修改只读代理被拒绝，修改原始对象仍同步到代理（自包含，可作 playground 初始代码） */
import { reactive, readonly, ref } from 'vue'

const original = reactive({ count: 0 })
const copy = readonly(original)
const attempts = ref(0)

/**
 * 尝试修改只读代理；写入不会生效，开发模式下会输出警告。
 */
function mutateCopy() {
  attempts.value++
  // @ts-expect-error 只读代理禁止写入，此处故意演示失败行为
  copy.count++
}

/**
 * 修改原始对象，使变更同步反映到只读代理并触发视图更新。
 */
function mutateOriginal() {
  original.count++
}
</script>

<template>
  <div class="demo">
    <div class="row">
      <p class="value">original.count = {{ original.count }}</p>
      <p class="value">copy.count = {{ copy.count }}</p>
    </div>
    <div class="row">
      <button class="btn" @click="mutateCopy">copy.count++（被拒绝）</button>
      <button class="btn" @click="mutateOriginal">original.count++（同步生效）</button>
    </div>
    <p class="hint">
      已尝试直接修改只读代理 {{ attempts }} 次，均未生效（开发模式下控制台会输出警告）
    </p>
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
  margin-bottom: 8px;
}

.value {
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  margin-right: 16px;
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

.hint {
  color: var(--color-text-secondary);
  font-size: 13px;
}
</style>
