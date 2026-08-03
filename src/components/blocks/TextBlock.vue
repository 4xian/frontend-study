<script setup lang="ts">
/* 正文段落块：支持 `code` 反引号片段渲染为行内代码（需求文档 §3.3 text 块） */
import { computed } from 'vue'

const props = defineProps<{ content: string }>()

/** 按反引号切分为文字 / 行内代码片段（奇数下标为代码） */
const parts = computed(() => props.content.split('`'))
</script>

<template>
  <p class="text">
    <template v-for="(part, i) in parts" :key="i">
      <code v-if="i % 2 === 1" class="inline-code">{{ part }}</code>
      <template v-else>{{ part }}</template>
    </template>
  </p>
</template>

<style scoped>
.text {
  margin: var(--space-3) 0;
  line-height: 1.8;
}

.inline-code {
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  background: var(--color-accent-soft);
  color: var(--color-accent);
  font-size: 0.9em;
}
</style>
