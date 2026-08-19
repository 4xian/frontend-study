<script setup lang="ts">
/* 小节标题块：生成锚点 id 供大纲与 URL hash 定位（需求文档 §3.3 heading 块） */
import { computed } from 'vue'
import { headingId } from '@/common/content'

const props = defineProps<{ content: string; depth?: 2 | 3 }>()

/** 锚点 id */
const id = computed(() => headingId(props.content))
</script>

<template>
  <component
    :is="props.depth === 3 ? 'h3' : 'h2'"
    :id="id"
    class="heading"
    :class="{ 'heading-depth-3': props.depth === 3 }"
  >
    <a class="anchor" :href="`#${id}`" aria-hidden="true">#</a>
    {{ props.content }}
  </component>
</template>

<style scoped>
.heading {
  position: relative;
  margin-top: var(--space-7);
  margin-bottom: var(--space-4);
  font-size: var(--font-size-xl);
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: 0;
  overflow-wrap: anywhere;
  scroll-margin-top: calc(var(--header-height) + var(--space-4));
}

.anchor {
  position: absolute;
  left: -1em;
  opacity: 0;
  color: var(--color-accent);
  transition: opacity var(--duration-fast) var(--ease-out);
}

.heading:hover .anchor {
  opacity: 1;
}

.heading-depth-3 {
  margin-top: var(--space-5);
  margin-bottom: var(--space-3);
  font-size: var(--font-size-lg);
}

@media (max-width: 1250px) {
  .heading {
    scroll-margin-top: calc(var(--header-height) + 58px + var(--space-8));
  }
}
</style>
