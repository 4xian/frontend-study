import { create, createStore, useStore, type StateCreator } from 'zustand'
import { type ComponentType } from 'react'

import './zustand-testing-demo.css'

type CounterStore = {
  count: number
  inc: () => void
}

/** 计数 Store 的初始化函数，测试里可以交给 create 或 createStore。 */
const counterStoreCreator: StateCreator<CounterStore> = (set) => ({
  count: 1,
  inc: () => set((state) => ({ count: state.count + 1 })),
})

const useProbeStore = create<CounterStore>()(counterStoreCreator)
const useResetStore = create<CounterStore>()(counterStoreCreator)

/** 按同一份初始化函数新建一份独立 StoreApi。 */
function createCounterStore() {
  return createStore<CounterStore>()(counterStoreCreator)
}

const firstStore = createCounterStore()
const secondStore = createCounterStore()

/** 展示调用 Action 后可以用 getState 读到新计数。 */
function ProbePane() {
  const count = useProbeStore((state) => state.count)

  return (
    <section className="zustand-testing-pane" data-testid="probe-pane">
      <h3>getState 断言</h3>
      <p>
        计数 <strong data-testid="probe-count">{count}</strong>
      </p>
      <button type="button" data-testid="probe-inc" onClick={() => useProbeStore.getState().inc()}>
        增加计数
      </button>
    </section>
  )
}

/** 展示用例结束时用 getInitialState 整份替换。 */
function ResetPane() {
  const count = useResetStore((state) => state.count)

  return (
    <section className="zustand-testing-pane" data-testid="reset-pane">
      <h3>用例间重置</h3>
      <p>
        计数 <strong data-testid="reset-count">{count}</strong>
      </p>
      <button type="button" data-testid="reset-inc" onClick={() => useResetStore.getState().inc()}>
        增加计数
      </button>
      <button
        type="button"
        data-testid="reset-snapshot"
        onClick={() => useResetStore.setState(useResetStore.getInitialState(), true)}
      >
        按初始快照重置
      </button>
    </section>
  )
}

/** 订阅第一份工厂实例的计数。 */
function FirstFactoryCount() {
  const count = useStore(firstStore, (state) => state.count)

  return (
    <p>
      第一份 <strong data-testid="factory-first-count">{count}</strong>
    </p>
  )
}

/** 订阅第二份工厂实例的计数。 */
function SecondFactoryCount() {
  const count = useStore(secondStore, (state) => state.count)

  return (
    <p>
      第二份 <strong data-testid="factory-second-count">{count}</strong>
    </p>
  )
}

/** 展示 createStore 每次调用都是一份独立 api。 */
function FactoryPane() {
  return (
    <section className="zustand-testing-pane" data-testid="factory-pane">
      <h3>工厂实例</h3>
      <FirstFactoryCount />
      <SecondFactoryCount />
      <button
        type="button"
        data-testid="factory-inc-first"
        onClick={() => firstStore.getState().inc()}
      >
        增加第一份
      </button>
    </section>
  )
}

/** 对照 getState 断言、初始快照重置和工厂隔离。 */
function ZustandTestingDemo() {
  return (
    <section className="zustand-testing-demo" data-testid="zustand-testing-demo">
      <header className="zustand-testing-heading">
        <p>Zustand 测试</p>
        <h2>调用 Action 后读 getState，用例结束时整份替换回去</h2>
        <span>
          左侧增加后计数变成 2。中间同样增加，再按初始快照重置回到 1。右侧只增加第一份，第二份仍是
          1。
        </span>
      </header>

      <div className="zustand-testing-panes">
        <ProbePane />
        <ResetPane />
        <FactoryPane />
      </div>
    </section>
  )
}

/** 为 React Demo 宿主提供 Zustand 测试观察组件。 */
export function createZustandTestingDemo(): ComponentType {
  return ZustandTestingDemo
}
