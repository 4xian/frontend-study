<script setup lang="ts">
/* props 单向数据流演示：父改 prop 同步到子，子直接改 prop 失败（自包含，可作 playground 初始代码） */
import { defineComponent, h, ref } from 'vue'

const parentCount = ref(0)
const message = ref('')

/**
 * 内联子组件：接收 count prop 并提供一个"尝试直接修改 prop"的按钮
 */
const Child = defineComponent({
  props: { count: { type: Number, required: true } },
  emits: ['tried'],
  /** 返回 prop 展示与受控的错误修改演示。 */
  setup(props, { emit }) {
    /**
     * 尝试直接给 prop 赋值：不生效，开发模式控制台会输出警告
     */
    function tryMutate() {
      // @ts-expect-error 演示目的：props 是只读的
      props.count = 999
      emit('tried', props.count)
    }
    return () =>
      h('div', { class: 'child' }, [
        h('p', {}, `子组件收到的 count = ${props.count}`),
        h('button', { class: 'btn', onClick: tryMutate }, '子组件内 props.count = 999'),
      ])
  },
})

/**
 * 子组件尝试修改 prop 后的回报：值仍是父组件的值
 */
function onTried(val: number) {
  message.value = `子组件尝试赋值 999 后，count 实际仍为 ${val}（控制台有只读警告）`
}
</script>

<template>
  <div class="demo">
    <div class="row">
      <button class="btn" @click="parentCount++">父组件 count++（当前 {{ parentCount }}）</button>
    </div>
    <Child :count="parentCount" @tried="onTried" />
    <p v-if="message" class="hint">{{ message }}</p>
    <p class="hint">父组件的修改单向流入子组件；子组件反向赋值被拒绝——这就是单向数据流。</p>
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

.demo :deep(.child) {
  padding: 10px 12px;
  border: 1px dashed #d2d2d7;
  border-radius: 8px;
  margin-bottom: 8px;
}

.demo :deep(.child p) {
  margin: 0 0 8px;
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 13px;
}

.demo :deep(.btn) {
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

.hint {
  margin-top: 4px;
  font-size: 13px;
  color: #6e6e73;
}
</style>
