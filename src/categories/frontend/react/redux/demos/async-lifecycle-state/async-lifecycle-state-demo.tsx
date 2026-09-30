import { configureStore, createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { useState, type ComponentType, type ReactElement } from 'react'
import { Provider, useDispatch, useSelector } from 'react-redux'

import './async-lifecycle-state-demo.css'

type RequestStatus = 'idle' | 'pending' | 'succeeded' | 'failed'

type CourseSummary = {
  id: string
  title: string
  minutes: number
}

type CatalogState = {
  items: CourseSummary[]
  status: RequestStatus
  error: string | null
  history: RequestStatus[]
}

const statusDetails: Record<RequestStatus, { label: string; description: string }> = {
  idle: {
    label: 'idle',
    description: '尚未发起请求，可以开始加载。',
  },
  pending: {
    label: 'pending',
    description: '请求正在执行，重复操作暂时禁用。',
  },
  succeeded: {
    label: 'succeeded',
    description: '请求成功，界面可以读取最新业务数据。',
  },
  failed: {
    label: 'failed',
    description: '请求失败，保留已有数据并显示错误。',
  },
}

/** 创建互不共享数组引用的初始目录状态。 */
function createInitialCatalogState(): CatalogState {
  return {
    items: [],
    status: 'idle',
    error: null,
    history: ['idle'],
  }
}

/** 模拟课程目录服务，并根据参数返回数据或抛出普通错误。 */
async function requestCourseCatalog(shouldFail: boolean): Promise<CourseSummary[]> {
  await Promise.resolve()

  if (shouldFail) {
    throw new Error('课程目录暂时不可用')
  }

  return [
    { id: 'redux-state', title: 'Redux 状态建模', minutes: 42 },
    { id: 'async-lifecycle', title: '异步生命周期状态', minutes: 55 },
  ]
}

const loadCourseCatalog = createAsyncThunk('courseCatalog/load', async (shouldFail: boolean) =>
  requestCourseCatalog(shouldFail),
)

const catalogSlice = createSlice({
  name: 'courseCatalog',
  initialState: createInitialCatalogState(),
  reducers: {
    resetCatalogState: createInitialCatalogState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadCourseCatalog.pending, (state) => {
        state.status = 'pending'
        state.error = null
        state.history.push('pending')
      })
      .addCase(loadCourseCatalog.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
        state.error = null
        state.history.push('succeeded')
      })
      .addCase(loadCourseCatalog.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? '未知请求错误'
        state.history.push('failed')
      })
  },
})

const { resetCatalogState } = catalogSlice.actions

/** 为每个 Demo 实例创建独立的 Redux store。 */
function createDemoStore() {
  return configureStore({
    reducer: {
      courseCatalog: catalogSlice.reducer,
    },
  })
}

type DemoStore = ReturnType<typeof createDemoStore>
type RootState = ReturnType<DemoStore['getState']>
type AppDispatch = DemoStore['dispatch']

const useAppDispatch = useDispatch.withTypes<AppDispatch>()
const useAppSelector = useSelector.withTypes<RootState>()

/** 展示异步 action 如何驱动请求状态、数据和错误字段。 */
function AsyncLifecycleStatePanel(): ReactElement {
  const dispatch = useAppDispatch()
  const catalog = useAppSelector((state) => state.courseCatalog)
  const isPending = catalog.status === 'pending'
  const currentStatus = statusDetails[catalog.status]

  /** 派发一次成功或失败请求，并等待生命周期状态完成转换。 */
  async function runRequest(shouldFail: boolean): Promise<void> {
    await dispatch(loadCourseCatalog(shouldFail))
  }

  /** 把业务数据、错误和状态历史一并恢复到 idle。 */
  function resetDemo(): void {
    dispatch(resetCatalogState())
  }

  return (
    <section className="async-lifecycle-demo" data-testid="async-lifecycle-state-demo">
      <header className="async-lifecycle-demo__heading">
        <p>Redux request state</p>
        <h2>异步生命周期状态台</h2>
        <span>同一个请求用一组互斥状态表达开始、成功和失败。</span>
      </header>

      <section
        className={`async-lifecycle-demo__status is-${catalog.status}`}
        aria-live="polite"
        aria-busy={isPending}
      >
        <span>当前状态</span>
        <strong data-testid="async-lifecycle-status">{currentStatus.label}</strong>
        <p>{currentStatus.description}</p>
      </section>

      <div className="async-lifecycle-demo__controls">
        <button
          className="async-lifecycle-demo__primary"
          data-testid="async-lifecycle-success"
          type="button"
          disabled={isPending}
          onClick={() => void runRequest(false)}
        >
          加载成功结果
        </button>
        <button
          data-testid="async-lifecycle-failure"
          type="button"
          disabled={isPending}
          onClick={() => void runRequest(true)}
        >
          加载失败结果
        </button>
        <button
          data-testid="async-lifecycle-reset"
          type="button"
          disabled={isPending}
          onClick={resetDemo}
        >
          恢复 idle
        </button>
      </div>

      <section className="async-lifecycle-demo__data" aria-label="课程目录数据">
        <div className="async-lifecycle-demo__section-heading">
          <h3>业务数据</h3>
          <span>{catalog.items.length > 0 ? '保留最近成功结果' : '暂无成功结果'}</span>
        </div>
        {catalog.items.length > 0 ? (
          <ul data-testid="async-lifecycle-items">
            {catalog.items.map((course) => (
              <li key={course.id}>
                <strong>{course.title}</strong>
                <span>{course.minutes} 分钟</span>
              </li>
            ))}
          </ul>
        ) : (
          <p data-testid="async-lifecycle-empty">成功后会在这里显示课程。</p>
        )}
      </section>

      <section className="async-lifecycle-demo__error" aria-label="请求错误">
        <h3>错误字段</h3>
        <p data-testid="async-lifecycle-error">{catalog.error ?? '没有错误'}</p>
      </section>

      <section className="async-lifecycle-demo__history" aria-label="状态转换记录">
        <h3>状态转换</h3>
        <ol data-testid="async-lifecycle-history">
          {catalog.history.map((status, index) => (
            <li key={`${status}-${index}`}>
              <span>{index + 1}</span>
              <code>{status}</code>
            </li>
          ))}
        </ol>
        <small>该记录只用于教学观察；业务 slice 通常只保存当前请求事实。</small>
      </section>
    </section>
  )
}

/** 为生命周期 Demo 提供可重复挂载的独立 Provider。 */
function AsyncLifecycleStateDemoRoot(): ReactElement {
  const [store] = useState(createDemoStore)

  return (
    <Provider store={store}>
      <AsyncLifecycleStatePanel />
    </Provider>
  )
}

/** 为 React Demo 宿主注册异步生命周期状态组件。 */
export function createAsyncLifecycleStateDemo(): ComponentType {
  return AsyncLifecycleStateDemoRoot
}
