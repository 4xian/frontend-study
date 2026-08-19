import type { Task } from './task-data'

type TaskRowProps = {
  task: Task
  isEditing: boolean
  editingDraft: string
  canSave: boolean
  onEditingDraftChange: (value: string) => void
  onStartEditing: (task: Task) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onToggle: (taskId: number) => void
  onRemove: (taskId: number) => void
}

type TaskListProps = Omit<TaskRowProps, 'task' | 'isEditing'> & {
  tasks: readonly Task[]
  editingTaskId: number | null
}

/** 展示一条任务，并在阅读状态与行内编辑状态之间切换。 */
function TaskRow({
  task,
  isEditing,
  editingDraft,
  canSave,
  onEditingDraftChange,
  onStartEditing,
  onSaveEdit,
  onCancelEdit,
  onToggle,
  onRemove,
}: TaskRowProps) {
  /** 把当前任务交给清单拥有者开始编辑。 */
  function handleStartEditing() {
    onStartEditing(task)
  }

  /** 切换当前任务的完成状态。 */
  function handleToggle() {
    onToggle(task.id)
  }

  /** 从清单中删除当前任务。 */
  function handleRemove() {
    onRemove(task.id)
  }

  return (
    <li className={task.completed ? 'is-completed' : undefined} data-task-id={task.id}>
      {isEditing ? (
        <div className="task-editor-editing">
          <label>
            <span>编辑任务</span>
            <input
              value={editingDraft}
              onChange={(event) => onEditingDraftChange(event.currentTarget.value)}
            />
            <span className="task-editor-status">
              当前状态：{task.completed ? '已完成' : '未完成'}
            </span>
          </label>
          <div className="task-editor-row-actions">
            <button type="button" data-action="save" disabled={!canSave} onClick={onSaveEdit}>
              保存
            </button>
            <button type="button" data-action="cancel" onClick={onCancelEdit}>
              取消
            </button>
          </div>
        </div>
      ) : (
        <div className="task-editor-task">
          <div className="task-editor-task-copy">
            <span className="task-editor-task-id">任务 {task.id}</span>
            <strong>{task.title}</strong>
            <span className="task-editor-status">{task.completed ? '已完成' : '未完成'}</span>
          </div>
          <div className="task-editor-row-actions">
            <button type="button" data-action="toggle" onClick={handleToggle}>
              {task.completed ? '恢复未完成' : '标记完成'}
            </button>
            <button type="button" data-action="edit" onClick={handleStartEditing}>
              编辑
            </button>
            <button className="is-danger" type="button" data-action="remove" onClick={handleRemove}>
              删除
            </button>
          </div>
        </div>
      )}
    </li>
  )
}

/** 按稳定任务 ID 渲染当前筛选结果，并处理空结果。 */
export function TaskList({ tasks, editingTaskId, ...rowProps }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <p className="task-editor-empty" role="status">
        当前筛选没有任务
      </p>
    )
  }

  return (
    <ul className="task-editor-list">
      {tasks.map((task) => (
        <TaskRow key={task.id} {...rowProps} task={task} isEditing={editingTaskId === task.id} />
      ))}
    </ul>
  )
}
