<script setup lang="ts">
/* 全站顶栏：按学习目的组织入口，并保留旧内容页的窄屏侧栏按钮。 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import CatalogNavigationPanel from '@/components/navigation/CatalogNavigationPanel.vue'
import type { ContentPurpose } from '@/content/catalog'
import { useThemeStore } from '@/stores/theme'

/** 顶层学习目的入口 */
const purposeLinks = [
  { id: 'learn', title: '系统学习', path: '/learn' },
  { id: 'reference', title: '技术参考', path: '/reference' },
  { id: 'projects', title: '项目实战', path: '/projects' },
] as const

const route = useRoute()
const theme = useThemeStore()

const emit = defineEmits<{ toggleSidebar: []; openSearch: [] }>()

interface CatalogNavigationPanelExpose {
  focusFirstItem(): Promise<void>
}

/** 旧内容页当前板块，用于控制兼容侧栏按钮。 */
const legacySection = computed(() => route.params.section as string | undefined)
/** 当前路由对应的学习目的。 */
const currentPurpose = computed(
  () =>
    purposeLinks.find((link) => route.path === link.path || route.path.startsWith(`${link.path}/`))
      ?.id,
)
/** 目录导航是否打开。 */
const catalogOpen = ref(false)
/** 当前目录面板展示的学习目的。 */
const activePurpose = ref<ContentPurpose>('learn')
/** 当前是否使用移动 Sheet。 */
const isMobile = ref(false)
/** 目录面板公开聚焦能力的组件引用。 */
const catalogPanelEl = ref<CatalogNavigationPanelExpose | null>(null)

let viewportQuery: MediaQueryList | undefined
let closeTimer: ReturnType<typeof setTimeout> | undefined

/** 清除桌面目录的延迟关闭任务。 */
function cancelNavigationClose(): void {
  if (!closeTimer) return
  clearTimeout(closeTimer)
  closeTimer = undefined
}

/** 关闭目录并清理延迟任务。 */
function closeNavigation(): void {
  cancelNavigationClose()
  catalogOpen.value = false
}

/** 在桌面指针离开顶栏或面板后延迟关闭。 */
function scheduleNavigationClose(): void {
  if (isMobile.value || !catalogOpen.value) return
  cancelNavigationClose()
  closeTimer = setTimeout(closeNavigation, 180)
}

/** 为指定学习目的打开桌面 Mega Menu。 */
function openDesktopNavigation(purpose: ContentPurpose): void {
  if (isMobile.value) return
  cancelNavigationClose()
  activePurpose.value = purpose
  catalogOpen.value = true
}

/** 打开指定目的目录并将焦点移入首个可操作项。 */
async function focusDesktopNavigation(purpose: ContentPurpose): Promise<void> {
  openDesktopNavigation(purpose)
  await nextTick()
  await catalogPanelEl.value?.focusFirstItem()
}

/** 按当前路由目的打开移动学习目录。 */
function openMobileNavigation(): void {
  cancelNavigationClose()
  activePurpose.value = currentPurpose.value ?? 'learn'
  catalogOpen.value = true
}

/** 在同一目录面板中切换学习目的。 */
function selectPurpose(purpose: ContentPurpose): void {
  activePurpose.value = purpose
}

/** 关闭目录后打开站内搜索。 */
function openSearch(): void {
  closeNavigation()
  emit('openSearch')
}

/** 同步响应式断点，并关闭跨模式遗留的目录。 */
function onViewportChange(event: MediaQueryListEvent): void {
  isMobile.value = event.matches
  closeNavigation()
}

onMounted(() => {
  viewportQuery = window.matchMedia('(max-width: 900px)')
  isMobile.value = viewportQuery.matches
  viewportQuery.addEventListener('change', onViewportChange)
})

onBeforeUnmount(() => {
  cancelNavigationClose()
  viewportQuery?.removeEventListener('change', onViewportChange)
})

watch(() => route.fullPath, closeNavigation)
</script>

<template>
  <header class="header" @mouseenter="cancelNavigationClose" @mouseleave="scheduleNavigationClose">
    <div class="header-content">
      <div class="header-left">
        <button
          v-if="legacySection"
          class="icon-btn hamburger"
          aria-label="展开侧边栏"
          @click="emit('toggleSidebar')"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          >
            <path d="M2 4.5h14M2 9h14M2 13.5h14" />
          </svg>
        </button>
        <RouterLink to="/" class="logo" @click="closeNavigation">
          <span class="logo-mark">F</span>
          <span class="logo-text">IT 学习站</span>
        </RouterLink>
      </div>

      <nav class="tabs" aria-label="学习目的">
        <RouterLink
          v-for="link in purposeLinks"
          :key="link.path"
          :to="link.path"
          class="tab"
          :class="{ active: currentPurpose === link.id }"
          :aria-expanded="catalogOpen && activePurpose === link.id"
          aria-controls="catalog-navigation-panel"
          @mouseenter="openDesktopNavigation(link.id)"
          @focus="openDesktopNavigation(link.id)"
          @keydown.down.prevent="focusDesktopNavigation(link.id)"
          @click="closeNavigation"
        >
          {{ link.title }}
        </RouterLink>
      </nav>

      <div class="header-right">
        <button
          type="button"
          class="catalog-trigger"
          aria-label="打开学习目录"
          :aria-expanded="catalogOpen"
          aria-controls="catalog-navigation-panel"
          @click="openMobileNavigation"
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
            <path d="M2 4h12M2 8h12M2 12h12" />
          </svg>
          <span>目录</span>
        </button>
        <button class="search-btn" aria-label="搜索" @click="openSearch">
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          >
            <circle cx="6" cy="6" r="4.5" />
            <path d="M9.5 9.5L13 13" />
          </svg>
          <span class="search-text">搜索</span>
          <kbd class="search-kbd">⌘K</kbd>
        </button>
        <button
          class="icon-btn"
          :aria-label="theme.isDark ? '切换到亮色' : '切换到暗色'"
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

  <CatalogNavigationPanel
    ref="catalogPanelEl"
    :open="catalogOpen"
    :mobile="isMobile"
    :purpose="activePurpose"
    :purposes="purposeLinks"
    @close="closeNavigation"
    @select-purpose="selectPurpose"
    @pointer-enter="cancelNavigationClose"
    @pointer-leave="scheduleNavigationClose"
  />
</template>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  height: var(--header-height);
  background: var(--color-bg-glass);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
}

.header-content {
  display: flex;
  align-items: center;
  width: min(var(--content-shell-width), 100%);
  height: 100%;
  padding: 0 var(--space-4);
  margin: 0 auto;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.logo {
  display: flex;
  align-items: center;
  color: var(--color-text);
}

.logo-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: var(--color-text);
  font-size: var(--font-size-base);
  font-weight: 700;
}

.logo-text {
  margin-left: var(--space-2);
  font-size: var(--font-size-sm);
  font-weight: 600;
  letter-spacing: 0;
}

.tabs {
  display: flex;
  align-items: center;
}

.tab {
  display: flex;
  align-items: center;
  height: var(--header-height);
  padding: 0 10px;
  margin: 0 3px;
  font-size: var(--font-size-xs);
  font-weight: 400;
  line-height: 1;
  color: var(--color-text-secondary);
  letter-spacing: 0;
  transition: color var(--duration-fast) var(--ease-out);
}

.tab:hover {
  color: var(--color-text);
}

.tab.active {
  color: var(--color-text);
  font-weight: 600;
}

.header-right {
  justify-content: flex-end;
}

.catalog-trigger {
  display: none;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: var(--color-text-secondary);
  transition:
    color var(--duration-fast) var(--ease-out),
    transform 100ms var(--ease-out);
}

.catalog-trigger:hover,
.catalog-trigger:focus-visible {
  color: var(--color-text);
}

.catalog-trigger:active {
  transform: scale(0.96);
}

.search-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: var(--color-text-secondary);
  transition:
    color var(--duration-fast) var(--ease-out),
    transform 100ms var(--ease-out);
}

.search-btn:hover {
  color: var(--color-text);
}

.search-btn:active {
  transform: scale(0.96);
}

.search-text,
.search-kbd {
  display: none;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-left: var(--space-1);
  color: var(--color-text-secondary);
  transition:
    color var(--duration-fast) var(--ease-out),
    transform 100ms var(--ease-out);
}

.icon-btn:hover {
  color: var(--color-text);
}

.icon-btn:active {
  transform: scale(0.96);
}

.hamburger {
  display: none;
  margin-left: 0;
  margin-right: var(--space-2);
}

@media (max-width: 900px) {
  .header-content {
    width: 100%;
    padding: 0 var(--space-4);
  }

  .hamburger {
    display: flex;
  }

  .tabs {
    display: none;
  }

  .catalog-trigger {
    display: flex;
  }

  .catalog-trigger span {
    display: none;
  }
}

@media (max-width: 560px) {
  .logo-text {
    display: none;
  }
}

@media (prefers-reduced-transparency: reduce) {
  .header {
    background: var(--color-nav-surface);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
}

@media (prefers-contrast: more) {
  .header {
    border-bottom: 1px solid var(--color-border-strong);
  }
}
</style>
