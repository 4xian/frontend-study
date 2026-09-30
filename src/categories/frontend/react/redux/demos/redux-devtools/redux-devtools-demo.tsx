import { useEffect, useState, type ComponentType, type ReactElement } from 'react'
import { Provider } from 'react-redux'

import {
  countIncremented,
  createDevToolsDemoStore,
  modeToggled,
  reset,
  selectCount,
  selectMode,
  type DevToolsHistoryEntry,
} from './redux-devtools-store'
import { useAppDispatch, useAppSelector } from './redux-devtools-hooks'

import './redux-devtools-demo.css'

const modeLabels = {
  idle: '待机',
  active: '运行中',
} as const

type DevToolsWindow = Window & {
  __REDUX_DEVTOOLS_EXTENSION__?: unknown
}

/** 检测浏览器是否注入 Redux DevTools Extension API。 */
function hasDevToolsExtension(): boolean {
  return (
    typeof window !== 'undefined' && '__REDUX_DEVTOOLS_EXTENSION__' in (window as DevToolsWindow)
  )
}

type DevToolsWorkspaceProps = {
  demoStore: ReturnType<typeof createDevToolsDemoStore>
}

/** 显示当前 Redux 状态、动作历史和选中的状态快照。 */
function DevToolsWorkspace({ demoStore }: DevToolsWorkspaceProps): ReactElement {
  const count = useAppSelector(selectCount)
  const mode = useAppSelector(selectMode)
  const dispatch = useAppDispatch()
  const [history, setHistory] = useState<readonly DevToolsHistoryEntry[]>(demoStore.getHistory())
  const [selectedEntryId, setSelectedEntryId] = useState(0)
  const selectedEntry = history.find((entry) => entry.id === selectedEntryId) ?? history[0]

  useEffect(() => demoStore.subscribeHistory(() => setHistory(demoStore.getHistory())), [demoStore])

  /** Dispatch 一个计数 action。 */
  function increment(): void {
    dispatch(countIncremented())
  }

  /** Dispatch 一个模式切换 action。 */
  function toggleMode(): void {
    dispatch(modeToggled())
  }

  /** Dispatch 一个恢复初始状态 action。 */
  function resetDemo(): void {
    dispatch(reset())
  }

  return (
    <section className="redux-devtools-demo" data-testid="redux-devtools-demo">
      <header className="redux-devtools-heading">
        <p>Redux Toolkit + Redux DevTools</p>
        <h2>动作历史与状态快照</h2>
        <span>当前状态来自 store，历史列表用于观察每次 action 之后的快照。</span>
      </header>

      <section className="redux-devtools-integration" aria-label="DevTools 集成配置">
        <div>
          <span>store 配置</span>
          <strong>configureStore.devTools</strong>
          <code>{`{ name: 'Redux DevTools 课程 Demo', trace: true, maxAge: 20 }`}</code>
        </div>
        <div>
          <span>浏览器扩展</span>
          <strong data-testid="redux-devtools-extension-status">
            {hasDevToolsExtension() ? '已检测到，可打开扩展面板' : '未检测到，store 仍可正常运行'}
          </strong>
        </div>
      </section>

      <section className="redux-devtools-current" aria-live="polite">
        <div>
          <span>当前 Redux 状态</span>
          <strong data-testid="redux-devtools-current-count">count：{count}</strong>
          <small data-testid="redux-devtools-current-mode">mode：{modeLabels[mode]}</small>
        </div>
        <code>{`state.devToolsDemo = { count: ${count}, mode: '${mode}' }`}</code>
      </section>

      <div className="redux-devtools-actions">
        <button type="button" data-testid="redux-devtools-increment" onClick={increment}>
          增加 count
        </button>
        <button type="button" data-testid="redux-devtools-toggle-mode" onClick={toggleMode}>
          切换 mode
        </button>
        <button type="button" data-testid="redux-devtools-reset" onClick={resetDemo}>
          恢复初始状态
        </button>
      </div>

      <section className="redux-devtools-history" aria-label="动作历史">
        <div className="redux-devtools-section-heading">
          <span>本地动作历史镜像</span>
          <strong>{history.length} 条</strong>
        </div>
        <div className="redux-devtools-history-list">
          {history.map((entry) => (
            <button
              key={entry.id}
              type="button"
              data-testid={`redux-devtools-history-${entry.id}`}
              aria-pressed={entry.id === selectedEntryId}
              onClick={() => setSelectedEntryId(entry.id)}
            >
              <span>{entry.actionType}</span>
              <small>
                count {entry.count} · mode {modeLabels[entry.mode]}
              </small>
            </button>
          ))}
        </div>
        <div className="redux-devtools-snapshot" data-testid="redux-devtools-selected-snapshot">
          <span>选中的状态快照</span>
          <strong>{selectedEntry?.actionType ?? '@@INIT'}</strong>
          <code>
            {`{ count: ${selectedEntry?.count ?? 0}, mode: '${selectedEntry?.mode ?? 'idle'}' }`}
          </code>
          <small>选择快照只改变观察视角，不会改写当前 store。</small>
        </div>
      </section>
    </section>
  )
}

/** 为每次宿主挂载创建独立 store，并提供 Provider。 */
function ReduxDevToolsDemoRoot(): ReactElement {
  const [demoStore] = useState(createDevToolsDemoStore)
  return (
    <Provider store={demoStore.store}>
      <DevToolsWorkspace demoStore={demoStore} />
    </Provider>
  )
}

/** 为 React Demo 宿主注册 Redux DevTools 观察组件。 */
export function createReduxDevToolsDemo(): ComponentType {
  return ReduxDevToolsDemoRoot
}
