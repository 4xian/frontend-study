import { useState } from 'react'
import { TaskComposer } from './task-composer'
import { TaskList } from './task-list'
import { INITIAL_TASKS, type Task, type TaskFilter } from './task-data'
import './lab-task-editor-demo.css'

const filterLabels: Record<TaskFilter, string> = {
  all: '全部',
  active: '未完成',
  completed: '已完成',
}

/** 根据当前筛选返回本次 render 需要展示的任务。 */
function filterTasks(tasks: readonly Task[], filter: TaskFilter): readonly Task[] {
  if (filter === 'active') return tasks.filter((task) => !task.completed)
  if (filter === 'completed') return tasks.filter((task) => task.completed)
  return tasks
}

/** 组合事件、State 与不可变更新，提供完整任务清单编辑流程。 */
export default function LabTaskEditorDemo() {
  const [tasks, setTasks] = useState<readonly Task[]>(INITIAL_TASKS)
  const [draft, setDraft] = useState('')
  const [filter, setFilter] = useState<TaskFilter>('all')
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null)
  const [editingDraft, setEditingDraft] = useState('')
  const [nextTaskId, setNextTaskId] = useState(4)

  const totalCount = tasks.length
  const completedCount = tasks.filter((task) => task.completed).length
  const activeCount = totalCount - completedCount
  const visibleTasks = filterTasks(tasks, filter)
  const canAdd = draft.trim().length > 0
  const canSave = editingDraft.trim().length > 0

  /** 把非空草稿作为新任务追加，并推进稳定 ID。 */
  function handleAdd() {
    const title = draft.trim()
    if (!title) return

    setTasks((previous) => [...previous, { id: nextTaskId, title, completed: false }])
    setNextTaskId((previous) => previous + 1)
    setDraft('')
  }

  /** 只替换目标任务，并反转它的完成状态。 */
  function handleToggle(taskId: number) {
    setTasks((previous) =>
      previous.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)),
    )
  }

  /** 用目标任务的当前标题进入行内编辑。 */
  function handleStartEditing(task: Task) {
    setEditingTaskId(task.id)
    setEditingDraft(task.title)
  }

  /** 保存非空编辑草稿，并保留目标任务的其他字段。 */
  function handleSaveEdit() {
    const title = editingDraft.trim()
    if (editingTaskId === null || !title) return

    setTasks((previous) =>
      previous.map((task) => (task.id === editingTaskId ? { ...task, title } : task)),
    )
    setEditingTaskId(null)
    setEditingDraft('')
  }

  /** 放弃编辑草稿并退出行内编辑。 */
  function handleCancelEdit() {
    setEditingTaskId(null)
    setEditingDraft('')
  }

  /** 删除目标任务，并清理可能指向它的编辑状态。 */
  function handleRemove(taskId: number) {
    setTasks((previous) => previous.filter((task) => task.id !== taskId))
    if (editingTaskId === taskId) {
      setEditingTaskId(null)
      setEditingDraft('')
    }
  }

  /** 切换可见筛选，不修改完整任务数组。 */
  function handleFilter(nextFilter: TaskFilter) {
    setFilter(nextFilter)
  }

  /** 删除全部已完成任务，并退出可能失效的编辑状态。 */
  function handleClearCompleted() {
    setTasks((previous) => previous.filter((task) => !task.completed))
    setEditingTaskId(null)
    setEditingDraft('')
  }

  /** 恢复固定任务、筛选、草稿和下一 ID。 */
  function handleReset() {
    setTasks(INITIAL_TASKS)
    setDraft('')
    setFilter('all')
    setEditingTaskId(null)
    setEditingDraft('')
    setNextTaskId(4)
  }

  return (
    <section className="task-editor-demo" aria-labelledby="task-editor-title">
      <header className="task-editor-heading">
        <p>Task workspace</p>
        <h2 id="task-editor-title">任务清单编辑器</h2>
        <span>
          当前共 {totalCount} 项任务，其中 {activeCount} 项未完成、{completedCount} 项已完成。
        </span>
      </header>

      <TaskComposer draft={draft} canAdd={canAdd} onDraftChange={setDraft} onAdd={handleAdd} />

      <section className="task-editor-controls" aria-label="任务筛选与统计">
        <div className="task-editor-filters">
          {(Object.keys(filterLabels) as TaskFilter[]).map((filterName) => (
            <button
              key={filterName}
              className={filter === filterName ? 'is-active' : undefined}
              type="button"
              data-filter={filterName}
              aria-pressed={filter === filterName}
              onClick={() => handleFilter(filterName)}
            >
              {filterLabels[filterName]}
            </button>
          ))}
        </div>

        <dl className="task-editor-stats" aria-live="polite">
          <div>
            <dt>总计</dt>
            <dd>{totalCount}</dd>
          </div>
          <div>
            <dt>未完成</dt>
            <dd>{activeCount}</dd>
          </div>
          <div>
            <dt>已完成</dt>
            <dd>{completedCount}</dd>
          </div>
        </dl>
      </section>

      <section className="task-editor-results" aria-labelledby="task-editor-results-title">
        <div className="task-editor-results-heading">
          <div>
            <p>当前视图</p>
            <h3 id="task-editor-results-title">{filterLabels[filter]}任务</h3>
          </div>
          <span>
            {visibleTasks.length > 0
              ? visibleTasks.map((task) => task.id).join(' → ')
              : '无可见任务'}
          </span>
        </div>

        <TaskList
          tasks={visibleTasks}
          editingTaskId={editingTaskId}
          editingDraft={editingDraft}
          canSave={canSave}
          onEditingDraftChange={setEditingDraft}
          onStartEditing={handleStartEditing}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={handleCancelEdit}
          onToggle={handleToggle}
          onRemove={handleRemove}
        />
      </section>

      <footer className="task-editor-footer">
        <button
          className="is-danger"
          type="button"
          data-action="clear-completed"
          disabled={completedCount === 0}
          onClick={handleClearCompleted}
        >
          清除已完成
        </button>
        <button type="button" data-action="reset" onClick={handleReset}>
          重置清单
        </button>
      </footer>
    </section>
  )
}
