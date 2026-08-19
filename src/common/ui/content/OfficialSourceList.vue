<script setup lang="ts">
import type { ContentSource, ContentSourceOrigin, ContentSourceType } from '@/common/content'

defineProps<{
  sources: ContentSource[]
}>()

const sourceTypeLabels: Record<ContentSourceType, string> = {
  specification: '规范',
  'api-doc': 'API 文档',
  'official-reference': '官方参考',
  'release-note': '发布说明',
  'source-code': '官方源码',
  'official-test': '官方测试',
  'security-standard': '安全标准',
  'static-analysis': '静态分析',
  'engineering-reference': '工程参考',
  'project-source': '项目源码',
}

const sourceOriginLabels: Record<ContentSourceOrigin, string> = {
  official: '官方资料',
  community: '社区补充',
}

/** 组合来源归属与资料类型，未声明的旧来源仍保持原有展示。 */
function getSourceLabel(source: ContentSource): string | undefined {
  const labels = [
    source.sourceOrigin ? sourceOriginLabels[source.sourceOrigin] : undefined,
    source.sourceType ? sourceTypeLabels[source.sourceType] : undefined,
  ].filter((label): label is string => Boolean(label))
  return labels.length > 0 ? labels.join(' · ') : undefined
}
</script>

<template>
  <ol class="official-source-list">
    <li v-for="source in sources" :key="source.id ?? source.url" class="official-source-item">
      <a :href="source.url" target="_blank" rel="noreferrer">{{ source.title }}</a>
      <p v-if="getSourceLabel(source) || source.appliesTo" class="official-source-context">
        <span v-if="getSourceLabel(source)">{{ getSourceLabel(source) }}</span>
        <span v-if="source.appliesTo">适用于 {{ source.appliesTo }}</span>
      </p>
      <ul v-if="source.claims?.length" class="official-source-claims">
        <li v-for="claim in source.claims" :key="claim">{{ claim }}</li>
      </ul>
    </li>
  </ol>
</template>

<style scoped>
.official-source-list {
  padding: 0;
  margin: 0;
  list-style: none;
}

.official-source-item {
  padding: var(--space-3) 0;
  border-top: 1px solid var(--color-border);
}

.official-source-item:first-child {
  border-top: 0;
}

.official-source-item a {
  display: block;
  overflow-wrap: anywhere;
  color: var(--color-accent);
  font-size: var(--font-size-sm);
  font-weight: 600;
  line-height: 1.4;
}

.official-source-context {
  margin-top: var(--space-1);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  line-height: 1.45;
}

.official-source-context span {
  display: block;
}

.official-source-context span + span {
  margin-top: 2px;
}

.official-source-claims {
  padding-left: var(--space-4);
  margin-top: var(--space-2);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  line-height: 1.5;
}

.official-source-claims li + li {
  margin-top: var(--space-1);
}
</style>
