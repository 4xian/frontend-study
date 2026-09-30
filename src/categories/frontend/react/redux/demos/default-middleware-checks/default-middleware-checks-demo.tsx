import { configureStore, createAction, createSlice } from '@reduxjs/toolkit'
import { useState, type ComponentType, type ReactElement } from 'react'
import { Provider, useDispatch, useSelector } from 'react-redux'

import './default-middleware-checks-demo.css'

type CounterState = {
  value: number
  lastDate: Date | null
}

const initialCounterState: CounterState = {
  value: 0,
  lastDate: null,
}

const increment = createAction('demo/increment')
const resetCounter = createAction('demo/reset')
const setDate = createAction<Date>('demo/set-date')
const mutateState = createAction('demo/mutate-state')

const counterSlice = createSlice({
  name: 'counter',
  initialState: initialCounterState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(increment, (state) => {
        state.value += 1
      })
      .addCase(resetCounter, () => initialCounterState)
      .addCase(setDate, (state, action) => {
        state.lastDate = action.payload
      })
  },
})

type MutationState = {
  value: number
}

/** 构造一个故意直接修改 state 的普通 reducer，用于观察 immutable 检查。 */
function mutationReducer(state: MutationState = { value: 0 }, action: unknown): MutationState {
  if (
    typeof action === 'object' &&
    action !== null &&
    'type' in action &&
    action.type === mutateState.type
  ) {
    state.value += 1
  }
  return state
}

/** 为 Demo 创建保留 RTK 默认 middleware 的隔离 store。 */
function createDemoStore({
  actionCreatorCheck = true,
  immutableCheck = true,
  serializableCheck = true,
}: {
  actionCreatorCheck?: boolean
  immutableCheck?: boolean
  serializableCheck?: boolean
} = {}) {
  return configureStore({
    reducer: {
      counter: counterSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ actionCreatorCheck, immutableCheck, serializableCheck }),
  })
}

type DemoStore = ReturnType<typeof createDemoStore>
type RootState = ReturnType<DemoStore['getState']>
type DiagnosticCapture = {
  diagnostics: string[]
  errorMessage: string | null
}

/** 捕获同步开发诊断并恢复宿主 console，避免错误演示污染页面。 */
function captureDiagnostics(run: () => unknown): DiagnosticCapture {
  const diagnostics: string[] = []
  const originalWarn = console.warn
  const originalError = console.error
  const collect = (...args: unknown[]): void => {
    diagnostics.push(args.map((value) => String(value)).join(' '))
  }

  console.warn = collect
  console.error = collect
  try {
    run()
    return { diagnostics, errorMessage: null }
  } catch (error) {
    return {
      diagnostics,
      errorMessage: error instanceof Error ? error.message : String(error),
    }
  } finally {
    console.warn = originalWarn
    console.error = originalError
  }
}

type CheckReport = {
  title: string
  status: string
  detail: string
}

/** 把真实 middleware 反馈整理成短文本，方便在 Demo 中比较配置结果。 */
function createReport(title: string, capture: DiagnosticCapture): CheckReport {
  if (capture.errorMessage) {
    return {
      title,
      status: '捕获错误',
      detail: capture.errorMessage.replace(/\s+/g, ' ').slice(0, 180),
    }
  }
  if (capture.diagnostics.length > 0) {
    return {
      title,
      status: '产生 ' + capture.diagnostics.length + ' 条诊断',
      detail: (capture.diagnostics[0] ?? '检测到开发诊断').replace(/\s+/g, ' ').slice(0, 180),
    }
  }
  return {
    title,
    status: '未产生诊断',
    detail: '当前配置没有记录 console 诊断。',
  }
}

/** 运行 action creator 误派场景，并记录默认检查的同步反馈。 */
function checkActionCreator(actionCreatorCheck: boolean = true): CheckReport {
  const store = createDemoStore({ actionCreatorCheck })
  const mistakenAction = increment as unknown as { type: string }
  const capture = captureDiagnostics(() => store.dispatch(mistakenAction))
  const title = actionCreatorCheck
    ? '误派 action creator（检查开启）'
    : '误派 action creator（检查关闭）'
  return createReport(title, capture)
}

/** 运行普通 reducer 直接修改 state 的场景，并记录 immutable 检查错误。 */
function checkImmutability(immutableCheck: boolean = true): CheckReport {
  const store = configureStore({
    reducer: mutationReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ immutableCheck }),
  })
  const capture = captureDiagnostics(() => store.dispatch(mutateState()))
  const title = immutableCheck
    ? 'Reducer 直接变更 state（检查开启）'
    : 'Reducer 直接变更 state（检查关闭）'
  return createReport(title, capture)
}

/** 对比 serializableCheck 开启和关闭时派发 Date 的结果。 */
function checkSerializable(serializableCheck: boolean): CheckReport {
  const store = createDemoStore({ serializableCheck })
  const capture = captureDiagnostics(() =>
    store.dispatch(setDate(new Date('2025-01-01T00:00:00.000Z'))),
  )
  const title = serializableCheck
    ? 'Date（serializableCheck 开启）'
    : 'Date（serializableCheck 关闭）'
  return createReport(title, capture)
}

const useAppDispatch = useDispatch.withTypes<DemoStore['dispatch']>()
const useAppSelector = useSelector.withTypes<RootState>()

/** 展示默认 middleware 检查、选项配置与诊断差异。 */
function DefaultMiddlewarePanel(): ReactElement {
  const dispatch = useAppDispatch()
  const value = useAppSelector((state) => state.counter.value)
  const [reports, setReports] = useState<CheckReport[]>([])

  /** 追加一条检查报告并限制列表长度。 */
  function addReport(report: CheckReport): void {
    setReports((current) => [report, ...current].slice(0, 8))
  }

  /** 派发合法 action，确认默认链仍能完成 reducer 更新。 */
  function dispatchValidAction(): void {
    dispatch(increment())
    addReport({
      title: '正常 action',
      status: '通过',
      detail: 'counter.value 由 reducer 更新，未产生默认检查诊断。',
    })
  }

  /** 对比 actionCreatorCheck 开启和关闭时的误派反馈。 */
  function dispatchActionCreator(actionCreatorCheck: boolean): void {
    addReport(checkActionCreator(actionCreatorCheck))
  }

  /** 对比 immutableCheck 开启和关闭时的直接变更反馈。 */
  function dispatchMutation(immutableCheck: boolean): void {
    addReport(checkImmutability(immutableCheck))
  }

  /** 运行 serializable 检查开启的对照。 */
  function dispatchSerializableCheck(): void {
    addReport(checkSerializable(true))
  }

  /** 运行 serializable 检查关闭的对照。 */
  function dispatchSerializableDisabled(): void {
    addReport(checkSerializable(false))
  }

  /** 恢复 Demo store 的业务状态并清空诊断报告。 */
  function resetDemo(): void {
    dispatch(resetCounter())
    setReports([])
  }

  return (
    <section
      className="default-middleware-checks-demo"
      data-testid="default-middleware-checks-demo"
    >
      <header className="default-middleware-checks-demo__heading">
        <p>Default middleware inspector</p>
        <h2>默认 Middleware 检查</h2>
        <span>保留默认链，再观察每类开发期检查如何反馈。</span>
      </header>

      <section className="default-middleware-checks-demo__status" aria-live="polite">
        <span>正常 reducer 状态</span>
        <strong data-testid="default-middleware-value">{value}</strong>
        <p>开发默认链：action creator、immutable、thunk、serializable。</p>
      </section>

      <div className="default-middleware-checks-demo__controls">
        <button data-testid="default-middleware-valid" type="button" onClick={dispatchValidAction}>
          派发正常 action
        </button>
        <button
          data-testid="default-middleware-action-creator"
          type="button"
          onClick={() => dispatchActionCreator(true)}
        >
          误派 action creator：检查开启
        </button>
        <button
          data-testid="default-middleware-action-creator-off"
          type="button"
          onClick={() => dispatchActionCreator(false)}
        >
          误派 action creator：关闭检查
        </button>
        <button
          data-testid="default-middleware-immutable"
          type="button"
          onClick={() => dispatchMutation(true)}
        >
          直接变更 state：检查开启
        </button>
        <button
          data-testid="default-middleware-immutable-off"
          type="button"
          onClick={() => dispatchMutation(false)}
        >
          直接变更 state：关闭检查
        </button>
        <button
          data-testid="default-middleware-serializable-on"
          type="button"
          onClick={dispatchSerializableCheck}
        >
          Date：检查开启
        </button>
        <button
          data-testid="default-middleware-serializable-off"
          type="button"
          onClick={dispatchSerializableDisabled}
        >
          Date：关闭检查
        </button>
        <button
          className="default-middleware-checks-demo__primary"
          data-testid="default-middleware-reset"
          type="button"
          onClick={resetDemo}
        >
          重置
        </button>
      </div>

      <section
        className="default-middleware-checks-demo__reports"
        aria-label="默认 middleware 检查报告"
      >
        <h3>检查报告</h3>
        {reports.length > 0 ? (
          <ol>
            {reports.map((report, index) => (
              <li key={report.title + index}>
                <strong>{report.title}</strong>
                <span>{report.status}</span>
                <p>{report.detail}</p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="default-middleware-checks-demo__empty">尚未运行检查。</p>
        )}
      </section>
    </section>
  )
}

/** 为默认 middleware 观察台提供独立 Provider 和 store。 */
function DefaultMiddlewareDemoRoot(): ReactElement {
  const [store] = useState<DemoStore>(createDemoStore)

  return (
    <Provider store={store}>
      <DefaultMiddlewarePanel />
    </Provider>
  )
}

/** 为 React Demo 宿主注册默认 Middleware 检查观察台。 */
export function createDefaultMiddlewareChecksDemo(): ComponentType {
  return DefaultMiddlewareDemoRoot
}
