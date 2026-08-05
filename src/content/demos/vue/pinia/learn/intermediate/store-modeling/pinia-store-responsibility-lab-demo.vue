<script setup lang="ts">
import { defineComponent, h, onBeforeUnmount, ref } from 'vue'
import { createPinia, defineStore, disposePinia } from 'pinia'
import { preserveActivePinia } from '@/content/demos/vue/pinia/preserve-active-pinia'

const serverFixture = {
  projectName: '课程重构',
  version: 2,
}

interface OperationEvent {
  id: number
  message: string
}

const useTaskStore = defineStore('pinia-p03-modeling-task', {
  /** 创建业务状态与客户端缓存的确定性基线。 */
  state: () => ({
    taskCompleted: false,
    cacheProjectName: '待刷新项目',
    cacheVersion: 1,
  }),
  actions: {
    /** 由业务 Store 完成自己拥有的任务。 */
    completeTask(): void {
      this.taskCompleted = true
    },
    /** 从服务端 fixture 刷新客户端缓存投影。 */
    refreshCache(): void {
      this.cacheProjectName = serverFixture.projectName
      this.cacheVersion = serverFixture.version
    },
    /** 恢复 Store 的确定性教学基线。 */
    reset(): void {
      this.taskCompleted = false
      this.cacheProjectName = '待刷新项目'
      this.cacheVersion = 1
    },
  },
})

const LocalWorkspace = defineComponent({
  name: 'PiniaModelingLocalWorkspace',
  /** 创建只属于当前组件实例的短命 UI 状态。 */
  setup() {
    const panelOpen = ref(false)
    const draft = ref('')

    /** 打开当前组件拥有的局部面板。 */
    function openPanel(): void {
      panelOpen.value = true
    }

    /** 填入只属于当前组件实例的未提交草稿。 */
    function fillDraft(): void {
      draft.value = '待提交说明'
    }

    /** 渲染局部状态与操作按钮。 */
    function renderWorkspace() {
      return h('section', { class: 'local-panel', 'aria-label': '组件本地状态' }, [
        h('p', { class: 'panel-label' }, '组件本地'),
        h(
          'p',
          { 'data-testid': 'modeling-panel' },
          `面板：${panelOpen.value ? '已打开' : '已关闭'}`,
        ),
        h('p', { 'data-testid': 'modeling-draft' }, `草稿：${draft.value || '空'}`),
        h('div', { class: 'local-actions' }, [
          h('button', { type: 'button', onClick: openPanel }, '打开局部面板'),
          h('button', { type: 'button', onClick: fillDraft }, '填写本地草稿'),
        ]),
      ])
    }

    return renderWorkspace
  },
})

const pinia = createPinia()
const store = preserveActivePinia(() => useTaskStore(pinia))
const localKey = ref(0)
const lastOperation = ref('等待操作')
let nextTimelineId = 1
const timeline = ref<OperationEvent[]>([
  { id: 0, message: '教学基线：局部组件与 Store 均等待操作' },
])

/** 记录最后操作，并把职责事件限制为最近六条。 */
function recordOperation(message: string): void {
  lastOperation.value = message
  timeline.value = [...timeline.value, { id: nextTimelineId++, message }].slice(-6)
}

/** 通过 owning Store action 完成业务任务。 */
function completeBusinessTask(): void {
  preserveActivePinia(() => store.completeTask())
  recordOperation('taskStore.completeTask() 修改业务状态')
}

/** 从确定性服务端 fixture 刷新客户端缓存。 */
function refreshClientCache(): void {
  preserveActivePinia(() => store.refreshCache())
  recordOperation('taskStore.refreshCache() 更新客户端缓存')
}

/** 通过替换 key 重建局部组件实例。 */
function remountLocalWorkspace(): void {
  localKey.value++
  recordOperation('局部组件已重挂载，Store 未销毁')
}

/** 恢复 Store 并重建局部组件。 */
function resetDemo(): void {
  preserveActivePinia(() => store.reset())
  localKey.value++
  lastOperation.value = '已恢复全部教学基线'
  timeline.value = [{ id: nextTimelineId++, message: '已恢复全部教学基线' }]
}

onBeforeUnmount(() => {
  preserveActivePinia(() => disposePinia(pinia))
})
</script>

<template>
  <article class="pinia-demo" aria-label="Store 建模实验">
    <header class="demo-header">
      <p class="eyebrow">L08 · Store 建模</p>
      <h3>按所有权与生命周期放置状态</h3>
      <p>这是应用建模建议，不是 Pinia 强制分层规则。</p>
    </header>

    <div class="ownership-panels">
      <LocalWorkspace :key="localKey" />

      <section class="store-panel" aria-label="Pinia 业务状态">
        <p class="panel-label">Pinia Store</p>
        <p data-testid="modeling-task">业务任务：{{ store.taskCompleted ? '已完成' : '待完成' }}</p>
        <p data-testid="modeling-cache">
          客户端缓存：{{ store.cacheProjectName }} · v{{ store.cacheVersion }}
        </p>
      </section>

      <section class="server-panel" aria-label="服务端权威边界">
        <p class="panel-label">外部系统</p>
        <p data-testid="modeling-authority">
          服务端 fixture 是权威源：{{ serverFixture.projectName }} · v2
        </p>
        <p>Store 只拥有浏览器中的缓存副本与刷新状态。</p>
      </section>
    </div>

    <div class="actions" aria-label="状态所有权实验操作">
      <button type="button" @click="completeBusinessTask">完成业务任务</button>
      <button type="button" @click="refreshClientCache">刷新客户端缓存</button>
      <button type="button" @click="remountLocalWorkspace">重挂载局部组件</button>
      <button type="button" @click="resetDemo">重置实验</button>
    </div>

    <p class="operation" aria-live="polite">最近操作：{{ lastOperation }}</p>

    <section class="timeline-panel">
      <h4>职责操作时间线</h4>
      <ol aria-label="状态所有权操作时间线">
        <li v-for="event in timeline" :key="event.id">{{ event.message }}</li>
      </ol>
    </section>
  </article>
</template>

<style scoped>
.pinia-demo {
  width: 100%;
  padding: 20px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg-elevated);
}

.demo-header p,
.demo-header h3,
.ownership-panels p,
.operation,
.timeline-panel h4 {
  margin: 0;
}

.eyebrow,
.panel-label {
  color: var(--color-accent);
  font-size: var(--font-size-xs);
  font-weight: 700;
}

.demo-header h3 {
  margin-top: 4px;
  font-size: var(--font-size-lg);
}

.demo-header p:last-child {
  margin-top: 8px;
  color: var(--color-text-secondary);
}

.ownership-panels {
  display: flex;
  flex-wrap: wrap;
  margin-top: 16px;
}

.ownership-panels > section,
.ownership-panels :deep(.local-panel) {
  flex: 1 1 210px;
  min-width: 0;
  margin: 4px;
  padding: 14px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-bg-sunken);
}

.ownership-panels p + p {
  margin-top: 8px;
  overflow-wrap: anywhere;
}

.actions,
.local-actions {
  display: flex;
  flex-wrap: wrap;
  margin-top: 12px;
}

button {
  min-height: 40px;
  margin: 4px 8px 4px 0;
  padding: 0 14px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text-primary);
  background: var(--color-bg-sunken);
  cursor: pointer;
}

button:hover {
  border-color: var(--color-accent);
}

button:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.operation {
  margin-top: 14px;
  padding: 12px;
  border-left: 3px solid var(--color-accent);
  background: var(--color-bg-sunken);
}

.timeline-panel {
  margin-top: 12px;
  padding: 12px;
  background: var(--color-bg-sunken);
}

.timeline-panel ol {
  margin: 8px 0 0;
  padding-left: 22px;
}

.timeline-panel li + li {
  margin-top: 5px;
}

@media (max-width: 520px) {
  .pinia-demo {
    padding: 14px;
  }

  .ownership-panels > section,
  .ownership-panels :deep(.local-panel) {
    flex-basis: 100%;
  }
}
</style>
