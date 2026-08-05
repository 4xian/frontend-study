<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { createPinia, defineStore, disposePinia } from 'pinia'
import { preserveActivePinia } from '@/content/demos/vue/pinia/preserve-active-pinia'

interface MutationState {
  count: number
  tags: string[]
}

const useMutationStore = defineStore('pinia-p01-state-mutations', {
  /** 返回每次 reset 都会重新取得的基线状态。 */
  state: (): MutationState => ({ count: 0, tags: [] }),
})

const pinia = createPinia()
const store = preserveActivePinia(() => useMutationStore(pinia))
const subscriptionCount = ref(0)
const lastMutation = ref('尚无 mutation')
const lastPayload = ref('无')
const timeline = ref<string[]>([])
let eventNumber = 0

/** 追加稳定序号记录，并将时间线限制为最近八条。 */
function appendEvent(message: string): void {
  eventNumber++
  timeline.value = [
    ...timeline.value,
    `${String(eventNumber).padStart(2, '0')} · ${message}`,
  ].slice(-8)
}

const unsubscribe = store.$subscribe(
  (mutation, state) => {
    subscriptionCount.value++
    lastMutation.value = mutation.type
    lastPayload.value = 'payload' in mutation ? JSON.stringify(mutation.payload) : '无'
    appendEvent(
      `订阅 #${subscriptionCount.value}：${mutation.type}；state = ${JSON.stringify(state)}`,
    )
  },
  { detached: true, flush: 'sync' },
)

/** 通过公开 state 属性执行一次直接写入。 */
function mutateDirectly(): void {
  store.count++
  appendEvent('操作：store.count++')
}

/** 使用对象 patch 同步合并两个已知字段。 */
function patchObject(): void {
  store.$patch({ count: store.count + 2, tags: [...store.tags, 'object'] })
  appendEvent('操作：$patch(object)')
}

/** 使用函数 patch 在一个同步批次内执行两次修改。 */
function patchFunction(): void {
  store.$patch((state) => {
    state.count += 3
    state.tags.push('function')
  })
  appendEvent('操作：$patch(fn)，内部两次写入')
}

/** 通过 $state setter 提交一份完整快照。 */
function replaceState(): void {
  store.$state = { count: 7, tags: ['snapshot'] }
  appendEvent('操作：$state = snapshot')
}

/** 调用 Options Store 自动 reset 恢复 state factory 基线。 */
function resetState(): void {
  store.$reset()
  appendEvent('操作：$reset()')
}

/** 清空教学记录但保留当前 Store 状态。 */
function clearTimeline(): void {
  subscriptionCount.value = 0
  lastMutation.value = '尚无 mutation'
  lastPayload.value = '无'
  timeline.value = []
  eventNumber = 0
}

onBeforeUnmount(() => {
  unsubscribe()
  preserveActivePinia(() => disposePinia(pinia))
})
</script>

<template>
  <article class="pinia-demo">
    <header class="demo-header">
      <div>
        <p class="eyebrow">State mutation 实验</p>
        <h3>五种写法，三类 mutation</h3>
        <p>订阅使用 sync flush，只用于让每次按钮操作立即显示确定结果。</p>
      </div>
      <button type="button" @click="clearTimeline">清空记录</button>
    </header>

    <section class="state-panel" aria-live="polite">
      <div>
        <span>count</span>
        <strong>{{ store.count }}</strong>
      </div>
      <div>
        <span>tags</span>
        <strong>{{ store.tags.length ? store.tags.join(', ') : '空' }}</strong>
      </div>
      <div>
        <span>订阅次数</span>
        <strong>{{ subscriptionCount }}</strong>
      </div>
    </section>

    <section class="control-section" aria-labelledby="pinia-mutation-actions-title">
      <div class="section-heading">
        <p>01</p>
        <h4 id="pinia-mutation-actions-title">选择一次写入</h4>
      </div>
      <div class="actions">
        <button type="button" @click="mutateDirectly">直接赋值</button>
        <button type="button" @click="patchObject">对象 Patch</button>
        <button type="button" @click="patchFunction">函数 Patch</button>
        <button type="button" @click="replaceState">State 快照</button>
        <button type="button" @click="resetState">Reset</button>
      </div>
    </section>

    <section class="result-section" aria-labelledby="pinia-mutation-result-title">
      <div class="section-heading">
        <p>02</p>
        <h4 id="pinia-mutation-result-title">最后一次订阅事件</h4>
      </div>
      <dl class="result-list">
        <div>
          <dt>mutation type</dt>
          <dd>{{ lastMutation }}</dd>
        </div>
        <div>
          <dt>payload</dt>
          <dd>{{ lastPayload }}</dd>
        </div>
      </dl>
      <ol class="timeline">
        <li v-for="event in timeline" :key="event">{{ event }}</li>
      </ol>
    </section>
  </article>
</template>

<style scoped>
.pinia-demo {
  width: 100%;
  max-width: 780px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg-sunken);
}

.demo-header,
.control-section,
.result-section {
  padding: 20px;
}

.demo-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-elevated);
}

.demo-header > div {
  flex: 1 1 440px;
  min-width: 0;
  margin-right: 16px;
}

.eyebrow,
.section-heading p {
  color: var(--color-accent);
  font-size: var(--font-size-xs);
  font-weight: 700;
}

.demo-header h3 {
  margin-top: 4px;
  color: var(--color-text-primary);
  font-size: var(--font-size-lg);
}

.demo-header p:last-child {
  margin-top: 8px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.6;
}

button {
  min-height: 38px;
  padding: 0 14px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text-primary);
  background: var(--color-bg-elevated);
  font-weight: 600;
  touch-action: manipulation;
}

button:hover {
  border-color: var(--color-accent);
}

.state-panel {
  display: flex;
  align-items: stretch;
  flex-wrap: wrap;
  padding: 14px 8px 2px;
  border-bottom: 1px solid var(--color-border);
}

.state-panel > div {
  flex: 1 1 160px;
  min-width: 0;
  padding: 0 12px 12px;
}

.state-panel span,
.result-list dt {
  display: block;
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
}

.state-panel strong {
  display: block;
  margin-top: 4px;
  overflow-wrap: anywhere;
  color: var(--color-text-primary);
}

.control-section {
  border-bottom: 1px solid var(--color-border);
}

.result-section {
  background: var(--color-bg-elevated);
}

.section-heading {
  display: flex;
  align-items: baseline;
  margin-bottom: 14px;
}

.section-heading p {
  margin-right: 10px;
}

.section-heading h4 {
  color: var(--color-text-primary);
  font-size: var(--font-size-md);
}

.actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-right: -10px;
  margin-bottom: -10px;
}

.actions button {
  margin-right: 10px;
  margin-bottom: 10px;
}

.result-list > div {
  padding: 9px 0;
  border-bottom: 1px solid var(--color-border);
}

.result-list dd {
  margin-top: 4px;
  overflow-wrap: anywhere;
  color: var(--color-text-primary);
  font-family: var(--font-mono);
  font-size: var(--font-size-sm);
}

.timeline {
  padding-left: 20px;
  margin-top: 14px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.7;
}

@media (max-width: 520px) {
  .demo-header,
  .control-section,
  .result-section {
    padding: 16px;
  }

  .demo-header > div {
    margin-right: 0;
    margin-bottom: 12px;
  }

  .demo-header > button,
  .actions button {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  button {
    transition: none;
  }
}
</style>
