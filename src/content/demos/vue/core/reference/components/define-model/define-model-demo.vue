<script setup lang="ts">
/* defineModel 演示：子组件双向绑定与父组件互相同步（自包含，可作 playground 初始代码） */
import { defineComponent, h, ref } from 'vue'

const text = ref('hello')

/**
 * 内联子组件：用 modelValue prop + update:modelValue 事件实现 v-model 协议
 * （等价于 <script setup> 里的 defineModel()，此处用选项式写法内联展示协议本身）
 */
const MyInput = defineComponent({
  props: { modelValue: { type: String, required: true } },
  emits: ['update:modelValue'],
  /** 实现 defineModel 编译后使用的 modelValue 更新协议。 */
  setup(props, { emit }) {
    return () =>
      h('input', {
        class: 'input',
        value: props.modelValue,
        onInput: (e: Event) => emit('update:modelValue', (e.target as HTMLInputElement).value),
      })
  },
})
</script>

<template>
  <div class="demo">
    <div class="row">
      <label class="label">子组件（v-model）</label>
      <MyInput v-model="text" />
    </div>
    <div class="row">
      <label class="label">父组件直接改</label>
      <button class="btn" @click="text = '来自父组件'">text = '来自父组件'</button>
    </div>
    <p class="value">父组件的 text = {{ text }}</p>
    <p class="hint">
      在子组件输入框打字，父组件的 text 实时更新；点按钮从父侧赋值，输入框内容也立刻变化——双向同步。
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
  margin-bottom: 10px;
}

.label {
  width: 140px;
  font-size: 13px;
  color: #6e6e73;
}

.demo :deep(.input) {
  padding: 5px 10px;
  border: 1px solid #d2d2d7;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
}

.demo :deep(.input:focus) {
  border-color: #0071e3;
}

.btn {
  padding: 4px 14px;
  border: 1px solid #0071e3;
  border-radius: 980px;
  color: #0071e3;
  font-size: 13px;
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
}

.btn:hover {
  background: rgba(0, 113, 227, 0.1);
}

.value {
  margin-top: 4px;
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
}

.hint {
  margin-top: 4px;
  font-size: 13px;
  color: #6e6e73;
}
</style>
