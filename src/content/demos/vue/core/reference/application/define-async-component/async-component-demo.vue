<script setup lang="ts">
import { defineAsyncComponent, defineComponent, h, shallowRef } from 'vue'
import type { Component } from 'vue'

const activeComponent = shallowRef<Component | null>(null)
const activeLabel = shallowRef('尚未开始加载')

/** 模拟一次有固定延迟的组件请求。 */
function fakeLoad(delay: number, shouldFail: boolean): Promise<Component> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error('模拟网络错误'))
        return
      }
      resolve(
        defineComponent({
          /** 渲染成功加载后的真实组件。 */
          setup() {
            return () => h('div', { class: 'ready' }, '真实组件已就绪')
          },
        }),
      )
    }, delay)
  })
}

const LoadingPanel = defineComponent({
  /** 渲染加载状态。 */
  setup() {
    return () => h('div', { class: 'loading' }, 'Loading...')
  },
})

const ErrorPanel = defineComponent({
  props: { error: { type: Error, required: true } },
  /** 渲染 loader 传来的错误信息。 */
  setup(props) {
    return () => h('div', { class: 'error', role: 'alert' }, `加载失败：${props.error.message}`)
  },
})

/** 创建一个全新的异步组件定义，保证每次操作都会执行新的 loader。 */
function createAsyncPanel(shouldFail: boolean) {
  return defineAsyncComponent({
    loader: () => fakeLoad(shouldFail ? 800 : 1200, shouldFail),
    loadingComponent: LoadingPanel,
    errorComponent: ErrorPanel,
    delay: 200,
  })
}

/** 启动一次成功或失败的真实加载流程。 */
function startLoad(shouldFail: boolean) {
  activeLabel.value = shouldFail ? '失败流程：800ms 后显示错误' : '成功流程：1200ms 后显示组件'
  activeComponent.value = createAsyncPanel(shouldFail)
}
</script>

<template>
  <div class="demo">
    <div class="actions">
      <button class="btn" @click="startLoad(false)">加载成功组件</button>
      <button class="btn" @click="startLoad(true)">加载失败组件</button>
    </div>
    <div class="slot-box">
      <component :is="activeComponent" v-if="activeComponent" />
      <span v-else class="placeholder">选择一种加载流程</span>
    </div>
    <p class="value">{{ activeLabel }}</p>
    <p class="hint">每次点击都会创建新的异步组件外壳，因此 loader 会真实重新执行。</p>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  flex-direction: column;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.btn {
  margin-right: 8px;
  margin-bottom: 8px;
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

.slot-box {
  display: flex;
  align-items: center;
  min-height: 40px;
  padding: 8px 12px;
  border: 1px dashed #d2d2d7;
  border-radius: 8px;
}

.placeholder,
.demo :deep(.loading) {
  color: #6e6e73;
  font-size: 13px;
}

.demo :deep(.ready) {
  color: #248a3d;
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 13px;
}

.demo :deep(.error) {
  color: #d70015;
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 13px;
}

.value,
.hint {
  margin-top: 8px;
  font-size: 13px;
}

.hint {
  color: #6e6e73;
}
</style>
