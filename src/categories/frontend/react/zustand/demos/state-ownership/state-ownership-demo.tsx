import { create } from 'zustand'
import { type ComponentType, useState } from 'react'

import './state-ownership-demo.css'

type FilterStatus = 'all' | 'open'

type WorkspaceState = {
  status: FilterStatus
}

type WorkspaceActions = {
  setStatus: (status: FilterStatus) => void
  reset: () => void
}

type WorkspaceStore = WorkspaceState & WorkspaceActions

type CatalogTask = {
  id: string
  title: string
  status: 'open' | 'done'
}

const catalogTasks: CatalogTask[] = [
  { id: 'task-1', title: '整理课堂笔记', status: 'open' },
  { id: 'task-2', title: '提交类型练习', status: 'done' },
  { id: 'task-3', title: '核对筛选条件', status: 'open' },
]

const initialWorkspaceState: WorkspaceState = {
  status: 'all',
}

const useWorkspaceStore = create<WorkspaceStore>()((set) => ({
  ...initialWorkspaceState,
  /** 写入工作区共享的状态筛选。 */
  setStatus: (status) => set({ status }),
  /** 恢复演示用的筛选条件。 */
  reset: () => set(initialWorkspaceState),
}))

/** 帮助开合只留在当前组件，不写入 Store。 */
function HelpPanel() {
  const [open, setOpen] = useState(false)

  return (
    <section className="ownership-panel" data-testid="help-panel">
      <span>组件 State</span>
      <button type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        {open ? '收起帮助' : '打开帮助'}
      </button>
      <p data-testid="help-copy">
        {open ? '帮助说明只存在这个按钮里，不会进入 Zustand。' : '帮助已收起'}
      </p>
    </section>
  )
}

/** 模拟地址栏查询，不把关键词写入 Store。 */
function AddressBar({
  keyword,
  onKeywordChange,
}: {
  keyword: string
  onKeywordChange: (keyword: string) => void
}) {
  return (
    <label className="ownership-field">
      <span>URL 示意 ?q=</span>
      <input
        value={keyword}
        aria-label="可分享关键词"
        onChange={(event) => onKeywordChange(event.target.value)}
      />
    </label>
  )
}

/** 只选择筛选条件，展示顶栏统计。 */
function StatusSummary() {
  const status = useWorkspaceStore((state) => state.status)

  return (
    <article className="ownership-panel" data-testid="status-summary">
      <span>Zustand status</span>
      <strong data-testid="store-status">{status === 'open' ? '未完成' : '全部'}</strong>
    </article>
  )
}

/** 按 Store 筛选和 URL 关键词派生可见任务，清单本身不进 Store。 */
function TaskResults({ keyword }: { keyword: string }) {
  const status = useWorkspaceStore((state) => state.status)
  const visibleTasks = catalogTasks.filter((task) => {
    const matchKeyword = task.title.includes(keyword)
    const matchStatus = status === 'all' || task.status === status
    return matchKeyword && matchStatus
  })

  return (
    <section className="ownership-panel ownership-results" data-testid="task-results">
      <span>派生列表（只读清单 + 筛选）</span>
      <strong data-testid="visible-count">{visibleTasks.length} 条可见</strong>
      <ul>
        {visibleTasks.map((task) => (
          <li key={task.id}>{task.title}</li>
        ))}
      </ul>
    </section>
  )
}

/** 只负责改写 Store 里的状态筛选。 */
function StatusControls() {
  const status = useWorkspaceStore((state) => state.status)
  const setStatus = useWorkspaceStore((state) => state.setStatus)

  return (
    <div className="ownership-actions">
      <button type="button" aria-pressed={status === 'all'} onClick={() => setStatus('all')}>
        全部
      </button>
      <button type="button" aria-pressed={status === 'open'} onClick={() => setStatus('open')}>
        未完成
      </button>
    </div>
  )
}

/** 对照组件 State、Zustand、URL 示意和只读清单的所有权边界。 */
function StateOwnershipDemo() {
  const [keyword, setKeyword] = useState('')
  const reset = useWorkspaceStore((state) => state.reset)

  return (
    <section className="ownership-demo" data-testid="ownership-demo">
      <header className="ownership-heading">
        <p>状态所有权</p>
        <h2>不是所有值都进入 Zustand</h2>
        <span>帮助留在组件，筛选进入 Store，关键词模拟地址栏，任务清单保持只读派生。</span>
      </header>

      <p className="ownership-url" data-testid="url-preview">
        地址栏示意：?q={keyword || ''}
      </p>

      <div className="ownership-panels">
        <HelpPanel />
        <StatusSummary />
      </div>

      <div className="ownership-controls">
        <AddressBar keyword={keyword} onKeywordChange={setKeyword} />
        <StatusControls />
        <button type="button" onClick={reset}>
          重置筛选
        </button>
      </div>

      <TaskResults keyword={keyword} />
    </section>
  )
}

/** 为 React Demo 宿主提供状态所有权观察组件。 */
export function createStateOwnershipDemo(): ComponentType {
  return StateOwnershipDemo
}
