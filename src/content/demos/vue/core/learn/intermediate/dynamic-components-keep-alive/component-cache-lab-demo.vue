<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Component } from 'vue'
import EditorPanel from './parts/EditorPanel.vue'
import PreviewPanel from './parts/PreviewPanel.vue'
import SettingsPanel from './parts/SettingsPanel.vue'

type PanelId = 'editor' | 'preview' | 'settings'

interface PanelOption {
  id: PanelId
  label: string
  component: Component
}

const panels: PanelOption[] = [
  { id: 'editor', label: '编辑', component: EditorPanel },
  { id: 'preview', label: '预览', component: PreviewPanel },
  { id: 'settings', label: '设置', component: SettingsPanel },
]

const activePanelId = ref<PanelId>('editor')
const cacheEnabled = ref(true)
const cacheEpoch = ref(0)

const activePanel = computed(() => panels.find((panel) => panel.id === activePanelId.value)!)
const cacheToggleLabel = computed(() => (cacheEnabled.value ? '关闭缓存' : '开启缓存'))
const cacheSummary = computed(
  () =>
    `当前：${activePanel.value.label}；缓存：${cacheEnabled.value ? '开启' : '关闭'}；最多缓存：2`,
)

/** 切换到指定工作面板。 */
function selectPanel(panelId: PanelId): void {
  activePanelId.value = panelId
}

/** 切换组件实例缓存模式。 */
function toggleCache(): void {
  cacheEnabled.value = !cacheEnabled.value
}

/** 恢复实验初态并清空当前 KeepAlive 缓存。 */
function resetLab(): void {
  activePanelId.value = 'editor'
  cacheEnabled.value = true
  cacheEpoch.value += 1
}
</script>

<template>
  <article class="component-cache-lab-demo">
    <header class="demo-heading">
      <p class="eyebrow">组件缓存实验台</p>
      <h3>比较保留、重建与 LRU 淘汰</h3>
      <p>修改活动面板的局部计数，再按不同缓存模式和访问顺序切换三个工作面板。</p>
    </header>

    <p
      class="summary-line"
      data-state="cache-summary"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ cacheSummary }}
    </p>

    <nav class="panel-switcher" aria-label="选择动态组件">
      <button
        v-for="panel in panels"
        :key="panel.id"
        type="button"
        :data-panel-option="panel.id"
        :class="{ active: activePanelId === panel.id }"
        :aria-pressed="activePanelId === panel.id"
        @click="selectPanel(panel.id)"
      >
        {{ panel.label }}
      </button>
    </nav>

    <div class="mode-controls" aria-label="缓存实验控制">
      <button
        type="button"
        data-testid="cache-toggle"
        :class="{ active: cacheEnabled }"
        :aria-pressed="cacheEnabled"
        @click="toggleCache"
      >
        {{ cacheToggleLabel }}
      </button>
      <button type="button" data-testid="reset-cache-lab" @click="resetLab">重置实验</button>
    </div>

    <div class="panel-stage">
      <Transition name="panel" mode="out-in">
        <KeepAlive v-if="cacheEnabled" :key="cacheEpoch" :max="2">
          <component :is="activePanel.component" :key="activePanelId" />
        </KeepAlive>
        <component v-else :is="activePanel.component" :key="`${cacheEpoch}:${activePanelId}`" />
      </Transition>
    </div>
  </article>
</template>

<style scoped>
.component-cache-lab-demo {
  width: 100%;
  max-width: 920px;
  min-width: 0;
}

.demo-heading,
.panel-switcher,
.mode-controls,
.panel-stage {
  min-width: 0;
}

.demo-heading {
  padding: 4px 2px 2px;
}

.eyebrow {
  color: var(--color-accent);
  font-size: var(--font-size-xs);
  font-weight: 700;
  letter-spacing: 0;
}

.demo-heading h3 {
  margin-top: 5px;
  color: var(--color-text);
  font-size: var(--font-size-lg);
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.demo-heading > p:last-child {
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

.panel-switcher,
.mode-controls {
  display: flex;
  flex-wrap: wrap;
  margin: 13px -5px -5px;
}

.mode-controls {
  margin-top: 8px;
}

.panel-switcher button,
.mode-controls button {
  min-width: 44px;
  min-height: 44px;
  margin: 5px;
  padding: 10px 16px;
  border: 1px solid var(--color-border);
  border-radius: 7px;
  background: var(--color-bg-elevated);
  color: var(--color-text);
  font: inherit;
  font-size: var(--font-size-sm);
  font-weight: 700;
  line-height: 1.4;
  white-space: normal;
  overflow-wrap: anywhere;
  cursor: pointer;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.panel-switcher button.active,
.mode-controls button.active {
  border-color: var(--color-accent);
  background: var(--color-accent);
  color: var(--color-on-accent);
}

.panel-switcher button:hover,
.mode-controls button:last-child:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.panel-switcher button:active,
.mode-controls button:active {
  transform: scale(0.98);
}

.panel-switcher button:focus-visible,
.mode-controls button:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--color-accent) 28%, transparent);
  outline-offset: 2px;
}

.panel-stage {
  min-height: 248px;
  margin-top: 18px;
}

.panel-stage :deep(.cache-panel) {
  min-width: 0;
  padding: 20px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg-sunken);
}

.panel-stage :deep(.panel-kicker) {
  color: var(--color-accent);
  font-size: var(--font-size-xs);
  font-weight: 700;
  letter-spacing: 0;
}

.panel-stage :deep(h4) {
  margin-top: 4px;
  color: var(--color-text);
  font-size: var(--font-size-md);
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.panel-stage :deep(.panel-description) {
  margin-top: 8px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.panel-stage :deep(.count-row) {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  min-width: 0;
  margin: 14px -5px -5px;
}

.panel-stage :deep(.count-row label),
.panel-stage :deep(.count-row output) {
  min-width: 0;
  margin: 5px;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.panel-stage :deep(.count-row label) {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.panel-stage :deep(.count-row output) {
  min-width: 44px;
  padding: 7px 12px;
  border-left: 2px solid var(--color-accent);
  background: var(--color-bg-elevated);
  color: var(--color-text);
  font-size: var(--font-size-md);
  font-weight: 750;
  text-align: center;
}

.panel-stage :deep(button) {
  min-width: 44px;
  min-height: 44px;
  margin-top: 17px;
  padding: 10px 16px;
  border: 1px solid var(--color-accent);
  border-radius: 7px;
  background: var(--color-accent);
  color: var(--color-on-accent);
  font: inherit;
  font-size: var(--font-size-sm);
  font-weight: 700;
  line-height: 1.4;
  white-space: normal;
  overflow-wrap: anywhere;
  cursor: pointer;
  transition:
    opacity var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.panel-stage :deep(button:hover) {
  opacity: 0.88;
}

.panel-stage :deep(button:active) {
  transform: scale(0.98);
}

.panel-stage :deep(button:focus-visible) {
  outline: 3px solid color-mix(in srgb, var(--color-accent) 28%, transparent);
  outline-offset: 2px;
}

.panel-enter-active,
.panel-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.panel-enter-from,
.panel-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@media (max-width: 480px) {
  .panel-switcher,
  .mode-controls {
    flex-direction: column;
    margin-right: 0;
    margin-left: 0;
  }

  .panel-switcher button,
  .mode-controls button {
    width: 100%;
    margin-right: 0;
    margin-left: 0;
  }

  .panel-stage :deep(button) {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .panel-switcher button,
  .mode-controls button,
  .panel-stage :deep(button),
  .panel-enter-active,
  .panel-leave-active {
    transition: none;
  }

  .panel-switcher button:active,
  .mode-controls button:active,
  .panel-stage :deep(button:active),
  .panel-enter-from,
  .panel-leave-to {
    transform: none;
  }

  .panel-enter-from,
  .panel-leave-to {
    opacity: 1;
  }
}
</style>
