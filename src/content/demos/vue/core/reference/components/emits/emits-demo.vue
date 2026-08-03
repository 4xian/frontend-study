<script setup lang="ts">
/* defineEmits 演示：子组件 emit 上报，父组件监听更新状态（自包含，可作 playground 初始代码） */
import { defineComponent, h, ref } from 'vue'

const total = ref(0)
const logs = ref<string[]>([])

/**
 * 内联子组件：两个按钮分别 emit 不同数量，事件用运行时数组声明
 */
const Stepper = defineComponent({
  emits: ['add'],
  /** 返回两个使用不同载荷触发 add 事件的按钮。 */
  setup(_, { emit }) {
    return () =>
      h('div', { class: 'stepper' }, [
        h('button', { class: 'btn', onClick: () => emit('add', 1) }, "emit('add', 1)"),
        h('button', { class: 'btn', onClick: () => emit('add', 10) }, "emit('add', 10)"),
      ])
  },
})

/**
 * 父组件监听 add 事件：累加数量并记录日志
 */
function onAdd(step: number) {
  total.value += step
  logs.value.push(`收到 add 事件，参数 ${step}，total = ${total.value}`)
}
</script>

<template>
  <div class="demo">
    <p class="value">父组件 total = {{ total }}</p>
    <Stepper @add="onAdd" />
    <ul class="logs">
      <li v-for="(log, i) in logs" :key="i">{{ log }}</li>
    </ul>
    <p class="hint">
      数据在父组件手里，子组件只负责"喊话"——@add 监听器本质是传给子组件的 onAdd 函数 prop。
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

.demo :deep(.stepper) {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.demo :deep(.btn) {
  margin-right: 8px;
  padding: 4px 14px;
  border: 1px solid #0071e3;
  border-radius: 980px;
  color: #0071e3;
  font-size: 13px;
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
}

.demo :deep(.btn:hover) {
  background: rgba(0, 113, 227, 0.1);
}

.logs {
  margin: 8px 0 0;
  padding: 8px 12px;
  max-height: 140px;
  overflow-y: auto;
  list-style: none;
  background: #f5f5f7;
  border-radius: 8px;
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 12px;
  line-height: 1.8;
}

.hint {
  margin-top: 8px;
  font-size: 13px;
  color: #6e6e73;
}
</style>
