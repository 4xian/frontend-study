<script lang="ts">
/* reactive 响应式原理动画：Proxy get 拦截中 track 收集依赖 → set 拦截中 trigger 触发更新
   机制依据：vuejs.org/guide/extras/reactivity-in-depth（Proxy get/set 拦截伪代码、track/trigger 模型），2026-07-26 查证 */

/** 每步解说文字 */
export const steps = [
  'reactive(obj) 返回一个 Proxy 代理。属性读取会命中 get 拦截器，属性写入会命中 set 拦截器；组件的渲染函数是一个"响应式副作用"（effect）。',
  '渲染函数执行时读取 state.count，命中 get 拦截器：Vue 调用 track(target, key)，把当前正在运行的 effect（渲染函数）加入该属性的订阅者集合——依赖收集完成。',
  '代码执行 state.count = 1，命中 set 拦截器：先把新值写入原始对象，再调用 trigger(target, key)，找到该属性的订阅者集合并逐个通知重新执行。',
  '渲染 effect 重新运行，组件用新值重新渲染，页面更新。读取走 get→track、写入走 set→trigger，整个闭环由 Proxy 自动完成。',
]
</script>

<script setup lang="ts">
const props = defineProps<{ step: number }>()
</script>

<template>
  <div class="stage">
    <div class="row">
      <div class="node proxy-node" :class="{ hot: props.step === 2 }">
        <p class="node-title">Proxy(state)</p>
        <p class="node-sub">count: {{ props.step >= 2 ? 1 : 0 }}</p>
        <div class="trap" :class="{ active: props.step === 1 }">get 拦截 → track()</div>
        <div class="trap" :class="{ active: props.step === 2 }">set 拦截 → trigger()</div>
        <div class="dep" :class="{ filled: props.step >= 1 }">
          <span class="dep-label">count 的订阅者</span>
          <span v-if="props.step >= 1" class="dep-item">渲染 effect</span>
          <span v-else class="dep-empty">（空）</span>
        </div>
      </div>

      <div class="flow">
        <span class="arrow track" :class="{ active: props.step === 1 }">← 读取 state.count</span>
        <span class="arrow trigger" :class="{ active: props.step >= 2 }">通知重新执行 →</span>
      </div>

      <div class="node effect-node" :class="{ hot: props.step === 1 || props.step === 3 }">
        <p class="node-title">渲染 effect</p>
        <p class="node-sub">读取 state.count</p>
        <p class="render" :class="{ active: props.step >= 3 }">
          {{ props.step >= 3 ? '重新渲染 ✓' : '已渲染' }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stage {
  padding: 12px 0;
}

.row {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}

.node {
  width: 190px;
  padding: 14px;
  border: 2px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  transition:
    border-color var(--duration-slow) var(--ease-out),
    box-shadow var(--duration-slow) var(--ease-out);
}

.node.hot {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 4px var(--color-accent-soft);
}

.node-title {
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-weight: 600;
  font-size: var(--font-size-sm);
}

.node-sub {
  margin-top: 4px;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
}

.trap {
  margin-top: 8px;
  padding: 4px 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  transition:
    border-color var(--duration-slow) var(--ease-out),
    color var(--duration-slow) var(--ease-out),
    background-color var(--duration-slow) var(--ease-out);
}

.trap.active {
  border-color: var(--color-accent);
  background: var(--color-accent-soft);
  color: var(--color-accent);
  font-weight: 600;
}

.dep {
  margin-top: 10px;
  padding: 8px;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  transition: border-color var(--duration-slow) var(--ease-out);
}

.dep.filled {
  border-color: var(--color-accent);
}

.dep-label {
  display: block;
  color: var(--color-text-tertiary);
}

.dep-item {
  display: inline-block;
  margin-top: 4px;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  background: var(--color-accent-soft);
  color: var(--color-accent);
}

.dep-empty {
  color: var(--color-text-tertiary);
}

.flow {
  display: flex;
  flex-direction: column;
  margin: 0 18px;
}

.arrow {
  margin: 6px 0;
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  opacity: 0.35;
  transition:
    opacity var(--duration-slow) var(--ease-out),
    color var(--duration-slow) var(--ease-out);
}

.arrow.active {
  opacity: 1;
  color: var(--color-accent);
  font-weight: 600;
}

.render {
  margin-top: 10px;
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  transition: color var(--duration-slow) var(--ease-out);
}

.render.active {
  color: var(--color-accent);
  font-weight: 600;
}
</style>
