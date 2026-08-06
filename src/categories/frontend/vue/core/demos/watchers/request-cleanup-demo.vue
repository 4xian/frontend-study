<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue'

const unsafeQuery = ref('')
const safeQuery = ref('')
const unsafeResult = ref('等待实验')
const safeResult = ref('等待实验')
const unsafeStatus = ref('尚未发起任务')
const safeStatus = ref('尚未发起任务')
const events = ref<string[]>([])
const running = ref(false)

const unsafeTimers = new Set<ReturnType<typeof setTimeout>>()
let nextQueryTimer: ReturnType<typeof setTimeout> | undefined
let finishTimer: ReturnType<typeof setTimeout> | undefined
let runNumber = 0

/**
 * 根据模拟查询类型返回任务延迟。
 */
function getRequestDelay(query: string): number {
  return query.startsWith('慢') ? 900 : 180
}

/**
 * 把最新实验事件追加到可见日志顶部。
 */
function recordEvent(message: string): void {
  events.value = [message, ...events.value].slice(0, 8)
}

/**
 * 清除未安全绑定到侦听器的计时任务。
 */
function clearUnsafeTimers(): void {
  for (const timer of unsafeTimers) clearTimeout(timer)
  unsafeTimers.clear()
}

// 对照组不登记清理，慢任务会在失效后继续完成。
watch(unsafeQuery, (query) => {
  if (!query) return

  const delay = getRequestDelay(query)
  unsafeStatus.value = '处理中：' + query
  const timer = setTimeout(() => {
    unsafeTimers.delete(timer)
    unsafeResult.value = query
    unsafeStatus.value = '最后写入：' + query
    recordEvent('未清理组完成 ' + query)
  }, delay)
  unsafeTimers.add(timer)
})

// 正确组把计时器绑定到本次回调，来源变化时先取消旧任务。
watch(safeQuery, (query, _oldQuery, onCleanup) => {
  if (!query) return

  const delay = getRequestDelay(query)
  safeStatus.value = '处理中：' + query
  let completed = false
  const timer = setTimeout(() => {
    completed = true
    safeResult.value = query
    safeStatus.value = '最后写入：' + query
    recordEvent('清理组完成 ' + query)
  }, delay)

  onCleanup(() => {
    clearTimeout(timer)
    if (!completed) recordEvent('清理组取消 ' + query)
  })
})

/**
 * 连续发出慢查询和快查询，展示旧任务失效后的竞态结果。
 */
function runRace(): void {
  if (running.value) return

  runNumber++
  running.value = true
  events.value = []
  unsafeResult.value = '等待结果'
  safeResult.value = '等待结果'
  unsafeStatus.value = '准备慢任务'
  safeStatus.value = '准备慢任务'
  clearUnsafeTimers()

  const slowQuery = '慢查询 #' + runNumber
  const fastQuery = '快查询 #' + runNumber
  unsafeQuery.value = slowQuery
  safeQuery.value = slowQuery
  recordEvent('同时发起 ' + slowQuery)

  nextQueryTimer = setTimeout(() => {
    unsafeQuery.value = fastQuery
    safeQuery.value = fastQuery
    recordEvent('条件变化为 ' + fastQuery)
  }, 120)

  finishTimer = setTimeout(() => {
    running.value = false
  }, 1050)
}

// 离开 Demo 时清除不受侦听器生命周期管理的计时任务。
onUnmounted(() => {
  clearUnsafeTimers()
  if (nextQueryTimer) clearTimeout(nextQueryTimer)
  if (finishTimer) clearTimeout(finishTimer)
})
</script>

<template>
  <article class="watch-demo">
    <header class="demo-header">
      <p class="eyebrow">副作用实验台</p>
      <h3>旧任务为什么会覆盖新结果</h3>
      <p>同一轮先执行 900ms 慢任务，120ms 后再执行 180ms 快任务。</p>
      <button type="button" :disabled="running" @click="runRace">
        {{ running ? '实验运行中' : '运行竞态实验' }}
      </button>
    </header>

    <div class="comparison" aria-live="polite">
      <section class="lane unsafe" aria-labelledby="unsafe-title">
        <div class="lane-heading">
          <p class="lane-index">01</p>
          <div>
            <h4 id="unsafe-title">未登记清理</h4>
            <p>两个计时任务都会完成。</p>
          </div>
        </div>
        <dl>
          <div>
            <dt>当前状态</dt>
            <dd>{{ unsafeStatus }}</dd>
          </div>
          <div>
            <dt>界面结果</dt>
            <dd>{{ unsafeResult }}</dd>
          </div>
        </dl>
      </section>

      <section class="lane safe" aria-labelledby="safe-title">
        <div class="lane-heading">
          <p class="lane-index">02</p>
          <div>
            <h4 id="safe-title">使用 onCleanup</h4>
            <p>快查询到来前取消旧计时器。</p>
          </div>
        </div>
        <dl>
          <div>
            <dt>当前状态</dt>
            <dd>{{ safeStatus }}</dd>
          </div>
          <div>
            <dt>界面结果</dt>
            <dd>{{ safeResult }}</dd>
          </div>
        </dl>
      </section>
    </div>

    <section class="event-section" aria-labelledby="watch-event-title">
      <h4 id="watch-event-title">执行顺序</h4>
      <ol v-if="events.length">
        <li v-for="(event, index) in events" :key="event + index">{{ event }}</li>
      </ol>
      <p v-else class="empty-log">尚无事件</p>
    </section>
  </article>
</template>

<style scoped>
.watch-demo {
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
}

.demo-header {
  padding: 22px;
}

.eyebrow,
.lane-index {
  color: var(--color-accent);
  font-size: var(--font-size-xs);
  font-weight: 700;
  text-transform: uppercase;
}

.demo-header h3 {
  margin-top: 6px;
  font-size: var(--font-size-xl);
}

.demo-header > p:last-of-type {
  margin-top: 8px;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.demo-header button {
  min-height: 44px;
  padding: 0 18px;
  margin-top: 18px;
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-md);
  background: var(--color-accent);
  color: var(--color-on-accent);
  font-weight: 600;
  transition:
    transform var(--duration-fast) var(--ease-out),
    opacity var(--duration-fast) var(--ease-out);
}

.demo-header button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.demo-header button:disabled {
  cursor: wait;
  opacity: 0.55;
}

.comparison {
  display: flex;
  border-top: 1px solid var(--color-border);
}

.lane {
  width: 50%;
  padding: 22px;
}

.lane + .lane {
  border-left: 1px solid var(--color-border);
}

.lane-heading {
  display: flex;
  align-items: flex-start;
}

.lane-index {
  width: 28px;
  flex: 0 0 28px;
  margin-top: 3px;
}

.lane-heading h4 {
  font-size: var(--font-size-lg);
}

.lane-heading div p {
  margin-top: 4px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.lane dl {
  margin-top: 20px;
}

.lane dl div {
  padding: 12px 0;
  border-top: 1px solid var(--color-border);
}

.lane dt {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
}

.lane dd {
  min-height: 24px;
  margin-top: 4px;
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.unsafe dd:last-child {
  color: var(--color-warning);
}

.safe dd:last-child {
  color: var(--color-success, #248a3d);
}

.event-section {
  padding: 18px 22px 22px;
  border-top: 1px solid var(--color-border);
  background: var(--color-bg-sunken);
}

.event-section h4 {
  font-size: var(--font-size-sm);
}

.event-section ol {
  display: flex;
  flex-wrap: wrap;
  padding: 0;
  margin: 10px 0 0;
  list-style: none;
}

.event-section li {
  padding: 5px 8px;
  margin-right: 6px;
  margin-bottom: 6px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: var(--font-size-xs);
}

.empty-log {
  min-height: 27px;
  margin-top: 10px;
  color: var(--color-text-tertiary);
  font-size: var(--font-size-sm);
}

@media (max-width: 560px) {
  .demo-header,
  .lane,
  .event-section {
    padding: 18px;
  }

  .demo-header button {
    width: 100%;
  }

  .comparison {
    flex-direction: column;
  }

  .lane {
    width: 100%;
  }

  .lane + .lane {
    border-top: 1px solid var(--color-border);
    border-left: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .demo-header button {
    transition-property: opacity;
  }

  .demo-header button:hover:not(:disabled) {
    transform: none;
  }
}
</style>
