import { create } from 'zustand'
import { type ComponentType, useRef } from 'react'

import './atomic-selector-demo.css'

type PantryState = {
  nuts: number
  honey: number
  ticks: number
}

type PantryActions = {
  addNut: () => void
  addHoney: () => void
  tick: () => void
  reset: () => void
}

type PantryStore = PantryState & PantryActions

const initialPantryState: PantryState = {
  nuts: 2,
  honey: 1,
  ticks: 0,
}

const usePantryStore = create<PantryStore>()((set) => ({
  ...initialPantryState,
  /** 把坚果数量加一。 */
  addNut: () => set((state) => ({ nuts: state.nuts + 1 })),
  /** 把蜂蜜数量加一。 */
  addHoney: () => set((state) => ({ honey: state.honey + 1 })),
  /** 增加与货架无关的计数，用来观察订阅范围。 */
  tick: () => set((state) => ({ ticks: state.ticks + 1 })),
  /** 恢复演示用的初始库存。 */
  reset: () => set(initialPantryState),
}))

/** 只选择坚果数量，蜂蜜和无关计数变化时不应增加渲染次数。 */
function NutsSubscriber() {
  const nuts = usePantryStore((state) => state.nuts)
  const renderCount = useRef(0)
  renderCount.current += 1

  return (
    <article className="atomic-selector-panel" data-testid="nuts-subscriber">
      <span>原子选择 nuts</span>
      <strong data-testid="atomic-selector-nuts">{nuts}</strong>
      <p>
        渲染次数 <b data-testid="nuts-render-count">{renderCount.current}</b>
      </p>
    </article>
  )
}

/** 只选择蜂蜜数量，坚果和无关计数变化时不应增加渲染次数。 */
function HoneySubscriber() {
  const honey = usePantryStore((state) => state.honey)
  const renderCount = useRef(0)
  renderCount.current += 1

  return (
    <article className="atomic-selector-panel" data-testid="honey-subscriber">
      <span>原子选择 honey</span>
      <strong data-testid="atomic-selector-honey">{honey}</strong>
      <p>
        渲染次数 <b data-testid="honey-render-count">{renderCount.current}</b>
      </p>
    </article>
  )
}

/** 在同一组件里分别选择坚果和蜂蜜，无关计数变化时不应增加渲染次数。 */
function CombinedAtomicSubscriber() {
  const nuts = usePantryStore((state) => state.nuts)
  const honey = usePantryStore((state) => state.honey)
  const renderCount = useRef(0)
  renderCount.current += 1

  return (
    <article className="atomic-selector-panel" data-testid="combined-subscriber">
      <span>两次原子选择</span>
      <strong data-testid="atomic-selector-combined">
        {nuts} / {honey}
      </strong>
      <p>
        渲染次数 <b data-testid="combined-render-count">{renderCount.current}</b>
      </p>
    </article>
  )
}

/** 不传选择函数，任意字段变化都会重渲染。 */
function WholeStoreSubscriber() {
  const pantry = usePantryStore()
  const renderCount = useRef(0)
  renderCount.current += 1

  return (
    <article className="atomic-selector-panel" data-testid="whole-subscriber">
      <span>不传选择函数再解构</span>
      <strong data-testid="atomic-selector-whole">
        {pantry.nuts} / {pantry.honey}
      </strong>
      <p>
        渲染次数 <b data-testid="whole-render-count">{renderCount.current}</b>
      </p>
    </article>
  )
}

/** 只选择加坚果的 Action，避免父组件订阅数量。 */
function AddNutButton() {
  const addNut = usePantryStore((state) => state.addNut)

  return (
    <button type="button" onClick={addNut}>
      增加坚果
    </button>
  )
}

/** 只选择加蜂蜜的 Action。 */
function AddHoneyButton() {
  const addHoney = usePantryStore((state) => state.addHoney)

  return (
    <button type="button" onClick={addHoney}>
      增加蜂蜜
    </button>
  )
}

/** 只选择无关计数，避免父组件订阅 ticks 后带动子面板重渲染。 */
function TicksDisplay() {
  const ticks = usePantryStore((state) => state.ticks)

  return (
    <p className="atomic-selector-ticks" aria-live="polite">
      无关计数 <strong data-testid="atomic-selector-ticks">{ticks}</strong>
    </p>
  )
}

/** 展示原子选择与整份订阅在无关更新下的渲染差异。 */
function AtomicSelectorDemo() {
  const tick = usePantryStore((state) => state.tick)
  const reset = usePantryStore((state) => state.reset)

  return (
    <section className="atomic-selector-demo" data-testid="atomic-selector-demo">
      <header className="atomic-selector-heading">
        <p>Zustand atomic selector</p>
        <h2>一次选择一个已有字段</h2>
        <span>增加无关计数时，只有不传选择函数的面板会增加渲染次数。</span>
      </header>

      <TicksDisplay />

      <div className="atomic-selector-panels">
        <NutsSubscriber />
        <HoneySubscriber />
        <CombinedAtomicSubscriber />
        <WholeStoreSubscriber />
      </div>

      <div className="atomic-selector-actions">
        <AddNutButton />
        <AddHoneyButton />
        <button type="button" onClick={tick}>
          增加无关计数
        </button>
        <button type="button" onClick={reset}>
          重置库存
        </button>
      </div>
    </section>
  )
}

/** 为 React Demo 宿主提供原子 Selector 观察组件。 */
export function createAtomicSelectorDemo(): ComponentType {
  return AtomicSelectorDemo
}
