import type { ReactElement } from 'react'

import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { selectOpenTaskCount, selectTasks, taskToggled, tasksReset } from './tasksSlice'

/** 显示任务 Feature 的状态和操作入口。 */
export function TasksPanel(): ReactElement {
  const tasks = useAppSelector(selectTasks)
  const openTaskCount = useAppSelector(selectOpenTaskCount)
  const dispatch = useAppDispatch()

  /** 派发任务完成状态切换 action。 */
  function toggleTask(taskId: string): void {
    dispatch(taskToggled(taskId))
  }

  /** 派发任务 Feature 重置 action。 */
  function resetTasks(): void {
    dispatch(tasksReset())
  }

  return (
    <section className="feature-folder-tasks" aria-label="任务 Feature">
      <header>
        <div>
          <span>features/tasks</span>
          <h3>任务面板</h3>
        </div>
        <strong data-testid="feature-folder-open-count">{openTaskCount} 项待完成</strong>
      </header>

      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <button
              type="button"
              data-testid={`feature-folder-task-${task.id}`}
              aria-pressed={task.completed}
              onClick={() => toggleTask(task.id)}
            >
              <span aria-hidden="true">{task.completed ? '已完成' : '待处理'}</span>
              <strong>{task.title}</strong>
            </button>
          </li>
        ))}
      </ul>

      <button
        className="feature-folder-reset"
        type="button"
        data-testid="feature-folder-reset"
        onClick={resetTasks}
      >
        恢复任务状态
      </button>
    </section>
  )
}
