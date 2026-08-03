<script setup lang="ts">
/* 板块首页：知识点总览，按分类列出全部条目（需求文档 §4.1） */
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { docsOf, sections } from '@/content/registry'

const route = useRoute()

/** 当前板块 id */
const section = computed(() => route.params.section as string)

/** 板块目录清单 */
const meta = computed(() => sections[section.value])

/** 按分类分组的知识点（含 docOrder 排序） */
const groups = computed(() => {
  if (!meta.value) return []
  return meta.value.categories.map(([id, name]) => ({
    id,
    name,
    docs: docsOf(section.value, id),
  }))
})
</script>

<template>
  <div v-if="meta" class="section-page">
    <h1 class="title">{{ meta.title }}</h1>
    <section v-for="group in groups" :key="group.id" class="group">
      <h2 class="group-name">{{ group.name }}</h2>
      <div class="doc-list">
        <RouterLink
          v-for="(doc, i) in group.docs"
          :key="doc.id"
          v-reveal="i * 40"
          :to="doc.path"
          class="doc-card"
        >
          <span class="doc-title">{{ doc.title }}</span>
          <span class="doc-summary">{{ doc.summary }}</span>
        </RouterLink>
      </div>
    </section>
  </div>
  <p v-else class="empty">板块不存在</p>
</template>

<style scoped>
.section-page {
  padding-top: var(--space-5);
}

.title {
  font-size: var(--font-size-title);
  font-weight: 700;
  line-height: 1.08;
  letter-spacing: 0;
}

.group {
  margin-top: var(--space-8);
}

.group-name {
  font-size: var(--font-size-lg);
  font-weight: 600;
  line-height: 1.3;
  color: var(--color-text);
}

.doc-list {
  margin-top: var(--space-4);
  border-top: 1px solid var(--color-border);
}

.doc-card {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 76px;
  padding: var(--space-4) var(--space-3);
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text);
  transition:
    background-color var(--duration-base) var(--ease-out),
    opacity 100ms var(--ease-out),
    transform 100ms var(--ease-out);
}

.doc-card:hover {
  background: var(--color-bg-elevated);
}

.doc-card:active {
  opacity: 0.72;
  transform: scale(0.995);
}

.doc-title {
  flex: 0 0 200px;
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text);
}

.doc-summary {
  flex: 1;
  min-width: 0;
  margin-left: var(--space-6);
  font-size: var(--font-size-base);
  line-height: 1.6;
  color: var(--color-text-secondary);
}

.empty {
  color: var(--color-text-secondary);
}

@media (max-width: 620px) {
  .title {
    font-size: 44px;
  }

  .group {
    margin-top: var(--space-7);
  }

  .doc-card {
    align-items: flex-start;
    flex-direction: column;
    padding-right: 0;
    padding-left: 0;
  }

  .doc-title {
    flex-basis: auto;
  }

  .doc-summary {
    margin-top: var(--space-1);
    margin-left: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .doc-card {
    transition:
      background-color var(--duration-fast) linear,
      opacity var(--duration-fast) linear;
  }

  .doc-card:active {
    transform: none;
  }
}
</style>
