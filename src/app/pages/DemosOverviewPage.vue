<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { learningCatalog } from '@/app/catalog'
import DemoBox from '@/common/ui/DemoBox.vue'
import type { DomainId } from '@/common/catalog'

const props = defineProps<{
  domain: DomainId
  technology: string
  module: string
}>()

const route = useRoute()
const selectedDemoId = ref<string | null>(null)

/** 返回当前模块显式登记的轻量 Demo 清单。 */
const demos = computed(() => learningCatalog.getDemos(props))

/** 返回用户已经选择的本地 Demo。 */
const selectedDemo = computed(() =>
  demos.value.find((demo) => demo.kind === 'local' && demo.id === selectedDemoId.value),
)

/** 选择一个本地 Demo 后再加载其组件与同源源码。 */
function selectDemo(id: string): void {
  selectedDemoId.value = id
}

watch(
  [demos, () => route.query.demo],
  ([availableDemos, requestedDemo]) => {
    selectedDemoId.value = availableDemos.some(
      (demo) => demo.kind === 'local' && demo.id === requestedDemo,
    )
      ? String(requestedDemo)
      : null
  },
  { immediate: true },
)
</script>

<template>
  <main class="demo-overview">
    <header class="demo-header">
      <p>真实源码</p>
      <h1>Demo</h1>
      <span>运行效果与源码展示来自同一份组件文件。</span>
    </header>
    <p v-if="!demos.length" class="empty-state">当前模块尚未登记 Demo。</p>
    <div v-else class="demo-list">
      <template v-for="demo in demos" :key="demo.id">
        <a
          v-if="demo.kind === 'external'"
          class="demo-link"
          :href="demo.url"
          target="_blank"
          rel="noopener noreferrer"
        >
          <strong>{{ demo.title }}</strong>
          <span>在线 Demo</span>
        </a>
        <button
          v-else
          type="button"
          class="demo-link"
          :aria-pressed="selectedDemoId === demo.id"
          @click="selectDemo(demo.id)"
        >
          <strong>{{ demo.title }}</strong>
          <span>本地 Demo</span>
        </button>
      </template>
    </div>
    <section v-if="selectedDemo" class="demo-item">
      <h2>{{ selectedDemo.title }}</h2>
      <DemoBox :id="selectedDemo.id" />
    </section>
  </main>
</template>

<style scoped>
.demo-overview {
  width: min(var(--content-shell-width), 100%);
  padding: var(--space-6) var(--space-4) var(--space-8);
  margin: 0 auto;
}

.demo-header {
  padding-bottom: var(--space-5);
  border-bottom: 1px solid var(--color-border);
}

.demo-header p {
  color: var(--color-accent);
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.demo-header h1 {
  margin-top: var(--space-1);
  font-size: 36px;
}

.demo-header span,
.empty-state,
.demo-link span {
  display: block;
  margin-top: var(--space-2);
  color: var(--color-text-secondary);
}

.demo-list {
  display: flex;
  flex-wrap: wrap;
  margin: var(--space-4) -6px -12px;
}

.demo-link {
  display: flex;
  width: calc(50% - 12px);
  min-height: 88px;
  align-items: flex-start;
  flex-direction: column;
  padding: var(--space-3);
  margin: 0 6px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
  color: var(--color-text);
  text-align: left;
  cursor: pointer;
}

.demo-link:hover,
.demo-link[aria-pressed='true'] {
  border-color: var(--color-accent);
}

.demo-link span {
  margin-top: var(--space-1);
  font-size: var(--font-size-sm);
}

.demo-item {
  padding-top: var(--space-5);
  border-bottom: 1px solid var(--color-border);
}

.demo-item h2 {
  font-size: var(--font-size-lg);
  text-transform: capitalize;
}

@media (max-width: 700px) {
  .demo-link {
    width: calc(100% - 12px);
  }
}
</style>
