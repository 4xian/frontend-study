<script setup lang="ts">
import {
  defineComponent,
  h,
  onBeforeMount,
  onBeforeUnmount,
  onBeforeUpdate,
  onMounted,
  onUnmounted,
  onUpdated,
  ref,
} from 'vue'

const show = ref(false)
const count = ref(0)
const logs = ref<string[]>([])

/** 追加一条生命周期日志。 */
function log(name: string) {
  logs.value.push(`${logs.value.length + 1}. ${name}`)
}

/** 注册六个核心钩子，供父组件触发挂载、更新和卸载。 */
const Child = defineComponent({
  props: { count: { type: Number, required: true } },
  /** 注册当前子组件的生命周期钩子并返回渲染函数。 */
  setup(props) {
    onBeforeMount(() => log('onBeforeMount'))
    onMounted(() => log('onMounted'))
    onBeforeUpdate(() => log('onBeforeUpdate'))
    onUpdated(() => log('onUpdated'))
    onBeforeUnmount(() => log('onBeforeUnmount'))
    onUnmounted(() => log('onUnmounted'))
    return () => h('p', { class: 'child' }, `子组件存活中，count = ${props.count}`)
  },
})
</script>

<template>
  <div class="demo">
    <div class="row">
      <button @click="((show = !show), (logs = []))">
        {{ show ? '卸载子组件' : '挂载子组件' }}
      </button>
      <button :disabled="!show" @click="count++">更新 props（count++）</button>
    </div>
    <Child v-if="show" :count="count" />
    <ol class="logs">
      <li v-for="item in logs" :key="item">{{ item }}</li>
    </ol>
    <p v-if="!logs.length" class="hint">点击「挂载子组件」，观察钩子的调用顺序</p>
  </div>
</template>

<style scoped>
.demo {
  font-size: 14px;
}

.row {
  display: flex;
}

button {
  padding: 6px 14px;
  margin-right: 8px;
  border: 1px solid #d2d2d7;
  border-radius: 8px;
  background: transparent;
  font: inherit;
  color: inherit;
  cursor: pointer;
}

button:disabled {
  opacity: 0.4;
  cursor: default;
}

.child {
  margin-top: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(0, 113, 227, 0.08);
  color: #0071e3;
}

.logs {
  margin-top: 12px;
  padding-left: 20px;
  font-family: ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: 13px;
}

.logs li {
  margin-top: 2px;
}

.hint {
  margin-top: 12px;
  opacity: 0.6;
}
</style>
