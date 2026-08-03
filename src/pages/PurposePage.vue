<script setup lang="ts">
import { computed } from 'vue'
import { learningCatalog } from '@/content/catalog'
import type { CatalogEntryNode, ContentPurpose, LearningTrack } from '@/content/catalog'
import { useProgressStore } from '@/stores/progress'

const props = defineProps<{ purpose: ContentPurpose }>()
const progress = useProgressStore()

const purposeCopy: Record<ContentPurpose, { eyebrow: string; title: string; summary: string }> = {
  learn: {
    eyebrow: '系统学习',
    title: '从基础开始，建立完整理解。',
    summary: '选择技术生态，沿着由浅入深的路径学习概念、语法与工程实践。',
  },
  reference: {
    eyebrow: '技术参考',
    title: '需要答案时，直接到达。',
    summary: '按生态与模块查找 API、规则、示例、版本信息和官方来源。',
  },
  projects: {
    eyebrow: '项目实战',
    title: '把知识，变成真正的成果。',
    summary: '跟随明确的里程碑完成任务，并用验收清单检查每个阶段。',
  },
}

const ecosystemMarks: Record<string, { src?: string; label: string }> = {
  vue: { src: 'https://vuejs.org/logo.svg', label: 'Vue' },
  react: { src: 'https://react.dev/images/brand/logo_light.svg', label: 'React' },
  engineering: { label: 'TS' },
}

/** 当前目的对应的生态导航。 */
const navigation = computed(() => learningCatalog.getNavigation({ purpose: props.purpose }))

/** 当前目的的展示说明。 */
const copy = computed(() => purposeCopy[props.purpose])

/** 返回生态默认核心模块的学习路径。 */
function getLearningTrack(ecosystemId: string): LearningTrack | undefined {
  if (props.purpose !== 'learn') return undefined
  return learningCatalog.getLearningTrack({ ecosystem: ecosystemId, module: 'core' })
}

/** 返回当前生态的推荐起点或最近未完成课程。 */
function getLearningEntry(ecosystemId: string): CatalogEntryNode | undefined {
  const track = getLearningTrack(ecosystemId)
  return track ? progress.getTrackProgress(track).continueEntry : undefined
}

/** 返回生态入口路径，系统学习优先使用本地进度。 */
function getEcosystemPath(ecosystem: { id: string; path: string }): string {
  return getLearningEntry(ecosystem.id)?.path ?? ecosystem.path
}

/** 返回系统学习入口的当前状态文案。 */
function getLearningLabel(ecosystemId: string): string {
  const track = getLearningTrack(ecosystemId)
  if (!track) return '已开放'
  const trackProgress = progress.getTrackProgress(track)
  if (track.total && !trackProgress.continueEntry) return '已完成'
  return trackProgress.hasStarted ? '继续学习' : '推荐起点'
}
</script>

<template>
  <div class="purpose-page">
    <header class="purpose-hero">
      <div class="purpose-hero-inner">
        <p class="eyebrow">{{ copy.eyebrow }}</p>
        <h1>{{ copy.title }}</h1>
        <p class="summary">{{ copy.summary }}</p>
      </div>
    </header>

    <section class="ecosystem-section" aria-labelledby="ecosystem-title">
      <div class="section-inner">
        <header v-reveal class="section-heading">
          <span>技术生态</span>
          <h2 id="ecosystem-title">选择你的学习方向</h2>
        </header>

        <div class="ecosystem-list">
          <template v-for="(ecosystem, index) in navigation.ecosystems" :key="ecosystem.id">
            <RouterLink
              v-if="ecosystem.status === 'available'"
              v-reveal="index * 60"
              :to="getEcosystemPath(ecosystem)"
              class="ecosystem-row available"
            >
              <span class="brand-mark">
                <img
                  v-if="ecosystemMarks[ecosystem.id]?.src"
                  :src="ecosystemMarks[ecosystem.id]?.src"
                  :alt="ecosystemMarks[ecosystem.id]?.label"
                  width="62"
                  height="62"
                />
                <span v-else>{{ ecosystemMarks[ecosystem.id]?.label }}</span>
              </span>
              <span class="ecosystem-body">
                <span class="ecosystem-status">{{ getLearningLabel(ecosystem.id) }}</span>
                <strong>{{ ecosystem.title }}</strong>
                <span>{{ ecosystem.summary }}</span>
              </span>
              <span class="row-action">进入生态 <span aria-hidden="true">→</span></span>
            </RouterLink>

            <article
              v-else
              v-reveal="index * 60"
              class="ecosystem-row planned"
              aria-disabled="true"
            >
              <span class="brand-mark">
                <img
                  v-if="ecosystemMarks[ecosystem.id]?.src"
                  :src="ecosystemMarks[ecosystem.id]?.src"
                  :alt="ecosystemMarks[ecosystem.id]?.label"
                  width="62"
                  height="62"
                />
                <span v-else>{{ ecosystemMarks[ecosystem.id]?.label }}</span>
              </span>
              <span class="ecosystem-body">
                <span class="ecosystem-status">规划中</span>
                <strong>{{ ecosystem.title }}</strong>
                <span>{{ ecosystem.summary }}</span>
              </span>
              <span class="planned-note">即将开放</span>
            </article>
          </template>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.purpose-page {
  width: 100%;
  background: var(--color-bg-elevated);
}

.purpose-hero {
  padding: 104px 0 112px;
  background: var(--color-bg-elevated);
}

.purpose-hero-inner,
.section-inner {
  width: min(var(--page-content-width), calc(100% - 48px));
  margin: 0 auto;
}

.purpose-hero-inner {
  max-width: 920px;
  margin-left: max(24px, calc((100% - var(--page-content-width)) / 2));
}

.eyebrow,
.section-heading span {
  color: var(--color-accent);
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.purpose-hero h1 {
  max-width: 880px;
  margin-top: 16px;
  font-size: 64px;
  font-weight: 700;
  line-height: 1.06;
  letter-spacing: 0;
}

.summary {
  max-width: 760px;
  margin-top: 24px;
  color: var(--color-text-secondary);
  font-size: 22px;
  line-height: 1.55;
}

.ecosystem-section {
  padding: 96px 0 120px;
  background: var(--color-section-soft);
}

.section-heading h2 {
  margin-top: 10px;
  font-size: var(--font-size-title);
  line-height: 1.1;
  letter-spacing: 0;
}

.ecosystem-list {
  margin-top: 56px;
  border-top: 1px solid var(--color-border);
}

.ecosystem-row {
  display: flex;
  align-items: center;
  min-height: 190px;
  padding: 30px 22px;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text);
}

.ecosystem-row.available {
  transition:
    background-color var(--duration-base) var(--ease-out),
    transform 100ms var(--ease-out);
}

.ecosystem-row.available:hover {
  background: var(--color-bg-elevated);
}

.ecosystem-row.available:active {
  transform: scale(0.99);
}

.brand-mark {
  display: flex;
  flex: 0 0 96px;
  align-items: center;
  justify-content: center;
  width: 96px;
  height: 96px;
}

.brand-mark > span {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 58px;
  height: 58px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  font-size: 15px;
  font-weight: 700;
}

.ecosystem-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  margin-left: 30px;
}

.ecosystem-status {
  color: var(--color-text-tertiary);
  font-size: 12px;
  font-weight: 600;
}

.ecosystem-body strong {
  margin-top: 8px;
  font-size: 32px;
  line-height: 1.2;
}

.ecosystem-body > span:last-child {
  max-width: 620px;
  margin-top: 8px;
  color: var(--color-text-secondary);
  line-height: 1.55;
}

.row-action,
.planned-note {
  flex: 0 0 132px;
  margin-left: 32px;
  color: var(--color-accent);
  font-size: 14px;
  font-weight: 600;
  text-align: right;
}

.row-action span {
  display: inline-block;
  margin-left: 4px;
  transition: transform var(--duration-fast) var(--ease-out);
}

.ecosystem-row:hover .row-action span {
  transform: translateX(4px);
}

.ecosystem-row.planned {
  color: var(--color-text-secondary);
}

.ecosystem-row.planned .brand-mark,
.ecosystem-row.planned .ecosystem-body {
  opacity: 0.62;
}

.planned-note {
  color: var(--color-text-tertiary);
}

@media (max-width: 760px) {
  .purpose-hero-inner,
  .section-inner {
    width: min(100% - 32px, var(--page-content-width));
  }

  .purpose-hero-inner {
    margin: 0 auto;
  }

  .purpose-hero {
    padding: 72px 0 80px;
  }

  .purpose-hero h1 {
    margin-top: 12px;
    font-size: 44px;
  }

  .summary {
    margin-top: 18px;
    font-size: 19px;
  }

  .ecosystem-section {
    padding: 72px 0 88px;
  }

  .section-heading h2 {
    font-size: 36px;
  }

  .ecosystem-list {
    margin-top: 36px;
  }

  .ecosystem-row {
    align-items: flex-start;
    min-height: 0;
    padding: 28px 0;
  }

  .brand-mark {
    flex-basis: 64px;
    width: 64px;
    height: 64px;
  }

  .brand-mark img {
    width: 50px;
    height: 50px;
  }

  .brand-mark > span {
    width: 48px;
    height: 48px;
  }

  .ecosystem-body {
    margin-left: 18px;
  }

  .ecosystem-body strong {
    font-size: 26px;
  }

  .row-action,
  .planned-note {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .row-action span {
    transition: none;
  }
}
</style>
