<script setup lang="ts">
import {
  effectScope,
  getCurrentScope,
  onScopeDispose,
  reactive,
  ref,
  watch,
  type EffectScope,
} from 'vue'

type ScopeKey = 'parent' | 'attached' | 'detached'
type ScopeState = 'active' | 'stopped'

interface ScopeMetrics {
  watchRuns: number
  eventRuns: number
  cleanupRuns: number
  scopeDetected: boolean
}

const scopeOrder: ScopeKey[] = ['parent', 'attached', 'detached']
const scopeLabels: Record<ScopeKey, string> = {
  parent: '父作用域',
  attached: '普通子作用域',
  detached: '分离作用域',
}
const scopeDescriptions: Record<ScopeKey, string> = {
  parent: '组件 scope 下的显式功能 owner',
  attached: '在父 scope.run 内创建，随父级停止',
  detached: '不随父级停止，由独立 owner 释放',
}

const channel = new EventTarget()
const sourceValue = ref(0)
const parentStopCalls = ref(0)
const detachedStopCalls = ref(0)
const lastAction = ref('等待推进状态或停止作用域')
const componentScopeDetected = getCurrentScope() !== undefined
const componentBridgeRegistered = ref(false)
const scopeStates = reactive<Record<ScopeKey, ScopeState>>({
  parent: 'active',
  attached: 'active',
  detached: 'active',
})
const metrics = reactive<Record<ScopeKey, ScopeMetrics>>({
  parent: { watchRuns: 0, eventRuns: 0, cleanupRuns: 0, scopeDetected: false },
  attached: { watchRuns: 0, eventRuns: 0, cleanupRuns: 0, scopeDetected: false },
  detached: { watchRuns: 0, eventRuns: 0, cleanupRuns: 0, scopeDetected: false },
})

const parentScope = effectScope()
let detachedScope: EffectScope | undefined

/** 在当前活跃 scope 中建立一个同步 watcher 和一个原生事件订阅。 */
function registerScopedWork(scopeKey: ScopeKey): void {
  metrics[scopeKey].scopeDetected = getCurrentScope() !== undefined

  watch(
    sourceValue,
    () => {
      metrics[scopeKey].watchRuns += 1
    },
    { flush: 'sync' },
  )

  /** 记录当前 scope 持有的原生频道事件。 */
  function handleChannelPulse(): void {
    metrics[scopeKey].eventRuns += 1
  }

  /** 移除原生事件订阅，并记录这一次真实资源释放。 */
  function releaseChannel(): void {
    channel.removeEventListener('lesson-pulse', handleChannelPulse)
    metrics[scopeKey].cleanupRuns += 1
  }

  channel.addEventListener('lesson-pulse', handleChannelPulse)
  onScopeDispose(releaseChannel)
}

parentScope.run(() => {
  registerScopedWork('parent')

  const attachedScope = effectScope()
  attachedScope.run(() => registerScopedWork('attached'))

  detachedScope = effectScope(true)
  detachedScope.run(() => registerScopedWork('detached'))
})

/** 在组件 scope 结束时释放不会自动归属组件的 detached scope。 */
function stopDetachedForComponent(): void {
  detachedScope?.stop()
}

if (getCurrentScope()) {
  onScopeDispose(stopDetachedForComponent)
  componentBridgeRegistered.value = true
}

/** 同步改变被观察状态并广播一次真实 EventTarget 事件。 */
function advanceStateAndBroadcast(): void {
  sourceValue.value += 1
  channel.dispatchEvent(new Event('lesson-pulse'))
  lastAction.value = '状态已推进，频道已广播'
}

/** 停止父 scope；重复调用用于验证 cleanup 只执行一次。 */
function stopParentScope(): void {
  parentStopCalls.value += 1
  parentScope.stop()
  scopeStates.parent = 'stopped'
  scopeStates.attached = 'stopped'
  lastAction.value =
    parentStopCalls.value === 1 ? '父 scope 已停止并级联普通子 scope' : '父 scope 重复停止'
}

/** 停止 detached scope；重复调用用于验证独立 owner 的幂等释放。 */
function stopDetachedScope(): void {
  detachedStopCalls.value += 1
  detachedScope?.stop()
  scopeStates.detached = 'stopped'
  lastAction.value =
    detachedStopCalls.value === 1 ? 'detached scope 已由独立 owner 停止' : 'detached scope 重复停止'
}
</script>

<template>
  <section class="effect-scope-lifecycle-lab-demo" aria-labelledby="effect-scope-lab-title">
    <header class="demo-header">
      <p class="eyebrow">EffectScope 生命周期实验</p>
      <h3 id="effect-scope-lab-title">为一组副作用建立明确所有者</h3>
      <p>
        三个 scope 同时观察一个 ref，并各自持有一个原生 EventTarget 订阅。比较父级级联停止与
        detached 独立停止的结果。
      </p>
    </header>

    <section class="component-boundary" aria-labelledby="component-boundary-title">
      <h4 id="component-boundary-title">组件生命周期边界</h4>
      <p data-testid="component-scope-boundary">
        组件 setup scope：{{ componentScopeDetected ? '已检测' : '未检测' }}；detached 释放桥接：{{
          componentBridgeRegistered ? '已登记' : '未登记'
        }}
      </p>
      <p>
        父 scope 在 setup 中创建，会归入组件生命周期；detached scope 不会，因此额外把它的 stop
        登记回组件 scope。
      </p>
    </section>

    <div class="scope-list" aria-label="作用域运行状态">
      <article
        v-for="scopeKey in scopeOrder"
        :key="scopeKey"
        class="scope-card"
        :data-testid="scopeKey + '-scope-card'"
      >
        <div class="scope-card-heading">
          <div>
            <p class="scope-kind">{{ scopeKey === 'detached' ? 'detached' : 'attached' }}</p>
            <h4>{{ scopeLabels[scopeKey] }}</h4>
          </div>
          <output
            class="scope-state"
            :data-state="scopeStates[scopeKey]"
            :data-testid="scopeKey + '-scope-state'"
          >
            {{ scopeStates[scopeKey] === 'active' ? '运行中' : '已停止' }}
          </output>
        </div>

        <p class="scope-description">{{ scopeDescriptions[scopeKey] }}</p>
        <dl class="metric-list">
          <div>
            <dt>watch 响应</dt>
            <dd :data-testid="scopeKey + '-watch-runs'">
              {{ metrics[scopeKey].watchRuns }}
            </dd>
          </div>
          <div>
            <dt>频道响应</dt>
            <dd :data-testid="scopeKey + '-event-runs'">
              {{ metrics[scopeKey].eventRuns }}
            </dd>
          </div>
          <div>
            <dt>资源清理</dt>
            <dd :data-testid="scopeKey + '-cleanup-runs'">
              {{ metrics[scopeKey].cleanupRuns }}
            </dd>
          </div>
        </dl>
        <p class="collection-state" :data-testid="scopeKey + '-collection-state'">
          同步 run 收集：{{ metrics[scopeKey].scopeDetected ? '已确认' : '未确认' }}
        </p>
      </article>
    </div>

    <section class="action-panel" aria-labelledby="scope-actions-title">
      <h4 id="scope-actions-title">执行顺序</h4>
      <div class="actions">
        <button type="button" data-testid="advance-state" @click="advanceStateAndBroadcast">
          推进状态并广播
        </button>
        <button type="button" data-testid="stop-parent" @click="stopParentScope">
          停止父作用域
        </button>
        <button type="button" data-testid="stop-detached" @click="stopDetachedScope">
          停止分离作用域
        </button>
      </div>
    </section>

    <section class="observation" aria-labelledby="scope-observation-title" aria-live="polite">
      <h4 id="scope-observation-title">当前观察</h4>
      <p data-testid="last-action">{{ lastAction }}</p>
      <p>
        状态版本：<strong data-testid="source-value">{{ sourceValue }}</strong>
      </p>
      <p>
        父 stop 调用：<strong data-testid="parent-stop-calls">{{ parentStopCalls }}</strong>
        次；detached stop 调用：<strong data-testid="detached-stop-calls">{{
          detachedStopCalls
        }}</strong>
        次
      </p>
    </section>
  </section>
</template>

<style scoped>
.effect-scope-lifecycle-lab-demo {
  min-width: 0;
  color: var(--color-text);
}

.demo-header,
.component-boundary,
.action-panel,
.observation {
  min-width: 0;
}

.demo-header p,
.component-boundary p,
.scope-description,
.collection-state,
.observation p {
  overflow-wrap: anywhere;
}

.demo-header > p:last-child,
.component-boundary > p:last-child,
.scope-description,
.collection-state {
  color: var(--color-text-secondary);
}

.eyebrow,
.scope-kind {
  color: var(--color-accent);
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.demo-header h3,
.component-boundary h4,
.scope-card h4,
.action-panel h4,
.observation h4 {
  margin-top: var(--space-1);
  letter-spacing: 0;
}

.demo-header > p:last-child {
  margin-top: var(--space-2);
  line-height: 1.7;
}

.component-boundary,
.action-panel,
.observation {
  padding: var(--space-4);
  margin-top: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-sunken);
}

.component-boundary p,
.observation p {
  margin-top: var(--space-2);
  line-height: 1.65;
}

.scope-list {
  display: flex;
  flex-wrap: wrap;
  margin-top: var(--space-4);
  margin-right: calc(var(--space-2) * -1);
  margin-bottom: calc(var(--space-2) * -1);
}

.scope-card {
  flex: 1 1 190px;
  min-width: 0;
  padding: var(--space-4);
  margin-right: var(--space-2);
  margin-bottom: var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
}

.scope-card-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.scope-card-heading > div {
  min-width: 0;
  padding-right: var(--space-2);
}

.scope-state {
  flex: 0 0 auto;
  padding: var(--space-1) var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.scope-state[data-state='active'] {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.scope-description {
  min-height: 3.4em;
  margin-top: var(--space-3);
  line-height: 1.7;
}

.metric-list {
  margin-top: var(--space-3);
}

.metric-list > div {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: var(--space-2) 0;
  border-top: 1px solid var(--color-border);
}

.metric-list dt {
  padding-right: var(--space-2);
  color: var(--color-text-secondary);
}

.metric-list dd {
  flex: 0 0 auto;
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-weight: 600;
}

.collection-state {
  margin-top: var(--space-2);
  font-size: var(--font-size-sm);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  margin-top: var(--space-3);
  margin-right: calc(var(--space-2) * -1);
  margin-bottom: calc(var(--space-2) * -1);
}

.actions button {
  flex: 1 1 150px;
  min-width: 0;
  min-height: 44px;
  padding: var(--space-2) var(--space-3);
  margin-right: var(--space-2);
  margin-bottom: var(--space-2);
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-sm);
  color: var(--color-accent);
  font-weight: 600;
  overflow-wrap: anywhere;
  touch-action: manipulation;
}

.actions button:hover {
  background: var(--color-accent-soft);
}

.actions button:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.observation strong {
  color: var(--color-accent);
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
}

@media (max-width: 520px) {
  .scope-card {
    flex-basis: 100%;
  }

  .actions button {
    flex-basis: 100%;
  }
}
</style>
