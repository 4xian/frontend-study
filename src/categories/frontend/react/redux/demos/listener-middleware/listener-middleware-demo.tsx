import {
  configureStore,
  createAction,
  createListenerMiddleware,
  createSlice,
  type ListenerEffectAPI,
  type UnsubscribeListener,
} from '@reduxjs/toolkit'
import { useState, type ComponentType, type ReactElement } from 'react'
import type { UnknownAction } from 'redux'
import { Provider, useDispatch, useSelector } from 'react-redux'
import type { ThunkDispatch } from 'redux-thunk'

import './listener-middleware-demo.css'

type WaitStatus = 'idle' | 'waiting' | 'confirmed' | 'expired'

type DemoState = {
  count: number
  completedEffects: number
  waitStatus: WaitStatus
  events: string[]
  generation: number
}

type DemoRootState = {
  listenerDemo: DemoState
}

type DemoDispatch = ThunkDispatch<DemoRootState, unknown, UnknownAction>
type DemoListenerApi = ListenerEffectAPI<DemoRootState, DemoDispatch>

const initialDemoState: DemoState = {
  count: 0,
  completedEffects: 0,
  waitStatus: 'idle',
  events: [],
  generation: 0,
}

const increment = createAction('listenerDemo/increment')
const startWaiting = createAction('listenerDemo/startWaiting')
const confirmWaiting = createAction('listenerDemo/confirmWaiting')
const effectCompleted = createAction('listenerDemo/effectCompleted')
const waitConfirmed = createAction('listenerDemo/waitConfirmed')
const waitExpired = createAction('listenerDemo/waitExpired')
const eventAdded = createAction<string>('listenerDemo/eventAdded')

const demoSlice = createSlice({
  name: 'listenerDemo',
  initialState: initialDemoState,
  reducers: {
    reset: (state) => ({ ...initialDemoState, generation: state.generation + 1 }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(increment, (state) => {
        state.count += 1
      })
      .addCase(effectCompleted, (state) => {
        state.completedEffects += 1
      })
      .addCase(startWaiting, (state) => {
        state.waitStatus = 'waiting'
      })
      .addCase(waitConfirmed, (state) => {
        state.waitStatus = 'confirmed'
      })
      .addCase(waitExpired, (state) => {
        state.waitStatus = 'expired'
      })
      .addCase(eventAdded, (state, action) => {
        state.events.push(action.payload)
        if (state.events.length > 12) state.events.shift()
      })
  },
})

const { reset } = demoSlice.actions

/** 创建并登记一个可以被取消的计数监听器。 */
function createIncrementListener() {
  return {
    actionCreator: increment,
    effect: async (_action: ReturnType<typeof increment>, listenerApi: DemoListenerApi) => {
      const previousCount = listenerApi.getOriginalState().listenerDemo.count
      const currentCount = listenerApi.getState().listenerDemo.count

      listenerApi.dispatch(
        eventAdded(`actionCreator 命中：count ${previousCount} -> ${currentCount}`),
      )
      const generation = listenerApi.getState().listenerDemo.generation
      listenerApi.cancelActiveListeners()

      try {
        await listenerApi.delay(500)
        listenerApi.dispatch(effectCompleted())
        listenerApi.dispatch(eventAdded('delay 完成：当前监听器派发 effectCompleted'))
      } catch {
        if (listenerApi.getState().listenerDemo.generation === generation) {
          listenerApi.dispatch(eventAdded('delay 被 cancelActiveListeners 取消'))
        }
      }
    },
  }
}

/** 创建等待确认 action 的条件监听器。 */
function createWaitingListener() {
  return {
    actionCreator: startWaiting,
    effect: async (_action: ReturnType<typeof startWaiting>, listenerApi: DemoListenerApi) => {
      listenerApi.dispatch(eventAdded('startWaiting 命中：condition 等待 confirmWaiting'))
      const generation = listenerApi.getState().listenerDemo.generation

      try {
        const confirmed = await listenerApi.condition(confirmWaiting.match, 2400)
        if (confirmed) {
          listenerApi.dispatch(waitConfirmed())
          listenerApi.dispatch(eventAdded('condition 返回 true：收到 confirmWaiting'))
        } else {
          listenerApi.dispatch(waitExpired())
          listenerApi.dispatch(eventAdded('condition 返回 false：等待超时'))
        }
      } catch {
        if (listenerApi.getState().listenerDemo.generation === generation) {
          listenerApi.dispatch(eventAdded('condition 被取消：监听器已停止'))
        }
      }
    },
  }
}

/** 创建独立 store，并把 listener middleware 放在默认序列化检查之前。 */
function createDemoRuntime() {
  const listenerMiddleware = createListenerMiddleware<DemoRootState>()
  const incrementListener = createIncrementListener()
  const waitingListener = createWaitingListener()
  let unsubscribeIncrement: UnsubscribeListener | null = null
  let unsubscribeWaiting: UnsubscribeListener | null = null

  /** 订阅计数 listener，避免重复注册同一个 listener。 */
  function subscribeIncrement(): void {
    if (!unsubscribeIncrement) {
      unsubscribeIncrement = listenerMiddleware.startListening(incrementListener)
    }
  }

  /** 订阅等待 listener，避免重复注册同一个 listener。 */
  function subscribeWaiting(): void {
    if (!unsubscribeWaiting) {
      unsubscribeWaiting = listenerMiddleware.startListening(waitingListener)
    }
  }

  /** 移除指定 listener，并按需取消已经运行的 effect。 */
  function unsubscribeListener(
    getUnsubscribe: () => UnsubscribeListener | null,
    clearUnsubscribe: () => void,
    cancelActive: boolean,
  ): void {
    const unsubscribe = getUnsubscribe()
    if (unsubscribe) {
      unsubscribe(cancelActive ? { cancelActive: true } : undefined)
      clearUnsubscribe()
    }
  }

  /** 取消计数 listener 的订阅。 */
  function unsubscribeIncrementListener(cancelActive = false): void {
    unsubscribeListener(
      () => unsubscribeIncrement,
      () => {
        unsubscribeIncrement = null
      },
      cancelActive,
    )
  }

  /** 取消等待 listener 的订阅。 */
  function unsubscribeWaitingListener(cancelActive = false): void {
    unsubscribeListener(
      () => unsubscribeWaiting,
      () => {
        unsubscribeWaiting = null
      },
      cancelActive,
    )
  }

  subscribeIncrement()
  subscribeWaiting()

  const store = configureStore({
    reducer: {
      listenerDemo: demoSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(listenerMiddleware.middleware),
  })

  return {
    store,
    subscribeIncrement,
    subscribeWaiting,
    unsubscribeIncrementListener,
    unsubscribeWaitingListener,
    /** 返回计数 listener 当前是否已订阅。 */
    isIncrementListening(): boolean {
      return unsubscribeIncrement !== null
    },
    /** 取消活跃任务并恢复两个 listener 的订阅。 */
    resetListeners(): void {
      unsubscribeIncrementListener(true)
      unsubscribeWaitingListener(true)
      subscribeIncrement()
      subscribeWaiting()
    },
  }
}

type DemoRuntime = ReturnType<typeof createDemoRuntime>
type DemoStore = DemoRuntime['store']
type RootState = ReturnType<DemoStore['getState']>

const useAppDispatch = useDispatch.withTypes<DemoStore['dispatch']>()
const useAppSelector = useSelector.withTypes<RootState>()

/** 展示 actionCreator、condition、delay 和监听器取消/恢复。 */
function ListenerMiddlewarePanel({ runtime }: { runtime: DemoRuntime }): ReactElement {
  const dispatch = useAppDispatch()
  const state = useAppSelector((rootState) => rootState.listenerDemo)
  const [incrementListening, setIncrementListening] = useState(runtime.isIncrementListening)

  /** 派发 increment，观察 reducer 更新后 listener effect 读取的新旧 state。 */
  function dispatchIncrement(): void {
    dispatch(increment())
  }

  /** 启动使用 condition 等待 confirmWaiting 的监听任务。 */
  function dispatchStartWaiting(): void {
    dispatch(startWaiting())
  }

  /** 派发确认 action，让 condition 立即返回 true。 */
  function dispatchConfirmWaiting(): void {
    dispatch(confirmWaiting())
  }

  /** 取消当前计数监听器任务，同时保留监听器本身。 */
  function cancelIncrementEffect(): void {
    runtime.unsubscribeIncrementListener(true)
    runtime.subscribeIncrement()
    setIncrementListening(true)
    dispatch(eventAdded('手动取消当前计数 effect，并重新订阅监听器'))
  }

  /** 通过 startListening 返回的取消函数切换监听器订阅。 */
  function toggleIncrementListener(): void {
    if (runtime.isIncrementListening()) {
      runtime.unsubscribeIncrementListener(true)
      setIncrementListening(false)
      dispatch(eventAdded('increment listener 已 unsubscribe'))
      return
    }

    runtime.subscribeIncrement()
    setIncrementListening(true)
    dispatch(eventAdded('increment listener 已重新 subscribe'))
  }

  /** 取消运行中任务并恢复两个监听器与 Redux 状态。 */
  function resetDemo(): void {
    runtime.resetListeners()
    dispatch(reset())
    setIncrementListening(true)
  }

  return (
    <section className="listener-middleware-demo" data-testid="listener-middleware-demo">
      <header className="listener-middleware-demo__heading">
        <p>Action-driven async workflows</p>
        <h2>Listener Middleware</h2>
        <span>监听器在 reducer 更新后响应 action，并可等待、延迟、取消或重新订阅。</span>
      </header>

      <section className="listener-middleware-demo__status" aria-live="polite">
        <div>
          <span>计数</span>
          <strong data-testid="listener-count">{state.count}</strong>
        </div>
        <div>
          <span>完成的 effect</span>
          <strong data-testid="listener-completed-effects">{state.completedEffects}</strong>
        </div>
        <div>
          <span>等待状态</span>
          <strong data-testid="listener-wait-status">{state.waitStatus}</strong>
        </div>
      </section>

      <div className="listener-middleware-demo__controls">
        <button
          className="listener-middleware-demo__primary"
          data-testid="listener-increment"
          type="button"
          onClick={dispatchIncrement}
        >
          派发 increment
        </button>
        <button data-testid="listener-cancel-effect" type="button" onClick={cancelIncrementEffect}>
          取消计数 effect
        </button>
        <button data-testid="listener-toggle" type="button" onClick={toggleIncrementListener}>
          {incrementListening ? '停止 increment 监听' : '恢复 increment 监听'}
        </button>
        <button data-testid="listener-start-waiting" type="button" onClick={dispatchStartWaiting}>
          等待确认（2.4 秒）
        </button>
        <button
          data-testid="listener-confirm-waiting"
          type="button"
          disabled={state.waitStatus !== 'waiting'}
          onClick={dispatchConfirmWaiting}
        >
          派发 confirmWaiting
        </button>
        <button data-testid="listener-reset" type="button" onClick={resetDemo}>
          重置
        </button>
      </div>

      <p className="listener-middleware-demo__hint" aria-live="polite">
        increment listener：{incrementListening ? '已订阅' : '已停止'}；连续快速派发可观察旧 effect
        被取消。
      </p>

      <section className="listener-middleware-demo__events" aria-label="监听器事件记录">
        <h3>最近事件</h3>
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

/** 为 Listener Middleware 观察台提供独立 Provider 和 store。 */
function ListenerMiddlewareDemoRoot(): ReactElement {
  const [runtime] = useState<DemoRuntime>(createDemoRuntime)

  return (
    <Provider store={runtime.store}>
      <ListenerMiddlewarePanel runtime={runtime} />
    </Provider>
  )
}

/** 为 React Demo 宿主注册 Listener Middleware 观察台。 */
export function createListenerMiddlewareDemo(): ComponentType {
  return ListenerMiddlewareDemoRoot
}
