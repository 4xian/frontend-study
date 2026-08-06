<script setup lang="ts">
import { ref } from 'vue'
import CoursePreviewCard from './parts/CoursePreviewCard.vue'

interface CourseState {
  title: string
  durationMinutes: number
  level: string
}

const course = ref<CourseState>({
  title: '组件基础',
  durationMinutes: 30,
  level: '基础',
})
const featured = ref(false)
const topics = ref(['组件', 'Props'])
const showDescription = ref(false)

/** 在两组父级课程状态之间切换。 */
function toggleCourse(): void {
  course.value =
    course.value.title === '组件基础'
      ? { title: '用 Props 建立清晰组件输入', durationMinutes: 45, level: '进阶' }
      : { title: '组件基础', durationMinutes: 30, level: '基础' }
}

/** 切换父级拥有的推荐状态。 */
function toggleFeatured(): void {
  featured.value = !featured.value
}

/** 用新数组替换父级主题列表。 */
function toggleTopics(): void {
  topics.value =
    topics.value.length === 2 ? ['Props', '单向数据流', 'TypeScript'] : ['组件', 'Props']
}

/** 切换父级是否提供可选说明。 */
function toggleDescription(): void {
  showDescription.value = !showDescription.value
}
</script>

<template>
  <article class="props-flow-demo">
    <header class="demo-header">
      <p class="eyebrow">Props 输入流实验台</p>
      <h3>父级更新，子级只读刷新</h3>
      <p>所有操作都修改父组件状态，右侧子组件只通过已声明 Props 展示最新输入。</p>
    </header>

    <div class="demo-body">
      <section class="parent-controls" aria-labelledby="parent-state-title">
        <div class="section-heading">
          <p>01 · 数据所有者</p>
          <h4 id="parent-state-title">父组件状态</h4>
        </div>

        <dl class="parent-values">
          <div>
            <dt>title</dt>
            <dd>{{ course.title }}</dd>
          </div>
          <div>
            <dt>durationMinutes</dt>
            <dd>{{ course.durationMinutes }} · number</dd>
          </div>
          <div>
            <dt>featured</dt>
            <dd>{{ featured }} · boolean</dd>
          </div>
          <div>
            <dt>topics</dt>
            <dd>{{ topics.join(' / ') }}</dd>
          </div>
        </dl>

        <div class="control-actions" aria-label="更新父组件状态">
          <button type="button" @click="toggleCourse">切换课程</button>
          <button type="button" @click="toggleFeatured">切换推荐</button>
          <button type="button" @click="toggleTopics">更新主题</button>
          <button type="button" @click="toggleDescription">切换说明</button>
        </div>
      </section>

      <section class="props-preview" aria-labelledby="child-preview-title">
        <div class="section-heading">
          <p>02 · 只读消费者</p>
          <h4 id="child-preview-title">子组件收到的 Props</h4>
        </div>

        <CoursePreviewCard
          eyebrow="基础课程"
          :title="course.title"
          :duration-minutes="course.durationMinutes"
          :featured="featured"
          :topics="topics"
          :course-meta="{ level: course.level }"
          :description="showDescription ? '这段说明由父组件显式提供。' : undefined"
        />
      </section>
    </div>
  </article>
</template>

<style scoped>
.props-flow-demo {
  width: 100%;
  max-width: 900px;
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg-elevated);
}

.demo-header {
  padding: 22px;
  border-bottom: 1px solid var(--color-border);
}

.eyebrow,
.section-heading p {
  color: var(--color-accent);
  font-size: var(--font-size-xs);
  font-weight: 700;
}

.demo-header h3 {
  margin-top: 5px;
  color: var(--color-text);
  font-size: var(--font-size-lg);
  line-height: 1.35;
}

.demo-header > p:last-child {
  margin-top: 8px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.6;
}

.demo-body {
  display: flex;
  align-items: stretch;
  padding: 22px;
}

.parent-controls,
.props-preview {
  width: calc(50% - 7px);
  min-width: 0;
  padding: 18px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg-sunken);
}

.props-preview {
  margin-left: 14px;
}

.section-heading {
  padding-bottom: 14px;
  border-bottom: 1px solid var(--color-border);
}

.section-heading h4 {
  margin-top: 4px;
  color: var(--color-text);
  font-size: var(--font-size-md);
}

.parent-values {
  margin-top: 14px;
}

.parent-values > div {
  min-width: 0;
  padding: 9px 0;
  border-bottom: 1px solid var(--color-border);
}

.parent-values dt,
.parent-values dd {
  overflow-wrap: anywhere;
}

.parent-values dt {
  color: var(--color-text-tertiary);
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: var(--font-size-xs);
}

.parent-values dd {
  margin-top: 3px;
  color: var(--color-text);
  font-size: var(--font-size-sm);
  line-height: 1.45;
}

.control-actions {
  display: flex;
  flex-wrap: wrap;
  margin: 14px -4px -4px;
}

.control-actions button {
  min-height: 44px;
  flex: 1 1 118px;
  margin: 4px;
  padding: 8px 12px;
  border: 1px solid var(--color-accent);
  border-radius: 7px;
  background: var(--color-bg-elevated);
  color: var(--color-accent);
  font: inherit;
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.control-actions button:hover {
  background: var(--color-accent);
  color: var(--color-on-accent);
}

.control-actions button:active {
  transform: scale(0.98);
}

.control-actions button:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

@media (max-width: 680px) {
  .demo-body {
    display: block;
    padding: 18px;
  }

  .parent-controls,
  .props-preview {
    width: 100%;
  }

  .props-preview {
    margin-left: 0;
    margin-top: 14px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .control-actions button {
    transition:
      background-color var(--duration-fast) linear,
      color var(--duration-fast) linear;
  }

  .control-actions button:active {
    transform: none;
  }
}
</style>
