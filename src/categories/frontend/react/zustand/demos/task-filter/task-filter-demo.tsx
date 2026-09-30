import { create } from 'zustand'
import { type ComponentType, useState } from 'react'

import './task-filter-demo.css'

type FilterStatus = 'all' | 'open' | 'done'

type FilterState = {
  status: FilterStatus
  keyword: string
}

type FilterActions = {
  setStatus: (status: FilterStatus) => void
  setKeyword: (keyword: string) => void
  reset: () => void
}

type FilterStore = FilterState & FilterActions

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

const initialFilterState: FilterState = {
  status: 'all',
  keyword: '',
}

const useFilterStore = create<FilterStore>()((set) => ({
  ...initialFilterState,
  /** 写入状态筛选。 */
  setStatus: (status) => set({ status }),
  /** 写入关键词筛选。 */
  setKeyword: (keyword) => set({ keyword }),
  /** 恢复演示用的筛选条件。 */
  reset: () => set(initialFilterState),
}))

/** 按当前筛选条件从只读目录派生可见任务。 */
function filterCatalog(status: FilterStatus, keyword: string): CatalogTask[] {
  return catalogTasks.filter((task) => {
    const matchKeyword = task.title.includes(keyword)
    const matchStatus = status === 'all' || task.status === status
    return matchKeyword && matchStatus
  })
}

/** 帮助开合留在组件内。 */
function HelpToggle() {
  const [open, setOpen] = useState(false)

  return (
    <section className="task-filter-panel" data-testid="help-panel">
      <span>组件 State</span>
      <button type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        {open ? '收起帮助' : '打开帮助'}
      </button>
      <p data-testid="help-copy">
        {open ? '帮助不进 Store，重置筛选也不会关掉它。' : '帮助已收起'}
      </p>
    </section>
  )
}

/** 只选择状态筛选，展示顶栏摘要。 */
function StatusSummary() {
  const status = useFilterStore((state) => state.status)
  const label = status === 'open' ? '未完成' : status === 'done' ? '已完成' : '全部'

  return (
    <article className="task-filter-panel" data-testid="status-summary">
      <span>选择 status</span>
      <strong data-testid="filter-status">{label}</strong>
    </article>
  )
}

/** 只负责编辑关键词。 */
function KeywordEditor() {
  const keyword = useFilterStore((state) => state.keyword)
  const setKeyword = useFilterStore((state) => state.setKeyword)

  return (
    <label className="task-filter-field">
      <span>选择 keyword</span>
      <input
        value={keyword}
        aria-label="筛选关键词"
        onChange={(event) => setKeyword(event.target.value)}
      />
    </label>
  )
}

/** 只负责切换状态筛选。 */
function StatusButtons() {
  const status = useFilterStore((state) => state.status)
  const setStatus = useFilterStore((state) => state.setStatus)

  return (
    <div className="task-filter-actions">
      <button type="button" aria-pressed={status === 'all'} onClick={() => setStatus('all')}>
        全部
      </button>
      <button type="button" aria-pressed={status === 'open'} onClick={() => setStatus('open')}>
        未完成
      </button>
      <button type="button" aria-pressed={status === 'done'} onClick={() => setStatus('done')}>
        已完成
      </button>
    </div>
  )
}

/** 选择筛选字段后派生可见任务。 */
function TaskResults() {
  const status = useFilterStore((state) => state.status)
  const keyword = useFilterStore((state) => state.keyword)
  const visibleTasks = filterCatalog(status, keyword)

  return (
    <section className="task-filter-panel task-filter-results" data-testid="task-results">
      <span>渲染时派生</span>
      <strong data-testid="visible-count">{visibleTasks.length} 条可见</strong>
      <ul>
        {visibleTasks.map((task) => (
          <li key={task.id}>{task.title}</li>
        ))}
      </ul>
    </section>
  )
}

/** 展示筛选 State、Action、选择函数和可见结果。 */
function TaskFilterDemo() {
  const reset = useFilterStore((state) => state.reset)

  return (
    <section className="task-filter-demo" data-testid="task-filter-demo">
      <header className="task-filter-heading">
        <p>任务筛选器</p>
        <h2>Store 保存条件，列表在渲染时过滤</h2>
        <span>只读目录不进 Store；顶栏和列表通过选择函数读取同一份筛选条件。</span>
      </header>

      <div className="task-filter-panels">
        <HelpToggle />
        <StatusSummary />
      </div>

      <div className="task-filter-controls">
        <KeywordEditor />
        <StatusButtons />
        <button type="button" onClick={reset}>
          重置筛选
        </button>
      </div>

      <TaskResults />
    </section>
  )
}

/** 为 React Demo 宿主提供任务筛选器观察组件。 */
export function createTaskFilterDemo(): ComponentType {
  return TaskFilterDemo
}
