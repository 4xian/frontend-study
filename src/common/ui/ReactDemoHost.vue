<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { Root } from 'react-dom/client'
import type { ReactComponentLoader } from '@/common/content/demo-registry'

const props = defineProps<{
  loadComponent: ReactComponentLoader
}>()

const container = ref<HTMLElement | null>(null)
const errorMessage = ref('')
let activeLoad = 0
let root: Root | null = null

/** 把未知异常转换为宿主可展示的信息。 */
function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

/** 同步卸载当前 React root，并释放容器所有权。 */
function unmountRoot(): void {
  root?.unmount()
  root = null
}

/** 将 React root 错误隔离为当前 Demo 的可见失败状态。 */
function reportError(error: unknown): void {
  errorMessage.value = getErrorMessage(error)
}

/** 保留已由 React Error Boundary 接管的局部失败。 */
function preserveCaughtError(): void {
  // 局部 fallback 已承接失败，不再升级为宿主错误。
}

/** 按需加载 React runtime 与目标组件，并创建唯一 root。 */
async function mountRoot(): Promise<void> {
  const loadId = ++activeLoad
  unmountRoot()
  errorMessage.value = ''
  const currentContainer = container.value
  if (!currentContainer) return

  try {
    const [{ StrictMode, createElement }, { createRoot }, componentModule] = await Promise.all([
      import('react'),
      import('react-dom/client'),
      props.loadComponent(),
    ])
    if (loadId !== activeLoad || container.value !== currentContainer) return

    root = createRoot(currentContainer, {
      onCaughtError: preserveCaughtError,
      onRecoverableError: reportError,
      onUncaughtError: reportError,
    })
    root.render(createElement(StrictMode, null, createElement(componentModule.default)))
  } catch (error) {
    if (loadId === activeLoad) reportError(error)
  }
}

onMounted(() => void mountRoot())

onBeforeUnmount(() => {
  activeLoad += 1
  unmountRoot()
})
</script>

<template>
  <div class="react-demo-host">
    <div ref="container" class="react-demo-container"></div>
    <div v-if="errorMessage" class="react-demo-error" role="alert">
      <strong>React Demo 运行失败</strong>
      <span>{{ errorMessage }}</span>
      <button type="button" @click="mountRoot">重新加载</button>
    </div>
  </div>
</template>

<style scoped>
.react-demo-host,
.react-demo-container {
  min-width: 0;
}

.react-demo-error {
  padding: var(--space-3);
  border: 1px solid var(--color-danger);
  border-radius: var(--radius-sm);
  color: var(--color-danger);
}

.react-demo-error span {
  display: block;
  margin-top: var(--space-1);
  color: var(--color-text-secondary);
}

.react-demo-error button {
  min-height: 36px;
  padding: 0 var(--space-3);
  margin-top: var(--space-3);
  border: 1px solid currentColor;
  border-radius: var(--radius-sm);
  color: inherit;
}
</style>
