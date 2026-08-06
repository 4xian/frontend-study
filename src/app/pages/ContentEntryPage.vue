<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import type { Component } from 'vue'
import { useRoute } from 'vue-router'
import LessonLayout from '@/app/layouts/LessonLayout.vue'
import ReferenceLayout from '@/app/layouts/ReferenceLayout.vue'
import JavaMetaDetails from '@/categories/backend/java/core/ui/JavaMetaDetails.vue'
import ContentRenderer from '@/common/ui/content/ContentRenderer.vue'
import { learningCatalog } from '@/app/catalog'
import type { CategoryScope } from '@/common/catalog'
import type { ContentEntry } from '@/common/content'
import { useProgressStore } from '@/common/progress/progress'

const route = useRoute()
const progress = useProgressStore()

/** 加载状态：undefined 表示加载中，null 表示目录中不存在。 */
const entry = ref<ContentEntry | null | undefined>(undefined)

/** 按最终详情路径解析唯一条目。 */
const entryMeta = computed(() => learningCatalog.getEntryByPath(route.path))

/** 当前条目在最终技术目录中的内部范围。 */
const scope = computed<CategoryScope | undefined>(() => {
  const meta = entryMeta.value
  if (!meta) return undefined
  return {
    domain: meta.domain,
    technology: meta.technology,
    module: meta.module,
    contentType: meta.type === 'lesson' ? 'learn' : 'reference',
  }
})

/** 当前模块的公开导航数据。 */
const navigation = computed(() => learningCatalog.getNavigation(scope.value))
/** 当前条目的相邻元数据。 */
const neighbors = computed(() => learningCatalog.getNeighbors(entryMeta.value?.id ?? ''))
/** 当前课程所属的完整学习路径。 */
const learningTrack = computed(() => {
  const meta = entryMeta.value
  if (!meta || meta.type !== 'lesson') return undefined
  return learningCatalog.getLearningTrack({
    domain: meta.domain,
    technology: meta.technology,
    module: meta.module,
  })
})
/** 按条目类型选择独立布局。 */
const layoutComponent = computed<Component | null>(() => {
  if (entry.value?.meta.type === 'lesson') return LessonLayout
  if (entry.value?.meta.type === 'reference') return ReferenceLayout
  return null
})

/** 仅在路径已由 Catalog 解析后懒加载正文。 */
async function loadCurrentEntry(entryId?: string): Promise<void> {
  if (!entryId) {
    entry.value = null
    return
  }
  const loadedEntry = await learningCatalog.loadEntry(entryId)
  if (entryMeta.value?.id !== entryId) return
  entry.value = loadedEntry
  if (loadedEntry.meta.type === 'lesson') progress.recordVisit(entryId)
  await scrollToHash()
}

/** 在正文挂载后定位当前 URL hash 对应的公开锚点。 */
async function scrollToHash(): Promise<void> {
  await nextTick()
  const anchorId = decodeURIComponent(route.hash.slice(1))
  if (anchorId) document.getElementById(anchorId)?.scrollIntoView()
}

watch(
  () => [entryMeta.value?.id, route.hash] as const,
  ([entryId, hash], previous) => {
    if (entry.value === undefined || entryId !== previous?.[0]) {
      entry.value = undefined
      void loadCurrentEntry(entryId)
    } else if (hash !== previous?.[1]) {
      void scrollToHash()
    }
  },
  { immediate: true },
)
</script>

<template>
  <div v-if="entry === undefined" class="entry-state" role="status">正在加载内容…</div>
  <div v-else-if="entry === null || !layoutComponent" class="entry-state" role="status">
    <h1>内容不存在或尚未开放</h1>
    <p>当前路径没有对应的已发布条目。</p>
  </div>
  <component
    :is="layoutComponent"
    v-else
    :entry="entry"
    :navigation="navigation"
    :neighbors="neighbors"
    :track="learningTrack"
  >
    <JavaMetaDetails :meta="entry.meta" />
    <ContentRenderer :blocks="entry.blocks" />
  </component>
</template>

<style scoped>
.entry-state {
  width: min(var(--page-reading-width), calc(100% - 2 * var(--space-5)));
  padding: var(--space-8) 0;
  margin: 0 auto;
}

.entry-state h1 {
  font-size: var(--font-size-title);
  font-weight: 600;
  line-height: 1.08;
}

.entry-state p {
  margin-top: var(--space-2);
  color: var(--color-text-secondary);
}

@media (max-width: 820px) {
  .entry-state {
    width: min(var(--page-reading-width), calc(100% - 2 * var(--space-4)));
    padding: var(--space-7) 0;
  }

  .entry-state h1 {
    font-size: 44px;
  }
}
</style>
