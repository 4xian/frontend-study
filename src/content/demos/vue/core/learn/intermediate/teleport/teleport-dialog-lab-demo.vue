<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'

const open = ref(false)
const renderInline = ref(false)
const closeCount = ref(0)
const triggerElement = ref<HTMLButtonElement | null>(null)
const dialogElement = ref<HTMLElement | null>(null)
const closeButtonElement = ref<HTMLButtonElement | null>(null)

const renderLocation = computed(() => (renderInline.value ? 'DOM：原地' : 'DOM：body'))
const summary = computed(
  () =>
    `模式：${renderInline.value ? '行内内容区' : '覆盖层'}；状态：${open.value ? '已打开' : '已关闭'}；关闭次数：${closeCount.value}`,
)

/** 设置课程应用的 inert 状态，避免 overlay 打开时背景仍可交互。 */
function setApplicationInert(inert: boolean): void {
  const appRoot = document.getElementById('app')
  if (appRoot) appRoot.inert = inert
}

/** 记录触发元素，打开对话框并在 overlay 模式聚焦关闭按钮。 */
async function openDialog(event: MouseEvent): Promise<void> {
  if (event.currentTarget instanceof HTMLButtonElement) triggerElement.value = event.currentTarget
  open.value = true
  setApplicationInert(!renderInline.value)
  await nextTick()
  if (!renderInline.value) closeButtonElement.value?.focus()
}

/** 切换同一 Teleport 的实际渲染位置。 */
function toggleRenderMode(): void {
  renderInline.value = !renderInline.value
}

/** 关闭内容区，撤销 inert 并把焦点还给打开前的按钮。 */
async function closeDialog(): Promise<void> {
  open.value = false
  closeCount.value += 1
  setApplicationInert(false)
  await nextTick()
  triggerElement.value?.focus()
}

/** 返回 overlay 对话框内可参与 Tab 循环的控件。 */
function getFocusableElements(): HTMLElement[] {
  if (!dialogElement.value) return []
  return Array.from(
    dialogElement.value.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
    ),
  )
}

/** 在 overlay 模式处理 Escape 与 Tab 焦点循环；行内模式不制造模态陷阱。 */
function handlePanelKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    event.preventDefault()
    void closeDialog()
    return
  }
  if (renderInline.value || event.key !== 'Tab') return

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
  } else if (!dialogElement.value?.contains(document.activeElement)) {
    event.preventDefault()
    first.focus()
  }
}

onBeforeUnmount(() => setApplicationInert(false))
</script>

<template>
  <article class="teleport-dialog-lab-demo">
    <header class="demo-heading">
      <p class="eyebrow">Teleport 对话框实验台</p>
      <h3>让逻辑归属和 DOM 位置分别承担自己的职责</h3>
      <p>先打开 body 覆盖层，再切换为同一 Teleport 的行内内容区，比较语义与键盘边界。</p>
    </header>

    <p
      class="summary-line"
      data-state="teleport-summary"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ summary }}
    </p>

    <section class="lab-section" aria-labelledby="teleport-mode-title">
      <div class="section-heading">
        <p class="section-number">01 · Render location</p>
        <h4 id="teleport-mode-title">选择实际 DOM 位置</h4>
        <p data-state="render-location">{{ renderLocation }}</p>
      </div>
      <div class="control-row">
        <button
          type="button"
          data-testid="teleport-inline-toggle"
          :aria-pressed="renderInline"
          :disabled="open"
          @click="toggleRenderMode"
        >
          {{ renderInline ? '切回 body 覆盖层' : '改为原地渲染' }}
        </button>
        <button type="button" data-testid="open-teleport-dialog" @click="openDialog">
          {{ renderInline ? '打开行内内容区' : '打开 Teleport 对话框' }}
        </button>
      </div>
    </section>

    <section class="lab-section" aria-labelledby="teleport-parent-title">
      <div class="section-heading">
        <p class="section-number">02 · Logical ownership</p>
        <h4 id="teleport-parent-title">关闭事件仍由当前课程组件统计</h4>
        <p>
          父组件收到的关闭事件：<strong data-state="parent-close-count">{{ closeCount }}</strong>
        </p>
      </div>
      <p class="explanation">
        确认、取消和 Escape 都在当前 SFC 更新计数；body 只是 overlay 的输出位置。
      </p>
    </section>

    <Teleport to="body" :disabled="renderInline">
      <Transition name="teleport-dialog">
        <section
          v-if="open"
          ref="dialogElement"
          :class="['teleport-panel', { 'is-overlay': !renderInline, 'is-inline': renderInline }]"
          :role="renderInline ? 'region' : 'dialog'"
          :aria-modal="renderInline ? undefined : 'true'"
          aria-labelledby="teleport-dialog-title"
          :data-testid="renderInline ? 'teleport-inline-panel' : 'teleport-overlay-dialog'"
          @click.self="!renderInline && closeDialog()"
          @keydown="handlePanelKeydown"
        >
          <div class="dialog-content">
            <p class="panel-kicker">{{ renderInline ? '原地内容区' : 'body 下的覆盖层' }}</p>
            <h4 id="teleport-dialog-title">Teleport 对话框实验</h4>
            <p>
              {{
                renderInline
                  ? '此模式保留在课程 Demo 内，是普通内容区，不声明 aria-modal。'
                  : '此模式移动到 body；焦点停留在对话框内，背景应用已 inert。'
              }}
            </p>
            <div class="dialog-actions">
              <button
                ref="closeButtonElement"
                type="button"
                data-testid="teleport-dialog-close"
                @click="closeDialog"
              >
                取消并关闭
              </button>
              <button
                type="button"
                data-testid="teleport-dialog-confirm"
                class="secondary-button"
                @click="closeDialog"
              >
                确认并关闭
              </button>
            </div>
          </div>
        </section>
      </Transition>
    </Teleport>
  </article>
</template>

<style scoped>
.teleport-dialog-lab-demo {
  width: 100%;
  max-width: 920px;
  min-width: 0;
}

.demo-heading,
.lab-section,
.section-heading,
.control-row,
.dialog-content,
.dialog-actions {
  min-width: 0;
}

.demo-heading {
  padding: 4px 2px 2px;
}

.eyebrow,
.section-number,
.panel-kicker {
  color: var(--color-accent);
  font-size: var(--font-size-xs);
  font-weight: 700;
  letter-spacing: 0;
}

.demo-heading h3,
.section-heading h4,
.dialog-content h4 {
  color: var(--color-text);
  overflow-wrap: anywhere;
}

.demo-heading h3 {
  margin-top: 5px;
  font-size: var(--font-size-lg);
  line-height: 1.35;
}

.demo-heading > p:last-child,
.section-heading > p:last-child,
.dialog-content > p:not(.panel-kicker),
.explanation {
  margin-top: 8px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.summary-line {
  min-width: 0;
  margin-top: 16px;
  padding: 12px 14px;
  border-left: 3px solid var(--color-accent);
  background: var(--color-accent-soft);
  color: var(--color-text);
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: var(--font-size-sm);
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.lab-section {
  padding: 20px 2px;
  border-top: 1px solid var(--color-border);
}

.lab-section:first-of-type {
  margin-top: 18px;
}

.section-heading h4,
.dialog-content h4 {
  margin-top: 4px;
  font-size: var(--font-size-md);
  line-height: 1.4;
}

.section-heading strong {
  color: var(--color-text);
}

.control-row,
.dialog-actions {
  display: flex;
  flex-wrap: wrap;
  margin: 9px -5px -5px;
}

.control-row button,
.dialog-actions button {
  min-width: 44px;
  min-height: 44px;
  margin: 5px;
  padding: 10px 16px;
  border: 1px solid var(--color-accent);
  border-radius: 7px;
  background: var(--color-accent);
  color: var(--color-on-accent);
  font: inherit;
  font-size: var(--font-size-sm);
  font-weight: 700;
  line-height: 1.4;
  overflow-wrap: anywhere;
  cursor: pointer;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out),
    opacity var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.control-row button:disabled {
  cursor: not-allowed;
  opacity: 0.48;
}

.control-row button:hover:not(:disabled),
.dialog-actions button:hover {
  opacity: 0.86;
}

.control-row button:active:not(:disabled),
.dialog-actions button:active {
  transform: scale(0.98);
}

.control-row button:focus-visible,
.dialog-actions button:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--color-accent) 28%, transparent);
  outline-offset: 2px;
}

.secondary-button {
  border-color: var(--color-border) !important;
  background: var(--color-bg-elevated) !important;
  color: var(--color-text) !important;
}

.teleport-panel {
  min-width: 0;
}

.teleport-panel.is-inline {
  margin-top: 16px;
  padding: 16px;
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-accent);
  border-radius: 8px;
  background: var(--color-bg-sunken);
}

.teleport-panel.is-overlay {
  position: fixed;
  inset: 0;
  z-index: 360;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  background: var(--color-bg-scrim);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.teleport-panel.is-overlay .dialog-content {
  width: min(540px, calc(100vw - 2 * var(--space-4)));
  max-height: calc(100vh - 2 * var(--space-4));
  padding: 20px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg-elevated);
  box-shadow: var(--shadow-lg);
  overflow-y: auto;
}

.dialog-actions {
  margin-top: 14px;
}

.teleport-dialog-enter-active,
.teleport-dialog-leave-active {
  transition: opacity 180ms var(--ease-out);
}

.teleport-dialog-enter-active .dialog-content,
.teleport-dialog-leave-active .dialog-content {
  transition:
    transform 180ms var(--ease-out),
    opacity 180ms var(--ease-out);
}

.teleport-dialog-enter-from,
.teleport-dialog-leave-to {
  opacity: 0;
}

.teleport-dialog-enter-from .dialog-content,
.teleport-dialog-leave-to .dialog-content {
  opacity: 0;
  transform: translateY(8px);
}

@media (max-width: 480px) {
  .control-row,
  .dialog-actions {
    flex-direction: column;
    margin-right: 0;
    margin-left: 0;
  }

  .control-row button,
  .dialog-actions button {
    width: 100%;
    margin-right: 0;
    margin-left: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .control-row button,
  .dialog-actions button,
  .teleport-dialog-enter-active,
  .teleport-dialog-leave-active,
  .teleport-dialog-enter-active .dialog-content,
  .teleport-dialog-leave-active .dialog-content {
    transition: none;
  }

  .teleport-dialog-enter-from .dialog-content,
  .teleport-dialog-leave-to .dialog-content {
    transform: none;
  }
}
</style>
