<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { learningCatalog } from '@/app/catalog'
import { useThemeStore } from '@/app/stores/theme'
import type { CatalogNode, ContentType, DomainId, ModuleScope } from '@/common/catalog'

type MenuContentType = ContentType | 'demos'

interface MenuContentOption {
  id: MenuContentType
  title: string
  summary: string
}

interface MenuDetailItem {
  id: string
  title: string
  summary?: string
  status: 'available' | 'planned'
  path?: string
  url?: string
}

const domainLabels: Record<DomainId, string> = {
  frontend: '前端',
  backend: '后端',
  network: '网络',
}

const contentOptions: MenuContentOption[] = [
  { id: 'learn', title: '知识点', summary: '按学习路线掌握核心概念与工程能力。' },
  { id: 'reference', title: 'API Reference', summary: '按官方分类查阅 API 与使用边界。' },
  { id: 'demos', title: 'Demo', summary: '查看真实源码与在线示例。' },
]

const route = useRoute()
const theme = useThemeStore()
const emit = defineEmits<{ openSearch: [] }>()
const openDomain = ref<DomainId>()
const selectedContentType = ref<MenuContentType>('learn')
const selectedTechnologyId = ref('')
const selectedModuleId = ref('')
const previewTechnologyId = ref('')
const previewModuleId = ref('')
const panelElement = ref<HTMLElement>()
const columnsStageElement = ref<HTMLElement>()
const panelHeight = ref(0)

let closeTimer: ReturnType<typeof setTimeout> | undefined
let panelResizeObserver: ResizeObserver | undefined

/** 从 Catalog 生成固定的领域顶部入口。 */
const domainMenus = computed(() =>
  learningCatalog.getNavigation().domains.map((domain) => ({
    ...domain,
    id: domain.id as DomainId,
    label: domainLabels[domain.id as DomainId],
  })),
)

/** 当前宽幅菜单展示的领域。 */
const activeMenu = computed(() =>
  domainMenus.value.find((domain) => domain.id === openDomain.value),
)

/** 当前内容类型的菜单文案。 */
const activeContentOption = computed(() =>
  contentOptions.find((option) => option.id === selectedContentType.value),
)

/** 当前末列使用的分类标题。 */
const detailColumnLabel = computed(() => {
  if (selectedContentType.value === 'learn') return '知识点分类'
  if (selectedContentType.value === 'reference') return 'API 分类'
  return 'Demo'
})

/** 判断指定模块是否拥有当前内容类型。 */
function moduleHasContent(scope: ModuleScope, contentType: MenuContentType): boolean {
  if (contentType === 'learn') return Boolean(learningCatalog.getLearningTrack(scope))
  if (contentType === 'reference') {
    return learningCatalog.getNavigation({ ...scope, contentType }).groups.length > 0
  }
  return learningCatalog.getDemos(scope).length > 0
}

/** 当前领域与内容类型下已经开放的技术。 */
const technologies = computed(() => {
  const domain = openDomain.value
  if (!domain) return []
  return learningCatalog
    .getNavigation({ domain })
    .technologies.filter((technology) =>
      learningCatalog
        .getNavigation({ domain, technology: technology.id })
        .modules.some((module) =>
          moduleHasContent(
            { domain, technology: technology.id, module: module.id },
            selectedContentType.value,
          ),
        ),
    )
})

/** 当前用于驱动模块列的技术标识。 */
const activeTechnologyId = computed(() => {
  const preview = technologies.value.find(
    (technology) => technology.id === previewTechnologyId.value,
  )
  if (preview) return preview.id
  const selected = technologies.value.find(
    (technology) => technology.id === selectedTechnologyId.value,
  )
  return selected?.id ?? technologies.value[0]?.id ?? ''
})

/** 当前选中或预览的技术。 */
const activeTechnology = computed(() =>
  technologies.value.find((technology) => technology.id === activeTechnologyId.value),
)

/** 当前技术与内容类型下已经开放的模块。 */
const modules = computed(() => {
  const domain = openDomain.value
  const technology = activeTechnologyId.value
  if (!domain || !technology) return []
  return learningCatalog
    .getNavigation({ domain, technology })
    .modules.filter((module) =>
      moduleHasContent({ domain, technology, module: module.id }, selectedContentType.value),
    )
})

/** 当前用于驱动分类列的模块标识。 */
const activeModuleId = computed(() => {
  const preview = modules.value.find((module) => module.id === previewModuleId.value)
  if (preview) return preview.id
  const selected = modules.value.find((module) => module.id === selectedModuleId.value)
  return selected?.id ?? modules.value[0]?.id ?? ''
})

/** 当前选中或预览的模块。 */
const activeModule = computed(() =>
  modules.value.find((module) => module.id === activeModuleId.value),
)

/** 当前联动列对应的完整模块范围。 */
const activeModuleScope = computed<ModuleScope | undefined>(() => {
  const domain = openDomain.value
  const technology = activeTechnologyId.value
  const module = activeModuleId.value
  return domain && technology && module ? { domain, technology, module } : undefined
})

/** 返回当前内容类型对应的模块总览路径。 */
function getModuleOverviewPath(path: string, contentType: MenuContentType): string {
  if (contentType === 'learn') return path
  return `${path}?view=${contentType}`
}

/** 当前模块的知识阶段、API 分类或具体 Demo。 */
const detailItems = computed<MenuDetailItem[]>(() => {
  const scope = activeModuleScope.value
  if (!scope) return []
  if (selectedContentType.value !== 'demos') {
    return learningCatalog
      .getNavigation({ ...scope, contentType: selectedContentType.value })
      .groups.map((group) => ({ ...group }))
  }
  return learningCatalog.getDemos(scope).map((demo) => ({
    id: demo.id,
    title: demo.title,
    summary: demo.kind === 'external' ? '在线 Demo' : '本地 Demo',
    status: 'available',
    path:
      demo.kind === 'local' && activeModule.value
        ? `${getModuleOverviewPath(activeModule.value.path, 'demos')}&demo=${encodeURIComponent(demo.id)}`
        : undefined,
    url: demo.kind === 'external' ? demo.url : undefined,
  }))
})

/** 清除桌面菜单的延迟关闭任务。 */
function cancelNavigationClose(): void {
  if (!closeTimer) return
  clearTimeout(closeTimer)
  closeTimer = undefined
}

/** 在指针离开顶栏或面板后延迟关闭菜单。 */
function scheduleNavigationClose(): void {
  if (!openDomain.value) return
  cancelNavigationClose()
  closeTimer = setTimeout(closeMenus, 180)
}

/** 从当前路由解析进入菜单时应展示的内容类型。 */
function resolveRouteContentType(domain: DomainId): MenuContentType {
  if (route.params.domain !== domain) return 'learn'
  if (route.query.view === 'demos') return 'demos'
  if (route.query.view === 'reference' || route.params.contentType === 'reference') {
    return 'reference'
  }
  return 'learn'
}

/** 按领域和当前路由重置联动选择。 */
function resetSelection(domain: DomainId): void {
  selectedContentType.value = resolveRouteContentType(domain)
  previewTechnologyId.value = ''
  previewModuleId.value = ''
  selectedTechnologyId.value =
    route.params.domain === domain ? String(route.params.technology ?? '') : ''
  selectedModuleId.value = route.params.domain === domain ? String(route.params.module ?? '') : ''
}

/** 打开指定领域，并沿用旧版悬浮 Mega Menu 行为。 */
function openDomainMenu(domain: DomainId): void {
  cancelNavigationClose()
  if (openDomain.value !== domain) resetSelection(domain)
  openDomain.value = domain
}

/** 选择内容类型并重置后续联动列。 */
function selectContentType(contentType: MenuContentType): void {
  selectedContentType.value = contentType
  previewTechnologyId.value = ''
  previewModuleId.value = ''
  selectedTechnologyId.value = ''
  selectedModuleId.value = ''
}

/** 临时预览指定技术。 */
function previewTechnology(technology: CatalogNode): void {
  previewTechnologyId.value = technology.id
  previewModuleId.value = ''
}

/** 持久选择指定技术。 */
function selectTechnology(technology: CatalogNode): void {
  previewTechnologyId.value = ''
  previewModuleId.value = ''
  selectedTechnologyId.value = technology.id
  selectedModuleId.value = ''
}

/** 临时预览指定模块。 */
function previewModule(module: CatalogNode): void {
  previewModuleId.value = module.id
}

/** 持久选择指定模块。 */
function selectModule(module: CatalogNode): void {
  previewModuleId.value = ''
  selectedModuleId.value = module.id
}

/** 关闭当前领域菜单。 */
function closeMenus(): void {
  cancelNavigationClose()
  openDomain.value = undefined
}

/** 打开领域菜单并将键盘焦点移入首个内容类型。 */
async function focusActiveMenu(domain: DomainId): Promise<void> {
  openDomainMenu(domain)
  await nextTick()
  panelElement.value?.querySelector<HTMLElement>('.content-column button')?.focus()
}

/** 导航完成后关闭菜单并释放菜单内焦点。 */
function closeMenusAfterNavigation(): void {
  closeMenus()
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
}

/** 测量旧版桌面菜单内容，并同步可动画的面板高度。 */
function measurePanelHeight(): void {
  if (!openDomain.value || !panelElement.value || !columnsStageElement.value) return
  const panelStyle = window.getComputedStyle(panelElement.value)
  const verticalPadding =
    Number.parseFloat(panelStyle.paddingTop) + Number.parseFloat(panelStyle.paddingBottom)
  const availableHeight = window.innerHeight - panelElement.value.getBoundingClientRect().top
  panelHeight.value = Math.ceil(
    Math.min(columnsStageElement.value.scrollHeight + verticalPadding, availableHeight),
  )
}

/** 开始观察菜单内容高度变化。 */
function startPanelHeightObserver(): void {
  panelResizeObserver?.disconnect()
  if (!columnsStageElement.value) return
  panelResizeObserver = new ResizeObserver(measurePanelHeight)
  panelResizeObserver.observe(columnsStageElement.value)
}

/** 停止观察菜单内容高度变化。 */
function stopPanelHeightObserver(): void {
  panelResizeObserver?.disconnect()
  panelResizeObserver = undefined
}

/** 响应 Escape 关闭宽幅菜单。 */
function closeMenusFromKeyboard(event: KeyboardEvent): void {
  if (event.key === 'Escape' && openDomain.value) closeMenusAfterNavigation()
}

watch(() => route.fullPath, closeMenusAfterNavigation)

watch(
  () => Boolean(openDomain.value),
  async (open) => {
    if (!open) {
      stopPanelHeightObserver()
      panelHeight.value = 0
      return
    }
    panelHeight.value = 0
    await nextTick()
    startPanelHeightObserver()
    requestAnimationFrame(measurePanelHeight)
  },
)

watch([activeMenu, activeContentOption, activeTechnologyId, activeModuleId], async () => {
  if (!openDomain.value) return
  await nextTick()
  requestAnimationFrame(measurePanelHeight)
})

onMounted(() => {
  window.addEventListener('keydown', closeMenusFromKeyboard)
  window.addEventListener('resize', measurePanelHeight)
})

onBeforeUnmount(() => {
  cancelNavigationClose()
  stopPanelHeightObserver()
  window.removeEventListener('keydown', closeMenusFromKeyboard)
  window.removeEventListener('resize', measurePanelHeight)
})
</script>

<template>
  <header class="header" @mouseenter="cancelNavigationClose" @mouseleave="scheduleNavigationClose">
    <div class="header-content">
      <RouterLink to="/" class="logo" @focus="closeMenus" @click="closeMenusAfterNavigation">
        <span class="logo-mark">IT</span>
        <span class="logo-text">IT 学习站</span>
      </RouterLink>

      <nav class="domain-nav" aria-label="主导航">
        <button
          v-for="domain in domainMenus"
          :key="domain.id"
          class="domain-toggle"
          :class="{
            'is-open': openDomain === domain.id,
            'is-current': route.params.domain === domain.id,
          }"
          type="button"
          aria-haspopup="true"
          aria-controls="catalog-navigation-panel"
          :aria-expanded="openDomain === domain.id"
          @mouseenter="openDomainMenu(domain.id)"
          @focus="openDomainMenu(domain.id)"
          @click="openDomainMenu(domain.id)"
          @keydown.down.prevent="focusActiveMenu(domain.id)"
        >
          {{ domain.label }}
        </button>
      </nav>

      <div class="header-actions">
        <button
          class="icon-button"
          type="button"
          title="搜索"
          aria-label="搜索"
          @focus="closeMenus"
          @click="emit('openSearch')"
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
            <circle cx="7" cy="7" r="4.5" />
            <path d="m10.5 10.5 3.5 3.5" />
          </svg>
        </button>
        <button
          class="icon-button"
          type="button"
          :title="theme.isDark ? '切换到亮色' : '切换到暗色'"
          :aria-label="theme.isDark ? '切换到亮色' : '切换到暗色'"
          @focus="closeMenus"
          @click="theme.toggle()"
        >
          <svg
            v-if="theme.isDark"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          >
            <circle cx="8" cy="8" r="3.5" />
            <path
              d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06"
            />
          </svg>
          <svg
            v-else
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M13.5 9.5A5.5 5.5 0 0 1 6.5 2.5a5.5 5.5 0 1 0 7 7z" />
          </svg>
        </button>
      </div>
    </div>
  </header>

  <Teleport to="body">
    <Transition name="catalog-navigation">
      <div v-if="activeMenu" class="catalog-layer">
        <button type="button" class="catalog-scrim" aria-label="关闭学习目录" @click="closeMenus" />
        <nav
          id="catalog-navigation-panel"
          ref="panelElement"
          class="catalog-panel"
          data-navigation-panel
          :style="{ '--catalog-panel-height': `${panelHeight}px` }"
          :aria-label="`${activeMenu.label}学习目录`"
          @mouseenter="cancelNavigationClose"
          @mouseleave="scheduleNavigationClose"
        >
          <div ref="columnsStageElement" class="catalog-columns-stage">
            <Transition name="catalog-columns">
              <div :key="activeMenu.id" class="catalog-columns" :data-domain="activeMenu.id">
                <section class="catalog-column content-column">
                  <p class="column-label">内容</p>
                  <div class="catalog-list">
                    <button
                      v-for="option in contentOptions"
                      :key="option.id"
                      type="button"
                      class="catalog-item"
                      :class="{ selected: option.id === selectedContentType }"
                      :aria-pressed="option.id === selectedContentType"
                      @mouseenter="selectContentType(option.id)"
                      @focus="selectContentType(option.id)"
                      @click="selectContentType(option.id)"
                    >
                      <span class="item-title">{{ option.title }}</span>
                      <span class="item-summary">{{ option.summary }}</span>
                    </button>
                  </div>
                </section>

                <section class="catalog-column technology-column">
                  <p class="column-label">技术</p>
                  <div class="catalog-list">
                    <button
                      v-for="technology in technologies"
                      :key="technology.id"
                      type="button"
                      class="catalog-item"
                      :class="{ selected: technology.id === activeTechnologyId }"
                      :aria-pressed="technology.id === selectedTechnologyId"
                      @mouseenter="previewTechnology(technology)"
                      @focus="previewTechnology(technology)"
                      @click="selectTechnology(technology)"
                    >
                      <span class="item-title">{{ technology.title }}</span>
                      <span v-if="technology.summary" class="item-summary">
                        {{ technology.summary }}
                      </span>
                    </button>
                    <p v-if="!technologies.length" class="empty-state">暂无已开放内容</p>
                  </div>
                </section>

                <section class="catalog-column module-column">
                  <p class="column-label">模块</p>
                  <div class="catalog-list">
                    <button
                      v-for="module in modules"
                      :key="module.id"
                      type="button"
                      class="catalog-item"
                      :class="{ selected: module.id === activeModuleId }"
                      :aria-pressed="module.id === selectedModuleId"
                      @mouseenter="previewModule(module)"
                      @focus="previewModule(module)"
                      @click="selectModule(module)"
                    >
                      <span class="item-title">{{ module.title }}</span>
                      <span v-if="module.summary" class="item-summary">{{ module.summary }}</span>
                    </button>
                    <p v-if="!modules.length" class="empty-state">暂无已开放模块</p>
                  </div>
                </section>

                <section class="catalog-column collection-column">
                  <p class="column-label">{{ detailColumnLabel }}</p>
                  <div class="catalog-list">
                    <template v-for="item in detailItems" :key="item.id">
                      <a
                        v-if="item.url"
                        :href="item.url"
                        class="catalog-item collection-link"
                        target="_blank"
                        rel="noopener noreferrer"
                        @click="closeMenusAfterNavigation"
                      >
                        <span class="item-title">{{ item.title }}</span>
                        <span v-if="item.summary" class="item-summary">{{ item.summary }}</span>
                      </a>
                      <RouterLink
                        v-else-if="item.status === 'available' && item.path"
                        :to="item.path"
                        class="catalog-item collection-link"
                        @click="closeMenusAfterNavigation"
                      >
                        <span class="item-title">{{ item.title }}</span>
                        <span v-if="item.summary" class="item-summary">{{ item.summary }}</span>
                      </RouterLink>
                      <span v-else class="catalog-item planned" aria-disabled="true">
                        <span class="item-title">{{ item.title }}</span>
                        <span class="status-label">规划中</span>
                      </span>
                    </template>
                    <p v-if="activeModule && !detailItems.length" class="empty-state">
                      当前模块暂无可用分类
                    </p>
                  </div>
                </section>
              </div>
            </Transition>
          </div>
        </nav>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.header {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 100;
  display: flex;
  height: var(--header-height);
  align-items: center;
  background: var(--color-bg-glass);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
}

.header-content {
  display: flex;
  width: min(var(--content-shell-width), 100%);
  height: 100%;
  align-items: center;
  padding: 0 var(--space-4);
  margin: 0 auto;
}

.logo {
  display: flex;
  flex: 1;
  min-width: 0;
  align-items: center;
  color: var(--color-text);
}

.logo-mark {
  display: flex;
  width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
  color: var(--color-text);
  font-size: var(--font-size-sm);
  font-weight: 700;
}

.logo-text {
  margin-left: var(--space-2);
  font-size: var(--font-size-sm);
  font-weight: 600;
  letter-spacing: 0;
}

.domain-nav {
  display: flex;
  height: 100%;
  align-items: center;
}

.domain-toggle {
  display: flex;
  height: var(--header-height);
  align-items: center;
  padding: 0 10px;
  margin: 0 3px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  font-weight: 400;
  line-height: 1;
  letter-spacing: 0;
  white-space: nowrap;
  transition: color var(--duration-fast) var(--ease-out);
}

.domain-toggle:hover,
.domain-toggle:focus-visible,
.domain-toggle.is-open,
.domain-toggle.is-current {
  color: var(--color-text);
}

.domain-toggle.is-current {
  font-weight: 600;
}

.header-actions {
  display: flex;
  flex: 1;
  min-width: 0;
  justify-content: flex-end;
}

.icon-button {
  display: flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  transition:
    color var(--duration-fast) var(--ease-out),
    transform 100ms var(--ease-out);
}

.icon-button + .icon-button {
  margin-left: var(--space-1);
}

.icon-button:hover {
  color: var(--color-text);
}

.icon-button:active {
  transform: scale(0.96);
}

.catalog-layer {
  position: fixed;
  inset: 0;
  z-index: 95;
  clip-path: inset(var(--header-height) 0 0 0);
  pointer-events: none;
  transition: clip-path 240ms var(--ease-out);
}

.catalog-scrim {
  position: absolute;
  inset: var(--header-height) 0 0;
  width: 100%;
  border-radius: 0;
  background: var(--color-nav-curtain);
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
  scrollbar-width: none;
  transition: height 240ms var(--ease-out);
}

.catalog-panel::-webkit-scrollbar {
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

.content-column {
  flex: 0 0 23%;
}

.technology-column {
  flex: 0 0 26%;
}

.module-column {
  flex: 0 0 24%;
}

.collection-column {
  flex: 1;
}

.column-label {
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  font-weight: 400;
  line-height: 1.3;
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

.catalog-item:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.item-title {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: 0;
}

.content-column .item-title {
  font-size: 24px;
  line-height: 1.08;
}

.item-summary {
  margin-top: 2px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  line-height: 1.45;
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
  padding: var(--space-2) 0;
  color: var(--color-text-tertiary);
  font-size: var(--font-size-sm);
}

.catalog-navigation-enter-active .catalog-panel,
.catalog-navigation-leave-active .catalog-panel {
  transition: height 240ms var(--ease-out);
}

.catalog-navigation-enter-from,
.catalog-navigation-leave-to {
  clip-path: inset(var(--header-height) 0 calc(100% - var(--header-height)) 0);
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

.catalog-navigation-enter-active .catalog-column:nth-child(4),
.catalog-columns-enter-active .catalog-column:nth-child(4) {
  transition-delay: 60ms;
}

.catalog-columns-enter-from .catalog-column,
.catalog-columns-leave-to .catalog-column,
.catalog-navigation-enter-from .catalog-column,
.catalog-navigation-leave-to .catalog-column {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 900px) {
  .header-content {
    padding: 0 var(--space-2);
  }

  .logo,
  .header-actions {
    flex: 0 0 auto;
  }

  .logo-text {
    display: none;
  }

  .domain-nav {
    flex: 1;
    justify-content: center;
  }

  .domain-toggle {
    padding: 0 var(--space-2);
    margin: 0;
  }

  .catalog-panel {
    padding: var(--space-5) var(--space-4) var(--space-6);
  }

  .catalog-columns {
    flex-direction: column;
  }

  .content-column,
  .technology-column,
  .module-column,
  .collection-column {
    width: 100%;
    flex: none;
  }

  .catalog-column + .catalog-column {
    padding-left: 0;
    margin-top: var(--space-5);
  }

  .content-column .item-title {
    font-size: var(--font-size-lg);
  }
}

@media (max-width: 420px) {
  .domain-toggle {
    padding: 0 6px;
    font-size: var(--font-size-xs);
  }

  .icon-button {
    width: 30px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .catalog-layer,
  .catalog-panel,
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
  .header,
  .catalog-panel {
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
  .header,
  .catalog-panel {
    border-bottom: 1px solid var(--color-border-strong);
  }
}
</style>
