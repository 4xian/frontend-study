<script setup lang="ts">
import { computed, ref } from 'vue'
import ContentNavigationDrawer from '@/components/navigation/ContentNavigationDrawer.vue'
import { learningCatalog } from '@/content/catalog'
import type { CatalogNavigation, EntryNeighbors } from '@/content/catalog'
import type { ReferenceEntry } from '@/content/schema'
import AppOutline from './AppOutline.vue'

interface RelatedEntryLink {
  id: string
  title: string
  path: string
}

/** 中窄屏参考目录抽屉是否打开 */
const navigationDrawerOpen = ref(false)

const props = defineProps<{
  entry: ReferenceEntry
  navigation: CatalogNavigation
  neighbors: EntryNeighbors
}>()

/** 当前参考所属模块的 API 总览地址。 */
const overviewPath = computed(
  () => `/reference/${props.entry.meta.ecosystem}/${props.entry.meta.module}`,
)

/** Vue 核心模块下按内容分类组织的完整参考目录。 */
const navigationGroups = computed(() =>
  props.navigation.collections.map((collection) => ({
    id: collection.id,
    title: collection.title,
    entries: learningCatalog.getNavigation({
      ...props.navigation.scope,
      collection: collection.id,
    }).entries,
  })),
)

/** 当前参考声明的站内关联内容。 */
const relatedEntries = computed<RelatedEntryLink[]>(() => {
  const searchHits = new Map(learningCatalog.search('').map((item) => [item.id, item]))
  return (props.entry.meta.related ?? []).flatMap((id) => {
    const item = searchHits.get(id)
    return item ? [item] : []
  })
})
</script>

<template>
  <div class="content-layout reference-layout">
    <aside class="content-sidebar reference-index">
      <p class="sidebar-eyebrow">参考目录</p>
      <nav class="sidebar-list" aria-label="参考目录">
        <RouterLink :to="overviewPath" class="sidebar-link navigation-overview">总览</RouterLink>
        <section v-for="group in navigationGroups" :key="group.id" class="sidebar-group">
          <p class="sidebar-group-title">{{ group.title }}</p>
          <RouterLink
            v-for="item in group.entries"
            :key="item.entryId"
            :to="item.path"
            class="sidebar-link index-link"
            :class="{ active: item.entryId === entry.meta.id }"
            :aria-current="item.entryId === entry.meta.id ? 'page' : undefined"
          >
            {{ item.title }}
          </RouterLink>
        </section>
      </nav>
    </aside>

    <article :key="`reading-${entry.meta.id}`" class="content-reading reference-main">
      <button
        type="button"
        class="navigation-trigger"
        aria-haspopup="dialog"
        :aria-expanded="navigationDrawerOpen"
        @click="navigationDrawerOpen = true"
      >
        打开参考目录
      </button>
      <ContentNavigationDrawer
        :open="navigationDrawerOpen"
        title="参考目录"
        @close="navigationDrawerOpen = false"
      >
        <RouterLink
          :to="overviewPath"
          class="sidebar-link navigation-overview"
          @click="navigationDrawerOpen = false"
        >
          总览
        </RouterLink>
        <section v-for="group in navigationGroups" :key="group.id" class="sidebar-group">
          <p class="sidebar-group-title">{{ group.title }}</p>
          <RouterLink
            v-for="item in group.entries"
            :key="item.entryId"
            :to="item.path"
            class="sidebar-link index-link"
            :class="{ active: item.entryId === entry.meta.id }"
            :aria-current="item.entryId === entry.meta.id ? 'page' : undefined"
            @click="navigationDrawerOpen = false"
          >
            {{ item.title }}
          </RouterLink>
        </section>
      </ContentNavigationDrawer>
      <header class="entry-header">
        <p class="entry-kind">技术参考</p>
        <h1>{{ entry.meta.title }}</h1>
        <p class="entry-summary">{{ entry.meta.summary }}</p>
        <code v-if="entry.signature" class="signature">{{ entry.signature }}</code>
      </header>
      <details class="compact-panel compact-outline">
        <summary>查看本页大纲</summary>
        <AppOutline :blocks="entry.blocks" />
      </details>
      <details class="compact-panel compact-context">
        <summary>查看版本信息</summary>
        <p>适用于 {{ entry.meta.appliesTo }}</p>
        <p>核验于 {{ entry.meta.verifiedAt }}</p>
      </details>
      <slot />
      <section
        v-if="relatedEntries.length"
        class="related-learning"
        aria-labelledby="related-learning-title"
      >
        <p class="entry-kind">继续探索</p>
        <h2 id="related-learning-title">关联学习</h2>
        <RouterLink
          v-for="item in relatedEntries"
          :key="item.id"
          :to="item.path"
          class="related-link"
        >
          {{ item.title }}
        </RouterLink>
      </section>
      <section
        v-if="entry.meta.sources.length"
        class="mobile-sources"
        aria-labelledby="mobile-sources-title"
      >
        <p class="entry-kind">延伸阅读</p>
        <h2 id="mobile-sources-title">官方来源</h2>
        <a
          v-for="source in entry.meta.sources"
          :key="source.url"
          :href="source.url"
          target="_blank"
          rel="noreferrer"
        >
          {{ source.title }}
        </a>
      </section>
      <nav class="entry-neighbors" aria-label="参考前后篇">
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
      class="content-context reference-context"
      aria-label="页面快捷导航"
    >
      <AppOutline :blocks="entry.blocks" />
      <section class="context-details" aria-label="版本与来源">
        <p class="context-title">版本与来源</p>
        <p>适用于 {{ entry.meta.appliesTo }}</p>
        <p>核验于 {{ entry.meta.verifiedAt }}</p>
        <a
          v-for="source in entry.meta.sources"
          :key="source.url"
          :href="source.url"
          target="_blank"
          rel="noreferrer"
        >
          {{ source.title }}
        </a>
      </section>
    </aside>
  </div>
</template>

<style scoped src="./content-layout.css"></style>

<style scoped>
.signature {
  display: block;
  padding: var(--space-3);
  margin-top: var(--space-5);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-sunken);
  font-size: var(--font-size-sm);
  overflow-x: auto;
}
</style>
