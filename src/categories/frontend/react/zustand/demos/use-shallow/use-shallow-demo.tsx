import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import { type ComponentType, useRef } from 'react'

import './use-shallow-demo.css'

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
  /** 增加与货架无关的计数。 */
  tick: () => set((state) => ({ ticks: state.ticks + 1 })),
  /** 恢复演示用的初始库存。 */
  reset: () => set(initialPantryState),
}))

/** 用浅比较选取坚果和蜂蜜对象，无关计数变化时不应增加渲染次数。 */
function ShallowObjectSubscriber() {
  const { nuts, honey } = usePantryStore(
    useShallow((state) => ({ nuts: state.nuts, honey: state.honey })),
  )
  const renderCount = useRef(0)
  renderCount.current += 1

  return (
    <article className="use-shallow-panel" data-testid="object-subscriber">
      <span>useShallow 对象选取</span>
      <strong data-testid="use-shallow-object">
        {nuts} / {honey}
      </strong>
      <p>
        渲染次数 <b data-testid="object-render-count">{renderCount.current}</b>
      </p>
    </article>
  )
}

/** 用浅比较选取坚果和蜂蜜数组，无关计数变化时不应增加渲染次数。 */
function ShallowArraySubscriber() {
  const [nuts, honey] = usePantryStore(useShallow((state) => [state.nuts, state.honey]))
  const renderCount = useRef(0)
  renderCount.current += 1

  return (
    <article className="use-shallow-panel" data-testid="array-subscriber">
      <span>useShallow 数组选取</span>
      <strong data-testid="use-shallow-array">
        {nuts} / {honey}
      </strong>
      <p>
        渲染次数 <b data-testid="array-render-count">{renderCount.current}</b>
      </p>
    </article>
  )
}

/** 只选择坚果数量，对照原子选择在无关更新下同样稳定。 */
function NutsSubscriber() {
  const nuts = usePantryStore((state) => state.nuts)
  const renderCount = useRef(0)
  renderCount.current += 1

  return (
    <article className="use-shallow-panel" data-testid="nuts-subscriber">
      <span>原子选择 nuts</span>
      <strong data-testid="use-shallow-nuts">{nuts}</strong>
      <p>
        渲染次数 <b data-testid="nuts-render-count">{renderCount.current}</b>
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
    <article className="use-shallow-panel" data-testid="whole-subscriber">
      <span>不传选择函数</span>
      <strong data-testid="use-shallow-whole">
        {pantry.nuts} / {pantry.honey}
      </strong>
      <p>
        渲染次数 <b data-testid="whole-render-count">{renderCount.current}</b>
      </p>
    </article>
  )
}

/** 只选择加坚果的 Action。 */
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
    <p className="use-shallow-ticks" aria-live="polite">
      无关计数 <strong data-testid="use-shallow-ticks">{ticks}</strong>
    </p>
  )
}

/** 展示 useShallow 选取与整份订阅在无关更新下的渲染差异。 */
function UseShallowDemo() {
  const tick = usePantryStore((state) => state.tick)
  const reset = usePantryStore((state) => state.reset)

  return (
    <section className="use-shallow-demo" data-testid="use-shallow-demo">
      <header className="use-shallow-heading">
        <p>Zustand useShallow</p>
        <h2>浅相等时复用上一次引用</h2>
        <span>增加无关计数时，只有不传选择函数的面板会增加渲染次数。</span>
      </header>

      <TicksDisplay />

      <div className="use-shallow-panels">
        <ShallowObjectSubscriber />
        <ShallowArraySubscriber />
        <NutsSubscriber />
        <WholeStoreSubscriber />
      </div>

      <div className="use-shallow-actions">
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

/** 为 React Demo 宿主提供 useShallow 观察组件。 */
export function createUseShallowDemo(): ComponentType {
  return UseShallowDemo
}
