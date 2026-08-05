<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import MobileCatalogNavigation from '@/components/navigation/MobileCatalogNavigation.vue'
import { learningCatalog } from '@/content/catalog'
import type { CatalogNode, ContentPurpose } from '@/content/catalog'

interface PurposeOption {
  id: ContentPurpose
  title: string
  path: string
}

type MobileLevel = 'purpose' | 'ecosystem' | 'module' | 'collection'
type MobileDirection = 'forward' | 'backward'

const props = defineProps<{
  open: boolean
  mobile: boolean
  purpose: ContentPurpose
  purposes: readonly PurposeOption[]
}>()

const emit = defineEmits<{
  close: []
  selectPurpose: [purpose: ContentPurpose]
  pointerEnter: []
  pointerLeave: []
}>()

const route = useRoute()
const panelEl = ref<HTMLElement | null>(null)
const closeButtonEl = ref<HTMLButtonElement | null>(null)
const desktopStageEl = ref<HTMLElement | null>(null)
const selectedEcosystemId = ref('')
const selectedModuleId = ref('')
const previewEcosystemId = ref('')
const previewModuleId = ref('')
const desktopPanelHeight = ref(0)
const mobileLevel = ref<MobileLevel>('purpose')
const mobileDirection = ref<MobileDirection>('forward')

let returnFocusEl: HTMLElement | null = null
let previousBodyOverflow = ''
let desktopResizeObserver: ResizeObserver | undefined

/** 当前目的下的全部生态节点。 */
const ecosystems = computed(
  () => learningCatalog.getNavigation({ purpose: props.purpose }).ecosystems,
)

/** 当前用于驱动模块列的生态标识。 */
const activeEcosystemId = computed(() => {
  const preview = ecosystems.value.find(
    (node) => node.id === previewEcosystemId.value && node.status === 'available',
  )
  return preview?.id || selectedEcosystemId.value
})

/** 当前生态下的全部模块节点。 */
const modules = computed(() => {
  if (!activeEcosystemId.value) return []
  return learningCatalog.getNavigation({
    purpose: props.purpose,
    ecosystem: activeEcosystemId.value,
  }).modules
})

/** 当前用于驱动分类列的模块标识。 */
const activeModuleId = computed(() => {
  const preview = modules.value.find(
    (node) => node.id === previewModuleId.value && node.status === 'available',
  )
  if (preview) return preview.id

  const selected = modules.value.find((node) => node.id === selectedModuleId.value)
  return selected?.id || findFirstAvailableId(modules.value)
})

/** 当前生态和模块下的内容分类。 */
const collections = computed(() => {
  if (!activeEcosystemId.value || !activeModuleId.value) return []
  return learningCatalog.getNavigation({
    purpose: props.purpose,
    ecosystem: activeEcosystemId.value,
    module: activeModuleId.value,
  }).collections
})

/** 当前模块的独立总览入口。 */
const moduleOverview = computed(() =>
  modules.value.find((node) => node.id === activeModuleId.value),
)

/** 移动端当前层级的标题。 */
const mobileViewTitle = computed(() => {
  if (mobileLevel.value === 'purpose') return '学习目录'
  if (mobileLevel.value === 'ecosystem') {
    return props.purposes.find((option) => option.id === props.purpose)?.title ?? '选择生态'
  }
  if (mobileLevel.value === 'module') {
    return ecosystems.value.find((node) => node.id === activeEcosystemId.value)?.title ?? '选择模块'
  }
  return modules.value.find((node) => node.id === activeModuleId.value)?.title ?? '内容分类'
})

/** 返回节点列表中的首个可用标识。 */
function findFirstAvailableId(nodes: CatalogNode[]): string {
  return nodes.find((node) => node.status === 'available')?.id ?? ''
}

/** 从当前路由读取有效的学习目的。 */
function getRoutePurpose(): ContentPurpose | undefined {
  const segment = route.path.split('/')[1]
  return segment && ['learn', 'reference', 'projects'].includes(segment)
    ? (segment as ContentPurpose)
    : undefined
}

/** 为指定生态解析路由优先、首个可用兜底的模块。 */
function resolveDefaultModule(ecosystemId: string): string {
  const routeModule = route.params.module as string | undefined
  const routeEcosystem = route.params.ecosystem as string | undefined
  if (
    getRoutePurpose() === props.purpose &&
    routeEcosystem === ecosystemId &&
    modules.value.some((node) => node.id === routeModule)
  ) {
    return routeModule ?? ''
  }
  return findFirstAvailableId(modules.value)
}

/** 按当前路由和目录可用状态重置联动选择。 */
function resetSelection(): void {
  previewEcosystemId.value = ''
  previewModuleId.value = ''

  const routeEcosystem = route.params.ecosystem as string | undefined
  const routeSelection =
    getRoutePurpose() === props.purpose
      ? ecosystems.value.find((node) => node.id === routeEcosystem)
      : undefined
  selectedEcosystemId.value = routeSelection?.id || findFirstAvailableId(ecosystems.value)
  selectedModuleId.value = resolveDefaultModule(selectedEcosystemId.value)
}

/** 请求父组件关闭目录。 */
function closePanel(): void {
  emit('close')
}

/** 选择学习目的并保留当前面板。 */
function selectPurpose(purpose: ContentPurpose): void {
  emit('selectPurpose', purpose)
  if (props.mobile) openMobileLevel('ecosystem')
}

/** 持久选择生态并同步模块默认项。 */
function selectEcosystem(node: CatalogNode): void {
  if (node.status !== 'available') return
  previewEcosystemId.value = ''
  previewModuleId.value = ''
  selectedEcosystemId.value = node.id
  selectedModuleId.value = resolveDefaultModule(node.id)
  if (props.mobile) openMobileLevel('module')
}

/** 持久选择模块以更新内容分类。 */
function selectModule(node: CatalogNode): void {
  if (node.status !== 'available') return
  previewModuleId.value = ''
  selectedModuleId.value = node.id
  if (props.mobile) openMobileLevel('collection')
}

/** 向前进入移动目录的指定层级。 */
function openMobileLevel(level: MobileLevel): void {
  mobileDirection.value = 'forward'
  mobileLevel.value = level
}

/** 返回移动目录的上一层级。 */
function returnMobileLevel(): void {
  const previousLevel: Partial<Record<MobileLevel, MobileLevel>> = {
    ecosystem: 'purpose',
    module: 'ecosystem',
    collection: 'module',
  }
  const target = previousLevel[mobileLevel.value]
  if (!target) return
  mobileDirection.value = 'backward'
  mobileLevel.value = target
}

/** 将移动目录重置到学习目的一级。 */
function resetMobileNavigation(): void {
  mobileDirection.value = 'forward'
  mobileLevel.value = 'purpose'
}

/** 桌面指针或焦点临时预览生态。 */
function previewEcosystem(node: CatalogNode): void {
  if (!props.mobile && node.status === 'available') previewEcosystemId.value = node.id
}

/** 桌面指针或焦点临时预览模块。 */
function previewModule(node: CatalogNode): void {
  if (!props.mobile && node.status === 'available') previewModuleId.value = node.id
}

/** 返回移动 Sheet 内可参与焦点循环的控件。 */
function getFocusableElements(): HTMLElement[] {
  if (!panelEl.value) return []
  return Array.from(
    panelEl.value.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
    ),
  )
}

/** 将焦点移到桌面目录当前目的下的首个可操作项。 */
async function focusFirstItem(): Promise<void> {
  await nextTick()
  const columns = panelEl.value?.querySelector<HTMLElement>(
    `.catalog-columns[data-purpose="${props.purpose}"]`,
  )
  columns
    ?.querySelector<HTMLElement>(
      '.ecosystem-column button:not([disabled]), .module-column button:not([disabled]), .collection-column a[href]',
    )
    ?.focus()
}

/** 在移动目录切层后聚焦新层标题。 */
async function focusCurrentMobileView(): Promise<void> {
  if (!props.mobile) return
  await nextTick()
  panelEl.value?.querySelector<HTMLElement>('[data-mobile-heading]')?.focus()
}

/** 测量桌面菜单内容，并同步可动画的面板高度。 */
function measureDesktopPanelHeight(): void {
  if (!props.open || props.mobile || !panelEl.value || !desktopStageEl.value) return
  const panelStyle = window.getComputedStyle(panelEl.value)
  const verticalPadding =
    Number.parseFloat(panelStyle.paddingTop) + Number.parseFloat(panelStyle.paddingBottom)
  const availableHeight = window.innerHeight - panelEl.value.getBoundingClientRect().top
  desktopPanelHeight.value = Math.ceil(
    Math.min(desktopStageEl.value.scrollHeight + verticalPadding, availableHeight),
  )
}

/** 开始观察桌面菜单内容高度变化。 */
function startDesktopHeightObserver(): void {
  desktopResizeObserver?.disconnect()
  if (!desktopStageEl.value) return
  desktopResizeObserver = new ResizeObserver(measureDesktopPanelHeight)
  desktopResizeObserver.observe(desktopStageEl.value)
}

/** 停止观察桌面菜单内容高度变化。 */
function stopDesktopHeightObserver(): void {
  desktopResizeObserver?.disconnect()
  desktopResizeObserver = undefined
}

/** 响应 Esc 关闭，并在移动 Sheet 内循环 Tab 焦点。 */
function onKeydown(event: KeyboardEvent): void {
  if (!props.open) return
  if (event.key === 'Escape') {
    event.preventDefault()
    closePanel()
    return
  }
  if (!props.mobile || event.key !== 'Tab') return

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
  } else if (!panelEl.value?.contains(document.activeElement)) {
    event.preventDefault()
    first.focus()
  }
}

/** 根据移动 Sheet 状态锁定或恢复页面滚动。 */
function syncBodyScroll(): void {
  if (props.open && props.mobile) {
    previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = previousBodyOverflow
  }
}

watch([() => props.purpose, () => route.fullPath], resetSelection, { immediate: true })

watch([() => props.open, () => props.mobile], async ([open, mobile]) => {
  syncBodyScroll()
  if (open) {
    resetSelection()
    if (mobile) resetMobileNavigation()
  }
  if (open && !mobile) {
    desktopPanelHeight.value = 0
    await nextTick()
    startDesktopHeightObserver()
    requestAnimationFrame(measureDesktopPanelHeight)
  } else {
    stopDesktopHeightObserver()
  }
  if (open && mobile) {
    returnFocusEl = document.activeElement instanceof HTMLElement ? document.activeElement : null
    await nextTick()
    closeButtonEl.value?.focus()
  } else if (!open && returnFocusEl) {
    await nextTick()
    returnFocusEl.focus()
    returnFocusEl = null
  }
})

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('resize', measureDesktopPanelHeight)
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('resize', measureDesktopPanelHeight)
  stopDesktopHeightObserver()
  document.body.style.overflow = previousBodyOverflow
})

defineExpose({ focusFirstItem })
</script>

<template>
  <Teleport to="body">
    <Transition name="catalog-navigation">
      <div
        v-if="props.open"
        class="catalog-layer"
        :class="{ mobile: props.mobile }"
        @click.self="closePanel"
      >
        <button
          v-if="!props.mobile"
          type="button"
          class="catalog-scrim"
          aria-label="关闭学习目录"
          @click="closePanel"
        />
        <component
          :is="props.mobile ? 'section' : 'nav'"
          id="catalog-navigation-panel"
          ref="panelEl"
          class="catalog-panel"
          :style="{ '--catalog-panel-height': `${desktopPanelHeight}px` }"
          :role="props.mobile ? 'dialog' : undefined"
          :aria-modal="props.mobile ? 'true' : undefined"
          aria-label="学习目录"
          @mouseenter="emit('pointerEnter')"
          @mouseleave="emit('pointerLeave')"
        >
          <header class="sheet-header">
            <button
              v-if="mobileLevel !== 'purpose'"
              type="button"
              class="sheet-back"
              aria-label="返回上一级"
              @click="returnMobileLevel"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="m11 4-5 5 5 5" />
              </svg>
            </button>
            <span v-else class="sheet-brand" aria-hidden="true">F</span>
            <p class="sheet-site-title">IT 学习站</p>
            <button
              ref="closeButtonEl"
              type="button"
              class="sheet-close"
              aria-label="关闭学习目录"
              title="关闭学习目录"
              @click="closePanel"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              >
                <path d="m3 3 10 10M13 3 3 13" />
              </svg>
            </button>
          </header>

          <div v-if="!props.mobile" ref="desktopStageEl" class="catalog-columns-stage">
            <Transition name="catalog-columns">
              <div :key="props.purpose" class="catalog-columns" :data-purpose="props.purpose">
                <section class="catalog-column ecosystem-column">
                  <p class="column-label">生态</p>
                  <div class="catalog-list">
                    <template v-for="node in ecosystems" :key="node.id">
                      <button
                        v-if="node.status === 'available'"
                        type="button"
                        class="catalog-item"
                        :class="{ selected: node.id === activeEcosystemId }"
                        :aria-pressed="node.id === selectedEcosystemId"
                        @mouseenter="previewEcosystem(node)"
                        @focus="previewEcosystem(node)"
                        @click="selectEcosystem(node)"
                      >
                        <span class="item-title">{{ node.title }}</span>
                        <span v-if="node.summary" class="item-summary">{{ node.summary }}</span>
                      </button>
                      <span
                        v-else
                        class="catalog-item planned"
                        :class="{ selected: node.id === activeEcosystemId }"
                        aria-disabled="true"
                        :aria-current="node.id === selectedEcosystemId ? 'true' : undefined"
                      >
                        <span class="item-title">{{ node.title }}</span>
                        <span class="status-label">规划中</span>
                      </span>
                    </template>
                  </div>
                </section>

                <section class="catalog-column module-column">
                  <p class="column-label">模块</p>
                  <div class="catalog-list">
                    <template v-for="node in modules" :key="node.id">
                      <button
                        v-if="node.status === 'available'"
                        type="button"
                        class="catalog-item"
                        :class="{ selected: node.id === activeModuleId }"
                        :aria-pressed="node.id === selectedModuleId"
                        @mouseenter="previewModule(node)"
                        @focus="previewModule(node)"
                        @click="selectModule(node)"
                      >
                        <span class="item-title">{{ node.title }}</span>
                      </button>
                      <span
                        v-else
                        class="catalog-item planned"
                        :class="{ selected: node.id === activeModuleId }"
                        aria-disabled="true"
                        :aria-current="node.id === selectedModuleId ? 'true' : undefined"
                      >
                        <span class="item-title">{{ node.title }}</span>
                        <span class="status-label">规划中</span>
                      </span>
                    </template>
                  </div>
                </section>

                <section class="catalog-column collection-column">
                  <p class="column-label">内容分类</p>
                  <div class="catalog-list">
                    <RouterLink
                      v-if="moduleOverview?.status === 'available'"
                      :to="moduleOverview.path"
                      class="catalog-item collection-link"
                      @click="closePanel"
                    >
                      <span class="item-title">模块总览</span>
                      <span class="item-summary">查看完整路线与内容覆盖</span>
                    </RouterLink>
                    <template v-for="node in collections" :key="node.id">
                      <RouterLink
                        v-if="node.status === 'available'"
                        :to="node.path"
                        class="catalog-item collection-link"
                        @click="closePanel"
                      >
                        <span class="item-title">{{ node.title }}</span>
                        <span v-if="node.summary" class="item-summary">{{ node.summary }}</span>
                      </RouterLink>
                      <span v-else class="catalog-item planned" aria-disabled="true">
                        <span class="item-title">{{ node.title }}</span>
                        <span class="status-label">规划中</span>
                      </span>
                    </template>
                    <p v-if="!collections.length" class="empty-state">该模块暂无可用分类</p>
                  </div>
                </section>
              </div>
            </Transition>
          </div>

          <MobileCatalogNavigation
            v-else
            :level="mobileLevel"
            :direction="mobileDirection"
            :title="mobileViewTitle"
            :purpose="props.purpose"
            :purposes="props.purposes"
            :ecosystems="ecosystems"
            :modules="modules"
            :collections="collections"
            :module-overview="moduleOverview"
            :active-ecosystem-id="activeEcosystemId"
            :active-module-id="activeModuleId"
            :selected-ecosystem-id="selectedEcosystemId"
            :selected-module-id="selectedModuleId"
            @select-purpose="selectPurpose"
            @select-ecosystem="selectEcosystem"
            @select-module="selectModule"
            @close="closePanel"
            @entered="focusCurrentMobileView"
          />
        </component>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.catalog-layer {
  position: fixed;
  inset: 0;
  z-index: 95;
  pointer-events: none;
}

.catalog-layer:not(.mobile) {
  clip-path: inset(var(--header-height) 0 0 0);
  transition: clip-path 240ms var(--ease-out);
}

.catalog-scrim {
  position: absolute;
  inset: var(--header-height) 0 0;
  width: 100%;
  background: var(--color-nav-curtain);
  border-radius: 0;
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  pointer-events: auto;
}

.catalog-panel {
  position: absolute;
  top: var(--header-height);
  left: 0;
  width: 100%;
  height: var(--catalog-panel-height, 0);
  max-height: calc(100vh - var(--header-height));
  padding: 38px 22px 46px;
  overflow-y: auto;
  background: var(--color-nav-surface);
  pointer-events: auto;
  transition: height 240ms var(--ease-out);
}

.catalog-layer:not(.mobile) .catalog-panel {
  scrollbar-width: none;
}

.catalog-layer:not(.mobile) .catalog-panel::-webkit-scrollbar {
  display: none;
}

.sheet-header {
  display: none;
}

.catalog-columns-stage {
  position: relative;
  width: min(var(--nav-content-width), 100%);
  margin: 0 auto;
}

.catalog-columns {
  display: flex;
  width: 100%;
}

.catalog-column {
  min-width: 0;
}

.catalog-column + .catalog-column {
  padding-left: 56px;
}

.ecosystem-column {
  flex: 0 0 32%;
}

.module-column {
  flex: 0 0 27%;
}

.collection-column {
  flex: 1;
}

.column-label {
  font-size: var(--font-size-xs);
  font-weight: 400;
  line-height: 1.3;
  color: var(--color-text-secondary);
  letter-spacing: 0;
}

.catalog-list {
  margin-top: var(--space-3);
}

.catalog-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  min-height: 32px;
  padding: 5px 0;
  color: var(--color-text);
  text-align: left;
  transition:
    color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.catalog-item + .catalog-item,
.catalog-item + .planned,
.planned + .catalog-item,
.planned + .planned {
  margin-top: var(--space-1);
}

.catalog-item:hover,
.catalog-item:focus-visible,
.catalog-item.selected {
  color: var(--color-text);
  background: transparent;
}

.catalog-item:hover,
.catalog-item:focus-visible {
  transform: translateX(2px);
}

.catalog-item:focus-visible,
.sheet-close:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.item-title {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: 0;
}

.ecosystem-column .item-title {
  font-size: 24px;
  line-height: 1.08;
}

.item-summary {
  margin-top: 2px;
  font-size: var(--font-size-xs);
  line-height: 1.45;
  color: var(--color-text-secondary);
}

.planned {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  color: var(--color-text-tertiary);
  cursor: default;
}

.planned.selected {
  color: var(--color-text-tertiary);
  background: transparent;
}

.status-label {
  flex-shrink: 0;
  margin-left: var(--space-2);
  font-size: var(--font-size-xs);
  font-weight: 500;
}

.empty-state {
  padding: var(--space-2) var(--space-3);
  color: var(--color-text-tertiary);
  font-size: var(--font-size-sm);
}

.catalog-navigation-enter-active.mobile,
.catalog-navigation-leave-active.mobile {
  transition: opacity 240ms var(--ease-out);
}

.catalog-navigation-enter-active .catalog-panel,
.catalog-navigation-leave-active .catalog-panel {
  transition: height 240ms var(--ease-out);
}

.catalog-navigation-enter-from:not(.mobile),
.catalog-navigation-leave-to:not(.mobile) {
  clip-path: inset(var(--header-height) 0 calc(100% - var(--header-height)) 0);
}

.catalog-navigation-enter-from.mobile,
.catalog-navigation-leave-to.mobile {
  opacity: 0;
}

.catalog-navigation-enter-from .catalog-panel,
.catalog-navigation-leave-to .catalog-panel {
  height: 0;
}

.catalog-columns-enter-active,
.catalog-columns-leave-active {
  transition: opacity 320ms var(--ease-out);
}

.catalog-columns-leave-active {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}

.catalog-navigation-enter-active .catalog-column,
.catalog-columns-enter-active .catalog-column,
.catalog-navigation-leave-active .catalog-column,
.catalog-columns-leave-active .catalog-column {
  transition:
    opacity 320ms var(--ease-out),
    transform 320ms var(--ease-out);
}

.catalog-navigation-enter-active .catalog-column:nth-child(2),
.catalog-columns-enter-active .catalog-column:nth-child(2) {
  transition-delay: 20ms;
}

.catalog-navigation-enter-active .catalog-column:nth-child(3),
.catalog-columns-enter-active .catalog-column:nth-child(3) {
  transition-delay: 40ms;
}

.catalog-columns-enter-from .catalog-column,
.catalog-columns-leave-to .catalog-column,
.catalog-navigation-enter-from .catalog-column,
.catalog-navigation-leave-to .catalog-column {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 900px) {
  .catalog-layer.mobile {
    z-index: 260;
    padding: 0;
    background: var(--color-nav-surface);
    pointer-events: auto;
  }

  .catalog-layer.mobile .catalog-panel {
    inset: 0;
    width: 100%;
    height: 100%;
    max-height: none;
    padding: 0 22px 48px;
    border: none;
    background: var(--color-nav-surface);
    transition: none;
  }

  .sheet-header {
    position: sticky;
    top: 0;
    z-index: 1;
    display: flex;
    align-items: center;
    width: 100%;
    height: var(--header-height);
    background: var(--color-nav-surface);
  }

  .sheet-brand,
  .sheet-back,
  .sheet-close {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 32px;
    width: 32px;
    height: 32px;
    color: var(--color-text);
  }

  .sheet-brand {
    font-size: var(--font-size-base);
    font-weight: 700;
  }

  .sheet-site-title {
    flex: 1;
    font-size: var(--font-size-xs);
    font-weight: 600;
    line-height: 1;
    text-align: center;
    letter-spacing: 0;
  }

  .sheet-back,
  .sheet-close {
    transition:
      color var(--duration-fast) var(--ease-out),
      transform 100ms var(--ease-out);
  }

  .sheet-back:hover,
  .sheet-close:hover {
    color: var(--color-text-secondary);
  }

  .sheet-back:active,
  .sheet-close:active {
    transform: scale(0.96);
  }

  .sheet-back:focus-visible,
  .sheet-close:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  .catalog-navigation-enter-from .catalog-panel,
  .catalog-navigation-leave-to .catalog-panel {
    height: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .catalog-layer:not(.mobile),
  .catalog-panel,
  .catalog-navigation-enter-active.mobile,
  .catalog-navigation-leave-active.mobile,
  .catalog-navigation-enter-active,
  .catalog-navigation-leave-active,
  .catalog-navigation-enter-active .catalog-panel,
  .catalog-navigation-leave-active .catalog-panel,
  .catalog-columns-enter-active,
  .catalog-columns-leave-active,
  .catalog-navigation-enter-active .catalog-column,
  .catalog-navigation-leave-active .catalog-column,
  .catalog-columns-enter-active .catalog-column,
  .catalog-columns-leave-active .catalog-column {
    transition: none;
  }

  .catalog-navigation-enter-from .catalog-column,
  .catalog-navigation-leave-to .catalog-column,
  .catalog-columns-enter-from .catalog-column,
  .catalog-columns-leave-to .catalog-column {
    transform: none;
  }
}

@media (prefers-reduced-transparency: reduce) {
  .catalog-panel,
  .sheet-header {
    background: var(--color-bg-elevated);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }

  .catalog-scrim {
    background: var(--color-bg-elevated);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
}

@media (prefers-contrast: more) {
  .catalog-panel,
  .sheet-header {
    background: var(--color-bg-elevated);
    border-color: var(--color-border-strong);
  }
}
</style>
