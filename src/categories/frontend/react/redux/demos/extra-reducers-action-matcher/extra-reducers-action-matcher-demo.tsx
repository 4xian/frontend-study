import {
  configureStore,
  createAction,
  createAsyncThunk,
  createSlice,
  isAnyOf,
  isFulfilled,
  isPending,
  isRejected,
} from '@reduxjs/toolkit'
import { useEffect, useRef, useState, type ComponentType, type ReactElement } from 'react'
import { Provider, useDispatch, useSelector } from 'react-redux'

import './extra-reducers-action-matcher-demo.css'

type Workspace = {
  title: string
}

type WorkspaceState = {
  workspace: Workspace | null
  pendingCount: number
  completedCount: number
  failedCount: number
  exactCaseCount: number
  fulfilledAuditCount: number
  customMatcherCount: number
  defaultCaseCount: number
  lastEvent: string
  events: string[]
}

const initialWorkspaceState: WorkspaceState = {
  workspace: null,
  pendingCount: 0,
  completedCount: 0,
  failedCount: 0,
  exactCaseCount: 0,
  fulfilledAuditCount: 0,
  customMatcherCount: 0,
  defaultCaseCount: 0,
  lastEvent: '尚未派发异步 action',
  events: [],
}

/** 等待模拟工作区请求完成，并在取消时清理计时器。 */
function waitForWorkspace(shouldFail: boolean, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      if (shouldFail) {
        reject(new Error('发布服务暂时不可用'))
        return
      }
      resolve()
    }, 260)

    signal.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timer)
        reject(new Error('工作区请求已取消'))
      },
      { once: true },
    )
  })
}

/** 创建加载工作区的异步 action。 */
const loadWorkspace = createAsyncThunk<Workspace, void>('workspace/load', async (_, { signal }) => {
  await waitForWorkspace(false, signal)
  return { title: 'Redux Matcher 工作区' }
})

/** 创建可控成功或失败的发布异步 action。 */
const publishWorkspace = createAsyncThunk<Workspace, boolean>(
  'workspace/publish',
  async (shouldFail, { signal }) => {
    await waitForWorkspace(shouldFail, signal)
    return { title: '版本 1.0 已发布' }
  },
)

const renameWorkspace = createAction<string>('workspace/rename')
const sendUnhandledAction = createAction('workspace/unhandled')

type RenameWorkspaceAction = {
  type: typeof renameWorkspace.type
  payload: string
}

/** 判断 action 是否为带字符串标题的工作区重命名事件。 */
function isRenameWorkspaceAction(action: {
  type: string
  payload?: unknown
}): action is RenameWorkspaceAction {
  return action.type === renameWorkspace.type && typeof action.payload === 'string'
}

/** 为每次命中的 matcher 追加可读事件并保留最近记录。 */
function recordEvent(state: WorkspaceState, event: string): void {
  state.lastEvent = event
  state.events = [...state.events.slice(-4), event]
}

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState: initialWorkspaceState,
  reducers: {
    resetWorkspace: () => initialWorkspaceState,
  },
  extraReducers: (builder) => {
    builder.addCase(loadWorkspace.fulfilled, (state, action) => {
      state.workspace = action.payload
      state.exactCaseCount += 1
      recordEvent(state, 'addCase：加载成功')
    })
    builder
      .addMatcher(isPending(loadWorkspace, publishWorkspace), (state) => {
        state.pendingCount += 1
        recordEvent(state, 'isPending：请求开始')
      })
      .addMatcher(isFulfilled(loadWorkspace, publishWorkspace), (state) => {
        state.pendingCount -= 1
        state.completedCount += 1
        recordEvent(state, 'isFulfilled：请求成功')
      })
      .addMatcher(isRejected(loadWorkspace, publishWorkspace), (state) => {
        state.pendingCount -= 1
        state.failedCount += 1
        recordEvent(state, 'isRejected：请求失败')
      })
      .addMatcher(isAnyOf(loadWorkspace.fulfilled, publishWorkspace.fulfilled), (state) => {
        state.fulfilledAuditCount += 1
        recordEvent(state, 'isAnyOf：成功审计')
      })
      .addMatcher(isRenameWorkspaceAction, (state, action) => {
        state.workspace = { title: action.payload }
        state.customMatcherCount += 1
        recordEvent(state, '自定义谓词：重命名')
      })
      .addDefaultCase((state, action) => {
        if (action.type === sendUnhandledAction.type) {
          state.defaultCaseCount += 1
          recordEvent(state, 'addDefaultCase：未命中')
        }
      })
  },
})

const { resetWorkspace } = workspaceSlice.actions

/** 为每个 Demo 实例创建独立的 Redux store。 */
function createDemoStore() {
  return configureStore({
    reducer: {
      workspace: workspaceSlice.reducer,
    },
  })
}

type DemoStore = ReturnType<typeof createDemoStore>
type RootState = ReturnType<DemoStore['getState']>
type AppDispatch = DemoStore['dispatch']

const useAppDispatch = useDispatch.withTypes<AppDispatch>()
const useAppSelector = useSelector.withTypes<RootState>()

/** 展示精确 case 与多个 matcher 的叠加结果。 */
function ExtraReducersActionMatcherPanel(): ReactElement {
  const dispatch = useAppDispatch()
  const state = useAppSelector((root) => root.workspace)
  const activeAbort = useRef<(() => void) | null>(null)
  const [lastAction, setLastAction] = useState('尚未产生最终 action')

  useEffect(() => {
    return () => {
      activeAbort.current?.()
    }
  }, [])

  /** 派发加载请求并记录最终 action 类型。 */
  async function load(): Promise<void> {
    const request = dispatch(loadWorkspace())
    activeAbort.current = request.abort
    const action = await request
    if (activeAbort.current === request.abort) {
      activeAbort.current = null
    }
    setLastAction(action.type)
  }

  /** 派发成功或失败的发布请求。 */
  async function publish(shouldFail: boolean): Promise<void> {
    const request = dispatch(publishWorkspace(shouldFail))
    activeAbort.current = request.abort
    const action = await request
    if (activeAbort.current === request.abort) {
      activeAbort.current = null
    }
    setLastAction(action.type)
  }

  /** 恢复业务状态和观察结果。 */
  function reset(): void {
    activeAbort.current = null
    dispatch(resetWorkspace())
    setLastAction('尚未产生最终 action')
  }

  /** 派发自定义类型谓词可以识别的重命名 action。 */
  function rename(): void {
    const action = dispatch(renameWorkspace('Matcher 工作区（已重命名）'))
    setLastAction(action.type)
  }

  /** 派发没有任何 case 或 matcher 命中的 action。 */
  function sendUnhandled(): void {
    const action = dispatch(sendUnhandledAction())
    setLastAction(action.type)
  }

  const isPendingRequest = state.pendingCount > 0

  return (
    <section className="extra-matchers-demo" data-testid="extra-reducers-action-matcher-demo">
      <header className="extra-matchers-demo__heading">
        <p>Exact cases and reusable matchers</p>
        <h2>extraReducers 与 Action Matcher</h2>
        <span>同一个 fulfilled action 可以同时命中精确 case 和多个 matcher。</span>
      </header>

      <section
        className="extra-matchers-demo__status"
        aria-live="polite"
        aria-busy={isPendingRequest}
      >
        <span>最近事件</span>
        <strong data-testid="extra-matchers-last-event">{state.lastEvent}</strong>
        <p>最终 action：{lastAction}</p>
      </section>

      <div className="extra-matchers-demo__controls">
        <button
          className="extra-matchers-demo__primary"
          data-testid="extra-matchers-load"
          type="button"
          disabled={isPendingRequest}
          onClick={() => void load()}
        >
          加载工作区
        </button>
        <button
          data-testid="extra-matchers-publish"
          type="button"
          disabled={isPendingRequest}
          onClick={() => void publish(false)}
        >
          发布成功
        </button>
        <button
          data-testid="extra-matchers-fail"
          type="button"
          disabled={isPendingRequest}
          onClick={() => void publish(true)}
        >
          发布失败
        </button>
        <button
          data-testid="extra-matchers-rename"
          type="button"
          disabled={isPendingRequest}
          onClick={rename}
        >
          自定义谓词重命名
        </button>
        <button
          data-testid="extra-matchers-unhandled"
          type="button"
          disabled={isPendingRequest}
          onClick={sendUnhandled}
        >
          发送未命中 action
        </button>
        <button
          data-testid="extra-matchers-reset"
          type="button"
          disabled={isPendingRequest}
          onClick={reset}
        >
          重置
        </button>
      </div>

      <section className="extra-matchers-demo__counters" aria-label="matcher 计数">
        <div>
          <span>pending</span>
          <strong data-testid="extra-matchers-pending-count">{state.pendingCount}</strong>
        </div>
        <div>
          <span>fulfilled</span>
          <strong data-testid="extra-matchers-completed-count">{state.completedCount}</strong>
        </div>
        <div>
          <span>rejected</span>
          <strong data-testid="extra-matchers-failed-count">{state.failedCount}</strong>
        </div>
        <div>
          <span>addCase</span>
          <strong data-testid="extra-matchers-exact-count">{state.exactCaseCount}</strong>
        </div>
        <div>
          <span>isAnyOf</span>
          <strong data-testid="extra-matchers-audit-count">{state.fulfilledAuditCount}</strong>
        </div>
        <div>
          <span>自定义谓词</span>
          <strong data-testid="extra-matchers-custom-count">{state.customMatcherCount}</strong>
        </div>
        <div>
          <span>default</span>
          <strong data-testid="extra-matchers-default-count">{state.defaultCaseCount}</strong>
        </div>
      </section>

      <section className="extra-matchers-demo__workspace" aria-label="工作区数据">
        <h3>业务数据</h3>
        <p data-testid="extra-matchers-workspace-title">
          {state.workspace?.title ?? '加载成功后显示工作区'}
        </p>
      </section>

      <section className="extra-matchers-demo__events" aria-label="事件顺序">
        <h3>最近命中顺序</h3>
        <ol>
          {state.events.length > 0 ? (
            state.events.map((event, index) => <li key={`${event}-${index}`}>{event}</li>)
          ) : (
            <li>尚未记录事件</li>
          )}
        </ol>
      </section>
    </section>
  )
}

/** 为 Demo 提供可重复挂载的独立 Provider。 */
function ExtraReducersActionMatcherDemoRoot(): ReactElement {
  const [store] = useState(createDemoStore)

  return (
    <Provider store={store}>
      <ExtraReducersActionMatcherPanel />
    </Provider>
  )
}

/** 为 React Demo 宿主注册 extraReducers 与 matcher 观察台。 */
export function createExtraReducersActionMatcherDemo(): ComponentType {
  return ExtraReducersActionMatcherDemoRoot
}
