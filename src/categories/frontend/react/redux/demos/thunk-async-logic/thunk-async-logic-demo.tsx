import {
  configureStore,
  createSlice,
  type PayloadAction,
  type ThunkAction,
  type UnknownAction,
} from '@reduxjs/toolkit'
import { useId, useState, type ChangeEvent, type ComponentType, type ReactElement } from 'react'
import { Provider, useDispatch, useSelector } from 'react-redux'

import './thunk-async-logic-demo.css'

type PublishingState = {
  draft: string
  snapshot: string
  published: string
  isRunning: boolean
  steps: string[]
}

const initialDraft = '整理 Redux Thunk 学习笔记'

/** 创建可重复使用的初始发布状态。 */
function createInitialState(): PublishingState {
  return {
    draft: initialDraft,
    snapshot: '尚未读取',
    published: '尚未发布',
    isRunning: false,
    steps: ['等待 dispatch(publishDraft())'],
  }
}

const publishingSlice = createSlice({
  name: 'thunkPublishing',
  initialState: createInitialState(),
  reducers: {
    /** 同步保存编辑器中的草稿。 */
    draftChanged: (state, action: PayloadAction<string>) => {
      state.draft = action.payload
    },
    /** 记录 Thunk 在异步工作前读取的状态快照。 */
    publishingStarted: (state, action: PayloadAction<string>) => {
      state.snapshot = action.payload
      state.isRunning = true
      state.steps = [
        '1. dispatch(publishDraft()) 交给 middleware',
        `2. getState() 读取快照：${action.payload}`,
        '3. dispatch(publishingStarted()) 更新 store',
        '4. await publishToService(snapshot)',
      ]
    },
    /** 记录空草稿被 Thunk 提前跳过。 */
    publishingSkipped: (state) => {
      state.snapshot = '空字符串'
      state.isRunning = false
      state.steps = [
        '1. dispatch(publishDraft()) 交给 middleware',
        '2. getState() 读取到空字符串',
        '3. dispatch(publishingSkipped())，没有调用服务',
      ]
    },
    /** 保存异步服务返回的发布结果。 */
    publishingFinished: (state, action: PayloadAction<string>) => {
      state.published = action.payload
      state.isRunning = false
      state.steps.push('5. Promise 已解决，dispatch(publishingFinished())')
    },
    /** 恢复 Demo 的初始状态。 */
    reset: () => createInitialState(),
  },
})

/** 等待指定时长，用于模拟一次确定性的异步服务调用。 */
function wait(duration: number): Promise<void> {
  return new Promise((resolve) => {
    globalThis.setTimeout(resolve, duration)
  })
}

/** 模拟发布服务，并返回调用时传入的草稿快照。 */
async function publishToService(snapshot: string): Promise<string> {
  await wait(520)
  return snapshot
}

/** 为每个 Demo 实例创建独立的 Redux store。 */
function createDemoStore() {
  return configureStore({
    reducer: {
      publishing: publishingSlice.reducer,
    },
  })
}

type DemoStore = ReturnType<typeof createDemoStore>
type RootState = ReturnType<DemoStore['getState']>
type AppDispatch = DemoStore['dispatch']
type AppThunk<ReturnValue = void> = ThunkAction<ReturnValue, RootState, unknown, UnknownAction>

/** 读取草稿，在异步边界两侧派发普通 action，并把结果返回给调用方。 */
const publishDraft = (): AppThunk<Promise<string | null>> => async (dispatch, getState) => {
  const snapshot = getState().publishing.draft.trim()

  if (!snapshot) {
    dispatch(publishingSlice.actions.publishingSkipped())
    return null
  }

  dispatch(publishingSlice.actions.publishingStarted(snapshot))
  const published = await publishToService(snapshot)
  dispatch(publishingSlice.actions.publishingFinished(published))
  return published
}

/** 读取当前编辑器草稿。 */
const selectDraft = (state: RootState) => state.publishing.draft

/** 读取 Thunk 启动时保存的快照。 */
const selectSnapshot = (state: RootState) => state.publishing.snapshot

/** 读取最近一次发布结果。 */
const selectPublished = (state: RootState) => state.publishing.published

/** 读取当前异步流程是否正在运行。 */
const selectIsRunning = (state: RootState) => state.publishing.isRunning

/** 读取当前 Thunk 执行轨迹。 */
const selectSteps = (state: RootState) => state.publishing.steps

/** 创建能够识别手写 Thunk 的预类型 dispatch Hook。 */
const useAppDispatch = useDispatch.withTypes<AppDispatch>()

/** 展示手写 Thunk 的状态快照、异步边界与返回值。 */
function ThunkWorkflowPanel(): ReactElement {
  const draftId = useId()
  const dispatch = useAppDispatch()
  const draft = useSelector(selectDraft)
  const snapshot = useSelector(selectSnapshot)
  const published = useSelector(selectPublished)
  const isRunning = useSelector(selectIsRunning)
  const steps = useSelector(selectSteps)
  const [dispatchResult, setDispatchResult] = useState('尚未等待 Thunk 返回值')

  /** 把输入框内容同步写入 Redux state。 */
  function changeDraft(event: ChangeEvent<HTMLInputElement>): void {
    dispatch(publishingSlice.actions.draftChanged(event.target.value))
  }

  /** 派发并等待手写 Thunk 返回的 Promise。 */
  async function runThunk(): Promise<void> {
    setDispatchResult('正在等待 dispatch 返回的 Promise')
    const result = await dispatch(publishDraft())
    setDispatchResult(result === null ? 'dispatch 返回：null' : `dispatch 返回：${result}`)
  }

  /** 清空草稿，供学习者观察 getState 的提前退出分支。 */
  function clearDraft(): void {
    dispatch(publishingSlice.actions.draftChanged(''))
  }

  /** 恢复 Redux 状态与组件内返回值。 */
  function resetDemo(): void {
    dispatch(publishingSlice.actions.reset())
    setDispatchResult('尚未等待 Thunk 返回值')
  }

  return (
    <section className="thunk-async-demo" data-testid="thunk-async-demo">
      <header className="thunk-async-demo__heading">
        <p>Redux Thunk</p>
        <h2>手写 Thunk 异步流程观察台</h2>
        <span>在一次 dispatch 中观察 middleware、getState、异步服务与普通 action 的协作。</span>
      </header>

      <div className="thunk-async-demo__flow" aria-label="Thunk 执行路径">
        <span>dispatch(thunk)</span>
        <strong>middleware</strong>
        <span>getState</span>
        <strong>await</strong>
        <span>dispatch(action)</span>
      </div>

      <div className="thunk-async-demo__editor">
        <label htmlFor={draftId}>待发布草稿</label>
        <input
          id={draftId}
          data-testid="thunk-draft-input"
          type="text"
          value={draft}
          onChange={changeDraft}
        />
        <p>流程运行期间仍可修改输入，用来对比当前草稿与启动时快照。</p>
      </div>

      <div className="thunk-async-demo__controls">
        <button
          className="thunk-async-demo__primary"
          data-testid="thunk-run"
          type="button"
          disabled={isRunning}
          onClick={() => void runThunk()}
        >
          {isRunning ? '异步流程运行中' : '运行手写 Thunk'}
        </button>
        <button data-testid="thunk-clear" type="button" disabled={isRunning} onClick={clearDraft}>
          清空草稿
        </button>
        <button data-testid="thunk-reset" type="button" disabled={isRunning} onClick={resetDemo}>
          恢复初始状态
        </button>
      </div>

      <dl className="thunk-async-demo__state" aria-live="polite" aria-busy={isRunning}>
        <div>
          <dt>当前草稿</dt>
          <dd data-testid="thunk-current-draft">{draft || '空字符串'}</dd>
        </div>
        <div>
          <dt>启动时快照</dt>
          <dd data-testid="thunk-snapshot">{snapshot}</dd>
        </div>
        <div>
          <dt>发布结果</dt>
          <dd data-testid="thunk-published">{published}</dd>
        </div>
      </dl>

      <section className="thunk-async-demo__trace" aria-label="Thunk 执行轨迹">
        <h3>执行轨迹</h3>
        <ol data-testid="thunk-steps">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <p className="thunk-async-demo__result" data-testid="thunk-return" aria-live="polite">
        {dispatchResult}
      </p>
    </section>
  )
}

/** 为 React Demo 提供独立 store 和 Provider 作用域。 */
function ThunkAsyncLogicDemoRoot(): ReactElement {
  const [store] = useState(createDemoStore)

  return (
    <Provider store={store}>
      <ThunkWorkflowPanel />
    </Provider>
  )
}

/** 为 React Demo 注册 Thunk 异步流程观察组件。 */
export function createThunkAsyncLogicDemo(): ComponentType {
  return ThunkAsyncLogicDemoRoot
}
