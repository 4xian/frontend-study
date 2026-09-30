import { configureStore } from '@reduxjs/toolkit'
import { useState, type ComponentType } from 'react'

import './configure-store-demo.css'

type CounterState = Readonly<{
  value: number
}>

type CounterAction = {
  type: string
}

type Transition = Readonly<{
  label: string
  before: number
  after: number
}>

const initialState: CounterState = { value: 2 }

/** 根据旧状态和计数事件返回下一份状态。 */
function counterReducer(state: CounterState = initialState, action: CounterAction): CounterState {
  if (action.type === 'counter/incremented') return { value: state.value + 1 }
  return state
}

/** 使用同一个 reducer 创建一份全新的演示 store。 */
function createCounterStore() {
  return configureStore({ reducer: counterReducer })
}

/** 展示 store 创建、dispatch 前后读取与重新创建行为。 */
function ConfigureStoreDemo() {
  const [store, setStore] = useState(createCounterStore)
  const [snapshot, setSnapshot] = useState(() => store.getState())
  const [transition, setTransition] = useState<Transition>({
    label: 'store 刚创建',
    before: initialState.value,
    after: store.getState().value,
  })

  /** Dispatch 一次事件并在前后读取同一份 store。 */
  function handleIncrement(): void {
    const before = store.getState().value
    store.dispatch({ type: 'counter/incremented' })
    const after = store.getState().value

    setSnapshot(store.getState())
    setTransition({ label: 'dispatch(counter/incremented)', before, after })
  }

  /** 创建新 store 并恢复 reducer 提供的默认状态。 */
  function handleRecreate(): void {
    const nextStore = createCounterStore()
    const nextSnapshot = nextStore.getState()

    setStore(nextStore)
    setSnapshot(nextSnapshot)
    setTransition({
      label: '重新创建 store',
      before: store.getState().value,
      after: nextSnapshot.value,
    })
  }

  return (
    <section className="configure-store-demo" data-testid="configure-store-demo">
      <header className="configure-store-heading">
        <p>Redux store setup</p>
        <h2>configureStore 状态观察器</h2>
        <span>一个 reducer，一份 store，一条可重复观察的状态轨迹。</span>
      </header>

      <section className="configure-store-setup" aria-labelledby="configure-store-setup-title">
        <div>
          <span>创建入口</span>
          <strong id="configure-store-setup-title">configureStore</strong>
        </div>
        <code>{'configureStore({ reducer: counterReducer })'}</code>
      </section>

      <div className="configure-store-states">
        <section aria-labelledby="configure-store-default-title">
          <span id="configure-store-default-title">reducer 默认状态</span>
          <strong data-testid="configure-store-default-value">{initialState.value}</strong>
          <small>每个新 store 的起点</small>
        </section>
        <section aria-labelledby="configure-store-current-title">
          <span id="configure-store-current-title">store 当前状态</span>
          <strong data-testid="configure-store-current-value">{snapshot.value}</strong>
          <small>来自 store.getState()</small>
        </section>
      </div>

      <section className="configure-store-transition" aria-live="polite">
        <div className="configure-store-transition-heading">
          <span>最近一次轨迹</span>
          <strong data-testid="configure-store-transition-label">{transition.label}</strong>
        </div>
        <div className="configure-store-transition-values">
          <div>
            <span>读取 before</span>
            <strong data-testid="configure-store-before-value">{transition.before}</strong>
          </div>
          <span aria-hidden="true">→</span>
          <div>
            <span>读取 after</span>
            <strong data-testid="configure-store-after-value">{transition.after}</strong>
          </div>
        </div>
      </section>

      <div className="configure-store-actions">
        <button type="button" data-testid="configure-store-increment" onClick={handleIncrement}>
          Dispatch +1
        </button>
        <button type="button" data-testid="configure-store-recreate" onClick={handleRecreate}>
          重新创建 store
        </button>
      </div>
    </section>
  )
}

/** 为 React Demo 宿主提供 configureStore 观察组件。 */
export function createConfigureStoreDemo(): ComponentType {
  return ConfigureStoreDemo
}
