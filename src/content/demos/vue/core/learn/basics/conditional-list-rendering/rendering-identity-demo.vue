<script setup lang="ts">
import { computed, ref } from 'vue'

interface LessonRecord {
  id: string
  title: string
  completed: boolean
}

const showIfPanel = ref(true)
const showShowPanel = ref(true)
const includeCompleted = ref(true)
const lessons = ref<LessonRecord[]>([
  { id: 'sfc', title: '单文件组件基础', completed: true },
  { id: 'template', title: '模板语法', completed: true },
  { id: 'rendering', title: '条件与列表渲染', completed: false },
])

// 根据筛选开关派生当前需要展示的课程记录。
const visibleLessons = computed(() =>
  includeCompleted.value ? lessons.value : lessons.value.filter((lesson) => !lesson.completed),
)

// 创建新数组并反转课程顺序，触发 keyed 列表重排。
function reverseLessons(): void {
  lessons.value = [...lessons.value].reverse()
}
</script>

<template>
  <article class="identity-demo">
    <header class="demo-header">
      <p class="eyebrow">DOM 身份实验</p>
      <h3>显隐方式与列表 key</h3>
      <p>先在输入框中写几个字，再隐藏并重新显示对应区域。</p>
    </header>

    <section class="condition-section" aria-labelledby="condition-demo-title">
      <div class="section-heading">
        <div>
          <p class="section-index">01</p>
          <h4 id="condition-demo-title">对比 v-if 与 v-show</h4>
        </div>
        <p class="section-note">v-if 重建节点，v-show 保留节点。</p>
      </div>

      <div class="condition-panels">
        <article class="condition-panel">
          <div class="panel-header">
            <code>v-if</code>
            <button type="button" @click="showIfPanel = !showIfPanel">
              {{ showIfPanel ? '隐藏' : '显示' }}
            </button>
          </div>
          <div v-if="showIfPanel" class="input-area">
            <label for="if-note">临时输入</label>
            <input id="if-note" placeholder="隐藏后会被重建" />
          </div>
          <p v-else class="hidden-state">当前分支没有真实输入框</p>
        </article>

        <article class="condition-panel">
          <div class="panel-header">
            <code>v-show</code>
            <button type="button" @click="showShowPanel = !showShowPanel">
              {{ showShowPanel ? '隐藏' : '显示' }}
            </button>
          </div>
          <div v-show="showShowPanel" class="input-area">
            <label for="show-note">临时输入</label>
            <input id="show-note" placeholder="隐藏后仍保留内容" />
          </div>
          <p v-if="!showShowPanel" class="hidden-state">输入框仍在 DOM 中，只是 display 为 none</p>
        </article>
      </div>
    </section>

    <section class="list-section" aria-labelledby="list-demo-title">
      <div class="section-heading">
        <div>
          <p class="section-index">02</p>
          <h4 id="list-demo-title">让状态跟随记录移动</h4>
        </div>
        <div class="list-actions">
          <button type="button" @click="includeCompleted = !includeCompleted">
            {{ includeCompleted ? '隐藏已完成' : '显示全部' }}
          </button>
          <button type="button" @click="reverseLessons">反转顺序</button>
        </div>
      </div>

      <ul v-if="visibleLessons.length" class="lesson-list">
        <li v-for="lesson in visibleLessons" :key="lesson.id" class="lesson-row">
          <div class="lesson-copy">
            <strong>{{ lesson.title }}</strong>
            <span>{{ lesson.completed ? '已完成' : '学习中' }}</span>
          </div>
          <input :aria-label="`${lesson.title}的临时备注`" placeholder="输入临时备注" />
        </li>
      </ul>
      <p v-else class="empty-state">当前筛选下没有课程</p>

      <p class="demo-footnote">
        每行使用课程 id 作为 key。反转时输入状态会跟随课程移动；被筛选移出的记录仍会卸载， key
        不负责缓存已删除节点。
      </p>
    </section>
  </article>
</template>

<style scoped>
.identity-demo {
  width: 100%;
  max-width: 760px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg-sunken);
  overflow: hidden;
}

.demo-header,
.condition-section,
.list-section {
  padding: 20px;
}

.demo-header {
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-elevated);
}

.eyebrow,
.section-index {
  margin: 0;
  color: var(--color-accent);
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.demo-header h3,
.section-heading h4 {
  margin: 6px 0 0;
  color: var(--color-text);
}

.demo-header h3 {
  font-size: var(--font-size-lg);
}

.demo-header p:last-child,
.section-note,
.demo-footnote {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.6;
}

.demo-header p:last-child {
  margin: 8px 0 0;
}

.list-section {
  border-top: 1px solid var(--color-border);
}

.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.section-heading h4 {
  font-size: var(--font-size-md);
}

.section-note {
  max-width: 260px;
  margin: 0 0 0 20px;
  text-align: right;
}

.condition-panels {
  display: flex;
  align-items: stretch;
  margin-top: 16px;
}

.condition-panel {
  flex: 1 1 0;
  min-width: 0;
  padding: 16px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg-elevated);
}

.condition-panel + .condition-panel {
  margin-left: 12px;
}

.panel-header,
.lesson-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.panel-header code {
  color: var(--color-accent);
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: var(--font-size-sm);
  font-weight: 600;
}

button {
  min-height: 34px;
  padding: 6px 12px;
  border: 1px solid var(--color-border-strong);
  border-radius: 8px;
  background: var(--color-bg-elevated);
  color: var(--color-text);
  font: inherit;
  font-size: var(--font-size-sm);
  cursor: pointer;
}

button:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

button:focus-visible,
input:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.input-area {
  margin-top: 16px;
}

.input-area label {
  display: block;
  margin-bottom: 6px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
}

input {
  width: 100%;
  min-width: 0;
  height: 38px;
  padding: 0 10px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg);
  color: var(--color-text);
  font: inherit;
  font-size: var(--font-size-sm);
}

.hidden-state,
.empty-state {
  min-height: 54px;
  margin: 16px 0 0;
  padding: 14px;
  border: 1px dashed var(--color-border);
  border-radius: 8px;
  color: var(--color-text-tertiary);
  font-size: var(--font-size-sm);
}

.list-actions {
  display: flex;
  align-items: center;
  margin-left: 20px;
}

.list-actions button + button {
  margin-left: 8px;
}

.lesson-list {
  padding: 0;
  margin: 16px 0 0;
  list-style: none;
}

.lesson-row {
  padding: 12px 0;
}

.lesson-row + .lesson-row {
  border-top: 1px solid var(--color-border);
}

.lesson-copy {
  min-width: 0;
  padding-right: 16px;
}

.lesson-copy strong,
.lesson-copy span {
  display: block;
}

.lesson-copy strong {
  color: var(--color-text);
  font-size: var(--font-size-sm);
}

.lesson-copy span {
  margin-top: 3px;
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
}

.lesson-row input {
  flex: 0 1 230px;
}

.demo-footnote {
  margin: 14px 0 0;
}

@media (max-width: 620px) {
  .demo-header,
  .condition-section,
  .list-section {
    padding: 16px;
  }

  .section-heading,
  .condition-panels,
  .lesson-row {
    display: block;
  }

  .section-note,
  .list-actions {
    margin-top: 10px;
    margin-left: 0;
    text-align: left;
  }

  .condition-panel + .condition-panel {
    margin-top: 12px;
    margin-left: 0;
  }

  .lesson-copy {
    padding-right: 0;
  }

  .lesson-row input {
    width: 100%;
    margin-top: 10px;
  }
}
</style>
