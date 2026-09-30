import { create } from 'zustand'
import { type ComponentType } from 'react'

import './state-and-actions-demo.css'

type WorkspaceState = {
  documentTitle: string
  viewMode: string
  isPinned: boolean
}

type WorkspaceActions = {
  renameDocument: (documentTitle: string) => void
  switchView: (viewMode: string) => void
  togglePinned: () => void
  reset: () => void
}

type WorkspaceStore = WorkspaceState & WorkspaceActions

const initialWorkspaceState: WorkspaceState = {
  documentTitle: '未命名文档',
  viewMode: '编辑',
  isPinned: false,
}

const useWorkspaceStore = create<WorkspaceStore>()((set) => ({
  ...initialWorkspaceState,
  /** 用输入值更新文档标题。 */
  renameDocument: (documentTitle: string) => set({ documentTitle }),
  /** 切换工作区当前视图。 */
  switchView: (viewMode: string) => set({ viewMode }),
  /** 翻转文档的置顶状态。 */
  togglePinned: () => set((state) => ({ isPinned: !state.isPinned })),
  /** 恢复演示用的初始工作区。 */
  reset: () => set(initialWorkspaceState),
}))

/** 展示 Store State 与 Action 如何协作的工作区。 */
function StateAndActionsDemo() {
  const documentTitle = useWorkspaceStore((state) => state.documentTitle)
  const viewMode = useWorkspaceStore((state) => state.viewMode)
  const isPinned = useWorkspaceStore((state) => state.isPinned)
  const renameDocument = useWorkspaceStore((state) => state.renameDocument)
  const switchView = useWorkspaceStore((state) => state.switchView)
  const togglePinned = useWorkspaceStore((state) => state.togglePinned)
  const reset = useWorkspaceStore((state) => state.reset)

  return (
    <section className="state-actions-demo" data-testid="state-actions-demo">
      <header className="state-actions-heading">
        <p>Zustand state + action</p>
        <h2>State 记录事实，Action 表达意图</h2>
        <span>组件读取当前 State，并在事件中调用 Store Action。</span>
      </header>

      <div className="state-actions-summary" aria-live="polite">
        <div>
          <span>当前文档</span>
          <strong data-testid="state-actions-title">{documentTitle}</strong>
        </div>
        <div>
          <span>当前视图</span>
          <strong data-testid="state-actions-view">{viewMode}</strong>
        </div>
        <div>
          <span>置顶状态</span>
          <strong data-testid="state-actions-pinned">{isPinned ? '已置顶' : '未置顶'}</strong>
        </div>
      </div>

      <div className="state-actions-controls">
        <label className="state-actions-field">
          <span>renameDocument(title)</span>
          <input
            value={documentTitle}
            aria-label="文档标题"
            onChange={(event) => renameDocument(event.target.value)}
          />
        </label>

        <div className="state-actions-group" aria-label="switchView(viewMode)">
          <span>切换视图</span>
          <div className="state-actions-buttons">
            <button
              type="button"
              aria-pressed={viewMode === '编辑'}
              onClick={() => switchView('编辑')}
            >
              编辑
            </button>
            <button
              type="button"
              aria-pressed={viewMode === '预览'}
              onClick={() => switchView('预览')}
            >
              预览
            </button>
          </div>
        </div>

        <div className="state-actions-group">
          <span>togglePinned()</span>
          <button type="button" onClick={togglePinned}>
            {isPinned ? '取消置顶' : '置顶文档'}
          </button>
        </div>

        <div className="state-actions-group">
          <span>reset()</span>
          <button type="button" onClick={reset}>
            重置工作区
          </button>
        </div>
      </div>
    </section>
  )
}

/** 为 React Demo 宿主提供 State 与 Action 观察组件。 */
export function createStateAndActionsDemo(): ComponentType {
  return StateAndActionsDemo
}
