<script setup lang="ts">
/* 侧边栏：当前板块知识点树，按 _meta.ts 分类顺序分组，当前项高亮（需求文档 §4.2） */
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { docsOf, sections } from '@/content/registry'
import type { DocMeta } from '@/content/registry'

const route = useRoute()

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

/** 当前板块 id */
const section = computed(() => route.params.section as string)

/** 按 _meta.ts 分类顺序与 docOrder 排序的知识点树 */
const groups = computed(() => {
  const meta = sections[section.value]
  if (!meta) return []
  return meta.categories.map(([id, name]) => ({
    id,
    name,
    docs: docsOf(section.value, id),
  }))
})

/**
 * 判断某知识点是否为当前路由项
 */
function isActive(doc: DocMeta): boolean {
  return route.path === doc.path
}
</script>

<template>
  <div v-if="props.open" class="scrim" @click="emit('close')" />
  <aside class="sidebar" :class="{ open: props.open }">
    <nav class="sidebar-nav">
      <section v-for="group in groups" :key="group.id" class="group">
        <p class="group-name">{{ group.name }}</p>
        <RouterLink
          v-for="doc in group.docs"
          :key="doc.id"
          :to="doc.path"
          class="item"
          :class="{ active: isActive(doc) }"
          :title="doc.summary"
          @click="emit('close')"
        >
          {{ doc.title }}
        </RouterLink>
      </section>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  position: fixed;
  top: var(--header-height);
  bottom: 0;
  left: 0;
  z-index: 90;
  width: var(--sidebar-width);
  overflow-y: auto;
  padding: var(--space-5) var(--space-4);
  border-right: 1px solid var(--color-border);
  background: var(--color-bg);
}

.group {
  margin-bottom: var(--space-5);
}

.group-name {
  padding: 0 var(--space-3);
  margin-bottom: var(--space-2);
  font-size: var(--font-size-xs);
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--color-text-tertiary);
}

.item {
  display: block;
  padding: var(--space-1) var(--space-3);
  margin-bottom: 2px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  transition:
    color var(--duration-fast) var(--ease-out),
    background-color var(--duration-fast) var(--ease-out);
}

.item:hover {
  color: var(--color-text);
  background: var(--color-accent-soft);
}

.item.active {
  color: var(--color-accent);
  background: var(--color-accent-soft);
  font-weight: 500;
}

.scrim {
  display: none;
}

@media (max-width: 900px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform var(--duration-base) var(--ease-spring);
    background: var(--color-bg-elevated);
    box-shadow: var(--shadow-lg);
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .scrim {
    display: block;
    position: fixed;
    inset: var(--header-height) 0 0 0;
    z-index: 85;
    background: var(--color-bg-scrim);
  }
}
</style>
