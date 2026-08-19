import {
  createContext,
  useContext,
  useReducer,
  useState,
  type Dispatch,
  type FormEvent,
  type ReactNode,
} from 'react'
import './task-context-demo.css'

interface Task {
  id: number
  title: string
  done: boolean
}

interface TaskState {
  tasks: Task[]
  nextId: number
  lastAction: TaskAction['type'] | 'initialized'
}

type TaskAction =
  | { type: 'task/added'; title: string }
  | { type: 'task/toggled'; id: number }
  | { type: 'task/deleted'; id: number }
  | { type: 'workspace/reset' }

const initialState: TaskState = {
  tasks: [
    { id: 1, title: '拆分 State 与 dispatch 通道', done: false },
    { id: 2, title: '检查 Provider 作用域', done: true },
  ],
  nextId: 3,
  lastAction: 'initialized',
}

const TaskStateContext = createContext<TaskState | null>(null)
const TaskDispatchContext = createContext<Dispatch<TaskAction> | null>(null)

/** 根据任务 Action 纯计算工作区的下一份 State。 */
function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'task/added':
      return {
        tasks: [...state.tasks, { id: state.nextId, title: action.title, done: false }],
        nextId: state.nextId + 1,
        lastAction: action.type,
      }
    case 'task/toggled':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.id ? { ...task, done: !task.done } : task,
        ),
        lastAction: action.type,
      }
    case 'task/deleted':
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.id),
        lastAction: action.type,
      }
    case 'workspace/reset':
      return { ...initialState, lastAction: action.type }
  }
}

/** 读取最近任务 Provider 的当前 State，并暴露缺失边界。 */
function useTaskState(): TaskState {
  const state = useContext(TaskStateContext)
  if (state === null) throw new Error('useTaskState 必须在 TaskProvider 内使用')
  return state
}

/** 读取最近任务 Provider 的 dispatch，并暴露缺失边界。 */
function useTaskDispatch(): Dispatch<TaskAction> {
  const dispatch = useContext(TaskDispatchContext)
  if (dispatch === null) throw new Error('useTaskDispatch 必须在 TaskProvider 内使用')
  return dispatch
}

/** 为任务工作区拥有 reducer State，并提供读取与更新通道。 */
function TaskProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, initialState)

  return (
    <TaskStateContext value={state}>
      <TaskDispatchContext value={dispatch}>{children}</TaskDispatchContext>
    </TaskStateContext>
  )
}

/** 只读取 State Context，展示任务统计与最新结果。 */
function TaskSummary() {
  const state = useTaskState()
  const completedCount = state.tasks.filter((task) => task.done).length

  return (
    <section className="react-task-context-summary" aria-live="polite">
      <div>
        <span>State Context</span>
        <strong data-testid="task-context-total">{state.tasks.length} 个任务</strong>
      </div>
      <div>
        <span>已完成</span>
        <strong data-testid="task-context-completed">{completedCount} 个</strong>
      </div>
      <div>
        <span>最近 Action</span>
        <code data-testid="task-context-last-action">{state.lastAction}</code>
      </div>
    </section>
  )
}

interface TaskComposerProps {
  inputId: string
  initialTitle: string
}

/** 只读取 dispatch Context，把表单提交转换为添加任务 Action。 */
function TaskComposer({ inputId, initialTitle }: TaskComposerProps) {
  const dispatch = useTaskDispatch()
  const [title, setTitle] = useState(initialTitle)

  /** 提交非空标题，并把草稿恢复为空。 */
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextTitle = title.trim()
    if (!nextTitle) return
    dispatch({ type: 'task/added', title: nextTitle })
    setTitle('')
  }

  return (
    <form className="react-task-context-composer" onSubmit={handleSubmit}>
      <label htmlFor={inputId}>新任务</label>
      <div>
        <input
          id={inputId}
          value={title}
          onChange={(event) => setTitle(event.currentTarget.value)}
          placeholder="输入任务名称"
        />
        <button type="submit" disabled={!title.trim()}>
          添加任务
        </button>
      </div>
    </form>
  )
}

/** 同时读取 State 与 dispatch，渲染任务并处理切换和删除。 */
function TaskList() {
  const state = useTaskState()
  const dispatch = useTaskDispatch()

  /** 为任务派发完成状态切换 Action。 */
  function handleToggle(id: number) {
    dispatch({ type: 'task/toggled', id })
  }

  /** 为任务派发删除 Action。 */
  function handleDelete(id: number) {
    dispatch({ type: 'task/deleted', id })
  }

  return (
    <ul className="react-task-context-list" data-testid="task-context-list">
      {state.tasks.map((task) => (
        <li className={task.done ? 'is-done' : undefined} key={task.id}>
          <label>
            <input type="checkbox" checked={task.done} onChange={() => handleToggle(task.id)} />
            <span>{task.title}</span>
          </label>
          <button
            aria-label={`删除任务：${task.title}`}
            className="react-task-context-delete"
            type="button"
            onClick={() => handleDelete(task.id)}
          >
            删除
          </button>
        </li>
      ))}
    </ul>
  )
}

/** 只读取 dispatch Context，把工作区恢复为确定的初始状态。 */
function ResetWorkspaceButton() {
  const dispatch = useTaskDispatch()

  /** 派发工作区重置 Action。 */
  function handleReset() {
    dispatch({ type: 'workspace/reset' })
  }

  return (
    <button className="react-task-context-reset" type="button" onClick={handleReset}>
      重置工作区
    </button>
  )
}

/** 保留中间布局层，证明 State 与 dispatch 不需要逐层转交。 */
function WorkspaceShell({ children }: { children: ReactNode }) {
  return <div className="react-task-context-shell">{children}</div>
}

interface TaskWorkspaceProps {
  inputId: string
  initialTitle: string
}

/** 组合深层只读、只写和同时读写组件，不接收业务 State Props。 */
function TaskWorkspace({ inputId, initialTitle }: TaskWorkspaceProps) {
  return (
    <WorkspaceShell>
      <TaskSummary />
      <TaskComposer inputId={inputId} initialTitle={initialTitle} />
      <TaskList />
      <ResetWorkspaceButton />
    </WorkspaceShell>
  )
}

/** 展示嵌套 Provider 的独立 State 与 dispatch 通道。 */
export default function TaskContextDemo() {
  return (
    <section className="react-task-context-demo" data-testid="react-task-context-demo">
      <header className="react-task-context-heading">
        <p>State Context / dispatch Context</p>
        <h2>任务工作区</h2>
        <span>两个 Provider 实例各自拥有 reducer State，深层组件按职责读取或派发。</span>
      </header>

      <TaskProvider>
        <div className="react-task-context-instances">
          <section className="react-task-context-instance" data-testid="task-context-outer">
            <header className="react-task-context-instance-heading">
              <h3>外层 Provider 实例</h3>
              <p>外层重置不会改变内层实例。</p>
            </header>
            <TaskWorkspace inputId="react-task-context-outer-title" initialTitle="整理组件职责" />
          </section>

          <TaskProvider>
            <section className="react-task-context-instance" data-testid="task-context-inner">
              <header className="react-task-context-instance-heading">
                <h3>内层 Provider 实例</h3>
                <p>内层添加只更新最近的内层 State。</p>
              </header>
              <TaskWorkspace inputId="react-task-context-inner-title" initialTitle="内层检查项" />
            </section>
          </TaskProvider>
        </div>
      </TaskProvider>
    </section>
  )
}
