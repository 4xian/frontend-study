import { create } from 'zustand'
import { type ComponentType } from 'react'

import './first-store-demo.css'

const useWorkspaceStore = create(() => ({
  workspaceName: '内容工作区',
  viewMode: '编辑视图',
}))

/** 展示由 create 创建的 Store 及其初始状态。 */
function FirstStoreDemo() {
  const workspaceName = useWorkspaceStore((state) => state.workspaceName)
  const viewMode = useWorkspaceStore((state) => state.viewMode)

  return (
    <section className="first-store-demo" data-testid="first-store-demo">
      <header className="first-store-heading">
        <p>Zustand first store</p>
        <h2>一份 Store，一组初始状态</h2>
        <span>Store 在组件外创建，组件直接读取创建时声明的状态。</span>
      </header>

      <section className="first-store-setup" aria-labelledby="first-store-setup-title">
        <span>创建入口</span>
        <strong id="first-store-setup-title">create(() =&gt; (&#123; ... &#125;))</strong>
      </section>

      <div className="first-store-values">
        <article>
          <span>workspaceName</span>
          <strong data-testid="first-store-workspace-name">{workspaceName}</strong>
          <small>Store 的初始字段</small>
        </article>
        <article>
          <span>viewMode</span>
          <strong data-testid="first-store-view-mode">{viewMode}</strong>
          <small>同一份 Store 的另一字段</small>
        </article>
      </div>
    </section>
  )
}

/** 为 React Demo 宿主提供第一个 Store 观察组件。 */
export function createFirstStoreDemo(): ComponentType {
  return FirstStoreDemo
}
