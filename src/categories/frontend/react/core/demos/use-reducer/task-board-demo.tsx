import { useReducer, useState } from 'react'
import './task-board-demo.css'

type TaskFilter = 'all' | 'open' | 'done'

interface Task {
  id: number
  title: string
  done: boolean
}

interface BoardState {
  owner: string
  tasks: Task[]
  nextId: number
  filter: TaskFilter
  actionLog: string[]
}

type BoardAction =
  | { type: 'task_added'; title: string }
  | { type: 'task_toggled'; id: number }
  | { type: 'task_deleted'; id: number }
  | { type: 'filter_selected'; filter: TaskFilter }
  | { type: 'tasks_cleared' }
  | { type: 'board_reset' }

const initialOwner = 'React 学习组'
const initialTaskTitle = '核对一次 reducer 转换'

/** 在出现未覆盖的 Action 分支时终止状态转换。 */
function assertNever(action: never): never {
  throw new Error(`未知 Action：${JSON.stringify(action)}`)
}

/** 把初始化参数转换为任务看板的第一份 State。 */
function createInitialState(owner: string): BoardState {
  return {
    owner,
    tasks: [
      { id: 1, title: '观察 dispatch 提交的 Action', done: true },
      { id: 2, title: '确认旧 State 没有被修改', done: false },
    ],
    nextId: 3,
    filter: 'all',
    actionLog: [],
  }
}

/** 把判别联合中的 Action 转成可直接核对的日志文本。 */
function describeAction(action: BoardAction): string {
  switch (action.type) {
    case 'task_added':
      return `task_added(title="${action.title}")`
    case 'task_toggled':
      return `task_toggled(id=${action.id})`
    case 'task_deleted':
      return `task_deleted(id=${action.id})`
    case 'filter_selected':
      return `filter_selected(filter="${action.filter}")`
    case 'tasks_cleared':
      return 'tasks_cleared'
    case 'board_reset':
      return 'board_reset'
    default:
      return assertNever(action)
  }
}

/** 在 State 中保留最近六次交互对应的 Action。 */
function appendAction(state: BoardState, action: BoardAction): string[] {
  return [...state.actionLog, describeAction(action)].slice(-6)
}

/** 只根据当前 State 和 Action 计算完整的下一份任务看板 State。 */
export function boardReducer(state: BoardState, action: BoardAction): BoardState {
  const actionLog = appendAction(state, action)

  switch (action.type) {
    case 'task_added':
      return {
        ...state,
        tasks: [...state.tasks, { id: state.nextId, title: action.title, done: false }],
        nextId: state.nextId + 1,
        actionLog,
      }
    case 'task_toggled':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.id ? { ...task, done: !task.done } : task,
        ),
        actionLog,
      }
    case 'task_deleted':
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.id),
        actionLog,
      }
    case 'filter_selected':
      return { ...state, filter: action.filter, actionLog }
    case 'tasks_cleared':
      return { ...state, tasks: [], actionLog }
    case 'board_reset':
      return { ...createInitialState(state.owner), actionLog }
    default:
      return assertNever(action)
  }
}

/** 展示 useReducer、Action 合同、纯转换和 render 快照之间的关系。 */
export default function TaskBoardDemo() {
  const [taskTitle, setTaskTitle] = useState(initialTaskTitle)
  const [snapshotReport, setSnapshotReport] = useState('尚未观察 dispatch 快照')
  const [purityReport, setPurityReport] = useState('尚未运行纯度检查')
  const [state, dispatch] = useReducer(boardReducer, initialOwner, createInitialState)

  const completedCount = state.tasks.filter((task) => task.done).length
  const visibleTasks = state.tasks.filter((task) => {
    if (state.filter === 'open') return !task.done
    if (state.filter === 'done') return task.done
    return true
  })

  /** 把输入框中的领域值放入一个添加 Action，再清空独立草稿。 */
  function handleAddTask() {
    const title = taskTitle.trim()
    if (!title) return
    dispatch({ type: 'task_added', title })
    setTaskTitle('')
  }

  /** 提交切换 Action，并记录当前事件仍持有旧任务快照。 */
  function handleToggleTask(task: Task) {
    dispatch({ type: 'task_toggled', id: task.id })
    setSnapshotReport(
      `dispatch 返回后，当前事件里的“${task.title}”仍是${task.done ? '已完成' : '未完成'}。`,
    )
  }

  /** 用相同 State 和 Action 计算两次，检查结果一致且旧数组未被修改。 */
  function handlePurityCheck() {
    const sampleState = createInitialState('纯度样本')
    const sampleAction = { type: 'task_toggled', id: 2 } as const
    const originalSnapshot = JSON.stringify(sampleState)
    const firstResult = boardReducer(sampleState, sampleAction)
    const secondResult = boardReducer(sampleState, sampleAction)
    const sameResult = JSON.stringify(firstResult) === JSON.stringify(secondResult)
    const oldStateIntact = JSON.stringify(sampleState) === originalSnapshot
    const newArrayCreated = firstResult.tasks !== sampleState.tasks

    setPurityReport(
      sameResult && oldStateIntact && newArrayCreated
        ? '相同输入得到相同结果，旧 State 保持不变，并创建了新任务数组。'
        : '纯度检查未通过，请检查隐藏输入或原地修改。',
    )
  }

  /** 恢复确定的初始看板，并清理两个独立观察结果。 */
  function handleResetBoard() {
    dispatch({ type: 'board_reset' })
    setTaskTitle(initialTaskTitle)
    setSnapshotReport('尚未观察 dispatch 快照')
    setPurityReport('尚未运行纯度检查')
  }

  return (
    <section className="react-reducer-demo" data-testid="react-reducer-demo">
      <header className="react-reducer-heading">
        <div>
          <p>State + Action -&gt; Next State</p>
          <h2>任务看板 reducer</h2>
        </div>
        <span>初始化参数：{state.owner}</span>
      </header>

      <div className="react-reducer-summary" aria-live="polite">
        <strong>{state.tasks.length}</strong>
        <span>全部任务</span>
        <strong>{completedCount}</strong>
        <span>已完成</span>
        <strong>{state.tasks.length - completedCount}</strong>
        <span>待完成</span>
      </div>

      <div className="react-reducer-compose">
        <label>
          <span>新任务</span>
          <input
            value={taskTitle}
            onChange={(event) => setTaskTitle(event.currentTarget.value)}
            aria-label="新任务"
          />
        </label>
        <button type="button" onClick={handleAddTask} disabled={!taskTitle.trim()}>
          添加任务
        </button>
      </div>

      <div className="react-reducer-filters" aria-label="任务筛选">
        {(
          [
            ['all', '全部'],
            ['open', '待完成'],
            ['done', '已完成'],
          ] as const
        ).map(([filter, label]) => (
          <button
            type="button"
            key={filter}
            className={state.filter === filter ? 'is-active' : undefined}
            aria-pressed={state.filter === filter}
            onClick={() => dispatch({ type: 'filter_selected', filter })}
          >
            {label}
          </button>
        ))}
      </div>

      {visibleTasks.length ? (
        <ul className="react-reducer-list">
          {visibleTasks.map((task) => (
            <li key={task.id} className={task.done ? 'is-done' : undefined}>
              <div>
                <strong>{task.title}</strong>
                <small>任务 #{task.id}</small>
              </div>
              <button type="button" onClick={() => handleToggleTask(task)}>
                {task.done ? '恢复' : '完成'}
              </button>
              <button type="button" onClick={() => dispatch({ type: 'task_deleted', id: task.id })}>
                删除
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="react-reducer-empty">
          {state.tasks.length
            ? '当前筛选条件下没有任务。'
            : '任务为空，可以添加一项或恢复初始看板。'}
        </p>
      )}

      <div className="react-reducer-secondary-actions">
        <button type="button" onClick={() => dispatch({ type: 'tasks_cleared' })}>
          清空任务
        </button>
        <button type="button" onClick={handleResetBoard}>
          恢复初始看板
        </button>
        <button type="button" onClick={handlePurityCheck}>
          运行纯度检查
        </button>
      </div>

      <div className="react-reducer-observations">
        <section>
          <h3>render 快照</h3>
          <p aria-live="polite">{snapshotReport}</p>
          <small>页面中的任务状态会在后续 render 更新。</small>
        </section>
        <section>
          <h3>纯度检查</h3>
          <p aria-live="polite">{purityReport}</p>
          <small>检查结果一致、旧快照不变和新数组引用。</small>
        </section>
        <section className="react-reducer-log">
          <h3>最近 6 个 Action</h3>
          {state.actionLog.length ? (
            <ol>
              {state.actionLog.map((entry, index) => (
                <li key={`${index}-${entry}`}>
                  <code>{entry}</code>
                </li>
              ))}
            </ol>
          ) : (
            <p>执行任意看板交互后显示 Action。</p>
          )}
        </section>
      </div>
    </section>
  )
}
