import { configureStore, createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { useRef, useState, type ComponentType, type ReactElement } from 'react'
import { Provider, useDispatch, useSelector } from 'react-redux'

import './async-cancel-condition-demo.css'

type ContentRequest = {
  query: string
  delayMs: number
}

type Content = {
  query: string
  title: string
}

type ContentStatus = 'idle' | 'pending' | 'succeeded' | 'failed' | 'canceled'

type ContentState = {
  status: ContentStatus
  content: Content | null
  query: string | null
  error: string | null
}

type DemoState = {
  content: ContentState
}

type RequestObservation = {
  actionType: string
  condition: string
  aborted: string
  result: string
}

const initialContentState: ContentState = {
  status: 'idle',
  content: null,
  query: null,
  error: null,
}

/** 等待模拟请求完成，并在 AbortSignal 发出取消时拒绝等待。 */
function waitForResponse(delayMs: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(resolve, delayMs)

    signal.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timer)
        reject(new Error('payloadCreator 收到取消信号'))
      },
      { once: true },
    )
  })
}

/** 创建模拟内容请求的异步 Thunk。 */
const loadContent = createAsyncThunk<Content, ContentRequest>(
  'content/load',
  async ({ query, delayMs }, { signal }) => {
    await waitForResponse(delayMs, signal)
    return {
      query,
      title: `关于 ${query} 的课程内容`,
    }
  },
  {
    condition: ({ query }, { getState }) => {
      const state = getState() as DemoState
      return !(state.content.status === 'succeeded' && state.content.query === query)
    },
    dispatchConditionRejection: true,
  },
)

const contentSlice = createSlice({
  name: 'content',
  initialState: initialContentState,
  reducers: {
    resetContent: () => initialContentState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadContent.pending, (state) => {
        state.status = 'pending'
        state.error = null
      })
      .addCase(loadContent.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.content = action.payload
        state.query = action.payload.query
        state.error = null
      })
      .addCase(loadContent.rejected, (state, action) => {
        if (action.meta.condition) return

        state.status = action.meta.aborted ? 'canceled' : 'failed'
        state.error = action.meta.aborted
          ? '请求已取消，payloadCreator 不会再产生成功结果。'
          : (action.error.message ?? '内容请求失败')
      })
  },
})

const { resetContent } = contentSlice.actions

/** 为每个 Demo 实例创建独立的 Redux store。 */
function createDemoStore() {
  return configureStore({
    reducer: {
      content: contentSlice.reducer,
    },
  })
}

type DemoStore = ReturnType<typeof createDemoStore>
type RootState = ReturnType<DemoStore['getState']>
type AppDispatch = DemoStore['dispatch']

const useAppDispatch = useDispatch.withTypes<AppDispatch>()
const useAppSelector = useSelector.withTypes<RootState>()

/** 创建尚未产生最终 action 时的观察结果。 */
function createInitialObservation(): RequestObservation {
  return {
    actionType: '尚未产生最终 action',
    condition: '尚未判断',
    aborted: '尚未判断',
    result: '先加载内容，再尝试重复请求或取消长任务。',
  }
}

/** 展示 condition 条件跳过和运行中 abort 的可观察结果。 */
function AsyncCancelConditionPanel(): ReactElement {
  const dispatch = useAppDispatch()
  const contentState = useAppSelector((state) => state.content)
  const [observation, setObservation] = useState(createInitialObservation)
  const abortCurrent = useRef<(() => void) | null>(null)
  const isPending = contentState.status === 'pending'

  /** 派发一次内容请求，并记录最终 action 的取消元数据。 */
  async function runRequest(request: ContentRequest): Promise<void> {
    const dispatched = dispatch(loadContent(request))
    abortCurrent.current = dispatched.abort
    const finalAction = await dispatched

    if (abortCurrent.current === dispatched.abort) {
      abortCurrent.current = null
    }

    if (loadContent.fulfilled.match(finalAction)) {
      setObservation({
        actionType: finalAction.type,
        condition: 'false（请求继续执行）',
        aborted: 'false（请求正常完成）',
        result: `fulfilled：${finalAction.payload.title}`,
      })
      return
    }

    setObservation({
      actionType: finalAction.type,
      condition: finalAction.meta.condition ? 'true（条件跳过）' : 'false',
      aborted: finalAction.meta.aborted ? 'true（运行中被 abort）' : 'false',
      result: finalAction.meta.condition
        ? 'rejected action 已派发，但 payloadCreator 没有执行。'
        : finalAction.meta.aborted
          ? 'rejected：AbortError，后续成功结果不会写入。'
          : `rejected：${finalAction.error.message ?? '未知错误'}`,
    })
  }

  /** 派发可观察的短请求。 */
  function loadShortRequest(): void {
    void runRequest({ query: 'Redux Toolkit', delayMs: 180 })
  }

  /** 派发一个足够长、可以在完成前取消的请求。 */
  function loadLongRequest(): void {
    void runRequest({ query: '可取消异步任务', delayMs: 1600 })
  }

  /** 取消当前派发 Promise，并让 Thunk 的 signal 收到 abort。 */
  function abortRequest(): void {
    abortCurrent.current?.()
  }

  /** 恢复业务状态和本地观察结果。 */
  function resetDemo(): void {
    abortCurrent.current = null
    dispatch(resetContent())
    setObservation(createInitialObservation())
  }

  return (
    <section className="async-cancel-demo" data-testid="async-cancel-condition-demo">
      <header className="async-cancel-demo__heading">
        <p>Cancel before or during execution</p>
        <h2>异步取消与请求条件</h2>
        <span>condition 在执行前决定是否跳过，abort 取消正在运行的 Thunk。</span>
      </header>

      <section className="async-cancel-demo__status" aria-live="polite" aria-busy={isPending}>
        <span>当前请求状态</span>
        <strong data-testid="async-cancel-status">{contentState.status}</strong>
        <p data-testid="async-cancel-error">{contentState.error ?? '没有请求错误'}</p>
      </section>

      <div className="async-cancel-demo__controls">
        <button
          className="async-cancel-demo__primary"
          data-testid="async-cancel-load"
          type="button"
          disabled={isPending}
          onClick={loadShortRequest}
        >
          加载内容
        </button>
        <button
          data-testid="async-cancel-repeat"
          type="button"
          disabled={isPending || contentState.status !== 'succeeded'}
          onClick={loadShortRequest}
        >
          重复加载（条件跳过）
        </button>
        <button
          data-testid="async-cancel-long"
          type="button"
          disabled={isPending}
          onClick={loadLongRequest}
        >
          启动长任务
        </button>
        <button
          data-testid="async-cancel-abort"
          type="button"
          disabled={!isPending}
          onClick={abortRequest}
        >
          取消当前请求
        </button>
        <button
          data-testid="async-cancel-reset"
          type="button"
          disabled={isPending}
          onClick={resetDemo}
        >
          重置
        </button>
      </div>

      <section className="async-cancel-demo__content" aria-label="内容结果">
        <h3>业务数据</h3>
        <p data-testid="async-cancel-content">
          {contentState.content?.title ?? '成功结果会显示在这里'}
        </p>
      </section>

      <section className="async-cancel-demo__observation" aria-label="取消元数据观察">
        <h3>最终 action 元数据</h3>
        <dl>
          <div>
            <dt>action.type</dt>
            <dd data-testid="async-cancel-action-type">{observation.actionType}</dd>
          </div>
          <div>
            <dt>meta.condition</dt>
            <dd data-testid="async-cancel-condition">{observation.condition}</dd>
          </div>
          <div>
            <dt>meta.aborted</dt>
            <dd data-testid="async-cancel-aborted">{observation.aborted}</dd>
          </div>
          <div>
            <dt>结果</dt>
            <dd data-testid="async-cancel-result">{observation.result}</dd>
          </div>
        </dl>
      </section>
    </section>
  )
}

/** 为取消 Demo 提供可重复挂载的独立 Provider。 */
function AsyncCancelConditionDemoRoot(): ReactElement {
  const [store] = useState(createDemoStore)

  return (
    <Provider store={store}>
      <AsyncCancelConditionPanel />
    </Provider>
  )
}

/** 为 React Demo 宿主注册异步取消组件。 */
export function createAsyncCancelConditionDemo(): ComponentType {
  return AsyncCancelConditionDemoRoot
}
