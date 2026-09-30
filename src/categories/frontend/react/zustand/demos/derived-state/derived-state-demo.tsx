import { create } from 'zustand'
import { type ComponentType, useRef } from 'react'

import './derived-state-demo.css'

type CartItem = {
  name: string
  price: number
  qty: number
}

type CartState = {
  items: CartItem[]
  ticks: number
}

type CartActions = {
  addItem: (item: CartItem) => void
  clear: () => void
  tick: () => void
  reset: () => void
}

type CartStore = CartState & CartActions

const initialItems: CartItem[] = [{ name: '笔记本', price: 10, qty: 1 }]

const useCartStore = create<CartStore>()((set) => ({
  items: initialItems.map((item) => ({ ...item })),
  ticks: 0,
  /** 追加一件商品，换成新的列表引用。 */
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  /** 清空商品列表。 */
  clear: () => set({ items: [] }),
  /** 增加与商品无关的计数。 */
  tick: () => set((state) => ({ ticks: state.ticks + 1 })),
  /** 恢复演示用的初始购物车。 */
  reset: () =>
    set({
      items: initialItems.map((item) => ({ ...item })),
      ticks: 0,
    }),
}))

/** 用选择函数从商品列表派生件数。 */
function ItemCountSubscriber() {
  const itemCount = useCartStore((state) => state.items.length)
  const renderCount = useRef(0)
  renderCount.current += 1

  return (
    <article className="derived-state-panel" data-testid="count-subscriber">
      <span>派生件数</span>
      <strong data-testid="derived-state-count">{itemCount}</strong>
      <p>
        渲染次数 <b data-testid="count-render-count">{renderCount.current}</b>
      </p>
    </article>
  )
}

/** 用选择函数从单价和数量派生合计数字。 */
function TotalSubscriber() {
  const total = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.price * item.qty, 0),
  )
  const renderCount = useRef(0)
  renderCount.current += 1

  return (
    <article className="derived-state-panel" data-testid="total-subscriber">
      <span>派生合计</span>
      <strong data-testid="derived-state-total">{total}</strong>
      <p>
        渲染次数 <b data-testid="total-render-count">{renderCount.current}</b>
      </p>
    </article>
  )
}

/** 派生是否有商品；布尔值没翻转时不应增加渲染次数。 */
function HasItemsSubscriber() {
  const hasItems = useCartStore((state) => state.items.length > 0)
  const renderCount = useRef(0)
  renderCount.current += 1

  return (
    <article className="derived-state-panel" data-testid="has-items-subscriber">
      <span>派生是否有商品</span>
      <strong data-testid="derived-state-has-items">{hasItems ? '有' : '空'}</strong>
      <p>
        渲染次数 <b data-testid="has-items-render-count">{renderCount.current}</b>
      </p>
    </article>
  )
}

/** 不传选择函数，任意字段变化都会重渲染。 */
function WholeStoreSubscriber() {
  const cart = useCartStore()
  const renderCount = useRef(0)
  renderCount.current += 1

  return (
    <article className="derived-state-panel" data-testid="whole-subscriber">
      <span>不传选择函数</span>
      <strong data-testid="derived-state-whole">
        {cart.items.length} / {cart.ticks}
      </strong>
      <p>
        渲染次数 <b data-testid="whole-render-count">{renderCount.current}</b>
      </p>
    </article>
  )
}

/** 只选择追加商品的 Action。 */
function AddItemButton() {
  const addItem = useCartStore((state) => state.addItem)

  return (
    <button type="button" onClick={() => addItem({ name: '贴纸', price: 3, qty: 1 })}>
      追加商品
    </button>
  )
}

/** 只选择清空列表的 Action。 */
function ClearButton() {
  const clear = useCartStore((state) => state.clear)

  return (
    <button type="button" onClick={clear}>
      清空商品
    </button>
  )
}

/** 只选择无关计数，避免父组件订阅 ticks 后带动子面板重渲染。 */
function TicksDisplay() {
  const ticks = useCartStore((state) => state.ticks)

  return (
    <p className="derived-state-ticks" aria-live="polite">
      无关计数 <strong data-testid="derived-state-ticks">{ticks}</strong>
    </p>
  )
}

/** 展示派生数字、布尔值与整份订阅在无关更新下的渲染差异。 */
function DerivedStateDemo() {
  const tick = useCartStore((state) => state.tick)
  const reset = useCartStore((state) => state.reset)

  return (
    <section className="derived-state-demo" data-testid="derived-state-demo">
      <header className="derived-state-heading">
        <p>Zustand derived state</p>
        <h2>从已有字段算出数字和布尔值</h2>
        <span>增加无关计数时，只有不传选择函数的面板会增加渲染次数。</span>
      </header>

      <TicksDisplay />

      <div className="derived-state-panels">
        <ItemCountSubscriber />
        <TotalSubscriber />
        <HasItemsSubscriber />
        <WholeStoreSubscriber />
      </div>

      <div className="derived-state-actions">
        <AddItemButton />
        <ClearButton />
        <button type="button" onClick={tick}>
          增加无关计数
        </button>
        <button type="button" onClick={reset}>
          重置购物车
        </button>
      </div>
    </section>
  )
}

/** 为 React Demo 宿主提供派生状态观察组件。 */
export function createDerivedStateDemo(): ComponentType {
  return DerivedStateDemo
}
