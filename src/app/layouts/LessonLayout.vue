<script setup lang="ts">
import { computed, ref } from 'vue'
import ContentNavigationDrawer from '@/common/ui/navigation/ContentNavigationDrawer.vue'
import OfficialSourceList from '@/common/ui/content/OfficialSourceList.vue'
import LearningPathList from '@/common/ui/navigation/LearningPathList.vue'
import PrerequisiteNotice from '@/common/ui/navigation/PrerequisiteNotice.vue'
import CompletionControl from '@/common/ui/progress/CompletionControl.vue'
import CourseProgress from '@/common/ui/progress/CourseProgress.vue'
import { learningCatalog } from '@/app/catalog'
import type { CategoryNavigation, EntryNeighbors, LearningTrack } from '@/common/catalog'
import type { LessonEntry } from '@/common/content'
import { useProgressStore } from '@/common/progress/progress'
import { buildModulePath } from '@/common/catalog/category-path'
import AppOutline from './AppOutline.vue'

interface RelatedEntryLink {
  id: string
  title: string
  path: string
  type: 'lesson' | 'reference'
}

/** 中窄屏学习路径抽屉是否打开 */
const navigationDrawerOpen = ref(false)

const props = defineProps<{
  entry: LessonEntry
  navigation: CategoryNavigation
  neighbors: EntryNeighbors
  track?: LearningTrack
}>()

const progress = useProgressStore()

/** 当前条目是否属于本次增强的 Java Core 课程。 */
const isJavaCoreLesson = computed(
  () =>
    props.entry.meta.domain === 'backend' &&
    props.entry.meta.technology === 'java' &&
    props.entry.meta.module === 'core',
)

/** 当前课程所属模块的课程总览地址。 */
const overviewPath = computed(() =>
  buildModulePath({
    domain: props.entry.meta.domain,
    technology: props.entry.meta.technology,
    module: props.entry.meta.module,
  }),
)

/** 当前课程所在的显式学习阶段。 */
const currentStage = computed(() =>
  props.track?.stages.find((stage) =>
    stage.entries.some((item) => item.entryId === props.entry.meta.id),
  ),
)

/** 当前学习路径的完成比例与继续入口。 */
const trackProgress = computed(() =>
  props.track
    ? progress.getTrackProgress(props.track)
    : { completedCount: 0, totalCount: 0, ratio: 0 },
)

/** 尚未完成且位于当前学习路径中的前置课程。 */
const prerequisiteItems = computed(() =>
  (props.entry.meta.prerequisites ?? [])
    .map((id) => props.track?.entries.find((item) => item.entryId === id))
    .filter((item) => item && !progress.isCompleted(item.entryId))
    .map((item) => item!),
)

/** 当前课程声明的站内关联课程与 API。 */
const relatedEntries = computed<RelatedEntryLink[]>(() => {
  const searchHits = new Map(learningCatalog.search('').map((item) => [item.id, item]))
  return (props.entry.meta.related ?? []).flatMap((id) => {
    const item = searchHits.get(id)
    const type = learningCatalog.getEntry(id)?.type
    return item && (type === 'lesson' || type === 'reference') ? [{ ...item, type }] : []
  })
})

/** 当前课程关联的其他课程。 */
const relatedLessons = computed(() => relatedEntries.value.filter((item) => item.type === 'lesson'))

/** 当前课程关联的 API 参考。 */
const relatedReferences = computed(() =>
  relatedEntries.value.filter((item) => item.type === 'reference'),
)

/**
 * 更新当前课程的本地完成状态。
 */
function setEntryCompleted(completed: boolean): void {
  progress.setCompleted(props.entry.meta.id, completed)
}
</script>

<template>
  <div class="content-layout lesson-layout">
    <aside class="content-sidebar lesson-path">
      <p class="sidebar-eyebrow">学习路径</p>
      <RouterLink :to="overviewPath" class="sidebar-link navigation-overview">总览</RouterLink>
      <CourseProgress
        class="sidebar-progress"
        :completed="trackProgress.completedCount"
        :total="trackProgress.totalCount"
        :stage-title="currentStage?.title"
      />
      <LearningPathList :stages="track?.stages ?? []" :current-entry-id="entry.meta.id" />
    </aside>

    <article :key="`reading-${entry.meta.id}`" class="content-reading lesson-main">
      <button
        type="button"
        class="navigation-trigger"
        aria-haspopup="dialog"
        :aria-expanded="navigationDrawerOpen"
        @click="navigationDrawerOpen = true"
      >
        打开学习路径
      </button>
      <ContentNavigationDrawer
        :open="navigationDrawerOpen"
        title="学习路径"
        @close="navigationDrawerOpen = false"
      >
        <RouterLink
          :to="overviewPath"
          class="sidebar-link navigation-overview"
          @click="navigationDrawerOpen = false"
        >
          总览
        </RouterLink>
        <LearningPathList
          :stages="track?.stages ?? []"
          :current-entry-id="entry.meta.id"
          @select="navigationDrawerOpen = false"
        />
      </ContentNavigationDrawer>
      <header class="entry-header">
        <p class="entry-kind">课程{{ currentStage ? ` · ${currentStage.title}` : '' }}</p>
        <h1>{{ entry.meta.title }}</h1>
        <p class="entry-summary">{{ entry.meta.summary }}</p>
        <section class="objectives" aria-labelledby="objectives-title">
          <h2 id="objectives-title">学完能做什么</h2>
          <ul>
            <li v-for="objective in entry.objectives" :key="objective">{{ objective }}</li>
          </ul>
        </section>
      </header>
      <PrerequisiteNotice :items="prerequisiteItems" />
      <details class="compact-panel compact-outline">
        <summary>查看本页大纲</summary>
        <AppOutline :blocks="entry.blocks" />
      </details>
      <details class="compact-panel compact-context">
        <summary>查看课程信息</summary>
        <p v-if="entry.meta.estimatedMinutes">约 {{ entry.meta.estimatedMinutes }} 分钟</p>
        <p>适用于 {{ entry.meta.appliesTo }}</p>
        <p>核验于 {{ entry.meta.verifiedAt }}</p>
      </details>
      <slot />
      <section v-if="entry.recap?.length" class="lesson-recap" aria-labelledby="recap-title">
        <p class="entry-kind">课程总结</p>
        <h2 id="recap-title">回顾本课</h2>
        <ul>
          <li v-for="item in entry.recap" :key="item">{{ item }}</li>
        </ul>
      </section>
      <section
        v-if="relatedEntries.length"
        class="related-learning"
        aria-labelledby="related-learning-title"
      >
        <p class="entry-kind">继续探索</p>
        <h2 id="related-learning-title">关联学习</h2>
        <section v-if="relatedLessons.length" class="related-group">
          <h3>相关课程</h3>
          <RouterLink
            v-for="item in relatedLessons"
            :key="item.id"
            :to="item.path"
            class="related-link"
          >
            {{ item.title }}
          </RouterLink>
        </section>
        <section v-if="relatedReferences.length" class="related-group">
          <h3>相关 API</h3>
          <RouterLink
            v-for="item in relatedReferences"
            :key="item.id"
            :to="item.path"
            class="related-link"
          >
            {{ item.title }}
          </RouterLink>
        </section>
      </section>
      <section
        v-if="entry.meta.sources.length"
        class="mobile-sources"
        aria-labelledby="mobile-sources-title"
      >
        <p class="entry-kind">延伸阅读</p>
        <h2 id="mobile-sources-title">资料来源</h2>
        <OfficialSourceList v-if="isJavaCoreLesson" :sources="entry.meta.sources" />
        <template v-else>
          <a
            v-for="source in entry.meta.sources"
            :key="source.url"
            :href="source.url"
            target="_blank"
            rel="noreferrer"
          >
            {{ source.title }}
          </a>
        </template>
      </section>
      <CompletionControl
        :completed="progress.isCompleted(entry.meta.id)"
        @change="setEntryCompleted"
      />
      <nav class="entry-neighbors" aria-label="课程前后篇">
        <RouterLink
          v-if="neighbors.previous"
          :to="neighbors.previous.path"
          class="entry-neighbor"
          :aria-label="`上一篇：${neighbors.previous.title}`"
        >
          <span class="neighbor-direction">上一篇：</span>
          <span>{{ neighbors.previous.title }}</span>
        </RouterLink>
        <RouterLink
          v-if="neighbors.next"
          :to="neighbors.next.path"
          class="entry-neighbor next"
          :aria-label="`下一篇：${neighbors.next.title}`"
        >
          <span class="neighbor-direction">下一篇：</span>
          <span>{{ neighbors.next.title }}</span>
        </RouterLink>
      </nav>
    </article>

    <aside
      :key="`context-${entry.meta.id}`"
      class="content-context lesson-context"
      aria-label="页面快捷导航"
    >
      <AppOutline :blocks="entry.blocks" />
      <section v-if="entry.meta.sources.length" class="context-details" aria-label="资料来源">
        <p class="context-title">资料来源</p>
        <OfficialSourceList v-if="isJavaCoreLesson" :sources="entry.meta.sources" />
        <template v-else>
          <a
            v-for="source in entry.meta.sources"
            :key="source.url"
            :href="source.url"
            target="_blank"
            rel="noreferrer"
          >
            {{ source.title }}
          </a>
        </template>
      </section>
      <section class="context-details" aria-label="课程信息">
        <p class="context-title">课程信息</p>
        <p v-if="entry.meta.estimatedMinutes">约 {{ entry.meta.estimatedMinutes }} 分钟</p>
        <p>适用于 {{ entry.meta.appliesTo }}</p>
        <p>核验于 {{ entry.meta.verifiedAt }}</p>
      </section>
    </aside>
  </div>
</template>

<style scoped src="./content-layout.css"></style>

<style scoped>
.objectives {
  padding-top: var(--space-5);
  margin-top: var(--space-6);
  border-top: 1px solid var(--color-border);
}

.objectives h2 {
  font-size: var(--font-size-base);
}

.objectives ul {
  padding-left: var(--space-5);
  margin-top: var(--space-2);
  color: var(--color-text-secondary);
}

.objectives li + li {
  margin-top: var(--space-1);
}

.sidebar-progress {
  margin-top: var(--space-4);
  margin-bottom: var(--space-5);
}

.lesson-context > :deep(.outline) {
  margin-top: var(--space-5);
}

.lesson-recap {
  padding-top: var(--space-6);
  margin-top: var(--space-7);
  border-top: 1px solid var(--color-border);
}

.lesson-recap h2 {
  font-size: var(--font-size-lg);
}

.lesson-recap ul {
  padding-left: var(--space-5);
  margin-top: var(--space-3);
  color: var(--color-text-secondary);
}

.lesson-recap li + li {
  margin-top: var(--space-2);
}

.related-group {
  margin-top: var(--space-5);
}

.related-group + .related-group {
  padding-top: var(--space-5);
  border-top: 1px solid var(--color-border);
}

.related-group h3 {
  margin-bottom: var(--space-2);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}
</style>
