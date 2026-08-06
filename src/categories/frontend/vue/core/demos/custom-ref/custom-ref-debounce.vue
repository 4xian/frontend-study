<script setup lang="ts">
/* customRef 防抖演示：连续输入时不同步，停顿 400ms 后一次性触发更新（自包含，可作 playground 初始代码） */
import { customRef, ref } from 'vue'

/**
 * 创建一个防抖 ref，在写入后延迟指定时间更新并触发依赖。
 */
function useDebouncedRef(initial: string, delay = 400) {
  let value = initial
  let timeout: ReturnType<typeof setTimeout> | undefined
  return customRef<string>((track, trigger) => ({
    get() {
      track()
      return value
    },
    set(newValue) {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        value = newValue
        trigger()
      }, delay)
    },
  }))
}

const text = useDebouncedRef('hello')

const normal = ref('hello')
</script>

<template>
  <div class="demo">
    <div class="row">
      <label class="label">防抖 ref（400ms）</label>
      <input v-model="text" class="input" placeholder="连续输入试试" />
      <span class="mirror">镜像：{{ text }}</span>
    </div>
    <div class="row">
      <label class="label">普通 ref</label>
      <input v-model="normal" class="input" placeholder="对照组" />
      <span class="mirror">镜像：{{ normal }}</span>
    </div>
    <p class="hint">
      上面的输入框连续打字时右侧镜像纹丝不动，停顿 400ms 后一次性同步；下面的普通 ref
      每敲一个字符都会同步。
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
  margin-bottom: 10px;
}

.label {
  width: 130px;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.input {
  padding: 5px 10px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 14px;
  outline: none;
}

.input:focus {
  border-color: var(--color-accent);
}

.mirror {
  margin-left: 12px;
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 13px;
}

.hint {
  margin-top: 4px;
  font-size: 13px;
  color: var(--color-text-secondary);
}
</style>
