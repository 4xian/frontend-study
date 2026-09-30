<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './AppHeader.vue'
import SearchDialog from '@/common/ui/SearchDialog.vue'
import ModuleNavigationBar from '@/common/ui/navigation/ModuleNavigationBar.vue'
import { learningCatalog } from '@/app/catalog'
import type { CategoryScope, ContentType, DomainId, SearchHit } from '@/common/catalog'

const route = useRoute()
const searchOpen = ref(false)
const searchIndexVersion = ref(0)

/** 打开搜索并在需要时加载延迟搜索索引。 */
function openSearch(): void {
  searchOpen.value = true
  void learningCatalog
    .prepareSearch()
    .then(() => {
      searchIndexVersion.value += 1
    })
    .catch(() => {
      searchIndexVersion.value += 1
    })
}

/** 从当前最终路由生成站内搜索范围。 */
const searchScope = computed<CategoryScope | undefined>(() => {
  const domain = route.params.domain as DomainId | undefined
  if (!domain) return undefined
  return {
    domain,
    technology: route.params.technology as string | undefined,
    module: route.params.module as string | undefined,
    contentType: route.params.contentType as ContentType | undefined,
  }
})

/** 当前 Technology 下用于切换 Module 的持久导航。 */
const moduleNavigation = computed(() => {
  const scope = searchScope.value
  if (!scope?.domain || !scope.technology || !scope.module) return undefined
  const navigation = learningCatalog.getNavigation(scope)
  return navigation.valid ? navigation : undefined
})

/** 在当前技术目录范围内搜索。 */
function searchCatalog(query: string): SearchHit[] {
  void searchIndexVersion.value
  return learningCatalog.search(query, searchScope.value)
}

/** 将搜索范围扩展到整个技术中心。 */
function searchAllCatalog(query: string): SearchHit[] {
  void searchIndexVersion.value
  return learningCatalog.search(query)
}
</script>

<template>
  <div class="content-shell">
    <a class="skip-link" href="#main-content">跳到正文</a>
    <AppHeader @open-search="openSearch" />
    <SearchDialog
      :open="searchOpen"
      :provider="searchCatalog"
      :global-provider="searchAllCatalog"
      @close="searchOpen = false"
      @open="openSearch"
    />
    <main id="main-content" class="shell-main">
      <ModuleNavigationBar v-if="moduleNavigation" :navigation="moduleNavigation" />
      <div class="shell-view">
        <RouterView v-slot="{ Component }">
          <Transition name="page">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </div>
    </main>
  </div>
</template>

<style scoped>
.content-shell {
  min-height: 100vh;
}

.shell-main {
  position: relative;
  min-height: 100vh;
  padding-top: var(--header-height);
}

.shell-view {
  position: relative;
  overflow-y: clip;
}

.skip-link {
  position: fixed;
  top: var(--space-2);
  left: var(--space-3);
  z-index: 300;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
  transform: translateY(-160%);
}

.skip-link:focus {
  transform: translateY(0);
}
</style>
