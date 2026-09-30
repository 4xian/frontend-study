import { configureStore, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { useState, type ComponentType, type ReactElement } from 'react'
import { Provider, useDispatch, useSelector } from 'react-redux'

import './use-dispatch-demo.css'

type CounterState = {
  value: number
  lastAction: string
  lastPayload: string
}

const initialCounterState: CounterState = {
  value: 0,
  lastAction: '尚未 dispatch',
  lastPayload: '无',
}

const counterSlice = createSlice({
  name: 'dispatchDemo',
  initialState: initialCounterState,
  reducers: {
    incremented: (state) => {
      state.value += 1
      state.lastAction = 'dispatchDemo/incremented'
      state.lastPayload = '无'
    },
    amountAdded: (state, action: PayloadAction<number>) => {
      state.value += action.payload
      state.lastAction = 'dispatchDemo/amountAdded'
      state.lastPayload = String(action.payload)
    },
    reset: (state) => {
      state.value = 0
      state.lastAction = 'dispatchDemo/reset'
      state.lastPayload = '无'
    },
  },
})

/** 为 useDispatch Demo 创建独立的 Redux store。 */
function createDemoStore() {
  return configureStore({ reducer: counterSlice.reducer })
}

type DemoStore = ReturnType<typeof createDemoStore>
type RootState = ReturnType<DemoStore['getState']>

/** 选择当前计数值。 */
const selectValue = (state: RootState) => state.value

/** 选择最近一次 dispatch 的 action 类型。 */
const selectLastAction = (state: RootState) => state.lastAction

/** 选择最近一次 dispatch 使用的 payload 展示值。 */
const selectLastPayload = (state: RootState) => state.lastPayload

/** 展示 useDispatch 派发后的 Redux 状态。 */
function DispatchPanel(): ReactElement {
  const value = useSelector(selectValue)
  const lastAction = useSelector(selectLastAction)
  const lastPayload = useSelector(selectLastPayload)
  const dispatch = useDispatch()

  /** 派发无 payload 的递增 action。 */
  function increment(): void {
    dispatch(counterSlice.actions.incremented())
  }

  /** 派发带数字 payload 的增量 action。 */
  function addFive(): void {
    dispatch(counterSlice.actions.amountAdded(5))
  }

  /** 派发重置 action。 */
  function reset(): void {
    dispatch(counterSlice.actions.reset())
  }

  return (
    <section className="use-dispatch-demo" data-testid="use-dispatch-demo">
      <header className="use-dispatch-heading">
        <p>React Redux Hooks</p>
        <h2>useDispatch 事件派发观察器</h2>
        <span>事件处理器通过 Provider 中的 dispatch 提交 action，状态再由 useSelector 读取。</span>
      </header>

      <div className="use-dispatch-flow" aria-label="Redux dispatch 数据流">
        <span>事件</span>
        <strong>useDispatch</strong>
        <span>action creator</span>
        <strong>dispatch</strong>
        <span>reducer</span>
      </div>

      <section className="use-dispatch-state" aria-live="polite">
        <div className="use-dispatch-state-heading">
          <span>useSelector(state.value)</span>
          <strong data-testid="use-dispatch-value">{value}</strong>
        </div>
        <div className="use-dispatch-action">
          <div>
            <span>最近一次 action.type</span>
            <code data-testid="use-dispatch-last-action">{lastAction}</code>
          </div>
          <div>
            <span>最近一次 action.payload</span>
            <code data-testid="use-dispatch-last-payload">{lastPayload}</code>
          </div>
        </div>
      </section>

      <div className="use-dispatch-controls">
        <button type="button" data-testid="use-dispatch-increment" onClick={increment}>
          增加 1
        </button>
        <button type="button" data-testid="use-dispatch-add-five" onClick={addFive}>
          增加 5
        </button>
        <button type="button" data-testid="use-dispatch-reset" onClick={reset}>
          重置
        </button>
      </div>
    </section>
  )
}

/** 为 React Demo 提供稳定 store 和 Provider 作用域。 */
function DispatchDemoRoot(): ReactElement {
  const [store] = useState(createDemoStore)
  return (
    <Provider store={store}>
      <DispatchPanel />
    </Provider>
  )
}

/** 为 React Demo 注册 useDispatch 事件派发组件。 */
export function createUseDispatchDemo(): ComponentType {
  return DispatchDemoRoot
}
