<script setup lang="ts">
/* KeepAlive 演示：缓存与非缓存切换的状态对照（自包含，可作 playground 初始代码） */
import { defineComponent, h, ref } from 'vue'

const current = ref<'CounterA' | 'CounterB'>('CounterA')

/**
 * 创建一个带内部计数状态的组件：用于观察切换后状态是否保留
 */
function makeCounter(label: string) {
  return defineComponent({
    name: label,
    /** 创建计数状态并返回组件渲染函数。 */
    setup() {
      const count = ref(0)
      return () =>
        h('div', { class: 'counter' }, [
          h('span', {}, `${label} 内部 count = ${count.value}`),
          h('button', { class: 'btn', onClick: () => count.value++ }, 'count++'),
        ])
    },
  })
}

const comps = {
  CounterA: makeCounter('CounterA'),
  CounterB: makeCounter('CounterB'),
}

/**
 * 在 A / B 两个组件间切换
 */
function toggle() {
  current.value = current.value === 'CounterA' ? 'CounterB' : 'CounterA'
}
</script>

<template>
  <div class="demo">
    <button class="btn switch" @click="toggle">
      切换到 {{ current === 'CounterA' ? 'CounterB' : 'CounterA' }}
    </button>
    <p class="caption">KeepAlive 包裹：切回时计数还在</p>
    <KeepAlive>
      <component :is="comps[current]" />
    </KeepAlive>
    <p class="caption">普通切换：每次切回都从 0 开始</p>
    <component :is="comps[current]" />
    <p class="hint">
      给两个区域各点几次 count++
      再来回切换：上方状态保留（实例被缓存），下方状态清零（实例被销毁重建）。
    </p>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  flex-direction: column;
}

.caption {
  margin: 8px 0 4px;
  font-size: 13px;
  font-weight: 600;
}

.demo :deep(.counter) {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border: 1px dashed #d2d2d7;
  border-radius: 8px;
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 13px;
}

.demo :deep(.btn) {
  margin-left: 12px;
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

.switch {
  align-self: flex-start;
  margin-left: 0;
}

.hint {
  margin-top: 8px;
  font-size: 13px;
  color: #6e6e73;
}
</style>
