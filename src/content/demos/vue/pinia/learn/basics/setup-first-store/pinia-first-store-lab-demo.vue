<script setup lang="ts">
import { createApp, defineComponent, h, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { createPinia, defineStore, disposePinia } from 'pinia'
import type { App } from 'vue'
import type { Pinia } from 'pinia'
import { preserveActivePinia } from '@/content/demos/vue/pinia/preserve-active-pinia'

const useCounterStore = defineStore('pinia-p01-first-store', {
  /** 创建当前 Store 的初始状态。 */
  state: () => ({ count: 0 }),
  actions: {
    /** 增加独立 Store 的计数。 */
    increment(): void {
      this.count++
    },
  },
})

const miniAppHost = ref<HTMLElement | null>(null)
const ready = ref(false)
const generation = ref(0)
const stateKeyCount = ref(0)
const storeCount = ref(0)
const rootState = ref('{}')
const hostUrl = ref('等待挂载')
const timeline = ref<string[]>([])

let miniApp: App<Element> | undefined
let demoPinia: Pinia | undefined
let eventNumber = 0

/** 追加一条稳定序号的时间线记录，并只保留最近六条。 */
function appendEvent(message: string): void {
  eventNumber++
  timeline.value = [
    ...timeline.value,
    `${String(eventNumber).padStart(2, '0')} · ${message}`,
  ].slice(-6)
}

/** 读取独立 Pinia 的教学诊断状态。 */
function syncDiagnostics(pinia: Pinia): void {
  stateKeyCount.value = Object.keys(pinia.state.value).length
  rootState.value = JSON.stringify(pinia.state.value)
}

const MiniAppRoot = defineComponent({
  name: 'PiniaFirstStoreMiniApp',
  /** 首次 setup 时取得 Store，并渲染独立交互控件。 */
  setup() {
    const store = preserveActivePinia(() => useCounterStore())
    storeCount.value = store.count
    if (demoPinia) syncDiagnostics(demoPinia)
    appendEvent(`首次 useStore()：注册 ${useCounterStore.$id}`)

    /** 修改 Store，并同步外层教学仪表。 */
    function increment(): void {
      preserveActivePinia(() => store.increment())
      storeCount.value = store.count
      if (demoPinia) syncDiagnostics(demoPinia)
      appendEvent(`action increment()：count = ${store.count}`)
    }

    return () =>
      h('div', { class: 'mini-app' }, [
        h('p', { class: 'mini-label' }, '独立 mini-app'),
        h('strong', `Store count：${store.count}`),
        h('button', { type: 'button', onClick: increment }, '调用 increment()'),
      ])
  },
})

/** 卸载当前 mini-app，并释放只属于 Demo 的 Pinia。 */
function disposeDemo(): void {
  preserveActivePinia(() => miniApp?.unmount())
  miniApp = undefined
  if (demoPinia) disposePinia(demoPinia)
  demoPinia = undefined
  ready.value = false
}

/** 创建新 generation，展示定义阶段与首次 useStore 的边界。 */
async function initializeDemo(): Promise<void> {
  disposeDemo()
  const host = miniAppHost.value
  if (!host) return

  generation.value++
  timeline.value = []
  eventNumber = 0
  storeCount.value = 0
  hostUrl.value = `${window.location.pathname}${window.location.search}${window.location.hash}`
  const pinia = createPinia()
  demoPinia = pinia
  syncDiagnostics(pinia)
  appendEvent(`defineStore() 已存在：root state keys = ${stateKeyCount.value}`)

  const app = createApp(MiniAppRoot)
  miniApp = app
  preserveActivePinia(() => {
    app.use(pinia)
    app.mount(host)
  })
  await nextTick()
  syncDiagnostics(pinia)
  ready.value = true
}

onMounted(() => void initializeDemo())
onBeforeUnmount(disposeDemo)
</script>

<template>
  <article class="pinia-demo">
    <header class="demo-header">
      <div>
        <p class="eyebrow">Store 所有权实验</p>
        <h3>定义不等于创建</h3>
        <p>每次重建都会创建新的 mini-app 与 Pinia，宿主应用保持不变。</p>
      </div>
      <button type="button" @click="initializeDemo">重建独立实例</button>
    </header>

    <section class="status-panel" aria-live="polite">
      <div class="status-item">
        <span>Generation</span>
        <strong>{{ generation }}</strong>
      </div>
      <div class="status-item">
        <span>Store ID</span>
        <strong>{{ useCounterStore.$id }}</strong>
      </div>
      <div class="status-item">
        <span>Root state keys</span>
        <strong>{{ stateKeyCount }}</strong>
      </div>
      <div class="status-item">
        <span>当前 state.count</span>
        <strong>{{ storeCount }}</strong>
      </div>
    </section>

    <section class="mini-section" aria-labelledby="pinia-first-mini-title">
      <div class="section-heading">
        <div>
          <p>01</p>
          <h4 id="pinia-first-mini-title">首次 useStore()</h4>
        </div>
        <span>{{ ready ? '已挂载' : '正在创建' }}</span>
      </div>
      <div ref="miniAppHost" class="mini-app-host"></div>
      <p class="diagnostic-note">
        Root state keys 通过 Pinia 公开 state 做教学诊断，不是业务代码应依赖的 Store 枚举。
      </p>
    </section>

    <section class="evidence-section" aria-labelledby="pinia-first-evidence-title">
      <div class="section-heading">
        <div>
          <p>02</p>
          <h4 id="pinia-first-evidence-title">隔离证据</h4>
        </div>
      </div>
      <dl class="evidence-list">
        <div>
          <dt>独立 root state</dt>
          <dd>{{ rootState }}</dd>
        </div>
        <div>
          <dt>宿主 URL</dt>
          <dd>{{ hostUrl }}</dd>
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
.mini-section,
.evidence-section {
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
  flex: 1 1 420px;
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

.demo-header p:last-child,
.diagnostic-note {
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

.status-panel {
  display: flex;
  align-items: stretch;
  flex-wrap: wrap;
  padding: 12px 8px 0;
  border-bottom: 1px solid var(--color-border);
}

.status-item {
  flex: 1 1 150px;
  min-width: 0;
  padding: 0 12px 12px;
}

.status-item span,
.evidence-list dt {
  display: block;
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
}

.status-item strong {
  display: block;
  margin-top: 4px;
  overflow-wrap: anywhere;
  color: var(--color-text-primary);
}

.mini-section {
  border-bottom: 1px solid var(--color-border);
}

.evidence-section {
  background: var(--color-bg-elevated);
}

.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 14px;
}

.section-heading h4 {
  margin-top: 3px;
  color: var(--color-text-primary);
  font-size: var(--font-size-md);
}

.section-heading > span {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.mini-app-host {
  min-height: 90px;
}

.mini-app-host :deep(.mini-app) {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  padding: 14px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-bg-elevated);
}

.mini-app-host :deep(.mini-label) {
  width: 100%;
  margin-bottom: 10px;
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
}

.mini-app-host :deep(strong) {
  margin-right: 14px;
}

.evidence-list > div {
  padding: 10px 0;
  border-bottom: 1px solid var(--color-border);
}

.evidence-list dd {
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
  .mini-section,
  .evidence-section {
    padding: 16px;
  }

  .demo-header > div {
    margin-right: 0;
    margin-bottom: 12px;
  }

  .demo-header > button {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  button {
    transition: none;
  }
}
</style>
