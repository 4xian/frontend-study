<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { createPinia, defineStore, disposePinia } from 'pinia'
import { preserveActivePinia } from '../preserve-active-pinia'

interface GetterSnapshot {
  label: string
  subtotal: number
  total: number
  subtotalRuns: number
  totalRuns: number
  subtotalDelta: number
  totalDelta: number
}

let subtotalRunCount = 0
let totalRunCount = 0

const useTaxStore = defineStore('pinia-p01-tax-settings', {
  /** 创建跨 Store getter 使用的税率状态。 */
  state: () => ({ rate: 10 }),
})

const usePricingStore = defineStore('pinia-p01-getter-dependencies', {
  /** 创建价格、数量与无关备注状态。 */
  state: () => ({ price: 80, quantity: 2, note: '初始备注' }),
  getters: {
    /** 计算当前商品小计，并为教学仪表累计求值次数。 */
    subtotal(state): number {
      subtotalRunCount++
      return state.price * state.quantity
    },
    /** 读取同 Store getter 与另一个 Store 的税率。 */
    totalWithTax(): number {
      totalRunCount++
      const taxStore = useTaxStore()
      return this.subtotal * (1 + taxStore.rate / 100)
    },
  },
})

const pinia = createPinia()
const taxStore = preserveActivePinia(() => useTaxStore(pinia))
const pricingStore = preserveActivePinia(() => usePricingStore(pinia))
const snapshot = ref<GetterSnapshot>({
  label: '尚未读取',
  subtotal: 0,
  total: 0,
  subtotalRuns: 0,
  totalRuns: 0,
  subtotalDelta: 0,
  totalDelta: 0,
})
const timeline = ref<string[]>([])
let noteVersion = 0
let eventNumber = 0

/** 追加稳定序号记录，并只保留最近七条。 */
function appendEvent(message: string): void {
  eventNumber++
  timeline.value = [
    ...timeline.value,
    `${String(eventNumber).padStart(2, '0')} · ${message}`,
  ].slice(-7)
}

/** 连续读取两次 getter，并记录本轮真实求值增量。 */
function captureGetters(label: string): void {
  const subtotalBefore = subtotalRunCount
  const totalBefore = totalRunCount
  const { subtotal, total } = preserveActivePinia(() => {
    const currentSubtotal = pricingStore.subtotal
    const currentTotal = pricingStore.totalWithTax

    void pricingStore.subtotal
    void pricingStore.totalWithTax
    return { subtotal: currentSubtotal, total: currentTotal }
  })
  snapshot.value = {
    label,
    subtotal,
    total,
    subtotalRuns: subtotalRunCount,
    totalRuns: totalRunCount,
    subtotalDelta: subtotalRunCount - subtotalBefore,
    totalDelta: totalRunCount - totalBefore,
  }
  appendEvent(
    `${label}：subtotal +${snapshot.value.subtotalDelta}，total +${snapshot.value.totalDelta}`,
  )
}

/** 不改依赖，直接重复读取当前两个 getter。 */
function readAgain(): void {
  captureGetters('重复读取，无 state 变化')
}

/** 修改 getter 未读取的备注，再立即读取。 */
function changeUnrelatedNote(): void {
  noteVersion++
  pricingStore.note = `无关备注 ${noteVersion}`
  captureGetters('修改无关 note 后读取')
}

/** 修改小计依赖的价格，再立即读取。 */
function increasePrice(): void {
  pricingStore.price += 10
  captureGetters('修改相关 price 后读取')
}

/** 修改另一个 Store 的税率，再立即读取。 */
function increaseTaxRate(): void {
  taxStore.rate += 1
  captureGetters('修改跨 Store rate 后读取')
}

/** 恢复两个 Store 的基线并重新读取。 */
function resetDemo(): void {
  pricingStore.$reset()
  taxStore.$reset()
  noteVersion = 0
  captureGetters('Reset 后读取')
}

captureGetters('首次读取')

onBeforeUnmount(() => preserveActivePinia(() => disposePinia(pinia)))
</script>

<template>
  <article class="pinia-demo">
    <header class="demo-header">
      <div>
        <p class="eyebrow">Getter 依赖实验</p>
        <h3>用运行次数观察缓存</h3>
        <p>每个操作最后都连续读取两次；同一轮的第二次读取应复用缓存。</p>
      </div>
      <button type="button" @click="resetDemo">恢复基线</button>
    </header>

    <section class="source-panel" aria-label="Getter 源状态">
      <div>
        <span>price</span>
        <strong>{{ pricingStore.price }}</strong>
      </div>
      <div>
        <span>quantity</span>
        <strong>{{ pricingStore.quantity }}</strong>
      </div>
      <div>
        <span>tax.rate</span>
        <strong>{{ taxStore.rate }}%</strong>
      </div>
      <div>
        <span>无关 note</span>
        <strong>{{ pricingStore.note }}</strong>
      </div>
    </section>

    <section class="control-section" aria-labelledby="pinia-getter-actions-title">
      <div class="section-heading">
        <p>01</p>
        <h4 id="pinia-getter-actions-title">改变一次依赖条件</h4>
      </div>
      <div class="actions">
        <button type="button" @click="readAgain">只重复读取</button>
        <button type="button" @click="changeUnrelatedNote">修改无关备注</button>
        <button type="button" @click="increasePrice">价格 +10</button>
        <button type="button" @click="increaseTaxRate">税率 +1%</button>
      </div>
    </section>

    <section class="result-section" aria-labelledby="pinia-getter-result-title">
      <div class="section-heading">
        <p>02</p>
        <h4 id="pinia-getter-result-title">{{ snapshot.label }}</h4>
      </div>
      <div class="result-value">
        <div>
          <span>subtotal</span>
          <strong>{{ snapshot.subtotal.toFixed(2) }}</strong>
        </div>
        <div>
          <span>totalWithTax</span>
          <strong>{{ snapshot.total.toFixed(2) }}</strong>
        </div>
      </div>
      <dl class="run-list" aria-live="polite">
        <div>
          <dt>subtotal 总运行</dt>
          <dd>{{ snapshot.subtotalRuns }}（本轮 +{{ snapshot.subtotalDelta }}）</dd>
        </div>
        <div>
          <dt>total 总运行</dt>
          <dd>{{ snapshot.totalRuns }}（本轮 +{{ snapshot.totalDelta }}）</dd>
        </div>
      </dl>
      <p class="instrument-note">
        运行计数仅是教学打点。业务 getter 必须保持纯计算，不应修改外部状态。
      </p>
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
  flex: 1 1 430px;
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
.instrument-note {
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

.source-panel {
  display: flex;
  align-items: stretch;
  flex-wrap: wrap;
  padding: 14px 8px 2px;
  border-bottom: 1px solid var(--color-border);
}

.source-panel > div {
  flex: 1 1 150px;
  min-width: 0;
  padding: 0 12px 12px;
}

.source-panel span,
.result-value span,
.run-list dt {
  display: block;
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
}

.source-panel strong {
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

.result-value,
.run-list {
  display: flex;
  align-items: stretch;
  flex-wrap: wrap;
  margin-right: -12px;
}

.result-value > div,
.run-list > div {
  flex: 1 1 210px;
  min-width: 0;
  margin-right: 12px;
  margin-bottom: 12px;
}

.result-value strong {
  display: block;
  margin-top: 4px;
  color: var(--color-text-primary);
  font-size: var(--font-size-xl);
}

.run-list {
  margin-top: 8px;
}

.run-list > div {
  padding: 10px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
}

.run-list dd {
  margin-top: 4px;
  color: var(--color-text-primary);
  font-weight: 600;
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
