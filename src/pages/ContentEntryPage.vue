<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import type { Component } from 'vue'
import { useRoute } from 'vue-router'
import LessonLayout from '@/layouts/LessonLayout.vue'
import ProjectLayout from '@/layouts/ProjectLayout.vue'
import ReferenceLayout from '@/layouts/ReferenceLayout.vue'
import ContentRenderer from '@/components/content/ContentRenderer.vue'
import { learningCatalog } from '@/content/catalog'
import type { CatalogScope, ContentPurpose } from '@/content/catalog'
import type { ContentEntry } from '@/content/schema'
import { useProgressStore } from '@/stores/progress'

const props = defineProps<{ purpose: ContentPurpose }>()
const route = useRoute()
const progress = useProgressStore()

/** 加载状态：undefined 表示加载中，null 表示目录中不存在 */
const entry = ref<ContentEntry | null | undefined>(undefined)

/** 当前五级路由对应的目录范围 */
const scope = computed<CatalogScope>(() => ({
  purpose: props.purpose,
  ecosystem: route.params.ecosystem as string,
  module: route.params.module as string,
  collection: route.params.collection as string,
}))

/** 当前集合的公开导航数据 */
const navigation = computed(() => learningCatalog.getNavigation(scope.value))
/** 从公开导航中解析当前路径段对应的稳定条目 ID */
const entryNode = computed(() =>
  navigation.value.entries.find((item) => item.id === route.params.entry),
)
/** 当前条目的相邻元数据 */
const neighbors = computed(() => learningCatalog.getNeighbors(entryNode.value?.entryId ?? ''))
/** 当前课程所属的显式学习路径；其他内容类型不计算。 */
const learningTrack = computed(() => {
  if (entry.value?.meta.type !== 'lesson') return undefined
  return learningCatalog.getLearningTrack({
    ecosystem: entry.value.meta.ecosystem,
    module: entry.value.meta.module,
  })
})
/** 按条目类型选择独立模板 */
const layoutComponent = computed<Component | null>(() => {
  if (entry.value?.meta.type === 'lesson') return LessonLayout
  if (entry.value?.meta.type === 'reference') return ReferenceLayout
  if (entry.value?.meta.type === 'project') return ProjectLayout
  return null
})

/**
 * 仅在稳定 ID 已由目录解析后懒加载当前正文。
 */
async function loadCurrentEntry(entryId?: string): Promise<void> {
  if (!entryId) {
    entry.value = null
    return
  }
  const loadedEntry = await learningCatalog.loadEntry(entryId)
  if (entryNode.value?.entryId !== entryId) return
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
  () => [entryNode.value?.entryId, route.hash] as const,
  ([entryId, hash], previous) => {
    if (entryId !== previous?.[0]) {
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
