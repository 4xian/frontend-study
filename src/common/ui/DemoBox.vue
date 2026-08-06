<script setup lang="ts">
/* 演示容器：上方真实运行区 + 可选描述 + 下方源码折叠区（需求文档 §5.2） */
import { ref, shallowRef, watchEffect } from 'vue'
import type { Component } from 'vue'
import CodeBlock from './CodeBlock.vue'
import { resolveDemo } from '@/common/content/demo-registry'

const props = defineProps<{
  id: string
  desc?: string
  playground?: boolean
}>()

/** demo 运行组件（shallowRef：组件对象不需要深层响应式） */
const demo = shallowRef<Component | null>(null)
/** demo 源码字符串（?raw 同源导入） */
const source = ref('')
/** 源码区是否展开 */
const showSource = ref(false)

// 完整 ID 变化时重新解析组件与同源源码。
watchEffect(async () => {
  const asset = resolveDemo(props.id)
  demo.value = asset?.component ?? null
  source.value = asset ? await asset.loadSource() : ''
})
</script>

<template>
  <div class="demo-box">
    <p v-if="props.desc" class="desc">{{ props.desc }}</p>
    <div class="stage">
      <component :is="demo" v-if="demo" />
      <p v-else class="missing">未找到演示组件：{{ props.id }}</p>
    </div>
    <div class="actions">
      <button
        type="button"
        class="action-btn"
        :aria-expanded="showSource"
        @click="showSource = !showSource"
      >
        {{ showSource ? '收起源码' : '查看源码' }}
      </button>
    </div>
    <Transition name="source">
      <div v-if="showSource" class="source">
        <CodeBlock :code="source" lang="vue" />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.demo-box {
  margin: var(--space-6) 0;
}

.desc {
  margin-bottom: var(--space-3);
  font-size: var(--font-size-base);
  line-height: 1.7;
  color: var(--color-text-secondary);
}

.stage {
  min-width: 0;
  padding: var(--space-5);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
}

.missing {
  color: var(--color-warning);
  font-size: var(--font-size-sm);
}

.actions {
  display: flex;
  align-items: center;
  margin-top: var(--space-2);
}

.action-btn {
  min-height: 36px;
  padding: 0 var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-accent);
  touch-action: manipulation;
  transition:
    color var(--duration-fast) var(--ease-out),
    background-color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out),
    opacity var(--duration-fast) var(--ease-out);
}

.action-btn:hover:not(:disabled) {
  color: var(--color-accent);
  background: var(--color-accent-soft);
}

.action-btn:active:not(:disabled) {
  transform: scale(0.97);
  opacity: 0.72;
}

.source {
  margin-top: var(--space-2);
}

.source :deep(.code-block) {
  margin: 0;
}

.source-enter-active,
.source-leave-active {
  transition:
    opacity 220ms var(--ease-out),
    transform 220ms var(--ease-out);
}

.source-enter-from,
.source-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (prefers-reduced-motion: reduce) {
  .action-btn {
    transition:
      color var(--duration-fast) linear,
      background-color var(--duration-fast) linear,
      opacity var(--duration-fast) linear;
  }

  .action-btn:active:not(:disabled) {
    transform: none;
  }

  .source-enter-active,
  .source-leave-active {
    transition: opacity 120ms linear;
  }

  .source-enter-from,
  .source-leave-to {
    transform: none;
  }
}
</style>
