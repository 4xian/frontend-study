<script lang="ts">
/* watch 触发时序动画：源变化 → 批量调度 → pre 回调 → 组件更新 → post 回调
   机制依据：vuejs.org/guide/essentials/watchers（Callback Flush Timing：默认 pre 在组件更新前、post 在更新后、sync 立即），2026-07-26 查证 */

/** 每步解说文字 */
export const steps = [
  '响应式源发生变化（count.value++）。sync 侦听器此刻立即同步执行，不参与批量调度。',
  '默认（pre）侦听器进入批量队列：同一 tick 内的多次修改会被合并，回调只调用一次。',
  'pre 回调执行：此时组件尚未重新渲染，回调里读到的 DOM 还是旧的。',
  '组件更新：Vue 用新状态重新渲染，DOM 更新完成。',
  'post 回调执行（flush: "post" / watchPostEffect）：此时可以安全访问更新后的 DOM。',
]
</script>

<script setup lang="ts">
const props = defineProps<{ step: number }>()

/** 时序节点定义：标签 + 激活步骤 */
const nodes = [
  { label: '源变化', sub: 'count++', at: 0 },
  { label: 'sync 回调', sub: '立即执行', at: 0 },
  { label: '批量调度', sub: '合并去重', at: 1 },
  { label: 'pre 回调', sub: 'DOM 未更新', at: 2 },
  { label: '组件更新', sub: '重新渲染', at: 3 },
  { label: 'post 回调', sub: 'DOM 已更新', at: 4 },
]
</script>

<template>
  <div class="stage">
    <div class="timeline">
      <template v-for="(node, i) in nodes" :key="node.label">
        <span v-if="i > 0" class="link" :class="{ active: props.step >= node.at }" />
        <div class="node" :class="{ active: props.step >= node.at, hot: props.step === node.at }">
          <p class="node-label">{{ node.label }}</p>
          <p class="node-sub">{{ node.sub }}</p>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.stage {
  padding: 16px 0;
  overflow-x: auto;
}

.timeline {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 560px;
}

.node {
  flex-shrink: 0;
  padding: 10px 12px;
  border: 2px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  text-align: center;
  opacity: 0.4;
  transition:
    opacity var(--duration-slow) var(--ease-out),
    border-color var(--duration-slow) var(--ease-out),
    box-shadow var(--duration-slow) var(--ease-out);
}

.node.active {
  opacity: 1;
}

.node.hot {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 4px var(--color-accent-soft);
}

.node-label {
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.node-sub {
  margin-top: 2px;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.link {
  flex-shrink: 0;
  width: 22px;
  height: 2px;
  margin: 0 4px;
  background: var(--color-border-strong);
  opacity: 0.35;
  transition:
    opacity var(--duration-slow) var(--ease-out),
    background-color var(--duration-slow) var(--ease-out);
}

.link.active {
  opacity: 1;
  background: var(--color-accent);
}
</style>
