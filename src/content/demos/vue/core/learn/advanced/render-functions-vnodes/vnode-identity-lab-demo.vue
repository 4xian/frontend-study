<script setup lang="ts">
import { computed, defineComponent, h, ref } from 'vue'
import type { PropType } from 'vue'

type CourseItemId = 'reactivity' | 'components' | 'rendering'

interface CourseItem {
  id: CourseItemId
  label: string
}

const items = ref<CourseItem[]>([
  { id: 'reactivity', label: '响应式基础' },
  { id: 'components', label: '组件通信' },
  { id: 'rendering', label: '渲染函数' },
])
const reverseCount = ref(0)
const currentOrder = computed(() => items.value.map((item) => item.id).join(' -> '))
const identitySummary = computed(() =>
  reverseCount.value === 0
    ? '尚未重排；反转次数 0'
    : `重排 ${reverseCount.value} 次，components 的本地状态仍归属 components`,
)

const StatefulCourseItem = defineComponent({
  name: 'StatefulCourseItem',
  props: {
    item: {
      type: Object as PropType<CourseItem>,
      required: true,
    },
  },
  /** 为每项课程建立只属于当前组件实例的本地输入状态。 */
  setup(props) {
    const note = ref('')

    /** 把输入值写入当前 keyed 子组件拥有的本地状态。 */
    function updateNote(event: Event): void {
      note.value = (event.target as HTMLInputElement).value
    }

    /** 根据最新本地状态创建当前课程项的 VNode 子树。 */
    return () => {
      const inputId = `local-note-${props.item.id}`

      return h(
        'li',
        {
          class: 'course-item',
          'data-testid': 'stateful-item',
          'data-item-id': props.item.id,
        },
        [
          h('h4', props.item.label),
          h('p', '输入状态由这个子组件实例拥有，并随稳定业务身份一起移动。'),
          h('label', { class: 'note-field', for: inputId }, [
            h('span', '本地笔记'),
            h('input', {
              id: inputId,
              'data-testid': 'local-note-input',
              value: note.value,
              placeholder: '写下本地笔记',
              onInput: updateNote,
            }),
          ]),
        ],
      )
    }
  },
})

const StatefulList = defineComponent({
  name: 'StatefulList',
  props: {
    items: {
      type: Array as PropType<CourseItem[]>,
      required: true,
    },
  },
  /** 为当前顺序创建带稳定业务 key 的子组件列表。 */
  setup(props) {
    /** 为本轮 items 创建新的列表 VNode。 */
    return () =>
      h(
        'ol',
        { class: 'stateful-list', 'data-testid': 'vnode-order' },
        props.items.map((item) =>
          h(StatefulCourseItem, {
            key: item.id,
            item,
          }),
        ),
      )
  },
})

/** 反转业务数据顺序并记录确定性的重排次数。 */
function reverseOrder(): void {
  items.value = [...items.value].reverse()
  reverseCount.value += 1
}
</script>

<template>
  <section class="vnode-identity-lab-demo" aria-labelledby="vnode-lab-title">
    <header class="demo-header">
      <p class="demo-eyebrow">VNode identity lab</p>
      <h3 id="vnode-lab-title">一次重排，状态仍跟随业务身份</h3>
      <p>
        三个有状态子组件由 <code>h()</code> 创建。先写一条本地笔记，再反转列表，观察稳定
        <code>key</code> 如何让状态继续属于原来的业务 ID。
      </p>
    </header>

    <p class="current-order" data-testid="current-order">
      当前顺序：<strong>{{ currentOrder }}</strong>
    </p>

    <p class="identity-summary" data-testid="identity-summary" role="status" aria-live="polite">
      {{ identitySummary }}
    </p>

    <StatefulList :items="items" />

    <div class="controls" aria-label="重排命令">
      <button type="button" data-testid="reverse-order" @click="reverseOrder">反转顺序</button>
    </div>
  </section>
</template>

<style scoped>
.vnode-identity-lab-demo {
  min-width: 0;
  padding: 20px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg-elevated);
}

.demo-header,
.vnode-identity-lab-demo :deep(.course-item),
.vnode-identity-lab-demo :deep(.note-field) {
  min-width: 0;
}

.demo-eyebrow {
  color: var(--color-accent);
  font-size: var(--font-size-xs);
  font-weight: 700;
}

.demo-header h3 {
  margin-top: 5px;
  font-size: var(--font-size-xl);
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.demo-header > p:last-child,
.vnode-identity-lab-demo :deep(.course-item > p) {
  color: var(--color-text-secondary);
  line-height: 1.65;
  overflow-wrap: anywhere;
}

.demo-header > p:last-child {
  margin-top: 8px;
}

.demo-header code,
.current-order strong {
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
}

.current-order,
.identity-summary {
  padding: 12px 14px;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.current-order {
  margin-top: 18px;
  border-left: 3px solid var(--color-accent);
  background: var(--color-accent-soft);
}

.identity-summary {
  margin-top: 10px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text-secondary);
}

.controls {
  display: flex;
  flex-wrap: wrap;
  margin: 10px -4px -4px;
}

.controls button {
  min-width: 44px;
  min-height: 44px;
  margin: 4px;
  padding: 10px 16px;
  border: 1px solid var(--color-border-strong);
  border-radius: 8px;
  background: var(--color-bg);
  color: var(--color-text);
  font-weight: 600;
}

.controls button:hover {
  border-color: var(--color-accent);
  background: var(--color-accent-soft);
}

.vnode-identity-lab-demo :deep(.stateful-list) {
  display: flex;
  flex-direction: column;
  min-width: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

.vnode-identity-lab-demo :deep(.course-item) {
  padding: 16px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg);
}

.vnode-identity-lab-demo :deep(.course-item + .course-item) {
  margin-top: 12px;
}

.vnode-identity-lab-demo :deep(.course-item:focus-within) {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-focus-ring);
}

.vnode-identity-lab-demo :deep(.course-item h4) {
  font-size: var(--font-size-lg);
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.vnode-identity-lab-demo :deep(.course-item > p) {
  margin-top: 8px;
}

.vnode-identity-lab-demo :deep(.note-field) {
  display: flex;
  flex-direction: column;
  margin-top: 14px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.vnode-identity-lab-demo :deep(.note-field input) {
  width: 100%;
  min-width: 0;
  min-height: 45px;
  margin-top: 7px;
  padding: 10px 12px;
  border: 1px solid var(--color-border-strong);
  border-radius: 8px;
  background: var(--color-bg-elevated);
  color: var(--color-text);
  font: inherit;
  box-sizing: border-box;
}

.vnode-identity-lab-demo :deep(.note-field input:focus-visible) {
  border-color: var(--color-accent);
  outline: 3px solid var(--color-focus-ring);
  outline-offset: 1px;
}

@media (max-width: 520px) {
  .vnode-identity-lab-demo {
    padding: 16px;
  }

  .controls button {
    flex: 1 1 132px;
  }
}
</style>
