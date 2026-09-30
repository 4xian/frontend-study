import { configureStore, createAction, createSlice, Tuple, type Middleware } from '@reduxjs/toolkit'
import { useState, type ComponentType, type ReactElement } from 'react'
import { Provider, useDispatch, useSelector } from 'react-redux'

import './middleware-chain-demo.css'

type TypedAction = {
  type: string
}

type DemoState = {
  handledCount: number
  auditCount: number
  lastReducerAction: string
}

const initialDemoState: DemoState = {
  handledCount: 0,
  auditCount: 0,
  lastReducerAction: '尚未收到 action',
}

const acceptedAction = createAction('demo/accepted')
const dispatchInsideAction = createAction('demo/dispatch-inside')
const blockedAction = createAction('demo/blocked')
const auditAction = createAction('demo/audit')

/** 判断未知 middleware action 是否带有可读取的字符串 type。 */
function isTypedAction(action: unknown): action is TypedAction {
  return (
    typeof action === 'object' &&
    action !== null &&
    'type' in action &&
    typeof action.type === 'string'
  )
}

/** 从未知 action 或 middleware 返回值中提取可读类型。 */
function getActionType(value: unknown): string {
  return isTypedAction(value) ? value.type : typeof value
}

/** 追加有限长度的 middleware 观察记录。 */
function appendTrace(trace: string[], message: string): void {
  trace.push(message)
  if (trace.length > 18) {
    trace.shift()
  }
}

const demoSlice = createSlice({
  name: 'middlewareDemo',
  initialState: initialDemoState,
  reducers: {
    reset: () => initialDemoState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(acceptedAction, (state) => {
        state.handledCount += 1
        state.lastReducerAction = acceptedAction.type
      })
      .addCase(dispatchInsideAction, (state) => {
        state.handledCount += 1
        state.lastReducerAction = dispatchInsideAction.type
      })
      .addCase(auditAction, (state) => {
        state.auditCount += 1
        state.lastReducerAction = auditAction.type
      })
  },
})

const { reset } = demoSlice.actions

/** 创建记录 middleware 进入与离开顺序的观察层。 */
function createTraceMiddleware(trace: string[], label: string): Middleware {
  return () => (next) => (action) => {
    const type = getActionType(action)
    appendTrace(trace, `${label} 进入 ${type}`)
    const result = next(action)
    appendTrace(trace, `${label} 离开 ${type}`)
    return result
  }
}

/** 创建在当前 action 外重新派发审计 action 的 middleware。 */
function createDispatchInsideMiddleware(trace: string[]): Middleware {
  return ({ dispatch }) =>
    (next) =>
    (action) => {
      if (isTypedAction(action) && action.type === dispatchInsideAction.type) {
        appendTrace(trace, 'dispatch-inside 使用 dispatch 派发 demo/audit')
        dispatch(auditAction())
      }
      return next(action)
    }
}

/** 创建只拦截指定 action 并返回短路结果的 middleware。 */
function createBlockMiddleware(trace: string[]): Middleware {
  return () => (next) => (action) => {
    if (isTypedAction(action) && action.type === blockedAction.type) {
      appendTrace(trace, 'blocker 短路 demo/blocked（未调用 next）')
      return { type: 'middleware/blocked' }
    }
    return next(action)
  }
}

/** 创建带有四层自定义 middleware 的独立 Demo store。 */
function createDemoStore() {
  const trace: string[] = []
  const outer = createTraceMiddleware(trace, 'outer')
  const dispatchInside = createDispatchInsideMiddleware(trace)
  const blocker = createBlockMiddleware(trace)
  const inner = createTraceMiddleware(trace, 'inner')

  const store = configureStore({
    reducer: {
      demo: demoSlice.reducer,
    },
    middleware: () => new Tuple(outer, dispatchInside, blocker, inner),
  })

  return { store, trace }
}

type DemoRuntime = ReturnType<typeof createDemoStore>
type DemoStore = DemoRuntime['store']
type RootState = ReturnType<DemoStore['getState']>

const useAppDispatch = useDispatch.withTypes<DemoStore['dispatch']>()
const useAppSelector = useSelector.withTypes<RootState>()

/** 展示 middleware 进入、转发、短路和返回值的关系。 */
function MiddlewareChainPanel({ runtime }: { runtime: DemoRuntime }): ReactElement {
  const dispatch = useAppDispatch()
  const state = useAppSelector(() => runtime.store.getState().demo)
  const [, setVersion] = useState(0)
  const [lastReturn, setLastReturn] = useState('尚未派发 action')

  /** 派发会到达 Reducer 的普通 action。 */
  function dispatchAccepted(): void {
    const result = dispatch(acceptedAction())
    setLastReturn(getActionType(result))
    setVersion((value) => value + 1)
  }

  /** 派发会在 middleware 中重新进入链首的 action。 */
  function dispatchNested(): void {
    const result = dispatch(dispatchInsideAction())
    setLastReturn(getActionType(result))
    setVersion((value) => value + 1)
  }

  /** 派发会被 blocker middleware 短路的 action。 */
  function dispatchBlocked(): void {
    const result = dispatch(blockedAction())
    setLastReturn(getActionType(result))
    setVersion((value) => value + 1)
  }

  /** 恢复初始状态并清空当前观察记录。 */
  function resetDemo(): void {
    dispatch(reset())
    runtime.trace.length = 0
    setLastReturn('尚未派发 action')
    setVersion((value) => value + 1)
  }

  return (
    <section className="middleware-chain-demo" data-testid="middleware-chain-demo">
      <header className="middleware-chain-demo__heading">
        <p>Dispatch pipeline observer</p>
        <h2>Middleware 执行链</h2>
        <span>用 next 继续当前 action，用 dispatch 让新 action 从链首重新开始。</span>
      </header>

      <section className="middleware-chain-demo__status" aria-live="polite">
        <span>Reducer 状态</span>
        <strong>{state.lastReducerAction}</strong>
        <p>dispatch 返回值：{lastReturn}</p>
      </section>

      <div className="middleware-chain-demo__controls">
        <button data-testid="middleware-chain-accepted" type="button" onClick={dispatchAccepted}>
          派发普通 action
        </button>
        <button data-testid="middleware-chain-nested" type="button" onClick={dispatchNested}>
          middleware 内部 dispatch
        </button>
        <button data-testid="middleware-chain-blocked" type="button" onClick={dispatchBlocked}>
          短路 action
        </button>
        <button
          className="middleware-chain-demo__primary"
          data-testid="middleware-chain-reset"
          type="button"
          onClick={resetDemo}
        >
          重置
        </button>
      </div>

      <section className="middleware-chain-demo__counters" aria-label="Reducer 计数">
        <div>
          <span>Reducer 已处理</span>
          <strong data-testid="middleware-chain-handled-count">{state.handledCount}</strong>
        </div>
        <div>
          <span>审计 action</span>
          <strong data-testid="middleware-chain-audit-count">{state.auditCount}</strong>
        </div>
      </section>

      <section className="middleware-chain-demo__trace" aria-label="Middleware 事件顺序">
        <h3>最近执行顺序</h3>
        <ol>
          {runtime.trace.length > 0 ? (
            runtime.trace.map((event, index) => <li key={`${event}-${index}`}>{event}</li>)
          ) : (
            <li>尚未记录 middleware 事件</li>
          )}
        </ol>
      </section>
    </section>
  )
}

/** 为 middleware 观察台提供独立 Provider 和 store。 */
function MiddlewareChainDemoRoot(): ReactElement {
  const [runtime] = useState<DemoRuntime>(createDemoStore)

  return (
    <Provider store={runtime.store}>
      <MiddlewareChainPanel runtime={runtime} />
    </Provider>
  )
}

/** 为 React Demo 宿主注册 Middleware 执行链观察台。 */
export function createMiddlewareChainDemo(): ComponentType {
  return MiddlewareChainDemoRoot
}
