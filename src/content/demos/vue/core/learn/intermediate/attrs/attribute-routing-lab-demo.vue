<script setup lang="ts">
import { computed, ref } from 'vue'
import ForwardedActionButton from './parts/ForwardedActionButton.vue'

const emphasized = ref(true)
const nativeClickCount = ref(0)
const inspectCount = ref(0)
const latestInspectPayload = ref<number | null>(null)
const resetVersion = ref(0)
const parentStyle = computed(() => ({
  borderColor: emphasized.value ? '#0071e3' : '#86868b',
  borderWidth: '2px',
}))

/** 记录父级透传到原生按钮的 click。 */
function recordNativeClick(): void {
  nativeClickCount.value += 1
}

/** 记录子组件通过已声明 emits 发出的检查事件。 */
function recordInspect(localCount: number): void {
  inspectCount.value += 1
  latestInspectPayload.value = localCount
}

/** 切换父级提供的强调 class 与边框颜色。 */
function toggleEmphasis(): void {
  emphasized.value = !emphasized.value
}

/** 重置父级计数并重新创建子组件以清空其本地计数。 */
function resetCounts(): void {
  nativeClickCount.value = 0
  inspectCount.value = 0
  latestInspectPayload.value = null
  resetVersion.value += 1
}
</script>

<template>
  <article class="attribute-routing-lab-demo">
    <header class="demo-heading">
      <p class="eyebrow">Attributes 路由实验</p>
      <h3>把调用方输入交给语义目标</h3>
      <p>观察已声明输入如何被消费，其余 class、style、data、ARIA 与 click 如何只落到按钮。</p>
    </header>

    <ForwardedActionButton
      :key="resetVersion"
      label="检查透传"
      class="parent-accent"
      :class="{ 'parent-emphasis': emphasized }"
      :style="parentStyle"
      data-course-id="attrs-01"
      aria-label="检查 Attributes 透传"
      @click="recordNativeClick"
      @inspect="recordInspect"
    />

    <section class="parent-status" aria-labelledby="parent-status-title">
      <h4 id="parent-status-title">父级观察结果</h4>
      <div class="status-list">
        <p>父级原生 click：{{ nativeClickCount }}</p>
        <p>父级 inspect：{{ inspectCount }}</p>
        <p aria-live="polite">最近 inspect 载荷：{{ latestInspectPayload ?? '尚未检查' }}</p>
        <p>父级强调：{{ emphasized ? '已开启' : '已关闭' }}</p>
      </div>
    </section>

    <div class="demo-actions" aria-label="实验操作">
      <button type="button" @click="toggleEmphasis">切换父级强调</button>
      <button type="button" @click="resetCounts">重置计数</button>
    </div>
  </article>
</template>

<style scoped>
.attribute-routing-lab-demo {
  width: 100%;
  max-width: 920px;
  min-width: 0;
}

.demo-heading {
  min-width: 0;
  padding: 4px 2px 2px;
}

.eyebrow {
  color: var(--color-accent);
  font-size: var(--font-size-xs);
  font-weight: 700;
}

.demo-heading h3,
.parent-status h4 {
  color: var(--color-text);
  overflow-wrap: anywhere;
}

.demo-heading h3 {
  margin-top: 5px;
  font-size: var(--font-size-lg);
  line-height: 1.35;
}

.demo-heading > p:last-child {
  margin-top: 8px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.parent-status {
  min-width: 0;
  margin-top: 16px;
  padding: 17px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg-sunken);
}

.parent-status h4 {
  font-size: var(--font-size-sm);
  line-height: 1.4;
}

.status-list {
  display: flex;
  flex-wrap: wrap;
  min-width: 0;
  margin: 7px -4px -4px;
}

.status-list p {
  flex: 1 1 210px;
  min-width: 0;
  margin: 4px;
  padding: 9px 11px;
  border-left: 3px solid var(--color-accent);
  background: var(--color-bg-elevated);
  color: var(--color-text-secondary);
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: var(--font-size-sm);
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.demo-actions {
  display: flex;
  flex-wrap: wrap;
  min-width: 0;
  margin: 12px -4px -4px;
}

.demo-actions button {
  flex: 1 1 190px;
  min-width: 0;
  min-height: 44px;
  margin: 4px;
  padding: 9px 13px;
  border: 1px solid var(--color-accent);
  border-radius: 7px;
  background: var(--color-bg-elevated);
  color: var(--color-accent);
  font: inherit;
  font-size: var(--font-size-sm);
  font-weight: 650;
  line-height: 1.4;
  white-space: normal;
  overflow-wrap: anywhere;
  cursor: pointer;
}

.demo-actions button:hover {
  background: var(--color-accent);
  color: var(--color-on-accent);
}

.demo-actions button:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

@media (max-width: 480px) {
  .demo-heading {
    padding-right: 0;
    padding-left: 0;
  }

  .status-list,
  .demo-actions {
    flex-direction: column;
    margin-right: 0;
    margin-left: 0;
  }

  .status-list p,
  .demo-actions button {
    width: 100%;
    flex: 0 0 auto;
    margin-right: 0;
    margin-left: 0;
  }
}
</style>
