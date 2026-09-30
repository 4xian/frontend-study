import { configureStore, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { useState, type ChangeEvent, type ComponentType, type ReactElement } from 'react'

import './action-and-payload-demo.css'

type Task = Readonly<{
  id: string
  title: string
  completed: boolean
}>

type TaskState = {
  items: Task[]
}

const initialTaskState: TaskState = { items: [] }

const taskSlice = createSlice({
  name: 'tasks',
  initialState: initialTaskState,
  reducers: {
    taskAdded: (state, action: PayloadAction<{ id: string; title: string }>) => {
      state.items.push({ ...action.payload, completed: false })
    },
    taskCompleted: (state, action: PayloadAction<string>) => {
      const task = state.items.find((item) => item.id === action.payload)
      if (task) task.completed = true
    },
  },
})

type TaskAction =
  | ReturnType<typeof taskSlice.actions.taskAdded>
  | ReturnType<typeof taskSlice.actions.taskCompleted>

type LastAction = Readonly<{
  type: string
  payload?: unknown
}>

/** 创建一份供 Demo 使用的独立 Redux store。 */
function createTaskStore() {
  return configureStore({ reducer: taskSlice.reducer })
}

/** 显示 action 数据与 dispatch 后的任务状态。 */
function ActionAndPayloadDemo(): ReactElement {
  const [store] = useState(createTaskStore)
  const [state, setState] = useState(() => store.getState())
  const [title, setTitle] = useState('阅读 Action 文档')
  const [lastAction, setLastAction] = useState<LastAction>({ type: '尚未 dispatch' })

  /** 把 action 交给 store，并同步显示最新状态与 action。 */
  function applyAction(action: TaskAction): void {
    store.dispatch(action)
    setState(store.getState())
    setLastAction(action)
  }

  /** 根据输入标题创建对象 payload 的 taskAdded action。 */
  function handleAdd(): void {
    const nextId = `task-${state.items.length + 1}`
    applyAction(taskSlice.actions.taskAdded({ id: nextId, title: title.trim() || '未命名任务' }))
  }

  /** 为第一条任务创建字符串 payload 的 taskCompleted action。 */
  function handleComplete(): void {
    const firstTask = state.items[0]
    if (firstTask) applyAction(taskSlice.actions.taskCompleted(firstTask.id))
  }

  /** 更新对象 payload 的标题输入。 */
  function handleTitleChange(event: ChangeEvent<HTMLInputElement>): void {
    setTitle(event.target.value)
  }

  return (
    <section className="action-payload-demo" data-testid="action-payload-demo">
      <header className="action-payload-heading">
        <p>Redux action inspector</p>
        <h2>Action 与 Payload 观察器</h2>
        <span>同一条事件消息同时显示 type、payload 与 dispatch 后的状态。</span>
      </header>

      <section className="action-payload-contract" aria-labelledby="action-payload-contract-title">
        <span id="action-payload-contract-title">当前 action 契约</span>
        <code>tasks/taskAdded → payload: {'{ id, title }'}</code>
        <code>tasks/taskCompleted → payload: string</code>
      </section>

      <section className="action-payload-last-action" aria-live="polite">
        <div>
          <span>最近一次 action.type</span>
          <code data-testid="action-payload-last-type">{lastAction.type}</code>
        </div>
        <div>
          <span>最近一次 action.payload</span>
          <code data-testid="action-payload-last-payload">
            {lastAction.payload === undefined ? 'undefined' : JSON.stringify(lastAction.payload)}
          </code>
        </div>
      </section>

      <section className="action-payload-state" aria-live="polite">
        <div className="action-payload-state-heading">
          <span>store.getState()</span>
          <strong data-testid="action-payload-task-count">{state.items.length} 条任务</strong>
        </div>
        {state.items.length === 0 ? (
          <p>还没有任务，先创建一条 action。</p>
        ) : (
          <ul>
            {state.items.map((task) => (
              <li key={task.id}>
                <span>{task.title}</span>
                <strong>{task.completed ? '已完成' : '待完成'}</strong>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="action-payload-controls">
        <label>
          <span>任务标题</span>
          <input aria-label="任务标题" value={title} onChange={handleTitleChange} />
        </label>
        <button type="button" data-testid="action-payload-add" onClick={handleAdd}>
          添加任务
        </button>
        <button
          type="button"
          data-testid="action-payload-complete"
          onClick={handleComplete}
          disabled={state.items.length === 0 || state.items[0]?.completed}
        >
          完成第一条
        </button>
      </div>
    </section>
  )
}

/** 为 React Demo 宿主提供 Action 与 Payload 观察组件。 */
export function createActionAndPayloadDemo(): ComponentType {
  return ActionAndPayloadDemo
}
