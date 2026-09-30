import { useState, type ComponentType, type ReactElement } from 'react'
import { Provider } from 'react-redux'

import {
  counterSlice,
  createMultipleSlicesStore,
  preferencesSlice,
} from './multiple-slices-root-state-store'
import { useAppDispatch, useAppSelector } from './multiple-slices-root-state-hooks'
import type { RootState } from './multiple-slices-root-state-store'

import './multiple-slices-root-state-demo.css'

/** 读取 counter slice 的计数值。 */
const selectCounterValue = (state: RootState) => state.counter.value

/** 读取 preferences slice 的主题值。 */
const selectTheme = (state: RootState) => state.preferences.theme

/** 显示多个 slice 在 RootState 中的独立分支。 */
function MultipleSlicesPanel(): ReactElement {
  const counterValue = useAppSelector(selectCounterValue)
  const theme = useAppSelector(selectTheme)
  const dispatch = useAppDispatch()

  /** 派发 counter slice 的增加 action。 */
  function increment(): void {
    dispatch(counterSlice.actions.incremented())
  }

  /** 派发 preferences slice 的切换 action。 */
  function toggleTheme(): void {
    dispatch(preferencesSlice.actions.themeToggled())
  }

  /** 分别派发两个 slice 的恢复 action。 */
  function resetAll(): void {
    dispatch(counterSlice.actions.reset())
    dispatch(preferencesSlice.actions.reset())
  }

  return (
    <section className="multiple-slices-demo" data-testid="multiple-slices-demo">
      <header className="multiple-slices-heading">
        <p>Redux Toolkit + TypeScript</p>
        <h2>多 Slice 状态树观察器</h2>
        <span>两个 slice 通过 reducer 对象组成同一个 RootState。</span>
      </header>

      <section className="multiple-slices-state" aria-live="polite">
        <div className="multiple-slices-branch">
          <strong>state.counter.value</strong>
          <b data-testid="multiple-slices-counter">{counterValue}</b>
        </div>
        <div className="multiple-slices-branch">
          <strong>state.preferences.theme</strong>
          <b data-testid="multiple-slices-theme">{theme}</b>
        </div>
      </section>

      <div className="multiple-slices-tree" aria-label="RootState 状态树">
        <code>{`RootState { counter: { value: ${counterValue} }, preferences: { theme: '${theme}' } }`}</code>
      </div>

      <div className="multiple-slices-controls">
        <button type="button" data-testid="multiple-slices-increment" onClick={increment}>
          增加计数
        </button>
        <button type="button" data-testid="multiple-slices-toggle-theme" onClick={toggleTheme}>
          切换主题
        </button>
        <button type="button" data-testid="multiple-slices-reset" onClick={resetAll}>
          恢复初始状态
        </button>
      </div>
    </section>
  )
}

/** 为 Demo 创建稳定 store，并把面板放入 Provider。 */
function MultipleSlicesDemoRoot(): ReactElement {
  const [store] = useState(createMultipleSlicesStore)
  return (
    <Provider store={store}>
      <MultipleSlicesPanel />
    </Provider>
  )
}

/** 为 React Demo 注册多 Slice 与 RootState 组件。 */
export function createMultipleSlicesRootStateDemo(): ComponentType {
  return MultipleSlicesDemoRoot
}
