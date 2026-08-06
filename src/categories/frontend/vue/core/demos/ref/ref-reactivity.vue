<script lang="ts">
/* ref 响应式原理动画：访问 .value 收集依赖 → 修改 .value 触发依赖 → 组件重渲染
   机制依据：vuejs.org/guide/extras/reactivity-in-depth（track/trigger 模型），2026-07-26 查证 */

/** 每步解说文字 */
export const steps = [
  '一个 ref 内部维护着自己的订阅者集合（dep）。组件的渲染函数是一个"响应式副作用"（effect）。',
  '渲染函数执行时读取 count.value，触发 getter：ref 调用 track()，把当前正在运行的 effect（渲染函数）加入自己的订阅者集合——这就是依赖收集。',
  '代码执行 count.value = 1，触发 setter：ref 调用 trigger()，遍历订阅者集合，通知所有依赖它的 effect 重新执行。',
  '渲染 effect 重新运行，组件用新值重新渲染，页面更新。整个过程无需手动通知，由 getter/setter 自动完成。',
]
</script>

<script setup lang="ts">
const props = defineProps<{ step: number }>()
</script>

<template>
  <div class="stage">
    <div class="row">
      <div class="node ref-node" :class="{ hot: props.step === 2 }">
        <p class="node-title">ref(count)</p>
        <p class="node-sub">value: {{ props.step >= 2 ? 1 : 0 }}</p>
        <div class="dep" :class="{ filled: props.step >= 1 }">
          <span class="dep-label">dep 订阅者</span>
          <span v-if="props.step >= 1" class="dep-item">渲染 effect</span>
          <span v-else class="dep-empty">（空）</span>
        </div>
      </div>

      <div class="flow">
        <span class="arrow track" :class="{ active: props.step === 1 }">← track() 收集</span>
        <span class="arrow trigger" :class="{ active: props.step >= 2 }">trigger() 通知 →</span>
      </div>

      <div class="node effect-node" :class="{ hot: props.step === 1 || props.step === 3 }">
        <p class="node-title">渲染 effect</p>
        <p class="node-sub">读取 count.value</p>
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
  width: 170px;
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
