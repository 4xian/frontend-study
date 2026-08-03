<script setup lang="ts">
/* createApp 演示：动态创建与卸载独立迷你应用（自包含，可作 playground 初始代码） */
import { createApp, defineComponent, h, inject, onUnmounted, ref, shallowRef } from 'vue'
import type { App } from 'vue'

const host = ref<HTMLElement | null>(null)
const status = ref('未挂载')
const miniApp = shallowRef<App | null>(null)

/**
 * 创建迷你根组件的响应式状态与渲染函数。
 */
function setupMiniRoot() {
  const count = ref(0)
  const message = inject('message', '')

  /** 增加迷你应用内部的独立计数。 */
  function incrementMiniCount(): void {
    count.value++
  }

  /** 渲染迷你应用根节点。 */
  function renderMiniRoot() {
    return h('div', { class: 'mini' }, [
      h('p', {}, `app.provide 注入的 message = ${message}`),
      h(
        'button',
        { class: 'btn', onClick: incrementMiniCount },
        `独立应用内 count = ${count.value}`,
      ),
    ])
  }

  return renderMiniRoot
}

const MiniRoot = defineComponent({
  name: 'MiniRoot',
  setup: setupMiniRoot,
})

/**
 * 创建新的应用实例并挂载到当前演示容器。
 */
function mountMini(): void {
  if (miniApp.value || !host.value) return

  const app = createApp(MiniRoot)
  app.provide('message', 'hello from app.provide')
  const rootInstance = app.mount(host.value)

  miniApp.value = app
  status.value = `已挂载，mount() 返回根组件实例（$el.tagName = ${(rootInstance.$el as HTMLElement).tagName}）`
}

/**
 * 卸载当前迷你应用并放弃已挂载的应用实例。
 */
function unmountMini(): void {
  if (!miniApp.value) return

  miniApp.value.unmount()
  miniApp.value = null
  status.value = '已卸载；再次挂载会创建新的应用实例'
}

onUnmounted(unmountMini)
</script>

<template>
  <div class="demo">
    <div class="row">
      <button class="btn" :disabled="Boolean(miniApp)" @click="mountMini">createApp + mount</button>
      <button class="btn" :disabled="!miniApp" @click="unmountMini">unmount</button>
    </div>
    <div ref="host" class="host"></div>
    <p class="value">{{ status }}</p>
    <p class="hint">
      迷你应用与承载此 Demo 的应用相互独立；卸载后不会复用旧 app，而是在下次点击时重新创建。
    </p>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  flex-direction: column;
}

.row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.btn {
  margin-right: 8px;
  padding: 4px 14px;
  border: 1px solid #0071e3;
  border-radius: 980px;
  color: #0071e3;
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 13px;
}

.btn:hover:not(:disabled) {
  background: rgba(0, 113, 227, 0.1);
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.host {
  min-height: 64px;
  padding: 10px 12px;
  border: 1px dashed #d2d2d7;
  border-radius: 8px;
}

.demo :deep(.mini p) {
  margin: 0 0 8px;
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 13px;
}

.demo :deep(.mini .btn) {
  margin-right: 0;
}

.value {
  margin-top: 8px;
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 13px;
}

.hint {
  margin-top: 4px;
  color: #6e6e73;
  font-size: 13px;
}
</style>
