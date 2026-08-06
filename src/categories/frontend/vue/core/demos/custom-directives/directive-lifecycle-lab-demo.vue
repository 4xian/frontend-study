<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Directive, DirectiveBinding } from 'vue'

type ShortcutKey = 'k' | 'm'
type HookName = 'mounted' | 'updated' | 'beforeUnmount' | 'unmounted'

interface ShortcutBinding {
  key: ShortcutKey
  label: string
  hostRevision: number
  onTrigger: () => void
}

interface ShortcutResource {
  handler: (event: KeyboardEvent) => void
  value: ShortcutBinding
}

interface HookEntry {
  id: number
  hook: HookName
  detail: string
}

const shortcutKey = ref<ShortcutKey>('k')
const targetVisible = ref(true)
const unrelatedCount = ref(0)
const shortcutHits = ref(0)
const domWriteCount = ref(0)
const activeResourceCount = ref(0)
const hookEntries = ref<HookEntry[]>([])
const resources = new WeakMap<HTMLElement, ShortcutResource>()
let nextHookId = 1

/** 把快捷键转换为用于展示和 aria-keyshortcuts 的大写文本。 */
function getShortcutLabel(key: ShortcutKey): string {
  return key.toUpperCase()
}

/** 记录可观察的指令钩子，不读取 VNode 或组件内部实例。 */
function recordHook(hook: HookName, detail: string): void {
  hookEntries.value.push({ id: nextHookId, hook, detail })
  nextHookId += 1
}

/** 处理当前快捷键命中。 */
function handleShortcut(): void {
  shortcutHits.value += 1
}

/** 把当前快捷键配置同步到真实宿主元素。 */
function writeShortcutAttributes(element: HTMLElement, value: ShortcutBinding): void {
  element.dataset.shortcut = value.key
  element.setAttribute('aria-keyshortcuts', getShortcutLabel(value.key))
  domWriteCount.value += 1
}

/** 创建只读取资源记录中最新配置的键盘处理器。 */
function createShortcutHandler(element: HTMLElement): (event: KeyboardEvent) => void {
  return (event) => {
    const resource = resources.get(element)
    if (!resource || event.ctrlKey || event.metaKey || event.altKey) return
    if (event.key.toLowerCase() !== resource.value.key) return
    resource.value.onTrigger()
  }
}

const shortcutBinding = computed<ShortcutBinding>(() => ({
  key: shortcutKey.value,
  label: `按 ${getShortcutLabel(shortcutKey.value)} 触发`,
  hostRevision: unrelatedCount.value,
  onTrigger: handleShortcut,
}))

const vShortcut: Directive<HTMLElement, ShortcutBinding> = {
  /** 挂载后安装唯一键盘监听，并同步首轮 DOM attribute。 */
  mounted(element, binding) {
    const handler = createShortcutHandler(element)
    resources.set(element, { handler, value: binding.value })
    window.addEventListener('keydown', handler)
    activeResourceCount.value += 1
    writeShortcutAttributes(element, binding.value)
    recordHook('mounted', `${getShortcutLabel(binding.value.key)}，写入 ${domWriteCount.value}`)
  },
  /** 更新时复用现有监听，仅在真实输入变化后写 DOM。 */
  updated(element, binding) {
    const resource = resources.get(element)
    if (!resource) return
    const oldValue = binding.oldValue ?? binding.value
    if (binding.value === oldValue) return
    resource.value = binding.value

    if (binding.value.key === oldValue.key && binding.value.label === oldValue.label) {
      recordHook('updated', `${getShortcutLabel(binding.value.key)} 未变化，跳过 DOM 写入`)
      return
    }

    writeShortcutAttributes(element, binding.value)
    recordHook(
      'updated',
      `${getShortcutLabel(oldValue.key)} → ${getShortcutLabel(binding.value.key)}，写入 ${domWriteCount.value}`,
    )
  },
  /** 在元素仍存在时记录卸载前状态。 */
  beforeUnmount(_element, binding) {
    recordHook(
      'beforeUnmount',
      `${getShortcutLabel(binding.value.key)}，资源仍为 ${activeResourceCount.value}`,
    )
  },
  /** 移除挂载时创建的同一监听并删除资源记录。 */
  unmounted(element, binding) {
    const resource = resources.get(element)
    if (resource) {
      window.removeEventListener('keydown', resource.handler)
      resources.delete(element)
      activeResourceCount.value -= 1
    }
    recordHook(
      'unmounted',
      `${getShortcutLabel(binding.value.key)}，资源已释放 ${activeResourceCount.value}`,
    )
  },
}

/** 更新宿主修订号，但保持快捷键和标签语义不变。 */
function updateUnrelatedState(): void {
  unrelatedCount.value += 1
}

/** 在两个稳定快捷键之间切换 binding value。 */
function switchShortcut(): void {
  shortcutKey.value = shortcutKey.value === 'k' ? 'm' : 'k'
}

/** 移除或重新挂载指令宿主元素。 */
function toggleTarget(): void {
  targetVisible.value = !targetVisible.value
}
</script>

<template>
  <section class="directive-lifecycle-lab-demo" aria-labelledby="directive-lab-title">
    <header class="demo-header">
      <p class="eyebrow">DOM 生命周期实验</p>
      <h3 id="directive-lab-title">一份快捷键资源，跟随一个真实元素</h3>
      <p>
        当前快捷键是 <strong>{{ getShortcutLabel(shortcutKey) }}</strong>
        。聚焦任意位置后按下该键，观察命中次数；移除目标后，同一个按键不再触发。
      </p>
    </header>

    <div class="summary" aria-live="polite" data-testid="shortcut-summary">
      <span>绑定写入 {{ domWriteCount }}</span>
      <span data-testid="active-resource-count">活动资源 {{ activeResourceCount }}</span>
      <span data-testid="shortcut-hit-count">快捷键命中 {{ shortcutHits }}</span>
      <span data-testid="unrelated-count">无关计数 {{ unrelatedCount }}</span>
    </div>

    <div
      v-if="targetVisible"
      v-shortcut="shortcutBinding"
      class="shortcut-target"
      :class="{ alternate: shortcutHits % 2 === 1 }"
      data-testid="directive-target"
      tabindex="0"
    >
      <strong>{{ shortcutBinding.label }}</strong>
      <span>宿主内容中的无关计数：{{ unrelatedCount }}</span>
    </div>
    <div v-else class="shortcut-placeholder" data-testid="directive-placeholder" role="status">
      目标已卸载，快捷键资源应为 0
    </div>

    <div class="controls" aria-label="指令实验控制">
      <button type="button" data-testid="update-unrelated" @click="updateUnrelatedState">
        更新无关状态
      </button>
      <button type="button" data-testid="switch-shortcut" @click="switchShortcut">
        切换绑定值
      </button>
      <button type="button" data-testid="toggle-directive-target" @click="toggleTarget">
        {{ targetVisible ? '移除目标' : '恢复目标' }}
      </button>
    </div>

    <section class="hook-panel" aria-labelledby="hook-log-title">
      <div class="hook-heading">
        <h4 id="hook-log-title">公开钩子日志</h4>
        <span>{{ hookEntries.length }} 条</span>
      </div>
      <TransitionGroup tag="ol" name="hook-entry" class="hook-list" aria-live="polite">
        <li
          v-for="entry in hookEntries"
          :key="entry.id"
          :data-hook="entry.hook"
          data-testid="hook-entry"
        >
          <code>{{ entry.hook }}</code>
          <span>{{ entry.detail }}</span>
        </li>
      </TransitionGroup>
    </section>
  </section>
</template>

<style scoped>
.directive-lifecycle-lab-demo {
  min-width: 0;
  padding: var(--space-5);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg);
}

.demo-header h3,
.demo-header p,
.hook-heading h4 {
  margin: 0;
}

.demo-header h3 {
  margin-top: var(--space-1);
  font-size: var(--font-size-lg);
  line-height: 1.35;
}

.demo-header p:last-child {
  margin-top: var(--space-2);
  color: var(--color-text-secondary);
  line-height: 1.65;
}

.eyebrow {
  color: var(--color-accent);
  font-size: var(--font-size-sm);
  font-weight: 700;
}

.summary {
  display: flex;
  flex-wrap: wrap;
  margin-top: var(--space-4);
  margin-right: calc(var(--space-2) * -1);
  margin-bottom: calc(var(--space-2) * -1);
}

.summary span {
  min-width: 0;
  padding: var(--space-2) var(--space-3);
  margin-right: var(--space-2);
  margin-bottom: var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.shortcut-target,
.shortcut-placeholder {
  display: flex;
  flex-direction: column;
  min-height: 112px;
  padding: var(--space-4);
  margin-top: var(--space-4);
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-sm);
  justify-content: center;
  background: var(--color-accent-soft);
  overflow-wrap: anywhere;
  transition:
    transform var(--duration-normal) var(--ease-out),
    background-color var(--duration-normal) var(--ease-out),
    box-shadow var(--duration-normal) var(--ease-out);
}

.shortcut-target strong {
  font-size: var(--font-size-lg);
}

.shortcut-target span {
  margin-top: var(--space-2);
  color: var(--color-text-secondary);
}

.shortcut-target.alternate {
  background: var(--color-bg-elevated);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.shortcut-placeholder {
  border-style: dashed;
  border-color: var(--color-border-strong);
  background: var(--color-bg-elevated);
  color: var(--color-text-secondary);
}

.controls {
  display: flex;
  flex-wrap: wrap;
  margin-top: var(--space-4);
  margin-right: calc(var(--space-2) * -1);
  margin-bottom: calc(var(--space-2) * -1);
}

.controls button {
  min-width: 44px;
  min-height: 44px;
  padding: var(--space-2) var(--space-4);
  margin-right: var(--space-2);
  margin-bottom: var(--space-2);
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-sm);
  color: var(--color-accent);
  font-size: var(--font-size-sm);
  font-weight: 650;
  touch-action: manipulation;
  transition:
    color var(--duration-fast) var(--ease-out),
    background-color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.controls button:hover {
  background: var(--color-accent-soft);
}

.controls button:active {
  transform: scale(0.97);
}

.hook-panel {
  margin-top: var(--space-5);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
}

.hook-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.hook-heading h4 {
  font-size: var(--font-size-base);
}

.hook-heading span {
  margin-left: var(--space-3);
  color: var(--color-text-tertiary);
  font-size: var(--font-size-sm);
}

.hook-list {
  padding: 0;
  margin: var(--space-3) 0 0;
  list-style: none;
}

.hook-list li {
  display: flex;
  align-items: baseline;
  min-width: 0;
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--color-border);
}

.hook-list code {
  flex: 0 0 112px;
  min-width: 0;
  color: var(--color-accent);
  font-size: var(--font-size-sm);
  font-weight: 700;
  overflow-wrap: anywhere;
  white-space: normal;
}

.hook-list span {
  min-width: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  overflow-wrap: anywhere;
}

.hook-entry-enter-active,
.hook-entry-leave-active {
  transition:
    opacity var(--duration-normal) var(--ease-out),
    transform var(--duration-normal) var(--ease-out);
}

.hook-entry-enter-from,
.hook-entry-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 520px) {
  .directive-lifecycle-lab-demo {
    padding: var(--space-4);
  }

  .controls button {
    width: 100%;
    margin-right: 0;
  }

  .hook-list li {
    flex-direction: column;
  }

  .hook-list code {
    flex-basis: auto;
    margin-bottom: var(--space-1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .shortcut-target,
  .shortcut-placeholder,
  .controls button,
  .hook-entry-enter-active,
  .hook-entry-leave-active {
    transition: none;
  }

  .shortcut-target.alternate,
  .controls button:active,
  .hook-entry-enter-from,
  .hook-entry-leave-to {
    transform: none;
  }
}
</style>
