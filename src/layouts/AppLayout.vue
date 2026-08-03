<script setup lang="ts">
/* 板块内布局：顶栏 + 侧边栏 + 正文 + 右侧大纲槽位（需求文档 §4.2） */
import { onMounted, ref } from 'vue'
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'
import AppOutline from './AppOutline.vue'
import SearchDialog from '@/components/SearchDialog.vue'
import { currentDoc } from '@/content/current-doc'
import { docIndex, initDocIndex, sections } from '@/content/registry'
import type { SearchHit } from '@/content/catalog'

/** 窄屏抽屉侧边栏是否展开 */
const sidebarOpen = ref(false)
/** 搜索弹层是否打开 */
const searchOpen = ref(false)

/**
 * 为尚未迁移的旧页面提供统一 SearchHit；旧 registry 清除时一并删除。
 */
function searchLegacyDocs(query: string): SearchHit[] {
  const normalizedQuery = query.trim().toLocaleLowerCase()
  return docIndex.value
    .filter(
      (doc) =>
        !normalizedQuery ||
        doc.title.toLocaleLowerCase().includes(normalizedQuery) ||
        doc.summary.toLocaleLowerCase().includes(normalizedQuery),
    )
    .map((doc) => ({
      id: `${doc.section}.${doc.category}.${doc.id}`,
      title: doc.title,
      summary: doc.summary,
      path: doc.path,
      group: doc.section,
      groupLabel: sections[doc.section]?.title ?? doc.section,
    }))
}

// 兼容层只在访问旧布局时加载旧正文元数据；31 篇内容迁移完成后删除。
onMounted(() => void initDocIndex())
</script>

<template>
  <div class="layout">
    <AppHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" @open-search="searchOpen = true" />
    <AppSidebar :open="sidebarOpen" @close="sidebarOpen = false" />
    <SearchDialog
      :open="searchOpen"
      :provider="searchLegacyDocs"
      @close="searchOpen = false"
      @open="searchOpen = true"
    />
    <main class="main">
      <div class="content">
        <RouterView v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" :key="$route.path" />
          </Transition>
        </RouterView>
      </div>
      <div class="outline-slot">
        <AppOutline v-if="currentDoc" :blocks="currentDoc.blocks" />
      </div>
    </main>
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
}

.main {
  display: flex;
  padding-top: var(--header-height);
  margin-left: var(--sidebar-width);
}

.content {
  flex: 1;
  min-width: 0;
  max-width: var(--content-max-width);
  padding: var(--space-6) var(--space-6) var(--space-8);
  margin: 0 auto;
}

.outline-slot {
  flex-shrink: 0;
  width: var(--outline-width);
}

@media (max-width: 1200px) {
  .outline-slot {
    display: none;
  }
}

@media (max-width: 900px) {
  .main {
    margin-left: 0;
  }
}
</style>
