import { configureStore, createSlice } from '@reduxjs/toolkit'
import { useState, type ComponentType, type ReactElement } from 'react'

import './reducer-and-immer-demo.css'

type Task = {
  id: string
  title: string
  done: boolean
}

type WorkspaceState = {
  profile: {
    name: string
    role: string
  }
  tasks: Task[]
  tags: string[]
}

const initialWorkspaceState: WorkspaceState = {
  profile: { name: 'Redux 学习者', role: '前端开发' },
  tasks: [{ id: 'task-1', title: '阅读 Immer 文档', done: false }],
  tags: ['redux'],
}

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState: initialWorkspaceState,
  reducers: {
    taskCompleted: (state) => {
      const task = state.tasks[0]
      if (task) task.done = true
    },
    tagAdded: (state) => {
      state.tags.push(`tag-${state.tags.length + 1}`)
    },
    reset: () => initialWorkspaceState,
  },
})

type ReferenceFlags = {
  rootChanged: boolean
  profileChanged: boolean
  tasksChanged: boolean
  tagsChanged: boolean
}

type WorkspaceAction =
  | ReturnType<typeof workspaceSlice.actions.taskCompleted>
  | ReturnType<typeof workspaceSlice.actions.tagAdded>
  | ReturnType<typeof workspaceSlice.actions.reset>

const initialReferences: ReferenceFlags = {
  rootChanged: false,
  profileChanged: false,
  tasksChanged: false,
  tagsChanged: false,
}

/** 创建只供当前 Demo 使用的 Redux store。 */
function createWorkspaceStore() {
  return configureStore({ reducer: workspaceSlice.reducer })
}

/** 比较 dispatch 前后的根状态与嵌套分支引用。 */
function compareReferences(before: WorkspaceState, after: WorkspaceState): ReferenceFlags {
  return {
    rootChanged: before !== after,
    profileChanged: before.profile !== after.profile,
    tasksChanged: before.tasks !== after.tasks,
    tagsChanged: before.tags !== after.tags,
  }
}

/** 展示 Immer draft 更新、返回新状态和结构共享结果。 */
function ReducerAndImmerDemo(): ReactElement {
  const [store] = useState(createWorkspaceStore)
  const [state, setState] = useState(() => store.getState())
  const [previousState, setPreviousState] = useState<WorkspaceState | null>(null)
  const [references, setReferences] = useState<ReferenceFlags>(initialReferences)
  const [lastAction, setLastAction] = useState('尚未 dispatch')

  /** Dispatch 一个 slice action，并保存前后状态用于观察引用变化。 */
  function applyAction(action: WorkspaceAction): void {
    const before = store.getState()
    store.dispatch(action)
    const after = store.getState()
    setPreviousState(before)
    setState(after)
    setReferences(compareReferences(before, after))
    setLastAction(action.type)
  }

  /** 使用 draft 修改第一条任务的完成状态。 */
  function handleCompleteTask(): void {
    applyAction(workspaceSlice.actions.taskCompleted())
  }

  /** 使用 draft 数组 push 添加标签。 */
  function handleAddTag(): void {
    applyAction(workspaceSlice.actions.tagAdded())
  }

  /** 通过 reducer 返回值替换整棵状态。 */
  function handleReset(): void {
    applyAction(workspaceSlice.actions.reset())
  }

  return (
    <section className="reducer-immer-demo" data-testid="reducer-immer-demo">
      <header className="reducer-immer-heading">
        <p>Redux Toolkit + Immer</p>
        <h2>Reducer 与 Immer 观察器</h2>
        <span>比较每次 dispatch 前后的状态引用，观察未修改分支的结构共享。</span>
      </header>

      <section className="reducer-immer-action" aria-live="polite">
        <span>最近一次 action.type</span>
        <code data-testid="reducer-immer-last-action">{lastAction}</code>
      </section>

      <section className="reducer-immer-state" aria-live="polite">
        <div className="reducer-immer-state-heading">
          <span>当前状态</span>
          <strong data-testid="reducer-immer-task-status">
            {state.tasks[0]?.done ? '任务已完成' : '任务待完成'}
          </strong>
        </div>
        <pre data-testid="reducer-immer-current-state">{JSON.stringify(state, null, 2)}</pre>
      </section>

      <section className="reducer-immer-references" aria-label="引用变化">
        <div className="reducer-immer-reference-heading">
          <span>引用变化</span>
          <small>{previousState ? '与本次 dispatch 前比较' : '首次操作后显示'}</small>
        </div>
        <ul>
          <li>
            <span>根状态</span>
            <strong>
              {references.rootChanged ? '已变化' : previousState ? '保持原引用' : '未比较'}
            </strong>
          </li>
          <li>
            <span>profile（未修改分支）</span>
            <strong>
              {references.profileChanged ? '已变化' : previousState ? '保持原引用' : '未比较'}
            </strong>
          </li>
          <li>
            <span>tasks</span>
            <strong>
              {references.tasksChanged ? '已变化' : previousState ? '保持原引用' : '未比较'}
            </strong>
          </li>
          <li>
            <span>tags</span>
            <strong>
              {references.tagsChanged ? '已变化' : previousState ? '保持原引用' : '未比较'}
            </strong>
          </li>
        </ul>
      </section>

      <section className="reducer-immer-snapshot" aria-live="polite">
        <span>dispatch 前快照</span>
        <pre data-testid="reducer-immer-previous-state">
          {previousState ? JSON.stringify(previousState, null, 2) : '点击按钮后保存快照'}
        </pre>
      </section>

      <div className="reducer-immer-controls">
        <button type="button" data-testid="reducer-immer-complete" onClick={handleCompleteTask}>
          完成任务
        </button>
        <button type="button" data-testid="reducer-immer-add-tag" onClick={handleAddTag}>
          添加标签
        </button>
        <button type="button" data-testid="reducer-immer-reset" onClick={handleReset}>
          返回初始状态
        </button>
      </div>
    </section>
  )
}

/** 为 React Demo 宿主提供 Reducer 与 Immer 观察组件。 */
export function createReducerAndImmerDemo(): ComponentType {
  return ReducerAndImmerDemo
}
