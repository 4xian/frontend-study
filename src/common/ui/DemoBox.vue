<script setup lang="ts">
/* 演示容器：上方真实运行区 + 可选描述 + 下方源码折叠区（需求文档 §5.2） */
import { computed, ref, shallowRef, watch } from 'vue'
import type { Component } from 'vue'
import CodeBlock from './CodeBlock.vue'
import { resolveDemo } from '@/common/content/demo-registry'
import type { ResolvedDemoAsset } from '@/common/content/demo-registry'

const props = defineProps<{
  id: string
  desc?: string
  playground?: boolean
}>()

/** 已按需加载的 React Demo 宿主 Adapter。 */
const ReactDemoHost = shallowRef<Component | null>(null)
/** 当前 Demo 的运行时资产。 */
const asset = shallowRef<ResolvedDemoAsset | null>(null)
/** React Demo 宿主 Adapter 的局部加载错误。 */
const reactHostError = ref('')
/** demo 源码字符串（?raw 同源导入） */
const source = ref('')
/** 源码区是否展开 */
const showSource = ref(false)
/** 按当前运行时选择源码高亮语言。 */
const sourceLanguage = computed(() => (asset.value?.runtime === 'react' ? 'tsx' : 'vue'))
let reactHostLoadId = 0

/** 把未知异常转换为当前 stage 可展示的信息。 */
function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

/** 仅在 React Demo stage 中加载宿主 Adapter，并隔离加载失败。 */
async function loadReactDemoHost(): Promise<void> {
  const loadId = ++reactHostLoadId
  reactHostError.value = ''
  try {
    const hostModule = await import('./ReactDemoHost.vue')
    if (loadId === reactHostLoadId && asset.value?.runtime === 'react') {
      ReactDemoHost.value = hostModule.default
    }
  } catch (error) {
    if (loadId === reactHostLoadId && asset.value?.runtime === 'react') {
      reactHostError.value = getErrorMessage(error)
    }
  }
}

/** 通过新页面环境清除浏览器缓存的失败 ESM 模块。 */
function reloadPage(): void {
  window.location.reload()
}

watch(
  () => props.id,
  async (id, _previousId, onCleanup) => {
    let cancelled = false
    onCleanup(() => {
      cancelled = true
    })
    const nextAsset = resolveDemo(id)
    reactHostLoadId += 1
    reactHostError.value = ''
    asset.value = nextAsset
    source.value = ''
    showSource.value = false
    if (nextAsset?.runtime === 'react') {
      if (!ReactDemoHost.value) void loadReactDemoHost()
      return
    }
    if (nextAsset?.runtime === 'vue') {
      const nextSource = await nextAsset.loadSource()
      if (!cancelled) source.value = nextSource
    }
  },
  { immediate: true },
)

watch(showSource, async (expanded) => {
  const currentAsset = asset.value
  if (!expanded || source.value || currentAsset?.runtime !== 'react') return
  const nextSource = await currentAsset.loadSource()
  if (showSource.value && asset.value === currentAsset) source.value = nextSource
})
</script>

<template>
  <div class="demo-box">
    <p v-if="props.desc" class="desc">{{ props.desc }}</p>
    <div class="stage">
      <component :is="asset.component" v-if="asset?.runtime === 'vue'" />
      <template v-else-if="asset?.runtime === 'react'">
        <component
          :is="ReactDemoHost"
          v-if="ReactDemoHost"
          :key="props.id"
          :load-component="asset.loadComponent"
        />
        <div v-else-if="reactHostError" class="adapter-error" role="alert">
          <strong>React Demo 宿主加载失败</strong>
          <span>{{ reactHostError }}</span>
          <button type="button" @click="reloadPage">重新加载页面</button>
        </div>
        <p v-else class="adapter-status" role="status">正在加载 React Demo...</p>
      </template>
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
        <CodeBlock :code="source" :lang="sourceLanguage" />
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

.adapter-status {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.adapter-error {
  color: var(--color-danger);
}

.adapter-error span {
  display: block;
  margin-top: var(--space-1);
  color: var(--color-text-secondary);
}

.adapter-error button {
  min-height: 36px;
  padding: 0 var(--space-3);
  margin-top: var(--space-3);
  border: 1px solid currentColor;
  border-radius: var(--radius-sm);
  color: inherit;
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
