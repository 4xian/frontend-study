<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { learningCatalog } from '@/app/catalog'
import type {
  CatalogNode,
  DomainId,
  LearningCategory,
  LearningRoadmapEntry,
} from '@/common/catalog'

interface KnowledgeCard {
  id: string
  title: string
  summary: string
  topics: string[]
  path: string
  stageTitle: string
  availableCount: number
  total: number
}

interface ModuleShelf extends CatalogNode {
  shelfKey: string
  cards: KnowledgeCard[]
}

interface TechnologyShelf extends CatalogNode {
  modules: ModuleShelf[]
}

interface DomainSection extends CatalogNode {
  kicker: string
  title: string
  technologies: TechnologyShelf[]
}

interface ShelfState {
  canBack: boolean
  canForward: boolean
}

const domainHeadings: Record<DomainId, { kicker: string; title: string }> = {
  frontend: { kicker: 'FRONTEND', title: '前端领域' },
  backend: { kicker: 'BACKEND', title: '后端领域' },
  network: { kicker: 'NETWORK', title: '网络领域' },
}

const shelfElements = new Map<string, HTMLElement>()
const shelfStates = ref<Record<string, ShelfState>>({})

/** 返回知识类别中首篇已经上线的课程。 */
function getCategoryStart(category: LearningCategory): LearningRoadmapEntry | undefined {
  return category.entries.find((entry) => entry.status === 'available' && entry.path)
}

/** 将指定模块的学习类别整理为横向卡片。 */
function getKnowledgeCards(
  domain: DomainId,
  technology: CatalogNode,
  module: CatalogNode,
): KnowledgeCard[] {
  const track = learningCatalog.getLearningTrack({
    domain,
    technology: technology.id,
    module: module.id,
  })
  if (!track) return []
  return track.stages.flatMap((stage) =>
    stage.categories.flatMap((category) => {
      const start = getCategoryStart(category)
      if (!start?.path) return []
      return [
        {
          id: `${domain}.${technology.id}.${module.id}.${stage.id}.${category.id}`,
          title: category.title,
          summary: category.summary,
          topics: category.topics,
          path: start.path,
          stageTitle: stage.title,
          availableCount: category.availableCount,
          total: category.total,
        },
      ]
    }),
  )
}

/** 从 Catalog 生成首页的领域、技术和知识类别货架。 */
const sections = computed<DomainSection[]>(() =>
  learningCatalog.getNavigation().domains.map((domain) => {
    const domainId = domain.id as DomainId
    const technologies = learningCatalog
      .getNavigation({ domain: domainId })
      .technologies.map<TechnologyShelf>((technology) => {
        const modules = learningCatalog
          .getNavigation({
            domain: domainId,
            technology: technology.id,
          })
          .modules.map<ModuleShelf>((module) => ({
            ...module,
            shelfKey: `${domainId}.${technology.id}.${module.id}`,
            cards: getKnowledgeCards(domainId, technology, module),
          }))
          .filter((module) => module.cards.length > 0)
        return { ...technology, modules }
      })
      .filter((technology) => technology.modules.length > 0)
    return {
      ...domain,
      ...domainHeadings[domainId],
      technologies,
    }
  }),
)

/** 保存每个横向货架的 DOM 引用。 */
function registerShelf(key: string, element: unknown): void {
  if (element instanceof HTMLElement) {
    shelfElements.set(key, element)
  } else {
    shelfElements.delete(key)
  }
}

/** 根据滚动位置更新货架两端箭头的可用状态。 */
function updateShelfState(key: string): void {
  const element = shelfElements.get(key)
  if (!element) return
  const maxScrollLeft = element.scrollWidth - element.clientWidth
  shelfStates.value = {
    ...shelfStates.value,
    [key]: {
      canBack: element.scrollLeft > 2,
      canForward: maxScrollLeft - element.scrollLeft > 2,
    },
  }
}

/** 在窗口尺寸变化后重新计算所有货架的边界状态。 */
function updateAllShelfStates(): void {
  for (const key of shelfElements.keys()) updateShelfState(key)
}

/** 将当前货架按一张卡片的宽度平滑移动。 */
function scrollShelf(key: string, direction: number): void {
  const element = shelfElements.get(key)
  if (!element) return
  const card = element.querySelector<HTMLElement>('.knowledge-card')
  const step = (card?.getBoundingClientRect().width ?? element.clientWidth * 0.82) + 20
  element.scrollBy({ left: direction * step, behavior: 'smooth' })
}

onMounted(() => {
  updateAllShelfStates()
  window.addEventListener('resize', updateAllShelfStates)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateAllShelfStates)
})
</script>

<template>
  <main class="technology-center">
    <section
      v-for="(section, sectionIndex) in sections"
      :key="section.id"
      v-reveal="sectionIndex * 70"
      class="domain-section"
      :aria-labelledby="`domain-${section.id}`"
    >
      <header class="domain-header">
        <p class="domain-kicker">{{ section.kicker }} · 0{{ sectionIndex + 1 }}</p>
        <component
          :is="sectionIndex === 0 ? 'h1' : 'h2'"
          :id="`domain-${section.id}`"
          class="domain-title"
        >
          {{ section.title }}
        </component>
        <p class="domain-summary">{{ section.summary }}</p>
      </header>

      <div v-if="section.technologies.length" class="technology-shelves">
        <section
          v-for="(technology, technologyIndex) in section.technologies"
          :key="technology.id"
          v-reveal="sectionIndex * 70 + technologyIndex * 50"
          class="technology-track"
          :aria-labelledby="`technology-${section.id}-${technology.id}`"
        >
          <header class="technology-header">
            <h3 :id="`technology-${section.id}-${technology.id}`">{{ technology.title }}</h3>
            <p>{{ technology.summary }}</p>
          </header>

          <div class="module-shelves">
            <section
              v-for="(module, moduleIndex) in technology.modules"
              :key="module.id"
              v-reveal="sectionIndex * 70 + technologyIndex * 50 + moduleIndex * 40"
              class="module-track"
              :aria-labelledby="`module-${section.id}-${technology.id}-${module.id}`"
            >
              <header class="module-header">
                <div>
                  <h4 :id="`module-${section.id}-${technology.id}-${module.id}`">
                    {{ module.title }}
                  </h4>
                  <p>{{ module.summary }}</p>
                </div>
                <RouterLink class="module-overview-link" :to="module.path">
                  查看总览
                  <span aria-hidden="true">↗</span>
                </RouterLink>
              </header>

              <div class="knowledge-shelf">
                <button
                  class="shelf-control shelf-control-back"
                  type="button"
                  :disabled="!shelfStates[module.shelfKey]?.canBack"
                  :aria-label="`向左查看${module.title}知识分类`"
                  @click="scrollShelf(module.shelfKey, -1)"
                >
                  <span aria-hidden="true">‹</span>
                </button>
                <div
                  :ref="(element) => registerShelf(module.shelfKey, element)"
                  class="knowledge-shelf-track"
                  :aria-label="`${module.title}知识分类`"
                  @scroll="updateShelfState(module.shelfKey)"
                >
                  <RouterLink
                    v-for="(card, cardIndex) in module.cards"
                    :key="card.id"
                    :to="card.path"
                    class="knowledge-card"
                  >
                    <header class="knowledge-card-header">
                      <span class="knowledge-card-label">{{ card.stageTitle }}</span>
                      <span class="knowledge-card-arrow" aria-hidden="true">↗</span>
                    </header>
                    <h5>{{ card.title }}</h5>
                    <p class="knowledge-card-summary">{{ card.summary }}</p>
                    <ul v-if="card.topics.length" class="topic-list" aria-label="核心知识点">
                      <li v-for="topic in card.topics.slice(0, 4)" :key="topic">{{ topic }}</li>
                    </ul>
                    <div class="knowledge-card-art" aria-hidden="true">
                      <span class="knowledge-card-number">{{
                        String(cardIndex + 1).padStart(2, '0')
                      }}</span>
                      <span class="knowledge-card-mark">{{ module.title.slice(0, 2) }}</span>
                    </div>
                    <footer class="knowledge-card-footer">
                      <span>{{ card.availableCount }} / {{ card.total }} 门已上线</span>
                      <span>开始学习</span>
                    </footer>
                  </RouterLink>
                </div>
                <button
                  class="shelf-control shelf-control-forward"
                  type="button"
                  :disabled="!shelfStates[module.shelfKey]?.canForward"
                  :aria-label="`向右查看${module.title}知识分类`"
                  @click="scrollShelf(module.shelfKey, 1)"
                >
                  <span aria-hidden="true">›</span>
                </button>
              </div>
            </section>
          </div>
        </section>
      </div>
      <p v-else class="empty-domain">当前领域尚无已开放的知识内容。</p>
    </section>
  </main>
</template>

<style scoped>
.technology-center {
  width: min(var(--content-shell-width), 100%);
  padding: 72px var(--space-4) 96px;
  margin: 0 auto;
}

.domain-section + .domain-section {
  margin-top: 96px;
}

.domain-header {
  max-width: 820px;
  padding-bottom: 30px;
  margin: 0 auto;
  text-align: center;
}

.domain-kicker {
  color: var(--color-accent);
  font-size: var(--font-size-xs);
  font-weight: 700;
}

.domain-title {
  margin-top: 10px;
  font-size: 56px;
  line-height: 1.08;
  font-weight: 700;
}

.domain-summary {
  max-width: 680px;
  margin-top: 16px;
  margin-right: auto;
  margin-left: auto;
  color: var(--color-text-secondary);
  font-size: var(--font-size-lg);
  line-height: 1.55;
}

.technology-track + .technology-track {
  margin-top: 64px;
}

.technology-header {
  max-width: 680px;
  margin: 0 auto;
  padding: 0 2px;
  text-align: center;
}

.technology-header h3 {
  font-size: 30px;
  line-height: 1.2;
}

.technology-header p {
  max-width: 620px;
  margin-right: auto;
  margin-left: auto;
  margin-top: 8px;
  color: var(--color-text-secondary);
}

.module-shelves {
  margin-top: 34px;
}

.module-track + .module-track {
  margin-top: 52px;
}

.module-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 0 2px;
}

.module-header h4 {
  font-size: 22px;
  line-height: 1.25;
}

.module-header p {
  max-width: 620px;
  margin-top: 6px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.module-overview-link {
  flex: 0 0 auto;
  margin-left: var(--space-4);
  color: var(--color-accent);
  font-size: var(--font-size-sm);
  white-space: nowrap;
}

.module-overview-link span {
  display: inline-block;
  margin-left: 4px;
  transition: transform 350ms var(--ease-spring);
}

.module-overview-link:hover,
.module-overview-link:focus-visible {
  color: var(--color-accent);
}

.module-overview-link:hover span,
.module-overview-link:focus-visible span {
  transform: translate(3px, -3px);
}

.knowledge-shelf {
  position: relative;
  margin-top: 6px;
}

.knowledge-shelf-track {
  display: flex;
  overflow-x: auto;
  padding: 16px 2px 28px;
  scroll-behavior: smooth;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  overscroll-behavior-x: contain;
}

.knowledge-shelf-track::-webkit-scrollbar {
  display: none;
}

.knowledge-card {
  --card-accent: #0071e3;
  --card-accent-soft: color-mix(in srgb, var(--card-accent) 9%, var(--color-bg-elevated));

  position: relative;
  display: flex;
  width: 360px;
  height: 430px;
  flex: 0 0 360px;
  flex-direction: column;
  padding: 26px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--card-accent) 16%, var(--color-border));
  border-radius: var(--radius-lg);
  background: var(--color-bg-elevated);
  color: var(--color-text);
  box-shadow: var(--shadow-md);
  scroll-snap-align: start;
  transition:
    transform 420ms var(--ease-spring),
    box-shadow 420ms var(--ease-spring),
    border-color 240ms var(--ease-out);
}

.knowledge-card + .knowledge-card {
  margin-left: 20px;
}

.knowledge-card:nth-child(4n + 2) {
  --card-accent: #007d68;
}

.knowledge-card:nth-child(4n + 3) {
  --card-accent: #b8324f;
}

.knowledge-card:nth-child(4n + 4) {
  --card-accent: #5350b8;
}

.knowledge-card:hover,
.knowledge-card:focus-visible {
  border-color: color-mix(in srgb, var(--card-accent) 38%, var(--color-border));
  box-shadow: var(--shadow-lg);
  transform: translateY(-5px);
}

.knowledge-card:active {
  transform: translateY(-1px) scale(0.985);
  transition-duration: 100ms;
}

.knowledge-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.knowledge-card-label {
  color: var(--card-accent);
  font-size: var(--font-size-xs);
  font-weight: 700;
  letter-spacing: 0;
}

.knowledge-card-arrow {
  display: inline-flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--card-accent-soft);
  color: var(--card-accent);
  font-size: 20px;
  line-height: 1;
  transition: transform 350ms var(--ease-spring);
}

.knowledge-card:hover .knowledge-card-arrow,
.knowledge-card:focus-visible .knowledge-card-arrow {
  transform: translate(2px, -2px);
}

.knowledge-card h5 {
  max-width: 290px;
  margin-top: 22px;
  font-size: 30px;
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: 0;
  text-wrap: balance;
}

.knowledge-card-summary {
  max-width: 290px;
  margin-top: 12px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
  line-height: 1.6;
}

.topic-list {
  display: flex;
  flex-direction: column;
  padding: 0;
  margin: 22px 0 0;
  list-style: none;
}

.topic-list li {
  position: relative;
  padding-left: 16px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.45;
}

.topic-list li + li {
  margin-top: 7px;
}

.topic-list li::before {
  position: absolute;
  top: 0.65em;
  left: 0;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--card-accent);
  content: '';
}

.knowledge-card-art {
  position: absolute;
  right: 26px;
  bottom: 55px;
  left: 26px;
  height: 100px;
  overflow: hidden;
  border-radius: 12px;
  background: var(--card-accent-soft);
}

.knowledge-card-number {
  position: absolute;
  top: 7px;
  left: -5px;
  color: var(--card-accent);
  font-size: 92px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0;
  opacity: 0.13;
}

.knowledge-card-mark {
  position: absolute;
  right: 4px;
  bottom: 5px;
  display: inline-flex;
  width: 56px;
  height: 56px;
  align-items: center;
  justify-content: center;
  border: 1px solid color-mix(in srgb, var(--card-accent) 26%, var(--color-border));
  border-radius: 16px;
  background: color-mix(in srgb, var(--card-accent) 12%, var(--color-bg-elevated));
  color: var(--card-accent);
  font-size: var(--font-size-lg);
  font-weight: 700;
  letter-spacing: 0;
}

.knowledge-card-footer {
  position: absolute;
  right: 26px;
  bottom: 24px;
  left: 26px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
}

.knowledge-card-footer span:last-child {
  color: var(--card-accent);
  font-weight: 700;
}

:global(.dark) .knowledge-card:nth-child(4n + 1) {
  --card-accent: #64a9ff;
}

:global(.dark) .knowledge-card:nth-child(4n + 2) {
  --card-accent: #4fd3b5;
}

:global(.dark) .knowledge-card:nth-child(4n + 3) {
  --card-accent: #ff8095;
}

:global(.dark) .knowledge-card:nth-child(4n + 4) {
  --card-accent: #aaa8ff;
}

.shelf-control {
  position: absolute;
  top: 50%;
  z-index: 2;
  display: inline-flex;
  width: 52px;
  height: 52px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  background: color-mix(in srgb, var(--color-bg-elevated) 86%, transparent);
  box-shadow: var(--shadow-md);
  color: var(--color-text);
  opacity: 0;
  pointer-events: none;
  transform: translateY(-50%) scale(0.9);
  transition:
    opacity 240ms var(--ease-out),
    transform 350ms var(--ease-spring),
    background-color var(--duration-fast) var(--ease-out);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
}

.shelf-control span {
  font-size: 34px;
  font-weight: 300;
  line-height: 1;
}

.shelf-control:hover {
  background: var(--color-bg-elevated);
}

.shelf-control:not(:disabled) {
  pointer-events: auto;
}

.knowledge-shelf:hover .shelf-control:not(:disabled),
.knowledge-shelf:focus-within .shelf-control:not(:disabled) {
  opacity: 1;
  transform: translateY(-50%) scale(1);
}

.shelf-control:disabled {
  display: none;
}

.shelf-control-back {
  left: 10px;
}

.shelf-control-forward {
  right: 10px;
}

.empty-domain {
  padding: 28px 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-lg);
}

@media (hover: none) {
  .shelf-control {
    display: none;
  }
}

@media (max-width: 700px) {
  .technology-center {
    padding: 56px var(--space-4) 72px;
  }

  .domain-section + .domain-section {
    margin-top: 72px;
  }

  .domain-title {
    font-size: 40px;
  }

  .domain-summary {
    font-size: var(--font-size-md);
  }

  .module-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .technology-header h3 {
    font-size: 26px;
  }

  .module-overview-link {
    margin-top: 12px;
    margin-left: 0;
  }

  .knowledge-card {
    width: calc(100vw - 48px);
    height: 400px;
    flex-basis: calc(100vw - 48px);
    padding: 24px;
  }

  .knowledge-card-art {
    right: 24px;
    bottom: 54px;
    left: 24px;
  }

  .knowledge-card-footer {
    right: 24px;
    left: 24px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .knowledge-shelf-track {
    scroll-behavior: auto;
  }

  .knowledge-card,
  .knowledge-card-arrow,
  .module-overview-link span,
  .shelf-control {
    transition-duration: 120ms;
  }

  .knowledge-card:hover,
  .knowledge-card:focus-visible {
    transform: none;
  }
}
</style>
