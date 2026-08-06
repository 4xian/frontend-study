<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { createPinia, defineStore, disposePinia } from 'pinia'
import { preserveActivePinia } from '../preserve-active-pinia'

const timeline = ref<string[]>([
  'setup：双方只取得实例，不读取对方 state',
  'computed：首次渲染时读取 session.name',
])
const pinia = createPinia()

/** 追加最近六条确定性组合记录。 */
function appendEvent(message: string): void {
  timeline.value = [...timeline.value, message].slice(-6)
}

const useSessionStore = defineStore('pinia-p03-composition-session', () => {
  const name = ref('访客')
  const cart = useCartStore(pinia)

  /** 在访客与会员之间切换身份。 */
  function toggleMember(): void {
    name.value = name.value === '访客' ? '会员' : '访客'
  }

  /** 在 action 执行阶段读取购物车的最新数量。 */
  function readCartCount(): number {
    return cart.items.length
  }

  return { name, toggleMember, readCartCount }
})

const useCartStore = defineStore('pinia-p03-composition-cart', () => {
  const session = useSessionStore(pinia)
  const items = ref<string[]>([])
  const summary = computed(() => `${session.name} · ${items.value.length} 件`)

  /** 由购物车自己拥有并修改商品列表。 */
  function addItem(): void {
    items.value.push(`商品 ${items.value.length + 1}`)
  }

  /** 恢复购物车的确定性基线。 */
  function reset(): void {
    items.value = []
  }

  return { items, summary, addItem, reset }
})

const session = preserveActivePinia(() => useSessionStore(pinia))
const cart = preserveActivePinia(() => useCartStore(pinia))
const visibleSummary = computed(() => cart.summary)
const readPhase = ref('尚未执行 action 读取')
const instanceResult = ref('双方等待首次协作')

/** 调用购物车 action，并观察跨 Store computed 更新。 */
function addProduct(): void {
  preserveActivePinia(() => cart.addItem())
  appendEvent(`cart action：加入商品，computed -> ${visibleSummary.value}`)
}

/** 修改 session 自有 state，并观察购物车 computed 跟随。 */
function toggleMember(): void {
  preserveActivePinia(() => session.toggleMember())
  appendEvent(`session action：切换身份，computed -> ${visibleSummary.value}`)
}

/** 在用户操作阶段从 session action 读取 cart 当前 state。 */
function inspectCartFromAction(): void {
  const count = preserveActivePinia(() => session.readCartCount())
  readPhase.value = `action 执行时读取：${count} 件`
  instanceResult.value =
    preserveActivePinia(() => useCartStore(pinia)) === cart
      ? '双方取得同一隔离 Pinia 实例'
      : '实例不一致'
  appendEvent(`session action：读取 cart.items.length = ${count}`)
}

/** 同时恢复两个职责 Store 的教学基线。 */
function resetDemo(): void {
  preserveActivePinia(() => {
    cart.reset()
    if (session.name !== '访客') session.toggleMember()
  })
  readPhase.value = '尚未执行 action 读取'
  instanceResult.value = '双方等待首次协作'
  timeline.value = [
    'setup：双方只取得实例，不读取对方 state',
    'computed：首次渲染时读取 session.name',
  ]
}

onBeforeUnmount(() => {
  preserveActivePinia(() => disposePinia(pinia))
})
</script>

<template>
  <article class="pinia-demo" aria-label="Store 组合实验">
    <header class="demo-header">
      <p class="eyebrow">L07 · Store 组合</p>
      <h3>先取得实例，再延迟读取</h3>
      <p>session 与 cart 在 setup 中互相取得实例，computed 和 action 才读取对方状态。</p>
    </header>

    <section class="status-panel" aria-label="组合结果">
      <div>
        <span>跨 Store computed</span>
        <strong data-testid="composition-summary">{{ visibleSummary }}</strong>
      </div>
      <div>
        <span>延迟读取</span>
        <strong data-testid="composition-read-phase">{{ readPhase }}</strong>
      </div>
      <div>
        <span>实例归属</span>
        <strong data-testid="composition-instance">{{ instanceResult }}</strong>
      </div>
    </section>

    <div class="actions" aria-label="组合实验操作">
      <button type="button" @click="addProduct">加入商品</button>
      <button type="button" @click="toggleMember">
        切换为{{ session.name === '访客' ? '会员' : '访客' }}
      </button>
      <button type="button" @click="inspectCartFromAction">Action 读取购物车</button>
      <button type="button" @click="resetDemo">重置实验</button>
    </div>

    <section class="timeline-panel" aria-labelledby="composition-timeline-title">
      <h4 id="composition-timeline-title">读取阶段</h4>
      <ol>
        <li v-for="event in timeline" :key="event">{{ event }}</li>
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
.timeline-panel h4 {
  margin: 0;
}

.eyebrow {
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
  line-height: 1.6;
}

.status-panel {
  display: flex;
  flex-wrap: wrap;
  margin-top: 18px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-bg-sunken);
}

.status-panel > div {
  flex: 1 1 190px;
  min-width: 0;
  padding: 14px;
}

.status-panel span,
.status-panel strong {
  display: block;
}

.status-panel span {
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
}

.status-panel strong {
  margin-top: 5px;
  overflow-wrap: anywhere;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  margin-top: 14px;
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

.timeline-panel {
  margin-top: 14px;
  padding: 14px;
  border-left: 3px solid var(--color-accent);
  background: var(--color-bg-sunken);
}

.timeline-panel ol {
  margin: 10px 0 0;
  padding-left: 22px;
}

.timeline-panel li + li {
  margin-top: 6px;
}

@media (max-width: 520px) {
  .pinia-demo {
    padding: 14px;
  }

  .status-panel > div {
    flex-basis: 100%;
  }
}
</style>
