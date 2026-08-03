<script lang="ts">
/* computed 缓存原理动画：首次求值收集依赖 → 依赖未变走缓存 → 依赖变化标脏重算
   机制依据：vuejs.org/guide/essentials/computed（基于响应式依赖缓存，依赖不变不重算），2026-07-26 查证 */

/** 每步解说文字 */
export const steps = [
  '首次读取 computed 的 .value：getter 执行，读取 count.value 时把自己注册为 count 的订阅者（依赖收集），结果 2 被缓存。',
  '再次读取 .value：依赖 count 没有变化，getter 不执行，直接返回缓存值 2。这是 computed 与普通方法调用的本质区别。',
  'count.value 被修改为 5：count 触发订阅者，computed 只是把自己标记为"脏"（dirty），此刻并不立即重算。',
  '下一次读取 .value 时发现脏标记：getter 重新执行，得到新结果 6 并更新缓存，脏标记清除。',
]
</script>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ step: number }>()

/** 缓存槽展示的值 */
const cacheText = computed(() => (props.step >= 3 ? '6' : '2'))
</script>

<template>
  <div class="stage">
    <div class="row">
      <div class="node" :class="{ hot: props.step === 2 }">
        <p class="node-title">count</p>
        <p class="node-sub">value: {{ props.step >= 2 ? 5 : 1 }}</p>
      </div>

      <div class="flow">
        <span class="arrow" :class="{ active: props.step === 0 }">依赖收集 ←</span>
        <span class="arrow" :class="{ active: props.step === 2 }">标脏 →</span>
      </div>

      <div class="node wide" :class="{ hot: props.step === 0 || props.step === 3 }">
        <p class="node-title">computed(() => count + 1)</p>
        <div class="badges">
          <span class="badge" :class="{ on: props.step === 1 }">缓存 {{ cacheText }}</span>
          <span class="badge dirty" :class="{ on: props.step === 2 }">dirty</span>
          <span class="badge run" :class="{ on: props.step === 0 || props.step === 3 }">
            getter 执行
          </span>
        </div>
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
  padding: 14px 18px;
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

.node.wide {
  min-width: 230px;
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

.badges {
  display: flex;
  flex-wrap: wrap;
  margin-top: 10px;
}

.badge {
  margin-right: 6px;
  margin-top: 4px;
  padding: 2px 10px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  background: var(--color-bg-sunken);
  color: var(--color-text-tertiary);
  transition:
    background-color var(--duration-slow) var(--ease-out),
    color var(--duration-slow) var(--ease-out);
}

.badge.on {
  background: var(--color-accent-soft);
  color: var(--color-accent);
  font-weight: 600;
}

.badge.dirty.on {
  background: var(--color-warning-bg);
  color: var(--color-warning);
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
  transition: opacity var(--duration-slow) var(--ease-out);
}

.arrow.active {
  opacity: 1;
  color: var(--color-accent);
  font-weight: 600;
}
</style>
