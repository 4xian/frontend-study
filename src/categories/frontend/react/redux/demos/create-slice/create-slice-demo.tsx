import { configureStore, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { useState, type ChangeEvent, type ComponentType, type ReactElement } from 'react'

import './create-slice-demo.css'

type CounterState = Readonly<{
  value: number
}>

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 } satisfies CounterState,
  reducers: {
    increment: (state) => {
      state.value += 1
    },
    decrement: (state) => {
      state.value -= 1
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload
    },
  },
})

type CounterAction =
  | ReturnType<typeof counterSlice.actions.increment>
  | ReturnType<typeof counterSlice.actions.decrement>
  | ReturnType<typeof counterSlice.actions.incrementByAmount>

type LastAction = Readonly<{
  type: string
  payload?: number
}>

/** 使用 createSlice 的 reducer 创建一份独立 Demo store。 */
function createCounterStore() {
  return configureStore({ reducer: counterSlice.reducer })
}

/** 展示 createSlice 自动生成的 action 与 reducer 状态变化。 */
function CreateSliceDemo(): ReactElement {
  const [store] = useState(createCounterStore)
  const [state, setState] = useState(() => store.getState())
  const [amount, setAmount] = useState('5')
  const [lastAction, setLastAction] = useState<LastAction>({ type: '尚未 dispatch' })

  /** Dispatch 一个由 slice.actions 生成的 action，并刷新当前状态快照。 */
  function applyAction(action: CounterAction): void {
    store.dispatch(action)
    setState(store.getState())
    setLastAction(action)
  }

  /** Dispatch 自动生成的 increment action。 */
  function handleIncrement(): void {
    applyAction(counterSlice.actions.increment())
  }

  /** Dispatch 自动生成的 decrement action。 */
  function handleDecrement(): void {
    applyAction(counterSlice.actions.decrement())
  }

  /** 将输入数字交给自动生成的带 payload action creator。 */
  function handleAmountIncrement(): void {
    applyAction(counterSlice.actions.incrementByAmount(Number(amount)))
  }

  /** 更新带 payload 按钮的输入值。 */
  function handleAmountChange(event: ChangeEvent<HTMLInputElement>): void {
    setAmount(event.target.value)
  }

  return (
    <section className="create-slice-demo" data-testid="create-slice-demo">
      <header className="create-slice-heading">
        <p>Redux Toolkit slice</p>
        <h2>createSlice 动作生成器</h2>
        <span>同一份配置同时提供 actions 与 reducer。</span>
      </header>

      <section className="create-slice-config" aria-labelledby="create-slice-config-title">
        <div>
          <span id="create-slice-config-title">slice 配置</span>
          <strong>counter</strong>
        </div>
        <code>name + initialState + reducers</code>
      </section>

      <div className="create-slice-actions-map" aria-label="自动生成的 action type">
        <div>
          <span>increment</span>
          <code>counter/increment</code>
        </div>
        <div>
          <span>decrement</span>
          <code>counter/decrement</code>
        </div>
        <div>
          <span>incrementByAmount</span>
          <code>counter/incrementByAmount</code>
        </div>
      </div>

      <section className="create-slice-state" aria-live="polite">
        <span>store.getState()</span>
        <strong data-testid="create-slice-state-value">{state.value}</strong>
      </section>

      <section className="create-slice-last-action" aria-live="polite">
        <div>
          <span>最近一次 action.type</span>
          <code data-testid="create-slice-last-action-type">{lastAction.type}</code>
        </div>
        <div>
          <span>payload</span>
          <code data-testid="create-slice-last-action-payload">
            {lastAction.payload === undefined ? 'undefined' : lastAction.payload}
          </code>
        </div>
      </section>

      <div className="create-slice-controls">
        <button type="button" data-testid="create-slice-decrement" onClick={handleDecrement}>
          -1
        </button>
        <button type="button" data-testid="create-slice-increment" onClick={handleIncrement}>
          +1
        </button>
        <label>
          <span>payload</span>
          <input
            aria-label="增加数量"
            inputMode="numeric"
            type="number"
            value={amount}
            onChange={handleAmountChange}
          />
        </label>
        <button type="button" data-testid="create-slice-amount" onClick={handleAmountIncrement}>
          按 payload 增加
        </button>
      </div>
    </section>
  )
}

/** 为 React Demo 宿主提供 createSlice 观察组件。 */
export function createCreateSliceDemo(): ComponentType {
  return CreateSliceDemo
}
