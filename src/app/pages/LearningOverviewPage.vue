<script setup lang="ts">
import { computed } from 'vue'
import { learningCatalog } from '@/app/catalog'
import type { DomainId, LearningCategory, LearningTrackStage } from '@/common/catalog'
import { useProgressStore } from '@/common/progress/progress'

const progress = useProgressStore()
const props = defineProps<{ domain: DomainId; technology: string; module: string }>()

/** 当前模块的公开导航信息。 */
const navigation = computed(() =>
  learningCatalog.getNavigation({
    domain: props.domain,
    technology: props.technology,
    module: props.module,
    contentType: 'learn',
  }),
)

/** 当前模块的完整课程规划。 */
const track = computed(() =>
  learningCatalog.getLearningTrack({
    domain: props.domain,
    technology: props.technology,
    module: props.module,
  }),
)

/** 当前模块的本地学习进度。 */
const trackProgress = computed(() =>
  track.value
    ? progress.getTrackProgress(track.value)
    : { completedCount: 0, totalCount: 0, ratio: 0, hasStarted: false },
)

/** 当前课程模块的路线说明。 */
const overviewSummary = computed(
  () => `按基础、中级和高级三个阶段，系统学习 ${navigation.value.module?.title ?? '当前模块'}。`,
)

/** 当前模块的开始、继续或回顾入口。 */
const primaryAction = computed(() => {
  if (!track.value?.entries.length) return undefined
  if (trackProgress.value.continueEntry) {
    return {
      path: trackProgress.value.continueEntry.path,
      label: trackProgress.value.hasStarted ? '继续学习' : '开始学习',
    }
  }
  return { path: track.value.entries[0]!.path, label: '回顾课程' }
})

/** 返回指定阶段在完整路线中的课程数量。 */
function getStageTotal(stage: LearningTrackStage): number {
  return stage.categories.reduce((total, category) => total + category.total, 0)
}

/** 返回指定阶段已经完成的课程数量。 */
function getStageCompletedCount(stage: LearningTrackStage): number {
  return stage.entries.filter((entry) => progress.isCompleted(entry.entryId)).length
}

/** 返回知识类别中的首篇已上线课程。 */
function getCategoryStart(category: LearningCategory) {
  return category.entries.find((entry) => entry.status === 'available' && entry.path)
}
</script>

<template>
  <main class="overview-page learning-overview">
    <header class="overview-header">
      <div class="header-copy">
        <p class="eyebrow">系统学习</p>
        <h1>{{ navigation.module?.title ?? '课程总览' }}</h1>
        <p class="header-summary">{{ overviewSummary }}</p>
      </div>

      <div v-if="track" class="status-panel" aria-label="课程进度">
        <div class="status-main">
          <span class="status-label">学习进度</span>
          <strong>{{ trackProgress.completedCount }} / {{ track.total }}</strong>
          <span class="status-note">已完成</span>
        </div>
        <div
          class="progress-track"
          role="progressbar"
          :aria-valuenow="trackProgress.completedCount"
          aria-valuemin="0"
          :aria-valuemax="track.total"
          :aria-label="`已完成 ${trackProgress.completedCount} 门，共 ${track.total} 门已上线课程`"
        >
          <span :style="{ width: `${trackProgress.ratio * 100}%` }"></span>
        </div>
        <div class="status-footer">
          <span>已上线 {{ track.total }} 门</span>
          <span>完整路线 {{ track.roadmapTotal }} 门</span>
          <RouterLink v-if="primaryAction" class="primary-action" :to="primaryAction.path">
            {{ primaryAction.label }}
            <span aria-hidden="true">→</span>
          </RouterLink>
        </div>
      </div>
    </header>

    <p v-if="!track" class="empty-state" role="status">当前模块尚未登记课程规划。</p>

    <div v-else class="stage-list">
      <section
        v-for="(stage, stageIndex) in track.stages"
        :key="stage.id"
        class="stage-section"
        :aria-labelledby="`stage-${stage.id}`"
      >
        <header class="stage-header">
          <div>
            <p class="stage-index">阶段 {{ String(stageIndex + 1).padStart(2, '0') }}</p>
            <h2 :id="`stage-${stage.id}`">{{ stage.title }}</h2>
            <p v-if="stage.summary">{{ stage.summary }}</p>
          </div>
          <span class="stage-progress">
            {{ getStageCompletedCount(stage) }} / {{ stage.entries.length }} 已完成
            <small>共规划 {{ getStageTotal(stage) }} 门</small>
          </span>
        </header>

        <div v-if="stage.categories.length" class="category-list">
          <article v-for="category in stage.categories" :key="category.id" class="category-item">
            <div class="category-card" :class="{ available: Boolean(getCategoryStart(category)) }">
              <RouterLink
                v-if="getCategoryStart(category)?.path"
                :to="getCategoryStart(category)!.path!"
                class="category-hit-area"
                :aria-label="`开始学习${category.title}`"
              />
              <header class="category-header">
                <span class="availability" :class="{ planned: category.availableCount === 0 }">
                  {{ category.availableCount ? `已上线 ${category.availableCount} 门` : '规划中' }}
                </span>
                <span class="category-total">{{ category.total }} 门课程</span>
              </header>
              <h3>{{ category.title }}</h3>
              <p class="category-summary">{{ category.summary }}</p>

              <ul class="topic-list" aria-label="知识点">
                <li v-for="topic in category.topics" :key="topic">{{ topic }}</li>
              </ul>

              <ul v-if="category.entries.length" class="course-list" aria-label="课程">
                <li v-for="entry in category.entries" :key="entry.entryId">
                  <span v-if="entry.status === 'available'" class="course-link">
                    <span>{{ entry.title }}</span>
                    <small>{{ progress.isCompleted(entry.entryId) ? '已完成' : '已上线' }}</small>
                  </span>
                  <span v-else class="course-planned">
                    <span>{{ entry.title }}</span>
                    <small>规划中</small>
                  </span>
                </li>
              </ul>
              <p v-else class="category-planned-note">课程内容正在规划中</p>
            </div>
          </article>
        </div>

        <p v-else class="stage-planned">该阶段的知识类别正在规划中。</p>
      </section>
    </div>
  </main>
</template>

<style scoped>
.overview-page {
  width: min(var(--content-shell-width), 100%);
  padding: var(--space-6) var(--space-4) var(--space-8);
  margin: 0 auto;
  letter-spacing: 0;
}

.overview-header {
  display: flex;
  align-items: flex-end;
  padding-bottom: var(--space-6);
  border-bottom: 1px solid var(--color-border);
  animation: overview-arrive 480ms var(--ease-spring) both;
}

.header-copy {
  flex: 1 1 34rem;
  min-width: 0;
  margin-right: var(--space-6);
}

.eyebrow,
.stage-index,
.status-label {
  color: var(--color-accent);
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.overview-header h1 {
  margin-top: var(--space-1);
  font-size: 36px;
  font-weight: 650;
  line-height: 1.12;
}

.header-summary {
  max-width: 42rem;
  margin-top: var(--space-2);
  color: var(--color-text-secondary);
  line-height: 1.7;
}

.status-panel {
  flex: 0 1 29rem;
  min-width: 23rem;
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
  box-shadow: var(--shadow-sm);
}

.status-main {
  display: flex;
  align-items: baseline;
}

.status-main strong {
  margin-left: auto;
  font-size: var(--font-size-lg);
  line-height: 1;
}

.status-note {
  margin-left: var(--space-1);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
}

.progress-track {
  height: 6px;
  margin-top: var(--space-3);
  overflow: hidden;
  border-radius: var(--radius-full);
  background: var(--color-bg-sunken);
}

.progress-track span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--color-vue);
  transition: width var(--duration-slow) var(--ease-spring);
}

.status-footer {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-top: var(--space-3);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
}

.status-footer > span {
  margin-right: var(--space-3);
}

.primary-action {
  min-height: 36px;
  display: inline-flex;
  align-items: center;
  margin-left: auto;
  padding: 6px 14px;
  border-radius: var(--radius-full);
  color: var(--color-on-accent);
  font-weight: 600;
  background: var(--color-accent);
  transition:
    transform var(--duration-fast) var(--ease-out),
    background-color var(--duration-fast) var(--ease-out);
}

.primary-action span {
  margin-left: var(--space-1);
}

.primary-action:hover {
  background: var(--color-accent-hover);
  transform: translateY(-1px);
}

.primary-action:active {
  transform: scale(0.98);
  transition-duration: 90ms;
}

.stage-list {
  margin-top: var(--space-7);
}

.stage-section {
  scroll-margin-top: calc(var(--header-height) + var(--space-4));
  animation: stage-arrive 520ms var(--ease-spring) both;
  animation-delay: 100ms;
}

.stage-section + .stage-section {
  margin-top: var(--space-8);
}

.stage-section:nth-child(2) {
  animation-delay: 170ms;
}

.stage-section:nth-child(3) {
  animation-delay: 240ms;
}

.stage-header {
  display: flex;
  align-items: flex-end;
  margin-bottom: var(--space-4);
}

.stage-header > div {
  min-width: 0;
}

.stage-header h2 {
  margin-top: 2px;
  font-size: var(--font-size-xl);
  font-weight: 650;
  line-height: 1.2;
}

.stage-header p:last-child {
  margin-top: var(--space-1);
  color: var(--color-text-secondary);
}

.stage-progress {
  display: flex;
  flex-direction: column;
  flex: 0 0 auto;
  align-items: flex-end;
  margin-left: auto;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.stage-progress small {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
}

.category-list {
  display: flex;
  flex-wrap: wrap;
  margin: calc(var(--space-2) * -1);
}

.category-item {
  width: 25%;
  padding: var(--space-2);
}

.category-card {
  position: relative;
  min-height: 100%;
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
  box-shadow: var(--shadow-sm);
  transition:
    transform var(--duration-base) var(--ease-spring),
    border-color var(--duration-base) var(--ease-out),
    box-shadow var(--duration-base) var(--ease-out);
}

.category-card.available {
  cursor: pointer;
}

.category-hit-area {
  position: absolute;
  inset: 0;
  z-index: 1;
  border-radius: inherit;
}

.category-hit-area:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
}

.category-card.available:hover {
  border-color: var(--color-border-strong);
  box-shadow: var(--shadow-md);
  transform: translateY(-3px) scale(1.005);
}

.category-header {
  display: flex;
  align-items: center;
}

.availability {
  color: var(--color-vue);
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.availability.planned {
  color: var(--color-warning);
}

.category-total {
  margin-left: auto;
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
}

.category-card h3 {
  margin-top: var(--space-3);
  font-size: var(--font-size-lg);
  font-weight: 650;
  line-height: 1.3;
}

.category-summary {
  min-height: 3.2em;
  margin-top: var(--space-2);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.6;
}

.topic-list {
  display: flex;
  flex-wrap: wrap;
  margin-top: var(--space-3);
  margin-right: calc(var(--space-1) * -1);
  margin-bottom: calc(var(--space-1) * -1);
  list-style: none;
}

.topic-list li {
  margin-right: var(--space-1);
  margin-bottom: var(--space-1);
  padding: 3px 8px;
  border-radius: var(--radius-full);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  background: var(--color-bg);
}

.course-list {
  margin-top: var(--space-4);
  padding-top: var(--space-2);
  border-top: 1px solid var(--color-border);
  list-style: none;
}

.course-list li + li {
  border-top: 1px solid var(--color-border);
}

.course-link,
.course-planned {
  min-height: 42px;
  display: flex;
  align-items: center;
  padding: var(--space-2) 0;
  color: var(--color-text);
  font-size: var(--font-size-sm);
}

.course-link span,
.course-planned span {
  min-width: 0;
  overflow-wrap: anywhere;
}

.course-link small,
.course-planned small {
  flex: 0 0 auto;
  margin-left: auto;
  padding-left: var(--space-2);
  color: var(--color-accent);
  font-size: var(--font-size-xs);
}

.course-planned {
  color: var(--color-text-secondary);
}

.course-planned small {
  color: var(--color-warning);
}

.category-planned-note,
.stage-planned,
.empty-state {
  color: var(--color-text-secondary);
}

.category-planned-note {
  margin-top: var(--space-4);
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border);
  font-size: var(--font-size-sm);
}

.stage-planned {
  padding: var(--space-5) 0;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
}

.empty-state {
  padding: var(--space-8) 0;
  text-align: center;
}

@keyframes overview-arrive {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes stage-arrive {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1180px) {
  .overview-header {
    align-items: stretch;
    flex-direction: column;
  }

  .header-copy {
    margin-right: 0;
  }

  .status-panel {
    width: 100%;
    min-width: 0;
    margin-top: var(--space-4);
  }

  .category-item {
    width: 50%;
  }
}

@media (max-width: 640px) {
  .overview-page {
    padding: var(--space-5) var(--space-4) var(--space-7);
  }

  .overview-header h1 {
    font-size: var(--font-size-xl);
  }

  .header-summary {
    font-size: var(--font-size-sm);
  }

  .status-footer {
    align-items: flex-start;
    flex-direction: column;
  }

  .status-footer > span + span {
    margin-top: 2px;
  }

  .primary-action {
    width: 100%;
    justify-content: center;
    margin-top: var(--space-3);
    margin-left: 0;
  }

  .stage-list {
    margin-top: var(--space-6);
  }

  .stage-section + .stage-section {
    margin-top: var(--space-7);
  }

  .stage-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .stage-header h2 {
    font-size: var(--font-size-lg);
  }

  .stage-progress {
    align-items: flex-start;
    margin-top: var(--space-2);
    margin-left: 0;
  }

  .category-list {
    margin: 0;
  }

  .category-item {
    width: 100%;
    padding: 0;
  }

  .category-item + .category-item {
    margin-top: var(--space-3);
  }

  .category-summary {
    min-height: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .overview-header,
  .stage-section {
    animation: overview-fade 120ms var(--ease-out) both;
  }

  .progress-track span,
  .primary-action,
  .category-card {
    transition-property: opacity, color, background-color, border-color, box-shadow;
  }

  .primary-action:hover,
  .primary-action:active,
  .category-card.available:hover {
    transform: none;
  }
}

@keyframes overview-fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (prefers-reduced-transparency: reduce) {
  .status-panel,
  .category-card {
    background: var(--color-bg-elevated);
    box-shadow: none;
  }
}

@media (prefers-contrast: more) {
  .status-panel,
  .category-card,
  .stage-planned {
    border-color: var(--color-border-strong);
  }
}
</style>
