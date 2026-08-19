import { useState } from 'react'
import './immutable-state-updates-demo.css'

type Priority = 1 | 2 | 3

type Task = {
  id: number
  title: string
  done: boolean
  priority: Priority
}

type BoardState = {
  name: string
  preferences: {
    compact: boolean
  }
  tasks: Task[]
}

const initialTasks: readonly Task[] = [
  { id: 1, title: '掌握对象展开', done: true, priority: 2 },
  { id: 2, title: '练习数组更新', done: false, priority: 1 },
  { id: 3, title: '检查共享引用', done: false, priority: 3 },
]

/** 创建包含独立对象和任务数组的初始清单。 */
function createInitialBoard(): BoardState {
  return {
    name: '学习清单',
    preferences: {
      compact: false,
    },
    tasks: initialTasks.map((task) => ({ ...task })),
  }
}

/** 计算下一任务使用的稳定数字 ID。 */
function getNextTaskId(tasks: readonly Task[]): number {
  return tasks.reduce((highest, task) => Math.max(highest, task.id), 0) + 1
}

/** 按优先级和稳定 ID 比较两个任务。 */
function compareTasks(first: Task, second: Task): number {
  return first.priority - second.priority || first.id - second.id
}

/** 展示对象路径和数组操作的不可变更新结果。 */
export default function ImmutableStateUpdatesDemo() {
  const [board, setBoard] = useState<BoardState>(createInitialBoard)

  /** 展开根对象并切换名称，复用偏好和任务分支。 */
  function handleRename() {
    setBoard((previous) => ({
      ...previous,
      name: previous.name === '学习清单' ? '不可变清单' : '学习清单',
    }))
  }

  /** 沿偏好路径逐层复制并切换列表密度。 */
  function handleToggleCompact() {
    setBoard((previous) => ({
      ...previous,
      preferences: {
        ...previous.preferences,
        compact: !previous.preferences.compact,
      },
    }))
  }

  /** 创建新任务并通过数组展开追加到末尾。 */
  function handleAdd() {
    setBoard((previous) => {
      const nextId = getNextTaskId(previous.tasks)
      return {
        ...previous,
        tasks: [
          ...previous.tasks,
          { id: nextId, title: `新增练习 ${nextId}`, done: false, priority: 2 },
        ],
      }
    })
  }

  /** 使用两段 slice 和展开把新任务插入第二位。 */
  function handleInsert() {
    setBoard((previous) => {
      const nextId = getNextTaskId(previous.tasks)
      const insertAt = Math.min(1, previous.tasks.length)
      const inserted: Task = {
        id: nextId,
        title: `插入练习 ${nextId}`,
        done: false,
        priority: 1,
      }
      return {
        ...previous,
        tasks: [...previous.tasks.slice(0, insertAt), inserted, ...previous.tasks.slice(insertAt)],
      }
    })
  }

  /** 使用 map 创建新数组并只替换第一项任务。 */
  function handleToggleFirst() {
    setBoard((previous) => {
      const firstId = previous.tasks[0]?.id
      if (firstId === undefined) return previous
      return {
        ...previous,
        tasks: previous.tasks.map((task) =>
          task.id === firstId ? { ...task, done: !task.done } : task,
        ),
      }
    })
  }

  /** 使用 filter 保留全部未完成任务。 */
  function handleRemoveCompleted() {
    setBoard((previous) => ({
      ...previous,
      tasks: previous.tasks.filter((task) => !task.done),
    }))
  }

  /** 使用 toSorted 返回按优先级和 ID 排列的新数组。 */
  function handleSort() {
    setBoard((previous) => ({
      ...previous,
      tasks: previous.tasks.toSorted(compareTasks),
    }))
  }

  /** 先复制任务数组，再反转这个未共享的新副本。 */
  function handleReverse() {
    setBoard((previous) => ({
      ...previous,
      tasks: [...previous.tasks].reverse(),
    }))
  }

  /** 创建完整独立的初始对象并重置全部状态。 */
  function handleReset() {
    setBoard(createInitialBoard())
  }

  return (
    <section className="immutable-state-demo" data-testid="immutable-state-demo">
      <header className="immutable-state-heading">
        <p>Immutable state</p>
        <h2>只复制实际变化的路径</h2>
        <span>名称、嵌套偏好和任务数组保存在同一个对象 State 中。</span>
      </header>

      <section className="immutable-state-object" aria-labelledby="immutable-object-title">
        <div className="immutable-state-section-heading">
          <div>
            <p>对象路径</p>
            <h3 id="immutable-object-title">清单设置</h3>
          </div>
          <span data-testid="board-density">
            {board.preferences.compact ? '紧凑密度' : '普通密度'}
          </span>
        </div>

        <dl className="immutable-state-values" aria-live="polite">
          <div>
            <dt>名称</dt>
            <dd data-testid="board-name">{board.name}</dd>
          </div>
          <div>
            <dt>任务总数</dt>
            <dd data-testid="board-count">{board.tasks.length}</dd>
          </div>
        </dl>

        <div className="immutable-state-actions" aria-label="对象 State 更新操作">
          <button type="button" data-action="rename" onClick={handleRename}>
            切换名称
          </button>
          <button type="button" data-action="compact" onClick={handleToggleCompact}>
            切换密度
          </button>
        </div>
      </section>

      <section className="immutable-state-array" aria-labelledby="immutable-array-title">
        <div className="immutable-state-section-heading">
          <div>
            <p>数组路径</p>
            <h3 id="immutable-array-title">任务顺序</h3>
          </div>
          <output data-testid="board-order">
            {board.tasks.map((task) => task.id).join(' → ')}
          </output>
        </div>

        {board.tasks.length > 0 ? (
          <ol
            className={board.preferences.compact ? 'is-compact' : undefined}
            data-testid="board-task-list"
            aria-live="polite"
          >
            {board.tasks.map((task) => (
              <li key={task.id} data-task-id={task.id}>
                <div>
                  <strong>{task.title}</strong>
                  <span>ID {task.id}</span>
                </div>
                <div className="immutable-state-badges">
                  <span>优先级 {task.priority}</span>
                  <span className={task.done ? 'is-done' : 'is-pending'}>
                    {task.done ? '已完成' : '进行中'}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="immutable-state-empty" data-testid="board-empty">
            当前没有任务
          </p>
        )}

        <div className="immutable-state-actions" aria-label="数组 State 更新操作">
          <button type="button" data-action="add" onClick={handleAdd}>
            末尾添加
          </button>
          <button type="button" data-action="insert" onClick={handleInsert}>
            第二位插入
          </button>
          <button
            type="button"
            data-action="toggle-first"
            onClick={handleToggleFirst}
            disabled={board.tasks.length === 0}
          >
            切换首项
          </button>
          <button
            type="button"
            data-action="remove-completed"
            onClick={handleRemoveCompleted}
            disabled={!board.tasks.some((task) => task.done)}
          >
            删除已完成
          </button>
          <button
            type="button"
            data-action="sort"
            onClick={handleSort}
            disabled={board.tasks.length < 2}
          >
            按优先级排序
          </button>
          <button
            type="button"
            data-action="reverse"
            onClick={handleReverse}
            disabled={board.tasks.length < 2}
          >
            反转顺序
          </button>
        </div>
      </section>

      <footer className="immutable-state-footer">
        <p>新根对象负责提交下一 State；变化路径创建新引用，其他分支继续共享。</p>
        <button type="button" data-action="reset" onClick={handleReset}>
          重置全部
        </button>
      </footer>
    </section>
  )
}
