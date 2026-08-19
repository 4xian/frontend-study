<script setup lang="ts">
/* 右侧大纲：提取 heading 块，点击平滑跳转，滚动高亮当前小节（实施计划 2.7） */
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { headingId } from '@/common/content'

interface OutlineBlock {
  type: string
  content?: string
  depth?: 2 | 3
}

const props = defineProps<{ blocks: OutlineBlock[] }>()

/** 大纲条目：标题文字 + 锚点 id */
const items = computed(() =>
  props.blocks
    .filter(
      (block): block is OutlineBlock & { type: 'heading'; content: string } =>
        block.type === 'heading' && typeof block.content === 'string',
    )
    .map((b) => ({ text: b.content, id: headingId(b.content), depth: b.depth ?? 2 })),
)

/** 当前高亮的锚点 id */
const activeId = ref('')

let observer: IntersectionObserver | null = null

/**
 * 重建 IntersectionObserver，观察全部 heading 元素
 */
function observe(): void {
  observer?.disconnect()
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) activeId.value = entry.target.id
      }
    },
    { rootMargin: '-60px 0px -70% 0px' },
  )
  for (const item of items.value) {
    const el = document.getElementById(item.id)
    if (el) observer.observe(el)
  }
}

// heading 列表变化时（路由切换后 DOM 更新）重新观察
watch(items, () => setTimeout(observe), { flush: 'post' })

onMounted(() => setTimeout(observe))
onUnmounted(() => observer?.disconnect())
</script>

<template>
  <nav v-if="items.length" class="outline" aria-label="页面大纲">
    <p class="outline-title">本页内容</p>
    <a
      v-for="item in items"
      :key="item.id"
      :href="`#${item.id}`"
      class="outline-item"
      :class="{
        active: activeId === item.id,
        'outline-item-depth-2': item.depth === 2,
        'outline-item-depth-3': item.depth === 3,
      }"
    >
      {{ item.text }}
    </a>
  </nav>
</template>

<style scoped>
.outline {
  position: sticky;
  top: calc(var(--header-height) + var(--space-5));
  display: flex;
  flex-direction: column;
  padding-left: var(--space-4);
  border-left: 1px solid var(--color-border);
}

.outline-title {
  margin-bottom: var(--space-2);
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-text-tertiary);
}

.outline-item {
  padding: var(--space-1) 0;
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color var(--duration-fast) var(--ease-out);
}

.outline-item-depth-2 {
  font-weight: 700;
  color: var(--color-text);
}

.outline-item-depth-3 {
  padding-left: var(--space-4);
  font-size: var(--font-size-xs);
  font-weight: 400;
}

.outline-item:hover {
  color: var(--color-text);
}

.outline-item.active {
  color: var(--color-accent);
}
</style>
