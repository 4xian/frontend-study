import { useState, type ComponentType, type ReactElement } from 'react'
import { Provider } from 'react-redux'

import { counterSlice, createTypedHooksStore } from './typed-hooks-store'
import { useAppDispatch, useAppSelector, useAppStore } from './typed-hooks'
import type { RootState } from './typed-hooks-store'

import './typed-hooks-demo.css'

/** 读取计数器当前值。 */
const selectCounterValue = (state: RootState) => state.counter.value

/** 显示使用预类型 Hooks 的计数器组件。 */
function TypedHooksPanel(): ReactElement {
  const value = useAppSelector(selectCounterValue)
  const dispatch = useAppDispatch()
  const store = useAppStore()

  /** 派发增加 action。 */
  function increment(): void {
    dispatch(counterSlice.actions.incremented())
  }

  /** 派发减少 action。 */
  function decrement(): void {
    dispatch(counterSlice.actions.decremented())
  }

  /** 派发重置 action。 */
  function reset(): void {
    dispatch(counterSlice.actions.reset())
  }

  return (
    <section className="typed-hooks-demo" data-testid="typed-hooks-demo">
      <header className="typed-hooks-heading">
        <p>Redux + TypeScript</p>
        <h2>预类型 Hooks 观察器</h2>
        <span>组件直接使用预先绑定 RootState、AppDispatch 和 AppStore 的 Hooks。</span>
      </header>

      <section className="typed-hooks-state" aria-live="polite">
        <div>
          <span>useAppSelector(state =&gt; state.counter.value)</span>
          <strong data-testid="typed-hooks-value">{value}</strong>
        </div>
        <div>
          <span>useAppStore()</span>
          <code data-testid="typed-hooks-store-status">
            {store ? 'Provider store 已连接' : '未连接'}
          </code>
        </div>
      </section>

      <div className="typed-hooks-controls">
        <button type="button" data-testid="typed-hooks-increment" onClick={increment}>
          增加
        </button>
        <button type="button" data-testid="typed-hooks-decrement" onClick={decrement}>
          减少
        </button>
        <button type="button" data-testid="typed-hooks-reset" onClick={reset}>
          重置
        </button>
      </div>
    </section>
  )
}

/** 为预类型 Hooks Demo 创建独立 store 与 Provider 作用域。 */
function TypedHooksDemoRoot(): ReactElement {
  const [store] = useState(createTypedHooksStore)
  return (
    <Provider store={store}>
      <TypedHooksPanel />
    </Provider>
  )
}

/** 为 React Demo 注册 TypeScript 预类型 Hooks 组件。 */
export function createTypedHooksDemo(): ComponentType {
  return TypedHooksDemoRoot
}
