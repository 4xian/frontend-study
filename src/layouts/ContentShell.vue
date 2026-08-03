<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './AppHeader.vue'
import SearchDialog from '@/components/SearchDialog.vue'
import EcosystemModuleBar from '@/components/navigation/EcosystemModuleBar.vue'
import { learningCatalog } from '@/content/catalog'
import type { CatalogScope, ContentPurpose, SearchHit } from '@/content/catalog'

const route = useRoute()

/** 搜索弹层是否打开 */
const searchOpen = ref(false)

/** 当前新目录范围；首页搜索不限制目的。 */
const searchScope = computed<CatalogScope | undefined>(() => {
  const purpose = route.path.split('/')[1] as ContentPurpose | undefined
  if (!purpose || !['learn', 'reference', 'projects'].includes(purpose)) return undefined
  return {
    purpose,
    ecosystem: route.params.ecosystem as string | undefined,
  }
})

/** 当前模块总览或详情路由的持久模块导航。 */
const moduleNavigation = computed(() => {
  const purpose = searchScope.value?.purpose
  const ecosystem = route.params.ecosystem as string | undefined
  const module = route.params.module as string | undefined
  const collection = route.params.collection as string | undefined
  const entry = route.params.entry as string | undefined
  if (!purpose || !ecosystem || !module) return undefined

  const navigation = learningCatalog.getNavigation({
    purpose,
    ecosystem,
    module,
    collection,
  })
  if (!navigation.valid || navigation.module?.status !== 'available') return undefined
  if (!collection && !entry) return navigation
  return collection && entry && navigation.entries.some((item) => item.id === entry)
    ? navigation
    : undefined
})

/**
 * 在当前目录范围内调用 LearningCatalog 搜索。
 */
function searchCatalog(query: string): SearchHit[] {
  return learningCatalog.search(query, searchScope.value)
}

/**
 * 将搜索范围扩展到整个新目录。
 */
function searchAllCatalog(query: string): SearchHit[] {
  return learningCatalog.search(query)
}
</script>

<template>
  <div class="content-shell">
    <a class="skip-link" href="#main-content">跳到正文</a>
    <AppHeader @open-search="searchOpen = true" />
    <SearchDialog
      :open="searchOpen"
      :provider="searchCatalog"
      :global-provider="searchAllCatalog"
      @close="searchOpen = false"
      @open="searchOpen = true"
    />
    <main id="main-content" class="shell-main">
      <EcosystemModuleBar v-if="moduleNavigation" :navigation="moduleNavigation" />
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
