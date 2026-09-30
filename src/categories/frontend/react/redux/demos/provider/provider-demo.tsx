import { configureStore } from '@reduxjs/toolkit'
import { useState, type ComponentType, type ReactElement } from 'react'
import { Provider, ReactReduxContext } from 'react-redux'

import './provider-demo.css'

type DemoState = Readonly<{
  ready: boolean
}>

/** 为 Provider Demo 提供最小 Redux 状态。 */
function demoReducer(state: DemoState = { ready: true }, _action: { type: string }): DemoState {
  return state
}

/** 为 Provider Demo 创建最小且稳定的 Redux store。 */
function createDemoStore() {
  return configureStore({ reducer: demoReducer })
}

const store = createDemoStore()

type StoreProbeProps = {
  expectedStore: typeof store
}

/** 通过低层 Context 观察后代是否位于 Provider 作用域内。 */
function StoreProbe({ expectedStore }: StoreProbeProps): ReactElement {
  return (
    <ReactReduxContext.Consumer>
      {(contextValue) => {
        const isSameStore = contextValue?.store === expectedStore
        return (
          <div className="provider-demo-probe" data-testid="provider-store-probe">
            <span>后代组件取得的 store</span>
            <strong>{isSameStore ? '与入口是同一份' : '未接入 Provider'}</strong>
            <code>{isSameStore ? 'contextValue.store === store' : 'contextValue === null'}</code>
          </div>
        )
      }}
    </ReactReduxContext.Consumer>
  )
}

type ProviderDemoProps = {
  renderCount: number
  onRerender: () => void
}

/** 展示外层 React 重新渲染不会改变 Provider 接入的 store 身份。 */
function ProviderDemo({ renderCount, onRerender }: ProviderDemoProps): ReactElement {
  return (
    <section className="provider-demo" data-testid="provider-demo">
      <header className="provider-demo-heading">
        <p>React Redux scope</p>
        <h2>Provider 作用域观察器</h2>
        <span>入口创建一份 store，Provider 将它提供给内部后代。</span>
      </header>

      <div className="provider-demo-tree" aria-label="Provider 组件树">
        <div className="provider-demo-node provider-demo-root">
          <span>React 根组件</span>
          <code>Provider store={'{store}'}</code>
        </div>
        <div className="provider-demo-branch" aria-hidden="true">
          <span></span>
        </div>
        <div className="provider-demo-node provider-demo-child">
          <span>Provider children</span>
          <strong>App / StoreProbe</strong>
        </div>
      </div>

      <StoreProbe expectedStore={store} />

      <div className="provider-demo-actions">
        <button type="button" data-testid="provider-rerender" onClick={onRerender}>
          重新渲染外层组件
        </button>
        <span data-testid="provider-render-count">外层渲染 {renderCount} 次</span>
      </div>

      <p className="provider-demo-note">
        store 创建位置：Demo 模块初始化；按钮只触发 React 重新渲染。
      </p>
    </section>
  )
}

/** 为 React Demo 宿主提供带 Provider 的真实组件树。 */
export function createProviderDemo(): ComponentType {
  return ProviderDemoRoot
}

/** 使用模块级 store 建立 Provider Demo 的根级作用域。 */
function ProviderDemoRoot(): ReactElement {
  const [renderCount, setRenderCount] = useState(0)

  return (
    <Provider store={store}>
      <ProviderDemo
        renderCount={renderCount}
        onRerender={() => setRenderCount((count) => count + 1)}
      />
    </Provider>
  )
}
