<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { learningCatalog } from '@/content/catalog'
import type { ReferenceOverviewItem } from '@/content/catalog'

const route = useRoute()
const filterQuery = ref('')

const depthLabels = {
  detail: '核心详解',
  merged: '主题合并',
  quick: '快速参考',
} as const

const sourceTagLabels = {
  public: '公开',
  internal: '内部',
  alpha: 'Alpha',
  deprecated: '已弃用',
} as const

/** 当前模块的公开导航信息。 */
const navigation = computed(() =>
  learningCatalog.getNavigation({
    purpose: 'reference',
    ecosystem: route.params.ecosystem as string,
    module: route.params.module as string,
  }),
)

/** 当前模块的官方参考覆盖总览。 */
const overview = computed(() =>
  learningCatalog.getReferenceOverview({
    ecosystem: route.params.ecosystem as string,
    module: route.params.module as string,
  }),
)

/** 当前页内筛选使用的标准化关键词。 */
const normalizedQuery = computed(() => filterQuery.value.trim().toLocaleLowerCase())

/** 保留原有大分类和小标题结构的筛选结果。 */
const filteredGroups = computed(() =>
  (overview.value?.groups ?? [])
    .map((group) => ({
      ...group,
      sections: group.sections
        .map((section) => ({
          ...section,
          items: section.items.filter(matchesReferenceItem),
        }))
        .filter((section) => section.items.length > 0),
    }))
    .filter((group) => group.sections.length > 0),
)

/** 当前筛选结果中的 API 数量。 */
const resultCount = computed(() =>
  filteredGroups.value.reduce(
    (total, group) =>
      total +
      group.sections.reduce((sectionTotal, section) => sectionTotal + section.items.length, 0),
    0,
  ),
)

/** 判断参考条目的名称、别名或来源标签是否命中当前关键词。 */
function matchesReferenceItem(item: ReferenceOverviewItem): boolean {
  if (!normalizedQuery.value) return true
  return [
    item.name,
    item.sourceTag ?? '',
    sourceTagLabels[item.sourceTag ?? 'public'],
    ...(item.aliases ?? []),
  ].some((value) => value.toLocaleLowerCase().includes(normalizedQuery.value))
}

/** 清除页内筛选关键词并恢复完整索引。 */
function clearFilter(): void {
  filterQuery.value = ''
}
</script>

<template>
  <main class="overview-page reference-overview">
    <header class="overview-header">
      <div class="header-copy">
        <p class="eyebrow">技术参考</p>
        <h1>{{ navigation.module?.title ?? 'API 总览' }}</h1>
        <p class="header-summary">Vue 官方 API 的站内覆盖索引。</p>
      </div>

      <dl v-if="overview" class="coverage-status" aria-label="官方参考覆盖状态">
        <div>
          <dt>覆盖数量</dt>
          <dd>{{ overview.availableCount }} / {{ overview.total }}</dd>
        </div>
        <div>
          <dt>适用版本</dt>
          <dd>{{ overview.appliesTo }}</dd>
        </div>
        <div>
          <dt>核验日期</dt>
          <dd>{{ overview.verifiedAt }}</dd>
        </div>
      </dl>
    </header>

    <p v-if="!overview" class="empty-state" role="status">当前模块尚未登记官方参考索引。</p>

    <template v-else>
      <section class="filter-section" aria-label="筛选 API">
        <div class="filter-control">
          <span class="search-icon" aria-hidden="true"></span>
          <input
            v-model="filterQuery"
            type="search"
            autocomplete="off"
            aria-label="按 API 名称或别名筛选"
            placeholder="筛选 API 名称或别名"
          />
          <button
            v-if="filterQuery"
            class="clear-button"
            type="button"
            title="清除筛选"
            aria-label="清除筛选"
            @click="clearFilter"
          >
            ×
          </button>
        </div>
        <p class="result-status" role="status" aria-live="polite">
          {{ normalizedQuery ? `找到 ${resultCount} 项` : `共 ${overview.total} 项` }}
        </p>
      </section>

      <nav v-if="filteredGroups.length" class="group-navigation" aria-label="API 大分类">
        <a v-for="group in filteredGroups" :key="group.id" :href="`#api-group-${group.id}`">
          {{ group.title }}
        </a>
      </nav>

      <div v-if="filteredGroups.length" class="reference-groups">
        <section
          v-for="group in filteredGroups"
          :id="`api-group-${group.id}`"
          :key="group.id"
          class="reference-group"
          :aria-labelledby="`api-group-title-${group.id}`"
        >
          <header class="group-header">
            <h2 :id="`api-group-title-${group.id}`">{{ group.title }}</h2>
            <span>
              {{ group.sections.reduce((total, section) => total + section.items.length, 0) }}
              项
            </span>
          </header>

          <section
            v-for="section in group.sections"
            :key="section.id"
            class="reference-section"
            :aria-labelledby="`api-section-${group.id}-${section.id}`"
          >
            <h3 :id="`api-section-${group.id}-${section.id}`">{{ section.title }}</h3>
            <ul class="api-list">
              <li v-for="item in section.items" :key="item.id" class="api-item">
                <RouterLink
                  v-if="item.status === 'available' && item.path"
                  class="api-link"
                  :to="item.path"
                >
                  <span class="api-name">{{ item.name }}</span>
                  <small
                    v-if="item.sourceTag && item.sourceTag !== 'public'"
                    class="api-source-tag"
                  >
                    {{ sourceTagLabels[item.sourceTag] }}
                  </small>
                  <span class="api-depth">{{ depthLabels[item.depth] }}</span>
                </RouterLink>
                <div v-else class="api-planned" aria-disabled="true">
                  <span class="api-name">{{ item.name }}</span>
                  <small
                    v-if="item.sourceTag && item.sourceTag !== 'public'"
                    class="api-source-tag"
                  >
                    {{ sourceTagLabels[item.sourceTag] }}
                  </small>
                  <span class="api-depth">规划中</span>
                </div>
                <small v-if="item.aliases?.length" class="api-aliases">
                  别名：{{ item.aliases.join('、') }}
                </small>
              </li>
            </ul>
          </section>
        </section>
      </div>

      <p v-else class="no-results" role="status">没有匹配的 API。</p>
    </template>
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
  padding-bottom: var(--space-5);
  border-bottom: 1px solid var(--color-border);
  animation: overview-arrive 480ms var(--ease-spring) both;
}

.header-copy {
  flex: 1 1 30rem;
  min-width: 0;
  margin-right: var(--space-6);
}

.eyebrow {
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

.coverage-status {
  display: flex;
  flex: 0 0 auto;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
  box-shadow: var(--shadow-sm);
}

.coverage-status div {
  min-width: 8.25rem;
}

.coverage-status div + div {
  margin-left: var(--space-5);
}

.coverage-status dt {
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
}

.coverage-status dd {
  margin-top: 2px;
  font-size: var(--font-size-md);
  font-weight: 650;
  line-height: 1.25;
}

.filter-section {
  display: flex;
  align-items: center;
  margin-top: var(--space-5);
  animation: filter-arrive 480ms 60ms var(--ease-spring) both;
}

.filter-control {
  width: min(34rem, 100%);
  height: 42px;
  display: flex;
  align-items: center;
  padding: 0 var(--space-2) 0 var(--space-3);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
  box-shadow: var(--shadow-sm);
  transition:
    border-color var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out);
}

.filter-control:focus-within {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-soft);
}

.search-icon {
  width: 14px;
  height: 14px;
  flex: 0 0 14px;
  position: relative;
  margin-right: var(--space-2);
  border: 1.5px solid var(--color-text-secondary);
  border-radius: 50%;
}

.search-icon::after {
  width: 6px;
  height: 1.5px;
  position: absolute;
  right: -4px;
  bottom: -2px;
  border-radius: 1px;
  background: var(--color-text-secondary);
  content: '';
  transform: rotate(45deg);
  transform-origin: left center;
}

.filter-control input {
  width: 100%;
  min-width: 0;
  height: 100%;
  border: 0;
  outline: 0;
  color: var(--color-text);
  font: inherit;
  letter-spacing: 0;
  background: transparent;
  appearance: none;
}

.filter-control input::-webkit-search-cancel-button {
  display: none;
}

.filter-control input::placeholder {
  color: var(--color-text-tertiary);
  opacity: 1;
}

.clear-button {
  width: 30px;
  height: 30px;
  display: inline-flex;
  flex: 0 0 30px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: var(--color-text-secondary);
  font-size: 20px;
  line-height: 1;
  transition:
    color var(--duration-fast) var(--ease-out),
    background-color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.clear-button:hover {
  color: var(--color-text);
  background: var(--color-bg-sunken);
}

.clear-button:active {
  transform: scale(0.92);
  transition-duration: 90ms;
}

.result-status {
  margin-left: var(--space-3);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.group-navigation {
  display: flex;
  flex-wrap: wrap;
  margin-top: var(--space-4);
  margin-right: calc(var(--space-2) * -1);
  margin-bottom: calc(var(--space-2) * -1);
  animation: filter-arrive 480ms 100ms var(--ease-spring) both;
}

.group-navigation a {
  min-height: 36px;
  display: inline-flex;
  align-items: center;
  margin-right: var(--space-2);
  margin-bottom: var(--space-2);
  padding: 6px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  background: var(--color-bg-elevated);
  transition:
    color var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out),
    background-color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.group-navigation a:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
  background: var(--color-accent-soft);
  transform: translateY(-1px);
}

.group-navigation a:active {
  transform: scale(0.98);
  transition-duration: 90ms;
}

.reference-groups {
  margin-top: var(--space-7);
}

.reference-group {
  scroll-margin-top: calc(var(--header-height) + var(--space-4));
  animation: group-arrive 520ms var(--ease-spring) both;
  animation-delay: 120ms;
}

.reference-group + .reference-group {
  margin-top: var(--space-8);
}

.reference-group:nth-child(2) {
  animation-delay: 170ms;
}

.reference-group:nth-child(3) {
  animation-delay: 220ms;
}

.reference-group:nth-child(n + 4) {
  animation-delay: 270ms;
}

.group-header {
  display: flex;
  align-items: baseline;
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--color-border-strong);
}

.group-header h2 {
  font-size: var(--font-size-xl);
  font-weight: 650;
  line-height: 1.2;
}

.group-header span {
  margin-left: auto;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.reference-section {
  margin-top: var(--space-5);
}

.reference-section h3 {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: 650;
}

.api-list {
  display: flex;
  flex-wrap: wrap;
  margin-top: var(--space-2);
  margin-right: calc(var(--space-2) * -1);
  margin-bottom: calc(var(--space-2) * -1);
  margin-left: calc(var(--space-2) * -1);
  list-style: none;
}

.api-item {
  width: 33.3333%;
  min-width: 0;
  padding: var(--space-2);
  border-bottom: 1px solid var(--color-border);
}

.api-link,
.api-planned {
  min-height: 28px;
  display: flex;
  align-items: center;
}

.api-link {
  color: var(--color-text);
  transition:
    color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.api-link:hover {
  color: var(--color-accent);
  transform: translateX(2px);
}

.api-link:active {
  transform: scale(0.98);
  transition-duration: 90ms;
}

.api-planned {
  color: var(--color-text-secondary);
}

.api-name {
  min-width: 0;
  overflow-wrap: anywhere;
  font-weight: 550;
}

.api-depth {
  flex: 0 0 auto;
  margin-left: auto;
  padding-left: var(--space-2);
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
}

.api-source-tag {
  flex: 0 0 auto;
  margin-left: var(--space-2);
  padding: 2px 5px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  font-size: 10px;
  line-height: 1.2;
}

.api-link .api-depth {
  color: var(--color-accent);
}

.api-planned .api-depth {
  color: var(--color-warning);
}

.api-aliases {
  display: block;
  margin-top: 1px;
  overflow-wrap: anywhere;
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
}

.empty-state,
.no-results {
  padding: var(--space-8) 0;
  color: var(--color-text-secondary);
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

@keyframes filter-arrive {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes group-arrive {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1120px) {
  .overview-header {
    align-items: stretch;
    flex-direction: column;
  }

  .header-copy {
    margin-right: 0;
  }

  .coverage-status {
    width: 100%;
    margin-top: var(--space-4);
  }

  .coverage-status div {
    flex: 1 1 0;
    min-width: 0;
  }

  .api-item {
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

  .coverage-status {
    align-items: flex-start;
    flex-direction: column;
  }

  .coverage-status div + div {
    margin-top: var(--space-3);
    margin-left: 0;
  }

  .filter-section {
    align-items: flex-start;
    flex-direction: column;
  }

  .filter-control {
    width: 100%;
  }

  .result-status {
    margin-top: var(--space-2);
    margin-left: 0;
  }

  .reference-groups {
    margin-top: var(--space-6);
  }

  .reference-group + .reference-group {
    margin-top: var(--space-7);
  }

  .group-header h2 {
    font-size: var(--font-size-lg);
  }

  .api-list {
    margin-right: 0;
    margin-left: 0;
  }

  .api-item {
    width: 100%;
    padding-right: 0;
    padding-left: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .overview-header,
  .filter-section,
  .group-navigation,
  .reference-group {
    animation: overview-fade 120ms var(--ease-out) both;
  }

  .clear-button,
  .group-navigation a,
  .api-link {
    transition-property: opacity, color, background-color, border-color;
  }

  .clear-button:active,
  .group-navigation a:hover,
  .group-navigation a:active,
  .api-link:hover,
  .api-link:active {
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
  .coverage-status,
  .filter-control,
  .group-navigation a {
    background: var(--color-bg-elevated);
    box-shadow: none;
  }
}

@media (prefers-contrast: more) {
  .coverage-status,
  .filter-control,
  .group-navigation a,
  .api-item {
    border-color: var(--color-border-strong);
  }
}
</style>
