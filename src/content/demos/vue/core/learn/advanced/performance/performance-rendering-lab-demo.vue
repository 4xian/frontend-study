<script setup lang="ts">
import { computed, defineComponent, h, nextTick, onMounted, onUpdated, ref } from 'vue'
import type { PropType } from 'vue'

type CourseId = 'reactivity' | 'components' | 'rendering'

interface CourseItem {
  id: CourseId
  label: string
}

type UpdateCounts = Record<CourseId, number>

const courses: readonly CourseItem[] = [
  { id: 'reactivity', label: '响应式基础' },
  { id: 'components', label: '组件通信' },
  { id: 'rendering', label: '渲染机制' },
]

/** 创建一组没有子组件更新的初始计数。 */
function createEmptyCounts(): UpdateCounts {
  return { reactivity: 0, components: 0, rendering: 0 }
}

const selectedId = ref<CourseId>('reactivity')
const unrelatedRefreshes = ref(0)
const broadUpdateCounts = ref<UpdateCounts>(createEmptyCounts())
const stableUpdateCounts = ref<UpdateCounts>(createEmptyCounts())
const computedRunSnapshot = ref(0)

let computedEvaluations = 0

/** 根据选中课程派生摘要，并记录 getter 的真实执行次数。 */
const selectedSummary = computed(() => {
  computedEvaluations += 1
  const selectedCourse = courses.find((course) => course.id === selectedId.value)
  return selectedCourse ? `当前选中：${selectedCourse.label}` : '未找到选中课程'
})

/** 汇总宽 props 列表的子组件更新次数。 */
const broadUpdateTotal = computed(() =>
  Object.values(broadUpdateCounts.value).reduce((total, count) => total + count, 0),
)

/** 汇总稳定 props 列表的子组件更新次数。 */
const stableUpdateTotal = computed(() =>
  Object.values(stableUpdateCounts.value).reduce((total, count) => total + count, 0),
)

const BroadCourseRow = defineComponent({
  name: 'PerformanceBroadCourseRow',
  props: {
    id: { type: String as PropType<CourseId>, required: true },
    label: { type: String, required: true },
    selectedId: { type: String as PropType<CourseId>, required: true },
  },
  emits: {
    /** 校验子组件更新事件携带已知课程 ID。 */
    updated: (id: CourseId) => courses.some((course) => course.id === id),
  },
  /** 建立接收全局 selectedId 的课程行。 */
  setup(props, { emit }) {
    /** 每次真实更新后向实验台上报当前行身份。 */
    onUpdated(() => emit('updated', props.id))

    /** 渲染宽 props 课程行。 */
    function renderBroadCourseRow() {
      const active = props.id === props.selectedId
      return h(
        'article',
        {
          class: ['course-row', { active }],
          'data-testid': 'broad-course-row',
          'data-course-id': props.id,
          'aria-current': active ? 'true' : undefined,
        },
        [h('strong', props.label), h('span', active ? '已选择' : '未选择')],
      )
    }

    return renderBroadCourseRow
  },
})

const StableCourseRow = defineComponent({
  name: 'PerformanceStableCourseRow',
  props: {
    id: { type: String as PropType<CourseId>, required: true },
    label: { type: String, required: true },
    active: { type: Boolean, required: true },
  },
  emits: {
    /** 校验子组件更新事件携带已知课程 ID。 */
    updated: (id: CourseId) => courses.some((course) => course.id === id),
  },
  /** 建立只接收自身 active 语义的课程行。 */
  setup(props, { emit }) {
    /** 每次真实更新后向实验台上报当前行身份。 */
    onUpdated(() => emit('updated', props.id))

    /** 渲染稳定 props 课程行。 */
    function renderStableCourseRow() {
      return h(
        'article',
        {
          class: ['course-row', { active: props.active }],
          'data-testid': 'stable-course-row',
          'data-course-id': props.id,
          'aria-current': props.active ? 'true' : undefined,
        },
        [h('strong', props.label), h('span', props.active ? '已选择' : '未选择')],
      )
    }

    return renderStableCourseRow
  },
})

/** 记录宽 props 列表中指定行的一次真实更新。 */
function recordBroadUpdate(id: CourseId): void {
  broadUpdateCounts.value = {
    ...broadUpdateCounts.value,
    [id]: broadUpdateCounts.value[id] + 1,
  }
}

/** 记录稳定 props 列表中指定行的一次真实更新。 */
function recordStableUpdate(id: CourseId): void {
  stableUpdateCounts.value = {
    ...stableUpdateCounts.value,
    [id]: stableUpdateCounts.value[id] + 1,
  }
}

/** 选择另一门课程，并在本轮渲染完成后同步 computed 执行快照。 */
async function selectCourse(id: CourseId): Promise<void> {
  if (selectedId.value === id) return
  selectedId.value = id
  await nextTick()
  computedRunSnapshot.value = computedEvaluations
}

/** 只更新父级无关状态，并保留 computed 执行次数证据。 */
async function refreshUnrelatedState(): Promise<void> {
  unrelatedRefreshes.value += 1
  await nextTick()
  computedRunSnapshot.value = computedEvaluations
}

/** 首次挂载后公开 computed getter 的初始执行次数。 */
onMounted(() => {
  computedRunSnapshot.value = computedEvaluations
})
</script>

<template>
  <article class="performance-rendering-lab-demo">
    <header class="lab-header">
      <p class="eyebrow">Rendering cost lab</p>
      <h3>稳定输入，减少无关更新</h3>
      <p class="lab-description">
        两组列表显示相同结果：左侧每行接收全局 selectedId，右侧每行只接收自身 active。
      </p>
    </header>

    <div class="selection-controls" role="group" aria-label="选择课程">
      <button
        v-for="course in courses"
        :key="course.id"
        type="button"
        :data-testid="`select-course-${course.id}`"
        :aria-pressed="selectedId === course.id"
        @click="selectCourse(course.id)"
      >
        {{ course.label }}
      </button>
    </div>

    <div class="refresh-controls">
      <button
        type="button"
        class="refresh-button"
        data-testid="refresh-unrelated"
        @click="refreshUnrelatedState"
      >
        触发父级无关刷新
      </button>
      <p data-testid="unrelated-refresh-count">无关刷新 {{ unrelatedRefreshes }} 次</p>
    </div>

    <section class="computed-evidence" aria-label="计算缓存证据">
      <strong data-testid="selected-summary">{{ selectedSummary }}</strong>
      <span data-testid="computed-run-count"
        >computed getter 执行 {{ computedRunSnapshot }} 次</span
      >
    </section>

    <div class="comparison-lanes">
      <section class="comparison-lane broad-lane" aria-labelledby="broad-lane-title">
        <div class="lane-heading">
          <div>
            <p class="lane-kicker">宽 props</p>
            <h4 id="broad-lane-title">每行接收 selectedId</h4>
          </div>
          <strong data-testid="broad-update-total">更新 {{ broadUpdateTotal }} 次</strong>
        </div>

        <BroadCourseRow
          v-for="course in courses"
          :key="course.id"
          :id="course.id"
          :label="course.label"
          :selected-id="selectedId"
          @updated="recordBroadUpdate"
        />
      </section>

      <section class="comparison-lane stable-lane" aria-labelledby="stable-lane-title">
        <div class="lane-heading">
          <div>
            <p class="lane-kicker">稳定 props</p>
            <h4 id="stable-lane-title">每行只接收 active</h4>
          </div>
          <strong data-testid="stable-update-total">更新 {{ stableUpdateTotal }} 次</strong>
        </div>

        <StableCourseRow
          v-for="course in courses"
          :key="course.id"
          :id="course.id"
          :label="course.label"
          :active="course.id === selectedId"
          @updated="recordStableUpdate"
        />
      </section>
    </div>

    <p class="result-summary" data-testid="rendering-result" role="status" aria-live="polite">
      选择变化累计：宽 props {{ broadUpdateTotal }} 次，稳定 props {{ stableUpdateTotal }} 次。
    </p>
  </article>
</template>

<style scoped>
.performance-rendering-lab-demo {
  min-width: 0;
  padding: 1.25rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-sunken);
  overflow: hidden;
}

.lab-header h3,
.lab-header p,
.refresh-controls p,
.lane-heading h4,
.lane-heading p,
.result-summary {
  margin: 0;
}

.eyebrow,
.lane-kicker {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: 700;
}

.lab-header h3 {
  margin-top: 0.35rem;
}

.lab-description {
  margin-top: 0.75rem !important;
  color: var(--color-text-secondary);
  line-height: 1.65;
}

.selection-controls,
.refresh-controls,
.comparison-lanes,
.lane-heading,
.course-row {
  display: flex;
  flex-wrap: wrap;
}

.selection-controls {
  margin: 0.75rem -0.25rem 0;
}

.selection-controls button,
.refresh-button {
  min-width: 8.5rem;
  min-height: 44px;
  padding: 0.65rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
  color: var(--color-text);
  font: inherit;
  font-weight: 650;
  line-height: 1.35;
  overflow-wrap: anywhere;
  cursor: pointer;
  white-space: normal;
}

.selection-controls button {
  flex: 1 1 9rem;
  margin: 0.25rem;
}

.selection-controls button[aria-pressed='true'],
.refresh-button {
  border-color: var(--color-accent);
  background: var(--color-accent);
  color: var(--color-on-accent);
}

.selection-controls button:focus-visible,
.refresh-button:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
}

.refresh-controls {
  align-items: center;
  margin-top: 0.75rem;
}

.refresh-button {
  flex: 0 1 auto;
  margin: 0.25rem;
}

.refresh-controls p {
  min-width: 0;
  margin: 0.25rem 0.25rem 0.25rem 0.75rem;
  color: var(--color-text-secondary);
  overflow-wrap: anywhere;
}

.computed-evidence {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 0.9rem 1rem;
  margin-top: 1rem;
  border-left: 3px solid var(--color-accent);
  background: var(--color-bg-elevated);
  overflow-wrap: anywhere;
}

.computed-evidence span {
  margin-top: 0.4rem;
  color: var(--color-text-secondary);
}

.comparison-lanes {
  align-items: stretch;
  margin: 0.75rem -0.375rem 0;
}

.comparison-lane {
  flex: 1 1 18rem;
  min-width: 0;
  padding: 1rem;
  margin: 0.375rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
}

.lane-heading {
  align-items: flex-start;
  justify-content: space-between;
  min-width: 0;
}

.lane-heading > div {
  flex: 1 1 10rem;
  min-width: 0;
}

.lane-heading h4 {
  margin-top: 0.25rem;
  overflow-wrap: anywhere;
}

.lane-heading > strong {
  flex: 0 1 auto;
  margin: 0.25rem 0 0.25rem 0.75rem;
  color: var(--color-accent);
  overflow-wrap: anywhere;
}

.course-row {
  align-items: center;
  justify-content: space-between;
  min-width: 0;
  min-height: 56px;
  padding: 0.75rem;
  margin-top: 0.65rem;
  border-left: 3px solid var(--color-border);
  background: var(--color-bg-sunken);
}

.course-row.active {
  border-left-color: var(--color-accent);
}

.course-row strong {
  flex: 1 1 8rem;
  min-width: 0;
  overflow-wrap: anywhere;
}

.course-row span {
  flex: 0 1 auto;
  margin: 0.25rem 0 0.25rem 0.75rem;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  overflow-wrap: anywhere;
}

.course-row.active span {
  color: var(--color-accent);
  font-weight: 700;
}

.result-summary {
  min-width: 0;
  padding: 0.9rem 1rem;
  margin-top: 1rem;
  border: 1px solid var(--color-border);
  background: var(--color-bg-elevated);
  line-height: 1.55;
  overflow-wrap: anywhere;
}

@media (max-width: 560px) {
  .performance-rendering-lab-demo {
    padding: 0.9rem;
  }

  .selection-controls button,
  .refresh-button {
    flex-basis: calc(100% - 0.5rem);
  }

  .refresh-controls p {
    flex: 1 1 100%;
    margin-left: 0.25rem;
  }

  .comparison-lane {
    flex-basis: calc(100% - 0.75rem);
  }

  .lane-heading > strong,
  .course-row span {
    margin-left: 0;
  }

  .lane-heading > strong {
    flex-basis: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .performance-rendering-lab-demo,
  .performance-rendering-lab-demo * {
    scroll-behavior: auto;
  }
}
</style>
