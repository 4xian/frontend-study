import { useState, type ReactNode, type SubmitEvent } from 'react'
import {
  TASK_FILTERS,
  TASK_FILTER_LABELS,
  TASK_OWNERS,
  TASK_OWNER_LABELS,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  type TaskOwner,
  type TaskStatus,
} from './workspace-model'
import { useWorkspaceDispatch, useWorkspaceState } from './workspace-provider'

/** 保存只服务帮助区的局部展开状态。 */
export function WorkspaceHelp() {
  const [open, setOpen] = useState(false)

  /** 切换帮助内容，不修改共享工作区 State。 */
  function handleToggle() {
    setOpen((current) => !current)
  }

  return (
    <aside className="shared-workspace-help" data-testid="workspace-help">
      <div>
        <strong>工作区说明</strong>
        <span>帮助开关只属于这个区域。</span>
      </div>
      <button type="button" aria-expanded={open} onClick={handleToggle}>
        {open ? '收起帮助' : '展开帮助'}
      </button>
      {open && (
        <p data-testid="workspace-help-content">
          任务汇总、筛选、列表和详情共享同一份任务 State；输入草稿仍由表单自己保存。
        </p>
      )}
    </aside>
  )
}

/** 只组织工作区 children，不接收或转交业务 State。 */
export function WorkspaceShell({ children }: { children: ReactNode }) {
  return <div className="shared-workspace-shell">{children}</div>
}

/** 从当前任务数组派生并展示工作区汇总。 */
export function WorkspaceSummary() {
  const { tasks } = useWorkspaceState()
  const doingCount = tasks.filter((task) => task.status === 'doing').length
  const doneCount = tasks.filter((task) => task.status === 'done').length

  return (
    <section className="shared-workspace-summary" aria-label="任务汇总" aria-live="polite">
      <div>
        <span>任务总数</span>
        <strong data-testid="workspace-total">{tasks.length}</strong>
      </div>
      <div>
        <span>进行中</span>
        <strong data-testid="workspace-doing">{doingCount}</strong>
      </div>
      <div>
        <span>已完成</span>
        <strong data-testid="workspace-done">{doneCount}</strong>
      </div>
    </section>
  )
}

/** 保存未提交草稿，并把有效提交转换为添加任务 Action。 */
export function TaskComposer() {
  const dispatch = useWorkspaceDispatch()
  const [title, setTitle] = useState('')
  const [owner, setOwner] = useState<TaskOwner>('product')
  const canSubmit = title.trim().length > 0

  /** 提交非空标题，并恢复当前表单的局部草稿。 */
  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextTitle = title.trim()
    if (!nextTitle) return

    dispatch({ type: 'task/added', title: nextTitle, owner })
    setTitle('')
    setOwner('product')
  }

  return (
    <form className="shared-workspace-composer" onSubmit={handleSubmit}>
      <div className="shared-workspace-section-heading">
        <div>
          <span>只写组件</span>
          <h3>新增任务</h3>
        </div>
        <p>提交前的标题和负责人只属于这个表单。</p>
      </div>
      <div className="shared-workspace-composer-fields">
        <label>
          <span>任务标题</span>
          <input
            data-testid="workspace-title-input"
            value={title}
            onChange={(event) => setTitle(event.currentTarget.value)}
            placeholder="例如：补充验收清单"
          />
        </label>
        <label>
          <span>负责人</span>
          <select
            data-testid="workspace-owner-select"
            value={owner}
            onChange={(event) => setOwner(event.currentTarget.value as TaskOwner)}
          >
            {TASK_OWNERS.map((ownerName) => (
              <option key={ownerName} value={ownerName}>
                {TASK_OWNER_LABELS[ownerName]}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" data-action="add-task" disabled={!canSubmit}>
          添加任务
        </button>
      </div>
    </form>
  )
}

/** 读取当前筛选并派发明确的筛选 Action。 */
export function TaskFilterBar() {
  const { filter } = useWorkspaceState()
  const dispatch = useWorkspaceDispatch()

  /** 请求工作区切换到指定筛选。 */
  function handleFilter(nextFilter: (typeof TASK_FILTERS)[number]) {
    dispatch({ type: 'filter/changed', filter: nextFilter })
  }

  return (
    <section className="shared-workspace-filter" aria-label="按任务状态筛选">
      <span>显示范围</span>
      <div>
        {TASK_FILTERS.map((filterName) => (
          <button
            key={filterName}
            type="button"
            data-filter={filterName}
            aria-pressed={filter === filterName}
            onClick={() => handleFilter(filterName)}
          >
            {TASK_FILTER_LABELS[filterName]}
          </button>
        ))}
      </div>
    </section>
  )
}

/** 从共享 State 派生可见任务，并派发选择、状态和删除 Action。 */
export function TaskList() {
  const { tasks, filter, selectedTaskId } = useWorkspaceState()
  const dispatch = useWorkspaceDispatch()
  const visibleTasks = filter === 'all' ? tasks : tasks.filter((task) => task.status === filter)

  /** 选择现有任务供详情区域读取。 */
  function handleSelect(taskId: number) {
    dispatch({ type: 'task/selected', taskId })
  }

  /** 请求删除指定任务。 */
  function handleDelete(taskId: number) {
    dispatch({ type: 'task/deleted', taskId })
  }

  /** 请求修改指定任务的业务状态。 */
  function handleStatusChange(taskId: number, status: TaskStatus) {
    dispatch({ type: 'task/statusChanged', taskId, status })
  }

  return (
    <section className="shared-workspace-list-panel" aria-labelledby="workspace-list-title">
      <div className="shared-workspace-section-heading">
        <div>
          <span>共享列表</span>
          <h3 id="workspace-list-title">{TASK_FILTER_LABELS[filter]}任务</h3>
        </div>
        <p>{visibleTasks.length} 条可见结果</p>
      </div>

      {visibleTasks.length === 0 ? (
        <p className="shared-workspace-empty" data-testid="workspace-list-empty">
          当前筛选没有任务。
        </p>
      ) : (
        <ul className="shared-workspace-task-list" data-testid="workspace-task-list">
          {visibleTasks.map((task) => {
            const selected = task.id === selectedTaskId
            return (
              <li key={task.id} data-task-id={task.id} data-selected={selected}>
                <div className="shared-workspace-task-copy">
                  <strong>{task.title}</strong>
                  <span>
                    {TASK_OWNER_LABELS[task.owner]} · {TASK_STATUS_LABELS[task.status]}
                  </span>
                  {selected && <small>当前选中</small>}
                </div>
                <label className="shared-workspace-status-field">
                  <span>状态</span>
                  <select
                    aria-label={`修改任务状态：${task.title}`}
                    value={task.status}
                    onChange={(event) =>
                      handleStatusChange(task.id, event.currentTarget.value as TaskStatus)
                    }
                  >
                    {TASK_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {TASK_STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="shared-workspace-task-actions">
                  <button
                    type="button"
                    data-action="select-task"
                    aria-pressed={selected}
                    onClick={() => handleSelect(task.id)}
                  >
                    {selected ? '已选择' : '查看'}
                  </button>
                  <button
                    className="is-danger"
                    type="button"
                    data-action="delete-task"
                    aria-label={`删除任务：${task.title}`}
                    onClick={() => handleDelete(task.id)}
                  >
                    删除
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

/** 从任务与选中 ID 派生详情，并允许修改当前任务状态。 */
export function TaskDetails() {
  const { tasks, selectedTaskId } = useWorkspaceState()
  const dispatch = useWorkspaceDispatch()
  const selectedTask = tasks.find((task) => task.id === selectedTaskId)

  /** 请求修改当前详情任务的状态。 */
  function handleStatusChange(status: TaskStatus) {
    if (!selectedTask) return
    dispatch({ type: 'task/statusChanged', taskId: selectedTask.id, status })
  }

  return (
    <section className="shared-workspace-details" aria-labelledby="workspace-details-title">
      <div className="shared-workspace-section-heading">
        <div>
          <span>共享详情</span>
          <h3 id="workspace-details-title">任务详情</h3>
        </div>
      </div>

      {!selectedTask ? (
        <p className="shared-workspace-empty" data-testid="workspace-details-empty">
          未选择任务。请从列表中选择一项。
        </p>
      ) : (
        <div className="shared-workspace-details-body" data-testid="workspace-task-details">
          <span>任务 #{selectedTask.id}</span>
          <strong>{selectedTask.title}</strong>
          <dl>
            <div>
              <dt>负责人</dt>
              <dd>{TASK_OWNER_LABELS[selectedTask.owner]}</dd>
            </div>
            <div>
              <dt>当前状态</dt>
              <dd>{TASK_STATUS_LABELS[selectedTask.status]}</dd>
            </div>
          </dl>
          <div className="shared-workspace-details-actions" aria-label="修改当前任务状态">
            {TASK_STATUSES.map((status) => (
              <button
                key={status}
                type="button"
                data-status={status}
                aria-pressed={selectedTask.status === status}
                onClick={() => handleStatusChange(status)}
              >
                {TASK_STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

/** 只取得 dispatch，并请求恢复共享工作区初值。 */
export function RestoreWorkspaceButton() {
  const dispatch = useWorkspaceDispatch()

  /** 派发工作区恢复 Action。 */
  function handleRestore() {
    dispatch({ type: 'workspace/reset' })
  }

  return (
    <footer className="shared-workspace-footer">
      <p>恢复只影响任务、筛选、选择和下一任务 ID。</p>
      <button type="button" data-action="reset-workspace" onClick={handleRestore}>
        恢复示例任务
      </button>
    </footer>
  )
}
