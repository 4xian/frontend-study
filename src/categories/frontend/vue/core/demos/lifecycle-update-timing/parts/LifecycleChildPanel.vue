<script setup lang="ts">
import {
  onBeforeMount,
  onBeforeUnmount,
  onBeforeUpdate,
  onMounted,
  onUnmounted,
  onUpdated,
} from 'vue'

interface Props {
  count: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  recordEntry: [entry: string]
}>()

/** 向父组件的非响应式缓冲区报告一条生命周期事件。 */
function report(entry: string): void {
  emit('recordEntry', entry)
}

onBeforeMount(() => report('子组件 onBeforeMount'))
onMounted(() => report('子组件 onMounted'))
onBeforeUpdate(() => report('子组件 onBeforeUpdate'))
onUpdated(() => report('子组件 onUpdated'))
onBeforeUnmount(() => report('子组件 onBeforeUnmount'))
onUnmounted(() => report('子组件 onUnmounted'))
</script>

<template>
  <section class="lifecycle-child-panel" aria-labelledby="lifecycle-child-title">
    <p class="child-label">私有 LifecycleChildPanel</p>
    <h5 id="lifecycle-child-title">子组件接收最新 Props</h5>

    <div class="count-display">
      <span>Props count</span>
      <strong>{{ props.count }}</strong>
    </div>

    <p class="child-note">此组件只读取 count，并在六个核心生命周期钩子中报告阶段名称。</p>
  </section>
</template>

<style scoped>
.lifecycle-child-panel {
  min-width: 0;
  min-height: 190px;
  margin-top: 14px;
  padding: 18px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg-sunken);
}

.child-label {
  color: var(--color-accent);
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: var(--font-size-xs);
  font-weight: 700;
  overflow-wrap: anywhere;
}

.lifecycle-child-panel h5 {
  margin-top: 5px;
  color: var(--color-text);
  font-size: var(--font-size-md);
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.count-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
  margin-top: 18px;
  padding: 14px;
  border-left: 3px solid var(--color-accent);
  background: var(--color-accent-soft);
}

.count-display span {
  min-width: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  overflow-wrap: anywhere;
}

.count-display strong {
  flex: 0 0 auto;
  margin-left: 12px;
  color: var(--color-text);
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 32px;
  line-height: 1.1;
}

.child-note {
  margin-top: 14px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.55;
  overflow-wrap: anywhere;
}

@media (max-width: 480px) {
  .lifecycle-child-panel {
    padding: 16px;
  }
}
</style>
