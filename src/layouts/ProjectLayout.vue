<script setup lang="ts">
import { ref } from 'vue'
import ContentNavigationDrawer from '@/components/navigation/ContentNavigationDrawer.vue'
import type { CatalogNavigation, EntryNeighbors } from '@/content/catalog'
import type { ProjectEntry } from '@/content/schema'
import AppOutline from './AppOutline.vue'

/** 中窄屏项目里程碑抽屉是否打开 */
const navigationDrawerOpen = ref(false)

defineProps<{
  entry: ProjectEntry
  navigation: CatalogNavigation
  neighbors: EntryNeighbors
}>()
</script>

<template>
  <div class="content-layout project-layout">
    <aside class="content-sidebar milestones">
      <p class="sidebar-eyebrow">项目里程碑</p>
      <section v-for="milestone in entry.milestones" :key="milestone.id" class="milestone">
        <strong>{{ milestone.title }}</strong>
        <span v-for="task in milestone.tasks" :key="task">{{ task }}</span>
      </section>
    </aside>

    <article class="content-reading project-main">
      <button
        type="button"
        class="navigation-trigger"
        aria-haspopup="dialog"
        :aria-expanded="navigationDrawerOpen"
        @click="navigationDrawerOpen = true"
      >
        打开项目里程碑
      </button>
      <ContentNavigationDrawer
        :open="navigationDrawerOpen"
        title="项目里程碑"
        @close="navigationDrawerOpen = false"
      >
        <section v-for="milestone in entry.milestones" :key="milestone.id" class="milestone">
          <strong>{{ milestone.title }}</strong>
          <span v-for="task in milestone.tasks" :key="task">{{ task }}</span>
        </section>
      </ContentNavigationDrawer>
      <header class="entry-header">
        <p class="entry-kind">项目实战</p>
        <h1>{{ entry.meta.title }}</h1>
        <p class="entry-summary">{{ entry.meta.summary }}</p>
      </header>
      <details class="compact-panel compact-outline">
        <summary>查看本页大纲</summary>
        <AppOutline :blocks="entry.blocks" />
      </details>
      <details class="compact-panel compact-acceptance">
        <summary>查看验收清单</summary>
        <label v-for="item in entry.acceptance" :key="item" class="acceptance-item">
          <input type="checkbox" disabled />
          <span>{{ item }}</span>
        </label>
        <p class="catalog-note">{{ navigation.collection?.title }}</p>
      </details>
      <slot />
      <nav class="entry-neighbors" aria-label="项目章节前后篇">
        <RouterLink
          v-if="neighbors.previous"
          :to="neighbors.previous.path"
          class="entry-neighbor"
          :aria-label="`上一章：${neighbors.previous.title}`"
        >
          <span class="neighbor-direction">上一章：</span>
          <span>{{ neighbors.previous.title }}</span>
        </RouterLink>
        <RouterLink
          v-if="neighbors.next"
          :to="neighbors.next.path"
          class="entry-neighbor next"
          :aria-label="`下一章：${neighbors.next.title}`"
        >
          <span class="neighbor-direction">下一章：</span>
          <span>{{ neighbors.next.title }}</span>
        </RouterLink>
      </nav>
    </article>

    <aside class="content-context acceptance" aria-label="页面快捷导航">
      <AppOutline :blocks="entry.blocks" />
      <section class="context-details" aria-label="验收清单">
        <p class="context-title">验收清单</p>
        <label v-for="item in entry.acceptance" :key="item" class="acceptance-item">
          <input type="checkbox" disabled />
          <span>{{ item }}</span>
        </label>
        <p class="catalog-note">{{ navigation.collection?.title }}</p>
      </section>
    </aside>
  </div>
</template>

<style scoped src="./content-layout.css"></style>

<style scoped>
.milestone {
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--color-border);
}

.milestone strong,
.milestone span {
  display: block;
}

.milestone span {
  margin-top: var(--space-1);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.35;
}

.acceptance-item {
  display: flex;
  align-items: flex-start;
  margin-top: var(--space-3);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.acceptance-item input {
  flex: 0 0 auto;
  margin-top: 0.3em;
  margin-right: var(--space-2);
}

.context-details .catalog-note,
.compact-panel .catalog-note {
  margin-top: var(--space-4);
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
}
</style>
