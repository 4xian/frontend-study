import { useState, type ComponentType, type ReactElement } from 'react'
import { Provider } from 'react-redux'

import { createFeatureFolderStore } from './app/store'
import { TasksPanel } from './features/tasks/TasksPanel'

import './feature-folder-demo.css'

const architectureFiles = [
  {
    path: 'app/store.ts',
    responsibility: '组合各 Feature reducer，并导出 store 类型',
  },
  {
    path: 'app/hooks.ts',
    responsibility: '集中导出预类型 useAppDispatch 与 useAppSelector',
  },
  {
    path: 'features/tasks/tasksSlice.ts',
    responsibility: '维护任务 state、reducer、action 与 selector',
  },
  {
    path: 'features/tasks/TasksPanel.tsx',
    responsibility: '呈现任务 Feature，并通过公共 Redux 接口读写状态',
  },
] as const

/** 显示 Feature 目录职责以及真实运行的任务模块。 */
function FeatureFolderWorkspace(): ReactElement {
  return (
    <section className="feature-folder-demo" data-testid="feature-folder-demo">
      <header className="feature-folder-heading">
        <p>Redux Feature Folder</p>
        <h2>按业务能力组织模块</h2>
        <span>目录负责定位代码，运行时仍由 store、Provider、selector 和 dispatch 串联。</span>
      </header>

      <section className="feature-folder-map" aria-label="目录职责">
        <div className="feature-folder-section-heading">
          <span>文件职责</span>
          <strong>app 组合 · feature 内聚</strong>
        </div>
        <ol>
          {architectureFiles.map((file) => (
            <li key={file.path}>
              <code>{file.path}</code>
              <span>{file.responsibility}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className="feature-folder-flow" aria-label="模块关系">
        <div>
          <span>装配依赖</span>
          <code>app/store.ts</code>
          <span aria-hidden="true">-&gt;</span>
          <code>features/tasks/tasksSlice.ts</code>
        </div>
        <div>
          <span>组件使用</span>
          <code>features/tasks/TasksPanel.tsx</code>
          <span aria-hidden="true">-&gt;</span>
          <code>app/hooks.ts</code>
          <span aria-hidden="true">、</span>
          <code>tasksSlice.ts</code>
        </div>
      </div>

      <TasksPanel />
    </section>
  )
}

/** 为每次挂载创建独立 store，并提供 React Redux 上下文。 */
function FeatureFolderDemoRoot(): ReactElement {
  const [store] = useState(createFeatureFolderStore)
  return (
    <Provider store={store}>
      <FeatureFolderWorkspace />
    </Provider>
  )
}

/** 为 React Demo 宿主注册 Feature 目录组织组件。 */
export function createFeatureFolderDemo(): ComponentType {
  return FeatureFolderDemoRoot
}
