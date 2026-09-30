import type { ReactElement } from 'react'

import { useTaskFilterDispatch, useTaskFilterSelector } from '../../app/hooks'
import {
  filterChanged,
  selectAllTasks,
  selectOpenTaskCount,
  selectTaskFilter,
  selectVisibleTaskCount,
  selectVisibleTasks,
  taskToggled,
  tasksReset,
  type TaskFilter,
} from './tasksSlice'

const filterLabels: Record<TaskFilter, string> = {
  all: '全部',
  open: '待完成',
  completed: '已完成',
}

/** 显示任务筛选面板并串联 selector 与 action。 */
export function TasksPanel(): ReactElement {
  const dispatch = useTaskFilterDispatch()
  const filter = useTaskFilterSelector(selectTaskFilter)
  const tasks = useTaskFilterSelector(selectVisibleTasks)
  const totalCount = useTaskFilterSelector(selectAllTasks).length
  const visibleCount = useTaskFilterSelector(selectVisibleTaskCount)
  const openCount = useTaskFilterSelector(selectOpenTaskCount)

  /** 派发筛选条件变更 action。 */
  function changeFilter(nextFilter: TaskFilter): void {
    dispatch(filterChanged(nextFilter))
  }

  /** 派发任务完成状态切换 action。 */
  function toggleTask(taskId: string): void {
    dispatch(taskToggled(taskId))
  }

  /** 派发重置 action。 */
  function resetPanel(): void {
    dispatch(tasksReset())
  }

  return (
    <section className="task-filter-panel" aria-label="任务筛选面板">
      <header className="task-filter-header">
        <div>
          <span>features/tasks</span>
          <h2>任务筛选面板</h2>
        </div>
        <strong data-testid="task-filter-summary">
          {visibleCount}/{totalCount} 条 · {openCount} 条待完成
        </strong>
      </header>

      <div className="task-filter-controls" role="group" aria-label="任务筛选条件">
        {(Object.keys(filterLabels) as TaskFilter[]).map((option) => (
          <button
            key={option}
            className={option === filter ? 'is-active' : ''}
            type="button"
            aria-pressed={option === filter}
            data-testid={`task-filter-${option}`}
            onClick={() => changeFilter(option)}
          >
            {filterLabels[option]}
          </button>
        ))}
      </div>

      <ul className="task-filter-list">
        {tasks.length === 0 ? (
          <li className="task-filter-empty" data-testid="task-filter-empty">
            当前筛选没有任务
          </li>
        ) : (
          tasks.map((task) => (
            <li key={task.id}>
              <button
                type="button"
                aria-pressed={task.completed}
                data-testid={`task-filter-task-${task.id}`}
                onClick={() => toggleTask(task.id)}
              >
                <span>{task.completed ? '已完成' : '待完成'}</span>
                <strong>{task.title}</strong>
              </button>
            </li>
          ))
        )}
      </ul>

      <button
        className="task-filter-reset"
        type="button"
        data-testid="task-filter-reset"
        onClick={resetPanel}
      >
        恢复初始状态
      </button>
    </section>
  )
}
