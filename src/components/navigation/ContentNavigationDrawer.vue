<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps<{
  open: boolean
  title: string
}>()
const emit = defineEmits<{ close: [] }>()

/** 关闭按钮引用 */
const closeButtonEl = ref<HTMLButtonElement | null>(null)
/** 抽屉面板引用 */
const drawerPanelEl = ref<HTMLElement | null>(null)

let returnFocusEl: HTMLElement | null = null

// 打开后聚焦关闭按钮，关闭后将焦点交还给触发控件。
watch(
  () => props.open,
  async (open) => {
    if (open) {
      returnFocusEl = document.activeElement instanceof HTMLElement ? document.activeElement : null
      await nextTick()
      closeButtonEl.value?.focus()
    } else if (returnFocusEl) {
      await nextTick()
      returnFocusEl.focus()
      returnFocusEl = null
    }
  },
  { immediate: true },
)

/**
 * 请求调用方关闭抽屉。
 */
function closeDrawer(): void {
  emit('close')
}

/**
 * 返回抽屉内当前可聚焦的元素。
 */
function getFocusableElements(): HTMLElement[] {
  if (!drawerPanelEl.value) return []
  return Array.from(
    drawerPanelEl.value.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  )
}

/**
 * 在抽屉打开时响应 Esc 关闭与 Tab 焦点循环。
 */
function onKeydown(event: KeyboardEvent): void {
  if (!props.open) return
  if (event.key === 'Escape') {
    event.preventDefault()
    closeDrawer()
    return
  }
  if (event.key !== 'Tab') return

  const focusable = getFocusableElements()
  if (!focusable.length) return
  const first = focusable[0]!
  const last = focusable.at(-1)!

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  } else if (!drawerPanelEl.value?.contains(document.activeElement)) {
    event.preventDefault()
    first.focus()
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <Transition name="navigation-drawer">
      <div v-if="props.open" class="navigation-drawer-overlay" @click.self="closeDrawer">
        <aside
          ref="drawerPanelEl"
          class="navigation-drawer-panel"
          role="dialog"
          aria-modal="true"
          :aria-label="props.title"
        >
          <header class="navigation-drawer-header">
            <h2>{{ props.title }}</h2>
            <button
              ref="closeButtonEl"
              type="button"
              class="drawer-close"
              :aria-label="`关闭${props.title}`"
              :title="`关闭${props.title}`"
              @click="closeDrawer"
            >
              <span aria-hidden="true">×</span>
            </button>
          </header>
          <div class="navigation-drawer-content">
            <slot />
          </div>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.navigation-drawer-overlay {
  position: fixed;
  inset: 0;
  z-index: 240;
  background: var(--color-bg-scrim);
}

.navigation-drawer-panel {
  width: min(320px, calc(100vw - var(--space-6)));
  height: 100%;
  padding: var(--space-4);
  background: var(--color-bg-elevated);
  box-shadow: var(--shadow-lg);
  overflow-y: auto;
}

.navigation-drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--color-border);
}

.navigation-drawer-header h2 {
  font-size: var(--font-size-md);
}

.drawer-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-left: var(--space-3);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  font-size: var(--font-size-lg);
}

.drawer-close:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.navigation-drawer-content {
  padding-top: var(--space-3);
}

.navigation-drawer-enter-active,
.navigation-drawer-leave-active {
  transition: opacity var(--duration-fast) var(--ease-out);
}

.navigation-drawer-enter-active .navigation-drawer-panel,
.navigation-drawer-leave-active .navigation-drawer-panel {
  transition: transform var(--duration-fast) var(--ease-out);
}

.navigation-drawer-enter-from,
.navigation-drawer-leave-to {
  opacity: 0;
}

.navigation-drawer-enter-from .navigation-drawer-panel,
.navigation-drawer-leave-to .navigation-drawer-panel {
  transform: translateX(-100%);
}

@media (prefers-reduced-motion: reduce) {
  .navigation-drawer-enter-active,
  .navigation-drawer-leave-active,
  .navigation-drawer-enter-active .navigation-drawer-panel,
  .navigation-drawer-leave-active .navigation-drawer-panel {
    transition: none;
  }
}
</style>
