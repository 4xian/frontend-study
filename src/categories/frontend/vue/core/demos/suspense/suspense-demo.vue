<script setup lang="ts">
import { defineComponent, h, ref } from 'vue'

const round = ref(0)

/** 创建一个延迟指定时间完成 async setup 的演示组件。 */
function makeAsyncPanel(label: string, delay: number) {
  return defineComponent({
    /** 等待指定时长后返回异步面板的渲染函数。 */
    async setup() {
      await new Promise((resolve) => setTimeout(resolve, delay))
      return () => h('div', { class: 'panel' }, `${label}（耗时 ${delay}ms）已就绪`)
    },
  })
}

const FastPanel = makeAsyncPanel('快组件', 500)
const SlowPanel = makeAsyncPanel('慢组件', 1500)

/** 重新挂载 Suspense 子树，以再次观察聚合加载过程。 */
function reload() {
  round.value++
}
</script>

<template>
  <div class="demo">
    <button class="btn" @click="reload">重新加载</button>
    <Suspense :key="round">
      <div class="panels">
        <FastPanel />
        <SlowPanel />
      </div>
      <template #fallback>
        <div class="fallback">Loading...（等待最慢的异步依赖）</div>
      </template>
    </Suspense>
    <p class="hint">快组件在 500ms 后就绪，边界仍会等待 1500ms 的慢组件，再一次性显示正式内容。</p>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  flex-direction: column;
}

.btn {
  align-self: flex-start;
  margin-bottom: 10px;
  padding: 4px 14px;
  border: 1px solid #0071e3;
  border-radius: 980px;
  color: #0071e3;
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 13px;
}

.btn:hover {
  background: rgba(0, 113, 227, 0.1);
}

.demo :deep(.panels) {
  display: flex;
  flex-direction: column;
}

.demo :deep(.panel) {
  margin-bottom: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(52, 199, 89, 0.15);
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 13px;
}

.fallback {
  padding: 8px 12px;
  border-radius: 8px;
  color: #6e6e73;
  background: #f5f5f7;
  font-size: 13px;
}

.hint {
  margin-top: 8px;
  color: #6e6e73;
  font-size: 13px;
}
</style>
