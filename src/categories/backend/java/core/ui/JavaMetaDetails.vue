<script setup lang="ts">
import { computed } from 'vue'
import type { ContentMeta, ProjectEvidenceUsage } from '@/common/content'

const props = defineProps<{ meta: ContentMeta }>()

const evidenceUsageLabels: Record<ProjectEvidenceUsage, string> = {
  observed: '项目已使用',
  adapted: '已提炼改写',
  corrected: '已纠正展示',
  rejected: '仅作反例',
}

/** 当前 Java Core 条目是否包含需要在正文区域展示的扩展信息。 */
const visible = computed(
  () =>
    props.meta.domain === 'backend' &&
    props.meta.technology === 'java' &&
    props.meta.module === 'core' &&
    (Boolean(props.meta.modernBaseline) ||
      Boolean(props.meta.legacyBaseline) ||
      Boolean(props.meta.projectEvidence?.length)),
)

/** 按 frontmatter 顺序返回现代版本基线。 */
const modernBaseline = computed(() => Object.entries(props.meta.modernBaseline ?? {}))

/** 按 frontmatter 顺序返回项目兼容版本基线。 */
const legacyBaseline = computed(() => Object.entries(props.meta.legacyBaseline ?? {}))

/** 只展示冻结项目下的仓库相对证据路径。 */
const projectEvidence = computed(() =>
  (props.meta.projectEvidence ?? []).filter(
    (evidence) => evidence.file.startsWith('dzzz-app/') && !evidence.file.includes('..'),
  ),
)

/** 将 baseline 键转换为面向学习者的技术名称。 */
function formatBaselineKey(key: string): string {
  if (key === 'java') return 'Java'
  if (key === 'springBoot') return 'Spring Boot'
  return key
}
</script>

<template>
  <section v-if="visible" class="backend-meta-details" aria-labelledby="backend-meta-details-title">
    <p class="details-eyebrow">课程依据</p>
    <h2 id="backend-meta-details-title">版本与证据</h2>

    <section v-if="modernBaseline.length" class="baseline-section">
      <h3>现代版本基线</h3>
      <dl>
        <div v-for="[key, value] in modernBaseline" :key="key" class="baseline-item">
          <dt>{{ formatBaselineKey(key) }}：</dt>
          <dd>{{ value }}</dd>
        </div>
      </dl>
    </section>

    <section v-if="legacyBaseline.length" class="baseline-section">
      <h3>项目兼容基线</h3>
      <dl>
        <div v-for="[key, value] in legacyBaseline" :key="key" class="baseline-item">
          <dt>{{ formatBaselineKey(key) }}：</dt>
          <dd>{{ value }}</dd>
        </div>
      </dl>
    </section>

    <section v-if="projectEvidence.length" class="backend-project-evidence">
      <h3>项目证据</h3>
      <ul>
        <li v-for="evidence in projectEvidence" :key="`${evidence.file}:${evidence.symbol}`">
          <code>{{ evidence.symbol }}</code>
          <p>{{ evidence.file }}</p>
          <span>{{ evidenceUsageLabels[evidence.usage] }}</span>
        </li>
      </ul>
    </section>
  </section>
</template>

<style scoped>
.backend-meta-details {
  padding: var(--space-6) 0;
  margin-bottom: var(--space-7);
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
}

.details-eyebrow {
  color: var(--color-accent);
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.backend-meta-details > h2 {
  margin-top: var(--space-1);
  font-size: var(--font-size-xl);
}

.backend-meta-details h3 {
  font-size: var(--font-size-base);
}

.baseline-section,
.backend-project-evidence {
  margin-top: var(--space-5);
}

.baseline-section dl,
.backend-project-evidence ul {
  padding: 0;
  margin: var(--space-3) 0 0;
}

.baseline-item {
  display: flex;
  align-items: baseline;
}

.baseline-item + .baseline-item {
  margin-top: var(--space-2);
}

.baseline-item dt {
  flex: 0 0 auto;
  font-weight: 600;
}

.baseline-item dd {
  min-width: 0;
  margin: 0;
  overflow-wrap: anywhere;
  color: var(--color-text-secondary);
}

.backend-project-evidence > ul {
  list-style: none;
}

.backend-project-evidence > ul > li {
  padding: var(--space-4) 0;
  border-top: 1px solid var(--color-border);
}

.backend-project-evidence code {
  overflow-wrap: anywhere;
  font-weight: 600;
}

.backend-project-evidence p {
  margin-top: var(--space-1);
  overflow-wrap: anywhere;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.backend-project-evidence span {
  display: inline-block;
  margin-top: var(--space-2);
  color: var(--color-accent);
  font-size: var(--font-size-xs);
  font-weight: 600;
}
</style>
